"use client";

import React from "react";

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
      title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
      aria-label={
        isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
      }
      className="group relative flex items-center justify-center p-2 bg-purple-950/80 hover:bg-purple-800 text-purple-200 hover:text-white border-2 border-purple-500/60 hover:border-purple-400 rounded-md transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] active:translate-x-0.5 active:translate-y-0.5"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Retro Pixel Art SVG Icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 transition-transform group-hover:scale-110"
        style={{ shapeRendering: "crispEdges" }}
      >
        {!isFullscreen ? (
          /* Expand Pixel Art Icon */
          <g fill="currentColor">
            {/* Top-Left Corner */}
            <rect x="2" y="2" width="6" height="2" />
            <rect x="2" y="4" width="2" height="4" />

            {/* Top-Right Corner */}
            <rect x="16" y="2" width="6" height="2" />
            <rect x="20" y="4" width="2" height="4" />

            {/* Bottom-Left Corner */}
            <rect x="2" y="20" width="6" height="2" />
            <rect x="2" y="16" width="2" height="4" />

            {/* Bottom-Right Corner */}
            <rect x="16" y="20" width="6" height="2" />
            <rect x="20" y="16" width="2" height="4" />

            {/* Center Pixel Box Indicator */}
            <rect x="9" y="9" width="6" height="6" fill="#F472B6" />
          </g>
        ) : (
          /* Exit / Collapse Pixel Art Icon */
          <g fill="currentColor">
            {/* Inward Top-Left */}
            <rect x="7" y="7" width="5" height="2" />
            <rect x="7" y="9" width="2" height="3" />

            {/* Inward Top-Right */}
            <rect x="12" y="7" width="5" height="2" />
            <rect x="15" y="9" width="2" height="3" />

            {/* Inward Bottom-Left */}
            <rect x="7" y="15" width="5" height="2" />
            <rect x="7" y="12" width="2" height="3" />

            {/* Inward Bottom-Right */}
            <rect x="12" y="15" width="5" height="2" />
            <rect x="15" y="12" width="2" height="3" />

            {/* Outer Corner Markers */}
            <rect x="3" y="3" width="2" height="2" fill="#F472B6" />
            <rect x="19" y="3" width="2" height="2" fill="#F472B6" />
            <rect x="3" y="19" width="2" height="2" fill="#F472B6" />
            <rect x="19" y="19" width="2" height="2" fill="#F472B6" />
          </g>
        )}
      </svg>

      {/* Tooltip on hover */}
      <span className="absolute right-0 -bottom-8 hidden group-hover:block whitespace-nowrap bg-slate-950 text-purple-200 text-[10px] font-mono font-bold px-2 py-1 rounded border border-purple-700/60 shadow-lg z-50 pointer-events-none">
        {isFullscreen ? "SALIR FULLSCREEN [ESC]" : "PANTALLA COMPLETA"}
      </span>
    </button>
  );
}
