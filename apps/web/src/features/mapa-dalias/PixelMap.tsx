'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useMapData } from './useMapData';
import type { PixelMapProps } from './types';
import { cn } from '../../shared/utils';

// Conjunto de numIds de estados con superficie reducida para asistencia táctil
const SMALL_STATE_NUM_IDS = new Set<number>([
  1,  // Aguascalientes
  6,  // Colima
  9,  // Ciudad de México
  17, // Morelos
  29, // Tlaxcala
]);

/**
 * Resuelve qué estado federativo corresponde a las coordenadas lógicas (lx, ly)
 * en O(1) consultando directamente el buffer binario mapIds.
 *
 * Incluye tolerancia en radio de 2 vóxeles para eventos táctiles en pantallas móviles.
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
  className,
  children,
}: PixelMapProps) {
  const { data, loading, error } = useMapData();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Estado local para hover cuando el componente no está completamente controlado
  const [internalHoveredId, setInternalHoveredId] = useState<string | null>(null);
  const currentHoveredId = controlledHoveredId !== undefined ? controlledHoveredId : internalHoveredId;

  const width = data?.width ?? 660;
  const height = data?.height ?? 435;
  const aspectRatio = `${width} / ${height}`;

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

  return (
    <div
      role="region"
      aria-label="Mapa isométrico interactivo de México"
      className={cn(
        'relative w-full max-w-5xl mx-auto select-none overflow-hidden rounded-xl bg-[#EEEDEA]/50 border border-stone-200/60 shadow-inner',
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
  );
}

export default PixelMap;
