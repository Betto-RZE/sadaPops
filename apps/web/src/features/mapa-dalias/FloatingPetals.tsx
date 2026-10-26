'use client';

import React, { useEffect, useState } from 'react';
import { HERO_PETALS, type PetalConfig } from './config/petals';
import {
  MAP_INTRO_DELAY_MS,
  MAP_INTRO_STAGGER_MS,
  MAP_STATE_ANIM_MS,
} from './PixelMap';
import { cn } from '../../shared/utils';

export interface FloatingPetalsProps {
  /** Configuración personalizada de pétalos; por defecto usa HERO_PETALS (concentrados en los bordes) */
  petals?: PetalConfig[];
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * FloatingPetals — Capa de pétalos en los bordes (Hito H6).
 *
 * Características:
 *   - Aparece ~2 segundos después de que el mapa termina de encajar y ya es interactivo.
 *   - Opacidad 100% nítida (sin transparencias lavadas).
 *   - Animación de entrada única (`animation-iteration-count: 1`, `animation-fill-mode: forwards`):
 *     cada pétalo desciende suavemente con un ligero mecido hasta posarse en su coordenada final (x, y)
 *     y permanece estático ahí.
 *   - Utiliza exclusivamente sprites prehorneados (`petal-{1..3}-r{0..3}.png`) para preservar el pixel art.
 */
export function FloatingPetals({
  petals = HERO_PETALS,
  className,
}: FloatingPetalsProps) {
  const [hasStarted, setHasStarted] = useState(false);

  // El mapa inicia su caída en ~1.10s y termina con el último estado y dalia hacia ~2.75s.
  // Los pétalos inician su planeo suave hacia el final de este florecimiento (~2.75s).
  const petalsStartDelayMs =
    MAP_INTRO_DELAY_MS +
    MAP_INTRO_STAGGER_MS +
    MAP_STATE_ANIM_MS;

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setHasStarted(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setHasStarted(true);
    }, petalsStartDelayMs);

    return () => window.clearTimeout(timer);
  }, [petalsStartDelayMs]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute inset-0 pointer-events-none overflow-hidden select-none z-10',
        className
      )}
    >
      <style>{`
        @keyframes petal-sway-settle {
          0% {
            opacity: 0;
            transform: translate3d(var(--start-x, -28px), -75px, 0) rotate(var(--sway-rot-start, -12deg));
          }
          30% {
            opacity: 1;
            transform: translate3d(calc(var(--start-x, -28px) * 0.4), -32px, 0) rotate(var(--sway-rot-mid, 8deg));
          }
          70% {
            opacity: 1;
            transform: translate3d(calc(var(--start-x, -28px) * -0.15), 5px, 0) rotate(var(--sway-rot-end, -3deg));
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
        }

        .petal-settle-once {
          opacity: 0;
          animation-name: petal-sway-settle;
          animation-iteration-count: 1;
          animation-timing-function: cubic-bezier(0.25, 0.9, 0.35, 1);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .petal-settle-once {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {petals.map((petal, idx) => {
        const spriteSrc = `/petals/petal-${petal.shape}-r${petal.rot}.png`;
        // Desplazamiento horizontal inicial y ángulo de planeo según su índice
        const dir = idx % 2 === 0 ? -1 : 1;
        const startOffsetX = dir * (20 + ((idx * 6) % 18));
        const rotStart = dir * (10 + (idx % 6) * 2);
        const rotMid = -dir * (6 + (idx % 4) * 2);
        const rotEnd = dir * 2;

        const settleDuration = petal.durationSec.toFixed(2);
        const individualDelay = petal.delaySec.toFixed(2);

        return (
          <div
            key={petal.id}
            className={cn(
              'absolute pointer-events-none',
              petal.desktopOnly ? 'hidden md:block' : 'block'
            )}
            style={{
              left: `${petal.x}%`,
              top: `${petal.y}%`,
            }}
          >
            <div
              className={cn(
                'relative select-none pointer-events-none',
                hasStarted ? 'petal-settle-once' : 'opacity-0'
              )}
              style={
                {
                  '--start-x': `${startOffsetX}px`,
                  '--sway-rot-start': `${rotStart}deg`,
                  '--sway-rot-mid': `${rotMid}deg`,
                  '--sway-rot-end': `${rotEnd}deg`,
                  animationDuration: `${settleDuration}s`,
                  animationDelay: `${individualDelay}s`,
                } as React.CSSProperties
              }
            >
              <img
                src={spriteSrc}
                alt=""
                loading="eager"
                decoding="async"
                className="select-none pointer-events-none block drop-shadow-[0_2px_4px_rgba(28,37,65,0.16)]"
                style={{
                  imageRendering: 'pixelated',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
