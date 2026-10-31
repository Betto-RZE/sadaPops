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

/**
 * Paleta semántica del escenario oscuro (#172235).
 * - Mujeres: magenta de marca (igual que en la sección de género), aclarado para contraste sobre fondo oscuro.
 * - Hombres: azul claro, contraparte fría del magenta y derivado del navy de marca.
 * - No binario: ámbar, el acento cálido que ya usan las chispas pixel del escenario.
 * - No votaron: pista vacía (blanco translúcido) — la ausencia de voto se lee como "espacio sin color".
 */
const SERIES = {
  women: '#FF3D9A',
  men: '#7FA7E0',
  nonBinary: '#F5B947',
  noVote: 'rgba(255,255,255,0.14)',
} as const;

const EASE = [0.22, 1, 0.36, 1] as const;

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

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-200';

function DonutChart({ women, men, nonBinary, voted, group, reduceMotion }: { women: number; men: number; nonBinary: number; voted: number; group: string; reduceMotion: boolean }) {
  const slices = [
    { value: women, color: SERIES.women },
    { value: men, color: SERIES.men },
    { value: nonBinary, color: SERIES.nonBinary },
  ];
  let offset = 0;

  return (
    <svg
      className="h-40 w-40 shrink-0 sm:h-44 sm:w-44"
      viewBox="0 0 42 42"
      role="img"
      aria-label={`Grupo de ${group} años: votó ${voted.toFixed(1)} por ciento de los registros clasificados. Mujeres ${women.toFixed(1)} por ciento, hombres ${men.toFixed(1)} por ciento, personas no binarias ${nonBinary.toFixed(2)} por ciento; no votó ${(100 - voted).toFixed(1)} por ciento.`}
    >
      {/* Pista = quienes no votaron */}
      <circle cx="21" cy="21" r="15.9155" fill="none" stroke={SERIES.noVote} strokeWidth="6" />
      <g transform="rotate(-90 21 21)">
        {slices.map((slice, index) => {
          const circle = (
            <motion.circle
              key={index}
              cx="21"
              cy="21"
              r="15.9155"
              fill="none"
              stroke={slice.color}
              strokeWidth="6"
              initial={false}
              animate={{ strokeDasharray: `${slice.value} ${100 - slice.value}`, strokeDashoffset: -offset }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.65, ease: EASE }}
            />
          );
          offset += slice.value;
          return circle;
        })}
      </g>
      <text x="21" y="21.2" textAnchor="middle" className="fill-white text-[7px] font-semibold tabular-nums">
        {voted.toFixed(1)}%
      </text>
      <text x="21" y="26.4" textAnchor="middle" className="fill-slate-300 text-[2.8px] font-medium uppercase tracking-[0.12em]">
        votó
      </text>
    </svg>
  );
}

