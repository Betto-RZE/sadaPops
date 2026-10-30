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
      'De los 31 millones de personas de 15 a 29 años, 14.2 millones estaban fuera de la actividad económica; entre quienes están fuera de la actividad económica y no disponibles para trabajar (86.1%), 64 de cada 100 no trabajaba por estudiar.',
    statPeriod: '1T 2024',
    statSource: 'INEGI, Comunicado núm. 481/24, ENOE (p. 2)',
    sourceUrl: 'https://www.inegi.org.mx/programas/enoe/15ymas/',
    contextText:
      'Entre quienes tienen de 15 a 29 años y están fuera de la actividad económica y no disponibles para trabajar, estudiar es la razón principal.',
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
      'De las 30.4 millones de personas jóvenes (15 a 29 años), 15.9 millones (52.3%) son económicamente activas. En este grupo, la tasa de desocupación es de 4.8% y la tasa de informalidad laboral es de 58.8%.',
    statPeriod: '1T 2025',
    statSource: 'INEGI, Comunicado núm. 116/25, ENOE (pp. 1 y 2)',
    sourceUrl: 'https://www.inegi.org.mx/programas/enoe/15ymas/',
    contextText:
      '95 de cada 100 jóvenes económicamente activos están ocupados, aunque casi seis de cada diez de ellos trabajan en la informalidad laboral.',
  },
  {
    id: 'ya-trabajo',
    number: '03',
    title: 'Ya trabajo',
    shortSituation: 'Tener un empleo remunerado y revisar las condiciones en las que trabajas.',
    imageSrc: '/assets/cards-narrativa/Voxel Laptop, Mug, and Pixel Flowers.png',
    imageAlt: 'Laptop voxel con flor en pantalla, taza de café y pétalos',
    statText:
      'Entre las personas de 15 a 29 años con un trabajo subordinado y remunerado (81.3% de las ocupadas), 48.5% recibió un contrato por escrito, 48.1% tuvo acceso a servicios de salud por su trabajo y 59.3% contó con vacaciones y aguinaldo u otras prestaciones.',
    statPeriod: '1T 2024',
    statSource: 'INEGI, Comunicado núm. 481/24, ENOE (pp. 4 y 5)',
    sourceUrl: 'https://www.inegi.org.mx/programas/enoe/15ymas/',
    contextText:
      'Ocho de cada diez jóvenes ocupados tienen un empleo subordinado y remunerado: casi la mitad tiene contrato por escrito o acceso a salud, y casi seis de cada diez, vacaciones y aguinaldo u otras prestaciones.',
  },
];

interface DayToDayFlipCardsProps {
  activeCardId: string | null;
  onToggleCard: (id: DayToDayCardItem['id']) => void;
  className?: string;
}

