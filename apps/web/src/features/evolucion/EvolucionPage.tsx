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
    <div className="min-h-screen bg-[#FBF9FB] flex flex-col font-sans selection:bg-dalia-200 selection:text-brand-navy">
      <Navbar />
      
      {/* 1. Hero exacto a ancho completo directamente bajo el Navbar */}
      <HeaderEvolucion />
      
      {/* 2. Contenedor principal sin sobreposición sobre el Hero */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 mt-6 sm:mt-8 lg:mt-10 relative z-20">
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

      {/* Footer integrado y rediseñado en blanco con detalles de contraste */}
      <footer className="w-full bg-white border-t border-slate-200/80 mt-16 pt-16 pb-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          {/* Bloque: ¿Quieres seguir explorando? */}
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <span className="text-[11px] font-bold tracking-widest uppercase bg-pink-50 text-[#E3007E] border border-pink-200/80 px-4 py-1.5 rounded-full mb-4 font-mono shadow-xs">
              CONTINÚA EL RECORRIDO
            </span>
            <h3 className="text-3xl md:text-4xl font-black text-brand-navy tracking-tight mb-4">
              ¿Quieres seguir explorando?
            </h3>
            <p className="text-base md:text-lg text-slate-600 font-medium mb-8 max-w-xl leading-relaxed">
              Después de conocer la evolución general, descubre otras historias detrás de los datos de participación ciudadana en el mapa y la narrativa.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
              <Link 
                href="/datos" 
                className="w-full sm:w-auto bg-[#E3007E] hover:bg-[#C2006A] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-pink-600/20 flex items-center justify-center gap-2 hover:scale-[1.02] text-sm"
              >
                Explorar otras historias <ArrowRight className="w-4 h-4" />
              </Link>
              <a 
                href="https://computos2024.ine.mx" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-brand-navy hover:text-black font-bold transition-all flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm"
              >
                Consultar datos del CCPC <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>
            </div>
          </div>

          {/* Fila: Fuente oficial CCPC */}
          <div className="mt-14 p-5 sm:px-8 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E3007E] ring-4 ring-pink-100 shrink-0" />
              <span className="text-slate-600 font-medium font-mono text-[11px] sm:text-xs text-center sm:text-left">
                Fuente: Instituto Nacional Electoral, Conteos Censales de Participación Ciudadana 2009–2024.
              </span>
            </div>
            <a 
              href="https://computos2024.ine.mx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#E3007E] hover:text-[#BE185D] font-bold flex items-center gap-1.5 transition-colors font-mono uppercase tracking-wider text-[11px] shrink-0"
            >
              Consultar datos completos en el CCPC del INE →
            </a>
          </div>

          {/* Fila inferior institucional */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-3">
              <span className="font-black text-brand-navy tracking-wider text-sm">INE</span>
              <div className="w-px h-3.5 bg-slate-200" />
              <span className="text-slate-500">Democracia que florece</span>
              <div className="w-px h-3.5 bg-slate-200 hidden sm:block" />
              <span className="text-pink-600 font-mono text-[11px] hidden sm:inline">Plataforma Dalias</span>
            </div>
            <div className="text-slate-400 font-mono text-[11px]">
              Reto 3: Visualización con Impacto Público
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
