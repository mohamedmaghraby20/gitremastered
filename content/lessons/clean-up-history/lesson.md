---
id: clean-up-history
title: "Reword, squash, reorder, split; fixup and autosquash"
module: history-mastery
bookSection: "7.6 Rewriting History"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History
bookSources:
  - book/progit2/book/07-git-tools/sections/rewriting-history.asc
readFirst: [rebasing, revision-selection]
---

Your feature works, but its history reads "WIP", "more WIP", "fix typo". Before anyone else sees those commits, you can turn them into a few clean ones: fix a message, join commits, change their order, or cut one in two. This lesson teaches the tool for that, `git rebase -i`.

## Must know

In [Fix the last commit (amend)](lesson:fix-last-commit) you replaced your newest commit with a better one. `--amend` reaches only that one commit. This lesson reaches further back: any commit on your branch that you have not shared yet.

### One tool for every clean-up

The Rebasing lesson showed that `git rebase` replays commits: Git takes them one at a time and makes a new copy of each on top of another commit.

An [interactive rebase](term:interactive-rebase) adds one step in front. `git rebase -i` first shows you the list of commits it is about to replay and lets you edit that list. You can tell Git to stop at a commit, join two, swap their order or leave one out. Then Git replays the list the way you wrote it.

Pro Git says it plainly: Git has no "modify history" tool. You replay the commits onto the same place they started from, and change them on the way.

Like `--amend`, this makes new commits and leaves the old ones behind. So one rule comes first, and the end of Must know explains it:

:::careful
Only clean up commits that only you have. Once a commit is on a shared server, leave it as it is.
:::

### The practice project

The terminal opens in a small bakery website. Run `git log --oneline` there:

```console
$ git log --oneline
12f5263 WIP more hours
1804532 WIP opening hours
10fbd77 Add homepage
```

"WIP" is short for "work in progress": a commit made only to park unfinished work. Joining those two commits is the first challenge at the end of this lesson, so leave `main` alone for now. (Your commit IDs will differ from the ones printed here.)

The Try-its use a branch of their own, with four small commits you make yourself.

:::try-it
1. Run `git switch -c try-recipes`. Git makes a new branch and puts you on it. In the picture, a `branch try-recipes` tag appears on the newest station, and the `HEAD · you` pin sits with it.
2. Run `echo "Flour, water, salt" > bread.txt && git add bread.txt && git commit -m "Add bread recipe"`. The `&&` runs the three commands one after another. A new station appears on the history map.
3. Run `echo "Eggs, sugar, butter" > cake.txt && git add cake.txt && git commit -m "Add caek recipe"`. Type the message with the typo "caek", on purpose. A second station appears.
4. Run `echo "Bake for 40 minutes" >> bread.txt && git add bread.txt && git commit -m "Add baking time"`. This adds a second line to the bread recipe. A third station appears.
5. Run `echo "Preheat the oven" > tips.txt && git add tips.txt && git commit -m "Add oven tips"`. A fourth station appears.
6. Run `git log --oneline`. Git lists seven commits: your four on top, newest first, then the three that were already there.
:::

```console
$ git log --oneline
e97f3fc Add oven tips
11c3498 Add baking time
72cb96f Add caek recipe
ed78c30 Add bread recipe
12f5263 WIP more hours
1804532 WIP opening hours
10fbd77 Add homepage
```

:::graph
caption: "Before: four commits on try-recipes. One has a typo, and the bread recipe is spread over two commits"
commits:
  - id: A
    message: WIP more hours
  - id: B
    message: Add bread recipe
    parents: [A]
  - id: C
    message: Add caek recipe
    parents: [B]
  - id: D
    message: Add baking time
    parents: [C]
  - id: E
    message: Add oven tips
    parents: [D]
branches:
  main: A
  try-recipes: E
head: try-recipes
:::

Two things are wrong with these four commits. One message has a typo. And the bread recipe is split over two commits with the cake recipe between them. The next parts fix both.

### The todo list

