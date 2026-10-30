'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
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

// Filas de la gráfica con sus valores oficiales exactos del INE CCPC 2024
const AGE_ROWS = [
  {
    id: '18-19',
    number: '01',
    cohort: '18 a 19 años',
    tag: 'PRIMER VOTO',
    turnout: 56.8,
    note: 'Al comenzar la vida cívica, más de la mitad acude a votar.',
  },
  {
    id: '20-29',
    number: '02',
    cohort: '20 a 29 años',
    tag: 'LA CAÍDA MÁS MARCADA',
    turnout: 47.8,
    note: 'Menos de la mitad. El tramo etario con menor participación.',
  },
  {
    id: '60+',
    number: '03',
    cohort: '60 años y más (60+)',
    tag: 'HÁBITO CONSTANTE',
    turnout: 71.4,
    note: 'Más de siete de cada diez personas acuden a las urnas.',
  },
];

export function CivicBridgeAndGapSection({
  selectedStateId,
  onSelectState,
  className,
}: CivicBridgeAndGapSectionProps) {
  // Estado activo: sincronizado con el mapa o por defecto '09' (CDMX)
  const effectiveStateId = selectedStateId || '09';
  const stateBenchmark = useMemo(
    () => getYouthTurnoutBenchmark(effectiveStateId),
    [effectiveStateId]
  );
  const stateName = INE_YOUTH_TURNOUT_2024[effectiveStateId]?.name || 'tu estado';

  return (
    <div className={cn('space-y-16 lg:space-y-20 max-w-6xl mx-auto px-4 sm:px-6', className)}>
      {/* ========================================================================= */}
      {/* PASO 2: PUENTE CONSTITUCIONAL Y OBJECIÓN CENTRAL                          */}
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

        {/* Cita editorial destacada */}
        <div className="relative pl-6 sm:pl-8 py-2 border-l-2 border-[#5E4EC8]/70 my-6">
          <p className="font-serif text-lg sm:text-xl text-[#0F1B2D] leading-snug font-normal italic">
            “Si piensas que tu voto solo no cambia nada, tienes parte de razón. Lo que pesa es que quienes
            tienen tu edad aparezcan.”
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PASO 3: BLOQUE NEGRO EDITORIAL (Fiel a mockParticipacion.png)              */}
      {/* ========================================================================= */}
      <section
        aria-labelledby="brecha-heading"
        className="rounded-2xl sm:rounded-3xl bg-[#0B0C10] text-white p-6 sm:p-10 lg:p-14 relative overflow-hidden border border-white/10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6)]"
      >
        <div className="relative z-10">
          {/* Cabecera superior: 03 / 06 LA BRECHA GENERACIONAL + INE CCPC 2024 */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-mono text-xs sm:text-[13px]">
                <span className="font-bold text-[#A8A7FF]">03</span>
                <span className="text-white/40 font-light">/ 06</span>
              </div>
              <div className="w-12 h-px bg-[#5E4EC8]" />
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-white/70">
                LA BRECHA GENERACIONAL
              </span>
            </div>

            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-white/40">
              INE CCPC 2024 • ELECCIÓN FEDERAL
            </span>
          </div>

          {/* Titular tipográfico: "Por qué importa aparecer" ("importa" en cursiva lavanda) */}
          <div className="max-w-3xl mb-12">
            <h3
              id="brecha-heading"
              className="font-serif font-bold text-3xl sm:text-5xl lg:text-[56px] text-white tracking-tight leading-[1.04]"
            >
              Por qué <span className="font-serif italic font-normal text-[#B8A8FF]">importa</span> aparecer
            </h3>
            <p className="mt-4 text-sm sm:text-[15px] text-[#9E9EA7] leading-relaxed font-sans font-normal max-w-2xl">
              A los 18 y 19 años, más de la mitad participa (56.8%). De los 20 a los 29, menos de la mitad (47.8%).
              Desde los 60, más de siete de cada diez (71.4%). Estos datos muestran quién vota, no por qué.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* GRÁFICA VISUAL 1:1 CON mockParticipacion.png                              */}
          {/* ========================================================================= */}
          <div className="relative pt-2 pb-6">
            {/* Eje horizontal superior con ticks y porcentajes (0%, 25%, 50%, 75%, 100%) */}
            <div className="relative mb-8 pb-3 hidden md:block">
              {/* Ticks y etiquetas */}
              <div className="flex justify-between text-[10px] font-mono tracking-wider text-white/40 relative">
                <span className="relative">
                  0%
                  <span className="absolute left-1/2 -bottom-2 w-px h-1.5 bg-white/20 -translate-x-1/2" />
                </span>
                <span className="relative">
                  25%
                  <span className="absolute left-1/2 -bottom-2 w-px h-1.5 bg-white/20 -translate-x-1/2" />
                </span>
                <span className="relative">
                  50%
                  <span className="absolute left-1/2 -bottom-2 w-px h-1.5 bg-white/20 -translate-x-1/2" />
                </span>
                <span className="relative">
                  75%
                  <span className="absolute left-1/2 -bottom-2 w-px h-1.5 bg-white/20 -translate-x-1/2" />
                </span>
                <span className="relative">
                  100%
                  <span className="absolute left-1/2 -bottom-2 w-px h-1.5 bg-white/20 -translate-x-1/2" />
                </span>
              </div>
              {/* Línea horizontal del eje */}
              <div className="mt-2 w-full h-px bg-white/10" />
            </div>

            {/* Contenedor relativo de las 3 filas con la línea vertical discontinua */}
            <div className="space-y-10 sm:space-y-12 relative">
              {/* Línea guía vertical continua a través de todas las barras (media nacional 59.7%) */}
              <div
                aria-hidden="true"
                className="absolute top-0 bottom-0 pointer-events-none hidden md:block z-20"
                style={{ left: '59.7%' }}
              >
                <div className="h-full w-px border-l border-dashed border-[#7866D5]/50" />
              </div>

              {/* Render de cada cohorte generacional */}
              {AGE_ROWS.map((row) => (
                <div key={row.id} className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 sm:gap-6">
                  {/* Columna Izquierda: Número + Urna Voxel */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0 md:w-32">
                    <span className="font-serif font-bold text-base sm:text-lg text-[#A8A7FF] w-6">
                      {row.number}
                    </span>
                    <div className="relative w-14 sm:w-16 h-14 sm:h-16 shrink-0">
                      <Image
                        src="/assets/cards-narrativa/Isometric_Purple _Ballot_Box _con.png"
                        alt="Urna electoral voxel violeta con boleta"
                        width={64}
                        height={64}
                        className="w-full h-full object-contain pointer-events-none select-none"
                      />
                    </div>
                  </div>

                  {/* Columna Central: Título + Barra + Texto descriptivo */}
                  <div className="flex-1 min-w-0">
                    {/* Título de la cohorte y etiqueta */}
                    <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                      <h4 className="font-serif font-bold text-lg sm:text-xl text-white">
                        {row.cohort}
                      </h4>
                      <span className="text-white/30 font-light">-</span>
                      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/50">
                        {row.tag}
                      </span>
                    </div>

                    {/* Track de la barra horizontal */}
                    <div className="h-7 sm:h-8 w-full rounded-[4px] bg-[#161820] border border-white/[0.06] overflow-hidden relative">
                      {/* Relleno con gradiente idéntico al mock (de morado intenso a lavanda suave) */}
                      <div
                        className="h-full rounded-l-[3px] bg-gradient-to-r from-[#5E4EC8] via-[#7566E0] to-[#9988FC] transition-all duration-700 ease-out"
                        style={{ width: `${row.turnout}%` }}
                      />
                    </div>

                    {/* Texto descriptivo al pie de la barra */}
                    <p className="mt-1.5 text-xs text-[#8A8D98] font-sans">
                      {row.note}
                    </p>
                  </div>

                  {/* Columna Derecha: Porcentaje Monumental + PARTICIPACIÓN */}
                  <div className="flex items-baseline justify-end md:justify-end gap-2 md:w-44 shrink-0 pt-1 md:pt-0">
                    <span className="font-serif font-bold text-3xl sm:text-4xl text-white tracking-tight leading-none">
                      {row.turnout}%
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/40">
                      PARTICIPACIÓN
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Guía explicativa al pie de la gráfica */}
            <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-white/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#9988FC] inline-block" />
                <span>
                  REFERENCIA NACIONAL · TODAS LAS EDADES:{' '}
                  <strong className="text-white">59.7%</strong> (INE CCPC 2024)
                </span>
              </div>
              <span className="text-white/40 text-[11px]">
                Brecha: 23.6 puntos entre 20–29 y 60+
              </span>
            </div>

            {/* Mecanismo neutral */}
            <p className="mt-4 text-xs sm:text-sm text-white/65 font-sans leading-relaxed max-w-3xl">
              Quienes compiten por el voto tienen razones para pensar, sobre todo, en quienes sí votan.
              Es uno de varios factores.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* PERSONALIZACIÓN POR ESTADO (Integrada con elegancia al bloque)            */}
          {/* ========================================================================= */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              {/* Selector tipo índice editorial */}
              <div className="flex-1 max-w-md">
                <label
                  htmlFor="state-turnout-select"
                  className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#B8A8FF] block mb-2"
                >
                  CONSULTA TU ENTIDAD FEDERATIVA (18 A 29 AÑOS)
                </label>

                <div className="relative">
                  <select
                    id="state-turnout-select"
                    value={effectiveStateId}
                    onChange={(e) => onSelectState(e.target.value)}
                    className="w-full bg-transparent border-b border-white/25 hover:border-white/50 focus:border-[#9988FC] text-white font-serif text-2xl sm:text-3xl font-bold py-2 pr-10 appearance-none focus:outline-none transition-colors cursor-pointer rounded-none"
                  >
                    {STATE_LIST.map((state) => (
                      <option key={state.id} value={state.id} className="bg-[#0B0C10] text-white">
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-white/40 absolute right-1 bottom-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Cifra estatal comparada */}
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
                          : 'text-[#B8A8FF] bg-[#231768] border border-[#5E4EC8]/40'
                      )}
                    >
                      {stateBenchmark.diff >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-[#B8A8FF]" />
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
              <p className="mt-5 text-xs text-white/60 font-sans leading-relaxed">
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
