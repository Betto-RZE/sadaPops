/**
 * scripts/build-holos.ts — Horneado offline de las 32 islas voxel 3D ampliadas (Hito H5, Fase 2).
 *
 * Reutiliza la proyección cónica + transformación isométrica (`config/iso.ts`) y el
 * shader 3D voxel de `scripts/build-map.ts` sobre `data/raw/mexico-estados.geojson`,
 * rasterizando cada estado de forma individual a alta resolución voxel para que
 * todos los estados (incluidos Tlaxcala, CDMX, Colima y Morelos) tengan su contorno
 * geográfico real con biseles costeros, textura orgánica y acantilados 3D.
 *
 * Salidas:
 *   - apps/web/public/data/holo/state-01.png .. state-32.png (PNG paleta sin pérdida)
 *   - apps/web/public/data/holo/holo-meta.json (dimensiones y puntos de tangencia del cono)
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { geoConicConformal } from 'd3-geo';
import polylabel from 'polylabel';
import { ISO_MAP_CONFIG as CFG } from '../config/iso';

type Pt = [number, number];
type Ring = Pt[];
type Poly = Ring[];
type RGB = [number, number, number];

interface StateGeo {
  numId: number;
  code: string;
  nombre: string;
  polys: Poly[];
}

export interface HoloStateMeta {
  id: string;
  width: number;
  height: number;
  /** Punto izquierdo de anclaje del cono de luz en coordenadas normalizadas [0..1] de la imagen */
  flankLeft: [number, number];
  /** Punto derecho de anclaje del cono de luz en coordenadas normalizadas [0..1] de la imagen */
  flankRight: [number, number];
  /** Centro visual óptimo para el bloque de texto y eje del cono en coordenadas normalizadas [0..1] */
  visualCenter: [number, number];
  /** Radio medio de la silueta desde `visualCenter` en fracción del menor lado [0.22..0.42] */
  coneRadiusRatio: number;
}

const ROOT = path.resolve(__dirname, '..');
const GEOJSON_PATH = path.join(ROOT, 'data/raw/mexico-estados.geojson');
const KEYS_PATH = path.join(ROOT, 'data/state-keys.json');
const OUT_DIR = path.join(ROOT, 'apps/web/public/data/holo');

// Parámetros de resolución voxel para cada isla ampliada
const TARGET_VOXEL_SPAN = 76; // Lado mayor del estado en vóxeles (~228 px a escala 3x)
const S = 3;                  // 3x3 px por voxel (mismo grano nítido del mapa base)
const EXT = 6;                // 6 vóxeles de altura de acantilado 3D (18 px)
const PAD_VOXELS = 4;         // Margen para el halo/borde exterior

// Paleta Prototipo A (Cara Índigo Profundo #23176E a #2E227A + Arista Costera Lavanda Brillante #F0EEFF / #B4B2FF)
const PALETTE = {
  topVariants: [
    '#23176E',
    '#261B72',
    '#281D76',
    '#2B2078',
    '#2E227A',
    '#251A71',
  ],
  coastalRimVoxel: '#B4B2FF',                         // Anillo perimetral lavanda brillante
  coastalRimHi: '#F0EEFF',                            // Arista especular luminosa exterior
  coastalInnerBevel: '#3D2F9E',                       // Bisel interior suave
  cliffLight: '#4E3FB8',                              // Pared iluminada SO
  cliffMid: '#3D2F9E',                                // Pared frontal S
  cliffDark: '#2A1E7A',                               // Pared en sombra SE
  cliffDeep: '#1B1259',                               // Sombra profunda Este / pliegues
  outerGlow1: [240, 238, 255, 220] as [number, number, number, number], // 1px borde lavanda-blanco
  outerGlow2: [180, 178, 255, 110] as [number, number, number, number], // 2px halo suave
};

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
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
  }
  return Math.abs(a / 2);
};

const cellHash = (x: number, y: number): number => {
  let n = (x * 374761393 + y * 668265263) ^ 0x5bf03635;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
};

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

