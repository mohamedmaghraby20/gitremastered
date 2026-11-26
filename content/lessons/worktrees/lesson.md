---
id: worktrees
title: "Several branches checked out at once"
module: modern-git
bookSection: "git-worktree (Git reference, beyond the book)"
bookUrl: https://git-scm.com/docs/git-worktree
bookSources:
  - book/progit2/book/03-git-branching/sections/basic-branching-and-merging.asc
readFirst: [branch-and-merge]
---

You are halfway through a change, with files half-edited, when a bug has to be fixed right now. A worktree gives you a second folder with another branch in it, so you fix the bug there while your unfinished work stays exactly where it is.

## Must know

In [Branch, merge, and fix conflicts](lesson:branch-and-merge) an urgent fix arrived while you were busy, and the story assumed your work was already committed, so you could simply switch branches. Real days are messier: the work is half-done and you do not want to commit it. This lesson is about that moment.

### Three ways out, and why the third is the calm one

So far one folder has shown one branch at a time. When you switch, Git rewrites the files in that folder. That is the root of the problem: your unfinished edits are in the way.

| Way out | What you do | The cost |
|---|---|---|
| [Stash](term:stash) | `git stash`, switch, fix, switch back, `git stash pop` | Your editor, your running program and your test results all lose their place. You must remember to pop |
| A second [clone](term:clone) | `git clone` the project again into another folder | A full second copy of the history. The two copies do not see each other's branches until you push and fetch |
| A worktree | `git worktree add` a second folder for the fix | One short command. Nothing in your first folder is touched |

The lesson [Stash unfinished work, clean the folder](lesson:stash-and-clean) teaches the first way, and it is fine for a two-minute fix. A worktree is better when the other job takes longer, or when you need both versions at the same time, for example to run the old version while you edit the new one.

### What a worktree is

A [worktree](term:worktree) is a folder that holds the files of one branch, connected to a repository. You already have one: your project folder. `git worktree add` makes another, beside it, connected to the same repository.

:::definitions
- term: main worktree
  text: "The folder you got from `git init` or `git clone`. It holds the `.git` directory, which is the repository itself."
  area: working
- term: linked worktree
  text: "An extra folder made by `git worktree add`. It has its own files and its own branch, and uses the repository of the main worktree."
  area: working
- term: checked out
  text: "A branch is checked out in a folder when that folder shows the branch's files and new commits made there go onto that branch. `git switch` checks a branch out."
:::

The common wrong idea is that a worktree is a copy of the project. It is not. There is still one repository, with one set of commits and one set of branches. A worktree is only a second place to look at it and work on it.

A small example. Your project folder is on `main`, with an unfinished edit in `index.html`. After one command there are two folders:

| Folder | Branch checked out | `index.html` |
|---|---|---|
| `project/` | `main` | With your unfinished edit |
| `hotfix/` | `hotfix` | As it is in the last commit, clean |

### The practice project

The terminal opens in the website of a bike shop. It has three commits on `main`, and you are in the middle of writing a sale banner:

```console
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
```

`index.html` is modified and not committed. That is your work in progress, and the whole point of this lesson is that it stays like that.

The first challenge at the end asks for a worktree named `hotfix`, so the Try-its below use a folder and a branch of their own, both named `try-fix`.

### Add a worktree on a new branch

`git worktree add <folder> -b <branch>` tells Git: make this folder, make this new branch, and check the branch out there.

```console
$ git worktree add ../try-fix -b try-fix
Preparing worktree (new branch 'try-fix')
HEAD is now at 9976ad1 Add contact page
```

- `../try-fix` is the folder. `..` means "one level up", so the new folder sits beside your project folder, not inside it.
- `-b try-fix` makes a new branch with that name. It starts at the commit you are on, exactly like `git switch -c`.
- `HEAD is now at 9976ad1` describes the new folder: its files are those of that commit. (Your commit IDs differ from the ones in this lesson.)

:::careful
Put the new folder outside the project folder, as `../try-fix` does. A worktree made inside the project shows up in `git status` as an untracked folder, and it is easy to add it to a commit by accident.
:::

To make the branch start somewhere else, name the starting point at the end: `git worktree add ../try-fix -b try-fix main` starts it at `main`, whatever branch you are on. For a [hotfix](term:hotfix), which must start from the released code, that is the safe way to write it.

:::sidenote
The picture in this app follows the `project` folder only. A linked worktree is a second folder, and it is not drawn. What the picture does show is everything the two folders share: the new branch, and every commit you make on it from either folder.
:::

