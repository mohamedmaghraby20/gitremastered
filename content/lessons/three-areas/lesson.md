---
id: three-areas
title: "Status, stage, commit: the three areas"
module: daily-loop
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository
bookSources:
  - book/progit2/book/02-git-basics/sections/recording-changes.asc
  - book/progit2/book/01-introduction/sections/what-is-git.asc
  - book/progit2/book/10-git-internals/sections/objects.asc
readFirst: [first-look-inside, start-a-repo]
---

Every change you save in Git goes through three places, and three commands move it along: `git status` shows where things are, `git add` picks what goes next, `git commit` saves it.

## Must know

You will run these three commands many times a day. They move your changes between three places.

:::definitions
- term: Working folder
  area: working
  text: The files you see and edit. Git notices changes here but saves nothing yet.
- term: Staging area
  area: staging
  text: The next commit, being put together. You choose what goes in.
- term: Repository
  area: repository
  text: Every commit you have saved, kept inside the hidden `.git` folder.
:::

### Read `git status`

`git status` tells you which files changed and which place each change is in. It never changes anything, so run it before and after every other command.

When nothing has changed since the last commit, it says so:

```console
$ git status
On branch main
nothing to commit, working tree clean
```

Your practice folder is not clean. Someone edited `README.md` and created `notes.txt`. Run `git status` in the terminal and you will see this:

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

Read it from top to bottom:

- **On branch main**: you are on the branch called `main`. Branches come later; for now there is only one.
- **Changes not staged for commit**: files Git already knows that changed since the last commit. These are **modified** files.
- **Untracked files**: files Git has never saved. Git leaves them out of every commit until you add them, so build output and stray files don't slip in by accident.
- The lines in brackets are hints. They name the command for the next step, so `git status` doubles as a cheat sheet.

:::sidenote
Older Git versions and the Pro Git examples call the first branch `master`. Many hosts, GitHub included, now start with `main`. Both work the same way.
:::

### Stage with `git add`

`git add` puts a file into the staging area exactly as it is right now. The same command does two jobs: it starts tracking a new file, and it stages the latest change of a file Git already knows.

Try it on a file of your own, so the mission's files stay as they are.

:::try-it
1. Create a file: `echo "Buy milk" > todo.txt`.
2. Run `git status`. `todo.txt` is under "Untracked files".
3. Run `git add todo.txt`, then `git status`. It moved to "Changes to be committed" as `new file: todo.txt`.
:::

You can name several files (`git add todo.txt README.md`) or a folder (`git add docs/`, which stages everything inside it). `git add .` stages every change in the current folder and below. That is handy, but it also grabs things you did not mean to commit, so check `git status` first.

### Staged means "as it was when you added it"

The staging area keeps a copy of the file from the moment you ran `git add`. Edit the file again and Git sees two versions: the staged one and your newer one.

:::try-it
1. Add a line: `echo "Buy eggs" >> todo.txt`.
2. Run `git status`. `todo.txt` is now in both lists: "Changes to be committed" and "Changes not staged for commit".
3. Run `git add todo.txt` again to stage the newer version.
:::

:::careful
A commit takes the staged version, not the file on your screen. If you edit after `git add` and forget to add again, your last edit stays out of the commit.
:::

### Short status

Once you know the long output, `git status -s` (or `--short`) gives one line per file:

```console
$ git status -s
 M README.md
AM todo.txt
?? notes.txt
```

Each line has two columns before the file name. The left column is the staging area, the right column is the working folder.

| Code | Meaning |
|---|---|
| `??` | Untracked: Git has never saved it |
| `A ` | A new file, staged |
| `M ` | Modified and staged |
| ` M` | Modified, not staged |
| `MM` | Staged, then changed again |
| `AM` | A new file, staged, then changed again |

### Save it with `git commit`

`git commit` saves everything in the staging area as one snapshot in the repository. `-m` gives it a message saying what the commit does.

:::try-it
1. Run `git commit -m "Add todo list"`.
2. Read what Git prints, then run `git status`: `todo.txt` is gone from the list, because it is saved.
:::

```console
$ git commit -m "Add todo list"
[main caf03f1] Add todo list
 1 file changed, 2 insertions(+)
 create mode 100644 todo.txt
```

Git prints the branch (`main`), the start of the new commit's ID (`caf03f1`, yours will differ), the message, and how many files and lines changed. `create mode` means the file is new in this commit.

Anything you did not stage stays in your working folder, still changed. Here `README.md` and `notes.txt` are untouched, ready for a later commit.

