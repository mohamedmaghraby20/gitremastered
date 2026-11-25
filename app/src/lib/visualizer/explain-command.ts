/**
 * explain-command.ts
 * Writes the one-sentence caption under the visualizer for the last command the student ran.
 * Covers the pilot's commands: status, add, commit, restore. Pure logic, no screen code.
 */

/** A caption: the command as typed, and what it did in plain words. */
export type CommandCaption = { commandLine: string; explanation: string };

/**
 * Explains a command line.
 * @param commandLine - what the student typed, e.g. "git add notes.txt"
 * @returns the caption, or null for empty lines and commands that are not Git
 */
export function explainCommand(commandLine: string): CommandCaption | null {
	const words = commandLine
		.trim()
		.split(/\s+/)
		.filter((word) => word !== '');
	if (words[0] !== 'git' || words.length < 2) {
		return null;
	}
	const subcommand = words[1];
	const options = words.slice(2).filter((word) => word.startsWith('-'));
	const files = words.slice(2).filter((word) => !word.startsWith('-'));
	const explanation = explainGitSubcommand(subcommand, options, files);
	return { commandLine: commandLine.trim(), explanation };
}

/**
 * Explains one Git subcommand.
 * @param subcommand - e.g. "add"
 * @param options - words starting with "-", e.g. ["--staged"]
 * @param files - the other words, e.g. ["notes.txt"]
 * @returns one sentence
 */
function explainGitSubcommand(subcommand: string, options: string[], files: string[]): string {
	switch (subcommand) {
		case 'status':
			return 'Status only looks: it shows which area each file is in. Nothing moved.';
		case 'add':
			return `${describeFiles(files)} moved to the staging area. Commit to save a snapshot.`;
		case 'commit':
			return options.some((option) => option === '-a' || option.startsWith('-a'))
				? 'Every change to tracked files was staged and saved as a new commit.'
				: 'The staging area was saved as a new commit in the repository.';
		case 'restore':
			return options.includes('--staged')
				? `${describeFiles(files)} left the staging area. The edit is still in your working folder.`
				: `${describeFiles(files)} went back to the last saved version. The edit is gone.`;
		default:
			return `Ran git ${subcommand}.`;
	}
}

/**
 * Names the files a command touched, in a short phrase.
 * @param files - the file arguments
 * @returns e.g. "notes.txt", "notes.txt and app.js", "3 files", or "Every change" for "."
 */
function describeFiles(files: string[]): string {
	if (files.length === 0 || files.includes('.') || files.includes('-A')) {
		return 'Every change';
	}
	if (files.length === 1) {
		return files[0];
	}
	if (files.length === 2) {
		return `${files[0]} and ${files[1]}`;
	}
	return `${files.length} files`;
}
