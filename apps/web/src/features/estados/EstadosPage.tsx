'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { Navbar } from '@/shared/components/Navbar';
import { DataFooter } from '@/shared/components/DataFooter';
import { STATE_SAMPLES } from './constants';
import { HeaderEstados } from './components/HeaderEstados';
import { StateExplorer } from './components/StateExplorer';
import { StateDuel } from './components/StateDuel';
import { Reveal } from './components/ui';
import { StatewideOverview } from './components/StatewideOverview';

export function EstadosPage() {
  const [primary, setPrimary] = useState(STATE_SAMPLES.find((state) => state.id === '19')!);
  const [opponent, setOpponent] = useState(STATE_SAMPLES.find((state) => state.id === '20')!);
  const [year, setYear] = useState(2024);

  return (
    <div className="min-h-screen bg-transparent font-sans text-[#1C2541]">
      <Navbar />
      <HeaderEstados />

      <main className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 lg:px-12 lg:py-10">
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#F5D5E4] bg-white/70 px-4 py-3 text-sm leading-relaxed text-[#6B5A68]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#C2006A]" aria-hidden="true" />
          <p><strong className="font-semibold text-[#1C2541]">Datos oficiales por entidad.</strong> Totales agregados de los Conteos Censales de Participación Ciudadana del INE para las elecciones federales de 2009 a 2024.</p>
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

        <Reveal>
          <StatewideOverview year={year} />
        </Reveal>
      </main>

      <DataFooter
        description="Sigue explorando otras preguntas sobre participación ciudadana."
        primaryHref="/datos/evolucion"
        primaryLabel="Ver evolución temporal"
        secondaryHref="/datos"
        secondaryLabel="Volver a las historias"
        source="Fuente: Conteos Censales de Participación Ciudadana 2009–2024, Instituto Nacional Electoral."
        sourceHref="https://portal.ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/"
      />
    </div>
  );
}
