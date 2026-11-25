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
- [x] `pnpm test`, `pnpm check`, `pnpm lint`, `pnpm format` all work
- [x] `cargo test`, `cargo clippy -- -D warnings`, `cargo fmt --check` all pass
- [x] The CI workflow runs them on GitHub and goes green (first run 2026-11-25)

**Verification:**
- [x] Tests pass: all commands above, locally and on GitHub Actions

**Result (2026-11-25):** Added with the official Svelte CLI (`sv add prettier eslint vitest`). Vitest 5 in two groups: logic tests in Node, component tests (`*.svelte.test.ts`) in headless Chromium via Playwright. First tests: `page-title.test.ts`, the home page component test, and two Rust tests guarding the window settings. CI on ubuntu-latest.

**Dependencies:** 2 · **Files:** `app/package.json`, `app/vitest.config.ts`, `app/eslint.config.js`, `app/prettier.config.js`, `.github/workflows/ci.yml` · **Scope:** M

### Task 4: Turn the design tokens into CSS, with fonts and themes
**Description:** A small script reads `docs/design/tokens.json` and writes `app/src/lib/styles/tokens.css` (light values, dark overrides under `[data-theme="dark"]`, and a system-preference fallback). Bundle the three fonts. A theme helper sets light, dark or system.

**Acceptance criteria:**
- [x] Every color, spacing, radius, shadow and duration token becomes a CSS variable; the generated file says not to edit it by hand
- [x] Fonts load offline (no network)
- [x] Switching the theme changes every token in one step

**Verification:**
- [x] Tests pass: unit tests for the generator (light value, dark override, token count)
- [x] Manual: a developer gallery page (`/dev/gallery`) shows the colors and type styles in both themes

**Result (2026-11-25):** `pnpm tokens` writes 50 token variables + type-style variables and one `.type-*` class per text style; dark overrides, a system-dark fallback and a reduce-motion block. A test fails if tokens.css drifts from tokens.json. Fonts: Latin subsets only, 7 files, 0 network requests. Gallery checked in the browser: both themes side by side, switch works.

**Dependencies:** 3 · **Files:** `app/scripts/build-tokens.ts`, `app/scripts/design-tokens.ts`, `app/scripts/design-tokens.test.ts`, `app/src/lib/types/design-tokens.ts`, `app/src/lib/styles/fonts.css`, `app/src/lib/styles/tokens.css` (generated), `app/src/lib/theme/theme.ts`, `theme.test.ts`, `app/src/lib/components/dev-gallery/`, `app/src/routes/dev/gallery/+page.svelte` · **Scope:** M

### Task 5: Set up Tailwind and shadcn-svelte on top of the tokens
**Description:** Add Tailwind and shadcn-svelte with their theme mapped to our CSS variables (no hard-coded colors). Build the first real component: the keycap Button (primary, secondary, ghost) from `DESIGN.md`, shown in the gallery.

**Acceptance criteria:**
- [x] Tailwind classes use our tokens (e.g. `bg-primary` = `var(--primary)`)
- [x] Button has the three variants, the 3px keycap edge, the press-down and the focus ring
- [x] Gallery shows the buttons in both themes

**Verification:**
- [x] Tests pass: Button renders the right variant and is a real `<button>`
- [x] Manual: compare with the design system's Button preview

**Result (2026-11-25):** Tailwind 4 via `sv add`; shadcn-svelte set up by its manual steps (its `init` only offers themes we replace anyway). Tailwind's own palette, fonts, radii and shadows are switched off, so only token classes exist. Button files follow shadcn-svelte's lowercase layout; variants live in `button-variants.ts` so ESLint can read their types. Checked against the design system's Button preview.

**Dependencies:** 4 · **Files:** `app/src/app.css`, `app/components.json`, `app/src/lib/utils.ts`, `app/src/lib/components/ui/button/` (`button.svelte`, `button-variants.ts`, `index.ts`, `button.svelte.test.ts`) · **Scope:** M

