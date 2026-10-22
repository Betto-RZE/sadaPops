'use client';

import React, { useState } from 'react';
import { ArrowRight, Flower2, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/utils';
import { PixelMap, DahliaLayer, FloatingPetals, useMapData } from '@/features/mapa-dalias';

export function Hero() {
  const [selectedStateId, setSelectedStateId] = useState<string | null>('21'); // 21 = Puebla por defecto
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const { data } = useMapData();

  const activeId = hoveredStateId || selectedStateId || '21';
  const activeState = data?.stateById.get(activeId);

  return (
    <section className="relative w-full bg-white overflow-hidden py-16 md:py-20 border-b border-gray-100">
      
      {/* Capa de Pétalos Flotantes Pixel Art inspirados en mockheroine4.jpeg */}
      <FloatingPetals />

      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Copy */}
          <div className="flex flex-col items-start pt-6">
            <span className="text-xs font-bold tracking-[0.2em] text-gray-400 mb-6 uppercase">
              Participación Ciudadana
            </span>
            
            <h1 className="text-5xl md:text-6xl lg:text-[70px] font-black tracking-tighter text-brand-navy leading-[1.05] mb-6">
              Tu participación <br />
              <span className="text-dalia-600">
                hace florecer
              </span>
              <br /> a México.
            </h1>
            
            <p className="text-lg md:text-xl text-brand-navy/70 mb-10 max-w-md font-medium leading-relaxed">
              Explora el mapa, conoce los datos, descubre historias y sé parte de una ciudadanía que transforma.
            </p>
            
            <button className="group flex items-center gap-3 rounded-full bg-dalia-600 px-8 py-4 text-base font-bold text-white transition-all hover:bg-dalia-700 hover:scale-105 shadow-xl shadow-dalia-600/30">
              <div className="bg-white/20 p-1.5 rounded-full">
                 <Flower2 className="w-5 h-5 text-white" />
              </div>
              Explorar el mapa
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <div className="mt-16 flex items-center gap-4">
              <div className="h-12 w-1 bg-gray-200 rounded-full" />
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 leading-tight">
                MÉXICO <br />
                SE CONSTRUYE <br />
                CON SU GENTE
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Pixel Art Map */}
          <div className="relative w-full flex flex-col items-center justify-center">
            
            {/* Mapa Isométrico Voxel / Pixel Art Interactivo */}
            <div className="w-full relative">
              <PixelMap
                selectedStateId={selectedStateId}
                hoveredStateId={hoveredStateId}
                onSelectState={setSelectedStateId}
                onHoverState={setHoveredStateId}
                className="w-full shadow-2xl rounded-2xl border-stone-200/80"
              >
                {/* Capa de Dalias Voxel animadas con oleada escalonada */}
                <DahliaLayer />
              </PixelMap>
            </div>

            {/* Top Right Floating Metric Card */}
            <div className="hidden sm:block absolute -top-6 right-0 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/50 z-20 min-w-[260px]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Flower2 className="text-dalia-600 w-5 h-5" />
                  <h3 className="text-xs font-semibold text-brand-navy">México floreciendo</h3>
                </div>
              </div>
              <p className="text-3xl font-black text-brand-navy mt-1">24,582</p>
              <div className="flex justify-between items-end mt-1">
                <p className="text-[11px] text-gray-500 font-medium">Dalias plantadas</p>
                <div className="flex gap-1 items-end">
                   <div className="w-1.5 h-3 bg-gray-200 rounded-sm" />
                   <div className="w-1.5 h-5 bg-gray-300 rounded-sm" />
                   <div className="w-1.5 h-7 bg-dalia-500 rounded-sm" />
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-[10px] text-brand-success mt-3 bg-brand-success/10 px-2 py-0.5 rounded w-fit">
                <TrendingUp className="h-3 w-3" />
                <span className="font-bold">+8.4% este mes</span>
              </div>
            </div>

            {/* Floating Card dinámico vinculado al estado seleccionado o en hover */}
            <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-8 sm:left-4 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 z-20 w-full sm:w-auto sm:min-w-[250px] transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-brand-navy">
                  {activeState?.nombre ?? 'Selecciona un estado'}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                  {activeState ? `Estado ${activeState.id}` : '--'}
                </span>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-pink-50 text-dalia-600">
                  <Flower2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-base font-black text-brand-navy leading-none">
                    {activeState ? (activeState.topPixels * 2.3).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'}{' '}
                    <span className="text-xs font-semibold text-stone-500">Dalias</span>
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">Personas informadas</p>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-2.5 mb-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                  Participación estimada
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-brand-navy">
                    {activeState ? (60 + (activeState.numId * 17) % 25).toFixed(1) : '65.0'}%
                  </p>
                  <span className="flex items-center text-[10px] font-bold text-brand-success">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> +{(2 + (activeState?.numId ?? 1) % 6).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-bold text-brand-navy flex items-center gap-1 text-dalia-600">
                <ArrowRight className="w-3.5 h-3.5" /> Haz clic para explorar
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </section>
  );
}
