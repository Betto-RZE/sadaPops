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
  fromChapter1Ending?: boolean;
  fromChapter2Ending?: boolean;
}

/**
 * Diálogo de Inecito que marca el cierre del Capítulo 1 (Funcionario de casilla)
 * y el inicio del Capítulo 2 (Desmintiendo mitos).
 */
export const CAP1_OUTRO_CAP2_INTRO_MESSAGES_ES: readonly string[] = [
  "¡Uffff! ¡Por fin terminamos de organizar todo! No voy a mentirte, pensé que sería más sencillo, ¡ja, ja!",
  "Ahora ya sabes que cada uno de estos elementos cumple una función importante para que las elecciones se desarrollen correctamente.",
  "Y aunque parezca que ya terminamos... ¡nuestro verdadero trabajo apenas comienza!",
  "En cualquier momento empezarán a llegar las personas que vienen a ejercer su derecho al voto.",
  "Algunas tendrán preguntas, otras necesitarán orientación y seguramente escucharemos uno que otro rumor sobre las elecciones.",
  "¡Así que mantente atento! Porque nuestra siguiente misión será ayudarlas a resolver sus dudas.",
  "¡Vamos, que ya casi llegan nuestros primeros votantes!",
] as const;

export const CAP1_OUTRO_CAP2_INTRO_MESSAGES_NAH: readonly string[] = [
  "¡Uffff! ¡Ipan tlamilistli tikyektlalijkeh nochitlamantli! Axtlapik nimitsiluis, nimoiluiaya achi auki yeskia, ¡ja, ja!",
  "Axkan ya tikmati sesen tlamantli kipixtok se ueyi tekitl pampa in tlaixquetzalistli kualtsin ma mopano.",
  "Wan maski nesi ya titlankeh... ¡totlanel tekiyo axkan peua!",
  "San tlen tonalli pehuaskeh ajsiskeh in maseualmeh akin kinekij kitlaliseh inivoto.",
  "Sekij kitlalaniseh tlahtolmeh, sekij monekis kinyakanaseh wan kualtsin tikakiskeh seki sasamili.",
  "¡Yeka kualtsin xikpixto moix! Totlanel tekiyo yeski tikinpalehuiseh ika intlahtoltilistli.",
  "¡Ma tiuikan, ya mero ajsih tototlayokauh votantes!",
] as const;

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
    fromChapter1Ending: data.fromChapter1Ending,
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
