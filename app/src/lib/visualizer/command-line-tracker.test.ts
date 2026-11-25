/**
 * command-line-tracker.test.ts
 * Tests for rebuilding typed command lines from terminal keys.
 */

import { describe, expect, it } from 'vitest';
import { CommandLineTracker } from './command-line-tracker';

describe('CommandLineTracker', () => {
	it('returns a line when Enter is pressed, typed key by key', () => {
		const tracker = new CommandLineTracker();
		const lines = [...'git status'].flatMap((key) => tracker.receive(key));
		expect(lines).toEqual([]);
		expect(tracker.receive('\r')).toEqual(['git status']);
	});

	it('follows Backspace', () => {
		const tracker = new CommandLineTracker();
		expect(tracker.receive('git statsu\x7f\x7fus\r')).toEqual(['git status']);
	});

	it('skips a line changed with arrow keys, then works again', () => {
		const tracker = new CommandLineTracker();
		expect(tracker.receive('\x1b[A\r')).toEqual([]);
		expect(tracker.receive('git add notes.txt\r')).toEqual(['git add notes.txt']);
	});

	it('handles pasted text with several lines', () => {
		const tracker = new CommandLineTracker();
		expect(tracker.receive('git add a.txt\rgit commit -m "A"\r')).toEqual([
			'git add a.txt',
			'git commit -m "A"'
		]);
	});
});