### Task 6: Build the app shell: top bar, sidebar, empty pages
**Description:** The layout from the prototype: top bar (wordmark, search box, Settings) and sidebar (full and icon-rail versions), with empty pages for home, course map, lesson, search, commands and settings, all linked.

**Acceptance criteria:**
- [x] Every sidebar and top-bar link opens its page; the active one is marked
- [x] The lesson page uses the icon rail; other pages use the full sidebar
- [x] Settings has a working theme switch (light / dark / system)

**Verification:**
- [x] Tests pass: Sidebar marks the active link; rail has labels for screen readers
- [x] Manual: click through every page (browser pane; scripted click-through of all 8 links + Ctrl K)

**Result (2026-11-25):** Shell matches the prototype: 48px top bar, 248px sidebar, 64px rail on `/lessons/*`. Links use SvelteKit `resolve()`, so a wrong route is a type error. Ctrl K / Cmd K opens Search. Theme switch is a reusable `SegmentedSwitch` (also for Pro/Book path later). The sidebar shows the pilot lesson until content loading (task 8) lists the real module lessons; path progress waits for task 21.

**Dependencies:** 5 · **Files:** `app/src/lib/navigation/` (links + shortcuts, with tests), `app/src/lib/components/app-shell/` (`TopBar`, `Sidebar`, `SidebarFull`, `SidebarRail`, `NavigationIcon`, `EmptyPage`), `app/src/lib/components/ui/segmented-switch/`, `app/src/routes/+layout.svelte`, `app/src/lib/components/app-shell/TopBar.svelte`, `app/src/lib/components/app-shell/Sidebar.svelte`, `app/src/lib/components/app-shell/Sidebar.svelte.test.ts`, page files under `app/src/routes/` · **Scope:** M (page stubs are one line each)

### Task 7: Add the typed bridge between screens and Rust
**Description:** Write the shared data shapes from SPEC §3.4 in TypeScript and Rust, typed wrappers for every contract command and event, and one real command end to end: `get_git_version`, shown on the Settings page.

**Acceptance criteria:**
- [x] `RepoSnapshot` and related types exist in `app/src/lib/types/` and `app/src-tauri/src/models/`
- [x] Screens call Rust only through `app/src/lib/tauri/` wrappers
- [x] Settings shows "git version 2.x" from the real Git

**Verification:**
- [x] Tests pass: Rust test for parsing `git --version`; TS test for the wrapper with a mock
- [x] Manual: Settings shows your Git version (checked at Checkpoint A)

**Result (2026-11-25):** SPEC 3.4 only names Commit, Branch, Tag, HeadState and FileChange; their fields were filled in minimally (see `repo-snapshot.ts`) and were approved on 2026-11-25 and are now written into SPEC §3.4. A Rust test checks the JSON names match the TypeScript ones. Wrappers exist for every contract command and event; only `get_git_version` has its Rust side so far. Commands are registered in `lib.rs` (Tauri 2 puts them there; `main.rs` only calls it). Git runs with no console window on Windows.

**Dependencies:** 6 · **Files:** `app/src/lib/types/repo-snapshot.ts`, `app/src/lib/tauri/commands.ts`, `commands.test.ts`, `events.ts`, `app/src-tauri/src/models/repo_snapshot.rs`, `app/src-tauri/src/commands/git_info.rs`, `app/src-tauri/src/lib.rs`, `app/src/lib/components/settings/GitVersionStatus.svelte` · **Scope:** M

## Checkpoint A: Foundation
- [x] App opens; navigation works; themes switch; Git version shows
- [x] All tests, type checks and lints pass
- [x] You review the code structure before phase 2 (approved 2026-11-25)

---

## Phase 2: Pilot lesson ("Status, stage, commit")

### Task 8: Define the lesson content types and the content loader
**Description:** Types for lesson, mission, quiz and path (SPEC §4). A loader reads `content/` at build time, splits `lesson.md` into its sections (Use it, How it works, Pro, Recap), parses the YAML, and rejects broken files with a clear message naming the file and problem.

