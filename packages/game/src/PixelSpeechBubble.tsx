import React, { useState, useEffect, useCallback, useRef } from "react";

export interface PixelSpeechBubbleProps {
  speaker?: string;
  text: string;
  onDismiss: () => void;
  actionKey?: string;
  typingSpeedMs?: number;
  className?: string;
  isDismissing?: boolean;
  disabled?: boolean;
}

/**
 * PixelSpeechBubble
 * Reusable Retro Pixel Art Speech Bubble Component:
 * - Real-time typewriter printing animation with punctuation pauses
 * - Skip typewriter on first press / dismiss on second press
 * - 100% pixel art fonts ('Pixelify Sans' & 'Press Start 2P')
 * - Square arcade action button containing solely the keycap letter ('E')
 */
export function PixelSpeechBubble({
  speaker = "Inecito",
  text,
  onDismiss,
  actionKey = "E",
  typingSpeedMs = 26,
  className = "",
  isDismissing = false,
  disabled = false,
}: PixelSpeechBubbleProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const skipTyping = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setDisplayedLength(text.length);
    setIsTyping(false);
  }, [text.length]);

  const handleAdvance = useCallback(() => {
    if (disabled) return;
    if (isTyping) {
      skipTyping();
    } else {
      onDismiss();
    }
  }, [disabled, isTyping, skipTyping, onDismiss]);

  // Real-time typewriter animation effect
  useEffect(() => {
    if (!text) return;
    setDisplayedLength(0);
    setIsTyping(true);

    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        currentIndex++;
        setDisplayedLength(currentIndex);

        const char = text[currentIndex - 1];
        // Organic typing cadence: subtle pause on punctuation marks
        let delay = typingSpeedMs;
        if (char === "." || char === "!" || char === "?") {
          delay += 95;
        } else if (char === "," || char === ";") {
          delay += 40;
        }

        typingTimerRef.current = setTimeout(typeNextChar, delay);
      } else {
        setIsTyping(false);
      }
    };

    // Brief initial delay before starting character printing
    typingTimerRef.current = setTimeout(typeNextChar, 100);

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [text, typingSpeedMs]);

  // Keyboard shortcut listener (default 'E' key)
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === actionKey.toLowerCase()) {
        e.preventDefault();
        handleAdvance();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, handleAdvance, actionKey]);

  const displayedText = text.slice(0, displayedLength);

  return (
    <div
      className={`relative z-10 w-full aspect-[2012/380] transition-all duration-300 ease-out ${
        isDismissing
          ? "translate-y-44 opacity-0 scale-95"
          : "translate-y-0 opacity-100 scale-100"
      } ${className}`}
    >
      {/* Pixel Art Dialogue Balloon Image Asset (Cropped to exact border) */}
      <img
        src="/assets/juego/globo-texto.png"
        alt="Globo de Texto"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0 drop-shadow-[0_8px_20px_rgba(0,0,0,0.65)]"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Writable White Interior Container (Fits precisely within the 6.3% top & 7.6% bottom black border) */}
      <div className="absolute inset-x-0 top-[7.5%] bottom-[8.5%] px-[4%] flex items-center justify-between z-10">
        {/* Left Column: Speaker in top-left, Text directly below */}
        <div className="flex-1 h-full flex flex-col justify-start items-start pr-[1cqw] overflow-hidden pt-[0.2cqw]">
          {speaker && (
            <span
              className="text-[#a81363] font-bold uppercase tracking-wider select-none shrink-0"
              style={{
                fontFamily:
                  "'Press Start 2P', 'Silkscreen', monospace, sans-serif",
                fontSize: "clamp(10px, 1.6cqw, 32px)",
                marginBottom: "clamp(2px, 0.35cqw, 8px)",
                textShadow: "1px 1px 0px rgba(255,255,255,0.9)",
              }}
            >
              {speaker}
            </span>
          )}
          <p
            className="text-black font-semibold select-none overflow-y-auto w-full"
            style={{
              fontFamily:
                "'Pixelify Sans', 'Silkscreen', 'Press Start 2P', monospace, sans-serif",
              fontSize: "clamp(13px, 2.3cqw, 46px)",
              lineHeight: 1.25,
              textShadow: "0 1px 0 rgba(255,255,255,0.85)",
            }}
          >
            {displayedText}
            {isTyping && (
              <span
                className="inline-block bg-[#a81363] animate-pulse align-middle"
                style={{
                  width: "0.42em",
                  height: "0.92em",
                  marginLeft: "0.2em",
                }}
                aria-hidden="true"
              />
            )}
          </p>
        </div>

        {/* Right Column: Square Pixel Art Action Button */}
        <button
          onClick={handleAdvance}
          type="button"
          aria-label={`Avanzar diálogo (${actionKey})`}
          className="shrink-0 aspect-square bg-[#940d57] hover:bg-[#b5146c] active:bg-[#780946] text-white transition-all flex items-center justify-center cursor-pointer select-none group"
          style={{
            width: "clamp(32px, 5.2cqw, 102px)",
            height: "clamp(32px, 5.2cqw, 102px)",
            borderRadius: "clamp(6px, 0.9cqw, 18px)",
            borderWidth: "clamp(2px, 0.28cqw, 5.5px)",
            borderColor: "#000000",
            borderStyle: "solid",
            boxShadow:
              "clamp(2px, 0.35cqw, 7px) clamp(2px, 0.35cqw, 7px) 0px 0px #000000",
            marginLeft: "clamp(6px, 1.2cqw, 24px)",
            marginRight: "clamp(4px, 1cqw, 20px)",
            padding: "clamp(2px, 0.35cqw, 7px)",
            fontFamily: "'Press Start 2P', 'Silkscreen', monospace, sans-serif",
          }}
        >
          <div
            className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white/20 to-transparent"
            style={{
              borderRadius: "clamp(4px, 0.65cqw, 13px)",
              borderWidth: "clamp(1.5px, 0.2cqw, 4px)",
              borderColor: "rgba(255, 255, 255, 0.85)",
              borderStyle: "solid",
            }}
          >
            <span
              className="text-white font-black leading-none drop-shadow-[0_2px_0_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform"
              style={{
                fontSize: "clamp(10px, 1.9cqw, 38px)",
              }}
            >
              {actionKey}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
