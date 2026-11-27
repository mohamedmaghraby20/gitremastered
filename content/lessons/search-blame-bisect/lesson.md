---
id: search-blame-bisect
title: "Search, blame and bisect"
module: history-mastery
bookSection: "7.5 Searching and 7.10 Debugging with Git"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Searching
bookSources:
  - vendor/progit2/book/07-git-tools/sections/searching.asc
  - vendor/progit2/book/07-git-tools/sections/debugging.asc
readFirst: [reading-history]
---

The order total was right in version 1.0 and is wrong today, and hundreds of commits lie in between. Git can tell you where a piece of code is, who last changed each line, and which commit broke things, and this lesson shows the command for each.

## Must know

In [Read the commit history](lesson:reading-history) you listed commits and filtered them by author, date and message. That works when you know roughly which commit you want. This lesson is for when you only know a symptom: a name in the code, a strange line, a wrong result.

Four questions come up again and again, and each has its own command:

| Your question | Command |
|---|---|
| Where is this text in the project? | `git grep` |
| Which commit added or removed this text? | `git log -S` |
| Who last changed this line, and in which commit? | `git blame` |
| Which commit broke something that used to work? | `git bisect` |

The practice project on the right is a set of three small shell scripts that work out the price of a shop order. A shell script is a text file of terminal commands; `sh order.sh 1000 2500` runs the script `order.sh` for an order of two items. All prices are in cents, so `1000` means 10.00. You do not need to know shell to follow along: you will search the scripts, not write them.

The project has twelve commits by three people. The third commit carries the [tag](term:tag) `v1.0`, the last release everyone trusts.

### Find where something is: `git grep`

`git grep` searches the files of your project for a text and prints every line that contains it.

```console
$ git grep -n shipping_fee
pricing.sh:14:shipping_fee() {
pricing.sh:33:    shipping=$(shipping_fee "$items")
receipt.sh:8:echo "Shipping: $(shipping_fee "$items")"
```

Each result is `file:line number:the line`. The `-n` option adds the line number; without it you get only the file and the line. Here the function `shipping_fee` is defined on line 14 of `pricing.sh` and used in two places.

Your editor can search files too. `git grep` has two advantages, and Pro Git names both: it is very fast, and it can search any commit, not only the files in your folder. It also looks only at tracked files, so build output and downloaded packages never flood the results.

**Count the matches.** `--count` (or `-c`) prints one line per file with the number of matching lines. Use it first when a search returns too much:

```console
$ git grep --count shipping_fee
pricing.sh:2
receipt.sh:1
```

**See which function a match is in.** `-p` (short for `--show-function`) adds, before each match, the line that opens the function around it. That line is marked with `=` where a match has `:`.

```console
$ git grep -n -p SHIPPING_FEE
pricing.sh:3:SHIPPING_FEE=499
pricing.sh=14=shipping_fee() {
pricing.sh:15:    if [ "$1" -ge "$SHIPPING_FEE" ]; then
pricing.sh:18:        echo "$SHIPPING_FEE"
```

Line 3 sets the value and belongs to no function. Lines 15 and 18 use it, and `pricing.sh=14=shipping_fee() {` tells you both are inside `shipping_fee`. Use `-p` when the matching line alone does not say where you are.

**Search an older version.** Put a commit, a branch or a tag after the text, and `git grep` searches the files as they were in that commit. Your working tree stays as it is.

```console
$ git grep -n shipping_fee v1.0
v1.0:order.sh:12:shipping_fee() {
v1.0:order.sh:22:  shipping=$(shipping_fee "$items")
```

Each result now starts with `v1.0:`. In version 1.0 the function lived in `order.sh`; `pricing.sh` did not exist yet. This is the fastest way to answer "did the release already have this?".

**Two words on the same line.** Give each text with `-e` and join them with `--and`. Git prints only the lines that contain both:

```console
$ git grep -n -e echo --and -e Total
order.sh:6:echo "Total: $(order_total "$@")"
receipt.sh:9:echo "Total:    $(order_total "$@")"
```

Without `--and`, two `-e` texts mean "either one".

The text is a pattern, also called a **regular expression**: a small language for describing text, where `.` stands for any character and `price|fee` (with `-E`) means "price or fee". A plain word is a pattern that matches itself, so you can ignore this until you need it. Upper and lower case count; add `-i` to ignore case.

