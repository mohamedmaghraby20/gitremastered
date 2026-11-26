---
id: diffs-in-depth
title: "Read any diff: working, staged, between commits"
module: daily-loop
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#_git_diff_staged
bookSources:
  - book/progit2/book/02-git-basics/sections/recording-changes.asc
readFirst: [three-areas]
---

`git status` says `cart.js` is modified, but not what you did to it. Was it the bug fix, or the test line you forgot to take out? `git diff` shows the exact lines that changed, so you can check your work before it goes into a commit. This lesson teaches you to read its output and to pick the right comparison.

## Must know

In [Status, stage, commit](lesson:three-areas) you used `git status` to see which files changed and where each change sits. That is a list of names. Before you commit, you also want to see the changes themselves.

`git diff` prints the difference between two versions of your files, line by line. Such a printout is called a [diff](term:diff). Like `git status`, it only looks and never changes anything, so you can run it as often as you like.

### Make a change to look at

To read a diff you need a change. Make one in a file of your own, so the practice project's files stay as they are for the challenges at the end.

:::try-it
1. Create a shopping list with three lines: `printf "milk\neggs\nbread\n" > shopping.txt`. `printf` writes the text into the file, and each `\n` ends a line.
2. Commit it: `git add shopping.txt`, then `git commit -m "Add shopping list"`. In the picture, a new station appears on the history map and the `main` tag moves onto it.
3. Now change the list: `printf "milk\n6 eggs\nbread\nbutter\n" > shopping.txt`. The second line became "6 eggs" and a fourth line, "butter", is new. In the picture, a `shopping.txt` sheet marked "edited" appears in the working tree.
4. Run `git diff shopping.txt`. Git prints the diff shown below. Naming the file keeps the other changed files of the practice project off the screen.
:::

```console
$ git diff shopping.txt
diff --git a/shopping.txt b/shopping.txt
index 01ec3d2..d23d876 100644
--- a/shopping.txt
+++ b/shopping.txt
@@ -1,3 +1,4 @@
 milk
-eggs
+6 eggs
 bread
+butter
```

### Read a diff, line by line

That output looks cryptic the first time. It has only two parts: four header lines about the file, then the changed lines.

**The header.** You can skim it once you know what it says:

- `diff --git a/shopping.txt b/shopping.txt`: which file this part is about. `a/` stands for the old version and `b/` for the new one. They are labels, not real folders.
- `index 01ec3d2..d23d876 100644`: the IDs Git gave the old and the new content, and the file type (`100644` is a normal file). You rarely need this line.
- `--- a/shopping.txt`: lines from the old version will be marked with `-`.
- `+++ b/shopping.txt`: lines from the new version will be marked with `+`.

**The changed lines.** This is the part you read every day. The first character of each line tells you what happened to it:

| Starts with | Meaning |
|---|---|
| `-` | The line was in the old version and is gone. In the terminal it is red |
| `+` | The line is new. In the terminal it is green |
| a space | The line did not change. Git shows it so you can see where you are in the file. These are called context lines |

Now read the example again. `milk` and `bread` start with a space: unchanged. `-eggs` and `+6 eggs` come as a pair. Git works with whole lines, so it shows an edited line as the old line removed and the new line added. `+butter` is a new line at the end.

The common wrong idea is that `-` means "you deleted something". Often it does not: `-eggs` followed by `+6 eggs` is one line that you edited.

**The `@@` line.** A long file may change in several places. Git prints each place as its own block, called a [hunk](term:hunk), and every hunk starts with a line like this:

```text
@@ -1,3 +1,4 @@
```

It holds two pairs of numbers:

- `-1,3` describes the old version: this hunk starts at line 1 and covers 3 lines.
- `+1,4` describes the new version: it starts at line 1 and covers 4 lines.

So three lines became four. You do not need to do this arithmetic every time. Use the first number of the `+` pair to find the place in your editor: `@@ -40,7 +42,8 @@` means "look around line 42".

### Three comparisons for three areas

You can read a diff now. The next question is which two versions Git compares, and here most people get caught once.

A change passes through three places: the working tree, the staging area and the last commit. `git diff` can compare any two of them:

| You type | Git compares | It answers |
|---|---|---|
| `git diff` | Working tree against the staging area | What have I changed but not staged yet? |
| `git diff --staged` | Staging area against the last commit | What will my next commit contain? |
| `git diff HEAD` | Working tree against the last commit | What is everything I changed since my last commit? |

[HEAD](term:head) is Git's name for the commit you are on. For now, read it as "my last commit".

`--cached` means the same as `--staged`. You will see both; this course uses `--staged` because it says what it does.

:::predict
question: "You run `git add shopping.txt`, then `git diff shopping.txt`. What does Git print?"
answer: "Nothing. Plain `git diff` compares the working tree with the staging area, and after `git add` the two are the same. Your change is not lost: it is staged, and `git diff --staged` shows it."
:::

