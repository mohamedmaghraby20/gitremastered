---
id: rescue-lost-work
title: "Recover lost commits with reflog and fsck"
module: recovery
bookSection: "10.7 Maintenance and Data Recovery"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery
bookSources:
  - book/progit2/book/10-git-internals/sections/maintenance.asc
readFirst: [revision-selection]
---

You ran `git reset --hard` one commit too far, or deleted a branch that still had a week of work on it, and now `git log` shows nothing of it. Git almost never deletes a commit on the spot, and this lesson gives you a calm method to find the work and bring it back.

## Must know

You have already pulled off three small rescues in this course: a commit replaced by [amend](lesson:fix-last-commit), a commit [reset](lesson:reset-demystified) away, and a [deleted branch](lesson:branch-management). Each time the trick was the same command, `git reflog`. This lesson turns those tricks into a method: why the work is still there, how long it stays, where to look first, and where to look when the first place is empty.

### A commit leaves its branch, not the repository

Start with the idea that makes every rescue possible. Commands that seem to delete commits (`git reset`, `git commit --amend`, `git branch -D`) do not touch a single commit. They move or remove a **label**: a [branch](term:branch) name. The commits stay in `.git/objects`, where Git stores everything.

What you lose is the way to reach them. `git log` starts at a label and walks backwards from commit to parent. A commit that no label leads to is never visited, so it looks gone.

:::definitions
- term: Reachable commit
  area: repository
  text: "A commit you arrive at by starting from a branch, a tag or HEAD and following parent links. `git log` shows these."
- term: Unreachable commit
  area: repository
  text: "A commit that no branch or tag leads to any more. It still exists, and it still has its ID. The picture draws it as a faded, dashed station marked `no branch`."
:::

The practice project on the right shows it. It is a small shop app with five commits, and someone just ran `git reset --hard HEAD~2` on it:

:::graph
caption: "After git reset --hard HEAD~2: main moved back to C. D and E still exist, with no branch"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add cart
    parents: [A]
  - id: C
    message: Add checkout
    parents: [B]
  - id: D
    message: Add search box
    parents: [C]
    faded: true
  - id: E
    message: Show search results
    parents: [D]
    faded: true
branches:
  main: C
head: main
:::

Git does remove unreachable commits in the end. From time to time it tidies its storage, a job called **[garbage collection](term:garbage-collection)** (`git gc`): it throws away objects that nothing leads to and that are old enough. "Old enough" is generous, as the next part shows. You have weeks, not minutes.

The common wrong idea is "reset deleted my commits, so I must retype the work". Stop, and do not retype anything. If the work was ever in a commit, it is almost certainly still there.

### `git reflog`: the diary of where HEAD has been

`git reflog` lists every commit [HEAD](term:head) has stood on, newest first. Each time you commit, switch branches, reset, merge or amend, Git adds one line to this diary, the **[reflog](term:reflog)** (short for "reference log"). Here it is in the practice project:

```console
$ git log --oneline
ae46b3b Add checkout
42d5525 Add cart
03afda5 Add README
$ git reflog
ae46b3b HEAD@{0}: reset: moving to HEAD~2
f5ecdac HEAD@{1}: commit: Show search results
ad56200 HEAD@{2}: commit: Add search box
ae46b3b HEAD@{3}: commit: Add checkout
42d5525 HEAD@{4}: commit: Add cart
03afda5 HEAD@{5}: commit (initial): Add README
```

`git log` knows three commits. The reflog knows all five, because HEAD stood on each of them once.

| Part of a line | Example | What it tells you |
|---|---|---|
| Commit ID | `f5ecdac` | The commit HEAD was on after that step. This is what you copy for a rescue |
| Position | `HEAD@{1}` | "Where HEAD was one move ago". `HEAD@{0}` is now. It works as a name for the commit, like an ID |
| Action | `commit:`, `reset:`, `checkout:` | Which command moved HEAD |
| Detail | `Show search results` | The commit message, or where the move went |

Read it from the top down, like a diary read backwards: the first line is the reset, and the line under it is where you were just before. That line is nearly always the one you want.

