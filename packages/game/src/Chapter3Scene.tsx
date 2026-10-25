import React, { useState, useEffect, useRef } from "react";
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
  EXCLAMATION_ICON_POSITIONS,
  EXCLAMATION_ICON_WIDTH,
} from "./GameplayScene";
import type { ChapterSceneProps } from "./features/capitulos/ChapterSceneRouter";
import {
  getChapterHandoff,
  CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES,
  CAP2_OUTRO_CAP3_INTRO_MESSAGES_NAH,
  type PlayerDirection,
} from "./features/capitulos/chapterHandoff";
import {
  calculateCharacterZIndex,
  NPC_DEPTH_LAYERS,
} from "./features/npcs";
import { CastShadow, DECORATION_SHADOWS } from "./features/sombras";

/**
 * Capítulo 3: "Aprende a votar".
 * Continúa en la explanada de la casilla electoral.
 * - Inicia con el teclado bloqueado por unos segundos (INTRO_DELAY_MS = 2500ms).
 * - Aparece el diálogo de apertura de Inecito (sin retrato arriba y sin blur de fondo).
 * - Al concluir o saltar el diálogo, se desbloquean los controles para continuar con el gameplay.
 * - Al terminar el capítulo, espera 2.5 segundos antes de salir (idéntico a Cap 1 y Cap 2).
 */

const INTRO_DELAY_MS = 2500;

/** Posición por defecto (modo CAPÍTULOS): en el centro de la explanada (idéntico al inicio de JUGAR / Cap 1). */
const DEFAULT_PLAYER_POS = { x: 50, y: 62 };

type DialogueState =
  | "initial_delay"
  | "entering"
  | "visible"
  | "exiting"
  | "dismissed";

type BallotState = "on_table" | "picking_up" | "inspecting";

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

