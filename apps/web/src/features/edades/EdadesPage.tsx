'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Navbar } from '@/shared/components/Navbar';
import { DataFooter } from '@/shared/components/DataFooter';
import { LandingFooter } from '@/shared/components/LandingFooter';
import { HeaderEdades } from './HeaderEdades';
import { AgeStorySection } from './AgeStorySection';
import { AGE_DATA } from './constants';

export function EdadesPage() {
  const reduceMotion = useReducedMotion();
  const [year, setYear] = useState(2024);
  const [selectedGroup, setSelectedGroup] = useState('18–19');
  const rates = AGE_DATA[year];
  const topGroup = rates.reduce((top, item) => item.participation > top.participation ? item : top, rates[0]);
  const lowestGroup = rates.reduce((lowest, item) => item.participation < lowest.participation ? item : lowest, rates[0]);
  const ageGap = topGroup.participation - lowestGroup.participation;

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans selection:bg-dalia-200 selection:text-brand-navy">
      <Navbar />
      <HeaderEdades />

      <main className="relative z-20 mx-auto mt-6 w-full max-w-[1360px] flex-1 px-4 pb-12 sm:mt-8 sm:px-6 lg:mt-10 lg:px-12">
        <section className="mx-auto mb-6 grid max-w-5xl gap-2 sm:mb-8 md:grid-cols-[0.9fr_1.1fr] md:items-end md:gap-8" aria-labelledby="age-intro-title">
          <h2 id="age-intro-title" className="text-xl font-semibold tracking-tight text-brand-navy sm:text-2xl">
            La edad también cambia la participación
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Elige una elección y un rango. La dona distribuye a quienes votaron por sexo y a quienes no votaron. Los registros que el INE no pudo clasificar se muestran aparte, no como abstención.
          </p>
        </section>

        <div className="mb-10">
          <AgeStorySection
            year={year}
            onYearChange={setYear}
            selectedGroup={selectedGroup}
            onGroupChange={setSelectedGroup}
            rates={rates}
          />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8" aria-labelledby="age-chart-title">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="age-chart-title" className="text-xl sm:text-2xl font-semibold text-brand-navy">
                Al comparar todos los rangos
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">Cada barra muestra la participación que reporta el INE para ese rango en {year}.</p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              CCPC nacional · INE
            </div>
          </div>

          <div className="mt-7 max-w-4xl">
            <div className="mb-2 grid grid-cols-[4.5rem_1fr_3.5rem] items-end gap-3 text-xs text-slate-400 sm:grid-cols-[5.5rem_1fr_4rem]">
              <span>Edad</span>
              <div className="flex justify-between px-0.5" aria-hidden="true"><span>0%</span><span>50%</span><span>100%</span></div>
              <span className="text-right">Votó</span>
            </div>
            <ul className="space-y-1" aria-label={`Participación por grupo de edad en ${year}`}>
              {rates.map((item) => {
                const isSelected = selectedGroup === item.group;
                return (
                  <motion.li key={item.group} layout transition={reduceMotion ? { duration: 0 } : { layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}>
                    <div className={`grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-3 rounded-lg px-2 py-2 sm:grid-cols-[5.5rem_1fr_4rem] ${isSelected ? 'bg-pink-50' : ''}`}>
                      <span className={`text-sm tabular-nums ${isSelected ? 'font-semibold text-[#9e0054]' : 'text-slate-600'}`}>{item.group}</span>
                      <span className="relative h-3 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                        <motion.span className={`absolute inset-y-0 left-0 rounded-full ${isSelected ? 'bg-[#C2006A]' : 'bg-pink-300'}`} initial={false} animate={{ width: `${item.participation}%` }} transition={reduceMotion ? { duration: 0 } : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }} />
                      </span>
                      <span className={`text-right text-sm tabular-nums ${isSelected ? 'font-semibold text-[#9e0054]' : 'text-slate-600'}`}>{item.participation.toFixed(1)}%</span>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </div>

          <div className="mt-7 max-w-4xl gap-5 border-t border-slate-100 pt-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h3 className="text-base font-semibold text-brand-navy">¿Qué nos dicen los datos?</h3>
              <p className="mt-1 text-sm sm:text-base leading-relaxed text-slate-600">
                En {year}, la participación más alta fue la del grupo de <strong className="font-semibold text-slate-800">{topGroup.group} años</strong> ({topGroup.participation.toFixed(1)}%) y la más baja, la de {lowestGroup.group} años ({lowestGroup.participation.toFixed(1)}%). La distancia entre ambos fue de <strong className="font-semibold text-[#9e0054]">{ageGap.toFixed(1)} puntos porcentuales</strong>.
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-4xl text-sm leading-relaxed text-slate-500">
            El porcentaje sigue la fórmula del INE: sí votaron ÷ (sí votaron + no votaron). Los casos sin especificación se excluyen de ese cálculo. Los rangos de diez años agrupan las edades individuales de los archivos CCPC.
          </p>
        </section>
      </main>

      <DataFooter
        description="Después de comparar las edades, explora otras historias sobre la participación ciudadana."
        primaryHref="/datos/evolucion"
        primaryLabel="Ver evolución temporal"
        secondaryHref="/datos"
        secondaryLabel="Explorar todas las historias"
        source="Fuente: Conteos Censales de Participación Ciudadana (CCPC) del INE, elecciones federales 2009–2024. Agregado nacional por edad y sexo a partir de los archivos abiertos; no incluye casillas especiales ni voto desde el extranjero."
        sourceHref="https://portal.ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/"
      />

      <LandingFooter />
    </div>
  );
}
