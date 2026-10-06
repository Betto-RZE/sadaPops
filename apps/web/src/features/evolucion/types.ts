export interface ParticipationData {
  year: number;
  participation: number; // Porcentaje real CCPC (ej: 44.1)
  change: number | null; // Diferencia en puntos porcentuales vs elección anterior
  activeOutOfTen: number; // Cantidad aproximada para representación 10 personas (ej: 4, 6, 5...)
  outOfTenPhrase: string; // Frase explicativa ('4 de cada 10 personas', 'Casi 6 de cada 10...', etc.)
  type: string; // 'Elección federal'
  description: string; // Explicación breve oficial
}

export interface TransitionData {
  fromYear: number;
  toYear: number;
  fromRate: number;
  toRate: number;
  changePts: number;
  direction: 'up' | 'down';
  description: string;
}
