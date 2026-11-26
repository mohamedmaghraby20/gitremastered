---
id: advanced-merging
title: "Hard conflicts, merge strategies and rerere"
module: history-mastery
bookSection: "7.8 Advanced Merging, 7.9 Rerere"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging
bookSources:
  - book/progit2/book/07-git-tools/sections/advanced-merging.asc
  - book/progit2/book/07-git-tools/sections/subtree-merges.asc
  - book/progit2/book/07-git-tools/sections/rerere.asc
readFirst: [branch-and-merge]
---

A branch lived for three weeks, and merging it stops on a conflict you do not understand: you cannot tell what the line used to say, who changed it, or why. This lesson gives you the tools to see all of that, to let Git settle the easy conflicts by a rule, to take a bad merge back, and to never solve the same conflict twice.

## Must know

In [Branch, merge, and fix conflicts](lesson:branch-and-merge) you met a [merge conflict](term:merge-conflict): both branches changed the same lines, Git stopped, you edited the file, staged it and committed. That is enough for a one-line conflict you wrote yourself. This lesson is for the conflict where you need more information before you can decide.

### Two habits that keep conflicts small

Pro Git opens this topic with two pieces of advice, and both cost nothing.

- **Merge often.** A branch that takes in `main` every few days meets small conflicts one at a time. A branch that waits three weeks meets them all at once.
- **Start from a clean working tree.** Before a merge that may conflict, commit your work or put it away with a [stash](term:stash) (the lesson [Stash unfinished work, clean the folder](lesson:stash-and-clean)). Then everything you try during the merge can be undone, because nothing of yours is mixed into it.

### The practice project

The terminal on the right opens in a small recipe collection. Run `git log --oneline --graph --all` there:

```console
$ git log --oneline --graph --all
* 59d57a9 Add the frying step
| * 6431167 Add blueberries
|/
* f51454d Add pancake recipe
```

`main` and a branch named `frying` each added a line to `pancakes.txt`, at the same spot. Merging them is the first challenge at the end of this lesson, so leave `frying` alone for now. The Try-its below use a file and a branch of their own. (Your commit IDs will differ from the ones printed here.)

### A conflict to practise on

Build a conflict that looks like a real one: the other branch has two commits, and only one of them clashes with yours.

:::try-it
1. Create a recipe and commit it: `printf 'Boil the water\nSteep for 3 minutes\nServe hot\n' > tea.txt`, then `git add tea.txt`, then `git commit -m "Add tea recipe"`. In the picture, a new station appears on the map with the `branch main` tag on it.
2. Run `git switch -c try-strong`. Change the second line: `printf 'Boil the water\nSteep for 5 minutes\nServe hot\n' > tea.txt`, then `git commit -am "Steep the tea longer"`. In the picture, a station appears with the `branch try-strong` tag on it.
3. Still on `try-strong`, add a fourth line: `echo "Add lemon" >> tea.txt`, then `git commit -am "Add lemon"`. The `branch try-strong` tag moves one station further.
4. Run `git switch main`. Change the same second line in another way: `printf 'Boil the water\nSteep for 3 minutes with the lid on\nServe hot\n' > tea.txt`, then `git commit -am "Keep the lid on"`. In the picture, the two branches now run on two rows.
5. Run `git merge try-strong`. Git prints `CONFLICT (content): Merge conflict in tea.txt`. In the picture, a banner reads "Merge stopped: 1 file has a conflict" and the `tea.txt` sheet is marked `conflict`.
6. Run `cat tea.txt`. The second line is inside [conflict markers](term:conflict-marker). The line `Add lemon` is below them, with no markers: Git merged that part by itself.
:::

```console
$ cat tea.txt
Boil the water
<<<<<<< HEAD
Steep for 3 minutes with the lid on
=======
Steep for 5 minutes
>>>>>>> try-strong
Serve hot
Add lemon
```

Leave the merge stopped like this. The next four parts each show one tool, and the Try-it after them uses all four on this conflict.

### Back out and think: `git merge --abort`

`git merge --abort` tells Git: stop this merge and put my files back as they were before I started it.