When the short lines are not enough to tell two commits apart, `git log -g` prints the same diary in the long `git log` form, with author and date:

```console
$ git log -g -2
commit ae46b3b7470c6f7e4a740c385d6c66632cc7b8c4
Reflog: HEAD@{0} (Practice Student <student@example.com>)
Reflog message: reset: moving to HEAD~2
Author: Practice Student <student@example.com>
Date:   Fri Nov 27 01:02:24 2026 +0300

    Add checkout

commit f5ecdac68293b497bc328442506f0a4139f9804e
Reflog: HEAD@{1} (Practice Student <student@example.com>)
Reflog message: commit: Show search results
Author: Practice Student <student@example.com>
Date:   Fri Nov 27 01:02:24 2026 +0300

    Show search results
```

`-g` is short for `--walk-reflogs`. Because it is `git log`, its options work too: `git log -g --oneline --grep=search` shows only the diary lines whose commit message contains "search". Worth knowing when the reflog is hundreds of lines long.

:::try-it
1. Run `git log --oneline`. Git lists three commits, with "Add checkout" on top.
2. Look at the history map. After the "Add checkout" station, which carries the `branch main` tag and the `HEAD · you` pin, two faded, dashed stations follow: "Add search box" and "Show search results", each marked `no branch` with its short ID. Those are the commits the reset left behind.
3. Run `git reflog`. Git prints six lines. The IDs on the lines `HEAD@{1}` and `HEAD@{2}` are the same short IDs you see on the two faded stations.
:::

Leave those two commits where they are: bringing them back is the first challenge at the end. For practice, you will lose and rescue commits of your own.

**How long the reflog remembers.** A reflog line is kept for 90 days. A line whose commit is no longer reachable from the branch, like the two above, is kept for 30 days. While a line exists, garbage collection will not touch its commit. So after a bad reset you have about a month.

### Rescue 1: commits lost by `git reset --hard`

You know where the commit is. There are two ways to make it reachable again, and they differ in what moves.

| Way | Command | What moves | Use it when |
|---|---|---|---|
| Put a new branch on it | `git branch recover-branch <id>` | Nothing. A new label appears on the lost commit | You want to look first, or your current branch has new work to keep |
| Move your branch back to it | `git reset --hard <id>` | Your branch, the staging area and your files | The reset itself was the mistake, and you want everything as it was |

Pro Git uses the first way, with a branch it names `recover-branch`. It is the careful choice, because it changes nothing you have now.

First, make two commits and lose them. Use a file of your own, so the shop files stay as they are.

:::try-it
1. Run `echo "idea one" > ideas.txt`, then `git add ideas.txt`, then `git commit -m "Add ideas"`. On the map, a new station appears after "Add checkout" and takes the `branch main` tag. The two faded search stations stay on the map.
2. Run `echo "idea two" >> ideas.txt`, then `git commit -am "More ideas"`. A second station appears, and `main` moves onto it.
3. Run `git reset --hard HEAD~2`. Git prints "HEAD is now at …" with "Add checkout". On the map, `main` and the HEAD pin jump back, and your two stations turn faded and dashed. Run `ls`: the file `ideas.txt` is gone from the folder.
4. Run `git reflog -4` (the number limits the list to the four newest lines). The line `HEAD@{1}` reads `commit: More ideas`. Its ID is the one to rescue.
:::

```console
$ git reset --hard HEAD~2
HEAD is now at ae46b3b Add checkout
$ git reflog -4
ae46b3b HEAD@{0}: reset: moving to HEAD~2
683034f HEAD@{1}: commit: More ideas
d056186 HEAD@{2}: commit: Add ideas
ae46b3b HEAD@{3}: reset: moving to HEAD~2
```

You rescue the newest lost commit only. Every commit records its parent, so "More ideas" brings "Add ideas" along with it.