**Acceptance criteria:**
- [x] A valid fixture lesson loads into typed objects
- [x] A missing field or bad YAML fails the build with a readable error
- [x] Lessons are looked up by ID

**Verification:**
- [x] Tests pass: valid fixture, missing section, bad YAML, unknown ID

**Result (2026-11-25):** Types in `lesson.ts`, `mission.ts`, `quiz.ts`, `learning-path.ts`. One parser per file kind (`parse-lesson.ts`, `parse-mission.ts`, `parse-quiz.ts`, `parse-path.ts`) plus a small `FieldReader` that checks field types and builds messages like `content/lessons/x/mission.yaml: goal 1: the "file" field is missing`. The lede is the text before `## Use it`. `pnpm build` runs `pnpm content:check` first (`scripts/check-content.ts`, same loader in Node), so a broken file stops the build; `course-content.test.ts` makes `pnpm test` fail too. Format additions written into SPEC §4: `bookSection`, mission `brief` and goal `label`, the quiz and path shapes, and the goal check kinds. Added `yaml` and `marked` (approved table).

**Dependencies:** 7 · **Files:** `app/src/lib/types/lesson.ts`, `app/src/lib/content/load-lessons.ts`, `app/src/lib/content/parse-lesson.ts`, `app/src/lib/content/parse-lesson.test.ts`, `app/tests/fixtures/sample-lesson/` · **Scope:** M

### Task 9: Write the pilot lesson content
**Description:** Write `content/lessons/three-areas/` from Pro Git 2.2 in our style: lede, short sections for all three layers, recap, the mission (setup, goal checks, three hints, solution) and a 3-question quiz. Cite the book; humanizer pass; mission steps as numbered lists.

**Acceptance criteria:**
- [x] The loader accepts all three files
- [x] Every claim matches Pro Git 2.2 or the official docs (new-vs-old note for `git restore`)
- [x] Reading time for "Use it" is about 5 minutes

**Verification:**
- [x] Tests pass: loader test over the real pilot files
- [ ] Manual: you read the lesson text and approve it

**Result (2026-11-25):** Pilot written from Pro Git 2.2 (status, tracking, staging, short status, committing, skipping the staging area). "Use it" is 353 words plus a Try-it step, about 3 minutes of reading and 2 of trying. The mission is a real job: commit new release notes alone and keep an unfinished README edit out (teaches selective staging). Setup sets a practice identity only when the student has none, and turns off CRLF conversion so Windows warnings don't clutter the terminal. Special blocks use `:::name` markers (definitions, try-it, careful, sidenote, compare), rendered in task 11. Waiting on your read-through and approval.

**Dependencies:** 8 · **Files:** `content/lessons/three-areas/lesson.md`, `mission.yaml`, `quiz.yaml`, `content/paths/pro-path.yaml` · **Scope:** S

### Task 10: Show the pilot lesson on its page
**Description:** `/lessons/[lessonId]` shows the eyebrow, title, layer tabs and each layer's text, with a book citation link and previous/next links, matching the prototype's lesson column.

**Acceptance criteria:**
- [x] `/lessons/three-areas` shows the pilot; the three tabs switch layers
- [x] An unknown lesson ID shows a friendly "lesson not found" page
- [x] Text uses the serif reading styles, max 64 characters wide

**Verification:**
- [x] Tests pass: tabs switch; unknown ID handled
- [x] Manual: compare with the prototype's Lesson screen

**Result (2026-11-25):** `/lessons/[lessonId]` loads the lesson and its place in the pro path (`+page.ts`); the page is just layout. The lesson column is `LessonReader` (header, `LayerTabs`, text, `RecapCard`, `LessonPager`), matching the prototype. Tabs follow the WAI-ARIA pattern (arrow keys, Home/End). Bold in lesson text is the yellow highlighter for new key terms; text is max 64ch in the serif styles (`lesson-prose.css`). Added `bookUrl` to the frontmatter for the citation link (SPEC §4 updated). The sidebar now lists the first module's lessons from content/. Note: in the desktop window the citation link needs the Tauri opener plugin to open the system browser (not in the approved table; ask first). Comparison checked in the browser pane against the prototype's lesson column.

