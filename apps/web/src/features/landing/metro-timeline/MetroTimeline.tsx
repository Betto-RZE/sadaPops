'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/shared/utils';
import { MetroStation } from './MetroStation';
import { MetroTrain } from './MetroTrain';
import { PARADAS, type Parada, type ParadaTone } from './paradas';

interface MetroTimelineProps {
  /**
   * Índice de la estación donde el tren está estacionado.
   * Fase 1: estático (por defecto la parada 01 «Hoy»).
   * Fase 2: lo controlará el progreso del scroll.
   */
  dockedAt?: number;
  className?: string;
}

const TONE: Record<ParadaTone, { badge: string; link: string; ring: string }> = {
  dalia: {
    badge: 'text-dalia-700 border-dalia-600/40',
    link: 'text-dalia-700 hover:text-dalia-800 decoration-dalia-600/40',
    ring: 'focus-visible:ring-dalia-600',
  },
  indigo: {
    badge: 'text-[#4332B5] border-[#5B46D6]/40',
    link: 'text-[#4332B5] hover:text-[#2E208F] decoration-[#5B46D6]/40',
    ring: 'focus-visible:ring-[#5B46D6]',
  },
  navy: {
    badge: 'text-[#0F1B2D] border-[#0F1B2D]/30',
    link: 'text-[#0F1B2D] hover:text-black decoration-[#0F1B2D]/30',
    ring: 'focus-visible:ring-[#0F1B2D]',
  },
};

/**
 * Escenario ferroviario voxel: tres andenes unidos por un riel continuo.
 * La lista conserva semántica <ol> para lectores de pantalla (WCAG 2.1 AA):
 * todo el contenido de cada parada existe como texto real bajo cada estación.
 */
export function MetroTimeline({ dockedAt = 0, className }: MetroTimelineProps) {
  return (
    <div className={cn('relative', className)}>
      <ol
        aria-label="Tres paradas hacia el 6 de junio de 2027"
        className={cn(
          // Móvil: carrusel horizontal con snap; Desktop: tres andenes alineados en la misma vía
          'flex gap-6 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 pt-4 pb-6',
          'lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:mx-0 lg:px-0',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        )}
      >
        {PARADAS.map((parada, index) => (
          <li
            key={parada.id}
            aria-current={index === dockedAt ? 'step' : undefined}
            className="relative shrink-0 w-[84%] sm:w-[62%] lg:w-auto snap-center flex flex-col"
          >
            <MetroStation numero={parada.numero} rotulo={parada.rotulo} isActive={index === dockedAt}>
              {index === dockedAt && <MetroTrain />}
            </MetroStation>

            <ParadaCaption parada={parada} isActive={index === dockedAt} />
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Leyenda editorial provisional bajo cada andén.
 * En la Fase 3 este contenido migra a la tarjeta con marco voxel (card-parada.png).
 */
function ParadaCaption({ parada, isActive }: { parada: Parada; isActive: boolean }) {
  const tone = TONE[parada.tone];

  return (
    <div
      className={cn(
        'mt-6 pt-4 border-t border-black/10 transition-opacity duration-500',
        isActive ? 'opacity-100' : 'opacity-75'
      )}
    >
      <div className="flex items-baseline justify-between gap-3 mb-2.5">
        <span
          className={cn(
            'text-[10px] font-mono font-bold tracking-[0.2em] uppercase border-b pb-0.5',
            tone.badge
          )}
        >
          {parada.cuando}
        </span>
        <span className="font-serif text-2xl leading-none text-black/20">{parada.numero}</span>
      </div>

      <h4 className="font-serif text-xl sm:text-[22px] font-bold text-[#0F1B2D] leading-snug">
        {parada.titulo}
      </h4>

      <p className="mt-2 text-[13px] text-[#4A5568] leading-relaxed font-sans">{parada.descripcion}</p>

      {parada.enlace ? (
        <a
          href={parada.enlace.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'mt-3 inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider underline underline-offset-4 transition-colors rounded py-1',
            'focus:outline-none focus-visible:ring-2',
            tone.link,
            tone.ring
          )}
        >
          <span>{parada.enlace.label}</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden />
          <span className="sr-only">(se abre en una pestaña nueva, sitio oficial del INE)</span>
        </a>
      ) : (
        parada.nota && (
          <p className="mt-3 flex items-center gap-2 text-[11px] font-mono font-semibold text-[#0F1B2D]/70">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>{parada.nota}</span>
          </p>
        )
      )}
    </div>
  );
}
