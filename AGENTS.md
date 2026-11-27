# AGENTS.md

Rules for everyone who changes this repository, people and AI coding tools alike. Claude Code reads this file through `CLAUDE.md`; other tools read it directly.

GitRemastered is an interactive Git and GitHub course built on the Pro Git book: a desktop app (SvelteKit screens + Rust core with Tauri) with a real practice terminal and a live visualizer.

## Where things live

| Folder | What it is |
|---|---|
| `src/`, `src-tauri/` | The desktop app: screens (Svelte + TypeScript) and core (Rust) |
| `packages/course-engine/` | Course logic with no screens and no Tauri, shared with the future website |
| `content/` | Lessons, paths, command pages, glossary |
| `tools/` | Content checks (`pnpm content:check`, `pnpm lesson:check`) |
| `docs/` | Course map, lesson writing guide, design, decisions, roadmap |
| `vendor/progit2/` | Pro Git source (Git submodule), the source every lesson follows |

Architecture and contracts: `SPEC.md`. Commands: `CONTRIBUTING.md`. All commands run from the repository root.

## Design

- `DESIGN.md` is the design source of truth; exact values are in `docs/design/tokens.json`. Follow both for every screen and component.
- Never hard-code a color, font or size in a component: use the tokens.
- To change the design, update `DESIGN.md` and `tokens.json` first, then run `pnpm tokens`, then change the screens.

## How to write code

Code is written for humans first: someone learning software engineering must be able to read, navigate and change every line.

- Readable over clever. No cryptic abbreviations; use full, descriptive names.
- One statement per line. No chained one-liners that pack several steps together.
- Every file starts with a short comment saying what it does. Every function has a comment saying what it does, its inputs and its output.
- Comment style:
  - TypeScript, JavaScript, Svelte scripts: a one-line comment may use `//`. Any comment longer than one line uses a block comment `/** ... */` (JSDoc for functions and files), never several `//` lines in a row.
  - CSS: `/* ... */`. Svelte and HTML markup: `<!-- ... -->`.
  - Rust: `//!` for the file header, `///` for documenting functions and types, `//` for notes inside code.
- Single responsibility: every function and component does one job. A function over ~30 lines or a file over ~250 lines is a sign to split (a guide, not a hard limit). Don't split into pieces too tiny to mean anything on their own.
- Clear layers (content, logic, UI), so code is easy to test, refactor and merge. Course logic that needs no screens and no Tauri belongs in `packages/course-engine`.
- Follow the professional conventions of the stack (its official style guide and folder layout). Don't invent structure.
- Performance and low memory use matter (terminal, visualizer, lessons, navigation), but never at the cost of readability without a comment explaining why.

## Workflow

| Step | Who | What |
|---|---|---|
| Write lessons | `lesson-writer` agent, or you | Only files under `content/lessons/<id>/` and new command or glossary entries. Never shared files (`content/paths/*.yaml`, other lessons); the main session adds new lessons to the paths and runs the link pass (`pnpm lesson:link`) |
| Write routine UI | `ui-builder` agent, or you | Screens and components under `src/` |
| Rust, stores, mission engine, visualizer, terminal, course map, design changes | main session | Kept together because they are hard to get right |
| Check | the check agents (below) | After each phase of work |
| Commit | main session only | After reviewing the work and explaining it |

After each phase:

1. Run `code-reviewer` on the code changes, and `lesson-tester` on changed lessons (it runs the real-app playthrough; `lesson:check` alone is not enough).
2. Also run `accessibility-auditor` when screens are added or changed, and `security-auditor` when Rust, Tauri commands or file access change.
3. Fix every real finding, re-run the failed check, then mark the phase done.

Working rules learned the hard way:

- Writers working in parallel each use their own scratch folder, named after their lesson, so they never overwrite each other.
- Edit files with an editor tool, never through shell strings: backticks and quotes in shell commands have broken files before.
- Commit titles describe the change, with no task numbers.

## Agents and commands

Helper agents live in `.claude/agents/`, slash commands in `.claude/commands/`.

| Agent | Use for |
|---|---|
| `lesson-writer` | Writing and revising lessons, command pages, glossary entries |
| `lesson-tester` | Running content checks, missions and the real-app playthrough on lessons |
| `ui-builder` | Routine Svelte screens and components |
| `code-reviewer` | Review after each phase |
| `accessibility-auditor` | Screens added or changed |
| `security-auditor` | Rust, Tauri commands, file access |
| `test-engineer` | Designing a test suite or finding coverage gaps (on request) |
| `web-performance-auditor` | Loading and rendering audits of the screens (on request) |

| Command | What it does |
|---|---|
| `/spec` | Write or update `SPEC.md` before a big change |
| `/plan` | Break work into small tasks (local notes in `tasks/`, not committed) |
| `/build` | Build the planned tasks one by one, test and verify each |
| `/test` | Test-first workflow; for bugs, prove the bug with a failing test first |
| `/review-code` | Five-axis code review |
| `/code-simplify` | Simplify code without changing behavior |
| `/a11y` | Accessibility audit |
| `/webperf` | Web performance audit |
| `/constraints` | Write down the quality bar (`CONSTRAINTS.md`) |
| `/ship` | Pre-release checklist with a go or no-go |
