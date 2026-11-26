---
id: revert-a-commit
title: "Undo a pushed commit with revert"
module: undo-and-fix
bookSection: "7.8 Git Tools - Advanced Merging"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging#_undoing_merges
bookSources:
  - book/progit2/book/07-git-tools/sections/advanced-merging.asc
readFirst: [fix-last-commit]
---

A commit you made yesterday broke the app, and your teammates already have it. You cannot quietly replace it any more. `git revert` undoes a commit by adding a new one on top, so nobody's history breaks, and this lesson shows how to use it on the last commit, on an older one, and when Git stops halfway.

## Must know

In the lesson [Fix the last commit (amend)](lesson:fix-last-commit) you repaired a commit by replacing it. That works while the commit exists only on your computer. This lesson is about the other case: the commit is already shared.

### Why you cannot amend a shared commit

A commit is **pushed** when you have sent it to a shared server, where teammates can download it. The "Remotes" module teaches pushing; everything you practise here stays on your computer, but the rule is the same.

Remember what [amend](term:amend) really does: it makes a new commit with a new [commit ID](term:commit-id) and drops the old one. If a teammate already built work on the old commit, their history and yours no longer match. Git will refuse your next push, and someone has to untangle two versions of the same work.

So for a shared commit the rule is: never replace it. Add to it.

### What `git revert` does

`git revert` tells Git: make a new commit that does the exact opposite of this one.

If the bad commit added a line, the new commit removes that line. If it deleted a file, the new commit brings the file back. The bad commit itself is not touched and stays in the history. Git calls the new commit a [revert](term:revert).

A tiny example. One file, `banner.txt`, and two commits:

| Commit | What it does | `banner.txt` afterwards |
|---|---|---|
| A: Add sale banner | Creates the file with one line | Sale ends Friday |
| B: Revert "Add sale banner" | Deletes that line, and so the file | (no file) |

After B your project looks as if A never happened. The history says something more honest: A happened, and then B undid it. Both are there for anyone to read.

The common wrong idea is "revert goes back in time" or "revert deletes the commit". It does neither. History only grows: one more commit, pointing forward.

### Revert the last commit

The practice project on the right is a small shop app with four commits. Make a commit of your own to undo, so the project's own commits stay as they are for the challenges at the end.

:::predict
question: "Your history has 5 commits. You revert the newest one. How many commits does `git log` show afterwards?"
answer: "6. Revert never removes a commit: it adds one that undoes the change."
:::

:::try-it
1. Create a file and commit it: `echo "Sale ends Friday" > banner.txt`, then `git add banner.txt`, then `git commit -m "Add sale banner"`. In the picture, a new station "Add sale banner" appears on the history map and the `main` label moves onto it.
2. Run `git revert HEAD`. `HEAD` is Git's name for the commit you are on, which is the newest one. Git opens your editor with a message already written: `Revert "Add sale banner"`.
3. Keep the message: save the file and close the editor. (In Vim, type `:wq` and press Enter.) Git makes the commit.
4. Look at the picture. A new station `Revert "Add sale banner"` appears after "Add sale banner", and the `main` label moves onto it. The station "Add sale banner" is still there. The files desk shows nothing new, because Git committed the opposite change in the same step.
5. Run `ls`. The file `banner.txt` is gone from your folder: the revert commit deleted it.
:::

Git prints what the new commit did:

```console
$ git revert HEAD
[main 3b72c26] Revert "Add sale banner"
 Date: Thu Nov 26 20:51:24 2026 +0300
 1 file changed, 1 deletion(-)
 delete mode 100644 banner.txt
```

And the history holds both commits, the mistake and its undo:

```console
$ git log --oneline
3b72c26 Revert "Add sale banner"
fdb23c7 Add sale banner
902de1b Turn on debug mode
4b9eaf3 Add checkout
6adea33 Add opening hours
ee11d74 Add README
```

:::graph
caption: "Before the revert: main is on the commit you want to undo"
commits:
  - id: A
    message: Turn on debug mode
  - id: B
    message: Add sale banner
    parents: [A]
branches:
  main: B
head: main
:::

