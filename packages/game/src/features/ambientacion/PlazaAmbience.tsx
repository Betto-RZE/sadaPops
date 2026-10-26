import React from "react";
import { Sunbeams } from "./Sunbeams";
import { AmbientParticles } from "./AmbientParticles";
import { FallingPetals } from "./FallingPetals";
import { ButterfliesLayer } from "./ButterfliesLayer";

export interface PlazaAmbienceProps {
  /** Congela las animaciones cuando el juego está pausado */
  isPaused?: boolean;
  /** Oculta por completo la ambientación (ej. durante el POV del simulador de voto) */
  hidden?: boolean;
  /** Habilitar/deshabilitar capas individuales si se desea */
  showSunbeams?: boolean;
  showParticles?: boolean;
  showButterflies?: boolean;
  showPetals?: boolean;
}

/**
 * Sistema integral de ambientación visual dinámica para el escenario de la plaza electoral.
 * Aporta vida mediante:
 * 1. Rayos de luz solar (God Rays) filtrándose entre los árboles hacia la explanada.
 * 2. Motes de polvo dorado y polen flotando con oscilación senoidal.
 * 3. Maripositas pixel art (Monarcas, Amarillas y Celestes) revoloteando sobre los arbustos y árboles.
 * 4. Pétalos de dalia cayendo suavemente con la brisa.
 */
