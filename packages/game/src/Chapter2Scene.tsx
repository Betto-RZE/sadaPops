import React, { useState, useEffect, useRef, useMemo } from "react";
import { PixelSpeechBubble } from "./PixelSpeechBubble";
import {
  AnimatedPlayerSprite,
  releasePlayerImages,
} from "./AnimatedPlayerSprite";
import {
  PLAZA_BOUNDS,
  CASILLA_POSITIONS,
  CASILLA_WIDTH,
  MESA_POSITION,
  MESA_WIDTH,
  DECORACIONES_LIST,
  DECORACIONES_POSITIONS,
  BOLETAS_POSITIONS,
  BOLETAS_SIZES,
  BOLETA_WIDTH,
  OBJECT_COLLISION_BOXES,
  isInsideBox,
  isInsidePolygon,
  tryPolygonWallSlide,
  getLeftBoundaryX,
  getRightBoundaryX,
  getBaseRightBoundaryX,
} from "./GameplayScene";
import type { ChapterSceneProps } from "./features/capitulos/ChapterSceneRouter";
import {
  getChapterHandoff,
  type PlayerDirection,
} from "./features/capitulos/chapterHandoff";
import {
  useGenericNpcs,
  useCinematicNpcCamera,
  GenericNpcSprite,
  GENERIC_NPC_DEFAULTS,
  getNpcLateralPushVector,
  isPositionBlockedByIdleNpc,
  NPC_COLLISION_DEFAULTS,
  type ActivePushState,
  calculateSceneCharactersDepth,
  calculateCharacterZIndex,
  clearDepthCache,
  type DepthEntity,
  NPC_DEPTH_LAYERS,
} from "./features/npcs";

/**
 * Capitulo 2: "Desmintiendo mitos".
 * Continua en la misma explanada del Capitulo 1, con la casilla ya instalada.
 * - JUGAR: el personaje arranca exactamente donde termino el Capitulo 1.
 * - CAPITULOS: arranca en una posicion por defecto junto a la mesa directiva.
 * Tras 2.5 s aparece el dialogo de llegada de los primeros votantes.
 */

export const INTRO_CAP2_MESSAGES_ES: string[] = [
  "¡Mira nada más! ¡Ya comenzaron a llegar nuestros primeros votantes!",
  "Después de tanto preparar la casilla, qué gusto ver que todo está funcionando como esperábamos.",
  "Cada persona que llega tiene sus propias razones para participar, sus opiniones y, seguramente, una que otra duda.",
  "Y aunque nuestro trabajo es ayudar a que la votación se desarrolle correctamente, también podemos orientar a quienes tengan preguntas.",
];

export const INTRO_CAP2_MESSAGES_NAH: string[] = [
  "¡Xikita san tlen! ¡Ya pehualkeh ajsih tototlayokauh votantes!",
  "Satepan kuak miak tikyektlalijkeh in casilla, ¡kualtsin tikitah nochi kisa ken timochiyayaj!",
  "Sesen maseual akin ajsi kipixtok itlanemililis pampa tlapejpenis, itlamachilis wan tlatotonki se tlatlanilistli.",
  "Wan maski totlanel tekiyo yeski ma kualtsin mopano in tlaixquetzalistli, no uelis tikinyakanaseh akin kipiah tlatlanilistli.",
];

/** Espera antes del primer globo de texto al iniciar el capitulo. */
const INTRO_DELAY_MS = 2500;

/** Posicion por defecto (modo CAPITULOS): junto a la mesa directiva. */
const DEFAULT_PLAYER_POS = { x: 20, y: 52 };

type DialogueState =
  | "initial_delay"
  | "entering"
  | "visible"
  | "exiting"
  | "dismissed";

