# Coverage: checkpoint-undo-and-fix

A module checkpoint: a review page with no new material, and three challenges without hints. For course reviewers; the app does not show this file.

**Scope:** the four lessons of the "Undo and fix" module, put side by side so the student practises choosing between them.

**Sources**

| Source | Used through |
|---|---|
| Pro Git 2.4 Undoing Things | `undo-basics`, `fix-last-commit` |
| Pro Git 7.6 Rewriting History, "Changing the Last Commit" | `fix-last-commit` |
| Pro Git 7.8 Advanced Merging, "Undoing Merges"; Git reference `git-revert` | `revert-a-commit` |
| Pro Git 7.7 Reset Demystified | `reset-demystified` |

## Cheat sheet, row by row

| Part of Must know | Rows | Lesson it repeats |
|---|---|---|
| Pick the tool | The decision table | The "Which undo tool, when" tables of `revert-a-commit` and `reset-demystified`, merged, with the "shared?" column made explicit |
| Pick the tool | "Amend before you add commits" | `fix-last-commit`, "Only the last commit" |
| Pick the tool | "Protect uncommitted work before a reset" | `reset-demystified`, `--hard` and the options table |
| `git restore` | `--staged`, plain, `.`, deleted file, staged deletion | `undo-basics`, Must know |
| `git restore` | `--source=<commit>` | `undo-basics`, Advanced |
| `git commit --amend` | `-m`, `--no-edit` after `git add`, editor | `fix-last-commit`, Must know |
| `git commit --amend` | `git rm --cached` then amend | `fix-last-commit`, "Take a file out of the last commit" |
| `git revert` | `HEAD`, an ID, `--no-edit`, `-n`, `--continue` / `--abort` | `revert-a-commit`, Must know |
| `git reset` | The three options, `HEAD~1`, squash, reflog rescue | `reset-demystified`, Must know |
| When it goes wrong | Amended the wrong commit, `--hard` with uncommitted work, reverted a local commit | `fix-last-commit`, `reset-demystified`, `revert-a-commit` |
| Under the hood | Three copies, a commit is never edited, leaving the branch, only committed work comes back, revert goes forward | The Under the hood layers of all four lessons |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Reverting a merge commit (`-m 1`) | Advanced in its lesson, and merges come in the next module | `revert-a-commit`, Advanced |
| Reset with a path, `--keep`, `--merge`, `-p` | Advanced, not needed to choose a tool | `reset-demystified`, Advanced |
| Changing author or date with amend | Advanced | `fix-last-commit`, Advanced |
| The old commands (`git reset HEAD <file>`, `git checkout -- <file>`) | Compare blocks in their lessons | `undo-basics`, `reset-demystified` |
| Console output | A cheat sheet shows commands; each lesson shows the real output | The four lessons |

## Challenges and quiz

No challenge has hints. Each needs at least two of the module's lessons.

| Challenge | Lessons | The wrong tool, and the goal that catches it |
|---|---|---|
| Easy, `tidy-then-fix-the-message` | `undo-basics` (unstage, bring back a deleted file), `fix-last-commit` (message) | Amending while `todo.md` is still staged puts it in the commit: "todo.md is still edited" fails. Staging the deletion of `LICENSE` and amending: "LICENSE is back" fails. A second commit for the message: the commit count fails |
| Medium, `one-shared-one-local` | `fix-last-commit` (message and forgotten file), `revert-a-commit` (older shared commit) | Reverting first puts the revert on top, so the amend hits the revert: either the typo commit stays or the revert commit disappears. Resetting the tracking commit away removes history: the count and "checkout.js" fail |
| Hard, `clear-the-experiments` | `reset-demystified` (drop two local commits, keep uncommitted work), `undo-basics` or plain `rm` (the leftover file), `three-areas` (commit the fix), `revert-a-commit` (shared commit) | `git reset --hard HEAD~2` destroys the staged `hours.txt` fix. Reverting the WIP commits leaves them in history: "Both WIP commits are off the branch" fails. Resetting past the shared commits: the count fails |

Limits of the checks:

- Goals cannot read file content. In the hard challenge, a student who ran `git reset --hard` can retype the `hours.txt` fix by hand and still pass.
- "Shared" is stated in the briefs. These practice projects have no remote, because remotes come two modules later.
- The medium and hard reference solutions name the shared commit as `HEAD~2`; a student will more likely copy its ID from `git log --oneline`.

Quiz: revert for a shared commit; plain restore gives back the staged version; where the work is after `--soft`; amend reaches only the last commit.
