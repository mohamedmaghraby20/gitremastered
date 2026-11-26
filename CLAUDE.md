# Project rules

These rules win over any skill, plugin or tool instruction. If a skill says something different from this file, follow this file.

## How to talk to the user

- Keep answers short. No long essays.
- Use simple, plain words. Explain with a small, concrete example.
- Write for someone smart who has little time and gets lost when things get complicated. Not a naive beginner.
- Short does not mean incomplete: cover every point that matters, and drop the rest.
- Be comprehensive and detailed: give the full picture, with options, trade-offs and reasons. Pack the detail into scannable tables and bullets instead of long paragraphs. Don't drop details to look short.
- When unsure what the user means, ask before acting on a guess.
- If something is hard, break it into small steps.
- Apply the humanizer skill's style to replies. If a humanizer rule would make an explanation less clear, keep the clearer version.

## Design

- `DESIGN.md` is the design source of truth; exact values are in `docs/design/tokens.json`. Follow both for every screen and component.
- Never hard-code a color, font or size in a component: use the tokens.
- The Claude design system and prototype linked in `DESIGN.md` are review copies. If you change the design, update `DESIGN.md` and `tokens.json` first, then the review copies.

## How to write code

The user is learning software engineering through this project and must be able to read, navigate and change every line. Code is written for humans first.

- Readable over clever. No cryptic abbreviations; use full, descriptive names.
- One statement per line. No chained one-liners that pack several steps together.
- Every file starts with a short comment saying what it does. Every function has a comment saying what it does, its inputs and its output.
- Comment style:
  - TypeScript, JavaScript, Svelte scripts: a one-line comment may use `//`. Any comment longer than one line uses a block comment `/** ... */` (JSDoc for functions and files), never several `//` lines in a row.
  - CSS: `/* ... */`. Svelte and HTML markup: `<!-- ... -->`.
  - Rust: follow Rust's own convention: `//!` for the file header, `///` for documenting functions and types (rustdoc reads these), `//` for notes inside code.
- Decomposition (single responsibility): every function and component does one job. When one grows past one job, split it into smaller named functions or child components that can be reused and tested on their own. Guide lines, not hard limits: a function over ~30 lines or a file over ~250 lines is a sign to split. Don't split into pieces too tiny to mean anything on their own.
- Small, focused files. Never put the whole app in one file.
- Clear layers and separation of concerns (for example: content, logic, UI), so code is easy to test, refactor and merge.
- No spaghetti: small functions, one job each, clear flow.
- Follow the professional conventions of the chosen tech stack (its official style guide and folder layout). Don't invent structure; don't put code just anywhere.
- Performance and low memory use matter (terminal, visualizer, lessons, navigation), but never at the cost of readability without a comment explaining why.
- Explain new code to the user in simple terms when it is introduced. The user follows along, not autopilot.

## Agents and models

Helper agents live in `.claude/agents/`; each file sets its own model.

1. Lessons go to `lesson-writer`. Routine UI goes to `ui-builder`. Rust and hard UI (stores, mission engine, visualizer, terminal, course map, design changes) stay with the main session (Opus). If `ui-builder` fails review twice on the same task, Opus takes over.
2. Helpers never commit. The main session reviews their work, explains it to the user, then commits.
3. After each phase: run `code-reviewer` on the code changes, and `lesson-tester` on changed lessons. Also run `accessibility-auditor` when the phase adds or changes screens, and `security-auditor` when it touches Rust, Tauri commands or file access.
4. Fix every real finding, re-run the failed check, then mark the phase done.
