import { validateInput } from '../utils/validation';
import { McpError, ErrorCode } from '../utils/errors';
import { ILogger } from '../utils/loggerInterface';

// Import schemas
const initializeSchema = require('../schemas/mcp/initialize.schema.json');
const initializeResponseSchema = require('../schemas/mcp/initializeResponse.schema.json'); // Use initializeResponse
const toolCallSchema = require('../schemas/mcp/tools.call.schema.json');
const toolCallResponseSchema = require('../schemas/mcp/tools.call.response.schema.json');

// Import examples
const validInitRequest = require('../examples/valid/initialize_request.json');
const validInitResponse = require('../examples/valid/initialize_response.json');
const validToolCall = require('../examples/valid/tool_call.json');
const validToolCallResponse = require('../examples/valid/tool_call_response.json');

const invalidInitRequest = require('../examples/invalid/initialize_request_missing_version.json');
const invalidInitResponse = require('../examples/invalid/initialize_response_wrong_version.json');

// Mock logger for testing
class MockLogger implements ILogger {
  public logs: Array<{level: string, message: string, meta?: Record<string, unknown>}> = [];

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logs.push({ level: 'debug', message, meta });
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logs.push({ level: 'info', message, meta });
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logs.push({ level: 'warn', message, meta });
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.logs.push({ level: 'error', message, meta });
  }
}

describe('MCP Message Examples', () => {
  let logger: MockLogger;

  beforeEach(() => {
    logger = new MockLogger();
  });

  describe('Valid Examples', () => {
    test('validates initialize request example', () => {
      expect(() => {
        validateInput(initializeSchema, validInitRequest);
      }).not.toThrow();
    });

    test('validates initialize response example', () => {
      // Use initializeResponseSchema here
      expect(() => {
        validateInput(initializeResponseSchema, validInitResponse);
      }).not.toThrow();
    });

    test('validates tool call example', () => {
      expect(() => {
        validateInput(toolCallSchema, validToolCall);
      }).not.toThrow();
    });

    test('validates tool call response example', () => {
      expect(() => {
        validateInput(toolCallResponseSchema, validToolCallResponse);
      }).not.toThrow();
    });
  });

  describe('Invalid Examples', () => {
    test('fails on initialize request missing version', () => {
      try {
        validateInput(initializeSchema, invalidInitRequest);
        fail('Expected validation to fail');
      } catch (error) {
        expect(error).toBeInstanceOf(McpError);
        expect((error as McpError).code).toBe(ErrorCode.InvalidParams);
        logger.error('Validation failed', {
          example: 'initialize_request_missing_version.json',
          error: (error as McpError).data
        });
      }
    });

    test('fails on initialize response with wrong jsonrpc version', () => {
      try {
        // This is still initializeResultSchema test - if you intend
        // to test a response, use initializeResponseSchema with invalidInitResponse.
        // If invalidInitResponse is deliberately invalid for initializeResultSchema,
        // you can leave this as is. Otherwise, if it should be validated as a response,
        // switch to initializeResponseSchema.
        validateInput(initializeResponseSchema, invalidInitResponse);
        fail('Expected validation to fail');
      } catch (error) {
        expect(error).toBeInstanceOf(McpError);
        expect((error as McpError).code).toBe(ErrorCode.InvalidParams);
        logger.error('Validation failed', {
          example: 'initialize_response_wrong_version.json',
          error: (error as McpError).data
        });
      }
    });
  });

  describe('Example Completeness', () => {
    test('all examples contain required fields', () => {
      // Initialize Request
      expect(validInitRequest).toHaveProperty('jsonrpc');
      expect(validInitRequest).toHaveProperty('id');
      expect(validInitRequest).toHaveProperty('method');
      expect(validInitRequest).toHaveProperty('params.protocolVersion');
      expect(validInitRequest).toHaveProperty('params.capabilities');
      expect(validInitRequest).toHaveProperty('params.clientInfo');

      // Initialize Response
      expect(validInitResponse).toHaveProperty('jsonrpc');
      expect(validInitResponse).toHaveProperty('id');
      expect(validInitResponse).toHaveProperty('result.protocolVersion');
      expect(validInitResponse).toHaveProperty('result.capabilities');
      expect(validInitResponse).toHaveProperty('result.serverInfo');

      // Tool Call
      expect(validToolCall).toHaveProperty('jsonrpc');
      expect(validToolCall).toHaveProperty('id');
      expect(validToolCall).toHaveProperty('method');
      expect(validToolCall).toHaveProperty('params.toolName');
      expect(validToolCall).toHaveProperty('params.arguments');

      // Tool Call Response
      expect(validToolCallResponse).toHaveProperty('jsonrpc');
      expect(validToolCallResponse).toHaveProperty('id');
      expect(validToolCallResponse).toHaveProperty('result.success');
    });
  });
});
