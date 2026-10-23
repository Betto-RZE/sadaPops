'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  PixelMapAnchor,
  usePixelMapContext,
  MAP_INTRO_DELAY_MS,
  MAP_INTRO_HOLD_MS,
  MAP_INTRO_STAGGER_MS,
  MAP_STATE_ANIM_MS,
} from './PixelMap';
import { computeLevels, DAHLIA_SPRITE_META, type StateCountItem } from './computeLevels';
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
 * Características Hito H6:
 *   - Fase 4: Florecimiento sincronizado en paralelo con el aterrizaje de cada estado.
 *   - Secuencia exacta: Caída -> Impacto -> Rebote -> Brote de la dalia.
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

  // 2. Disparar florecimiento en sincronía con la secuencia de entrada del mapa
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHasBloomed(true);
      onBloomComplete?.();
      return;
    }

    const timer = window.setTimeout(() => {
      setHasBloomed(true);
      const finishTimer = window.setTimeout(() => {
        onBloomComplete?.();
      }, MAP_INTRO_DELAY_MS + MAP_INTRO_HOLD_MS + MAP_INTRO_STAGGER_MS + MAP_STATE_ANIM_MS + 400);

      return () => window.clearTimeout(finishTimer);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [onBloomComplete]);

  // 3. Precalcular el tiempo exacto de brote para cada estado (justo al asentarse tras su rebote)
  const flowerStatesWithDelay = useMemo(() => {
    if (!data) return [];

    const flowerStates = data.states
      .filter((st) => (levelsMap.get(st.id) ?? 0) > 0)
      .sort((a, b) => a.anchor.y - b.anchor.y);

    let minGeo = Infinity;
    let maxGeo = -Infinity;
    for (const st of data.states) {
      const g = st.anchor.x * 0.65 + st.anchor.y;
      if (g < minGeo) minGeo = g;
      if (g > maxGeo) maxGeo = g;
    }
    const geoSpan = Math.max(1, maxGeo - minGeo);

    return flowerStates.map((st) => {
      const g = (st.anchor.x * 0.65 + st.anchor.y - minGeo) / geoSpan;
      const jitterMs = ((st.numId * 37) % 70) - 35;
      const dropStartMs = MAP_INTRO_HOLD_MS + Math.max(0, g * MAP_INTRO_STAGGER_MS + jitterMs);

      // El estado impacta en 0 al 65% de MAP_STATE_ANIM_MS y termina su rebote al 92%.
      // La dalia brota justo en el cierre del rebote (~85% de MAP_STATE_ANIM_MS).
      const settleMs = dropStartMs + MAP_STATE_ANIM_MS * 0.85;
      const totalBloomDelaySec = (MAP_INTRO_DELAY_MS + settleMs) / 1000;

      return {
        state: st,
        level: (levelsMap.get(st.id) ?? 1) as 1 | 2 | 3,
        delaySec: Number(totalBloomDelaySec.toFixed(3)),
      };
    });
  }, [data, levelsMap]);

  if (!data) return null;

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
          animation-duration: 0.38s;
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

      {flowerStatesWithDelay.map(({ state: st, level, delaySec }) => {
        const meta = DAHLIA_SPRITE_META[level];

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
                animationDelay: hasBloomed ? `${delaySec}s` : '0s',
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
