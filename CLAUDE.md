# Project rules

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
- Small, focused files. Never put the whole app in one file.
- Clear layers and separation of concerns (for example: content, logic, UI), so code is easy to test, refactor and merge.
- No spaghetti: small functions, one job each, clear flow.
- Follow the professional conventions of the chosen tech stack (its official style guide and folder layout). Don't invent structure; don't put code just anywhere.
- Performance and low memory use matter (terminal, visualizer, lessons, navigation), but never at the cost of readability without a comment explaining why.
- Explain new code to the user in simple terms when it is introduced. The user follows along, not autopilot.
