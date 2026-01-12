
export enum Page {
  Planner = 'Planner',
  Analyzer = 'Analyzer',
  Coaching = 'Coaching'
}

export interface CoachingData {
  scores: number[];
  reflection: string;
}

export interface AnalysisResult {
  content: string;
  timestamp: string;
}
