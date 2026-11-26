---
id: first-look-inside
title: "A first look inside .git: objects and refs"
module: orientation
bookSection: "10.1 Plumbing and Porcelain"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain
bookSources:
  - book/progit2/book/10-git-internals/sections/plumbing-porcelain.asc
  - book/progit2/book/10-git-internals/sections/objects.asc
  - book/progit2/book/10-git-internals/sections/refs.asc
readFirst: [what-is-git]
---

Git commands feel like magic until you see where your work really goes. Everything Git knows about a project sits in one hidden folder, and in this lesson you open it and read what is inside, so that later commands make sense instead of having to be memorized.

## Must know

You have read that Git keeps a history of your project. That history has to live somewhere on your disk. It lives in a folder named `.git`, in the top folder of the project.

### The `.git` folder is the repository

The practice project on the right is a small recipe book. Someone already made three commits in it. A commit is a save in Git: a [snapshot](term:snapshot) of the whole project that you can come back to. The lesson [Status, stage, commit](lesson:three-areas) teaches you to make your own. Here you only look.

The project folder holds two kinds of things:

- **Your files**: `README.md` and a `recipes` folder. You see and edit these.
- **The `.git` folder**: Git's own storage. This folder is the [repository](term:repository). Delete it and the project forgets its whole history; copy it and you have copied the history.

The name starts with a dot, and files that start with a dot are hidden by default. That is why a plain `ls` does not show it.

:::try-it
1. Run `ls`. You see `README.md` and `recipes`: the project's own files.
2. Run `ls -a`. The `-a` means "all, hidden ones too". Now `.git` appears in the list.
3. Run `ls .git`. You see what Git keeps inside (explained below). In the picture, nothing moves: looking never changes a repository.
:::

```console
$ ls .git
COMMIT_EDITMSG
HEAD
config
description
hooks
index
info
logs
objects
refs
```

Four entries do the real work. You will open three of them in this lesson:

| Entry | What it is |
|---|---|
| `objects` | A folder with everything Git has stored: every version of every file, and every commit |
| `refs` | A folder of names that point at commits, such as your branches |
| `HEAD` | A small file that says where you are right now |
| `index` | The list of what goes into your next commit (the lesson "Status, stage, commit" explains it) |

The rest you can leave alone for now:

- `config` holds the settings of this one project, like the name you commit with.
- `hooks` holds scripts Git can run at certain moments, for example before each commit. It ships with samples that do nothing until you turn them on.
- `info`, `logs`, `description` and `COMMIT_EDITMSG` are Git's own notes.

:::careful
Look inside `.git` as much as you like, but never edit, move or delete its files by hand. One wrong character in the wrong file can make Git lose track of your work. Every change goes through a `git` command.
:::

### Two kinds of commands

To look inside, you need commands most people rarely type.

Git's everyday commands, like `git add` and `git commit`, are called **porcelain**: the smooth, friendly surface. Underneath are low-level commands called [plumbing](term:plumbing), made for scripts and for looking inside. The names come from a bathroom: you touch the porcelain, and the pipes behind the wall do the work.

You will use two plumbing commands here, `git cat-file` and `git rev-parse`. You do not need them for daily work. They are the easiest way to see what the daily commands do.

### Every commit is an object

Start with something you can already see. On the history map, each station is a commit, and under it is a short code like `63d16f1`. That code is the commit's name.

`git log --oneline` lists the same commits in the terminal, newest first, one line each:

```console
$ git log --oneline
63d16f1 Add toast recipe
0058955 Add pasta recipe
42cbfaf Add README
```

The code at the start of each line is a [commit ID](term:commit-id). Your IDs are different from the ones printed here, and that is expected: a commit's ID depends on who made it and when, and your practice project was made a moment ago. Use your own IDs in every step below.

Inside `.git/objects`, Git keeps each commit as an [object](term:object): one stored item with an ID. `git cat-file` reads objects. It needs to know which one, and what you want to know:

- `git cat-file -t <id>` prints the object's **t**ype.
- `git cat-file -p <id>` **p**rints its content in a readable form.

:::try-it
1. Run `git log --oneline` and find the ID on the top line, next to "Add toast recipe". It matches the short ID under the newest station on the history map, the one with the `HEAD · you` pin.
2. Run `git cat-file -t` followed by that ID, for example `git cat-file -t 63d16f1`. Git answers `commit`: this object is a commit.
3. Run `git cat-file -p` with the same ID. Git prints what the commit holds (explained below).
:::

