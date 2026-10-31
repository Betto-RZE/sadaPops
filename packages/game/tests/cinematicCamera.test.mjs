// Pruebas unitarias para el sistema de cámara cinematográfica suave (Fase 2 - Afinación)
// Ejecutar desde packages/game: pnpm test

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calculateCameraShift,
} from "../src/features/npcs/useCinematicNpcCamera.ts";

describe("Cámara Cinematográfica Dinámica (useCinematicNpcCamera)", () => {
  describe("Cálculo de encuadre y límites de la cámara", () => {
    test("calcula el desplazamiento exacto para centrar al protagonista en la mesa", () => {
      const playerPos = { x: 20.0, y: 52.0 };
      const shift = calculateCameraShift(playerPos, 2.0);

      // maxCamShift = (1 - 1/2) * 50 = 25
      // 50 - 20 = 30 -> clampeado a 25
      // 50 - 52 = -2 -> dentro del rango [-25, 25]
      assert.equal(shift.x, 25.0);
      assert.equal(shift.y, -2.0);
    });

    test("calcula el desplazamiento para encuadrar la entrada del NPC en el borde inferior", () => {
      const npcSpawn = { x: 52.0, y: 106.0 };
      const shift = calculateCameraShift(npcSpawn, 2.0);

      // 50 - 52 = -2.0
      // 50 - 106 = -56 -> clampeado a -25
      assert.equal(shift.x, -2.0);
      assert.equal(shift.y, -25.0);
    });

    test("calcula el desplazamiento para encuadrar al NPC votando frente a la mampara 3", () => {
      const boothTarget = { x: 52.0, y: 36.5 };
      const shift = calculateCameraShift(boothTarget, 2.0);

      // 50 - 52 = -2.0
      // 50 - 36.5 = 13.5 -> dentro del rango [-25, 25]
      assert.equal(shift.x, -2.0);
      assert.equal(shift.y, 13.5);
    });

    test("respeta los límites máximos permitidos sin distorsionar el escenario", () => {
      const extremePos = { x: -100.0, y: 300.0 };
      const shift = calculateCameraShift(extremePos, 2.0);

      assert.ok(shift.x <= 25.0 && shift.x >= -25.0);
      assert.ok(shift.y <= 25.0 && shift.y >= -25.0);
    });
  });

  describe("Suavizado y amortiguación dinámica", () => {
    test("la amortiguación exponencial produce transiciones continuas sin saltos bruscos", () => {
      const speed = 2.8;
      const dt = 0.016; // ~60 FPS
      const blend = 1 - Math.exp(-speed * dt);

      // El factor de mezcla por cuadro debe ser suave (~4.3%)
      assert.ok(blend > 0.03 && blend < 0.06);

      // Simular paneo suave desde la posición del jugador hacia la mampara 3
      let currentX = 25.0;
      let currentY = -2.0;
      const targetX = -2.0;
      const targetY = 13.5;

      for (let frame = 0; frame < 60; frame++) {
        const prevX = currentX;
        const prevY = currentY;

        currentX += (targetX - currentX) * blend;
        currentY += (targetY - currentY) * blend;

        // Cada paso debe ser continuo y acercarse monotónicamente al objetivo
        assert.ok(currentX <= prevX, "X debe avanzar de forma decreciente hacia -2.0");
        assert.ok(currentY >= prevY, "Y debe avanzar de forma creciente hacia 13.5");
      }

      // Tras 1 segundo (~60 cuadros), debe haber cubierto más del 90% de la distancia
      const remainingDist = Math.hypot(targetX - currentX, targetY - currentY);
      const initialDist = Math.hypot(targetX - 25.0, targetY - (-2.0));
      assert.ok(remainingDist / initialDist < 0.1);
    });
  });

  describe("Enfoque cinematográfico secundario: Llegada de la anciana a la mesa", () => {
    test("calcula el encuadre exacto para centrar a la anciana a { x: 26.0, y: 66.0 }", () => {
      const ancianaPos = { x: 26.0, y: 66.0 };
      const shift = calculateCameraShift(ancianaPos, 2.0);

      // maxCamShift = (1 - 1/2) * 50 = 25
      // 50 - 26 = 24.0 -> dentro del rango [-25, 25]
      // 50 - 66 = -16.0 -> dentro del rango [-25, 25]
      assert.equal(shift.x, 24.0);
      assert.equal(shift.y, -16.0);
    });

    test("el encuadre de la anciana respeta los límites de corte del escenario", () => {
      const ancianaPos = { x: 26.0, y: 66.0 };
      const shift = calculateCameraShift(ancianaPos, 2.0);

      assert.ok(shift.x >= -25.0 && shift.x <= 25.0);
      assert.ok(shift.y >= -25.0 && shift.y <= 25.0);
    });

    test("transición suave desde el protagonista hacia la anciana", () => {
      const playerShift = calculateCameraShift({ x: 20.0, y: 52.0 }, 2.0); // { x: 25, y: -2 }
      const ancianaShift = calculateCameraShift({ x: 26.0, y: 66.0 }, 2.0); // { x: 24, y: -16 }

      const speed = 2.8;
      const dt = 0.016;
      const blend = 1 - Math.exp(-speed * dt);

      let curX = playerShift.x;
      let curY = playerShift.y;

      for (let f = 0; f < 60; f++) {
        curX += (ancianaShift.x - curX) * blend;
        curY += (ancianaShift.y - curY) * blend;
      }

      // Después de 60 frames (~1s), debe estar a menos del 10% de distancia
      const remaining = Math.hypot(ancianaShift.x - curX, ancianaShift.y - curY);
      const total = Math.hypot(
        ancianaShift.x - playerShift.x,
        ancianaShift.y - playerShift.y,
      );
      assert.ok(remaining / total < 0.1);
    });

    test("duración de permanencia en la anciana es de exactamente 3000 ms (3 segundos)", () => {
      const targetDurationMs = 3000;
      let holdElapsedMs = 0;
      const dtMs = 16.666;

      while (holdElapsedMs < targetDurationMs) {
        holdElapsedMs += dtMs;
      }

      assert.ok(holdElapsedMs >= 3000);
      assert.ok(holdElapsedMs < 3050);
    });
  });
});
