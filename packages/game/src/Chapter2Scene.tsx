import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
  applyMesaSlidingDeltas,
  getLeftBoundaryX,
  getRightBoundaryX,
  getBaseRightBoundaryX,
  EXCLAMATION_ICON_WIDTH,
} from "./GameplayScene";
import { OffscreenWaypointArrow } from "./OffscreenWaypointArrow";
import type { ChapterSceneProps } from "./features/capitulos/ChapterSceneRouter";
import {
  getChapterHandoff,
  setChapterHandoff,
  CAP1_OUTRO_CAP2_INTRO_MESSAGES_ES,
  CAP1_OUTRO_CAP2_INTRO_MESSAGES_NAH,
  CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES,
  CAP2_OUTRO_CAP3_INTRO_MESSAGES_NAH,
  type PlayerDirection,
} from "./features/capitulos/chapterHandoff";
import {
  useGenericNpcs,
  useCinematicNpcCamera,
  GenericNpcSprite,
  GENERIC_NPC_DEFAULTS,
  GENERIC_NPC_TINT_VARIANTS,
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
  getDistanceToInteractionIcon,
  calculatePlayerAlignedPositionWithNpc,
  stepPlayerAlignmentWalk,
  PLAYER_ALIGNMENT_WALK_SPEED,
  getNarrativeCharacterPortraits,
  BETWEEN_CHARACTERS_DELAY_MS,
} from "./features/mitos";
import { CastShadow, DECORATION_SHADOWS } from "./features/sombras";
import { PlazaAmbience } from "./features/ambientacion";

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

/** Espera antes del primer globo de texto al iniciar el capitulo (diálogo puente). */
const INTRO_DELAY_MS = 2500;

/** Tiempo de espera entre el diálogo puente y la llegada del primer NPC con el segundo diálogo (3 segundos). */
const BETWEEN_INTRO_DIALOGUES_DELAY_MS = 3000;

/** Posicion por defecto (modo CAPITULOS): a la izquierda de la mesa de funcionarios (donde concluye el Cap 1). */
const DEFAULT_PLAYER_POS = { x: 15.0, y: 58.0 };

type BridgeDialogueState =
  | "initial_delay"
  | "entering"
  | "visible"
  | "exiting"
  | "dismissed";

