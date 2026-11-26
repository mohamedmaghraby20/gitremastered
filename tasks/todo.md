# Tasks: Phases 1 to 3

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
- [x] Manual: you read the lesson text and approve it (approved 2026-11-25)

**Result (2026-11-25):** Pilot written from Pro Git 2.2 (status, tracking, staging, short status, committing, skipping the staging area). "Use it" is 353 words plus a Try-it step, about 3 minutes of reading and 2 of trying. The mission is a real job: commit new release notes alone and keep an unfinished README edit out (teaches selective staging). Setup sets a practice identity only when the student has none, and turns off CRLF conversion so Windows warnings don't clutter the terminal. Special blocks use `:::name` markers (definitions, try-it, careful, sidenote, compare), rendered in task 11. Approved by you on 2026-11-25.

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
- [x] Manual: run `git status` in the pilot (you, at Checkpoint B) — played in the desktop app by the student driver (task 27)

**Result (2026-11-25):** `TerminalWindow` is the retro frame (title bar with folder name, scanlined screen, the only window shadow). `TerminalView` mounts xterm.js 6 with colors and font read from the terminal tokens (`terminal-theme.ts`), refits on resize, turns the cursor blink off with reduce motion, and on Esc blurs and moves focus to the window frame. `TerminalConnection` (plain class, unit-tested) links one screen to one session and keeps any output that arrives before the session ID is known. The lesson page creates the practice folder on open and shows the terminal; in a normal browser it says the terminal needs the desktop app. Added `@xterm/xterm`, `@xterm/addon-fit` (approved). Not yet checked by you: typing `git status` in the real desktop window (Checkpoint B).

**Dependencies:** 13 · **Files:** `app/src/lib/components/terminal-view/TerminalWindow.svelte`, `TerminalView.svelte`, `terminal-theme.ts`, `TerminalView.test.ts` · **Scope:** M

## Checkpoint B: Real terminal
- [x] On your Windows PC, the pilot's terminal runs real Git in its practice folder — played in the desktop app by the student driver (task 27)
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
- [x] Manual: run the pilot commands and watch the desk (you, in the desktop app) — played in the desktop app by the student driver (task 27)

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
- [x] Manual: complete the pilot mission (you, in the desktop app) — played in the desktop app by the student driver (task 27)

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
- [x] Progress and theme survive an app restart
- [x] "Reset progress" in Settings clears it after confirmation
- [x] Storage access goes through one small module

**Verification:**
- [x] Tests pass: progress module with a mocked store
- [x] Manual: finish the pilot, restart, see it marked done (you, in the desktop app) — played in the desktop app by the student driver (task 27)