:::try-it
1. Run `git grep -n cart_total`. Git prints three lines: the function is defined in `pricing.sh` on line 6, and used on line 31 and in `receipt.sh` on line 6. Nothing moves in the picture: `git grep` only reads.
2. Run `git grep --count echo`. Git prints three files with their counts: `order.sh:1`, `pricing.sh:6` and `receipt.sh:4`.
3. Run `git grep -n 5000`. Git prints nothing: no tracked file contains that number today.
4. Run `git grep -n 5000 v1.0`. Now two lines appear, one in `README.md` and one in `order.sh`. Version 1.0 had the number, and a later commit changed it.
:::

### Find when a text appeared: `git log -S` and `-G`

`git grep` shows where a text is now, or was in one commit. The next question is when it came in.

You met `git log -S` in the history lesson: give it a text, and it lists the commits that **added or removed** it. Developers call it the **pickaxe**. Pro Git puts it more exactly: `-S` shows the commits that changed the *number of times* the text appears.

```console
$ git log --oneline -S FREE_SHIPPING_FROM
a857327 Make the shipping fee a setting
```

One commit: the one that brought the name `FREE_SHIPPING_FROM` into the project.

That exact rule has a blind spot. A commit that edits a line but keeps the text in it does not change the count, so `-S` skips it. `-G` closes the gap. It takes a pattern and lists every commit that has it in an added or removed line:

```console
$ git log --oneline -G FREE_SHIPPING_FROM
b2e4db4 Lower the free shipping limit to 40.00
a857327 Make the shipping fee a setting
```

The second commit, `b2e4db4`, changed the line from `FREE_SHIPPING_FROM=5000` to `FREE_SHIPPING_FROM=4000`. The name appears once before and once after, so `-S` did not list it. `-G` did, because the changed line contains the name.

| Option | Lists commits that | Use it when |
|---|---|---|
| `-S text` | Changed how many times the text appears | You want the commit that introduced or deleted something |
| `-G pattern` | Touched any line matching the pattern | You want every commit that changed lines mentioning it |

A text with a space needs quotes: `git log -S "echo 0"`. Add `-p` to either search to see the changes themselves.

**The history of one function.** `git log -L` follows a piece of a file through history. `git log -L :shipping_fee:pricing.sh` means "the function `shipping_fee` in the file `pricing.sh`": Git finds where the function starts and ends, then prints every commit that changed it, each with the diff of only that function. Add `-s` to hide the diffs and get the list alone:

```console
$ git log --oneline -s -L :shipping_fee:pricing.sh
f83878d Reindent pricing.sh with four spaces
a857327 Make the shipping fee a setting
12e9f55 Move the price functions into pricing.sh
```

### Find who last changed a line: `git blame`

`-S` finds a commit from a piece of text. Often you start from the other end: you are looking at a line in a file and want to know where it came from.

`git blame` prints a file with, in front of every line, the commit that last changed it. Pro Git calls this file annotation. The `-L` option keeps the output to the lines you ask for, here lines 3 and 4:

```console
$ git blame -L 3,4 pricing.sh
a8573272 (Omar Haddad 2026-10-22 10:20:00 +0000 3) SHIPPING_FEE=499
b2e4db46 (Maya Chen   2026-11-12 11:40:00 +0000 4) FREE_SHIPPING_FROM=4000
```

Read one line from left to right:

- `b2e4db46`: the start of the ID of the commit that last changed this line.
- `Maya Chen`: the author of that commit.
- `2026-11-12 11:40:00 +0000`: when she wrote it.
- `4`: the line number in the file.
- The rest is the line itself.

So Maya Chen set the limit to 4000 on 12 November. Blame gives you who and when, not why. For the why, hand the ID to `git show`, which prints the commit's message and its full diff:

```console
$ git show --stat b2e4db46
commit b2e4db46eda720d951f69e570b08c771addf29d4
Author: Maya Chen <maya@shop.example>
Date:   Thu Nov 12 11:40:00 2026 +0000

    Lower the free shipping limit to 40.00

 README.md  | 2 +-
 pricing.sh | 2 +-
 2 files changed, 2 insertions(+), 2 deletions(-)
```

Always give `-L` on a real file. Without it, blame prints the whole file, which can be thousands of lines. `-L 14,20` means lines 14 to 20, and `-L 14,+3` means three lines starting at 14.