:::graph
caption: "After git revert HEAD: a new commit undoes B. B itself stays"
commits:
  - id: A
    message: Turn on debug mode
  - id: B
    message: Add sale banner
    parents: [A]
  - id: C
    message: Revert "Add sale banner"
    parents: [B]
branches:
  main: C
head: main
:::

### The message, and `--no-edit`

Git writes the revert message for you. `git show` prints the full message and the change of a commit:

```console
$ git show HEAD
commit 3b72c26fdf35edd681ad1f5506483db71ba8f7e7
Author: Practice Student <student@example.com>
Date:   Thu Nov 26 20:51:24 2026 +0300

    Revert "Add sale banner"

    This reverts commit fdb23c7612ff76385a0a7b2bccfe3661857ffb53.

diff --git a/banner.txt b/banner.txt
deleted file mode 100644
index fa6cb48..0000000
--- a/banner.txt
+++ /dev/null
@@ -1 +0,0 @@
-Sale ends Friday
```

The first line names the commit that was undone. The line below it gives that commit's full ID, so anyone can look it up. The lines at the bottom are the change itself: `-Sale ends Friday` is the line the revert removed.

The editor opens so you can add **why** you reverted, under the lines Git wrote. On a team this is worth a sentence: "Broke checkout on mobile, see bug 214."

When the default message is enough, skip the editor:

```console
$ git revert --no-edit HEAD
```

`--no-edit` tells Git to use the message as it is and commit at once.

### Revert an older commit

The bad commit is rarely the newest one. Usually you find it a few days later, with good commits on top. Revert handles this the same way: it undoes only the commit you name and leaves the later ones alone.

To name an older commit, use its ID from `git log --oneline`. The first 7 characters are enough.

:::try-it
1. Make three small commits. First: `echo "Free delivery over 50" > delivery.txt`, `git add delivery.txt`, `git commit -m "Add delivery note"`.
2. Second: `echo "Gift cards available" > gifts.txt`, `git add gifts.txt`, `git commit -m "Add gift cards"`.
3. Third: `echo "Open on Sundays" > sundays.txt`, `git add sundays.txt`, `git commit -m "Add Sunday opening"`. The history map now ends with three new stations.
4. Run `git log --oneline` and copy the ID in front of "Add gift cards", the middle one. Yours will differ from the one below.
5. Run `git revert --no-edit <that ID>`, for example `git revert --no-edit 1b83e0c`. In the picture, one new station `Revert "Add gift cards"` appears at the end, and the `main` label moves onto it. The three stations before it do not move.
6. Run `ls`. The file `gifts.txt` is gone. The files `delivery.txt` and `sundays.txt` are still there: only the middle commit was undone.
:::

```console
$ git log --oneline -4
710580f Revert "Add gift cards"
97452e2 Add Sunday opening
1b83e0c Add gift cards
8cae239 Add delivery note
```

The same thing as a table. Each row is the folder after that commit:

| After commit | `delivery.txt` | `gifts.txt` | `sundays.txt` |
|---|---|---|---|
| Add delivery note | yes | | |
| Add gift cards | yes | yes | |
| Add Sunday opening | yes | yes | yes |
| Revert "Add gift cards" | yes | **gone** | yes |

:::graph
caption: "Reverting the middle commit B adds D at the end. A, B and C stay where they are"
commits:
  - id: A
    message: Add delivery note
  - id: B
    message: Add gift cards
    parents: [A]
  - id: C
    message: Add Sunday opening
    parents: [B]
  - id: D
    message: Revert "Add gift cards"
    parents: [C]
branches:
  main: D
head: main
:::

:::careful
Revert undoes one commit's change, not "everything since that commit". The later commits keep their work. If you want to go back to how the project was at an older commit, you would have to revert each commit after it too.
:::

### Revert several commits

Sometimes two or three commits belong to the same mistake. Name them all, newest first:

```console
$ git revert --no-edit 97452e2 8cae239
```

Git makes one revert commit for each, in the order you list them. Newest first is the safe order, because later commits often build on earlier ones.

If you would like **one** commit that undoes them all, add `-n` (short for `--no-commit`). Git then stages the opposite changes and stops, without committing:

