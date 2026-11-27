---
id: start-a-repo
title: "Start or clone a repository"
module: daily-loop
bookSection: "2.1 Getting a Git Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository
bookSources:
  - vendor/progit2/book/02-git-basics/sections/getting-a-repository.asc
readFirst: [setup]
---

You have a folder of files you care about, or a teammate sends you the address of the team's project. Git can do nothing for either until there is a repository on your computer, and this lesson shows the two commands that give you one: `git init` and `git clone`.

## Must know

Every Git command works inside a [repository](term:repository): a project folder that Git watches, with a hidden `.git` folder where Git keeps the project's history. There are two ways to get one.

| You have | You run | You get |
|---|---|---|
| A folder on your computer that Git does not know yet | `git init` | A new, empty repository in that folder |
| The address of a repository that already exists | `git clone <address>` | A full copy of it on your computer |

Either way you end with a repository on your own machine, ready for work.

### Is this folder a repository?

Before starting one, check whether you are already inside one. `git status` answers that:

```console
$ git status
fatal: not a git repository (or any of the parent directories): .git
```

**fatal** means Git stopped without doing anything. The rest says why: this folder has no `.git` folder, and neither does any folder above it. Git looks upward because a repository covers all of its subfolders too.

The prompt in the terminal tells you the same thing. Inside a repository it shows the name of the current line of work in brackets, like `project (main) $`. In a plain folder it shows only `project $`.

### Start one with `git init`

Your files exist but Git does not know them. `git init` turns the folder you are standing in into a repository.

`git init` creates the hidden `.git` folder, and that is all it does. It does not read, change or copy your files.

```console
$ git init
Initialized empty Git repository in C:/Users/you/recipes/.git/
```

The word **empty** matters. Git made the place where history will be kept, but it holds no history yet. Your files are still ordinary files that Git does not track.

:::predict
question: "A folder holds two files. You run `git init` in it. How many of the two files does Git track now?"
answer: "None. `git init` only creates `.git`. Git starts tracking a file when you add it, and the history starts with your first commit."
:::

The practice folder on the right is a plain folder with two files, `README.md` and `pancakes.txt`. They belong to the first challenge at the end of this lesson, so practise in a scratch folder of your own.

:::try-it
1. Run `git status`. Git answers `fatal: not a git repository`: the practice folder is a plain folder. The picture is empty for the same reason.
2. Make a scratch folder and move into it: `mkdir sandbox`, then `cd sandbox`. The prompt now starts with `sandbox`.
3. Run `git init`. Git prints `Initialized empty Git repository in …/sandbox/.git/`, and the prompt gains a name in brackets, `(main)` or `(master)`.
4. Run `ls -a`. The `-a` also lists hidden names, the ones starting with a dot. You see `.git`: the folder `git init` just made.
5. Run `git status`. Git now answers `On branch main` (or `master`) and `No commits yet`: a repository with no history.
6. Go back and remove the scratch folder: `cd ..`, then `rm -rf sandbox`. The picture stayed empty the whole time, because it follows the practice folder itself and that folder is still plain.
:::

### The first branch name

The name in brackets is the repository's first [branch](term:branch), a named line of work. The "Branching" module explains branches; for now you only need its name to be the one your team expects.

Most projects and hosting sites call the first branch `main`. Git's own default is still `master`, unless your computer was set up otherwise. Three ways to get `main`:

| When | Command |
|---|---|
| While creating the repository | `git init -b main` |
| For every repository you create from now on | `git config --global init.defaultBranch main` |
| Right after a plain `git init`, before the first commit | `git branch -m main` |

`-b` is short for `--initial-branch`. The second line is a setting you make once; the lesson [Install, configure and get help](lesson:setup) covers `git config`.

You can also create the folder and the repository in one step: `git init recipes` makes a folder named `recipes` with a `.git` inside it.

### From a new repository to a first commit

A new repository becomes useful with its first **commit**: a snapshot of your files that Git keeps. Two more commands get you there.

```console
$ git add README.md pancakes.txt
$ git commit -m "Start the recipes project"
[main (root-commit) 25b443e] Start the recipes project
 2 files changed, 2 insertions(+)
 create mode 100644 README.md
 create mode 100644 pancakes.txt
```

