import React, { useState, useEffect, useRef, useCallback } from "react";
import { PixelFullscreenButton } from "./PixelFullscreenButton";

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

// Centralized Plaza Collision Bounds (Edit these 6 numbers to dynamically adjust boundaries in real-time!)
export const PLAZA_BOUNDS = {
  topLeftX: 14, // Top-Left boundary % (at minY = 30%)
  bottomLeftX: 2, // Bottom-Left boundary % (at maxY = 95%)
  topRightX: 87, // Top-Right boundary % (at minY = 30%)
  bottomRightX: 98, // Bottom-Right boundary % (at maxY = 95%)
  minY: 30, // Top boundary %
  maxY: 95, // Bottom boundary %
};

// Returns dynamic left boundary % at vertical position y (Slanted diagonal line)
const getLeftBoundaryX = (y: number): number => {
  if (PLAZA_BOUNDS.maxY === PLAZA_BOUNDS.minY) return PLAZA_BOUNDS.topLeftX;
  const progress = Math.min(
    1,
    Math.max(0, (y - PLAZA_BOUNDS.minY) / (PLAZA_BOUNDS.maxY - PLAZA_BOUNDS.minY))
  );
  return (
    PLAZA_BOUNDS.topLeftX +
    progress * (PLAZA_BOUNDS.bottomLeftX - PLAZA_BOUNDS.topLeftX)
  );
};

// Returns dynamic right boundary % at vertical position y (Slanted diagonal line)
const getRightBoundaryX = (y: number): number => {
  if (PLAZA_BOUNDS.maxY === PLAZA_BOUNDS.minY) return PLAZA_BOUNDS.topRightX;
  const progress = Math.min(
    1,
    Math.max(0, (y - PLAZA_BOUNDS.minY) / (PLAZA_BOUNDS.maxY - PLAZA_BOUNDS.minY))
  );
  return (
    PLAZA_BOUNDS.topRightX +
    progress * (PLAZA_BOUNDS.bottomRightX - PLAZA_BOUNDS.topRightX)
  );
};

