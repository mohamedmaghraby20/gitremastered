---
id: stash-and-clean
title: "Stash unfinished work, clean the folder"
module: branching
bookSection: "7.3 Stashing and Cleaning"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning
bookSources:
  - vendor/progit2/book/07-git-tools/sections/stashing-cleaning.asc
readFirst: [branch-and-merge]
---

You are halfway through a change when a teammate asks for an urgent fix on another branch. Your work is too rough to commit, and Git will not let you switch with it lying around. `git stash` puts unfinished work on a shelf and gives it back when you return, and `git clean` clears out the files you never wanted.

## Must know

In the lesson [Switching branches and detached HEAD](lesson:switch-and-detached-head) you saw Git refuse to switch branches when your uncommitted changes would be overwritten. Until now you had two ways out: commit the work or throw it away. This lesson adds a third, and it is the one people reach for most.

### Half-done work in the way

The practice project on the right is a small shop app with half-done work in it. Someone started a `discount` function in `cart.js` and stopped in the middle:

```console
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   cart.js

no changes added to commit (use "git add" and/or "git commit -a")
```

Imagine an urgent job arrives now. You do not want to commit a function that does nothing: every commit should leave the project working. You do not want to discard an hour of thinking either.

### Put work away with `git stash`

`git stash` takes your uncommitted changes, stores them inside the repository, and puts your files back to how they are in the last commit. Your [working tree](term:working-tree) is clean, and the work waits on a shelf called the [stash](term:stash).

```console
$ git stash
Saved working directory and index state WIP on main: 7d7a300 Add checkout
```

Read the line from left to right:

- **Saved working directory and index state**: Git stored your unstaged changes and your staged changes ("index" is the other name of the [staging area](term:staging-area)).
- **WIP on main**: "work in progress", made while you were on the branch `main`.
- **7d7a300 Add checkout**: the commit you were on. Your ID will differ.

`git stash` with nothing after it is short for `git stash push`. Both do the same.

:::try-it
1. Run `git status`. Git lists `cart.js` under "Changes not staged for commit". In the picture, a `cart.js` sheet marked `edited` lies in the working tree.
2. Run `git stash`. Git prints the "Saved working directory…" line. In the picture, the `cart.js` sheet leaves the desk, and a shelf appears above it: "Stash · 1", with the entry "WIP on main: …".
3. Run `git status`. It says "nothing to commit, working tree clean". You could switch branches now.
4. Run `cat cart.js`. The `discount` function is gone from the file. It is not lost: it is on the shelf.
:::

### See what is on the shelf

Once work is out of sight, you need a way to find it again. `git stash list` prints every entry on the shelf:

```console
$ git stash list
stash@{0}: WIP on main: 7d7a300 Add checkout
```

`stash@{0}` is the entry's name. The number in braces counts from the newest: `stash@{0}` is the latest thing you put away, `stash@{1}` the one before it. The stash is a **stack**, like a pile of plates: new entries go on top, and the commands take from the top unless you name another entry.

To look inside an entry without taking it out, use `git stash show`. It prints a summary of the newest entry, and with `-p` the full [diff](term:diff):

```console
$ git stash show
 cart.js | 4 ++++
 1 file changed, 4 insertions(+)
```

### Bring it back: `pop` or `apply`

The urgent job is done and you want your work again. Two commands bring it back, and they differ in one thing.

`git stash pop` puts the newest entry's changes back into your working tree and removes the entry from the shelf.

```console
$ git stash pop
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   cart.js

no changes added to commit (use "git add" and/or "git commit -a")
Dropped refs/stash@{0} (f74080e9cb19f944bec73043537099bb90c1feab)
```

Git shows a `git status` so you can see what came back, then "Dropped": the entry is off the shelf.

`git stash apply` does the same but leaves the entry on the shelf. Use it when you want the same changes in two places, or when you want a safety copy until you are sure the result is right. You then remove the entry yourself with `git stash drop`.

| Command | Changes come back | Entry on the shelf afterwards |
|---|---|---|
| `git stash pop` | Yes | Removed |
| `git stash apply` | Yes | Still there |
| `git stash drop` | No | Removed, the work is gone |

:::predict
question: "You run `git stash apply` and your changes come back. What does `git stash list` print now?"
answer: "The same entry as before. `apply` copies the work back and leaves the shelf alone, so you still have to run `git stash drop` when you no longer need it."
:::

