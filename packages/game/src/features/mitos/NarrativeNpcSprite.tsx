import React, { useState, useEffect } from "react";
import {
  type NarrativeCharacterId,
  NARRATIVE_CHARACTERS_CONFIG,
  NARRATIVE_CHARACTERS_ANIMATION_CONFIG,
  getNarrativeCharacterSideFrameSrc,
  getNarrativeCharacterIdleSrc,
  preloadNarrativeCharactersImages,
} from "./ancianaConfig";
import { AncianaSprite } from "./AncianaSprite";
import { CastShadow } from "../sombras";

export interface NarrativeNpcSpriteProps {
  /** Identificador del personaje narrativo ("anciana" | "joven" | "indigena" | "transgenero" | "discapacitado") */
  characterId: NarrativeCharacterId;
  /** Indica si el personaje está caminando (animación de paso o ciclo de frames) */
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
 * Componente visual unificado para renderizar los 5 personajes narrativos en el escenario.
 * - Para Anciana, Joven, Indígena, Transgénero y Discapacitado: Reproduce su secuencia de caminata lateral a 24 FPS
 *   y cambia al sprite oficial IDLE al estar detenidos frente a la mesa directiva.
 * - Soporta volteo horizontal (transform: scaleX(-1)) cuando el personaje se retira caminando hacia la derecha.
 */
export const NarrativeNpcSprite = React.memo(function NarrativeNpcSprite({
  characterId,
  isWalking = false,
  facingDirection = "left",
  isPaused = false,
  className = "",
  style,
  altText,
}: NarrativeNpcSpriteProps) {
  // Precarga inicial de sprites en memoria
  useEffect(() => {
    preloadNarrativeCharactersImages();
  }, []);

  if (characterId === "anciana") {
    return (
      <AncianaSprite
        animation="side"
        isWalking={isWalking}
        facingDirection={facingDirection}
        isPaused={isPaused}
        className={className}
        style={style}
        altText={altText || "Doña Carmen"}
      />
    );
  }

  const animConfig = NARRATIVE_CHARACTERS_ANIMATION_CONFIG[characterId];
  const charConfig = NARRATIVE_CHARACTERS_CONFIG[characterId];
  const totalFrames = animConfig?.frameCount || 0;

  const [frameIndex, setFrameIndex] = useState(0);

  // Reiniciar frame al cambiar de personaje
  useEffect(() => {
    setFrameIndex(0);
  }, [characterId]);

  // Ciclo de animación a 24 FPS mientras camina y no está en pausa
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
  }, [characterId, isWalking, totalFrames, isPaused]);

  // Si cuenta con frames de caminata o sprite idle oficial (joven, indigena, transgenero)
  if (animConfig && (totalFrames > 0 || animConfig.idleSrc)) {
    const imageSrc =
      isWalking && totalFrames > 0
        ? getNarrativeCharacterSideFrameSrc(characterId, frameIndex)
        : getNarrativeCharacterIdleSrc(characterId);

    const label = altText || charConfig?.nameEs || characterId;

    return (
      <div
        data-testid={`narrative-sprite-${characterId}`}
        className={`relative flex flex-col items-center justify-center w-full shrink-0 select-none ${className}`}
        style={style}
      >
        <CastShadow
          src={imageSrc}
          preset="character"
          flipX={facingDirection === "right"}
        />
        <img
          src={imageSrc}
          alt={label}
          className="w-full h-auto object-contain select-none pointer-events-none shrink-0"
          style={{
            transform: facingDirection === "right" ? "scaleX(-1)" : "none",
            imageRendering: "pixelated",
          }}
        />
      </div>
    );
  }

  // Fallback para personajes sin secuencias de frames (ej. discapacitado)
  const label = altText || charConfig?.nameEs || characterId;

  return (
    <div
      data-testid={`narrative-sprite-${characterId}`}
      className={`relative flex flex-col items-center justify-center w-full shrink-0 select-none ${className}`}
      style={{
        ...style,
        animation:
          isWalking && !isPaused
            ? "narrativeSpriteBob 0.35s ease-in-out infinite alternate"
            : "none",
      }}
    >
      <style>{`
        @keyframes narrativeSpriteBob {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-3.5px); }
        }
      `}</style>
      {charConfig?.portraitSrc && (
        <CastShadow
          src={charConfig.portraitSrc}
          preset="character"
          flipX={facingDirection === "right"}
        />
      )}
      <img
        src={charConfig?.portraitSrc}
        alt={label}
        className="w-full h-auto object-contain select-none pointer-events-none shrink-0"
        style={{
          transform: facingDirection === "right" ? "scaleX(-1)" : "none",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
});
