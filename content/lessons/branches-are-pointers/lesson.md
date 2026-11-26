---
id: branches-are-pointers
title: "Branches are just pointers"
module: branching
bookSection: "3.1 Branches in a Nutshell"
bookUrl: https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell
bookSources:
  - book/progit2/book/03-git-branching/sections/nutshell.asc
  - book/progit2/book/10-git-internals/sections/refs.asc
readFirst: [reading-history]
---

You want to try a risky idea, but the project has to keep working while you do. In Git you start a branch for the idea, and it costs almost nothing. This lesson shows what a branch really is, so that everything you do with branches later makes sense.

## Must know

So far every commit you made went onto one line of history, called `main`. Real projects need more than one line: a stable one that always works, and others for a new feature, a bug fix or an experiment. Each of those lines is a **branch**.

### What a branch is not

Many people picture a branch as a second copy of the project, like a folder named `project-copy`. Other tools do work that way, and it makes branches slow and heavy.

Git does nothing of the kind. Creating a branch copies no files. To see what it does, look again at what a commit holds.

### What a commit stores

The lesson [Read the commit history](lesson:reading-history) showed commits as a list. Each one in that list stores three things:

- a [snapshot](term:snapshot) of all your files at that moment,
- the message, the author and the date,
- the ID of the commit that came before it, called its **parent**.

Because every commit names its parent, the commits form a chain. Start at the newest one, follow the parents, and you walk through the whole history.

:::graph
caption: "Three commits. Each one points back at its parent."
commits:
  - id: A
    message: Add README
  - id: B
    message: Add home page
    parents: [A]
  - id: C
    message: Add about page
    parents: [B]
:::

The chain has no name yet. That is the job of a branch.

### A branch is a label on one commit

A [branch](term:branch) is a small label with a name, like `main`, that points at one commit. Git's book calls it "a lightweight movable pointer". A pointer is something that says "that one, over there", like a sticky note on a page of a book.

The branch points at the newest commit of its line. The older commits belong to the branch too, because you reach them by following the parents.

`git branch` lists the branches you have:

```console
$ git branch
* main
```

One branch, `main`. The `*` marks the branch you are on.

The history map on the right shows the same thing: the `branch main` tag sits on the newest station.

### Create a branch with `git branch`

Now the central command of this lesson.

`git branch testing` makes a new label named `testing` and puts it on the commit you are on right now. That is all it does.

:::predict
question: "You are on main and run `git branch testing`. Which branch are you on afterwards, and how many commits does the project have?"
answer: "Still on main, and the same number of commits as before. The command only adds a label; it does not move you and it does not create a commit."
:::

:::try-it
1. Run `git branch testing`. Git prints nothing. In the picture, a second tag, `branch testing`, appears on the newest station, next to `branch main`. No new station appears.
2. Run `git branch`. Git lists `main` and `testing`. The `*` is still in front of `main`: you did not move.
3. Run `git status`. The first line still says `On branch main`, and the working tree is as it was. No file changed.
:::

```console
$ git branch
* main
  testing
```

Say it once more, because this is where most people go wrong: `git branch testing` **creates** the branch and **leaves you where you are**. Your files do not change, your commits do not change, and your next commit still goes to `main`. Moving to another branch is a separate command, which the next lesson teaches.

:::graph
caption: "After git branch testing: two labels on the same commit"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add home page
    parents: [A]
  - id: C
    message: Add about page
    parents: [B]
branches:
  main: C
  testing: C
head: main
:::

### HEAD: you are here

Two labels now sit on one commit. Git needs to know which of them you are working on, and it keeps one more pointer for that: [HEAD](term:head).

HEAD is Git's "you are here" marker. It points at a branch: the one you are on. In the picture it is the yellow `HEAD · you` pin.

You have seen `git log --oneline` in "Read the commit history". It also prints the labels, in brackets, next to the commit they point at:

```console
$ git log --oneline --decorate
3140f40 (HEAD -> main, testing) Add about page
4d8ac76 Add home page
c30be8c Add README
```

Read the brackets on the first line:

