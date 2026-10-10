import React, { useState, useEffect, useRef, useCallback } from "react";
import { PixelFullscreenButton } from "./PixelFullscreenButton";
import { PixelSpeechBubble, DialogueLine } from "./PixelSpeechBubble";

export interface GameProps {
  onModuleComplete?: (moduleName: "mitos" | "simulador") => void;
  language?: "es" | "nah";
  splashImageUrl?: string;
  stageImageUrl?: string;
}

function PixelBallotBoxIcon({ isFullscreen }: { isFullscreen?: boolean }) {
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center select-none ${isFullscreen ? "w-10 h-10" : "w-8 h-8"}`}
    >
      <svg
        width={isFullscreen ? "40" : "32"}
        height={isFullscreen ? "40" : "32"}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={isFullscreen ? "w-10 h-10" : "w-8 h-8"}
        style={{ imageRendering: "pixelated" }}
      >
        {/* White ballot dropping into box */}
        <rect
          x="9"
          y="1"
          width="6"
          height="7"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="1.5"
        />
        {/* Magenta box body */}
        <rect
          x="3"
          y="7"
          width="18"
          height="14"
          rx="1"
          fill="#9d2b70"
          stroke="#000000"
          strokeWidth="1.5"
        />
        {/* Slot line */}
        <line x1="6" y1="7" x2="18" y2="7" stroke="#000000" strokeWidth="2" />
      </svg>
    </div>
  );
}

function PixelQuestionDocIcon({ isFullscreen }: { isFullscreen?: boolean }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0 select-none">
      <span
        className={`text-black font-mono font-black leading-none mr-0.5 ${isFullscreen ? "text-2xl sm:text-3xl" : "text-xl"}`}
      >
        ?
      </span>
      <svg
        width={isFullscreen ? "32" : "26"}
        height={isFullscreen ? "32" : "26"}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={isFullscreen ? "w-8 h-8" : "w-6 h-6"}
        style={{ imageRendering: "pixelated" }}
      >
        {/* Document sheet */}
        <rect
          x="4"
          y="2"
          width="16"
          height="20"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="1.5"
        />
        {/* Folded corner */}
        <path
          d="M14 2 L20 8 L14 8 Z"
          fill="#D1D5DB"
          stroke="#000000"
          strokeWidth="1"
        />
        {/* Text lines */}
        <line x1="7" y1="7" x2="13" y2="7" stroke="#000000" strokeWidth="1.5" />
        <line
          x1="7"
          y1="11"
          x2="17"
          y2="11"
          stroke="#000000"
          strokeWidth="1.5"
        />
        <line
          x1="7"
          y1="15"
          x2="17"
          y2="15"
          stroke="#000000"
          strokeWidth="1.5"
        />
        <line
          x1="7"
          y1="19"
          x2="13"
          y2="19"
          stroke="#000000"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

// Frame count definitions for each of the 8 character animation folders
const PLAYER_FRAME_COUNTS: Record<string, number> = {
  static1: 80,
  static2: 50,
  static3: 57,
  static4: 43,
  walking1: 26,
  walking2: 24,
  walking3: 22,
  walking4: 29,
};

// Preload all player animation frames into memory to eliminate image loading stutter
const PRELOADED_PLAYER_IMAGES: Record<string, HTMLImageElement[]> = {};

function preloadPlayerFolder(folder: string) {
  if (typeof window === "undefined" || PRELOADED_PLAYER_IMAGES[folder]) return;
  PRELOADED_PLAYER_IMAGES[folder] = [];
  const count = PLAYER_FRAME_COUNTS[folder] || 20;
  for (let i = 0; i < count; i++) {
    const img = new Image();
    img.src = `/assets/juego/player/${folder}/${i}.png`;
    PRELOADED_PLAYER_IMAGES[folder].push(img);
  }
}

// Animated Player Sprite Component (Plays high quality PNG frame animations from walking1-4 & static1-4)
function AnimatedPlayerSprite({
  isWalking,
  lastDirection,
}: {
  isWalking: boolean;
  lastDirection: "1" | "2" | "3" | "4";
}) {
  const [frameIndex, setFrameIndex] = useState(0);

  const currentFolder = isWalking
    ? `walking${lastDirection}`
    : `static${lastDirection}`;

  const totalFrames = PLAYER_FRAME_COUNTS[currentFolder] || 20;

  // Preload animation frames into memory on folder change
  useEffect(() => {
    preloadPlayerFolder(currentFolder);
  }, [currentFolder]);

  // Instantly reset frame index to 0 when direction or walking state changes
  useEffect(() => {
    setFrameIndex(0);
  }, [isWalking, lastDirection]);

  // Frame cycling interval (exactly 24 FPS = ~41.67ms per frame for smooth animation)
  useEffect(() => {
    const fps24Interval = 1000 / 24;
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % totalFrames);
    }, fps24Interval);

    return () => clearInterval(interval);
  }, [currentFolder, totalFrames]);

  const imageSrc = `/assets/juego/player/${currentFolder}/${frameIndex}.png`;

  return (
    <div className="relative flex flex-col items-center justify-center w-full shrink-0">
      <img
        src={imageSrc}
        alt="Personaje Principal"
        className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-md shrink-0"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}

// Centralized Plaza Collision Bounds (Edit these 9 numbers to dynamically adjust boundaries in real-time!)
export const PLAZA_BOUNDS = {
  topLeftX: 14, // Top-Left boundary % (at minY = 30%)
  bottomLeftX: 2, // Bottom-Left boundary % (at maxY = 93%)
  topRightX: 87, // Top-Right boundary % (at minY = 30%)
  bottomRightX: 98, // Bottom-Right boundary % (at maxY = 93%)
  minY: 30, // Top boundary %
  maxY: 93, // Bottom boundary %

  // Right Side Path Opening Parameters:
  rightPathTopY: 52, // Top Y% where the right path starts
  rightPathBottomY: 71, // Bottom Y% where the right path ends
  rightPathMaxX: 100, // Max X% inside the right path (walkable opening)
};

// Returns dynamic left boundary % at vertical position y (Slanted diagonal line)
const getLeftBoundaryX = (y: number): number => {
  if (PLAZA_BOUNDS.maxY === PLAZA_BOUNDS.minY) return PLAZA_BOUNDS.topLeftX;
  const progress = Math.min(
    1,
    Math.max(
      0,
      (y - PLAZA_BOUNDS.minY) / (PLAZA_BOUNDS.maxY - PLAZA_BOUNDS.minY),
    ),
  );
  return (
    PLAZA_BOUNDS.topLeftX +
    progress * (PLAZA_BOUNDS.bottomLeftX - PLAZA_BOUNDS.topLeftX)
  );
};

// Returns standard diagonal right boundary % at vertical position y
const getBaseRightBoundaryX = (y: number): number => {
  if (PLAZA_BOUNDS.maxY === PLAZA_BOUNDS.minY) return PLAZA_BOUNDS.topRightX;
  const progress = Math.min(
    1,
    Math.max(
      0,
      (y - PLAZA_BOUNDS.minY) / (PLAZA_BOUNDS.maxY - PLAZA_BOUNDS.minY),
    ),
  );
  return (
    PLAZA_BOUNDS.topRightX +
    progress * (PLAZA_BOUNDS.bottomRightX - PLAZA_BOUNDS.topRightX)
  );
};

// Returns dynamic right boundary % at vertical position y (splits into upper/lower boxes with side path opening)
const getRightBoundaryX = (y: number): number => {
  if (y >= PLAZA_BOUNDS.rightPathTopY && y <= PLAZA_BOUNDS.rightPathBottomY) {
    return PLAZA_BOUNDS.rightPathMaxX;
  }
  return getBaseRightBoundaryX(y);
};

// Stable constants for intro dialogue sequence (prevents re-render resets on fullscreen toggle)
const INTRO_MESSAGES_ES: string[] = [
  "¡Hola! Hoy es un día muy importante. ¡Es día de elecciones!",
  "Soy Inecito, funcionario de casilla, y mi misión es ayudar a que todas las personas puedan votar.",
  "Pero antes de recibir a nuestros primeros votantes... ¡tenemos mucho que preparar!",
];

const INTRO_MESSAGES_NAH: string[] = [
  "¡Niltze! Axkan se tonal tekitl. ¡Tonal tlaixquetzalistli!",
  "Nehwa Inecito, tekitketl casilla, wan notequi tlaiknelia nochimeh tlacameh ma tlateneuakan.",
  "Tel achto xikselikan tochantlakahuan... ¡miak tlamantli moneki timoyektlalikan!",
];

export function PixiGameCanvas({
  onModuleComplete,
  language = "es",
  splashImageUrl = "/assets/juego/menu.png",
  stageImageUrl = "/assets/juego/escenario.png",
}: GameProps) {
  const [currentScreen, setCurrentScreen] = useState<
    "splash" | "how_to_play" | "gameplay"
  >("splash");
  const [activeScene, setActiveScene] = useState<"mitos" | "simulador" | null>(
    null,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [irisRadius, setIrisRadius] = useState<number | null>(null);

  // Player Position & Direction State ("1"=S/down, "2"=A/left, "3"=W/up, "4"=D/right)
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 62 });
  const [lastDirection, setLastDirection] = useState<"1" | "2" | "3" | "4">(
    "1",
  );
  const [isWalking, setIsWalking] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Dynamic Dialogue Queue for plaza and NPC interactions
  const [activeDialogue, setActiveDialogue] = useState<Array<DialogueLine | string> | null>(null);

  // Intro Dialogue Speech Bubble State: "initial_delay" | "entering" | "visible" | "exiting" | "dismissed"
  const [dialogueState, setDialogueState] = useState<
    "initial_delay" | "entering" | "visible" | "exiting" | "dismissed"
  >("initial_delay");
  const dialogueStateRef = useRef(dialogueState);

  useEffect(() => {
    dialogueStateRef.current = dialogueState;
  }, [dialogueState]);

  // Dialogue delay & animation state transitions (Triggers exactly 2s after iris aperture fully opens)
  useEffect(() => {
    if (currentScreen !== "gameplay") {
      setDialogueState("initial_delay");
      return;
    }

    // Wait until retro iris wipe has fully completed and screen is open
    if (irisRadius !== null) {
      return;
    }

    if (dialogueState === "initial_delay") {
      const timer = setTimeout(() => {
        setDialogueState("entering");
      }, 2000);
      return () => clearTimeout(timer);
    } else if (dialogueState === "entering") {
      const timer = setTimeout(() => {
        setDialogueState("visible");
      }, 350);
      return () => clearTimeout(timer);
    } else if (dialogueState === "exiting") {
      const timer = setTimeout(() => {
        setDialogueState("dismissed");
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, irisRadius, dialogueState]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Retro Circle (Iris Wipe) Screen Transition Handler with SVG Mask
  const changeScreenWithTransition = useCallback(
    (
      targetScreen: "splash" | "gameplay",
      targetScene: "mitos" | "simulador" | null = null,
    ) => {
      if (irisRadius !== null) return;

      const shrinkDuration = 380; // 380ms circle shrink
      const blackHoldTime = 300; // 300ms hold in solid black
      const growDuration = 380; // 380ms circle grow
      const startTime = performance.now();

      // Step 1: Shrink circle from 800 down to 0 (to center)
      const animateShrink = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / shrinkDuration);
        const ease =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const currentR = 800 * (1 - ease);
        setIrisRadius(currentR);

        if (progress < 1) {
          requestAnimationFrame(animateShrink);
        } else {
          // Midpoint: Screen is 100% solid black
          setIrisRadius(0);
          setCurrentScreen(targetScreen);
          if (targetScreen === "splash") {
            setActiveScene(null);
            // Reset character state & game progress hidden behind solid black curtain
            setPlayerPos({ x: 50, y: 62 });
            setIsWalking(false);
            setLastDirection("1");
            setDialogueState("initial_delay");
          } else {
            setActiveScene(targetScene);
            setDialogueState("initial_delay");
          }

          setTimeout(() => {
            // Step 2: Grow circle from 0 up to 800
            const openStartTime = performance.now();
            const animateGrow = (openNow: number) => {
              const openElapsed = openNow - openStartTime;
              const openProgress = Math.min(1, openElapsed / growDuration);
              const openEase =
                openProgress < 0.5
                  ? 2 * openProgress * openProgress
                  : 1 - Math.pow(-2 * openProgress + 2, 2) / 2;

              const growR = 800 * openEase;
              setIrisRadius(growR);

              if (openProgress < 1) {
                requestAnimationFrame(animateGrow);
              } else {
                setIrisRadius(null);
              }
            };
            requestAnimationFrame(animateGrow);
          }, blackHoldTime);
        }
      };

      requestAnimationFrame(animateShrink);
    },
    [irisRadius],
  );

  // Keyboard Movement on Stage Plaza (Tracks lastDirection 1-4 & interrupts on keyup)
  useEffect(() => {
    if (currentScreen !== "gameplay") return;

    const keysPressed: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed[k] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed[k] = false;
    };

    // Explanada Plaza Collision System (Restricts movement strictly to diagonal PLAZA_BOUNDS)
    const isPlazaWalkable = (x: number, y: number): boolean => {
      if (y < PLAZA_BOUNDS.minY || y > PLAZA_BOUNDS.maxY) {
        return false;
      }
      const minXForY = getLeftBoundaryX(y);
      const maxXForY = getRightBoundaryX(y);
      if (x < minXForY || x > maxXForY) {
        return false;
      }
      return true;
    };

    let animationFrameId: number;
    let lastTime = performance.now();

    // Smooth Movement Physics Constants
    const maxSpeed = 22.0; // Max walk speed % per second (slightly lower max speed for controlled movement)
    const RAMP_TIME = 1.0; // Continuous hold duration (seconds) to reach full speed
    const frictionRate = 9.0; // Deceleration/slide factor (~0.25s inertial slide on release)

    // Track key hold duration and continuous velocity (% per sec)
    let keyHoldTime = 0;
    const velocity = { x: 0, y: 0 };

    const updateGameLoop = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000); // Delta time in seconds (capped at 50ms)
      lastTime = currentTime;

      // Block player movement completely while dialogue intro sequence is active
      if (dialogueStateRef.current !== "dismissed") {
        velocity.x = 0;
        velocity.y = 0;
        keyHoldTime = 0;
        setIsWalking(false);
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      let dirX = 0;
      let dirY = 0;

      // Restrict user movement strictly to 4 orthogonal directions (no diagonal user input)
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

      // INSTANTLY interrupt walking animation posture on key release
      setIsWalking(isInputActive);

      // Accumulate continuous press time when direction keys held, reset to 0 on key release
      if (isInputActive) {
        keyHoldTime = Math.min(RAMP_TIME, keyHoldTime + dt);
      } else {
        keyHoldTime = 0;
      }

      // Quadratic ease-in acceleration ramp: starts extremely subtle (micro-step), reaching full speed at 1s
      const rampFactor = isInputActive
        ? Math.pow(keyHoldTime / RAMP_TIME, 2)
        : 0;
      const targetVx = dirX * maxSpeed * rampFactor;
      const targetVy = dirY * maxSpeed * rampFactor;

      if (isInputActive) {
        velocity.x += (targetVx - velocity.x) * Math.min(1, 16.0 * dt);
        velocity.y += (targetVy - velocity.y) * Math.min(1, 16.0 * dt);
      } else {
        // Inertial deceleration slide when key is released
        velocity.x += (0 - velocity.x) * Math.min(1, frictionRate * dt);
        velocity.y += (0 - velocity.y) * Math.min(1, frictionRate * dt);
      }

      // Threshold micro-drift when completely stopped
      if (!isInputActive && Math.abs(velocity.x) < 0.04) velocity.x = 0;
      if (!isInputActive && Math.abs(velocity.y) < 0.04) velocity.y = 0;

      const currentSpeed = Math.hypot(velocity.x, velocity.y);
      const isMoving = currentSpeed > 0.01;

      if (isMoving) {
        const dx = velocity.x * dt;
        const dy = velocity.y * dt;

        setPlayerPos((prev) => {
          let effectiveDx = dx;
          let effectiveDy = dy;

          const isInsideRightPath =
            prev.y >= PLAZA_BOUNDS.rightPathTopY &&
            prev.y <= PLAZA_BOUNDS.rightPathBottomY &&
            prev.x > getBaseRightBoundaryX(prev.y);

          // 1. Diagonal Wall Sliding (ONLY applies on diagonal slopes outside side path)
          if (!isInsideRightPath) {
            // Check left wall collision & slide downwards if pushing into left diagonal wall
            const currentMinX = getLeftBoundaryX(prev.y);
            if (dx < 0 && prev.x <= currentMinX + 0.6) {
              effectiveDy += Math.abs(dx) * 0.75;
            }

            // Check right wall collision & slide downwards if pushing into right diagonal wall
            const currentMaxX = getRightBoundaryX(prev.y);
            if (dx > 0 && prev.x >= currentMaxX - 0.6) {
              effectiveDy += Math.abs(dx) * 0.75;
            }
          }

          const rawTargetX = prev.x + effectiveDx;
          const rawTargetY = prev.y + effectiveDy;

          // 2. Direct unconstrained movement if target is on stone explanada
          if (isPlazaWalkable(rawTargetX, rawTargetY)) {
            return { x: rawTargetX, y: rawTargetY };
          }

          // 3. Side Path Movement Constraints (No diagonal wall sliding; solid ceiling, floor, & right wall)
          if (isInsideRightPath) {
            const pathClampedY = Math.min(
              PLAZA_BOUNDS.rightPathBottomY,
              Math.max(PLAZA_BOUNDS.rightPathTopY, rawTargetY),
            );
            const pathClampedX = Math.min(
              PLAZA_BOUNDS.rightPathMaxX,
              Math.max(getBaseRightBoundaryX(pathClampedY), rawTargetX),
            );
            if (isPlazaWalkable(pathClampedX, pathClampedY)) {
              return { x: pathClampedX, y: pathClampedY };
            }
          }

          // 4. Smooth Diagonal & Wall Sliding System for Main Plaza
          const clampedY = Math.min(
            PLAZA_BOUNDS.maxY,
            Math.max(PLAZA_BOUNDS.minY, rawTargetY),
          );

          const minXAtY = getLeftBoundaryX(clampedY);
          const maxXAtY = getRightBoundaryX(clampedY);

          const clampedX = Math.min(maxXAtY, Math.max(minXAtY, rawTargetX));

          if (isPlazaWalkable(clampedX, clampedY)) {
            return { x: clampedX, y: clampedY };
          }

          if (isPlazaWalkable(clampedX, prev.y)) {
            return { x: clampedX, y: prev.y };
          }
          if (isPlazaWalkable(prev.x, clampedY)) {
            return { x: prev.x, y: clampedY };
          }

          // Zero out velocity when colliding head-on into solid boundary
          velocity.x = 0;
          velocity.y = 0;

          return prev;
        });
      } else {
        // Immediate interrupt to static idle state on full stop
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
    };
  }, [currentScreen]);

  // Camera Dynamic Zoom & Smooth Character Tracking Parameters
  const zoomScale = 2.35;
  const maxCamShift = (1 - 1 / zoomScale) * 50; // Max shift % before exposing background edges
  const rawCamX = 50 - playerPos.x;
  const rawCamY = 50 - playerPos.y;
  const camX = Math.min(maxCamShift, Math.max(-maxCamShift, rawCamX));
  const camY = Math.min(maxCamShift, Math.max(-maxCamShift, rawCamY));

  // Synchronize state with HTML5 Fullscreen API events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (err) {
      console.error("Error al cambiar a pantalla completa:", err);
    }
  }, []);

  // Draw splash background on canvas when in splash mode
  useEffect(() => {
    if (currentScreen !== "splash" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = splashImageUrl;
    img.onload = () => {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    img.onerror = () => {
      ctx.fillStyle = "#adadb7";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#E3007E";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        "INE - VOCES EN CASILLA",
        canvas.width / 2,
        canvas.height / 2 - 30,
      );
    };
  }, [currentScreen, splashImageUrl]);

  const mythsData = [
    {
      title: "Mito: 'Mi voto no cuenta ni cambia nada'",
      fact: "Dato CCPC INE: La participación ciudadana promedio en elecciones generales supera el 60%. Cada voto sumado forma los porcentajes de gobernanza directa y fiscalización pública.",
    },
    {
      title: "Mito: 'Los funcionarios de casilla son pagados por partidos'",
      fact: "Dato CCPC INE: Falso. Los funcionarios son vecinos insaculados (sorteados por mes de nacimiento) y capacitados de manera neutral por el INE.",
    },
    {
      title: "Mito: 'Las urnas pueden alterarse fácilmente'",
      fact: "Dato CCPC INE: Las boletas cuentan con marcas de agua infalsificables, folios únicos y son contadas en presencia de observadores de todos los partidos.",
    },
  ];

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-5xl mx-auto select-none transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 max-w-none rounded-none border-0 p-0 ring-0 shadow-none flex flex-col justify-center items-center bg-slate-950 overflow-hidden"
          : "rounded-2xl shadow-2xl overflow-hidden"
      }`}
    >
      {/* Game Display Container */}
      <div
        style={{ containerType: "inline-size" }}
        className={`relative overflow-hidden flex items-center justify-center bg-slate-950 ${
          isFullscreen
            ? "aspect-video w-full max-w-[177.78vh] h-auto max-h-screen rounded-none shadow-2xl"
            : "aspect-video w-full rounded-xl"
        }`}
      >
        {/* Canvas Background Rendering (Fallback) */}
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="w-full h-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />

        {/* CRT Animated TV Static Layer */}
        <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
          <style>{`
            @keyframes crtBeamSweep {
              0% { top: -15%; opacity: 0; }
              15% { opacity: 0.6; }
              85% { opacity: 0.6; }
              100% { top: 115%; opacity: 0; }
            }
            @keyframes tvNoiseGlitch {
              0% { opacity: 0.08; transform: translate(0, 0); }
              25% { opacity: 0.16; transform: translate(-2px, 1px); }
              50% { opacity: 0.10; transform: translate(1px, -1px); }
              75% { opacity: 0.18; transform: translate(-1px, 2px); }
              100% { opacity: 0.08; transform: translate(0, 0); }
            }
            @keyframes vhsBarSweep {
              0%, 85%, 100% { opacity: 0; top: -10%; }
              88% { opacity: 0.6; top: 30%; }
              92% { opacity: 0.8; top: 65%; }
              95% { opacity: 0.4; top: 90%; }
            }
          `}</style>

          {/* 1. Visible CRT Scanlines grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.30)_50%)] bg-[length:100%_4px] opacity-90" />

          {/* 2. Moving CRT Refresh Scan Beam */}
          <div
            className="absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-cyan-200/25 to-transparent"
            style={{ animation: "crtBeamSweep 4.5s linear infinite" }}
          />

          {/* 3. VHS Glitch Bar Line (Hardware Accelerated) */}
          <div
            className="absolute left-0 right-0 h-2 bg-pink-400/30"
            style={{ animation: "vhsBarSweep 6s ease-in-out infinite" }}
          />

          {/* 4. CRT Radial Monitor Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.45)_100%)] pointer-events-none" />
        </div>

        {/* RETRO IRIS WIPE SVG MASK TRANSITION OVERLAY */}
        {irisRadius !== null && (
          <svg
            className="absolute inset-0 w-full h-full z-50 pointer-events-auto"
            viewBox="0 0 1000 562.5"
            preserveAspectRatio="none"
          >
            <defs>
              <mask id="irisApertureMask">
                <rect width="1000" height="562.5" fill="white" />
                <circle cx="500" cy="281.25" r={irisRadius} fill="black" />
              </mask>
            </defs>
            <rect
              width="1000"
              height="562.5"
              fill="black"
              mask="url(#irisApertureMask)"
            />
          </svg>
        )}

        {/* Splash Menu Screen with Large Unboxed Top-Centered Pixel Title */}
        {currentScreen === "splash" && (
          <div className="absolute inset-0 w-full h-full z-20 overflow-hidden">
            <img
              src={splashImageUrl}
              alt="Voces en Casilla - INE Splash Screen"
              className="absolute inset-0 w-full h-full object-cover bg-slate-950"
              style={{ imageRendering: "pixelated" }}
            />

            {/* DEDICATED PIXEL ART TITLE IN TOP-CENTER (PROPORTIONAL CONTAINER QUERY SCALING) */}
            <div className="absolute top-[16%] left-1/2 -translate-x-1/2 w-[92%] flex flex-col items-center text-center select-none z-20 pointer-events-none">
              <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&family=Press+Start+2P&family=Silkscreen:wght@400;700&display=swap');

                .font-arcade-pixel {
                  font-family: 'Press Start 2P', 'Silkscreen', monospace, sans-serif;
                }

                .font-dialogue-pixel {
                  font-family: 'Pixelify Sans', 'Silkscreen', 'Press Start 2P', monospace, sans-serif;
                }

                @keyframes retroSeesawBalanceSlow {
                  0%, 100% {
                    transform: rotate(-2deg) translateY(-1px);
                    filter: drop-shadow(0 6px 14px rgba(0,0,0,0.9));
                  }
                  50% {
                    transform: rotate(2deg) translateY(1px);
                    filter: drop-shadow(0 12px 24px rgba(181,20,108,0.65));
                  }
                }
              `}</style>

              <div
                className="flex flex-col items-center justify-center w-full"
                style={{
                  animation: "retroSeesawBalanceSlow 6.8s ease-in-out infinite",
                  transformOrigin: "center center",
                }}
              >
                <h1
                  className="font-arcade-pixel font-black tracking-wider uppercase leading-none text-white whitespace-nowrap text-[3.8cqw]"
                  style={{
                    textShadow:
                      "3px 3px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 3px 0px 0px #000, -3px 0px 0px #000, 0px 3px 0px #000, 0px -3px 0px #000, 5px 5px 0px #940d57, 7px 7px 0px #400624",
                  }}
                >
                  VOCES EN CASILLAS
                </h1>

                <span
                  className="font-arcade-pixel font-bold text-pink-200 tracking-wide uppercase mt-[1.5cqw] leading-normal whitespace-nowrap text-[1.7cqw]"
                  style={{
                    textShadow:
                      "2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 2px 0px 0px #000, -2px 0px 0px #000, 0px 2px 0px #000, 0px -2px 0px #000, 3px 3px 0px #7a0c47",
                  }}
                >
                  SIMULADOR PARA UN VOTO INFORMADO
                </span>
              </div>
            </div>

            {/* JUGAR BUTTON AT BOTTOM-CENTER */}
            <div
              className={`absolute bottom-[14%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-20 transition-all duration-300 ${
                isFullscreen
                  ? "w-[36%] min-w-[300px] max-w-[480px]"
                  : "w-[30%] min-w-[220px] max-w-[320px]"
              }`}
            >
              {/* JUGAR Button */}
              <button
                onClick={() => changeScreenWithTransition("gameplay")}
                type="button"
                className={`w-full px-4 bg-[#f9d7ea] hover:bg-[#f6c2e0] rounded-md ring-2 ring-white ring-inset transition-all flex items-center justify-between cursor-pointer group shrink-0 ${
                  isFullscreen
                    ? "h-[64px] sm:h-[72px] border-[5px] border-[#b5146c] shadow-[6px_6px_0px_0px_#7a0c47] active:translate-x-[3px] active:translate-y-[3px]"
                    : "h-[48px] sm:h-[52px] border-[4px] border-[#b5146c] shadow-[4px_4px_0px_0px_#7a0c47] active:translate-x-[2px] active:translate-y-[2px]"
                } active:shadow-none`}
              >
                <span
                  className={`font-mono font-black text-black tracking-widest uppercase flex-1 text-center drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] select-none ${
                    isFullscreen
                      ? "text-2xl sm:text-3xl pl-8"
                      : "text-lg sm:text-xl pl-6"
                  }`}
                >
                  JUGAR
                </span>
                <PixelBallotBoxIcon isFullscreen={isFullscreen} />
              </button>
            </div>
          </div>
        )}

        {/* SCREEN: GAMEPLAY - DYNAMIC 2D STAGE MAP & AVATAR PLAZA */}
        {currentScreen === "gameplay" && (
          <div className="absolute inset-0 w-full h-full z-20 overflow-hidden bg-[#2d572c] select-none">
            {/* Ambient Dynamic Animations Styles */}
            <style>{`
              @keyframes godRayPulse {
                0%, 100% { opacity: 0.08; transform: rotate(-24deg) scaleY(1); }
                50% { opacity: 0.18; transform: rotate(-24deg) scaleY(1.03); }
              }
              @keyframes petalFloat1 {
                0% { transform: translate(0px, 0px) rotate(0deg); opacity: 0; }
                15% { opacity: 0.85; }
                85% { opacity: 0.75; }
                100% { transform: translate(110px, 150px) rotate(260deg); opacity: 0; }
              }
              @keyframes petalFloat2 {
                0% { transform: translate(0px, 0px) rotate(0deg); opacity: 0; }
                20% { opacity: 0.8; }
                80% { opacity: 0.7; }
                100% { transform: translate(-90px, 140px) rotate(-190deg); opacity: 0; }
              }
              @keyframes petalFloat3 {
                0% { transform: translate(0px, 0px) rotate(0deg); opacity: 0; }
                25% { opacity: 0.9; }
                75% { opacity: 0.8; }
                100% { transform: translate(70px, 160px) rotate(310deg); opacity: 0; }
              }
              @keyframes sparkleFloat {
                0% { transform: translate(0, 0) scale(0.5); opacity: 0.15; }
                50% { transform: translate(18px, -24px) scale(1.2); opacity: 0.85; }
                100% { transform: translate(36px, -48px) scale(0.5); opacity: 0.15; }
              }
              @keyframes butterflyFlutter {
                0% { transform: translate(0px, 0px) scaleX(1); }
                25% { transform: translate(16px, -14px) scaleX(1); }
                50% { transform: translate(30px, 6px) scaleX(-1); }
                75% { transform: translate(10px, 14px) scaleX(-1); }
                100% { transform: translate(0px, 0px) scaleX(1); }
              }
              @keyframes mistDrift {
                0% { transform: translateX(-4%); opacity: 0.12; }
                50% { transform: translateX(4%); opacity: 0.24; }
                100% { transform: translateX(-4%); opacity: 0.12; }
              }
            `}</style>

            {/* CRT TV Scanline Grid for Retro Cohesion (Pinned to Viewport) */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.22)_50%)] bg-[length:100%_4px] opacity-60" />

            {/* Top HUD Bar: Return Arrow Button (Pinned to Viewport) */}
            <div className="absolute top-3 left-3 z-30 pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExitConfirm(true);
                }}
                type="button"
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

            {/* DYNAMIC CAMERA WORLD CONTAINER (Enlarges 1.75x and smoothly tracks avatar) */}
            <div
              className="absolute inset-0 w-full h-full z-10"
              style={{
                transform: `scale(${zoomScale}) translate(${camX}%, ${camY}%)`,
                transformOrigin: "center center",
                willChange: "transform",
              }}
            >
              {/* Background 2D Stage Map (User Uploaded Plaza Map) */}
              <img
                src={stageImageUrl}
                alt="Escenario del Juego - INE Stage"
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                style={{ imageRendering: "pixelated" }}
              />

              {/* DYNAMIC AMBIENT LIGHTING & ATMOSPHERE LAYERS */}
              {/* 1. Soft Warm Top-Left Sunlight Canopy Bloom Glare */}
              <div className="absolute inset-0 pointer-events-none z-12 bg-[radial-gradient(circle_at_15%_10%,rgba(254,240,138,0.18)_0%,rgba(253,224,71,0.06)_35%,transparent_65%)]" />

              {/* 2. Softened Volumetric Sun Light Rays (God Rays) */}
              <div className="absolute inset-0 pointer-events-none z-13 overflow-hidden">
                <div
                  className="absolute -top-[30%] -left-[10%] w-[140%] h-[160%] bg-gradient-to-r from-transparent via-amber-100/12 to-transparent blur-[2px] transform origin-top-left"
                  style={{ animation: "godRayPulse 8s ease-in-out infinite" }}
                />
                <div
                  className="absolute -top-[30%] left-[18%] w-[120%] h-[160%] bg-gradient-to-r from-transparent via-yellow-100/10 to-transparent blur-[3px] transform origin-top-left"
                  style={{
                    animation: "godRayPulse 10s ease-in-out infinite 2.5s",
                  }}
                />
                <div
                  className="absolute -top-[30%] left-[38%] w-[100%] h-[160%] bg-gradient-to-r from-transparent via-pink-100/08 to-transparent blur-[4px] transform origin-top-left"
                  style={{
                    animation: "godRayPulse 9s ease-in-out infinite 4.5s",
                  }}
                />
              </div>

              {/* 3. Floating Ambient Particles: Dalia Petals & Gold Sunlight Dust */}
              <div className="absolute inset-0 pointer-events-none z-14 overflow-hidden">
                {/* Floating Pink Dalia Petals (Rich Flow) */}
                <div
                  className="absolute top-[14%] left-[18%] w-2.5 h-2.5 bg-pink-400/80 rounded-tl-full rounded-br-full border border-pink-600/40 shadow-sm"
                  style={{ animation: "petalFloat1 6.5s ease-in-out infinite" }}
                />
                <div
                  className="absolute top-[22%] left-[62%] w-3 h-2 bg-pink-500/85 rounded-tr-full rounded-bl-full border border-pink-700/40 shadow-sm"
                  style={{
                    animation: "petalFloat2 8s ease-in-out infinite 1.2s",
                  }}
                />
                <div
                  className="absolute top-[10%] left-[42%] w-2 h-2 bg-dalia-400/90 rounded-full border border-pink-500/50 shadow-sm"
                  style={{
                    animation: "petalFloat3 7.2s ease-in-out infinite 2.4s",
                  }}
                />
                <div
                  className="absolute top-[28%] left-[80%] w-2.5 h-2.5 bg-pink-300/80 rounded-tl-full rounded-br-full border border-pink-500/40"
                  style={{
                    animation: "petalFloat2 9s ease-in-out infinite 3.6s",
                  }}
                />
                <div
                  className="absolute top-[16%] left-[32%] w-2 h-2 bg-pink-400/80 rounded-tr-full rounded-bl-full border border-pink-600/30"
                  style={{
                    animation: "petalFloat1 7.8s ease-in-out infinite 4.8s",
                  }}
                />
                <div
                  className="absolute top-[35%] left-[12%] w-2.5 h-2 bg-dalia-500/85 rounded-tl-full rounded-br-full border border-pink-700/30"
                  style={{
                    animation: "petalFloat3 8.5s ease-in-out infinite 5.5s",
                  }}
                />
                <div
                  className="absolute top-[20%] left-[52%] w-3 h-2.5 bg-pink-300/90 rounded-tr-full rounded-bl-full border border-pink-400/40"
                  style={{
                    animation: "petalFloat1 6.8s ease-in-out infinite 6.2s",
                  }}
                />
                <div
                  className="absolute top-[30%] left-[70%] w-2 h-2 bg-pink-400/75 rounded-full border border-pink-500/30"
                  style={{
                    animation: "petalFloat2 8.2s ease-in-out infinite 7.0s",
                  }}
                />

                {/* Glowing Sunlight Sparkles / Pollen Dust */}
                <div
                  className="absolute top-[38%] left-[28%] w-1.5 h-1.5 bg-amber-200 rounded-full shadow-[0_0_6px_#fde047]"
                  style={{ animation: "sparkleFloat 4s ease-in-out infinite" }}
                />
                <div
                  className="absolute top-[52%] left-[52%] w-2 h-2 bg-yellow-100 rounded-full shadow-[0_0_8px_#fef08a]"
                  style={{
                    animation: "sparkleFloat 5.5s ease-in-out infinite 0.8s",
                  }}
                />
                <div
                  className="absolute top-[32%] left-[72%] w-1.5 h-1.5 bg-amber-300 rounded-full shadow-[0_0_6px_#fde047]"
                  style={{
                    animation: "sparkleFloat 4.8s ease-in-out infinite 1.9s",
                  }}
                />
                <div
                  className="absolute top-[62%] left-[18%] w-2 h-2 bg-amber-100 rounded-full shadow-[0_0_8px_#ffffff]"
                  style={{
                    animation: "sparkleFloat 6s ease-in-out infinite 2.8s",
                  }}
                />
                <div
                  className="absolute top-[44%] left-[40%] w-1.5 h-1.5 bg-yellow-200 rounded-full shadow-[0_0_6px_#fde047]"
                  style={{
                    animation: "sparkleFloat 5.2s ease-in-out infinite 3.7s",
                  }}
                />
                <div
                  className="absolute top-[58%] left-[84%] w-2 h-2 bg-amber-200 rounded-full shadow-[0_0_8px_#fef08a]"
                  style={{
                    animation: "sparkleFloat 4.5s ease-in-out infinite 4.4s",
                  }}
                />
                <div
                  className="absolute top-[26%] left-[60%] w-1.5 h-1.5 bg-yellow-100 rounded-full shadow-[0_0_6px_#ffffff]"
                  style={{
                    animation: "sparkleFloat 5.8s ease-in-out infinite 5.1s",
                  }}
                />
              </div>

              {/* 4. Animated Pixel Butterflies hovering near bushes */}
              <div className="absolute inset-0 pointer-events-none z-14">
                {/* Butterfly 1 (Bottom Left Flowers) */}
                <div
                  className="absolute left-[12%] bottom-[14%] text-sm select-none"
                  style={{
                    animation: "butterflyFlutter 4.2s ease-in-out infinite",
                  }}
                >
                  🦋
                </div>
                {/* Butterfly 2 (Bottom Right Flowers) */}
                <div
                  className="absolute right-[14%] bottom-[16%] text-sm select-none"
                  style={{
                    animation:
                      "butterflyFlutter 5.5s ease-in-out infinite 1.8s",
                  }}
                >
                  🦋
                </div>
              </div>

              {/* 5. Gentle Forest Ground Mist Layer */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-950/20 via-emerald-900/10 to-transparent pointer-events-none z-11"
                style={{ animation: "mistDrift 10s ease-in-out infinite" }}
              />

              {/* PLAYER CHARACTER AVATAR ON THE PLAZA FLOOR */}
              <div
                style={{
                  left: `${playerPos.x}%`,
                  top: `${playerPos.y}%`,
                  width: "6.5%",
                  transform: "translate(-50%, -90%)",
                  willChange: "left, top",
                }}
                className="absolute z-25 pointer-events-none flex flex-col items-center select-none shrink-0"
              >
                {/* Dynamic 8-Folder Sprite Animation Component */}
                <AnimatedPlayerSprite
                  isWalking={isWalking}
                  lastDirection={lastDirection}
                />
              </div>

              {/* FOREGROUND BUSH OVERLAYS (Positioned at z-30 above player so character walks behind them) */}
              <img
                src="/assets/juego/arbusto-izquierda.png"
                alt="Arbustos Izquierda"
                className="absolute bottom-0 left-0 w-[30.6%] h-auto object-contain pointer-events-none select-none z-30"
                style={{ imageRendering: "pixelated" }}
              />
              <img
                src="/assets/juego/arbusto-derecha.png"
                alt="Arbustos Derecha"
                className="absolute bottom-0 right-0 w-[26%] h-auto object-contain pointer-events-none select-none z-30"
                style={{ imageRendering: "pixelated" }}
              />
            </div>

            {/* INTRO SPEECH BUBBLE DIALOGUE OVERLAY */}
            {dialogueState !== "initial_delay" &&
              dialogueState !== "dismissed" && (
                <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-center pb-[1.8cqw] px-[2cqw] overflow-hidden select-none">
                  <div className="relative z-10 w-[96%] pointer-events-auto">
                    <PixelSpeechBubble
                      speaker={
                        language === "nah" ? "Inecito Cívica" : "Inecito"
                      }
                      messages={
                        activeDialogue ||
                        (language === "nah"
                          ? INTRO_MESSAGES_NAH
                          : INTRO_MESSAGES_ES)
                      }
                      actionKey="E"
                      disabled={showExitConfirm}
                      isDismissing={dialogueState === "exiting"}
                      onDismiss={() => {
                        setDialogueState("exiting");
                        setActiveDialogue(null);
                      }}
                    />
                  </div>
                </div>
              )}
          </div>
        )}

        {/* RETRO PIXEL ART EXIT CONFIRMATION MODAL (STABLE PIXEL ART LAYOUT) */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-[3cqw] animate-in fade-in duration-200 select-none">
            <div
              className="relative w-[min(84cqw,460px)] bg-[#f9d7ea] border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_#400624,12px_12px_0px_0px_rgba(0,0,0,0.85)] p-[min(4cqw,22px)] flex flex-col items-center text-center overflow-hidden"
              style={{
                fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
              }}
            >
              {/* Inner Bevel Light Highlight Lines */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/95 pointer-events-none" />
              <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-white/95 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#b5146c]/60 pointer-events-none" />
              <div className="absolute top-0 right-0 bottom-0 w-[3px] bg-[#b5146c]/60 pointer-events-none" />

              {/* Modal Title in Press Start 2P Font */}
              <h3
                className="font-black uppercase text-[#7a0c47] tracking-wider mb-[min(2.5cqw,14px)] leading-snug"
                style={{
                  fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                  fontSize: "min(2.5cqw, 15px)",
                  textShadow: "2px 2px 0px #ffffff, -1px -1px 0px #f9d7ea",
                }}
              >
                ¿REGRESAR AL MENÚ?
              </h3>

              {/* Warning Description Text */}
              <p
                className="font-bold text-black leading-relaxed mb-[min(4cqw,20px)] max-w-[95%]"
                style={{
                  fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                  fontSize: "min(1.8cqw, 10.5px)",
                  textShadow: "1px 1px 0px #ffffff",
                }}
              >
                Si regresas al menú principal, perderás todo tu progreso actual
                en la partida.
              </p>

              {/* Pixel Action Buttons */}
              <div className="flex gap-[min(3cqw,14px)] w-full justify-center">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 bg-white hover:bg-slate-100 text-black border-[3px] border-black font-black uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all py-[min(2cqw,10px)] rounded-xl cursor-pointer select-none"
                  style={{
                    fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                    fontSize: "min(1.7cqw, 10px)",
                  }}
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    changeScreenWithTransition("splash");
                  }}
                  className="flex-1 bg-[#b5146c] hover:bg-[#9c0f5a] text-white border-[3px] border-black font-black uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all py-[min(2cqw,10px)] rounded-xl cursor-pointer select-none"
                  style={{
                    fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                    fontSize: "min(1.7cqw, 10px)",
                    textShadow: "1px 1px 0px #000",
                  }}
                >
                  SÍ, SALIR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABSOLUTE PINNED FULLSCREEN BUTTON WITH INLINE CSS FAILSAFE */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 9999,
            pointerEvents: "auto",
          }}
        >
          <PixelFullscreenButton
            isFullscreen={isFullscreen}
            onToggle={toggleFullscreen}
          />
        </div>
      </div>
    </div>
  );
}
