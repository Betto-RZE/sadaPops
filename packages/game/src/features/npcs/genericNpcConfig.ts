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
  defaultVotingWaitTimeMs: 6000,
  /** Rango mínimo de tiempo para votar (ms) */
  minVotingWaitTimeMs: 4000,
  /** Rango máximo de tiempo para votar (ms) */
  maxVotingWaitTimeMs: 8000,
  /** Rango mínimo de espera para la aparición de nuevos NPCs en una mampara (ms) */
  minSpawnDelayMs: 3000,
  /** Rango máximo de espera para la aparición de nuevos NPCs en una mampara (ms) */
  maxSpawnDelayMs: 15000,
  /** Ancho porcentual del sprite en pantalla (alineado al del jugador 6.5%) */
  spriteWidthPercent: "6.5%",
};

/**
 * Genera un tiempo de votación aleatorio continuo en el intervalo [minMs, maxMs] milisegundos.
 * Por defecto en [4000, 8000] ms con decimales según los requisitos de la Fase 3.
 */
export function getRandomVotingTimeMs(
  minMs: number = GENERIC_NPC_DEFAULTS.minVotingWaitTimeMs,
  maxMs: number = GENERIC_NPC_DEFAULTS.maxVotingWaitTimeMs,
): number {
  return minMs + Math.random() * (maxMs - minMs);
}

/**
 * Genera un tiempo de espera aleatorio continuo para el spawn de un NPC en una mampara disponible.
 * Por defecto en [3000, 15000] ms (3 a 15 segundos) con decimales.
 */
export function getRandomSpawnDelayMs(
  minMs: number = GENERIC_NPC_DEFAULTS.minSpawnDelayMs,
  maxMs: number = GENERIC_NPC_DEFAULTS.maxSpawnDelayMs,
): number {
  return minMs + Math.random() * (maxMs - minMs);
}

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
      maxDelayMs: 15000,
      isEnabled: false,
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
      minDelayMs: 3000,
      maxDelayMs: 15000,
      isEnabled: false,
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
      minDelayMs: 3000,
      maxDelayMs: 15000,
      isEnabled: false,
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
      minDelayMs: 3000,
      maxDelayMs: 15000,
      isEnabled: false,
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
      minDelayMs: 3000,
      maxDelayMs: 15000,
      isEnabled: false,
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
  votingWaitTimeMs?: number,
): GenericNpc {
  const chosenWaitTime =
    typeof votingWaitTimeMs === "number" && votingWaitTimeMs > 0
      ? votingWaitTimeMs
      : getRandomVotingTimeMs();

  return {
    id: customId ?? `npc-gen-${mampara.id}-${Date.now()}`,
    position: {
      x: mampara.spawnPoint.x,
      y: mampara.spawnPoint.y,
    },
    assignedMamparaId: mampara.id,
    currentAnimation: "back",
    state: "ENTERING",
    speed: GENERIC_NPC_WALK_SPEED,
    votingWaitTimeMs: chosenWaitTime,
    elapsedInStateMs: 0,
    isActive: true,
  };
}

/**
 * Velocidad constante de caminata para los NPCs genéricos (% de pantalla por segundo).
 * Configurable fácilmente para ajustar el ritmo visual.
 */
export const GENERIC_NPC_WALK_SPEED = 12.0;

/**
 * Actualiza el movimiento y estado de un NPC genérico en función del tiempo transcurrido (dtSeconds).
 *
 * Fase 3 - Ciclo completo:
 * - ENTERING: avanza verticalmente hacia targetPosition.y con animación 'back'.
 *   Al llegar, fija coordenadas, conserva o genera votingWaitTimeMs [4000, 8000] ms,
 *   cambia a 'IDLE' y activa 'idle'.
 * - IDLE: permanece detenido en la mampara durante votingWaitTimeMs ms con animación 'idle'.
 *   Al terminar el tiempo, transiciona a 'LEAVING', activa 'front' y comienza el descenso.
 * - LEAVING: desciende verticalmente hacia exitPoint.y con animación 'front'.
 *   Al alcanzar exitPoint.y (106.0%), fija coordenadas y transiciona a 'FINISHED'.
 * - FINISHED: el NPC ha salido completamente de la explanada y está listo para ser retirado.
 */
