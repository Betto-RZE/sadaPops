/**
 * computeLevels.ts — Cálculo puro de jerarquías discretas de dalia (0..4).
 *
 * Reglas acordadas (ROADMAP_MAPA_DALIAS.md y GEMINI.md):
 *   - Nivel 0: 0 usuarios/registros (sin flor).
 *   - Niveles 1, 2, 3 y 4 (brote, flor joven, flor abierta y plena floración):
 *     Se calculan mediante cuartiles sobre los estados con usuarios > 0.
 *     Esto garantiza que el mapa siempre muestre diversidad visual balanceada
 *     independientemente de si la muestra de usuarios es pequeña o masiva.
 */

export interface StateCountItem {
  id: string; // "01".."32"
  usuarios: number;
}

export type DahliaLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Calcula los niveles de dalia (0, 1, 2, 3, 4) para un conjunto de conteos por estado.
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

  // Casos pequeños para muestras iniciales:
  if (n === 1) {
    result.set(active[0].id, 2); // Un solo estado activo recibe nivel medio-bajo
    return result;
  }
  if (n === 2) {
    result.set(active[0].id, 1);
    result.set(active[1].id, 3);
    return result;
  }
  if (n === 3) {
    result.set(active[0].id, 1);
    result.set(active[1].id, 2);
    result.set(active[2].id, 4);
    return result;
  }

  // 2. Umbrales por cuartiles (Q1, Q2, Q3, Q4):
  // Cuartil 1: active[0 .. q1-1] -> Nivel 1 (Brote)
  // Cuartil 2: active[q1 .. q2-1] -> Nivel 2 (Flor Joven)
  // Cuartil 3: active[q2 .. q3-1] -> Nivel 3 (Flor Abierta)
  // Cuartil 4: active[q3 .. n-1]  -> Nivel 4 (Plena Floración)
  const q1 = Math.floor(n / 4);
  const q2 = Math.floor((2 * n) / 4);
  const q3 = Math.floor((3 * n) / 4);

  for (let i = 0; i < n; i++) {
    const id = active[i].id;
    if (i < q1) {
      result.set(id, 1);
    } else if (i < q2) {
      result.set(id, 2);
    } else if (i < q3) {
      result.set(id, 3);
    } else {
      result.set(id, 4);
    }
  }

  return result;
}

/**
 * Configuración de dimensiones y anclas relativas de los sprites de dalias
 * (`apps/web/public/flowers/dahlia-{1,2,3,4}.png`).
 *
 * El ancho del sprite en el mapa interactivo se calcula como porcentaje
 * respecto al ancho del espacio lógico del mapa (660px):
 * `(logicalWidth / 660) * 100%`
 */
export const DAHLIA_SPRITE_META: Record<1 | 2 | 3 | 4, {
  src: string;
  width: number;
  height: number;
  /** Ancho equivalente en el espacio lógico del mapa de 660x435 */
  logicalWidth: number;
  logicalHeight: number;
  /** Centro del ancla de apoyo respecto al sprite en porcentaje */
  anchorPercentX: number;
  anchorPercentY: number;
  /** Nombre descriptivo del nivel de floración */
  label: string;
}> = {
  1: {
    src: '/flowers/dahlia-1.png',
    width: 36,
    height: 42,
    logicalWidth: 13,
    logicalHeight: 15,
    anchorPercentX: 50.0,
    anchorPercentY: 57.0,
    label: 'Brote',
  },
  2: {
    src: '/flowers/dahlia-1.png',
    width: 36,
    height: 42,
    logicalWidth: 19,
    logicalHeight: 22,
    anchorPercentX: 50.0,
    anchorPercentY: 57.0,
    label: 'Flor joven',
  },
  3: {
    src: '/flowers/dahlia-2.png',
    width: 54,
    height: 57,
    logicalWidth: 26,
    logicalHeight: 27.5,
    anchorPercentX: 50.0,
    anchorPercentY: 58.0,
    label: 'Flor abierta',
  },
  4: {
    src: '/flowers/dahlia-4.png',
    width: 76,
    height: 76,
    logicalWidth: 33,
    logicalHeight: 33,
    anchorPercentX: 50.0,
    anchorPercentY: 58.0,
    label: 'Plena floración',
  },
};

/**
 * Claves de estados con superficie reducida o aglomeración en zona centro
 * (CDMX, Morelos, Tlaxcala, Colima, Aguascalientes).
 */
export const DENSE_STATE_IDS = new Set<string>([
  '01', // Aguascalientes
  '06', // Colima
  '09', // Ciudad de México
  '17', // Morelos
  '29', // Tlaxcala
]);

/**
 * Multiplicador de escala para estados con superficie compacta o alta densidad de vecinos.
 * Reduce el tamaño visual un 20% para evitar solapamientos entre estados vecinos.
 */
export function getStateScaleFactor(stateId: string): number {
  return DENSE_STATE_IDS.has(stateId) ? 0.80 : 1.0;
}
