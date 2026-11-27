---
id: integrating-work
title: "Bring in others' work: cherry-pick, topic branches, what a change introduces"
module: working-in-a-team
bookSection: "5.3 Maintaining a Project"
bookUrl: https://git-scm.com/book/en/v2/Distributed-Git-Maintaining-a-Project
bookSources:
  - book/progit2/book/05-distributed-git/sections/maintaining.asc
readFirst: [team-contributing]
---

A teammate hands you a branch with three commits and says "please merge this". One of them is a fix the project needs today; the other two are a feature that is not ready. This lesson shows how to see exactly what a branch would bring into `main` before you accept it, and how to take all of it, or only the one commit you want, with `git cherry-pick`.

## Must know

In [Branch, merge, and fix conflicts](lesson:branch-and-merge) you merged your own branches. Now the work comes from someone else, and you are the one who decides whether it goes in. The person who decides what enters a project is called its [maintainer](term:maintainer). The person who sends work is a **contributor**. On a small team you are both, several times a day.

A maintainer's job has three steps, and this lesson follows them in order:

1. Put the contributed work somewhere safe to look at.
2. Find out exactly what it would change.
3. Bring it in: all of it, or part of it.

### The practice project

The terminal on the right opens in the website of a cycling club. Run `git log --oneline --graph --all` there:

```console
$ git log --oneline --graph --all
* fd7192f Add contact details
| * c657c37 Add signup confirmation
| * c8e5cfd Fix wrong ride time
| * e490169 Add signup form
|/  
* ecc1c7b Add ride routes
* fb6c586 Add club homepage
```

You are on `main`. A contributor, Nadia, built a signup page on the branch `signup`: three commits. After she started, `main` got one more commit of its own, `Add contact details`. (Your commit IDs will differ from the ones printed in this lesson.)

:::graph
caption: "The practice project: signup has three commits main lacks, and main has one that signup lacks"
commits:
  - id: A
    message: Add club homepage
  - id: B
    message: Add ride routes
    parents: [A]
  - id: C
    message: Add contact details
    parents: [B]
  - id: S1
    message: Add signup form
    parents: [B]
  - id: S2
    message: Fix wrong ride time
    parents: [S1]
  - id: S3
    message: Add signup confirmation
    parents: [S2]
branches:
  main: C
  signup: S3
head: main
:::

Bringing Nadia's fix into `main` is the first challenge at the end of this lesson. So in the Try-its below you only look at `signup`, and you change branches of your own, each starting with `try-`.

### Look at contributed work in a topic branch

A [topic branch](term:topic-branch) is a short-lived [branch](term:branch) made for one piece of work: one feature, one fix, one experiment. Pro Git's advice to maintainers is to try every contribution in a topic branch first, never directly on `main`. If the work turns out to be broken, `main` never saw it, and you can leave the branch alone until you have time to come back.

Give the branch a name that says what the work is about, like `signup`. Projects with many contributors often put the contributor's initials in front, like `nk/signup`, so a long list of branches stays readable.

To start a topic branch at `main` and switch to it:

```console
$ git switch -c nk/signup main
```

The last word is the starting point. Leave it out and the branch starts where you are.

:::compare
today: "`git switch -c nk/signup main` makes the topic branch and switches to it."
book: "Pro Git writes `git checkout -b sc/ruby_client master`. It does the same and still works."
:::

How does a contributor's work get into your repository in the first place? Usually through a [remote](term:remote): you add the contributor's repository as a remote, fetch, and start a local branch from their remote-tracking branch. The lesson [Remote and tracking branches](lesson:remote-branches) teaches each of these commands.

```console
$ git remote add nadia https://github.com/nadia/cycling-club.git
$ git fetch nadia
$ git switch -c signup nadia/signup
```

On GitHub, a pull request (a request, made on the website, to merge a branch) does the same job for you. In the practice project the branch `signup` is already there, so you can start reading.

### See which commits a branch would bring in