export default function Chapter3Scene({
  language = "es",
  stageImageUrl = "/assets/juego/escenario.png",
  isFullscreen,
  isTransitioning,
  isPaused,
  onRequestExit,
  onChapterComplete,
}: ChapterSceneProps) {
  const hasSeenBridge = Boolean(getChapterHandoff()?.fromChapter2Ending);

  // Posición y orientación del protagonista (traspaso continuo de posición)
  const [playerPos, setPlayerPos] = useState(
    () => getChapterHandoff()?.playerPos ?? DEFAULT_PLAYER_POS,
  );
  const [lastDirection, setLastDirection] = useState<PlayerDirection>(
    () => getChapterHandoff()?.lastDirection ?? "1",
  );
  const [isWalking, setIsWalking] = useState(false);

  // Estado del diálogo inicial de apertura: inicia bloqueado por 2.5 segundos
  const [dialogueState, setDialogueState] = useState<DialogueState>(() =>
    hasSeenBridge ? "dismissed" : "initial_delay",
  );
  const dialogueStateRef = useRef(dialogueState);
  useEffect(() => {
    dialogueStateRef.current = dialogueState;
  }, [dialogueState]);

  const playerPosRef = useRef(playerPos);
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);

  const lastDirectionRef = useRef(lastDirection);
  useEffect(() => {
    lastDirectionRef.current = lastDirection;
  }, [lastDirection]);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const onChapterCompleteRef = useRef(onChapterComplete);
  useEffect(() => {
    onChapterCompleteRef.current = onChapterComplete;
  }, [onChapterComplete]);

  // Mampara elegida para el simulador de voto (vista POV)
  const [selectedMamparaIndex, setSelectedMamparaIndex] = useState<number | null>(
    null,
  );
  const selectedMamparaIndexRef = useRef(selectedMamparaIndex);
  useEffect(() => {
    selectedMamparaIndexRef.current = selectedMamparaIndex;
  }, [selectedMamparaIndex]);

  // Estado de la boleta electoral en la mesa / manos del jugador
  const [ballotState, setBallotState] = useState<BallotState>("on_table");

  const handleBallotClick = () => {
    if (ballotState === "on_table") {
      setBallotState("picking_up");
      setTimeout(() => {
        setBallotState("inspecting");
      }, 700);
    }
  };

  const chapter3CompletedRef = useRef(false);

  // Ciclo de transición del diálogo de apertura (2.5s teclado bloqueado)
  useEffect(() => {
    if (isTransitioning) return;

    if (dialogueState === "initial_delay") {
      const timer = setTimeout(() => {
        setDialogueState("entering");
      }, INTRO_DELAY_MS);
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

  // Liberar recursos al desmontar
  useEffect(() => {
    return () => {
      releasePlayerImages();
    };
  }, []);

  // Bucle de movimiento del jugador: se mantiene estrictamente bloqueado
  // mientras el diálogo inicial o la pausa estén activos
  useEffect(() => {
    const keysPressed: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed[key] = true;

      // Presionar E cerca de una mampara para entrar a votar (iniciar vista POV)
      if (key === "e") {
        if (
          dialogueStateRef.current === "dismissed" &&
          selectedMamparaIndexRef.current === null &&
          !isPausedRef.current
        ) {
          let closestIdx = -1;
          let closestDist = Infinity;
          CASILLA_POSITIONS.forEach((pos, idx) => {
            const iconPos = EXCLAMATION_ICON_POSITIONS.casillas[idx];
            const dist = Math.min(
              Math.hypot(
                playerPosRef.current.x - pos.x,
                playerPosRef.current.y - pos.y,
              ),
              Math.hypot(
                playerPosRef.current.x - iconPos.x,
                playerPosRef.current.y - iconPos.y,
              ),
            );
            if (dist < closestDist) {
              closestDist = dist;
              closestIdx = idx;
            }
          });

          if (closestIdx !== -1 && closestDist < 8.5) {
            e.preventDefault();
            setSelectedMamparaIndex(closestIdx);
          }
        }
      }

      // Salir de la mampara con Escape si está en vista POV
      if (key === "escape") {
        if (selectedMamparaIndexRef.current !== null && !isPausedRef.current) {
          e.preventDefault();
          setSelectedMamparaIndex(null);
          setBallotState("on_table");
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed[key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let animationFrameId: number;
    let lastTime = performance.now();

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
      if (typeof document !== "undefined" && document.hidden) {
        lastTime = currentTime;
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      // Modal de pausa abierto: congelar
      if (isPausedRef.current) {
        stop();
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      // Controles congelados si la vista de mampara POV está abierta
      if (selectedMamparaIndexRef.current !== null) {
        stop();
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      // Teclado bloqueado mientras el diálogo inicial esté activo o en delay
      if (dialogueStateRef.current !== "dismissed") {
        stop();
        if (
          dialogueStateRef.current === "entering" ||
          dialogueStateRef.current === "visible"
        ) {
          setLastDirection("1");
        }
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      // 1. Leer entradas de movimiento y calcular velocidad deseada
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

      const voluntaryDx = velocity.x * dt;
      const voluntaryDy = velocity.y * dt;

      const hasMovement =
        Math.hypot(velocity.x, velocity.y) > 0.01 || isInputActive;
      setIsWalking(hasMovement);

      if (Math.hypot(voluntaryDx, voluntaryDy) > 0.0001) {
        setPlayerPos((prev) => {
          let effectiveDx = voluntaryDx;
          let effectiveDy = voluntaryDy;

          const isInsideRightPath =
            prev.y >= PLAZA_BOUNDS.rightPathTopY &&
            prev.y <= PLAZA_BOUNDS.rightPathBottomY &&
            prev.x > getBaseRightBoundaryX(prev.y);

          // Deslizamiento sobre los bordes diagonales de la explanada (CONSERVADO INTACTO)
          if (!isInsideRightPath) {
            if (voluntaryDx < 0 && prev.x <= getLeftBoundaryX(prev.y) + 0.6) {
              effectiveDy += Math.abs(voluntaryDx) * 0.75;
            }
            if (voluntaryDx > 0 && prev.x >= getRightBoundaryX(prev.y) - 0.6) {
              effectiveDy += Math.abs(voluntaryDx) * 0.75;
            }
          }

          const rawTargetX = prev.x + effectiveDx;
          const rawTargetY = prev.y + effectiveDy;

          if (isPositionWalkable(rawTargetX, rawTargetY)) {
            return { x: rawTargetX, y: rawTargetY };
          }

          // Deslizamiento sobre la mesa directiva (tryPolygonWallSlide)
          const mesaSlide = tryPolygonWallSlide(
            prev,
            effectiveDx,
            effectiveDy,
            OBJECT_COLLISION_BOXES.mesa,
            isPositionWalkable,
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
            if (isPositionWalkable(pathX, pathY)) return { x: pathX, y: pathY };
          }

          const clampedY = Math.min(
            PLAZA_BOUNDS.maxY,
            Math.max(PLAZA_BOUNDS.minY, rawTargetY),
          );
          const clampedX = Math.min(
            getRightBoundaryX(clampedY),
            Math.max(getLeftBoundaryX(clampedY), rawTargetX),
          );
          if (isPositionWalkable(clampedX, clampedY)) {
            return { x: clampedX, y: clampedY };
          }
          if (isPositionWalkable(clampedX, prev.y)) {
            return { x: clampedX, y: prev.y };
          }
          if (isPositionWalkable(prev.x, clampedY)) {
            return { x: prev.x, y: clampedY };
          }

          velocity.x = 0;
          velocity.y = 0;
          return prev;
        });
      }

      animationFrameId = requestAnimationFrame(updateGameLoop);
    };

    animationFrameId = requestAnimationFrame(updateGameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Completar capítulo (con los 2.5 segundos de espera idénticos a Cap 1 y Cap 2)
  const handleTriggerComplete = () => {
    if (chapter3CompletedRef.current) return;
    chapter3CompletedRef.current = true;
    setTimeout(() => {
      onChapterCompleteRef.current?.();
    }, 2500);
  };

  const showIntroDialogue =
    dialogueState !== "initial_delay" && dialogueState !== "dismissed";

  // Cámara dinámica con zoom 2.0x y seguimiento continuo a Inecito (idéntico a Cap 1 y Cap 2)
  const zoomScale = 2.0;
  const maxCamShift = (1 - 1 / zoomScale) * 50; // Límite máximo de desplazamiento (25%) para no exponer bordes
  const rawCamX = 50 - playerPos.x;
  const rawCamY = 50 - playerPos.y;
  const camX = Math.min(maxCamShift, Math.max(-maxCamShift, rawCamX));
  const camY = Math.min(maxCamShift, Math.max(-maxCamShift, rawCamY));

  return (
    <div
      data-testid="chapter-scene-3"
      className="absolute inset-0 w-full h-full z-20 overflow-hidden bg-[#2d572c] select-none"
    >
      {/* BOTÓN HUD REGRESAR AL MENÚ */}
      <div className="absolute top-3 left-3 z-50 pointer-events-none">
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

      {/* MUNDO CON CÁMARA DINÁMICA (ZOOM 2.0x Y SEGUIMIENTO A INECITO) */}
      <div
        className="absolute inset-0 w-full h-full z-10"
        style={{
          transform: `scale(${zoomScale}) translate(${camX}%, ${camY}%)`,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        {/* ESCENARIO BASE PIXEL ART */}
        <img
          src={stageImageUrl}
          alt="Escenario Casilla"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ imageRendering: "pixelated" }}
        />

        {/* PERSONAJE PROTAGONISTA (INECITO) */}
        <div
          style={{
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,
            width: "6.5%",
            transform: "translate(-50%, -90%)",
            willChange: "left, top",
            zIndex: calculateCharacterZIndex(playerPos.y, "player"),
          }}
          className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
        >
          <AnimatedPlayerSprite
            isWalking={isWalking}
            lastDirection={lastDirection}
          />
        </div>

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
            <CastShadow src="/assets/juego/casilla.png" preset="tall" />
            <img
              src="/assets/juego/casilla.png"
              alt={`Mampara Electoral ${index + 1}`}
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
          <CastShadow src="/assets/juego/mesa.png" preset="mesa" />
          <img
            src="/assets/juego/mesa.png"
            alt="Mesa Directiva de Casilla"
            className="relative z-10 w-full h-auto object-contain"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        {/* DECORACIONES DE CASILLA */}
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
              {DECORATION_SHADOWS[deco.key] && (
                <CastShadow
                  src={deco.sprite}
                  preset={DECORATION_SHADOWS[deco.key].preset}
                  overrides={DECORATION_SHADOWS[deco.key].overrides}
                />
              )}
              <img
                src={deco.sprite}
                alt={deco.name}
                className="relative z-10 w-full h-auto object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          );
        })}

        {/* BOLETAS SOBRE LAS MESAS DE LAS MAMPARAS */}
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

        {/* ARBUSTOS DEL PRIMER PLANO */}
        <img
          src="/assets/juego/arbusto-izquierda.png"
          alt="Arbustos Izquierda"
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-[30.6%] h-auto object-contain pointer-events-none select-none z-30"
          style={{ imageRendering: "pixelated" }}
        />
        <img
          src="/assets/juego/arbusto-derecha.png"
          alt="Arbustos Derecha"
          aria-hidden="true"
          className="absolute bottom-0 right-0 w-[26%] h-auto object-contain pointer-events-none select-none z-30"
          style={{ imageRendering: "pixelated" }}
        />

        {/* ICONOS DE EXCLAMACIÓN (!) EN TODAS LAS MAMPARAS TRAS CONCLUIR EL DIÁLOGO INICIAL */}
        {dialogueState === "dismissed" &&
          selectedMamparaIndex === null &&
          CASILLA_POSITIONS.map((pos, index) => {
            const iconPos = EXCLAMATION_ICON_POSITIONS.casillas[index];
            const dist = Math.min(
              Math.hypot(playerPos.x - pos.x, playerPos.y - pos.y),
              Math.hypot(playerPos.x - iconPos.x, playerPos.y - iconPos.y),
            );
            const isNearThisMampara = dist < 8.5;

            return (
              <div
                key={`mampara-voting-spot-${index}`}
                style={{
                  left: `${iconPos.x}%`,
                  top: `${iconPos.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 35,
                }}
                className="absolute pointer-events-auto flex flex-col items-center select-none cursor-pointer"
                onClick={() => {
                  if (isNearThisMampara) {
                    setSelectedMamparaIndex(index);
                  }
                }}
              >
                {/* Signo de exclamación flotante sobre la mampara */}
                <div
                  className="flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                  style={{
                    width: EXCLAMATION_ICON_WIDTH,
                    animation: "floatExclamation 1.4s ease-in-out infinite",
                  }}
                  title={`Mampara electoral ${index + 1}`}
                >
                  <img
                    src="/assets/juego/exclamacion.png"
                    alt={`Elegir Mampara ${index + 1}`}
                    className="w-full h-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>

                {/* Texto pixel art "presiona E" al acercarse */}
                {isNearThisMampara && (
                  <div
                    className="absolute -top-[32%] left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center select-none"
                    style={{
                      animation: "floatPrompt 1.4s ease-in-out infinite",
                    }}
                  >
                    <div
                      className="whitespace-nowrap text-[#ff4da6] font-black tracking-wider flex items-center gap-1 select-none"
                      style={{
                        fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                        fontSize: isFullscreen
                          ? "clamp(6.5px, 0.68cqw, 10px)"
                          : "clamp(4.5px, 0.48cqw, 6px)",
                        lineHeight: "1",
                        textShadow:
                          "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 4px rgba(0,0,0,0.9)",
                      }}
                    >
                      <span>presiona</span>
                      <span className="text-[#ff99d6]">E</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* ESTILOS DE ANIMACIÓN PIXEL ART */}
      <style>{`
        @keyframes floatExclamation {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        @keyframes floatPrompt {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        @keyframes povEntrance {
          0% {
            opacity: 0;
            transform: scale(0.97);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      {/* BOTÓN TEST: COMPLETAR CAPÍTULO 3 (VISTA GENERAL) */}
      {dialogueState === "dismissed" && selectedMamparaIndex === null && (
        <div className="absolute top-3 right-3 z-50 pointer-events-auto">
          <button
            type="button"
            id="chapter-3-complete"
            data-testid="chapter-complete-button"
            onClick={handleTriggerComplete}
            title="Completar capítulo (Test)"
            className="bg-[#b5146c] hover:bg-[#ff2a85] active:bg-[#780946] text-white border-[2px] border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded select-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            style={{
              fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
              fontSize: isFullscreen ? "10px" : "8px",
            }}
          >
            <span>✔</span>
            <span>TERMINAR CAPÍTULO (TEST)</span>
          </button>
        </div>
      )}

      {/* VISTA EN PRIMERA PERSONA (POV): SIMULADOR DE VOTO EN MAMPARA */}
      {selectedMamparaIndex !== null && (
        <div
          data-testid="voting-booth-pov"
          className="absolute inset-0 w-full h-full z-40 flex flex-col items-center justify-center overflow-hidden bg-black select-none"
          style={{
            animation: "povEntrance 0.35s ease-out forwards",
          }}
        >
          {/* IMAGEN POV DE LA MAMPARA CON TRANSICIÓN DE DESENFOQUE (BLUR) */}
          <img
            src="/assets/juego/simulador-voto/mampara-pov.png"
            alt={`Mampara electoral ${selectedMamparaIndex + 1} - Vista POV`}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-all duration-700 ease-out"
            style={{
              imageRendering: "pixelated",
              filter:
                ballotState !== "on_table"
                  ? "blur(7px) brightness(0.85)"
                  : "blur(0px) brightness(1)",
              transform:
                ballotState !== "on_table" ? "scale(1.04)" : "scale(1)",
            }}
          />

          {/* CAPA OVERLAY TRANSLÚCIDA PARA REALZAR EL ENFOQUE DE LA BOLETA */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ease-out ${
              ballotState !== "on_table"
                ? "opacity-100 bg-black/20"
                : "opacity-0"
            }`}
          />

          {/* CONTENEDOR DE LA BOLETA ELECTORAL INTERACTIVA */}
          <div
            data-testid="voting-booth-ballot-container"
            className="absolute inset-0 w-full h-full pointer-events-none z-30"
          >
            <div
              onClick={handleBallotClick}
              role="button"
              tabIndex={0}
              aria-label="Boleta electoral para votar"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleBallotClick();
                }
              }}
              style={{
                position: "absolute",
                imageRendering: "pixelated",
                cursor: ballotState === "on_table" ? "pointer" : "default",
                pointerEvents: "auto",
                transition: "all 750ms cubic-bezier(0.16, 1, 0.3, 1)",
                left: "50%",
                top: ballotState === "on_table" ? "63%" : "50%",
                height: ballotState === "on_table" ? "42%" : "95%",
                width: "auto",
                maxHeight: ballotState === "on_table" ? "42%" : "95%",
                transformOrigin: "center center",
                transform:
                  ballotState === "on_table"
                    ? "translate(-50%, -50%) perspective(650px) rotateX(46deg) rotateZ(-3deg) scale(1.0)"
                    : "translate(-50%, -50%) perspective(1000px) rotateX(0deg) rotateZ(0deg) scale(1)",
                filter:
                  ballotState === "on_table"
                    ? "drop-shadow(0px 8px 12px rgba(0,0,0,0.5))"
                    : "drop-shadow(0px 20px 40px rgba(0,0,0,0.8))",
              }}
              className={`select-none ${
                ballotState === "on_table"
                  ? "hover:brightness-105 active:scale-95"
                  : ""
              }`}
            >
              <img
                src="/assets/juego/simulador-voto/boleta-electoral.png"
                alt="Boleta Electoral 2024"
                className="h-full w-auto object-contain pointer-events-none select-none"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* DIÁLOGO DE APERTURA DEL CAPÍTULO 3 (SIN RETRATO ARRIBA Y SIN BLUR) */}
      {showIntroDialogue && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-center pb-[1.8cqw] px-[2cqw] overflow-hidden select-none">
          <div className="relative z-10 w-[96%] pointer-events-auto flex flex-col items-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDialogueState("exiting");
              }}
              type="button"
              title="Saltar diálogo inicial (Test)"
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
              messages={
                language === "nah"
                  ? (CAP2_OUTRO_CAP3_INTRO_MESSAGES_NAH as unknown as string[])
                  : (CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES as unknown as string[])
              }
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
