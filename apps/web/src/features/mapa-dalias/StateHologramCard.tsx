'use client';

/**
 * StateHologramCard — Modal interactivo centrado del estado activo (Fase 2, Hito H5).
 *
 * Características:
 *   1. Presentación Centrada (Modal): Al tocar/hacer clic en un estado, la card
 *      emerge en el centro exacto del viewport con un backdrop que bloquea cualquier
 *      interacción con el fondo hasta cerrarla (cumpliendo accesibilidad y ergonomía táctil).
 *   2. Silueta Voxel 3D (`/data/holo/state-XX.png`) flotando en alta fidelidad sobre
 *      el chasis pixel-art sin distorsión ni escalados anidados.
 *   3. Zero Auto-Scroll: Al montarse vía React Portal en document.body, está totalmente
 *      desacoplada de las coordenadas y matrices de transformación del mapa.
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BarChart } from 'lucide-react';
import { usePixelMapContext } from './PixelMap';
import { useOptionalDahliaStore } from './DahliaStore';
import { DAHLIA_SPRITE_META } from './computeLevels';
import { type StateMetadata, getCommonStateName } from './types';
import { getYouthTurnoutBenchmark } from './data/ineYouthTurnout2024';
import { cn } from '../../shared/utils';

/**
 * Centros ópticos calibrados para siluetas irregulares o asimétricas.
 */
export const OPTICAL_CENTER_OVERRIDES: Record<string, [number, number]> = {
  '02': [0.50, 0.48], // Baja California
  '03': [0.48, 0.50], // Baja California Sur
  '05': [0.50, 0.50], // Coahuila
  '08': [0.50, 0.50], // Chihuahua
  '19': [0.50, 0.50], // Nuevo León
  '21': [0.50, 0.52], // Puebla
  '25': [0.48, 0.48], // Sinaloa
  '26': [0.50, 0.50], // Sonora
  '28': [0.50, 0.50], // Tamaulipas
  '30': [0.50, 0.50], // Veracruz
};

/**
 * Silueta Pixel-Art del chasis exterior (fidelidad 1:1 con mock-card.jpg).
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
          <rect x="4" y="0" width="1" height="1" fill="#FF1493" />
          <rect x="4" y="8" width="1" height="1" fill="#FF1493" />
          <rect x="0" y="4" width="1" height="1" fill="#FF1493" />
          <rect x="8" y="4" width="1" height="1" fill="#FF1493" />
          <rect x="3" y="1" width="3" height="1" fill="#E6007E" />
          <rect x="3" y="7" width="3" height="1" fill="#E6007E" />
          <rect x="1" y="3" width="1" height="3" fill="#E6007E" />
          <rect x="7" y="3" width="1" height="3" fill="#E6007E" />
          <rect x="2" y="2" width="5" height="5" fill="#BA0066" />
          <rect x="3" y="3" width="3" height="3" fill="#FFD700" />
          <rect x="4" y="4" width="1" height="1" fill="#FFFFFF" />
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
 */
function formatStateTitle(stateId: string, displayName: string): StateTitleComposition {
  const norm = displayName.trim().toLowerCase();

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

  const upper = displayName.toUpperCase().trim();
  let sizeClass = 'text-[19px]';
  if (upper.length <= 6) {
    sizeClass = 'text-[21px]';
  } else if (upper.length <= 8) {
    sizeClass = 'text-[18.5px]';
  } else if (upper.length <= 10) {
    sizeClass = 'text-[16.5px]';
  } else {
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
  onClose?: () => void;
  children: React.ReactNode;
}

/**
 * Chasis Voxel 3D con Bisel Escalonado, Canal Hundido y Extrusión Inferior (Fidelidad 1:1 con mock-card.jpg).
 */
function PixelCardChassis({ onClose, children }: PixelCardChassisProps) {
  return (
    <div
      className="relative w-[184px] select-none pointer-events-auto"
      style={{
        filter:
          'drop-shadow(0 20px 40px rgba(10, 6, 32, 0.85)) drop-shadow(0 0 16px rgba(139, 122, 235, 0.35))',
      }}
    >
      {/* Botón táctil accesible de cierre (WCAG 2.1 AA >= 44x44px hit target) */}
      {onClose && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Cerrar tarjeta de información estatal"
          className="absolute -top-2.5 -right-2.5 z-40 flex items-center justify-center w-7 h-7 rounded-full bg-[#1C184A] text-[#AEA3F8] hover:text-white hover:bg-[#342687] border border-[#AEA3F8]/80 shadow-[0_2px_8px_rgba(0,0,0,0.6)] transition-transform active:scale-90 cursor-pointer touch-manipulation after:absolute after:-inset-2 after:content-['']"
        >
          <svg width="10" height="10" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      )}

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
        'group relative w-[94%] max-w-[154px] h-[28px] mt-2 select-none cursor-pointer transition-all active:translate-y-[2px]',
        className
      )}
    >
      {/* CAPA 1: Sombra y Extrusión 3D Inferior en Bloques Voxel (#6B0A42) */}
      <div
        className="absolute inset-0 translate-y-[3.5px] bg-[#6B0A42] transition-all group-active:translate-y-[1px]"
        style={{ clipPath: BUTTON_CLIP_PATH }}
      />

      {/* CAPA 2: Bisel Exterior Rosa Claro (#FF69B4) */}
      <div
        className="relative w-full h-full p-[2px] bg-[#FF69B4] transition-all"
        style={{ clipPath: BUTTON_CLIP_PATH }}
      >
        {/* CAPA 3: Núcleo Magenta INE con Gradiente */}
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

