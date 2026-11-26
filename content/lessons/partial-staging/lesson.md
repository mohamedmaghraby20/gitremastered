---
id: partial-staging
title: "Stage part of a file"
module: history-mastery
bookSection: "7.2 Interactive Staging"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging
bookSources:
  - book/progit2/book/07-git-tools/sections/interactive-staging.asc
readFirst: [three-areas]
---

You fixed a bug and, in the same file, left a debugging line you are not ready to share. `git add` would take both. This lesson shows how to stage only some of the changes in a file, so each commit holds one job even when your edits were mixed together.

## Must know

In [the three areas lesson](lesson:three-areas) you chose **which files** go into a commit. `git add trip.txt` took the whole file, every change in it. Real work is not that tidy: one file often holds two unrelated edits. So the new question is how to choose **which changes inside a file** go into the next commit.

The tool is `git add -p`. The `-p` is short for `--patch`, and people call this way of working **patch mode**. A patch is simply a set of changes, the same thing a [diff](term:diff) shows.

### One file, two jobs

`git add -p` tells Git: show me my changes one block at a time, and ask me about each one.

Each block is a [hunk](term:hunk): a group of changed lines with a few unchanged lines around them, as you saw in [Read any diff](lesson:diffs-in-depth). For every hunk you answer `y` (yes, stage it) or `n` (no, leave it).

You need a file with two separate changes to try it. Make one of your own, so the practice files stay as they are for the challenges at the end.

:::try-it
1. Create a trip plan. Copy this as one line: `printf '%s\n' "Trip plan" "Day 1: drive to the lake" "Day 2: hike" "Day 3: rest" "Day 4: canoe" "Day 5: market" "Day 6: old town" "Day 7: beach" "Day 8: boat tour" "Day 9: rest" "Day 10: museum" "Day 11: shopping" "Day 12: pack" "Day 13: drive home" > trip.txt`. The `printf` command writes each quoted text on its own line, so `trip.txt` has 14 lines. In the picture, a `trip.txt` sheet marked "new" appears in the working tree.
2. Commit the file: `git add trip.txt`, then `git commit -m "Add trip plan"`. In the picture, the `trip.txt` sheet passes through the staging area, and a new station appears on the history map.
3. Change day 2: `sed -i 's/Day 2: hike/Day 2: hike to the waterfall/' trip.txt`. The `sed` command edits a file from the terminal: here it swaps the first text for the second. You could make the same edit in your editor. In the picture, a `trip.txt` sheet marked "modified" appears in the working tree.
4. Change day 12: `sed -i 's/Day 12: pack/Day 12: pack and clean up/' trip.txt`. The file `trip.txt` now holds two edits, far apart.
5. Run `git diff trip.txt`. Git prints two hunks, each starting with an `@@` line: one around day 2 and one around day 12.
:::

```console
$ git diff trip.txt
diff --git a/trip.txt b/trip.txt
index f4882f5..853120a 100644
--- a/trip.txt
+++ b/trip.txt
@@ -1,6 +1,6 @@
 Trip plan
 Day 1: drive to the lake
-Day 2: hike
+Day 2: hike to the waterfall
 Day 3: rest
 Day 4: canoe
 Day 5: market
@@ -10,5 +10,5 @@ Day 8: boat tour
 Day 9: rest
 Day 10: museum
 Day 11: shopping
-Day 12: pack
+Day 12: pack and clean up
 Day 13: drive home
```

Say the waterfall hike is decided, but the clean-up on day 12 is still under discussion. You want a commit with the day 2 change only.

### Stage one hunk with `git add -p`

The file has two hunks, so Git will ask two questions.

