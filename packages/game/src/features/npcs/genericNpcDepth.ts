/**
 * Voces en casilla — Sistema de Profundidad Visual y Orden de Renderizado (Fase 5.3)
 *
 * Administra el ordenamiento coherente de capas (z-index) entre:
 * 1. Protagonista (jugador)
 * 2. NPCs genéricos (votantes ambientales)
 * 3. Personajes narrativos
 * 4. Mamparas electorales, boletas, mesa directiva y elementos del escenario
 *
 * Reglas de diseño y jerarquía:
 * - Un personaje con coordenada Y mayor (pies más abajo en pantalla) se renderiza delante.
 * - Un personaje con coordenada Y menor se renderiza detrás.
 * - Personajes con Y idéntica o equivalente emplean un criterio determinista y estable por ID.
 * - Personajes detrás de las mamparas (Y < 36.0%) se renderizan detrás de estas (< 18).
 * - Personajes delante de las mamparas (Y >= 36.0%) se renderizan delante de estas (> 21).
 * - Todos los personajes se renderizan detrás de los arbustos en primer plano (< 30)
 *   y del cartel 3 / letrero VOTA (< 35).
 */

export interface DepthEntity {
  id: string;
  y: number;
}

/**
 * Constantes de calibración de capas de profundidad (Z-Index).
 * Respeta rigurosamente los rangos y contextos de apilamiento existentes en el escenario.
 */
export const NPC_DEPTH_LAYERS = {
  /** Capa mínima para personajes ubicados detrás de las mamparas */
  behindMamparasMin: 11,
  /** Capa máxima para personajes detrás de las mamparas (estrictamente < 18) */
  behindMamparasMax: 17,
  /** Capa física fija de las 5 mamparas electorales */
  mamparaLayer: 18,
  /** Capa física de las boletas electorales colocadas sobre las mamparas */
  boletaLayer: 21,
  /** Capa mínima para personajes situados en la explanada frente a las mamparas */
  frontMin: 22,
  /** Capa máxima para personajes en la explanada (estrictamente < 28 para respetar mesa frontal y < 30) */
  frontMax: 27,
  /** Capa fija de la mesa directiva cuando oculta a un personaje situado detrás */
  mesaBehindLayer: 28,
  /** Capa fija de los arbustos decorativos en primer plano */
  arbustosForeground: 30,
  /** Capa fija del cartel 3 / letrero VOTA */
  cartel3Foreground: 35,
  /** Coordenada Y de la base de las mamparas electorales (% del escenario) */
  mamparaBaseY: 36.0,
} as const;

/**
 * Comparador determinista y estable para ordenar entidades por profundidad vertical.
 * Si las coordenadas Y difieren significativamente (> 0.001), se ordena por Y ascendente.
 * Si las coordenadas son equivalentes, se desempata deterministamente por ID para evitar parpadeos.
 */
export function compareDepthEntities(a: DepthEntity, b: DepthEntity): number {
  if (Math.abs(a.y - b.y) > 0.001) {
    return a.y - b.y;
  }
  return a.id.localeCompare(b.id);
}

/**
 * Calcula el z-index individual para un personaje según la coordenada vertical de sus pies.
 * Función pura útil para cálculos independientes o valores por defecto.
 */
export function calculateCharacterZIndex(
  y: number,
  tieBreakerId?: string | number,
): number {
  if (y < NPC_DEPTH_LAYERS.mamparaBaseY) {
    // Personaje detrás de las mamparas: rango [11, 17]
    const span =
      NPC_DEPTH_LAYERS.behindMamparasMax - NPC_DEPTH_LAYERS.behindMamparasMin;
    const progress = Math.max(0, Math.min(1, (y - 30.0) / 6.0));
    return Math.min(
      NPC_DEPTH_LAYERS.behindMamparasMax,
      Math.max(
        NPC_DEPTH_LAYERS.behindMamparasMin,
        NPC_DEPTH_LAYERS.behindMamparasMin + Math.floor(progress * span),
      ),
    );
  }

  // Personaje en la explanada: rango [22, 27]
  const span = NPC_DEPTH_LAYERS.frontMax - NPC_DEPTH_LAYERS.frontMin;
  const progress = Math.max(
    0,
    Math.min(1, (y - NPC_DEPTH_LAYERS.mamparaBaseY) / (106.0 - NPC_DEPTH_LAYERS.mamparaBaseY)),
  );
  return Math.min(
    NPC_DEPTH_LAYERS.frontMax,
    Math.max(
      NPC_DEPTH_LAYERS.frontMin,
      NPC_DEPTH_LAYERS.frontMin + Math.floor(progress * span),
    ),
  );
}
let lastCharactersInput: DepthEntity[] | null = null;
let lastDepthResult: Record<string, number> = {};

/**
 * Comprueba de forma eficiente si dos colecciones de entidades de profundidad son equivalentes
 * para evitar recalcular ordenamientos y reasignaciones cuando las coordenadas no han variado.
 */
export function areDepthEntitiesEqual(
  a: DepthEntity[] | null | undefined,
  b: DepthEntity[] | null | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || Math.abs(a[i].y - b[i].y) > 0.001) {
      return false;
    }
  }
  return true;
}

/**
 * Limpia la cache interna de profundidad (útil al reiniciar capítulos o en suites de pruebas).
 */
export function clearDepthCache(): void {
  lastCharactersInput = null;
  lastDepthResult = {};
}

/**
 * Calcula un mapa de z-index relativo y continuo para todos los personajes activos en escena.
 * Garantiza de forma estricta que:
 * - Para dos personajes cualesquiera A y B: si Y_A > Y_B, entonces zIndex_A > zIndex_B.
 * - Si comparten coordenada Y, el desempate por ID es determinista y no oscila.
 * - Los personajes detrás de las mamparas tienen zIndex < 18.
 * - Los personajes frente a las mamparas tienen zIndex >= 22 y <= 27.
 * - Todo personaje permanece detrás de arbustos (30) y cartel 3 (35).
 * - Cuenta con memoización interna para retornar el mapa en O(N) sin reasignaciones cuando
 *   las coordenadas no han cambiado.
 */
export function calculateSceneCharactersDepth(
  characters: DepthEntity[],
): Record<string, number> {
  if (!characters || characters.length === 0) {
    lastCharactersInput = [];
    lastDepthResult = {};
    return {};
  }

  // Verificación rápida de cache: si las posiciones no cambiaron, reutilizar resultado
  if (lastCharactersInput && areDepthEntitiesEqual(characters, lastCharactersInput)) {
    return lastDepthResult;
  }

  const result: Record<string, number> = {};
  const behind: DepthEntity[] = [];
  const inFront: DepthEntity[] = [];

  for (const char of characters) {
    if (char.y < NPC_DEPTH_LAYERS.mamparaBaseY) {
      behind.push(char);
    } else {
      inFront.push(char);
    }
  }

  behind.sort(compareDepthEntities);
  inFront.sort(compareDepthEntities);

  behind.forEach((char, index) => {
    result[char.id] = Math.min(
      NPC_DEPTH_LAYERS.behindMamparasMax,
      NPC_DEPTH_LAYERS.behindMamparasMin + index,
    );
  });

  inFront.forEach((char, index) => {
    result[char.id] = Math.min(
      NPC_DEPTH_LAYERS.frontMax,
      NPC_DEPTH_LAYERS.frontMin + index,
    );
  });

  lastCharactersInput = characters.map((c) => ({ id: c.id, y: c.y }));
  lastDepthResult = result;

  return result;
}
