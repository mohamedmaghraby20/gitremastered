---
id: checkpoint-modern-git
title: "Checkpoint: Large repos and modern Git"
module: modern-git
bookSection: "7.11 Submodules"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Submodules
bookSources:
  - vendor/progit2/book/07-git-tools/sections/submodules.asc
  - vendor/progit2/book/07-git-tools/sections/bundling.asc
  - vendor/progit2/book/03-git-branching/sections/basic-branching-and-merging.asc
readFirst: [worktrees, submodules, large-repos]
checkpoint: true
---

Three lessons taught you to work in a second folder, to keep another repository inside yours, and to download less of a big project. Here you prove you can combine them, in three situations a real team runs into, with no hints.

## Must know

This page teaches nothing new. It is the module on one page: the commands worth remembering, one table per lesson, and the lesson to go back to when a row looks unfamiliar. Read it once, then take the challenges below.

A checkpoint is optional. Its challenges mix the lessons, so each one needs commands from at least two of the tables.

### A second folder for another branch

From [Several branches checked out at once](lesson:worktrees).

| Command | Job |
|---|---|
| `git worktree add ../hotfix -b hotfix` | Make a second folder and a new branch, checked out there. Your own folder is not touched |
| `git worktree add ../hotfix -b hotfix main` | The same, with the new branch starting at `main` |
| `git worktree add ../docs docs` | A second folder for a branch that already exists |
| `git worktree list` | Every [worktree](term:worktree): folder, commit, branch. `prunable` marks one whose folder is gone |
| `git -C ../hotfix <command>` | Run one Git command in the other folder without leaving yours |
| `git worktree remove ../hotfix` | Delete the folder and Git's record of it. `--force` when it holds uncommitted or untracked files |
| `git worktree prune` | Delete the records of worktrees whose folder was removed by hand |
| `git branch -d hotfix` | Delete the branch, after its worktree is gone |

A branch can be checked out in one worktree only. The order at the end is always: merge, remove the worktree, delete the branch.

### Another repository inside yours

From [Submodules](lesson:submodules).

| Command | Job |
|---|---|
| `git submodule add <address> [path]` | Clone another repository into a subfolder and record it as a [submodule](term:submodule). Commit `.gitmodules` and the folder's entry |
| `git submodule status` | The commit each submodule is on. A `-` in front means "not downloaded yet" |
| `git clone --recurse-submodules <address>` | Clone the project and fill every submodule |
| `git submodule update --init --recursive` | Fill the submodules of a project you already cloned |
| `git submodule update` | Make the folder match the pointer: after a clone, a pull or a branch switch |
| `git submodule update --remote` | Move the folder to the library's newest commit; then `git add <path>` and commit the new pointer |
| `git diff --submodule` | Show a pointer change as a list of the library's commits |
| `git config submodule.recurse true` | Let `git pull` and `git switch` move the folder with the pointer |
| `git rm <path>` | Remove a submodule; commit the result |

:::careful
After a pull, `modified: vendor/library (new commits)` does not mean you have something to commit. Your folder is behind the pointer. Run `git submodule update`; a `git commit -a` here would undo your teammate's update.
:::

In the practice projects the "servers" are folders, so a submodule command that downloads needs `-c protocol.file.allow=always` right after `git`. With a real address you leave it out.

### Download less of a big project

From [Shallow and partial clone, sparse checkout, LFS, bundles, git maintenance](lesson:large-repos).

| Command | Job |
|---|---|
| `git clone --depth 1 <address>` | A [shallow clone](term:shallow-clone): the newest commit and all its files, no older history |
| `git fetch --unshallow` | Bring in the rest of the history later |
| `git clone --filter=blob:none <address>` | A [partial clone](term:partial-clone): every commit, old file contents only when a command needs them |
| `git sparse-checkout set <folder>` | A [sparse checkout](term:sparse-checkout): the working tree holds that folder and the top-level files only |
| `git sparse-checkout add <folder>` / `list` / `disable` | One more folder; print the list; back to a complete working tree |
| `git bundle create <file> HEAD main` | Pack commits into one file, a [bundle](term:bundle), for when there is no network |
| `git bundle verify <file>` | Check a bundle, and see which commit it needs you to have already |
| `git pull <file> main` | Take a bundle's commits into your branch; `git clone <file>` and `git fetch <file>` work too |
| `git maintenance start` | Keep a large repository you use every day tidy in the background |