```console
$ git revert -n 97452e2 8cae239
$ git status
On branch main
You are currently reverting commit 8cae239.
  (all conflicts fixed: run "git revert --continue")
  (use "git revert --skip" to skip this patch)
  (use "git revert --abort" to cancel the revert operation)

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	deleted:    delivery.txt
	deleted:    sundays.txt

$ git commit -m "Remove the Sunday and delivery notes"
[main 8bb9a5e] Remove the Sunday and delivery notes
 2 files changed, 2 deletions(-)
 delete mode 100644 delivery.txt
 delete mode 100644 sundays.txt
```

With `-n` you write the message yourself, so say which commits it undoes.

### Changed your mind? Revert the revert

A revert is an ordinary commit, so you can revert it too. That brings the original change back.

```console
$ git revert --no-edit HEAD
[main 2d3d84b] Reapply "Add gift cards"
 Date: Thu Nov 26 20:51:24 2026 +0300
 1 file changed, 1 insertion(+)
 create mode 100644 gifts.txt
```

Git names this commit `Reapply "Add gift cards"`. Older versions of Git wrote `Revert "Revert "Add gift cards""`, and you will see that form in older projects. Both mean the same: the change is back.

This is also the fix when you revert the wrong commit by accident.

### Which undo tool, when

You now know three ways to undo. They fit different moments:

| Situation | Tool | Why |
|---|---|---|
| The change is not committed yet | `git restore` | Nothing is in history, so there is nothing to keep |
| The last commit is wrong and you have **not** shared it | `git commit --amend` | Replacing it is clean, and nobody else has the old one |
| The commit is shared, or it is not the last one | `git revert` | History stays the same for everyone, and later commits are kept |

When you are unsure whether a commit is shared, use revert. It is never wrong, only a little noisier.

A fourth tool, `git reset`, moves your branch back and drops commits from it. It is for commits only you have, and the next lesson, [Reset demystified: the three trees](lesson:reset-demystified), teaches it.

### When it goes wrong

**A conflict.** Revert applies the opposite of an old change to today's files. If a later commit changed the same lines, Git cannot know which version you want, and it stops. This is called a [merge conflict](term:merge-conflict).

Say `banner.txt` went through three commits: "Sale: 10% off", then "Sale: 50% off", then "Sale: 50% off all books". Reverting the middle one gives:

```console
$ git revert --no-edit 358b2a0
Auto-merging banner.txt
CONFLICT (content): Merge conflict in banner.txt
error: could not revert 358b2a0... Raise the sale to 50%
hint: After resolving the conflicts, mark them with
hint: "git add/rm <pathspec>", then run
hint: "git revert --continue".
```

Nothing is broken. The revert is paused, and Git wrote both versions into the file with markers:

```text
<<<<<<< HEAD
Sale: 50% off all books
=======
Sale: 10% off
>>>>>>> parent of 358b2a0 (Raise the sale to 50%)
```

- Between `<<<<<<< HEAD` and `=======`: the line as it is now.
- Between `=======` and `>>>>>>>`: the line as it was before the commit you are reverting.
- Your job: edit the file so it holds the line you want, and delete the three marker lines.

Here the right result is probably `Sale: 10% off all books`: the old price, with the newer wording kept. In the picture, a banner says a revert is in progress and the `banner.txt` sheet is marked `conflict`.

You have two ways out:

1. **Finish it.** Fix the file, run `git add banner.txt` to tell Git the conflict is solved, then `git revert --continue`. Git makes the revert commit; if your editor opens for the message first, save and close it.
2. **Give up.** Run `git revert --abort`. Everything goes back to how it was before you ran `git revert`.

The lesson [Branch, merge, and fix conflicts](lesson:branch-and-merge) covers conflicts in full.

**Uncommitted changes in the way.**

```console
$ git revert --no-edit HEAD
error: Your local changes to the following files would be overwritten by merge:
	banner.txt
Please commit your changes or stash them before you merge.
Aborting
fatal: revert failed
```

You have edits in a file the revert needs to change, and Git will not overwrite them. Commit them first, or discard them with `git restore banner.txt`, then run the revert again. ("Stash" is a way to put changes aside; it has its own lesson, [Stash unfinished work, clean the folder](lesson:stash-and-clean).)

