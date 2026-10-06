'use client';

import { useState } from 'react';
import { Navbar } from '@/shared/components/Navbar';
import { HeaderEvolucion } from './components/HeaderEvolucion';
import { TimelineVisualization } from './components/TimelineVisualization';
import { StatsGrid } from './components/StatsGrid';
import { ChangeComparison } from './components/ChangeComparison';
import { TIMELINE_DATA } from './constants';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';

export function EvolucionPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const selectedData = TIMELINE_DATA.find(d => d.year === selectedYear);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-dalia-200 selection:text-brand-navy">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-12 md:py-16">
        <HeaderEvolucion />
        
        <TimelineVisualization 
          selectedYear={selectedYear} 
          onSelectYear={setSelectedYear} 
        />
        
        <StatsGrid data={selectedData} />
        
        <ChangeComparison />
        
        {/* CTA Section */}
        <section className="bg-[#FAFAFA] border border-gray-100 rounded-3xl p-12 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <h3 className="text-3xl font-bold text-brand-navy mb-4">¿Quieres seguir explorando?</h3>
          <p className="text-lg text-gray-500 font-medium mb-8 max-w-xl">
            Después de conocer la evolución general, descubre otras historias detrás de los datos de participación ciudadana.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link href="/datos" className="bg-brand-navy text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-blue transition-colors flex items-center gap-2">
              Explorar otras historias <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#" className="text-brand-navy font-bold hover:text-dalia-600 transition-colors flex items-center gap-2 px-8 py-4">
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
        </div>
      </footer>
    </div>
  );
}