Before you accept a branch, you want the list of commits it has and `main` does not have. `git log main..signup` tells Git: show the commits I can reach from `signup`, minus the ones I can reach from `main`.

```console
$ git log --oneline main..signup
c657c37 Add signup confirmation
c8e5cfd Fix wrong ride time
e490169 Add signup form
```

Read the two dots as "what is in the right one that is not in the left one". These three commits are what a merge of `signup` would add to `main`. `Add ride routes` is not listed: both branches have it already.

Turn the names around and you get the opposite question, what `main` has that `signup` lacks:

```console
$ git log --oneline signup..main
fd7192f Add contact details
```

Two options you will use with it:

| You type | What it adds | When |
|---|---|---|
| `git log -p main..signup` | The [diff](term:diff) of each commit under its message | To review the work commit by commit |
| `git log --no-merges main..signup` | Leaves out [merge commits](term:merge-commit) | When the contributor merged `main` into their branch to stay up to date. Those merge commits are not their work |

Pro Git also shows an older way to write the same range: `git log signup --not main`. It prints the same three commits.

:::try-it
1. Run `git log --oneline main..signup`. Git lists three commits, newest first: the work `signup` would bring in. Nothing moves in the picture, because `git log` only reads.
2. Run `git log --oneline signup..main`. Git lists one commit, `Add contact details`: the commit `signup` has not seen yet.
3. Run `git switch -c try-signup signup`. You are on a new topic branch that starts at the newest commit of `signup`. In the picture, a `branch try-signup` tag appears on the `Add signup confirmation` station, and the `HEAD · you` pin moves to it.
4. Run `git merge main --no-edit`. This is what a contributor does to bring their branch up to date. In the picture, a new station `Merge branch 'main' into try-signup` joins the two rows.
5. Run `git log --oneline main..try-signup`. Git lists four commits now: the merge commit counts as one.
6. Run `git log --oneline --no-merges main..try-signup`. Git lists three again. The merge commit is hidden, and what is left is the contributor's own work.
7. Run `git switch main`. The `HEAD · you` pin goes back to the `branch main` tag.
:::

```console
$ git log --oneline main..try-signup
034cbda Merge branch 'main' into try-signup
c657c37 Add signup confirmation
c8e5cfd Fix wrong ride time
e490169 Add signup form
$ git log --oneline --no-merges main..try-signup
c657c37 Add signup confirmation
c8e5cfd Fix wrong ride time
e490169 Add signup form
```

### See the full change: three dots, not two

The list of commits tells you what was done step by step. Often you want one diff instead: everything the branch would change in `main`, in one view. The lesson [Read any diff](lesson:diffs-in-depth) taught `git diff A B`, and the first idea is to use it here. It gives a misleading answer.

:::predict
question: "main has contact.txt, added after signup was started. signup never touched that file. What does git diff main signup say about contact.txt?"
answer: "It shows contact.txt as deleted. git diff main signup compares the two newest snapshots directly. signup's snapshot has no contact.txt, so the diff looks as if signup removes the file. A merge would not remove it."
:::

```console
$ git diff main..signup --stat
 contact.txt | 1 -
 index.html  | 2 +-
 signup.html | 2 ++
 3 files changed, 3 insertions(+), 2 deletions(-)
```

`git diff main..signup` is another way to write `git diff main signup`. It compares the newest commit of `main` with the newest commit of `signup`, and nothing else. So every change made on `main` since the branches split shows up backwards: the line `main` added looks like a line `signup` deletes. Nadia never touched `contact.txt`.

What you want is the work done on `signup` since it left `main`. Three dots give you that:

```console
$ git diff main...signup --stat
 index.html  | 2 +-
 signup.html | 2 ++
 2 files changed, 3 insertions(+), 1 deletion(-)
```

`git diff main...signup` compares `signup` with the last commit the two branches share, not with today's `main`. That shared commit is the [merge base](term:merge-base), here `Add ride routes`. The result is what a merge of `signup` would introduce: the changed ride time and the new signup page. `contact.txt` is not in it.

