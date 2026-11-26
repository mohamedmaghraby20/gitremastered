---
id: switch-and-detached-head
title: "Switching branches and detached HEAD"
module: branching
bookSection: "3.1 Branches in a Nutshell"
bookUrl: https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell#_switching_branches
bookSources:
  - book/progit2/book/03-git-branching/sections/nutshell.asc
  - book/progit2/book/07-git-tools/sections/reset.asc
readFirst: [branches-are-pointers]
---

You are halfway through a new feature when someone reports a bug in the released version. You need the released files back on your disk right now, without losing the half-done feature. Switching branches does exactly that, and this lesson also covers the one state that scares people while they do it: the detached HEAD.

## Must know

In [Branches are just pointers](lesson:branches-are-pointers) you saw that a [branch](term:branch) is a label on a commit, and that [HEAD](term:head) names the branch you are on. You made a branch with `git branch`, but you stayed where you were. The missing piece is moving: making another branch the one you are on.

### Move to a branch with `git switch`

`git switch <branch>` tells Git: I want to work on this branch now.

It does two things, always together:

1. It moves HEAD to that branch. From now on, new commits go to it.
2. It makes your [working tree](term:working-tree) and [staging area](term:staging-area) match that branch's newest commit. Files are added, changed or removed on your disk.

The second point surprises people. Your project folder is one folder, and it shows one branch at a time. When you switch, Git rewrites the folder to show the other branch.

```console
$ git switch ideas
Switched to branch 'ideas'
```

Nothing is lost by this. Every file of the branch you left is safe in its commits, and comes back when you switch back.

### Create a branch and switch to it in one step

Most of the time you make a branch because you want to work on it at once. `git switch -c <name>` does both: `-c` stands for "create".

```console
$ git switch -c ideas
Switched to a new branch 'ideas'
```

It is the same as `git branch ideas` followed by `git switch ideas`. The new branch starts on the commit you are on.

Try both on a branch of your own. The practice project has two commits on `main` and one untracked file, `login.js`, which belongs to the first challenge at the end. Leave that file alone for now.

:::predict
question: "You create a file on a new branch and commit it there. Then you switch back to `main`. Is the file still in your folder?"
answer: "No. `main` never had that file, so Git removes it from the folder. It is not deleted: it lives in the other branch's commit, and returns when you switch back."
:::

:::try-it
1. Run `git switch -c ideas`. Git prints `Switched to a new branch 'ideas'`, and the prompt now reads `project (ideas) $`. In the picture, a `branch ideas` tag appears on the same station as `branch main`.
2. Create a file and commit it: `echo "Sell gift cards" > ideas.txt`, then `git add ideas.txt`, then `git commit -m "Add ideas list"`. In the picture, a new station appears. The `branch ideas` tag and the `HEAD · you` pin move onto it; `branch main` stays behind.
3. Run `ls`. You see `README.md`, `app.js`, `ideas.txt` and `login.js`.
4. Run `git switch main`, then `ls` again. The file `ideas.txt` is gone from the folder, because `main` does not have it. In the picture, the `HEAD · you` pin jumps back to the station with `branch main`.
5. Run `git switch -`. The `-` means "the branch I was on before", so you are on `ideas` again. Run `ls`: the file `ideas.txt` is back.
:::

`git switch -` is worth remembering. When you jump between two branches all day, it saves typing both names.

### Two branches, two lines of work

So far `ideas` is only ahead of `main`: it has everything `main` has, plus one commit. Real work looks different. While you work on one branch, `main` gets new commits too, and the history splits in two directions. Git calls this a **diverged** history.

Before, with `ideas` one commit ahead:

:::graph
caption: "ideas is one commit ahead of main"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add app
    parents: [A]
  - id: C
    message: Add ideas list
    parents: [B]
branches:
  main: B
  ideas: C
head: ideas
:::

After one commit on `main`:

:::graph
caption: "main and ideas each have a commit the other does not have"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add app
    parents: [A]
  - id: D
    message: Add todo list
    parents: [B]
  - id: C
    message: Add ideas list
    parents: [B]
branches:
  main: D
  ideas: C
head: main
:::

Both branches still share commits A and B. After B, each went its own way, and neither touches the other's files.

:::try-it
1. Run `git switch main`.
2. Create a file and commit it: `echo "Call the bank" > todo.txt`, then `git add todo.txt`, then `git commit -m "Add todo list"`. In the picture, the new station appears on the top row with `branch main`, and the `ideas` station moves to a row below. Press "Expand" on the History panel to see both rows large.
3. Run `git log --oneline --graph --all`. Git draws the same split in text.
:::

```console
$ git log --oneline --graph --all
* b76073f Add ideas list
| * 88d533c Add todo list
|/  
* d18f96a Add app
* 09e2dbf Add README
```

Read it from the bottom. Two commits on one line, then the line forks: `/` marks where the two branches part. `--all` matters here: without it, `git log` shows only the history of the branch you are on, and the other branch's commit would be missing.

### Switching with uncommitted changes

Switching rewrites your folder. So what happens to edits you have not committed yet? Git has one rule: it never overwrites uncommitted work without being asked.

