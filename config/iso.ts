/**
 * Configuración de proyección isométrica y rasterizado voxel para el Mapa de México.
 * Calibrado directamente contra docs/referencias/mockup-mapa.jpeg
 */

export interface IslandVoxel {
  name: string;
  /**
   * Coordenadas relativas [relX, relY] en el lienzo [0..1] medidas de mockup-mapa.jpeg.
   * Si cae sobre tierra firme, el script lo desplaza automáticamente al hueco de mar más cercano.
   */
  relPos: [number, number];
  /** Tamaño de la tapa superior del prisma en vóxeles (ancho, alto) */
  size: { w: number; h: number };
}

export interface IsoMapConfig {
  /** Dimensiones de la rejilla voxel lógica */
  gridWidth: number;
  gridHeight: number;
  /** Factor de escalado entero de cada voxel a píxeles de salida (ej. 2 o 3) */
  pixelScale: number;

  /**
   * Encuadre relativo [0..1] de la silueta continental dentro del lienzo,
   * medido directamente de docs/referencias/mockup-mapa.jpeg (1544x1018).
   */
  framing: {
    relMinX: number;
    relMaxX: number;
    relMinY: number;
    relMaxY: number;
  };

  /** Proyección geográfica base D3 */
  geo: {
    centerLon: number;
    centerLat: number;
    parallels: [number, number];
    rotateLon: number;
  };

  /** Transformación afín 2.5D sobre el espacio proyectado */
  transform: {
    /** Rotación en grados para alinear la diagonal NW-SE con mockup-mapa.jpeg */
    rotationDeg: number;
    /** Compresión vertical isométrica */
    scaleY: number;
    /** Sesgo horizontal oblicuo */
    shearX: number;
  };

  /** Parámetros de extrusión vertical hacia abajo (Delta X = 0, Delta Y = +1) */
  extrusion: {
    /** Altura de las paredes continentales en vóxeles */
    heightInVoxels: number;
    /** Altura de las paredes de los cubos de islas en vóxeles */
    islandHeightInVoxels: number;
  };

  /** Limpieza geométrica en espacio de rejilla (unidades: vóxeles²) */
  geometry: {
    /** Polígonos secundarios (islas del GeoJSON) con área menor se descartan (usamos cubos voxel) */
    minIslandAreaVoxels: number;
    /** Huecos interiores (artefactos de simplificación) con área menor se descartan */
    minHoleAreaVoxels: number;
    /** Componentes de tierra conectados con menos celdas se eliminan (ruido) */
    minComponentCells: number;
    /** Celdas mínimas garantizadas por estado (CDMX, Tlaxcala, Morelos...) */
    minStateCells: number;
    /** Pasadas de suavizado morfológico por mayoría para evitar bordes zigzagueantes ruidosos */
    smoothingPasses: number;
  };

  /** Sombra suave prehorneada sobre el papel (map-shadow.webp) */
  shadow: {
    /** Desplazamiento en píxeles de salida */
    offsetX: number;
    offsetY: number;
    /** Sigma del desenfoque gaussiano en píxeles de salida */
    blurSigma: number;
    /** Opacidad máxima [0..1] */
    opacity: number;
    /** Factor de resolución del archivo (0.5 = mitad; se escala suavizado en CSS) */
    resolutionScale: number;
  };

  /**
   * Paleta exacta muestreada de docs/referencias/mockup-mapa.jpeg
   */
  palette: {
    /** Tonos superiores índigo-periwinkle sutilmente diferenciados por estado */
    topVariants: string[];
    /** Bisel luminoso en el labio superior del acantilado */
    coastalHighlight: string;
    /** Líneas divisorias entre estados (1 voxel) */
    borderInner: string;
    /** Tono de transición suave junto al borde interno */
    borderSoft: string;
    /** Pared lateral frontal / orientación Sureste (iluminada) */
    cliffLight: string;
    /** Pared lateral media (orientación Sur) */
    cliffMid: string;
    /** Pared lateral en sombra (orientación Suroeste / escalón izquierdo) */
    cliffDark: string;
    /** Base de contacto del acantilado con el papel */
    cliffEdge: string;
    /** Color de la sombra difusa sobre el papel */
    shadowColor: string;
    /** Color base de respaldo de papel */
    paperBg: string;
  };

