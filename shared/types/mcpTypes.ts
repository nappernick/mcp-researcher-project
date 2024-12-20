// /shared/types/mcpTypes.ts

// Import necessary types from existing shared types
import { 
  JSONRPCMessage, 
  JSONRPCRequest, 
  JSONRPCResponse, 
  JSONRPCError, 
  JSONRPCNotification,
  InitializeRequest,
  InitializeResult,
  PingRequest,
  PingResponse,
  JSONRPC_VERSION
} from './mcpJSONRPCTypes';

// MCP Core Types
export type MCPClientRequest =
  | InitializeRequest
  | JSONRPCRequest
  | PingRequest;

export type MCPClientNotification =
  | JSONRPCNotification
  | InitializedNotification;

export type MCPClientResult =
  | InitializeResult
  | JSONRPCResponse
  | PingResponse;

/**
 * Update InitializedNotification to fully match JSON-RPC notification form.
 * According to MCP specs, `initialized` is a notification from client to server.
 * It doesn't require params, but we will keep `params?` as optional.
 */
export interface InitializedNotification extends JSONRPCNotification {
  jsonrpc: typeof JSONRPC_VERSION;
  method: "notifications/initialized";
  params?: Record<string, unknown>;
}

// Add this line to re-export the types
export type { InitializeRequest, InitializeResult, PingRequest, PingResponse };

// Add capability types
export interface ClientCapabilities {
  experimental?: Record<string, unknown>;
  roots: {
    listChanged: boolean;
  };
  sampling?: {
    enabled?: boolean;
    rate?: number;
  };
}

export interface ServerCapabilities {
  experimental?: Record<string, unknown>;
  supportedProtocolVersions?: string[];
  prompts: {
    listChanged: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  tools?: {
    listChanged: boolean;
  };
  logging?: {
    levels?: string[];
  };
  maxBatchSize?: number;
}