```console
$ git cat-file -p 63d16f1
tree a632f02593d961ac7c254d1ae6f1efb7cfa7fd8f
parent 00589552f1514bf46cace49190398bad718f941a
author Practice Student <student@example.com> 1795715445 +0300
committer Practice Student <student@example.com> 1795715445 +0300

Add toast recipe
```

That is the whole commit. Read it line by line:

- `tree a632f02…`: the ID of another object, which holds the project's files as they were in this commit. You will open it next.
- `parent 0058955…`: the ID of the commit that came before. Compare it with your `git log --oneline` output: it is the "Add pasta recipe" commit. This one line is what links commits into a history.
- `author` and `committer`: who wrote the change and who committed it, with the time as a number (seconds counted from 1970) and the time zone. They are usually the same person.
- After an empty line: the commit message.

Notice what is missing. The commit does not contain your files. It only points at a tree.

:::graph
caption: "Three commits. Each one names its parent; main and HEAD are on the newest."
commits:
  - id: A
    message: Add README
  - id: B
    message: Add pasta recipe
    parents: [A]
  - id: C
    message: Add toast recipe
    parents: [B]
branches:
  main: C
head: main
:::

### A tree is a folder listing

The commit pointed at a tree. A [tree](term:tree) object is the listing of one folder: the names in it, and for each name the ID of the object that holds it.

:::try-it
1. Copy the ID after `tree` from the commit you just printed. The first seven characters are enough: `a632f02`.
2. Run `git cat-file -t a632f02`. Git answers `tree`.
3. Run `git cat-file -p a632f02`. Git prints the listing of the project's top folder.
:::

```console
$ git cat-file -p a632f02
100644 blob 1ae421cfd1106a2779e465d9294dcba8dfce26bf	README.md
040000 tree 09d2726b145ddc8f31d9179660f8ca2b79156e3d	recipes
```

Each line has four parts:

- `100644` or `040000`: the kind of entry. `100644` is a normal file, `040000` is a folder.
- `blob` or `tree`: the type of the object behind the name.
- The object's ID.
- The name: `README.md`, `recipes`.

`README.md` is a file, so its line points at a **blob** (explained in a moment). `recipes` is a folder, so its line points at another tree. Open that one the same way:

```console
$ git cat-file -p 09d2726
100644 blob 17a1594bf4e215ef101abfce91a60ac5b912a2e1	pasta.txt
100644 blob b82e13769497cc3ec1c32944e52a709a06f2f24a	toast.txt
```

A folder inside a folder is a tree inside a tree. Git stores a project of any size this way.

### A blob is a file's content

You have followed the trail from a commit to a tree to a line that says `blob`. One step is left.

:::predict
question: "The tree lists `pasta.txt` next to the ID `17a1594…`. What will `git cat-file -p 17a1594` print: the file's name, its content, or both?"
answer: "Only the content: the one line of the recipe. A blob holds what is in a file and nothing else. The name `pasta.txt` is kept in the tree that points at the blob."
:::

:::try-it
1. Run `git cat-file -p 17a1594`. Git prints `Boil the pasta for 9 minutes.`, the content of `recipes/pasta.txt`.
2. Run `cat recipes/pasta.txt`. The same line: the file in your folder and the blob in `.git/objects` hold the same content.
3. Run `git cat-file -t 17a1594`. Git answers `blob`.
:::

A [blob](term:blob) is the content of one file, with no name and no date attached. The odd word is short for "binary large object", a database term for "a chunk of data".

The three kinds of object fit together like this:

| Object | Holds | Points at |
|---|---|---|
| **commit** | Author, date, message | One tree, and its parent commit |
| **tree** | The names in one folder | A blob for each file, a tree for each subfolder |
| **blob** | The content of one file | Nothing |

So a commit is a full picture of your project. Start at the commit, follow its tree, and you reach the exact content of every file as it was at that moment.

### IDs are fingerprints of content

You typed `17a1594` on your computer, and it worked, although this lesson was written on another computer. That is no accident.

An object's ID is a [checksum](term:checksum): a code that Git computes from the object's content, like a fingerprint. Two rules follow, and the rest of Git leans on both:

- **Same content, same ID.** A file with the line `Boil the pasta for 9 minutes.` gets the blob ID `17a1594…` on every computer in the world. The same goes for the two trees above, because they list the same names and the same blob IDs.
- **Any change, a new ID.** Change one letter of the recipe and the blob gets a completely different ID. Then the tree that lists it changes, so the tree gets a new ID, and so does the commit that points at the tree.

The second rule explains why your commit IDs differ from the ones printed here while your blob and tree IDs match. A commit also contains a name and a time, and your commits were made at a different time.

It also makes history hard to damage without anyone noticing. If a stored file were changed on disk, its content would no longer fit its ID, and Git would report it.

