import { useState, useEffect, useRef, useCallback } from "react";
import {
  type NarrativeCharacterId,
  type NarrativeCharacterConfig,
  NARRATIVE_CHARACTERS_ORDER,
  NARRATIVE_CHARACTERS_CONFIG,
  BETWEEN_CHARACTERS_DELAY_MS,
  ANCIANA_DEFAULTS,
  stepAncianaMovement,
  stepNarrativeRetreatMovement,
  updateAncianaSpawnDelay,
  updateQueueTransitionDelay,
} from "./ancianaConfig";

export type QueueStatus =
  | "waiting_initial_spawn"
  | "walking"
  | "arrived"
  | "in_conversation"
  | "leaving"
  | "waiting_next_character"
  | "all_completed";

export interface NarrativeNpcQueueState {
  /** Índice del personaje actual (0 a 4) */
  currentIndex: number;
  /** Identificador único del personaje actual */
  currentCharacterId: NarrativeCharacterId;
  /** Configuración completa del personaje actual (nombres, colores, retratos, diálogos) */
  currentCharacterConfig: NarrativeCharacterConfig;
  /** Estado del ciclo del personaje en la cola */
  status: QueueStatus;
  /** Posición actual en el sistema de coordenadas porcentuales { x, y } */
  position: { x: number; y: number };
  /** Indica si sus pies están en movimiento horizontal */
  isWalking: boolean;
  /** Indica si hay un personaje activo y visible en el escenario */
  isActive: boolean;
  /** Dirección hacia donde mira el personaje ('left' al avanzar o estar en mesa, 'right' al retirarse) */
  facingDirection: "left" | "right";
}

export interface UseNarrativeNpcsQueueProps {
  /** Pausa física y temporal de la simulación */
  isPaused: boolean;
  /** Disparador que indica que el primer NPC genérico terminó su animación de IDLE */
  isTriggered?: boolean;
  /** Tiempo de espera inicial para el primer personaje (por defecto 4000 ms) */
  initialSpawnDelayMs?: number;
  /** Tiempo de espera entre personajes tras finalizar una conversación (por defecto 10000 ms = 10s) */
  betweenCharactersDelayMs?: number;
  /** Posición inicial en el camino derecho */
  startPosition?: { x: number; y: number };
  /** Posición de destino frente a la mesa directiva */
  targetPosition?: { x: number; y: number };
  /** Velocidad de caminata en línea recta (% por segundo) */
  speed?: number;
}

export interface UseNarrativeNpcsQueueReturn extends NarrativeNpcQueueState {
  /** Tiempo transcurrido de espera en la fase actual (ms) */
  elapsedDelayMs: number;
  /** Tiempo restante de cuenta regresiva en segundos o ms para el siguiente personaje */
  remainingTransitionMs: number;
  /** Inicia la conversación con el personaje actual en la mesa */
  startConversation: () => void;
  /** Concluye la conversación y activa el retardo de 10 segundos antes del siguiente personaje */
  dismissConversation: () => void;
  /** Salta inmediatamente al siguiente personaje (para pruebas y depuración) */
  skipToNextCharacter: () => void;
  /** Reinicia la cola completa desde el personaje 0 (anciana) */
  resetQueue: () => void;
}

/**
 * Hook que gestiona la cola secuencial de los 5 personajes narrativos del Capítulo 2:
 * 1. anciana (Doña Carmen)
 * 2. joven (El Joven)
 * 3. indigena (Citlali)
 * 4. transgenero (Morgan)
 * 5. discapacitado (Don Roberto)
 *
 * Cada personaje:
 * - Llega desde el camino derecho (x: 102.0%, y: 66.0%) caminando hacia la mesa (x: 26.0%, y: 66.0%).
 * - Al llegar muestra el icono de interacción en el lado izquierdo de la mesa (x: 14.0%, y: 60.0%).
 * - Al terminar su conversación, transcurre un retardo exacto de 10 segundos (10,000 ms).
 * - Concluidos los 10 segundos, aparece el siguiente personaje de la cola.
 */
