// tests/configLoader.test.ts
import { ConfigLoader } from '../utils/configLoader';
import type { AppConfig } from '../types/configTypes';

describe('ConfigLoader Tests', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    (ConfigLoader as any)._instance = null; // Clear the singleton
  });

  afterEach(() => {
    process.env = originalEnv; // Restore original env
    (ConfigLoader as any)._instance = null; // Clear singleton again just in case
  });

  test('loads config from environment variables', () => {
    // Set env vars before calling getInstance
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'debug'; 
    process.env.SERVICE_NAME = 'test-service';
    process.env.PORT = '4000';

    // Now that env is set, we call getInstance
    (ConfigLoader as any)._instance = null; 
    const config = ConfigLoader.getInstance().getConfig();

    expect(config.environment).toBe('test');
    expect(config.logLevel).toBe('debug'); // Should now be 'debug'
    expect(config.serviceName).toBe('test-service');
    expect(config.port).toBe(4000);
  });

  test('updateConfig merges new config correctly', () => {
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'debug';

    (ConfigLoader as any)._instance = null; 
    const configLoader = ConfigLoader.getInstance();
    const configBefore = configLoader.getConfig();
    expect(configBefore.logLevel).toBe('debug'); // Confirm it picked up debug now

    const newConfig: Partial<AppConfig> = {
      serviceName: 'updated-service',
      model: {
        modelName: 'new-model',
        temperature: 0.8
      }
    };

    configLoader.updateConfig(newConfig);
    const updatedConfig = configLoader.getConfig();

    expect(updatedConfig.serviceName).toBe('updated-service');
    expect(updatedConfig.model?.modelName).toBe('new-model');
    expect(updatedConfig.model?.temperature).toBe(0.8);
    expect(updatedConfig.environment).toBe('test');
    expect(updatedConfig.logLevel).toBe('debug'); // Confirm it remains debug
  });
});
