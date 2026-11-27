# Contributing to GitRemastered

How to run the desktop app, where things live, and the checks every change must pass.

## Where things live

| Folder | What it is | Language |
| --- | --- | --- |
| `src/` | The screens (SvelteKit, built as static files) | Svelte + TypeScript |
| `src-tauri/` | The core: window, real shell, Git, files (Tauri) | Rust |
| `packages/course-engine/` | Course logic with no screens and no Tauri: reads and checks lessons, checks mission goals. Shared with the future website | TypeScript |
| `content/` | The lessons, paths, command pages and glossary | Markdown + YAML |
| `scripts/` | Content checks for lesson writers, design tokens, the review driver | TypeScript |
| `tests/` | Mission and GitHub challenge runners (real Git, real GitHub) | TypeScript |

Tech stack and folder layout: [`docs/SPEC.md`](docs/SPEC.md). How to write a lesson: [`docs/writing-lessons.md`](docs/writing-lessons.md). Design rules: [`docs/DESIGN.md`](docs/DESIGN.md).

## Run it

First install the tools once: see [`docs/setup.md`](docs/setup.md).

Then, from the repository root:

```sh
git submodule update --init   # the Pro Git source, in vendor/progit2 (lesson writers need it)
pnpm install                  # the JavaScript libraries, for the app and the course engine
pnpm tauri dev                # open the app in a desktop window; screens reload when you save
```

The first `pnpm tauri dev` compiles the Rust core and takes a few minutes. Later runs are fast.

## Other commands

All run from the repository root.

| Purpose | Command |
| --- | --- |
| Run all tests once (screens and course engine) | `pnpm test` |
| Re-run screen tests on every save | `pnpm test:watch` |
| Type-check everything | `pnpm check` |
| Lint and check formatting | `pnpm lint` |
| Fix formatting | `pnpm format` |
| Check every lesson file | `pnpm content:check` |
| Check one lesson while writing it | `pnpm lesson:check <lesson-id>` |
| Run every mission with real Git | `pnpm test:missions` |
| Rebuild `src/lib/styles/tokens.css` after editing `docs/design/tokens.json` | `pnpm tokens` |
| Build the screens only (static files in `build/`) | `pnpm build` |
| Rust tests | `cargo test --manifest-path src-tauri/Cargo.toml` |
| Rust lint | `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` |
| Rust format | `cargo fmt --manifest-path src-tauri/Cargo.toml` |
| Build installers | `pnpm tauri build` |

To run a command in the course engine only: `pnpm --filter @gitremastered/course-engine test`.

## Tests

| Kind | File name | Runs in |
| --- | --- | --- |
| Logic | `name.test.ts` next to `name.ts` | Node.js (fast) |
| Svelte component | `Name.svelte.test.ts` next to `Name.svelte` | Headless Chromium (real browser) |
| Rust | `#[cfg(test)] mod tests` at the bottom of the same file | `cargo test` |

Before the first component test run on a new PC, download the test browser once: `pnpm exec playwright install chromium`.

GitHub runs all of these on every push (`.github/workflows/ci.yml`).

## License

App code is MIT ([`LICENSE`](LICENSE)). Course content in `content/` is CC BY-NC-SA 3.0, the same license as Pro Git.
