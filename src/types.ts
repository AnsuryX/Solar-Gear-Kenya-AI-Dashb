export interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  level: 'info' | 'warning' | 'success' | 'error';
  message: string;
  payload?: any;
}

export type ActiveTab = 'overview' | 'agents' | 'n8n' | 'blueprint';

export interface CompetitorRanking {
  keyword: string;
  solarGear: number;
  competitorA: number; // SolarLux East Africa
  competitorB: number; // Davis & Shirtliff
  competitorC: number; // Chloride Exide
}

export interface BlogAsset {
  topic: string;
  content: string;
  social: string;
  timestamp: string;
}

export interface GmbReviewDraft {
  reviewer: string;
  reviewText: string;
  responseDraft: string;
}

export interface N8nWorkflow {
  name: string;
  nodes: Array<{
    parameters: Record<string, any>;
    id: string;
    name: string;
    type: string;
    typeVersion: number;
    position: [number, number];
  }>;
  connections: Record<string, {
    main: Array<Array<{
      node: string;
      type: string;
      index: number;
    }>>;
  }>;
}
