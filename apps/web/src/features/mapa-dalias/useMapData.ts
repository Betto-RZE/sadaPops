'use client';

import { useState, useEffect } from 'react';
import type {
  StatesMetadataFile,
  MapIndexData,
  StateMetadata,
  StatePixelIndex,
} from './types';

// Caché en memoria a nivel de módulo para evitar re-descargas e indexaciones repetidas
let cachedDataPromise: Promise<MapIndexData> | null = null;
let cachedData: MapIndexData | null = null;

/**
 * Procesa los datos binarios y el JSON de metadatos construyendo
 * los índices Uint32Array por estado en un único recorrido O(N).
 */
function buildMapIndex(
  metadata: StatesMetadataFile,
  mapIdsBuffer: ArrayBuffer
): MapIndexData {
  const mapIds = new Uint8Array(mapIdsBuffer);
  const stateById = new Map<string, StateMetadata>();
  const stateByNumId = new Map<number, StateMetadata>();

  const topOffsets = new Map<number, Uint32Array>();
  const sideOffsets = new Map<number, Uint32Array>();
  const topPointers = new Map<number, number>();
  const sidePointers = new Map<number, number>();

  for (const s of metadata.states) {
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
    states: metadata.states,
    stateById,
    stateByNumId,
    mapIds,
    pixelsByNumId,
  };
}

/**
 * Carga de forma concurrente states.json y map-ids.bin y genera la estructura pre-indexada.
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
      const binBuffer = await binRes.arrayBuffer();

      cachedData = buildMapIndex(metadata, binBuffer);
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
