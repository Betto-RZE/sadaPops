'use client';

import { useState } from 'react';
import { Navbar } from '@/shared/components/Navbar';
import { HeaderEvolucion } from './components/HeaderEvolucion';
import { TimelineVisualization } from './components/TimelineVisualization';
import { StatsGrid } from './components/StatsGrid';
import { ChangeComparison } from './components/ChangeComparison';
import { PARTICIPATION_DATA } from './constants';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';

export function EvolucionPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const selectedData = PARTICIPATION_DATA.find((d) => d.year === selectedYear);

  return (
    <div className="min-h-screen bg-[#FDFCFD] flex flex-col font-sans selection:bg-dalia-200 selection:text-brand-navy">
      <Navbar />
      
      {/* 1. Hero exacto a ancho completo directamente bajo el Navbar */}
      <HeaderEvolucion />
      
      {/* 2. Contenedor principal con superposición visual sobre la base del Hero */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 -mt-6 sm:-mt-10 lg:-mt-14 relative z-20">
        <TimelineVisualization 
          selectedYear={selectedYear} 
          onSelectYear={setSelectedYear} 
        />
        
        <StatsGrid data={selectedData} />
        
        <ChangeComparison 
          selectedYear={selectedYear}
          onSelectYear={setSelectedYear}
        />
        
        {/* Fuente institucional oficial CCPC */}
        <div className="flex flex-col sm:flex-row justify-between items-center py-6 px-8 bg-white rounded-2xl border border-gray-100 mb-12 gap-4 text-xs shadow-sm">
          <span className="text-gray-500 font-medium">
            Fuente: Instituto Nacional Electoral, Conteos Censales de Participación Ciudadana 2009–2024.
          </span>
          <a 
            href="https://computos2024.ine.mx" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-dalia-600 hover:text-brand-navy font-bold flex items-center gap-1.5 transition-colors"
          >
            Consultar datos completos en el CCPC del INE →
          </a>
        </div>

        {/* Sección de Exploración Continua */}
        <section className="bg-white border border-gray-100 rounded-3xl p-12 text-center flex flex-col items-center shadow-sm">
          <h3 className="text-3xl font-bold text-brand-navy mb-4">¿Quieres seguir explorando?</h3>
          <p className="text-lg text-gray-500 font-medium mb-8 max-w-xl">
            Después de conocer la evolución general, descubre otras historias detrás de los datos de participación ciudadana.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link href="/datos" className="bg-brand-navy text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-blue transition-colors flex items-center gap-2">
              Explorar otras historias <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="https://computos2024.ine.mx" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-navy font-bold hover:text-dalia-600 transition-colors flex items-center gap-2 px-8 py-4"
            >
              Consultar datos del CCPC <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>

      <footer className="w-full py-8 text-center text-[10px] font-bold tracking-widest uppercase text-gray-400 border-t border-gray-100 bg-white mt-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <span className="text-brand-navy">INE</span>
            <div className="w-px h-3 bg-gray-300"></div>
            <span>Democracia que florece</span>
          </div>
          <div>
            <span>Reto 3: Visualización con Impacto Público</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
