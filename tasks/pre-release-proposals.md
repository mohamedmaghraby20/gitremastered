# Proposals before the release (phase 7)

Draft for discussion, 2026-11-27. Nothing here is done yet: mark what you like, what you don't, and what to change. Each proposal says what it fixes, the options, my pick, and the steps.

| # | Proposal | Needs your choice on |
|---|---|---|
| P1 | Repository layout | Option A (light) or B (full split) |
| P2 | Documents cleanup | Where history goes; which files to add |
| P3 | Privacy and what to publish | The `book/` folder; vendored skills |
| P4 | CLAUDE.md, agents and rules | One rules file for all AI tools or not |
| P5 | Design pass (UI and UX) | Your list of dislikes, your skills |
| P6 | Future features file | File now, issues at release |

Suggested order: P1 → P2 + P3 → P4 → P5. P6 can be written any time.

---

## P1. Repository layout

### What is confusing today

| Today | Why it confuses |
|---|---|
| The repository root has no `package.json`; the real project lives in `app/` with its own `package.json`, lock file and `pnpm-workspace.yaml` | Two "roots": you run commands from `app/`, but content, docs and CI live one level up |
| `app/` holds the screens, the Rust core, the test runners, the student driver and the content scripts together | One folder does five jobs |
| `SPEC.md`, `DESIGN.md`, `CLAUDE.md` at the root, plus `tasks/` with a 991-line `todo.md` | Mixes product docs, AI rules and work history at the top |
| `book/` holds a 39 MB Pro Git submodule and a local PDF | Large, third-party, and only needed by lesson writers |
| `.agents/skills/` (56 files) and `.claude/skills/` (links into it), plus `skills-lock.json` | Tool plumbing at the top level |
| `study/` (ignored) | Fine, but invisible to anyone else |

### Option A (light, recommended now)

One pnpm workspace at the root, the app moved into `apps/desktop/`. Little code changes, mostly paths.

```text
gitremastered/
├── apps/
│   └── desktop/            SvelteKit screens + src-tauri (today's app/)
├── content/                lessons, commands, glossary, paths (unchanged)
├── docs/                   all project documents (see P2)
├── tools/                  content checks, link pass, student driver (today's app/scripts)
├── tests/                  challenge runners: missions, github (today's app/tests)
├── vendor/progit2/         Pro Git source, git submodule (today's book/progit2)
├── .github/                CI, issue and pull request templates
├── package.json            root scripts: pnpm test, pnpm check, pnpm content:check …
├── pnpm-workspace.yaml     lists apps/* (and packages/* later)
├── README.md  LICENSE  CONTRIBUTING.md  CODE_OF_CONDUCT.md  SECURITY.md  CHANGELOG.md
└── AGENTS.md  CLAUDE.md    AI contributor rules (see P4)
```

- Every command runs from the root (`pnpm test`, `pnpm tauri dev`), one lock file, one `node_modules`.
- CI, `.claude/launch.json` and docs update their paths once.

### Option B (full split, when the website starts)

Option A plus a shared package, so the desktop app and the future website (feature F2) use the same code:

```text
packages/
├── course-engine/          content parsing, goal checks, types (today's src/lib/content, mission-engine, types)
└── ui/                     shared Svelte components and design tokens
apps/
├── desktop/
└── web/                    later
```

**My pick:** A now; B only when the website is started. Doing B now is extra work with no user before the release.

**Steps (A):** move with `git mv` so history follows → root `package.json` and workspace → fix import paths, Vite and Tauri config, CI, launch config → run every check → one commit.

---

## P2. Documents cleanup

### Inventory and verdict

| File | Today | Proposal |
|---|---|---|
| `README.md` | 38 lines | Rewrite for the public: what it is, a screenshot, download, how to run, how to contribute |
| `app/README.md` | developer notes | Merge into `CONTRIBUTING.md` |
| `docs/setup.md` | tool install | Merge into `CONTRIBUTING.md` ("Development setup") |
| `SPEC.md` | spec with history ("approved 2026-11-25…") | Move to `docs/architecture.md`; keep how the system works today, drop the history |
| `DESIGN.md` + `docs/design/tokens.json` | design source of truth | Move to `docs/design/`; keep both |
| `docs/course-map.md`, `docs/writing-lessons.md` | core guides | Keep; fix stale lines (rule 18 "when phase 5 ends", "one mission") |
| `docs/measurements.md` | numbers per phase | Keep as `docs/performance.md` |
| `docs/decisions/` | 1 decision record | Keep; add records for the big phase 6 choices (gh CLI, consent in Rust, practice repositories) |
| `docs/reviews/pilot-review.md` | one review | Move to `docs/history/` |
| `tasks/plan.md`, `tasks/todo.md` | full work log, 1,200 lines | Move to `docs/history/` as the record of how the app was built; after the release, plan with GitHub issues and milestones instead |
| `tasks/phase-6-*-brief.md` | instructions for AI writers | Fold into `docs/writing-lessons.md` (they are lesson rules) and the `lesson-writer` agent |
| `tasks/archive/` | old phase 1 plan | `docs/history/` |
| `content/lessons/*/coverage.md` | 73 reviewer notes | Keep (they prove each lesson covers its book section); not shipped in the app already |

**New files a professional open-source repository has:** `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` (how to report a problem), `CHANGELOG.md`, `.github/ISSUE_TEMPLATE/` (bug, lesson error, idea), `.github/pull_request_template.md`.