```console
$ git add -p trip.txt
diff --git a/trip.txt b/trip.txt
index f4882f5..853120a 100644
--- a/trip.txt
+++ b/trip.txt
@@ -1,6 +1,6 @@
 Trip plan
 Day 1: drive to the lake
-Day 2: hike
+Day 2: hike to the waterfall
 Day 3: rest
 Day 4: canoe
 Day 5: market
(1/2) Stage this hunk [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]? y
@@ -10,5 +10,5 @@ Day 8: boat tour
 Day 9: rest
 Day 10: museum
 Day 11: shopping
-Day 12: pack
+Day 12: pack and clean up
 Day 13: drive home
(2/2) Stage this hunk [y,n,q,a,d,K,J,g,/,e,p,P,?]? n
```

Read the last line of each question:

- `(1/2)` means hunk 1 of 2.
- **Stage this hunk** is the question. Other commands in this lesson ask a different one, so always read it.
- The letters in brackets are the answers Git accepts right now. You type one letter and press Enter.

After the last answer the command ends and prints nothing more. Nothing is committed yet: `git add -p` only fills the staging area, like `git add`.

:::predict
question: "You will answer y for the day 2 hunk and n for the day 12 hunk. What will git status show for trip.txt afterwards?"
answer: "trip.txt in two lists at once: under \"Changes to be committed\" (the day 2 hunk you staged) and under \"Changes not staged for commit\" (the day 12 hunk you left). In the short form that is MM."
:::

:::try-it
1. Run `git add -p trip.txt`. Git shows the day 2 hunk and asks "Stage this hunk?".
2. Type `y` and press Enter. Git shows the day 12 hunk and asks again.
3. Type `n` and press Enter. The command ends. In the picture, a `trip.txt` sheet appears in the staging area, and a `trip.txt` sheet stays in the working tree: the same file is in both places.
4. Run `git status`. The file `trip.txt` is listed twice: once under "Changes to be committed" and once under "Changes not staged for commit".
:::

```console
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   trip.txt

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   trip.txt
```

You may see other practice files in the lists too; leave them alone.

This is the same picture as "staged, then edited again" from the three areas lesson, reached another way. The [staging area](term:staging-area) holds a version of `trip.txt` with the day 2 change only. Your working tree holds a version with both changes. Git calls this file **partially staged**.

The common wrong idea is that Git now remembers "a list of chosen lines". It does not. The staging area holds a whole file, as always: your last commit's `trip.txt` plus the one hunk you said yes to.

| Line | Last commit | Staging area | Working tree |
|---|---|---|---|
| Day 2 | hike | hike to the waterfall | hike to the waterfall |
| Day 12 | pack | pack | pack and clean up |

### Check before you commit

A partly staged file is easy to get wrong, so look before you commit. Two commands show the two halves.

`git diff --staged` shows what is in the staging area: what the next commit will change. `git diff` alone shows what you left behind in the working tree.

```console
$ git diff --staged trip.txt
diff --git a/trip.txt b/trip.txt
index f4882f5..9560f43 100644
--- a/trip.txt
+++ b/trip.txt
@@ -1,6 +1,6 @@
 Trip plan
 Day 1: drive to the lake
-Day 2: hike
+Day 2: hike to the waterfall
 Day 3: rest
 Day 4: canoe
 Day 5: market
```

Only the day 2 hunk: exactly the commit you want.

:::try-it
1. Run `git diff --staged trip.txt`. Git prints the day 2 hunk only: this is what the next commit will hold.
2. Run `git diff trip.txt`. Git prints the day 12 hunk only: this stays in your working tree.
3. Run `git commit -m "Hike to the waterfall on day 2"`. Git reports `1 file changed, 1 insertion(+), 1 deletion(-)`. In the picture, the `trip.txt` sheet leaves the staging area, a new station appears on the history map, and the `main` label moves onto it. The `trip.txt` sheet in the working tree stays.
4. Run `git status -s`. The file `trip.txt` shows ` M`: the day 12 change is still there, not staged, not lost.
:::

Your file never changed during all this. `git add -p` only writes to the staging area. Your earlier commits are untouched too.

:::careful
After staging part of a file, commit with plain `git commit`. `git commit -a` stages every change in tracked files first, so the hunks you answered `n` to go into the commit as well.
:::