`git rebase -i HEAD~4` tells Git: let me edit my last four commits. `HEAD~4` names the commit four steps before the one you are on, and Git replays everything after it. The Revision selection lesson covers this way of naming commits in full.

Git opens your editor with a file like this:

```console
pick ed78c30 # Add bread recipe
pick 72cb96f # Add caek recipe
pick 11c3498 # Add baking time
pick e97f3fc # Add oven tips

# Rebase 12f5263..e97f3fc onto 12f5263 (4 commands)
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup [-C | -c] <commit> = like "squash" but keep only the previous
#                    commit's log message, unless -C is used, in which case
#                    keep only this commit's message; -c is same as -C but
#                    opens the editor
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
```

The help text goes on for a few more lines. This file is called the [todo list](term:todo-list). Each line at the top is one instruction: a command word, a commit ID, and the commit's message. Lines that start with `#` are help text, and Git ignores them.

Three things to know before you change anything:

- **The order is upside down.** `git log` shows the newest commit first. The todo list shows the oldest first, because Git runs it from top to bottom and the oldest commit is replayed first.
- **You edit the command word, not the rest.** Git reads the command and the ID. The message after `#` is only there so you know which commit a line is; changing it here does nothing.
- **Saving and closing the editor starts the replay.** Nothing happens while the file is open.

These are the commands you will use. Each one has a one-letter short form (`r` for `reword`, and so on).

| Command | What Git does with that commit | Use it when |
|---|---|---|
| `pick` | Keeps it as it is | The default; leave it on every commit you do not want to touch |
| `reword` | Keeps the content, opens the editor for a new message | A typo or an unclear message |
| `edit` | Replays it, then stops and gives you the terminal | You want to change its content, or split it |
| `squash` | Joins it into the commit on the line above, and lets you write the joined message | Two commits are one piece of work, and both messages matter |
| `fixup` | Joins it into the commit on the line above, and throws its own message away | The lower commit is a small fix like "fix typo" |
| `drop` | Leaves it out | A commit you no longer want, like a debug print |
| `exec` | Runs a shell command at that point | Running the tests between commits (see Advanced) |

Moving a line up or down changes the order of the commits.

### The editor: enough Vim to get through

You will edit the todo list in the editor Git opens, so a minute on that first. [Status, stage, commit](lesson:three-areas) introduced it in "When you forget -m". In Git Bash the editor is **Vim** unless you chose another one.

Vim starts in a mode where keys are commands, not text. These keys are enough for this lesson:

| Key | What it does |
|---|---|
| Arrow keys | Move the cursor |
| `i` | Start typing ("insert mode"; the last line of the screen shows `-- INSERT --`). Now Backspace, Delete and letters work as in any editor |
| `Esc` | Stop typing and go back to command mode |
| `dd` | In command mode: cut the line the cursor is on |
| `p` | In command mode: paste the cut line below the cursor |
| `:wq` then Enter | In command mode: write the file and quit. Git carries on |
| `:cq` then Enter | In command mode: quit and report a failure. Git cancels the rebase and changes nothing |

If you prefer a simpler editor, **nano** ships with Git for Windows and is on most Macs and Linux systems. You can ask for it for one command:

```console
$ git -c core.editor=nano rebase -i HEAD~4
```

`-c core.editor=nano` sets the editor for this one command only. In nano you type right away; `Ctrl+K` cuts a line, `Ctrl+U` pastes it, `Ctrl+O` then Enter writes the file, and `Ctrl+X` quits. To use nano for everything in the practice project, run `git config --local core.editor nano` once.

### Reword: fix an old message

`reword` tells Git: keep this commit's content, and let me write a new message for it.

