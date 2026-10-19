import type {
  GenericNpc,
  GenericNpcAnimation,
  MamparaBoothConfig,
} from "./genericNpcTypes";

/**
 * Cantidad exacta de cuadros (frames) por animación del personaje genérico.
 * - back: 23 frames (generico-back00086400.png a ...00086422.png)
 * - front: 28 frames (generico-front00086400.png a ...00086427.png)
 * - idle: 1 frame estático (generico-idle00086400.png)
 */
export const GENERIC_NPC_FRAME_COUNTS: Record<GenericNpcAnimation, number> = {
  back: 23,
  front: 28,
  idle: 1,
};

/**
 * Resuelve la ruta relativa del frame correspondiente para el personaje genérico.
 */
export function getGenericNpcFrameSrc(
  animation: GenericNpcAnimation,
  frameIndex: number,
): string {
  if (animation === "idle") {
    return "/assets/juego/personajes/generico/generico-idle00086400.png";
  }

  const paddedIndex = String(frameIndex).padStart(2, "0");
  if (animation === "back") {
    return `/assets/juego/personajes/generico/back/generico-back000864${paddedIndex}.png`;
  }

  return `/assets/juego/personajes/generico/front/generico-front000864${paddedIndex}.png`;
}

/**
 * Cache en memoria de imágenes precargadas de los personajes genéricos.
 */
export const PRELOADED_GENERIC_NPC_IMAGES: Record<
  GenericNpcAnimation,
  HTMLImageElement[]
> = {
  back: [],
  front: [],
  idle: [],
};

/**
 * Precarga en segundo plano los frames de las animaciones del personaje genérico.
 */
export function preloadGenericNpcImages(): void {
  if (typeof window === "undefined") return;

  const animations: GenericNpcAnimation[] = ["back", "front", "idle"];
  for (const anim of animations) {
    if (PRELOADED_GENERIC_NPC_IMAGES[anim].length > 0) continue;

    const count = GENERIC_NPC_FRAME_COUNTS[anim];
    for (let i = 0; i < count; i++) {
      const img = new Image();
      img.src = getGenericNpcFrameSrc(anim, i);
      PRELOADED_GENERIC_NPC_IMAGES[anim].push(img);
    }
  }
}

/**
 * Libera la memoria de imágenes precargadas de los personajes genéricos al desmontar la escena.
 */
export function releaseGenericNpcImages(): void {
  const animations: GenericNpcAnimation[] = ["back", "front", "idle"];
  for (const anim of animations) {
    for (const img of PRELOADED_GENERIC_NPC_IMAGES[anim]) {
      img.src = "";
    }
    PRELOADED_GENERIC_NPC_IMAGES[anim] = [];
  }
}

/**
 * Valores por defecto configurables para el comportamiento de los NPCs genéricos.
 */
export const GENERIC_NPC_DEFAULTS = {
  /** Velocidad de desplazamiento (% de pantalla por segundo) */
  speed: 12.0,
  /** Tiempo por defecto de permanencia en la mampara votando (ms) */
  defaultVotingWaitTimeMs: 4500,
  /** Rango mínimo de tiempo para votar (ms) */
  minVotingWaitTimeMs: 3500,
  /** Rango máximo de tiempo para votar (ms) */
  maxVotingWaitTimeMs: 6500,
  /** Ancho porcentual del sprite en pantalla (alineado al del jugador 6.5%) */
  spriteWidthPercent: "6.5%",
};

/**
 * Configuración inicial de las cinco mamparas de votación con coordenadas reales del juego.
 *
 * Coordenadas de mamparas (GameplayScene / Chapter2Scene):
 * - Mampara 1: X = 32.0%, Y = 36.0%
 * - Mampara 2: X = 42.0%, Y = 36.0%
 * - Mampara 3: X = 52.0%, Y = 36.0%
 * - Mampara 4: X = 62.0%, Y = 36.0%
 * - Mampara 5: X = 72.0%, Y = 36.0%
 *
 * Puntos de destino: Y = 36.5% (frente a la mampara, simulando la acción de votar)
 * Puntos de spawn y salida: Y = 106.0% (fuera del borde inferior visible de la explanada)
 */
