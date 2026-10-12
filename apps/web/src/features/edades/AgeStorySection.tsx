'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AGE_ELECTION_YEARS } from './constants';
import type { AgeParticipationRate } from './constants';

type AgeStorySectionProps = {
  year: number;
  onYearChange: (year: number) => void;
  selectedGroup: string;
  onGroupChange: (group: string) => void;
  rates: AgeParticipationRate[];
};

const PIE_COLORS = ['#D40A78', '#33445C', '#A79A75', '#E7E3EA'] as const;
const AGE_CHARACTERS: Record<string, { src: string; alt: string }> = {
  '18–19': { src: '/edades/personaje-joven.png', alt: 'Joven participante pixel art' },
  '20–24': { src: '/edades/personaje-joven-hombre.png', alt: 'Joven participante pixel art' },
  '25–29': { src: '/edades/personaje-joven-mujer-2.png', alt: 'Joven participante pixel art' },
  '30–39': { src: '/edades/personaje-adulto-hombre.png', alt: 'Participante adulto pixel art' },
  '40–49': { src: '/edades/personaje-adulto.png', alt: 'Participante adulta pixel art' },
  '50–59': { src: '/edades/personaje-maduro-hombre.png', alt: 'Participante adulto pixel art' },
  '60–69': { src: '/edades/personaje-mayor.png', alt: 'Participante adulta mayor pixel art' },
  '70+': { src: '/edades/personaje-mayor-hombre.png', alt: 'Participante mayor pixel art' },
};