function loadAndProjectStates(): StateGeo[] {
  const geo = JSON.parse(fs.readFileSync(GEOJSON_PATH, 'utf8'));
  const keys = JSON.parse(fs.readFileSync(KEYS_PATH, 'utf8'));

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

  const states: StateGeo[] = [];
  for (const f of geo.features) {
    const p = f.properties ?? {};
    let code: string | undefined = p.CVE_ENT;
    if (!code && p.NOM_ENT) code = keys.byName[p.NOM_ENT];
    if (!code || !keys.byCode[code]) continue;

    const g = f.geometry;
    const raw: number[][][][] = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    const polys = raw
      .map((poly) => poly.map((ring) => ring.map((pt) => view([pt[0], pt[1]]))))
      .sort((a, b) => ringArea(b[0]) - ringArea(a[0]));

    states.push({
      numId: parseInt(code, 10),
      code,
      nombre: keys.byCode[code].nombre,
      polys,
    });
  }
  return states.sort((a, b) => a.numId - b.numId);
}

const N4: Pt[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function buildSingleStateHolo(st: StateGeo): { rgba: Buffer; OW: number; OH: number; meta: HoloStateMeta } {
  // Usar el polígono continental principal e islas significativas (> 1.5% del área principal)
  const mainArea = ringArea(st.polys[0][0]);
  const activePolys = st.polys.filter((p, i) => i === 0 || ringArea(p[0]) >= mainArea * 0.018);

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const poly of activePolys) {
    for (const [x, y] of poly[0]) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  const spanX = Math.max(1e-6, maxX - minX);
  const spanY = Math.max(1e-6, maxY - minY);
  const rawAspect = spanX / spanY;

  // Estrategia A: Estandarización de proporción para zona de lectura (~260x230 px)
  // Ensanchar la proporción horizontal de estados angostos (BC, BCS, Veracruz, Sinaloa, QRoo)
  // garantizando un ancho mínimo cómodo sin perder la silueta icónica
  const targetAspect = Math.max(0.82, Math.min(1.28, rawAspect));
  const aspectBoostX = targetAspect / rawAspect;

  const baseScale = TARGET_VOXEL_SPAN / Math.max(spanX * aspectBoostX, spanY);
  const scaleX = baseScale * aspectBoostX;
  const scaleY = baseScale;

  const voxW = Math.max(66, Math.ceil(spanX * scaleX));
  const voxH = Math.max(54, Math.ceil(spanY * scaleY));
  const W = voxW + PAD_VOXELS * 2;
  const H = voxH + PAD_VOXELS * 2 + EXT;

  const idx = (x: number, y: number) => y * W + x;
  const inGrid = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H;

  const toGrid = ([x, y]: Pt): Pt => [
    (x - minX) * scaleX + PAD_VOXELS,
    (y - minY) * scaleY + PAD_VOXELS,
  ];

  const gridPolys = activePolys.map((poly) => poly.map((ring) => ring.map(toGrid)));

  // 1. Rasterizar cara superior
  const top = new Uint8Array(W * H);
  for (const rings of gridPolys) {
    let rMinY = Infinity, rMaxY = -Infinity;
    for (const r of rings) for (const [, y] of r) {
      if (y < rMinY) rMinY = y;
      if (y > rMaxY) rMaxY = y;
    }
    const y0 = Math.max(0, Math.floor(rMinY));
    const y1 = Math.min(H - 1, Math.ceil(rMaxY));
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
        for (let x = xa; x <= xb; x++) top[idx(x, y)] = 1;
      }
    }
  }

  // Cerrar huecos de 1 celda y limpiar salientes aisladas de 1 pixel
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (top[idx(x, y)] === 0) {
        let n = 0;
        for (const [dx, dy] of N4) if (top[idx(x + dx, y + dy)] === 1) n++;
        if (n >= 3) top[idx(x, y)] = 1;
      }
    }
  }

  // 2. Extrusión 3D (idéntica a scripts/build-map.ts)
  const sideOrigin = new Int16Array(W * H).fill(-1);
  const sideDepth = new Uint8Array(W * H);
  const sideLast = new Uint8Array(W * H);
  const sideEast = new Uint8Array(W * H);

  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H - 1; y++) {
      if (top[idx(x, y)] !== 1 || top[idx(x, y + 1)] !== 0) continue;
      let lastI = -1;
      for (let d = 1; d <= EXT; d++) {
        const yy = y + d;
        if (yy >= H) break;
        const i = idx(x, yy);
        if (top[i] !== 0 || sideOrigin[i] !== -1) break;
        sideOrigin[i] = y;
        sideDepth[i] = d;
        lastI = i;
      }
      if (lastI >= 0) sideLast[lastI] = 1;
    }
  }

  const maxEastD = Math.max(2, EXT - 2);
  for (let x = 0; x < W - 1; x++) {
    for (let y = 0; y < H - 1; y++) {
      if (top[idx(x, y)] !== 1 || top[idx(x + 1, y)] !== 0) continue;
      if (top[idx(x, y + 1)] !== 1 || top[idx(x + 1, y + 1)] !== 0) continue;
      let lastI = -1;
      for (let d = 1; d <= maxEastD; d++) {
        const yy = y + d;
        if (yy >= H) break;
        const iRight = idx(x + 1, yy);
        if (top[iRight] !== 0) break;
        if (sideOrigin[iRight] === -1) {
          sideOrigin[iRight] = y;
          sideDepth[iRight] = d;
          sideEast[iRight] = 1;
          lastI = iRight;
        }
      }
      if (lastI >= 0) sideLast[lastI] = 1;
    }
  }

  const topAt = (x: number, y: number) => (inGrid(x, y) ? top[idx(x, y)] : 0);

  const edgeNear = (x: number, ey: number): number | null => {
    if (x < 0 || x >= W) return null;
    for (let d = 0; d <= 5; d++) {
      for (const r of d === 0 ? [ey] : [ey - d, ey + d]) {
        if (r < 0 || r >= H - 1) continue;
        if (top[idx(x, r)] === 1 && top[idx(x, r + 1)] === 0) return r;
      }
    }
    return null;
  };

  const coastSlope = (x: number, ey: number): number => {
    const pts: Pt[] = [];
    for (let k = -3; k <= 3; k++) {
      const r = edgeNear(x + k, ey);
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
  };

  // Distancia al borde para sombreado interior suave
  const distToEdge = new Int16Array(W * H).fill(0);
  const queue: number[] = [];
  const isCoastRim = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (top[idx(x, y)] !== 1) continue;
    if (topAt(x - 1, y) === 0 || topAt(x + 1, y) === 0 || topAt(x, y - 1) === 0 || topAt(x, y + 1) === 0) {
      isCoastRim[idx(x, y)] = 1;
      distToEdge[idx(x, y)] = 1;
      queue.push(idx(x, y));
    }
  }
  let maxDist = 1;
  for (let q = 0; q < queue.length; q++) {
    const cur = queue[q];
    const cx = cur % W, cy = (cur / W) | 0;
    for (const [dx, dy] of N4) {
      const nx = cx + dx, ny = cy + dy;
      if (!inGrid(nx, ny)) continue;
      const ni = idx(nx, ny);
      if (top[ni] === 1 && distToEdge[ni] === 0) {
        distToEdge[ni] = distToEdge[cur] + 1;
        if (distToEdge[ni] > maxDist) maxDist = distToEdge[ni];
        queue.push(ni);
      }
    }
  }

  // 3. Renderizado a píxeles (OW x OH)
  const OW = W * S;
  const OH = H * S;
  const rgba = Buffer.alloc(OW * OH * 4);

  const variantHex = PALETTE.topVariants[(st.numId * 7) % PALETTE.topVariants.length];
  const baseTop = hex(variantHex);
  const centerTop = shiftRgb(baseTop, -6);
  const coastalVoxel = hex(PALETTE.coastalRimVoxel);
  const coastalHi = hex(PALETTE.coastalRimHi);
  const coastalBevel = hex(PALETTE.coastalInnerBevel);
  const light = hex(PALETTE.cliffLight);
  const mid = hex(PALETTE.cliffMid);
  const dark = hex(PALETTE.cliffDark);
  const deep = hex(PALETTE.cliffDeep);

  const px = (ox: number, oy: number, c: RGB, a = 255) => {
    if (ox < 0 || oy < 0 || ox >= OW || oy >= OH) return;
    const i = (oy * OW + ox) * 4;
    rgba[i] = c[0];
    rgba[i + 1] = c[1];
    rgba[i + 2] = c[2];
    rgba[i + 3] = a;
  };
  const rowLine = (x: number, y: number, bottom: boolean, thickness: number, c: RGB) => {
    for (let t = 0; t < thickness; t++) for (let dx = 0; dx < S; dx++) px(x * S + dx, y * S + (bottom ? S - 1 - t : t), c);
  };
  const colLine = (x: number, y: number, right: boolean, thickness: number, c: RGB) => {
    for (let t = 0; t < thickness; t++) for (let dy = 0; dy < S; dy++) px(x * S + (right ? S - 1 - t : t), y * S + dy, c);
  };

  // Paso A: Paredes 3D extruidas
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = idx(x, y);
    if (top[i] !== 0 || sideOrigin[i] === -1) continue;
    const ey = sideOrigin[i];
    const d = sideDepth[i];

    if (sideEast[i] === 1) {
      const isFirstD = d === 1;
      const depthRatio = (d - 1) / Math.max(1, EXT - 1);
      const eastBase = mix(dark, deep, 0.55 + depthRatio * 0.35);
      for (let dy = 0; dy < S; dy++) {
        for (let dx = 0; dx < S; dx++) {
          if (isFirstD && dy === 0 && dx === S - 1) continue;
          if (sideLast[i] && dy === S - 1 && dx === S - 1) continue;
          const c = dx === 0 ? dark : dx === S - 1 ? deep : eastBase;
          px(x * S + dx, y * S + dy, c);
        }
      }
      continue;
    }

    const leftEy = x > 0 && sideOrigin[idx(x - 1, y)] !== -1 && !sideEast[idx(x - 1, y)] ? sideOrigin[idx(x - 1, y)] : -1;
    const left2Ey = x > 1 && sideOrigin[idx(x - 2, y)] !== -1 && !sideEast[idx(x - 2, y)] ? sideOrigin[idx(x - 2, y)] : -1;
    const rightEy = x + 1 < W && sideOrigin[idx(x + 1, y)] !== -1 && !sideEast[idx(x + 1, y)] ? sideOrigin[idx(x + 1, y)] : -1;

    const s = coastSlope(x, ey);
    const stepsUpRight = rightEy !== -1 && rightEy < ey;
    const stepsDownRight = leftEy !== -1 && leftEy < ey;
    const majorStepDown = stepsDownRight && (ey - leftEy >= 2 || left2Ey === leftEy);
    const rightIsSea = rightEy === -1 && topAt(x + 1, y) === 0;
    const leftIsSea = leftEy === -1 && topAt(x - 1, y) === 0;

    let baseWall: RGB;
    if (stepsUpRight || rightIsSea) baseWall = dark;
    else if (majorStepDown) baseWall = mix(mid, dark, 0.5);
    else if (s > 0.08) baseWall = light;
    else if (s < -0.08) baseWall = dark;
    else baseWall = mid;

    const depthRatio = (d - 1) / Math.max(1, EXT - 1);
    const colShade = mix(baseWall, deep, depthRatio * 0.24);

    for (let dy = 0; dy < S; dy++) {
      const rowColor = d === 1 && dy === 0 ? mix(colShade, deep, 0.18) : colShade;
      for (let dx = 0; dx < S; dx++) {
        if (sideLast[i] && dy === S - 1) {
          if ((stepsDownRight || leftIsSea) && dx === 0) continue;
          if ((stepsUpRight || rightIsSea) && dx === S - 1) continue;
        }
        let c = rowColor;
        if (dx === 0 && majorStepDown) c = dark;
        else if (dx >= S - 1 && (stepsUpRight || rightIsSea)) c = deep;
        px(x * S + dx, y * S + dy, c);
      }
    }

    if (sideLast[i]) {
      for (let dx = 0; dx < S; dx++) {
        if ((stepsDownRight || leftIsSea) && dx === 0) continue;
        if ((stepsUpRight || rightIsSea) && dx === S - 1) continue;
        px(x * S + dx, y * S + (S - 1), coastalVoxel); // Labio inferior luminoso como en el mock
      }
    }
  }

  // Paso B: Cara superior con bisel costero isométrico y textura orgánica
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = idx(x, y);
    if (top[i] !== 1) continue;

    const coast = isCoastRim[i] === 1;
    const emptyU = topAt(x, y - 1) === 0;
    const emptyD = topAt(x, y + 1) === 0;
    const emptyL = topAt(x - 1, y) === 0;
    const emptyR = topAt(x + 1, y) === 0;

    const interiorT = Math.min(1, (distToEdge[i] - 1) / Math.max(4, maxDist * 0.55));
    const cellBase = mix(baseTop, centerTop, interiorT * 0.75);

    for (let dy = 0; dy < S; dy++) {
      for (let dx = 0; dx < S; dx++) {
        if (emptyU && emptyL && dx === 0 && dy === 0) continue;
        if (emptyU && emptyR && dx === S - 1 && dy === 0) continue;
        if (emptyD && emptyL && dx === 0 && dy === S - 1) continue;
        if (emptyD && emptyR && dx === S - 1 && dy === S - 1) continue;

        const ox = x * S + dx;
        const oy = y * S + dy;
        const n1 = smoothNoise(ox, oy, 12) * 6.5;
        const n2 = smoothNoise(ox + 100, oy + 100, 4) * 3.0;
        const nwLight = (0.45 - x / W) * 7 + (0.45 - y / H) * 7;
        let c = shiftRgb(cellBase, n1 + n2 + nwLight);

        if (coast) {
          c = mix(c, coastalVoxel, 0.82);
        }
        px(ox, oy, c);
      }
    }

    if (coast) {
      if (emptyU) {
        for (let dx = emptyL ? 1 : 0; dx < (emptyR ? S - 1 : S); dx++) px(x * S + dx, y * S, coastalHi);
      }
      if (emptyL) {
        for (let dy = emptyU ? 1 : 0; dy < (emptyD ? S - 1 : S); dy++) px(x * S, y * S + dy, coastalHi);
      }
      if (emptyD) {
        for (let dx = emptyL ? 1 : 0; dx < (emptyR ? S - 1 : S); dx++) {
          px(x * S + dx, y * S + (S - 1), mix(coastalVoxel, coastalHi, 0.7));
        }
      }
      if (emptyR) {
        for (let dy = emptyU ? 1 : 0; dy < (emptyD ? S - 1 : S); dy++) {
          px(x * S + (S - 1), y * S + dy, mix(coastalVoxel, coastalHi, 0.55));
        }
      }
      if (topAt(x, y + 1) === 1 && !isCoastRim[idx(x, y + 1)]) rowLine(x, y, true, 1, coastalBevel);
      if (topAt(x + 1, y) === 1 && !isCoastRim[idx(x + 1, y)]) colLine(x, y, true, 1, coastalBevel);
    }
  }

  // Paso C: Halo perimetral pixelado luminoso de 2px alrededor de la silueta completa
  const alphaSnapshot = new Uint8Array(OW * OH);
  for (let i = 0; i < OW * OH; i++) alphaSnapshot[i] = rgba[i * 4 + 3] > 0 ? 1 : 0;

  const hasSolidNeighbor = (ox: number, oy: number, r: number) => {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (Math.abs(dx) + Math.abs(dy) > r + 1) continue;
        const nx = ox + dx, ny = oy + dy;
        if (nx >= 0 && ny >= 0 && nx < OW && ny < OH && alphaSnapshot[ny * OW + nx] === 1) return true;
      }
    }
    return false;
  };

  const [g1r, g1g, g1b, g1a] = PALETTE.outerGlow1;
  const [g2r, g2g, g2b, g2a] = PALETTE.outerGlow2;
  for (let oy = 0; oy < OH; oy++) {
    for (let ox = 0; ox < OW; ox++) {
      if (alphaSnapshot[oy * OW + ox] === 1) continue;
      if (hasSolidNeighbor(ox, oy, 1)) {
        px(ox, oy, [g1r, g1g, g1b], g1a);
      } else if (hasSolidNeighbor(ox, oy, 2)) {
        px(ox, oy, [g2r, g2g, g2b], g2a);
      }
    }
  }

  // Calcular puntos de flanco izquierdo y derecho reales para que el cono de luz abrace la silueta
  let leftX = OW, leftY = Math.round(OH * 0.65);
  let rightX = 0, rightY = Math.round(OH * 0.65);
  const bandY0 = Math.floor(OH * 0.28);
  const bandY1 = Math.ceil(OH * 0.88);
  for (let oy = bandY0; oy <= bandY1; oy++) {
    for (let ox = 0; ox < OW; ox++) {
      if (alphaSnapshot[oy * OW + ox] === 1) {
        if (ox < leftX) { leftX = ox; leftY = oy; }
        if (ox > rightX) { rightX = ox; rightY = oy; }
      }
    }
  }

  // Centro visual óptimo (polylabel sobre el polígono principal en espacio de rejilla)
  const pole = polylabel(gridPolys[0], 0.5);
  const cxNorm = Math.min(0.65, Math.max(0.35, (pole[0] * S) / OW));
  const cyNorm = Math.min(0.62, Math.max(0.36, (pole[1] * S) / OH));

  // Radio efectivo para el cono perpendicular basado en la cobertura sólida del estado
  let solidCount = 0;
  for (let i = 0; i < OW * OH; i++) if (alphaSnapshot[i] === 1) solidCount++;
  const eqRadiusPx = Math.sqrt(solidCount / Math.PI);
  const minSide = Math.min(OW, OH);
  const coneRadiusRatio = Number(
    Math.min(0.40, Math.max(0.24, (eqRadiusPx * 0.78) / minSide)).toFixed(3)
  );

  return {
    rgba,
    OW,
    OH,
    meta: {
      id: st.code,
      width: OW,
      height: OH,
      flankLeft: [Number((leftX / OW).toFixed(3)), Number((leftY / OH).toFixed(3))],
      flankRight: [Number((rightX / OW).toFixed(3)), Number((rightY / OH).toFixed(3))],
      visualCenter: [Number(cxNorm.toFixed(3)), Number(cyNorm.toFixed(3))],
      coneRadiusRatio,
    },
  };
}

async function main() {
  const t0 = Date.now();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const states = loadAndProjectStates();
  const metaByState: Record<string, HoloStateMeta> = {};
  let totalBytes = 0;

  for (const st of states) {
    const { rgba, OW, OH, meta } = buildSingleStateHolo(st);
    metaByState[st.code] = meta;
    const png = await sharp(rgba, { raw: { width: OW, height: OH, channels: 4 } })
      .png({ palette: true, colours: 96, dither: 0, compressionLevel: 9, effort: 10 })
      .toBuffer();
    fs.writeFileSync(path.join(OUT_DIR, `state-${st.code}.png`), png);
    totalBytes += png.length;
  }

  fs.writeFileSync(path.join(OUT_DIR, 'holo-meta.json'), JSON.stringify(metaByState));
  console.log(
    `✓ 32 siluetas voxel horneadas en ${Date.now() - t0} ms — promedio ${(totalBytes / 32 / 1024).toFixed(1)} KB/estado (${(totalBytes / 1024).toFixed(1)} KB total)`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
