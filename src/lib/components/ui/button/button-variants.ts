/**
 * button-variants.ts
 * The Button's looks (classes per variant) and its prop types, kept apart from the markup
 * so other files can import them as plain TypeScript.
 */

import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * The classes for each variant. Every color is a token class (bg-primary = var(--primary)).
 * base: shared shape, the 3px keycap edge, the 2px press-down, the focus ring.
 */
export const buttonVariants = tv({
	base: [
		'type-button inline-flex items-center gap-2 rounded-medium cursor-pointer select-none',
		'px-4 pt-2.25 pb-2 border border-b-3',
		'transition-[translate,border-bottom-width,background-color,color] duration-(--duration-fast) ease-out',
		'active:translate-y-0.5 active:border-b active:mb-0.5',
		'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary',
		'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0',
		'aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:active:translate-y-0',
		'motion-reduce:transition-none'
	],
	variants: {
		variant: {
			primary: 'bg-primary text-on-primary border-primary border-b-primary-edge',
			secondary: 'bg-surface text-ink border-border-strong',
			ghost:
				'bg-transparent text-ink-muted border-transparent hover:bg-surface-sunken hover:text-ink'
		}
	},
	defaultVariants: { variant: 'primary' }
});

/** The three looks a Button can have. */
export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;

/** Everything a Button accepts: its own options plus any normal <button> attribute. */
export type ButtonProps = HTMLButtonAttributes & {
	variant?: ButtonVariant;
	shortcut?: string;
	/** The real <button> element, so a parent can move focus to it. */
	ref?: HTMLButtonElement | null;
	children?: Snippet;
};
