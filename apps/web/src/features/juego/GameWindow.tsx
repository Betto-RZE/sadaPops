"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { GameLoader } from "./GameLoader";
import { PixelFullscreenButton } from "./PixelFullscreenButton";

interface GameWindowProps {
  onModuleComplete?: (moduleName: string) => void;
}

export function GameWindow({ onModuleComplete }: GameWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border-4 border-slate-800 bg-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 max-w-none rounded-none border-0 flex flex-col justify-center items-center p-4 bg-slate-950"
          : "relative"
      }`}
    >
      {/* Retro Arcade / Pixel-Art Window Title Bar */}
      <div className="w-full bg-slate-900 border-b-2 border-purple-900/60 px-4 py-3 flex items-center justify-between select-none">
        {/* Left Side: Window Retro Controls & Title */}
        <div className="flex items-center gap-3">
          {/* Decorative Pixel Window Dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-pink-500 border border-pink-700 shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-600 shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-600 shadow-sm"></span>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1"></div>

          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="text-pink-500 font-mono text-sm">🌸</span>
            <h2 className="text-xs sm:text-sm font-mono font-bold tracking-wider text-purple-200 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Modo Juego Pixel Art — Reto Cívico INE
            </h2>
          </div>
        </div>

        {/* Right Side: Pixel Art Fullscreen Button */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded border border-slate-700">
            {isFullscreen ? "FULLSCREEN" : "VENTANA"}
          </span>

          <PixelFullscreenButton
            isFullscreen={isFullscreen}
            onToggle={toggleFullscreen}
          />
        </div>
      </div>

      {/* Main Game Screen Canvas Housing */}
      <div
        className={`w-full ${isFullscreen ? "flex-1 flex items-center justify-center max-w-6xl" : "p-4 sm:p-6"}`}
      >
        <GameLoader onComplete={onModuleComplete} />
      </div>

      {/* Footer Info inside Game Window */}
      {!isFullscreen && (
        <div className="bg-slate-900/80 px-4 py-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Motor 2D PixiJS listo
          </span>
          <span>Presiona el ícono pixel art ↗️ para pantalla completa</span>
        </div>
      )}
    </div>
  );
}
