---
id: what-is-git
title: "What Git is and why it works this way"
module: orientation
bookSection: "1.3 What is Git?"
bookUrl: https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F
bookSources:
  - book/progit2/book/01-introduction/sections/about-version-control.asc
  - book/progit2/book/01-introduction/sections/what-is-git.asc
  - book/progit2/book/01-introduction/sections/history.asc
readFirst: []
---

You have a folder with `report-final.docx`, `report-final-2.docx` and `report-REALLY-final.docx`, and you still are not sure which one has the paragraph you deleted last week. Git ends that: it keeps every version of your project, tells you who changed what, and lets you go back. This lesson explains what Git is and the four ideas that make every later command easy to predict.

## Must know

Before any command, you need a picture of the problem Git solves. Everything else in the course builds on it.

### What version control is

[Version control](term:version-control) is a system that records how your files change over time, so you can call up any earlier version later.

Most people already do a hand-made form of it: they copy a file and add a date or "final" to the name. That works for a day. Then it breaks in three ways:

- You forget which copy is which.
- You overwrite the wrong file, and the good version is gone.
- Two people edit their own copies, and nobody can join the two.

A version control system does the copying for you, and does it properly. With one, you can:

- bring one file, or the whole project, back to how it was last Tuesday,
- see exactly which lines changed between two versions,
- see who changed a line, and when, and the note they left about why,
- recover almost anything you break or lose.

It works for any kind of file, though it is best with text: code, notes, configuration.

### Three ways to keep the history

Tools for this have existed for decades. They differ in one thing: where the history lives. Knowing the three designs explains why Git behaves as it does.

| Design | Where the history lives | The weak point |
|---|---|---|
| **Local** | In a database on your own computer | Nobody else can work with you |
| **Centralized** | On one server; everyone downloads only the latest files from it | If the server is down, nobody can save a version or look at history. If its disk dies without a backup, the history is gone |
| **Distributed** | On every computer that has the project, in full | Almost none: every copy is a full backup |

Git is **distributed**. When you get a project with Git, you do not download only its latest files. You get a [clone](term:clone): the whole project with its whole history. If the server dies tomorrow, any teammate's copy can restore it.

A server is still useful, as the place where a team meets. GitHub is such a place. But it is one copy among equals, and that single fact explains most of what follows.

:::sidenote
Git was written in 2005 by Linus Torvalds and the Linux community, after the tool they used for the Linux kernel stopped being free. They wanted speed, a simple design, strong support for thousands of parallel lines of work, and no central server. Those goals still shape Git today.
:::

### Look at a real project

That was the theory. Before the four ideas, look at a real Git project, so the ideas have something to stick to.

The terminal on the right opens in a small practice project: a family's recipe collection that already has some history. A project that Git tracks is called a [repository](term:repository). You will only look in this lesson. Each command below has its own lesson later, so do not try to memorize them now.

:::try-it
1. Run `git --version`. Git prints its version, like `git version 2.55.0`. This only proves Git is installed and answering.
2. Run `git status`. Git answers "nothing to commit, working tree clean": every file in the folder matches the last version Git recorded.
3. Run `git log --oneline`. Git lists the project's history, newest first, one line per recorded version. In the picture, the history map shows the same thing drawn left to right: six stations, with a `HEAD · you` pin and a `branch main` tag on the newest one.
:::

```console
$ git log --oneline
dfeb9e0 Add bread recipe
924c82b Add shopping list
b2690db Use less sugar
663a695 Add Friday dinner idea
376dd8a Add pancake recipe
7cc233f Add README
```

Each line is one **[commit](term:commit)**: a recorded version of the whole project. On the left is the start of the commit's ID (yours will differ), on the right the message its author wrote. Six lines, so this project was recorded six times.

:::graph
caption: "The practice project: six commits, oldest on the left. main and HEAD are on the newest."
commits:
  - id: A
    message: Add README
  - id: B
    message: Add pancake recipe
    parents: [A]
  - id: C
    message: Add Friday dinner idea
    parents: [B]
  - id: D
    message: Use less sugar
    parents: [C]
  - id: E
    message: Add shopping list
    parents: [D]
  - id: F
    message: Add bread recipe
    parents: [E]
branches:
  main: F
head: main
:::

The `main` label is a [branch](term:branch), a named line of work, and [HEAD](term:head) marks where you are. The "Branching" module explains both. For now, read them as "you are at the newest commit".

### Idea 1: snapshots, not differences

You have seen six commits. The first idea is about what one commit holds, and it is the idea that sets Git apart from older tools.

