'use client';

import React, { useState } from 'react';
import { PixelMap, DahliaLayer, DahliaStoreProvider, StateHologramCard } from '@/features/mapa-dalias';

export function Hero() {
  // Inicialización neutral: ningún estado seleccionado al cargar la landing
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);

  return (
    <section className="relative w-full bg-transparent overflow-x-clip overflow-y-visible pt-0 pb-6 sm:pb-8 select-none">
      
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-10 relative z-10">
        
        {/* Contenedor compacto que aprovecha el espacio vertical sin scroll */}
        <div className="relative flex flex-col items-center justify-center min-h-[500px] sm:min-h-[560px] lg:min-h-[620px]">
          
          {/* ========================================================================= */}
          {/* CAPA 1: TITULAR MONUMENTAL - REVELACIÓN CON RITMO EDITORIAL (0.1s a 1.5s) */}
          {/* ========================================================================= */}
          <div 
            aria-hidden="true"
            className="absolute inset-0 z-0 flex flex-col justify-between py-1 sm:py-2 md:py-3 pointer-events-none select-none"
          >
            {/* Bloque Superior Izquierdo: "Tu" (0.10s) + "participación" (0.35s) */}
            <div className="w-full flex justify-start pl-2 sm:pl-6 md:pl-10 lg:pl-12">
              <span className="text-[clamp(2.4rem,6.8vw,6.4rem)] font-black tracking-tighter leading-[0.88] text-brand-navy uppercase font-sans flex flex-wrap gap-x-3 sm:gap-x-4 md:gap-x-6">
                <span className="hero-word" style={{ animationDelay: '0.10s' }}>
                  Tu
                </span>
                <span className="hero-word" style={{ animationDelay: '0.35s' }}>
                  participación
                </span>
              </span>
            </div>

            {/* Bloque Medio Asimétrico: "hace" (0.65s) + "florecer" (0.95s, magenta INE) */}
            <div className="w-full flex justify-between items-center px-1 sm:px-3 md:px-6 -my-3 sm:-my-5">
              <span className="text-[clamp(2.4rem,7vw,6.6rem)] font-black tracking-tighter leading-[0.88] text-brand-navy uppercase font-sans">
                <span className="hero-word" style={{ animationDelay: '0.65s' }}>
                  hace
                </span>
              </span>
              <span className="text-[clamp(2.6rem,7.4vw,7rem)] font-black tracking-tighter leading-[0.88] text-dalia-600 uppercase font-sans">
                <span className="hero-word-magenta" style={{ animationDelay: '0.95s' }}>
                  florecer
                </span>
              </span>
            </div>

            {/* Bloque Inferior Derecho: "a" (1.25s) + "México." (1.45s) */}
            <div className="w-full flex justify-end pr-2 sm:pr-8 md:pr-14 lg:pr-16 pb-4 sm:pb-6">
              <span className="text-[clamp(2.6rem,7.2vw,6.8rem)] font-black tracking-tighter leading-[0.88] text-brand-navy uppercase font-sans flex flex-wrap gap-x-3 sm:gap-x-4 md:gap-x-6">
                <span className="hero-word" style={{ animationDelay: '1.25s' }}>
                  a
                </span>
                <span className="hero-word" style={{ animationDelay: '1.45s' }}>
                  México.
                </span>
              </span>
            </div>
          </div>

          {/* Encabezado accesible real para lectores de pantalla y SEO */}
          <h1 className="sr-only">
            Tu participación hace florecer a México.
          </h1>

          {/* ========================================================================= */}
          {/* CAPA 2 & 3: MAPA ISOMÉTRICO (IRRUMPE TRAS LA LECTURA)                     */}
          {/* ========================================================================= */}
          <div 
            id="mapa-interactivo" 
            className="hero-map-delayed-enter relative z-10 w-full max-w-[780px] sm:max-w-[920px] md:max-w-[1040px] lg:max-w-[1140px] xl:max-w-[1220px] map-isometric-shadow -mt-3 sm:-mt-5"
          >
            <DahliaStoreProvider>
            <PixelMap
              selectedStateId={selectedStateId}
              hoveredStateId={hoveredStateId}
              onSelectState={setSelectedStateId}
              onHoverState={setHoveredStateId}
              className="w-full"
            >
              {/* Capa de Dalias Voxel sobre los estados */}
              <DahliaLayer />
              {/* Proyección holográfica del estado activo (H5) */}
              <StateHologramCard />
            </PixelMap>
            </DahliaStoreProvider>
          </div>

        </div>

      </div>
    </section>
  );
}
