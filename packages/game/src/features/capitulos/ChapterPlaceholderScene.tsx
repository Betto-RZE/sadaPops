import React, { useState, useEffect } from "react";
import type { ChapterDefinition } from "./chapters";
import type { ChapterSceneProps } from "./ChapterSceneRouter";
import { PixelSpeechBubble } from "../../PixelSpeechBubble";
import {
  getChapterHandoff,
  CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES,
  CAP2_OUTRO_CAP3_INTRO_MESSAGES_NAH,
} from "./chapterHandoff";

/**
 * ESCENA PROVISIONAL para capitulos que aun no estan implementados (2 y 3).
 * Permite probar el flujo completo de capitulos (FULL_GAME / SINGLE_CHAPTER).
 * Cuando el capitulo real exista, se reemplaza su entrada en ChapterSceneRouter
 * y este archivo puede eliminarse.
 */

const ARCADE_FONT = "'Press Start 2P', 'Silkscreen', monospace";

export default function ChapterPlaceholderScene({
  chapter,
  language = "es",
  stageImageUrl,
  isFullscreen,
  isTransitioning,
  isPaused,
  onRequestExit,
  onChapterComplete,
}: ChapterSceneProps & { chapter: ChapterDefinition }) {
  const hasSeenBridge = Boolean(getChapterHandoff()?.fromChapter2Ending);
  const [dialogueState, setDialogueState] = useState<
    "entering" | "visible" | "exiting" | "dismissed"
  >(() => (chapter.id === 3 && !hasSeenBridge ? "entering" : "dismissed"));

  useEffect(() => {
    if (dialogueState === "entering") {
      const timer = setTimeout(() => setDialogueState("visible"), 350);
      return () => clearTimeout(timer);
    }
    if (dialogueState === "exiting") {
      const timer = setTimeout(() => setDialogueState("dismissed"), 350);
      return () => clearTimeout(timer);
    }
  }, [dialogueState]);

  const isLocked = isPaused || isTransitioning || dialogueState !== "dismissed";

  return (
    <div
      data-testid={`chapter-scene-${chapter.id}`}
      className="absolute inset-0 w-full h-full z-20 overflow-hidden bg-[#2d572c] select-none"
    >
      <img
        src={chapter.cardImage?.src ?? stageImageUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* HUD: volver al menu (abre el modal de confirmacion) */}
      <div className="absolute top-3 left-3 z-30">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRequestExit();
          }}
          aria-label="Volver al menú principal"
          className={`bg-[#f9d7ea] hover:bg-[#f6c2e0] rounded-md ring-2 ring-white ring-inset active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-colors flex items-center justify-center cursor-pointer font-mono font-black text-black shrink-0 ${
            isFullscreen
              ? "w-12 h-12 text-xl border-[4px] border-[#b5146c] shadow-[4px_4px_0px_0px_#7a0c47]"
              : "w-9 h-9 text-sm border-[3px] border-[#b5146c] shadow-[3px_3px_0px_0px_#7a0c47]"
          }`}
        >
          <span>◀</span>
        </button>
      </div>

      <div className="relative z-10 w-full h-full flex items-center justify-center p-[4cqw]">
        <div className="relative w-[min(62cqw,620px)] bg-[#f9d7ea] border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_#400624,12px_12px_0px_0px_rgba(0,0,0,0.85)] p-[2.6cqw] flex flex-col items-center text-center gap-[1.8cqw]">
          <span
            className="bg-[#b5146c] text-white border-[2px] border-black rounded-md px-[1cqw] py-[0.6cqw] uppercase tracking-wider leading-none"
            style={{
              fontFamily: ARCADE_FONT,
              fontSize: "clamp(7px, 1.1cqw, 14px)",
              textShadow: "1px 1px 0 #000",
            }}
          >
            Capítulo {chapter.number}
          </span>
          <h2
            className="text-[#7a0c47] font-black uppercase leading-snug tracking-wider"
            style={{
              fontFamily: ARCADE_FONT,
              fontSize: "clamp(10px, 2.2cqw, 26px)",
              textShadow: "2px 2px 0px #ffffff",
            }}
          >
            {chapter.title}
          </h2>
          <p
            className="text-black leading-relaxed"
            style={{
              fontFamily: ARCADE_FONT,
              fontSize: "clamp(6px, 1.05cqw, 13px)",
            }}
          >
            Este capítulo está en construcción.
          </p>
          <button
            type="button"
            id={`chapter-${chapter.id}-complete`}
            data-testid="chapter-complete-button"
            disabled={isLocked}
            onClick={onChapterComplete}
            className="bg-[#b5146c] hover:bg-[#9c0f5a] disabled:opacity-60 text-white border-[3px] border-black font-black uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all px-[2cqw] py-[1.1cqw] rounded-xl cursor-pointer disabled:cursor-default"
            style={{
              fontFamily: ARCADE_FONT,
              fontSize: "clamp(7px, 1.15cqw, 14px)",
              textShadow: "1px 1px 0 #000",
            }}
          >
            ✔ Terminar capítulo (test)
          </button>
        </div>
      </div>

      {/* DIÁLOGO INTRODUCTORIO DEL CAPÍTULO 3 (INECITO) */}
      {chapter.id === 3 && dialogueState !== "dismissed" && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-center pb-[1.8cqw] px-[2cqw] overflow-hidden select-none">
          <div className="relative z-10 w-[96%] pointer-events-auto flex flex-col items-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDialogueState("exiting");
              }}
              type="button"
              title="Saltar diálogo inicial (Test)"
              className="mb-1.5 bg-[#940d57] hover:bg-[#ff2a85] active:bg-[#780946] text-white rounded border-[2px] border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-colors flex items-center gap-1.5 px-3 py-1 select-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              style={{
                fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                fontSize: isFullscreen ? "10px" : "8px",
              }}
            >
              <span>⏩</span>
              <span>SALTAR TEXTOS (TEST)</span>
            </button>

            <PixelSpeechBubble
              speaker={language === "nah" ? "Inecito Cívica" : "Inecito"}
              messages={
                language === "nah"
                  ? (CAP2_OUTRO_CAP3_INTRO_MESSAGES_NAH as unknown as string[])
                  : (CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES as unknown as string[])
              }
              actionKey="E"
              disabled={isPaused}
              isDismissing={dialogueState === "exiting"}
              onDismiss={() => setDialogueState("exiting")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