Many older tools record **differences**: "in version 2, line 3 of `pancakes.md` changed". To show you version 5, they start from the first version and replay every change.

Git records **[snapshots](term:snapshot)**. Each commit is a picture of every file in the project, as it was at that moment. Think of a photo album, one photo per commit, each showing the whole project.

A small example from the practice project:

| Commit | `README.md` | `pancakes.md` | `soup.md` |
|---|---|---|---|
| Add pancake recipe | version 1 | version 1 | (not there yet) |
| Add Friday dinner idea | version 1 | version 1 | version 1 |
| Use less sugar | version 1 | **version 2** | version 1 |

Every row is complete. To show you the project at "Use less sugar", Git reads one row. It never replays anything.

The common wrong idea is "then Git must waste space, copying every file every time". It does not. When a file has not changed, the new snapshot simply points at the copy Git already stored. In the table, `README.md` is stored once, and all three commits point at it.

What stays the same matters too: a new commit never changes an older one. Snapshot 2 stays exactly as it was when snapshot 3 arrives.

:::try-it
1. Pick the line of "Add Friday dinner idea" in your `git log --oneline` output and copy the ID at its start.
2. Run `git show --stat` followed by that ID, for example `git show --stat 663a695`. Git prints who made the commit, when, the message, and which files differ from the commit before: here `soup.md`, with 3 new lines.
3. Nothing moves in the picture: `git show` only reads.
:::

```console
$ git show --stat 663a695
commit 663a695919944fe1e1fd62b866c9bdddf9ee2a4f
Author: Practice Student <student@example.com>
Date:   Thu Nov 26 20:50:17 2026 +0300

    Add Friday dinner idea

 soup.md | 3 +++
 1 file changed, 3 insertions(+)
```

Git stores snapshots, but it can show you differences any time: it compares two snapshots on the spot. That is what the `soup.md | 3 +++` line is.

### Idea 2: nearly everything is local

You just read the history of a whole project. The second idea is about where that answer came from.

Because your clone holds the full history, almost every Git command works from your own disk. Git does not ask a server.

:::predict
question: "You turn off your Wi-Fi and run `git log --oneline` again. What happens?"
answer: "Exactly the same list appears, just as fast. The history is in the hidden `.git` folder inside your project, so Git needs no network to read it."
:::

This has two effects you will feel every day:

- **Speed.** Looking up history, comparing versions and making commits take a moment, because nothing travels over a network.
- **Freedom.** You can work on a plane or with a broken connection: commit as often as you like, and share the commits when you are back online.

Only a few commands talk to a server: the ones that send your commits to others or fetch theirs. The "Remotes" module covers them.

### Idea 3: Git notices every change

Your history sits on your own disk. So what stops a file from being damaged there without anyone noticing? The third idea answers that.

Git gives everything it stores a **[checksum](term:checksum)**: a code computed from the content, like a fingerprint. It is 40 characters long, made of the digits 0–9 and the letters a–f:

```console
663a695919944fe1e1fd62b866c9bdddf9ee2a4f
```

The same content always gives the same code. Change one letter of the content and the code comes out completely different.

This code is the commit's name. The `663a695` you copied a moment ago is simply the first seven characters of it, the [commit ID](term:commit-id). Short IDs work because seven characters are almost always enough to tell commits apart.

Since Git names everything by its checksum, it cannot miss a change. If a file in the history is damaged on disk, or someone alters an old commit, the checksum no longer fits and Git reports it.

### Idea 4: Git only adds

The last idea is the one that lets you relax.

Nearly every action in Git **adds** data to the repository. A new commit is added next to the old ones; nothing is overwritten. Even when a commit deletes a file, the older commits still hold it, and you can get it back.

So once something is committed, it is very hard to lose. You can try things freely, knowing you can return to any commit.

:::careful
This safety covers committed work only. Changes you have not committed yet exist in one place, your folder, and Git cannot bring them back if you overwrite or delete them. Commit often.
:::

### A preview: the three areas

One more picture, as a preview. Look at the top of the visualizer: it shows three areas, and every change you make passes through them.

- The **[working tree](term:working-tree)**: your files, where you edit.
- The **[staging area](term:staging-area)**: where you collect the changes for your next commit.
- The **repository**: the commits, kept in the `.git` folder.

You edit, you pick what belongs together, you commit. The lesson [Status, stage, commit](lesson:three-areas) teaches this loop properly; here it is enough to know the three places exist.

### When it goes wrong

Three things can trip you up while you only look around:

```console
$ git status
fatal: not a git repository (or any of the parent directories): .git
```

