# Coverage: clean-up-history

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** changing commits older than the last one with `git rebase -i`: the todo list and its commands (reword, reorder, squash, fixup, drop, edit, exec), splitting a commit, fixup commits with autosquash, and the rule about pushed commits.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 7.6 Rewriting History | The introduction and its note, Changing Multiple Commit Messages, Reordering Commits, Squashing Commits, Splitting a Commit, Deleting a commit |
| Git reference: `git-rebase` | `-i`, the todo commands, `--autosquash`, `--exec`, `--update-refs`, `--root`, `--edit-todo`, `--abort`, `--continue`; `rebase.autoSquash`, `rebase.updateRefs`, `rebase.missingCommitsCheck` |
| Git reference: `git-commit` | `--fixup`, `--squash` |
| Git reference: `git-range-diff` | Comparing a branch before and after a rebase |

## Pro Git 7.6, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| You can rewrite commits to reorder, reword, squash, split or remove them, before you share your work | Yes | Lede, Must know (One tool for every clean-up) |
| Note: do not push until you are happy; treat pushed work as final | Yes | Must know (the first `careful` block; The rule) |
| Changing the Last Commit | No | `fix-last-commit` |
| Git has no modify-history tool; rebase the commits onto the HEAD they were based on | Yes | Must know (One tool for every clean-up) |
| `git rebase -i HEAD~3`: you name the parent of the oldest commit to edit | Yes, with `HEAD~4` | Must know (The todo list) |
| Every commit in the range and its descendants is rewritten; do not include pushed commits | Yes, twice: in words with the IDs of the Try-it, and as a diagram | Must know (Reword; The rule) |
| The todo list and its command help | Yes, with today's real list | Must know (The todo list) |
| The list is in the opposite order of `git log`; it is a script run top to bottom | Yes | Must know (The todo list) |
| Change `pick` to `edit`, `git commit --amend`, `git rebase --continue` to change a message | Yes: taught with `reword`; the book's way is in a `compare` block and at the end of the Edit part | Must know |
| Reordering by moving lines; removing a line removes the commit | Yes | Must know (Reorder and squash; Drop) |
| `squash`: joins into the commit before it and lets you merge the messages | Yes, with the real message template | Must know (Reorder and squash) |
| Splitting: `edit`, `git reset HEAD^`, commit the parts, `git rebase --continue` | Yes, as a worked example with real output | Must know (Edit: stop and split a commit) |
| A `pick` that comes before any change keeps its ID | Yes | Must know (Reword), Under the hood |
| `drop`, or deleting the line | Yes, with a warning about deleted lines | Must know (Drop) |
| Deleting or changing a commit rewrites all that follow; later commits that depend on it can conflict | Yes | Must know (Reword; When it goes wrong) |
| `git rebase --abort` to stop partway | Yes | Must know (Edit; When it goes wrong) |
| `git reflog` to recover after a finished rebase | Yes, with `ORIG_HEAD` first | Under the hood (Where the old commits go) |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| The Nuclear Option: filter-branch (removing a file from every commit, changing emails globally) | Its own lesson, with today's tools | `remove-sensitive-data` |
| Plain `git rebase` onto another branch, and the perils of rebasing | Its own lesson | `rebasing` |
| `HEAD~N`, `HEAD^`, `@{1}`, `:/text` in full | Explained in one line where used | `revision-selection` |
| Staging part of a file (needed to split a commit that changed one file twice) | Pointer only | `partial-staging` |
| Force-pushing a rewritten branch | Pointer only | `force-push-safely` |
| Finding lost commits in depth | `ORIG_HEAD` and a pointer | `rescue-lost-work` |
| `label`, `reset`, `merge` todo commands (`--rebase-merges`) | Rare; they only appear in the help text | Not taught |

## Beyond the book

- `reword` (the book changes messages with `edit` plus amend).
- `fixup`, `git commit --fixup`, `git rebase -i --autosquash`, `rebase.autoSquash`, `--squash`, autosquash without `-i`.
- The editor: the Vim keys needed for a todo list (`i`, `Esc`, `dd`, `p`, `:wq`, `:cq`) and nano through `git -c core.editor=nano`.
- "When it goes wrong": a reorder conflict, unstaged changes, an invalid todo command, `squash` on the first line, a forgotten rebase.
- Under the hood: the reflog of a rebase (start, replay, finish), `.git/rebase-merge/git-rebase-todo`, `ORIG_HEAD`.
- Advanced: `--exec`, `git range-diff`, `--update-refs`, `--root`, `break`, `rebase.missingCommitsCheck`.

## Checked on this machine (Git 2.55)

- Every console block is pasted from one run in a scratch repository. The progress lines `Rebasing (2/4)` are left out: a terminal overwrites them in place.
- Today's todo list prints `pick <id> # <message>`, with a `#` the book's listing does not have.
- `:cq` in Vim was checked by its effect, with an editor that exits with an error: Git prints `error: there was a problem with the editor` and leaves the branch alone.
- The examples in Drop, Edit, `--exec` and `--update-refs` come from a longer version of the same branch, so their IDs differ from the Try-its' IDs. The text says so.
- The squash message editor block shows the top of the template; the status lines under it are cut.

## Challenges and quiz

- Easy, `squash-the-wip`: two WIP commits become one named commit; the file keeps both lines. This is also the starting state of the Try-its, which work on their own branch `try-recipes` with their own four commits and leave `main` alone.
- Medium, `reorder-and-reword`: swap two commits and fix a typo in one message, in one todo list.
- Hard, `fixup-the-menu`: `git commit --fixup`, an autosquash rebase, and `rebase.autoSquash` from Advanced, set with `--local`.
- Hard, `split-the-big-commit`: `edit`, `git reset HEAD^`, two commits, `git rebase --continue`.
- Solutions script the todo list with `GIT_SEQUENCE_EDITOR`; the hints teach the editor way.
- Limit: no goal check reads a file inside an older commit, so `fixup-the-menu` cannot prove the fix sits in "Add menu page" and not in "Add contact page". The brief and the `fixup!` and settings goals steer the student to the intended way.
- Quiz: where a fixup line must sit; which commits get new IDs; a deleted line; pushed commits.