That gives two cases.

**Git carries your changes along** when they do not get in the way: the files you changed are the same on both branches, or the file is new and untracked.

```console
$ echo "Open on Sundays" >> README.md
$ git switch ideas
Switched to branch 'ideas'
M	README.md
```

The line `M	README.md` is Git telling you: this modified file came with you. Your edit is still uncommitted, now on `ideas`. This is handy when you started work on the wrong branch.

**Git refuses** when the switch would have to replace a file you changed:

```console
$ echo "Sell socks" >> ideas.txt
$ git switch main
error: Your local changes to the following files would be overwritten by checkout:
	ideas.txt
Please commit your changes or stash them before you switch branches.
Aborting
```

`main` has no `ideas.txt`, so switching would remove the file and your new line with it. Git stops, and nothing has changed: you are still on `ideas` with your edit.

You have three ways out:

| You want to… | Do this |
|---|---|
| Keep the change on this branch | Commit it (`git add`, `git commit`), then switch |
| Throw the change away | `git restore <file>`, then switch (the lesson [Unstage and discard changes](lesson:undo-basics)) |
| Keep it for later without a commit | Put it on a shelf with [git stash](term:stash) (the lesson [Stash unfinished work, clean the folder](lesson:stash-and-clean)) |

:::careful
Run `git status` before you switch. If it shows changes, decide what happens to them first. Changes that travel with you are easy to commit on the wrong branch a few minutes later.
:::

### Detached HEAD

Normally HEAD points at a branch, and the branch points at a commit. There is one other state, and it is the heart of this lesson.

A [detached HEAD](term:detached-head) means HEAD points straight at a commit, with no branch in between. You are standing on a commit, and no branch is "the one you are on".

You get there by asking for a commit instead of a branch:

```console
$ git switch --detach HEAD~1
HEAD is now at d18f96a Add app
```

`HEAD~1` means "the commit before the one I am on"; a commit ID works too. Your folder now shows the project as it was at that commit. `git status` says so in its first line:

```console
$ git status
HEAD detached at d18f96a
nothing to commit, working tree clean
```

This is useful and safe. Use it to look at an old version, run it, or test where a bug first appeared. Looking around changes nothing.

The trap is committing here. A commit needs a branch to hold on to it. On a branch, each new commit moves the branch label forward. With a detached HEAD there is no label to move, so a new commit hangs off the old one with nothing pointing at it:

:::graph
caption: "A commit made with a detached HEAD: no branch points at it"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add app
    parents: [A]
  - id: D
    message: Add todo list
    parents: [B]
  - id: X
    message: Try an experiment
    parents: [B]
branches:
  main: D
head: X
:::

While you stay on it, the commit is fine. The moment you switch to a branch, nothing points at X any more. It drops out of `git log`, and Git deletes such commits after about a month.

The common wrong idea is "detached HEAD means something is broken". Nothing is broken. It only means: commits made here have no branch yet.

There are two exits, and you pick by what you did there:

| You… | Exit |
|---|---|
| Only looked around | `git switch -` or `git switch main`: back to a branch |
| Made commits you want to keep | `git switch -c <name>`: a new branch starts right here and holds them |

:::try-it
1. Run `git switch main`, then `git switch --detach HEAD~1`. Git prints `HEAD is now at …` with the commit "Add app". The prompt shows the commit in brackets, like `project ((d18f96a...)) $`. In the picture, the pin reads `HEAD · detached` and sits on a station with no branch tag of its own.
2. Run `ls`. The file `todo.txt` is gone: this commit is older than it.
3. Make a commit here: `echo "try" > experiment.txt`, then `git add experiment.txt`, then `git commit -m "Try an experiment"`. Git answers `[detached HEAD …] Try an experiment`. In the picture, a new station appears with the `HEAD · detached` pin and no branch tag.
4. Keep it: run `git switch -c experiment`. In the picture, a `branch experiment` tag appears on that station and the pin reads `HEAD · you` again. The commit is safe.
5. Run `git switch main` to go back.
:::

### `git checkout`: the older command

You will see `git checkout` in Pro Git, in most answers online, and in Git's own messages (the error above says "overwritten by checkout"). It is the older command for all of this, and it still works.

:::compare
today: "`git switch ideas` changes branch, `git switch -c ideas` creates one, `git switch --detach d18f96a` goes to a commit. `git restore app.js` brings a file back."
book: "`git checkout ideas`, `git checkout -b ideas`, `git checkout d18f96a` and `git checkout -- app.js` do the same four jobs with one command."
:::

One command with so many jobs caused accidents, so Git 2.23 split it in two: `git switch` for branches, `git restore` for files. One difference matters in practice: `git checkout <commit-id>` detaches HEAD without asking, while `git switch` makes you type `--detach`, so you cannot get there by accident.

### When it goes wrong

```console
$ git switch idea
fatal: invalid reference: idea
```

There is no branch with that name: here, a typo. Run `git branch` to list your branches, and try again.

```console
$ git switch -c ideas
fatal: a branch named 'ideas' already exists
```

`-c` creates a branch, and this one is already there. Leave out the `-c`: `git switch ideas`.

