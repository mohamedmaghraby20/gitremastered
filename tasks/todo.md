# Tasks: Phases 1 and 2

Plan: `tasks/plan.md` · Spec: `SPEC.md` · Design: `DESIGN.md` · Rules: `CLAUDE.md`

Every task: test first where there is logic; all of `pnpm test`, `pnpm check`, `pnpm lint` and the Rust checks pass; one commit; you read the code before the next task. Sizes: XS 1 file · S 1–2 · M 3–5.

---

## Phase 1: Foundation

### Task 1: Install the missing tools on your PC
**Description:** Install pnpm, Rust (via rustup, MSVC toolchain) and the Microsoft C++ Build Tools, plus the two language servers for the LSP plugins. Write a short setup guide so any contributor can do the same.

**Acceptance criteria:**
- [x] `pnpm --version`, `rustc --version`, `cargo --version` print versions
- [x] `rustup component list --installed` includes `rust-analyzer`, `clippy`, `rustfmt`
- [x] `docs/setup.md` lists every install command for Windows, macOS and Linux

**Verification:**
- [x] Manual: run the version commands in a new terminal (also built and ran a test Rust program)

**Result (2026-11-25):** pnpm 12.23.0 · rustc/cargo 1.100.0 (stable-msvc) · VS Build Tools 2022 (C++) · Node 24.19.0 · Git 2.55.0 · typescript-language-server 6.1.0

**Dependencies:** None · **Files:** `docs/setup.md` · **Scope:** XS

### Task 2: Create the Tauri + SvelteKit app skeleton
**Description:** Scaffold `app/` with the official `create-tauri-app` (Svelte + TypeScript), switch SvelteKit to `adapter-static` with server rendering off, and set the window: title "GitRemastered", 1440×900, minimum 1024×700.

**Acceptance criteria:**
- [x] `pnpm tauri dev` (from `app/`) opens a desktop window titled GitRemastered
- [x] SvelteKit builds as static files (`pnpm build` succeeds)
- [x] Template demo code removed; `app/README.md` says how to run it

**Verification:**
- [x] Build: `pnpm build` and `cargo build --manifest-path src-tauri/Cargo.toml`
- [x] Manual: the window opens

**Result (2026-11-25):** create-tauri-app 4.7.5 (svelte-ts) · Tauri CLI 2.12.6 · SvelteKit 2.70 · Svelte 5.59 · Vite 8.3. Window opens titled GitRemastered. On a 1536×816 (scaled) screen Windows shrinks it to fit (~1213×724), still above the 1024×700 minimum. Removed the demo greet command and the unused opener plugin.

**Dependencies:** 1 · **Files:** `app/package.json`, `app/svelte.config.js`, `app/src/routes/+layout.ts`, `app/src-tauri/tauri.conf.json`, `app/README.md` · **Scope:** M

### Task 3: Set up tests and code checks
**Description:** Add Vitest, ESLint, Prettier and svelte-check for TypeScript/Svelte, and rustfmt + Clippy for Rust, with the commands from SPEC §6. Prove each with one tiny real test in TypeScript and in Rust. Add a GitHub Actions workflow that runs the same checks on every push and pull request.

**Acceptance criteria:**
- [ ] `pnpm test`, `pnpm check`, `pnpm lint`, `pnpm format` all work
- [ ] `cargo test`, `cargo clippy -- -D warnings`, `cargo fmt --check` all pass
- [ ] The CI workflow runs them on GitHub and goes green

**Verification:**
- [ ] Tests pass: all commands above, locally and on GitHub Actions

**Dependencies:** 2 · **Files:** `app/package.json`, `app/vitest.config.ts`, `app/eslint.config.js`, `app/.prettierrc`, `.github/workflows/ci.yml` · **Scope:** M

### Task 4: Turn the design tokens into CSS, with fonts and themes
**Description:** A small script reads `docs/design/tokens.json` and writes `app/src/lib/styles/tokens.css` (light values, dark overrides under `[data-theme="dark"]`, and a system-preference fallback). Bundle the three fonts. A theme helper sets light, dark or system.

**Acceptance criteria:**
- [ ] Every color, spacing, radius, shadow and duration token becomes a CSS variable; the generated file says not to edit it by hand
- [ ] Fonts load offline (no network)
- [ ] Switching the theme changes every token in one step

