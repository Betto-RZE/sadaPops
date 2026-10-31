export interface GeneroMockData {
  year: number;
  type: string;
  womenRate: number;
  menRate: number;
  difference: number;
  winner: 'mujeres' | 'hombres';
  explanation: string;
  storytelling: {
    keyFinding: string;
    description: string;
    contextNote: string;
  };
}
