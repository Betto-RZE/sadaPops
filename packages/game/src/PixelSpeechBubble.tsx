import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";

export interface DialogueLine {
  speaker?: string;
  speakerColor?: string;
  text: string;
  actionKey?: string;
  /** Destinatario del diálogo: "user" (habla con nosotros -> frente/cámara) | "npc" (habla con otro personaje -> derecha) */
  target?: "user" | "npc";
}

export interface PixelSpeechBubbleProps {
  /** Optional single speaker (fallback for lines without specific speaker) */
  speaker?: string;
  /** Optional single text for single-message bubbles */
  text?: string;
  /** Array of dialogue lines or strings representing the conversation */
  messages?: Array<DialogueLine | string>;
  /** Callback triggered when user finishes the final message and bubble dismisses */
  onDismiss: () => void;
  /** Optional callback triggered on advancing to next message step */
  onAdvance?: (stepIndex: number, currentLine: DialogueLine) => void;
  /** Callback triggered whenever the current dialogue line changes */
  onLineChange?: (line: DialogueLine, stepIndex: number) => void;
  actionKey?: string;
  typingSpeedMs?: number;
  className?: string;
  isDismissing?: boolean;
  disabled?: boolean;
}

/**
 * PixelSpeechBubble
 * Reusable Retro Pixel Art Speech Bubble Component:
 * - Supports single messages and multi-line conversation sequences
 * - Real-time typewriter printing animation with punctuation pauses
 * - Press [E] once while typing: skips typewriter and immediately shows full text
 * - Press [E] when text is complete: advances to next message in conversation
 * - Press [E] on final message: closes speech bubble and invokes onDismiss
 * - 100% pixel art fonts ('Pixelify Sans' & 'Press Start 2P')
 * - Proportional container-query scaling across window and fullscreen modes
 */