**Verification:**
- [ ] Tests pass: unit tests for the generator (light value, dark override, token count)
- [ ] Manual: a developer gallery page (`/dev/gallery`) shows the colors and type styles in both themes

**Dependencies:** 3 · **Files:** `app/scripts/build-tokens.ts`, `app/scripts/build-tokens.test.ts`, `app/src/lib/styles/tokens.css` (generated), `app/src/lib/theme/theme.ts`, `app/src/routes/dev/gallery/+page.svelte` · **Scope:** M

### Task 5: Set up Tailwind and shadcn-svelte on top of the tokens
**Description:** Add Tailwind and shadcn-svelte with their theme mapped to our CSS variables (no hard-coded colors). Build the first real component: the keycap Button (primary, secondary, ghost) from `DESIGN.md`, shown in the gallery.

**Acceptance criteria:**
- [ ] Tailwind classes use our tokens (e.g. `bg-primary` = `var(--primary)`)
- [ ] Button has the three variants, the 3px keycap edge, the press-down and the focus ring
- [ ] Gallery shows the buttons in both themes

**Verification:**
- [ ] Tests pass: Button renders the right variant and is a real `<button>`
- [ ] Manual: compare with the design system's Button preview

**Dependencies:** 4 · **Files:** `app/src/app.css`, `app/components.json`, `app/src/lib/components/ui/button/Button.svelte`, `app/src/lib/components/ui/button/Button.test.ts` · **Scope:** M

### Task 6: Build the app shell: top bar, sidebar, empty pages
**Description:** The layout from the prototype: top bar (wordmark, search box, Settings) and sidebar (full and icon-rail versions), with empty pages for home, course map, lesson, search, commands and settings, all linked.

**Acceptance criteria:**
- [ ] Every sidebar and top-bar link opens its page; the active one is marked
- [ ] The lesson page uses the icon rail; other pages use the full sidebar
- [ ] Settings has a working theme switch (light / dark / system)

**Verification:**
- [ ] Tests pass: Sidebar marks the active link; rail has labels for screen readers
- [ ] Manual: click through every page in `pnpm tauri dev`

**Dependencies:** 5 · **Files:** `app/src/routes/+layout.svelte`, `app/src/lib/components/app-shell/TopBar.svelte`, `app/src/lib/components/app-shell/Sidebar.svelte`, `app/src/lib/components/app-shell/Sidebar.test.ts`, page files under `app/src/routes/` · **Scope:** M (page stubs are one line each)

### Task 7: Add the typed bridge between screens and Rust
**Description:** Write the shared data shapes from SPEC §3.4 in TypeScript and Rust, typed wrappers for every contract command and event, and one real command end to end: `get_git_version`, shown on the Settings page.

**Acceptance criteria:**
- [ ] `RepoSnapshot` and related types exist in `app/src/lib/types/` and `app/src-tauri/src/models/`
- [ ] Screens call Rust only through `app/src/lib/tauri/` wrappers
- [ ] Settings shows "git version 2.x" from the real Git

**Verification:**
- [ ] Tests pass: Rust test for parsing `git --version`; TS test for the wrapper with a mock
- [ ] Manual: Settings shows your Git version

**Dependencies:** 6 · **Files:** `app/src/lib/types/repo-snapshot.ts`, `app/src/lib/tauri/commands.ts`, `app/src-tauri/src/models/repo_snapshot.rs`, `app/src-tauri/src/commands/git_info.rs`, `app/src-tauri/src/main.rs` · **Scope:** M

## Checkpoint A: Foundation
- [ ] App opens; navigation works; themes switch; Git version shows
- [ ] All tests, type checks and lints pass
- [ ] You review the code structure before phase 2

---

## Phase 2: Pilot lesson ("Status, stage, commit")

### Task 8: Define the lesson content types and the content loader
**Description:** Types for lesson, mission, quiz and path (SPEC §4). A loader reads `content/` at build time, splits `lesson.md` into its sections (Use it, How it works, Pro, Recap), parses the YAML, and rejects broken files with a clear message naming the file and problem.

**Acceptance criteria:**
- [ ] A valid fixture lesson loads into typed objects
- [ ] A missing field or bad YAML fails the build with a readable error
- [ ] Lessons are looked up by ID

