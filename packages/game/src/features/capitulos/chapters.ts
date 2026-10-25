/**
 * Sistema de capitulos de "Voces en Casilla".
 *
 * Modulo PURO (sin React ni DOM) para poder probarlo de forma aislada
 * (ver packages/game/tests/chapterFlow.test.mjs).
 *
 * Dos modalidades de ejecucion:
 * - FULL_GAME:      boton "JUGAR". Capitulo 1 -> 2 -> 3 -> final normal, sin cortes.
 * - SINGLE_CHAPTER: pantalla "CAPITULOS". Solo se juega el capitulo elegido y al
 *                   terminarlo se regresa al menu principal.
 *
 * Todos los capitulos reportan su fin con el MISMO evento (CHAPTER_COMPLETED);
 * es este reducer quien decide que pasa despues segun la modalidad activa.
 *
 * Nota: evitar enums/namespaces aqui (el archivo se ejecuta con
 * `node --experimental-strip-types` en las pruebas).
 */

// ---------------------------------------------------------------------------
// Modalidades
// ---------------------------------------------------------------------------

export const GAME_MODES = {
  FULL_GAME: "FULL_GAME",
  SINGLE_CHAPTER: "SINGLE_CHAPTER",
} as const;

export type GameMode = (typeof GAME_MODES)[keyof typeof GAME_MODES];

// ---------------------------------------------------------------------------
// Registro de capitulos
// ---------------------------------------------------------------------------

export type ChapterId = 1 | 2 | 3;

/** Imagen de fondo del recuadro de un capitulo en la pantalla de seleccion. */
export interface ChapterCardImage {
  /** Ruta publica, p. ej. "/assets/juego/capitulos/capitulo-1.png" */
  src: string;
  /** Texto alternativo para lectores de pantalla */
  alt: string;
  /** "cover" (recorta sin deformar, por defecto) o "contain" (muestra la imagen completa) */
  fit?: "cover" | "contain";
  /** Punto focal CSS (object-position), p. ej. "center top". Por defecto "center". */
  position?: string;
}

export interface ChapterDefinition {
  id: ChapterId;
  number: number;
  title: string;
  /**
   * Imagen del recuadro en la pantalla "CAPITULOS".
   * VACIA A PROPOSITO hasta recibir el arte final de cada capitulo.
   * Para agregarla basta con llenar este campo; no hay que tocar la navegacion.
   */
  cardImage?: ChapterCardImage;
}

export const CHAPTERS: readonly ChapterDefinition[] = [
  {
    id: 1,
    number: 1,
    title: "Funcionario de casilla",
    cardImage: {
      src: "/assets/juego/capitulos/capitulo-1.png",
      alt: "Capítulo 1: Funcionario de casilla preparando material electoral",
      fit: "cover",
      position: "center",
    },
  },
  {
    id: 2,
    number: 2,
    title: "Desmintiendo mitos",
    cardImage: {
      src: "/assets/juego/capitulos/capitulo-2.png",
      alt: "Capítulo 2: Desmintiendo mitos con la ciudadanía",
      fit: "cover",
      position: "center",
    },
  },
  {
    id: 3,
    number: 3,
    title: "Aprende a votar",
    cardImage: {
      src: "/assets/juego/capitulos/capitulo-3.png",
      alt: "Capítulo 3: Aprende a votar",
      fit: "cover",
      position: "center",
    },
  },
];

export const FIRST_CHAPTER_ID: ChapterId = 1;

export function getChapter(id: ChapterId): ChapterDefinition {
  const chapter = CHAPTERS.find((c) => c.id === id);
  if (!chapter) throw new Error(`Capitulo desconocido: ${id}`);
  return chapter;
}

/** Siguiente capitulo en el orden lineal, o null si es el ultimo. */
export function getNextChapterId(id: ChapterId): ChapterId | null {
  const index = CHAPTERS.findIndex((c) => c.id === id);
  const next = CHAPTERS[index + 1];
  return next ? next.id : null;
}

// ---------------------------------------------------------------------------
// Que hacer al terminar un capitulo
// ---------------------------------------------------------------------------

export type ChapterCompletionOutcome =
  | { kind: "NEXT_CHAPTER"; chapterId: ChapterId }
  | { kind: "GAME_ENDING" }
  | { kind: "RETURN_TO_MENU" };

export function resolveChapterCompletion(
  mode: GameMode,
  chapterId: ChapterId,
): ChapterCompletionOutcome {
  if (mode === GAME_MODES.SINGLE_CHAPTER) {
    return { kind: "RETURN_TO_MENU" };
  }
  const next = getNextChapterId(chapterId);
  return next !== null
    ? { kind: "NEXT_CHAPTER", chapterId: next }
    : { kind: "GAME_ENDING" };
}

// ---------------------------------------------------------------------------
// Maquina de estados de la sesion de juego
// ---------------------------------------------------------------------------

export type GameSessionState =
  /** En el menu (o en la pantalla de capitulos). No hay ningun capitulo montado. */
  | { status: "idle"; sessionId: number }
  /** Jugando un capitulo. */
  | {
      status: "playing";
      mode: GameMode;
      chapterId: ChapterId;
      sessionId: number;
    }
  /** FULL_GAME: se terminaron los 3 capitulos y se muestra el final normal. */
  | { status: "ending"; mode: "FULL_GAME"; sessionId: number }
  /**
   * SINGLE_CHAPTER: el capitulo termino y se esta regresando al menu.
   * El capitulo sigue montado (congelado) solo mientras se cierra el iris;
   * al llegar a negro se despacha RESET y se desmonta por completo.
   */
  | {
      status: "returning_to_menu";
      mode: GameMode;
      chapterId: ChapterId;
      sessionId: number;
    };

export type GameSessionAction =
  | { type: "START_FULL_GAME" }
  | { type: "START_CHAPTER"; chapterId: ChapterId }
  | { type: "CHAPTER_COMPLETED"; chapterId: ChapterId; sessionId: number }
  | { type: "RESET" };

export const INITIAL_SESSION_STATE: GameSessionState = {
  status: "idle",
  sessionId: 0,
};

export function gameSessionReducer(
  state: GameSessionState,
  action: GameSessionAction,
): GameSessionState {
  switch (action.type) {
    case "START_FULL_GAME":
      return {
        status: "playing",
        mode: GAME_MODES.FULL_GAME,
        chapterId: FIRST_CHAPTER_ID,
        sessionId: state.sessionId + 1,
      };

    case "START_CHAPTER":
      return {
        status: "playing",
        mode: GAME_MODES.SINGLE_CHAPTER,
        chapterId: action.chapterId,
        sessionId: state.sessionId + 1,
      };

    case "CHAPTER_COMPLETED": {
      // Ignora eventos tardios/duplicados (otra sesion, otro capitulo o ya no se juega)
      if (
        state.status !== "playing" ||
        state.sessionId !== action.sessionId ||
        state.chapterId !== action.chapterId
      ) {
        return state;
      }

      const outcome = resolveChapterCompletion(state.mode, state.chapterId);
      switch (outcome.kind) {
        case "NEXT_CHAPTER":
          return { ...state, chapterId: outcome.chapterId };
        case "GAME_ENDING":
          return {
            status: "ending",
            mode: GAME_MODES.FULL_GAME,
            sessionId: state.sessionId,
          };
        case "RETURN_TO_MENU":
          return { ...state, status: "returning_to_menu" };
      }
      return state;
    }

    case "RESET":
      // Conserva el contador para que la proxima sesion tenga un id nuevo
      return { status: "idle", sessionId: state.sessionId };

    default:
      return state;
  }
}
