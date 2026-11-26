# Implementation Plan: GitRemastered app

Source spec: SPEC.md

Also built on: `DESIGN.md` + `docs/design/tokens.json` (look), `docs/course-map.md` (content), `docs/decisions/0001-app-platform.md` (stack), `CLAUDE.md` (rules), and the approved prototype linked in `DESIGN.md`.

## Overview

Build the GitRemastered desktop app (Tauri 2 + SvelteKit + Rust) from an empty folder to a released app. Planning is rolling-wave: the whole project is mapped as phases with clear goals, and only the next two phases are broken into detailed tasks (`tasks/todo.md`). Later phases get their tasks after the pilot lesson teaches us what works.

## How we work through it

- One task at a time with `/build`: test first, smallest code that passes, all checks green, one commit per task.
- After every task you read the code and the explanation; nothing moves on until it's clear.
- Checkpoints stop the line: you try the app and approve before the next phase starts.

## Phases (the whole project)

| # | Phase | Goal: done when… | Detail |
|---|---|---|---|
| 1 | **Foundation** | Your PC has every tool; an empty app opens in our design with working navigation; tests and checks run | Detailed tasks 1–7 |
| 2 | **Pilot lesson** | "Status, stage, commit" works end to end: text, real terminal, live visualizer, mission, quiz, saved progress | Detailed tasks 8–23 |
| 3 | **Pilot review** | You take the pilot as a student; we fix the lesson format and the engine before scaling | Detailed tasks 24–29 (done 2026-11-25) |
| 4 | **The other screens** | Home, course map (both paths), search, command index and settings work for real, as in the prototype | Detailed tasks 30–40 |
| 5 | **Core course** | Modules 0–5 (22 lessons) written and playable. The engine grows as lessons need it: branch graphs, merges, a local "origin" remote | Planned after phase 4, module by module |
| 6 | **Full course** | Modules 6–12 and the 3 capstones. GitHub lessons run on the student's own real GitHub account and repo (see Open questions) | Planned during phase 5 |
| 7 | **Release** | Installers for Windows, macOS and Linux built by GitHub Actions; auto-update; v1.0 published on GitHub | Planned before phase 6 ends |

## Architecture decisions for phases 1–2

1. **Scaffold with the official tools.** `create-tauri-app` (Svelte + TypeScript template), then switch SvelteKit to `adapter-static` with server rendering off, as Tauri's SvelteKit guide says. No hand-made project structure.
2. **Tokens are generated, not copied.** A small script turns `docs/design/tokens.json` into `app/src/lib/styles/tokens.css` (CSS variables for light and dark). Changing a color means editing `tokens.json` only.
3. **Fonts are bundled** from npm (`@fontsource/...`), so the app works offline.
4. **Lessons load at build time.** SvelteKit reads `content/` through Vite, so lessons ship inside the app and a broken lesson file fails the build, not the student.
5. **Rust owns the computer, Svelte owns the screen.** Every contract command and event from SPEC 3.3 gets a typed TypeScript wrapper in `app/src/lib/tauri/`, so screens never call Tauri by raw name.
6. **Riskiest piece first.** The real terminal (Rust PTY running Git Bash on Windows) is the least certain part, so it's built early in phase 2 (tasks 12–14), before the visualizer and missions depend on it.

## Dependencies to approve (SPEC "ask first")

Approving this plan approves these. Anything not listed is asked about separately.

| Where | Package | Why |
|---|---|---|
| Tools | pnpm, rustup (Rust), Microsoft C++ Build Tools | Required by Tauri and our package manager |
| App | `@tauri-apps/cli`, `@tauri-apps/api`, `@sveltejs/kit`, `@sveltejs/adapter-static`, `svelte`, `vite`, `typescript` | The stack |
| App | `tailwindcss` (+ `@tailwindcss/vite`), `shadcn-svelte` (with its `bits-ui` base and helpers `tailwind-variants`, `cn`, `tw-animate-css`) | Styling and accessible building blocks |
| App | `@fontsource/jetbrains-mono`, `@fontsource/source-serif-4`, `@fontsource/ibm-plex-sans` | Bundled fonts |
| App | `@xterm/xterm`, `@xterm/addon-fit` | The terminal on screen |
| App | `@xyflow/svelte` (Svelte Flow), `elkjs` | The history map in the visualizer |
| App | `yaml`, `marked` | Reading missions, quizzes and lesson Markdown |
| App | `@tauri-apps/plugin-store` | Saving progress |
| Dev | `vitest`, `eslint`, `prettier`, `svelte-check`, their Svelte/TypeScript/Tailwind plugins | Tests and code checks |
| Dev | `playwright`, `@vitest/browser-playwright`, `vitest-browser-svelte` (approved 2026-11-25) | Component tests in a real headless Chromium, close to the app's own web view; needed for terminal and keyboard tests |
| Rust | `tauri`, `serde`, `serde_json`, `portable-pty`, `notify`, `notify-debouncer-mini`, `tempfile` (tests only) | Core, terminal, folder watching |
| App + Rust | `@tauri-apps/plugin-opener`, `tauri-plugin-opener` (approved 2026-11-25) | Open the Pro Git link in the system browser |

## Task list

Full details for each task (acceptance criteria, verification, files) are in `tasks/todo.md`.

