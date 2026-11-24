# Spec: GitRemastered app — V1

Status: draft for review, 2026-11-24.

Related documents:
- `docs/course-map.md`: what the course teaches (62 lessons, two paths, outcomes)
- `docs/decisions/0001-app-platform.md`: why this tech stack
- `CLAUDE.md`: how to talk to the user and how to write code
- `DESIGN.md` + `docs/design/tokens.json`: look and feel (approved 2026-11-24)

## 1. Objective

A free, open-source desktop app that turns Pro Git into an interactive course. Each lesson combines short text, a real terminal with real Git in a ready-made practice repository, a live visualizer of what Git is doing, a mission, hints and a quiz.

**Users:** developers who want to become professional with Git and GitHub. Smart, busy, little patience for long reading.

**V1 is done when** the whole app works end to end on the pilot lesson (`three-areas`), and any new lesson can be added by writing content files only, with no app code changes.

## 2. Tech stack

| Part | Choice |
|---|---|
| App shell | Tauri 2 (Rust core, system web view) |
| Screens | SvelteKit (static mode, `adapter-static`, no server rendering) + Svelte 5 + TypeScript |
| Terminal | xterm.js (screen) + Rust `portable-pty` (real shell) |
| Shell | Git Bash on Windows; system bash/zsh on macOS and Linux |
| Git | The student's own installed Git; course targets the latest Git at release |
| Visualizer | Svelte Flow + ELK layout |
| Lesson text | Markdown with frontmatter |
| Missions, quizzes, paths | YAML |
| Search | Pagefind |
| Progress | Tauri store plugin (local JSON file) |
| Styling | Tailwind CSS + shadcn-svelte; repeated looks as named classes via `@apply` |
| Tests | Vitest (TypeScript), `cargo test` (Rust), mission tests against real Git |
| Code quality | ESLint + Prettier + `svelte-check`; Clippy + rustfmt |
| Package manager | pnpm |
| Updates | Tauri updater plugin |
| Installers | Tauri bundler, built by GitHub Actions for Windows, macOS, Linux |
| Usage tracking | None |

## 3. System design

### 3.1 Layers

| Layer | Job | Language | Rule |
|---|---|---|---|
| Content | Lessons, missions, quizzes, paths | Markdown + YAML | Holds no logic |
| Screens | Everything the student sees and clicks | Svelte + TypeScript | Never touches the file system or runs programs |
| Core | Shell, Git, practice folders, watching for changes | Rust | Never draws anything |

### 3.2 Modules

| # | Module id | Job | Depends on | Layer |
|---|---|---|---|---|
| 1 | `content` | Load and validate lessons, missions, quizzes, paths, glossary | — | Screens (TS) |
| 2 | `git-runner` | Open the real shell; create, reset and delete practice folders | — | Core |
| 3 | `repo-inspector` | Watch `.git`; build a `RepoSnapshot` with read-only Git commands | git-runner | Core |
| 4 | `mission-engine` | Run mission setup; check goals against the snapshot; serve hints | content, git-runner, repo-inspector | Screens (TS) |
| 5 | `lesson-reader` | Lesson page: three layers, recap card, book link | content | Screens |
| 6 | `terminal-view` | xterm.js wired to the shell | git-runner | Screens |
| 7 | `visualizer` | Draw the snapshot; animate changes | repo-inspector | Screens |
| 8 | `quiz` | Ask, check, explain answers | content | Screens |
| 9 | `progress` | Remember finished lessons and quiz results | content | Screens + Tauri store |
| 10 | `search` | Search lessons and commands | content | Screens |
| 11 | `app-shell` | Window, layout, navigation, paths, book view, settings, updates | all screen modules | Screens + Tauri |

Dependencies only point one way. Modules talk through the contract (3.3) and shared stores (3.5), never by reaching into each other's files.

### 3.3 Contract between screens and core

Commands (screen asks, core answers):

| Command | Input | Output |
|---|---|---|
| `create_practice_repo` | `missionId`, setup steps | practice folder path |
| `reset_practice_repo` | `missionId` | practice folder path |
| `start_terminal_session` | practice folder path | session id |
| `send_terminal_input` | session id, text | nothing |
| `resize_terminal` | session id, columns, rows | nothing |
| `get_repo_snapshot` | practice folder path | `RepoSnapshot` |

Events (core announces, screens react):

