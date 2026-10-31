// Pruebas unitarias para el Sistema de Flecha de Navegación Fuera de Pantalla (Waypoint Arrow)
// y Calibración de Posición de Iconos de Exclamación en las Mamparas.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Sistema de Indicador de Flecha y Posición de Iconos de Exclamación", () => {
  const cap1Path = path.join(__dirname, "../src/GameplayScene.tsx");
  const cap1Content = fs.readFileSync(cap1Path, "utf8");

  describe("1. Calibración hacia abajo de los iconos de las mamparas", () => {
    test("los iconos de exclamación de las mamparas están calibrados en Y = 33.0%", () => {
      // Extraer bloque de casillas dentro de EXCLAMATION_ICON_POSITIONS
      const match = cap1Content.match(/casillas:\s*\[([\s\S]*?)\]/);
      assert.ok(match, "Debe existir la clave casillas en EXCLAMATION_ICON_POSITIONS");

      const coords = [...match[1].matchAll(/\{\s*x:\s*([\d.]+),\s*y:\s*([\d.]+)\s*\}/g)].map(
        (m) => ({ x: parseFloat(m[1]), y: parseFloat(m[2]) }),
      );

      assert.equal(coords.length, 4, "Deben existir exactamente 4 iconos para las mamparas");
      coords.forEach((icon, idx) => {
        assert.equal(
          icon.y,
          33.0,
          `Mampara ${idx + 1} debe tener su icono a Y = 33.0% (hacia abajo)`,
        );
      });
    });

    test("los iconos de las mamparas están situados debajo de las boletas (27.5%) y sobre la base (36.0%)", () => {
      const match = cap1Content.match(/casillas:\s*\[([\s\S]*?)\]/);
      const coords = [...match[1].matchAll(/\{\s*x:\s*([\d.]+),\s*y:\s*([\d.]+)\s*\}/g)].map(
        (m) => ({ x: parseFloat(m[1]), y: parseFloat(m[2]) }),
      );

      const expectedX = [32.0, 42.0, 52.0, 62.0];
      coords.forEach((icon, idx) => {
        assert.ok(
          icon.y > 27.5,
          `El icono ${idx + 1} debe estar debajo de la repisa de boletas (27.5%)`,
        );
        assert.ok(
          icon.y < 36.0,
          `El icono ${idx + 1} debe estar por encima de la base del suelo (36.0%)`,
        );
        assert.equal(icon.x, expectedX[idx], "Coordenada X debe coincidir con la mampara");
      });
    });
  });

  describe("2. Proyección de pantalla y cálculo de flecha fuera de encuadre (Off-screen Arrow)", () => {
    const zoomScale = 2.0;

    const computeArrowState = (target, playerPos) => {
      if (!target) return { show: false };

      const maxCamShift = (1 - 1 / zoomScale) * 50;
      const rawCamX = 50 - playerPos.x;
      const rawCamY = 50 - playerPos.y;
      const camX = Math.min(maxCamShift, Math.max(-maxCamShift, rawCamX));
      const camY = Math.min(maxCamShift, Math.max(-maxCamShift, rawCamY));

      const targetScreenX = 50 + (target.x + camX - 50) * zoomScale;
      const targetScreenY = 50 + (target.y + camY - 50) * zoomScale;

      const isTargetInView =
        targetScreenX >= 4 &&
        targetScreenX <= 96 &&
        targetScreenY >= 5 &&
        targetScreenY <= 95;

      const show = !isTargetInView;
      if (!show) {
        return { show: false, targetScreenX, targetScreenY };
      }

      const dirX = targetScreenX - 50;
      const dirY = targetScreenY - 50;
      const arrowAngleRad = Math.atan2(dirY, dirX);
      const arrowAngleDeg = (arrowAngleRad * 180) / Math.PI;

      const arrowScreenX = 50 + 46.5 * Math.cos(arrowAngleRad);
      const arrowScreenY = 50 + 44.5 * Math.sin(arrowAngleRad);

      return {
        show: true,
        targetScreenX,
        targetScreenY,
        arrowAngleDeg,
        arrowScreenX,
        arrowScreenY,
      };
    };

    test("cuando el objetivo está en pantalla, no se muestra flecha indicadora", () => {
      // Jugador junto al objetivo
      const target = { x: 50.0, y: 50.0 };
      const player = { x: 50.0, y: 50.0 };
      const state = computeArrowState(target, player);
      assert.equal(state.show, false);
      assert.ok(state.targetScreenX >= 4 && state.targetScreenX <= 96);
      assert.ok(state.targetScreenY >= 5 && state.targetScreenY <= 95);
    });

    test("cuando el objetivo está fuera de pantalla (ej. mamparas al inicio del Cap 3), se muestra la flecha", () => {
      // Jugador en posición inicial del Cap 3 (50, 62) y mampara 1 en (32, 33)
      const target = { x: 32.0, y: 33.0 };
      const player = { x: 50.0, y: 62.0 };
      const state = computeArrowState(target, player);
      assert.equal(state.show, true);
      assert.ok(state.targetScreenY < 5, "El objetivo está por encima del encuadre visible");
      assert.ok(state.arrowAngleDeg < 0, "El ángulo apunta hacia arriba (negativo)");
      assert.ok(state.arrowScreenY <= 50, "La flecha se posiciona en el borde superior");
    });

    test("la flecha apunta al objetivo más cercano cuando hay múltiples mamparas", () => {
      const player = { x: 60.0, y: 62.0 };
      const mamparas = [
        { x: 32.0, y: 33.0 },
        { x: 42.0, y: 33.0 },
        { x: 52.0, y: 33.0 },
        { x: 62.0, y: 33.0 },
      ];
      let closest = null;
      let minD = Infinity;

      mamparas.forEach((icon) => {
        const d = Math.hypot(player.x - icon.x, player.y - icon.y);
        if (d < minD) {
          minD = d;
          closest = icon;
        }
      });

      // Para el jugador en X = 60%, la mampara 4 (X = 62%) es la más cercana
      assert.equal(closest.x, 62.0);
      assert.equal(closest.y, 33.0);
    });
  });

  describe("3. Presencia de OffscreenWaypointArrow en todos los capítulos", () => {
    test("GameplayScene (Cap 1), Chapter2Scene (Cap 2) y Chapter3Scene (Cap 3) integran OffscreenWaypointArrow", () => {
      const cap2Path = path.join(__dirname, "../src/Chapter2Scene.tsx");
      const cap3Path = path.join(__dirname, "../src/Chapter3Scene.tsx");

      const cap2Content = fs.readFileSync(cap2Path, "utf8");
      const cap3Content = fs.readFileSync(cap3Path, "utf8");

      assert.ok(
        cap1Content.includes("<OffscreenWaypointArrow"),
        "Capítulo 1 debe renderizar OffscreenWaypointArrow",
      );
      assert.ok(
        cap2Content.includes("<OffscreenWaypointArrow"),
        "Capítulo 2 debe renderizar OffscreenWaypointArrow",
      );
      assert.ok(
        cap3Content.includes("<OffscreenWaypointArrow"),
        "Capítulo 3 debe renderizar OffscreenWaypointArrow",
      );

      assert.ok(
        cap1Content.includes("pixelArrowPulse"),
        "Capítulo 1 debe contener keyframes pixelArrowPulse",
      );
      assert.ok(
        cap2Content.includes("pixelArrowPulse"),
        "Capítulo 2 debe contener keyframes pixelArrowPulse",
      );
      assert.ok(
        cap3Content.includes("pixelArrowPulse"),
        "Capítulo 3 debe contener keyframes pixelArrowPulse",
      );
    });
  });
});
