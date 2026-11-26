---
id: git-restore
command: git restore
group: Undo
summary: Takes a file back out of the staging area, or throws away its unsaved edits.
usage: ["git restore --staged <file>", "git restore <file>"]
bookSection: "2.4 Undoing Things"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things
lessons: [three-areas]
---

`git restore` undoes changes that are not committed yet. It has two jobs, and the flag decides which.

| You type | What happens | Your edits |
|---|---|---|
| `git restore --staged notes.txt` | Takes the file out of the staging area | Kept in the working tree |
| `git restore notes.txt` | Puts the file back as it was in the last commit | **Thrown away** |

`git status` suggests both in its hints, so you rarely need to remember them.

:::careful
`git restore <file>` without `--staged` deletes your unsaved edits to that file. Git cannot bring them back, because they were never committed.
:::

:::compare
today: "`git restore --staged notes.txt` and `git restore notes.txt` (Git 2.23 and later)."
book: "`git reset HEAD notes.txt` and `git checkout -- notes.txt` do the same jobs and still work."
:::
