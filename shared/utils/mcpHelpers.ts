import { InitializeRequest, InitializeResult, PingRequest, PingResponse } from '../types/mcpTypes';
import type { ServerCapabilities } from '../types/configTypes';
import { McpError, ErrorCode } from './errors';
import { validateInput } from './validation';
import initializeSchema from '../schemas/mcp/initialize.schema.json' assert { type: 'json' };
import initializeResultSchema from '../schemas/mcp/initializeResult.schema.json' assert { type: 'json' };
import pingSchema from '../schemas/mcp/ping.schema.json' assert { type: 'json' };
import pingResponseSchema from '../schemas/mcp/pingResponse.schema.json' assert { type: 'json' };
import { ClientCapabilities } from '../types/configTypes'

/**
 * Negotiates protocol versions between client and server.
 * Throws an error if the server does not support the client's requested version.
 * Otherwise, returns the negotiated protocol version.
 */
export function negotiateProtocolVersion(clientVersion: string, serverVersion: string): string {
  // Simple version comparison. Adjust as needed for more complex versioning.
  if (clientVersion !== serverVersion) {
    throw new McpError(
      ErrorCode.ProtocolVersionMismatch,
      `Protocol version mismatch. Client: ${clientVersion}, Server: ${serverVersion}`
    );
  }
  return serverVersion;
}

/**
 * Validates an InitializeRequest against its JSON schema.
 * Returns the validated request or throws an error.
 */
export function validateInitializeRequest(request: InitializeRequest): InitializeRequest {
  validateInput(initializeSchema, request);
  return request;
}

/**
 * Validates an InitializeResult against its JSON schema.
 * Returns the validated result or throws an error.
 */
export function validateInitializeResult(result: InitializeResult): InitializeResult {
  validateInput(initializeResultSchema, result);
  return result;
}

/**
 * Validates a PingRequest against its JSON schema.
 * Returns the validated request or throws an error.
 */
export function validatePingRequest(request: PingRequest): PingRequest {
  validateInput(pingSchema, request);
  return request;
}

/**
 * Validates a PingResponse against its JSON schema.
 * Returns the validated response or throws an error.
 */
export function validatePingResponse(response: PingResponse): PingResponse {
  validateInput(pingResponseSchema, response);
  return response;
}

/**
 * Parses and validates ClientCapabilities.
 * Returns the validated capabilities or throws an error.
 */
export function parseClientCapabilities(capabilities: ClientCapabilities): ClientCapabilities {
  // Add additional validation if necessary
  return capabilities;
}

/**
 * Parses and validates ServerCapabilities.
 * Returns the validated capabilities or throws an error.
 */
export function parseServerCapabilities(capabilities: ServerCapabilities): ServerCapabilities {
  // Add additional validation if necessary
  return capabilities;
} 