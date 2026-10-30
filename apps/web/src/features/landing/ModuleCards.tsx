'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BarChart3, Gamepad2, ArrowRight, X } from 'lucide-react';
import { DayToDayFlipCards, DayToDayCardItem } from './DayToDayFlipCards';
import { CivicBridgeAndGapSection } from './CivicBridgeAndGapSection';
import { cn } from '@/shared/utils';

export function ModuleCards() {
  // Estado de la tarjeta actualmente volteada (solo 1 abierta a la vez)
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  // Registro del último tema consultado para el giro en secciones posteriores
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  // Estado sincronizado desde el mapa del Hero (vía evento dalias:state-selected)
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  // Estado para la nota cultural interactiva de la palabra "dalia"
  const [isDaliaNoteOpen, setIsDaliaNoteOpen] = useState(false);
  const daliaNoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDaliaNoteOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDaliaNoteOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (daliaNoteRef.current && !daliaNoteRef.current.contains(e.target as Node)) {
        setIsDaliaNoteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDaliaNoteOpen]);

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
    <section id="modulos" className="w-full bg-transparent pt-0 pb-32 scroll-mt-12 select-none overflow-x-clip">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 relative">
        
        {/* ========================================================================= */}
        {/* 1. MODO DEMOSTRACIÓN (Tratamiento editorial sobrio, impreso sobre el papel) */}
        {/* ========================================================================= */}
        <div className="-mt-2 sm:-mt-4 mb-6 md:mb-8 text-center">
          <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] uppercase text-[#8C7D70] select-none">
            <span>MODO DEMOSTRACIÓN</span>
            <span className="mx-3 sm:mx-4 text-[#8C7D70]/40 font-light">|</span>
            <span>ESTE MAPA INICIA CON DATOS DE EJEMPLO.</span>
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. FRASE PRINCIPAL EDITORIAL CON MICRO-INTERACCIÓN DE "DALIA"             */}
        {/* ========================================================================= */}
        <div className="mb-6 text-center max-w-2xl mx-auto px-4 relative">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-[34px] lg:text-[38px] leading-[1.25] text-brand-navy font-normal tracking-tight">
            Una{' '}
            <button
              type="button"
              onClick={() => setIsDaliaNoteOpen((prev) => !prev)}
              aria-expanded={isDaliaNoteOpen}
              aria-controls="dalia-cultural-note"
              className="inline font-semibold text-brand-navy underline decoration-dotted decoration-dalia-600/60 underline-offset-4 hover:text-dalia-600 hover:decoration-dalia-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600 rounded transition-colors cursor-pointer"
              title="Toca para conocer por qué la dalia nos representa"
            >
              dalia
            </button>{' '}
            no es un voto:
            <br />
            es una persona que decidió prepararse.
          </h2>

          {/* Nota al pie flotante y elegante (símbolo nacional y significado en la plataforma) */}
          {isDaliaNoteOpen && (
            <div
              id="dalia-cultural-note"
              ref={daliaNoteRef}
              role="region"
              aria-label="Significado de la dalia como flor nacional"
              className="mt-4 p-5 sm:p-6 rounded-2xl bg-[#FDFCFA] border border-black/10 shadow-lg max-w-md mx-auto text-left animate-in fade-in-0 zoom-in-95 duration-150 relative z-30"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-bold text-[#8C7D70] block">
                    Flor Nacional de México • Decreto de 1963
                  </span>
                  <h4 className="font-serif text-base font-bold text-brand-navy mt-0.5">
                    La Dalia <span className="font-sans text-xs font-normal text-brand-navy/60">(Acocoxóchitl)</span>
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDaliaNoteOpen(false)}
                  aria-label="Cerrar nota sobre la dalia"
                  className="p-1 rounded-lg text-brand-navy/40 hover:text-brand-navy hover:bg-black/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-brand-navy/80 leading-relaxed font-sans mb-3">
                Declarada oficialmente <strong>Flor Nacional de México</strong> el 12 de mayo de 1963 por decreto presidencial,
                representa la diversidad cultural y botánica del país. Posee raíces tubulares resistentes que se adaptan,
                se reproducen y florecen en comunidad.
              </p>

              <div className="pt-2.5 border-t border-black/5 flex items-center gap-2 text-[11px] text-dalia-700 font-medium font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-dalia-600 shrink-0" />
                <span>En esta plataforma, cada dalia representa a una persona que decidió informarse.</span>
              </div>
            </div>
          )}
        </div>

        {/* Separador fino sutil entre la frase y el aviso editorial */}
        <div className="w-full max-w-xl mx-auto h-px bg-black/10 my-6 sm:my-7" />

        {/* ========================================================================= */}
        {/* 3 y 4. AVISO DE NEUTRALIDAD E INSTITUCIONAL (Sin badges, integrado al flujo) */}
        {/* ========================================================================= */}
        <div className="mb-14 sm:mb-20 text-center max-w-2xl mx-auto px-4">
          <p className="text-xs sm:text-[13px] text-brand-navy/70 leading-relaxed font-normal">
            Aquí no te decimos por quién votar. Solo mostramos datos oficiales y cómo prepararte.
          </p>
          <p className="mt-1.5 text-[11px] sm:text-xs text-brand-navy/45 font-normal">
            Proyecto independiente de estudiantes para el Hackathon INE; no es un portal oficial del INE.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 5. INDICADOR DE PROGRESO Y SECCIÓN 2: "TU DÍA A DÍA" (3 FLIP CARDS 3D)    */}
        {/* ========================================================================= */}
        <div className="mb-20">
          <div className="mb-8 text-left">
            {/* Indicador de progreso limpio como metadato de navegación */}
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4">
              <div className="flex items-center gap-1 font-mono text-xs sm:text-[13px]">
                <span className="font-bold text-dalia-600">01</span>
                <span className="text-black/30 font-light">/</span>
                <span className="text-black/40 font-medium">06</span>
              </div>
              <div className="w-10 sm:w-16 h-px bg-dalia-600/35" />
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.22em] uppercase text-black/55">
                TU DÍA A DÍA
              </span>
            </div>

            <h3 className="font-serif font-bold text-3xl sm:text-4xl lg:text-[42px] text-[#0F1B2D] tracking-tight leading-[1.1]">
              Lo que vives todos los días
            </h3>
            <p className="mt-2.5 text-sm sm:text-[15px] text-[#4A5568] max-w-2xl leading-relaxed font-sans">
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
      </div>

      {/* ========================================================================= */}
      {/* FASE 2: PUENTE CONSTITUCIONAL Y LA BRECHA GENERACIONAL (CCPC 2024)        */}
      {/* ========================================================================= */}
      <CivicBridgeAndGapSection
        selectedStateId={selectedStateId}
        onSelectState={setSelectedStateId}
      />

      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 relative">
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

      </div>
    </section>
  );
}
