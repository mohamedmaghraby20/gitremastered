---
id: branch-and-merge
title: "Branch, merge, and fix conflicts"
module: branching
bookSection: "3.2 Basic Branching and Merging"
bookUrl: https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging
bookSources:
  - book/progit2/book/03-git-branching/sections/basic-branching-and-merging.asc
readFirst: [switch-and-detached-head]
---

You are halfway through a new feature when someone reports a bug that cannot wait. With branches you fix the bug on its own line of work, bring the fix into `main`, and later bring the feature in too. This lesson teaches `git merge`, the command that joins two lines of work, and what to do when Git stops and asks you to settle a conflict.

## Must know

In the last two lessons, [Branches are just pointers](lesson:branches-are-pointers) and [Switching branches and detached HEAD](lesson:switch-and-detached-head), you made [branches](term:branch), switched between them, and watched two branches grow apart. Work that stays on a side branch forever helps nobody. At some point it has to come back into `main`. That step is a [merge](term:merge).

### Merge brings another branch into yours

`git merge <branch>` tells Git: take the work of that branch and bring it into the branch I am on.

The direction matters, and it is the first thing people get wrong. The branch you are on receives the work. The branch you name stays exactly as it was.

```console
$ git switch main
$ git merge hotfix
```

These two lines bring `hotfix` into `main`. So the habit is always the same: switch to the receiver first, then name the branch you want to bring in.

A merge ends in one of three ways, depending on what happened on the two branches since they split:

| What happened since the split | What Git does | You see |
|---|---|---|
| Only the other branch has new commits | Moves your branch label forward | `Fast-forward` |
| Both branches have new commits, in different places | Combines them in a new commit | `Merge made by the 'ort' strategy.` |
| Both branches changed the same lines | Stops and asks you | `CONFLICT` |

The rest of Must know takes these one at a time.

### The practice project

The terminal on the right opens in a small website for a bakery. Run `git log --oneline --graph --all` there:

```console
$ git log --oneline --graph --all
* 400ff94 Fix broken email address
* f00cea5 Add contact page
* 9b7d5cc Add homepage
```

`main` has two commits. A branch named `hotfix` has one more: a fix for a typo in the email address. You are on `main`. (Your commit IDs will differ from the ones printed in this lesson.)

:::graph
caption: "The practice project: hotfix is one commit ahead of main"
commits:
  - id: A
    message: Add homepage
  - id: B
    message: Add contact page
    parents: [A]
  - id: C
    message: Fix broken email address
    parents: [B]
branches:
  main: B
  hotfix: C
head: main
:::

Merging `hotfix` is the first challenge at the end of this lesson, so leave that branch alone for now. The Try-its below make branches of their own, each starting with `try-`.

### When your branch has not moved: a fast-forward

Start with the simplest case. You made a branch, committed on it, and meanwhile nothing new happened on `main`.

Look at the diagram above. `main` points at B. `hotfix` points at C, and C was built directly on B. To bring that work into `main`, Git has nothing to combine: it only has to move the `main` label forward from B to C. Git calls this a [fast-forward](term:fast-forward).

:::graph
caption: "After a fast-forward, main points at the same commit as the branch. No new commit was made."
commits:
  - id: A
    message: Add homepage
  - id: B
    message: Add contact page
    parents: [A]
  - id: C
    message: Fix broken email address
    parents: [B]
branches:
  main: C
  hotfix: C
head: main
:::

Two things stay the same, and both matter. No commit is created. And no commit is changed: A, B and C are exactly what they were.

Try it on a branch of your own:

:::try-it
1. Run `git switch -c try-hours`. Git makes a branch named `try-hours` and switches to it. In the picture, a `branch try-hours` tag appears on the same station as `branch main`, and the `HEAD · you` pin now belongs to it.
2. Create a file and commit it: `echo "Open 9 to 5" > hours.txt`, then `git add hours.txt`, then `git commit -m "Add opening hours"`. In the picture, a new station appears and the `branch try-hours` tag moves onto it. The `branch main` tag stays behind.
3. Run `git switch main`, then `ls`. The file `hours.txt` is gone from your folder: it exists only on `try-hours` so far.
4. Run `git merge try-hours`. Git prints `Fast-forward`. In the picture, the `branch main` tag and the `HEAD · you` pin move onto the `Add opening hours` station. No new station appears.
5. Run `ls` again. The file `hours.txt` is back, because `main` now points at the commit that holds it.
:::

