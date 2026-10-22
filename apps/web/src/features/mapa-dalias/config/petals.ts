/**
 * config/petals.ts — Configuración estática de pétalos flotantes en los bordes (Hito H6).
 *
 * Reducidos en cantidad y concentrados en los bordes laterales para evitar competir
 * con el titular asimétrico y el mapa central.
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
  // ── 6 PÉTALOS EN EL BORDE IZQUIERDO (Franja 2%..10%) ──
  {
    id: 1,
    shape: 2,
    rot: 0,
    x: 2.5,
    y: 16.0,
    floatDistancePx: 8,
    durationSec: 4.5,
    delaySec: 0.2,
    desktopOnly: true,
  },
  {
    id: 2,
    shape: 3,
    rot: 3,
    x: 6.5,
    y: 28.0,
    floatDistancePx: 9,
    durationSec: 5.0,
    delaySec: 0.5,
    desktopOnly: false,
  },
  {
    id: 3,
    shape: 1,
    rot: 1,
    x: 3.0,
    y: 44.0,
    floatDistancePx: 6,
    durationSec: 3.8,
    delaySec: 0.1,
    desktopOnly: true,
  },
  {
    id: 4,
    shape: 2,
    rot: 2,
    x: 8.0,
    y: 58.0,
    floatDistancePx: 10,
    durationSec: 4.8,
    delaySec: 0.8,
    desktopOnly: false,
  },
  {
    id: 5,
    shape: 1,
    rot: 3,
    x: 4.0,
    y: 74.0,
    floatDistancePx: 7,
    durationSec: 4.2,
    delaySec: 0.4,
    desktopOnly: true,
  },
  {
    id: 6,
    shape: 2,
    rot: 1,
    x: 7.5,
    y: 88.0,
    floatDistancePx: 8,
    durationSec: 4.6,
    delaySec: 0.7,
    desktopOnly: false,
  },

  // ── 4 PÉTALOS EN EL BORDE DERECHO (Franja 90%..97%) ──
  {
    id: 7,
    shape: 1,
    rot: 3,
    x: 94.0,
    y: 22.0,
    floatDistancePx: 6,
    durationSec: 3.9,
    delaySec: 0.7,
    desktopOnly: false,
  },
  {
    id: 8,
    shape: 2,
    rot: 0,
    x: 91.5,
    y: 42.0,
    floatDistancePx: 9,
    durationSec: 4.9,
    delaySec: 0.4,
    desktopOnly: true,
  },
  {
    id: 9,
    shape: 1,
    rot: 2,
    x: 95.5,
    y: 66.0,
    floatDistancePx: 7,
    durationSec: 4.0,
    delaySec: 0.2,
    desktopOnly: false,
  },
  {
    id: 10,
    shape: 2,
    rot: 1,
    x: 92.0,
    y: 85.0,
    floatDistancePx: 8,
    durationSec: 4.4,
    delaySec: 0.5,
    desktopOnly: true,
  },
];