:::careful
The name is misleading. `git blame` shows who touched a line **last**, not who wrote the idea or who made the mistake. Use it to find the commit and the person to ask, not to point a finger.
:::

### When blame names the wrong commit

"Last changed" includes changes that mean nothing. Suppose a teammate changes the indentation of a whole file, from two spaces to four. No line says anything new, but every indented line now has a new last commit.

That happened here: Omar Said's commit `f83878d` reindented `pricing.sh`.

:::predict
question: "Lines 14 to 20 of pricing.sh are the function shipping_fee. Line 14 (the name) and line 20 (the closing brace) start at the left edge; the five lines between them are indented. What will git blame -L 14,20 pricing.sh show?"
answer: "The five indented lines all name f83878d by Omar Said, the reindent commit, because it was the last to touch them. Lines 14 and 20 have no indentation, so the reindent did not change them and they still name an older commit."
:::

```console
$ git blame -L 14,20 pricing.sh
12e9f55e (Maya Chen 2026-10-15 10:00:00 +0000 14) shipping_fee() {
f83878d5 (Omar Said 2026-11-04 15:30:00 +0000 15)     if [ "$1" -ge "$SHIPPING_FEE" ]; then
f83878d5 (Omar Said 2026-11-04 15:30:00 +0000 16)         echo 0
f83878d5 (Omar Said 2026-11-04 15:30:00 +0000 17)     else
f83878d5 (Omar Said 2026-11-04 15:30:00 +0000 18)         echo "$SHIPPING_FEE"
f83878d5 (Omar Said 2026-11-04 15:30:00 +0000 19)     fi
12e9f55e (Maya Chen 2026-10-15 10:00:00 +0000 20) }
```

This is true and useless: Omar Said did not decide what these lines do. Add `-w`, and blame ignores changes that are only **whitespace** (spaces and tabs). It then looks past the reindent to the commit before it:

```console
$ git blame -w -L 14,20 pricing.sh
12e9f55e (Maya Chen   2026-10-15 10:00:00 +0000 14) shipping_fee() {
a8573272 (Omar Haddad 2026-10-22 10:20:00 +0000 15)     if [ "$1" -ge "$SHIPPING_FEE" ]; then
12e9f55e (Maya Chen   2026-10-15 10:00:00 +0000 16)         echo 0
12e9f55e (Maya Chen   2026-10-15 10:00:00 +0000 17)     else
a8573272 (Omar Haddad 2026-10-22 10:20:00 +0000 18)         echo "$SHIPPING_FEE"
12e9f55e (Maya Chen   2026-10-15 10:00:00 +0000 19)     fi
12e9f55e (Maya Chen   2026-10-15 10:00:00 +0000 20) }
```

Now lines 15 and 18 name Omar Haddad's commit `a8573272`, the last one that changed what they say. Many developers type `git blame -w` by habit.

:::try-it
1. Run `git blame README.md`. Git prints the eight lines of the file. The first four start with `^20592c3`: the `^` marks lines that come from the very first commit of the project and have not changed since. Press `q` if the pager opens.
2. Run `git blame -L 30,35 pricing.sh`. Six lines appear, the function `order_total`. The four indented lines name `f83878d5`, the reindent commit by Omar Said.
3. Run `git blame -w -L 30,35 pricing.sh`. The same six lines now name two commits by Maya Chen, `12e9f55e` and `04c07b14`: the ones that last changed what the lines say.
4. Run `git show --stat 12e9f55e`. Git prints that commit: "Move the price functions into pricing.sh", with the two files it changed. Nothing moved in the picture during these four steps, because blame and show only read.
:::

### Find the commit that broke it: `git bisect`

Blame helps when you already know which line is wrong. Often you do not: something worked in the last release, it fails today, and nothing in the code looks wrong.

The project has such a bug. The README says shipping costs 499 and only orders of 4000 or more ship free. An order of one item at 1000 should therefore cost 1499:

```console
$ sh order.sh 1000
Total: 1000
```

No shipping was charged. In `v1.0` the same command printed `Total: 1499`, and nine commits came after it. One of them broke shipping.

You could test all nine, one by one. `git bisect` does it faster with a **binary search**, the way you find a word in a paper dictionary: open it in the middle, see which half the word is in, and repeat with that half. You tell Git one commit where things are broken (**bad**) and one where they worked (**good**). Git checks out the commit halfway between them and you test it. Your answer rules out half of the commits, and Git picks the middle of what is left.