export const INITIAL_MAMPARAS_CONFIG: MamparaBoothConfig[] = [
  {
    id: 1,
    name: "Mampara 1",
    boothPosition: { x: 32.0, y: 36.0 },
    targetPosition: { x: 32.0, y: 36.5 },
    spawnPoint: { x: 32.0, y: 106.0 },
    exitPoint: { x: 32.0, y: 106.0 },
    isOccupied: false,
    occupiedByNpcId: null,
    spawnTimerConfig: {
      nextSpawnDelayMs: 0,
      lastSpawnTimestampMs: 0,
      minDelayMs: 3000,
      maxDelayMs: 8000,
      isEnabled: false, // Inactivo en Fase 1 según especificación
    },
  },
  {
    id: 2,
    name: "Mampara 2",
    boothPosition: { x: 42.0, y: 36.0 },
    targetPosition: { x: 42.0, y: 36.5 },
    spawnPoint: { x: 42.0, y: 106.0 },
    exitPoint: { x: 42.0, y: 106.0 },
    isOccupied: false,
    occupiedByNpcId: null,
    spawnTimerConfig: {
      nextSpawnDelayMs: 0,
      lastSpawnTimestampMs: 0,
      minDelayMs: 4000,
      maxDelayMs: 10000,
      isEnabled: false, // Inactivo en Fase 1 según especificación
    },
  },
  {
    id: 3,
    name: "Mampara 3",
    boothPosition: { x: 52.0, y: 36.0 },
    targetPosition: { x: 52.0, y: 36.5 },
    spawnPoint: { x: 52.0, y: 106.0 },
    exitPoint: { x: 52.0, y: 106.0 },
    isOccupied: false,
    occupiedByNpcId: null,
    spawnTimerConfig: {
      nextSpawnDelayMs: 0,
      lastSpawnTimestampMs: 0,
      minDelayMs: 3500,
      maxDelayMs: 9000,
      isEnabled: false, // Inactivo en Fase 1 según especificación
    },
  },
  {
    id: 4,
    name: "Mampara 4",
    boothPosition: { x: 62.0, y: 36.0 },
    targetPosition: { x: 62.0, y: 36.5 },
    spawnPoint: { x: 62.0, y: 106.0 },
    exitPoint: { x: 62.0, y: 106.0 },
    isOccupied: false,
    occupiedByNpcId: null,
    spawnTimerConfig: {
      nextSpawnDelayMs: 0,
      lastSpawnTimestampMs: 0,
      minDelayMs: 4500,
      maxDelayMs: 11000,
      isEnabled: false, // Inactivo en Fase 1 según especificación
    },
  },
  {
    id: 5,
    name: "Mampara 5",
    boothPosition: { x: 72.0, y: 36.0 },
    targetPosition: { x: 72.0, y: 36.5 },
    spawnPoint: { x: 72.0, y: 106.0 },
    exitPoint: { x: 72.0, y: 106.0 },
    isOccupied: false,
    occupiedByNpcId: null,
    spawnTimerConfig: {
      nextSpawnDelayMs: 0,
      lastSpawnTimestampMs: 0,
      minDelayMs: 5000,
      maxDelayMs: 12000,
      isEnabled: false, // Inactivo en Fase 1 según especificación
    },
  },
];

/**
 * Fábrica para instanciar un nuevo NPC genérico asignado a una mampara.
 * Útil para pruebas unitarias y para la posterior Fase 2.
 */
export function createGenericNpcInstance(
  mampara: MamparaBoothConfig,
  customId?: string,
  votingWaitTimeMs: number = GENERIC_NPC_DEFAULTS.defaultVotingWaitTimeMs,
): GenericNpc {
  return {
    id: customId ?? `npc-gen-${mampara.id}-${Date.now()}`,
    position: {
      x: mampara.spawnPoint.x,
      y: mampara.spawnPoint.y,
    },
    assignedMamparaId: mampara.id,
    currentAnimation: "back",
    state: "ENTERING",
    speed: GENERIC_NPC_DEFAULTS.speed,
    votingWaitTimeMs,
    elapsedInStateMs: 0,
    isActive: true,
  };
}
