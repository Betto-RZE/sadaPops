/**
 * scripts/build-map.ts — Horneado offline del mapa isométrico voxel (Hito H2).
 *
 * Insumos:  data/raw/mexico-estados.geojson + data/state-keys.json + config/iso.ts
 * Salidas:  apps/web/public/data/{map-base.png, map-ids.bin, states.json, map-shadow.webp}
 *
 * Todo se rasteriza en PANTALLA (rejilla voxel lógica), no en el espacio geográfico:
 * así los escalones pixelart salen de forma natural y el hit-test en runtime es una
 * consulta directa a map-ids.bin (0 = vacío/isla, 1..32 = cara superior, 33..64 = pared).
 *
 * Uso: pnpm build-map
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import sharp from 'sharp';
import { geoConicConformal } from 'd3-geo';
import polylabel from 'polylabel';
import { ISO_MAP_CONFIG as CFG } from '../config/iso';

// ───────────────────────────── Tipos y constantes ─────────────────────────────

type Pt = [number, number];
type Ring = Pt[];
/** [anillo exterior, ...huecos] */
type Poly = Ring[];
type RGB = [number, number, number];

interface StateGeo {
  numId: number; // 1..32
  code: string; // "01".."32"
  nombre: string;
  polys: Poly[];
  area: number;
  largest: Poly;
}

const ROOT = path.resolve(__dirname, '..');
const GEOJSON_PATH = path.join(ROOT, 'data/raw/mexico-estados.geojson');
const KEYS_PATH = path.join(ROOT, 'data/state-keys.json');
const OUT_DIR = path.join(ROOT, 'apps/web/public/data');

const W = CFG.gridWidth;
const H = CFG.gridHeight;
const S = CFG.pixelScale;
const OW = W * S;
const OH = H * S;
const EXT = CFG.extrusion.heightInVoxels;
const ISLAND = 255; // marcador de celda de isla decorativa en topGrid
const LW = Math.max(1, Math.min(S, CFG.lineWidthPx));

// ───────────────────────────── Utilidades ─────────────────────────────

