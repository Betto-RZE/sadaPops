'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  BarChart3,
  Gamepad2,
  Check,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { INE_YOUTH_TURNOUT_2024 } from '../mapa-dalias/data/ineYouthTurnout2024';
import { cn } from '@/shared/utils';
import { MetroTimeline } from './metro-timeline/MetroTimeline';

interface CivicTimelineAndExploreSectionProps {
  /** Estado seleccionado actualmente (sincronizado con el mapa y la sección de brecha) */
  selectedStateId: string | null;
  onSelectState: (stateId: string) => void;
  className?: string;
}

const STATE_LIST = Object.values(INE_YOUTH_TURNOUT_2024).sort((a, b) =>
  a.name.localeCompare(b.name, 'es')
);

export function CivicTimelineAndExploreSection({
  selectedStateId,
  onSelectState,
  className,
}: CivicTimelineAndExploreSectionProps) {
  const effectiveStateId = selectedStateId || '09';
  const selectedStateName =
    INE_YOUTH_TURNOUT_2024[effectiveStateId]?.name || 'tu entidad federativa';

  // Estados del formulario "Tu dalia y tus avisos"
  const [wantsAlerts, setWantsAlerts] = useState(false);
  const [email, setEmail] = useState('');
  const [isPlanted, setIsPlanted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handlePlantDalia = (e: React.FormEvent) => {
    e.preventDefault();

    if (wantsAlerts) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email.trim())) {
        setEmailError('Por favor ingresa un correo electrónico válido para recibir los avisos.');
        return;
      }
    }

    setEmailError(null);

    // Disparar evento para sumar la dalia en el mapa del Hero sin modificar Hero.tsx
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dalias:add-dahlia', {
          detail: { stateId: effectiveStateId },
        })
      );
    }

    setIsPlanted(true);
  };

  return (
    <div className={cn('w-full relative', className)}>
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        {/* ========================================================================= */}
        {/* 8. RESPIRO Y LÍNEA DE TIEMPO (HACIA EL DOMINGO 6 DE JUNIO DE 2027)        */}
        {/* ========================================================================= */}
        <section
          id="respiro-timeline"
          aria-labelledby="respiro-heading"
          className="pt-20 sm:pt-28 pb-16 border-t border-black/10"
        >
          {/* Encabezado editorial */}
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4">
              <div className="flex items-center gap-1 font-mono text-xs sm:text-[13px]">
                <span className="font-bold text-dalia-600">04</span>
                <span className="text-black/30 font-light">/</span>
                <span className="text-black/40 font-medium">06</span>
              </div>
              <div className="w-10 sm:w-16 h-px bg-dalia-600/35" />
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.22em] uppercase text-black/55">
                RESPIRO Y LÍNEA DE TIEMPO
              </span>
            </div>

            <h3
              id="respiro-heading"
              className="font-serif font-bold text-3xl sm:text-4xl lg:text-[44px] text-[#0F1B2D] tracking-tight leading-[1.12]"
            >
              Esto no es destino: al empezar, a los 18 y 19 años, más de la mitad sí participa.
            </h3>

            <p className="mt-3.5 text-base sm:text-lg text-[#334155] leading-relaxed font-sans">
              Tres paradas hacia el 6 de junio de 2027 para reducir la distancia entre «me interesa» y «estoy listo»:
            </p>
          </div>

          {/* Tres Paradas: escenario ferroviario voxel (tren + andenes) */}
          <MetroTimeline />
        </section>

        {/* ========================================================================= */}
        {/* 9. TU DALIA Y TUS AVISOS (DIRECTAMENTE DESPUÉS DE LA LÍNEA DE TIEMPO)    */}
        {/* ========================================================================= */}
        <section
          id="registro-dalia"
          aria-labelledby="registro-dalia-heading"
          className="pt-16 pb-20 border-t border-black/10"
        >
          <div className="max-w-3xl mb-8">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4">
              <div className="flex items-center gap-1 font-mono text-xs sm:text-[13px]">
                <span className="font-bold text-dalia-600">05</span>
                <span className="text-black/30 font-light">/</span>
                <span className="text-black/40 font-medium">06</span>
              </div>
              <div className="w-10 sm:w-16 h-px bg-dalia-600/35" />
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.22em] uppercase text-black/55">
                TU DALIA Y TUS AVISOS
              </span>
            </div>

            <h3
              id="registro-dalia-heading"
              className="font-serif font-bold text-3xl sm:text-4xl lg:text-[42px] text-[#0F1B2D] tracking-tight leading-[1.12]"
            >
              ¿Quieres que te recordemos cada parada?
            </h3>

            <p className="mt-3 text-base sm:text-lg text-[#334155] leading-relaxed font-sans font-medium">
              Plantar tu dalia no requiere cuenta ni datos personales.
            </p>
          </div>

          {/* Formulario / Tarjeta de Registro */}
          <div className="max-w-2xl bg-[#FDFCFA] border border-[#E5DFD7] rounded-[4px] p-7 sm:p-9 shadow-[-8px_14px_28px_-6px_rgba(18,24,38,0.08)]">
            {!isPlanted ? (
              <form onSubmit={handlePlantDalia} className="space-y-6">
                {/* Selector de Estado */}
                <div>
                  <label
                    htmlFor="registro-estado-select"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0F1B2D] mb-2"
                  >
                    1. Selecciona tu entidad federativa para tu dalia
                  </label>
                  <div className="relative">
                    <select
                      id="registro-estado-select"
                      value={effectiveStateId}
                      onChange={(e) => onSelectState(e.target.value)}
                      className="w-full bg-[#F5F2EC] border border-[#D5CDC3] text-[#0F1B2D] font-serif text-lg font-bold py-3 px-4 pr-10 rounded-[3px] appearance-none focus:outline-none focus:ring-2 focus:ring-dalia-600 cursor-pointer"
                    >
                      {STATE_LIST.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-black/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Checkbox opcional de avisos */}
                <div className="pt-3 border-t border-black/5">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wantsAlerts}
                      onChange={(e) => {
                        setWantsAlerts(e.target.checked);
                        if (!e.target.checked) setEmailError(null);
                      }}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-dalia-600 focus:ring-dalia-600"
                    />
                    <span className="text-xs sm:text-sm text-[#0F1B2D] font-medium leading-relaxed font-sans">
                      Deseo activar avisos para las fechas clave rumbo al 6 de junio de 2027.
                    </span>
                  </label>

                  {/* Campo de correo electrónico (aparece si el checkbox está activo) */}
                  {wantsAlerts && (
                    <div className="mt-4 pl-7 space-y-2 animate-in fade-in-0 duration-200">
                      <p className="text-xs text-[#5A6474] font-sans leading-relaxed">
                        Si quieres avisos para las fechas clave, solo pedimos un correo, y nunca enviamos mensajes de
                        partidos. Antes de una elección recibirás recordatorios para revisar tu credencial, con enlaces a
                        los portales oficiales del INE.
                      </p>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu.correo@ejemplo.com"
                        className="w-full bg-[#F5F2EC] border border-[#D5CDC3] text-[#0F1B2D] text-sm py-2.5 px-3.5 rounded-[3px] focus:outline-none focus:ring-2 focus:ring-dalia-600"
                      />
                      {emailError && (
                        <p className="text-xs text-rose-600 font-sans font-medium">{emailError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Botón de plantar dalia */}
                <div className="pt-4 border-t border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[2px] bg-dalia-600 hover:bg-dalia-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-dalia-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600 cursor-pointer"
                  >
                    <span>
                      {wantsAlerts ? 'Plantar mi dalia y activar avisos' : 'Plantar mi dalia'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] font-mono text-[#717E91]">
                    Se reflejará en el mapa interactivo
                  </p>
                </div>
              </form>
            ) : (
              /* Estado de Confirmación tras plantar la dalia */
              <div className="py-4 text-left animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="flex items-center gap-3 text-emerald-700 font-mono text-xs font-bold uppercase tracking-wider mb-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-700" />
                  </div>
                  <span>Dalia plantada en {selectedStateName}</span>
                </div>

                <h4 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F1B2D] mt-2 leading-snug">
                  Una flor no es un voto: es una persona que decidió prepararse.
                </h4>

                <p className="mt-3 text-xs sm:text-sm text-[#4A5568] font-sans leading-relaxed">
                  {wantsAlerts
                    ? `Guardamos tu correo. Te enviaremos recordatorios oportunos para revisar tu credencial con enlaces a los portales oficiales del INE rumbo al 6 de junio de 2027.`
                    : `Tu participación quedó registrada de forma anónima en el mapa de ${selectedStateName}.`}
                </p>

                <div className="mt-6 pt-4 border-t border-black/5 flex items-center gap-2 text-xs font-mono text-dalia-700">
                  <Sparkles className="w-4 h-4" />
                  <span>Tu dalia se ha sumado al mapa de México.</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 10. EXPLORA LOS DATOS (OPCIONAL)                                          */}
        {/* ========================================================================= */}
        <section
          id="explora-modulos"
          aria-labelledby="explora-modulos-heading"
          className="pt-16 pb-24 border-t border-black/10"
        >
          {/* Encabezado editorial */}
          <div className="max-w-3xl mb-12 sm:mb-14">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4">
              <div className="flex items-center gap-1 font-mono text-xs sm:text-[13px]">
                <span className="font-bold text-dalia-600">06</span>
                <span className="text-black/30 font-light">/</span>
                <span className="text-black/40 font-medium">06</span>
              </div>
              <div className="w-10 sm:w-16 h-px bg-dalia-600/35" />
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.22em] uppercase text-black/55">
                EXPLORA LOS DATOS (OPCIONAL)
              </span>
            </div>

            <h3
              id="explora-modulos-heading"
              className="font-serif font-bold text-3xl sm:text-4xl lg:text-[44px] text-[#0F1B2D] tracking-tight leading-[1.12]"
            >
              Dos formas de profundizar en las cifras
            </h3>

            <p className="mt-3.5 text-base sm:text-lg text-[#4A5568] leading-relaxed font-sans">
              Para quien quiera profundizar, y también accesible desde el menú, sin ser requisito para plantar la dalia
              ni para activar avisos.
            </p>
          </div>

          {/* Grid de 2 Tarjetas Editoriales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 lg:gap-8">
            {/* Tarjeta A: Dashboard interactivo guiado por preguntas */}
            <Link
              href="/datos"
              className="group flex flex-col justify-between p-8 sm:p-9 rounded-[4px] bg-[#FDFCFA] border border-[#E5DFD7] shadow-[-8px_14px_28px_-6px_rgba(18,24,38,0.08)] hover:shadow-[-12px_20px_36px_-6px_rgba(18,24,38,0.14)] hover:border-[#D0C7BC] transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 opacity-90" />

              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-12 h-12 rounded-[3px] bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-105">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-[2px] border border-blue-200/50">
                    CENSO OFICIAL CCPC
                  </span>
                </div>

                <h4 className="font-serif text-2xl sm:text-[28px] font-bold text-[#0F1B2D] group-hover:text-blue-900 transition-colors leading-tight">
                  Dashboard interactivo guiado por preguntas
                </h4>

                <p className="mt-3 text-sm text-[#4A5568] leading-relaxed font-sans">
                  Gráficas según el tipo de dato, filtros y explicaciones cortas para responder con datos oficiales:
                </p>

                {/* Preguntas literales del Borrador 3 */}
                <ul className="mt-5 space-y-2.5 pt-4 border-t border-black/5 text-xs sm:text-[13px] font-sans text-[#2C384A]">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                    <span className="font-medium italic">¿Cuánto vota mi estado?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                    <span className="font-medium italic">¿Ha cambiado la participación de mi edad desde 2009?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                    <span className="font-medium italic">¿Votan más hombres o mujeres?</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-black/5 flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-[0.18em] uppercase text-blue-700 group-hover:text-blue-900 transition-colors">
                  ABRIR DASHBOARD CCPC
                </span>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center transition-transform group-hover:translate-x-1.5 group-hover:bg-blue-600 group-hover:text-white">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Tarjeta B: Modo Juego de práctica en casilla */}
            <Link
              href="/juego"
              className="group flex flex-col justify-between p-8 sm:p-9 rounded-[4px] bg-[#0A0F1D] border border-[#1E293B] shadow-[-8px_14px_28px_-6px_rgba(10,15,29,0.35)] hover:shadow-[-12px_20px_36px_-6px_rgba(10,15,29,0.5)] hover:border-[#334155] transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-dalia-600 via-purple-500 to-indigo-500 opacity-90" />

              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-12 h-12 rounded-[3px] bg-white/10 border border-white/15 text-white flex items-center justify-center transition-transform group-hover:scale-105">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#B8A8FF] bg-[#221752] px-2.5 py-1 rounded-[2px] border border-[#48339E]">
                    PIXEL ART RETRO
                  </span>
                </div>

                <h4 className="font-serif text-2xl sm:text-[28px] font-bold text-white group-hover:text-purple-200 transition-colors leading-tight">
                  Práctica de procedimiento en casilla
                </h4>

                <p className="mt-3 text-sm text-white/70 leading-relaxed font-sans">
                  Usa datos reales de la CCPC y permite practicar el procedimiento en una casilla (cómo marcar, doblar y
                  depositar la boleta) con una boleta de práctica de opciones neutrales, sin partidos, candidaturas ni
                  colores partidistas.
                </p>

                {/* Características clave en viñetas */}
                <ul className="mt-5 space-y-2.5 pt-4 border-t border-white/10 text-xs sm:text-[13px] font-sans text-white/80">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-dalia-500 shrink-0" />
                    <span>Desmiente mitos con datos de la CCPC</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-dalia-500 shrink-0" />
                    <span>Boleta de práctica neutral (sin partidos)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-dalia-500 shrink-0" />
                    <span>Módulo opcional de profundización</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-[0.18em] uppercase text-[#B8A8FF] group-hover:text-white transition-colors">
                  ENTRAR A PRACTICAR
                </span>
                <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center transition-transform group-hover:translate-x-1.5 group-hover:bg-dalia-600">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