**Result (2026-11-25):** `stores/progress.ts` is the only module that touches storage: finished missions, latest quiz result per lesson, and the theme, under one key in `progress.json` via the Tauri store plugin (memory-only in a plain browser). It saves to disk after every change. The layout loads progress at startup and applies the saved theme; Settings saves the theme and has a Progress → "Reset progress…" row that asks before forgetting anything (theme stays). Finishing the mission and the quiz save automatically; the sidebar shows ✓ on finished lessons. The plugin is registered in `lib.rs` (Tauri 2's place; `main.rs` only calls it) with the `store:default` permission. Added `tauri-plugin-store` + `@tauri-apps/plugin-store` (approved). Not yet checked by you: finish the pilot, restart, see it marked done.

**Dependencies:** 19, 20 · **Files:** `app/src/lib/stores/progress.ts`, `progress.test.ts`, `app/src-tauri/src/main.rs` (plugin), `app/src/routes/settings/+page.svelte` · **Scope:** M

### Task 22: Test every mission against real Git
**Description:** `pnpm test:missions` takes every lesson's mission, runs its setup and reference solution with real Git in a temporary folder, takes a snapshot and confirms every goal is met.

**Acceptance criteria:**
- [x] The pilot mission passes
- [x] A deliberately wrong solution fails with the goal it missed
- [x] Runs in under a minute

**Verification:**
- [x] Tests pass: `pnpm test:missions`

**Result (2026-11-25):** `pnpm test:missions` (`vitest.missions.config.ts`) loads every lesson from content/, and for each one `mission-runner.ts` runs setup + reference solution through bash with real Git in a temporary folder, then checks the goals with the app's own `goal-checker.ts`. The snapshot comes from the app's own Rust reader through a tiny Cargo example (`src-tauri/examples/print_snapshot.rs`), so there is no second copy of the parsing code. A wrong pilot solution (committing README.md too) fails with "README.md is still changed, not committed". 36 s on the first run (compiles the printer), under 3 s after. Added to CI. `scripts/read-content-files.ts` is now shared by the content check and the mission tests.

**Dependencies:** 19 · **Files:** `app/tests/missions/run-missions.test.ts`, `app/tests/missions/mission-runner.ts`, `app/package.json` · **Scope:** S

### Task 23: Prove a new lesson needs content files only
**Description:** Add a short second lesson (`ignoring-files`, Pro Git 2.2 "Ignoring Files") with no app code changes, to prove SPEC success criterion 8.

**Acceptance criteria:**
- [x] The lesson appears, its mission and quiz work
- [x] `git diff` shows changes only under `content/`
- [x] Its mission passes `pnpm test:missions`

**Verification:**
- [x] Tests pass: loader and mission tests
- [x] Manual: open the lesson from the pilot's "next" link (checked in the browser pane; mission play-through is yours)

**Result (2026-11-25):** `content/lessons/ignoring-files/` (lesson, mission, quiz from Pro Git 2.2 "Ignoring Files" plus the gitignore docs) and one line in `pro-path.yaml`. The commit touches only `content/` (see `git show --stat` of "Second lesson: ignore files…"). It appears in the sidebar and as "02 …" behind the pilot's Next link; its mission passes `pnpm test:missions`. The content check caught a real authoring slip on the way (`echo "debug: started"` read as a YAML key until quoted), which shows the loader doing its job. Not yet checked by you: playing it in the desktop app.

**Dependencies:** 22 · **Files:** `content/lessons/ignoring-files/` (3 files), `content/paths/pro-path.yaml` · **Scope:** S

## Checkpoint C: Pilot complete
- [x] SPEC success criteria 2–8 hold on Windows (played by the student driver, task 27)
- [x] Visualizer updates within 300 ms of a Git command (measured: 234 ms median)
- [x] Memory use with the pilot open measured and written down (233 MB private)
- [x] All tests pass → Phase 3: pilot review (2026-11-25)

---

## Phase 3: Pilot review

Goal: take the pilot as a student in the real desktop app, measure it against SPEC §10, fix what the run-through finds, settle the content format, and plan phase 4. You approved this phase and the opener plugin on 2026-11-25; your own student run-through comes in the joint review of phases 2 and 3.

### Task 24: Open the Pro Git link in the system browser
**Description:** In the desktop window a plain `target="_blank"` link does nothing useful. Add the Tauri opener plugin (approved 2026-11-25) and a small `openExternalLink` wrapper in `app/src/lib/tauri/`, allowed only for `https://` links. The citation link uses it in the desktop app and stays a normal link in a browser.

**Acceptance criteria:**
- [x] Clicking "Pro Git 2.2" in the desktop app opens the system browser at the section
- [x] Only `https://` addresses are opened; anything else is refused
- [x] The opener permission is limited to `https://` URLs

**Verification:**
- [x] Tests pass: wrapper test (https opens, other schemes refused, a desktop click goes to the system browser, a browser click is left alone)

**Result (2026-11-25):** `open-external.ts` has three small functions: `isSafeExternalLink` (https only), `openExternalLink` (refuses anything else, then calls the opener plugin) and `handleExternalLinkClick` (in the desktop app it cancels the click and opens the system browser; in a browser it does nothing). The capability allows `opener:allow-open-url` for `https://git-scm.com/*` only, and the content check now rejects a `bookUrl` outside that site, so a lesson can't ship a link the app may not open. Added `@tauri-apps/plugin-opener` and `tauri-plugin-opener` (approved 2026-11-25). The click in the desktop window is checked in task 27.

**Dependencies:** 10 · **Files:** `app/src/lib/tauri/open-external.ts` (+ test), `LessonHeader.svelte`, `src-tauri/Cargo.toml`, `lib.rs`, `capabilities/default.json` · **Scope:** M

### Task 25: A driver that plays the app like a student
**Description:** A dev script that starts a release copy of the app with its own data folder and the web view's debugging port on, then drives it through the Chrome DevTools Protocol (Node's built-in WebSocket, no new package): open a page, type into the terminal, read the screen. Used by tasks 26–28.

**Acceptance criteria:**
- [x] One command builds nothing new, starts the copy, and connects
- [x] It can open `/lessons/three-areas`, type `git status` in the terminal and read the output back (Checkpoint B)
- [x] It never touches your own app data (separate identifier)

