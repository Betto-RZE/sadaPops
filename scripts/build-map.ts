/**
 * scripts/build-map.ts — Horneado offline del mapa isométrico voxel 3D (Hito H2).
 *
 * Insumos:  data/raw/mexico-estados.geojson + data/state-keys.json + config/iso.ts
 * Salidas:  apps/web/public/data/{map-base.png, map-ids.bin, states.json, map-shadow.webp}
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
const ISLAND = 255;

// ───────────────────────────── Utilidades ─────────────────────────────

const hex = (h: string): RGB => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
const mix = (a: RGB, b: RGB, t: number): RGB =>
  [0, 1, 2].map((i) => clampByte(a[i] + (b[i] - a[i]) * t)) as RGB;
const shiftRgb = (c: RGB, delta: number): RGB =>
  [clampByte(c[0] + delta), clampByte(c[1] + delta), clampByte(c[2] + delta)];

const ringArea = (r: Ring): number => {
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
  return Math.abs(a / 2);
};
const polyArea = (p: Poly): number => ringArea(p[0]) - p.slice(1).reduce((s, h) => s + ringArea(h), 0);

const idx = (x: number, y: number) => y * W + x;
const inGrid = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H;
const isState = (v: number) => v >= 1 && v <= 32;

const cellHash = (x: number, y: number): number => {
  let n = (x * 374761393 + y * 668265263) ^ 0x5bf03635;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
};

/** Ruido suave bilineal [-1..1] para dar textura orgánica de maqueta a la superficie sin rejilla dura */
function smoothNoise(px: number, py: number, scale: number): number {
  const gx = px / scale;
  const gy = py / scale;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const tx = gx - x0;
  const ty = gy - y0;
  const u = tx * tx * (3 - 2 * tx);
  const v = ty * ty * (3 - 2 * ty);
  const n00 = cellHash(x0, y0);
  const n10 = cellHash(x0 + 1, y0);
  const n01 = cellHash(x0, y0 + 1);
  const n11 = cellHash(x0 + 1, y0 + 1);
  const nx0 = n00 + (n10 - n00) * u;
  const nx1 = n01 + (n11 - n01) * u;
  return (nx0 + (nx1 - nx0) * v) * 2 - 1;
}

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

  const targetX0 = CFG.framing.relMinX * W;
  const targetX1 = CFG.framing.relMaxX * W;
  const targetY0 = CFG.framing.relMinY * H;
  const targetY1 = CFG.framing.relMaxY * H;

  const kx = (targetX1 - targetX0) / (maxX - minX);
  const ky = (targetY1 - targetY0) / (maxY - minY);
  const toGrid = (p: Pt): Pt => [(p[0] - minX) * kx + targetX0, (p[1] - minY) * ky + targetY0];

  for (const st of states) {
    let polys = st.polys.map((poly) => poly.map((ring) => ring.map(toGrid)));
    polys.sort((a, b) => ringArea(b[0]) - ringArea(a[0]));
    const [main, ...rest] = polys;
    polys = [main, ...rest.filter((p) => ringArea(p[0]) >= CFG.geometry.minIslandAreaVoxels)];
    polys = polys.map(([outer, ...holes]) => [outer, ...holes.filter((h) => ringArea(h) >= CFG.geometry.minHoleAreaVoxels)]);
    st.polys = polys;
    st.largest = polys[0];
    st.area = polys.reduce((sum, p) => sum + polyArea(p), 0);
  }
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

