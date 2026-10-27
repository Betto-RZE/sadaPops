'use client';

/**
 * StateHologramCard — Proyección holográfica del estado activo (Hito H5, Fase 2).
 *
 * Capas:
 *   1. Cono de luz lavanda (SVG) que nace en el ancla del estado en el mapa.
 *   2. Silueta voxel 3D ampliada del estado (canvas pixelado) con borde lavanda.
 *   3. Ranura `children` centrada sobre la silueta (contenido de la Fase 3).
 *
 * Geometría: la silueta se reconstruye en runtime desde `map-ids.bin` (ya cargado por
 * `useMapData`), a resolución de vóxel. Sin GeoJSON en el cliente ni cálculo por frame:
 * se rasteriza una sola vez por estado y se escala con CSS (`image-rendering: pixelated`).
 *
 * Debe montarse como hijo de <PixelMap> (usa su contexto).
 */

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { usePixelMapContext, ELEVATION_VOXELS } from './PixelMap';
import type { MapIndexData, StateMetadata } from './types';
import { cn } from '../../shared/utils';

// ───────────────────────────── Paleta (Opción A ajustada) ─────────────────────────────
const HOLO = {
  top: ['#35328F', '#322F89', '#383594', '#302D84'],
  innerBevel: '#2A2775',
  rimLight: '#F0EEFF', // borde N/O (luz)
  rimLip: '#B4B2FF', // borde S/E
  wallLight: '#2A1F7A',
  wallDark: '#1C1358',
  coneNear: '#B4B2FF',
  coneFar: '#F0EEFF',
} as const;

/** Altura de la extrusión de la pieza ampliada, en celdas */
const HOLO_EXTRUSION = 3;
/** Resolución objetivo del lado mayor de la silueta, en celdas */
const TARGET_CELLS = 56;

// ───────────────────────────── Rasterizado de silueta ─────────────────────────────

interface Silhouette {
  cols: number;
  rows: number; // incluye extrusión
  canvas: HTMLCanvasElement;
}

function hash2(x: number, y: number): number {
  let n = (x * 374761393 + y * 668265263) ^ 0x5bf03635;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

/** Máscara a resolución de vóxel de la cara superior del estado */
function buildVoxelMask(data: MapIndexData, state: StateMetadata) {
  const S = data.pixelScale;
  const [minX, minY, maxX, maxY] = state.bbox;
  const vx0 = Math.floor(minX / S);
  const vy0 = Math.floor(minY / S);
  const vw = Math.floor(maxX / S) - vx0 + 1;
  const vh = Math.floor(maxY / S) - vy0 + 1;
  const mask = new Uint8Array(vw * vh);
  const top = data.pixelsByNumId.get(state.numId)?.topPixels;
  if (top) {
    for (let i = 0; i < top.length; i++) {
      const idx = top[i];
      const x = Math.floor((idx % data.width) / S) - vx0;
      const y = Math.floor(Math.floor(idx / data.width) / S) - vy0;
      if (x >= 0 && y >= 0 && x < vw && y < vh) mask[y * vw + x] = 1;
    }
  }
  return { mask, vw, vh };
}

function rasterizeSilhouette(data: MapIndexData, state: StateMetadata): Silhouette | null {
  const { mask, vw, vh } = buildVoxelMask(data, state);
  if (vw <= 0 || vh <= 0) return null;

  // Factor entero de subdivisión para que estados pequeños ganen detalle de borde
  const k = Math.max(1, Math.floor(TARGET_CELLS / Math.max(vw, vh)));
  const cols = vw * k + 2; // margen de 1 celda para el borde
  const topRows = vh * k + 2;
  const rows = topRows + HOLO_EXTRUSION;

  // Máscara ampliada (vecino más cercano)
  const m = new Uint8Array(cols * topRows);
  for (let y = 1; y < topRows - 1; y++) {
    const sy = Math.floor((y - 1) / k);
    for (let x = 1; x < cols - 1; x++) {
      const sx = Math.floor((x - 1) / k);
      m[y * cols + x] = mask[sy * vw + sx];
    }
  }
  const at = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < cols && y < topRows ? m[y * cols + x] : 0;

  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 1. Paredes extruidas (debajo de cada celda cuyo vecino inferior está vacío)
  for (let y = 0; y < topRows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!at(x, y) || at(x, y + 1)) continue;
      for (let d = 1; d <= HOLO_EXTRUSION; d++) {
        ctx.fillStyle = (x + d) % 2 === 0 ? HOLO.wallLight : HOLO.wallDark;
        if (!at(x + 1, y)) ctx.fillStyle = HOLO.wallDark;
        ctx.fillRect(x, y + d, 1, 1);
      }
    }
  }

  // 2. Cara superior con biseles
  for (let y = 0; y < topRows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!at(x, y)) continue;
      const nw = !at(x, y - 1) || !at(x - 1, y);
      const se = !at(x, y + 1) || !at(x + 1, y);
      const nearEdge =
        !at(x, y - 2) || !at(x - 2, y) || !at(x, y + 2) || !at(x + 2, y);
      let c: string;
      if (nw) c = HOLO.rimLight;
      else if (se) c = HOLO.rimLip;
      else if (nearEdge) c = HOLO.innerBevel;
      else c = HOLO.top[Math.floor(hash2(Math.floor(x / 2), Math.floor(y / 2)) * HOLO.top.length)];
      ctx.fillStyle = c;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return { cols, rows, canvas };
}

// ───────────────────────────── Posicionamiento ─────────────────────────────

type Placement = 'above' | 'right' | 'left';

