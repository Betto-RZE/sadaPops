/**
 * Configuración de proyección isométrica y rasterizado voxel para el Mapa de México.
 * Calibrado contra docs/referencias/mockup-mapa.jpeg
 */

export interface IslandVoxel {
  name: string;
  /**
   * Posición geográfica aproximada [lon, lat]. Se proyecta con la misma vista que el mapa,
   * así las islas siguen al mapa aunque se recalibre la transformación.
   * Si el cubo cae sobre tierra, el script lo desplaza al hueco libre más cercano.
   */
  lonLat: [number, number];
  /** Tamaño del prisma en vóxeles (ancho y alto de la tapa) */
  size: { w: number; h: number };
}

export interface IsoMapConfig {
  /** Dimensiones de la rejilla voxel lógica */
  gridWidth: number;
  gridHeight: number;
  /** Factor de escalado entero de cada voxel a píxeles de salida (ej. 2 para bloques 2x2) */
  pixelScale: number;
  /** Margen de seguridad en celdas voxel alrededor del contorno */
  padding: number;

  /** Proyección geográfica base D3 */
  geo: {
    centerLon: number;
    centerLat: number;
    parallels: [number, number];
    rotateLon: number;
  };

  /** Transformación afín de perspectiva 2.5D sobre el espacio proyectado */
  transform: {
    /** Rotación en grados para alinear la diagonal NW-SE de México como en el mockup */
    rotationDeg: number;
    /** Compresión en el eje Y para la inclinación isométrica (~0.55 a 0.65) */
    scaleY: number;
    /** Sesgo horizontal oblicuo */
    shearX: number;
  };

  /** Parámetros de extrusión vertical hacia abajo (Delta X = 0, Delta Y = +1) */
  extrusion: {
    /** Altura de las paredes en unidades de vóxeles */
    heightInVoxels: number;
    /** Altura de las paredes de los cubos de islas */
    islandHeightInVoxels: number;
  };

  /** Limpieza geométrica en espacio de rejilla (unidades: vóxeles²) */
  geometry: {
    /** Polígonos secundarios (islas reales) con área menor se descartan */
    minIslandAreaVoxels: number;
    /** Huecos interiores (artefactos de simplificación) con área menor se descartan */
    minHoleAreaVoxels: number;
    /** Componentes de tierra conectados con menos celdas se eliminan (ruido) */
    minComponentCells: number;
    /** Celdas mínimas garantizadas por estado (CDMX, Tlaxcala, Morelos...) */
    minStateCells: number;
  };

  /** Sombra suave prehorneada sobre el papel (map-shadow.webp) */
  shadow: {
    /** Desplazamiento en píxeles de salida (negativo = izquierda) */
    offsetX: number;
    offsetY: number;
    /** Sigma del desenfoque gaussiano en píxeles de salida */
    blurSigma: number;
    /** Opacidad máxima [0..1] */
    opacity: number;
    /** Factor de resolución del archivo (0.5 = mitad; se escala suavizado en CSS) */
    resolutionScale: number;
  };

  /** Grosor de las líneas de frontera y biseles, en píxeles de salida */
  lineWidthPx: number;

  /**
   * Paleta exacta extraída de docs/referencias/mockup-mapa.jpeg
   */
  palette: {
    /** Tonos superiores sutilmente diferenciados por estado */
    topVariants: string[];
    /** Resalte de 1px en el borde costero superior donde empieza la pared */
    coastalHighlight: string;
    /** Líneas divisorias entre estados (1 voxel de grosor) */
    borderInner: string;
    /** Pared lateral iluminada (orientación Suroeste) */
    cliffLight: string;
    /** Pared lateral en sombra (orientación Sureste) */
    cliffDark: string;
    /** Arista vertical oscura en las esquinas de columnas de vóxeles */
    cliffEdge: string;
    /** Color de la sombra difusa sobre el papel */
    shadowColor: string;
    /** Color base de respaldo de papel */
    paperBg: string;
  };

  /** Control y posicionamiento de los 9 cubos de islas decorativas */
  islands: {
    enabled: boolean;
    definitions: IslandVoxel[];
  };

