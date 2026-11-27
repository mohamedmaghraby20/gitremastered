---
id: rebasing
title: "Rebasing, and when not to"
module: working-in-a-team
bookSection: "3.6 Git Branching - Rebasing"
bookUrl: https://git-scm.com/book/en/v2/Git-Branching-Rebasing
bookSources:
  - vendor/progit2/book/03-git-branching/sections/rebasing.asc
readFirst: [remote-branches]
---

Your feature branch is three days old, and `main` has moved on without it. A merge would tie the two together with a merge commit. A rebase rebuilds your commits on top of today's `main`, as if you had started the work this morning. This lesson teaches `git rebase`, how to get through a conflict in the middle of one, and the one rule that keeps a rebase from hurting your team.

## Must know

In [Branch, merge, and fix conflicts](lesson:branch-and-merge) you joined two branches that had both moved, and Git recorded the join in a [merge commit](term:merge-commit). Pro Git names two main ways to bring the changes of one branch into another: the merge and the rebase. This lesson is about the second one.

### The practice project

The terminal on the right opens in the bakery website again. Run `git log --oneline --graph --all`:

```console
$ git log --oneline --graph --all
* 3ae1e9e Add tagline to homepage
| * c1f5eb1 Add prices to menu
| * beb251d Add menu
|/
* 5432a6f Add contact page
* 62be25a Add homepage
```

A branch named `menu` has two commits. It was started from `Add contact page`, and `main` got one more commit since then. You are on `main`. (Your commit IDs will differ from the ones printed in this lesson.)

Rebasing `menu` is the first challenge at the end of this lesson, so leave that branch alone for now. The Try-its below make branches of their own, each starting with `try-`.

### Rebase replays your commits on a new base

`git rebase <branch>` tells Git: take the commits I made on the branch I am on, and make them again on top of that other branch.

Two words first.

- The **base** of a branch is the commit it was started from. In the log above, the base of `menu` is `Add contact page`.
- To **replay** a commit is to make the same change again somewhere else: the same lines added and removed, the same message, the same author.

So "[rebase](term:rebase)" means "give my branch a new base". Here is the idea in a picture. You started `try-hours` from commit B and made commit C. Meanwhile `main` got commit D:

:::graph
caption: "Before: try-hours was started from B. main has moved on to D."
commits:
  - id: B
    message: Add tagline to homepage
  - id: D
    message: Add founding year
    parents: [B]
  - id: C
    message: Add opening hours
    parents: [B]
branches:
  main: D
  try-hours: C
head: try-hours
:::

You are on `try-hours` and run `git rebase main`. Git looks at what C changed (it added `hours.txt`), goes to D, and makes that change again there. The result is a new commit, C':

:::graph
caption: "After git rebase main: C' is a new commit on top of D. The old C is left behind. main did not move."
commits:
  - id: B
    message: Add tagline to homepage
  - id: D
    message: Add founding year
    parents: [B]
  - id: C
    message: Add opening hours
    parents: [B]
    faded: true
  - id: "C'"
    message: Add opening hours
    parents: [D]
branches:
  main: D
  try-hours: "C'"
head: try-hours
:::

The history of `try-hours` is now one straight line: B, D, C'. A history with no merge commits in it is called a [linear history](term:linear-history). It reads as if you had started your work after D, even though you started it before.

Now the same thing with real commit IDs. Before the rebase:

```console
$ git log --oneline --graph main try-hours
* d796c24 Add founding year
| * eac1b1e Add opening hours
|/
* 3ae1e9e Add tagline to homepage
* 5432a6f Add contact page
* 62be25a Add homepage
```

The rebase itself prints one line:

```console
$ git rebase main
Successfully rebased and updated refs/heads/try-hours.
```

`refs/heads/try-hours` is the full name of the branch `try-hours`. And after:

```console
$ git log --oneline --graph main try-hours
* 87531f6 Add opening hours
* d796c24 Add founding year
* 3ae1e9e Add tagline to homepage
* 5432a6f Add contact page
* 62be25a Add homepage
```

Compare the two logs line by line.

| | Before | After |
|---|---|---|
| `Add opening hours` | `eac1b1e`, comes after `3ae1e9e` | `87531f6`, comes after `d796c24` |
| `Add founding year` on `main` | `d796c24` | `d796c24`, unchanged |
| Shape | Two lines that split | One straight line |

