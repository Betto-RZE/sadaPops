import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { PixelSpeechBubble } from "./PixelSpeechBubble";
import {
  AnimatedPlayerSprite,
  releasePlayerImages,
} from "./AnimatedPlayerSprite";
import {
  PLAZA_BOUNDS,
  CASILLA_POSITIONS,
  CASILLA_WIDTH,
  MESA_POSITION,
  MESA_WIDTH,
  DECORACIONES_LIST,
  DECORACIONES_POSITIONS,
  BOLETAS_POSITIONS,
  BOLETAS_SIZES,
  BOLETA_WIDTH,
  OBJECT_COLLISION_BOXES,
  isInsideBox,
  isInsidePolygon,
  tryPolygonWallSlide,
  getLeftBoundaryX,
  getRightBoundaryX,
  getBaseRightBoundaryX,
  EXCLAMATION_ICON_WIDTH,
} from "./GameplayScene";
import type { ChapterSceneProps } from "./features/capitulos/ChapterSceneRouter";
import {
  getChapterHandoff,
  type PlayerDirection,
} from "./features/capitulos/chapterHandoff";
import {
  useGenericNpcs,
  useCinematicNpcCamera,
  GenericNpcSprite,
  GENERIC_NPC_DEFAULTS,
  getNpcLateralPushVector,
  isPositionBlockedByIdleNpc,
  isPositionBlockedByNpc,
  resolvePlayerVoluntaryMovementVsNpcs,
  NPC_COLLISION_DEFAULTS,
  type ActivePushState,
  type GenericNpc,
  calculateSceneCharactersDepth,
  calculateCharacterZIndex,
  clearDepthCache,
  type DepthEntity,
  NPC_DEPTH_LAYERS,
} from "./features/npcs";
import {
  useNarrativeNpcsQueue,
  NarrativeNpcSprite,
  ANCIANA_DEFAULTS,
  releaseAncianaImages,
  MESA_INTERACTION_LEFT_POS,
  MESA_INTERACTION_DISTANCE_THRESHOLD,
  calculatePlayerAlignedPositionWithNpc,
  stepPlayerAlignmentWalk,
  PLAYER_ALIGNMENT_WALK_SPEED,
  getNarrativeCharacterPortraits,
} from "./features/mitos";

/**
 * Capitulo 2: "Desmintiendo mitos".
 * Continua en la misma explanada del Capitulo 1, con la casilla ya instalada.
 * - JUGAR: el personaje arranca exactamente donde termino el Capitulo 1.
 * - CAPITULOS: arranca en una posicion por defecto junto a la mesa directiva.
 * Tras 2.5 s aparece el dialogo de llegada de los primeros votantes.
 */

export const INTRO_CAP2_MESSAGES_ES: string[] = [
  "¡Mira nada más! ¡Ya comenzaron a llegar nuestros primeros votantes!",
  "Después de tanto preparar la casilla, qué gusto ver que todo está funcionando como esperábamos.",
  "Cada persona que llega tiene sus propias razones para participar, sus opiniones y, seguramente, una que otra duda.",
  "Y aunque nuestro trabajo es ayudar a que la votación se desarrolle correctamente, también podemos orientar a quienes tengan preguntas.",
];

export const INTRO_CAP2_MESSAGES_NAH: string[] = [
  "¡Xikita san tlen! ¡Ya pehualkeh ajsih tototlayokauh votantes!",
  "Satepan kuak miak tikyektlalijkeh in casilla, ¡kualtsin tikitah nochi kisa ken timochiyayaj!",
  "Sesen maseual akin ajsi kipixtok itlanemililis pampa tlapejpenis, itlamachilis wan tlatotonki se tlatlanilistli.",
  "Wan maski totlanel tekiyo yeski ma kualtsin mopano in tlaixquetzalistli, no uelis tikinyakanaseh akin kipiah tlatlanilistli.",
];

export const ANCIANA_ARRIVAL_MESSAGES_ES: string[] = [
  "¡Oh! Parece que una señora se acercó a nuestra mesa.",
  "¡Vamos a ver en qué podemos ayudarla!",
];

export const ANCIANA_ARRIVAL_MESSAGES_NAH: string[] = [
  "¡Oh! Tikitah se tenantzin omopacho itech tomexa.",
  "¡Tikitatij tlen ika uelis tikpalehuiseh!",
];

/** Espera antes del primer globo de texto al iniciar el capitulo. */
const INTRO_DELAY_MS = 2500;

/** Posicion por defecto (modo CAPITULOS): junto a la mesa directiva. */
const DEFAULT_PLAYER_POS = { x: 20, y: 52 };

type DialogueState =
  | "initial_delay"
  | "entering"
  | "visible"
  | "exiting"
  | "dismissed";

// Zona caminable: explanada + casilla completa (mamparas, mesa y cartel 2)
const isPlazaWalkable = (x: number, y: number): boolean => {
  if (y < PLAZA_BOUNDS.minY || y > PLAZA_BOUNDS.maxY) return false;
  return x >= getLeftBoundaryX(y) && x <= getRightBoundaryX(y);
};

const isPositionWalkable = (x: number, y: number): boolean => {
  if (!isPlazaWalkable(x, y)) return false;
  const obs = OBJECT_COLLISION_BOXES;
  if (obs.mamparas.some((box) => isInsideBox(x, y, box))) return false;
  if (isInsidePolygon(x, y, obs.mesa)) return false;
  if (isInsideBox(x, y, obs.cartel2)) return false;
  return true;
};

