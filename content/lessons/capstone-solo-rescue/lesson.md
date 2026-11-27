---
id: capstone-solo-rescue
title: "Capstone: Rescue a messy repository"
module: capstones
bookSection: "7 Git Tools"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History
bookSources:
  - vendor/progit2/book/07-git-tools/sections/rewriting-history.asc
  - vendor/progit2/book/07-git-tools/sections/reset.asc
  - vendor/progit2/book/07-git-tools/sections/debugging.asc
  - vendor/progit2/book/07-git-tools/sections/interactive-staging.asc
  - vendor/progit2/book/10-git-internals/sections/maintenance.asc
readFirst: [commit-craft, search-blame-bisect, rescue-lost-work, remove-sensitive-data]
checkpoint: true
---

One day you open a repository and several things are wrong at once: commits are missing, a test fails and nobody knows since when, and a key sits in the history. Here you prove you can put such a repository right, alone and with no hints, using skills from the whole course.

## Must know

This page teaches nothing new. It gives you the situation, then one cheat sheet of the commands this capstone needs, each with the lesson to go back to when a row looks unfamiliar. Read it once, then take the challenges below.

### The situation

You work on a small project for a bike rental shop: a few shell scripts and text files. The script `rent.sh` prints the price of a rental. In the three challenges the repository is in a worse state each time:

| Challenge | What went wrong | What you prove |
|---|---|---|
| Easy | A commit that did two jobs was thrown away by a reset | You can get lost work back and record it as clean commits |
| Medium | A panic reset dropped five commits, and one of them holds a bug | You can restore a branch, find the commit that broke a test, and take back only that one |
| Hard | A deleted branch, a key in the history, a commit that did two jobs and a failing test, all at once | You can do all of it in one repository, in an order that works |

A capstone differs from a module checkpoint in one way: the commands come from many modules, and nobody tells you which module a problem belongs to. Deciding that is part of the job.

Nothing here uses a network. Every challenge says "nothing was pushed" or "your teammates have these commits": that sentence decides whether you may rewrite history, so read the brief for it.

### First, look

From [Incident playbook](lesson:incident-playbook). These steps change nothing, and they come before any fix.

| Command | Job |
|---|---|
| `git status` | Which branch you are on, whether an operation is waiting, whether there are uncommitted changes |
| `git log --oneline --graph --all` | Where every branch and tag is now |
| `git reflog` | Where HEAD was before: the commits a reset or a deleted branch left behind |
| `git branch backup-main` | A [backup branch](term:backup-branch): a second label on today's state, before you move anything |

### Get lost work back

From [Recover lost commits with reflog and fsck](lesson:rescue-lost-work) and [Point at any commit: HEAD~2, ranges, reflog names](lesson:revision-selection).

| Command | Job |
|---|---|
| `git reflog` | List every commit HEAD has stood on, newest first. The line under the mistake is where you were before it |
| `git log -g --oneline --grep=<word>` | Search that list by commit message |
| `git reset --hard ORIG_HEAD` | Move your branch back to where it was before the last reset, merge or rebase |
| `git reset --hard <id>` | Move your branch onto any commit you found. Overwrites uncommitted edits |
| `git branch <old-name> <id>` | Bring a deleted branch back: the old name on its newest commit |

### Make clean commits

From [Commit messages and atomic commits](lesson:commit-craft), [Reset demystified: the three trees](lesson:reset-demystified) and [Stage part of a file](lesson:partial-staging).

An [atomic commit](term:atomic-commit) does one job, so it can be reviewed, moved to another branch or taken back on its own.

| Command | Job |
|---|---|
| `git show --stat HEAD` | See which files a commit changed, to judge whether it does one job |
| `git reset HEAD~1` | Take the newest commit apart: the branch moves back one commit, and the changes stay in your files, unstaged |
| `git add <file>`, then `git commit -m "…"` | Record one job. Repeat for the next job |
| `git add -p <file>` | Stage only some of a file's changes, when two jobs touched the same file |
| `git switch -c <name>` | Start a new branch here, for the job that must not go to `main` yet |

:::careful
`git reset HEAD~1` and `git reset --hard HEAD~1` differ by one word. The first keeps the changes in your files. The second removes them from your files too, and you need the reflog to get them back. Use them on commits nobody else has.
:::

