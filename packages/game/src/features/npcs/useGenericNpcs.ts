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
 * Fase 2:
 * - Detecta el evento real en que el globo de diálogo se vuelve visible ('entering' o 'visible').
 * - Hace aparecer al primer votante genérico en Y = 106.0% con rumbo a la Mampara 3 (X = 52.0%).
 * - Actualiza su movimiento de forma fluida mediante requestAnimationFrame y delta time (dt).
 * - Al llegar a Y = 36.5%, cambia a IDLE ('generico-idle') y permanece en la mampara.
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
   * 2. Bucle de movimiento independiente de la tasa de refresco (requestAnimationFrame + dt).
   * Solo actualiza el estado de React mientras exista algún NPC en desplazamiento ('ENTERING').
   * Una vez alcanzada la mampara (estado 'IDLE'), cesan las re-renderizaciones periódicas.
   */
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (!isPausedRef.current && npcsRef.current.length > 0) {
        const hasMovingNpc = npcsRef.current.some(
          (npc) => npc.isActive && npc.state === "ENTERING",
        );

        if (hasMovingNpc) {
          const updated = npcsRef.current.map((npc) => {
            const targetMampara =
              mamparasRef.current.find((m) => m.id === npc.assignedMamparaId) ||
              INITIAL_MAMPARAS_CONFIG[2];

            return updateGenericNpc(npc, targetMampara, dt);
          });

          npcsRef.current = updated;
          setNpcs(updated);
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