`Add opening hours` has a **new ID**. That is the most important fact of this lesson, so here it is once more in plain words: a rebase does not move your commits. It makes new commits that carry the same changes, and points your branch at them. A [commit ID](term:commit-id) is a checksum of everything in the commit, and that includes which commit came before it. A commit with a different [parent](term:parent-commit) cannot have the same ID.

What stays the same:

- `main` is not touched. A rebase only rewrites the branch you are on.
- The message, the author and the author's date of each commit are copied over.
- The old commit `eac1b1e` is not deleted. No branch leads to it any more, but Git keeps it for weeks. That is your safety net, and "Undo a rebase" below uses it.

The common wrong idea is "rebase moved my commits onto `main`". Two things are wrong in that sentence. Nothing moved: the commits were made again, with new IDs. And nothing landed on `main`: the `main` label still sits on D. Your branch now starts from `main`'s newest commit, which is a different thing.

:::predict
question: "try-hours has one commit that main lacks, and main has one commit that try-hours lacks. You are on try-hours and run git rebase main. Afterwards, how many commits does try-hours have that main lacks, and can main be fast-forwarded to try-hours?"
answer: "Still one: the new copy of your commit. And yes. try-hours now starts from main's newest commit, so main is simply behind it, and git merge try-hours on main is a fast-forward with no merge commit."
:::

:::try-it
1. Run `git switch -c try-hours`. Git makes a branch named `try-hours` where `main` is and switches to it. In the picture, a `branch try-hours` tag appears on the `Add tagline to homepage` station.
2. Create a file and commit it: `echo "Open 9 to 5" > hours.txt`, then `git add hours.txt`, then `git commit -m "Add opening hours"`. In the picture, a new station appears with the `branch try-hours` tag on it.
3. Run `git switch main`. Give `main` a commit of its own: `echo "<p>Baking since 1990</p>" >> index.html`, then `git commit -am "Add founding year"`. In the picture, `main` and `try-hours` now sit on two different rows.
4. Run `git log --oneline --graph main try-hours` and note the ID next to `Add opening hours`.
5. Run `git switch try-hours`, then `git rebase main`. Git prints `Successfully rebased and updated refs/heads/try-hours.` In the picture, a new `Add opening hours` station appears after the `Add founding year` station, and the `branch try-hours` tag and the `HEAD · you` pin sit on it. The old `Add opening hours` station stays where it was, faded and dashed, marked `no branch`. That faded station is the old commit: still there, with no branch leading to it.
6. Run `git log --oneline --graph main try-hours` again. One straight line, and `Add opening hours` has a different ID from the one you noted.
7. Run `git switch main`, then `git merge try-hours`. Git prints `Fast-forward`. In the picture, the `branch main` tag moves onto the new `Add opening hours` station. No merge commit was made.
8. Run `git branch -d try-hours` to remove the label you no longer need.
:::

Steps 5 and 7 together are the usual pattern: rebase your branch onto `main`, then fast-forward `main` to it. The [fast-forward](term:fast-forward) works because, after the rebase, `main` has nothing your branch lacks.

:::compare
today: "`git switch experiment`, then `git rebase main`. Git prints `Successfully rebased and updated refs/heads/experiment.`"
book: "Pro Git writes `git checkout experiment` and `git rebase master`, and shows the older output `First, rewinding head to replay your work on top of it... Applying: added staged command`. The result is the same."
:::

### Which branch do I stand on?

You have just seen that rebase and merge are aimed in opposite ways. Mixing them up is the usual first mistake, so put the two side by side.

| You want | Stand on | Run | What changes |
|---|---|---|---|
| The work of `menu` inside `main` | `main` (the receiver) | `git merge menu` | `main` |
| `menu` rebuilt on top of today's `main` | `menu` (the branch to rewrite) | `git rebase main` | `menu` |

With merge, the branch you are on receives. With rebase, the branch you are on is rewritten, and the branch you name is only read.

:::careful
Running `git rebase menu` while you are on `main` rewrites `main`. On a shared branch that breaks the golden rule you will meet below. Before any rebase, check which branch you are on with `git status`.
:::

### Rebase or merge?

Both commands bring two lines of work together, and Pro Git points out that the files you end up with are the same either way. Only the history differs.