This is what step 4 prints:

```console
$ git merge try-hours
Updating f00cea5..4dd0424
Fast-forward
 hours.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 hours.txt
```

- `Updating f00cea5..4dd0424`: `main` moved from the first commit ID to the second.
- `Fast-forward`: the label moved; nothing was combined.
- The last lines list the files that changed for you, the same summary you know from `git commit`.

### Delete a branch you have merged

Once a branch is merged, its label has done its job. The commits stay in `main`; only the extra name goes away.

```console
$ git branch -d try-hours
Deleted branch try-hours (was 4dd0424).
```

`git branch -d` deletes a branch only when its work is already merged, so it cannot lose commits. Run it now for `try-hours`. In the picture, the `branch try-hours` tag disappears and its station stays. The next lesson, [List, delete and rename branches](lesson:branch-management), covers the other ways to delete and tidy branches.

### When both branches moved: a merge commit

A fast-forward only works while `main` stands still. On a real team it rarely does: while you work on your branch, other commits land on `main`.

Now the two branches have each gone their own way from a shared starting point. Moving a label is not enough, because neither branch contains the other's work. Git has to combine the two, and it records the result in a new commit. That commit is special in one way: it has two parents, one on each branch. It is called a [merge commit](term:merge-commit).

:::graph
caption: "Before: main and try-menu each have one commit the other lacks"
commits:
  - id: C
    message: Add opening hours
  - id: D
    message: Add tagline to homepage
    parents: [C]
  - id: E
    message: Add menu
    parents: [C]
branches:
  main: D
  try-menu: E
head: main
:::

:::graph
caption: "After git merge try-menu: a merge commit M with two parents; try-menu did not move"
commits:
  - id: C
    message: Add opening hours
  - id: D
    message: Add tagline to homepage
    parents: [C]
  - id: E
    message: Add menu
    parents: [C]
  - id: M
    message: Merge branch 'try-menu'
    parents: [D, E]
branches:
  main: M
  try-menu: E
head: main
:::

The common wrong idea is that a merge copies the other branch's commits onto yours, or changes them. It does neither. D and E stay as they are. The merge adds one commit, M, and `main` moves to it. `try-menu` still points at E.

:::predict
question: "main has a commit that changes index.html. try-menu has a commit that adds menu.txt. After git merge try-menu on main, which files does main have, and how many new commits were made?"
answer: "Both: the changed index.html and the new menu.txt. One new commit was made, the merge commit. The two branches touched different files, so Git could combine them without asking you anything."
:::

:::try-it
1. Run `git switch -c try-menu`. You are on a new branch that starts where `main` is.
2. Run `echo "Bread, cake, coffee" > menu.txt`, then `git add menu.txt`, then `git commit -m "Add menu"`. In the picture, a new station appears with the `branch try-menu` tag on it.
3. Run `git switch main`. Now give `main` a commit of its own: `echo "<p>Fresh every morning</p>" >> index.html`, then `git commit -am "Add tagline to homepage"`. In the picture, the two branches now run on two rows: `main` on the top row, `try-menu` on a row below. If the map is small, press "Expand" on the History panel to see both rows.
4. Run `git merge try-menu --no-edit`. Git prints `Merge made by the 'ort' strategy.` In the picture, a new station appears on the top row with the message `Merge branch 'try-menu'`, and tracks from both rows run into it. The `branch main` tag sits on it.
5. Run `git log --oneline --graph`. The drawing on the left shows the same thing as the picture: two lines that split and join again.
6. Run `git branch -d try-menu` to remove the merged branch's label.
:::

```console
$ git merge try-menu --no-edit
Merge made by the 'ort' strategy.
 menu.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 menu.txt
```

`ort` is the name of the method Git uses to combine two branches. You can ignore the word; the line means "I made a merge commit".

```console
$ git log --oneline --graph
*   ac443f8 Merge branch 'try-menu'
|\
| * bce9172 Add menu
* | 44e24aa Add tagline to homepage
|/
* 4dd0424 Add opening hours
* f00cea5 Add contact page
* 9b7d5cc Add homepage
```

**The merge message.** A merge commit needs a message like any commit. Git writes one for you, `Merge branch 'try-menu'`, and opens your editor so you can change it. `--no-edit` says "keep that message and do not open the editor". Without it, save and close the editor to finish the merge. The lesson [Status, stage, commit](lesson:three-areas) shows how to get out of Vim.

