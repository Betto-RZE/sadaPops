'use client';

import React from 'react';
import { ArrowRight, Flower2 } from 'lucide-react';
import { cn } from '@/shared/utils';

interface ExplorarMapaButtonProps {
  className?: string;
  onClick?: () => void;
}

export function ExplorarMapaButton({ className, onClick }: ExplorarMapaButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    // Desplazamiento suave al contenedor del mapa interactivo
    const mapElement = document.getElementById('mapa-interactivo');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group inline-flex items-center gap-3.5 rounded-full bg-dalia-600 hover:bg-[#C9006F] text-white px-7 py-3.5 text-sm md:text-base font-bold tracking-tight shadow-xl shadow-dalia-600/30 hover:shadow-dalia-600/50 transition-all duration-300 hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-4 focus:ring-dalia-600/30",
        className
      )}
    >
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 text-white transition-transform group-hover:rotate-45 duration-300">
        <Flower2 className="w-4 h-4" />
      </div>
      <span>Explorar el mapa</span>
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-200" />
    </button>
  );
}
