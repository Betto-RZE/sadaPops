export interface DaliaStateAggregate {
  state_id: string;
  state_name: string;
  count: number;
  is_aggregated_to_state: boolean;
}

export interface DaliaMunicipalAggregate {
  municipality_id: string | null;
  municipality_name: string | null;
  state_id: string;
  count: number;
  is_aggregated_to_state: boolean;
}

export interface CCPCQuestionResponse {
  question_id: string;
  question_title: string;
  recommended_chart: 'bar' | 'line' | 'heatmap';
  context_phrase: string;
  data: Array<Record<string, any>>;
}

export interface UserSessionProgress {
  session_token: string;
  completed_narrativa: boolean;
  completed_dashboard: boolean;
  completed_juego: boolean;
  can_register_dalia: boolean;
}
