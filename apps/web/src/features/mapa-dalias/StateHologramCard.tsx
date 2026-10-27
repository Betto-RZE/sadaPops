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
import type { StateMetadata } from './types';
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

  const ax = state.anchor.x * sx;
  const ay = (state.anchor.y - liftLogicalPx) * sy;

  // Escala de la isla voxel ampliada (~26-28% del ancho del mapa, respetando su proporción)
  const aspect = meta.height / meta.width;
  const targetMaxDim = Math.min(295, Math.max(185, cw * 0.265));
  let w: number;
  let h: number;
  if (aspect >= 1) {
    h = Math.min(targetMaxDim, ch * 0.42);
    w = h / aspect;
  } else {
    w = targetMaxDim;
    h = w * aspect;
  }

  // Zona segura dentro del contenedor del mapa (evita logo INE arriba-izquierda y menú arriba-derecha)
  const padX = Math.max(16, cw * 0.03);
  const safeTopMin = Math.max(16, ch * 0.04);
  const safeTopMax = Math.max(safeTopMin, ch - h - 12);
  const beamGap = Math.max(46, ch * 0.115);

  let left: number;
  let top: number;

  // Si el estado está en la mitad superior (ej. BC, Sonora, Chihuahua, Coahuila, NL, Sinaloa),
  // proyectar lateralmente hacia el interior del mapa dentro de la franja vertical segura
  const canFitAbove = ay - h - beamGap >= safeTopMin;

  if (canFitAbove) {
    const shiftX =
      ax < cw * 0.36
        ? w * 0.34
        : ax > cw * 0.68
        ? -w * 0.34
        : w * 0.22;
    left = Math.min(Math.max(padX, ax - w / 2 + shiftX), cw - w - padX);
    top = Math.min(safeTopMax, Math.max(safeTopMin, ay - h - beamGap));
  } else {
    const goRight = ax < cw * 0.52;
    const horizGap = Math.max(54, cw * 0.065);
    left = goRight
      ? Math.min(cw - w - padX, ax + stateSpanW * 0.45 + horizGap)
      : Math.max(padX, ax - stateSpanW * 0.45 - horizGap - w);
    // Para estados muy arriba (BC, Sonora), bajar ligeramente la tarjeta hacia el centro
    const idealTop = ay < ch * 0.28 ? ay + ch * 0.02 : ay - h * 0.42;
    top = Math.min(safeTopMax, Math.max(safeTopMin, idealTop));
  }

  // Eje central desde el ancla del estado en el mapa (A) hasta el polo visual de la pieza ampliada (C)
  const cx = left + meta.visualCenter[0] * w;
  const cy = top + meta.visualCenter[1] * h;

  const dx = cx - ax;
  const dy = cy - ay;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  // Vector unitario perpendicular al eje del cono
  const nx = -uy;
  const ny = ux;

  // Ancho en la base (proporcional al estado en el mapa, acotado para simetría limpia)
  const rBase = Math.min(Math.max(12, Math.min(stateSpanW, stateSpanH) * 0.34), 24);
  // Ancho en el destino (dentro de la silueta sólida de la pieza ampliada)
  const radiusRatio = meta.coneRadiusRatio ?? 0.32;
  const rTop = Math.min(w, h) * radiusRatio;

  // Detener el eje ligeramente antes del centro visual para que el cono quede cubierto por la silueta
  const tx = cx - ux * (rTop * 0.12);
  const ty = cy - uy * (rTop * 0.12);

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

export function StateHologramCard({ children, className }: StateHologramCardProps) {
  const { data, selectedStateId, hoveredStateId } = usePixelMapContext();
  const activeId = hoveredStateId || selectedStateId;
  const state = data && activeId ? data.stateById.get(activeId) ?? null : null;

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
    <div ref={rootRef} className={cn('absolute inset-0 pointer-events-none z-40', className)}>
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

            <ellipse
              cx={layout.baseCenter[0]}
              cy={layout.baseCenter[1]}
              rx={layout.baseRadiusX}
              ry={layout.baseRadiusY}
              fill={`url(#beam-base-glow-${state.id})`}
            />

            <polygon
              points={beamGeometry.mainPolygon}
              fill={`url(#beam-body-${state.id})`}
            />

            <line
              x1={beamGeometry.ray1Base[0]}
              y1={beamGeometry.ray1Base[1]}
              x2={beamGeometry.ray1Top[0]}
              y2={beamGeometry.ray1Top[1]}
              stroke={`url(#beam-edge-${state.id})`}
              strokeWidth="1.5"
              strokeOpacity="0.45"
            />
            <line
              x1={beamGeometry.ray2Base[0]}
              y1={beamGeometry.ray2Base[1]}
              x2={beamGeometry.ray2Top[0]}
              y2={beamGeometry.ray2Top[1]}
              stroke={`url(#beam-edge-${state.id})`}
              strokeWidth="1.5"
              strokeOpacity="0.45"
            />

            <line
              x1={layout.baseLeft[0]}
              y1={layout.baseLeft[1]}
              x2={layout.targetLeft[0]}
              y2={layout.targetLeft[1]}
              stroke={`url(#beam-edge-${state.id})`}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <line
              x1={layout.baseRight[0]}
              y1={layout.baseRight[1]}
              x2={layout.targetRight[0]}
              y2={layout.targetRight[1]}
              stroke={`url(#beam-edge-${state.id})`}
              strokeWidth="2.2"
              strokeLinecap="round"
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

          {/* CAPA 2 (z-20): ISLA VOXEL 3D AMPLIADA DEL ESTADO */}
          <div
            key={`island-${state.id}`}
            className="holo-island-enter absolute z-20"
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
              alt={`Silueta voxel 3D ampliada de ${state.nombre}`}
              width={stateMeta.width}
              height={stateMeta.height}
              decoding="async"
              className="block w-full h-full object-contain [image-rendering:pixelated] select-none pointer-events-none"
            />

            {children && (
              <div
                className="absolute flex items-center justify-center"
                style={{
                  left: `${stateMeta.visualCenter[0] * 100}%`,
                  top: `${stateMeta.visualCenter[1] * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {children(state)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default StateHologramCard;
