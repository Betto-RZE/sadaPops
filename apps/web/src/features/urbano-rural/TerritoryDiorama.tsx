'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import type { Zone, ZoneYear } from './constants';
import { ZONE_DATA, ZONE_META } from './constants';

/** Paleta compartida de las secciones 5 y 6: suave, con contraste suficiente para leer datos. */
export const PALETTE = {
  cream: '#FBF6EE',
  paper: '#F6EEE2',
  powder: '#F1D3DE',
  magenta: '#B83A78',
  sage: '#8FA98A',
  lavender: '#CFC3E3',
  slate: '#5E6F8C',
  ink: '#1C2541',
} as const;

export const W = 960;
export const H = 400;
export const GROUND = 330;
/** Recorte del tablero de datos: quita el cielo vacío de arriba. */
const VB_TOP = 46;
const VB_H = H - VB_TOP;
/** Escala única para las tres columnas: 0–100% ocupa 250px de alto. */
const SCALE = 250 / 100;
const COLUMN_X: Record<Zone | 'noUrbana', number> = { urbana: 292, mixta: 486, rural: 700, noUrbana: 593 };

function BallotColumn({ x, value, color, label, reduceMotion }: { x: number; value: number | null; color: string; label: string; reduceMotion: boolean }) {
  const width = 46;
  if (value === null) {
    return (
      <g aria-hidden="true">
        <rect x={x - width / 2} y={GROUND - 64} width={width} height={64} fill="none" stroke={color} strokeWidth="3" strokeDasharray="6 5" />
        <text x={x} y={GROUND - 74} textAnchor="middle" className="text-[13px] font-semibold" fill={color}>s/d</text>
      </g>
    );
  }
  const height = value * SCALE;
  const full = 100 * SCALE;
  const ease = reduceMotion ? 'none' : 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
  const lift = (offset: number) => ({ transform: `translateY(${GROUND - height - offset}px)`, transition: ease });
  return (
    <g aria-hidden="true">
      {/* columna: altura fija escalada desde la base, así la escala es idéntica para todas */}
      <rect x={x - width / 2} y={GROUND - full} width={width} height={full} fill={color} style={{ transformBox: 'fill-box', transformOrigin: 'bottom', transform: `scaleY(${value / 100})`, transition: ease }} />
      <g style={lift(0)}>
        {Array.from({ length: Math.floor(height / 14) }, (_, index) => (
          <rect key={index} x={x - width / 2 + 7} y={8 + index * 14} width={width - 14} height="3" fill="#FFFFFF" opacity="0.45" />
        ))}
      </g>
      {/* tapa de urna y etiqueta */}
      <g style={lift(8)}>
        <rect x={x - width / 2 - 5} y="0" width={width + 10} height="8" fill={PALETTE.ink} />
      </g>
      <g style={lift(46)}>
        <rect x={x - 38} y="0" width="76" height="30" rx="4" fill="#FFFFFF" stroke={color} strokeWidth="2" />
        <text x={x} y="20" textAnchor="middle" className="text-[15px] font-bold tabular-nums" fill={PALETTE.ink}>{value.toFixed(1)}%</text>
      </g>
      <text x={x} y={GROUND + 24} textAnchor="middle" className="text-[13px] font-semibold" fill={color}>{label}</text>
    </g>
  );
}

