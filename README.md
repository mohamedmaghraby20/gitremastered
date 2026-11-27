# GitRemastered

Learn Git and GitHub properly, from your first commit to running a team repository.

GitRemastered turns the Pro Git book into an interactive course. Each lesson gives you a short explanation, a terminal with a ready-made repository to practice in, and a live view of what Git is doing inside. Jump to any topic you need, or follow a path from start to finish.

> Status: before the first release. The desktop app and its 73 lessons are built and tested.

## Built on Pro Git

The course follows [Pro Git, 2nd edition](https://git-scm.com/book), by Scott Chacon and Ben Straub. Every lesson links to the book section it comes from, so you can always go back to the source. Topics the book doesn't cover come from the official [Git documentation](https://git-scm.com/docs) and [GitHub Docs](https://docs.github.com), and are marked as such.

## What's in this repository

| Folder | What it holds |
|---|---|
| `src/`, `src-tauri/` | The desktop app: lesson screens (SvelteKit) and the Rust core (Tauri) |
| `packages/course-engine/` | Course logic shared by the app and the future website: reads lessons, checks mission goals |
| `content/` | The course: lessons, learning paths, reference pages |
| `scripts/`, `tests/` | Content checks, design tokens, the review driver; mission and GitHub challenge tests |
| `vendor/progit2/` | The Pro Git source, pinned to one version (a Git submodule) |
| `docs/` | Spec, design, course map, lesson writing guide, decisions, roadmap |

How to run and change the app: [CONTRIBUTING.md](CONTRIBUTING.md).

## Get a copy

The book is a submodule, so clone with `--recurse-submodules`:

```
git clone --recurse-submodules https://github.com/mohamedmaghraby20/gitremastered.git
```

Already cloned without it? Run `git submodule update --init` inside the repository.

## License

- Course content (`content/`): [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/), the same license as Pro Git.
- App code: MIT.

See [LICENSE](LICENSE) for details.