export function AgeStorySection({ year, onYearChange, selectedGroup, onGroupChange, rates }: AgeStorySectionProps) {
  const reduceMotion = useReducedMotion();
  const currentRate = rates.find((item) => item.group === selectedGroup) ?? rates[0];
  const women = (currentRate.womenVoted / currentRate.classified) * 100;
  const men = (currentRate.menVoted / currentRate.classified) * 100;
  const nonBinary = (currentRate.otherVoted / currentRate.classified) * 100;
  const displayedWomen = Number(women.toFixed(1));
  const displayedMen = Number(men.toFixed(1));
  const displayedNonBinary = Number(nonBinary.toFixed(1));
  const displayedNoVote = Number((100 - displayedWomen - displayedMen - displayedNonBinary).toFixed(1));
  const displayedVoted = Number((100 - displayedNoVote).toFixed(1));
  const displayedNonBinaryLabel = currentRate.otherVoted > 0 && displayedNonBinary === 0 ? '<0.1%' : `${displayedNonBinary.toFixed(1)}%`;
  const unspecifiedShare = (currentRate.unspecified / currentRate.listNominal) * 100;
  const ageLabel = currentRate.group.replace('–', ' a ');
  const dialogue = `¡Hola! En el grupo de ${ageLabel} años, de cada 100 registros clasificados ${displayedWomen.toFixed(1)}% son mujeres que votaron, ${displayedMen.toFixed(1)}% hombres y ${displayedNoVote.toFixed(1)}% personas que no votaron.${currentRate.otherVoted > 0 ? ` También votaron personas no binarias (${currentRate.otherVoted} registros).` : ''}`;
  const { src: character, alt: characterAlt } = AGE_CHARACTERS[currentRate.group] ?? AGE_CHARACTERS['30–39'];
  const dialogueWords = dialogue.split(' ');

  const votedItems = [
    { label: 'Mujeres', value: `${displayedWomen.toFixed(1)}%`, color: SERIES.women },
    { label: 'Hombres', value: `${displayedMen.toFixed(1)}%`, color: SERIES.men },
    ...(currentRate.otherVoted > 0 ? [{ label: 'Personas no binarias', value: displayedNonBinaryLabel, color: SERIES.nonBinary }] : []),
  ];

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-[#172235] text-white shadow-[0_16px_45px_-12px_rgba(28,37,65,0.28)]" aria-labelledby="age-story-title">
      {/* Atmósfera del escenario */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_70%,rgba(83,102,143,0.35),transparent_40%),radial-gradient(ellipse_at_88%_0%,rgba(227,0,126,0.14),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />
        <motion.div className="absolute -left-20 top-1/2 h-64 w-64 rounded-full bg-[#74476F]/20 blur-3xl" animate={reduceMotion ? undefined : { x: [0, 28, 0], y: [0, -18, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      {/* Encabezado + controles */}
      <div className="px-5 pt-6 sm:px-8 sm:pt-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-300">Datos reales, paso a paso</p>
            <h2 id="age-story-title" className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">Mira quiénes votaron</h2>
          </div>

          <div className="flex flex-col gap-2 lg:items-end">
            <span className="text-xs font-medium text-slate-300">Elección federal</span>
            <div className="grid w-full grid-cols-6 gap-0.5 rounded-xl sm:w-auto sm:gap-1 border border-white/10 bg-white/[0.05] p-1" role="group" aria-label="Elegir elección">
              {AGE_ELECTION_YEARS.map((electionYear) => {
                const isActive = year === electionYear;
                return (
                  <button
                    key={electionYear}
                    type="button"
                    onClick={() => onYearChange(electionYear)}
                    aria-pressed={isActive}
                    className={`relative rounded-lg px-1 py-1.5 text-[13px] font-medium tabular-nums sm:px-3.5 sm:text-sm transition-colors ${focusRing} ${isActive ? 'text-white' : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'}`}
                  >
                    {isActive && <motion.span layoutId="age-year-highlight" className="absolute inset-0 rounded-lg bg-[#E3007E]" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} aria-hidden="true" />}
                    <span className="relative z-10">{electionYear}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-7">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-sm font-semibold">Elige un rango de edad</h3>
            <p className="text-xs text-slate-300">La barra indica qué parte del rango votó en {year}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Elegir rango de edad">
            {rates.map(({ group, participation }) => {
              const isActive = selectedGroup === group;
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => onGroupChange(group)}
                  aria-pressed={isActive}
                  aria-label={`${group} años, votó ${participation.toFixed(1)} por ciento`}
                  className={`relative overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-colors ${focusRing} ${isActive ? 'border-transparent' : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]'}`}
                >
                  {isActive && <motion.span layoutId="age-range-highlight" className="absolute inset-0 rounded-xl bg-[#E3007E]" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 34 }} aria-hidden="true" />}
                  <span className="relative z-10 flex items-baseline justify-between gap-2">
                    <span className="whitespace-nowrap text-sm font-semibold text-white">{group}<span className="hidden font-normal sm:inline"> años</span></span>
                    <span className={`text-xs tabular-nums ${isActive ? 'text-white' : 'text-slate-300'}`}>{participation.toFixed(1)}%</span>
                  </span>
                  <span className={`relative z-10 mt-2 block h-1 overflow-hidden rounded-full ${isActive ? 'bg-white/30' : 'bg-white/10'}`} aria-hidden="true">
                    <motion.span
                      className={`absolute inset-y-0 left-0 rounded-full ${isActive ? 'bg-white' : 'bg-pink-300/70'}`}
                      initial={false}
                      animate={{ width: `${participation}%` }}
                      transition={reduceMotion ? { duration: 0 } : { duration: 0.6, ease: EASE }}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Historia: personaje + diálogo + datos */}
      <div className="mt-6 grid items-end gap-x-6 px-5 sm:px-8 md:grid-cols-[200px_minmax(0,1fr)]">
        <div className="relative mx-auto flex h-44 w-full max-w-[200px] items-end justify-center sm:h-52 md:row-span-2 md:h-[22rem]">
          <div className="absolute bottom-4 left-1/2 h-3/4 w-[88%] -translate-x-1/2 rounded-full bg-pink-300/10 blur-2xl" aria-hidden="true" />
          <motion.span className="absolute left-[16%] top-[34%] h-1.5 w-1.5 bg-pink-200/80" animate={reduceMotion ? undefined : { y: [0, -8, 0], opacity: [0.45, 1, 0.45] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }} aria-hidden="true" />
          <motion.span className="absolute right-[12%] top-[50%] h-2 w-2 bg-amber-200/70" animate={reduceMotion ? undefined : { y: [0, 7, 0], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }} aria-hidden="true" />
          <div className="absolute bottom-0 h-px w-4/5 bg-gradient-to-r from-transparent via-white/30 to-transparent" aria-hidden="true" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={character}
              initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1, scaleX: currentRate.group === '20–24' ? -1 : 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
              transition={{ duration: 0.24, ease: EASE }}
              className="relative z-10 flex h-full items-end"
            >
              <Image src={character} alt={characterAlt} width={1024} height={1536} sizes="(max-width: 768px) 180px, 200px" className="h-full w-auto object-contain [image-rendering:pixelated]" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Globo de diálogo */}
        <motion.div
          key={`${year}-${currentRate.group}`}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: EASE }}
          className="relative mt-4 rounded-2xl bg-white p-4 text-slate-700 shadow-[0_10px_30px_rgba(7,14,29,0.25)] sm:p-5 md:mt-0"
        >
          <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-white md:-left-2 md:top-auto md:bottom-8 md:translate-x-0" aria-hidden="true" />
          <p className="relative text-xs font-semibold uppercase tracking-wide text-[#A00056]">{currentRate.group} años · elección {year}</p>
          <motion.p
            key={dialogue}
            variants={{ hidden: {}, visible: { transition: { delayChildren: 0.08, staggerChildren: reduceMotion ? 0 : 0.055 } } }}
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
            className="relative mt-1.5 min-h-[3.5rem] text-base leading-relaxed sm:text-lg"
            aria-hidden="true"
          >
            {dialogueWords.map((word, wordIndex) => (
              <span key={`${wordIndex}-${word}`}>
                <motion.span variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.012 } } }} className="inline-block">
                  {Array.from(word).map((letter, index) => (
                    <motion.span key={`${index}-${letter}`} variants={{ hidden: { opacity: 0, y: 3 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduceMotion ? 0 : 0.12 }} className="inline-block">{letter}</motion.span>
                  ))}
                </motion.span>
                {wordIndex < dialogueWords.length - 1 ? ' ' : null}
              </span>
            ))}
            <motion.span aria-hidden="true" className="ml-0.5 inline-block h-4 w-px bg-[#C2006A] align-middle" animate={reduceMotion ? undefined : { opacity: [1, 0.2, 1] }} transition={reduceMotion ? undefined : { duration: 0.8, repeat: Infinity }} />
          </motion.p>
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{dialogue}</p>
        </motion.div>

        {/* Panel de datos */}
        <div className="mt-4 flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:justify-center sm:gap-10 sm:p-6">
          <DonutChart women={women} men={men} nonBinary={nonBinary} voted={displayedVoted} group={currentRate.group} reduceMotion={Boolean(reduceMotion)} />

          <div className="w-full sm:max-w-[300px]">
            <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-2">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Votaron</span>
              <strong className="text-sm font-semibold tabular-nums text-white">{displayedVoted.toFixed(1)}%</strong>
            </div>
            <ul className="mt-2.5 grid gap-2.5" aria-label="Quiénes votaron">
              {votedItems.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-4 text-sm">
                  <span className="flex items-center gap-2.5 text-slate-200">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
                    {item.label}
                  </span>
                  <span className="font-medium tabular-nums text-white">{item.value}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-3 text-sm">
              <span className="flex items-center gap-2.5 text-slate-200">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/40 bg-white/10" aria-hidden="true" />
                No votaron
              </span>
              <span className="font-medium tabular-nums text-white">{displayedNoVote.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-white/10 px-5 py-4 text-xs leading-relaxed text-slate-300 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-8">
        <p className="max-w-3xl">
          La dona reparte los registros con participación clasificada (sí votó o no votó). El INE separa {currentRate.unspecified.toLocaleString('es-MX')} registros ({unspecifiedShare.toFixed(1)}% de la lista de este rango) sin información suficiente; no se cuentan como abstención.
        </p>
        <span className="w-fit shrink-0 rounded-full border border-white/15 px-2.5 py-0.5 font-medium text-slate-200">Conteo censal · INE</span>
      </div>
    </section>
  );
}
