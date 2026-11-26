---
id: git-stash
command: git stash
group: Branching
summary: Puts your uncommitted changes on a shelf and gives you a clean working tree; brings them back later.
usage: ["git stash", "git stash push -u -m \"<message>\"", "git stash list", "git stash pop", "git stash apply", "git stash drop"]
bookSection: "7.3 Stashing and Cleaning"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning
lessons: [stash-and-clean]
---

`git stash` stores work that is not ready for a commit, and puts your files back to how they are in the last commit. You can then switch branches or pull, and take the work back afterwards.

```console
$ git stash
Saved working directory and index state WIP on main: 7d7a300 Add checkout
$ git stash list
stash@{0}: WIP on main: 7d7a300 Add checkout
$ git stash pop
On branch main
Changes not staged for commit:
	modified:   cart.js

Dropped refs/stash@{0} (f74080e9cb19f944bec73043537099bb90c1feab)
```

A plain `git stash` takes staged and unstaged changes to tracked files. New (untracked) files stay behind unless you add `-u`.

| You type | What happens |
|---|---|
| `git stash` | Shelves changes to tracked files (short for `git stash push`) |
| `git stash push -u` | Also shelves untracked files |
| `git stash push -m "Half-done discount"` | Gives the entry a message you can recognise |
| `git stash push -- cart.js` | Shelves only the paths you name |
| `git stash list` | Lists the entries; `stash@{0}` is the newest |
| `git stash show -p` | Shows an entry's changes without taking it out |
| `git stash pop` | Brings the newest entry back and removes it from the shelf |
| `git stash apply` | Brings it back and keeps the entry |
| `git stash pop --index` | Also puts back what was staged as staged |
| `git stash drop` | Deletes one entry without applying it |
| `git stash clear` | Deletes every entry |
| `git stash branch <name>` | Makes a branch where the stash was made and applies it there |

`pop`, `apply`, `show` and `drop` take an entry name, as in `git stash pop stash@{1}`. The shelf is shared by all branches: you can stash on one and pop on another.

If `pop` stops with a conflict, the entry is kept. Fix the file, run `git add` on it, then `git stash drop`.

:::careful
`git stash drop` and `git stash clear` delete uncommitted work without asking. Look first with `git stash show -p`.
:::

:::compare
today: "`git stash push -m \"message\"` (Git 2.13 and later)."
book: "`git stash save \"message\"` is the older form. It still works, but cannot take paths."
:::
