import { validateInput } from '../utils/validation';
import addFormats from 'ajv-formats';
import { McpError, ErrorCode } from '../utils/errors';
import Ajv from 'ajv';

// Import schemas
const entitySchema = require('../schemas/entity.schema.json');
const relationSchema = require('../schemas/relation.schema.json');
const toolSchema = require('../schemas/tool.schema.json');
const clientCapabilitiesSchema = require('../schemas/clientCapabilities.schema.json');
const implementationSchema = require('../schemas/implementation.schema.json');
const serverCapabilitiesSchema = require('../schemas/serverCapabilities.schema.json'); 

// Import MCP schemas
const initializeSchema = require('../schemas/mcp/initialize.schema.json');
const initializeResultSchema = require('../schemas/mcp/initializeResult.schema.json');
const pingSchema = require('../schemas/mcp/ping.schema.json');
const pingResponseSchema = require('../schemas/mcp/pingResponse.schema.json');
const promptsListSchema = require('../schemas/mcp/prompts.list.schema.json');
const promptsListResponseSchema = require('../schemas/mcp/prompts.list.response.schema.json');
const toolsListSchema = require('../schemas/mcp/tools.list.schema.json');
const toolsListResponseSchema = require('../schemas/mcp/tools.list.response.schema.json');
const resourcesReadSchema = require('../schemas/mcp/resources.read.schema.json');
const resourcesReadResponseSchema = require('../schemas/mcp/resources.read.response.schema.json');