```console
$ git status -sb
## main
UU tea.txt
$ git merge --abort
$ git status -sb
## main
```

`-sb` is the short form of `git status` with the branch name on top. `UU` means "unmerged, both sides changed it". After the abort the line is gone and `tea.txt` reads as it did on `main`.

You met `--abort` in the merge lesson as the way back. Here it becomes a working tool: when a merge surprises you, abort, look at both branches calmly, and merge again with a better plan. The conflict comes back exactly the same, so you lose nothing by backing out.

:::careful
`--abort` restores a clean working tree perfectly. If you started the merge with uncommitted edits in the files it touches, Git may not be able to bring those edits back. That is the reason for the "start clean" habit.
:::

### See what the line said before: the base in the markers

The markers show two versions, yours and theirs. The question they leave open is the one that matters most: what did the line say before either of you touched it? That version comes from the [merge base](term:merge-base), the last commit both branches share.

`git restore --conflict=diff3 <file>` tells Git: write the conflict into this file again, and this time include the base.

```console
$ git restore --conflict=diff3 tea.txt
$ cat tea.txt
Boil the water
<<<<<<< ours
Steep for 3 minutes with the lid on
||||||| base
Steep for 3 minutes
=======
Steep for 5 minutes
>>>>>>> theirs
Serve hot
Add lemon
```

Read it in three parts now. **ours** is the branch you are on. **base** is the line as it was. **theirs** is the branch you are merging in.

With the base in view, each side's intent is plain. We added "with the lid on" and left the time alone. They changed 3 to 5 and added nothing. The two changes do not fight at all, and the right line has both: `Steep for 5 minutes with the lid on`.

Two more things this command does:

- It throws away whatever you had typed into the file so far. That is useful when a resolution went wrong and you want the markers back to start over. `git restore --merge <file>` does the same with the normal two-part markers.
- It touches only that one file. Other files you already resolved stay resolved.

To get the base in every future conflict without asking, set it once in this repository:

```console
$ git config merge.conflictStyle zdiff3
```

`zdiff3` is `diff3` with one tidy-up: lines that both sides share at the start or end of the block are moved outside the markers, so the block is shorter.

:::compare
today: "`git restore --conflict=diff3 tea.txt` rewrites the markers with the base, and `merge.conflictStyle zdiff3` makes that the default (zdiff3 came with Git 2.35)."
book: "Pro Git writes `git checkout --conflict=diff3 hello.rb` and sets `merge.conflictstyle diff3`. Both still work; `git checkout` also prints `Recreated 1 merge conflict`."
:::

### Find out why they changed it: `git log --merge`

Sometimes the base is not enough, and you need the other person's reason. `git log --merge` tells Git: show me only the commits, from both branches, that touched a file that is in conflict right now.

```console
$ git log --merge --oneline --left-right
< b6396e6 Keep the lid on
> 5b7d1ac Add lemon
> 949f67e Steep the tea longer
```

`--left-right` adds the arrow in front. `<` marks a commit from your side and `>` a commit from the side you are merging in. Every other commit on either branch, the ones that touched other files, is left out. On a long-lived branch that turns two hundred commits into the three that matter.

Add `-p` and Git prints each of those commits with its [diff](term:diff), limited to the conflicted files. The commit messages tell you why, the diffs tell you exactly what.

### Take one whole side of a file

Some conflicts need no mixing. An image cannot be merged line by line. A file that one branch rewrote from top to bottom is simply the new version.

```console
$ git restore --theirs tea.txt
$ git restore --ours tea.txt
```

`--theirs` writes the file as it is on the branch you are merging in. `--ours` writes it as it is on the branch you are on. Then you run `git add` on the file, as after any resolution.

:::careful
Either option replaces the whole file, including the parts Git had merged without trouble. After `git restore --ours tea.txt` the line `Add lemon` is gone from the file, though nobody argued about it. Use these two only when one side's file is right from the first line to the last.
:::

:::compare
today: "`git restore --ours <file>` and `git restore --theirs <file>` take one side of a conflicted file."
book: "Pro Git writes `git checkout --ours <file>` and `git checkout --theirs <file>`, which do the same."
:::

