# GitRemastered

Learn Git and GitHub properly, from your first commit to running a team repository.

GitRemastered turns the Pro Git book into an interactive course. Each lesson gives you a short explanation, a terminal with a ready-made repository to practice in, and a live view of what Git is doing inside. Jump to any topic you need, or follow a path from start to finish.

> Status: before the first release. The desktop app and its 73 lessons are built and tested.

## Built on Pro Git

The course follows [Pro Git, 2nd edition](https://git-scm.com/book), by Scott Chacon and Ben Straub. Every lesson links to the book section it comes from, so you can always go back to the source. Topics the book doesn't cover come from the official [Git documentation](https://git-scm.com/docs) and [GitHub Docs](https://docs.github.com), and are marked as such.

## Download

To use the app, download the installer for your system from the [Releases page](https://github.com/mohamedmaghraby20/gitremastered/releases). You don't need this repository for that: it holds the source code, for people who want to change or improve the course.

## What's in this repository

| Folder | What it holds |
|---|---|
| `apps/desktop/` | The desktop app: lesson screens (SvelteKit) and the Rust core (Tauri) |
| `packages/course-engine/` | Course logic the apps share: reads and checks lessons, checks challenge goals |
| `content/` | The course: lessons, learning paths, reference pages |
| `docs/` | Spec, design, course map, lesson writing guide, decisions, roadmap |
| `vendor/progit2/` | The Pro Git source, pinned to one version (a Git submodule) |

How to run and change the app: [CONTRIBUTING.md](CONTRIBUTING.md).

## Get the source code

The book is a submodule, so clone with `--recurse-submodules`:

```
git clone --recurse-submodules https://github.com/mohamedmaghraby20/gitremastered.git
```

Already cloned without it? Run `git submodule update --init` inside the repository.

## License

- Course content (`content/`): [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/), the same license as Pro Git.
- App code: MIT.

See [LICENSE](LICENSE) for details.
