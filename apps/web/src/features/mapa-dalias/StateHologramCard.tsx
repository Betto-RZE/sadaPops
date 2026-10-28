'use client';

/**
 * StateHologramCard — Proyección holográfica del estado activo (Hito H5, Fase 2).
 *
 * Características:
 *   1. Cono Perpendicular Simétrico: Trapecio isósceles calculado sobre la normal
 *      perpendicular al eje entre el ancla del estado en el mapa y el centro visual
 *      de la pieza ampliada (0 filtros blur en runtime, 100% simétrico en los 32 estados).
 *   2. Isla voxel 3D (`/data/holo/state-XX.png`) horneada con la misma paleta índigo
 *      de `config/iso.ts` (`#6665E7` / `#4C3AB2`).
 *   3. Zona segura dentro del contenedor del mapa para que estados del norte (como
 *      Baja California o Sonora) nunca choquen con el logo del INE ni se corten.
 */

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { usePixelMapContext, ELEVATION_VOXELS } from './PixelMap';
import { useOptionalDahliaStore } from './DahliaStore';
import type { StateMetadata } from './types';
import { getYouthTurnoutBenchmark } from './data/ineYouthTurnout2024';
import { cn } from '../../shared/utils';

export interface HoloStateMeta {
  id: string;
  width: number;
  height: number;
  flankLeft: [number, number];
  flankRight: [number, number];
  visualCenter: [number, number];
  coneRadiusRatio?: number;
}

type HoloMetaMap = Record<string, HoloStateMeta>;

let cachedHoloMeta: HoloMetaMap | null = null;
let holoMetaPromise: Promise<HoloMetaMap> | null = null;

function fetchHoloMeta(): Promise<HoloMetaMap> {
  if (cachedHoloMeta) return Promise.resolve(cachedHoloMeta);
  if (!holoMetaPromise) {
    holoMetaPromise = fetch('/data/holo/holo-meta.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<HoloMetaMap>;
      })
      .then((json) => {
        cachedHoloMeta = json;
        return json;
      });
  }
  return holoMetaPromise;
}

/**
 * Centros ópticos calibrados para siluetas irregulares o asimétricas.
 * En estados con curvatura o forma de gancho (Veracruz, BC, BCS, Sinaloa, Puebla),
 * polylabel tiende a escorarse a un extremo. Estos overrides aseguran que el medallón
 * y el eje del haz de luz se ubiquen en el centro armónico y visual de la silueta.
 */
export const OPTICAL_CENTER_OVERRIDES: Record<string, [number, number]> = {
  '02': [0.50, 0.48], // Baja California (centro armónico peninsular)
  '03': [0.48, 0.50], // Baja California Sur (centro del gancho)
  '21': [0.50, 0.52], // Puebla (centro de masa)
  '25': [0.48, 0.48], // Sinaloa (franja central)
  '30': [0.50, 0.50], // Veracruz (centro de la media luna)
};

/**
 * Silueta Pixel-Art del chasis exterior (fidelidad 1:1 con mock-card.jpg).
 * Escalonado de 3 peldaños en esquinas (chamfer) y muescas laterales a media altura.
 */
const CHASSIS_CLIP_PATH =
  'polygon(0 8px, 2px 8px, 2px 6px, 4px 6px, 4px 4px, 6px 4px, 6px 2px, 8px 2px, 8px 0, calc(100% - 8px) 0, calc(100% - 8px) 2px, calc(100% - 6px) 2px, calc(100% - 6px) 4px, calc(100% - 4px) 4px, calc(100% - 4px) 6px, calc(100% - 2px) 6px, calc(100% - 2px) 8px, 100% 8px, 100% calc(50% - 8px), calc(100% - 3px) calc(50% - 6px), calc(100% - 3px) calc(50% + 6px), 100% calc(50% + 8px), 100% calc(100% - 8px), calc(100% - 2px) calc(100% - 8px), calc(100% - 2px) calc(100% - 6px), calc(100% - 4px) calc(100% - 6px), calc(100% - 4px) calc(100% - 4px), calc(100% - 6px) calc(100% - 4px), calc(100% - 6px) calc(100% - 2px), calc(100% - 8px) calc(100% - 2px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 2px), 6px calc(100% - 2px), 6px calc(100% - 4px), 4px calc(100% - 4px), 4px calc(100% - 6px), 2px calc(100% - 6px), 2px calc(100% - 8px), 0 calc(100% - 8px), 0 calc(50% + 8px), 3px calc(50% + 6px), 3px calc(50% - 6px), 0 calc(50% - 8px))';