### Check your resolution before you commit

While a merge is stopped, `git diff` shows only the files still in conflict. Run it after you edit a file and before you stage it, and it shows your resolution against both sides at once. This layout is called a [combined diff](term:combined-diff).

```console
$ git diff
diff --cc tea.txt
index 25a1011,a02c899..0000000
--- a/tea.txt
+++ b/tea.txt
@@@ -1,3 -1,4 +1,4 @@@
  Boil the water
- Steep for 3 minutes with the lid on
 -Steep for 5 minutes
++Steep for 5 minutes with the lid on
  Serve hot
+ Add lemon
```

A normal diff has one column of `+` and `-` signs. This one has two. The first column compares your file with **ours**, the second compares it with **theirs**.

| Line starts with | Meaning |
|---|---|
| `- ` (minus in column 1) | Ours had this line; your file does not |
| ` -` (minus in column 2) | Theirs had this line; your file does not |
| `++` | Your file has this line and neither side had it: you wrote it while resolving |
| `+ ` (plus in column 1) | New compared with ours, so it came from their side |
| two spaces | The same everywhere |

Read the example with that table: our line and their line are both gone, one new line replaces them, and `Add lemon` came in from their side. That is the resolution you meant. A stray `++<<<<<<<` here would be a marker you forgot.

Now use the four tools on your stopped merge.

:::try-it
1. Run `git merge --abort`, then `cat tea.txt`. The markers are gone and the second line reads `Steep for 3 minutes with the lid on`. In the picture, the banner disappears and the `tea.txt` sheet loses its `conflict` mark.
2. Run `git merge try-strong` again. The same conflict returns, and so does the banner in the picture.
3. Run `git restore --conflict=diff3 tea.txt`, then `cat tea.txt`. A third part appears between `|||||||` and `=======`: the line as it was in the base, `Steep for 3 minutes`.
4. Run `git log --merge --oneline --left-right`. Git lists one commit with `<` (yours) and two with `>` (theirs), the three commits that touched `tea.txt`.
5. Write the resolution: `printf 'Boil the water\nSteep for 5 minutes with the lid on\nServe hot\nAdd lemon\n' > tea.txt`. This replaces the whole file, markers included. In a real project you would do this in your editor.
6. Run `git diff`. Git prints the combined diff shown above. Find the `++` line: that is the line you wrote.
7. Run `git add tea.txt`. In the picture, the `tea.txt` sheet slides into the staging area and loses its `conflict` mark.
8. Run `git commit --no-edit`. In the picture, a station with the message `Merge branch 'try-strong'` joins the two rows, and the banner is gone.
:::

### Let Git settle conflicts by a rule

Every tool so far helps you decide by hand. For some merges you already know the answer for every conflict, and you can hand Git the rule when you start the merge. The rule goes after `-X`.

| You run | The rule |
|---|---|
| `git merge -Xours <branch>` | Where the two sides conflict, keep our lines |
| `git merge -Xtheirs <branch>` | Where the two sides conflict, keep their lines |
| `git merge -Xignore-space-change <branch>` | Do not count a line as changed when only the amount of whitespace in it changed |

**`-Xours` and `-Xtheirs`** only decide the conflicts. Everything that merges without trouble is still merged, from both sides. Git writes no markers and makes the merge commit straight away.

:::predict
question: "In the tea example, main changed line 2 to \"Steep for 3 minutes with the lid on\". try-strong changed line 2 to \"Steep for 5 minutes\" and added a new line, \"Add lemon\". What does tea.txt hold after git merge -Xours try-strong?"
answer: "Line 2 is ours, \"Steep for 3 minutes with the lid on\", because that line was in conflict and the rule says ours wins. \"Add lemon\" is in the file too: it was never in conflict, so Git merged it as always. -Xours does not mean \"ignore their branch\"."
:::

```console
$ git merge -Xours try-strong --no-edit
Auto-merging tea.txt
Merge made by the 'ort' strategy.
 tea.txt | 1 +
 1 file changed, 1 insertion(+)
$ cat tea.txt
Boil the water
Steep for 3 minutes with the lid on
Serve hot
Add lemon
```