:::try-it
1. Run `git rebase -i HEAD~4`. The editor opens with the todo list: four `pick` lines, oldest on top.
2. On the second line, the one for "Add caek recipe", change the word `pick` to `reword`. In Vim: move to that line, press `i`, replace the word, press `Esc`. Do not fix the typo here; it would be ignored.
3. Write the file and quit (`:wq` and Enter in Vim). Git starts the replay, reaches the second commit and opens the editor again, this time with that commit's message.
4. Change "caek" to "cake", then write and quit. Git finishes and prints `Successfully rebased and updated refs/heads/try-recipes.` In the picture, three new stations appear with the `branch try-recipes` tag and the `HEAD · you` pin on the last one. The three stations they replace stay on the map, faded and dashed.
5. Run `git log --oneline`. The message reads "Add cake recipe".
:::

```console
$ git rebase -i HEAD~4
[detached HEAD 5c052fd] Add cake recipe
 Date: Fri Nov 27 01:03:57 2026 +0300
 1 file changed, 1 insertion(+)
 create mode 100644 cake.txt
Successfully rebased and updated refs/heads/try-recipes.
$ git log --oneline
15db95e Add oven tips
435e60a Add baking time
5c052fd Add cake recipe
ed78c30 Add bread recipe
12f5263 WIP more hours
1804532 WIP opening hours
10fbd77 Add homepage
```

The words `detached HEAD` in the first line are normal here: during the replay Git works off the branch, and it puts you back on `try-recipes` at the end. Under the hood explains it.

Compare the IDs with the first log. You changed one message, yet three commits have new IDs: the cake commit and the two after it. Only "Add bread recipe" kept `ed78c30`.

This is the same rule you met with `--amend`. A commit's ID is computed from its content, and that content includes the ID of its [parent](term:parent-commit), the commit just before it. The cake commit got a new message, so it got a new ID. "Add baking time" now has a different parent, so it needs a new ID too, and so does the commit after that. The commit before the change has the same parent as always, so Git leaves it alone.

:::graph
caption: "After the reword: the cake commit and everything after it are new copies. The old three stay behind, with no branch on them"
commits:
  - id: B
    message: Add bread recipe
  - id: C
    message: Add caek recipe
    parents: [B]
    faded: true
  - id: D
    message: Add baking time
    parents: [C]
    faded: true
  - id: E
    message: Add oven tips
    parents: [D]
    faded: true
  - id: C2
    message: Add cake recipe
    parents: [B]
  - id: D2
    message: Add baking time
    parents: [C2]
  - id: E2
    message: Add oven tips
    parents: [D2]
branches:
  try-recipes: E2
head: try-recipes
:::

The common wrong idea is "I only touched one commit". You touched one line of the todo list. Git rewrote that commit and every commit after it.

:::compare
today: "`reword` in the todo list opens the editor for that commit's message and then carries on by itself."
book: "Pro Git marks the commit `edit`, then runs `git commit --amend` and `git rebase --continue`. That still works, and it is the way to change a commit's content."
:::

### Reorder and squash: two commits become one

To [squash](term:squash) means to join several commits into one. In the todo list, `squash` joins a commit into the one **on the line above it**.

"Add bread recipe" and "Add baking time" belong together, but the cake commit sits between them. So this takes two edits in the same todo list: move the line, then change its command.

Moving a line is all it takes to reorder commits. Git replays the lines in the order you leave them.

:::predict
question: "You move the line \"Add baking time\" up, right under \"Add bread recipe\", and change its pick to squash. How many of your four commits will git log show afterwards, and what will bread.txt hold?"
answer: "Three commits: bread, cake, oven tips. bread.txt still holds both lines. Squashing joins the commits; it does not lose any change."
:::

:::try-it
1. Run `git rebase -i HEAD~4`. The todo list opens with four `pick` lines.
2. Move the third line, "Add baking time", up so that it is the second line, right under "Add bread recipe". In Vim: put the cursor on the third line, type `dd` to cut it, press the up arrow twice to reach the first line, and type `p` to paste the line below it.
3. On that moved line, change `pick` to `squash`. The first two lines now read `pick ... Add bread recipe` and `squash ... Add baking time`.
4. Write the file and quit. Git joins the two commits and opens the editor again, showing both messages.
5. Delete the line "Add baking time", so that "Add bread recipe" is the only line without a `#`. Write and quit. Git prints `Successfully rebased and updated refs/heads/try-recipes.` In the picture, a line of three new stations takes over the `branch try-recipes` tag and the `HEAD · you` pin, and the old stations stay behind, faded.
6. Run `git log --oneline`, then `cat bread.txt`. The log shows three commits of yours, not four, and the file still has both lines.
:::

