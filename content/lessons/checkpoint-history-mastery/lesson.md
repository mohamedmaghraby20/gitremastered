---
id: checkpoint-history-mastery
title: "Checkpoint: History mastery"
module: history-mastery
bookSection: "7 Git Tools"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Revision-Selection
bookSources:
  - vendor/progit2/book/07-git-tools/sections/revision-selection.asc
  - vendor/progit2/book/07-git-tools/sections/interactive-staging.asc
  - vendor/progit2/book/07-git-tools/sections/rewriting-history.asc
  - vendor/progit2/book/07-git-tools/sections/searching.asc
  - vendor/progit2/book/07-git-tools/sections/debugging.asc
  - vendor/progit2/book/07-git-tools/sections/advanced-merging.asc
  - vendor/progit2/book/07-git-tools/sections/rerere.asc
readFirst: [revision-selection, clean-up-history, partial-staging, search-blame-bisect, advanced-merging]
checkpoint: true
---

Five lessons taught you to name any commit, clean up your own commits, stage part of a file, hunt through history, and get through a hard merge. Here you prove you can combine them, in three situations from a normal working week, with no hints.

## Must know

This page teaches nothing new. It is the module on one page: the commands worth remembering, one table per lesson, and the lesson to go back to when a row looks unfamiliar. Read it once, then take the challenges below.

A checkpoint is optional. Its challenges mix the lessons, so each one needs commands from at least two of the tables.

### Name any commit

From [Point at any commit: HEAD~2, ranges, reflog names](lesson:revision-selection).

| You write | It means |
|---|---|
| `8d9f0fb`, `main`, `v1.0`, `HEAD` | One commit: by short ID (four or more characters), branch, tag, or where you are |
| `git rev-parse --short <name>` | Print the commit a name stands for |
| `HEAD~2` | Two commits back, following the first parent each time |
| `HEAD^2` | The second parent of a merge commit: the branch that was merged in |
| `HEAD@{2}`, `main@{1}` | Where HEAD, or a branch, pointed some moves ago (from the reflog; local only) |
| `main..drinks` | The commits `drinks` has and `main` lacks |
| `main...drinks` | The commits only one of the two has; `--left-right` marks the sides |
| `git rev-list --count <range>` | Count the commits in a range |

`A..B` is a subtraction, not "from A to B": A itself is never in the range.

### Clean up your own commits

From [Reword, squash, reorder, split; fixup and autosquash](lesson:clean-up-history).

| Command | Job |
|---|---|
| `git rebase -i HEAD~3` | Open the todo list for your last three commits, oldest on top |
| `reword` | Keep the commit, write a new message |
| `squash` / `fixup` | Join the commit into the line above; `fixup` drops its message |
| `drop` | Leave the commit out. Deleting its line does the same, with no warning |
| `edit` | Stop at the commit, so you can change it or split it |
| Move a line | Reorder the commits |
| `git reset HEAD^` (at an `edit` stop) | Undo that commit and keep its changes, ready to commit in pieces |
| `git rebase --continue` | Carry on after an `edit` stop or a resolved conflict |
| `git rebase --abort` | Put the branch back as it was before the rebase |
| `git commit --fixup <commit>` | Commit a fix marked for an older commit |
| `git rebase -i --autosquash <base>` | Open the todo list with every fixup already under its target |

:::careful
Every commit from the first changed line on gets a new ID. Clean up only commits that you alone have. For a commit that is already on a shared branch, add a new commit or a revert.
:::

### Stage part of a file

From [Stage part of a file](lesson:partial-staging).

| Command | Job |
|---|---|
| `git add -p` | Walk through your changes hunk by hunk: `y` stages, `n` leaves, `s` splits, `q` stops, `?` explains |
| `git diff --staged` | What the next commit will hold |
| `git diff` | What stays behind in the working tree |
| `git restore --staged -p` | Unstage chosen hunks; your file keeps them |
| `git restore -p` | Discard chosen hunks from your file, for good |

After staging part of a file, commit with plain `git commit`. `git commit -a` would take the hunks you left out as well.

### Search, blame and bisect

From [Search, blame and bisect](lesson:search-blame-bisect).

| Command | Answers |
|---|---|
| `git grep -n <text>` | Where is this text now? Add a commit or tag (`v1.0`) to search that version |
| `git log -S <text>` | Which commits added or removed this text? |
| `git log -G <pattern>` | Which commits changed a line that mentions it? |
| `git blame -w -L 14,20 <file>` | Which commit last changed each of these lines, whitespace changes aside? |
| `git bisect start <bad> <good>` | Begin a search for the commit that broke something |
| `git bisect good` / `git bisect bad` | Report the test result for the commit Git checked out |
| `git bisect run <command>` | Let a command do the testing: exit code 0 is good, 1 to 127 is bad, 125 skips |
| `git bisect reset` | End the search and go back to your branch. Always finish with it |

### Get through a hard merge

From [Hard conflicts, merge strategies and rerere](lesson:advanced-merging).

