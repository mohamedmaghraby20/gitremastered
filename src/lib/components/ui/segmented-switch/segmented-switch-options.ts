/**
 * segmented-switch-options.ts
 * Types for the segmented switch (a row of joined buttons where exactly one is chosen).
 */

/** One choice in the switch, like { value: "dark", label: "Dark" }. */
export type SegmentedSwitchOption<Value extends string> = {
	value: Value;
	label: string;
};
