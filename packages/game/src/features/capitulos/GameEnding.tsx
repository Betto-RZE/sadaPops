import React from "react";

/**
 * Final del juego (solo en modalidad FULL_GAME, al terminar el capitulo 3).
 * Version provisional: se reemplazara por el cierre narrativo definitivo.
 */

const ARCADE_FONT = "'Press Start 2P', 'Silkscreen', monospace";

export interface GameEndingProps {
  stageImageUrl: string;
  /** true mientras hay una transicion en curso */
  disabled: boolean;
  onReturnToMenu: () => void;
}

export default function GameEnding({
  stageImageUrl,
  disabled,
  onReturnToMenu,
}: GameEndingProps) {
  return (
    <div
      data-testid="game-ending"
      className="absolute inset-0 w-full h-full z-20 overflow-hidden bg-[#2d572c] select-none"
    >
      <img
        src={stageImageUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#400624]/60 to-black/75" />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-[2.6cqw] p-[4cqw] text-center">
        <h2
          className="text-white font-black uppercase tracking-wider leading-tight"
          style={{
            fontFamily: ARCADE_FONT,
            fontSize: "3.4cqw",
            textShadow:
              "3px 3px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 5px 5px 0px #940d57, 7px 7px 0px #400624",
          }}
        >
          ¡Jornada completada!
        </h2>
        <p
          className="text-pink-100 leading-relaxed max-w-[70cqw]"
          style={{
            fontFamily: ARCADE_FONT,
            fontSize: "clamp(7px, 1.3cqw, 16px)",
            textShadow: "2px 2px 0px #000",
          }}
        >
          Terminaste los tres capítulos de Voces en Casilla.
        </p>
        <button
          type="button"
          id="game-ending-menu"
          disabled={disabled}
          onClick={onReturnToMenu}
          className="bg-[#f9d7ea] hover:bg-[#f6c2e0] text-black rounded-md ring-2 ring-white ring-inset border-[4px] border-[#b5146c] shadow-[4px_4px_0px_0px_#7a0c47] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all px-[2.4cqw] py-[1.2cqw] font-black uppercase tracking-widest cursor-pointer disabled:cursor-default"
          style={{
            fontFamily: ARCADE_FONT,
            fontSize: "clamp(8px, 1.4cqw, 18px)",
          }}
        >
          Volver al menú
        </button>
      </div>
    </div>
  );
}
