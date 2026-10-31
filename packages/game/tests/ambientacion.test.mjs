import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, "../src");

describe("Sistema de Ambientación Dinámica del Escenario (Rayos de luz, Partículas, Maripositas y Pétalos)", () => {
  describe("1. Estructura y exportaciones de la feature ambientacion", () => {
    test("index.ts exporta PlazaAmbience, PixelButterfly, Sunbeams, AmbientParticles, FallingPetals y ButterfliesLayer", () => {
      const indexPath = path.join(srcDir, "features/ambientacion/index.ts");
      assert.ok(fs.existsSync(indexPath), "index.ts debe existir");
      const content = fs.readFileSync(indexPath, "utf8");
      assert.ok(content.includes("PlazaAmbience"));
      assert.ok(content.includes("PixelButterfly"));
      assert.ok(content.includes("Sunbeams"));
      assert.ok(content.includes("AmbientParticles"));
      assert.ok(content.includes("FallingPetals"));
      assert.ok(content.includes("ButterfliesLayer"));
    });

    test("packages/game/src/index.tsx reexporta la feature ambientacion", () => {
      const gameIndexPath = path.join(srcDir, "index.tsx");
      const content = fs.readFileSync(gameIndexPath, "utf8");
      assert.ok(content.includes('export * from "./features/ambientacion"'));
    });
  });

  describe("2. Configuración de Mariposas en Áreas Verdes (ButterfliesLayer)", () => {
    test("posee mariposas ubicadas en arbustos inferiores y copas de árboles", () => {
      const file = path.join(srcDir, "features/ambientacion/ButterfliesLayer.tsx");
      const content = fs.readFileSync(file, "utf8");

      // Verificamos variantes requeridas
      assert.ok(content.includes('"monarca"'), "Incluye mariposa monarca");
      assert.ok(content.includes('"amarilla"'), "Incluye mariposa amarilla");
      assert.ok(content.includes('"celeste"'), "Incluye mariposa celeste");

      // Verificamos presencia en las áreas verdes clave
      assert.ok(content.includes("monarca-bush-left"), "Mariposa en arbusto izquierdo");
      assert.ok(content.includes("amarilla-bush-left"), "Mariposa en arbusto izquierdo");
      assert.ok(content.includes("celeste-bush-right"), "Mariposa en arbusto derecho");
      assert.ok(content.includes("monarca-bush-right"), "Mariposa en arbusto derecho");
      assert.ok(content.includes("amarilla-tree-left"), "Mariposa en arboleda izquierda");
      assert.ok(content.includes("celeste-tree-right"), "Mariposa en arboleda derecha");
    });

    test("las mariposas tienen z-index adecuado para interactuar con los arbustos (z >= 25)", () => {
      const file = path.join(srcDir, "features/ambientacion/ButterfliesLayer.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.includes("zIndex: 32"), "Mariposas sobre arbustos en capa 32");
      assert.ok(content.includes("zIndex: 25"), "Mariposas en árboles en capa 25");
    });
  });

  describe("3. Rayos de Sol (Sunbeams) y Partículas Flotantes", () => {
    test("Sunbeams proyecta 4 haces de luz solar con modo screen y gradientes cálidos", () => {
      const file = path.join(srcDir, "features/ambientacion/Sunbeams.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.includes("mixBlendMode: \"screen\""));
      assert.ok(content.includes("sunbeamGrad1"));
      assert.ok(content.includes("sunbeamGrad2"));
      assert.ok(content.includes("sunbeamGrad3"));
      assert.ok(content.includes("sunbeamGrad4"));
      assert.ok(content.includes("animate-sunbeam-pulse-1"));
    });

    test("AmbientParticles contiene motas de polen y polvo solar cuadradas con animación flotante", () => {
      const file = path.join(srcDir, "features/ambientacion/AmbientParticles.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.includes("ambientMoteFloat"));
      assert.ok(content.includes("AMBIENT_PARTICLES"));
      assert.ok(content.includes("#fef08a"));
    });

    test("FallingPetals proyecta pétalos de dalia con colores temáticos de dalia", () => {
      const file = path.join(srcDir, "features/ambientacion/FallingPetals.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.includes("fallingPetalDrift"));
      assert.ok(content.includes("DAHLIA_PETALS"));
      assert.ok(content.includes("#f43f5e") || content.includes("#ec4899") || content.includes("#db2777"));
    });
  });

  describe("4. Integración en los 3 Capítulos del Juego", () => {
    test("Capítulo 1 (GameplayScene) renderiza PlazaAmbience", () => {
      const file = path.join(srcDir, "GameplayScene.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.includes('import { PlazaAmbience } from "./features/ambientacion"'));
      assert.ok(content.includes("<PlazaAmbience isPaused={isPaused} />"));
    });

    test("Capítulo 2 (Chapter2Scene) renderiza PlazaAmbience", () => {
      const file = path.join(srcDir, "Chapter2Scene.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.includes('import { PlazaAmbience } from "./features/ambientacion"'));
      assert.ok(content.includes("<PlazaAmbience isPaused={isPaused} />"));
    });

    test("Capítulo 3 (Chapter3Scene) renderiza PlazaAmbience ÚNICAMENTE fuera del POV del simulador de voto", () => {
      const file = path.join(srcDir, "Chapter3Scene.tsx");
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.includes('import { PlazaAmbience } from "./features/ambientacion"'));

      // REGLA CRÍTICA DEL USUARIO: En el POV del simulador de voto NO se debe ver la ambientación
      assert.ok(
        /selectedMamparaIndex\s*===\s*null\s*&&\s*\(\s*<PlazaAmbience/m.test(content) ||
        /selectedMamparaIndex\s*===\s*null\s*&&\s*<PlazaAmbience/m.test(content),
        "PlazaAmbience DEBE estar condicionada a selectedMamparaIndex === null"
      );
    });
  });
});
