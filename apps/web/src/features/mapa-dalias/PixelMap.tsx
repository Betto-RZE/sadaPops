'use client';

import React, { useRef } from 'react';
import { useMapData } from './useMapData';
import type { PixelMapProps } from './types';
import { cn } from '../../shared/utils';

/**
 * PixelMap: Componente interactivo multicapa para el mapa isométrico pixel art de México (Hito H2).
 *
 * Arquitectura de capas apiladas:
 * - Contenedor con aspect-ratio fijo (evita CLS).
 * - Capa 1: Sombra suave en papel (map-shadow.webp).
 * - Capa 2: Gráfico base de vóxeles (map-base.png) con [image-rendering:pixelated].
 * - Capa 3: Canvas 2D de alta resolución para interacción y resaltado dinámico.
 * - Capa 4: Ranura de children para capas overlay (ej. Dalias en Hito H4).
 */
export function PixelMap({
  selectedStateId = null,
  hoveredStateId = null,
  onSelectState,
  onHoverState,
  className,
  children,
}: PixelMapProps) {
  const { data, loading, error } = useMapData();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Valores predeterminados mientras cargan los metadatos para fijar el aspect-ratio sin saltos
  const width = data?.width ?? 660;
  const height = data?.height ?? 435;
  const aspectRatio = `${width} / ${height}`;

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
