---
id: checkpoint-branching
title: "Checkpoint: Branching"
module: branching
bookSection: "3 Git Branching"
bookUrl: https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell
bookSources:
  - vendor/progit2/book/03-git-branching/sections/nutshell.asc
  - vendor/progit2/book/03-git-branching/sections/basic-branching-and-merging.asc
  - vendor/progit2/book/03-git-branching/sections/branch-management.asc
  - vendor/progit2/book/07-git-tools/sections/stashing-cleaning.asc
  - vendor/progit2/book/07-git-tools/sections/reset.asc
  - vendor/progit2/book/10-git-internals/sections/refs.asc
readFirst: [branches-are-pointers, switch-and-detached-head, branch-and-merge, branch-management, stash-and-clean]
checkpoint: true
---

Five lessons taught you to create branches, move between them, merge them, tidy them up and put unfinished work away. Here you prove you can do all of it in one go, in three situations from a normal working week, with no hints.

## Must know

This page teaches nothing new. It is the module on one page: the commands worth remembering, one table per lesson, and the lesson to go back to when a row looks unfamiliar. Read it once, then take the challenges below.

A checkpoint is optional. Its challenges mix the lessons, so each one needs commands from at least two of the tables.

### Branches are labels

From [Branches are just pointers](lesson:branches-are-pointers).

| Command | Job |
|---|---|
| `git branch` | List your branches; `*` marks the one you are on |
| `git branch -v` | The same, with the commit each branch points at |
| `git branch <name>` | Create a branch on the commit you are on. You stay where you are |
| `git branch <name> <commit>` | Create a branch on another commit |
| `git log --oneline` | See which commit HEAD and each branch are on, like `(HEAD -> main, testing)` |

### Move between branches

From [Switching branches and detached HEAD](lesson:switch-and-detached-head).

| Command | Job |
|---|---|
| `git switch <branch>` | Move HEAD to the branch and make your files match it |
| `git switch -c <name>` | Create a branch and switch to it in one step |
| `git switch -` | Go back to the branch you were on before |
| `git log --oneline --graph --all` | Draw every branch, so you see where they split |
| `git switch --detach <commit>` | Look at an old commit; HEAD is then detached |
| `git switch -c <name>` (while detached) | Keep the commits you made there, on a new branch |

Git refuses to switch when the switch would overwrite an uncommitted change. Commit the change, discard it, or stash it.

### Join two lines of work

From [Branch, merge, and fix conflicts](lesson:branch-and-merge).

| Command | Job |
|---|---|
| `git merge <branch>` | Bring that branch into the branch you are on. Switch to the receiver first |
| `git merge --no-edit <branch>` | The same, keeping the merge message Git proposes |
| `git status` (during a merge) | Lists the conflicted files under "Unmerged paths" |
| `git add <file>` | Mark a conflicted file as resolved, after you edited it and removed the markers |
| `git commit` | Finish the merge once every conflict is resolved |
| `git merge --abort` | Give up and go back to before the merge |
| `git branch -d <branch>` | Delete a branch you have merged |

The three outcomes of a merge:

| Situation | Result |
|---|---|
| Only the other branch has new commits | Fast-forward: your label moves forward, no commit is made |
| Both branches have new commits, in different places | A merge commit with two parents |
| Both changed the same lines | A conflict: Git stops and waits for you |

### Keep the branch list short

From [List, delete and rename branches](lesson:branch-management).

| Command | Job |
|---|---|
| `git branch --merged main` | Branches whose work is already in `main`: safe to delete |
| `git branch --no-merged main` | Branches that still hold work `main` lacks |
| `git branch -d <name>` | Delete a merged branch; refuses an unmerged one |
| `git branch -D <name>` | Delete even when unmerged. Its commits are left with no branch |
| `git branch -m <new>` | Rename the branch you are on |
| `git branch -m <old> <new>` | Rename another branch |
| `git branch <name> <id>` | Bring a deleted branch back, with the ID from "Deleted branch … (was …)" or `git reflog` |

### Put unfinished work away

From [Stash unfinished work, clean the folder](lesson:stash-and-clean).

