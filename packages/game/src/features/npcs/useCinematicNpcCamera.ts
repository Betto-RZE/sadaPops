import { useState, useEffect, useRef } from "react";
import type { GenericNpc } from "./genericNpcTypes";

export type CinematicCameraState =
  | "INITIAL" // Esperando que el primer NPC entre en escena
  | "FOLLOWING_NPC" // Siguiendo suavemente al NPC mientras camina hacia la mampara
  | "HOLDING_AT_BOOTH" // Pausa de 2.5s con la cámara centrada en la mampara
  | "RETURNING_TO_PLAYER" // Regresando dinámicamente y con animación suave hacia el jugador
  | "COMPLETED"; // Regreso completado: cámara en modo normal

export interface UseCinematicNpcCameraProps {
  /** Posición actual del protagonista { x, y } en % */
  playerPos: { x: number; y: number };
  /** Primer NPC genérico en escena (o null/undefined si no existe aún) */
  firstNpc: GenericNpc | null | undefined;
  /** Indica si el juego está en pausa */
  isPaused: boolean;
  /** Escala de zoom de la cámara (por defecto 2.0) */
  zoomScale?: number;
  /** Tiempo de espera en la mampara antes de regresar (por defecto 2500 ms) */
  holdDurationMs?: number;
  /** Velocidad de interpolación exponencial al seguir al NPC (por defecto 2.8) */
  followSmoothingSpeed?: number;
  /** Velocidad de interpolación exponencial al regresar al jugador (por defecto 2.6) */
  returnSmoothingSpeed?: number;
}

export interface UseCinematicNpcCameraReturn {
  /** Desplazamiento X actual de la cámara (%) */
  camX: number;
  /** Desplazamiento Y actual de la cámara (%) */
  camY: number;
  /** Estado actual de la cámara cinematográfica */
  cameraState: CinematicCameraState;
  /** Indica si la cámara está en transición cinematográfica */
  isCinematicActive: boolean;
}

/**
 * Calcula el desplazamiento de la cámara para centrar un objetivo en coordenadas mundiales,
 * respetando el límite máximo de encuadre según la escala de zoom.
 */
export function calculateCameraShift(
  targetWorldPos: { x: number; y: number },
  zoomScale: number = 2.0,
): { x: number; y: number } {
  const maxCamShift = (1 - 1 / zoomScale) * 50;
  return {
    x: Math.min(maxCamShift, Math.max(-maxCamShift, 50 - targetWorldPos.x)),
    y: Math.min(maxCamShift, Math.max(-maxCamShift, 50 - targetWorldPos.y)),
  };
}

/**
 * Hook para gestionar la cámara cinematográfica dinámica y suave en el Capítulo 2.
 *
 * Flujo:
 * 1. Comienza enfocando normalmente al jugador.
 * 2. En cuanto el primer NPC genérico aparece y empieza a caminar ('ENTERING'), la cámara
 *    comienza una transición suave para seguir al votante hacia la mampara 3.
 * 3. Al llegar a la mampara ('IDLE'), la cámara permanece centrada durante 2.5 segundos.
 * 4. Cumplidos los 2.5 segundos, la cámara regresa suave y dinámicamente al jugador.
 * 5. Una vez restablecida, regresa al modo de seguimiento normal.
 */
