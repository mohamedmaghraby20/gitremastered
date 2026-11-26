---
id: undo-basics
title: "Unstage and discard changes"
module: undo-and-fix
bookSection: "2.4 Undoing Things"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things
bookSources:
  - book/progit2/book/02-git-basics/sections/undoing.asc
readFirst: [three-areas]
---

You ran `git add .` and a file that is not ready went in with the rest. Or you spent an hour on an idea that made the code worse, and you want the file back as it was. One command, `git restore`, handles both, and this lesson shows which form to use and what each one costs you.

## Must know

In [Status, stage, commit](lesson:three-areas) you moved changes forward: from the [working tree](term:working-tree) to the [staging area](term:staging-area), then into a commit. Undoing moves them back, one area at a time. So the first question is always the same: where is the change I want to undo?

### Find the change first

`git status` answers that question. It also names the command for each undo, in the hints in brackets:

```console
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   plan.txt

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   README.md
	modified:   app.js
```

Two lists, two undo commands:

| The change is… | You want to… | Run | Your edits |
|---|---|---|---|
| Staged ("Changes to be committed") | Take it out of the next commit | `git restore --staged <file>` | Kept in the working tree |
| Not staged ("Changes not staged for commit") | Throw the edits away | `git restore <file>` | **Gone for good** |
| Staged, and you want it gone completely | Do both | `git restore --staged <file>`, then `git restore <file>` | **Gone for good** |

To **unstage** means to take a change back out of the staging area. To **discard** means to throw away edits in the working tree. The two words sound close, but the first is always safe and the second never is.

This lesson stops at the staging area. Undoing a commit you already made is a different job with different tools, taught in the next three lessons: [Fix the last commit (amend)](lesson:fix-last-commit), [Undo a pushed commit with revert](lesson:revert-a-commit) and [Reset demystified: the three trees](lesson:reset-demystified).

### Set up a file to practise on

The practice project on the right has two edited files, `README.md` and `app.js`. They belong to the first challenge at the end of this lesson, so leave them as they are. Make a file of your own and commit it, so you have something safe to break.

:::try-it
1. Create the file: `echo "Call the bank" > plan.txt`. In the picture, a `plan.txt` sheet marked "new" appears in the working tree.
2. Run `git add plan.txt`, then `git commit -m "Add plan"`. The `plan.txt` sheet leaves the desk, and a new station "Add plan" appears on the history map with the `main` label on it. The file `plan.txt` is now committed with one line.
:::

### Unstage with `git restore --staged`

You have a committed file. Now make the mistake this lesson started with: stage something too early.

`git restore --staged <file>` tells Git: take this file's change back out of the staging area, and leave my file alone. Nothing you typed is lost. The change is simply no longer part of the next commit.

:::try-it
1. Add a line: `echo "Book the venue" >> plan.txt`. The `plan.txt` sheet appears in the working tree, marked "edited".
2. Run `git add plan.txt`. The `plan.txt` sheet slides into the staging area.
3. Run `git status`. The file `plan.txt` is under "Changes to be committed", and the hint above it names the command to unstage.
4. Run `git restore --staged plan.txt`. Git prints nothing. In the picture, the `plan.txt` sheet slides back from the staging area to the working tree.
5. Run `git status` again. The file `plan.txt` is now under "Changes not staged for commit". Run `cat plan.txt` to print the file: both lines are still there.
:::

When do people use it? Most often right after `git add .` staged more than they meant, and whenever two unrelated changes should become two commits. Unstage one, commit the other, then come back.

A new file works the same way. If you stage a file Git has never tracked and then unstage it, the file goes back to "Untracked files". It is not deleted.

### Discard edits with `git restore`

Unstaging kept your edits. Sometimes you want the opposite: the edits were a bad idea, and the file should go back to how it was.

`git restore <file>` tells Git: overwrite this file in my working tree with the version Git has. Whatever you typed since then disappears.

:::predict
question: "plan.txt has two lines in your working tree. The last commit has one. After `git restore plan.txt`, what does `cat plan.txt` print?"
answer: "Only \"Call the bank\". Git copied its own version over your file, so the second line is gone, and no Git command can bring it back."
:::

:::try-it
1. Run `cat plan.txt`. The file has two lines: "Call the bank" and "Book the venue".
2. Run `git restore plan.txt`. Git prints nothing and asks nothing. In the picture, the `plan.txt` sheet disappears from the working tree.
3. Run `cat plan.txt` again. Only "Call the bank" is left.
4. Run `git status`. The file `plan.txt` is in no list: it matches the last commit again.
:::

