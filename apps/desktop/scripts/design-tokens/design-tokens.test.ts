/**
 * design-tokens.test.ts
 * Tests for the design token converter: tokens.json in, tokens.css text out.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildTokensCss, countCssVariables, type DesignTokens } from './design-tokens';

const tokensJsonPath = new URL('../../../../docs/design/tokens.json', import.meta.url);
const tokensCssPath = new URL('../../src/lib/styles/tokens.css', import.meta.url);
const designTokens = JSON.parse(readFileSync(tokensJsonPath, 'utf8')) as DesignTokens;
const tokensCss = buildTokensCss(designTokens);

/**
 * Returns the CSS text inside the first block whose selector line starts with the given text.
 * @param css - the whole stylesheet
 * @param selectorStart - the start of the selector line, like ":root,"
 * @returns the text between that block's braces
 */
function getBlock(css: string, selectorStart: string): string {
	const blockStart = css.indexOf(selectorStart);
	const openBrace = css.indexOf('{', blockStart);
	const closeBrace = css.indexOf('}', openBrace);
	return css.slice(openBrace + 1, closeBrace);
}

describe('buildTokensCss', () => {
	it('says the file is generated and must not be edited by hand', () => {
		expect(tokensCss).toContain('Do not edit by hand');
	});

	it('puts the light value of each color in the default block', () => {
		const lightBlock = getBlock(tokensCss, ':root,');
		expect(lightBlock).toContain('--canvas: #fafafa;');
		expect(lightBlock).toContain('--primary: #303055;');
	});

	it('puts dark overrides in the dark theme block', () => {
		const darkBlock = getBlock(tokensCss, "[data-theme='dark']");
		expect(darkBlock).toContain('--canvas: #121212;');
		expect(darkBlock).toContain('--primary: #faff69;');
	});

	it('leaves colors that are the same in both themes out of the dark block', () => {
		const darkBlock = getBlock(tokensCss, "[data-theme='dark']");
		expect(darkBlock).not.toContain('--highlight:');
	});

	it('follows the system setting when no theme is chosen', () => {
		expect(tokensCss).toContain('@media (prefers-color-scheme: dark)');
		expect(tokensCss).toContain(':root:not([data-theme])');
	});

	it('makes every motion instant when reduce motion is on', () => {
		expect(tokensCss).toContain('@media (prefers-reduced-motion: reduce)');
		expect(tokensCss).toContain('--duration-visual: 0ms;');
	});

	it('turns spacing, radius, shadow, duration and font tokens into variables', () => {
		expect(tokensCss).toContain('--space-4: 16px;');
		expect(tokensCss).toContain('--radius-medium: 5px;');
		expect(tokensCss).toContain('--shadow-window:');
		expect(tokensCss).toContain('--duration-base: 200ms;');
		expect(tokensCss).toContain('--font-mono: "JetBrains Mono", Consolas, monospace;');
		expect(tokensCss).toContain('--type-h1-size: 32px;');
	});

	it('creates one class per text style that reads its variables', () => {
		const headingClass = getBlock(tokensCss, '.type-h1 ');
		expect(headingClass).toContain('font-size: var(--type-h1-size);');
		expect(headingClass).toContain('font-family: var(--type-h1-family);');
		expect(tokensCss).toContain('.type-sidenote {');
	});

	it('creates one variable for every token in tokens.json', () => {
		const colorCount = designTokens.color.tokens.length;
		const spacingCount = designTokens.spacing.tokens.length;
		const radiusCount = designTokens.radius.tokens.length;
		const shadowCount = designTokens.shadow.tokens.length;
		const durationCount = designTokens.duration.tokens.length;
		const expectedMinimum = colorCount + spacingCount + radiusCount + shadowCount + durationCount;

		const lightBlock = getBlock(tokensCss, ':root,');
		expect(countCssVariables(lightBlock)).toBeGreaterThanOrEqual(expectedMinimum);
	});

	it('matches the committed tokens.css (run `pnpm tokens` after editing tokens.json)', () => {
		const committedCss = readFileSync(tokensCssPath, 'utf8');
		expect(committedCss).toBe(tokensCss);
	});
});