interface HoloLayout {
  left: number;
  top: number;
  w: number;
  h: number;
  baseLeft: [number, number];
  baseRight: [number, number];
  baseCenter: [number, number];
  baseRadiusX: number;
  baseRadiusY: number;
  targetLeft: [number, number];
  targetRight: [number, number];
  targetCenter: [number, number];
}

function computeHoloLayout(
  cw: number,
  ch: number,
  mapW: number,
  mapH: number,
  liftLogicalPx: number,
  state: StateMetadata,
  meta: HoloStateMeta
): HoloLayout {
  const sx = cw / mapW;
  const sy = ch / mapH;

  const [bMinX, bMinY, bMaxX, bMaxY] = state.bbox;
  const stateSpanW = Math.max(14, (bMaxX - bMinX) * sx);
  const stateSpanH = Math.max(10, (bMaxY - bMinY) * sy);

  const rawAx = state.anchor.x * sx;
  const rawAy = (state.anchor.y - liftLogicalPx) * sy;

  // Dimensiones escaladas de la silueta voxel 3D manteniendo su proporción original
  const aspect = meta.height / meta.width;
  const targetMaxDim = Math.min(330, Math.max(260, Math.round(cw * 0.30)));
  let w: number;
  let h: number;
  if (aspect >= 1) {
    h = targetMaxDim;
    w = Math.round(h / aspect);
  } else {
    w = targetMaxDim;
    h = Math.round(w * aspect);
  }

  // Margen lateral seguro y cota superior en el espacio de papel del Hero
  // (safeTopMin = -115px permite que estados del norte suban al cielo de papel y dejen su haz visible)
  const padX = Math.max(16, cw * 0.02);
  const safeTopMin = -115;

  let left: number;
  let top: number;
  const ax = rawAx;
  const ay = rawAy;

  if (state.id === '02') {
    // Baja California: Proyección diagonal suave hacia el Golfo de California (Opción 1)
    // El ancla en la dalia (ax, ay) se mantiene 100% fija en su posición geográfica
    left = Math.round(Math.min(cw - w - padX, rawAx + 85));
    top = -75;
  } else {
    // Estados estándar y frontera norte (Sonora, Chihuahua, Coahuila, Puebla, etc.):
    // Se garantiza un haz de luz vertical despejado de al menos 55px debajo de la pieza 3D
    const targetTop = rawAy - h - 55;
    top = Math.round(Math.max(safeTopMin, targetTop));
    left = Math.round(Math.min(cw - w - padX, Math.max(padX, rawAx - w / 2)));
  }

  // Eje central desde la base del estado en el mapa (A) hasta el centro óptico de la silueta voxel (C)
  const opticalCenter = OPTICAL_CENTER_OVERRIDES[state.id] ?? meta.visualCenter;
  const cx = left + opticalCenter[0] * w;
  const cy = top + opticalCenter[1] * h;

  const dx = cx - ax;
  const dy = cy - ay;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  // Vector unitario perpendicular al eje del cono
  const nx = -uy;
  const ny = ux;

  // Ancho en la base (proporcional al estado en el mapa, acotado para haz sutil)
  const rBase = Math.min(Math.max(12, Math.min(stateSpanW, stateSpanH) * 0.30), 16);
  // Ancho en el destino: apertura estrecha y controlada (elimina por completo el efecto "pirámide rara")
  const rTop = 38;

  // El haz de luz llega a la base de la silueta voxel 3D
  const tx = cx - ux * 8;
  const ty = cy - uy * 8;

  const baseLeft: [number, number] = [ax - nx * rBase, ay - ny * rBase];
  const baseRight: [number, number] = [ax + nx * rBase, ay + ny * rBase];
  const targetLeft: [number, number] = [tx - nx * rTop, ty - ny * rTop];
  const targetRight: [number, number] = [tx + nx * rTop, ty + ny * rTop];

  return {
    left,
    top,
    w,
    h,
    baseLeft,
    baseRight,
    baseCenter: [ax, ay],
    baseRadiusX: rBase * 1.45,
    baseRadiusY: Math.max(11, rBase * 0.82),
    targetLeft,
    targetRight,
    targetCenter: [tx, ty],
  };
}

