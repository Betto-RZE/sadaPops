import { GeneroMockData } from './types';

export const ELECTION_YEARS = [2009, 2012, 2015, 2018, 2021, 2024] as const;

export const GENDER_MOCK_DATA: Record<number, GeneroMockData> = {
  2009: {
    year: 2009,
    type: 'Elección federal intermedia',
    womenRate: 47.3,
    menRate: 40.5,
    difference: 6.8,
    winner: 'mujeres',
    explanation: 'En las elecciones intermedias de 2009, la participación de las mujeres fue de 47.3% frente a 40.5% de los hombres, una diferencia de +6.8 puntos porcentuales a favor de las mujeres.',
    storytelling: {
      keyFinding: 'Ventaja femenina consolidada en elecciones intermedias',
      description: 'Aun en un proceso electoral intermedio con menor afluencia general, la participación de las mujeres superó a la de los hombres por 6.8 puntos porcentuales, marcando la pauta que caracterizaría a toda la serie histórica.',
      contextNote: 'Renovación de los 500 escaños de la Cámara de Diputados.',
    },
  },
  2012: {
    year: 2012,
    type: 'Elección presidencial',
    womenRate: 66.1,
    menRate: 57.8,
    difference: 8.3,
    winner: 'mujeres',
    explanation: 'En la jornada presidencial de 2012, 66.1% de las mujeres inscritas en la lista nominal votaron frente al 57.8% de los hombres, alcanzando una diferencia de +8.3 puntos porcentuales.',
    storytelling: {
      keyFinding: 'Alta participación general con amplia ventaja para las mujeres',
      description: 'La contienda por la presidencia elevó la participación de ambos grupos electorales; sin embargo, la brecha a favor de las mujeres creció hasta los 8.3 puntos porcentuales.',
      contextNote: 'Presidencia de la República, Senadurías y Diputaciones federales.',
    },
  },
  2015: {
    year: 2015,
    type: 'Elección federal intermedia',
    womenRate: 50.9,
    menRate: 43.0,
    difference: 7.9,
    winner: 'mujeres',
    explanation: 'En las elecciones intermedias de 2015, más de la mitad de las mujeres (50.9%) acudieron a votar, superando a los hombres (43.0%) por 7.9 puntos porcentuales de diferencia.',
    storytelling: {
      keyFinding: 'Participación femenina superior al 50% en comicios intermedios',
      description: 'A pesar del descenso habitual de afluencia en elecciones intermedias, las mujeres mantuvieron una sólida concurrencia ciudadana, superando a los hombres por 7.9 puntos porcentuales.',
      contextNote: 'Renovación de la Cámara de Diputados.',
    },
  },
  2018: {
    year: 2018,
    type: 'Elección presidencial',
    womenRate: 66.3,
    menRate: 58.1,
    difference: 8.2,
    winner: 'mujeres',
    explanation: 'En la elección concurrente de 2018, las mujeres alcanzaron 66.3% de participación frente al 58.1% de los hombres, registrando una diferencia de +8.2 puntos porcentuales.',
    storytelling: {
      keyFinding: 'Fuerte movilización cívica con liderazgo de las mujeres',
      description: 'Dos de cada tres mujeres inscritas en la lista nominal emitieron su voto en una de las elecciones más concurridas del país, con una diferencia de 8.2 puntos porcentuales sobre los hombres.',
      contextNote: 'Elección concurrente: Presidencia, Congreso de la Unión y cargos locales.',
    },
  },
  2021: {
    year: 2021,
    type: 'Elección federal intermedia',
    womenRate: 55.6,
    menRate: 47.8,
    difference: 7.8,
    winner: 'mujeres',
    explanation: 'En las elecciones intermedias de 2021, las mujeres registraron 55.6% de participación frente al 47.8% de los hombres (+7.8 puntos porcentuales de diferencia).',
    storytelling: {
      keyFinding: 'Resiliencia cívica femenina en un proceso intermedio clave',
      description: 'Las mujeres sostuvieron una concurrencia superior al 55% del listado nominal, conservando una ventaja de 7.8 puntos porcentuales frente a la participación masculina.',
      contextNote: 'Renovación completa de la Cámara de Diputados y 15 gubernaturas.',
    },
  },
  2024: {
    year: 2024,
    type: 'Elección presidencial',
    womenRate: 64.2,
    menRate: 54.8,
    difference: 9.4,
    winner: 'mujeres',
    explanation: 'En la elección de 2024 la diferencia fue de 9.4 puntos porcentuales (64.2% mujeres frente a 54.8% hombres), la mayor de toda la serie analizada.',
    storytelling: {
      keyFinding: 'En las seis elecciones analizadas, la participación de las mujeres fue mayor que la de los hombres',
      description: 'Para 2024, la diferencia fue de 9.4 puntos porcentuales, la mayor de la serie analizada. En las seis elecciones federales entre 2009 y 2024, las mujeres participaron de manera constante y contundente por encima de los hombres.',
      contextNote: 'Presidencia de la República, Congreso de la Unión y 9 gubernaturas estatales.',
    },
  },
};
