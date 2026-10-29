'use client';

import React, { useMemo } from 'react';

export interface PaperTearOverlayProps {
  /** Progreso del rasgado [0..1]: 0 = hoja íntegra con letras, 1 = hoja totalmente rasgada y fuera */
  progress: number;
  /** Indica si la animación ya concluyó para desmontar visualmente la capa */
  isComplete?: boolean;
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
      className="md:hidden absolute -inset-x-4 sm:-inset-x-8 -top-4 -bottom-8 z-30 pointer-events-none select-none overflow-hidden"
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

      {/* Capa 3: Hoja superior con la textura oficial de papel y el titular editorial que desaparece al romperse */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 will-change-[clip-path]"
        style={{
          backgroundColor: '#EEEDEA',
          backgroundImage: "url('/bg/bg-ine-hero.webp')",
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center top',
          backgroundSize: 'cover',
          clipPath: sheetPolygon,
        }}
      >
        <div
          className="flex flex-col items-center justify-center w-full max-w-[360px] mx-auto will-change-transform"
          style={{
            transform: `translate3d(0, -${textPullUpPx}px, 0)`,
          }}
        >
          <span className="text-[clamp(2rem,8.8vw,2.75rem)] font-black tracking-tighter leading-[1.02] text-brand-navy uppercase font-sans">
            <span className="hero-word-mobile" style={{ animationDelay: '0.10s' }}>
              Tu participación
            </span>
          </span>
          <span className="text-[clamp(2rem,8.8vw,2.75rem)] font-black tracking-tighter leading-[1.02] text-brand-navy uppercase font-sans mt-1">
            <span className="hero-word-mobile" style={{ animationDelay: '0.30s' }}>
              hace{' '}
            </span>
            <span
              className="hero-word-mobile text-dalia-600"
              style={{ animationDelay: '0.50s' }}
            >
              florecer
            </span>
          </span>
          <span className="text-[clamp(2rem,8.8vw,2.75rem)] font-black tracking-tighter leading-[1.02] text-brand-navy uppercase font-sans mt-1">
            <span className="hero-word-mobile" style={{ animationDelay: '0.70s' }}>
              a México.
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
