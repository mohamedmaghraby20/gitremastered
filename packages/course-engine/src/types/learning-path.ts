/**
 * learning-path.ts
 * The shape of a learning path, read from content/paths/<path-id>.yaml (docs/SPEC.md section 4).
 */

/** A group of lessons inside a path, like "Your daily loop". */
export type PathModule = {
	id: string;
	title: string;
	lessonIds: string[]; // in the order the student takes them
};

/** One ordering of the course: the pro path or the book path. */
export type LearningPath = {
	id: string; // also the file name, e.g. "pro-path"
	title: string;
	modules: PathModule[];
};