const hex = (h: string): RGB => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: RGB, b: RGB, t: number): RGB =>
  [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as RGB;

const ringArea = (r: Ring): number => {
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
  return Math.abs(a / 2);
};
const polyArea = (p: Poly): number => ringArea(p[0]) - p.slice(1).reduce((s, h) => s + ringArea(h), 0);

const idx = (x: number, y: number) => y * W + x;
const inGrid = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H;
const isState = (v: number) => v >= 1 && v <= 32;

// ───────────────────────────── 1. Lectura ─────────────────────────────

function loadStates(): StateGeo[] {
  const geo = JSON.parse(fs.readFileSync(GEOJSON_PATH, 'utf8'));
  const keys = JSON.parse(fs.readFileSync(KEYS_PATH, 'utf8'));

  const states: StateGeo[] = [];
  for (const f of geo.features) {
    const p = f.properties ?? {};
    let code: string | undefined = p.CVE_ENT;
    if (!code && p.NOM_ENT) code = keys.byName[p.NOM_ENT];
    if (!code || !keys.byCode[code]) throw new Error(`Feature sin clave válida: ${JSON.stringify(p)}`);

    const g = f.geometry;
    const raw: number[][][][] = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    states.push({
      numId: parseInt(code, 10),
      code,
      nombre: keys.byCode[code].nombre,
      polys: raw.map((poly) => poly.map((ring) => ring.map((c) => [c[0], c[1]] as Pt))),
      area: 0,
      largest: [],
    });
  }

  const codes = new Set(states.map((s) => s.code));
  if (states.length !== 32 || codes.size !== 32) {
    throw new Error(`Se esperaban 32 estados únicos; hay ${states.length} (${codes.size} claves únicas).`);
  }
  return states;
}

// ───────────────────────────── 2. Proyección + vista isométrica ─────────────────────────────

function projectStates(states: StateGeo[]) {
  const proj = geoConicConformal()
    .parallels(CFG.geo.parallels)
    .rotate([CFG.geo.rotateLon, 0])
    .center([0, CFG.geo.centerLat])
    .scale(1000)
    .translate([0, 0]);

  const th = (CFG.transform.rotationDeg * Math.PI) / 180;
  const c = Math.cos(th);
  const s = Math.sin(th);
  const view = (ll: Pt): Pt => {
    const p = proj(ll)!;
    let x = p[0] * c - p[1] * s;
    let y = p[0] * s + p[1] * c;
    x += CFG.transform.shearX * y;
    y *= CFG.transform.scaleY;
    return [x, y];
  };

  for (const st of states) {
    st.polys = st.polys.map((poly) => poly.map((ring) => ring.map(view)));
  }

  // Encaje: bbox de los polígonos PRINCIPALES de cada estado (las islas remotas no deforman el encuadre)
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const st of states) {
    const main = st.polys.reduce((a, b) => (ringArea(b[0]) > ringArea(a[0]) ? b : a));
    for (const [x, y] of main[0]) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  const availW = W - 2 * CFG.padding;
  const availH = H - 2 * CFG.padding - EXT;
  const k = Math.min(availW / (maxX - minX), availH / (maxY - minY));
  const ox = CFG.padding + (availW - (maxX - minX) * k) / 2;
  const oy = CFG.padding + (availH - (maxY - minY) * k) / 2;
  const toGrid = (p: Pt): Pt => [(p[0] - minX) * k + ox, (p[1] - minY) * k + oy];

  for (const st of states) {
    let polys = st.polys.map((poly) => poly.map((ring) => ring.map(toGrid)));
    polys.sort((a, b) => ringArea(b[0]) - ringArea(a[0]));
    const [main, ...rest] = polys;
    polys = [main, ...rest.filter((p) => ringArea(p[0]) >= CFG.geometry.minIslandAreaVoxels)];
    // Descarta huecos-artefacto de la simplificación
    polys = polys.map(([outer, ...holes]) => [outer, ...holes.filter((h) => ringArea(h) >= CFG.geometry.minHoleAreaVoxels)]);
    st.polys = polys;
    st.largest = polys[0];
    st.area = polys.reduce((sum, p) => sum + polyArea(p), 0);
  }

  // Función para proyectar puntos sueltos (islas decorativas)
  return (ll: Pt): Pt => toGrid(view(ll));
}

// ───────────────────────────── 3. Rasterizado de la cara superior ─────────────────────────────

function fillPoly(rings: Ring[], id: number, grid: Uint8Array) {
  let minY = Infinity, maxY = -Infinity;
  for (const r of rings) for (const [, y] of r) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const y0 = Math.max(0, Math.floor(minY));
  const y1 = Math.min(H - 1, Math.ceil(maxY));
  for (let y = y0; y <= y1; y++) {
    const yc = y + 0.5;
    const xs: number[] = [];
    for (const r of rings) {
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
        const [xi, yi] = r[i];
        const [xj, yj] = r[j];
        if (yi > yc !== yj > yc) xs.push(xi + ((yc - yi) * (xj - xi)) / (yj - yi));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.max(0, Math.ceil(xs[k] - 0.5));
      const xb = Math.min(W - 1, Math.floor(xs[k + 1] - 0.5));
      for (let x = xa; x <= xb; x++) grid[idx(x, y)] = id;
    }
  }
}

const N4: Pt[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** Rellena rendijas de 1 celda entre estados (bordes compartidos imperfectos tras simplificar). */
function fillGaps(top: Uint8Array, passes = 2) {
  for (let p = 0; p < passes; p++) {
    const changes: [number, number][] = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (top[idx(x, y)] !== 0) continue;
      const counts = new Map<number, number>();
      let land = 0;
      for (const [dx, dy] of N4) {
        const nx = x + dx, ny = y + dy;
        if (!inGrid(nx, ny)) continue;
        const v = top[idx(nx, ny)];
        if (isState(v)) {
          land++;
          counts.set(v, (counts.get(v) ?? 0) + 1);
        }
      }
      if (land >= 3) {
        const best = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
        changes.push([idx(x, y), best]);
      }
    }
    for (const [i, v] of changes) top[i] = v;
  }
}

/** Elimina componentes de tierra diminutos (ruido de píxeles aislados). */
function removeTinyComponents(top: Uint8Array): number {
  const seen = new Uint8Array(W * H);
  let removed = 0;
  for (let i = 0; i < W * H; i++) {
    if (!isState(top[i]) || seen[i]) continue;
    const comp: number[] = [i];
    seen[i] = 1;
    for (let q = 0; q < comp.length; q++) {
      const x = comp[q] % W, y = (comp[q] / W) | 0;
      for (const [dx, dy] of N4) {
        const nx = x + dx, ny = y + dy;
        if (!inGrid(nx, ny)) continue;
        const j = idx(nx, ny);
        if (!seen[j] && isState(top[j])) {
          seen[j] = 1;
          comp.push(j);
        }
      }
    }
    if (comp.length < CFG.geometry.minComponentCells) {
      for (const j of comp) top[j] = 0;
      removed++;
    }
  }
  return removed;
}

const polylabelCell = (poly: Poly): Pt => {
  const p = polylabel(poly, 0.25);
  return [Math.floor(p[0]), Math.floor(p[1])];
};

/** Garantiza un mínimo de celdas a estados pequeños (CDMX, Tlaxcala, Morelos...). */
function guaranteeSmallStates(top: Uint8Array, states: StateGeo[]): string[] {
  const counts = new Array(33).fill(0);
  for (let i = 0; i < W * H; i++) if (isState(top[i])) counts[top[i]]++;
  const protectedIds = new Set<number>();
  const rescued: string[] = [];

  for (const st of [...states].sort((a, b) => a.area - b.area)) {
    if (counts[st.numId] >= CFG.geometry.minStateCells) continue;
    const [cx, cy] = polylabelCell(st.largest);
    const queue: Pt[] = [[cx, cy]];
    const visited = new Set<number>([idx(cx, cy)]);
    while (queue.length && counts[st.numId] < CFG.geometry.minStateCells) {
      const [x, y] = queue.shift()!;
      if (!inGrid(x, y)) continue;
      const i = idx(x, y);
      const v = top[i];
      if (v !== st.numId && !protectedIds.has(v) && isState(v)) {
        counts[v]--;
        top[i] = st.numId;
        counts[st.numId]++;
      }
      for (const [dx, dy] of N4) {
        const j = idx(x + dx, y + dy);
        if (inGrid(x + dx, y + dy) && !visited.has(j)) {
          visited.add(j);
          queue.push([x + dx, y + dy]);
        }
      }
    }
    protectedIds.add(st.numId);
    rescued.push(`${st.code} ${st.nombre} → ${counts[st.numId]} celdas`);
  }
  return rescued;
}

// ───────────────────────────── 4. Islas decorativas ─────────────────────────────

function stampIslands(top: Uint8Array, project: (ll: Pt) => Pt): string[] {
  const log: string[] = [];
  if (!CFG.islands.enabled) return log;

  const free = (x0: number, y0: number, w: number, h: number) => {
    // la tapa + su pared + 1 celda de margen deben estar libres
    for (let y = y0 - 1; y <= y0 + h + CFG.extrusion.islandHeightInVoxels; y++)
      for (let x = x0 - 1; x <= x0 + w; x++) {
        if (!inGrid(x, y)) return false;
        if (top[idx(x, y)] !== 0) return false;
      }
    // y no tapar la pared de la tierra que esté justo arriba
    for (let x = x0 - 1; x <= x0 + w; x++)
      for (let d = 1; d <= EXT + 1; d++) {
        const y = y0 - 1 - d;
        if (inGrid(x, y) && isState(top[idx(x, y)])) return false;
      }
    return true;
  };

  for (const isl of CFG.islands.definitions) {
    const [gx, gy] = project(isl.lonLat);
    const bx = Math.round(gx), by = Math.round(gy);
    let placed: Pt | null = null;
    for (let r = 0; r <= 6 && !placed; r++) {
      for (let dy = -r; dy <= r && !placed; dy++)
        for (let dx = -r; dx <= r && !placed; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          if (free(bx + dx, by + dy, isl.size.w, isl.size.h)) placed = [bx + dx, by + dy];
        }
    }
    if (!placed) {
      log.push(`⚠ isla ${isl.name}: sin hueco libre cerca de (${bx},${by}); omitida`);
      continue;
    }
    for (let y = 0; y < isl.size.h; y++)
      for (let x = 0; x < isl.size.w; x++) top[idx(placed[0] + x, placed[1] + y)] = ISLAND;
    log.push(`isla ${isl.name} → (${placed[0]},${placed[1]})`);
  }
  return log;
}

// ───────────────────────────── 5. Extrusión prismática ─────────────────────────────

interface Side {
  origin: Int16Array; // fila del borde superior que generó la pared (-1 = no es pared)
  owner: Uint8Array; // id dueño (1..32 o ISLAND)
  depth: Uint8Array; // 1..EXT
  last: Uint8Array; // 1 si es la última celda de la columna de pared
}

function extrude(top: Uint8Array): Side {
  const side: Side = {
    origin: new Int16Array(W * H).fill(-1),
    owner: new Uint8Array(W * H),
    depth: new Uint8Array(W * H),
    last: new Uint8Array(W * H),
  };
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H - 1; y++) {
      const v = top[idx(x, y)];
      if (v === 0 || top[idx(x, y + 1)] !== 0) continue;
      const height = v === ISLAND ? CFG.extrusion.islandHeightInVoxels : EXT;
      let lastI = -1;
      for (let d = 1; d <= height; d++) {
        const yy = y + d;
        if (yy >= H) break;
        const i = idx(x, yy);
        if (top[i] !== 0 || side.origin[i] !== -1) break;
        side.origin[i] = y;
        side.owner[i] = v;
        side.depth[i] = d;
        lastI = i;
      }
      if (lastI >= 0) side.last[lastI] = 1;
    }
  }
  return side;
}

