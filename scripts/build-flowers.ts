/**
 * scripts/build-flowers.ts — Extracción, limpieza alfa, sombra de contacto y horneado de dalias voxel 3D (Hito H4 - Etapa 1).
 *
 * Fuente oficial: `docs/referencias/dalias-isometricas.png`
 *
 * Proceso:
 *   1. Segmenta automáticamente las 3 dalias isométricas (Chica, Mediana, Grande) de la lámina fuente.
 *   2. Elimina el fondo blanco (#FFFFFF) con des-halado de color (color decontamination) para evitar bordes grises/blancos.
 *   3. Convierte la sombra de reflejo inferior sobre blanco en la sombra de contacto oscura translúcida (#1E1552)
 *      que proyectan las flores sobre los estados en `docs/referencias/mockup-mapa.jpeg`.
 *   4. Escala cada dalia a la proporción exacta del mapa (`map-base.png` 660×435 px) y exporta PNGs optimizados.
 *   5. Genera la lámina comparativa `docs/preview-flowers.png` contra `docs/referencias/mockup-mapa.jpeg`.
 *
 * Uso: pnpm build-flowers
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import sharp, { type OverlayOptions } from 'sharp';
import { ISO_MAP_CONFIG as CFG } from '../config/iso';

const ROOT = path.resolve(__dirname, '..');
const SOURCE_PATH = path.join(ROOT, 'docs/referencias/dalia-flor-mock2.png');
const MOCK_PATH = path.join(ROOT, 'docs/referencias/mockup-mapa.jpeg');
const OUT_DIR = path.join(ROOT, 'apps/web/public/flowers');
const DATA_DIR = path.join(ROOT, 'apps/web/public/data');
const PREVIEW_PATH = path.join(ROOT, 'docs/preview-flowers.png');

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

interface ProcessedFlower {
  level: 1 | 2 | 3;
  name: string;
  targetWidth: number;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  pngBuffer: Buffer;
}

const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

/**
 * Encuentra las 3 regiones horizontales (islas de píxeles no blancos) en la imagen fuente.
 */