**Verification:**
- [ ] Tests pass: valid fixture, missing section, bad YAML, unknown ID

**Dependencies:** 7 · **Files:** `app/src/lib/types/lesson.ts`, `app/src/lib/content/load-lessons.ts`, `app/src/lib/content/parse-lesson.ts`, `app/src/lib/content/parse-lesson.test.ts`, `app/tests/fixtures/sample-lesson/` · **Scope:** M

### Task 9: Write the pilot lesson content
**Description:** Write `content/lessons/three-areas/` from Pro Git 2.2 in our style: lede, short sections for all three layers, recap, the mission (setup, goal checks, three hints, solution) and a 3-question quiz. Cite the book; humanizer pass; mission steps as numbered lists.

**Acceptance criteria:**
- [ ] The loader accepts all three files
- [ ] Every claim matches Pro Git 2.2 or the official docs (new-vs-old note for `git restore`)
- [ ] Reading time for "Use it" is about 5 minutes

**Verification:**
- [ ] Tests pass: loader test over the real pilot files
- [ ] Manual: you read the lesson text and approve it

**Dependencies:** 8 · **Files:** `content/lessons/three-areas/lesson.md`, `mission.yaml`, `quiz.yaml`, `content/paths/pro-path.yaml` · **Scope:** S

### Task 10: Show the pilot lesson on its page
**Description:** `/lessons/[lessonId]` shows the eyebrow, title, layer tabs and each layer's text, with a book citation link and previous/next links, matching the prototype's lesson column.

**Acceptance criteria:**
- [ ] `/lessons/three-areas` shows the pilot; the three tabs switch layers
- [ ] An unknown lesson ID shows a friendly "lesson not found" page
- [ ] Text uses the serif reading styles, max 64 characters wide

**Verification:**
- [ ] Tests pass: tabs switch; unknown ID handled
- [ ] Manual: compare with the prototype's Lesson screen

**Dependencies:** 9 · **Files:** `app/src/routes/lessons/[lessonId]/+page.ts`, `+page.svelte`, `app/src/lib/components/lesson-reader/LessonHeader.svelte`, `LayerTabs.svelte`, `LayerTabs.test.ts` · **Scope:** M

### Task 11: Show the lesson's special blocks
**Description:** The blocks from DESIGN.md inside lesson text: definition rows (with area swatches), "Try it" steps, "Use today / In the book" comparison, sidenotes, careful notes and the recap card.

**Acceptance criteria:**
- [ ] Each block is its own small component, written in Markdown by lesson authors with a simple marker
- [ ] The pilot shows each block correctly
- [ ] Blocks read well in both themes

**Verification:**
- [ ] Tests pass: Markdown marker → right component, for each block
- [ ] Manual: gallery shows every block

**Dependencies:** 10 · **Files:** `app/src/lib/components/lesson-reader/` (one file per block), `app/src/lib/content/render-blocks.ts`, `render-blocks.test.ts` · **Scope:** M

### Task 12: Create and reset practice folders (Rust)
**Description:** `create_practice_repo` and `reset_practice_repo`: make `<app data>/practice/<missionId>/`, run the mission's setup steps with real Git inside it, and delete-and-rebuild on reset. The app's own commands never run outside a practice folder.

**Acceptance criteria:**
- [ ] Setup steps produce the expected repo in a temporary folder
- [ ] Reset gives a fresh copy
- [ ] A path outside the practice root is refused with an error

**Verification:**
- [ ] Tests pass: Rust integration tests with real Git in temp folders

**Dependencies:** 7 · **Files:** `app/src-tauri/src/git_runner/practice_folder.rs`, `app/src-tauri/src/git_runner/setup_steps.rs`, `app/src-tauri/src/commands/practice.rs`, `app/src-tauri/tests/practice_folder.rs` · **Scope:** M

### Task 13: Run a real shell session (Rust)
**Description:** `start_terminal_session`, `send_terminal_input`, `resize_terminal` and the `terminal_output` / `terminal_exited` events, using `portable-pty`. Git Bash on Windows, the user's shell on macOS and Linux, started inside the practice folder.

**Acceptance criteria:**
- [ ] A session starts in the given folder and echoes typed commands
- [ ] Output arrives as events, in order
- [ ] Closing the session cleans up the shell process