Use these when one side has a clear right to win, for example when your team agreed that the release branch wins every clash. Do not use them to make a conflict "go away": Git drops the losing lines without showing them to you.

**`-Xignore-space-change`** is for a different trouble. Whitespace is the characters you do not see: spaces, tabs, and the invisible characters that end a line. When someone re-indents a file, every line changes for Git, though no word did. If you also changed a line in that file, the whole file conflicts:

```console
$ git merge try-indent
Auto-merging cake.txt
CONFLICT (content): Merge conflict in cake.txt
Automatic merge failed; fix conflicts and then commit the result.
$ cat cake.txt
Cake
<<<<<<< HEAD
  Mix the batter
  Bake for 40 minutes
  Let it cool
=======
    Mix the batter
    Bake for 30 minutes
    Let it cool
    Add icing
>>>>>>> try-indent
```

Pro Git's sign for this case: every line is removed on one side and added again on the other, and the words look the same. Here `main` changed 30 to 40, and `try-indent` moved every line from two spaces to four and added the icing line. Abort, and merge again with the rule:

```console
$ git merge --abort
$ git merge -Xignore-space-change try-indent --no-edit
Auto-merging cake.txt
Merge made by the 'ort' strategy.
 cake.txt | 1 +
 1 file changed, 1 insertion(+)
```

With the spacing ignored, the only real changes were ours to line 3 and their new line, and those do not conflict. One thing to check afterwards: Git kept our spacing on the old lines and their spacing on the new one, so the file now has both indents. Tidy it in a commit of its own.

`-Xignore-all-space` goes further and ignores whitespace completely, even where one side has spaces and the other has none.

### Take a merge back

Sometimes the merge went through and was a mistake: wrong branch, or it broke the build. How you take it back depends on one question. Has anyone else got this merge commit yet?

**Only you have it: move the branch back.** `git reset --hard HEAD~` moves your branch to the commit before the merge. `HEAD~` means "the first parent of the commit I am on", and the first parent of a [merge commit](term:merge-commit) is where your branch was before the merge.

```console
$ git reset --hard HEAD~
HEAD is now at b6396e6 Keep the lid on
```

:::graph
caption: "After git reset --hard HEAD~: main is back on B. The merge commit M is no longer in any branch; try-strong did not move."
commits:
  - id: A
    message: Add tea recipe
  - id: B
    message: Keep the lid on
    parents: [A]
  - id: C
    message: Steep the tea longer
    parents: [A]
  - id: D
    message: Add lemon
    parents: [C]
  - id: M
    message: Merge branch 'try-strong'
    parents: [B, D]
    faded: true
branches:
  main: B
  try-strong: D
head: main
:::

`--hard` also throws away uncommitted edits, so run `git status` first. And if you committed anything after the merge, this is the wrong tool: those commits would go too. The lesson [Reset demystified: the three trees](lesson:reset-demystified) explains the command in full.

**Others have it: add a commit that undoes it.** Moving a branch back rewrites history that other people already built on. For a shared merge, [revert](term:revert) it instead: `git revert -m 1 HEAD` adds a new commit that takes out everything the merge brought in.

```console
$ git revert -m 1 HEAD --no-edit
[main 331a572] Revert "Merge branch 'try-strong'"
 Date: Fri Nov 27 01:03:40 2026 +0300
 1 file changed, 1 insertion(+), 2 deletions(-)
```

:::graph
caption: "After git revert -m 1 HEAD: the merge M stays in history. R is a new commit whose files look like B again."
commits:
  - id: B
    message: Keep the lid on
  - id: D
    message: Add lemon
  - id: M
    message: Merge branch 'try-strong'
    parents: [B, D]
  - id: R
    message: Revert "Merge branch 'try-strong'"
    parents: [M]
branches:
  main: R
  try-strong: D
head: main
:::

A merge has two parents, and `-m 1` says which one to keep: parent 1, the branch you were on. The lesson [Undo a pushed commit with revert](lesson:revert-a-commit) covers `-m` in its Advanced part. One trap comes with it, and it is in "When it goes wrong" below.

### Stop solving the same conflict twice: rerere