type VoterDialogueState =
  | "idle"
  | "waiting_delay"
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
  onChapterComplete,
}: ChapterSceneProps) {
  // Lectura sin efectos (segura con StrictMode). Se limpia al iniciar otra sesion.
  const [playerPos, setPlayerPos] = useState(
    () => getChapterHandoff()?.playerPos ?? DEFAULT_PLAYER_POS,
  );
  const [lastDirection, setLastDirection] = useState<PlayerDirection>(
    () => getChapterHandoff()?.lastDirection ?? "1",
  );
  const [isWalking, setIsWalking] = useState(false);
  // 1. Diálogo puente de inicio del Capítulo 2 (mismo con el que termina el Capítulo 1)
  const [bridgeDialogueState, setBridgeDialogueState] =
    useState<BridgeDialogueState>("initial_delay");

  // 2. Diálogo de llegada de los primeros votantes (se abre 3s después de cerrar el diálogo puente)
  const [voterDialogueState, setVoterDialogueState] =
    useState<VoterDialogueState>("idle");

  // Detención del spawn de NPCs genéricos cuando se inicia la conversación con Don Roberto (discapacitado)
  const [isGenericSpawningStopped, setIsGenericSpawningStopped] =
    useState(false);

  // El primer NPC genérico aparece y empieza a caminar exactamente cuando inicia el diálogo de votantes
  const genericNpcDialogueState =
    voterDialogueState === "entering" ||
    voterDialogueState === "visible" ||
    voterDialogueState === "exiting" ||
    voterDialogueState === "dismissed"
      ? voterDialogueState
      : "initial_delay";

  // Sistema de personajes genéricos (votantes ambientales)
  const { npcs, isGlobalSystemActive } = useGenericNpcs({
    dialogueState: genericNpcDialogueState,
    isPaused,
    isSpawningDisabled: isGenericSpawningStopped,
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
    betweenCharactersDelayMs: BETWEEN_CHARACTERS_DELAY_MS,
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
      voterDialogueState === "dismissed"
    ) {
      setArrivalDialogueState("entering");
    }
  }, [narrativeQueue.status, arrivalDialogueState, voterDialogueState]);

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

  // Diálogo de cierre del Capítulo 2 y traspaso al Capítulo 3:
  // Se activa al concluir el retiro del 5to personaje (Don Roberto sale de escena: narrativeQueue.status === "all_completed").
  // Se bloquea el teclado inmediatamente por 2.5 segundos (INTRO_DELAY_MS) antes de abrir el globo de texto.
  type OutroDialogueState =
    | "idle"
    | "initial_delay"
    | "entering"
    | "visible"
    | "exiting"
    | "dismissed";

  const [outroDialogueState, setOutroDialogueState] =
    useState<OutroDialogueState>("idle");
  const outroDialogueStateRef = useRef(outroDialogueState);
  useEffect(() => {
    outroDialogueStateRef.current = outroDialogueState;
  }, [outroDialogueState]);

  const chapter2CompletedRef = useRef(false);

  useEffect(() => {
    if (
      narrativeQueue.status === "all_completed" &&
      outroDialogueState === "idle" &&
      !chapter2CompletedRef.current
    ) {
      setOutroDialogueState("initial_delay");
    }
  }, [narrativeQueue.status, outroDialogueState]);

  useEffect(() => {
    if (outroDialogueState === "initial_delay") {
      const timer = setTimeout(() => {
        setOutroDialogueState("entering");
      }, INTRO_DELAY_MS);
      return () => clearTimeout(timer);
    }
    if (outroDialogueState === "entering") {
      const timer = setTimeout(() => setOutroDialogueState("visible"), 350);
      return () => clearTimeout(timer);
    }
    if (outroDialogueState === "exiting") {
      const timer = setTimeout(() => setOutroDialogueState("dismissed"), 350);
      return () => clearTimeout(timer);
    }
  }, [outroDialogueState]);

  const onChapterCompleteRef = useRef(onChapterComplete);
  useEffect(() => {
    onChapterCompleteRef.current = onChapterComplete;
  }, [onChapterComplete]);

  // Fin del Capitulo 2: todos los personajes atendidos y el monólogo final ya cerrado.
  // Se espera 2.5 segundos tras cerrar el último globo de texto antes de concluir el capítulo
  // (exactamente igual que en el fin del Capítulo 1), permitiendo una transición suave
  // hacia el menú o siguiente escena sin cortes abruptos.
  useEffect(() => {
    if (chapter2CompletedRef.current) return;
    if (outroDialogueState === "dismissed") {
      const timer = setTimeout(() => {
        chapter2CompletedRef.current = true;
        setChapterHandoff({
          playerPos: playerPosRef.current,
          lastDirection: lastDirectionRef.current,
          fromChapter2Ending: true,
        });
        onChapterCompleteRef.current?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [outroDialogueState]);

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

  // Detección de proximidad al lado izquierdo de la mesa tomando como referencia
  // la distancia entre la cabeza del protagonista y el icono flotante de interacción (!)
  const distToMesaLeft = getDistanceToInteractionIcon(playerPos);
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
    if (narrativeQueue.currentCharacterId === "discapacitado") {
      setIsGenericSpawningStopped(true);
    }
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
  const bridgeDialogueStateRef = useRef(bridgeDialogueState);
  const voterDialogueStateRef = useRef(voterDialogueState);
  const playerPosRef = useRef(playerPos);
  const lastDirectionRef = useRef(lastDirection);
  useEffect(() => {
    lastDirectionRef.current = lastDirection;
  }, [lastDirection]);
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

  useEffect(() => {
    if (
      narrativeQueue.currentCharacterId === "discapacitado" &&
      (npcConversationState !== "idle" ||
        narrativeQueue.status === "in_conversation" ||
        narrativeQueue.status === "leaving" ||
        narrativeQueue.status === "all_completed")
    ) {
      setIsGenericSpawningStopped(true);
    }
  }, [
    narrativeQueue.currentCharacterId,
    npcConversationState,
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
    bridgeDialogueStateRef.current = bridgeDialogueState;
  }, [bridgeDialogueState]);
  useEffect(() => {
    voterDialogueStateRef.current = voterDialogueState;
  }, [voterDialogueState]);
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);
  useEffect(() => {
    npcsRef.current = npcs;
  }, [npcs]);

  // 1. Contador de 2.5 s para el diálogo puente inicial (cierre de Cap 1) y animación del globo
  useEffect(() => {
    if (isTransitioning) return;

    if (bridgeDialogueState === "initial_delay") {
      const timer = setTimeout(
        () => setBridgeDialogueState("entering"),
        INTRO_DELAY_MS,
      );
      return () => clearTimeout(timer);
    }
    if (bridgeDialogueState === "entering") {
      const timer = setTimeout(() => setBridgeDialogueState("visible"), 350);
      return () => clearTimeout(timer);
    }
    if (bridgeDialogueState === "exiting") {
      const timer = setTimeout(() => setBridgeDialogueState("dismissed"), 350);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, bridgeDialogueState]);

  // 2. Tras cerrar el diálogo puente, pasan 3 segundos de espera antes de que aparezca
  // el primer NPC genérico junto con el globo de texto de "¡Mira nada más! ¡Ya comenzaron a llegar..."
  useEffect(() => {
    if (bridgeDialogueState === "dismissed" && voterDialogueState === "idle") {
      setVoterDialogueState("waiting_delay");
    }
  }, [bridgeDialogueState, voterDialogueState]);

  useEffect(() => {
    if (voterDialogueState === "waiting_delay") {
      const timer = setTimeout(() => {
        setVoterDialogueState("entering");
      }, BETWEEN_INTRO_DIALOGUES_DELAY_MS);
      return () => clearTimeout(timer);
    }
    if (voterDialogueState === "entering") {
      const timer = setTimeout(() => setVoterDialogueState("visible"), 350);
      return () => clearTimeout(timer);
    }
    if (voterDialogueState === "exiting") {
      const timer = setTimeout(() => setVoterDialogueState("dismissed"), 350);
      return () => clearTimeout(timer);
    }
  }, [voterDialogueState]);

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

      // Prevenir el scroll nativo de la página web con flechas direccionales o espacio
      if (
        key === "arrowup" ||
        key === "arrowdown" ||
        key === "arrowleft" ||
        key === "arrowright" ||
        key === " " ||
        key === "spacebar" ||
        e.code === "Space"
      ) {
        e.preventDefault();
      }

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

      // Sin movimiento de controles hasta cerrar los diálogos iniciales (puente y votantes),
      // el de llegada del personaje, o la conversación directa con él.
      // Durante diálogos se prioriza la estabilidad de la conversación y orientación.
      const isAnyDialogueActive =
        bridgeDialogueStateRef.current !== "dismissed" ||
        voterDialogueStateRef.current !== "dismissed" ||
        (arrivalDialogueStateRef.current !== "idle" &&
          arrivalDialogueStateRef.current !== "dismissed") ||
        (npcConversationStateRef.current !== "idle" &&
          npcConversationStateRef.current !== "dismissed") ||
        (outroDialogueStateRef.current !== "idle" &&
          outroDialogueStateRef.current !== "dismissed");

      if (isAnyDialogueActive) {
        stop();
        if (
          bridgeDialogueStateRef.current === "entering" ||
          bridgeDialogueStateRef.current === "visible" ||
          voterDialogueStateRef.current === "entering" ||
          voterDialogueStateRef.current === "visible" ||
          arrivalDialogueStateRef.current === "entering" ||
          arrivalDialogueStateRef.current === "visible" ||
          outroDialogueStateRef.current === "entering" ||
          outroDialogueStateRef.current === "visible"
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

          // Deslizamiento suave sobre la mesa directiva (idéntico a los límites de la explanada)
          const mesaDeltas = applyMesaSlidingDeltas(
            prev,
            effectiveDx,
            effectiveDy,
          );
          effectiveDx = mesaDeltas.dx;
          effectiveDy = mesaDeltas.dy;

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
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      }
    };
  }, []);

  // Cámara cinematográfica dinámica:
  // 1. Sigue suavemente al primer NPC al entrar, espera 2.5s en la mampara y regresa suavemente al jugador.
  // 2. Al llegar un personaje a la mesa, enfoca al personaje durante 1.5 segundos y regresa suavemente al jugador.
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
      durationMs: 1500,
    },
  });

  const bridgeMessages =
    language === "nah"
      ? (CAP1_OUTRO_CAP2_INTRO_MESSAGES_NAH as unknown as string[])
      : (CAP1_OUTRO_CAP2_INTRO_MESSAGES_ES as unknown as string[]);
  const showBridgeDialogue =
    bridgeDialogueState !== "initial_delay" &&
    bridgeDialogueState !== "dismissed";

  const voterMessages =
    language === "nah" ? INTRO_CAP2_MESSAGES_NAH : INTRO_CAP2_MESSAGES_ES;
  const showVoterDialogue =
    voterDialogueState !== "idle" &&
    voterDialogueState !== "waiting_delay" &&
    voterDialogueState !== "dismissed";

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

  const showOutroDialogue =
    outroDialogueState !== "idle" &&
    outroDialogueState !== "initial_delay" &&
    outroDialogueState !== "dismissed";

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

  // Objetivo activo con signo de exclamación flotante (!) para la flecha indicadora
  const activeExclamationTarget = showMesaExclamation
    ? MESA_INTERACTION_LEFT_POS
    : null;

  return (
    <div
      data-testid="chapter-scene-2"
      className="absolute inset-0 w-full h-full z-20 overflow-hidden bg-[#2d572c] select-none"
    >
      {/* Microanimaciones para el icono flotante de exclamación y texto pixel art */}
      <style>{`
        @keyframes pixelArrowPulse {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(clamp(3px, 0.4cqw, 8px)); }
        }
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
          className={`pointer-events-auto bg-[#f9d7ea] hover:bg-[#f6c2e0] rounded-md ring-2 ring-white ring-inset active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-colors flex items-center justify-center cursor-pointer font-mono font-black text-black shrink-0 ${
            isFullscreen
              ? "w-12 h-12 text-xl border-[4px] border-[#b5146c] shadow-[4px_4px_0px_0px_#7a0c47]"
              : "w-9 h-9 text-sm border-[3px] border-[#b5146c] shadow-[3px_3px_0px_0px_#7a0c47]"
          }`}
        >
          <span>◀</span>
        </button>
      </div>

      {/* OFF-SCREEN WAYPOINT ARROW (Flecha pixel art con movimiento fluido en 60 FPS) */}
      <OffscreenWaypointArrow
        target={activeExclamationTarget}
        camX={camX}
        camY={camY}
        zoomScale={zoomScale}
      />

      {/* MUNDO CON CAMARA DINAMICA */}
      <div
        className="absolute inset-0 w-full h-full z-10"
        style={{
          transform: `scale(${zoomScale}) translate(${camX}%, ${camY}%)`,
          transformOrigin: "center center",
          willChange: "transform",
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
              filter={
                npc.assignedMamparaId % 2 === 0
                  ? GENERIC_NPC_TINT_VARIANTS.moradito
                  : GENERIC_NPC_TINT_VARIANTS.rosita
              }
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
            <CastShadow src="/assets/juego/casilla.png" preset="tall" />
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
          <CastShadow src="/assets/juego/mesa.png" preset="mesa" />
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
              zIndex: NPC_DEPTH_LAYERS.interactionIconLayer,
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

        {/* BOLETAS SOBRE LAS MAMPARAS (sin sombra a petición de diseño) */}
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

        {/* AMBIENTACIÓN DINÁMICA: RAYOS DE LUZ, PARTÍCULAS, PÉTALOS Y MARIPOSITAS EN ÁREAS VERDES */}
        <PlazaAmbience isPaused={isPaused} />
      </div>

      {/* DIÁLOGO 1: PUENTE DESDE CAPÍTULO 1 / INICIO DEL CAPÍTULO 2 */}
      {showBridgeDialogue && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-center pb-[1.8cqw] px-[2cqw] overflow-hidden select-none">
          <div className="relative z-10 w-[96%] pointer-events-auto flex flex-col items-end">
            <PixelSpeechBubble
              speaker={language === "nah" ? "Inecito Cívica" : "Inecito"}
              messages={bridgeMessages}
              actionKey="E"
              disabled={isPaused}
              isDismissing={bridgeDialogueState === "exiting"}
              onLineChange={() => {
                setIsWalking(false);
                setLastDirection("1");
              }}
              onDismiss={() => setBridgeDialogueState("exiting")}
            />
          </div>
        </div>
      )}

      {/* DIÁLOGO 2: LLEGADA DE LOS PRIMEROS VOTANTES (GENÉRICOS) */}
      {showVoterDialogue && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-center pb-[1.8cqw] px-[2cqw] overflow-hidden select-none">
          <div className="relative z-10 w-[96%] pointer-events-auto flex flex-col items-end">
            <PixelSpeechBubble
              speaker={language === "nah" ? "Inecito Cívica" : "Inecito"}
              messages={voterMessages}
              actionKey="E"
              disabled={isPaused}
              isDismissing={voterDialogueState === "exiting"}
              onLineChange={() => {
                setIsWalking(false);
                setLastDirection("1");
              }}
              onDismiss={() => setVoterDialogueState("exiting")}
            />
          </div>
        </div>
      )}

      {/* DIÁLOGO DE LLEGADA DEL PERSONAJE A LA MESA */}
      {showArrivalDialogue && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-center pb-[1.8cqw] px-[2cqw] overflow-hidden select-none">
          <div className="relative z-10 w-[96%] pointer-events-auto flex flex-col items-end">
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
          {/* Capa de desenfoque y oscurecimiento cinematográfico de fondo (Backdrop Blur optimizado) */}
          <div
            className={`absolute inset-0 pointer-events-none transition-[opacity,backdrop-filter,background-color] duration-500 ease-out ${
              npcConversationState === "exiting" ? "opacity-0" : "opacity-100"
            }`}
            style={{
              backdropFilter:
                npcConversationState === "exiting" ? "blur(0px)" : "blur(5px)",
              WebkitBackdropFilter:
                npcConversationState === "exiting" ? "blur(0px)" : "blur(5px)",
              backgroundColor:
                npcConversationState === "exiting"
                  ? "rgba(0, 0, 0, 0)"
                  : "rgba(0, 0, 0, 0.35)",
              transform: "translateZ(0)",
              willChange: "opacity, backdrop-filter",
            }}
          />

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

      {/* DIÁLOGO DE CIERRE DEL CAPÍTULO 2 / PUENTE AL CAPÍTULO 3 */}
      {showOutroDialogue && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-center pb-[1.8cqw] px-[2cqw] overflow-hidden select-none">
          <div className="relative z-10 w-[96%] pointer-events-auto flex flex-col items-end">
            <PixelSpeechBubble
              speaker={language === "nah" ? "Inecito Cívica" : "Inecito"}
              messages={
                language === "nah"
                  ? (CAP2_OUTRO_CAP3_INTRO_MESSAGES_NAH as unknown as string[])
                  : (CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES as unknown as string[])
              }
              actionKey="E"
              disabled={isPaused}
              isDismissing={outroDialogueState === "exiting"}
              onLineChange={() => {
                setIsWalking(false);
                setLastDirection("1");
              }}
              onDismiss={() => setOutroDialogueState("exiting")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
