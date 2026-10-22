/**
 * Configuración de proyección isométrica y rasterizado voxel para el Mapa de México.
 * Calibrado contra docs/referencias/mockup-mapa.jpeg
 */

export interface IslandVoxel {
  name: string;
  /** Coordenadas relativas aproximadas sobre el lienzo final [0..1] */
  relX: number;
  relY: number;
  /** Tamaño del prisma en vóxeles (ancho, alto de tapa, altura de extrusión) */
  size: { w: number; h: number; extrusion: number };
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
  };

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
    // Rotación para inclinar la diagonal México NW-SE
    rotationDeg: -16.5,
    // Compresión vertical isométrica de 30°
    scaleY: 0.60,
    shearX: 0.10,
  },

  extrusion: {
    // 6 vóxeles de profundidad vertical (12 px a escala 2x)
    heightInVoxels: 6,
  },

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
      // 3 cubos frente a Baja California Norte (Pacífico Norte)
      { name: 'bc_isla_1', relX: 0.095, relY: 0.25, size: { w: 2, h: 2, extrusion: 4 } },
      { name: 'bc_isla_2', relX: 0.110, relY: 0.29, size: { w: 2, h: 2, extrusion: 4 } },
      { name: 'bc_isla_3', relX: 0.135, relY: 0.32, size: { w: 2, h: 2, extrusion: 4 } },

      // 2 cubos frente a Baja California Sur
      { name: 'bcs_isla_1', relX: 0.200, relY: 0.48, size: { w: 2, h: 2, extrusion: 4 } },
      { name: 'bcs_isla_2', relX: 0.215, relY: 0.51, size: { w: 2, h: 2, extrusion: 4 } },

      // 2 cubos frente a Nayarit / Colima
      { name: 'nayarit_isla_1', relX: 0.365, relY: 0.60, size: { w: 2, h: 2, extrusion: 4 } },
      { name: 'nayarit_isla_2', relX: 0.380, relY: 0.63, size: { w: 2, h: 2, extrusion: 4 } },

      // 2 cubos en el Caribe (Cozumel / Isla Mujeres)
      { name: 'caribe_isla_1', relX: 0.905, relY: 0.73, size: { w: 2, h: 2, extrusion: 4 } },
      { name: 'caribe_isla_2', relX: 0.925, relY: 0.66, size: { w: 2, h: 2, extrusion: 4 } },
    ],
  },

  anchorOverrides: {
    // Posibilidad de desplazar anclas si polylabel cae en penínsulas muy estrechas
    // Ej: "03": { dx: -1, dy: 1 } (BCS)
  },
};
