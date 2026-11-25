# GitRemastered

Learn Git and GitHub properly, from your first commit to running a team repository.

GitRemastered turns the Pro Git book into an interactive course. Each lesson gives you a short explanation, a terminal with a ready-made repository to practice in, and a live view of what Git is doing inside. Jump to any topic you need, or follow a path from start to finish.

> Status: early. The course map is done; the app is being planned.

## Built on Pro Git

The course follows [Pro Git, 2nd edition](https://git-scm.com/book), by Scott Chacon and Ben Straub. Every lesson links to the book section it comes from, so you can always go back to the source. Topics the book doesn't cover come from the official [Git documentation](https://git-scm.com/docs) and [GitHub Docs](https://docs.github.com), and are marked as such.

## What's in this repository

| Folder | What it holds |
|---|---|
| `content/` | The course: lessons, learning paths, reference pages |
| `app/` | The website: lesson pages, practice terminal, visualizer |
| `book/progit2/` | The Pro Git source, pinned to one version (a Git submodule) |
| `docs/` | The course map and project decisions |
| `tasks/` | Work plans for building the project |

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
