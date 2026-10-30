'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  BarChart3,
  Gamepad2,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Mail,
  MapPin,
  RotateCcw,
  Lock,
  Calendar,
} from 'lucide-react';
import { INE_YOUTH_TURNOUT_2024 } from '../mapa-dalias/data/ineYouthTurnout2024';
import { useOptionalDahliaStore } from '../mapa-dalias/DahliaStore';
import { cn } from '@/shared/utils';
import { MetroTimeline } from './metro-timeline/MetroTimeline';
import {
  InteractiveVoxelDahlia3D,
  DAHLIA_PALETTES,
  type DahliaPalette,
} from './InteractiveVoxelDahlia3D';

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
  const stateTurnout = INE_YOUTH_TURNOUT_2024[effectiveStateId]?.turnoutYouthPercent;

  const dahliaStore = useOptionalDahliaStore();
  const currentCount = dahliaStore?.getCount(effectiveStateId) ?? 0;

  // Estados del formulario unificado
  const [selectedPalette, setSelectedPalette] = useState<DahliaPalette>(DAHLIA_PALETTES[0]);
  const [wantsAlerts, setWantsAlerts] = useState(false);
  const [email, setEmail] = useState('');
  const [isPlanted, setIsPlanted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [alertsSaved, setAlertsSaved] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Restaurar dalia previa por dispositivo (1 dalia por sesión anónima)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sada_dalia_planted_state');
      if (savedState) {
        setIsPlanted(true);
      }
      const savedEmail = localStorage.getItem('sada_alerts_email');
      if (savedEmail) {
        setAlertsSaved(true);
        setEmail(savedEmail);
      }
      const savedColorId = localStorage.getItem('sada_dalia_color_id');
      if (savedColorId) {
        const found = DAHLIA_PALETTES.find((p) => p.id === savedColorId);
        if (found) setSelectedPalette(found);
      }
    }
  }, []);

  const handleSelectPalette = (palette: DahliaPalette) => {
    setSelectedPalette(palette);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sada_dalia_color_id', palette.id);
    }
  };

  const handlePlantDalia = (e: React.FormEvent) => {
    e.preventDefault();

    // Si marcó avisos y no los ha guardado, validar correo
    if (wantsAlerts && !alertsSaved) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email.trim())) {
        setEmailError('Por favor ingresa un correo electrónico válido para recibir los avisos.');
        return;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('sada_alerts_email', email.trim());
      }
      setAlertsSaved(true);
    }

    setEmailError(null);

    // Disparar evento para sumar la dalia en el mapa del Hero sin modificar Hero.tsx
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dalias:add-dahlia', {
          detail: { stateId: effectiveStateId },
        })
      );
      localStorage.setItem('sada_dalia_planted_state', effectiveStateId);
      localStorage.setItem('sada_dalia_color_id', selectedPalette.id);
    }

    setIsPlanted(true);
  };

  const handleRelocateDalia = () => {
    setIsPlanted(false);
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
        {/* 9. TU DALIA Y TUS AVISOS (FORMULARIO UNIFICADO + VISOR 3D VOXEL)          */}
        {/* ========================================================================= */}
        <section
          id="registro-dalia"
          aria-labelledby="registro-dalia-heading"
          className="pt-16 pb-24 border-t border-black/10"
        >
          {/* Encabezado editorial enfocado en la recompensa de la dalia */}
          <div className="max-w-3xl mb-12">
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
              Siembra tu dalia en el mapa de México
            </h3>

            <p className="mt-3 text-base sm:text-lg text-[#334155] leading-relaxed font-sans font-medium">
              Plantar tu dalia no requiere cuenta ni datos personales. Elige tu estado, personaliza tu flor y súmala al territorio.
            </p>
          </div>

          {/* Pliego Único: Formulario Unificado (Izq) + Escenario 3D Voxel (Der) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* =============================================================== */}
            {/* COLUMNA IZQUIERDA: FORMULARIO UNIFICADO (7 COLS)                */}
            {/* =============================================================== */}
            <div className="lg:col-span-7 bg-[#FDFCFA] border border-[#E5DFD7] rounded-[4px] p-7 sm:p-9 shadow-[-8px_14px_28px_-6px_rgba(18,24,38,0.08)] relative overflow-hidden">
              {/* Filete superior dalia */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-dalia-600 via-rose-500 to-amber-500" />

              {/* Cabecera del formulario */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-dalia-600 animate-pulse" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-dalia-700 bg-dalia-50 px-2.5 py-1 rounded-[2px] border border-dalia-200/60">
                    PARTICIPACIÓN CIUDADANA
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#5A6474] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Anónimo · Sin cuenta</span>
                </span>
              </div>

              {!isPlanted ? (
                <form onSubmit={handlePlantDalia} className="space-y-6">
                  {/* PASO 1: Selector de Entidad Federativa */}
                  <div>
                    <label
                      htmlFor="registro-estado-select"
                      className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0F1B2D] mb-1.5"
                    >
                      1. Elige tu entidad federativa
                    </label>
                    <p className="text-xs text-[#5A6474] font-sans mb-3">
                      Tu dalia se sembrará en el mapa nacional de participación y sumará al conteo ciudadano de tu estado.
                    </p>
                    <div className="relative">
                      <select
                        id="registro-estado-select"
                        value={effectiveStateId}
                        onChange={(e) => onSelectState(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#D5CDC3] text-[#0F1B2D] font-serif text-lg font-bold py-3 px-4 pr-10 rounded-[3px] appearance-none focus:outline-none focus:ring-2 focus:ring-dalia-600 cursor-pointer shadow-sm"
                      >
                        {STATE_LIST.map((state) => (
                          <option key={state.id} value={state.id}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-5 h-5 text-black/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Metadatos oficiales INE 2024 de la entidad */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-mono text-[#5A6474]">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-dalia-600" />
                        <strong className="text-[#0F1B2D]">{selectedStateName}</strong>
                      </span>
                      {stateTurnout && (
                        <span className="text-[11px] bg-[#EFEAE2] px-2 py-0.5 rounded-[2px] text-[#2C384A]">
                          Participación juvenil 2024 (INE): <strong>{stateTurnout}%</strong>
                        </span>
                      )}
                      {currentCount > 0 && (
                        <span className="text-[11px] text-dalia-700 font-semibold">
                          {currentCount.toLocaleString('es-MX')} dalias sembradas
                        </span>
                      )}
                    </div>
                  </div>

                  {/* PASO 2: Selector de Color de la Dalia (Actualiza el 3D en vivo) */}
                  <div className="pt-4 border-t border-black/5">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0F1B2D] mb-1.5">
                      2. Elige el tono de tu dalia
                    </label>
                    <p className="text-xs text-[#5A6474] font-sans mb-3">
                      Selecciona una paleta botánica para personalizar tu flor 3D en tiempo real:
                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                      {DAHLIA_PALETTES.map((pal) => {
                        const isSelected = selectedPalette.id === pal.id;
                        return (
                          <button
                            key={pal.id}
                            type="button"
                            onClick={() => handleSelectPalette(pal)}
                            className={cn(
                              'flex flex-col items-center gap-1.5 p-2 rounded-[3px] border transition-all cursor-pointer text-center group',
                              isSelected
                                ? 'bg-white border-[#0F1B2D] shadow-sm ring-2 ring-dalia-600/30'
                                : 'bg-[#F7F4EE]/60 border-[#E2DAD0] hover:bg-white hover:border-[#C5BCB0]'
                            )}
                          >
                            <span
                              className={cn(
                                'w-6 h-6 rounded-full shadow-inner transition-transform group-hover:scale-110 flex items-center justify-center',
                                isSelected && 'ring-2 ring-offset-2 ring-[#0F1B2D]'
                              )}
                              style={{ backgroundColor: pal.hex }}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />}
                            </span>
                            <span
                              className={cn(
                                'text-[10px] font-mono leading-tight',
                                isSelected ? 'font-bold text-[#0F1B2D]' : 'text-[#5A6474]'
                              )}
                            >
                              {pal.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PASO 3: Pregunta en Checkbox + Desplegables de Paradas y Privacidad */}
                  <div className="pt-4 border-t border-black/5 space-y-3">
                    {/* Checkbox con la pregunta oficial */}
                    <label className="flex items-start gap-3 p-3.5 rounded-[4px] bg-[#F7F4EE]/70 border border-[#E2DAD0] hover:border-dalia-600/40 cursor-pointer select-none transition-colors">
                      <input
                        type="checkbox"
                        checked={wantsAlerts}
                        onChange={(e) => {
                          setWantsAlerts(e.target.checked);
                          if (!e.target.checked) setEmailError(null);
                        }}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-dalia-600 focus:ring-dalia-600 cursor-pointer"
                      />
                      <div className="flex-1 text-xs font-sans text-[#0F1B2D]">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-sm text-[#0F1B2D]">
                            ¿Quieres que te recordemos cada parada?
                          </span>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/50 bg-black/5 px-2 py-0.5 rounded-[2px]">
                            OPCIONAL
                          </span>
                        </div>
                        <p className="text-[#5A6474] text-xs mt-1 leading-relaxed">
                          Recibe recordatorios para revisar la vigencia de tu credencial y ubicar tu casilla rumbo al 6 de junio de 2027. Cero mensajes partidistas.
                        </p>
                      </div>
                    </label>

                    {/* Campo de correo electrónico si activa el checkbox */}
                    {wantsAlerts && (
                      <div className="pl-4 sm:pl-7 pt-1 space-y-2 animate-in fade-in-0 duration-200">
                        <p className="text-xs text-[#5A6474] font-sans leading-relaxed">
                          Si quieres avisos para las fechas clave, solo pedimos un correo, y nunca enviamos mensajes de partidos. Antes de una elección recibirás recordatorios para revisar tu credencial, con enlaces a los portales oficiales del INE.
                        </p>
                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu.correo@ejemplo.com"
                            className="w-full bg-white border border-[#D5CDC3] text-[#0F1B2D] font-mono text-xs py-3 px-3.5 pl-9 rounded-[3px] focus:outline-none focus:ring-2 focus:ring-dalia-600 shadow-sm"
                          />
                          <Mail className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {emailError && (
                          <p className="text-xs text-rose-600 font-sans font-medium flex items-center gap-1">
                            <span>⚠</span> {emailError}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Acordeón de Detalles Desplegables (3 Paradas + Aviso de Privacidad) */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                        className="flex items-center gap-2 text-xs font-mono text-[#5A6474] hover:text-[#0F1B2D] transition-colors cursor-pointer select-none py-1"
                      >
                        <Calendar className="w-3.5 h-3.5 text-dalia-600" />
                        <span className="underline underline-offset-2">
                          Ver las 3 paradas hacia 2027 y el Aviso de Privacidad Simplificado
                        </span>
                        {isDetailsOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isDetailsOpen && (
                        <div className="mt-3 p-4 rounded-[4px] bg-[#F7F4EE] border border-[#DDD5C7] space-y-4 text-xs font-sans text-[#2C384A] animate-in fade-in-0 duration-200">
                          {/* Las 3 paradas del Metro electoral */}
                          <div>
                            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D] block mb-2">
                              Las 3 Paradas del Proceso Electoral Federal 2027:
                            </span>
                            <ul className="space-y-2 text-xs">
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-dalia-600 shrink-0 mt-1.5" />
                                <span>
                                  <strong className="font-mono text-[#0F1B2D]">01. Ene 2026 — Vigencia:</strong> Si tu credencial vence en 2026, renuévala con tiempo para evitar filas y asegurar tu inclusión en la lista nominal.
                                </span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                                <span>
                                  <strong className="font-mono text-[#0F1B2D]">02. Ene 2027 — Domicilio:</strong> Última llamada para tramitar cambio de domicilio y actualizar tu sección electoral.
                                </span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                                <span>
                                  <strong className="font-mono text-[#0F1B2D]">03. Jun 2027 — Casilla:</strong> Ubicación de casilla oficial del INE y jornada electoral del domingo 6 de junio.
                                </span>
                              </li>
                            </ul>
                          </div>

                          {/* Aviso de Privacidad Simplificado */}
                          <div className="pt-3 border-t border-black/10">
                            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D] flex items-center gap-1.5 mb-1.5">
                              <Lock className="w-3 h-3 text-[#717E91]" />
                              <span>Aviso de Privacidad Simplificado (Cero Spam):</span>
                            </span>
                            <p className="text-[11px] text-[#5A6474] leading-relaxed">
                              <strong>Responsable:</strong> Proyecto Reto 3 Hackathon INE. Tu correo se utiliza de forma exclusiva para enviar los 3 recordatorios cívicos oficiales hacia el 6 de junio de 2027 con enlaces a portales institucionales del INE. Jamás se comparte con partidos políticos, candidaturas ni empresas privadas. Puedes cancelar tu suscripción con un solo clic desde cualquier mensaje.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón de Acción Principal: Plantar Dalia */}
                  <div className="pt-4 border-t border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-[2px] bg-dalia-600 hover:bg-dalia-500 active:bg-dalia-700 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-dalia-600/30 hover:shadow-lg hover:shadow-dalia-600/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>
                        {wantsAlerts && !alertsSaved
                          ? `Sembrar dalia en ${selectedStateName} y activar avisos`
                          : `Sembrar mi dalia en ${selectedStateName}`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="text-[11px] font-mono text-[#717E91]">
                      1 dalia por dispositivo · Cero PII
                    </p>
                  </div>
                </form>
              ) : (
                /* Estado de Confirmación / Dalia Sembrada */
                <div className="py-4 text-left animate-in fade-in-0 zoom-in-95 duration-300 space-y-5">
                  <div className="inline-flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold uppercase tracking-wider bg-emerald-100/70 border border-emerald-300/60 px-3 py-1.5 rounded-[2px]">
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>Dalia activa en {selectedStateName}</span>
                  </div>

                  <h4 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F1B2D] leading-snug">
                    Una flor no es un voto: es una persona que decidió prepararse.
                  </h4>

                  <p className="text-sm text-[#4A5568] font-sans leading-relaxed">
                    {wantsAlerts || alertsSaved
                      ? `Tu dalia ${selectedPalette.name.toLowerCase()} quedó sembrada de forma anónima en ${selectedStateName}. Te enviaremos los 3 recordatorios cívicos oficiales a tu correo rumbo al 6 de junio de 2027.`
                      : `Tu dalia ${selectedPalette.name.toLowerCase()} quedó registrada de forma 100% anónima en el mapa de ${selectedStateName}.`}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <a
                      href="#hero-mapa"
                      onClick={(e) => {
                        const el = document.getElementById('hero-mapa');
                        if (el) {
                          e.preventDefault();
                          el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-[2px] bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>Ver mi dalia en el mapa ↑</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleRelocateDalia}
                      className="inline-flex items-center gap-1.5 px-4 py-3 rounded-[2px] bg-white border border-[#D5CDC3] hover:bg-[#F7F4EE] text-[#4A5568] font-mono text-xs font-medium transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#717E91]" />
                      <span>Reubicar o cambiar color</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* =============================================================== */}
            {/* COLUMNA DERECHA: ESCENARIO 3D VOXEL INTERACTIVO (5 COLS)        */}
            {/* =============================================================== */}
            <div className="lg:col-span-5">
              <InteractiveVoxelDahlia3D
                palette={selectedPalette}
                isPlanted={isPlanted}
                stateName={selectedStateName}
              />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 10. EXPLORA LOS DATOS                                                     */}
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
                EXPLORA LOS DATOS
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
                    <span>Práctica táctil de doblado y depósito en urna</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-dalia-500 shrink-0" />
                    <span>Simulación neutral sin partidos ni sesgos</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-[0.18em] uppercase text-[#B8A8FF] group-hover:text-white transition-colors">
                  ENTRAR A PRACTICAR
                </span>
                <div className="w-8 h-8 rounded-full bg-white/10 text-[#B8A8FF] flex items-center justify-center transition-transform group-hover:translate-x-1.5 group-hover:bg-[#5E2CE6] group-hover:text-white">
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
