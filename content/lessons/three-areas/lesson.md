---
id: three-areas
title: "Status, stage, commit: the three areas"
module: daily-loop
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository
bookSources:
  - vendor/progit2/book/02-git-basics/sections/recording-changes.asc
  - vendor/progit2/book/01-introduction/sections/what-is-git.asc
  - vendor/progit2/book/10-git-internals/sections/objects.asc
readFirst: [first-look-inside, start-a-repo]
---

You changed five files, but only two are ready to save. Git lets you choose exactly which changes go into each save, and this lesson teaches the three commands that do it, the ones you will type every working day: `git status`, `git add` and `git commit`.

## Must know

Before Git records anything, every change you make passes through three places. Once you can picture them, each command in this lesson simply moves changes from one place to the next.

:::definitions
- term: Working tree
  area: working
  text: Your project's files, as you see them in your editor. You make changes here. Git notices them but records nothing yet. Also called the working directory.
- term: Staging area
  area: staging
  text: A waiting area for your next commit. You put changes here on purpose, and only these go into it. Also called the index.
- term: Repository
  area: repository
  text: "Every commit you have made, kept in the hidden `.git` folder. A commit is a save in Git: a snapshot of your project you can come back to. Once a change is here, it is safe."
:::

Think of shipping a parcel. Your desk is the working tree, where things lie around while you work. The open box is the staging area: you pick what goes in. Sealing and labelling the box is a commit. You can keep working at your desk while the box waits.

### Read `git status`

To choose what to commit, you first need to see what changed. That is the job of `git status`.

`git status` answers one question: what changed, and where is each change right now? It only looks; it never changes anything. So run it as often as you like, before and after every other command.

When nothing has changed since your last commit, it says so:

```console
$ git status
On branch main
nothing to commit, working tree clean
```

**working tree clean** means every file in your working tree matches the last commit: nothing new, nothing edited. Everything you have is committed.

The first line, **On branch main**, says which line of work you are on. Git can keep several lines of work side by side, called [branches](term:branch); this project has one, named `main`. The "Branching" module explains them. For now you can skip this line.

### When files change

A clean working tree is the calm moment right after a commit. Real work is messier: you edit files and create new ones, and `git status` starts listing them.

The terminal on the right opens in a small practice project made for this lesson, and it is not clean. Someone edited `README.md` and created a new file, `notes.txt`. Run `git status` there and you will see this:

```console
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   README.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	notes.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

Read it as two lists.

**Changes not staged for commit** lists files Git already tracks, that changed since the last commit. Git calls them **modified**. Here, `README.md` got a new line.

**Untracked files** lists files Git does not track yet. `notes.txt` is new, so Git sees it but leaves it out of commits until you say so.

Git waits for you on new files on purpose, so files you never meant to keep don't slip into your project's history:

- **Build output** is what your tools make from your code, like `node_modules` in JavaScript or `__pycache__` in Python. Anyone can make it again from a short list of packages (`package.json`, `requirements.txt`), so it does not belong in Git.
- **Stray files** are leftovers, like a log file or your editor's backup copy.

The next lesson, [Ignore files with .gitignore](lesson:ignoring-files), shows how to tell Git to skip such files for good.

The lines in brackets are hints: Git names the command for the next step. When you are unsure what to do, `git status` usually tells you.

### Stage changes with `git add`

You can now see what changed. The next step is choosing what goes into your next commit.

`git add` tells Git: take this file, as it looks right now, and put it in the staging area for the next commit.

It does this for both kinds of file you just met:

- A **new file**: Git starts tracking it, which means it will watch the file and include it in commits from now on.
- A **modified file**: Git puts its newest content in the staging area.

Practise on a file of your own, so `README.md` and `notes.txt` stay as they are for the challenges at the end of this lesson (short real jobs you will do in this practice project).

:::try-it
1. Create a file: `echo "Buy milk" > todo.txt`. This writes the line "Buy milk" into a new file called `todo.txt`. In the picture, a `todo.txt` sheet marked "new" appears in the working tree.
2. Run `git status`. Git lists `todo.txt` under "Untracked files": it sees the new file but does not track it yet.
3. Run `git add todo.txt`. Git prints nothing; no news is good news. In the picture, the `todo.txt` sheet slides from the working tree into the staging area.
4. Run `git status` again. The file `todo.txt` has moved to a new list, "Changes to be committed", marked `new file`. It is staged: it will be in your next commit.
:::

You can stage several files at once (`git add todo.txt README.md`) or a whole folder (`git add docs/` stages everything inside it). `git add .` stages every change in the current folder and below. That is quick, but it also grabs files you did not mean to commit, so run `git status` first and look.

### What staging really keeps

This is the idea that confuses most people new to Git, and the one that makes everything else click.

`git add` does not mark a file as "to be committed". It takes a copy of the file exactly as it is at that moment, like taking a photo, and puts the photo in the staging area. If you change the file afterwards, the photo stays as it was.

A small example with `todo.txt`:

| Step | `todo.txt` in your working tree | In the staging area |
|---|---|---|
| You run `git add todo.txt` | Buy milk | Buy milk |
| You add a second line | Buy milk, Buy eggs | Buy milk |
| You commit now | Buy milk, Buy eggs | The commit records: Buy milk |

Only "Buy milk" is committed, because that is what was staged. "Buy eggs" is not lost: it is still in your file, waiting. Your earlier commits are not touched either. To include the new line, run `git add todo.txt` again: a new photo replaces the old one.

The common wrong idea is "I added the file, so Git will commit the file". Git commits what you added, as it was when you added it.

:::try-it
1. Add a second line: `echo "Buy eggs" >> todo.txt`. The `>>` adds a line to the end of the file.
2. Run `git status`. The file `todo.txt` now appears in two lists: under "Changes to be committed" (the photo with "Buy milk") and under "Changes not staged for commit" (your newer edit, "Buy eggs"). The picture shows it too: one `todo.txt` sheet in the staging area and one in the working tree.
3. Run `git add todo.txt`, then `git status`. The file `todo.txt` is now only under "Changes to be committed": the staged photo has both lines. In the picture, only the staging area holds a `todo.txt` sheet now.
:::

:::careful
A commit records the staged photo, not the file on your screen. If you edit after `git add` and forget to add again, your last edit stays out of the commit. Run `git status` before every commit to catch it.
:::

### A shorter `git status`

The full `git status` output is clear but long. Once you can read it, there is a one-line-per-file version that experienced developers use many times an hour.

```console
$ git status -s
 M README.md
AM todo.txt
?? notes.txt
```

`-s` (or `--short`) gives each file two code columns before its name. The **left column is the staging area**, the **right column is the working tree**. A space means "nothing here".

Why two columns? Because, as you just saw, one file can have a staged change and a newer unstaged change at the same time. Read the three lines above:

- ` M README.md`: left is empty, right is `M`. Modified in the working tree, nothing staged.
- `AM todo.txt`: left `A`, a new file is staged; right `M`, it changed again after staging. This is the photo example in two letters.
- `?? notes.txt`: untracked. Git does not track it yet.

| Code | Meaning |
|---|---|
| `??` | Untracked: Git does not track it yet |
| `A ` | A new file, staged |
| `M ` | Modified and staged |
| ` M` | Modified, not staged |
| `MM` | Staged, then changed again |
| `AM` | A new file, staged, then changed again |

Use the long form while you are learning: it explains itself and shows hints. Switch to `-s` once the codes feel natural; it fits a busy project on one screen.

### Commit it with `git commit`

Your staging area now holds exactly what you want to commit. The last step seals it.

A **commit** is a snapshot of your project that Git keeps, with a message that says what you did. You can look back at any commit later, compare it with others, or return to it.

:::try-it
1. Run `git commit -m "Add todo list"`. The `-m` gives the commit its message, written in quotes. In the picture, the staging area empties, a new station appears on the history map, and the `main` label moves onto it.
2. Read what Git prints (explained below).
3. Run `git status`. The file `todo.txt` no longer appears in any list: it is committed to the repository, and matches your working tree.
:::

```console
$ git commit -m "Add todo list"
[main caf03f1] Add todo list
 1 file changed, 2 insertions(+)
 create mode 100644 todo.txt
