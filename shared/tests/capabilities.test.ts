import { validateInput } from '../utils/validation';
import { McpError } from '../utils/errors';
import { 
  ClientCapabilities, 
  ServerCapabilities 
} from '../types/mcpTypes';

const clientCapabilitiesSchema = require('../schemas/clientCapabilities.schema.json');
const serverCapabilitiesSchema = require('../schemas/serverCapabilities.schema.json');

describe('Capabilities Tests', () => {
  describe('Client Capabilities', () => {
    test('validates minimal client capabilities', () => {
      const minimalCapabilities: ClientCapabilities = {
        experimental: {},
        roots: {
          listChanged: true
        }
      };
      
      expect(() => validateInput(clientCapabilitiesSchema, minimalCapabilities)).not.toThrow();
    });

    test('validates full client capabilities', () => {
      const fullCapabilities: ClientCapabilities = {
        experimental: {
          customFeature: true
        },
        roots: {
          listChanged: true
        },
        sampling: {
          enabled: true,
          rate: 0.1
        }
      };
      
      expect(() => validateInput(clientCapabilitiesSchema, fullCapabilities)).not.toThrow();
    });

    test('fails on invalid client capabilities', () => {
      const invalidCapabilities = {
        roots: {
          listChanged: "not a boolean" // should be boolean
        }
      };
      
      expect(() => validateInput(clientCapabilitiesSchema, invalidCapabilities))
        .toThrow(McpError);
    });
  });

  describe('Server Capabilities', () => {
    test('validates minimal server capabilities', () => {
      const minimalCapabilities: ServerCapabilities = {
        prompts: {
          listChanged: true
        }
      };
      
      expect(() => validateInput(serverCapabilitiesSchema, minimalCapabilities)).not.toThrow();
    });

    test('validates full server capabilities', () => {
      const fullCapabilities: ServerCapabilities = {
        experimental: {
          betaFeature: true
        },
        supportedProtocolVersions: ["2024-11-05"],
        prompts: {
          listChanged: true
        },
        resources: {
          subscribe: true,
          listChanged: true
        },
        tools: {
          listChanged: true
        },
        logging: {
          levels: ["debug", "info", "warn", "error"]
        },
        maxBatchSize: 10
      };
      
      expect(() => validateInput(serverCapabilitiesSchema, fullCapabilities)).not.toThrow();
    });

    test('fails on invalid server capabilities', () => {
      const invalidCapabilities = {
        maxBatchSize: "not a number" // should be number
      };
      
      expect(() => validateInput(serverCapabilitiesSchema, invalidCapabilities))
        .toThrow(McpError);
    });
  });

  describe('Capability Negotiation', () => {
    test('client and server capabilities can be combined', () => {
      const clientCaps: ClientCapabilities = {
        experimental: {
          feature1: true
        },
        roots: {
          listChanged: true
        }
      };

      const serverCaps: ServerCapabilities = {
        experimental: {
          feature1: true
        },
        prompts: {
          listChanged: true
        }
      };

      // Validate both independently
      expect(() => validateInput(clientCapabilitiesSchema, clientCaps)).not.toThrow();
      expect(() => validateInput(serverCapabilitiesSchema, serverCaps)).not.toThrow();
    });

    test('handles missing optional capabilities', () => {
      const clientCaps: ClientCapabilities = {
        roots: {
          listChanged: true
        }
      };

      const serverCaps: ServerCapabilities = {
        prompts: {
          listChanged: true
        }
      };

      expect(() => validateInput(clientCapabilitiesSchema, clientCaps)).not.toThrow();
      expect(() => validateInput(serverCapabilitiesSchema, serverCaps)).not.toThrow();
    });
  });
}); 