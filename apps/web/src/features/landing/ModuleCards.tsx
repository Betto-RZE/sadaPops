'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, Gamepad2, ArrowRight, Flower2, ShieldAlert, Sparkles } from 'lucide-react';
import { DayToDayFlipCards, DayToDayCardItem } from './DayToDayFlipCards';
import { cn } from '@/shared/utils';

export function ModuleCards() {
  // Estado de la tarjeta actualmente volteada (solo 1 abierta a la vez)
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  // Registro del último tema consultado para el giro en secciones posteriores
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  // Estado sincronizado desde el mapa del Hero (vía evento dalias:state-selected)
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStateSelect = (e: Event) => {
      const custom = e as CustomEvent<{ stateId: string | null }>;
      if (custom.detail) {
        setSelectedStateId(custom.detail.stateId);
      }
    };
    window.addEventListener('dalias:state-selected', handleStateSelect);
    return () => {
      window.removeEventListener('dalias:state-selected', handleStateSelect);
    };
  }, []);

  const handleToggleCard = (id: DayToDayCardItem['id']) => {
    setActiveCardId((prev) => {
      const next = prev === id ? null : id;
      if (next) setSelectedTopic(id);
      return next;
    });
  };

  return (
    <section id="modulos" className="w-full bg-transparent pt-0 pb-32 scroll-mt-12 select-none">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 relative">
        
        {/* ========================================================================= */}
        {/* 1. CINTILLA CORTA AL PIE DEL MAPA (Demostración + Significado de la Dalia) */}
        {/* ========================================================================= */}
        <div className="-mt-3 md:-mt-6 mb-12 sm:mb-16 flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-2 rounded-full bg-white/80 border border-black/5 shadow-sm backdrop-blur-sm text-[11px] sm:text-xs text-brand-navy/70 text-center max-w-2xl">
            <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono text-[9px] sm:text-[10px]">
              <ShieldAlert className="w-3 h-3 text-amber-600" />
              Demostración
            </span>
            <span>Este mapa inicia con datos de ejemplo.</span>
            <span className="hidden sm:inline text-black/20">•</span>
            <span className="font-semibold text-brand-navy">
              Una flor no es un voto: es una persona que decidió prepararse.
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. LÍNEA DE CONFIANZA INDEPENDIENTE                                       */}
        {/* ========================================================================= */}
        <div className="mb-10 text-center max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dalia-50 border border-dalia-200/60 text-dalia-700 text-[11px] font-bold tracking-wider uppercase font-mono mb-3">
            <Sparkles className="w-3 h-3" />
            Sin sesgos partidistas
          </div>
          <p className="text-xs sm:text-sm text-brand-navy/80 leading-relaxed font-medium">
            Aquí no te decimos por quién votar. Solo mostramos datos oficiales y cómo prepararte.
            <span className="block mt-1 text-[11px] text-brand-navy/50 font-normal">
              Proyecto independiente de estudiantes para el Hackathon INE; no es un portal oficial del INE.
            </span>
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 3. SECCIÓN 2: "TU DÍA A DÍA" (3 FLIP CARDS 3D)                            */}
        {/* ========================================================================= */}
        <div className="mb-20">
          <div className="mb-8 text-center sm:text-left">
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-dalia-600 block mb-1">
              Paso 1 de 6 • Tu día a día
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-navy tracking-tight">
              Lo que vives todos los días
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-brand-navy/70 max-w-2xl leading-relaxed">
              Tres situaciones cotidianas que conoces de cerca, contrastadas con cifras oficiales de la
              Encuesta Nacional de Ocupación y Empleo (ENOE) del INEGI. Toca una tarjeta para descubrir el dato.
            </p>
          </div>

          {/* Grid de 3 Tarjetas Giratorias 3D */}
          <DayToDayFlipCards
            activeCardId={activeCardId}
            onToggleCard={handleToggleCard}
          />
        </div>

        {/* ========================================================================= */}
        {/* COMPONENTES TEMPORALES DE NAVEGACIÓN HACIA DATOS Y JUEGO                   */}
        {/* (Se integrarán completamente en las Fases 2, 3 y 4 del recorrido)         */}
        {/* ========================================================================= */}
        <div className="pt-8 border-t border-black/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] font-mono font-bold tracking-wider uppercase text-brand-navy/40">
                Siguientes secciones en desarrollo
              </p>
              <h3 className="text-lg font-bold text-brand-navy">
                Explora los módulos a profundidad
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos Card */}
            <Link
              href="/datos"
              className="group block rounded-3xl bg-[#F0F7FF] border border-blue-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-[240px] relative"
            >
              <div className="p-8 pb-0 h-full flex flex-col justify-between">
                <div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-500 shadow-sm">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <h4 className="mb-2 text-xl font-bold text-brand-navy">Explora los Datos CCPC</h4>
                  <p className="text-xs sm:text-sm font-medium text-brand-navy/70 leading-relaxed max-w-[280px]">
                    Visualiza estadísticas censales de participación electoral por edad, sexo y evolución histórica.
                  </p>
                </div>
                
                <div className="mt-4 pb-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-brand-navy transition-colors group-hover:bg-white shadow-sm">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Juego Card */}
            <Link
              href="/juego"
              className="group block rounded-3xl bg-brand-navy border border-brand-navy/20 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand-navy/20 hover:-translate-y-1 h-[240px] relative"
            >
              <div className="p-8 pb-0 h-full flex flex-col justify-between relative z-10">
                <div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white shadow-sm">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <h4 className="mb-2 text-xl font-bold text-white">Modo Juego Pixel Art</h4>
                  <p className="text-xs sm:text-sm font-medium text-white/70 leading-relaxed max-w-[280px]">
                    Desmiente mitos con datos del INE y practica en el simulador de proceso de votación en casilla.
                  </p>
                </div>
                
                <div className="mt-4 pb-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors group-hover:bg-white/20 shadow-sm">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Asistente Cívico Flotante */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            type="button"
            className="flex items-center gap-3 bg-white pl-3 pr-4 py-2.5 rounded-full shadow-[0_10px_35px_-5px_rgba(0,0,0,0.18)] border border-gray-100 group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600"
            title="Abrir Asistente Cívico"
          >
            <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center shadow-inner text-dalia-500">
              <Flower2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-brand-navy leading-tight">Asistente Cívico</p>
              <p className="text-[9px] text-gray-500 font-medium">¿Tienes dudas?</p>
            </div>
          </button>
        </div>

      </div>
    </section>
  );
}
