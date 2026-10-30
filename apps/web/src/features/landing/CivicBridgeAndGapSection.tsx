'use client';

import React, { useMemo } from 'react';
import {
  INE_YOUTH_TURNOUT_2024,
  getYouthTurnoutBenchmark,
} from '../mapa-dalias/data/ineYouthTurnout2024';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/shared/utils';

interface CivicBridgeAndGapSectionProps {
  selectedStateId: string | null;
  onSelectState: (stateId: string) => void;
  className?: string;
}

const STATE_LIST = Object.values(INE_YOUTH_TURNOUT_2024).sort((a, b) =>
  a.name.localeCompare(b.name, 'es')
);

export function CivicBridgeAndGapSection({
  selectedStateId,
  onSelectState,
  className,
}: CivicBridgeAndGapSectionProps) {
  // Estado activo: si el mapa seleccionó uno, usarlo; de lo contrario por defecto '09' (CDMX) o el primero
  const effectiveStateId = selectedStateId || '09';
  const stateBenchmark = useMemo(
    () => getYouthTurnoutBenchmark(effectiveStateId),
    [effectiveStateId]
  );
  const stateName = INE_YOUTH_TURNOUT_2024[effectiveStateId]?.name || 'tu estado';

  return (
    <div className={cn('space-y-16 lg:space-y-20', className)}>
      {/* ========================================================================= */}
      {/* PASO 2: PUENTE CONSTITUCIONAL Y OBJECIÓN CENTRAL                          */}
      {/* ========================================================================= */}
      <section aria-labelledby="puente-heading" className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Indicador de progreso limpio */}
        <div className="flex items-center gap-2.5 sm:gap-3 mb-5">
          <div className="flex items-center gap-1 font-mono text-xs sm:text-[13px]">
            <span className="font-bold text-dalia-600">02</span>
            <span className="text-black/30 font-light">/</span>
            <span className="text-black/40 font-medium">06</span>
          </div>
          <div className="w-10 sm:w-16 h-px bg-dalia-600/35" />
          <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.22em] uppercase text-black/55">
            EL MECANISMO
          </span>
        </div>

        {/* Título editorial */}
        <h3
          id="puente-heading"
          className="font-serif font-bold text-2xl sm:text-3xl md:text-[34px] text-[#0F1B2D] tracking-tight leading-[1.18] mb-5"
        >
          Quién decide y quién aparece
        </h3>

        {/* Párrafo del puente constitucional */}
        <p className="text-sm sm:text-base text-brand-navy/80 leading-relaxed font-sans font-normal mb-6">
          Estos temas se deciden, en parte, por quienes eligen y por quienes aparecen. Un ejemplo concreto:
          en junio de 2027 se eligen las 500 diputaciones federales. Esa Cámara aprueba cada año el
          Presupuesto de Egresos de la Federación, una facultad que le corresponde en exclusiva, y que asigna
          recursos públicos a educación, salud y programas de empleo. Junto con el Senado, el Congreso legisla
          en materia laboral y de seguridad social.
        </p>

        {/* Destacado de la Objeción Central */}
        <div className="relative pl-5 sm:pl-6 py-2.5 border-l-2 border-dalia-600/80 bg-white/40 rounded-r-2xl">
          <p className="font-serif text-base sm:text-lg text-brand-navy leading-snug font-medium italic">
            “Si piensas que tu voto solo no cambia nada, tienes parte de razón. Lo que pesa es que quienes
            tienen tu edad aparezcan.”
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PASO 3: BLOQUE OSCURO (brand-navy) • LA BRECHA GENERACIONAL               */}
      {/* ========================================================================= */}
      <section
        aria-labelledby="brecha-heading"
        className="rounded-3xl bg-[#141E30] text-white p-7 sm:p-10 lg:p-12 relative overflow-hidden shadow-2xl border border-white/10 max-w-5xl mx-auto"
      >
        {/* Textura sutil isométrica de fondo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10">
          {/* Metadato superior de navegación */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4">
            <div className="flex items-center gap-1 font-mono text-xs sm:text-[13px]">
              <span className="font-bold text-dalia-400">03</span>
              <span className="text-white/30 font-light">/</span>
              <span className="text-white/40 font-medium">06</span>
            </div>
            <div className="w-10 sm:w-16 h-px bg-dalia-500/40" />
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.22em] uppercase text-white/60">
              LA BRECHA GENERACIONAL
            </span>
          </div>

          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-dalia-400 font-semibold block mb-2">
            INE CCPC 2024 • Elección Federal
          </span>

          <h3
            id="brecha-heading"
            className="font-serif font-bold text-2xl sm:text-3xl md:text-[36px] text-white tracking-tight leading-tight mb-4"
          >
            Por qué importa aparecer
          </h3>

          {/* Copy principal con honestidad metodológica */}
          <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-3xl mb-10 font-normal">
            A los 18 y 19 años, más de la mitad participa (56.8%). De los 20 a los 29, menos de la mitad
            (47.8%). Desde los 60, más de siete de cada diez (71.4%). Estos datos muestran quién vota, no por qué.
          </p>

          {/* ========================================================================= */}
          {/* GRÁFICA DE BARRAS HORIZONTALES (CCPC INE 2024)                            */}
          {/* ========================================================================= */}
          <div
            className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-sm"
            role="region"
            aria-label="Gráfica de participación por rango de edad según CCPC 2024 del INE"
          >
            {/* Cabecera de la gráfica: Etiquetas de los dos promedios para cero confusión */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4 mb-6">
              <span className="text-xs font-mono tracking-wider uppercase text-white/70 font-semibold">
                Participación oficial (% sí votaron)
              </span>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Promedio nacional de todas las edades: 59.7%</span>
              </div>
            </div>

            {/* Contenedor de barras relativas al 100% */}
            <div className="space-y-6 relative">
              {/* Línea vertical de referencia del promedio nacional (59.7%) */}
              <div
                aria-hidden="true"
                className="hidden sm:block absolute top-0 bottom-0 z-20 pointer-events-none"
                style={{ left: '59.7%' }}
              >
                <div className="h-full w-px border-l-2 border-dashed border-emerald-400/70" />
                <span className="absolute -bottom-6 -translate-x-1/2 text-[10px] font-mono font-bold text-emerald-400 whitespace-nowrap bg-[#141E30] px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Media nac.: 59.7%
                </span>
              </div>

              {/* Barra 1: 18–19 años */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                  <span className="text-white/90">
                    18 a 19 años <span className="text-white/40 font-mono text-xs">(Primeras elecciones)</span>
                  </span>
                  <span className="font-mono font-bold text-white text-sm sm:text-base">56.8%</span>
                </div>
                <div className="w-full h-7 rounded-lg bg-white/10 overflow-hidden relative">
                  <div
                    className="h-full rounded-lg bg-[#3B5A82] transition-all duration-700 ease-out flex items-center justify-end pr-2.5"
                    style={{ width: '56.8%' }}
                  >
                    <span className="text-[10px] font-mono text-white/80 font-bold hidden sm:inline">56.8%</span>
                  </div>
                </div>
              </div>

              {/* Barra 2: 20–29 años (Destacada en Rosa Dalia) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                  <span className="text-dalia-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-dalia-500 animate-pulse" />
                    20 a 29 años <span className="text-dalia-300/70 font-mono text-xs">(Menos de la mitad)</span>
                  </span>
                  <span className="font-mono font-bold text-dalia-400 text-sm sm:text-base">47.8%</span>
                </div>
                <div className="w-full h-8 rounded-lg bg-white/10 overflow-hidden relative ring-2 ring-dalia-500/40">
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-dalia-700 to-dalia-600 transition-all duration-700 ease-out flex items-center justify-end pr-3 shadow-lg shadow-dalia-600/30"
                    style={{ width: '47.8%' }}
                  >
                    <span className="text-[11px] font-mono text-white font-bold">47.8%</span>
                  </div>
                </div>
              </div>

              {/* Barra 3: 60 años y más (60+) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                  <span className="text-white/90">
                    60 años y más (60+) <span className="text-white/40 font-mono text-xs">(Hábito de participar)</span>
                  </span>
                  <span className="font-mono font-bold text-white text-sm sm:text-base">71.4%</span>
                </div>
                <div className="w-full h-7 rounded-lg bg-white/10 overflow-hidden relative">
                  <div
                    className="h-full rounded-lg bg-[#4F6D96] transition-all duration-700 ease-out flex items-center justify-end pr-2.5"
                    style={{ width: '71.4%' }}
                  >
                    <span className="text-[10px] font-mono text-white/80 font-bold hidden sm:inline">71.4%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Frase del mecanismo suavizada al pie de la gráfica */}
            <div className="mt-8 pt-5 border-t border-white/10">
              <p className="text-xs sm:text-sm text-white/75 font-sans leading-relaxed">
                Quienes compiten por el voto tienen razones para pensar, sobre todo, en quienes sí votan.
                Es uno de varios factores.
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PERSONALIZACIÓN POR ESTADO (Rango exacto: 18 a 29 años)                    */}
          {/* ========================================================================= */}
          <div className="rounded-2xl bg-white/[0.07] border border-white/15 p-6 sm:p-7 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-4 h-4 text-dalia-400 shrink-0" />
                <label htmlFor="state-turnout-select" className="text-sm font-bold text-white">
                  ¿Y en tu estado? Selecciona una entidad:
                </label>
              </div>

              {/* Selector de Estado accesible */}
              <select
                id="state-turnout-select"
                value={effectiveStateId}
                onChange={(e) => onSelectState(e.target.value)}
                className="bg-[#1C2541] text-white text-xs sm:text-sm font-medium border border-white/20 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dalia-500 cursor-pointer w-full sm:w-auto"
              >
                {STATE_LIST.map((state) => (
                  <option key={state.id} value={state.id} className="bg-[#141E30] text-white">
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Resultado dinámico con los dos promedios distinguidos */}
            {stateBenchmark && (
              <div className="pt-2 text-xs sm:text-sm text-white/90 leading-relaxed font-sans">
                <p>
                  En <strong className="text-white underline decoration-dalia-500 underline-offset-4">{stateName}</strong>, quienes
                  tienen entre 18 y 29 años votaron{' '}
                  <strong className="text-dalia-300 font-mono text-sm sm:text-base">
                    {stateBenchmark.turnoutYouthPercent}%
                  </strong>{' '}
                  en 2024,{' '}
                  <span className="inline-flex items-center gap-1 font-semibold text-white">
                    {stateBenchmark.diff > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400 inline" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-amber-400 inline" />
                    )}
                    {stateBenchmark.diffLabel}
                  </span>{' '}
                  del <strong className="text-white/95">promedio nacional de 18 a 29 años (49.1%, INE CCPC 2024)</strong>.
                </p>
                <p className="mt-1.5 text-[11px] text-white/50 font-mono">
                  Fuente: Conteos Censales de Participación Ciudadana (CCPC 2024) del INE.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
