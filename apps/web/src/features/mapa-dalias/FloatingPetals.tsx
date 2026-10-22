'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HERO_PETALS, type PetalConfig } from './config/petals';
import { MAP_INTRO_DELAY_MS } from './PixelMap';
import { cn } from '../../shared/utils';

export interface FloatingPetalsProps {
  /** Configuración personalizada de pétalos; por defecto usa HERO_PETALS (concentrados en los bordes) */
  petals?: PetalConfig[];
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * FloatingPetals — Capa de pétalos flotantes animados con caída continua y brisa suave (Hito H6).
 *
 * Características:
 *   - Los pétalos caen suavemente desde arriba hacia abajo con un suave balanceo lateral sinusoidal.
 *   - Utiliza exclusivamente sprites prehorneados (`petal-{1..3}-r{0..3}.png`) para preservar píxeles nítidos.
 *   - Entra en Fase 2 (segundo 1.8s) tras la lectura de las primeras palabras del titular.
 *   - Desactivación y estado estático seguro con `prefers-reduced-motion`.
 */
export function FloatingPetals({
  petals = HERO_PETALS,
  className,
}: FloatingPetalsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Iniciar la caída de pétalos en Fase 2 (aprox 1.8s) para no estorbar la lectura del titular inicial
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHasStarted(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setHasStarted(true);
    }, MAP_INTRO_DELAY_MS - 200); // 1.8s

    return () => window.clearTimeout(timer);
  }, []);

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
      className={cn(
        'absolute inset-0 pointer-events-none overflow-hidden select-none z-10 transition-opacity duration-1000',
        hasStarted ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      <style>{`
        @keyframes petal-fall {
          0% {
            transform: translate3d(0, -12vh, 0);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          50% {
            transform: translate3d(var(--sway-x, 14px), 52vh, 0);
            opacity: 0.85;
          }
          90% {
            opacity: 0.9;
          }
          100% {
            transform: translate3d(calc(var(--sway-x, 14px) * -0.5), 114vh, 0);
            opacity: 0;
          }
        }

        .petal-falling {
          animation-name: petal-fall;
          animation-iteration-count: infinite;
          animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1);
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .petal-falling {
            animation: none !important;
            transform: none !important;
            opacity: 0.75 !important;
          }
        }
      `}</style>

      {petals.map((petal, idx) => {
        const spriteSrc = `/petals/petal-${petal.shape}-r${petal.rot}.png`;
        // Mecido lateral suave en px (+ o - según el índice)
        const swayPx = (idx % 2 === 0 ? 1 : -1) * (10 + (idx * 5) % 15);
        // Duración de la caída completa (entre 7s y 11s)
        const fallDuration = (7.5 + ((petal.id * 1.3) % 3.5)).toFixed(2);
        // Retardo inicial escalonado para que no caigan todos al mismo tiempo
        const fallDelay = (0.2 + ((petal.id * 0.75) % 4.5)).toFixed(2);

        return (
          <div
            key={petal.id}
            className={cn(
              'absolute pointer-events-none',
              petal.desktopOnly ? 'hidden md:block' : 'block'
            )}
            style={{
              left: `${petal.x}%`,
              top: '0%',
            }}
          >
            <div
              className={cn(
                'relative select-none pointer-events-none',
                hasStarted && isVisible ? 'petal-falling' : 'opacity-0'
              )}
              style={
                {
                  '--sway-x': `${swayPx}px`,
                  animationDuration: `${fallDuration}s`,
                  animationDelay: `${fallDelay}s`,
                  animationPlayState: isVisible ? 'running' : 'paused',
                } as React.CSSProperties
              }
            >
              <img
                src={spriteSrc}
                alt=""
                loading="eager"
                decoding="async"
                className="select-none pointer-events-none block drop-shadow-[0_2px_5px_rgba(30,21,84,0.14)]"
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