The editor in step 4 looks like this:

```console
# This is a combination of 2 commits.
# This is the 1st commit message:

Add bread recipe

# This is the commit message #2:

Add baking time

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
```

Whatever you leave without a `#` becomes the message of the joined commit. You can keep both lines, keep one, or write a new message.

```console
$ git rebase -i HEAD~4
[detached HEAD b46e7ce] Add bread recipe
 Date: Fri Nov 27 01:03:57 2026 +0300
 1 file changed, 2 insertions(+)
 create mode 100644 bread.txt
Successfully rebased and updated refs/heads/try-recipes.
$ git log --oneline
38dfd5a Add oven tips
14c7855 Add cake recipe
b46e7ce Add bread recipe
12f5263 WIP more hours
1804532 WIP opening hours
10fbd77 Add homepage
$ cat bread.txt
Flour, water, salt
Bake for 40 minutes
```

`2 insertions(+)` on the joined commit: both lines of `bread.txt` are in it now.

:::graph
caption: "After the squash: one bread commit holds both changes (the old commits are not drawn)"
commits:
  - id: A
    message: WIP more hours
  - id: B
    message: Add bread recipe
    parents: [A]
  - id: C
    message: Add cake recipe
    parents: [B]
  - id: E
    message: Add oven tips
    parents: [C]
branches:
  main: A
  try-recipes: E
head: try-recipes
:::

`fixup` does the same as `squash` with one difference: it throws away the message of the lower commit and never opens the editor. Use `fixup` when the lower commit's message is worthless ("oops", "fix typo"), and `squash` when you want to see both messages and write one from them.

To join more than two commits, mark every commit after the first: one `pick`, then `squash` (or `fixup`) on each line below it.

:::careful
Reordering works without trouble when the commits touch different files or different lines. If you move a commit above one it depends on, Git stops with a conflict. "When it goes wrong" below shows that case.
:::

### Drop: leave a commit out

`drop` tells Git: do not replay this commit. Its changes are gone from the branch.

Here is a longer version of the recipes branch. Its newest commit, "Add thanks note", should go:

```console
pick 39fa8b8 # Add scones recipe
pick 170df30 # Add muffins recipe
drop 32a2109 # Add thanks note
```

```console
$ git rebase -i HEAD~3
Successfully rebased and updated refs/heads/try-recipes.
$ git log --oneline -3
170df30 Add muffins recipe
39fa8b8 Add scones recipe
4c87db8 Add oven tips
```

The file that commit added, `thanks.txt`, is gone from the working tree as well. Nothing after the dropped commit had to change here, so the other IDs stayed the same.

:::careful
Deleting a line from the todo list does the same as `drop`, with no warning. Git says so in the help text: "If you remove a line here THAT COMMIT WILL BE LOST." Write `drop` when you mean it, and never delete a line to tidy up the list.
:::

`drop` removes one commit from your own unpushed work. Removing a file, such as a password, from every commit of a long history is a different job with its own tool; the lesson [Remove a leaked secret or huge file from history](lesson:remove-sensitive-data) teaches it.

### Edit: stop and split a commit

`edit` tells Git: replay this commit, then stop and hand me the terminal. While Git waits, you can change that commit any way you like. The most useful change is to split it: one commit that did two things becomes two commits.

Say a commit named "Add scones and muffins" added two recipes at once, and you want one commit for each. Mark it `edit`:

```console
edit 2a98ea7 # Add scones and muffins
pick 94fc5a9 # Add thanks note
```

Git replays that commit, stops, and tells you what to do next:

```console
$ git rebase -i HEAD~2
Stopped at 2a98ea7...  # Add scones and muffins
You can amend the commit now, with

  git commit --amend 

Once you are satisfied with your changes, run

  git rebase --continue
```