:::compare
today: "`git switch -c hotfix` makes a branch and switches to it, and Git prints `Merge made by the 'ort' strategy.`"
book: "Pro Git writes `git checkout -b hotfix` and shows `Merge made by the 'recursive' strategy.` Both still mean the same; `ort` replaced `recursive` as the default method in Git 2.34."
:::

### When both changed the same lines: a conflict

Git combined the last merge by itself because the two branches touched different files. It can also combine changes to different parts of one file. It cannot decide for you when both branches changed the same lines in different ways. That is a [merge conflict](term:merge-conflict).

A small example. The file `hours.txt` has one line, `Open 9 to 5`.

| Branch | What its commit did to `hours.txt` |
|---|---|
| `try-late` | Changed the line to `Open 9 to 8` |
| `main` | Changed the line to `Open 10 to 5` |

Which line is right? Git has no way to know. So it stops in the middle of the merge and hands the question to you:

```console
$ git merge try-late
Auto-merging hours.txt
CONFLICT (content): Merge conflict in hours.txt
Automatic merge failed; fix conflicts and then commit the result.
```

Nothing is broken and nothing is lost. No merge commit exists yet. Git is paused, waiting for you. `git status` says so, and names the way forward and the way back:

```console
$ git status
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   hours.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

**Unmerged paths** lists every file Git could not combine. **both modified** means both branches changed it.

### Read the conflict markers

Git wrote both versions into the file, with marker lines around them:

```text
<<<<<<< HEAD
Open 10 to 5
=======
Open 9 to 8
>>>>>>> try-late
```

Read it in three parts:

- From `<<<<<<< HEAD` down to `=======`: the lines as they are on the branch you are on. [HEAD](term:head) is Git's name for where you are, here `main`.
- From `=======` down to `>>>>>>> try-late`: the lines as they are on the branch you are merging in.
- The three marker lines themselves are not part of either version. Git added them so you can find the spot.

Everything outside the markers was combined without trouble. A long file can have several such blocks; search for `<<<<<<<` to find them all.

### Resolve the conflict and finish the merge

To resolve a conflict you edit the file until it reads the way the final version should, with the marker lines gone. You can keep the top part, keep the bottom part, or write something new that uses both. Here the owner wants both changes, opening at 10 and closing at 8:

```text
Open 10 to 8
```

Then you tell Git the file is settled and finish the merge:

1. Edit each conflicted file and remove the three marker lines.
2. `git add <file>` for each one. During a merge, staging a file means "this conflict is resolved".
3. `git commit` to make the merge commit. Git has the message ready.

After step 2, `git status` confirms where you are:

```console
$ git status
On branch main
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

Changes to be committed:
	modified:   hours.txt
```

**The way back.** If you would rather not deal with it now, `git merge --abort` stops the merge and puts your files back as they were before `git merge`. You can start again later.

:::try-it
1. Run `git switch -c try-late`, then `echo "Open 9 to 8" > hours.txt`, then `git commit -am "Stay open until 8"`. The branch `try-late` changed the one line of `hours.txt`.
2. Run `git switch main`, then `echo "Open 10 to 5" > hours.txt`, then `git commit -am "Open at 10"`. Now `main` changed the same line in a different way.
3. Run `git merge try-late`. Git prints `CONFLICT (content): Merge conflict in hours.txt`. In the picture, a banner above the desk reads "Merge stopped: 1 file has a conflict", and the `hours.txt` sheet in the working tree is marked `conflict`. No new station appears on the map.
4. Run `cat hours.txt`. You see both lines between the three marker lines.
5. Run `git merge --abort`, then `cat hours.txt`. The file reads `Open 10 to 5` again, and the banner is gone: the merge never happened.
6. Run `git merge try-late` again. The same conflict comes back.
7. Write the final version: `echo "Open 10 to 8" > hours.txt`. This replaces the whole file, markers included. In a real project you would do this in your editor.
8. Run `git add hours.txt`. In the picture, the `hours.txt` sheet slides into the staging area and loses its `conflict` mark. The banner now says the merge is in progress and can be finished with `git commit`.
9. Run `git commit --no-edit`. In the picture, the banner disappears, and a station with the message `Merge branch 'try-late'` joins the two rows on the map.
10. Run `git branch -d try-late`.
:::

:::careful
`git add` does not check what is in the file. If you stage a file that still has `<<<<<<<` lines in it, Git commits them, and your program breaks on the next run. Before you stage, search the file for `<<<<<<<`.
:::

### When it goes wrong

```console
$ git merge hotfix
Already up to date.
```

Your branch already contains everything on the branch you named, so there is nothing to merge. Often it means you are on the wrong branch: you wanted to bring `hotfix` into `main` but you are standing on `hotfix`, or the merge was done earlier. Check with `git status` which branch you are on.

```console
$ git merge late
error: Your local changes to the following files would be overwritten by merge:
	hours.txt