:::careful
`git restore <file>` deletes your edits without asking, and Git cannot bring them back. Git only keeps what you committed (and, for a while, what you staged). Edits that only ever lived in your working tree were never given to Git, so there is nothing to recover. Before you discard, run `git diff <file>` to read exactly what you are about to lose (the lesson [Read any diff](lesson:diffs-in-depth) covers that command).
:::

Pro Git puts it the same way: anything committed can almost always be recovered, and anything you lose that was never committed is likely gone. When you are unsure whether you still need the edits, don't discard them. Commit them, or set them aside with the stash (the lesson [Stash unfinished work, clean the folder](lesson:stash-and-clean)).

### Several files at once

One file at a time is the safe habit. When you are sure, `git restore` takes more than one name:

| Command | What it restores |
|---|---|
| `git restore app.js README.md` | Those two files |
| `git restore docs/` | Every changed tracked file inside `docs` |
| `git restore .` | Every changed tracked file in the current folder and below |
| `git restore --staged .` | Unstages everything, edits kept |

`git restore --staged .` is the clean way out of a `git add .` you regret. `git restore .` is the most dangerous line in this lesson: it throws away all your unstaged edits in one go. Run `git status` first and read the list.

### Files that restore does not touch

`git restore` works on files Git tracks. A new file that was never staged is untracked, and Git has no older version to put back, so restore leaves it alone. To get rid of it, delete it yourself with `rm scratch.txt`. The stash lesson shows `git clean`, which deletes untracked files in bulk.

### Bring back a file you deleted

Deleting a tracked file is an edit like any other: the working tree no longer matches what Git has. So the same command undoes it.

```console
$ rm plan.txt
$ git status
On branch main
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	deleted:    plan.txt
```

:::try-it
1. Delete the file: `rm plan.txt`. In the picture, the `plan.txt` sheet appears in the working tree marked "deleted".
2. Run `git restore plan.txt`. The "deleted" sheet disappears from the working tree.
3. Run `ls` to list the folder. The file `plan.txt` is back, with the content of the last commit.
:::

If the deletion was also staged, for example with `git rm plan.txt`, it takes the two steps from the table at the top: `git restore --staged plan.txt` to unstage the deletion, then `git restore plan.txt` to bring the file back.

### The old commands

`git restore` arrived in Git 2.23 (2019). Before that, two other commands did these jobs, and Pro Git's main examples, older guides and many answers online still show them.

:::compare
today: "`git restore --staged plan.txt` unstages. `git restore plan.txt` discards edits."
book: "`git reset HEAD plan.txt` unstages. `git checkout -- plan.txt` discards edits. Both still work."
:::

Use `git restore`. Its name says what it does, and it does nothing else. `git reset` and `git checkout` each have other, bigger jobs, which makes a typo with them more costly.

### When it goes wrong

```console
$ git restore scratch.txt
error: pathspec 'scratch.txt' did not match any file(s) known to git
```

Git does not track a file with that name. Either the name has a typo, or the file is untracked, and then there is nothing to restore. Check the name with `git status`. To remove an untracked file, use `rm`.

```console
$ git rm plan.txt
rm 'plan.txt'
$ git restore plan.txt
error: pathspec 'plan.txt' did not match any file(s) known to git
```

The same message, for a different reason: the deletion is staged, so the staging area no longer holds the file. Unstage first with `git restore --staged plan.txt`. After that, `git restore plan.txt` works.

```console
$ git restore
fatal: you must specify path(s) to restore
```

`git restore` always needs to know which files. Name one, or use `.` for everything in the current folder.

The worst mistake prints nothing at all: you restore the wrong file, and its edits are gone. Git has no undo for that. Your editor might: many editors keep their own history of a file (VS Code calls it Timeline, JetBrains editors call it Local History). Look there before you retype the work.

## Under the hood

"Must know" gave you two commands and a rule about which one loses work. This layer shows the one idea behind both, so you can predict what `git restore` does in cases the table does not list.

### Restore copies a file from one area to the next

Git holds up to three versions of each file: one in your working tree, one in the staging area, and one in the last commit. Git's name for the last commit is [HEAD](term:head). The pilot lesson showed commands copying a file forward through these three places. `git restore` copies it backward:

| Command | Copies from | Into | What can be lost |
|---|---|---|---|
| `git add plan.txt` | Working tree | Staging area | Nothing |
| `git restore --staged plan.txt` | Last commit (HEAD) | Staging area | Nothing in your working tree |
| `git restore plan.txt` | Staging area | Working tree | Your unstaged edits |

Read the last row again. Plain `git restore` takes its copy from the **staging area**. The last commit is not involved. Most of the time you cannot tell the difference, because a file with nothing staged is the same in the staging area and in the last commit. The difference shows when a file was staged and then edited again.

### A file staged, then edited again

:::predict
question: "You add a second line to plan.txt and stage it. Then you add a third line and do not stage it. What does plan.txt contain after `git restore plan.txt`: one line, two or three?"
answer: "Two. Git copies the staged version over your file. The third line is discarded, and the staged second line is untouched."
:::

:::try-it
1. Add a line and stage it: `echo "Book the venue" >> plan.txt`, then `git add plan.txt`. The `plan.txt` sheet slides into the staging area.
2. Add another line without staging it: `echo "Order 500 balloons" >> plan.txt`. A second `plan.txt` sheet appears in the working tree.
3. Run `git status -s`. Git prints `MM plan.txt`: staged, then changed again.
4. Run `git restore plan.txt`. The `plan.txt` sheet in the working tree disappears; the one in the staging area stays.
5. Run `cat plan.txt`. The file has two lines. The balloons are gone, and "Book the venue" is still there and still staged (`git status -s` prints `M  plan.txt`).
6. Clean up for the challenges: `git restore --staged plan.txt`, then `git restore plan.txt`.
:::

This makes the staging area useful as a checkpoint. Stage a version that works, keep experimenting, and if the experiment fails, `git restore` takes you back to the staged version and no further.

### Why unstaging is safe

`git restore --staged` only rewrites an entry in the index, the file `.git/index` that lists what the next commit will hold. It never opens the file in your working tree. That is why it cannot lose your edits.

It can lose one thing: a staged version that differs from both the last commit and your working tree. In the example above, if you ran `git restore --staged plan.txt` at step 3, the staged two-line version would be replaced by the commit's one-line version. Your working tree would still hold all three lines, so no text is lost, but the checkpoint is.

### Why a staged deletion needs two steps

After `git rm plan.txt`, the file is gone from the working tree and from the staging area. Plain `git restore plan.txt` copies from the staging area, finds no `plan.txt` there, and fails with the pathspec error. `git restore --staged plan.txt` copies the file from the last commit back into the staging area. Now the staging area has it again, and `git restore plan.txt` can copy it into the working tree.

## Advanced

### Take a file from an older commit

`--source` tells `git restore` to copy from a commit of your choice. The file in your working tree becomes what it was in that commit; nothing else changes.

```console
$ git log --oneline
56affa6 Plan the venue
73171d0 Add plan
$ git restore --source=HEAD~1 plan.txt
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   plan.txt
```

`HEAD~1` means "the commit before the last one"; a commit ID like `73171d0` works too. The old version arrives as an ordinary unstaged change, so you can read it, stage it and commit it. This is how you undo a change to one file without touching the rest of a commit. The lesson "Point at any commit" explains names like `HEAD~1`.

### Unstage and discard in one command

`git restore --staged --worktree plan.txt` (short: `-SW`) does both steps at once: the staging area and the working tree both go back to the last commit. It discards edits, so the careful block above applies.

### Discard part of a file

`git restore -p plan.txt` shows each changed block of the file and asks "Discard this hunk from worktree?". Answer `y` to throw a block away, `n` to keep it, `q` to stop. Use it to drop the debugging lines you added and keep the real fix. `git restore --staged -p` unstages block by block in the same way.

### What Git can still recover

Content you staged at least once was stored in `.git/objects` at that moment, even if you never committed it. Git does not list it anywhere handy, but it is there for a while. The lesson [Recover lost commits with reflog and fsck](lesson:rescue-lost-work) shows how to dig it out. Edits you never staged were never stored, and no Git command finds them.

## Recap

- `git status` shows where a change is, and its hints name the undo command.
- `git restore --staged <file>` unstages: the change leaves the next commit, your edits stay.
- `git restore <file>` discards: the file goes back to the staged version (normally the last commit), and the edits are gone for good.
- Restore only works on tracked files. Delete an untracked file yourself.
- A deleted file comes back with `git restore <file>`; a staged deletion needs `--staged` first.