| You type | Compares | Use it for |
|---|---|---|
| `git diff main signup` or `git diff main..signup` | The newest commit of each branch | "How do these two branches differ right now?" |
| `git diff main...signup` | The merge base and the newest commit of `signup` | "What would merging `signup` bring in?" |

When `main` has not moved since the branch was made, both give the same diff. The three dots only matter once both branches have new commits, which on a team is the usual case.

:::careful
The dots mean different things in `git log` and in `git diff`. `git log main..signup` lists the commits of `signup` that `main` lacks: that is the right one for a review. `git diff main..signup` compares two snapshots and ignores the history between them: for a review you want `git diff main...signup`.
:::

:::try-it
1. Run `git diff main..signup --stat`. Git lists three files, and `contact.txt` has a `-`: it looks deleted.
2. Run `git diff main...signup --stat`. Git lists two files. `contact.txt` is gone from the list, because `signup` never changed it.
3. Run `git diff main...signup` without `--stat`. You see the real lines: the ride time changes from 9:00 to 8:00, and `signup.html` is new with two lines.
:::

### Choose how to bring the work in

You have looked at the branch and you want it. Pro Git describes several ways to bring a topic branch into `main`. They differ in what the history looks like afterwards.

| Way | What `main` gets | The history afterwards |
|---|---|---|
| **Merge** (`git merge signup`) | Every commit of the branch, unchanged | Shows the branch and where it joined, with a merge commit when both sides moved |
| **Rebase, then fast-forward** | A new copy of every commit of the branch, placed after the newest commit of `main` | One straight line, no merge commits |
| **Cherry-pick** (`git cherry-pick <commit>`) | A new copy of the one commit you name | One more commit on `main`; the rest of the branch stays out |
| **Squash merge** (`git merge --squash signup`) | One new commit that holds all the branch's changes | One commit on `main`; the branch's own commits stay out |

Merging is the simplest, and you know it already: `main` holds stable work, you merge a finished topic branch into it, delete the branch, and repeat.

**Rebasing** means replaying a branch's commits, one by one, on top of another commit. After `signup` is rebased onto `main`, its three commits come after `Add contact details`, so `main` can take them with a [fast-forward](term:fast-forward) and no merge commit is needed. Some maintainers prefer this because the history reads as a single line. Rebase has its own lesson, the Rebasing lesson, with its own rules about when not to use it.

Bigger projects add a second long-running branch. `main` is updated only for releases, and every topic branch is merged into a branch named `develop` first. When `develop` has proven stable, `main` is fast-forwarded to it. People who want the stable version use `main`; people who want the newest work use `develop`.

That leaves the two ways that take less than the whole branch as it is. Cherry-pick comes first, because it is the one you will use most.

### Take one commit with git cherry-pick

`git cherry-pick <commit>` is the command for a [cherry-pick](term:cherry-pick). It tells Git: take the change this one commit made, and make the same change as a new commit on the branch I am on.

Pro Git calls it "a rebase for a single commit". Use it when a topic branch has several commits and you want only one of them now: the urgent fix inside an unfinished feature.

Here is the idea on a small example. A branch `try-topic` has two commits. You want the second one on `main`, without the first.

:::graph
caption: "Before: try-topic has two commits. You want only Add hall note on main"
commits:
  - id: C
    message: Add contact details
  - id: T1
    message: Add jersey note
    parents: [C]
  - id: T2
    message: Add hall note
    parents: [T1]
branches:
  main: C
  try-topic: T2
head: main
:::

:::graph
caption: "After git cherry-pick: main has P, a new commit with the same change as T2. try-topic did not move"
commits:
  - id: C
    message: Add contact details
  - id: P
    message: Add hall note
    parents: [C]
  - id: T1
    message: Add jersey note
    parents: [C]
  - id: T2
    message: Add hall note
    parents: [T1]
branches:
  main: P
  try-topic: T2
