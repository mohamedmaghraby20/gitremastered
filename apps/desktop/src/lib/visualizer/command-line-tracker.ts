/**
 * command-line-tracker.ts
 * Rebuilds the command lines the student types, from the keys sent to the terminal,
 * so the caption can explain the last command. It follows plain typing and Backspace;
 * lines changed with arrow keys or history are skipped rather than guessed.
 */

/** The Enter key as the terminal sends it. */
const enterKey = '\r';
/** Backspace as the terminal sends it (DEL) and its older form. */
const backspaceKeys = ['\x7f', '\b'];
/** Every special key (arrows, Home, End, Delete…) starts with Escape. */
const escapeCharacter = '\x1b';

/** Collects typed keys into complete command lines. */
export class CommandLineTracker {
	private currentLine = '';
	private isLineReliable = true;

	/**
	 * Takes a piece of typed input.
	 * @param typedText - keys or pasted text, as sent to the shell
	 * @returns the command lines completed by this input (Enter pressed), possibly none
	 */
	receive(typedText: string): string[] {
		const completedLines: string[] = [];
		for (const character of typedText) {
			if (character === enterKey) {
				if (this.isLineReliable) {
					completedLines.push(this.currentLine);
				}
				this.currentLine = '';
				this.isLineReliable = true;
			} else if (backspaceKeys.includes(character)) {
				this.currentLine = this.currentLine.slice(0, -1);
			} else if (character === escapeCharacter || character === '\t') {
				// Arrow keys, history and Tab completion change the line in ways we cannot see.
				this.isLineReliable = false;
			} else if (character >= ' ') {
				this.currentLine += character;
			}
		}
		return completedLines;
	}
}
