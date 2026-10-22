'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HERO_PETALS, type PetalConfig } from './config/petals';
import { cn } from '../../shared/utils';

export interface FloatingPetalsProps {
  /** Configuración personalizada de pétalos; por defecto usa HERO_PETALS (18 pétalos, 11 izq / 7 der) */
  petals?: PetalConfig[];
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * FloatingPetals — Capa de pétalos flotantes animados con CSS ligero (Hito H4 - RF-11).
 *
 * Características:
 *   - Utiliza exclusivamente sprites prehorneados (`petal-{1..3}-r{0..3}.png`) para no degradar el pixel art con rotaciones CSS.
 *   - Flotación con CSS `transform: translate3d(0, y, 0)` a 60 fps sin repintados de layout.
 *   - Pausa automática de la animación cuando el elemento sale del viewport (`IntersectionObserver`).
 *   - Soporte para `prefers-reduced-motion` (desactiva la animación continua y muestra los pétalos posados estáticos).
 *   - `pointer-events: none` total para no interferir con clicks en el mapa ni en botones de la interfaz.
 */
export function FloatingPetals({
  petals = HERO_PETALS,
  className,
}: FloatingPetalsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Pausar animación cuando la sección no está en pantalla para ahorrar GPU/batería
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn('absolute inset-0 pointer-events-none overflow-hidden select-none z-10', className)}
    >
      <style>{`
        @keyframes float-petal {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -var(--float-dist, 8px), 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        .petal-floating {
          animation-name: float-petal;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .petal-floating {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {petals.map((petal) => {
        const spriteSrc = `/petals/petal-${petal.shape}-r${petal.rot}.png`;

        return (
          <div
            key={petal.id}
            className={cn(
              'absolute pointer-events-none transition-opacity duration-700',
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
                isVisible ? 'petal-floating' : ''
              )}
              style={
                {
                  '--float-dist': `${petal.floatDistancePx}px`,
                  animationDuration: `${petal.durationSec}s`,
                  animationDelay: `${petal.delaySec}s`,
                  animationPlayState: isVisible ? 'running' : 'paused',
                } as React.CSSProperties
              }
            >
              <img
                src={spriteSrc}
                alt=""
                loading="eager"
                decoding="async"
                className="select-none pointer-events-none block drop-shadow-[0_2px_4px_rgba(30,21,84,0.12)]"
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
