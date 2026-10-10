"use client";

import React, { useState, useRef, useEffect } from "react";
import { GameLoader } from "./GameLoader";

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

  return (
    <div
      ref={containerRef}
      className={
        "w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 " +
        (isFullscreen
          ? "fixed inset-0 z-50 max-w-none rounded-none flex flex-col justify-center items-center p-0 bg-slate-950"
          : "relative")
      }
    >
      <GameLoader onComplete={onModuleComplete} />
    </div>
  );
}
