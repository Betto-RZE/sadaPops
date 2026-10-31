'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeftRight, Sparkles } from 'lucide-react';
import type { StateMetrics, StateSample } from '../constants';
import { DUEL_COLORS, DUEL_TINTS, STATE_SAMPLES, formatCount, participation } from '../constants';
import { AnimatedNumber, EASE, PixelGrid, Reveal, StateSelect, TONE, YearToggle } from './ui';

type Side = 'p1' | 'p2';

type StateDuelProps = {
  primary: StateSample;
  opponent: StateSample;
  onPrimaryChange: (state: StateSample) => void;
  onOpponentChange: (state: StateSample) => void;
  onSwap: () => void;
  year: number;
  onYearChange: (year: number) => void;
};

function Fighter({ state, side, rate, isLeader }: { state: StateSample; side: Side; rate: number; isLeader: boolean }) {
  const reduceMotion = useReducedMotion();
  const isP1 = side === 'p1';
  const color = DUEL_COLORS[side];

  return (
    <div className="relative isolate flex min-h-[260px] flex-col items-center justify-end overflow-hidden rounded-[22px] border border-[#F5D5E4] bg-white px-3 pb-4 pt-10 sm:min-h-[310px]">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: `radial-gradient(ellipse at 50% 58%, ${DUEL_TINTS[side]}, #ffffff 70%)` }} aria-hidden="true" />
      <PixelGrid className="opacity-60" />
      <span className="absolute top-3 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-[.18em] text-white" style={isP1 ? { backgroundColor: color, left: 12 } : { backgroundColor: color, right: 12 }}>
        {isP1 ? 'P1' : 'P2'}
      </span>
      <AnimatePresence>
        {isLeader && (
          <motion.span
            key="leader"
            className="absolute top-3 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#1C2541] shadow-sm ring-1 ring-[#F5D5E4]"
            style={isP1 ? { right: 12 } : { left: 12 }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Sparkles className="h-3 w-3" style={{ color }} aria-hidden="true" />Más participación
          </motion.span>
        )}
      </AnimatePresence>
      <div className="absolute bottom-[4.25rem] left-1/2 h-5 w-1/2 -translate-x-1/2 rounded-[50%] blur-[6px]" style={{ backgroundColor: `${color}26` }} aria-hidden="true" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={state.id}
          className="relative aspect-square w-full max-w-[160px] sm:h-[210px] sm:w-[210px]"
          initial={reduceMotion ? false : { opacity: 0, x: isP1 ? -40 : 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: isP1 ? -40 : 40 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <motion.div
            className="relative h-full w-full"
            style={{ scaleX: isP1 ? 1 : -1 }}
            animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: isP1 ? 0 : 0.9 }}
          >
            <Image src={state.character} alt={`Personaje pixel art de ${state.name}`} fill sizes="210px" className="object-contain object-bottom [image-rendering:pixelated]" />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <p className="relative mt-2 text-center text-base font-semibold text-[#1C2541] sm:text-lg">{state.name}</p>
      <p className="relative text-sm font-semibold tabular-nums" style={{ color }}><AnimatedNumber value={rate} decimals={1} />% votó</p>
    </div>
  );
}

/** Barra estilo "vida" de juego de pelea: P1 crece hacia la izquierda, P2 hacia la derecha. */
function HealthBar({ rate, side, name }: { rate: number; side: Side; name: string }) {
  const reduceMotion = useReducedMotion();
  const isP1 = side === 'p1';
  return (
    <div className="min-w-0">
      <div className={`mb-1.5 flex items-baseline justify-between gap-2 text-xs ${isP1 ? '' : 'flex-row-reverse'}`}>
        <span className="truncate font-semibold uppercase tracking-[.12em] text-[#6B5A68]">{name}</span>
        <span className="font-semibold tabular-nums" style={{ color: DUEL_COLORS[side] }}>{rate.toFixed(1)}%</span>
      </div>
      <div className={`flex h-3.5 overflow-hidden rounded-full bg-white p-[3px] ring-1 ring-[#F5D5E4] ${isP1 ? 'justify-end' : 'justify-start'}`}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: DUEL_COLORS[side] }}
          initial={false}
          animate={{ width: `${rate}%` }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: EASE }}
        />
      </div>
    </div>
  );
}

