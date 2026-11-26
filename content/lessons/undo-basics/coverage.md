# Coverage: undo-basics

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** undoing changes that are not committed yet: unstaging a file and discarding working-tree edits, with `git restore`. Pro Git 2.4 opens with `git commit --amend`; the course map gives that its own lesson.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 2.4 Undoing Things | Intro (some undos cannot be undone), Unstaging a Staged File, Unmodifying a Modified File, Undoing things with git restore (both subsections) |
| Git reference: `git-restore` | `--staged`, `--worktree`, `--source`, `-p`, pathspecs (`.`, folders), the default source (index for the working tree, HEAD for the index) |
| Git reference: `git-status` | The hints that name the undo commands |

## Pro Git 2.4, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| "You can't always undo some of these undos"; one of the few places Git can lose work | Yes | Must know (careful block, "Discard edits") |
| `git commit --amend`: redo the last commit, forgotten file, message | No | Taught in `fix-last-commit` |
| Amending replaces the commit; only amend local commits | No | Taught in `fix-last-commit` |
| `git status` reminds you how to undo | Yes | Must know ("Find the change first") |
| Staged two files with `git add *`, want two commits: unstage one | Yes, as the lesson's lede, a Try-it and the medium challenge | Must know |
| `git reset HEAD <file>` to unstage | Yes, as the book's older command | Must know (compare block) |
| `git reset` can be dangerous with `--hard`, but this form is safe | Pointer only | Taught in `reset-demystified` |
| After unstaging, the file is modified but unstaged | Yes, with a Try-it | Must know |
| `git checkout -- <file>` to unmodify | Yes, as the book's older command | Must know (compare block) |
| `git checkout -- <file>` / `git restore <file>` is dangerous: local changes are gone | Yes | Must know (careful block) |
| The file is replaced by "the last staged or committed version" | Yes, explained with a predict block and a Try-it | Under the hood |
| Keep changes but get them out of the way: stashing and branching | Pointer only | `stash-and-clean` |
| Anything committed can almost always be recovered; uncommitted work cannot | Yes | Must know; Advanced ("What Git can still recover") |
| `git restore` since Git 2.23 as the alternative | Yes, taught as today's command | Must know |
| `git restore --staged <file>` to unstage | Yes | Must know |
| `git restore <file>` to discard | Yes | Must know |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| `git commit --amend` | Its own lesson | `fix-last-commit` |
| Undoing a commit that was pushed | Its own lesson | `revert-a-commit` |
| `git reset` beyond the old unstage form | Its own lesson | `reset-demystified` |
| `git diff` before discarding | Named, not taught | `diffs-in-depth` |
| `git stash` as the safe alternative to discarding | Named, not taught | `stash-and-clean` |
| `git clean` for untracked files | Named, not taught | `stash-and-clean` |
| Recovering staged-but-uncommitted content (`git fsck --lost-found`) | Rare; named only | `rescue-lost-work` |
| `HEAD~1` and other commit names | Used once in Advanced with a one-line meaning | `revision-selection` |

## Beyond the book

- Several files, a folder, `git restore .` and `git restore --staged .` (Git reference, `git-restore`).
- Restore does not touch untracked files; unstaging a new file leaves it untracked.
- Bringing back a deleted file, and why a staged deletion needs `--staged` first.
- Under the hood: restore's default source is the staging area for the working tree and HEAD for the staging area (Git reference, `git-restore`, `--source`).
- Advanced: `--source=<commit>`, `--staged --worktree`, `-p`.
- Editors' local history as the only rescue for discarded edits.

## Challenges and quiz

- Easy, `discard-debug-line`: discard the edit to `app.js`, keep the `README.md` edit, make no commit. Committing the debug line fails the "no new commit" goal.
- Medium, `unstage-unfinished`: unstage `styles.css` without losing its edit, commit `login.js` alone. Discarding instead of unstaging fails "styles.css still has your edit".
- Hard, `rescue-two-files`: `report.md` is staged as new and deleted from the folder (restore from the staging area; unstaging it would lose the only copy), and `LICENSE` has a staged deletion (unstage, then restore). Needs the copy directions from Under the hood. Committing without restoring `LICENSE` fails its goal.
- Try-its use a separate file (`plan.txt`), which the student commits first. Starting a challenge rebuilds the practice folder, so that extra commit never reaches a challenge.
- Quiz: unstage vs. discard; what cannot be recovered; restore on an untracked file; a file staged and then edited.
