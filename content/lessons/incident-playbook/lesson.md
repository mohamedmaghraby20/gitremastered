---
id: incident-playbook
title: "Incident playbook: wrong branch, botched rebase, force-push accident, broken merge"
module: recovery
bookSection: "7.8 Advanced Merging: Undoing Merges"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging#_undoing_merges
bookSources:
  - book/progit2/book/07-git-tools/sections/reset.asc
  - book/progit2/book/07-git-tools/sections/advanced-merging.asc
readFirst: [reset-demystified]
---

Three commits went to the wrong branch, a rebase swallowed half your work, or a merge landed that nobody wanted, and your stomach drops. This lesson is a calm playbook: the same first steps for every Git accident, then a short recipe for each of the common ones.

## Must know

The lesson [Reset demystified: the three trees](lesson:reset-demystified) gave you the tool that moves a branch, and the lesson [Recover lost commits with reflog and fsck](lesson:rescue-lost-work) showed that Git keeps commits long after no branch reaches them. This lesson puts both to work on real accidents.

We call such an accident an **incident**: the history, or a branch, is suddenly not what you expected. Almost every incident has the same shape. The commits are fine, and a label (a [branch](term:branch)) points at the wrong one. So almost every fix is the same too: find the right commit, and move the label.

### First steps in any incident

People lose work in the minute after the accident, not in the accident itself. They type three half-remembered commands in a hurry, and the third one is `git reset --hard` on a state they never looked at. So the first steps are the same every time, and none of them changes anything.

1. **Stop.** Take your hands off the keyboard. Nothing gets worse while you read.
2. **Run `git status`.** It tells you which branch you are on, whether an operation is waiting halfway (a merge, a rebase), and whether you have uncommitted changes. Uncommitted changes are the only work Git cannot get back, so know about them before anything else.
3. **Run `git log --oneline --graph --all`.** `--all` shows every branch, not only yours, and `--graph` draws how they connect. This is your map of where each label is now.
4. **Write down the IDs that matter.** Copy the [commit ID](term:commit-id) of where you are and of the commit you want into a note. An ID on paper cannot scroll away.
5. **Make a backup branch.** `git branch backup-main` puts a second label on the commit you are on. Whatever you try next, that label stays, and so do the commits under it.

:::definitions
- term: Backup branch
  area: repository
  text: "An extra branch you create on the current commit before a risky fix, like `backup-main`. It costs nothing, and it keeps today's state one `git reset --hard backup-main` away."
:::

The practice project on the right is a small shop app with five commits on `main`. The last three are about search and belong to the first challenge at the end. The Try-its below use files and branches of your own, and every challenge starts from a fresh copy.

:::try-it
1. Run `git status`. Git answers `On branch main` and `nothing to commit, working tree clean`: no operation is waiting and no uncommitted work is at risk.
2. Run `git log --oneline --graph --all`. Git lists five commits in one straight line, newest first, with "Add search results page" on top.
3. Run `git branch backup-main`. Git prints nothing. In the picture, a `branch backup-main` tag appears on the same station as `branch main`.
4. Run `git branch`. Both names are listed, and the star marks `main`, the branch you are still on.
:::

```console
$ git log --oneline --graph --all
* 5ec863b Add search results page
* 66120a8 Add search filters
* 9e14bec Add search box
* 1eb9031 Add cart
* 1d1fa6d Add README
$ git branch backup-main
$ git branch
  backup-main
* main
```

When the incident is over, delete the backup with `git branch -D backup-main`.

### Recipe 1: you committed on the wrong branch

You meant to start a new branch, forgot, and made your commits on `main`. The commits are good. They only sit under the wrong label.

**The commits belong on a new branch.** Two commands, in this order:

1. `git branch <new-name>` puts a new label on the commit you are on. Your commits are now on the new branch too.
2. `git reset --hard HEAD~1` moves `main` back one commit (`HEAD~3` for three commits).

:::graph
caption: "Before: Add wishlist was committed on main by mistake"
commits:
  - id: A
    message: Add search filters
  - id: B
    message: Add search results page
    parents: [A]
  - id: C
    message: Add wishlist
    parents: [B]