export function useNarrativeNpcsQueue({
  isPaused,
  isTriggered,
  initialSpawnDelayMs = ANCIANA_DEFAULTS.spawnDelayMs,
  betweenCharactersDelayMs = BETWEEN_CHARACTERS_DELAY_MS,
  startPosition = ANCIANA_DEFAULTS.startPosition,
  targetPosition = ANCIANA_DEFAULTS.targetPosition,
  speed = ANCIANA_DEFAULTS.speed,
}: UseNarrativeNpcsQueueProps): UseNarrativeNpcsQueueReturn {
  const shouldStartImmediately =
    isTriggered === undefined || (isTriggered && initialSpawnDelayMs <= 0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<QueueStatus>(
    shouldStartImmediately ? "walking" : "waiting_initial_spawn",
  );
  const [position, setPosition] = useState<{ x: number; y: number }>(startPosition);
  const [isWalking, setIsWalking] = useState(shouldStartImmediately);
  const [isActive, setIsActive] = useState(shouldStartImmediately);
  const [elapsedDelayMs, setElapsedDelayMs] = useState(0);
  const [remainingTransitionMs, setRemainingTransitionMs] = useState(0);

  const isPausedRef = useRef(isPaused);
  const isTriggeredRef = useRef(isTriggered ?? true);
  const currentIndexRef = useRef(currentIndex);
  const statusRef = useRef(status);
  const positionRef = useRef(position);
  const elapsedMsRef = useRef(0);
  const transitionElapsedMsRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isTriggeredRef.current = isTriggered ?? true;
  }, [isTriggered]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const currentCharacterId = NARRATIVE_CHARACTERS_ORDER[currentIndex] || "anciana";
  const currentCharacterConfig = NARRATIVE_CHARACTERS_CONFIG[currentCharacterId];

  /** Inicia la conversación con el interlocutor en la mesa */
  const startConversation = useCallback(() => {
    if (statusRef.current === "arrived") {
      statusRef.current = "in_conversation";
      setStatus("in_conversation");
      setIsWalking(false);
    }
  }, []);

  /**
   * Concluye la conversación actual e inicia el retiro provisional del personaje.
   * El personaje camina desde la mesa directiva (x: 26.0%) hacia el lado derecho del escenario (x: 102.0%).
   * Al cruzar el borde derecho, concluye su salida y se activa el retardo de 10 segundos
   * antes de la llegada del siguiente personaje.
   */
  const dismissConversation = useCallback(() => {
    statusRef.current = "leaving";
    setStatus("leaving");
    setIsActive(true);
    setIsWalking(true);
  }, []);

  /** Salta inmediatamente al siguiente personaje sin esperar los 10 segundos */
  const skipToNextCharacter = useCallback(() => {
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < NARRATIVE_CHARACTERS_ORDER.length) {
      currentIndexRef.current = nextIdx;
      statusRef.current = "walking";
      positionRef.current = startPosition;
      transitionElapsedMsRef.current = 0;

      setCurrentIndex(nextIdx);
      setStatus("walking");
      setPosition(startPosition);
      setIsActive(true);
      setIsWalking(true);
      setRemainingTransitionMs(0);
    } else {
      statusRef.current = "all_completed";
      setStatus("all_completed");
      setIsActive(false);
      setIsWalking(false);
      setRemainingTransitionMs(0);
    }
  }, [startPosition]);

  /** Reinicia la cola completa desde el personaje 0 (anciana) */
  const resetQueue = useCallback(() => {
    const startWalking =
      isTriggered === undefined || (isTriggered && initialSpawnDelayMs <= 0);
    const nextStatus: QueueStatus = startWalking
      ? "walking"
      : "waiting_initial_spawn";

    currentIndexRef.current = 0;
    statusRef.current = nextStatus;
    positionRef.current = startPosition;
    elapsedMsRef.current = 0;
    transitionElapsedMsRef.current = 0;

    setCurrentIndex(0);
    setStatus(nextStatus);
    setPosition(startPosition);
    setIsWalking(startWalking);
    setIsActive(startWalking);
    setElapsedDelayMs(0);
    setRemainingTransitionMs(0);
  }, [startPosition, isTriggered, initialSpawnDelayMs]);

  // Bucle de simulación física y temporal para la cola
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        lastTime = performance.now();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    const loop = (currentTime: number) => {
      if (typeof document !== "undefined" && document.hidden) {
        lastTime = currentTime;
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (!isPausedRef.current) {
        // Fase 1: Espera inicial del primer personaje (4000 ms tras IDLE del primer NPC)
        if (statusRef.current === "waiting_initial_spawn") {
          const delayProgress = updateAncianaSpawnDelay({
            isTriggered: isTriggeredRef.current,
            elapsedMs: elapsedMsRef.current,
            delayMs: initialSpawnDelayMs,
            dtSeconds: dt,
          });

          elapsedMsRef.current = delayProgress.newElapsedMs;

          if (isMountedRef.current) {
            setElapsedDelayMs(delayProgress.newElapsedMs);
          }

          if (delayProgress.shouldSpawn) {
            statusRef.current = "walking";
            if (isMountedRef.current) {
              setStatus("walking");
              setIsActive(true);
              setIsWalking(true);
            }
          }
        }
        // Fase 2: Caminata en línea recta hacia la mesa directiva (x: 102 -> x: 26)
        else if (statusRef.current === "walking") {
          const step = stepAncianaMovement({
            currentPos: positionRef.current,
            targetPos: targetPosition,
            speed,
            dt,
          });

          positionRef.current = step.nextPos;

          if (isMountedRef.current) {
            setPosition(step.nextPos);
            if (step.isArrived) {
              statusRef.current = "arrived";
              setStatus("arrived");
              setIsWalking(false);
            }
          }
        }
        // Fase 3 (Provisional): Retiro del personaje caminando de regreso al lado derecho (x: 26 -> x: 102)
        else if (statusRef.current === "leaving") {
          const step = stepNarrativeRetreatMovement({
            currentPos: positionRef.current,
            targetPos: startPosition,
            speed,
            dt,
          });

          positionRef.current = step.nextPos;

          if (isMountedRef.current) {
            setPosition(step.nextPos);
            if (step.isArrived) {
              const nextIdx = currentIndexRef.current + 1;
              if (nextIdx < NARRATIVE_CHARACTERS_ORDER.length) {
                statusRef.current = "waiting_next_character";
                transitionElapsedMsRef.current = 0;
                setStatus("waiting_next_character");
                setIsActive(false);
                setIsWalking(false);
                setRemainingTransitionMs(betweenCharactersDelayMs);
              } else {
                statusRef.current = "all_completed";
                setStatus("all_completed");
                setIsActive(false);
                setIsWalking(false);
                setRemainingTransitionMs(0);
              }
            }
          }
        }
        // Fase 4: Espera de 10 segundos entre personajes tras finalizar el retiro
        else if (statusRef.current === "waiting_next_character") {
          const transitionProgress = updateQueueTransitionDelay({
            elapsedMs: transitionElapsedMsRef.current,
            dtSeconds: dt,
            delayMs: betweenCharactersDelayMs,
          });

          transitionElapsedMsRef.current = transitionProgress.newElapsedMs;
          const remainingMs = Math.max(
            0,
            betweenCharactersDelayMs - transitionProgress.newElapsedMs,
          );

          if (isMountedRef.current) {
            setRemainingTransitionMs(remainingMs);
          }

          if (transitionProgress.isReady) {
            const nextIdx = currentIndexRef.current + 1;
            if (nextIdx < NARRATIVE_CHARACTERS_ORDER.length) {
              currentIndexRef.current = nextIdx;
              statusRef.current = "walking";
              positionRef.current = startPosition;
              transitionElapsedMsRef.current = 0;

              if (isMountedRef.current) {
                setCurrentIndex(nextIdx);
                setStatus("walking");
                setPosition(startPosition);
                setIsActive(true);
                setIsWalking(true);
                setRemainingTransitionMs(0);
              }
            } else {
              statusRef.current = "all_completed";
              if (isMountedRef.current) {
                setStatus("all_completed");
                setIsActive(false);
                setIsWalking(false);
                setRemainingTransitionMs(0);
              }
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [
    initialSpawnDelayMs,
    betweenCharactersDelayMs,
    startPosition,
    targetPosition,
    speed,
  ]);

  const facingDirection: "left" | "right" = status === "leaving" ? "right" : "left";

  return {
    currentIndex,
    currentCharacterId,
    currentCharacterConfig,
    status,
    position,
    isWalking,
    isActive,
    facingDirection,
    elapsedDelayMs,
    remainingTransitionMs,
    startConversation,
    dismissConversation,
    skipToNextCharacter,
    resetQueue,
  };
}
