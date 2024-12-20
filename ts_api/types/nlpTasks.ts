// src/types/nlpTasks.ts

export interface SummarizeTextArgs {
  text: string;
}

export interface SummarizeTextResult {
  summary: string;
}

export interface ExtractEntitiesArgs {
  text: string;
}

export interface ExtractEntitiesResult {
  entities: {
    id: string;
    name: string;
    type: string;
    description?: string;
  }[];
  relations: {
    id: string;
    source: string;
    target: string;
    type: string;
  }[];
}

export interface ImproveGraphArgs {
  entities: any[];
  relations: any[];
  instructions: string;
}

export interface ImproveGraphResult {
  entities: any[];
  relations: any[];
}

export interface TokenCountArgs {
  text: string;
}

export interface TokenCountResult {
  token_count: number;
}