import React, { useState, useEffect, useCallback } from "react";

export interface RotateDeviceOverlayProps {
  /** Optional callback to trigger fullscreen when user taps the button */
  onRequestFullscreen?: () => void;
  isFullscreen?: boolean;
}

export function RotateDeviceOverlay({
  onRequestFullscreen,
  isFullscreen,
}: RotateDeviceOverlayProps) {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);

  const checkOrientation = useCallback(() => {
    if (typeof window === "undefined") return;
    const isTouch =
      "ontouchstart" in window ||
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);
    const isPortrait = window.innerHeight > window.innerWidth;
    const isSmallScreen = window.innerWidth <= 840 || window.innerHeight <= 840;

    // Se activa obligatoriamente cuando se detecta un dispositivo táctil / móvil en orientación vertical
    setIsPortraitMobile(isTouch && isPortrait && isSmallScreen);
  }, []);

  useEffect(() => {
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    // Verificación adicional de MediaQuery
    let mql: MediaQueryList | null = null;
    if (typeof window !== "undefined" && window.matchMedia) {
      mql = window.matchMedia("(orientation: portrait)");
      const handler = checkOrientation;
      if (mql.addEventListener) {
        mql.addEventListener("change", handler);
      } else {
        // Fallback para navegadores antiguos
        (mql as any).addListener(handler);
      }
    }

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
      if (mql) {
        if (mql.removeEventListener) {
          mql.removeEventListener("change", checkOrientation);
        } else {
          (mql as any).removeListener(checkOrientation);
        }
      }
    };
  }, [checkOrientation]);

  if (!isPortraitMobile) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Gira tu dispositivo a horizontal para jugar"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 bg-[#0a0d14]/95 backdrop-blur-md select-none touch-none text-white text-center overflow-hidden"
    >
      <style>{`
        @keyframes pixelPhoneRotate {
          0%, 20% {
            transform: rotate(0deg) scale(1);
          }
          45%, 75% {
            transform: rotate(-90deg) scale(1.05);
          }
          95%, 100% {
            transform: rotate(0deg) scale(1);
          }
        }

        @keyframes retroGlowPulse {
          0%, 100% {
            filter: drop-shadow(0 0 12px rgba(227, 0, 126, 0.45));
          }
          50% {
            filter: drop-shadow(0 0 24px rgba(227, 0, 126, 0.85));
          }
        }
      `}</style>

      {/* Ícono animado pixel art: Teléfono rotando 90° a horizontal */}
      <div
        className="relative mb-6"
        style={{
          animation: "retroGlowPulse 2.4s ease-in-out infinite",
        }}
      >
        <div
          className="w-20 h-28 sm:w-24 sm:h-32 border-4 border-black bg-[#1f242d] rounded-2xl p-2 relative flex flex-col items-center justify-between shadow-[6px_6px_0px_#000]"
          style={{
            animation: "pixelPhoneRotate 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            transformOrigin: "center center",
          }}
        >
          {/* Bocina / notch pixel art */}
          <div className="w-6 h-1.5 bg-[#404654] rounded-full mt-0.5" />

          {/* Pantalla interior con el logo INE pixelado */}
          <div className="w-full flex-1 my-1.5 bg-[#12151c] rounded-lg border-2 border-black flex items-center justify-center overflow-hidden relative">
            {/* Malla de scanlines retro */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)",
              }}
            />
            <div className="text-[#E3007E] font-black text-xs font-mono tracking-widest [text-shadow:1px_1px_0_#000]">
              INE
            </div>
          </div>

          {/* Botón Home / indicador inferior */}
          <div className="w-3.5 h-3.5 rounded-full border border-black bg-[#404654] mb-0.5" />
        </div>

        {/* Flecha curva retro que indica rotación */}
        <div
          className="absolute -top-3 -right-3 text-2xl text-[#FFD100] font-black select-none pointer-events-none [text-shadow:2px_2px_0_#000]"
          aria-hidden="true"
        >
          🔄
        </div>
      </div>

      {/* Título en tipografía pixel art */}
      <h2
        className="text-base sm:text-lg font-black uppercase text-[#FFD100] tracking-wider mb-3 leading-snug [text-shadow:3px_3px_0_#000]"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        GIRA TU DISPOSITIVO
      </h2>

      {/* Explicación en texto pixelado legible */}
      <p
        className="text-sm sm:text-base text-gray-200 max-w-xs sm:max-w-sm mb-6 leading-relaxed [text-shadow:1px_1px_0_#000]"
        style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
      >
        Para apreciar el arte, explorar la plaza y vivir la experiencia cívica
        completa, por favor coloca tu celular en posición{" "}
        <span className="text-[#E3007E] font-bold">horizontal</span>.
      </p>

      {/* Botón opcional de pantalla completa */}
      {onRequestFullscreen && !isFullscreen && (
        <button
          type="button"
          onClick={onRequestFullscreen}
          className="px-4 py-2.5 bg-[#E3007E] hover:bg-[#b5146c] text-white border-3 border-black rounded-xl font-mono text-xs uppercase font-bold tracking-wider shadow-[4px_4px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
        >
          Pantalla Completa ⛶
        </button>
      )}
    </div>
  );
}