head: main
:::

Three things to notice, because each one is commonly misunderstood:

- **The commit is copied, not moved.** T2 is still on `try-topic`. Nothing on that branch changes.
- **The copy is a new commit with a new [ID](term:commit-id).** P has the same message, the same author and the same change as T2, but a different parent (C, not T1). A different parent means a different ID.
- **You get the commit's change, not its snapshot.** T2's snapshot contains `jerseys.txt`, because T1 came before it. P does not: the change T2 made was "add `hall.txt`", and that is all that arrives on `main`.

:::predict
question: "try-topic has two commits: the first adds jerseys.txt, the second adds hall.txt. On main you cherry-pick the second one. Which of the two files does main have afterwards?"
answer: "Only hall.txt. A cherry-pick applies the change of the one commit you name, which was adding hall.txt. jerseys.txt came from the earlier commit, and you did not pick that one."
:::

:::try-it
1. Run `git switch -c try-topic`. You are on a new branch that starts where `main` is.
2. Run `echo "Order 20 club jerseys" > jerseys.txt`, then `git add jerseys.txt`, then `git commit -m "Add jersey note"`. In the picture, a new station appears with the `branch try-topic` tag on it.
3. Run `echo "Book the hall for Friday" > hall.txt`, then `git add hall.txt`, then `git commit -m "Add hall note"`. A second station appears, and the `branch try-topic` tag moves onto it.
4. Run `git log --oneline -2` and copy the ID in front of `Add hall note`.
5. Run `git switch main`, then `ls`. Neither `jerseys.txt` nor `hall.txt` is in your folder: both exist only on `try-topic`.
6. Run `git cherry-pick` followed by the ID you copied. In the picture, a new station `Add hall note` appears on the row of `main`, and the `branch main` tag moves onto it. The two stations of `try-topic` stay where they are.
7. Run `ls`. The file `hall.txt` is there. The file `jerseys.txt` is not.
8. Run `git log --oneline -1`. The ID of the new commit on `main` is not the ID you copied: it is a new commit.
:::

This is what step 6 prints:

```console
$ git cherry-pick 30724a0
[main 73d3ee9] Add hall note
 Date: Fri Nov 27 01:01:53 2026 +0300
 1 file changed, 1 insertion(+)
 create mode 100644 hall.txt
```

- `[main 73d3ee9]`: the new commit is on `main` and its ID is `73d3ee9`, not `30724a0`.
- `Date:` is when the change was first written. Git keeps the original date and the original author. When the author is someone else, an `Author:` line is printed too.
- The last lines are the same summary `git commit` prints.

You name the commit by its ID from `git log --oneline`. A branch name works too and means the newest commit of that branch: `git cherry-pick try-topic` picks `Add hall note`. So does a shortcut like `try-topic~1`, the commit one before the newest of `try-topic`.

:::careful
Cherry-pick refuses to start while a file it needs to change has edits you have not committed. Commit them first, or put them aside with `git stash` (the lesson [Stash unfinished work, clean the folder](lesson:stash-and-clean)). Git prints "Your local changes to the following files would be overwritten" and changes nothing.
:::

### When a cherry-pick stops on a conflict

The clean case is when the picked change fits the branch you are on. The change was written against a different version of the project, though, and your branch may have changed the same lines since. Then Git stops with a [merge conflict](term:merge-conflict), the same kind you settled in [Branch, merge, and fix conflicts](lesson:branch-and-merge).

A small example. After the last Try-it, `hall.txt` reads `Book the hall for Friday` on both branches.

| Branch | What its next commit does to `hall.txt` |
|---|---|
| `main` | Changes the line to `Book the hall for Saturday` |
| `try-topic` | Changes the line to `Book the hall for Friday at 7pm` |

You cherry-pick the `try-topic` commit onto `main`:

```console
$ git cherry-pick 11fb72a
Auto-merging hall.txt
CONFLICT (content): Merge conflict in hall.txt
error: could not apply 11fb72a... Add hall time
hint: After resolving the conflicts, mark them with
hint: "git add/rm <pathspec>", then run
hint: "git cherry-pick --continue".
hint: You can instead skip this commit with "git cherry-pick --skip".
hint: To abort and get back to the state before "git cherry-pick",
hint: run "git cherry-pick --abort".
hint: Disable this message with "git config set advice.mergeConflict false"
```

Nothing is lost. No commit was made; Git is paused and the hints name your three ways out. The file holds both versions between [conflict markers](term:conflict-marker):

```text
<<<<<<< HEAD
Book the hall for Saturday
=======
Book the hall for Friday at 7pm
>>>>>>> 11fb72a (Add hall time)
```

The top part is the branch you are on. The bottom part is the commit you are picking, named by its short ID and message.

You settle it the way you settle a merge, with one difference in the last step:

1. Edit the file to its final text and remove the three marker lines.
2. `git add <file>` to tell Git the conflict is resolved.
3. `git cherry-pick --continue` to make the commit. Git keeps the original message and author.

| You type | What it does |
|---|---|
| `git cherry-pick --continue` | Finishes the pick after you fixed and staged the files |
| `git cherry-pick --abort` | Gives up and puts the branch and your files back as they were before the pick |
| `git cherry-pick --skip` | Drops the commit that conflicted and goes on. It matters when you pick several commits at once |

`git status` reminds you of all three while the pick is waiting:

```console
$ git status
On branch main
You are currently cherry-picking commit 11fb72a.
  (fix conflicts and run "git cherry-pick --continue")
  (use "git cherry-pick --skip" to skip this patch)
  (use "git cherry-pick --abort" to cancel the cherry-pick operation)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   hall.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

:::try-it
1. On `main`, run `echo "Book the hall for Saturday" > hall.txt`, then `git commit -am "Move hall booking to Saturday"`. In the picture, a new station appears on the row of `main`.
2. Run `git switch try-topic`, then `echo "Book the hall for Friday at 7pm" > hall.txt`, then `git commit -am "Add hall time"`. The branch `try-topic` changed the same line in a different way.
3. Run `git log --oneline -1` and copy the ID of `Add hall time`. Then run `git switch main`.
4. Run `git cherry-pick` followed by that ID. Git prints `CONFLICT (content): Merge conflict in hall.txt`. In the picture, a banner above the desk reads "Cherry-pick stopped: 1 file has a conflict", and the `hall.txt` sheet in the working tree is marked `conflict`. No new station appears.
5. Run `cat hall.txt`. You see both lines between the three marker lines.
6. Run `git cherry-pick --abort`, then `cat hall.txt`. The file reads `Book the hall for Saturday` again and the banner is gone: the pick never happened.
7. Run the same `git cherry-pick` again. The same conflict comes back.
8. Write the final version: `echo "Book the hall for Saturday at 7pm" > hall.txt`. This replaces the whole file, markers included. In a real project you would do this in your editor.
9. Run `git add hall.txt`. In the picture, the `hall.txt` sheet slides into the staging area and loses its `conflict` mark. The banner now reads "Cherry-pick in progress".
10. Run `git cherry-pick --continue`. Your editor opens with the message `Add hall time`; save and close it. In the picture, the banner disappears and a new station `Add hall time` appears on the row of `main`.
:::

To skip the editor in step 10, run `git cherry-pick --continue --no-edit`.

### Squash merge, in short

Sometimes you want the whole branch, but not its twelve "fix typo" commits. `git merge --squash signup` takes every change of the branch and stages it on `main` without committing. You then run `git commit` once, and `main` gets one tidy commit. Here it is on two scratch branches: `try-range` holds the three signup commits, and `try-squash` receives them as one.

```console
$ git merge --squash try-range
Automatic merge went well; stopped before committing as requested
Squash commit -- not updating HEAD
$ git commit -m "Add signup page"
[try-squash 1c87e35] Add signup page
 2 files changed, 3 insertions(+), 1 deletion(-)
 create mode 100644 signup.html