| | Merge | Rebase |
|---|---|---|
| New commits | One merge commit with two parents | A new copy of each of your commits |
| Existing commits | Untouched | Yours are replaced by the copies |
| Shape of history | Two lines that split and join | One straight line |
| What history says | What really happened, and when | A tidy story, as if the work was done in order |
| Safe on commits other people have | Yes | No |

Pro Git describes two views and does not pick a winner. One view: history is a record of what really happened, and changing it is a kind of lie. The other: history is the story of how the project was made, and you tidy a story before you publish it. Teams choose differently, and the lesson "Merge, squash or rebase-merge a PR" comes back to this choice.

The book's own advice gives you both: rebase your local commits to clean them up before you push, and never rebase anything you have already pushed.

The most common use in practice: before you share a branch, fetch and rebase it onto the newest `main` from the server.

```console
$ git fetch
$ git rebase origin/main
```

`origin/main` is the [remote-tracking branch](term:remote-tracking-branch) from the last lesson. After this, your commits sit on top of the team's latest work, so whoever brings your branch into `main` gets a fast-forward and has no combining to do.

### When a rebase stops on a conflict

The rebase above went through because your commit and `main`'s commit touched different files. When one of your commits changes the same lines as a commit on the new base, Git cannot replay it by itself. That is a [merge conflict](term:merge-conflict), the same kind you resolved in the merging lesson, with one difference: a rebase replays your commits **one at a time**, so it stops at the commit that conflicts, in the middle of the job.

```console
$ git rebase main
Auto-merging hours.txt
CONFLICT (content): Merge conflict in hours.txt
error: could not apply cca4fc4... Stay open until 8
hint: Resolve all conflicts manually, mark them as resolved with
hint: "git add/rm <conflicted_files>", then run "git rebase --continue".
hint: You can instead skip this commit: run "git rebase --skip".
hint: To abort and get back to the state before "git rebase", run "git rebase --abort".
hint: Disable this message with "git config set advice.mergeConflict false"
Could not apply cca4fc4... # Stay open until 8
```

Read it in three parts.

- `CONFLICT (content): Merge conflict in hours.txt` names the file.
- `could not apply cca4fc4... Stay open until 8` names the commit of yours that Git was replaying when it stopped.
- The `hint:` lines list your three ways out.

| Command | What it does | When to use it |
|---|---|---|
| `git rebase --continue` | Commits your resolution and replays the commits that are left | After you fixed the file and ran `git add`. The normal way forward |
| `git rebase --skip` | Drops the commit Git stopped at and goes on with the next one | Rarely: only when that commit is no longer needed, for example because the new base already has the same fix |
| `git rebase --abort` | Stops the rebase and puts the branch and your files back as they were before it | Whenever you are unsure. Nothing is lost, and you can start again later |

The file has the same marker lines as in a merge, but read the two sides with care:

```text
<<<<<<< HEAD
Open 10 to 5
=======
Open 9 to 8
>>>>>>> cca4fc4 (Stay open until 8)
```

- From `<<<<<<< HEAD` down to `=======`: the lines as they are on the **new base**. Here that is `main`.
- From `=======` down to `>>>>>>>`: the lines from **your commit**, the one being replayed. Git prints its short ID and message so you know which one.

In a merge, the top part was your branch. In a rebase, the top part is the branch you are rebasing onto. The reason is in Under the hood; for now, trust the label on the last marker line.

To resolve:

1. Edit the file until it reads the way it should after this commit, and remove the three [marker lines](term:conflict-marker).
2. `git add <file>` to tell Git the conflict is resolved.
3. `git rebase --continue`. Do not run `git commit` here: `--continue` makes the commit for you and then goes on.

`git rebase --continue` opens your editor with the message of the commit, so you can change it. Save and close the editor to keep the message. The lesson [Status, stage, commit](lesson:three-areas) shows how to get out of Vim.

:::predict
question: "try-late has two commits. The first changes a line of hours.txt that main also changed. The second adds a new file, closed.txt. You run git rebase main. How many times does Git stop, and what happens to the second commit?"
answer: "Once, at the first commit. After you resolve it and run git rebase --continue, Git replays the second commit by itself, because nothing on main touches closed.txt. A rebase can stop once for every commit that conflicts, and not at all for the others."
:::

This Try-it continues from the last one: `hours.txt` is on `main` and reads `Open 9 to 5`.

