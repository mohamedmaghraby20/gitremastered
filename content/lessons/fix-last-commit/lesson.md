---
id: fix-last-commit
title: "Fix the last commit (amend)"
module: undo-and-fix
bookSection: "2.4 Undoing Things"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things
bookSources:
  - vendor/progit2/book/02-git-basics/sections/undoing.asc
  - vendor/progit2/book/07-git-tools/sections/rewriting-history.asc
readFirst: [undo-basics]
---

You press Enter on a commit and see it at once: a typo in the message, or a file you forgot to add. You don't need a second commit called "oops". `git commit --amend` lets you redo the last commit, and this lesson shows how to use it and when to leave it alone.

## Must know

In the lesson [Unstage and discard changes](lesson:undo-basics) you fixed mistakes that were not committed yet. This lesson covers the next moment: the commit is made, and it is wrong in a small way.

Two mistakes happen to everyone, every week:

- **The message is wrong.** A typo, or a message that says the wrong thing.
- **The content is incomplete.** You forgot to stage a file, or you spot one more small fix that belongs in the same commit.

One option handles both. To [amend](term:amend) a commit means to replace your last commit with a corrected one.

### Fix the message

`git commit --amend -m "new message"` tells Git: make my last commit again, with this message.

Your practice project has a commit like that already, with the message "Add hompage". Leave it for the challenges at the end of this lesson, and make a commit of your own to practise on.

:::try-it
1. Create a file and stage it: `echo "Buy flour" > todo.txt`, then `git add todo.txt`. In the picture, a `todo.txt` sheet marked "new" appears in the working tree and slides into the staging area.
2. Commit it with a typo, on purpose: `git commit -m "Add todo lsit"`. In the picture, a new station appears on the history map, and the `branch main` tag and the `HEAD · you` pin move onto it.
3. Run `git log --oneline`. Git lists your commits, newest first, one per line. The top line shows the typo, and the short ID in front of it. Note that ID.
4. Fix the message: `git commit --amend -m "Add todo list"`.
5. Run `git log --oneline` again. The top line now reads "Add todo list". There are still three commits, not four. Look at the ID in front: it is a different one.
:::

Here is what that looks like in the terminal. Your IDs will differ:

```console
$ git log --oneline
78dda6e Add todo lsit
9436d29 Add hompage
d7e4d7b Add README
$ git commit --amend -m "Add todo list"
[main 10133ad] Add todo list
 Date: Thu Nov 26 20:50:53 2026 +0300
 1 file changed, 1 insertion(+)
 create mode 100644 todo.txt
$ git log --oneline
10133ad Add todo list
9436d29 Add hompage
d7e4d7b Add README
```

Git prints the same summary as for a normal commit, plus a `Date:` line. That is the date of your original commit, which the amended commit keeps.

The ID changed from `78dda6e` to `10133ad`. That small detail is the key to this whole lesson, and the next part explains it.

### What amend really does

"Amend" sounds like Git opens the old commit and corrects it. It does not. Git never changes a commit once it is made.

Instead, Git makes a **new commit** and puts it in the place of the old one. The new commit has the same parent as the old one (the **parent** is the commit that came just before). Then Git moves the branch to the new commit. The old commit is left behind, and no branch leads to it any more.

Before the amend:

:::graph
caption: "Before: main points at the commit with the typo"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add hompage
    parents: [A]
  - id: C
    message: Add todo lsit
    parents: [B]
branches:
  main: C
head: main
:::

After the amend:

:::graph
caption: "After: a new commit D replaces C. C still exists, but main no longer leads to it"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add hompage
    parents: [A]
  - id: C
    message: Add todo lsit
    parents: [B]
    faded: true
  - id: D
    message: Add todo list
    parents: [B]
branches:
  main: D
head: main
:::

The live picture next to the terminal shows the same thing. After step 4 of the Try-it, the old station stayed on the map, faded and dashed, and a new station appeared beside it with the `branch main` tag and the `HEAD · you` pin.

A new commit needs a new name, so it gets a new [commit ID](term:commit-id). What stays the same: your files, your earlier commits (`9436d29` and `d7e4d7b` did not change), and the original date.

The common wrong idea is "amend edits my commit". Amend replaces your commit. For a commit only you have, the difference does not matter. For a commit other people have, it matters a lot, as you will see below.

### Add a forgotten file

The second mistake is a commit that misses something. You wrote two files that belong together and committed only one.

The fix has two steps: stage what is missing, then amend. Git builds the new commit from the [staging area](term:staging-area), just like a normal commit, so anything you stage first becomes part of it.

`--no-edit` tells Git to keep the old message as it is. Without it (and without `-m`), Git opens the editor so you can change the message.

:::predict
question: "Your last commit has one file, todo.txt. You create contacts.txt, stage it, and run git commit --amend --no-edit. How many commits will git log show, and how many files will the newest one hold?"
answer: "Still three commits. The newest one now holds two files, todo.txt and contacts.txt, under the old message, and it has a new ID again."
:::

