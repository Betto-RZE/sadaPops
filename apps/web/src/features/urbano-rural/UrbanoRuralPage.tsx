'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Ban, ExternalLink, Info, Layers, Microscope } from 'lucide-react';
import { Navbar } from '@/shared/components/Navbar';
import { DataFooter } from '@/shared/components/DataFooter';
import { AnimatedNumber, EASE, Reveal } from '@/shared/components/motion';
import type { Zone, ZoneYear } from './constants';
import { ZONES, ZONE_DATA, ZONE_META, ZONE_YEARS, gapFor } from './constants';
import { PALETTE, TerritoryDiorama } from './TerritoryDiorama';
import { HeaderUrbanoRural } from './HeaderUrbanoRural';

/** Selector de elección dibujado como mojones de un camino. */
function YearRoad({ value, onChange }: { value: ZoneYear; onChange: (year: ZoneYear) => void }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative">
      <div className="absolute inset-x-3 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[repeating-linear-gradient(90deg,#D8C7A6_0_14px,transparent_14px_22px)]" aria-hidden="true" />
      <div className="relative grid grid-cols-6 gap-1.5" role="group" aria-label="Elegir elección">
        {ZONE_YEARS.map((year) => {
          const isActive = value === year;
          return (
            <button
              key={year}
              type="button"
              onClick={() => onChange(year)}
              aria-pressed={isActive}
              className={`relative rounded-lg border-2 px-1 py-2 font-mono text-xs font-bold tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B83A78] sm:text-sm ${isActive ? 'border-[#C2006A] text-white' : 'border-[#E2D5C2] bg-[#FBF6EE] text-[#5B5262] hover:border-[#C9B79B]'}`}
            >
              {isActive && <motion.span layoutId="road-year" className="absolute inset-0 rounded-[6px] bg-[#C2006A]" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} aria-hidden="true" />}
              <span className="relative z-10">{year}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Barra horizontal en la misma escala 0–100% para cualquier categoría. */
function ScaleBar({ value, color }: { value: number | null; color: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative h-2.5 overflow-hidden rounded-full bg-[#EFE6D8]" aria-hidden="true">
      {[25, 50, 75].map((tick) => <span key={tick} className="absolute inset-y-0 w-px bg-white" style={{ left: `${tick}%` }} />)}
      {value !== null && <motion.span className="absolute inset-y-0 left-0 rounded-full" style={{ backgroundColor: color }} initial={false} animate={{ width: `${value}%` }} transition={reduceMotion ? { duration: 0 } : { duration: 0.6, ease: EASE }} />}
    </div>
  );
}

function ZoneCard({ zone, value }: { zone: Zone; value: number | null }) {
  const meta = ZONE_META[zone];
  return (
    <li className="relative overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-[#EADFCF]">
      <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: meta.color }} aria-hidden="true" />
      <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: meta.color }}>
        <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: meta.color }} aria-hidden="true" />{meta.label}
      </p>
      {value !== null ? (
        <p className="mt-2 text-3xl font-semibold tracking-tight text-[#1C2541]"><AnimatedNumber value={value} decimals={1} /><span className="text-lg text-slate-400">%</span></p>
      ) : (
        <p className="mt-2 text-sm font-medium leading-snug text-[#5B5262]">Sin dato publicado<span className="block text-xs font-normal">para este año</span></p>
      )}
      <div className="mt-3"><ScaleBar value={value} color={meta.color} /></div>
    </li>
  );
}