**Dependencies:** 9 · **Files:** `app/src/routes/lessons/[lessonId]/+page.ts`, `+page.svelte`, `app/src/lib/components/lesson-reader/LessonHeader.svelte`, `LayerTabs.svelte`, `LayerTabs.test.ts` · **Scope:** M

### Task 11: Show the lesson's special blocks
**Description:** The blocks from DESIGN.md inside lesson text: definition rows (with area swatches), "Try it" steps, "Use today / In the book" comparison, sidenotes, careful notes and the recap card.

**Acceptance criteria:**
- [x] Each block is its own small component, written in Markdown by lesson authors with a simple marker
- [x] The pilot shows each block correctly
- [x] Blocks read well in both themes

**Verification:**
- [x] Tests pass: Markdown marker → right component, for each block
- [x] Manual: gallery shows every block

**Result (2026-11-25):** Authors write `:::name` … `:::`. Markdown inside: `try-it`, `careful`, `sidenote`; YAML inside: `definitions` (term, area, text) and `compare` (today, book). `render-blocks.ts` splits a section into blocks; the loader runs it too, so a broken block fails the build. One component per block (`DefinitionRows`, `TryItSteps`, `CarefulNote`, `Sidenote`, `CompareCells`) picked by `LessonBlocks`; the recap card is the Recap section. Status words ("Careful", "From Pro Git") are always written, never color alone. Gallery shows every block in both themes.

**Dependencies:** 10 · **Files:** `app/src/lib/components/lesson-reader/` (one file per block), `app/src/lib/content/render-blocks.ts`, `render-blocks.test.ts` · **Scope:** M

### Task 12: Create and reset practice folders (Rust)
**Description:** `create_practice_repo` and `reset_practice_repo`: make `<app data>/practice/<missionId>/`, run the mission's setup steps with real Git inside it, and delete-and-rebuild on reset. The app's own commands never run outside a practice folder.

**Acceptance criteria:**
- [x] Setup steps produce the expected repo in a temporary folder
- [x] Reset gives a fresh copy
- [x] A path outside the practice root is refused with an error

**Verification:**
- [x] Tests pass: Rust integration tests with real Git in temp folders

**Result (2026-11-25):** `PracticeRoot` opens `<app data>/practice/`; `create` deletes any old folder and runs the steps, `reset` reruns the steps saved in `<root>/<missionId>.setup.json` (outside the repo, so they never show in `git status`). Safety lives in the types: commands run only on a `PracticeFolder`, and only `PracticeRoot` makes one (mission IDs must be `a-z 0-9 -`; paths from the screens go through `check_inside`, which resolves `..` first). Steps run as `bash -c` in Git Bash on Windows (found next to Git via `git --exec-path`), with no console window (`hidden_command.rs`, now shared with `get_git_version`). Added `tempfile` (tests only, approved).

**Dependencies:** 7 · **Files:** `app/src-tauri/src/git_runner/practice_folder.rs`, `app/src-tauri/src/git_runner/setup_steps.rs`, `app/src-tauri/src/commands/practice.rs`, `app/src-tauri/tests/practice_folder.rs` · **Scope:** M

### Task 13: Run a real shell session (Rust)
**Description:** `start_terminal_session`, `send_terminal_input`, `resize_terminal` and the `terminal_output` / `terminal_exited` events, using `portable-pty`. Git Bash on Windows, the user's shell on macOS and Linux, started inside the practice folder.

**Acceptance criteria:**
- [x] A session starts in the given folder and echoes typed commands
- [x] Output arrives as events, in order
- [x] Closing the session cleans up the shell process

**Verification:**
- [x] Tests pass: Rust test runs `git --version` through a session and reads the output
- [x] Manual: works on your Windows PC with Git Bash

