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

// Frame count definitions for each of the 8 character animation folders
const PLAYER_FRAME_COUNTS: Record<string, number> = {
  static1: 80,
  static2: 50,
  static3: 57,
  static4: 43,
  walking1: 26,
  walking2: 24,
  walking3: 22,
  walking4: 29,
};

// Preload all player animation frames into memory to eliminate image loading stutter
const PRELOADED_PLAYER_IMAGES: Record<string, HTMLImageElement[]> = {};

function preloadPlayerFolder(folder: string) {
  if (typeof window === "undefined" || PRELOADED_PLAYER_IMAGES[folder]) return;
  PRELOADED_PLAYER_IMAGES[folder] = [];
  const count = PLAYER_FRAME_COUNTS[folder] || 20;
  for (let i = 0; i < count; i++) {
    const img = new Image();
    img.src = `/assets/juego/player/${folder}/${i}.png`;
    PRELOADED_PLAYER_IMAGES[folder].push(img);
  }
}

// Libera la cache de frames del personaje y aborta descargas pendientes (se llama al salir del juego)
function releasePlayerImages() {
  for (const folder of Object.keys(PRELOADED_PLAYER_IMAGES)) {
    for (const img of PRELOADED_PLAYER_IMAGES[folder]) {
      img.src = "";
    }
    delete PRELOADED_PLAYER_IMAGES[folder];
  }
}

// Animated Player Sprite Component (Plays high quality PNG frame animations from walking1-4 & static1-4)
function AnimatedPlayerSprite({
  isWalking,
  lastDirection,
}: {
  isWalking: boolean;
  lastDirection: "1" | "2" | "3" | "4";
}) {
  const [frameIndex, setFrameIndex] = useState(0);

  const currentFolder = isWalking
    ? `walking${lastDirection}`
    : `static${lastDirection}`;

  const totalFrames = PLAYER_FRAME_COUNTS[currentFolder] || 20;

  // Preload animation frames into memory on folder change
  useEffect(() => {
    preloadPlayerFolder(currentFolder);
  }, [currentFolder]);

  // Instantly reset frame index to 0 when direction or walking state changes
  useEffect(() => {
    setFrameIndex(0);
  }, [isWalking, lastDirection]);

  // Frame cycling interval (exactly 24 FPS = ~41.67ms per frame for smooth animation)
  useEffect(() => {
    const fps24Interval = 1000 / 24;
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % totalFrames);
    }, fps24Interval);

    return () => clearInterval(interval);
  }, [currentFolder, totalFrames]);

  const imageSrc = `/assets/juego/player/${currentFolder}/${frameIndex}.png`;

  return (
    <div className="relative flex flex-col items-center justify-center w-full shrink-0">
      <img
        src={imageSrc}
        alt="Personaje Principal"
        className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-md shrink-0"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}

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

// Tamaño fijo y uniforme del icono de exclamación (fijado exactamente al tamaño de la caja para todos los objetos)
export const EXCLAMATION_ICON_WIDTH = "clamp(13px, 1.48cqw, 32px)";

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
    maxX: 96.5,
    minY: 83.5,
    maxY: 93.0,
  },
};

const isInsideBox = (x: number, y: number, box: ObstacleBox): boolean => {
  return x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY;
};

