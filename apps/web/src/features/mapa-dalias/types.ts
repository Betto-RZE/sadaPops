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
  /** Píxeles RGBA (Uint32 little-endian) extraídos de map-base.png para preservar biseles y texturas al elevar */
  basePixels: Uint32Array;
  /** Índices de píxeles precalculados agrupados por numId (1..32) */
  pixelsByNumId: Map<number, StatePixelIndex>;
}

export interface PixelMapContextValue {
  data: MapIndexData | null;
  selectedStateId: string | null;
  hoveredStateId: string | null;
  selectState: (stateId: string | null) => void;
}

export interface PixelMapAnchorProps {
  /** Clave de dos dígitos del estado ("01".."32") donde anclar el elemento */
  stateId: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Contenido visual a anclar (ej. Dalia SVG, pin, badge o indicador) */
  children: React.ReactNode;
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
  /** Muestra un tooltip flotante automático con el nombre del estado activo */
  showTooltip?: boolean;
  /** Clases CSS adicionales para el contenedor exterior */
  className?: string;
  /** Ranura para montar capas secundarias y anclas (ej. Dalias en Hito H4) */
  children?: React.ReactNode;
}

/**
 * Nombres comunes estandarizados para visualización ciudadana en mapas (convención INE).
 * Sustituye títulos constitucionales solemnes (ej. "Veracruz de Ignacio de la Llave",
 * "Coahuila de Zaragoza", "Michoacán de Ocampo") por nombres comunes directos y oficiales.
 */
export const COMMON_STATE_NAMES: Record<string, string> = {
  '05': 'Coahuila',
  '15': 'Estado de México',
  '16': 'Michoacán',
  '30': 'Veracruz',
};

/**
 * Obtiene el nombre común estandarizado para un estado a partir de su ID o metadatos.
 */
export function getCommonStateName(state: { id: string; nombre: string } | null | undefined): string {
  if (!state) return '';
  return COMMON_STATE_NAMES[state.id] ?? state.nombre;
}