:::try-it
1. Run `git status`. Git lists `index.html` under "Changes not staged for commit": the unfinished sale banner.
2. Run `git worktree add ../try-fix -b try-fix`. Git prints `Preparing worktree (new branch 'try-fix')`. In the picture, a `branch try-fix` tag appears on the same station as `branch main`. The `HEAD · you` pin does not move, and the `index.html` sheet stays in the working tree: this folder is still on `main`.
3. Run `ls ..`. You see two folders, `project` and `try-fix`.
4. Run `cat ../try-fix/index.html`. The file has one line, the heading. The sale banner is not in it: the new folder holds the committed files, not your unfinished edit.
5. Run `git status` again. Nothing changed here. `index.html` is still modified, and you are still on `main`.
:::

### List your worktrees

`git worktree list` shows every worktree of the repository: the folder, the commit it is on, and the branch.

```console
$ git worktree list
C:/practice/project 9976ad1 [main]
C:/practice/try-fix 9976ad1 [try-fix]
```

The first line is always the main worktree. Run it whenever you have lost track of which folders exist. It works from any of the folders and prints the same list.

`git branch` marks the same thing. `*` is the branch of the folder you are in, and `+` is a branch checked out in another worktree:

```console
$ git branch
* main
+ try-fix
```

### Work in the other folder

A linked worktree is an ordinary working folder. Inside it you run `git status`, `git add` and `git commit` as always, and they act on that folder's branch.

There are two ways to get there:

- `cd ../try-fix` moves your terminal into the folder. In daily work you would rather open the folder in a second terminal or a second editor window, and keep the first one as it is. That is the comfortable part: two windows, two branches.
- `git -C ../try-fix <command>` runs one Git command in that folder without leaving yours. The Try-its use this form, so your terminal stays in `project` and the picture keeps following it.

```console
$ git -C ../try-fix status
On branch try-fix
nothing to commit, working tree clean
```

The same repository, asked from two folders, gives two different answers: `main` with a modified file here, `try-fix` with a clean working tree there.

:::predict
question: "You commit a new file on try-fix, in the folder ../try-fix. Then, in the project folder, you run git log --oneline --all, and you run ls. Does the log show the new commit? Does ls show the new file?"
answer: "The log shows the commit at once, with no push or fetch, because both folders use one repository. ls does not show the file: the project folder shows the files of main, and main does not have that commit yet."
:::

:::try-it
1. Run `echo "Open Monday to Saturday" > ../try-fix/hours.txt`. This makes a new file in the other folder. Run `git status`: the file `hours.txt` is not listed, because it is not in this folder.
2. Run `git -C ../try-fix add hours.txt`, then `git -C ../try-fix commit -m "Add opening hours"`. Git prints `[try-fix f1989c5] Add opening hours`. In the picture, a new station appears with the `branch try-fix` tag on it. The `branch main` tag and the `HEAD · you` pin stay on the station before it.
3. Run `git log --oneline --all`. The commit "Add opening hours" is at the top, although you never committed anything in this folder.
4. Run `ls`. There is no `hours.txt` here: this folder still shows `main`.
5. Run `git status`. `index.html` is still modified. A whole commit was made, and your work in progress was never touched.
:::

```console
$ git log --oneline --all
f1989c5 Add opening hours
9976ad1 Add contact page
69d199e Add price list
825528e Add homepage
```

:::graph
caption: "After the commit in ../try-fix: the branch try-fix moved; main and the project folder did not"
commits:
  - id: A
    message: Add homepage
  - id: B
    message: Add price list
    parents: [A]
  - id: C
    message: Add contact page
    parents: [B]
  - id: D
    message: Add opening hours
    parents: [C]
branches:
  main: C
  try-fix: D
head: main
:::

### One branch, one worktree

A branch can be checked out in only one worktree at a time. Git refuses to check it out in a second one:

```console
$ git switch try-fix
fatal: 'try-fix' is already used by worktree at 'C:/practice/try-fix'
```

The reason is simple. A commit moves the branch it is made on. If two folders had `try-fix` checked out and you committed in one, the other folder's files would silently stop matching its branch. Git prevents that confusion by saying no.

You do not need the branch in two places anyway. Its commits are visible from every worktree, so you can merge it, read its log or compare against it from where you are.

### Add a worktree for a branch that already exists

Leave out `-b`, and name the branch after the folder:

```console
$ git branch docs
$ git worktree add ../docs docs
Preparing worktree (checking out 'docs')
HEAD is now at 9976ad1 Add contact page
```

The words in brackets tell you which case you got: `new branch 'try-fix'` earlier, `checking out 'docs'` now. Use this form for a teammate's branch you fetched, or for a long-lived branch you often need beside `main`.

### Finish: merge, then remove the worktree

When the fix is committed, bring it into `main` from the project folder, the same way as any branch. Then tidy up in two steps: the folder first, the branch second.

```console
$ git merge try-fix
Updating 9976ad1..f1989c5
Fast-forward
 hours.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 hours.txt
$ git worktree remove ../try-fix
$ git branch -d try-fix
Deleted branch try-fix (was f1989c5).
```

