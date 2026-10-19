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
  GENERIC_NPC_WALK_SPEED,
  updateGenericNpc,
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

  describe("Fase 2: Movimiento y llegada a la mampara 3", () => {
    test("el primer NPC está asignado exclusivamente a la mampara 3 en el centro", () => {
      const mampara3 = INITIAL_MAMPARAS_CONFIG[2];
      assert.equal(mampara3.id, 3);
      assert.equal(mampara3.boothPosition.x, 52.0);
      assert.equal(mampara3.targetPosition.y, 36.5);
      assert.equal(mampara3.spawnPoint.y, 106.0);

      const npc = createGenericNpcInstance(mampara3, "npc-gen-mampara-3");
      assert.equal(npc.assignedMamparaId, 3);
      assert.equal(npc.position.x, 52.0);
      assert.equal(npc.position.y, 106.0);
      assert.equal(npc.currentAnimation, "back");
      assert.equal(npc.state, "ENTERING");
    });

    test("updateGenericNpc avanza fluidamente hacia arriba proporcional a dt", () => {
      const mampara3 = INITIAL_MAMPARAS_CONFIG[2];
      const npc = createGenericNpcInstance(mampara3, "npc-gen-mampara-3");
      const dt = 0.5; // 500 ms

      const updated = updateGenericNpc(npc, mampara3, dt);
      const expectedY = npc.position.y - npc.speed * dt;

      assert.equal(updated.position.y, expectedY);
      assert.equal(updated.position.x, 52.0);
      assert.equal(updated.state, "ENTERING");
      assert.equal(updated.currentAnimation, "back");
    });

    test("al alcanzar la mampara se detiene exactamente en Y = 36.5% sin sobrepaso", () => {
      const mampara3 = INITIAL_MAMPARAS_CONFIG[2];
      const npc = createGenericNpcInstance(mampara3, "npc-gen-mampara-3");

      // Simulamos que el NPC está a punto de llegar (Y = 36.6%)
      const nearNpc = {
        ...npc,
        position: { x: 52.0, y: 36.6 },
      };

      // Con dt = 0.1s y velocidad 12%/s, el paso sería 1.2%, sobrepasando 36.5% si no se clampeara
      const arrivedNpc = updateGenericNpc(nearNpc, mampara3, 0.1);

      assert.equal(arrivedNpc.position.y, 36.5);
      assert.equal(arrivedNpc.position.x, 52.0);
      assert.equal(arrivedNpc.state, "IDLE");
      assert.equal(arrivedNpc.currentAnimation, "idle");
      assert.equal(arrivedNpc.elapsedInStateMs, 0);
    });

    test("en estado IDLE permanece indefinidamente detenido en la mampara", () => {
      const mampara3 = INITIAL_MAMPARAS_CONFIG[2];
      const idleNpc = {
        ...createGenericNpcInstance(mampara3, "npc-gen-mampara-3"),
        position: { x: 52.0, y: 36.5 },
        state: "IDLE",
        currentAnimation: "idle",
      };

      // Ticks posteriores en IDLE
      const tick1 = updateGenericNpc(idleNpc, mampara3, 1.0);
      assert.equal(tick1.position.y, 36.5);
      assert.equal(tick1.state, "IDLE");
      assert.equal(tick1.currentAnimation, "idle");

      const tick2 = updateGenericNpc(tick1, mampara3, 2.0);
      assert.equal(tick2.position.y, 36.5);
      assert.equal(tick2.state, "IDLE");
      assert.equal(tick2.currentAnimation, "idle");
    });
  });
});