- `git add README.md pancakes.txt` tells Git which files go into the next commit.
- `git commit -m "..."` records them, with a message that says what you did.

**root-commit** means this is the first commit of the repository. The next lesson, [Status, stage, commit](lesson:three-areas), teaches both commands properly. Here they only finish the job `git init` started.

### Copy one with `git clone`

Most of the time you do not start a project. You join one that already exists, on a server like GitHub or on your company's own machine.

`git clone <address>` downloads that repository to your computer: every file, and every commit ever made in it.

```console
$ git clone ../recipes.git
Cloning into 'recipes'...
done.
```

One command gives you four things:

1. A new folder, named after the repository (`recipes`, without the `.git` ending).
2. The project's **whole history** in its `.git` folder, not only the newest files.
3. The newest files, ready to edit.
4. A note of where the copy came from, saved under the name `origin`.

The common wrong idea is that a [clone](term:clone) is a download of the latest files, like a zip archive. It is the full repository. You can read old versions and make commits with no connection to the server, and Pro Git points out that any clone could restore the server's copy if its disk failed.

`origin` is a [remote](term:remote): a short name for another copy of the repository. You will use it later to fetch your teammates' work and to send them yours. The "Remotes" module covers that.

:::graph
caption: "A fresh clone: three commits, your branch main, and origin/main marking where the server's main was"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add lentil soup
    parents: [A]
  - id: C
    message: Add flatbread
    parents: [B]
branches:
  main: C
remotes:
  origin/main: C
head: main
:::

In this practice project the "server" is a folder beside the practice folder, called `recipes.git`. Its address is `../recipes.git`: `..` means "the folder above this one". Cloning from a real server works the same way, with a longer address.

:::try-it
1. Run `git clone ../recipes.git team-recipes`. Git prints `Cloning into 'team-recipes'...` and `done.` A second word after the address names the new folder.
2. Move into it and look: `cd team-recipes`, then `ls`. Three files are there: `README.md`, `bread.txt` and `soup.txt`.
3. Run `git log --oneline`. It lists three commits, newest first, made by a teammate before you arrived. The history came with the files.
4. Run `git remote -v`. Two lines start with `origin`, followed by the address you cloned from.
5. Go back and remove the copy: `cd ..`, then `rm -rf team-recipes`. The picture stayed empty again: the clone was a folder inside the practice folder, and the picture only follows the practice folder itself.
:::

### Choose where the clone goes

`git clone` puts the new folder inside the folder you are standing in. Where you run it decides where the project lives, so `cd` to the right place first.

| Command | Result |
|---|---|
| `git clone ../recipes.git` | A new folder `recipes` here |
| `git clone ../recipes.git cookbook` | A new folder `cookbook` here |
| `git clone ../recipes.git .` | The files go straight into the current folder |

The single dot means "this folder". It only works when the folder is empty. The clone challenges below use it, so that the practice folder itself becomes the repository and the picture can show it.

### What an address looks like

The address of a repository can take three shapes. You copy it from the project's page; you do not have to build it yourself.

| Shape | Example | Used when |
|---|---|---|
| HTTPS | `https://github.com/libgit2/libgit2` | The usual choice. Works everywhere; asks you to log in for private projects |
| SSH | `git@github.com:libgit2/libgit2.git` | You set up an SSH key once and never type a password again |
| Local path | `../recipes.git` or `/srv/git/recipes.git` | The repository is a folder on this computer or on a shared disk |

All three give you the same clone. The lesson [How Git talks to servers](lesson:how-git-talks) explains the differences.

### When it goes wrong

```console
$ git status
fatal: not a git repository (or any of the parent directories): .git
```

You are in a folder that is not inside any repository. Either you have not created one yet (`git init`), or you are one level too high: after cloning you still have to `cd` into the new folder.

```console
$ git clone ../recipes.git team-recipes
fatal: destination path 'team-recipes' already exists and is not an empty directory.
```

A folder with that name is already there and has files in it. Git never overwrites it. Pick another folder name, or remove the old folder if it was a failed attempt. The same message with `'.'` means you asked for the current folder and it is not empty.

