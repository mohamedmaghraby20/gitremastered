# Coverage: revert-a-commit

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** undoing a commit that is already shared, with `git revert`: the last commit, an older commit, several commits, a revert that stops on a conflict. Pro Git has no section of its own on revert; it appears inside 7.8 "Undoing Merges". The Git reference page for `git-revert` is the main source.

**Sources**

| Source | Sections used |
|---|---|
| Git reference: `git-revert` | Description; `<commit>...`; `-e` / `--edit`, `--no-edit`; `-n` / `--no-commit`; `-m` / `--mainline`; the sequencer subcommands `--continue`, `--skip`, `--abort`; the examples (`HEAD~3`, a range with `-n`) |
| Pro Git 7.8 Advanced Merging, "Undoing Merges" | "Reverse the commit": `git revert -m 1 HEAD`, what mainline means, the trap when merging the branch again, un-reverting the merge; "Fix the references" as a sidenote |
| Git reference: `git-show`, `git-log` | Reading the revert commit |

## Git reference `git-revert`, point by point

| Reference point | In the lesson | Layer |
|---|---|---|
| Revert records new commits that reverse earlier ones | Yes, with a worked example and two graph pairs | Must know |
| The working tree must be clean (no changes from HEAD) | Yes, as the real error for a file the revert touches | Must know (When it goes wrong) |
| Revert is not for throwing away uncommitted changes (`git restore`, `git reset --hard`) | Yes, in the decision table | Must know |
| `<commit>...`: one or more commits; ranges are possible | Yes: several IDs (Must know), a range (Advanced) | Must know, Advanced |
| The editor opens by default; `--no-edit` | Yes, with a Try-it | Must know |
| `-e` / `--edit` | Yes | Advanced |
| `-n` / `--no-commit`: apply to the index and working tree only | Yes, with real `git status` output | Must know |
| `-m parent-number` / `--mainline` for merges | Yes | Advanced |
| "Reverting a merge declares you never want its changes" (later merges bring only newer commits) | Yes, as a careful note with Pro Git's fix | Advanced |
| `--continue`, `--abort` | Yes | Must know (When it goes wrong) |
| `--skip` | Yes | Advanced |
| The message `Revert "…"`, and `Reapply "…"` for a revert of a revert | Yes, both shown with real output | Must know |

## Pro Git 7.8 "Undoing Merges", point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Fix the references: `git reset --hard HEAD~` for a merge only you have | Sidenote only | Advanced; taught in `reset-demystified` |
| Rewriting history is a problem on a shared repository | Yes, as the reason for the whole lesson | Must know |
| Reverse the commit: `git revert -m 1 HEAD` | Yes | Advanced |
| What `-m 1` means: parent 1 is the mainline | Yes | Advanced |
| The reverted commits stay in the history | Yes | Must know, Under the hood |
| Merging the branch again brings only newer changes; un-revert first | Yes | Advanced |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Conflict markers and resolving conflicts in depth | Only the minimum to finish a revert is here | `branch-and-merge`, `advanced-merging` |
| `git reset` as the other way to undo | Its own lesson | `reset-demystified` |
| Pushing, and why a rewritten history is rejected | Needs remotes; one plain line here | `remotes`, `force-push-safely` |
| `-S` (GPG-sign), `--strategy`, `--rerere-autoupdate`, `--cleanup` | Rare; not needed to revert | `signing`, `advanced-merging` |
| Removing a secret from history | Revert cannot do it; pointer only | `remove-sensitive-data` |
| `git stash` for uncommitted changes in the way | Named in one line | `stash-and-clean` |

## Beyond the book

- Almost all of "Must know": Pro Git shows revert only for merges. Reverting ordinary commits, `--no-edit`, `-n`, several commits and the conflict flow come from the Git reference.
- The `Reapply "…"` message is what current Git (2.55 here) writes for a revert of a revert; older Git wrote `Revert "Revert "…""`, which Pro Git still shows.
- `REVERT_HEAD` as the marker of a paused revert (seen in `.git` during a conflict).
- The decision table restore / amend / revert.

## Challenges and quiz

- Easy, `undo-debug-mode`: revert the last commit and keep the history (5 commits, `debug.js` gone).
- Medium, `revert-the-tracker`: revert a commit that has two good commits on top; the later files must stay committed.
- Hard, `revert-with-conflict`: the revert conflicts with a later commit on the same line; fix the file, `git add`, `git revert --continue`. Its hints point to "When it goes wrong".
- Try-its use files the student creates (`banner.txt`, `delivery.txt`, `gifts.txt`, `sundays.txt`), so following the lesson does not solve a challenge.
- Quiz: revert vs. amend vs. restore on a shared commit; what the history looks like after reverting a middle commit; a reverted password is still in history; backing out of a stopped revert.
