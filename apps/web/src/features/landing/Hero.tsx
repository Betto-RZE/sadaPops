'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PixelMap, DahliaLayer, DahliaStoreProvider, StateHologramCard, FloatingPetals } from '@/features/mapa-dalias';
import { PaperTearOverlay } from './PaperTearOverlay';
import { MobileMapHud } from './MobileMapHud';

// Constantes de la cámara con zoom (2.45x) en Mobile (< md):
// - En panProgress = 0: encuadre inmersivo en Baja California, Mar de Cortés y Noroeste (+66%, +56%)
// - En panProgress = 1: recorrido diagonal acoplado hasta el Sureste y Península de Yucatán (-64%, -37%)
const MOBILE_ZOOM_SCALE = 2.45;
const MOBILE_START_TX = 66;
const MOBILE_END_TX = -64;
const MOBILE_START_TY = 56;
const MOBILE_END_TY = -37;

export function Hero() {
  // Inicialización neutral: ningún estado seleccionado al cargar la landing
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);

  // Progreso [0..1] impulsado por gesto de scroll sin desplazar el documento:
  // - En Desktop (>= md): el mapa sube de abajo hacia arriba mientras las letras pasan a gris.
  // - En Mobile (< md): la hoja de papel se rompe irregularmente de abajo al centro hacia arriba,
  //   quitando por completo las letras y descubriendo el mapa debajo ya con zoom en Baja California.
  const [ascentProgress, setAscentProgress] = useState(0);
  const [hasReachedPlace, setHasReachedPlace] = useState(false);
  const [showMobileScrollHint, setShowMobileScrollHint] = useState(true);

  // Fase 3: Progreso de paneo horizontal acoplado a la diagonal de México en Mobile [0 = Baja California .. 1 = Yucatán]
  const [mobilePanProgress, setMobilePanProgress] = useState(0);
  // Fase 4: Alternar escala entre Zoom inmersivo (2.45x) y Vista completa (1.0x)
  const [isMobileZoomed, setIsMobileZoomed] = useState(true);

  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const reachedRef = useRef(false);

  useEffect(() => {
    const hideHint = () => {
      setShowMobileScrollHint(false);
    };
    const hideAfterPageScroll = () => { if (window.scrollY > 16) hideHint(); };

    if (window.scrollY > 16) {
      setShowMobileScrollHint(false);
      return;
    }

    window.addEventListener('scroll', hideAfterPageScroll, { passive: true });
    window.addEventListener('wheel', hideHint, { passive: true });
    return () => {
      window.removeEventListener('scroll', hideAfterPageScroll);
      window.removeEventListener('wheel', hideHint);
    };
  }, []);

  const targetPanRef = useRef(0);
  const currentPanRef = useRef(0);
  const panRafRef = useRef(0);
  const panGestureRef = useRef<{
    startX: number;
    startY: number;
    lastX: number;
    lockedAxis: 'horizontal' | 'vertical' | null;
  } | null>(null);

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
    // Distancia virtual de gesto (en px de rueda/touch) para completar el ascenso o rasgado
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

      // Mientras la transición no haya concluido, interceptamos el scroll en el tope
      // para que ni la Navbar ni el escenario se desplacen
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

  // Limpieza del loop de paneo horizontal en desmontaje
  useEffect(() => {
    return () => {
      if (panRafRef.current) {
        window.cancelAnimationFrame(panRafRef.current);
      }
    };
  }, []);

  const tickMobilePan = useCallback(() => {
    const target = targetPanRef.current;
    const current = currentPanRef.current;
    const diff = target - current;

    if (Math.abs(diff) > 0.001) {
      const next = current + diff * 0.22;
      currentPanRef.current = next;
      setMobilePanProgress(next);
      panRafRef.current = window.requestAnimationFrame(tickMobilePan);
    } else {
      currentPanRef.current = target;
      setMobilePanProgress(target);
      panRafRef.current = 0;
    }
  }, []);

  const handleMapTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!hasReachedPlace || e.touches.length !== 1) return;
      const touch = e.touches[0];
      panGestureRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: touch.clientX,
        lockedAxis: null,
      };
    },
    [hasReachedPlace]
  );

  const handleMapTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!hasReachedPlace || !panGestureRef.current || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const gesture = panGestureRef.current;

      const totalDx = touch.clientX - gesture.startX;
      const totalDy = touch.clientY - gesture.startY;

      if (!gesture.lockedAxis) {
        if (Math.abs(totalDx) < 6 && Math.abs(totalDy) < 6) return;
        gesture.lockedAxis =
          Math.abs(totalDx) > Math.abs(totalDy) ? 'horizontal' : 'vertical';
      }

      // Si el gesto es vertical, dejamos que el navegador ejecute el scroll normal de la página (pan-y)
      if (gesture.lockedAxis === 'vertical') return;

      const stepDx = touch.clientX - gesture.lastX;
      gesture.lastX = touch.clientX;

      // Arrastrar hacia la izquierda (stepDx < 0) avanza hacia el Sureste (panProgress -> 1)
      const PAN_RANGE_PX = 290;
      const nextTarget = Math.min(
        1,
        Math.max(0, targetPanRef.current - stepDx / PAN_RANGE_PX)
      );
      targetPanRef.current = nextTarget;

      if (!panRafRef.current) {
        panRafRef.current = window.requestAnimationFrame(tickMobilePan);
      }
    },
    [hasReachedPlace, tickMobilePan]
  );

  const handleMapTouchEnd = useCallback(() => {
    panGestureRef.current = null;
  }, []);

  // Progreso final [0..1]: se bloquea en 1 cuando el mapa llega a su lugar / termina de romperse la hoja
  const effectiveProgress = hasReachedPlace ? 1 : ascentProgress;

  // En Desktop: el mapa inicia 115vh abajo (100% fuera de pantalla) y oculto hasta que inicia el scroll
  const mapTranslateYVh = Number(((1 - effectiveProgress) * 115).toFixed(2));
  const isDesktopMapVisible = effectiveProgress > 0.002 || hasReachedPlace;

  // En Mobile (< md): cálculo de cámara con zoom (1.85x) iniciando en Baja California (panProgress = 0)
  const mobileTxPct = Number(
    (MOBILE_START_TX + (MOBILE_END_TX - MOBILE_START_TX) * mobilePanProgress).toFixed(2)
  );
  const mobileTyPct = Number(
    (MOBILE_START_TY + (MOBILE_END_TY - MOBILE_START_TY) * mobilePanProgress).toFixed(2)
  );
  const initialBajaTransform = `translate3d(${MOBILE_START_TX}%, ${MOBILE_START_TY}%, 0) scale(${MOBILE_ZOOM_SCALE})`;
  const activeMobileCameraTransform = isMobileZoomed
    ? `translate3d(${mobileTxPct}%, ${mobileTyPct}%, 0) scale(${MOBILE_ZOOM_SCALE})`
    : 'translate3d(0%, 0%, 0) scale(1)';

  // Transición progresiva de las letras monumentales de Desktop hacia gris marca de agua editorial (0.90 -> 0.30)
  const navyLetterMultiplier = Number((1 - effectiveProgress * (1 - 0.333)).toFixed(3));
  const navyGrayscalePct = Math.round(effectiveProgress * 55);
  const magentaLetterMultiplier = Number((1 - effectiveProgress * (1 - 0.82)).toFixed(3));

  return (
    <section className="relative w-full bg-transparent overflow-x-clip pt-0 pb-0 md:pb-8 select-none">
      <div className="mx-auto max-w-[1440px] px-0 md:px-6 lg:px-10 relative z-10 overflow-visible">
        {/* Contenedor principal del escenario: en móvil altura compactada (84dvh con espacio para Navbar arriba y sin hueco muerto abajo) */}
        <div
          onTouchStart={handleMapTouchStart}
          onTouchMove={handleMapTouchMove}
          onTouchEnd={handleMapTouchEnd}
          onTouchCancel={handleMapTouchEnd}
          className="relative flex flex-col items-center justify-center h-[84dvh] pt-12 pb-2 md:pt-0 md:pb-0 md:h-auto md:min-h-[560px] lg:min-h-[620px] w-full px-0 md:px-0 max-md:overflow-hidden touch-pan-y"
        >
          {/* HUD de instrucciones y control de zoom: vive exclusivamente en la esquina inferior izquierda del Hero */}
          {hasReachedPlace && (
            <MobileMapHud
              isZoomed={isMobileZoomed}
              onToggleZoom={() => setIsMobileZoomed((z) => !z)}
              panProgress={mobilePanProgress}
            />
          )}
          {/* ========================================================================= */}
          {/* CAPA PORTADA MÓVIL (< md): HOJA DE PAPEL CON LETRAS Y SOMBRA CON ZOOM     */}
          {/* ========================================================================= */}
          <PaperTearOverlay
            progress={effectiveProgress}
            isComplete={hasReachedPlace}
            initialMapTransform={initialBajaTransform}
          />

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
          {/* CAPA 2 & 3: SOMBRA ESTACIONARIA + MAPA ISOMÉTRICO                         */}
          {/* - En Mobile (< md): cámara con zoom 1.85x en Baja California y pan lateral*/}
          {/* - En Desktop (>= md): sube desde +115vh hasta encajar sobre su sombra     */}
          {/* ========================================================================= */}
          <div
            id="mapa-interactivo"
            className="relative z-20 w-full max-w-[780px] sm:max-w-[920px] md:max-w-[1040px] lg:max-w-[1140px] xl:max-w-[1220px] mt-0 md:-mt-5 origin-center will-change-transform [transform:var(--mobile-cam-transform)] md:[transform:none]"
            style={
              {
                '--mobile-cam-transform': activeMobileCameraTransform,
              } as React.CSSProperties
            }
          >
            {/* Sombra estacionaria: en Mobile viaja solidaria con la cámara 1.85x; en Desktop permanece fija esperando al mapa */}
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

            {/* Contenedor del mapa:
                - Mobile (< md): ya posicionado en translate3d(0,0,0) dentro de la cámara con zoom 1.85x.
                - Desktop (>= md): inicia oculto en +115vh y asciende con el scroll. */}
            <div
              className="absolute inset-0 w-full h-full map-isometric-shadow will-change-transform opacity-100 md:opacity-[var(--desktop-map-opacity)]"
              style={
                {
                  '--desktop-map-opacity': isDesktopMapVisible ? 1 : 0,
                  pointerEvents: hasReachedPlace ? 'auto' : 'none',
                } as React.CSSProperties
              }
            >
              <div
                className="w-full h-full will-change-transform [transform:translate3d(0,0,0)] md:[transform:translate3d(0,var(--desktop-map-y),0)]"
                style={
                  {
                    '--desktop-map-y': `${mapTranslateYVh}vh`,
                  } as React.CSSProperties
                }
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
      <FloatingPetals />
      {showMobileScrollHint && (
        <div
          aria-hidden="true"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/90 bg-white/85 px-4 py-2 text-xs font-medium tracking-wide text-brand-navy shadow-md backdrop-blur-sm md:hidden"
        >
          <span>Desliza para explorar</span>
          <ChevronDown size={15} strokeWidth={2} />
        </div>
      )}
    </section>
  );
}
