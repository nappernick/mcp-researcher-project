import { 
  ModelProvider, 
  ToolFunction, 
  ToolCall,
  ToolResult,
  ToolResponse 
} from '../types/providerTypes';

import toolsListSchema from '../schemas/mcp/tools.list.schema.json';
import { validateInput } from '../utils/validation';
// Mock tool function for testing
const mockCalculatorTool: ToolFunction = {
  name: "calculator",
  description: "Performs basic arithmetic operations",
  input_schema: {
    type: "object",
    required: ["operation", "numbers"],
    properties: {
      operation: {
        type: "string",
        enum: ["add", "subtract", "multiply", "divide"]
      },
      numbers: {
        type: "array",
        items: { type: "number" },
        minItems: 2
      }
    }
  }
};

// Mock model provider implementation for testing
class MockModelProvider implements ModelProvider {
  async generateResponse(prompt: string, options?: Record<string, any>): Promise<string> {
    return "Mock response to: " + prompt;
  }

  async generateWithTools(
    messages: any[],
    tools: ToolFunction[],
    options?: Record<string, any>
  ): Promise<{
    response?: string;
    toolCalls?: ToolCall[];
  }> {
    // Simulate tool call generation
    const toolCall: ToolCall = {
      toolName: "calculator",
      arguments: {
        operation: "add",
        numbers: [1, 2]
      },
      tool_use_id: "test-123"
    };

    return {
      response: "Let me calculate that for you...",
      toolCalls: [toolCall]
    };
  }

  async continueWithToolResult(
    messages: any[],
    tools: ToolFunction[],
    toolResults: ToolResult[],
    options?: Record<string, any>
  ): Promise<{
    response: string;
  }> {
    // Simulate processing tool results
    const result = toolResults[0]?.result;
    return {
      response: `The calculation result is: ${result}`
    };
  }
}

describe('Tool and Provider Tests', () => {
  let provider: ModelProvider;

  beforeEach(() => {
    provider = new MockModelProvider();
  });

  describe('ModelProvider Interface', () => {
    test('generateResponse returns string response', async () => {
      const response = await provider.generateResponse("Test prompt");
      expect(typeof response).toBe('string');
    });

    test('generateWithTools returns response and tool calls', async () => {
      const result = await provider.generateWithTools(
        ["User: What is 1 + 2?"],
        [mockCalculatorTool]
      );

      expect(result.response).toBeDefined();
      expect(Array.isArray(result.toolCalls)).toBe(true);
      
      const toolCall = result.toolCalls?.[0];
      expect(toolCall?.toolName).toBe('calculator');
      expect(toolCall?.arguments).toBeDefined();
      expect(toolCall?.tool_use_id).toBeDefined();
    });

    test('continueWithToolResult processes tool results', async () => {
      const toolResult: ToolResult = {
        name: "calculator",
        result: 3,
        tool_use_id: "test-123"
      };

      const result = await provider.continueWithToolResult(
        ["User: What is 1 + 2?"],
        [mockCalculatorTool],
        [toolResult]
      );

      expect(result.response).toBeDefined();
      expect(typeof result.response).toBe('string');
    });
  });

  describe('Tool Interfaces', () => {
    test('ToolFunction has required properties', () => {
      expect(mockCalculatorTool.name).toBeDefined();
      expect(mockCalculatorTool.description).toBeDefined();
      expect(mockCalculatorTool.input_schema).toBeDefined();
    });

    test('ToolCall has required properties', () => {
      const toolCall: ToolCall = {
        toolName: "test",
        arguments: { key: "value" }
      };

      expect(toolCall.toolName).toBeDefined();
      expect(toolCall.arguments).toBeDefined();
    });

    test('ToolResult has required properties', () => {
      const toolResult: ToolResult = {
        name: "test",
        result: "success"
      };

      expect(toolResult.name).toBeDefined();
      expect(toolResult.result).toBeDefined();
    });

    test('ToolResponse handles success case', () => {
      const response: ToolResponse = {
        success: true,
        result: "test result"
      };

      expect(response.success).toBe(true);
      expect(response.result).toBeDefined();
      expect(response.error).toBeUndefined();
    });

    test('ToolResponse handles error case', () => {
      const response: ToolResponse = {
        success: false,
        error: "Something went wrong"
      };

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.result).toBeUndefined();
    });
  });
  test('validates correct tools/list request', () => {
    const validRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {
        cursor: "abc123",
        limit: 10
      }
    };
    
    // This line checks that validateInput doesn't throw an error for a valid request
    expect(() => validateInput(toolsListSchema, validRequest)).not.toThrow();
  });
}); 