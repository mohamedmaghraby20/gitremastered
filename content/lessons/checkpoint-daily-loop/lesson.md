---
id: checkpoint-daily-loop
title: "Checkpoint: Your daily loop"
module: daily-loop
bookSection: "2 Git Basics"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository
bookSources:
  - vendor/progit2/book/02-git-basics/sections/getting-a-repository.asc
  - vendor/progit2/book/02-git-basics/sections/recording-changes.asc
  - vendor/progit2/book/02-git-basics/sections/viewing-history.asc
readFirst: [start-a-repo, three-areas, ignoring-files, remove-move-files, reading-history, diffs-in-depth]
checkpoint: true
---

You have learned the commands of a normal working day, one lesson at a time. Real work mixes them: here you prove you can start a project, keep it tidy and find things in its history, with no hints.

## Must know

This page teaches nothing new. It is the module on one screen: the commands worth remembering from each lesson, and the lesson to go back to when one has slipped. Read it through, then try the three challenges at the end.

A checkpoint is optional, and its challenges give no hints. If you get stuck, the table for that skill names the lesson that explains it.

### Start a project

From [Start or clone a repository](lesson:start-a-repo).

| Command | Job |
|---|---|
| `git init -b main` | Turn the current folder into an empty repository whose first branch is `main` |
| `git clone <address>` | Copy a whole repository, history included, into a new folder |
| `git clone <address> .` | The same, into the current empty folder |
| `git status` | Also the quick test: "is this folder a repository?" |

### Status, stage, commit

From [Status, stage, commit: the three areas](lesson:three-areas).

| Command | Job |
|---|---|
| `git status` | Show where each change is, with hints for the next step |
| `git status -s` | One line per file: left column staging area, right column working tree |
| `git add <file>` | Stage the file as it is right now, new or changed |
| `git add .` | Stage every change in this folder and below; look at `git status` first |
| `git commit -m "message"` | Record the staging area as one commit |
| `git commit -a -m "message"` | Stage every change to tracked files and commit; new files stay out |
| `git restore --staged <file>` | Take a file back out of the staging area; your edits stay |

The rule that explains most surprises: a commit records what you staged, as it was when you staged it. Edit after `git add`, and you must add again.

### Ignore files

From [Ignore files with .gitignore](lesson:ignoring-files).

| Line in `.gitignore` | Matches |
|---|---|
| `*.log` | Every file ending in `.log`, in any folder |
| `build/` | A folder named `build`, with everything in it |
| `/TODO` | `TODO` in the top folder only |
| `!keep.log` | Brings back one file an earlier line ignored |

| Command | Job |
|---|---|
| `git check-ignore -v <file>` | Say which line of which file ignores it |
| `git rm --cached <file>` | Stop tracking a file that is already committed; it stays on disk |

Two things to remember: commit the `.gitignore` itself, and it only affects files Git does not track yet.

### Remove and rename

From [Remove and rename tracked files](lesson:remove-move-files).

| Command | Job |
|---|---|
| `git rm <file>` | Delete the file and stage the deletion |
| `git rm --cached <file>` | Stage the deletion, keep the file on disk |
| `git rm -r <folder>` | Remove a folder and everything in it |
| `git mv <old> <new>` | Rename (or move) a file and stage it |
| `git add <old> <new>` | Finish a rename you made with plain `mv` or in your editor |

A deletion or a rename is a change like any other: nothing is recorded until you commit it.

### Read the history

From [Read the commit history](lesson:reading-history).

| Command | Job |
|---|---|
| `git log` | List commits, newest first; `q` leaves the pager |
| `git log --oneline` | One line per commit |
| `git log -3` | Only the last three |
| `git log --stat` | Each commit with the files it changed |
| `git log -p` | Each commit with its changed lines |
| `git show <id>` | One commit with its changes |
| `git log --author="Omar"` | Commits by one author |
| `git log --since="2 weeks ago"` | Commits newer than a date; `--until` for older |
| `git log --grep="typo"` | Commits whose message contains a text |
| `git log -S "applyDiscount"` | Commits that added or removed a text in the files |
| `git log -- <path>` | Commits that touched one file or folder |

Filters stack. Options come first, the path comes last, after `--`.

### Read a diff

From [Read any diff: working, staged, between commits](lesson:diffs-in-depth).

| Command | Compares |
|---|---|
| `git diff` | Working tree against staging area: what you have not staged |
| `git diff --staged` | Staging area against last commit: what the next commit will hold |
| `git diff HEAD` | Working tree against last commit: everything since then |
| `git diff <older> <newer>` | Two commits |
| `git diff HEAD~1 HEAD` | The last commit against the one before it |
| `git diff --stat` | A summary: files and line counts |
| `git diff --name-only` | Only the file names |
| `git diff <...> -- <file>` | Any of the above, for one file |

In the output, `-` is an old line, `+` a new line, and a line starting with a space is unchanged context.

### The loop, in order

1. `git status` to see what changed.
2. `git diff` to read the changes.
3. `git add` the changes that belong together.
4. `git diff --staged` to check what the commit will hold.
5. `git commit -m "..."`.
6. `git log --oneline` to see it in the history.

### When it goes wrong

The three messages this module's commands print most often:

- `fatal: not a git repository (or any of the parent directories): .git`. You are in a folder with no repository. `cd` into the project, or create one with `git init`.
- `nothing added to commit but untracked files present`. Nothing was staged. Run `git add` first.
- `fatal: pathspec '...' did not match any files`. Git found no file with that name. Check the spelling with `git status`.

## Under the hood

The ideas behind the commands, a few lines each.

### Three copies of every file

Git can hold three versions of a file at once: in the working tree, in the staging area and in the last commit. `git status` and the three `git diff` forms only compare these copies. That is why one file can be listed as staged and as changed at the same time.

### A commit is a snapshot

A commit stores the whole project as the staging area describes it, with a message, an author, a date and the ID of the commit before it. Its ID is a checksum of all that. Git computes a diff when you ask for one; it does not store diffs.

### Git stores no renames and no deletions

A deletion is a commit whose snapshot lacks the file. A rename is a commit where the same content sits under another name; Git notices it by comparing content. Older commits still hold the old file, so a file you deleted, or a secret you stopped tracking, is still in the history.

### `.gitignore` only filters untracked files

Git checks the patterns when it looks for new files. A file that is already tracked stays tracked, whatever `.gitignore` says.

### Log walks backwards

`git log` starts at the commit you are on and follows each commit's link to the one before it. That is why the newest commit is on top.

## Advanced

Where this module's skills come back later in the course:

- **Undo.** `git restore` throws away edits and unstages files, and `git commit --amend` repairs the last commit. Start with [Unstage and discard changes](lesson:undo-basics).
- **Branches.** `git log --oneline --graph --all` draws several lines of work at once, and `git diff` compares branches the way it compares commits. Start with [Branches are just pointers](lesson:branches-are-pointers).
- **Remotes.** `git clone` gave you a remote named `origin`; fetching, pulling and pushing keep the two copies in step. See [Work with remotes: fetch, pull, push](lesson:remotes).
- **Commit craft.** One job per commit and a clear message is a habit you already practise here. The lesson [Commit messages and atomic commits](lesson:commit-craft) goes deeper.

## Recap

- `git init -b main` or `git clone <address>` to get a repository.
- `git status`, `git add <file>`, `git commit -m "..."`: the loop you repeat all day.
- `git diff` before staging, `git diff --staged` before committing.
- `.gitignore` for files that never belong in Git; `git rm --cached` for one that slipped in.
- `git rm` and `git mv` for deletions and renames; `git log --oneline` and `git show <id>` to look back.
