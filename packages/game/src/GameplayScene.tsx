import React, { useState, useEffect, useRef } from "react";
import { PixelSpeechBubble, DialogueLine } from "./PixelSpeechBubble";

/**
 * GameplayScene
 * Contiene TODO el juego (estado, bucle de movimiento, minijuego, dialogos y render).
 * - Solo se monta cuando el jugador presiona "JUGAR" (se carga en un chunk aparte via React.lazy).
 * - Al regresar al menu se DESMONTA por completo: se cancelan el requestAnimationFrame,
 *   los listeners de teclado, los timers y se liberan las imagenes precargadas.
 * - Cada vez que se vuelve a montar arranca desde cero (sin estado residual).
 */

import {
  setChapterHandoff,
  CAP1_OUTRO_CAP2_INTRO_MESSAGES_ES,
  CAP1_OUTRO_CAP2_INTRO_MESSAGES_NAH,
} from "./features/capitulos/chapterHandoff";
import {
  AnimatedPlayerSprite,
  releasePlayerImages,
  preloadPlayerFolder,
  PLAYER_FRAME_COUNTS,
} from "./AnimatedPlayerSprite";
import { CastShadow, DECORATION_SHADOWS } from "./features/sombras";
import { PlazaAmbience } from "./features/ambientacion";

// Centralized Plaza Collision Bounds (Edit these 9 numbers to dynamically adjust boundaries in real-time!)
export const PLAZA_BOUNDS = {
  topLeftX: 14, // Top-Left boundary % (at minY = 30%)
  bottomLeftX: 2, // Bottom-Left boundary % (at maxY = 93%)
  topRightX: 87, // Top-Right boundary % (at minY = 30%)
  bottomRightX: 98, // Bottom-Right boundary % (at maxY = 93%)
  minY: 30, // Top boundary %
  maxY: 93, // Bottom boundary %

  // Right Side Path Opening Parameters:
  rightPathTopY: 52, // Top Y% where the right path starts
  rightPathBottomY: 71, // Bottom Y% where the right path ends
  rightPathMaxX: 100, // Max X% inside the right path (walkable opening)
};

// Ubicación configurable de la caja de suministros en la explanada (%)
export const INITIAL_BOX_POSITION = {
  x: 20, // Horizontal: 20% (esquina superior izquierda, separada del borde diagonal)
  y: 45, // Vertical: 45% (esquina superior, separada del borde superior)
};

// Tamaño y dimensiones visuales de las mamparas electorales (%)
export const CASILLA_WIDTH = "8.5%";

// Tamaño fijo y uniforme del icono de exclamación (destacado y nítido para todos los objetos)
export const EXCLAMATION_ICON_WIDTH = "clamp(16px, 1.8cqw, 36px)";

// COORDENADAS CONFIGURABLES DE LAS 5 MAMPARAS ELECTORALES (Edita aquí manualmente cada una):
export const CASILLA_POSITIONS = [
  { x: 32.0, y: 36.0 }, // Mampara 1
  { x: 42.0, y: 36.0 }, // Mampara 2
  { x: 52.0, y: 36.0 }, // Mampara 3
  { x: 62.0, y: 36.0 }, // Mampara 4
  { x: 72.0, y: 36.0 }, // Mampara 5
];
export const CASILLAS_ROW = CASILLA_POSITIONS;

// COORDENADAS CONFIGURABLES DE LA MESA DE VOTACIÓN (Edita aquí manualmente):
export const MESA_POSITION = { x: 19.0, y: 74.0 };
export const MESA_WIDTH = "8.9%";

// COORDENADAS CONFIGURABLES DE LAS 4 DECORACIONES (Edita aquí manualmente cada una):
export const DECORACIONES_POSITIONS = {
  cartel1: { x: 95.5, y: 50.0 }, // Cartel 1 (Mampara informativa frontal)
  cartel2: { x: 93.0, y: 91.5 }, // Cartel 2 (Mampara informativa de perfil)
  folleto: { x: 7.2, y: 31.0 }, // Folleto Cívico
  cartel3: { x: 71.8, y: 99.0 }, // Cartel 3 / Letrero de Madera "VOTA"
};

// TAMAÑOS CONFIGURABLES DE LAS 4 DECORACIONES (Edita aquí el ancho '%' de cada una):
export const DECORACIONES_SIZES = {
  cartel1: "6.2%", // Cartel 1 frontal
  cartel2: "6.5%", // Cartel 2 de perfil
  folleto: "2.8%", // Folleto Cívico
  cartel3: "6.2%", // Cartel 3 / Letrero de Madera "VOTA"
};

export const DECORACIONES_LIST = [
  {
    id: "cartel-1",
    key: "cartel1" as const,
    name: "Cartel Informativo 1",
    sprite: "/assets/juego/cartel-1.png",
    width: DECORACIONES_SIZES.cartel1,
  },
  {
    id: "cartel-2",
    key: "cartel2" as const,
    name: "Cartel Informativo 2",
    sprite: "/assets/juego/cartel-2.png",
    width: DECORACIONES_SIZES.cartel2,
  },
  {
    id: "folleto",
    key: "folleto" as const,
    name: "Folleto Cívico",
    sprite: "/assets/juego/folleto.png",
    width: DECORACIONES_SIZES.folleto,
  },
  {
    id: "cartel-3",
    key: "cartel3" as const,
    name: "Letrero de Votación",
    sprite: "/assets/juego/cartel-3.png",
    width: DECORACIONES_SIZES.cartel3,
  },
];

// TAMAÑOS CONFIGURABLES DE LAS 5 BOLETAS ELECTORALES (Edita aquí el ancho '%' de cada una):
export const BOLETA_WIDTH = "2.8%";
export const BOLETAS_SIZES = [
  "2.8%", // Boleta en Mampara 1
  "2.8%", // Boleta en Mampara 2
  "2.8%", // Boleta en Mampara 3
  "2.8%", // Boleta en Mampara 4
  "2.8%", // Boleta en Mampara 5
];

// COORDENADAS CONFIGURABLES DE LAS 5 BOLETAS (Sobre la mesa de cada mampara, edita aquí manualmente):
export const BOLETAS_POSITIONS = [
  { x: 32.0, y: 27.5 }, // Boleta en Mampara 1
  { x: 42.0, y: 27.5 }, // Boleta en Mampara 2
  { x: 52.0, y: 27.5 }, // Boleta en Mampara 3
  { x: 62.0, y: 27.5 }, // Boleta en Mampara 4
  { x: 72.0, y: 27.5 }, // Boleta en Mampara 5
];

// Ubicaciones configurables donde se colocarán los objetos en la explanada (%)
export const PLACEMENT_SPOTS = {
  casillas: CASILLA_POSITIONS[0], // Primera mampara electoral
  mesa: MESA_POSITION, // Mesa directiva de casilla (zona izquierda X:19, Y:74)
  deco: DECORACIONES_POSITIONS.cartel1, // Primera decoración (Cartel 1)
  boletas: BOLETAS_POSITIONS[0], // Primera boleta electoral
};

// COORDENADAS ESTRATÉGICAS DE LOS ICONOS DE EXCLAMACIÓN (!)
// Posicionados exactamente en el centro o área visible donde va cada objeto/interacción
export const EXCLAMATION_ICON_POSITIONS = {
  caja: { x: 19.5, y: 37.0 }, // 0.5 hacia la izquierda (20.0 -> 19.5) y 1.5 hacia arriba (38.5 -> 37.0)
  casillas: [
    { x: 32.0, y: 29.0 }, // Mampara 1 (2 puntos más arriba)
    { x: 42.0, y: 29.0 }, // Mampara 2 (2 puntos más arriba)
    { x: 52.0, y: 29.0 }, // Mampara 3 (2 puntos más arriba)
    { x: 62.0, y: 29.0 }, // Mampara 4 (2 puntos más arriba)
    { x: 72.0, y: 29.0 }, // Mampara 5 (2 puntos más arriba)
  ],
  mesa: { x: 19.0, y: 65.0 }, // Centro visible de la mesa de votación
  mesaFinal: { x: 15.0, y: 58.0 },
  decos: {
    cartel1: { x: 95.0, y: 45.0 }, // Cartel 1 frontal (entrada derecha)
    cartel2: { x: 91.5, y: 84.0 }, // Cartel 2 (elevado sobre los arbustos para máxima visibilidad)
    folleto: { x: 7.2, y: 28.5 }, // Folleto Cívico (centrado sobre la posición del sprite)
    cartel3: { x: 71.8, y: 90.0 }, // Cartel 3 / Letrero VOTA (dentro del encuadre visual de la explanada)
  },
  boletas: [
    { x: 32.0, y: 25.0 }, // Boleta sobre mesa de Mampara 1
    { x: 42.0, y: 25.0 }, // Boleta sobre mesa de Mampara 2
    { x: 52.0, y: 25.0 }, // Boleta sobre mesa de Mampara 3
    { x: 62.0, y: 25.0 }, // Boleta sobre mesa de Mampara 4
    { x: 72.0, y: 25.0 }, // Boleta sobre mesa de Mampara 5
  ],
};

export interface Point2D {
  x: number;
  y: number;
}

export interface ObstacleBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface ObstaclesConfig {
  mamparas: ObstacleBox[];
  mesa: Point2D[];
  caja: Point2D[];
  cartel2: ObstacleBox;
}

// CAJAS DE COLISIÓN DE OBJETOS (%) CALIBRADAS
// (Sin colisión: boletas, folleto, cartel-1 y cartel-3)
export const OBJECT_COLLISION_BOXES: ObstaclesConfig = {
  mamparas: [
    { minX: 26.0, maxX: 38.0, minY: 32.5, maxY: 36.0 }, // Mampara 1
    { minX: 35.5, maxX: 48.5, minY: 32.5, maxY: 36.0 }, // Mampara 2
    { minX: 45.5, maxX: 58.5, minY: 32.5, maxY: 36.0 }, // Mampara 3
    { minX: 55.5, maxX: 68.5, minY: 32.5, maxY: 36.0 }, // Mampara 4
    { minX: 66.0, maxX: 78.0, minY: 32.5, maxY: 36.0 }, // Mampara 5
  ],
  mesa: [
    { x: 16.8, y: 56.0 }, // Vértice 1
    { x: 25.4, y: 56.4 }, // Vértice 2
    { x: 22.2, y: 75.5 }, // Vértice 3
    { x: 12.4, y: 76.6 }, // Vértice 4
  ],
  caja: [
    { x: 19.8, y: 38.4 }, // Vértice 1
    { x: 25.4, y: 42.0 }, // Vértice 2
    { x: 20.5, y: 46.5 }, // Vértice 3
    { x: 14.8, y: 42.6 }, // Vértice 4
  ],
  cartel2: {
    minX: 88.0,
    maxX: 100.0,
    minY: 80.5,
    maxY: 93.0,
  },
};

export const isInsideBox = (
  x: number,
  y: number,
  box: ObstacleBox,
): boolean => {
  return x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY;
};