The full ID has 40 characters. You almost never type all of them: Git accepts the first few as long as they point at only one object, and four is the minimum. Seven is what `git log --oneline` shows.

### A branch is a file with one ID in it

Nobody wants to remember `63d16f1`. Git lets you use names instead, and the names are stored in the `refs` folder. A [ref](term:ref) (short for reference) is a name that points at a commit.

The first line of every `git status` will tell you that you are "on branch main". A [branch](term:branch) is a line of work with a name, and `main` is the one every new project starts with. The "Branching" module is all about them. Here is what `main` is on disk.

:::predict
question: "The folder `.git/refs/heads` holds one file, named `main`. What do you expect to find inside that file?"
answer: "One line: the full 40-character ID of the newest commit, the one with the `branch main` tag on the history map. That is all a branch is."
:::

:::try-it
1. Run `ls .git/refs/heads`. There is one file: `main`.
2. Run `cat .git/refs/heads/main`. The command `cat` prints a file. You get one 40-character ID.
3. Compare its first seven characters with the top line of `git log --oneline`. They match: the branch `main` points at your newest commit. On the history map, this file is the `branch main` tag sitting on that station.
:::

```console
$ cat .git/refs/heads/main
63d16f10b2995c11058c25e4e128d9a5cc074ec7
```

The common wrong idea is that a branch is a copy of the project, or a folder of commits. It is a 41-byte file holding one ID. When you make a new commit, Git writes the new commit's ID into this file, and that is how the branch "moves forward".

### HEAD says where you are

One question is left: with several branches, how does Git know which one you are on? It reads the file `.git/HEAD`.

```console
$ cat .git/HEAD
ref: refs/heads/main
```

[HEAD](term:head) does not hold an ID. It holds the name of a ref: "I am on the branch `main`". On the history map, it is the yellow `HEAD · you` pin.

So finding your current commit takes two steps: read `HEAD` to get the branch, then read the branch's file to get the commit ID. `git rev-parse` does both for you. It turns any name into the full ID it stands for:

```console
$ git rev-parse HEAD
63d16f10b2995c11058c25e4e128d9a5cc074ec7
$ git rev-parse main
63d16f10b2995c11058c25e4e128d9a5cc074ec7
$ git rev-parse --short HEAD
63d16f1
```

`HEAD` and `main` give the same ID, because HEAD is on `main`. `--short` cuts the answer to the short form. Use `git rev-parse --short HEAD` whenever you need "the commit I am on" in a script or a bug report.

Wherever a command asks for an ID, a name works as well. `git cat-file -p HEAD` prints the commit you are on, without copying any ID.

:::try-it
1. Run `cat .git/HEAD`. It prints `ref: refs/heads/main`.
2. Run `git rev-parse HEAD`. Git follows HEAD to `main` and prints the commit ID from the file you read a moment ago.
3. Run `git cat-file -p HEAD`. The same commit as in your first Try-it, this time found by name.
:::

### When it goes wrong

```console
$ git cat-file -t 63d
fatal: Not a valid object name 63d
```

Git found no single object for what you typed. Here the ID is too short: Git wants at least four characters. The same message appears after a typo in an ID. Copy the ID again from `git log --oneline`.

```console
$ git cat-file -p README.md
fatal: Not a valid object name README.md
```

`git cat-file` reads objects, and `README.md` is a file name. To print a file from your folder, use plain `cat README.md`. To print it as a commit stored it, name the commit first: `git cat-file -p HEAD:README.md`.

```console
$ git rev-parse HEAD
fatal: not a git repository (or any of the parent directories): .git
```

You are in a folder with no `.git` in it or above it, so there is no repository to ask. Move back into the project with `cd`.

## Under the hood

"Must know" showed what the objects contain. This layer shows where they sit on disk and how Git arrives at an ID.

### Where an object lives

Every object is one file under `.git/objects`. Its path comes straight from its ID: the first two characters name a folder, the other 38 name the file.

```console
$ find .git/objects -type f
.git/objects/00/589552f1514bf46cace49190398bad718f941a
.git/objects/09/d2726b145ddc8f31d9179660f8ca2b79156e3d
.git/objects/17/a1594bf4e215ef101abfce91a60ac5b912a2e1
.git/objects/1a/e421cfd1106a2779e465d9294dcba8dfce26bf
...
```

The third line is a blob you already know: `17` + `a1594b…` is the pasta recipe. The practice project has 11 objects: 3 commits, 5 trees and 3 blobs.

Git is, in Pro Git's words, a "content-addressable filesystem": a store where you hand in content and get back a key, and the key is computed from the content. Because the key is also the file's address, Git never has to search for an object. It reads the ID and knows the path.

