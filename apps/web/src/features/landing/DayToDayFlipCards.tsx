'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, ExternalLink, Undo2 } from 'lucide-react';
import { cn } from '@/shared/utils';

export interface DayToDayCardItem {
  id: 'estudio' | 'busco-trabajo' | 'ya-trabajo';
  number: string;
  title: string;
  titleLines?: [string, string];
  shortSituation: string;
  imageSrc: string;
  imageAlt: string;
  statText: string;
  statPeriod: string;
  statSource: string;
  sourceUrl: string;
  contextText: string;
}

export const DAY_TO_DAY_CARDS: readonly DayToDayCardItem[] = [
  {
    id: 'estudio',
    number: '01',
    title: 'Estudio',
    shortSituation: 'Estudiar antes de entrar al mercado laboral.',
    imageSrc: '/assets/cards-narrativa/Voxel Flower Stack of Books.png',
    imageAlt: 'Libros voxel con dalia rosa y pétalos sobre papel satinado',
    statText:
      'De cada 100 jóvenes fuera del mercado laboral y no disponibles para trabajar, 64 no trabajaban por estudiar.',
    statPeriod: '1T 2024',
    statSource: 'INEGI, ENOE 1T 2024, Comunicado 481/24',
    sourceUrl: 'https://www.inegi.org.mx/programas/enoe/15ymas/',
    contextText:
      'Cifra oficial descriptiva de personas de 15 a 29 años, sin atribuir causas ni responsables.',
  },
  {
    id: 'busco-trabajo',
    number: '02',
    title: 'Busco trabajo',
    titleLines: ['Busco', 'trabajo'],
    shortSituation: 'Empezar a trabajar o buscar un empleo al salir de la escuela.',
    imageSrc: '/assets/cards-narrativa/Violet Voxel Briefcase with Pink Petals.png',
    imageAlt: 'Portafolio voxel violeta con cerradura rosa y pétalos',
    statText:
      'De 15.9 millones de jóvenes económicamente activos (52.3% de 30.4 millones), la desocupación es 4.8% y la informalidad laboral, 58.8%.',
    statPeriod: '1T 2025',
    statSource: 'INEGI, ENOE 1T 2025, Comunicado 116/25',
    sourceUrl: 'https://www.inegi.org.mx/programas/enoe/15ymas/',
    contextText:
      'Cifra oficial descriptiva de personas de 15 a 29 años, sin atribuir causas ni responsables.',
  },
  {
    id: 'ya-trabajo',
    number: '03',
    title: 'Ya trabajo',
    shortSituation: 'Tener un empleo remunerado y revisar las condiciones en las que trabajas.',
    imageSrc: '/assets/cards-narrativa/Voxel Laptop, Mug, and Pixel Flowers.png',
    imageAlt: 'Laptop voxel con flor en pantalla, taza de café y pétalos',
    statText:
      'Entre jóvenes con trabajo subordinado y remunerado (81.3% de los ocupados): 48.5% tiene contrato escrito, 48.1% acceso a salud y 59.3% vacaciones y aguinaldo u otras prestaciones.',
    statPeriod: '1T 2024',
    statSource: 'INEGI, ENOE 1T 2024, Comunicado 481/24',
    sourceUrl: 'https://www.inegi.org.mx/programas/enoe/15ymas/',
    contextText:
      'Cifra oficial descriptiva de personas de 15 a 29 años, sin atribuir causas ni responsables.',
  },
];

interface DayToDayFlipCardsProps {
  activeCardId: string | null;
  onToggleCard: (id: DayToDayCardItem['id']) => void;
  className?: string;
}

/**
 * Marcas de registro de imprenta y retícula isométrica sutil (1:1 con mock-cards-narrativa.png)
 */
