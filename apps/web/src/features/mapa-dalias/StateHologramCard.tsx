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
import { BarChart } from 'lucide-react';
import { usePixelMapContext, ELEVATION_VOXELS } from './PixelMap';
import { useOptionalDahliaStore } from './DahliaStore';
import { type StateMetadata, getCommonStateName } from './types';
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
  '05': [0.50, 0.50], // Coahuila (centrado armónico)
  '08': [0.50, 0.50], // Chihuahua (centrado armónico)
  '19': [0.50, 0.50], // Nuevo León (centrado armónico)
  '21': [0.50, 0.52], // Puebla (centro de masa)
  '25': [0.48, 0.48], // Sinaloa (franja central)
  '26': [0.50, 0.50], // Sonora (centrado armónico)
  '28': [0.50, 0.50], // Tamaulipas (centrado armónico)
  '30': [0.50, 0.50], // Veracruz (centro de la media luna)
};

/**
 * Silueta Pixel-Art del chasis exterior (fidelidad 1:1 con mock-card.jpg).
 * Chamfer escalonado de 8px en esquinas y muescas laterales a media altura.
 */
const CHASSIS_OUTER_CLIP =
  'polygon(0 8px, 2px 8px, 2px 6px, 4px 6px, 4px 4px, 6px 4px, 6px 2px, 8px 2px, 8px 0, calc(100% - 8px) 0, calc(100% - 8px) 2px, calc(100% - 6px) 2px, calc(100% - 6px) 4px, calc(100% - 4px) 4px, calc(100% - 4px) 6px, calc(100% - 2px) 6px, calc(100% - 2px) 8px, 100% 8px, 100% calc(50% - 6px), calc(100% - 3px) calc(50% - 4px), calc(100% - 3px) calc(50% + 4px), 100% calc(50% + 6px), 100% calc(100% - 8px), calc(100% - 2px) calc(100% - 8px), calc(100% - 2px) calc(100% - 6px), calc(100% - 4px) calc(100% - 6px), calc(100% - 4px) calc(100% - 4px), calc(100% - 6px) calc(100% - 4px), calc(100% - 6px) calc(100% - 2px), calc(100% - 8px) calc(100% - 2px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 2px), 6px calc(100% - 2px), 6px calc(100% - 4px), 4px calc(100% - 4px), 4px calc(100% - 6px), 2px calc(100% - 6px), 2px calc(100% - 8px), 0 calc(100% - 8px), 0 calc(50% + 6px), 3px calc(50% + 4px), 3px calc(50% - 4px), 0 calc(50% - 6px))';

/**
 * Canal oscuro hundido (inset 3px, chamfer de 5px).
 */
const CHASSIS_CANAL_CLIP =
  'polygon(0 5px, 2px 5px, 2px 3px, 3px 3px, 3px 2px, 5px 2px, 5px 0, calc(100% - 5px) 0, calc(100% - 5px) 2px, calc(100% - 3px) 2px, calc(100% - 3px) 3px, calc(100% - 2px) 3px, calc(100% - 2px) 5px, 100% 5px, 100% calc(50% - 4px), calc(100% - 2px) calc(50% - 3px), calc(100% - 2px) calc(50% + 3px), 100% calc(50% + 4px), 100% calc(100% - 5px), calc(100% - 2px) calc(100% - 5px), calc(100% - 2px) calc(100% - 3px), calc(100% - 3px) calc(100% - 3px), calc(100% - 3px) calc(100% - 2px), calc(100% - 5px) calc(100% - 2px), calc(100% - 5px) 100%, 5px 100%, 5px calc(100% - 2px), 3px calc(100% - 2px), 3px calc(100% - 3px), 2px calc(100% - 3px), 2px calc(100% - 5px), 0 calc(100% - 5px), 0 calc(50% + 4px), 2px calc(50% + 3px), 2px calc(50% - 3px), 0 calc(50% - 4px))';

/**
 * Panel interior medianoche (inset 5px, chamfer de 3px).
 */
