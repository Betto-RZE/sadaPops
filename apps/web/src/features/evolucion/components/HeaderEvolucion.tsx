import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function HeaderEvolucion() {
  return (
    <header className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <Link 
          href="/datos" 
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-navy transition-colors tracking-wide uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a explorar
        </Link>
        <div className="text-xs font-bold text-dalia-600 tracking-widest uppercase">
          INE · DATOS ABIERTOS CCPC
        </div>
      </div>
      
      <div className="max-w-4xl">
        <h2 className="text-sm font-bold text-dalia-600 tracking-widest uppercase mb-4">
          CAPÍTULO 1 • CRONOLOGÍA ELECTORAL 2000–2024
        </h2>
        <h1 className="text-5xl md:text-[64px] font-black tracking-tight text-brand-navy mb-6 leading-[1.1]">
          ¿Cómo ha cambiado la participación?
        </h1>
        <p className="text-xl md:text-2xl text-brand-navy/70 font-medium leading-relaxed max-w-3xl">
          Una mirada al pulso democrático de México: la alternancia entre elecciones intermedias y presidenciales, y el crecimiento progresivo de la memoria cívica.
        </p>
      </div>
    </header>
  );
}