export interface StateHologramCardProps {
  /** Contenido centrado sobre la silueta. Recibe el estado activo. */
  children?: (state: StateMetadata) => React.ReactNode;
  className?: string;
}

export function StateHologramCard({ children, className }: StateHologramCardProps) {
  const { data, selectedStateId, selectState } = usePixelMapContext();
  const dahliaStore = useOptionalDahliaStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || !selectedStateId || !data) {
    return null;
  }

  const state = data.stateById.get(selectedStateId) ?? null;
  if (!state) {
    return null;
  }

  const count = dahliaStore ? dahliaStore.getCount(state.id) : 0;
  const level = dahliaStore ? dahliaStore.getLevel(state.id) : 0;
  const flowerLevel = ((level > 0 ? level : 1) as 1 | 2 | 3 | 4);
  const flowerMeta = DAHLIA_SPRITE_META[flowerLevel];
  const question = count === 0 ? '¿QUIERES SER LA PRIMERA?' : '¿YA ERES PARTE?';
  const displayName = getCommonStateName(state);
  const titleComp = formatStateTitle(state.id, displayName);
  const youthBenchmark = getYouthTurnoutBenchmark(state.id);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Información de participación ciudadana para ${displayName}`}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto select-none',
        className
      )}
    >
      {/* Backdrop: bloquea interacción con todo el mapa/landing y cierra al tocar afuera */}
      <div
        className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => selectState(null)}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => {
          if (e.cancelable) e.preventDefault();
          e.stopPropagation();
        }}
        aria-hidden="true"
      />

      {/* Tarjeta Modal Centrada en Viewport a 60 FPS */}
      <div
        className="relative z-10 flex flex-col items-center justify-center max-w-[90vw] animate-in fade-in zoom-in-95 duration-200 ease-out will-change-transform"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Silueta Voxel 3D ampliada flotando sobre el chasis */}
        <div className="relative mb-2 flex items-center justify-center pointer-events-none select-none">
          <img
            src={`/data/holo/state-${state.id}.png`}
            alt={`Silueta voxel 3D de ${displayName}`}
            className="max-h-[110px] sm:max-h-[135px] w-auto max-w-[220px] object-contain [image-rendering:pixelated] drop-shadow-[0_0_16px_rgba(190,185,255,0.7)] drop-shadow-[0_12px_24px_rgba(10,6,32,0.5)] select-none pointer-events-none"
          />
        </div>

        {/* Chasis Pixel-Art 3D con Fidelidad 1:1 */}
        <PixelCardChassis onClose={() => selectState(null)}>
          {children ? (
            children(state)
          ) : (
            <>
              {/* Línea 1: Título sans-serif en dos niveles (Antetítulo + Título Principal) */}
              {titleComp && (
                <div className="flex flex-col items-center justify-center text-center mt-0.5 select-none leading-none">
                  {titleComp.antetitulo && (
                    <span className="font-heading text-[9.5px] font-semibold text-[#EAE6FF] uppercase tracking-[0.24em] leading-tight select-none mb-0.5">
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
                  <span className="text-[8px] font-medium text-[#EAE6FF] tracking-tight mt-0.5 leading-tight">
                    18–29 años · {youthBenchmark.diffLabel}
                  </span>
                  <span className="text-[7px] font-semibold text-[#C2B9FF] tracking-[0.16em] uppercase mt-0.5 leading-none">
                    · INE ·
                  </span>
                </div>
              )}

              {/* Divisor 1: Línea discontinua con micro-flor pixelada central ✤ */}
              <PixelDivider />

              {/* Bloque Cívico de Plataforma (Dalia Voxel + Cifra 3D Rosa en Matriz) */}
              <div className="flex items-center justify-center gap-2">
                <img
                  src={flowerMeta.src}
                  alt={`Dalia nivel ${flowerLevel} (${flowerMeta.label})`}
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

              <p className="text-[#D5CEFF] text-[7.5px] italic leading-none text-center mt-0.5 drop-shadow">
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
                  selectState(null);
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
    </div>,
    document.body
  );
}

export default StateHologramCard;
