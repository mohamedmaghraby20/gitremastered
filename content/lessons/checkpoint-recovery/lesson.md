---
id: checkpoint-recovery
title: "Checkpoint: Recovery and incidents"
module: recovery
bookSection: "10.7 Maintenance and Data Recovery"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery
bookSources:
  - vendor/progit2/book/10-git-internals/sections/maintenance.asc
  - vendor/progit2/book/07-git-tools/sections/reset.asc
  - vendor/progit2/book/07-git-tools/sections/advanced-merging.asc
  - vendor/progit2/book/07-git-tools/sections/rewriting-history.asc
readFirst: [rescue-lost-work, incident-playbook, remove-sensitive-data]
checkpoint: true
---

Three lessons taught you to find commits that dropped out of the history, to repair a branch after an accident, and to take a file out of every commit. Here you prove you can do it when two of these problems arrive together, in three situations with no hints.

## Must know

This page teaches nothing new. It is the module on one page: the commands worth remembering, one table per lesson, and the lesson to go back to when a row looks unfamiliar. Read it once, then take the challenges below.

A checkpoint is optional. Its challenges mix the lessons, so each one needs commands from at least two of the tables.

### Before any fix

From [Incident playbook](lesson:incident-playbook). These five steps come first every time, and none of them changes anything.

| Step | Command | Job |
|---|---|---|
| 1 | (none) | Stop typing. Nothing gets worse while you read |
| 2 | `git status` | Which branch, is a merge or rebase waiting, are there uncommitted changes |
| 3 | `git log --oneline --graph --all` | Where every branch is now |
| 4 | (a note) | Write down the IDs of where you are and where you want to be |
| 5 | `git branch backup-main` | A [backup branch](term:backup-branch): a second label on today's state |

### Find lost commits and bring them back

From [Recover lost commits with reflog and fsck](lesson:rescue-lost-work).

| Command | Job |
|---|---|
| `git reflog` | List every commit HEAD has stood on, newest first. The line under the mistake is where you were before it |
| `git log -g --oneline --grep=<word>` | Search that list by commit message |
| `git branch <name> <id>` | Put a branch on a lost commit. Nothing else moves |
| `git reset --hard <id>` | Move your branch back onto a lost commit. Overwrites uncommitted edits |
| `git reset --hard ORIG_HEAD` | The same with no ID, when the bad reset, merge or rebase was the last big move |
| `git branch <old-name> <id>` | Bring a deleted branch back: the old name on its newest commit |
| `git fsck` | List dangling commits: the ones no branch, tag or reflog line leads to, like a dropped stash |
| `git stash show -p <id>` | Look inside a dangling stash commit before you trust it |
| `git stash apply <id>` | Bring a dropped stash entry back into your files |

The rule behind every row: find the ID, then put a name on it.

| What was lost | Can it come back? |
|---|---|
| Commits reset away, amended, or on a deleted branch | Yes, through `git reflog`, for about 30 days |
| A dropped stash entry | Yes, through `git fsck`, for at least two weeks |
| Edits never staged, or untracked files that were deleted | No. Git never stored them |

### Repair a branch after an accident

From [Incident playbook](lesson:incident-playbook).

| Incident | Only on your computer | Already pushed |
|---|---|---|
| Commits on the wrong branch, new branch wanted | `git branch <name>`, then `git reset --hard HEAD~N` | Copy them over, then `git revert` them on the wrong branch |
| Commits on the wrong branch, existing branch wanted | `git switch <right>`, `git cherry-pick <id>`, back, `git reset --hard HEAD~N` | The same, with `git revert` in place of reset |
| Rebase went wrong, still running | `git rebase --abort` | |
| Rebase went wrong, finished | `git reset --hard ORIG_HEAD`, or the ID below `rebase (start)` in `git reflog` | Treat it as a force-push accident |
| Merge should not have happened | `git merge --abort` while it runs; `git reset --hard HEAD~` after | `git revert -m 1 <merge>` |
| A force push dropped commits | | Find them on a teammate's computer, merge, push without force |
| A file that should be ignored was committed | `git rm --cached <file>`, add it to `.gitignore`, commit | The same |

:::careful
In the first row the order matters: create the branch first, reset second. And read `git status` before any `git reset --hard`: it overwrites uncommitted edits, the one kind of work Git cannot give back.
:::

### Take a file out of history

From [Remove a leaked secret or huge file from history](lesson:remove-sensitive-data).

| Step | Command | Job |
|---|---|---|
| First, always | (at the service that issued it) | Rotate or revoke the [secret](term:secret). Cleaning Git does not un-leak it |
| Only in the last commit | `git rm --cached <file>`, add it to `.gitignore`, `git add .gitignore`, `git commit --amend --no-edit` | Replace the last commit with one that lacks the file. The file stays on disk |
| Deeper, on a real project | `git filter-repo --invert-paths --path <file>` | Remove the file from every commit of every branch and tag. Installed separately; works in a fresh clone |
| Deeper, with Git alone | `FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --index-filter 'git rm --cached --ignore-unmatch <file>' -- --all` | The same job with the older tool that ships with Git |
| When there are tags | add `--tag-name-filter cat` before the `--` | Move each tag onto its rewritten commit |
| Check | `git log --oneline --all -- <file>` | Lists every commit that still touches the file |
| Clean up your copy | `git update-ref -d refs/original/refs/heads/main`, `git reflog expire --expire=now --all`, `git gc --prune=now` | Delete the backup label, empty the reflog, delete what nothing reaches |
| Update the server | `git push --force --all`, then `git push --force --tags` | Replace the server's branches and tags. Warn the team first; everyone clones again |