**Verification:**
- [x] Manual: the script prints the `git status` output from the real shell

**Result (2026-11-25):** `app/scripts/student-driver/`: `devtools-connection.ts` (a small CDP client on Node's built-in WebSocket, no new package), `review-app.ts` (starts the release "review copy" with WebView2's debugging port on; its own identifier keeps its data apart from yours), `student-actions.ts` (open a lesson, type a command, read the terminal, click, wait), and three entry scripts: `pnpm review:terminal` (Checkpoint B), `pnpm review:measure` (task 26) and `pnpm review:play` (task 27). `pnpm review:build` builds the copy. Checkpoint B passes: `git status` typed into the app's terminal answers from the real shell. Its first run found the review's biggest bug (task 27, finding 1).

**Dependencies:** 14 · **Files:** `app/scripts/student-driver/` · **Scope:** M

### Task 26: Measure the visualizer delay and memory use
**Description:** SPEC §10 items 4 and 10. With the driver, run `git add` in the pilot and time until the desk shows the file as staged; repeat and take the slowest. Read the memory of the app and its web view processes with the pilot open. Write both into `docs/measurements.md`.

**Acceptance criteria:**
- [x] Delay measured over at least 10 commands; slowest under 300 ms
- [x] Memory measured (app + web view processes); under ~250 MB or a written plan to get there
- [x] Numbers, date, machine and method written down

**Result (2026-11-25):** `docs/measurements.md`. Delay first measured at 313 ms median, so over target: each Git process costs ~35 ms to start on Windows and the snapshot ran four in a row. They now run in parallel: **234 ms median, 238 ms slowest** over 15 commands, timed from pressing Enter. Memory with the pilot open: **233 MB private** (457 MB working set, which counts WebView2 pages shared with Edge), under the ~250 MB target with little room.

**Dependencies:** 25 · **Files:** `docs/measurements.md`, driver script · **Scope:** S

### Task 27: Play the pilot as a student and fix what breaks
**Description:** With the driver: read the lesson, run the mission from setup to goals met, open every hint, reset, take the quiz with wrong and right answers, restart the app and check progress is kept. Also the second lesson. Write findings in `docs/reviews/pilot-review.md`; fix each real problem with a test.

**Acceptance criteria:**
- [x] SPEC §10 items 2, 3, 5, 6, 7, 8 checked in the desktop app and noted
- [x] Every problem found is fixed (with a test) or listed with a reason to wait

**Result (2026-11-25):** `docs/reviews/pilot-review.md`: 9 findings, 7 fixed with tests, 1 waiting (long shell prompt path), 1 design question for you (terminal height). Fixed: terminal pushed off-screen by the layout (blocker), page scroll from screen-reader labels, "file is committed" met without committing (engine), visualizer delay, "Right. Right." in the quiz, citation sites, and Tailwind missing from component tests. `pnpm review:play`: all 11 steps pass, including restart and the second lesson.

**Dependencies:** 25 · **Files:** `docs/reviews/pilot-review.md`, fixes as found · **Scope:** M

### Task 28: Settle the content format
**Description:** SPEC §4 says "revisit after the pilot". Use both lessons and the review to decide what stays, what changes, and write the final V1 format into SPEC §4 and an authoring guide for lesson writers (`docs/writing-lessons.md`).

**Acceptance criteria:**
- [x] SPEC §4 marked final for V1, open question 4 closed
- [x] `docs/writing-lessons.md` explains every file, field, block and goal check, with the pilot as example

**Result (2026-11-25):** The format held up: the review changed the engine, not the format. SPEC §4 is marked final for V1 and now documents the `:::` blocks and allowed citation sites; open question 4 closed. `docs/writing-lessons.md` covers steps, every field, the blocks, goal checks, setup rules (quote lines with `: `), quiz rules and style.

**Dependencies:** 27 · **Files:** `SPEC.md`, `docs/writing-lessons.md` · **Scope:** S

### Task 29: Plan phase 4
**Description:** Break phase 4 (the other screens: home, course map, search, command index, settings) into detailed tasks in this file, from the prototype and the review findings.

**Acceptance criteria:**
- [x] Phase 4 tasks written with acceptance criteria, files and sizes
- [x] `tasks/plan.md` updated: phase 3 status, phase 4 task list, dependency table

