import React from "react";
import {
  type CastShadowOptions,
  type ShadowPreset,
  getGroundShadowStyle,
  resolveShadowOptions,
} from "./shadowConfig";

export interface CastShadowProps {
  /** Misma imagen (o frame actual) del sprite (mantenido por compatibilidad) */
  src?: string;
  /** Familia de sombra según el tipo de figura */
  preset: ShadowPreset;
  /** Ajustes específicos para un objeto concreto (ej. baseInsetPercent del cartel 3) */
  overrides?: Partial<CastShadowOptions>;
  /** true si el sprite está espejado horizontalmente (mantenido por compatibilidad) */
  flipX?: boolean;
}

/**
 * Sombra en el suelo (ground footprint shadow) que abarca el área del objeto justo debajo de su base.
 *
 * Debe renderizarse como hijo directo de un contenedor con `position: relative/absolute`
 * del mismo tamaño que el sprite. Usa z-index -1 para quedar detrás de la imagen dentro del
 * contexto de apilamiento del contenedor (que ya define el z-index de profundidad del objeto),
 * por lo que respeta automáticamente el orden Z entre personajes, mamparas y mesa.
 */
export const CastShadow = React.memo(function CastShadow({
  preset,
  overrides,
}: CastShadowProps) {
  const options = resolveShadowOptions(preset, overrides);

  return (
    <div
      aria-hidden="true"
      data-testid="ground-shadow"
      style={getGroundShadowStyle(options)}
    />
  );
});

export const GroundShadow = CastShadow;