```

The new commit has one parent, so it is an ordinary commit, not a merge commit. Git has no record that the branch was merged: `git branch -d` will refuse to delete the branch, and you delete it with `-D` once you are sure. Teams that use squash merges for every pull request are the subject of the lesson on merging pull requests, in this module.

### When it goes wrong

```console
$ git cherry-pick 30724a0
The previous cherry-pick is now empty, possibly due to conflict resolution.
If you wish to commit it anyway, use:

    git commit --allow-empty

Otherwise, please use 'git cherry-pick --skip'
```

The branch you are on already has this change, so the copy would change nothing. Most often you picked the same commit twice. Run `git cherry-pick --skip` to drop it and carry on.

```console
$ git cherry-pick signup
CONFLICT (modify/delete): signup.html deleted in HEAD and modified in c657c37 (Add signup confirmation).  Version c657c37 (Add signup confirmation) of signup.html left in tree.
error: could not apply c657c37... Add signup confirmation
```

The commit you picked changes a file that does not exist on your branch. It builds on an earlier commit you did not pick: here `Add signup confirmation` edits `signup.html`, which `Add signup form` created. Run `git cherry-pick --abort`, then pick the earlier commit first, or pick both in one command, oldest first.

```console
$ git cherry-pick 034cbda
error: commit 034cbda52f7401a2be1935c262af71ced86f2050 is a merge but no -m option was given.
fatal: cherry-pick failed
```

You named a merge commit. A merge commit has two parents, so Git cannot tell which change you mean. Nearly always you wanted an ordinary commit from the branch instead: check the ID with `git log --oneline --no-merges`. The Advanced part explains `-m`.

## Under the hood

Must know used two tools that looked unrelated: the three-dot diff and the cherry-pick. Both rest on the same idea from the merge lesson, the merge base. This layer shows what each of them compares, so the output stops being a surprise.

### What the three dots compute

The merge base of two branches is the newest commit both can reach. `git merge-base` prints it:

```console
$ git merge-base main signup
ecc1c7ba0b52fa610e70ea67d8b469727adc1993
```

That is `ecc1c7b`, `Add ride routes`: the commit where `signup` left `main`.

`git diff main...signup` is a shorter way to write "find the merge base, then compare it with `signup`":

```console
$ git diff $(git merge-base main signup) signup
```

Git compares snapshots, never branches. With two dots it compares C and S3 in the diagram below, so everything C added looks removed. With three dots it compares B and S3, which is exactly the work done on the `signup` side.

:::graph
caption: "Two dots compare C with S3. Three dots compare B, the merge base, with S3"
commits:
  - id: B
    message: Add ride routes (merge base)
  - id: C
    message: Add contact details
    parents: [B]
  - id: S1
    message: Add signup form
    parents: [B]
  - id: S2
    message: Fix wrong ride time
    parents: [S1]
  - id: S3
    message: Add signup confirmation
    parents: [S2]
branches:
  main: C
  signup: S3
head: main
:::

The merge base moves. In the first Try-it you merged `main` into `try-signup`. After that, the newest commit both branches reach is `main`'s own newest commit:

```console
$ git merge-base main try-signup
fd7192fa0ee3d44376bf6b9a259f033a1ae2a8d9
```

So for `try-signup`, two dots and three dots print the same diff. A branch that has merged in the latest `main` has nothing of `main` left to show backwards.

### What a cherry-pick compares

A commit stores a snapshot, not a change. So where does "the change this commit made" come from? Git works it out: the change of a commit is the difference between its parent's snapshot and its own.

A cherry-pick is a three-way merge, like `git merge`, but with a base you would not guess: **the parent of the commit you pick**.

| Role in the three-way merge | In a cherry-pick | `hall.txt` in the conflict Try-it |
|---|---|---|
| Base | The parent of the picked commit | `Book the hall for Friday` |
| Yours | The branch you are on | `Book the hall for Saturday` |
| Theirs | The picked commit | `Book the hall for Friday at 7pm` |

Read the table like the one in the merge lesson. From base to yours, the line changed. From base to theirs, the same line changed in another way. Two different changes to one line: a conflict.

This explains something that confuses people in real conflicts. The bottom part of the markers can hold lines from commits you did not pick, because "theirs" is a whole snapshot. If the picked commit's file already contained a line from an earlier commit on its branch, and that line sits next to the one being changed, it shows up between the markers. You decide whether it belongs in your branch. The hard challenge has exactly this.

### The new commit: same author, new committer

Every commit records two people, as you saw in [A first look inside .git](lesson:first-look-inside): the **author**, who wrote the change, and the **committer**, who made this commit object. Usually they are the same. After a cherry-pick they often differ:

```console
$ git log -1 --format=fuller
commit df1fca561d287f0a5d439727f319fc2c3c46a1cb
Author:     Nadia Karim <nadia@example.com>
AuthorDate: Fri Nov 27 01:01:42 2026 +0300
Commit:     Practice Student <student@example.com>
CommitDate: Fri Nov 27 01:02:07 2026 +0300

    Add signup form
    
    (cherry picked from commit e490169ea2190a8923ba2fc9744057d94b7af6dc)