// Zona caminable: explanada + casilla completa (mamparas, mesa y cartel 2)
const isPlazaWalkable = (x: number, y: number): boolean => {
  if (y < PLAZA_BOUNDS.minY || y > PLAZA_BOUNDS.maxY) return false;
  return x >= getLeftBoundaryX(y) && x <= getRightBoundaryX(y);
};

const isPositionWalkable = (x: number, y: number): boolean => {
  if (!isPlazaWalkable(x, y)) return false;
  const obs = OBJECT_COLLISION_BOXES;
  if (obs.mamparas.some((box) => isInsideBox(x, y, box))) return false;
  if (isInsidePolygon(x, y, obs.mesa)) return false;
  if (isInsideBox(x, y, obs.cartel2)) return false;
  return true;
};

export default function Chapter2Scene({
  language = "es",
  stageImageUrl,
  isFullscreen,
  isTransitioning,
  isPaused,
  onRequestExit,
}: ChapterSceneProps) {
  // Lectura sin efectos (segura con StrictMode). Se limpia al iniciar otra sesion.
  const [playerPos, setPlayerPos] = useState(
    () => getChapterHandoff()?.playerPos ?? DEFAULT_PLAYER_POS,
  );
  const [lastDirection, setLastDirection] = useState<PlayerDirection>(
    () => getChapterHandoff()?.lastDirection ?? "1",
  );
  const [isWalking, setIsWalking] = useState(false);
  const [dialogueState, setDialogueState] =
    useState<DialogueState>("initial_delay");

  // Sistema de personajes genéricos (votantes ambientales)
  const { npcs } = useGenericNpcs({
    dialogueState,
    isPaused,
  });

  const isPausedRef = useRef(isPaused);
  const dialogueStateRef = useRef(dialogueState);
  const playerPosRef = useRef(playerPos);
  const npcsRef = useRef(npcs);
  const activePushStateRef = useRef<ActivePushState | null>(null);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    dialogueStateRef.current = dialogueState;
  }, [dialogueState]);
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);
  useEffect(() => {
    npcsRef.current = npcs;
  }, [npcs]);

  // Contador de 2.5 s (empieza cuando la pantalla esta abierta) y animacion del globo
  useEffect(() => {
    if (isTransitioning) return;

    if (dialogueState === "initial_delay") {
      const timer = setTimeout(
        () => setDialogueState("entering"),
        INTRO_DELAY_MS,
      );
      return () => clearTimeout(timer);
    }
    if (dialogueState === "entering") {
      const timer = setTimeout(() => setDialogueState("visible"), 350);
      return () => clearTimeout(timer);
    }
    if (dialogueState === "exiting") {
      const timer = setTimeout(() => setDialogueState("dismissed"), 350);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, dialogueState]);

  // Al desmontar se liberan los frames precargados del personaje y la caché de profundidad
  useEffect(() => {
    return () => {
      clearDepthCache();
      releasePlayerImages();
    };
  }, []);

  // Bucle de movimiento (mismas fisicas que el Capitulo 1: 4 direcciones,
  // aceleracion progresiva, inercia y deslizamiento en bordes/obstaculos)
  useEffect(() => {
    const keysPressed: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = false;
    };

    let animationFrameId: number;
    let lastTime = performance.now();

    // Política de pestañas inactivas (Fase 5.4):
    // Al recuperar foco/visibilidad, restablecer lastTime para evitar saltos o teletransportación física
    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        lastTime = performance.now();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    const maxSpeed = 22.0;
    const RAMP_TIME = 1.0;
    const frictionRate = 9.0;
    let keyHoldTime = 0;
    const velocity = { x: 0, y: 0 };

    const stop = () => {
      velocity.x = 0;
      velocity.y = 0;
      keyHoldTime = 0;
      setIsWalking(false);
    };

    const updateGameLoop = (currentTime: number) => {
      // Si el documento está oculto, pausar la física sin acumular tiempo
      if (typeof document !== "undefined" && document.hidden) {
        lastTime = currentTime;
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (isPausedRef.current) {
        stop();
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      // Sistema de Colisiones Dinámicas: empuje lateral suave de los NPCs genéricos
      const pushResult = getNpcLateralPushVector({
        playerPos: playerPosRef.current,
        npcs: npcsRef.current,
        isPositionWalkable,
        activePushState: activePushStateRef.current,
        dtSeconds: dt,
      });
      activePushStateRef.current = pushResult.activePushState;

      // Sin movimiento de controles hasta cerrar el dialogo (incluye la espera inicial).
      // Durante diálogos se prioriza la estabilidad de la conversación y orientación.
      if (dialogueStateRef.current !== "dismissed") {
        stop();
        if (
          dialogueStateRef.current === "entering" ||
          dialogueStateRef.current === "visible"
        ) {
          setLastDirection("1");
        }
        // Corrección física mínima si hay contacto directo para evitar superposiciones
        if (pushResult.pushVector) {
          const pushSpeed = NPC_COLLISION_DEFAULTS.pushSpeed;
          const pDx = pushResult.pushVector.vx * pushSpeed * dt;
          const pDy = pushResult.pushVector.vy * pushSpeed * dt;
          setPlayerPos((prev) => {
            const nextX = prev.x + pDx;
            const nextY = prev.y + pDy;
            if (isPositionWalkable(nextX, nextY)) {
              return { x: nextX, y: nextY };
            }
            return prev;
          });
        }
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      let dirX = 0;
      let dirY = 0;
      if (keysPressed["arrowdown"] || keysPressed["s"]) {
        dirY = 1;
        setLastDirection("1");
      } else if (keysPressed["arrowup"] || keysPressed["w"]) {
        dirY = -1;
        setLastDirection("3");
      } else if (keysPressed["arrowleft"] || keysPressed["a"]) {
        dirX = -1;
        setLastDirection("2");
      } else if (keysPressed["arrowright"] || keysPressed["d"]) {
        dirX = 1;
        setLastDirection("4");
      }

      const isInputActive = dirX !== 0 || dirY !== 0;
      keyHoldTime = isInputActive ? Math.min(RAMP_TIME, keyHoldTime + dt) : 0;

      const rampFactor = isInputActive
        ? Math.pow(keyHoldTime / RAMP_TIME, 2)
        : 0;
      const targetVx = dirX * maxSpeed * rampFactor;
      const targetVy = dirY * maxSpeed * rampFactor;
      const blend = Math.min(1, (isInputActive ? 16.0 : frictionRate) * dt);
      velocity.x += ((isInputActive ? targetVx : 0) - velocity.x) * blend;
      velocity.y += ((isInputActive ? targetVy : 0) - velocity.y) * blend;
      if (!isInputActive && Math.abs(velocity.x) < 0.04) velocity.x = 0;
      if (!isInputActive && Math.abs(velocity.y) < 0.04) velocity.y = 0;

      const pushSpeed = NPC_COLLISION_DEFAULTS.pushSpeed;
      const pushDx = pushResult.pushVector
        ? pushResult.pushVector.vx * pushSpeed * dt
        : 0;
      const pushDy = pushResult.pushVector
        ? pushResult.pushVector.vy * pushSpeed * dt
        : 0;
      const isPushing = pushResult.pushVector !== null;

      const hasMovement =
        Math.hypot(velocity.x, velocity.y) > 0.01 || isPushing;
      setIsWalking(hasMovement);

      // Si no hay input de teclado pero hay empuje de un NPC, orientar al personaje según el empuje
      if (!isInputActive && isPushing && pushResult.pushVector) {
        if (
          Math.abs(pushResult.pushVector.vy) >
          Math.abs(pushResult.pushVector.vx)
        ) {
          setLastDirection(pushResult.pushVector.vy > 0 ? "1" : "3");
        } else {
          setLastDirection(pushResult.pushVector.vx > 0 ? "4" : "2");
        }
      }

      if (hasMovement) {
        let dx = velocity.x * dt + pushDx;
        let dy = velocity.y * dt + pushDy;

        // Si el jugador intenta caminar hacia el NPC que lo empuja, anular esa penetración
        if (isPushing && pushResult.pushVector) {
          if (pushResult.pushVector.vx > 0 && dx < pushDx) {
            dx = pushDx;
          } else if (pushResult.pushVector.vx < 0 && dx > pushDx) {
            dx = pushDx;
          }
        }

        setPlayerPos((prev) => {
          let effectiveDx = dx;
          let effectiveDy = dy;

          const isInsideRightPath =
            prev.y >= PLAZA_BOUNDS.rightPathTopY &&
            prev.y <= PLAZA_BOUNDS.rightPathBottomY &&
            prev.x > getBaseRightBoundaryX(prev.y);

          // Deslizamiento sobre los bordes diagonales de la explanada
          if (!isInsideRightPath) {
            if (dx < 0 && prev.x <= getLeftBoundaryX(prev.y) + 0.6) {
              effectiveDy += Math.abs(dx) * 0.75;
            }
            if (dx > 0 && prev.x >= getRightBoundaryX(prev.y) - 0.6) {
              effectiveDy += Math.abs(dx) * 0.75;
            }
          }

          const isTargetWalkable = (tx: number, ty: number): boolean => {
            return (
              isPositionWalkable(tx, ty) &&
              !isPositionBlockedByIdleNpc({ x: tx, y: ty }, npcsRef.current)
            );
          };

          const rawTargetX = prev.x + effectiveDx;
          const rawTargetY = prev.y + effectiveDy;
          if (isTargetWalkable(rawTargetX, rawTargetY)) {
            return { x: rawTargetX, y: rawTargetY };
          }

          // Deslizamiento sobre la mesa directiva
          const mesaSlide = tryPolygonWallSlide(
            prev,
            effectiveDx,
            effectiveDy,
            OBJECT_COLLISION_BOXES.mesa,
            isTargetWalkable,
          );
          if (mesaSlide) return mesaSlide;

          // Pasillo lateral derecho
          if (isInsideRightPath) {
            const pathY = Math.min(
              PLAZA_BOUNDS.rightPathBottomY,
              Math.max(PLAZA_BOUNDS.rightPathTopY, rawTargetY),
            );
            const pathX = Math.min(
              PLAZA_BOUNDS.rightPathMaxX,
              Math.max(getBaseRightBoundaryX(pathY), rawTargetX),
            );
            if (isTargetWalkable(pathX, pathY)) return { x: pathX, y: pathY };
          }

          const clampedY = Math.min(
            PLAZA_BOUNDS.maxY,
            Math.max(PLAZA_BOUNDS.minY, rawTargetY),
          );
          const clampedX = Math.min(
            getRightBoundaryX(clampedY),
            Math.max(getLeftBoundaryX(clampedY), rawTargetX),
          );
          if (isTargetWalkable(clampedX, clampedY)) {
            return { x: clampedX, y: clampedY };
          }
          if (isTargetWalkable(clampedX, prev.y)) {
            return { x: clampedX, y: prev.y };
          }
          if (isTargetWalkable(prev.x, clampedY)) {
            return { x: prev.x, y: clampedY };
          }

          velocity.x = 0;
          velocity.y = 0;
          return prev;
        });
      } else {
        setIsWalking(false);
      }

      animationFrameId = requestAnimationFrame(updateGameLoop);
    };

    animationFrameId = requestAnimationFrame(updateGameLoop);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, []);

  // Camara cinematográfica dinámica: sigue suavemente al primer NPC al entrar,
  // espera 2.5s en la mampara y regresa suavemente al jugador
  const zoomScale = 2.0;
  const { camX, camY } = useCinematicNpcCamera({
    playerPos,
    firstNpc: npcs.find((n) => n.id === "npc-gen-mampara-3") || npcs[0],
    isPaused,
    zoomScale,
    holdDurationMs: 2500,
  });

  const introMessages =
    language === "nah" ? INTRO_CAP2_MESSAGES_NAH : INTRO_CAP2_MESSAGES_ES;
  const showDialogue =
    dialogueState !== "initial_delay" && dialogueState !== "dismissed";

  // Sistema de profundidad visual dinámica (Fase 5.3 + 5.4):
  // Memoiza el arreglo de entidades y reutiliza el caché O(N) si no hay cambios en la posición vertical
  const depthMap = useMemo(() => {
    const characters: DepthEntity[] = [
      { id: "player", y: playerPos.y },
      ...npcs
        .filter((n) => n.isActive)
        .map((n) => ({ id: n.id, y: n.position.y })),
    ];
    return calculateSceneCharactersDepth(characters);
  }, [playerPos.y, npcs]);

  return (
    <div
      data-testid="chapter-scene-2"
      className="absolute inset-0 w-full h-full z-20 overflow-hidden bg-[#2d572c] select-none"
    >
      {/* HUD: volver al menu (abre el modal de confirmacion) */}
      <div className="absolute top-3 left-3 z-30 pointer-events-none">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRequestExit();
          }}
          aria-label="Volver al menú principal"
          className={`pointer-events-auto bg-[#f9d7ea] hover:bg-[#f6c2e0] rounded-md ring-2 ring-white ring-inset active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center cursor-pointer font-mono font-black text-black shrink-0 ${
            isFullscreen
              ? "w-12 h-12 text-xl border-[4px] border-[#b5146c] shadow-[4px_4px_0px_0px_#7a0c47]"
              : "w-9 h-9 text-sm border-[3px] border-[#b5146c] shadow-[3px_3px_0px_0px_#7a0c47]"
          }`}
        >
          <span>◀</span>
        </button>
      </div>

      {/* MUNDO CON CAMARA DINAMICA */}
      <div
        className="absolute inset-0 w-full h-full z-10"
        style={{
          transform: `scale(${zoomScale}) translate(${camX}%, ${camY}%)`,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        <img
          src={stageImageUrl}
          alt="Explanada con la casilla instalada"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          style={{ imageRendering: "pixelated" }}
        />

        {/* PERSONAJE */}
        <div
          style={{
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,
            width: "6.5%",
            transform: "translate(-50%, -90%)",
            willChange: "left, top",
            zIndex:
              depthMap["player"] ??
              calculateCharacterZIndex(playerPos.y, "player"),
          }}
          className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
        >
          <AnimatedPlayerSprite
            isWalking={isWalking}
            lastDirection={lastDirection}
          />
        </div>

        {/* CIUDADANOS VOTANTES (NPCS GENÉRICOS) */}
        {npcs.map((npc) => (
          <div
            key={npc.id}
            data-testid={`generic-npc-${npc.id}`}
            style={{
              left: `${npc.position.x}%`,
              top: `${npc.position.y}%`,
              width: GENERIC_NPC_DEFAULTS.spriteWidthPercent,
              transform: "translate(-50%, -90%)",
              willChange: "left, top",
              zIndex:
                depthMap[npc.id] ??
                calculateCharacterZIndex(npc.position.y, npc.id),
            }}
            className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
          >
            <GenericNpcSprite
              animation={npc.currentAnimation}
              isPaused={isPaused}
            />
          </div>
        ))}

        {/* MAMPARAS */}
        {CASILLA_POSITIONS.map((pos, index) => (
          <div
            key={`casilla-item-${index}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: CASILLA_WIDTH,
              transform: "translate(-50%, -90%)",
              zIndex: NPC_DEPTH_LAYERS.mamparaLayer,
            }}
            className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
          >
            <img
              src="/assets/juego/casilla.png"
              alt={`Casilla Electoral ${index + 1}`}
              className="relative z-10 w-full h-auto object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        ))}

        {/* MESA DIRECTIVA */}
        <div
          style={{
            left: `${MESA_POSITION.x}%`,
            top: `${MESA_POSITION.y}%`,
            width: MESA_WIDTH,
            transform: "translate(-50%, -90%)",
            zIndex:
              playerPos.y >= MESA_POSITION.y ||
              (playerPos.y > 56.6 && playerPos.x >= 20.8) ||
              (playerPos.y <= 56.6 && playerPos.x >= 24.8)
                ? NPC_DEPTH_LAYERS.mamparaLayer
                : NPC_DEPTH_LAYERS.mesaBehindLayer,
          }}
          className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
        >
          <img
            src="/assets/juego/mesa.png"
            alt="Mesa Directiva de Casilla"
            className="relative z-10 w-full h-auto object-contain"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        {/* DECORACIONES */}
        {DECORACIONES_LIST.map((deco) => {
          const pos = DECORACIONES_POSITIONS[deco.key];
          return (
            <div
              key={`deco-item-${deco.id}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: deco.width,
                transform: "translate(-50%, -90%)",
                zIndex:
                  deco.key === "cartel3"
                    ? NPC_DEPTH_LAYERS.cartel3Foreground
                    : playerPos.y >= pos.y
                      ? NPC_DEPTH_LAYERS.mamparaLayer
                      : NPC_DEPTH_LAYERS.mesaBehindLayer,
              }}
              className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
            >
              <img
                src={deco.sprite}
                alt={deco.name}
                className="relative z-10 w-full h-auto object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          );
        })}

        {/* BOLETAS SOBRE LAS MAMPARAS */}
        {BOLETAS_POSITIONS.map((pos, index) => {
          return (
            <div
              key={`boleta-item-${index}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: BOLETAS_SIZES[index] || BOLETA_WIDTH,
                transform: "translate(-50%, -90%)",
                zIndex: NPC_DEPTH_LAYERS.boletaLayer,
              }}
              className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
            >
              <img
                src="/assets/juego/boleta.png"
                alt={`Boleta Electoral ${index + 1}`}
                className="relative z-10 w-full h-auto object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          );
        })}

        {/* ARBUSTOS EN PRIMER PLANO */}
        <img
          src="/assets/juego/arbusto-izquierda.png"
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-[30.6%] h-auto object-contain pointer-events-none select-none z-30"
          style={{ imageRendering: "pixelated" }}
        />
        <img
          src="/assets/juego/arbusto-derecha.png"
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 right-0 w-[26%] h-auto object-contain pointer-events-none select-none z-30"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      {/* DIALOGO DE INICIO DEL CAPITULO 2 */}
      {showDialogue && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-center pb-[1.8cqw] px-[2cqw] overflow-hidden select-none">
          <div className="relative z-10 w-[96%] pointer-events-auto flex flex-col items-end">
            {/* Botón provisional para saltar todos los textos (Test) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDialogueState("exiting");
              }}
              type="button"
              title="Saltar todos los textos con un solo clic (Test)"
              className="mb-1.5 bg-[#940d57] hover:bg-[#ff2a85] active:bg-[#780946] text-white rounded border-[2px] border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-colors flex items-center gap-1.5 px-3 py-1 select-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              style={{
                fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                fontSize: isFullscreen ? "10px" : "8px",
              }}
            >
              <span>⏩</span>
              <span>SALTAR TEXTOS (TEST)</span>
            </button>

            <PixelSpeechBubble
              speaker={language === "nah" ? "Inecito Cívica" : "Inecito"}
              messages={introMessages}
              actionKey="E"
              disabled={isPaused}
              isDismissing={dialogueState === "exiting"}
              onLineChange={() => {
                setIsWalking(false);
                setLastDirection("1");
              }}
              onDismiss={() => setDialogueState("exiting")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
