import { readFileSync, accessSync } from 'fs';
import { join } from 'path';

describe('Release Validation', () => {
  describe('Version Information', () => {
    test('package.json version matches README', () => {
      const packageJson = JSON.parse(
        readFileSync(join(__dirname, '../package.json'), 'utf8')
      );
      const readme = readFileSync(join(__dirname, '../README.md'), 'utf8');
      
      // Check version badge
      expect(readme).toContain(`![Version](https://img.shields.io/badge/version-${packageJson.version}-blue.svg)`);
      
      // Check version information section
      expect(readme).toContain(`Current stable version: v${packageJson.version}-shared`);
    });

    test('all required files exist', () => {
      const requiredFiles = [
        'README.md',
        'package.json',
        'tsconfig.json',
        '.gitignore',
        'jest.config.mjs'
      ];

      for (const file of requiredFiles) {
        expect(() => {
          readFileSync(join(__dirname, '../', file));
        }).not.toThrow();
      }
    });

    test('all schemas are valid JSON', () => {
      const schemaFiles = [
        'schemas/mcp/initialize.schema.json',
        'schemas/mcp/initializeResult.schema.json',
        'schemas/mcp/ping.schema.json',
        'schemas/mcp/pingResponse.schema.json',
        'schemas/mcp/tools.call.schema.json',
        'schemas/mcp/tools.call.response.schema.json'
      ];

      for (const file of schemaFiles) {
        expect(() => {
          JSON.parse(readFileSync(join(__dirname, '../', file), 'utf8'));
        }).not.toThrow();
      }
    });
  });

  describe('File Structure', () => {
    const requiredDirs = [
      'schemas/mcp',
      'examples/valid',
      'examples/invalid',
      'types',
      'utils',
      'constants'
    ];

    test.each(requiredDirs)('directory %s exists', (dir) => {
      expect(() => {
        accessSync(join(__dirname, '../', dir));
      }).not.toThrow();
    });
  });

  describe('Documentation', () => {
    test('README.md contains all required sections', () => {
      const readme = readFileSync(join(__dirname, '../README.md'), 'utf8');
      
      const requiredSections = [
        '# Shared Module',
        '## Version Information',
        '## Core Components',
        '## MCP Schemas',
        '## Contributing'
      ];

      requiredSections.forEach(section => {
        expect(readme).toContain(section);
      });
    });

    test('CHANGELOG.md exists and contains version', () => {
      const changelog = readFileSync(join(__dirname, '../CHANGELOG.md'), 'utf8');
      const version = JSON.parse(
        readFileSync(join(__dirname, '../package.json'), 'utf8')
      ).version;

      expect(changelog).toContain(`## [${version}]`);
    });
  });
}); 