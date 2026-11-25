/**
 * terminal-theme.ts
 * Turns the terminal design tokens (CSS variables from tokens.css) into the color and font
 * settings xterm.js expects, so the terminal never has a hard-coded color.
 */

import type { ITheme } from '@xterm/xterm';

/** Reads one CSS variable, e.g. "--terminal-bg" → "#141412". */
export type TokenReader = (tokenName: string) => string;

/**
 * Builds xterm.js colors from the terminal tokens.
 * @param readToken - reads a CSS variable
 * @returns the xterm.js theme
 */
export function buildTerminalTheme(readToken: TokenReader): ITheme {
	const screen = readToken('--terminal-bg');
	const ink = readToken('--terminal-ink');
	const muted = readToken('--terminal-muted');
	const prompt = readToken('--terminal-prompt');
	const green = readToken('--terminal-green');
	const red = readToken('--terminal-red');
	return {
		background: screen,
		foreground: ink,
		cursor: prompt,
		cursorAccent: screen,
		selectionBackground: readToken('--terminal-glow'),
		// The 16 ANSI colors. Git mostly uses red, green and yellow; the rest stay readable ink.
		black: screen,
		red,
		green,
		yellow: prompt,
		blue: ink,
		magenta: ink,
		cyan: ink,
		white: ink,
		brightBlack: muted,
		brightRed: red,
		brightGreen: green,
		brightYellow: prompt,
		brightBlue: ink,
		brightMagenta: ink,
		brightCyan: ink,
		brightWhite: ink
	};
}

/**
 * Builds xterm.js font settings from the "terminal" text style.
 * @param readToken - reads a CSS variable
 * @returns the font family, size in pixels, and line height as a multiple of the size
 */
export function buildTerminalFont(readToken: TokenReader): {
	fontFamily: string;
	fontSize: number;
	lineHeight: number;
} {
	const fontSize = parseFloat(readToken('--type-terminal-size'));
	const lineHeightPixels = parseFloat(readToken('--type-terminal-line-height'));
	return {
		fontFamily: readToken('--type-terminal-family'),
		fontSize,
		lineHeight: lineHeightPixels / fontSize
	};
}

/**
 * Makes a token reader for the styles that apply to an element (so the current theme counts).
 * @param element - any element on the page
 * @returns a reader of that element's CSS variables
 */
export function readTokensFrom(element: Element): TokenReader {
	const computedStyle = getComputedStyle(element);
	return (tokenName) => computedStyle.getPropertyValue(tokenName).trim();
}
