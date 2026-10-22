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
  stepPlayerAlignmentWalk,
  PLAYER_ALIGNMENT_WALK_SPEED,
  ABUELA_CONVERSATION_MESSAGES_ES,
  ABUELA_CONVERSATION_MESSAGES_NAH,
  ABUELA_CONVERSATION_PORTRAITS,
  isPortraitActive,
  getPortraitStyle,
  getSpeakerNameAlignment,
  NARRATIVE_CHARACTERS_ORDER,
  NARRATIVE_CHARACTERS_CONFIG,
  BETWEEN_CHARACTERS_DELAY_MS,
  updateQueueTransitionDelay,
  getNarrativeCharacterPortraits,
  JOVEN_CONVERSATION_MESSAGES_ES,
  INDIGENA_CONVERSATION_MESSAGES_ES,
  TRANS_CONVERSATION_MESSAGES_ES,
  DISCAPACITADO_CONVERSATION_MESSAGES_ES,
  NARRATIVE_CHARACTERS_ANIMATION_CONFIG,
  getNarrativeCharacterSideFrameSrc,
  getNarrativeCharacterIdleSrc,
  stepNarrativeRetreatMovement,
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

    test("los mensajes de la conversación con Doña Carmen están configurados para español y náhuatl con estructura de 3 partes", () => {
      // 22 líneas en total: Parte 1 (16 líneas), Parte 2 (1 pregunta trivia), Parte 3 (5 líneas de despedida)
      assert.equal(ABUELA_CONVERSATION_MESSAGES_ES.length, 22);
      assert.equal(ABUELA_CONVERSATION_MESSAGES_NAH.length, 22);

      // Verificación de primera línea (Parte 1: Inicio de mito)
      assert.equal(ABUELA_CONVERSATION_MESSAGES_ES[0].speaker, "Doña Carmen");
      assert.equal(ABUELA_CONVERSATION_MESSAGES_ES[0].speakerColor, "#8d3800");
      assert.equal(
        ABUELA_CONVERSATION_MESSAGES_ES[0].text,
        "¡Muy buenos días, jovencito! Qué bonito les quedó todo por aquí. Se nota que trabajaron bastante.",
      );

      // Verificación de línea 16 (Parte 2: Inecito se dirige al jugador con trivia interactiva)
      const triviaMsgEs = ABUELA_CONVERSATION_MESSAGES_ES[16];
      assert.equal(triviaMsgEs.speaker, "Inecito");
      assert.equal(triviaMsgEs.target, "user");
      assert.equal(
        triviaMsgEs.text,
        "Ahora dime tú: ¿qué sucede con el derecho al voto cuando una persona envejece?",
      );
      assert.equal(
        triviaMsgEs.portraitOverride?.leftSrc,
        "/assets/juego/dialogos/retrato-inecito-pregunta.png",
      );
      assert.ok(triviaMsgEs.trivia, "Debe contener el objeto de trivia");
      assert.equal(triviaMsgEs.trivia.options.length, 3, "Debe contener 3 opciones de respuesta");
      assert.equal(
        triviaMsgEs.trivia.options.filter((o) => o.isCorrect).length,
        1,
        "Exactamente una opción debe ser correcta",
      );
      assert.equal(triviaMsgEs.trivia.options[1].isCorrect, true);
      assert.ok(triviaMsgEs.trivia.options[1].feedback.includes("7 de cada 10"));

      // Verificación de líneas 17 a 21 (Parte 3: Despedida entre personajes)
      assert.equal(ABUELA_CONVERSATION_MESSAGES_ES[17].speaker, "Doña Carmen");
      assert.equal(ABUELA_CONVERSATION_MESSAGES_ES[18].speaker, "Doña Carmen");
      assert.equal(ABUELA_CONVERSATION_MESSAGES_ES[19].speaker, "Inecito");
      assert.equal(ABUELA_CONVERSATION_MESSAGES_ES[20].speaker, "Doña Carmen");
      assert.equal(ABUELA_CONVERSATION_MESSAGES_ES[21].speaker, "Inecito");

      // Verificación de náhuatl
      assert.equal(ABUELA_CONVERSATION_MESSAGES_NAH[0].speaker, "Tenantzin Carmen");
      assert.equal(ABUELA_CONVERSATION_MESSAGES_NAH[16].speaker, "Inecito Cívica");
      assert.equal(
        ABUELA_CONVERSATION_MESSAGES_NAH[16].portraitOverride?.leftSrc,
        "/assets/juego/dialogos/retrato-inecito-pregunta.png",
      );
      assert.equal(ABUELA_CONVERSATION_MESSAGES_NAH[16].trivia?.options.length, 3);
      assert.equal(ABUELA_CONVERSATION_MESSAGES_NAH[17].speaker, "Tenantzin Carmen");
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

    test("camina suavemente paso a paso sin teletransportación a velocidad ágil (PLAYER_ALIGNMENT_WALK_SPEED = 32.0)", () => {
      assert.equal(PLAYER_ALIGNMENT_WALK_SPEED, 32.0, "La velocidad debe ser 32.0% para un deslizamiento ágil");

      const currentPos = { x: 13.5, y: 60.0 };
      const targetPos = { x: 13.5, y: 66.0 };
      const speed = PLAYER_ALIGNMENT_WALK_SPEED; // 32% por segundo

      // Paso 1: Transcurre 0.1s -> avanza 3.2% hacia abajo (y pasa de 60.0 a 63.2)
      const step1 = stepPlayerAlignmentWalk({
        currentPos,
        targetPos,
        speed,
        dt: 0.1,
      });

      assert.equal(step1.isArrived, false);
      assert.equal(step1.direction, "1", "Debe caminar hacia abajo (dirección 1)");
      assert.equal(Math.round(step1.nextPos.y * 10) / 10, 63.2);
      assert.equal(step1.nextPos.x, 13.5);

      // Paso 2: Cerca del objetivo (distancia <= 0.35%) -> llega y gira a la derecha ("4")
      const nearPos = { x: 13.5, y: 65.8 };
      const step2 = stepPlayerAlignmentWalk({
        currentPos: nearPos,
        targetPos,
        speed,
        dt: 0.05,
      });

      assert.equal(step2.isArrived, true);
      assert.equal(step2.direction, "4", "Al llegar debe orientarse hacia la derecha");
      assert.equal(step2.nextPos.x, targetPos.x);
      assert.equal(step2.nextPos.y, targetPos.y);
    });
  });

  describe("8. Retratos en diálogo y alternancia de filtro apagado/activo", () => {
    test("posee las rutas y asignaciones canónicas de los retratos", () => {
      assert.ok(ABUELA_CONVERSATION_PORTRAITS.left, "Debe existir interlocutor izquierdo (Inecito)");
      assert.ok(ABUELA_CONVERSATION_PORTRAITS.right, "Debe existir interlocutor derecho (Doña Carmen)");

      assert.equal(
        ABUELA_CONVERSATION_PORTRAITS.left.src,
        "/assets/juego/dialogos/retrato-inecito.png",
        "Ruta del retrato de Inecito",
      );
      assert.equal(
        ABUELA_CONVERSATION_PORTRAITS.right.src,
        "/assets/juego/dialogos/retrato-carmen.png",
        "Ruta del retrato de Doña Carmen",
      );
    });

    test("isPortraitActive reconoce oradores en Español y Náhuatl ignorando mayúsculas y espacios", () => {
      const inecitoNames = ABUELA_CONVERSATION_PORTRAITS.left.speakerNames;
      const carmenNames = ABUELA_CONVERSATION_PORTRAITS.right.speakerNames;

      // Inecito en Español y Náhuatl
      assert.equal(isPortraitActive("Inecito", inecitoNames), true);
      assert.equal(isPortraitActive("  Inecito  ", inecitoNames), true);
      assert.equal(isPortraitActive("INECITO", inecitoNames), true);
      assert.equal(isPortraitActive("Inecito Cívica", inecitoNames), true);
      assert.equal(isPortraitActive("Doña Carmen", inecitoNames), false);

      // Doña Carmen en Español y Náhuatl
      assert.equal(isPortraitActive("Doña Carmen", carmenNames), true);
      assert.equal(isPortraitActive("doña carmen", carmenNames), true);
      assert.equal(isPortraitActive("Tenantzin Carmen", carmenNames), true);
      assert.equal(isPortraitActive("Inecito", carmenNames), false);
    });

    test("getPortraitStyle retorna estilos vibrantes para orador activo y filtro apagado para el inactivo", () => {
      const activeStyle = getPortraitStyle(true);
      assert.equal(activeStyle.opacity, 1);
      assert.ok(activeStyle.filter.includes("brightness(1)"), "Orador activo debe tener brillo normal");
      assert.ok(activeStyle.zIndex >= 2, "Orador activo en capa superior");

      const dimmedStyle = getPortraitStyle(false);
      assert.ok(dimmedStyle.opacity < 1, "Orador inactivo debe tener opacidad reducida");
      assert.ok(dimmedStyle.filter.includes("brightness(0.38)"), "Orador inactivo debe tener filtro apagado (brightness reducido)");
      assert.ok(dimmedStyle.filter.includes("saturate(0.55)"), "Orador inactivo debe tener saturación atenuada");
    });

    test("todos los 22 mensajes de la conversación alternan exactamente un orador activo y uno apagado", () => {
      const inecitoNames = ABUELA_CONVERSATION_PORTRAITS.left.speakerNames;
      const carmenNames = ABUELA_CONVERSATION_PORTRAITS.right.speakerNames;

      // Evaluar conversación en Español (22 mensajes)
      ABUELA_CONVERSATION_MESSAGES_ES.forEach((msg, idx) => {
        const isLeft = isPortraitActive(msg.speaker, inecitoNames);
        const isRight = isPortraitActive(msg.speaker, carmenNames);

        assert.ok(
          (isLeft && !isRight) || (!isLeft && isRight),
          `Mensaje ES #${idx} ("${msg.speaker}") debe activar exactamente un interlocutor y apagar al otro`,
        );
      });

      // Evaluar conversación en Náhuatl (22 mensajes)
      ABUELA_CONVERSATION_MESSAGES_NAH.forEach((msg, idx) => {
        const isLeft = isPortraitActive(msg.speaker, inecitoNames);
        const isRight = isPortraitActive(msg.speaker, carmenNames);

        assert.ok(
          (isLeft && !isRight) || (!isLeft && isRight),
          `Mensaje NAH #${idx} ("${msg.speaker}") debe activar exactamente un interlocutor y apagar al otro`,
        );
      });
    });

    test("estructura en 3 partes de la conversación (Mito -> Trivia con Inecito -> Despedida)", () => {
      // 1. Parte 1: Mito y respuesta con datos (líneas 0 a 15)
      for (let i = 0; i <= 15; i++) {
        assert.ok(!ABUELA_CONVERSATION_MESSAGES_ES[i].trivia, `Línea ${i} no debe tener trivia`);
        assert.equal(ABUELA_CONVERSATION_MESSAGES_ES[i].portraitOverride, undefined);
      }

      // 2. Parte 2: Inecito se dirige al jugador y hace la pregunta con 3 opciones (línea 16)
      const triviaLine = ABUELA_CONVERSATION_MESSAGES_ES[16];
      assert.equal(triviaLine.speaker, "Inecito");
      assert.equal(triviaLine.target, "user");
      assert.equal(
        triviaLine.portraitOverride?.leftSrc,
        "/assets/juego/dialogos/retrato-inecito-pregunta.png",
        "El retrato debe cambiar a la imagen frontal de pregunta",
      );
      assert.ok(triviaLine.trivia, "Debe tener objeto trivia");
      assert.equal(triviaLine.trivia.options.length, 3, "Debe tener 3 botones de respuesta en fila");
      triviaLine.trivia.options.forEach((opt) => {
        assert.ok(opt.id.length > 0);
        assert.ok(opt.text.length > 0);
        assert.ok(opt.feedback.length > 0, "Cada opción debe tener texto de info/feedback");
      });
      assert.equal(
        triviaLine.trivia.options.filter((o) => o.isCorrect).length,
        1,
        "Debe haber exactamente 1 respuesta correcta",
      );

      // 3. Parte 3: Despedida entre personajes con regreso al retrato anterior (líneas 17 a 19)
      for (let i = 17; i < ABUELA_CONVERSATION_MESSAGES_ES.length; i++) {
        const line = ABUELA_CONVERSATION_MESSAGES_ES[i];
        assert.ok(!line.trivia, `Línea de despedida ${i} no debe tener trivia`);
        assert.equal(
          line.portraitOverride,
          undefined,
          `Línea ${i} debe regresar al retrato canónico de perfil`,
        );
      }
    });

    test("getSpeakerNameAlignment ubica el nombre a la derecha para Doña Carmen y a la izquierda para Inecito", () => {
      // Inecito -> "left"
      assert.equal(getSpeakerNameAlignment("Inecito", ABUELA_CONVERSATION_PORTRAITS), "left");
      assert.equal(getSpeakerNameAlignment("Inecito Cívica", ABUELA_CONVERSATION_PORTRAITS), "left");

      // Doña Carmen -> "right"
      assert.equal(getSpeakerNameAlignment("Doña Carmen", ABUELA_CONVERSATION_PORTRAITS), "right");
      assert.equal(getSpeakerNameAlignment("Tenantzin Carmen", ABUELA_CONVERSATION_PORTRAITS), "right");

      // Fallbacks
      assert.equal(getSpeakerNameAlignment(undefined, ABUELA_CONVERSATION_PORTRAITS), "left");
      assert.equal(getSpeakerNameAlignment("Doña Carmen", undefined), "left");
    });
  });

  describe("9. Cola secuencial de los 5 personajes narrativos y retardo de 10 segundos", () => {
    test("el orden de los personajes es estricto: 1. anciana, 2. joven, 3. indigena, 4. transgenero, 5. discapacitado", () => {
      assert.equal(NARRATIVE_CHARACTERS_ORDER.length, 5);
      assert.deepEqual(NARRATIVE_CHARACTERS_ORDER, [
        "anciana",
        "joven",
        "indigena",
        "transgenero",
        "discapacitado",
      ]);
    });

    test("el retardo entre personajes está calibrado exactamente en 10 segundos (10,000 ms)", () => {
      assert.equal(BETWEEN_CHARACTERS_DELAY_MS, 10000);
    });

    test("cada uno de los 5 personajes posee configuración completa y válida", () => {
      NARRATIVE_CHARACTERS_ORDER.forEach((id) => {
        const config = NARRATIVE_CHARACTERS_CONFIG[id];
        assert.ok(config, `El personaje ${id} debe tener configuración`);
        assert.equal(config.id, id);
        assert.ok(config.nameEs.length > 0, `nameEs no debe estar vacío para ${id}`);
        assert.ok(config.nameNah.length > 0, `nameNah no debe estar vacío para ${id}`);
        assert.ok(config.speakerColor.startsWith("#"), `speakerColor válido para ${id}`);
        assert.ok(config.portraitSrc.startsWith("/assets/juego/dialogos/retrato-"), `portraitSrc válido para ${id}`);
        assert.ok(config.speakerNames.length >= 2, `speakerNames debe incluir variantes para ${id}`);
        assert.ok(config.arrivalMessagesEs.length >= 1, `arrivalMessagesEs para ${id}`);
        assert.ok(config.arrivalMessagesNah.length >= 1, `arrivalMessagesNah para ${id}`);
        assert.ok(config.conversationMessagesEs.length >= 2, `conversationMessagesEs para ${id}`);
        assert.ok(config.conversationMessagesNah.length >= 2, `conversationMessagesNah para ${id}`);
      });
    });

    test("las rutas de los retratos de los 5 personajes corresponden a los archivos canónicos", () => {
      assert.equal(
        NARRATIVE_CHARACTERS_CONFIG.anciana.portraitSrc,
        "/assets/juego/dialogos/retrato-carmen.png",
      );
      assert.equal(
        NARRATIVE_CHARACTERS_CONFIG.joven.portraitSrc,
        "/assets/juego/dialogos/retrato-joven.png",
      );
      assert.equal(
        NARRATIVE_CHARACTERS_CONFIG.indigena.portraitSrc,
        "/assets/juego/dialogos/retrato-indigena.png",
      );
      assert.equal(
        NARRATIVE_CHARACTERS_CONFIG.transgenero.portraitSrc,
        "/assets/juego/dialogos/retrato-trans.png",
      );
      assert.equal(
        NARRATIVE_CHARACTERS_CONFIG.discapacitado.portraitSrc,
        "/assets/juego/dialogos/retrato-discapacitado.png",
      );
    });

    test("getNarrativeCharacterPortraits sitúa siempre a Inecito a la izquierda y al personaje a la derecha", () => {
      NARRATIVE_CHARACTERS_ORDER.forEach((id) => {
        const portraits = getNarrativeCharacterPortraits(id);
        assert.ok(portraits.left, `Debe existir interlocutor izquierdo para ${id}`);
        assert.ok(portraits.right, `Debe existir interlocutor derecho para ${id}`);

        assert.equal(
          portraits.left.src,
          "/assets/juego/dialogos/retrato-inecito.png",
          "Inecito debe ser el retrato izquierdo en todos los diálogos",
        );
        assert.equal(
          portraits.right.src,
          NARRATIVE_CHARACTERS_CONFIG[id].portraitSrc,
          `El retrato derecho debe ser el correspondiente a ${id}`,
        );
      });
    });

    test("updateQueueTransitionDelay descuenta el retardo de 10 segundos con precisión", () => {
      // 0s transcurridos
      const t0 = updateQueueTransitionDelay({
        elapsedMs: 0,
        dtSeconds: 0,
        delayMs: BETWEEN_CHARACTERS_DELAY_MS,
      });
      assert.equal(t0.newElapsedMs, 0);
      assert.equal(t0.isReady, false);

      // 4 segundos transcurridos
      const t1 = updateQueueTransitionDelay({
        elapsedMs: 0,
        dtSeconds: 4.0,
      });
      assert.equal(t1.newElapsedMs, 4000);
      assert.equal(t1.isReady, false);

      // 9.5 segundos transcurridos
      const t2 = updateQueueTransitionDelay({
        elapsedMs: t1.newElapsedMs,
        dtSeconds: 5.5,
      });
      assert.equal(t2.newElapsedMs, 9500);
      assert.equal(t2.isReady, false);

      // 10.0 segundos cumplidos (transición completada)
      const t3 = updateQueueTransitionDelay({
        elapsedMs: t2.newElapsedMs,
        dtSeconds: 0.5,
      });
      assert.equal(t3.newElapsedMs, 10000);
      assert.equal(t3.isReady, true);
    });

    test("simula el avance secuencial completo de los 5 personajes con retardo de 10s entre ellos", () => {
      let currentIndex = 0;
      let status = "walking";
      let pos = { ...ANCIANA_DEFAULTS.startPosition }; // { x: 102.0, y: 66.0 }

      const completedCharacters = [];

      for (let i = 0; i < NARRATIVE_CHARACTERS_ORDER.length; i++) {
        const charId = NARRATIVE_CHARACTERS_ORDER[currentIndex];

        // 1. Caminata en línea recta de x: 102 a x: 26
        assert.equal(pos.x, 102.0);
        assert.equal(pos.y, 66.0);

        const walk = stepAncianaMovement({
          currentPos: pos,
          targetPos: ANCIANA_DEFAULTS.targetPosition,
          speed: ANCIANA_DEFAULTS.speed,
          dt: 10.0, // tiempo suficiente para llegar
        });

        assert.equal(walk.isArrived, true);
        assert.equal(walk.nextPos.x, 26.0);
        status = "arrived";

        // 2. Interacción y conversación
        status = "in_conversation";

        // 3. Conclusión de la conversación
        completedCharacters.push(charId);

        if (currentIndex < NARRATIVE_CHARACTERS_ORDER.length - 1) {
          status = "waiting_next_character";

          // 4. Retardo de 10 segundos
          const delayCheck = updateQueueTransitionDelay({
            elapsedMs: 0,
            dtSeconds: 10.0,
          });
          assert.equal(delayCheck.isReady, true);

          // Siguiente personaje avanza
          currentIndex++;
          pos = { ...ANCIANA_DEFAULTS.startPosition };
          status = "walking";
        } else {
          status = "all_completed";
        }
      }

      assert.equal(completedCharacters.length, 5);
      assert.deepEqual(completedCharacters, [
        "anciana",
        "joven",
        "indigena",
        "transgenero",
        "discapacitado",
      ]);
      assert.equal(status, "all_completed");
    });

    test("todos los diálogos de los 5 personajes alternan correctamente hablante activo y apagado", () => {
      NARRATIVE_CHARACTERS_ORDER.forEach((id) => {
        const config = NARRATIVE_CHARACTERS_CONFIG[id];
        const portraits = getNarrativeCharacterPortraits(id);

        config.conversationMessagesEs.forEach((line, idx) => {
          const isLeft = isPortraitActive(line.speaker, portraits.left.speakerNames);
          const isRight = isPortraitActive(line.speaker, portraits.right.speakerNames);

          assert.ok(
            (isLeft && !isRight) || (!isLeft && isRight),
            `Línea ${idx} de ${id} (${line.speaker}) debe alternar exactamente un orador`,
          );

          const alignment = getSpeakerNameAlignment(line.speaker, portraits);
          assert.equal(
            alignment,
            isRight ? "right" : "left",
            `Alineación de nombre para ${line.speaker} en ${id}`,
          );
        });
      });
    });
  });

  describe("10. Estructura de conversaciones en 3 partes y trivia interactiva", () => {
    test("los 5 personajes narrativos implementan la estructura en 3 partes (Mito -> Pregunta Inecito -> Despedida)", () => {
      NARRATIVE_CHARACTERS_ORDER.forEach((id) => {
        const config = NARRATIVE_CHARACTERS_CONFIG[id];
        const messages = config.conversationMessagesEs;

        // Debe tener al menos 6 líneas: Parte 1 (>=2), Parte 2 (1), Parte 3 (>=2)
        assert.ok(
          messages.length >= 6,
          `El personaje ${id} debe tener suficientes mensajes para las 3 partes`,
        );

        // Ubicar la línea de trivia (Parte 2)
        const triviaIndex = messages.findIndex((m) => m.trivia !== undefined);
        assert.ok(
          triviaIndex > 0,
          `El personaje ${id} debe tener una línea de trivia interactiva en Parte 2`,
        );

        const triviaLine = messages[triviaIndex];
        assert.equal(triviaLine.speaker, "Inecito", "Inecito debe ser el orador en la trivia");
        assert.equal(triviaLine.target, "user", "Inecito debe dirigirse al usuario en la trivia");
        assert.equal(
          triviaLine.portraitOverride?.leftSrc,
          "/assets/juego/dialogos/retrato-inecito-pregunta.png",
          "Inecito debe usar el retrato frontal con manos abiertas",
        );

        // Verificar 3 botones de respuesta en fila
        assert.equal(triviaLine.trivia?.options.length, 3, "Debe tener exactamente 3 opciones");
        const correctOptions = triviaLine.trivia?.options.filter((o) => o.isCorrect);
        assert.equal(correctOptions?.length, 1, "Debe haber exactamente 1 opción correcta");
        triviaLine.trivia?.options.forEach((opt) => {
          assert.ok(opt.feedback.length > 0, "Cada opción debe tener info explicativa");
        });

        // Parte 3: Despedida entre personajes (después de la trivia)
        const farewellLines = messages.slice(triviaIndex + 1);
        assert.ok(farewellLines.length >= 2, `Parte 3 debe tener despedida para ${id}`);
        farewellLines.forEach((fl) => {
          assert.equal(fl.trivia, undefined, "Líneas de despedida no deben tener trivia");
          assert.equal(
            fl.portraitOverride,
            undefined,
            "Líneas de despedida deben regresar al retrato canónico",
          );
        });
      });
    });

    test("simulación lógica de bloqueo de avance y desbloqueo tras responder la trivia", () => {
      const triviaLine = ABUELA_CONVERSATION_MESSAGES_ES[16];
      let selectedOptionId = null;

      // Estado 1: Pregunta visible, sin responder
      let isTrivia = Boolean(triviaLine.trivia && triviaLine.trivia.options.length > 0);
      let isWaitingForAnswer = isTrivia && selectedOptionId === null;
      assert.equal(isWaitingForAnswer, true, "Debe estar esperando respuesta");

      // Intento de avance con teclado (E, Enter, Espacio): debe estar bloqueado
      const simulateKeyAdvance = (isWaiting) => {
        if (isWaiting) return false; // Bloqueado
        return true; // Permitido
      };
      assert.equal(simulateKeyAdvance(isWaitingForAnswer), false, "El avance debe estar estrictamente bloqueado");

      // Estado 2: El usuario selecciona la opción 'opt-b' (correcta)
      selectedOptionId = "opt-b";
      isWaitingForAnswer = isTrivia && selectedOptionId === null;
      assert.equal(isWaitingForAnswer, false, "Ya no debe estar esperando respuesta");

      const selectedOption = triviaLine.trivia.options.find((o) => o.id === selectedOptionId);
      assert.ok(selectedOption);
      assert.equal(selectedOption.isCorrect, true);
      assert.ok(selectedOption.feedback.includes("7 de cada 10"), "Debe mostrar el feedback correspondiente");

      // Ahora el avance sí está permitido
      assert.equal(simulateKeyAdvance(isWaitingForAnswer), true, "El avance debe estar desbloqueado");

      // Estado 3: Al avanzar a la línea 17 (Parte 3), se reinicia selectedOptionId
      selectedOptionId = null;
      const nextLine = ABUELA_CONVERSATION_MESSAGES_ES[17];
      assert.equal(nextLine.speaker, "Doña Carmen");
      assert.equal(nextLine.portraitOverride, undefined, "Regresa al retrato canónico de Doña Carmen");
    });

    test("Mateo (el joven) tiene la estructura en 3 partes, trivia CCPC de participación y alineación correcta", () => {
      const messages = JOVEN_CONVERSATION_MESSAGES_ES;
      assert.equal(messages.length, 36, "Debe tener 36 líneas de diálogo");

      // Parte 1: Primera línea de Mateo
      assert.equal(messages[0].speaker, "Mateo");
      assert.ok(messages[0].text.includes("Qué onda... oye, ¿aquí es donde se vota?"));

      // Parte 2: Pregunta interactiva
      const triviaLine = messages[30];
      assert.equal(triviaLine.speaker, "Inecito");
      assert.ok(triviaLine.trivia);
      assert.ok(triviaLine.trivia.question.includes("por qué importa participar en las elecciones"));
      assert.equal(triviaLine.trivia.options.length, 3);
      assert.equal(triviaLine.trivia.options[1].isCorrect, true);
      assert.ok(triviaLine.trivia.options[1].feedback.includes("Cada voto válido cuenta por igual"));

      // Parte 3: Despedida de Mateo
      assert.equal(messages[31].speaker, "Mateo");
      assert.ok(messages[31].text.includes("Bueno, bro, creo que ya entendí"));
      assert.equal(messages[35].speaker, "Inecito");
      assert.ok(messages[35].text.includes("¡Que tengas una excelente primera experiencia!"));

      // Verificación de retratos y alineación de orador
      const portraits = getNarrativeCharacterPortraits("joven");
      assert.equal(getSpeakerNameAlignment("Mateo", portraits), "right");
      assert.equal(getSpeakerNameAlignment("Inecito", portraits), "left");
      assert.equal(isPortraitActive("Mateo", portraits.right.speakerNames), true);
      assert.equal(isPortraitActive("Inecito", portraits.left.speakerNames), true);
    });

    test("María (la mujer indígena) tiene la estructura en 3 partes, trivia CCPC de comunidades indígenas y alineación correcta", () => {
      const messages = INDIGENA_CONVERSATION_MESSAGES_ES;
      assert.equal(messages.length, 34, "Debe tener 34 líneas de diálogo");

      // Parte 1: Primera línea de María
      assert.equal(messages[0].speaker, "María");
      assert.ok(messages[0].text.includes("¡Muy buenos días! Disculpe, ¿aquí es donde puedo votar?"));

      // Verificación de datos del Censo INEGI 2020 en la charla
      const inegiLine = messages.find((m) => m.text.includes("Censo de Población y Vivienda 2020"));
      assert.ok(inegiLine, "Debe incluir la referencia al Censo INEGI 2020");
      assert.ok(inegiLine.text.includes("más de 7 millones de personas"));

      // Parte 2: Pregunta interactiva (línea 28)
      const triviaLine = messages[28];
      assert.equal(triviaLine.speaker, "Inecito");
      assert.ok(triviaLine.trivia);
      assert.ok(
        triviaLine.trivia.question.includes(
          "¿Los votos de las comunidades indígenas tienen menos valor que los de las grandes ciudades?"
        )
      );
      assert.equal(triviaLine.trivia.options.length, 3);
      assert.equal(triviaLine.trivia.options[2].isCorrect, true, "La opción C debe ser la correcta");
      assert.ok(
        triviaLine.trivia.options[2].feedback.includes(
          "No importa si una persona vive en una gran ciudad o en una comunidad indígena"
        )
      );

      // Parte 3: Despedida de María
      assert.equal(messages[29].speaker, "María");
      assert.ok(
        messages[29].text.includes(
          "Muchas gracias, Inecito. Me alegra saber que nuestra voz tiene el mismo valor"
        )
      );
      assert.equal(messages[33].speaker, "Inecito");
      assert.ok(messages[33].text.includes("¡Que tenga un excelente día, María!"));

      // Verificación de retratos y alineación de orador
      const portraits = getNarrativeCharacterPortraits("indigena");
      assert.equal(getSpeakerNameAlignment("María", portraits), "right");
      assert.equal(getSpeakerNameAlignment("Inecito", portraits), "left");
      assert.equal(isPortraitActive("María", portraits.right.speakerNames), true);
      assert.equal(isPortraitActive("Inecito", portraits.left.speakerNames), true);
    });

    test("Alex (mujer trans) tiene la estructura en 3 partes, trivia de Protocolo Trans INE 2017 y alineación correcta", () => {
      const messages = TRANS_CONVERSATION_MESSAGES_ES;
      assert.equal(messages.length, 32, "Debe tener 32 líneas de diálogo");

      // Parte 1: Primera línea de Alex
      assert.equal(messages[0].speaker, "Alex");
      assert.ok(messages[0].text.includes("Hola, buenos días. Disculpa, ¿puedo hacerte una pregunta antes de votar?"));

      // Verificación del Protocolo Trans INE 2017
      const protocolLine = messages.find((m) => m.text.includes("protocolo para garantizar que las personas trans puedan votar"));
      assert.ok(protocolLine, "Debe incluir la referencia al Protocolo Trans del INE");
      assert.ok(protocolLine.text.includes("2017"));

      // Parte 2: Pregunta interactiva (línea 26)
      const triviaLine = messages[26];
      assert.equal(triviaLine.speaker, "Inecito");
      assert.ok(triviaLine.trivia);
      assert.ok(
        triviaLine.trivia.question.includes(
          "¿Qué sucede si la apariencia de una persona trans no coincide con la fotografía de su credencial para votar?"
        )
      );
      assert.equal(triviaLine.trivia.options.length, 3);
      assert.equal(triviaLine.trivia.options[1].isCorrect, true, "La opción B debe ser la correcta");
      assert.ok(
        triviaLine.trivia.options[1].feedback.includes(
          "El INE cuenta con un protocolo para garantizar el voto de las personas trans sin discriminación"
        )
      );

      // Parte 3: Despedida de Alex
      assert.equal(messages[27].speaker, "Alex");
      assert.ok(
        messages[27].text.includes(
          "¡Muchas gracias, Inecito! La verdad, venía bastante nerviosa y ahora me siento mucho más tranquila."
        )
      );
      assert.equal(messages[31].speaker, "Inecito");
      assert.ok(messages[31].text.includes("¡Que tengas un excelente día!"));

      // Verificación de retratos y alineación de orador
      const portraits = getNarrativeCharacterPortraits("transgenero");
      assert.equal(getSpeakerNameAlignment("Alex", portraits), "right");
      assert.equal(getSpeakerNameAlignment("Inecito", portraits), "left");
      assert.equal(isPortraitActive("Alex", portraits.right.speakerNames), true);
      assert.equal(isPortraitActive("Inecito", portraits.left.speakerNames), true);
    });

    test("Don Roberto (persona con discapacidad) tiene la estructura en 3 partes, trivia de accesibilidad y alineación correcta", () => {
      const messages = DISCAPACITADO_CONVERSATION_MESSAGES_ES;
      assert.equal(messages.length, 33, "Debe tener 33 líneas de diálogo");

      // Parte 1: Primera línea de Don Roberto
      assert.equal(messages[0].speaker, "Don Roberto");
      assert.ok(messages[0].text.includes("¡Muy buenos días, joven! Veo que tienen todo bastante bien organizado"));

      // Verificación de datos del Censo INEGI 2020 y mamparas accesibles
      const inegiLine = messages.find((m) => m.text.includes("Censo de Población y Vivienda 2020"));
      assert.ok(inegiLine, "Debe incluir la referencia al Censo INEGI 2020");
      assert.ok(inegiLine.text.includes("6.2 millones de personas con discapacidad"));

      const mamparaLine = messages.find((m) => m.text.includes("mamparas especiales"));
      assert.ok(mamparaLine, "Debe mencionar las mamparas especiales del INE");

      // Parte 2: Pregunta interactiva (línea 27)
      const triviaLine = messages[27];
      assert.equal(triviaLine.speaker, "Inecito");
      assert.ok(triviaLine.trivia);
      assert.ok(
        triviaLine.trivia.question.includes(
          "Si una persona utiliza silla de ruedas, ¿qué debemos hacer para que pueda votar?"
        )
      );
      assert.equal(triviaLine.trivia.options.length, 3);
      assert.equal(triviaLine.trivia.options[2].isCorrect, true, "La opción C debe ser la correcta");
      assert.ok(
        triviaLine.trivia.options[2].feedback.includes(
          "El INE dispone de mamparas especiales y medidas de accesibilidad"
        )
      );

      // Parte 3: Despedida de Don Roberto
      assert.equal(messages[28].speaker, "Don Roberto");
      assert.ok(
        messages[28].text.includes(
          "¡Muchas gracias, Inecito! Me alegra saber que puedo votar por mi cuenta"
        )
      );
      assert.equal(messages[32].speaker, "Inecito");
      assert.ok(messages[32].text.includes("¡Que tenga un excelente día!"));

      // Verificación de retratos y alineación de orador
      const portraits = getNarrativeCharacterPortraits("discapacitado");
      assert.equal(getSpeakerNameAlignment("Don Roberto", portraits), "right");
      assert.equal(getSpeakerNameAlignment("Inecito", portraits), "left");
      assert.equal(isPortraitActive("Don Roberto", portraits.right.speakerNames), true);
      assert.equal(isPortraitActive("Inecito", portraits.left.speakerNames), true);
    });
  });

  describe("Fase 5.7: Animaciones de caminata, IDLE en mesa y sistema provisional de retiro", () => {
    test("posee configuraciones exactas de cuadros para anciana, joven, indigena y trans", () => {
      assert.equal(NARRATIVE_CHARACTERS_ANIMATION_CONFIG.anciana.frameCount, 36);
      assert.equal(NARRATIVE_CHARACTERS_ANIMATION_CONFIG.anciana.folder, "anciana");
      assert.equal(NARRATIVE_CHARACTERS_ANIMATION_CONFIG.anciana.filePrefix, "anciana-side");

      assert.equal(NARRATIVE_CHARACTERS_ANIMATION_CONFIG.joven.frameCount, 29);
      assert.equal(NARRATIVE_CHARACTERS_ANIMATION_CONFIG.joven.folder, "joven");
      assert.equal(NARRATIVE_CHARACTERS_ANIMATION_CONFIG.joven.filePrefix, "chavo-side");

      assert.equal(NARRATIVE_CHARACTERS_ANIMATION_CONFIG.indigena.frameCount, 32);
      assert.equal(NARRATIVE_CHARACTERS_ANIMATION_CONFIG.indigena.folder, "indigena");
      assert.equal(NARRATIVE_CHARACTERS_ANIMATION_CONFIG.indigena.filePrefix, "indigena-side");

      assert.equal(NARRATIVE_CHARACTERS_ANIMATION_CONFIG.transgenero.frameCount, 34);
      assert.equal(NARRATIVE_CHARACTERS_ANIMATION_CONFIG.transgenero.folder, "trans");
      assert.equal(NARRATIVE_CHARACTERS_ANIMATION_CONFIG.transgenero.filePrefix, "trans-side");

      assert.equal(NARRATIVE_CHARACTERS_ANIMATION_CONFIG.discapacitado.frameCount, 0);
    });

    test("getNarrativeCharacterSideFrameSrc resuelve rutas exactas con padding para cada personaje", () => {
      // Anciana (Abuela)
      assert.equal(
        getNarrativeCharacterSideFrameSrc("anciana", 0),
        "/assets/juego/personajes/anciana/side/anciana-side00086400.png",
      );
      assert.equal(
        getNarrativeCharacterSideFrameSrc("anciana", 35),
        "/assets/juego/personajes/anciana/side/anciana-side00086435.png",
      );

      // Joven (Mateo / Chavo)
      assert.equal(
        getNarrativeCharacterSideFrameSrc("joven", 0),
        "/assets/juego/personajes/joven/side/chavo-side00086400.png",
      );
      assert.equal(
        getNarrativeCharacterSideFrameSrc("joven", 28),
        "/assets/juego/personajes/joven/side/chavo-side00086428.png",
      );

      // Indígena (María / Citlali)
      assert.equal(
        getNarrativeCharacterSideFrameSrc("indigena", 0),
        "/assets/juego/personajes/indigena/side/indigena-side00086400.png",
      );
      assert.equal(
        getNarrativeCharacterSideFrameSrc("indigena", 31),
        "/assets/juego/personajes/indigena/side/indigena-side00086431.png",
      );

      // Transgénero (Alex / Morgan)
      assert.equal(
        getNarrativeCharacterSideFrameSrc("transgenero", 0),
        "/assets/juego/personajes/trans/side/trans-side00086400.png",
      );
      assert.equal(
        getNarrativeCharacterSideFrameSrc("transgenero", 33),
        "/assets/juego/personajes/trans/side/trans-side00086433.png",
      );
    });

    test("getNarrativeCharacterIdleSrc resuelve las posiciones IDLE oficiales en la mesa", () => {
      assert.equal(
        getNarrativeCharacterIdleSrc("anciana"),
        "/assets/juego/personajes/anciana/anciana-idle.png",
      );
      assert.equal(
        getNarrativeCharacterIdleSrc("joven"),
        "/assets/juego/personajes/joven/joven-idle.png",
      );
      assert.equal(
        getNarrativeCharacterIdleSrc("indigena"),
        "/assets/juego/personajes/indigena/indigena-idle.png",
      );
      assert.equal(
        getNarrativeCharacterIdleSrc("transgenero"),
        "/assets/juego/personajes/trans/trans-idle.png",
      );
    });

    test("stepNarrativeRetreatMovement desplaza hacia la derecha (x: 26 -> x: 102) con velocidad constante", () => {
      const startPos = { x: 26.0, y: 66.0 };
      const targetPos = { x: 102.0, y: 66.0 };
      const speed = 9.0;
      const dt = 1.0; // 1 segundo = 9% de desplazamiento hacia la derecha

      const step1 = stepNarrativeRetreatMovement({
        currentPos: startPos,
        targetPos,
        speed,
        dt,
      });

      assert.equal(step1.nextPos.x, 35.0);
      assert.equal(step1.nextPos.y, 66.0);
      assert.equal(step1.isArrived, false);
    });

    test("stepNarrativeRetreatMovement no sobrepasa la coordenada de salida y reporta isArrived: true", () => {
      const currentPos = { x: 100.0, y: 66.0 };
      const targetPos = { x: 102.0, y: 66.0 };
      const speed = 9.0;
      const dt = 1.0; // Avanzaría a 109%, pero se limita exactamente a 102.0%

      const step = stepNarrativeRetreatMovement({
        currentPos,
        targetPos,
        speed,
        dt,
      });

      assert.equal(step.nextPos.x, 102.0);
      assert.equal(step.isArrived, true);

      // Si ya está en la posición o más allá
      const stepBeyond = stepNarrativeRetreatMovement({
        currentPos: { x: 105.0, y: 66.0 },
        targetPos,
        speed,
        dt,
      });
      assert.equal(stepBeyond.nextPos.x, 102.0);
      assert.equal(stepBeyond.isArrived, true);
    });

    test("simulación determinista: llegada a mesa, cambio a IDLE, retiro a derecha y avance de cola tras 10s", () => {
      // 1. Llegada (x: 102 -> 26)
      let pos = { x: 102.0, y: 66.0 };
      const targetTablePos = { x: 26.0, y: 66.0 };
      const exitPos = { x: 102.0, y: 66.0 };
      const speed = 9.0;
      const dt = 1 / 60; // 60 FPS

      let arrivedAtTable = false;
      let frames = 0;
      while (!arrivedAtTable && frames < 1000) {
        frames++;
        const step = stepAncianaMovement({
          currentPos: pos,
          targetPos: targetTablePos,
          speed,
          dt,
        });
        pos = step.nextPos;
        arrivedAtTable = step.isArrived;
      }

      assert.equal(arrivedAtTable, true);
      assert.equal(pos.x, 26.0);

      // 2. En la mesa: el personaje cambia a IDLE
      const idleSrc = getNarrativeCharacterIdleSrc("joven");
      assert.equal(idleSrc, "/assets/juego/personajes/joven/joven-idle.png");

      // 3. Al concluir la conversación: se retira hacia la derecha (x: 26 -> 102)
      let exitedScene = false;
      let retreatFrames = 0;
      while (!exitedScene && retreatFrames < 1000) {
        retreatFrames++;
        const step = stepNarrativeRetreatMovement({
          currentPos: pos,
          targetPos: exitPos,
          speed,
          dt,
        });
        pos = step.nextPos;
        exitedScene = step.isArrived;
      }

      assert.equal(exitedScene, true);
      assert.equal(pos.x, 102.0);

      // 4. Tras salir del escenario: transcurren los 10 segundos antes del siguiente personaje
      let elapsedDelay = 0;
      const delayStep1 = updateQueueTransitionDelay({
        elapsedMs: elapsedDelay,
        dtSeconds: 5.0,
        delayMs: 10000,
      });
      assert.equal(delayStep1.isReady, false);

      const delayStep2 = updateQueueTransitionDelay({
        elapsedMs: delayStep1.newElapsedMs,
        dtSeconds: 5.0,
        delayMs: 10000,
      });
      assert.equal(delayStep2.isReady, true);
      assert.equal(delayStep2.newElapsedMs, 10000);
    });
  });
});





