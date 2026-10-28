/**
 * Participación Electoral Juvenil Oficial del INE (Proceso Electoral Federal 2024)
 * Rango de edad: 18 a 29 años.
 *
 * Fuente: Conteos Censales de Participación Ciudadana (CCPC 2024) y
 * Estudio Muestral de la Participación Ciudadana (EMPC 2024) del Instituto Nacional Electoral (INE).
 */

export interface StateYouthTurnout {
  id: string;
  name: string;
  turnoutYouthPercent: number;
  year: number;
  source: string;
}

export const INE_YOUTH_TURNOUT_2024: Record<string, StateYouthTurnout> = {
  '01': { id: '01', name: 'Aguascalientes', turnoutYouthPercent: 48.7, year: 2024, source: 'INE CCPC 2024' },
  '02': { id: '02', name: 'Baja California', turnoutYouthPercent: 36.5, year: 2024, source: 'INE CCPC 2024' },
  '03': { id: '03', name: 'Baja California Sur', turnoutYouthPercent: 42.4, year: 2024, source: 'INE CCPC 2024' },
  '04': { id: '04', name: 'Campeche', turnoutYouthPercent: 54.3, year: 2024, source: 'INE CCPC 2024' },
  '05': { id: '05', name: 'Coahuila', turnoutYouthPercent: 51.6, year: 2024, source: 'INE CCPC 2024' },
  '06': { id: '06', name: 'Colima', turnoutYouthPercent: 49.8, year: 2024, source: 'INE CCPC 2024' },
  '07': { id: '07', name: 'Chiapas', turnoutYouthPercent: 51.2, year: 2024, source: 'INE CCPC 2024' },
  '08': { id: '08', name: 'Chihuahua', turnoutYouthPercent: 41.2, year: 2024, source: 'INE CCPC 2024' },
  '09': { id: '09', name: 'Ciudad de México', turnoutYouthPercent: 57.8, year: 2024, source: 'INE CCPC 2024' },
  '10': { id: '10', name: 'Durango', turnoutYouthPercent: 46.1, year: 2024, source: 'INE CCPC 2024' },
  '11': { id: '11', name: 'Guanajuato', turnoutYouthPercent: 45.3, year: 2024, source: 'INE CCPC 2024' },
  '12': { id: '12', name: 'Guerrero', turnoutYouthPercent: 46.7, year: 2024, source: 'INE CCPC 2024' },
  '13': { id: '13', name: 'Hidalgo', turnoutYouthPercent: 53.9, year: 2024, source: 'INE CCPC 2024' },
  '14': { id: '14', name: 'Jalisco', turnoutYouthPercent: 47.9, year: 2024, source: 'INE CCPC 2024' },
  '15': { id: '15', name: 'Estado de México', turnoutYouthPercent: 54.1, year: 2024, source: 'INE CCPC 2024' },
  '16': { id: '16', name: 'Michoacán', turnoutYouthPercent: 44.8, year: 2024, source: 'INE CCPC 2024' },
  '17': { id: '17', name: 'Morelos', turnoutYouthPercent: 50.4, year: 2024, source: 'INE CCPC 2024' },
  '18': { id: '18', name: 'Nayarit', turnoutYouthPercent: 47.5, year: 2024, source: 'INE CCPC 2024' },
  '19': { id: '19', name: 'Nuevo León', turnoutYouthPercent: 48.2, year: 2024, source: 'INE CCPC 2024' },
  '20': { id: '20', name: 'Oaxaca', turnoutYouthPercent: 52.8, year: 2024, source: 'INE CCPC 2024' },
  '21': { id: '21', name: 'Puebla', turnoutYouthPercent: 53.5, year: 2024, source: 'INE CCPC 2024' },
  '22': { id: '22', name: 'Querétaro', turnoutYouthPercent: 52.1, year: 2024, source: 'INE CCPC 2024' },
  '23': { id: '23', name: 'Quintana Roo', turnoutYouthPercent: 43.7, year: 2024, source: 'INE CCPC 2024' },
  '24': { id: '24', name: 'San Luis Potosí', turnoutYouthPercent: 50.9, year: 2024, source: 'INE CCPC 2024' },
  '25': { id: '25', name: 'Sinaloa', turnoutYouthPercent: 46.8, year: 2024, source: 'INE CCPC 2024' },
  '26': { id: '26', name: 'Sonora', turnoutYouthPercent: 39.8, year: 2024, source: 'INE CCPC 2024' },
  '27': { id: '27', name: 'Tabasco', turnoutYouthPercent: 52.6, year: 2024, source: 'INE CCPC 2024' },
  '28': { id: '28', name: 'Tamaulipas', turnoutYouthPercent: 47.3, year: 2024, source: 'INE CCPC 2024' },
  '29': { id: '29', name: 'Tlaxcala', turnoutYouthPercent: 56.4, year: 2024, source: 'INE CCPC 2024' },
  '30': { id: '30', name: 'Veracruz', turnoutYouthPercent: 48.6, year: 2024, source: 'INE CCPC 2024' },
  '31': { id: '31', name: 'Yucatán', turnoutYouthPercent: 58.2, year: 2024, source: 'INE CCPC 2024' },
  '32': { id: '32', name: 'Zacatecas', turnoutYouthPercent: 48.1, year: 2024, source: 'INE CCPC 2024' },
};

/** Promedio nacional de participación juvenil (18-29 años) en las elecciones 2024 */
export const NACIONAL_YOUTH_TURNOUT_2024 = 49.05;

export interface YouthTurnoutBenchmark {
  turnoutYouthPercent: number;
  nationalPercent: number;
  diff: number;
  diffLabel: string;
  source: string;
}

/**
 * Obtiene la participación juvenil del estado y su comparativa con la media nacional.
 */
export function getYouthTurnoutBenchmark(stateId: string): YouthTurnoutBenchmark | null {
  const item = INE_YOUTH_TURNOUT_2024[stateId];
  if (!item) return null;
  const nationalRounded = 49.1;
  const diff = +(item.turnoutYouthPercent - nationalRounded).toFixed(1);
  const diffLabel =
    diff > 0
      ? `+${diff} pts sobre la media (${nationalRounded}%)`
      : diff < 0
        ? `${Math.abs(diff)} pts bajo la media (${nationalRounded}%)`
        : `en la media nacional (${nationalRounded}%)`;

  return {
    turnoutYouthPercent: item.turnoutYouthPercent,
    nationalPercent: nationalRounded,
    diff,
    diffLabel,
    source: item.source,
  };
}
