'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeftRight, Info, Percent, TrendingUp, Users } from 'lucide-react';
import { Navbar } from '@/shared/components/Navbar';
import { DataFooter } from '@/shared/components/DataFooter';
import { STATE_SAMPLES } from './constants';
import { HeaderEstados } from './components/HeaderEstados';
import { StateExplorer } from './components/StateExplorer';
import { StateDuel } from './components/StateDuel';
import { EASE, Reveal } from './components/ui';

const INDICATORS = [
  { title: 'Tasa de participación', detail: 'Personas que votaron entre los casos clasificados.', icon: Percent },
  { title: 'Distancia del promedio nacional', detail: 'Cuántos puntos arriba o abajo del país.', icon: ArrowLeftRight },
  { title: 'Cambio entre elecciones', detail: 'Cómo subió o bajó la participación estatal.', icon: TrendingUp },
  { title: 'Personas participantes', detail: 'Conteo de votos y lista nominal como contexto.', icon: Users },
];

export function EstadosPage() {
  const reduceMotion = useReducedMotion();
  const [primary, setPrimary] = useState(STATE_SAMPLES.find((state) => state.id === '19')!);
  const [opponent, setOpponent] = useState(STATE_SAMPLES.find((state) => state.id === '20')!);
  const [year, setYear] = useState(2024);

  return (
    <div className="min-h-screen bg-[#FFF8FB] font-sans text-[#1C2541]">
      <Navbar />
      <HeaderEstados />

      <main className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 lg:px-12 lg:py-10">
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#F5D5E4] bg-white/70 px-4 py-3 text-sm leading-relaxed text-[#6B5A68]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#C2006A]" aria-hidden="true" />
          <p><strong className="font-semibold text-[#1C2541]">Datos oficiales por entidad.</strong> Totales agregados de los Conteos Censales de Participación Ciudadana del INE para 2021 y 2024.</p>
        </div>

        <StateExplorer state={primary} onStateChange={setPrimary} year={year} onYearChange={setYear} />

        <StateDuel
          primary={primary}
          opponent={opponent}
          onPrimaryChange={setPrimary}
          onOpponentChange={setOpponent}
          onSwap={() => { setPrimary(opponent); setOpponent(primary); }}
          year={year}
          onYearChange={setYear}
        />

        <Reveal className="mt-8 rounded-[28px] border border-[#F5D5E4] bg-white p-5 sm:p-8" aria-labelledby="indicators-title">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#C2006A]">Indicadores que completan la historia</p>
          <h2 id="indicators-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Más contexto para entender cada estado</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INDICATORS.map(({ title, detail, icon: Icon }, index) => (
              <motion.li
                key={title}
                className="rounded-2xl bg-[#FFF7FB] p-5 ring-1 ring-[#F5D5E4] transition-shadow hover:shadow-[0_12px_24px_-16px_rgba(194,0,106,0.5)]"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.08, ease: EASE }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#E3007E] shadow-sm ring-1 ring-[#F5D5E4]"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#6B5A68]">{detail}</p>
              </motion.li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-[#6B5A68]">El INE calcula la participación como sí votaron ÷ (sí votaron + no votaron); los casos no especificados se muestran por separado.</p>
        </Reveal>
      </main>

      <DataFooter
        description="Sigue explorando otras preguntas sobre participación ciudadana."
        primaryHref="/datos/evolucion"
        primaryLabel="Ver evolución temporal"
        secondaryHref="/datos"
        secondaryLabel="Volver a las historias"
        source="Fuente: Conteos Censales de Participación Ciudadana 2021 y 2024, Instituto Nacional Electoral."
        sourceHref="https://portal.ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/"
      />
    </div>
  );
}
