'use client';

import { useState } from 'react';
import { Navbar } from '@/shared/components/Navbar';
import { HeaderGenero } from './components/HeaderGenero';
import { TugOfWarSection } from './components/TugOfWarSection';
import { StorytellingGenero } from './components/StorytellingGenero';
import { GENDER_MOCK_DATA } from './constants';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function GeneroPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const currentData = GENDER_MOCK_DATA[selectedYear] ?? GENDER_MOCK_DATA[2024];

  return (
    <div className="min-h-screen bg-[#FBF9FB] flex flex-col font-sans selection:bg-dalia-200 selection:text-brand-navy">
      <Navbar />

      {/* 1. Hero exacto a ancho completo directamente bajo el Navbar */}
      <HeaderGenero />

      {/* 2. Contenedor principal sin sobreposición sobre el Hero */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 mt-6 sm:mt-8 lg:mt-10 relative z-20">
        {/* Protagonista: la cuerda (incluye el selector de elección) */}
        <TugOfWarSection
          data={currentData}
          selectedYear={selectedYear}
          onSelectYear={setSelectedYear}
        />

        {/* ¿Qué nos dice este dato? */}
        <StorytellingGenero data={currentData} onSelectYear={setSelectedYear} />
      </main>

      {/* Footer integrado en blanco con detalles de contraste */}
      <footer className="w-full bg-white border-t border-slate-200/80 mt-16 pt-16 pb-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          {/* Bloque: Continuar el recorrido */}
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 font-mono">
              Continuar explorando
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-3">
              ¿Quieres seguir conociendo los datos?
            </h3>
            <p className="text-base text-slate-600 mb-6 max-w-xl leading-relaxed">
              Descubre cómo ha cambiado la participación a lo largo de 15 años o conoce el comportamiento por edades y regiones.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center w-full sm:w-auto">
              <Link 
                href="/datos/evolucion" 
                className="w-full sm:w-auto bg-[#E3007E] hover:bg-[#C2006A] text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm shadow-xs"
              >
                Ver evolución temporal <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/datos" 
                className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold transition-colors flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm shadow-xs"
              >
                Todas las preguntas <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Fila: Fuente oficial CCPC */}
          <div className="mt-12 p-4 sm:px-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
            <span className="text-slate-600 font-mono text-[11px] sm:text-xs text-center sm:text-left">
              Fuente: Instituto Nacional Electoral, Conteos Censales de Participación Ciudadana (CCPC).
            </span>
            <a 
              href="https://computos2024.ine.mx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#C2006A] hover:text-[#9E0054] font-semibold flex items-center gap-1 transition-colors font-mono uppercase tracking-wider text-[11px] shrink-0"
            >
              Consultar datos oficiales en el INE →
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