You are now in the middle of the rebase, standing on the commit you want to split. Three steps split it:

1. **Undo the commit, keep its changes.** `git reset HEAD^` moves back one commit and leaves that commit's changes in your working tree, not staged. (`HEAD^` means "the parent of the commit I am on", the same commit as `HEAD~1`. [Reset demystified](lesson:reset-demystified) explains this kind of reset.)
2. **Commit the changes in pieces.** Stage and commit one part, then the other.
3. **Carry on.** `git rebase --continue` replays the rest of the todo list.

```console
$ git reset HEAD^
$ git status --short
?? muffins.txt
?? scones.txt
$ git add scones.txt
$ git commit -m "Add scones recipe"
[detached HEAD 39fa8b8] Add scones recipe
 1 file changed, 1 insertion(+)
 create mode 100644 scones.txt
$ git add muffins.txt
$ git commit -m "Add muffins recipe"
[detached HEAD 170df30] Add muffins recipe
 1 file changed, 1 insertion(+)
 create mode 100644 muffins.txt
$ git rebase --continue
Successfully rebased and updated refs/heads/try-recipes.
$ git log --oneline -4
32a2109 Add thanks note
170df30 Add muffins recipe
39fa8b8 Add scones recipe
4c87db8 Add oven tips
```

One commit became two, and "Add thanks note" was replayed on top of them.

The two files show as `??` (untracked) after the reset because the commit you undid was the one that created them. A commit that changed existing files would leave them listed as modified.

When the two changes are in the same file, stage them one part at a time; the Partial staging lesson teaches that. `edit` also fits a smaller job: stop, change a file, `git add` it, run `git commit --amend`, then `git rebase --continue`.

To give up at any stop, run `git rebase --abort`. Git puts the branch back exactly as it was before the rebase started.

### Fixup commits and autosquash

Reorder-and-squash is common enough that Git can prepare the todo list for you. It takes two commands.

`git commit --fixup <commit>` tells Git: commit what I staged, and mark the commit as a fix for that older commit. The result is called a [fixup commit](term:fixup-commit). Git writes the message itself: `fixup!` followed by the older commit's message.

`git rebase -i --autosquash` tells Git: open the todo list with every `fixup!` commit already moved under its target and already set to `fixup`.

This way you fix a mistake the moment you notice it, keep working, and tidy up once at the end.

:::try-it
1. The bread recipe is missing an ingredient. Run `printf "Flour, water, salt, yeast\nBake for 40 minutes\n" > bread.txt`. This writes the file again with "yeast" added to the first line. In the picture, the `bread.txt` sheet in the working tree is marked as changed.
2. Run `git add bread.txt`. The sheet slides into the staging area.
3. Run `git log --oneline -3` and copy the ID in front of "Add bread recipe".
4. Run `git commit --fixup <that ID>`. Git makes a commit named `fixup! Add bread recipe`. In the picture, a new station appears at the end of the line.
5. Run `git rebase -i --autosquash HEAD~4`. The todo list opens. Look at the second line: Git already moved the fixup commit under "Add bread recipe" and changed its command to `fixup`.
6. Change nothing. Write and quit. Git prints `Successfully rebased and updated refs/heads/try-recipes.` In the picture, new stations take over the `branch try-recipes` tag, and the `fixup!` station is left behind, faded.
7. Run `git log --oneline -3`. There are three commits of yours again, and no `fixup!` commit.
:::

```console
$ git commit --fixup b46e7ce
[try-recipes de42444] fixup! Add bread recipe
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git log --oneline -4
de42444 fixup! Add bread recipe
38dfd5a Add oven tips
14c7855 Add cake recipe
b46e7ce Add bread recipe
```

The todo list of step 5, as Git prepared it:

```console
pick b46e7ce # Add bread recipe
fixup de42444 # fixup! Add bread recipe
pick 14c7855 # Add cake recipe
pick 38dfd5a # Add oven tips
```