const ROWS: { label: string; get: (metrics: StateMetrics) => number; format: (value: number) => string; scale?: boolean }[] = [
  { label: 'Participación', get: participation, format: (value) => `${value.toFixed(1)}%`, scale: true },
  { label: 'Votaron', get: (metrics) => metrics.voted, format: formatCount, scale: true },
  { label: 'No votaron', get: (metrics) => metrics.notVoted, format: formatCount, scale: true },
  { label: 'Sin clasificación', get: (metrics) => metrics.unspecified, format: formatCount },
  { label: 'Lista nominal', get: (metrics) => metrics.nominal, format: formatCount, scale: true },
];

function MirrorBar({ value, max, side }: { value: number; max: number; side: Side }) {
  const reduceMotion = useReducedMotion();
  return (
    <span className={`mt-1.5 flex h-1 overflow-hidden rounded-full ${side === 'p1' ? 'justify-end' : 'justify-start'}`} style={{ backgroundColor: TONE.blushDeep }} aria-hidden="true">
      <motion.span className="h-full rounded-full" style={{ backgroundColor: DUEL_COLORS[side] }} initial={false} animate={{ width: `${(value / max) * 100}%` }} transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: EASE }} />
    </span>
  );
}

export function StateDuel({ primary, opponent, onPrimaryChange, onOpponentChange, onSwap, year, onYearChange }: StateDuelProps) {
  const reduceMotion = useReducedMotion();
  const primaryData = primary.data[year];
  const opponentData = opponent.data[year];
  const primaryRate = participation(primaryData);
  const opponentRate = participation(opponentData);
  const gap = Math.abs(primaryRate - opponentRate);
  const sameState = primary.id === opponent.id;
  const tie = sameState || gap < 0.05;
  const leader = primaryRate >= opponentRate ? primary : opponent;
  const trailer = leader === primary ? opponent : primary;

  return (
    <Reveal className="relative isolate mt-8 overflow-hidden rounded-[28px] border border-[#F5D5E4] bg-gradient-to-b from-[#FFF0F7] via-[#FFF7FB] to-white p-5 sm:p-8" aria-labelledby="compare-title">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#FBCFE8]/50 blur-3xl" />
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#CDEDEC]/50 blur-3xl" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#C2006A]">Comparación opcional</p>
          <h2 id="compare-title" className="mt-2 text-2xl font-semibold tracking-tight text-[#1C2541] sm:text-3xl">Y si los ponemos frente a frente…</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6B5A68]">Un duelo amistoso: elige dos estados y compara su participación en la misma elección.</p>
        </div>
        <YearToggle value={year} onChange={onYearChange} layoutId="duel-year" />
      </div>

      {/* Selectores */}
      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <StateSelect value={primary} options={STATE_SAMPLES} onChange={onPrimaryChange} label="Entidad 1" accent={DUEL_COLORS.p1} />
        <motion.button
          type="button"
          onClick={onSwap}
          whileHover={reduceMotion ? undefined : { scale: 1.06 }}
          whileTap={reduceMotion ? undefined : { rotate: 180, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-1 flex h-10 w-10 items-center justify-center rounded-full border border-[#F5D5E4] bg-white text-[#C2006A] shadow-sm transition-colors hover:border-pink-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2006A]"
          aria-label="Intercambiar entidades"
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
        </motion.button>
        <StateSelect value={opponent} options={STATE_SAMPLES} onChange={onOpponentChange} label="Entidad 2" accent={DUEL_COLORS.p2} />
      </div>

      {/* Barras de vida */}
      <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-end gap-3 sm:gap-4">
        <HealthBar rate={primaryRate} side="p1" name={primary.short} />
        <span className="pb-0.5 font-mono text-xs font-bold tracking-[.2em] text-pink-400">{year}</span>
        <HealthBar rate={opponentRate} side="p2" name={opponent.short} />
      </div>

      {/* Contendientes */}
      <div className="relative mt-4 grid grid-cols-2 gap-3 sm:gap-4">
        <Fighter state={primary} side="p1" rate={primaryRate} isLeader={!tie && leader === primary} />
        <Fighter state={opponent} side="p2" rate={opponentRate} isLeader={!tie && leader === opponent} />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
          <motion.span className="absolute inset-0 rounded-full bg-[#F472B6]" animate={reduceMotion ? undefined : { scale: [1, 1.7], opacity: [0.45, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }} />
          <motion.span
            className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#E3007E] font-mono text-base font-black italic text-white shadow-[0_10px_24px_-6px_rgba(227,0,126,0.6)] sm:h-16 sm:w-16 sm:text-lg"
            animate={reduceMotion ? undefined : { rotate: [-4, 4, -4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            VS
          </motion.span>
        </div>
      </div>

      {/* Resultado */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${primary.id}-${opponent.id}-${year}`}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-4 flex flex-col gap-2 rounded-2xl bg-[#E3007E] px-5 py-4 text-white shadow-[0_14px_30px_-16px_rgba(227,0,126,0.8)] sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <span className="flex items-center gap-2.5 text-sm font-medium text-pink-50">
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
            {sameState
              ? 'Elegiste el mismo estado en ambos lados.'
              : tie
                ? `${primary.name} y ${opponent.name} empatan en ${year}.`
                : <span><strong className="font-semibold text-white">{leader.name}</strong> participó más que {trailer.name} en {year}</span>}
          </span>
          <span className="text-2xl font-semibold tabular-nums">
            <AnimatedNumber value={gap} decimals={1} /> <span className="text-base font-medium text-pink-100">puntos porcentuales</span>
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Tabla espejo */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#F5D5E4] bg-white">
        <table className="w-full table-fixed text-xs sm:text-sm">
          <caption className="sr-only">Comparación de participación entre {primary.name} y {opponent.name}, {year}</caption>
          <colgroup><col className="w-[40%]" /><col className="w-[20%]" /><col className="w-[40%]" /></colgroup>
          <thead className="bg-[#FFF7FB] text-xs uppercase tracking-wide text-[#6B5A68]">
            <tr>
              <th scope="col" className="break-words px-2 py-3 text-left sm:px-5"><span className="inline-flex min-w-0 flex-wrap items-start gap-1.5"><span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: DUEL_COLORS.p1 }} aria-hidden="true" /><span className="min-w-0 break-words">{primary.name}</span></span></th>
              <th scope="col" className="break-words px-1 py-3 text-center font-medium">Indicador</th>
              <th scope="col" className="break-words px-2 py-3 text-right sm:px-5"><span className="inline-flex min-w-0 flex-wrap items-start justify-end gap-1.5"><span className="min-w-0 break-words">{opponent.name}</span><span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: DUEL_COLORS.p2 }} aria-hidden="true" /></span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FBE7F0]">
            {ROWS.map((row) => {
              const a = row.get(primaryData);
              const b = row.get(opponentData);
              const max = Math.max(a, b) || 1;
              return (
                <tr key={row.label} className="transition-colors hover:bg-[#FFF7FB]">
                  <td className="px-2 py-3 sm:px-5">
                    <span className={`block tabular-nums ${a >= b ? 'font-semibold text-[#1C2541]' : 'text-[#6B5A68]'}`}>{row.format(a)}</span>
                    {row.scale && <MirrorBar value={a} max={max} side="p1" />}
                  </td>
                  <th scope="row" className="break-words px-1 py-3 text-center text-[10px] font-medium leading-tight text-[#6B5A68] sm:px-2 sm:text-xs">{row.label}</th>
                  <td className="px-2 py-3 text-right sm:px-5">
                    <span className={`block tabular-nums ${b >= a ? 'font-semibold text-[#1C2541]' : 'text-[#6B5A68]'}`}>{row.format(b)}</span>
                    {row.scale && <MirrorBar value={b} max={max} side="p2" />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-[#6B5A68]">Los totales reúnen votos, abstenciones y registros sin clasificación por entidad. La tasa de participación excluye estos últimos.</p>
    </Reveal>
  );
}