```

- `main` is the branch the commit went to.
- `caf03f1` is the start of the commit's ID, a unique name Git gives every commit (yours will differ).
- `1 file changed, 2 insertions(+)`: one file, two new lines.
- `create mode 100644 todo.txt`: the file is new in this commit.

Only staged changes went into the commit. `README.md` and `notes.txt` are untouched, still in your working tree for later.

Write messages that say what the commit does, like "Add todo list", not "stuff" or "fix". The lesson [Commit messages and atomic commits](lesson:commit-craft) goes deeper.

### When you forget `-m`

`-m` is the quick way to give a message. If you leave it out, Git opens a text editor so you can write a longer one, and the first time that surprises almost everyone.

The editor shows a file like this:

```console

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# On branch main
# Changes to be committed:
#	new file:   todo.txt
```

To finish:

1. Type your message on the empty first line. The lines starting with `#` are a reminder of what you are committing; Git ignores them.
2. Save the file and close the editor. Git makes the commit.

If you save without writing a message, Git cancels the commit. Nothing is lost; your changes stay staged.

:::careful
In Git Bash the editor is often **Vim**, which does not work like a normal editor. To get out with a message: press `i` to start typing, type the message, press `Esc`, type `:wq` and press Enter (`w` writes, `q` quits). To cancel instead: `Esc`, then `:q!` and Enter.
:::

To use an editor you already know, tell Git once:

```console
$ git config --global core.editor "code --wait"
```

This example picks VS Code; `--wait` makes Git wait until you close the file.

### The shortcut: `git commit -a`

Running `git add` before every commit can feel slow. Git has a shortcut, with a catch.

`git commit -a -m "..."` stages every change to files Git already tracks, then commits them in one step. It is handy for a quick fix to one file you already track.

The catches:

- It **skips untracked files**. A new file like `notes.txt` stays out until you `git add` it.
- It takes **every** tracked change, including ones that belong in a different commit.

### The daily loop

You now have the full loop:

1. Edit files.
2. `git status` to see what changed.
3. `git add` the changes that belong together.
4. `git status` again to check the staging area.
5. `git commit -m "..."` to commit them.

Keep each commit about one thing. History stays easy to read, and one change is easy to undo.

### When it goes wrong

Three messages almost everyone meets in the first week:

```console
$ git commit -m "Add notes"
nothing added to commit but untracked files present (use "git add" to track)
```

Nothing was staged, so there was nothing to commit. Stage the file first (`git add notes.txt`), then commit.

```console
$ git add notes.tx
fatal: pathspec 'notes.tx' did not match any files
```

Git found no file with that name: here, a typo. Check the name with `git status` and run the command again.

```console
$ git status
fatal: not a git repository (or any of the parent directories): .git
```

You are in a folder that is not a Git project. Move into your project folder (`cd`), or start one there with `git init`.

## Under the hood

"Must know" showed what the commands do. This layer shows how Git does it, which helps you predict what any command will do.

### Three copies of every file

For each file, Git can hold three versions at once: the one in your working tree, the one in the staging area, and the one in the last commit. Every command in this lesson copies a version from one place to the next.

Follow `todo.txt` through the lesson:

| After you… | Working tree | Staging area | Last commit |
|---|---|---|---|
| create the file | Buy milk | (none) | (none) |
| `git add todo.txt` | Buy milk | Buy milk | (none) |
| add "Buy eggs" | milk, eggs | Buy milk | (none) |
| `git add todo.txt` | milk, eggs | milk, eggs | (none) |
| `git commit` | milk, eggs | milk, eggs | milk, eggs |

