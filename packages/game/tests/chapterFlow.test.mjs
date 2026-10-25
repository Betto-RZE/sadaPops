// Pruebas del sistema de capitulos (FULL_GAME / SINGLE_CHAPTER).
// Ejecutar desde packages/game:  pnpm test
// (usa el runner nativo de Node con --experimental-strip-types; sin dependencias extra)

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  CHAPTERS,
  GAME_MODES,
  INITIAL_SESSION_STATE,
  gameSessionReducer,
  getNextChapterId,
  resolveChapterCompletion,
} from "../src/features/capitulos/chapters.ts";
import {
  CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES,
  CAP2_OUTRO_CAP3_INTRO_MESSAGES_NAH,
  setChapterHandoff,
  getChapterHandoff,
  clearChapterHandoff,
} from "../src/features/capitulos/chapterHandoff.ts";

/** Aplica una lista de acciones al reducer y regresa el estado final. */
const run = (actions, state = INITIAL_SESSION_STATE) =>
  actions.reduce((s, a) => gameSessionReducer(s, a), state);

/** Simula que el jugador termina el capitulo que esta jugando ahora. */
const complete = (state) => {
  assert.equal(state.status, "playing", "solo se termina un capitulo en juego");
  return gameSessionReducer(state, {
    type: "CHAPTER_COMPLETED",
    chapterId: state.chapterId,
    sessionId: state.sessionId,
  });
};

describe("Registro de capitulos", () => {
  test("hay tres capitulos en orden con su nombre", () => {
    assert.deepEqual(
      CHAPTERS.map((c) => [c.number, c.title]),
      [
        [1, "Funcionario de casilla"],
        [2, "Desmintiendo mitos"],
        [3, "Aprende a votar"],
      ],
    );
  });

  test("los recuadros 1 y 2 tienen su arte final asignado y el 3 sigue pendiente", () => {
    assert.equal(CHAPTERS[0].cardImage?.src, "/assets/juego/capitulos/capitulo-1.png");
    assert.equal(CHAPTERS[1].cardImage?.src, "/assets/juego/capitulos/capitulo-2.png");
    assert.equal(CHAPTERS[2].cardImage, undefined);
  });

  test("preparacion para imagenes futuras: acepta cardImage sin alterar navegacion", () => {
    // Demuestra que asignar una imagen en el futuro es puramente declarativo
    const customImage = {
      src: "/assets/juego/capitulos/capitulo-1.png",
      alt: "Mamparas y plaza",
      fit: "cover",
      position: "center top",
    };
    const chapterWithImage = { ...CHAPTERS[0], cardImage: customImage };
    assert.equal(chapterWithImage.cardImage.src, "/assets/juego/capitulos/capitulo-1.png");
    assert.equal(resolveChapterCompletion(GAME_MODES.SINGLE_CHAPTER, chapterWithImage.id).kind, "RETURN_TO_MENU");
  });

  test("orden lineal: 1 -> 2 -> 3 -> fin", () => {
    assert.equal(getNextChapterId(1), 2);
    assert.equal(getNextChapterId(2), 3);
    assert.equal(getNextChapterId(3), null);
  });
});

describe("Modalidad A: JUGAR (FULL_GAME)", () => {
  test("permite completar los tres capitulos consecutivamente y llega al final", () => {
    let s = run([{ type: "START_FULL_GAME" }]);
    assert.equal(s.mode, GAME_MODES.FULL_GAME);
    assert.equal(s.chapterId, 1);

    s = complete(s);
    assert.equal(s.status, "playing");
    assert.equal(s.chapterId, 2, "sigue al capitulo 2 sin regresar al menu");

    s = complete(s);
    assert.equal(s.status, "playing");
    assert.equal(s.chapterId, 3, "sigue al capitulo 3 sin regresar al menu");

    s = complete(s);
    assert.equal(s.status, "ending", "tras el capitulo 3 se ejecuta el final normal");
  });

  test("la misma sesion se conserva entre capitulos (sin cortes)", () => {
    const s1 = run([{ type: "START_FULL_GAME" }]);
    const s2 = complete(s1);
    const s3 = complete(s2);
    assert.equal(s2.sessionId, s1.sessionId);
    assert.equal(s3.sessionId, s1.sessionId);
  });
});

describe("Modalidad B: CAPITULOS (SINGLE_CHAPTER)", () => {
  for (const chapter of CHAPTERS) {
    test(`capitulo ${chapter.id}: al terminarlo regresa al menu sin iniciar otro`, () => {
      let s = run([{ type: "START_CHAPTER", chapterId: chapter.id }]);
      assert.equal(s.mode, GAME_MODES.SINGLE_CHAPTER);
      assert.equal(s.chapterId, chapter.id);

      s = complete(s);
      assert.equal(s.status, "returning_to_menu");
      assert.equal(s.chapterId, chapter.id, "NO avanza al siguiente capitulo");

      // Al llegar a negro el iris despacha RESET -> menu, nada montado
      s = gameSessionReducer(s, { type: "RESET" });
      assert.equal(s.status, "idle");
    });
  }

  test("resolveChapterCompletion nunca devuelve NEXT_CHAPTER en SINGLE_CHAPTER", () => {
    for (const chapter of CHAPTERS) {
      assert.deepEqual(
        resolveChapterCompletion(GAME_MODES.SINGLE_CHAPTER, chapter.id),
        { kind: "RETURN_TO_MENU" },
      );
    }
  });
});