- `HEAD -> main`: HEAD points at `main`, so you are on `main`.
- `testing`: the `testing` label is on this same commit.

`--decorate` is the option that adds the brackets. In a terminal, Git turns it on by itself, so plain `git log --oneline` shows them too. You need to type it only when you send the output somewhere else, like into a file.

### What moves when you commit

Two labels on one commit look the same. The next commit shows the difference.

When you commit, Git moves one label forward to the new commit: the branch HEAD points at. Every other branch stays where it is.

:::predict
question: "main and testing point at the same commit, and you are on main. You make a new commit. Where is testing afterwards?"
answer: "Where it was: on the older commit. Only main moves to the new commit, because HEAD points at main."
:::

:::try-it
1. Create a file: `echo "Passport, charger" > packing.txt`.
2. Run `git add packing.txt`, then `git commit -m "Add packing list"`. In the picture, a new station appears. The `branch main` tag and the `HEAD · you` pin move onto it. The `branch testing` tag stays behind on the station before.
3. Run `git log --oneline`. The brackets have split: `HEAD -> main` on the new commit, `testing` on the older one.
:::

```console
$ git log --oneline --decorate
42eb0a5 (HEAD -> main) Add packing list
3140f40 (testing) Add about page
4d8ac76 Add home page
c30be8c Add README
```

:::graph
caption: "After the commit: main moved, testing stayed"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add home page
    parents: [A]
  - id: C
    message: Add about page
    parents: [B]
  - id: D
    message: Add packing list
    parents: [C]
branches:
  main: D
  testing: C
head: main
:::

Nothing was lost and nothing was copied. `testing` simply remembers the project as it was one commit ago. That is how a branch keeps a stable version safe while another line moves on.

### See where every branch is

Once you have a few branches, you want to know where each one points without reading the whole log.

`git branch -v` lists every branch with the short ID and the message of the commit it points at (`-v` is short for "verbose", which means "say more"):

```console
$ git branch -v
* main    42eb0a5 Add packing list
  testing 3140f40 Add about page
```

Use plain `git branch` to answer "which branch am I on?" and `git branch -v` to answer "where is each branch?".

### Branches are cheap, so use them

In Git, a branch is one tiny file that holds a commit ID: 41 bytes. Creating one takes no time and no disk space worth mentioning, however big the project is.

That changes how people work. Developers who use Git make a branch for every small job, several times a day, and throw it away when the job is done. The lesson [Branch, merge, and fix conflicts](lesson:branch-and-merge) shows that whole routine.

### Name branches well

A branch name is for people, so make it say what the branch is for.

| Rule | Example |
|---|---|
| Short, lowercase words joined by `-` | `fix-login-error` |
| A slash to group related branches, if your team does it | `feature/dark-mode`, `bugfix/cart-total` |
| No spaces | `my idea` is refused |

Git also refuses a few characters, such as `~`, `^`, `:` and `..`, because they have a meaning in other commands.

### What comes next

You can now create branches and see where they point. To work on one, you have to move HEAD to it. The command is `git switch testing`, and it is the subject of the next lesson, [Switching branches and detached HEAD](lesson:switch-and-detached-head). Leave it for then.

### When it goes wrong

```console
$ git branch testing
fatal: a branch named 'testing' already exists
```

Branch names are unique in a repository. Run `git branch` to see the ones you have, and pick another name.

```console
$ git branch "my idea"
fatal: 'my idea' is not a valid branch name
hint: See 'git help check-ref-format'
```

The name has a space in it. Use a hyphen: `git branch my-idea`.

```console
$ git branch testing
fatal: not a valid object name: 'main'
```

This repository has no commits yet. A branch is a label on a commit, so with no commit there is nothing to put a label on. For the same reason, `git branch` prints nothing at all here. Make the first commit, then create the branch.

The last trap prints no message. You run `git branch testing`, keep working, commit, and later find your commits on `main`. `git branch` never moves you. Check where you are with `git branch` or `git status` before you commit.

## Under the hood

