'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { pixelFont } from '../fonts';

export function HeaderGenero() {
  return (
    <header className="relative w-full bg-[#FDFCFD] pt-3 sm:pt-4 md:pt-6 pb-2 px-3 sm:px-6 lg:px-12">
      {/* Contenedor enmarcado del Hero: bordes redondeados y sombra idénticos a Evolución */}
      <div className="relative w-full max-w-[1360px] mx-auto h-[440px] sm:h-[480px] md:h-[520px] lg:h-[550px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-[0_16px_45px_-12px_rgba(28,37,65,0.14)] bg-[#FFF5FA]">
        
        {/* 1. Imagen base en alta resolución: Observador cívico INE */}
        <Image
          src="/hero_genero_balanza_v2.png"
          alt="Observador cívico del INE y participación ciudadana entre mujeres y hombres con flor de dalia"
          fill
          priority
          className="object-cover object-[70%_center] sm:object-[68%_center] select-none pointer-events-none filter brightness-[1.01]"
          sizes="(max-width: 1360px) 100vw, 1360px"
        />

        {/* 2. Sutil degradado lateral suave para armonizar con la tarjeta oscura */}
        <div 
          className="absolute inset-y-0 left-0 w-full sm:w-[55%] md:w-[45%] bg-gradient-to-r from-black/20 via-black/5 to-transparent pointer-events-none z-[2]" 
          aria-hidden="true" 
        />

        {/* 3. Tarjeta HUD / Diálogo cívico estilo pixel-chic en negro para máximo contraste */}
        <div className="absolute top-3 sm:top-6 md:top-8 lg:top-10 left-3 sm:left-6 md:left-8 lg:left-10 z-10 w-[calc(100%-1.5rem)] max-w-[310px] sm:max-w-[380px] md:max-w-[430px] lg:max-w-[460px]">
          <div className="bg-[#0F172A]/95 backdrop-blur-md rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-7 border border-white/15 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.45)] transition-all">
            
            {/* Enlace para volver a preguntas de datos */}
            <Link
              href="/datos"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors mb-2.5 sm:mb-3 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-slate-300 group-hover:text-white" />
              Volver a las historias
            </Link>

            {/* Título pixel art con alto contraste sobre fondo negro */}
            <h1 className={`${pixelFont.className} text-xl sm:text-2xl md:text-3xl lg:text-[38px] font-black text-white tracking-tight leading-[1.1] mb-2 sm:mb-3`}>
              ¿Quiénes participan<br />
              <span className="text-[#E3007E]">más?</span>
            </h1>

            {/* Barra divisora rosa INE */}
            <div className="w-8 sm:w-12 h-1 sm:h-1.5 bg-[#E3007E] rounded-full mb-2.5 sm:mb-3.5" />

            {/* Párrafo descriptivo con contraste garantizado en blanco/slate claro */}
            <p className="text-xs sm:text-sm md:text-base text-slate-200 font-medium leading-snug sm:leading-relaxed">
              Descubre cómo se comporta la participación electoral entre mujeres y hombres en México a lo largo de seis elecciones federales.
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}