  /** Control y posicionamiento de los cubos de islas decorativas */
  islands: {
    enabled: boolean;
    definitions: IslandVoxel[];
  };

  /** Ajustes manuales finos de anclas de dalia por id de estado ("01".."32") en vóxeles */
  anchorOverrides: Record<string, { dx?: number; dy?: number }>;
}

export const ISO_MAP_CONFIG: IsoMapConfig = {
  // Rejilla de 220x145 vóxeles (proporción 1.517 idéntica a 1544x1018 de mockup-mapa.jpeg)
  // A pixelScale = 3 genera 660x435 px con bloques voxel bien marcados y nítidos.
  gridWidth: 220,
  gridHeight: 145,
  pixelScale: 3,

  framing: {
    relMinX: 0.108,
    relMaxX: 0.945,
    relMinY: 0.098,
    relMaxY: 0.882, // + 5 vóxeles de extrusión llega a ~0.917 como en el mockup
  },

  geo: {
    centerLon: -102.5,
    centerLat: 23.6,
    parallels: [17.5, 29.5],
    rotateLon: 102.5,
  },

  transform: {
    // Valores optimizados por máxima intersección sobre unión (IoU = 86.4%) contra mockup-mapa.jpeg
    rotationDeg: -3.0,
    scaleY: 0.92,
    shearX: -0.02,
  },

  extrusion: {
    heightInVoxels: 5,
    islandHeightInVoxels: 3,
  },

  geometry: {
    minIslandAreaVoxels: 25,
    minHoleAreaVoxels: 6,
    minComponentCells: 4,
    minStateCells: 10,
    smoothingPasses: 1,
  },

  shadow: {
    offsetX: -3,
    offsetY: 8,
    blurSigma: 7,
    opacity: 0.24,
    resolutionScale: 0.5,
  },

  palette: {
    // Tonos muestreados de Sonora, Chihuahua, Durango, Oaxaca y Yucatán en mockup-mapa.jpeg
    topVariants: [
      '#6867E8',
      '#6D6CEB',
      '#6362E3',
      '#7270EF',
      '#605FE0',
      '#6B68EA',
    ],
    coastalHighlight: '#8A88F9',
    borderInner: '#D0C6FF',
    borderSoft: '#9D95F6',
    cliffLight: '#5140B2',
    cliffMid: '#4837A4',
    cliffDark: '#3C2D93',
    cliffEdge: '#2B1E78',
    shadowColor: '#231D45',
    paperBg: '#ECEBE9',
  },

  islands: {
    enabled: true,
    definitions: [
      // 3 cubos frente a Baja California Norte
      { name: 'bc_1', relPos: [0.0955, 0.245], size: { w: 2, h: 2 } },
      { name: 'bc_2', relPos: [0.1091, 0.272], size: { w: 2, h: 2 } },
      { name: 'bc_3', relPos: [0.1337, 0.304], size: { w: 2, h: 2 } },

      // 2 cubos frente a Baja California Sur
      { name: 'bcs_1', relPos: [0.1992, 0.478], size: { w: 2, h: 2 } },
      { name: 'bcs_2', relPos: [0.2147, 0.498], size: { w: 2, h: 2 } },

      // 2 cubos frente a Nayarit / Sinaloa (Islas Marías)
      { name: 'nayarit_1', relPos: [0.3663, 0.595], size: { w: 2, h: 2 } },
      { name: 'nayarit_2', relPos: [0.3799, 0.623], size: { w: 2, h: 2 } },

      // 2 cubos en el Caribe (Cozumel y Banco Chinchorro)
      { name: 'caribe_cozumel', relPos: [0.9281, 0.646], size: { w: 2, h: 2 } },
      { name: 'caribe_sur', relPos: [0.9055, 0.728], size: { w: 2, h: 2 } },
    ],
  },

  anchorOverrides: {},
};
