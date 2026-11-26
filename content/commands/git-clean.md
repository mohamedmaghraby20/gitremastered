---
id: git-clean
command: git clean
group: Undo
summary: Deletes untracked files from your working tree, for good.
usage: ["git clean -n", "git clean -f", "git clean -f -d", "git clean -f -d -x"]
bookSection: "7.3 Stashing and Cleaning"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning#_git_clean
lessons: [stash-and-clean]
---

`git clean` removes files Git does not track: test logs, editor backups, scratch files. Tracked files are never touched, whether they are edited or not.

Always list first with `-n`, then delete with `-f`:

```console
$ git clean -n
Would remove ideas.txt
Would remove output.log
$ git clean -f
Removing ideas.txt
Removing output.log
```

Without `-f`, Git refuses: `fatal: clean.requireForce is true and -f not given: refusing to clean`.

| Option | What it does |
|---|---|
| `-n` | Dry run: lists what would be removed, deletes nothing |
| `-f` | Force: really delete |
| `-d` | Also remove untracked folders |
| `-x` | Also remove ignored files, such as build output |
| `-X` | Remove only ignored files |
| `-i` | Interactive: pick the files in a small menu |
| `-e <pattern>` | Keep files that match the pattern |

Name paths to clean only those: `git clean -f -d tmp output.log`.

:::careful
The files `git clean` deletes were never committed, so no Git command brings them back, and they do not go to the recycle bin. `-x` also deletes ignored files like a `.env` with your local passwords. When unsure, `git stash --all` removes the same files but keeps them in a stash entry.
:::
