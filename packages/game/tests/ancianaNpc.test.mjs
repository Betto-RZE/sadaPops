import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  ANCIANA_FRAME_COUNTS,
  getAncianaFrameSrc,
  ANCIANA_DEFAULTS,
  stepAncianaMovement,
  updateAncianaSpawnDelay,
  ANCIANA_ARRIVAL_MESSAGES_ES,
  ANCIANA_ARRIVAL_MESSAGES_NAH,
  MESA_INTERACTION_LEFT_POS,
  MESA_INTERACTION_DISTANCE_THRESHOLD,
  calculatePlayerAlignedPositionWithNpc,
  ABUELA_CONVERSATION_MESSAGES_ES,
  ABUELA_CONVERSATION_MESSAGES_NAH,
} from "../src/features/mitos/ancianaConfig.ts";

import {
  calculateCharacterZIndex,
  calculateSceneCharactersDepth,
} from "../src/features/npcs/genericNpcDepth.ts";

import {
  resolvePlayerVoluntaryMovementVsNpcs,
  getNpcLateralPushVector,
  isPositionBlockedByNpc,
  checkCharactersOverlap,
  NPC_COLLISION_DEFAULTS,
} from "../src/features/npcs/genericNpcCollisions.ts";

describe("Personaje Narrativo: La Anciana (Abuela) - Capítulo 2", () => {
  describe("1. Recursos y animaciones", () => {
    test("posee los conteos exactos de cuadros para side, front y back", () => {
      assert.equal(ANCIANA_FRAME_COUNTS.side, 36);
      assert.equal(ANCIANA_FRAME_COUNTS.front, 29);
      assert.equal(ANCIANA_FRAME_COUNTS.back, 28);
    });

    test("getAncianaFrameSrc resuelve rutas exactas con padding de dos dígitos", () => {
      assert.equal(
        getAncianaFrameSrc("side", 0),
        "/assets/juego/personajes/anciana/side/anciana-side00086400.png",
      );
      assert.equal(
        getAncianaFrameSrc("side", 35),
        "/assets/juego/personajes/anciana/side/anciana-side00086435.png",
      );
      assert.equal(
        getAncianaFrameSrc("front", 0),
        "/assets/juego/personajes/anciana/front/anciana-front00086400.png",
      );
      assert.equal(
        getAncianaFrameSrc("back", 0),
        "/assets/juego/personajes/anciana/back/anciana-back00086400.png",
      );
    });
  });

  describe("2. Calibración espacial y límites del escenario", () => {
    test("inicia en el camino derecho y termina frente a la mesa directiva (centrada y pegada a la mesa)", () => {
      assert.equal(ANCIANA_DEFAULTS.startPosition.x, 102.0);
      assert.equal(ANCIANA_DEFAULTS.startPosition.y, 66.0);
      assert.equal(ANCIANA_DEFAULTS.targetPosition.x, 26.0);
      assert.equal(ANCIANA_DEFAULTS.targetPosition.y, 66.0);
    });

    test("la trayectoria es una línea recta horizontal pura (coordenada Y idéntica)", () => {
      assert.equal(
        ANCIANA_DEFAULTS.startPosition.y,
        ANCIANA_DEFAULTS.targetPosition.y,
        "La coordenada Y debe ser exactamente la misma durante todo el trayecto",
      );
    });

    test("la posición final se ubica a la derecha de la mesa de votación pegada sin solaparla", () => {
      // El borde derecho de colisión de la mesa a Y = 66.0% es X ≈ 23.75%
      assert.ok(
        ANCIANA_DEFAULTS.targetPosition.x > 23.75,
        "Debe quedar al lado derecho de la mesa",
      );
      assert.ok(
        ANCIANA_DEFAULTS.targetPosition.x < 30.0,
        "Debe quedar pegada y próxima a la mesa para interactuar con los funcionarios",
      );
    });
  });

  describe("3. Movimiento y simulación paso a paso (stepAncianaMovement)", () => {
    test("avanza de forma continua hacia la izquierda respetando velocidad y dt", () => {
      const start = { x: 102.0, y: 66.0 };
      const dt = 0.5; // medio segundo
      const speed = 9.0;

      const result = stepAncianaMovement({
        currentPos: start,
        speed,
        dt,
      });

      // 102.0 - (9.0 * 0.5) = 97.5
      assert.equal(result.nextPos.x, 97.5);
      assert.equal(result.nextPos.y, 66.0);
      assert.equal(result.isArrived, false);
    });

    test("al alcanzar la posición objetivo se detiene exactamente en targetPosition", () => {
      const nearTarget = { x: 28.0, y: 66.0 };
      const dt = 0.5;
      const speed = 9.0;

      const result = stepAncianaMovement({
        currentPos: nearTarget,
        speed,
        dt,
      });

      assert.equal(result.nextPos.x, ANCIANA_DEFAULTS.targetPosition.x);
      assert.equal(result.nextPos.y, ANCIANA_DEFAULTS.targetPosition.y);
      assert.equal(result.isArrived, true);
    });

    test("no sobrepasa el objetivo ante picos elevados de deltaTime (evita teletransportación)", () => {
      const farStart = { x: 102.0, y: 66.0 };
      const extremeDt = 100.0; // simulación de salto extremo

      const result = stepAncianaMovement({
        currentPos: farStart,
        dt: extremeDt,
      });

      assert.equal(result.nextPos.x, ANCIANA_DEFAULTS.targetPosition.x);
      assert.equal(result.isArrived, true);
    });
  });

  describe("4. Integración en el sistema de profundidad visual (Z-Index)", () => {
    test("la anciana a Y = 66.0% se renderiza en la capa frontal adecuada", () => {
      const zIndex = calculateCharacterZIndex(
        ANCIANA_DEFAULTS.targetPosition.y,
        "anciana",
      );
      // Frente a las mamparas (Y=36.0, z=18) y detrás de arbustos delanteros (z=30)
      assert.ok(zIndex > 21 && zIndex < 28);
    });

    test("se ordena coherentemente junto al protagonista y NPCs en depthMap", () => {
      const depth = calculateSceneCharactersDepth([
        { id: "player", y: 52.0 }, // Inecito detrás de la mesa
        { id: "anciana", y: 66.0 }, // Anciana frente a la mesa
        { id: "npc-gen-mampara-1", y: 36.5 },
      ]);

      // player (52.0) debe tener menor zIndex que anciana (66.0)
      assert.ok(depth["anciana"] >= depth["player"]);
      // anciana debe estar por delante de quien vota en mamparas (36.5)
      assert.ok(depth["anciana"] > depth["npc-gen-mampara-1"]);
    });
  });

  describe("5. Temporizador de aparición (4 segundos tras IDLE del primer NPC)", () => {
    test("el tiempo de espera configurado por defecto es de exactamente 4000 ms", () => {
      assert.equal(ANCIANA_DEFAULTS.spawnDelayMs, 4000);
    });

    test("mientras no se dispare la condición (isTriggered = false), no acumula tiempo ni aparece", () => {
      const progress = updateAncianaSpawnDelay({
        isTriggered: false,
        elapsedMs: 0,
        dtSeconds: 2.0,
      });

      assert.equal(progress.newElapsedMs, 0);
      assert.equal(progress.shouldSpawn, false);
    });

    test("al activarse el disparo tras concluir IDLE, acumula tiempo progresivamente", () => {
      // Pasan 2.5 segundos (2500 ms)
      const step1 = updateAncianaSpawnDelay({
        isTriggered: true,
        elapsedMs: 0,
        dtSeconds: 2.5,
      });

      assert.equal(step1.newElapsedMs, 2500);
      assert.equal(step1.shouldSpawn, false);

      // Pasa 1 segundo adicional (total 3500 ms < 4000 ms)
      const step2 = updateAncianaSpawnDelay({
        isTriggered: true,
        elapsedMs: step1.newElapsedMs,
        dtSeconds: 1.0,
      });

      assert.equal(step2.newElapsedMs, 3500);
      assert.equal(step2.shouldSpawn, false);

      // Pasa otro medio segundo (total 4000 ms = condición cumplida)
      const step3 = updateAncianaSpawnDelay({
        isTriggered: true,
        elapsedMs: step2.newElapsedMs,
        dtSeconds: 0.5,
      });

      assert.equal(step3.newElapsedMs, 4000);
      assert.equal(step3.shouldSpawn, true);
    });
  });

  describe("6. Sistema de colisión física (idéntico a NPCs genéricos)", () => {
    const isAlwaysWalkable = () => true;

    test("dimensiones de colisión de los pies son idénticas a los NPCs genéricos", () => {
      assert.equal(
        ANCIANA_DEFAULTS.halfWidth,
        NPC_COLLISION_DEFAULTS.npcHalfWidth,
      );
      assert.equal(
        ANCIANA_DEFAULTS.halfHeight,
        NPC_COLLISION_DEFAULTS.npcHalfHeight,
      );
    });

    test("anciana en movimiento horizontal (side / ENTERING) empuja al protagonista hacia arriba o hacia abajo", () => {
      const ancianaAsNpc = {
        id: "anciana",
        position: { x: 50.0, y: 66.0 },
        assignedMamparaId: 1,
        currentAnimation: "side",
        state: "ENTERING",
        speed: ANCIANA_DEFAULTS.speed,
        votingWaitTimeMs: 0,
        elapsedInStateMs: 0,
        isActive: true,
        movementAxis: "horizontal",
      };

      // Caso 1: Jugador centrado en Y (y = 66.0) frente a la anciana -> empuje vertical hacia abajo (+1)
      const playerPosDown = { x: 48.0, y: 66.0 };
      const pushDown = getNpcLateralPushVector({
        playerPos: playerPosDown,
        npcs: [ancianaAsNpc],
        isPositionWalkable: isAlwaysWalkable,
        dtSeconds: 0.016,
      });

      assert.ok(pushDown.pushVector !== null, "Debe generar un vector de empuje");
      assert.equal(pushDown.pushingNpc?.id, "anciana");
      assert.equal(pushDown.pushVector.vx, 0, "No debe empujar horizontalmente");
      assert.equal(pushDown.pushVector.vy, 1, "Debe empujar verticalmente hacia abajo (+1)");

      // Caso 2: Jugador por encima en Y (y = 65.0) -> empuje vertical hacia arriba (-1)
      const playerPosUp = { x: 48.0, y: 65.0 };
      const pushUp = getNpcLateralPushVector({
        playerPos: playerPosUp,
        npcs: [ancianaAsNpc],
        isPositionWalkable: isAlwaysWalkable,
        dtSeconds: 0.016,
      });

      assert.ok(pushUp.pushVector !== null, "Debe generar un vector de empuje");
      assert.equal(pushUp.pushVector.vx, 0, "No debe empujar horizontalmente");
      assert.equal(pushUp.pushVector.vy, -1, "Debe empujar verticalmente hacia arriba (-1)");
    });

    test("si el lado preferente vertical está bloqueado, empuja automáticamente hacia el lado contrario", () => {
      const ancianaAsNpc = {
        id: "anciana",
        position: { x: 50.0, y: 66.0 },
        assignedMamparaId: 1,
        currentAnimation: "side",
        state: "ENTERING",
        speed: ANCIANA_DEFAULTS.speed,
        votingWaitTimeMs: 0,
        elapsedInStateMs: 0,
        isActive: true,
        movementAxis: "horizontal",
      };

      // Jugador centrado en Y (preferiría abajo), pero abajo está bloqueado por un obstáculo
      const isBlockedBelow = (_x, y) => y <= 66.0;

      const push = getNpcLateralPushVector({
        playerPos: { x: 50.0, y: 66.0 },
        npcs: [ancianaAsNpc],
        isPositionWalkable: isBlockedBelow,
        dtSeconds: 0.016,
      });

      assert.ok(push.pushVector !== null);
      assert.equal(push.pushVector.vy, -1, "Debe alternar hacia arriba (-1) al estar bloqueado abajo");
    });

    test("anciana frente a la mesa (arrived -> IDLE) actúa como obstáculo sólido con deslizamiento de pared", () => {
      const ancianaAsNpc = {
        id: "anciana",
        position: ANCIANA_DEFAULTS.targetPosition, // { x: 26.0, y: 66.0 }
        assignedMamparaId: 1,
        currentAnimation: "idle",
        state: "IDLE",
        speed: 0,
        votingWaitTimeMs: 0,
        elapsedInStateMs: 0,
        isActive: true,
      };

      // Jugador a la derecha de la anciana intentando caminar hacia la izquierda (atravesarla)
      const playerPos = { x: 30.0, y: 66.0 };
      const desiredDx = -2.0;
      const desiredDy = 0.0;

      const movementResult = resolvePlayerVoluntaryMovementVsNpcs({
        currentPos: playerPos,
        desiredDx,
        desiredDy,
        npcs: [ancianaAsNpc],
        isPositionWalkable: isAlwaysWalkable,
      });

      assert.equal(
        movementResult.isBlockedByNpc,
        true,
        "La anciana en IDLE debe bloquear el avance directo",
      );
      assert.ok(
        movementResult.effectiveDx > desiredDx,
        "El avance en X debe ser frenado/restringido",
      );
    });

    test("permite deslizamiento tangencial (diagonal) si el jugador camina diagonalmente contra la anciana", () => {
      const ancianaAsNpc = {
        id: "anciana",
        position: { x: 26.0, y: 66.0 },
        assignedMamparaId: 1,
        currentAnimation: "idle",
        state: "IDLE",
        speed: 0,
        votingWaitTimeMs: 0,
        elapsedInStateMs: 0,
        isActive: true,
      };

      // Jugador intentando caminar en diagonal (hacia arriba e izquierda)
      const playerPos = { x: 30.5, y: 66.0 };
      const desiredDx = -2.0;
      const desiredDy = -2.0;

      const movementResult = resolvePlayerVoluntaryMovementVsNpcs({
        currentPos: playerPos,
        desiredDx,
        desiredDy,
        npcs: [ancianaAsNpc],
        isPositionWalkable: isAlwaysWalkable,
      });

      // El eje X choca contra la anciana pero el eje Y se desliza libremente
      assert.ok(movementResult.effectiveDy < 0, "Debe conservar el deslizamiento en Y");
    });
  });

  describe("7. Diálogo de llegada frente a la mesa directiva", () => {
    test("contiene exactamente los 2 mensajes solicitados en Español", () => {
      assert.equal(ANCIANA_ARRIVAL_MESSAGES_ES.length, 2);
      assert.equal(
        ANCIANA_ARRIVAL_MESSAGES_ES[0],
        "¡Oh! Parece que una señora se acercó a nuestra mesa.",
      );
      assert.equal(
        ANCIANA_ARRIVAL_MESSAGES_ES[1],
        "¡Vamos a ver en qué podemos ayudarla!",
      );
    });

    test("posee la traducción correspondiente en Náhuatl para soporte bilingüe", () => {
      assert.equal(ANCIANA_ARRIVAL_MESSAGES_NAH.length, 2);
      assert.ok(ANCIANA_ARRIVAL_MESSAGES_NAH[0].length > 0);
      assert.ok(ANCIANA_ARRIVAL_MESSAGES_NAH[1].length > 0);
    });
  });

  describe("8. Interacción en el lado izquierdo de la mesa y conversación con la abuela", () => {
    test("define coordenadas precisas en el lado izquierdo de la mesa directiva", () => {
      assert.equal(MESA_INTERACTION_LEFT_POS.x, 14.0);
      assert.equal(MESA_INTERACTION_LEFT_POS.y, 60.0);
      assert.equal(MESA_INTERACTION_DISTANCE_THRESHOLD, 14.0);

      // La mesa está en X=19.0; la anciana en X=26.0 (derecha); la interacción en X=14.0 (izquierda)
      assert.ok(
        MESA_INTERACTION_LEFT_POS.x < 19.0,
        "El icono debe situarse a la izquierda del centro de la mesa",
      );
      assert.ok(
        MESA_INTERACTION_LEFT_POS.x < ANCIANA_DEFAULTS.targetPosition.x,
        "El jugador debe interactuar desde el lado opuesto a la anciana",
      );
    });

    test("la visibilidad del icono (!) solo se activa cuando ancianaDialogueState === 'dismissed'", () => {
      const computeShowExclamation = (ancianaDialogueState, abuelaConversationState) =>
        ancianaDialogueState === "dismissed" && abuelaConversationState === "idle";

      // Durante la llegada o diálogo de anuncio activo: falso
      assert.equal(computeShowExclamation("idle", "idle"), false);
      assert.equal(computeShowExclamation("entering", "idle"), false);
      assert.equal(computeShowExclamation("visible", "idle"), false);
      assert.equal(computeShowExclamation("exiting", "idle"), false);

      // Una vez terminado el globo de texto ("dismissed") y sin conversación previa: verdadero
      assert.equal(computeShowExclamation("dismissed", "idle"), true);

      // Al iniciar o mantener la conversación con la abuela: se oculta el icono
      assert.equal(computeShowExclamation("dismissed", "entering"), false);
      assert.equal(computeShowExclamation("dismissed", "visible"), false);
      assert.equal(computeShowExclamation("dismissed", "dismissed"), false);
    });

    test("la proximidad (isNearMesaLeft) detecta al jugador cerca del lado izquierdo de la mesa", () => {
      const checkNear = (playerPos) => {
        const d = Math.hypot(
          playerPos.x - MESA_INTERACTION_LEFT_POS.x,
          playerPos.y - MESA_INTERACTION_LEFT_POS.y,
        );
        return d <= MESA_INTERACTION_DISTANCE_THRESHOLD;
      };

      // Jugador junto al lado izquierdo de la mesa
      assert.equal(checkNear({ x: 14.0, y: 60.0 }), true);
      assert.equal(checkNear({ x: 12.0, y: 62.0 }), true);
      assert.equal(checkNear({ x: 18.0, y: 55.0 }), true);

      // Jugador lejos (ej. al otro lado del mapa o entrada derecha)
      assert.equal(checkNear({ x: 80.0, y: 60.0 }), false);
      assert.equal(checkNear({ x: 100.0, y: 66.0 }), false);
    });

    test("los mensajes de la conversación con Doña Carmen están configurados para español y náhuatl", () => {
      assert.equal(ABUELA_CONVERSATION_MESSAGES_ES.length, 16);
      assert.equal(ABUELA_CONVERSATION_MESSAGES_NAH.length, 16);

      // Verificación de primera y última línea en español
      assert.equal(ABUELA_CONVERSATION_MESSAGES_ES[0].speaker, "Doña Carmen");
      assert.equal(ABUELA_CONVERSATION_MESSAGES_ES[0].speakerColor, "#8d3800");
      assert.equal(
        ABUELA_CONVERSATION_MESSAGES_ES[0].text,
        "¡Muy buenos días, jovencito! Qué bonito les quedó todo por aquí. Se nota que trabajaron bastante.",
      );

      assert.equal(ABUELA_CONVERSATION_MESSAGES_ES[1].speaker, "Inecito");
      assert.equal(ABUELA_CONVERSATION_MESSAGES_ES[1].speakerColor, "#a81363");

      assert.equal(ABUELA_CONVERSATION_MESSAGES_ES[15].speaker, "Inecito");
      assert.equal(
        ABUELA_CONVERSATION_MESSAGES_ES[15].text,
        "¡Exactamente! Su voto es suyo y su decisión debe ser respetada.",
      );

      // Verificación de náhuatl
      assert.equal(ABUELA_CONVERSATION_MESSAGES_NAH[0].speaker, "Tenantzin Carmen");
      assert.equal(ABUELA_CONVERSATION_MESSAGES_NAH[1].speaker, "Inecito Cívica");
    });

    test("alinea al personaje principal en el eje Y respecto al interlocutor (calculatePlayerAlignedPositionWithNpc)", () => {
      // Caso 1: Jugador ubicado en { x: 13.0, y: 58.0 }, interlocutor a targetNpcY = 66.0%
      const aligned1 = calculatePlayerAlignedPositionWithNpc({
        currentPos: { x: 13.0, y: 58.0 },
        targetNpcY: 66.0,
      });
      assert.equal(aligned1.y, 66.0, "Debe alinearse exactamente en Y = 66.0%");
      assert.equal(aligned1.x, 13.0, "Conserva X segura (13.0 <= 13.5)");

      // Caso 2: Jugador ubicado en X > 13.5 (ej. x: 16.0, y: 54.0)
      const aligned2 = calculatePlayerAlignedPositionWithNpc({
        currentPos: { x: 16.0, y: 54.0 },
        targetNpcY: 66.0,
      });
      assert.equal(aligned2.y, 66.0);
      assert.equal(aligned2.x, 13.5, "Ajusta X a la zona segura máxima del lado izquierdo (13.5%)");
    });
  });
});



