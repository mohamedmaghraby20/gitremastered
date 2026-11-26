/**
 * field-reader.ts
 * Reads fields out of parsed YAML and checks their type, so the parsers stay short and every
 * mistake becomes a ContentError that names the file, the place and the field.
 *
 * Example: new FieldReader(record, 'mission.yaml', 'goal 2').text('file')
 * fails with "mission.yaml: goal 2: the "file" field is missing".
 */

import { parse, YAMLParseError } from 'yaml';
import { ContentError } from './content-error.ts';

/** A YAML mapping after parsing: field names to unknown values. */
type FieldRecord = Record<string, unknown>;

/** Reads typed fields from one YAML mapping. */
export class FieldReader {
	private readonly record: FieldRecord;
	private readonly fileName: string;
	private readonly place: string;

	/**
	 * @param value - the parsed YAML value that should be a mapping
	 * @param fileName - the file it came from, for error messages
	 * @param place - where in the file it sits, like "goal 2"; empty for the top level
	 */
	constructor(value: unknown, fileName: string, place = '') {
		this.fileName = fileName;
		this.place = place;
		if (!isFieldRecord(value)) {
			this.fail('expected a set of "name: value" fields');
		}
		this.record = value;
	}

	/**
	 * Parses YAML text and returns a reader for its top level.
	 * @param yamlText - the file's text
	 * @param fileName - the file's path, for error messages
	 * @returns a reader for the top-level fields
	 * @throws ContentError if the YAML is broken
	 */
	static fromYaml(yamlText: string, fileName: string): FieldReader {
		let parsedValue: unknown;
		try {
			parsedValue = parse(yamlText);
		} catch (error) {
			if (error instanceof YAMLParseError) {
				throw new ContentError(fileName, `the YAML could not be read: ${error.message}`);
			}
			throw error;
		}
		return new FieldReader(parsedValue, fileName);
	}

	/**
	 * Reads a required, non-empty text field.
	 * @param fieldName - the field's name
	 * @returns the text, trimmed
	 */
	text(fieldName: string): string {
		const value = this.required(fieldName);
		if (typeof value !== 'string' || value.trim() === '') {
			this.fail(`"${fieldName}" must be non-empty text`);
		}
		return value.trim();
	}

	/**
	 * Reads an optional text field.
	 * @param fieldName - the field's name
	 * @returns the text, trimmed, or null when the field is absent
	 */
	optionalText(fieldName: string): string | null {
		const value = this.record[fieldName];
		if (value === undefined || value === null) {
			return null;
		}
		return this.text(fieldName);
	}

	/**
	 * Reads a required whole number field.
	 * @param fieldName - the field's name
	 * @returns the number
	 */
	wholeNumber(fieldName: string): number {
		const value = this.required(fieldName);
		if (typeof value !== 'number' || !Number.isInteger(value)) {
			this.fail(`"${fieldName}" must be a whole number`);
		}
		return value;
	}

	/**
	 * Reads an optional true/false field.
	 * @param fieldName - the field's name
	 * @returns the value, or false when the field is absent
	 */
	optionalFlag(fieldName: string): boolean {
		const value = this.record[fieldName];
		if (value === undefined) {
			return false;
		}
		if (typeof value !== 'boolean') {
			this.fail(`"${fieldName}" must be true or false`);
		}
		return value;
	}

	/**
	 * Reads a required list of texts.
	 * @param fieldName - the field's name
	 * @param minimumCount - the fewest items allowed (default 1)
	 * @returns the texts, trimmed
	 */
	textList(fieldName: string, minimumCount = 1): string[] {
		const items = this.list(fieldName, minimumCount);
		return items.map((item, index) => {
			if (typeof item !== 'string' || item.trim() === '') {
				this.fail(`"${fieldName}" item ${index + 1} must be non-empty text`);
			}
			return item.trim();
		});
	}

	/**
	 * Reads an optional list of texts.
	 * @param fieldName - the field's name
	 * @returns the texts, trimmed, or an empty list when the field is absent
	 */
	optionalTextList(fieldName: string): string[] {
		if (this.record[fieldName] === undefined || this.record[fieldName] === null) {
			return [];
		}
		return this.textList(fieldName, 0);
	}

	/**
	 * Reads an optional mapping of names to texts, like "main: B".
	 * @param fieldName - the field's name
	 * @returns the pairs in file order, or an empty list when the field is absent
	 */
	optionalTextMap(fieldName: string): { name: string; value: string }[] {
		const mapping = this.record[fieldName];
		if (mapping === undefined || mapping === null) {
			return [];
		}
		if (!isFieldRecord(mapping)) {
			this.fail(`"${fieldName}" must be a set of "name: value" fields`);
		}
		return Object.entries(mapping).map(([name, value]) => {
			if (typeof value !== 'string' || value.trim() === '') {
				this.fail(`"${fieldName}": the value of "${name}" must be non-empty text`);
			}
			return { name, value: value.trim() };
		});
	}

	/**
	 * Reads a required list of mappings, each wrapped in its own reader.
	 * @param fieldName - the field's name
	 * @param itemName - what one item is called in error messages, like "goal"
	 * @param countLimits - the fewest and most items allowed
	 * @returns one reader per item, named "<itemName> <number>"
	 */
	recordList(
		fieldName: string,
		itemName: string,
		countLimits: { minimum: number; maximum?: number } = { minimum: 1 }
	): FieldReader[] {
		const items = this.list(fieldName, countLimits.minimum, countLimits.maximum);
		return items.map((item, index) => {
			const itemPlace = this.joinPlace(`${itemName} ${index + 1}`);
			return new FieldReader(item, this.fileName, itemPlace);
		});
	}

	/**
	 * Throws a ContentError for this place in the file.
	 * @param problem - what is wrong
	 */
	fail(problem: string): never {
		const prefix = this.place === '' ? '' : `${this.place}: `;
		throw new ContentError(this.fileName, `${prefix}${problem}`);
	}

	/**
	 * Reads a field that must exist.
	 * @param fieldName - the field's name
	 * @returns its raw value
	 */
	private required(fieldName: string): unknown {
		const value = this.record[fieldName];
		if (value === undefined || value === null) {
			this.fail(`the "${fieldName}" field is missing`);
		}
		return value;
	}

	/**
	 * Reads a field that must be a list with a number of items inside the limits.
	 * @param fieldName - the field's name
	 * @param minimumCount - the fewest items allowed
	 * @param maximumCount - the most items allowed, if there is a limit
	 * @returns the raw items
	 */
	private list(fieldName: string, minimumCount: number, maximumCount?: number): unknown[] {
		const value = this.required(fieldName);
		if (!Array.isArray(value)) {
			this.fail(`"${fieldName}" must be a list`);
		}
		const isTooShort = value.length < minimumCount;
		const isTooLong = maximumCount !== undefined && value.length > maximumCount;
		if (isTooShort || isTooLong) {
			const allowed =
				maximumCount === undefined
					? `at least ${minimumCount}`
					: `${minimumCount} to ${maximumCount}`;
			this.fail(`"${fieldName}" needs ${allowed} items, found ${value.length}`);
		}
		return value;
	}

	/**
	 * Adds a sub-place to this reader's place, e.g. "module 1" + "lesson 2".
	 * @param subPlace - the inner place
	 * @returns the combined place
	 */
	private joinPlace(subPlace: string): string {
		return this.place === '' ? subPlace : `${this.place}, ${subPlace}`;
	}
}

/**
 * Checks that a parsed YAML value is a mapping (not a list, text or number).
 * @param value - any parsed value
 * @returns true for a plain object
 */
function isFieldRecord(value: unknown): value is FieldRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