:::try-it
1. Run `git stash list`. One entry: `stash@{0}`, the work you put away.
2. Run `git stash pop`. Git prints a status with `cart.js` modified, and "Dropped". In the picture, the `cart.js` sheet is back in the working tree and the Stash shelf is gone.
3. Run `git stash list` again. It prints nothing: the shelf is empty.
:::

### New files stay behind unless you say `-u`

So far the work was an edit to a file Git already tracks. Real work often includes brand-new files too, and here `git stash` surprises people.

`git stash` takes changes to **tracked** files only, staged or not. A new file that Git does not track yet (an [untracked file](term:untracked-file)) stays exactly where it is.

:::predict
question: "You have an edited `cart.js` and a brand-new `ideas.txt`. You run `git stash`. What does `git status` show afterwards?"
answer: "`ideas.txt` is still listed as untracked. The stash took only the change to `cart.js`, the tracked file, so the working tree is not clean yet."
:::

To take new files too, add `-u` (short for `--include-untracked`). While you are at it, give the entry a message with `-m`, so you can tell entries apart later:

```console
$ git stash push -u -m "Half-done discount"
Saved working directory and index state On main: Half-done discount
$ git stash list
stash@{0}: On main: Half-done discount
```

With a message, the entry reads "On main: Half-done discount" where the automatic one said "WIP on main: 7d7a300 Add checkout". Three weeks later only the first one tells you what it holds.

:::try-it
1. Create a file of your own: `echo "Free shipping over 50?" > ideas.txt`. In the picture, an `ideas.txt` sheet marked `new` joins `cart.js` in the working tree.
2. Run `git stash`, then `git status -s`. Git prints `?? ideas.txt`: the new file stayed behind. In the picture, only the `cart.js` sheet went to the shelf.
3. Run `git stash pop` to take the work back.
4. Now run `git stash push -u -m "Half-done discount"`, then `git status`. The working tree is clean, and the shelf in the picture reads "On main: Half-done discount".
5. Run `git stash pop`. Both sheets are back: `cart.js` marked `edited` and `ideas.txt` marked `new`.
:::

Files that a `.gitignore` tells Git to skip (see [Ignore files with .gitignore](lesson:ignoring-files)) are left alone even with `-u`. That is what you want: nobody needs their build output on a shelf.

### Several entries, and other branches

A shelf with one entry is simple. After a busy week it may hold three, and you need to pick the right one.

Every stash command takes an entry name. Without one, it uses `stash@{0}`:

```console
$ git stash list
stash@{0}: On main: Card payments idea
stash@{1}: On main: Half-done discount
$ git stash pop stash@{1}
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   cart.js

no changes added to commit (use "git add" and/or "git commit -a")
Dropped stash@{1} (2e20b31e903ae68c485032e360f10008f4a153a4)
```

After an entry leaves, the others are renumbered. Always run `git stash list` again before you name an entry.

The shelf belongs to the whole repository, not to one branch. "On main" in an entry only records where it was made. You can stash on `main`, switch to another branch and pop there. This is the usual cure for "I started this work on the wrong branch".

### What comes back staged

One detail of `pop` and `apply` catches people who stage carefully. If some of your changes were staged when you stashed, they come back **unstaged**:

Here `rates.js` is staged (the `M` in the left column) and `cart.js` is not:

```console
$ git status -s
 M cart.js
M  rates.js
```

After `git stash` and a plain `git stash apply`, both files are only modified:

```console
$ git status -s
 M cart.js
 M rates.js
```

Nothing is lost, but your choice of what to stage is. To get that back too, add `--index`. Git then prints the status you started with:

```console
$ git stash apply --index
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   rates.js

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   cart.js

```

`git stash pop --index` works the same way.

### Throw entries away

Some shelved work turns out to be a dead end. `git stash drop` removes one entry (the newest, or the one you name), and `git stash clear` removes all of them.

:::careful
`git stash drop` and `git stash clear` delete work that was never committed, and Git prints no warning and asks no question. Run `git stash show -p` on an entry before you drop it. `git stash clear` empties the whole shelf at once, so list it first.
:::

### Remove files you never wanted: `git clean`

Stash is for work you want back. The opposite case is just as common: your folder fills up with files you never want again, like a log from a test run, a backup copy your editor left, or a scratch file. They are untracked, so `git restore` (the lesson [Unstage and discard changes](lesson:undo-basics)) does not touch them.

`git clean` deletes untracked files from your working tree.