**Result (2026-11-25):** Phase 4 is tasks 30–40 below, from the prototype's home, course map, search, command index, settings and small-window screens. One proposal needs your OK: search as a small in-memory index instead of Pagefind (task 37).

**Dependencies:** 27 · **Files:** `tasks/todo.md`, `tasks/plan.md` · **Scope:** S

### Review round 2: your notes from the walkthrough
**Description:** Fixes from your own run-through of the pilot (2026-11-26), recorded as findings 10–19 in `docs/reviews/pilot-review.md`.

**Acceptance criteria:**
- [x] Terminal takes about 40% of the practice column (was 280 px)
- [x] Desk zones smaller; the same space on both sides of "git add" and "git commit"
- [x] Ctrl V pastes; Ctrl C copies selected text and otherwise still stops a command
- [x] Ctrl + / − / 0 change the terminal text size, kept after a restart
- [x] "Your mission" and "Quiz" each have a heading that says what they are for; each quiz question is its own card
- [x] History map: zoom buttons, mouse wheel and trackpad pinch; HEAD and branch labels above the commit
- [x] Key terms get a soft marker stroke instead of the full yellow block (new token `highlight-soft`)

**Verification:** unit tests (shortcuts, text size, progress), component tests (labels above, zoom buttons), `pnpm review:fixes` in the desktop app, `pnpm review:play` again · **Scope:** M

### Lesson depth: the pilot as the model
**Description:** Your review (2026-11-26): lessons must cover their Pro Git sections well, not scratch the surface. "Must know" is everything a working developer needs for the job; "Under the hood" is how Git does it; "Advanced" is for mastering the tool. The pilot is rewritten first; the other lessons follow once you approve its style.

**Acceptance criteria:**
- [x] Pilot audited point by point against Pro Git 2.2 (its share of the section), 1.3 and 10.2: `content/lessons/three-areas/coverage.md`
- [x] Must know adds: clean status, reading the hints, why untracked files wait, two jobs of `git add`, short status with a code table, the editor and Vim trap, `commit -a`
- [x] Under the hood adds: `.git/index`, what `git add` stores, `git ls-files --stage`, what a commit is (snapshot, checksum)
- [x] Advanced adds: `add .` / `-A` / `-u` / `-n`, `status -sb`
- [x] Try-its use their own file, so they no longer solve the mission
- [ ] You read the pilot in the app and approve the style → then the same pass for every lesson

## Checkpoint D: Pilot reviewed
- [x] Measurements written down and within SPEC targets (or a plan)
- [x] Review findings fixed or listed
- [ ] You review phases 2 and 3 together and take the pilot yourself

---

## Phase 4: The other screens

Goal: home, course map (both paths), search, command index and settings work for real, as in the approved prototype, plus the small-window lesson layout. Built from content and saved progress only; every new content file kind gets a loader check like lessons have. Planned 2026-11-25 from the prototype and the pilot review.

### Task 30: A segmented switch component
**Description:** The outlined group with a 3px bottom edge from DESIGN.md (selected option filled `primary`), as a real radio group with arrow keys. Used by the course map (Pro / Book), home, settings (theme) and the small-window lesson (Visualizer / Terminal).

**Acceptance criteria:**
- [x] Keyboard: arrows move and select, Tab leaves the group; focus ring on the selected option
- [x] Tokens only; shown in the dev gallery in both themes

**Verification:** component test (click, arrows, `aria-checked`) · **Files:** `components/ui/segmented-switch/` · **Scope:** S

### Task 31: The Book path file and lesson facts
**Description:** `content/paths/book-path.yaml` (Pro Git chapters → sections → the lesson that teaches each) with a loader check that every lesson ID exists. Two facts per lesson for lists: reading time (from word count of "Use it" plus the mission, rounded to minutes) and source label ("Pro Git 2.2", or "Beyond the book" for GitHub Docs links).

**Acceptance criteria:**
- [ ] A broken or unknown lesson ID in the book path fails the content check
- [ ] Reading time and source label computed, not written by hand

**Verification:** unit tests (parser, check, time, label) · **Files:** `content/paths/book-path.yaml`, `content/parse-path.ts`, `content/lesson-facts.ts` · **Scope:** M

### Task 32: Remember where the student is
**Description:** Save the last opened lesson and the furthest layer read, next to finished missions and quiz results. Pure functions for "continue learning", "up next" (the next unfinished lessons in the chosen path) and path progress (done / total for the core modules and the whole course).