:::try-it
1. Run `git switch -c try-late`, then `echo "Open 9 to 8" > hours.txt`, then `git commit -am "Stay open until 8"`. The branch `try-late` changed the one line of `hours.txt`.
2. Add a second commit: `echo "Closed on Mondays" > closed.txt`, then `git add closed.txt`, then `git commit -m "Add closing day"`. In the picture, `try-late` is two stations ahead of `main`.
3. Run `git switch main`, then `echo "Open 10 to 5" > hours.txt`, then `git commit -am "Open at 10"`. Now `main` changed the same line in a different way.
4. Run `git switch try-late`, then `git rebase main`. Git prints `CONFLICT (content): Merge conflict in hours.txt`. In the picture, a banner above the desk reads "Rebase stopped: 1 file has a conflict", and the `hours.txt` sheet in the working tree is marked `conflict`.
5. Run `git status`. Near the top Git lists the commit it stopped at under "Last command done" and the one still waiting under "Next command to do". Under "Unmerged paths" you see `both modified: hours.txt`.
6. Run `cat hours.txt`. You see `Open 10 to 5` from `main` in the top part and your `Open 9 to 8` in the bottom part.
7. Run `git rebase --abort`, then `cat hours.txt`. The file reads `Open 9 to 8` again and the banner is gone: the rebase never happened.
8. Run `git rebase main` again. The same conflict comes back.
9. Write the final version: `echo "Open 10 to 8" > hours.txt`. This replaces the whole file, markers included. In a real project you would do this in your editor.
10. Run `git add hours.txt`. In the picture, the `hours.txt` sheet slides into the staging area and loses its `conflict` mark. The banner now reads "Rebase in progress".
11. Run `git rebase --continue`. Your editor opens with the message `Stay open until 8`; save and close it. Git prints `Successfully rebased and updated refs/heads/try-late.` In the picture, the banner disappears. Two new stations, `Stay open until 8` and `Add closing day`, stand after the `Open at 10` station, with the `branch try-late` tag on the last one. The two old stations are still on the map, faded and marked `no branch`.
12. Run `git log --oneline --graph main try-late`. One straight line, with your two commits on top of `Open at 10`.
:::

This is what step 5 prints:

```console
$ git status
interactive rebase in progress; onto c5fb287
Last command done (1 command done):
   pick cca4fc4 # Stay open until 8
Next command to do (1 remaining command):
   pick 4f89710 # Add closing day
  (use "git rebase --edit-todo" to view and edit)
You are currently rebasing branch 'try-late' on 'c5fb287'.
  (fix conflicts and then run "git rebase --continue")
  (use "git rebase --skip" to skip this patch)
  (use "git rebase --abort" to check out the original branch)

Unmerged paths:
  (use "git restore --staged <file>..." to unstage)
  (use "git add <file>..." to mark resolution)
	both modified:   hours.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

`pick` means "replay this commit". Git says "interactive rebase" even though you asked for a plain one, because every rebase runs on the same machinery today. You can ignore the word here. The interactive rebase, where you edit that list of commits yourself, is the subject of the lesson [Reword, squash, reorder, split; fixup and autosquash](lesson:clean-up-history).

And step 11:

```console
$ git rebase --continue
[detached HEAD 5dc2912] Stay open until 8
 1 file changed, 1 insertion(+), 1 deletion(-)
