'use client';

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
} from 'react';
import { useMapData } from './useMapData';
import type {
  PixelMapProps,
  PixelMapAnchorProps,
  PixelMapContextValue,
} from './types';
import { cn } from '../../shared/utils';

// Constantes globales de sincronización de la secuencia de entrada (Hito H6)
// Sincronizado: el mapa se materializa suave a los 1.55s y la oleada arranca a los 1.85s a la par del gris
export const MAP_INTRO_DELAY_MS = 1850;     // Instante en que arranca la oleada (exacto al inicio del fade a gris)
export const MAP_INTRO_STAGGER_MS = 780;    // Ventana amplia para que los 32 estados caigan en oleada visible uno a uno
export const MAP_STATE_ANIM_MS = 620;       // Duración física con peso real, impacto y micro-rebote claro

// Contexto para compartir metadatos y estado activo con componentes hijos (como PixelMapAnchor)
const PixelMapContext = createContext<PixelMapContextValue | null>(null);

export function usePixelMapContext(): PixelMapContextValue {
  const ctx = useContext(PixelMapContext);
  if (!ctx) {
    throw new Error('usePixelMapContext debe usarse dentro de un <PixelMap>');
  }
  return ctx;
}

/**
 * PixelMapAnchor: Posiciona automáticamente cualquier elemento (dalia, medalla, tooltip)
 * sobre las coordenadas ancla exactas del estado federativo indicado.
 *
 * Se eleva automáticamente en sincronía con el estado (mini-pop 3D de 6px).
 */
export function PixelMapAnchor({
  stateId,
  className,
  children,
}: PixelMapAnchorProps) {
  const { data, selectedStateId, hoveredStateId } = usePixelMapContext();
  if (!data) return null;

  const state = data.stateById.get(stateId);
  if (!state) return null;

  const leftPercent = (state.anchor.x / data.width) * 100;
  const topPercent = (state.anchor.y / data.height) * 100;

  // Elevación sincronizada: sube 6px cuando el estado está activo (hover o seleccionado)
  const isElevated = hoveredStateId === stateId || (!hoveredStateId && selectedStateId === stateId);
  const liftPx = ELEVATION_VOXELS * data.pixelScale;

  // Ordenamiento en eje Z por coordenada Y (las flores más al sur se renderizan al frente)
  const zDepth = 20 + Math.round(state.anchor.y);

  return (
    <div
      data-state-id={stateId}
      className={cn(
        'absolute pointer-events-none transition-transform duration-150 ease-out',
        className
      )}
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        zIndex: isElevated ? zDepth + 500 : zDepth,
        transform: isElevated
          ? `translate(-50%, calc(-50% - ${liftPx}px))`
          : 'translate(-50%, -50%)',
      }}
    >
      {children}
    </div>
  );
}

// Conjunto de numIds de estados con superficie reducida para asistencia táctil
const SMALL_STATE_NUM_IDS = new Set<number>([
  1,  // Aguascalientes
  6,  // Colima
  9,  // Ciudad de México
  17, // Morelos
  29, // Tlaxcala
]);

/** Convierte un color hexadecimal #RRGGBB a entero Uint32 little-endian (AABBGGRR) */
function hexToU32(hex: string, alpha = 255): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (((alpha << 24) | (b << 16) | (g << 8) | r) >>> 0);
}

/** Incrementa el brillo de un pixel Uint32 (AABBGGRR) manteniendo 100% de opacidad */
function brightenU32(u32: number, delta: number): number {
  const r = Math.min(255, Math.max(0, (u32 & 0xff) + delta));
  const g = Math.min(255, Math.max(0, ((u32 >> 8) & 0xff) + delta));
  const b = Math.min(255, Math.max(0, ((u32 >> 16) & 0xff) + delta));
  return (((255 << 24) | (b << 16) | (g << 8) | r) >>> 0);
}

/**
 * Entinta un pixel Uint32 hacia la luz lavanda/índigo claro de selección (Hito H5)
 * preservando sus biseles. Es el mismo tono del cono de luz que proyecta el estado ampliado.
 */