branches:
  main: C
head: main
:::

:::graph
caption: "After git branch wishlist and git reset --hard HEAD~1: the commit did not move, the labels did"
commits:
  - id: A
    message: Add search filters
  - id: B
    message: Add search results page
    parents: [A]
  - id: C
    message: Add wishlist
    parents: [B]
branches:
  main: B
  wishlist: C
head: main
:::

:::predict
question: "You run `git branch wishlist` and then `git reset --hard HEAD~1` on main. Is the commit \"Add wishlist\" lost, and which branch are you on afterwards?"
answer: "Nothing is lost: the branch `wishlist` still points at the commit. You are still on `main`, one commit back. `git branch` creates a label and does not switch to it."
:::

:::try-it
1. Make the mistake. Run `echo "Wishlist: coming soon" > wishlist.txt`, then `git add wishlist.txt`, then `git commit -m "Add wishlist"`. In the picture, a new station appears and the `branch main` tag moves onto it. The `branch backup-main` tag stays behind.
2. Run `git branch wishlist`. In the picture, a `branch wishlist` tag appears next to `branch main` on the newest station.
3. Run `git status`. It says `working tree clean`, so a hard reset has nothing uncommitted to destroy.
4. Run `git reset --hard HEAD~1`. Git prints `HEAD is now at …` with "Add search results page". In the picture, the `branch main` tag and the `HEAD · you` pin step back one station. The "Add wishlist" station stays solid, because `branch wishlist` is still on it.
5. Run `git log --oneline --graph --all`. "Add wishlist" is the top line, and it now belongs to `wishlist` alone.
:::

```console
$ git branch wishlist
$ git reset --hard HEAD~1
HEAD is now at 5ec863b Add search results page
$ git log --oneline --graph --all
* 1015164 Add wishlist
* 5ec863b Add search results page
* 66120a8 Add search filters
* 9e14bec Add search box
* 1eb9031 Add cart
* 1d1fa6d Add README
```

:::careful
The order matters. Create the branch first, reset second. If you reset first, no branch reaches the commits any more and you have to dig them out of the reflog. Also read `git status` before the reset: `--hard` overwrites uncommitted edits.
:::

**The commits belong on a branch that already exists.** Then a new label does not help: the commit has to be copied over. `git cherry-pick <commit>` tells Git: take the change that one commit made, and make a new commit with the same change on the branch I am on. The copy gets a new ID, because it has a different parent.

Here "Add contact link" was committed on `main`, and it belongs on the existing branch `footer`:

```console
$ git log --oneline --graph --all
* bd2eff2 Add footer
| * be50535 Add contact link
|/  
* c237d65 Add cart
* ec41e30 Add README
$ git switch footer
Switched to branch 'footer'
$ git cherry-pick main
[footer 223ebe6] Add contact link
 Date: Fri Nov 27 01:02:10 2026 +0300
 1 file changed, 1 insertion(+)
 create mode 100644 contact.txt
$ git switch main
Switched to branch 'main'
$ git reset --hard HEAD~1
HEAD is now at c237d65 Add cart
$ git log --oneline --graph --all
* 223ebe6 Add contact link
* bd2eff2 Add footer
* c237d65 Add cart
* ec41e30 Add README
```

`git cherry-pick main` means "the newest commit of `main`"; a commit ID works as well. Step three and four are the same clean-up as before: back on `main`, move it one commit back. The lesson "Bring in others' work" teaches cherry-pick in full.

**Nothing is committed yet.** This is the easy case. You edited files on the wrong branch but have not committed. Run `git switch -c <new-name>`: your uncommitted changes travel with you to the new branch, and you commit there.

**You already pushed the commits.** Then do not reset. Other people may have them. Undo each one on the wrong branch with `git revert`, as in the lesson [Undo a pushed commit with revert](lesson:revert-a-commit), after copying them to the right branch.

### Recipe 2: a rebase went wrong

A **rebase** takes the commits of your branch and replays them, one by one, on top of another commit. The result is a row of new commits with new IDs; the old ones are left behind. The lesson [Rebasing, and when not to](lesson:rebasing) teaches it. Things that go wrong: a conflict you resolved badly, commits dropped by a wrong option, or simply a rebase onto the wrong branch.

