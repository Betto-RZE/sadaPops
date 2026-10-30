'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/shared/utils';
import {
  METRO_ASSETS,
  RAIL_LINE_TOP,
  STATION_ASPECT,
  STATION_LIGHTS,
  STATION_PANEL_VISIBLE,
  STATION_SIGN,
} from './metroCalibration';

const pct = (n: number) => `${n}%`;

interface MetroStationProps {
  numero: string;
  rotulo: string;
  /** Estación con el tren estacionado: luces encendidas y color pleno */
  isActive?: boolean;
  /** Slot para el tren (posicionado con TRAIN_DOCKED dentro de esta caja) */
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Andén voxel. Todo lo que vive dentro usa porcentajes de la caja del PNG y
 * unidades `cqw` (container query width), de modo que letrero, panel, luces,
 * riel y tren escalan de forma idéntica a la referencia en cualquier ancho.
 */
export function MetroStation({
  numero,
  rotulo,
  isActive = false,
  children,
  onClick,
  className,
}: MetroStationProps) {
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Parada ${numero}: ${rotulo}` : undefined}
      className={cn(
        'relative w-full [container-type:inline-size]',
        onClick && 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600 rounded-lg',
        className
      )}
      style={{ aspectRatio: STATION_ASPECT }}
    >
      {/* Sombra de contacto sobre el papel */}
      <div
        aria-hidden
        className="absolute left-[6%] right-[6%] bottom-[2%] h-[6%] rounded-[50%] bg-[#0F1B2D]/10 blur-[1.6cqw]"
      />

      {/* Riel continuo (se extiende hacia el hueco entre estaciones) */}
      <MetroRail />

      {/* Andén */}
      <div
        className={cn(
          'absolute inset-0 z-10 transition-[filter] duration-700',
          isActive ? 'saturate-100' : 'saturate-[0.55] brightness-[1.03]'
        )}
      >
        <Image
          src={METRO_ASSETS.station}
          alt=""
          aria-hidden
          fill
          draggable={false}
          sizes="(min-width: 1024px) 30vw, 85vw"
          className="object-contain select-none pointer-events-none"
        />

        {/* Lámparas del techo: brillo de llegada */}
        {STATION_LIGHTS.map((l, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              'absolute rounded-[0.3cqw] bg-white transition-all duration-700',
              isActive
                ? 'opacity-100 shadow-[0_0.8cqw_3.5cqw_0.6cqw_rgba(167,139,250,0.85)]'
                : 'opacity-0 shadow-none'
            )}
            style={{ left: pct(l.left), top: pct(l.top), width: pct(l.width), height: pct(l.height) }}
          />
        ))}

        {/* Letrero colgante: numeral de parada */}
        <span
          aria-hidden
          className="absolute flex items-center justify-center font-mono font-bold text-white/95 leading-none tracking-[0.18em] text-[1.9cqw]"
          style={{
            left: pct(STATION_SIGN.left),
            top: pct(STATION_SIGN.top),
            width: pct(STATION_SIGN.width),
            height: pct(STATION_SIGN.height),
          }}
        >
          {numero}
        </span>

        {/* Panel blanco: rótulo de la estación (franja visible sobre el tren) */}
        <span
          aria-hidden
          className="absolute flex items-center justify-center font-mono font-bold uppercase leading-none tracking-[0.2em] text-[2.3cqw] text-[#3B2C9E]"
          style={{
            left: pct(STATION_PANEL_VISIBLE.left),
            top: pct(STATION_PANEL_VISIBLE.top),
            width: pct(STATION_PANEL_VISIBLE.width),
            height: pct(STATION_PANEL_VISIBLE.height),
          }}
        >
          {rotulo}
        </span>
      </div>

      {/* Tren (z-20, delante del andén) */}
      {children}
    </div>
  );
}

/** Tramo de vía: barra de rodadura índigo + durmientes, a la altura de las ruedas. */
function MetroRail() {
  return (
    <div
      aria-hidden
      className="absolute -inset-x-3 lg:-inset-x-4 z-[15] pointer-events-none"
      style={{ top: `calc(${RAIL_LINE_TOP}% - 0.4cqw)`, height: '2.4cqw' }}
    >
      {/* Barra de rodadura */}
      <div className="absolute inset-x-0 top-0 h-[0.8cqw] bg-[#2E208F] shadow-[0_0.3cqw_0_0_#1E1466]" />
      {/* Durmientes */}
      <div
        className="absolute inset-x-0 top-[1.1cqw] h-[1.1cqw] opacity-70"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #8C7BEE 0, #8C7BEE 2.4cqw, transparent 2.4cqw, transparent 4.2cqw)',
        }}
      />
    </div>
  );
}
