# Coverage: worktrees

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** having two or more branches checked out at once with `git worktree`: adding a linked worktree, working in it, listing, removing, pruning and locking, and what the worktrees share. The whole lesson is **beyond the book**: Pro Git does not cover `git worktree`. The book section listed in `bookSources` only supplies the problem.

**Sources**

| Source | Sections used |
|---|---|
| Git reference: `git-worktree` (Git 2.55) | Description, Commands (`add`, `list`, `lock`, `move`, `prune`, `remove`, `repair`, `unlock`), Options (`-b`, `--detach`, `--force`, `--reason`, `-n`, `-v`, `--porcelain`), Refs, Configuration File, Details, List Output Format, Bugs |
| Pro Git 3.2 Basic Branching and Merging | The situation only: an urgent hotfix arrives in the middle of other work, and switching needs a clean working state |
| Git reference: `git-rev-parse`, `git-config` | `--git-dir`, `--git-common-dir`; `gc.worktreePruneExpire`, `extensions.worktreeConfig` |

## Pro Git 3.2, the points this lesson uses

| Book point | In the lesson | Layer |
|---|---|---|
| A critical issue arrives while you work on something else | Yes, as the lede and all three challenges | Lede, Must know |
| Git will not let you switch when uncommitted changes conflict; "best to have a clean working state"; ways around it are stashing and amending | Yes, as the problem. The lesson compares stash, a second clone and a worktree in a table | Must know |
| Switching resets the working directory to the branch's last commit | Yes, as the reason one folder shows one branch at a time | Must know |
| Make a `hotfix` branch, fix, merge it into the main branch, delete the branch | Yes, done through a worktree: `add -b`, commit there, `git merge`, `worktree remove`, `branch -d` | Must know |
| Everything else in 3.2 (fast-forward, merge commit, conflicts) | Taught in `branch-and-merge` | Not repeated |

## git-worktree reference, point by point

| Reference point | In the lesson | Layer |
|---|---|---|
| A repository can have several working trees; main and linked worktree | Yes, with a definitions block and a two-folder table | Must know |
| `add <path> -b <new-branch> [<commit-ish>]` | Yes, with real output, a Try-it and the starting point | Must know |
| `add <path> <branch>` for an existing branch | Yes | Must know |
| `add <path>` alone: branch named after the folder | Yes | Advanced |
| `add --detach` / `-d`; a commit-ish that is not a branch detaches | Yes, with the review and long-build uses | Advanced |
| `list`, its columns, `locked` and `prunable` marks, `-v`, `--porcelain` | Yes | Must know (list, prunable), Advanced (`-v`, `--porcelain`, locked) |
| A branch can be checked out in one worktree only | Yes, with the real error, the reason and a quiz question | Must know, Under the hood |
| `remove`; refuses unclean worktrees; `--force`; `-f -f` for locked | Yes | Must know, When it goes wrong, Advanced |
| `prune`; folders deleted by hand; `-n`, `-v`; automatic pruning | Yes | When it goes wrong, Advanced |
| `lock`, `unlock`, `--reason`; portable devices | Yes | Advanced |
| `move`, `repair` | One short paragraph | Advanced |
| The linked worktree's `.git` file and `$GIT_DIR/worktrees/<id>/` (`HEAD`, `index`, `gitdir`, `commondir`) | Yes, with real `cat` and `ls` output | Under the hood |
| Shared: objects, refs, config. Per worktree: HEAD, index, `refs/bisect`, `refs/worktree`, `refs/rewritten` | Yes | Under the hood, Advanced (the three ref folders) |
| `extensions.worktreeConfig`, `git config --worktree` | One line | Advanced |
| Bugs: submodule support incomplete | One line | Advanced |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| How `git stash` works | Only compared as a way out | `stash-and-clean` |
| Merge outcomes and conflicts | The lesson uses a plain fast-forward | `branch-and-merge` |
| Pull requests | Named in one sentence for the review use | the GitHub lessons |
| Submodules | Named once as a limit | `submodules` |
| `add --orphan`, `--track`, `--guess-remote`, `--no-checkout`, `--lock`, `--relative-paths` | Rare options | Git reference |
| Worktrees of a bare repository | A setup choice for power users, not needed for the job | Git reference |
| `main-worktree/HEAD` and `worktrees/<id>/HEAD` ref paths | Plumbing detail | Git reference |

## Beyond the book

All of the lesson. Every command output was produced with Git 2.55 on Windows in a scratch repository. The only edit is the folder prefix, shortened to `C:/practice`.

Things found by running Git that the reference does not spell out:

- `git branch` marks a branch checked out in another worktree with `+`.
- `git branch -D` refuses a branch used by a worktree, just like `-d`.
- The stash is shared between worktrees (it is the ref `refs/stash`).
- On Windows, `git worktree remove` run from inside the folder being removed fails with `Permission denied` (a careful block).
- A fast-forward merge goes through with an uncommitted edit in a file the merge does not touch.

## Challenges and quiz

- Easy, `second-folder`: work in progress on `main`; make the worktree `../hotfix` on a new branch. This is also the starting state of the Try-its, which use `try-fix` and leave the name `hotfix` free.
- Medium, `fix-beside-your-work`: the student is on `sale-banner`, so the new branch needs `main` as its starting point; then fix and commit inside the worktree. Goals fail if `hotfix` starts at `sale-banner` or if the fix lands on `sale-banner`.
- Hard, `ship-and-tidy`: merge, then remove a worktree that is locked and holds an untracked log file (Advanced "Lock a worktree" plus "When it goes wrong"), then delete the branch.
- There is no "worktree is gone" check. `branch-is-missing` stands in for it, because Git refuses to delete a branch that a worktree has checked out (checked with real Git, `-d` and `-D`). One way around remains: detach HEAD inside the worktree, then delete the branch; the worktree would stay.
- `branch-is-merged-into` cannot be used together with `branch-is-missing` on the same branch, so the hard challenge checks the merge with `branch-contains-commit` on `main`.
- Goal checks read the `project` folder only, so the content of `../hotfix/prices.txt` is not checked directly; the commit message on `hotfix` is.
- Quiz: the one-branch rule; shared commits; separate staging areas; a folder deleted by hand and `prune`.
