import type { GenericNpc } from "./genericNpcTypes";

/**
 * Parámetros configurables de colisión física para los NPCs genéricos y el protagonista.
 * Dimensiones basadas en la zona de los pies y la parte inferior del cuerpo (anclaje translate(-50%, -90%)).
 */
export const NPC_COLLISION_DEFAULTS = {
  /** Semi-ancho de la caja de pies del NPC (% de espacio mundial) */
  npcHalfWidth: 2.8,
  /** Semi-alto de la caja de pies del NPC (% de espacio mundial) */
  npcHalfHeight: 2.2,
  /** Semi-ancho de la caja de pies del protagonista (% de espacio mundial) */
  playerHalfWidth: 2.8,
  /** Semi-alto de la caja de pies del protagonista (% de espacio mundial) */
  playerHalfHeight: 2.2,
  /** Velocidad constante de desplazamiento lateral de empuje (% de pantalla por segundo) */
  pushSpeed: 16.0,
  /** Separación horizontal mínima (% de pantalla) para considerar liberada la zona de contacto (histéresis) */
  separationThreshold: 6.0,
};

export interface BoundingBox2D {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface CharacterOverlapResult {
  isColliding: boolean;
  overlapX: number;
  overlapY: number;
}

export interface ActivePushState {
  npcId: string;
  dir: number; // +1 = derecha, -1 = izquierda
}

export interface NpcPushVectorResult {
  /** Vector unitario normalizado de desplazamiento del protagonista, o null si no hay empuje */
  pushVector: { vx: number; vy: number } | null;
  /** NPC responsable del empuje */
  pushingNpc: GenericNpc | null;
  /** Estado actualizado de histéresis para evitar oscilaciones en cuadros subsiguientes */
  activePushState: ActivePushState | null;
}

/**
 * Calcula la caja AABB de los pies de un NPC según su posición mundial y márgenes.
 */
export function getNpcBoundingBox(
  position: { x: number; y: number },
  halfWidth: number = NPC_COLLISION_DEFAULTS.npcHalfWidth,
  halfHeight: number = NPC_COLLISION_DEFAULTS.npcHalfHeight,
): BoundingBox2D {
  return {
    minX: position.x - halfWidth,
    maxX: position.x + halfWidth,
    minY: position.y - halfHeight,
    maxY: position.y + halfHeight,
  };
}

/**
 * Calcula la caja AABB de los pies del protagonista según su posición mundial y márgenes.
 */
export function getPlayerBoundingBox(
  position: { x: number; y: number },
  halfWidth: number = NPC_COLLISION_DEFAULTS.playerHalfWidth,
  halfHeight: number = NPC_COLLISION_DEFAULTS.playerHalfHeight,
): BoundingBox2D {
  return {
    minX: position.x - halfWidth,
    maxX: position.x + halfWidth,
    minY: position.y - halfHeight,
    maxY: position.y + halfHeight,
  };
}

/**
 * Evalúa si dos personajes solapan sus cajas de colisión en la base de sus pies.
 */
export function checkCharactersOverlap(
  posA: { x: number; y: number },
  posB: { x: number; y: number },
  halfWidthA: number = NPC_COLLISION_DEFAULTS.playerHalfWidth,
  halfHeightA: number = NPC_COLLISION_DEFAULTS.playerHalfHeight,
  halfWidthB: number = NPC_COLLISION_DEFAULTS.npcHalfWidth,
  halfHeightB: number = NPC_COLLISION_DEFAULTS.npcHalfHeight,
): CharacterOverlapResult {
  const deltaX = Math.abs(posA.x - posB.x);
  const deltaY = Math.abs(posA.y - posB.y);
  const totalHalfW = halfWidthA + halfWidthB;
  const totalHalfH = halfHeightA + halfHeightB;

  if (deltaX < totalHalfW && deltaY < totalHalfH) {
    return {
      isColliding: true,
      overlapX: totalHalfW - deltaX,
      overlapY: totalHalfH - deltaY,
    };
  }

  return {
    isColliding: false,
    overlapX: 0,
    overlapY: 0,
  };
}

export interface BlockedByNpcOptions {
  excludeNpcId?: string;
  states?: Array<"ENTERING" | "IDLE" | "LEAVING">;
  playerHalfW?: number;
  playerHalfH?: number;
  npcHalfW?: number;
  npcHalfH?: number;
}

/**
 * Comprueba si una posición candidata del jugador intersecta la caja de algún NPC activo.
 * Permite filtrar por estados y excluir el NPC que esté empujando al jugador para no atraparlo.
 */
export function isPositionBlockedByNpc(
  testPos: { x: number; y: number },
  npcs: GenericNpc[],
  options?: BlockedByNpcOptions,
): boolean {
  const playerHalfW =
    options?.playerHalfW ?? NPC_COLLISION_DEFAULTS.playerHalfWidth;
  const playerHalfH =
    options?.playerHalfH ?? NPC_COLLISION_DEFAULTS.playerHalfHeight;
  const npcHalfW = options?.npcHalfW ?? NPC_COLLISION_DEFAULTS.npcHalfWidth;
  const npcHalfH = options?.npcHalfH ?? NPC_COLLISION_DEFAULTS.npcHalfHeight;
  const allowedStates = options?.states;

  for (const npc of npcs) {
    if (!npc.isActive) continue;
    if (options?.excludeNpcId && npc.id === options.excludeNpcId) continue;
    if (allowedStates && !allowedStates.includes(npc.state as any)) continue;

    const overlap = checkCharactersOverlap(
      testPos,
      npc.position,
      playerHalfW,
      playerHalfH,
      npcHalfW,
      npcHalfH,
    );
    if (overlap.isColliding) {
      return true;
    }
  }
  return false;
}

/**
 * Comprueba si una posición candidata del jugador intersecta la caja de algún NPC en estado IDLE.
 * Los NPCs en IDLE se comportan como obstáculos sólidos estáticos.
 */
export function isPositionBlockedByIdleNpc(
  testPos: { x: number; y: number },
  npcs: GenericNpc[],
  playerHalfW: number = NPC_COLLISION_DEFAULTS.playerHalfWidth,
  playerHalfH: number = NPC_COLLISION_DEFAULTS.playerHalfHeight,
): boolean {
  return isPositionBlockedByNpc(testPos, npcs, {
    states: ["IDLE"],
    playerHalfW,
    playerHalfH,
  });
}

export interface CalculatePushVectorParams {
  playerPos: { x: number; y: number };
  npcs: GenericNpc[];
  isPositionWalkable: (x: number, y: number) => boolean;
  activePushState?: ActivePushState | null;
  dtSeconds?: number;
  pushSpeed?: number;
}

/**
 * Calcula el vector de desplazamiento lateral progresivo cuando un NPC genérico en movimiento
 * (estados ENTERING o LEAVING) colisiona con el protagonista.
 *
 * Características:
 * - Selección determinista de la dirección (derecha/izquierda).
 * - Histéresis activa para evitar alternancia u oscilación en cuadros consecutivos.
 * - Validación estricta con isPositionWalkable para no atravesar mamparas, mesa ni bordes.
 * - Prueba de ruta alternativa (lado opuesto o diagonal inferior hacia la explanada) si el preferente está bloqueado.
 * - Soporte para múltiples NPCs (prioriza la colisión más severa).
 * - Exclusión de NPCs en FINISHED e IDLE (los IDLE son obstáculos, no generan empuje activo).
 */
export function getNpcLateralPushVector({
  playerPos,
  npcs,
  isPositionWalkable,
  activePushState = null,
  dtSeconds = 0.016,
  pushSpeed = NPC_COLLISION_DEFAULTS.pushSpeed,
}: CalculatePushVectorParams): NpcPushVectorResult {
  // 1. Filtrar NPCs que pueden empujar activamente (ENTERING o LEAVING)
  const activeMovingNpcs = npcs.filter(
    (npc) =>
      npc.isActive &&
      (npc.state === "ENTERING" || npc.state === "LEAVING"),
  );

  if (activeMovingNpcs.length === 0) {
    return {
      pushVector: null,
      pushingNpc: null,
      activePushState: null,
    };
  }

  // 2. Evaluar solapamientos con el protagonista con filtrado temprano escalar
  const totalHalfW =
    NPC_COLLISION_DEFAULTS.playerHalfWidth +
    NPC_COLLISION_DEFAULTS.npcHalfWidth; // 5.6%
  const totalHalfH =
    NPC_COLLISION_DEFAULTS.playerHalfHeight +
    NPC_COLLISION_DEFAULTS.npcHalfHeight; // 4.4%

  const collidingEntries: Array<{
    npc: GenericNpc;
    overlapX: number;
    overlapY: number;
    score: number;
  }> = [];

  for (const npc of activeMovingNpcs) {
    const deltaX = Math.abs(playerPos.x - npc.position.x);
    if (deltaX >= totalHalfW) continue; // Descarte temprano en X

    const deltaY = Math.abs(playerPos.y - npc.position.y);
    if (deltaY >= totalHalfH) continue; // Descarte temprano en Y

    const overlapX = totalHalfW - deltaX;
    const overlapY = totalHalfH - deltaY;

    collidingEntries.push({
      npc,
      overlapX,
      overlapY,
      score: overlapX * overlapY,
    });
  }

  // Si no hay colisión directa, verificar si aún estamos en zona de histéresis con el NPC anterior
  if (collidingEntries.length === 0) {
    if (activePushState) {
      const prevNpc = activeMovingNpcs.find(
        (n) => n.id === activePushState.npcId,
      );
      if (prevNpc) {
        const deltaX = Math.abs(playerPos.x - prevNpc.position.x);
        const deltaY = Math.abs(playerPos.y - prevNpc.position.y);

        // Si aún está en la misma franja vertical y dentro del margen de separación, mantener empuje suave
        if (
          deltaX < NPC_COLLISION_DEFAULTS.separationThreshold &&
          deltaY < totalHalfH
        ) {
          const step = pushSpeed * dtSeconds;
          const targetX = playerPos.x + activePushState.dir * step;
          if (
            isPositionWalkable(targetX, playerPos.y) &&
            !isPositionBlockedByIdleNpc({ x: targetX, y: playerPos.y }, npcs)
          ) {
            return {
              pushVector: { vx: activePushState.dir, vy: 0 },
              pushingNpc: prevNpc,
              activePushState,
            };
          }
        }
      }
    }

    return {
      pushVector: null,
      pushingNpc: null,
      activePushState: null,
    };
  }

  // 3. Priorizar el NPC con mayor solapamiento
  collidingEntries.sort((a, b) => b.score - a.score);
  const primary = collidingEntries[0];
  const primaryNpc = primary.npc;

  // 4. Determinar la dirección horizontal preferente
  let preferredDir: number;
  if (activePushState && activePushState.npcId === primaryNpc.id) {
    // Mantener la dirección establecida para evitar oscilaciones
    preferredDir = activePushState.dir;
  } else {
    // Regla determinista: si playerPos.x >= npc.position.x preferir derecha (+1), sino izquierda (-1).
    // Si están exactamente centrados (playerPos.x === npc.position.x), se desvía deterministamente a la derecha (+1).
    preferredDir = playerPos.x >= primaryNpc.position.x ? 1 : -1;
  }

  const step = pushSpeed * dtSeconds;
  const otherNpcs = npcs.filter((n) => n.id !== primaryNpc.id);

  // Helper para verificar que una posición es válida y no choca contra otros obstáculos ni NPCs en IDLE
  const isCandidateSafe = (testX: number, testY: number): boolean => {
    if (!isPositionWalkable(testX, testY)) return false;
    if (isPositionBlockedByIdleNpc({ x: testX, y: testY }, otherNpcs))
      return false;

    // Verificar que no se empuje hacia otro NPC en movimiento agravando la colisión
    for (const other of otherNpcs) {
      if (
        other.isActive &&
        (other.state === "ENTERING" || other.state === "LEAVING")
      ) {
        const dx = Math.abs(testX - other.position.x);
        if (dx >= totalHalfW) continue;
        const dy = Math.abs(testY - other.position.y);
        if (dy >= totalHalfH) continue;

        const overlapX = totalHalfW - dx;
        if (overlapX > primary.overlapX) {
          return false;
        }
      }
    }
    return true;
  };

  // 5. Evaluar candidatos de escape en orden de prioridad

  // Candidato A: Desvío lateral preferente
  const testXA = playerPos.x + preferredDir * step;
  if (isCandidateSafe(testXA, playerPos.y)) {
    return {
      pushVector: { vx: preferredDir, vy: 0 },
      pushingNpc: primaryNpc,
      activePushState: { npcId: primaryNpc.id, dir: preferredDir },
    };
  }

  // Candidato B: Desvío lateral opuesto si el preferente está bloqueado
  const oppositeDir = -preferredDir;
  const testXB = playerPos.x + oppositeDir * step;
  if (isCandidateSafe(testXB, playerPos.y)) {
    return {
      pushVector: { vx: oppositeDir, vy: 0 },
      pushingNpc: primaryNpc,
      activePushState: { npcId: primaryNpc.id, dir: oppositeDir },
    };
  }

  // Candidato C: Diagonal hacia abajo (hacia la explanada abierta)
  const diagStepX = preferredDir * step * 0.7071;
  const diagStepY = step * 0.7071;
  const testXC = playerPos.x + diagStepX;
  const testYC = playerPos.y + diagStepY;
  if (isCandidateSafe(testXC, testYC)) {
    return {
      pushVector: { vx: preferredDir * 0.7071, vy: 0.7071 },
      pushingNpc: primaryNpc,
      activePushState: { npcId: primaryNpc.id, dir: preferredDir },
    };
  }

  // Candidato D: Diagonal opuesta hacia abajo
  const testXD = playerPos.x - diagStepX;
  if (isCandidateSafe(testXD, testYC)) {
    return {
      pushVector: { vx: -preferredDir * 0.7071, vy: 0.7071 },
      pushingNpc: primaryNpc,
      activePushState: { npcId: primaryNpc.id, dir: oppositeDir },
    };
  }

  // Si todas las direcciones están bloqueadas, no forzar desplazamiento
  return {
    pushVector: null,
    pushingNpc: primaryNpc,
    activePushState: null,
  };
}

export interface ResolveVoluntaryMovementParams {
  currentPos: { x: number; y: number };
  desiredDx: number;
  desiredDy: number;
  npcs: GenericNpc[];
  isPositionWalkable?: (x: number, y: number) => boolean;
  playerHalfW?: number;
  playerHalfH?: number;
  npcHalfW?: number;
  npcHalfH?: number;
}

export interface VoluntaryMovementResult {
  effectiveDx: number;
  effectiveDy: number;
  isBlockedByNpc: boolean;
  blockedNpc: GenericNpc | null;
}

/**
 * Resuelve preventivamente el desplazamiento voluntario del protagonista (vía teclado)
 * contra los NPCs genéricos activos en el escenario.
 *
 * Principios:
 * 1. Resolución preventiva: no permite que el jugador penetre la caja del NPC para luego ser expulsado.
 * 2. Deslizamiento lateral (Wall Sliding): si el jugador avanza contra el costado de un NPC,
 *    acota el avance horizontal al borde de contacto seguro y preserva la componente vertical deseada.
 * 3. Si el jugador solo presiona izquierda o derecha, no añade movimiento vertical artificial.
 * 4. El movimiento hacia afuera (alejándose del NPC) nunca se bloquea.
 * 5. Elimina de raíz la alternancia entre avance por teclado y expulsión reactiva (cero vibraciones).
 */
export function resolvePlayerVoluntaryMovementVsNpcs({
  currentPos,
  desiredDx,
  desiredDy,
  npcs,
  isPositionWalkable,
  playerHalfW = NPC_COLLISION_DEFAULTS.playerHalfWidth,
  playerHalfH = NPC_COLLISION_DEFAULTS.playerHalfHeight,
  npcHalfW = NPC_COLLISION_DEFAULTS.npcHalfWidth,
  npcHalfH = NPC_COLLISION_DEFAULTS.npcHalfHeight,
}: ResolveVoluntaryMovementParams): VoluntaryMovementResult {
  const moveMag = Math.hypot(desiredDx, desiredDy);
  if (moveMag < 0.0001) {
    return {
      effectiveDx: 0,
      effectiveDy: 0,
      isBlockedByNpc: false,
      blockedNpc: null,
    };
  }

  const activeNpcs = npcs.filter((n) => n.isActive);
  if (activeNpcs.length === 0) {
    return {
      effectiveDx: desiredDx,
      effectiveDy: desiredDy,
      isBlockedByNpc: false,
      blockedNpc: null,
    };
  }

  const totalHalfW = playerHalfW + npcHalfW;
  const totalHalfH = playerHalfH + npcHalfH;

  let effectiveDx = desiredDx;
  let effectiveDy = desiredDy;
  let isBlocked = false;
  let blockedNpc: GenericNpc | null = null;

  for (const npc of activeNpcs) {
    const targetX = currentPos.x + effectiveDx;
    const targetY = currentPos.y + effectiveDy;

    // Comprobación de solapamiento continuo (swept box) para evitar atravesar con dt elevado
    const trajMinX = Math.min(currentPos.x, targetX) - playerHalfW;
    const trajMaxX = Math.max(currentPos.x, targetX) + playerHalfW;
    const npcMinX = npc.position.x - npcHalfW;
    const npcMaxX = npc.position.x + npcHalfW;

    const trajMinY = Math.min(currentPos.y, targetY) - playerHalfH;
    const trajMaxY = Math.max(currentPos.y, targetY) + playerHalfH;
    const npcMinY = npc.position.y - npcHalfH;
    const npcMaxY = npc.position.y + npcHalfH;

    const sweptOverlap =
      trajMaxX > npcMinX &&
      trajMinX < npcMaxX &&
      trajMaxY > npcMinY &&
      trajMinY < npcMaxY;

    if (sweptOverlap) {
      isBlocked = true;
      blockedNpc = npc;

      const currentDeltaX = Math.abs(currentPos.x - npc.position.x);
      const currentDeltaY = Math.abs(currentPos.y - npc.position.y);
      const EPSILON = 0.001;

      // Evaluar si el contacto es con el lateral (izq/der) o con la parte sup/inf
      let isLateralApproach = false;

      if (currentDeltaX >= totalHalfW && currentDeltaY >= totalHalfH) {
        // Contacto en diagonal hacia una esquina: determinar cuál borde se intercepta primero
        const gapX = currentDeltaX - totalHalfW;
        const gapY = currentDeltaY - totalHalfH;
        const timeX =
          Math.abs(effectiveDx) > 0.0001 ? gapX / Math.abs(effectiveDx) : Infinity;
        const timeY =
          Math.abs(effectiveDy) > 0.0001 ? gapY / Math.abs(effectiveDy) : Infinity;
        isLateralApproach = timeX <= timeY;
      } else if (currentDeltaX >= totalHalfW) {
        isLateralApproach = true;
      } else if (currentDeltaY >= totalHalfH) {
        isLateralApproach = false;
      } else {
        // En caso de que ya existiera solapamiento (por movimiento del NPC),
        // evaluar cuál eje tiene mayor penetración
        isLateralApproach = Math.abs(effectiveDx) >= Math.abs(effectiveDy);
      }

      if (isLateralApproach) {
        // Bloquear/acotar avance horizontal hacia el NPC
        if (currentPos.x < npc.position.x) {
          // Jugador a la izquierda del NPC
          if (effectiveDx > 0) {
            const safeX = npc.position.x - totalHalfW - EPSILON;
            effectiveDx = Math.min(effectiveDx, Math.max(0, safeX - currentPos.x));
          }
        } else {
          // Jugador a la derecha del NPC
          if (effectiveDx < 0) {
            const safeX = npc.position.x + totalHalfW + EPSILON;
            effectiveDx = Math.max(effectiveDx, Math.min(0, safeX - currentPos.x));
          }
        }
        // La componente vertical effectiveDy (deslizamiento lateral tangencial) se conserva
      } else {
        // Bloquear/acotar avance vertical hacia el NPC
        if (currentPos.y < npc.position.y) {
          // Jugador arriba del NPC
          if (effectiveDy > 0) {
            const safeY = npc.position.y - totalHalfH - EPSILON;
            effectiveDy = Math.min(effectiveDy, Math.max(0, safeY - currentPos.y));
          }
        } else {
          // Jugador abajo del NPC
          if (effectiveDy < 0) {
            const safeY = npc.position.y + totalHalfH + EPSILON;
            effectiveDy = Math.max(effectiveDy, Math.min(0, safeY - currentPos.y));
          }
        }
        // La componente horizontal effectiveDx (deslizamiento horizontal tangencial) se conserva
      }
    }
  }

  return {
    effectiveDx,
    effectiveDy,
    isBlockedByNpc: isBlocked,
    blockedNpc,
  };
}
