# app

The GitRemastered desktop app: lesson pages, the practice terminal and the visualizer.

It has two halves:

| Folder | What it is | Language |
|---|---|---|
| `src/` | The screens (SvelteKit, built as static files) | Svelte + TypeScript |
| `src-tauri/` | The core: window, real shell, Git, files (Tauri) | Rust |

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

| Purpose | Command |
|---|---|
| Build the screens only (static files in `build/`) | `pnpm build` |
| Build the Rust core only | `cargo build --manifest-path src-tauri/Cargo.toml` |
| Type-check the screens | `pnpm check` |
| Build installers | `pnpm tauri build` |

Tests and lint commands arrive in task 3 (full list in `SPEC.md` section 6).
