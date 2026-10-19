import { useState, useEffect, useRef, useCallback } from "react";
import type { GenericNpc, MamparaBoothConfig } from "./genericNpcTypes";
import {
  INITIAL_MAMPARAS_CONFIG,
  createGenericNpcInstance,
  updateGenericNpc,
  releaseGenericNpcImages,
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

  /** Estado actual de ocupación de las 5 mamparas */
  mamparas: MamparaBoothConfig[];

  /** Indica si ya ocurrió el evento de spawn del primer NPC */
  firstNpcSpawned: boolean;

  /** Reinicia manualmente la colección de NPCs y el estado de las mamparas */
  resetNpcs: () => void;
}

/**
 * Hook modular para gestionar el ciclo de vida y simulación de los NPCs genéricos.
 *
 * Fase 3 - Ciclo completo de votación:
 * 1. ENTERING: Aparece en Y = 106.0% con rumbo a Mampara 3 (X = 52.0%) con 'generico-back'.
 * 2. IDLE: Se detiene en Y = 36.5%, cambia a 'generico-idle' y permanece [4000, 8000] ms.
 * 3. LEAVING: Transiciona a 'generico-front' y camina hacia abajo hasta Y = 106.0%.
 * 4. FINISHED: Se retira de la colección activa, se libera la mampara y se detiene el procesamiento.
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

  const hasSpawnedRef = useRef(false);
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
   * 1. Activación por evento del diálogo:
   * En el instante exacto en que el diálogo deja de estar en espera ('initial_delay')
   * y entra en escena ('entering' o 'visible'), aparece el primer NPC hacia la mampara 3.
   * Se ejecuta una sola vez por ciclo de vida del capítulo.
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

      const firstNpc = createGenericNpcInstance(mampara3, "npc-gen-mampara-3");

      npcsRef.current = [firstNpc];
      setNpcs([firstNpc]);
      setMamparas((prev) =>
        prev.map((m) =>
          m.id === 3
            ? { ...m, isOccupied: true, occupiedByNpcId: firstNpc.id }
            : m,
        ),
      );
    }
  }, [dialogueState]);

  /**
   * 2. Bucle de actualización independiente de la tasa de refresco (requestAnimationFrame + dt).
   * Gestiona el ciclo completo (ENTERING -> IDLE -> LEAVING -> FINISHED) de forma fluida.
   */
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (!isPausedRef.current && npcsRef.current.length > 0) {
        const hasActiveNpc = npcsRef.current.some(
          (npc) => npc.isActive && npc.state !== "FINISHED",
        );

        if (hasActiveNpc) {
          const previousList = npcsRef.current;
          const updated = previousList.map((npc) => {
            const targetMampara =
              mamparasRef.current.find((m) => m.id === npc.assignedMamparaId) ||
              INITIAL_MAMPARAS_CONFIG[2];

            return updateGenericNpc(npc, targetMampara, dt);
          });

          // Detectar NPCs que terminaron su recorrido para liberar su mampara
          const finishedNpcs = updated.filter(
            (npc) => npc.state === "FINISHED",
          );
          if (finishedNpcs.length > 0) {
            const finishedMamparaIds = new Set(
              finishedNpcs.map((n) => n.assignedMamparaId),
            );
            setMamparas((prev) =>
              prev.map((m) =>
                finishedMamparaIds.has(m.id)
                  ? { ...m, isOccupied: false, occupiedByNpcId: null }
                  : m,
              ),
            );
          }

          // Filtrar los NPCs que ya finalizaron completamente
          const remainingActive = updated.filter(
            (npc) => npc.state !== "FINISHED",
          );

          npcsRef.current = remainingActive;

          // Solo notificamos a React si hubo un cambio visible (posición, animación, estado o retiro)
          const hasVisualChange =
            remainingActive.length !== previousList.length ||
            remainingActive.some((newNpc, idx) => {
              const oldNpc = previousList[idx];
              if (!oldNpc) return true;
              return (
                oldNpc.state !== newNpc.state ||
                oldNpc.currentAnimation !== newNpc.currentAnimation ||
                oldNpc.position.y !== newNpc.position.y
              );
            });

          if (hasVisualChange) {
            setNpcs(remainingActive);
          }
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

  const resetNpcs = useCallback(() => {
    hasSpawnedRef.current = false;
    setFirstNpcSpawned(false);
    npcsRef.current = [];
    setNpcs([]);
    setMamparas(initialMamparas || INITIAL_MAMPARAS_CONFIG);
  }, [initialMamparas]);

  return {
    npcs,
    mamparas,
    firstNpcSpawned,
    resetNpcs,
  };
}