```console
$ git status
On branch master

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	README.md
	notes/
	pancakes.txt
```

A whole folder listed as one line, `notes/`, can hide a mistake: someone ran `git init` inside a repository, so `notes` now holds a second `.git`. Check with `ls -a notes`. Git treats that folder as a separate project and will not commit its files. If it was a mistake and the inner repository has no commits you need, delete only the inner `.git` folder: `rm -rf notes/.git`. Run `git status` first in any folder where you are about to type `git init`.

```console
warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it
```

On Windows you may see this after `git add`. It is a note about how line endings are stored, not an error. Your commit works.

## Under the hood

"Must know" showed what the two commands give you. This layer opens the `.git` folder to see what they really made.

### What is in a new `.git`

Right after `git init`, the `.git` folder holds a skeleton:

```console
$ ls -F .git
HEAD
config
description
hooks/
info/
objects/
refs/
```

- `objects/` will hold every version of every file and every commit. It is empty now.
- `refs/` will hold the names that point at commits, such as branches. Also empty.
- `HEAD` is a one-line file that says which branch you are on.
- `config` holds this repository's own settings.
- `hooks/`, `info/` and `description` are extras you can ignore for a long time.

### A branch with no commit

Look at `HEAD` in a brand-new repository:

```console
$ cat .git/HEAD
ref: refs/heads/main
```

It names the branch `main`. But `refs/heads/` is empty: there is no `main` file yet, because a branch is a pointer to a commit and there is no commit to point at. That is why `git status` says **No commits yet**. The first commit creates `refs/heads/main`.

This also explains why `git branch -m main` is so cheap before the first commit: it only rewrites that one line in `HEAD`.

### What `git clone` does, step by step

`git clone` is a shortcut for work you could do by hand:

1. Make the new folder and run `git init` in it.
2. Save the address under the name `origin`.
3. Download every commit and file version from `origin`.
4. Note where each of the server's branches is, under names like `origin/main`.
5. Create your own `main`, starting at `origin/main`, and remember that it follows it.
6. Put the files of the newest commit into the folder, so you can work.

Steps 2 and 5 are written into the clone's `.git/config`:

```console
$ cat .git/config
[remote "origin"]
	url = C:/Users/you/practice/project/../recipes.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
	remote = origin
	merge = refs/heads/main
```

(The `[core]` section above these lines is left out here.) `[remote "origin"]` is the saved address. `[branch "main"]` says your `main` follows the `main` of `origin`, which is why `git status` in a fresh clone can report "Your branch is up to date with 'origin/main'".

A repository you made with `git init` has neither section. It has no `origin` until you add one.

## Advanced

### Clone and start on another branch

A clone starts on the server's default branch. `-b` picks another one:

```console
$ git clone -b release-1.0 ../shop.git
```

You still get every branch's history. `-b` only decides which one you start on.

### Give the remote another name

`origin` is only the default name. `-o` sets your own:

```console
$ git clone -o team ../shop.git
```

The remote is then called `team`, and its branches appear as `team/main`. This helps when you work with several copies of one project and want names that say whose copy each one is.

### A clone without the old history

`git clone --depth 1 <address>` downloads only the newest commit. It is called a shallow clone, and it saves time on huge projects when you only need the current files. The lesson on large repositories covers its limits.

### A clone with no working files

`git clone --bare <address>` copies only the history, with no files to edit. The result is a [bare repository](term:bare-repository), the form servers keep. Its folder name ends in `.git` by habit, like `recipes.git` in this lesson.

### `git init` is safe to run again

Running `git init` in a folder that is already a repository harms nothing:

```console
$ git init
Reinitialized existing Git repository in C:/Users/you/recipes/.git/
```

Your commits and settings stay as they are. Git never overwrites what is already in `.git`.

## Recap

- `git init` turns the current folder into an empty repository: it creates `.git` and tracks nothing yet.
- `git init -b main` names the first branch; `git branch -m main` renames it before the first commit.
- `git clone <address>` copies a whole repository, history included, into a new folder and remembers the source as `origin`.
- `git clone <address> <folder>` picks the folder name; a dot clones into the current, empty folder.
- `fatal: not a git repository` means no `.git` here or above: `cd` into the project, or create one.
