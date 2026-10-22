/**
 * computeLevels.ts — Cálculo puro de jerarquías discretas de dalia (0..3).
 *
 * Reglas acordadas (ROADMAP_MAPA_DALIAS.md y GEMINI.md):
 *   - Nivel 0: 0 usuarios/registros (sin flor).
 *   - Niveles 1, 2 y 3 (flor chica, mediana y grande):
 *     Se calculan mediante terciles sobre los estados con usuarios > 0.
 *     Esto garantiza que el mapa siempre muestre diversidad visual balanceada
 *     independientemente de si la muestra de usuarios es pequeña o masiva.
 */

export interface StateCountItem {
  id: string; // "01".."32"
  usuarios: number;
}

export type DahliaLevel = 0 | 1 | 2 | 3;

/**
 * Calcula los niveles de dalia (0, 1, 2, 3) para un conjunto de conteos por estado.
 * Devuelve un Map<string, DahliaLevel> indexado por la clave de entidad ("01".."32").
 */
export function computeLevels(items: StateCountItem[]): Map<string, DahliaLevel> {
  const result = new Map<string, DahliaLevel>();

  // 1. Filtrar estados activos con al menos 1 usuario
  const active = items
    .filter((item) => item.usuarios > 0)
    .sort((a, b) => a.usuarios - b.usuarios);

  // Inicializar todos los estados con 0
  for (const item of items) {
    result.set(item.id, 0);
  }

  const n = active.length;
  if (n === 0) return result;

  // Casos pequeños:
  if (n === 1) {
    result.set(active[0].id, 2); // Un solo estado activo recibe nivel medio
    return result;
  }
  if (n === 2) {
    result.set(active[0].id, 1);
    result.set(active[1].id, 3);
    return result;
  }

  // 2. Umbrales por terciles:
  // Tercil 1: active[0 .. t1-1] -> Nivel 1
  // Tercil 2: active[t1 .. t2-1] -> Nivel 2
  // Tercil 3: active[t2 .. n-1]  -> Nivel 3
  const t1 = Math.floor(n / 3);
  const t2 = Math.floor((2 * n) / 3);

  for (let i = 0; i < n; i++) {
    const id = active[i].id;
    if (i < t1) {
      result.set(id, 1);
    } else if (i < t2) {
      result.set(id, 2);
    } else {
      result.set(id, 3);
    }
  }

  return result;
}

/**
 * Configuración de dimensiones y anclas relativas de los 3 sprites de dalias
 * (`apps/web/public/flowers/dahlia-{1,2,3}.png`).
 *
 * El ancho del sprite en el mapa interactivo se calcula como:
 * `(logicalMapWidth / 660) * 100%`
 */
export const DAHLIA_SPRITE_META: Record<1 | 2 | 3, {
  src: string;
  width: number;
  height: number;
  /** Ancho equivalente en el espacio lógico del mapa de 660x435 */
  logicalWidth: number;
  logicalHeight: number;
  /** Centro del ancla de apoyo respecto al sprite en porcentaje */
  anchorPercentX: number;
  anchorPercentY: number;
}> = {
  1: {
    src: '/flowers/dahlia-1.png',
    width: 36,
    height: 42,
    logicalWidth: 18,
    logicalHeight: 21,
    anchorPercentX: 50.0,
    anchorPercentY: 57.0,
  },
  2: {
    src: '/flowers/dahlia-2.png',
    width: 54,
    height: 57,
    logicalWidth: 27,
    logicalHeight: 28.5,
    anchorPercentX: 50.0,
    anchorPercentY: 58.0,
  },
  3: {
    src: '/flowers/dahlia-3.png',
    width: 76,
    height: 76,
    logicalWidth: 38,
    logicalHeight: 38,
    anchorPercentX: 50.0,
    anchorPercentY: 58.0,
  },
};
