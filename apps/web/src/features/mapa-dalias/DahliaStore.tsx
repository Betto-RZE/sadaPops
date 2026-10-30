'use client';

/**
 * DahliaStore — Fuente reactiva única de dalias por estado (Hito H5, Fase 1).
 *
 * Regla de dominio: 1 dalia = 1 persona que se registró en la web ("Agrega tu Dalia").
 * El registro aún no existe; mientras tanto el store arranca con una SEMILLA DE EJEMPLO
 * (datos ficticios, ver ROADMAP §7) y expone `addDahliaToState` para que el futuro flujo
 * de registro sume +1 y el mapa, las flores y la tarjeta del estado se actualicen al instante.
 *
 * Privacidad: solo se guardan conteos agregados por entidad. Nunca PII.
 * Persistencia: en memoria (no se usa localStorage para datos del mapa, ROADMAP §4).
 * Cuando exista backend, `initialCounts` vendrá de `GET /api/estados`.
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { computeLevels, type DahliaLevel, type StateCountItem } from './computeLevels';

/** Claves INEGI de las 32 entidades ("01".."32") */
export const STATE_IDS: readonly string[] = Array.from({ length: 32 }, (_, i) =>
  String(i + 1).padStart(2, '0')
);

/**
 * SEMILLA DE EJEMPLO (datos ficticios, no son registros reales).
 * Estados ausentes arrancan en 0 (sin flor).
 */
export const DEMO_SEED_COUNTS: Readonly<Record<string, number>> = {
  '02': 420,
  '03': 310,
  '04': 280,
  '06': 190,
  '07': 350,
  '08': 4890,
  '10': 220,
  '12': 3800,
  '14': 4200,
  '19': 3950,
  '20': 1650,
  '21': 2458,
  '24': 260,
  '25': 240,
  '26': 310,
  '28': 340,
  '30': 1890,
  '31': 1720,
};

export interface DahliaStoreValue {
  /** Conteo de dalias (personas registradas) por estado, siempre con las 32 claves */
  counts: Readonly<Record<string, number>>;
  /** Nivel de flor 0..4 por estado (cuartiles, `computeLevels`) */
  levels: ReadonlyMap<string, DahliaLevel>;
  /** Lista en el formato que consume `computeLevels` / `DahliaLayer` */
  items: StateCountItem[];
  /** Total nacional de dalias */
  total: number;
  /** true mientras los datos sean la semilla de ejemplo */
  isDemoData: boolean;
  getCount: (stateId: string) => number;
  getLevel: (stateId: string) => DahliaLevel;
  /** Suma una dalia (+1) al estado. Punto de enganche para el futuro registro web. */
  addDahliaToState: (stateId: string) => void;
}

const DahliaStoreContext = createContext<DahliaStoreValue | null>(null);

function normalizeCounts(seed: Readonly<Record<string, number>>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of STATE_IDS) {
    const v = seed[id] ?? 0;
    out[id] = Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
  }
  return out;
}

export interface DahliaStoreProviderProps {
  /** Conteos iniciales; por defecto la semilla de ejemplo */
  initialCounts?: Readonly<Record<string, number>>;
  /** Marca si los conteos iniciales son de ejemplo (por defecto true) */
  isDemoData?: boolean;
  children: React.ReactNode;
}

export function DahliaStoreProvider({
  initialCounts = DEMO_SEED_COUNTS,
  isDemoData = true,
  children,
}: DahliaStoreProviderProps) {
  const [counts, setCounts] = useState<Record<string, number>>(() => normalizeCounts(initialCounts));

  const addDahliaToState = useCallback((stateId: string) => {
    if (!STATE_IDS.includes(stateId)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[DahliaStore] Clave de estado inválida: "${stateId}"`);
      }
      return;
    }
    setCounts((prev) => ({ ...prev, [stateId]: (prev[stateId] ?? 0) + 1 }));
  }, []);

  // Escucha de eventos globales para sumar dalias desde cualquier sección (ej. ModuleCards)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleAdd = (e: Event) => {
      const custom = e as CustomEvent<{ stateId: string }>;
      if (custom.detail?.stateId) {
        addDahliaToState(custom.detail.stateId);
      }
    };
    window.addEventListener('dalias:add-dahlia', handleAdd);
    return () => {
      window.removeEventListener('dalias:add-dahlia', handleAdd);
    };
  }, [addDahliaToState]);

  const value = useMemo<DahliaStoreValue>(() => {
    const items: StateCountItem[] = STATE_IDS.map((id) => ({ id, usuarios: counts[id] }));
    const levels = computeLevels(items);
    const total = items.reduce((s, it) => s + it.usuarios, 0);
    return {
      counts,
      levels,
      items,
      total,
      isDemoData,
      getCount: (id) => counts[id] ?? 0,
      getLevel: (id) => levels.get(id) ?? 0,
      addDahliaToState,
    };
  }, [counts, isDemoData, addDahliaToState]);

  return <DahliaStoreContext.Provider value={value}>{children}</DahliaStoreContext.Provider>;
}

/** Acceso obligatorio al store (lanza si no hay Provider). */
export function useDahliaStore(): DahliaStoreValue {
  const ctx = useContext(DahliaStoreContext);
  if (!ctx) throw new Error('useDahliaStore debe usarse dentro de <DahliaStoreProvider>');
  return ctx;
}

/** Acceso opcional (null si no hay Provider). Útil para componentes reutilizables. */
export function useOptionalDahliaStore(): DahliaStoreValue | null {
  return useContext(DahliaStoreContext);
}