**Acceptance criteria:**
- [ ] Opening a lesson and switching layers is saved and survives a restart
- [ ] Progress numbers match the path files

**Verification:** unit tests over sample progress · **Files:** `stores/progress.ts`, `progress/learning-summary.ts` · **Scope:** M

### Task 33: Home screen
**Description:** As in the prototype: "Pick up where you left off" card (eyebrow, title, lede, layer ticks, Continue lesson as the one primary button, Open course map), the practice repo's three areas in small, "Your path" with the Pro / Book switch and progress bars, "Up next", and one "Quick review" question from a finished lesson's quiz. A first-time student sees "Start the course" instead.

**Acceptance criteria:**
- [ ] Every card works from real progress; the empty state is clear
- [ ] Keyboard: Enter on the focused card continues the lesson

**Verification:** component tests (first visit, returning student) · **Files:** `routes/+page.svelte`, `components/home/` · **Scope:** M

### Task 34: Course map screen
**Description:** Pro path: modules with their lessons (number, title, source, time, ✓ done / ● current). Book path: chapters with sections and the lesson for each. The switch remembers the choice. Nothing is locked; every row opens its lesson.

**Acceptance criteria:**
- [ ] Both orders come only from the path files
- [ ] Status never by color alone (✓ and ● have text labels for screen readers)

**Verification:** component tests (both paths, marks) · **Files:** `routes/course-map/+page.svelte`, `components/course-map/` · **Scope:** M

### Task 35: Command and glossary content
**Description:** The format for the command index (SPEC §4 lists `reference/` and `glossary.yaml`): one Markdown page per command with frontmatter (command, group, usage, bookSection, bookUrl, lessons) and the usual blocks; `glossary.yaml` for terms (term, meaning, lessons). Loader and content check; write the pages for the pilot's commands (status, add, commit, restore, check-ignore, rm --cached) and their terms.

**Acceptance criteria:**
- [ ] Unknown lesson IDs and missing fields fail the content check
- [ ] Format written into SPEC §4 and `docs/writing-lessons.md`

**Verification:** unit tests · **Files:** `content/reference/`, `content/glossary.yaml`, `content/parse-reference.ts` · **Scope:** M

### Task 36: Command index screen
**Description:** Left list grouped by command group with a Commands / Terms switch; the page shows usage, the explanation, blocks (careful, today vs. the book), "Learn it" links to lessons and the Pro Git link (system browser, task 24).

**Acceptance criteria:**
- [ ] `/commands/<id>` opens one command; the list marks the selected one
- [ ] Works fully by keyboard

**Verification:** component tests · **Files:** `routes/commands/`, `components/command-index/` · **Scope:** M

### Task 37: Search
**Description:** Search lessons (title, lede, commands used), commands, terms and Pro Git sections, grouped as in the prototype, with filter chips and ↑ ↓ ⏎ Tab Esc. A small in-memory index over the content the app already loads, instead of Pagefind (approved 2026-11-26; SPEC §2 updated).

Ctrl K from any screen opens a **quick search panel** over the current screen, like modern docs sites: type, see the top results grouped in the panel, ↑ ↓ ⏎ opens one, Esc closes it. "See all results" (or expanding the panel) opens the full search page with the same query and the filter chips.

**Acceptance criteria:**
- [ ] SPEC §10 item 9: finds lessons by title and by command
- [ ] Ctrl K opens the panel from any screen; focus goes to its search box and comes back on Esc
- [ ] "See all results" opens `/search` with the query kept
- [ ] Results update as you type, under 50 ms for the full course size

**Verification:** unit tests (ranking), component tests (keys, Ctrl K) · **Files:** `search/`, `routes/search/`, `components/search/` · **Scope:** M

### Task 38: Settings screen, complete
**Description:** Theme Light / Dark / System (switch), lesson text size, reduce motion (also on when the system asks for it), Git found on this computer (with version), reset progress (exists), About (version, Pro Git credit and licenses). The shell choice (Git Bash / PowerShell) waits for phase 5: lessons use bash.

**Acceptance criteria:**
- [ ] Every setting applies at once and survives a restart

**Verification:** component tests · **Files:** `routes/settings/`, `components/settings/` · **Scope:** M

### Task 39: Sidebar with path progress
**Description:** The full sidebar from the prototype: the four places, path progress ("Pro path 4 / 62" with a bar), and the current module's lessons with done marks.