`git worktree remove <folder>` deletes the folder and Git's record of it. It prints nothing when it works. The branch and its commits are not touched: removing a worktree only removes a place to work.

The order matters. Git will not delete a branch that a worktree still has checked out, so the worktree goes first.

The merge went through although `index.html` has uncommitted edits. Git only refuses a merge when it would have to change a file you have edited, and this merge touched `hours.txt` alone.

:::try-it
1. Run `git merge try-fix`. Git prints `Fast-forward`. In the picture, the `branch main` tag and the `HEAD · you` pin move onto the "Add opening hours" station, and the `index.html` sheet is still in the working tree, still modified.
2. Run `git branch -d try-fix`. Git refuses: `cannot delete branch 'try-fix' used by worktree at ...`. The folder `../try-fix` still has that branch checked out.
3. Run `git worktree remove ../try-fix`, then `ls ..`. Only `project` is left. The picture does not change, because the folder was never drawn.
4. Run `git branch -d try-fix` again. Now Git prints `Deleted branch try-fix`. In the picture, the `branch try-fix` tag disappears and its station stays.
5. Run `git worktree list`. One line is left, the main worktree.
:::

### When it goes wrong

```console
$ git worktree remove ../docs
fatal: '../docs' contains modified or untracked files, use --force to delete it
```

The folder holds something that is in no commit: an edited file, or a new file such as a log. Removing the folder would lose it, so Git stops. Look first with `git -C ../docs status`. Commit what you need. If the rest can go, run `git worktree remove --force ../docs`.

```console
$ git branch -d gone
error: cannot delete branch 'gone' used by worktree at 'C:/practice/gone'
```

A worktree still has this branch checked out. Remove the worktree first. If you already deleted the folder by hand, in the file explorer or with `rm -r`, Git still has its record, and `git worktree list` marks it:

```console
$ git worktree list
C:/practice/project f1989c5 [main]
C:/practice/gone    f1989c5 [gone] prunable
```

`prunable` means "the folder is gone, only my record is left". `git worktree prune` deletes such records:

```console
$ git worktree prune -v
Removing worktrees/gone: gitdir file points to non-existent location
$ git branch -d gone
Deleted branch gone (was f1989c5).
```

`-v` makes it say what it removed; without it, the command prints nothing. Next time, use `git worktree remove`, which does both jobs.

```console
$ git worktree add ../new -b hotfix
Preparing worktree (new branch 'hotfix')
fatal: a branch named 'hotfix' already exists
```

`-b` always makes a new branch, and that name is taken. To use the branch that exists, leave `-b` out: `git worktree add ../new hotfix`.

:::careful
Run `git worktree remove` from the project folder, not from inside the folder you are removing. On Windows a terminal that stands inside a folder keeps it open, and the removal stops halfway with `Permission denied`.
:::

## Under the hood

Must know showed two folders that share commits and branches but keep their own files. This layer shows where the line between "shared" and "own" runs, and how the second folder finds the repository.

### A file named `.git`, not a folder

In the main worktree, `.git` is a directory: the repository. In a linked worktree, `.git` is a small text file with one line:

```console
$ cat ../try-fix/.git
gitdir: C:/practice/project/.git/worktrees/try-fix
```

It is a signpost. When you run a Git command in `../try-fix`, Git reads this line and goes to that place inside the main worktree's repository.

### What each worktree keeps for itself

That place is a small directory, one per linked worktree:

```console
$ ls .git/worktrees/try-fix
HEAD
ORIG_HEAD
commondir
gitdir
index
logs
refs
```

| File | What it holds |
|---|---|
| `HEAD` | This worktree's own [HEAD](term:head): `ref: refs/heads/try-fix` |
| `index` | This worktree's own [staging area](term:staging-area) |
| `gitdir` | The way back: the path of the linked folder's `.git` file |
| `commondir` | `../..`, the way to the shared repository |

So each worktree has its own HEAD and its own staging area. That is why the two folders can be on different branches, and why `git add` in one folder stages nothing in the other. A merge or rebase that is paused on a conflict is also kept per worktree, so a stuck merge in one folder does not block the other.

### What all worktrees share

Everything else is read from the one repository:

| Shared by every worktree | So |
|---|---|
| [Objects](term:object): every commit and every file version | A commit made in one folder exists for all of them at once. No push, no fetch |
| [Refs](term:ref): branches, tags, remote-tracking branches | A branch made in one folder is listed in the others |
| The stash | `git stash` here, `git stash pop` there works |
| The repository's [settings](term:config) (`.git/config`) | Your name, remotes and other local settings apply everywhere |

You can ask Git for both places:

```console
$ git -C ../try-fix rev-parse --git-dir
C:/practice/project/.git/worktrees/try-fix
$ git -C ../try-fix rev-parse --git-common-dir
C:/practice/project/.git
```

`--git-dir` is the worktree's own corner; `--git-common-dir` is the shared repository.

This also explains the one-branch rule. A branch is a single shared ref. Two worktrees with their own HEAD both pointing at it, and their own staging areas built from it, would disagree as soon as one of them committed.

:::careful
Files that Git ignores are not shared, because they are not in the repository at all. A new worktree has no installed packages (`node_modules`), no build output and no local settings file like `.env`. Expect to install and build once in each worktree.
:::

## Advanced

The daily use is covered: add, work, merge, remove. These are the options for the less common jobs.

### A worktree with no branch: `--detach`

`git worktree add --detach <folder> <commit>` makes a worktree on a commit, not on a branch. It is in the [detached HEAD](term:detached-head) state, which is exactly right when you only want to look or run something.

```console
$ git worktree add --detach ../review HEAD~1
Preparing worktree (detached HEAD 69d199e)
HEAD is now at 69d199e Add price list
```

Two jobs it is made for:

- **Reviewing someone's work.** On GitHub, a teammate offers a branch for review as a pull request (the GitHub lessons teach it). After `git fetch`, run `git worktree add --detach ../review origin/their-branch`, then read and run their code in `../review` while your own work stays open. A detached worktree does not take the branch, so nobody is blocked from checking it out.
- **A long build or test run.** Start the run in a detached worktree at the commit you want to test, and keep editing in your project folder. The run sees a fixed set of files that your edits cannot disturb.

Leaving out `<commit>` uses the commit you are on. Naming a commit that is not a branch, such as `HEAD~1` or a tag, detaches even without `--detach`.

### The short form

`git worktree add ../x-test` with nothing else uses the last part of the path as the branch name. If the branch `x-test` exists, Git checks it out; if not, Git makes it at the commit you are on. It is handy, and a little surprising, so read the line in brackets to see what you got.

### Lock a worktree

`git worktree lock <folder>` protects a worktree from being removed, moved or pruned. It was made for worktrees on a USB disk or a network drive that is not always connected, where a missing folder does not mean "deleted". People also use it to say "hands off, something is running here".

```console
$ git worktree lock --reason "Long test run, do not remove" ../review
$ git worktree list
C:/practice/project f1989c5 [main]
C:/practice/review  9976ad1 (detached HEAD) locked
$ git worktree remove ../review
fatal: cannot remove a locked working tree, lock reason: Long test run, do not remove
use 'remove -f -f' to override or unlock first
```

`git worktree list -v` prints the reason. `git worktree unlock <folder>` takes the lock off; after that, `remove` works as usual. `git worktree remove -f -f` removes a locked worktree in one step, untracked files and all, so use it only when you know the reason no longer holds.

### More about `prune`

- `git worktree prune -n -v` only shows what would be removed (`-n` means "dry run").
- A locked worktree is never pruned, even when its folder is missing.
- Git prunes old records by itself during its regular housekeeping, after about three months (`gc.worktreePruneExpire`). Run `git worktree prune` when you want it done now.

### Moved folders: `move` and `repair`

`git worktree move ../try-fix ../urgent` moves a linked worktree and updates Git's record. If you moved a folder by hand, or moved the main project, the paths in the `.git` file and in `.git/worktrees/` are wrong; `git worktree repair` writes them again.

### For scripts

`git worktree list --porcelain` prints the same information in a fixed form that is easy for a program to read:

```console
$ git worktree list --porcelain
worktree C:/practice/project
HEAD 9976ad1b367ec88f064f91963ca5faf94669443f
branch refs/heads/main

worktree C:/practice/review
HEAD 9976ad1b367ec88f064f91963ca5faf94669443f
detached
```

### Limits

- The Git reference still calls multiple worktrees experimental in one area: projects with submodules (a repository inside a repository, taught in the Submodules lesson). It advises against several worktrees of such a project.
- Settings are shared. A setting for one worktree alone needs `git config extensions.worktreeConfig true` and then `git config --worktree`.
- A few refs are per worktree, not shared: those under `refs/bisect`, `refs/worktree` and `refs/rewritten`. They hold the state of a search or a rebase that belongs to one folder.

## Recap

- A worktree is a second folder with its own branch, HEAD and staging area, on the same repository. Commits, branches, stash and settings are shared.
- `git worktree add ../hotfix -b hotfix` makes the folder and a new branch; without `-b`, name an existing branch. `--detach` makes one with no branch, for a review or a long build.
- `git worktree list` shows them all. A branch can be checked out in only one worktree.
- Finish with `git merge`, then `git worktree remove ../hotfix`, then `git branch -d hotfix`, in that order.
- Deleted the folder by hand? `git worktree prune` clears the leftover record.