function MagazineSheetDecorations() {
  return (
    <>
      {/* Marca de corte superior derecha (+ — +) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 80 12"
        className="absolute top-3.5 right-4 w-16 h-2.5 text-[#3B4252]/35 pointer-events-none select-none z-10"
      >
        <line x1="0" y1="6" x2="80" y2="6" stroke="currentColor" strokeWidth="0.6" />
        <line x1="52" y1="2" x2="52" y2="10" stroke="currentColor" strokeWidth="0.8" />
        <line x1="66" y1="3" x2="66" y2="9" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="52" cy="6" r="1" fill="currentColor" />
      </svg>

      {/* Marca de corte lateral izquierda vertical (+) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 12 90"
        className="absolute bottom-24 left-3.5 w-2.5 h-20 text-[#3B4252]/30 pointer-events-none select-none z-10"
      >
        <line x1="6" y1="0" x2="6" y2="90" stroke="currentColor" strokeWidth="0.6" />
        <line x1="2" y1="54" x2="10" y2="54" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="6" cy="54" r="1" fill="currentColor" />
      </svg>

      {/* Retícula isométrica sutil detrás de la ilustración voxel */}
      <div
        aria-hidden="true"
        className="absolute inset-x-3 bottom-14 h-[230px] pointer-events-none select-none opacity-35 z-0"
        style={{
          backgroundImage: `
            linear-gradient(30deg, rgba(122, 92, 158, 0.18) 1px, transparent 1px),
            linear-gradient(150deg, rgba(190, 24, 108, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '22px 13px',
          maskImage: 'radial-gradient(ellipse 72% 68% at 54% 58%, #000 35%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 72% 68% at 54% 58%, #000 35%, transparent 100%)',
        }}
      />
    </>
  );
}

export function DayToDayFlipCards({
  activeCardId,
  onToggleCard,
  className,
}: DayToDayFlipCardsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto pt-6',
        className
      )}
    >
      {DAY_TO_DAY_CARDS.map((card) => {
        const isFlipped = activeCardId === card.id;

        return (
          <div
            key={card.id}
            className="group/card relative w-full h-[500px] sm:h-[520px] lg:h-[535px] [perspective:1400px]"
          >
            {/* ============================================================ */}
            {/* ALFILER SUPERIOR (Glossy Hot-Pink Pushpin Head)               */}
            {/* ============================================================ */}
            <div
              aria-hidden="true"
              className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none"
            >
              {/* Sombra de contacto e inserción del alfiler sobre la hoja */}
              <div className="absolute top-[27px] left-[44%] -translate-x-1/2 w-5 h-2.5 rounded-full bg-black/45 blur-[2px] -rotate-12" />
              {/* Cabeza de alfiler magenta brillante */}
              <div className="relative w-12 h-12 drop-shadow-[-6px_10px_6px_rgba(22,14,32,0.48)]">
                <Image
                  src="/assets/cards-narrativa/Glossy Hot-Pink Pushpin Head.png"
                  alt=""
                  width={48}
                  height={48}
                  className="w-full h-full object-contain pointer-events-none"
                  priority
                />
              </div>
            </div>

            {/* ============================================================ */}
            {/* CONTENEDOR GIRATORIO 3D (Preserva el giro exclusivo)          */}
            {/* ============================================================ */}
            <div
              className={cn(
                'relative w-full h-full transition-transform duration-500 ease-out [transform-style:preserve-3d]',
                'motion-reduce:transition-none',
                isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
              )}
            >
              {/* ============================================================ */}
              {/* CARA FRONTAL: HOJA FÍSICA SATINADA CON PLIEGUES REALES       */}
              {/* ============================================================ */}
              <div
                onClick={() => onToggleCard(card.id)}
                role="button"
                tabIndex={isFlipped ? -1 : 0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggleCard(card.id);
                  }
                }}
                aria-expanded={isFlipped}
                aria-controls={`card-back-${card.id}`}
                className={cn(
                  'absolute inset-0 w-full h-full rounded-[2px] p-7 sm:p-8 flex flex-col justify-between overflow-hidden cursor-pointer text-left',
                  'bg-[#EAE5DC]',
                  // Sombra física direccional hacia abajo-izquierda + filo de luz superior derecho
                  'shadow-[-16px_22px_30px_-4px_rgba(14,18,28,0.28),0_3px_8px_rgba(14,18,28,0.10),inset_-1px_1px_0_rgba(255,255,255,0.85)]',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600',
                  '[backface-visibility:hidden] -webkit-backface-visibility:hidden',
                  'motion-reduce:backface-visible',
                  isFlipped && 'pointer-events-none motion-reduce:invisible'
                )}
              >
                {/* Textura real de hoja de revista satinada con pliegues y reflejos de luz */}
                <img
                  src="/assets/cards-narrativa/glossy-magazine-sheet.jpg"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
                />

                {/* Sombra sutil del pliegue inferior izquierdo y viñeteado orgánico del borde */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none select-none z-0"
                  style={{
                    background:
                      'linear-gradient(25deg, rgba(35,30,25,0.11) 0%, transparent 18%, transparent 78%, rgba(255,255,255,0.45) 100%)',
                  }}
                />

                <MagazineSheetDecorations />

                {/* Zona Superior: Número + Línea fina + Etiqueta TU DÍA A DÍA */}
                <div className="relative z-10 flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-3xl sm:text-[34px] text-[#555E6B] font-normal leading-none tracking-tight">
                      {card.number}
                    </span>
                    <span className="w-10 sm:w-12 h-px bg-[#555E6B]/45 inline-block" />
                  </div>
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-[#C8006E]">
                    TU DÍA A DÍA
                  </span>
                </div>

                {/* Zona Central: Título Serif + Descripción + Ilustración Voxel */}
                <div className="relative z-10 flex-1 flex flex-col justify-between pt-4 pb-2">
                  <div>
                    <h3 className="font-serif font-bold text-[36px] sm:text-[40px] lg:text-[42px] text-[#0F1B2D] leading-[1.0] tracking-tight">
                      {card.titleLines ? (
                        <>
                          {card.titleLines[0]}
                          <br />
                          {card.titleLines[1]}
                        </>
                      ) : (
                        card.title
                      )}
                    </h3>
                    <p className="mt-2.5 text-[13px] sm:text-[14px] text-[#455060] leading-[1.4] max-w-[235px] font-sans">
                      {card.shortSituation}
                    </p>
                  </div>

                  {/* Ilustración Voxel PNG integrada con presencia visual */}
                  <div className="relative w-full h-[200px] sm:h-[215px] -mt-1 flex items-center justify-center">
                    <div className="relative w-full h-full drop-shadow-[0_12px_16px_rgba(22,20,38,0.16)] transition-transform duration-300 group-hover/card:scale-[1.03]">
                      <Image
                        src={card.imageSrc}
                        alt={card.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain pointer-events-none select-none"
                        priority
                      />
                    </div>
                  </div>
                </div>

                {/* Zona Inferior: Enlace Editorial Impreso (TOCA PARA VER EL DATO →) */}
                <div className="relative z-10 w-full py-2.5 border-y border-[#9E2A6B]/45 flex items-center justify-between text-[#B50066] group-hover/card:text-[#8F0050] transition-colors">
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase">
                    TOCA PARA VER EL DATO
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/card:translate-x-1" />
                </div>
              </div>

              {/* ============================================================ */}
              {/* CARA POSTERIOR: DATOS OFICIALES VERIFICADOS (Misma Hoja)     */}
              {/* ============================================================ */}
              <div
                id={`card-back-${card.id}`}
                className={cn(
                  'absolute inset-0 w-full h-full rounded-[2px] p-7 sm:p-8 flex flex-col justify-between overflow-hidden',
                  'bg-[#EAE5DC]',
                  'shadow-[-16px_22px_30px_-4px_rgba(14,18,28,0.28),0_3px_8px_rgba(14,18,28,0.10),inset_-1px_1px_0_rgba(255,255,255,0.85)]',
                  '[transform:rotateY(180deg)] [backface-visibility:hidden] -webkit-backface-visibility:hidden',
                  'motion-reduce:[transform:none]',
                  !isFlipped && 'pointer-events-none motion-reduce:invisible'
                )}
              >
                {/* Textura real de hoja de revista satinada */}
                <img
                  src="/assets/cards-narrativa/glossy-magazine-sheet.jpg"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
                />

                {/* Zona Superior del Reverso */}
                <div className="relative z-10 flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-2xl text-[#555E6B] font-normal leading-none">
                      {card.number}
                    </span>
                    <span className="w-8 h-px bg-[#555E6B]/45 inline-block" />
                  </div>
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase text-[#C8006E]">
                    DATO OFICIAL • {card.statPeriod}
                  </span>
                </div>

                {/* Contenido Central: Dato verificado + Contexto neutral */}
                <div className="relative z-10 my-auto py-2">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[#555E6B] mb-1.5 font-bold">
                    Situación: {card.title}
                  </p>
                  <p className="font-serif text-[15px] sm:text-[16px] text-[#0F1B2D] leading-[1.4] font-normal mb-3.5">
                    {card.statText}
                  </p>

                  <div className="rounded-[2px] bg-white/65 border border-black/10 p-3.5 mb-3 shadow-sm backdrop-blur-[1px]">
                    <p className="text-xs text-[#253042] leading-relaxed font-sans">
                      {card.contextText}
                    </p>
                  </div>

                  <a
                    href={card.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={isFlipped ? 0 : -1}
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#4A5568] hover:text-[#C8006E] transition-colors focus:outline-none focus-visible:underline"
                  >
                    <span>Fuente: {card.statSource}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                {/* Zona Inferior del Reverso: Volver al frente */}
                <button
                  type="button"
                  onClick={() => onToggleCard(card.id)}
                  tabIndex={isFlipped ? 0 : -1}
                  aria-label={`Volver al frente de la tarjeta ${card.title}`}
                  className="relative z-10 w-full py-2.5 border-y border-[#9E2A6B]/45 flex items-center justify-between text-[#B50066] hover:text-[#8F0050] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600 rounded-sm cursor-pointer"
                >
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase">
                    VOLVER AL FRENTE
                  </span>
                  <Undo2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