Here is the whole search for the shipping bug. The nine commits after `v1.0` are numbered 1 to 9, oldest first:

| Round | Git checks out | `sh order.sh 1000` prints | You answer | What that proves |
|---|---|---|---|---|
| 1 | Commit 4, "Add the SPRING10 coupon" | `Total: 1000` | `bad` | The bug is in commits 1 to 4 |
| 2 | Commit 2, "Add a receipt script" | `Total: 1499` | `good` | The bug is in commit 3 or 4 |
| 3 | Commit 3, "Make the shipping fee a setting" | `Total: 1000` | `bad` | Commit 2 is good and commit 3 is bad: commit 3 broke it |

Three tests where a one-by-one search could need eight. The four commands:

| Command | What it does |
|---|---|
| `git bisect start` | Begins the search |
| `git bisect bad` | Says the commit you are on is broken. `git bisect bad <commit>` names another one |
| `git bisect good <commit>` | Says that commit worked. Without a commit, it means the one you are on |
| `git bisect reset` | Ends the search and puts you back where you started |

While a bisect runs, Git moves HEAD from commit to commit, so you are in a [detached HEAD](term:detached-head): HEAD points at a commit, not at a branch. Your branch `main` does not move, and no commit is changed. `git bisect reset` puts HEAD back on `main`.

:::predict
question: "Nine commits come after v1.0, and one of them broke shipping. You mark the newest commit bad and v1.0 good. How many commits will Git ask you to test before it names the culprit?"
answer: "Three. Each answer cuts the candidates roughly in half: nine, then four, then two, then one. Git prints its own estimate after each answer, like \"roughly 2 steps\"."
:::

:::try-it
1. Run `sh order.sh 1000`. The script prints `Total: 1000`. That is the bug: 499 for shipping is missing.
2. Run `git bisect start`. Git answers `status: waiting for both 'good' and 'bad' commits`. In the picture, a banner appears: "Bisect in progress". It stays until you end the bisect.
3. Run `git bisect bad`. You told Git that the commit you are on, the newest, is broken. Git answers that it still waits for a good commit.
4. Run `git bisect good v1.0`. Git prints `Bisecting: 4 revisions left to test after this (roughly 2 steps)` and the commit it checked out, "Add the SPRING10 coupon". On the history map, HEAD leaves `main` and lands on that station, in the middle; the `main` label stays on the newest commit.
5. Run `sh order.sh 1000` again. The files in your folder are now the ones of that older commit. The script prints `Total: 1000`, still wrong, so run `git bisect bad`. HEAD moves left on the map, to "Add a receipt script".
6. Run `sh order.sh 1000`. This time the script prints `Total: 1499`, which is right. Run `git bisect good`. HEAD moves one station to the right, to "Make the shipping fee a setting".
7. Run `sh order.sh 1000`. The script prints `Total: 1000`. Run `git bisect bad`. Git prints `a8573272fae8388b78807d7ffffabb32b98c53dc is the first 'bad' commit`, followed by that commit and the file it changed.
8. Run `git bisect reset`. Git prints `Switched to branch 'main'`. On the map HEAD is back on `main`, and the banner is gone.
:::

Step 7 printed this:

```console
$ git bisect bad
a8573272fae8388b78807d7ffffabb32b98c53dc is the first 'bad' commit
commit a8573272fae8388b78807d7ffffabb32b98c53dc
Author: Omar Haddad <omar.haddad@shop.example>
Date:   Thu Oct 22 10:20:00 2026 +0000

    Make the shipping fee a setting

 pricing.sh | 7 +++++--
 1 file changed, 5 insertions(+), 2 deletions(-)
```

You now know the commit, without having read a line of code. `git show a857327` prints its diff: a handful of changed lines to read, not a whole project. (It is the same commit that `git blame -w` named for line 15 earlier. Look at that line again: it compares the order with the shipping fee, where it should use the free shipping limit.)

Two things to remember:

- Finding the commit does not end the bisect. HEAD is still detached on an old commit until you run `git bisect reset`. Write the ID down first, then reset.
- Bisect finds where a result **changed** from good to bad. It needs a test with a clear yes or no, and one good and one bad commit to start from.

Testing by hand is fine for three rounds. For a long search you can give Git a script that does the testing, and Git runs the whole bisect alone. That is `git bisect run`, the first topic in "Advanced".

