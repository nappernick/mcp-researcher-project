import type { AppConfig, BaseConfig } from '../types/configTypes';
import { McpError, ErrorCode } from './errors';

export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  private loadConfig(): AppConfig {
    try {
      // Debug print for troubleshooting
      console.log('ENV before loadConfig():', {
        NODE_ENV: process.env.NODE_ENV,
        LOG_LEVEL: process.env.LOG_LEVEL,
      });

      const env = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development';
      const logLevel = (process.env.LOG_LEVEL as BaseConfig['logLevel']) || 'info';

      console.log('loadConfig() reading:', { env, logLevel });

      const config: AppConfig = {
        environment: env,
        logLevel: logLevel,
        serviceName: process.env.SERVICE_NAME || 'nlp-module',
        port: parseInt(process.env.PORT || '3000', 10),
        host: process.env.HOST || 'localhost',
        model: {
          modelName: process.env.MODEL_NAME || 'gpt-3.5-turbo',
          apiKey: process.env.MODEL_API_KEY,
          maxTokens: parseInt(process.env.MAX_TOKENS || '2048', 10),
          temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
        },
        database: {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '27017', 10),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME || 'nlp_module',
        }
      };

      return config;
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        'Failed to load configuration',
        error
      );
    }
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<AppConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }
}
