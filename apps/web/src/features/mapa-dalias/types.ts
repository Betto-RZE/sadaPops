/**
 * Contratos de tipos para el Mapa Isométrico Pixel Art de Dalias (Hito H2).
 */

export interface StateMetadata {
  id: string; // "01" .. "32"
  numId: number; // 1 .. 32
  nombre: string;
  anchor: {
    x: number;
    y: number;
  };
  bbox: [number, number, number, number]; // [minX, minY, maxX, maxY]
  topPixels: number;
  sidePixels: number;
}

export interface StatesMetadataFile {
  version: number;
  width: number;
  height: number;
  pixelScale: number;
  extrusionPx: number;
  idEncoding: string;
  states: StateMetadata[];
}

export interface StatePixelIndex {
  /** Índices lineales (y * width + x) de los vóxeles de la cara superior */
  topPixels: Uint32Array;
  /** Índices lineales (y * width + x) de los vóxeles de la pared extruida */
  sidePixels: Uint32Array;
}

export interface MapIndexData {
  width: number;
  height: number;
  pixelScale: number;
  extrusionPx: number;
  states: StateMetadata[];
  stateById: Map<string, StateMetadata>;
  stateByNumId: Map<number, StateMetadata>;
  /** Buffer crudo de códigos (0 = vacío/isla, 1..32 = superior, 33..64 = lateral) */
  mapIds: Uint8Array;
  /** Índices de píxeles precalculados agrupados por numId (1..32) */
  pixelsByNumId: Map<number, StatePixelIndex>;
}

export interface PixelMapProps {
  /** Clave de dos dígitos del estado seleccionado ("01".."32") o null */
  selectedStateId?: string | null;
  /** Clave de dos dígitos del estado en hover ("01".."32") o null */
  hoveredStateId?: string | null;
  /** Callback al seleccionar un estado mediante clic o toque */
  onSelectState?: (stateId: string | null) => void;
  /** Callback al pasar o retirar el puntero de un estado */
  onHoverState?: (stateId: string | null) => void;
  /** Clases CSS adicionales para el contenedor exterior */
  className?: string;
  /** Ranura para montar capas secundarias (ej. Dalias en Hito H4) */
  children?: React.ReactNode;
}
