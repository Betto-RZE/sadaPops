import React from "react";

interface SunbeamsProps {
  isPaused?: boolean;
  className?: string;
}

/**
 * Rayos de luz solar (God Rays / Sunbeams) atmosféricos.
 * Simula la luz del sol filtrándose suavemente a través de las copas
 * de los árboles hacia la explanada de votación.
 */
export const Sunbeams: React.FC<SunbeamsProps> = ({
  isPaused = false,
  className = "",
}) => {
  const animStyle = isPaused ? { animationPlayState: "paused" as const } : {};

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden ${className}`}
      style={{ zIndex: 22 }}
    >
      <svg
        viewBox="0 0 1000 562.5"
        preserveAspectRatio="none"
        className="w-full h-full opacity-90"
        style={{
          mixBlendMode: "screen",
        }}
      >
        <defs>
          {/* Degradado Rayo 1 (Cálido y suave) */}
          <linearGradient id="sunbeamGrad1" x1="0.2" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.26" />
            <stop offset="35%" stopColor="#fef08a" stopOpacity="0.16" />
            <stop offset="75%" stopColor="#fde047" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </linearGradient>

          {/* Degradado Rayo 2 (Central, más amplio) */}
          <linearGradient id="sunbeamGrad2" x1="0.3" y1="0" x2="0.65" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="40%" stopColor="#fef9c3" stopOpacity="0.18" />
            <stop offset="80%" stopColor="#fef08a" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </linearGradient>

          {/* Degradado Rayo 3 (Delicado, zona derecha) */}
          <linearGradient id="sunbeamGrad3" x1="0.4" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.22" />
            <stop offset="45%" stopColor="#fef08a" stopOpacity="0.13" />
            <stop offset="85%" stopColor="#fde047" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
          </linearGradient>

          {/* Degradado Rayo 4 (Fino, haz de luz enfocado) */}
          <linearGradient id="sunbeamGrad4" x1="0.1" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.24" />
            <stop offset="30%" stopColor="#fef9c3" stopOpacity="0.14" />
            <stop offset="70%" stopColor="#fef08a" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* RAYO 1: Lado izquierdo-centro de la explanada */}
        <polygon
          points="80,0 180,0 360,562.5 220,562.5"
          fill="url(#sunbeamGrad1)"
          className="animate-sunbeam-pulse-1"
          style={animStyle}
        />

        {/* RAYO 2: Rayo principal amplio sobre el centro de la plaza */}
        <polygon
          points="280,0 440,0 720,562.5 500,562.5"
          fill="url(#sunbeamGrad2)"
          className="animate-sunbeam-pulse-2"
          style={animStyle}
        />

        {/* RAYO 3: Lado derecho sobre los carteles y mamparas */}
        <polygon
          points="540,0 680,0 960,562.5 780,562.5"
          fill="url(#sunbeamGrad3)"
          className="animate-sunbeam-pulse-3"
          style={animStyle}
        />

        {/* RAYO 4: Haz fino sobre la mesa directiva izquierda */}
        <polygon
          points="10,0 80,0 210,562.5 130,562.5"
          fill="url(#sunbeamGrad4)"
          className="animate-sunbeam-pulse-4"
          style={animStyle}
        />
      </svg>
    </div>
  );
};
