/**
 * parse-path.ts
 * Reads a learning path file (content/paths/<path-id>.yaml): modules with ordered lesson IDs.
 */

import type { LearningPath, PathModule } from '../types/learning-path.ts';
import { FieldReader } from './field-reader.ts';

/**
 * Reads a whole path file.
 * @param fileText - the file's text
 * @param fileName - its path, for error messages
 * @returns the typed learning path
 * @throws ContentError naming the file and the problem
 */
export function parseLearningPathText(fileText: string, fileName: string): LearningPath {
	const reader = FieldReader.fromYaml(fileText, fileName);
	const moduleReaders = reader.recordList('modules', 'module');
	return {
		id: reader.text('id'),
		title: reader.text('title'),
		modules: moduleReaders.map(readPathModule)
	};
}

/**
 * Reads one module of a path.
 * @param moduleReader - a reader for one item of "modules"
 * @returns the typed module
 */
function readPathModule(moduleReader: FieldReader): PathModule {
	return {
		id: moduleReader.text('id'),
		title: moduleReader.text('title'),
		lessonIds: moduleReader.textList('lessons')
	};
}
