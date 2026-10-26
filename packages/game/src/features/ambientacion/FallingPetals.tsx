import React from "react";

interface FallingPetalsProps {
  isPaused?: boolean;
}

interface PetalConfig {
  id: number;
  startX: number; // Porcentaje X de inicio (arriba)
  startY: number; // Porcentaje Y de inicio
  color: string;
  size: number;
  duration: number;
  delay: number;
  swayAmount: number;
}

const DAHLIA_PETALS: PetalConfig[] = [
  { id: 1, startX: 28, startY: 8, color: "#f43f5e", size: 6, duration: 11.0, delay: 0, swayAmount: 35 },
  { id: 2, startX: 52, startY: 5, color: "#ec4899", size: 5, duration: 13.5, delay: 4.2, swayAmount: -40 },
  { id: 3, startX: 76, startY: 10, color: "#f472b6", size: 6, duration: 12.0, delay: 8.0, swayAmount: 30 },
  { id: 4, startX: 40, startY: 6, color: "#db2777", size: 5, duration: 14.0, delay: 2.1, swayAmount: -32 },
];

/**
 * Pétalos de Dalia cayendo suavemente con la brisa.
 * Refuerza la identidad del "Mapa de Dalias" en la plaza cívica.
 */
export const FallingPetals: React.FC<FallingPetalsProps> = ({
  isPaused = false,
}) => {
  const animState = isPaused ? "paused" : "running";

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 24 }}
    >
      {DAHLIA_PETALS.map((petal) => (
        <div
          key={`dahlia-petal-${petal.id}`}
          className="absolute"
          style={{
            left: `${petal.startX}%`,
            top: `${petal.startY}%`,
            width: `${petal.size}px`,
            height: `${petal.size * 1.3}px`,
            animation: `fallingPetalDrift ${petal.duration}s linear infinite`,
            animationDelay: `${petal.delay}s`,
            animationPlayState: animState,
            ["--sway-x" as string]: `${petal.swayAmount}px`,
            opacity: 0,
            imageRendering: "pixelated",
          }}
        >
          {/* Gráfico pixel art del pétalo de dalia */}
          <svg
            viewBox="0 0 6 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            style={{ shapeRendering: "crispEdges" }}
          >
            {/* Silueta de pétalo de dalia pixelada */}
            <rect x="2" y="0" width="2" height="1" fill={petal.color} />
            <rect x="1" y="1" width="4" height="2" fill={petal.color} />
            <rect x="0" y="3" width="6" height="3" fill={petal.color} />
            <rect x="1" y="6" width="4" height="1" fill={petal.color} />
            <rect x="2" y="7" width="2" height="1" fill="#be185d" />
            {/* Detalle de brillo en el pétalo */}
            <rect x="2" y="2" width="2" height="2" fill="#fbcfe8" opacity="0.6" />
          </svg>
        </div>
      ))}
    </div>
  );
};