:::try-it
1. Run `git add shopping.txt`. In the picture, the `shopping.txt` sheet slides from the working tree into the staging area.
2. Run `git diff shopping.txt`. Git prints nothing: the working tree and the staging area now hold the same `shopping.txt`.
3. Run `git diff --staged shopping.txt`. The same diff as before appears, with "6 eggs" and "butter". It moved with the sheet: it is now the difference between the staging area and the last commit.
4. Add one more line: `echo "jam" >> shopping.txt`. The picture shows two `shopping.txt` sheets, one in the staging area and one in the working tree.
5. Run `git diff shopping.txt`. Only `+jam` shows: the one change you have not staged.
6. Run `git diff HEAD shopping.txt`. All three changes show together ("6 eggs", "butter" and "jam"): everything that differs from your last commit, staged or not.
:::

The picture and the commands say the same thing. A sheet in the working tree is what `git diff` prints. A sheet in the staging area is what `git diff --staged` prints. When a file has a sheet in both, each command shows its own part.

:::careful
An empty `git diff` does not mean "nothing to commit". It means "nothing unstaged". Before you commit, read `git diff --staged`: that is exactly what the commit will contain.
:::

One more thing `git diff` leaves out: untracked files. Git has no older version of a new file to compare with, so the file only shows up after `git add`, in `git diff --staged`, with every line marked `+`.

### Compare two commits

So far one side of the comparison was your unfinished work. Git can also compare two commits with each other, which is how you answer "what changed between last week's version and now?".

Give `git diff` two commits, the older one first:

```console
$ git diff f63716c 275358e
```

The IDs come from `git log --oneline`, which you met in the lesson [Read the commit history](lesson:reading-history). Typing IDs gets tiring, so Git has a shortcut for recent commits. `HEAD~1` means "the commit before the one you are on", `HEAD~2` the one before that.

:::graph
caption: "HEAD is the commit you are on; HEAD~1 and HEAD~2 count back from it"
commits:
  - id: "HEAD~2"
    message: Add README and cart
  - id: "HEAD~1"
    message: Add shopping list
    parents: ["HEAD~2"]
  - id: HEAD
    message: Update shopping list
    parents: ["HEAD~1"]
branches:
  main: HEAD
head: main
:::

:::try-it
1. Commit what is staged: `git commit -m "Update shopping list"`. A new station appears on the history map. The "jam" line was not staged, so it stays behind as a sheet in the working tree.
2. Run `git diff HEAD~1 HEAD`. Git shows what your new commit changed: "6 eggs" and "butter", and no "jam".
3. Run `git diff HEAD~2 HEAD`. Two commits back, `shopping.txt` did not exist. The whole file shows as new, every line with a `+`, with the changes of both commits folded into one diff.
:::

The order matters. `git diff HEAD~1 HEAD` reads "from the older to the newer": added lines get a `+`. Swap the two and the same lines get a `-`, as if you were going back in time.

To look at one file only, put its path at the end, after `--`:

```console
$ git diff HEAD~2 HEAD -- shopping.txt
```

The `--` tells Git "everything after this is a file name". You left it out earlier and it worked, because Git could guess. Write it when a file and a commit could be confused, or when Git complains (see "When it goes wrong").

### A summary before the details

A diff of twenty files is too long to read from top to bottom. Ask for a summary first, then open the files that matter. These options work with every comparison above.

```console
$ git diff --stat
 README.md    | 1 +
 cart.js      | 2 +-
 shopping.txt | 1 +
 3 files changed, 3 insertions(+), 1 deletion(-)
```

`--stat` prints one row per file with the number of changed lines and a small bar of `+` and `-`. `2 +-` for `cart.js` means two lines touched: one added, one removed, which is usually one edited line. Use it to get the size of a change at a glance.

| Option | Prints | Use it when |
|---|---|---|
| `--stat` | Files with line counts | You want to know how big a change is |
| `--name-only` | File names only | You need the list, for example to hand to another command |
| `--name-status` | A letter and the file name: `A` added, `M` modified, `D` deleted | You want to know what happened to each file |

```console
$ git diff --name-status HEAD~2 HEAD
A	shopping.txt
```

### When it goes wrong

**`git diff` prints nothing.** There are three possible reasons, and `git status` tells you which one applies:

- You have no changes at all.
- Your changes are all staged. Run `git diff --staged`.
- Your only change is a new, untracked file. Stage it, then run `git diff --staged`.

**The output stops and the screen shows `:` at the bottom.** A long diff opens in a pager, a small viewer that shows one screen at a time. Press Space for the next screen, `/` to search, and `q` to get back to the prompt.

```console
$ git diff HEAD~9 HEAD
fatal: ambiguous argument 'HEAD~9': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
```

Git could not tell whether `HEAD~9` is a commit or a file, because it is neither: the history is shorter than nine commits. The same message appears for a mistyped ID or a mistyped file name. Check the commit with `git log --oneline` and the file name with `git status`, and put `--` before file names.

