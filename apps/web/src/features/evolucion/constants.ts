import { ParticipationData, TransitionData } from './types';

/**
 * Datos oficiales de Conteos Censales de Participación Ciudadana (CCPC) 2009–2024 del INE.
 * Valores exactos sin redondeos arbitrarios.
 */
export const PARTICIPATION_DATA: ParticipationData[] = [
  {
    year: 2009,
    participation: 44.1,
    change: null,
    activeOutOfTen: 4,
    outOfTenPhrase: '4 de cada 10 personas',
    type: 'Elección federal',
    description: 'En 2009 participó el 44.1% de la ciudadanía considerada en el conteo.',
  },
  {
    year: 2012,
    participation: 62.1,
    change: 18.0,
    activeOutOfTen: 6,
    outOfTenPhrase: '6 de cada 10 personas',
    type: 'Elección federal',
    description: 'En 2012 participó el 62.1% de la ciudadanía considerada en el conteo.',
  },
  {
    year: 2015,
    participation: 47.1,
    change: -15.0,
    activeOutOfTen: 5,
    outOfTenPhrase: 'Casi 5 de cada 10 personas',
    type: 'Elección federal',
    description: 'En 2015 participó el 47.1% de la ciudadanía considerada en el conteo.',
  },
  {
    year: 2018,
    participation: 62.4,
    change: 15.3,
    activeOutOfTen: 6,
    outOfTenPhrase: '6 de cada 10 personas',
    type: 'Elección federal',
    description: 'En 2018 participó el 62.4% de la ciudadanía considerada en el conteo.',
  },
  {
    year: 2021,
    participation: 51.8,
    change: -10.6,
    activeOutOfTen: 5,
    outOfTenPhrase: '5 de cada 10 personas',
    type: 'Elección federal',
    description: 'En 2021 participó el 51.8% de la ciudadanía considerada en el conteo.',
  },
  {
    year: 2024,
    participation: 59.7,
    change: 7.9,
    activeOutOfTen: 6,
    outOfTenPhrase: 'Casi 6 de cada 10 personas',
    type: 'Elección federal',
    description: 'En 2024 participó el 59.7% de la ciudadanía considerada en el conteo.',
  },
];

// Alias para mantener compatibilidad si algún componente lo requiere
export const TIMELINE_DATA = PARTICIPATION_DATA;

/**
 * Transiciones directas entre elecciones consecutivas calculadas en puntos porcentuales.
 */
export const TRANSITIONS_DATA: TransitionData[] = [
  {
    fromYear: 2009,
    toYear: 2012,
    fromRate: 44.1,
    toRate: 62.1,
    changePts: 18.0,
    direction: 'up',
    description: 'Salto de 44.1% a 62.1% con una alta movilización en la elección federal.',
  },
  {
    fromYear: 2012,
    toYear: 2015,
    fromRate: 62.1,
    toRate: 47.1,
    changePts: -15.0,
    direction: 'down',
    description: 'Descenso habitual de la participación en elecciones intermedias.',
  },
  {
    fromYear: 2015,
    toYear: 2018,
    fromRate: 47.1,
    toRate: 62.4,
    changePts: 15.3,
    direction: 'up',
    description: 'Máximo histórico del periodo analizado, alcanzando el 62.4%.',
  },
  {
    fromYear: 2018,
    toYear: 2021,
    fromRate: 62.4,
    toRate: 51.8,
    changePts: -10.6,
    direction: 'down',
    description: 'Ajuste cíclico hacia elección intermedia, manteniéndose por encima del 50%.',
  },
  {
    fromYear: 2021,
    toYear: 2024,
    fromRate: 51.8,
    toRate: 59.7,
    changePts: 7.9,
    direction: 'up',
    description: 'Nuevo repunte significativo hacia el 59.7% en la jornada electoral más reciente.',
  },
];
