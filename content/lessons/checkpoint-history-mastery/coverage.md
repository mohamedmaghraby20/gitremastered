# Coverage: checkpoint-history-mastery

The checkpoint of the History mastery module. For course reviewers; the app does not show this file.

**Scope:** a review page and three challenges without hints. It teaches nothing new: every row of the cheat sheet repeats something one of the module's five lessons taught, and each challenge needs commands from at least two of them.

**Sources**

The checkpoint has no sources of its own. It draws on the five lessons, which draw on Pro Git 7.1 Revision Selection, 7.2 Interactive Staging, 7.5 Searching, 7.6 Rewriting History, 7.8 Advanced Merging, 7.9 Rerere and 7.10 Debugging with Git.

## Cheat sheet, table by table

| Table | Lesson it repeats | Where in that lesson |
|---|---|---|
| Name any commit | `revision-selection` | Must know: short IDs, `git rev-parse`, `~`, `^2`, reflog names, ranges, `git rev-list --count`; Under the hood: three dots and `--left-right` |
| Clean up your own commits | `clean-up-history` | Must know: the todo list, reword, squash and fixup, drop, edit and split, fixup commits and autosquash, the rule about pushed history |
| Stage part of a file | `partial-staging` | Must know: `git add -p` and its answers, check before you commit, `git restore --staged -p`, `git restore -p` |
| Search, blame and bisect | `search-blame-bisect` | Must know: `git grep`, `git log -S` and `-G`, `git blame -L` and `-w`, `git bisect`; Advanced: `git bisect start <bad> <good>`, `git bisect run` |
| Get through a hard merge | `advanced-merging` | Must know: `--abort`, the base in the markers, `git log --merge`, `--ours` / `--theirs`, the combined diff, `-X` options, take a merge back, rerere |

"Under the hood" has one paragraph per lesson, each from that lesson's own Under the hood layer. "Advanced" only points forward: `rescue-lost-work`, `incident-playbook`, `remove-sensitive-data`, `commit-craft`, `rebasing` and `integrating-work` (linked), and the "Under the hood" module (named in plain text, its lessons are still being written).

## Left out on purpose

| Point | Why |
|---|---|
| `git add -i`, the `e` answer, `git add -N`, `git stash -p` | Rare or Advanced material of `partial-staging`; no challenge here needs it |
| `--exec`, `git range-diff`, `--update-refs`, `--root` | Advanced material of `clean-up-history` |
| `git log -L`, `-C`, `--ignore-rev`, `git bisect skip`, custom terms | Advanced material of `search-blame-bisect` |
| `-s ours`, `git merge-file`, subtree merges, `git rerere forget` | Advanced material of `advanced-merging` |
| Time-based reflog names, `@{u}`, `:/text`, `^@` | Advanced material of `revision-selection` |
| Older commands (`git reset -p`, `git checkout --conflict`) | They stay in their lessons' compare blocks |
| Terminal output | A cheat sheet lists commands; the lessons show the output |

## Challenges and quiz

| Challenge | Level | Lessons it draws on |
|---|---|---|
| `before-it-was-removed` | easy | `search-blame-bisect` (`git log -S`), `revision-selection` (`<id>~1`, `git rev-parse --short`) |
| `split-the-menu-update` | medium | `clean-up-history` (`edit`, `git reset HEAD^`, `git rebase --continue`), `partial-staging` (`git add -p` on a file with two hunks) |
| `the-commit-that-broke-the-bill` | hard | `search-blame-bisect` (`git bisect run`, a bisect across a merge), `advanced-merging` (`git revert -m 1`, reading a merge commit's resolution), `revision-selection` (naming the merge by ID, since it is not HEAD) |

- None has hints, as the checkpoint rule asks.
- `before-it-was-removed`: `git log -S "Student discount"` lists two commits, the one that added the line and "Tidy the price list", which removed it. The answer is the commit before the remover, "Raise the cappuccino price". A student who answers with the remover itself, or with the adder, does not pass.
- `split-the-menu-update`: the two edits are seven unchanged lines apart, so `git add -p` shows two hunks and no split is needed. Limit of the goal checks: file contents are checked only in the latest commit, so the goals prove the names, the order and the final file, not that the first new commit holds the Latte change alone. The brief asks for it.
- `the-commit-that-broke-the-bill`: both branches work alone (`sh bill.sh 1000` prints `Total: 1100`). The merge commit's resolution kept the old variable name `service` in the Total line after `main` had renamed it to `service_charge`; an unset name counts as 0 in shell arithmetic, so the total drops to 1000. Bisect therefore names the merge commit, and a plain `git revert` of it fails with "is a merge but no -m option was given". The goals "Add the WELCOME coupon is still in history", "Close earlier on Mondays is still in history" and the commit count fail when the student resets or rebases instead of reverting. The later commits touch only `prices.txt` and `hours.txt`, so the revert applies without a conflict.
- The hard challenge also passes when the student finds the merge commit without bisect, for example by reading `git log -p bill.sh`; the goals check the result, not the method.

Quiz: four questions. `HEAD~1` against `HEAD^2` on a fresh merge (`revision-selection`, `advanced-merging`); a rebase refused after `git add -p` and `--fixup` (`partial-staging`, `clean-up-history`); bisect naming a merge commit (`search-blame-bisect`, `advanced-merging`); a reflog name for the branch before a squash (`revision-selection`, `clean-up-history`).
