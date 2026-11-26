# Coverage: rebasing

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** the plain (non-interactive) rebase: what it does to commits, how it compares with a merge, getting through a conflict, `--onto`, the golden rule, undoing a rebase, and `git pull --rebase`.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 3.6 Rebasing | All of it: The Basic Rebase, More Interesting Rebases, The Perils of Rebasing, Rebase When You Rebase, Rebase vs. Merge |
| Git reference: `git-rebase`, `git-pull`, `git-reset`, `git-reflog`, `git-patch-id` | `--continue`, `--skip`, `--abort`, `--onto`, `<upstream> <branch>`, `--autostash`, `rebase.autoStash`, `--rebase-merges`, `-i` and `--autosquash` (named only), `ORIG_HEAD`, the swapped ours/theirs note, `pull --rebase`, `pull.rebase` |

## Pro Git 3.6, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Two main ways to integrate changes: merge and rebase | Yes, as the opening bridge | Must know |
| Diverged history; a merge makes a three-way merge and a new commit | Recalled from `branch-and-merge` | Must know |
| Rebase takes the change of a commit and reapplies it on another | Yes, explained twice: diagrams (before/after, old commit faded) and real IDs | Must know |
| `git checkout experiment`, `git rebase master` and its output | Yes, with today's command and output and a compare block | Must know |
| How it works: common ancestor, diffs of each commit, reset to the target, apply each change | Yes, as four steps, with the reflog as proof | Under the hood |
| Then go back to `master` and fast-forward | Yes, in the first Try-it and the predict block | Must know |
| The final snapshot equals the merge's; only the history differs | Yes | Must know (Rebase or merge?), Under the hood |
| Linear history: work looks as if done in series | Yes, with the term "linear history" | Must know |
| Use: rebase onto `origin/master` before submitting, so the maintainer fast-forwards | Yes (`git fetch`, `git rebase origin/main`) | Must know |
| Rebase replays changes in order; merge joins the endpoints | Yes | Under the hood |
| `git rebase --onto master server client` | Yes, with real output and before/after diagrams; the hard challenge | Advanced |
| `git rebase <basebranch> <topicbranch>` | Yes | Advanced |
| Delete the branches when everything is integrated | Yes, `git branch -d` in the first Try-it | Must know |
| The golden rule, quoted | Yes | Must know |
| Rebasing abandons commits and creates similar new ones | Yes; the core idea of the lesson | Must know, Under the hood |
| The perils example: a pushed, rebased, force-pushed branch; your pull merges both; duplicate commits in `git log` | Yes, shortened to one branch with one commit, with a diagram and the real doubled log | Must know |
| Pushing that history back reintroduces the abandoned commits | Covered by "do not follow the hint: git pull" | Must know (When it goes wrong) |
| Rebase when you rebase: the patch ID; Git drops commits already rewritten on the target | Yes | Advanced |
| It only works when the copies are almost the same patch | Yes | Advanced |
| `git pull --rebase`, or `git fetch` then `git rebase` | Yes, in words in Must know; the repair case in Advanced | Must know, Advanced |
| `git config --global pull.rebase true` | Yes | Advanced |
| Three cases: never left your computer / pushed but nobody based work on it / pushed and built on | Yes, as a table | Must know |
| Rebase vs. Merge: history as record vs history as story | Yes | Must know |
| Best of both: rebase local changes before pushing, never rebase what you pushed | Yes | Must know |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Interactive rebase (`-i`): reword, squash, reorder, split, `--autosquash`, `--update-refs` | Its own lesson; named here in one paragraph and in the command page table | `clean-up-history` |
| Force-pushing a rebased branch (`--force-with-lease`) | Only "you will need a force push" and where to learn it | `force-push-safely` |
| `filter-branch`, mentioned in the book's "story" view | Not a rebase topic | `remove-sensitive-data` |
| Finding old commits in the reflog in depth, `branch@{1}` syntax | Only the reflog output and a reset to an ID | `revision-selection`, `rescue-lost-work` |
| A botched rebase as an incident | Only undo with `ORIG_HEAD` | `incident-playbook` |
| Rebase as a pull request merge method | Named as a later choice | `pr-merge-strategies` |
| The book's multi-commit perils example with a teammate's merge (C4, C5, C6) | Shortened to one commit; the point is the same | Not needed |
| `--fork-point`, `--keep-base`, `--exec`, `--root`, `--committer-date-is-author-date` | Rare options | Git reference |

## Beyond the book

- `--continue`, `--skip`, `--abort` and the whole conflict walk-through: the book's 3.6 never shows a rebase conflict (Git reference, `git-rebase`).
- The conflict sides are swapped in a rebase (`HEAD`/"ours" is the base, "theirs" is your commit), shown with the markers and `git ls-files -u` (Git reference, `git-rebase`, the note under `--merge`).
- "interactive rebase in progress" in `git status` for a plain rebase, and the `.git/rebase-merge/` folder.
- Why the ID changes, shown with `git cat-file -p` on the old commit and its copy (author kept, committer time new).
- Undo with `git reset --hard ORIG_HEAD`, and the branch reflog as the longer memory.
- "When it goes wrong": unstaged changes, `needs merge` on `--continue`, the rejected push after rebasing a pushed branch, `Current branch … is up to date.`
- `--autostash`, `rebase.autoStash`, `--rebase-merges`, and the two-dot `git log` check before `--onto`.

## Challenges and quiz

- Easy, `menu-on-top-of-main`: `menu` has two commits, `main` has one newer; the student starts on `main` and must switch before rebasing. A merge in either direction fails a goal (`history-is-linear`, or `main` lacking `Add menu`). This is also the starting state of the Try-its, which use `try-hours` and `try-late` and leave `menu` alone.
- Medium, `new-address-clash`: the first of two commits conflicts in `contact.txt`. Goals read the file (`file-contains` the combined line, `file-lacks` both marker kinds) and prove the commit was not skipped. The solution runs `git rebase --continue` with `GIT_EDITOR=true`; the hint tells the student to save and close the editor.
- Hard, `allergens-without-winter`: `allergens` was started from `seasonal`. Needs `git rebase --onto main seasonal allergens` (Advanced), then a fast-forward of `main`. A plain rebase or a merge leaves `Add winter menu` in `allergens` or `main` and fails.
- Quiz: what a rebase changes and what it leaves; which commits are safe to rebase; what to run after resolving; how to undo a finished rebase.
- Console output was captured with Git 2.55 on Windows. Git prints a `Rebasing (1/2)` progress counter that the terminal overwrites; the lesson shows what stays on screen.