:::predict
question: "You are about to run `git branch recover-branch <id>` with the ID of \"More ideas\". Will `main` move, and will `ideas.txt` come back into your folder?"
answer: "Neither. `git branch` only adds a label. The two stations turn solid because a branch reaches them again, but `main`, HEAD and your files stay on \"Add checkout\". The file returns when you switch to that branch or move `main` there."
:::

:::try-it
1. Run `git branch recover-branch` followed by your ID of "More ideas", for example `git branch recover-branch 683034f`. Git prints nothing. On the map, a `branch recover-branch` tag appears on the "More ideas" station, and both of your stations turn solid again. The `branch main` tag does not move.
2. Run `git log --oneline recover-branch`. Git lists five commits, with "More ideas" and "Add ideas" on top. They are reachable again.
3. Now the second way. Run `git reset --hard` followed by the same ID. Git prints "HEAD is now at …" with "More ideas". On the map, `main` and the HEAD pin jump forward onto that station. Run `ls`: `ideas.txt` is back.
4. The extra label has done its job. Run `git branch -d recover-branch`. The tag disappears; the stations stay solid, because `main` reaches them.
:::

```console
$ git branch recover-branch 683034f
$ git log --oneline recover-branch
683034f More ideas
d056186 Add ideas
ae46b3b Add checkout
42d5525 Add cart
03afda5 Add README
```

:::graph
caption: "After git branch recover-branch 683034f: the commits have a branch again, and main has not moved"
commits:
  - id: C
    message: Add checkout
  - id: F
    message: Add ideas
    parents: [C]
  - id: G
    message: More ideas
    parents: [F]
branches:
  main: C
  recover-branch: G
head: main
:::

:::careful
`git reset --hard <id>` is itself a hard reset: it overwrites every tracked file. If you have edits you did not commit, they are destroyed by the rescue. Run `git status` first. When it is not clean, use `git branch recover-branch <id>`, which touches no file.
:::

**The shortcut: `ORIG_HEAD`.** Before `git reset` moves your branch, Git writes the old position under the name `ORIG_HEAD` ("original HEAD"). So when the reset was the very last thing you did, you need no ID at all:

```console
$ git reset --hard HEAD~2
HEAD is now at ae46b3b Add checkout
$ git reset --hard ORIG_HEAD
HEAD is now at 683034f More ideas
```

:::try-it
1. Run `git reset --hard HEAD~2` once more. On the map, `main` jumps back to "Add checkout" and your two stations turn faded again.
2. Run `git reset --hard ORIG_HEAD`. Git prints "HEAD is now at …" with "More ideas". On the map, `main` and the HEAD pin are back on that station, and both stations are solid.
:::

`ORIG_HEAD` holds one position only. `git merge`, `git rebase` and the next `git reset` overwrite it. When in doubt, read the reflog: it keeps every position.

### Rescue 2: a deleted branch

The reset moved a label. `git branch -D` removes one, and the commits that only that branch reached are left with no branch. The cure is the same: find the ID of the branch's newest commit and put a branch on it, this time with the old name.

Git gives you that ID as it deletes:

```console
$ git branch -D try-banner
Deleted branch try-banner (was 1c9760d).
```

If that line has scrolled away, the reflog has it. HEAD stood on the branch's commits while you worked there:

```console
$ git reflog -4
683034f HEAD@{0}: checkout: moving from try-banner to main
1c9760d HEAD@{1}: commit: Try a banner
683034f HEAD@{2}: checkout: moving from main to try-banner
683034f HEAD@{3}: reset: moving to ORIG_HEAD
```

Two kinds of line help here. A `commit:` line shows a commit made on the branch. A `checkout: moving from try-banner to main` line marks the moment you left the branch (Git writes `checkout` for `git switch` too), so the line just under it is where the branch stood.

:::try-it
1. Run `git switch -c try-banner`, then `echo "<h1>Sale</h1>" > banner.html`, then `git add banner.html`, then `git commit -m "Try a banner"`. On the map, a new station appears with the `branch try-banner` tag and the HEAD pin.
2. Run `git switch main`, then `git branch -D try-banner`. Git prints "Deleted branch try-banner (was …)". On the map, the `branch try-banner` tag disappears and the "Try a banner" station turns faded, marked `no branch`.
3. Run `git reflog -4` and copy the ID on the line `commit: Try a banner`. It is the same ID as in the "Deleted branch" message.
4. Run `git branch try-banner` followed by that ID. On the map, the tag is back on the station and the station is solid again. Run `git branch`: Git lists `main` and `try-banner`.
:::

