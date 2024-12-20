# TypeScript Files

## ./index.ts

```typescript
console.log("Hello via Bun!");
```


## ./tests/configLoader.test.ts

```typescript
import { ConfigLoader } from '../utils/configLoader';
import type { AppConfig } from '../types/configTypes';

describe('ConfigLoader Tests', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    process.env = {
      NODE_ENV: 'test',
      LOG_LEVEL: 'debug',
      SERVICE_NAME: 'test-service',
      PORT: '4000',
      MODEL_NAME: 'test-model',
      DB_HOST: 'test-host'
    };
  });

  test('getInstance returns singleton instance', () => {
    const instance1 = ConfigLoader.getInstance();
    const instance2 = ConfigLoader.getInstance();
    expect(instance1).toBe(instance2);
  });

  test('loads config from environment variables', () => {
    const config = ConfigLoader.getInstance().getConfig();
    
    expect(config.environment).toBe('test');
    expect(config.logLevel).toBe('debug');
    expect(config.serviceName).toBe('test-service');
    expect(config.port).toBe(4000);
  });

  test('uses default values when environment variables are missing', () => {
    process.env = {}; // Clear all env vars
    
    const config = ConfigLoader.getInstance().getConfig();
    
    expect(config.environment).toBe('development');
    expect(config.logLevel).toBe('info');
    expect(config.port).toBe(3000);
  });

  test('updateConfig merges new config correctly', () => {
    const configLoader = ConfigLoader.getInstance();
    const newConfig: Partial<AppConfig> = {
      serviceName: 'updated-service',
      model: {
        modelName: 'new-model',
        temperature: 0.8
      }
    };
    
    configLoader.updateConfig(newConfig);
    const updatedConfig = configLoader.getConfig();
    
    expect(updatedConfig.serviceName).toBe('updated-service');
    expect(updatedConfig.model?.modelName).toBe('new-model');
    expect(updatedConfig.model?.temperature).toBe(0.8);
    // Original values should be preserved
    expect(updatedConfig.environment).toBe('test');
  });
}); 
```


## ./tests/schemas.test.ts

```typescript
import { validateInput } from '../utils/validation';
import entitySchema from '../schemas/entity.schema.json';
import relationSchema from '../schemas/relation.schema.json';

describe('Schema Tests', () => {
  describe('Entity Schema', () => {
    test('validates correct entity', () => {
      const validEntity = {
        id: "123",
        name: "Test Entity",
        type: "test",
        description: "A test entity"
      };
      
      expect(() => validateInput(entitySchema, validEntity)).not.toThrow();
    });

    test('validates entity without optional description', () => {
      const validEntity = {
        id: "123",
        name: "Test Entity",
        type: "test"
      };
      
      expect(() => validateInput(entitySchema, validEntity)).not.toThrow();
    });

    test('fails on missing required fields', () => {
      const invalidEntity = {
        id: "123",
        name: "Test Entity"
        // missing type
      };
      
      expect(() => validateInput(entitySchema, invalidEntity)).toThrow();
    });
  });

  describe('Relation Schema', () => {
    test('validates correct relation', () => {
      const validRelation = {
        id: "rel123",
        source_id: "entity1",
        target_id: "entity2",
        type: "connects_to"
      };
      
      expect(() => validateInput(relationSchema, validRelation)).not.toThrow();
    });

    test('fails on missing required fields', () => {
      const invalidRelation = {
        id: "rel123",
        source_id: "entity1",
        // missing target_id and type
      };
      
      expect(() => validateInput(relationSchema, invalidRelation)).toThrow();
    });
  });
}); 
```


## ./tests/tools.test.ts

```typescript
 
```


## ./tests/validation.test.ts

