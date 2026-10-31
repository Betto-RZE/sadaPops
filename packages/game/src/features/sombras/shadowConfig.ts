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
  /** Ancho de la sombra como porcentaje del ancho del contenedor del objeto (ej. 52 para personajes, 88 para mamparas) */
  widthPercent: number;
  /** Alto de la sombra como porcentaje del alto del contenedor del objeto */
  heightPercent: number;
  /** Posición horizontal del centro como % del ancho (por defecto 50) */
  centerPercent: number;
  /** Opacidad máxima en el centro (0-1) */
  opacity: number;
  /** Desenfoque suave en unidades cqw (relativo al ancho del escenario) */
  blurCqw: number;
  /**
   * Porcentaje transparente en la parte inferior de la imagen (ej. cartel 3 tiene ~7.2%).
   * Se usa para anclar la sombra a la base real del objeto y no al borde de la imagen.
   */
  baseInsetPercent: number;
  /** Desplazamiento vertical opcional en % respecto a la base del objeto */
  offsetYPercent?: number;
  /** Rotación opcional en grados para orientar la sombra según la perspectiva (ej. mesa: -32deg) */
  rotateDeg?: number;
  /** Radio de borde (por defecto 50% para elipse/cápsula) */
  borderRadius?: string;
}

export const SHADOW_PRESETS: Record<ShadowPreset, CastShadowOptions> = {
  /** Mamparas electorales (casillas): cubre el cuadrante entre las 4 patas en el suelo */
  tall: {
    widthPercent: 88,
    heightPercent: 16,
    centerPercent: 48,
    opacity: 0.44,
    blurCqw: 0.08,
    baseInsetPercent: 0,
    offsetYPercent: 3,
  },
  /** Mesa directiva: cubre el área completa bajo el cuerpo diagonal de la mesa en el suelo */
  mesa: {
    widthPercent: 74,
    heightPercent: 46,
    centerPercent: 48,
    opacity: 0.44,
    blurCqw: 0.09,
    baseInsetPercent: 0,
    offsetYPercent: 28,
    rotateDeg: -32,
  },
  /** Carteles informativos: base por defecto para soportes */
  sign: {
    widthPercent: 84,
    heightPercent: 16,
    centerPercent: 48,
    opacity: 0.40,
    blurCqw: 0.06,
    baseInsetPercent: 0,
    offsetYPercent: 4,
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
 * - cartel1: caballete frontal, abarca la apertura de patas frontal y trasera (ancho 86%).
 * - cartel2: caballete en perfil/perspectiva, abarca desde la pata delantera hasta la trasera (ancho 76%, rotación 12deg).
 * - cartel3 (letrero VOTA): poste de madera individual, sombra ajustada al grosor de su base (28%, compensación 7.2%).
 * - folleto: SIN SOMBRA (excluido intencionalmente a petición del usuario).
 */
export const DECORATION_SHADOWS: Record<
  string,
  { preset: ShadowPreset; overrides?: Partial<CastShadowOptions> }
> = {
  cartel1: {
    preset: "sign",
    overrides: {
      widthPercent: 86,
      heightPercent: 18,
      centerPercent: 48,
      offsetYPercent: 4,
      opacity: 0.40,
    },
  },
  cartel2: {
    preset: "sign",
    overrides: {
      widthPercent: 76,
      heightPercent: 20,
      centerPercent: 56,
      offsetYPercent: 6,
      rotateDeg: 12,
      opacity: 0.40,
    },
  },
  cartel3: {
    preset: "sign",
    overrides: {
      widthPercent: 28,
      heightPercent: 9,
      centerPercent: 52,
      baseInsetPercent: 7.2,
      offsetYPercent: 0,
      rotateDeg: 0,
      opacity: 0.45,
    },
  },
};

/**
 * Registro de sombras calibradas para cada uno de los objetos colocables por el jugador.
 * Excluye explícitamente folleto y boletas a petición del diseño.
 */
export const PLACED_OBJECT_SHADOWS: Record<
  "casilla" | "mesa" | "cartel1" | "cartel2" | "cartel3",
  CastShadowOptions
> = {
  casilla: resolveShadowOptions("tall"),
  mesa: resolveShadowOptions("mesa"),
  cartel1: resolveShadowOptions(
    DECORATION_SHADOWS.cartel1.preset,
    DECORATION_SHADOWS.cartel1.overrides,
  ),
  cartel2: resolveShadowOptions(
    DECORATION_SHADOWS.cartel2.preset,
    DECORATION_SHADOWS.cartel2.overrides,
  ),
  cartel3: resolveShadowOptions(
    DECORATION_SHADOWS.cartel3.preset,
    DECORATION_SHADOWS.cartel3.overrides,
  ),
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
  const rotate = options.rotateDeg ? ` rotate(${options.rotateDeg}deg)` : "";

  return {
    position: "absolute",
    left: `${center}%`,
    bottom: `${baseInset + offsetY}%`,
    width: `${options.widthPercent}%`,
    height: `${options.heightPercent}%`,
    transform: `translate(-50%, 50%)${rotate}`,
    borderRadius: options.borderRadius ?? "50%",
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
