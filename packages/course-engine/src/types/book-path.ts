/**
 * book-path.ts
 * The shape of the Book path, read from content/paths/book-path.yaml (docs/SPEC.md section 4):
 * the course in Pro Git's own order, chapter by chapter, section by section.
 */

/** One section of Pro Git and the lessons that teach it, like 2.2 → three-areas. */
export type BookSection = {
	number: string; // the book's section number, e.g. "2.2"
	title: string; // the book's section title
	lessonIds: string[]; // the lessons that teach this section, in order
};

/** One chapter of Pro Git, like "2 Git Basics". */
export type BookChapter = {
	number: number;
	title: string;
	sections: BookSection[];
};

/** The whole Book path. */
export type BookPath = {
	id: string; // always "book-path", the file name
	title: string;
	chapters: BookChapter[];
};