Successfully rebased and updated refs/heads/try-late.
```

The first line is the copy of your commit, with its new ID. It says `detached HEAD` where a commit normally names the branch, because Git builds the copies off any branch and moves the `try-late` label only at the very end. Under the hood shows the steps.

### The golden rule: do not rebase what others have

You now know that a rebase replaces your commits with new ones. On commits that only you have, nobody notices. On commits that other people already have, it causes real trouble. Pro Git sums the danger up in a single line:

> Do not rebase commits that exist outside your repository and that people may have based work on.

Here is why. Say you pushed a branch `gallery` with one commit, C. The server has C now, and a teammate may have pulled it and built on it. Then you rebase `gallery` onto the new `main`:

:::graph
caption: "After you rebase a pushed branch: your gallery points at the copy C', but the server (origin/gallery) and your teammates still have C"
commits:
  - id: A
    message: Add contact page
  - id: D
    message: Add tagline to homepage
    parents: [A]
  - id: C
    message: Add gallery
    parents: [A]
  - id: "C'"
    message: Add gallery
    parents: [D]
branches:
  main: D
  gallery: "C'"
remotes:
  origin/gallery: C
head: gallery
:::

Your repository says the branch is D then C'. The server and your teammates say it is C. Git sees C and C' as two unrelated commits, because their IDs differ. Whoever combines the two versions next gets both, and the same change shows up twice in the history:

```console
$ git log --oneline --graph
*   f4ab525 Merge branch 'gallery' of ../origin into gallery
|\
| * 6047449 Add gallery
* | bfcf76e Add gallery
* | b38c9d4 Add tagline to homepage
|/
* 19b51b5 Add contact page
* b1a0f86 Add homepage
```

Two commits named `Add gallery`, with the same author and date. Pro Git walks through this exact mess. The only other way out is to overwrite the server's branch with a [force push](term:force-push), and then every teammate who built on C has to repair their own copy.

The book ends the chapter with three cases. Use them as your test before every rebase:

| The commits you want to rebase | Rebase them? |
|---|---|
| Have never left your computer | Yes, freely |
| Are pushed, but on a branch only you work on | Yes. You will need a force push afterwards; the lesson "Force-pushing safely with `--force-with-lease`" shows the safe form |
| Are pushed, and other people may have built on them (`main`, a shared branch) | No. Merge instead |

### Undo a rebase

A finished rebase can be taken back, because the old commits are still in the repository. When a rebase starts, Git writes down where your branch was in `ORIG_HEAD`, the same one-step memory you met in [Reset demystified: the three trees](lesson:reset-demystified).

```console
$ git reset --hard ORIG_HEAD
HEAD is now at 4f89710 Add closing day
```

The branch points at your old commits again, as if the rebase had not run.

:::try-it
1. Run `git reset --hard ORIG_HEAD` on `try-late`. Git prints `HEAD is now at …` with the ID and message of your old `Add closing day` commit. In the picture, the `branch try-late` tag jumps back to the old stations, which turn solid again. The two copies the rebase made are now the faded ones.
2. Run `git log --oneline --graph main try-late`. The two lines split again, exactly as before the rebase.
:::

:::careful
`git reset --hard` also throws away edits you have not committed, so run `git status` first. And `ORIG_HEAD` remembers only the last big move: a later reset, merge or rebase overwrites it. Use it right after the rebase you regret. For anything older, the [reflog](term:reflog) has the full record; see Under the hood.
:::

To stop a rebase that is still **in progress**, use `git rebase --abort`. `ORIG_HEAD` is for one that already finished.

### `git pull --rebase`

In [Work with remotes: fetch, pull, push](lesson:remotes), `git pull` fetched and then merged. `git pull --rebase` fetches, then rebases: it replays the commits you have not pushed yet on top of what came from the server. You get no merge commit, and a straight line.

This is safe under the golden rule. The only commits it rewrites are the ones you have not pushed, so nobody else has them.

### When it goes wrong

```console
$ git rebase main
error: cannot rebase: You have unstaged changes.
error: Please commit or stash them.
```

You have edits you have not committed. A rebase rebuilds your files commit by commit, so Git wants a clean working tree first. Commit the edits, or put them aside with `git stash` (the lesson [Stash unfinished work, clean the folder](lesson:stash-and-clean)), then run the rebase again.

```console
$ git rebase --continue
hours.txt: needs merge
You must edit all merge conflicts and then
mark them as resolved using git add
```

You fixed the file but did not stage it, or did not fix it yet. Git cannot tell the difference. Remove the markers, run `git add hours.txt`, then `git rebase --continue` again. If you are lost in the middle of a rebase, `git status` always names the next step, and `git rebase --abort` always takes you back. Errors like `fatal: cannot switch branch while rebasing` mean the same thing: a rebase is still open, so finish it or abort it first.

```console
$ git push
To ../origin.git
 ! [rejected]        gallery -> gallery (non-fast-forward)
error: failed to push some refs to '../origin.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

You rebased a branch you had already pushed. The server still has the old commits, your branch has the copies, and the server refuses to drop commits on a normal push. Do not follow the hint here: `git pull` would merge the old commits with their copies and give you the doubled history shown above. Choose by the golden rule:

- Other people use the branch: undo the rebase with `git reset --hard ORIG_HEAD` (or `git reset --hard origin/gallery`, which sets your branch to what the server has), then merge instead.
- The branch is yours alone: a force push is the right tool. Learn it in "Force-pushing safely with `--force-with-lease`" before you use it.