export function PixiGameCanvas({
  onModuleComplete,
  language = "es",
  splashImageUrl = "/assets/juego/splash.jpg",
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
  const [lastDirection, setLastDirection] = useState<"1" | "2" | "3" | "4">("1");
  const [isWalking, setIsWalking] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Retro Circle (Iris Wipe) Screen Transition Handler with SVG Mask
  const changeScreenWithTransition = useCallback(
    (
      targetScreen: "splash" | "how_to_play" | "gameplay",
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
          } else {
            setActiveScene(targetScene);
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

    const interval = setInterval(() => {
      let dx = 0;
      let dy = 0;

      if (keysPressed["arrowdown"] || keysPressed["s"]) {
        dy += 0.85;
        setLastDirection("1");
      } else if (keysPressed["arrowleft"] || keysPressed["a"]) {
        dx -= 0.85;
        setLastDirection("2");
      } else if (keysPressed["arrowup"] || keysPressed["w"]) {
        dy -= 0.85;
        setLastDirection("3");
      } else if (keysPressed["arrowright"] || keysPressed["d"]) {
        dx += 0.85;
        setLastDirection("4");
      }

      if (dx !== 0 || dy !== 0) {
        setIsWalking(true);
        setPlayerPos((prev) => {
          const targetX = prev.x + dx;
          const targetY = prev.y + dy;

          // 1. Full diagonal movement if target is on stone explanada
          if (isPlazaWalkable(targetX, targetY)) {
            return { x: targetX, y: targetY };
          }
          // 2. Smooth horizontal wall slide if X is valid
          if (isPlazaWalkable(targetX, prev.y)) {
            return { x: targetX, y: prev.y };
          }
          // 3. Smooth vertical wall slide if Y is valid
          if (isPlazaWalkable(prev.x, targetY)) {
            return { x: prev.x, y: targetY };
          }
          // 4. Block movement if attempting to step onto green area
          return prev;
        });
      } else {
        // Immediate interrupt to static idle state on key release
        setIsWalking(false);
      }
    }, 30);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [currentScreen]);

  // Camera Dynamic Zoom & Smooth Character Tracking Parameters
  const zoomScale = 1.45;
  const maxCamShift = (1 - 1 / zoomScale) * 50; // Max shift % before exposing background edges (~15.5%)
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
      className={`relative w-full max-w-5xl mx-auto select-none transition-all duration-300 ${isFullscreen
        ? "fixed inset-0 z-50 max-w-none rounded-none border-0 p-0 ring-0 shadow-none flex flex-col justify-center items-center bg-slate-950 overflow-hidden"
        : "rounded-2xl p-2 bg-[#adadb7] border-[8px] border-[#8e8ea0] ring-4 ring-[#adadb7]/50 shadow-[0_15px_40px_rgba(0,0,0,0.15)]"
        }`}
    >
      {/* Game Display Container */}
      <div
        className={`relative overflow-hidden flex items-center justify-center bg-[#adadb7] ${isFullscreen
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

          {/* 3. Animated TV Static Noise Overlay */}
          <div
            className="absolute -inset-4 bg-repeat opacity-14 mix-blend-screen"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              animation: "tvNoiseGlitch 0.1s steps(2) infinite",
            }}
          />

          {/* 4. VHS Glitch Bar Line */}
          <div
            className="absolute left-0 right-0 h-2 bg-pink-400/40 backdrop-invert-[0.25]"
            style={{ animation: "vhsBarSweep 6s ease-in-out infinite" }}
          />

          {/* 5. CRT Radial Monitor Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.45)_100%)]" />
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

        {/* Splash Menu Screen with JUGAR & CÓMO JUGAR buttons */}
        {currentScreen === "splash" && (
          <div className="absolute inset-0 w-full h-full z-20 overflow-hidden">
            <img
              src={splashImageUrl}
              alt="Voces en Casilla - INE Splash Screen"
              className="absolute inset-0 w-full h-full object-cover bg-[#adadb7]"
              style={{ imageRendering: "pixelated" }}
            />

            <div
              className={`absolute bottom-[16%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-20 transition-all duration-300 ${isFullscreen
                ? "w-[38%] min-w-[320px] max-w-[480px] gap-4"
                : "w-[32%] min-w-[220px] max-w-[310px] gap-3"
                }`}
            >
              {/* JUGAR Button */}
              <button
                onClick={() => changeScreenWithTransition("gameplay")}
                type="button"
                className={`w-full px-4 bg-[#f9d7ea] hover:bg-[#f6c2e0] rounded-md ring-2 ring-white ring-inset transition-all flex items-center justify-between cursor-pointer group shrink-0 ${isFullscreen
                  ? "h-[64px] sm:h-[72px] border-[5px] border-[#b5146c] shadow-[6px_6px_0px_0px_#7a0c47] active:translate-x-[3px] active:translate-y-[3px]"
                  : "h-[48px] sm:h-[52px] border-[4px] border-[#b5146c] shadow-[4px_4px_0px_0px_#7a0c47] active:translate-x-[2px] active:translate-y-[2px]"
                  } active:shadow-none`}
              >
                <span
                  className={`font-mono font-black text-black tracking-widest uppercase flex-1 text-center drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] select-none ${isFullscreen
                    ? "text-2xl sm:text-3xl pl-8"
                    : "text-lg sm:text-xl pl-6"
                    }`}
                >
                  JUGAR
                </span>
                <PixelBallotBoxIcon isFullscreen={isFullscreen} />
              </button>

              {/* CÓMO JUGAR Button */}
              <button
                onClick={() => changeScreenWithTransition("how_to_play")}
                type="button"
                className={`w-full px-4 bg-[#f9d7ea] hover:bg-[#f6c2e0] rounded-md ring-2 ring-white ring-inset transition-all flex items-center justify-between cursor-pointer group shrink-0 ${isFullscreen
                  ? "h-[64px] sm:h-[72px] border-[5px] border-[#b5146c] shadow-[6px_6px_0px_0px_#7a0c47] active:translate-x-[3px] active:translate-y-[3px]"
                  : "h-[48px] sm:h-[52px] border-[4px] border-[#b5146c] shadow-[4px_4px_0px_0px_#7a0c47] active:translate-x-[2px] active:translate-y-[2px]"
                  } active:shadow-none`}
              >
                <span
                  className={`font-mono font-black text-black tracking-wider uppercase flex-1 text-center drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] select-none ${isFullscreen
                    ? "text-xl sm:text-2xl pl-3"
                    : "text-base sm:text-lg pl-2"
                    }`}
                >
                  CÓMO JUGAR
                </span>
                <PixelQuestionDocIcon isFullscreen={isFullscreen} />
              </button>
            </div>
          </div>
        )}

        {/* SCREEN: CÓMO JUGAR / CONTROLES */}
        {currentScreen === "how_to_play" && (
          <div className="absolute inset-0 w-full h-full z-30 flex flex-col items-center justify-center bg-slate-950 overflow-hidden animate-in fade-in duration-200 select-none">
            <img
              src="/assets/juego/controles.jpg"
              alt="Controles de Juego - Voces en Casilla INE"
              className="absolute inset-0 w-full h-full object-cover bg-[#adadb7]"
              style={{ imageRendering: "pixelated" }}
            />

            <div className="absolute top-[6%] left-[6%] z-40">
              <button
                onClick={() => changeScreenWithTransition("splash")}
                type="button"
                aria-label="Volver al menú"
                className={`bg-[#f9d7ea] hover:bg-[#f6c2e0] rounded-md ring-2 ring-white ring-inset active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center cursor-pointer font-mono font-black text-black uppercase drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] shrink-0 ${isFullscreen
                  ? "w-14 h-14 text-2xl border-[5px] border-[#b5146c] shadow-[6px_6px_0px_0px_#7a0c47]"
                  : "w-10 h-10 text-lg border-[4px] border-[#b5146c] shadow-[4px_4px_0px_0px_#7a0c47]"
                  }`}
              >
                <span>◀</span>
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
                className={`pointer-events-auto bg-[#f9d7ea] hover:bg-[#f6c2e0] rounded-md ring-2 ring-white ring-inset active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center cursor-pointer font-mono font-black text-black shrink-0 ${isFullscreen
                  ? "w-12 h-12 text-xl border-[4px] border-[#b5146c] shadow-[4px_4px_0px_0px_#7a0c47]"
                  : "w-9 h-9 text-sm border-[3px] border-[#b5146c] shadow-[3px_3px_0px_0px_#7a0c47]"
                  }`}
              >
                <span>◀</span>
              </button>
            </div>

            {/* DYNAMIC CAMERA WORLD CONTAINER (Enlarges 1.45x and smoothly tracks avatar) */}
            <div
              className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out z-10"
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
                  style={{ animation: "godRayPulse 10s ease-in-out infinite 2.5s" }}
                />
                <div
                  className="absolute -top-[30%] left-[38%] w-[100%] h-[160%] bg-gradient-to-r from-transparent via-pink-100/08 to-transparent blur-[4px] transform origin-top-left"
                  style={{ animation: "godRayPulse 9s ease-in-out infinite 4.5s" }}
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
                  style={{ animation: "petalFloat2 8s ease-in-out infinite 1.2s" }}
                />
                <div
                  className="absolute top-[10%] left-[42%] w-2 h-2 bg-dalia-400/90 rounded-full border border-pink-500/50 shadow-sm"
                  style={{ animation: "petalFloat3 7.2s ease-in-out infinite 2.4s" }}
                />
                <div
                  className="absolute top-[28%] left-[80%] w-2.5 h-2.5 bg-pink-300/80 rounded-tl-full rounded-br-full border border-pink-500/40"
                  style={{ animation: "petalFloat2 9s ease-in-out infinite 3.6s" }}
                />
                <div
                  className="absolute top-[16%] left-[32%] w-2 h-2 bg-pink-400/80 rounded-tr-full rounded-bl-full border border-pink-600/30"
                  style={{ animation: "petalFloat1 7.8s ease-in-out infinite 4.8s" }}
                />
                <div
                  className="absolute top-[35%] left-[12%] w-2.5 h-2 bg-dalia-500/85 rounded-tl-full rounded-br-full border border-pink-700/30"
                  style={{ animation: "petalFloat3 8.5s ease-in-out infinite 5.5s" }}
                />
                <div
                  className="absolute top-[20%] left-[52%] w-3 h-2.5 bg-pink-300/90 rounded-tr-full rounded-bl-full border border-pink-400/40"
                  style={{ animation: "petalFloat1 6.8s ease-in-out infinite 6.2s" }}
                />
                <div
                  className="absolute top-[30%] left-[70%] w-2 h-2 bg-pink-400/75 rounded-full border border-pink-500/30"
                  style={{ animation: "petalFloat2 8.2s ease-in-out infinite 7.0s" }}
                />

                {/* Glowing Sunlight Sparkles / Pollen Dust */}
                <div
                  className="absolute top-[38%] left-[28%] w-1.5 h-1.5 bg-amber-200 rounded-full shadow-[0_0_6px_#fde047]"
                  style={{ animation: "sparkleFloat 4s ease-in-out infinite" }}
                />
                <div
                  className="absolute top-[52%] left-[52%] w-2 h-2 bg-yellow-100 rounded-full shadow-[0_0_8px_#fef08a]"
                  style={{ animation: "sparkleFloat 5.5s ease-in-out infinite 0.8s" }}
                />
                <div
                  className="absolute top-[32%] left-[72%] w-1.5 h-1.5 bg-amber-300 rounded-full shadow-[0_0_6px_#fde047]"
                  style={{ animation: "sparkleFloat 4.8s ease-in-out infinite 1.9s" }}
                />
                <div
                  className="absolute top-[62%] left-[18%] w-2 h-2 bg-amber-100 rounded-full shadow-[0_0_8px_#ffffff]"
                  style={{ animation: "sparkleFloat 6s ease-in-out infinite 2.8s" }}
                />
                <div
                  className="absolute top-[44%] left-[40%] w-1.5 h-1.5 bg-yellow-200 rounded-full shadow-[0_0_6px_#fde047]"
                  style={{ animation: "sparkleFloat 5.2s ease-in-out infinite 3.7s" }}
                />
                <div
                  className="absolute top-[58%] left-[84%] w-2 h-2 bg-amber-200 rounded-full shadow-[0_0_8px_#fef08a]"
                  style={{ animation: "sparkleFloat 4.5s ease-in-out infinite 4.4s" }}
                />
                <div
                  className="absolute top-[26%] left-[60%] w-1.5 h-1.5 bg-yellow-100 rounded-full shadow-[0_0_6px_#ffffff]"
                  style={{ animation: "sparkleFloat 5.8s ease-in-out infinite 5.1s" }}
                />
              </div>

              {/* 4. Animated Pixel Butterflies hovering near bushes */}
              <div className="absolute inset-0 pointer-events-none z-14">
                {/* Butterfly 1 (Bottom Left Flowers) */}
                <div
                  className="absolute left-[12%] bottom-[14%] text-sm select-none"
                  style={{ animation: "butterflyFlutter 4.2s ease-in-out infinite" }}
                >
                  🦋
                </div>
                {/* Butterfly 2 (Bottom Right Flowers) */}
                <div
                  className="absolute right-[14%] bottom-[16%] text-sm select-none"
                  style={{ animation: "butterflyFlutter 5.5s ease-in-out infinite 1.8s" }}
                >
                  🦋
                </div>
              </div>

              {/* 5. Gentle Forest Ground Mist Layer */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-950/20 via-emerald-900/10 to-transparent pointer-events-none z-11"
                style={{ animation: "mistDrift 10s ease-in-out infinite" }}
              />

              {/* LIVE COORDINATE HUD PANEL (Shows exact X% and Y% player position in real time) */}
              <div className="absolute top-3 left-14 z-30 pointer-events-none flex items-center gap-2 select-none">
                <div className="bg-slate-900/90 text-yellow-300 font-mono text-xs font-bold px-3 py-1.5 rounded-md border-2 border-yellow-400 shadow-md backdrop-blur-sm flex items-center gap-2">
                  <span>📍 Posición en Vivo:</span>
                  <span className="text-white font-mono font-black">X: {playerPos.x.toFixed(1)}% | Y: {playerPos.y.toFixed(1)}%</span>
                </div>
              </div>

              {/* VISUAL COLLISION DEBUGGER OVERLAY (Dynamically driven by PLAZA_BOUNDS) */}
              <div className="absolute inset-0 pointer-events-none z-28 select-none">
                {/* 1. Top Blocked Area (0% to minY%) */}
                <div
                  style={{ height: `${PLAZA_BOUNDS.minY}%` }}
                  className="absolute top-0 left-0 right-0 bg-red-500/35 border-b-2 border-red-500 flex items-center justify-center"
                >
                  <span className="bg-red-950/90 text-red-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-red-400">
                    🔴 Bloqueado Arriba (Y &lt; {PLAZA_BOUNDS.minY}%)
                  </span>
                </div>

                {/* 2. Bottom Blocked Area (maxY% to 100%) */}
                <div
                  style={{ top: `${PLAZA_BOUNDS.maxY}%`, bottom: 0 }}
                  className="absolute left-0 right-0 bg-red-500/35 border-t-2 border-red-500 flex items-center justify-center"
                >
                  <span className="bg-red-950/90 text-red-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-red-400">
                    🔴 Bloqueado Abajo (Y &gt; {PLAZA_BOUNDS.maxY}%)
                  </span>
                </div>

                {/* 3. Left Blocked Area (Diagonal from topLeftX at minY to bottomLeftX at maxY) */}
                <div
                  style={{
                    top: `${PLAZA_BOUNDS.minY}%`,
                    height: `${PLAZA_BOUNDS.maxY - PLAZA_BOUNDS.minY}%`,
                    width: "100%",
                    clipPath: `polygon(0% 0%, ${PLAZA_BOUNDS.topLeftX}% 0%, ${PLAZA_BOUNDS.bottomLeftX}% 100%, 0% 100%)`,
                  }}
                  className="absolute left-0 bg-red-500/35 flex items-center justify-start pl-6"
                >
                  <span className="bg-red-950/90 text-red-200 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-400">
                    🔴 Izq Diagonal ({PLAZA_BOUNDS.topLeftX}% ➔ {PLAZA_BOUNDS.bottomLeftX}%)
                  </span>
                </div>

                {/* 4. Right Blocked Area (Diagonal from topRightX at minY to bottomRightX at maxY) */}
                <div
                  style={{
                    top: `${PLAZA_BOUNDS.minY}%`,
                    height: `${PLAZA_BOUNDS.maxY - PLAZA_BOUNDS.minY}%`,
                    width: "100%",
                    clipPath: `polygon(${PLAZA_BOUNDS.topRightX}% 0%, 100% 0%, 100% 100%, ${PLAZA_BOUNDS.bottomRightX}% 100%)`,
                  }}
                  className="absolute left-0 bg-red-500/35 flex items-center justify-end pr-6"
                >
                  <span className="bg-red-950/90 text-red-200 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-400">
                    🔴 Der Diagonal ({PLAZA_BOUNDS.topRightX}% ➔ {PLAZA_BOUNDS.bottomRightX}%)
                  </span>
                </div>

                {/* 5. Walkable Stone Plaza (Trapezoid from Left Diagonal to Right Diagonal) */}
                <div
                  style={{
                    top: `${PLAZA_BOUNDS.minY}%`,
                    height: `${PLAZA_BOUNDS.maxY - PLAZA_BOUNDS.minY}%`,
                    width: "100%",
                    clipPath: `polygon(${PLAZA_BOUNDS.topLeftX}% 0%, ${PLAZA_BOUNDS.topRightX}% 0%, ${PLAZA_BOUNDS.bottomRightX}% 100%, ${PLAZA_BOUNDS.bottomLeftX}% 100%)`,
                  }}
                  className="absolute left-0 border-2 border-dashed border-emerald-400 bg-emerald-500/15 pointer-events-none flex items-center justify-center"
                >
                  <span className="bg-emerald-950/90 text-emerald-300 font-mono text-[11px] font-bold px-2.5 py-1 rounded border border-emerald-400 shadow">
                    🟢 Explanada Permitida (Diagonal Izq {PLAZA_BOUNDS.topLeftX}%-{PLAZA_BOUNDS.bottomLeftX}%, Der {PLAZA_BOUNDS.topRightX}%-{PLAZA_BOUNDS.bottomRightX}%)
                  </span>
                </div>
              </div>

              {/* PLAYER CHARACTER AVATAR ON THE PLAZA FLOOR */}
              <div
                style={{
                  left: `${playerPos.x}%`,
                  top: `${playerPos.y}%`,
                  width: "6.5%",
                  transform: "translate(-50%, -90%)",
                }}
                className="absolute z-25 pointer-events-none transition-all duration-75 ease-linear flex flex-col items-center select-none shrink-0"
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
          </div>
        )}

        {/* RETRO PIXEL ART EXIT CONFIRMATION MODAL */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
              className={`bg-[#f9d7ea] text-black font-mono flex flex-col items-center text-center shadow-[8px_8px_0px_0px_#400624] ring-4 ring-white ring-inset relative overflow-hidden select-none ${isFullscreen
                ? "w-[46%] min-w-[320px] max-w-[520px] p-6 sm:p-8 rounded-xl border-[6px] border-[#7a0c47]"
                : "w-[85%] max-w-[350px] p-5 sm:p-6 rounded-lg border-[4px] border-[#7a0c47]"
                }`}
            >
              <h3
                className={`font-black uppercase text-[#7a0c47] tracking-wider ${isFullscreen ? "text-xl sm:text-2xl mb-3 mt-1" : "text-base sm:text-lg mb-2"
                  }`}
              >
                ¿REGRESAR AL MENÚ?
              </h3>

              <p
                className={`text-slate-900 font-bold leading-relaxed mb-6 max-w-xs ${isFullscreen ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                  }`}
              >
                Si regresas al menú principal, perderás todo tu progreso actual en la partida.
              </p>

              {/* Pixel Action Buttons */}
              <div className="flex gap-3 sm:gap-4 w-full justify-center">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className={`flex-1 bg-white hover:bg-slate-100 text-black border-2 sm:border-3 border-black font-black uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer ${isFullscreen ? "py-3 text-sm sm:text-base rounded-md" : "py-2 text-xs rounded"
                    }`}
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    changeScreenWithTransition("splash");
                  }}
                  className={`flex-1 bg-[#b5146c] hover:bg-[#8e0e54] text-white border-2 sm:border-3 border-black font-black uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer ${isFullscreen ? "py-3 text-sm sm:text-base rounded-md" : "py-2 text-xs rounded"
                    }`}
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