describe('Schema Tests', () => {
  describe('Schema Loading', () => {
    const schemas = {
      entitySchema,
      relationSchema,
      toolSchema,
      clientCapabilitiesSchema,
      implementationSchema,
      serverCapabilitiesSchema, // Make sure this is included here
      initializeSchema,
      initializeResultSchema,
      pingSchema,
      pingResponseSchema,
      promptsListSchema,
      promptsListResponseSchema,
      toolsListSchema,
      toolsListResponseSchema,
      resourcesReadSchema,
      resourcesReadResponseSchema
    };

    test('all schemas can be loaded and compiled with Ajv', () => {
      const ajv = new Ajv({ strict: false, strictTypes: false, allErrors: true, allowUnionTypes: true });
      addFormats(ajv);

      // Add all schemas to Ajv first
      Object.values(schemas).forEach((schema) => {
        ajv.addSchema(schema);
      });

      // Now compile each schema after all are added
      Object.entries(schemas).forEach(([name, schema]) => {
        expect(() => {
          ajv.compile(schema);
        }).not.toThrow();
      });
    });
  });
  // Existing Entity Schema tests
  describe('Entity Schema', () => {
    test('validates correct entity', () => {
      const validEntity = {
        id: "123",
        name: "Test Entity",
        type: "test",
        description: "A test entity"
      };
      
      expect(() => validateInput(entitySchema, validEntity)).not.toThrow();
    });

    test('validates entity without optional description', () => {
      const validEntity = {
        id: "123",
        name: "Test Entity",
        type: "test"
      };
      
      expect(() => validateInput(entitySchema, validEntity)).not.toThrow();
    });

    test('fails on missing required fields', () => {
      const invalidEntity = {
        id: "123",
        name: "Test Entity"
        // missing type
      };
      
      expect(() => {
        validateInput(entitySchema, invalidEntity);
      }).toThrow(McpError);
    });
  });

  // Existing Relation Schema tests
  describe('Relation Schema', () => {
    test('validates correct relation', () => {
      const validRelation = {
        id: "rel123",
        source_id: "entity1",
        target_id: "entity2",
        type: "connects_to"
      };
      
      expect(() => validateInput(relationSchema, validRelation)).not.toThrow();
    });

    test('fails on missing required fields', () => {
      const invalidRelation = {
        id: "rel123",
        source_id: "entity1",
        // missing target_id and type
      };
      
      expect(() => {
        validateInput(relationSchema, invalidRelation);
      }).toThrow(McpError);
    });
  });

  // New Tool Schema tests
  describe('Tool Schema', () => {
    test('validates correct tool definition', () => {
      const validTool = {
        name: "test_tool",
        description: "A test tool",
        parameters: {
          type: "object",
          properties: {
            input: { type: "string" }
          }
        }
      };
      
      expect(() => validateInput(toolSchema, validTool)).not.toThrow();
    });

    test('fails on missing required fields', () => {
      const invalidTool = {
        name: "test_tool",
        // missing description and parameters
      };
      
      expect(() => {
        validateInput(toolSchema, invalidTool);
      }).toThrow(McpError);
    });
  });

  // MCP Schema Tests
  describe('MCP Schemas', () => {
    describe('Initialize Schema', () => {
      test('validates correct initialize request', () => {
        const validRequest = {
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {
              experimental: {},
              roots: { listChanged: true }
            },
            clientInfo: {
              name: "test-client",
              version: "1.0.0"
            }
          }
        };
        
        expect(() => validateInput(initializeSchema, validRequest)).not.toThrow();
      });

      test('fails on invalid initialize request', () => {
        const invalidRequest = {
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          // missing params
        };
        
        expect(() => {
          validateInput(initializeSchema, invalidRequest);
        }).toThrow(McpError);
      });
    });

    describe('Ping Schema', () => {
      test('validates correct ping request', () => {
        const validPing = {
          jsonrpc: "2.0",
          id: 1,
          method: "ping"
        };
        
        expect(() => validateInput(pingSchema, validPing)).not.toThrow();
      });

      test('validates correct ping response', () => {
        const validResponse = {
          jsonrpc: "2.0",
          id: 1,
          result: {
            status: "pong"
          }
        };
        
        expect(() => validateInput(pingResponseSchema, validResponse)).not.toThrow();
      });
    });
  });

  // MCP Method Schemas
  describe('MCP Method Schemas', () => {
    describe('Prompts List Schema', () => {
      test('validates correct prompts/list request', () => {
        const validRequest = {
          jsonrpc: "2.0",
          id: 1,
          method: "prompts/list",
          params: {
            cursor: "abc123",
            limit: 10
          }
        };
        
        expect(() => validateInput(promptsListSchema, validRequest)).not.toThrow();
      });

      test('validates prompts/list response', () => {
        const validResponse = {
          jsonrpc: "2.0",
          id: 1,
          result: {
            prompts: [{
              id: "prompt1",
              name: "Test Prompt",
              description: "A test prompt",
              template: "This is a {{test}} template"
            }],
            nextCursor: "def456"
          }
        };
        
        expect(() => validateInput(promptsListResponseSchema, validResponse)).not.toThrow();
      });
    });

    describe('Tools List Schema', () => {
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
        
        expect(() => validateInput(toolsListSchema, validRequest)).not.toThrow();
      });

      test('validates tools/list response', () => {
        const validResponse = {
          jsonrpc: "2.0",
          id: 1,
          result: {
            tools: [{
              name: "test_tool",
              description: "A test tool",
              parameters: {
                type: "object",
                properties: {
                  input: { type: "string" }
                }
              }
            }],
            nextCursor: "def456"
          }
        };
        
        expect(() => validateInput(toolsListResponseSchema, validResponse)).not.toThrow();
      });
    });

    describe('Resources Read Schema', () => {
      test('validates correct resources/read request', () => {
        const validRequest = {
          jsonrpc: "2.0",
          id: 1,
          method: "resources/read",
          params: {
            uri: "mcp://test/resource1"
          }
        };
        
        expect(() => validateInput(resourcesReadSchema, validRequest)).not.toThrow();
      });

      test('validates resources/read response', () => {
        const validResponse = {
          jsonrpc: "2.0",
          id: 1,
          result: {
            content: "Resource content here",
            metadata: {
              contentType: "text/plain",
              lastModified: "2024-03-14T12:00:00Z"
            }
          }
        };
        
        expect(() => validateInput(resourcesReadResponseSchema, validResponse)).not.toThrow();
      });
    });

    // Test error cases for each schema
    describe('Error Cases', () => {
      test('fails on invalid method names', () => {
        const invalidRequest = {
          jsonrpc: "2.0",
          id: 1,
          method: "wrong/method",
          params: {}
        };
        
        expect(() => {
          validateInput(promptsListSchema, invalidRequest);
        }).toThrow(McpError);
      });

      test('fails on missing required params', () => {
        const invalidResourceRequest = {
          jsonrpc: "2.0",
          id: 1,
          method: "resources/read",
          params: {} // missing uri
        };
        
        expect(() => {
          validateInput(resourcesReadSchema, invalidResourceRequest);
        }).toThrow(McpError);
      });

      test('fails on invalid response structure', () => {
        const invalidResponse = {
          jsonrpc: "2.0",
          id: 1,
          result: "not an object" // should be an object
        };
        
        expect(() => {
          validateInput(toolsListResponseSchema, invalidResponse);
        }).toThrow(McpError);
      });
    });
  });
}); 