export function updateGenericNpc(
  npc: GenericNpc,
  targetMampara: MamparaBoothConfig,
  dtSeconds: number,
): GenericNpc {
  if (!npc.isActive || npc.state === "FINISHED") {
    return { ...npc, isActive: false, state: "FINISHED" };
  }

  // 1. Estado ENTERING: caminando desde abajo hacia la mampara
  if (npc.state === "ENTERING") {
    const targetY = targetMampara.targetPosition.y;
    const step = npc.speed * dtSeconds;
    const nextY = npc.position.y - step;

    // Llegada a la mampara: detección exacta sin sobrepaso ni oscilaciones
    if (nextY <= targetY) {
      const timeToTarget = (npc.position.y - targetY) / npc.speed;
      const leftoverDt = Math.max(0, dtSeconds - timeToTarget);
      const votingTime =
        npc.votingWaitTimeMs > 0
          ? npc.votingWaitTimeMs
          : getRandomVotingTimeMs();

      return {
        ...npc,
        position: {
          x: targetMampara.targetPosition.x,
          y: targetY,
        },
        state: "IDLE",
        currentAnimation: "idle",
        votingWaitTimeMs: votingTime,
        elapsedInStateMs: leftoverDt * 1000,
      };
    }

    return {
      ...npc,
      position: {
        ...npc.position,
        y: nextY,
      },
      currentAnimation: "back",
      elapsedInStateMs: npc.elapsedInStateMs + dtSeconds * 1000,
    };
  }

  // 2. Estado IDLE: detenido frente a la mampara simulando la acción de votar
  if (npc.state === "IDLE") {
    const newElapsed = npc.elapsedInStateMs + dtSeconds * 1000;

    // Aún en tiempo de votación: permanece detenido e inmóvil
    if (newElapsed < npc.votingWaitTimeMs) {
      return {
        ...npc,
        elapsedInStateMs: newElapsed,
        currentAnimation: "idle",
      };
    }

    // Cumplió el tiempo de votación: transiciona a LEAVING e inicia el descenso
    const overdueMs = newElapsed - npc.votingWaitTimeMs;
    const carryDt = overdueMs / 1000;
    const exitY = targetMampara.exitPoint.y;
    const stepDown = npc.speed * carryDt;
    const nextY = npc.position.y + stepDown;

    if (nextY >= exitY) {
      return {
        ...npc,
        position: {
          x: targetMampara.exitPoint.x,
          y: exitY,
        },
        state: "FINISHED",
        currentAnimation: "front",
        elapsedInStateMs: overdueMs,
        isActive: false,
      };
    }

    return {
      ...npc,
      position: {
        x: targetMampara.exitPoint.x,
        y: nextY,
      },
      state: "LEAVING",
      currentAnimation: "front",
      elapsedInStateMs: overdueMs,
    };
  }

  // 3. Estado LEAVING: caminando hacia abajo rumbo a la salida
  if (npc.state === "LEAVING") {
    const exitY = targetMampara.exitPoint.y;
    const step = npc.speed * dtSeconds;
    const nextY = npc.position.y + step;

    // Llegó al punto de salida fuera de la pantalla visible: transiciona a FINISHED
    if (nextY >= exitY) {
      return {
        ...npc,
        position: {
          x: targetMampara.exitPoint.x,
          y: exitY,
        },
        state: "FINISHED",
        currentAnimation: "front",
        elapsedInStateMs: npc.elapsedInStateMs + dtSeconds * 1000,
        isActive: false,
      };
    }

    return {
      ...npc,
      position: {
        x: targetMampara.exitPoint.x,
        y: nextY,
      },
      currentAnimation: "front",
      elapsedInStateMs: npc.elapsedInStateMs + dtSeconds * 1000,
    };
  }

  return npc;
}

export interface NpcSimulationState {
  npcs: GenericNpc[];
  mamparas: MamparaBoothConfig[];
  isGlobalSystemActive: boolean;
  npcIdCounter: number;
}

export interface NpcSimulationOptions {
  getRandomSpawnDelay?: (mamparaId: number) => number;
  getRandomVotingTime?: (mamparaId: number) => number;
}

export interface NpcSimulationResult {
  npcs: GenericNpc[];
  mamparas: MamparaBoothConfig[];
  isGlobalSystemActive: boolean;
  npcIdCounter: number;
  justActivatedGlobal: boolean;
  finishedMamparaIds: number[];
  newSpawnIds: string[];
}

/**
 * Función pura que calcula un paso de simulación para todos los NPCs genéricos y las cinco mamparas.
 * Gestiona el movimiento dt, la detección de la activación global (IDLE -> LEAVING del primer NPC),
 * los temporizadores independientes de 1 a 3 segundos de cada mampara y el control de ocupación.
 */