Look at what you did in the last Try-it: you worked out the right tea line. If you take that merge back and merge again next week, Git stops on the same conflict and you work it out again. On a long-lived branch that happens every time you do a trial merge.

[Rerere](term:rerere) stands for "reuse recorded resolution". It tells Git: remember how I resolved each conflict, and when the very same conflict shows up again, resolve it the same way for me. It is off until you turn it on:

```console
$ git config rerere.enabled true
```

This turns it on for this repository. From then on, a merge that stops says one line more:

```console
$ git merge try-strong
Auto-merging tea.txt
CONFLICT (content): Merge conflict in tea.txt
Recorded preimage for 'tea.txt'
Automatic merge failed; fix conflicts and then commit the result.
```

`Recorded preimage` means: Git made a note of this conflict as it looks before you resolve it. You resolve it as always. When you commit, Git notes the other half:

```console
$ git commit --no-edit
Recorded resolution for 'tea.txt'.
[main 758f23b] Merge branch 'try-strong'
```

:::predict
question: "rerere has recorded your resolution of the tea.txt conflict. You undo the merge with git reset --hard HEAD~ and run git merge try-strong again. Does the merge finish by itself?"
answer: "No. Git still prints CONFLICT and stops, and tea.txt is still listed as unmerged. But the file already holds your resolution, with no markers: Git prints \"Resolved 'tea.txt' using previous resolution.\" You only check the file, run git add and commit. rerere fills in the answer; it leaves the last word to you."
:::

```console
$ git merge try-strong
Auto-merging tea.txt
CONFLICT (content): Merge conflict in tea.txt
Resolved 'tea.txt' using previous resolution.
Automatic merge failed; fix conflicts and then commit the result.
$ cat tea.txt
Boil the water
Steep for 5 minutes with the lid on
Serve hot
Add lemon
```

:::try-it
1. Run `git config rerere.enabled true`. Nothing is printed; the setting is saved for this repository.
2. Take back the merge from the last Try-it: `git reset --hard HEAD~`. Git prints `HEAD is now at …  Keep the lid on`. In the picture, the merge station leaves the map and the `branch main` tag is back on `Keep the lid on`.
3. Run `git merge try-strong`. The conflict returns, and Git prints the new line `Recorded preimage for 'tea.txt'`.
4. Resolve it once more: `printf 'Boil the water\nSteep for 5 minutes with the lid on\nServe hot\nAdd lemon\n' > tea.txt`, then `git add tea.txt`, then `git commit --no-edit`. Git prints `Recorded resolution for 'tea.txt'.` In the picture, the merge station is back.
5. Take the merge back again: `git reset --hard HEAD~`. The merge station leaves the map a second time.
6. Run `git merge try-strong`. Git prints `Resolved 'tea.txt' using previous resolution.` In the picture, the banner still says the merge stopped, and the `tea.txt` sheet is still marked `conflict`.
7. Run `cat tea.txt`. The file has no markers and line 2 reads `Steep for 5 minutes with the lid on`: your resolution, written by Git.
8. Run `git add tea.txt`, then `git commit --no-edit`. In the picture, the merge station appears for the third time, and this time you typed no resolution.
:::

Pro Git names the jobs where this pays off: trial merges of a long-lived branch that you back out of until the branch is ready, a branch you merged and now want to rebase instead (the lesson "Rebasing, and when not to"), and a test branch that you rebuild from several feature branches again and again.

### When it goes wrong

```console
$ git merge --abort
fatal: There is no merge to abort (MERGE_HEAD missing).
```

No merge is stopped right now: it already finished, or it never started. `--abort` only works while a merge waits for you. To take back a finished merge, see "Take a merge back" above.

```console
$ git commit -m "Merge try-strong"
error: Committing is not possible because you have unmerged files.
hint: Fix them up in the work tree, and then use 'git add/rm <file>'
hint: as appropriate to mark resolution and make a commit.
fatal: Exiting because of an unresolved conflict.
U	tea.txt
```

A file is still marked as unmerged. This one catches people right after rerere printed `Resolved 'tea.txt' using previous resolution.`: the file looks finished, but Git waits for you to confirm it. Check the file, run `git add tea.txt`, then commit.