:::try-it
1. Create the forgotten file: `echo "Call the miller" > contacts.txt`. In the picture, a `contacts.txt` sheet marked "new" appears in the working tree.
2. Stage it: `git add contacts.txt`. The sheet slides into the staging area.
3. Run `git commit --amend --no-edit`. In the picture, the staging area empties, a new station takes over the `branch main` tag and the HEAD pin, and one more faded station is left behind.
4. Run `git show --stat --oneline HEAD`. This prints the newest commit with the list of files it changed: both `contacts.txt` and `todo.txt` are in it now.
:::

```console
$ git commit --amend --no-edit
[main 1417a77] Add todo list
 Date: Thu Nov 26 20:50:53 2026 +0300
 2 files changed, 2 insertions(+)
 create mode 100644 contacts.txt
 create mode 100644 todo.txt
$ git show --stat --oneline HEAD
1417a77 Add todo list
 contacts.txt | 1 +
 todo.txt     | 1 +
 2 files changed, 2 insertions(+)
```

The same two steps work for a small fix to a file that is already in the commit: edit the file, `git add` it, `git commit --amend --no-edit`.

If the extra change is big enough that the old message no longer describes the commit, change the message too: leave out `--no-edit` and use `-m`, or let the editor open.

### Amend without `-m`: the editor

Run `git commit --amend` with nothing else, and Git opens your text editor with the old message already filled in:

```console
Add todo list

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# Date:      Thu Nov 26 20:50:53 2026 +0300
#
# On branch main
# Changes to be committed:
#	new file:   contacts.txt
#	new file:   todo.txt
```

Change the first line, save the file and close the editor. Git makes the amended commit. This is the way to go for longer messages. For a one-line fix, `-m` is quicker.

The lines under "Changes to be committed" list everything the new commit will hold, so you can check it before you save.

### Take a file out of the last commit

Sometimes the last commit has too much: a file went in that should not be there, like a file with a password.

The idea is the same as before. Change the staging area to what the commit should hold, then amend.

```console
$ git rm --cached secrets.env
rm 'secrets.env'
$ git commit --amend --no-edit
[main cd860bc] Add contact page
 Date: Thu Nov 26 20:50:41 2026 +0300
 1 file changed, 1 insertion(+)
 create mode 100644 contact.html
```

`git rm --cached secrets.env` takes the file out of the staging area and keeps it on your disk. You met it in [Ignore files with .gitignore](lesson:ignoring-files). After the amend, the commit holds only `contact.html`, and `secrets.env` is an untracked file again. Add it to `.gitignore` so it does not slip in a second time.

:::careful
This only cleans up a commit that never left your computer. If the commit was already sent to a server, the password is out. Change the password; amending cannot take it back.
:::

### The rule: only amend commits that only you have

Soon you will share your commits with a team by **pushing** them: sending them to a shared server, where teammates may already have them. The Remotes module teaches that.

Remember what amend does: it replaces the commit with a new one that has a new ID. Now picture it after pushing:

1. You push commit `C`. A teammate downloads it and builds new work on top of it.
2. You amend. Your branch now has `D` in place of `C`.
3. The server and your teammate still have `C`. Your history and theirs no longer match, and Git refuses your next push.

Sorting that out costs the whole team time, and it can end with two versions of the same change in the history. So:

- **Not pushed yet:** amend freely. Nobody else has seen the old commit.
- **Already pushed:** do not amend. Make a new commit that fixes the problem. The lesson [Undo a pushed commit with revert](lesson:revert-a-commit) shows the safe way.

Pro Git puts it in one line: only amend commits that are still local and have not been pushed somewhere.

### Only the last commit

`--amend` reaches exactly one commit: the newest one on your branch. In the practice project, the typo in "Add hompage" was easy to fix while it was the last commit. After another commit on top, `--amend` would change that newer commit instead.

Older commits can be changed too, with a different tool. The lesson "Reword, squash, reorder, split" covers it. The same rule about pushed commits applies there.

### When it goes wrong

**You amended and the forgotten file is still missing.** There is no error message for this one. Amend takes what is staged. If you skipped `git add`, the new commit has the same content as the old one. Run `git status`: the file is still listed as untracked or modified. Stage it and amend again.

**The editor opened and you are stuck.** You ran `git commit --amend` without `-m` or `--no-edit`. In Git Bash the editor is often Vim. To keep the old message and leave: press `Esc`, type `:wq` and press Enter. [Status, stage, commit](lesson:three-areas) explains the editor in "When you forget -m".

```console
$ git commit --amend -m "First commit"
fatal: You have nothing to amend.
```

The repository has no commit yet, so there is nothing to replace. Make a normal commit with `git commit -m "..."`.

**You amended a commit you had already pushed.** Stop there. Do not try to force the push through. Ask a teammate before doing anything else, or read "Undo a pushed commit with revert" and the Remotes module first. Your work is not lost: both the old and the new commit are still on your computer.

## Under the hood

"Must know" said that amend makes a new commit and leaves the old one behind. This layer shows why Git cannot do it any other way, and where the old commit goes.

