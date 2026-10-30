'use client';

import React, { useMemo } from 'react';
import {
  INE_YOUTH_TURNOUT_2024,
  getYouthTurnoutBenchmark,
} from '../mapa-dalias/data/ineYouthTurnout2024';
import { ArrowUpRight, ArrowDownRight, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils';

interface CivicBridgeAndGapSectionProps {
  selectedStateId: string | null;
  onSelectState: (stateId: string) => void;
  className?: string;
}

const STATE_LIST = Object.values(INE_YOUTH_TURNOUT_2024).sort((a, b) =>
  a.name.localeCompare(b.name, 'es')
);

// Datos de la gráfica nacional CCPC 2024
const AGE_GROUPS_DATA = [
  {
    id: '18-19',
    number: '01',
    cohort: '18 a 19 años',
    label: 'Primer voto',
    turnout: 56.8,
    fillColor: '#4E3FA8', // Tono índigo intermedio del mapa
    note: 'Al comenzar la vida cívica, más de la mitad acude a votar.',
  },
  {
    id: '20-29',
    number: '02',
    cohort: '20 a 29 años',
    label: 'La caída más marcada',
    turnout: 47.8,
    fillColor: '#6654D8', // Color principal del mapa de México
    isFocus: true,
    note: 'Menos de la mitad. El tramo etario con menor participación.',
  },
  {
    id: '60+',
    number: '03',
    cohort: '60 años y más (60+)',
    label: 'Hábito constante',
    turnout: 71.4,
    fillColor: '#342687', // Tono profundo de los acantilados del mapa
    note: 'Más de siete de cada diez personas acuden a las urnas.',
  },
];

export function CivicBridgeAndGapSection({
  selectedStateId,
  onSelectState,
  className,
}: CivicBridgeAndGapSectionProps) {
  // Estado activo: si el mapa seleccionó uno, usarlo; de lo contrario por defecto '09' (CDMX)
  const effectiveStateId = selectedStateId || '09';
  const stateBenchmark = useMemo(
    () => getYouthTurnoutBenchmark(effectiveStateId),
    [effectiveStateId]
  );
  const stateName = INE_YOUTH_TURNOUT_2024[effectiveStateId]?.name || 'tu estado';

  return (
    <div className={cn('space-y-16 lg:space-y-24 max-w-6xl mx-auto px-4 sm:px-6', className)}>
      {/* ========================================================================= */}
      {/* PASO 2: PUENTE CONSTITUCIONAL Y OBJECIÓN CENTRAL (Estilo Editorial)       */}
      {/* ========================================================================= */}
      <section aria-labelledby="puente-heading" className="max-w-4xl mx-auto">
        {/* Metadato de navegación editorial */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1 font-mono text-xs sm:text-[13px]">
            <span className="font-bold text-[#5E4EC8]">02</span>
            <span className="text-black/30 font-light">/</span>
            <span className="text-black/40 font-medium">06</span>
          </div>
          <div className="w-12 h-px bg-[#5E4EC8]/35" />
          <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.22em] uppercase text-black/55">
            EL MECANISMO
          </span>
        </div>

        {/* Título editorial principal */}
        <h3
          id="puente-heading"
          className="font-serif font-bold text-3xl sm:text-4xl md:text-[42px] text-[#0F1B2D] tracking-tight leading-[1.08] mb-6"
        >
          Quién decide y quién aparece
        </h3>

        {/* Párrafo del puente constitucional */}
        <p className="text-sm sm:text-base text-[#3A4354] leading-[1.65] font-sans font-normal mb-8 max-w-3xl">
          Estos temas se deciden, en parte, por quienes eligen y por quienes aparecen. Un ejemplo concreto:
          en junio de 2027 se eligen las 500 diputaciones federales. Esa Cámara aprueba cada año el
          Presupuesto de Egresos de la Federación, una facultad que le corresponde en exclusiva, y que asigna
          recursos públicos a educación, salud y programas de empleo. Junto con el Senado, el Congreso legisla
          en materia laboral y de seguridad social.
        </p>

        {/* Cita editorial destacada (Pull-quote) */}
        <div className="relative pl-6 sm:pl-8 py-2 border-l-2 border-[#5E4EC8]/70 my-6">
          <p className="font-serif text-lg sm:text-xl text-[#0F1B2D] leading-snug font-normal italic">
            “Si piensas que tu voto solo no cambia nada, tienes parte de razón. Lo que pesa es que quienes
            tienen tu edad aparezcan.”
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PASO 3: BLOQUE NEGRO EDITORIAL • GRÁFICA COMPARATIVA CCPC 2024            */}
      {/* ========================================================================= */}
      <section
        aria-labelledby="brecha-heading"
        className="rounded-[4px] bg-[#0A0B0E] text-white p-7 sm:p-12 lg:p-16 relative overflow-hidden border border-white/10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)]"
      >
        {/* Retícula editorial de fondo mate */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '36px 36px',
          }}
        />

        <div className="relative z-10">
          {/* Cabecera del bloque: Metadato de navegación + Línea de imprenta */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-mono text-xs sm:text-[13px]">
                <span className="font-bold text-[#A8A7FF]">03</span>
                <span className="text-white/30 font-light">/</span>
                <span className="text-white/40 font-medium">06</span>
              </div>
              <div className="w-12 h-px bg-[#5E4EC8]/50" />
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.22em] uppercase text-white/60">
                LA BRECHA GENERACIONAL
              </span>
            </div>

            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-white/40">
              INE CCPC 2024 · ELECCIÓN FEDERAL
            </span>
          </div>

          {/* Titular en Serif Editorial idéntico al de las tarjetas */}
          <div className="max-w-3xl mb-12">
            <h3
              id="brecha-heading"
              className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-[1.04] mb-5"
            >
              Por qué importa aparecer
            </h3>
            <p className="text-sm sm:text-base text-white/70 leading-[1.65] font-sans font-normal">
              A los 18 y 19 años, más de la mitad participa (56.8%). De los 20 a los 29, menos de la mitad
              (47.8%). Desde los 60, más de siete de cada diez (71.4%). Estos datos muestran quién vota, no por qué.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* GRÁFICA EDITORIAL DE BARRAS COMPARATIVAS (Paleta del mapa de México)     */}
          {/* ========================================================================= */}
          <div
            className="pb-10 border-b border-white/10"
            role="region"
            aria-label="Gráfica comparativa de participación electoral por grupo de edad, INE CCPC 2024"
          >
            {/* Eje superior de escala gráfica (0% a 100%) */}
            <div className="relative mb-6 pb-2 border-b border-white/10 hidden sm:block">
              <div className="flex justify-between text-[10px] font-mono tracking-widest uppercase text-white/40">
                <span>0%</span>
                <span className="pl-6">25%</span>
                <span className="pl-6">50%</span>
                <span className="pl-6">75%</span>
                <span>100%</span>
              </div>

              {/* Guía vertical de la media nacional (59.7%) en escala proporcional */}
              <div
                aria-hidden="true"
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{ left: '59.7%' }}
              >
                <div className="h-full w-px border-l border-dashed border-[#A8A7FF]/50" />
              </div>
            </div>

            {/* Filas de la gráfica de barras */}
            <div className="space-y-7 relative">
              {/* Línea vertical continua que atraviesa todas las barras en el 59.7% */}
              <div
                aria-hidden="true"
                className="absolute top-0 bottom-0 pointer-events-none hidden sm:block z-20"
                style={{ left: '59.7%' }}
              >
                <div className="h-full w-px border-l border-dashed border-[#A8A7FF]/40" />
              </div>

              {AGE_GROUPS_DATA.map((item) => (
                <div key={item.id} className="group">
                  {/* Etiqueta superior de la barra: Cohorte + Cifra grande en serif */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[10px] tracking-wider uppercase text-white/40">
                        {item.number}
                      </span>
                      <span
                        className={cn(
                          'text-sm sm:text-base font-serif',
                          item.isFocus ? 'font-bold text-white' : 'font-normal text-white/90'
                        )}
                      >
                        {item.cohort}
                      </span>
                      <span className="text-[11px] font-mono text-white/40 hidden md:inline">
                        · {item.label}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          'font-serif text-2xl sm:text-3xl font-bold leading-none',
                          item.isFocus ? 'text-[#CEC9FA]' : 'text-white'
                        )}
                      >
                        {item.turnout}%
                      </span>
                      <span className="text-[10px] font-mono text-white/40 uppercase">participación</span>
                    </div>
                  </div>

                  {/* Barra horizontal comparativa con el color índigo del mapa */}
                  <div className="h-7 sm:h-8 w-full bg-white/[0.04] rounded-[2px] relative overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-[1px] transition-all duration-700 ease-out flex items-center justify-end pr-3"
                      style={{
                        width: `${item.turnout}%`,
                        backgroundColor: item.fillColor,
                      }}
                    >
                      {/* Borde sutil de relieve superior como los acantilados del mapa */}
                      <div className="absolute inset-x-0 top-0 h-px bg-white/20 pointer-events-none" />
                    </div>
                  </div>

                  {/* Nota descriptiva al pie de cada barra */}
                  <p className="mt-1.5 text-xs text-white/50 font-sans leading-relaxed">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>

            {/* Referencia de escala nacional explicativa */}
            <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-white/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-0.5 bg-[#A8A7FF] inline-block" />
                <span>
                  REFERENCIA NACIONAL · TODAS LAS EDADES:{' '}
                  <strong className="text-white">59.7%</strong> (INE CCPC 2024)
                </span>
              </div>
              <span className="text-white/40 text-[11px]">
                Brecha: 23.6 puntos entre el grupo de 20–29 y el de 60+
              </span>
            </div>
          </div>

          {/* Nota de incentivos al pie (mecanismo suavizado) */}
          <div className="py-6 border-b border-white/10">
            <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed max-w-3xl">
              Quienes compiten por el voto tienen razones para pensar, sobre todo, en quienes sí votan.
              Es uno de varios factores.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* PERSONALIZACIÓN POR ESTADO (Diseño Editorial Minimalista Integrado)       */}
          {/* ========================================================================= */}
          <div className="pt-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              {/* Selector tipo índice editorial con subrayado fino */}
              <div className="flex-1 max-w-md">
                <label
                  htmlFor="state-turnout-select"
                  className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#A8A7FF] block mb-2"
                >
                  CONSULTA TU ENTIDAD FEDERATIVA (18 A 29 AÑOS)
                </label>

                <div className="relative">
                  <select
                    id="state-turnout-select"
                    value={effectiveStateId}
                    onChange={(e) => onSelectState(e.target.value)}
                    className="w-full bg-transparent border-b border-white/30 hover:border-white/60 focus:border-[#7A74F0] text-white font-serif text-2xl sm:text-3xl font-bold py-2 pr-10 appearance-none focus:outline-none transition-colors cursor-pointer rounded-none"
                  >
                    {STATE_LIST.map((state) => (
                      <option key={state.id} value={state.id} className="bg-[#0A0B0E] text-white">
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-white/40 absolute right-1 bottom-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Resultado tipográfico editorial */}
              {stateBenchmark && (
                <div className="flex-1 text-left md:text-right">
                  <div className="inline-flex items-center gap-2 mb-1">
                    <span className="font-serif text-3xl sm:text-4xl text-white font-bold leading-none">
                      {stateBenchmark.turnoutYouthPercent}%
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-0.5 text-xs font-mono font-semibold px-2 py-0.5 rounded-[2px]',
                        stateBenchmark.diff >= 0
                          ? 'text-white bg-white/10'
                          : 'text-[#A8A7FF] bg-[#231768] border border-[#5E4EC8]/40'
                      )}
                    >
                      {stateBenchmark.diff >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-[#A8A7FF]" />
                      )}
                      {stateBenchmark.diffLabel}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 font-mono tracking-wide">
                    vs. promedio nacional de 18 a 29 años (49.1%)
                  </p>
                </div>
              )}
            </div>

            {/* Aclaración descriptiva */}
            {stateBenchmark && (
              <p className="mt-6 text-xs text-white/60 font-sans leading-relaxed border-t border-white/5 pt-4">
                En <strong className="text-white">{stateName}</strong>, la participación juvenil en 2024 se ubicó en{' '}
                <strong className="text-white">{stateBenchmark.turnoutYouthPercent}%</strong>. Los datos censales del INE
                permiten conocer cómo se comporta cada entidad federativa frente a la media nacional de 18 a 29 años.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