export const isInsidePolygon = (
  x: number,
  y: number,
  polygon: Point2D[],
): boolean => {
  if (!polygon || polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// Diagonal Wall Sliding helper for polygon obstacles (caja & mesa)
export const tryPolygonWallSlide = (
  currentPos: Point2D,
  dx: number,
  dy: number,
  polygon: Point2D[],
  isWalkable: (x: number, y: number) => boolean,
): Point2D | null => {
  if (!polygon || polygon.length < 3) return null;

  const targetX = currentPos.x + dx;
  const targetY = currentPos.y + dy;
  const moveMag = Math.hypot(dx, dy);
  if (moveMag < 0.0001) return null;

  const cx = polygon.reduce((acc, p) => acc + p.x, 0) / polygon.length;
  const cy = polygon.reduce((acc, p) => acc + p.y, 0) / polygon.length;

  let closestEdge: { a: Point2D; b: Point2D; distSq: number } | null = null;

  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];

    const len2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
    if (len2 === 0) continue;

    let t =
      ((targetX - a.x) * (b.x - a.x) + (targetY - a.y) * (b.y - a.y)) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + t * (b.x - a.x);
    const py = a.y + t * (b.y - a.y);
    const distSq = (targetX - px) ** 2 + (targetY - py) ** 2;

    if (!closestEdge || distSq < closestEdge.distSq) {
      closestEdge = { a, b, distSq };
    }
  }

  if (!closestEdge || closestEdge.distSq > 2.5) {
    return null;
  }

  const { a, b } = closestEdge;
  const edx = b.x - a.x;
  const edy = b.y - a.y;
  const edgeLen = Math.hypot(edx, edy);
  if (edgeLen === 0) return null;

  const tx = edx / edgeLen;
  const ty = edy / edgeLen;

  let nx = -ty;
  let ny = tx;
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  if (
    Math.hypot(midX + nx - cx, midY + ny - cy) <
    Math.hypot(midX - nx - cx, midY - ny - cy)
  ) {
    nx = -nx;
    ny = -ny;
  }

  const dot = dx * tx + dy * ty;

  let slideDir = 0;
  if (Math.abs(dot) > 0.05) {
    slideDir = Math.sign(dot);
  } else {
    const distA = Math.hypot(currentPos.x - a.x, currentPos.y - a.y);
    const distB = Math.hypot(currentPos.x - b.x, currentPos.y - b.y);
    slideDir = distA < distB ? -1 : 1;
  }

  const slideSpeed = Math.max(Math.abs(dot), moveMag * 0.85) * slideDir;
  const stepX = tx * slideSpeed;
  const stepY = ty * slideSpeed;

  const candidates = [
    {
      x: currentPos.x + stepX + nx * 0.1,
      y: currentPos.y + stepY + ny * 0.1,
    },
    { x: currentPos.x + stepX, y: currentPos.y + stepY },
    {
      x: currentPos.x + stepX * 0.6 + nx * 0.1,
      y: currentPos.y + stepY * 0.6 + ny * 0.1,
    },
    { x: currentPos.x + stepX * 0.6, y: currentPos.y + stepY * 0.6 },
  ];

  for (const cand of candidates) {
    if (isWalkable(cand.x, cand.y)) {
      return cand;
    }
  }

  return null;
};

// Sistema de Despenetración: si el personaje queda dentro de un obstáculo al colocarlo, calcula el vector de empuje a una zona segura
const getSafePushVector = (
  pos: Point2D,
  obs: ObstaclesConfig,
  phase: string,
  placedCasillas: number[],
  placedDecos: string[],
  isWalkable: (x: number, y: number) => boolean,
): { vx: number; vy: number } | null => {
  // 1. Verificar si está dentro de alguna mampara activa
  const areCasillasPlacedInCurrentPhase =
    phase !== "phase_0_ready" && phase !== "phase_1_casillas";

  if (Array.isArray(obs.mamparas)) {
    for (let i = 0; i < obs.mamparas.length; i++) {
      const isThisMamparaPlaced =
        areCasillasPlacedInCurrentPhase || placedCasillas.includes(i);
      const box = obs.mamparas[i];
      if (isThisMamparaPlaced && box && isInsideBox(pos.x, pos.y, box)) {
        // Encontrar la dirección de empuje más rápida y segura para salir del rectángulo
        const exits = [
          // Abajo (frente de la mampara, hacia la explanada abierta - altamente preferida)
          { vx: 0, vy: 1, dist: box.maxY - pos.y + 0.6 },
          // Izquierda
          { vx: -1, vy: 0, dist: pos.x - box.minX + 0.6 },
          // Derecha
          { vx: 1, vy: 0, dist: box.maxX - pos.x + 0.6 },
          // Arriba (detrás de la mampara)
          { vx: 0, vy: -1, dist: pos.y - box.minY + 0.6 },
        ];

        // Ordenar por distancia de salida, priorizando abajo si las distancias son comparables
        exits.sort((a, b) => {
          const distA = a.vy === 1 ? a.dist * 0.75 : a.dist;
          const distB = b.vy === 1 ? b.dist * 0.75 : b.dist;
          return distA - distB;
        });

        for (const exit of exits) {
          const testX = pos.x + exit.vx * exit.dist;
          const testY = pos.y + exit.vy * exit.dist;
          if (isWalkable(testX, testY)) {
            return { vx: exit.vx, vy: exit.vy };
          }
        }
        // Fallback: empujar hacia abajo hacia la explanada
        return { vx: 0, vy: 1 };
      }
    }
  }

  // 2. Verificar si está dentro del polígono de la mesa directiva
  const isMesaPresent =
    phase !== "phase_0_ready" &&
    phase !== "phase_1_casillas" &&
    phase !== "phase_1_done" &&
    phase !== "phase_2_mesa";

  if (isMesaPresent && Array.isArray(obs.mesa) && obs.mesa.length >= 3) {
    if (isInsidePolygon(pos.x, pos.y, obs.mesa)) {
      const poly = obs.mesa;
      const cx = poly.reduce((acc, p) => acc + p.x, 0) / poly.length;
      const cy = poly.reduce((acc, p) => acc + p.y, 0) / poly.length;

      let bestNormal: { vx: number; vy: number; dist: number } | null = null;

      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        const edx = b.x - a.x;
        const edy = b.y - a.y;
        const len = Math.hypot(edx, edy);
        if (len === 0) continue;

        // Normal exterior unitaria
        let nx = -edy / len;
        let ny = edx / len;
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        if (
          Math.hypot(midX + nx - cx, midY + ny - cy) <
          Math.hypot(midX - nx - cx, midY - ny - cy)
        ) {
          nx = -nx;
          ny = -ny;
        }

        // Distancia del punto a la arista
        let t = ((pos.x - a.x) * edx + (pos.y - a.y) * edy) / (len * len);
        t = Math.max(0, Math.min(1, t));
        const px = a.x + t * edx;
        const py = a.y + t * edy;
        const dist = Math.hypot(pos.x - px, pos.y - py);

        // Probar si el punto al salir por esta normal es caminable
        const testX = px + nx * 1.0;
        const testY = py + ny * 1.0;
        if (isWalkable(testX, testY)) {
          if (!bestNormal || dist < bestNormal.dist) {
            bestNormal = { vx: nx, vy: ny, dist };
          }
        }
      }

      if (bestNormal) {
        return { vx: bestNormal.vx, vy: bestNormal.vy };
      }
      // Fallback: empujar alejándose del centro del polígono
      const fromCenterX = pos.x - cx;
      const fromCenterY = pos.y - cy;
      const centerDist = Math.hypot(fromCenterX, fromCenterY) || 1;
      return { vx: fromCenterX / centerDist, vy: fromCenterY / centerDist };
    }
  }

  // 3. Verificar si está dentro del Cartel 2
  const isCartel2Present =
    phase === "phase_3_done" ||
    phase === "phase_4_boletas" ||
    phase === "phase_4_done" ||
    phase === "phase_complete"
      ? true
      : placedDecos.includes("cartel2");

  if (
    isCartel2Present &&
    obs.cartel2 &&
    isInsideBox(pos.x, pos.y, obs.cartel2)
  ) {
    const box = obs.cartel2;
    const exits = [
      // Izquierda (hacia la explanada central)
      { vx: -1, vy: 0, dist: pos.x - box.minX + 0.6 },
      // Arriba
      { vx: 0, vy: -1, dist: pos.y - box.minY + 0.6 },
      // Abajo
      { vx: 0, vy: 1, dist: box.maxY - pos.y + 0.6 },
      // Derecha
      { vx: 1, vy: 0, dist: box.maxX - pos.x + 0.6 },
    ];
    for (const exit of exits) {
      const testX = pos.x + exit.vx * exit.dist;
      const testY = Math.min(
        PLAZA_BOUNDS.maxY - 0.5,
        Math.max(PLAZA_BOUNDS.minY + 0.5, pos.y + exit.vy * exit.dist),
      );
      if (isWalkable(testX, testY)) {
        return { vx: exit.vx, vy: exit.vy };
      }
    }
    return { vx: -1, vy: 0 };
  }

  // 4. Verificar si está dentro de la Caja de Suministros (polígono)
  if (
    phase !== "phase_complete" &&
    Array.isArray(obs.caja) &&
    obs.caja.length >= 3
  ) {
    if (isInsidePolygon(pos.x, pos.y, obs.caja)) {
      const poly = obs.caja;
      const cx = poly.reduce((acc, p) => acc + p.x, 0) / poly.length;
      const cy = poly.reduce((acc, p) => acc + p.y, 0) / poly.length;

      let bestNormal: { vx: number; vy: number; dist: number } | null = null;
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        const edx = b.x - a.x;
        const edy = b.y - a.y;
        const len = Math.hypot(edx, edy);
        if (len === 0) continue;

        let nx = -edy / len;
        let ny = edx / len;
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        if (
          Math.hypot(midX + nx - cx, midY + ny - cy) <
          Math.hypot(midX - nx - cx, midY - ny - cy)
        ) {
          nx = -nx;
          ny = -ny;
        }

        let t = ((pos.x - a.x) * edx + (pos.y - a.y) * edy) / (len * len);
        t = Math.max(0, Math.min(1, t));
        const px = a.x + t * edx;
        const py = a.y + t * edy;
        const dist = Math.hypot(pos.x - px, pos.y - py);

        const testX = px + nx * 1.0;
        const testY = py + ny * 1.0;
        if (isWalkable(testX, testY)) {
          if (!bestNormal || dist < bestNormal.dist) {
            bestNormal = { vx: nx, vy: ny, dist };
          }
        }
      }

      if (bestNormal) {
        return { vx: bestNormal.vx, vy: bestNormal.vy };
      }
      const fromCenterX = pos.x - cx;
      const fromCenterY = pos.y - cy;
      const centerDist = Math.hypot(fromCenterX, fromCenterY) || 1;
      return { vx: fromCenterX / centerDist, vy: fromCenterY / centerDist };
    }
  }

  return null;
};

export const getLeftBoundaryX = (y: number): number => {
  if (PLAZA_BOUNDS.maxY === PLAZA_BOUNDS.minY) return PLAZA_BOUNDS.topLeftX;
  const progress = Math.min(
    1,
    Math.max(
      0,
      (y - PLAZA_BOUNDS.minY) / (PLAZA_BOUNDS.maxY - PLAZA_BOUNDS.minY),
    ),
  );
  return (
    PLAZA_BOUNDS.topLeftX +
    progress * (PLAZA_BOUNDS.bottomLeftX - PLAZA_BOUNDS.topLeftX)
  );
};

