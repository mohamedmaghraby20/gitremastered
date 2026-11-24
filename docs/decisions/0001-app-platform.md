# 0001: App platform (where the app runs, how it runs Git)

Status: accepted, 2026-11-24. Approved stack:

| Part | Choice |
|---|---|
| App shell | Tauri 2 (Rust core, system web view) |
| Screens | SvelteKit (static mode) + Svelte 5 + TypeScript |
| Terminal | xterm.js (screen) + Rust `portable-pty` (real shell, real Git) |
| Visualizer | Svelte Flow + ELK layout; data from real Git commands run by Rust |
| Lessons | Markdown (text) + YAML (missions, quizzes) |
| Search | Pagefind |
| Progress | Tauri store plugin (local JSON) |
| Styling | Tailwind CSS + shadcn-svelte; repeated looks as named classes (`@apply`) |
| Tests | Vitest, `cargo test`, mission tests against real Git |
| Code quality | ESLint + Prettier, Clippy + rustfmt |
| Package manager | pnpm |
| Installers | Tauri bundler + GitHub Actions |
| Terminal shell | Git Bash on Windows; system terminal (bash/zsh) on macOS and Linux |
| Updates | Tauri updater: downloads the new version, asks to restart |
| Usage tracking | None in version 1 |
| Git | The student's own installed Git, no bundled Git. Installing Git is taught in the `setup` lesson (Pro Git 1.5). The course targets the latest Git at release time; lessons flag where commands differ from Pro Git's older ones. How the app handles a missing Git: decided later. |

The original comparison follows. Part of writing `SPEC.md` (the "Tech stack" and "System design" sections).

## The question

GitRemastered shows lessons, quizzes, a terminal and a visualizer. The hard part is the terminal: where does Git actually run?

## What we need

| # | Need | Why |
|---|---|---|
| N1 | Real Git, every command | Professional-level course: rebase, reflog, worktrees, hooks, submodules |
| N2 | Reasonable RAM, fast | Terminal + visualizer + text on normal laptops |
| N3 | Easy to develop, errors caught early | Beginner maintainer; readable code |
| N4 | Works on the student's machine | Stated goal |
| N5 | Room for a cloud version later | Run in the browser, no install, from anywhere |

## Options

| # | Option | Real Git? | RAM | Install? | Cost to run | Effort | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | **Desktop, Tauri** (web UI + Rust back end, uses system web view) | ✅ student's Git | ~50–100 MB | Yes, ~10 MB | Free | Medium: small Rust part | ✅ Strong |
| 2 | **Desktop, Electron** (web UI + Node back end, ships its own Chromium) | ✅ student's Git | ~150–300 MB | Yes, ~100 MB | Free | Lowest: one language | ✅ Strong, heavier |
| 3 | **Browser + Git library** (isomorphic-git in JS, or libgit2 compiled to WebAssembly) + browser terminal | ⚠️ Partial: no full `rebase`, no hooks, no real shell; we fake the command line | Low | No | Free (static site) | High: we rebuild Git's command line | ❌ Fails N1 |
| 4 | **Browser + Linux in the browser** (v86 or WebVM: a small virtual PC running real Git) | ✅ | 200 MB+, slow start | No | Free | High, fragile | ❌ Fails N2 |
| 5 | **Browser + cloud machines** (each student gets a small Linux container on our server) | ✅ | Low on student side | No | Server bills grow per student; security work | High: servers, sandboxing, abuse protection | ⏳ Later |
| 6 | **Hybrid: one web UI, two "Git back ends"** (desktop now = option 1 or 2; cloud later = option 5) | ✅ | Like 1 or 2 | Desktop yes, cloud no | Free now | Medium | ✅ Recommended |

### Note on WebAssembly (Rust, C++, Go in the browser)

WebAssembly lets code written in Rust, C++ or Go run in the browser at near-native speed. It does **not** solve our problem: the browser still can't start the real `git` program or a real shell on the student's computer. That rule is a browser security wall, not a speed limit. So WebAssembly only helps options 3 and 4, which fail for other reasons.

### Note on the cloud version as a selling point

Possible, and option 6 keeps the door open. Before charging for it, two checks:

1. **License:** the course content is CC BY-NC-SA (non-commercial). A paid cloud plan that includes the course is likely "commercial use." A free cloud version is fine.
2. **Cost and safety:** every active student uses a container on your server (memory, CPU), and open terminals attract abuse such as crypto mining. This is a separate project with its own spec.

## Recommendation

**Option 6, starting with desktop.**

- The UI (lessons, quizzes, terminal view, visualizer) is a normal web app: Svelte + TypeScript.
- The UI talks to Git through one small interface, a "terminal back end." Version 1 plugs in the local desktop back end. A cloud back end can plug in later without rewriting the UI.
- Desktop shell: Tauri (lighter) or Electron (simpler). Open decision, see below.

## Open decision: Tauri or Electron

| | Tauri | Electron |
|---|---|---|
| RAM | ~50–100 MB | ~150–300 MB |
| Download | ~10 MB | ~100 MB |
| Languages | TypeScript + a little Rust | TypeScript only |
| Terminal support | Works; less ready-made | Very mature (VS Code uses it) |
| Time to build | UI the same. The terminal/back-end part takes longer at first while learning Rust | Fastest start |
| Error catching | TypeScript + Rust's strict compiler | TypeScript |