```console
$ git revert HEAD
error: commit 5b45e60d6aa9aad4aa25827ce6dddf54dd490e60 is a merge but no -m option was given.
fatal: revert failed
```

You tried to revert a merge commit, and Git cannot guess which of its two parents is the side to keep. Say it: `git revert -m 1 HEAD`.

```console
$ git merge try-strong
Already up to date.
```

You reverted a merge earlier, and now you want the branch after all. Git answers that there is nothing to merge, because the branch's commits are still in your history: the revert undid their changes but did not remove the commits. The way through is to revert the revert commit, then merge the branch again to pick up anything newer. The Advanced part has the steps.

## Under the hood

Must know gave you tools that show the base, take one side, and replay an old resolution. All of them read from two places inside `.git`. This layer shows both, so that the tools stop looking like magic.

### The staging area holds three versions of a conflicted file

While a merge is stopped, the [staging area](term:staging-area) keeps three copies of each conflicted file, under the numbers 1, 2 and 3. The lesson on merging showed them with `git ls-files -u`. You can print each one with `git show` and a colon form:

```console
$ git show :1:tea.txt
Boil the water
Steep for 3 minutes
Serve hot
$ git show :2:tea.txt
Boil the water
Steep for 3 minutes with the lid on
Serve hot
$ git show :3:tea.txt
Boil the water
Steep for 5 minutes
Serve hot
Add lemon
```

| Number | Version | Used by |
|---|---|---|
| `:1:` | The base | The middle part of the `diff3` markers |
| `:2:` | Ours | `git restore --ours`, the first column of the combined diff |
| `:3:` | Theirs | `git restore --theirs`, the second column of the combined diff |

So `git restore --theirs tea.txt` is no special merge feature. It copies entry 3 into your working tree. And `git restore --conflict=diff3` builds the markers again from the three entries, which is why it works even after you have overwritten the file.

`git add tea.txt` replaces the three entries with one, and from that moment these commands have nothing left to read for that file. That is the practical reason to look before you stage.

Pro Git uses the three copies for one more trick: save each to a file (`git show :1:tea.txt > tea.base.txt` and so on), repair one of them with a script, and merge just that file again by hand. The Advanced part shows it.

### Strategy and strategy option

The line `Merge made by the 'ort' strategy.` names the [merge strategy](term:merge-strategy): the method Git uses to combine two branches. `ort` is the default, and it is the three-way merge you know.

Two flags sound alike and work at different levels:

| Flag | What it is | Example |
|---|---|---|
| `-X<option>` | A setting passed to the strategy in use. The merge is still a real three-way merge | `-Xours`, `-Xignore-space-change` |
| `-s <strategy>` | A different strategy altogether | `-s ours` |

`-Xours` merges both sides and lets ours win the conflicts. `-s ours` does not look at the other branch's files at all. The Advanced part shows what that is for.

### A merge commit remembers how the conflict was resolved

The combined diff is not only for a stopped merge. `git show` on a merge commit prints the same two-column layout for every file that needed a hand resolution:

```console
$ git show HEAD
commit 758f23b735705575c2abac8b1c391c0ecf55d071
Merge: b6396e6 5b7d1ac
Author: Practice Student <student@example.com>
Date:   Fri Nov 27 01:03:40 2026 +0300

    Merge branch 'try-strong'

    # Conflicts:
    #       tea.txt

diff --cc tea.txt
index 25a1011,a02c899..7a37ad6
--- a/tea.txt
+++ b/tea.txt
@@@ -1,3 -1,4 +1,4 @@@
  Boil the water
- Steep for 3 minutes with the lid on
 -Steep for 5 minutes
++Steep for 5 minutes with the lid on
  Serve hot
+ Add lemon
```

The `Merge:` line names the two parents, in order. The `# Conflicts:` lines are a note Git puts into the message of a merge that stopped; with `--no-edit` they stay in it. A file that merged with no conflict is not listed. So months later you can still see what someone decided in a conflict, and a merge commit with no diff at all means Git merged everything by itself. `git log -p` skips merge commits' diffs unless you add `--cc`.