Please commit your changes or stash them before you merge.
Aborting
```

You have edits you have not committed, in a file the merge needs to change. Git refuses, so your edits are safe. Commit them first, or throw them away with `git restore hours.txt` (the lesson [Unstage and discard changes](lesson:undo-basics)), then merge again. The lesson [Stash unfinished work, clean the folder](lesson:stash-and-clean) shows a third way.

```console
$ git merge late
fatal: You have not concluded your merge (MERGE_HEAD exists).
Please, commit your changes before you merge.
```

An earlier merge is still open: you resolved its conflicts but never ran `git commit`. Finish it with `git commit`, or give it up with `git merge --abort`. The same unfinished merge is behind `fatal: cannot switch branch while merging`.

**You merged in the wrong direction.** You ran `git merge main` while on your feature branch, and wanted the opposite. If you have not shared the result with anyone, you can take the merge back: `git reset --hard ORIG_HEAD` moves your branch to where it was just before the merge. This throws away uncommitted edits too, so run `git status` first. The lesson [Reset demystified: the three trees](lesson:reset-demystified) explains what that command does.

## Under the hood

Must know showed the three outcomes of a merge. This layer shows how Git decides between them and what it stores, so you can tell in advance which outcome you will get.

### The merge base

For every merge, Git first finds the last commit the two branches have in common. It is called the [merge base](term:merge-base), or the common ancestor.

```console
$ git merge-base main try-late
ac443f8386c4eda708174038f41972320259d780
```

:::graph
caption: "Git compares three commits: the merge base (B), your branch (D) and the other branch (E)"
commits:
  - id: A
    message: Add homepage
  - id: B
    message: Merge base
    parents: [A]
  - id: D
    message: Open at 10
    parents: [B]
  - id: E
    message: Stay open until 8
    parents: [B]
branches:
  main: D
  try-late: E
head: main
:::

Where the base sits tells Git what kind of merge this is:

- The base is your own commit: the other branch is simply ahead. Fast-forward.
- The base is the other branch's commit: you already have everything. `Already up to date.`
- The base is an older commit: both sides moved. Git has to combine them.

### Why it is called a three-way merge

To combine, Git looks at each part of each file in three versions: the base, yours and theirs. The rule is simple.

| In the base | On your branch | On the other branch | Result |
|---|---|---|---|
| Open 9 to 5 | Open 9 to 5 | Open 9 to 8 | Open 9 to 8 (only they changed it) |
| Open 9 to 5 | Open 10 to 5 | Open 9 to 5 | Open 10 to 5 (only you changed it) |
| Open 9 to 5 | Open 10 to 5 | Open 10 to 5 | Open 10 to 5 (both made the same change) |
| Open 9 to 5 | Open 10 to 5 | Open 9 to 8 | Conflict (both changed it, differently) |

Without the base, Git could only see that the two branches differ. With it, Git can see who changed what, and a conflict is left only when both did.

Git compares the three [snapshots](term:snapshot) at the tips, and ignores the commits in between. Ten commits on a branch merge exactly like one commit with the same end result.

### A merge commit is a normal commit with two parents

```console
$ git cat-file -p HEAD
tree 86895a7b1a64dbf165a9819cdf8a031cd37af852
parent 44e24aae302deba467744c07cf3b619acd89f922
parent bce9172835bee80bfaf78b0706e74889e4de179e
author Practice Student <student@example.com> 1795716180 +0300
committer Practice Student <student@example.com> 1795716180 +0300