/** Fila del borde inferior de tierra en la columna x más cercana a `ey` (±6), o null. */
function edgeNear(top: Uint8Array, x: number, ey: number): number | null {
  if (x < 0 || x >= W) return null;
  for (let d = 0; d <= 6; d++) {
    for (const r of d === 0 ? [ey] : [ey - d, ey + d]) {
      if (r < 0 || r >= H - 1) continue;
      if (isState(top[idx(x, r)]) && top[idx(x, r + 1)] === 0) return r;
    }
  }
  return null;
}

/** Pendiente local de la costa (regresión lineal en ventana ±3 columnas). >0 = baja hacia la derecha. */
function coastSlope(top: Uint8Array, x: number, ey: number): number {
  const pts: Pt[] = [];
  for (let k = -3; k <= 3; k++) {
    const r = edgeNear(top, x + k, ey);
    if (r !== null) pts.push([k, r]);
  }
  if (pts.length < 3) return 0;
  const mx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const my = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  let num = 0, den = 0;
  for (const [px, py] of pts) {
    num += (px - mx) * (py - my);
    den += (px - mx) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

// ───────────────────────────── 6. Coloreado de estados ─────────────────────────────

function assignTopColors(top: Uint8Array): number[] {
  const adj: Set<number>[] = Array.from({ length: 33 }, () => new Set());
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = top[idx(x, y)];
    if (!isState(a)) continue;
    for (const [dx, dy] of [[1, 0], [0, 1]] as Pt[]) {
      if (!inGrid(x + dx, y + dy)) continue;
      const b = top[idx(x + dx, y + dy)];
      if (isState(b) && b !== a) {
        adj[a].add(b);
        adj[b].add(a);
      }
    }
  }
  const n = CFG.palette.topVariants.length;
  const color = new Array(33).fill(-1);
  for (let id = 1; id <= 32; id++) {
    const used = new Set([...adj[id]].map((b) => color[b]));
    const start = (id * 7) % n; // arranque determinista para repartir tonos
    let c = start;
    for (let t = 0; t < n; t++) {
      const cand = (start + t) % n;
      if (!used.has(cand)) {
        c = cand;
        break;
      }
    }
    color[id] = c;
  }
  return color;
}

// ───────────────────────────── 7. Render a píxeles de salida ─────────────────────────────

function render(top: Uint8Array, side: Side, colorIdx: number[]) {
  const rgba = Buffer.alloc(OW * OH * 4);
  const ids = new Uint8Array(OW * OH);

  const P = CFG.palette;
  const tops = P.topVariants.map(hex);
  const rim = hex(P.coastalHighlight);
  const border = hex(P.borderInner);
  const light = hex(P.cliffLight);
  const dark = hex(P.cliffDark);
  const mid = mix(light, dark, 0.5);
  const edge = hex(P.cliffEdge);

  const px = (ox: number, oy: number, c: RGB, id: number) => {
    const i = oy * OW + ox;
    rgba[i * 4] = c[0];
    rgba[i * 4 + 1] = c[1];
    rgba[i * 4 + 2] = c[2];
    rgba[i * 4 + 3] = 255;
    ids[i] = id;
  };
  const block = (x: number, y: number, c: RGB, id: number) => {
    for (let dy = 0; dy < S; dy++) for (let dx = 0; dx < S; dx++) px(x * S + dx, y * S + dy, c, id);
  };
  const rowLine = (x: number, y: number, bottom: boolean, c: RGB, id: number) => {
    for (let t = 0; t < LW; t++) for (let dx = 0; dx < S; dx++) px(x * S + dx, y * S + (bottom ? S - 1 - t : t), c, id);
  };
  const colLine = (x: number, y: number, right: boolean, c: RGB, id: number) => {
    for (let t = 0; t < LW; t++) for (let dy = 0; dy < S; dy++) px(x * S + (right ? S - 1 - t : t), y * S + dy, c, id);
  };
  const topAt = (x: number, y: number) => (inGrid(x, y) ? top[idx(x, y)] : 0);
  const emptyAt = (x: number, y: number) => topAt(x, y) === 0 && (!inGrid(x, y) || side.origin[idx(x, y)] === -1);

  const slopeCache = new Map<number, number>();

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = idx(x, y);
    const v = top[i];

    if (v !== 0) {
      // ── Cara superior
      const id = v === ISLAND ? 0 : v;
      const base = v === ISLAND ? tops[1] : tops[colorIdx[v]];
      block(x, y, base, id);
      // Biseles costeros (luz desde arriba-izquierda y labio del acantilado)
      if (emptyAt(x, y - 1)) rowLine(x, y, false, rim, id);
      if (emptyAt(x - 1, y)) colLine(x, y, false, rim, id);
      if (topAt(x, y + 1) === 0) rowLine(x, y, true, rim, id);
      // Fronteras internas de 1px (regla de medio vecino: solo derecha y abajo)
      if (isState(v)) {
        const r = topAt(x + 1, y);
        const d = topAt(x, y + 1);
        if (isState(r) && r !== v) colLine(x, y, true, border, id);
        if (isState(d) && d !== v) rowLine(x, y, true, border, id);
      }
      continue;
    }

    if (side.origin[i] === -1) continue;

    // ── Pared extruida
    const owner = side.owner[i];
    const ey = side.origin[i];
    const id = owner === ISLAND ? 0 : owner + 32;
    let c: RGB;
    if (owner === ISLAND) {
      // cubo: mitad izquierda iluminada, mitad derecha en sombra
      const leftIsSameCube = x > 0 && side.owner[idx(x - 1, y)] === ISLAND && side.origin[idx(x - 1, y)] === ey;
      c = leftIsSameCube ? dark : light;
    } else {
      const key = ey * W + x;
      let s = slopeCache.get(key);
      if (s === undefined) {
        s = coastSlope(top, x, ey);
        slopeCache.set(key, s);
      }
      c = s > 0.2 ? light : s < -0.2 ? dark : mid;
    }
    block(x, y, c, id);

    // Arista vertical solo en esquinas convexas: la columna sobresale respecto a su vecina izquierda
    const li = x > 0 ? idx(x - 1, y) : -1;
    const leftOrigin = li >= 0 && side.owner[li] === owner ? side.origin[li] : -1;
    const leftIsTop = li >= 0 && top[li] !== 0;
    if (!leftIsTop && (leftOrigin === -1 || leftOrigin < ey)) colLine(x, y, false, edge, id);
    // Línea de contacto con el suelo
    if (side.last[i]) rowLine(x, y, true, mix(c, edge, 0.6), id);
  }

  return { rgba, ids };
}