export interface StateHologramCardProps {
  /** Contenido centrado sobre la silueta (Fase 3). Recibe el estado activo. */
  children?: (state: StateMetadata) => React.ReactNode;
  className?: string;
}

/**
 * Nombres comunes estandarizados para visualización ciudadana en mapas (convención INE).
 * Sustituye títulos constitucionales solemnes por nombres comunes directos.
 */
const COMMON_STATE_NAMES: Record<string, string> = {
  '05': 'Coahuila',
  '15': 'Estado de México',
  '16': 'Michoacán',
  '30': 'Veracruz',
};

export function StateHologramCard({ children, className }: StateHologramCardProps) {
  const { data, selectedStateId, selectState } = usePixelMapContext();
  const dahliaStore = useOptionalDahliaStore();

  // El cono de luz y la proyección holográfica se activan ÚNICAMENTE al hacer clic (seleccionar un estado)
  const state = data && selectedStateId ? data.stateById.get(selectedStateId) ?? null : null;

  const count = state && dahliaStore ? dahliaStore.getCount(state.id) : 0;
  const level = state && dahliaStore ? dahliaStore.getLevel(state.id) : 0;
  const flowerLevel = level > 0 ? level : 1;
  const question = count === 0 ? '¿QUIERES SER LA PRIMERA?' : '¿YA ERES PARTE?';
  const displayName = state ? (COMMON_STATE_NAMES[state.id] ?? state.nombre) : '';
  const youthBenchmark = state ? getYouthTurnoutBenchmark(state.id) : null;

  // Cierre accesible con tecla Escape
  useEffect(() => {
    if (!selectedStateId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectState(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedStateId, selectState]);

  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [metaMap, setMetaMap] = useState<HoloMetaMap | null>(cachedHoloMeta);

  useEffect(() => {
    let mounted = true;
    fetchHoloMeta()
      .then((m) => {
        if (mounted) setMetaMap(m);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stateMeta = state && metaMap ? metaMap[state.id] ?? null : null;
  const opticalCenter = (state && OPTICAL_CENTER_OVERRIDES[state.id]) ?? (stateMeta ? stateMeta.visualCenter : [0.5, 0.5]);

  const layout = useMemo(() => {
    if (!data || !state || !stateMeta || size.w === 0) return null;
    const liftLogicalPx = ELEVATION_VOXELS * data.pixelScale;
    return computeHoloLayout(
      size.w,
      size.h,
      data.width,
      data.height,
      liftLogicalPx,
      state,
      stateMeta
    );
  }, [data, state, stateMeta, size]);

  const beamGeometry = useMemo(() => {
    if (!layout) return null;
    const { baseLeft, baseRight, targetLeft, targetRight, baseCenter, targetCenter } = layout;
    const mainPolygon = `${baseLeft[0]},${baseLeft[1]} ${targetLeft[0]},${targetLeft[1]} ${targetRight[0]},${targetRight[1]} ${baseRight[0]},${baseRight[1]}`;

    const lerpPt = (a: [number, number], b: [number, number], t: number): [number, number] => [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
    ];

    const ray1Base = lerpPt(baseLeft, baseRight, 0.28);
    const ray1Top = lerpPt(targetLeft, targetRight, 0.28);
    const ray2Base = lerpPt(baseLeft, baseRight, 0.72);
    const ray2Top = lerpPt(targetLeft, targetRight, 0.72);

    const sparkles = [
      { u: 0.30, v: 0.14, r: 2.0, o: 0.85 },
      { u: 0.52, v: 0.10, r: 2.3, o: 0.92 },
      { u: 0.68, v: 0.18, r: 1.8, o: 0.78 },
      { u: 0.40, v: 0.26, r: 1.6, o: 0.70 },
      { u: 0.60, v: 0.30, r: 2.0, o: 0.75 },
      { u: 0.48, v: 0.40, r: 1.5, o: 0.55 },
    ].map((s) => {
      const bPt = lerpPt(baseLeft, baseRight, s.u);
      const tPt = lerpPt(targetLeft, targetRight, s.u);
      const pt = lerpPt(bPt, tPt, s.v);
      return { cx: pt[0], cy: pt[1], r: s.r, o: s.o };
    });

    return {
      mainPolygon,
      ray1Base,
      ray1Top,
      ray2Base,
      ray2Top,
      baseCenter,
      targetCenter,
      sparkles,
    };
  }, [layout]);

  return (
    <div ref={rootRef} className={cn('absolute inset-0 pointer-events-none z-[70]', className)}>
      <style>{`
        @keyframes holo-island-in {
          0% {
            opacity: 0;
            transform: translate3d(0, 12px, 0) scale(0.93);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        @keyframes holo-beam-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .holo-island-enter {
          animation: holo-island-in 200ms cubic-bezier(0.2, 0.85, 0.25, 1) both;
        }
        .holo-beam-enter {
          animation: holo-beam-in 210ms ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .holo-island-enter, .holo-beam-enter {
            animation: none !important;
          }
        }
        .font-pixel {
          font-family: 'Silkscreen', 'Press Start 2P', monospace;
        }
        .text-voxel-3d {
          color: #FFAEFC;
          text-shadow: 0 2px 0 #6D168F, 0 4px 0 #430B5C;
        }
      `}</style>

      {state && stateMeta && layout && beamGeometry && (
        <>
          {/* CAPA 1 (z-10): CONO PERPENDICULAR SIMÉTRICO (0 filtros costosos en GPU) */}
          <svg
            key={`beam-${state.id}`}
            className="holo-beam-enter absolute inset-0 w-full h-full overflow-visible z-10"
            width={size.w}
            height={size.h}
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id={`beam-body-${state.id}`}
                gradientUnits="userSpaceOnUse"
                x1={beamGeometry.baseCenter[0]}
                y1={beamGeometry.baseCenter[1]}
                x2={beamGeometry.targetCenter[0]}
                y2={beamGeometry.targetCenter[1]}
              >
                <stop offset="0%" stopColor="#F5F3FF" stopOpacity="0.90" />
                <stop offset="30%" stopColor="#D8D4FF" stopOpacity="0.65" />
                <stop offset="72%" stopColor="#B4B2FF" stopOpacity="0.32" />
                <stop offset="94%" stopColor="#9A96FF" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#9A96FF" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient
                id={`beam-edge-${state.id}`}
                gradientUnits="userSpaceOnUse"
                x1={beamGeometry.baseCenter[0]}
                y1={beamGeometry.baseCenter[1]}
                x2={beamGeometry.targetCenter[0]}
                y2={beamGeometry.targetCenter[1]}
              >
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
                <stop offset="48%" stopColor="#EBE8FF" stopOpacity="0.80" />
                <stop offset="86%" stopColor="#B4B2FF" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#B4B2FF" stopOpacity="0.0" />
              </linearGradient>

              <radialGradient id={`beam-base-glow-${state.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
                <stop offset="45%" stopColor="#DCD4FF" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#8A89FA" stopOpacity="0.0" />
              </radialGradient>
            </defs>

            {/* Resplandor y punto de anclaje en la dalia oficial */}
            <ellipse
              cx={layout.baseCenter[0]}
              cy={layout.baseCenter[1]}
              rx={layout.baseRadiusX}
              ry={layout.baseRadiusY}
              fill={`url(#beam-base-glow-${state.id})`}
            />
            <circle
              cx={layout.baseCenter[0]}
              cy={layout.baseCenter[1]}
              r={3.5}
              fill="#FFFFFF"
            />

            {/* Haz suave sin líneas de contorno duras (cero efecto "pirámide rara") */}
            <polygon
              points={beamGeometry.mainPolygon}
              fill={`url(#beam-body-${state.id})`}
            />

            {/* Núcleo difuso de luz central */}
            <line
              x1={beamGeometry.baseCenter[0]}
              y1={beamGeometry.baseCenter[1]}
              x2={beamGeometry.targetCenter[0]}
              y2={beamGeometry.targetCenter[1]}
              stroke="#E8E5FF"
              strokeWidth="6"
              strokeOpacity="0.25"
              strokeLinecap="round"
            />
            <line
              x1={beamGeometry.baseCenter[0]}
              y1={beamGeometry.baseCenter[1]}
              x2={beamGeometry.targetCenter[0]}
              y2={beamGeometry.targetCenter[1]}
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeOpacity="0.75"
              strokeLinecap="round"
            />

            {/* Rayos internos sutiles */}
            <line
              x1={beamGeometry.ray1Base[0]}
              y1={beamGeometry.ray1Base[1]}
              x2={beamGeometry.ray1Top[0]}
              y2={beamGeometry.ray1Top[1]}
              stroke={`url(#beam-edge-${state.id})`}
              strokeWidth="1.2"
              strokeOpacity="0.25"
            />
            <line
              x1={beamGeometry.ray2Base[0]}
              y1={beamGeometry.ray2Base[1]}
              x2={beamGeometry.ray2Top[0]}
              y2={beamGeometry.ray2Top[1]}
              stroke={`url(#beam-edge-${state.id})`}
              strokeWidth="1.2"
              strokeOpacity="0.25"
            />

            {beamGeometry.sparkles.map((sp, i) => (
              <circle
                key={i}
                cx={sp.cx}
                cy={sp.cy}
                r={sp.r}
                fill="#FFFFFF"
                opacity={sp.o}
              />
            ))}
          </svg>

          {/* CAPA 2 (z-20): ISLA VOXEL 3D AMPLIADA DEL ESTADO (PROTOTIPO A MONOLÍTICO) */}
          <div
            key={`island-${state.id}`}
            className="holo-island-enter absolute z-20 pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              left: layout.left,
              top: layout.top,
              width: layout.w,
              height: layout.h,
              filter:
                'drop-shadow(0 0 10px rgba(190, 185, 255, 0.72)) drop-shadow(0 14px 22px rgba(24, 18, 68, 0.35))',
            }}
          >
            <img
              src={`/data/holo/state-${state.id}.png`}
              alt={`Silueta voxel 3D ampliada de ${displayName}`}
              width={stateMeta.width}
              height={stateMeta.height}
              decoding="async"
              className="block w-full h-full object-contain [image-rendering:pixelated] select-none pointer-events-none"
            />

            {/* Chasis Pixel-Art 3D (Fidelidad 1:1 a mock-card.jpg) */}
            <div
              className="absolute z-20 flex flex-col items-center select-none pointer-events-auto transition-all"
              style={{
                left: `${opticalCenter[0] * 100}%`,
                top: `${opticalCenter[1] * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: '230px',
                filter:
                  'drop-shadow(0 20px 40px rgba(10, 6, 32, 0.75)) drop-shadow(0 0 16px rgba(139, 122, 235, 0.3))',
              }}
            >
              {/* Borde exterior biselado pixel-art (Layered Pixel Border) */}
              <div
                className="relative w-full p-[2.5px]"
                style={{
                  background:
                    'linear-gradient(135deg, #8B7AEB 0%, #6857C4 35%, #3D2D82 70%, #201550 100%)',
                  clipPath: CHASSIS_CLIP_PATH,
                }}
              >
                {/* Cuerpo interior con fondo índigo medianoche (#151038) */}
                <div
                  className="relative w-full px-3.5 pt-3.5 pb-4 flex flex-col items-center justify-center text-center"
                  style={{
                    background: '#151038',
                    clipPath: CHASSIS_CLIP_PATH,
                  }}
                >
                  {/* Línea interior fina (1px Inset Border) */}
                  <div
                    className="absolute inset-[3px] pointer-events-none border border-[#342678]/80"
                    style={{
                      clipPath: CHASSIS_CLIP_PATH,
                    }}
                  />

                  {/* Píldora / Handle superior centrado */}
                  <span className="w-8 h-1 bg-[#AEA3F8]/80 rounded-full mb-1.5 shadow-[0_0_6px_#AEA3F8] inline-block [image-rendering:pixelated]" />

                  {children ? (
                    children(state)
                  ) : (
                    <>
                      {/* Línea 1: Título con nombre común INE */}
                      <h3 className="font-pixel font-bold text-sm tracking-[0.16em] text-white uppercase drop-shadow-[0_2px_0_rgba(0,0,0,0.8)] leading-tight mt-0.5">
                        {displayName.toUpperCase()}
                      </h3>

                      {/* Línea 2: Bloque Oficial INE 2024 (Participación 18-29 años + Benchmark) */}
                      {youthBenchmark && (
                        <div
                          className="mt-2 flex flex-col items-center justify-center select-none"
                          title={`Participación 18-29 años en la Elección Federal 2024: ${youthBenchmark.turnoutYouthPercent}% (${youthBenchmark.source})`}
                          aria-label={`En 2024, el ${youthBenchmark.turnoutYouthPercent}% de jóvenes entre 18 y 29 años votaron en ${displayName}, ${youthBenchmark.diffLabel}, según datos del INE`}
                        >
                          <div className="flex items-center gap-1.5 leading-none">
                            <span className="w-2.5 h-2.5 bg-[#00E5FF] shadow-[0_0_6px_#00E5FF] inline-block shrink-0 [image-rendering:pixelated]" />
                            <span className="text-[12.5px] font-bold text-white tracking-tight">
                              {youthBenchmark.turnoutYouthPercent}% votó en 2024
                            </span>
                          </div>
                          <span className="text-[9.5px] font-medium text-[#C5BEFF] tracking-tight mt-1 leading-tight">
                            18–29 años · {youthBenchmark.diffLabel}
                          </span>
                          <span className="text-[8px] font-semibold text-[#8F85C7] tracking-[0.2em] uppercase mt-0.5 leading-none">
                            · INE ·
                          </span>
                        </div>
                      )}

                      {/* Divisor 1: Línea discontinua con micro-flor pixelada central ✤ */}
                      <div className="flex items-center justify-center w-full my-2.5 px-2 opacity-85">
                        <div className="flex-1 border-t border-dashed border-[#5A4B9E]" />
                        <div className="mx-2 flex items-center justify-center shrink-0">
                          <div className="relative w-2 h-2 flex items-center justify-center">
                            <span className="absolute w-1.5 h-1.5 bg-[#AEA3F8] rotate-45 shadow-[0_0_4px_#AEA3F8]" />
                            <span className="absolute w-2 h-0.5 bg-[#AEA3F8]" />
                            <span className="absolute w-0.5 h-2 bg-[#AEA3F8]" />
                          </div>
                        </div>
                        <div className="flex-1 border-t border-dashed border-[#5A4B9E]" />
                      </div>

                      {/* Bloque Cívico de Plataforma (Dalia Voxel + Cifra 3D Rosa) */}
                      <div className="flex items-center justify-center gap-3">
                        <img
                          src={`/flowers/dahlia-${flowerLevel}.png`}
                          alt=""
                          aria-hidden="true"
                          width={36}
                          height={36}
                          className="w-9 h-9 object-contain [image-rendering:pixelated] drop-shadow shrink-0"
                        />
                        <span className="font-pixel text-[28px] font-black tracking-wider text-voxel-3d leading-none select-none">
                          {count.toLocaleString('es-MX')}
                        </span>
                      </div>

                      <p className="text-[#E5E0FF] text-[11px] font-bold leading-tight text-center mt-1.5 drop-shadow">
                        personas que se informaron
                      </p>

                      <p className="text-[#9A92D0] text-[8.5px] italic leading-none text-center mt-0.5 drop-shadow">
                        Registro en plataforma · No mide votos
                      </p>

                      {/* Divisor 2: Línea discontinua con micro-flor pixelada central ✤ */}
                      <div className="flex items-center justify-center w-full my-2.5 px-2 opacity-85">
                        <div className="flex-1 border-t border-dashed border-[#5A4B9E]" />
                        <div className="mx-2 flex items-center justify-center shrink-0">
                          <div className="relative w-2 h-2 flex items-center justify-center">
                            <span className="absolute w-1.5 h-1.5 bg-[#AEA3F8] rotate-45 shadow-[0_0_4px_#AEA3F8]" />
                            <span className="absolute w-2 h-0.5 bg-[#AEA3F8]" />
                            <span className="absolute w-0.5 h-2 bg-[#AEA3F8]" />
                          </div>
                        </div>
                        <div className="flex-1 border-t border-dashed border-[#5A4B9E]" />
                      </div>

                      {/* Pregunta */}
                      <p className="text-white font-pixel font-bold text-[11px] tracking-[0.14em] uppercase drop-shadow-[0_2px_0_rgba(0,0,0,0.8)] leading-tight">
                        {question}
                      </p>

                      {/* Botón CTA Cápsula 3D Magenta */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const el = document.getElementById('modulos');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className="mt-2.5 w-[90%] max-w-[200px] py-1.5 px-3 bg-[#E5007E] hover:bg-[#FF1988] text-white font-heading font-bold text-[10.5px] tracking-wide rounded-full border-t border-white/40 border-b-[4px] border-b-[#8A004C] border-x border-x-[#A00052] shadow-[0_4px_14px_rgba(229,0,126,0.35)] active:border-b-0 active:translate-y-[4px] active:shadow-none transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 select-none whitespace-nowrap"
                      >
                        <span>Infórmate y participa →</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StateHologramCard;
