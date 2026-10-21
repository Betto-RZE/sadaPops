import React from "react";
import {
  type NarrativeCharacterId,
  NARRATIVE_CHARACTERS_CONFIG,
} from "./ancianaConfig";
import { AncianaSprite } from "./AncianaSprite";

export interface NarrativeNpcSpriteProps {
  /** Identificador del personaje narrativo ("anciana" | "joven" | "indigena" | "transgenero" | "discapacitado") */
  characterId: NarrativeCharacterId;
  /** Indica si el personaje está caminando (animación de paso o ciclo de frames) */
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
 * Componente visual unificado para renderizar los 5 personajes narrativos en el escenario.
 * - Para la Anciana (Abuela): Utiliza su animación completa de frames sprite PNG (AncianaSprite).
 * - Para los demás personajes (Joven, Indígena, Transgénero, Discapacitado): Muestra su retrato
 *   lateral pixel art estilizado con balanceo de caminata, listo para conectarse a sus secuencias
 *   de frames cuando sean incorporadas.
 */
export const NarrativeNpcSprite = React.memo(function NarrativeNpcSprite({
  characterId,
  isWalking = false,
  isPaused = false,
  className = "",
  style,
  altText,
}: NarrativeNpcSpriteProps) {
  if (characterId === "anciana") {
    return (
      <AncianaSprite
        animation="side"
        isWalking={isWalking}
        isPaused={isPaused}
        className={className}
        style={style}
        altText={altText || "Doña Carmen"}
      />
    );
  }

  const config = NARRATIVE_CHARACTERS_CONFIG[characterId];
  const label = altText || config?.nameEs || characterId;

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
      <img
        src={config?.portraitSrc}
        alt={label}
        className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.55)] shrink-0"
        style={{
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
});
