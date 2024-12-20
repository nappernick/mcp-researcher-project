// Types
export type { 
  LogLevel,
  BaseConfig,
  ModelConfig,
  DatabaseConfig,
  AppConfig 
} from './types/configTypes';

export type {
  Entity,
  Relation,
  ToolDefinition,
  ToolFunction
} from './types/modelTypes';

export type {
  ModelProvider,
  ToolResponse,
  ToolCall,
  ToolResult
} from './types/providerTypes';

// Utils
export { ConfigLoader } from './utils/configLoader';
export { McpError, ErrorCode } from './utils/errors';
export type { ILogger } from './utils/loggerInterface';
export { ConsoleLogger } from './utils/loggerInterface';
export { validateInput } from './utils/validation';

// Schemas - use import.meta.dir for path resolution
const schemaDir = import.meta.dir + '/schemas';
export const entitySchema = await import('./schemas/entity.schema.json', { assert: { type: 'json' }});
export const relationSchema = await import('./schemas/relation.schema.json', { assert: { type: 'json' }});
export const toolSchema = await import('./schemas/tool.schema.json', { assert: { type: 'json' }});

// MCP
export * from './types/mcpTypes';
export * from './constants/mcpMethods';
export { 
  negotiateProtocolVersion, 
  validateInitializeRequest, 
  validateInitializeResult, 
  validatePingRequest, 
  validatePingResponse, 
  parseClientCapabilities, 
  parseServerCapabilities 
} from './utils/mcpHelpers';

// MCP Notifications Helpers
export { 
  createMcpNotification, 
  createInitializedNotification, 
  createPingResponseNotification 
} from './utils/mcpNotifications';

