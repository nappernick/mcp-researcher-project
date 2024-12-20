export interface Entity {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export interface Relation {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: object;
  outputSchema?: object;
} 

export interface ToolFunction {
  name: string;
  description: string;
  input_schema: any;
}