There are two moments, and each has its own way out.

**The rebase is still running.** `git status` says `rebase in progress`. Run `git rebase --abort`. Git puts the branch, the staging area and your files back exactly as they were before the rebase started.

**The rebase has finished.** The old commits are still in Git, and Git wrote down where your branch was. When a rebase starts, Git stores the old position of the branch in [`ORIG_HEAD`](term:orig-head), the same one-step memory that reset uses. So right after a bad rebase:

```console
$ git log --oneline -3
7817860 Add wishlist
87e1f42 Add contact page
5ec863b Add search results page
$ git reset --hard ORIG_HEAD
HEAD is now at 1015164 Add wishlist
$ git log --oneline -3
1015164 Add wishlist
5ec863b Add search results page
66120a8 Add search filters
```

Look at the IDs. After the rebase, "Add wishlist" was `7817860`, a copy sitting on top of "Add contact page". After the reset it is `1015164` again, the original, sitting on "Add search results page".

:::graph
caption: "After the rebase: wishlist points at a copy (D). The original (C) is on no branch, but still in Git"
commits:
  - id: A
    message: Add search results page
  - id: B
    message: Add contact page
    parents: [A]
  - id: C
    message: Add wishlist
    parents: [A]
    faded: true
  - id: D
    message: Add wishlist
    parents: [B]
branches:
  main: B
  wishlist: D
head: wishlist
:::

:::graph
caption: "After git reset --hard ORIG_HEAD: wishlist is back on the original commit"
commits:
  - id: A
    message: Add search results page
  - id: B
    message: Add contact page
    parents: [A]
  - id: C
    message: Add wishlist
    parents: [A]
branches:
  main: B
  wishlist: C
head: wishlist
:::

`ORIG_HEAD` remembers one move only. A later reset, merge or rebase overwrites it. If you did anything of that kind since the bad rebase, use the [reflog](term:reflog) instead. It keeps every step:

```console
$ git reflog -4
7817860 HEAD@{0}: rebase (finish): returning to refs/heads/wishlist
7817860 HEAD@{1}: rebase (pick): Add wishlist
87e1f42 HEAD@{2}: rebase (start): checkout main
1015164 HEAD@{3}: checkout: moving from main to wishlist
```

Read it from the bottom of the rebase upwards. The line `rebase (start)` is where the rebase began. The line right below it, `1015164`, is where you were just before. That is the ID to reset to: `git reset --hard 1015164`.

:::try-it
1. Give `main` a new commit. Run `echo "Contact: shop@example.com" > contact.txt`, then `git add contact.txt`, then `git commit -m "Add contact page"`. In the picture, a new station appears on the top row with `branch main`, and the "Add wishlist" station moves to a row below.
2. Run `git switch wishlist`, then `git log --oneline -1`. Note the ID in front of "Add wishlist".
3. Run `git rebase main`. Git prints `Successfully rebased and updated refs/heads/wishlist.` In the picture, a new "Add wishlist" station appears after "Add contact page" with the `branch wishlist` tag on it. The old "Add wishlist" station turns faded and dashed: no branch reaches it.
4. Pretend that was a mistake. Run `git reset --hard ORIG_HEAD`. Git prints `HEAD is now at …` with the ID you noted in step 2. In the picture, the `branch wishlist` tag jumps back to the old station, which turns solid again, and the copy turns faded.
5. Run `git reflog -5`. The top line is your reset, `reset: moving to ORIG_HEAD`, and the rebase lines are below it.
:::

:::careful
Undo a rebase this way only if you have not pushed the rebased branch. If the rebased commits are already on the server, teammates may have them, and you are in the force-push situation of Recipe 4.
:::

### Recipe 3: a merge that should not have happened

You merged a branch into `main` and it was the wrong branch, or too early. Pro Git gives two fixes, and which one you use depends on a single question: has anyone else got the merge?

**The merge is still running** (it stopped on a conflict): `git merge --abort` puts everything back.

