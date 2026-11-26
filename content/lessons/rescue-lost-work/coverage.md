# Coverage: rescue-lost-work

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** finding and bringing back work that no branch reaches: why it survives, the reflog, the two rescues after `git reset --hard`, a deleted branch, `git fsck` for a dropped stash, `ORIG_HEAD`, the time limits, and what cannot come back. The "Maintenance" and "Removing Objects" parts of Pro Git 10.7 belong to other lessons.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 10.7 Maintenance and Data Recovery | Data Recovery (all of it); from Maintenance, only what garbage collection removes and when auto gc runs |
| Git reference: `git-reflog` | `show`, per-ref reflogs, `expire`, `--date`, `@{n}` and `@{time}` names |
| Git reference: `git-fsck` | dangling vs unreachable, `--unreachable`, `--no-reflogs`, `--lost-found`, `--full` being the default |
| Git reference: `git-gc`, `git-config` | `gc.reflogExpire` (90 days), `gc.reflogExpireUnreachable` (30 days), `gc.pruneExpire` (2 weeks), `--prune=now` |
| Git reference: `git-stash`, `git-reset`, `git-log` | "Recovering stash entries that were cleared/dropped erroneously", `stash apply <commit>`, `stash store`; `ORIG_HEAD`; `log -g` / `--walk-reflogs` |

## Pro Git 10.7 "Data Recovery", point by point

| Book point | In the lesson | Layer |
|---|---|---|
| You lose a commit by force-deleting a branch or by a hard reset | Yes, both as full rescues | Must know (Rescue 1, Rescue 2) |
| Example: hard-reset the branch to an older commit; the top two commits have no branch | Yes, as the practice project's starting state and a graph | Must know |
| The task is to find the newest lost commit's ID and add a branch that points to it | Yes: "find the ID, then put a name on it" | Must know |
| `git reflog`: Git records HEAD every time it changes | Yes, with real output and a table of the line's parts | Must know |
| The reflog is also updated by `git update-ref` | Yes, one sentence | Under the hood |
| `git log -g` shows the reflog as a normal log | Yes, with real output | Must know |
| `git branch recover-branch <id>`; the commits are reachable again | Yes, with the book's branch name, a Try-it and a graph | Must know |
| Simulating "not in the reflog": `git branch -D recover-branch`, `rm -Rf .git/logs/` | Yes, shown with real output; the student is told not to do it on real work | Advanced |
| The reflog data is kept in `.git/logs/` | Yes, with the file's lines | Under the hood |
| `git fsck --full` shows objects not pointed to by another object; "dangling commit" | Yes. Taught with a realistic no-reflog case (a dropped stash) in Must know; the book's command with a today vs. book comparison in Advanced | Must know, Advanced |
| Recover the dangling commit by adding a branch | Yes | Must know (end of Rescue 3) |
| `master` as the branch name | The lesson uses `main` | See below |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Maintenance: `git gc --auto`, loose objects vs packfiles, `gc.auto`, `packed-refs` | Another topic; only "gc removes old unreachable objects" is needed here | `packfiles-gc` |
| Removing Objects: `count-objects`, `verify-pack`, `filter-branch`, `git prune --expire` | Deliberate deletion, the opposite job | `remove-sensitive-data` |
| `master` vs `main` | Explained once in the daily loop module | `three-areas` |
| The full `@{…}` revision syntax | Two examples in Advanced | `revision-selection` |
| Recovering from a bad rebase, a force-push, a wrong-branch commit | Same tools, applied to incidents | `incident-playbook` |
| What a stash entry is made of | Recalled in two sentences | `stash-and-clean` |

## Beyond the book

- The two rescues compared (`git branch <name> <id>` changes nothing; `git reset --hard <id>` moves the branch and overwrites files), with the warning about uncommitted edits.
- `ORIG_HEAD` as the shortcut right after a reset, and its one-slot limit (Git reference, `git-reset`).
- Recovering a dropped stash with `git fsck` and `git stash apply <id>` / `git stash store` (Git reference, `git-stash`).
- The time limits: 90 and 30 days for reflog lines, two weeks for unreachable objects (Git reference, `git-gc`).
- Dangling vs unreachable; `--unreachable`, `--no-reflogs`, `--lost-found`.
- Dangling blobs: content that was staged and never committed (promised in `undo-basics`).
- A branch's own reflog is deleted with the branch; the reflog is local and never cloned.
- "What is really lost": a table that separates stored work from work Git never had.
- `git reflog expire --expire=now --all` and `git gc --prune=now`, as a warning.

## Notes on the console blocks

All output was produced with Git 2.55 in a scratch repository built with the easy challenge's setup, then the Try-it steps in order. `git fsck` was run without a terminal, so the progress line ("Checking object directories") is not in the blocks; the lesson says it appears. The pipeline example in Advanced was run in the hard challenge's starting state.

## Challenges and quiz

- Easy, `bring-back-the-search`: the setup ran `git reset --hard HEAD~2`; the student reads the reflog (or uses `ORIG_HEAD`) and moves `main` forward again. Fast-forwarding with `git merge <id>` also passes.
- Medium, `deleted-gift-cards`: a deleted unmerged branch with two commits, and a newer commit on `main`. The student finds the newest of the two in the reflog, recreates the branch under its old name and switches to it; goals check that `main` stayed as it was.
- Hard, `dropped-coupon-stash`: two dropped stash entries with the same message. The student lists them with `git fsck`, tells them apart with `git show --stat` (Advanced) and applies the right one with `git stash apply <id>`; a goal checks the other entry's change stayed out.
- Try-its use the student's own `ideas.txt`, `banner.html` and branches on top of the easy challenge's starting state, and leave the two search commits unrescued. Every challenge rebuilds the folder.
- Quiz: which loss is final; why a dropped stash is not in the reflog; the reflog is local; which rescue is safe with uncommitted edits.
