import React, { useState, useEffect, useRef, useCallback } from "react";

export interface VirtualGamepadProps {
  /** If false, the virtual gamepad is cleanly hidden and keys are released */
  visible: boolean;
  className?: string;
}

type Direction = "up" | "down" | "left" | "right";

const DIRECTION_KEY_MAP: Record<Direction, { key: string; code: string }> = {
  up: { key: "ArrowUp", code: "ArrowUp" },
  down: { key: "ArrowDown", code: "ArrowDown" },
  left: { key: "ArrowLeft", code: "ArrowLeft" },
  right: { key: "ArrowRight", code: "ArrowRight" },
};

export function VirtualGamepad({
  visible,
  className = "",
}: VirtualGamepadProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [activeDirections, setActiveDirections] = useState<Record<Direction, boolean>>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const [isActionPressed, setIsActionPressed] = useState(false);

  const activeDirectionsRef = useRef(activeDirections);
  activeDirectionsRef.current = activeDirections;

  const isActionPressedRef = useRef(isActionPressed);
  isActionPressedRef.current = isActionPressed;

  // Detectar soporte táctil
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasTouch =
      "ontouchstart" in window ||
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) ||
      window.matchMedia("(pointer: coarse)").matches;

    setIsTouchDevice(hasTouch);
  }, []);

  // Helper para emitir eventos de teclado nativos que escuchen los bucles de movimiento del juego
  const dispatchKeyEvent = useCallback(
    (key: string, code: string, isDown: boolean) => {
      if (typeof window === "undefined") return;
      window.dispatchEvent(
        new KeyboardEvent(isDown ? "keydown" : "keyup", {
          key,
          code,
          bubbles: true,
          cancelable: true,
        })
      );
    },
    []
  );

  // Liberar todas las teclas activas al ocultar o desmontar
  const releaseAllKeys = useCallback(() => {
    (Object.keys(activeDirectionsRef.current) as Direction[]).forEach((dir) => {
      if (activeDirectionsRef.current[dir]) {
        const { key, code } = DIRECTION_KEY_MAP[dir];
        dispatchKeyEvent(key, code, false);
      }
    });
    setActiveDirections({
      up: false,
      down: false,
      left: false,
      right: false,
    });

    if (isActionPressedRef.current) {
      dispatchKeyEvent("e", "KeyE", false);
      setIsActionPressed(false);
    }
  }, [dispatchKeyEvent]);

  useEffect(() => {
    if (!visible) {
      releaseAllKeys();
    }
  }, [visible, releaseAllKeys]);

  useEffect(() => {
    return () => {
      releaseAllKeys();
    };
  }, [releaseAllKeys]);

  // Manejadores de dirección D-Pad
  const handleDirStart = useCallback(
    (dir: Direction, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!activeDirectionsRef.current[dir]) {
        setActiveDirections((prev) => ({ ...prev, [dir]: true }));
        const { key, code } = DIRECTION_KEY_MAP[dir];
        dispatchKeyEvent(key, code, true);
      }
    },
    [dispatchKeyEvent]
  );

  const handleDirEnd = useCallback(
    (dir: Direction, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (activeDirectionsRef.current[dir]) {
        setActiveDirections((prev) => ({ ...prev, [dir]: false }));
        const { key, code } = DIRECTION_KEY_MAP[dir];
        dispatchKeyEvent(key, code, false);
      }
    },
    [dispatchKeyEvent]
  );

  // Manejador del botón de acción "E"
  const handleActionStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isActionPressedRef.current) {
        setIsActionPressed(true);
        dispatchKeyEvent("e", "KeyE", true);
      }
    },
    [dispatchKeyEvent]
  );

  const handleActionEnd = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isActionPressedRef.current) {
        setIsActionPressed(false);
        dispatchKeyEvent("e", "KeyE", false);
      }
    },
    [dispatchKeyEvent]
  );

  // Si no es un dispositivo táctil, no renderizar nada para no estorbar a usuarios de PC
  if (!isTouchDevice) return null;

  return (
    <div
      className={`absolute inset-0 z-40 pointer-events-none select-none transition-opacity duration-200 ${
        visible ? "opacity-90" : "opacity-0 pointer-events-none"
      } ${className}`}
      aria-hidden={!visible}
    >
      <style>{`
        .gamepad-touch-btn {
          touch-action: none;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
      `}</style>

      {/* D-PAD (CRUCETA) EN ESQUINA INFERIOR IZQUIERDA */}
      <div className="absolute bottom-[4%] left-[3.5%] pointer-events-auto flex items-center justify-center"
        style={{ transform: "scale(var(--gamepad-scale, 1))", transformOrigin: "bottom left" }}>
        <div className="relative w-[var(--gamepad-pad-size,144px)] h-[var(--gamepad-pad-size,144px)] bg-[#12151c]/70 p-1 rounded-2xl border-2 border-black/80 backdrop-blur-xs shadow-[4px_4px_0px_rgba(0,0,0,0.6)]">
          {/* Botón Arriba */}
          <button
            type="button"
            aria-label="Caminar arriba"
            onPointerDown={(e) => handleDirStart("up", e)}
            onPointerUp={(e) => handleDirEnd("up", e)}
            onPointerCancel={(e) => handleDirEnd("up", e)}
            onPointerLeave={(e) => handleDirEnd("up", e)}
            className={`gamepad-touch-btn absolute top-1 left-1/2 -translate-x-1/2 w-[var(--gamepad-direction-size,44px)] h-[var(--gamepad-direction-size,44px)] rounded-t-lg border-2 border-black flex items-center justify-center font-black text-base text-white transition-transform ${
              activeDirections.up
                ? "bg-[#E3007E] scale-95 shadow-inner"
                : "bg-[#282d37] hover:bg-[#343b47] shadow-[0_2px_0_#000]"
            }`}
          >
            ▲
          </button>

          {/* Botón Izquierda */}
          <button
            type="button"
            aria-label="Caminar a la izquierda"
            onPointerDown={(e) => handleDirStart("left", e)}
            onPointerUp={(e) => handleDirEnd("left", e)}
            onPointerCancel={(e) => handleDirEnd("left", e)}
            onPointerLeave={(e) => handleDirEnd("left", e)}
            className={`gamepad-touch-btn absolute left-1 top-1/2 -translate-y-1/2 w-[var(--gamepad-direction-size,44px)] h-[var(--gamepad-direction-size,44px)] rounded-l-lg border-2 border-black flex items-center justify-center font-black text-base text-white transition-transform ${
              activeDirections.left
                ? "bg-[#E3007E] scale-95 shadow-inner"
                : "bg-[#282d37] hover:bg-[#343b47] shadow-[0_2px_0_#000]"
            }`}
          >
            ◀
          </button>

          {/* Centro decorativo neutro */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[var(--gamepad-direction-size,44px)] h-[var(--gamepad-direction-size,44px)] bg-[#1e222a] border-black flex items-center justify-center pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-black/60" />
          </div>

          {/* Botón Derecha */}
          <button
            type="button"
            aria-label="Caminar a la derecha"
            onPointerDown={(e) => handleDirStart("right", e)}
            onPointerUp={(e) => handleDirEnd("right", e)}
            onPointerCancel={(e) => handleDirEnd("right", e)}
            onPointerLeave={(e) => handleDirEnd("right", e)}
            className={`gamepad-touch-btn absolute right-1 top-1/2 -translate-y-1/2 w-[var(--gamepad-direction-size,44px)] h-[var(--gamepad-direction-size,44px)] rounded-r-lg border-2 border-black flex items-center justify-center font-black text-base text-white transition-transform ${
              activeDirections.right
                ? "bg-[#E3007E] scale-95 shadow-inner"
                : "bg-[#282d37] hover:bg-[#343b47] shadow-[0_2px_0_#000]"
            }`}
          >
            ▶
          </button>

          {/* Botón Abajo */}
          <button
            type="button"
            aria-label="Caminar abajo"
            onPointerDown={(e) => handleDirStart("down", e)}
            onPointerUp={(e) => handleDirEnd("down", e)}
            onPointerCancel={(e) => handleDirEnd("down", e)}
            onPointerLeave={(e) => handleDirEnd("down", e)}
            className={`gamepad-touch-btn absolute bottom-1 left-1/2 -translate-x-1/2 w-[var(--gamepad-direction-size,44px)] h-[var(--gamepad-direction-size,44px)] rounded-b-lg border-2 border-black flex items-center justify-center font-black text-base text-white transition-transform ${
              activeDirections.down
                ? "bg-[#E3007E] scale-95 shadow-inner"
                : "bg-[#282d37] hover:bg-[#343b47] shadow-[0_2px_0_#000]"
            }`}
          >
            ▼
          </button>
        </div>
      </div>

      {/* BOTÓN DE ACCIÓN "E" EN ESQUINA INFERIOR DERECHA */}
      <div className="absolute bottom-[5%] right-[4%] pointer-events-auto flex flex-col items-center"
        style={{ transform: "scale(var(--gamepad-scale, 1))", transformOrigin: "bottom right" }}>
        <button
          type="button"
          aria-label="Interactuar (Tecla E)"
          onPointerDown={handleActionStart}
          onPointerUp={handleActionEnd}
          onPointerCancel={handleActionEnd}
          onPointerLeave={handleActionEnd}
          className={`gamepad-touch-btn w-[var(--gamepad-action-size,76px)] h-[var(--gamepad-action-size,76px)] rounded-full border-[3px] border-black flex items-center justify-center font-black text-[length:var(--gamepad-action-font,24px)] text-white transition-all shadow-[4px_4px_0px_#000] cursor-pointer ${
            isActionPressed
              ? "bg-[#940d57] scale-95 translate-x-1 translate-y-1 shadow-none"
              : "bg-gradient-to-b from-[#E3007E] to-[#b5146c] hover:brightness-105 active:scale-95"
          }`}
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          E
        </button>
        <span
          className="text-[length:var(--gamepad-label-font,10px)] font-mono font-bold text-white uppercase mt-1 tracking-wider [text-shadow:1px_1px_0_#000]"
          style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
        >
          INTERACTUAR
        </span>
      </div>
    </div>
  );
}

