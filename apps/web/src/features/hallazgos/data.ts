/**
 * Hallazgos calculados a partir de los Conteos Censales de Participación Ciudadana (CCPC)
 * 2009–2024 que ya usa la historia de edades (`AGE_DATA`). No hay cifras escritas a mano:
 * todo se deriva de esos conteos, para que cada frase quede respaldada por los datos.
 */
import { AGE_DATA, AGE_ELECTION_YEARS } from '@/features/edades/constants';

export const YEARS = AGE_ELECTION_YEARS;
export const AGE_GROUPS = AGE_DATA[YEARS[0]].map((row) => row.group);
const PRESIDENTIAL = new Set([2012, 2018, 2024]);
export const isPresidential = (year: number) => PRESIDENTIAL.has(year);

/** Participación nacional CCPC: votaron ÷ (votaron + no votaron). */
export const NATIONAL = YEARS.map((year) => {
  const rows = AGE_DATA[year];
  const voted = rows.reduce((sum, row) => sum + row.voted, 0);
  const notVoted = rows.reduce((sum, row) => sum + row.notVoted, 0);
  const unspecified = rows.reduce((sum, row) => sum + row.unspecified, 0);
  const nominal = rows.reduce((sum, row) => sum + row.listNominal, 0);
  const women = rows.reduce((sum, row) => sum + row.womenVoted, 0);
  return {
    year,
    rate: (voted / (voted + notVoted)) * 100,
    womenShare: (women / voted) * 100,
    unspecifiedShare: (unspecified / nominal) * 100,
    unspecified,
    voted,
    notVoted,
    nominal,
  };
});

/** Hallazgo 1 · La curva de la edad en cada elección. */
export const AGE_CURVES = YEARS.map((year) => ({ year, rates: AGE_DATA[year].map((row) => row.participation) }));

export const ageCurveFacts = (() => {
  const firstAboveValley = AGE_CURVES.every(({ rates }) => rates[0] > rates[1] && rates[0] > rates[2]);
  const valleyInTwenties = AGE_CURVES.every(({ rates }) => Math.min(...rates) === Math.min(rates[1], rates[2]));
  const peakIdx = AGE_GROUPS.indexOf('60–69');
  const peakAlways6069 = AGE_CURVES.every(({ rates }) => Math.max(...rates) === rates[peakIdx]);
  const latest = AGE_CURVES[AGE_CURVES.length - 1];
  return {
    firstAboveValley,
    valleyInTwenties,
    peakAlways6069,
    latestYear: latest.year,
    latestFirst: latest.rates[0],
    latestValley: Math.min(latest.rates[1], latest.rates[2]),
    latestPeak: latest.rates[peakIdx],
    peakIdx,
  };
})();

/** Hallazgo 2 · Composición del voto por sexo (no tasa): qué parte de los votos emitieron mujeres. */
export const womenShareRange = {
  min: Math.min(...NATIONAL.map((item) => item.womenShare)),
  max: Math.max(...NATIONAL.map((item) => item.womenShare)),
  latest: NATIONAL[NATIONAL.length - 1].womenShare,
};

/** Hallazgo 3 · Saltos entre elecciones consecutivas (intermedia ↔ presidencial). */
export const SWINGS = NATIONAL.slice(1).map((item, index) => ({
  from: NATIONAL[index].year,
  to: item.year,
  value: Math.abs(item.rate - NATIONAL[index].rate),
}));

/** Hallazgo 4 · Registros sin participación especificada (NS), fuera de la tasa oficial. */
export const unspecifiedLatest = NATIONAL[NATIONAL.length - 1];
