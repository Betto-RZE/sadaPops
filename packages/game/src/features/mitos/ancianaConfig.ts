/**
 * Configuración, recursos y constantes para el personaje de la Anciana (Abuela).
 * Primer personaje narrativo en el Capítulo 2: Desmintiendo mitos.
 */

export type AncianaAnimation = "side" | "front" | "back";

/**
 * Cantidad exacta de cuadros (frames) por animación de la anciana:
 * - side: 36 frames (anciana-side00086400.png a ...00086435.png)
 * - front: 29 frames (anciana-front00086400.png a ...00086428.png)
 * - back: 28 frames (anciana-back00086400.png a ...00086427.png)
 */
export const ANCIANA_FRAME_COUNTS: Record<AncianaAnimation, number> = {
  side: 36,
  front: 29,
  back: 28,
};

/**
 * Resuelve la ruta pública del frame correspondiente para la anciana.
 */
export function getAncianaFrameSrc(
  animation: AncianaAnimation,
  frameIndex: number,
): string {
  const paddedIndex = String(frameIndex).padStart(2, "0");
  return `/assets/juego/personajes/anciana/${animation}/anciana-${animation}000864${paddedIndex}.png`;
}

/**
 * Caché en memoria de imágenes precargadas de la anciana.
 */
export const PRELOADED_ANCIANA_IMAGES: Record<
  AncianaAnimation,
  HTMLImageElement[]
> = {
  side: [],
  front: [],
  back: [],
};

/**
 * Precarga en segundo plano los frames de las animaciones de la anciana.
 */
export function preloadAncianaImages(): void {
  if (typeof window === "undefined") return;

  const animations: AncianaAnimation[] = ["side", "front", "back"];
  for (const anim of animations) {
    if (PRELOADED_ANCIANA_IMAGES[anim].length > 0) continue;

    const count = ANCIANA_FRAME_COUNTS[anim];
    for (let i = 0; i < count; i++) {
      const img = new Image();
      img.src = getAncianaFrameSrc(anim, i);
      PRELOADED_ANCIANA_IMAGES[anim].push(img);
    }
  }
}

/**
 * Libera la memoria de imágenes precargadas de la anciana al desmontar la escena.
 */
export function releaseAncianaImages(): void {
  const animations: AncianaAnimation[] = ["side", "front", "back"];
  for (const anim of animations) {
    for (const img of PRELOADED_ANCIANA_IMAGES[anim]) {
      img.src = "";
    }
    PRELOADED_ANCIANA_IMAGES[anim] = [];
  }
}

/**
 * Valores por defecto y calibración espacial del recorrido de la anciana.
 *
 * Camino derecho de la explanada (PLAZA_BOUNDS):
 * - rightPathTopY: 52%, rightPathBottomY: 71%, center ≈ 62.5%
 *
 * Mesa directiva de casilla (MESA_POSITION & OBJECT_COLLISION_BOXES):
 * - Posición visual: { x: 19.0, y: 74.0 }
 * - Borde derecho de colisión a Y = 66.0%: X ≈ 23.75%
 * - Posición frente a la mesa (centrada y pegada de lado derecho): { x: 26.0, y: 66.0 }
 */
export const ANCIANA_DEFAULTS = {
  /** Posición de inicio en el camino derecho (fuera/borde del escenario) */
  startPosition: { x: 102.0, y: 66.0 },
  /** Posición final en línea recta frente a la mesa (de lado derecho, pegada y centrada) */
  targetPosition: { x: 26.0, y: 66.0 },
  /** Velocidad de caminata en línea recta (% de pantalla por segundo) */
  speed: 9.0,
  /** Ancho porcentual del sprite en pantalla (proporción uniforme 6.5%) */
  spriteWidthPercent: "6.5%",
  /** Semi-ancho de la caja de pies para colisión física (%) */
  halfWidth: 2.8,
  /** Semi-alto de la caja de pies para colisión física (%) */
  halfHeight: 2.2,
  /** Tiempo de espera tras terminar IDLE del primer NPC antes de aparecer (4000 ms = 4 segundos) */
  spawnDelayMs: 4000,
};

/**
 * Función pura que calcula el progreso de la cuenta regresiva antes de que aparezca la anciana.
 */
export function updateAncianaSpawnDelay({
  isTriggered,
  elapsedMs,
  delayMs = ANCIANA_DEFAULTS.spawnDelayMs,
  dtSeconds,
}: {
  isTriggered: boolean;
  elapsedMs: number;
  delayMs?: number;
  dtSeconds: number;
}): { newElapsedMs: number; shouldSpawn: boolean } {
  if (!isTriggered) {
    return { newElapsedMs: 0, shouldSpawn: false };
  }
  const newElapsedMs = elapsedMs + dtSeconds * 1000;
  return {
    newElapsedMs,
    shouldSpawn: newElapsedMs >= delayMs,
  };
}

/**
 * Función pura que calcula el siguiente paso de movimiento en línea recta de la anciana.
 * Útil para la simulación del hook y para pruebas unitarias deterministas sin DOM.
 */
export function stepAncianaMovement({
  currentPos,
  targetPos = ANCIANA_DEFAULTS.targetPosition,
  speed = ANCIANA_DEFAULTS.speed,
  dt,
}: {
  currentPos: { x: number; y: number };
  targetPos?: { x: number; y: number };
  speed?: number;
  dt: number;
}): { nextPos: { x: number; y: number }; isArrived: boolean } {
  if (currentPos.x <= targetPos.x) {
    return {
      nextPos: { x: targetPos.x, y: targetPos.y },
      isArrived: true,
    };
  }

  const nextX = Math.max(targetPos.x, currentPos.x - speed * dt);
  const isArrived = nextX <= targetPos.x;

  return {
    nextPos: { x: nextX, y: targetPos.y },
    isArrived,
  };
}

/**
 * Mensajes del globo de texto al llegar la anciana a la mesa directiva (Español).
 */
export const ANCIANA_ARRIVAL_MESSAGES_ES: string[] = [
  "¡Oh! Parece que una señora se acercó a nuestra mesa.",
  "¡Vamos a ver en qué podemos ayudarla!",
];

/**
 * Mensajes del globo de texto al llegar la anciana a la mesa directiva (Náhuatl).
 */
export const ANCIANA_ARRIVAL_MESSAGES_NAH: string[] = [
  "¡Oh! Tikitah se tenantzin omopacho itech tomexa.",
  "¡Tikitatij tlen ika uelis tikpalehuiseh!",
];