function smoothStateBorders(top: Uint8Array, passes: number) {
  const counts = new Array(33).fill(0);
  for (let i = 0; i < W * H; i++) if (isState(top[i])) counts[top[i]]++;

  for (let p = 0; p < passes; p++) {
    const changes: [number, number][] = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = idx(x, y);
      const cur = top[i];
      if (!isState(cur) || counts[cur] <= CFG.geometry.minStateCells + 8) continue;

      const nCounts = new Map<number, number>();
      for (const [dx, dy] of N4) {
        const nv = top[idx(x + dx, y + dy)];
        nCounts.set(nv, (nCounts.get(nv) ?? 0) + 1);
      }
      const sameCard = nCounts.get(cur) ?? 0;
      if (sameCard <= 1) {
        let bestId = cur, bestC = 0;
        for (const [nid, c] of nCounts.entries()) {
          if (nid !== cur && isState(nid) && c > bestC) {
            bestC = c;
            bestId = nid;
          }
        }
        if (bestId !== cur && bestC >= 2) {
          changes.push([i, bestId]);
        }
      }
    }
    for (const [i, nextId] of changes) {
      const prev = top[i];
      if (counts[prev] > CFG.geometry.minStateCells + 4) {
        counts[prev]--;
        counts[nextId]++;
        top[i] = nextId;
      }
    }
  }
}

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

