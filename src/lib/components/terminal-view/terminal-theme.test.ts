/**
 * terminal-theme.test.ts
 * Tests for turning the terminal design tokens into xterm.js colors and font settings.
 */

import { describe, expect, it } from 'vitest';
import { buildTerminalFont, buildTerminalTheme } from './terminal-theme';

/** Token values like the light theme's, as the browser would report them. */
const sampleTokens: Record<string, string> = {
	'--terminal-bg': '#141412',
	'--terminal-ink': '#f1f0e4',
	'--terminal-muted': '#8f8e82',
	'--terminal-prompt': '#faff69',
	'--terminal-glow': 'rgba(250, 255, 105, 0.28)',
	'--terminal-green': '#7fdc8a',
	'--terminal-red': '#ff8a7a',
	'--type-terminal-family': '"JetBrains Mono", Consolas, monospace',
	'--type-terminal-size': '14px',
	'--type-terminal-line-height': '22px'
};

/**
 * Reads a sample token, like getComputedStyle would.
 * @param tokenName - e.g. "--terminal-bg"
 * @returns its value, or "" if unknown
 */
function readSampleToken(tokenName: string): string {
	return sampleTokens[tokenName] ?? '';
}

describe('buildTerminalTheme', () => {
	it('uses the terminal tokens for screen, text, cursor and selection', () => {
		const theme = buildTerminalTheme(readSampleToken);
		expect(theme.background).toBe('#141412');
		expect(theme.foreground).toBe('#f1f0e4');
		expect(theme.cursor).toBe('#faff69');
		expect(theme.selectionBackground).toBe('rgba(250, 255, 105, 0.28)');
	});

	it("maps Git's green and red output to the terminal green and red", () => {
		const theme = buildTerminalTheme(readSampleToken);
		expect(theme.green).toBe('#7fdc8a');
		expect(theme.red).toBe('#ff8a7a');
		expect(theme.brightBlack).toBe('#8f8e82');
	});
});

describe('buildTerminalFont', () => {
	it('reads the font family, size and line height from the terminal text style', () => {
		expect(buildTerminalFont(readSampleToken)).toEqual({
			fontFamily: '"JetBrains Mono", Consolas, monospace',
			fontSize: 14,
			lineHeight: 22 / 14
		});
	});
});
