'use client';

import React from 'react';
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  ExternalLink,
  RotateCw,
  Undo2,
} from 'lucide-react';
import { cn } from '@/shared/utils';

export interface DayToDayCardItem {
  id: 'estudio' | 'busco-trabajo' | 'ya-trabajo';
  number: string;
  title: string;
  shortSituation: string;
  icon: 'estudio' | 'busco-trabajo' | 'ya-trabajo';
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
    icon: 'estudio',
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
    shortSituation: 'Empezar a trabajar o buscar un empleo al salir de la escuela.',
    icon: 'busco-trabajo',
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
    icon: 'ya-trabajo',
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
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8', className)}>
      {DAY_TO_DAY_CARDS.map((card) => {
        const isFlipped = activeCardId === card.id;

        return (
          <div
            key={card.id}
            className="group/card relative w-full h-[430px] sm:h-[410px] [perspective:1200px]"
          >
            {/* Contenedor Giratorio 3D */}
            <div
              className={cn(
                'relative w-full h-full rounded-3xl transition-transform duration-500 ease-out [transform-style:preserve-3d]',
                'motion-reduce:transition-none',
                isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
              )}
            >
              {/* ============================================================ */}
              {/* CARA FRONTAL (Estilo Editorial con guiño Pixel / Voxel)     */}
              {/* ============================================================ */}
              <div
                className={cn(
                  'absolute inset-0 w-full h-full rounded-3xl p-7 sm:p-8 flex flex-col justify-between',
                  'bg-[#FDFCFA] border border-black/10 shadow-sm transition-all duration-300',
                  'hover:shadow-md hover:border-black/20',
                  '[backface-visibility:hidden] -webkit-backface-visibility:hidden',
                  // En modo movimiento reducido ocultar si está volteada
                  'motion-reduce:backface-visible',
                  isFlipped && 'pointer-events-none motion-reduce:invisible'
                )}
              >
                {/* Cabecera del Frente: Número ordinal + Ícono temático */}
                <div className="flex items-start justify-between">
                  <span className="inline-block text-xs font-black tracking-widest uppercase text-brand-navy/40 font-mono">
                    {card.number}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEEDEA] text-brand-navy shadow-inner">
                    {card.icon === 'estudio' && <GraduationCap className="h-5 w-5" />}
                    {card.icon === 'busco-trabajo' && <Briefcase className="h-5 w-5 text-dalia-600" />}
                    {card.icon === 'ya-trabajo' && <ShieldCheck className="h-5 w-5 text-emerald-700" />}
                  </div>
                </div>

                {/* Centro del Frente: Situación en primera persona */}
                <div className="my-auto py-4">
                  <p className="text-[11px] font-bold tracking-widest uppercase text-dalia-600 mb-1.5 font-mono">
                    Tu día a día
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight leading-tight mb-3">
                    “{card.title}”
                  </h3>
                  <p className="text-sm font-medium text-brand-navy/70 leading-relaxed">
                    {card.shortSituation}
                  </p>
                </div>

                {/* Pie del Frente: Botón / Pill interactivo para voltear */}
                <button
                  type="button"
                  onClick={() => onToggleCard(card.id)}
                  aria-expanded={isFlipped}
                  aria-controls={`card-back-${card.id}`}
                  className="w-full py-3 px-4 rounded-2xl bg-brand-navy text-white text-xs font-bold tracking-wider uppercase flex items-center justify-between transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600 shadow-sm"
                >
                  <span>Toca para ver el dato</span>
                  <span className="flex items-center gap-1.5 text-dalia-300 font-mono text-[11px]">
                    <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                    Girar
                  </span>
                </button>
              </div>

              {/* ============================================================ */}
              {/* CARA POSTERIOR (El Dato Oficial Verificado de INEGI)         */}
              {/* ============================================================ */}
              <div
                id={`card-back-${card.id}`}
                className={cn(
                  'absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-7 flex flex-col justify-between',
                  'bg-white border-2 border-brand-navy/15 shadow-xl',
                  '[transform:rotateY(180deg)] [backface-visibility:hidden] -webkit-backface-visibility:hidden',
                  'motion-reduce:[transform:none]',
                  !isFlipped && 'pointer-events-none motion-reduce:invisible'
                )}
              >
                {/* Cabecera del Reverso: Etiqueta de la Fuente y Periodo Oficial */}
                <div>
                  <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-dalia-600">
                      <span className="w-2 h-2 rounded-full bg-dalia-600" />
                      Dato Oficial Verificado
                    </span>
                    <span className="rounded-md bg-[#EEEDEA] px-2 py-0.5 text-[10px] font-mono font-bold text-brand-navy/70">
                      {card.statPeriod}
                    </span>
                  </div>

                  {/* Situación corta */}
                  <p className="text-xs font-bold text-brand-navy/60 mb-2">
                    Situación: {card.shortSituation}
                  </p>

                  {/* Dato oficial exacto */}
                  <p className="text-xs sm:text-[13px] font-semibold text-brand-navy leading-relaxed mb-3">
                    {card.statText}
                  </p>

                  {/* Contexto neutral explicativo */}
                  <div className="rounded-xl bg-[#F8F7F5] border border-black/5 p-3">
                    <p className="text-[11px] sm:text-xs text-brand-navy/80 leading-relaxed font-normal">
                      {card.contextText}
                    </p>
                  </div>
                </div>

                {/* Pie del Reverso: Enlace Oficial + Botón para Volver */}
                <div className="pt-3 border-t border-black/5 flex items-center justify-between gap-2">
                  <a
                    href={card.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={isFlipped ? 0 : -1}
                    className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-brand-navy/60 hover:text-dalia-600 focus:outline-none focus-visible:underline transition-colors"
                    title={`Consultar fuente: ${card.statSource}`}
                  >
                    <span>Fuente: {card.statSource}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onToggleCard(card.id)}
                    tabIndex={isFlipped ? 0 : -1}
                    aria-label={`Volver al frente de la tarjeta ${card.title}`}
                    className="shrink-0 p-2 rounded-xl bg-[#EEEDEA] hover:bg-brand-navy hover:text-white text-brand-navy transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600"
                    title="Volver al frente"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