const CHASSIS_PANEL_CLIP =
  'polygon(0 3px, 1px 3px, 1px 1px, 3px 1px, 3px 0, calc(100% - 3px) 0, calc(100% - 3px) 1px, calc(100% - 1px) 1px, calc(100% - 1px) 3px, 100% 3px, 100% calc(100% - 3px), calc(100% - 1px) calc(100% - 3px), calc(100% - 1px) calc(100% - 1px), calc(100% - 3px) calc(100% - 1px), calc(100% - 3px) 100%, 3px 100%, 3px calc(100% - 1px), 1px calc(100% - 1px), 1px calc(100% - 3px), 0 calc(100% - 3px))';

/**
 * Silueta escalonada de la cápsula del botón voxel 3D (3 peldaños de 2px por esquina, fidelidad 1:1 con mock-card.jpg).
 */
const BUTTON_CLIP_PATH =
  'polygon(0 6px, 2px 6px, 2px 4px, 4px 4px, 4px 2px, 6px 2px, 6px 0, calc(100% - 6px) 0, calc(100% - 6px) 2px, calc(100% - 4px) 2px, calc(100% - 4px) 4px, calc(100% - 2px) 4px, calc(100% - 2px) 6px, 100% 6px, 100% calc(100% - 6px), calc(100% - 2px) calc(100% - 6px), calc(100% - 2px) calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) calc(100% - 2px), calc(100% - 6px) calc(100% - 2px), calc(100% - 6px) 100%, 6px 100%, 6px calc(100% - 2px), 4px calc(100% - 2px), 4px calc(100% - 4px), 2px calc(100% - 4px), 2px calc(100% - 6px), 0 calc(100% - 6px))';

interface HoloLayout {
  left: number;
  top: number;
  w: number;
  h: number;
  islandOffsetPx: number;
  cardOffsetPx: number;
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

  // Dimensiones escaladas de la silueta voxel 3D manteniendo su proporción original.
  // Se mantiene amplia (~275px a 325px) para que enmarque generosamente a la tarjeta de 168px.
  const aspect = meta.height / meta.width;
  const targetMaxDim = Math.min(325, Math.max(275, Math.round(cw * 0.28)));
  let w: number;
  let h: number;
  if (aspect >= 1) {
    h = targetMaxDim;
    w = Math.round(h / aspect);
  } else {
    w = targetMaxDim;
    h = Math.round(w * aspect);
  }

  // Dimensiones de la tarjeta compacta (168px ancho x ~185px alto)
  const CARD_HALF_W = 84;
  const CARD_HALF_H = 92;
  const SAFE_CARD_TOP = -18; // Techo seguro: la tarjeta nunca sube de -18px en el Hero
  const MIN_BEAM_DIST = 145; // Longitud mínima de proyección para haz de luz siempre visible y despejado

  const opticalCenter = OPTICAL_CENTER_OVERRIDES[state.id] ?? meta.visualCenter;

  // Cota mínima para cy: garantiza que cardTop = cy - CARD_HALF_H >= SAFE_CARD_TOP
  const minCenterY = SAFE_CARD_TOP + CARD_HALF_H; // ~ 74px

  const ax = rawAx;
  const ay = rawAy;

  // Altura tentativa estándar para proyección vertical
  const standardCy = ay - h * opticalCenter[1] - 50;

  let cy: number;
  let cx: number;

  if (standardCy >= minCenterY && Math.abs(standardCy - ay) >= MIN_BEAM_DIST) {
    // Proyección vertical estándar sin desbordamiento (estados centrales y del sur)
    cy = standardCy;
    cx = ax;
  } else {
    // Estado cercano a la frontera norte (BC, Sonora, Chihuahua, Coahuila, Nuevo León, etc.):
    // Fijamos cy en la posición segura más alta dentro del viewport
    cy = Math.max(minCenterY, standardCy);
    const dy = cy - ay;
    const dyAbs = Math.abs(dy);

    // Si la distancia vertical es corta, se abre un desplazamiento diagonal lateral dx
    // para garantizar un haz de luz largo y visible sin aplastar la tarjeta sobre el estado.
    let dx = 0;
    if (dyAbs < MIN_BEAM_DIST) {
      dx = Math.round(Math.sqrt(Math.max(0, MIN_BEAM_DIST * MIN_BEAM_DIST - dy * dy)));
    }

    // Dirección hacia la zona más abierta del mapa
    const spaceRight = cw - ax;
    const spaceLeft = ax;
    const goRight = state.id === '02' ? true : spaceRight >= spaceLeft;
    cx = goRight ? ax + dx : ax - dx;
  }