### When you forget `-m`

`git commit` without `-m` opens a text editor for the message. The file already holds a summary of what you are committing, on lines starting with `#`. Git ignores those lines. Write your message on the first line, save, and close the editor to finish the commit. Save an empty message and Git cancels the commit.

:::careful
In Git Bash the editor is often Vim, which surprises many people. To write and leave Vim: press `i`, type the message, press `Esc`, then type `:wq` and press Enter. To pick an editor you know, run `git config --global core.editor "code --wait"` (for VS Code) once.
:::

### The shortcut: `git commit -a`

`git commit -a -m "..."` stages every change to files Git already tracks, then commits. It skips `git add`, which is quick for a small fix. It has two catches: it never picks up untracked files, and it takes every tracked change, including ones that belong in a different commit.

### The loop

Edit, `git status`, `git add` what belongs together, `git status` to check, `git commit -m "..."`. Keep each commit about one thing: history is easier to read, and a single change is easier to undo.

## Under the hood

### Three copies of every file

Git keeps up to three copies of each file in mind at once: the one in your working folder, the one in the staging area, and the one in the last commit.

The **staging area** is a real file: `.git/index` (Git's own docs also call the staging area the **index**). It lists every file that will be in the next commit, with an ID for its content.

`git status` works by comparing the copies. Staging area against the last commit gives "Changes to be committed". Working folder against the staging area gives "Changes not staged for commit". Files in neither are untracked. That is why one file can sit in both lists: it has a staged version and a newer one.

### What `git add` really does

`git add` does not just mark a file. It saves the file's content into the repository at once, as an object in `.git/objects`, and writes that object's ID into the index. Pro Git suggests reading the command as "add precisely this content to the next commit", not "add this file to the project".

You can look at the index yourself:

```console
$ git ls-files --stage
100644 1c86a0aba542bbaf81b5995bc86aac21974657e6 0	README.md
100644 e57c2ca1812fd986cf9ea6f8a6f00c66b83488b9 0	todo.txt
```

Each line is a file mode (`100644` is a normal file), the content's ID, a stage number (it matters only during merges) and the path. The ID is a checksum of the content: the same content always gets the same ID, and any change gives a new one.

### What a commit is

A commit is a snapshot of the whole project as the index describes it, plus the author, the date, the message and a link to the commit before it. Git stores snapshots, not lists of changes; a file that did not change points to the content it already had.

The commit's ID (like `caf03f1…`) is a checksum of all of that. Change anything in a commit and its ID changes, which is how Git notices damaged or altered history.

### The life cycle of a file

1. A new file starts **untracked**.
2. `git add` makes it **staged**, and from then on it is **tracked**.
3. `git commit` saves it; it is now **unmodified**.
4. Edit it and it becomes **modified**.
5. `git add` stages it again, and the cycle repeats.

:::sidenote
Pro Git 2.2 draws this as the "lifecycle of the status of your files": untracked, unmodified, modified, staged.
:::

## Advanced

### `git add .`, `-A` and `-u`

| Command | Stages new files | Stages edits and deletions | Where |
|---|---|---|---|
| `git add .` | Yes | Yes | The current folder and below |
| `git add -A` | Yes | Yes | The whole repository |
| `git add -u` | No | Yes | The whole repository, tracked files only |

`git add -n` (dry run) prints what would be staged without staging it.

### Short status with the branch

`git status -sb` adds the branch on top of the short list (`## main`). Once you work with a remote, that line also shows how far ahead or behind you are.

### See the diff while you write the message

`git commit -v` opens the editor with the full diff of what you are committing under the message. Git removes it from the final message.

### Unstaging: new and old commands

The hints in `git status` name today's commands. Older guides, including Pro Git's examples, show older ones.

:::compare
today: "`git restore --staged notes.txt` takes a file back out of the staging area. Your edits stay in the working folder."
book: "`git reset HEAD notes.txt` does the same and still works. You will see it in older guides and answers online."
:::

The "Undo" lessons cover discarding changes and fixing the last commit.

### Stage part of a file

`git add -p` walks through a file's changes one piece at a time and asks which ones to stage. It has its own lesson, "Stage part of a file".

## Recap

- `git status` shows which place each change is in; its hints name the next command.
- `git add <file>` stages a file as it is right now, new or changed.
- Edited after `git add`? Add again, or the new edit stays out.
- `git commit -m "message"` saves the staging area as one snapshot; without `-m` an editor opens.
- `git status -s`: left column staging area, right column working folder.
