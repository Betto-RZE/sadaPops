// Pruebas unitarias para el sistema de NPCs genéricos - Fase 1: Preparación.
// Ejecutar desde packages/game: pnpm test

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  GENERIC_NPC_FRAME_COUNTS,
  getGenericNpcFrameSrc,
  INITIAL_MAMPARAS_CONFIG,
  createGenericNpcInstance,
  GENERIC_NPC_DEFAULTS,
} from "../src/features/npcs/genericNpcConfig.ts";

describe("Sistema de NPCs Genéricos - Fase 1: Preparación", () => {
  describe("Recursos y animaciones", () => {
    test("las tres animaciones tienen los conteos de cuadros requeridos", () => {
      assert.equal(GENERIC_NPC_FRAME_COUNTS.back, 23);
      assert.equal(GENERIC_NPC_FRAME_COUNTS.front, 28);
      assert.equal(GENERIC_NPC_FRAME_COUNTS.idle, 1);
    });

    test("getGenericNpcFrameSrc genera las rutas exactas con padding correcto", () => {
      assert.equal(
        getGenericNpcFrameSrc("back", 0),
        "/assets/juego/personajes/generico/back/generico-back00086400.png",
      );
      assert.equal(
        getGenericNpcFrameSrc("back", 22),
        "/assets/juego/personajes/generico/back/generico-back00086422.png",
      );
      assert.equal(
        getGenericNpcFrameSrc("front", 0),
        "/assets/juego/personajes/generico/front/generico-front00086400.png",
      );
      assert.equal(
        getGenericNpcFrameSrc("front", 27),
        "/assets/juego/personajes/generico/front/generico-front00086427.png",
      );
      assert.equal(
        getGenericNpcFrameSrc("idle", 0),
        "/assets/juego/personajes/generico/generico-idle00086400.png",
      );
    });
  });

  describe("Configuración de las cinco mamparas", () => {
    test("existen exactamente 5 mamparas con identificadores del 1 al 5", () => {
      assert.equal(INITIAL_MAMPARAS_CONFIG.length, 5);
      assert.deepEqual(
        INITIAL_MAMPARAS_CONFIG.map((m) => m.id),
        [1, 2, 3, 4, 5],
      );
    });

    test("las mamparas coinciden con las coordenadas reales de la explanada", () => {
      const expectedX = [32.0, 42.0, 52.0, 62.0, 72.0];
      INITIAL_MAMPARAS_CONFIG.forEach((mampara, index) => {
        assert.equal(mampara.boothPosition.x, expectedX[index]);
        assert.equal(mampara.boothPosition.y, 36.0);
        assert.equal(mampara.targetPosition.x, expectedX[index]);
        assert.equal(mampara.targetPosition.y, 36.5);
      });
    });

    test("los puntos de spawn y salida están fuera del borde inferior visible", () => {
      INITIAL_MAMPARAS_CONFIG.forEach((mampara) => {
        assert.ok(
          mampara.spawnPoint.y > 100.0,
          `El punto de spawn de la mampara ${mampara.id} debe estar debajo de 100%`,
        );
        assert.ok(
          mampara.exitPoint.y > 100.0,
          `El punto de salida de la mampara ${mampara.id} debe estar debajo de 100%`,
        );
        assert.equal(mampara.isOccupied, false);
        assert.equal(mampara.occupiedByNpcId, null);
      });
    });

    test("el temporizador de spawn automático está explícitamente deshabilitado en Fase 1", () => {
      INITIAL_MAMPARAS_CONFIG.forEach((mampara) => {
        assert.equal(mampara.spawnTimerConfig.isEnabled, false);
        assert.ok(mampara.spawnTimerConfig.minDelayMs > 0);
        assert.ok(
          mampara.spawnTimerConfig.maxDelayMs >
            mampara.spawnTimerConfig.minDelayMs,
        );
      });
    });
  });

  describe("Fábrica de instancias de NPC", () => {
    test("crea un NPC con estado ENTERING y animación inicial back", () => {
      const mampara1 = INITIAL_MAMPARAS_CONFIG[0];
      const npc = createGenericNpcInstance(mampara1, "test-npc-1");

      assert.equal(npc.id, "test-npc-1");
      assert.equal(npc.assignedMamparaId, 1);
      assert.equal(npc.state, "ENTERING");
      assert.equal(npc.currentAnimation, "back");
      assert.equal(npc.position.x, mampara1.spawnPoint.x);
      assert.equal(npc.position.y, mampara1.spawnPoint.y);
      assert.equal(npc.speed, GENERIC_NPC_DEFAULTS.speed);
      assert.equal(npc.isActive, true);
    });
  });
});
