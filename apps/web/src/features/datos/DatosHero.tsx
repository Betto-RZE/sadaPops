'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { pixelFont } from '@/features/evolucion/fonts';
import type { CarouselHandle } from './StoryCartridgeCarousel';
import { StoryCartridgeCarousel, stories } from './StoryCartridgeCarousel';

export function DatosHero() {
  const reduceMotion = useReducedMotion();
  const carousel = useRef<CarouselHandle>(null);
  const [current, setCurrent] = useState(0);
  const handleChange = useCallback((index: number) => setCurrent(index), []);

  return (
    <section className="relative isolate mb-16 overflow-hidden rounded-[2rem] border border-[#F0D8E2] bg-[#FFF2F6] px-4 py-8 shadow-[0_18px_45px_-34px_rgba(169,46,90,0.24)] sm:mb-20 sm:px-7 sm:py-10 lg:px-10 lg:py-8" aria-labelledby="stories-title">
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
        <motion.div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#F1CBD9] blur-3xl" animate={reduceMotion ? undefined : { x: [0, -20, 0], y: [0, 16, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -bottom-32 left-[38%] h-64 w-64 rounded-full bg-[#DCE5F8] blur-3xl" animate={reduceMotion ? undefined : { x: [0, 24, 0] }} transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <div className="relative grid items-center gap-3 lg:grid-cols-[minmax(230px,0.68fr)_minmax(0,1.32fr)] xl:gap-6">
        <motion.div
          className="mx-auto max-w-xl text-center lg:mx-0 lg:pl-2 lg:text-left"
          initial={reduceMotion ? false : { opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#A00056]">Historias interactivas · INE</p>
          <h1 id="stories-title" className={`${pixelFont.className} text-4xl font-bold leading-[1.12] tracking-[-0.04em] text-brand-navy sm:text-5xl xl:text-[54px]`}>
            ¿Qué quieres conocer?
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base font-medium leading-relaxed text-brand-navy/70 sm:text-lg lg:mx-0">
            Elige una historia, inserta su cartucho y explora lo que nos cuentan los datos de participación ciudadana.
          </p>

          {/* Índice de cartuchos, sincronizado con el carrusel */}
          <nav className="mt-7 hidden lg:block" aria-label="Índice de historias">
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{stories.length} cartuchos</p>
            <ol className="space-y-0.5">
              {stories.map((story, index) => {
                const isActive = index === current;
                return (
                  <li key={story.href ?? index}>
                    <button
                      type="button"
                      onClick={() => carousel.current?.goTo(index)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`relative flex w-full items-center gap-3 rounded-lg py-1.5 pl-3 pr-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#CB3E67] ${isActive ? 'font-semibold text-brand-navy' : 'text-slate-500 hover:text-brand-navy'}`}
                    >
                      {isActive && <motion.span layoutId="story-index" className="absolute inset-0 rounded-lg bg-[#FFE5EE] shadow-[0_1px_3px_rgba(169,46,90,0.12)]" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} aria-hidden="true" />}
                      <span className={`relative font-mono text-[11px] font-bold tabular-nums ${isActive ? 'text-[#CB3E67]' : 'text-slate-400'}`}>{String(index + 1).padStart(2, '0')}</span>
                      <span className="relative truncate">{story.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </motion.div>

        <div className="min-w-0">
          <StoryCartridgeCarousel ref={carousel} onChange={handleChange} />
        </div>
      </div>
    </section>
  );
}