### When it goes wrong

```console
$ git status
HEAD detached at 04c07b1
You are currently bisecting, started from branch 'main'.
  (use "git bisect reset" to get back to the original branch)

nothing to commit, working tree clean
```

Files look old, new commits are missing, and the banner in the picture says "Bisect in progress". You left a bisect open, perhaps days ago. Run `git bisect reset`: it ends the bisect and puts you back on your branch.

```console
$ git bisect start
status: waiting for both 'good' and 'bad' commits
$ git bisect good
status: waiting for 'bad' commit, 1 'good' commit known
$ git bisect bad v1.0
Some 'good' revs are not ancestors of the 'bad' rev.
git bisect cannot work properly in this case.
Maybe you mistook 'good' and 'bad' revs?
```

Good and bad are swapped: the old commit was marked bad and the new one good. Git searches from an older good commit to a newer bad one. Run `git bisect reset` and start again, with `bad` for the broken commit.

```console
$ git blame -L 80,90 pricing.sh
fatal: file pricing.sh has only 35 lines
```

The range in `-L` starts past the end of the file. Find the right line numbers first with `git grep -n`, then blame those.

## Under the hood

"Must know" gave you four tools. This layer shows what each one does inside, which explains how fast bisect is, why a forgotten bisect is harmless, and how blame can follow code from file to file.

### Why bisect needs so few tests

Each answer you give cuts the list of suspects in half. Halving shrinks a number very quickly, so the number of tests grows slowly while the history grows fast:

| Commits between good and bad | Tests needed, about |
|---|---|
| 9 | 3 |
| 100 | 7 |
| 1,000 | 10 |
| 10,000 | 14 |

That is why Pro Git says bisect can check hundreds of commits in minutes. Git prints the same estimate as you go: "4 revisions left to test after this (roughly 2 steps)".

This works because commits form a chain through their parents, which you saw in the history lesson. If a commit is good, Git treats every commit before it as good too. If one is bad, every commit after it, up to your bad one, is a suspect. One test settles a whole stretch of the chain.

### Where a bisect lives

A bisect is not a special mode of Git. It is a few small files in the `.git` folder and nothing else. During the Try-it above, Git kept this:

```console
$ git for-each-ref refs/bisect
a8573272fae8388b78807d7ffffabb32b98c53dc commit	refs/bisect/bad
6231985fc2c0287f8df90500bf2611216c82b35d commit	refs/bisect/good-6231985fc2c0287f8df90500bf2611216c82b35d
c2591f06e4ea3685fcb16565202ee33833bfb0d6 commit	refs/bisect/good-c2591f06e4ea3685fcb16565202ee33833bfb0d6
```

A [ref](term:ref) is a name that points at a commit, like a branch does, and `git for-each-ref` lists refs. `refs/bisect/bad` is the oldest commit you called bad so far, and each `good-…` ref is a commit you called good. When the search is over, `refs/bisect/bad` is the answer, so `git rev-parse --short refs/bisect/bad` prints the culprit's short ID.

Git also writes every answer to a file, `.git/BISECT_LOG`. `git bisect log` prints it:

```console
$ git bisect log
git bisect start
# status: waiting for both 'good' and 'bad' commits
# bad: [7f63d54f7139cc3fad35961d9aea509d13786d47] Show the coupon on the receipt
git bisect bad 7f63d54f7139cc3fad35961d9aea509d13786d47
# status: waiting for 'good' commit(s), 'bad' commit known
# good: [c2591f06e4ea3685fcb16565202ee33833bfb0d6] Charge a shipping fee
git bisect good c2591f06e4ea3685fcb16565202ee33833bfb0d6
# bad: [04c07b14b819ee8f22faf04e3d192d433d930352] Add the SPRING10 coupon
git bisect bad 04c07b14b819ee8f22faf04e3d192d433d930352
# good: [6231985fc2c0287f8df90500bf2611216c82b35d] Add a receipt script
git bisect good 6231985fc2c0287f8df90500bf2611216c82b35d
# bad: [a8573272fae8388b78807d7ffffabb32b98c53dc] Make the shipping fee a setting
git bisect bad a8573272fae8388b78807d7ffffabb32b98c53dc
# first 'bad' commit: [a8573272fae8388b78807d7ffffabb32b98c53dc] Make the shipping fee a setting
```

