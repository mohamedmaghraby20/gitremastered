/**
 * design-tokens.ts
 * The shape of docs/design/tokens.json, shared by the token generator and the dev gallery.
 */

/** A value that differs between the light and dark themes. */
export type ThemedValue = { light: string; dark: string };

/** One named token, like { name: "space-4", value: "16px" }. */
export type NamedToken<Value> = { name: string; value: Value; usage?: string };

/** One text style, like h1 or lesson. */
export type TypeStyle = {
	name: string;
	fontSize: string;
	lineHeight: string;
	fontWeight: number;
	letterSpacing?: string;
	fontStyle?: string;
	sample?: string;
};

/** A group of text styles that share one font family (mono, serif or sans). */
export type TypeGroup = { name: string; family: string; styles: TypeStyle[] };

/** The shape of docs/design/tokens.json (only the parts the CSS needs). */
export type DesignTokens = {
	color: { tokens: NamedToken<ThemedValue>[] };
	type: { families: Record<string, string>; groups: TypeGroup[] };
	spacing: { tokens: NamedToken<string>[] };
	radius: { tokens: NamedToken<string>[] };
	shadow: { tokens: NamedToken<ThemedValue>[] };
	duration: { tokens: NamedToken<string>[] };
};