Merge branch 'try-menu'
```

It has a snapshot (`tree`), an author and a message like every commit. The only difference is the second `parent` line. The first parent is the commit you were on when you merged; the second is the tip of the branch you brought in. That order is why `git log --graph` draws your branch as the straight line on the left.

### What Git keeps while a merge is paused

While a conflict waits for you, two things record the state.

`.git/MERGE_HEAD` is a small file with the ID of the commit being merged in:

```console
$ cat .git/MERGE_HEAD
bf4d565ca6132c88cb19c6128b1ec80e0b40da85
```

As long as this file exists, Git knows a merge is open. Your next `git commit` reads it to give the new commit its second parent, then deletes it. `git merge --abort` deletes it too.

The [staging area](term:staging-area) holds all three versions of each conflicted file at once. The lesson on the three areas mentioned a "stage number" that is normally 0. During a conflict it is 1, 2 and 3:

```console
$ git ls-files -u
100644 1bdb726c0c214a062ab522e3207e79272282a9e4 1	hours.txt
100644 73d88bfd281c5b7b0e3eac1a1ee22e7539880761 2	hours.txt
100644 e7db645d443221c9be85a021aa1310c61a7e2324 3	hours.txt
```

Stage 1 is the base version, stage 2 is yours ("ours"), stage 3 is theirs. `git add hours.txt` replaces the three entries with one entry at stage 0, which is how Git knows the conflict is resolved.

## Advanced

### Always make a merge commit: `--no-ff`

`git merge --no-ff <branch>` makes a merge commit even when a fast-forward was possible.

```console
$ git merge --no-ff small --no-edit
Merge made by the 'ort' strategy.
 small.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 small.txt
```

Many teams merge every feature this way. After a fast-forward, history is one straight line and nothing shows that three commits belonged to one feature. With `--no-ff`, the merge commit marks where the feature came in, and reverting that one commit takes the whole feature out.

### Only if it is a fast-forward: `--ff-only`

`git merge --ff-only <branch>` moves your label when it can and refuses otherwise, without touching anything. Use it when you expect to be simply behind and want to hear about it if you are not.

### One commit for the whole branch: `--squash`

`git merge --squash <branch>` puts the combined changes of the branch into your staging area and stops. You commit them yourself, as one ordinary commit with one parent.

```console
$ git merge --squash sq
Updating 8138483..f9347c9
Fast-forward
Squash commit -- not updating HEAD
 sq.txt | 2 ++
 1 file changed, 2 insertions(+)
 create mode 100644 sq.txt
```

History gets shorter, but Git no longer knows the branch was merged: `git branch -d` refuses it with `not fully merged`, and merging the same branch again later can conflict with your own squashed commit. The lesson "Merge, squash or rebase-merge a PR" weighs the choices.

### See the base inside the markers

By default the markers show two versions. This setting adds the third, the base, in the middle:

```console
$ git config merge.conflictStyle zdiff3
```

```text
<<<<<<< HEAD
Open 11 to 5
||||||| 51f2a43
Open 10 to 8
=======
Open 8 to 8
>>>>>>> c2
```

The part between `|||||||` and `=======` is how the lines read before either branch changed them. Seeing it tells you what each side was trying to do: here one side moved the opening time and the other moved it a different way. Many developers set this once with `--global` and keep it.

### Take one whole side of a file

When one branch's version of a file is simply the right one, you do not need to edit it by hand:

```console
$ git restore --theirs hours.txt
$ git restore --ours hours.txt
```

`--theirs` writes the version from the branch you are merging in; `--ours` writes the version from the branch you are on. Either one replaces the whole file, so changes from the other side that did not conflict are dropped from that file too. Run `git add` on the file afterwards, as with any resolved conflict. Older guides write `git checkout --theirs hours.txt`, which does the same.

### Tools for conflicts

- `git mergetool` opens a visual tool that shows the versions side by side and stages the file when you are done. It needs a tool to be set up (`merge.tool`); most editors, VS Code among them, also show conflict blocks with buttons to accept either side.
- `git diff` during a conflict shows only the conflicted parts.
- `git log --merge --oneline` lists the commits from both branches that touched the conflicted files, which helps when you do not know why the other side changed a line.
- `git diff --check` reports `leftover conflict marker` for any marker line still in your files.

Harder cases, like conflicts in files that were renamed or the same conflict returning again and again, are in the lesson "Hard conflicts, merge strategies, subtree merges, rerere". Another way to bring two branches together, without a merge commit, is in [Rebasing, and when not to](lesson:rebasing).

## Recap

- `git merge <branch>` brings that branch into the branch you are on. Switch to the receiver first.
- Fast-forward: only the other branch moved, so your label moves forward and no commit is made.
- Merge commit: both branches moved, so Git combines them in a new commit with two parents.
- Conflict: both changed the same lines. Edit the file, remove the markers, `git add` it, then `git commit`. `git merge --abort` goes back to before the merge.
- `git branch -d <branch>` removes the label of a branch that is merged.