function tintSelectU32(u32: number): number {
  const r0 = u32 & 0xff;
  const g0 = (u32 >> 8) & 0xff;
  const b0 = (u32 >> 16) & 0xff;
  const lumDelta = Math.round((r0 - 105) * 0.45 + (g0 - 103) * 0.45 + (b0 - 234) * 0.2);
  const r = Math.min(255, Math.max(0, 168 + lumDelta));
  const g = Math.min(255, Math.max(0, 166 + Math.round(lumDelta * 0.95)));
  const b = Math.min(255, Math.max(0, 255 + Math.round(lumDelta * 0.5)));
  return (((255 << 24) | (b << 16) | (g << 8) | r) >>> 0);
}

// Paletas de acantilados 3D para estados elevados
const INTRO_CLIFF = {
  light: hexToU32('#5E4EC8'),
  mid: hexToU32('#4738A6'),
  dark: hexToU32('#342687'),
  deep: hexToU32('#231768'),
  rimLip: hexToU32('#8A82E8'),
  rimHighlight: hexToU32('#CEC9FA'),
};

const HOVER_CLIFF = {
  light: hexToU32('#6654D8'),
  mid: hexToU32('#5542C4'),
  dark: hexToU32('#3C2C9E'),
  deep: hexToU32('#27197A'),
  rimLip: hexToU32('#A8A7FF'),
  rimHighlight: hexToU32('#EBE6FF'),
};

// Selección (Hito H5): luz lavanda, un tono más claro que el mapa base (sin rosa;
// la dalia queda como única protagonista magenta)
const SELECT_CLIFF = {
  light: hexToU32('#7A74F0'),
  mid: hexToU32('#5F57D6'),
  dark: hexToU32('#4A40B8'),
  deep: hexToU32('#33288F'),
  rimLip: hexToU32('#B4B2FF'),
  rimHighlight: hexToU32('#F0EEFF'),
};

// Micro-sombra de oclusión y contacto bajo el bloque elevado
const BASE_SHADOW_1 = hexToU32('#1A1638', 85); // 1er pixel debajo (~33% alfa)
const BASE_SHADOW_2 = hexToU32('#1A1638', 40); // 2do pixel debajo (~15% alfa)

// Fondo de papel con sombra para cubrir la huella del acantilado viejo al flotar
const PAPER_SHADOW = hexToU32('#C3C1C8', 255);

/** Elevación vertical en vóxeles al hacer hover o seleccionar (2 vóxeles = 6px a escala 3x) */
export const ELEVATION_VOXELS = 2;

/**
 * Curva física para el aterrizaje de cada pieza:
 * Descenso con peso gravitatorio físico -> impacto seco en 0 -> micro-rebote amortiguado.
 */
function computeDropBounceLiftPx(p: number, startVoxels: number, pixelScale: number): number {
  if (p <= 0) {
    return Math.round(startVoxels * pixelScale);
  }
  if (p >= 1) {
    return 0;
  }

  let voxels = 0;
  if (p <= 0.62) {
    // Descenso con gravedad: inicia suave y acelera hacia el suelo
    const u = p / 0.62;
    const ease = u * u;
    voxels = startVoxels * (1 - ease);
  } else if (p <= 0.88) {
    // Micro-rebote físico visible (~24% de la altura de la pieza)
    const u = (p - 0.62) / 0.26;
    const bounceAmp = Math.min(1.4, Math.max(0.85, startVoxels * 0.24));
    voxels = bounceAmp * Math.sin(u * Math.PI);
  } else {
    // Asentamiento firme en 0
    voxels = 0;
  }

  return Math.max(0, Math.round(voxels * pixelScale));
}

