/**
 * design-tokens.ts
 * Turns the design tokens (docs/design/tokens.json) into CSS custom properties (variables).
 * Pure functions only: text in, text out. Reading and writing files happens in build-tokens.ts.
 */

import type {
	DesignTokens,
	NamedToken,
	ThemedValue,
	TypeGroup,
	TypeStyle
} from '../src/lib/types/design-tokens.ts';

export type { DesignTokens };

const generatedFileNotice = `/**
 * tokens.css
 * GENERATED from docs/design/tokens.json by scripts/build-tokens.ts.
 * Do not edit by hand: change tokens.json, then run \`pnpm tokens\`.
 *
 * Light values are the default. Dark values apply when <html data-theme="dark">,
 * or when no theme is chosen and the computer is set to dark mode.
 */`;

/**
 * Writes one CSS declaration line, like "  --space-4: 16px;".
 * @param variableName - the name without the leading dashes, like "space-4"
 * @param value - the CSS value
 * @param indent - spaces in front of the line
 * @returns the declaration line
 */
function formatDeclaration(variableName: string, value: string, indent: string): string {
	return `${indent}--${variableName}: ${value};`;
}

/**
 * Wraps declaration lines in a CSS rule block.
 * @param selector - the CSS selector, like ":root"
 * @param declarations - the lines that go inside the braces
 * @param indent - spaces in front of the selector (used inside @media blocks)
 * @returns the whole rule as text
 */
function formatBlock(selector: string, declarations: string[], indent = ''): string {
	const body = declarations.join('\n');
	return `${indent}${selector} {\n${body}\n${indent}}`;
}

/**
 * Lists the declarations for tokens with one value in both themes (spacing, radius, durations).
 * @param tokens - the tokens to convert
 * @param indent - spaces in front of each line
 * @returns one declaration line per token
 */
function plainDeclarations(tokens: NamedToken<string>[], indent: string): string[] {
	return tokens.map((token) => formatDeclaration(token.name, token.value, indent));
}

/**
 * Lists the light-theme declarations for tokens that have a light and a dark value.
 * @param tokens - color or shadow tokens
 * @param indent - spaces in front of each line
 * @returns one declaration line per token, using its light value
 */
function lightDeclarations(tokens: NamedToken<ThemedValue>[], indent: string): string[] {
	return tokens.map((token) => formatDeclaration(token.name, token.value.light, indent));
}

/**
 * Lists the dark-theme declarations, skipping tokens whose dark value equals the light one.
 * @param tokens - color or shadow tokens
 * @param indent - spaces in front of each line
 * @returns one declaration line per token that changes in dark mode
 */
function darkOverrideDeclarations(tokens: NamedToken<ThemedValue>[], indent: string): string[] {
	const changedTokens = tokens.filter((token) => token.value.dark !== token.value.light);
	return changedTokens.map((token) => formatDeclaration(token.name, token.value.dark, indent));
}

/**
 * Lists the font family declarations, like "--font-mono: ...".
 * @param families - family id to CSS font stack, from tokens.json
 * @param indent - spaces in front of each line
 * @returns one declaration line per family
 */
function fontFamilyDeclarations(families: Record<string, string>, indent: string): string[] {
	const familyEntries = Object.entries(families);
	return familyEntries.map(([familyId, fontStack]) =>
		formatDeclaration(`font-${familyId}`, fontStack, indent)
	);
}

/**
 * Lists the declarations for one text style, like --type-h1-size and --type-h1-weight.
 * @param style - the text style
 * @param family - its family id (mono, serif or sans)
 * @param indent - spaces in front of each line
 * @returns the declaration lines for that style
 */
function typeStyleDeclarations(style: TypeStyle, family: string, indent: string): string[] {
	const prefix = `type-${style.name}`;
	const declarations = [
		formatDeclaration(`${prefix}-family`, `var(--font-${family})`, indent),
		formatDeclaration(`${prefix}-size`, style.fontSize, indent),
		formatDeclaration(`${prefix}-line-height`, style.lineHeight, indent),
		formatDeclaration(`${prefix}-weight`, String(style.fontWeight), indent),
		formatDeclaration(`${prefix}-tracking`, style.letterSpacing ?? 'normal', indent),
		formatDeclaration(`${prefix}-style`, style.fontStyle ?? 'normal', indent)
	];
	return declarations;
}

/**
 * Lists the declarations for every text style in every group.
 * @param groups - the type groups from tokens.json
 * @param indent - spaces in front of each line
 * @returns all text style declaration lines
 */
function allTypeDeclarations(groups: TypeGroup[], indent: string): string[] {
	return groups.flatMap((group) =>
		group.styles.flatMap((style) => typeStyleDeclarations(style, group.family, indent))
	);
}

