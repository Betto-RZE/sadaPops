'use client';

import React, { useEffect, useRef, useState } from 'react';
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

interface PetalOffset {
  x: number;
  y: number;
  rot: number;
}

/**
 * FloatingPetals — Capa de pétalos ambientales (Hito H6).
 *
 * Características:
 *   - Ubicada en z-[60] por encima de la Navbar y del Hero: caen literalmente desde arriba
 *     de la ventana cruzando el encabezado del INE.
 *   - Trayectoria de planeo en S: caen con una ondulación y balanceo suave de hoja hasta
 *     posarse de forma 100% estática en sus coordenadas finales (sin bucle infinito).
 *   - Efecto "Brisa": una vez posados, si el cursor pasa cerca (< 48px), la brisa del movimiento
 *     los desliza suavemente sobre el papel en dirección opuesta con una leve rotación,
 *     manteniendo cursor-default y sin bloquear clics de la interfaz.
 */
export function FloatingPetals({
  petals = HERO_PETALS,
  className,
}: FloatingPetalsProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [isSettled, setIsSettled] = useState(false);
  const [offsets, setOffsets] = useState<Record<number, PetalOffset>>({});
  const petalRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Los pétalos inician su descenso cuando el mapa y las dalias terminan su floración (~2.75s).
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
      setIsSettled(true);
      return;
    }

    const startTimer = window.setTimeout(() => {
      setHasStarted(true);
    }, petalsStartDelayMs);

    // Tras iniciar la caída, todos terminan de posarse en ~3.4s
    const settleTimer = window.setTimeout(() => {
      setIsSettled(true);
    }, petalsStartDelayMs + 3400);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(settleTimer);
    };
  }, [petalsStartDelayMs]);

  // Efecto Brisa: escucha pasiva del mouse para empujar los pétalos cuando ya están posados
  useEffect(() => {
    if (!isSettled) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const BRUSH_RADIUS = 52; // Radio de detección de brisa en píxeles

    const handlePointerMove = (e: PointerEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      petalRefs.current.forEach((el, id) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = centerX - mouseX;
        const dy = centerY - mouseY;
        const dist = Math.hypot(dx, dy);

        if (dist > 0 && dist < BRUSH_RADIUS) {
          // Fuerza de empuje proporcional a la cercanía
          const force = (1 - dist / BRUSH_RADIUS) * 36;
          const nx = (dx / dist) * force;
          const ny = (dy / dist) * force;
          // Rotación sutil según la dirección del empuje
          const rotDelta = (dx > 0 ? 1 : -1) * (force * 0.7);

          setOffsets((prev) => {
            const current = prev[id] || { x: 0, y: 0, rot: 0 };
            return {
              ...prev,
              [id]: {
                x: current.x + nx,
                y: current.y + ny,
                rot: current.rot + rotDelta,
              },
            };
          });
        }
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [isSettled]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute inset-x-0 top-0 h-[100vh] min-h-[720px] pointer-events-none overflow-hidden select-none z-[60]',
        className
      )}
    >
      <style>{`
        @keyframes petal-sky-glide {
          0% {
            opacity: 0;
            transform: translate3d(var(--start-x, -35px), var(--start-y, -120px), 0) rotate(var(--sway-rot-start, -18deg));
          }
          15% {
            opacity: 1;
          }
          35% {
            opacity: 1;
            transform: translate3d(calc(var(--start-x, -35px) * -0.55), calc(var(--start-y, -120px) * 0.55), 0) rotate(var(--sway-rot-mid, 12deg));
          }
          70% {
            opacity: 1;
            transform: translate3d(calc(var(--start-x, -35px) * 0.25), calc(var(--start-y, -120px) * 0.18), 0) rotate(var(--sway-rot-end, -6deg));
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
        }

        .petal-sky-falling {
          opacity: 0;
          animation-name: petal-sky-glide;
          animation-iteration-count: 1;
          animation-timing-function: cubic-bezier(0.25, 0.85, 0.35, 1);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .petal-sky-falling {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {petals.map((petal, idx) => {
        const spriteSrc = `/petals/petal-${petal.shape}-r${petal.rot}.png`;
        const startY = `calc(-${petal.y}vh - 120px)`;
        
        const dir = idx % 2 === 0 ? -1 : 1;
        const startX = dir * (28 + ((idx * 7) % 24));
        const rotStart = dir * (16 + (idx % 5) * 3);
        const rotMid = -dir * (12 + (idx % 4) * 2);
        const rotEnd = dir * 4;

        const glideDuration = (1.8 + (petal.y * 0.015) + ((petal.id * 0.08) % 0.4)).toFixed(2);
        const individualDelay = ((idx * 0.08) % 0.6).toFixed(2);

        const currentOffset = offsets[petal.id] || { x: 0, y: 0, rot: 0 };

        return (
          <div
            key={petal.id}
            ref={(el) => {
              if (el) {
                petalRefs.current.set(petal.id, el);
              } else {
                petalRefs.current.delete(petal.id);
              }
            }}
            className={cn(
              'absolute pointer-events-none cursor-default transition-transform duration-500 ease-out',
              petal.desktopOnly ? 'hidden md:block' : 'block'
            )}
            style={{
              left: `${petal.x}%`,
              top: `${petal.y}%`,
              transform: isSettled
                ? `translate3d(${currentOffset.x}px, ${currentOffset.y}px, 0) rotate(${currentOffset.rot}deg)`
                : undefined,
            }}
          >
            <div
              className={cn(
                'relative select-none pointer-events-none',
                hasStarted ? 'petal-sky-falling' : 'opacity-0'
              )}
              style={
                {
                  '--start-x': `${startX}px`,
                  '--start-y': startY,
                  '--sway-rot-start': `${rotStart}deg`,
                  '--sway-rot-mid': `${rotMid}deg`,
                  '--sway-rot-end': `${rotEnd}deg`,
                  animationDuration: `${glideDuration}s`,
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