// ───────────────────────────── 8. Anclas de flor ─────────────────────────────

function computeAnchors(top: Uint8Array, states: StateGeo[]) {
  // Distancia (BFS 4-conexa) de cada celda a la celda más cercana que NO es del mismo estado
  const dist = new Int32Array(W * H).fill(-1);
  const q: number[] = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const v = top[idx(x, y)];
    if (!isState(v)) continue;
    const boundary = N4.some(([dx, dy]) => topAt(x + dx, y + dy) !== v);
    if (boundary) {
      dist[idx(x, y)] = 1;
      q.push(idx(x, y));
    }
  }
  function topAt(x: number, y: number) {
    return inGrid(x, y) ? top[idx(x, y)] : 0;
  }
  for (let h = 0; h < q.length; h++) {
    const i = q[h];
    const x = i % W, y = (i / W) | 0;
    for (const [dx, dy] of N4) {
      const nx = x + dx, ny = y + dy;
      if (!inGrid(nx, ny)) continue;
      const j = idx(nx, ny);
      if (dist[j] === -1 && top[j] === top[i]) {
        dist[j] = dist[i] + 1;
        q.push(j);
      }
    }
  }

  const result = new Map<number, { x: number; y: number; snapped: boolean }>();
  for (const st of states) {
    const [px, py] = polylabelCell(st.largest);
    let maxD = 0;
    for (let i = 0; i < W * H; i++) if (top[i] === st.numId && dist[i] > maxD) maxD = dist[i];
    const want = Math.min(2, maxD);
    let ax = px, ay = py, snapped = false;
    const ok = inGrid(px, py) && top[idx(px, py)] === st.numId && dist[idx(px, py)] >= want;
    if (!ok) {
      // celda del estado con mejor profundidad, la más cercana al polylabel
      let best = -1, bestScore = Infinity;
      for (let i = 0; i < W * H; i++) {
        if (top[i] !== st.numId || dist[i] < want) continue;
        const x = i % W, y = (i / W) | 0;
        const score = (x - px) ** 2 + (y - py) ** 2;
        if (score < bestScore) {
          bestScore = score;
          best = i;
        }
      }
      ax = best % W;
      ay = (best / W) | 0;
      snapped = true;
    }
    const o = CFG.anchorOverrides[st.code];
    if (o) {
      ax += o.dx ?? 0;
      ay += o.dy ?? 0;
    }
    result.set(st.numId, { x: Math.round((ax + 0.5) * S), y: Math.round((ay + 0.5) * S), snapped });
  }
  return result;
}

