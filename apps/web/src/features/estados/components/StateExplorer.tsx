'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { StateSample } from '../constants';
import { STATE_SAMPLES, STATE_YEARS, formatCount, participation } from '../constants';
import { AnimatedNumber, EASE, PixelGrid, Reveal, StateSelect, TONE, YearToggle } from './ui';

type StateExplorerProps = {
  state: StateSample;
  onStateChange: (state: StateSample) => void;
  year: number;
  onYearChange: (year: number) => void;
};

export function StateExplorer({ state, onStateChange, year, onYearChange }: StateExplorerProps) {
  const reduceMotion = useReducedMotion();
  const metrics = state.data[year];
  const rate = participation(metrics);
  const classified = metrics.voted + metrics.notVoted;
  const yearIndex = STATE_YEARS.indexOf(year as (typeof STATE_YEARS)[number]);
  const otherYear = STATE_YEARS[yearIndex === 0 ? 1 : yearIndex - 1];
  const deltaRounded = Number((rate - participation(state.data[otherYear])).toFixed(1));
  const trend = deltaRounded > 0 ? 'up' : deltaRounded < 0 ? 'down' : 'flat';
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
  const bar = reduceMotion ? { duration: 0 } : { duration: 0.8, ease: EASE };

  return (
    <Reveal id="explorar" className="scroll-mt-24 rounded-[28px] border border-[#F5D5E4] bg-white p-4 shadow-[0_18px_40px_-28px_rgba(194,0,106,0.45)] sm:p-6" aria-labelledby="explore-title">
      <div className="grid gap-6 md:grid-cols-[minmax(260px,.85fr)_1.15fr] md:gap-10">
        {/* Vitrina del personaje */}
        <div className="relative isolate mx-auto flex h-[320px] w-full max-w-[400px] items-end justify-center overflow-hidden rounded-[22px] bg-gradient-to-b from-[#FFF0F7] to-[#FDE3EF] md:h-full md:min-h-[400px] md:max-w-none">
          <PixelGrid />
          <div className="pointer-events-none absolute left-1/2 top-[42%] -z-10 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 blur-2xl" aria-hidden="true" />
          <motion.div
            className="absolute bottom-7 left-1/2 h-6 w-[55%] -translate-x-1/2 rounded-[50%] bg-[#E3007E]/15 blur-[6px]"
            animate={reduceMotion ? undefined : { scaleX: [1, 0.9, 1], opacity: [1, 0.75, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={state.id}
              className="relative h-[86%] w-[86%]"
              initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <motion.div className="relative h-full w-full" animate={reduceMotion ? undefined : { y: [0, -7, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
                <Image src={state.character} alt={`Personaje pixel art de ${state.name}, con silueta inspirada en el mapa del estado`} fill sizes="(max-width: 768px) 340px, 440px" className="object-contain object-bottom [image-rendering:pixelated]" />
              </motion.div>
            </motion.div>
          </AnimatePresence>
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 font-mono text-[11px] font-bold tracking-[.18em] text-[#C2006A] shadow-sm">{state.short}</span>
        </div>

        {/* Historia y datos */}
        <div className="flex min-w-0 flex-col py-1 md:py-3">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#C2006A]">Explora una entidad</p>
          <h2 id="explore-title" className="mt-2 text-2xl font-semibold tracking-tight text-[#1C2541] sm:text-3xl">
            La historia de{' '}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={state.id} className="inline-block text-[#E3007E]" initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                {state.name}
              </motion.span>
            </AnimatePresence>
          </h2>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="sm:w-60"><StateSelect value={state} options={STATE_SAMPLES} onChange={onStateChange} label="Estado" /></div>
            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[.14em] text-[#6B5A68]">Elección</span>
              <YearToggle value={year} onChange={onYearChange} layoutId="explorer-year" />
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#FFF7FB] p-5 ring-1 ring-[#F5D5E4]">
            <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-3">
              <div>
                <p className="text-sm font-medium text-[#6B5A68]">Participación · {year}</p>
                <p className="mt-1 text-5xl font-semibold tracking-tight text-[#1C2541] sm:text-6xl">
                  <AnimatedNumber value={rate} decimals={1} />
                  <span className="ml-0.5 text-3xl text-[#E3007E] sm:text-4xl">%</span>
                </p>
              </div>
              <motion.span
                key={`${state.id}-${year}`}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.2 }}
                className={`mb-2 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold tabular-nums ring-1 ${trend === 'up' ? 'text-emerald-700 ring-emerald-200' : trend === 'down' ? 'text-amber-800 ring-amber-200' : 'text-slate-600 ring-slate-200'}`}
              >
                <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {deltaRounded > 0 ? '+' : ''}{deltaRounded.toFixed(1)} pts vs {otherYear}
              </motion.span>
            </div>

            <div className="mt-4 flex h-3 overflow-hidden rounded-full" style={{ backgroundColor: TONE.empty }} role="img" aria-label={`Votó ${rate.toFixed(1)} por ciento; no votó ${(100 - rate).toFixed(1)} por ciento de los registros clasificados.`}>
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#F472B6] to-[#E3007E]" initial={false} animate={{ width: `${rate}%` }} transition={bar} />
            </div>
            <div className="mt-2.5 flex flex-wrap justify-between gap-2 text-xs text-[#6B5A68]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#E3007E]" aria-hidden="true" />Votó {rate.toFixed(1)}%</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: TONE.empty }} aria-hidden="true" />No votó {(100 - rate).toFixed(1)}%</span>
            </div>
          </div>

          <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: 'Votaron', value: metrics.voted },
              { label: 'No votaron', value: metrics.notVoted },
              { label: 'Lista nominal', value: metrics.nominal },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="rounded-2xl border border-[#F5D5E4] bg-white px-4 py-3"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.08, ease: EASE }}
              >
                <dt className="text-xs font-medium text-[#6B5A68]">{item.label}</dt>
                <dd className="mt-1 text-lg font-semibold text-[#1C2541]"><AnimatedNumber value={item.value} /></dd>
              </motion.div>
            ))}
          </dl>

          <p className="mt-4 text-xs leading-relaxed text-[#6B5A68]">
            Participación = votaron ÷ registros clasificados ({formatCount(classified)}). Otros {formatCount(metrics.unspecified)} registros sin clasificación se muestran aparte y no cuentan como abstención.
          </p>
        </div>
      </div>
    </Reveal>
  );
}