```console
warning: in the working copy of 'about.txt', LF will be replaced by CRLF the next time Git touches it
```

This is a note about line endings on Windows, not a problem with your change. You can ignore it here; the lesson [Attributes: binary files, line endings, merge drivers](lesson:attributes) explains it.

## Under the hood

"Must know" showed which comparison to ask for. This layer shows what Git does to answer, which explains two things that surprise people: diffs are never stored, and a diff between two commits ignores everything in between.

### Diffs are computed, not stored

It is easy to believe that a commit is a list of changes, because that is how `git diff` and `git log -p` present it. It is not. A commit holds a [snapshot](term:snapshot): the full content of every file at that moment.

When you ask for a diff, Git takes two snapshots, finds the files whose content differs, and works out the changed lines right then. Finding those files is fast, because Git names each file's content by a [checksum](term:checksum): two versions with the same checksum are the same, and Git skips them without reading them.

That is what the `index` line of a diff shows:

```text
index 01ec3d2..d23d876 100644
```

`01ec3d2` is the start of the checksum of the old content and `d23d876` of the new. You can see the same value in the staging area:

```console
$ git ls-files --stage shopping.txt
100644 d23d8760cdbbd29ff25501d562d7d2dbc03da13f 0	shopping.txt
```

### Two snapshots, nothing in between

Because a diff compares two snapshots, it does not care how you got from one to the other. Suppose three commits touch `prices.txt`:

| Commit | What it did | Lines in the file after it |
|---|---|---|
| A | Created the file | coffee, tea |
| B | Added three lines | coffee, tea, cake, juice, soup |
| C | Removed two of them | coffee, tea, cake |

`git diff A C` shows one added line, `cake`. The two lines that came and went in between appear nowhere, because they are in neither snapshot. To see the steps, you ask `git log -p` for each commit's own diff. To see the result, you ask `git diff` for the two ends.

### The staging area is the middle column

The three everyday comparisons are the three pairs you can make from the three copies Git holds of a file. Here is `shopping.txt` right after step 4 of the second Try-it:

| Last commit (HEAD) | Staging area | Working tree |
|---|---|---|
| milk, eggs, bread | milk, 6 eggs, bread, butter | milk, 6 eggs, bread, butter, jam |

- `git diff --staged` compares column 1 with column 2: "6 eggs" and "butter".
- `git diff` compares column 2 with column 3: "jam".
- `git diff HEAD` compares column 1 with column 3: all three.

`git status` makes the same comparisons and prints only the file names. `git diff` prints the lines.

## Advanced

### See changed words, not whole lines

In prose, one changed word marks the whole line as removed and added, and you have to hunt for the difference. `--word-diff` shows the words:

```console
$ git diff --word-diff about.txt
The shop opens at [-nine-]{+eight+} and closes at six.
```

`[-nine-]` was removed and `{+eight+}` was added. `git diff --color-words` shows the same with colors and no brackets. Both are good for documentation and long text lines.

### Ignore whitespace changes

When an editor re-indents a file, every line shows as changed. `git diff -w` (or `--ignore-all-space`) ignores differences in spaces and tabs, so only the real edits remain.

### More or fewer context lines

Git shows three unchanged lines around each change. `-U<n>` sets another number: `git diff -U0` shows only the changed lines, and `git diff -U10` shows ten lines around them.

### Catch whitespace mistakes before committing

`git diff --check` lists lines you added that end in stray spaces or tabs:

```console
$ git diff --check
shopping.txt:6: trailing whitespace.
+x  
```

Many teams run it before every commit, because trailing spaces create noise in later diffs.

### Two dots and three dots

`git diff A..B` is another way to write `git diff A B`. With three dots, `git diff A...B` shows what changed on B's side since the two histories split apart. That only matters once you work with branches; the "Branching" module comes back to it.

### Binary files

Git cannot show line changes for images and other binary files. It only tells you that they differ:

```console
$ git diff logo.png
diff --git a/logo.png b/logo.png
index 8352675..1592e5c 100644
Binary files a/logo.png and b/logo.png differ
```

### A graphical diff

`git difftool` opens the same comparisons in a side-by-side program instead of the terminal. `git difftool --tool-help` lists the programs Git can use on your computer.

## Recap

- `git diff` shows changed lines: `-` old, `+` new, a space for unchanged context. An edited line appears as a `-` and `+` pair.
- `git diff`: working tree against staging area. `git diff --staged`: staging area against last commit. `git diff HEAD`: working tree against last commit.
- Empty `git diff` after `git add` is normal. Read `git diff --staged` before every commit.
- `git diff <older> <newer>` compares two commits; `HEAD~1` is the commit before the one you are on. Add `-- <file>` for one file.
- `--stat`, `--name-only` and `--name-status` give a summary first.
