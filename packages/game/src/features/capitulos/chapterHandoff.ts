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
  fromChapter2Ending?: boolean;
}

/**
 * Diálogo de Inecito que marca el cierre del Capítulo 2 (Desmintiendo mitos)
 * y el inicio del Capítulo 3 (Aprende a votar).
 */
export const CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES: readonly string[] = [
  "¡Uffff! ¡Vaya jornada que hemos tenido! ¡Y yo que pensaba que lo más difícil sería acomodar las mamparas, ja, ja!",
  "Hoy conocimos a personas muy diferentes, cada una con sus propias dudas y preocupaciones.",
  "Pero todas nos recordaron algo importante: sin importar nuestra edad, origen o condición, ¡todos tenemos derecho a participar!",
  "Y también aprendimos que no debemos creer todos los rumores que escuchamos. ¡Siempre es mejor informarnos!",
  "Pero oye... ahora que lo pienso...",
  "Ya sabemos cómo preparar una casilla y cómo resolver las dudas de los votantes...",
  "¡Pero todavía no te he enseñado cómo se vota!",
  "¡Vamos a descubrir cómo hacerlo, paso a paso!",
] as const;

export const CAP2_OUTRO_CAP3_INTRO_MESSAGES_NAH: readonly string[] = [
  "¡Uffff! ¡Kualtsin tekitl otikpixkeh! ¡Uan neh nimoyolmatia tlen kachi ouih eliskia tlatlalilis in mamparas, ja, ja!",
  "Axan tikinixmatkeh maseualmeh tlen amo san se, sejse ika itlanemililis uan itekipacholis.",
  "Pero nochtin otechilnamiktijkeh se tlamantli: amo tlen kihtoa toxiu, toaltepe noso totlakayo, ¡nochtin tikpiah derecho titlapejpeniseh!",
  "Uan noihki otikmomachtijkeh amo moneki tikneltokaseh nochi tlen tikakih. ¡Mochipa kachi kuali timotemoliseh tlamatilis!",
  "Pero xikaki... axan kuak nimoyolilhuia...",
  "Kema tikmatih ken tikyektlaliskeh se casilla uan ken tikinpalehuiseh in votantes...",
  "¡Pero ayamo nimitsmachtia ken titlapejpenis!",
  "¡Tiauik tikitatih ken tichiuaseh, sehse tlamantli!",
] as const;

let handoff: ChapterHandoff | null = null;

export function setChapterHandoff(data: ChapterHandoff): void {
  handoff = {
    playerPos: { ...data.playerPos },
    lastDirection: data.lastDirection,
    fromChapter2Ending: data.fromChapter2Ending,
  };
}

/** Lectura sin efectos secundarios (segura en StrictMode). */
export function getChapterHandoff(): ChapterHandoff | null {
  return handoff;
}

export function clearChapterHandoff(): void {
  handoff = null;
}
