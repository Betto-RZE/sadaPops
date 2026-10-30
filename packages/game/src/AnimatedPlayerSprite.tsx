import React, { useState, useEffect } from "react";
import { CastShadow } from "./features/sombras";

// Frame count definitions for each of the 8 character animation folders
export const PLAYER_FRAME_COUNTS: Record<string, number> = {
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
export const PRELOADED_PLAYER_IMAGES: Record<string, HTMLImageElement[]> = {};

export function preloadPlayerFolder(folder: string) {
  if (typeof window === "undefined" || PRELOADED_PLAYER_IMAGES[folder]) return;
  PRELOADED_PLAYER_IMAGES[folder] = [];
  const count = PLAYER_FRAME_COUNTS[folder] || 20;
  for (let i = 0; i < count; i++) {
    const img = new Image();
    img.src = `/assets/juego/player/${folder}/${i}.webp`;
    PRELOADED_PLAYER_IMAGES[folder].push(img);
  }
}

// Libera la cache de frames del personaje y aborta descargas pendientes (se llama al salir del juego)
export function releasePlayerImages() {
  for (const folder of Object.keys(PRELOADED_PLAYER_IMAGES)) {
    for (const img of PRELOADED_PLAYER_IMAGES[folder]) {
      img.src = "";
    }
    delete PRELOADED_PLAYER_IMAGES[folder];
  }
}

// Animated Player Sprite Component (Plays high quality PNG frame animations from walking1-4 & static1-4)
export const AnimatedPlayerSprite = React.memo(function AnimatedPlayerSprite({
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
      if (document.hidden) return;
      setFrameIndex((prev) => (prev + 1) % totalFrames);
    }, fps24Interval);

    return () => clearInterval(interval);
  }, [currentFolder, totalFrames]);

  const imageSrc = `/assets/juego/player/${currentFolder}/${frameIndex}.webp`;

  return (
    <div className="relative flex flex-col items-center justify-center w-full shrink-0">
      <CastShadow src={imageSrc} preset="character" />
      <img
        src={imageSrc}
        alt="Personaje Principal"
        className="w-full h-auto object-contain select-none pointer-events-none shrink-0"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
});