**Result (2026-11-25):** `TerminalSessions` (`terminal_session.rs`) runs the shell in a PTY with `portable-pty` (ConPTY on Windows): Git Bash `--login -i` on Windows, the user's `$SHELL -l -i` elsewhere, started in the practice folder (`CHERE_INVOKING=1` stops Git Bash jumping to home). One reader thread sends output in order; one waiter thread reports the exit code. The core knows nothing about Tauri: callbacks receive output, and `commands/terminal.rs` turns them into `terminal_output` / `terminal_exited` events. `OutputDecoder` never cuts a multi-byte character (like ❯) in half. Added `close_terminal_session` to the contract (SPEC §3.3) so closing really stops the shell; the app also stops every shell on exit. Lesson learned: ConPTY first asks "where is the cursor?" (`ESC[6n`) and waits for an answer; xterm.js answers it on screen, the test answers it itself. Real-shell tests pass on this Windows PC in under 1 s. Added `portable-pty` (approved).

**Dependencies:** 12 · **Files:** `app/src-tauri/src/git_runner/terminal_session.rs`, `app/src-tauri/src/git_runner/shell_choice.rs`, `app/src-tauri/src/commands/terminal.rs` · **Scope:** M

### Task 14: Show the terminal on screen
**Description:** The retro terminal window from DESIGN.md (title bar with folder, warm screen, glowing prompt) using xterm.js, wired to the session through the typed bridge, resizing with its pane.

**Acceptance criteria:**
- [x] Typing in the app's terminal runs commands in the practice folder
- [x] Colors and fonts come from the terminal tokens
- [x] Esc moves focus out of the terminal

**Verification:**
- [x] Tests pass: component sends input and renders output (mocked bridge)
- [ ] Manual: run `git status` in the pilot (you, at Checkpoint B)

**Result (2026-11-25):** `TerminalWindow` is the retro frame (title bar with folder name, scanlined screen, the only window shadow). `TerminalView` mounts xterm.js 6 with colors and font read from the terminal tokens (`terminal-theme.ts`), refits on resize, turns the cursor blink off with reduce motion, and on Esc blurs and moves focus to the window frame. `TerminalConnection` (plain class, unit-tested) links one screen to one session and keeps any output that arrives before the session ID is known. The lesson page creates the practice folder on open and shows the terminal; in a normal browser it says the terminal needs the desktop app. Added `@xterm/xterm`, `@xterm/addon-fit` (approved). Not yet checked by you: typing `git status` in the real desktop window (Checkpoint B).

**Dependencies:** 13 · **Files:** `app/src/lib/components/terminal-view/TerminalWindow.svelte`, `TerminalView.svelte`, `terminal-theme.ts`, `TerminalView.test.ts` · **Scope:** M

## Checkpoint B: Real terminal
- [ ] On your Windows PC, the pilot's terminal runs real Git in its practice folder
- [ ] You review the Rust core code

### Task 15: Read the repo state into a snapshot (Rust)
**Description:** `get_repo_snapshot` runs read-only Git commands (`status --porcelain=v2`, `log`, `for-each-ref`) and builds a `RepoSnapshot`: commits with parents, branches, tags, HEAD, staged, modified and untracked files.

**Acceptance criteria:**
- [x] Correct snapshot for: empty repo, one untracked file, one staged file, two commits
- [x] Parsing is split into small functions, one per Git output
- [x] Never writes to the repo

**Verification:**
- [x] Tests pass: Rust tests for each case with real Git; parser unit tests with sample output

**Result (2026-11-25):** `read_snapshot` runs three read-only commands and gives each its own parser: `parse_status.rs` (porcelain v2 with `-z`, so spaces in file names are safe; sorts files into staged / modified / untracked and reads HEAD), `parse_log.rs` (our own `--format` with separator bytes 0x1E/0x1F), `parse_refs.rs` (branches, remote branches, tags; annotated tags resolved to their commit). `GIT_OPTIONAL_LOCKS=0` stops `git status` from rewriting the index, and a test proves the repo is unchanged after reading. A folder without Git gives a readable error. `get_repo_snapshot` command registered.

