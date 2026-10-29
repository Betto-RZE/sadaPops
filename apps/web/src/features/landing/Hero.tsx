'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PixelMap, DahliaLayer, DahliaStoreProvider, StateHologramCard } from '@/features/mapa-dalias';

export function Hero() {
  // Inicialización neutral: ningún estado seleccionado al cargar la landing
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);

  // Scrollytelling: progreso [0..1] a lo largo de la pista sticky del Hero
  const sectionRef = useRef<HTMLElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasReachedPlace, setHasReachedPlace] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setScrollProgress(1);
      setHasReachedPlace(true);
      return;
    }

    let rafId = 0;

    const updateScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      // Rango útil de scroll dentro de la pista sticky (altura total menos el alto del viewport)
      const scrollRange = Math.max(1, el.offsetHeight - window.innerHeight);
      const scrolled = -rect.top;
      const raw = Math.min(1, Math.max(0, scrolled / scrollRange));

      setScrollProgress(raw);
      if (raw >= 0.85) {
        setHasReachedPlace(true);
      }
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateScroll();
      });
    };

    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Progreso efectivo de ascenso [0..1]: se bloquea en 1 una vez que el mapa encaja en su sitio
  const ascentProgress = hasReachedPlace ? 1 : Math.min(1, scrollProgress / 0.85);

  // Desplazamiento vertical del mapa: sube desde +68vh (abajo) hasta 0vh (su lugar sobre la sombra)
  const mapTranslateYVh = Number(((1 - ascentProgress) * 68).toFixed(2));

  // Transición progresiva de las letras monumentales hacia gris marca de agua editorial (0.90 -> 0.30)
  const navyLetterMultiplier = Number((1 - ascentProgress * (1 - 0.333)).toFixed(3));
  const navyGrayscalePct = Math.round(ascentProgress * 55);
  const magentaLetterMultiplier = Number((1 - ascentProgress * (1 - 0.82)).toFixed(3));

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-transparent select-none min-h-[185vh]"
    >
      {/* Contenedor Sticky que fija el escenario mientras el usuario hace scroll para elevar el mapa */}
      <div className="sticky top-16 min-h-[calc(100vh-4rem)] w-full flex flex-col justify-center overflow-x-clip py-2 sm:py-4">
        <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-6 lg:px-10 relative z-10 overflow-visible">
          {/* Contenedor principal: en móvil flujo vertical con spacing medido; en desktop centrado con min-height */}
          <div className="relative flex flex-col items-center justify-center min-h-0 md:min-h-[560px] lg:min-h-[620px]">
            {/* ========================================================================= */}
            {/* CAPA 1-MÓVIL: TITULAR EDITORIAL COMPACTO (< md)                           */}
            {/* ========================================================================= */}
            <div className="flex md:hidden flex-col items-center text-center pt-2 pb-3 px-2 z-10 w-full select-none">
              <span className="text-[clamp(1.75rem,7.4vw,2.35rem)] font-black tracking-tight leading-[1.08] text-brand-navy uppercase font-sans">
                <span className="hero-word-mobile" style={{ animationDelay: '0.10s' }}>
                  Tu participación
                </span>
              </span>
              <span className="text-[clamp(1.75rem,7.4vw,2.35rem)] font-black tracking-tight leading-[1.08] text-brand-navy uppercase font-sans mt-0.5">
                <span className="hero-word-mobile" style={{ animationDelay: '0.30s' }}>
                  hace{' '}
                </span>
                <span className="hero-word-mobile text-dalia-600" style={{ animationDelay: '0.50s' }}>
                  florecer{' '}
                </span>
                <span className="hero-word-mobile" style={{ animationDelay: '0.70s' }}>
                  a México.
                </span>
              </span>

              {/* Micro-invitación interactiva para interacción táctil */}
              <div
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/85 border border-brand-navy/10 shadow-[0_2px_8px_rgba(28,37,65,0.06)] backdrop-blur-sm hero-word-mobile"
                style={{ animationDelay: '0.90s' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-dalia-600 animate-pulse" />
                <span className="text-[10px] font-bold text-brand-navy/75 uppercase tracking-wider">
                  Toca un estado para consultar su floración
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* CAPA 1-DESKTOP: TITULAR MONUMENTAL DE FONDO EDITORIAL (>= md)             */}
            {/* ========================================================================= */}
            <div
              aria-hidden="true"
              className="hidden md:flex absolute inset-0 z-0 flex-col justify-between py-1 sm:py-2 md:py-3 pointer-events-none select-none"
            >
              {/* Bloque Superior Izquierdo: "Tu" (0.10s) + "participación" (0.35s) */}
              <div
                className="w-full flex justify-start pl-2 sm:pl-6 md:pl-10 lg:pl-12 will-change-[opacity,filter]"
                style={{
                  opacity: navyLetterMultiplier,
                  filter: `grayscale(${navyGrayscalePct}%)`,
                }}
              >
                <span className="text-[clamp(2.4rem,6.8vw,6.4rem)] font-black tracking-tighter leading-[0.88] text-brand-navy uppercase font-sans flex flex-wrap gap-x-3 sm:gap-x-4 md:gap-x-6">
                  <span className="hero-word" style={{ animationDelay: '0.10s' }}>
                    Tu
                  </span>
                  <span className="hero-word" style={{ animationDelay: '0.35s' }}>
                    participación
                  </span>
                </span>
              </div>

              {/* Bloque Medio Asimétrico: "hace" (0.65s) + "florecer" (0.95s, magenta INE) */}
              <div className="w-full flex justify-between items-center px-1 sm:px-3 md:px-6 -my-3 sm:-my-5">
                <span
                  className="text-[clamp(2.4rem,7vw,6.6rem)] font-black tracking-tighter leading-[0.88] text-brand-navy uppercase font-sans will-change-[opacity,filter]"
                  style={{
                    opacity: navyLetterMultiplier,
                    filter: `grayscale(${navyGrayscalePct}%)`,
                  }}
                >
                  <span className="hero-word" style={{ animationDelay: '0.65s' }}>
                    hace
                  </span>
                </span>
                <span
                  className="text-[clamp(2.6rem,7.4vw,7rem)] font-black tracking-tighter leading-[0.88] text-dalia-600 uppercase font-sans will-change-[opacity]"
                  style={{ opacity: magentaLetterMultiplier }}
                >
                  <span className="hero-word-magenta" style={{ animationDelay: '0.95s' }}>
                    florecer
                  </span>
                </span>
              </div>

              {/* Bloque Inferior Derecho: "a" (1.25s) + "México." (1.45s) */}
              <div
                className="w-full flex justify-end pr-2 sm:pr-8 md:pr-14 lg:pr-16 pb-4 sm:pb-6 will-change-[opacity,filter]"
                style={{
                  opacity: navyLetterMultiplier,
                  filter: `grayscale(${navyGrayscalePct}%)`,
                }}
              >
                <span className="text-[clamp(2.6rem,7.2vw,6.8rem)] font-black tracking-tighter leading-[0.88] text-brand-navy uppercase font-sans flex flex-wrap gap-x-3 sm:gap-x-4 md:gap-x-6">
                  <span className="hero-word" style={{ animationDelay: '1.25s' }}>
                    a
                  </span>
                  <span className="hero-word" style={{ animationDelay: '1.45s' }}>
                    México.
                  </span>
                </span>
              </div>
            </div>

            {/* Encabezado accesible real para lectores de pantalla y SEO */}
            <h1 className="sr-only">
              Tu participación hace florecer a México.
            </h1>

            {/* ========================================================================= */}
            {/* CAPA 2 & 3: SOMBRA ESTACIONARIA + MAPA ISOMÉTRICO EN ASCENSO POR SCROLL   */}
            {/* ========================================================================= */}
            <div
              id="mapa-interactivo"
              className="relative z-20 w-full max-w-[780px] sm:max-w-[920px] md:max-w-[1040px] lg:max-w-[1140px] xl:max-w-[1220px] mt-1 md:-mt-5"
            >
              {/* Sombra estacionaria que aparece justo después de las letras (1.55s) esperando al mapa */}
              <div
                aria-hidden="true"
                className="hero-shadow-delayed-enter pointer-events-none select-none w-full max-w-5xl mx-auto"
                style={{ aspectRatio: '660 / 435' }}
              >
                <img
                  src="/data/map-shadow.webp"
                  alt=""
                  className="w-full h-full object-contain pointer-events-none select-none"
                  loading="eager"
                />
              </div>

              {/* Contenedor del mapa que sube desde abajo (+68vh -> 0vh) mientras se hace scroll */}
              <div
                className="hero-map-delayed-enter absolute inset-0 w-full h-full map-isometric-shadow will-change-transform"
              >
                <div
                  className="w-full h-full will-change-transform"
                  style={{
                    transform: `translate3d(0, ${mapTranslateYVh}vh, 0)`,
                  }}
                >
                  <DahliaStoreProvider>
                    <PixelMap
                      selectedStateId={selectedStateId}
                      hoveredStateId={hoveredStateId}
                      onSelectState={setSelectedStateId}
                      onHoverState={setHoveredStateId}
                      readyToDrop={hasReachedPlace}
                      hideInternalShadow={true}
                      className="w-full"
                    >
                      {/* Capa de Dalias Voxel sobre los estados */}
                      <DahliaLayer />
                      {/* Proyección holográfica del estado activo (H5) */}
                      <StateHologramCard />
                    </PixelMap>
                  </DahliaStoreProvider>
                </div>
              </div>
            </div>

            {/* Indicador editorial de scroll inicial (se desvanece en cuanto el usuario inicia el scroll) */}
            <div
              aria-hidden="true"
              className="hero-nav-enter pointer-events-none select-none mt-2 md:mt-0 md:absolute md:bottom-1 left-1/2 md:-translate-x-1/2 z-30 transition-opacity duration-300"
              style={{
                opacity: scrollProgress < 0.08 && !hasReachedPlace ? 1 : 0,
              }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border border-brand-navy/15 shadow-[0_4px_14px_rgba(28,37,65,0.08)] backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-dalia-600 animate-bounce" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-brand-navy/75">
                  Desliza para elevar el mapa
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