`git status` simply compares these copies:

- Staging area differs from the last commit: listed under "Changes to be committed".
- Working tree differs from the staging area: listed under "Changes not staged for commit".
- In the working tree only: listed under "Untracked files".

That is why a file can sit in two lists: its three copies are not all the same.

### The staging area is a file

The staging area is not a folder of copies. It is one file, `.git/index`, that lists every file for the next commit with an ID for its content. That is why Git's own docs call it the **index**.

You can read it:

```console
$ git ls-files --stage
100644 1c86a0aba542bbaf81b5995bc86aac21974657e6 0	README.md
100644 e57c2ca1812fd986cf9ea6f8a6f00c66b83488b9 0	todo.txt
```

Each line has four parts:

- `100644`: the file type, a normal file.
- `e57c2ca…`: the ID of the file's content.
- `0`: a stage number. It only matters while you fix a merge conflict.
- `todo.txt`: the path.

### Where the photo is kept

When you run `git add`, Git stores the file's content in `.git/objects` right away, and writes its ID into the index. The "photo" from Must know is this stored content.

The ID is a **checksum**: a code Git computes from the content, like a fingerprint. The same content always gives the same ID, and changing even one letter gives a completely different one. Pro Git suggests reading `git add` as "add precisely this content to the next commit", not "add this file to the project".

### What a commit is

A commit is a full snapshot of your project as the index describes it, plus who made it, when, the message, and a link to the commit before it.

Git stores snapshots, not lists of changes. If a file did not change, the new commit simply points to the content already stored. In our example, the "Add todo list" commit points to new content for `todo.txt` and reuses the stored content of `README.md`.

The commit's ID (like `caf03f1…`) is a checksum of all of this. Change anything in a commit and its ID changes, so Git notices if history is damaged or tampered with.

### The life cycle of a file

Pro Git describes four states a file moves through:

1. **Untracked**: new, not tracked yet.
2. **Staged**: added with `git add`. From now on the file is tracked.
3. **Unmodified**: committed, and the same in all three places.
4. **Modified**: edited since the last commit. `git add` stages it again, and the cycle repeats.

## Advanced

### `git add .`, `-A` and `-u`

All three stage many files at once. They differ in which files and where:

| Command | New files | Edits and deletions | Where |
|---|---|---|---|
| `git add .` | Yes | Yes | The current folder and below |
| `git add -A` | Yes | Yes | The whole repository |
| `git add -u` | No | Yes | The whole repository, tracked files only |

Use `-u` to stage your edits without picking up new files. Add `-n` (dry run), as in `git add -n .`, to print what would be staged without staging anything.

### Short status with the branch

`git status -sb` adds the branch name on top of the short list (`## main`). Once you work with a shared copy of the project on a server, that line also shows how many commits you are ahead or behind.

### See the changes while you write the message

`git commit -v` opens the editor with the full list of changed lines under the message, so you can check what you are about to commit. Git removes it from the final message.

### Unstaging: new and old commands

The hints in `git status` name today's commands. Older guides, including Pro Git's examples, show older ones that still work.

:::compare
today: "`git restore --staged notes.txt` takes a file back out of the staging area. Your edits stay in the working tree."
book: "`git reset HEAD notes.txt` does the same and still works. You will see it in older guides and answers online."
:::

The "Undo" lessons cover discarding changes and fixing the last commit.

### Stage part of a file

`git add -p` walks through a file's changes one piece at a time and asks which ones to stage. It has its own lesson, [Stage part of a file](lesson:partial-staging).

## Recap

- `git status` shows where each change is; its hints name the next command.
- `git add <file>` stages a photo of the file as it is now, new or changed.
- Edited after `git add`? Add again, or the new edit stays out of the commit.
- `git commit -m "message"` records the staging area as one snapshot; without `-m`, an editor opens.
- `git status -s`: left column staging area, right column working tree.
