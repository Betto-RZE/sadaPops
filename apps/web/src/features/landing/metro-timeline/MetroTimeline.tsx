'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  cubicBezier,
} from 'framer-motion';
import { cn } from '@/shared/utils';
import { STATION_ASPECT } from './metroCalibration';
import { MetroStation } from './MetroStation';
import { MetroTrain } from './MetroTrain';
import { MetroCard } from './MetroCard';
import { PARADAS } from './paradas';

interface MetroTimelineProps {
  className?: string;
}

/* -------------------------------------------------------------------------- */
/* Coreografía del scroll                                                     */
/* -------------------------------------------------------------------------- */
const SCROLL_STOPS = [0, 0.1, 0.28, 0.42, 0.6, 0.74, 1];
const TRAIN_POSITIONS = [-1.6, 0, 0, 1, 1, 2, 2];

const arrive = cubicBezier(0.16, 1, 0.3, 1);
const travel = cubicBezier(0.65, 0, 0.35, 1);
const hold = (t: number) => t;
const SEGMENT_EASING = [arrive, hold, travel, hold, travel, hold];

const DOCK_EPSILON = 0.015;
const DESKTOP_GAP = '2rem';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isDesktop;
}

/**
 * Escenario ferroviario voxel con vitrina focal (Opción A):
 * - Vía superior con 3 andenes unidos por riel continuo y tren en movimiento
 * - Vitrina inferior centrada (max-w-2xl ~ 672px) donde abre la tarjeta voxel activa
 *   con el tamaño perfecto para lucir la tipografía y los detalles 3D.
 */
export function MetroTimeline({ className }: MetroTimelineProps) {
  const isDesktop = useIsDesktop();
  const prefersReducedMotion = useReducedMotion();
  const isScrollDriven = isDesktop === true && !prefersReducedMotion;

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 32,
    mass: 0.6,
    restDelta: 0.0005,
  });

  const trainStation = useTransform(smoothProgress, SCROLL_STOPS, TRAIN_POSITIONS, {
    ease: SEGMENT_EASING,
  });

  const trainTransform = useMotionTemplate`translateX(calc(${trainStation} * (100% + ${DESKTOP_GAP})))`;

  function syncActive(value: number) {
    const nearest = Math.round(value);
    const docked =
      nearest >= 0 && nearest < PARADAS.length && Math.abs(value - nearest) < DOCK_EPSILON ? nearest : null;
    setActiveIndex((prev) => (prev === docked ? prev : docked));
  }

  useMotionValueEvent(trainStation, 'change', (value) => {
    if (isScrollDriven) syncActive(value);
  });

  useEffect(() => {
    if (isScrollDriven) syncActive(trainStation.get());
    else setActiveIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScrollDriven]);

  const activeParada = activeIndex !== null ? PARADAS[activeIndex] : null;

  return (
    <div
      ref={trackRef}
      className={cn('relative', isScrollDriven && 'h-[320vh]', className)}
    >
      <div className={cn(isScrollDriven && 'sticky top-0 h-screen flex flex-col justify-center')}>
        <div className="relative w-full max-w-5xl mx-auto">
          {/* Contenido accesible para lectores de pantalla (WCAG 2.1 AA) */}
          <div className="sr-only">
            <h4>Tres paradas hacia el 6 de junio de 2027</h4>
            <ol>
              {PARADAS.map((p) => (
                <li key={p.id}>
                  <h5>Parada {p.numero}: {p.cuando} — {p.titulo}</h5>
                  <p>{p.descripcion}</p>
                  {p.enlace && (
                    <a href={p.enlace.href}>{p.enlace.label}</a>
                  )}
                  {p.nota && <p>{p.nota}</p>}
                </li>
              ))}
            </ol>
          </div>

          {/* VÍA SUPERIOR: Las 3 Estaciones Voxel alineadas */}
          <div className="relative">
            <ol
              aria-label="Estaciones del recorrido hacia el 6 de junio de 2027"
              className={cn(
                'flex gap-6 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 pt-2 pb-4',
                'lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:mx-0 lg:px-0',
                '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
              )}
            >
              {PARADAS.map((parada, index) => {
                const isActive = index === activeIndex;
                return (
                  <li
                    key={parada.id}
                    aria-current={isActive ? 'step' : undefined}
                    className="relative shrink-0 w-[84%] sm:w-[62%] lg:w-auto snap-center flex flex-col items-center"
                  >
                    <MetroStation
                      numero={parada.numero}
                      rotulo={parada.rotulo}
                      isActive={isActive}
                      onClick={() => setActiveIndex(index)}
                    >
                      {isDesktop !== null && !isScrollDriven && index === activeIndex && <MetroTrain />}
                    </MetroStation>

                    {/* Botón selector de estación bajo el andén */}
                    <button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        'mt-2 sm:mt-3 inline-flex items-center gap-1.5 px-3 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full transition-all cursor-pointer',
                        isActive
                          ? 'bg-[#211B39] text-white shadow-sm ring-2 ring-[#5E2CE6]/30'
                          : 'text-[#565273]/70 hover:text-[#211B39] hover:bg-black/5'
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      <span>{parada.numero} · {parada.cuando}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* Tren animado con scroll (Desktop) */}
            {isScrollDriven && (
              <motion.div
                aria-hidden
                className="absolute left-0 top-2 z-20 pointer-events-none [container-type:inline-size] will-change-transform"
                style={{
                  width: `calc((100% - 2 * ${DESKTOP_GAP}) / 3)`,
                  aspectRatio: STATION_ASPECT,
                  transform: trainTransform,
                }}
              >
                <MetroTrain />
              </motion.div>
            )}
          </div>

          {/* VITRINA FOCAL (Opción A): Tarjeta Voxel Amplia y Elegante */}
          <div className="mt-4 sm:mt-6 w-full flex justify-center px-4">
            <div className="w-full max-w-2xl min-h-[290px] sm:min-h-[350px] relative flex items-center justify-center">
              <AnimatePresence mode="wait">
                {activeParada ? (
                  <MetroCard key={activeParada.id} parada={activeParada} />
                ) : (
                  <motion.div
                    key="en-transito"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#796DAA] uppercase py-12"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#5E2CE6] animate-pulse" />
                    <span>En tránsito hacia la siguiente parada...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
