/**
 * course-content.test.ts
 * Checks that the real content/ folder loads without errors, so a broken lesson fails the tests.
 */

import { describe, expect, it } from 'vitest';
import { courseContent, getLesson } from './course-content.ts';

describe('courseContent', () => {
	it('loads the real content folder', () => {
		expect(courseContent.lessons).toBeInstanceOf(Map);
	});

	it('returns nothing for an unknown lesson ID', () => {
		expect(getLesson('no-such-lesson')).toBeUndefined();
	});
});