function resolveStateAt(
  lx: number,
  ly: number,
  mapIds: Uint8Array,
  width: number,
  height: number,
  isTouch: boolean,
  activeNumId?: number | null,
  liftPx = 0
): string | null {
  if (lx < 0 || lx >= width || ly < 0 || ly >= height) return null;

  if (activeNumId && liftPx > 0 && ly + liftPx < height) {
    const shiftedCode = mapIds[(ly + liftPx) * width + lx];
    if (shiftedCode === activeNumId) {
      return String(activeNumId).padStart(2, '0');
    }
  }

  let code = mapIds[ly * width + lx];

  if (activeNumId && (code === activeNumId || code === activeNumId + 32)) {
    return String(activeNumId).padStart(2, '0');
  }

  if (code === 0 && isTouch) {
    let closestCode = 0;
    let closestDistSq = Infinity;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = lx + dx;
        const ny = ly + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const c = mapIds[ny * width + nx];
          if (c !== 0) {
            const rawId = c > 32 ? c - 32 : c;
            const distSq = dx * dx + dy * dy;
            const isSmall = SMALL_STATE_NUM_IDS.has(rawId);
            const effectiveDist = isSmall ? distSq * 0.5 : distSq;
            if (effectiveDist < closestDistSq) {
              closestDistSq = effectiveDist;
              closestCode = c;
            }
          }
        }
      }
    }
    code = closestCode;
  } else if (code !== 0 && isTouch) {
    const currentNum = code > 32 ? code - 32 : code;
    if (!SMALL_STATE_NUM_IDS.has(currentNum)) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = lx + dx;
          const ny = ly + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const c = mapIds[ny * width + nx];
            const rawId = c > 32 ? c - 32 : c;
            if (SMALL_STATE_NUM_IDS.has(rawId)) {
              code = c;
              break;
            }
          }
        }
        if (SMALL_STATE_NUM_IDS.has(code > 32 ? code - 32 : code)) break;
      }
    }
  }

  if (code === 0) return null;

  const numId = code > 32 ? code - 32 : code;
  if (numId >= 1 && numId <= 32) {
    return String(numId).padStart(2, '0');
  }
  return null;
}

/**
 * PixelMap: Componente interactivo multicapa para el mapa isométrico pixel art de México (Hito H2 + H6).
 */
