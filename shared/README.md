# Shared Module

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-stable-green.svg)

This module contains shared types, utilities, and schemas used across the MCP implementation. It provides standardized error handling, logging, and schema validation.

## Version Information

Current stable version: v1.0.0-shared

This version provides:
- Complete MCP message schemas
- Standardized error handling through McpError
- Unified logging interface (ILogger)
- Comprehensive test coverage
- Example messages for all major operations

### Breaking Changes

First stable release - future versions will maintain backward compatibility within the 1.x series.

## Core Components

### Error Handling

The shared module provides a standardized error handling mechanism through `McpError`:

```typescript
import { McpError, ErrorCode } from 'shared/utils/errors';

// Throwing an MCP error
throw new McpError(
  ErrorCode.InvalidParams,
  "Invalid input parameters",
  validationErrors
);
```

Error codes follow the JSON-RPC 2.0 specification:

- `-32700`: Parse Error
- `-32600`: Invalid Request
- `-32601`: Method Not Found
- `-32602`: Invalid Params
- `-32603`: Internal Error
- `-32000`: Protocol Version Mismatch
- `-32001`: Capability Negotiation Failed

### Logging

A consistent logging interface is provided through `ILogger`:

```typescript
import { ILogger } from 'shared/utils/loggerInterface';

class MyLogger implements ILogger {
  debug(message: string, meta?: Record<string, unknown>): void {
    // Implementation
  }
  info(message: string, meta?: Record<string, unknown>): void {
    // Implementation
  }
  warn(message: string, meta?: Record<string, unknown>): void {
    // Implementation
  }
  error(message: string, meta?: Record<string, unknown>): void {
    // Implementation
  }
}
```

A default console implementation is provided:

```typescript
import { ConsoleLogger } from 'shared/utils/loggerInterface';

const logger = new ConsoleLogger();
logger.info("Operation completed", { details: "..." });
```

### Schema Validation

JSON Schema validation is handled through the `validateInput` utility:

```typescript
import { validateInput } from 'shared/utils/validation';
import mySchema from './my.schema.json';

try {
  validateInput(mySchema, inputData);
} catch (error) {
  if (error instanceof McpError) {
    logger.error("Validation failed", {
      code: error.code,
      data: error.data
    });
  }
}
```

## MCP Schemas

The module includes JSON schemas for all MCP messages:

### Core Protocol
- `initialize.schema.json`: Initialize request
- `initializeResult.schema.json`: Initialize response
- `ping.schema.json`: Ping request
- `pingResponse.schema.json`: Ping response

### Methods
- `prompts.list.schema.json`: List prompts request
- `prompts.list.response.schema.json`: List prompts response
- `tools.list.schema.json`: List tools request
- `tools.list.response.schema.json`: List tools response
- `resources.read.schema.json`: Read resource request
- `resources.read.response.schema.json`: Read resource response

## Model Provider Interface

A standardized interface for model providers:

```typescript
import { ModelProvider, ToolFunction, ToolResult } from 'shared/types/providerTypes';

class MyProvider implements ModelProvider {
  async generateResponse(prompt: string): Promise<string> {
    // Implementation
  }

  async generateWithTools(
    messages: any[],
    tools: ToolFunction[]
  ): Promise<{
    response?: string;
    toolCalls?: ToolCall[];
  }> {
    // Implementation
  }

  async continueWithToolResult(
    messages: any[],
    tools: ToolFunction[],
    toolResults: ToolResult[]
  ): Promise<{
    response: string;
  }> {
    // Implementation
  }
}
```

## Tool Interfaces

Standardized interfaces for working with tools:

```typescript
import { 
  ToolFunction,
  ToolCall,
  ToolResult,
  ToolResponse 
} from 'shared/types/providerTypes';

// Define a tool
const myTool: ToolFunction = {
  name: "my_tool",
  description: "Does something useful",
  input_schema: {
    type: "object",
    properties: {
      input: { type: "string" }
    }
  }
};

// Handle a tool call
const handleToolCall = async (toolCall: ToolCall): Promise<ToolResponse> => {
  try {
    const result = await someOperation(toolCall.arguments);
    return {
      success: true,
      result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

# Configuration Guide

This document describes the configuration options and capabilities negotiation in the MCP implementation.

## Capabilities

Capabilities define what features are supported by clients and servers. They are negotiated during the initialize handshake.

### Client Capabilities

```typescript
interface ClientCapabilities {
  // Experimental features that may not be stable
  experimental?: Record<string, any>;
  
  // Root-level capabilities
  roots?: {
    // Whether the client supports notifications about root changes
    listChanged?: boolean;
  };
  