The file exists from `git bisect start` until `git bisect reset`. `git status` and the banner in the picture both look for it, which is why they keep saying "bisecting" after the culprit is found. `git bisect reset` deletes these files and refs and switches back to the branch you started from. No commit and no branch was changed at any point.

### How blame finds the last change

Git stores snapshots of whole files, not a record of who changed which line. `git blame` works the answer out each time you ask.

It starts with the file as it is in HEAD and compares it with the same file in the parent commit. Lines that are the same in both were not changed by this commit, so blame passes them back to the parent and repeats from there. A line that differs stops: this commit is its last change. `-w` only changes the comparison: two lines that differ in spaces alone count as the same, so they keep travelling back.

This also explains the `^` you saw in the README. A line that travels all the way to the first commit has nowhere further to go, and Git marks it.

### Blame can follow code between files

Because blame compares content, it can do something a per-file history cannot: notice that lines came from **another file**. Git never records "this code was moved". It looks at the snapshots afterwards and works it out.

In the project, the commit `12e9f55` moved three functions out of `order.sh` into a new file, `pricing.sh`. Ask blame about `pricing.sh` as it was in that commit, and every line names the move:

```console
$ git blame -L 11,17 12e9f55 -- pricing.sh
12e9f55e (Maya Chen 2026-10-15 10:00:00 +0000 11) shipping_fee() {
12e9f55e (Maya Chen 2026-10-15 10:00:00 +0000 12)   if [ "$1" -ge 5000 ]; then
12e9f55e (Maya Chen 2026-10-15 10:00:00 +0000 13)     echo 0
12e9f55e (Maya Chen 2026-10-15 10:00:00 +0000 14)   else
12e9f55e (Maya Chen 2026-10-15 10:00:00 +0000 15)     echo 499
12e9f55e (Maya Chen 2026-10-15 10:00:00 +0000 16)   fi
12e9f55e (Maya Chen 2026-10-15 10:00:00 +0000 17) }
```

Maya Chen moved the function; she did not write it. Add `-C`, and blame also looks for the lines in the other files of the commit:

```console
$ git blame -C -L 11,17 12e9f55 -- pricing.sh
c2591f06 order.sh (Omar Haddad 2026-10-12 11:05:00 +0000 11) shipping_fee() {
c2591f06 order.sh (Omar Haddad 2026-10-12 11:05:00 +0000 12)   if [ "$1" -ge 5000 ]; then
c2591f06 order.sh (Omar Haddad 2026-10-12 11:05:00 +0000 13)     echo 0
c2591f06 order.sh (Omar Haddad 2026-10-12 11:05:00 +0000 14)   else
c2591f06 order.sh (Omar Haddad 2026-10-12 11:05:00 +0000 15)     echo 499
c2591f06 order.sh (Omar Haddad 2026-10-12 11:05:00 +0000 16)   fi
c2591f06 order.sh (Omar Haddad 2026-10-12 11:05:00 +0000 17) }
```

A new column appears, the file each line came from. Blame followed the function into `order.sh` and found the commit where Omar Haddad first wrote it.

Two details from the example. Putting a commit before `--` blames the file as of that commit, not as of HEAD. And `-C` needs a piece of moved code of some size to recognise it (40 letters and digits by default), so a single short line that moved is not traced.

### What `git grep` reads

A normal file search reads your folder. `git grep` asks Git instead. With no commit it searches the tracked files in your working tree and skips everything untracked. With a commit, branch or tag it reads the [tree](term:tree) of that commit, the stored list of its files, straight from the repository. Nothing is checked out, which is why searching `v1.0` leaves your files alone and takes no longer than searching today's.

## Advanced

### Let a script do the testing: `git bisect run`

In the Try-it you ran the same test three times and typed the result each time. When the test is a command, Git can do both.

`git bisect run <command>` runs the command on each commit the bisect checks out, and reads its **exit code** to decide between good and bad. An exit code is a number every command hands back when it ends. By convention `0` means "it worked" and anything else means "it failed"; you rarely see it, but scripts and Git read it.

| Exit code of your command | Git treats the commit as |
|---|---|
| `0` | good |
| `1` to `127`, except `125` | bad |
| `125` | cannot be tested: skip it and try a neighbour |
| `128` or more | a broken test: the bisect stops |

A test suite already works this way (`npm test`, `make test`, `pytest`): it ends with 0 when all tests pass. So in many projects the command is one you already have.