**Question for you:** keep the work history in the repository (`docs/history/`) or only in Git history (delete the files, they stay in old commits)? My pick: `docs/history/`, because it documents how an AI-assisted project was built, which fits your "learn and open-source it" goals.

---

## P3. Privacy and what to publish

### Checked already

| Check | Result |
|---|---|
| Your name, email, local paths (`C:/Users/seif`, `F:/Development`) in tracked files | None found. Lessons use the personas `ada` and `you` on purpose |
| Tokens (`gho_`, `ghp_`) | Only the redaction code and its test |
| `study/`, `progit.pdf`, `.claude/settings.local.json` | Already ignored |

### Still to decide

| Item | Risk | Proposal |
|---|---|---|
| `book/progit2` submodule | Pro Git is CC BY-NC-SA 3.0; a submodule only points to it, it does not copy it | Keep as a submodule (move to `vendor/`); add a note in `README` crediting Pro Git and its license |
| `.agents/skills/`, `.claude/skills/`, `.claude/commands/`, `skills-lock.json` | Third-party skills (MIT, per `LICENSE-agent-skills`) and personal tooling | Keep only what contributors need; check each license; consider not publishing personal tooling |
| `CLAUDE.md` text about "the user is learning" | Personal, not secret | Rewrite for any contributor (see P4) |
| `tasks/todo.md` decisions naming your GitHub login | Public anyway | Fine; reword where it reads as private notes |
| Review build identifier `io.github.mohamedmaghraby20.gitremastered.review` | Public login | Fine |
| Content license | `content/LICENSE` exists | Confirm it fits your plan (code MIT, content CC?) |

**Steps:** a full scan with a secrets scanner (gitleaks) over the whole Git history before going public; add `.gitignore` rules for anything new (`build/`, local test output).

---

## P4. CLAUDE.md, agents and rules

### Findings

| Finding | Where | Proposal |
|---|---|---|
| Two rules pull against each other: "Keep answers short" and "Be comprehensive and detailed" | `CLAUDE.md`, "How to talk to the user" | One rule: "complete, but scannable: tables and bullets, no long prose" |
| Rules written for you only ("the user is learning…") | `CLAUDE.md` | Split: project rules for every contributor, and a personal file (ignored) for how the AI talks to you |
| No tool-neutral rules file | — | Add `AGENTS.md` (read by many AI tools) with the project rules; `CLAUDE.md` points to it and keeps only Claude-specific parts |
| `lesson-writer` says "add the lesson to `pro-path.yaml`"; the phase 6 briefs said not to | `.claude/agents/lesson-writer.md` vs briefs | Make the agent say what the workflow really is: writers never touch shared files; the main session merges |
| Rule "after each phase run `lesson-tester`" was skipped once | `CLAUDE.md` rule 3 | Keep the rule; also make `lesson:check` print a reminder, or move the playthrough into the release checklist |
| Parallel writers shared one scratch folder and broke each other's work | phase 6 | Brief rule: each writer uses its own scratch folder named after its lesson |
| Agents for tasks we did not use (`web-performance-auditor`, `test-engineer`), 10 slash commands | `.claude/` | Keep the ones in the workflow, remove or document the rest |
| Shell quoting broke files several times (backticks in shell strings) | main session | Rule: edit files with the editor tool, never through shell strings |

**Steps:** write `AGENTS.md`, slim `CLAUDE.md`, update each agent file, one short "Workflow" section (who writes, who checks, who commits).

---

## P5. Design pass (UI and UX)

### Approach

1. **Collect.** You list what you don't like; I take screenshots of every screen (light and dark, small and large window) so we look at the same thing.
2. **Brief.** A one-page design brief: goals for students, what changes, what stays.
3. **Propose.** Two or three directions for the weakest screens, shown as images or a prototype, before any code.
4. **Decide.** You pick; `DESIGN.md` and `tokens.json` change first (CLAUDE.md rule).
5. **Build.** Screens change in small steps, each checked in the app, with the accessibility audit at the end.

**What I need from you:** the skills you mentioned, and your list of dislikes (screen + what bothers you), even rough.

---

## P6. Future features: where to keep them

**Proposal:** a file now, GitHub issues at release.

- Now: `docs/roadmap.md`, one section per idea: the problem, the idea, open questions, rough size, status (`idea`, `planned`, `doing`, `done`).
- At release: each idea becomes a GitHub issue with labels (`idea`, `after-1.0`) and the roadmap links to them, so contributors can discuss.

### The four ideas, written up

| # | Idea | First take |
|---|---|---|
| F1 | Course content in a small database (SQLite) | Probably not worth it: lessons are small text files; speed and memory would not change (memory is the browser engine). Plain files make contributions and reviews easy. Worth it only for fast full-text search or user-made content |
| F2 | Website with a landing page: read lessons, take quizzes and challenges' briefs, search commands and terms; no terminal | Strong. Reuses the SvelteKit screens. Built after the design pass; may need P1 option B |
| F3 | "Ask AI" with the student's own AI account | Useful. Sign-in options differ per provider (often API keys only). An MCP server exposing the course (search, lessons, glossary) to the student's own AI tool avoids storing keys. Check provider terms and our licenses |
| F4 | Resources page: trusted Git and GitHub resources for further study (your links, well-known articles, videos, courses) | Easy and valuable; separate from the sources the lessons were written from |