Splitting on the first two characters keeps any one folder from holding too many files, which would be slow on some systems.

### Why `cat` cannot read them

Try `cat` on one of those files and you get unreadable bytes. Git compresses every object with zlib, the same method ZIP files use, to save space. `git cat-file -p` uncompresses the object and prints it.

### How the ID is computed

`git hash-object` shows the ID that some content would get, without storing anything. Feed it the pasta recipe's line:

```console
$ echo "Boil the pasta for 9 minutes." | git hash-object --stdin
17a1594bf4e215ef101abfce91a60ac5b912a2e1
```

The same ID as the blob in the tree. Now change one character, the 9 into an 8:

```console
$ echo "Boil the pasta for 8 minutes." | git hash-object --stdin
406b1b17c9ce4d8b2992407755fcdf98219660d9
```

Nothing in the new ID resembles the old one. The checksum method is called SHA-1. Git does not run it on the content alone: it first puts a small header in front, made of the object's type, the content's length in bytes and a zero byte (for this blob, `blob 30`). That is why a blob and a tree can never get the same ID by accident, even with the same bytes inside.

Add `-w` (`git hash-object -w <file>`) and Git also writes the object into `.git/objects`. That is what `git add` does for you behind the scenes.

### What a commit's ID covers

A commit's ID is the checksum of the text you printed with `git cat-file -p`: the tree ID, the parent ID, the author, the committer, the times and the message. Change any of them and the ID changes.

Because the parent's ID is part of that text, a commit's ID depends on every commit before it. Nobody can quietly change an old commit: every later commit would get a new ID, and everyone holding the old history would see the difference.

## Advanced

### Ask for the size

`git cat-file -s <id>` prints an object's size in bytes, before compression:

```console
$ git cat-file -s 17a1594
30
```

Thirty bytes: 29 characters and the line ending.

### List a tree without hunting for its ID

`git ls-tree` prints a tree, and it accepts a commit or a branch name and finds the tree for you:

```console
$ git ls-tree HEAD
100644 blob 1ae421cfd1106a2779e465d9294dcba8dfce26bf	README.md
040000 tree 09d2726b145ddc8f31d9179660f8ca2b79156e3d	recipes
```

Add `-r` to walk into every subfolder and list only files:

```console
$ git ls-tree -r HEAD
100644 blob 1ae421cfd1106a2779e465d9294dcba8dfce26bf	README.md
100644 blob 17a1594bf4e215ef101abfce91a60ac5b912a2e1	recipes/pasta.txt
100644 blob b82e13769497cc3ec1c32944e52a709a06f2f24a	recipes/toast.txt
```

### Name a file inside a commit

`<commit>:<path>` names the object for a path as that commit stored it. It works with any command that takes an ID:

```console
$ git cat-file -p HEAD:recipes/pasta.txt
Boil the pasta for 9 minutes.
```

This reads the committed version, even if you have changed or deleted the file in your folder since.

### Count the objects

```console
$ git count-objects -v
count: 11
size: 0
in-pack: 0
packs: 0
...
```

`count` is the number of objects stored as single files. In an older, larger repository most objects sit `in-pack`: from time to time Git gathers many objects into one compressed "packfile". It can also gather refs into a single file, `.git/packed-refs`, so a branch does not always have its own file under `refs/heads`. `git cat-file` and `git rev-parse` give the right answer either way, which is one more reason to ask Git instead of reading the files yourself. The lesson "Packfiles and garbage collection" covers this.

### More that `git rev-parse` can tell you

| Command | Prints |
|---|---|
| `git rev-parse --abbrev-ref HEAD` | The name of the branch you are on: `main` |
| `git rev-parse --show-toplevel` | The project's top folder, from anywhere inside it |
| `git rev-parse --git-dir` | Where the `.git` folder is |

Scripts use these to find their way around a project.

### Where this continues

This was a first look. The lessons "Blobs, trees, commits and how they are stored" and "References, HEAD, tags and remotes on disk", near the end of the course, build objects by hand and cover tags, remotes and the fourth object type.

## Recap

- The `.git` folder is the repository: `objects` stores everything, `refs` holds names, `HEAD` says where you are.
- A commit points at a tree (the project's files) and at its parent commit; a tree lists names; a blob holds one file's content.
- An ID is a checksum of content: same content, same ID; any change, a new ID.
- A branch is a file in `.git/refs/heads` holding one commit ID. HEAD is a file naming the current branch.
- `git cat-file -t <id>` gives an object's type, `git cat-file -p <id>` prints it, `git rev-parse <name>` turns a name into an ID.
