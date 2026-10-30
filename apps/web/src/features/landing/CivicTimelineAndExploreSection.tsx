'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
} from 'lucide-react';
import { INE_YOUTH_TURNOUT_2024 } from '../mapa-dalias/data/ineYouthTurnout2024';
import { useOptionalDahliaStore } from '../mapa-dalias/DahliaStore';
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
  const stateTurnout = INE_YOUTH_TURNOUT_2024[effectiveStateId]?.turnoutYouthPercent;

  const dahliaStore = useOptionalDahliaStore();
  const currentCount = dahliaStore?.getCount(effectiveStateId) ?? 0;
  const currentLevel = (dahliaStore?.getLevel(effectiveStateId) || 3) as 1 | 2 | 3 | 4;

  // Estados de sesión anónima y formulario "Tu dalia y tus avisos"
  const [wantsAlerts, setWantsAlerts] = useState(false);
  const [email, setEmail] = useState('');
  const [isPlanted, setIsPlanted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [alertsSaved, setAlertsSaved] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [justPlantedAnim, setJustPlantedAnim] = useState(false);

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
    }
  }, []);

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
    }

    setIsPlanted(true);
    setJustPlantedAnim(true);
    setTimeout(() => setJustPlantedAnim(false), 1200);
  };

  const handleSaveAlertsStandalone = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setEmailError('Ingresa un correo electrónico válido (ej. tu.nombre@correo.com)');
      return;
    }
    setEmailError(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sada_alerts_email', email.trim());
    }
    setAlertsSaved(true);
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
        {/* 9. TU DALIA Y TUS AVISOS (DIRECTAMENTE DESPUÉS DE LA LÍNEA DE TIEMPO)    */}
        {/* ========================================================================= */}
        <section
          id="registro-dalia"
          aria-labelledby="registro-dalia-heading"
          className="pt-16 pb-24 border-t border-black/10"
        >
          {/* Encabezado editorial institucional (Borrador 3) */}
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
              ¿Quieres que te recordemos cada parada?
            </h3>

            <p className="mt-3 text-base sm:text-lg text-[#334155] leading-relaxed font-sans font-medium">
              Plantar tu dalia no requiere cuenta ni datos personales.
            </p>
          </div>

          {/* Grid de 2 Cédulas Editoriales Independientes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* =============================================================== */}
            {/* ACTO I: TU FLOR EN EL TERRITORIO (Acción Incondicional / Anónima) */}
            {/* =============================================================== */}
            <div className="lg:col-span-7 bg-[#FDFCFA] border border-[#E5DFD7] rounded-[4px] p-7 sm:p-9 shadow-[-8px_14px_28px_-6px_rgba(18,24,38,0.08)] relative overflow-hidden flex flex-col justify-between">
              {/* Filete superior editorial dalia */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-dalia-600 via-rose-500 to-amber-500" />

              <div>
                {/* Cabecera de la Cédula */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-black/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-dalia-600 animate-pulse" />
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-dalia-700 bg-dalia-50 px-2.5 py-1 rounded-[2px] border border-dalia-200/60">
                      ACTO I · HUELLA CÍVICA
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#5A6474] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Anónimo · Sin cuenta</span>
                  </span>
                </div>

                {!isPlanted ? (
                  <form onSubmit={handlePlantDalia} className="space-y-6">
                    {/* Pedestal de la Dalia e Info de la Entidad */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 rounded-[4px] bg-[#F7F4EE]/70 border border-[#E8E1D5]">
                      {/* Visualizador / Brote de Dalia */}
                      <div className="relative shrink-0 flex flex-col items-center justify-center p-3 w-28 h-28 sm:w-32 sm:h-32 rounded-[4px] bg-white border border-[#E2DAD0] shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-t from-dalia-500/10 via-transparent to-transparent rounded-[4px]" />
                        <div className={cn('relative transition-transform duration-300', justPlantedAnim && 'scale-110')}>
                          <Image
                            src={`/flowers/dahlia-${currentLevel}.png`}
                            alt="Dalia de participación"
                            width={54}
                            height={62}
                            className="drop-shadow-[0_6px_10px_rgba(200,0,110,0.25)] select-none"
                            priority
                          />
                        </div>
                        <span className="relative mt-2 text-[10px] font-mono font-semibold tracking-wider text-dalia-800 uppercase text-center">
                          Flor Cívica
                        </span>
                      </div>

                      {/* Selector de Entidad */}
                      <div className="flex-1 w-full">
                        <label
                          htmlFor="registro-estado-select"
                          className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0F1B2D] mb-1.5"
                        >
                          1. Elige tu entidad federativa
                        </label>
                        <p className="text-xs text-[#5A6474] font-sans mb-3">
                          Tu dalia sumará al mapa interactivo de tu estado y aumentará el florecimiento ciudadano.
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

                        {/* Metadatos oficiales del INE para este estado */}
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-mono text-[#5A6474]">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-dalia-600" />
                            <strong className="text-[#0F1B2D]">{selectedStateName}</strong>
                          </span>
                          {stateTurnout && (
                            <span className="text-[11px] bg-[#EFEAE2] px-2 py-0.5 rounded-[2px] text-[#2C384A]">
                              Participación 18-29 años (2024): <strong>{stateTurnout}%</strong>
                            </span>
                          )}
                          {currentCount > 0 && (
                            <span className="text-[11px] text-dalia-700 font-semibold">
                              {currentCount.toLocaleString('es-MX')} dalias registradas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botón de Acción Principal: Plantar Dalia */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                        1 dalia por dispositivo · Sin cookies invasivas
                      </p>
                    </div>
                  </form>
                ) : (
                  /* Estado de Confirmación / Dalia Sembrada */
                  <div className="py-3 text-left animate-in fade-in-0 zoom-in-95 duration-300">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-[4px] bg-[#F3F9F5] border border-[#CDE5D8]">
                      {/* Flor florecida con efecto halo */}
                      <div className="relative shrink-0 flex flex-col items-center justify-center p-3 w-28 h-28 sm:w-32 sm:h-32 rounded-[4px] bg-white border border-[#BDE0CC] shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-dalia-500/10 to-transparent rounded-[4px]" />
                        <Image
                          src={`/flowers/dahlia-4.png`}
                          alt="Dalia florecida"
                          width={60}
                          height={68}
                          className="drop-shadow-[0_8px_14px_rgba(200,0,110,0.3)] animate-pulse"
                        />
                        <span className="relative mt-2 text-[10px] font-mono font-bold tracking-wider text-emerald-800 uppercase">
                          Sembrada
                        </span>
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <div className="inline-flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold uppercase tracking-wider bg-emerald-100/70 border border-emerald-300/60 px-2.5 py-1 rounded-[2px] mb-3">
                          <Check className="w-4 h-4 text-emerald-700" />
                          <span>Dalia activa en {selectedStateName}</span>
                        </div>

                        <h4 className="font-serif text-2xl sm:text-[28px] font-bold text-[#0F1B2D] leading-snug">
                          Una flor no es un voto: es una persona que decidió prepararse.
                        </h4>

                        <p className="mt-2.5 text-xs sm:text-sm text-[#4A5568] font-sans leading-relaxed">
                          Tu participación anónima ha quedado registrada en el mapa nacional de participación ciudadana.
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <a
                            href="#hero-mapa"
                            onClick={(e) => {
                              const el = document.getElementById('hero-mapa');
                              if (el) {
                                e.preventDefault();
                                el.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[2px] bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                          >
                            <span>Ver mi dalia en el mapa ↑</span>
                          </a>

                          <button
                            type="button"
                            onClick={handleRelocateDalia}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[2px] bg-white border border-[#D5CDC3] hover:bg-[#F7F4EE] text-[#4A5568] font-mono text-xs font-medium transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#717E91]" />
                            <span>Reubicar entidad</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* =============================================================== */}
            {/* ACTO II: ESTAFETA DE AVISOS 2027 (Servicio Postal Cívico)       */}
            {/* =============================================================== */}
            <div className="lg:col-span-5 bg-[#F8F6F1] border border-[#DDD5C7] rounded-[4px] p-7 sm:p-8 shadow-[-8px_14px_28px_-6px_rgba(18,24,38,0.06)] relative overflow-hidden flex flex-col justify-between">
              {/* Filete superior institucional azul / dalia */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-dalia-600" />

              <div>
                {/* Cabecera de la Cédula Postal */}
                <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-black/5">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-700" />
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-blue-800">
                      ACTO II · ESTAFETA 2027
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-black/50 bg-black/5 px-2 py-0.5 rounded-[2px]">
                    100% OPCIONAL
                  </span>
                </div>

                <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1B2D] leading-tight">
                  Bitácora hacia el 6 de junio de 2027
                </h4>

                <p className="mt-2 text-xs sm:text-[13px] text-[#4A5568] font-sans leading-relaxed">
                  Si quieres avisos para las fechas clave, solo pedimos un correo, y nunca enviamos mensajes de partidos. Antes de una elección recibirás recordatorios para revisar tu credencial, con enlaces a los portales oficiales del INE.
                </p>

                {/* Síntesis visual de las 3 Paradas del Metro hacia 2027 */}
                <div className="mt-4 p-3.5 rounded-[3px] bg-white/70 border border-[#E2DAD0] space-y-2 text-xs font-sans text-[#2C384A]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-dalia-600 shrink-0" />
                    <span><strong className="font-mono text-[#0F1B2D]">Ene 2026:</strong> Revisa la vigencia de tu credencial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                    <span><strong className="font-mono text-[#0F1B2D]">Ene 2027:</strong> Fecha límite para cambio de domicilio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span><strong className="font-mono text-[#0F1B2D]">Jun 2027:</strong> Ubicación de casilla y jornada electoral</span>
                  </div>
                </div>

                {/* Formulario o Estado de Avisos */}
                <div className="mt-5 pt-4 border-t border-black/5">
                  {!alertsSaved ? (
                    <div className="space-y-4">
                      {/* Checkbox de Activación */}
                      <label className="flex items-start gap-3 p-3 rounded-[3px] bg-white border border-[#D5CDC3] hover:border-dalia-600/50 cursor-pointer select-none transition-colors">
                        <input
                          type="checkbox"
                          checked={wantsAlerts}
                          onChange={(e) => {
                            setWantsAlerts(e.target.checked);
                            if (!e.target.checked) setEmailError(null);
                          }}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-dalia-600 focus:ring-dalia-600 cursor-pointer"
                        />
                        <div className="text-xs font-sans text-[#0F1B2D] leading-relaxed">
                          <span className="font-bold">Deseo activar avisos por correo</span>
                          <span className="block text-[#5A6474] text-[11px] mt-0.5">
                            Solo 3 correos en 2 años. Cero spam, cero partidos.
                          </span>
                        </div>
                      </label>

                      {/* Input de correo si el checkbox está activo */}
                      {wantsAlerts && (
                        <div className="space-y-3 animate-in fade-in-0 duration-200 pt-1">
                          <div>
                            <label
                              htmlFor="estafeta-email-input"
                              className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#0F1B2D] mb-1.5"
                            >
                              Tu correo electrónico oficial
                            </label>
                            <div className="relative">
                              <input
                                id="estafeta-email-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu.correo@ejemplo.com"
                                className="w-full bg-white border border-[#D5CDC3] text-[#0F1B2D] font-mono text-xs py-3 px-3.5 pl-9 rounded-[3px] focus:outline-none focus:ring-2 focus:ring-dalia-600 shadow-sm"
                              />
                              <Mail className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            {emailError && (
                              <p className="mt-1.5 text-xs text-rose-600 font-sans font-medium flex items-center gap-1">
                                <span>⚠</span> {emailError}
                              </p>
                            )}
                          </div>

                          {/* Si la dalia ya fue sembrada, botón individual para guardar alertas */}
                          {isPlanted && (
                            <button
                              type="button"
                              onClick={handleSaveAlertsStandalone}
                              className="w-full py-2.5 px-4 rounded-[2px] bg-blue-700 hover:bg-blue-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                            >
                              Programar avisos 2027
                            </button>
                          )}
                        </div>
                      )}

                      {/* Desplegable de Privacidad */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setIsPrivacyOpen(!isPrivacyOpen)}
                          className="flex items-center gap-1.5 text-[11px] font-mono text-[#5A6474] hover:text-[#0F1B2D] underline underline-offset-2 transition-colors cursor-pointer"
                        >
                          <Lock className="w-3 h-3 text-[#717E91]" />
                          <span>Aviso de Privacidad Simplificado</span>
                          {isPrivacyOpen ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        {isPrivacyOpen && (
                          <div className="mt-2.5 p-3 rounded-[3px] bg-white/90 border border-black/10 text-[11px] font-sans text-[#5A6474] leading-relaxed animate-in fade-in-0 duration-150">
                            <p>
                              <strong>Responsable:</strong> Proyecto Reto 3 Hackathon INE.
                            </p>
                            <p className="mt-1">
                              <strong>Finalidad:</strong> Tu correo se utilizará de forma exclusiva para enviar los 3 recordatorios cívicos oficiales hacia el 6 de junio de 2027 con enlaces a portales del INE.
                            </p>
                            <p className="mt-1">
                              <strong>Cero Spam:</strong> Jamás se comparte con partidos políticos, candidaturas ni empresas privadas. Cancelación en un clic desde cualquier mensaje.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Confirmación de Avisos Programados */
                    <div className="p-4 rounded-[3px] bg-white border border-[#CDE5D8] space-y-2 text-left animate-in fade-in-0 duration-200">
                      <div className="flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold uppercase tracking-wider">
                        <Check className="w-4 h-4 text-emerald-700" />
                        <span>Avisos oficiales programados</span>
                      </div>
                      <p className="text-xs text-[#4A5568] font-sans">
                        Te enviaremos los recordatorios a <strong>{email}</strong> con enlaces directos a las herramientas oficiales del INE.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setAlertsSaved(false);
                          setWantsAlerts(true);
                        }}
                        className="text-[11px] font-mono text-blue-700 hover:text-blue-900 underline underline-offset-2 mt-1 cursor-pointer"
                      >
                        Cambiar dirección de correo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
