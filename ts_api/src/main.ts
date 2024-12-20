
import { config } from 'dotenv';
import { ToolResult, ToolFunction } from "shared";
import { ProviderFactory, ModelProvider } from "mcp-wrapper";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { MCPClientWrapper } from "./mcp/MCPClientWrapper"; // If you need to call downstream tools

// Load environment variables
config();

// Initialize model provider
const modelProvider: ModelProvider = ProviderFactory.getProvider();
console.warn(`Using provider: ${process.env.PROVIDER_NAME}`);

// If you have a downstream server for tools, configure this:
let toolClient: MCPClientWrapper | null = null;
// If downstream tool usage is needed, initialize toolClient:
// toolClient = new MCPClientWrapper({
//   serverCommand: 'node',
//   serverPath: './downstreamServer.js',
//   serverArgs: []
// });
// await toolClient.connect();

// Zod Schemas
const GenerateSchema = z.object({
  jsonrpc: z.literal("2.0"),
  method: z.literal("generate"),
  params: z.object({
    prompt: z.string(),
    options: z.any().optional()
  }),
  id: z.union([z.string(), z.number()])
});

const GenerateWithToolsSchema = z.object({
  jsonrpc: z.literal("2.0"),
  method: z.literal("generate_with_tools"),
  params: z.object({
    messages: z.array(z.object({
      role: z.enum(["user", "assistant", "system", "function"]),
      content: z.string().optional(),
      name: z.string().optional(),
    })),
    tools: z.array(z.object({
      name: z.string(),
      description: z.string(),
      input_schema: z.any().optional()
    })),
    options: z.any().optional(),
  }),
  id: z.union([z.string(), z.number()])
});

const ContinueWithToolResultSchema = z.object({
  jsonrpc: z.literal("2.0"),
  method: z.literal("continue_with_tool_result"),
  params: z.object({
    messages: z.array(z.object({
      role: z.enum(["user", "assistant", "system", "function"]),
      content: z.string().optional(),
      name: z.string().optional(),
    })),
    tools: z.array(z.object({
      name: z.string(),
      description: z.string(),
      input_schema: z.any().optional()
    })),
    toolResults: z.array(z.object({
      name: z.string(),
      result: z.any(),
      tool_use_id: z.string().optional(),
    })),
    options: z.any().optional(),
  }),
  id: z.union([z.string(), z.number()])
});

const ResourcesReadSchema = z.object({
  jsonrpc: z.literal("2.0"),
  method: z.literal("resources/read"),
  params: z.object({
    uri: z.string(),
  }),
  id: z.union([z.string(), z.number()])
});

// Create the MCP Server
const server = new Server(
  {
    name: "nlp-wrapper",
    version: "1.0.0"
  },
  {
    capabilities: {
      resources: {}
    }
  }
);

// Handlers

async function handleGenerate(request: z.infer<typeof GenerateSchema>) {
  const { prompt, options } = request.params;
  try {
    console.warn(`Handling 'generate' request: prompt="${prompt}"`);
    const content = await modelProvider.generateResponse(prompt, options);
    return { content };
  } catch (error: any) {
    console.warn('Error in generate:', error);
    throw { code: -32000, message: error.message };
  }
}

async function handleGenerateWithTools(request: z.infer<typeof GenerateWithToolsSchema>) {
  const { messages, tools, options } = request.params;
  try {
    console.warn('Handling generate_with_tools request');
    const initialResult = await modelProvider.generateWithTools(messages, (tools as ToolFunction[]), options);
    // If toolCalls present and toolClient is configured, handle them here
    if (initialResult.toolCalls && initialResult.toolCalls.length > 0 && toolClient) {
      // Execute tool calls via toolClient
      const toolResults: ToolResult[] = [];
      for (const call of initialResult.toolCalls) {
        // @ts-ignore
        const toolResult = await toolClient.generateWithTools(call.name, call.arguments);
        toolResults.push({
          name: call.name,
          result: toolResult
        });
      }

      // Now continue with tool results
      const continueResult = await modelProvider.continueWithToolResult(messages, (tools as ToolFunction[]), toolResults, options);
      return continueResult;
    } else {
      // No tool calls or no toolClient configured, just return initialResult
      return initialResult;
    }
  } catch (error: any) {
    console.warn('Error in generate_with_tools:', error);
    throw { code: -32000, message: error.message };
  }
}

