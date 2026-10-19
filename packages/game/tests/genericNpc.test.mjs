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
  getRandomVotingTimeMs,
  updateGenericNpc,
} from "../src/features/npcs/genericNpcConfig.ts";

describe("Sistema de NPCs Genéricos - Pruebas de Integración y Ciclo de Vida", () => {
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

    test("el temporizador de spawn automático está explícitamente deshabilitado en Fase 1 y 2", () => {
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
      assert.equal(npc.speed, GENERIC_NPC_WALK_SPEED);
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

      const nearNpc = {
        ...npc,
        position: { x: 52.0, y: 36.6 },
      };

      const arrivedNpc = updateGenericNpc(nearNpc, mampara3, 0.1);

      assert.equal(arrivedNpc.position.y, 36.5);
      assert.equal(arrivedNpc.position.x, 52.0);
      assert.equal(arrivedNpc.state, "IDLE");
      assert.equal(arrivedNpc.currentAnimation, "idle");
    });
  });

  describe("Fase 3: Ciclo completo de votación y salida", () => {
    test("el tiempo aleatorio de votación siempre se encuentra entre 4000 y 8000 ms", () => {
      for (let i = 0; i < 50; i++) {
        const timeMs = getRandomVotingTimeMs();
        assert.ok(
          timeMs >= 4000 && timeMs <= 8000,
          `El tiempo generado (${timeMs}) debe estar entre 4000 y 8000 ms`,
        );
        // Debe contener decimales
        assert.ok(!Number.isInteger(timeMs));
      }
    });

    test("el tiempo de votación se genera una sola vez y se conserva durante IDLE", () => {
      const mampara3 = INITIAL_MAMPARAS_CONFIG[2];
      const fixedVotingTime = 5500.25;
      const npc = {
        ...createGenericNpcInstance(mampara3, "npc-gen-mampara-3", fixedVotingTime),
        position: { x: 52.0, y: 36.5 },
        state: "IDLE",
        currentAnimation: "idle",
        elapsedInStateMs: 0,
      };

      // Tick intermedio (dt = 2.0 s = 2000 ms)
      const tick = updateGenericNpc(npc, mampara3, 2.0);
      assert.equal(tick.votingWaitTimeMs, fixedVotingTime);
      assert.equal(tick.state, "IDLE");
      assert.equal(tick.currentAnimation, "idle");
      assert.equal(tick.position.x, 52.0);
      assert.equal(tick.position.y, 36.5);
      assert.equal(tick.elapsedInStateMs, 2000);
    });

    test("al cumplirse el tiempo de votación transiciona automáticamente a LEAVING con generico-front", () => {
      const mampara3 = INITIAL_MAMPARAS_CONFIG[2];
      const votingTime = 5000;
      const idleNpc = {
        ...createGenericNpcInstance(mampara3, "npc-gen-mampara-3", votingTime),
        position: { x: 52.0, y: 36.5 },
        state: "IDLE",
        currentAnimation: "idle",
        elapsedInStateMs: 4900, // Faltan 100 ms para cumplir el tiempo
      };

      // Pasamos un dt de 300 ms (0.3 s). Cumple los 100 ms restantes y avanza 200 ms hacia abajo.
      const leavingNpc = updateGenericNpc(idleNpc, mampara3, 0.3);

      assert.equal(leavingNpc.state, "LEAVING");
      assert.equal(leavingNpc.currentAnimation, "front");
      assert.equal(leavingNpc.position.x, 52.0);
      // El avance hacia abajo debe ser speed * 0.2s = 12 * 0.2 = 2.4% -> Y = 36.5 + 2.4 = 38.9%
      assert.ok(Math.abs(leavingNpc.position.y - 38.9) < 0.001);
      assert.equal(leavingNpc.elapsedInStateMs, 200);
    });

    test("durante LEAVING desciende verticalmente conservando X = 52.0% y animación front", () => {
      const mampara3 = INITIAL_MAMPARAS_CONFIG[2];
      const leavingNpc = {
        ...createGenericNpcInstance(mampara3, "npc-gen-mampara-3", 5000),
        position: { x: 52.0, y: 50.0 },
        state: "LEAVING",
        currentAnimation: "front",
        elapsedInStateMs: 1000,
      };

      const dt = 1.0; // 1 segundo = avanza 12% hacia abajo
      const updated = updateGenericNpc(leavingNpc, mampara3, dt);

      assert.equal(updated.state, "LEAVING");
      assert.equal(updated.currentAnimation, "front");
      assert.equal(updated.position.x, 52.0);
      assert.equal(updated.position.y, 62.0);
    });

    test("al alcanzar el punto de salida (Y = 106.0%) transiciona a FINISHED y se desactiva", () => {
      const mampara3 = INITIAL_MAMPARAS_CONFIG[2];
      const nearExitNpc = {
        ...createGenericNpcInstance(mampara3, "npc-gen-mampara-3", 5000),
        position: { x: 52.0, y: 105.0 },
        state: "LEAVING",
        currentAnimation: "front",
      };

      // Con dt = 0.5s y speed 12%/s avanzaría 6%, llegando a 111.0%, pero debe clampearse a 106.0%
      const finishedNpc = updateGenericNpc(nearExitNpc, mampara3, 0.5);

      assert.equal(finishedNpc.state, "FINISHED");
      assert.equal(finishedNpc.currentAnimation, "front");
      assert.equal(finishedNpc.position.x, 52.0);
      assert.equal(finishedNpc.position.y, 106.0);
      assert.equal(finishedNpc.isActive, false);
    });

    test("ciclo de vida completo: ENTERING -> IDLE -> LEAVING -> FINISHED", () => {
      const mampara3 = INITIAL_MAMPARAS_CONFIG[2];
      const votingTime = 4500;
      let npc = createGenericNpcInstance(mampara3, "npc-full-cycle", votingTime);

      assert.equal(npc.state, "ENTERING");
      assert.equal(npc.position.y, 106.0);

      // Simula subida hasta la mampara (distancia 69.5% a 12%/s = ~5.791s)
      npc = updateGenericNpc(npc, mampara3, 6.0);
      assert.equal(npc.state, "IDLE");
      assert.equal(npc.currentAnimation, "idle");
      assert.equal(npc.position.y, 36.5);

      // Simula espera en la mampara
      npc = updateGenericNpc(npc, mampara3, 3.0);
      assert.equal(npc.state, "IDLE");
      assert.equal(npc.position.y, 36.5);

      // Completa la votación e inicia la salida
      npc = updateGenericNpc(npc, mampara3, 2.0);
      assert.equal(npc.state, "LEAVING");
      assert.equal(npc.currentAnimation, "front");
      assert.ok(npc.position.y > 36.5);

      // Simula caminata hasta salir completamente
      npc = updateGenericNpc(npc, mampara3, 6.0);
      assert.equal(npc.state, "FINISHED");
      assert.equal(npc.position.y, 106.0);
      assert.equal(npc.isActive, false);
    });
  });
});