One more message is no error at all: `Current branch try-hours is up to date.` means your branch already starts from the newest commit of the branch you named, so there is nothing to replay.

## Under the hood

Must know treated a rebase as "make my commits again over there". This layer shows the steps Git takes, why a copy can never keep its ID, and where the old commits go. With these you can predict what a rebase will do before you run it.

### The steps of a rebase

Pro Git describes the work in four steps. For `git rebase main` on `try-hours`:

1. Find the last commit the two branches share, their [merge base](term:merge-base).
2. For each commit on your branch after that point, work out what it changed.
3. Go to the newest commit of `main`.
4. Apply those changes there, one commit at a time, oldest first, and commit each one. At the end, point `try-hours` at the last new commit.

Git's diary of where [HEAD](term:head) has been, the reflog, shows these steps. Read it from the bottom up:

```console
$ git reflog -5
87531f6 HEAD@{0}: rebase (finish): returning to refs/heads/try-hours
87531f6 HEAD@{1}: rebase (pick): Add opening hours
d796c24 HEAD@{2}: rebase (start): checkout main
eac1b1e HEAD@{3}: checkout: moving from main to try-hours
d796c24 HEAD@{4}: commit: Add founding year
```

- `rebase (start): checkout main`: Git went to `main`'s newest commit, `d796c24`. It did so on a [detached HEAD](term:detached-head), so `main` itself never moves.
- `rebase (pick)`: Git replayed one of your commits there. A longer branch has one `pick` line per commit.
- `rebase (finish)`: Git pointed `try-hours` at the result and put you back on the branch.

That is why `git branch` shows `* (no branch, rebasing try-late)` while a rebase is stopped, and why the commit in the Try-it was reported as `[detached HEAD 5dc2912]`.

### Why the copy has a new ID

Here is the old commit and its copy, printed raw:

```console
$ git cat-file -p eac1b1e
tree cf120b987ea116e3973bf4ed7af47e18d1e884f4
parent 3ae1e9ece250ed670b7b7083f7cece6123cd6506
author Practice Student <student@example.com> 1795730509 +0300
committer Practice Student <student@example.com> 1795730509 +0300

Add opening hours
```

```console
$ git cat-file -p 87531f6
tree 4fdfdb1b14206da7e1f469fbeea72de90a2d2fdb
parent d796c24a4740617ebc06a428ff268e99bc4e1527
author Practice Student <student@example.com> 1795730509 +0300
committer Practice Student <student@example.com> 1795730512 +0300

Add opening hours
```

| Line | Same or different | Why |
|---|---|---|
| `tree` | Different | The [snapshot](term:snapshot) now also holds `main`'s change to `index.html` |
| `parent` | Different | The copy comes after `d796c24`, not `3ae1e9e` |
| `author` | Same | Who wrote the change, and when, is copied over |
| `committer` | Different time | The committer line records who made this commit object and when: you, at the moment of the rebase |
| Message | Same | Copied over |

The ID is a checksum of all these lines. Three of them changed, so the ID changed. There is no way to keep an ID while changing a parent, which is why "rebase" and "new IDs" always come together.

### Commit by commit, where a merge looks at the ends

A merge compares three snapshots: the merge base and the newest commit of each branch. It ignores the commits in between, so it stops at most once.

A rebase replays each commit in order. Ten commits are ten small steps, and each step can conflict. If three of your commits touch the same lines that `main` changed, you may resolve three conflicts where a merge would have asked once. In return, each conflict is small and belongs to one commit you know.

Pro Git notes that the end result is the same: the snapshot of the last rebased commit matches the snapshot the merge commit would have had.

### What Git keeps while a rebase is paused

While a rebase waits for you, its state is in the folder `.git/rebase-merge/`.

```console
$ cat .git/rebase-merge/head-name
refs/heads/try-late
$ cat .git/rebase-merge/onto
c5fb28789de78cf866f13a83c0682c106901efb6
$ cat .git/rebase-merge/done
pick cca4fc40b994dfdeb198a2b5567acacc1ec44b40 # Stay open until 8
$ cat .git/rebase-merge/git-rebase-todo
pick 4f89710eb6ab95bb1b2f3c284c138ba894fbe1b3 # Add closing day
```