### Split a hunk with `s`

That worked because the two edits were far apart. When two edits sit close together, Git shows them as one hunk, and `y` or `n` would take both or neither.

The answer `s` (split) tells Git: cut this hunk into smaller hunks and ask me about each one.

:::predict
question: "The day 12 change is still unstaged. You now also change day 10, two lines above it. How many hunks will git add -p show?"
answer: "One. Git shows three unchanged lines around every change, and changes that close share their surrounding lines, so Git joins them into a single hunk. That is the case s is for."
:::

:::try-it
1. Change day 10: `sed -i 's/Day 10: museum/Day 10: museum (book tickets)/' trip.txt`. The file `trip.txt` now has two unstaged edits, on day 10 and day 12, with one unchanged line between them.
2. Run `git add -p trip.txt`. Git shows a single hunk, `(1/1)`, that holds both edits. The list of answers now includes `s`.
3. Type `s` and press Enter. Git prints "Split into 2 hunks." and shows the day 10 part alone, as `(1/2)`.
4. Type `n` for the day 10 part, then `y` for the day 12 part. In the picture, a `trip.txt` sheet appears in the staging area again, while a `trip.txt` sheet stays in the working tree.
5. Run `git diff --staged trip.txt`. Git prints the day 12 change only.
6. Run `git commit -m "Clean up on day 12"`. In the picture, a new station appears on the history map, and the day 10 edit stays behind in the working tree.
:::

```console
$ git add -p trip.txt
diff --git a/trip.txt b/trip.txt
index 9560f43..f2534ff 100644
--- a/trip.txt
+++ b/trip.txt
@@ -8,7 +8,7 @@ Day 6: old town
 Day 7: beach
 Day 8: boat tour
 Day 9: rest
-Day 10: museum
+Day 10: museum (book tickets)
 Day 11: shopping
-Day 12: pack
+Day 12: pack and clean up
 Day 13: drive home
(1/1) Stage this hunk [y,n,q,a,d,s,e,p,P,?]? s
Split into 2 hunks.
@@ -8,5 +8,5 @@ Day 6: old town
 Day 7: beach
 Day 8: boat tour
 Day 9: rest
-Day 10: museum
+Day 10: museum (book tickets)
 Day 11: shopping
(1/2) Stage this hunk [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]? n
@@ -12,3 +12,3 @@
 Day 11: shopping
-Day 12: pack
+Day 12: pack and clean up
 Day 13: drive home
(2/2) Stage this hunk [y,n,q,a,d,K,J,g,/,e,p,P,?]? y
```

`s` only appears in the list when Git can split: there must be at least one unchanged line between the edits. Here that line is "Day 11: shopping". Two edits on lines that touch cannot be split; for those there is `e`, below.

### The other answers

You now know `y`, `n` and `s`. The list in brackets is longer, and a few more letters are worth knowing. Type `?` at any question and Git prints what every letter does:

```console
(1/2) Stage this hunk [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]? ?
y - stage this hunk
n - do not stage this hunk
q - quit; do not stage this hunk or any of the remaining ones
a - stage this hunk and all later hunks in the file
d - do not stage this hunk or any of the later hunks in the file
j - go to the next undecided hunk, roll over at the bottom
J - go to the next hunk, roll over at the bottom
k - go to the previous undecided hunk, roll over at the top
K - go to the previous hunk, roll over at the top
g - select a hunk to go to
/ - search for a hunk matching the given regex
e - manually edit the current hunk
p - print the current hunk
P - print the current hunk using the pager
? - print help
```

| Answer | What it does | When to use it |
|---|---|---|
| `y` / `n` | Stage this hunk, or leave it | Every time; these two do most of the work |
| `s` | Split the hunk into smaller ones | Two edits share a hunk and you want one of them |
| `q` | Stop now | You have staged what you wanted. The hunks you already said `y` to stay staged |
| `a` / `d` | Yes, or no, to this hunk and every later hunk in this file | A long file where the rest is all the same answer |
| `e` | Open the hunk in your editor and change it by hand | The edits touch, so `s` cannot split them. See Advanced |
| `?` | Print the help above | You forgot a letter |
| `j` `k` `g` `/` | Move between hunks without answering | Rarely; useful in a file with dozens of hunks |

