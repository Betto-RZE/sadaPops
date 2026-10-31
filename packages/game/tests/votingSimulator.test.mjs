// Pruebas unitarias para el Simulador de Voto del Capítulo 3 ("Aprende a votar")
// Valida los 10 recuadros de la boleta, la regla de conteo y los 3 avisos de revisión solicitados.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  BALLOT_VOTING_BOXES,
  VOTING_REVIEW_NOTICES,
  evaluateBallotReview,
} from "../src/features/simulador-voto/votingBallotConfig.ts";

describe("Simulador de Voto - Recuadros de la Boleta Electoral", () => {
  test("Existen exactamente 10 recuadros para marcar el voto (2 columnas x 5 filas)", () => {
    assert.equal(BALLOT_VOTING_BOXES.length, 10);
  });

  test("Cada recuadro tiene id, nombre en español y náhuatl, y dimensiones porcentuales válidas", () => {
    const ids = new Set();
    for (const box of BALLOT_VOTING_BOXES) {
      assert.ok(box.id, "Debe tener un id definido");
      assert.ok(!ids.has(box.id), `El id ${box.id} no debe repetirse`);
      ids.add(box.id);

      assert.ok(box.name, "Debe tener nombre");
      assert.ok(box.nameNah, "Debe tener nombre en náhuatl");

      // Validar formato porcentual
      assert.match(box.left, /^\d+(\.\d+)?%$/);
      assert.match(box.top, /^\d+(\.\d+)?%$/);
      assert.match(box.width, /^\d+(\.\d+)?%$/);
      assert.match(box.height, /^\d+(\.\d+)?%$/);

      const leftNum = parseFloat(box.left);
      const topNum = parseFloat(box.top);
      const widthNum = parseFloat(box.width);
      const heightNum = parseFloat(box.height);

      assert.ok(leftNum >= 0 && leftNum + widthNum <= 100, `Box ${box.id} horizontal dentro de rango`);
      assert.ok(topNum >= 0 && topNum + heightNum <= 100, `Box ${box.id} vertical dentro de rango`);
    }
  });

  test("Distribución en 2 columnas y 5 filas coherente", () => {
    const col1 = BALLOT_VOTING_BOXES.filter((b) => parseFloat(b.left) < 50);
    const col2 = BALLOT_VOTING_BOXES.filter((b) => parseFloat(b.left) > 50);

    assert.equal(col1.length, 5, "La columna 1 tiene 5 casillas");
    assert.equal(col2.length, 5, "La columna 2 tiene 5 casillas");

    // Verificar que los tops estén ordenados de arriba hacia abajo
    for (let i = 0; i < 4; i++) {
      assert.ok(
        parseFloat(col1[i].top) < parseFloat(col1[i + 1].top),
        `Fila ${i + 1} de col1 debe estar arriba de fila ${i + 2}`
      );
      assert.ok(
        parseFloat(col2[i].top) < parseFloat(col2[i + 1].top),
        `Fila ${i + 1} de col2 debe estar arriba de fila ${i + 2}`
      );
    }
  });
});

describe("Simulador de Voto - Evaluación de Boleta (Botón REVISAR)", () => {
  const evaluateBallot = (markedCount) => {
    if (markedCount === 0) return VOTING_REVIEW_NOTICES.unmarked;
    if (markedCount > 1) return VOTING_REVIEW_NOTICES.multiple;
    return VOTING_REVIEW_NOTICES.valid;
  };

  test("Caso 1: El usuario no marcó ningún recuadro (0 opciones)", () => {
    const result = evaluateBallot(0);
    assert.equal(result.caseType, "unmarked");
    assert.equal(result.titleEs, "Boleta sin marcar");
    assert.equal(
      result.messageEs,
      "Una boleta sin marcar se considera voto nulo en el escrutinio."
    );
    assert.ok(result.titleNah);
    assert.ok(result.messageNah);
  });

  test("Caso 2: El usuario marcó más de un recuadro (>1 opciones)", () => {
    for (const count of [2, 3, 5, 10]) {
      const result = evaluateBallot(count);
      assert.equal(result.caseType, "multiple");
      assert.equal(result.titleEs, "Varias opciones marcadas");
      assert.equal(
        result.messageEs,
        "Has marcado varias opciones. Si corresponden a candidaturas diferentes, el voto sería nulo. En elecciones reales, algunas marcas múltiples pueden ser válidas cuando los partidos forman una coalición."
      );
      assert.ok(result.titleNah);
      assert.ok(result.messageNah);
    }
  });

  test("Caso 3: El usuario marcó sólo un recuadro (1 opción)", () => {
    const result = evaluateBallot(1);
    assert.equal(result.caseType, "valid");
    assert.equal(result.titleEs, "Voto válido para una opción");
    assert.equal(
      result.messageEs,
      "Has señalado claramente una sola opción. En esta simulación, tu voto sería válido."
    );
    assert.ok(result.titleNah);
    assert.ok(result.messageNah);
  });
});