function PieChart({ women, men, nonBinary, noVote, group, reduceMotion }: { women: number; men: number; nonBinary: number; noVote: number; group: string; reduceMotion: boolean }) {
  const slices = [women, men, nonBinary, noVote];
  let offset = 0;

  return (
    <svg className="h-36 w-36 shrink-0 sm:h-40 sm:w-40" viewBox="0 0 42 42" role="img" aria-label={`De cada cien registros clasificados del grupo de ${group} años: ${women.toFixed(1)} por ciento corresponde a mujeres que votaron, ${men.toFixed(1)} por ciento a hombres que votaron, ${nonBinary.toFixed(1)} por ciento a personas no binarias que votaron y ${noVote.toFixed(1)} por ciento a personas que no votaron`}>
      <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#F3F0F4" strokeWidth="8" />
      <g transform="rotate(-90 21 21)">{slices.map((value, index) => {
        const circle = (
          <motion.circle
            key={index}
            cx="21"
            cy="21"
            r="15.9155"
            fill="none"
            stroke={PIE_COLORS[index]}
            strokeWidth="8"
            initial={false}
            animate={{ strokeDasharray: `${value} ${100 - value}`, strokeDashoffset: -offset }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          />
        );
        offset += value;
        return circle;
      })}</g>
      <text x="21" y="20" textAnchor="middle" className="fill-[#253247] text-[6px] font-bold">100%</text>
      <text x="21" y="25" textAnchor="middle" className="fill-[#6D7786] text-[2.7px]">con marca</text>
    </svg>
  );
}

export function AgeStorySection({ year, onYearChange, selectedGroup, onGroupChange, rates }: AgeStorySectionProps) {
  const reduceMotion = useReducedMotion();
  const currentRate = rates.find((item) => item.group === selectedGroup) ?? rates[0];
  const women = (currentRate.womenVoted / currentRate.classified) * 100;
  const men = (currentRate.menVoted / currentRate.classified) * 100;
  const nonBinary = (currentRate.otherVoted / currentRate.classified) * 100;
  const noVote = (currentRate.notVoted / currentRate.classified) * 100;
  const displayedWomen = Number(women.toFixed(1));
  const displayedMen = Number(men.toFixed(1));
  const displayedNonBinary = Number(nonBinary.toFixed(1));
  const displayedNoVote = Number((100 - displayedWomen - displayedMen - displayedNonBinary).toFixed(1));
  const displayedNonBinaryLabel = currentRate.otherVoted > 0 && displayedNonBinary === 0 ? '<0.1' : displayedNonBinary.toFixed(1);
  const unspecifiedShare = (currentRate.unspecified / currentRate.listNominal) * 100;
  const ageLabel = currentRate.group.replace('–', ' a ');
  const dialogue = `¡Hola! En el grupo de ${ageLabel} años, de cada 100 registros clasificados ${displayedWomen.toFixed(1)}% son mujeres que votaron, ${displayedMen.toFixed(1)}% hombres y ${displayedNoVote.toFixed(1)}% personas que no votaron.${currentRate.otherVoted > 0 ? ` También votaron personas no binarias (${currentRate.otherVoted} registros).` : ''}`;
  const { src: character, alt: characterAlt } = AGE_CHARACTERS[currentRate.group] ?? AGE_CHARACTERS['30–39'];
  const dialogueWords = dialogue.split(' ');

  return (
    <section className="overflow-hidden rounded-3xl border border-[#E9E3EA] bg-white" aria-labelledby="age-story-title">
      <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-6">
        <div>
          <p className="text-sm font-medium text-[#A00056]">Datos reales, paso a paso</p>
          <h2 id="age-story-title" className="mt-1 text-xl font-semibold text-brand-navy sm:text-2xl">Mira quiénes votaron</h2>
        </div>
        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">Conteo censal · INE</span>
      </div>

      <div className="relative isolate overflow-hidden bg-[#172235]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_55%,rgba(83,102,143,0.38),transparent_34%),radial-gradient(ellipse_at_84%_9%,rgba(195,0,106,0.16),transparent_36%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />
          <motion.div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-[#74476F]/25 blur-3xl" animate={reduceMotion ? undefined : { x: [0, 28, 0], y: [0, -18, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[#334F75]/35 blur-3xl" animate={reduceMotion ? undefined : { x: [0, -24, 0], y: [0, 16, 0] }} transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }} />
        </div>

        <div className="relative z-10 px-5 pt-5 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Elección</p>
              <p className="mt-1 text-sm text-slate-300">Selecciona una elección federal</p>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Elegir elección">
              {AGE_ELECTION_YEARS.map((electionYear) => (
                <motion.button key={electionYear} type="button" onClick={() => onYearChange(electionYear)} aria-pressed={year === electionYear}
                  whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${year === electionYear ? 'border-[#E3007E] bg-[#E3007E] text-white' : 'border-white/15 bg-white/[0.07] text-slate-100 hover:bg-white/[0.13]'}`}>
                  {electionYear}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-white">Elige un rango de edad</h3>
              <p className="text-xs text-slate-300">Cada rango cuenta una historia distinta</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Elegir rango de edad">
              {rates.map(({ group }) => (
                <motion.button key={group} type="button" onClick={() => onGroupChange(group)} aria-pressed={selectedGroup === group}
                  whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  className={`relative overflow-hidden rounded-lg border px-3 py-2.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${selectedGroup === group ? 'border-pink-200/70 text-[#9E0054]' : 'border-white/20 bg-white/[0.04] text-slate-100 hover:bg-white/[0.11]'}`}>
                  {selectedGroup === group && <motion.span layoutId="age-range-highlight" className="absolute inset-0 rounded-[7px] border border-[#C2006A] bg-[#FFF2F8]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} aria-hidden="true" />}
                  <span className="relative z-10">{group} años</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 grid items-center gap-5 px-5 pt-5 sm:px-8 md:grid-cols-[205px_minmax(0,1fr)] md:gap-6">
          <div className="relative mx-auto flex h-48 w-full max-w-[205px] items-end justify-center sm:h-56 md:h-64">
            <div className="absolute bottom-5 left-1/2 h-[78%] w-[88%] -translate-x-1/2 rounded-full bg-fuchsia-200/10 blur-2xl" aria-hidden="true" />
            <motion.span className="absolute left-[18%] top-[30%] h-1.5 w-1.5 bg-pink-200/80" animate={reduceMotion ? undefined : { y: [0, -8, 0], opacity: [0.45, 1, 0.45] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }} aria-hidden="true" />
            <motion.span className="absolute right-[14%] top-[46%] h-2 w-2 bg-amber-100/70" animate={reduceMotion ? undefined : { y: [0, 7, 0], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }} aria-hidden="true" />
            <div className="absolute bottom-1 h-px w-4/5 bg-gradient-to-r from-transparent via-white/35 to-transparent" aria-hidden="true" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={character} initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1, scaleX: currentRate.group === '20–24' ? -1 : 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: -5 }} transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 flex h-[96%] items-end">
                <Image src={character} alt={characterAlt} width={1024} height={1536} sizes="(max-width: 768px) 190px, 205px" className="h-full w-auto translate-x-3 object-contain [image-rendering:pixelated]" />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative z-10 min-w-0 pb-3 md:pb-5">
          <motion.div key={`${year}-${currentRate.group}`} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }} className="relative rounded-2xl rounded-bl-md bg-[#F8F6F9] p-4 sm:p-5">
            <span className="absolute -bottom-2 left-7 h-4 w-4 rotate-45 bg-[#F8F6F9] md:-left-2 md:bottom-7" aria-hidden="true" />
            <div className="relative min-h-[132px]">
              <span className="absolute right-5 top-5 h-2 w-2 bg-[#E3007E]" aria-hidden="true" />
              <p className="mb-1 pr-5 text-xs font-semibold uppercase tracking-wide text-[#A00056]">{currentRate.group} años · elección {year}</p>
              <motion.p key={dialogue} variants={{ hidden: {}, visible: { transition: { delayChildren: 0.08, staggerChildren: reduceMotion ? 0 : 0.055 } } }} initial={reduceMotion ? false : 'hidden'} animate="visible" className="min-h-[4.5rem] text-base leading-relaxed text-[#344054] sm:text-lg" aria-hidden="true">
                {dialogueWords.map((word, wordIndex) => (
                  <span key={`${wordIndex}-${word}`}>
                    <motion.span variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.012 } } }} className="inline-block">
                    {Array.from(word).map((character, index) => (
                      <motion.span key={`${index}-${character}`} variants={{ hidden: { opacity: 0, y: 3 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduceMotion ? 0 : 0.12 }} className="inline-block">{character}</motion.span>
                    ))}
                    </motion.span>{wordIndex < dialogueWords.length - 1 ? ' ' : null}
                  </span>
                ))}
                <motion.span aria-hidden="true" className="ml-0.5 inline-block h-4 w-px bg-[#C2006A] align-middle" animate={reduceMotion ? undefined : { opacity: [1, 0.2, 1] }} transition={reduceMotion ? undefined : { duration: 0.8, repeat: Infinity }} />
              </motion.p>
              <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{dialogue}</p>
            </div>
          </motion.div>

          <div className="mt-5 flex flex-col items-center gap-5 rounded-2xl border border-white/70 bg-white p-4 shadow-[0_12px_36px_rgba(7,14,29,0.16)] sm:flex-row sm:justify-center sm:gap-8 sm:p-5">
            <PieChart women={women} men={men} nonBinary={nonBinary} noVote={noVote} group={currentRate.group} reduceMotion={Boolean(reduceMotion)} />
            <ul className="grid w-full gap-3 sm:max-w-[280px]" aria-label="Partes del gráfico">
              {[
                { label: 'Mujeres que votaron', value: displayedWomen, color: PIE_COLORS[0] },
                { label: 'Hombres que votaron', value: displayedMen, color: PIE_COLORS[1] },
                ...(currentRate.otherVoted > 0 ? [{ label: 'Personas no binarias que votaron', value: displayedNonBinary, valueLabel: `${displayedNonBinaryLabel}%`, color: PIE_COLORS[2] }] : []),
                { label: 'No votaron', value: displayedNoVote, color: PIE_COLORS[3] },
              ].map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-4 text-sm">
                  <span className="flex items-center gap-2 text-slate-600"><span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} aria-hidden="true" />{item.label}</span>
                  <strong className="tabular-nums text-brand-navy">{'valueLabel' in item ? item.valueLabel : `${item.value.toFixed(1)}%`}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </div>
        <p className="relative z-10 px-5 pb-5 pt-1 text-center text-xs leading-relaxed text-slate-300/80 sm:px-8">
          La dona distribuye los registros con participación clasificada (sí votó o no votó). El INE separa {currentRate.unspecified.toLocaleString('es-MX')} registros ({unspecifiedShare.toFixed(1)}% de la lista de este rango) sin información suficiente; no se cuentan como abstención.
        </p>
      </div>
    </section>
  );
}
