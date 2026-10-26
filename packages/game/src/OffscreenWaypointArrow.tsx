import React from "react";

export interface OffscreenWaypointArrowProps {
  /** Posición en el mundo del objetivo activo (%) o null si no hay objetivo activo */
  target: { x: number; y: number } | null;
  /** Desplazamiento X de la cámara (%) */
  camX: number;
  /** Desplazamiento Y de la cámara (%) */
  camY: number;
  /** Escala de zoom de la cámara (por defecto 2.0) */
  zoomScale?: number;
}

/**
 * Flecha pixel art de navegación (Waypoint Arrow) que aparece en los bordes de la pantalla
 * cuando el objetivo interactivo con signo de exclamación (!) se encuentra fuera de cámara.
 * Apunta de manera suave y precisa hacia el objetivo más cercano en 60 FPS.
 */
export const OffscreenWaypointArrow = React.memo(
  function OffscreenWaypointArrow({
    target,
    camX,
    camY,
    zoomScale = 2.0,
  }: OffscreenWaypointArrowProps) {
    if (!target) return null;

    // Proyección de la posición del objetivo en pantalla (0% a 100% del viewport)
    const targetScreenX = 50 + (target.x + camX - 50) * zoomScale;
    const targetScreenY = 50 + (target.y + camY - 50) * zoomScale;

    // ¿El signo de exclamación se encuentra dentro del encuadre visible de la cámara?
    const isTargetInView =
      targetScreenX >= 4 &&
      targetScreenX <= 96 &&
      targetScreenY >= 5 &&
      targetScreenY <= 95;

    if (isTargetInView) return null;

    // Vector de dirección desde el centro de la pantalla hacia el objetivo fuera de cámara
    const dirX = targetScreenX - 50;
    const dirY = targetScreenY - 50;
    const arrowAngleRad = Math.atan2(dirY, dirX);
    const arrowAngleDeg = (arrowAngleRad * 180) / Math.PI;

    // Perímetro elíptico pegado a los bordes de la cámara (HUD ultra-fluido en 60 FPS):
    // X varía suavemente en [3.5%, 96.5%] (radio = 46.5%)
    // Y varía suavemente en [5.5%, 94.5%] (radio = 44.5%)
    const arrowScreenX = 50 + 46.5 * Math.cos(arrowAngleRad);
    const arrowScreenY = 50 + 44.5 * Math.sin(arrowAngleRad);

    return (
      <div
        data-testid="offscreen-waypoint-arrow"
        className="absolute pointer-events-none z-30 select-none"
        style={{
          left: `${arrowScreenX}%`,
          top: `${arrowScreenY}%`,
          transform: `translate(-50%, -50%) rotate(${arrowAngleDeg}deg)`,
          willChange: "left, top, transform",
        }}
      >
        <div
          style={{
            animation: "pixelArrowPulse 0.9s ease-in-out infinite",
          }}
          className="flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
        >
          <img
            src="/assets/juego/flecha-rosa.png"
            alt="Flecha indicadora de objetivo"
            className="w-[clamp(28px,4.2cqw,96px)] h-[clamp(28px,4.2cqw,96px)] object-contain select-none pointer-events-none"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      </div>
    );
  },
);