import {
  POST_VOTE_URNA_INSTRUCTION_MESSAGES_ES,
  POST_VOTE_URNA_INSTRUCTION_MESSAGES_NAH,
  CHAPTER3_ENDING_MESSAGES_ES,
  CHAPTER3_ENDING_MESSAGES_NAH,
  URNA_POSITION,
  URNA_EXCLAMATION_POSITION,
} from "../src/features/simulador-voto/votingBallotConfig.ts";

describe("Simulador de Voto - Secuencia Post-Voto y Cierre de Capítulo", () => {
  test("Diálogo de instrucción para llevar la boleta a la urna posee las 3 frases requeridas", () => {
    assert.equal(POST_VOTE_URNA_INSTRUCTION_MESSAGES_ES.length, 3);
    assert.equal(
      POST_VOTE_URNA_INSTRUCTION_MESSAGES_ES[0],
      "¡Perfecto! Ya tenemos nuestra boleta marcada y doblada. ¡Sólo falta un último paso!"
    );
    assert.equal(
      POST_VOTE_URNA_INSTRUCTION_MESSAGES_ES[1],
      "Ahora debemos llevarla hasta la urna correspondiente y depositarla ahí."
    );
    assert.equal(
      POST_VOTE_URNA_INSTRUCTION_MESSAGES_ES[2],
      "¡Vamos! Ya casi terminamos nuestra misión."
    );
    assert.equal(POST_VOTE_URNA_INSTRUCTION_MESSAGES_NAH.length, 3);
  });

  test("Diálogo final de cierre posee las 8 frases de conclusión cívica", () => {
    assert.equal(CHAPTER3_ENDING_MESSAGES_ES.length, 8);
    assert.equal(
      CHAPTER3_ENDING_MESSAGES_ES[0],
      "¡Y listo! Nuestra boleta ya está dentro de la urna."
    );
    assert.equal(CHAPTER3_ENDING_MESSAGES_ES[1], "¡Uffff! ¡Vaya día que tuvimos!");
    assert.equal(
      CHAPTER3_ENDING_MESSAGES_ES[2],
      "Pero ¿sabes qué es lo más importante de todo esto?"
    );
    assert.equal(
      CHAPTER3_ENDING_MESSAGES_ES[3],
      "Que la democracia no sólo se trata de votar, sino también de informarnos, respetar las decisiones de los demás y participar en nuestra comunidad."
    );
    assert.equal(
      CHAPTER3_ENDING_MESSAGES_ES[4],
      "Cada persona tiene derecho a decidir libremente, y todas las voces merecen ser escuchadas."
    );
    assert.equal(
      CHAPTER3_ENDING_MESSAGES_ES[5],
      "¡Gracias por acompañarme en esta aventura!"
    );
    assert.equal(CHAPTER3_ENDING_MESSAGES_ES[6], "Y recuerda...");
    assert.equal(CHAPTER3_ENDING_MESSAGES_ES[7], "¡Tu voz cuenta, tu voto también!");

    assert.equal(CHAPTER3_ENDING_MESSAGES_NAH.length, 8);
  });

  test("Coordenadas de la urna blanca y su icono de exclamación están sobre la mesa", () => {
    assert.ok(URNA_POSITION.x > 10 && URNA_POSITION.x < 30);
    assert.ok(URNA_POSITION.y > 45 && URNA_POSITION.y < 65);
    assert.ok(URNA_EXCLAMATION_POSITION.y < URNA_POSITION.y);
  });
});
