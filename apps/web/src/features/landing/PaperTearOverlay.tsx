'use client';

import React, { useMemo } from 'react';

export interface PaperTearOverlayProps {
  /** Progreso del rasgado [0..1]: 0 = hoja íntegra, 1 = ambas mitades se han abierto por completo */
  progress: number;
  /** Indica si la animación ya concluyó para desmontar visualmente la capa */
  isComplete?: boolean;
  /** Transformación CSS inicial del zoom en Baja California para que la sombra coincida 1:1 con el mapa debajo */
  initialMapTransform?: string;
}

const SAMPLE_COUNT = 56;

/**
 * Perfil orgánico determinista de contorno de papel rasgado (Realismo Editorial).
 * Sin picos de sierra exagerados: combina ondulaciones suaves de fibra larga
 * con micro-variaciones discretas de profundidad.
 */
function sampleOrganicTearOffset(xPct: number, seedPhase: number): number {
  const rad = xPct * 0.0628318; // normalizado ~ 2*PI a lo largo de 0..100
  const primaryWave =
    Math.sin(rad * 1.5 + seedPhase) * 1.35 +
    Math.cos(rad * 2.5 - seedPhase * 0.7) * 0.95;
  const secondaryGrain =
    Math.sin(rad * 5.0 + seedPhase * 1.3) * 0.48 +
    Math.cos(rad * 8.5 + 0.6) * 0.28;
  const microFiber =
    Math.sin(xPct * 1.15 + seedPhase * 2.1) * 0.18;

  return primaryWave + secondaryGrain + microFiber;
}

/**
 * Construye los polígonos de las dos mitades de la hoja (Superior e Inferior)
 * que se abren desde el centro (`y ~ 50%`) hacia arriba y hacia abajo,
 * junto con una sutil capa de deslamine/fibra de papel (sin línea blanca gruesa).
 */
function buildCenterSplitPolygons(progress: number): {
  topSheetPoly: string;
  topPlyPoly: string;
  bottomSheetPoly: string;
  bottomPlyPoly: string;
} {
  // Curva de apertura suave: inicia en el centro y se abre hasta descubrir el 100% de la pantalla
  const spread = progress * 66;

  const topSheetPts: string[] = ['0% 0%', '100% 0%'];
  const topPlyPts: string[] = ['0% 0%', '100% 0%'];

  const bottomSheetPts: string[] = [];
  const bottomPlyPts: string[] = [];

  // Línea base ligeramente inclinada (-2.5% de izq a der) para gesto natural de rasgado editorial
  for (let i = SAMPLE_COUNT; i >= 0; i--) {
    const xPct = (i / SAMPLE_COUNT) * 100;
    const u = (xPct - 50) / 50; // [-1 .. 1]

    // El centro se abre ligeramente antes que los extremos laterales (arco suave de 11 unidades)
    const archLag = u * u * 11.5;
    const naturalTilt = u * -2.2;

    const baseCenterY = 50 + naturalTilt;
    const organicTop = sampleOrganicTearOffset(xPct, 0.4 + progress * 0.6);

    // Posición del borde inferior de la mitad superior (sube de ~50% hacia < 0%)
    const rawTopY = baseCenterY - Math.max(0, spread - archLag) + organicTop;

    // Capa discreta de fibra/deslamine del propio papel (0.35% a 0.75% de grosor variable, ~3 a 6px)
    const topPlyThickness =
      0.42 +
      Math.max(0, Math.sin(xPct * 0.28 + 1.1) * 0.28 + Math.cos(xPct * 0.73) * 0.14);

    const clampedTopY = Math.max(-4, Math.min(104, rawTopY));
    const clampedTopPlyY = Math.max(-4, Math.min(104, rawTopY + topPlyThickness));

    const xStr = xPct.toFixed(2);
    topSheetPts.push(`${xStr}% ${clampedTopY.toFixed(2)}%`);
    topPlyPts.push(`${xStr}% ${clampedTopPlyY.toFixed(2)}%`);
  }

  // Mitad inferior: recorre de izquierda (0%) a derecha (100%) en su borde superior rasgado
  for (let i = 0; i <= SAMPLE_COUNT; i++) {
    const xPct = (i / SAMPLE_COUNT) * 100;
    const u = (xPct - 50) / 50;

    const archLag = u * u * 11.5;
    const naturalTilt = u * -2.2;

    const baseCenterY = 50 + naturalTilt;
    const organicBottom = sampleOrganicTearOffset(xPct, 1.85 - progress * 0.6);

    // Posición del borde superior de la mitad inferior (baja de ~50% hacia > 100%)
    const rawBottomY = baseCenterY + Math.max(0, spread - archLag) + organicBottom;

    const bottomPlyThickness =
      0.42 +
      Math.max(0, Math.cos(xPct * 0.31 - 0.8) * 0.28 + Math.sin(xPct * 0.67) * 0.14);

    const clampedBottomY = Math.max(-4, Math.min(104, rawBottomY));
    const clampedBottomPlyY = Math.max(-4, Math.min(104, rawBottomY - bottomPlyThickness));

    const xStr = xPct.toFixed(2);
    bottomSheetPts.push(`${xStr}% ${clampedBottomY.toFixed(2)}%`);
    bottomPlyPts.push(`${xStr}% ${clampedBottomPlyY.toFixed(2)}%`);
  }

  bottomSheetPts.push('100% 100%', '0% 100%');
  bottomPlyPts.push('100% 100%', '0% 100%');

  return {
    topSheetPoly: `polygon(${topSheetPts.join(', ')})`,
    topPlyPoly: `polygon(${topPlyPts.join(', ')})`,
    bottomSheetPoly: `polygon(${bottomSheetPts.join(', ')})`,
    bottomPlyPoly: `polygon(${bottomPlyPts.join(', ')})`,
  };
}

