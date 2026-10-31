/**
 * config/petals.ts — Configuración estática y determinista de pétalos flotantes (Hito H4 - RF-11).
 *
 * Requerimientos:
 *   - 18 pétalos en escritorio (11 a la izquierda, 7 a la derecha).
 *   - 8 pétalos en móvil (filtrados con `desktopOnly: false`).
 *   - Posiciones porcentuales fijas en el lienzo (evita desajustes de hidratación en SSR).
 *   - Tamaños variados (1=chico, 2=mediano, 3=grande) y rotaciones prehorneadas (0=0°, 1=90°, 2=180°, 3=270°).
 *   - Distribución respetando el título "Tu participación hace florecer a México" y el logo del INE.
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
  // ── 11 PÉTALOS A LA IZQUIERDA (Mayor densidad según mockup) ──
  {
    id: 1,
    shape: 2,
    rot: 0,
    x: 4.5,
    y: 8.5,
    floatDistancePx: 8,
    durationSec: 4.2,
    delaySec: 0.2,
    desktopOnly: true,
  },
  {
    id: 2,
    shape: 3,
    rot: 3,
    x: 12.0,
    y: 14.0,
    floatDistancePx: 10,
    durationSec: 4.8,
    delaySec: 0.5,
    desktopOnly: false, // Visible en móvil
  },
  {
    id: 3,
    shape: 1,
    rot: 1,
    x: 18.5,
    y: 22.0,
    floatDistancePx: 6,
    durationSec: 3.6,
    delaySec: 0.1,
    desktopOnly: true,
  },
  {
    id: 4,
    shape: 2,
    rot: 2,
    x: 3.0,
    y: 29.0,
    floatDistancePx: 9,
    durationSec: 5.0,
    delaySec: 0.8,
    desktopOnly: false, // Visible en móvil
  },
  {
    id: 5,
    shape: 2,
    rot: 0,
    x: 8.5,
    y: 42.0,
    floatDistancePx: 11,
    durationSec: 4.5,
    delaySec: 0.4,
    desktopOnly: true,
  },
  {
    id: 6,
    shape: 1,
    rot: 3,
    x: 23.5,
    y: 46.0,
    floatDistancePx: 7,
    durationSec: 3.8,
    delaySec: 0.7,
    desktopOnly: false, // Visible en móvil
  },
  {
    id: 7,
    shape: 3,
    rot: 1,
    x: 2.5,
    y: 58.0,
    floatDistancePx: 12,
    durationSec: 5.4,
    delaySec: 0.3,
    desktopOnly: false, // Visible en móvil
  },
  {
    id: 8,
    shape: 1,
    rot: 2,
    x: 15.0,
    y: 64.0,
    floatDistancePx: 6,
    durationSec: 4.0,
    delaySec: 0.9,
    desktopOnly: true,
  },
  {
    id: 9,
    shape: 2,
    rot: 3,
    x: 5.0,
    y: 78.0,
    floatDistancePx: 9,
    durationSec: 4.6,
    delaySec: 0.2,
    desktopOnly: true,
  },
  {
    id: 10,
    shape: 1,
    rot: 0,
    x: 22.0,
    y: 82.0,
    floatDistancePx: 7,
    durationSec: 3.9,
    delaySec: 0.6,
    desktopOnly: false, // Visible en móvil
  },
  {
    id: 11,
    shape: 2,
    rot: 1,
    x: 10.5,
    y: 91.0,
    floatDistancePx: 8,
    durationSec: 4.4,
    delaySec: 0.1,
    desktopOnly: true,
  },

  // ── 7 PÉTALOS A LA DERECHA (Dispersos alrededor del mapa) ──
  {
    id: 12,
    shape: 2,
    rot: 2,
    x: 78.0,
    y: 6.0,
    floatDistancePx: 8,
    durationSec: 4.2,
    delaySec: 0.3,
    desktopOnly: true,
  },
  {
    id: 13,
    shape: 1,
    rot: 3,
    x: 94.0,
    y: 18.0,
    floatDistancePx: 6,
    durationSec: 3.7,
    delaySec: 0.7,
    desktopOnly: false, // Visible en móvil
  },
  {
    id: 14,
    shape: 3,
    rot: 0,
    x: 82.5,
    y: 28.0,
    floatDistancePx: 10,
    durationSec: 5.1,
    delaySec: 0.4,
    desktopOnly: true,
  },
  {
    id: 15,
    shape: 1,
    rot: 1,
    x: 92.0,
    y: 44.0,
    floatDistancePx: 7,
    durationSec: 4.0,
    delaySec: 0.2,
    desktopOnly: false, // Visible en móvil
  },
  {
    id: 16,
    shape: 2,
    rot: 3,
    x: 85.0,
    y: 62.0,
    floatDistancePx: 9,
    durationSec: 4.7,
    delaySec: 0.8,
    desktopOnly: true,
  },
  {
    id: 17,
    shape: 1,
    rot: 2,
    x: 95.0,
    y: 75.0,
    floatDistancePx: 6,
    durationSec: 3.5,
    delaySec: 0.5,
    desktopOnly: false, // Visible en móvil
  },
  {
    id: 18,
    shape: 2,
    rot: 0,
    x: 88.0,
    y: 89.0,
    floatDistancePx: 9,
    durationSec: 4.3,
    delaySec: 0.1,
    desktopOnly: true,
  },
];