```

Nadia stays the author, with the date she wrote the change. You are the committer, with the time of the pick. The parent is different too. The commit ID is a [checksum](term:checksum) of all of these, so the copy can never have the original's ID. (The last line of the message is there because this pick used `-x`; see Advanced.)

That is also why `git log main..try-topic` still lists a commit after you picked it. Git compares IDs, and by ID the original is not on `main`.

### Where Git remembers a paused pick

While a cherry-pick waits on a conflict, Git keeps the ID of the commit being picked in a file:

```console
$ cat .git/CHERRY_PICK_HEAD
11fb72a457b8b7652c479092d77f071a19aaeb3e
```

`git status` reads this file to print "You are currently cherry-picking commit 11fb72a". `--continue` and `--abort` both remove it. A merge does the same with `.git/MERGE_HEAD`.

## Advanced

Under the hood showed what a cherry-pick is made of. These are the options and neighbours of the commands above that maintainers reach for less often.

### Record where a pick came from: -x

`git cherry-pick -x <commit>` adds a line to the end of the commit message with the ID of the original. Here Nadia's `Add signup form` is picked onto a scratch branch named `try-x`:

```console
$ git cherry-pick -x e490169
[try-x df1fca5] Add signup form
 Author: Nadia Karim <nadia@example.com>
 Date: Fri Nov 27 01:01:42 2026 +0300
 1 file changed, 1 insertion(+)
 create mode 100644 signup.html
```

The message now ends with `(cherry picked from commit e490169ea2190a8923ba2fc9744057d94b7af6dc)`, as printed in Under the hood. Use it when you copy a fix from `main` to a release branch, so anyone reading the release branch can find the original. Copying a fix back to an older version like this is called a [backport](term:backport). Leave `-x` out when the original is on a private branch that will be deleted: the ID would point at nothing.

### Pick several commits at once

Name several commits and Git picks them in the order you wrote them, one new commit each:

```console
$ git cherry-pick main~2 main
```

A range works too. `git cherry-pick main..signup` picks every commit of `signup` that `main` lacks, oldest first. Here they land on a scratch branch named `try-range`:

```console
$ git cherry-pick main..signup
[try-range d8df959] Add signup form
 Author: Nadia Karim <nadia@example.com>
 Date: Fri Nov 27 01:01:42 2026 +0300
 1 file changed, 1 insertion(+)
 create mode 100644 signup.html
[try-range e00d6c8] Fix wrong ride time
 Author: Nadia Karim <nadia@example.com>
 Date: Fri Nov 27 01:01:42 2026 +0300
 1 file changed, 1 insertion(+), 1 deletion(-)