  /** Ajustes manuales finos de anclas de dalia por id de estado ("01".."32") en vóxeles */
  anchorOverrides: Record<string, { dx?: number; dy?: number }>;
}

export const ISO_MAP_CONFIG: IsoMapConfig = {
  // Rejilla de ~270 vóxeles de ancho para lograr el grano y escalón de mockup-mapa.jpeg
  gridWidth: 270,
  gridHeight: 180,
  // A escala 2x, genera una imagen final nítida de 540 x 360 px (proporción 3:2 / ~16:10)
  pixelScale: 2,
  padding: 8,

  geo: {
    centerLon: -102.5,
    centerLat: 23.6,
    parallels: [17.5, 29.5],
    rotateLon: 102.5,
  },

  transform: {
    // Valores iniciales: el mockup conserva casi la proporción real de México.
    // Se afinan en la Fase 4 con scripts/compare-map.ts
    rotationDeg: 0,
    // Compresión vertical leve (vista inclinada)
    scaleY: 0.88,
    shearX: 0,
  },

  extrusion: {
    // 6 vóxeles de profundidad vertical (12 px a escala 2x)
    heightInVoxels: 6,
    islandHeightInVoxels: 2,
  },

  geometry: {
    minIslandAreaVoxels: 6,
    minHoleAreaVoxels: 6,
    minComponentCells: 3,
    minStateCells: 8,
  },

  shadow: {
    offsetX: -4,
    offsetY: 6,
    blurSigma: 5,
    opacity: 0.28,
    resolutionScale: 0.5,
  },

  lineWidthPx: 1,

  palette: {
    // Tonos superiores índigo/violeta con variación sutil determinista
    topVariants: [
      '#665ADE',
      '#6A5FE0',
      '#6F64E4',
      '#6357DA',
      '#7368E8',
      '#6054D8',
    ],
    // Bisel costero superior
    coastalHighlight: '#8379EE',
    // Fronteras entre estados de 1 voxel en lila claro nítido
    borderInner: '#C5BFFB',
    // Paredes: 3 tonos según columna y normal
    cliffLight: '#4A3FC4',
    cliffDark: '#352B99',
    cliffEdge: '#261D7A',
    // Sombra suave proyectada al suelo
    shadowColor: '#1A1638',
    paperBg: '#EEEDEA',
  },

  islands: {
    enabled: true,
    // Las 9 islas prismáticas visibles en mockup-mapa.jpeg
    definitions: [
      // 3 cubos frente a Baja California (Pacífico Norte: Guadalupe, San Martín, Cedros)
      { name: 'bc_guadalupe', lonLat: [-118.3, 29.0], size: { w: 2, h: 2 } },
      { name: 'bc_san_martin', lonLat: [-116.6, 30.4], size: { w: 2, h: 2 } },
      { name: 'bc_cedros', lonLat: [-115.5, 28.2], size: { w: 2, h: 2 } },

      // 2 cubos frente a Baja California Sur (Pacífico)
      { name: 'bcs_isla_1', lonLat: [-112.8, 24.6], size: { w: 2, h: 2 } },
      { name: 'bcs_isla_2', lonLat: [-112.3, 23.9], size: { w: 2, h: 2 } },

      // 2 cubos frente a Nayarit (Islas Marías)
      { name: 'nayarit_marias_1', lonLat: [-106.6, 21.7], size: { w: 2, h: 2 } },
      { name: 'nayarit_marias_2', lonLat: [-106.2, 21.3], size: { w: 2, h: 2 } },

      // 2 cubos en el Caribe (Isla Mujeres / Cozumel)
      { name: 'caribe_mujeres', lonLat: [-86.5, 21.3], size: { w: 2, h: 2 } },
      { name: 'caribe_cozumel', lonLat: [-86.6, 20.3], size: { w: 2, h: 2 } },
    ],
  },

  anchorOverrides: {
    // Posibilidad de desplazar anclas si polylabel cae en penínsulas muy estrechas
    // Ej: "03": { dx: -1, dy: 1 } (BCS)
  },
};
