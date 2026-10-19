import React, { useState, useEffect } from "react";
import type { GenericNpcAnimation } from "./genericNpcTypes";
import {
  GENERIC_NPC_FRAME_COUNTS,
  getGenericNpcFrameSrc,
  preloadGenericNpcImages,
} from "./genericNpcConfig";

export interface GenericNpcSpriteProps {
  /** Animación actual ('back' | 'front' | 'idle') */
  animation: GenericNpcAnimation;
  /** Clases CSS adicionales */
  className?: string;
  /** Estilos en línea para el contenedor */
  style?: React.CSSProperties;
  /** Etiqueta accesible para lectores de pantalla */
  altText?: string;
}

/**
 * Componente visual para renderizar el sprite animado del personaje genérico.
 *
 * Reproduce las secuencias PNG a 24 FPS (~41.67ms por frame), idéntico al motor del jugador.
 * En estado 'idle', muestra el frame estático sin costo de temporizadores.
 */
export const GenericNpcSprite = React.memo(function GenericNpcSprite({
  animation,
  className = "",
  style,
  altText = "Ciudadano Votante",
}: GenericNpcSpriteProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const totalFrames = GENERIC_NPC_FRAME_COUNTS[animation] || 1;

  // Precarga inicial de las animaciones del personaje genérico
  useEffect(() => {
    preloadGenericNpcImages();
  }, []);

  // Reinicia el índice al cambiar de animación
  useEffect(() => {
    setFrameIndex(0);
  }, [animation]);

  // Ciclo de animación a 24 FPS únicamente si la animación tiene más de 1 cuadro
  useEffect(() => {
    if (totalFrames <= 1) return;

    const fps24Interval = 1000 / 24;
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % totalFrames);
    }, fps24Interval);

    return () => clearInterval(interval);
  }, [animation, totalFrames]);

  const imageSrc = getGenericNpcFrameSrc(animation, frameIndex);

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