interface Layout {
  placement: Placement;
  left: number;
  top: number;
  w: number;
  h: number;
  ax: number;
  ay: number;
}

function computeLayout(
  cw: number,
  ch: number,
  ax: number,
  ay: number,
  aspect: number // h / w
): Layout {
  // Ancho base de la tarjeta según el ancho del mapa
  let w = Math.min(340, Math.max(200, cw * 0.27));
  let h = w * aspect;
  const maxH = Math.max(220, ch * 0.62);
  if (h > maxH) {
    h = maxH;
    w = h / aspect;
  }
  const gap = Math.max(28, ch * 0.08);
  const pad = 8;
  const clampX = (x: number) => Math.min(Math.max(pad, x), cw - w - pad);
  const clampY = (y: number) => Math.min(Math.max(-ch * 0.12, y), ch - h);

  const aboveTop = ay - gap - h;
  if (aboveTop >= -ch * 0.12) {
    return { placement: 'above', left: clampX(ax - w / 2), top: aboveTop, w, h, ax, ay };
  }
  const placement: Placement = ax < cw * 0.55 ? 'right' : 'left';
  const left = placement === 'right' ? ax + gap : ax - gap - w;
  return {
    placement,
    left: Math.min(Math.max(pad, left), cw - w - pad),
    top: clampY(ay - h * 0.6),
    w,
    h,
    ax,
    ay,
  };
}

function conePoints(l: Layout): string {
  const { left, top, w, h, ax, ay, placement } = l;
  let p1: [number, number];
  let p2: [number, number];
  if (placement === 'above') {
    const y = top + h * 0.82;
    p1 = [left + w * 0.18, y];
    p2 = [left + w * 0.82, y];
  } else {
    const x = placement === 'right' ? left + w * 0.12 : left + w * 0.88;
    p1 = [x, top + h * 0.2];
    p2 = [x, top + h * 0.8];
  }
  return `${ax},${ay} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`;
}

// ───────────────────────────── Componente ─────────────────────────────

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
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // Tamaño del contenedor del mapa (para convertir coordenadas lógicas a px)
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Caché de siluetas rasterizadas por estado (una sola vez por estado)
  const cacheRef = useRef(new Map<string, Silhouette | null>());
  const silhouette = useMemo(() => {
    if (!data || !state || typeof document === 'undefined') return null;
    const cache = cacheRef.current;
    if (!cache.has(state.id)) cache.set(state.id, rasterizeSilhouette(data, state));
    return cache.get(state.id) ?? null;
  }, [data, state]);

  // Montar el canvas cacheado en el host (el host existe solo cuando hay layout)
  const hasLayout = Boolean(state && silhouette && size.w > 0);
  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;
    host.replaceChildren();
    if (silhouette) {
      const c = silhouette.canvas;
      c.className = 'block w-full h-full [image-rendering:pixelated]';
      c.setAttribute('aria-hidden', 'true');
      host.appendChild(c);
    }
  }, [silhouette, hasLayout, state?.id]);

  const layout = useMemo(() => {
    if (!data || !state || !silhouette || size.w === 0) return null;
    const sx = size.w / data.width;
    const ax = state.anchor.x * sx;
    const ay = (state.anchor.y - ELEVATION_VOXELS * data.pixelScale) * (size.h / data.height);
    return computeLayout(size.w, size.h, ax, ay, silhouette.rows / silhouette.cols);
  }, [data, state, silhouette, size]);

  return (
    <div ref={rootRef} className={cn('absolute inset-0 pointer-events-none z-40', className)}>
      <style>{`
        @keyframes holo-in {
          0% { opacity: 0; transform: translateY(10px) scale(0.94); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes holo-cone-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        .holo-card { animation: holo-in 220ms cubic-bezier(0.2, 0.8, 0.25, 1) both; }
        .holo-cone { animation: holo-cone-in 260ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .holo-card, .holo-cone { animation: none !important; }
        }
      `}</style>

      {state && layout && (
        <>
          {/* Cono de luz lavanda */}
          <svg
            key={`cone-${state.id}`}
            className="holo-cone absolute inset-0 w-full h-full overflow-visible"
            width={size.w}
            height={size.h}
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="holo-cone-grad"
                gradientUnits="userSpaceOnUse"
                x1={layout.ax}
                y1={layout.ay}
                x2={layout.left + layout.w / 2}
                y2={layout.top + layout.h / 2}
              >
                <stop offset="0%" stopColor={HOLO.coneNear} stopOpacity="0.75" />
                <stop offset="60%" stopColor={HOLO.coneFar} stopOpacity="0.35" />
                <stop offset="100%" stopColor={HOLO.coneFar} stopOpacity="0.08" />
              </linearGradient>
            </defs>
            <polygon points={conePoints(layout)} fill="url(#holo-cone-grad)" />
            {/* Punto de origen luminoso sobre el estado */}
            <circle cx={layout.ax} cy={layout.ay} r={4} fill={HOLO.coneFar} opacity="0.9" />
          </svg>

          {/* Silueta voxel ampliada */}
          <div
            key={`card-${state.id}`}
            className="holo-card absolute"
            style={{
              left: layout.left,
              top: layout.top,
              width: layout.w,
              height: layout.h,
              filter: 'drop-shadow(0 0 6px rgba(180,178,255,0.55)) drop-shadow(0 10px 14px rgba(28,23,74,0.35))',
            }}
          >
            <div ref={canvasHostRef} className="absolute inset-0" />
            {children && (
              <div className="absolute inset-0 flex items-center justify-center">
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