The letters in brackets change with the situation. `s` shows up only when a split is possible, and the moving letters only when there is more than one hunk.

Run `git add -p` with no file name and Git walks through every changed file it tracks, one hunk after another. Many developers stage this way every time: it is a last read of your own work before it goes into a commit.

### Unstage part of what you staged

Patch mode also runs backwards. Suppose you staged too much, for example with a quick `git add trip.txt` that took a note meant only for you.

`git restore --staged -p` tells Git: walk through what is staged, and ask me which hunks to take back out. The hunks you [unstage](term:unstage) stay in your working tree; nothing is lost. It is the hunk-by-hunk form of `git restore --staged` from [Unstage and discard changes](lesson:undo-basics).

:::try-it
1. Add a note under the title: `sed -i '1a TODO: ask Sam about the car' trip.txt`. Here `1a` means "add this text as a new line after line 1". The file `trip.txt` now has two unstaged changes: the new TODO line and the day 10 edit from before.
2. Stage everything: `git add trip.txt`, then `git status -s`. The file `trip.txt` shows `M `: both changes are staged. In the picture, the `trip.txt` sheet is in the staging area only.
3. Run `git restore --staged -p trip.txt`. Git shows the TODO hunk and asks "Unstage this hunk?": the question has changed.
4. Type `y` for the TODO hunk, then `n` for the day 10 hunk. In the picture, a `trip.txt` sheet appears in the working tree again, next to the one in the staging area.
5. Run `git diff --staged trip.txt`. Git prints the day 10 change only; the TODO line is out of the staging area.
6. Run `git commit -m "Book museum tickets for day 10"`. In the picture, a new station appears on the history map. The TODO line is still in your file, unstaged.
:::

```console
$ git restore --staged -p trip.txt
diff --git a/trip.txt b/trip.txt
index 853120a..e1ee203 100644
--- a/trip.txt
+++ b/trip.txt
@@ -1,4 +1,5 @@
 Trip plan
+TODO: ask Sam about the car
 Day 1: drive to the lake
 Day 2: hike to the waterfall
 Day 3: rest
(1/2) Unstage this hunk [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]? y
@@ -8,7 +9,7 @@ Day 6: old town
 Day 7: beach
 Day 8: boat tour
 Day 9: rest
-Day 10: museum
+Day 10: museum (book tickets)
 Day 11: shopping
 Day 12: pack and clean up
 Day 13: drive home
(2/2) Unstage this hunk [y,n,q,a,d,K,J,g,/,e,p,P,?]? n
```

Here `y` means "yes, unstage it". The letters are the same in every patch command, but what yes does depends on the question.

### Discard part of your edits

The last direction: throwing away some edits in the working tree and keeping others. Debugging lines are the usual case.

`git restore -p` (without `--staged`) tells Git: walk through my unstaged changes, and ask me which hunks to [discard](term:discard). A discarded hunk is removed from your file.

:::try-it
1. Run `git restore -p trip.txt`. Git shows the TODO hunk and asks "Discard this hunk from worktree?". Worktree is short for working tree.
2. Type `y` and press Enter. Git removes the TODO line from `trip.txt`. In the picture, the `trip.txt` sheet leaves the working tree: nothing is left to stage or commit.
3. Run `git status -s trip.txt`. Git prints nothing: the file `trip.txt` matches your last commit.
:::

```console
$ git restore -p trip.txt
diff --git a/trip.txt b/trip.txt
index f2534ff..e1ee203 100644
--- a/trip.txt
+++ b/trip.txt
@@ -1,4 +1,5 @@
 Trip plan
+TODO: ask Sam about the car
 Day 1: drive to the lake
 Day 2: hike to the waterfall
 Day 3: rest
(1/1) Discard this hunk from worktree [y,n,q,a,d,e,p,P,?]? y
```