```typescript
import { validateInput } from '../utils/validation';
import { McpError, ErrorCode } from '../utils/errors';

describe('Validation Tests', () => {
  const summarizeTextTool = {
    name: "summarize_text",
    description: "Summarizes the given text.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string" }
      },
      required: ["text"],
      additionalProperties: false
    }
  };

  test('validates correct input successfully', () => {
    const input = { text: "Hello" };
    expect(() => validateInput(summarizeTextTool.inputSchema, input)).not.toThrow();
  });

  test('throws McpError on invalid input - missing required field', () => {
    const input = {};
    expect(() => validateInput(summarizeTextTool.inputSchema, input))
      .toThrow(McpError);
    
    try {
      validateInput(summarizeTextTool.inputSchema, input);
    } catch (e) {
      expect(e instanceof McpError).toBe(true);
      expect((e as McpError).code).toBe(ErrorCode.InvalidParams);
    }
  });

  test('throws McpError on invalid input - wrong type', () => {
    const input = { text: 123 };
    expect(() => validateInput(summarizeTextTool.inputSchema, input))
      .toThrow(McpError);
  });

  test('throws McpError on invalid input - additional properties', () => {
    const input = { text: "Hello", extraField: "not allowed" };
    expect(() => validateInput(summarizeTextTool.inputSchema, input))
      .toThrow(McpError);
  });
}); 
```


## ./types/configTypes.ts

```typescript
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

// Main configuration interface that can be extended by each module
export interface AppConfig extends BaseConfig {
  model?: ModelConfig;
  database?: DatabaseConfig;
  port?: number;
  host?: string;
} 
```


## ./types/modelTypes.ts

```typescript
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
```


## ./types/providerTypes.ts

```typescript
export interface ModelProvider {
  generateResponse(prompt: string, options?: Record<string, any>): Promise<string>;
  
  generateWithTools(
    messages: any[], 
    tools: any[], 
    options?: Record<string, any>
  ): Promise<{
    response?: string;
    toolCalls?: any[];
  }>;
  
  continueWithToolResult(
    messages: any[],
    tools: any[],
    toolResults: any[],
    options?: Record<string, any>
  ): Promise<{
    response: string;
  }>;
}

// Base interface for tool responses
export interface ToolResponse {
  success: boolean;
  result?: any;
  error?: string;
}

// Base interface for tool calls
export interface ToolCall {
  toolName: string;
  arguments: Record<string, any>;
} 
```


## ./utils/configLoader.ts

```typescript
import type { BaseConfig, AppConfig } from '../types/configTypes';
import { McpError, ErrorCode } from './errors';

export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  private loadConfig(): AppConfig {
    try {
      // Load from environment variables
      const config: AppConfig = {
        environment: process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development',
        logLevel: process.env.LOG_LEVEL as BaseConfig['logLevel'] || 'info',
        serviceName: process.env.SERVICE_NAME || 'nlp-module',
        port: parseInt(process.env.PORT || '3000'),
        host: process.env.HOST || 'localhost',
        
        model: {
          modelName: process.env.MODEL_NAME || 'gpt-3.5-turbo',
          apiKey: process.env.MODEL_API_KEY,
          maxTokens: parseInt(process.env.MAX_TOKENS || '2048'),
          temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
        },
        
        database: {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '27017'),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME || 'nlp_module',
        }
      };

      return config;
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        'Failed to load configuration',
        error
      );
    }
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<AppConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }
} 
```


## ./utils/errors.ts

```typescript
export enum ErrorCode {
  InvalidParams = -32602,
  InternalError = -32603,
  MethodNotFound = -32601,
}

export class McpError extends Error {
  code: ErrorCode;
  data?: any;
  
  constructor(code: ErrorCode, message: string, data?: any) {
    super(message);
    this.code = code;
    this.data = data;
    this.name = 'McpError';
  }
} 
```


## ./utils/loggerInterface.ts

```typescript
export interface ILogger {
  debug(msg: string, meta?: any): void;
  info(msg: string, meta?: any): void;
  warn(msg: string, meta?: any): void;
  error(msg: string, meta?: any): void;
}

export class ConsoleLogger implements ILogger {
  debug(msg: string, meta?: any): void {
    console.debug(msg, meta);
  }

  info(msg: string, meta?: any): void {
    console.info(msg, meta);
  }

  warn(msg: string, meta?: any): void {
    console.warn(msg, meta);
  }

  error(msg: string, meta?: any): void {
    console.error(msg, meta);
  }
} 
```


## ./utils/validation.ts

```typescript
import Ajv from 'ajv';
import { McpError, ErrorCode } from './errors';

const ajv = new Ajv();

export function validateInput(schema: object, input: any): void {
  const validate = ajv.compile(schema);
  const valid = validate(input);
  
  if (!valid) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Validation error: ${JSON.stringify(validate.errors)}`,
      validate.errors
    );
  }
} 
```