export default function Chapter2Scene({
  language = "es",
  stageImageUrl,
  isFullscreen,
  isTransitioning,
  isPaused,
  onRequestExit,
}: ChapterSceneProps) {
  // Lectura sin efectos (segura con StrictMode). Se limpia al iniciar otra sesion.
  const [playerPos, setPlayerPos] = useState(
    () => getChapterHandoff()?.playerPos ?? DEFAULT_PLAYER_POS,
  );
  const [lastDirection, setLastDirection] = useState<PlayerDirection>(
    () => getChapterHandoff()?.lastDirection ?? "1",
  );
  const [isWalking, setIsWalking] = useState(false);
  const [dialogueState, setDialogueState] =
    useState<DialogueState>("initial_delay");

  // Sistema de personajes genéricos (votantes ambientales)
  const { npcs, isGlobalSystemActive } = useGenericNpcs({
    dialogueState,
    isPaused,
  });

  // La anciana aparece 4 segundos después de que el primer NPC genérico termina su animación de IDLE
  const isFirstNpcIdleFinished =
    isGlobalSystemActive ||
    npcs.some(
      (n) =>
        n.id === "npc-gen-mampara-3" &&
        (n.state === "LEAVING" || n.state === "FINISHED"),
    );

  // Cola secuencial de personajes narrativos (1. Anciana, 2. Joven, 3. Indígena, 4. Transgénero, 5. Discapacitado)
  const narrativeQueue = useNarrativeNpcsQueue({
    isPaused,
    isTriggered: isFirstNpcIdleFinished,
    initialSpawnDelayMs: 4000,
    betweenCharactersDelayMs: 10000,
  });
  const narrativeQueuePosRef = useRef(narrativeQueue.position);
  useEffect(() => {
    narrativeQueuePosRef.current = narrativeQueue.position;
  }, [narrativeQueue.position]);

  const narrativeQueueRef = useRef(narrativeQueue);
  useEffect(() => {
    narrativeQueueRef.current = narrativeQueue;
  }, [narrativeQueue]);

  // Diálogo activado al llegar un personaje a la mesa directiva
  type NpcArrivalDialogueState =
    | "idle"
    | "entering"
    | "visible"
    | "exiting"
    | "dismissed";

  const [arrivalDialogueState, setArrivalDialogueState] =
    useState<NpcArrivalDialogueState>("idle");
  const arrivalDialogueStateRef = useRef(arrivalDialogueState);
  useEffect(() => {
    arrivalDialogueStateRef.current = arrivalDialogueState;
  }, [arrivalDialogueState]);

  // Disparar diálogo de anuncio de llegada al llegar el personaje a la mesa y cerrar el intro
  useEffect(() => {
    if (
      narrativeQueue.status === "arrived" &&
      arrivalDialogueState === "idle" &&
      dialogueState === "dismissed"
    ) {
      setArrivalDialogueState("entering");
    }
  }, [narrativeQueue.status, arrivalDialogueState, dialogueState]);

  useEffect(() => {
    if (arrivalDialogueState === "entering") {
      const timer = setTimeout(() => setArrivalDialogueState("visible"), 350);
      return () => clearTimeout(timer);
    }
    if (arrivalDialogueState === "exiting") {
      const timer = setTimeout(() => setArrivalDialogueState("dismissed"), 350);
      return () => clearTimeout(timer);
    }
  }, [arrivalDialogueState]);

  // Conversación directa con el personaje tras presionar E en el lado izquierdo de la mesa
  type NpcConversationState =
    | "idle"
    | "walking_to_spot"
    | "entering"
    | "visible"
    | "exiting"
    | "dismissed";

  const [npcConversationState, setNpcConversationState] =
    useState<NpcConversationState>("idle");
  const npcConversationStateRef = useRef(npcConversationState);
  useEffect(() => {
    npcConversationStateRef.current = npcConversationState;
  }, [npcConversationState]);

  const alignmentTargetPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (npcConversationState === "entering") {
      const timer = setTimeout(() => setNpcConversationState("visible"), 350);
      return () => clearTimeout(timer);
    }
    if (npcConversationState === "exiting") {
      const timer = setTimeout(() => {
        setNpcConversationState("dismissed");
      }, 350);
      return () => clearTimeout(timer);
    }
    if (npcConversationState === "dismissed") {
      setNpcConversationState("idle");
    }
  }, [npcConversationState]);

  // El icono de exclamación (!) aparece en el lado izquierdo de la mesa cuando
  // el personaje actual está en la mesa, su anuncio de llegada ha concluido
  // y la conversación directa aún no haya iniciado.
  const showMesaExclamation =
    narrativeQueue.status === "arrived" &&
    arrivalDialogueState === "dismissed" &&
    npcConversationState === "idle";
  const showMesaExclamationRef = useRef(showMesaExclamation);
  useEffect(() => {
    showMesaExclamationRef.current = showMesaExclamation;
  }, [showMesaExclamation]);

  // Detección de proximidad al lado izquierdo de la mesa
  const distToMesaLeft = Math.hypot(
    playerPos.x - MESA_INTERACTION_LEFT_POS.x,
    playerPos.y - MESA_INTERACTION_LEFT_POS.y,
  );
  const isNearMesaLeft =
    showMesaExclamation &&
    distToMesaLeft <= MESA_INTERACTION_DISTANCE_THRESHOLD;
  const isNearMesaLeftRef = useRef(isNearMesaLeft);
  useEffect(() => {
    isNearMesaLeftRef.current = isNearMesaLeft;
  }, [isNearMesaLeft]);

  // Inicia la conversación con el interlocutor actual en la mesa:
  // 1. Calcula la posición alineada en el eje Y respecto al personaje (targetY = 66.0%)
  // 2. Si ya se encuentra en la posición, inicia la charla directamente orientado a la derecha ("4")
  // 3. Si no, inicia una caminata suave animada (walking_to_spot) paso a paso sin teletransporte
  const handleStartNpcConversation = useCallback(() => {
    const targetY = narrativeQueuePosRef.current.y;
    const targetPos = calculatePlayerAlignedPositionWithNpc({
      currentPos: playerPosRef.current,
      targetNpcY: targetY,
      isWalkable: isPositionWalkable,
    });
    alignmentTargetPosRef.current = targetPos;

    const dist = Math.hypot(
      playerPosRef.current.x - targetPos.x,
      playerPosRef.current.y - targetPos.y,
    );

    narrativeQueue.startConversation();

    if (dist <= 0.35) {
      setPlayerPos(targetPos);
      setLastDirection("4");
      setIsWalking(false);
      setNpcConversationState("entering");
    } else {
      setNpcConversationState("walking_to_spot");
    }
  }, [narrativeQueue]);

  const handleStartNpcConversationRef = useRef(handleStartNpcConversation);
  useEffect(() => {
    handleStartNpcConversationRef.current = handleStartNpcConversation;
  }, [handleStartNpcConversation]);


  const isPausedRef = useRef(isPaused);
  const dialogueStateRef = useRef(dialogueState);
  const playerPosRef = useRef(playerPos);
  const npcsRef = useRef(npcs);
  const activePushStateRef = useRef<ActivePushState | null>(null);

  // Lista unificada de NPCs con colisión física idéntica (genéricos + personaje narrativo activo)
  const allCollidableNpcs = useMemo<GenericNpc[]>(() => {
    if (!narrativeQueue.isActive) return npcs;

    const narrativeNpc: GenericNpc = {
      id: narrativeQueue.currentCharacterId,
      position: narrativeQueue.position,
      assignedMamparaId: 1,
      currentAnimation: "side" as any,
      state:
        narrativeQueue.status === "walking"
          ? "ENTERING"
          : narrativeQueue.status === "leaving"
            ? "LEAVING"
            : "IDLE",
      speed: narrativeQueue.isWalking ? ANCIANA_DEFAULTS.speed : 0,
      votingWaitTimeMs: 0,
      elapsedInStateMs: 0,
      isActive: true,
      movementAxis: "horizontal",
    };

    return [...npcs, narrativeNpc];
  }, [
    npcs,
    narrativeQueue.isActive,
    narrativeQueue.currentCharacterId,
    narrativeQueue.position,
    narrativeQueue.status,
  ]);


  const allCollidableNpcsRef = useRef(allCollidableNpcs);

  useEffect(() => {
    allCollidableNpcsRef.current = allCollidableNpcs;
  }, [allCollidableNpcs]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    dialogueStateRef.current = dialogueState;
  }, [dialogueState]);
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);
  useEffect(() => {
    npcsRef.current = npcs;
  }, [npcs]);

  // Contador de 2.5 s (empieza cuando la pantalla esta abierta) y animacion del globo
  useEffect(() => {
    if (isTransitioning) return;

    if (dialogueState === "initial_delay") {
      const timer = setTimeout(
        () => setDialogueState("entering"),
        INTRO_DELAY_MS,
      );
      return () => clearTimeout(timer);
    }
    if (dialogueState === "entering") {
      const timer = setTimeout(() => setDialogueState("visible"), 350);
      return () => clearTimeout(timer);
    }
    if (dialogueState === "exiting") {
      const timer = setTimeout(() => setDialogueState("dismissed"), 350);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, dialogueState]);

  // Al desmontar se liberan los frames precargados de los personajes y la caché de profundidad
  useEffect(() => {
    return () => {
      clearDepthCache();
      releasePlayerImages();
      releaseAncianaImages();
    };
  }, []);

  // Bucle de movimiento (mismas fisicas que el Capitulo 1: 4 direcciones,
  // aceleracion progresiva, inercia y deslizamiento en bordes/obstaculos)
  useEffect(() => {
    const keysPressed: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed[key] = true;

      // Al presionar E cerca del lado izquierdo de la mesa con la exclamación activa,
      // se inicia la conversación con el personaje, alineando al protagonista en Y y mirando hacia la derecha
      if (key === "e") {
        if (
          showMesaExclamationRef.current &&
          isNearMesaLeftRef.current &&
          npcConversationStateRef.current === "idle" &&
          !isPausedRef.current
        ) {
          e.preventDefault();
          handleStartNpcConversationRef.current();
        }
      }

    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = false;
    };

    let animationFrameId: number;
    let lastTime = performance.now();

    // Política de pestañas inactivas (Fase 5.4):
    // Al recuperar foco/visibilidad, restablecer lastTime para evitar saltos o teletransportación física
    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        lastTime = performance.now();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    const maxSpeed = 22.0;
    const RAMP_TIME = 1.0;
    const frictionRate = 9.0;
    let keyHoldTime = 0;
    const velocity = { x: 0, y: 0 };

    const stop = () => {
      velocity.x = 0;
      velocity.y = 0;
      keyHoldTime = 0;
      setIsWalking(false);
    };

    const updateGameLoop = (currentTime: number) => {
      // Si el documento está oculto, pausar la física sin acumular tiempo
      if (typeof document !== "undefined" && document.hidden) {
        lastTime = currentTime;
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (isPausedRef.current) {
        stop();
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      // Fase de caminata suave del protagonista para alinearse en el eje Y frente al interlocutor
      // Evita cualquier salto brusco o teletransporte, animando los pasos naturales
      if (npcConversationStateRef.current === "walking_to_spot") {
        stop();
        const targetPos = alignmentTargetPosRef.current;
        if (targetPos) {
          const stepResult = stepPlayerAlignmentWalk({
            currentPos: playerPosRef.current,
            targetPos,
            speed: PLAYER_ALIGNMENT_WALK_SPEED,
            dt,
          });

          setPlayerPos(stepResult.nextPos);
          setLastDirection(stepResult.direction);

          if (stepResult.isArrived) {
            setIsWalking(false);
            setLastDirection("4");
            setNpcConversationState("entering");
          } else {
            setIsWalking(true);
          }
        } else {
          setNpcConversationState("entering");
        }
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      // Sin movimiento de controles hasta cerrar el diálogo inicial, el de llegada del personaje,
      // o la conversación directa con él.
      // Durante diálogos se prioriza la estabilidad de la conversación y orientación.
      const isAnyDialogueActive =
        dialogueStateRef.current !== "dismissed" ||
        (arrivalDialogueStateRef.current !== "idle" &&
          arrivalDialogueStateRef.current !== "dismissed") ||
        (npcConversationStateRef.current !== "idle" &&
          npcConversationStateRef.current !== "dismissed");

      if (isAnyDialogueActive) {
        stop();
        if (
          dialogueStateRef.current === "entering" ||
          dialogueStateRef.current === "visible" ||
          arrivalDialogueStateRef.current === "entering" ||
          arrivalDialogueStateRef.current === "visible"
        ) {
          setLastDirection("1");
        } else if (
          npcConversationStateRef.current === "entering" ||
          npcConversationStateRef.current === "visible"
        ) {
          // Orientar al protagonista hacia la derecha (mirando hacia el personaje y la mesa)
          setLastDirection("4");
        }

        // Corrección física mínima si hay contacto directo para evitar superposiciones
        const pushResult = getNpcLateralPushVector({
          playerPos: playerPosRef.current,
          npcs: allCollidableNpcsRef.current,
          isPositionWalkable,
          activePushState: activePushStateRef.current,
          dtSeconds: dt,
        });
        activePushStateRef.current = pushResult.activePushState;
        if (pushResult.pushVector) {
          const pushSpeed = NPC_COLLISION_DEFAULTS.pushSpeed;
          const pDx = pushResult.pushVector.vx * pushSpeed * dt;
          const pDy = pushResult.pushVector.vy * pushSpeed * dt;
          setPlayerPos((prev) => {
            const nextX = prev.x + pDx;
            const nextY = prev.y + pDy;
            if (isPositionWalkable(nextX, nextY)) {
              return { x: nextX, y: nextY };
            }
            return prev;
          });
        }
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      // 1. Leer entradas de movimiento y calcular velocidad deseada
      let dirX = 0;
      let dirY = 0;
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
      keyHoldTime = isInputActive ? Math.min(RAMP_TIME, keyHoldTime + dt) : 0;

      const rampFactor = isInputActive
        ? Math.pow(keyHoldTime / RAMP_TIME, 2)
        : 0;
      const targetVx = dirX * maxSpeed * rampFactor;
      const targetVy = dirY * maxSpeed * rampFactor;
      const blend = Math.min(1, (isInputActive ? 16.0 : frictionRate) * dt);
      velocity.x += ((isInputActive ? targetVx : 0) - velocity.x) * blend;
      velocity.y += ((isInputActive ? targetVy : 0) - velocity.y) * blend;
      if (!isInputActive && Math.abs(velocity.x) < 0.04) velocity.x = 0;
      if (!isInputActive && Math.abs(velocity.y) < 0.04) velocity.y = 0;

      // 2. Calcular desplazamiento voluntario deseado
      const voluntaryDx = velocity.x * dt;
      const voluntaryDy = velocity.y * dt;

      // 3. Resolver colisiones preventivas y deslizamiento contra NPCs (Wall Sliding)
      const voluntaryResult = resolvePlayerVoluntaryMovementVsNpcs({
        currentPos: playerPosRef.current,
        desiredDx: voluntaryDx,
        desiredDy: voluntaryDy,
        npcs: allCollidableNpcsRef.current,
        isPositionWalkable,
      });

      const effectiveVoluntaryDx = voluntaryResult.effectiveDx;
      const effectiveVoluntaryDy = voluntaryResult.effectiveDy;

      // Si el movimiento voluntario choca contra un NPC, ajustar velocidad en ese eje
      if (voluntaryResult.isBlockedByNpc) {
        if (
          Math.abs(effectiveVoluntaryDx) < Math.abs(voluntaryDx) &&
          Math.sign(voluntaryDx) === Math.sign(velocity.x)
        ) {
          velocity.x = 0;
        }
        if (
          Math.abs(effectiveVoluntaryDy) < Math.abs(voluntaryDy) &&
          Math.sign(voluntaryDy) === Math.sign(velocity.y)
        ) {
          velocity.y = 0;
        }
      }

      // Si el jugador intenta caminar hacia el NPC que lo empuja y ya está fuera de solapamiento directo,
      // liberar la histéresis para evitar empujes de expulsión innecesarios y oscilaciones
      if (activePushStateRef.current && isInputActive) {
        const pushingNpc = allCollidableNpcsRef.current.find(
          (n) => n.id === activePushStateRef.current?.npcId,
        );
        if (pushingNpc) {
          const isMovingTowardsNpc =
            (dirX > 0 && pushingNpc.position.x > playerPosRef.current.x) ||
            (dirX < 0 && pushingNpc.position.x < playerPosRef.current.x) ||
            (dirY > 0 && pushingNpc.position.y > playerPosRef.current.y) ||
            (dirY < 0 && pushingNpc.position.y < playerPosRef.current.y);
          if (isMovingTowardsNpc) {
            activePushStateRef.current = null;
          }
        }
      }

      // 4. Calcular cualquier corrección externa realmente necesaria por movimiento de los NPCs
      const voluntaryPos = {
        x: playerPosRef.current.x + effectiveVoluntaryDx,
        y: playerPosRef.current.y + effectiveVoluntaryDy,
      };

      const pushResult = getNpcLateralPushVector({
        playerPos: voluntaryPos,
        npcs: allCollidableNpcsRef.current,
        isPositionWalkable,
        activePushState: activePushStateRef.current,
        dtSeconds: dt,
      });
      activePushStateRef.current = pushResult.activePushState;

      const pushSpeed = NPC_COLLISION_DEFAULTS.pushSpeed;
      const pushDx = pushResult.pushVector
        ? pushResult.pushVector.vx * pushSpeed * dt
        : 0;
      const pushDy = pushResult.pushVector
        ? pushResult.pushVector.vy * pushSpeed * dt
        : 0;
      const isPushing = pushResult.pushVector !== null;

      // Si no hay input de teclado pero hay empuje de un NPC, orientar al personaje según el empuje
      if (!isInputActive && isPushing && pushResult.pushVector) {
        if (
          Math.abs(pushResult.pushVector.vy) >
          Math.abs(pushResult.pushVector.vx)
        ) {
          setLastDirection(pushResult.pushVector.vy > 0 ? "1" : "3");
        } else {
          setLastDirection(pushResult.pushVector.vx > 0 ? "4" : "2");
        }
      }

      const totalDx = effectiveVoluntaryDx + pushDx;
      const totalDy = effectiveVoluntaryDy + pushDy;

      const hasMovement =
        Math.hypot(velocity.x, velocity.y) > 0.01 || isPushing || isInputActive;
      setIsWalking(hasMovement);

      // 5 y 6. Validar posición final y confirmar una única actualización por frame
      if (Math.hypot(totalDx, totalDy) > 0.0001) {
        setPlayerPos((prev) => {
          let effectiveDx = totalDx;
          let effectiveDy = totalDy;

          const isInsideRightPath =
            prev.y >= PLAZA_BOUNDS.rightPathTopY &&
            prev.y <= PLAZA_BOUNDS.rightPathBottomY &&
            prev.x > getBaseRightBoundaryX(prev.y);

          // Deslizamiento sobre los bordes diagonales de la explanada (CONSERVADO INTACTO)
          if (!isInsideRightPath) {
            if (totalDx < 0 && prev.x <= getLeftBoundaryX(prev.y) + 0.6) {
              effectiveDy += Math.abs(totalDx) * 0.75;
            }
            if (totalDx > 0 && prev.x >= getRightBoundaryX(prev.y) - 0.6) {
              effectiveDy += Math.abs(totalDx) * 0.75;
            }
          }

          const isTargetWalkable = (tx: number, ty: number): boolean => {
            return (
              isPositionWalkable(tx, ty) &&
              !isPositionBlockedByNpc(
                { x: tx, y: ty },
                allCollidableNpcsRef.current,
                pushResult.pushingNpc
                  ? { excludeNpcId: pushResult.pushingNpc.id }
                  : undefined,
              )
            );
          };

          const rawTargetX = prev.x + effectiveDx;
          const rawTargetY = prev.y + effectiveDy;
          if (isTargetWalkable(rawTargetX, rawTargetY)) {
            return { x: rawTargetX, y: rawTargetY };
          }

          // Deslizamiento sobre la mesa directiva
          const mesaSlide = tryPolygonWallSlide(
            prev,
            effectiveDx,
            effectiveDy,
            OBJECT_COLLISION_BOXES.mesa,
            isTargetWalkable,
          );
          if (mesaSlide) return mesaSlide;

          // Pasillo lateral derecho
          if (isInsideRightPath) {
            const pathY = Math.min(
              PLAZA_BOUNDS.rightPathBottomY,
              Math.max(PLAZA_BOUNDS.rightPathTopY, rawTargetY),
            );
            const pathX = Math.min(
              PLAZA_BOUNDS.rightPathMaxX,
              Math.max(getBaseRightBoundaryX(pathY), rawTargetX),
            );
            if (isTargetWalkable(pathX, pathY)) return { x: pathX, y: pathY };
          }

          const clampedY = Math.min(
            PLAZA_BOUNDS.maxY,
            Math.max(PLAZA_BOUNDS.minY, rawTargetY),
          );
          const clampedX = Math.min(
            getRightBoundaryX(clampedY),
            Math.max(getLeftBoundaryX(clampedY), rawTargetX),
          );
          if (isTargetWalkable(clampedX, clampedY)) {
            return { x: clampedX, y: clampedY };
          }
          if (isTargetWalkable(clampedX, prev.y)) {
            return { x: clampedX, y: prev.y };
          }
          if (isTargetWalkable(prev.x, clampedY)) {
            return { x: prev.x, y: clampedY };
          }

          velocity.x = 0;
          velocity.y = 0;
          return prev;
        });
      } else {
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
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, []);

  // Cámara cinematográfica dinámica:
  // 1. Sigue suavemente al primer NPC al entrar, espera 2.5s en la mampara y regresa suavemente al jugador.
  // 2. Al llegar un personaje a la mesa, enfoca al personaje durante 3 segundos y regresa suavemente al jugador.
  const zoomScale = 2.0;
  const { camX, camY } = useCinematicNpcCamera({
    playerPos,
    firstNpc: npcs.find((n) => n.id === "npc-gen-mampara-3") || npcs[0],
    isPaused,
    zoomScale,
    holdDurationMs: 2500,
    focusTarget: {
      position: narrativeQueue.position,
      isActive: narrativeQueue.status === "arrived",
      durationMs: 3000,
    },
  });

  const introMessages =
    language === "nah" ? INTRO_CAP2_MESSAGES_NAH : INTRO_CAP2_MESSAGES_ES;
  const showDialogue =
    dialogueState !== "initial_delay" && dialogueState !== "dismissed";

  const currentNarrativeConfig = narrativeQueue.currentCharacterConfig;

  const currentArrivalMessages =
    language === "nah"
      ? currentNarrativeConfig.arrivalMessagesNah
      : currentNarrativeConfig.arrivalMessagesEs;
  const showArrivalDialogue =
    arrivalDialogueState !== "idle" && arrivalDialogueState !== "dismissed";

  const currentConversationMessages =
    language === "nah"
      ? currentNarrativeConfig.conversationMessagesNah
      : currentNarrativeConfig.conversationMessagesEs;
  const showConversation =
    npcConversationState !== "idle" && npcConversationState !== "dismissed";

  const currentPortraits = useMemo(() => {
    return getNarrativeCharacterPortraits(narrativeQueue.currentCharacterId);
  }, [narrativeQueue.currentCharacterId]);

  // Sistema de profundidad visual dinámica (Fase 5.3 + 5.4):
  // Memoiza el arreglo de entidades y reutiliza el caché O(N) si no hay cambios en la posición vertical
  const depthMap = useMemo(() => {
    const characters: DepthEntity[] = [
      { id: "player", y: playerPos.y },
      ...(narrativeQueue.isActive
        ? [
            {
              id: narrativeQueue.currentCharacterId,
              y: narrativeQueue.position.y,
            },
          ]
        : []),
      ...npcs
        .filter((n) => n.isActive)
        .map((n) => ({ id: n.id, y: n.position.y })),
    ];
    return calculateSceneCharactersDepth(characters);
  }, [
    playerPos.y,
    narrativeQueue.isActive,
    narrativeQueue.currentCharacterId,
    narrativeQueue.position.y,
    npcs,
  ]);


  return (
    <div
      data-testid="chapter-scene-2"
      className="absolute inset-0 w-full h-full z-20 overflow-hidden bg-[#2d572c] select-none"
    >
      {/* Microanimaciones para el icono flotante de exclamación y texto pixel art */}
      <style>{`
        @keyframes floatExclamation {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes floatPrompt {
          0%, 100% { transform: translate(-50%, 0px); }
          50% { transform: translate(-50%, -3px); }
        }
      `}</style>

      {/* HUD: volver al menu (abre el modal de confirmacion) */}
      <div className="absolute top-3 left-3 z-30 pointer-events-none">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRequestExit();
          }}
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

      {/* MUNDO CON CAMARA DINAMICA */}
      <div
        className="absolute inset-0 w-full h-full z-10 transition-[filter] duration-500 ease-out"
        style={{
          transform: `scale(${zoomScale}) translate(${camX}%, ${camY}%)`,
          transformOrigin: "center center",
          willChange: "transform",
          filter:
            showConversation && npcConversationState !== "exiting"
              ? "blur(5px)"
              : "none",
        }}

      >
        <img
          src={stageImageUrl}
          alt="Explanada con la casilla instalada"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          style={{ imageRendering: "pixelated" }}
        />

        {/* PERSONAJE */}
        <div
          style={{
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,
            width: "6.5%",
            transform: "translate(-50%, -90%)",
            willChange: "left, top",
            zIndex:
              depthMap["player"] ??
              calculateCharacterZIndex(playerPos.y, "player"),
          }}
          className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
        >
          <AnimatedPlayerSprite
            isWalking={isWalking}
            lastDirection={lastDirection}
          />
        </div>

        {/* CIUDADANOS VOTANTES (NPCS GENÉRICOS) */}
        {npcs.map((npc) => (
          <div
            key={npc.id}
            data-testid={`generic-npc-${npc.id}`}
            style={{
              left: `${npc.position.x}%`,
              top: `${npc.position.y}%`,
              width: GENERIC_NPC_DEFAULTS.spriteWidthPercent,
              transform: "translate(-50%, -90%)",
              willChange: "left, top",
              zIndex:
                depthMap[npc.id] ??
                calculateCharacterZIndex(npc.position.y, npc.id),
            }}
            className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
          >
            <GenericNpcSprite
              animation={npc.currentAnimation}
              isPaused={isPaused}
            />
          </div>
        ))}

        {/* PERSONAJE NARRATIVO ACTIVO EN LA COLA */}
        {narrativeQueue.isActive && (
          <div
            data-testid={`narrative-npc-${narrativeQueue.currentCharacterId}`}
            style={{
              left: `${narrativeQueue.position.x}%`,
              top: `${narrativeQueue.position.y}%`,
              width: ANCIANA_DEFAULTS.spriteWidthPercent,
              transform: "translate(-50%, -90%)",
              willChange: "left, top",
              zIndex:
                depthMap[narrativeQueue.currentCharacterId] ??
                calculateCharacterZIndex(
                  narrativeQueue.position.y,
                  narrativeQueue.currentCharacterId,
                ),
            }}
            className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
          >
            <NarrativeNpcSprite
              characterId={narrativeQueue.currentCharacterId}
              isWalking={narrativeQueue.isWalking}
              facingDirection={narrativeQueue.facingDirection}
              isPaused={isPaused}
            />
          </div>
        )}


        {/* MAMPARAS */}
        {CASILLA_POSITIONS.map((pos, index) => (
          <div
            key={`casilla-item-${index}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: CASILLA_WIDTH,
              transform: "translate(-50%, -90%)",
              zIndex: NPC_DEPTH_LAYERS.mamparaLayer,
            }}
            className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
          >
            <img
              src="/assets/juego/casilla.png"
              alt={`Casilla Electoral ${index + 1}`}
              className="relative z-10 w-full h-auto object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        ))}

        {/* MESA DIRECTIVA */}
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
                ? NPC_DEPTH_LAYERS.mamparaLayer
                : NPC_DEPTH_LAYERS.mesaBehindLayer,
          }}
          className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
        >
          <img
            src="/assets/juego/mesa.png"
            alt="Mesa Directiva de Casilla"
            className="relative z-10 w-full h-auto object-contain"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        {/* SIGNO DE EXCLAMACIÓN (!) EN EL LADO IZQUIERDO DE LA MESA */}
        {showMesaExclamation && (
          <div
            data-testid="mesa-left-exclamation"
            onClick={(e) => {
              e.stopPropagation();
              if (
                !isPaused &&
                showMesaExclamation &&
                npcConversationState === "idle"
              ) {
                handleStartNpcConversation();
              }
            }}
            style={{
              left: `${MESA_INTERACTION_LEFT_POS.x}%`,
              top: `${MESA_INTERACTION_LEFT_POS.y}%`,
              width: EXCLAMATION_ICON_WIDTH,
              transform: "translate(-50%, -50%)",
              zIndex: NPC_DEPTH_LAYERS.mamparaLayer + 5,
              cursor: isNearMesaLeft ? "pointer" : "default",
            }}
            className="absolute flex items-center justify-center select-none"
          >
            <div
              style={{
                animation: "floatExclamation 1.4s ease-in-out infinite",
                width: "100%",
              }}
              className="relative flex items-center justify-center pointer-events-auto"
            >
              <img
                src="/assets/juego/exclamacion.png"
                alt="Conversar con el votante"
                className="w-full h-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]"
                style={{ imageRendering: "pixelated" }}
              />


              {/* Texto pixel art 'presiona E' al acercarse al lado izquierdo de la mesa */}
              {isNearMesaLeft && (
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
          </div>
        )}

        {/* DECORACIONES */}
        {DECORACIONES_LIST.map((deco) => {
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
                  deco.key === "cartel3"
                    ? NPC_DEPTH_LAYERS.cartel3Foreground
                    : playerPos.y >= pos.y
                      ? NPC_DEPTH_LAYERS.mamparaLayer
                      : NPC_DEPTH_LAYERS.mesaBehindLayer,
              }}
              className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
            >
              <img
                src={deco.sprite}
                alt={deco.name}
                className="relative z-10 w-full h-auto object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          );
        })}

        {/* BOLETAS SOBRE LAS MAMPARAS */}
        {BOLETAS_POSITIONS.map((pos, index) => {
          return (
            <div
              key={`boleta-item-${index}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: BOLETAS_SIZES[index] || BOLETA_WIDTH,
                transform: "translate(-50%, -90%)",
                zIndex: NPC_DEPTH_LAYERS.boletaLayer,
              }}
              className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
            >
              <img
                src="/assets/juego/boleta.png"
                alt={`Boleta Electoral ${index + 1}`}
                className="relative z-10 w-full h-auto object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          );
        })}

        {/* ARBUSTOS EN PRIMER PLANO */}
        <img
          src="/assets/juego/arbusto-izquierda.png"
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-[30.6%] h-auto object-contain pointer-events-none select-none z-30"
          style={{ imageRendering: "pixelated" }}
        />
        <img
          src="/assets/juego/arbusto-derecha.png"
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 right-0 w-[26%] h-auto object-contain pointer-events-none select-none z-30"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      {/* DIALOGO DE INICIO DEL CAPITULO 2 */}
      {showDialogue && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-center pb-[1.8cqw] px-[2cqw] overflow-hidden select-none">
          <div className="relative z-10 w-[96%] pointer-events-auto flex flex-col items-end">
            {/* Botón provisional para saltar todos los textos (Test) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDialogueState("exiting");
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
              messages={introMessages}
              actionKey="E"
              disabled={isPaused}
              isDismissing={dialogueState === "exiting"}
              onLineChange={() => {
                setIsWalking(false);
                setLastDirection("1");
              }}
              onDismiss={() => setDialogueState("exiting")}
            />
          </div>
        </div>
      )}

      {/* INDICADOR DE TRANSICIÓN ENTRE PERSONAJES (10 SEGUNDOS) */}
      {narrativeQueue.status === "waiting_next_character" && (
        <div className="absolute top-3 right-3 z-30 pointer-events-auto flex items-center gap-2 bg-[#1b3a1a]/95 border-[2px] border-[#a3e635] px-3 py-1.5 rounded shadow-[2px_2px_0px_0px_#000]">
          <span
            className="text-white text-xs font-mono"
            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "8px" }}
          >
            Próximo votante en: {Math.ceil(narrativeQueue.remainingTransitionMs / 1000)}s
          </span>
          <button
            type="button"
            onClick={() => narrativeQueue.skipToNextCharacter()}
            className="bg-[#940d57] hover:bg-[#ff2a85] text-white text-[7px] px-2 py-0.5 rounded border border-white cursor-pointer font-mono font-bold"
          >
            ⏩ Omitir espera (Test)
          </button>
        </div>
      )}

      {/* DIÁLOGO DE LLEGADA DEL PERSONAJE A LA MESA */}
      {showArrivalDialogue && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-center pb-[1.8cqw] px-[2cqw] overflow-hidden select-none">
          <div className="relative z-10 w-[96%] pointer-events-auto flex flex-col items-end">
            {/* Botón provisional para saltar todos los textos (Test) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setArrivalDialogueState("exiting");
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
              messages={currentArrivalMessages}
              actionKey="E"
              disabled={isPaused}
              isDismissing={arrivalDialogueState === "exiting"}
              onLineChange={() => {
                setIsWalking(false);
                setLastDirection("1");
              }}
              onDismiss={() => setArrivalDialogueState("exiting")}
            />
          </div>
        </div>
      )}

      {/* CONVERSACIÓN CON EL PERSONAJE AL INTERACTUAR CON LA MESA */}
      {showConversation && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-center pb-[1.8cqw] px-[2cqw] overflow-hidden select-none">
          {/* Capa de desenfoque y oscurecimiento cinematográfico de fondo (Backdrop Blur) */}
          <div
            className={`absolute inset-0 pointer-events-none transition-all duration-500 ease-out ${
              npcConversationState === "exiting"
                ? "opacity-0"
                : "opacity-100"
            }`}
            style={{
              backdropFilter:
                npcConversationState === "exiting"
                  ? "blur(0px)"
                  : "blur(6px)",
              WebkitBackdropFilter:
                npcConversationState === "exiting"
                  ? "blur(0px)"
                  : "blur(6px)",
              backgroundColor:
                npcConversationState === "exiting"
                  ? "rgba(0, 0, 0, 0)"
                  : "rgba(0, 0, 0, 0.28)",
            }}
          />

          {/* Botón provisional para saltar todos los textos (Test) en la esquina superior derecha */}
          <div className="absolute top-[2cqw] right-[2cqw] pointer-events-auto z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setNpcConversationState("exiting");
                narrativeQueueRef.current.dismissConversation();
                setArrivalDialogueState("idle");
              }}
              type="button"
              title="Saltar todos los textos con un solo clic (Test)"
              className="bg-[#940d57] hover:bg-[#ff2a85] active:bg-[#780946] text-white rounded border-[2px] border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-colors flex items-center gap-1.5 px-3 py-1 select-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              style={{
                fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                fontSize: isFullscreen ? "10px" : "8px",
              }}
            >
              <span>⏩</span>
              <span>SALTAR TEXTOS (TEST)</span>
            </button>
          </div>

          <div className="relative z-10 w-[96%] pointer-events-auto flex flex-col items-end">
            <PixelSpeechBubble
              speaker={
                language === "nah"
                  ? currentNarrativeConfig.nameNah
                  : currentNarrativeConfig.nameEs
              }
              messages={currentConversationMessages}
              actionKey="E"
              disabled={isPaused}
              isDismissing={npcConversationState === "exiting"}
              portraits={currentPortraits}
              onLineChange={() => {
                setIsWalking(false);
                setLastDirection("4");
              }}
              onDismiss={() => {
                setNpcConversationState("exiting");
                narrativeQueueRef.current.dismissConversation();
                setArrivalDialogueState("idle");
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
