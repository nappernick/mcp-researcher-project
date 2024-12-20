export enum ErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  ProtocolVersionMismatch = -32000,
  CapabilityNegotiationFailed = -32001,
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