/** Mancuernas: urbana frente a rural (o no urbana) en las seis elecciones, en una escala común. */
function GapTrail({ year, onSelect }: { year: ZoneYear; onSelect: (year: ZoneYear) => void }) {
  const min = 40;
  const max = 70;
  const pos = (value: number) => `${((value - min) / (max - min)) * 100}%`;
  return (
    <ul className="space-y-2.5" aria-label="Participación urbana frente a rural por elección">
      {ZONE_YEARS.map((item) => {
        const record = ZONE_DATA[item];
        const other = record.values.rural ?? record.noUrbana;
        const otherLabel = record.values.rural !== null ? 'rural' : 'no urbana';
        const urbana = record.values.urbana;
        const isActive = item === year;
        return (
          <li key={item}>
            <button type="button" onClick={() => onSelect(item)} aria-pressed={isActive} aria-label={`${item}: urbana ${urbana}%, ${otherLabel} ${other}%`} className={`grid w-full grid-cols-[3rem_1fr_4.5rem] items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B83A78] ${isActive ? 'bg-[#FBEAF1]' : 'hover:bg-[#F6EEE2]'}`}>
              <span className={`font-mono text-xs font-bold tabular-nums ${isActive ? 'text-[#B83A78]' : 'text-[#5B5262]'}`}>{item}</span>
              <span className="relative h-5" aria-hidden="true">
                <span className="absolute inset-x-0 top-1/2 h-px bg-[#E2D5C2]" />
                {urbana !== null && other !== null && (
                  <span className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#CDBFAA]" style={{ left: pos(Math.min(urbana, other)), width: `calc(${pos(Math.max(urbana, other))} - ${pos(Math.min(urbana, other))})` }} />
                )}
                {urbana !== null && <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-white" style={{ left: pos(urbana), backgroundColor: ZONE_META.urbana.color }} />}
                {other !== null && <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-white" style={{ left: pos(other), backgroundColor: record.values.rural !== null ? ZONE_META.rural.color : PALETTE.ink }} />}
              </span>
              <span className="text-right text-xs font-semibold tabular-nums text-[#1C2541]">{urbana !== null && other !== null ? `${other - urbana >= 0 ? '+' : ''}${(other - urbana).toFixed(1)} pts` : 's/d'}</span>
            </button>
          </li>
        );
      })}
      <li className="grid grid-cols-[3rem_1fr_4.5rem] gap-3 px-2 text-[11px] text-[#5B5262]" aria-hidden="true">
        <span />
        <span className="flex justify-between"><span>{min}%</span><span>55%</span><span>{max}%</span></span>
        <span />
      </li>
    </ul>
  );
}

export function UrbanoRuralPage() {
  const reduceMotion = useReducedMotion();
  const [year, setYear] = useState<ZoneYear>(2024);
  const record = ZONE_DATA[year];
  const gap = gapFor(year);

  return (
    <div className="min-h-screen bg-[#FBF9FB] font-sans text-[#1C2541]">
      <Navbar />
      <HeaderUrbanoRural />

      <main className="mx-auto max-w-[1280px] px-4 pb-12 pt-6 sm:px-6 lg:px-10 lg:pt-8">
        {/* Tablero: selector, escena con datos e indicadores */}
        <section className="rounded-[28px] bg-white p-3 shadow-[0_24px_50px_-36px_rgba(28,37,65,0.4)] ring-1 ring-[#EADFCF] sm:p-5" aria-labelledby="scene-title">
          <div className="flex flex-col gap-4 px-2 pb-4 pt-2 sm:px-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#A00056]">Misma escala, tres territorios</p>
              <h2 id="scene-title" className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-[1.7rem]">¿Cuánto votó cada tipo de sección?</h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#5B5262]">La altura de cada columna de boletas es su participación. Elige una elección para ver cómo cambia.</p>
            </div>
            <div className="w-full lg:w-[430px]"><YearRoad value={year} onChange={setYear} /></div>
          </div>
          <div className="overflow-hidden rounded-[20px] ring-1 ring-[#EADFCF]">
          <TerritoryDiorama year={year} />
          </div>
          <p className="mt-2 text-center text-[11px] text-[#5B5262] sm:hidden">Desliza la ilustración para ver todo el territorio →</p>

          <div className="mt-3 grid gap-3 rounded-[20px] bg-[#FBF6EE] p-3 lg:grid-cols-[1fr_260px]">
            <ul className="grid gap-3 sm:grid-cols-3" aria-live="polite">
              {ZONES.map((zone) => <ZoneCard key={zone} zone={zone} value={record.values[zone]} />)}
            </ul>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={year}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="flex flex-col justify-center rounded-2xl bg-[#FBEAF1] p-5 text-[#1C2541] ring-1 ring-[#F1D3DE]"
              >
                <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#A00056]">Diferencia · {year}</p>
                {gap ? (
                  <>
                    <p className="mt-2 text-4xl font-semibold tabular-nums">{gap.value >= 0 ? '+' : ''}<AnimatedNumber value={gap.value} decimals={1} /><span className="ml-1.5 text-base font-medium text-[#B83A78]">pts</span></p>
                    <p className="mt-1 text-sm text-[#5B5262]">{gap.label}</p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-[#5B5262]">No hay datos suficientes para calcularla.</p>
                )}
                {record.noUrbana !== null && record.values.rural !== null && (
                  <p className="mt-3 border-t border-[#F1D3DE] pt-3 text-xs text-[#5B5262]">No urbana (mixta + rural): <strong className="font-semibold text-[#1C2541]">{record.noUrbana.toFixed(1)}%</strong></p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Fuente del año */}
          <div className="mt-3 flex flex-col gap-2 rounded-2xl px-4 py-2 sm:px-3 text-xs leading-relaxed text-[#5B5262] sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-2.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B83A78]" aria-hidden="true" />
              <div>
                <p><strong className="font-semibold text-[#1C2541]">{record.study}.</strong> {record.notes.join(' ')}</p>
              </div>
            </div>
            <a href={record.source.href} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#B83A78] hover:underline">
              Ver fuente <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
          <Reveal className="rounded-[28px] bg-white p-5 ring-1 ring-[#EADFCF] sm:p-7" aria-labelledby="trail-title">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#B83A78]">Seis elecciones</p>
            <h2 id="trail-title" className="mt-2 text-2xl font-semibold tracking-tight">La distancia entre ciudad y campo</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5B5262]">Cada fila une la participación urbana con la rural (o con el total no urbano cuando es lo único publicado). Toca un año para verlo en la escena.</p>
            <div className="mt-5"><GapTrail year={year} onSelect={setYear} /></div>
            <ul className="mt-4 flex flex-wrap gap-4 text-xs text-[#5B5262]">
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: ZONE_META.urbana.color }} aria-hidden="true" />Urbana</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: ZONE_META.rural.color }} aria-hidden="true" />Rural</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PALETTE.ink }} aria-hidden="true" />No urbana (solo 2009)</li>
            </ul>
          </Reveal>

          <Reveal className="rounded-[28px] bg-[#EEF2EC] p-5 sm:p-7" aria-labelledby="read-title" delay={0.08}>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#5F8159]">Cómo leer estos datos</p>
            <h2 id="read-title" className="mt-2 text-2xl font-semibold tracking-tight">Lo que muestran y lo que no</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#3F4A3D]">
              {[
                { icon: Layers, title: 'Tres tipos de sección', body: ZONES.map((zone) => `${ZONE_META[zone].label}: ${ZONE_META[zone].definition.toLowerCase()}`).join(' ') },
                { icon: Microscope, title: 'Fuentes distintas', body: 'Salvo 2012, las cifras vienen de estudios muestrales del INE, no de los Conteos Censales de las otras historias. Cada año usa su propia muestra.' },
                { icon: Ban, title: 'Sin causas', body: 'Una diferencia de participación no explica por qué ocurre; estos datos solo describen cuánto votó cada tipo de sección.' },
              ].map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3 rounded-2xl bg-white/70 p-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#5F8159] ring-1 ring-[#DCE5D6]"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                  <p><strong className="block font-semibold text-[#1C2541]">{title}</strong>{body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </main>

      <DataFooter
        description="Después de recorrer el territorio, abre el libro de hallazgos: patrones que aparecen al mirar todos los datos juntos."
        primaryHref="/datos/hallazgos"
        primaryLabel="Abrir el libro de hallazgos"
        secondaryHref="/datos"
        secondaryLabel="Explorar todas las historias"
        source="Fuentes: Estudios muestrales sobre la participación ciudadana 2009, 2015, 2018, 2021 y 2024, y estudio censal 2012 (IFE/INE). La fuente de cada año aparece junto a la escena."
        sourceHref={record.source.href}
      />
    </div>
  );
}