:::careful
`git restore -p` is the one patch command here that destroys work. A hunk you discard was never committed, so Git has no copy and cannot bring it back. Read the question before you press `y`: "Stage" and "Unstage" are safe, "Discard" is not.
:::

You started with edits mixed together in one file and ended with three commits, one job each. The lesson "Commit messages and atomic commits" explains why small commits like these pay off in review and when something breaks.

:::graph
caption: "Three small commits from edits that were mixed in one file"
commits:
  - id: A
    message: Add trip plan
  - id: B
    message: Hike to the waterfall on day 2
    parents: [A]
  - id: C
    message: Clean up on day 12
    parents: [B]
  - id: D
    message: Book museum tickets for day 10
    parents: [C]
branches:
  main: D
head: main
:::

The three patch commands side by side:

| Command | The question | `y` moves the hunk | Can lose work? |
|---|---|---|---|
| `git add -p` | Stage this hunk? | Into the staging area | No |
| `git restore --staged -p` | Unstage this hunk? | Out of the staging area; your file keeps it | No |
| `git restore -p` | Discard this hunk from worktree? | Out of your file, for good | Yes |

Pro Git shows older commands for the last two. They still work, and you will meet them in older guides.

:::compare
today: "`git restore --staged -p` unstages chosen hunks, and `git restore -p` discards chosen hunks from the working tree."
book: "`git reset -p` (or `--patch`) unstages chosen hunks, and `git checkout -p` discards them. Both ask the same questions as today's commands."
:::

### The menu: `git add -i`

Pro Git opens its chapter with a bigger tool that contains patch mode: `git add -i` (`--interactive`). It shows a table of your changed files and a menu, and waits for a command.

```console
$ git add -i
           staged     unstaged path
  1:        +1/-1        +1/-1 trip.txt

*** Commands ***
  1: [s]tatus	  2: [u]pdate	  3: [r]evert	  4: [a]dd untracked
  5: [p]atch	  6: [d]iff	  7: [q]uit	  8: [h]elp
What now>
```

The table is a compact `git status`. This one was taken while `trip.txt` was partially staged: `+1/-1` under "staged" means one line added and one removed in the staging area, and the same again under "unstaged".

At `What now>` you type a number or the letter in brackets:

| Menu command | Same as |
|---|---|
| `u` update | `git add` on the files you pick by number |
| `r` revert | `git restore --staged` on the files you pick |
| `a` add untracked | `git add` on new files |
| `p` patch | `git add -p` |
| `d` diff | `git diff --staged` |
| `q` quit | Leave the menu |

Is it worth using? Rarely. Each menu entry is a command you already know, and typing the command is quicker. Most developers skip the menu and go straight to `git add -p`. Learn to recognise the menu, so that `git add -i` in a guide does not surprise you, and type `q` to get out.

### When it goes wrong

Three things almost everyone meets with patch mode.

```console
$ git add -p new.txt
No changes.
```

`new.txt` is untracked. Patch mode compares a file with its staged version, and a new file has none yet. Stage a new file whole with `git add new.txt`. To stage only part of a new file, see `git add -N` in Advanced. You get the same message when the file has no unstaged changes at all.

```console
(1/1) Stage this hunk [y,n,q,a,d,e,p,P,?]? s
Sorry, cannot split this hunk
```

The edits in this hunk sit on lines that touch, so there is no unchanged line to cut at. Notice that `s` is missing from the letters in brackets. Use `e` to edit the hunk by hand (Advanced), or stage the hunk whole.

```console
$ git commit -a -m "Hike to the waterfall on day 2"
[main 65fd0cb] Hike to the waterfall on day 2
 1 file changed, 2 insertions(+), 2 deletions(-)
```

