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
/**
 * Progreso del scroll (0→1) → posición del tren expresada en «índice de estación».
 *   -1.6 = fuera de cuadro a la izquierda · 0 / 1 / 2 = estacionado en cada andén.
 * Los tramos planos (plateaus) son las paradas: el tren se detiene mientras
 * la persona lee, y vuelve a arrancar al seguir haciendo scroll.
 */
const SCROLL_STOPS = [0, 0.1, 0.28, 0.42, 0.6, 0.74, 1];
const TRAIN_POSITIONS = [-1.6, 0, 0, 1, 1, 2, 2];

const arrive = cubicBezier(0.16, 1, 0.3, 1); // entrada desacelerando hasta el andén
const travel = cubicBezier(0.65, 0, 0.35, 1); // arranque y frenado suaves entre andenes
const hold = (t: number) => t;
const SEGMENT_EASING = [arrive, hold, travel, hold, travel, hold];

/** Tolerancia (en índice de estación) para considerar que el tren ya llegó. */
const DOCK_EPSILON = 0.015;

/** Hueco entre andenes en desktop (debe coincidir con `lg:gap-8`). */
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
 * Escenario ferroviario voxel: tres andenes unidos por un riel continuo.
 *
 * Cada vez que el tren llega a una estación, se abre su tarjeta voxel informativa
 * (`card-parada.png`) con el contenido y enlaces oficiales aprobados del Borrador 3.
 *
 * Cumple con WCAG 2.1 AA: semántica estructurada, contraste y accesibilidad por teclado.
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

  // Suavizado sin rebote: el tren «pesa» y no sobrepasa el andén
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 32,
    mass: 0.6,
    restDelta: 0.0005,
  });

  const trainStation = useTransform(smoothProgress, SCROLL_STOPS, TRAIN_POSITIONS, {
    ease: SEGMENT_EASING,
  });

  // El 100% de translateX es el ancho del propio carril (= ancho de un andén)
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

  // Al entrar/salir del modo scroll, sincroniza la parada activa con la posición real del tren
  useEffect(() => {
    if (isScrollDriven) syncActive(trainStation.get());
    else setActiveIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScrollDriven]);

  return (
    <div
      ref={trackRef}
      className={cn('relative', isScrollDriven && 'h-[320vh]', className)}
    >
      <div className={cn(isScrollDriven && 'sticky top-0 h-screen flex flex-col justify-center')}>
        <div className="relative">
          {/* Contenido accesible completo para lectores de pantalla (WCAG 2.1 AA) */}
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

          {/* Escenario visual: 3 andenes y tarjetas voxel */}
          <ol
            aria-label="Tres paradas hacia el 6 de junio de 2027"
            className={cn(
              // Móvil: carrusel horizontal con snap; Desktop: tres andenes alineados en la misma vía
              'flex gap-6 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 pt-4 pb-6',
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
                  className="relative shrink-0 w-[86%] sm:w-[65%] lg:w-auto snap-center flex flex-col"
                >
                  {/* Estación Voxel con soporte de clic/teclado */}
                  <MetroStation
                    numero={parada.numero}
                    rotulo={parada.rotulo}
                    isActive={isActive}
                    onClick={() => setActiveIndex(index)}
                  >
                    {/* Modo estático: el tren vive dentro del andén 01 */}
                    {isDesktop !== null && !isScrollDriven && index === activeIndex && <MetroTrain />}
                  </MetroStation>

                  {/* Tarjeta Voxel Informativa (`card-parada.png`) */}
                  <div
                    className={cn(
                      'mt-3 sm:mt-4 min-h-[240px] sm:min-h-[290px] relative flex flex-col justify-start z-30',
                      index === 0 && 'lg:w-[115%]',
                      index === 1 && 'lg:w-[115%] lg:-ml-[7.5%]',
                      index === 2 && 'lg:w-[115%] lg:-ml-[15%]'
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {isActive ? (
                        <MetroCard key={parada.id} parada={parada} />
                      ) : (
                        <motion.div
                          key={`closed-${parada.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="pt-2 text-center"
                        >
                          <button
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-black/45 hover:text-[#211B39] border border-dashed border-black/15 hover:border-black/30 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5E2CE6] cursor-pointer"
                          >
                            <span>Abrir parada {parada.numero}</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Modo scroll: carril del tren con la misma caja que un andén (top = pt-4 del <ol>) */}
          {isScrollDriven && (
            <motion.div
              aria-hidden
              className="absolute left-0 top-4 z-20 pointer-events-none [container-type:inline-size] will-change-transform"
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
      </div>
    </div>
  );
}