**The merge is finished and only on your computer.** Move the branch back with reset. A [merge commit](term:merge-commit) is the newest commit of the branch, so one step back is enough:

```console
$ git merge --no-edit wishlist
Merge made by the 'ort' strategy.
 wishlist.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 wishlist.txt
$ git reset --hard HEAD~
HEAD is now at 87e1f42 Add contact page
```

`HEAD~` of a merge commit is its first parent: the commit `main` was on before the merge. The branch you merged is not touched and still has its commits.

:::careful
Reset throws away everything after the commit you go back to. If you made more commits on top of the merge, `git reset --hard` to before the merge loses those too. Pro Git names this as the second limit of the reset fix, next to "never on shared history". In both cases use the next fix.
:::

**The merge is pushed, or has good commits on top.** Add a commit that undoes it: `git revert -m 1 <merge commit>`. A plain `git revert` refuses a merge commit, because a merge has two parents and Git cannot guess which side to keep. `-m 1` answers that: parent number 1 is the main line (the branch you were on when you merged), keep it, and take out what the other side brought in.

```console
$ git revert --no-edit -m 1 HEAD
[main ee05ca1] Revert "Merge branch 'wishlist'"
 Date: Fri Nov 27 01:01:49 2026 +0300
 1 file changed, 1 deletion(-)
 delete mode 100644 wishlist.txt
$ git log --oneline --graph -5
* ee05ca1 Revert "Merge branch 'wishlist'"
*   0b42f4d Merge branch 'wishlist'
|\  
| * 1015164 Add wishlist
* | 87e1f42 Add contact page
|/  
* 5ec863b Add search results page
```

The merge commit `0b42f4d` is still in the history, and a new commit after it removes `wishlist.txt` again. Nobody's history breaks. When the merge is not the newest commit, name it by its ID in place of `HEAD`; `git log --oneline --merges` lists only merge commits, which makes it easy to find.

:::graph
caption: "After git revert -m 1: the merge (M) stays, and a new commit (R) undoes what it brought in"
commits:
  - id: A
    message: Add search results page
  - id: B
    message: Add contact page
    parents: [A]
  - id: C
    message: Add wishlist
    parents: [A]
  - id: M
    message: Merge branch 'wishlist'
    parents: [B, C]
  - id: R
    message: Revert "Merge branch 'wishlist'"
    parents: [M]
branches:
  main: R
  wishlist: C
head: main
:::

:::try-it
1. Run `git switch main`, then `git merge --no-edit wishlist`. Git prints `Merge made by the 'ort' strategy.` In the picture, a station `Merge branch 'wishlist'` appears on the top row, and tracks from both rows run into it.
2. Run `git revert HEAD`. Git refuses: `is a merge but no -m option was given`. Nothing changed.
3. Run `git revert --no-edit -m 1 HEAD`. In the picture, one more station appears, `Revert "Merge branch 'wishlist'"`, and the `branch main` tag moves onto it. The merge station stays where it is.
4. Run `ls`. The file `wishlist.txt` is gone from `main`. Run `git log --oneline --graph -5`: the merge and its revert are both listed.
:::

:::careful
After a reverted merge, Git still counts the old commits of that branch as merged. Merging the same branch again later brings in only its newer commits, and the reverted work stays out. The fix is in Advanced, under "Merging the branch again after a reverted merge".
:::

### Recipe 4: a force-push dropped teammates' commits

A normal `git push` is refused when the server has commits you do not have. A [force push](term:force-push) (`git push --force`) skips that check and makes the server's branch equal to yours. If a teammate pushed two commits a minute earlier, those two commits are no longer on the server's branch.

The push itself prints the evidence. Write these two IDs down:

```console
$ git push --force
To ../origin.git
 + 6c47547...ced829c main -> main (forced update)
```

The `+` and `(forced update)` say a branch was overwritten. `6c47547` is where the server's `main` was, and `ced829c` is where it is now. The dropped commits end at `6c47547`.

Those commits are gone from the server's branch, but a server is not the only place they exist. Every computer that made them or fetched them still has them. The recovery is to find one such computer and push the commits back:

1. **Tell the team at once, and ask everyone not to "clean up".** A teammate who runs `git reset --hard origin/main` to match the server moves their own branch off the lost commits. The copies on your teammates' computers are the rescue.
2. **Find someone who has the commits.** The best source is the person who made them: their local `main` still ends with them. After a `git fetch`, their `git status` shows their `main` two commits ahead of the server (the lost ones) and one behind (the forced one):

   ```console
   $ git status -sb
   ## main...origin/main [ahead 2, behind 1]
   ```

   The second source is anyone whose Git saw the server's branch before the accident. If they have not fetched since, their `origin/main` (the label that follows the server's branch) still points at the old commit. If they have, the reflog of `origin/main` has the old position one line down:

   ```console
   $ git reflog show origin/main
   ced829c refs/remotes/origin/main@{0}: fetch: forced-update
   6c47547 refs/remotes/origin/main@{1}: update by push
   ```

   `6c47547` is the commit from the push output. `git branch rescue 6c47547` puts a branch on it, and the commits are safe.
3. **Push them back, without force.** The person with the commits joins the two histories and pushes the result: on their `main`, `git merge origin/main` (the server's new commits meet the lost ones in a merge commit), then `git push`. From a `rescue` branch: `git merge rescue` on an up-to-date `main`, then `git push`.

After that the server has both: the commits that were dropped and the ones that were forced in. Preventing the accident is the subject of the lesson "Force-pushing safely": the option `--force-with-lease` refuses the push when the server has commits you have not seen.

### Recipe 5: you committed a file that should be ignored

A log file, an editor folder or build output was committed, and now every change to it shows up in `git status`. Adding the file to `.gitignore` is not enough: ignoring only affects files Git does not track yet, as the lesson [Ignore files with .gitignore](lesson:ignoring-files) explains. You have to stop tracking it too.

`git rm --cached <file>` removes the file from the staging area and keeps the real file in your folder. Then ignore it and commit both changes:

```console
$ git rm --cached app.log
rm 'app.log'
$ echo "app.log" >> .gitignore
$ git add .gitignore
$ git commit -m "Stop tracking app.log"
[main 7385e65] Stop tracking app.log
 2 files changed, 1 insertion(+), 1 deletion(-)
 create mode 100644 .gitignore
 delete mode 100644 app.log
```

`delete mode` means the file left the project's tracked files. It is still on your disk, and `git status` no longer mentions it. For a whole folder, use `git rm -r --cached <folder>`.

:::careful
This stops tracking from now on. The file is still in every older commit. For a log file that is fine. For a password or a key it is not: change the secret first, then follow the lesson [Remove a leaked secret or huge file from history](lesson:remove-sensitive-data). Also tell teammates: when they pull this commit, Git deletes the file from their folder, because for them it is a tracked file that was removed.
:::

### The playbook on one page

| Incident | Not shared yet | Already pushed |
|---|---|---|
| Commits on the wrong branch, new branch wanted | `git branch <name>`, then `git reset --hard HEAD~N` | Copy them over, then `git revert` them on the wrong branch |
| Commits on the wrong branch, existing branch wanted | `git switch <right>`, `git cherry-pick <id>`, back, `git reset --hard HEAD~N` | Same, with `git revert` in place of reset |
| Rebase went wrong, still running | `git rebase --abort` | |
| Rebase went wrong, finished | `git reset --hard ORIG_HEAD`, or the ID from `git reflog` | Treat it as Recipe 4 |
| Merge should not have happened | `git reset --hard HEAD~` | `git revert -m 1 <merge>` |
| Force-push dropped commits | | Find them on a teammate's computer, merge, push without force |
| A file that should be ignored was committed | `git rm --cached <file>`, `.gitignore`, commit | Same; a secret needs its own lesson |

Before every row: stop, `git status`, `git log --oneline --graph --all`, note the IDs, make a backup branch.

### When it goes wrong

**`ORIG_HEAD` took you somewhere else.**

```console
$ git reset --hard ORIG_HEAD
HEAD is now at 0b42f4d Merge branch 'wishlist'
```

You expected the commit from before your rebase and landed on a merge. `ORIG_HEAD` holds only the last big move, and a later merge or reset overwrote it. Nothing is lost. Run `git reflog`, find the line from before the operation you want to undo, and reset to that ID.

**Revert refuses the merge.**

```console
$ git revert HEAD
error: commit 0b42f4dd7665ffec24eb72f9ffb719c8dba4c8da is a merge but no -m option was given.
fatal: revert failed
```

A merge commit has two parents, and Git will not pick one for you. Add `-m 1` to keep the branch you merged into: `git revert -m 1 HEAD`.

**The cherry-pick stops on a conflict.**

```console
$ git cherry-pick main
Auto-merging cart.js
CONFLICT (content): Merge conflict in cart.js
error: could not apply 3608afd... Cart takes an item
hint: After resolving the conflicts, mark them with
hint: "git add/rm <pathspec>", then run
hint: "git cherry-pick --continue".
hint: You can instead skip this commit with "git cherry-pick --skip".
hint: To abort and get back to the state before "git cherry-pick",
hint: run "git cherry-pick --abort".
```

The commit you are copying changed a line that the target branch changed too. This is an ordinary [merge conflict](term:merge-conflict). Fix the file, `git add` it and run `git cherry-pick --continue`, or run `git cherry-pick --abort` to go back to before the cherry-pick.

## Under the hood

Every recipe above moved a label or added a commit, and none of them repaired a commit. This layer shows why that is always enough, and where Git keeps the notes the recipes rely on.

### Why the recipes work: commits do not change

A commit is never edited after it is made. A rebase does not move your commits: it makes copies and points the branch at the copies. A reset does not delete commits: it writes a different ID into the branch's small file under `.git/refs/heads/`. A force push does the same to a branch file on the server.

So after an incident the commits you want are still in the repository, on your computer or on someone else's. What is missing is a label that leads to them. The two questions of every recovery are: what is the ID, and which label should point at it?

That is also why a backup branch works. A branch is a file with one ID in it. As long as that file exists, Git keeps the commit and everything before it.

### Where the notes are: reflogs and ORIG_HEAD

Git keeps one reflog for HEAD and one for each branch, as plain text files:

```console
$ ls .git/logs
HEAD
refs
$ ls .git/logs/refs/heads
backup-main
main
wishlist
```

`git reflog` reads the HEAD file: every commit, switch, reset, merge and rebase step. `git reflog show <branch>` reads one branch's file, which is shorter and often easier in an incident, because it skips the switching around:

```console
$ git reflog show wishlist
7817860 wishlist@{0}: rebase (finish): refs/heads/wishlist onto 87e1f42f5c1c4ffd00c94ab04da5575d7c23bb3b
1015164 wishlist@{1}: branch: Created from main
```

One line for the whole rebase. `wishlist@{1}` is the branch one move ago, so `git reset --hard wishlist@{1}` undoes that rebase without copying an ID.

`ORIG_HEAD` is a single file, `.git/ORIG_HEAD`, holding one ID. Reset, merge and rebase each write the branch's old position into it before they move the branch. It is the quickest undo and the easiest to overwrite.

Two limits follow from where these files live:

- **Reflogs are local.** They are never pushed and never cloned. That is why the force-push recovery needs a teammate's computer: the server's own history of that branch is not something you can fetch.
- **Reflogs expire.** By default Git drops entries after 90 days, and after 30 days for commits no branch reaches any more. An incident is best fixed the week it happens.

### Parent 1 and parent 2

`-m 1` is about the order of a merge commit's parents. Ask Git for them:

```console
$ git show --no-patch --format="%h %s%nparents: %p" 0b42f4d
0b42f4d Merge branch 'wishlist'
parents: 87e1f42 1015164
```

The first parent, `87e1f42`, is "Add contact page": the commit `main` was on when you ran `git merge`. The second, `1015164`, is "Add wishlist": the newest commit of the branch you merged in. The order is always this: first where you stood, second what you brought in.

`git revert -m 1` compares the merge with parent 1 and undoes that difference, which is exactly what the other branch contributed. Pro Git puts it this way: the new commit has the same content as the first parent, as if the merge never happened. (When later commits sit on top, their changes are kept, and only the merge's part is taken out.) `-m 2` would do the opposite: keep the merged branch's side and remove what `main` had done since the two split. That is almost never what you want.

`HEAD~` follows the first parent too, which is why `git reset --hard HEAD~` on a fresh merge lands on the commit `main` had before, and not somewhere on the merged branch.

## Advanced

The recipes cover the usual incidents. These topics are for the rarer follow-ups.

### Merging the branch again after a reverted merge

Pro Git warns about this one. You reverted a merge, the branch got fixed, and now you want it merged for real. Git says there is nothing to do:

```console
$ git merge wishlist
Already up to date.
```

The old commits of `wishlist` are still in `main`'s history, behind the merge commit, so Git sees nothing new. If `wishlist` gets a new commit that adds `share.txt`, a merge brings in that commit alone:

```console
$ git merge --no-edit wishlist
Merge made by the 'ort' strategy.
 share.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 share.txt
$ ls
README.md
contact.txt
share.txt
```

`wishlist.txt`, from the reverted part, is still missing. The way around it is to undo the revert first, then merge:

```console
$ git revert --no-edit HEAD
[main 20266a6] Reapply "Merge branch 'wishlist'"
 Date: Fri Nov 27 01:02:12 2026 +0300
 1 file changed, 1 insertion(+)
 create mode 100644 wishlist.txt
$ git merge --no-edit wishlist
Merge made by the 'ort' strategy.
 share.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 share.txt
$ ls
README.md
contact.txt
share.txt
wishlist.txt
```

Here `HEAD` was the revert commit. Reverting it brings the old work back (Git names the commit `Reapply …`; older versions wrote `Revert "Revert …"`, as in the book), and the merge then adds the new work.

### Moving a branch you are not on

`git reset` moves the branch you are on. `git branch -f <branch> <commit>` moves any other branch, without switching to it. It gives a second way to do Recipe 1: switch away first, then pull `main` back.

```console
$ git switch -c wishlist
$ git branch -f main HEAD~1
```

Git refuses to do this to the branch you are on, since your files would no longer match it ("worktree" in the message is your project folder):

```console
$ git branch -f main HEAD
fatal: cannot force update the branch 'main' used by worktree at 'C:/practice/project'
```

### Finding the moment by time

In a long reflog, the time of the accident is often easier to find than its message. `--date=relative` swaps the counter for a time:

```console
$ git reflog -3 --date=relative
5cb855d HEAD@{0 seconds ago}: checkout: moving from wishlist to main
0b42f4d HEAD@{2 minutes ago}: reset: moving to ORIG_HEAD
7ffaec5 HEAD@{2 minutes ago}: checkout: moving from main to wishlist
```

You can also name a time directly: `main@{yesterday}` or `main@{2.hours.ago}` is where `main` pointed then, according to its reflog. The lesson [Point at any commit: HEAD~2, ranges, reflog names](lesson:revision-selection) covers these names.

### The amend variant of Recipe 5

If the unwanted file went in with your last commit, and that commit is not pushed, you can leave no trace of it: `git rm --cached app.log`, add the `.gitignore` line, `git add .gitignore`, then `git commit --amend --no-edit`. The replaced commit never held the file as far as the branch's history shows. The lesson [Fix the last commit (amend)](lesson:fix-last-commit) explains why this is for unshared commits only.

## Recap

- In any incident: stop, `git status`, `git log --oneline --graph --all`, write down the IDs, `git branch backup-<name>`. Then fix.
- Wrong branch: `git branch <new>` first, then `git reset --hard HEAD~N`; for an existing branch, `git cherry-pick` the commits there.
- Bad rebase: `git rebase --abort` while it runs; afterwards `git reset --hard ORIG_HEAD`, or the ID below `rebase (start)` in `git reflog`.
- Bad merge: `git reset --hard HEAD~` if only you have it and nothing is on top; `git revert -m 1 <merge>` if it is pushed or has later commits.
- Dropped by a force push: the commits live on a teammate's computer. Find them, merge, push without force.