You staged one hunk, but the commit says two lines changed: `-a` staged the rest of the file before committing. If you have not shared the commit, undo it with `git reset --soft HEAD~1`. `HEAD~1` means "the commit before the one I am on", so this takes the last commit back and keeps every change staged ([Reset demystified](lesson:reset-demystified)). Then unstage the extra hunk with `git restore --staged -p` and commit again without `-a`.

## Under the hood

"Must know" showed that one file can sit in the staging area and the working tree at once. This layer shows what Git really holds in each place, which explains every patch command in one table.

### Three whole files, not a list of lines

The three areas lesson showed that Git can hold three versions of a file: the last commit's, the staging area's and the working tree's. Partial staging is simply the moment when all three differ.

Right after you answered `y` and `n` in the first Try-it, the three versions of `trip.txt` had three different content IDs:

```console
$ git rev-parse HEAD:trip.txt
f4882f54e2a5e597a47243a3548e60fcdb12df60
$ git ls-files --stage trip.txt
100644 9560f4334e5df3f6ca189cd5a9fff2ee30aab74b 0	trip.txt
$ git hash-object trip.txt
853120a51d817ce3c07de4b845ad879fa81a59ed
```

- `git rev-parse HEAD:trip.txt` prints the ID of the file's content in the last commit (`HEAD` is Git's name for the commit you are on).
- `git ls-files --stage` prints the ID recorded in the staging area.
- `git hash-object` computes the ID of the file in your working tree.

The middle one, `9560f43…`, is a version of the file that never existed on your disk: the old file plus the day 2 hunk. Git built it for you and stored it as a full file. That is why the commit needs no special handling afterwards: a commit records the staging area, as always.

### How Git builds the staged version

When you answer `y`, Git does not copy lines from your file. It collects the hunks you chose into one patch, and applies that patch to the staged version of the file. Your working tree is only read, never written.

You can see the machinery when a hand-edited hunk goes wrong (Advanced): the error names the command Git runs inside, `git apply --cached`. `git apply` applies a patch, and `--cached` means "to the staging area only".

### Which two versions each command compares

Every patch command shows the difference between two of the three versions, and `y` copies a hunk from one to the other.

| Command | Shows the difference between | `y` changes |
|---|---|---|
| `git add -p` | Staging area and working tree | The staging area |
| `git restore --staged -p` | Last commit and staging area | The staging area |
| `git restore -p` | Staging area and working tree | The working tree |
| `git diff` | Staging area and working tree | Nothing |
| `git diff --staged` | Last commit and staging area | Nothing |

Two things follow from the table:

- `git add -p` and `git restore -p` walk through the same hunks, the ones `git diff` prints. One stages them, the other deletes them.
- `git restore --staged -p` walks through the hunks `git diff --staged` prints. A change you never staged does not show up there.

So before any patch command, the matching `git diff` shows exactly which hunks you will be asked about.

### Why hunks join, and where `s` can cut

Git prints three unchanged lines above and below every change, so you can see where you are. These are called context lines.

When two changes are six lines apart or fewer, their context lines meet or overlap, and Git prints them as one hunk. In the first Try-it, nine unchanged lines lay between day 2 and day 12: two hunks. Later, only one unchanged line lay between day 10 and day 12: one hunk.

`s` cuts a hunk at the unchanged lines inside it. One unchanged line is enough. With none, as when the edits are on lines that touch, there is nowhere to cut, and Git says "Sorry, cannot split this hunk".

## Advanced

### Edit a hunk by hand with `e`

When two edits touch, `s` cannot help. `e` opens the hunk in your editor, where you rewrite the hunk into the change you want staged.

Say you changed day 5 and day 6, and only day 5 should be staged. After `e`, the editor shows:

```console
# Manual hunk edit mode -- see bottom for a quick guide.
@@ -3,8 +3,8 @@ Day 1: drive to the lake
 Day 2: hike
 Day 3: rest
 Day 4: canoe
-Day 5: market
-Day 6: old town
+Day 5: farmers market
+Day 6: old town walk
 Day 7: beach
 Day 8: boat tour
 Day 9: rest
# ---
# To remove '-' lines, make them ' ' lines (context).
# To remove '+' lines, delete them.
# Lines starting with # will be removed.
# If the patch applies cleanly, the edited hunk will immediately be marked for staging.
# If it does not apply cleanly, you will be given an opportunity to
# edit again.  If all lines of the hunk are removed, then the edit is
# aborted and the hunk is left unchanged.
```

Each line starts with one character: a space (unchanged), `-` (removed) or `+` (added). Make the hunk read like the diff you want to stage:

1. Delete the line `+Day 6: old town walk`: that addition will not be staged.
2. In `-Day 6: old town`, replace the `-` with a space: that line is no longer removed.
3. Move ` Day 6: old town` below `+Day 5: farmers market`, so the lines are in the order the staged file should have.

The middle of the hunk then reads:

```console
 Day 4: canoe
-Day 5: market
+Day 5: farmers market
 Day 6: old town
 Day 7: beach
```

Save and close the editor. Git stages the edited hunk; your file still holds both edits.

:::careful
Step 3 is easy to forget. Without it the hunk says "keep `Day 6: old town`, then add `Day 5: farmers market`", and the staged file has day 6 above day 5. Git accepts that without complaint. Always run `git diff --staged` after an `e`.
:::

If your edit no longer fits the file, for example because you deleted an unchanged line, Git refuses and asks:

```console
error: patch failed: trip.txt:3
error: trip.txt: patch does not apply
error: 'git apply --cached' failed
Your edited hunk does not apply. Edit again (saying "no" discards!) [y/n]?
```

`y` opens the editor again with your edit. `n` throws your edit away and returns to the question, with the hunk as it was. Nothing in your file is touched either way.

### Stage part of a new file with `git add -N`

Patch mode says "No changes." for an untracked file. `git add -N new.txt` (`--intent-to-add`) tells Git: start tracking this file, but stage none of its content yet. After that, `git add -p new.txt` works, and asks "Stage addition?". A new file is one hunk, so use `e` to pick lines from it.

### Stage and commit in one step: `git commit -p`

`git commit -p` runs the same questions as `git add -p`, then commits what you chose.

```console
$ git commit -p -m "Clean up on day 12"
```

It saves one command, at the cost of the check in between: you get no chance to run `git diff --staged` first. Prefer `git add -p`, look, then `git commit`.

### Stash part of your changes: `git stash -p`

`git stash -p` asks "Stash this hunk?" and puts only the hunks you choose on the [stash](term:stash), leaving the rest in your working tree. It is useful for setting half-finished experiments aside while you finish the rest. Pro Git shows the older spelling, `git stash save --patch`. See [Stash unfinished work](lesson:stash-and-clean).

### Test what you staged

A partially staged commit holds a version of the file you never ran: your tests ran on the working tree, with every edit in it. Before an important commit, run `git stash push --keep-index`. It sets the unstaged changes aside and leaves the staged ones in place, so the working tree matches what you are about to commit. Run your tests, commit, then `git stash pop`.

### The two jobs are already in one commit

Patch mode sorts changes before they are committed. When two jobs already share a commit, you split the commit instead: the lesson "Reword, squash, reorder, split" shows how.

### Answer with one key

By default you press Enter after each letter. `git config interactive.singleKey true` makes Git act on the letter alone, which is faster in a long session. Try it in one repository before you make it your default.

## Recap

- `git add -p` shows your changes hunk by hunk: `y` stages one, `n` leaves it, `s` splits it, `q` stops, `?` explains every letter.
- A partially staged file sits in both the staging area and the working tree; `git status -s` shows `MM`.
- Check before you commit: `git diff --staged` is what will be committed, `git diff` is what stays behind. Then use `git commit`, never `git commit -a`.
- `git restore --staged -p` unstages chosen hunks and keeps them in your file.
- `git restore -p` discards chosen hunks from your file for good: read the question before you answer `y`.
