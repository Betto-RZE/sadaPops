'use client';

import { ELECTION_YEARS, GENDER_MOCK_DATA } from '../constants';
import { GeneroMockData } from '../types';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface Props {
  data: GeneroMockData;
  onSelectYear: (year: number) => void;
}

export function StorytellingGenero({ data, onSelectYear }: Props) {
  const reduceMotion = useReducedMotion();
  const maxGap = Math.max(...ELECTION_YEARS.map((year) => Math.abs(GENDER_MOCK_DATA[year].difference)));
  const averageGap = (
    ELECTION_YEARS.reduce((sum, year) => sum + Math.abs(GENDER_MOCK_DATA[year].difference), 0) /
    ELECTION_YEARS.length
  ).toFixed(1);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
      <motion.article
        className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: reduceMotion ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-sm text-slate-500">Lo que muestra la serie</p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">Una diferencia constante</h2>
        <p className="mt-4 pl-4 border-l-2 border-[#E3007E] text-base sm:text-lg text-slate-700 leading-relaxed">
          En las seis elecciones analizadas, la participación de las mujeres fue mayor que la de los hombres.
        </p>

        <div className="mt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={data.year}
              initial={reduceMotion ? false : { opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            >
              <p className="text-sm text-slate-500">En {data.year}</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">{data.storytelling.keyFinding}</h3>
              <p className="mt-2 text-base leading-relaxed text-slate-600">{data.storytelling.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-7 pt-5 border-t border-slate-100">
          <p className="text-sm text-slate-500">En la boleta de {data.year}</p>
          <p className="mt-1 font-medium text-slate-800">{data.storytelling.contextNote}</p>
        </div>
      </motion.article>

      <motion.article
        className="bg-[#fff8fb] rounded-2xl border border-pink-100 p-6 sm:p-8"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: reduceMotion ? 0 : 0.48, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">2009–2024</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">La diferencia por elección</h2>
          </div>
          <span className="text-xs text-slate-500 shrink-0">puntos porcentuales</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">Elige un año para ver cómo cambia la comparación de participación.</p>

        <ul className="mt-5 space-y-1" aria-label="Diferencia de participación por elección">
          {ELECTION_YEARS.map((year) => {
            const item = GENDER_MOCK_DATA[year];
            const selected = data.year === year;
            const width = (Math.abs(item.difference) / maxGap) * 100;
            return (
              <motion.li
                key={year}
                initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: reduceMotion ? 0 : 0.28, delay: reduceMotion ? 0 : ELECTION_YEARS.indexOf(year) * 0.045 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectYear(year);
                    document.getElementById('cuerda-interactiva')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  aria-pressed={selected}
                  className={`relative w-full grid grid-cols-[3.5rem_1fr_4.2rem] items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#C2006A] ${selected ? 'bg-white' : 'hover:bg-white/70'}`}
                >
                  {selected && <motion.span layoutId="gender-year-highlight" className="absolute inset-0 rounded-lg ring-1 ring-pink-200" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} aria-hidden="true" />}
                  <span className={`text-sm tabular-nums ${selected ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{year}</span>
                  <span className="h-2.5 rounded-full bg-white overflow-hidden" aria-hidden="true">
                    <motion.span className={`block h-full rounded-full ${selected ? 'bg-[#C2006A]' : 'bg-pink-300'}`} initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${width}%` }} transition={reduceMotion ? { duration: 0 } : { duration: 0.7, delay: ELECTION_YEARS.indexOf(year) * 0.04, ease: [0.22, 1, 0.36, 1] }} />
                  </span>
                  <span className={`text-right text-sm tabular-nums ${selected ? 'font-semibold text-[#9e0054]' : 'text-slate-600'}`}>+{item.difference.toFixed(1)}</span>
                </button>
              </motion.li>
            );
          })}
        </ul>

        <p className="mt-5 pt-4 border-t border-pink-100 text-sm text-slate-600">
          La diferencia promedio de la serie fue de <strong className="font-semibold text-[#9e0054]">+{averageGap} puntos</strong> a favor de las mujeres.
        </p>
      </motion.article>
    </section>
  );
}