export function PixelMap({
  selectedStateId = null,
  hoveredStateId: controlledHoveredId,
  onSelectState,
  onHoverState,
  // `showTooltip` se conserva por compatibilidad de API; el tooltip de debug se retiró en H5.
  showTooltip: _showTooltip = false,
  className,
  children,
}: PixelMapProps) {
  const { data, loading, error } = useMapData();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Buffer persistente para renderizado de alta velocidad sin recolección de basura
  const bufferRef = useRef<{
    imgData: ImageData;
    u32: Uint32Array;
    prevDrawnIndices: number[];
    liftedMask: Uint8Array;
  } | null>(null);

  // Estado para controlar cuando los 32 estados ya terminaron de aterrizar
  const [introDone, setIntroDone] = useState(false);

  // Estado local para hover cuando el componente no está completamente controlado
  const [internalHoveredId, setInternalHoveredId] = useState<string | null>(null);
  const currentHoveredId = controlledHoveredId !== undefined ? controlledHoveredId : internalHoveredId;

  const width = data?.width ?? 660;
  const height = data?.height ?? 435;
  const aspectRatio = `${width} / ${height}`;

  // Estado activo prioritario (hover tiene prioridad inmediata visual; si no hay hover, muestra el seleccionado)
  const activeStateId = currentHoveredId || selectedStateId;
  const activeState = (data && activeStateId) ? data.stateById.get(activeStateId) : null;

  // Función que pinta un conjunto de estados en el canvas con su elevación `liftPx` (incluso liftPx === 0 durante la intro)
  const renderStatesFrame = useCallback(
    (
      statesToDraw: Array<{
        stateId: string;
        liftPx: number;
        mode: 'intro' | 'hover' | 'select';
      }>,
      isFullIntroFrame = false
    ) => {
      const canvas = canvasRef.current;
      if (!canvas || !data) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: false });
      if (!ctx) return;

      if (
        !bufferRef.current ||
        bufferRef.current.imgData.width !== width ||
        bufferRef.current.imgData.height !== height
      ) {
        const imgData = ctx.createImageData(width, height);
        bufferRef.current = {
          imgData,
          u32: new Uint32Array(imgData.data.buffer),
          prevDrawnIndices: [],
          liftedMask: new Uint8Array(width * height),
        };
      }

      const { imgData, u32, prevDrawnIndices, liftedMask } = bufferRef.current;
      const { mapIds, basePixels, pixelScale } = data;

      let minDirtyX = width;
      let minDirtyY = height;
      let maxDirtyX = -1;
      let maxDirtyY = -1;

      // 1. Limpiar píxeles previamente dibujados
      for (let i = 0; i < prevDrawnIndices.length; i++) {
        const idx = prevDrawnIndices[i];
        u32[idx] = 0;
        const x = idx % width;
        const y = Math.floor(idx / width);
        if (x < minDirtyX) minDirtyX = x;
        if (x > maxDirtyX) maxDirtyX = x;
        if (y < minDirtyY) minDirtyY = y;
        if (y > maxDirtyY) maxDirtyY = y;
      }
      prevDrawnIndices.length = 0;

      const setPixel = (idx: number, color: number) => {
        u32[idx] = color;
        prevDrawnIndices.push(idx);
      };

      // 2. Pintar cada estado en el orden suministrado
      for (let s = 0; s < statesToDraw.length; s++) {
        const { stateId, liftPx: customLiftPx, mode } = statesToDraw[s];
        // En modo normal (no intro), si liftPx es 0 no hace falta sobredibujar map-base.png
        if (!isFullIntroFrame && customLiftPx <= 0) continue;

        const state = data.stateById.get(stateId);
        if (!state) continue;
        const pixelIndex = data.pixelsByNumId.get(state.numId);
        if (!pixelIndex) continue;

        const numId = state.numId;
        const cliffPalette =
          mode === 'select'
            ? SELECT_CLIFF
            : mode === 'hover'
            ? HOVER_CLIFF
            : INTRO_CLIFF;
        const [bboxMinX, bboxMinY, bboxMaxX, bboxMaxY] = state.bbox;

        const expandedMinX = Math.max(0, bboxMinX - pixelScale - 2);
        const expandedMaxX = Math.min(width - 1, bboxMaxX + pixelScale + 2);
        const expandedMinY = Math.max(0, bboxMinY - customLiftPx - 3);
        const expandedMaxY = Math.min(height - 1, bboxMaxY + 4);

        if (expandedMinX < minDirtyX) minDirtyX = expandedMinX;
        if (expandedMaxX > maxDirtyX) maxDirtyX = expandedMaxX;
        if (expandedMinY < minDirtyY) minDirtyY = expandedMinY;
        if (expandedMaxY > maxDirtyY) maxDirtyY = expandedMaxY;

        const top = pixelIndex.topPixels;
        const side = pixelIndex.sidePixels;

        // Si el estado ya aterrizó en 0 durante la intro, copiar directamente sus píxeles originales de map-base.png
        if (customLiftPx === 0) {
          for (let i = 0; i < side.length; i++) {
            const idx = side[i];
            setPixel(idx, basePixels[idx]);
          }
          for (let i = 0; i < top.length; i++) {
            const idx = top[i];
            setPixel(idx, basePixels[idx]);
          }
          continue;
        }

        const touchedMaskIndices: number[] = [];
        for (let i = 0; i < top.length; i++) {
          const idx = top[i];
          const y = Math.floor(idx / width);
          if (y >= customLiftPx) {
            const targetIdx = idx - customLiftPx * width;
            liftedMask[targetIdx] = 1;
            touchedMaskIndices.push(targetIdx);
          }
        }
        for (let i = 0; i < side.length; i++) {
          const idx = side[i];
          const y = Math.floor(idx / width);
          if (y >= customLiftPx) {
            const targetIdx = idx - customLiftPx * width;
            liftedMask[targetIdx] = 1;
            touchedMaskIndices.push(targetIdx);
          }
        }

        // En modo normal (con map-base.png visible debajo), cubrir la huella inferior expuesta
        if (!isFullIntroFrame) {
          for (let i = 0; i < side.length; i++) {
            const idx = side[i];
            if (!liftedMask[idx]) {
              setPixel(idx, PAPER_SHADOW);
            }
          }
        } else {
          // Durante la intro (sin map-base.png debajo), proyectar sombra suave en la huella sobre el papel
          for (let i = 0; i < side.length; i++) {
            const idx = side[i];
            if (!liftedMask[idx]) {
              setPixel(idx, BASE_SHADOW_2);
            }
          }
        }

        // Dibujar acantilado costero/frontal desplazado en (x, y - customLiftPx)
        for (let i = 0; i < side.length; i++) {
          const idx = side[i];
          const x = idx % width;
          const y = Math.floor(idx / width);
          if (y < customLiftPx) continue;

          const orig = basePixels[idx];
          const wallCol =
            mode === 'select'
              ? cliffPalette.dark
              : mode === 'hover'
              ? orig !== 0
                ? brightenU32(orig, 16)
                : cliffPalette.mid
              : orig !== 0
              ? orig
              : cliffPalette.mid;

          const liftedIdx = (y - customLiftPx) * width + x;
          setPixel(liftedIdx, wallCol);

          const belowId = y + 1 < height ? mapIds[(y + 1) * width + x] : 0;
          if (belowId !== numId && belowId !== numId + 32) {
            const shadowY1 = y - customLiftPx + 1;
            if (shadowY1 < height) {
              setPixel(shadowY1 * width + x, BASE_SHADOW_1);
            }
          }
        }

        // Extruir pared vertical de relieve (altura = customLiftPx) en fronteras
        for (let i = 0; i < top.length; i++) {
          const idx = top[i];
          const x = idx % width;
          const y = Math.floor(idx / width);

          const isBottomEdge =
            y + 1 >= height ||
            (mapIds[(y + 1) * width + x] !== numId &&
              mapIds[(y + 1) * width + x] !== numId + 32);
          const isRightEdge =
            x + 1 >= width ||
            (mapIds[y * width + (x + 1)] !== numId &&
              mapIds[y * width + (x + 1)] !== numId + 32);

          if (isBottomEdge) {
            const leftSame = x > 0 && mapIds[y * width + (x - 1)] === numId;
            const rightSame = x + 1 < width && mapIds[y * width + (x + 1)] === numId;
            const isStepCrease = !leftSame || !rightSame;

            const wallColor = isStepCrease ? cliffPalette.deep : cliffPalette.mid;

            for (let d = 1; d <= customLiftPx; d++) {
              const wy = y - customLiftPx + d;
              if (wy >= 0 && wy < height) {
                setPixel(wy * width + x, wallColor);
              }
            }

            if (
              y + 1 < height &&
              mapIds[(y + 1) * width + x] !== numId &&
              mapIds[(y + 1) * width + x] !== numId + 32
            ) {
              setPixel((y + 1) * width + x, BASE_SHADOW_1);
              if (
                y + 2 < height &&
                mapIds[(y + 2) * width + x] !== numId &&
                mapIds[(y + 2) * width + x] !== numId + 32
              ) {
                setPixel((y + 2) * width + x, BASE_SHADOW_2);
              }
            }
          }

          if (isRightEdge && x + 1 < width) {
            for (let d = 1; d <= customLiftPx; d++) {
              const wy = y - customLiftPx + d;
              if (wy >= 0 && wy < height) {
                setPixel(wy * width + x, cliffPalette.deep);
              }
            }
          }
        }

        // Pintar cara superior desplazada en (x, y - customLiftPx)
        for (let i = 0; i < top.length; i++) {
          const idx = top[i];
          const x = idx % width;
          const y = Math.floor(idx / width);
          const ly = y - customLiftPx;
          if (ly < 0) continue;

          const orig = basePixels[idx];
          const isNorthOrWestEdge =
            y === 0 ||
            mapIds[(y - 1) * width + x] !== numId ||
            x === 0 ||
            mapIds[y * width + (x - 1)] !== numId;
          const isSouthOrEastEdge =
            y + 1 >= height ||
            mapIds[(y + 1) * width + x] !== numId ||
            x + 1 >= width ||
            mapIds[y * width + (x + 1)] !== numId;

          let topColor: number;
          if (mode === 'select') {
            if (isNorthOrWestEdge) {
              topColor = cliffPalette.rimHighlight;
            } else if (isSouthOrEastEdge) {
              topColor = cliffPalette.rimLip;
            } else {
              topColor = orig !== 0 ? tintSelectU32(orig) : hexToU32('#A8A6FF');
            }
          } else if (mode === 'hover') {
            if (isNorthOrWestEdge) {
              topColor = cliffPalette.rimHighlight;
            } else if (isSouthOrEastEdge) {
              topColor = cliffPalette.rimLip;
            } else {
              topColor = orig !== 0 ? brightenU32(orig, 26) : hexToU32('#807FF9');
            }
          } else {
            // Modo 'intro': Las caras superiores conservan su violeta original con bisel sutil
            if (isNorthOrWestEdge) {
              topColor = orig !== 0 ? brightenU32(orig, 16) : cliffPalette.rimHighlight;
            } else {
              topColor = orig !== 0 ? orig : hexToU32('#6A5FE0');
            }
          }

          setPixel(ly * width + x, topColor);
        }

        // Contorno luminoso lavanda de 2px alrededor de la silueta activa en el mapa (como en mockup-hover-estado.jpg)
        if (mode === 'hover' || mode === 'select') {
          const glowInner = hexToU32('#F4F2FF', 235);
          const glowOuter = hexToU32('#B4B2FF', 135);
          for (let i = 0; i < touchedMaskIndices.length; i++) {
            const tIdx = touchedMaskIndices[i];
            const tx = tIdx % width;
            const ty = Math.floor(tIdx / width);
            const neighbors = [
              [tx - 1, ty],
              [tx + 1, ty],
              [tx, ty - 1],
              [tx, ty + 1],
            ];
            for (let n = 0; n < 4; n++) {
              const nx = neighbors[n][0];
              const ny = neighbors[n][1];
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = ny * width + nx;
                if (!liftedMask[nIdx]) {
                  setPixel(nIdx, glowInner);
                  const nx2 = nx + (nx - tx);
                  const ny2 = ny + (ny - ty);
                  if (nx2 >= 0 && nx2 < width && ny2 >= 0 && ny2 < height) {
                    const nIdx2 = ny2 * width + nx2;
                    if (!liftedMask[nIdx2] && u32[nIdx2] !== glowInner) {
                      setPixel(nIdx2, glowOuter);
                    }
                  }
                }
              }
            }
          }
        }

        for (let i = 0; i < touchedMaskIndices.length; i++) {
          liftedMask[touchedMaskIndices[i]] = 0;
        }
      }

      // 3. Volcar al canvas la región modificada
      if (minDirtyX <= maxDirtyX && minDirtyY <= maxDirtyY) {
        const dirtyW = maxDirtyX - minDirtyX + 1;
        const dirtyH = maxDirtyY - minDirtyY + 1;
        ctx.putImageData(imgData, 0, 0, minDirtyX, minDirtyY, dirtyW, dirtyH);
      } else if (prevDrawnIndices.length === 0) {
        ctx.clearRect(0, 0, width, height);
      }
    },
    [data, width, height]
  );

  // Secuencia de Entrada:
  // 1) Al cargarse `data`, pre-dibujamos en el canvas los 32 estados YA ELEVADOS en el aire
  //    (con `map-base.png` oculto), para que cuando el contenedor aparezca a los 1.95s,
  //    el mapa irrumpa directamente con relieve separado.
  // 2) Tras un breve instante (MAP_INTRO_HOLD_MS), los estados caen en oleada de Noroeste a Sureste,
  //    hacen su micro-rebote y encajan en 0.
  // 3) Al terminar, se enciende `map-base.png` (transición invisible) y el canvas queda limpio para hover/click.
  useEffect(() => {
    if (!data || introDone) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIntroDone(true);
      return;
    }

    // Ordenar de norte a sur para renderizado correcto en profundidad
    const sortedStates = [...data.states].sort((a, b) => a.anchor.y - b.anchor.y);

    // Para la oleada geográfica (Noroeste -> Sureste), calcular una métrica diagonal suave
    // y asignar un ranking continuo [0..31] para que los 32 estados caigan en progresión real
    // evitando que el centro caiga todo en un solo bloque.
    const statesByGeoOrder = [...data.states]
      .map((st) => ({
        state: st,
        geoVal: st.anchor.x * 0.72 + st.anchor.y,
      }))
      .sort((a, b) => a.geoVal - b.geoVal);

    // Mapear cada estado a su progreso normalizado (0 a 1) en 32 pasos
    const geoRankMap = new Map<string, number>();
    const totalStates = statesByGeoOrder.length;
    for (let r = 0; r < totalStates; r++) {
      geoRankMap.set(statesByGeoOrder[r].state.id, r / Math.max(1, totalStates - 1));
    }

    const stateSchedule = sortedStates.map((st) => {
      const g = geoRankMap.get(st.id) ?? 0;
      // Oleada continua de 32 pasos a lo largo de MAP_INTRO_STAGGER_MS
      const dropStartMs = g * MAP_INTRO_STAGGER_MS;
      // Altura inicial suspendida entre 4.0 y 6.2 vóxeles con microvariación armónica
      const startVoxels = 4.0 + ((st.numId * 17) % 23) / 10;
      return {
        stateId: st.id,
        dropStartMs,
        startVoxels,
      };
    });

    // Pre-dibujar el estado inicial suspendido antes de que el contenedor haga fade-in a los 1.95s
    const initialFrame = stateSchedule.map((item) => ({
      stateId: item.stateId,
      liftPx: Math.round(item.startVoxels * data.pixelScale),
      mode: 'intro' as const,
    }));
    renderStatesFrame(initialFrame, true);

    const totalIntroDuration = MAP_INTRO_STAGGER_MS + MAP_STATE_ANIM_MS + 40;
    let rafId = 0;
    let startTime: number | null = null;

    const timerId = window.setTimeout(() => {
      const tick = (now: number) => {
        if (startTime === null) startTime = now;
        const elapsed = now - startTime;

        const frameStates = stateSchedule.map((item) => {
          const localT = elapsed - item.dropStartMs;
          const p = localT <= 0 ? 0 : Math.min(1, localT / MAP_STATE_ANIM_MS);
          const liftPx = computeDropBounceLiftPx(p, item.startVoxels, data.pixelScale);
          return {
            stateId: item.stateId,
            liftPx,
            mode: 'intro' as const,
          };
        });

        renderStatesFrame(frameStates, true);

        if (elapsed < totalIntroDuration) {
          rafId = window.requestAnimationFrame(tick);
        } else {
          setIntroDone(true);
        }
      };

      rafId = window.requestAnimationFrame(tick);
    }, MAP_INTRO_DELAY_MS);

    return () => {
      window.clearTimeout(timerId);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [data, introDone, renderStatesFrame]);

  // Renderizado volumétrico interactivo normal (Hover y Selección) una vez concluida la intro
  useEffect(() => {
    if (!data || !introDone) return;

    const liftPx = ELEVATION_VOXELS * data.pixelScale;
    const statesToDraw: Array<{
      stateId: string;
      liftPx: number;
      mode: 'hover' | 'select';
    }> = [];

    if (selectedStateId) {
      statesToDraw.push({
        stateId: selectedStateId,
        liftPx,
        mode: 'select',
      });
    }

    if (currentHoveredId && currentHoveredId !== selectedStateId) {
      statesToDraw.push({
        stateId: currentHoveredId,
        liftPx,
        mode: 'hover',
      });
    }

    renderStatesFrame(statesToDraw, false);
  }, [data, introDone, selectedStateId, currentHoveredId, renderStatesFrame]);

  // Conversión precisa de coordenadas de pantalla a la rejilla lógica de vóxeles
  const getLogicalCoords = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): { lx: number; ly: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;

      const scaleX = width / rect.width;
      const scaleY = height / rect.height;

      const lx = Math.floor((e.clientX - rect.left) * scaleX);
      const ly = Math.floor((e.clientY - rect.top) * scaleY);
      return { lx, ly };
    },
    [width, height]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!data || !introDone) return;
      const coords = getLogicalCoords(e);
      const isTouch = e.pointerType === 'touch';
      const activeNumId = activeState ? activeState.numId : null;
      const liftPx = ELEVATION_VOXELS * data.pixelScale;
      const resolved = coords
        ? resolveStateAt(coords.lx, coords.ly, data.mapIds, width, height, isTouch, activeNumId, liftPx)
        : null;

      if (resolved !== currentHoveredId) {
        setInternalHoveredId(resolved);
        onHoverState?.(resolved);
      }
    },
    [data, introDone, width, height, currentHoveredId, activeState, getLogicalCoords, onHoverState]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!data || !introDone) return;
      const coords = getLogicalCoords(e);
      const isTouch = e.pointerType === 'touch';
      const activeNumId = activeState ? activeState.numId : null;
      const liftPx = ELEVATION_VOXELS * data.pixelScale;
      const resolved = coords
        ? resolveStateAt(coords.lx, coords.ly, data.mapIds, width, height, isTouch, activeNumId, liftPx)
        : null;

      if (resolved) {
        const nextSelected = resolved === selectedStateId ? null : resolved;
        onSelectState?.(nextSelected);
      }
    },
    [data, introDone, width, height, selectedStateId, activeState, getLogicalCoords, onSelectState]
  );

  const handlePointerLeave = useCallback(() => {
    if (currentHoveredId !== null) {
      setInternalHoveredId(null);
      onHoverState?.(null);
    }
  }, [currentHoveredId, onHoverState]);

  const selectState = useCallback(
    (stateId: string | null) => {
      onSelectState?.(stateId);
    },
    [onSelectState]
  );

  const contextValue: PixelMapContextValue = {
    data,
    selectedStateId,
    hoveredStateId: currentHoveredId,
    selectState,
  };

  return (
    <PixelMapContext.Provider value={contextValue}>
      <div
        role="region"
        aria-label="Mapa isométrico interactivo de México"
        className={cn(
          'relative w-full max-w-5xl mx-auto select-none overflow-visible bg-transparent group',
          className
        )}
        style={{ aspectRatio }}
      >
        {/* Capa 1: Sombra de contacto suave sobre el fondo */}
        <img
          src="/data/map-shadow.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          loading="eager"
        />

        {/* Capa 2: Mapa Base Pixel Art (Oculto durante la intro para que las piezas elevadas no se dupliquen abajo) */}
        <img
          src="/data/map-base.png"
          alt="Silueta y estados de la República Mexicana en estilo pixel art isométrico"
          className={cn(
            'absolute inset-0 w-full h-full object-contain pointer-events-none select-none [image-rendering:pixelated]',
            introDone ? 'opacity-100' : 'opacity-0'
          )}
          loading="eager"
        />

        {/* Capa 3: Canvas para animación de piezas elevadas e interacción volumétrica */}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          aria-label="Lienzo interactivo de estados"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerLeave={handlePointerLeave}
          className={cn(
            'absolute inset-0 w-full h-full object-contain [image-rendering:pixelated] touch-manipulation z-10',
            currentHoveredId ? 'cursor-pointer' : 'cursor-default'
          )}
        />

        {/* Capa 4: Ranura para overlays y dalias (Hito H4) */}
        {children && (
          <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
            {children}
          </div>
        )}

        {/* El tooltip provisional de depuración se retiró en H5 (Fase 1).
            El detalle por estado lo dibuja la tarjeta holográfica (Fase 2/3). */}

        {/* Indicador sutil de carga si aún no se han indexado los datos */}
        {loading && (
          <div
            aria-live="polite"
            className="absolute bottom-3 right-3 z-30 flex items-center gap-2 rounded-md bg-white/80 px-2.5 py-1 text-xs text-stone-600 backdrop-blur-sm border border-stone-200 shadow-sm"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
            <span>Cargando mapa...</span>
          </div>
        )}

        {/* Manejo de error si los activos no están disponibles */}
        {error && (
          <div
            role="alert"
            className="absolute inset-0 z-40 flex items-center justify-center bg-white/90 p-4 text-center text-sm text-red-600 backdrop-blur-sm"
          >
            <p>No se pudo cargar el mapa isométrico: {error.message}</p>
          </div>
        )}
      </div>
    </PixelMapContext.Provider>
  );
}

export default PixelMap;
