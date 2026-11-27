/**
 * eslint.config.js
 * ESLint settings for the course engine (plain TypeScript).
 * The app at the repository root has its own config, which adds Svelte.
 * Recommended rule sets with type information; formatting is left to Prettier.
 */

import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

export default defineConfig(
	// Sample lesson files are content, not code.
	{ ignores: ['**/node_modules/**', 'tests/fixtures/sample-lesson/**'] },
	js.configs.recommended,
	ts.configs.recommendedTypeChecked,
	prettier,
	{
		languageOptions: {
			parserOptions: { projectService: true },
			globals: { ...globals.node }
		},
		rules: {
			// TypeScript already reports unknown variables, so this rule is off.
			'no-undef': 'off'
		}
	}
);
