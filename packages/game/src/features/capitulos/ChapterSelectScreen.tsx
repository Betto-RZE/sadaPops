import React, { useEffect } from "react";
import {
  CHAPTERS,
  type ChapterCardImage,
  type ChapterDefinition,
  type ChapterId,
} from "./chapters";

/**
 * Pantalla "CAPITULOS": tres recuadros en fila, uno por capitulo.
 *
 * El area de imagen de cada recuadro esta VACIA a proposito. Para agregar el
 * arte final basta con llenar `cardImage` en CHAPTERS (chapters.ts); este
 * componente la ajusta al espacio con object-fit sin deformarla y no hay que
 * tocar la logica de navegacion ni de seleccion.
 */

export interface ChapterSelectScreenProps {
  /** Fondo de la pantalla (se reutiliza el arte del menu principal) */
  backgroundImageUrl: string;
  isFullscreen: boolean;
  /** true mientras hay una transicion en curso (bloquea clics y teclado) */
  disabled: boolean;
  onSelectChapter: (chapterId: ChapterId) => void;
  onBack: () => void;
}

const ARCADE_FONT = "'Press Start 2P', 'Silkscreen', monospace";

/** Area reservada para la imagen del capitulo (relacion 16:10). */
function ChapterCardImageSlot({ image }: { image?: ChapterCardImage }) {
  return (
    <div
      data-testid="chapter-card-image-slot"
      data-has-image={image ? "true" : "false"}
      className="relative w-full aspect-[16/10] overflow-hidden rounded-[0.45cqw] border-[0.25cqw] border-black bg-[#2a0a1c] shadow-[inset_0_0_0_0.2cqw_rgba(255,255,255,0.08),inset_0_0.6cqw_1.2cqw_rgba(0,0,0,0.55)]"
    >
      {image && (
        <img
          src={image.src}
          alt={image.alt}
          draggable={false}
          className="absolute inset-0 w-full h-full select-none pointer-events-none"
          style={{
            objectFit: image.fit ?? "cover",
            objectPosition: image.position ?? "center",
            imageRendering: "pixelated",
          }}
        />
      )}
    </div>
  );
}

function ChapterCard({
  chapter,
  disabled,
  onSelect,
}: {
  chapter: ChapterDefinition;
  disabled: boolean;
  onSelect: (id: ChapterId) => void;
}) {
  return (
    <button
      type="button"
      id={`chapter-card-${chapter.id}`}
      data-testid={`chapter-card-${chapter.id}`}
      aria-label={`Capítulo ${chapter.number}: ${chapter.title}`}
      disabled={disabled}
      onClick={() => onSelect(chapter.id)}
      className="group relative flex flex-col items-stretch text-left w-full p-[0.9cqw] gap-[0.9cqw] bg-[#f9d7ea] hover:bg-[#fbe3f0] rounded-[0.8cqw] border-[0.35cqw] border-[#b5146c] ring-2 ring-white ring-inset shadow-[0.5cqw_0.5cqw_0_0_#7a0c47] cursor-pointer select-none transition-all duration-150 hover:-translate-y-[0.35cqw] hover:shadow-[0.5cqw_0.85cqw_0_0_#7a0c47] active:translate-x-[0.3cqw] active:translate-y-[0.3cqw] active:shadow-none focus-visible:outline-none focus-visible:ring-[0.35cqw] focus-visible:ring-[#ffe14d] disabled:cursor-default"
    >
      <ChapterCardImageSlot image={chapter.cardImage} />

      {/* Etiqueta independiente con numero y nombre (fuera del area de imagen) */}
      <div className="flex flex-col items-start gap-[0.7cqw] px-[0.2cqw] pb-[0.3cqw] min-h-[6.4cqw]">
        <span
          className="inline-block bg-[#b5146c] text-white border-[0.2cqw] border-black rounded-[0.35cqw] px-[0.7cqw] py-[0.45cqw] leading-none tracking-wider uppercase"
          style={{
            fontFamily: ARCADE_FONT,
            fontSize: "clamp(6px, 0.95cqw, 13px)",
            textShadow: "1px 1px 0 #000",
          }}
        >
          Capítulo {chapter.number}
        </span>
        <span
          className="text-black font-black uppercase leading-[1.45] tracking-wide"
          style={{
            fontFamily: ARCADE_FONT,
            fontSize: "clamp(7px, 1.2cqw, 17px)",
            textShadow: "1px 1px 0 #ffffff",
          }}
        >
          {chapter.title}
        </span>
      </div>
    </button>
  );
}

export function ChapterSelectScreen({
  backgroundImageUrl,
  isFullscreen,
  disabled,
  onSelectChapter,
  onBack,
}: ChapterSelectScreenProps) {
  // Escape regresa al menu principal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disabled) onBack();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, onBack]);

  return (
    <section
      aria-labelledby="chapter-select-title"
      className="absolute inset-0 w-full h-full z-20 overflow-hidden select-none"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen:wght@400;700&display=swap');
        @keyframes chapterCardIn {
          from { opacity: 0; transform: translateY(1.2cqw); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Fondo: arte del menu atenuado */}
      <img
        src={backgroundImageUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover bg-slate-950"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0410]/85 via-[#2a0a1c]/75 to-[#1a0410]/90" />

      {/* Boton volver (mismo estilo que el HUD del juego) */}
      <div className="absolute top-3 left-3 z-30">
        <button
          type="button"
          id="chapter-select-back"
          onClick={onBack}
          disabled={disabled}
          aria-label="Volver al menú principal"
          className={`bg-[#f9d7ea] hover:bg-[#f6c2e0] rounded-md ring-2 ring-white ring-inset active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center cursor-pointer font-mono font-black text-black shrink-0 ${
            isFullscreen
              ? "w-12 h-12 text-xl border-[4px] border-[#b5146c] shadow-[4px_4px_0px_0px_#7a0c47]"
              : "w-9 h-9 text-sm border-[3px] border-[#b5146c] shadow-[3px_3px_0px_0px_#7a0c47]"
          }`}
        >
          <span>◀</span>
        </button>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-[3cqw] px-[5cqw]">
        <header className="flex flex-col items-center text-center gap-[1.2cqw]">
          <h2
            id="chapter-select-title"
            className="font-black uppercase tracking-wider leading-none text-white"
            style={{
              fontFamily: ARCADE_FONT,
              fontSize: "3.2cqw",
              textShadow:
                "3px 3px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 5px 5px 0px #940d57, 7px 7px 0px #400624",
            }}
          >
            Capítulos
          </h2>
          <p
            className="text-pink-200 uppercase tracking-wide leading-normal"
            style={{
              fontFamily: ARCADE_FONT,
              fontSize: "clamp(6px, 1.05cqw, 14px)",
              textShadow: "2px 2px 0px #000",
            }}
          >
            Elige un capítulo · Al terminarlo volverás al menú
          </p>
        </header>

        <ul className="grid grid-cols-3 gap-[2.6cqw] w-full max-w-[90cqw] items-stretch list-none m-0 p-0">
          {CHAPTERS.map((chapter, index) => (
            <li
              key={chapter.id}
              className="flex"
              style={{
                animation: `chapterCardIn 420ms ${120 + index * 90}ms ease-out both`,
              }}
            >
              <ChapterCard
                chapter={chapter}
                disabled={disabled}
                onSelect={onSelectChapter}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
