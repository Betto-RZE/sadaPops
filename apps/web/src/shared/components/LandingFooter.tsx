'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/shared/utils';

export interface LandingFooterProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Cruz de registro de imprenta editorial (+) con trazo geométrico nítido
 */
function PrintRegistrationCross({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={cn('w-4 h-4 text-black/30 pointer-events-none select-none shrink-0', className)}
    >
      <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="0.75" />
      <line x1="0" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}

/**
 * Footer Cívico/Institucional con efecto de pliego de revista satinado y marcas de imprenta
 * Reto 3 Hackathon INE 2026 — «Mapa de Dalias y Participación Ciudadana»
 */
export function LandingFooter({ className, children }: LandingFooterProps) {
  return (
    <footer
      role="contentinfo"
      aria-label="Pie de página cívico institucional"
      className={cn(
        'relative w-full overflow-hidden bg-[#EAE5DC] text-brand-navy select-none',
        'pt-10 sm:pt-14 pb-12 sm:pb-16',
        // Sombra física superior sutil sobre el papel de fondo general
        'shadow-[0_-4px_20px_rgba(20,24,35,0.06),inset_0_1px_0_rgba(255,255,255,0.7)]',
        className
      )}
    >
      {/* ========================================================================= */}
      {/* 1. LIENZO FÍSICO: PAPEL DE REVISTA SATINADO / BRILLOSO                   */}
      {/* ========================================================================= */}
      {/* Textura fotográfica de pliego de revista satinado con pliegues y curvatura */}
      <Image
        src="/assets/cards-narrativa/glossy-magazine-sheet.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover pointer-events-none select-none z-0 opacity-95"
      />

      {/* Gradiente especular diagonal para simular reflejo de luz ambiental sobre papel brillante */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none z-0"
        style={{
          background:
            'linear-gradient(35deg, rgba(30,25,20,0.07) 0%, transparent 22%, transparent 72%, rgba(255,255,255,0.55) 100%)',
        }}
      />

      {/* ========================================================================= */}
      {/* 2. MARCAS DE REGISTRO LATERALES EN LOS MÁRGENES DEL PLIEGO IMPRESO        */}
      {/* ========================================================================= */}
      <div
        aria-hidden="true"
        className="absolute left-2 sm:left-4 lg:left-6 top-[55%] -translate-y-1/2 pointer-events-none select-none z-10"
      >
        <PrintRegistrationCross />
      </div>
      <div
        aria-hidden="true"
        className="absolute right-2 sm:right-4 lg:right-6 top-[55%] -translate-y-1/2 pointer-events-none select-none z-10"
      >
        <PrintRegistrationCross />
      </div>

      {/* ========================================================================= */}
      {/* 3. CONTENIDO EDITORIAL RESTRINGIDO A LA RETÍCULA (1440px)                */}
      {/* ========================================================================= */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
        {/* Cabezal de Imprenta Superior: Filete fino + Cruz + Manifiesto Rosa Dalia */}
        <div className="relative flex items-center justify-between gap-3 sm:gap-6 mb-10 sm:mb-14">
          {/* Filete horizontal continuo superior */}
          <div className="flex-1 h-px bg-black/15" />

          {/* Marca de registro '+' en el entronque */}
          <PrintRegistrationCross />

          {/* Micro-manifiesto editorial: UNA FLOR TAMBIÉN ES UN VOTO */}
          <div className="text-right sm:text-left font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-[#C8006E] leading-[1.3] select-none shrink-0">
            <div>UNA FLOR</div>
            <div>TAMBIÉN</div>
            <div>ES UN VOTO</div>
          </div>

          {/* Filete vertical derecho */}
          <div className="h-8 sm:h-11 w-px bg-black/15 hidden sm:block shrink-0" />

          {/* Marca de registro '+' en el extremo derecho */}
          <PrintRegistrationCross className="hidden sm:block" />
        </div>

        {/* ======================================================================= */}
        {/* Espacio reservado para Fase 2: Retícula Editorial de 5 Columnas        */}
        {/* ======================================================================= */}
        <div className="min-h-[140px] relative">
          {children}
        </div>

        {/* Filete divisorio intermedio hacia el copyright y la escena voxel */}
        <div className="w-full h-px bg-black/15 mt-10 sm:mt-12 mb-6" />

        {/* ======================================================================= */}
        {/* Espacio reservado para Fase 3: Objeto Voxel y Barra de Copyright        */}
        {/* ======================================================================= */}
      </div>
    </footer>
  );
}