export function Scenery({ sky = true }: { sky?: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <g shapeRendering="crispEdges" aria-hidden="true">
      {/* cielo y nubes */}
      {sky && <rect width={W} height={GROUND} fill={PALETTE.cream} />}
      <motion.g animate={reduceMotion ? undefined : { x: [0, 26, 0] }} transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}>
        <rect x="120" y="74" width="70" height="12" fill={PALETTE.powder} />
        <rect x="134" y="64" width="36" height="12" fill={PALETTE.powder} />
        <rect x="640" y="90" width="84" height="12" fill="#E9E1F1" />
        <rect x="656" y="80" width="44" height="12" fill="#E9E1F1" />
      </motion.g>
      <rect x="866" y="66" width="30" height="30" fill="#F4DFA8" />

      {/* —— Ciudad —— */}
      {[[8, 120], [70, 176], [128, 140], [186, 200]].map(([x, h]) => <rect key={x} x={x} y={GROUND - h} width="54" height={h} fill="#D9DDE6" />)}
      {[[24, 150, 48], [86, 110, 40], [140, 172, 44], [196, 128, 50]].map(([x, h, w]) => (
        <g key={`b-${x}`}>
          <rect x={x} y={GROUND - h} width={w} height={h} fill="#8D9AB2" />
          {Array.from({ length: Math.floor((h - 20) / 20) }, (_, row) => Array.from({ length: Math.floor((w - 10) / 12) }, (_, col) => (
            <rect key={`${row}-${col}`} x={x + 7 + col * 12} y={GROUND - h + 10 + row * 20} width="6" height="9" fill={(row + col + x) % 4 === 0 ? '#F6E3B4' : '#E6E9F0'} />
          )))}
        </g>
      ))}
      {/* farol */}
      <rect x="242" y={GROUND - 64} width="4" height="64" fill={PALETTE.ink} />
      <rect x="236" y={GROUND - 70} width="16" height="8" fill={PALETTE.ink} />
      <rect x="239" y={GROUND - 62} width="10" height="4" fill="#F6E3B4" />

      {/* —— Zona mixta —— */}
      {[[388, 32], [444, 26], [520, 30]].map(([x, h]) => (
        <g key={`m-${x}`}>
          <rect x={x} y={GROUND - h} width="36" height={h} fill="#F4ECF7" />
          <rect x={x - 4} y={GROUND - h - 10} width="44" height="10" fill="#A796C6" />
          <rect x={x + 14} y={GROUND - 14} width="8" height="14" fill="#8C7A64" />
        </g>
      ))}
      <rect x="430" y={GROUND - 6} width="90" height="6" fill="#C9D8C2" />
      {[0, 1, 2, 3, 4, 5, 6].map((index) => <rect key={`f-${index}`} x={386 + index * 26} y={GROUND - 12} width="3" height="12" fill="#B9A98F" />)}

      {/* —— Campo —— */}
      <rect x="600" y={GROUND - 40} width={W - 600} height="40" fill="#C9D8C2" />
      <rect x="640" y={GROUND - 56} width="180" height="16" fill="#C9D8C2" />
      <rect x="780" y={GROUND - 66} width="180" height="26" fill="#B7CBAE" />
      {[0, 1, 2].map((row) => <rect key={`r-${row}`} x={612 + row * 6} y={GROUND - 30 + row * 9} width={330 - row * 12} height="3" fill="#9DB593" />)}
      {[[790, 46], [902, 40]].map(([x, h]) => (
        <g key={`h-${x}`}>
          <rect x={x} y={GROUND - 66 - h + 20} width="34" height={h - 20} fill="#FBF3E6" />
          <rect x={x - 4} y={GROUND - 66 - h + 10} width="42" height="10" fill="#C98FA6" />
          <rect x={x + 13} y={GROUND - 66 - 12} width="8" height="12" fill="#8C7A64" />
        </g>
      ))}
      {[[760, 34], [866, 28], [940, 36]].map(([x, h]) => (
        <g key={`t-${x}`}>
          <rect x={x} y={GROUND - 66 - h} width="6" height={h} fill="#8C7A64" />
          <rect x={x - 12} y={GROUND - 66 - h - 22} width="30" height="26" fill={PALETTE.sage} />
        </g>
      ))}

      {/* suelo, calle y camino */}
      <rect y={GROUND} width={W} height={H - GROUND} fill="#EFE6D8" />
      <rect y={GROUND} width="380" height="18" fill="#C7CCD6" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => <rect key={`s-${index}`} x={20 + index * 44} y={GROUND + 7} width="22" height="4" fill="#F4F5F8" />)}
      <rect x="380" y={GROUND} width="230" height="18" fill="#DCCFB9" />
      <rect x="610" y={GROUND} width="350" height="18" fill="#D8C7A6" />
      {[0, 1, 2, 3, 4].map((index) => <rect key={`p-${index}`} x={630 + index * 66} y={GROUND + 8} width="10" height="3" fill="#C2AF8B" />)}
    </g>
  );
}