**Verification:**
- [ ] Tests pass: Rust test runs `git --version` through a session and reads the output
- [ ] Manual: works on your Windows PC with Git Bash

**Dependencies:** 12 · **Files:** `app/src-tauri/src/git_runner/terminal_session.rs`, `app/src-tauri/src/git_runner/shell_choice.rs`, `app/src-tauri/src/commands/terminal.rs` · **Scope:** M

### Task 14: Show the terminal on screen
**Description:** The retro terminal window from DESIGN.md (title bar with folder, warm screen, glowing prompt) using xterm.js, wired to the session through the typed bridge, resizing with its pane.

**Acceptance criteria:**
- [ ] Typing in the app's terminal runs commands in the practice folder
- [ ] Colors and fonts come from the terminal tokens
- [ ] Esc moves focus out of the terminal

**Verification:**
- [ ] Tests pass: component sends input and renders output (mocked bridge)
- [ ] Manual: run `git status` in the pilot

**Dependencies:** 13 · **Files:** `app/src/lib/components/terminal-view/TerminalWindow.svelte`, `TerminalView.svelte`, `terminal-theme.ts`, `TerminalView.test.ts` · **Scope:** M

## Checkpoint B: Real terminal
- [ ] On your Windows PC, the pilot's terminal runs real Git in its practice folder
- [ ] You review the Rust core code

### Task 15: Read the repo state into a snapshot (Rust)
**Description:** `get_repo_snapshot` runs read-only Git commands (`status --porcelain=v2`, `log`, `for-each-ref`) and builds a `RepoSnapshot`: commits with parents, branches, tags, HEAD, staged, modified and untracked files.

**Acceptance criteria:**
- [ ] Correct snapshot for: empty repo, one untracked file, one staged file, two commits
- [ ] Parsing is split into small functions, one per Git output
- [ ] Never writes to the repo

**Verification:**
- [ ] Tests pass: Rust tests for each case with real Git; parser unit tests with sample output

**Dependencies:** 12 · **Files:** `app/src-tauri/src/repo_inspector/snapshot.rs`, `parse_status.rs`, `parse_log.rs`, `app/src-tauri/tests/snapshot.rs` · **Scope:** M

### Task 16: Watch the repo and send live updates
**Description:** Watch the practice folder's `.git` (debounced ~100 ms), rebuild the snapshot and emit `repo_changed`. On the screen side, put each snapshot into the `currentRepoSnapshot` store.

**Acceptance criteria:**
- [ ] `git add` and `git commit` each produce one `repo_changed` with the new state
- [ ] A burst of changes produces one update, not many
- [ ] The store holds the latest snapshot

**Verification:**
- [ ] Tests pass: Rust test triggers Git changes and counts events; TS store test

**Dependencies:** 15 · **Files:** `app/src-tauri/src/repo_inspector/watcher.rs`, `app/src/lib/stores/repo-snapshot.ts`, `repo-snapshot.test.ts` · **Scope:** S

### Task 17: Draw the three areas and the live caption
**Description:** The visualizer's desk: working folder (draft), staging area (highlighted), repository (inked), with files as paper sheets and the moving command between zones; plus the caption bar explaining the last command in one sentence.

**Acceptance criteria:**
- [ ] Files appear in the right zone for every snapshot case from task 15
- [ ] The last-moved file gets the brief outline; motion respects reduce motion
- [ ] Captions exist for `status`, `add`, `commit`, `restore` (pilot commands)

**Verification:**
- [ ] Tests pass: snapshot → zones; command → caption text
- [ ] Manual: run the pilot commands and watch the desk

**Dependencies:** 16 · **Files:** `app/src/lib/components/visualizer/AreaDesk.svelte`, `FileSheet.svelte`, `CaptionBar.svelte`, `app/src/lib/visualizer/explain-command.ts`, `explain-command.test.ts` · **Scope:** M

### Task 18: Draw the history map
**Description:** The metro-map history with Svelte Flow and ELK: commits as stations, branch lines, the HEAD pin, the faded "next commit" station.

**Acceptance criteria:**
- [ ] Linear history draws newest on the right with IDs and messages
- [ ] HEAD and the branch label sit on the right station
- [ ] Layout logic is a separate tested function

