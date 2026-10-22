/**
 * scripts/compare-map.ts — Comparador visual lado a lado + overlay contra mockup-mapa.jpeg (Fase 4).
 *
 * Genera docs/comparacion-mapa.png con 3 paneles:
 *   1. Referencia: docs/referencias/mockup-mapa.jpeg
 *   2. Procedural: map-shadow.webp + map-base.png (escalado nearest-neighbor) + anclas de estados
 *   3. Superposición (50% / 50%) para calibrar rotación, compresión vertical, extrusión e islas.
 *
 * Uso: pnpm compare-map
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp, { type OverlayOptions } from 'sharp';
import { ISO_MAP_CONFIG as CFG } from '../config/iso';

const ROOT = path.resolve(__dirname, '..');
const REF_PATH = path.join(ROOT, 'docs/referencias/mockup-mapa.jpeg');
const DATA_DIR = path.join(ROOT, 'apps/web/public/data');
const OUT_PATH = path.join(ROOT, 'docs/comparacion-mapa.png');

interface StateMeta {
  id: string;
  numId: number;
  nombre: string;
  anchor: { x: number; y: number };
  bbox: [number, number, number, number];
}

interface StatesJson {
  width: number;
  height: number;
  states: StateMeta[];
}

async function renderProceduralPanel(targetW: number, targetH: number, drawAnchors = true): Promise<Buffer> {
  const statesMeta: StatesJson = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'states.json'), 'utf8'));

  // Escalar manteniendo el aspect ratio dentro de targetW x targetH
  const scale = Math.min(targetW / statesMeta.width, targetH / statesMeta.height);
  const scaledW = Math.round(statesMeta.width * scale);
  const scaledH = Math.round(statesMeta.height * scale);
  const offsetX = Math.round((targetW - scaledW) / 2);
  const offsetY = Math.round((targetH - scaledH) / 2);

  const shadowBuf = await sharp(path.join(DATA_DIR, 'map-shadow.webp'))
    .resize(scaledW, scaledH, { kernel: 'lanczos3' })
    .toBuffer();

  const baseBuf = await sharp(path.join(DATA_DIR, 'map-base.png'))
    .resize(scaledW, scaledH, { kernel: 'nearest' })
    .toBuffer();

  const composites: OverlayOptions[] = [
    { input: shadowBuf, left: offsetX, top: offsetY },
    { input: baseBuf, left: offsetX, top: offsetY },
  ];

  if (drawAnchors) {
    const circles = statesMeta.states
      .map((st) => {
        const cx = Math.round(offsetX + st.anchor.x * scale);
        const cy = Math.round(offsetY + st.anchor.y * scale);
        return `
          <circle cx="${cx}" cy="${cy}" r="5" fill="#FF3B9A" stroke="#FFFFFF" stroke-width="1.5" />
          <text x="${cx}" y="${cy - 7}" font-family="monospace" font-size="10" font-weight="bold" fill="#1A1638" text-anchor="middle">${st.id}</text>
        `;
      })
      .join('');

    const svgOverlay = Buffer.from(
      `<svg width="${targetW}" height="${targetH}" xmlns="http://www.w3.org/2000/svg">${circles}</svg>`
    );
    composites.push({ input: svgOverlay, left: 0, top: 0 });
  }

  return sharp({
    create: {
      width: targetW,
      height: targetH,
      channels: 4,
      background: CFG.palette.paperBg,
    },
  })
    .composite(composites)
    .png()
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(REF_PATH)) {
    throw new Error(`No se encontró la imagen de referencia en ${REF_PATH}`);
  }

  const refMeta = await sharp(REF_PATH).metadata();
  const panelW = 900;
  const panelH = Math.round(panelW * ((refMeta.height ?? 1080) / (refMeta.width ?? 1620)));

  const refBuf = await sharp(REF_PATH).resize(panelW, panelH, { fit: 'fill' }).png().toBuffer();
  const procWithAnchors = await renderProceduralPanel(panelW, panelH, true);
  const procClean = await renderProceduralPanel(panelW, panelH, false);

  // Crear panel de superposición (50% referencia + 50% procedural limpio)
  const procHalfAlpha = await sharp(procClean)
    .ensureAlpha(0.55)
    .toBuffer();

  // Usar composite con blend 'over' reduciendo canal alfa del segundo buffer
  const procRaw = await sharp(procClean).ensureAlpha().raw().toBuffer();
  const refRaw = await sharp(refBuf).ensureAlpha().raw().toBuffer();
  const blendRaw = Buffer.alloc(procRaw.length);
  for (let i = 0; i < procRaw.length; i += 4) {
    blendRaw[i] = Math.round(refRaw[i] * 0.45 + procRaw[i] * 0.55);
    blendRaw[i + 1] = Math.round(refRaw[i + 1] * 0.45 + procRaw[i + 1] * 0.55);
    blendRaw[i + 2] = Math.round(refRaw[i + 2] * 0.45 + procRaw[i + 2] * 0.55);
    blendRaw[i + 3] = 255;
  }
  const overlayBuf = await sharp(blendRaw, { raw: { width: panelW, height: panelH, channels: 4 } })
    .png()
    .toBuffer();

  const headerH = 42;
  const totalW = panelW * 2;
  const totalH = panelH * 2 + headerH * 2;

  const labelsSvg = Buffer.from(`
    <svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${totalW}" height="${headerH}" fill="#1E1B38" />
      <text x="${panelW * 0.5}" y="27" font-family="sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle">1. REFERENCIA (docs/referencias/mockup-mapa.jpeg)</text>
      <text x="${panelW * 1.5}" y="27" font-family="sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle">2. PROCEDURAL LIMPIO (${CFG.gridWidth}x${CFG.gridHeight} vóxeles, scale ${CFG.pixelScale}x)</text>

      <rect x="0" y="${headerH + panelH}" width="${totalW}" height="${headerH}" fill="#1E1B38" />
      <text x="${panelW * 0.5}" y="${headerH + panelH + 27}" font-family="sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle">3. SUPERPOSICIÓN 50/50 (Calibración de Silueta e Islas)</text>
      <text x="${panelW * 1.5}" y="${headerH + panelH + 27}" font-family="sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle">4. PROCEDURAL + 32 ANCLAS DE DALIA (Polylabel)</text>
    </svg>
  `);

  await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: '#1E1B38',
    },
  })
    .composite([
      { input: labelsSvg, left: 0, top: 0 },
      { input: refBuf, left: 0, top: headerH },
      { input: procClean, left: panelW, top: headerH },
      { input: overlayBuf, left: 0, top: headerH * 2 + panelH },
      { input: procWithAnchors, left: panelW, top: headerH * 2 + panelH },
    ])
    .png({ compressionLevel: 8 })
    .toFile(OUT_PATH);

  console.log(`✓ Comparación generada en: ${OUT_PATH} (${totalW}×${totalH} px)`);
  void procHalfAlpha;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
