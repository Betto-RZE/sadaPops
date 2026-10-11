import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  lazy,
  Suspense,
} from "react";
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

// El juego vive en su propio chunk: NO se descarga ni se ejecuta hasta presionar "JUGAR".
// Al regresar al menu se desmonta por completo y al volver a jugar se monta desde cero.
const loadGameplayScene = () => import("./GameplayScene");
const GameplayScene = lazy(loadGameplayScene);

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
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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
          // Al cambiar a "splash" el componente GameplayScene se desmonta y libera sus recursos;
          // al cambiar a "gameplay" se monta una partida completamente nueva.
          setActiveScene(targetScreen === "splash" ? null : targetScene);

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
                onClick={() => {
                  // Empieza a descargar el chunk del juego mientras se cierra el iris
                  void loadGameplayScene();
                  changeScreenWithTransition("gameplay");
                }}
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

        {/* SCREEN: GAMEPLAY - solo existe mientras se esta jugando */}
        {currentScreen === "gameplay" && (
          <Suspense
            fallback={
              <div className="absolute inset-0 w-full h-full z-20 bg-black" />
            }
          >
            <GameplayScene
              language={language}
              stageImageUrl={stageImageUrl}
              isFullscreen={isFullscreen}
              isTransitioning={irisRadius !== null}
              isPaused={showExitConfirm}
              onRequestExit={() => setShowExitConfirm(true)}
            />
          </Suspense>
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