**Dependencies:** 12 · **Files:** `app/src-tauri/src/repo_inspector/snapshot.rs`, `parse_status.rs`, `parse_log.rs`, `app/src-tauri/tests/snapshot.rs` · **Scope:** M

### Task 16: Watch the repo and send live updates
**Description:** Watch the whole practice folder, its files and `.git` (debounced ~100 ms; edits to a file change no file inside `.git`, so watching only `.git` would miss them), rebuild the snapshot and emit `repo_changed`. On the screen side, put each snapshot into the `currentRepoSnapshot` store.

**Acceptance criteria:**
- [x] `git add` and `git commit` each produce one `repo_changed` with the new state
- [x] A burst of changes produces one update, not many
- [x] The store holds the latest snapshot

**Verification:**
- [x] Tests pass: Rust test triggers Git changes and counts events; TS store test

**Result (2026-11-25):** `RepoWatcher` (`notify-debouncer-mini`, 100 ms quiet time) watches the whole practice folder; after each quiet batch it reads a snapshot and sends it only if it differs from the last one. File reads are ignored (`EventKindMask::CORE`), otherwise our own `git status` would trigger the next snapshot forever. Creating or resetting a practice folder now stops the old watcher and every shell (Windows will not delete a folder a shell is inside; deletes also retry briefly), then starts watching and sends the first snapshot. Screens: `currentRepoSnapshot` store in `stores/repo-snapshot.ts`. Tests with real Git: add → one update, commit → one update, editing a file is seen, 20 quick writes → one update (stable over 4 runs). Added `notify-debouncer-mini` (approved; it brings `notify`).

**Dependencies:** 15 · **Files:** `app/src-tauri/src/repo_inspector/watcher.rs`, `app/src/lib/stores/repo-snapshot.ts`, `repo-snapshot.test.ts` · **Scope:** S

### Task 17: Draw the three areas and the live caption
**Description:** The visualizer's desk: working folder (draft), staging area (highlighted), repository (inked), with files as paper sheets and the moving command between zones; plus the caption bar explaining the last command in one sentence.

**Acceptance criteria:**
- [x] Files appear in the right zone for every snapshot case from task 15
- [x] The last-moved file gets the brief outline; motion respects reduce motion
- [x] Captions exist for `status`, `add`, `commit`, `restore` (pilot commands)

**Verification:**
- [x] Tests pass: snapshot → zones; command → caption text
- [ ] Manual: run the pilot commands and watch the desk (you, in the desktop app)

**Result (2026-11-25):** Pure logic in `src/lib/visualizer/`: `area-zones.ts` (snapshot → sheets per zone + newest 3 commit cards; spots sheets that just arrived), `explain-command.ts` (captions for status, add, commit, `commit -a`, restore, `restore --staged`), `command-line-tracker.ts` (rebuilds typed lines from terminal keys; lines edited with arrows or Tab are skipped, not guessed). Screens: `VisualizerBoard` (dotted board), `AreaDesk` (three zones with keycap commands between), `FileSheet` (dashed draft / highlighter stripe; brief outline on arrival, length tied to `--duration-visual`, so instant with reduce motion), `CaptionBar` (live region for screen readers). New `PracticeSession` (`mission-engine/practice-session.svelte.ts`) and `LessonScreen` keep the page thin: they own the practice folder, live snapshots and the caption. Not yet checked by you: running the pilot commands in the desktop window.

**Dependencies:** 16 · **Files:** `app/src/lib/components/visualizer/AreaDesk.svelte`, `FileSheet.svelte`, `CaptionBar.svelte`, `app/src/lib/visualizer/explain-command.ts`, `explain-command.test.ts` · **Scope:** M

### Task 18: Draw the history map
**Description:** The metro-map history with Svelte Flow and ELK: commits as stations, branch lines, the HEAD pin, the faded "next commit" station.