export function simulateNpcsStep(
  state: NpcSimulationState,
  dtSeconds: number,
  currentTimeMs: number = 0,
  options?: NpcSimulationOptions,
): NpcSimulationResult {
  const getSpawnDelay =
    options?.getRandomSpawnDelay ?? (() => getRandomSpawnDelayMs());
  const getVotingTime =
    options?.getRandomVotingTime ?? (() => getRandomVotingTimeMs());

  // Optimización de retorno temprano (Fase 5.4):
  // Si el sistema global aún no se activa y no hay ningún NPC en escena,
  // retornar el estado inmediatamente sin clonaciones de arreglos ni asignaciones de memoria
  if (!state.isGlobalSystemActive && state.npcs.length === 0) {
    return {
      npcs: state.npcs,
      mamparas: state.mamparas,
      isGlobalSystemActive: false,
      npcIdCounter: state.npcIdCounter,
      justActivatedGlobal: false,
      finishedMamparaIds: [],
      newSpawnIds: [],
    };
  }

  let isGlobalActive = state.isGlobalSystemActive;
  let justActivatedGlobal = false;
  let mamparas = [...state.mamparas];
  let npcIdCounter = state.npcIdCounter;
  const previousList = state.npcs;
  let updatedNpcs: GenericNpc[] = [];
  const finishedMamparaIds: number[] = [];
  const newSpawnIds: string[] = [];

  // --- A. Actualización de NPCs activos ---
  for (const npc of previousList) {
    const targetMampara =
      mamparas.find((m) => m.id === npc.assignedMamparaId) ||
      INITIAL_MAMPARAS_CONFIG[npc.assignedMamparaId - 1];

    const prevState = npc.state;
    const updated = updateGenericNpc(npc, targetMampara, dtSeconds);

    // Condición obligatoria de activación global:
    // Ocurre exactamente cuando el primer NPC de la mampara 3 cambia de IDLE a LEAVING
    if (
      !isGlobalActive &&
      npc.id === "npc-gen-mampara-3" &&
      prevState === "IDLE" &&
      updated.state === "LEAVING"
    ) {
      isGlobalActive = true;
      justActivatedGlobal = true;

      // Inicializar temporizadores de las mamparas desocupadas (1, 2, 4 y 5):
      // Cada una genera su propio tiempo independiente de 1 a 3 segundos
      mamparas = mamparas.map((m) => {
        if (!m.isOccupied && m.id !== 3) {
          return {
            ...m,
            spawnTimerConfig: {
              ...m.spawnTimerConfig,
              isEnabled: true,
              nextSpawnDelayMs: getSpawnDelay(m.id),
              lastSpawnTimestampMs: currentTimeMs,
            },
          };
        }
        // Mampara 3 permanece ocupada y se integrará al ciclo cuando concluya su salida
        return {
          ...m,
          spawnTimerConfig: {
            ...m.spawnTimerConfig,
            isEnabled: true,
            nextSpawnDelayMs: 0,
          },
        };
      });
    }

    if (updated.state === "FINISHED") {
      finishedMamparaIds.push(updated.assignedMamparaId);
    } else {
      updatedNpcs.push(updated);
    }
  }

  // --- B. Liberar mamparas de los NPCs que llegaron a FINISHED ---
  if (finishedMamparaIds.length > 0) {
    const finishedSet = new Set(finishedMamparaIds);
    mamparas = mamparas.map((m) => {
      if (finishedSet.has(m.id)) {
        return {
          ...m,
          isOccupied: false,
          occupiedByNpcId: null,
          spawnTimerConfig: {
            ...m.spawnTimerConfig,
            isEnabled: isGlobalActive,
            // Comienza su temporizador de 1 a 3 segundos para el siguiente ciclo
            nextSpawnDelayMs: isGlobalActive ? getSpawnDelay(m.id) : 0,
            lastSpawnTimestampMs: currentTimeMs,
          },
        };
      }
      return m;
    });
  }

  // --- C. Si el sistema global está activo, descontar temporizadores y spawnear nuevos NPCs ---
  if (isGlobalActive) {
    const newSpawns: GenericNpc[] = [];

    mamparas = mamparas.map((m) => {
      // Solo mamparas habilitadas que no estén ocupadas
      if (m.spawnTimerConfig.isEnabled && !m.isOccupied) {
        const remainingDelay =
          m.spawnTimerConfig.nextSpawnDelayMs - dtSeconds * 1000;

        if (remainingDelay <= 0) {
          // Temporizador de 1 a 3 segundos cumplido: generar nuevo NPC exclusivo
          npcIdCounter += 1;
          const newNpcId = `npc-gen-${m.id}-${npcIdCounter}`;
          const votingTime = getVotingTime(m.id);
          const newNpc = createGenericNpcInstance(m, newNpcId, votingTime);

          newSpawns.push(newNpc);
          newSpawnIds.push(newNpc.id);

          return {
            ...m,
            isOccupied: true,
            occupiedByNpcId: newNpc.id,
            spawnTimerConfig: {
              ...m.spawnTimerConfig,
              nextSpawnDelayMs: 0,
              lastSpawnTimestampMs: currentTimeMs,
            },
          };
        }

        return {
          ...m,
          spawnTimerConfig: {
            ...m.spawnTimerConfig,
            nextSpawnDelayMs: remainingDelay,
          },
        };
      }

      return m;
    });

    if (newSpawns.length > 0) {
      updatedNpcs = [...updatedNpcs, ...newSpawns];
    }
  }

  return {
    npcs: updatedNpcs,
    mamparas,
    isGlobalSystemActive: isGlobalActive,
    npcIdCounter,
    justActivatedGlobal,
    finishedMamparaIds,
    newSpawnIds,
  };
}