export const PlazaAmbience: React.FC<PlazaAmbienceProps> = React.memo(
  function PlazaAmbience({
    isPaused = false,
    hidden = false,
    showSunbeams = true,
    showParticles = true,
    showButterflies = true,
    showPetals = true,
  }: PlazaAmbienceProps) {
    if (hidden) return null;

  return (
    <div
      aria-hidden="true"
      data-testid="plaza-ambience"
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden"
    >
      {/* KEYFRAMES GLOBALES DE AMBIENTACIÓN */}
      <style>{`
        /* --- ALETEO DE ALAS DE MARIPOSA (180ms por batida) --- */
        @keyframes flapWingLeft {
          0%, 100% { transform: scaleX(1); }
          25% { transform: scaleX(0.15); }
          50% { transform: scaleX(0.85); }
          75% { transform: scaleX(0.1); }
        }
        @keyframes flapWingRight {
          0%, 100% { transform: scaleX(1); }
          25% { transform: scaleX(0.15); }
          50% { transform: scaleX(0.85); }
          75% { transform: scaleX(0.1); }
        }
        .animate-wing-flap-left {
          animation: flapWingLeft 0.22s ease-in-out infinite;
        }
        .animate-wing-flap-right {
          animation: flapWingRight 0.22s ease-in-out infinite;
        }

        /* --- PULSO DE RAYOS DE SOL (GOD RAYS) --- */
        @keyframes sunbeamPulse1 {
          0%, 100% { opacity: 0.75; transform: translateX(0px); }
          50% { opacity: 0.95; transform: translateX(6px); }
        }
        @keyframes sunbeamPulse2 {
          0%, 100% { opacity: 0.85; transform: translateX(0px); }
          50% { opacity: 0.65; transform: translateX(-8px); }
        }
        @keyframes sunbeamPulse3 {
          0%, 100% { opacity: 0.70; transform: translateX(0px); }
          50% { opacity: 0.90; transform: translateX(5px); }
        }
        @keyframes sunbeamPulse4 {
          0%, 100% { opacity: 0.80; transform: translateX(0px); }
          50% { opacity: 0.55; transform: translateX(-4px); }
        }
        .animate-sunbeam-pulse-1 {
          animation: sunbeamPulse1 7.2s ease-in-out infinite;
        }
        .animate-sunbeam-pulse-2 {
          animation: sunbeamPulse2 9.0s ease-in-out infinite;
        }
        .animate-sunbeam-pulse-3 {
          animation: sunbeamPulse3 8.1s ease-in-out infinite;
        }
        .animate-sunbeam-pulse-4 {
          animation: sunbeamPulse4 6.4s ease-in-out infinite;
        }

        /* --- FLOTADO DE PARTÍCULAS / POLEN --- */
        @keyframes ambientMoteFloat {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) scale(0.8);
          }
          15% {
            opacity: var(--max-opacity, 0.8);
          }
          50% {
            opacity: calc(var(--max-opacity, 0.8) * 0.9);
            transform: translate3d(var(--drift-x, 15px), calc(var(--drift-y, -20px) * 0.5), 0) scale(1.1);
          }
          85% {
            opacity: var(--max-opacity, 0.8);
          }
          100% {
            opacity: 0;
            transform: translate3d(calc(var(--drift-x, 15px) * 1.5), var(--drift-y, -20px), 0) scale(0.85);
          }
        }

        /* --- CAÍDA SUAVE DE PÉTALOS DE DALIA --- */
        @keyframes fallingPetalDrift {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          10% {
            opacity: 0.85;
          }
          25% {
            transform: translate3d(var(--sway-x, 30px), 70px, 0) rotate(45deg);
          }
          50% {
            transform: translate3d(calc(var(--sway-x, 30px) * -0.6), 150px, 0) rotate(110deg);
          }
          75% {
            transform: translate3d(calc(var(--sway-x, 30px) * 1.2), 240px, 0) rotate(190deg);
            opacity: 0.85;
          }
          95% {
            opacity: 0.4;
          }
          100% {
            opacity: 0;
            transform: translate3d(0px, 320px, 0) rotate(260deg);
          }
        }

        /* --- TRAYECTORIAS DE VUELO DE MARIPOSAS --- */

        /* 1. Mariposa sobre flores de arbusto izquierdo (trayectoria en 8 suave) */
        @keyframes butterflyFlyPathLeftA {
          0% {
            transform: translate3d(0px, 0px, 0) scaleX(1) rotate(-4deg);
          }
          20% {
            transform: translate3d(14px, -12px, 0) scaleX(1) rotate(8deg);
          }
          40% {
            transform: translate3d(24px, -4px, 0) scaleX(1) rotate(-2deg);
          }
          50% {
            transform: translate3d(18px, 6px, 0) scaleX(-1) rotate(6deg);
          }
          70% {
            transform: translate3d(6px, 12px, 0) scaleX(-1) rotate(-6deg);
          }
          85% {
            transform: translate3d(-8px, 2px, 0) scaleX(-1) rotate(4deg);
          }
          100% {
            transform: translate3d(0px, 0px, 0) scaleX(1) rotate(-4deg);
          }
        }

        /* 2. Mariposa amarilla sobre helecho izquierdo */
        @keyframes butterflyFlyPathLeftB {
          0% {
            transform: translate3d(0px, 0px, 0) scaleX(1) rotate(6deg);
          }
          25% {
            transform: translate3d(18px, -16px, 0) scaleX(1) rotate(-8deg);
          }
          45% {
            transform: translate3d(10px, -24px, 0) scaleX(-1) rotate(5deg);
          }
          65% {
            transform: translate3d(-12px, -14px, 0) scaleX(-1) rotate(-6deg);
          }
          85% {
            transform: translate3d(-6px, 4px, 0) scaleX(1) rotate(8deg);
          }
          100% {
            transform: translate3d(0px, 0px, 0) scaleX(1) rotate(6deg);
          }
        }

        /* 3. Mariposa celeste sobre flores de arbusto derecho */
        @keyframes butterflyFlyPathRightA {
          0% {
            transform: translate3d(0px, 0px, 0) scaleX(-1) rotate(4deg);
          }
          22% {
            transform: translate3d(-16px, -10px, 0) scaleX(-1) rotate(-6deg);
          }
          45% {
            transform: translate3d(-26px, 2px, 0) scaleX(-1) rotate(5deg);
          }
          55% {
            transform: translate3d(-18px, 12px, 0) scaleX(1) rotate(-4deg);
          }
          75% {
            transform: translate3d(-4px, 8px, 0) scaleX(1) rotate(8deg);
          }
          90% {
            transform: translate3d(8px, -2px, 0) scaleX(1) rotate(-3deg);
          }
          100% {
            transform: translate3d(0px, 0px, 0) scaleX(-1) rotate(4deg);
          }
        }

        /* 4. Mariposa sobre cartel VOTA y follaje derecho */
        @keyframes butterflyFlyPathRightB {
          0% {
            transform: translate3d(0px, 0px, 0) scaleX(1) rotate(-6deg);
          }
          25% {
            transform: translate3d(14px, -18px, 0) scaleX(1) rotate(10deg);
          }
          48% {
            transform: translate3d(24px, -8px, 0) scaleX(-1) rotate(-4deg);
          }
          70% {
            transform: translate3d(8px, 6px, 0) scaleX(-1) rotate(8deg);
          }
          88% {
            transform: translate3d(-10px, -6px, 0) scaleX(1) rotate(-5deg);
          }
          100% {
            transform: translate3d(0px, 0px, 0) scaleX(1) rotate(-6deg);
          }
        }

        /* 5. Mariposa en arboleda superior izquierda (árbol con cartel INE) */
        @keyframes butterflyFlyPathCanopyLeft {
          0% {
            transform: translate3d(0px, 0px, 0) scaleX(1) rotate(5deg);
          }
          30% {
            transform: translate3d(22px, -14px, 0) scaleX(1) rotate(-7deg);
          }
          50% {
            transform: translate3d(30px, 4px, 0) scaleX(-1) rotate(6deg);
          }
          75% {
            transform: translate3d(12px, 16px, 0) scaleX(-1) rotate(-8deg);
          }
          90% {
            transform: translate3d(-6px, 8px, 0) scaleX(1) rotate(4deg);
          }
          100% {
            transform: translate3d(0px, 0px, 0) scaleX(1) rotate(5deg);
          }
        }

        /* 6. Mariposa en arboleda superior derecha */
        @keyframes butterflyFlyPathCanopyRight {
          0% {
            transform: translate3d(0px, 0px, 0) scaleX(-1) rotate(-5deg);
          }
          25% {
            transform: translate3d(-18px, -16px, 0) scaleX(-1) rotate(6deg);
          }
          50% {
            transform: translate3d(-28px, 6px, 0) scaleX(1) rotate(-4deg);
          }
          75% {
            transform: translate3d(-10px, 14px, 0) scaleX(1) rotate(8deg);
          }
          90% {
            transform: translate3d(4px, -2px, 0) scaleX(-1) rotate(-3deg);
          }
          100% {
            transform: translate3d(0px, 0px, 0) scaleX(-1) rotate(-5deg);
          }
        }
      `}</style>

      {/* 1. RAYOS DE SOL (GOD RAYS) */}
      {showSunbeams && <Sunbeams isPaused={isPaused} />}

      {/* 2. PARTÍCULAS AMBIENTALES DE POLEN Y POLVO DORADO */}
      {showParticles && <AmbientParticles isPaused={isPaused} />}

      {/* 3. PÉTALOS DE DALIA FLOTANTES */}
      {showPetals && <FallingPetals isPaused={isPaused} />}

      {/* 4. MARIPOSITAS VOLANDO EN ÁREAS VERDES */}
      {showButterflies && <ButterfliesLayer isPaused={isPaused} />}
    </div>
  );
});