### Why the ID has to change

A commit's ID is a [checksum](term:checksum): a code Git computes from the commit's content, like a fingerprint. For a commit, the content is:

- the snapshot of your files,
- the message,
- the author and the author date,
- the committer and the commit date,
- the ID of the parent commit.

Change any one of these and the checksum comes out different. A different checksum is a different ID, and to Git a different ID is a different commit. So "changing a commit" is not possible. Git can only write a new commit and point the branch at it.

This is also why your earlier commits were safe during every Try-it. Amend wrote one new commit and moved one branch. Nothing else was touched.

### Two dates in one commit

Every commit stores two people and two dates. The **author** wrote the change; the **committer** recorded this exact commit. Usually they are the same person at the same moment. After an amend they differ:

```console
$ git log -1 --format=fuller
commit 1417a77d17e97d18bf082306f97ccc01c6ae9353
Author:     Practice Student <student@example.com>
AuthorDate: Thu Nov 26 20:50:53 2026 +0300
Commit:     Practice Student <student@example.com>
CommitDate: Thu Nov 26 20:51:56 2026 +0300

    Add todo list
```

`AuthorDate` is when you first made the commit. Amend keeps it. `CommitDate` is when you amended. `-1` limits the log to one commit, and `--format=fuller` shows both lines; the normal `git log` shows only the author date. That is the `Date:` line Git prints after every amend.

### Where the old commit goes

The replaced commit is not deleted. It stays in `.git/objects` with everything else Git has stored. It is only unreachable: no branch leads to it.

Git also keeps a diary of every place HEAD has pointed, called the [reflog](term:reflog). Each amend adds a line:

```console
$ git reflog
1417a77 HEAD@{0}: commit (amend): Add todo list
10133ad HEAD@{1}: commit (amend): Add todo list
78dda6e HEAD@{2}: commit: Add todo lsit
9436d29 HEAD@{3}: commit: Add hompage
d7e4d7b HEAD@{4}: commit (initial): Add README
```

Read it from the bottom up. Three normal commits, then two amends. `78dda6e` (the typo) and `10133ad` (one file) are the two commits your amends replaced. They are the faded stations in the picture.

`HEAD@{1}` means "where HEAD was one step ago". You can use it like an ID: `git show HEAD@{1}` prints the commit from before your last amend.

Git removes unreachable commits only after a long time (by default at least 30 days). Until then, an amend you regret can be taken back. The Advanced layer shows the command.

## Advanced

### Change the author

A commit made with the wrong name or email (a work project committed with your private address) can be fixed in two ways.

After correcting your settings with `git config`, tell Git to take the author from them again:

```console
$ git commit --amend --no-edit --reset-author
[main c6cfe76] Add contact page
 1 file changed, 1 insertion(+)
 create mode 100644 contact.html
```

`--reset-author` also sets the author date to now, which is why the `Date:` line is missing from the output.

To set another person as the author without touching your settings, name them:

```console
$ git commit --amend --no-edit --author="Ada Lovelace <ada@example.com>"
[main 806b4ba] Add contact page
 Author: Ada Lovelace <ada@example.com>
 Date: Thu Nov 26 20:50:41 2026 +0300
 1 file changed, 1 insertion(+)
 create mode 100644 contact.html
```

You stay the committer; `git log --format=fuller` shows both names.

### Change the date

`--date` sets the author date:

```console
$ git commit --amend --no-edit --date="2026-11-20T10:00:00"
[main 6227a25] Add contact page
 Date: Fri Nov 20 10:00:00 2026 +0300
 1 file changed, 1 insertion(+)
 create mode 100644 contact.html
```

`--date=now` is a handy short form for "today, this minute".

### Take an amend back

The commit from before the amend is one step back in the reflog. `git reset --hard HEAD@{1}` moves the branch back onto it:

```console
$ git reset --hard HEAD@{1}
HEAD is now at c6cfe76 Add contact page
```

:::careful
`git reset --hard` also throws away every change that is not committed. Run `git status` first and make sure the working tree is clean. The lesson [Reset demystified: the three trees](lesson:reset-demystified) explains this command in full.
:::

### Older commits: fixup

For a fix that belongs in an older commit, `git commit --fixup <commit-id>` records it as a small commit marked for that older one. A later step folds the two together. It is taught in "Reword, squash, reorder, split".

### An amend that changes nothing

Amend with nothing staged and the same message, and the new commit has the same files, message, author and parent as the old one. Only the commit date is new, so the ID still changes. Run it twice within the same second and even the ID stays the same, because every part of the content is identical. This shows the checksum at work: same content, same ID.

## Recap

- `git commit --amend -m "message"` replaces the last commit with one that has a new message.
- Forgot a file? `git add <file>`, then `git commit --amend --no-edit` puts it into the last commit and keeps the message.
- Amend makes a new commit with a new ID. The old one is left behind, off the branch, and stays in the reflog.
- Only amend commits that only you have. For a pushed commit, make a new commit that fixes it.
- `--amend` reaches the last commit only.