**Verification:** component test · **Files:** `components/app-shell/SidebarFull.svelte` · **Scope:** S

### Task 40: Small-window lesson
**Description:** Below 1100px window width, the visualizer and terminal share one panel with a Visualizer / Terminal switch, and sidenotes flow under the text (DESIGN.md layout, prototype "LessonNarrow"). The terminal keeps its shell when hidden.

**Acceptance criteria:**
- [ ] At 1024 × 700 (the minimum window) nothing is cut off and the switch works by keyboard

**Verification:** layout test at 1024 × 700 (as in the pilot review) · **Files:** `components/lesson-screen/` · **Scope:** M

### Task 41: Resizable lesson panels
**Description:** Drag handles between the lesson column and the practice column, and between the visualizer and the terminal, so the student picks the sizes (asked for in the walkthrough, 2026-11-26). Arrow keys move a focused handle; double-click goes back to the default split; sizes are remembered.

**Acceptance criteria:**
- [ ] Both handles work by mouse and keyboard, with a visible focus ring and a screen-reader label
- [ ] Each panel keeps a minimum size, so the terminal and the lesson text never vanish
- [ ] Sizes survive a restart

**Verification:** component tests (keys, limits), driver check in the desktop app · **Files:** `components/lesson-screen/` · **Scope:** M

### Task 42: A history map that grows with the course
**Description:** Branching lessons will make the map too big for its corner. Add an "expand" button that opens the map large over the lesson (Esc closes it; the terminal keeps running), and make the view follow HEAD after each commit. Lanes per branch (one row for each branch) come with the branching lessons.

**Acceptance criteria:**
- [ ] Expand and close by mouse and keyboard; focus returns to the button
- [ ] After a commit the newest station is in view, at a readable zoom

**Verification:** component tests, driver check with 20+ commits · **Files:** `components/visualizer/` · **Scope:** M

### Task 43: Links between lessons, with hover cards
**Description:** Your idea (2026-11-26). A lesson can link a word to the lesson or glossary term that teaches it, for curious students who want to look ahead without leaving the course.
- Writing it: `[branch](term:branch)` for a glossary term, `[.gitignore](lesson:ignoring-files)` for a lesson; the content check fails on an unknown ID.
- Hover or keyboard focus shows a small card: the term's one-line meaning and "Open the lesson →".
- Opening the lesson remembers where you were. A "← Back to *Status, stage, commit*" bar on the new lesson returns you to the same layer and scroll position.
- Links to lessons not written yet show the card but say "Coming later" instead of a dead link.

**Acceptance criteria:**
- [ ] The card opens on hover and on focus, closes on Esc, and is read by screen readers
- [ ] "Back" returns to the same lesson, layer and scroll position
- [ ] Unknown IDs fail `pnpm content:check`

**Dependencies:** 35 (glossary content) · **Verification:** unit tests (link parsing), component tests (card, back) · **Files:** `content/`, `components/lesson-reader/` · **Scope:** M

### Task 44: Challenges instead of one mission
**Description:** Decided 2026-11-26. The single "mission" becomes at least three **challenges** per lesson, from easy to hard. The student picks any of them. Challenges test the skill in a realistic situation; the quiz tests understanding. In the lesson, "Challenges" comes after the text and before the quiz.
- Content: `challenges.yaml` replaces `mission.yaml`: a list of 3 or more, each with a level (easy, medium, hard), a brief, its own setup, goals, hints and solution.
- Choosing one rebuilds the practice project in that challenge's starting state ("Start this challenge"), so Try-its and challenges never mix.
- Where the goals show while you work: in the lesson column, under the "Challenges" heading (decided 2026-11-26). The terminal stays as it is.
- After release, test the other option as an experiment: a thin goals strip inside the terminal window, between its title bar and the screen, folding to one line.

**Acceptance criteria:**
- [ ] Both lessons have 3 challenges, easy to hard; `pnpm test:missions` runs every one
- [ ] Starting a challenge rebuilds the practice project; finishing one is remembered
- [ ] The content check fails with fewer than 3 challenges

**Verification:** unit tests (parsing, progress), mission tests, driver play-through · **Files:** `content/`, `mission-engine/`, `components/mission-panel/` · **Scope:** L

## Checkpoint E: The other screens
- [ ] Every screen in the prototype works with real content and progress
- [ ] Search finds lessons by title and by command (SPEC §10 item 9)
- [ ] All tests pass; you review the screens in the desktop app