**Acceptance criteria:**
- [x] Linear history draws newest on the right with IDs and messages
- [x] HEAD and the branch label sit on the right station
- [x] Layout logic is a separate tested function

**Verification:**
- [x] Tests pass: snapshot → nodes and edges
- [ ] Manual: commit twice in the pilot and watch the map grow (you, in the desktop app)

**Result (2026-11-25):** `history-layout.ts` (tested on its own): `buildHistoryGraph` turns commits into stations and parent links into tracks, puts HEAD and local branch labels on their station, and adds the faded "next commit" station after HEAD; `placeStations` asks ELK for a layered left-to-right layout (oldest left). `HistoryMap` draws it with Svelte Flow (look-only: no drag, connect, select or scroll-zoom; refits when the station count changes); `CommitStation` is the ring, ID, message, branch chip and yellow "HEAD · you" pin. The dev gallery now shows the full visualizer with a sample repo in both themes. Added `@xyflow/svelte`, `elkjs` (approved). Not yet checked by you: committing twice in the desktop app and watching the map grow.

**Dependencies:** 16 · **Files:** `app/src/lib/components/visualizer/HistoryMap.svelte`, `CommitStation.svelte`, `app/src/lib/visualizer/history-layout.ts`, `history-layout.test.ts` · **Scope:** M

### Task 19: Run the mission: setup, goal checks, hints, reset
**Description:** Opening the lesson sets up its practice repo; the mission panel's checklist ticks itself from the snapshot; "Check mission", "Reset practice" and the hint ladder work.

**Acceptance criteria:**
- [x] Goals tick as soon as they are met
- [x] Hints reveal one at a time; reset rebuilds the repo and clears the checklist
- [x] Goal checking is pure functions with no screen code

**Verification:**
- [x] Tests pass: each goal check type against sample snapshots; hint ladder state
- [ ] Manual: complete the pilot mission (you, in the desktop app)

**Result (2026-11-25):** Pure logic in `mission-engine/`: `goal-checker.ts` (`isGoalMet` / `checkGoals` for all six check kinds; never met before the first snapshot) and `mission-session.ts` (hint ladder, hint button label, "Check mission" message). `MissionPanel` is the worksheet ticket from the prototype: header with mission number and "1 / 3 done", dashed separator, serif brief, self-ticking `GoalRow`s (✓ plus hidden "(done)" words for screen readers), hints revealed one at a time, Check / Reset practice / Show a hint. Reset rebuilds the practice folder (via `PracticeSession`) and hides the hints again; completion is reported once (task 21 saves it). The lesson page opens with the practice folder set up (task 14). Not yet checked by you: completing the pilot mission in the desktop app.

**Dependencies:** 14, 17 · **Files:** `app/src/lib/mission-engine/goal-checker.ts`, `goal-checker.test.ts`, `mission-session.ts`, `app/src/lib/components/mission-panel/MissionPanel.svelte`, `GoalRow.svelte` · **Scope:** M

### Task 20: Show the quiz and explain answers
**Description:** The quiz from DESIGN.md: scenario questions, lettered keycap answers, check, and the explanation for right and wrong picks.

**Acceptance criteria:**
- [x] Answers are selectable by mouse and keyboard (A–D)
- [x] Checking marks right and wrong with icons, not color alone, and shows the explanation
- [x] Scoring is a pure tested function

**Verification:**
- [x] Tests pass: scoring; keyboard selection

**Result (2026-11-25):** `quiz/score-quiz.ts` holds the pure logic (letters A–D, key → answer, judging a pick, scoring). `Quiz` lists every question as a `QuizQuestionCard`: scenario in serif, `QuizOption` keycaps lettered A–D (real buttons, `aria-pressed`), pick by mouse or by pressing A–D inside the question, then "Check answer". Checking locks the pick, marks "✓ Right" / "✗ Wrong" (icon and word), shows the picked answer's explanation and, if wrong, the right answer's. The score shows once every question is checked and is passed on (task 21 saves it). The quiz sits under the mission in the lesson column.

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