### Find the commit that broke something

From [Search, blame and bisect](lesson:search-blame-bisect) and [Read the commit history](lesson:reading-history).

| Command | Job |
|---|---|
| `git bisect start <bad> <good>` | Start a [bisect](term:bisect): a search that halves the commits between a bad one (often `HEAD`) and a good one (often a tag) |
| `git bisect run sh <test-script>` | Let a script judge each commit: [exit code](term:exit-code) 0 means good, 1 means bad. Git prints the first bad commit |
| `git rev-parse --short refs/bisect/bad` | Print the short ID of the first bad commit, while the bisect is still open |
| `git bisect reset` | End the bisect and go back to the branch you were on |
| `git show <id>` | Read what the bad commit changed |
| `git log -S <text> --oneline` | List the commits that added or removed a text, such as the name of a key |

### Take a commit back without rewriting

From [Undo a pushed commit with revert](lesson:revert-a-commit).

| Command | Job |
|---|---|
| `git revert <id>` | Add a new commit that undoes one earlier commit. Later commits stay, and no ID changes |
| `git revert --no-edit <id>` | The same, keeping the message Git proposes: `Revert "<the old message>"` |

### Take a file out of every commit

From [Remove a leaked secret or huge file from history](lesson:remove-sensitive-data).

| Step | Command | Job |
|---|---|---|
| First, always | (at the service that issued it) | Rotate or revoke the [secret](term:secret). Cleaning Git does not un-leak it |
| On a real project | `git filter-repo --invert-paths --path <file>` | Remove the file from every commit of every branch and tag. Installed separately; works in a fresh clone |
| With Git alone | `FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --index-filter 'git rm --cached --ignore-unmatch <file>' -- --all` | The same job with the older tool that ships with Git. The challenges here work with it |
| When there are tags | add `--tag-name-filter cat` before the `--` | Move each tag onto its rewritten commit |
| Check | `git log --oneline --all -- <file>` | Lists every commit that still touches the file. After `git filter-branch` it still lists the old commit, through the backup refs under `refs/original`; `git log --oneline --branches --tags -- <file>` leaves those out and should print nothing |

### Which undo for which case

Three of the tables above undo something. This is how to choose.

| The commit is… | And you want to… | Use |
|---|---|---|
| Only on your computer | Redo it as better commits | `git reset HEAD~1`, then commit again |
| Shared with teammates | Cancel what it did | `git revert <id>` |
| Anywhere, and it holds a secret | Make it as if the file never existed | Rotate the secret, then rewrite with `git filter-repo` or `git filter-branch` |
| Gone from every branch | Have it back | `git reflog`, then `git branch` or `git reset --hard` |

### How to read the picture in these challenges

A commit that no branch reaches is drawn as a faded, dashed station marked `no branch`, with its short ID. Here that is usually the work you are looking for. When a branch reaches the commit again, its station turns solid. After a rewrite, the old stations stay on the map, faded, beside their replacements. Press "Expand" on the History panel to see every row large.

## Under the hood

The tables list the tools one by one. A rescue goes well when you also know how they affect each other, and that comes down to four ideas you already met.

### Labels move, commits stay

`git reset` and `git branch -D` move or remove a [branch](term:branch), which is a label on one commit. The commits stay in the repository as [unreachable commits](term:unreachable-commit), and the [reflog](term:reflog) lists their IDs for about 30 days. So lost work is a question of finding an ID and putting a name on it. `ORIG_HEAD` is a shortcut for one such ID: where the branch was before the last reset, merge or rebase. ([Recover lost commits with reflog and fsck](lesson:rescue-lost-work))

### Reset has three strengths

`git reset` always moves the branch. What differs is how much comes along. With `--soft` nothing else changes, so the old commit's changes are still staged. With no option (mixed), the staging area is reset too, and the changes sit in your files, unstaged: the right state for splitting a commit. With `--hard` your files are reset as well. ([Reset demystified: the three trees](lesson:reset-demystified))

### A rewrite gives new IDs to everything after it

A commit's ID is computed from its files, its message, its author and the ID of its parent. Take a file out of one old commit and that commit gets a new ID, and so does every commit after it. Commits before it keep theirs.