Because that is dangerous, Git refuses to do it until you say you mean it. And you should always look before you delete: `-n` (short for `--dry-run`) lists what would be removed and removes nothing.

```console
$ git clean -n
Would remove ideas.txt
Would remove output.log
```

When the list is right, swap `-n` for `-f` ("force"):

```console
$ git clean -f
Removing ideas.txt
Removing output.log
```

The options you will need:

| Option | What it adds | When to use it |
|---|---|---|
| `-n` | Only lists, deletes nothing | Every time, first |
| `-f` | Really deletes | After `-n` showed the right list |
| `-d` | Untracked folders too | Leftover folders like `tmp/` |
| `-x` | Ignored files too | A fully fresh build: wipes `build/`, `node_modules/` |
| `-i` | Asks about the files in a small menu | When you want to pick by hand |

Without `-d`, `git clean` skips untracked folders. Without `-x`, it leaves everything your `.gitignore` covers:

```console
$ git clean -n -d
Would remove scratch.txt
$ git clean -n -d -x
Would remove build/
Would remove scratch.txt
```

You can also name what to clean, and Git touches nothing else: `git clean -f -d tmp output.log` removes the folder `tmp` and the file `output.log` only.

:::careful
`git clean` deletes files Git never had a copy of. They do not go to your computer's recycle bin, and no Git command brings them back. Run it with `-n` first, every time, and read the list. Be extra careful with `-x`: it also removes ignored files such as a `.env` file with your local passwords.
:::

:::try-it
1. Your `ideas.txt` from before is a good file to throw away. Add a second one: `echo "test run" > output.log`. In the picture, both sheets sit in the working tree marked `new`.
2. Run `git clean -n`. Git prints "Would remove ideas.txt" and "Would remove output.log". Nothing is deleted yet, and `cart.js` is not on the list: it is tracked.
3. Run `git clean -f`. Git prints "Removing…" for both files. In the picture, the two `new` sheets disappear; the `cart.js` sheet stays.
4. Run `git status`. Only `cart.js` is listed, modified as at the start.
:::

### When it goes wrong

Four messages you are likely to meet:

```console
$ git stash
No local changes to save
```

There is nothing to put away: no tracked file has a change. If you expected a new file to be stashed, it is untracked, so use `git stash -u`.

```console
$ git clean
fatal: clean.requireForce is true and -f not given: refusing to clean
```

Git protects you from a bare `git clean`. Run `git clean -n` to see the list, then `git clean -f`.

```console
$ git stash pop
error: Your local changes to the following files would be overwritten by merge:
	cart.js
Please commit your changes or stash them before you merge.
Aborting
The stash entry is kept in case you need it again.
```

You edited `cart.js` since you stashed, and the entry wants to change it too. Git stops before touching anything. Commit your new edits (or stash them as well), then pop again.

```console
$ git stash pop
Auto-merging cart.js
CONFLICT (content): Merge conflict in cart.js
The stash entry is kept in case you need it again.
```

The branch moved on while your work was on the shelf: a commit changed the same lines. Git puts both versions in the file between conflict markers, exactly like a [merge conflict](term:merge-conflict) (the lesson [Branch, merge, and fix conflicts](lesson:branch-and-merge)):

```console
<<<<<<< Updated upstream
  return total * 0.9;
=======
  // TODO: finish this
>>>>>>> Stashed changes
```

"Updated upstream" is what the branch has now; "Stashed changes" is your shelved work. Edit the file until it is right, then run `git add cart.js` to tell Git the conflict is solved. Read the last line of the message again: **the entry is kept**. A `pop` that hits a conflict does not remove it, so finish with `git stash drop`.

## Under the hood

"Must know" treated the stash as a shelf. This layer shows what the shelf is made of, which explains why stashed work is safe and why the history map does not show it.

### A stash entry is a commit

When you run `git stash`, Git makes real [commits](term:commit) from your work, the same kind of object as any other commit. It just puts no branch on them.

```console
$ git log --oneline --graph stash@{0}
*   77c3110 On main: Card payments idea
|\  
| * ceaa5b9 index on main: d6c51a5 Ignore build output
|/  
* d6c51a5 Ignore build output
* 7d7a300 Add checkout
* 10d77b7 Add cart
* ebea840 Add README
```

The top two lines are the entry:

- `ceaa5b9 index on main` is a commit of your staging area as it was.
- `77c3110 On main: Card payments idea` is a commit of your working tree. It has two parents: the commit you were on (`d6c51a5`) and the staging-area commit. That is how `--index` can give your staging back.