// Returns standard diagonal right boundary % at vertical position y
export const getBaseRightBoundaryX = (y: number): number => {
  if (PLAZA_BOUNDS.maxY === PLAZA_BOUNDS.minY) return PLAZA_BOUNDS.topRightX;
  const progress = Math.min(
    1,
    Math.max(
      0,
      (y - PLAZA_BOUNDS.minY) / (PLAZA_BOUNDS.maxY - PLAZA_BOUNDS.minY),
    ),
  );
  return (
    PLAZA_BOUNDS.topRightX +
    progress * (PLAZA_BOUNDS.bottomRightX - PLAZA_BOUNDS.topRightX)
  );
};

// Returns dynamic right boundary % at vertical position y (splits into upper/lower boxes with side path opening)
export const getRightBoundaryX = (y: number): number => {
  if (y >= PLAZA_BOUNDS.rightPathTopY && y <= PLAZA_BOUNDS.rightPathBottomY) {
    return PLAZA_BOUNDS.rightPathMaxX;
  }
  return getBaseRightBoundaryX(y);
};

// Stable constants for intro dialogue sequence (prevents re-render resets on fullscreen toggle)
const INTRO_MESSAGES_ES: string[] = [
  "¡Hola, hola! ¡Qué gusto verte por aquí! Mi nombre es Inecito y hoy nos espera un día muy especial.",
  "¡Hoy es día de elecciones! Miles de personas saldrán a votar para elegir a quienes las representarán y tomarán decisiones importantes para nuestro país.",
  "Y nosotros tenemos una misión muy importante: ¡seremos funcionarios de casilla!",
  "¿Sabías que los funcionarios de casilla son ciudadanos que ayudan a recibir, contar y registrar los votos durante las elecciones?",
  "¡Así es! Nuestra tarea es ayudar a que la jornada electoral se desarrolle de manera ordenada, transparente y respetando el voto de cada persona.",
  "Pero antes de recibir a nuestros primeros votantes, tenemos que asegurarnos de que todo esté en su lugar.",
  "Si trabajamos juntos, terminaremos en un abrir y cerrar de ojos.",
  "¿Estás listo? ¡Pues manos a la obra!",
];

const INTRO_MESSAGES_NAH: string[] = [
  "¡Niltze, niltze! ¡Kualtsin nimitsita nikan! Notoka Inecito wan axkan tiktlakitiseh se tonal tekitik.",
  "¡Axkan tonal tlaixquetzalistli! Miakeh tlacameh kisaskeh ma tlateneuakan pampa kitlapejpeniskeh akin kintekitiliskeh wan kitlaliseh tekitl ipan totlaltikpak.",
  "Wan tehwanten tikpiyah se ueyi tekitl: ¡tiyeskeh tekitkeh casilla!",
  "¿Tikmatia tlacameh tekitkeh casilla in altepetlacameh akin tlaikneliah kiseliah, kipouah wan kitlaliah in votos ipan tlaixquetzalistli?",
  "¡Kemah! Totekiu tlaiknelis ma mopano in tonal tlaixquetzalistli ika tlamatilis, chipauak wan tlatlakitilis in ivoto sesen tlacatl.",
  "Tel achto xikselikan tochantlakahuan, moneki tikchiuaskeh nochitlamantli ma yeto ipan ikuakualkan.",
  "Tla titekitih sansehkan, titlankeh niman niman.",
  "¿Tiyejtok? ¡Ma titekitikan!",
];

// Diálogos educativos al completar la colocación de todas las mamparas
const MAMPARAS_MESSAGES_ES: string[] = [
  "¡Excelente! Estas son las mamparas electorales, y tienen una función muy importante.",
  "Permiten que cada persona marque su boleta en privado, sin que nadie pueda ver por quién está votando.",
  "Recuerda que en México el voto es libre y secreto. ¡Nadie puede obligarte a revelar tu elección!",
];

const MAMPARAS_MESSAGES_NAH: string[] = [
  "¡Kualtsin tekitl! Inihkeh in mamparas electorales, wan kipiyah se ueyi tekitl.",
  "Kikahuah ma sesen tlacatl kitlali ivoto ichtaka, ayac huelis kitas akinon kitlapejpenia.",
  "Xikilnamiki ipan Mexico in voto tlatitlantli wan ichtaka. ¡Ayac huelis mitschiualtis ma tiquihto motlapejpenalis!",
];

// Diálogos educativos al colocar la mesa directiva de casilla
const MESA_MESSAGES_ES: string[] = [
  "¡Perfecto! Esta mesa será nuestro centro de operaciones durante la jornada electoral.",
  "Aquí los funcionarios revisan la Credencial para Votar, verifican que las personas estén en la Lista Nominal y les entregan sus boletas.",
  "También se encargan de contar los votos al finalizar la votación y registrar los resultados.",
  "¡Por eso es tan importante nuestro trabajo!",
];

const MESA_MESSAGES_NAH: string[] = [
  "¡Kualtsin! Inin mesa yeski totlalnamikilis wan totekiyotl ipan tonal tlaixquetzalistli.",
  "Nikan tekitkeh casilla kitah in Credencial para Votar, kitah ma yetokan ipan Lista Nominal wan kinmakah iminboletas.",
  "Noihki kipouah in votos kuak tlami in tlaixquetzalistli wan kitlaliah in tlateneualistli.",
  "¡Ika inin ueyi totekiu!",
];

// Diálogos educativos al colocar todas las decoraciones y carteles
const DECORACIONES_MESSAGES_ES: string[] = [
  "¡Wow! ¡Ahora sí que se ve mucho mejor!",
  "Los letreros y señalamientos ayudan a identificar la casilla y orientan a las personas durante la votación.",
  "También permiten mostrar información importante, como la identificación de la casilla y las indicaciones para los votantes.",
  "¡Una buena organización ayuda a que todos sepan a dónde dirigirse!",
  "¡Ya casi terminamos! Solo nos falta preparar uno de los materiales más importantes de toda la elección.",
  "¡Las boletas electorales! Vamos a colocarlas cuidadosamente sobre la mesa.",
];

const DECORACIONES_MESSAGES_NAH: string[] = [
  "¡Kualtsin! ¡Axkan nelkualtsin moitta!",
  "In tlaixkopinketl wan tlahtolmachiyotl tlaikneliah ma kixmatikan in casilla wan kinyakan in tlacameh kuak tlateneuah.",
  "Noihki kinextiah ueyi tlamatilis, kenin itoka in casilla wan tlen moneki kichiuaskeh in tlacameh.",
  "¡Se kualtsin tekiyotl tlaiknelia nochimeh ma kimatikan kanin yaskeh!",
  "¡Achitsin polihui titlankeh! San moneki tikyektlaliseh se ueyi tlamantli ipan tlaixquetzalistli.",
  "¡In boletas electorales! Ma tiktlalikan kualtsin ipan in mesa.",
];

// Diálogos educativos al colocar las boletas electorales
const BOLETAS_MESSAGES_ES: string[] = [
  "¡Excelente trabajo! Estas son las boletas electorales.",
  "En ellas aparecen las opciones por las que podemos votar, como partidos políticos y candidaturas, dependiendo del tipo de elección.",
  "Cada votante recibe las boletas que le corresponden y marca su elección en secreto.",
  "Después, las deposita en las urnas para que sean contadas al finalizar la votación.",
  "¡Y algo muy importante! Las boletas deben mantenerse bajo el cuidado de los funcionarios para proteger la integridad de la elección.",
];

const BOLETAS_MESSAGES_NAH: string[] = [
  "¡Kualtsin tekitl! Inihkeh in boletas electorales.",
  "Ipan yehuan monextiah kanin uelis titlateneuaskeh, ken partidos políticos wan candidaturas.",
  "Sesen tlacatl kiselia iboletas wan kimachiyotia itlapejpenalis ichtaka.",
  "Satepan, kitlalia ipan in urnas pampa mopouaskeh kuak tlami in tlaixquetzalistli.",
  "¡Wan se tlamantli ueyi! In boletas moneki kipiaskeh in tekitkeh casilla pampa kiyektlaliseh in tlaixquetzalistli.",
];

// Diálogos de cierre del Capítulo 1 al interactuar con la mesa de funcionarios
// (sirven de puente narrativo hacia el Capítulo 2)
const CIERRE_CAPITULO_MESSAGES_ES: string[] =
  CAP1_OUTRO_CAP2_INTRO_MESSAGES_ES as unknown as string[];

const CIERRE_CAPITULO_MESSAGES_NAH: string[] =
  CAP1_OUTRO_CAP2_INTRO_MESSAGES_NAH as unknown as string[];

export interface GameplaySceneProps {
  language?: "es" | "nah";
  stageImageUrl: string;
  isFullscreen: boolean;
  /** true mientras la transicion de iris esta en curso (el dialogo espera a que termine) */
  isTransitioning: boolean;
  /** true mientras el modal de salida esta abierto (congela movimiento y dialogo) */
  isPaused: boolean;
  /** Solicita salir al menu principal (abre el modal de confirmacion) */
  onRequestExit: () => void;
  /**
   * Capitulo 1 completado: boletas colocadas y dialogo final cerrado.
   * Se llama UNA sola vez; la modalidad (FULL_GAME / SINGLE_CHAPTER) la resuelve PixiGameCanvas.
   */
  onChapterComplete?: () => void;
}

