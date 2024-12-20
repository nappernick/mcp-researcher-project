import { MCPMethods } from '../constants/mcpMethods';
import { Notification } from '../types/mcpJSONRPCTypes'
import { ILogger } from './loggerInterface';

/**
 * Creates a JSON-RPC notification object.
 * @param method - The MCP method name for the notification.
 * @param params - The parameters for the notification.
 * @param logger - The logger instance to log the notification creation.
 * @returns The JSON-RPC notification object.
 */
export function createMcpNotification(method: MCPMethods, params: any, logger: ILogger): Notification {
  const notification: Notification = {
    jsonrpc: "2.0",
    method,
    params
  };

  logger.debug("Creating MCP notification", { method, params });
  
  return notification;
}

/**
 * Creates an Initialized Notification.
 * @param logger - The logger instance.
 * @returns The InitializedNotification object.
 */
export function createInitializedNotification(logger: ILogger): Notification {
  return createMcpNotification(MCPMethods.InitializedNotification, {}, logger);
}

/**
 * Creates a Ping Response Notification.
 * @param logger - The logger instance.
 * @returns The PingResponse notification object.
 */
export function createPingResponseNotification(logger: ILogger): Notification {
  return createMcpNotification(MCPMethods.PingResponse, { status: "pong" }, logger);
}

// Add more helper functions for other notifications as needed 