You are in a folder Git does not track. Git looks for a `.git` folder here and in the folders above, and found none. Move back into your project with `cd`.

```console
$ git lgo
git: 'lgo' is not a git command. See 'git --help'.

The most similar command is
	log
```

A typo. Git even suggests what you meant. Run the command again with the right spelling.

The third has no error message. In a project with a long history, `git log` fills the screen and stops with a `:` at the bottom, and typing does nothing useful. Git is showing the list in a **pager**, a small viewer for long output. Press the space bar for the next page, and `q` to quit and get your prompt back.

## Under the hood

"Must know" gave you the four ideas. This layer shows two of them in Git's own storage, so you can see they are literally true.

### A snapshot is a list of pointers

`git ls-tree` prints what a commit's snapshot holds. Compare the last two commits of the practice project:

```console
$ git ls-tree 924c82b
100644 blob 2951e87176b3ba0cda6e3e949a2b5b13093023eb	README.md
100644 blob eb8d1f6e37dd9c746b29cbe8616ed9abe33ac9f0	pancakes.md
100644 blob 42801315ca7de6e4291c397a0299be9feb8bbd13	shopping.txt
100644 blob 25b4c93757aea221c8a8d238fb131286cbb1a610	soup.md

$ git ls-tree dfeb9e0
100644 blob 2951e87176b3ba0cda6e3e949a2b5b13093023eb	README.md
100644 blob 7d6dd0ccb42d3021c5409cdce5bdde2b5c9ab0cd	bread.md
100644 blob eb8d1f6e37dd9c746b29cbe8616ed9abe33ac9f0	pancakes.md
100644 blob 42801315ca7de6e4291c397a0299be9feb8bbd13	shopping.txt
100644 blob 25b4c93757aea221c8a8d238fb131286cbb1a610	soup.md
```

Each line is one file: a type, the checksum of the file's content, and the file's name. A stored file content is called a **blob**.

Now compare the checksums. The four files that did not change have the same checksum in both commits: both snapshots point at the same stored content. Only `bread.md` is new. That is how every commit can be a full snapshot without storing every file again.

### Checksums chain the history together

A commit's checksum is computed from its snapshot, its author, its date, its message and the ID of the commit before it.

Follow what that means. If anyone changed one letter in an old file, that file's checksum would change. So the snapshot's would change, so the commit's ID would change, so the ID of every commit after it would change too. Nobody can alter old history quietly: every ID after the change would be different, and every other clone would disagree.

### Where it all lives

Everything Git knows about the project is in the hidden `.git` folder at the top of it. Delete the other files and Git can restore them from `.git`. Delete `.git` and you keep your files but lose the history. The lesson [A first look inside `.git`](lesson:first-look-inside) opens that folder.

## Advanced

### SHA-1 and SHA-256

Git's checksums are made with a method called **SHA-1**. Researchers have shown that two different contents can be crafted to share one SHA-1 code, with great effort. Git has protections against the known technique, and it also supports a stronger method, **SHA-256**, which gives 64-character IDs. A repository uses one or the other. Almost every project you meet today still uses SHA-1, and so do hosting services by default.

### Other version control systems

You may meet these names at work:

| System | Design | Note |
|---|---|---|
| RCS | Local | Still ships with some systems |
| CVS, Subversion, Perforce | Centralized | Subversion and Perforce are still in use, mostly in older or very large projects |
| Mercurial, Darcs | Distributed | Cousins of Git, born around the same time |

If you come from one of them, Pro Git's advice is to set aside what you know: Git's commands sometimes have familiar names, but they act on snapshots, and the old habits mislead.

### Where Git is a poor fit

Git is built for text. Very large binary files (videos, game art, datasets) are stored whole each time they change, and every clone carries all versions. Projects handle that with add-ons such as Git LFS, covered in the lesson "Shallow and partial clone, sparse checkout, LFS, bundles, `git maintenance`".

### "Only adds" has edges

Git can remove data in a few deliberate ways: commits that no branch reaches are cleaned up after a few weeks, and some commands rewrite history on purpose. The "Undo and fix" and "Recovery and incidents" modules cover what is safe and how to get things back.

## Recap

- Version control records every version of your project, so you can go back, compare, and see who changed what.
- Git is distributed: every clone holds the full history, so nearly every command works offline and fast.
- A commit is a snapshot of the whole project, not a list of changes; unchanged files are shared between snapshots.
- Everything is named by a checksum, so Git notices any change or damage.
- Git almost only adds data: committed work is very hard to lose. Uncommitted work is not protected.
- Commands for looking: `git status`, `git log --oneline`, `git show --stat <id>`.