[try-range 2bbb460] Add signup confirmation
 Author: Nadia Karim <nadia@example.com>
 Date: Fri Nov 27 01:01:42 2026 +0300
 1 file changed, 1 insertion(+)
```

If one of them conflicts, Git stops there. Fix the file, `git add` it, and `git cherry-pick --continue` carries on with the rest. `--skip` drops the stopped commit and carries on. `--abort` undoes the whole run, including the commits already picked in it.

### Pick without committing: -n

`git cherry-pick -n <commit>` applies the change to your working tree and staging area and stops before the commit:

```console
$ git cherry-pick -n try-topic~2
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   jerseys.txt
```

Use it to combine several picked commits into one, or to adjust a change before you commit it. You finish with an ordinary `git commit`, and you write the message yourself.

### Pick a merge commit: -m

A merge commit has two parents, so "the change it made" depends on which parent you compare with. `git cherry-pick -m 1 <merge>` says: compare with the first parent, the branch that received the merge. The result is one commit with everything the merged branch brought in. This is rare. If you want a whole branch, merging it is clearer.

### Which commits were picked already?

After a pick, `git log main..try-topic` still lists the original, because its ID is not on `main`. `git cherry` compares the changes themselves:

```console
$ git cherry -v main try-topic
+ 71660123bf1a3c95688fc27b4ccbfd7989ffc8b7 Add jersey note
- 30724a039d534c971200ce61ddc61faa4144cbfe Add hall note
```

`-` marks a commit whose change `main` already has. `+` marks one it still lacks. A pick that needed a conflict fixed by hand counts as `+`, because its change is no longer the same.

When you later merge a branch you picked from, Git copes: the same change on both sides merges without a conflict. The history then holds the change twice, once as the pick and once as the original.

### Pull once from an address

To take a branch from someone you will not work with again, you do not need a remote. `git pull <url> <branch>` fetches that branch and merges it into yours, and stores no name for the address. The address can be a web URL or, as in this example from another small project, a folder on the same computer:

```console
$ git pull ../p2c main
From ../p2c
 * branch            main       -> FETCH_HEAD
Updating 65f26cb..eb6ab9d
Fast-forward
 b.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 b.txt
```

`FETCH_HEAD` is Git's name for "what the last fetch brought". This merges straight into the branch you are on, so make a topic branch first and pull there.

### How a big project is organised

Pro Git describes how the Git project itself is maintained. It keeps four long-running branches:

| Branch | Holds |
|---|---|
| `master` | Work that is stable and released from |
| `next` | Topic branches judged safe, merged together so everyone can test them |
| `seen` | Topic branches that still need work (it used to be called `pu`, proposed updates) |
| `maint` | The last release, for backported fixes |

A contribution starts as a topic branch in the maintainer's repository. It is merged into `seen` or `next`, and once it has proven stable it is merged into `master` and the topic branch is deleted. `next` and `seen` are rebuilt from `master` from time to time. You will not need this on a small team; it shows how far topic branches scale.

### Rerere: let Git repeat your conflict fixes

A maintainer who merges and rebases a lot settles the same conflict more than once. Git has a feature named [rerere](term:rerere), short for "reuse recorded resolution". Once it is switched on with the setting `rerere.enabled`, Git records how you resolved each conflict, and when the same conflict shows up again it applies your earlier fix by itself. The Hard conflicts lesson, in the History mastery module, shows it at work.

## Recap

- Try contributed work in a topic branch, never directly on `main`.
- `git log main..topic` lists the commits a branch would bring in; add `--no-merges` to hide merge commits and `-p` to see each change.
- `git diff main...topic` (three dots) shows what a merge would introduce, measured from the merge base. Two dots compare the two newest snapshots and show `main`'s own work backwards.
- `git cherry-pick <commit>` copies one commit's change onto your branch as a new commit with a new ID. The original stays where it was.
- When a pick stops on a conflict: fix the file, `git add` it, `git cherry-pick --continue`. `--abort` takes you back.
