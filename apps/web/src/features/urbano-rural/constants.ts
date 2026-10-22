/**
 * Participación por tipo de sección electoral, según cifras PUBLICADAS por el INE/IFE.
 *
 * Importante:
 * - Salvo 2012 (estudio censal), las cifras provienen de los Estudios Muestrales sobre
 *   la Participación Ciudadana. No son los Conteos Censales (CCPC) que usan las otras
 *   historias, así que no deben mezclarse con ellos.
 * - No todos los años desagregan las tres categorías. Un valor `null` significa que el
 *   informe no lo publica; nunca se rellena ni se estima.
 * - `noUrbana` agrupa secciones rurales y mixtas cuando el informe solo reporta ese total.
 */
export type Zone = 'urbana' | 'mixta' | 'rural';

export const ZONES: Zone[] = ['urbana', 'mixta', 'rural'];
export const ZONE_YEARS = [2009, 2012, 2015, 2018, 2021, 2024] as const;
export type ZoneYear = (typeof ZONE_YEARS)[number];

/** Tonos de similar intensidad: ninguna zona domina visualmente a otra. */
export const ZONE_META: Record<Zone, { label: string; color: string; tint: string; definition: string }> = {
  urbana: { label: 'Urbana', color: '#5E6F8C', tint: '#E4E8EF', definition: 'Secciones con localidades urbanas, de 2,500 habitantes o más.' },
  mixta: { label: 'Mixta', color: '#8170A8', tint: '#ECE7F4', definition: 'Secciones que combinan localidades urbanas y rurales.' },
  rural: { label: 'Rural', color: '#5F8159', tint: '#E6EEE2', definition: 'Secciones con localidades rurales, de menos de 2,500 habitantes.' },
};

export type ZoneRecord = {
  values: Record<Zone, number | null>;
  /** Total de secciones no urbanas (rural + mixta), cuando el informe solo publica ese agregado. */
  noUrbana: number | null;
  study: string;
  source: { label: string; href: string };
  notes: string[];
};

export const ZONE_DATA: Record<ZoneYear, ZoneRecord> = {
  2009: {
    values: { urbana: 42.8, mixta: null, rural: null },
    noUrbana: 46.2,
    study: 'Estudio muestral 2009',
    source: { label: 'IFE · Estudio muestral sobre la participación ciudadana en las elecciones federales de 2009, p. 29', href: 'https://portal.ine.mx/wp-content/uploads/2019/12/DECEyEC-EstudioMuestralPartCiudEleccFed2009.pdf' },
    notes: ['El informe solo distingue secciones urbanas y no urbanas (rurales y mixtas juntas).'],
  },
  2012: {
    values: { urbana: 61.66, mixta: null, rural: 64.18 },
    noUrbana: null,
    study: 'Estudio censal 2012',
    source: { label: 'INE · Estudio muestral 2018, antecedentes (cita el estudio censal 2012), p. 7', href: 'https://centralelectoral.ine.mx/wp-content/uploads/2019/08/3-EMPC-2018_REVISION_150819.pdf' },
    notes: ['La fuente consultada no reporta las secciones mixtas para 2012.'],
  },
  2015: {
    values: { urbana: 44.9, mixta: 48.4, rural: 54.5 },
    noUrbana: 51.9,
    study: 'Estudio muestral 2015',
    source: { label: 'INE · Estudio muestral 2021, gráfica 17 (comparativo 2015–2021)', href: 'https://repositoriodocumental.ine.mx/xmlui/bitstream/handle/123456789/141932/coe-6se-25-08-2022-p05.pdf' },
    notes: ['El mismo informe cita 44.3% para las secciones urbanas en el texto; usamos el valor de la gráfica.'],
  },
  2018: {
    values: { urbana: 61.9, mixta: null, rural: 64.5 },
    noUrbana: 63.3,
    study: 'Estudio muestral 2018',
    source: { label: 'INE · Estudio muestral sobre la participación ciudadana 2018, pp. 26–28', href: 'https://centralelectoral.ine.mx/wp-content/uploads/2019/08/3-EMPC-2018_REVISION_150819.pdf' },
    notes: ['El valor rural se calcula como 100% menos la abstención rural reportada (35.5%).', 'El informe no publica el valor de las secciones mixtas por separado.'],
  },
  2021: {
    values: { urbana: 50.1, mixta: 52.2, rural: 58.4 },
    noUrbana: 55.6,
    study: 'Estudio muestral 2021',
    source: { label: 'INE · Estudio muestral sobre la participación ciudadana 2021, gráficas 16 y 17', href: 'https://repositoriodocumental.ine.mx/xmlui/bitstream/handle/123456789/141932/coe-6se-25-08-2022-p05.pdf' },
    notes: [],
  },
  2024: {
    values: { urbana: 60.0, mixta: 58.0, rural: 60.3 },
    noUrbana: null,
    study: 'Estudio muestral 2024',
    source: { label: 'INE · Central Electoral, participación 2024 por tipo de sección (17 jul 2025)', href: 'https://centralelectoral.ine.mx/2025/07/17/te-contamos-cual-fue-la-participacion-ciudadana-en-2024-en-las-secciones-urbana-y-rural/' },
    notes: [],
  },
};

/** Diferencia en puntos porcentuales frente a las secciones urbanas, con lo que publique cada año. */
export const gapFor = (year: ZoneYear) => {
  const record = ZONE_DATA[year];
  const urbana = record.values.urbana;
  if (urbana === null) return null;
  if (record.values.rural !== null) return { label: 'rural − urbana', value: record.values.rural - urbana };
  if (record.noUrbana !== null) return { label: 'no urbana − urbana', value: record.noUrbana - urbana };
  return null;
};