```console
$ git log --oneline -4
1479862 Add oven tips
bbf1f68 Add cake recipe
c11d76c Add bread recipe
12f5263 WIP more hours
```

`git show c11d76c` would now show "yeast" inside the bread commit, as if you had never forgotten it.

Without `--autosquash`, the fixup commit stays an ordinary `pick` line at the bottom of the list, and you move it yourself. Advanced shows the setting that turns autosquash on for good.

### The rule: never rewrite pushed history

Every Try-it above ended with new commit IDs. That is harmless while the commits exist only on your computer. It is a problem once you have **pushed** them, that is, sent them to a shared server.

Picture it. You push three commits, and a teammate builds on them. Then you squash the three into one. Your branch now holds one commit the server has never seen, and the server holds three your branch no longer has. Git refuses your next push. If you force it through, your teammate's work sits on commits that are gone from the server, and the same changes can end up in the history twice.

- **Not pushed yet:** reword, squash, reorder and split as much as you like. Pro Git's advice is to not push until you are happy with your history.
- **Already pushed to a shared branch:** leave the commits alone. Fix problems with a new commit, or with [revert](lesson:revert-a-commit).
- **Pushed to a branch only you use**, like your own pull request branch: many teams allow rewriting there. It needs a forced push; the lesson "Force-pushing safely" shows how to do that without destroying anyone's work.

So choose the range with care: `git rebase -i HEAD~4` must not reach back past your own unpushed commits.

### When it goes wrong

Most trouble with an interactive rebase is Git stopping halfway. Two commands always get you out: `git status` says where you are and what Git waits for, and `git rebase --abort` takes you back to the start.

**A reorder ends in a conflict.**

```console
$ git rebase -i HEAD~4
CONFLICT (modify/delete): bread.txt deleted in HEAD and modified in 435e60a (Add baking time).  Version 435e60a (Add baking time) of bread.txt left in tree.
error: could not apply 435e60a... Add baking time
hint: Resolve all conflicts manually, mark them as resolved with
hint: "git add/rm <conflicted_files>", then run "git rebase --continue".
hint: You can instead skip this commit: run "git rebase --skip".
hint: To abort and get back to the state before "git rebase", run "git rebase --abort".
```

Here "Add baking time" was moved above "Add bread recipe". It adds a line to `bread.txt`, but at that point of the replay the file does not exist yet. The order was wrong, so the right fix is `git rebase --abort`, then start again with a better order. When the order is right and two commits really clash, settle the conflict as you learned in [Branch, merge, and fix conflicts](lesson:branch-and-merge), `git add` the file, and run `git rebase --continue`.

**Git refuses to start.**

```console
$ git rebase -i HEAD~2
error: cannot rebase: You have unstaged changes.
error: Please commit or stash them.
```

A rebase needs a clean working tree, because it checks out older commits on the way. Commit your changes, or put them aside with `git stash` (see [Stash unfinished work, clean the folder](lesson:stash-and-clean)) and bring them back afterwards.

**A typo in the todo list.**

```console
$ git rebase -i HEAD~2
error: invalid command 'sqash'
error: invalid line 1: sqash 7d9e307 # Add scone recipe
You can fix this with 'git rebase --edit-todo' and then run 'git rebase --continue'.
Or you can abort the rebase with 'git rebase --abort'.
```

Git could not read a line, so it stopped before replaying anything. `git rebase --edit-todo` opens the list again; correct the word, write and quit, then run `git rebase --continue`. You get a similar message, `error: cannot 'squash' without a previous commit`, when the first line of the list is a `squash` or `fixup`: there is no line above it to join into.

**You forgot you were in a rebase.** If `git status` says `interactive rebase in progress`, Git is still waiting at an `edit` stop or a conflict. Finish with `git rebase --continue`, or go back with `git rebase --abort`.

## Under the hood

Must know treated the todo list as a list of wishes. This layer shows what Git does with it, step by step, and where your old commits go.

### What Git does when you close the editor

Git's own diary of where HEAD has been, the [reflog](term:reflog), recorded the squash from the Try-it. Read it from the bottom up:

```console
$ git reflog -5
38dfd5a HEAD@{0}: rebase (finish): returning to refs/heads/try-recipes
38dfd5a HEAD@{1}: rebase (pick): Add oven tips
14c7855 HEAD@{2}: rebase (pick): Add cake recipe
b46e7ce HEAD@{3}: rebase (squash): Add bread recipe
ed78c30 HEAD@{4}: rebase (start): checkout HEAD~4
```

1. **Start.** Git moves HEAD off the branch and onto an older commit. This is a detached HEAD, which you met in [Switching branches and detached HEAD](lesson:switch-and-detached-head). It is why the output says `[detached HEAD b46e7ce]`. The branch `try-recipes` does not move yet.
2. **Replay.** Git runs the todo list from top to bottom. For each line it applies that commit's changes on top of where HEAD is and makes a new commit.
3. **Finish.** Only at the very end does Git move the branch label to the last new commit and put HEAD back on the branch. That is the line `Successfully rebased and updated refs/heads/try-recipes.`

Because the branch moves only at the end, `git rebase --abort` is always safe during a stop: the branch still points at your old commits.

One detail in line `HEAD@{4}`: the rebase was asked to start from `HEAD~4`, yet HEAD landed on `ed78c30`, which is "Add bread recipe" itself. The first line of the todo list was an unchanged `pick` on top of its old parent. Replaying it would make the very same commit, so Git skips ahead and reuses it. Pro Git notes the same thing: a commit marked `pick` that comes before any change keeps its ID.

### Where the todo list lives

While a rebase is stopped, its state is in the folder `.git/rebase-merge`. The lines still to run are in `git-rebase-todo`, with full commit IDs:

```console
$ cat .git/rebase-merge/git-rebase-todo
pick 94fc5a93e49fcaa17d02d143567e7c1e83b4e141 # Add thanks note
```

That folder is how `git status` knows a rebase is in progress, and `git rebase --edit-todo` opens this file. When the rebase finishes or is aborted, Git deletes the folder.

### Where the old commits go

Nothing was deleted. The commits you replaced are still in `.git/objects`; no branch leads to them any more, as with an amend.

Git also notes where the branch was before the rebase, under the name `ORIG_HEAD`:

```console
$ git rev-parse --short ORIG_HEAD
15db95e
```

`15db95e` is "Add oven tips" from before the squash. So a finished rebase that you regret can be taken back:

```console
$ git reset --hard ORIG_HEAD
```

:::careful
`git reset --hard` throws away uncommitted changes, so check `git status` first. And `ORIG_HEAD` is overwritten by the next rebase, reset or merge. Use it right after the rebase you regret; later, find the old commit in `git reflog`. The lesson [Recover lost commits with reflog and fsck](lesson:rescue-lost-work) covers that.
:::

## Advanced

Must know covered the todo list by hand. These options save typing, check your work, and handle branches that sit on top of each other.

### Turn autosquash on for good

`rebase.autoSquash` makes every interactive rebase behave as if you had typed `--autosquash`:

```console
$ git config --global rebase.autoSquash true
```

Use `--local` in place of `--global` to set it for one repository only. `git rebase -i --no-autosquash` switches it off for one run.

Three more things about fixup commits:

- `git commit --fixup` accepts any name for the target, not only an ID. `git commit --fixup ":/Add cake"` targets the newest commit whose message matches "Add cake".
- `git commit --squash <commit>` makes a `squash!` commit. Autosquash turns it into a `squash` line, so you get the editor and can rewrite the joined message.
- `git rebase --autosquash HEAD~3`, without `-i`, folds the fixups in without showing the todo list at all (Git 2.44 and newer).

### Run a command after every commit: `--exec`

A cleaned-up history should still work at every commit. `--exec` adds an `exec` line after each commit in the todo list, and Git runs that command there:

```console
$ git rebase -i --exec "npm test" HEAD~2
```

```console
pick 39fa8b8 # Add scones recipe
exec npm test
pick 170df30 # Add muffins recipe
exec npm test
```

