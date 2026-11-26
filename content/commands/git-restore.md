---
id: git-restore
command: git restore
group: Undo
summary: Takes a file back out of the staging area, or throws away its uncommitted edits.
usage: ["git restore --staged <file>", "git restore <file>", "git restore --source=<commit> <file>"]
bookSection: "2.4 Undoing Things"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things
lessons: [three-areas, undo-basics]
---

`git restore` undoes changes that are not committed yet. It has two jobs, and the flag decides which.

| You type | What happens | Your edits |
|---|---|---|
| `git restore --staged notes.txt` | Takes the file out of the staging area | Kept in the working tree |
| `git restore notes.txt` | Puts the file back as it is in the staging area (normally the last commit) | **Thrown away** |

`git status` suggests both in its hints, so you rarely need to remember them:

```console
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   plan.txt

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   app.js
```

:::careful
`git restore <file>` without `--staged` deletes your uncommitted edits to that file. Git cannot bring them back, because they were never committed.
:::

| Option or form | What it does |
|---|---|
| `git restore a.js b.js` | Several files at once |
| `git restore docs/` | Every changed tracked file in a folder |
| `git restore .` | Every changed tracked file in the current folder and below. Discards all unstaged edits |
| `git restore --staged .` | Unstages everything; edits stay |
| `--staged --worktree` (`-SW`) | Unstages and discards in one step: back to the last commit |
| `--source=<commit>` | Copies the file from that commit, for example `--source=HEAD~1` |
| `-p` | Asks about each changed block, so you can discard or unstage part of a file |

It only works on tracked files. For an untracked file, or a file whose deletion is staged, Git answers `error: pathspec '…' did not match any file(s) known to git`. Delete an untracked file yourself; for a staged deletion, run `git restore --staged <file>` first, then `git restore <file>`.

:::compare
today: "`git restore --staged notes.txt` and `git restore notes.txt` (Git 2.23 and later)."
book: "`git reset HEAD notes.txt` and `git checkout -- notes.txt` do the same jobs and still work."
:::
