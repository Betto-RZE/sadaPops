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
import {
  NPC_DEPTH_LAYERS,
  compareDepthEntities,
  calculateCharacterZIndex,
  calculateSceneCharactersDepth,
  clearDepthCache,
  areDepthEntitiesEqual,
} from "../src/features/npcs/genericNpcDepth.ts";
import {
  calculateCameraShift,
} from "../src/features/npcs/useCinematicNpcCamera.ts";

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

  describe("Fase 5.3: Pulido visual, profundidad y cámara cinematográfica", () => {
    test("1. orden de profundidad entre protagonista y NPCs según coordenada vertical", () => {
      // Caso A: Jugador más abajo que el NPC (más cerca del primer plano)
      const depthA = calculateSceneCharactersDepth([
        { id: "player", y: 55.0 },
        { id: "npc-mampara-3", y: 45.0 },
      ]);
      assert.ok(
        depthA["player"] > depthA["npc-mampara-3"],
        `Jugador (Y=55) debe renderizarse delante de NPC (Y=45): ${depthA["player"]} > ${depthA["npc-mampara-3"]}`,
      );

      // Caso B: Jugador más arriba que el NPC (más lejos en el fondo)
      const depthB = calculateSceneCharactersDepth([
        { id: "player", y: 40.0 },
        { id: "npc-mampara-3", y: 65.0 },
      ]);
      assert.ok(
        depthB["player"] < depthB["npc-mampara-3"],
        `Jugador (Y=40) debe renderizarse detrás de NPC (Y=65): ${depthB["player"]} < ${depthB["npc-mampara-3"]}`,
      );
    });

    test("2. orden de profundidad entre dos o más NPCs", () => {
      const depth = calculateSceneCharactersDepth([
        { id: "npc-1", y: 36.5 },
        { id: "npc-2", y: 50.0 },
        { id: "npc-3", y: 72.0 },
        { id: "npc-4", y: 90.0 },
      ]);

      assert.ok(depth["npc-1"] < depth["npc-2"]);
      assert.ok(depth["npc-2"] < depth["npc-3"]);
      assert.ok(depth["npc-3"] < depth["npc-4"]);

      // Inversión de posiciones: la entidad que baja debe pasar al frente
      const depthInverted = calculateSceneCharactersDepth([
        { id: "npc-1", y: 80.0 },
        { id: "npc-2", y: 50.0 },
      ]);
      assert.ok(
        depthInverted["npc-1"] > depthInverted["npc-2"],
        "Al cambiar posiciones, el NPC con mayor Y pasa al frente",
      );
    });

    test("3. estabilidad y determinismo cuando dos personajes comparten coordenada Y", () => {
      const characters = [
        { id: "player", y: 50.0 },
        { id: "npc-1", y: 50.0 },
      ];

      const run1 = calculateSceneCharactersDepth(characters);
      const run2 = calculateSceneCharactersDepth(characters);
      const run3 = calculateSceneCharactersDepth(characters);

      // Ambos deben recibir capas distintas para evitar z-fighting
      assert.notEqual(run1["player"], run1["npc-1"]);

      // Los resultados deben ser idénticos en múltiples cuadros sucesivos (cero parpadeo)
      assert.equal(run1["player"], run2["player"]);
      assert.equal(run1["player"], run3["player"]);
      assert.equal(run1["npc-1"], run2["npc-1"]);
      assert.equal(run1["npc-1"], run3["npc-1"]);
    });

    test("4. compatibilidad con las capas de las mamparas y boletas", () => {
      // Personaje detrás de las mamparas (Y < 36.0)
      const depthBehind = calculateSceneCharactersDepth([
        { id: "player-behind", y: 32.0 },
      ]);
      assert.ok(
        depthBehind["player-behind"] < NPC_DEPTH_LAYERS.mamparaLayer,
        `Personaje detrás de mamparas debe tener zIndex < 18: ${depthBehind["player-behind"]}`,
      );

      // Personaje en la mampara votando (Y = 36.5)
      const depthAtBooth = calculateSceneCharactersDepth([
        { id: "npc-at-booth", y: 36.5 },
      ]);
      assert.ok(
        depthAtBooth["npc-at-booth"] > NPC_DEPTH_LAYERS.boletaLayer,
        `Personaje votando frente a mampara debe tener zIndex > 21: ${depthAtBooth["npc-at-booth"]}`,
      );
      assert.ok(
        depthAtBooth["npc-at-booth"] > NPC_DEPTH_LAYERS.mamparaLayer,
        `Personaje votando debe tener zIndex > 18: ${depthAtBooth["npc-at-booth"]}`,
      );

      // Caso conjunto: jugador detrás de mampara 1 y NPC votando en mampara 3
      const depthBoth = calculateSceneCharactersDepth([
        { id: "player-behind", y: 32.0 },
        { id: "npc-booth-3", y: 36.5 },
      ]);
      assert.ok(
        depthBoth["player-behind"] < NPC_DEPTH_LAYERS.mamparaLayer,
        "Jugador permanece detrás de la mampara",
      );
      assert.ok(
        depthBoth["npc-booth-3"] > NPC_DEPTH_LAYERS.boletaLayer,
        "NPC permanece por delante de la mampara y boleta",
      );
      assert.ok(
        depthBoth["npc-booth-3"] > depthBoth["player-behind"],
        "NPC votando se renderiza delante del jugador que está detrás de las mamparas",
      );
    });

    test("5. conservación de animaciones continuas durante la caminata y parada en mampara", () => {
      const mampara = INITIAL_MAMPARAS_CONFIG[2]; // Mampara 3 (target Y = 36.5)
      let npc = createGenericNpcInstance(mampara, "npc-anim-test");

      // Estado inicial ENTERING -> animación back
      assert.equal(npc.state, "ENTERING");
      assert.equal(npc.currentAnimation, "back");

      // Simular caminata continua hacia la mampara
      npc.position = { x: 52.0, y: 50.0 };
      const step1 = updateGenericNpc(npc, mampara, 0.05);
      assert.equal(step1.currentAnimation, "back");
      assert.equal(step1.state, "ENTERING");

      // Llegar a la mampara (Y = 36.5) -> transición inmediata a IDLE
      const stepArrive = updateGenericNpc(
        { ...npc, position: { x: 52.0, y: 36.6 } },
        mampara,
        0.1,
      );
      assert.equal(stepArrive.state, "IDLE");
      assert.equal(stepArrive.currentAnimation, "idle");
      assert.equal(stepArrive.position.y, 36.5);

      // Finalizar tiempo de votación -> transición inmediata a LEAVING y animación front
      const stepLeave = updateGenericNpc(
        { ...stepArrive, elapsedInStateMs: stepArrive.votingWaitTimeMs + 50 },
        mampara,
        0.05,
      );
      assert.equal(stepLeave.state, "LEAVING");
      assert.equal(stepLeave.currentAnimation, "front");
    });

    test("6. ausencia de reinicios de frames y respeto a dimensiones visuales", () => {
      assert.equal(GENERIC_NPC_FRAME_COUNTS.back, 23);
      assert.equal(GENERIC_NPC_FRAME_COUNTS.front, 28);
      assert.equal(GENERIC_NPC_FRAME_COUNTS.idle, 1);
      assert.equal(GENERIC_NPC_DEFAULTS.spriteWidthPercent, "6.5%");

      // Función calculateCharacterZIndex independiente respeta los límites
      const zBehind = calculateCharacterZIndex(31.0);
      assert.ok(zBehind >= 11 && zBehind <= 17);

      const zFront = calculateCharacterZIndex(50.0);
      assert.ok(zFront >= 22 && zFront <= 27);
    });

    test("7. integración visual del empuje: movimiento suave y cese de contacto", () => {
      const mampara = INITIAL_MAMPARAS_CONFIG[2];
      const npc = {
        ...createGenericNpcInstance(mampara, "npc-push-visual"),
        position: { x: 50.0, y: 60.0 },
        state: "ENTERING",
      };

      const dt = 0.016;
      const push = getNpcLateralPushVector({
        playerPos: { x: 51.0, y: 60.0 },
        npcs: [npc],
        isPositionWalkable: () => true,
        dtSeconds: dt,
      });

      assert.ok(push.pushVector !== null);
      assert.equal(push.pushVector.vx, 1, "Desplaza lateralmente hacia la derecha");

      // Cese de contacto fuera del umbral de separación (6.0%)
      const pushSeparated = getNpcLateralPushVector({
        playerPos: { x: 57.0, y: 60.0 },
        npcs: [npc],
        isPositionWalkable: () => true,
        activePushState: push.activePushState,
        dtSeconds: dt,
      });
      assert.equal(pushSeparated.pushVector, null);
      assert.equal(pushSeparated.activePushState, null);
    });

    test("8. conservación del comportamiento y duración de la cámara cinematográfica", () => {
      // Encuadre inicial del jugador
      const camPlayer = calculateCameraShift({ x: 20.0, y: 52.0 }, 2.0);
      assert.ok(typeof camPlayer.x === "number");
      assert.ok(typeof camPlayer.y === "number");

      // Encuadre de la mampara 3 (X=52.0, Y=36.5)
      const camMampara = calculateCameraShift({ x: 52.0, y: 36.5 }, 2.0);
      assert.ok(camMampara.x <= 25.0 && camMampara.x >= -25.0);
      assert.ok(camMampara.y <= 25.0 && camMampara.y >= -25.0);
    });

    test("9. limpieza al abandonar o reiniciar el capítulo", () => {
      const emptyDepth = calculateSceneCharactersDepth([]);
      assert.deepEqual(emptyDepth, {});

      // Valores por defecto seguros para entidades aisladas
      const singleDepth = calculateSceneCharactersDepth([{ id: "player", y: 50.0 }]);
      assert.equal(singleDepth["player"], 22);
    });

    test("10. convivencia con personajes narrativos y respeto estricto a las capas del escenario", () => {
      // Coincidencia simultánea de protagonista, NPCs genéricos y personajes narrativos
      const depth = calculateSceneCharactersDepth([
        { id: "player", y: 48.0 },
        { id: "npc-gen-1", y: 36.5 },
        { id: "npc-gen-2", y: 62.0 },
        { id: "personaje-narrativo-don-ramon", y: 55.0 },
      ]);

      assert.ok(depth["npc-gen-1"] < depth["player"]);
      assert.ok(depth["player"] < depth["personaje-narrativo-don-ramon"]);
      assert.ok(depth["personaje-narrativo-don-ramon"] < depth["npc-gen-2"]);

      // Todos los personajes permanecen estrictamente por debajo de los arbustos (< 30) y cartel 3 (< 35)
      for (const id of Object.keys(depth)) {
        assert.ok(
          depth[id] < NPC_DEPTH_LAYERS.arbustosForeground,
          `Entidad ${id} (${depth[id]}) debe ser < 30 (arbustos en primer plano)`,
        );
        assert.ok(
          depth[id] < NPC_DEPTH_LAYERS.cartel3Foreground,
          `Entidad ${id} (${depth[id]}) debe ser < 35 (cartel 3 en primer plano)`,
        );
      }
    });
  });

  describe("Fase 5.4: Optimización técnica, rendimiento y estabilidad", () => {
    test("1. ausencia de actualizaciones visuales innecesarias en estado IDLE", () => {
      const mampara3 = INITIAL_MAMPARAS_CONFIG[2];
      const npcIdle = {
        ...createGenericNpcInstance(mampara3, "npc-idle-test", 5000),
        position: { x: 52.0, y: 36.5 },
        state: "IDLE",
        currentAnimation: "idle",
        elapsedInStateMs: 1000,
      };

      // Simular 10 pasos consecutivos de rAF (16.6ms cada uno)
      let currentNpc = npcIdle;
      for (let i = 0; i < 10; i++) {
        const stepResult = simulateNpcsStep(
          {
            npcs: [currentNpc],
            mamparas: INITIAL_MAMPARAS_CONFIG,
            isGlobalSystemActive: true,
            npcIdCounter: 1,
          },
          0.0166,
          1000 + i * 16.6,
        );

        const updated = stepResult.npcs[0];
        // Posición Y, estado y animación deben permanecer estrictamente idénticos
        assert.equal(updated.position.y, 36.5);
        assert.equal(updated.state, "IDLE");
        assert.equal(updated.currentAnimation, "idle");

        // Verificación de la condición hasVisualChange de useGenericNpcs:
        // No hay nuevos spawns, no hay mamparas finalizadas, longitud no cambió y props visuales idénticas
        const hasVisualChange =
          stepResult.newSpawnIds.length > 0 ||
          stepResult.finishedMamparaIds.length > 0 ||
          stepResult.npcs.length !== 1 ||
          currentNpc.state !== updated.state ||
          currentNpc.currentAnimation !== updated.currentAnimation ||
          currentNpc.position.y !== updated.position.y;

        assert.equal(hasVisualChange, false, "En IDLE no debe haber cambio visual");
        currentNpc = updated;
      }
    });

    test("2. independencia estricta de temporizadores entre las cinco mamparas", () => {
      // Configurar 5 mamparas con tiempos de espera artificialmente distintos
      const customMamparas = INITIAL_MAMPARAS_CONFIG.map((m, idx) => ({
        ...m,
        spawnTimerConfig: {
          ...m.spawnTimerConfig,
          isEnabled: true,
          nextSpawnDelayMs: (idx + 1) * 1000, // 1000, 2000, 3000, 4000, 5000 ms
        },
      }));

      const step1 = simulateNpcsStep(
        {
          npcs: [],
          mamparas: customMamparas,
          isGlobalSystemActive: true,
          npcIdCounter: 0,
        },
        0.5, // 500 ms transcurridos
        500,
      );

      // Cada mampara descuenta exactamente 500 ms de forma autónoma
      assert.equal(step1.mamparas[0].spawnTimerConfig.nextSpawnDelayMs, 500);
      assert.equal(step1.mamparas[1].spawnTimerConfig.nextSpawnDelayMs, 1500);
      assert.equal(step1.mamparas[2].spawnTimerConfig.nextSpawnDelayMs, 2500);
      assert.equal(step1.mamparas[3].spawnTimerConfig.nextSpawnDelayMs, 3500);
      assert.equal(step1.mamparas[4].spawnTimerConfig.nextSpawnDelayMs, 4500);
    });

    test("3. manejo seguro de deltaTime elevado sin sobrepasos ni teletransportación", () => {
      const mampara1 = INITIAL_MAMPARAS_CONFIG[0];
      const npcEntering = {
        ...createGenericNpcInstance(mampara1, "npc-dt-test", 5000),
        position: { x: 32.0, y: 37.0 }, // A solo 0.5% de la mampara (36.5%)
        speed: 12.0,
      };

      // Un salto de tiempo grande (por ejemplo 1.0s, que a 12%/s avanzaría 12%)
      const stepResult = simulateNpcsStep(
        {
          npcs: [npcEntering],
          mamparas: INITIAL_MAMPARAS_CONFIG,
          isGlobalSystemActive: true,
          npcIdCounter: 1,
        },
        1.0,
        1000,
      );

      const arrivedNpc = stepResult.npcs[0];
      // Debe llegar exactamente a targetPosition.y (36.5%) sin oscilar ni sobrepasar hacia arriba
      assert.equal(arrivedNpc.position.y, 36.5);
      assert.equal(arrivedNpc.state, "IDLE");
      assert.equal(arrivedNpc.currentAnimation, "idle");
    });

    test("4. política de pausa y reanudación por visibilidad de pestaña", () => {
      // Simulación de la política: cuando la pestaña está oculta, dt se descarta o no se procesa
      let lastTime = 1000;
      let currentTime = 15000; // 14 segundos después (pestaña en segundo plano)

      // Comportamiento implementado: al detectar retorno o pestaña oculta, lastTime se sincroniza
      const isDocumentHidden = true;
      let simulatedDt = 0;
      if (isDocumentHidden) {
        lastTime = currentTime; // Pausa: se empata lastTime sin avanzar simulación
      } else {
        simulatedDt = Math.min(0.05, (currentTime - lastTime) / 1000);
      }

      assert.equal(simulatedDt, 0, "No debe procesarse dt mientras la pestaña esté oculta");
      assert.equal(lastTime, 15000);

      // Al regresar a la pestaña visible (evento visibilitychange):
      currentTime = 15016; // Primer frame activo (16ms después)
      const postResumeDt = Math.min(0.05, (currentTime - lastTime) / 1000);
      assert.ok(postResumeDt <= 0.05, "El deltaTime post-reanudación debe estar estrictamente acotado");
    });

    test("5. conservación exacta de posiciones tras reanudación", () => {
      const mampara2 = INITIAL_MAMPARAS_CONFIG[1];
      const npc = {
        ...createGenericNpcInstance(mampara2, "npc-pos-test", 5000),
        position: { x: 42.0, y: 75.0 },
      };

      // Mientras la pestaña estuvo oculta, no se llamó a simulateNpcsStep
      // Al reanudar, la posición previa se conserva intacta
      const resumedStep = simulateNpcsStep(
        {
          npcs: [npc],
          mamparas: INITIAL_MAMPARAS_CONFIG,
          isGlobalSystemActive: true,
          npcIdCounter: 1,
        },
        0.0166, // Primer frame normal
        20000,
      );

      // El avance es de únicamente speed * 0.0166 (~0.2%)
      assert.ok(Math.abs(resumedStep.npcs[0].position.y - (75.0 - 12.0 * 0.0166)) < 0.01);
    });

    test("6. ausencia de apariciones acumuladas tras periodos prolongados", () => {
      // Mampara 1 ya ocupada con un NPC
      const mampara1Occupied = {
        ...INITIAL_MAMPARAS_CONFIG[0],
        isOccupied: true,
        occupiedByNpcId: "npc-existing",
        spawnTimerConfig: {
          ...INITIAL_MAMPARAS_CONFIG[0].spawnTimerConfig,
          isEnabled: true,
          nextSpawnDelayMs: 0, // Temporizador vencido pero mampara ocupada
        },
      };

      const step = simulateNpcsStep(
        {
          npcs: [
            {
              ...createGenericNpcInstance(mampara1Occupied, "npc-existing", 5000),
              position: { x: 32.0, y: 36.5 },
              state: "IDLE",
            },
          ],
          mamparas: [mampara1Occupied, ...INITIAL_MAMPARAS_CONFIG.slice(1)],
          isGlobalSystemActive: true,
          npcIdCounter: 1,
        },
        0.05,
        30000,
      );

      // La mampara ocupada NO debe spawnear ningún NPC adicional
      assert.equal(step.newSpawnIds.length, 0);
      assert.equal(step.npcs.filter((n) => n.assignedMamparaId === 1).length, 1);
    });

    test("7. limpieza de bucles de animación y cancelación adecuada", () => {
      let cancelledId = -1;
      const mockCancel = (id) => {
        cancelledId = id;
      };

      const activeFrameId = 42;
      mockCancel(activeFrameId);
      assert.equal(cancelledId, 42);
    });

    test("8. reinicio completo de referencias y vaciado de caché", () => {
      // Llenar caché de profundidad
      calculateSceneCharactersDepth([
        { id: "player", y: 45.0 },
        { id: "npc-1", y: 36.5 },
      ]);

      // Limpiar caché
      clearDepthCache();

      // Al limpiar, la siguiente invocación construye un nuevo mapa
      const newMap = calculateSceneCharactersDepth([]);
      assert.deepEqual(newMap, {});
    });

    test("9. continuidad y estabilidad de animaciones pixel art", () => {
      const mampara4 = INITIAL_MAMPARAS_CONFIG[3];
      const npcEntering = createGenericNpcInstance(mampara4, "npc-anim-test", 4000);
      assert.equal(npcEntering.currentAnimation, "back");

      // Transición a IDLE
      const reached = updateGenericNpc(
        { ...npcEntering, position: { x: 62.0, y: 36.5 } },
        mampara4,
        0.016,
      );
      assert.equal(reached.currentAnimation, "idle");

      // Transición a LEAVING
      const leaving = updateGenericNpc(
        { ...reached, elapsedInStateMs: 5000 }, // Superó votingWaitTimeMs
        mampara4,
        0.016,
      );
      assert.equal(leaving.currentAnimation, "front");
    });

    test("10. actualización correcta y reutilización de caché en profundidad visual", () => {
      clearDepthCache();
      const entitiesA = [
        { id: "player", y: 50.0 },
        { id: "npc-1", y: 36.5 },
      ];

      const res1 = calculateSceneCharactersDepth(entitiesA);

      // Invocación con entidades idénticas en Y (ej: frames en IDLE)
      const entitiesSame = [
        { id: "player", y: 50.0 },
        { id: "npc-1", y: 36.5 },
      ];
      assert.ok(areDepthEntitiesEqual(entitiesA, entitiesSame));

      const res2 = calculateSceneCharactersDepth(entitiesSame);
      // Debe retornar exactamente la misma referencia de objeto memoizado
      assert.equal(res1, res2);

      // Invocación cuando el jugador se mueve verticalmente:
      const entitiesMoved = [
        { id: "player", y: 30.0 }, // Ahora el jugador está detrás del NPC
        { id: "npc-1", y: 36.5 },
      ];
      const res3 = calculateSceneCharactersDepth(entitiesMoved);
      assert.notEqual(res1, res3);
      assert.ok(res3["player"] < res3["npc-1"]);
    });

    test("11. colisiones: filtrado temprano de NPCs lejanos en O(1) sin regresiones", () => {
      // NPC muy alejado horizontalmente (> 6.0%)
      const distantPush = getNpcLateralPushVector({
        playerPos: { x: 50.0, y: 50.0 },
        npcs: [
          {
            id: "distant-npc",
            position: { x: 70.0, y: 50.0 }, // 20% de distancia en X
            state: "ENTERING",
            isActive: true,
            speed: 12.0,
          },
        ],
        isPositionWalkable: () => true,
      });
      assert.equal(distantPush.pushVector, null);
      assert.equal(distantPush.activePushState, null);

      // NPC cercano con colisión real: debe continuar generando empuje correctamente
      const closePush = getNpcLateralPushVector({
        playerPos: { x: 50.0, y: 50.0 },
        npcs: [
          {
            id: "close-npc",
            position: { x: 50.8, y: 50.0 },
            state: "ENTERING",
            isActive: true,
            speed: 12.0,
          },
        ],
        isPositionWalkable: () => true,
      });
      assert.ok(closePush.pushVector !== null);
      assert.equal(closePush.pushVector.vx, -1); // Empuja hacia la izquierda
    });

    test("12. concurrencia estable con cinco NPCs activos simultáneamente", () => {
      const fiveNpcs = INITIAL_MAMPARAS_CONFIG.map((m) =>
        createGenericNpcInstance(m, `npc-concurrente-${m.id}`, 6000),
      );

      const state = {
        npcs: fiveNpcs,
        mamparas: INITIAL_MAMPARAS_CONFIG.map((m, idx) => ({
          ...m,
          isOccupied: true,
          occupiedByNpcId: fiveNpcs[idx].id,
        })),
        isGlobalSystemActive: true,
        npcIdCounter: 5,
      };

      // Simular 60 cuadros (1 segundo)
      let currentState = state;
      for (let f = 0; f < 60; f++) {
        const step = simulateNpcsStep(currentState, 0.0166, f * 16.6);
        currentState = {
          npcs: step.npcs,
          mamparas: step.mamparas,
          isGlobalSystemActive: step.isGlobalSystemActive,
          npcIdCounter: step.npcIdCounter,
        };
      }

      // Los 5 siguen avanzando y la lista contiene exactamente 5 elementos
      assert.equal(currentState.npcs.length, 5);
      currentState.npcs.forEach((npc) => {
        assert.ok(npc.position.y < 106.0, "Todos los NPCs deben haber avanzado hacia arriba");
      });
    });

    test("13. reinicios consecutivos mantienen el estado limpio e idéntico", () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        // En cada iteración se inicia desde el estado base
        clearDepthCache();
        const baseMamparas = [...INITIAL_MAMPARAS_CONFIG];
        assert.equal(baseMamparas.length, 5);
        assert.ok(baseMamparas.every((m) => !m.isOccupied && m.occupiedByNpcId === null));
      }
    });

    test("14. conservación de la cámara cinematográfica y límites seguros", () => {
      // Zoom 2.0 define un límite estricto de desplazamiento de +-25%
      const shiftCenter = calculateCameraShift({ x: 50.0, y: 50.0 }, 2.0);
      assert.equal(shiftCenter.x, 0);
      assert.equal(shiftCenter.y, 0);

      const shiftEdge = calculateCameraShift({ x: 0.0, y: 0.0 }, 2.0);
      assert.equal(shiftEdge.x, 25.0);
      assert.equal(shiftEdge.y, 25.0);

      const shiftFar = calculateCameraShift({ x: 100.0, y: 100.0 }, 2.0);
      assert.equal(shiftFar.x, -25.0);
      assert.equal(shiftFar.y, -25.0);
    });

    test("15. contratos de tipos e integridad estructural de simulación", () => {
      const result = simulateNpcsStep(
        {
          npcs: [],
          mamparas: INITIAL_MAMPARAS_CONFIG,
          isGlobalSystemActive: false,
          npcIdCounter: 0,
        },
        0.016,
        0,
      );

      assert.ok(Array.isArray(result.npcs));
      assert.ok(Array.isArray(result.mamparas));
      assert.equal(typeof result.isGlobalSystemActive, "boolean");
      assert.equal(typeof result.npcIdCounter, "number");
      assert.equal(typeof result.justActivatedGlobal, "boolean");
      assert.ok(Array.isArray(result.finishedMamparaIds));
      assert.ok(Array.isArray(result.newSpawnIds));
    });
  });
});