// ───────────────────────────── 9. Sombra ─────────────────────────────

async function buildShadow(rgba: Buffer): Promise<Buffer> {
  const { offsetX, offsetY, blurSigma, opacity, resolutionScale } = CFG.shadow;
  const [r, g, b] = hex(CFG.palette.shadowColor);
  const out = Buffer.alloc(OW * OH * 4);
  const a = Math.round(255 * opacity);
  for (let y = 0; y < OH; y++) for (let x = 0; x < OW; x++) {
    const o = (y * OW + x) * 4;
    out[o] = r;
    out[o + 1] = g;
    out[o + 2] = b;
    const sx = x - offsetX, sy = y - offsetY;
    if (sx >= 0 && sy >= 0 && sx < OW && sy < OH && rgba[(sy * OW + sx) * 4 + 3] > 0) out[o + 3] = a;
  }
  return sharp(out, { raw: { width: OW, height: OH, channels: 4 } })
    .blur(Math.max(0.3, blurSigma))
    .resize(Math.round(OW * resolutionScale), Math.round(OH * resolutionScale))
    .webp({ quality: 70, alphaQuality: 70, effort: 6 })
    .toBuffer();
}

// ───────────────────────────── Main ─────────────────────────────

async function main() {
  const t0 = Date.now();
  const states = loadStates();
  const project = projectStates(states);

  const top = new Uint8Array(W * H);
  for (const st of [...states].sort((a, b) => b.area - a.area)) {
    for (const poly of st.polys) fillPoly(poly, st.numId, top);
  }
  fillGaps(top);
  const removed = removeTinyComponents(top);
  const rescued = guaranteeSmallStates(top, states);
  const islandLog = stampIslands(top, project);
  const side = extrude(top);
  const colorIdx = assignTopColors(top);
  const { rgba, ids } = render(top, side, colorIdx);
  const anchors = computeAnchors(top, states);

  // ── Metadatos por estado
  const bboxes = new Map<number, [number, number, number, number]>();
  const topPx = new Array(65).fill(0);
  for (let y = 0; y < OH; y++) for (let x = 0; x < OW; x++) {
    const v = ids[y * OW + x];
    if (!v) continue;
    topPx[v]++;
    const id = v > 32 ? v - 32 : v;
    const b = bboxes.get(id) ?? [x, y, x, y];
    bboxes.set(id, [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)]);
  }

  const statesJson = {
    version: 1,
    width: OW,
    height: OH,
    pixelScale: S,
    extrusionPx: EXT * S,
    idEncoding: '0 = vacío/isla decorativa; 1..32 = cara superior; 33..64 = pared extruida (id - 32)',
    states: [...states]
      .sort((a, b) => a.numId - b.numId)
      .map((st) => ({
        id: st.code,
        numId: st.numId,
        nombre: st.nombre,
        anchor: { x: anchors.get(st.numId)!.x, y: anchors.get(st.numId)!.y },
        bbox: bboxes.get(st.numId) ?? [0, 0, 0, 0],
        topPixels: topPx[st.numId],
        sidePixels: topPx[st.numId + 32],
      })),
  };

  // ── Exportación
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const png = await sharp(rgba, { raw: { width: OW, height: OH, channels: 4 } })
    .png({ palette: true, colours: 64, dither: 0, effort: 10, compressionLevel: 9 })
    .toBuffer();
  const shadow = await buildShadow(rgba);
  const json = Buffer.from(JSON.stringify(statesJson));
  const bin = Buffer.from(ids.buffer);

  const files: [string, Buffer][] = [
    ['map-base.png', png],
    ['map-ids.bin', bin],
    ['states.json', json],
    ['map-shadow.webp', shadow],
  ];
  for (const [name, buf] of files) fs.writeFileSync(path.join(OUT_DIR, name), buf);

  // ── Reporte / validación
  const kb = (n: number) => (n / 1024).toFixed(1).padStart(6) + ' KB';
  let totalBr = 0;
  console.log(`\nMapa horneado en ${Date.now() - t0} ms — rejilla ${W}×${H} voxels, salida ${OW}×${OH} px\n`);
  console.log('Archivo            crudo      gzip    brotli');
  for (const [name, buf] of files) {
    const gz = zlib.gzipSync(buf, { level: 9 }).length;
    const br = zlib.brotliCompressSync(buf).length;
    // PNG/WebP ya van comprimidos: se transfieren tal cual
    const transfer = name.endsWith('.png') || name.endsWith('.webp') ? buf.length : br;
    totalBr += transfer;
    console.log(`${name.padEnd(16)} ${kb(buf.length)} ${kb(gz)} ${kb(br)}`);
  }
  console.log(`Total transferido (aprox., brotli en bin/json): ${kb(totalBr)}\n`);

  const problems: string[] = [];
  for (const st of statesJson.states) {
    if (st.topPixels === 0) problems.push(`${st.id} ${st.nombre}: sin píxeles`);
    const a = st.anchor;
    const v = ids[a.y * OW + a.x];
    if (v !== st.numId) problems.push(`${st.id} ${st.nombre}: ancla (${a.x},${a.y}) cae en id ${v}`);
  }
  if (removed) console.log(`Componentes de ruido eliminados: ${removed}`);
  if (rescued.length) console.log(`Estados pequeños reforzados:\n  ${rescued.join('\n  ')}`);
  if (islandLog.length) console.log(`Islas:\n  ${islandLog.join('\n  ')}`);
  const snapped = [...anchors.entries()].filter(([, a]) => a.snapped).map(([id]) => String(id).padStart(2, '0'));
  if (snapped.length) console.log(`Anclas reubicadas al interior: ${snapped.join(', ')}`);
  console.log(`Colores en paleta PNG: ${new Set(Array.from({ length: OW * OH }, (_, i) => rgba.readUInt32BE(i * 4))).size}`);

  if (problems.length) {
    console.error(`\n✗ ${problems.length} problema(s):\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log('\n✓ 32 estados con píxeles y anclas válidas.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
