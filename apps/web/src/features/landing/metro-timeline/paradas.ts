/**
 * Contenido de las tres paradas hacia la elección federal del 6 de junio de 2027.
 * Textos aprobados (Borrador 3) — NO modificar la redacción.
 */

export type ParadaTone = 'dalia' | 'indigo' | 'navy';

export interface ParadaLink {
  label: string;
  href: string;
}

export interface Parada {
  id: 'hoy' | 'mas-adelante' | 'jornada';
  /** Numeral editorial */
  numero: '01' | '02' | '03';
  /** Badge monospace */
  cuando: string;
  /** Rótulo corto para el panel de la estación */
  rotulo: string;
  titulo: string;
  descripcion: string;
  /** Enlace oficial del INE (si aplica) */
  enlace?: ParadaLink;
  /** Nota de cierre cuando no hay enlace */
  nota?: string;
  tone: ParadaTone;
}

export const PARADAS: readonly Parada[] = [
  {
    id: 'hoy',
    numero: '01',
    cuando: 'HOY',
    rotulo: 'HOY',
    titulo: 'Revisa si tu credencial está vigente',
    descripcion:
      'Revisa si tu credencial está vigente; si te mudaste o estudias en otra ciudad, consulta las fechas límite del calendario oficial del INE para actualizar tu domicilio, o conoce cómo funcionan las casillas especiales.',
    enlace: {
      label: 'Verificar vigencia en la Lista Nominal',
      href: 'https://listanominal.ine.mx/',
    },
    tone: 'dalia',
  },
  {
    id: 'mas-adelante',
    numero: '02',
    cuando: 'MÁS ADELANTE',
    rotulo: 'MÁS ADELANTE',
    titulo: 'Conoce qué se elige y ubica tu casilla',
    descripcion:
      'Conoce qué cargos se eligen en tu estado y ubica tu casilla cuando el INE publique el listado oficial.',
    enlace: {
      label: 'Portal Ubica tu Casilla',
      href: 'https://ubicatucasilla.ine.mx/',
    },
    tone: 'indigo',
  },
  {
    id: 'jornada',
    numero: '03',
    cuando: 'DOMINGO 6 DE JUNIO DE 2027',
    rotulo: '6 JUN 2027',
    titulo: 'La jornada electoral',
    descripcion:
      'La jornada electoral. Las casillas electorales reciben a las y los electores en todo el país de 8:00 a 18:00 horas.',
    nota: 'Voto libre, personal y secreto en casilla',
    tone: 'navy',
  },
] as const;