**A wrong ID.**

```console
$ git revert abc1234
fatal: bad revision 'abc1234'
```

No commit has that ID. Copy it again from `git log --oneline`.

## Under the hood

"Must know" showed what revert does to your history. This layer shows how Git works out the opposite change, and what revert can never do.

### How Git builds the opposite change

Every commit except the first has a **parent**: the commit that came right before it. The change a commit made is the difference between its parent's [snapshot](term:snapshot) and its own.

To revert commit B, Git compares three snapshots:

- B, the commit you are reverting,
- B's parent, the project just before B,
- and your current commit.

It then asks: what would my current files look like if the step from B's parent to B had never been taken? Wherever today's file still matches B, Git puts back the parent's version. Wherever a later commit changed the same lines, Git cannot decide, and you get the conflict from "When it goes wrong". That is why the conflict marker said `parent of 358b2a0`: the second version in the file came from the parent of the reverted commit.

The result is committed like any other commit. A revert commit has one parent, the commit you were on, and nothing in it is special except its message.

### Nothing is deleted

After a revert, the bad commit is still in the history, with its full content. Anyone can run `git show` on it.

This matters for secrets. If you committed a password and reverted the commit, the password is still in the repository, and still on the server if you pushed. Revert fixes the current files and leaves the past readable. Change the password first; the lesson [Remove a leaked secret or huge file from history](lesson:remove-sensitive-data) shows how to remove it from history.

### What the pause looks like inside

While a revert waits for you (a conflict, or `-n` with more commits to go), Git keeps a file named `REVERT_HEAD` in the `.git` folder. It holds the ID of the commit being reverted. `git status` reads it to print "You are currently reverting commit …", and `git revert --continue` or `--abort` removes it.

## Advanced

### Revert a range

Two dots between two commits name every commit after the first, up to and including the second. `HEAD~2` means "two commits before HEAD". So this reverts the last two commits, newest first, each as its own commit:

```console
$ git revert --no-edit HEAD~2..HEAD
```

Add `-n` to collect the range into one commit that you finish with `git commit`.

### `-e` and `--skip`

`-e` (`--edit`) opens the editor for the message. It is the default when you type the command yourself, so you only need it in scripts.

`git revert --skip` is for a revert of several commits that stopped on a conflict: it drops the commit that conflicted and moves on to the next one. Use it only when you are sure that commit needs no undoing.

### Reverting a merge commit

A merge commit joins two lines of work and has two parents. Git cannot guess which side you call the main line, so a plain revert fails:

```console
$ git revert --no-edit HEAD
error: commit 1a2629a05d73352c3d6c9937b2f42d3a84c20b2a is a merge but no -m option was given.
fatal: revert failed
```

`-m 1` says: parent number 1 is the main line, keep it, and undo what the other side brought in. Parent 1 is the branch you were on when you merged, which is almost always what you want.

```console
$ git revert --no-edit -m 1 HEAD
[main 70fd310] Revert "Merge branch 'feature'"
 Date: Thu Nov 26 20:50:49 2026 +0300
 1 file changed, 1 deletion(-)
 delete mode 100644 f.txt
```

:::careful
Reverting a merge undoes its changes, but Git still counts the branch as merged. If you merge that branch again later, Git brings in only the commits made after the first merge, and the reverted work stays out. Pro Git's fix: revert the revert first, then merge the branch again.
:::

:::sidenote
Pro Git describes the other way to undo a merge that only you have: move the branch back with `git reset --hard HEAD~`. It warns that this rewrites history, so it is not for a merge other people already have.
:::

## Recap

- `git revert <commit>` adds a new commit that does the opposite of the one you name. Nothing is removed from history.
- Use it for any commit that is already shared, and for a bad commit that has good commits on top.
- `git revert HEAD` undoes the last commit; an ID from `git log --oneline` undoes an older one and keeps the later ones.
- `--no-edit` keeps Git's message; `-n` stages the undo so several reverts become one commit.
- On a conflict: fix the file, `git add`, `git revert --continue`, or back out with `git revert --abort`.
