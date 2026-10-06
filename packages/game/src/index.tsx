import React, { useState, useEffect, useRef, useCallback } from "react";
import { PixelFullscreenButton } from "./PixelFullscreenButton";

export interface GameProps {
  onModuleComplete?: (moduleName: "mitos" | "simulador") => void;
  language?: "es" | "nah";
  splashImageUrl?: string;
}

function PixelBallotBoxIcon({ isFullscreen }: { isFullscreen?: boolean }) {
  return (
    <div className={`relative shrink-0 flex items-center justify-center select-none ${isFullscreen ? "w-10 h-10" : "w-8 h-8"}`}>
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
        <rect x="9" y="1" width="6" height="7" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
        {/* Magenta box body */}
        <rect x="3" y="7" width="18" height="14" rx="1" fill="#9d2b70" stroke="#000000" strokeWidth="1.5" />
        {/* Slot line */}
        <line x1="6" y1="7" x2="18" y2="7" stroke="#000000" strokeWidth="2" />
      </svg>
    </div>
  );
}

function PixelQuestionDocIcon({ isFullscreen }: { isFullscreen?: boolean }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0 select-none">
      <span className={`text-black font-mono font-black leading-none mr-0.5 ${isFullscreen ? "text-2xl sm:text-3xl" : "text-xl"}`}>
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
        <rect x="4" y="2" width="16" height="20" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
        {/* Folded corner */}
        <path d="M14 2 L20 8 L14 8 Z" fill="#D1D5DB" stroke="#000000" strokeWidth="1" />
        {/* Text lines */}
        <line x1="7" y1="7" x2="13" y2="7" stroke="#000000" strokeWidth="1.5" />
        <line x1="7" y1="11" x2="17" y2="11" stroke="#000000" strokeWidth="1.5" />
        <line x1="7" y1="15" x2="17" y2="15" stroke="#000000" strokeWidth="1.5" />
        <line x1="7" y1="19" x2="13" y2="19" stroke="#000000" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export function PixiGameCanvas({
  onModuleComplete,
  language = "es",
  splashImageUrl = "/assets/juego/splash.jpg",
}: GameProps) {
  const [currentScreen, setCurrentScreen] = useState<
    "splash" | "how_to_play" | "gameplay"
  >("splash");
  const [activeScene, setActiveScene] = useState<"mitos" | "simulador" | null>(
    null,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-5xl mx-auto select-none transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 max-w-none rounded-none border-0 p-0 ring-0 shadow-none flex flex-col justify-center items-center bg-slate-950 overflow-hidden"
          : "rounded-2xl p-2 bg-[#adadb7] border-[8px] border-[#8e8ea0] ring-4 ring-[#adadb7]/50 shadow-[0_15px_40px_rgba(0,0,0,0.15)]"
      }`}
    >
      {/* Game Display Container */}
      <div
        className={`relative overflow-hidden flex items-center justify-center bg-[#adadb7] ${
          isFullscreen
            ? "aspect-video w-full max-w-[177.78vh] h-auto max-h-screen rounded-none shadow-2xl"
            : "aspect-video w-full rounded-xl"
        }`}
      >
        {/* Canvas Background Rendering */}
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="w-full h-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />

        {/* CRT Animated TV Static & Interference Layer */}
        <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
          {/* Keyframe Styles for Visible CRT TV Static & Scanlines */}
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

          {/* 2. Moving CRT Refresh Scan Beam (Cyan/White Tinted) */}
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

        {/* Splash Menu Screen with JUGAR & CÓMO JUGAR buttons matching reference image */}
        {currentScreen === "splash" && (
          <div className="absolute inset-0 w-full h-full z-20 overflow-hidden">
            <img
              src={splashImageUrl}
              alt="Voces en Casilla - INE Splash Screen"
              className="absolute inset-0 w-full h-full object-cover bg-[#adadb7]"
              style={{ imageRendering: "pixelated" }}
            />

            {/* Pixel Action Buttons Container (Dynamic Proportional Scaling in Fullscreen) */}
            <div
              className={`absolute bottom-[16%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-20 transition-all duration-300 ${
                isFullscreen
                  ? "w-[38%] min-w-[320px] max-w-[480px] gap-4"
                  : "w-[32%] min-w-[220px] max-w-[310px] gap-3"
              }`}
            >
              {/* JUGAR Button */}
              <button
                onClick={() => setCurrentScreen("gameplay")}
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

              {/* CÓMO JUGAR Button */}
              <button
                onClick={() => setCurrentScreen("how_to_play")}
                type="button"
                className={`w-full px-4 bg-[#f9d7ea] hover:bg-[#f6c2e0] rounded-md ring-2 ring-white ring-inset transition-all flex items-center justify-between cursor-pointer group shrink-0 ${
                  isFullscreen
                    ? "h-[64px] sm:h-[72px] border-[5px] border-[#b5146c] shadow-[6px_6px_0px_0px_#7a0c47] active:translate-x-[3px] active:translate-y-[3px]"
                    : "h-[48px] sm:h-[52px] border-[4px] border-[#b5146c] shadow-[4px_4px_0px_0px_#7a0c47] active:translate-x-[2px] active:translate-y-[2px]"
                } active:shadow-none`}
              >
                <span
                  className={`font-mono font-black text-black tracking-wider uppercase flex-1 text-center drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] select-none ${
                    isFullscreen
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

        {/* MODAL: CÓMO JUGAR */}
        {currentScreen === "how_to_play" && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-30 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div
              className="w-full max-w-lg bg-slate-900 border-4 border-purple-600 rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] text-slate-100 flex flex-col gap-5"
              style={{ imageRendering: "pixelated" }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b-2 border-purple-900/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-pink-500 text-xl font-mono">❓</span>
                  <h3 className="font-mono font-black text-lg uppercase tracking-wider text-purple-200">
                    Instrucciones de Juego
                  </h3>
                </div>
                <button
                  onClick={() => setCurrentScreen("splash")}
                  className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white rounded border-2 border-slate-700 font-mono font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Rules List */}
              <div className="space-y-3 font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
                <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-lg border border-purple-900/40">
                  <span className="font-mono font-bold text-pink-400 text-base">
                    01.
                  </span>
                  <div>
                    <strong className="text-white">
                      Desmiente Mitos Cívicos:
                    </strong>{" "}
                    Interactúa con los personajes del Módulo Cívico 2D y
                    responde preguntas usando datos reales de la CCPC del INE.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-lg border border-purple-900/40">
                  <span className="font-mono font-bold text-purple-400 text-base">
                    02.
                  </span>
                  <div>
                    <strong className="text-white">Simulador de Voto:</strong>{" "}
                    Conoce cada paso del proceso en la casilla: desde entregar
                    tu credencial hasta la aplicación de tinta indeleble.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-lg border border-purple-900/40">
                  <span className="font-mono font-bold text-emerald-400 text-base">
                    03.
                  </span>
                  <div>
                    <strong className="text-white">Desbloqueo de Dalia:</strong>{" "}
                    Al completar al menos una escena, desbloquearás tu registro
                    anónimo para plantar tu Dalia en el mapa nacional.
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setCurrentScreen("splash")}
                type="button"
                className="mt-2 w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-sm tracking-widest uppercase rounded-lg border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                ¡ENTENDIDO! VOLVER AL MENÚ
              </button>
            </div>
          </div>
        )}

        {/* SCREEN: GAMEPLAY / SCENE SELECTOR */}
        {currentScreen === "gameplay" && (
          <div className="absolute inset-0 bg-[#adadb7] flex flex-col items-center justify-between p-6 z-20">
            {/* Top Bar inside Gameplay */}
            <div className="w-full flex items-center justify-between border-b border-slate-700/40 pb-3 pr-16">
              <button
                onClick={() => {
                  setCurrentScreen("splash");
                  setActiveScene(null);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-100 font-mono text-xs font-bold rounded border border-slate-700 flex items-center gap-2 transition"
              >
                <span>◀</span> MENÚ PRINCIPAL
              </button>

              <div className="font-mono text-xs text-slate-900 font-bold uppercase tracking-wider">
                {activeScene
                  ? `Escena Activa: ${activeScene.toUpperCase()}`
                  : "Selecciona una Escena"}
              </div>
            </div>

            {/* Main Gameplay Screen Content */}
            {!activeScene ? (
              <div className="flex-1 w-full flex flex-col items-center justify-center gap-6 py-4">
                <h3 className="font-mono font-bold text-lg text-slate-900 tracking-wider text-center">
                  ¿QUÉ ESCENA DESEAS REPRODUCIR?
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                  {/* Option 1: Mitos */}
                  <button
                    onClick={() => setActiveScene("mitos")}
                    className="p-5 bg-white hover:bg-slate-50 border-2 border-slate-400 hover:border-pink-500 rounded-xl text-left transition-all group shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                        💬
                      </div>
                      <h4 className="font-mono font-bold text-slate-900 text-base mb-1">
                        01. Desmentir Mitos
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Grafo de diálogo interactivo con datos oficiales de la
                        CCPC del INE.
                      </p>
                    </div>
                    <div className="mt-4 text-xs font-mono font-bold text-dalia-600 group-hover:translate-x-1 transition-transform">
                      INICIAR ESCENA ▶
                    </div>
                  </button>

                  {/* Option 2: Simulador */}
                  <button
                    onClick={() => setActiveScene("simulador")}
                    className="p-5 bg-slate-900 hover:bg-purple-950 border-2 border-purple-600/60 hover:border-pink-500 rounded-xl text-left transition-all group shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                        🗳️
                      </div>
                      <h4 className="font-mono font-bold text-white text-base mb-1">
                        02. Simulador de Voto
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed text-slate-600">
                        Emulador paso a paso de la experiencia de votar en la
                        casilla.
                      </p>
                    </div>
                    <div className="mt-4 text-xs font-mono font-bold text-pink-400 group-hover:translate-x-1 transition-transform">
                      INICIAR ESCENA ▶
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE SCENE CANVAS DISPLAY */
              <div className="flex-1 w-full flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-white border-2 border-slate-300 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-4 shadow-xl">
                  <div className="text-4xl animate-bounce">
                    {activeScene === "mitos" ? "🌸" : "🗳️"}
                  </div>
                  <h4 className="font-mono font-bold text-lg text-slate-900">
                    Cargando Escena:{" "}
                    {activeScene === "mitos"
                      ? "Desmentir Mitos Cívicos"
                      : "Simulador de Voto en Casilla"}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md">
                    Motor PixiJS inicializado. Renderizando sprites y mapa de
                    nodos 2D...
                  </p>

                  <div className="mt-4 flex gap-4">
                    <button
                      onClick={() => {
                        onModuleComplete?.(activeScene);
                        alert(
                          `¡Enhorabuena! Has completado la escena ${activeScene.toUpperCase()}. Se ha registrado tu progreso.`,
                        );
                      }}
                      className="px-5 py-2.5 bg-dalia-600 hover:bg-pink-500 text-white font-mono font-bold text-xs uppercase rounded-lg border-2 border-slate-900 shadow-md transition"
                    >
                      Completar Módulo y Desbloquear Dalia
                    </button>
                    <button
                      onClick={() => setActiveScene(null)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold rounded border border-slate-600 transition"
                    >
                      Cambiar Escena
                    </button>
                  </div>
                </div>
              </div>
            )}
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
