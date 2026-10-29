'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PixelMap, DahliaLayer, DahliaStoreProvider, StateHologramCard } from '@/features/mapa-dalias';

export function Hero() {
  // Inicialización neutral: ningún estado seleccionado al cargar la landing
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);

  // Progreso de ascenso del mapa [0..1] impulsado por gesto de scroll sin desplazar el documento
  const [ascentProgress, setAscentProgress] = useState(0);
  const [hasReachedPlace, setHasReachedPlace] = useState(false);

  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const reachedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targetProgressRef.current = 1;
      currentProgressRef.current = 1;
      reachedRef.current = true;
      setAscentProgress(1);
      setHasReachedPlace(true);
      return;
    }

    // Si el navegador restaura una posición de scroll ya avanzada, completar de inmediato
    if (window.scrollY > 40) {
      targetProgressRef.current = 1;
      currentProgressRef.current = 1;
      reachedRef.current = true;
      setAscentProgress(1);
      setHasReachedPlace(true);
      return;
    }

    let rafId = 0;
    let lastTouchY: number | null = null;
    // Distancia virtual de gesto (en px de rueda/touch) para llevar el mapa de abajo a su lugar
    const VIRTUAL_SCROLL_DISTANCE = 620;

    const animateProgress = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.0015) {
        const next = current + diff * 0.18;
        currentProgressRef.current = next;
        setAscentProgress(next);
        rafId = window.requestAnimationFrame(animateProgress);
      } else {
        currentProgressRef.current = target;
        setAscentProgress(target);
        rafId = 0;

        if (target >= 1 && !reachedRef.current) {
          reachedRef.current = true;
          setHasReachedPlace(true);
        }
      }
    };

    const startSmoothLoop = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(animateProgress);
      }
    };

    const advanceByDelta = (deltaY: number) => {
      const nextTarget = Math.min(
        1,
        Math.max(0, targetProgressRef.current + deltaY / VIRTUAL_SCROLL_DISTANCE)
      );
      targetProgressRef.current = nextTarget;
      startSmoothLoop();
    };

    const handleWheel = (e: WheelEvent) => {
      if (reachedRef.current) return;

      // Mientras el mapa no haya encajado en su lugar, interceptamos el scroll en el tope
      // para que ni la Navbar ni las letras se muevan: solo sube el mapa y cambian las letras a gris
      if (window.scrollY <= 5 && (e.deltaY > 0 || targetProgressRef.current > 0)) {
        e.preventDefault();
        advanceByDelta(e.deltaY);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (reachedRef.current || e.touches.length !== 1) return;
      lastTouchY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (reachedRef.current || lastTouchY === null || e.touches.length !== 1) return;
      const currentY = e.touches[0].clientY;
      const deltaY = (lastTouchY - currentY) * 1.35;
      lastTouchY = currentY;

      if (window.scrollY <= 5 && (deltaY > 0 || targetProgressRef.current > 0)) {
        if (e.cancelable) e.preventDefault();
        advanceByDelta(deltaY);
      }
    };

    const handleTouchEnd = () => {
      lastTouchY = null;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (reachedRef.current || window.scrollY > 5) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        advanceByDelta(e.key === 'ArrowDown' ? 110 : 260);
      } else if (e.key === 'ArrowUp' && targetProgressRef.current > 0) {
        e.preventDefault();
        advanceByDelta(-110);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Progreso final [0..1]: se bloquea en 1 cuando el mapa llega a su lugar
  const effectiveProgress = hasReachedPlace ? 1 : ascentProgress;

  // El mapa inicia 115vh abajo (100% fuera de pantalla) y oculto hasta que inicia el scroll
  const mapTranslateYVh = Number(((1 - effectiveProgress) * 115).toFixed(2));
  const isMapVisible = effectiveProgress > 0.002 || hasReachedPlace;

  // Transición progresiva de las letras monumentales hacia gris marca de agua editorial (0.90 -> 0.30)
  const navyLetterMultiplier = Number((1 - effectiveProgress * (1 - 0.333)).toFixed(3));
  const navyGrayscalePct = Math.round(effectiveProgress * 55);
  const magentaLetterMultiplier = Number((1 - effectiveProgress * (1 - 0.82)).toFixed(3));

  return (
    <section className="relative w-full bg-transparent overflow-x-clip pt-0 pb-6 sm:pb-8 select-none">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-10 relative z-10 overflow-visible">
        {/* Contenedor principal con la altura original exacta para que Navbar y Letras se vean completas sin scroll */}
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
          {/* CAPA 2 & 3: SOMBRA ESTACIONARIA + MAPA ISOMÉTRICO EN ASCENSO              */}
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

            {/* Contenedor del mapa: 100% oculto y fuera de pantalla inicialmente (+115vh); sube al hacer scroll */}
            <div
              className="absolute inset-0 w-full h-full map-isometric-shadow will-change-transform"
              style={{
                opacity: isMapVisible ? 1 : 0,
                pointerEvents: hasReachedPlace ? 'auto' : 'none',
              }}
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
        </div>
      </div>
    </section>
  );
}