  // Propuesta A: Desfase Lateral Dinámico para siluetas estrechas o compactas (< 220px) y casos especiales (CDMX '09', Puebla '21')
  // En estados angostos (BC, Sinaloa, etc.) o con masa concentrada/cintura estrecha (CDMX, Puebla),
  // la tarjeta de 168px taparía la silueta territorial.
  // Desplazamos la silueta a la izquierda (-45px) y la tarjeta a la derecha (+60px) hacia el espacio libre sin exagerar.
  const isNarrow = w < 220 || state.id === '09' || state.id === '21';
  let islandOffsetPx = 0;
  let cardOffsetPx = 0;

  if (isNarrow) {
    const hasSpaceRight = cx + CARD_HALF_W + 65 <= cw - 16;
    if (hasSpaceRight) {
      cardOffsetPx = 60;
      islandOffsetPx = -45;
    } else {
      cardOffsetPx = -60;
      islandOffsetPx = 45;
    }
  }

  // Clamping horizontal seguro para la tarjeta dentro del contenedor considerando el desfase
  const effectiveCardCx = cx + cardOffsetPx;
  const padX = Math.max(16, cw * 0.02);
  const minCardCx = padX + CARD_HALF_W;
  const maxCardCx = cw - padX - CARD_HALF_W;
  const clampedCardCx = Math.round(Math.min(maxCardCx, Math.max(minCardCx, effectiveCardCx)));
  // Ajuste compensatorio a cx si la card tocó el borde
  cx += clampedCardCx - effectiveCardCx;

  cy = Math.round(cy);

  // Derivar las coordenadas de la silueta voxel 3D a partir del centro de la isla
  const islandCx = Math.round(cx + islandOffsetPx);
  const left = Math.round(islandCx - opticalCenter[0] * w);
  const top = Math.round(cy - opticalCenter[1] * h);

  const dxFinal = islandCx - ax;
  const dyFinal = cy - ay;
  const dist = Math.hypot(dxFinal, dyFinal) || 1;
  const ux = dxFinal / dist;
  const uy = dyFinal / dist;
  // Vector unitario perpendicular al eje del cono
  const nx = -uy;
  const ny = ux;

  // Ancho en la base (proporcional al estado en el mapa, acotado para haz sutil)
  const rBase = Math.min(Math.max(12, Math.min(stateSpanW, stateSpanH) * 0.30), 16);
  // Ancho en el destino: apertura estrecha y controlada
  const rTop = 38;

