# app

The GitRemastered desktop app: lesson pages, the practice terminal and the visualizer.

It has two halves:

| Folder       | What it is                                       | Language            |
| ------------ | ------------------------------------------------ | ------------------- |
| `src/`       | The screens (SvelteKit, built as static files)   | Svelte + TypeScript |
| `src-tauri/` | The core: window, real shell, Git, files (Tauri) | Rust                |

Tech stack and folder layout are decided in [`SPEC.md`](../SPEC.md). Licensed under MIT (see `LICENSE` at the repo root).

## Run it

First install the tools once: see [`docs/setup.md`](../docs/setup.md).

Then, from this `app/` folder:

```sh
pnpm install      # download the JavaScript libraries (first time, and after package.json changes)
pnpm tauri dev    # open the app in a desktop window; screens reload when you save
```

The first `pnpm tauri dev` compiles the Rust core and takes a few minutes. Later runs are fast.

## Other commands

All run from `app/`.

| Purpose                                           | Command                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| Run all screen tests once                         | `pnpm test`                                                        |
| Re-run screen tests on every save                 | `pnpm test:watch`                                                  |
| Type-check the screens                            | `pnpm check`                                                       |
| Lint and check formatting                         | `pnpm lint`                                                        |
| Fix formatting                                    | `pnpm format`                                                      |
| Build the screens only (static files in `build/`) | `pnpm build`                                                       |
| Rust tests                                        | `cargo test --manifest-path src-tauri/Cargo.toml`                  |
| Rust lint                                         | `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` |
| Rust format                                       | `cargo fmt --manifest-path src-tauri/Cargo.toml`                   |
| Build installers                                  | `pnpm tauri build`                                                 |

## Tests

| Kind             | File name                                               | Runs in                          |
| ---------------- | ------------------------------------------------------- | -------------------------------- |
| Logic            | `name.test.ts` next to `name.ts`                        | Node.js (fast)                   |
| Svelte component | `Name.svelte.test.ts` next to `Name.svelte`             | Headless Chromium (real browser) |
| Rust             | `#[cfg(test)] mod tests` at the bottom of the same file | `cargo test`                     |

Before the first component test run on a new PC, download the test browser once: `pnpm exec playwright install chromium`.

GitHub runs all of these on every push (`.github/workflows/ci.yml`).