| Command | Job |
|---|---|
| `git merge --abort` | Back out of a stopped merge |
| `git restore --conflict=diff3 <file>` | Write the conflict markers again, with the base between the two sides |
| `git log --merge --oneline --left-right` | List only the commits, from both sides, that touched the conflicted files |
| `git restore --ours <file>` / `--theirs <file>` | Take one whole side of one file |
| `git diff` (during a merge) | Show your resolution against both sides, before you stage it |
| `git merge -Xours <branch>` / `-Xtheirs` | Let one side win every conflict; everything else is still merged |
| `git merge -Xignore-space-change <branch>` | Do not count whitespace-only changes as changes |
| `git reset --hard HEAD~` | Take back a merge that only you have |
| `git revert -m 1 <merge>` | Take back a merge that others have, with a new commit |
| `git config rerere.enabled true` | Remember each resolution and fill it in when the same conflict returns |

### How to read the picture in these challenges

The history map shows most of what these commands do. After an interactive rebase, the new commits take over the branch label and the ones they replace stay on the map, faded and dashed. During a bisect a banner says "Bisect in progress" and HEAD jumps between stations while `main` stays where it is. A stopped merge or rebase shows a banner too. A partially staged file appears as a sheet in the staging area and a sheet in the working tree at once.

## Under the hood

These are the ideas behind the tables. If one of them surprises you, the lesson named beside it explains it with a worked example.

### Parents, moves and sets

A [revision](term:revision) is any name that leads to a commit. `~` and `^` follow parent links, which are part of the history and the same in every copy. `@{n}` follows the [reflog](term:reflog), your own record of where a name pointed, kept only on your computer. A [range](term:commit-range) is a subtraction: every commit [reachable](term:reachable) from one name, without those reachable from the other. ([Point at any commit](lesson:revision-selection))

### A cleaned-up commit is a new commit

An [interactive rebase](term:interactive-rebase) replays your commits one by one, following the [todo list](term:todo-list). A commit's ID covers its parent's ID, so a change to one commit gives new IDs to every commit after it. The branch label moves only at the very end, which is why `git rebase --abort` is always safe. The old commits stay in the repository for a while, findable through `ORIG_HEAD` and the reflog. ([Reword, squash, reorder, split](lesson:clean-up-history))

### The staging area holds whole files

`git add -p` does not store a list of chosen lines. Git builds a full version of the file, the last commit's content plus the [hunks](term:hunk) you said yes to, and puts that in the staging area. Your working tree is only read. A commit then records the staging area, as always. ([Stage part of a file](lesson:partial-staging))

### Git works the answers out from snapshots

Git stores whole snapshots and no record of who changed which line. [Blame](term:blame) compares a file with its parent's version again and again until each line finds the commit that changed it. A [bisect](term:bisect) is a binary search along the parent links: each answer rules out half of the commits, so a thousand commits need about ten tests. Its whole state is a few refs and a log file in `.git`; no commit or branch is changed. ([Search, blame and bisect](lesson:search-blame-bisect))

### A conflict is three versions side by side

While a merge is stopped, the staging area keeps three copies of each conflicted file: the [merge base](term:merge-base), ours and theirs. The markers, `--ours`, `--theirs` and the [combined diff](term:combined-diff) all read from those three. A merge commit keeps the resolution, and `git show` prints it. [Rerere](term:rerere) stores a conflict's text together with your resolution, so the same clash gets the same answer anywhere. ([Hard conflicts, merge strategies and rerere](lesson:advanced-merging))

## Advanced

The module's skills are the tools of the rest of the course. This is where each one comes back.

### When something is lost

Reflog names and `ORIG_HEAD` are how you get commits back after a rebase or reset you regret. [Recover lost commits with reflog and fsck](lesson:rescue-lost-work) turns that into a method, and the [Incident playbook](lesson:incident-playbook) walks through a botched rebase and a broken merge from start to finish.

### When a secret is in the history

`drop` removes a commit from your own unpushed work. Removing a file from every commit of a long history is a different job with its own tool, taught in [Remove a leaked secret or huge file from history](lesson:remove-sensitive-data).

### In a team

Small commits with one job each are what reviewers ask for. [Commit messages and atomic commits](lesson:commit-craft) explains why, and patch mode and the todo list are how you make them. [Rebasing, and when not to](lesson:rebasing) is the plain replay that the interactive rebase builds on, with the same rule about pushed commits. Ranges such as `main..feature` come back in [Bring in others' work](lesson:integrating-work), to see what a branch would bring in.

### Inside Git

The "Under the hood" module opens up what you used here from the outside: the objects behind a commit ID, the refs behind names such as `HEAD` and `refs/bisect/bad`, and the housekeeping that removes old commits in the end.

## Recap

- `HEAD~2` walks back along first parents, `HEAD^2` is a merge's second parent, `A..B` is what B has and A lacks, and `git rev-parse <name>` shows what any name means.
- `git rebase -i HEAD~N` for commits only you have: `reword`, `squash`, `fixup`, `drop`, `edit`; `git commit --fixup` with `--autosquash`; `git rebase --abort` when stuck.
- `git add -p`, then `git diff --staged`, then plain `git commit`.
- `git log -S <text>` for when a text came or went, `git blame -w -L` for who last changed a line, `git bisect start <bad> <good>` with `git bisect run` for the commit that broke it, then `git bisect reset`.
- In a hard merge: `git merge --abort`, `git restore --conflict=diff3 <file>`, `git diff` before `git add`. Take a shared merge back with `git revert -m 1`.