Must know called a branch "a label". This layer shows the label on disk. It is as simple as it sounds.

### A branch is a file with one line

The lesson [A first look inside .git](lesson:first-look-inside) showed that `main` is a file. Every branch you create is one more file in the same folder, `.git/refs/heads/`. Git calls such a file a [ref](term:ref).

```console
$ cat .git/refs/heads/testing
3140f400923393d7005fac7b3abbfd9669c5188a
$ cat .git/refs/heads/main
42eb0a591435996726078971956384810e1bafe4
```

Each file holds one full [commit ID](term:commit-id): 40 characters and a line break, 41 bytes. That is the whole branch. `git branch testing` wrote the first file. Nothing in `.git/objects`, where your files and commits are stored, was touched.

`git rev-parse` asks Git the same question without opening the file:

```console
$ git rev-parse testing
3140f400923393d7005fac7b3abbfd9669c5188a
```

### HEAD is a file that names a branch

HEAD is a file too, `.git/HEAD`. It does not hold a commit ID. It holds the name of a branch:

```console
$ cat .git/HEAD
ref: refs/heads/main
```

Read it as "I am on the branch stored in `refs/heads/main`". So finding the commit you are on takes two steps: HEAD names the branch, and the branch file names the commit.

### How a commit moves the branch

Now `git commit` can be told in full:

1. Git reads `.git/HEAD` and finds `refs/heads/main`.
2. It reads that file and finds the current commit's ID.
3. It creates the new commit, with that ID as its parent.
4. It writes the new commit's ID into `refs/heads/main`.

Step 4 is "the branch moves forward". `refs/heads/testing` is never opened, which is why `testing` stays behind. HEAD itself does not change either: it still says `refs/heads/main`.

:::careful
Read these files as much as you like, but never edit them by hand. A typo in a branch file makes the branch point at nothing. Git's own commands change them safely.
:::

## Advanced

### Start a branch at an older commit

`git branch <name>` uses the commit you are on. Give it a second word, and the label goes on that commit instead:

```console
$ git branch first-draft 4d8ac76
$ git branch -v
  first-draft 4d8ac76 Add home page
* main        42eb0a5 Add packing list
  testing     3140f40 Add about page
```

The second word can be a commit ID from `git log --oneline`, another branch's name, or a shortcut like `HEAD~2` (two commits before the one you are on). This is handy when you notice too late that a branch should have started earlier. You still do not move: HEAD stays on `main`.

### Print only the current branch

`git branch --show-current` prints the name of the branch you are on, and nothing else:

```console
$ git branch --show-current
main
```

Scripts use it. For people, the prompt already shows the branch in brackets.

### See every branch in one log

Plain `git log` starts at HEAD, so it shows only the commits you reach from the branch you are on. `--all` starts from every branch, and `--graph` draws the lines between commits:

```console
$ git log --oneline --graph --all
* 42eb0a5 Add packing list
* 3140f40 Add about page
* 4d8ac76 Add home page
* c30be8c Add README
```

With these branches the history is still one straight line. Once two branches each have commits of their own, the graph splits in two, and this command becomes the one you run all day. The next lesson gets there.

### Each branch keeps a diary

Git notes every move of a branch in its [reflog](term:reflog). `git reflog show testing` lists where `testing` pointed before, starting with the moment it was created. The lesson "Recover lost commits with reflog and fsck" uses it for rescue work.

### `main` is only a convention

Pro Git points out that the first branch is not special. It is a branch like any other. Its name comes from a setting, `init.defaultBranch`, which the lesson [Install, configure and get help](lesson:setup) set to `main`. The book and older projects call it `master`. Git treats both names the same.

## Recap

- A branch is a label that points at one commit. Creating one copies no files.
- `git branch <name>` creates a branch on the commit you are on, and leaves you where you are.
- HEAD is "you are here": it points at the branch you are on. `git log --oneline` shows it as `HEAD -> main`.
- A commit moves only the branch HEAD points at. Other branches stay where they are.
- `git branch` lists branches, with `*` on the current one. `git branch -v` adds the commit each one points at.
