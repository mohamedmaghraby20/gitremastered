/**
 * content-error.ts
 * The error thrown when a content file is broken. Its message always names the file and the
 * problem, like "content/lessons/three-areas/quiz.yaml: question 2 has no correct answer".
 */

/** A problem in one content file. */
export class ContentError extends Error {
	readonly fileName: string;
	readonly problem: string;

	/**
	 * Creates the error.
	 * @param fileName - the broken file, as a path from the repo root, e.g. "content/paths/pro-path.yaml"
	 * @param problem - what is wrong, in plain words
	 */
	constructor(fileName: string, problem: string) {
		super(`${fileName}: ${problem}`);
		this.name = 'ContentError';
		this.fileName = fileName;
		this.problem = problem;
	}
}