export function PixelSpeechBubble({
  speaker = "Inecito",
  text,
  messages,
  onDismiss,
  onAdvance,
  onLineChange,
  actionKey = "E",
  typingSpeedMs = 26,
  className = "",
  isDismissing = false,
  disabled = false,
}: PixelSpeechBubbleProps) {
  // Normalize messages prop or fallback to single text
  const normalizedLines: DialogueLine[] = useMemo(() => {
    if (messages && messages.length > 0) {
      return messages.map((item) => {
        if (typeof item === "string") {
          return { speaker, text: item, actionKey };
        }
        return {
          speaker: item.speaker !== undefined ? item.speaker : speaker,
          speakerColor: item.speakerColor,
          text: item.text,
          actionKey: item.actionKey ?? actionKey,
          target: item.target,
        };
      });
    }
    if (text) {
      return [{ speaker, text, actionKey }];
    }
    return [];
  }, [messages, speaker, text, actionKey]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentLine = normalizedLines[currentStepIndex] || {
    speaker,
    text: "",
    actionKey,
  };

  useEffect(() => {
    if (currentLine && currentLine.text) {
      onLineChange?.(currentLine, currentStepIndex);
    }
  }, [currentStepIndex, currentLine, onLineChange]);
  const currentText = currentLine.text;
  const currentSpeaker = currentLine.speaker;
  const currentSpeakerColor = currentLine.speakerColor || "#a81363";
  const currentActionKey = currentLine.actionKey || actionKey;

  const [displayedLength, setDisplayedLength] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate a content fingerprint to avoid resetting on re-renders (e.g. fullscreen toggle)
  const messagesFingerprint = useMemo(() => {
    if (messages && messages.length > 0) {
      return messages
        .map((m) =>
          typeof m === "string"
            ? m
            : `${m.speaker || ""}:${m.text}:${m.actionKey || ""}`,
        )
        .join("|||");
    }
    return text || "";
  }, [messages, text]);

  const lastFingerprintRef = useRef(messagesFingerprint);

  // Only reset dialogue sequence if the dialogue content actually changed
  useEffect(() => {
    if (lastFingerprintRef.current !== messagesFingerprint) {
      lastFingerprintRef.current = messagesFingerprint;
      setCurrentStepIndex(0);
      setDisplayedLength(0);
      setIsTyping(true);
    }
  }, [messagesFingerprint]);

  const skipTyping = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setDisplayedLength(currentText.length);
    setIsTyping(false);
  }, [currentText.length]);

  const handleAdvance = useCallback(() => {
    if (disabled || normalizedLines.length === 0) return;

    // 1. Press E while typing: skip typewriter animation immediately
    if (isTyping) {
      skipTyping();
      return;
    }

    // 2. Press E when text is fully displayed:
    if (currentStepIndex < normalizedLines.length - 1) {
      // Clear ongoing timers and reset typing state for next text
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      setDisplayedLength(0);
      setIsTyping(true);
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onAdvance?.(nextIndex, normalizedLines[nextIndex]);
      return;
    }

    // 3. Last message in conversation: Close speech bubble
    onDismiss();
  }, [
    disabled,
    normalizedLines,
    isTyping,
    skipTyping,
    currentStepIndex,
    onAdvance,
    onDismiss,
  ]);

  // Real-time typewriter animation effect
  useEffect(() => {
    if (!currentText) return;
    setDisplayedLength(0);
    setIsTyping(true);

    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex < currentText.length) {
        currentIndex++;
        setDisplayedLength(currentIndex);

        const char = currentText[currentIndex - 1];
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
  }, [currentText, currentStepIndex, typingSpeedMs]);

  // Animation state for tactile button press (click or keyboard: E, ENTER, SPACE)
  const [isPressed, setIsPressed] = useState(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerPressAnimation = useCallback(() => {
    setIsPressed(true);
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
    pressTimerRef.current = setTimeout(() => {
      setIsPressed(false);
    }, 140);
  }, []);

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
      }
    };
  }, []);

  // Keyboard shortcut listener (Action key 'E', ENTER, SPACE)
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const isActionKey =
        k === currentActionKey.toLowerCase() ||
        k === "enter" ||
        k === " " ||
        e.code === "Enter" ||
        e.code === "Space";

      if (isActionKey) {
        e.preventDefault();
        triggerPressAnimation();
        handleAdvance();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, handleAdvance, currentActionKey, triggerPressAnimation]);

  const displayedText = currentText.slice(0, displayedLength);

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
          {currentSpeaker && (
            <span
              className="font-bold uppercase tracking-wider select-none shrink-0"
              style={{
                color: currentSpeakerColor,
                fontFamily:
                  "'Press Start 2P', 'Silkscreen', monospace, sans-serif",
                fontSize: "clamp(10px, 1.6cqw, 32px)",
                marginBottom: "clamp(2px, 0.35cqw, 8px)",
                textShadow: "1px 1px 0px rgba(255,255,255,0.9)",
              }}
            >
              {currentSpeaker}
            </span>
          )}
          <p
            className="text-black font-semibold select-none overflow-y-auto w-full"
            style={{
              fontFamily:
                "'Pixelify Sans', 'Silkscreen', 'Press Start 2P', monospace, sans-serif",
              fontSize: "clamp(11.5px, 2.0cqw, 40px)",
              lineHeight: 1.2,
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
          onClick={() => {
            triggerPressAnimation();
            handleAdvance();
          }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => triggerPressAnimation()}
          onMouseLeave={() => setIsPressed(false)}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => triggerPressAnimation()}
          type="button"
          aria-label={`Avanzar diálogo (${currentActionKey}, Enter o Espacio)`}
          className="shrink-0 aspect-square bg-[#940d57] hover:bg-[#b5146c] text-white transition-all flex items-center justify-center cursor-pointer select-none group"
          style={{
            width: "clamp(32px, 5.2cqw, 102px)",
            height: "clamp(32px, 5.2cqw, 102px)",
            borderRadius: "clamp(6px, 0.9cqw, 18px)",
            borderWidth: "clamp(2px, 0.28cqw, 5.5px)",
            borderColor: "#000000",
            borderStyle: "solid",
            boxShadow: isPressed
              ? "0px 0px 0px 0px #000000"
              : "clamp(2px, 0.35cqw, 7px) clamp(2px, 0.35cqw, 7px) 0px 0px #000000",
            transform: isPressed
              ? "translate(clamp(2px, 0.35cqw, 7px), clamp(2px, 0.35cqw, 7px))"
              : "translate(0px, 0px)",
            backgroundColor: isPressed ? "#780946" : undefined,
            marginLeft: "clamp(6px, 1.2cqw, 24px)",
            marginRight: "clamp(4px, 1cqw, 20px)",
            padding: "clamp(2px, 0.35cqw, 7px)",
            fontFamily: "'Press Start 2P', 'Silkscreen', monospace, sans-serif",
            transition:
              "transform 70ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 70ms cubic-bezier(0.4, 0, 0.2, 1), background-color 70ms ease-out",
          }}
        >
          <div
            className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white/20 to-transparent"
            style={{
              borderRadius: "clamp(4px, 0.65cqw, 13px)",
              borderWidth: "clamp(1.5px, 0.2cqw, 4px)",
              borderColor: isPressed
                ? "rgba(255, 255, 255, 0.45)"
                : "rgba(255, 255, 255, 0.85)",
              borderStyle: "solid",
              transition: "border-color 70ms ease-out",
            }}
          >
            <span
              className={`text-white font-black leading-none drop-shadow-[0_2px_0_rgba(0,0,0,0.8)] transition-transform ${
                isPressed ? "scale-95" : "group-hover:scale-110"
              }`}
              style={{
                fontSize: "clamp(10px, 1.9cqw, 38px)",
              }}
            >
              {currentActionKey}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
