import React, { useState, useEffect } from "react";
import {
  type AncianaAnimation,
  ANCIANA_FRAME_COUNTS,
  getAncianaFrameSrc,
  preloadAncianaImages,
} from "./ancianaConfig";

export interface AncianaSpriteProps {
  /** Animación actual ('side' | 'front' | 'back') */
  animation?: AncianaAnimation;
  /** Indica si el personaje está caminando (reproduce ciclo de frames a 24 FPS) */
  isWalking?: boolean;
  /** Pausa la animación si el juego está en pausa */
  isPaused?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Estilos en línea para el contenedor */
  style?: React.CSSProperties;
  /** Etiqueta accesible */
  altText?: string;
}

/**
 * Componente visual para renderizar el sprite animado de la Anciana (Abuela).
 *
 * Reproduce las secuencias PNG a 24 FPS (~41.67ms por frame).
 * Cuando isWalking es false, se mantiene en el primer frame (frame 0) de la animación actual.
 */
export const AncianaSprite = React.memo(function AncianaSprite({
  animation = "side",
  isWalking = false,
  isPaused = false,
  className = "",
  style,
  altText = "Abuela Votante",
}: AncianaSpriteProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const totalFrames = ANCIANA_FRAME_COUNTS[animation] || 1;

  // Precarga inicial de las animaciones en memoria
  useEffect(() => {
    preloadAncianaImages();
  }, []);

  // Reinicia el índice al cambiar de animación
  useEffect(() => {
    setFrameIndex(0);
  }, [animation]);

  // Ciclo de animación a 24 FPS únicamente mientras camina y no está en pausa
  useEffect(() => {
    if (!isWalking || totalFrames <= 1 || isPaused) {
      setFrameIndex(0);
      return;
    }

    const fps24Interval = 1000 / 24;
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setFrameIndex((prev) => (prev + 1) % totalFrames);
    }, fps24Interval);

    return () => clearInterval(interval);
  }, [animation, isWalking, totalFrames, isPaused]);

  const imageSrc = getAncianaFrameSrc(animation, frameIndex);

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full shrink-0 ${className}`}
      style={style}
    >
      <img
        src={imageSrc}
        alt={altText}
        className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-md shrink-0"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
});
