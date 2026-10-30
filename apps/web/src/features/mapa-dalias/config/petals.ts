/**
 * config/petals.ts — Configuración estática y armónica de pétalos en el Hero (Hito H6).
 *
 * 16 pétalos distribuidos en los espacios negativos naturales de la República Mexicana:
 *   - Zona A (Pacífico / Noroeste): 8 pétalos acompañando la diagonal de Baja California/Sinaloa.
 *   - Zona B (Golfo de México / Caribe): 5 pétalos sobre las aguas del Golfo y norte de Yucatán.
 *   - Zona C (Sur del Pacífico): 3 pétalos bajo las costas de Michoacán/Guerrero.
 *
 * Mayoría en tamaños chicos (shape 1) y medianos (shape 2) para ambientar sin competir con las dalias.
 */

export interface PetalConfig {
  id: number;
  shape: 1 | 2 | 3;
  rot: 0 | 1 | 2 | 3;
  /** Posición horizontal relativa al contenedor [0..100%] */
  x: number;
  /** Posición vertical relativa al contenedor [0..100%] */
  y: number;
  /** Amplitud de flotación vertical en px (ej. 6..14) */
  floatDistancePx: number;
  /** Duración del ciclo de flotación en segundos (ej. 3.5..6.0) */
  durationSec: number;
  /** Retardo de animación en segundos */
  delaySec: number;
  /** Si es true, solo se renderiza en viewport >= md (768px) */
  desktopOnly: boolean;
}

export const HERO_PETALS: PetalConfig[] = [
  // ── ZONA A: CORRIENTE PACÍFICO / NOROESTE (8 pétalos en el espacio marino izquierdo) ──
  {
    id: 1,
    shape: 2,
    rot: 1,
    x: 4.5,
    y: 19.0,
    floatDistancePx: 8,
    durationSec: 1.25,
    delaySec: 0.05,
    desktopOnly: true,
  },
  {
    id: 2,
    shape: 1,
    rot: 3,
    x: 10.5,
    y: 26.5,
    floatDistancePx: 6,
    durationSec: 1.35,
    delaySec: 0.12,
    desktopOnly: false, // Visible en móvil
  },
  {
    id: 3,
    shape: 3, // Único grande exterior para enmarcar la esquina
    rot: 0,
    x: 5.5,
    y: 38.0,
    floatDistancePx: 10,
    durationSec: 1.45,
    delaySec: 0.22,
    desktopOnly: true,
  },
  {
    id: 4,
    shape: 1,
    rot: 2,
    x: 15.0,
    y: 45.0,
    floatDistancePx: 6,
    durationSec: 1.20,
    delaySec: 0.18,
    desktopOnly: true,
  },
  {
    id: 5,
    shape: 2,
    rot: 3,
    x: 8.5,
    y: 53.5,
    floatDistancePx: 8,
    durationSec: 1.30,
    delaySec: 0.28,
    desktopOnly: true,
  },
  {
    id: 6,
    shape: 1,
    rot: 0,
    x: 18.5,
    y: 59.0,
    floatDistancePx: 6,
    durationSec: 1.25,
    delaySec: 0.35,
    desktopOnly: true,
  },
  {
    id: 7,
    shape: 2,
    rot: 2,
    x: 7.0,
    y: 68.0,
    floatDistancePx: 8,
    durationSec: 1.40,
    delaySec: 0.40,
    desktopOnly: true,
  },
  {
    id: 8,
    shape: 1,
    rot: 1,
    x: 13.5,
    y: 77.0,
    floatDistancePx: 6,
    durationSec: 1.30,
    delaySec: 0.48,
    desktopOnly: true,
  },

  // ── ZONA B: GOLFO DE MÉXICO Y CARIBE (5 pétalos en el hueco marino oriental) ──
  {
    id: 9,
    shape: 1,
    rot: 3,
    x: 71.0,
    y: 22.0,
    floatDistancePx: 6,
    durationSec: 1.20,
    delaySec: 0.15,
    desktopOnly: false, // Visible en móvil
  },
  {
    id: 10,
    shape: 2,
    rot: 0,
    x: 82.5,
    y: 29.0,
    floatDistancePx: 8,
    durationSec: 1.35,
    delaySec: 0.25,
    desktopOnly: true,
  },
  {
    id: 11,
    shape: 1,
    rot: 1,
    x: 76.0,
    y: 41.5,
    floatDistancePx: 6,
    durationSec: 1.25,
    delaySec: 0.32,
    desktopOnly: true,
  },
  {
    id: 12,
    shape: 2,
    rot: 3,
    x: 86.5,
    y: 48.0,
    floatDistancePx: 8,
    durationSec: 1.40,
    delaySec: 0.42,
    desktopOnly: true,
  },
  {
    id: 13,
    shape: 1,
    rot: 2,
    x: 91.0,
    y: 58.5,
    floatDistancePx: 6,
    durationSec: 1.30,
    delaySec: 0.50,
    desktopOnly: true,
  },

  // ── ZONA C: SUR DEL PACÍFICO (3 pétalos cerrando la diagonal inferior) ──
  {
    id: 14,
    shape: 1,
    rot: 0,
    x: 27.0,
    y: 81.5,
    floatDistancePx: 6,
    durationSec: 1.25,
    delaySec: 0.45,
    desktopOnly: true,
  },
  {
    id: 15,
    shape: 2,
    rot: 1,
    x: 34.5,
    y: 86.0,
    floatDistancePx: 8,
    durationSec: 1.35,
    delaySec: 0.55,
    desktopOnly: false, // Visible en móvil
  },
  {
    id: 16,
    shape: 1,
    rot: 3,
    x: 41.0,
    y: 89.5,
    floatDistancePx: 6,
    durationSec: 1.20,
    delaySec: 0.62,
    desktopOnly: true,
  },
];