function findFlowerBoxes(raw: Buffer, imgW: number, imgH: number): BoundingBox[] {
  // Un píxel pertenece a la flor sólida (no fondo ni sombra muy tenue) si tiene saturación o no es blanco puro
  const isFlowerPixel = (x: number, y: number): boolean => {
    const idx = (y * imgW + x) * 4;
    const r = raw[idx];
    const g = raw[idx + 1];
    const b = raw[idx + 2];
    // Las flores son rosas/magentas/naranjas: el canal verde o azul cae notablemente respecto a 255
    const minCh = Math.min(r, g, b);
    const maxCh = Math.max(r, g, b);
    const sat = maxCh - minCh;
    return minCh < 235 && (sat > 18 || maxCh < 220);
  };

  // Proyección horizontal por columnas para separar las 3 flores
  const colHasPixel = new Uint8Array(imgW);
  for (let x = 0; x < imgW; x++) {
    for (let y = 0; y < imgH; y++) {
      if (isFlowerPixel(x, y)) {
        colHasPixel[x] = 1;
        break;
      }
    }
  }

  const xRanges: [number, number][] = [];
  let inRun = false;
  let startX = 0;
  for (let x = 0; x < imgW; x++) {
    if (colHasPixel[x] && !inRun) {
      inRun = true;
      startX = x;
    } else if (!colHasPixel[x] && inRun) {
      if (x - startX > 20) {
        xRanges.push([startX, x - 1]);
      }
      inRun = false;
    }
  }
  if (inRun && imgW - startX > 20) {
    xRanges.push([startX, imgW - 1]);
  }

  if (xRanges.length !== 3) {
    throw new Error(`Se esperaban 3 dalias en ${SOURCE_PATH}, pero se detectaron ${xRanges.length} segmentos.`);
  }

  return xRanges.map(([x0, x1]) => {
    let minY = imgH;
    let maxY = 0;
    let minX = x1;
    let maxX = x0;
    for (let y = 0; y < imgH; y++) {
      for (let x = x0; x <= x1; x++) {
        if (isFlowerPixel(x, y)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    // Agregar margen inferior y lateral para conservar e integrar la sombra de contacto
    const padX = Math.round((maxX - minX) * 0.08);
    const padTop = Math.round((maxY - minY) * 0.05);
    const padBottom = Math.round((maxY - minY) * 0.16);

    const bx0 = Math.max(0, minX - padX);
    const bx1 = Math.min(imgW - 1, maxX + padX);
    const by0 = Math.max(0, minY - padTop);
    const by1 = Math.min(imgH - 1, maxY + padBottom);

    return {
      minX: bx0,
      minY: by0,
      maxX: bx1,
      maxY: by1,
      width: bx1 - bx0 + 1,
      height: by1 - by0 + 1,
    };
  });
}

/**
 * Extrae una dalia del buffer fuente, remueve el fondo blanco sin dejar halo claro
 * y añade una sombra de contacto suave color índigo oscuro en la base inferior.
 */
function extractAndCleanFlower(
  raw: Buffer,
  imgW: number,
  box: BoundingBox
): { rgba: Buffer; width: number; height: number } {
  const { minX, minY, width, height } = box;
  const out = Buffer.alloc(width * height * 4, 0);

  // Color de la sombra de contacto sobre el mapa (#1E1554)
  const shR = 30;
  const shG = 21;
  const shB = 84;

  // Paso 1: Clasificar píxeles de la flor y eliminar fondo blanco des-contaminando bordes
  const solidMask = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = ((minY + y) * imgW + (minX + x)) * 4;
      const r = raw[srcIdx];
      const g = raw[srcIdx + 1];
      const b = raw[srcIdx + 2];

      const maxCh = Math.max(r, g, b);
      const minCh = Math.min(r, g, b);
      const sat = maxCh - minCh;
      const whiteness = minCh / 255; // 1.0 = blanco puro

      const dstIdx = (y * width + x) * 4;

      // Si el píxel tiene saturación cromática (rosa/magenta/naranja) es parte del cuerpo de la flor
      if (sat >= 22 || (r > g + 18 && g < 238)) {
        // Calcular opacidad quitando la contribución del fondo blanco en píxeles de borde (anti-aliasing)
        let alpha = 1.0;
        if (minCh > 195 && sat < 65) {
          // Borde suavizado contra blanco: estimar alfa por distancia al blanco (250, 250, 250)
          const distFromWhite = Math.sqrt(
            (252 - r) * (252 - r) + (252 - g) * (252 - g) + (252 - b) * (252 - b)
          );
          alpha = Math.min(1, Math.max(0, (distFromWhite - 10) / 55));
        }

        if (alpha > 0.05) {
          // Des-contaminar el blanco del borde (unpremultiply white) para que el borde conserve su rosa puro
          const cleanFactor = Math.max(0.35, alpha);
          const cr = clampByte(255 - (255 - r) / cleanFactor);
          const cg = clampByte(255 - (255 - g) / cleanFactor);
          const cb = clampByte(255 - (255 - b) / cleanFactor);

          out[dstIdx] = cr;
          out[dstIdx + 1] = cg;
          out[dstIdx + 2] = cb;
          out[dstIdx + 3] = clampByte(alpha * 255);
          if (alpha > 0.5) solidMask[y * width + x] = 1;
        }
      } else if (whiteness < 0.965 && y > height * 0.45) {
        // Sombra / reflejo original debajo de la flor sobre el fondo blanco -> convertir a sombra índigo oscura
        const darkness = 1 - (r + g + b) / (3 * 250);
        const shAlpha = Math.min(0.65, Math.max(0, (darkness - 0.018) * 6.5));
        if (shAlpha > 0.02) {
          out[dstIdx] = shR;
          out[dstIdx + 1] = shG;
          out[dstIdx + 2] = shB;
          out[dstIdx + 3] = clampByte(shAlpha * 255);
        }
      }
    }
  }

  // Paso 2: Reforzar la sombra de contacto debajo de la mitad inferior de la flor
  // (en mockup-mapa.jpeg cada flor proyecta una sombra morada oscura ~6-10% hacia abajo)
  const shadowOffsetY = Math.round(height * 0.075);
  const shadowBuffer = Buffer.alloc(width * height * 4, 0);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sy = y - shadowOffsetY;
      if (sy >= Math.floor(height * 0.32) && sy < height) {
        if (solidMask[sy * width + x]) {
          const sIdx = (y * width + x) * 4;
          shadowBuffer[sIdx] = shR;
          shadowBuffer[sIdx + 1] = shG;
          shadowBuffer[sIdx + 2] = shB;
          shadowBuffer[sIdx + 3] = 125;
        }
      }
    }
  }

  // Combinar la sombra proyectada detrás de la flor limpia
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const fgA = out[idx + 3] / 255;
    const bgA = shadowBuffer[idx + 3] / 255;
    if (bgA > 0 && fgA < 1) {
      const outA = fgA + bgA * (1 - fgA);
      out[idx] = clampByte((out[idx] * fgA + shadowBuffer[idx] * bgA * (1 - fgA)) / outA);
      out[idx + 1] = clampByte((out[idx + 1] * fgA + shadowBuffer[idx + 1] * bgA * (1 - fgA)) / outA);
      out[idx + 2] = clampByte((out[idx + 2] * fgA + shadowBuffer[idx + 2] * bgA * (1 - fgA)) / outA);
      out[idx + 3] = clampByte(outA * 255);
    }
  }

  return { rgba: out, width, height };
}

