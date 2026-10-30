/**
 * Calibración visual del escenario voxel «Respiro y línea de tiempo».
 *
 * Todas las medidas están expresadas en PORCENTAJE respecto a la caja completa
 * del PNG de la estación (`Voxel Metro Station Platform.png`, 1774×887 px), y
 * fueron obtenidas midiendo píxeles de la captura de referencia
 * `docs/referencias/Screenshot 2026-10-30 020750.png` (tren estacionado):
 *
 *  - Estación (contenido opaco) en la captura: x 118→919, y 38→415
 *  - Tren (contenido opaco) en la captura:     x 80→914,  y 237→383
 *  - Bounding box opaco del PNG estación: 30,48 → 1737,840
 *  - Bounding box opaco del PNG tren:     18,186 → 2148,561
 *
 * Al trabajar en porcentajes, la composición tren + andén se mantiene idéntica
 * a la referencia en cualquier tamaño de pantalla.
 */

export const METRO_ASSETS = {
  station: encodeURI('/assets/paradas/Voxel Metro Station Platform.png'),
  train: encodeURI('/assets/paradas/Purple Voxel Train Trio.png'),
  card: encodeURI('/assets/paradas/card-parada.png'),
} as const;

/** Relación de aspecto nativa de los PNG (ancho / alto). */
export const STATION_ASPECT = 1774 / 887; // 2:1
export const TRAIN_ASPECT = 2172 / 724; // 3:1

/**
 * Posición del tren cuando está ESTACIONADO en el andén
 * (relativa a la caja del PNG de la estación).
 */
export const TRAIN_DOCKED = {
  left: -3.71, // %  — la nariz del tren sobresale ligeramente a la izquierda, como en la referencia
  top: 35.73, // %
  width: 102.17, // %
} as const;

/**
 * Línea de rodadura (base de las ruedas del tren) dentro de la caja de la estación.
 * Se usa para dibujar el riel continuo que une las tres estaciones.
 */
export const RAIL_LINE_TOP = 88.5; // %

/** Letrero morado colgante del techo (área oscura interior). */
export const STATION_SIGN = {
  left: 46.1,
  top: 36.6,
  width: 12.3,
  height: 4.2,
} as const;

/**
 * Franja superior del panel blanco central que queda visible por encima del
 * tren estacionado (el techo del tren empieza en ~53.2%).
 */
export const STATION_PANEL_VISIBLE = {
  left: 34.6,
  top: 45.4,
  width: 30.8,
  height: 7.2,
} as const;

/** Lámparas del techo (para el brillo de «llegada»). */
export const STATION_LIGHTS = [
  { left: 31.3, top: 26.3, width: 8.8, height: 3.9 },
  { left: 60.8, top: 26.3, width: 8.4, height: 3.9 },
] as const;
