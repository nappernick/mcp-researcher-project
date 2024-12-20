/**
 * Interface for model providers that can generate responses and use tools.
 * Implementations should handle specific model APIs (e.g. OpenAI, Anthropic).
 */
export interface ModelProvider {
  /**
   * Generate a simple text response from a prompt.
   * @param prompt The input prompt text
   * @param options Optional provider-specific parameters
   * @returns Promise resolving to the generated text
   */
  generateResponse(prompt: string, options?: Record<string, any>): Promise<string>;
  
  /**
   * Generate a response that may include tool calls.
   * @param messages The conversation history
   * @param tools Available tools that can be called
   * @param options Optional provider-specific parameters
   * @returns Promise resolving to response text and/or tool calls
   */
  generateWithTools(
    messages: any[], 
    tools: ToolFunction[], 
    options?: Record<string, any>
  ): Promise<{
    response?: string;
    toolCalls?: ToolCall[];
  }>;
  
  /**
   * Continue a conversation after tool results are available.
   * @param messages The conversation history
   * @param tools Available tools that can be called
   * @param toolResults Results from previous tool calls
   * @param options Optional provider-specific parameters
   * @returns Promise resolving to the final response
   */
  continueWithToolResult(
    messages: any[],
    tools: ToolFunction[],
    toolResults: ToolResult[],
    options?: Record<string, any>
  ): Promise<{
    response: string;
  }>;
}

/**
 * Represents a callable tool with its metadata and schema.
 */
export interface ToolFunction {
  /** Unique name identifying the tool */
  name: string;
  
  /** Human-readable description of what the tool does */
  description: string;
  
  /** JSON Schema defining the tool's input parameters */
  input_schema: Record<string, any>;
  
  /** Optional JSON Schema defining the tool's output format */
  output_schema?: Record<string, any>;
}

/**
 * Represents a request to call a tool.
 */
export interface ToolCall {
  /** Name of the tool to call */
  toolName: string;
  
  /** Arguments to pass to the tool */
  arguments: Record<string, any>;
  
  /** Optional ID to track this specific tool use */
  tool_use_id?: string;
}

/**
 * Represents the result of a tool call.
 */
export interface ToolResult {
  /** Name of the tool that was called */
  name: string;
  
  /** The result returned by the tool */
  result: any;
  
  /** Optional ID matching the original tool call */
  tool_use_id?: string;
}

/**
 * Base interface for tool responses.
 */
export interface ToolResponse {
  /** Whether the tool call succeeded */
  success: boolean;
  
  /** The result if successful */
  result?: any;
  
  /** Error message if failed */
  error?: string;
}