export default function GameplayScene({
  language = "es",
  stageImageUrl,
  isFullscreen,
  isTransitioning,
  isPaused,
  onRequestExit,
  onChapterComplete,
}: GameplaySceneProps) {
  // Player Position & Direction State ("1"=S/down, "2"=A/left, "3"=W/up, "4"=D/right)
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 62 });
  const [lastDirection, setLastDirection] = useState<"1" | "2" | "3" | "4">(
    "1",
  );
  const [isWalking, setIsWalking] = useState(false);

  // Dynamic Dialogue Queue for plaza and NPC interactions
  const [activeDialogue, setActiveDialogue] = useState<Array<
    DialogueLine | string
  > | null>(null);

  // Minijuego: Caja de suministros y recolección de objetos
  const [boxPos, setBoxPos] = useState(INITIAL_BOX_POSITION);
  const [boxStage, setBoxStage] = useState<number>(1); // 1 = llena, 2 = sin casillas, 3 = sin mesa, 4 = sin decorativos, 5 = vacía
  const [minigamePhase, setMinigamePhase] = useState<
    | "phase_0_ready"
    | "phase_1_casillas"
    | "phase_1_done"
    | "phase_2_mesa"
    | "phase_2_done"
    | "phase_3_deco"
    | "phase_3_done"
    | "phase_4_boletas"
    | "phase_4_done"
    | "phase_complete"
  >("phase_0_ready");

  // Índices de casillas colocadas individualmente (en cualquier orden: 0, 1, 2, 3, 4)
  const [placedCasillaIndices, setPlacedCasillaIndices] = useState<number[]>(
    [],
  );
  const placedCasillaIndicesRef = useRef(placedCasillaIndices);
  useEffect(() => {
    placedCasillaIndicesRef.current = placedCasillaIndices;
  }, [placedCasillaIndices]);

  // Keys de decoraciones colocadas individualmente (en cualquier orden: cartel1, cartel2, folleto, cartel3)
  const [placedDecoKeys, setPlacedDecoKeys] = useState<string[]>([]);
  const placedDecoKeysRef = useRef(placedDecoKeys);
  useEffect(() => {
    placedDecoKeysRef.current = placedDecoKeys;
  }, [placedDecoKeys]);

  // Índices de boletas colocadas individualmente en las mamparas (0 a 4)
  const [placedBoletaIndices, setPlacedBoletaIndices] = useState<number[]>([]);
  const placedBoletaIndicesRef = useRef(placedBoletaIndices);
  useEffect(() => {
    placedBoletaIndicesRef.current = placedBoletaIndices;
  }, [placedBoletaIndices]);

  const playerPosRef = useRef(playerPos);
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);

  const boxPosRef = useRef(boxPos);
  useEffect(() => {
    boxPosRef.current = boxPos;
  }, [boxPos]);

  const minigamePhaseRef = useRef(minigamePhase);
  useEffect(() => {
    minigamePhaseRef.current = minigamePhase;
  }, [minigamePhase]);

  const isBoxInteractable =
    minigamePhase === "phase_0_ready" ||
    minigamePhase === "phase_1_done" ||
    minigamePhase === "phase_2_done" ||
    minigamePhase === "phase_3_done";

  // Intro & Stage Dialogue Speech Bubble State:
  // "initial_delay" (inicio escena 2s) | "delayed_start" (1.5s post-objeto) | "entering" | "visible" | "exiting" | "dismissed"
  const [dialogueState, setDialogueState] = useState<
    | "initial_delay"
    | "delayed_start"
    | "entering"
    | "visible"
    | "exiting"
    | "dismissed"
  >("initial_delay");
  const dialogueStateRef = useRef(dialogueState);

  useEffect(() => {
    dialogueStateRef.current = dialogueState;
  }, [dialogueState]);

  const dialogueDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Limpieza del timer de retraso de diálogo al desmontar
  useEffect(() => {
    return () => {
      if (dialogueDelayTimerRef.current) {
        clearTimeout(dialogueDelayTimerRef.current);
      }
    };
  }, []);

  // Pausa del juego (modal de salida abierto) accesible desde el bucle de animacion
  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Destinatario del diálogo: "user" (habla con nosotros -> frente/cámara "1") o "npc" (habla con otro personaje -> derecha "4")
  const [dialogueTarget, setDialogueTarget] = useState<"user" | "npc">("user");
  const dialogueTargetRef = useRef(dialogueTarget);
  useEffect(() => {
    dialogueTargetRef.current = dialogueTarget;
  }, [dialogueTarget]);

  // Orientación del personaje ante globos de texto:
  // - Habla con nosotros ("user"): voltea hacia delante mirando a la cámara ("1")
  // - Habla con otro personaje ("npc"): voltea hacia la derecha ("4")
  useEffect(() => {
    if (dialogueState === "entering" || dialogueState === "visible") {
      setIsWalking(false);
      setLastDirection(dialogueTarget === "npc" ? "4" : "1");
    }
  }, [dialogueState, dialogueTarget]);

  // Función preparada para interactuar con NPCs u otros personajes y eventos:
  // - delayMs > 0: bloquea teclado inmediatamente, mantiene postura actual y tras 1.5s voltea a la cámara/npc y muestra texto
  const triggerDialogue = (
    messages: Array<DialogueLine | string>,
    target: "user" | "npc" = "user",
    delayMs = 0,
  ) => {
    if (dialogueDelayTimerRef.current) {
      clearTimeout(dialogueDelayTimerRef.current);
      dialogueDelayTimerRef.current = null;
    }

    setDialogueTarget(target);
    dialogueTargetRef.current = target;
    setActiveDialogue(messages);
    setIsWalking(false);

    if (delayMs > 0) {
      // 1. Bloquear teclado y mantener postura actual durante delayMs (1.5s)
      setDialogueState("delayed_start");
      dialogueStateRef.current = "delayed_start";

      dialogueDelayTimerRef.current = setTimeout(() => {
        // 2. Transcurrido 1.5s, voltea hacia el jugador/cámara y muestra el texto
        setLastDirection(target === "npc" ? "4" : "1");
        setDialogueState("entering");
        dialogueStateRef.current = "entering";
        dialogueDelayTimerRef.current = null;
      }, delayMs);
    } else {
      setLastDirection(target === "npc" ? "4" : "1");
      setDialogueState("entering");
      dialogueStateRef.current = "entering";
    }
  };

  // Botón provisional de testeo: permite skipear todos los textos con un solo clic
  const handleSkipAllDialogue = () => {
    if (dialogueDelayTimerRef.current) {
      clearTimeout(dialogueDelayTimerRef.current);
      dialogueDelayTimerRef.current = null;
    }
    setDialogueState("dismissed");
    dialogueStateRef.current = "dismissed";
    setActiveDialogue(null);
  };

  // Dialogue delay & animation state transitions (Triggers exactly 2s after iris aperture fully opens)
  useEffect(() => {
    // Wait until retro iris wipe has fully completed and screen is open
    if (isTransitioning) {
      return;
    }

    if (dialogueState === "initial_delay") {
      const timer = setTimeout(() => {
        setDialogueState("entering");
      }, 2000);
      return () => clearTimeout(timer);
    } else if (dialogueState === "entering") {
      const timer = setTimeout(() => {
        setDialogueState("visible");
      }, 350);
      return () => clearTimeout(timer);
    } else if (dialogueState === "exiting") {
      const timer = setTimeout(() => {
        setDialogueState("dismissed");
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, dialogueState]);

  // Fin del Capitulo 1: todas las boletas colocadas y el dialogo final ya cerrado.
  // Se espera 2.5 segundos tras cerrar el último globo de texto antes de concluir el capítulo,
  // permitiendo una transición suave hacia el menú o siguiente escena sin cortes abruptos.
  const onChapterCompleteRef = useRef(onChapterComplete);
  useEffect(() => {
    onChapterCompleteRef.current = onChapterComplete;
  }, [onChapterComplete]);
  const lastDirectionRef = useRef(lastDirection);
  useEffect(() => {
    lastDirectionRef.current = lastDirection;
  }, [lastDirection]);
  const chapterCompletedRef = useRef(false);
  useEffect(() => {
    if (chapterCompletedRef.current) return;
    if (minigamePhase === "phase_complete" && dialogueState === "dismissed") {
      const timer = setTimeout(() => {
        chapterCompletedRef.current = true;
        // Traspaso al Capitulo 2 (modalidad JUGAR): continua desde aqui mismo
        setChapterHandoff({
          playerPos: playerPosRef.current,
          lastDirection: lastDirectionRef.current,
          fromChapter1Ending: true,
        });
        onChapterCompleteRef.current?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [minigamePhase, dialogueState]);

  // Al salir del juego (desmontaje) se liberan las imagenes precargadas del personaje
  // y se abortan las descargas pendientes para no consumir memoria ni red en el menu.
  useEffect(() => {
    return () => {
      releasePlayerImages();
    };
  }, []);

  // Keyboard Movement on Stage Plaza (Tracks lastDirection 1-4 & interrupts on keyup)
  useEffect(() => {
    const keysPressed: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed[k] = true;

      // Interacción con tecla 'E', ENTER o ESPACIO en la explanada cuando no hay diálogo activo
      const isInteractionKey =
        k === "e" ||
        k === "enter" ||
        k === " " ||
        e.code === "Enter" ||
        e.code === "Space";

      if (isInteractionKey && (k === " " || e.code === "Space")) {
        e.preventDefault();
      }

      if (
        isInteractionKey &&
        dialogueStateRef.current === "dismissed" &&
        !isPausedRef.current
      ) {
        if (k === "enter" || e.code === "Enter") {
          e.preventDefault();
        }
        const curPlayer = playerPosRef.current;
        const curBox = boxPosRef.current;
        const curPhase = minigamePhaseRef.current;

        const distToBox = Math.min(
          Math.hypot(curPlayer.x - curBox.x, curPlayer.y - curBox.y),
          Math.hypot(
            curPlayer.x - EXCLAMATION_ICON_POSITIONS.caja.x,
            curPlayer.y - EXCLAMATION_ICON_POSITIONS.caja.y,
          ),
        );

        // La caja SOLO se puede interactuar en fases de recolección (_ready o _done)
        const isBoxInteractableNow =
          curPhase === "phase_0_ready" ||
          curPhase === "phase_1_done" ||
          curPhase === "phase_2_done" ||
          curPhase === "phase_3_done";

        // 1. Recoger objetos de la caja de suministros (Cajas 1 a 5)
        if (isBoxInteractableNow && distToBox < 9.5) {
          if (curPhase === "phase_0_ready") {
            setMinigamePhase("phase_1_casillas");
            setBoxStage(2);
            setPlacedCasillaIndices([]);
          } else if (curPhase === "phase_1_done") {
            setMinigamePhase("phase_2_mesa");
            setBoxStage(3);
          } else if (curPhase === "phase_2_done") {
            setMinigamePhase("phase_3_deco");
            setBoxStage(4);
            setPlacedDecoKeys([]);
          } else if (curPhase === "phase_3_done") {
            setMinigamePhase("phase_4_boletas");
            setBoxStage(5);
            setPlacedBoletaIndices([]);
          }
        } else {
          // 2. Colocar objetos en cualquier orden según proximidad
          if (curPhase === "phase_1_casillas") {
            // Busca la casilla pendiente más cercana al jugador que esté a rango (< 9.5)
            const currentIndices = placedCasillaIndicesRef.current;
            let closestIdx = -1;
            let minDistance = 9.5;

            CASILLAS_ROW.forEach((pos, idx) => {
              if (!currentIndices.includes(idx)) {
                const iconPos = EXCLAMATION_ICON_POSITIONS.casillas[idx];
                const dist = Math.min(
                  Math.hypot(curPlayer.x - pos.x, curPlayer.y - pos.y),
                  Math.hypot(curPlayer.x - iconPos.x, curPlayer.y - iconPos.y),
                );
                if (dist < minDistance) {
                  minDistance = dist;
                  closestIdx = idx;
                }
              }
            });

            if (closestIdx !== -1) {
              const nextIndices = [...currentIndices, closestIdx];
              setPlacedCasillaIndices(nextIndices);
              if (nextIndices.length >= CASILLAS_ROW.length) {
                setMinigamePhase("phase_1_done");
                const messages =
                  language === "nah"
                    ? MAMPARAS_MESSAGES_NAH
                    : MAMPARAS_MESSAGES_ES;
                triggerDialogue(messages, "user", 1500);
              }
            }
          } else if (curPhase === "phase_2_mesa") {
            const target = PLACEMENT_SPOTS.mesa;
            const iconPos = EXCLAMATION_ICON_POSITIONS.mesa;
            const distToTarget = Math.min(
              Math.hypot(curPlayer.x - target.x, curPlayer.y - target.y),
              Math.hypot(curPlayer.x - iconPos.x, curPlayer.y - iconPos.y),
            );
            if (distToTarget < 9.5) {
              setMinigamePhase("phase_2_done");
              const messages =
                language === "nah" ? MESA_MESSAGES_NAH : MESA_MESSAGES_ES;
              triggerDialogue(messages, "user", 1500);
            }
          } else if (curPhase === "phase_3_deco") {
            // Busca la decoración pendiente más cercana al jugador que esté a rango (< 10.0)
            const currentKeys = placedDecoKeysRef.current;
            let closestKey: string | null = null;
            let minDistance = 10.0;

            DECORACIONES_LIST.forEach((deco) => {
              if (!currentKeys.includes(deco.key)) {
                const pos = DECORACIONES_POSITIONS[deco.key];
                const iconPos = EXCLAMATION_ICON_POSITIONS.decos[deco.key];
                const dist = Math.min(
                  Math.hypot(curPlayer.x - pos.x, curPlayer.y - pos.y),
                  Math.hypot(curPlayer.x - iconPos.x, curPlayer.y - iconPos.y),
                );
                if (dist < minDistance) {
                  minDistance = dist;
                  closestKey = deco.key;
                }
              }
            });

            if (closestKey !== null) {
              const nextKeys = [...currentKeys, closestKey];
              setPlacedDecoKeys(nextKeys);
              if (nextKeys.length >= DECORACIONES_LIST.length) {
                setMinigamePhase("phase_3_done");
                const messages =
                  language === "nah"
                    ? DECORACIONES_MESSAGES_NAH
                    : DECORACIONES_MESSAGES_ES;
                triggerDialogue(messages, "user", 1500);
              }
            }
          } else if (curPhase === "phase_4_boletas") {
            // Busca la boleta pendiente más cercana al jugador que esté a rango (< 9.5)
            const currentIndices = placedBoletaIndicesRef.current;
            let closestIdx = -1;
            let minDistance = 9.5;

            BOLETAS_POSITIONS.forEach((pos, idx) => {
              if (!currentIndices.includes(idx)) {
                const iconPos = EXCLAMATION_ICON_POSITIONS.boletas[idx];
                const dist = Math.min(
                  Math.hypot(curPlayer.x - pos.x, curPlayer.y - pos.y),
                  Math.hypot(curPlayer.x - iconPos.x, curPlayer.y - iconPos.y),
                );
                if (dist < minDistance) {
                  minDistance = dist;
                  closestIdx = idx;
                }
              }
            });

            if (closestIdx !== -1) {
              const nextIndices = [...currentIndices, closestIdx];
              setPlacedBoletaIndices(nextIndices);
              if (nextIndices.length >= BOLETAS_POSITIONS.length) {
                setMinigamePhase("phase_4_done");
                const messages =
                  language === "nah"
                    ? BOLETAS_MESSAGES_NAH
                    : BOLETAS_MESSAGES_ES;
                triggerDialogue(messages, "user", 1500);
              }
            }
          } else if (curPhase === "phase_4_done") {
            const target = PLACEMENT_SPOTS.mesa;
            const iconPos = EXCLAMATION_ICON_POSITIONS.mesaFinal;
            const distToTarget = Math.min(
              Math.hypot(curPlayer.x - target.x, curPlayer.y - target.y),
              Math.hypot(curPlayer.x - iconPos.x, curPlayer.y - iconPos.y),
            );
            if (distToTarget < 10.5) {
              setMinigamePhase("phase_complete");
              const messages =
                language === "nah"
                  ? CIERRE_CAPITULO_MESSAGES_NAH
                  : CIERRE_CAPITULO_MESSAGES_ES;
              triggerDialogue(messages, "user", 0);
            }
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed[k] = false;
    };

    // Explanada Plaza Collision System (Restricts movement strictly to diagonal PLAZA_BOUNDS)
    const isPlazaWalkable = (x: number, y: number): boolean => {
      if (y < PLAZA_BOUNDS.minY || y > PLAZA_BOUNDS.maxY) {
        return false;
      }
      const minXForY = getLeftBoundaryX(y);
      const maxXForY = getRightBoundaryX(y);
      if (x < minXForY || x > maxXForY) {
        return false;
      }
      return true;
    };

    // Combined Collision System: Plaza Bounds + Active Obstacle Boxes & Polygons
    const isPositionWalkable = (x: number, y: number): boolean => {
      if (!isPlazaWalkable(x, y)) {
        return false;
      }

      const obs = OBJECT_COLLISION_BOXES;
      const phase = minigamePhaseRef.current;
      const placedCasillas = placedCasillaIndicesRef.current;
      const placedDecos = placedDecoKeysRef.current;

      // Caja de suministros (rombo de 4 vértices, colisiona mientras esté en la plaza)
      if (phase !== "phase_complete" && isInsidePolygon(x, y, obs.caja)) {
        return false;
      }

      // Mamparas individuales (se activan conforme se va colocando cada una)
      const areCasillasPlacedInCurrentPhase =
        phase !== "phase_0_ready" && phase !== "phase_1_casillas";

      if (Array.isArray(obs.mamparas)) {
        for (let i = 0; i < obs.mamparas.length; i++) {
          const isThisMamparaPlaced =
            areCasillasPlacedInCurrentPhase || placedCasillas.includes(i);
          if (
            isThisMamparaPlaced &&
            obs.mamparas[i] &&
            isInsideBox(x, y, obs.mamparas[i])
          ) {
            return false;
          }
        }
      }

      // Mesa directiva (rectángulo inclinado de 4 vértices)
      const isMesaPresent =
        phase !== "phase_0_ready" &&
        phase !== "phase_1_casillas" &&
        phase !== "phase_1_done" &&
        phase !== "phase_2_mesa";
      if (isMesaPresent && isInsidePolygon(x, y, obs.mesa)) {
        return false;
      }

      // Cartel 2 (mampara de perfil en la entrada derecha)
      const isCartel2Present =
        phase === "phase_3_done" ||
        phase === "phase_4_boletas" ||
        phase === "phase_4_done" ||
        phase === "phase_complete"
          ? true
          : placedDecos.includes("cartel2");
      if (isCartel2Present && isInsideBox(x, y, obs.cartel2)) {
        return false;
      }

      return true;
    };

    let animationFrameId: number;
    let lastTime = performance.now();

    // Smooth Movement Physics Constants
    const maxSpeed = 22.0; // Max walk speed % per second (slightly lower max speed for controlled movement)
    const RAMP_TIME = 1.0; // Continuous hold duration (seconds) to reach full speed
    const frictionRate = 9.0; // Deceleration/slide factor (~0.25s inertial slide on release)

    // Track key hold duration and continuous velocity (% per sec)
    let keyHoldTime = 0;
    const velocity = { x: 0, y: 0 };

    const updateGameLoop = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000); // Delta time in seconds (capped at 50ms)
      lastTime = currentTime;

      // Modal de pausa abierto: congela completamente
      if (isPausedRef.current) {
        velocity.x = 0;
        velocity.y = 0;
        keyHoldTime = 0;
        setIsWalking(false);
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      // Sistema de Despenetración / Empuje suave si el personaje quedó dentro de un obstáculo al colocarlo:
      // Funciona SIEMPRE (incluso con el globo de texto activo) para sacarlo de inmediato de la colisión
      const pushVec = getSafePushVector(
        playerPosRef.current,
        OBJECT_COLLISION_BOXES,
        minigamePhaseRef.current,
        placedCasillaIndicesRef.current,
        placedDecoKeysRef.current,
        isPlazaWalkable,
      );

      if (pushVec) {
        // Empuje suave constante a 16% de pantalla por segundo hacia zona segura
        const pushSpeed = 16.0;
        const pushDx = pushVec.vx * pushSpeed * dt;
        const pushDy = pushVec.vy * pushSpeed * dt;

        velocity.x = 0;
        velocity.y = 0;
        keyHoldTime = 0;

        if (Math.abs(pushVec.vy) >= Math.abs(pushVec.vx)) {
          setLastDirection(pushVec.vy > 0 ? "1" : "3");
        } else {
          setLastDirection(pushVec.vx > 0 ? "4" : "2");
        }
        setIsWalking(true);

        setPlayerPos((prev) => ({
          x: prev.x + pushDx,
          y: prev.y + pushDy,
        }));

        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      // Bloquea el movimiento del jugador durante diálogos o pausas previas al diálogo
      // (una vez desatascado y fuera del obstáculo, se detiene; y si el diálogo ya inició, se orienta a la cámara o NPC)
      if (dialogueStateRef.current !== "dismissed") {
        velocity.x = 0;
        velocity.y = 0;
        keyHoldTime = 0;
        setIsWalking(false);
        if (
          dialogueStateRef.current === "entering" ||
          dialogueStateRef.current === "visible"
        ) {
          setLastDirection(dialogueTargetRef.current === "npc" ? "4" : "1");
        }
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      let dirX = 0;
      let dirY = 0;

      // Restrict user movement strictly to 4 orthogonal directions (no diagonal user input)
      if (keysPressed["arrowdown"] || keysPressed["s"]) {
        dirY = 1;
        setLastDirection("1");
      } else if (keysPressed["arrowup"] || keysPressed["w"]) {
        dirY = -1;
        setLastDirection("3");
      } else if (keysPressed["arrowleft"] || keysPressed["a"]) {
        dirX = -1;
        setLastDirection("2");
      } else if (keysPressed["arrowright"] || keysPressed["d"]) {
        dirX = 1;
        setLastDirection("4");
      }

      const isInputActive = dirX !== 0 || dirY !== 0;

      // INSTANTLY interrupt walking animation posture on key release
      setIsWalking(isInputActive);

      // Accumulate continuous press time when direction keys held, reset to 0 on key release
      if (isInputActive) {
        keyHoldTime = Math.min(RAMP_TIME, keyHoldTime + dt);
      } else {
        keyHoldTime = 0;
      }

      // Quadratic ease-in acceleration ramp: starts extremely subtle (micro-step), reaching full speed at 1s
      const rampFactor = isInputActive
        ? Math.pow(keyHoldTime / RAMP_TIME, 2)
        : 0;
      const targetVx = dirX * maxSpeed * rampFactor;
      const targetVy = dirY * maxSpeed * rampFactor;

      if (isInputActive) {
        velocity.x += (targetVx - velocity.x) * Math.min(1, 16.0 * dt);
        velocity.y += (targetVy - velocity.y) * Math.min(1, 16.0 * dt);
      } else {
        // Inertial deceleration slide when key is released
        velocity.x += (0 - velocity.x) * Math.min(1, frictionRate * dt);
        velocity.y += (0 - velocity.y) * Math.min(1, frictionRate * dt);
      }

      // Threshold micro-drift when completely stopped
      if (!isInputActive && Math.abs(velocity.x) < 0.04) velocity.x = 0;
      if (!isInputActive && Math.abs(velocity.y) < 0.04) velocity.y = 0;

      const currentSpeed = Math.hypot(velocity.x, velocity.y);
      const isMoving = currentSpeed > 0.01;

      if (isMoving) {
        const dx = velocity.x * dt;
        const dy = velocity.y * dt;

        setPlayerPos((prev) => {
          let effectiveDx = dx;
          let effectiveDy = dy;

          const isInsideRightPath =
            prev.y >= PLAZA_BOUNDS.rightPathTopY &&
            prev.y <= PLAZA_BOUNDS.rightPathBottomY &&
            prev.x > getBaseRightBoundaryX(prev.y);

          // 1. Diagonal Wall Sliding (ONLY applies on diagonal slopes outside side path)
          if (!isInsideRightPath) {
            // Check left wall collision & slide downwards if pushing into left diagonal wall
            const currentMinX = getLeftBoundaryX(prev.y);
            if (dx < 0 && prev.x <= currentMinX + 0.6) {
              effectiveDy += Math.abs(dx) * 0.75;
            }

            // Check right wall collision & slide downwards if pushing into right diagonal wall
            const currentMaxX = getRightBoundaryX(prev.y);
            if (dx > 0 && prev.x >= currentMaxX - 0.6) {
              effectiveDy += Math.abs(dx) * 0.75;
            }
          }

          const rawTargetX = prev.x + effectiveDx;
          const rawTargetY = prev.y + effectiveDy;

          // 2. Direct unconstrained movement if target is on stone explanada and not hitting obstacle
          if (isPositionWalkable(rawTargetX, rawTargetY)) {
            return { x: rawTargetX, y: rawTargetY };
          }

          // 2b. Diagonal Wall Sliding sobre la Caja de Suministros
          const curPhase = minigamePhaseRef.current;
          if (curPhase !== "phase_complete") {
            const cajaSlide = tryPolygonWallSlide(
              prev,
              effectiveDx,
              effectiveDy,
              OBJECT_COLLISION_BOXES.caja,
              isPositionWalkable,
            );
            if (cajaSlide) {
              return cajaSlide;
            }
          }

          // 2c. Diagonal Wall Sliding sobre la Mesa Directiva de Votación
          const isMesaActive =
            curPhase !== "phase_0_ready" &&
            curPhase !== "phase_1_casillas" &&
            curPhase !== "phase_1_done" &&
            curPhase !== "phase_2_mesa";
          if (isMesaActive) {
            const mesaSlide = tryPolygonWallSlide(
              prev,
              effectiveDx,
              effectiveDy,
              OBJECT_COLLISION_BOXES.mesa,
              isPositionWalkable,
            );
            if (mesaSlide) {
              return mesaSlide;
            }
          }

          // 3. Side Path Movement Constraints (No diagonal wall sliding; solid ceiling, floor, & right wall)
          if (isInsideRightPath) {
            const pathClampedY = Math.min(
              PLAZA_BOUNDS.rightPathBottomY,
              Math.max(PLAZA_BOUNDS.rightPathTopY, rawTargetY),
            );
            const pathClampedX = Math.min(
              PLAZA_BOUNDS.rightPathMaxX,
              Math.max(getBaseRightBoundaryX(pathClampedY), rawTargetX),
            );
            if (isPositionWalkable(pathClampedX, pathClampedY)) {
              return { x: pathClampedX, y: pathClampedY };
            }
          }

          // 4. Smooth Diagonal & Wall Sliding System for Main Plaza & Obstacles
          const clampedY = Math.min(
            PLAZA_BOUNDS.maxY,
            Math.max(PLAZA_BOUNDS.minY, rawTargetY),
          );

          const minXAtY = getLeftBoundaryX(clampedY);
          const maxXAtY = getRightBoundaryX(clampedY);

          const clampedX = Math.min(maxXAtY, Math.max(minXAtY, rawTargetX));

          if (isPositionWalkable(clampedX, clampedY)) {
            return { x: clampedX, y: clampedY };
          }

          if (isPositionWalkable(clampedX, prev.y)) {
            return { x: clampedX, y: prev.y };
          }
          if (isPositionWalkable(prev.x, clampedY)) {
            return { x: prev.x, y: clampedY };
          }

          // Zero out velocity when colliding head-on into solid boundary
          velocity.x = 0;
          velocity.y = 0;

          return prev;
        });
      } else {
        // Immediate interrupt to static idle state on full stop
        setIsWalking(false);
      }

      animationFrameId = requestAnimationFrame(updateGameLoop);
    };

    animationFrameId = requestAnimationFrame(updateGameLoop);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Camera Dynamic Zoom & Smooth Character Tracking Parameters
  const zoomScale = 2.0;
  const maxCamShift = (1 - 1 / zoomScale) * 50; // Max shift % before exposing background edges (0 con zoom 1)
  const rawCamX = 50 - playerPos.x;
  const rawCamY = 50 - playerPos.y;
  const camX = Math.min(maxCamShift, Math.max(-maxCamShift, rawCamX));
  const camY = Math.min(maxCamShift, Math.max(-maxCamShift, rawCamY));

  // OBJETIVO ACTIVO CON SIGNO DE EXCLAMACIÓN FLOTANTE (Coordenadas en el mundo %)
  let activeExclamationTarget: { x: number; y: number } | null = null;
  if (dialogueState === "dismissed") {
    if (isBoxInteractable) {
      activeExclamationTarget = EXCLAMATION_ICON_POSITIONS.caja;
    } else if (minigamePhase === "phase_1_casillas") {
      // Apunta a la casilla pendiente MÁS CERCANA al jugador
      let closestIcon: { x: number; y: number } | null = null;
      let minD = Infinity;
      CASILLAS_ROW.forEach((_, idx) => {
        if (!placedCasillaIndices.includes(idx)) {
          const iconPos = EXCLAMATION_ICON_POSITIONS.casillas[idx];
          const d = Math.hypot(
            playerPos.x - iconPos.x,
            playerPos.y - iconPos.y,
          );
          if (d < minD) {
            minD = d;
            closestIcon = iconPos;
          }
        }
      });
      activeExclamationTarget = closestIcon;
    } else if (minigamePhase === "phase_2_mesa") {
      activeExclamationTarget = EXCLAMATION_ICON_POSITIONS.mesa;
    } else if (minigamePhase === "phase_3_deco") {
      // Apunta a la decoración pendiente MÁS CERCANA al jugador
      let closestIcon: { x: number; y: number } | null = null;
      let minD = Infinity;
      DECORACIONES_LIST.forEach((deco) => {
        if (!placedDecoKeys.includes(deco.key)) {
          const iconPos = EXCLAMATION_ICON_POSITIONS.decos[deco.key];
          const d = Math.hypot(
            playerPos.x - iconPos.x,
            playerPos.y - iconPos.y,
          );
          if (d < minD) {
            minD = d;
            closestIcon = iconPos;
          }
        }
      });
      activeExclamationTarget = closestIcon;
    } else if (minigamePhase === "phase_4_boletas") {
      // Apunta a la boleta pendiente MÁS CERCANA al jugador
      let closestIcon: { x: number; y: number } | null = null;
      let minD = Infinity;
      BOLETAS_POSITIONS.forEach((_, idx) => {
        if (!placedBoletaIndices.includes(idx)) {
          const iconPos = EXCLAMATION_ICON_POSITIONS.boletas[idx];
          const d = Math.hypot(
            playerPos.x - iconPos.x,
            playerPos.y - iconPos.y,
          );
          if (d < minD) {
            minD = d;
            closestIcon = iconPos;
          }
        }
      });
      activeExclamationTarget = closestIcon;
    } else if (minigamePhase === "phase_4_done") {
      activeExclamationTarget = EXCLAMATION_ICON_POSITIONS.mesaFinal;
    }
  }

  // Detección de proximidad para interactuar con la caja
  const distToBox = Math.min(
    Math.hypot(playerPos.x - boxPos.x, playerPos.y - boxPos.y),
    Math.hypot(
      playerPos.x - EXCLAMATION_ICON_POSITIONS.caja.x,
      playerPos.y - EXCLAMATION_ICON_POSITIONS.caja.y,
    ),
  );
  const isNearBox =
    isBoxInteractable && dialogueState === "dismissed" && distToBox < 9.5;

  // Determina si los objetos ya fueron colocados en la explanada
  const isMesaPlaced =
    minigamePhase !== "phase_0_ready" &&
    minigamePhase !== "phase_1_casillas" &&
    minigamePhase !== "phase_1_done" &&
    minigamePhase !== "phase_2_mesa";

  // Proyección de la posición del objetivo en pantalla (0% a 100% del viewport)
  const targetScreenX = activeExclamationTarget
    ? 50 + (activeExclamationTarget.x + camX - 50) * zoomScale
    : 50;
  const targetScreenY = activeExclamationTarget
    ? 50 + (activeExclamationTarget.y + camY - 50) * zoomScale
    : 50;

  // ¿El signo de exclamación se encuentra dentro del encuadre visible de la cámara?
  const isTargetInView =
    targetScreenX >= 4 &&
    targetScreenX <= 96 &&
    targetScreenY >= 5 &&
    targetScreenY <= 95;

  const showOffscreenArrow = Boolean(
    activeExclamationTarget && !isTargetInView,
  );

  // Vector de dirección desde el centro de la pantalla hacia el objetivo fuera de cámara
  const dirX = targetScreenX - 50;
  const dirY = targetScreenY - 50;
  const arrowAngleRad = Math.atan2(dirY, dirX);
  const arrowAngleDeg = (arrowAngleRad * 180) / Math.PI;

  // Perímetro elíptico pegado a los bordes de la cámara (HUD ultra-fluido en 60 FPS):
  // X varía suavemente en [3.5%, 96.5%] (radio = 46.5%)
  // Y varía suavemente en [5.5%, 94.5%] (radio = 44.5%)
  const arrowScreenX = 50 + 46.5 * Math.cos(arrowAngleRad);
  const arrowScreenY = 50 + 44.5 * Math.sin(arrowAngleRad);

  return (
    <div className="absolute inset-0 w-full h-full z-20 overflow-hidden bg-[#2d572c] select-none">
      {/* Micro-animations Styles */}
      <style>{`
        @keyframes floatExclamation {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes pixelArrowPulse {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(clamp(3px, 0.4cqw, 8px)); }
        }
        @keyframes floatPrompt {
          0%, 100% { transform: translate(-50%, 0px); }
          50% { transform: translate(-50%, -3px); }
        }
      `}</style>

      {/* Top HUD Bar: Return Arrow Button (Pinned to Viewport) */}
      <div className="absolute top-3 left-3 z-30 pointer-events-none">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRequestExit();
          }}
          type="button"
          aria-label="Volver al menú principal"
          className={`pointer-events-auto bg-[#f9d7ea] hover:bg-[#f6c2e0] rounded-md ring-2 ring-white ring-inset active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center cursor-pointer font-mono font-black text-black shrink-0 ${
            isFullscreen
              ? "w-12 h-12 text-xl border-[4px] border-[#b5146c] shadow-[4px_4px_0px_0px_#7a0c47]"
              : "w-9 h-9 text-sm border-[3px] border-[#b5146c] shadow-[3px_3px_0px_0px_#7a0c47]"
          }`}
        >
          <span>◀</span>
        </button>
      </div>

      {/* BOTÓN PROVISIONAL DE TESTEO: SALTAR TODOS LOS DIÁLOGOS CON UN SOLO CLIC */}
      {dialogueState !== "dismissed" && (
        <div className="absolute top-3 right-3 z-50 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSkipAllDialogue();
            }}
            type="button"
            title="Botón provisional para pruebas: saltar todos los textos con un solo clic"
            className={`bg-[#ff2a85] hover:bg-[#ff4da6] active:bg-[#d61b6b] text-white font-black rounded-md border-[3px] border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer transition-all flex items-center gap-1.5 select-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
              isFullscreen
                ? "text-[11px] py-2 px-3.5 tracking-wider"
                : "text-[9px] py-1.5 px-2.5 tracking-wider"
            }`}
            style={{
              fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
            }}
          >
            <span>⏩</span>
            <span>SALTAR TEXTOS (TEST)</span>
          </button>
        </div>
      )}

      {/* OFF-SCREEN WAYPOINT ARROW (Flecha pixel art con movimiento fluido en 60 FPS) */}
      {showOffscreenArrow && (
        <div
          className="absolute pointer-events-none z-30 select-none"
          style={{
            left: `${arrowScreenX}%`,
            top: `${arrowScreenY}%`,
            transform: `translate(-50%, -50%) rotate(${arrowAngleDeg}deg)`,
            willChange: "left, top, transform",
          }}
        >
          <div
            style={{
              animation: "pixelArrowPulse 0.9s ease-in-out infinite",
            }}
            className="flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
          >
            <img
              src="/assets/juego/flecha-rosa.png"
              alt="Flecha indicadora de objetivo"
              className="w-[clamp(28px,4.2cqw,96px)] h-[clamp(28px,4.2cqw,96px)] object-contain select-none pointer-events-none"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </div>
      )}

      {/* DYNAMIC CAMERA WORLD CONTAINER (Enlarges 1.75x and smoothly tracks avatar) */}
      <div
        className="absolute inset-0 w-full h-full z-10"
        style={{
          transform: `scale(${zoomScale}) translate(${camX}%, ${camY}%)`,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        {/* Background 2D Stage Map (User Uploaded Plaza Map) */}
        <img
          src={stageImageUrl}
          alt="Escenario del Juego - INE Stage"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          style={{ imageRendering: "pixelated" }}
        />

        {/* PLAYER CHARACTER AVATAR ON THE PLAZA FLOOR */}
        <div
          style={{
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,
            width: "6.5%",
            transform: "translate(-50%, -90%)",
            willChange: "left, top",
            zIndex: 25,
          }}
          className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
        >
          {/* Indicador de coordenadas (X, Y) flotante encima del personaje */}
          {/* Dynamic 8-Folder Sprite Animation Component */}
          <AnimatedPlayerSprite
            isWalking={isWalking}
            lastDirection={lastDirection}
          />
        </div>

        {/* MINIJUEGO: CAJA DE SUMINISTROS (Cargada desde el inicio en la explanada) */}
        {minigamePhase !== "phase_complete" && (
          <div
            style={{
              left: `${boxPos.x}%`,
              top: `${boxPos.y}%`,
              width: "7.8%",
              transform: "translate(-50%, -75%)",
              zIndex: playerPos.y < 42.4 ? 28 : 15,
            }}
            className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
          >
            {/* Sombra proyectada en el suelo: sigue la figura en V isométrica de la base de la caja para evitar cualquier efecto de flotación */}
            <div
              className="absolute inset-0 pointer-events-none z-0"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <filter
                    id="boxShadowSoft"
                    x="-40%"
                    y="-40%"
                    width="180%"
                    height="180%"
                  >
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" />
                  </filter>
                  <filter
                    id="boxShadowCore"
                    x="-30%"
                    y="-30%"
                    width="160%"
                    height="160%"
                  >
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.7" />
                  </filter>
                </defs>

                {/* 1. Sombra difusa exterior en el suelo: proyecta el contorno en V isométrica sobre los adoquines */}
                <polygon
                  points="51,64 85,76 51.5,97 17,76"
                  fill="rgba(0, 0, 0, 0.40)"
                  filter="url(#boxShadowSoft)"
                />

                {/* 2. Oclusión oscura de contacto directo pegada al borde inferior de la caja */}
                <polygon
                  points="51.5,78 83,77 51.5,94.8 19,77"
                  fill="rgba(0, 0, 0, 0.55)"
                  filter="url(#boxShadowCore)"
                />
              </svg>
            </div>

            {/* Signo de exclamación flotante sobre la caja cuando está disponible para interactuar */}
            {isBoxInteractable && dialogueState === "dismissed" && (
              <div
                className="absolute z-35 flex items-center justify-center pointer-events-none"
                style={{
                  left: "calc(50% - 6.4%)",
                  top: "-63%",
                  width: EXCLAMATION_ICON_WIDTH,
                  animation: "floatExclamation 1.4s ease-in-out infinite",
                }}
              >
                <img
                  src="/assets/juego/exclamacion.png"
                  alt="Interacción disponible"
                  className="w-full h-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]"
                  style={{ imageRendering: "pixelated" }}
                />

                {/* Texto pixel art "presiona E" al acercarse a la caja (centrado directamente sobre el icono) */}
                {isNearBox && (
                  <div
                    className="absolute -top-[28%] left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center select-none"
                    style={{
                      animation: "floatPrompt 1.4s ease-in-out infinite",
                    }}
                  >
                    <div
                      className="whitespace-nowrap text-[#ff4da6] font-black tracking-wider flex items-center gap-1 select-none"
                      style={{
                        fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                        fontSize: isFullscreen
                          ? "clamp(6.5px, 0.68cqw, 10px)"
                          : "clamp(4.5px, 0.48cqw, 6px)",
                        lineHeight: "1",
                        textShadow:
                          "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 4px rgba(0,0,0,0.9)",
                      }}
                    >
                      <span>presiona</span>
                      <span className="text-[#ff99d6]">E</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sprite de la caja (caja-1.png hasta caja-5.png) */}
            <img
              src={`/assets/juego/caja-${boxStage}.png`}
              onError={(e) => {
                // Fallback a caja-1.png si la imagen de la fase aún no existe en la carpeta
                e.currentTarget.src = "/assets/juego/caja-1.png";
              }}
              alt={`Caja Minijuego Fase ${boxStage}`}
              className="relative z-10 w-full h-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        )}

        {/* PUNTOS DE COLOCACIÓN ACTIVOS CON SIGNO DE EXCLAMACIÓN (Desaparecen al colocar cada objeto) */}

        {/* 1. MAMPARAS PENDIENTES (phase_1_casillas - todas las no colocadas muestran su icono) */}
        {minigamePhase === "phase_1_casillas" &&
          CASILLA_POSITIONS.map((pos, index) => {
            if (placedCasillaIndices.includes(index)) return null;
            const iconPos = EXCLAMATION_ICON_POSITIONS.casillas[index];
            const dist = Math.min(
              Math.hypot(playerPos.x - pos.x, playerPos.y - pos.y),
              Math.hypot(playerPos.x - iconPos.x, playerPos.y - iconPos.y),
            );
            const isNearThisSpot = dist < 9.5;

            return (
              <div
                key={`pending-casilla-${index}`}
                style={{
                  left: `${iconPos.x}%`,
                  top: `${iconPos.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 35,
                }}
                className="absolute pointer-events-none flex flex-col items-center select-none"
              >
                {/* Signo de exclamación flotante sobre la ubicación disponible */}
                <div
                  className="flex items-center justify-center pointer-events-none"
                  style={{
                    width: EXCLAMATION_ICON_WIDTH,
                    animation: "floatExclamation 1.4s ease-in-out infinite",
                  }}
                >
                  <img
                    src="/assets/juego/exclamacion.png"
                    alt="Ubicación disponible"
                    className="w-full h-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>

                {/* Texto pixel art "presiona E" al acercarse */}
                {isNearThisSpot && (
                  <div
                    className="absolute -top-[28%] left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center select-none"
                    style={{
                      animation: "floatPrompt 1.4s ease-in-out infinite",
                    }}
                  >
                    <div
                      className="whitespace-nowrap text-[#ff4da6] font-black tracking-wider flex items-center gap-1 select-none"
                      style={{
                        fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                        fontSize: isFullscreen
                          ? "clamp(6.5px, 0.68cqw, 10px)"
                          : "clamp(4.5px, 0.48cqw, 6px)",
                        lineHeight: "1",
                        textShadow:
                          "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 4px rgba(0,0,0,0.9)",
                      }}
                    >
                      <span>presiona</span>
                      <span className="text-[#ff99d6]">E</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        {/* 2. MESA DE VOTACIÓN PENDIENTE (phase_2_mesa) */}
        {minigamePhase === "phase_2_mesa" &&
          (() => {
            const iconPos = EXCLAMATION_ICON_POSITIONS.mesa;
            const dist = Math.min(
              Math.hypot(
                playerPos.x - MESA_POSITION.x,
                playerPos.y - MESA_POSITION.y,
              ),
              Math.hypot(playerPos.x - iconPos.x, playerPos.y - iconPos.y),
            );
            const isNearMesa = dist < 9.5;

            return (
              <div
                style={{
                  left: `${iconPos.x}%`,
                  top: `${iconPos.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 35,
                }}
                className="absolute pointer-events-none flex flex-col items-center select-none"
              >
                <div
                  className="flex items-center justify-center pointer-events-none"
                  style={{
                    width: EXCLAMATION_ICON_WIDTH,
                    animation: "floatExclamation 1.4s ease-in-out infinite",
                  }}
                >
                  <img
                    src="/assets/juego/exclamacion.png"
                    alt="Ubicación disponible"
                    className="w-full h-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>

                {isNearMesa && (
                  <div
                    className="absolute -top-[28%] left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center select-none"
                    style={{
                      animation: "floatPrompt 1.4s ease-in-out infinite",
                    }}
                  >
                    <div
                      className="whitespace-nowrap text-[#ff4da6] font-black tracking-wider flex items-center gap-1 select-none"
                      style={{
                        fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                        fontSize: isFullscreen
                          ? "clamp(6.5px, 0.68cqw, 10px)"
                          : "clamp(4.5px, 0.48cqw, 6px)",
                        lineHeight: "1",
                        textShadow:
                          "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 4px rgba(0,0,0,0.9)",
                      }}
                    >
                      <span>presiona</span>
                      <span className="text-[#ff99d6]">E</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        {/* 3. DECORACIONES PENDIENTES (phase_3_deco - todas las no colocadas muestran su icono) */}
        {minigamePhase === "phase_3_deco" &&
          DECORACIONES_LIST.map((deco) => {
            if (placedDecoKeys.includes(deco.key)) return null;
            const pos = DECORACIONES_POSITIONS[deco.key];
            const iconPos = EXCLAMATION_ICON_POSITIONS.decos[deco.key];
            const dist = Math.min(
              Math.hypot(playerPos.x - pos.x, playerPos.y - pos.y),
              Math.hypot(playerPos.x - iconPos.x, playerPos.y - iconPos.y),
            );
            const isNearThisSpot = dist < 10.0;

            return (
              <div
                key={`pending-deco-${deco.id}`}
                style={{
                  left: `${iconPos.x}%`,
                  top: `${iconPos.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 35,
                }}
                className="absolute pointer-events-none flex flex-col items-center select-none"
              >
                <div
                  className="flex items-center justify-center pointer-events-none"
                  style={{
                    width: EXCLAMATION_ICON_WIDTH,
                    animation: "floatExclamation 1.4s ease-in-out infinite",
                  }}
                >
                  <img
                    src="/assets/juego/exclamacion.png"
                    alt="Ubicación disponible"
                    className="w-full h-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>

                {isNearThisSpot && (
                  <div
                    className="absolute -top-[28%] left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center select-none"
                    style={{
                      animation: "floatPrompt 1.4s ease-in-out infinite",
                    }}
                  >
                    <div
                      className="whitespace-nowrap text-[#ff4da6] font-black tracking-wider flex items-center gap-1 select-none"
                      style={{
                        fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                        fontSize: isFullscreen
                          ? "clamp(6.5px, 0.68cqw, 10px)"
                          : "clamp(4.5px, 0.48cqw, 6px)",
                        lineHeight: "1",
                        textShadow:
                          "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 4px rgba(0,0,0,0.9)",
                      }}
                    >
                      <span>presiona</span>
                      <span className="text-[#ff99d6]">E</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        {/* 4. BOLETAS PENDIENTES (phase_4_boletas - se colocan sobre las mesas de las mamparas) */}
        {minigamePhase === "phase_4_boletas" &&
          BOLETAS_POSITIONS.map((pos, index) => {
            if (placedBoletaIndices.includes(index)) return null;
            const iconPos = EXCLAMATION_ICON_POSITIONS.boletas[index];
            const dist = Math.min(
              Math.hypot(playerPos.x - pos.x, playerPos.y - pos.y),
              Math.hypot(playerPos.x - iconPos.x, playerPos.y - iconPos.y),
            );
            const isNearThisSpot = dist < 9.5;

            return (
              <div
                key={`pending-boleta-${index}`}
                style={{
                  left: `${iconPos.x}%`,
                  top: `${iconPos.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 35,
                }}
                className="absolute pointer-events-none flex flex-col items-center select-none"
              >
                <div
                  className="flex items-center justify-center pointer-events-none"
                  style={{
                    width: EXCLAMATION_ICON_WIDTH,
                    animation: "floatExclamation 1.4s ease-in-out infinite",
                  }}
                >
                  <img
                    src="/assets/juego/exclamacion.png"
                    alt="Ubicación disponible"
                    className="w-full h-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>

                {isNearThisSpot && (
                  <div
                    className="absolute -top-[28%] left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center select-none"
                    style={{
                      animation: "floatPrompt 1.4s ease-in-out infinite",
                    }}
                  >
                    <div
                      className="whitespace-nowrap text-[#ff4da6] font-black tracking-wider flex items-center gap-1 select-none"
                      style={{
                        fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                        fontSize: isFullscreen
                          ? "clamp(6.5px, 0.68cqw, 10px)"
                          : "clamp(4.5px, 0.48cqw, 6px)",
                        lineHeight: "1",
                        textShadow:
                          "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 4px rgba(0,0,0,0.9)",
                      }}
                    >
                      <span>presiona</span>
                      <span className="text-[#ff99d6]">E</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        {/* 5. MESA DE FUNCIONARIOS FINAL (phase_4_done - exclamación sobre la mesa tras terminar el texto de boletas) */}
        {minigamePhase === "phase_4_done" &&
          dialogueState === "dismissed" &&
          (() => {
            const iconPos = EXCLAMATION_ICON_POSITIONS.mesaFinal;
            const dist = Math.min(
              Math.hypot(
                playerPos.x - MESA_POSITION.x,
                playerPos.y - MESA_POSITION.y,
              ),
              Math.hypot(playerPos.x - iconPos.x, playerPos.y - iconPos.y),
            );
            const isNearMesa = dist < 10.5;

            return (
              <div
                style={{
                  left: `${iconPos.x}%`,
                  top: `${iconPos.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 35,
                }}
                className="absolute pointer-events-none flex flex-col items-center select-none"
              >
                <div
                  className="flex items-center justify-center pointer-events-none"
                  style={{
                    width: EXCLAMATION_ICON_WIDTH,
                    animation: "floatExclamation 1.4s ease-in-out infinite",
                  }}
                >
                  <img
                    src="/assets/juego/exclamacion.png"
                    alt="Hablar con funcionarios de mesa"
                    className="w-full h-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>

                {isNearMesa && (
                  <div
                    className="absolute -top-[28%] left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center select-none"
                    style={{
                      animation: "floatPrompt 1.4s ease-in-out infinite",
                    }}
                  >
                    <div
                      className="whitespace-nowrap text-[#ff4da6] font-black tracking-wider flex items-center gap-1 select-none"
                      style={{
                        fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                        fontSize: isFullscreen
                          ? "clamp(6.5px, 0.68cqw, 10px)"
                          : "clamp(4.5px, 0.48cqw, 6px)",
                        lineHeight: "1",
                        textShadow:
                          "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 4px rgba(0,0,0,0.9)",
                      }}
                    >
                      <span>presiona</span>
                      <span className="text-[#ff99d6]">E</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        {/* CASILLAS ELECTORALES COLOCADAS EN CUALQUIER ORDEN (sin sombras artificiales) */}
        {CASILLA_POSITIONS.map((pos, index) => {
          const isPlaced =
            minigamePhase !== "phase_0_ready" &&
            minigamePhase !== "phase_1_casillas"
              ? true
              : placedCasillaIndices.includes(index);

          if (!isPlaced) return null;

          return (
            <div
              key={`casilla-item-${index}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: CASILLA_WIDTH,
                transform: "translate(-50%, -90%)",
                zIndex: playerPos.y >= pos.y ? 18 : 28,
              }}
              className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
            >
              {/* Sprite pixel art de la casilla electoral + sombra proyectada con su silueta */}
              <CastShadow src="/assets/juego/casilla.png" preset="tall" />
              <img
                src="/assets/juego/casilla.png"
                alt={`Casilla Electoral ${index + 1}`}
                className="relative z-10 w-full h-auto object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          );
        })}

        {/* OBJETO COLOCADO: MESA DE VOTACIÓN CON URNAS (con sombra proyectada) */}
        {isMesaPlaced && (
          <div
            style={{
              left: `${MESA_POSITION.x}%`,
              top: `${MESA_POSITION.y}%`,
              width: MESA_WIDTH,
              transform: "translate(-50%, -90%)",
              zIndex:
                playerPos.y >= MESA_POSITION.y ||
                (playerPos.y > 56.6 && playerPos.x >= 20.8) ||
                (playerPos.y <= 56.6 && playerPos.x >= 24.8)
                  ? 18
                  : 28,
            }}
            className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
          >
            {/* Sprite pixel art de la mesa de votación + sombra en el suelo */}
            <CastShadow src="/assets/juego/mesa.png" preset="mesa" />
            <img
              src="/assets/juego/mesa.png"
              alt="Mesa Directiva de Casilla"
              className="relative z-10 w-full h-auto object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        )}

        {/* OBJETOS COLOCADOS: 4 DECORACIONES (Cartel 1, Cartel 2, Folleto, Letrero VOTA) (con sombra proyectada) */}
        {DECORACIONES_LIST.map((deco) => {
          const isPlaced =
            minigamePhase === "phase_3_done" ||
            minigamePhase === "phase_4_boletas" ||
            minigamePhase === "phase_4_done" ||
            minigamePhase === "phase_complete"
              ? true
              : placedDecoKeys.includes(deco.key);

          if (!isPlaced) return null;

          const pos = DECORACIONES_POSITIONS[deco.key];
          return (
            <div
              key={`deco-item-${deco.id}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: deco.width,
                transform: "translate(-50%, -90%)",
                zIndex:
                  deco.key === "cartel3" ? 35 : playerPos.y >= pos.y ? 18 : 28,
              }}
              className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
            >
              {/* Sprite pixel art de la decoracion + sombra en el suelo (solo si aplica; folleto sin sombra) */}
              {DECORATION_SHADOWS[deco.key] && (
                <CastShadow
                  src={deco.sprite}
                  preset={DECORATION_SHADOWS[deco.key].preset}
                  overrides={DECORATION_SHADOWS[deco.key].overrides}
                />
              )}
              <img
                src={deco.sprite}
                alt={deco.name}
                className="relative z-10 w-full h-auto object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          );
        })}

        {/* OBJETOS COLOCADOS: BOLETAS SOBRE LAS MESAS DE LAS MAMPARAS (sin sombra a petición de diseño) */}
        {BOLETAS_POSITIONS.map((pos, index) => {
          const isPlaced =
            minigamePhase === "phase_4_done" ||
            minigamePhase === "phase_complete"
              ? true
              : placedBoletaIndices.includes(index);

          if (!isPlaced) return null;
          const boletaWidth = BOLETAS_SIZES[index] || BOLETA_WIDTH;
          const casillaY = CASILLA_POSITIONS[index]?.y ?? 36.0;
          const isPlayerInFront = playerPos.y >= casillaY;

          return (
            <div
              key={`boleta-item-${index}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: boletaWidth,
                transform: "translate(-50%, -90%)",
                zIndex: isPlayerInFront ? 21 : 29, // Siempre por delante de la mampara (18 o 28)
              }}
              className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
            >
              {/* Sprite pixel art de la boleta electoral */}
              <img
                src="/assets/juego/boleta.png"
                alt={`Boleta Electoral ${index + 1}`}
                className="relative z-10 w-full h-auto object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          );
        })}

        {/* FOREGROUND BUSH OVERLAYS (Positioned at z-30 above player so character walks behind them) */}
        <img
          src="/assets/juego/arbusto-izquierda.png"
          alt="Arbustos Izquierda"
          className="absolute bottom-0 left-0 w-[30.6%] h-auto object-contain pointer-events-none select-none z-30"
          style={{ imageRendering: "pixelated" }}
        />
        <img
          src="/assets/juego/arbusto-derecha.png"
          alt="Arbustos Derecha"
          className="absolute bottom-0 right-0 w-[26%] h-auto object-contain pointer-events-none select-none z-30"
          style={{ imageRendering: "pixelated" }}
        />

        {/* AMBIENTACIÓN DINÁMICA: RAYOS DE LUZ, PARTÍCULAS, PÉTALOS Y MARIPOSITAS EN ÁREAS VERDES */}
        <PlazaAmbience isPaused={isPaused} />
      </div>

      {/* INTRO SPEECH BUBBLE DIALOGUE OVERLAY */}
      {dialogueState !== "initial_delay" &&
        dialogueState !== "delayed_start" &&
        dialogueState !== "dismissed" && (
          <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-center pb-[1.8cqw] px-[2cqw] overflow-hidden select-none">
            <div className="relative z-10 w-[96%] pointer-events-auto flex flex-col items-end">
              {/* Botón provisional para saltar todos los textos (Test) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSkipAllDialogue();
                }}
                type="button"
                title="Saltar todos los textos con un solo clic (Test)"
                className="mb-1.5 bg-[#940d57] hover:bg-[#ff2a85] active:bg-[#780946] text-white rounded border-[2px] border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-colors flex items-center gap-1.5 px-3 py-1 select-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                style={{
                  fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                  fontSize: isFullscreen ? "10px" : "8px",
                }}
              >
                <span>⏩</span>
                <span>SALTAR TEXTOS (TEST)</span>
              </button>

              <PixelSpeechBubble
                speaker={language === "nah" ? "Inecito Cívica" : "Inecito"}
                messages={
                  activeDialogue ||
                  (language === "nah" ? INTRO_MESSAGES_NAH : INTRO_MESSAGES_ES)
                }
                actionKey="E"
                disabled={isPaused}
                isDismissing={dialogueState === "exiting"}
                onLineChange={(line) => {
                  const target = line.target || dialogueTarget;
                  setIsWalking(false);
                  setLastDirection(target === "npc" ? "4" : "1");
                }}
                onDismiss={() => {
                  setDialogueState("exiting");
                  setActiveDialogue(null);
                }}
              />
            </div>
          </div>
        )}
    </div>
  );
}