First give Git the two ends. `git bisect start <bad> <good>` does it in one line, bad commit first. Then start the run:

```console
$ git bisect start HEAD v1.0
Bisecting: 4 revisions left to test after this (roughly 2 steps)
[04c07b14b819ee8f22faf04e3d192d433d930352] Add the SPRING10 coupon
$ git bisect run sh check-shipping.sh
running 'sh' 'check-shipping.sh'
Bisecting: 1 revision left to test after this (roughly 1 step)
[6231985fc2c0287f8df90500bf2611216c82b35d] Add a receipt script
running 'sh' 'check-shipping.sh'
Bisecting: 0 revisions left to test after this (roughly 0 steps)
[a8573272fae8388b78807d7ffffabb32b98c53dc] Make the shipping fee a setting
running 'sh' 'check-shipping.sh'
a8573272fae8388b78807d7ffffabb32b98c53dc is the first 'bad' commit
commit a8573272fae8388b78807d7ffffabb32b98c53dc
Author: Omar Haddad <omar.haddad@shop.example>
Date:   Thu Oct 22 10:20:00 2026 +0000

    Make the shipping fee a setting

 pricing.sh | 7 +++++--
 1 file changed, 5 insertions(+), 2 deletions(-)
bisect found first 'bad' commit
```

The same three rounds as before, and the same answer, with no typing in between. The script here is one line that checks the shipping bug; you write it in the Try-it below.

:::try-it
1. Make the test script. Run `echo 'test "$(sh order.sh 1000)" = "Total: 1499"' > check-shipping.sh`. The file `check-shipping.sh` appears in the working tree in the picture, as an untracked file. Its one line runs the order script and compares the output with the right total; `test` ends with exit code 0 when they are equal and 1 when they differ.
2. Run `sh check-shipping.sh` and then `echo $?`, which prints the exit code of the last command. It prints `1`: the test fails on the newest commit, as expected.
3. Run `git bisect start HEAD v1.0`. Git checks out the middle commit, "Add the SPRING10 coupon", and the banner "Bisect in progress" appears in the picture.
4. Run `git bisect run sh check-shipping.sh`. Git prints `running 'sh' 'check-shipping.sh'` three times, each followed by the next commit, and ends with `bisect found first 'bad' commit`. On the history map HEAD stops on "Make the shipping fee a setting".
5. Run `git bisect reset`. HEAD goes back to `main` and the banner disappears.
6. Run `rm check-shipping.sh` to delete the script. The untracked file leaves the picture.
:::

:::careful
Keep the test script out of the commits you are searching. Bisect checks out old commits, and a script that is tracked would change with them, or not exist at all in the older ones. An untracked file stays where it is while Git switches commits, so write the script as a new file and do not commit it.
:::

If the command's name is wrong, every commit seems to fail. Git notices, because it then tries the command on your good commit too:

```console
$ git bisect run sh no-such-script.sh
running 'sh' 'no-such-script.sh'
sh: no-such-script.sh: No such file or directory
[c2591f06e4ea3685fcb16565202ee33833bfb0d6] Charge a shipping fee
running 'sh' 'no-such-script.sh'
sh: no-such-script.sh: No such file or directory
error: bogus exit code 127 for 'good' revision
[04c07b14b819ee8f22faf04e3d192d433d930352] Add the SPRING10 coupon
```

Exit code 127 means "command not found". Git went back to the commit it was testing, and the bisect is still open: fix the name and run `git bisect run` again.

### Skip a commit you cannot test

Sometimes the commit Git picks cannot be tested at all: the project does not build there, for a reason that has nothing to do with your bug. Calling it good or bad would be a guess, and a wrong guess sends the search into the wrong half. `git bisect skip` tells Git to choose a commit close by:

```console
$ git bisect skip
Bisecting: 4 revisions left to test after this (roughly 2 steps)
[d5a354a92767cc70b7fe1c50b0ae6ce4e0005c2b] Round the coupon discount up
```

In a `git bisect run` script, exit code 125 does the same. If the skipped commits sit right at the answer, Git cannot decide between them and prints the commits that are left as candidates.

### Other words than good and bad

Not every search is for a bug. You may want the commit that made the app faster, or the one that changed a default. Calling the newer state "bad" is then confusing. Bisect also understands `old` and `new`: `git bisect old <commit>` and `git bisect new`. You can pick your own words when you start:

```console
$ git bisect start --term-old=charged --term-new=free HEAD v1.0
Bisecting: 4 revisions left to test after this (roughly 2 steps)
[04c07b14b819ee8f22faf04e3d192d433d930352] Add the SPRING10 coupon
$ git bisect terms
Your current terms are 'charged' for the old state
and 'free' for the new state.
```

From then on the answers are `git bisect charged` and `git bisect free`. `git bisect terms` reminds you which word is which.

### Fix a wrong answer

One wrong `good` or `bad` and bisect names the wrong commit. You do not have to start over:

1. `git bisect log > bisect.txt` writes your answers to a file.
2. Open the file and delete the line with the wrong answer and every line after it.
3. `git bisect reset`, then `git bisect replay bisect.txt` repeats the answers that are left.

### Blame: skip a commit by name

`-w` only helps when a commit changed nothing but spaces. A tool that reformats code also moves brackets and breaks long lines. For those, `--ignore-rev <commit>` tells blame to look past one named commit:

```console
$ git blame --ignore-rev f83878d -L 30,35 pricing.sh
12e9f55e (Maya Chen 2026-10-15 10:00:00 +0000 30) order_total() {
12e9f55e (Maya Chen 2026-10-15 10:00:00 +0000 31)     items=$(cart_total "$@")
04c07b14 (Maya Chen 2026-10-28 13:00:00 +0000 32)     discount=$(coupon_discount "$items")
12e9f55e (Maya Chen 2026-10-15 10:00:00 +0000 33)     shipping=$(shipping_fee "$items")
04c07b14 (Maya Chen 2026-10-28 13:00:00 +0000 34)     echo $((items - discount + shipping))
12e9f55e (Maya Chen 2026-10-15 10:00:00 +0000 35) }
```

The reindent commit `f83878d` is gone from the output, as if it had never touched the file.

Teams keep the IDs of such commits in a file, one full ID per line, usually named `.git-blame-ignore-revs`. `git blame --ignore-revs-file .git-blame-ignore-revs` reads it, and `git config --local blame.ignoreRevsFile .git-blame-ignore-revs` makes every blame in this repository use it.

### More blame options

- `git blame v1.0 -- order.sh` blames the file as it was in `v1.0`. Use it to keep digging when the commit blame names is not the one you want: blame again from the commit before it, written `<id>^`.
- `-L :shipping_fee` blames one function by name, like `git log -L`.
- `-M` finds lines that were moved inside the same file. `-C` given twice or three times widens its search to more commits and files, and costs more time.
- `-s` hides the author and date, and `-e` shows the email in place of the name.

### More `git grep` options

| Option | What it does |
|---|---|
| `-i` | Ignores upper and lower case |
| `-w` | Matches whole words only: `-w total` skips `cart_total` |
| `-l` | Prints only the names of the files that match |
| `-E` | Allows richer patterns, like `-E "[0-9]+"` for "one or more digits" |
| `--or`, `--not`, `( … )` | Combine `-e` patterns, together with `--and` |
| `--break --heading` | Prints the file name once, above its matches, with a blank line between files |
| `--untracked` | Also searches untracked files |
| `-- "*.sh"` | Limits the search to some paths, here the files ending in `.sh` |

You can also name several commits at once: `git grep -n shipping_fee v1.0 main` searches both and labels each result.

### More ways to follow lines with `git log -L`

`git log -L 14,20:pricing.sh` follows lines 14 to 20, and `git log -L 3,3:pricing.sh` follows one line. When Git cannot find the edges of a function in your language, give them as patterns between slashes: `git log -L '/shipping_fee/,/^}/:pricing.sh'` means "from the first line that contains `shipping_fee` to the next line that starts with `}`".

## Recap

- `git grep -n <text>` finds text in tracked files; `--count` counts, `-p` names the function, and a commit or tag after the text (`v1.0`) searches that version.
- `git log -S <text>` lists the commits that added or removed a text; `-G <pattern>` lists every commit that changed a line mentioning it.
- `git blame -L 14,20 <file>` shows the last commit and author of each line; add `-w` to look past whitespace changes, then `git show <id>` for the why.
- `git bisect start`, `git bisect bad`, `git bisect good <commit>`: Git halves the suspects with each test and names the first bad commit. Always finish with `git bisect reset`.
- `git bisect run <command>` runs the test for you: exit code 0 is good, 1 to 127 is bad, 125 skips.
