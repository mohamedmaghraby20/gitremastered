/**
 * reference.ts
 * The shapes of the command index's content (docs/SPEC.md section 4):
 * - a command page, read from content/commands/<command-id>.md;
 * - a glossary term, read from content/glossary.yaml.
 */

/** One command page, like "git status". */
export type CommandPage = {
	id: string; // also the file name, e.g. "git-status"
	command: string; // as typed, e.g. "git status"
	group: string; // the command index's group, e.g. "Daily loop"
	summary: string; // what it does, in one line
	usage: string[]; // the common ways to type it, e.g. ["git status", "git status -s"]
	bookSection: string; // the Pro Git section, e.g. "2.2 Recording Changes to the Repository"
	bookUrl: string; // the section in the official online Pro Git
	lessonIds: string[]; // lessons that teach it ("Learn it" links)
	body: string; // the explanation, Markdown with the usual lesson blocks
};

/** One glossary term, like "staging area". */
export type GlossaryTerm = {
	id: string; // used in links, e.g. "staging-area"
	term: string; // as shown, e.g. "staging area"
	meaning: string; // one or two plain sentences (Markdown)
	lessonIds: string[]; // lessons that teach it
};
