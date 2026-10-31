'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Info } from 'lucide-react';
import { EASE, Reveal } from '@/shared/components/motion';

const SOURCES = [
  {
    title: 'Conteos Censales · agregado y sexo',
    kind: 'Datos oficiales · INE',
    status: '#6E9A63',
    detail: 'Agregados derivados de las marcas en cuadernillos de la lista nominal. La serie federal cubre 2009, 2012, 2015, 2018, 2021 y 2024; el sexo no especificado y otros registros sin clasificación se reportan aparte.',
    stories: ['Evolución', 'Edades', 'Hallazgos', 'Mujeres y hombres', 'Cifras de esta página'],
    href: 'https://portal.ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/',
  },
  {
    title: 'Conteos Censales · cifras por entidad',
    kind: 'Datos oficiales · INE',
    status: '#6E9A63',
    detail: 'Agregados de los archivos abiertos del INE para las 32 entidades y las seis elecciones. Participación = votaron ÷ (votaron + no votaron); los registros sin clasificación se muestran por separado.',
    stories: ['Estados'],
    href: 'https://portal.ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/',
  },
  {
    title: 'Estudios por tipo de sección',
    kind: 'Estudios oficiales · INE/IFE',
    status: '#6E9A63',
    detail: 'La historia urbano-rural combina estudios muestrales de 2009, 2015, 2018, 2021 y 2024 con el estudio censal de 2012. Cada año puede usar categorías y métodos distintos; solo se muestran los valores publicados por la fuente.',
    stories: ['Urbano y rural'],
    href: 'https://portal.ine.mx/estudios-censales-muestrales-participacion-ciudadana/',
  },
];

export function SourcesPanel() {
  const reduceMotion = useReducedMotion();
  return (
    <Reveal className="rounded-3xl border border-[#F0C9DA] bg-gradient-to-br from-[#FFF0F6] via-[#FCEAF2] to-[#FFF4F7] p-6 shadow-[0_18px_42px_-30px_rgba(169,46,90,0.32)] sm:p-8 md:p-10" aria-labelledby="sources-title">
      <div className="mb-6 flex items-center gap-2 text-[#8A6476]">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FCE6EF] text-[#C53A72]"><Info className="h-5 w-5" aria-hidden="true" /></span>
        <h2 id="sources-title" className="text-sm font-bold uppercase tracking-widest">Fuentes de información</h2>
      </div>
      <p className="max-w-2xl font-medium leading-relaxed text-brand-navy/70">
        Las cifras de esta sección ya están vinculadas con fuentes del INE. Aquí distinguimos los conteos censales nacionales y estatales de los estudios muestrales, que tienen su propio universo y metodología.
      </p>
      <ul className="mt-7 grid gap-4 md:grid-cols-3">
        {SOURCES.map((source, index) => (
          <motion.li
            key={source.title}
            className="flex flex-col rounded-2xl border border-[#EEE3E4] bg-white/80 p-5 transition-colors hover:border-[#E8C5D3]"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08, ease: EASE }}
          >
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-[#E4E2DE]"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: source.status }} aria-hidden="true" />{source.kind}</span>
            <h3 className="mt-3 text-base font-semibold text-brand-navy">{source.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{source.detail}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Historias que la usan">
              {source.stories.map((story) => <li key={story} className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-[#ECEAE5]">{story}</li>)}
            </ul>
            {source.href && (
              <a href={source.href} target="_blank" rel="noreferrer" className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-[#A00056] hover:underline">
                Consultar fuente<ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
          </motion.li>
        ))}
      </ul>
    </Reveal>
  );
}
