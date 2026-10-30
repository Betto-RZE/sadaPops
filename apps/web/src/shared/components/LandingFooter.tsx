'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
      className={cn('w-4 h-4 text-[#2C3545]/40 pointer-events-none select-none shrink-0', className)}
    >
      <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="0.8" />
      <line x1="0" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

/**
 * Ícono oficial de GitHub en silueta circular sólida estilo editorial
 */
function GitHubMarkIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('w-9 h-9 text-[#1E242B]', className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

const EXPLORA_LINKS = [
  { label: 'Mapa interactivo', href: '/#hero-mapa' },
  { label: 'Narrativa', href: '/#modulos' },
  { label: 'Modo juego', href: '/juego' },
] as const;

const DATOS_LINKS = [
  { label: 'Dashboard CCPC', href: '/datos', external: false },
  { label: 'Metodología', href: '/datos#metodologia', external: false },
  { label: 'Glosario', href: 'https://www.ine.mx/cultura-civica/', external: true },
] as const;

const ACERCA_LINKS = [
  { label: 'Sobre el proyecto', href: '/#modulos', external: false },
  { label: 'Privacidad', href: '/#registro-dalia', external: false },
  { label: 'Contacto', href: 'https://www.ine.mx/', external: true },
] as const;

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
      {/* 2. CONTENIDO EDITORIAL RESTRINGIDO A LA RETÍCULA (1440px)                */}
      {/* ========================================================================= */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
        {/* Cabezal de Imprenta Superior: Filete fino + Cruz + Manifiesto Rosa Dalia */}
        <div className="relative flex items-center justify-between gap-3 sm:gap-5 mb-8 sm:mb-11">
          {/* Filete horizontal continuo superior */}
          <div className="flex-1 h-px bg-[#2C3545]/25" />

          {/* Marca de registro '+' en el entronque */}
          <PrintRegistrationCross />

          {/* Micro-manifiesto editorial: UNA FLOR TAMBIÉN ES UN VOTO */}
          <div className="text-right sm:text-left font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-[#C8006E] leading-[1.35] select-none shrink-0">
            <div>UNA FLOR</div>
            <div>TAMBIÉN</div>
            <div>ES UN VOTO</div>
          </div>

          {/* Columna de registro vertical derecha con línea y cruz inferior */}
          <div className="hidden sm:flex flex-col items-center self-stretch justify-between shrink-0 -my-1">
            <div className="w-px h-10 bg-[#2C3545]/25" />
            <PrintRegistrationCross className="mt-1" />
          </div>
        </div>

        {/* ======================================================================= */}
        {/* FASE 2: RETÍCULA EDITORIAL SUPERIOR (IDENTIDAD + 4 COLUMNAS CON FILETE) */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-start">
          {/* Bloque 1: Identidad de Marca, Manifiesto en Serif y Metadatos Mono (5 cols) */}
          <div className="lg:col-span-5 pr-0 lg:pr-6">
            {/* Emblema Dalia Voxel + Título con filete + Subtítulo */}
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 drop-shadow-[0_6px_10px_rgba(28,37,65,0.18)]">
                <Image
                  src="/flowers/dahlia-4.png"
                  alt="Dalia Voxel — Flor Nacional de México"
                  fill
                  sizes="56px"
                  className="object-contain pointer-events-none"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="font-mono text-sm sm:text-[16px] font-bold tracking-[0.24em] uppercase text-[#141A24] whitespace-nowrap">
                    MAPA DE DALIAS
                  </span>
                  <span className="w-12 sm:w-20 h-px bg-[#2C3545]/35 shrink-0" />
                </div>
                <p className="mt-1 font-mono text-[10px] sm:text-[11px] tracking-[0.24em] uppercase text-[#4B5563]">
                  MÉXICO &nbsp;·&nbsp; 2026
                </p>
              </div>
            </div>

            {/* Párrafo Editorial en Newsreader (Serif) */}
            <p className="mt-5 sm:mt-6 font-serif text-[17px] sm:text-[19px] lg:text-[20px] leading-[1.45] text-[#263040] font-normal max-w-[380px]">
              Una plataforma para que más personas se informen, participen y hagan florecer un México más fuerte.
            </p>

            {/* Filete corto de acento Rosa Dalia */}
            <div className="w-11 h-[2px] bg-[#C8006E] my-5" />

            {/* Descriptores en IBM Plex Mono */}
            <div className="font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-[#4B5563] leading-[1.9] space-y-0.5">
              <p>DATOS &nbsp;·&nbsp; PARTICIPACIÓN &nbsp;·&nbsp; COMUNIDAD</p>
              <p>EDUCACIÓN CÍVICA &nbsp;·&nbsp; TERRITORIO &nbsp;·&nbsp; IMPACTO</p>
            </div>
          </div>

          {/* Bloques 2 a 5: Columnas de Navegación Cívica + GitHub con divisores verticales (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-6 sm:gap-x-0 lg:mt-10">
            {/* Columna EXPLORA */}
            <nav
              aria-label="Explora la plataforma"
              className="sm:border-l sm:border-[#2C3545]/25 sm:pl-5 lg:pl-7 py-1 flex flex-col justify-between min-h-[132px]"
            >
              <div>
                <h3 className="font-mono text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase text-[#C8006E] mb-3.5">
                  EXPLORA
                </h3>
                <ul className="space-y-2">
                  {EXPLORA_LINKS.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="font-serif text-[15px] sm:text-[16px] text-[#263040] hover:text-[#C8006E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8006E] rounded-sm"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Columna DATOS */}
            <nav
              aria-label="Datos y metodología CCPC"
              className="border-l border-[#2C3545]/25 pl-5 lg:pl-7 py-1 flex flex-col justify-between min-h-[132px]"
            >
              <div>
                <h3 className="font-mono text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase text-[#C8006E] mb-3.5">
                  DATOS
                </h3>
                <ul className="space-y-2">
                  {DATOS_LINKS.map((item) => (
                    <li key={item.label}>
                      {item.external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-serif text-[15px] sm:text-[16px] text-[#263040] hover:text-[#C8006E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8006E] rounded-sm"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="font-serif text-[15px] sm:text-[16px] text-[#263040] hover:text-[#C8006E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8006E] rounded-sm"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Columna ACERCA */}
            <nav
              aria-label="Acerca del proyecto y privacidad"
              className="sm:border-l sm:border-[#2C3545]/25 sm:pl-5 lg:pl-7 py-1 flex flex-col justify-between min-h-[132px]"
            >
              <div>
                <h3 className="font-mono text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase text-[#C8006E] mb-3.5">
                  ACERCA
                </h3>
                <ul className="space-y-2">
                  {ACERCA_LINKS.map((item) => (
                    <li key={item.label}>
                      {item.external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-serif text-[15px] sm:text-[16px] text-[#263040] hover:text-[#C8006E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8006E] rounded-sm"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="font-serif text-[15px] sm:text-[16px] text-[#263040] hover:text-[#C8006E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8006E] rounded-sm"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Columna GITHUB */}
            <div className="border-l border-[#2C3545]/25 pl-5 lg:pl-7 py-1 flex flex-col justify-center min-h-[132px]">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver código fuente del proyecto en GitHub"
                className="group inline-flex flex-col items-start gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8006E] rounded-sm"
              >
                <GitHubMarkIcon className="transition-transform duration-200 group-hover:scale-105 group-hover:text-[#C8006E]" />
                <div className="font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-[#263040] group-hover:text-[#C8006E] transition-colors leading-[1.45]">
                  <span className="block">VER CÓDIGO</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span>EN GITHUB</span>
                    <span
                      aria-hidden="true"
                      className="text-xs leading-none transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                      ↗
                    </span>
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Filete divisorio intermedio hacia el copyright y la escena voxel */}
        <div className="w-full h-px bg-[#2C3545]/25 mt-10 sm:mt-12" />

        {/* Barra de Copyright y Lema Ciudadano + Cruces de Registro Laterales */}
        <div className="relative pt-4 pb-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[#4B5563]">
            <p className="font-sans text-[11px] sm:text-xs tracking-wide">
              © 2026 Mapa de Dalias. Todos los derechos reservados.
            </p>
            <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#263040]">
              DISEÑADO PARA UNA CIUDADANÍA INFORMADA.
            </p>
          </div>

          {/* Marcas de registro (+) debajo de la barra de copyright en ambos extremos */}
          <div className="mt-4 flex items-center justify-between pointer-events-none select-none -mx-1 sm:-mx-2">
            <PrintRegistrationCross />
            <PrintRegistrationCross />
          </div>
        </div>

        {/* ======================================================================= */}
        {/* Espacio reservado para Fase 3: Escenografía Voxel Monumental            */}
        {/* ======================================================================= */}
        {children}
      </div>
    </footer>
  );
}
