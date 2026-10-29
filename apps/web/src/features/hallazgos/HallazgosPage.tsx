'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Navbar } from '@/shared/components/Navbar';
import { DataFooter } from '@/shared/components/DataFooter';
import { EASE } from '@/shared/components/motion';
import { AGE_CURVES, AGE_GROUPS, NATIONAL, SWINGS, YEARS, ageCurveFacts, isPresidential, unspecifiedLatest, womenShareRange } from './data';
import { BOOK, PixelDalia } from './PixelArt';
import { HeaderHallazgos } from './HeaderHallazgos';

const fmt = (value: number, digits = 1) => value.toFixed(digits);

/* ——— Visualizaciones ——— */

function AgeCurves() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(ageCurveFacts.latestYear);
  const width = 520;
  const height = 250;
  const pad = { left: 36, right: 14, top: 26, bottom: 34 };
  const min = 30;
  const max = 80;
  const x = (index: number) => pad.left + (index * (width - pad.left - pad.right)) / (AGE_GROUPS.length - 1);
  const y = (value: number) => pad.top + ((max - value) / (max - min)) * (height - pad.top - pad.bottom);
  const activeRates = AGE_CURVES.find((curve) => curve.year === active)!.rates;
  const valleyIdx = activeRates[1] <= activeRates[2] ? 1 : 2;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={`Participación por edad en las seis elecciones. En ${active}: 18–19 años ${fmt(activeRates[0])}%, mínimo ${fmt(activeRates[valleyIdx])}% entre los 20 y 29, máximo ${fmt(activeRates[ageCurveFacts.peakIdx])}% entre los 60 y 69.`}>
        {[40, 60, 80].map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke={BOOK.edge} strokeDasharray="3 5" />
            <text x={pad.left - 6} y={y(tick) + 4} textAnchor="end" className="text-[10px]" fill={BOOK.muted}>{tick}%</text>
          </g>
        ))}
        {AGE_GROUPS.map((group, index) => (
          <text key={group} x={x(index)} y={height - 12} textAnchor="middle" className="text-[10px]" fill={BOOK.muted}>{group}</text>
        ))}
        {AGE_CURVES.map((curve) => {
          const isActive = curve.year === active;
          return (
            <motion.polyline
              key={curve.year}
              points={curve.rates.map((rate, index) => `${x(index)},${y(rate)}`).join(' ')}
              fill="none"
              stroke={isActive ? BOOK.magenta : BOOK.lavender}
              strokeWidth={isActive ? 3.5 : 2}
              strokeLinejoin="round"
              initial={reduceMotion ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: EASE }}
              style={{ opacity: isActive ? 1 : 0.85 }}
            />
          );
        })}
        {/* marcas: primer voto, valle y cima */}
        {[
          { index: 0, label: 'primer voto' },
          { index: valleyIdx, label: 'valle' },
          { index: ageCurveFacts.peakIdx, label: 'cima' },
        ].map((mark) => (
          <g key={mark.label} style={{ transform: `translate(${x(mark.index)}px, ${y(activeRates[mark.index])}px)`, transition: reduceMotion ? 'none' : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)' }}>
            <rect x="-5" y="-5" width="10" height="10" fill={BOOK.paper} stroke={BOOK.magenta} strokeWidth="2.5" />
            <text x={mark.index === 0 ? -4 : 0} y={mark.label === 'valle' ? 22 : -12} textAnchor={mark.index === 0 ? 'start' : 'middle'} className="text-[10px] font-semibold" fill={BOOK.ink}>{mark.label} {fmt(activeRates[mark.index])}%</text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Resaltar una elección">
        {YEARS.map((year) => (
          <button key={year} type="button" onClick={() => setActive(year)} aria-pressed={year === active} className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B83A78] ${year === active ? 'bg-[#B83A78] text-white' : 'bg-white text-[#5B5262] ring-1 ring-[#E6D8C3] hover:ring-[#D77FA6]'}`}>
            {year}
          </button>
        ))}
        <span className="ml-1 text-[11px] text-[#5B5262]">Las líneas lavanda son las otras elecciones.</span>
      </div>
    </div>
  );
}

function DaliaGarden() {
  const reduceMotion = useReducedMotion();
  const filled = Math.round(womenShareRange.latest);
  return (
    <div>
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5" role="img" aria-label={`De cada 100 votos registrados en ${NATIONAL[NATIONAL.length - 1].year}, ${filled} fueron emitidos por mujeres.`}>
        {Array.from({ length: 100 }, (_, index) => {
          const isWoman = index < filled;
          return (
            <motion.span
              key={index}
              className="flex aspect-square items-center justify-center"
              initial={reduceMotion ? false : { scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: reduceMotion ? 0 : index * 0.008 }}
            >
              {isWoman ? <PixelDalia size={22} className="h-full w-full" /> : <PixelDalia size={22} petal="#C9CFDB" petalDeep="#8D9AB2" center="#EEF0F4" centerDeep="#B9C1CF" className="h-full w-full" />}
            </motion.span>
          );
        })}
      </div>
      <ul className="mt-4 grid grid-cols-6 gap-1 text-center" aria-label="Votos emitidos por mujeres en cada elección">
        {NATIONAL.map((item) => (
          <li key={item.year} className="rounded-lg bg-white px-1 py-1.5 ring-1 ring-[#E6D8C3]">
            <span className="block font-mono text-[10px] text-[#5B5262]">{item.year}</span>
            <span className="block text-xs font-semibold tabular-nums text-[#B83A78]">{fmt(item.womenShare)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SwingBars() {
  const reduceMotion = useReducedMotion();
  const max = Math.max(...SWINGS.map((swing) => swing.value));
  return (
    <ul className="space-y-3" aria-label="Cambio de participación entre elecciones consecutivas">
      {SWINGS.map((swing, index) => (
        <li key={swing.to} className="grid grid-cols-[5.5rem_1fr_3.5rem] items-center gap-3">
          <span className="font-mono text-xs font-bold tabular-nums text-[#5B5262]">{swing.from} → {swing.to}</span>
          <span className="relative h-5 rounded-sm bg-[#F3EBDD]" aria-hidden="true">
            <motion.span
              className="absolute inset-y-0 left-0 rounded-sm"
              style={{ background: `repeating-linear-gradient(90deg, ${BOOK.lavenderDeep} 0 10px, ${BOOK.lavender} 10px 12px)` }}
              initial={reduceMotion ? false : { width: 0 }}
              whileInView={{ width: `${(swing.value / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: EASE }}
            />
          </span>
          <span className="text-right text-sm font-semibold tabular-nums">{fmt(swing.value)} pts</span>
        </li>
      ))}
      <li className="pt-1 text-xs leading-relaxed text-[#5B5262]">
        Participación nacional CCPC:{' '}
        {NATIONAL.map((item, index) => (
          <span key={item.year}>
            <span className={isPresidential(item.year) ? 'font-semibold text-[#B83A78]' : 'font-semibold text-[#8170A8]'}>{item.year} {fmt(item.rate)}%</span>
            {index < NATIONAL.length - 1 ? ' · ' : ''}
          </span>
        ))}
      </li>
    </ul>
  );
}

function BlankPages() {
  const reduceMotion = useReducedMotion();
  const max = Math.max(...NATIONAL.map((item) => item.unspecifiedShare));
  return (
    <div>
      <div className="flex h-44 items-end gap-2 sm:gap-3" role="img" aria-label={`Registros sin participación especificada por elección: ${NATIONAL.map((item) => `${item.year} ${fmt(item.unspecifiedShare)}%`).join(', ')}.`}>
        {NATIONAL.map((item, index) => (
          <div key={item.year} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-xs font-semibold tabular-nums text-[#1C2541]">{fmt(item.unspecifiedShare)}%</span>
            <motion.span
              className="w-full max-w-[44px] border-2 border-[#1C2541] bg-[repeating-linear-gradient(0deg,#FFFDF8_0_6px,#E6D8C3_6px_8px)] shadow-[3px_3px_0_#1C2541]"
              style={{ height: `${Math.max((item.unspecifiedShare / max) * 100, 3)}%`, transformOrigin: 'bottom' }}
              initial={reduceMotion ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: EASE }}
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] text-[#5B5262]">{item.year}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ——— Capítulos ——— */

const intermedias = NATIONAL.filter((item) => !isPresidential(item.year));
const presidenciales = NATIONAL.filter((item) => isPresidential(item.year));
const firstSwing = SWINGS[0];
const lastSwing = SWINGS[SWINGS.length - 1];
const maxUnspecified = NATIONAL.reduce((best, item) => (item.unspecifiedShare > best.unspecifiedShare ? item : best), NATIONAL[0]);

type Chapter = { id: string; number: string; title: string; fact: string; body: string; caveat?: string; petal: string; petalDeep: string; tint: string; viz: React.ReactNode };

const chapterDrafts: (Chapter | null)[] = [
  ageCurveFacts.firstAboveValley && ageCurveFacts.valleyInTwenties && ageCurveFacts.peakAlways6069
    ? {
        id: 'primer-voto',
        number: '01',
        title: 'El primer voto pesa más que el segundo',
        fact: `En las ${YEARS.length} elecciones, quienes tenían 18 o 19 años votaron más que quienes tenían entre 20 y 29. En ${ageCurveFacts.latestYear}: ${fmt(ageCurveFacts.latestFirst)}% frente a ${fmt(ageCurveFacts.latestValley)}%.`,
        body: `La curva siempre tiene la misma forma: un primer pico a los 18–19, un valle en los veintes y una cima entre los 60 y 69 años (${fmt(ageCurveFacts.latestPeak)}% en ${ageCurveFacts.latestYear}), que baja después de los 70.`,
        caveat: 'Los conteos muestran el patrón, no sus causas.',
        petal: BOOK.magentaSoft,
        petalDeep: BOOK.magenta,
        tint: '#FBEAF1',
        viz: <AgeCurves />,
      }
    : null,
  {
    id: 'votos-de-mujeres',
    number: '02',
    title: 'Más de la mitad de los votos, siempre',
    fact: `En cada elección desde 2009, entre ${fmt(womenShareRange.min)} y ${fmt(womenShareRange.max)} de cada 100 votos registrados fueron emitidos por mujeres.`,
    body: 'La proporción casi no se mueve entre elecciones presidenciales e intermedias, aunque la participación total cambie mucho.',
    caveat: 'Esto mide quién emitió los votos, no la tasa de participación: también depende de cuántas mujeres y hombres hay en la lista nominal.',
    petal: '#E7A9C2',
    petalDeep: '#B83A78',
    tint: '#FBF0F4',
    viz: <DaliaGarden />,
  },
  {
    id: 'vaiven',
    number: '03',
    title: 'El vaivén se hace más corto',
    fact: `Entre ${firstSwing.from} y ${firstSwing.to} la participación cambió ${fmt(firstSwing.value)} puntos; entre ${lastSwing.from} y ${lastSwing.to}, ${fmt(lastSwing.value)}.`,
    body: `Las intermedias han subido en cada ocasión (${intermedias.map((item) => fmt(item.rate)).join(' → ')}%), mientras las presidenciales se mantienen entre ${fmt(Math.min(...presidenciales.map((item) => item.rate)))} y ${fmt(Math.max(...presidenciales.map((item) => item.rate)))}%. Por eso la distancia entre una elección y la siguiente es cada vez menor.`,
    caveat: 'El descenso no es perfectamente constante: entre 2015 y 2018 el salto fue un poco mayor que entre 2012 y 2015.',
    petal: BOOK.lavender,
    petalDeep: BOOK.lavenderDeep,
    tint: '#F2EEF8',
    viz: <SwingBars />,
  },
  {
    id: 'paginas-en-blanco',
    number: '04',
    title: 'Las páginas que quedan en blanco',
    fact: `En ${unspecifiedLatest.year}, ${unspecifiedLatest.unspecified.toLocaleString('es-MX')} registros de la lista nominal (${fmt(unspecifiedLatest.unspecifiedShare)}%) no tenían información suficiente para saber si la persona votó.`,
    body: `El máximo fue en ${maxUnspecified.year} (${fmt(maxUnspecified.unspecifiedShare)}%). El INE deja estos registros fuera de la tasa de participación: no cuentan como voto ni como abstención.`,
    caveat: 'Por eso las tasas de esta plataforma se calculan solo sobre los registros clasificados.',
    petal: '#BFD0B9',
    petalDeep: BOOK.sageDeep,
    tint: '#EEF3EC',
    viz: <BlankPages />,
  },
];

const chapters = chapterDrafts.filter((chapter): chapter is Chapter => chapter !== null);

function ChapterSpread({ chapter, index }: { chapter: Chapter; index: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article
      id={chapter.id}
      className="relative scroll-mt-24 overflow-hidden rounded-[26px] bg-[#FFFDF8] shadow-[0_26px_50px_-38px_rgba(28,37,65,0.55)] ring-1 ring-[#EADFCF]"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: EASE }}
      aria-labelledby={`${chapter.id}-title`}
    >
      {/* lomo del libro */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-10 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(185,138,158,0.16),transparent)] lg:block" aria-hidden="true" />
      <div className={`grid gap-6 p-5 sm:p-8 lg:grid-cols-2 lg:gap-14 ${index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <motion.span initial={reduceMotion ? false : { rotate: -90, scale: 0 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.2 }}>
              <PixelDalia size={40} petal={chapter.petal} petalDeep={chapter.petalDeep} />
            </motion.span>
            <span className="font-mono text-xs font-bold tracking-[.18em] text-[#5B5262]">HALLAZGO {chapter.number}</span>
          </div>
          <h2 id={`${chapter.id}-title`} className="mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-[1.9rem]">{chapter.title}</h2>
          <p className="mt-4 rounded-2xl px-4 py-3 text-base font-medium leading-relaxed text-[#1C2541]" style={{ backgroundColor: chapter.tint }}>{chapter.fact}</p>
          <p className="mt-4 text-sm leading-relaxed text-[#5B5262] sm:text-base">{chapter.body}</p>
          {chapter.caveat && <p className="mt-3 border-l-2 border-[#E6D8C3] pl-3 text-xs leading-relaxed text-[#5B5262]">{chapter.caveat}</p>}
        </div>
        <div className="flex flex-col justify-center rounded-2xl bg-[#FBF6EE] p-4 ring-1 ring-[#F0E6D6] sm:p-5">{chapter.viz}</div>
      </div>
    </motion.article>
  );
}

export function HallazgosPage() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="min-h-screen bg-transparent font-sans text-[#1C2541]">
      <Navbar />

      <HeaderHallazgos items={chapters.map(({ id, number, title, petal, petalDeep }) => ({ id, number, title, petal, petalDeep }))} />

      <main className="mx-auto max-w-[1180px] px-4 pb-12 pt-6 sm:px-6 lg:px-10 lg:pt-8">
        {/* Separadores del libro: índice de hallazgos */}
        <nav aria-label="Hallazgos de este libro">
          <ol className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {chapters.map((chapter, index) => (
              <motion.li
                key={chapter.id}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.07, ease: EASE }}
              >
                <a
                  href={`#${chapter.id}`}
                  className="group relative flex h-full items-start gap-3 overflow-hidden rounded-2xl border border-[#EADFCF] bg-white px-4 pb-4 pt-5 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-20px_rgba(28,37,65,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2006A]"
                >
                  <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: chapter.petalDeep }} aria-hidden="true" />
                  <PixelDalia size={28} petal={chapter.petal} petalDeep={chapter.petalDeep} className="mt-0.5 shrink-0 transition-transform duration-300 group-hover:rotate-12" />
                  <span>
                    <span className="block font-mono text-[10px] font-bold tracking-[.16em] text-slate-500">HALLAZGO {chapter.number}</span>
                    <span className="mt-0.5 block text-sm font-semibold leading-snug text-[#1C2541] group-hover:text-[#C2006A]">{chapter.title}</span>
                  </span>
                </a>
              </motion.li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-8">
          {chapters.map((chapter, index) => <ChapterSpread key={chapter.id} chapter={chapter} index={index} />)}
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-[#5B5262]">
          Todos los hallazgos se calculan con los Conteos Censales de Participación Ciudadana (CCPC) 2009–2024 del INE, agregados a nivel nacional. Participación = sí votaron ÷ (sí votaron + no votaron). La base no incluye casillas especiales ni voto desde el extranjero.
        </p>
      </main>

      <DataFooter
        description="Cerraste el libro. Vuelve a cualquier historia para explorar los datos con más detalle."
        primaryHref="/datos/edades"
        primaryLabel="Ver participación por edad"
        secondaryHref="/datos"
        secondaryLabel="Explorar todas las historias"
        source="Fuente: Conteos Censales de Participación Ciudadana (CCPC) 2009–2024, Instituto Nacional Electoral."
        sourceHref="https://portal.ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/"
      />
    </div>
  );
}
