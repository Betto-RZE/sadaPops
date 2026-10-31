import React from "react";

export type ButterflyVariant = "monarca" | "amarilla" | "celeste";

interface PixelButterflyProps {
  variant: ButterflyVariant;
  className?: string;
}

/**
 * Pixel art butterfly rendered via crisp SVG pixels.
 * Uses exact pixel dimensions and responsive vectors with crispEdges.
 */
export const PixelButterfly: React.FC<PixelButterflyProps> = ({
  variant,
  className = "",
}) => {
  // Color palettes per variant
  // Monarca: Mexican Monarch butterfly (vibrant orange, dark slate border, white specks)
  // Amarilla: Sulfur butterfly (lemon yellow, golden amber, dark tip)
  // Celeste: Morpho / azure butterfly (sky blue, soft violet, dark edge)
  const colors = {
    monarca: {
      body: "#0f172a",
      wingMain: "#f97316",
      wingAccent: "#ea580c",
      wingEdge: "#1e293b",
      wingSpots: "#ffffff",
    },
    amarilla: {
      body: "#1e293b",
      wingMain: "#fde047",
      wingAccent: "#eab308",
      wingEdge: "#713f12",
      wingSpots: "#ffffff",
    },
    celeste: {
      body: "#0f172a",
      wingMain: "#38bdf8",
      wingAccent: "#818cf8",
      wingEdge: "#1e1b4b",
      wingSpots: "#ffffff",
    },
  }[variant];

  return (
    <svg
      viewBox="0 0 16 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full overflow-visible ${className}`}
      style={{
        imageRendering: "pixelated",
        shapeRendering: "crispEdges",
      }}
      aria-hidden="true"
    >
      {/* ALA IZQUIERDA (Animada independientemente con flapWingLeft) */}
      <g className="origin-[8px_7px] animate-wing-flap-left">
        {/* Borde exterior del ala */}
        <rect x="2" y="1" width="6" height="1" fill={colors.wingEdge} />
        <rect x="1" y="2" width="2" height="5" fill={colors.wingEdge} />
        <rect x="2" y="7" width="2" height="4" fill={colors.wingEdge} />
        <rect x="4" y="10" width="3" height="2" fill={colors.wingEdge} />

        {/* Color principal del ala */}
        <rect x="3" y="2" width="4" height="4" fill={colors.wingMain} />
        <rect x="4" y="6" width="3" height="3" fill={colors.wingMain} />

        {/* Sombra y acentos interiores del ala */}
        <rect x="5" y="3" width="2" height="2" fill={colors.wingAccent} />
        <rect x="4" y="7" width="2" height="2" fill={colors.wingAccent} />

        {/* Puntos de luz pixel art (manchitas blancas típicas de la mariposa monarca) */}
        <rect x="2" y="2" width="1" height="1" fill={colors.wingSpots} />
        <rect x="2" y="6" width="1" height="1" fill={colors.wingSpots} />
        <rect x="5" y="10" width="1" height="1" fill={colors.wingSpots} />
      </g>

      {/* ALA DERECHA (Animada simétricamente con flapWingRight) */}
      <g className="origin-[8px_7px] animate-wing-flap-right">
        {/* Borde exterior del ala */}
        <rect x="8" y="1" width="6" height="1" fill={colors.wingEdge} />
        <rect x="13" y="2" width="2" height="5" fill={colors.wingEdge} />
        <rect x="12" y="7" width="2" height="4" fill={colors.wingEdge} />
        <rect x="9" y="10" width="3" height="2" fill={colors.wingEdge} />

        {/* Color principal del ala */}
        <rect x="9" y="2" width="4" height="4" fill={colors.wingMain} />
        <rect x="9" y="6" width="3" height="3" fill={colors.wingMain} />

        {/* Sombra y acentos interiores del ala */}
        <rect x="9" y="3" width="2" height="2" fill={colors.wingAccent} />
        <rect x="10" y="7" width="2" height="2" fill={colors.wingAccent} />

        {/* Puntos de luz pixel art */}
        <rect x="13" y="2" width="1" height="1" fill={colors.wingSpots} />
        <rect x="13" y="6" width="1" height="1" fill={colors.wingSpots} />
        <rect x="10" y="10" width="1" height="1" fill={colors.wingSpots} />
      </g>

      {/* CUERPO CENTRAL DE LA MARIPOSA */}
      <rect x="7" y="3" width="2" height="7" fill={colors.body} rx="0.5" />
      {/* Cabeza */}
      <rect x="7" y="2" width="2" height="1" fill={colors.body} />
      {/* Antenas pixel art */}
      <rect x="6" y="0" width="1" height="2" fill={colors.body} />
      <rect x="9" y="0" width="1" height="2" fill={colors.body} />
    </svg>
  );
};
