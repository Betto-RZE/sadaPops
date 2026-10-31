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
/* Coreografía de scroll: Desktop (3 andenes alineados)                       */
/* -------------------------------------------------------------------------- */
const SCROLL_STOPS = [0, 0.1, 0.28, 0.42, 0.6, 0.74, 1];
const TRAIN_POSITIONS = [-1.6, 0, 0, 1, 1, 2, 2];

const arrive = cubicBezier(0.16, 1, 0.3, 1);
const travel = cubicBezier(0.65, 0, 0.35, 1);
const hold = (t: number) => t;
const SEGMENT_EASING = [arrive, hold, travel, hold, travel, hold];

const DOCK_EPSILON = 0.015;
const DESKTOP_GAP = '2rem';

/* -------------------------------------------------------------------------- */
/* Coreografía de scroll: Móvil (1 andén a la vez, el tren viaja entre paradas)*/
/* -------------------------------------------------------------------------- */
const MOBILE_SCROLL_STOPS = [
  0.0, 0.08, 0.28, 0.36, 0.37, 0.39, 0.4, 0.48, 0.68, 0.76, 0.77, 0.79, 0.8, 0.88, 1.0,
];
const MOBILE_TRAIN_X = [
  -180, 0, 0, 180, 180, -180, -180, 0, 0, 180, 180, -180, -180, 0, 0,
];
const MOBILE_TRAIN_OPACITY = [
  1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1,
];

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
 * Escenario ferroviario voxel:
 * - Desktop: 3 andenes continuos con tren desplazándose lateralmente.
 * - Móvil: 1 solo andén a escala completa. Con el scroll, el tren frena en el andén,
 *   parte hacia la derecha abandonando la pantalla, y reingresa por la izquierda
 *   mientras los textos y la tarjeta cambian a la siguiente estación.
 */
