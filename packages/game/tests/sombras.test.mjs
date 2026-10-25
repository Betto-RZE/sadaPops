import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  SHADOW_PRESETS,
  DECORATION_SHADOWS,
  resolveShadowOptions,
  getGroundShadowStyle,
  getContactShadowStyle,
} from "../src/features/sombras/shadowConfig.ts";

describe("Sistema de sombras en el suelo (ground footprint shadows)", () => {
  describe("1. Geometría y posición de la sombra en el suelo", () => {
    test("la sombra se ubica justo debajo de la base del objeto centrada horizontalmente", () => {
      const style = getGroundShadowStyle(SHADOW_PRESETS.character);
      assert.equal(style.left, "50%");
      assert.equal(style.bottom, "0%");
      assert.equal(style.transform, "translate(-50%, 50%)");
      assert.equal(style.zIndex, -1);
      assert.equal(style.pointerEvents, "none");
      assert.equal(style.borderRadius, "50%");
    });

    test("abarca el área del objeto según su ancho y alto asignado", () => {
      const style = getGroundShadowStyle(SHADOW_PRESETS.character);
      assert.equal(style.width, `${SHADOW_PRESETS.character.widthPercent}%`);
      assert.equal(style.height, `${SHADOW_PRESETS.character.heightPercent}%`);
    });

    test("aplica degradado radial elíptico suave para difuminarse hacia los extremos", () => {
      const style = getGroundShadowStyle(SHADOW_PRESETS.character);
      assert.ok(String(style.background).startsWith("radial-gradient(ellipse at center"));
    });
  });

  describe("2. Presets por tipo de figura", () => {
    test("todos los presets tienen dimensiones y opacidad en rangos válidos", () => {
      for (const [name, p] of Object.entries(SHADOW_PRESETS)) {
        assert.ok(p.widthPercent > 0 && p.widthPercent <= 100, `widthPercent ${name}`);
        assert.ok(p.heightPercent > 0 && p.heightPercent <= 100, `heightPercent ${name}`);
        assert.ok(p.opacity > 0 && p.opacity <= 1, `opacity ${name}`);
        assert.ok(p.blurCqw >= 0, `blur ${name}`);
      }
    });

    test("objetos anchos (tall/mesa) tienen mayor cobertura horizontal que personajes y carteles", () => {
      assert.ok(SHADOW_PRESETS.tall.widthPercent > SHADOW_PRESETS.character.widthPercent);
      assert.ok(SHADOW_PRESETS.mesa.widthPercent > SHADOW_PRESETS.character.widthPercent);
      assert.ok(SHADOW_PRESETS.tall.widthPercent > SHADOW_PRESETS.sign.widthPercent);
    });

    test("getContactShadowStyle provee compatibilidad con la forma de elipse de suelo", () => {
      const s = getContactShadowStyle({ widthPercent: 60, heightPercent: 10, centerPercent: 50, opacity: 0.5 });
      assert.equal(s.left, "50%");
      assert.equal(s.width, "60%");
      assert.equal(s.height, "10%");
      assert.equal(s.zIndex, -1);
    });
  });

  describe("3. Exclusiones de objetos (folleto) y ajustes de decoraciones", () => {
    test("el folleto Cívico NO tiene sombra asignada (excluido a petición del usuario)", () => {
      assert.equal(
        DECORATION_SHADOWS.folleto,
        undefined,
        "el folleto no debe tener entrada en DECORATION_SHADOWS",
      );
    });

    test("los carteles (cartel1, cartel2, cartel3) sí tienen sombra asignada", () => {
      for (const key of ["cartel1", "cartel2", "cartel3"]) {
        assert.ok(DECORATION_SHADOWS[key], `falta sombra para ${key}`);
        assert.ok(SHADOW_PRESETS[DECORATION_SHADOWS[key].preset], `preset inválido ${key}`);
      }
    });

    test("el letrero VOTA ancla su sombra al pie real del poste (7.5% transparente en la base)", () => {
      const cfg = DECORATION_SHADOWS.cartel3;
      const options = resolveShadowOptions(cfg.preset, cfg.overrides);
      assert.equal(options.baseInsetPercent, 7.5);
      const style = getGroundShadowStyle(options);
      assert.equal(style.bottom, "7.5%");
      assert.equal(style.width, "72%");
    });

    test("resolveShadowOptions respeta el preset y aplica solo los ajustes indicados", () => {
      const o = resolveShadowOptions("tall", { opacity: 0.6, widthPercent: 95 });
      assert.equal(o.opacity, 0.6);
      assert.equal(o.widthPercent, 95);
      assert.equal(o.heightPercent, SHADOW_PRESETS.tall.heightPercent);
    });
  });
});
