'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { PixelMapAnchor, usePixelMapContext } from './PixelMap';
import { computeLevels, DAHLIA_SPRITE_META, type DahliaLevel, type StateCountItem } from './computeLevels';
import { cn } from '../../shared/utils';

export interface DahliaLayerProps {
  /** Conteo opcional de usuarios por estado. Si no se provee, se usa el dataset demo del mock */
  userCounts?: StateCountItem[];
  /** Clases CSS adicionales para el contenedor de la capa */
  className?: string;
  /** Callback al completar la animación de florecimiento */
  onBloomComplete?: () => void;
}

// Dataset inicial por defecto calibrado contra mockup-mapa.jpeg (17 estados con flor)
const DEFAULT_DEMO_COUNTS: StateCountItem[] = [
  { id: '02', usuarios: 420 },   // Baja California -> Nivel 1/2
  { id: '03', usuarios: 310 },   // Baja California Sur -> Nivel 1/2
  { id: '04', usuarios: 280 },   // Campeche -> Nivel 1
  { id: '06', usuarios: 190 },   // Colima -> Nivel 1
  { id: '07', usuarios: 350 },   // Chiapas -> Nivel 1
  { id: '08', usuarios: 4890 },  // Chihuahua -> Nivel 3 (Grande)
  { id: '10', usuarios: 220 },   // Durango -> Nivel 1
  { id: '12', usuarios: 3800 },  // Guerrero -> Nivel 3 (Grande)
  { id: '14', usuarios: 4200 },  // Jalisco -> Nivel 3 (Grande)
  { id: '19', usuarios: 3950 },  // Nuevo León -> Nivel 3 (Grande)
  { id: '20', usuarios: 1650 },  // Oaxaca -> Nivel 2
  { id: '21', usuarios: 2458 },  // Puebla -> Nivel 2
  { id: '24', usuarios: 260 },   // San Luis Potosí -> Nivel 1
  { id: '25', usuarios: 240 },   // Sinaloa -> Nivel 1
  { id: '26', usuarios: 310 },   // Sonora -> Nivel 1
  { id: '28', usuarios: 340 },   // Tamaulipas -> Nivel 1
  { id: '30', usuarios: 1890 },  // Veracruz -> Nivel 2
  { id: '31', usuarios: 1720 },  // Yucatán -> Nivel 2
];

/**
 * DahliaLayer — Capa interactiva que proyecta las dalias voxel sobre los estados del mapa.
 *
 * Características:
 *   - Florecimiento escalonado (oleada de norte a sur) con `steps(4, end)` para conservar el estilo pixel art.
 *   - Escala proporcional al contenedor del mapa sin distorsión de píxeles (`image-rendering: pixelated`).
 *   - Disparo único mediante `IntersectionObserver` al entrar en pantalla.
 *   - Soporte estricto de `prefers-reduced-motion` (muestra las dalias en escala 1 inmediata).
 *   - `pointer-events: none` para no interferir con el hover o clic volumétrico del `<PixelMap>`.
 */
export function DahliaLayer({
  userCounts = DEFAULT_DEMO_COUNTS,
  className,
  onBloomComplete,
}: DahliaLayerProps) {
  const { data } = usePixelMapContext();
  const [hasBloomed, setHasBloomed] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);

  // 1. Calcular mapa de niveles (0..3)
  const levelsMap = useMemo(() => computeLevels(userCounts), [userCounts]);

  // 2. Disparar florecimiento en oleada al entrar en pantalla
  useEffect(() => {
    // Si el usuario prefiere movimiento reducido, mostrar inmediatamente
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHasBloomed(true);
      onBloomComplete?.();
      return;
    }

    // Disparar inmediatamente al montar si ya está en pantalla o con fallback
    const triggerBloom = () => {
      setHasBloomed(true);
      const timer = setTimeout(() => {
        onBloomComplete?.();
      }, 1400);
      return () => clearTimeout(timer);
    };

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      triggerBloom();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasBloomed) {
          triggerBloom();
        }
      },
      { threshold: 0.05 }
    );

    if (layerRef.current) {
      observer.observe(layerRef.current);
    }

    // Fallback de seguridad: si IntersectionObserver no dispara en 300ms, activar de todos modos
    const fallbackTimer = setTimeout(() => {
      setHasBloomed(true);
    }, 300);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, [hasBloomed, onBloomComplete]);

  if (!data) return null;

  // Filtrar estados que tengan flor (nivel > 0)
  const flowerStates = data.states
    .filter((st) => {
      const level = levelsMap.get(st.id) ?? 0;
      return level > 0;
    })
    // Ordenar de norte a sur (coordenada Y de ancla) para escalonar la oleada visualmente
    .sort((a, b) => a.anchor.y - b.anchor.y);

  return (
    <div
      ref={layerRef}
      className={cn('absolute inset-0 pointer-events-none z-10', className)}
    >
      <style>{`
        @keyframes dahlia-bloom-step {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          25% {
            transform: scale(0.35);
            opacity: 1;
          }
          50% {
            transform: scale(0.68);
            opacity: 1;
          }
          75% {
            transform: scale(1.08);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .dahlia-bloom {
          animation-name: dahlia-bloom-step;
          animation-duration: 0.42s;
          animation-timing-function: steps(4, end);
          animation-fill-mode: forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .dahlia-bloom {
            animation: none !important;
            transform: scale(1) !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      {flowerStates.map((st, index) => {
        const level = (levelsMap.get(st.id) ?? 1) as 1 | 2 | 3;
        const meta = DAHLIA_SPRITE_META[level];

        // Ancho porcentual respecto al contenedor del mapa (660 px)
        // Ejemplo: meta.logicalWidth de 18 px en un mapa de 660 px = 2.72% del mapa
        const widthPercent = (meta.logicalWidth / data.width) * 100;

        // Retardo escalonado de la oleada: entre 0.15s y 0.95s según la latitud norte->sur
        const waveDelay = (0.15 + (index / Math.max(1, flowerStates.length)) * 0.75).toFixed(2);

        return (
          <PixelMapAnchor key={st.id} stateId={st.id}>
            <div
              className={cn(
                'relative flex items-center justify-center select-none pointer-events-none',
                hasBloomed ? 'dahlia-bloom' : 'opacity-0 scale-0'
              )}
              style={{
                width: `${meta.width}px`,
                maxWidth: `${meta.width}px`,
                animationDelay: hasBloomed ? `${waveDelay}s` : '0s',
                transformOrigin: '50% 58%',
              }}
            >
              {/* Sprite voxel de dalia prehorneado */}
              <img
                src={meta.src}
                alt={`Dalia nivel ${level} en ${st.nombre}`}
                width={meta.width}
                height={meta.height}
                loading="eager"
                decoding="async"
                className="w-full h-auto pointer-events-none select-none block"
                style={{
                  imageRendering: 'pixelated',
                }}
              />
            </div>
          </PixelMapAnchor>
        );
      })}
    </div>
  );
}