export function MetroTimeline({ className }: MetroTimelineProps) {
  const isDesktop = useIsDesktop();
  const prefersReducedMotion = useReducedMotion();
  const isScrollDriven = !prefersReducedMotion;

  const trackRef = useRef<HTMLDivElement>(null);

  // Estado para desktop
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  // Estados para móvil
  const [mobileIndex, setMobileIndex] = useState(0);
  const [isMobileDocked, setIsMobileDocked] = useState(true);

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

  /* Mapeo Desktop */
  const trainStation = useTransform(smoothProgress, SCROLL_STOPS, TRAIN_POSITIONS, {
    ease: SEGMENT_EASING,
  });
  const trainTransform = useMotionTemplate`translateX(calc(${trainStation} * (100% + ${DESKTOP_GAP})))`;

  /* Mapeo Móvil */
  const mobileTrainX = useTransform(smoothProgress, MOBILE_SCROLL_STOPS, MOBILE_TRAIN_X);
  const mobileTrainOpacity = useTransform(smoothProgress, MOBILE_SCROLL_STOPS, MOBILE_TRAIN_OPACITY);
  const mobileTrainTransform = useMotionTemplate`translateX(${mobileTrainX}%)`;

  function syncDesktopActive(value: number) {
    const nearest = Math.round(value);
    const docked =
      nearest >= 0 && nearest < PARADAS.length && Math.abs(value - nearest) < DOCK_EPSILON ? nearest : null;
    setActiveIndex((prev) => (prev === docked ? prev : docked));
  }

  useMotionValueEvent(trainStation, 'change', (value) => {
    if (isScrollDriven) syncDesktopActive(value);
  });

  useMotionValueEvent(smoothProgress, 'change', (p) => {
    if (!isScrollDriven) return;
    // En móvil, la estación cambia cuando el tren está fuera de pantalla
    const nextIdx = p < 0.38 ? 0 : p < 0.78 ? 1 : 2;
    setMobileIndex(nextIdx);

    // ¿El tren está estacionado dentro del andén?
    const docked =
      (p >= 0.07 && p <= 0.29) ||
      (p >= 0.47 && p <= 0.69) ||
      (p >= 0.87 && p <= 1.0);
    setIsMobileDocked(docked);
  });

  useEffect(() => {
    if (isScrollDriven) {
      syncDesktopActive(trainStation.get());
      const p = smoothProgress.get();
      setMobileIndex(p < 0.38 ? 0 : p < 0.78 ? 1 : 2);
      setIsMobileDocked(
        (p >= 0.07 && p <= 0.29) ||
        (p >= 0.47 && p <= 0.69) ||
        (p >= 0.87 && p <= 1.0)
      );
    } else {
      setActiveIndex(0);
      setMobileIndex(0);
      setIsMobileDocked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScrollDriven]);

  const activeDesktopParada = activeIndex !== null ? PARADAS[activeIndex] : null;
  const currentMobileParada = PARADAS[mobileIndex];

  // Desplazamiento suave al pulsar un botón de estación
  const scrollToStop = (index: number) => {
    if (!trackRef.current) return;
    const targetProgress = index === 0 ? 0.18 : index === 1 ? 0.58 : 0.94;
    const rect = trackRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const trackTop = rect.top + scrollTop;
    const trackHeight = rect.height - window.innerHeight;
    const targetY = trackTop + targetProgress * trackHeight;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  return (
    <div
      ref={trackRef}
      className={cn(
        'relative',
        isScrollDriven && 'h-[320vh] supports-[height:100svh]:h-[320svh]',
        className
      )}
    >
      <div
        className={cn(
          isScrollDriven &&
            'sticky top-0 h-screen supports-[height:100svh]:h-[100svh] flex flex-col justify-center'
        )}
      >
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

          {/* ========================================================================= */}
          {/* MÓVIL (< lg): Un andén en pantalla completa con tren que viaja con scroll  */}
          {/* ========================================================================= */}
          <div className="block lg:hidden w-full max-w-md mx-auto px-2">
            {/* Indicador de 3 paradas (Pills de progreso interactivos) */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3">
              {PARADAS.map((p, idx) => {
                const isCur = idx === mobileIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (isScrollDriven) scrollToStop(idx);
                      else {
                        setMobileIndex(idx);
                        setIsMobileDocked(true);
                      }
                    }}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer',
                      isCur
                        ? 'bg-[#211B39] text-white shadow-sm ring-2 ring-[#5E2CE6]/30'
                        : 'text-[#565273]/75 hover:text-[#211B39] bg-black/5'
                    )}
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full', isCur ? 'bg-[#5E2CE6]' : 'bg-current opacity-50')} />
                    <span>{p.numero} · {p.cuando}</span>
                  </button>
                );
              })}
            </div>

            {/* Estación Voxel única a tamaño completo */}
            <div className="relative w-full overflow-hidden">
              <MetroStation
                numero={currentMobileParada.numero}
                rotulo={currentMobileParada.rotulo}
                isActive={isMobileDocked}
              />

              {/* Tren voxel animado con scroll móvil (entra por la izq, frena, y sale por la der) */}
              {isScrollDriven ? (
                <motion.div
                  aria-hidden
                  className="absolute inset-0 z-20 pointer-events-none [container-type:inline-size]"
                  style={{
                    transform: mobileTrainTransform,
                    opacity: mobileTrainOpacity,
                  }}
                >
                  <MetroTrain />
                </motion.div>
              ) : (
                <MetroTrain />
              )}
            </div>

            {/* Vitrina de la Tarjeta Voxel Informativa en móvil */}
            <div className="mt-3 sm:mt-4 w-full min-h-[260px] relative flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isMobileDocked ? (
                  <MetroCard key={currentMobileParada.id} parada={currentMobileParada} />
                ) : (
                  <motion.div
                    key="mobile-en-transito"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#796DAA] uppercase py-8"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5E2CE6] animate-pulse" />
                    <span>En tránsito hacia la siguiente parada...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ESCRITORIO (>= lg): 3 andenes alineados en riel continuo con tren viajando */}
          {/* ========================================================================= */}
          <div className="hidden lg:block">
            {/* Vía Superior con 3 Estaciones Voxel */}
            <div className="relative">
              <ol
                aria-label="Estaciones del recorrido hacia el 6 de junio de 2027"
                className="grid grid-cols-3 gap-8 overflow-visible"
              >
                {PARADAS.map((parada, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <li
                      key={parada.id}
                      aria-current={isActive ? 'step' : undefined}
                      className="relative flex flex-col items-center"
                    >
                      <MetroStation
                        numero={parada.numero}
                        rotulo={parada.rotulo}
                        isActive={isActive}
                        onClick={() => scrollToStop(index)}
                      >
                        {isDesktop !== null && !isScrollDriven && index === activeIndex && <MetroTrain />}
                      </MetroStation>

                      {/* Botón selector de estación bajo el andén */}
                      <button
                        type="button"
                        onClick={() => scrollToStop(index)}
                        className={cn(
                          'mt-3 inline-flex items-center gap-1.5 px-3 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full transition-all cursor-pointer',
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
                  className="absolute left-0 top-0 z-20 pointer-events-none [container-type:inline-size] will-change-transform"
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

            {/* Vitrina Focal (Desktop): Tarjeta Voxel Amplia y Elegante */}
            <div className="mt-6 w-full flex justify-center px-4">
              <div className="w-full max-w-2xl min-h-[350px] relative flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {activeDesktopParada ? (
                    <MetroCard key={activeDesktopParada.id} parada={activeDesktopParada} />
                  ) : (
                    <motion.div
                      key="desktop-en-transito"
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
    </div>
  );
}
