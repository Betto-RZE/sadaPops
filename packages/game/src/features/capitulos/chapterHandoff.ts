/**
 * Traspaso de estado entre capitulos consecutivos (modalidad FULL_GAME).
 *
 * El capitulo que termina guarda donde quedo el personaje y el siguiente lo
 * lee al montarse, para que la historia continue sin saltos visuales.
 * Se limpia al iniciar cualquier sesion nueva (JUGAR o CAPITULOS), asi que en
 * SINGLE_CHAPTER nunca hay datos y cada capitulo usa su posicion por defecto.
 */

export type PlayerDirection = "1" | "2" | "3" | "4";

export interface ChapterHandoff {
  playerPos: { x: number; y: number };
  lastDirection: PlayerDirection;
}

let handoff: ChapterHandoff | null = null;

export function setChapterHandoff(data: ChapterHandoff): void {
  handoff = {
    playerPos: { ...data.playerPos },
    lastDirection: data.lastDirection,
  };
}

/** Lectura sin efectos secundarios (segura en StrictMode). */
export function getChapterHandoff(): ChapterHandoff | null {
  return handoff;
}

export function clearChapterHandoff(): void {
  handoff = null;
}
