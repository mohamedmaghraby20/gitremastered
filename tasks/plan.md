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
| 3 | **Pilot review** | You take the pilot as a student; we fix the lesson format and the engine before scaling | Checkpoint |
| 4 | **The other screens** | Home, course map (both paths), search, command index and settings work for real, as in the prototype | Planned after phase 3 |
| 5 | **Core course** | Modules 0–5 (22 lessons) written and playable. The engine grows as lessons need it: branch graphs, merges, a local "origin" remote | Planned after phase 4, module by module |
| 6 | **Full course** | Modules 6–12 and the 3 capstones. GitHub lessons need a simulated GitHub (see Open questions) | Planned during phase 5 |
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
| App | `tailwindcss`, `shadcn-svelte` (with its `bits-ui` base) | Styling and accessible building blocks |
| App | `@fontsource/jetbrains-mono`, `@fontsource/source-serif-4`, `@fontsource/ibm-plex-sans` | Bundled fonts |
| App | `@xterm/xterm`, `@xterm/addon-fit` | The terminal on screen |
| App | `@xyflow/svelte` (Svelte Flow), `elkjs` | The history map in the visualizer |
| App | `yaml`, `marked` | Reading missions, quizzes and lesson Markdown |
| App | `@tauri-apps/plugin-store` | Saving progress |
| Dev | `vitest`, `eslint`, `prettier`, `svelte-check`, their Svelte/TypeScript plugins | Tests and code checks |
| Rust | `tauri`, `serde`, `serde_json`, `portable-pty`, `notify`, `notify-debouncer-mini`, `tempfile` (tests only) | Core, terminal, folder watching |

## Task list

Full details for each task (acceptance criteria, verification, files) are in `tasks/todo.md`.

### Phase 1: Foundation
- [x] Task 1: Install the missing tools on your PC
- [x] Task 2: Create the Tauri + SvelteKit app skeleton
- [ ] Task 3: Set up tests and code checks
- [ ] Task 4: Turn the design tokens into CSS, with fonts and themes
- [ ] Task 5: Set up Tailwind and shadcn-svelte on top of the tokens
- [ ] Task 6: Build the app shell: top bar, sidebar, empty pages
- [ ] Task 7: Add the typed bridge between screens and Rust

### Checkpoint A: Foundation
- [ ] `pnpm tauri dev` opens the app; navigation works; light and dark themes switch
- [ ] All tests, type checks and lints pass
- [ ] You review the code structure

### Phase 2: Pilot lesson
- [ ] Task 8: Define the lesson content types and the content loader
- [ ] Task 9: Write the pilot lesson content
- [ ] Task 10: Show the pilot lesson on its page
- [ ] Task 11: Show the lesson's special blocks
- [ ] Task 12: Create and reset practice folders (Rust)
- [ ] Task 13: Run a real shell session (Rust)
- [ ] Task 14: Show the terminal on screen

### Checkpoint B: Real terminal
- [ ] Typing in the app's terminal runs real Git in the pilot's practice folder, on your Windows PC with Git Bash

- [ ] Task 15: Read the repo state into a snapshot (Rust)
- [ ] Task 16: Watch the repo and send live updates
- [ ] Task 17: Draw the three areas and the live caption
- [ ] Task 18: Draw the history map
- [ ] Task 19: Run the mission: setup, goal checks, hints, reset
- [ ] Task 20: Show the quiz and explain answers
- [ ] Task 21: Save progress between sessions
- [ ] Task 22: Test every mission against real Git
- [ ] Task 23: Prove a new lesson needs content files only

### Checkpoint C: Pilot complete (SPEC success criteria 2–8)
- [ ] The pilot lesson works end to end on Windows
- [ ] Visualizer updates within 300 ms of a Git command
- [ ] A second sample lesson works by adding content files only
- [ ] Memory use measured with the pilot open
- [ ] All tests pass → Phase 3, pilot review with you

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