const CHARACTERS: { src: string; left: number; zone: Zone; delay: number; flip?: boolean }[] = [
  { src: '/urbano-rural/avatars/urban-woman.png', left: 52, zone: 'urbana', delay: 0 },
  { src: '/urbano-rural/avatars/urban-man.png', left: 164, zone: 'urbana', delay: 0.6, flip: true },
  { src: '/urbano-rural/avatars/mixed-person.png', left: 389, zone: 'mixta', delay: 1.2 },
  { src: '/urbano-rural/avatars/rural-man.png', left: 750, zone: 'rural', delay: 0.3, flip: true },
  { src: '/urbano-rural/avatars/rural-woman.png', left: 846, zone: 'rural', delay: 0.9 },
];

/** Personajes del proyecto parados sobre el suelo de la escena. `top` y `height` definen el recorte vertical. */
export function Citizens({ top = 0, height = H }: { top?: number; height?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <>
      {CHARACTERS.map((character) => (
        <motion.div
          key={character.src}
          className="pointer-events-none absolute"
          style={{ left: `${(character.left / W) * 100}%`, bottom: `${((top + height - GROUND) / height) * 100 - 1}%`, height: `${(120 / height) * 100}%`, aspectRatio: '2 / 3' }}
          animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: character.delay }}
          aria-hidden="true"
        >
          <Image src={character.src} alt="" fill sizes="90px" className={`object-contain object-bottom [image-rendering:pixelated] ${character.flip ? '-scale-x-100' : ''}`} />
        </motion.div>
      ))}
    </>
  );
}

export function TerritoryDiorama({ year }: { year: ZoneYear }) {
  const reduceMotion = Boolean(useReducedMotion());
  const record = ZONE_DATA[year];
  const showNoUrbana = record.values.mixta === null && record.values.rural === null && record.noUrbana !== null;

  return (
    <div className="relative w-full overflow-x-auto rounded-[20px] [scrollbar-width:thin]">
      <div className="relative min-w-[720px]" style={{ aspectRatio: `${W} / ${VB_H}` }}>
        <svg viewBox={`0 ${VB_TOP} ${W} ${VB_H}`} className="absolute inset-0 h-full w-full" role="img" aria-label={`Ilustración de una ciudad, una zona mixta y una zona rural. Las columnas de boletas muestran la participación de ${year} en la misma escala.`}>
          <Scenery />
          {/* referencias de escala compartida, con fondo para no encimarse con los edificios */}
          {[25, 50, 75].map((tick) => (
            <g key={tick} aria-hidden="true">
              <line x1="52" x2={W} y1={GROUND - tick * SCALE} y2={GROUND - tick * SCALE} stroke={PALETTE.ink} strokeOpacity="0.16" strokeDasharray="4 6" />
              <rect x="6" y={GROUND - tick * SCALE - 10} width="42" height="20" rx="10" fill="#FFFFFF" fillOpacity="0.92" />
              <text x="27" y={GROUND - tick * SCALE + 4} textAnchor="middle" className="text-[11px] font-semibold tabular-nums" fill={PALETTE.ink} fillOpacity="0.7">{tick}%</text>
            </g>
          ))}
          <BallotColumn x={COLUMN_X.urbana} value={record.values.urbana} color={ZONE_META.urbana.color} label="Urbana" reduceMotion={reduceMotion} />
          {showNoUrbana ? (
            <BallotColumn x={COLUMN_X.noUrbana} value={record.noUrbana} color={PALETTE.ink} label="No urbana (mixta + rural)" reduceMotion={reduceMotion} />
          ) : (
            <>
              <BallotColumn x={COLUMN_X.mixta} value={record.values.mixta} color={ZONE_META.mixta.color} label="Mixta" reduceMotion={reduceMotion} />
              <BallotColumn x={COLUMN_X.rural} value={record.values.rural} color={ZONE_META.rural.color} label="Rural" reduceMotion={reduceMotion} />
            </>
          )}
        </svg>
        <Citizens top={VB_TOP} height={VB_H} />
      </div>
    </div>
  );
}