- `head-name`: the branch being rebased. Git moves this label only at the very end.
- `onto`: the commit your work is being replayed on.
- `done` and `git-rebase-todo`: the commits already replayed and the ones still waiting. `git status` reads these two files for its "Last command done" and "Next command to do" lines.

`git rebase --continue` takes the next line from the to-do file. `git rebase --abort` reads the files, puts the branch back, and deletes the folder. As long as the folder exists, Git says a rebase is in progress.

### Why the two sides of a conflict are swapped

During a paused rebase, HEAD is on the new base plus the commits replayed so far. Your own commit is the one coming in. So everything Git labels "ours" or `HEAD` is the base, and "theirs" is your commit:

```console
$ git ls-files -u
100644 1bdb726c0c214a062ab522e3207e79272282a9e4 1	hours.txt
100644 73d88bfd281c5b7b0e3eac1a1ee22e7539880761 2	hours.txt
100644 e7db645d443221c9be85a021aa1310c61a7e2324 3	hours.txt
```

Stage 2 ("ours") is `main`'s `Open 10 to 5`. Stage 3 ("theirs") is your `Open 9 to 8`. So in a rebase, `git restore --theirs hours.txt` takes **your commit's** version, and `git restore --ours hours.txt` takes the base's. It is the reverse of a merge and catches experienced people too.

### Where the old commits go

The commits you rebased away stay in `.git/objects`. Two records still lead to them.

`ORIG_HEAD` is a small file with one ID, the commit your branch pointed at before the rebase:

```console
$ cat .git/ORIG_HEAD
eac1b1efd2257c0e9c09e23662c768f1a3210efa
```

The reflog of the branch keeps every position the branch has had:

```console
$ git reflog try-hours
87531f6 try-hours@{0}: rebase (finish): refs/heads/try-hours onto d796c24a4740617ebc06a428ff268e99bc4e1527
eac1b1e try-hours@{1}: commit: Add opening hours
3ae1e9e try-hours@{2}: branch: Created from HEAD
```

A whole rebase is one line in the branch's reflog, however many commits it replayed. The line below it is where the branch was before, so `git reset --hard eac1b1e` undoes the rebase even after `ORIG_HEAD` has been overwritten. The faded stations on the map are these same commits. Git removes them only after the reflog entries expire, weeks later. The lesson [Recover lost commits with reflog and fsck](lesson:rescue-lost-work) goes deeper.

## Advanced

These are the rebase options and cases you meet once the basic rebase is routine. The hard challenge needs the first one.

### Move a branch off another branch: `--onto`

`git rebase --onto <new-base> <old-base> <branch>` tells Git: take the commits of `<branch>` that are not on `<old-base>`, and replay them on `<new-base>`.

Pro Git's example, in bakery terms. You started `try-shop` for an online shop and made a commit. Then you started `try-news`, a newsletter signup, from `try-shop` and committed twice. Later `try-shop` got one more commit:

```console
$ git log --oneline --graph --all
* 9109520 Add tagline to homepage
| * 18bf83c Add newsletter promise
| * b524efb Add newsletter signup
| | * 7731b79 Add delivery day
| |/
| * 68a215a Add shop page
|/
* cb7cd39 Add contact page
* 355ad78 Add homepage
```

:::graph
caption: "Before: try-news was started from try-shop, so it carries the shop page commit S1"
commits:
  - id: B
    message: Add contact page
  - id: T
    message: Add tagline to homepage
    parents: [B]
  - id: S1
    message: Add shop page
    parents: [B]
  - id: S2
    message: Add delivery day
    parents: [S1]
  - id: N1
    message: Add newsletter signup
    parents: [S1]
  - id: N2
    message: Add newsletter promise
    parents: [N1]
branches:
  main: T
  try-shop: S2
  try-news: N2
:::

The newsletter is ready and the shop is not. A plain `git rebase main` on `try-news` would not help: it replays every commit of `try-news` that `main` lacks, and that includes `Add shop page`. You want only the two newsletter commits:

```console
$ git rebase --onto main try-shop try-news
Successfully rebased and updated refs/heads/try-news.
```

Read the three names from right to left: take `try-news`, leave out what it shares with `try-shop`, and put the rest on `main`.

```console
$ git log --oneline --graph --all
* d77f7fc Add newsletter promise
* 32d2d82 Add newsletter signup
* 9109520 Add tagline to homepage
| * 7731b79 Add delivery day
| * 68a215a Add shop page
|/
* cb7cd39 Add contact page
* 355ad78 Add homepage
```

