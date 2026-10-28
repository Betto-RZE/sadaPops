'use client';

import { useState, useEffect } from 'react';
import {
  type StatesMetadataFile,
  type MapIndexData,
  type StateMetadata,
  type StatePixelIndex,
  STATE_ANCHOR_OVERRIDES,
} from './types';

// Caché en memoria a nivel de módulo para evitar re-descargas e indexaciones repetidas
let cachedDataPromise: Promise<MapIndexData> | null = null;
let cachedData: MapIndexData | null = null;

/**
 * Decodifica /data/map-base.png en un buffer Uint32Array (RGBA little-endian)
 * para reutilizar los biseles, bordes y sombreado originales al elevar un estado.
 */
async function extractBasePixels(width: number, height: number): Promise<Uint32Array> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(new Uint32Array(width * height));
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(new Uint32Array(width * height));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      resolve(new Uint32Array(imgData.data.buffer));
    };
    img.onerror = () => {
      resolve(new Uint32Array(width * height));
    };
    img.src = '/data/map-base.png';
  });
}

/**
 * Procesa los datos binarios y el JSON de metadatos construyendo
 * los índices Uint32Array por estado en un único recorrido O(N).
 */
function buildMapIndex(
  metadata: StatesMetadataFile,
  mapIdsBuffer: ArrayBuffer,
  basePixels: Uint32Array
): MapIndexData {
  const mapIds = new Uint8Array(mapIdsBuffer);
  const stateById = new Map<string, StateMetadata>();
  const stateByNumId = new Map<number, StateMetadata>();

  const topOffsets = new Map<number, Uint32Array>();
  const sideOffsets = new Map<number, Uint32Array>();
  const topPointers = new Map<number, number>();
  const sidePointers = new Map<number, number>();

  const statesWithOverrides = metadata.states.map((s) => {
    const override = STATE_ANCHOR_OVERRIDES[s.id];
    return override ? { ...s, anchor: { ...override } } : s;
  });

  for (const s of statesWithOverrides) {
    stateById.set(s.id, s);
    stateByNumId.set(s.numId, s);

    // Pre-alocación exacta de arrays tipados basada en las cuentas conocidas
    topOffsets.set(s.numId, new Uint32Array(s.topPixels));
    sideOffsets.set(s.numId, new Uint32Array(s.sidePixels));
    topPointers.set(s.numId, 0);
    sidePointers.set(s.numId, 0);
  }

  // Recorrido único O(N) sobre los píxeles lógicos
  const totalPixels = mapIds.length;
  for (let i = 0; i < totalPixels; i++) {
    const code = mapIds[i];
    if (code === 0) continue;

    if (code >= 1 && code <= 32) {
      const arr = topOffsets.get(code);
      if (arr) {
        const ptr = topPointers.get(code)!;
        if (ptr < arr.length) {
          arr[ptr] = i;
          topPointers.set(code, ptr + 1);
        }
      }
    } else if (code >= 33 && code <= 64) {
      const numId = code - 32;
      const arr = sideOffsets.get(numId);
      if (arr) {
        const ptr = sidePointers.get(numId)!;
        if (ptr < arr.length) {
          arr[ptr] = i;
          sidePointers.set(numId, ptr + 1);
        }
      }
    }
  }

  const pixelsByNumId = new Map<number, StatePixelIndex>();
  for (const s of metadata.states) {
    pixelsByNumId.set(s.numId, {
      topPixels: topOffsets.get(s.numId)!,
      sidePixels: sideOffsets.get(s.numId)!,
    });
  }

  return {
    width: metadata.width,
    height: metadata.height,
    pixelScale: metadata.pixelScale,
    extrusionPx: metadata.extrusionPx,
    states: statesWithOverrides,
    stateById,
    stateByNumId,
    mapIds,
    basePixels,
    pixelsByNumId,
  };
}

/**
 * Carga de forma concurrente states.json, map-ids.bin y map-base.png
 * generando la estructura pre-indexada.
 */
async function loadMapData(): Promise<MapIndexData> {
  if (cachedData) {
    return cachedData;
  }
  if (!cachedDataPromise) {
    cachedDataPromise = (async () => {
      const [metaRes, binRes] = await Promise.all([
        fetch('/data/states.json'),
        fetch('/data/map-ids.bin'),
      ]);

      if (!metaRes.ok) {
        throw new Error(`Error al descargar /data/states.json: ${metaRes.statusText}`);
      }
      if (!binRes.ok) {
        throw new Error(`Error al descargar /data/map-ids.bin: ${binRes.statusText}`);
      }

      const metadata: StatesMetadataFile = await metaRes.json();
      const [binBuffer, basePixels] = await Promise.all([
        binRes.arrayBuffer(),
        extractBasePixels(metadata.width, metadata.height),
      ]);

      cachedData = buildMapIndex(metadata, binBuffer, basePixels);
      return cachedData;
    })();
  }
  return cachedDataPromise;
}

export interface UseMapDataResult {
  data: MapIndexData | null;
  loading: boolean;
  error: Error | null;
}

export function useMapData(): UseMapDataResult {
  const [data, setData] = useState<MapIndexData | null>(cachedData);
  const [loading, setLoading] = useState<boolean>(!cachedData);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!data) {
      loadMapData()
        .then((result) => {
          if (mounted) {
            setData(result);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (mounted) {
            setError(err instanceof Error ? err : new Error(String(err)));
            setLoading(false);
          }
        });
    }

    return () => {
      mounted = false;
    };
  }, [data]);

  return { data, loading, error };
}