export function DayToDayFlipCards({
  activeCardId,
  onToggleCard,
  className,
}: DayToDayFlipCardsProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto pt-6', className)}>
      {DAY_TO_DAY_CARDS.map((card) => {
        const isFlipped = activeCardId === card.id;

        return (
          <div
            key={card.id}
            className="group/card relative w-full h-[525px] sm:h-[545px] lg:h-[560px] [perspective:1400px]"
          >
            {/* ============================================================ */}
            {/* ALFILER SUPERIOR (Glossy Hot-Pink Pushpin Head)               */}
            {/* ============================================================ */}
            <div
              aria-hidden="true"
              className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none"
            >
              {/* Sombra de inserción en el papel */}
              <div className="absolute top-[26px] left-1/2 -translate-x-1/2 w-3.5 h-1.5 rounded-full bg-black/45 blur-[0.8px]" />
              {/* Cabeza de alfiler magenta brillante */}
              <div className="relative w-12 h-12 drop-shadow-[-5px_9px_7px_rgba(25,18,35,0.42)]">
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
              {/* CARA FRONTAL: PÁGINA SATINADA DE REVISTA (Editorial Glossy)  */}
              {/* ============================================================ */}
              <div
                className={cn(
                  'absolute inset-0 w-full h-full rounded-[3px] p-7 sm:p-8 flex flex-col justify-between overflow-hidden',
                  // Superficie satinada marfil / blanco cálido de revista
                  'bg-[#F3EFE8] border border-[#DDD6CB]',
                  // Sombra ambiental física profunda y suave sobre el lienzo de papel
                  'shadow-[-12px_22px_32px_-8px_rgba(18,22,34,0.24),0_4px_12px_rgba(18,22,34,0.08)]',
                  '[backface-visibility:hidden] -webkit-backface-visibility:hidden',
                  'motion-reduce:backface-visible',
                  isFlipped && 'pointer-events-none motion-reduce:invisible'
                )}
              >
                {/* Textura y reflejos satinados de luz sobre papel de revista */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none select-none bg-gradient-to-br from-white/75 via-transparent to-black/[0.04]"
                />
                <div
                  aria-hidden="true"
                  className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/40 blur-2xl pointer-events-none"
                />

                {/* Zona Superior: Número + Línea fina + Etiqueta TU DÍA A DÍA */}
                <div className="relative z-10 flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-3xl sm:text-[34px] text-[#5A6270] font-normal leading-none tracking-tight">
                      {card.number}
                    </span>
                    <span className="w-10 sm:w-12 h-px bg-[#5A6270]/40 inline-block" />
                  </div>
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-[#C8006E]">
                    TU DÍA A DÍA
                  </span>
                </div>

                {/* Zona Central: Título Serif + Descripción + Ilustración Voxel */}
                <div className="relative z-10 my-auto pt-2 pb-1">
                  <h3 className="font-serif font-bold text-[36px] sm:text-[40px] lg:text-[42px] text-[#0F1B2D] leading-[1.03] tracking-tight">
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
                  <p className="mt-2.5 text-[13px] sm:text-[14px] text-[#4A5568] leading-[1.45] max-w-[240px] font-sans">
                    {card.shortSituation}
                  </p>

                  {/* Ilustración Voxel PNG integrada */}
                  <div className="relative mt-4 sm:mt-5 w-full h-[190px] sm:h-[205px] flex items-center justify-center">
                    <div className="relative w-full h-full drop-shadow-[0_10px_16px_rgba(20,24,36,0.14)] transition-transform duration-300 group-hover/card:scale-[1.02]">
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
                <button
                  type="button"
                  onClick={() => onToggleCard(card.id)}
                  aria-expanded={isFlipped}
                  aria-controls={`card-back-${card.id}`}
                  className="relative z-10 w-full py-2.5 border-y border-[#B50066]/40 flex items-center justify-between text-[#B50066] hover:text-[#910052] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600 rounded-sm cursor-pointer group/btn"
                >
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase">
                    TOCA PARA VER EL DATO
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/card:translate-x-1" />
                </button>
              </div>

              {/* ============================================================ */}
              {/* CARA POSTERIOR: DATOS OFICIALES VERIFICADOS (Mismo Satinado) */}
              {/* ============================================================ */}
              <div
                id={`card-back-${card.id}`}
                className={cn(
                  'absolute inset-0 w-full h-full rounded-[3px] p-7 sm:p-8 flex flex-col justify-between overflow-hidden',
                  'bg-[#F3EFE8] border border-[#DDD6CB]',
                  'shadow-[-12px_22px_32px_-8px_rgba(18,22,34,0.24),0_4px_12px_rgba(18,22,34,0.08)]',
                  '[transform:rotateY(180deg)] [backface-visibility:hidden] -webkit-backface-visibility:hidden',
                  'motion-reduce:[transform:none]',
                  !isFlipped && 'pointer-events-none motion-reduce:invisible'
                )}
              >
                {/* Reflejo satinado */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none select-none bg-gradient-to-br from-white/70 via-transparent to-black/[0.03]"
                />

                {/* Zona Superior del Reverso */}
                <div className="relative z-10 flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-2xl text-[#5A6270] font-normal leading-none">
                      {card.number}
                    </span>
                    <span className="w-8 h-px bg-[#5A6270]/40 inline-block" />
                  </div>
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase text-[#C8006E]">
                    DATO OFICIAL • {card.statPeriod}
                  </span>
                </div>

                {/* Contenido Central: Dato verificado + Contexto neutral */}
                <div className="relative z-10 my-auto py-2">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[#5A6270] mb-1.5 font-bold">
                    Situación: {card.title}
                  </p>
                  <p className="font-serif text-[15px] sm:text-[16px] text-[#0F1B2D] leading-[1.4] font-normal mb-3.5">
                    {card.statText}
                  </p>

                  <div className="rounded-[2px] bg-white/70 border border-black/5 p-3.5 mb-3 shadow-inner">
                    <p className="text-xs text-[#2D3748] leading-relaxed font-sans">
                      {card.contextText}
                    </p>
                  </div>

                  <a
                    href={card.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={isFlipped ? 0 : -1}
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#5A6270] hover:text-[#C8006E] transition-colors focus:outline-none focus-visible:underline"
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
                  className="relative z-10 w-full py-2.5 border-y border-[#B50066]/40 flex items-center justify-between text-[#B50066] hover:text-[#910052] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600 rounded-sm cursor-pointer"
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
