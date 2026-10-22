'use client';

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
} from 'react';
import { useMapData } from './useMapData';
import type {
  PixelMapProps,
  PixelMapAnchorProps,
  PixelMapContextValue,
} from './types';
import { cn } from '../../shared/utils';

// Contexto para compartir metadatos y estado activo con componentes hijos (como PixelMapAnchor)
const PixelMapContext = createContext<PixelMapContextValue | null>(null);

export function usePixelMapContext(): PixelMapContextValue {
  const ctx = useContext(PixelMapContext);
  if (!ctx) {
    throw new Error('usePixelMapContext debe usarse dentro de un <PixelMap>');
  }
  return ctx;
}

/**
 * PixelMapAnchor: Posiciona automáticamente cualquier elemento (dalia, medalla, tooltip)
 * sobre las coordenadas ancla exactas del estado federativo indicado.
 */
export function PixelMapAnchor({
  stateId,
  className,
  children,
}: PixelMapAnchorProps) {
  const { data } = usePixelMapContext();
  if (!data) return null;

  const state = data.stateById.get(stateId);
  if (!state) return null;

  const leftPercent = (state.anchor.x / data.width) * 100;
  const topPercent = (state.anchor.y / data.height) * 100;

  return (
    <div
      data-state-id={stateId}
      className={cn(
        'absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20 transition-transform duration-200',
        className
      )}
      style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
    >
      {children}
    </div>
  );
}

// Conjunto de numIds de estados con superficie reducida para asistencia táctil
const SMALL_STATE_NUM_IDS = new Set<number>([
  1,  // Aguascalientes
  6,  // Colima
  9,  // Ciudad de México
  17, // Morelos
  29, // Tlaxcala
]);

// Colores little-endian Uint32 para renderizado de alto rendimiento en Canvas ImageData
// Selected: Tono magenta / dalia brillante (top) y 50% atenuado (lateral)
const SELECT_TOP_COLOR = (((190 << 24) | (134 << 16) | (63 << 8) | 244) >>> 0); // #F43F86 ~75% alfa
const SELECT_SIDE_COLOR = (((95 << 24) | (134 << 16) | (63 << 8) | 244) >>> 0); // #F43F86 ~37% alfa

// Hover: Tono lavanda / lila luminoso (top) y 50% atenuado (lateral)
const HOVER_TOP_COLOR = (((180 << 24) | (249 << 16) | (190 << 8) | 196) >>> 0); // #C4BEF9 ~70% alfa
const HOVER_SIDE_COLOR = (((90 << 24) | (249 << 16) | (190 << 8) | 196) >>> 0); // #C4BEF9 ~35% alfa

/**
 * Resuelve qué estado federativo corresponde a las coordenadas lógicas (lx, ly)
 * en O(1) consultando directamente el buffer binario mapIds.
 */
function resolveStateAt(
  lx: number,
  ly: number,
  mapIds: Uint8Array,
  width: number,
  height: number,
  isTouch: boolean
): string | null {
  if (lx < 0 || lx >= width || ly < 0 || ly >= height) return null;
  let code = mapIds[ly * width + lx];

  // Asistencia táctil: si se pulsó agua o isla decorativa, buscar en radio de 2 vóxeles
  if (code === 0 && isTouch) {
    let closestCode = 0;
    let closestDistSq = Infinity;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = lx + dx;
        const ny = ly + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const c = mapIds[ny * width + nx];
          if (c !== 0) {
            const rawId = c > 32 ? c - 32 : c;
            const distSq = dx * dx + dy * dy;
            const isSmall = SMALL_STATE_NUM_IDS.has(rawId);
            const effectiveDist = isSmall ? distSq * 0.5 : distSq;
            if (effectiveDist < closestDistSq) {
              closestDistSq = effectiveDist;
              closestCode = c;
            }
          }
        }
      }
    }
    code = closestCode;
  } else if (code !== 0 && isTouch) {
    // Si se pulsó en un estado limítrofe a 1px de un estado pequeño, priorizar el pequeño
    const currentNum = code > 32 ? code - 32 : code;
    if (!SMALL_STATE_NUM_IDS.has(currentNum)) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = lx + dx;
          const ny = ly + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const c = mapIds[ny * width + nx];
            const rawId = c > 32 ? c - 32 : c;
            if (SMALL_STATE_NUM_IDS.has(rawId)) {
              code = c;
              break;
            }
          }
        }
        if (SMALL_STATE_NUM_IDS.has(code > 32 ? code - 32 : code)) break;
      }
    }
  }

  if (code === 0) return null;

  // Códigos 1..32: cara superior; Códigos 33..64: pared extruida (code - 32)
  const numId = code > 32 ? code - 32 : code;
  if (numId >= 1 && numId <= 32) {
    return String(numId).padStart(2, '0');
  }
  return null;
}

