import { ClientCapabilities, ServerCapabilities, Implementation } from './configTypes';

export type JSONRPCMessage =
  | JSONRPCRequest
  | JSONRPCNotification
  | JSONRPCResponse
  | JSONRPCError;

export const LATEST_PROTOCOL_VERSION = "2024-11-05";
export const JSONRPC_VERSION = "2.0";

/**
 * A progress token, used to associate progress notifications with the original request.
 */
export type ProgressToken = string | number;

/**
 * An opaque token used to represent a cursor for pagination.
 */
export type Cursor = string;

// JSON-RPC Interfaces
export interface JSONRPCRequest {
  jsonrpc: typeof JSONRPC_VERSION;
  id: RequestId;
  method: string;
  params?: any;
}

export interface JSONRPCNotification {
  jsonrpc: typeof JSONRPC_VERSION;
  method: string;
  params?: any;
}

export interface JSONRPCResponse {
  jsonrpc: typeof JSONRPC_VERSION;
  id: RequestId;
  result: any;
}

export interface JSONRPCError {
  jsonrpc: typeof JSONRPC_VERSION;
  id: RequestId;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface JSONRPCResponse {
  jsonrpc: "2.0";
  id: RequestId;
  result: any;
}

export interface JSONRPCError {
  jsonrpc: "2.0";
  id: RequestId;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
};

// Type guards
export function isJSONRPCResponse(response: JSONRPCResponse | JSONRPCError): response is JSONRPCResponse {
  return 'result' in response;
}

export function isJSONRPCError(response: JSONRPCResponse | JSONRPCError): response is JSONRPCError {
  return 'error' in response;
};

export type RequestId = string | number;

// Define InitializeRequest and InitializeResult
export interface InitializeRequest extends JSONRPCRequest {
  method: "initialize";
  params: {
    protocolVersion: string;
    capabilities: ClientCapabilities;
    clientInfo: Implementation;
  };
}

export interface InitializeResult {
  protocolVersion: string;
  capabilities: ServerCapabilities;
  serverInfo: Implementation;
  instructions?: string;
}

// Define PingRequest and PingResponse
export interface PingRequest extends JSONRPCRequest {
  method: "ping";
}

export interface PingResponse {
  status: "pong";
}

// Generic notification interface
export interface Notification extends JSONRPCNotification {
  method: string;
  params?: any;
}
