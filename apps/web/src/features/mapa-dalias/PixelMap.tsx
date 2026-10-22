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
 *
 * Se eleva automáticamente en sincronía con el estado (mini-pop 3D de 6px).
 */
export function PixelMapAnchor({
  stateId,
  className,
  children,
}: PixelMapAnchorProps) {
  const { data, selectedStateId, hoveredStateId } = usePixelMapContext();
  if (!data) return null;

  const state = data.stateById.get(stateId);
  if (!state) return null;

  const leftPercent = (state.anchor.x / data.width) * 100;
  const topPercent = (state.anchor.y / data.height) * 100;

  // Elevación sincronizada: sube 6px cuando el estado está activo (hover o seleccionado)
  const isElevated = hoveredStateId === stateId || (!hoveredStateId && selectedStateId === stateId);
  const liftPx = ELEVATION_VOXELS * data.pixelScale;

  // Ordenamiento en eje Z por coordenada Y (las flores más al sur se renderizan al frente)
  // Base 20 + posición vertical entera (0..435)
  const zDepth = 20 + Math.round(state.anchor.y);

  return (
    <div
      data-state-id={stateId}
      className={cn(
        'absolute pointer-events-none transition-transform duration-150 ease-out',
        className
      )}
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        zIndex: isElevated ? zDepth + 500 : zDepth,
        transform: isElevated
          ? `translate(-50%, calc(-50% - ${liftPx}px))`
          : 'translate(-50%, -50%)',
      }}
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

/** Convierte un color hexadecimal #RRGGBB a entero Uint32 little-endian (AABBGGRR) */
function hexToU32(hex: string, alpha = 255): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (((alpha << 24) | (b << 16) | (g << 8) | r) >>> 0);
}

/** Incrementa el brillo de un pixel Uint32 (AABBGGRR) manteniendo 100% de opacidad */
function brightenU32(u32: number, delta: number): number {
  const r = Math.min(255, Math.max(0, (u32 & 0xff) + delta));
  const g = Math.min(255, Math.max(0, ((u32 >> 8) & 0xff) + delta));
  const b = Math.min(255, Math.max(0, ((u32 >> 16) & 0xff) + delta));
  return (((255 << 24) | (b << 16) | (g << 8) | r) >>> 0);
}

/** Entinta un pixel Uint32 hacia la paleta rosa/magenta de selección preservando sus biseles */
function tintSelectU32(u32: number): number {
  const r0 = u32 & 0xff;
  const g0 = (u32 >> 8) & 0xff;
  const b0 = (u32 >> 16) & 0xff;
  // Luminancia relativa respecto al tono base índigo (~105, 103, 234)
  const lumDelta = Math.round((r0 - 105) * 0.45 + (g0 - 103) * 0.45 + (b0 - 234) * 0.2);
  const r = Math.min(255, Math.max(0, 232 + lumDelta));
  const g = Math.min(255, Math.max(0, 56 + Math.round(lumDelta * 0.85)));
  const b = Math.min(255, Math.max(0, 130 + Math.round(lumDelta * 0.9)));
  return (((255 << 24) | (b << 16) | (g << 8) | r) >>> 0);
}

// Paletas de acantilados 3D para estados elevados (Mini Pop)
const HOVER_CLIFF = {
  light: hexToU32('#6654D8'),
  mid: hexToU32('#5542C4'),
  dark: hexToU32('#3C2C9E'),
  deep: hexToU32('#27197A'),
  rimLip: hexToU32('#A8A7FF'),
  rimHighlight: hexToU32('#EBE6FF'),
};

const SELECT_CLIFF = {
  light: hexToU32('#BD1E62'),
  mid: hexToU32('#9E1650'),
  dark: hexToU32('#780E3B'),
  deep: hexToU32('#520726'),
  rimLip: hexToU32('#FF75AE'),
  rimHighlight: hexToU32('#FFC2DC'),
};

// Micro-sombra de oclusión y contacto bajo el bloque elevado
const BASE_SHADOW_1 = hexToU32('#1A1638', 85); // 1er pixel debajo (~33% alfa)
const BASE_SHADOW_2 = hexToU32('#1A1638', 40); // 2do pixel debajo (~15% alfa)

// Fondo de papel con sombra para cubrir la huella del acantilado viejo al flotar (Opción A)
const PAPER_SHADOW = hexToU32('#C3C1C8', 255);
const SOCKET_GROOVE = hexToU32('#27197A', 255);

/** Elevación vertical en vóxeles al hacer hover o seleccionar (2 vóxeles = 6px a escala 3x) */
const ELEVATION_VOXELS = 2;

/**
 * Resuelve qué estado federativo corresponde a las coordenadas lógicas (lx, ly)
 * en O(1) consultando directamente el buffer binario mapIds.
 *
 * Incluye:
 * 1. Histeresis de altura anti-flicker: tolera la elevación 3D del estado activo.
 * 2. Asistencia táctil: radio de 2 vóxeles para pantallas móviles en estados pequeños.
 */