async function handleContinueWithToolResult(request: z.infer<typeof ContinueWithToolResultSchema>) {
  const { messages, tools, toolResults, options } = request.params;
  try {
    console.warn('Handling continue_with_tool_result request');
    const result = await modelProvider.continueWithToolResult(messages, (tools as ToolFunction[]), (toolResults as ToolResult[]), options);
    return result;
  } catch (error: any) {
    console.warn('Error in continue_with_tool_result:', error);
    throw { code: -32000, message: error.message };
  }
}

async function handleResourcesRead(request: z.infer<typeof ResourcesReadSchema>) {
  const { uri } = request.params;
  try {
    console.warn(`Handling resources/read for uri: ${uri}`);
    // Parse the file path from the URI
    const url = new URL(uri);
    if (url.protocol !== 'file:') {
      throw new Error("Only file:// URIs are supported");
    }
    const filePath = path.resolve(url.pathname);
    const contentBuffer = await fs.readFile(filePath);
    // Assume text for simplicity
    return {
      contents: [{
        uri,
        mimeType: "text/plain",
        text: contentBuffer.toString("utf-8")
      }]
    };
  } catch (error: any) {
    console.warn('Error in resources/read:', error);
    throw { code: -32000, message: error.message };
  }
}

// Register Handlers
server.setRequestHandler(GenerateSchema, handleGenerate);
server.setRequestHandler(GenerateWithToolsSchema, handleGenerateWithTools);
server.setRequestHandler(ContinueWithToolResultSchema, handleContinueWithToolResult);
server.setRequestHandler(ResourcesReadSchema, handleResourcesRead);

// Start the server
(async () => {

  try {
    // Initialize the provider
    const provider = ProviderFactory.getProvider();

    // Test basic functionality
    const response = await provider.generateResponse("Hello, how are you?");
    console.log('Response:', response);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  try {
    console.warn("Starting NLP MCP wrapper server using stdio transport...");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.warn("NLP MCP wrapper server started and running.");
  } catch (error: any) {
    console.warn(`Failed to start MCP server: ${error.message}`, { error });
    process.exit(1);
  }
})();

// async function main() {
//   try {
//     const provider = ProviderFactory.getProvider();
//     console.log('\n=== Starting Tool Test ===\n');

//     const messages = [
//       {
//         role: "user",
//         content: "What's the weather like in Paris? After that, calculate 23 * 45."
//       }
//     ];

//     const tools = [
//       {
//         name: "get_weather",
//         description: "Get the current weather in a location",
//         input_schema: {
//           type: "object",
//           properties: {
//             location: {
//               type: "string",
//               description: "The city name"
//             }
//           },
//           required: ["location"]
//         }
//       },
//       {
//         name: "calculate",
//         description: "Perform a mathematical calculation",
//         input_schema: {
//           type: "object",
//           properties: {
//             expression: {
//               type: "string",
//               description: "The mathematical expression to calculate"
//             }
//           },
//           required: ["expression"]
//         }
//       }
//     ];

//     console.log('Messages:', JSON.stringify(messages, null, 2));
//     console.log('Tools:', JSON.stringify(tools, null, 2));
//     console.log('\n=== Sending generateWithTools request ===\n');
    
//     const result = await provider.generateWithTools(messages, tools);
//     console.log('\n=== Initial result ===');
//     console.log(JSON.stringify(result, null, 2));

//     if (result.toolCalls && result.toolCalls.length > 0) {
//       console.log('\n=== Processing Tool Calls ===');
//       console.log('Tool calls:', JSON.stringify(result.toolCalls, null, 2));

//       const toolResults = result.toolCalls.map((call: any) => ({
//         name: call.name,
//         result: call.name === 'get_weather' 
//           ? "It's 22°C and sunny in Paris"
//           : call.name === 'calculate'
//           ? "23 * 45 = 1035"
//           : "Unknown tool"
//       }));

//       console.log('\n=== Tool Results ===');
//       console.log(JSON.stringify(toolResults, null, 2));

//       console.log('\n=== Continuing with Tool Results ===');
//       const finalResult = await provider.continueWithToolResult(
//         messages,
//         tools,
//         toolResults
//       );

//       console.log('\n=== Final Response ===');
//       console.log(JSON.stringify(finalResult, null, 2));
//     } else {
//       console.log('\n=== No Tool Calls Made ===');
//     }

//   } catch (error) {
//     console.error('\n=== Error ===');
//     console.error(error);
//   }
// }

// main().catch(console.error);