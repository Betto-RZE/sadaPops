'use client';

import Image from 'next/image';
import { pixelFont } from '../fonts';

export function HeaderEvolucion() {
  return (
    <header className="relative w-full bg-[#334155] overflow-hidden">
      {/* Contenedor del Hero con altura optimizada para evitar sobre-escalado y pixeleado excesivo */}
      <div className="relative w-full max-w-[1360px] mx-auto h-[440px] sm:h-[490px] md:h-[540px] overflow-hidden">
        
        {/* 1. Imagen base en alta resolución */}
        <Image
          src="/hero_clean.jpg"
          alt="Aula cívica del INE con gráfica de dalias de participación en el pizarrón"
          fill
          priority
          className="object-cover object-center select-none pointer-events-none filter brightness-[0.97]"
          sizes="(max-width: 1360px) 100vw, 1360px"
        />

        {/* 2. Filtro grisáceo traslúcido para suavizar bordes y disimular artefactos de la imagen */}
        <div 
          className="absolute inset-0 bg-slate-700/25 backdrop-blur-[0.5px] pointer-events-none z-[2]" 
          aria-hidden="true" 
        />

        {/* 3. Textos sobre el área de la ventana (cielo atardecer) */}
        <div className="absolute top-[8%] sm:top-[10%] md:top-[12%] left-[4%] sm:left-[5%] md:left-[6%] z-10 max-w-[340px] sm:max-w-[400px] md:max-w-[460px]">
          {/* Badge de capítulo */}
          <div className="mb-2 sm:mb-3">
            <span className={`${pixelFont.className} bg-white/95 text-[#E3007E] border border-pink-200/90 px-2.5 py-0.5 rounded shadow-sm text-[10px] sm:text-xs md:text-sm font-bold tracking-wider uppercase inline-block`}>
              CAPÍTULO 1 • CRONOLOGÍA ELECTORAL 2009–2024
            </span>
          </div>

          {/* Título en dos renglones pixel art */}
          <h1 className={`${pixelFont.className} text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-[#1C2541] tracking-tight leading-[1.05] mb-2 sm:mb-3 drop-shadow-sm`}>
            ¿Cómo ha cambiado<br />la participación?
          </h1>

          {/* Barra rosa INE */}
          <div className="w-12 sm:w-14 h-1 sm:h-1.5 bg-[#E3007E] rounded-full mb-3 sm:mb-4 shadow-sm" />

          {/* Párrafo descriptivo */}
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#1C2541]/95 font-medium leading-snug sm:leading-relaxed max-w-[320px] sm:max-w-[380px] md:max-w-[420px] drop-shadow-sm">
            Una mirada al pulso democrático de México: la alternancia entre elecciones intermedias y presidenciales, y el crecimiento progresivo de la memoria cívica.
          </p>
        </div>

      </div>
    </header>
  );
}