:::graph
caption: "payment-key.txt is removed from B. B and C become new commits B' and C'; A is unchanged. The old B and C stay, faded, until Git cleans up"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add card payment
    parents: [A]
    faded: true
  - id: C
    message: Charge for the helmet
    parents: [B]
    faded: true
  - id: B'
    message: Add card payment
    parents: [A]
  - id: C'
    message: Charge for the helmet
    parents: [B']
branches:
  main: C'
head: main
:::

Two things follow for a rescue:

- An ID you wrote down before the rewrite names an old commit afterwards. Find the commit that broke the test after the rewrite, or find it again by its message.
- The rewrite reaches only commits that a branch or a tag leads to at that moment. A deleted branch is not among them. Bring it back first; if you bring it back afterwards, it sits on the old commits, secret included.

([Remove a leaked secret or huge file from history](lesson:remove-sensitive-data))

### Revert and bisect only add or read

`git bisect` checks out one commit after another and changes none of them. `git revert` adds one commit on top. Neither changes an existing ID, so both are safe on shared history, and both can come last in a rescue. ([Search, blame and bisect](lesson:search-blame-bisect), [Undo a pushed commit with revert](lesson:revert-a-commit))

### An order that works

Put together, the ideas give an order for a repository with several problems:

1. Look, and make a backup branch.
2. Bring back what was lost, while the reflog still shows it clearly.
3. Do the rewrites: first the one that reaches all branches (removing a file), then the small ones (splitting a commit).
4. Search the final history for the bad commit.
5. Add the fix on top, with a revert.

## Advanced

The challenges end when the repository is clean on your computer. On a real team the incident is only half over then. This is what comes next, and where the course teaches it.

### The secret is still leaked

Removing a file from history does not make a key secret again. If the repository was ever pushed, assume the key was copied. The first real step is [secret rotation](term:secret-rotation): replace the key at the service that issued it, so the old one stops working. [Remove a leaked secret or huge file from history](lesson:remove-sensitive-data) explains why this comes before any Git command.

### Tell the team before you push a rewrite

After a rewrite the server still has the old commits, and it refuses an ordinary push. Replacing them needs a [force push](term:force-push), and every teammate then has to clone again or reset onto the new history. Warn them first, and agree on a moment. The Force-pushing safely lesson shows `--force-with-lease`, which refuses to overwrite work a teammate pushed in the meantime.

### Clean your own copy

Your computer keeps the old commits through backup refs, the reflog and the objects themselves. [Remove a leaked secret or huge file from history](lesson:remove-sensitive-data) lists the three clean-up commands, and [Packfiles and garbage collection](lesson:packfiles-gc) explains what `git gc` deletes and when.

### Stop the next one

Each problem in this capstone has a guard that makes it rarer:

- A key file committed by mistake: list it in [.gitignore](lesson:ignoring-files), and add a pre-commit hook that refuses known key patterns ([Hooks and enforced policies](lesson:hooks)). GitHub's push protection, in the GitHub security lesson, refuses a push that contains a known kind of key.
- A commit that did two jobs: read `git diff --staged` before every commit ([Read any diff: working, staged, between commits](lesson:diffs-in-depth)).
- A bug nobody noticed for five commits: run the test on every push. The GitHub Actions lesson shows how.
- A reset or a deletion on the main branch of the server: branch rules on GitHub refuse it, in the branch protection lesson.

### Write it down

A short incident note helps the next person: what happened, which commit was bad (the ID in the new history), what was reverted, and which key was rotated. The revert commit's message is a good place for the reason; [Commit messages and atomic commits](lesson:commit-craft) shows how to write a body.

## Recap

- Look first: `git status`, `git log --oneline --graph --all`, `git reflog`, then `git branch backup-<name>`.
- Lost commits: `git reset --hard ORIG_HEAD` or an ID from `git reflog`; a deleted branch comes back with `git branch <name> <id>`.
- A commit that did two jobs, not pushed: `git reset HEAD~1`, then one `git add` and `git commit` per job.
- A broken test: `git bisect start <bad> <good>`, `git bisect run sh <script>`, `git bisect reset`, then `git revert <id>`.
- A secret in history: rotate it, restore deleted branches, then `git filter-branch --index-filter … --tag-name-filter cat -- --all` (or `git filter-repo`). Every later commit gets a new ID, so search and note IDs afterwards.
