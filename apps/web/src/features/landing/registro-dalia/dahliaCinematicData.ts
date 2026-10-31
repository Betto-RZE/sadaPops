export interface StateAnchor {
  name: string;
  x: number;
  y: number;
  pctX: number;
  pctY: number;
}

/**
 * Coordenadas ancla calibradas para los 32 estados de la República Mexicana
 * sobre la base lógica de 660 x 435 px de /data/map-base.png.
 * Incluye las correcciones ópticas de Puebla (21) e Hidalgo (13).
 */
export const STATE_CINEMATIC_ANCHORS: Record<string, StateAnchor> = {
  '01': { name: 'Aguascalientes', x: 331, y: 250, pctX: 50.15, pctY: 57.47 },
  '02': { name: 'Baja California', x: 94, y: 61, pctX: 14.24, pctY: 14.02 },
  '03': { name: 'Baja California Sur', x: 133, y: 148, pctX: 20.15, pctY: 34.02 },
  '04': { name: 'Campeche', x: 568, y: 295, pctX: 86.06, pctY: 67.82 },
  '05': { name: 'Coahuila', x: 328, y: 139, pctX: 49.7, pctY: 31.95 },
  '06': { name: 'Colima', x: 304, y: 310, pctX: 46.06, pctY: 71.26 },
  '07': { name: 'Chiapas', x: 523, y: 346, pctX: 79.24, pctY: 79.54 },
  '08': { name: 'Chihuahua', x: 256, y: 121, pctX: 38.79, pctY: 27.82 },
  '09': { name: 'Ciudad de México', x: 394, y: 301, pctX: 59.7, pctY: 69.2 },
  '10': { name: 'Durango', x: 283, y: 193, pctX: 42.88, pctY: 44.37 },
  '11': { name: 'Guanajuato', x: 355, y: 271, pctX: 53.79, pctY: 62.3 },
  '12': { name: 'Guerrero', x: 385, y: 334, pctX: 58.33, pctY: 76.78 },
  '13': { name: 'Hidalgo', x: 401, y: 274, pctX: 60.76, pctY: 62.99 },
  '14': { name: 'Jalisco', x: 289, y: 292, pctX: 43.79, pctY: 67.13 },
  '15': { name: 'Estado de México', x: 382, y: 304, pctX: 57.88, pctY: 69.89 },
  '16': { name: 'Michoacán', x: 346, y: 304, pctX: 52.42, pctY: 69.89 },
  '17': { name: 'Morelos', x: 397, y: 310, pctX: 60.15, pctY: 71.26 },
  '18': { name: 'Nayarit', x: 283, y: 253, pctX: 42.88, pctY: 58.16 },
  '19': { name: 'Nuevo León', x: 370, y: 169, pctX: 56.06, pctY: 38.85 },
  '20': { name: 'Oaxaca', x: 442, y: 343, pctX: 66.97, pctY: 78.85 },
  '21': { name: 'Puebla', x: 424, y: 308, pctX: 64.24, pctY: 70.8 },
  '22': { name: 'Querétaro', x: 373, y: 277, pctX: 56.52, pctY: 63.68 },
  '23': { name: 'Quintana Roo', x: 595, y: 277, pctX: 90.15, pctY: 63.68 },
  '24': { name: 'San Luis Potosí', x: 364, y: 244, pctX: 55.15, pctY: 56.09 },
  '25': { name: 'Sinaloa', x: 217, y: 178, pctX: 32.88, pctY: 40.92 },
  '26': { name: 'Sonora', x: 184, y: 103, pctX: 27.88, pctY: 23.68 },
  '27': { name: 'Tabasco', x: 520, y: 313, pctX: 78.79, pctY: 71.95 },
  '28': { name: 'Tamaulipas', x: 397, y: 220, pctX: 60.15, pctY: 50.57 },
  '29': { name: 'Tlaxcala', x: 412, y: 295, pctX: 62.42, pctY: 67.82 },
  '30': { name: 'Veracruz', x: 484, y: 325, pctX: 73.33, pctY: 74.71 },
  '31': { name: 'Yucatán', x: 580, y: 253, pctX: 87.88, pctY: 58.16 },
  '32': { name: 'Zacatecas', x: 316, y: 229, pctX: 47.88, pctY: 52.64 },
};

export function getStateCinematicAnchor(stateId: string): StateAnchor {
  return (
    STATE_CINEMATIC_ANCHORS[stateId] ?? {
      name: 'México',
      x: 330,
      y: 218,
      pctX: 50.0,
      pctY: 50.0,
    }
  );
}