### What rerere stores

Rerere keeps its notes in `.git/rr-cache`, one folder per conflict:

```console
$ ls .git/rr-cache
0df4bb1b6241c9e7aca183193a314045fb0f5821
$ ls .git/rr-cache/0df4bb1b6241c9e7aca183193a314045fb0f5821
postimage
preimage
```

The `preimage` is the conflicted file as Git wrote it, with the branch names taken off the markers:

```console
$ cat .git/rr-cache/0df4bb1b6241c9e7aca183193a314045fb0f5821/preimage
Boil the water
<<<<<<<
Steep for 3 minutes with the lid on
=======
Steep for 5 minutes
>>>>>>>
Serve hot
Add lemon
```

The `postimage` is the file as you committed it. The folder's name is a [checksum](term:checksum) of the text between the markers.

Three facts follow from that, and they explain how rerere behaves:

- **The memory is keyed by the conflict's text**, not by a branch, a commit or a merge. The same two blocks of lines clashing anywhere bring the old answer back: in a second merge, on another branch, or during a rebase or a revert.
- **A slightly different conflict is a new conflict.** If either side changes its lines again before the next merge, the checksum no longer matches and Git asks you again.
- **It is local.** `.git/rr-cache` is never pushed or cloned. Your teammates do not get your resolutions, and you do not get theirs.

While a merge is stopped, `git rerere diff` shows what rerere will record: the change from the preimage to the file as it is now.

```console
$ git rerere diff
--- a/tea.txt
+++ b/tea.txt
@@ -1,8 +1,4 @@
 Boil the water
-<<<<<<<
-Steep for 3 minutes with the lid on
-=======
-Steep for 5 minutes
->>>>>>>
+Steep for 5 minutes with the lid on
 Serve hot
 Add lemon
```

Read it as a rule: "when these two lines clash, write this one line". `git rerere status` lists the files rerere is watching in this merge.

## Advanced

### Pretend to merge: `-s ours`

`git merge -s ours <branch>` makes a merge commit with two parents whose files are exactly your branch's files. The other branch's changes are not merged, not even the ones that would not conflict.

```console
$ git merge -s ours try-strong --no-edit
Merge made by the 'ours' strategy.
$ git diff HEAD HEAD~
$ cat tea.txt
Boil the water
Steep for 3 minutes with the lid on
Serve hot
```

`git diff HEAD HEAD~` prints nothing: the merge changed no file. `Add lemon`, which `-Xours` kept, is not there. But Git now counts `try-strong` as merged, and a later `git merge try-strong` says `Already up to date.`

Pro Git's use for it: a bug fix was applied to `main` by hand and also lives on a branch that `release` has merged. Merging that fix branch into `main` with `-s ours` records "main has this already", so the later merge of `release` into `main` does not conflict over the fix. It is a tool for marking history. If you only want your side to win conflicts, you want `-Xours`.

### Merge a branch again after reverting its merge

After `git revert -m 1`, the branch's commits are still ancestors of `main`. Git therefore sees nothing to merge, and new commits on the branch would come in without the older, reverted work. Pro Git's fix has two steps:

```console
$ git revert <ID of the revert commit>
$ git merge try-strong
```

The first command undoes the undo, which brings the old work back. The second merges whatever the branch gained since. The lesson "Incident playbook" walks through a broken merge from start to finish.

### Compare your resolution with one side

During a stopped merge, three forms of `git diff` compare the file in your working tree with one of the staged versions:

| Command | Compares your file with | Answers |
|---|---|---|
| `git diff --ours` | Ours (`:2:`) | What does this merge change for my branch? |
| `git diff --theirs` | Theirs (`:3:`) | What of their version did I not take? |
| `git diff --base` | The base (`:1:`) | What changed in total since the branches split? |

```console
$ git diff --ours
* Unmerged path tea.txt
diff --git a/tea.txt b/tea.txt
index 25a1011..7a37ad6 100644
--- a/tea.txt
+++ b/tea.txt
@@ -1,3 +1,4 @@
 Boil the water
-Steep for 3 minutes with the lid on
+Steep for 5 minutes with the lid on
 Serve hot
+Add lemon
```

