import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import clientCapabilitiesSchema from '../schemas/clientCapabilities.schema.json';
import serverCapabilitiesSchema from '../schemas/serverCapabilities.schema.json';
import implementationSchema from '../schemas/implementation.schema.json';
import initializeSchema from '../schemas/mcp/initialize.schema.json';
import initializeResultSchema from '../schemas/mcp/initializeResult.schema.json';
import initializeResponseSchema from '../schemas/mcp/initializeResponse.schema.json';
import pingSchema from '../schemas/mcp/ping.schema.json';
import pingResponseSchema from '../schemas/mcp/pingResponse.schema.json';
import promptsListSchema from '../schemas/mcp/prompts.list.schema.json';
import promptsListResponseSchema from '../schemas/mcp/prompts.list.response.schema.json';
import toolsListSchema from '../schemas/mcp/tools.list.schema.json';
import toolsListResponseSchema from '../schemas/mcp/tools.list.response.schema.json';
import resourcesReadSchema from '../schemas/mcp/resources.read.schema.json';
import resourcesReadResponseSchema from '../schemas/mcp/resources.read.response.schema.json';
import toolSchema from '../schemas/tool.schema.json'; // Add this import
import { ErrorCode, McpError } from './errors';

const ajv = new Ajv({ strict: false, strictTypes: false, allErrors: true, allowUnionTypes: true });
addFormats(ajv);

// Add the tool schema before the toolsListResponseSchema
ajv.addSchema(toolSchema);

ajv.addSchema(clientCapabilitiesSchema);
ajv.addSchema(serverCapabilitiesSchema);
ajv.addSchema(implementationSchema);
ajv.addSchema(initializeSchema);
ajv.addSchema(initializeResultSchema);
ajv.addSchema(initializeResponseSchema);
ajv.addSchema(pingSchema);
ajv.addSchema(pingResponseSchema);
ajv.addSchema(promptsListSchema);
ajv.addSchema(promptsListResponseSchema);
ajv.addSchema(toolsListSchema);
ajv.addSchema(toolsListResponseSchema);
ajv.addSchema(resourcesReadSchema);
ajv.addSchema(resourcesReadResponseSchema);

// Now that all schemas (including tool.schema.json) are added, Ajv can resolve the references.
const schemas = {
  clientCapabilitiesSchema,
  serverCapabilitiesSchema,
  implementationSchema,
  initializeSchema,
  initializeResultSchema,
  initializeResponseSchema,
  pingSchema,
  pingResponseSchema,
  promptsListSchema,
  promptsListResponseSchema,
  toolsListSchema,
  toolsListResponseSchema,
  resourcesReadSchema,
  resourcesReadResponseSchema,
  toolSchema // include here too if you like
};

Object.entries(schemas).forEach(([name, schema]) => {
  expect(() => {
    ajv.compile(schema);
  }).not.toThrow();
});

export function validateInput(schema: object, input: any): void {
  const validate = ajv.compile(schema);
  const valid = validate(input);

  if (!valid) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'Validation error',
      validate.errors
    );
  }
}
