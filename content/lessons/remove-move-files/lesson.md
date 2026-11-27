---
id: remove-move-files
title: "Remove and rename tracked files"
module: daily-loop
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#_removing_files
bookSources:
  - vendor/progit2/book/02-git-basics/sections/recording-changes.asc
readFirst: [three-areas]
---

You delete an old file, or give one a better name, and `git status` reacts in a way you did not expect: the deleted file is still listed, and the renamed one shows up as two different files. This lesson shows how to tell Git about a deletion or a rename, so your next commit records exactly what you did.

## Must know

In [Status, stage, commit](lesson:three-areas) you staged new files and edits. Deleting and renaming go through the same three areas. The only new part is how they look in `git status`, and two commands that save you typing: `git rm` and `git mv`.

Everything here is about [tracked files](term:tracked-file): files Git already follows. A file Git does not track can be deleted or renamed any way you like, and Git has nothing to record.

### Delete a file the plain way

Start with what most people do first: delete the file in the file explorer, or with `rm` in the terminal. (`rm` is the shell's own command for deleting a file. It is not a Git command.)

:::predict
question: "You delete a tracked file with plain `rm`. Where will `git status` list it: staged, not staged, or untracked?"
answer: "Not staged. Git sees that the file is gone from your working tree, but the deletion is not in the staging area yet. It is a change like an edit, and you still have to stage it."
:::

Make a file of your own for this, so the practice project's files stay as they are for the challenges at the end.

:::try-it
1. Create a file and commit it: `echo "Draft ideas" > draft.txt`, then `git add draft.txt`, then `git commit -m "Add draft"`. In the picture, a new station appears on the history map.
2. Delete it the plain way: `rm draft.txt`.
3. Run `git status`. Git lists `draft.txt` under "Changes not staged for commit", marked `deleted`. In the picture, a `draft.txt` sheet marked `deleted` lies in the working tree.
:::

```console
$ git status
On branch main
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	deleted:    draft.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

Read the first hint: `use "git add/rm <file>..."`. The file is gone from your folder, but your next commit would still contain it, because the [staging area](term:staging-area) still holds it. A deletion is a change, and a change must be staged before it is committed.

### Stage the deletion with `git rm`

`git rm` tells Git: take this file out of my next commit.

:::try-it
1. Run `git rm draft.txt`. Git prints `rm 'draft.txt'`. In the picture, the `deleted` sheet slides from the working tree into the staging area.
2. Run `git status`. The file `draft.txt` is now under "Changes to be committed", still marked `deleted`: the deletion is staged.
3. Run `git commit -m "Remove draft"`. In the picture, the staging area empties and a new station appears on the history map.
:::

```console
$ git commit -m "Remove draft"
[main 5077eb6] Remove draft
 1 file changed, 1 deletion(-)
 delete mode 100644 draft.txt
```

`delete mode 100644 draft.txt` says this commit removes the file. From this commit on, the project has no `draft.txt`.

`git add draft.txt` does the same job as `git rm draft.txt` here. That sounds odd, but remember what `git add` means: put this file, as it is right now, into the next commit. Right now the file does not exist, so Git stages "no file".

### One step: `git rm` does both

You do not need the plain `rm` first. On a file that is still there, `git rm` deletes it from your working tree **and** stages the deletion:

```console
$ git rm scratch.txt
rm 'scratch.txt'
$ git status -s
D  scratch.txt
```

The `D` in the left column means: a deletion, staged. (A `D` in the right column, ` D`, is a deletion that is not staged yet, like after plain `rm`.)

Use whichever way fits. If you already deleted files in your editor, stage those deletions afterwards. If you are in the terminal, `git rm` is one command.

### The file is still in your history

Deleting a file removes it from the next commit and every commit after it. Your earlier commits are not touched: they still hold the file, exactly as it was.

:::graph
caption: "Remove draft has no draft.txt. Add draft still has it, and always will."
commits:
  - id: A
    message: Add project files
  - id: B
    message: Add draft
    parents: [A]
  - id: C
    message: Remove draft
    parents: [B]
branches:
  main: C
head: main
:::

This is good news and a warning.

- **Good news:** a deleted file can be brought back from an older commit. The lesson [Unstage and discard changes](lesson:undo-basics) shows how.
- **Warning:** deleting a file does not erase a secret. A password that was committed is still readable in the old commits.

### Stop tracking, but keep the file: `--cached`

Sometimes you want the opposite of deleting: the file must leave Git, but stay on your disk. The usual case is a file that was committed by mistake, like a log file or a file with a password.

`git rm --cached <file>` removes the file from the staging area only. Your working tree keeps it, and Git lists it as untracked from then on.

```console
$ git rm --cached brandnew.txt
rm 'brandnew.txt'
$ git status -s
?? brandnew.txt
```

| You type | In the next commit | On your disk |
|---|---|---|
| `git rm notes.txt` | Gone | Deleted |
| `git rm --cached notes.txt` | Gone | **Kept** |

[Ignore files with .gitignore](lesson:ignoring-files) uses this together with a `.gitignore` rule, so the file stays out of Git for good.

### When `git rm` says no

`git rm` deletes a file from your disk, so it protects work that no commit holds yet. If the file has edits you never committed, Git refuses:

```console
$ git rm tips.txt
error: the following file has local modifications:
    tips.txt
(use --cached to keep the file, or -f to force removal)
```

Git offers two ways out, and they do different things:

- `git rm --cached tips.txt` stops tracking the file and keeps it, edits included.
- `git rm -f tips.txt` (force) deletes it anyway. The uncommitted edits are lost.

:::careful
`-f` throws away edits that were never committed. Git cannot bring them back. Commit first if you are not sure, then remove the file: the commit keeps a copy.
:::

### Remove many files at once

One file at a time gets slow when a whole folder has to go.

To remove a folder with everything in it, add `-r` (recursive, which means "this folder and all folders inside it"):

```console
$ git rm -r log
rm 'log/README'
```

Without `-r`, Git refuses, so you cannot wipe a folder by accident:

```console
$ git rm log
fatal: not removing 'log' recursively without -r
```

You can also give a pattern. `*` means "any characters", as in `.gitignore`:

```console
$ git rm log/\*.log
rm 'log/a.log'
rm 'log/b.log'
```

Note the backslash in front of the `*`. Without it, your shell replaces `*.log` with the matching file names before Git ever sees the pattern, and the shell only looks in one folder. With the backslash, the `*` reaches Git untouched, and Git matches it against every tracked file, in subfolders too:

```console
$ git rm -n *.log
rm 'a.log'
$ git rm -n \*.log
rm 'a.log'
rm 'docs/b.log'
```

The `-n` here is a dry run: Git prints what it would remove and removes nothing. Use it before any pattern you are not sure about.

### Rename a file with `git mv`

Deleting is one half of this lesson. The other half is giving a file a new name or a new folder, which Git calls moving.

`git mv old new` renames the file in your working tree and stages the rename, in one step.

:::try-it
1. Create a file with a few lines and commit it: `printf 'Flour\nEggs\nMilk\nSugar\nButter\n' > list.txt`, then `git add list.txt`, then `git commit -m "Add shopping list"`. (`printf` writes text into the file; each `\n` starts a new line.)
2. Run `git mv list.txt shopping.txt`. Git prints nothing. In the picture, a `shopping.txt` sheet marked `renamed` appears in the staging area.
3. Run `git status`. Under "Changes to be committed", Git shows `renamed: list.txt -> shopping.txt`.
4. Run `git commit -m "Rename list to shopping"`.
:::

```console
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	renamed:    list.txt -> shopping.txt

$ git commit -m "Rename list to shopping"
[main ffc701f] Rename list to shopping
 1 file changed, 0 insertions(+), 0 deletions(-)
 rename list.txt => shopping.txt (100%)
```

`rename list.txt => shopping.txt (100%)` means: same file, new name, and 100% of its content is unchanged.

Moving a file into a folder works the same way: `git mv menu.txt notes/` moves it into the folder `notes`.

### What a rename really is

This is the part that surprises people. `git mv` is a shortcut for three steps you already know:

```console
$ mv list.txt shopping.txt
$ git rm list.txt
$ git add shopping.txt
```

Git does not record "this file was renamed". It records that `list.txt` is gone and `shopping.txt` is new. Afterwards it compares the two, sees the same content, and shows them to you as one rename.

So the plain way works too. Rename the file in your editor, in the file explorer or with `mv`, and tell Git afterwards.

:::predict
question: "You rename a tracked file with plain `mv` and stage nothing. What will `git status` show?"
answer: "Two entries: the old name as `deleted` (not staged), and the new name under \"Untracked files\". Git cannot call it a rename yet, because the new file is not staged, so Git has not looked at its content."
:::

:::try-it
1. Rename with the shell only: `mv shopping.txt groceries.txt`.
2. Run `git status`. Git lists `shopping.txt` as `deleted` and `groceries.txt` as untracked. In the picture, the working tree holds two sheets: `shopping.txt` marked `deleted` and `groceries.txt` marked `new`.
3. Stage both halves: `git rm shopping.txt`, then `git add groceries.txt`. In the picture, the two sheets leave the working tree and one `groceries.txt` sheet marked `renamed` sits in the staging area.
4. Run `git status`. Git now shows one line: `renamed: shopping.txt -> groceries.txt`. Commit it with `git commit -m "Rename shopping to groceries"`.
:::

```console
$ git status
On branch main
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	deleted:    shopping.txt

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	groceries.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

The common wrong idea is "I must use `git mv`, or Git loses the file's history". It does not. Both ways end in exactly the same commit.

### Rename and edit together

Because Git works out renames by comparing content, an edit made at the same time can change what it sees.

A small edit is fine. Here one line was added to a five-line file during the rename, and Git still calls it a rename, 85% the same:

```console
$ git commit -m "Rename to pantry, add salt"
[main d782753] Rename to pantry, add salt
 1 file changed, 1 insertion(+)
 rename food.txt => pantry.txt (85%)
```

Rewrite most of the file, and Git sees two unrelated files, one deleted and one created:

```console
$ git commit -m "Turn pantry into menu"
[main 28f909d] Turn pantry into menu
 2 files changed, 5 insertions(+), 6 deletions(-)
 create mode 100644 menu.txt
 delete mode 100644 pantry.txt
```

Nothing is broken in either case. But when the rename is the point, make it a commit of its own and edit the file in the next commit. Anyone reading the history later can then follow the file across the rename.

### When it goes wrong

```console
$ git rm tips.txt
error: the following file has changes staged in the index:
    tips.txt
(use --cached to keep the file, or -f to force removal)
```

"The index" is the staging area. You staged an edit to this file and never committed it, so removing the file would lose that edit. Decide what you want: `--cached` to stop tracking and keep the file, `-f` to delete it for real, or commit the edit first.

```console
$ git rm nothere.txt
fatal: pathspec 'nothere.txt' did not match any files
```

Git tracks no file with that name. Either the name has a typo, or the file is untracked. An untracked file is not in Git, so there is nothing for `git rm` to remove: delete it with plain `rm`. `git mv` says the same thing in other words: `fatal: bad source` for a name that does not exist, `fatal: not under version control` for an untracked file.

```console
$ git status -s
 D shopping.txt
?? groceries.txt
```

You renamed a file outside Git, and now it looks like one file vanished and a new one appeared. Nothing is lost. Stage both names (`git rm shopping.txt` and `git add groceries.txt`), and status shows a rename. `git add -A` stages both at once, along with every other change in the project, so run `git status` first and look.

## Under the hood

"Must know" said that Git does not record renames. This layer shows what it records instead, and why that works.

### A deletion in the index

The staging area is a list, the index: one line per file that will be in the next commit. Before the deletion, `draft.txt` has a line:

```console
$ git ls-files --stage
100644 1c86a0aba542bbaf81b5995bc86aac21974657e6 0	README.md
100644 6687898e2a0fe2da282efab6b5f7f38b7f788f56 0	app.js
100644 cf3f0557e2de46ccf3b02e2636202a1fcd8921ac 0	draft.txt
100644 ad9bbe2996ca79f177df0b27c30fa7a8e948dcef 0	old-plan.txt
```

After `git rm draft.txt`, the line is gone:

```console
$ git ls-files --stage
100644 1c86a0aba542bbaf81b5995bc86aac21974657e6 0	README.md
100644 6687898e2a0fe2da282efab6b5f7f38b7f788f56 0	app.js
100644 ad9bbe2996ca79f177df0b27c30fa7a8e948dcef 0	old-plan.txt
```

That is all a staged deletion is. The next commit is a snapshot of this list, so it has no `draft.txt`. `git status` shows `deleted` because it compares the list with the last commit, and the last commit still has the line.

The three commands differ only in which copies they touch:

| Command | Working tree | Index |
|---|---|---|
| `rm draft.txt` | File deleted | Line stays |
| `git rm draft.txt` | File deleted | Line removed |
| `git rm --cached draft.txt` | File stays | Line removed |

The content itself, stored under the ID `cf3f055…`, is not deleted by any of them. The older commit still points to it, which is why the file can come back.

### A rename is the same content under a new name

Look at the index line of a file before and after `git mv`:

```console
$ git ls-files --stage list.txt
100644 ef3c6771f9c84118cd1fb9e837b5020013c78380 0	list.txt
$ git mv list.txt shopping.txt
$ git ls-files --stage shopping.txt
100644 ef3c6771f9c84118cd1fb9e837b5020013c78380 0	shopping.txt
```

The ID is the same. It is a [checksum](term:checksum) of the file's content, and the content did not change. Git stored nothing new: the index now gives the old content a different name.

A commit made from this index holds no note saying "renamed". It only lacks `list.txt` and has `shopping.txt`.

### How Git spots a rename afterwards

When Git shows a change (in `git status`, in the commit summary, in the history), it looks at the files that disappeared and the files that appeared, and compares them.

- Same ID: the content is identical. That is a rename, 100%.
- Different ID: Git compares the two contents line by line and computes how similar they are. At 50% or more, it shows a rename with the percentage, like `(85%)`. Below that, it shows a deleted file and a new file.

This explains the two commits in "Rename and edit together". The file with one added line was 85% the same, so Git showed a rename. The rewritten file had almost nothing in common with the old one, so Git showed a delete and a create.

Pro Git puts it this way: no information is stored that says you renamed the file, and Git figures it out after the fact. The benefit is that it does not matter how you renamed it: `git mv`, your editor, a script.

## Advanced

### Follow a file across a rename

`git log -- <file>` lists the commits that touched one file (the lesson [Read the commit history](lesson:reading-history) covers `git log`). By default it stops at a rename, because before that commit no file had this name:

```console
$ git log --oneline -- shopping.txt
1051351 Add salt
cd69f4c Rename list.txt to shopping.txt
```

`--follow` makes it continue under the old name:

```console
$ git log --oneline --follow -- shopping.txt
1051351 Add salt
cd69f4c Rename list.txt to shopping.txt
6487ba5 Add shopping list
```

`--follow` relies on the same similarity check. That is the practical reason to keep a rename in its own commit: a rename mixed with a big rewrite is where the trail ends.

### Change only upper and lower case

On Windows and macOS, `readme.md` and `README.md` are the same file to the system. Rename one to the other in the file explorer and Git usually notices nothing. `git mv` handles it:

```console
$ git mv README.md readme.md
$ git status -s
R  README.md -> readme.md
```

Always use `git mv` for a case-only rename. A teammate on Linux, where the two names are different files, gets the correct name from your commit.

### Take back a deletion before you commit

A staged deletion is undone in two steps, and `git status` names both in its hints:

```console
$ git rm README.md
rm 'README.md'
$ git restore --staged README.md
$ git restore README.md
```

`git restore --staged` takes the deletion out of the staging area. `git restore` then puts the file back in your working tree from the last commit. The lesson "Unstage and discard changes" explains both commands.

### `git commit -a` picks up deletions

`git commit -a` stages every change to tracked files before committing, and a deletion made with plain `rm` is one of them:

```console
$ rm old-plan.txt
$ git commit -a -m "Remove old plan"
[main 44d5a32] Remove old plan
 1 file changed, 2 deletions(-)
 delete mode 100644 old-plan.txt
```

It does not complete a plain `mv`, though. The old name is recorded as deleted, but the new name is an untracked file, and `-a` skips those.

### Options worth knowing

| Option | What it does |
|---|---|
| `git rm -n <files>` | Dry run: prints what would be removed |
| `git rm -q <files>` | Quiet: no `rm '…'` lines |
| `git rm -r --cached <folder>` | Stops tracking a whole folder and keeps it on disk |
| `git mv -n old new` | Dry run for a move |
| `git mv -f old new` | Moves even if `new` exists, replacing it |

## Recap

- A deletion is a change: stage it (`git rm <file>`, or `git add <file>` after a plain `rm`), then commit.
- `git rm` deletes and stages in one step; `git rm --cached` stops tracking and keeps the file on disk.
- Older commits still hold a deleted file, so it can come back, and a deleted secret is not erased.
- `git mv old new` renames and stages; it equals `mv`, `git rm old`, `git add new`.
- Git stores no renames. It detects them by comparing content, so keep a rename and a big edit in separate commits.
