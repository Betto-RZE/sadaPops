import { useState, useEffect, useRef, useCallback } from "react";
import {
  type AncianaAnimation,
  ANCIANA_DEFAULTS,
  releaseAncianaImages,
  stepAncianaMovement,
  updateAncianaSpawnDelay,
} from "./ancianaConfig";

export type AncianaStatus = "waiting_spawn" | "walking" | "arrived";

export interface AncianaNpcState {
  /** Posición actual en el sistema porcentual del escenario { x, y } */
  position: { x: number; y: number };
  /** Estado del ciclo: 'waiting_spawn' esperando retardo, 'walking' avanzando, 'arrived' frente a la mesa */
  status: AncianaStatus;
  /** Animación actual del sprite ('side' | 'front' | 'back') */
  currentAnimation: AncianaAnimation;
  /** Indica si sus pies están en movimiento */
  isWalking: boolean;
  /** Indica si la anciana ya apareció activamente en el escenario */
  isActive: boolean;
}

export interface UseAncianaNpcProps {
  /** Pausa física y temporal de la simulación */
  isPaused: boolean;
  /** Disparador que indica que el primer NPC genérico terminó su animación de IDLE */
  isTriggered?: boolean;
  /** Tiempo de espera tras el disparo antes de aparecer (por defecto 4000 ms = 4 segundos) */
  spawnDelayMs?: number;
  /** Posición inicial opcional para pruebas o personalización */
  startPosition?: { x: number; y: number };
  /** Posición de destino en la mesa directiva */
  targetPosition?: { x: number; y: number };
  /** Velocidad de caminata en línea recta (% por segundo) */
  speed?: number;
}

export interface UseAncianaNpcReturn extends AncianaNpcState {
  /** Tiempo transcurrido de espera tras el disparo (ms) */
  elapsedDelayMs: number;
  /** Reinicia la posición y estado de la anciana al inicio del camino derecho */
  resetAnciana: () => void;
}

/**
 * Hook que gestiona el ciclo de vida, la aparición temporizada y la caminata en línea recta de la Anciana (Abuela).
 *
 * Flujo de comportamiento:
 * 1. Espera a que el primer NPC genérico termine de votar ('IDLE' -> 'LEAVING').
 * 2. Cuenta exactamente 4 segundos (4000 ms) tras dicha transición.
 * 3. Aparece en el camino derecho (`x: 102.0%, y: 62.5%`) con la animación "side".
 * 4. Camina en línea recta horizontal hacia la izquierda a velocidad constante.
 * 5. Se detiene frente a la mesa directiva (de lado derecho, `x: 27.5%, y: 62.5%`) con frame estático.
 */
export function useAncianaNpc({
  isPaused,
  isTriggered,
  spawnDelayMs = ANCIANA_DEFAULTS.spawnDelayMs,
  startPosition = ANCIANA_DEFAULTS.startPosition,
  targetPosition = ANCIANA_DEFAULTS.targetPosition,
  speed = ANCIANA_DEFAULTS.speed,
}: UseAncianaNpcProps): UseAncianaNpcReturn {
  // Si no se especifica isTriggered (modo manual o pruebas aisladas), arranca inmediatamente
  const shouldStartImmediately =
    isTriggered === undefined || (isTriggered && spawnDelayMs <= 0);

  const initialStatus: AncianaStatus = shouldStartImmediately
    ? "walking"
    : "waiting_spawn";

  const [position, setPosition] = useState<{ x: number; y: number }>(startPosition);
  const [status, setStatus] = useState<AncianaStatus>(initialStatus);
  const [currentAnimation] = useState<AncianaAnimation>("side");
  const [isWalking, setIsWalking] = useState(shouldStartImmediately);
  const [isActive, setIsActive] = useState(shouldStartImmediately);
  const [elapsedDelayMs, setElapsedDelayMs] = useState(0);

  const isPausedRef = useRef(isPaused);
  const isTriggeredRef = useRef(isTriggered ?? true);
  const positionRef = useRef(position);
  const statusRef = useRef(status);
  const elapsedMsRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isTriggeredRef.current = isTriggered ?? true;
  }, [isTriggered]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      releaseAncianaImages();
    };
  }, []);

  const resetAnciana = useCallback(() => {
    const startWalking =
      isTriggered === undefined || (isTriggered && spawnDelayMs <= 0);
    const nextStatus: AncianaStatus = startWalking
      ? "walking"
      : "waiting_spawn";

    setPosition(startPosition);
    setStatus(nextStatus);
    setIsWalking(startWalking);
    setIsActive(startWalking);
    setElapsedDelayMs(0);

    positionRef.current = startPosition;
    statusRef.current = nextStatus;
    elapsedMsRef.current = 0;
  }, [startPosition, isTriggered, spawnDelayMs]);

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
        // Fase 1: Cuenta regresiva de espera previa a la aparición
        if (statusRef.current === "waiting_spawn") {
          const delayProgress = updateAncianaSpawnDelay({
            isTriggered: isTriggeredRef.current,
            elapsedMs: elapsedMsRef.current,
            delayMs: spawnDelayMs,
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
        // Fase 2: Caminata en línea recta hacia la mesa directiva
        else if (statusRef.current === "walking") {
          const step = stepAncianaMovement({
            currentPos: positionRef.current,
            targetPos: targetPosition,
            speed,
            dt,
          });

          if (isMountedRef.current) {
            setPosition(step.nextPos);
            if (step.isArrived) {
              statusRef.current = "arrived";
              setStatus("arrived");
              setIsWalking(false);
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
  }, [spawnDelayMs, targetPosition, speed]);

  return {
    position,
    status,
    currentAnimation,
    isWalking,
    isActive,
    elapsedDelayMs,
    resetAnciana,
  };
}