  // Sampling configuration for metrics/telemetry
  sampling?: Record<string, any>;
}
```

#### Example Client Capabilities

```json
{
  "experimental": {
    "customFeature": true
  },
  "roots": {
    "listChanged": true
  },
  "sampling": {
    "enabled": true,
    "rate": 0.1
  }
}
```

### Server Capabilities

```typescript
interface ServerCapabilities {
  // Experimental features that may not be stable
  experimental?: Record<string, any>;
  
  // List of protocol versions supported by the server
  supportedProtocolVersions?: string[];
  
  // Prompt-related capabilities
  prompts?: {
    // Whether the server supports notifications about prompt changes
    listChanged?: boolean;
  };
  
  // Resource-related capabilities
  resources?: {
    // Whether the server supports resource subscriptions
    subscribe?: boolean;
    // Whether the server supports notifications about resource changes
    listChanged?: boolean;
  };
  
  // Tool-related capabilities
  tools?: {
    // Whether the server supports notifications about tool changes
    listChanged?: boolean;
  };
  
  // Logging capabilities
  logging?: {
    // Supported log levels
    levels?: Array<'debug' | 'info' | 'warn' | 'error'>;
    [key: string]: any;
  };
  
  // Maximum number of items in batch operations
  maxBatchSize?: number;
}
```

#### Example Server Capabilities

```json
{
  "experimental": {
    "betaFeature": true
  },
  "supportedProtocolVersions": ["2024-11-05"],
  "prompts": {
    "listChanged": true
  },
  "resources": {
    "subscribe": true,
    "listChanged": true
  },
  "tools": {
    "listChanged": true
  },
  "logging": {
    "levels": ["debug", "info", "warn", "error"]
  },
  "maxBatchSize": 10
}
```

## Capability Negotiation

During initialization:

1. Client sends its capabilities in the initialize request
2. Server responds with its capabilities in the initialize response
3. Both sides respect the intersection of supported features

### Example Negotiation

```typescript
// Client sends
const clientCaps = {
  experimental: {
    feature1: true
  },
  roots: {
    listChanged: true
  }
};

// Server responds
const serverCaps = {
  experimental: {
    feature1: true
  },
  prompts: {
    listChanged: true
  }
};

// Both sides can now use:
// - experimental.feature1
// Client can use:
// - roots.listChanged
// Server can use:
// - prompts.listChanged
```

## Best Practices

1. Always check capabilities before using features
2. Use optional chaining when accessing capability properties
3. Provide sensible defaults when capabilities are missing
4. Document any new capabilities in both interfaces and schemas
5. Add tests for new capabilities

## Testing

The module includes comprehensive tests for all components:

- `validation.test.ts`: Schema validation and error handling
- `tools.test.ts`: Model provider and tool interfaces
- `schemas.test.ts`: MCP message schemas
- `examples.test.ts`: Validation of example MCP messages

Run tests with:

```bash
npm test
```

## Usage Guidelines

1. Always use `McpError` for error handling
2. Implement `ILogger` for consistent logging
3. Use schema validation for all MCP messages
4. Follow the `ModelProvider` interface for new providers
5. Use the standardized tool interfaces for tool implementations

## Contributing

When adding new features:

1. Add appropriate JSON schemas
2. Update TypeScript interfaces
3. Add comprehensive tests
4. Update this documentation

## Example Messages

The `shared/examples/` directory contains reference implementations of MCP messages:

### Valid Examples
- `initialize_request.json`: Complete initialize request
- `initialize_response.json`: Complete initialize response
- `tool_call.json`: Tool call request

### Invalid Examples
- `initialize_request_missing_version.json`: Missing required protocol version
- `initialize_response_wrong_version.json`: Invalid JSON-RPC version

These examples serve as both documentation and test cases. They are validated against 
their corresponding schemas in the test suite.

## Contributing

### Version Guidelines

- Patch versions (1.0.x): Bug fixes and minor updates
- Minor versions (1.x.0): New features, backward compatible
- Major versions (x.0.0): Breaking changes

When contributing, please ensure:
1. All tests pass
2. No lint warnings
3. Documentation is updated
4. Examples reflect any changes

### Release Checklist

Before tagging a new release:

- [ ] All tests pass (`npm test`)
- [ ] No lint warnings (`npm run lint`)
- [ ] Version numbers updated:
  - [ ] package.json
  - [ ] README.md badges
- [ ] Documentation reflects all changes
- [ ] Example messages are up to date
- [ ] CHANGELOG.md updated
- [ ] Git tag matches package version