A branch is only a name on a commit, so "the same name on the same commit" is the same branch. Nothing else about it needs to be restored.

### Rescue 3: no reflog line, so ask `git fsck`

The reflog only knows commits HEAD has stood on. Some lost work was never under HEAD. The usual case is a dropped [stash](term:stash) entry: as the lesson [Stash unfinished work, clean the folder](lesson:stash-and-clean) showed, a stash entry is a commit with no branch, and you never stand on it. After `git stash drop`, no reflog line leads to it.

For that case Git has a second tool. `git fsck` ("file system check") inspects every object in the repository and checks that all are intact. As a side effect it reports the commits that nothing at all leads to:

```console
$ git stash
Saved working directory and index state WIP on main: 683034f More ideas
$ git stash drop
Dropped refs/stash@{0} (b4290cdeea6b08b5aa5255cb3a5af90da6f1c397)
$ git fsck
dangling commit b4290cdeea6b08b5aa5255cb3a5af90da6f1c397
```

A **dangling commit** is one that no branch, no tag, no reflog line and no other commit points at. Here it is the dropped stash entry: the ID is the same one `git stash drop` printed. (In a terminal, `git fsck` first prints a progress line, "Checking object directories".)

`git fsck` gives IDs and nothing else, so look inside before you trust one. Then bring it back with `git stash apply`, which takes a commit ID as well as a name like `stash@{0}`:

```console
$ git stash show -p b4290cd
diff --git a/ideas.txt b/ideas.txt
index 680d5da..56d4e23 100644
--- a/ideas.txt
+++ b/ideas.txt
@@ -1,2 +1,3 @@
 idea one
 idea two
+idea three
$ git stash apply b4290cd
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   ideas.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

:::predict
question: "You stash a change and drop the entry at once. Will `git reflog` show a line with the stash commit's ID?"
answer: "No. HEAD never stood on the stash commit, so the diary has no line for it. The reflog only gains a line `reset: moving to HEAD`, which is the stash tidying your files. This is the case `git fsck` is for."
:::

:::try-it
1. Run `echo "idea three" >> ideas.txt`, then `git stash`. In the picture, the `ideas.txt` sheet leaves the working tree, and a shelf appears above it: "Stash · 1".
2. Run `git stash drop`. Git prints "Dropped refs/stash@{0}" and a long ID. In the picture, the shelf is gone. No faded station appears on the map: the map draws the commits the reflog remembers, and this one is not among them.
3. Run `git reflog -2`. No line mentions the stash commit.
4. Run `git fsck`. Git prints one line, `dangling commit`, with the same ID that `git stash drop` printed.
5. Run `git stash show -p` followed by the first seven characters of that ID. Git shows the change: the line `+idea three`.
6. Run `git stash apply` followed by the same ID. In the picture, the `ideas.txt` sheet is back in the working tree, marked `edited`. Run `git restore ideas.txt` to tidy up.
:::

You can also give a dangling commit a branch, exactly as in the first two rescues: `git branch stash-rescue <id>`. That is the general rule of this lesson: **find the ID, then put a name on it.**

How long does a dangling commit last? No reflog line protects it, so the shorter limit applies: garbage collection removes unreachable objects once they are more than two weeks old. Rescue a dropped stash the same week.

### What is really lost

Git can only bring back what it once stored. That draws a sharp line:

| What happened | Did Git ever store it? | Can it come back? |
|---|---|---|
| Commits reset away, amended, or on a deleted branch | Yes, as commits | Yes, through `git reflog`, for about 30 days |
| A dropped stash entry | Yes, as a commit | Yes, through `git fsck`, for at least two weeks |
| A change you staged with `git add` but never committed | The file's content only | Often, with some digging (see Advanced) |
| Edits you never staged, overwritten by `git reset --hard` or `git restore` | No | No |
| Untracked files removed by `git clean` or deleted by hand | No | No |

For the last two rows, Git has nothing. Your editor's undo history or local file history, or a backup, is the only place left to look. This is the best argument for committing often: a rough commit on a branch of your own costs nothing, and it puts the work on the safe side of this table.

### When it goes wrong

**The reflog is long and you cannot find the line.** Search it by commit message with `git log -g --oneline --grep=<word>`. Or run `git reflog --date=iso`, which prints a date and time on each line in place of the number: useful when you know "it was yesterday afternoon".

```console
$ git branch try-banner 683034f
fatal: a branch named 'try-banner' already exists
```

The name is taken, so the branch was not deleted after all, or you already restored it. Check with `git branch -v`. To rescue under another name, pick one that is free.

```console
$ git branch oops abc1234
fatal: not a valid object name: 'abc1234'
```

Git has no commit with that ID. Most often it is a typing mistake: copy the ID again from `git reflog`. If the ID is right and Git still refuses, the commit was removed by garbage collection, and it cannot be rescued from this repository.

**`git reflog` is nearly empty.** The reflog is private to one copy of the project on one computer. It is never sent to a server and never comes along in a clone. A fresh clone starts a new diary, so a commit you lost on your laptop cannot be found from another computer. Go back to the copy where the work was done.

## Under the hood

"Must know" used the reflog and `git fsck` as two search tools. This layer shows what each one reads, which explains why the reflog misses a dropped stash, why `git fsck` finds it, and where the 90, 30 and 14 days come from.

### The reflog is a text file per ref

A [ref](term:ref) is a name that holds one commit ID: a branch, a tag, or HEAD. For HEAD and for each branch, Git keeps a log file under `.git/logs/`:

```console
$ ls .git/logs .git/logs/refs/heads
.git/logs:
HEAD
refs