Which tool for which problem:

| Problem | Tool |
|---|---|
| A long history, and you only need the current files | Shallow clone |
| A heavy history, and you still want all of `git log` | Partial clone |
| Far too many files, and you work in a few folders | Sparse checkout |
| Big binary files that keep changing | [Git LFS](term:git-lfs) |
| No network between two computers | A bundle |

In the practice projects, `--depth` and `--filter` need `--no-local` as well, because Git ignores them for a folder on your own disk.

### How to read the picture in these challenges

The picture follows the `project` folder only. A linked worktree is a second folder, so it is not drawn; you see the branch it made and every commit made there. A submodule's folder is one sheet, because the main project records one entry for it. After a shallow clone the history map holds a single station, and `git fetch --unshallow` fills in the rest.

## Under the hood

These are the ideas behind the tables. If one of them surprises you, the lesson named beside it explains it with a worked example.

### A worktree is a second place to work, not a copy

There is still one repository. Each worktree has its own files, its own [HEAD](term:head) and its own staging area, kept under `.git/worktrees/<name>/`. Commits, branches, the stash and the settings are shared. That is why a commit made in one folder shows in the other at once, and why Git's record of a worktree outlives a folder you delete by hand. ([Several branches checked out at once](lesson:worktrees))

### A submodule is an address and one commit ID

The main project (the [superproject](term:superproject)) does not store the library's files. `.gitmodules` holds the address, and the folder's entry in each commit holds one commit ID: the pointer, which Git calls a [gitlink](term:gitlink). The library is pinned to that commit until someone moves the pointer and commits it. `git submodule update` checks the pinned commit out by its ID, so a submodule's HEAD is detached. ([Submodules](lesson:submodules))

### Holding less is a note, not damage

A shallow clone lists the commits where its history is cut in `.git/shallow`. A partial clone marks its remote as one that promises to hand over missing file contents later. A sparse checkout keeps every tracked file in the staging area and marks the ones outside your folders as "do not write to disk", so your commits still contain them. In all three, the project on the server is untouched. ([Shallow and partial clone, sparse checkout, LFS, bundles, git maintenance](lesson:large-repos))

### A bundle is a push saved to a file

It holds what a `git push` would send, plus a list of the branches inside and the commits the receiver must already have. That is why `git clone`, `git fetch` and `git pull` accept the file where they would accept a remote. ([Shallow and partial clone, sparse checkout, LFS, bundles, git maintenance](lesson:large-repos))

### One place where the lessons do not mix

The Git reference advises against several worktrees of a project that has submodules: that combination is still marked experimental. Pick one tool per project, or keep the worktrees short-lived.

## Advanced

These tools come back later in the course, mostly where the lessons look inside Git. This is where each one returns.

### Inside the repository

[Packfiles and garbage collection](lesson:packfiles-gc) opens the compressed file that a clone, a fetch and a bundle all carry, and shows what `git gc` and `git maintenance` tidy. [Blobs, trees, commits and how they are stored](lesson:objects-deep) explains the objects a partial clone leaves on the server.

### Big files and history

Git LFS works through a rule in `.gitattributes`, the subject of [Attributes: binary files, line endings, merge drivers](lesson:attributes). Moving big files that are already in the history means rewriting it: [Remove a leaked secret or huge file from history](lesson:remove-sensitive-data).

### Another way to hold someone else's code

A subtree merge puts a library's files and history into a subfolder of your own repository, with no extra commands after a clone. [Hard conflicts, merge strategies and rerere](lesson:advanced-merging) compares it with a submodule.

### In a team

On GitHub, a teammate offers a branch for review as a pull request, which the GitHub lessons teach. A worktree is a calm way to read and run that branch while your own work stays open. Build machines, which test every new version of a project, are where shallow clones are used most.

## Recap

- `git worktree add ../hotfix -b hotfix` gives you a second folder; finish with merge, `git worktree remove`, `git branch -d`. `git worktree prune` clears the record of a folder deleted by hand.
- `git submodule update --init` fills a submodule after a clone; `git submodule update` makes it match the pointer after a pull.
- `git submodule update --remote`, then `git add <path>` and a commit, moves a project to a newer library version.
- `git clone --depth 1` for the newest commit only, `git fetch --unshallow` for the rest; `git sparse-checkout set <folder>` for a smaller working tree.
- `git bundle verify <file>`, then `git pull <file> main`, when commits arrive as a file.