export function useCinematicNpcCamera({
  playerPos,
  firstNpc,
  isPaused,
  zoomScale = 2.0,
  holdDurationMs = 2500,
  followSmoothingSpeed = 2.8,
  returnSmoothingSpeed = 2.6,
}: UseCinematicNpcCameraProps): UseCinematicNpcCameraReturn {
  const initialCam = calculateCameraShift(playerPos, zoomScale);
  const [camShift, setCamShift] = useState<{ x: number; y: number }>(
    initialCam,
  );
  const [cameraState, setCameraState] =
    useState<CinematicCameraState>("INITIAL");

  const isMountedRef = useRef(true);
  const stateRef = useRef<CinematicCameraState>("INITIAL");
  const camShiftRef = useRef<{ x: number; y: number }>(initialCam);
  const isPausedRef = useRef(isPaused);
  const playerPosRef = useRef(playerPos);
  const firstNpcRef = useRef(firstNpc);
  const holdElapsedMsRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);

  useEffect(() => {
    firstNpcRef.current = firstNpc;
  }, [firstNpc]);

  // Detector de disparo: cuando el primer NPC comienza a caminar ('ENTERING')
  // Optimización (Fase 5.4): depende de firstNpc?.state para evitar ejecuciones redundantes en cada frame
  useEffect(() => {
    if (
      stateRef.current === "INITIAL" &&
      firstNpc &&
      firstNpc.state === "ENTERING"
    ) {
      stateRef.current = "FOLLOWING_NPC";
      if (isMountedRef.current) {
        setCameraState("FOLLOWING_NPC");
      }
    }
  }, [firstNpc?.state]);

  // Detector de llegada: cuando el primer NPC cambia a 'IDLE' frente a la mampara
  // Optimización (Fase 5.4): depende de firstNpc?.state para evitar re-suscripciones durante el movimiento
  useEffect(() => {
    if (
      stateRef.current === "FOLLOWING_NPC" &&
      firstNpc &&
      firstNpc.state === "IDLE"
    ) {
      stateRef.current = "HOLDING_AT_BOOTH";
      holdElapsedMsRef.current = 0;
      if (isMountedRef.current) {
        setCameraState("HOLDING_AT_BOOTH");
      }
    }
  }, [firstNpc?.state]);

  // Bucle de actualización suave (rAF + dt)
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    // Política de pestañas inactivas (Fase 5.4):
    // Al recuperar foco/visibilidad, restablecer lastTime para evitar saltos o teletransportación de la cámara
    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        lastTime = performance.now();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    const loop = (currentTime: number) => {
      // Si el documento está oculto, pausar la cámara dinámicamente sin acumular tiempo
      if (typeof document !== "undefined" && document.hidden) {
        lastTime = currentTime;
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (!isPausedRef.current) {
        const currentState = stateRef.current;

        if (currentState === "COMPLETED") {
          // Seguimiento normal al jugador (directo)
          const target = calculateCameraShift(playerPosRef.current, zoomScale);
          camShiftRef.current = target;
          if (isMountedRef.current) {
            setCamShift(target);
          }
        } else if (currentState === "INITIAL") {
          // Normal antes de la cinemática
          const target = calculateCameraShift(playerPosRef.current, zoomScale);
          camShiftRef.current = target;
          if (isMountedRef.current) {
            setCamShift(target);
          }
        } else if (currentState === "FOLLOWING_NPC") {
          // Seguimiento dinámico al NPC mientras avanza hacia la mampara
          const npc = firstNpcRef.current;
          const targetWorld = npc ? npc.position : playerPosRef.current;
          const target = calculateCameraShift(targetWorld, zoomScale);

          const blend = 1 - Math.exp(-followSmoothingSpeed * dt);
          const nextX =
            camShiftRef.current.x + (target.x - camShiftRef.current.x) * blend;
          const nextY =
            camShiftRef.current.y + (target.y - camShiftRef.current.y) * blend;

          camShiftRef.current = { x: nextX, y: nextY };
          if (isMountedRef.current) {
            setCamShift({ x: nextX, y: nextY });
          }
        } else if (currentState === "HOLDING_AT_BOOTH") {
          // Centrado en la mampara durante holdDurationMs (2.5 s)
          const npc = firstNpcRef.current;
          const targetWorld = npc ? npc.position : { x: 52.0, y: 36.5 };
          const target = calculateCameraShift(targetWorld, zoomScale);

          const blend = 1 - Math.exp(-followSmoothingSpeed * dt);
          const nextX =
            camShiftRef.current.x + (target.x - camShiftRef.current.x) * blend;
          const nextY =
            camShiftRef.current.y + (target.y - camShiftRef.current.y) * blend;

          camShiftRef.current = { x: nextX, y: nextY };
          if (isMountedRef.current) {
            setCamShift({ x: nextX, y: nextY });
          }

          holdElapsedMsRef.current += dt * 1000;
          if (holdElapsedMsRef.current >= holdDurationMs) {
            stateRef.current = "RETURNING_TO_PLAYER";
            if (isMountedRef.current) {
              setCameraState("RETURNING_TO_PLAYER");
            }
          }
        } else if (currentState === "RETURNING_TO_PLAYER") {
          // Regresando suavemente al jugador
          const target = calculateCameraShift(playerPosRef.current, zoomScale);
          const blend = 1 - Math.exp(-returnSmoothingSpeed * dt);

          const nextX =
            camShiftRef.current.x + (target.x - camShiftRef.current.x) * blend;
          const nextY =
            camShiftRef.current.y + (target.y - camShiftRef.current.y) * blend;

          const diffX = Math.abs(target.x - nextX);
          const diffY = Math.abs(target.y - nextY);

          if (diffX < 0.15 && diffY < 0.15) {
            // Llegó al jugador: concluye la cinemática
            camShiftRef.current = target;
            stateRef.current = "COMPLETED";
            if (isMountedRef.current) {
              setCamShift(target);
              setCameraState("COMPLETED");
            }
          } else {
            camShiftRef.current = { x: nextX, y: nextY };
            if (isMountedRef.current) {
              setCamShift({ x: nextX, y: nextY });
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
  }, [zoomScale, holdDurationMs, followSmoothingSpeed, returnSmoothingSpeed]);

  const isCinematicActive =
    cameraState === "FOLLOWING_NPC" ||
    cameraState === "HOLDING_AT_BOOTH" ||
    cameraState === "RETURNING_TO_PLAYER";

  return {
    camX: camShift.x,
    camY: camShift.y,
    cameraState,
    isCinematicActive,
  };
}