### Merge one file again by hand

Some conflicts can be repaired by a script before merging, for example a file whose line endings were all converted on one side. Pro Git's recipe: take the three versions out of the staging area, repair one, and run the three-way merge for that file alone with `git merge-file`.

```console
$ git show :1:tea.txt > tea.base.txt
$ git show :2:tea.txt > tea.ours.txt
$ git show :3:tea.txt > tea.theirs.txt
$ git merge-file -p tea.ours.txt tea.base.txt tea.theirs.txt > tea.txt
```

Between the third and fourth command you repair `tea.theirs.txt`. `-p` prints the result instead of writing it into the first file. Afterwards delete the three helper files (`git clean -f` removes untracked files; check with `git clean -n` first) and stage `tea.txt`. Pro Git notes that this gives a cleaner file than `-Xignore-space-change`, which leaves mixed spacing behind.

### More of rerere

- **A recorded resolution was wrong.** `git rerere forget <file>` deletes it. Then `git restore --merge <file>` brings the markers back so you can resolve again.

  ```console
  $ git rerere forget tea.txt
  Updated preimage for 'tea.txt'
  Forgot resolution for 'tea.txt'
  ```

- **Replay by hand.** If you brought the markers back and want the recorded answer after all, run `git rerere` with no arguments. It prints `Resolved 'tea.txt' using previous resolution.` again.
- **Stage it too.** With `git config rerere.autoUpdate true`, Git also stages a file that rerere resolved. The merge still stops, so you can look before you commit.
- **For every repository.** Pro Git turns rerere on with `git config --global rerere.enabled true`. Many developers do; the lesson "Configuration in depth" covers global settings.

### Subtree merges

A [subtree merge](term:subtree-merge) is for two projects where one lives in a subfolder of the other: your recipe site keeps a copy of a small `units` library under `units/`, and you want to bring in the library's new commits now and then. The library's files sit at the top of its own project and under `units/` in yours, so a normal merge would not line them up. The option `-Xsubtree=units` tells Git to shift their files into that folder before merging.

Bring the other project in once (its history has nothing in common with yours, so Git asks you to say that this is intended):

```console
$ git remote add units ../lib
$ git fetch units --no-tags
$ git merge -s ours --no-commit --allow-unrelated-histories units/main
Automatic merge went well; stopped before committing as requested
$ git read-tree --prefix=units/ -u units/main
$ git commit -m "Add the units project under units/"
```

`git read-tree --prefix=units/ -u` reads the other project's files into the staging area and the working tree under `units/`. Later, when the library has new commits:

```console
$ git fetch units --no-tags
$ git merge -Xsubtree=units units/main --no-edit
Merge made by the 'ort' strategy.
 units/convert.txt | 1 +
 1 file changed, 1 insertion(+)
```

Pro Git weighs it this way: all the code is committed in one place, which is simpler for whoever clones your project, but the setup is easier to get wrong than it looks, and sending your changes back to the library is awkward. The lesson "Submodules" teaches the more common way to keep another project inside yours.

:::sidenote
Pro Git's version of this recipe checks the library out as a local branch and merges with `--squash`. Since Git 2.9, merging two histories with no common commit needs `--allow-unrelated-histories`; the steps above are the ones from Git's own "How to use the subtree merge strategy" guide.
:::

## Recap

- Stuck in a conflict: `git merge --abort` backs out; `git restore --conflict=diff3 <file>` shows the base inside the markers; `git log --merge --oneline --left-right` lists the commits that caused it.
- `git restore --ours <file>` or `--theirs <file>` takes one whole side of one file. `git diff` before `git add` shows your resolution against both sides.
- `-Xours`, `-Xtheirs` and `-Xignore-space-change` settle conflicts by a rule and still merge everything else. `-s ours` ignores the other branch's files completely.
- Take a merge back with `git reset --hard HEAD~` if only you have it, or `git revert -m 1 HEAD` if others do.
- `git config rerere.enabled true` makes Git remember each resolution and fill it in when the same conflict returns. You still run `git add` and commit.