### Phase 1: Foundation
- [x] Task 1: Install the missing tools on your PC
- [x] Task 2: Create the Tauri + SvelteKit app skeleton
- [x] Task 3: Set up tests and code checks
- [x] Task 4: Turn the design tokens into CSS, with fonts and themes
- [x] Task 5: Set up Tailwind and shadcn-svelte on top of the tokens
- [x] Task 6: Build the app shell: top bar, sidebar, empty pages
- [x] Task 7: Add the typed bridge between screens and Rust

### Checkpoint A: Foundation
- [x] `pnpm tauri dev` opens the app; navigation works; light and dark themes switch
- [x] All tests, type checks and lints pass
- [x] You review the code structure

### Phase 2: Pilot lesson
- [x] Task 8: Define the lesson content types and the content loader
- [x] Task 9: Write the pilot lesson content (approved 2026-11-25)
- [x] Task 10: Show the pilot lesson on its page
- [x] Task 11: Show the lesson's special blocks
- [x] Task 12: Create and reset practice folders (Rust)
- [x] Task 13: Run a real shell session (Rust)
- [x] Task 14: Show the terminal on screen

**Phase 2 status (2026-11-25):** tasks 8–23 built, tested and pushed. Waiting on you: Checkpoint B, approving the pilot text (task 9), and the desktop-app checks marked "(you…)" in todo.md.

### Checkpoint B: Real terminal
- [x] Typing in the app's terminal runs real Git in the pilot's practice folder, on your Windows PC with Git Bash (student driver, 2026-11-25)

- [x] Task 15: Read the repo state into a snapshot (Rust)
- [x] Task 16: Watch the repo and send live updates
- [x] Task 17: Draw the three areas and the live caption
- [x] Task 18: Draw the history map
- [x] Task 19: Run the mission: setup, goal checks, hints, reset
- [x] Task 20: Show the quiz and explain answers
- [x] Task 21: Save progress between sessions
- [x] Task 22: Test every mission against real Git
- [x] Task 23: Prove a new lesson needs content files only

### Checkpoint C: Pilot complete (SPEC success criteria 2–8)
- [x] The pilot lesson works end to end on Windows (student driver, `docs/reviews/pilot-review.md`)
- [x] Visualizer updates within 300 ms of a Git command (234 ms median, `docs/measurements.md`)
- [x] A second sample lesson works by adding content files only (ignoring-files, 2026-11-25)
- [x] Memory use measured with the pilot open (233 MB private)
- [x] All tests pass → Phase 3, pilot review

### Phase 3: Pilot review
- [x] Task 24: Open the Pro Git link in the system browser
- [x] Task 25: A driver that plays the app like a student
- [x] Task 26: Measure the visualizer delay and memory use
- [x] Task 27: Play the pilot as a student and fix what breaks
- [x] Task 28: Settle the content format
- [x] Task 29: Plan phase 4
- [x] Review round 2: your notes from the walkthrough (terminal size, paste, text size, desk, mission and quiz headings, map zoom and labels, softer highlight)

**Phase 3 status (2026-11-25):** built, tested and pushed. The driver played the pilot in the desktop app; 9 findings, 7 fixed (see `docs/reviews/pilot-review.md`). Waiting on you: your own run-through as a student, the terminal-height question, and the search proposal for phase 4.

### Checkpoint D: Pilot reviewed
- [x] Measurements within SPEC targets
- [x] Review findings fixed or listed
- [ ] You review phases 2 and 3 together and take the pilot yourself

### Phase 4: The other screens
- [ ] Task 30: A segmented switch component
- [ ] Task 31: The Book path file and lesson facts
- [ ] Task 32: Remember where the student is
- [ ] Task 33: Home screen
- [ ] Task 34: Course map screen
- [ ] Task 35: Command and glossary content
- [ ] Task 36: Command index screen
- [ ] Task 37: Search, with a Ctrl K quick search panel (in-memory index, approved)
- [ ] Task 38: Settings screen, complete
- [ ] Task 39: Sidebar with path progress
- [ ] Task 40: Small-window lesson
- [ ] Task 41: Resizable lesson panels
- [ ] Task 42: A history map that grows with the course
- [ ] Task 43: Links between lessons, with hover cards
- [ ] Task 44: Challenges instead of one mission (3+ per lesson, easy to hard)

### Checkpoint E: The other screens
- [ ] Every prototype screen works with real content and progress; search finds lessons by title and command; you review in the desktop app

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Terminal (PTY) misbehaves on Windows with Git Bash | High | Built early (tasks 13–14) with a checkpoint right after; fallback is PowerShell while we fix it |
| Watching `.git` misses or floods changes | Medium | Debounce ~100 ms, plus a manual "refresh" from the snapshot command; tested against real Git |
| Svelte 5 / Tauri 2 changed recently, old examples mislead | Medium | The official Svelte skills, Context7 docs lookup and `source-driven-development` before each new API |
| Learning Rust slows the Rust tasks | Medium | Rust tasks are small and explained line by line; the Rust skills help keep it idiomatic |
| Lesson format turns out wrong | Medium | Phase 3 review before writing more lessons |
| Students without Git installed | Low for now | Handling decided later (SPEC out of scope); the setup lesson teaches installing Git |

## Open questions

1. ~~GitHub lessons~~ **Decided (direction):** the student connects their own real GitHub account and repo to the app, and the GitHub lessons run on that real repo. Designed in detail when phase 6 starts.
2. ~~Publishing the repo~~ **Decided:** public repo `gitremastered` on GitHub. CI is added in task 3, once there are checks to run.
3. ~~`.mcp.json`~~ **Decided:** committed, so forks get the Context7 docs tool.