describe("Limpieza y eventos tardios", () => {
  test("un CHAPTER_COMPLETED duplicado no avanza dos capitulos", () => {
    const s1 = run([{ type: "START_FULL_GAME" }]);
    const evt = { type: "CHAPTER_COMPLETED", chapterId: 1, sessionId: s1.sessionId };
    const s2 = gameSessionReducer(s1, evt);
    const s3 = gameSessionReducer(s2, evt); // repetido
    assert.equal(s3.chapterId, 2);
    assert.equal(s3, s2);
  });

  test("un evento de una sesion anterior se ignora", () => {
    const old = run([{ type: "START_CHAPTER", chapterId: 1 }]);
    let s = run([{ type: "RESET" }, { type: "START_CHAPTER", chapterId: 1 }], old);
    const after = gameSessionReducer(s, {
      type: "CHAPTER_COMPLETED",
      chapterId: 1,
      sessionId: old.sessionId,
    });
    assert.equal(after, s, "el evento viejo no afecta la sesion nueva");
  });

  test("despues de RESET no se procesan eventos del capitulo terminado", () => {
    let s = run([{ type: "START_CHAPTER", chapterId: 2 }]);
    const { sessionId } = s;
    s = run([{ type: "RESET" }], complete(s));
    const after = gameSessionReducer(s, {
      type: "CHAPTER_COMPLETED",
      chapterId: 2,
      sessionId,
    });
    assert.equal(after.status, "idle");
  });

  test("tras regresar al menu se puede iniciar otra partida u otro capitulo", () => {
    // Capitulo 1 suelto -> menu
    let s = run([{ type: "START_CHAPTER", chapterId: 1 }]);
    const first = s.sessionId;
    s = run([{ type: "RESET" }], complete(s));

    // Otro capitulo
    s = run([{ type: "START_CHAPTER", chapterId: 3 }], s);
    assert.equal(s.status, "playing");
    assert.equal(s.chapterId, 3);
    assert.notEqual(s.sessionId, first, "sesion nueva (se monta desde cero)");
    s = run([{ type: "RESET" }], complete(s));

    // Partida completa
    s = run([{ type: "START_FULL_GAME" }], s);
    assert.equal(s.mode, GAME_MODES.FULL_GAME);
    assert.equal(s.chapterId, 1);
    s = complete(complete(complete(s)));
    assert.equal(s.status, "ending");
  });

  test("salir con el boton de regreso a mitad de un capitulo descarta la sesion", () => {
    let s = run([{ type: "START_FULL_GAME" }]);
    s = complete(s); // capitulo 2
    s = gameSessionReducer(s, { type: "RESET" });
    assert.equal(s.status, "idle");
    s = gameSessionReducer(s, { type: "START_FULL_GAME" });
    assert.equal(s.chapterId, 1, "una partida nueva empieza otra vez en el capitulo 1");
  });
});

describe("Puente narrativo: Cierre de Capítulo 2 e Inicio de Capítulo 3", () => {
  test("el diálogo contiene exactamente los 8 mensajes solicitados por Inecito en español", () => {
    assert.equal(CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES.length, 8);
    assert.equal(
      CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES[0],
      "¡Uffff! ¡Vaya jornada que hemos tenido! ¡Y yo que pensaba que lo más difícil sería acomodar las mamparas, ja, ja!"
    );
    assert.equal(
      CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES[1],
      "Hoy conocimos a personas muy diferentes, cada una con sus propias dudas y preocupaciones."
    );
    assert.equal(
      CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES[2],
      "Pero todas nos recordaron algo importante: sin importar nuestra edad, origen o condición, ¡todos tenemos derecho a participar!"
    );
    assert.equal(
      CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES[3],
      "Y también aprendimos que no debemos creer todos los rumores que escuchamos. ¡Siempre es mejor informarnos!"
    );
    assert.equal(
      CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES[4],
      "Pero oye... ahora que lo pienso..."
    );
    assert.equal(
      CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES[5],
      "Ya sabemos cómo preparar una casilla y cómo resolver las dudas de los votantes..."
    );
    assert.equal(
      CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES[6],
      "¡Pero todavía no te he enseñado cómo se vota!"
    );
    assert.equal(
      CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES[7],
      "¡Vamos a descubrir cómo hacerlo, paso a paso!"
    );
  });

  test("el diálogo posee equivalentes en náhuatl para las 8 frases de Inecito", () => {
    assert.equal(CAP2_OUTRO_CAP3_INTRO_MESSAGES_NAH.length, 8);
    CAP2_OUTRO_CAP3_INTRO_MESSAGES_NAH.forEach((msg, idx) => {
      assert.ok(msg.length > 0, `Mensaje ${idx} en náhuatl no debe estar vacío`);
    });
  });

  test("setChapterHandoff registra el indicador fromChapter2Ending para evitar repetir el diálogo en Full Game", () => {
    clearChapterHandoff();
    assert.equal(getChapterHandoff(), null);

    setChapterHandoff({
      playerPos: { x: 30, y: 60 },
      lastDirection: "4",
      fromChapter2Ending: true,
    });

    const h = getChapterHandoff();
    assert.ok(h);
    assert.equal(h.fromChapter2Ending, true);
    assert.equal(h.playerPos.x, 30);
    assert.equal(h.lastDirection, "4");

    clearChapterHandoff();
    assert.equal(getChapterHandoff(), null);
  });
});

