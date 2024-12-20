import { validateInput } from '../utils/validation';
import { McpError, ErrorCode } from '../utils/errors';
import { ILogger } from '../utils/loggerInterface';

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

  clear(): void {
    this.logs = [];
  }
}

describe('Validation and Error Handling Tests', () => {
  let logger: MockLogger;

  beforeEach(() => {
    logger = new MockLogger();
  });

  describe('Schema Validation', () => {
    const testSchema = {
      type: "object",
      required: ["name", "age"],
      properties: {
        name: { type: "string" },
        age: { type: "number" }
      }
    };

    test('throws McpError with InvalidParams code on validation failure', () => {
      const invalidData = {
        name: "Test"
        // missing required age field
      };

      try {
        validateInput(testSchema, invalidData);
        fail('Expected validateInput to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(McpError);
        expect((error as McpError).code).toBe(ErrorCode.InvalidParams);
        expect((error as McpError).message).toBe('Validation error');
      }
    });

    test('includes validation details in error data', () => {
      const invalidData = {
        name: 123, // wrong type
        age: "not a number" // wrong type
      };

      try {
        validateInput(testSchema, invalidData);
        fail('Expected validateInput to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(McpError);
        expect((error as McpError).data).toBeDefined();
        expect(Array.isArray((error as McpError).data)).toBe(true);
      }
    });
  });

  describe('Error Codes', () => {
    test('uses correct error codes for different scenarios', () => {
      // Test ParseError
      const throwParseError = () => {
        throw new McpError(ErrorCode.ParseError, "Failed to parse JSON");
      };
      expect(throwParseError).toThrow(McpError);
      expect(throwParseError).toThrow("Failed to parse JSON");

      // Test InvalidRequest
      const throwInvalidRequest = () => {
        throw new McpError(ErrorCode.InvalidRequest, "Invalid request format");
      };
      expect(throwInvalidRequest).toThrow(McpError);
      expect(throwInvalidRequest).toThrow("Invalid request format");

      // Test MethodNotFound
      const throwMethodNotFound = () => {
        throw new McpError(ErrorCode.MethodNotFound, "Method not supported");
      };
      expect(throwMethodNotFound).toThrow(McpError);
      expect(throwMethodNotFound).toThrow("Method not supported");
    });

    test('preserves error codes through catch blocks', () => {
      try {
        throw new McpError(ErrorCode.InvalidParams, "Test error");
      } catch (error) {
        expect(error instanceof McpError).toBe(true);
        if (error instanceof McpError) {
          expect(error.code).toBe(ErrorCode.InvalidParams);
        }
      }
    });
  });

  describe('Logger Interface', () => {
    test('logs messages with correct levels', () => {
      logger.debug("Debug message", { context: "test" });
      logger.info("Info message");
      logger.warn("Warning message", { alert: true });
      logger.error("Error message", { code: 500 });

      expect(logger.logs).toHaveLength(4);
      expect(logger.logs[0]).toEqual({
        level: 'debug',
        message: 'Debug message',
        meta: { context: "test" }
      });
      expect(logger.logs[1]).toEqual({
        level: 'info',
        message: 'Info message'
      });
      expect(logger.logs[2]).toEqual({
        level: 'warn',
        message: 'Warning message',
        meta: { alert: true }
      });
      expect(logger.logs[3]).toEqual({
        level: 'error',
        message: 'Error message',
        meta: { code: 500 }
      });
    });

    test('handles undefined metadata', () => {
      logger.info("Test message");
      
      expect(logger.logs[0]).toEqual({
        level: 'info',
        message: 'Test message'
      });
    });

    test('logs validation errors correctly', () => {
      const testSchema = {
        type: "object",
        required: ["name"]
      };

      try {
        validateInput(testSchema, {});
      } catch (error) {
        if (error instanceof McpError) {
          logger.error("Validation failed", {
            code: error.code,
            data: error.data
          });
        }
      }

      expect(logger.logs).toHaveLength(1);
      expect(logger.logs[0].level).toBe('error');
      expect(logger.logs[0].meta).toHaveProperty('code', ErrorCode.InvalidParams);
    });
  });
}); 