/**
 * Contenido interior del póster compartido por la vista íntegra y las dos mitades al abrirse,
 * garantizando que las letras y la sombra se partan con continuidad óptica exacta.
 */
function PosterSheetContent({
  initialMapTransform,
  pullOffsetY = 0,
}: {
  initialMapTransform: string;
  pullOffsetY?: number;
}) {
  return (
    <div
      className="relative w-full h-full flex flex-col justify-between px-6 py-10 overflow-hidden"
      style={{
        backgroundColor: '#EEEDEA',
        backgroundImage: "url('/bg/bg-ine-hero.webp')",
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center top',
        backgroundSize: 'cover',
      }}
    >
      {/* Sombra del mapa de México ya con el Zoom en Baja California (alineada 1:1 con el mapa debajo) */}
      <div
        aria-hidden="true"
        className="absolute inset-x-3 top-[47%] -translate-y-1/2 pointer-events-none select-none z-0"
        style={{ aspectRatio: '660 / 435' }}
      >
        <div
          className="w-full h-full origin-center"
          style={{
            transform: initialMapTransform,
          }}
        >
          <img
            src="/data/map-shadow.webp"
            alt=""
            className="hero-shadow-delayed-enter w-full h-full object-contain pointer-events-none select-none opacity-90"
            loading="eager"
          />
        </div>
      </div>

      {/* Composición tipográfica tipo póster idéntica a la referencia */}
      <div
        className="relative z-10 flex flex-col justify-between h-full w-full will-change-transform py-2"
        style={{
          transform: pullOffsetY ? `translate3d(0, ${pullOffsetY}px, 0)` : undefined,
        }}
      >
        {/* Bloque Superior Izquierdo (2 líneas apiladas): "TU" sobre "PARTICIPACIÓN" */}
        <div className="w-full flex flex-col items-start">
          <span className="text-[clamp(4.2rem,19vw,6.4rem)] font-black tracking-tighter leading-[0.82] text-brand-navy uppercase font-sans block">
            <span className="hero-word" style={{ animationDelay: '0.10s' }}>
              TU
            </span>
          </span>
          <span className="text-[clamp(2.35rem,11.2vw,3.95rem)] font-black tracking-tighter leading-[0.86] text-brand-navy uppercase font-sans block mt-1">
            <span className="hero-word" style={{ animationDelay: '0.35s' }}>
              PARTICIPACIÓN
            </span>
          </span>
        </div>

        {/* Bloque Medio Asimétrico (2 niveles): "HACE" (izq) y debajo "FLORECER" (der, magenta INE) */}
        <div className="w-full flex flex-col my-auto py-4">
          <div className="w-full flex justify-start">
            <span className="text-[clamp(3.6rem,16.5vw,5.5rem)] font-black tracking-tighter leading-[0.84] text-brand-navy uppercase font-sans block">
              <span className="hero-word" style={{ animationDelay: '0.65s' }}>
                HACE
              </span>
            </span>
          </div>
          <div className="w-full flex justify-end mt-1.5">
            <span className="text-[clamp(3.15rem,14.4vw,4.85rem)] font-black tracking-tighter leading-[0.84] text-dalia-600 uppercase font-sans block">
              <span className="hero-word-magenta" style={{ animationDelay: '0.95s' }}>
                FLORECER
              </span>
            </span>
          </div>
        </div>

        {/* Bloque Inferior Derecho: "A MÉXICO." */}
        <div className="w-full flex justify-end pb-2">
          <span className="text-[clamp(2.8rem,12.8vw,4.35rem)] font-black tracking-tighter leading-[0.86] text-brand-navy uppercase font-sans flex flex-wrap gap-x-2.5">
            <span className="hero-word" style={{ animationDelay: '1.25s' }}>
              A
            </span>
            <span className="hero-word" style={{ animationDelay: '1.45s' }}>
              MÉXICO.
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function PaperTearOverlay({
  progress,
  isComplete = false,
  initialMapTransform = 'translate3d(66%, 56%, 0) scale(2.45)',
}: PaperTearOverlayProps) {
  const { topSheetPoly, topPlyPoly, bottomSheetPoly, bottomPlyPoly } = useMemo(
    () => buildCenterSplitPolygons(progress),
    [progress]
  );

  if (isComplete || progress >= 0.998) {
    return null;
  }

  const isTearing = progress > 0.003;
  // Desplazamiento físico sutil de ambas mitades al separarse
  const pullPx = Number((progress * 16).toFixed(1));

  return (
    <div
      aria-hidden="true"
      className="md:hidden fixed inset-0 w-screen h-[100dvh] z-40 pointer-events-none select-none overflow-hidden"
    >
      {/* ================================================================= */}
      {/* MITAD SUPERIOR DE LA HOJA (siempre montada para no reiniciar CSS) */}
      {/* ================================================================= */}
      <div
        className="absolute -inset-x-3 -top-3 bottom-0 pt-3 will-change-transform"
        style={{
          filter: isTearing
            ? 'drop-shadow(0 5px 10px rgba(28, 37, 65, 0.16)) drop-shadow(0 1px 2px rgba(28, 37, 65, 0.11))'
            : 'none',
        }}
      >
        {/* Sub-capa de fibra del propio papel deslaminado (tono cálido sutil, no línea blanca gruesa) */}
        <div
          className="absolute inset-0 will-change-[clip-path]"
          style={{
            backgroundColor: '#F5F4F0',
            backgroundImage: "url('/bg/bg-ine-hero.webp')",
            backgroundPosition: 'calc(50% + 7px) calc(0% + 5px)',
            backgroundSize: 'cover',
            filter: 'brightness(1.035) contrast(0.96)',
            clipPath: isTearing
              ? topPlyPoly
              : 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
          }}
        />

        {/* Hoja principal superior (cubre el 100% cuando !isTearing) */}
        <div
          className="absolute inset-0 will-change-[clip-path]"
          style={{
            clipPath: isTearing
              ? topSheetPoly
              : 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          }}
        >
          <PosterSheetContent
            initialMapTransform={initialMapTransform}
            pullOffsetY={isTearing ? -pullPx : 0}
          />
        </div>
      </div>

      {/* ================================================================= */}
      {/* MITAD INFERIOR DE LA HOJA (siempre montada para no reiniciar CSS) */}
      {/* ================================================================= */}
      <div
        className="absolute -inset-x-3 top-0 -bottom-3 pb-3 will-change-transform"
        style={{
          filter: isTearing
            ? 'drop-shadow(0 -4px 10px rgba(28, 37, 65, 0.14)) drop-shadow(0 -1px 2px rgba(28, 37, 65, 0.10))'
            : 'none',
        }}
      >
        {/* Sub-capa de fibra del propio papel deslaminado en el borde inferior */}
        <div
          className="absolute inset-0 will-change-[clip-path]"
          style={{
            backgroundColor: '#F5F4F0',
            backgroundImage: "url('/bg/bg-ine-hero.webp')",
            backgroundPosition: 'calc(50% - 6px) calc(0% - 4px)',
            backgroundSize: 'cover',
            filter: 'brightness(1.035) contrast(0.96)',
            clipPath: isTearing
              ? bottomPlyPoly
              : 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
          }}
        />

        {/* Hoja principal inferior (colapsada en 100% cuando !isTearing) */}
        <div
          className="absolute inset-0 will-change-[clip-path]"
          style={{
            clipPath: isTearing
              ? bottomSheetPoly
              : 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
          }}
        >
          <PosterSheetContent
            initialMapTransform={initialMapTransform}
            pullOffsetY={isTearing ? pullPx : 0}
          />
        </div>
      </div>
    </div>
  );
}
