'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ClipboardList, Percent, UserX, Users } from 'lucide-react';
import { AnimatedNumber, EASE, Reveal } from '@/shared/components/motion';
import { NATIONAL } from '@/features/hallazgos/data';

type Metric = {
  id: string;
  label: string;
  icon: typeof Percent;
  color: string;
  tint: string;
  value: (row: (typeof NATIONAL)[number]) => number;
  format: 'percent' | 'millions';
  note: (row: (typeof NATIONAL)[number]) => string;
  href: string;
  linkLabel: string;
};

/** Acentos suaves para que las métricas se distingan sin competir con los datos. */
const ACCENT = '#C53A72';
const INK_SOFT = '#9AA0A8';

const METRICS: Metric[] = [
  {
    id: 'participacion', label: 'Participación ciudadana', icon: Percent, color: '#C53A72', tint: '#FCE6EF',
    value: (row) => row.rate, format: 'percent',
    note: () => 'Sí votaron ÷ registros clasificados',
    href: '/datos/evolucion', linkLabel: 'Ver evolución',
  },
  {
    id: 'abstencion', label: 'Abstención', icon: UserX, color: '#D17A3F', tint: '#FFF0DF',
    value: (row) => 100 - row.rate, format: 'percent',
    note: () => 'No votaron ÷ registros clasificados',
    href: '/datos/hallazgos#vaiven', linkLabel: 'Ver hallazgo',
  },
  {
    id: 'votaron', label: 'Personas que votaron', icon: Users, color: '#4E83C5', tint: '#EAF2FC',
    value: (row) => row.voted / 1e6, format: 'millions',
    note: (row) => `${row.voted.toLocaleString('es-MX')} registros`,
    href: '/datos/edades', linkLabel: 'Ver por edad',
  },
  {
    id: 'lista', label: 'Lista nominal en el conteo', icon: ClipboardList, color: '#548A70', tint: '#E8F4EC',
    value: (row) => row.nominal / 1e6, format: 'millions',
    note: (row) => `${row.unspecifiedShare.toFixed(1)}% sin participación especificada`,
    href: '/datos/hallazgos#paginas-en-blanco', linkLabel: 'Ver hallazgo',
  },
];

function Sparkline({ metric, activeYear }: { metric: Metric; activeYear: number }) {
  const values = NATIONAL.map((row) => metric.value(row));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 160;
  const height = 40;
  const x = (index: number) => 4 + (index * (width - 8)) / (values.length - 1);
  const y = (value: number) => 4 + ((max - value) / (max - min || 1)) * (height - 8);
  const activeIndex = NATIONAL.findIndex((row) => row.year === activeYear);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-full" aria-hidden="true">
      <polyline points={values.map((value, index) => `${x(index)},${y(value)}`).join(' ')} fill="none" stroke={metric.color} strokeOpacity="0.42" strokeWidth="2" strokeLinejoin="round" />
      {values.map((value, index) => (
        <rect key={index} x={x(index) - 2.5} y={y(value) - 2.5} width="5" height="5" fill={index === activeIndex ? metric.color : '#FFFFFF'} stroke={index === activeIndex ? metric.color : INK_SOFT} strokeWidth="1.5" style={{ transition: 'fill .25s' }} />
      ))}
    </svg>
  );
}

export function ParticipationFigures() {
  const reduceMotion = useReducedMotion();
  const [year, setYear] = useState(NATIONAL[NATIONAL.length - 1].year);
  const index = NATIONAL.findIndex((row) => row.year === year);
  const row = NATIONAL[index];
  const previous = index > 0 ? NATIONAL[index - 1] : null;

  return (
    <Reveal className="mb-16 rounded-[2rem] border border-[#F0D8E2] bg-gradient-to-br from-[#FFF7FA] via-white to-[#FFF9F0] p-5 shadow-[0_18px_45px_-34px_rgba(169,46,90,0.24)] sm:mb-20 sm:p-7 lg:p-8" aria-labelledby="figures-title">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#FCE6EF] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#A00056]"><span className="h-1.5 w-1.5 rounded-full bg-[#D94C83]" aria-hidden="true" />Más datos</p>
          <h2 id="figures-title" className="text-3xl font-bold tracking-tight text-brand-navy">La participación en cifras</h2>
          <p className="mt-2 max-w-xl text-base font-medium text-slate-500">Agregado nacional de los Conteos Censales del INE. Elige una elección y compárala con las demás.</p>
        </div>
        <div className="grid grid-cols-6 gap-1 rounded-xl border border-[#F0D8E2] bg-white/80 p-1 shadow-[0_4px_14px_-10px_rgba(169,46,90,0.35)]" role="group" aria-label="Elegir elección">
          {NATIONAL.map((item) => {
            const isActive = item.year === year;
            return (
              <button key={item.year} type="button" onClick={() => setYear(item.year)} aria-pressed={isActive} className={`relative rounded-lg px-2 py-1.5 font-mono text-xs font-bold tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#CB3E67] sm:px-3 sm:text-sm ${isActive ? 'text-white' : 'text-slate-500 hover:text-brand-navy'}`}>
                {isActive && <motion.span layoutId="figures-year" className="absolute inset-0 rounded-lg bg-gradient-to-b from-[#E05A80] to-[#CB3E67] shadow-[0_2px_0_#91344F]" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} aria-hidden="true" />}
                <span className="relative">{item.year}</span>
              </button>
            );
          })}
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
        {METRICS.map((metric, metricIndex) => {
          const Icon = metric.icon;
          const value = metric.value(row);
          const delta = previous ? value - metric.value(previous) : null;
          return (
            <motion.li
              key={metric.id}
              className="group flex flex-col rounded-2xl border border-[#EFE3E7] bg-white/90 p-5 transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-[#E8C5D3] hover:shadow-[0_16px_34px_-24px_rgba(169,46,90,0.38)]"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: metricIndex * 0.08, ease: EASE }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: metric.tint, color: metric.color }}><Icon className="h-4 w-4" aria-hidden="true" /></span>
                <h3 className="text-sm font-semibold leading-tight text-slate-600">{metric.label}</h3>
              </div>
              <p className="mt-5 text-4xl font-bold tracking-tight text-brand-navy">
                <AnimatedNumber value={value} decimals={1} />
                <span className="ml-0.5 text-xl font-semibold text-slate-400">{metric.format === 'percent' ? '%' : ' M'}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">{metric.note(row)}</p>
              <div className="mt-4"><Sparkline metric={metric} activeYear={year} /></div>
              <div className="mt-3 flex flex-col items-start gap-2 border-t border-[#F0EEEA] pt-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                <span className="tabular-nums text-slate-500">
                  {delta === null ? 'Primera elección de la serie' : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}${metric.format === 'percent' ? ' pts' : ' M'} vs ${previous!.year}`}
                </span>
                <Link href={metric.href} className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-[#A00056] transition-colors hover:underline">
                  {metric.linkLabel}<ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </Reveal>
  );
}