With `-u`, Git adds a third commit that holds the untracked files.

:::graph
caption: "A stash entry: two commits on top of the commit you were on, with no branch pointing at them"
commits:
  - id: A
    message: Add cart
  - id: B
    message: Add checkout
    parents: [A]
  - id: I
    message: index on main
    parents: [B]
    faded: true
  - id: W
    message: "On main: Card payments idea"
    parents: [B, I]
    faded: true
branches:
  main: B
head: main
:::

### Where the shelf is kept

No branch points at these commits. One special [ref](term:ref) does: the file `.git/refs/stash` holds the ID of the newest entry.

```console
$ cat .git/refs/stash
77c31105d1d3e9273e4881dff414625e075e61bb
```

Older entries are not refs of their own. They are earlier lines in that ref's [reflog](term:reflog), the diary Git keeps of where a ref pointed before. `stash@{1}` means "where `refs/stash` pointed one step ago". That is why the numbers shift when an entry leaves.

This also explains three things you saw:

- `git stash` works on any branch, and `pop` works on any other: an entry is tied to a commit, not to a branch.
- `pop` can hit a conflict: bringing an entry back is a merge of the stash commit into your current files.
- The app's history map leaves stash commits out. They are storage for unfinished work, not part of your project's history, so the picture shows them on the Stash shelf.

## Advanced

### A branch from a stash

When `git stash pop` conflicts because the branch moved on, Pro Git suggests a calmer way. `git stash branch <name>` creates a new branch at the commit where you made the stash, switches to it, applies the entry there and drops it. The work always fits, because the files are exactly as they were when you stashed.

```console
$ git stash branch discount-work
Switched to a new branch 'discount-work'
On branch discount-work
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   cart.js

no changes added to commit (use "git add" and/or "git commit -a")
Dropped refs/stash@{0} (100c743316eae9a2ee9221da6b899f964ee16b01)
```

Commit the work on that branch, then merge it when you are ready.

### Stash only part of your work

| Command | What goes on the shelf |
|---|---|
| `git stash push -- cart.js` | Only the changes to the paths you name |
| `git stash push -p` | Only the pieces you pick: Git asks about each [hunk](term:hunk) |
| `git stash push --staged` | Only what is staged |
| `git stash push --keep-index` | Everything, but your staged changes also stay in place |
| `git stash push -a` | Everything, including ignored files (`--all`) |

`--keep-index` is handy before a commit: stash, run your tests against exactly what is staged, then pop.

### `git stash save`

:::compare
today: "`git stash push -m \"Half-done discount\"` puts work away with a message, and can take paths after `--`."
book: "`git stash save \"Half-done discount\"` is the older form. Pro Git notes it is being replaced by `push`; it still works, but cannot take paths."
:::

### Clean only what is ignored

`git clean -X` (a capital X) removes only ignored files and keeps your other untracked files. It gives you a fresh build without touching new work you have not added yet. `git clean -e <pattern>` goes the other way: it protects files that match the pattern, as in `git clean -f -d -e coupon.js`.

If a folder you want to clean holds another Git repository, `git clean -f -d` skips it. Pro Git's note: a second `-f` forces it.

### Stash everything before a clean

If you are not sure the untracked files are worthless, Pro Git offers a safer move than `git clean`: `git stash --all` removes everything from the working tree, ignored files included, but keeps it in a stash entry you can still pop.

### For long pauses, commit

A stash entry has no branch, a short message and no place in `git log`. After a few weeks nobody remembers what `stash@{3}` was. For work you will leave for more than a day, a commit on its own branch is safer: `git switch -c discount-wip`, then `git commit -am "WIP: discount"`. It shows in the history, it can be pushed as a backup, and you can tidy it later (the lesson [Fix the last commit (amend)](lesson:fix-last-commit)).

Scripts can also build an entry by hand with `git stash create` and `git stash store`; you will rarely need them.

## Recap

- `git stash` shelves your uncommitted changes to tracked files and leaves a clean working tree; add `-u` for new files and `push -m "…"` for a message.
- `git stash list` shows the shelf; `stash@{0}` is the newest entry.
- `git stash pop` brings work back and removes the entry; `git stash apply` keeps it. After a conflict the entry stays: fix, `git add`, then `git stash drop`.
- The shelf is shared by all branches, so you can stash on one and pop on another.
- `git clean -n` lists untracked files, `git clean -f` deletes them for good; `-d` adds folders, `-x` adds ignored files.