| Event | Payload | Who listens |
|---|---|---|
| `terminal_output` | session id, text | terminal-view |
| `repo_changed` | `RepoSnapshot` | stores → visualizer, mission-engine |
| `terminal_exited` | session id, exit code | terminal-view |

Changing this contract needs the user's approval (see Boundaries).

### 3.4 Shared data shapes

Defined once in TypeScript (`app/src/lib/types/`) and mirrored in Rust (`app/src-tauri/src/models/`, serialized with serde):

```ts
/** The state of the practice repository at one moment. */
type RepoSnapshot = {
  commits: Commit[];        // every reachable commit, newest first
  branches: Branch[];       // local and remote-tracking branches
  tags: Tag[];
  head: HeadState;          // which branch or commit HEAD points to
  stagedFiles: FileChange[];     // in the index, not yet committed
  modifiedFiles: FileChange[];   // changed in the working folder, not staged
  untrackedFiles: string[];
};
```

### 3.5 Data flow (one command)

1. Student types in `terminal-view` → `send_terminal_input`.
2. `git-runner` passes it to the real shell; real Git runs; output returns as `terminal_output`.
3. `repo-inspector` sees `.git` change, waits ~100 ms for it to settle, builds a `RepoSnapshot`, emits `repo_changed`.
4. The event handler writes the snapshot into the `currentRepoSnapshot` store.
5. `visualizer` redraws; `mission-engine` re-checks the goal.

### 3.6 Practice folders

- Location: the app's local data folder, `<app data>/practice/<missionId>/`.
- The app's own automatic Git commands only ever run inside a practice folder, never in the student's own projects.
- Reset = delete the folder and run the mission setup again.

## 4. Content format (V1, revisit after the pilot)

```
content/
├── lessons/<lesson-id>/
│   ├── lesson.md      frontmatter + sections: Use it, How it works, Pro, Recap
│   ├── mission.yaml   setup steps, goal checks, hint ladder, reference solution
│   └── quiz.yaml      2–4 questions, each with an explanation
├── paths/
│   ├── pro-path.yaml  ordered lesson ids, grouped by module
│   └── book-path.yaml lesson ids in Pro Git order
├── reference/<page-id>.md
└── glossary.yaml
```

`lesson.md` frontmatter:

```yaml
id: three-areas
title: "Status, stage, commit: the three areas"
module: daily-loop
bookSources:
  - book/progit2/book/02-git-basics/sections/recording-changes.asc
readFirst: [first-look-inside, start-a-repo]
```

`mission.yaml` goal checks are declarative, read against the snapshot:

```yaml
setup:
  - git init
  - echo "draft" > notes.txt
goal:
  - check: file-is-committed
    file: notes.txt
hints:
  - "Which area does a file need to be in before you can commit it?"
  - "Use git add to move notes.txt into the staging area."
  - "Run: git add notes.txt, then git commit -m \"Add notes\""
solution:
  - git add notes.txt
  - git commit -m "Add notes"
```

## 5. Project structure

```
app/                           Tauri + SvelteKit project
├── package.json
├── src/
│   ├── routes/                pages: home, lessons/[lessonId], paths, glossary, search
│   └── lib/
│       ├── content/           module: content
│       ├── mission-engine/    module: mission-engine
│       ├── components/
│       │   ├── lesson-reader/
│       │   ├── terminal-view/
│       │   ├── visualizer/
│       │   ├── quiz/
│       │   └── ui/            shadcn-svelte building blocks
│       ├── stores/            shared stores (snapshot, progress)
│       ├── tauri/             typed wrappers around every contract command and event
│       └── types/             shared data shapes
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/          what the screens are allowed to call
│   └── src/
│       ├── main.rs            starts the app, registers commands
│       ├── commands/          one file per contract command group
│       ├── git_runner/        module: git-runner
│       ├── repo_inspector/    module: repo-inspector
│       └── models/            Rust versions of the shared data shapes
└── tests/missions/            runs every mission's setup + solution against real Git
content/  book/  docs/  tasks/  (see README)
```

Tests sit next to the code they test: `name.test.ts` beside `name.ts`; Rust unit tests in a `#[cfg(test)] mod tests` block in the same file.

## 6. Commands

Run from `app/`:

| Purpose | Command |
|---|---|
| Install | `pnpm install` |
| Run the app in development | `pnpm tauri dev` |
| Build installers | `pnpm tauri build` |
| TypeScript tests | `pnpm test` |
| Type check | `pnpm check` |
| Lint | `pnpm lint` |
| Format | `pnpm format` |
| Rust tests | `cargo test --manifest-path src-tauri/Cargo.toml` |
| Rust lint | `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` |
| Rust format | `cargo fmt --manifest-path src-tauri/Cargo.toml` |
| Mission tests | `pnpm test:missions` |

## 7. Code style

`CLAUDE.md` is the rule book. Example of the expected style:

```ts
/**
 * mission-checker.ts
 * Decides whether a mission's goal is reached, by reading the current repo snapshot.
 */

import type { RepoSnapshot } from "$lib/types/repo-snapshot";
import type { GoalCheck } from "$lib/types/mission";

/**
 * Checks one goal against the repo snapshot.
 * @param goalCheck - the goal from mission.yaml, e.g. "file-is-committed"
 * @param repoSnapshot - the repo state right now
 * @returns true if the goal is met
 */
export function isGoalMet(goalCheck: GoalCheck, repoSnapshot: RepoSnapshot): boolean {
  if (goalCheck.check === "file-is-committed") {
    const fileIsStaged = repoSnapshot.stagedFiles.some((change) => change.path === goalCheck.file);
    const fileIsModified = repoSnapshot.modifiedFiles.some((change) => change.path === goalCheck.file);
    const repoHasCommits = repoSnapshot.commits.length > 0;
    return repoHasCommits && !fileIsStaged && !fileIsModified;
  }
  return false;
}
```

Naming: `kebab-case` file names (TypeScript, Svelte components in `PascalCase.svelte` per Svelte convention), `camelCase` variables and functions in TypeScript, `snake_case` in Rust, `PascalCase` types in both.

## 8. Testing strategy

| Level | What | Tool | Where |
|---|---|---|---|
| Unit | Pure logic: content parsing, goal checks, snapshot parsing | Vitest, `cargo test` | Next to the code |
| Integration | Rust core against a real temporary Git repo | `cargo test` | `src-tauri/tests/` |
| Mission | Every mission: setup + reference solution reaches the goal with real Git | Vitest + real Git | `app/tests/missions/` |
| Manual | The pilot lesson played as a student | You | Checkpoint |

A task is done only when all tests, type checks and lints pass.

## 9. Boundaries

**Always**
- Follow `CLAUDE.md` (talking and code rules).
- Run tests, type check and lint before every commit.
- Keep modules talking only through the contract and stores.
- Cite the Pro Git section (or official doc) for every lesson.
- Run the app's own Git commands only inside practice folders.

**Ask first**
- Adding a dependency.
- Changing the contract (commands, events, data shapes).
- Changing the content format.
- Adding a top-level folder.

**Never**
- Touch the student's own repositories.
- Commit secrets.
- Copy long passages of Pro Git word for word.
- Delete or skip a failing test to make the build pass.

## 10. Success criteria (V1)

1. `pnpm tauri dev` opens the app on Windows, macOS and Linux.
2. The pilot lesson shows all three layers and the recap card.
3. The terminal runs real Git in a practice folder; typing feels instant.
4. After a Git command, the visualizer updates within 300 ms.
5. The pilot mission sets up, detects the goal, and serves all hint levels; reset works.
6. The pilot quiz checks answers and explains them.
7. Progress survives an app restart.
8. A second lesson can be added with content files only, and it works with no app code changes.
9. Search finds lessons by title and by command.
10. App memory stays under ~250 MB with the pilot lesson open (to be measured).
11. All tests, type checks and lints pass in GitHub Actions.

## 11. Out of scope (deferred)

| Idea | Why deferred |
|---|---|
| Cloud version (browser + server) | Separate project; costs and security |
| Mobile apps | Phones can't run real Git |
| Accounts and sync | Needs a server |
| Usage tracking | Privacy; maybe opt-in later |
| AI tutor inside the app | Decide after the pilot |
| Translations | English first |
| Handling a missing Git install | Decide later |
| Writing all 62 lessons | Content work, planned per module after the pilot |

## 12. Open questions

1. ~~Design system~~ Approved: `DESIGN.md` + `docs/design/tokens.json`.
2. ~~App prototype~~ Approved: linked in `DESIGN.md` (home, course map, lesson, small-window lesson, search, command index, settings).
3. Component inventory: derived from the approved prototype during `/plan`, so the plan holds one task per reusable component; components are built after the plan.
4. Final content format: confirm after the pilot lesson.
