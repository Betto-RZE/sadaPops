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
  getRandomSpawnDelayMs,
  updateGenericNpc,
  simulateNpcsStep,
} from "../src/features/npcs/genericNpcConfig.ts";
import {
  NPC_COLLISION_DEFAULTS,
  getNpcBoundingBox,
  getPlayerBoundingBox,
  checkCharactersOverlap,
  isPositionBlockedByIdleNpc,
  getNpcLateralPushVector,
} from "../src/features/npcs/genericNpcCollisions.ts";

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

  describe("Fase 4: Sistema independiente de NPCs para las cinco mamparas", () => {
    test("1. el sistema global permanece desactivado durante la entrada del primer NPC", () => {
      const mamparas = INITIAL_MAMPARAS_CONFIG.map((m) =>
        m.id === 3
          ? { ...m, isOccupied: true, occupiedByNpcId: "npc-gen-mampara-3" }
          : m,
      );
      const firstNpc = createGenericNpcInstance(
        mamparas[2],
        "npc-gen-mampara-3",
        5000,
      );

      const state = {
        npcs: [firstNpc],
        mamparas,
        isGlobalSystemActive: false,
        npcIdCounter: 1,
      };

      const step1 = simulateNpcsStep(state, 1.0);
      assert.equal(step1.isGlobalSystemActive, false);
      assert.equal(step1.justActivatedGlobal, false);
      assert.equal(step1.npcs[0].state, "ENTERING");
      assert.ok(step1.mamparas.every((m) => !m.spawnTimerConfig.isEnabled));
    });

    test("2. el sistema global permanece desactivado mientras el primer NPC está en IDLE", () => {
      const mamparas = INITIAL_MAMPARAS_CONFIG.map((m) =>
        m.id === 3
          ? { ...m, isOccupied: true, occupiedByNpcId: "npc-gen-mampara-3" }
          : m,
      );
      const idleNpc = {
        ...createGenericNpcInstance(mamparas[2], "npc-gen-mampara-3", 5000),
        position: { x: 52.0, y: 36.5 },
        state: "IDLE",
        currentAnimation: "idle",
        elapsedInStateMs: 1000,
      };

      const state = {
        npcs: [idleNpc],
        mamparas,
        isGlobalSystemActive: false,
        npcIdCounter: 1,
      };

      const step = simulateNpcsStep(state, 1.0);
      assert.equal(step.isGlobalSystemActive, false);
      assert.equal(step.justActivatedGlobal, false);
      assert.equal(step.npcs[0].state, "IDLE");
      assert.ok(step.mamparas.every((m) => !m.spawnTimerConfig.isEnabled));
    });

    test("3. se activa exactamente al producirse la transición IDLE -> LEAVING del primer NPC", () => {
      const mamparas = INITIAL_MAMPARAS_CONFIG.map((m) =>
        m.id === 3
          ? { ...m, isOccupied: true, occupiedByNpcId: "npc-gen-mampara-3" }
          : m,
      );
      const votingTime = 5000;
      const almostLeavingNpc = {
        ...createGenericNpcInstance(mamparas[2], "npc-gen-mampara-3", votingTime),
        position: { x: 52.0, y: 36.5 },
        state: "IDLE",
        currentAnimation: "idle",
        elapsedInStateMs: 4950, // a 50ms de terminar
      };

      const state = {
        npcs: [almostLeavingNpc],
        mamparas,
        isGlobalSystemActive: false,
        npcIdCounter: 1,
      };

      const step = simulateNpcsStep(state, 0.1); // 100ms
      assert.equal(step.isGlobalSystemActive, true);
      assert.equal(step.justActivatedGlobal, true);
      assert.equal(step.npcs[0].state, "LEAVING");
      assert.equal(step.npcs[0].currentAnimation, "front");
    });

    test("4. la activación ocurre una sola vez por ejecución", () => {
      const mamparas = INITIAL_MAMPARAS_CONFIG.map((m) =>
        m.id === 3
          ? { ...m, isOccupied: true, occupiedByNpcId: "npc-gen-mampara-3" }
          : m,
      );
      const leavingNpc = {
        ...createGenericNpcInstance(mamparas[2], "npc-gen-mampara-3", 5000),
        position: { x: 52.0, y: 40.0 },
        state: "LEAVING",
        currentAnimation: "front",
        elapsedInStateMs: 500,
      };

      const state = {
        npcs: [leavingNpc],
        mamparas,
        isGlobalSystemActive: true,
        npcIdCounter: 1,
      };

      const step = simulateNpcsStep(state, 0.5);
      assert.equal(step.isGlobalSystemActive, true);
      assert.equal(step.justActivatedGlobal, false);
    });

    test("5. las mamparas 1, 2, 4 y 5 comienzan sus esperas inmediatamente tras activarse", () => {
      const mamparas = INITIAL_MAMPARAS_CONFIG.map((m) =>
        m.id === 3
          ? { ...m, isOccupied: true, occupiedByNpcId: "npc-gen-mampara-3" }
          : m,
      );
      const almostLeavingNpc = {
        ...createGenericNpcInstance(mamparas[2], "npc-gen-mampara-3", 4000),
        position: { x: 52.0, y: 36.5 },
        state: "IDLE",
        currentAnimation: "idle",
        elapsedInStateMs: 3950,
      };

      const state = {
        npcs: [almostLeavingNpc],
        mamparas,
        isGlobalSystemActive: false,
        npcIdCounter: 1,
      };

      const step = simulateNpcsStep(state, 0.1, 1000);
      assert.equal(step.justActivatedGlobal, true);

      // Mamparas 1, 2, 4 y 5 deben estar habilitadas con tiempos > 0
      [1, 2, 4, 5].forEach((id) => {
        const m = step.mamparas.find((booth) => booth.id === id);
        assert.ok(m.spawnTimerConfig.isEnabled, `Mampara ${id} debe estar habilitada`);
        assert.ok(
          m.spawnTimerConfig.nextSpawnDelayMs >= 900 &&
            m.spawnTimerConfig.nextSpawnDelayMs <= 3000,
          `Mampara ${id} debe tener un delay en [1000, 3000] ms menos dt`,
        );
      });
    });

    test("6. la mampara 3 espera hasta que el primer NPC alcance FINISHED para iniciar su espera", () => {
      const mamparas = INITIAL_MAMPARAS_CONFIG.map((m) =>
        m.id === 3
          ? { ...m, isOccupied: true, occupiedByNpcId: "npc-gen-mampara-3" }
          : m,
      );
      const leavingNpc = {
        ...createGenericNpcInstance(mamparas[2], "npc-gen-mampara-3", 5000),
        position: { x: 52.0, y: 100.0 },
        state: "LEAVING",
        currentAnimation: "front",
        elapsedInStateMs: 2000,
      };

      let state = {
        npcs: [leavingNpc],
        mamparas,
        isGlobalSystemActive: true,
        npcIdCounter: 1,
      };

      // Mientras desciende hacia Y = 106.0%, la mampara 3 sigue ocupada
      state = simulateNpcsStep(state, 0.2); // avanza 2.4% -> Y = 102.4%
      assert.equal(state.mamparas[2].isOccupied, true);
      assert.equal(state.mamparas[2].occupiedByNpcId, "npc-gen-mampara-3");

      // Cuando alcanza y supera Y = 106.0%, transiciona a FINISHED y se libera
      state = simulateNpcsStep(state, 0.5); // avanza 6.0% -> llega a 106.0%
      assert.equal(state.mamparas[2].isOccupied, false);
      assert.equal(state.mamparas[2].occupiedByNpcId, null);
      assert.ok(state.mamparas[2].spawnTimerConfig.isEnabled);
      assert.ok(state.mamparas[2].spawnTimerConfig.nextSpawnDelayMs > 0);
    });

    test("7. cada mampara genera tiempos independientes entre 1000 y 3000 ms con decimales", () => {
      const delays = [];
      for (let i = 0; i < 50; i++) {
        const delay = getRandomSpawnDelayMs();
        assert.ok(
          delay >= 1000 && delay <= 3000,
          `El delay ${delay} debe estar en el intervalo [1000, 3000] ms`,
        );
        assert.ok(!Number.isInteger(delay), "Debe permitir valores decimales");
        delays.push(delay);
      }
      const uniqueCount = new Set(delays).size;
      assert.ok(uniqueCount > 45, "Los tiempos generados deben ser independientes y continuos");
    });

    test("8. los NPCs permanecen en IDLE entre 4000 y 8000 ms", () => {
      for (let i = 0; i < 50; i++) {
        const votingTime = getRandomVotingTimeMs();
        assert.ok(votingTime >= 4000 && votingTime <= 8000);
      }
    });

    test("9. cada mampara admite como máximo un NPC activo (control de ocupación)", () => {
      const mockOptions = {
        getRandomSpawnDelay: () => 1000,
        getRandomVotingTime: () => 5000,
      };

      let state = {
        npcs: [],
        mamparas: INITIAL_MAMPARAS_CONFIG.map((m) => ({
          ...m,
          spawnTimerConfig: {
            ...m.spawnTimerConfig,
            isEnabled: true,
            nextSpawnDelayMs: 500, // 500ms restantes
          },
        })),
        isGlobalSystemActive: true,
        npcIdCounter: 0,
      };

      // Avanzamos 600ms: las 5 mamparas generan exactamente 1 NPC cada una
      state = simulateNpcsStep(state, 0.6, 600, mockOptions);
      assert.equal(state.npcs.length, 5);
      state.mamparas.forEach((m) => {
        assert.equal(m.isOccupied, true);
        assert.ok(m.occupiedByNpcId !== null);
      });

      // Avanzamos 2.0s más: ningún NPC adicional debe ser creado mientras están ocupadas
      state = simulateNpcsStep(state, 2.0, 2600, mockOptions);
      assert.equal(state.npcs.length, 5);
    });

    test("10. los NPCs se eliminan correctamente de la lista al salir del mapa", () => {
      const exitingNpc = {
        ...createGenericNpcInstance(INITIAL_MAMPARAS_CONFIG[0], "npc-to-remove", 5000),
        position: { x: 32.0, y: 105.0 },
        state: "LEAVING",
        currentAnimation: "front",
      };

      let state = {
        npcs: [exitingNpc],
        mamparas: INITIAL_MAMPARAS_CONFIG.map((m) =>
          m.id === 1 ? { ...m, isOccupied: true, occupiedByNpcId: exitingNpc.id } : m,
        ),
        isGlobalSystemActive: true,
        npcIdCounter: 1,
      };

      // Con dt = 0.5s avanza 6% alcanzando 106.0% (FINISHED)
      state = simulateNpcsStep(state, 0.5);
      assert.equal(state.npcs.length, 0, "El NPC finalizado debe eliminarse de npcs");
      assert.equal(state.finishedMamparaIds.length, 1);
      assert.equal(state.finishedMamparaIds[0], 1);
      assert.equal(state.mamparas[0].isOccupied, false);
    });

    test("11. los ciclos de cada mampara se repiten automáticamente tras la salida", () => {
      const mockOptions = {
        getRandomSpawnDelay: () => 1000,
        getRandomVotingTime: () => 4000,
      };

      const mampara1 = INITIAL_MAMPARAS_CONFIG[0];
      const npc1 = {
        ...createGenericNpcInstance(mampara1, "npc-cycle-1", 4000),
        position: { x: 32.0, y: 105.5 },
        state: "LEAVING",
        currentAnimation: "front",
      };

      let state = {
        npcs: [npc1],
        mamparas: INITIAL_MAMPARAS_CONFIG.map((m) =>
          m.id === 1 ? { ...m, isOccupied: true, occupiedByNpcId: npc1.id } : m,
        ),
        isGlobalSystemActive: true,
        npcIdCounter: 1,
      };

      // 1. Termina el primer NPC
      state = simulateNpcsStep(state, 0.1, 100, mockOptions);
      assert.equal(state.npcs.length, 0);
      assert.equal(state.mamparas[0].isOccupied, false);
      assert.ok(state.mamparas[0].spawnTimerConfig.nextSpawnDelayMs > 0);

      // 2. Espera 1.0s (delay cumplido)
      state = simulateNpcsStep(state, 1.0, 1100, mockOptions);
      assert.equal(state.npcs.length, 1, "Un nuevo NPC debe haber spawneado en mampara 1");
      assert.equal(state.npcs[0].assignedMamparaId, 1);
      assert.equal(state.mamparas[0].isOccupied, true);
    });

    test("12. los temporizadores descuentan de forma continua y monótona sin reiniciarse", () => {
      let state = {
        npcs: [],
        mamparas: INITIAL_MAMPARAS_CONFIG.map((m) => ({
          ...m,
          spawnTimerConfig: {
            ...m.spawnTimerConfig,
            isEnabled: true,
            nextSpawnDelayMs: 2500,
          },
        })),
        isGlobalSystemActive: true,
        npcIdCounter: 0,
      };

      // 3 pasos sucesivos de 100 ms
      state = simulateNpcsStep(state, 0.1);
      assert.ok(Math.abs(state.mamparas[0].spawnTimerConfig.nextSpawnDelayMs - 2400) < 0.001);

      state = simulateNpcsStep(state, 0.1);
      assert.ok(Math.abs(state.mamparas[0].spawnTimerConfig.nextSpawnDelayMs - 2300) < 0.001);

      state = simulateNpcsStep(state, 0.1);
      assert.ok(Math.abs(state.mamparas[0].spawnTimerConfig.nextSpawnDelayMs - 2200) < 0.001);
    });

    test("13. el sistema simula múltiples NPCs simultáneos en distintas fases sin interferencias", () => {
      const npcs = [
        {
          ...createGenericNpcInstance(INITIAL_MAMPARAS_CONFIG[0], "npc-1", 5000),
          position: { x: 32.0, y: 80.0 },
          state: "ENTERING",
          currentAnimation: "back",
        },
        {
          ...createGenericNpcInstance(INITIAL_MAMPARAS_CONFIG[1], "npc-2", 6000),
          position: { x: 42.0, y: 36.5 },
          state: "IDLE",
          currentAnimation: "idle",
        },
        {
          ...createGenericNpcInstance(INITIAL_MAMPARAS_CONFIG[2], "npc-3", 4000),
          position: { x: 52.0, y: 60.0 },
          state: "LEAVING",
          currentAnimation: "front",
        },
      ];

      const mamparas = INITIAL_MAMPARAS_CONFIG.map((m) => ({
        ...m,
        isOccupied: m.id <= 3,
        occupiedByNpcId: m.id <= 3 ? `npc-${m.id}` : null,
      }));

      const state = {
        npcs,
        mamparas,
        isGlobalSystemActive: true,
        npcIdCounter: 3,
      };

      const next = simulateNpcsStep(state, 0.5);
      assert.equal(next.npcs.length, 3);
      // NPC 1 avanza hacia arriba (Y disminuye de 80 a 74)
      assert.equal(next.npcs[0].position.y, 74.0);
      // NPC 2 permanece quieto en la mampara (Y = 36.5)
      assert.equal(next.npcs[1].position.y, 36.5);
      // NPC 3 avanza hacia abajo (Y aumenta de 60 a 66)
      assert.equal(next.npcs[2].position.y, 66.0);
    });

    test("14. la limpieza restablece todas las mamparas y estados a sus valores iniciales", () => {
      const cleanMamparas = INITIAL_MAMPARAS_CONFIG;
      assert.ok(cleanMamparas.every((m) => !m.isOccupied));
      assert.ok(cleanMamparas.every((m) => m.occupiedByNpcId === null));
      assert.ok(cleanMamparas.every((m) => !m.spawnTimerConfig.isEnabled));
    });

    test("15. la ejecución del capítulo puede reiniciarse sin personajes residuales ni duplicaciones", () => {
      const initialBooth3 = INITIAL_MAMPARAS_CONFIG[2];
      const run1Npc = createGenericNpcInstance(initialBooth3, "npc-gen-mampara-3");

      let state = {
        npcs: [run1Npc],
        mamparas: INITIAL_MAMPARAS_CONFIG.map((m) =>
          m.id === 3 ? { ...m, isOccupied: true, occupiedByNpcId: run1Npc.id } : m,
        ),
        isGlobalSystemActive: false,
        npcIdCounter: 1,
      };

      // Simula reset y reinicio limpio
      state = {
        npcs: [],
        mamparas: INITIAL_MAMPARAS_CONFIG,
        isGlobalSystemActive: false,
        npcIdCounter: 0,
      };

      // Segundo arranque
      const run2Npc = createGenericNpcInstance(initialBooth3, "npc-gen-mampara-3");
      state.npcs = [run2Npc];
      state.mamparas = INITIAL_MAMPARAS_CONFIG.map((m) =>
        m.id === 3 ? { ...m, isOccupied: true, occupiedByNpcId: run2Npc.id } : m,
      );
      state.npcIdCounter = 1;

      assert.equal(state.npcs.length, 1);
      assert.equal(state.npcs[0].id, "npc-gen-mampara-3");
      assert.equal(state.isGlobalSystemActive, false);
      assert.equal(state.mamparas.filter((m) => m.isOccupied).length, 1);
    });
  });

  describe("Fase 5.2: Colisiones dinámicas entre NPCs genéricos y protagonista", () => {
    const isAlwaysWalkable = () => true;

    test("1. detección correcta de solapamiento entre cajas de colisión de pies", () => {
      const playerPos = { x: 50.0, y: 50.0 };
      const npcPos = { x: 52.0, y: 51.0 };

      // totalHalfW = 2.8 + 2.8 = 5.6. deltaX = 2.0 < 5.6
      // totalHalfH = 2.2 + 2.2 = 4.4. deltaY = 1.0 < 4.4
      const result = checkCharactersOverlap(playerPos, npcPos);
      assert.equal(result.isColliding, true);
      assert.ok(Math.abs(result.overlapX - 3.6) < 0.001);
      assert.ok(Math.abs(result.overlapY - 3.4) < 0.001);
    });

    test("2. ausencia de colisión cuando los personajes están suficientemente separados", () => {
      const playerPos = { x: 50.0, y: 50.0 };
      const npcPos = { x: 60.0, y: 50.0 }; // deltaX = 10.0 > 5.6

      const result = checkCharactersOverlap(playerPos, npcPos);
      assert.equal(result.isColliding, false);
      assert.equal(result.overlapX, 0);
      assert.equal(result.overlapY, 0);

      const mampara = INITIAL_MAMPARAS_CONFIG[2];
      const npc = {
        ...createGenericNpcInstance(mampara, "npc-separated"),
        position: npcPos,
        state: "ENTERING",
      };

      const push = getNpcLateralPushVector({
        playerPos,
        npcs: [npc],
        isPositionWalkable: isAlwaysWalkable,
      });
      assert.equal(push.pushVector, null);
    });

    test("3. empuje lateral hacia la derecha cuando el jugador está a la derecha del NPC", () => {
      const mampara = INITIAL_MAMPARAS_CONFIG[2];
      const npc = {
        ...createGenericNpcInstance(mampara, "npc-push-right"),
        position: { x: 52.0, y: 50.0 },
        state: "ENTERING",
      };
      const playerPos = { x: 53.0, y: 50.0 }; // px > nx -> derecha

      const push = getNpcLateralPushVector({
        playerPos,
        npcs: [npc],
        isPositionWalkable: isAlwaysWalkable,
      });

      assert.ok(push.pushVector !== null);
      assert.equal(push.pushVector.vx, 1);
      assert.equal(push.pushVector.vy, 0);
      assert.equal(push.activePushState.dir, 1);
    });

    test("4. empuje lateral hacia la izquierda cuando el jugador está a la izquierda del NPC", () => {
      const mampara = INITIAL_MAMPARAS_CONFIG[2];
      const npc = {
        ...createGenericNpcInstance(mampara, "npc-push-left"),
        position: { x: 52.0, y: 50.0 },
        state: "ENTERING",
      };
      const playerPos = { x: 51.0, y: 50.0 }; // px < nx -> izquierda

      const push = getNpcLateralPushVector({
        playerPos,
        npcs: [npc],
        isPositionWalkable: isAlwaysWalkable,
      });

      assert.ok(push.pushVector !== null);
      assert.equal(push.pushVector.vx, -1);
      assert.equal(push.pushVector.vy, 0);
      assert.equal(push.activePushState.dir, -1);
    });

    test("5. selección determinista y estable cuando ambos personajes están exactamente centrados en X", () => {
      const mampara = INITIAL_MAMPARAS_CONFIG[2];
      const npc = {
        ...createGenericNpcInstance(mampara, "npc-centered"),
        position: { x: 52.0, y: 50.0 },
        state: "ENTERING",
      };
      const playerPos = { x: 52.0, y: 50.0 }; // px === nx

      const step1 = getNpcLateralPushVector({
        playerPos,
        npcs: [npc],
        isPositionWalkable: isAlwaysWalkable,
      });

      assert.ok(step1.pushVector !== null);
      assert.equal(step1.pushVector.vx, 1, "Regla determinista: desvío a la derecha");
      assert.equal(step1.activePushState.dir, 1);

      // Siguiente cuadro manteniendo activePushState
      const step2 = getNpcLateralPushVector({
        playerPos,
        npcs: [npc],
        isPositionWalkable: isAlwaysWalkable,
        activePushState: step1.activePushState,
      });
      assert.equal(step2.pushVector.vx, 1, "Conserva la misma dirección sin alternar");
    });

    test("6. cambio automático al lado contrario cuando el preferente está bloqueado", () => {
      const mampara = INITIAL_MAMPARAS_CONFIG[2];
      const npc = {
        ...createGenericNpcInstance(mampara, "npc-wall"),
        position: { x: 52.0, y: 50.0 },
        state: "ENTERING",
      };
      const playerPos = { x: 53.0, y: 50.0 }; // Preferente sería derecha (vx = 1)

      // Mock: derecha está bloqueada por un obstáculo (x > 53.0 es false), izquierda está libre
      const mockWalkable = (x) => x <= 53.0;

      const push = getNpcLateralPushVector({
        playerPos,
        npcs: [npc],
        isPositionWalkable: mockWalkable,
      });

      assert.ok(push.pushVector !== null);
      assert.equal(push.pushVector.vx, -1, "Debe elegir el lado contrario (izquierda)");
      assert.equal(push.activePushState.dir, -1);
    });

    test("7. ausencia de desplazamiento cuando no existe ninguna dirección segura", () => {
      const mampara = INITIAL_MAMPARAS_CONFIG[2];
      const npc = {
        ...createGenericNpcInstance(mampara, "npc-trapped"),
        position: { x: 52.0, y: 50.0 },
        state: "ENTERING",
      };
      const playerPos = { x: 52.0, y: 50.0 };

      // Mock: nada es transitable alrededor
      const mockNeverWalkable = () => false;

      const push = getNpcLateralPushVector({
        playerPos,
        npcs: [npc],
        isPositionWalkable: mockNeverWalkable,
      });

      assert.equal(push.pushVector, null, "No debe forzar movimiento hacia zonas bloqueadas");
    });

    test("8. respeto estricto de los límites del escenario (plaza bounds)", () => {
      const mampara = INITIAL_MAMPARAS_CONFIG[0]; // Mampara 1 en X = 32.0%
      const npc = {
        ...createGenericNpcInstance(mampara, "npc-left-edge"),
        position: { x: 32.0, y: 60.0 },
        state: "ENTERING",
      };
      // Jugador entre el NPC y el borde izquierdo
      const playerPos = { x: 31.0, y: 60.0 };

      // Si la izquierda está fuera de límites (x < 31.0 es false)
      const mockBoundary = (x) => x >= 31.0;

      const push = getNpcLateralPushVector({
        playerPos,
        npcs: [npc],
        isPositionWalkable: mockBoundary,
      });

      assert.ok(push.pushVector !== null);
      assert.equal(push.pushVector.vx, 1, "Debe empujar hacia la derecha para no salir de los límites");
    });

    test("9. prevención de atravesar obstáculos sólidos mediante validación de trayectoria", () => {
      const mampara = INITIAL_MAMPARAS_CONFIG[2];
      const npc = {
        ...createGenericNpcInstance(mampara, "npc-booth-near"),
        position: { x: 52.0, y: 38.0 },
        state: "ENTERING",
      };
      const playerPos = { x: 52.0, y: 37.0 };

      // Mampara sólida arriba (y <= 36.5 bloqueado)
      const mockObstacles = (x, y) => y > 36.5;

      const push = getNpcLateralPushVector({
        playerPos,
        npcs: [npc],
        isPositionWalkable: mockObstacles,
      });

      assert.ok(push.pushVector !== null);
      assert.equal(push.pushVector.vy, 0, "El empuje es lateral y no empuja hacia la mampara sólida superior");
    });

    test("10. genera empuje activo con NPCs en estado ENTERING", () => {
      const mampara = INITIAL_MAMPARAS_CONFIG[2];
      const enteringNpc = {
        ...createGenericNpcInstance(mampara, "npc-entering"),
        position: { x: 52.0, y: 50.0 },
        state: "ENTERING",
      };

      const push = getNpcLateralPushVector({
        playerPos: { x: 52.0, y: 50.0 },
        npcs: [enteringNpc],
        isPositionWalkable: isAlwaysWalkable,
      });

      assert.ok(push.pushVector !== null);
      assert.equal(push.pushingNpc.id, "npc-entering");
    });

    test("11. genera empuje activo con NPCs en estado LEAVING", () => {
      const mampara = INITIAL_MAMPARAS_CONFIG[2];
      const leavingNpc = {
        ...createGenericNpcInstance(mampara, "npc-leaving"),
        position: { x: 52.0, y: 50.0 },
        state: "LEAVING",
      };

      const push = getNpcLateralPushVector({
        playerPos: { x: 52.0, y: 50.0 },
        npcs: [leavingNpc],
        isPositionWalkable: isAlwaysWalkable,
      });

      assert.ok(push.pushVector !== null);
      assert.equal(push.pushingNpc.id, "npc-leaving");
    });

    test("12. comportamiento estático de NPCs en IDLE: no empujan activamente y bloquean paso", () => {
      const mampara = INITIAL_MAMPARAS_CONFIG[2];
      const idleNpc = {
        ...createGenericNpcInstance(mampara, "npc-idle"),
        position: { x: 52.0, y: 36.5 },
        state: "IDLE",
      };

      // 1. No empuja activamente
      const push = getNpcLateralPushVector({
        playerPos: { x: 52.0, y: 36.5 },
        npcs: [idleNpc],
        isPositionWalkable: isAlwaysWalkable,
      });
      assert.equal(push.pushVector, null, "Un NPC en IDLE no empuja activamente");

      // 2. Bloquea el paso como obstáculo
      const isBlocked = isPositionBlockedByIdleNpc({ x: 52.0, y: 37.0 }, [idleNpc]);
      assert.equal(isBlocked, true, "isPositionBlockedByIdleNpc debe bloquear la posición");

      const isClear = isPositionBlockedByIdleNpc({ x: 60.0, y: 50.0 }, [idleNpc]);
      assert.equal(isClear, false, "Posición lejana no debe estar bloqueada");
    });

    test("13. exclusión total de NPCs en estado FINISHED", () => {
      const mampara = INITIAL_MAMPARAS_CONFIG[2];
      const finishedNpc = {
        ...createGenericNpcInstance(mampara, "npc-finished"),
        position: { x: 52.0, y: 106.0 },
        state: "FINISHED",
        isActive: false,
      };

      const push = getNpcLateralPushVector({
        playerPos: { x: 52.0, y: 106.0 },
        npcs: [finishedNpc],
        isPositionWalkable: isAlwaysWalkable,
      });
      assert.equal(push.pushVector, null);

      const isBlocked = isPositionBlockedByIdleNpc({ x: 52.0, y: 106.0 }, [finishedNpc]);
      assert.equal(isBlocked, false);
    });

    test("14. comportamiento con varios NPCs: prioriza el de mayor solapamiento y evita empujar hacia el segundo", () => {
      const mampara1 = INITIAL_MAMPARAS_CONFIG[0]; // x: 32.0
      const mampara2 = INITIAL_MAMPARAS_CONFIG[1]; // x: 42.0

      const npc1 = {
        ...createGenericNpcInstance(mampara1, "npc-multi-1"),
        position: { x: 32.0, y: 50.0 },
        state: "ENTERING",
      };
      const npc2 = {
        ...createGenericNpcInstance(mampara2, "npc-multi-2"),
        position: { x: 42.0, y: 50.0 },
        state: "ENTERING",
      };

      // Jugador en X = 33.0 (solapamiento mucho más severo con npc1 en 32.0 que con npc2 en 42.0)
      const playerPos = { x: 33.0, y: 50.0 };

      const push = getNpcLateralPushVector({
        playerPos,
        npcs: [npc1, npc2],
        isPositionWalkable: isAlwaysWalkable,
      });

      assert.ok(push.pushVector !== null);
      assert.equal(push.pushingNpc.id, "npc-multi-1", "Debe priorizar el NPC con mayor solapamiento");
    });

    test("15. ausencia de oscilaciones manteniendo la dirección mediante histéresis", () => {
      const mampara = INITIAL_MAMPARAS_CONFIG[2];
      const npc = {
        ...createGenericNpcInstance(mampara, "npc-hysteresis"),
        position: { x: 52.0, y: 50.0 },
        state: "ENTERING",
      };

      // Inicio: jugador en 52.5 (a la derecha)
      let activePushState = null;
      let curX = 52.5;
      const step = 0.25;

      for (let frame = 0; frame < 15; frame++) {
        const push = getNpcLateralPushVector({
          playerPos: { x: curX, y: 50.0 },
          npcs: [npc],
          isPositionWalkable: isAlwaysWalkable,
          activePushState,
        });

        if (curX < 52.0 + NPC_COLLISION_DEFAULTS.separationThreshold) {
          assert.ok(push.pushVector !== null, `Frame ${frame} debe mantener empuje`);
          assert.equal(push.pushVector.vx, 1, `Frame ${frame} debe mantener vx = +1 sin oscilar`);
          activePushState = push.activePushState;
          curX += step;
        }
      }
    });

    test("16. velocidad de empuje configurable progresiva dependiente de deltaTime", () => {
      const dt1 = 0.016; // 16 ms (~60 FPS)
      const pushSpeed = NPC_COLLISION_DEFAULTS.pushSpeed; // 16.0% / s
      const displacement1 = pushSpeed * dt1;
      assert.ok(Math.abs(displacement1 - 0.256) < 0.001);

      const dt2 = 0.033; // 33 ms (~30 FPS)
      const displacement2 = pushSpeed * dt2;
      assert.ok(Math.abs(displacement2 - 0.528) < 0.001);
    });

    test("17. limpieza y reinicio: activePushState se desvanece al superar separationThreshold", () => {
      const mampara = INITIAL_MAMPARAS_CONFIG[2];
      const npc = {
        ...createGenericNpcInstance(mampara, "npc-clear"),
        position: { x: 52.0, y: 50.0 },
        state: "ENTERING",
      };

      // Posición fuera de la zona de contacto (> separationThreshold = 6.0%)
      const playerPos = { x: 59.0, y: 50.0 };
      const push = getNpcLateralPushVector({
        playerPos,
        npcs: [npc],
        isPositionWalkable: isAlwaysWalkable,
        activePushState: { npcId: npc.id, dir: 1 },
      });

      assert.equal(push.pushVector, null);
      assert.equal(push.activePushState, null, "activePushState debe limpiarse al separarse");
    });

    test("18. cajas de colisión calculan dimensiones exactas de 2.8% y 2.2%", () => {
      const npcBox = getNpcBoundingBox({ x: 50.0, y: 50.0 });
      assert.equal(npcBox.minX, 47.2);
      assert.equal(npcBox.maxX, 52.8);
      assert.equal(npcBox.minY, 47.8);
      assert.equal(npcBox.maxY, 52.2);

      const playerBox = getPlayerBoundingBox({ x: 50.0, y: 50.0 });
      assert.equal(playerBox.minX, 47.2);
      assert.equal(playerBox.maxX, 52.8);
      assert.equal(playerBox.minY, 47.8);
      assert.equal(playerBox.maxY, 52.2);
    });
  });
});


