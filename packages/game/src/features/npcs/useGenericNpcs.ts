import { useState, useEffect, useRef, useCallback } from "react";
import type { GenericNpc, MamparaBoothConfig } from "./genericNpcTypes";
import {
  INITIAL_MAMPARAS_CONFIG,
  createGenericNpcInstance,
  releaseGenericNpcImages,
  simulateNpcsStep,
} from "./genericNpcConfig";

export interface UseGenericNpcsProps {
  /**
   * Estado de la secuencia narrativa del capítulo actual.
   * En Chapter2Scene toma valores: 'initial_delay' | 'entering' | 'visible' | 'exiting' | 'dismissed'.
   */
  dialogueState: string;

  /** Bandera de pausa del juego */
  isPaused: boolean;

  /** Configuración inicial personalizada opcional de mamparas */
  initialMamparas?: MamparaBoothConfig[];
}

export interface UseGenericNpcsReturn {
  /** Lista de personajes genéricos actualmente en escena */
  npcs: GenericNpc[];

  /** Estado actual de ocupación y temporizadores de las 5 mamparas */
  mamparas: MamparaBoothConfig[];

  /** Indica si ya ocurrió el evento de spawn del primer NPC */
  firstNpcSpawned: boolean;

  /** Bandera que indica si el sistema recurrente global de las 5 mamparas está activo */
  isGlobalSystemActive: boolean;

  /** Reinicia manualmente la colección de NPCs y el estado de las mamparas */
  resetNpcs: () => void;
}

/**
 * Hook modular para gestionar el ciclo de vida, simulación y sistema recurrente de NPCs genéricos.
 *
 * Fase 4 - Sistema independiente para las cinco mamparas:
 * 1. El primer NPC aparece al mostrarse el diálogo inicial con rumbo a la mampara 3.
 * 2. Condición obligatoria de activación global: Se activa EXACTAMENTE cuando el primer NPC
 *    de la mampara 3 transiciona de 'IDLE' a 'LEAVING'.
 * 3. Al activarse, las mamparas desocupadas (1, 2, 4 y 5) generan de forma independiente
 *    un tiempo de espera de 1 a 3 segundos (1000 - 3000 ms) y comienzan a descontarlo.
 * 4. La mampara 3 se conserva ocupada hasta que el primer NPC finaliza completamente ('FINISHED');
 *    solo entonces comienza su propio temporizador de 1 a 3 segundos.
 * 5. Cada mampara administra su ciclo (1-3s spawn -> ENTERING -> 4-8s IDLE -> LEAVING -> FINISHED)
 *    de manera totalmente independiente, garantizando como máximo 1 NPC por mampara sin colisiones.
 */
export function useGenericNpcs({
  dialogueState,
  isPaused,
  initialMamparas,
}: UseGenericNpcsProps): UseGenericNpcsReturn {
  const [npcs, setNpcs] = useState<GenericNpc[]>([]);
  const [mamparas, setMamparas] = useState<MamparaBoothConfig[]>(
    () => initialMamparas || INITIAL_MAMPARAS_CONFIG,
  );
  const [firstNpcSpawned, setFirstNpcSpawned] = useState(false);
  const [isGlobalSystemActive, setIsGlobalSystemActive] = useState(false);

  const hasSpawnedRef = useRef(false);
  const isGlobalSystemActiveRef = useRef(false);
  const npcIdCounterRef = useRef(0);
  const isPausedRef = useRef(isPaused);
  const npcsRef = useRef<GenericNpc[]>(npcs);
  const mamparasRef = useRef<MamparaBoothConfig[]>(mamparas);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    npcsRef.current = npcs;
  }, [npcs]);

  useEffect(() => {
    mamparasRef.current = mamparas;
  }, [mamparas]);

  /**
   * 1. Activación inicial por evento del diálogo (Primer NPC narrativo hacia mampara 3)
   */
  useEffect(() => {
    const isDialogueActive =
      dialogueState === "entering" || dialogueState === "visible";

    if (isDialogueActive && !hasSpawnedRef.current) {
      hasSpawnedRef.current = true;
      setFirstNpcSpawned(true);

      const mampara3 =
        mamparasRef.current.find((m) => m.id === 3) ||
        INITIAL_MAMPARAS_CONFIG[2];

      npcIdCounterRef.current += 1;
      const firstNpc = createGenericNpcInstance(
        mampara3,
        "npc-gen-mampara-3",
      );

      npcsRef.current = [firstNpc];
      setNpcs([firstNpc]);

      mamparasRef.current = mamparasRef.current.map((m) =>
        m.id === 3
          ? {
              ...m,
              isOccupied: true,
              occupiedByNpcId: firstNpc.id,
              spawnTimerConfig: {
                ...m.spawnTimerConfig,
                isEnabled: false,
                nextSpawnDelayMs: 0,
              },
            }
          : m,
      );
      setMamparas([...mamparasRef.current]);
    }
  }, [dialogueState]);

  /**
   * 2. Bucle principal de actualización de movimiento, estados y temporizadores independientes (rAF + dt)
   */
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (!isPausedRef.current) {
        const previousList = npcsRef.current;
        const result = simulateNpcsStep(
          {
            npcs: previousList,
            mamparas: mamparasRef.current,
            isGlobalSystemActive: isGlobalSystemActiveRef.current,
            npcIdCounter: npcIdCounterRef.current,
          },
          dt,
          currentTime,
        );

        if (result.justActivatedGlobal && !isGlobalSystemActiveRef.current) {
          isGlobalSystemActiveRef.current = true;
          setIsGlobalSystemActive(true);
        }

        npcIdCounterRef.current = result.npcIdCounter;

        const mamparasChanged =
          result.justActivatedGlobal ||
          result.finishedMamparaIds.length > 0 ||
          result.newSpawnIds.length > 0;

        const updatedNpcs = result.npcs;
        const hasVisualChange =
          result.newSpawnIds.length > 0 ||
          result.finishedMamparaIds.length > 0 ||
          updatedNpcs.length !== previousList.length ||
          updatedNpcs.some((newNpc, idx) => {
            const oldNpc = previousList[idx];
            if (!oldNpc) return true;
            return (
              oldNpc.state !== newNpc.state ||
              oldNpc.currentAnimation !== newNpc.currentAnimation ||
              oldNpc.position.y !== newNpc.position.y
            );
          });

        npcsRef.current = updatedNpcs;
        mamparasRef.current = result.mamparas;

        if (hasVisualChange) {
          setNpcs(updatedNpcs);
        }

        if (mamparasChanged) {
          setMamparas(result.mamparas);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  /**
   * 3. Limpieza de memoria de texturas al desmontar la escena del capítulo
   */
  useEffect(() => {
    return () => {
      releaseGenericNpcImages();
    };
  }, []);

  /**
   * 4. Reinicio completo para cuando se reinicie o cambie de capítulo
   */
  const resetNpcs = useCallback(() => {
    hasSpawnedRef.current = false;
    isGlobalSystemActiveRef.current = false;
    npcIdCounterRef.current = 0;
    setIsGlobalSystemActive(false);
    setFirstNpcSpawned(false);
    npcsRef.current = [];
    setNpcs([]);
    mamparasRef.current = initialMamparas || INITIAL_MAMPARAS_CONFIG;
    setMamparas([...mamparasRef.current]);
  }, [initialMamparas]);

  return {
    npcs,
    mamparas,
    firstNpcSpawned,
    isGlobalSystemActive,
    resetNpcs,
  };
}
