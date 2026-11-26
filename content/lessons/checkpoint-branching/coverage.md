# Coverage: checkpoint-branching

The checkpoint of the Branching module. For course reviewers; the app does not show this file.

**Scope:** a review page and three challenges without hints. It teaches nothing new: every row of the cheat sheet repeats something one of the module's five lessons taught, and each challenge needs commands from at least two of them.

**Sources**

The checkpoint has no sources of its own. It draws on the five lessons, which draw on Pro Git 3.1 Branches in a Nutshell, 3.2 Basic Branching and Merging, 3.3 Branch Management, 7.3 Stashing and Cleaning, 7.7 Reset Demystified ("Check It Out") and 10.3 Git References ("The HEAD").

## Cheat sheet, table by table

| Table | Lesson it repeats | Where in that lesson |
|---|---|---|
| Branches are labels | `branches-are-pointers` | Must know: Create a branch, HEAD, See where every branch is; Advanced: Start a branch at an older commit |
| Move between branches | `switch-and-detached-head` | Must know: `git switch`, `-c`, `-`, Two branches, Switching with uncommitted changes, Detached HEAD |
| Join two lines of work | `branch-and-merge` | Must know: fast-forward, merge commit, conflict, resolve, `--abort`, delete a merged branch |
| Keep the branch list short | `branch-management` | Must know: `--merged`, `--no-merged`, `-d`, `-D`, `-m`; When it goes wrong: bring a deleted branch back |
| Put unfinished work away | `stash-and-clean` | Must know: `git stash`, `-u`, `push -m`, `list`, `pop`, `apply`, `drop`, `git clean -n` / `-f` / `-d` / `-x` |

"Under the hood" has one paragraph per lesson, each from that lesson's own Under the hood layer. "Advanced" only points forward: `remotes` and `remote-branches` (written, linked), and the rebasing, advanced-merging and rescue lessons (not written yet, named in plain text).

## Left out on purpose

| Point | Why |
|---|---|
| `git checkout` | The module teaches `git switch`; the older command stays in its lesson's compare block |
| `--no-ff`, `--ff-only`, `--squash`, `merge.conflictStyle` | Advanced material of `branch-and-merge`; no challenge here needs it |
| `git stash branch`, `--keep-index`, `-p` | Advanced material of `stash-and-clean` |
| Terminal output | A cheat sheet lists commands; the lessons show the output |

## Challenges and quiz

| Challenge | Level | Lessons it draws on |
|---|---|---|
| `search-round-trip` | easy | `switch-and-detached-head` (`switch -c`), `branch-and-merge` (fast-forward merge, `branch -d`) |
| `hotfix-while-busy` | medium | `stash-and-clean` (stash, pop), `switch-and-detached-head` (switch, `-c`), `branch-and-merge` (merge), `branch-management` (delete) |
| `merge-day` | hard | `branch-and-merge` (conflict, finish the merge), `branch-management` (`--merged`, `-d`, `-m`) |

- None has hints, as the checkpoint rule asks.
- Limits of the goal checks: they cannot read file content, so `merge-day` passes with any resolution of `hours.txt` that finishes the merge, and `hotfix-while-busy` does not check the text of the fix. `search-round-trip` cannot tell a commit made on the `search` branch from one made directly on `main`; the brief asks for the branch.
- In `hotfix-while-busy`, the goal "The fix is not on reviews" fails when the student commits the fix on `reviews` or merges `main` into it.
- In `merge-day`, the goal "The unfinished newsletter work is not in main" fails when the student merges `wip` to get rid of it.

Quiz: four questions, one each on what `git branch` does and what moves on commit (`branches-are-pointers`), a refused switch and the stash (`switch-and-detached-head`, `stash-and-clean`), fast-forward (`branch-and-merge`), and the `-d` safety check (`branch-management`).
