'use client';

import React, { useEffect, useState } from 'react';
import { HERO_PETALS, type PetalConfig } from './config/petals';
import {
  MAP_INTRO_DELAY_MS,
  MAP_INTRO_HOLD_MS,
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

  // El mapa termina su construcción en: MAP_INTRO_DELAY_MS + MAP_INTRO_HOLD_MS + MAP_INTRO_STAGGER_MS + MAP_STATE_ANIM_MS (~3.37s).
  // Los pétalos entran exactamente 2 segundos después (~5.37s).
  const petalsStartDelayMs =
    MAP_INTRO_DELAY_MS +
    MAP_INTRO_HOLD_MS +
    MAP_INTRO_STAGGER_MS +
    MAP_STATE_ANIM_MS +
    2000;

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
        @keyframes petal-settle-in {
          0% {
            opacity: 0;
            transform: translate3d(var(--start-x, -18px), -85px, 0);
          }
          25% {
            opacity: 1;
          }
          65% {
            opacity: 1;
            transform: translate3d(calc(var(--start-x, -18px) * -0.35), 6px, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .petal-settle-once {
          opacity: 0;
          animation-name: petal-settle-in;
          animation-iteration-count: 1;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
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
        // Desplazamiento horizontal inicial desde el cual planea hasta posarse en (x, y)
        const startOffsetX = (idx % 2 === 0 ? -1 : 1) * (14 + ((idx * 7) % 16));
        // Duración de aterrizaje suave (1.1s a 1.5s)
        const settleDuration = (1.15 + ((petal.id * 0.11) % 0.45)).toFixed(2);
        // Pequeño escalonamiento entre pétalos (0.0s a 0.65s)
        const individualDelay = ((idx * 0.07) % 0.65).toFixed(2);

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
                className="select-none pointer-events-none block drop-shadow-[0_3px_5px_rgba(30,21,84,0.18)]"
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