:::careful
The clean-up row removes the safety net of the first table: after it, `git reflog` is empty and the old commits are gone for good. Check the new history before you run it.
:::

### How to read the picture in these challenges

A commit that no branch reaches is drawn as a faded, dashed station marked `no branch`, with its short ID. In these challenges that is usually the work you are looking for. When a branch reaches the commit again, its station turns solid. After a rewrite, the old stations stay on the map, faded, beside their replacements. Press "Expand" on the History panel to see every row large.

## Under the hood

These are the ideas behind the tables. If one of them surprises you, the lesson named beside it explains it with a worked example.

### Commits do not change; labels move

A commit is never edited after it is made. `git reset`, `git commit --amend`, `git rebase` and `git branch -D` move or remove a [branch](term:branch), which is a small file holding one commit ID. The commits stay in the repository as [unreachable commits](term:unreachable-commit). So every recovery asks two questions: what is the ID, and which label should point at it? ([Incident playbook](lesson:incident-playbook))

### The reflog is a local diary

Git writes one line to the [reflog](term:reflog) each time [HEAD](term:head) moves, in a text file under `.git/logs/`. Each branch has a diary of its own (`git reflog show main`), and deleting a branch deletes its diary. The reflog is never pushed and never cloned, which is why commits dropped by a force push have to come from a teammate's computer. ([Recover lost commits with reflog and fsck](lesson:rescue-lost-work))

### `ORIG_HEAD` is one slot

Reset, merge and rebase write the branch's old position into the file `.git/ORIG_HEAD` before they move it. It holds one ID, and the next such command overwrites it. The reflog holds the same positions with every earlier one kept. ([`ORIG_HEAD`](term:orig-head) in [Incident playbook](lesson:incident-playbook))

### `git fsck` finds what the reflog cannot

`git fsck` follows every link from every [ref](term:ref) and every reflog line, and reports the objects it never met. A [dangling commit](term:dangling-commit) is the loose end of such a chain. A dropped stash entry is the usual case, because HEAD never stood on it. ([Recover lost commits with reflog and fsck](lesson:rescue-lost-work))

### How long Git keeps things

A reflog line lasts 90 days, or 30 days when its commit is no longer reachable from the branch. Unreachable objects with no reflog line last two weeks. After that, [garbage collection](term:garbage-collection) may delete them. ([Recover lost commits with reflog and fsck](lesson:rescue-lost-work))

### Parent 1 of a merge is where you stood

A [merge commit](term:merge-commit) has two parents: first the commit you were on, second the branch you brought in. `git revert -m 1` keeps the first and takes out what the second contributed. `HEAD~` follows the first parent too. ([Incident playbook](lesson:incident-playbook))

### A rewrite changes every later ID

A commit's ID is computed from its files, its message, its author and the ID of its parent. Take a file out of one old commit and that commit gets a new ID, and so does every commit after it. Commits before it keep theirs. This is [rewriting history](term:rewriting-history), and it is why the server needs a [force push](term:force-push) afterwards. ([Remove a leaked secret or huge file from history](lesson:remove-sensitive-data))

### Three things hold on to the old commits

After `git filter-branch`, the old commits stay until you remove the backup refs under `refs/original/`, the reflog lines, and the unreachable objects themselves. Only branches and tags travel in a push or a clone, so a new clone is clean as soon as those are clean. ([Remove a leaked secret or huge file from history](lesson:remove-sensitive-data))

## Advanced

Recovery leans on what earlier modules taught, and the last modules of the course explain the storage it relies on. This is where each skill comes back.

### Where the tools came from

Every repair in this module is a move you learned earlier, used under pressure. [Reset demystified: the three trees](lesson:reset-demystified) is the tool that moves a branch. [Undo a pushed commit with revert](lesson:revert-a-commit) is the safe undo for shared history. [Rebasing, and when not to](lesson:rebasing) explains what a rebase does to your commits, and so what there is to undo.

### Naming the commit you want

`HEAD@{1}`, `main@{yesterday}` and `HEAD~3` all name commits without an ID. [Point at any commit: HEAD~2, ranges, reflog names](lesson:revision-selection) teaches these names in full; they make most rows of the tables above shorter.

### What Git stores, and when it deletes

The Under the hood module opens the storage this module depends on. [References, HEAD, tags and remotes on disk](lesson:refs-deep) shows the files behind branches, tags and HEAD. [Packfiles and garbage collection](lesson:packfiles-gc) shows what `git gc` does, and when Git runs it by itself.

### On GitHub

A force push to GitHub does not clear forks, cached pages or pull request refs, as the secrets lesson warned. The GitHub lessons later in the course cover the two protections that stop an incident before it starts: rules that refuse a force push to the main branch, and push protection, which refuses a push that contains a known kind of key.

## Recap

- Before any fix: stop, `git status`, `git log --oneline --graph --all`, note the IDs, `git branch backup-<name>`.
- Lost commits: `git reflog`, then `git branch <name> <id>` or `git reset --hard <id>`; `ORIG_HEAD` right after the mistake; `git fsck` for a dropped stash.
- Wrong branch: `git branch <new>` first, then `git reset --hard HEAD~N`.
- Bad merge: `git reset --hard HEAD~` when only you have it; `git revert -m 1 <merge>` when it is pushed or has commits on top.
- Leaked secret: rotate it first. Last commit only: `git rm --cached` and `git commit --amend`. Deeper: `git filter-repo`, or `git filter-branch --index-filter … -- --all` with `--tag-name-filter cat` when there are tags.
