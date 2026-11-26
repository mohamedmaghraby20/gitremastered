# Coverage: checkpoint-recovery

The checkpoint of the Recovery and incidents module. For course reviewers; the app does not show this file.

**Scope:** a review page and three challenges without hints. It teaches nothing new: every row of the cheat sheet repeats something one of the module's three lessons taught, and each challenge needs commands from at least two of them.

**Sources**

The checkpoint has no sources of its own. It draws on the three lessons, which draw on Pro Git 10.7 Maintenance and Data Recovery, 7.7 Reset Demystified, 7.8 Advanced Merging ("Undoing Merges") and 7.6 Rewriting History ("The Nuclear Option: filter-branch"), plus the Git reference and GitHub Docs where those lessons say so.

## Cheat sheet, table by table

| Table | Lesson it repeats | Where in that lesson |
|---|---|---|
| Before any fix | `incident-playbook` | Must know: First steps in any incident |
| Find lost commits and bring them back | `rescue-lost-work` | Must know: `git reflog`, `git log -g`, Rescue 1 (branch, reset, `ORIG_HEAD`), Rescue 2 (deleted branch), Rescue 3 (`git fsck`, `git stash show -p`, `git stash apply`), What is really lost |
| Repair a branch after an accident | `incident-playbook` | Must know: Recipes 1 to 5, The playbook on one page |
| Take a file out of history | `remove-sensitive-data` | Must know: rotate first, last commit (amend), `git filter-repo`, `git filter-branch`, clean-up, force push; Advanced: Tags need one more option; When it goes wrong: `git log --oneline --all -- <file>` |

"Under the hood" has eight short paragraphs, each from the lesson named beside it (mostly its Under the hood layer). "Advanced" only points to other lessons: `reset-demystified`, `revert-a-commit`, `rebasing`, `revision-selection`, `refs-deep` and `packfiles-gc` (all written, linked), and the GitHub lessons on branch rules and push protection (named in plain text).

## Left out on purpose

| Point | Why |
|---|---|
| `git fsck --unreachable`, `--no-reflogs`, `--lost-found`, `git stash store` | Under the hood and Advanced material of `rescue-lost-work`; no challenge here needs it |
| `git branch -f`, re-merging after a reverted merge, the amend variant of Recipe 5 | Advanced material of `incident-playbook` |
| The force-push recovery steps in detail | Needs a server and a teammate; the challenges here have no remote. The table keeps the one-line recipe |
| `--prune-empty`, `--tree-filter`, `--replace-text`, huge-file measuring with `git count-objects` | Advanced material of `remove-sensitive-data` |
| Terminal output | A cheat sheet lists commands; the lessons show the output |

## Challenges and quiz

| Challenge | Level | Lessons it draws on |
|---|---|---|
| `reset-too-far` | easy | `rescue-lost-work` (find the commits a reset left behind: `ORIG_HEAD` or `git reflog`), `incident-playbook` (Recipe 1: branch first, then reset) |
| `password-on-the-wrong-branch` | medium | `incident-playbook` (Recipe 1), `remove-sensitive-data` (secret in the last commit: `git rm --cached`, `.gitignore`, amend) |
| `secret-and-a-deleted-branch` | hard | `rescue-lost-work` (Rescue 2: a deleted branch from the reflog), `remove-sensitive-data` (`git filter-branch … -- --all`, and `--tag-name-filter cat` from Advanced) |

- None has hints, as the checkpoint rule asks. No challenge uses a remote, a network or a global setting.
- `reset-too-far` has other right answers, such as `git branch wishlist <id>` with the ID from the reflog, then `git reset --hard <ID of "Add checkout">`. All reach the goals.
- `password-on-the-wrong-branch`: the goal "No commit that a branch reaches contains mail-password.txt" stays open while `main` still holds the commit, and while `mail` holds the commit before the amend. The replaced commit stays in the reflog; the check does not count it, and the second quiz question is about exactly that. No goal can prove the file is still on disk (`file-exists` does not count ignored files); the brief asks for it.
- `secret-and-a-deleted-branch`: the order is the hard part. A student who rewrites first and restores `coupons` from the reflog afterwards puts the old commits, secret included, back on a branch; the `file-is-in-no-commit` goal stays open until they run the rewrite again (with `-f`, as "When it goes wrong" in `remove-sensitive-data` says). Leaving out `--tag-name-filter cat` leaves the tag on an old commit, and the same goal stays open. The goals do not ask for the local clean-up (`refs/original`, reflog, `gc`): the check does not look at those, as in the lesson's own challenges.

Quiz: four questions. `ORIG_HEAD` overwritten after a bad rebase (`incident-playbook`, `rescue-lost-work`); a secret commit reset away but still in the reflog (all three lessons); undoing a pushed merge (`incident-playbook`); the clean-up after a rewrite removes the rescue tools (`remove-sensitive-data`, `rescue-lost-work`).
