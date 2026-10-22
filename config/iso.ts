/**
 * Configuración de proyección isométrica y rasterizado voxel 3D para el Mapa de México.
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
  /** Factor de escalado entero de cada voxel a píxeles de salida (ej. 3 -> bloques de 3x3 px) */
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
    rotationDeg: number;
    scaleY: number;
    shearX: number;
  };

  /** Parámetros de extrusión vertical 3D */
  extrusion: {
    /** Altura de las paredes continentales en vóxeles */
    heightInVoxels: number;
    /** Altura de las paredes de los cubos de islas en vóxeles */
    islandHeightInVoxels: number;
  };

  /** Limpieza geométrica en espacio de rejilla (unidades: vóxeles²) */
  geometry: {
    minIslandAreaVoxels: number;
    minHoleAreaVoxels: number;
    minComponentCells: number;
    minStateCells: number;
    smoothingPasses: number;
  };

  /** Sombra suave prehorneada sobre el papel (map-shadow.webp) */
  shadow: {
    offsetX: number;
    offsetY: number;
    blurSigma: number;
    opacity: number;
    resolutionScale: number;
  };

  /**
   * Paleta 3D Voxel muestreada a zoom de docs/referencias/mockup-mapa.jpeg
   * Luz direccional principal desde Arriba-Izquierda (Noroeste / Suroeste en paredes).
   */
  palette: {
    /** Tonos base de cara superior por estado */
    topVariants: string[];
    /** Anillo de vóxeles del borde costero (1 voxel completo de grosor alrededor del perímetro) */
    coastalRimVoxel: string;
    /** Brillo especular de 1px en la arista exterior del borde costero */
    coastalRimHighlight: string;
    /** Sombra interna de 1px entre el anillo costero y el interior del estado */
    coastalInnerBevel: string;
    /** Cresta luminosa de las fronteras internas entre estados */
    borderInner: string;
    /** Bisel intermedio de la frontera */
    borderSoft: string;
    /** Surco oscuro de 1px junto a la frontera (efecto ranura entre piezas 3D) */
    borderGroove: string;
    /** Pared lateral iluminada (orientación Suroeste / Izquierda) */
    cliffLight: string;
    /** Pared lateral frontal (orientación Sur) */
    cliffMid: string;
    /** Pared lateral en sombra (orientación Sureste / Derecha) */
    cliffDark: string;
    /** Pared lateral profunda en costas orientadas al Este y pliegues de escalón */
    cliffDeepShadow: string;
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
  gridWidth: 220,
  gridHeight: 145,
  pixelScale: 3,

  framing: {
    relMinX: 0.108,
    relMaxX: 0.945,
    relMinY: 0.098,
    relMaxY: 0.878,
  },

  geo: {
    centerLon: -102.5,
    centerLat: 23.6,
    parallels: [17.5, 29.5],
    rotateLon: 102.5,
  },

  transform: {
    rotationDeg: -3.0,
    scaleY: 0.92,
    shearX: -0.02,
  },

  extrusion: {
    heightInVoxels: 6,
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
    offsetX: -2,
    offsetY: 9,
    blurSigma: 7,
    opacity: 0.26,
    resolutionScale: 0.5,
  },

  palette: {
    topVariants: [
      '#6665E7',
      '#6C6BEC',
      '#6160E2',
      '#706FEF',
      '#5E5DDF',
      '#6967EA',
    ],
    coastalRimVoxel: '#8A89FA',
    coastalRimHighlight: '#B4B2FF',
    coastalInnerBevel: '#5554D4',
    borderInner: '#DCD4FF',
    borderSoft: '#A59EF9',
    borderGroove: '#4E4CC6',
    cliffLight: '#5B49C6',
    cliffMid: '#4C3AB2',
    cliffDark: '#33248B',
    cliffDeepShadow: '#23176E',
    shadowColor: '#211B42',
    paperBg: '#ECEBE9',
  },

  islands: {
    enabled: true,
    definitions: [
      // 3 cubos frente a Baja California Norte
      { name: 'bc_1', relPos: [0.0955, 0.245], size: { w: 3, h: 2 } },
      { name: 'bc_2', relPos: [0.1091, 0.272], size: { w: 3, h: 2 } },
      { name: 'bc_3', relPos: [0.1337, 0.304], size: { w: 3, h: 2 } },

      // 1 cubo en el Golfo de California (visible en crop_bc.png)
      { name: 'golfo_tiburon', relPos: [0.2150, 0.254], size: { w: 3, h: 2 } },

      // 2 cubos frente a Baja California Sur
      { name: 'bcs_1', relPos: [0.1992, 0.478], size: { w: 3, h: 2 } },
      { name: 'bcs_2', relPos: [0.2147, 0.498], size: { w: 3, h: 2 } },

      // 2 cubos frente a Nayarit / Sinaloa (Islas Marías)
      { name: 'nayarit_1', relPos: [0.3663, 0.595], size: { w: 3, h: 2 } },
      { name: 'nayarit_2', relPos: [0.3799, 0.623], size: { w: 3, h: 2 } },

      // 2 cubos en el Caribe (Cozumel y Banco Chinchorro)
      { name: 'caribe_cozumel', relPos: [0.9281, 0.646], size: { w: 3, h: 2 } },
      { name: 'caribe_sur', relPos: [0.9055, 0.728], size: { w: 3, h: 2 } },
    ],
  },

  anchorOverrides: {},
};