```console
$ git checkout d18f96a
Note: switching to 'd18f96a'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.
...
HEAD is now at d18f96a Add app
```

You asked `git checkout` for a commit, so HEAD is detached. Nothing is wrong. Go back with `git switch -`, or stay and look around.

```console
$ git switch main
Warning: you are leaving 1 commit behind, not connected to
any of your branches:

  f8a9d8e Try an experiment

If you want to keep it by creating a new branch, this may be a good time
to do so with:

 git branch <new-branch-name> f8a9d8e

Switched to branch 'main'
```

You made a commit with a detached HEAD and then left. Git lists what you are leaving and gives the fix: `git branch experiment f8a9d8e` puts a branch on that commit, and it is safe again. In the picture, such a commit shows as a faded station marked `no branch`, with its short ID.

## Under the hood

"Must know" described HEAD as a pointer. On disk it is a one-line text file, and the two states of this lesson are two things that line can hold.

### What is in `.git/HEAD`

On a branch, HEAD holds the name of a [ref](term:ref), the file that stores the branch:

```console
$ cat .git/HEAD
ref: refs/heads/main
```

Detached, it holds a commit ID and nothing else:

```console
$ git switch --detach HEAD~1
HEAD is now at d18f96a Add app
$ cat .git/HEAD
d18f96a9efedbf099ef9626de45c55b3f06145a9
```

That is the whole difference. When you commit, Git writes the new commit's ID into whatever HEAD names. If HEAD names `refs/heads/main`, that file gets the new ID and the branch moves. If HEAD is a bare ID, only HEAD itself gets the new ID, and no branch file changes.

### What a switch does to the three areas

A switch touches all three places you know from [Status, stage, commit](lesson:three-areas):

| Place | After `git switch ideas` |
|---|---|
| HEAD | Names `ideas` |
| Staging area | Lists the files of the newest commit on `ideas` |
| Working tree | Holds those files, except that your uncommitted edits are kept |

Git only rewrites the files that differ between the two commits. That is why an edit to a file that is the same on both branches can travel with you, and why switching stays fast in a big project.

### Switch moves HEAD, reset moves the branch

Pro Git compares this with `git reset --hard`, from the lesson [Reset demystified: the three trees](lesson:reset-demystified). Both make your folder look like another commit. They differ in what they move:

| | `git switch ideas` | `git reset --hard ideas` (while on `main`) |
|---|---|---|
| What moves | HEAD, to another branch | The branch `main` itself, to another commit |
| `main` afterwards | Unchanged | Points where `ideas` points |
| Uncommitted edits | Kept, or the switch is refused | Thrown away |

Switching is a way to move yourself. Reset is a way to move a branch.

## Advanced

### Start a branch somewhere else

`git switch -c <name> <start-point>` creates the branch on a commit you name, and switches to it:

```console
$ git switch -c hotfix d18f96a
Switched to a new branch 'hotfix'
```

The start point can be a commit ID, another branch or a tag. This is how you begin a fix from an old release without visiting it first.

### Find commits you left behind

If you left a detached HEAD and the warning has scrolled away, the [reflog](term:reflog) still knows where HEAD has been:

```console
$ git reflog
7aaa664 HEAD@{0}: checkout: moving from 22e3379d0603a4639017ac235c47958ea9ec38b3 to main
22e3379 HEAD@{1}: commit: Try an experiment
2b41f54 HEAD@{2}: checkout: moving from main to HEAD~1
```

Read it from the top: the newest move is first. Find the line of the commit you made (here `22e3379`; your IDs differ), copy its ID, and run `git branch <name> <id>`. The lesson [Recover lost commits with reflog and fsck](lesson:rescue-lost-work) goes deeper.

### Switch and drop your changes

`git switch --discard-changes <branch>` (short: `-f`) switches even when Git would refuse, and throws your uncommitted edits away. It cannot be undone.

`git switch -m <branch>` tries to merge your uncommitted edits into the files of the other branch. It can leave conflict markers in your files, so commit or stash first unless you know both versions well.

### One file from another commit

To take a single file from another branch or commit without switching:

:::compare
today: "`git restore --source=ideas ideas.txt` copies that file from `ideas` into your working tree."
book: "`git checkout ideas -- ideas.txt` does the same, and also stages the file."
:::

### A branch with no history

`git switch --orphan <name>` starts a branch with no commits and no parent. It is rare: people use it for content that shares nothing with the code, like a project website kept in the same repository.

### Two branches at once

Switching shows one branch at a time. When you truly need two side by side, for example to run the old version while you edit the new one, Git can give a branch its own folder. That is the lesson [Several branches checked out at once](lesson:worktrees).

## Recap

- `git switch <branch>` moves HEAD to the branch and makes your files match it; `git switch -` goes back to the previous branch.
- `git switch -c <name>` creates a branch and switches to it.
- Git carries uncommitted changes along when it can, and refuses when the switch would overwrite them: commit, discard or stash first.
- A detached HEAD points straight at a commit. Looking is safe; commits made there need `git switch -c <name>` before you leave.
- `git checkout` is the older command for all of this; today use `git switch` for branches and `git restore` for files.