.git/logs/refs/heads:
main
try-banner
$ tail -2 .git/logs/HEAD
1c9760db85192aa611ee1c04584f951058d17703 683034fa8f0392afbad9d438b6b450411604627e Practice Student <student@example.com> 1795730546 +0300	checkout: moving from try-banner to main
683034fa8f0392afbad9d438b6b450411604627e 683034fa8f0392afbad9d438b6b450411604627e Practice Student <student@example.com> 1795730546 +0300	reset: moving to HEAD
```

Each line is one move: the ID before, the ID after, who did it, when (as a number of seconds), and the message. `git reflog` reads `.git/logs/HEAD` from the bottom up and numbers the lines `HEAD@{0}`, `HEAD@{1}` and so on. Pro Git notes that the low-level command `git update-ref` writes these lines too, which is one reason to use it and not edit a ref file by hand.

Two facts follow from "one file per ref":

- **Each branch has its own diary.** `git reflog show main` lists only the moves of `main`, as `main@{0}`, `main@{1}`. It is shorter than HEAD's diary, because switching branches does not move `main`.
- **Deleting a branch deletes its diary.** `git branch -D try-banner` removes `.git/logs/refs/heads/try-banner` as well. That is why you rescue a deleted branch from HEAD's reflog, and why a branch whose commits HEAD never stood on (one a teammate made, which you deleted without switching to it) has no line there at all.

### How `git fsck` finds what the reflog cannot

`git fsck` does not read a diary. It starts from every ref and every reflog line, follows every link (commit to parent, commit to its files) and ticks off each object it meets. Then it compares that list with everything stored in `.git/objects`. Whatever was never ticked is **unreachable**.

A dropped stash entry is two unreachable commits, as the stash lesson showed: one for your files and one for the staging area. Yet `git fsck` printed one line. By default it reports only the **dangling** objects: the unreachable ones that no other unreachable object points at. They are the loose ends of each lost chain, and so the IDs you need. `--unreachable` lists every object in the chain:

```console
$ git fsck
dangling commit b4290cdeea6b08b5aa5255cb3a5af90da6f1c397
$ git fsck --unreachable
unreachable blob 56d4e230bf56f02d50613372881a64d90719a237
unreachable commit d9548c41d20955e42b923a65bef020b68d103d7f
unreachable commit b4290cdeea6b08b5aa5255cb3a5af90da6f1c397
unreachable tree beda610e24ae3cda5bd58a1ad986f9a3ecfa0fed
```

The second commit, `d9548c4`, is the stash's staging-area commit. The dangling one points at it, so it is not a loose end. The blob is the content of `ideas.txt` with its third line, and the tree is the folder listing of that commit (the lesson [A first look inside .git](lesson:first-look-inside) introduced these object types).

Notice what is missing from both lists: the two search commits of the practice project. A reflog line still leads to them, and `git fsck` counts reflog lines as a way to reach a commit. Add `--no-reflogs` to ignore the diary, and they show up as well:

```console
$ git fsck --no-reflogs
dangling commit b4290cdeea6b08b5aa5255cb3a5af90da6f1c397
dangling commit f5ecdac68293b497bc328442506f0a4139f9804e
```

`f5ecdac` is "Show search results". One line stands for both lost commits, because the newest one points at its parent.

### How long things are kept

Garbage collection follows three time limits. Each is a setting with a default:

| Setting | Default | What it protects |
|---|---|---|
| `gc.reflogExpire` | 90 days | Reflog lines whose commit is still part of the branch's history |
| `gc.reflogExpireUnreachable` | 30 days | Reflog lines whose commit is no longer reachable from the branch: reset away, amended, rebased |
| `gc.pruneExpire` | 2 weeks | Unreachable objects with no reflog line, such as a dropped stash |

The order of events for a commit you reset away: for 30 days its reflog line protects it. Then the line expires, and the commit becomes a plain unreachable object, which the next garbage collection may delete. Git runs that collection by itself now and then, when enough loose objects have piled up; Pro Git gives about 7,000 as the trigger. On a small project it may not run for months, so old commits often outlive the limits. Count on the limits, not on the luck.

### `ORIG_HEAD` is a file with one line

`ORIG_HEAD` is a file in `.git` that holds one commit ID:

```console
$ cat .git/ORIG_HEAD
683034fa8f0392afbad9d438b6b450411604627e
```

Commands that move your branch a long way in one step (`git reset`, `git merge`, `git rebase`) write the old position there before they start. It is a single slot with no history: each such command overwrites it. The reflog holds the same information with every earlier position kept.

## Advanced

### No reflog at all: the book's test

Pro Git proves that `git fsck` works without any diary. It deletes the rescued branch, then deletes the whole reflog folder, and asks `git fsck` for the lost commits:

```console
$ git branch -D try-banner
Deleted branch try-banner (was 1c9760d).
$ rm -Rf .git/logs/
$ git reflog
$ git fsck --full
dangling commit 1c9760db85192aa611ee1c04584f951058d17703
dangling blob 2487061b54ff03c8eaf405b48c9b1e7838f6480d
dangling commit b4290cdeea6b08b5aa5255cb3a5af90da6f1c397
dangling commit f5ecdac68293b497bc328442506f0a4139f9804e
```

`git reflog` prints nothing, and every lost chain is now dangling: the deleted branch, the dropped stash and the commits the reset left behind. (The blob is a file that was staged and never committed; the next part is about those.) `git branch <name> <id>` rescues each one. Do not try this on a project you care about: without the reflog, the commits lose their 30 days of protection.

:::compare
today: "`git fsck` checks everything; `--full` has been the default for many years."
book: "`git fsck --full` is what Pro Git types. It still works and does the same."
:::

### Staged once, never committed

`git add` stores a file's content in `.git/objects` at once, as a [blob](term:blob), before any commit exists. If you then overwrite the file or unstage and delete it, the blob stays behind with nothing pointing at it. The lesson [Unstage and discard changes](lesson:undo-basics) promised a way to dig it out, and `git fsck` is that way:

```console
$ git fsck
dangling blob 2487061b54ff03c8eaf405b48c9b1e7838f6480d
dangling commit b4290cdeea6b08b5aa5255cb3a5af90da6f1c397
$ git show 2487061b
secret draft
```

A blob holds content only. The file name was recorded in the staging area, and that record is gone, so you have to recognise the file by what is in it. `git show <id> > draft.txt` writes it back to a file.

With many candidates, `git fsck --lost-found` helps. It also writes every dangling object into the folder `.git/lost-found/`: commits as files in `commit/`, and blobs with their full content in `other/`, where you can open and search them with ordinary tools.

```console
$ git fsck --lost-found
dangling blob 2487061b54ff03c8eaf405b48c9b1e7838f6480d
dangling commit b4290cdeea6b08b5aa5255cb3a5af90da6f1c397
dangling commit f5ecdac68293b497bc328442506f0a4139f9804e
$ ls .git/lost-found/other
2487061b54ff03c8eaf405b48c9b1e7838f6480d
```

`--lost-found` ignores the reflog, like `--no-reflogs`, which is why `f5ecdac` is on this list too.

### Many dangling commits: read their messages

An old repository can hold dozens of dangling commits. The Git reference for `git stash` gives a pipeline that turns the bare IDs into a readable list of stash-like commits. Here it runs in a project where two stash entries were dropped:

```console
$ git fsck --unreachable | grep commit | cut -d' ' -f3 | xargs git log --merges --no-walk --oneline
3af888e WIP on main: 81acbc8 Add coupon field
c0d4225 WIP on main: 81acbc8 Add coupon field
```

Piece by piece: `git fsck --unreachable` lists the objects, `grep commit` keeps the commits, `cut` keeps the ID column, and `xargs` hands the IDs to `git log`. `--no-walk` shows only those commits and not their parents. `--merges` keeps commits with two parents, which is the shape of a stash entry. Leave `--merges` out to see every lost commit.

When two entries carry the same message, as here, `git show --stat <id>` or `git stash show -p <id>` tells you which files each one changed.

To put a found entry back on the stash shelf, not into your files, use `git stash store -m "Recovered ideas" <id>`. It appears in `git stash list` again.

### Name a position by time

The reflog stores a time on every line, so a position can be named by time as well as by number. `main@{yesterday}` is where `main` pointed a day ago, and `HEAD@{5.minutes.ago}` where HEAD was five minutes ago. `git reset --hard main@{yesterday}` undoes a whole bad afternoon. The lesson [Point at any commit: HEAD~2, ranges, reflog names](lesson:revision-selection) teaches these names in full.

In PowerShell, braces have a meaning of their own, so put such a name in quotes: `git reset --hard "HEAD@{1}"`.

### Deleting for real

Sometimes the aim is the opposite: a password was committed and must be gone now, not in 30 days. Two commands remove the safety nets:

```console
$ git reflog expire --expire=now --all
$ git gc --prune=now
```

The first empties every reflog; the second deletes every unreachable object, whatever its age.

:::careful
After these two commands, nothing in this lesson works any more: every commit without a branch or tag is gone for good. Use them only as the last step of a planned clean-up. The lesson [Remove a leaked secret or huge file from history](lesson:remove-sensitive-data) shows the full procedure, and the lesson [Packfiles and garbage collection](lesson:packfiles-gc) explains what `git gc` does to the rest of the repository.
:::

## Recap

- Reset, amend and `git branch -D` move or remove a label. The commits stay in the repository, unreachable: the faded `no branch` stations on the map.
- `git reflog` lists every commit HEAD stood on (`git log -g` for the long form). Find the line from before the mistake and copy its ID.
- Rescue is "find the ID, then put a name on it": `git branch <name> <id>` changes nothing else; `git reset --hard <id>` moves your branch back; `ORIG_HEAD` is the position before the last reset.
- A dropped stash has no reflog line. `git fsck` lists it as a dangling commit; `git stash apply <id>` brings it back.
- Reflog lines last 90 days, or 30 for unreachable commits; unreachable objects with no line last two weeks. Edits you never staged were never stored and cannot come back.
