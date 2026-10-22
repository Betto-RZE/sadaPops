import React, { useState, useEffect } from "react";
import {
  type AncianaAnimation,
  ANCIANA_FRAME_COUNTS,
  getAncianaFrameSrc,
  preloadAncianaImages,
} from "./ancianaConfig";

export interface AncianaSpriteProps {
  /** Animación actual ('side' | 'front' | 'back' | 'idle') */
  animation?: AncianaAnimation | "idle";
  /** Indica si el personaje está caminando (reproduce ciclo de frames a 24 FPS) */
  isWalking?: boolean;
  /** Dirección hacia donde mira el personaje ('left' al llegar o en mesa, 'right' al retirarse) */
  facingDirection?: "left" | "right";
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
 * Cuando isWalking es false y está en la mesa, muestra el sprite oficial anciana-idle.png.
 */
export const AncianaSprite = React.memo(function AncianaSprite({
  animation = "side",
  isWalking = false,
  facingDirection = "left",
  isPaused = false,
  className = "",
  style,
  altText = "Abuela Votante",
}: AncianaSpriteProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const totalFrames =
    animation === "idle" ? 1 : ANCIANA_FRAME_COUNTS[animation as AncianaAnimation] || 1;

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

  // Si no está caminando en vista lateral o está en idle, cambia a anciana-idle.png
  const imageSrc =
    animation === "idle" || (animation === "side" && !isWalking)
      ? "/assets/juego/personajes/anciana/anciana-idle.png"
      : getAncianaFrameSrc(animation as AncianaAnimation, frameIndex);

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full shrink-0 ${className}`}
      style={style}
    >
      <img
        src={imageSrc}
        alt={altText}
        className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-md shrink-0"
        style={{
          transform: facingDirection === "right" ? "scaleX(-1)" : "none",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
});
