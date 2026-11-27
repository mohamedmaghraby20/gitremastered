/**
 * switch-keys.ts
 * The segmented switch's arrow-key rules, as one pure function. They follow the usual
 * radio-group pattern (WAI-ARIA Authoring Practices): arrows move and wrap, Home and End jump.
 */

/** Keys that move to the next option. */
const nextKeys = ['ArrowRight', 'ArrowDown'];

/** Keys that move to the previous option. */
const previousKeys = ['ArrowLeft', 'ArrowUp'];

/**
 * Finds which option a key press moves to.
 * @param currentIndex - the position of the option that has focus now
 * @param key - the pressed key's name, like "ArrowRight"
 * @param optionCount - how many options the switch has
 * @returns the new option's position, or null when the key does not move
 */
export function findNextOptionIndex(
	currentIndex: number,
	key: string,
	optionCount: number
): number | null {
	if (nextKeys.includes(key)) {
		return (currentIndex + 1) % optionCount;
	}
	if (previousKeys.includes(key)) {
		return (currentIndex - 1 + optionCount) % optionCount;
	}
	if (key === 'Home') {
		return 0;
	}
	if (key === 'End') {
		return optionCount - 1;
	}
	return null;
}
