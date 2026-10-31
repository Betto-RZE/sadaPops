'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HERO_PETALS, type PetalConfig } from './config/petals';
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
 * FloatingPetals — Capa de pétalos ambientales exclusiva para Desktop (Hito H6).
 *
 * Características de fluidez:
 *   - Arquitectura de Animación en 2 Capas Compuestas por GPU:
 *       1. Capa Exterior: Descenso vertical continuo en Y (sin escalas intermedias ni frenados segmentados)
 *          con un fade-in suave al inicio.
 *       2. Capa Interior: Balanceo aerodinámico en X y rotación sinusoidal suave que simula la sustentación del aire.
 *   - Cascada Progresiva Armónica: Los pétalos inician su descenso en una onda continua sin agrupaciones toscas.
 *   - Efecto "Brisa": Al posarse en el papel, el movimiento del cursor los empuja sutilmente.
 *   - Exclusivo de Desktop: Oculto en móvil para no saturar la vista vertical táctil.
 */
export function FloatingPetals({
  petals = HERO_PETALS,
  className,
}: FloatingPetalsProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [isSettled, setIsSettled] = useState(false);
  const [anchorTopPx, setAnchorTopPx] = useState(0);
  const [offsets, setOffsets] = useState<Record<number, PetalOffset>>({});
  const petalRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Inicio de descenso armonizado: arranca suavemente (~350ms tras el aterrizaje del mapa)
  const petalsAfterDropDelayMs = 350;

  // Tiempo máximo para sincronizar el estado asentado (interactividad de brisa con ratón)
  const maxAnimationTotalMs = useMemo(() => {
    let maxMs = 0;
    petals.forEach((p, idx) => {
      const dur = 2.6 + ((p.id * 7) % 5) * 0.18;
      const del = 0.05 + idx * 0.075 + ((p.id * 13) % 5) * 0.03;
      const total = Math.round((dur + del) * 1000);
      if (total > maxMs) maxMs = total;
    });
    return maxMs + 150;
  }, [petals]);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setHasStarted(true);
      setIsSettled(true);
      return;
    }

    let startTimer = 0;
    let settleTimer = 0;
    let triggered = false;

    const handleDropStart = (ev: Event) => {
      if (triggered) return;
      triggered = true;

      const customEv = ev as CustomEvent<{ scrollY?: number }>;
      const dropScrollY =
        typeof customEv.detail?.scrollY === 'number'
          ? customEv.detail.scrollY
          : window.scrollY;
      setAnchorTopPx(Math.max(0, Math.round(dropScrollY)));

      startTimer = window.setTimeout(() => {
        setHasStarted(true);
      }, petalsAfterDropDelayMs);

      settleTimer = window.setTimeout(() => {
        setIsSettled(true);
      }, petalsAfterDropDelayMs + maxAnimationTotalMs);
    };

    window.addEventListener('dalias:map-drop-start', handleDropStart);

    return () => {
      window.removeEventListener('dalias:map-drop-start', handleDropStart);
      if (startTimer) window.clearTimeout(startTimer);
      if (settleTimer) window.clearTimeout(settleTimer);
    };
  }, [petalsAfterDropDelayMs, maxAnimationTotalMs]);

  // Efecto Brisa: escucha pasiva del mouse para empujar los pétalos cuando ya están posados
  useEffect(() => {
    if (!isSettled) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return;
    }

    const BRUSH_RADIUS = 52;

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
          const force = (1 - dist / BRUSH_RADIUS) * 36;
          const nx = (dx / dist) * force;
          const ny = (dy / dist) * force;
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
        'hidden md:block absolute inset-x-0 h-screen supports-[height:100svh]:h-[100svh] min-h-[720px] pointer-events-none overflow-hidden select-none z-[60]',
        className
      )}
      style={{ top: `${anchorTopPx}px` }}
    >
      <style>{`
        /* ==================================================================== */
        /* CAPA 1: Descenso continuo y progresivo en Y con fade-in orgánico     */
        /* Sin saltos de interpolación: curva natural continua de deceleración  */
        /* ==================================================================== */
        @keyframes petal-glide-fall {
          0% {
            opacity: 0;
            transform: translate3d(0, var(--start-y, -220px), 0);
          }
          18% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        /* ==================================================================== */
        /* CAPA 2: Balanceo aerodinámico en X y rotación suave sinusoidal       */
        /* ==================================================================== */
        @keyframes petal-glide-sway {
          0% {
            transform: translate3d(var(--start-x, -36px), 0, 0) rotate(var(--rot-start, -18deg));
          }
          36% {
            transform: translate3d(var(--sway-x-mid, 22px), 0, 0) rotate(var(--rot-mid, 14deg));
          }
          72% {
            transform: translate3d(var(--sway-x-end, -8px), 0, 0) rotate(var(--rot-end, -5deg));
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
        }

        .petal-sky-fall-wrap {
          opacity: 0;
          animation-name: petal-glide-fall;
          animation-iteration-count: 1;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }

        .petal-sky-sway-wrap {
          animation-name: petal-glide-sway;
          animation-iteration-count: 1;
          animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1);
          animation-fill-mode: forwards;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .petal-sky-fall-wrap,
          .petal-sky-sway-wrap {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {petals.map((petal, idx) => {
        const spriteSrc = `/petals/petal-${petal.shape}-r${petal.rot}.png`;
        const startYPx = 180 + (petal.shape * 24) + ((petal.id * 13) % 45);
        const startY = `-${startYPx}px`;

        const dir = idx % 2 === 0 ? -1 : 1;
        const startX = dir * (34 + ((idx * 7) % 26));
        const swayMidX = -dir * (20 + (idx % 3) * 6);
        const swayEndX = dir * (8 + (idx % 2) * 4);

        const rotStart = dir * (18 + (idx % 4) * 4);
        const rotMid = -dir * (12 + (idx % 3) * 3);
        const rotEnd = dir * 4;

        // Ritmo de cascada continuo y natural: sin retrasos caóticos por módulo
        const glideDuration = (2.6 + ((petal.id * 7) % 5) * 0.16).toFixed(2);
        const individualDelay = (0.05 + idx * 0.075 + ((petal.id * 13) % 5) * 0.03).toFixed(2);

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
            className="absolute pointer-events-none cursor-default transition-transform duration-500 ease-out"
            style={{
              left: `${petal.x}%`,
              top: `${petal.y}%`,
              transform: isSettled
                ? `translate3d(${currentOffset.x}px, ${currentOffset.y}px, 0) rotate(${currentOffset.rot}deg)`
                : undefined,
            }}
          >
            {/* Capa 1: Descenso continuo y suave en Y */}
            <div
              className={cn(
                'relative select-none pointer-events-none',
                hasStarted ? 'petal-sky-fall-wrap' : 'opacity-0'
              )}
              style={
                {
                  '--start-y': startY,
                  animationDuration: `${glideDuration}s`,
                  animationDelay: `${individualDelay}s`,
                } as React.CSSProperties
              }
            >
              {/* Capa 2: Balanceo aerodinámico en X y rotación de sustentación */}
              <div
                className="petal-sky-sway-wrap"
                style={
                  {
                    '--start-x': `${startX}px`,
                    '--sway-x-mid': `${swayMidX}px`,
                    '--sway-x-end': `${swayEndX}px`,
                    '--rot-start': `${rotStart}deg`,
                    '--rot-mid': `${rotMid}deg`,
                    '--rot-end': `${rotEnd}deg`,
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
          </div>
        );
      })}
    </div>
  );
}