If the command fails, Git stops at that commit so you can fix it, then `git rebase --continue`. You can also type an `exec` line into the todo list yourself, anywhere.

### Check the result: `git range-diff`

`git range-diff` compares two versions of a series of commits, pair by pair. It answers "what did my rebase really change?". Run right after the reword Try-it:

```console
$ git range-diff try-recipes@{1}...try-recipes
1:  72cb96f ! 1:  5c052fd Add caek recipe
    @@ Metadata
     Author: Practice Student <student@example.com>
     
      ## Commit message ##
    -    Add caek recipe
    +    Add cake recipe
     
      ## cake.txt (new) ##
     @@
2:  11c3498 = 2:  435e60a Add baking time
3:  e97f3fc = 3:  15db95e Add oven tips
```

`try-recipes@{1}` means "where the branch `try-recipes` pointed before its last move", so the three dots compare the branch before and after the rebase. Each line pairs an old commit with its new copy:

| Sign | Meaning |
|---|---|
| `=` | Same change and same message; only the ID is new |
| `!` | The pair differs; the lines below show how (here, the message) |
| `<` | The old commit has no partner in the new series |
| `>` | The new commit has no partner in the old series |

After the squash Try-it, the same command shows two old commits with `<` and one new commit with `>`: a joined commit matches neither of its halves.

```console
$ git range-diff try-recipes@{1}...try-recipes
1:  ed78c30 < -:  ------- Add bread recipe
-:  ------- > 1:  b46e7ce Add bread recipe
2:  5c052fd = 2:  14c7855 Add cake recipe
3:  435e60a < -:  ------- Add baking time
4:  15db95e = 3:  38dfd5a Add oven tips
```

A quicker check for "did the files end up the same?": `git diff ORIG_HEAD HEAD` prints nothing when a rebase changed only messages, order or grouping.

### Branches stacked on each other: `--update-refs`

Sometimes a second branch points at a commit in the middle of the range you rewrite: a `scones` branch on "Add scones recipe", with `try-recipes` one commit further. A plain rebase moves only the branch you are on, and `scones` is left pointing at the old commit. `--update-refs` moves such branches to the new copies:

```console
$ git rebase -i --update-refs HEAD~2
```

```console
pick 39fa8b8 # Add scones recipe
update-ref refs/heads/scones

pick 170df30 # Add muffins recipe
```

The `update-ref` line marks where `scones` will point. After rewording the first commit:

```console
Successfully rebased and updated refs/heads/try-recipes.
Updated the following refs with --update-refs:
	refs/heads/scones
$ git log --oneline -2 --decorate
18e72b3 (HEAD -> try-recipes) Add muffins recipe
7d9e307 (scones) Add scone recipe
```

`git config rebase.updateRefs true` makes it the default.

### Reach the very first commit: `--root`

`HEAD~3` needs a commit to start after, so it cannot include the first commit of the repository. `git rebase -i --root` lists every commit from the first one on.

### `break`, and a safety net for deleted lines

- A `break` line in the todo list stops the rebase at that point without touching any commit, so you can look around. `git rebase --continue` goes on.
- `git config rebase.missingCommitsCheck error` makes Git stop when a line was deleted from the todo list, so a commit cannot vanish by accident. You then say `drop` when you mean it.

## Recap

- `git rebase -i HEAD~N` opens the todo list for your last N commits, oldest on top. Edit the command words, then write and quit.
- `reword` changes a message, `squash` and `fixup` join a commit into the line above, `drop` removes one, `edit` stops so you can change or split a commit (`git reset HEAD^`, commit the parts, `git rebase --continue`). Moving a line reorders.
- `git commit --fixup <commit>` now, `git rebase -i --autosquash` later: Git puts the fix into the right commit for you.
- Every commit from the first changed line on gets a new ID. So never rewrite commits you have pushed to a shared branch.
- Stuck? `git status` says where you are; `git rebase --abort` goes back to the start; `ORIG_HEAD` and the reflog still hold the old commits.
