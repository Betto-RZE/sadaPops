export interface Point2D {
  x: number;
  y: number;
}

export interface ObstacleBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Deslizamiento suave sobre la mesa de funcionarios.
 * Convierte el empuje perpendicular o diagonal contra los bordes de la mesa
 * en deslizamiento suave y continuo idéntico al de los límites de la explanada,
 * eliminando vibraciones, rebotes y detenciones abruptas.
 */
export const applyMesaSlidingDeltas = (
  prev: Point2D,
  dx: number,
  dy: number,
): { dx: number; dy: number } => {
  let effectiveDx = dx;
  let effectiveDy = dy;

  // Lado derecho de la mesa (zona más transitada desde la explanada central)
  // X: ~22.2 - 25.4, Y: 56.4 - 75.5
  if (prev.y >= 55.5 && prev.y <= 76.5) {
    const t = Math.max(0, Math.min(1, (prev.y - 56.4) / (75.5 - 56.4)));
    const edgeRightX = 25.4 + t * (22.2 - 25.4); // Varía de 25.4 a 22.2

    // Si el jugador está al lado derecho y camina hacia la mesa (dx < 0)
    if (prev.x >= edgeRightX - 0.2 && prev.x <= edgeRightX + 1.2 && dx < 0) {
      if (dy === 0) {
        // Al caminar de frente hacia la mesa, desliza suavemente hacia el extremo más cercano
        effectiveDy += (prev.y >= 66.0 ? 1 : -1) * Math.abs(dx) * 0.75;
      }
    }

    // Lado izquierdo de la mesa (pasillo angosto junto al límite izquierdo)
    const edgeLeftX = 16.8 + t * (12.4 - 16.8); // Varía de 16.8 a 12.4
    if (prev.x <= edgeLeftX + 0.2 && prev.x >= edgeLeftX - 1.2 && dx > 0) {
      if (dy === 0) {
        effectiveDy += (prev.y >= 66.0 ? 1 : -1) * dx * 0.75;
      }
    }
  }

  // Borde superior de la mesa (Y: ~56.0, X: 16.8 - 25.4)
  if (
    prev.x >= 15.5 &&
    prev.x <= 26.5 &&
    prev.y <= 56.5 &&
    prev.y >= 54.8 &&
    dy > 0
  ) {
    if (dx === 0) {
      // Desliza suavemente hacia la derecha (hacia la explanada abierta)
      effectiveDx += dy * 0.75;
    }
  }

  // Borde inferior de la mesa (Y: ~76.0, X: 12.4 - 22.2)
  if (
    prev.x >= 11.5 &&
    prev.x <= 23.5 &&
    prev.y >= 75.5 &&
    prev.y <= 77.5 &&
    dy < 0
  ) {
    if (dx === 0) {
      // Desliza suavemente hacia la derecha (hacia la explanada abierta)
      effectiveDx += Math.abs(dy) * 0.75;
    }
  }

  return { dx: effectiveDx, dy: effectiveDy };
};

/**
 * Deslizamiento tangencial en polígonos (caja y mesa).
 * Proyecta la velocidad sobre la tangente del borde más cercano sin aplicar
 * impulsos artificiales (+nx * 0.1) que provocaban oscilaciones y rebotes.
 */
export const tryPolygonWallSlide = (
  currentPos: Point2D,
  dx: number,
  dy: number,
  polygon: Point2D[],
  isWalkable: (x: number, y: number) => boolean,
): Point2D | null => {
  if (!polygon || polygon.length < 3) return null;

  const targetX = currentPos.x + dx;
  const targetY = currentPos.y + dy;
  const moveMag = Math.hypot(dx, dy);
  if (moveMag < 0.0001) return null;

  const cx = polygon.reduce((acc, p) => acc + p.x, 0) / polygon.length;
  const cy = polygon.reduce((acc, p) => acc + p.y, 0) / polygon.length;

  let closestEdge: { a: Point2D; b: Point2D; distSq: number } | null = null;

  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];

    const len2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
    if (len2 === 0) continue;

    let t =
      ((targetX - a.x) * (b.x - a.x) + (targetY - a.y) * (b.y - a.y)) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + t * (b.x - a.x);
    const py = a.y + t * (b.y - a.y);
    const distSq = (targetX - px) ** 2 + (targetY - py) ** 2;

    if (!closestEdge || distSq < closestEdge.distSq) {
      closestEdge = { a, b, distSq };
    }
  }

  // Margen de detección amplio para evitar discontinuidades al acercarse
  if (!closestEdge || closestEdge.distSq > 4.0) {
    return null;
  }

  const { a, b } = closestEdge;
  const edx = b.x - a.x;
  const edy = b.y - a.y;
  const edgeLen = Math.hypot(edx, edy);
  if (edgeLen === 0) return null;

  const tx = edx / edgeLen;
  const ty = edy / edgeLen;

  let nx = -ty;
  let ny = tx;
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  if (
    Math.hypot(midX + nx - cx, midY + ny - cy) <
    Math.hypot(midX - nx - cx, midY - ny - cy)
  ) {
    nx = -nx;
    ny = -ny;
  }

  const dot = dx * tx + dy * ty;

  // Si hay movimiento tangencial intencional, se respeta fielmente
  let slideSpeed = dot;
  if (Math.abs(dot) < 0.02) {
    // Si camina de frente perpendicular contra el obstáculo, desliza hacia la esquina más próxima
    const distA = Math.hypot(currentPos.x - a.x, currentPos.y - a.y);
    const distB = Math.hypot(currentPos.x - b.x, currentPos.y - b.y);
    const naturalDir = distA < distB ? -1 : 1;
    slideSpeed = moveMag * 0.75 * naturalDir;
  }

  const stepX = tx * slideSpeed;
  const stepY = ty * slideSpeed;

  // Candidatos sin rebote: se elimina el empuje artificial (+nx * 0.1) que provocaba oscilaciones
  const candidates = [
    // 1. Deslizamiento continuo tangencial puro
    { x: currentPos.x + stepX, y: currentPos.y + stepY },
    // 2. Micro-separación de precisión flotante (0.015%) para evitar penetración numérica
    {
      x: currentPos.x + stepX + nx * 0.015,
      y: currentPos.y + stepY + ny * 0.015,
    },
    // 3. Fracción de paso suave
    { x: currentPos.x + stepX * 0.5, y: currentPos.y + stepY * 0.5 },
    // 4. Deslizamiento en un solo eje si la tangente estuviera parcialmente obstruida
    { x: currentPos.x + (Math.abs(dx) > 0 ? dx : 0), y: currentPos.y },
    { x: currentPos.x, y: currentPos.y + (Math.abs(dy) > 0 ? dy : 0) },
  ];

  for (const cand of candidates) {
    if (isWalkable(cand.x, cand.y)) {
      return cand;
    }
  }

  return null;
};
