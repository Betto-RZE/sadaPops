'use client';

import Image from 'next/image';
import { pixelFont } from '../fonts';

export function HeaderEvolucion() {
  return (
    <header className="relative w-full bg-transparent pt-3 sm:pt-4 md:pt-6 pb-2 px-3 sm:px-6 lg:px-12">
      {/* Contenedor enmarcado del Hero: con bordes laterales y esquinas redondeadas en desktop para ajustar el tamaño */}
      <div className="relative w-full max-w-[1200px] mx-auto h-[440px] sm:h-[480px] md:h-[520px] lg:h-[550px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-[0_16px_45px_-12px_rgba(28,37,65,0.14)] bg-[#1C2541]">
        
        {/* 1. Imagen base en alta resolución con posicionamiento inteligente */}
        <Image
          src="/hero_widescreen.jpg"
          alt="Aula cívica del INE con gráfica de dalias de participación en el pizarrón"
          fill
          priority
          unoptimized
          className="object-cover object-[70%_center] sm:object-[65%_center] md:object-center select-none pointer-events-none [image-rendering:pixelated]"
          sizes="(max-width: 1200px) 100vw, 1200px"
        />

        {/* 2. Sutil degradado lateral que suaviza la iluminación bajo la tarjeta de texto */}
        <div 
          className="absolute inset-y-0 left-0 w-full sm:w-[60%] md:w-[50%] bg-gradient-to-r from-slate-900/30 via-slate-900/10 to-transparent pointer-events-none z-[2]" 
          aria-hidden="true" 
        />

        {/* 3. Tarjeta HUD / Diálogo cívico estilo pixel-chic */}
        <div className="absolute top-3 sm:top-6 md:top-8 lg:top-10 left-3 sm:left-6 md:left-8 lg:left-10 z-10 w-[calc(100%-1.5rem)] max-w-[310px] sm:max-w-[380px] md:max-w-[430px] lg:max-w-[460px]">
          <div className="bg-white/[0.96] rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-7 border border-white/90 shadow-[0_12px_36px_-8px_rgba(28,37,65,0.22)] transition-all">
            
            {/* Título pixel art con alto contraste */}
            <h1 className={`${pixelFont.className} text-xl sm:text-2xl md:text-3xl lg:text-[38px] font-black text-[#1C2541] tracking-tight leading-[1.1] mb-2 sm:mb-3`}>
              ¿Cómo ha cambiado<br />
              <span className="text-[#E3007E]">la participación?</span>
            </h1>

            {/* Barra divisora rosa INE */}
            <div className="w-8 sm:w-12 h-1 sm:h-1.5 bg-[#E3007E] rounded-full mb-2.5 sm:mb-3.5" />

            {/* Párrafo descriptivo con contraste garantizado */}
            <p className="text-xs sm:text-sm md:text-base text-slate-700 font-medium leading-snug sm:leading-relaxed">
              Seis elecciones, seis momentos distintos: descubre cómo cambió la participación ciudadana de 2009 a 2024.
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}
