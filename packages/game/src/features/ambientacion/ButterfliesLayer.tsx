import React from "react";
import { PixelButterfly, type ButterflyVariant } from "./PixelButterfly";

interface ButterfliesLayerProps {
  isPaused?: boolean;
}

interface ButterflyInstance {
  id: string;
  variant: ButterflyVariant;
  baseX: number; // Porcentaje X del ancla en el escenario
  baseY: number; // Porcentaje Y del ancla
  width: string; // Ancho del sprite
  animationName: string; // Nombre del keyframe de vuelo
  duration: number; // Duración del ciclo en segundos
  delay: number; // Desfase temporal
  zIndex: number; // Capa de profundidad
}

// 6 mariposas estratégicamente ubicadas sobre la vegetación
const BUTTERFLIES_CONFIG: ButterflyInstance[] = [
  // 1. Mariposa Monarca sobre las flores blancas del arbusto inferior izquierdo
  {
    id: "monarca-bush-left",
    variant: "monarca",
    baseX: 11.5,
    baseY: 86.0,
    width: "2.1%",
    animationName: "butterflyFlyPathLeftA",
    duration: 8.4,
    delay: 0,
    zIndex: 32, // Por encima de los arbustos inferiores (z-30)
  },
  // 2. Mariposa Amarilla (Azufre) sobre el helecho y borde izquierdo
  {
    id: "amarilla-bush-left",
    variant: "amarilla",
    baseX: 21.0,
    baseY: 80.5,
    width: "1.9%",
    animationName: "butterflyFlyPathLeftB",
    duration: 7.2,
    delay: 1.8,
    zIndex: 32,
  },
  // 3. Mariposa Celeste sobre las flores rosadas del arbusto inferior derecho
  {
    id: "celeste-bush-right",
    variant: "celeste",
    baseX: 89.0,
    baseY: 87.0,
    width: "2.0%",
    animationName: "butterflyFlyPathRightA",
    duration: 8.8,
    delay: 0.6,
    zIndex: 32,
  },
  // 4. Mariposa Monarca cerca del letrero VOTA y vegetación derecha
  {
    id: "monarca-bush-right",
    variant: "monarca",
    baseX: 78.5,
    baseY: 82.0,
    width: "2.1%",
    animationName: "butterflyFlyPathRightB",
    duration: 7.6,
    delay: 2.4,
    zIndex: 32,
  },
  // 5. Mariposa Amarilla en la arboleda superior izquierda (árbol con cartel INE)
  {
    id: "amarilla-tree-left",
    variant: "amarilla",
    baseX: 9.0,
    baseY: 26.5,
    width: "1.8%",
    animationName: "butterflyFlyPathCanopyLeft",
    duration: 9.2,
    delay: 3.1,
    zIndex: 25, // Entre los árboles y antes del HUD
  },
  // 6. Mariposa Celeste en el pinar y arbusto superior derecho
  {
    id: "celeste-tree-right",
    variant: "celeste",
    baseX: 92.0,
    baseY: 30.0,
    width: "1.9%",
    animationName: "butterflyFlyPathCanopyRight",
    duration: 8.0,
    delay: 1.2,
    zIndex: 25,
  },
];

/**
 * Capa de maripositas pixel art animadas en las áreas verdes del escenario.
 * Vuelan con trayectorias orgánicas en forma de ocho y suaves oscilaciones.
 */
export const ButterfliesLayer: React.FC<ButterfliesLayerProps> = ({
  isPaused = false,
}) => {
  const animState = isPaused ? "paused" : "running";

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
    >
      {BUTTERFLIES_CONFIG.map((b) => (
        <div
          key={`butterfly-${b.id}`}
          className="absolute flex items-center justify-center pointer-events-none select-none"
          style={{
            left: `${b.baseX}%`,
            top: `${b.baseY}%`,
            width: b.width,
            aspectRatio: "16 / 14",
            zIndex: b.zIndex,
            animation: `${b.animationName} ${b.duration}s ease-in-out infinite`,
            animationDelay: `${b.delay}s`,
            animationPlayState: animState,
            willChange: "transform",
          }}
        >
          {/* Contenedor del sprite con animación de aleteo */}
          <div
            className="w-full h-full"
            style={{
              animationPlayState: animState,
            }}
          >
            <PixelButterfly variant={b.variant} />
          </div>
        </div>
      ))}
    </div>
  );
};