  // El haz de luz llega a la base de la silueta voxel 3D
  const tx = islandCx - ux * 8;
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
    islandOffsetPx,
    cardOffsetPx,
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
 * Divisor decorativo con micro-flor pixelada central (fidelidad 1:1 con mock-card.jpg).
 */
function PixelDivider() {
  return (
    <div className="flex items-center justify-center w-full my-1.5 px-1 opacity-90 select-none">
      <div className="flex-1 border-t border-dashed border-[#5A4B9E]/80" />
      <div className="mx-2 flex items-center justify-center shrink-0">
        <svg
          width="9"
          height="9"
          viewBox="0 0 9 9"
          fill="none"
          className="[image-rendering:pixelated]"
          aria-hidden="true"
        >
          {/* 4 pétalos cardinales */}
          <rect x="3" y="1" width="3" height="7" fill="#AEA3F8" />
          <rect x="1" y="3" width="7" height="3" fill="#AEA3F8" />
          {/* Núcleo central brillante */}
          <rect x="3" y="3" width="3" height="3" fill="#FFFFFF" />
          {/* Esquinas oscuras de encuadre */}
          <rect x="2" y="2" width="1" height="1" fill="#4B3B8E" />
          <rect x="6" y="2" width="1" height="1" fill="#4B3B8E" />
          <rect x="2" y="6" width="1" height="1" fill="#4B3B8E" />
          <rect x="6" y="6" width="1" height="1" fill="#4B3B8E" />
        </svg>
      </div>
      <div className="flex-1 border-t border-dashed border-[#5A4B9E]/80" />
    </div>
  );
}

interface StateTitleComposition {
  antetitulo?: string;
  titulo: string;
  sizeClass: string;
}

/**
 * Descomposición tipográfica armónica del nombre del estado en 2 niveles (antetítulo + título principal).
 * Adapta el tamaño de fuente dinámicamente según la longitud del texto para evitar cualquier desborde.
 */
function formatStateTitle(stateId: string, displayName: string): StateTitleComposition {
  const norm = displayName.trim().toLowerCase();

  // Entidades federativas con prefijo institucional o geográfico
  if (stateId === '09' || norm.includes('ciudad de méxico') || norm.includes('cdmx')) {
    return {
      antetitulo: 'CIUDAD DE',
      titulo: 'MÉXICO',
      sizeClass: 'text-[20px]',
    };
  }
  if (stateId === '15' || norm.includes('estado de méxico') || norm === 'méxico') {
    return {
      antetitulo: 'ESTADO DE',
      titulo: 'MÉXICO',
      sizeClass: 'text-[20px]',
    };
  }
  if (stateId === '03' || norm.includes('baja california sur')) {
    return {
      antetitulo: 'BAJA CALIFORNIA',
      titulo: 'SUR',
      sizeClass: 'text-[20px]',
    };
  }
  if (stateId === '02' || norm.includes('baja california')) {
    return {
      antetitulo: 'BAJA',
      titulo: 'CALIFORNIA',
      sizeClass: 'text-[17px]',
    };
  }
  if (stateId === '19' || norm.includes('nuevo león')) {
    return {
      antetitulo: 'NUEVO',
      titulo: 'LEÓN',
      sizeClass: 'text-[20px]',
    };
  }
  if (stateId === '23' || norm.includes('quintana roo')) {
    return {
      antetitulo: 'QUINTANA',
      titulo: 'ROO',
      sizeClass: 'text-[20px]',
    };
  }
  if (stateId === '24' || norm.includes('san luis potosí')) {
    return {
      antetitulo: 'SAN LUIS',
      titulo: 'POTOSÍ',
      sizeClass: 'text-[18px]',
    };
  }

  // Estados sin prefijo / término único
  const upper = displayName.toUpperCase().trim();
  let sizeClass = 'text-[19px]';
  if (upper.length <= 6) {
    sizeClass = 'text-[21px]';
  } else if (upper.length <= 8) {
    sizeClass = 'text-[18.5px]';
  } else if (upper.length <= 10) {
    sizeClass = 'text-[16.5px]';
  } else {
    // Caso de nombres largos como AGUASCALIENTES (14 caracteres)
    sizeClass = 'text-[13.5px] tracking-normal';
  }

  return {
    titulo: upper,
    sizeClass,
  };
}

/**
 * Contador numérico voxel 3D con sprites PNG originales recortados (fidelidad 1:1 absoluta con mock-card.jpg).
 */
function VoxelCounter3D({ value }: { value: number }) {
  const str = value.toLocaleString('es-MX');

  return (
    <div
      className="inline-flex items-end justify-center select-none"
      role="img"
      aria-label={str}
      style={{ height: '26px' }}
    >
      {Array.from(str).map((char, index) => {
        if (char === ',' || char === '.') {
          return (
            <img
              key={`c-${index}`}
              src="/numbers/digit-comma.png"
              alt=","
              aria-hidden="true"
              width={11}
              height={14}
              className="h-[14px] w-auto object-contain [image-rendering:pixelated] -ml-[2px] -mr-[1px] mb-[1px]"
            />
          );
        }
        return (
          <img
            key={`d-${index}`}
            src={`/numbers/digit-${char}.png`}
            alt={char}
            aria-hidden="true"
            width={20}
            height={26}
            className="h-[26px] w-auto object-contain [image-rendering:pixelated] -mx-[1.5px]"
          />
        );
      })}
    </div>
  );
}

interface PixelCardChassisProps {
  children: React.ReactNode;
}

/**
 * Chasis Voxel 3D con Bisel Escalonado, Canal Hundido y Extrusión Inferior (Fidelidad 1:1 con mock-card.jpg).
 */
function PixelCardChassis({ children }: PixelCardChassisProps) {
  return (
    <div
      className="relative w-[168px] select-none pointer-events-auto"
      style={{
        filter:
          'drop-shadow(0 16px 32px rgba(10, 6, 32, 0.75)) drop-shadow(0 0 14px rgba(139, 122, 235, 0.25))',
      }}
    >
      {/* CAPA 1: Extrusión 3D Inferior en Bloques Voxel (#1B0E44) */}
      <div
        className="absolute inset-0 translate-y-[3.5px] pointer-events-none"
        style={{
          background: '#1B0E44',
          clipPath: CHASSIS_OUTER_CLIP,
        }}
      />

      {/* CAPA 2: Bisel Voxel Superior con degradado de luz y sombra */}
      <div
        className="relative w-full p-[3px]"
        style={{
          background:
            'linear-gradient(135deg, #C4B7FF 0%, #8574E8 25%, #5945BC 65%, #2F1E78 100%)',
          clipPath: CHASSIS_OUTER_CLIP,
        }}
      >
        {/* CAPA 3: Canal Oscuro Hundido (#090518) */}
        <div
          className="w-full p-[2px]"
          style={{
            background: '#090518',
            clipPath: CHASSIS_CANAL_CLIP,
          }}
        >
          {/* CAPA 4: Marco Interior de 1px (#3C2E7E) y Panel Medianoche (#130D32) */}
          <div
            className="relative w-full px-2.5 pt-2.5 pb-2.5 flex flex-col items-center justify-center text-center"
            style={{
              background: '#130D32',
              clipPath: CHASSIS_PANEL_CLIP,
            }}
          >
            {/* Marco fino interior escalonado */}
            <div
              className="absolute inset-[1px] pointer-events-none border border-[#3C2E7E]/80"
              style={{ clipPath: CHASSIS_PANEL_CLIP }}
            />

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface VoxelCapsuleButtonProps {
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Botón Cápsula Voxel 3D Escalonado con Extrusión Inferior y Tacto Mecánico (Fidelidad 1:1 con mock-card.jpg).
 */
function VoxelCapsuleButton({ onClick, children, className }: VoxelCapsuleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-[92%] max-w-[146px] h-[27px] mt-2 select-none cursor-pointer transition-all active:translate-y-[2px]',
        className
      )}
    >
      {/* CAPA 1: Sombra y Extrusión 3D Inferior en Bloques Voxel (#6B0A42) */}
      <div
        className="absolute inset-0 translate-y-[3.5px] bg-[#6B0A42] transition-all group-active:translate-y-[1px]"
        style={{ clipPath: BUTTON_CLIP_PATH }}
      />

      {/* CAPA 2: Bisel Exterior Rosa Voxel (#FFA8DC a #E6007E) */}
      <div
        className="relative w-full h-full p-[1.5px] bg-gradient-to-b from-[#FFA8DC] to-[#E6007E]"
        style={{ clipPath: BUTTON_CLIP_PATH }}
      >
        {/* CAPA 3: Cara Frontal Magenta (#FF1493 a #E6007E) */}
        <div
          className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#FF1493] to-[#E6007E] group-hover:brightness-110 transition-all px-2"
          style={{ clipPath: BUTTON_CLIP_PATH }}
        >
          {/* Texto blanco con sutil sombra */}
          <span className="font-heading font-bold text-[9px] tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] whitespace-nowrap">
            {children}
          </span>
        </div>
      </div>
    </button>
  );
}

export function StateHologramCard({ children, className }: StateHologramCardProps) {
  const { data, selectedStateId, selectState } = usePixelMapContext();
  const dahliaStore = useOptionalDahliaStore();

  // El cono de luz y la proyección holográfica se activan ÚNICAMENTE al hacer clic (seleccionar un estado)
  const state = data && selectedStateId ? data.stateById.get(selectedStateId) ?? null : null;

  const count = state && dahliaStore ? dahliaStore.getCount(state.id) : 0;
  const level = state && dahliaStore ? dahliaStore.getLevel(state.id) : 0;
  const flowerLevel = level > 0 ? level : 1;
  const question = count === 0 ? '¿QUIERES SER LA PRIMERA?' : '¿YA ERES PARTE?';
  const displayName = state ? getCommonStateName(state) : '';
  const titleComp = state ? formatStateTitle(state.id, displayName) : null;
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
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
      `,
        }}
      />

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

            {/* Chasis Pixel-Art 3D con Profundidad Real (Fidelidad 1:1 a mock-card.jpg) */}
            <div
              className="absolute z-20 flex flex-col items-center select-none pointer-events-auto transition-all"
              style={{
                left: `${opticalCenter[0] * 100}%`,
                top: `${opticalCenter[1] * 100}%`,
                transform:
                  layout.cardOffsetPx !== 0
                    ? `translate(calc(-50% + ${layout.cardOffsetPx - layout.islandOffsetPx}px), -50%)`
                    : 'translate(-50%, -50%)',
              }}
            >
              <PixelCardChassis>
                {children ? (
                  children(state)
                ) : (
                  <>
                    {/* Línea 1: Título sans-serif en dos niveles (Antetítulo + Título Principal) */}
                    {titleComp && (
                      <div className="flex flex-col items-center justify-center text-center mt-0.5 select-none leading-none">
                        {titleComp.antetitulo && (
                          <span className="font-heading text-[9.5px] font-semibold text-[#C5BEFF] uppercase tracking-[0.24em] leading-tight select-none mb-0.5">
                            {titleComp.antetitulo}
                          </span>
                        )}
                        <h3
                          className={cn(
                            'font-heading font-black text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] leading-none select-none',
                            titleComp.sizeClass
                          )}
                        >
                          {titleComp.titulo}
                        </h3>
                      </div>
                    )}

                    {/* Línea 2: Bloque Oficial INE 2024 (Participación 18-29 años + Benchmark) */}
                    {youthBenchmark && (
                      <div
                        className="mt-1.5 flex flex-col items-center justify-center select-none"
                        title={`Participación 18-29 años en la Elección Federal 2024: ${youthBenchmark.turnoutYouthPercent}% (${youthBenchmark.source})`}
                        aria-label={`En 2024, el ${youthBenchmark.turnoutYouthPercent}% de jóvenes entre 18 y 29 años votaron en ${displayName}, ${youthBenchmark.diffLabel}, según datos del INE`}
                      >
                        <div className="flex items-center gap-1.5 leading-none">
                          <BarChart
                            className="w-4 h-4 text-[#00E5FF] shrink-0 drop-shadow-[0_0_6px_rgba(0,229,255,0.7)]"
                            strokeWidth={2.2}
                            aria-hidden="true"
                          />
                          <span className="text-[10.5px] font-bold text-white tracking-tight">
                            {youthBenchmark.turnoutYouthPercent}% votó en 2024
                          </span>
                        </div>
                        <span className="text-[8px] font-medium text-[#C5BEFF] tracking-tight mt-0.5 leading-tight">
                          18–29 años · {youthBenchmark.diffLabel}
                        </span>
                        <span className="text-[7px] font-semibold text-[#8F85C7] tracking-[0.16em] uppercase mt-0.5 leading-none">
                          · INE ·
                        </span>
                      </div>
                    )}

                    {/* Divisor 1: Línea discontinua con micro-flor pixelada central ✤ */}
                    <PixelDivider />

                    {/* Bloque Cívico de Plataforma (Dalia Voxel + Cifra 3D Rosa en Matriz) */}
                    <div className="flex items-center justify-center gap-2">
                      <img
                        src={`/flowers/dahlia-${flowerLevel}.png`}
                        alt=""
                        aria-hidden="true"
                        width={28}
                        height={28}
                        className="w-7 h-7 object-contain [image-rendering:pixelated] drop-shadow shrink-0"
                      />
                      <VoxelCounter3D value={count} />
                    </div>

                    <p className="text-[#E5E0FF] text-[9.5px] font-bold leading-tight text-center mt-1 drop-shadow">
                      personas que ya dieron el primer paso
                    </p>

                    <p className="text-[#9A92D0] text-[7.5px] italic leading-none text-center mt-0.5 drop-shadow">
                      Registro en plataforma · No mide votos
                    </p>

                    {/* Divisor 2: Línea discontinua con micro-flor pixelada central ✤ */}
                    <PixelDivider />

                    {/* Pregunta */}
                    <p className="text-white font-heading font-bold text-[9.5px] tracking-wide uppercase drop-shadow-[0_2px_0_rgba(0,0,0,0.8)] leading-tight">
                      {question}
                    </p>

                    {/* Botón CTA Cápsula Voxel 3D Escalonado (Fidelidad 1:1 con mock-card.jpg) */}
                    <VoxelCapsuleButton
                      onClick={(e) => {
                        e.stopPropagation();
                        const el = document.getElementById('modulos');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      Infórmate y participa →
                    </VoxelCapsuleButton>
                  </>
                )}
              </PixelCardChassis>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StateHologramCard;