**Verification:**
- [ ] Tests pass: snapshot → nodes and edges
- [ ] Manual: commit twice in the pilot and watch the map grow

**Dependencies:** 16 · **Files:** `app/src/lib/components/visualizer/HistoryMap.svelte`, `CommitStation.svelte`, `app/src/lib/visualizer/history-layout.ts`, `history-layout.test.ts` · **Scope:** M

### Task 19: Run the mission: setup, goal checks, hints, reset
**Description:** Opening the lesson sets up its practice repo; the mission panel's checklist ticks itself from the snapshot; "Check mission", "Reset practice" and the hint ladder work.

**Acceptance criteria:**
- [ ] Goals tick as soon as they are met
- [ ] Hints reveal one at a time; reset rebuilds the repo and clears the checklist
- [ ] Goal checking is pure functions with no screen code

**Verification:**
- [ ] Tests pass: each goal check type against sample snapshots; hint ladder state
- [ ] Manual: complete the pilot mission

**Dependencies:** 14, 17 · **Files:** `app/src/lib/mission-engine/goal-checker.ts`, `goal-checker.test.ts`, `mission-session.ts`, `app/src/lib/components/mission-panel/MissionPanel.svelte`, `GoalRow.svelte` · **Scope:** M

### Task 20: Show the quiz and explain answers
**Description:** The quiz from DESIGN.md: scenario questions, lettered keycap answers, check, and the explanation for right and wrong picks.

**Acceptance criteria:**
- [ ] Answers are selectable by mouse and keyboard (A–D)
- [ ] Checking marks right and wrong with icons, not color alone, and shows the explanation
- [ ] Scoring is a pure tested function

**Verification:**
- [ ] Tests pass: scoring; keyboard selection

**Dependencies:** 10 · **Files:** `app/src/lib/components/quiz/Quiz.svelte`, `QuizOption.svelte`, `app/src/lib/quiz/score-quiz.ts`, `score-quiz.test.ts` · **Scope:** M

### Task 21: Save progress between sessions
**Description:** Using the Tauri store plugin, save finished missions, quiz results and the chosen theme; show the pilot as done in the sidebar.

**Acceptance criteria:**
- [ ] Progress and theme survive an app restart
- [ ] "Reset progress" in Settings clears it after confirmation
- [ ] Storage access goes through one small module

**Verification:**
- [ ] Tests pass: progress module with a mocked store
- [ ] Manual: finish the pilot, restart, see it marked done

**Dependencies:** 19, 20 · **Files:** `app/src/lib/stores/progress.ts`, `progress.test.ts`, `app/src-tauri/src/main.rs` (plugin), `app/src/routes/settings/+page.svelte` · **Scope:** M

### Task 22: Test every mission against real Git
**Description:** `pnpm test:missions` takes every lesson's mission, runs its setup and reference solution with real Git in a temporary folder, takes a snapshot and confirms every goal is met.

**Acceptance criteria:**
- [ ] The pilot mission passes
- [ ] A deliberately wrong solution fails with the goal it missed
- [ ] Runs in under a minute

**Verification:**
- [ ] Tests pass: `pnpm test:missions`

**Dependencies:** 19 · **Files:** `app/tests/missions/run-missions.test.ts`, `app/tests/missions/mission-runner.ts`, `app/package.json` · **Scope:** S

### Task 23: Prove a new lesson needs content files only
**Description:** Add a short second lesson (`ignoring-files`, Pro Git 2.2 "Ignoring Files") with no app code changes, to prove SPEC success criterion 8.

**Acceptance criteria:**
- [ ] The lesson appears, its mission and quiz work
- [ ] `git diff` shows changes only under `content/`
- [ ] Its mission passes `pnpm test:missions`

**Verification:**
- [ ] Tests pass: loader and mission tests
- [ ] Manual: open the lesson from the pilot's "next" link

**Dependencies:** 22 · **Files:** `content/lessons/ignoring-files/` (3 files), `content/paths/pro-path.yaml` · **Scope:** S

## Checkpoint C: Pilot complete
- [ ] SPEC success criteria 2–8 hold on Windows
- [ ] Visualizer updates within 300 ms of a Git command (measured)
- [ ] Memory use with the pilot open measured and written down
- [ ] All tests pass → Phase 3: you take the pilot as a student