:::graph
caption: "After git rebase --onto main try-shop try-news: copies of the two newsletter commits sit on main's newest commit. try-shop is untouched."
commits:
  - id: B
    message: Add contact page
  - id: T
    message: Add tagline to homepage
    parents: [B]
  - id: N1'
    message: Add newsletter signup
    parents: [T]
  - id: N2'
    message: Add newsletter promise
    parents: [N1']
  - id: S1
    message: Add shop page
    parents: [B]
  - id: S2
    message: Add delivery day
    parents: [S1]
branches:
  main: T
  try-news: N2'
  try-shop: S2
head: try-news
:::

`try-news` no longer contains the shop page, and `shop.txt` is gone from its files. `try-shop` did not change. Now `main` can be fast-forwarded: `git switch main`, then `git merge try-news`.

To check in advance which commits will be replayed, list them with two dots, which reads "commits on the second branch that are not on the first":

```console
$ git log --oneline try-shop..try-news
18bf83c Add newsletter promise
b524efb Add newsletter signup
```

If you leave out `<branch>`, Git uses the branch you are on. With it, Git switches to that branch first, so the command works from anywhere.

### Rebase a branch without switching to it

The same shortcut works without `--onto`. `git rebase <base> <branch>` switches to `<branch>` and rebases it onto `<base>`:

```console
$ git rebase main try-shop
Successfully rebased and updated refs/heads/try-shop.
```

You end up on `try-shop`. It is the same as `git switch try-shop` followed by `git rebase main`.

### When a teammate rebased a branch you built on

Sometimes the golden rule is broken for you: a teammate rebases a shared branch and force-pushes it, and your commits sit on top of the old versions. Pro Git calls the way out "rebase when you rebase".

Besides the commit ID, Git can work out a second checksum that covers only the change a commit makes, and ignores the parent and the dates. It is called a **patch ID**. A commit and its rebased copy have different commit IDs but the same patch ID. During a rebase, Git uses this to notice that a commit of yours already exists on the new base, and leaves it out.

So in place of a plain `git pull`, which would merge old and new and double the commits, run:

```console
$ git pull --rebase
```

Git fetches the rewritten branch and replays your commits onto it, leaving out the ones whose change is already there. The book warns that this works only when the teammate's copies are almost exactly the same changes as the originals. If they edited the commits while rebasing, Git cannot match them, and you resolve the overlap by hand.

To make every pull rebase, set `pull.rebase`:

```console
$ git config --global pull.rebase true
```

### Merge commits are flattened

By default a rebase leaves merge commits out and replays only the ordinary commits they brought in. A branch with a merge in it comes out as one straight line. `git rebase --rebase-merges <base>` makes the merge commits again and keeps the shape of the branch. You need it rarely; it matters when you rebase a long branch that other branches were merged into.

### Carry uncommitted edits along: `--autostash`

`git rebase --autostash <base>` puts your uncommitted edits aside, runs the rebase, and brings the edits back:

```console
$ git rebase --autostash main
Created autostash: dfea55d
Applied autostash.
Successfully rebased and updated refs/heads/try-late.
```

It saves the `git stash` and `git stash pop` around a rebase. `git config rebase.autoStash true` turns it on for every rebase in the repository, and `git pull --rebase --autostash` does the same for a pull.

### Rewriting your own commits

`git rebase -i` (interactive) opens the list of commits as a text file before replaying them. You can reorder the lines, join commits into one, change a message, or drop a commit. It uses everything in this lesson: new IDs, `--continue`, `--abort`, and the golden rule. The lesson "Reword, squash, reorder, split; fixup and autosquash" teaches it.

## Recap

- `git rebase <base>` replays the commits of the branch you are on onto `<base>`. They are new commits with new IDs; the old ones are left behind, and `<base>` does not move.
- Rebase gives a straight history with no merge commit. The files end up the same as with a merge.
- On a conflict: fix the file, `git add` it, `git rebase --continue`. `--skip` drops that commit; `--abort` goes back to before the rebase.
- The golden rule: do not rebase commits that exist outside your repository and that people may have based work on.
- `git reset --hard ORIG_HEAD` undoes a rebase that just finished. `git rebase --onto <new-base> <old-base> <branch>` moves only the commits that are not on `<old-base>`.