function guaranteeSmallStates(top: Uint8Array, states: StateGeo[]): string[] {
  const counts = new Array(33).fill(0);
  for (let i = 0; i < W * H; i++) if (isState(top[i])) counts[top[i]]++;
  const protectedIds = new Set<number>();
  const rescued: string[] = [];

  for (const st of [...states].sort((a, b) => a.area - b.area)) {
    if (counts[st.numId] >= CFG.geometry.minStateCells) {
      if (st.area < 40) protectedIds.add(st.numId);
      continue;
    }
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

interface PlacedIsland {
  name: string;
  x0: number;
  y0: number;
  w: number;
  h: number;
}

function stampIslands(top: Uint8Array): { log: string[]; placedList: PlacedIsland[] } {
  const log: string[] = [];
  const placedList: PlacedIsland[] = [];
  if (!CFG.islands.enabled) return { log, placedList };

  const free = (x0: number, y0: number, w: number, h: number, marginUp: number) => {
    for (let y = y0; y < y0 + h + CFG.extrusion.islandHeightInVoxels; y++)
      for (let x = x0; x < x0 + w; x++) {
        if (!inGrid(x, y)) return false;
        if (top[idx(x, y)] !== 0) return false;
      }
    for (let x = x0; x < x0 + w; x++)
      for (let d = 1; d <= marginUp; d++) {
        const y = y0 - d;
        if (inGrid(x, y) && isState(top[idx(x, y)])) return false;
      }
    return true;
  };

  for (const isl of CFG.islands.definitions) {
    const bx = Math.round(isl.relPos[0] * W - isl.size.w / 2);
    const by = Math.round(isl.relPos[1] * H - isl.size.h / 2);
    let placed: Pt | null = null;
    for (const marginUp of [EXT, 2]) {
      for (let r = 0; r <= 6 && !placed; r++) {
        for (let dy = -r; dy <= r && !placed; dy++)
          for (let dx = -r; dx <= r && !placed; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
            if (free(bx + dx, by + dy, isl.size.w, isl.size.h, marginUp)) placed = [bx + dx, by + dy];
          }
      }
    }
    if (!placed) {
      log.push(`⚠ isla ${isl.name}: sin hueco libre cerca de (${bx},${by}); omitida`);
      continue;
    }
    placedList.push({ name: isl.name, x0: placed[0], y0: placed[1], w: isl.size.w, h: isl.size.h });
    log.push(`isla ${isl.name} → (${placed[0]},${placed[1]})`);
  }
  return { log, placedList };
}

// ───────────────────────────── 5. Extrusión prismática 3D ─────────────────────────────

interface Side {
  origin: Int16Array; // fila del borde superior que generó la pared (-1 = no es pared)
  owner: Uint8Array; // id dueño (1..32)
  depth: Uint8Array; // 1..EXT
  last: Uint8Array; // 1 si es la última celda de la columna de pared
  eastWall: Uint8Array; // 1 si es pared lateral orientada al Este (costa vertical derecha)
}

function extrude(top: Uint8Array): Side {
  const side: Side = {
    origin: new Int16Array(W * H).fill(-1),
    owner: new Uint8Array(W * H),
    depth: new Uint8Array(W * H),
    last: new Uint8Array(W * H),
    eastWall: new Uint8Array(W * H),
  };

  // 1. Extrusión vertical estándar hacia abajo (Delta X = 0, Delta Y = +1)
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H - 1; y++) {
      const v = top[idx(x, y)];
      if (!isState(v) || top[idx(x, y + 1)] !== 0) continue;
      let lastI = -1;
      for (let d = 1; d <= EXT; d++) {
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

  // 2. Paredes laterales derechas (orientación Este: Golfo de California en BC, Veracruz, QRoo)
  // Solo cuando la costa corre verticalmente o hacia abajo-izquierda (es decir, en y+1 hay tierra en x, pero mar en x+1)
  for (let x = 0; x < W - 1; x++) {
    for (let y = 0; y < H - 1; y++) {
      const v = top[idx(x, y)];
      if (!isState(v) || top[idx(x + 1, y)] !== 0) continue;
      if (!isState(top[idx(x, y + 1)]) || top[idx(x + 1, y + 1)] !== 0) continue;
      let lastI = -1;
      const maxEastD = Math.max(2, EXT - 2);
      for (let d = 1; d <= maxEastD; d++) {
        const yy = y + d;
        if (yy >= H) break;
        const iRight = idx(x + 1, yy);
        if (top[iRight] !== 0) break;
        if (side.origin[iRight] === -1) {
          side.origin[iRight] = y;
          side.owner[iRight] = v;
          side.depth[iRight] = d;
          side.eastWall[iRight] = 1;
          lastI = iRight;
        }
      }
      if (lastI >= 0) side.last[lastI] = 1;
    }
  }

  return side;
}

function edgeNear(top: Uint8Array, x: number, ey: number): number | null {
  if (x < 0 || x >= W) return null;
  for (let d = 0; d <= 5; d++) {
    for (const r of d === 0 ? [ey] : [ey - d, ey + d]) {
      if (r < 0 || r >= H - 1) continue;
      if (isState(top[idx(x, r)]) && top[idx(x, r + 1)] === 0) return r;
    }
  }
  return null;
}

function coastSlope(top: Uint8Array, x: number, ey: number): number {
  const pts: Pt[] = [];
  for (let k = -3; k <= 3; k++) {
    const r = edgeNear(top, x + k, ey);
    if (r !== null) pts.push([k, r]);
  }
  if (pts.length < 2) return 0;
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
    const start = (id * 7) % n;
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

// ───────────────────────────── 7. Shader Isométrico Voxel 3D ─────────────────────────────

function render(top: Uint8Array, side: Side, colorIdx: number[], islands: PlacedIsland[]) {
  const rgba = Buffer.alloc(OW * OH * 4);
  const ids = new Uint8Array(OW * OH);

  const P = CFG.palette;
  const tops = P.topVariants.map(hex);
  const coastalVoxel = hex(P.coastalRimVoxel);
  const coastalHi = hex(P.coastalRimHighlight);
  const coastalBevel = hex(P.coastalInnerBevel);
  const border = hex(P.borderInner);
  const borderSoft = hex(P.borderSoft);
  const borderGroove = hex(P.borderGroove);
  const light = hex(P.cliffLight);
  const mid = hex(P.cliffMid);
  const dark = hex(P.cliffDark);
  const deep = hex(P.cliffDeepShadow);

  const px = (ox: number, oy: number, c: RGB, id: number) => {
    if (ox < 0 || oy < 0 || ox >= OW || oy >= OH) return;
    const i = oy * OW + ox;
    rgba[i * 4] = c[0];
    rgba[i * 4 + 1] = c[1];
    rgba[i * 4 + 2] = c[2];
    rgba[i * 4 + 3] = 255;
    ids[i] = id;
  };
  const clearPx = (ox: number, oy: number) => {
    if (ox < 0 || oy < 0 || ox >= OW || oy >= OH) return;
    const i = oy * OW + ox;
    rgba[i * 4] = 0;
    rgba[i * 4 + 1] = 0;
    rgba[i * 4 + 2] = 0;
    rgba[i * 4 + 3] = 0;
    ids[i] = 0;
  };
  const rowLine = (x: number, y: number, bottom: boolean, thickness: number, c: RGB, id: number) => {
    for (let t = 0; t < thickness; t++) for (let dx = 0; dx < S; dx++) px(x * S + dx, y * S + (bottom ? S - 1 - t : t), c, id);
  };
  const colLine = (x: number, y: number, right: boolean, thickness: number, c: RGB, id: number) => {
    for (let t = 0; t < thickness; t++) for (let dy = 0; dy < S; dy++) px(x * S + (right ? S - 1 - t : t), y * S + dy, c, id);
  };

  const topAt = (x: number, y: number) => (inGrid(x, y) ? top[idx(x, y)] : 0);

  // Anillo costero exterior de 1 voxel completo de grosor
  const isCoastRim = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const v = top[idx(x, y)];
    if (!isState(v)) continue;
    if (topAt(x - 1, y) === 0 || topAt(x + 1, y) === 0 || topAt(x, y - 1) === 0 || topAt(x, y + 1) === 0) {
      isCoastRim[idx(x, y)] = 1;
    }
  }

  const stateCellCount = new Array(33).fill(0);
  for (let i = 0; i < W * H; i++) if (isState(top[i])) stateCellCount[top[i]]++;

  const slopeCache = new Map<number, number>();

  // ── Paso A: Pintar Paredes Extruidas primero (para que el labio biselado de la tapa pueda montar 1px encima)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = idx(x, y);
    if (top[i] !== 0 || side.origin[i] === -1) continue;
    const owner = side.owner[i];
    if (!isState(owner)) continue;

    const ey = side.origin[i];
    const id = owner + 32;
    const d = side.depth[i];

    if (side.eastWall[i] === 1) {
      // Pared vertical orientada al Este (sombra profunda de espesor 3D en BC Golfo, Sonora NE, Veracruz, QRoo)
      const isFirstD = d === 1;
      const depthRatio = (d - 1) / Math.max(1, EXT - 1);
      const eastBase = mix(dark, deep, 0.55 + depthRatio * 0.35);
      for (let dy = 0; dy < S; dy++) {
        for (let dx = 0; dx < S; dx++) {
          // Chaflán diagonal superior derecho cuando empieza el escalón en d=1
          if (isFirstD && dy === 0 && dx === S - 1) continue;
          if (side.last[i] && dy === S - 1 && dx === S - 1) continue;
          const c = dx === 0 ? dark : dx === S - 1 ? deep : eastBase;
          px(x * S + dx, y * S + dy, c, id);
        }
      }
      continue;
    }

    const leftEy = x > 0 && side.owner[idx(x - 1, y)] !== 0 && !side.eastWall[idx(x - 1, y)]
      ? side.origin[idx(x - 1, y)]
      : -1;
    const left2Ey = x > 1 && side.owner[idx(x - 2, y)] !== 0 && !side.eastWall[idx(x - 2, y)]
      ? side.origin[idx(x - 2, y)]
      : -1;
    const rightEy = x + 1 < W && side.owner[idx(x + 1, y)] !== 0 && !side.eastWall[idx(x + 1, y)]
      ? side.origin[idx(x + 1, y)]
      : -1;

    const key = ey * W + x;
    let s = slopeCache.get(key);
    if (s === undefined) {
      s = coastSlope(top, x, ey);
      slopeCache.set(key, s);
    }

    const stepsUpRight = rightEy !== -1 && rightEy < ey;
    const stepsDownRight = leftEy !== -1 && leftEy < ey;
    // Solo marcar pliegue izquierdo cuando inicia un escalón nuevo (después de un tramo plano o salto >= 2)
    // para evitar rayas de 1px repetitivas en diagonales de 45°
    const majorStepDown = stepsDownRight && (ey - leftEy >= 2 || left2Ey === leftEy);
    const rightIsSea = rightEy === -1 && topAt(x + 1, y) === 0;
    const leftIsSea = leftEy === -1 && topAt(x - 1, y) === 0;

    let baseWall: RGB;
    if (stepsUpRight || rightIsSea) {
      baseWall = dark;
    } else if (majorStepDown) {
      baseWall = mix(mid, dark, 0.5);
    } else if (s > 0.08) {
      baseWall = light;
    } else if (s < -0.08) {
      baseWall = dark;
    } else {
      baseWall = mid;
    }

    const depthRatio = (d - 1) / Math.max(1, EXT - 1);
    const colShade = mix(baseWall, deep, depthRatio * 0.24);

    for (let dy = 0; dy < S; dy++) {
      const rowColor = d === 1 && dy === 0 ? mix(colShade, deep, 0.18) : colShade;
      for (let dx = 0; dx < S; dx++) {
        if (side.last[i] && dy === S - 1) {
          if ((stepsDownRight || leftIsSea) && dx === 0) continue;
          if ((stepsUpRight || rightIsSea) && dx === S - 1) continue;
        }
        let c = rowColor;
        if (dx === 0 && majorStepDown) {
          c = dark;
        } else if (dx >= S - 1 && (stepsUpRight || rightIsSea)) {
          c = deep;
        }
        px(x * S + dx, y * S + dy, c, id);
      }
    }

    if (side.last[i]) {
      for (let dx = 0; dx < S; dx++) {
        if ((stepsDownRight || leftIsSea) && dx === 0) continue;
        if ((stepsUpRight || rightIsSea) && dx === S - 1) continue;
        px(x * S + dx, y * S + (S - 1), deep, id);
      }
    }
  }

  // ── Paso B: Pintar Cara Superior con Bisel Costero Isométrico y Textura Orgánica Suave
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = idx(x, y);
    const v = top[i];
    if (!isState(v)) continue;

    const id = v;
    const coast = isCoastRim[i] === 1;
    const baseColor = tops[colorIdx[v]];

    const emptyU = topAt(x, y - 1) === 0;
    const emptyD = topAt(x, y + 1) === 0;
    const emptyL = topAt(x - 1, y) === 0;
    const emptyR = topAt(x + 1, y) === 0;

    for (let dy = 0; dy < S; dy++) {
      for (let dx = 0; dx < S; dx++) {
        const ox = x * S + dx;
        const oy = y * S + dy;

        // Chaflán isométrico de 1px en esquinas exteriores de 90° de la costa (aspecto de rombo/cubo)
        if (emptyU && emptyL && dx === 0 && dy === 0) continue;
        if (emptyU && emptyR && dx === S - 1 && dy === 0) continue;
        if (emptyD && emptyL && dx === 0 && dy === S - 1) {
          // Dejar visible la pared inferior si existe
          continue;
        }
        if (emptyD && emptyR && dx === S - 1 && dy === S - 1) {
          continue;
        }

        // Ruido suave multiescala (textura orgánica tipo arcilla MagicaVoxel de ±8 RGB como en mockup-mapa.jpeg)
        const n1 = smoothNoise(ox, oy, 12) * 8.0;
        const n2 = smoothNoise(ox + 100, oy + 100, 4) * 3.8;
        const nwLight = (0.45 - x / W) * 6 + (0.45 - y / H) * 6;
        let c = shiftRgb(baseColor, n1 + n2 + nwLight);

        if (coast) {
          c = mix(c, coastalVoxel, 0.76);
        }
        px(ox, oy, c, id);
      }
    }

    // Biseles del anillo costero (con respeto al chaflán de esquina)
    if (coast) {
      if (emptyU) {
        for (let dx = emptyL ? 1 : 0; dx < (emptyR ? S - 1 : S); dx++) px(x * S + dx, y * S, coastalHi, id);
      }
      if (emptyL) {
        for (let dy = emptyU ? 1 : 0; dy < (emptyD ? S - 1 : S); dy++) px(x * S, y * S + dy, coastalHi, id);
      }
      if (emptyD) {
        for (let dx = emptyL ? 1 : 0; dx < (emptyR ? S - 1 : S); dx++) {
          px(x * S + dx, y * S + (S - 1), mix(coastalVoxel, coastalHi, 0.65), id);
        }
      }
      // Bisel interno oscuro donde el anillo costero se une al interior del estado
      if (topAt(x, y + 1) === v && !isCoastRim[idx(x, y + 1)]) rowLine(x, y, true, 1, coastalBevel, id);
      if (topAt(x + 1, y) === v && !isCoastRim[idx(x + 1, y)]) colLine(x, y, true, 1, coastalBevel, id);
    }

    // Fronteras internas entre estados con bisel suave de ambos lados y chaflán diagonal
    const l = topAt(x - 1, y);
    const u = topAt(x, y - 1);
    const r = topAt(x + 1, y);
    const d = topAt(x, y + 1);
    const dr = topAt(x + 1, y + 1);
    const isTiny = stateCellCount[v] <= 18;

    if (isState(l) && l !== v) {
      colLine(x, y, false, 1, borderSoft, id);
      if (!isTiny && S >= 3) {
        for (let dy = 0; dy < S; dy++) px(x * S + 1, y * S + dy, borderGroove, id);
      }
    }
    if (isState(u) && u !== v) {
      rowLine(x, y, false, 1, borderSoft, id);
      if (!isTiny && S >= 3) {
        for (let dx = 0; dx < S; dx++) px(x * S + dx, y * S + 1, borderGroove, id);
      }
    }

    if (isState(r) && r !== v) {
      if (!isTiny && S >= 3) colLine(x, y, true, 2, borderSoft, id);
      colLine(x, y, true, 1, border, id);
    }
    if (isState(d) && d !== v) {
      if (!isTiny && S >= 3) rowLine(x, y, true, 2, borderSoft, id);
      rowLine(x, y, true, 1, border, id);
    }
    if (isState(dr) && dr !== v && r === v && d === v) {
      px(x * S + (S - 1), y * S + (S - 1), border, id);
      if (!isTiny && S >= 3) {
        px(x * S + (S - 2), y * S + (S - 1), borderSoft, id);
        px(x * S + (S - 1), y * S + (S - 2), borderSoft, id);
      }
    }
  }

  // ── Paso C: Renderizado de los 10 Prismas Hexagonales Isométricos de Islas (idénticos a crop_bc.png)
  // Cada isla se dibuja como un cubo isométrico continuo (sin huecos entre tapa y pared, con punta en V arriba y abajo)
  for (const isl of islands) {
    const ox = isl.x0 * S;
    const oy = isl.y0 * S;
    const pw = 8; // 8 px de ancho exacto para simetría de caras 4px izq + 4px der
    const totalH = 15; // 5 px tapa en rombo + 10 px cuerpo prismático

    for (let dy = 0; dy < totalH; dy++)
      for (let dx = 0; dx < pw; dx++) clearPx(ox + dx, oy + dy);

    // Filas 0..4: Tapa en forma de rombo isométrico (/\ arriba, \/ abajo)
    // y el fondo del rombo se apoya directamente sobre las paredes izquierda/derecha
    const topMask: [number, number][] = [
      [2, 5], // dy=0: ..####..
      [1, 6], // dy=1: .######.
      [0, 7], // dy=2: ########
      [0, 7], // dy=3: ########
      [1, 6], // dy=4: .######. (punta frontal del rombo superior)
    ];

    // Primero pintar el cuerpo vertical (filas 2..14) para que la tapa monte limpiamente encima sin ningún píxel vacío
    for (let dy = 2; dy < totalH; dy++) {
      let xStart = 0;
      let xEnd = pw - 1;
      if (dy === totalH - 2) {
        xStart = 1;
        xEnd = pw - 2;
      } else if (dy === totalH - 1) {
        xStart = 2;
        xEnd = pw - 3;
      }
      const vGrad = (dy - 2) / (totalH - 3);
      for (let dx = xStart; dx <= xEnd; dx++) {
        let c: RGB;
        if (dx === xStart && dy < totalH - 2) c = mix(light, dark, 0.35);
        else if (dx < 3) c = light;
        else if (dx === 3) c = shiftRgb(light, 10); // arista central iluminada del cubo
        else if (dx === 4) c = mix(light, dark, 0.65);
        else if (dx < xEnd) c = dark;
        else c = deep;

        c = mix(c, deep, vGrad * 0.25);
        if (dy === totalH - 1 || (dy === totalH - 2 && (dx === xStart || dx === xEnd))) {
          c = deep;
        }
        px(ox + dx, oy + dy, c, 0);
      }
    }

    // Ahora pintar la tapa romboidal encima (filas 0..4)
    for (let dy = 0; dy < topMask.length; dy++) {
      const [xStart, xEnd] = topMask[dy];
      for (let dx = xStart; dx <= xEnd; dx++) {
        let c = coastalVoxel;
        if (dy === 0 || (dy === 1 && (dx === xStart || dx === xEnd))) {
          c = coastalHi;
        } else if (dy === 4 || (dy === 3 && (dx === xStart || dx === xEnd))) {
          c = mix(coastalVoxel, coastalHi, 0.65); // labio frontal luminoso del rombo
        }
        px(ox + dx, oy + dy, c, 0);
      }
    }
  }

  return { rgba, ids };
}

// ───────────────────────────── 8. Anclas de flor ─────────────────────────────

function computeAnchors(top: Uint8Array, states: StateGeo[]) {
  const dist = new Int32Array(W * H).fill(-1);
  const q: number[] = [];
  const topAt = (x: number, y: number) => (inGrid(x, y) ? top[idx(x, y)] : 0);

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const v = top[idx(x, y)];
    if (!isState(v)) continue;
    const boundary = N4.some(([dx, dy]) => topAt(x + dx, y + dy) !== v);
    if (boundary) {
      dist[idx(x, y)] = 1;
      q.push(idx(x, y));
    }
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
    result.set(st.numId, { x: ax * S + Math.floor((S - 1) / 2), y: ay * S + Math.floor((S - 1) / 2), snapped });
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
    .webp({ quality: 75, alphaQuality: 80, effort: 6 })
    .toBuffer();
}

// ───────────────────────────── Main ─────────────────────────────

async function main() {
  const t0 = Date.now();
  const states = loadStates();
  projectStates(states);

  const top = new Uint8Array(W * H);
  for (const st of [...states].sort((a, b) => b.area - a.area)) {
    for (const poly of st.polys) fillPoly(poly, st.numId, top);
  }
  fillGaps(top);
  const removed = removeTinyComponents(top);
  const rescued = guaranteeSmallStates(top, states);
  smoothStateBorders(top, CFG.geometry.smoothingPasses);
  const { log: islandLog, placedList } = stampIslands(top);
  const side = extrude(top);
  const colorIdx = assignTopColors(top);
  const { rgba, ids } = render(top, side, colorIdx, placedList);
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
    .png({ palette: true, colours: 128, dither: 0, effort: 10, compressionLevel: 9 })
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
  console.log(`Colores únicos RGBA: ${new Set(Array.from({ length: OW * OH }, (_, i) => rgba.readUInt32BE(i * 4))).size}`);

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
