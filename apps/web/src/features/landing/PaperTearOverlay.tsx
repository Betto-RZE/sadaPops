'use client';

import React, { useMemo } from 'react';

export interface PaperTearOverlayProps {
  /** Progreso del rasgado [0..1]: 0 = hoja íntegra con letras, 1 = hoja totalmente rasgada y fuera */
  progress: number;
  /** Indica si la animación ya concluyó para desmontar visualmente la capa */
  isComplete?: boolean;
  /** Transformación CSS inicial del zoom en Baja California para que la sombra coincida 1:1 con el mapa debajo */
  initialMapTransform?: string;
}

const SAMPLE_COUNT = 64;

/**
 * Calcula la geometría orgánica del rasgado de hoja de abajo-centro hacia arriba (Opción 1.B).
 *
 * - En `progress = 0`, todos los puntos están en `y = 100%` (hoja íntegra sin fisuras ni bordes).
 * - Al avanzar `progress`, la ruptura se abre primero en el centro inferior (`x = 50%`) formando
 *   un arco irregular ascendente con múltiples frecuencias de fibras de papel.
 * - El borde de pulpa blanca (`pulpPolygon`) y la sombra (`shadowPolygon`) sólo tienen grosor
 *   donde `0 < y < 100`, por lo que jamás dejan líneas residuales ni abajo (en 0%) ni arriba (en 100%).
 */
function buildTearPolygons(progress: number): {
  sheetPolygon: string;
  pulpPolygon: string;
  shadowPolygon: string;
} {
  if (progress <= 0.001) {
    const fullRect = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
    return {
      sheetPolygon: fullRect,
      pulpPolygon: fullRect,
      shadowPolygon: fullRect,
    };
  }

  // El centro guía el rasgado desde y = 105 (abajo) hasta y = -42 (arriba fuera del contenedor)
  const centerY = 105 - progress * 147;

  const sheetPoints: string[] = ['0% 0%', '100% 0%'];
  const pulpPoints: string[] = ['0% 0%', '100% 0%'];
  const shadowPoints: string[] = ['0% 0%', '100% 0%'];

  for (let i = SAMPLE_COUNT; i >= 0; i--) {
    const xPct = (i / SAMPLE_COUNT) * 100;
    // Coordenada normalizada desde el centro [-1..1]
    const u = (xPct - 50) / 50;

    // Curvatura en arco: el centro se rompe y sube primero; los costados van detrás (+33 unidades)
    // con una ligera asimetría cúbica para verse natural y no espejado
    const archLag = u * u * 33 + u * u * u * 3.5;

    // Armónicos deterministas multi-escala que simulan las fibras y picos del papel rasgado
    const mediumTear =
      Math.sin(xPct * 0.24 + 0.8) * 3.4 +
      Math.cos(xPct * 0.43 - 1.1) * 2.5;
    const sharpNotches =
      Math.sin(xPct * 0.92 + progress * 2.2) * 1.75 +
      Math.cos(xPct * 1.63 + 0.5) * 1.2;
    const fineFibers =
      Math.sin(xPct * 3.1 - progress * 3.8) * 0.85 +
      (i % 2 === 0 ? 0.55 : -0.55);

    const rawSheetY = centerY + archLag + mediumTear + sharpNotches + fineFibers;

    // Labio de pulpa blanca de papel (grosor variable orgánico entre 2.0% y 4.2% de alto)
    const fiberPulpThickness =
      2.3 +
      Math.sin(xPct * 0.55 + 1.9) * 0.85 +
      Math.cos(xPct * 1.95 - progress * 3.0) * 0.65 +
      (i % 3 === 0 ? 0.45 : 0);

    const rawPulpY = rawSheetY + fiberPulpThickness;
    const rawShadowY = rawPulpY + 3.4;

    const clampedSheetY = Math.max(0, Math.min(100, rawSheetY));
    const clampedPulpY = Math.max(0, Math.min(100, rawPulpY));
    const clampedShadowY = Math.max(0, Math.min(100, rawShadowY));

    const xStr = xPct.toFixed(2);
    sheetPoints.push(`${xStr}% ${clampedSheetY.toFixed(2)}%`);
    pulpPoints.push(`${xStr}% ${clampedPulpY.toFixed(2)}%`);
    shadowPoints.push(`${xStr}% ${clampedShadowY.toFixed(2)}%`);
  }

  return {
    sheetPolygon: `polygon(${sheetPoints.join(', ')})`,
    pulpPolygon: `polygon(${pulpPoints.join(', ')})`,
    shadowPolygon: `polygon(${shadowPoints.join(', ')})`,
  };
}

export function PaperTearOverlay({
  progress,
  isComplete = false,
  initialMapTransform = 'translate3d(50%, 41%, 0) scale(1.85)',
}: PaperTearOverlayProps) {
  const { sheetPolygon, pulpPolygon, shadowPolygon } = useMemo(
    () => buildTearPolygons(progress),
    [progress]
  );

  if (isComplete || progress >= 0.998) {
    return null;
  }

  const isTearing = progress > 0.004;
  // Ligero tirón ascendente de las letras mientras la hoja es arrancada hacia arriba
  const textPullUpPx = Number((progress * 18).toFixed(1));

  return (
    <div
      aria-hidden="true"
      className="md:hidden absolute inset-0 z-30 pointer-events-none select-none overflow-hidden"
    >
      {/* Capa 1: Sombra suave proyectada únicamente bajo la línea activa del rasgado sobre el mapa */}
      {isTearing && (
        <div
          className="absolute inset-0 bg-[#1C2541]/25 blur-[6px] will-change-[clip-path]"
          style={{
            clipPath: shadowPolygon,
          }}
        />
      )}

      {/* Capa 2: Labio irregular de pulpa blanca fibrosa del papel roto (#FDFCF8) */}
      {isTearing && (
        <div
          className="absolute inset-0 bg-[#FDFCF8] border-b border-stone-300/60 will-change-[clip-path]"
          style={{
            clipPath: pulpPolygon,
            backgroundImage:
              'radial-gradient(rgba(28, 37, 65, 0.06) 1px, transparent 0)',
            backgroundSize: '6px 6px',
          }}
        />
      )}

      {/* Capa 3: Hoja superior con la textura oficial de papel, la sombra de México ya con el zoom
          de Baja California y la composición tipográfica tipo póster */}
      <div
        className="absolute inset-0 flex flex-col justify-between px-3.5 py-10 will-change-[clip-path] overflow-hidden"
        style={{
          backgroundColor: '#EEEDEA',
          backgroundImage: "url('/bg/bg-ine-hero.webp')",
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center top',
          backgroundSize: 'cover',
          clipPath: sheetPolygon,
        }}
      >
        {/* Sombra del mapa de México ya con el Zoom en Baja California (1:1 con el mapa debajo) */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full pointer-events-none select-none z-0"
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
            transform: `translate3d(0, -${textPullUpPx}px, 0)`,
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
    </div>
  );
}
