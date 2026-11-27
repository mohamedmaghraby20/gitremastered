/**
 * build-tokens.ts
 * Command-line entry for `pnpm tokens`: reads docs/design/tokens.json and writes
 * src/lib/styles/tokens.css. The conversion itself lives in design-tokens.ts.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTokensCss, type DesignTokens } from './design-tokens.ts';

const tokensJsonPath = fileURLToPath(new URL('../docs/design/tokens.json', import.meta.url));
const tokensCssPath = fileURLToPath(new URL('../src/lib/styles/tokens.css', import.meta.url));

/**
 * Reads the tokens, converts them and writes the CSS file.
 * Inputs: none (paths are fixed above). Output: none; prints where the file was written.
 */
function writeTokensCss(): void {
	const tokensJsonText = readFileSync(tokensJsonPath, 'utf8');
	const designTokens = JSON.parse(tokensJsonText) as DesignTokens;
	const tokensCss = buildTokensCss(designTokens);

	mkdirSync(dirname(tokensCssPath), { recursive: true });
	writeFileSync(tokensCssPath, tokensCss);
	console.log(`Wrote ${tokensCssPath}`);
}

writeTokensCss();