const isInsidePolygon = (
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
const tryPolygonWallSlide = (
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
      ((targetX - a.x) * (b.x - a.x) + (targetY - a.y) * (b.y - a.y)) /
      len2;
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

const getLeftBoundaryX = (y: number): number => {
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
const getBaseRightBoundaryX = (y: number): number => {
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
const getRightBoundaryX = (y: number): number => {
  if (y >= PLAZA_BOUNDS.rightPathTopY && y <= PLAZA_BOUNDS.rightPathBottomY) {
    return PLAZA_BOUNDS.rightPathMaxX;
  }
  return getBaseRightBoundaryX(y);
};

// Stable constants for intro dialogue sequence (prevents re-render resets on fullscreen toggle)
const INTRO_MESSAGES_ES: string[] = [
  "¡Hola! Hoy es un día muy importante. ¡Es día de elecciones!",
  "Soy Inecito, funcionario de casilla, y mi misión es ayudar a que todas las personas puedan votar.",
  "Pero antes de recibir a nuestros primeros votantes... ¡tenemos mucho que preparar!",
];

const INTRO_MESSAGES_NAH: string[] = [
  "¡Niltze! Axkan se tonal tekitl. ¡Tonal tlaixquetzalistli!",
  "Nehwa Inecito, tekitketl casilla, wan notequi tlaiknelia nochimeh tlacameh ma tlateneuakan.",
  "Tel achto xikselikan tochantlakahuan... ¡miak tlamantli moneki timoyektlalikan!",
];

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
}

export default function GameplayScene({
  language = "es",
  stageImageUrl,
  isFullscreen,
  isTransitioning,
  isPaused,
  onRequestExit,
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

  // Intro Dialogue Speech Bubble State: "initial_delay" | "entering" | "visible" | "exiting" | "dismissed"
  const [dialogueState, setDialogueState] = useState<
    "initial_delay" | "entering" | "visible" | "exiting" | "dismissed"
  >("initial_delay");
  const dialogueStateRef = useRef(dialogueState);

  useEffect(() => {
    dialogueStateRef.current = dialogueState;
  }, [dialogueState]);

  // Pausa del juego (modal de salida abierto) accesible desde el bucle de animacion
  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

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

      // Interacción con tecla 'E' en la explanada cuando no hay diálogo activo
      if (
        k === "e" &&
        dialogueStateRef.current === "dismissed" &&
        !isPausedRef.current
      ) {
        const curPlayer = playerPosRef.current;
        const curBox = boxPosRef.current;
        const curPhase = minigamePhaseRef.current;

        const distToBox = Math.hypot(
          curPlayer.x - curBox.x,
          curPlayer.y - curBox.y,
        );

        // 1. Recoger objetos de la caja de suministros (Cajas 1 a 5)
        if (distToBox < 9.0) {
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
            // Busca la casilla pendiente más cercana al jugador que esté a rango (< 9.0)
            const currentIndices = placedCasillaIndicesRef.current;
            let closestIdx = -1;
            let minDistance = 9.0;

            CASILLAS_ROW.forEach((pos, idx) => {
              if (!currentIndices.includes(idx)) {
                const dist = Math.hypot(
                  curPlayer.x - pos.x,
                  curPlayer.y - pos.y,
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
              }
            }
          } else if (curPhase === "phase_2_mesa") {
            const target = PLACEMENT_SPOTS.mesa;
            const distToTarget = Math.hypot(
              curPlayer.x - target.x,
              curPlayer.y - target.y,
            );
            if (distToTarget < 9.0) {
              setMinigamePhase("phase_2_done");
            }
          } else if (curPhase === "phase_3_deco") {
            // Busca la decoración pendiente más cercana al jugador que esté a rango (< 9.0)
            const currentKeys = placedDecoKeysRef.current;
            let closestKey: string | null = null;
            let minDistance = 9.0;

            DECORACIONES_LIST.forEach((deco) => {
              if (!currentKeys.includes(deco.key)) {
                const pos = DECORACIONES_POSITIONS[deco.key];
                const dist = Math.hypot(
                  curPlayer.x - pos.x,
                  curPlayer.y - pos.y,
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
              }
            }
          } else if (curPhase === "phase_4_boletas") {
            // Busca la boleta pendiente más cercana al jugador que esté a rango (< 9.0)
            const currentIndices = placedBoletaIndicesRef.current;
            let closestIdx = -1;
            let minDistance = 9.0;

            BOLETAS_POSITIONS.forEach((pos, idx) => {
              if (!currentIndices.includes(idx)) {
                const dist = Math.hypot(
                  curPlayer.x - pos.x,
                  curPlayer.y - pos.y,
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
                setMinigamePhase("phase_complete");
              }
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

      // Block player movement completely while dialogue intro sequence is active or game is paused
      if (dialogueStateRef.current !== "dismissed" || isPausedRef.current) {
        velocity.x = 0;
        velocity.y = 0;
        keyHoldTime = 0;
        setIsWalking(false);
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
  const zoomScale = 1.9;
  const maxCamShift = (1 - 1 / zoomScale) * 50; // Max shift % before exposing background edges (0 con zoom 1)
  const rawCamX = 50 - playerPos.x;
  const rawCamY = 50 - playerPos.y;
  const camX = Math.min(maxCamShift, Math.max(-maxCamShift, rawCamX));
  const camY = Math.min(maxCamShift, Math.max(-maxCamShift, rawCamY));

  // OBJETIVO ACTIVO CON SIGNO DE EXCLAMACIÓN FLOTANTE (Coordenadas en el mundo %)
  let activeExclamationTarget: { x: number; y: number } | null = null;
  if (dialogueState === "dismissed") {
    if (isBoxInteractable) {
      activeExclamationTarget = { x: boxPos.x, y: boxPos.y - 3.8 };
    } else if (minigamePhase === "phase_1_casillas") {
      // Apunta a la casilla pendiente MÁS CERCANA al jugador
      let closestPos: { x: number; y: number } | null = null;
      let minD = Infinity;
      CASILLAS_ROW.forEach((pos, idx) => {
        if (!placedCasillaIndices.includes(idx)) {
          const d = Math.hypot(playerPos.x - pos.x, playerPos.y - pos.y);
          if (d < minD) {
            minD = d;
            closestPos = pos;
          }
        }
      });
      if (closestPos) {
        activeExclamationTarget = {
          x: (closestPos as { x: number; y: number }).x,
          y: (closestPos as { x: number; y: number }).y - 4.5,
        };
      }
    } else if (minigamePhase === "phase_2_mesa") {
      activeExclamationTarget = {
        x: PLACEMENT_SPOTS.mesa.x,
        y: PLACEMENT_SPOTS.mesa.y - 4.5,
      };
    } else if (minigamePhase === "phase_3_deco") {
      // Apunta a la decoración pendiente MÁS CERCANA al jugador
      let closestPos: { x: number; y: number } | null = null;
      let minD = Infinity;
      DECORACIONES_LIST.forEach((deco) => {
        if (!placedDecoKeys.includes(deco.key)) {
          const pos = DECORACIONES_POSITIONS[deco.key];
          const d = Math.hypot(playerPos.x - pos.x, playerPos.y - pos.y);
          if (d < minD) {
            minD = d;
            closestPos = pos;
          }
        }
      });
      if (closestPos) {
        activeExclamationTarget = {
          x: (closestPos as { x: number; y: number }).x,
          y: (closestPos as { x: number; y: number }).y - 4.5,
        };
      }
    } else if (minigamePhase === "phase_4_boletas") {
      // Apunta a la boleta pendiente MÁS CERCANA al jugador
      let closestPos: { x: number; y: number } | null = null;
      let minD = Infinity;
      BOLETAS_POSITIONS.forEach((pos, idx) => {
        if (!placedBoletaIndices.includes(idx)) {
          const d = Math.hypot(playerPos.x - pos.x, playerPos.y - pos.y);
          if (d < minD) {
            minD = d;
            closestPos = pos;
          }
        }
      });
      if (closestPos) {
        activeExclamationTarget = {
          x: (closestPos as { x: number; y: number }).x,
          y: (closestPos as { x: number; y: number }).y - 4.5,
        };
      }
    }
  }

  // Detección de proximidad para interactuar con la caja
  const distToBox = Math.hypot(playerPos.x - boxPos.x, playerPos.y - boxPos.y);
  const isNearBox =
    isBoxInteractable && dialogueState === "dismissed" && distToBox < 9.0;

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
                className="absolute -top-[46%] left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none"
                style={{
                  width: EXCLAMATION_ICON_WIDTH,
                  animation: "floatExclamation 1.4s ease-in-out infinite",
                }}
              >
                <img
                  src="/assets/juego/exclamacion.png"
                  alt="Interacción disponible"
                  className="w-full h-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
            )}

            {/* Texto pixel art "presiona E" al acercarse a la caja (sin fondo, tamaño compacto) */}
            {isNearBox && (
              <div
                className="absolute -top-[70%] left-1/2 z-40 pointer-events-none flex flex-col items-center select-none"
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
            const dist = Math.hypot(playerPos.x - pos.x, playerPos.y - pos.y);
            const isNearThisSpot = dist < 9.0;

            return (
              <div
                key={`pending-casilla-${index}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: CASILLA_WIDTH,
                  transform: "translate(-50%, -90%)",
                  zIndex: 20,
                }}
                className="absolute pointer-events-none flex flex-col items-center select-none"
              >
                {/* Signo de exclamación flotante sobre la ubicación disponible */}
                <div
                  className="absolute -top-[46%] left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none"
                  style={{
                    width: EXCLAMATION_ICON_WIDTH,
                    animation: "floatExclamation 1.4s ease-in-out infinite",
                  }}
                >
                  <img
                    src="/assets/juego/exclamacion.png"
                    alt="Ubicación disponible"
                    className="w-full h-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>

                {/* Texto pixel art "presiona E" al acercarse */}
                {isNearThisSpot && (
                  <div
                    className="absolute -top-[70%] left-1/2 z-40 pointer-events-none flex flex-col items-center select-none"
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
        {minigamePhase === "phase_2_mesa" && (
          <div
            style={{
              left: `${MESA_POSITION.x}%`,
              top: `${MESA_POSITION.y}%`,
              width: MESA_WIDTH,
              transform: "translate(-50%, -90%)",
              zIndex: 20,
            }}
            className="absolute pointer-events-none flex flex-col items-center select-none"
          >
            <div
              className="absolute -top-[46%] left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none"
              style={{
                width: EXCLAMATION_ICON_WIDTH,
                animation: "floatExclamation 1.4s ease-in-out infinite",
              }}
            >
              <img
                src="/assets/juego/exclamacion.png"
                alt="Ubicación disponible"
                className="w-full h-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                style={{ imageRendering: "pixelated" }}
              />
            </div>

            {Math.hypot(
              playerPos.x - MESA_POSITION.x,
              playerPos.y - MESA_POSITION.y,
            ) < 9.0 && (
              <div
                className="absolute -top-[70%] left-1/2 z-40 pointer-events-none flex flex-col items-center select-none"
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

        {/* 3. DECORACIONES PENDIENTES (phase_3_deco - todas las no colocadas muestran su icono) */}
        {minigamePhase === "phase_3_deco" &&
          DECORACIONES_LIST.map((deco) => {
            if (placedDecoKeys.includes(deco.key)) return null;
            const pos = DECORACIONES_POSITIONS[deco.key];
            const dist = Math.hypot(playerPos.x - pos.x, playerPos.y - pos.y);
            const isNearThisSpot = dist < 9.0;

            return (
              <div
                key={`pending-deco-${deco.id}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: deco.width,
                  transform: "translate(-50%, -90%)",
                  zIndex: deco.key === "cartel3" ? 35 : 20,
                }}
                className="absolute pointer-events-none flex flex-col items-center select-none"
              >
                <div
                  className="absolute -top-[46%] left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none"
                  style={{
                    width: EXCLAMATION_ICON_WIDTH,
                    animation: "floatExclamation 1.4s ease-in-out infinite",
                  }}
                >
                  <img
                    src="/assets/juego/exclamacion.png"
                    alt="Ubicación disponible"
                    className="w-full h-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>

                {isNearThisSpot && (
                  <div
                    className="absolute -top-[70%] left-1/2 z-40 pointer-events-none flex flex-col items-center select-none"
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
            const dist = Math.hypot(playerPos.x - pos.x, playerPos.y - pos.y);
            const isNearThisSpot = dist < 9.0;
            const boletaWidth = BOLETAS_SIZES[index] || BOLETA_WIDTH;
            const casillaY = CASILLA_POSITIONS[index]?.y ?? 36.0;
            const isPlayerInFront = playerPos.y >= casillaY;

            return (
              <div
                key={`pending-boleta-${index}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: boletaWidth,
                  transform: "translate(-50%, -90%)",
                  zIndex: isPlayerInFront ? 21 : 29,
                }}
                className="absolute pointer-events-none flex flex-col items-center select-none"
              >
                <div
                  className="absolute -top-[46%] left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none"
                  style={{
                    width: EXCLAMATION_ICON_WIDTH,
                    animation: "floatExclamation 1.4s ease-in-out infinite",
                  }}
                >
                  <img
                    src="/assets/juego/exclamacion.png"
                    alt="Ubicación disponible"
                    className="w-full h-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>

                {isNearThisSpot && (
                  <div
                    className="absolute -top-[70%] left-1/2 z-40 pointer-events-none flex flex-col items-center select-none"
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
              {/* Sprite pixel art de la casilla electoral */}
              <img
                src="/assets/juego/casilla.png"
                alt={`Casilla Electoral ${index + 1}`}
                className="relative z-10 w-full h-auto object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          );
        })}

        {/* OBJETO COLOCADO: MESA DE VOTACIÓN CON URNAS (sin sombras artificiales) */}
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
            {/* Sprite pixel art de la mesa de votación */}
            <img
              src="/assets/juego/mesa.png"
              alt="Mesa Directiva de Casilla"
              className="relative z-10 w-full h-auto object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        )}

        {/* OBJETOS COLOCADOS: 4 DECORACIONES (Cartel 1, Cartel 2, Folleto, Letrero VOTA) (sin sombras artificiales) */}
        {DECORACIONES_LIST.map((deco) => {
          const isPlaced =
            minigamePhase === "phase_3_done" ||
            minigamePhase === "phase_4_boletas" ||
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
                zIndex: deco.key === "cartel3" ? 35 : (playerPos.y >= pos.y ? 18 : 28),
              }}
              className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
            >
              {/* Sprite pixel art de la decoracion */}
              <img
                src={deco.sprite}
                alt={deco.name}
                className="relative z-10 w-full h-auto object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          );
        })}

        {/* OBJETOS COLOCADOS: BOLETAS SOBRE LAS MESAS DE LAS MAMPARAS (sin sombras artificiales) */}
        {BOLETAS_POSITIONS.map((pos, index) => {
          const isPlaced =
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
      </div>

      {/* INTRO SPEECH BUBBLE DIALOGUE OVERLAY */}
      {dialogueState !== "initial_delay" && dialogueState !== "dismissed" && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-center pb-[1.8cqw] px-[2cqw] overflow-hidden select-none">
          <div className="relative z-10 w-[96%] pointer-events-auto">
            <PixelSpeechBubble
              speaker={language === "nah" ? "Inecito Cívica" : "Inecito"}
              messages={
                activeDialogue ||
                (language === "nah" ? INTRO_MESSAGES_NAH : INTRO_MESSAGES_ES)
              }
              actionKey="E"
              disabled={isPaused}
              isDismissing={dialogueState === "exiting"}
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
