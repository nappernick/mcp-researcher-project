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