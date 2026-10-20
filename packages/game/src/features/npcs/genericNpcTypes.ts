/**
 * Definiciones de tipos para el sistema de NPCs genéricos (ciudadanos votantes ambientales).
 *
 * Fase 1: Estructura de datos, estados de ciclo de vida y contratos de mamparas.
 */

/**
 * Estados de comportamiento previstos para el ciclo de vida del NPC genérico:
 * - ENTERING: caminando desde el borde inferior de la explanada hacia la mampara asignada.
 * - IDLE: detenido frente a la mampara simulando la acción de votar.
 * - LEAVING: caminando hacia abajo para salir de la escena tras haber votado.
 * - FINISHED: ha cruzado el borde inferior de salida y su instancia puede ser reciclada/eliminada.
 */
export type GenericNpcBehaviorState =
  | "ENTERING"
  | "IDLE"
  | "LEAVING"
  | "FINISHED";

/**
 * Animaciones disponibles para el personaje genérico:
 * - back: camina hacia arriba (visto desde atrás) rumbo a la mampara.
 * - front: camina hacia abajo (visto de frente) al retirarse.
 * - idle: detenido en la mampara (visto desde atrás, votando).
 */
export type GenericNpcAnimation = "back" | "front" | "idle";

/**
 * Representa una instancia de un personaje genérico en el escenario.
 */
export interface GenericNpc {
  /** Identificador único de la instancia (ej. "npc-gen-mampara-1") */
  id: string;

  /** Posición actual en el sistema de coordenadas porcentuales del mundo { x, y } */
  position: {
    x: number;
    y: number;
  };

  /** Identificador de la mampara asignada (1 al 5) */
  assignedMamparaId: 1 | 2 | 3 | 4 | 5;

  /** Animación que debe reproducirse actualmente */
  currentAnimation: GenericNpcAnimation;

  /** Estado actual de su ciclo de comportamiento */
  state: GenericNpcBehaviorState;

  /** Velocidad de desplazamiento (% de pantalla por segundo) */
  speed: number;

  /** Tiempo total asignado para permanecer votando en la mampara (ms) */
  votingWaitTimeMs: number;

  /** Tiempo transcurrido acumulado en el estado actual (ms) */
  elapsedInStateMs: number;

  /** Indica si el NPC está activo y debe procesarse en el bucle del juego */
  isActive: boolean;
  /** Eje principal de desplazamiento cuando está en movimiento ('vertical' por defecto, 'horizontal' para caminatas laterales) */
  movementAxis?: "vertical" | "horizontal";
}

/**
 * Configuración y estado de cada una de las 5 mamparas electorales de la explanada.
 */
export interface MamparaBoothConfig {
  /** Identificador numérico único (1 al 5) */
  id: 1 | 2 | 3 | 4 | 5;

  /** Etiqueta descriptiva (ej. "Mampara 1") */
  name: string;

  /** Coordenada base de la mampara en el escenario ({ x, y } %) */
  boothPosition: {
    x: number;
    y: number;
  };

  /** Posición exacta de destino donde el NPC se detiene a votar frente a la mampara */
  targetPosition: {
    x: number;
    y: number;
  };

  /** Punto de aparición situado fuera del borde inferior visible de la explanada */
  spawnPoint: {
    x: number;
    y: number;
  };

  /** Punto de salida situado fuera del borde inferior visible */
  exitPoint: {
    x: number;
    y: number;
  };

  /** Indicador de ocupación: true si hay un NPC asignado o votando en esta mampara */
  isOccupied: boolean;

  /** ID del NPC que actualmente ocupa o se dirige a esta mampara (null si está libre) */
  occupiedByNpcId: string | null;

  /** Estructura para administrar posteriormente su propio temporizador de aparición */
  spawnTimerConfig: {
    /** Tiempo restante o asignado para el próximo intento de aparición (ms) */
    nextSpawnDelayMs: number;
    /** Timestamp del último spawn realizado en esta mampara */
    lastSpawnTimestampMs: number;
    /** Rango mínimo de espera para la aparición (ms) */
    minDelayMs: number;
    /** Rango máximo de espera para la aparición (ms) */
    maxDelayMs: number;
    /** Bandera para habilitar o suspender la aparición automática en esta mampara */
    isEnabled: boolean;
  };
}
