'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { INE_YOUTH_TURNOUT_2024 } from '../mapa-dalias/data/ineYouthTurnout2024';
import { useOptionalDahliaStore } from '../mapa-dalias/DahliaStore';
import { cn } from '@/shared/utils';
import { MetroTimeline } from './metro-timeline/MetroTimeline';
import { DahliaRegistrationSection } from './registro-dalia/DahliaRegistrationSection';
import { REGISTRATION_THEMES, DEFAULT_REGISTRATION_THEME, type RegistrationTheme } from './registro-dalia/themes';

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
  const [selectedPalette, setSelectedPalette] = useState<RegistrationTheme>(DEFAULT_REGISTRATION_THEME);
  const [wantsAlerts, setWantsAlerts] = useState(false);
  const [email, setEmail] = useState('');
  const [isPlanted, setIsPlanted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [alertsSaved, setAlertsSaved] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Estado del carrusel horizontal en móvil para "Explora los datos" (estilo "Tu día a día")
  const exploreCarouselRef = useRef<HTMLDivElement>(null);
  const [activeExploreSlide, setActiveExploreSlide] = useState(0);

  const handleExploreScroll = () => {
    if (!exploreCarouselRef.current) return;
    const el = exploreCarouselRef.current;
    const scrollLeft = el.scrollLeft;
    const itemWidth = el.offsetWidth * 0.82;
    const nextIndex = Math.min(Math.max(Math.round(scrollLeft / itemWidth), 0), 1);
    if (nextIndex !== activeExploreSlide) {
      setActiveExploreSlide(nextIndex);
    }
  };

  const scrollToExploreSlide = (index: number) => {
    if (!exploreCarouselRef.current) return;
    const el = exploreCarouselRef.current;
    const cards = el.querySelectorAll<HTMLElement>('[data-explore-slide]');
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

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
        const found = REGISTRATION_THEMES.find((p) => p.id === savedColorId);
        if (found) setSelectedPalette(found);
      }
    }
  }, []);

  const handleSelectPalette = (palette: RegistrationTheme) => {
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
        {/* 9. TU DALIA Y TUS AVISOS (HOJA EDITORIAL)          */}
        {/* ========================================================================= */}
        <DahliaRegistrationSection
          stateId={effectiveStateId}
          stateName={selectedStateName}
          states={STATE_LIST}
          turnout={stateTurnout}
          count={currentCount}
          theme={selectedPalette}
          isPlanted={isPlanted}
          wantsAlerts={wantsAlerts}
          email={email}
          emailError={emailError}
          alertsSaved={alertsSaved}
          detailsOpen={isDetailsOpen}
          onStateChange={onSelectState}
          onThemeChange={handleSelectPalette}
          onAlertsChange={(checked) => {
            setWantsAlerts(checked);
            if (!checked) setEmailError(null);
          }}
          onEmailChange={setEmail}
          onDetailsChange={() => setIsDetailsOpen(!isDetailsOpen)}
          onSubmit={handlePlantDalia}
          onEdit={handleRelocateDalia}
        />

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

          {/* Carrusel horizontal con snap en mobile (< lg) / Composición Zig-Zag en desktop (>= lg) */}
          <div className="relative w-full">
            <div
              ref={exploreCarouselRef}
              onScroll={handleExploreScroll}
              className={cn(
                'flex overflow-x-auto snap-x snap-mandatory gap-6 -mx-6 px-6 pt-2 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                'lg:space-y-14 lg:overflow-visible lg:mx-0 lg:px-0 lg:pt-0 lg:pb-0 lg:block'
              )}
            >
              {/* ================================================================= */}
              {/* FILA / SLIDE 01: Polaroid Izquierda + Ficha Derecha (CCPC)        */}
              {/* ================================================================= */}
              <Link
                href="/datos"
                data-explore-slide
                className="group block focus:outline-none shrink-0 snap-center w-[88vw] sm:w-[78vw] max-w-[480px] lg:w-full lg:max-w-none lg:shrink"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-10 items-center">
                  {/* Columna Izquierda: Polaroid Voxel CCPC */}
                  <div className="relative w-full aspect-[1536/1024] select-none transition-transform duration-500 ease-out group-hover:scale-[1.018] md:group-hover:-rotate-[0.6deg]">
                    {/* Sombra de contacto suave sobre el papel */}
                    <div
                      aria-hidden
                      className="absolute left-[12%] right-[12%] bottom-[6%] h-[12%] rounded-[50%] bg-[#0F1B2D]/12 blur-md"
                    />

                    {/* Fotografía interior (card-dashboard.jpeg) encajada en las coordenadas calibradas */}
                    <div
                      className="absolute overflow-hidden rounded-[2px]"
                      style={{
                        left: '16.08%',
                        right: '15.69%',
                        top: '20.90%',
                        bottom: '25.88%',
                      }}
                    >
                      <Image
                        src="/card-dashboard.jpeg"
                        alt="Ilustración pixel art del explorador de datos CCPC del INE"
                        fill
                        sizes="(min-width: 1024px) 45vw, 92vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      {/* Bisel interior para profundidad 3D */}
                      <div
                        aria-hidden
                        className="absolute inset-0 pointer-events-none shadow-[inset_0_2px_6px_rgba(15,27,45,0.22)]"
                      />
                    </div>

                    {/* Marco Polaroid con cinta adhesiva rosa sobrepuesta */}
                    <div className="absolute inset-0 pointer-events-none select-none">
                      <Image
                        src="/Pink-Taped Polaroid Frame.png"
                        alt=""
                        aria-hidden
                        fill
                        sizes="(min-width: 1024px) 48vw, 95vw"
                        className="object-contain drop-shadow-[0_12px_24px_rgba(18,24,38,0.12)]"
                      />
                    </div>

                    {/* Barbilla inferior de la Polaroid: Rótulo editorial */}
                    <div
                      className="absolute z-10 flex items-center justify-between px-3 pointer-events-none"
                      style={{
                        left: '16.08%',
                        right: '15.69%',
                        top: '78%',
                        height: '11%',
                      }}
                    >
                      <span className="font-mono text-[9px] sm:text-[11px] font-bold tracking-[0.16em] uppercase text-[#6E6277]">
                        FIG. 01 · CENSO CCPC
                      </span>
                      <span className="font-mono text-[9px] sm:text-[10px] text-[#8E8099] tracking-wider uppercase">
                        INE MÉXICO
                      </span>
                    </div>
                  </div>

                  {/* Columna Derecha: Ficha de Archivo Editorial CCPC */}
                  <div className="bg-[#F8F5EE] border border-[#E2DBD0] rounded-[4px] p-5 sm:p-7 lg:p-9 shadow-[0_8px_22px_rgba(20,24,35,0.06),0_2px_6px_rgba(20,24,35,0.04)] group-hover:shadow-[0_12px_28px_rgba(20,24,35,0.09)] transition-shadow duration-300">
                    {/* Encabezado de la Ficha */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-bold text-[#18181B] border-b border-black/70 pb-[1px]">01</span>
                        <span className="text-black/30">/</span>
                        <span className="font-bold tracking-[0.16em] uppercase text-[#4B5563] text-[10px] sm:text-[11px]">
                          EXPEDIENTE · DATOS CCPC
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-[#71717A] uppercase">
                        REF. INE-CCPC-2024
                      </span>
                    </div>

                    {/* Línea divisoria superior */}
                    <div className="w-full h-px bg-black/10 mt-3 sm:mt-3.5 mb-3.5 sm:mb-5" />

                    {/* Titular en Newsreader */}
                    <h4 className="font-serif font-bold text-xl sm:text-2xl lg:text-[32px] text-[#0F1B2D] tracking-tight leading-[1.14] group-hover:text-blue-900 transition-colors">
                      Dashboard interactivo guiado por preguntas
                    </h4>

                    {/* Descripción editorial */}
                    <p className="mt-2 text-xs sm:text-[13.5px] text-[#52525B] leading-relaxed font-sans">
                      Gráficas según el tipo de dato, filtros por entidad y grupo de edad, y explicaciones cortas para responder con datos oficiales.
                    </p>

                    {/* Línea divisoria media */}
                    <div className="w-full h-px bg-black/10 my-3.5 sm:my-5" />

                    {/* Lista de preguntas con pastillas A.1, A.2, A.3 */}
                    <ul className="space-y-2 sm:space-y-3 font-sans text-xs sm:text-[13px] text-[#1F2937]">
                      <li className="flex items-center gap-2.5 sm:gap-3">
                        <span className="inline-flex items-center justify-center font-mono font-bold text-[10px] sm:text-[11px] text-[#374151] bg-[#E8E2D8]/80 border border-[#D8D0C3] rounded-[3px] px-1.5 sm:px-2 py-0.5 min-w-[2.2rem] sm:min-w-[2.4rem] shrink-0">
                          A.1
                        </span>
                        <span className="font-medium text-[#18181B]">¿Cuánto vota mi estado?</span>
                      </li>
                      <li className="flex items-center gap-2.5 sm:gap-3">
                        <span className="inline-flex items-center justify-center font-mono font-bold text-[10px] sm:text-[11px] text-[#374151] bg-[#E8E2D8]/80 border border-[#D8D0C3] rounded-[3px] px-1.5 sm:px-2 py-0.5 min-w-[2.2rem] sm:min-w-[2.4rem] shrink-0">
                          A.2
                        </span>
                        <span className="font-medium text-[#18181B]">¿Ha cambiado la participación de mi edad desde 2009?</span>
                      </li>
                      <li className="flex items-center gap-2.5 sm:gap-3">
                        <span className="inline-flex items-center justify-center font-mono font-bold text-[10px] sm:text-[11px] text-[#374151] bg-[#E8E2D8]/80 border border-[#D8D0C3] rounded-[3px] px-1.5 sm:px-2 py-0.5 min-w-[2.2rem] sm:min-w-[2.4rem] shrink-0">
                          A.3
                        </span>
                        <span className="font-medium text-[#18181B]">¿Votan más hombres o mujeres?</span>
                      </li>
                    </ul>

                    {/* Pie de acción CTA */}
                    <div className="mt-5 sm:mt-7 pt-1 flex items-center gap-2">
                      <span className="font-mono text-xs sm:text-[12px] font-bold tracking-[0.16em] uppercase text-[#D81B60] group-hover:text-[#AD1457] transition-colors flex items-center gap-2">
                        <span>ABRIR DASHBOARD CCPC</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* ================================================================= */}
              {/* FILA / SLIDE 02: Ficha Izquierda + Polaroid Derecha (Simulador)   */}
              {/* ================================================================= */}
              <Link
                href="/juego"
                data-explore-slide
                className="group block focus:outline-none shrink-0 snap-center w-[88vw] sm:w-[78vw] max-w-[480px] lg:w-full lg:max-w-none lg:shrink"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-10 items-center">
                  {/* Columna Izquierda (en desktop) / Ficha de Archivo Simulador */}
                  <div className="order-2 lg:order-1 bg-[#F8F5EE] border border-[#E2DBD0] rounded-[4px] p-5 sm:p-7 lg:p-9 shadow-[0_8px_22px_rgba(20,24,35,0.06),0_2px_6px_rgba(20,24,35,0.04)] group-hover:shadow-[0_12px_28px_rgba(20,24,35,0.09)] transition-shadow duration-300">
                    {/* Encabezado de la Ficha */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-bold text-[#18181B] border-b border-black/70 pb-[1px]">02</span>
                        <span className="text-black/30">/</span>
                        <span className="font-bold tracking-[0.16em] uppercase text-[#4B5563] text-[10px] sm:text-[11px]">
                          EXPEDIENTE · MODO PRÁCTICA
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-[#71717A] uppercase">
                        SIMULADOR NEUTRAL
                      </span>
                    </div>

                    {/* Línea divisoria superior */}
                    <div className="w-full h-px bg-black/10 mt-3 sm:mt-3.5 mb-3.5 sm:mb-5" />

                    {/* Titular en Newsreader */}
                    <h4 className="font-serif font-bold text-xl sm:text-2xl lg:text-[32px] text-[#0F1B2D] tracking-tight leading-[1.14] group-hover:text-[#5E2CE6] transition-colors">
                      Práctica de procedimiento en casilla
                    </h4>

                    {/* Descripción editorial */}
                    <p className="mt-2 text-xs sm:text-[13.5px] text-[#52525B] leading-relaxed font-sans">
                      Usa datos reales de la CCPC y permite practicar el procedimiento en una casilla con una boleta de práctica, sin partidos ni colores partidistas.
                    </p>

                    {/* Línea divisoria media */}
                    <div className="w-full h-px bg-black/10 my-3.5 sm:my-5" />

                    {/* Lista de características con pastillas B.1, B.2, B.3 */}
                    <ul className="space-y-2 sm:space-y-3 font-sans text-xs sm:text-[13px] text-[#1F2937]">
                      <li className="flex items-center gap-2.5 sm:gap-3">
                        <span className="inline-flex items-center justify-center font-mono font-bold text-[10px] sm:text-[11px] text-[#374151] bg-[#E8E2D8]/80 border border-[#D8D0C3] rounded-[3px] px-1.5 sm:px-2 py-0.5 min-w-[2.2rem] sm:min-w-[2.4rem] shrink-0">
                          B.1
                        </span>
                        <span className="font-medium text-[#18181B]">Desmiente mitos con datos oficiales de la CCPC</span>
                      </li>
                      <li className="flex items-center gap-2.5 sm:gap-3">
                        <span className="inline-flex items-center justify-center font-mono font-bold text-[10px] sm:text-[11px] text-[#374151] bg-[#E8E2D8]/80 border border-[#D8D0C3] rounded-[3px] px-1.5 sm:px-2 py-0.5 min-w-[2.2rem] sm:min-w-[2.4rem] shrink-0">
                          B.2
                        </span>
                        <span className="font-medium text-[#18181B]">Práctica táctil de marcado, doblado y depósito en urna</span>
                      </li>
                      <li className="flex items-center gap-2.5 sm:gap-3">
                        <span className="inline-flex items-center justify-center font-mono font-bold text-[10px] sm:text-[11px] text-[#374151] bg-[#E8E2D8]/80 border border-[#D8D0C3] rounded-[3px] px-1.5 sm:px-2 py-0.5 min-w-[2.2rem] sm:min-w-[2.4rem] shrink-0">
                          B.3
                        </span>
                        <span className="font-medium text-[#18181B]">Simulación cívica neutral sin partidos ni sesgos</span>
                      </li>
                    </ul>

                    {/* Pie de acción CTA con línea horizontal guía */}
                    <div className="mt-5 sm:mt-7 pt-1 flex items-center gap-3">
                      <span className="font-mono text-xs sm:text-[12px] font-bold tracking-[0.16em] uppercase text-[#D81B60] group-hover:text-[#AD1457] transition-colors flex items-center gap-2 shrink-0">
                        <span>ENTRAR A PRACTICAR</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                      </span>
                      <div className="flex-1 h-px bg-black/10" />
                    </div>
                  </div>

                  {/* Columna Derecha (en desktop, primero en mobile) / Polaroid Voxel Juego */}
                  <div className="order-1 lg:order-2 relative w-full aspect-[1536/1024] select-none transition-transform duration-500 ease-out group-hover:scale-[1.018] md:group-hover:rotate-[0.6deg]">
                    {/* Sombra de contacto suave sobre el papel */}
                    <div
                      aria-hidden
                      className="absolute left-[12%] right-[12%] bottom-[6%] h-[12%] rounded-[50%] bg-[#0F1B2D]/12 blur-md"
                    />

                    {/* Fotografía interior (card-juego.jpeg) encajada en las coordenadas calibradas */}
                    <div
                      className="absolute overflow-hidden rounded-[2px]"
                      style={{
                        left: '16.08%',
                        right: '15.69%',
                        top: '20.90%',
                        bottom: '25.88%',
                      }}
                    >
                      <Image
                        src="/card-juego.jpeg"
                        alt="Ilustración pixel art del simulador de práctica en casilla del INE"
                        fill
                        sizes="(min-width: 1024px) 45vw, 92vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      {/* Bisel interior para profundidad 3D */}
                      <div
                        aria-hidden
                        className="absolute inset-0 pointer-events-none shadow-[inset_0_2px_6px_rgba(15,27,45,0.22)]"
                      />
                    </div>

                    {/* Marco Polaroid con cinta adhesiva rosa sobrepuesta */}
                    <div className="absolute inset-0 pointer-events-none select-none">
                      <Image
                        src="/Pink-Taped Polaroid Frame.png"
                        alt=""
                        aria-hidden
                        fill
                        sizes="(min-width: 1024px) 48vw, 95vw"
                        className="object-contain drop-shadow-[0_12px_24px_rgba(18,24,38,0.12)]"
                      />
                    </div>

                    {/* Barbilla inferior de la Polaroid: Rótulo editorial */}
                    <div
                      className="absolute z-10 flex items-center justify-between px-3 pointer-events-none"
                      style={{
                        left: '16.08%',
                        right: '15.69%',
                        top: '78%',
                        height: '11%',
                      }}
                    >
                      <span className="font-mono text-[9px] sm:text-[11px] font-bold tracking-[0.16em] uppercase text-[#6E6277]">
                        FIG. 02 · SIMULADOR CASILLA
                      </span>
                      <span className="font-mono text-[9px] sm:text-[10px] text-[#8E8099] tracking-wider uppercase">
                        RETRO PIXEL ART
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Indicadores de paginación interactivos exclusivos para móvil (estilo "Tu día a día") */}
            <div className="flex lg:hidden items-center justify-center gap-2 mt-5 select-none">
              {[0, 1].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToExploreSlide(idx)}
                  aria-label={`Ver expediente 0${idx + 1}`}
                  className={cn(
                    'transition-all duration-300 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600',
                    activeExploreSlide === idx
                      ? 'w-7 h-2 bg-[#D81B60]'
                      : 'w-2 h-2 bg-black/20 hover:bg-black/40'
                  )}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
