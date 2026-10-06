export type ElectionType = 'PRESIDENCIAL' | 'INTERMEDIA';

export interface ParticipationData {
  year: number;
  type: ElectionType;
  participationRate: number | null; // null for placeholder
  nominalList: number | null;
  votes: number | null;
  label?: string;
}

export interface ChangeData {
  cycleType: string;
  comparison: string;
  differencePts: number | null;
  description: string;
  nature: string;
}