| Command | Job |
|---|---|
| `git stash` | Shelve your uncommitted changes to tracked files; the working tree is clean afterwards |
| `git stash -u` | The same, and new (untracked) files too |
| `git stash push -m "note"` | Shelve with a message you will recognise later |
| `git stash list` | See the shelf; `stash@{0}` is the newest entry |
| `git stash pop` | Bring the newest entry back and remove it from the shelf |
| `git stash apply` | Bring it back and keep the entry |
| `git stash drop` | Throw one entry away |
| `git clean -n` | List the untracked files `git clean` would delete |
| `git clean -f` | Delete them for good; `-d` adds folders, `-x` adds ignored files |

:::careful
Three commands in this module throw work away with no undo: `git clean -f` (files Git never had), `git stash drop` and `git stash clear` (shelved work). `git branch -D` is milder: the commits stay findable for a while, but nothing points at them.
:::

### How to read the picture in these challenges

The history map helps most in this module. `main` keeps the top row. A branch with commits of its own runs on a row below, and a merge commit joins the rows again. Press "Expand" on the History panel to see every row large. Stashed work sits on the "Stash" shelf above the desk, and a merge that stopped shows a banner with the next step.

## Under the hood

These are the ideas behind the tables. If one of them surprises you, the lesson named beside it explains it with a worked example.

### A branch is one small file

A [branch](term:branch) is a file under `.git/refs/heads/` that holds one commit ID. Creating a branch writes that file; deleting a branch removes it. No commit is copied or deleted either way. ([Branches are just pointers](lesson:branches-are-pointers))

### HEAD says where you are

[HEAD](term:head) normally names a branch (`ref: refs/heads/main`). A commit moves the branch HEAD names, and only that one. When HEAD holds a commit ID instead, it is a [detached HEAD](term:detached-head): commits you make there belong to no branch until you give them one. ([Switching branches and detached HEAD](lesson:switch-and-detached-head))

### A merge compares three commits

Git finds the [merge base](term:merge-base), the last commit both branches share, and compares each branch against it. A change made on one side only is taken as it is. The same lines changed on both sides give a [merge conflict](term:merge-conflict). A [merge commit](term:merge-commit) is an ordinary commit with two parents. ([Branch, merge, and fix conflicts](lesson:branch-and-merge))

### "Merged" means reachable

A branch is merged into `main` when its newest commit is part of `main`'s history. That is all `git branch --merged` and the `-d` safety check look at. ([List, delete and rename branches](lesson:branch-management))

### A stash entry is a commit no branch points at

`git stash` stores your changes as commits kept under `refs/stash`, outside every branch. That is why one shelf serves all branches, and why the history map does not draw them as history. ([Stash unfinished work, clean the folder](lesson:stash-and-clean))

## Advanced

Branching is the base for most of what follows in the course. This is where each skill comes back.

### With a server

In the Remotes module your branches get partners on a server. [Remote and tracking branches](lesson:remote-branches) shows how a local branch follows `origin/main`, and [Work with remotes: fetch, pull, push](lesson:remotes) shows that `git pull` is a fetch followed by the merge you practised here, conflicts included.

### In a team

The lessons on team workflows use short-lived branches the way the first challenge below does: one branch per job, merged and deleted when the job is done. Pull requests on GitHub are a merge with a review in front of it.

### When history needs reshaping

Rebasing is the other way to bring two lines of work together, and the lesson [Rebasing, and when not to](lesson:rebasing) compares it with merging. The harder cases of merging are in "Hard conflicts, merge strategies, subtree merges, rerere".

### When something is lost

A branch deleted with `-D`, or commits made on a detached HEAD, stay in the reflog for a while. The lesson [Recover lost commits with reflog and fsck](lesson:rescue-lost-work) turns the rescue you saw in this module into a method.

## Recap

- `git switch -c <name>` starts a line of work; `git switch <branch>` and `git switch -` move between lines.
- `git merge <branch>` brings a branch into the one you are on: fast-forward, merge commit, or a conflict you resolve with edit, `git add`, `git commit`.
- `git branch --merged main`, then `git branch -d <name>`: delete what is finished. `git branch -m <old> <new>` renames.
- `git stash` (with `-u` for new files) shelves half-done work; `git stash pop` brings it back, on any branch.
- `git clean -n` before `git clean -f`, every time.
