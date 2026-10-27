'use client';

/**
 * StateHologramCard — Proyección holográfica del estado activo (Hito H5, Fase 2).
 *
 * Basado en la composición de `docs/referencias/mockup-hover-estado.jpg` con la
 * paleta acordada (Maqueta Índigo Profundo + Luz Lavanda Clara del mapa):
 *   1. Haz/cono de luz volumétrico lavanda que nace de todo el ancho del estado
 *      iluminado en el mapa (con halo en la base, cuerpo difuminado, rayos laterales
 *      definidos y destellos en el origen) y entra por debajo de los acantilados 3D.
 *   2. Isla voxel 3D de alta resolución (`/data/holo/state-XX.png`) horneada desde
 *      `mexico-estados.geojson` con el mismo shader isométrico de `build-map.ts`.
 *   3. Ranura `children` centrada en el polo visual del estado (para la Fase 3).
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
  /** Posición y dimensiones de la pieza voxel ampliada en px del contenedor */
  left: number;
  top: number;
  w: number;
  h: number;
  /** Puntos de origen izquierdo y derecho sobre el estado en el mapa base */
  baseLeft: [number, number];
  baseRight: [number, number];
  baseCenter: [number, number];
  baseRadiusX: number;
  baseRadiusY: number;
  /** Puntos de tangencia izquierdo y derecho en la pieza voxel ampliada */
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

  // Coordenadas del estado en el mapa base (ya elevado)
  const [bMinX, bMinY, bMaxX, bMaxY] = state.bbox;
  const stateSpanW = Math.max(14, (bMaxX - bMinX) * sx);
  const stateSpanH = Math.max(10, (bMaxY - bMinY) * sy);

  const ax = state.anchor.x * sx;
  const ay = (state.anchor.y - liftLogicalPx) * sy;

  // El haz nace abrazando los flancos reales del estado en el mapa (como en mockup-hover-estado.jpg)
  const halfBaseW = Math.min(Math.max(16, stateSpanW * 0.42), cw * 0.085);
  const baseLeft: [number, number] = [ax - halfBaseW, ay + stateSpanH * 0.05];
  const baseRight: [number, number] = [ax + halfBaseW, ay - stateSpanH * 0.04];
  const baseCenter: [number, number] = [ax, ay];

  // Escala de la isla voxel ampliada (~28-31% del ancho del mapa, respetando su proporción)
  const aspect = meta.height / meta.width;
  const targetMaxDim = Math.min(320, Math.max(195, cw * 0.285));
  let w: number;
  let h: number;
  if (aspect >= 1) {
    h = Math.min(targetMaxDim, ch * 0.45);
    w = h / aspect;
  } else {
    w = targetMaxDim;
    h = w * aspect;
  }

  // Espacio libre obligatorio (`beamGap`) entre el estado en el mapa y la base de la pieza ampliada
  // para que el cono de luz se aprecie en toda su longitud como en mockup-hover-estado.jpg
  const beamGap = Math.max(48, ch * 0.125);
  const pad = 10;

  let left: number;
  let top: number;

  if (ay - h - beamGap >= -ch * 0.06) {
    // Caso general (centro y sur): la isla flota claramente arriba y ligeramente desplazada
    const horizontalShift =
      ax < cw * 0.35
        ? w * 0.32
        : ax > cw * 0.72
        ? -w * 0.32
        : w * 0.24;
    left = Math.min(Math.max(pad, ax - w / 2 + horizontalShift), cw - w - pad);
    top = ay - h - beamGap;
  } else {
    // Estados del extremo norte (BC, Sonora, Chihuahua, Coahuila): proyectar en diagonal hacia el interior
    const goRight = ax < cw * 0.52;
    const horizGap = Math.max(52, cw * 0.065);
    left = goRight
      ? Math.min(cw - w - pad, ax + stateSpanW * 0.45 + horizGap)
      : Math.max(pad, ax - stateSpanW * 0.45 - horizGap - w);
    top = Math.max(-ch * 0.04, Math.min(ch - h - pad, ay - h * 0.65));
  }

  // Puntos de tangencia exactos en los flancos de la pieza ampliada
  const targetLeft: [number, number] = [
    left + meta.flankLeft[0] * w,
    top + meta.flankLeft[1] * h,
  ];
  const targetRight: [number, number] = [
    left + meta.flankRight[0] * w,
    top + meta.flankRight[1] * h,
  ];
  const targetCenter: [number, number] = [
    (targetLeft[0] + targetRight[0]) / 2,
    (targetLeft[1] + targetRight[1]) / 2,
  ];

  return {
    left,
    top,
    w,
    h,
    baseLeft,
    baseRight,
    baseCenter,
    baseRadiusX: halfBaseW * 1.35,
    baseRadiusY: Math.max(12, halfBaseW * 0.68),
    targetLeft,
    targetRight,
    targetCenter,
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

  // Pre-calcular puntos del polígono del haz y rayos internos
  const beamGeometry = useMemo(() => {
    if (!layout) return null;
    const { baseLeft, baseRight, targetLeft, targetRight, baseCenter, targetCenter } = layout;
    const mainPolygon = `${baseLeft[0]},${baseLeft[1]} ${targetLeft[0]},${targetLeft[1]} ${targetRight[0]},${targetRight[1]} ${baseRight[0]},${baseRight[1]}`;

    const lerpPt = (a: [number, number], b: [number, number], t: number): [number, number] => [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
    ];

    // Rayos secundarios internos del proyector
    const ray1Base = lerpPt(baseLeft, baseRight, 0.26);
    const ray1Top = lerpPt(targetLeft, targetRight, 0.28);
    const ray2Base = lerpPt(baseLeft, baseRight, 0.74);
    const ray2Top = lerpPt(targetLeft, targetRight, 0.72);

    // Partículas/destellos sutiles en la base del haz (deterministas, sin Math.random)
    const sparkles = [
      { u: 0.28, v: 0.14, r: 2.0, o: 0.85 },
      { u: 0.52, v: 0.10, r: 2.4, o: 0.92 },
      { u: 0.68, v: 0.18, r: 1.8, o: 0.78 },
      { u: 0.38, v: 0.26, r: 1.6, o: 0.70 },
      { u: 0.60, v: 0.30, r: 2.1, o: 0.75 },
      { u: 0.46, v: 0.40, r: 1.5, o: 0.55 },
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
            transform: translate3d(0, 14px, 0) scale(0.92);
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
          animation: holo-island-in 210ms cubic-bezier(0.2, 0.85, 0.25, 1) both;
        }
        .holo-beam-enter {
          animation: holo-beam-in 220ms ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .holo-island-enter, .holo-beam-enter {
            animation: none !important;
          }
        }
      `}</style>

      {state && stateMeta && layout && beamGeometry && (
        <>
          {/* CAPA 1 (z-10): CONO DE LUZ VOLUMÉTRICO (detrás de la isla ampliada) */}
          <svg
            key={`beam-${state.id}`}
            className="holo-beam-enter absolute inset-0 w-full h-full overflow-visible z-10"
            width={size.w}
            height={size.h}
            aria-hidden="true"
          >
            <defs>
              {/* Degradado principal del cuerpo del cono (intenso en el mapa -> se funde bajo la isla) */}
              <linearGradient
                id={`beam-body-${state.id}`}
                gradientUnits="userSpaceOnUse"
                x1={beamGeometry.baseCenter[0]}
                y1={beamGeometry.baseCenter[1]}
                x2={beamGeometry.targetCenter[0]}
                y2={beamGeometry.targetCenter[1]}
              >
                <stop offset="0%" stopColor="#F4F2FF" stopOpacity="0.90" />
                <stop offset="28%" stopColor="#D6D3FF" stopOpacity="0.65" />
                <stop offset="68%" stopColor="#B4B2FF" stopOpacity="0.34" />
                <stop offset="92%" stopColor="#9A96FF" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#9A96FF" stopOpacity="0.0" />
              </linearGradient>

              {/* Degradado para los dos rayos laterales definidos del cono */}
              <linearGradient
                id={`beam-edge-${state.id}`}
                gradientUnits="userSpaceOnUse"
                x1={beamGeometry.baseCenter[0]}
                y1={beamGeometry.baseCenter[1]}
                x2={beamGeometry.targetCenter[0]}
                y2={beamGeometry.targetCenter[1]}
              >
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
                <stop offset="45%" stopColor="#EAE6FF" stopOpacity="0.80" />
                <stop offset="85%" stopColor="#B4B2FF" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#B4B2FF" stopOpacity="0.0" />
              </linearGradient>

              {/* Resplandor radial en la base del estado en el mapa */}
              <radialGradient id={`beam-base-glow-${state.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
                <stop offset="45%" stopColor="#DCD4FF" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#8A89FA" stopOpacity="0.0" />
              </radialGradient>
            </defs>

            {/* Halo luminoso elíptico sobre el estado en el mapa */}
            <ellipse
              cx={layout.baseCenter[0]}
              cy={layout.baseCenter[1]}
              rx={layout.baseRadiusX}
              ry={layout.baseRadiusY}
              fill={`url(#beam-base-glow-${state.id})`}
            />

            {/* Cuerpo principal del cono de luz */}
            <polygon
              points={beamGeometry.mainPolygon}
              fill={`url(#beam-body-${state.id})`}
            />

            {/* Haces internos sutiles de proyección */}
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

            {/* Rayos laterales brillantes (bordes izquierdo y derecho del cono como en el mock) */}
            <line
              x1={layout.baseLeft[0]}
              y1={layout.baseLeft[1]}
              x2={layout.targetLeft[0]}
              y2={layout.targetLeft[1]}
              stroke={`url(#beam-edge-${state.id})`}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1={layout.baseRight[0]}
              y1={layout.baseRight[1]}
              x2={layout.targetRight[0]}
              y2={layout.targetRight[1]}
              stroke={`url(#beam-edge-${state.id})`}
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Destellos de luz ascendentes en la base del haz */}
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
                'drop-shadow(0 0 10px rgba(190, 185, 255, 0.72)) drop-shadow(0 14px 22px rgba(24, 18, 68, 0.38))',
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

            {/* Ranura centrada en el polo visual del estado para el contenido de la Fase 3 */}
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
