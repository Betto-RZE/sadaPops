import React from 'react';

interface PixelFullscreenButtonProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

export function PixelFullscreenButton({
  isFullscreen,
  onToggle,
}: PixelFullscreenButtonProps) {
  return (
    <button
      onClick={onToggle}
      type="button"
      aria-pressed={isFullscreen}
      title={isFullscreen ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)'}
      aria-label={
        isFullscreen ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)'
      }
      className="group relative flex items-center justify-center p-2.5 sm:p-3 bg-white hover:bg-[#E3007E] text-slate-900 hover:text-white border-[3px] border-black rounded-lg transition-all duration-150 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer z-50 select-none"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* 28x28 Pixel Art SVG Icon - Styled to match splash.jpg INE palette */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-150 group-hover:scale-110"
        style={{ shapeRendering: 'crispEdges' }}
      >
        {!isFullscreen ? (
          /* EXPAND FULLSCREEN ICON (Brackets + INE Magenta Diamond Center) */
          <g>
            {/* Top-Left Bracket */}
            <rect x="2" y="2" width="8" height="2.5" fill="black" />
            <rect x="2" y="4.5" width="2.5" height="5.5" fill="black" />

            {/* Top-Right Bracket */}
            <rect x="18" y="2" width="8" height="2.5" fill="black" />
            <rect x="23.5" y="4.5" width="2.5" height="5.5" fill="black" />

            {/* Bottom-Left Bracket */}
            <rect x="2" y="23.5" width="8" height="2.5" fill="black" />
            <rect x="2" y="18" width="2.5" height="5.5" fill="black" />

            {/* Bottom-Right Bracket */}
            <rect x="18" y="23.5" width="8" height="2.5" fill="black" />
            <rect x="23.5" y="18" width="2.5" height="5.5" fill="black" />

            {/* Center INE Diamond Emblem */}
            <g transform="translate(14, 14) rotate(45)">
              <rect x="-3.5" y="-3.5" width="7" height="7" className="fill-[#E3007E] group-hover:fill-white transition-colors" />
              <rect x="-1" y="-1" width="2" height="2" fill="white" className="group-hover:fill-[#E3007E] transition-colors" />
            </g>
          </g>
        ) : (
          /* EXIT FULLSCREEN ICON (Inward Brackets + Magenta Accents) */
          <g>
            {/* Inward Top-Left */}
            <rect x="8" y="8" width="6" height="2" fill="black" />
            <rect x="8" y="10" width="2" height="4" fill="black" />
            <rect x="4" y="4" width="3" height="3" className="fill-[#E3007E] group-hover:fill-white" />

            {/* Inward Top-Right */}
            <rect x="14" y="8" width="6" height="2" fill="black" />
            <rect x="18" y="10" width="2" height="4" fill="black" />
            <rect x="21" y="4" width="3" height="3" className="fill-[#E3007E] group-hover:fill-white" />

            {/* Inward Bottom-Left */}
            <rect x="8" y="18" width="6" height="2" fill="black" />
            <rect x="8" y="14" width="2" height="4" fill="black" />
            <rect x="4" y="21" width="3" height="3" className="fill-[#E3007E] group-hover:fill-white" />

            {/* Inward Bottom-Right */}
            <rect x="14" y="18" width="6" height="2" fill="black" />
            <rect x="18" y="14" width="2" height="4" fill="black" />
            <rect x="21" y="21" width="3" height="3" className="fill-[#E3007E] group-hover:fill-white" />
          </g>
        )}
      </svg>
    </button>
  );
}
