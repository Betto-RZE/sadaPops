'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  cubicBezier,
} from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/shared/utils';
import { STATION_ASPECT } from './metroCalibration';
import { MetroStation } from './MetroStation';
import { MetroTrain } from './MetroTrain';
import { PARADAS, type Parada, type ParadaTone } from './paradas';

interface MetroTimelineProps {
  className?: string;
}

const TONE: Record<ParadaTone, { badge: string; link: string; ring: string }> = {
  dalia: {
    badge: 'text-dalia-700 border-dalia-600/40',
    link: 'text-dalia-700 hover:text-dalia-800 decoration-dalia-600/40',
    ring: 'focus-visible:ring-dalia-600',
  },
  indigo: {
    badge: 'text-[#4332B5] border-[#5B46D6]/40',
    link: 'text-[#4332B5] hover:text-[#2E208F] decoration-[#5B46D6]/40',
    ring: 'focus-visible:ring-[#5B46D6]',
  },
  navy: {
    badge: 'text-[#0F1B2D] border-[#0F1B2D]/30',
    link: 'text-[#0F1B2D] hover:text-black decoration-[#0F1B2D]/30',
    ring: 'focus-visible:ring-[#0F1B2D]',
  },
};

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
 * Desktop: el escenario queda fijo (sticky) mientras el scroll vertical
 * conduce al tren de andén en andén. Móvil y `prefers-reduced-motion`:
 * versión estática con el tren estacionado en la parada 01 (se refina en Fase 4).
 *
 * La lista conserva semántica <ol> para lectores de pantalla (WCAG 2.1 AA).
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

  useMotionValueEvent(trainStation, 'change', (value) => {
    if (isScrollDriven) syncActive(value);
  });

  function syncActive(value: number) {
    const nearest = Math.round(value);
    const docked =
      nearest >= 0 && nearest < PARADAS.length && Math.abs(value - nearest) < DOCK_EPSILON ? nearest : null;
    setActiveIndex((prev) => (prev === docked ? prev : docked));
  }

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
                  className="relative shrink-0 w-[84%] sm:w-[62%] lg:w-auto snap-center flex flex-col"
                >
                  <MetroStation numero={parada.numero} rotulo={parada.rotulo} isActive={isActive}>
                    {/* Modo estático: el tren vive dentro del andén 01 */}
                    {isDesktop !== null && !isScrollDriven && index === 0 && <MetroTrain />}
                  </MetroStation>

                  <ParadaCaption parada={parada} isActive={isActive} />
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

/**
 * Leyenda editorial provisional bajo cada andén.
 * En la Fase 3 este contenido migra a la tarjeta con marco voxel (card-parada.png).
 */
function ParadaCaption({ parada, isActive }: { parada: Parada; isActive: boolean }) {
  const tone = TONE[parada.tone];

  return (
    <div
      className={cn(
        'mt-6 pt-4 border-t border-black/10 transition-opacity duration-500',
        isActive ? 'opacity-100' : 'opacity-60'
      )}
    >
      <div className="flex items-baseline justify-between gap-3 mb-2.5">
        <span
          className={cn(
            'text-[10px] font-mono font-bold tracking-[0.2em] uppercase border-b pb-0.5',
            tone.badge
          )}
        >
          {parada.cuando}
        </span>
        <span className="font-serif text-2xl leading-none text-black/20">{parada.numero}</span>
      </div>

      <h4 className="font-serif text-xl sm:text-[22px] font-bold text-[#0F1B2D] leading-snug">
        {parada.titulo}
      </h4>

      <p className="mt-2 text-[13px] text-[#4A5568] leading-relaxed font-sans">{parada.descripcion}</p>

      {parada.enlace ? (
        <a
          href={parada.enlace.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'mt-3 inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider underline underline-offset-4 transition-colors rounded py-1',
            'focus:outline-none focus-visible:ring-2',
            tone.link,
            tone.ring
          )}
        >
          <span>{parada.enlace.label}</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden />
          <span className="sr-only">(se abre en una pestaña nueva, sitio oficial del INE)</span>
        </a>
      ) : (
        parada.nota && (
          <p className="mt-3 flex items-center gap-2 text-[11px] font-mono font-semibold text-[#0F1B2D]/70">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>{parada.nota}</span>
          </p>
        )
      )}
    </div>
  );
}
