export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface BaseConfig {
  logLevel?: LogLevel;
  environment?: 'development' | 'production' | 'test';
  serviceName?: string;
}

export interface ModelConfig extends BaseConfig {
  modelName: string;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface DatabaseConfig extends BaseConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  database: string;
  ssl?: boolean;
}

export interface AppConfig extends BaseConfig {
  model?: ModelConfig;
  database?: DatabaseConfig;
  port?: number;
  host?: string;
}

export interface ClientCapabilities {
  experimental?: Record<string, any>;
  roots?: {
    listChanged?: boolean;
  };
  sampling?: Record<string, any>;
}

/**
 * Updated ServerCapabilities to reflect MCP spec:
 * - Added `resources`, `tools`, and `logging` fields.
 * - `prompts` remains as is.
 * - `experimental` and `supportedProtocolVersions` are optional per spec.
 */
export interface ServerCapabilities {
  experimental?: Record<string, any>;
  supportedProtocolVersions?: string[];

  /**
   * Prompts capability as defined in MCP:
   * Allows server to declare prompt-related features.
   */
  prompts?: { listChanged?: boolean };

  /**
   * Resources capability: allows the server to expose resources.
   */
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };

  /**
   * Tools capability: allows the server to expose callable tools.
   */
  tools?: {
    listChanged?: boolean;
  };

  /**
   * Logging capability: allows the server to send log messages.
   * This can be an empty object or further defined if needed.
   */
  logging?: Record<string, any>;

  /**
   * Additional capability as shown in your code, max batch size for some requests.
   */
  maxBatchSize?: number;
}

export interface Implementation {
  name: string;
  version: string;
}
