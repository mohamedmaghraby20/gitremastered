/**
 * parse-path.test.ts
 * Tests for reading a learning path file.
 */

import { describe, expect, it } from 'vitest';
import { parseLearningPathText } from './parse-path.ts';

const fileName = 'content/paths/pro-path.yaml';
const validPathText = `id: pro-path
title: Pro path
modules:
  - id: daily-loop
    title: Your daily loop
    lessons: [three-areas, ignoring-files]
`;

describe('parseLearningPathText', () => {
	it('reads a valid path', () => {
		expect(parseLearningPathText(validPathText, fileName)).toEqual({
			id: 'pro-path',
			title: 'Pro path',
			modules: [
				{
					id: 'daily-loop',
					title: 'Your daily loop',
					lessonIds: ['three-areas', 'ignoring-files']
				}
			]
		});
	});

	it('rejects a module with no lessons', () => {
		const noLessons = validPathText.replace('    lessons: [three-areas, ignoring-files]\n', '');
		expect(() => parseLearningPathText(noLessons, fileName)).toThrow(
			'module 1: the "lessons" field is missing'
		);
	});
});
