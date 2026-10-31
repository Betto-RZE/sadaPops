/**
 * scripts/build-petals.ts — Extracción, recorte y horneado de los 12 pétalos pixel art (Hito H4 - Etapa 2).
 *
 * Fuente oficial: `docs/referencias/petalos.png`
 * La imagen ya contiene la matriz 3x4 perfecta:
 *   - Fila 1: Nivel 1 (Chico)     -> r0, r1, r2, r3
 *   - Fila 2: Nivel 2 (Mediano)   -> r0, r1, r2, r3
 *   - Fila 3: Nivel 3 (Grande)    -> r0, r1, r2, r3
 *
 * Salidas:
 *   - apps/web/public/petals/petal-{1..3}-r{0..3}.png (12 sprites de ~14x24 a 28x46 px)
 *   - docs/preview-petals.png (Lámina comparativa de los sprites extraídos)
 *
 * Uso: pnpm build-petals
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import sharp from 'sharp';

const ROOT = path.resolve(__dirname, '..');
const SOURCE_PATH = path.join(ROOT, 'docs/referencias/petalos.png');
const OUT_DIR = path.join(ROOT, 'apps/web/public/petals');
const PREVIEW_PATH = path.join(ROOT, 'docs/preview-petals.png');

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

/**
 * Segmenta la matriz de 3 filas x 4 columnas de pétalos en docs/referencias/petalos.png
 */
function findPetalBoxes(raw: Buffer, imgW: number, imgH: number): BoundingBox[][] {
  const isPetalPixel = (x: number, y: number): boolean => {
    const idx = (y * imgW + x) * 4;
    const r = raw[idx];
    const g = raw[idx + 1];
    const b = raw[idx + 2];
    // Píxel magenta/rosa del pétalo
    return r > 110 && r > g + 40;
  };

  // Coordenadas Y de separación entre las 3 filas en petalos.png (1024px de alto total)
  // Fila 0: y in [0 .. 280]
  // Fila 1: y in [280 .. 600]
  // Fila 2: y in [600 .. 1024]
  const rowBounds: [number, number][] = [
    [0, 280],
    [280, 600],
    [600, imgH],
  ];

  // Coordenadas X de separación entre las 4 columnas (1536px de ancho total)
  // Col 0: x in [0 .. 360]
  // Col 1: x in [360 .. 760]
  // Col 2: x in [760 .. 1040]
  // Col 3: x in [1040 .. 1536]
  const colBounds: [number, number][] = [
    [0, 360],
    [360, 760],
    [760, 1040],
    [1040, imgW],
  ];

  const grid: BoundingBox[][] = [];

  for (let row = 0; row < 3; row++) {
    const rowBoxes: BoundingBox[] = [];
    const [yStart, yEnd] = rowBounds[row];

    for (let col = 0; col < 4; col++) {
      const [xStart, xEnd] = colBounds[col];

      let minX = xEnd, maxX = xStart, minY = yEnd, maxY = yStart;
      let found = false;

      for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
          if (isPetalPixel(x, y)) {
            found = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (!found) {
        throw new Error(`No se encontró pétalo en celda [fila ${row}, col ${col}]`);
      }

      // 1px de margen
      minX = Math.max(0, minX - 1);
      minY = Math.max(0, minY - 1);
      maxX = Math.min(imgW - 1, maxX + 1);
      maxY = Math.min(imgH - 1, maxY + 1);

      rowBoxes.push({
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
      });
    }
    grid.push(rowBoxes);
  }

  return grid;
}

/**
 * Extrae un pétalo individual removiendo el fondo oscuro mediante alpha-matting
 */
function extractCleanPetal(raw: Buffer, imgW: number, box: BoundingBox): { rgba: Buffer; width: number; height: number } {
  const { minX, minY, width, height } = box;
  const out = Buffer.alloc(width * height * 4, 0);

  // Muestra de color de fondo azul oscuro
  const bgR = 26;
  const bgG = 22;
  const bgB = 43;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = ((minY + y) * imgW + (minX + x)) * 4;
      const r = raw[srcIdx];
      const g = raw[srcIdx + 1];
      const b = raw[srcIdx + 2];

      const dstIdx = (y * width + x) * 4;

      // Un píxel pertenece al pétalo si su tono es predominantemente magenta/rosa
      const isPink = r > 90 && (r > g + 35);
      if (isPink) {
        // Estimar canal alfa quitando la contribución del fondo oscuro en los bordes
        let alpha = 1.0;
        if (r < 170) {
          alpha = Math.min(1.0, Math.max(0.0, (r - bgR) / 130));
        }

        if (alpha > 0.08) {
          // Des-contaminar el fondo oscuro (unpremultiply dark background)
          const cr = clampByte((r - bgR * (1 - alpha)) / alpha);
          const cg = clampByte((g - bgG * (1 - alpha)) / alpha);
          const cb = clampByte((b - bgB * (1 - alpha)) / alpha);

          out[dstIdx] = cr;
          out[dstIdx + 1] = cg;
          out[dstIdx + 2] = cb;
          out[dstIdx + 3] = clampByte(alpha * 255);
        }
      }
    }
  }

  return { rgba: out, width, height };
}

/**
 * Escala un pétalo preservando la nitidez de pixel art al tamaño proporcional del Hero
 */
