/**
 * Configuración y cálculo puro del sistema de sombras en el suelo (ground footprint shadows).
 *
 * En lugar de proyecciones diagonales de siluetas, cada objeto y personaje
 * cuenta con una sombra suave en el suelo (elipse/cápsula) situada justo debajo de su base
 * que abarca el área del objeto en el suelo, aportando anclaje y profundidad visual natural.
 *
 * Nota: El folleto y las boletas electorales NO llevan sombra (eliminadas a petición de diseño).
 *
 * Este módulo no tiene dependencias de React (solo tipos) para poder probarse con node:test.
 */
import type { CSSProperties } from "react";

/** Familias de sombra calibradas según el tipo de figura. */
export type ShadowPreset = "tall" | "sign" | "small" | "character" | "mesa";

export interface CastShadowOptions {
  /** Ancho de la sombra como porcentaje del ancho del contenedor del objeto (ej. 60 para personajes, 88 para mamparas/mesas) */
  widthPercent: number;
  /** Alto de la sombra como porcentaje del alto del contenedor del objeto (ej. 10 a 16) */
  heightPercent: number;
  /** Posición horizontal del centro como % del ancho (por defecto 50) */
  centerPercent: number;
  /** Opacidad máxima en el centro (0-1) */
  opacity: number;
  /** Desenfoque suave en unidades cqw (relativo al ancho del escenario) */
  blurCqw: number;
  /**
   * Porcentaje transparente en la parte inferior de la imagen (ej. cartel 3 tiene ~7.5%).
   * Se usa para anclar la sombra a la base real del objeto y no al borde de la imagen.
   */
  baseInsetPercent: number;
  /** Desplazamiento vertical opcional en % respecto a la base del objeto */
  offsetYPercent?: number;
}

export const SHADOW_PRESETS: Record<ShadowPreset, CastShadowOptions> = {
  /** Mamparas electorales (casillas): cubre la base entre las 4 patas en el suelo */
  tall: {
    widthPercent: 82,
    heightPercent: 12,
    centerPercent: 46,
    opacity: 0.42,
    blurCqw: 0.07,
    baseInsetPercent: 0,
  },
  /** Mesa directiva: cubre el área bajo las patas de la mesa en el suelo */
  mesa: {
    widthPercent: 70,
    heightPercent: 14,
    centerPercent: 42,
    opacity: 0.42,
    blurCqw: 0.08,
    baseInsetPercent: 0,
  },
  /** Carteles informativos y letrero VOTA: postes en el suelo */
  sign: {
    widthPercent: 46,
    heightPercent: 10,
    centerPercent: 50,
    opacity: 0.38,
    blurCqw: 0.06,
    baseInsetPercent: 0,
  },
  /** Objetos pequeños (si aplica en el futuro; folleto y boletas excluidos) */
  small: {
    widthPercent: 36,
    heightPercent: 10,
    centerPercent: 50,
    opacity: 0.32,
    blurCqw: 0.04,
    baseInsetPercent: 0,
  },
  /** Protagonista y NPCs: sombra ovalada justo debajo de los pies */
  character: {
    widthPercent: 52,
    heightPercent: 9,
    centerPercent: 50,
    opacity: 0.48,
    blurCqw: 0.05,
    baseInsetPercent: 0,
  },
};

/**
 * Sombra asignada a cada decoración colocada en el Capítulo 1 (clave = DECORACIONES_LIST[].key).
 * - cartel1/cartel2: paneles informativos sobre poste.
 * - cartel3 (letrero VOTA): su PNG tiene ~7.5% transparente en la base, se compensa para que la
 *   sombra nazca en el pie real del poste y no flote.
 * - folleto: SIN SOMBRA (excluido intencionalmente a petición del usuario).
 */
export const DECORATION_SHADOWS: Record<
  string,
  { preset: ShadowPreset; overrides?: Partial<CastShadowOptions> }
> = {
  cartel1: { preset: "sign" },
  cartel2: { preset: "sign" },
  cartel3: {
    preset: "sign",
    overrides: {
      widthPercent: 72,
      heightPercent: 13,
      baseInsetPercent: 7.5,
    },
  },
};

/** Combina un preset con ajustes específicos de un objeto concreto. */
export function resolveShadowOptions(
  preset: ShadowPreset,
  overrides: Partial<CastShadowOptions> = {},
): CastShadowOptions {
  const base = SHADOW_PRESETS[preset] || SHADOW_PRESETS.tall;
  return {
    ...base,
    ...overrides,
  };
}

/**
 * Estilo CSS para la sombra en el suelo situada directamente debajo del objeto.
 * Se sitúa en la base del sprite (contacto con el suelo) con zIndex: -1 para quedar por debajo.
 */
export function getGroundShadowStyle(
  options: CastShadowOptions,
): CSSProperties {
  const center = options.centerPercent ?? 50;
  const baseInset = options.baseInsetPercent ?? 0;
  const offsetY = options.offsetYPercent ?? 0;
  const opacity = options.opacity ?? 0.45;
  const blur = options.blurCqw ? `blur(${options.blurCqw}cqw)` : undefined;

  return {
    position: "absolute",
    left: `${center}%`,
    bottom: `${baseInset + offsetY}%`,
    width: `${options.widthPercent}%`,
    height: `${options.heightPercent}%`,
    transform: "translate(-50%, 50%)",
    borderRadius: "50%",
    zIndex: -1,
    pointerEvents: "none",
    userSelect: "none",
    filter: blur,
    background: `radial-gradient(ellipse at center, rgba(0, 0, 0, ${opacity}) 0%, rgba(0, 0, 0, ${opacity * 0.55}) 55%, rgba(0, 0, 0, 0) 100%)`,
  };
}

/**
 * Helper de compatibilidad para estilos de contacto.
 */
export function getContactShadowStyle(
  contact: { widthPercent: number; heightPercent: number; centerPercent?: number; opacity?: number },
  baseInsetPercent = 0,
): CSSProperties {
  return getGroundShadowStyle({
    widthPercent: contact.widthPercent,
    heightPercent: contact.heightPercent,
    centerPercent: contact.centerPercent ?? 50,
    opacity: contact.opacity ?? 0.48,
    blurCqw: 0.06,
    baseInsetPercent,
  });
}
