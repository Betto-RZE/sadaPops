import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  applyMesaSlidingDeltas,
  tryPolygonWallSlide,
} from "../src/features/colisiones/mesaCollision.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, "../src");

describe("Sistema de Deslizamiento Suave en la Mesa de Funcionarios (Sin Rebotes)", () => {
  describe("1. Redirección de deltas (applyMesaSlidingDeltas)", () => {
    test("al caminar hacia la derecha de la mesa (dx < 0), redirige suavemente en vertical según la zona", () => {
      // Zona inferior de la mesa (Y = 70.0): debe deslizar hacia abajo (dy > 0)
      const resLower = applyMesaSlidingDeltas({ x: 23.5, y: 70.0 }, -0.3, 0);
      assert.ok(resLower.dy > 0, "Debe deslizar hacia abajo en la mitad inferior");
      assert.equal(resLower.dx, -0.3, "Conserva dx original");

      // Zona superior de la mesa (Y = 60.0): debe deslizar hacia arriba (dy < 0)
      const resUpper = applyMesaSlidingDeltas({ x: 25.0, y: 60.0 }, -0.3, 0);
      assert.ok(resUpper.dy < 0, "Debe deslizar hacia arriba en la mitad superior");
    });

    test("al caminar hacia el borde superior de la mesa (dy > 0), redirige hacia la explanada derecha", () => {
      const resTop = applyMesaSlidingDeltas({ x: 20.0, y: 55.5 }, 0, 0.3);
      assert.ok(resTop.dx > 0, "Debe deslizar hacia la derecha (explanada abierta)");
      assert.equal(resTop.dy, 0.3, "Conserva dy original");
    });

    test("al caminar hacia el borde inferior de la mesa (dy < 0), redirige hacia la explanada derecha", () => {
      const resBottom = applyMesaSlidingDeltas({ x: 18.0, y: 76.5 }, 0, -0.3);
      assert.ok(resBottom.dx > 0, "Debe deslizar hacia la derecha (explanada abierta)");
      assert.equal(resBottom.dy, -0.3, "Conserva dy original");
    });

    test("lejos de la mesa no altera los deltas de movimiento", () => {
      const farPos = { x: 50.0, y: 50.0 }; // Centro de la explanada
      const res = applyMesaSlidingDeltas(farPos, -0.3, 0.2);
      assert.equal(res.dx, -0.3);
      assert.equal(res.dy, 0.2);
    });
  });

  describe("2. Deslizamiento continuo con tryPolygonWallSlide (Sin rebotes)", () => {
    const MESA_POLYGON = [
      { x: 16.8, y: 56.0 },
      { x: 25.4, y: 56.4 },
      { x: 22.2, y: 75.5 },
      { x: 12.4, y: 76.6 },
    ];

    const isInside = (x, y) => {
      let inside = false;
      for (let i = 0, j = MESA_POLYGON.length - 1; i < MESA_POLYGON.length; j = i++) {
        const xi = MESA_POLYGON[i].x;
        const yi = MESA_POLYGON[i].y;
        const xj = MESA_POLYGON[j].x;
        const yj = MESA_POLYGON[j].y;
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    };

    const isMockWalkable = (x, y) => !isInside(x, y);

    test("desliza suavemente a lo largo del borde derecho de la mesa", () => {
      // Posición justo fuera del borde derecho de la mesa
      const currentPos = { x: 24.5, y: 65.0 };
      const slide = tryPolygonWallSlide(
        currentPos,
        -0.2, // Empuja hacia la izquierda
        0.2,  // Y se mueve hacia abajo
        MESA_POLYGON,
        isMockWalkable,
      );

      assert.ok(slide !== null, "Debe retornar una posición de deslizamiento");
      assert.ok(isMockWalkable(slide.x, slide.y), "La posición resultante debe ser transitable");
      assert.ok(slide.y > currentPos.y, "Debe progresar hacia abajo a lo largo del borde");
      // La separación del borde debe ser suave (sin saltos bruscos mayores a 0.5%)
      assert.ok(Math.abs(slide.x - currentPos.x) < 0.5, "No debe expulsar al personaje violentamente");
    });

    test("no rebota ni oscila al caminar de frente perpendicular a la mesa", () => {
      const currentPos = { x: 24.5, y: 65.0 };
      const slide = tryPolygonWallSlide(
        currentPos,
        -0.2,
        0,
        MESA_POLYGON,
        isMockWalkable,
      );

      assert.ok(slide !== null);
      assert.ok(isMockWalkable(slide.x, slide.y));
      // Debe guiar a una posición transitable sin expulsar hacia afuera de forma desproporcionada
      assert.ok(slide.x <= currentPos.x + 0.1, "No debe empujar al personaje hacia atrás");
    });
  });

  describe("3. Integración en GameplayScene, Chapter2Scene y Chapter3Scene", () => {
    test("los 3 archivos integran applyMesaSlidingDeltas en sus bucles de movimiento", () => {
      const scene1 = fs.readFileSync(path.join(srcDir, "GameplayScene.tsx"), "utf8");
      const scene2 = fs.readFileSync(path.join(srcDir, "Chapter2Scene.tsx"), "utf8");
      const scene3 = fs.readFileSync(path.join(srcDir, "Chapter3Scene.tsx"), "utf8");

      assert.ok(scene1.includes("applyMesaSlidingDeltas"), "GameplayScene debe incluir applyMesaSlidingDeltas");
      assert.ok(scene2.includes("applyMesaSlidingDeltas"), "Chapter2Scene debe incluir applyMesaSlidingDeltas");
      assert.ok(scene3.includes("applyMesaSlidingDeltas"), "Chapter3Scene debe incluir applyMesaSlidingDeltas");
    });
  });
});
