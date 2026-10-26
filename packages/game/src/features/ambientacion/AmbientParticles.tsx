import React from "react";

interface AmbientParticlesProps {
  isPaused?: boolean;
}

interface ParticleConfig {
  id: number;
  startX: number; // Porcentaje X (0-100)
  startY: number; // Porcentaje Y (0-100)
  size: number; // Tamaño en px (2, 3 o 4)
  color: string; // Color HEX
  opacity: number; // Opacidad máxima
  duration: number; // Duración animación flotado en segundos
  delay: number; // Retraso en segundos
  driftX: number; // Desplazamiento horizontal en px
  driftY: number; // Desplazamiento vertical en px
}

// 22 partículas atmosféricas deterministas distribuidas por la explanada y árboles
const AMBIENT_PARTICLES: ParticleConfig[] = [
  // Zona superior e intermedia (árboles y mamparas)
  { id: 1, startX: 15, startY: 20, size: 3, color: "#fef08a", opacity: 0.8, duration: 7.5, delay: 0, driftX: 14, driftY: -18 },
  { id: 2, startX: 25, startY: 32, size: 2, color: "#fde047", opacity: 0.7, duration: 6.2, delay: 1.2, driftX: -12, driftY: 22 },
  { id: 3, startX: 38, startY: 18, size: 3, color: "#ffffff", opacity: 0.85, duration: 8.0, delay: 2.5, driftX: 18, driftY: -14 },
  { id: 4, startX: 48, startY: 28, size: 2, color: "#fef08a", opacity: 0.75, duration: 5.8, delay: 0.8, driftX: -10, driftY: 20 },
  { id: 5, startX: 60, startY: 15, size: 3, color: "#fef9c3", opacity: 0.8, duration: 9.1, delay: 3.2, driftX: 16, driftY: -22 },
  { id: 6, startX: 72, startY: 24, size: 2, color: "#fde047", opacity: 0.65, duration: 6.7, delay: 1.8, driftX: -15, driftY: 18 },
  { id: 7, startX: 85, startY: 20, size: 3, color: "#fef08a", opacity: 0.75, duration: 7.2, delay: 2.1, driftX: 12, driftY: -16 },

  // Zona central (explanada y rayos de sol principales)
  { id: 8, startX: 32, startY: 48, size: 3, color: "#fef08a", opacity: 0.85, duration: 6.5, delay: 0.5, driftX: 20, driftY: -25 },
  { id: 9, startX: 44, startY: 55, size: 4, color: "#ffffff", opacity: 0.9, duration: 8.4, delay: 3.5, driftX: -16, driftY: 28 },
  { id: 10, startX: 52, startY: 42, size: 2, color: "#fde047", opacity: 0.7, duration: 5.5, delay: 1.5, driftX: 14, driftY: -20 },
  { id: 11, startX: 64, startY: 52, size: 3, color: "#fef9c3", opacity: 0.8, duration: 7.8, delay: 2.8, driftX: -18, driftY: 24 },
  { id: 12, startX: 20, startY: 60, size: 2, color: "#fef08a", opacity: 0.65, duration: 6.0, delay: 0.2, driftX: 15, driftY: -18 },
  { id: 13, startX: 78, startY: 58, size: 3, color: "#fef08a", opacity: 0.75, duration: 7.0, delay: 4.1, driftX: -12, driftY: 22 },

  // Zona inferior (cerca de los arbustos con flores)
  { id: 14, startX: 10, startY: 82, size: 3, color: "#fde047", opacity: 0.8, duration: 5.2, delay: 0.9, driftX: 14, driftY: -16 },
  { id: 15, startX: 18, startY: 88, size: 2, color: "#f472b6", opacity: 0.7, duration: 6.8, delay: 2.3, driftX: -10, driftY: 18 },
  { id: 16, startX: 26, startY: 80, size: 3, color: "#fef08a", opacity: 0.75, duration: 6.1, delay: 1.1, driftX: 16, driftY: -20 },
  { id: 17, startX: 74, startY: 85, size: 3, color: "#f472b6", opacity: 0.75, duration: 7.4, delay: 3.0, driftX: -14, driftY: 18 },
  { id: 18, startX: 82, startY: 82, size: 2, color: "#fde047", opacity: 0.8, duration: 5.9, delay: 1.7, driftX: 12, driftY: -15 },
  { id: 19, startX: 92, startY: 86, size: 3, color: "#fef9c3", opacity: 0.85, duration: 6.6, delay: 0.4, driftX: -16, driftY: 22 },

  // Destellos sutiles de polen adicionales
  { id: 20, startX: 30, startY: 70, size: 2, color: "#fef08a", opacity: 0.6, duration: 7.1, delay: 3.8, driftX: 12, driftY: -14 },
  { id: 21, startX: 58, startY: 68, size: 2, color: "#ffffff", opacity: 0.75, duration: 6.4, delay: 1.9, driftX: -14, driftY: 16 },
  { id: 22, startX: 70, startY: 72, size: 2, color: "#fde047", opacity: 0.65, duration: 8.2, delay: 2.7, driftX: 10, driftY: -18 },
];

/**
 * Partículas atmosféricas flotantes (polvo dorado, polen y destellos de luz).
 * Dan vida continua a la explanada sin distraer la jugabilidad.
 */
export const AmbientParticles: React.FC<AmbientParticlesProps> = ({
  isPaused = false,
}) => {
  const animState = isPaused ? "paused" : "running";

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 23 }}
    >
      {AMBIENT_PARTICLES.map((p) => (
        <div
          key={`ambient-particle-${p.id}`}
          className="absolute"
          style={{
            left: `${p.startX}%`,
            top: `${p.startY}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size + 1}px ${p.color}`,
            borderRadius: "0px", // Pixel art cuadrado
            opacity: 0,
            animation: `ambientMoteFloat ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            animationPlayState: animState,
            // CSS custom properties pasadas al keyframe
            ["--drift-x" as string]: `${p.driftX}px`,
            ["--drift-y" as string]: `${p.driftY}px`,
            ["--max-opacity" as string]: p.opacity,
            imageRendering: "pixelated",
          }}
        />
      ))}
    </div>
  );
};