/**
 * Recorta el rectángulo mínimo no transparente de un buffer RGBA.
 */
function trimTransparent(rgba: Buffer, width: number, height: number, pad = 1) {
  let minX = width,
    minY = height,
    maxX = 0,
    maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (rgba[(y * width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  const tw = maxX - minX + 1;
  const th = maxY - minY + 1;
  const trimmed = Buffer.alloc(tw * th * 4);
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const src = ((minY + y) * width + (minX + x)) * 4;
      const dst = (y * tw + x) * 4;
      trimmed[dst] = rgba[src];
      trimmed[dst + 1] = rgba[src + 1];
      trimmed[dst + 2] = rgba[src + 2];
      trimmed[dst + 3] = rgba[src + 3];
    }
  }
  return { rgba: trimmed, width: tw, height: th };
}

async function buildPreviewComparison(flowers: ProcessedFlower[]) {
  const statesMeta = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'states.json'), 'utf8'));
  const mapW: number = statesMeta.width;
  const mapH: number = statesMeta.height;

  const panelW = 860;
  const panelH = Math.round(panelW * (mapH / mapW));
  const mapScale = panelW / mapW;

  const shadowBuf = await sharp(path.join(DATA_DIR, 'map-shadow.webp'))
    .resize(panelW, panelH, { kernel: 'lanczos3' })
    .toBuffer();
  const baseBuf = await sharp(path.join(DATA_DIR, 'map-base.png'))
    .resize(panelW, panelH, { kernel: 'nearest' })
    .toBuffer();

  // Niveles exactos que aparecen en docs/referencias/mockup-mapa.jpeg (17 estados con flor)
  const sampleLevels: Record<string, 1 | 2 | 3> = {
    '02': 1, // Baja California
    '03': 1, // Baja California Sur
    '25': 1, // Sinaloa
    '26': 1, // Sonora
    '08': 3, // Chihuahua
    '10': 1, // Durango
    '19': 3, // Nuevo León / Coahuila
    '32': 3, // Zacatecas / Jalisco
    '06': 1, // Colima / Michoacán costa
    '12': 3, // Guerrero
    '24': 1, // San Luis Potosí / Querétaro
    '28': 1, // Tamaulipas
    '30': 2, // Veracruz
    '20': 2, // Oaxaca
    '07': 1, // Chiapas
    '04': 1, // Campeche
    '31': 2, // Yucatán / Quintana Roo
  };

  const activeStates = [...statesMeta.states]
    .filter((st: { id: string }) => sampleLevels[st.id] !== undefined)
    .sort((a: { anchor: { y: number } }, b: { anchor: { y: number } }) => a.anchor.y - b.anchor.y);

  const mapComposites: OverlayOptions[] = [
    { input: shadowBuf, left: 0, top: 0 },
    { input: baseBuf, left: 0, top: 0 },
  ];

  // Los sprites están a 2x respecto al lienzo de 660x435, por lo que su tamaño en el panel es (width * 0.5 * mapScale)
  for (const st of activeStates) {
    const lvl = sampleLevels[st.id];
    const fl = flowers.find((f) => f.level === lvl)!;
    const drawW = Math.round(fl.width * 0.5 * mapScale);
    const drawH = Math.round(fl.height * 0.5 * mapScale);
    const scaledFl = await sharp(fl.pngBuffer)
      .resize(drawW, drawH, { kernel: 'lanczos3' })
      .toBuffer();
    mapComposites.push({
      input: scaledFl,
      left: Math.round(st.anchor.x * mapScale - drawW * 0.5),
      top: Math.round(st.anchor.y * mapScale - drawH * 0.58),
    });
  }

  const procPanel = await sharp({
    create: {
      width: panelW,
      height: panelH,
      channels: 4,
      background: CFG.palette.paperBg,
    },
  })
    .composite(mapComposites)
    .png()
    .toBuffer();

  const mockPanel = await sharp(MOCK_PATH)
    .resize(panelW, panelH, { fit: 'fill' })
    .png()
    .toBuffer();

  const headerH = 220;
  const totalW = panelW * 2;
  const totalH = headerH + panelH;

  // Mostrar los 3 sprites recortados sobre el fondo morado del mapa en la barra superior
  const cardCenters = [320, 860, 1400];
  const spriteOverlays: OverlayOptions[] = [];

  for (let i = 0; i < flowers.length; i++) {
    const fl = flowers[i];
    const displayScale = 1.45;
    const sw = Math.round(fl.width * displayScale);
    const sh = Math.round(fl.height * displayScale);
    const scaledSprite = await sharp(fl.pngBuffer)
      .resize(sw, sh, { kernel: 'lanczos3' })
      .toBuffer();
    spriteOverlays.push({
      input: scaledSprite,
      left: Math.round(cardCenters[i] - sw / 2),
      top: Math.round(115 - sh / 2),
    });
  }

  const headerSvg = Buffer.from(`
    <svg width="${totalW}" height="${headerH}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${totalW}" height="${headerH}" fill="#221D42" />
      <text x="${totalW / 2}" y="28" font-family="sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
        HITO H4 (ETAPA 1) — DALIAS EXTRAÍDAS DE dalias-isometricas.png Y COMPARACIÓN CON MOCKUP
      </text>
      <rect x="190" y="42" width="260" height="145" rx="12" fill="#6867E9" stroke="#B4B2FF" stroke-width="2" />
      <text x="320" y="206" font-family="monospace" font-size="13" font-weight="bold" fill="#FFE066" text-anchor="middle">
        dahlia-1.png (${flowers[0].width}x${flowers[0].height} px)
      </text>
      <rect x="730" y="42" width="260" height="145" rx="12" fill="#6867E9" stroke="#B4B2FF" stroke-width="2" />
      <text x="860" y="206" font-family="monospace" font-size="13" font-weight="bold" fill="#FFE066" text-anchor="middle">
        dahlia-2.png (${flowers[1].width}x${flowers[1].height} px)
      </text>
      <rect x="1270" y="42" width="260" height="145" rx="12" fill="#6867E9" stroke="#B4B2FF" stroke-width="2" />
      <text x="1400" y="206" font-family="monospace" font-size="13" font-weight="bold" fill="#FFE066" text-anchor="middle">
        dahlia-3.png (${flowers[2].width}x${flowers[2].height} px)
      </text>
    </svg>
  `);

  await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: CFG.palette.paperBg,
    },
  })
    .composite([
      { input: headerSvg, left: 0, top: 0 },
      ...spriteOverlays,
      { input: mockPanel, left: 0, top: headerH },
      { input: procPanel, left: panelW, top: headerH },
    ])
    .png({ compressionLevel: 8 })
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

  const boxes = findFlowerBoxes(rawSource, info.width, info.height);

  // Dimensiones de los sprites (2x la resolución lógica del mapa de 660x435 para conservar cada arista de los cubos nítida)
  // Nivel 1 (Chica): 36 px (~18 px en el mapa)
  // Nivel 2 (Mediana): 54 px (~27 px en el mapa)
  // Nivel 3 (Grande): 76 px (~38 px en el mapa)
  const targetWidths: [number, number, number] = [36, 54, 76];
  const processed: ProcessedFlower[] = [];

  console.log(`\nExtrayendo y horneando 3 dalias desde ${path.relative(ROOT, SOURCE_PATH)} (${info.width}×${info.height} px)...\n`);
  console.log('Archivo          Caja Fuente       Salida (px)   Ancla (x,y)    Crudo     Gzip   Brotli');

  for (let i = 0; i < 3; i++) {
    const level = (i + 1) as 1 | 2 | 3;
    const name = `dahlia-${level}.png`;
    const box = boxes[i];

    const cleaned = extractAndCleanFlower(rawSource, info.width, box);
    const trimmed = trimTransparent(cleaned.rgba, cleaned.width, cleaned.height, 1);

    const targetW = targetWidths[i];
    const targetH = Math.round(targetW * (trimmed.height / trimmed.width));

    // Redimensionar con kernel lanczos3 para preservar los degradados limpios de las caras isométricas
    // y cuantizar con paleta de 128 colores sin pérdida
    const pngBuffer = await sharp(trimmed.rgba, {
      raw: { width: trimmed.width, height: trimmed.height, channels: 4 },
    })
      .resize(targetW, targetH, { kernel: 'lanczos3' })
      .png({ palette: true, colours: 128, quality: 100, effort: 10, compressionLevel: 9 })
      .toBuffer();

    const outPath = path.join(OUT_DIR, name);
    fs.writeFileSync(outPath, pngBuffer);

    const anchorX = Math.round(targetW * 0.5);
    const anchorY = Math.round(targetH * 0.58);

    processed.push({
      level,
      name,
      targetWidth: targetW,
      width: targetW,
      height: targetH,
      anchorX,
      anchorY,
      pngBuffer,
    });

    const gz = zlib.gzipSync(pngBuffer, { level: 9 }).length;
    const br = zlib.brotliCompressSync(pngBuffer).length;
    const srcStr = `${box.width}×${box.height}`.padEnd(17);
    const outStr = `${targetW}×${targetH} px`.padEnd(13);
    const ancStr = `(${anchorX}, ${anchorY})`.padEnd(12);

    console.log(
      `${name.padEnd(16)} ${srcStr} ${outStr} ${ancStr} ${(pngBuffer.length / 1024).toFixed(2).padStart(5)} KB ${(gz / 1024).toFixed(2).padStart(5)} KB ${(br / 1024).toFixed(2).padStart(5)} KB`
    );

    if (pngBuffer.length > 10 * 1024) {
      throw new Error(`${name} supera el presupuesto de 10 KB (${pngBuffer.length} bytes).`);
    }
  }

  await buildPreviewComparison(processed);
  console.log(`\n✓ Comparación lado a lado generada en: ${PREVIEW_PATH}`);
  console.log(`✓ Etapa 1 completada en ${Date.now() - t0} ms.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
