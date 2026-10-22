'use client';

import React, { useState } from 'react';
import { PixelMap, DahliaLayer, FloatingPetals } from '@/features/mapa-dalias';

export function Hero() {
  // Inicialización neutral: ningún estado seleccionado al cargar la landing
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);

  return (
    <section className="relative w-full bg-transparent overflow-hidden pt-0 pb-6 sm:pb-8 select-none">
      
      {/* Capa de Pétalos Flotantes concentrados en los bordes */}
      <FloatingPetals />

      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-10 relative z-10">
        
        {/* Contenedor compacto que aprovecha el espacio vertical sin scroll */}
        <div className="relative flex flex-col items-center justify-center min-h-[500px] sm:min-h-[560px] lg:min-h-[620px]">
          
          {/* ========================================================= */}
          {/* CAPA 1: TITULAR MONUMENTAL EN BLOQUES ASIMÉTRICOS DETRÁS  */}
          {/* ========================================================= */}
          <div 
            aria-hidden="true"
            className="absolute inset-0 z-0 flex flex-col justify-between py-1 sm:py-2 md:py-3 pointer-events-none select-none"
          >
            {/* Bloque Superior Izquierdo: "Tu participación" */}
            <div className="w-full flex justify-start pl-2 sm:pl-6 md:pl-10 lg:pl-12">
              <span className="text-[clamp(2.4rem,6.8vw,6.4rem)] font-black tracking-tighter leading-[0.88] text-brand-navy/30 uppercase font-sans">
                Tu participación
              </span>
            </div>

            {/* Bloque Medio Asimétrico: "hace" (gris) + "florecer" (magenta INE) */}
            <div className="w-full flex justify-between items-center px-1 sm:px-3 md:px-6 -my-3 sm:-my-5">
              <span className="text-[clamp(2.4rem,7vw,6.6rem)] font-black tracking-tighter leading-[0.88] text-brand-navy/30 uppercase font-sans">
                hace
              </span>
              <span className="text-[clamp(2.6rem,7.4vw,7rem)] font-black tracking-tighter leading-[0.88] text-dalia-600/80 uppercase font-sans">
                florecer
              </span>
            </div>

            {/* Bloque Inferior Derecho: "a México." */}
            <div className="w-full flex justify-end pr-2 sm:pr-8 md:pr-14 lg:pr-16 pb-4 sm:pb-6">
              <span className="text-[clamp(2.6rem,7.2vw,6.8rem)] font-black tracking-tighter leading-[0.88] text-brand-navy/35 uppercase font-sans">
                a México.
              </span>
            </div>
          </div>

          {/* Encabezado accesible real para lectores de pantalla y SEO */}
          <h1 className="sr-only">
            Tu participación hace florecer a México.
          </h1>

          {/* ========================================================= */}
          {/* CAPA 2 & 3: MAPA ISOMÉTRICO AMPLIADO (PROTAGONISTA)       */}
          {/* ========================================================= */}
          <div 
            id="mapa-interactivo" 
            className="relative z-10 w-full max-w-[780px] sm:max-w-[920px] md:max-w-[1040px] lg:max-w-[1140px] xl:max-w-[1220px] map-isometric-shadow pointer-events-auto -mt-3 sm:-mt-5"
          >
            <PixelMap
              selectedStateId={selectedStateId}
              hoveredStateId={hoveredStateId}
              onSelectState={setSelectedStateId}
              onHoverState={setHoveredStateId}
              className="w-full"
            >
              {/* Capa de Dalias Voxel sobre los estados */}
              <DahliaLayer />
            </PixelMap>
          </div>

        </div>

      </div>
    </section>
  );
}