/**
 * Builds the default (light) block: every token, so the app works with no theme chosen.
 * @param designTokens - the parsed tokens.json
 * @returns the CSS rule for :root and [data-theme='light']
 */
function buildLightBlock(designTokens: DesignTokens): string {
	const indent = '\t';
	const declarations = [
		'\tcolor-scheme: light;',
		...lightDeclarations(designTokens.color.tokens, indent),
		...fontFamilyDeclarations(designTokens.type.families, indent),
		...allTypeDeclarations(designTokens.type.groups, indent),
		...plainDeclarations(designTokens.spacing.tokens, indent),
		...plainDeclarations(designTokens.radius.tokens, indent),
		...lightDeclarations(designTokens.shadow.tokens, indent),
		...plainDeclarations(designTokens.duration.tokens, indent)
	];
	return formatBlock(":root,\n[data-theme='light']", declarations);
}

/**
 * Lists the dark-mode lines (color scheme, colors, shadows) at a given indent.
 * @param designTokens - the parsed tokens.json
 * @param indent - spaces in front of each line
 * @returns the declaration lines that change in dark mode
 */
function darkDeclarations(designTokens: DesignTokens, indent: string): string[] {
	return [
		`${indent}color-scheme: dark;`,
		...darkOverrideDeclarations(designTokens.color.tokens, indent),
		...darkOverrideDeclarations(designTokens.shadow.tokens, indent)
	];
}

/**
 * Builds the block used when the computer is in dark mode and no theme is chosen.
 * @param designTokens - the parsed tokens.json
 * @returns an @media rule with the dark overrides
 */
function buildSystemDarkBlock(designTokens: DesignTokens): string {
	const innerBlock = formatBlock(
		':root:not([data-theme])',
		darkDeclarations(designTokens, '\t\t'),
		'\t'
	);
	return `@media (prefers-color-scheme: dark) {\n${innerBlock}\n}`;
}

/**
 * Builds the block that makes every motion instant when the student turns on reduce motion.
 * @param designTokens - the parsed tokens.json
 * @returns an @media rule setting every duration to 0ms
 */
function buildReducedMotionBlock(designTokens: DesignTokens): string {
	const instantDeclarations = designTokens.duration.tokens.map((token) =>
		formatDeclaration(token.name, '0ms', '\t\t')
	);
	const innerBlock = formatBlock(':root', instantDeclarations, '\t');
	return `@media (prefers-reduced-motion: reduce) {\n${innerBlock}\n}`;
}

/**
 * Builds the class for one text style, like ".type-h1 { font-size: var(--type-h1-size); ... }".
 * @param style - the text style
 * @returns the CSS rule for that class
 */
function buildTypeClass(style: TypeStyle): string {
	const prefix = `--type-${style.name}`;
	const declarations = [
		`\tfont-family: var(${prefix}-family);`,
		`\tfont-size: var(${prefix}-size);`,
		`\tline-height: var(${prefix}-line-height);`,
		`\tfont-weight: var(${prefix}-weight);`,
		`\tletter-spacing: var(${prefix}-tracking);`,
		`\tfont-style: var(${prefix}-style);`
	];
	return formatBlock(`.type-${style.name}`, declarations);
}

/**
 * Builds the classes for every text style.
 * @param groups - the type groups from tokens.json
 * @returns all the classes, separated by blank lines
 */
function buildTypeClasses(groups: TypeGroup[]): string {
	const allStyles = groups.flatMap((group) => group.styles);
	return allStyles.map((style) => buildTypeClass(style)).join('\n\n');
}

/**
 * Builds the whole tokens.css file.
 * @param designTokens - the parsed tokens.json
 * @returns the CSS text, ending with a newline
 */
export function buildTokensCss(designTokens: DesignTokens): string {
	const darkBlock = formatBlock("[data-theme='dark']", darkDeclarations(designTokens, '\t'));
	const sections = [
		generatedFileNotice,
		buildLightBlock(designTokens),
		darkBlock,
		buildSystemDarkBlock(designTokens),
		buildReducedMotionBlock(designTokens),
		'/* One class per text style, e.g. <h1 class="type-h1">. */',
		buildTypeClasses(designTokens.type.groups)
	];
	return sections.join('\n\n') + '\n';
}

/**
 * Counts the CSS variables declared in some CSS text.
 * @param css - CSS text, for example one rule block
 * @returns how many "--name:" declarations it contains
 */
export function countCssVariables(css: string): number {
	const declarationPattern = /--[a-z0-9-]+:/g;
	const matches = css.match(declarationPattern);
	return matches?.length ?? 0;
}
