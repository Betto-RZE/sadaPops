'use client';

import React from 'react';
import Image from 'next/image';
import { Newsreader, IBM_Plex_Mono } from 'next/font/google';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/shared/utils';
import { METRO_ASSETS } from './metroCalibration';
import { type Parada } from './paradas';

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['600'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
});

interface MetroCardProps {
  parada: Parada;
  className?: string;
}

/**
 * Tarjeta voxel informativa (`card-parada.png`) calibrada según la hoja de
 * referencia tipográfica y cromática:
 *  - Títulos: Newsreader Semibold 600 (#211B39)
 *  - Cuerpo: Sans Regular 400 (#565273)
 *  - Etiquetas / Fechas: IBM Plex Mono Medium 500 (#796DAA / pastilla #F6EAFF -> #5E2CE6)
 *  - Números: Newsreader Semibold (#B8AFE6)
 *
 * El lienzo interior lavanda del PNG abarca x: 17.25%→86.07% y y: 31.05%→73.83%.
 * Con márgenes internos óptimos (left 21%, right 18.7%, top 33.4%, bottom 28.3%)
 * y unidades `cqw`, el texto queda integrado como parte nativa de la pieza voxel.
 */
export function MetroCard({ parada, className }: MetroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26, mass: 0.75 }}
      className={cn(
        'relative w-full aspect-[1536/1024] select-none [container-type:inline-size]',
        className
      )}
    >
      {/* Sombra de contacto suave sobre el papel */}
      <div
        aria-hidden
        className="absolute left-[8%] right-[8%] bottom-[6%] h-[11%] rounded-[50%] bg-[#211B39]/14 blur-[2cqw]"
      />

      {/* Marco voxel PNG */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <Image
          src={METRO_ASSETS.card}
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 1024px) 38vw, 92vw"
          priority
          className="object-contain drop-shadow-[0_1.4cqw_2.2cqw_rgba(33,27,57,0.16)]"
        />
      </div>

      {/* Lienzo interior lavanda calibrado al bisel morado de card-parada.png */}
      <div
        className="absolute z-10 flex flex-col justify-between"
        style={{
          left: '21%',
          right: '18.7%',
          top: '33.4%',
          bottom: '28.3%',
        }}
      >
        {/* Bloque superior: Pastilla de fecha + Numeral 01 + Titular + Cuerpo */}
        <div className="relative">
          {/* Numeral en la esquina superior derecha (Newsreader Semibold #B8AFE6) */}
          <span
            aria-hidden
            className={cn(
              newsreader.className,
              'absolute right-0 top-[0.2cqw] font-semibold text-[4.8cqw] leading-none tracking-[-0.02em] text-[#B8AFE6] select-none'
            )}
          >
            {parada.numero}
          </span>

          {/* Pastilla de etiqueta (IBM Plex Mono Medium sobre fondo lavanda-rosado) */}
          <div className="mb-[1cqw] pr-[7cqw]">
            <span
              className={cn(
                ibmPlexMono.className,
                'inline-block rounded-[0.65cqw] bg-[#F6EAFF] px-[1.45cqw] py-[0.42cqw] text-[1.7cqw] font-semibold uppercase leading-none tracking-[0.15em] text-[#5E2CE6]'
              )}
            >
              {parada.cuando}
            </span>
          </div>

          {/* Titular (Newsreader Semibold 600, #211B39) */}
          <h4
            className={cn(
              newsreader.className,
              'pr-[6.5cqw] font-semibold text-[3.35cqw] text-[#211B39] leading-[1.08] tracking-[-0.02em]'
            )}
          >
            {parada.titulo}
          </h4>

          {/* Cuerpo de texto (Sans Regular 400, #565273) */}
          <p className="mt-[1.05cqw] font-sans font-normal text-[1.9cqw] text-[#565273] leading-[1.32] tracking-[-0.005em]">
            {parada.descripcion}
          </p>
        </div>

        {/* Pie de tarjeta: Línea divisoria lavanda + Enlace/Nota en IBM Plex Mono + Flecha */}
        <div className="pt-[0.95cqw] border-t border-[#796DAA]/25">
          {parada.enlace ? (
            <a
              href={parada.enlace.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                ibmPlexMono.className,
                'group flex items-center justify-between gap-[1.5cqw] w-full text-[1.62cqw] font-medium uppercase tracking-[0.12em] text-[#796DAA] hover:text-[#211B39] transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5E2CE6]'
              )}
            >
              <span className="truncate">{parada.enlace.label}</span>
              <ArrowRight
                className="w-[2.3cqw] h-[2.3cqw] shrink-0 text-[#796DAA] group-hover:text-[#211B39] group-hover:translate-x-[0.35cqw] transition-all"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="sr-only">(se abre en una pestaña nueva, portal oficial del INE)</span>
            </a>
          ) : (
            parada.nota && (
              <div
                className={cn(
                  ibmPlexMono.className,
                  'flex items-center justify-between gap-[1.5cqw] w-full text-[1.62cqw] font-medium uppercase tracking-[0.12em] text-[#796DAA]'
                )}
              >
                <span className="truncate">{parada.nota}</span>
                <span
                  aria-hidden
                  className="w-[1.2cqw] h-[1.2cqw] rounded-full bg-[#5E2CE6]/70 shrink-0"
                />
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