async function scaleAndBakePetal(
  rgba: Buffer,
  w: number,
  h: number,
  shape: 1 | 2 | 3
): Promise<{ buffer: Buffer; width: number; height: number }> {
  // Proporción uniforme para los 3 tamaños (~14% del tamaño original en petalos.png)
  // - shape 1 (chico):   ~15 x 24 px
  // - shape 2 (mediano): ~20 x 30 px
  // - shape 3 (grande):  ~26 x 38 px
  const scale = 0.145;
  const targetW = Math.max(6, Math.round(w * scale));
  const targetH = Math.max(6, Math.round(h * scale));

  const buffer = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .resize(targetW, targetH, { kernel: 'lanczos3' })
    .png({ palette: true, colours: 16, effort: 10, compressionLevel: 9 })
    .toBuffer();

  return { buffer, width: targetW, height: targetH };
}

async function buildPreviewSheet(generated: { name: string; buffer: Buffer; width: number; height: number }[]) {
  const cellW = 105;
  const cellH = 100;
  const totalW = cellW * 4 + 40;
  const totalH = cellH * 3 + 120;

  const composites: sharp.OverlayOptions[] = [];

  const headerSvg = Buffer.from(`
    <svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${totalW}" height="${totalH}" fill="#221D42" />
      <text x="${totalW / 2}" y="32" font-family="sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
        HITO H4 (ETAPA 2) — 12 PÉTALOS EXTRAÍDOS DE petalos.png
      </text>
      <text x="${20 + cellW * 0.5}" y="65" font-family="monospace" font-size="12" fill="#FFE066" text-anchor="middle">r0 (Vertical)</text>
      <text x="${20 + cellW * 1.5}" y="65" font-family="monospace" font-size="12" fill="#FFE066" text-anchor="middle">r1 (Horizontal)</text>
      <text x="${20 + cellW * 2.5}" y="65" font-family="monospace" font-size="12" fill="#FFE066" text-anchor="middle">r2 (Invertido)</text>
      <text x="${20 + cellW * 3.5}" y="65" font-family="monospace" font-size="12" fill="#FFE066" text-anchor="middle">r3 (Inclinado)</text>
    </svg>
  `);
  composites.push({ input: headerSvg, left: 0, top: 0 });

  let idx = 0;
  for (let shape = 1; shape <= 3; shape++) {
    for (let r = 0; r <= 3; r++) {
      const item = generated[idx++];
      const cx = 20 + r * cellW + cellW / 2;
      const cy = 80 + (shape - 1) * cellH + cellH / 2;

      // Escalar 1.5x para previsualización nítida y separada
      const displayW = Math.round(item.width * 1.5);
      const displayH = Math.round(item.height * 1.5);
      const scaled = await sharp(item.buffer)
        .resize(displayW, displayH, { kernel: 'nearest' })
        .toBuffer();

      composites.push({
        input: scaled,
        left: Math.round(cx - displayW / 2),
        top: Math.round(cy - displayH / 2),
      });
    }
  }

  await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: '#221D42',
    },
  })
    .composite(composites)
    .png()
    .toFile(PREVIEW_PATH);
}

async function main() {
  const t0 = Date.now();
  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error(`No existe el archivo fuente: ${SOURCE_PATH}`);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const { data: rawSource, info } = await sharp(SOURCE_PATH)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const grid = findPetalBoxes(rawSource, info.width, info.height);
  const generated: { name: string; buffer: Buffer; width: number; height: number }[] = [];

  console.log(`\nExtrayendo y horneando 12 pétalos desde ${path.relative(ROOT, SOURCE_PATH)}...\n`);
  console.log('Archivo                Dimensiones   Crudo     Gzip   Brotli');

  for (let shape = 1; shape <= 3; shape++) {
    const rowBoxes = grid[shape - 1];
    for (let rot = 0; rot <= 3; rot++) {
      const box = rowBoxes[rot];
      const cleaned = extractCleanPetal(rawSource, info.width, box);
      const baked = await scaleAndBakePetal(cleaned.rgba, cleaned.width, cleaned.height, shape as 1 | 2 | 3);

      const name = `petal-${shape}-r${rot}.png`;
      const outPath = path.join(OUT_DIR, name);
      fs.writeFileSync(outPath, baked.buffer);

      generated.push({ name, buffer: baked.buffer, width: baked.width, height: baked.height });

      const gz = zlib.gzipSync(baked.buffer, { level: 9 }).length;
      const br = zlib.brotliCompressSync(baked.buffer).length;
      const dimStr = `${baked.width}×${baked.height} px`.padEnd(13);

      console.log(
        `${name.padEnd(22)} ${dimStr} ${(baked.buffer.length / 1024).toFixed(2).padStart(5)} KB ${(gz / 1024).toFixed(2).padStart(5)} KB ${(br / 1024).toFixed(2).padStart(5)} KB`
      );

      if (baked.buffer.length > 2 * 1024) {
        throw new Error(`${name} supera el presupuesto de 2 KB (${baked.buffer.length} bytes).`);
      }
    }
  }

  await buildPreviewSheet(generated);
  console.log(`\n✓ Vista previa de pétalos generada en: ${PREVIEW_PATH}`);
  console.log(`✓ 12 pétalos extraídos y horneados en ${Date.now() - t0} ms dentro de ${OUT_DIR}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
