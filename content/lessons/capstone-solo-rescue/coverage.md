# Coverage: capstone-solo-rescue

Capstone 1 of the Pro path (course map 3.12). For course reviewers; the app does not show this file.

**Scope:** a review page and three challenges without hints. It teaches nothing new. It proves graduation outcomes O3 (clean atomic commits), O4 (read and search history, find what broke) and O6 (recover lost work, handle incidents). Local only: no remote, no network, no global setting.

**Sources**

The capstone has no sources of its own. It draws on lessons from five modules, which draw on Pro Git 7.6 Rewriting History, 7.7 Reset Demystified, 7.10 Debugging with Git (bisect), 7.2 Interactive Staging and 10.7 Maintenance and Data Recovery, plus the Git reference where those lessons say so.

## Cheat sheet, table by table

| Table | Lessons it repeats |
|---|---|
| First, look | `incident-playbook` (first steps in any incident) |
| Get lost work back | `rescue-lost-work` (reflog, `git log -g`, `ORIG_HEAD`, deleted branch), `revision-selection` |
| Make clean commits | `commit-craft` (atomic commits), `reset-demystified` (mixed reset), `partial-staging` (`git add -p`) |
| Find the commit that broke something | `search-blame-bisect` (`bisect start`, `bisect run`, `bisect reset`, `log -S`), `reading-history` |
| Take a commit back without rewriting | `revert-a-commit` |
| Take a file out of every commit | `remove-sensitive-data` (rotate first, `filter-repo`, `filter-branch`, `--tag-name-filter cat`, the check) |
| Which undo for which case | `reset-demystified`, `revert-a-commit`, `remove-sensitive-data`, `rescue-lost-work` |

"Under the hood" joins four ideas from those lessons (labels move and commits stay; the three strengths of reset; a rewrite changes every later ID; revert and bisect only add or read) into one order of work. "Advanced" says what a team does after the local rescue and points to `remove-sensitive-data`, `packfiles-gc`, `ignoring-files`, `hooks`, `diffs-in-depth` and `commit-craft` (linked), and to phase 6 lessons named in plain text (see below).

## Left out on purpose

| Point | Why |
|---|---|
| `git fsck`, dropped stashes | Taught in `rescue-lost-work`, tested in `checkpoint-recovery`; no challenge here needs it |
| Interactive rebase (`edit`, `squash`, `fixup`) | Taught in `clean-up-history`, tested in `checkpoint-history-mastery`. Here the mixed commit is always the newest one, so a mixed reset is enough; a student may still use a rebase |
| `git blame`, `git grep` | `search-blame-bisect`; the capstone's search job is a bisect |
| Force push, the clean-up after a rewrite (`refs/original`, reflog expiry, `gc`) | Needs a server, or is not seen by any goal check. "Advanced" names them |
| Merging, conflicts, rebasing | Capstone 2 (`capstone-team-release`) proves O7, O8 and O10 |
| Terminal output | A cheat sheet lists commands; the lessons show the output |

## Challenges and quiz

| Challenge | Level | Outcomes | Lessons it draws on |
|---|---|---|---|
| `friday-commit` | easy | O6, O3 | `rescue-lost-work` (`ORIG_HEAD` or reflog after a hard reset), `reset-demystified` (mixed reset), `commit-craft` (one job per commit), `branches-are-pointers` (a new branch for the second job) |
| `reset-is-not-a-fix` | medium | O6, O4 | `rescue-lost-work` (undo a reset), `search-blame-bisect` (`bisect run`), `revert-a-commit` |
| `monday-rescue` | hard | O3, O4, O6 | `rescue-lost-work` (deleted branch), `remove-sensitive-data` (`filter-branch -- --all` with `--tag-name-filter cat`), `reset-demystified` and `commit-craft` (split the newest commit), `search-blame-bisect`, `revert-a-commit` |

- None has hints, as the checkpoint rule asks.
- `friday-commit`: the two jobs go to two branches so that the goals can prove the split. With HEAD on `main`, "sizes.txt is not in the latest commit" and "main has four commits" show that the fix commit carries only the price change. If the student commits `sizes.txt` nowhere, `working-folder-clean` stays open.
- `reset-is-not-a-fix`: the revert is clean because the bad commit changes line 4 of `rent.sh` and the only later change to that file appends a line at the end. `commit-count-is 9` refuses a history where the bad commit was removed with a rebase or a reset.
- `monday-rescue`: the order is the hard part. Restoring `loyalty` after the rewrite puts the key back on a branch, and `file-is-in-no-commit` stays open until the rewrite runs again. Leaving out `--tag-name-filter cat` leaves the tag on an old commit, and the same goal stays open. `commit-count-is 11` with `history-is-linear` pins the final shape: eight rewritten commits with "Weekend changes" replaced by two, plus the revert.
- Limits of the goals in `monday-rescue`: no check can prove that each of the two new commits holds only its own file when both are on one branch; the goals check the names, the order and that the mixed commit is gone. `friday-commit` proves the split itself. `answer-is-commit` looks at every commit the snapshot holds, so an ID noted before the rewrite may also be accepted; the brief asks for the final ID, and the quiz has a question on exactly this.
- The solutions use `git filter-branch`, which ships with Git, as in `remove-sensitive-data` and `checkpoint-recovery`.

Quiz: four questions. A reset proposed as a fix for a failing test (bisect and revert instead); restoring a deleted branch after a rewrite; an ID noted before a rewrite; splitting an unpushed commit with a mixed reset.

## For the link pass

Plain-text mentions of lessons not committed yet: "the Force-pushing safely lesson" (`force-push-safely`), "the GitHub security lesson" (`issues-projects-security`), "the GitHub Actions lesson" (`github-actions-ci`), "the branch protection lesson" (`branch-protection-codeowners`).