function resolveStateAt(
  lx: number,
  ly: number,
  mapIds: Uint8Array,
  width: number,
  height: number,
  isTouch: boolean,
  activeNumId?: number | null,
  liftPx = 0
): string | null {
  if (lx < 0 || lx >= width || ly < 0 || ly >= height) return null;

  // Histeresis de altura: si el estado activo está elevado en 3D, verificar si el cursor
  // apunta a su cara superior elevada (lx, ly + liftPx)
  if (activeNumId && liftPx > 0 && ly + liftPx < height) {
    const shiftedCode = mapIds[(ly + liftPx) * width + lx];
    if (shiftedCode === activeNumId) {
      return String(activeNumId).padStart(2, '0');
    }
  }

  let code = mapIds[ly * width + lx];

  // Si toca directamente la base o la pared extruida del estado activo elevado
  if (activeNumId && (code === activeNumId || code === activeNumId + 32)) {
    return String(activeNumId).padStart(2, '0');
  }

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
    liftedMask: Uint8Array;
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

  // Renderizado volumétrico 3D ("Mini Pop") en el Canvas
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
        liftedMask: new Uint8Array(width * height),
      };
    }

    const { imgData, u32, prevDrawnIndices, liftedMask } = bufferRef.current;
    const { mapIds, basePixels, pixelScale } = data;
    const liftPx = ELEVATION_VOXELS * pixelScale; // 6px

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

    const setPixel = (idx: number, color: number) => {
      u32[idx] = color;
      prevDrawnIndices.push(idx);
    };

    // 2. Función para renderizar un estado elevado 2 vóxeles con paredes prismáticas 3D
    const paintElevatedState = (stateId: string, mode: 'hover' | 'select') => {
      const state = data.stateById.get(stateId);
      if (!state) return;
      const pixelIndex = data.pixelsByNumId.get(state.numId);
      if (!pixelIndex) return;

      const numId = state.numId;
      const cliffPalette = mode === 'select' ? SELECT_CLIFF : HOVER_CLIFF;
      const [bboxMinX, bboxMinY, bboxMaxX, bboxMaxY] = state.bbox;

      const expandedMinX = Math.max(0, bboxMinX - pixelScale);
      const expandedMaxX = Math.min(width - 1, bboxMaxX + pixelScale);
      const expandedMinY = Math.max(0, bboxMinY - liftPx - 1);
      const expandedMaxY = Math.min(height - 1, bboxMaxY + 3);

      if (expandedMinX < minDirtyX) minDirtyX = expandedMinX;
      if (expandedMaxX > maxDirtyX) maxDirtyX = expandedMaxX;
      if (expandedMinY < minDirtyY) minDirtyY = expandedMinY;
      if (expandedMaxY > maxDirtyY) maxDirtyY = expandedMaxY;

      const top = pixelIndex.topPixels;
      const side = pixelIndex.sidePixels;

      // Opción A: Levantar el bloque completo (cara superior + acantilado frontal) como una pieza sólida 3D.
      // Paso A1: Registrar en `liftedMask` las posiciones donde aterrizará el bloque elevado (y - liftPx)
      const touchedMaskIndices: number[] = [];
      for (let i = 0; i < top.length; i++) {
        const idx = top[i];
        const y = Math.floor(idx / width);
        if (y >= liftPx) {
          const targetIdx = idx - liftPx * width;
          liftedMask[targetIdx] = 1;
          touchedMaskIndices.push(targetIdx);
        }
      }
      for (let i = 0; i < side.length; i++) {
        const idx = side[i];
        const y = Math.floor(idx / width);
        if (y >= liftPx) {
          const targetIdx = idx - liftPx * width;
          liftedMask[targetIdx] = 1;
          touchedMaskIndices.push(targetIdx);
        }
      }

      // Paso A2: Enmascarar la huella inferior del acantilado en map-base.png para que no se duplique abajo
      for (let i = 0; i < side.length; i++) {
        const idx = side[i];
        if (!liftedMask[idx]) {
          // Cubrir la base vieja expuesta con textura de papel sombreado
          setPixel(idx, PAPER_SHADOW);
        }
      }

      // Paso A3: Dibujar el acantilado costero/frontal suspendido en (x, y - liftPx)
      for (let i = 0; i < side.length; i++) {
        const idx = side[i];
        const x = idx % width;
        const y = Math.floor(idx / width);
        if (y < liftPx) continue;

        const orig = basePixels[idx];
        const wallCol =
          mode === 'select'
            ? cliffPalette.dark
            : orig !== 0
            ? brightenU32(orig, 16)
            : cliffPalette.mid;

        const liftedIdx = (y - liftPx) * width + x;
        setPixel(liftedIdx, wallCol);

        // Sombra de contacto suave debajo de la base del acantilado elevado
        const belowId = (y + 1 < height) ? mapIds[(y + 1) * width + x] : 0;
        if (belowId !== numId && belowId !== numId + 32) {
          const shadowY1 = y - liftPx + 1;
          if (shadowY1 < height) {
            setPixel(shadowY1 * width + x, BASE_SHADOW_1);
          }
        }
      }

      // Paso A4: Extruir nueva pared vertical (6px) en bordes continentales limítrofes con otros estados
      for (let i = 0; i < top.length; i++) {
        const idx = top[i];
        const x = idx % width;
        const y = Math.floor(idx / width);

        const isBottomEdge = y + 1 >= height || (mapIds[(y + 1) * width + x] !== numId && mapIds[(y + 1) * width + x] !== numId + 32);
        const isRightEdge = x + 1 >= width || (mapIds[y * width + (x + 1)] !== numId && mapIds[y * width + (x + 1)] !== numId + 32);

        if (isBottomEdge) {
          // Orientación de la pared continental
          const leftSame = x > 0 && mapIds[y * width + (x - 1)] === numId;
          const rightSame = x + 1 < width && mapIds[y * width + (x + 1)] === numId;
          const isStepCrease = !leftSame || !rightSame;

          let wallColor = cliffPalette.mid;
          if (isStepCrease) {
            wallColor = cliffPalette.deep;
          }

          for (let d = 1; d <= liftPx; d++) {
            const wy = y - liftPx + d;
            if (wy >= 0 && wy < height) {
              setPixel(wy * width + x, wallColor);
            }
          }

          // Micro-sombra de contacto bajo el estado elevado
          if (y + 1 < height && mapIds[(y + 1) * width + x] !== numId && mapIds[(y + 1) * width + x] !== numId + 32) {
            setPixel((y + 1) * width + x, BASE_SHADOW_1);
            if (y + 2 < height && mapIds[(y + 2) * width + x] !== numId && mapIds[(y + 2) * width + x] !== numId + 32) {
              setPixel((y + 2) * width + x, BASE_SHADOW_2);
            }
          }
        }

        // Pared este (sombra profunda)
        if (isRightEdge && x + 1 < width) {
          for (let d = 1; d <= liftPx; d++) {
            const wy = y - liftPx + d;
            if (wy >= 0 && wy < height) {
              setPixel(wy * width + x, cliffPalette.deep);
            }
          }
        }
      }

      // Paso A5: Pintar la cara superior desplazada en (x, y - liftPx) con biseles y colores vibrantes
      for (let i = 0; i < top.length; i++) {
        const idx = top[i];
        const x = idx % width;
        const y = Math.floor(idx / width);
        const ly = y - liftPx;
        if (ly < 0) continue;

        const orig = basePixels[idx];
        const isNorthOrWestEdge =
          y === 0 ||
          mapIds[(y - 1) * width + x] !== numId ||
          x === 0 ||
          mapIds[y * width + (x - 1)] !== numId;
        const isSouthOrEastEdge =
          y + 1 >= height ||
          mapIds[(y + 1) * width + x] !== numId ||
          x + 1 >= width ||
          mapIds[y * width + (x + 1)] !== numId;

        let topColor: number;
        if (mode === 'select') {
          if (isNorthOrWestEdge) {
            topColor = cliffPalette.rimHighlight;
          } else if (isSouthOrEastEdge) {
            topColor = cliffPalette.rimLip;
          } else {
            topColor = orig !== 0 ? tintSelectU32(orig) : hexToU32('#E83882');
          }
        } else {
          // Modo Hover
          if (isNorthOrWestEdge) {
            topColor = cliffPalette.rimHighlight;
          } else if (isSouthOrEastEdge) {
            topColor = cliffPalette.rimLip;
          } else {
            topColor = orig !== 0 ? brightenU32(orig, 26) : hexToU32('#807FF9');
          }
        }

        setPixel(ly * width + x, topColor);
      }

      // Limpiar `liftedMask` para reutilizarlo en la siguiente llamada sin coste de GC
      for (let i = 0; i < touchedMaskIndices.length; i++) {
        liftedMask[touchedMaskIndices[i]] = 0;
      }
    };

    // Pintar primero el seleccionado y después el hovered para respetar jerarquía visual
    if (selectedStateId) {
      paintElevatedState(selectedStateId, 'select');
    }

    if (currentHoveredId && currentHoveredId !== selectedStateId) {
      paintElevatedState(currentHoveredId, 'hover');
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
      const activeNumId = activeState ? activeState.numId : null;
      const liftPx = ELEVATION_VOXELS * data.pixelScale;
      const resolved = coords
        ? resolveStateAt(coords.lx, coords.ly, data.mapIds, width, height, isTouch, activeNumId, liftPx)
        : null;

      if (resolved !== currentHoveredId) {
        setInternalHoveredId(resolved);
        onHoverState?.(resolved);
      }
    },
    [data, width, height, currentHoveredId, activeState, getLogicalCoords, onHoverState]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!data) return;
      const coords = getLogicalCoords(e);
      const isTouch = e.pointerType === 'touch';
      const activeNumId = activeState ? activeState.numId : null;
      const liftPx = ELEVATION_VOXELS * data.pixelScale;
      const resolved = coords
        ? resolveStateAt(coords.lx, coords.ly, data.mapIds, width, height, isTouch, activeNumId, liftPx)
        : null;

      if (resolved) {
        const nextSelected = resolved === selectedStateId ? null : resolved;
        onSelectState?.(nextSelected);
      }
    },
    [data, width, height, selectedStateId, activeState, getLogicalCoords, onSelectState]
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
