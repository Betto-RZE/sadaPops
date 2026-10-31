'use client';

import { useState } from 'react';
import { Navbar } from '@/shared/components/Navbar';
import { HeaderEvolucion } from './components/HeaderEvolucion';
import { TimelineVisualization } from './components/TimelineVisualization';
import { StatsGrid } from './components/StatsGrid';
import { ChangeComparison } from './components/ChangeComparison';
import { PARTICIPATION_DATA } from './constants';
import { DataFooter } from '@/shared/components/DataFooter';
import { LandingFooter } from '@/shared/components/LandingFooter';

export function EvolucionPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const selectedData = PARTICIPATION_DATA.find((d) => d.year === selectedYear);

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans selection:bg-dalia-200 selection:text-brand-navy">
      <Navbar />
      
      {/* 1. Hero exacto a ancho completo directamente bajo el Navbar */}
      <HeaderEvolucion />
      
      {/* 2. Contenedor principal sin sobreposición sobre el Hero */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 mt-6 sm:mt-8 lg:mt-10 relative z-20">
        <section className="max-w-5xl mx-auto mb-6 sm:mb-8 grid gap-2 md:grid-cols-[0.9fr_1.1fr] md:items-end md:gap-8">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-brand-navy">
            Un recorrido con subidas y bajadas
          </h2>
          <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600">
            La línea conecta el porcentaje de participación de cada elección. Elige un año o inicia el recorrido para seguir sus cambios hasta 2024.
          </p>
        </section>

        <TimelineVisualization 
          selectedYear={selectedYear} 
          onSelectYear={setSelectedYear} 
        />
        
        <StatsGrid data={selectedData} />
        
        <ChangeComparison 
          selectedYear={selectedYear}
          onSelectYear={setSelectedYear}
        />
        
      </main>

      <DataFooter
        description="Después de conocer la evolución general, explora otras historias sobre la participación ciudadana."
        primaryHref="/datos"
        primaryLabel="Explorar otras historias"
        secondaryHref="/datos/genero"
        secondaryLabel="Comparar por género"
        source="Fuente: Conteos Censales de Participación Ciudadana 2009–2024, Instituto Nacional Electoral."
      />

      <LandingFooter />
    </div>
  );
}