/**
 * PixelMap: Componente interactivo multicapa para el mapa isométrico pixel art de México (Hito H2).
 */
export function PixelMap({
  selectedStateId = null,
  hoveredStateId: controlledHoveredId,
  onSelectState,
  onHoverState,
  showTooltip = true,
  className,
  children,
}: PixelMapProps) {
  const { data, loading, error } = useMapData();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Buffer persistente para renderizado de alta velocidad sin recolección de basura
  const bufferRef = useRef<{
    imgData: ImageData;
    u32: Uint32Array;
    prevDrawnIndices: number[];
  } | null>(null);

  // Estado local para hover cuando el componente no está completamente controlado
  const [internalHoveredId, setInternalHoveredId] = useState<string | null>(null);
  const currentHoveredId = controlledHoveredId !== undefined ? controlledHoveredId : internalHoveredId;

  const width = data?.width ?? 660;
  const height = data?.height ?? 435;
  const aspectRatio = `${width} / ${height}`;

  // Estado activo prioritario (hover tiene prioridad inmediata visual; si no hay hover, muestra el seleccionado)
  const activeStateId = currentHoveredId || selectedStateId;
  const activeState = (data && activeStateId) ? data.stateById.get(activeStateId) : null;

  // Renderizado volumétrico reactivo en el Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    // Inicializar o redimensionar buffer persistente si es necesario
    if (
      !bufferRef.current ||
      bufferRef.current.imgData.width !== width ||
      bufferRef.current.imgData.height !== height
    ) {
      const imgData = ctx.createImageData(width, height);
      bufferRef.current = {
        imgData,
        u32: new Uint32Array(imgData.data.buffer),
        prevDrawnIndices: [],
      };
    }

    const { imgData, u32, prevDrawnIndices } = bufferRef.current;

    // Variables para delimitar la región sucia (dirty rectangle)
    let minDirtyX = width;
    let minDirtyY = height;
    let maxDirtyX = -1;
    let maxDirtyY = -1;

    // 1. Limpiar píxeles previamente dibujados
    for (let i = 0; i < prevDrawnIndices.length; i++) {
      const idx = prevDrawnIndices[i];
      u32[idx] = 0;
      const x = idx % width;
      const y = Math.floor(idx / width);
      if (x < minDirtyX) minDirtyX = x;
      if (x > maxDirtyX) maxDirtyX = x;
      if (y < minDirtyY) minDirtyY = y;
      if (y > maxDirtyY) maxDirtyY = y;
    }
    prevDrawnIndices.length = 0;

    // 2. Función interna para pintar un estado
    const paintState = (stateId: string, topColor: number, sideColor: number) => {
      const state = data.stateById.get(stateId);
      if (!state) return;
      const pixelIndex = data.pixelsByNumId.get(state.numId);
      if (!pixelIndex) return;

      const [bboxMinX, bboxMinY, bboxMaxX, bboxMaxY] = state.bbox;
      if (bboxMinX < minDirtyX) minDirtyX = bboxMinX;
      if (bboxMaxX > maxDirtyX) maxDirtyX = bboxMaxX;
      if (bboxMinY < minDirtyY) minDirtyY = bboxMinY;
      if (bboxMaxY > maxDirtyY) maxDirtyY = bboxMaxY;

      const top = pixelIndex.topPixels;
      for (let i = 0; i < top.length; i++) {
        const idx = top[i];
        u32[idx] = topColor;
        prevDrawnIndices.push(idx);
      }

      const side = pixelIndex.sidePixels;
      for (let i = 0; i < side.length; i++) {
        const idx = side[i];
        u32[idx] = sideColor;
        prevDrawnIndices.push(idx);
      }
    };

    // Pintar estado seleccionado
    if (selectedStateId) {
      paintState(selectedStateId, SELECT_TOP_COLOR, SELECT_SIDE_COLOR);
    }

    // Pintar estado en hover (si no es el mismo que está seleccionado)
    if (currentHoveredId && currentHoveredId !== selectedStateId) {
      paintState(currentHoveredId, HOVER_TOP_COLOR, HOVER_SIDE_COLOR);
    }

    // 3. Volcar al canvas únicamente la región modificada para máximo rendimiento
    if (minDirtyX <= maxDirtyX && minDirtyY <= maxDirtyY) {
      const dirtyW = maxDirtyX - minDirtyX + 1;
      const dirtyH = maxDirtyY - minDirtyY + 1;
      ctx.putImageData(imgData, 0, 0, minDirtyX, minDirtyY, dirtyW, dirtyH);
    } else if (prevDrawnIndices.length === 0) {
      ctx.clearRect(0, 0, width, height);
    }
  }, [data, selectedStateId, currentHoveredId, width, height]);

  // Conversión precisa de coordenadas de pantalla a la rejilla lógica de vóxeles
  const getLogicalCoords = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;

      const scaleX = width / rect.width;
      const scaleY = height / rect.height;

      const lx = Math.floor((e.clientX - rect.left) * scaleX);
      const ly = Math.floor((e.clientY - rect.top) * scaleY);

      if (lx < 0 || lx >= width || ly < 0 || ly >= height) return null;
      return { lx, ly };
    },
    [width, height]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!data) return;
      const coords = getLogicalCoords(e);
      const isTouch = e.pointerType === 'touch';
      const resolved = coords
        ? resolveStateAt(coords.lx, coords.ly, data.mapIds, width, height, isTouch)
        : null;

      if (resolved !== currentHoveredId) {
        setInternalHoveredId(resolved);
        onHoverState?.(resolved);
      }
    },
    [data, width, height, currentHoveredId, getLogicalCoords, onHoverState]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!data) return;
      const coords = getLogicalCoords(e);
      const isTouch = e.pointerType === 'touch';
      const resolved = coords
        ? resolveStateAt(coords.lx, coords.ly, data.mapIds, width, height, isTouch)
        : null;

      if (resolved) {
        const nextSelected = resolved === selectedStateId ? null : resolved;
        onSelectState?.(nextSelected);
      }
    },
    [data, width, height, selectedStateId, getLogicalCoords, onSelectState]
  );

  const handlePointerLeave = useCallback(() => {
    if (currentHoveredId !== null) {
      setInternalHoveredId(null);
      onHoverState?.(null);
    }
  }, [currentHoveredId, onHoverState]);

  const selectState = useCallback(
    (stateId: string | null) => {
      onSelectState?.(stateId);
    },
    [onSelectState]
  );

  const contextValue: PixelMapContextValue = {
    data,
    selectedStateId,
    hoveredStateId: currentHoveredId,
    selectState,
  };

  return (
    <PixelMapContext.Provider value={contextValue}>
      <div
        role="region"
        aria-label="Mapa isométrico interactivo de México"
        className={cn(
          'relative w-full max-w-5xl mx-auto select-none overflow-hidden rounded-xl bg-[#EEEDEA]/50 border border-stone-200/60 shadow-inner group',
          className
        )}
        style={{ aspectRatio }}
      >
        {/* Capa 1: Sombra de contacto suave sobre el fondo */}
        <img
          src="/data/map-shadow.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          loading="eager"
        />

        {/* Capa 2: Mapa Base Pixel Art con bordes nítidos */}
        <img
          src="/data/map-base.png"
          alt="Silueta y estados de la República Mexicana en estilo pixel art isométrico"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none [image-rendering:pixelated]"
          loading="eager"
        />

        {/* Capa 3: Canvas para interacción y resaltado volumétrico */}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          aria-label="Lienzo interactivo de estados"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerLeave={handlePointerLeave}
          className="absolute inset-0 w-full h-full object-contain [image-rendering:pixelated] cursor-pointer touch-manipulation z-10"
        />

        {/* Capa 4: Ranura para overlays y dalias (Hito H4) */}
        {children && (
          <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
            {children}
          </div>
        )}

        {/* Tooltip informativo discreto del estado activo */}
        {showTooltip && activeState && (
          <div className="absolute top-3 left-3 z-30 pointer-events-none flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 shadow-md backdrop-blur-md border border-stone-200/80 animate-in fade-in zoom-in-95 duration-150">
            <span
              className={cn(
                'inline-block h-2.5 w-2.5 rounded-full',
                activeState.id === selectedStateId
                  ? 'bg-pink-600 ring-2 ring-pink-300'
                  : 'bg-violet-600 ring-2 ring-violet-300'
              )}
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-stone-800 leading-tight">
                {activeState.nombre}
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                Estado {activeState.id}
              </span>
            </div>
          </div>
        )}

        {/* Indicador sutil de carga si aún no se han indexado los datos */}
        {loading && (
          <div
            aria-live="polite"
            className="absolute bottom-3 right-3 z-30 flex items-center gap-2 rounded-md bg-white/80 px-2.5 py-1 text-xs text-stone-600 backdrop-blur-sm border border-stone-200 shadow-sm"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
            <span>Cargando mapa...</span>
          </div>
        )}

        {/* Manejo de error si los activos no están disponibles */}
        {error && (
          <div
            role="alert"
            className="absolute inset-0 z-40 flex items-center justify-center bg-white/90 p-4 text-center text-sm text-red-600 backdrop-blur-sm"
          >
            <p>No se pudo cargar el mapa isométrico: {error.message}</p>
          </div>
        )}
      </div>
    </PixelMapContext.Provider>
  );
}

export default PixelMap;
