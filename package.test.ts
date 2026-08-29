import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Package Configuration', () => {
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
  );

  describe('Package Identity', () => {
    it('should have correct package name', () => {
      expect(packageJson.name).toBe('tntet-personal-coach');
    });

    it('should be marked as private', () => {
      expect(packageJson.private).toBe(true);
    });

    it('should have correct module type', () => {
      expect(packageJson.type).toBe('module');
    });
  });

  describe('Dependencies', () => {
    it('should not have vite in both dependencies and devDependencies', () => {
      const inDeps = 'vite' in (packageJson.dependencies || {});
      const inDevDeps = 'vite' in (packageJson.devDependencies || {});

      // Should only be in devDependencies
      expect(inDeps).toBe(false);
      expect(inDevDeps).toBe(true);
    });

    it('should have required production dependencies', () => {
      const requiredDeps = [
        'react',
        'react-dom',
        '@supabase/supabase-js',
        'express',
        'dotenv',
      ];

      requiredDeps.forEach((dep) => {
        expect(packageJson.dependencies[dep]).toBeDefined();
      });
    });

    it('should have required dev dependencies', () => {
      const requiredDevDeps = [
        'vitest',
        'typescript',
        'vite',
        'tsx',
        'esbuild',
      ];

      requiredDevDeps.forEach((dep) => {
        expect(packageJson.devDependencies[dep]).toBeDefined();
      });
    });
  });

  describe('Scripts', () => {
    it('should have test script for vitest', () => {
      expect(packageJson.scripts.test).toBeDefined();
      expect(packageJson.scripts.test).toContain('vitest');
    });

    it('should have lint script', () => {
      expect(packageJson.scripts.lint).toBeDefined();
    });
  });
});
