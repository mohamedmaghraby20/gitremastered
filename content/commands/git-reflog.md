---
id: git-reflog
command: git reflog
group: Recovery
summary: Lists every commit HEAD (or a branch) has pointed at, so you can find commits that no branch reaches any more.
usage: ["git reflog", "git reflog -5", "git reflog show <branch>", "git reflog --date=iso", "git log -g"]
bookSection: "10.7 Maintenance and Data Recovery"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery#_data_recovery
lessons: [rescue-lost-work]
---

`git reflog` prints Git's diary of where HEAD has been, newest first. Every commit, switch, reset, merge and amend adds a line. Commits that a reset or a deleted branch left behind are still listed here, with their IDs.

```console
$ git reflog
ae46b3b HEAD@{0}: reset: moving to HEAD~2
f5ecdac HEAD@{1}: commit: Show search results
ad56200 HEAD@{2}: commit: Add search box
ae46b3b HEAD@{3}: commit: Add checkout
42d5525 HEAD@{4}: commit: Add cart
03afda5 HEAD@{5}: commit (initial): Add README
```

Each line gives the commit ID, the position (`HEAD@{1}` is where HEAD was one move ago), the command that moved HEAD, and the commit message or the target of the move. To rescue, find the line from before the mistake and use its ID:

| You want to… | Run |
|---|---|
| Put a branch on the lost commit and change nothing else | `git branch <name> <id>` |
| Move your branch back to it | `git reset --hard <id>` |
| Bring back a deleted branch | `git branch <old-name> <id>` |

| You type | What it shows |
|---|---|
| `git reflog` | HEAD's diary (short for `git reflog show HEAD`) |
| `git reflog -5` | Only the five newest lines |
| `git reflog show main` | The moves of the branch `main` only, as `main@{0}`, `main@{1}` |
| `git reflog --date=iso` | A date and time on each line in place of the number |
| `git log -g` | The same diary in the long `git log` form, with author and date |
| `git log -g --oneline --grep=<word>` | Only the lines whose commit message contains the word |

The reflog is private to one copy of the project: it is never pushed and never cloned. A line is kept for 90 days, or 30 days when its commit is no longer reachable from the branch. Work that HEAD never stood on, like a dropped stash entry, has no line; `git fsck` finds that.

:::careful
`git reset --hard <id>` overwrites every tracked file. If `git status` shows uncommitted edits, rescue with `git branch <name> <id>`, which touches no file. `git reflog expire --expire=now --all` empties the diary and removes this safety net.
:::
