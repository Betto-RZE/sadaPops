import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  PixelSpeechBubblePortraits,
  isPortraitActive,
  getPortraitStyle,
  getSpeakerNameAlignment,
  TriviaOption,
  DialogueTrivia,
  PortraitOverride,
  DialogueLine,
} from "./features/mitos/ancianaConfig";

export type {
  TriviaOption,
  DialogueTrivia,
  PortraitOverride,
  DialogueLine,
};

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
  /** Retratos de personajes en diálogo pegados al borde superior del globo */
  portraits?: PixelSpeechBubblePortraits;
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
 * - Interactive Trivia / Quiz support with smooth transitions, answer elevation, and mandatory selection
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
  portraits,
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
          portraitOverride: item.portraitOverride,
          trivia: item.trivia,
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

  // Estado para la trivia interactiva en la línea actual
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Reiniciar selección al cambiar de paso en la conversación
  useEffect(() => {
    setSelectedOptionId(null);
  }, [currentStepIndex]);

  const isTrivia = Boolean(
    currentLine.trivia &&
      currentLine.trivia.options &&
      currentLine.trivia.options.length > 0,
  );
  const isWaitingForAnswer = Boolean(isTrivia && selectedOptionId === null);

  const selectedOption = useMemo(() => {
    if (!currentLine.trivia || !selectedOptionId) return null;
    return (
      currentLine.trivia.options.find((opt) => opt.id === selectedOptionId) ||
      null
    );
  }, [currentLine.trivia, selectedOptionId]);

  useEffect(() => {
    if (currentLine && (currentLine.text || currentLine.trivia)) {
      onLineChange?.(currentLine, currentStepIndex);
    }
  }, [currentStepIndex, currentLine, onLineChange]);

  const currentText = currentLine.text || currentLine.trivia?.question || "";
  const currentSpeaker = currentLine.speaker;
  const currentSpeakerColor = currentLine.speakerColor || "#a81363";
  const currentActionKey = currentLine.actionKey || actionKey;

  const isLeftSpeakerActive = useMemo(() => {
    if (!portraits?.left) return false;
    return isPortraitActive(currentSpeaker, portraits.left.speakerNames);
  }, [portraits?.left, currentSpeaker]);

  const isRightSpeakerActive = useMemo(() => {
    if (!portraits?.right) return false;
    return isPortraitActive(currentSpeaker, portraits.right.speakerNames);
  }, [portraits?.right, currentSpeaker]);

  const speakerAlignment = useMemo(() => {
    return getSpeakerNameAlignment(currentSpeaker, portraits);
  }, [currentSpeaker, portraits]);

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
            : `${m.speaker || ""}:${m.text}:${m.actionKey || ""}:${
                m.trivia?.question || ""
              }`,
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
      setSelectedOptionId(null);
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
    if (disabled || isWaitingForAnswer || normalizedLines.length === 0) return;

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
    isWaitingForAnswer,
    normalizedLines,
    isTyping,
    skipTyping,
    currentStepIndex,
    onAdvance,
    onDismiss,
  ]);

  // Selección de una respuesta en la trivia
  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (!isWaitingForAnswer) return;
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      setIsTyping(false);
      setDisplayedLength(currentText.length);
      setSelectedOptionId(optionId);
    },
    [isWaitingForAnswer, currentText.length],
  );

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
        // Si el texto aún se está escribiendo, saltar el typewriter para leer la pregunta completa
        if (isTyping) {
          skipTyping();
          return;
        }
        // Si hay una trivia esperando respuesta, BLOQUEAR estrictamente el avance
        if (isWaitingForAnswer) {
          return;
        }
        triggerPressAnimation();
        handleAdvance();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    disabled,
    handleAdvance,
    currentActionKey,
    triggerPressAnimation,
    isTyping,
    skipTyping,
    isWaitingForAnswer,
  ]);

  const displayedText = currentText.slice(0, displayedLength);

  return (
    <div
      className={`relative z-10 w-full aspect-[2012/380] transition-all duration-300 ease-out ${
        isDismissing
          ? "translate-y-44 opacity-0 scale-95"
          : "translate-y-0 opacity-100 scale-100"
      } ${className}`}
    >
      {/* Retratos de los interlocutores pegados al borde superior del globo */}
      {portraits && (
        <div className="absolute inset-x-0 bottom-[96%] flex justify-between items-end px-[2cqw] pointer-events-none z-0">
          {/* Interlocutor Izquierdo (ej: Inecito mirando hacia la derecha o al frente en trivia) */}
          {portraits.left && (
            <div
              className="relative flex items-end justify-center transition-all duration-300 ease-out select-none"
              style={{
                width: "clamp(135px, 29cqw, 480px)",
                height: "clamp(122px, 26.1cqw, 432px)",
                ...getPortraitStyle(isLeftSpeakerActive),
              }}
            >
              <img
                src={
                  currentLine.portraitOverride?.leftSrc || portraits.left.src
                }
                alt={portraits.left.alt || "Interlocutor Izquierdo"}
                className="w-full h-full object-contain object-bottom pointer-events-none select-none"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          )}

          {/* Interlocutor Derecho (ej: Doña Carmen mirando hacia la izquierda) */}
          {portraits.right && !currentLine.portraitOverride?.hideRight && (
            <div
              className="relative flex items-end justify-center transition-all duration-300 ease-out select-none"
              style={{
                width: "clamp(135px, 29cqw, 480px)",
                height: "clamp(122px, 26.1cqw, 432px)",
                ...(currentLine.portraitOverride?.dimRight
                  ? {
                      filter:
                        "brightness(0.28) saturate(0.4) contrast(0.85) drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                      opacity: 0.45,
                      transform: "translateY(8px) scale(0.94)",
                      zIndex: 1,
                    }
                  : getPortraitStyle(isRightSpeakerActive)),
              }}
            >
              <img
                src={
                  currentLine.portraitOverride?.rightSrc || portraits.right.src
                }
                alt={portraits.right.alt || "Interlocutor Derecho"}
                className="w-full h-full object-contain object-bottom pointer-events-none select-none"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          )}
        </div>
      )}

      {/* Pixel Art Dialogue Balloon Image Asset (Cropped to exact border) */}
      <img
        src="/assets/juego/globo-texto.png"
        alt="Globo de Texto"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10 drop-shadow-[0_8px_20px_rgba(0,0,0,0.65)]"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Writable White Interior Container (Fits precisely within the 6.3% top & 7.6% bottom black border) */}
      <div className="absolute inset-x-0 top-[7%] bottom-[8%] px-[3.5%] flex flex-col justify-between z-20">
        {/* Fila superior: Nombre del interlocutor a lo ancho completo del globo */}
        <div
          className={`w-full flex ${
            speakerAlignment === "right"
              ? "justify-end text-right"
              : "justify-start text-left"
          } transition-all duration-200 ease-out pt-[0.15cqw] shrink-0`}
        >
          {currentSpeaker && (
            <span
              className="font-bold uppercase tracking-wider select-none shrink-0"
              style={{
                color: currentSpeakerColor,
                fontFamily:
                  "'Press Start 2P', 'Silkscreen', monospace, sans-serif",
                fontSize: "clamp(10px, 1.55cqw, 32px)",
                marginBottom: "clamp(2px, 0.25cqw, 6px)",
                textShadow: "1px 1px 0px rgba(255,255,255,0.9)",
              }}
            >
              {currentSpeaker}
            </span>
          )}
        </div>

        {/* Fila inferior: Contenido de Diálogo / Trivia + Botón de Acción [E] */}
        <div className="w-full flex-1 min-h-0 flex items-center justify-between overflow-hidden">
          {/* Columna de Texto o Trivia */}
          <div className="flex-1 h-full flex flex-col justify-center items-start pr-[1cqw] overflow-hidden">
            {!currentLine.trivia ? (
              /* Diálogo estándar */
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
            ) : (
              /* Diálogo con trivia interactiva (Parte 2) */
              <div className="w-full flex-1 flex flex-col justify-center overflow-hidden">
                {/* Pregunta: desaparece suavemente al responder */}
                <div
                  className={`transition-all duration-300 ease-out overflow-hidden ${
                    selectedOptionId
                      ? "max-h-0 opacity-0 -translate-y-2 pointer-events-none mb-0"
                      : "max-h-36 opacity-100 translate-y-0 mb-[0.25cqw]"
                  }`}
                >
                  <p
                    className="text-black font-semibold select-none overflow-y-auto w-full"
                    style={{
                      fontFamily:
                        "'Pixelify Sans', 'Silkscreen', 'Press Start 2P', monospace, sans-serif",
                      fontSize: "clamp(11px, 1.7cqw, 34px)",
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

                {/* Estado 1: 3 botones en fila antes de responder (elevados un poco más arriba) */}
                {!selectedOptionId && (
                  <div className="w-full grid grid-cols-3 gap-[1cqw] mt-[0.2cqw] mb-[0.45cqw]">
                    {currentLine.trivia.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        type="button"
                        className="group relative flex items-center justify-center text-center px-[0.8cqw] py-[0.42cqw] rounded-[clamp(4px,0.6cqw,12px)] border-[clamp(2px,0.25cqw,4px)] border-black bg-[#fff5f9] hover:bg-[#fce7f3] active:bg-[#fbcfe8] shadow-[clamp(2px,0.28cqw,5px)_clamp(2px,0.28cqw,5px)_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all duration-150 select-none"
                        style={{
                          fontFamily:
                            "'Pixelify Sans', 'Press Start 2P', monospace, sans-serif",
                        }}
                      >
                        <span
                          className="text-[#940d57] group-hover:text-[#b5146c] font-bold tracking-tight leading-snug"
                          style={{
                            fontSize: "clamp(10px, 1.45cqw, 28px)",
                          }}
                        >
                          {opt.text}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Estado 2: Botón seleccionado sube suavemente + feedback abajo */}
                {selectedOption && (
                  <div className="w-full flex-1 flex flex-col justify-start overflow-hidden animate-fadeIn transition-all duration-300 ease-out pb-[0.2cqw]">
                    {/* Botón seleccionado que 'se sube' con animación suave */}
                    <div
                      className="w-full flex items-center justify-between px-[1.2cqw] py-[0.35cqw] rounded-[clamp(4px,0.6cqw,10px)] border-[clamp(2px,0.25cqw,4px)] shadow-[clamp(2px,0.25cqw,4px)_clamp(2px,0.25cqw,4px)_0px_0px_#000] transition-all duration-300 ease-out shrink-0"
                      style={{
                        backgroundColor: selectedOption.isCorrect
                          ? "#f0fdf4"
                          : "#fef2f2",
                        borderColor: selectedOption.isCorrect
                          ? "#16a34a"
                          : "#dc2626",
                      }}
                    >
                      <div className="flex items-center gap-[0.8cqw] min-w-0">
                        <span
                          className="font-bold shrink-0"
                          style={{
                            fontFamily:
                              "'Press Start 2P', 'Silkscreen', monospace",
                            fontSize: "clamp(8px, 1.2cqw, 22px)",
                            color: selectedOption.isCorrect
                              ? "#15803d"
                              : "#b91c1c",
                          }}
                        >
                          {selectedOption.isCorrect
                            ? "✅ TU RESPUESTA:"
                            : "❌ TU RESPUESTA:"}
                        </span>
                        <span
                          className="font-bold text-black truncate"
                          style={{
                            fontFamily: "'Pixelify Sans', monospace",
                            fontSize: "clamp(11px, 1.6cqw, 32px)",
                          }}
                        >
                          {selectedOption.text}
                        </span>
                      </div>

                      <span
                        className="font-black uppercase tracking-wider shrink-0 ml-[1cqw]"
                        style={{
                          fontFamily:
                            "'Press Start 2P', 'Silkscreen', monospace",
                          fontSize: "clamp(8px, 1.1cqw, 20px)",
                          color: selectedOption.isCorrect ? "#15803d" : "#b91c1c",
                        }}
                      >
                        {selectedOption.isCorrect ? "¡CORRECTO!" : "¡INCORRECTO!"}
                      </span>
                    </div>

                    {/* Info explicativa con animación suave de entrada debajo de la respuesta */}
                    <div className="w-full mt-[0.25cqw] flex-1 overflow-y-auto pr-[0.5cqw]">
                      <p
                        className="text-black font-semibold select-none"
                        style={{
                          fontFamily:
                            "'Pixelify Sans', 'Silkscreen', monospace, sans-serif",
                          fontSize: "clamp(10.5px, 1.55cqw, 30px)",
                          lineHeight: 1.2,
                          textShadow: "0 1px 0 rgba(255,255,255,0.85)",
                        }}
                      >
                        {selectedOption.feedback}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Square Pixel Art Action Button */}
          <button
            onClick={() => {
              if (isWaitingForAnswer) return;
              triggerPressAnimation();
              handleAdvance();
            }}
            disabled={isWaitingForAnswer}
            onMouseDown={() => !isWaitingForAnswer && setIsPressed(true)}
            onMouseUp={() => !isWaitingForAnswer && triggerPressAnimation()}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => !isWaitingForAnswer && setIsPressed(true)}
            onTouchEnd={() => !isWaitingForAnswer && triggerPressAnimation()}
            type="button"
            aria-label={
              isWaitingForAnswer
                ? "Selecciona una de las 3 opciones para continuar"
                : `Avanzar diálogo (${currentActionKey}, Enter o Espacio)`
            }
            className={`shrink-0 aspect-square text-white transition-all flex items-center justify-center select-none group ${
              isWaitingForAnswer
                ? "bg-neutral-600 opacity-40 cursor-not-allowed pointer-events-none"
                : "bg-[#940d57] hover:bg-[#b5146c] cursor-pointer"
            }`}
            style={{
              width: "clamp(30px, 4.8cqw, 96px)",
              height: "clamp(30px, 4.8cqw, 96px)",
              borderRadius: "clamp(6px, 0.9cqw, 18px)",
              borderWidth: "clamp(2px, 0.28cqw, 5.5px)",
              borderColor: "#000000",
              borderStyle: "solid",
              boxShadow: isWaitingForAnswer
                ? "none"
                : isPressed
                  ? "0px 0px 0px 0px #000000"
                  : "clamp(2px, 0.35cqw, 7px) clamp(2px, 0.35cqw, 7px) 0px 0px #000000",
              transform:
                isPressed && !isWaitingForAnswer
                  ? "translate(clamp(2px, 0.35cqw, 7px), clamp(2px, 0.35cqw, 7px))"
                  : "translate(0px, 0px)",
              backgroundColor: isWaitingForAnswer
                ? "#525252"
                : isPressed
                  ? "#780946"
                  : undefined,
              marginLeft: "clamp(4px, 0.8cqw, 16px)",
              marginRight: "clamp(2px, 0.3cqw, 6px)",
              padding: "clamp(2px, 0.35cqw, 7px)",
              fontFamily: "'Press Start 2P', 'Silkscreen', monospace, sans-serif",
              transition:
                "transform 70ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 70ms cubic-bezier(0.4, 0, 0.2, 1), background-color 70ms ease-out, opacity 200ms ease-out",
            }}
          >
            <div
              className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white/20 to-transparent"
              style={{
                borderRadius: "clamp(4px, 0.65cqw, 13px)",
                borderWidth: "clamp(1.5px, 0.2cqw, 4px)",
                borderColor: isWaitingForAnswer
                  ? "rgba(255, 255, 255, 0.2)"
                  : isPressed
                    ? "rgba(255, 255, 255, 0.45)"
                    : "rgba(255, 255, 255, 0.85)",
                borderStyle: "solid",
                transition: "border-color 70ms ease-out",
              }}
            >
              <span
                className={`text-white font-black leading-none drop-shadow-[0_2px_0_rgba(0,0,0,0.8)] transition-transform ${
                  isWaitingForAnswer
                    ? "opacity-40"
                    : isPressed
                      ? "scale-95"
                      : "group-hover:scale-110"
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
    </div>
  );
}
