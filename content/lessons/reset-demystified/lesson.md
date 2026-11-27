---
id: reset-demystified
title: "Reset demystified: the three trees"
module: undo-and-fix
bookSection: "7.7 Reset Demystified"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified
bookSources:
  - vendor/progit2/book/07-git-tools/sections/reset.asc
readFirst: [undo-basics, reading-history]
---

You committed too early, or split one job over three messy commits, or the last two commits were an experiment you want gone. `git reset` takes commits back, and this lesson shows exactly what it touches, so you can pick the right option and never lose work by accident.

## Must know

The earlier lessons of this module gave you three undo tools: `git restore` for changes you have not committed, `git commit --amend` for the last commit, and `git revert` for a commit you already shared. `git reset` is the fourth, and the one people fear, because one command can do three different things.

The fear goes away once you see that reset always does the same steps in the same order. The option only decides where it stops.

### Where you are: HEAD and your branch

Reset moves two labels, so you need their names first.

- Your **[branch](term:branch)**, `main`, is a label on the newest commit of your work. Each new commit moves the label forward by one.
- **[HEAD](term:head)** means "where you are". It points at your branch, and so at that newest commit.

In the picture, both sit on the last station of the history map: the `branch main` tag and the yellow `HEAD · you` pin. The "Branching" module explains branches fully. For this lesson, `main` is simply your branch.

### The three trees

You already know the three areas a change passes through. Pro Git looks at the same three places from another side: each one holds a full set of your project's files. The book calls them the three trees ("tree" here only means "a collection of files").

:::definitions
- term: HEAD
  area: repository
  text: "The [snapshot](term:snapshot) of your last commit. Your next commit will be built on top of it."
- term: Index
  area: staging
  text: "Your proposed next commit. This is the staging area under its other name: what `git commit` will record."
- term: Working directory
  area: working
  text: "Your sandbox: the real files you edit. This is the working tree. Nothing here is recorded until you stage and commit it."
:::

Right after a commit, all three hold the same files, and `git status` says "working tree clean". When you edit a file, the working directory differs from the index. When you stage it, the index differs from HEAD. When you commit, HEAD catches up.

So the daily loop fills the trees from right to left: working directory, then index, then HEAD. Reset goes the other way. It starts at HEAD and overwrites the trees one by one.

### What reset does, in three steps

`git reset <commit>` means: take me back to that commit. It does up to three things, always in this order:

1. **Move your branch** (the one HEAD points at) to that commit. `--soft` stops here.
2. **Make the index look like that commit.** `--mixed` stops here. This is the default, so plain `git reset <commit>` stops here too.
3. **Make the working directory look like it too.** Only `--hard` goes this far.

Most of the time the commit you name is "one back" or "two back". Git has a short way to write that: `HEAD~1` is the commit before the one you are on, `HEAD~2` is the one before that. `HEAD~` alone means `HEAD~1`.

One example, carried through all three options, shows the difference. A file `plan.txt` was committed three times, and each commit changed its one line: `v1`, then `v2`, then `v3`.

:::graph
caption: "Before any reset: main and HEAD are on the newest commit, Plan v3"
commits:
  - id: A
    message: Plan v1
  - id: B
    message: Plan v2
    parents: [A]
  - id: C
    message: Plan v3
    parents: [B]
branches:
  main: C
head: main
:::

All three trees hold `v3`. Now we run `git reset HEAD~1` with each option in turn, always starting from this state.

| After… | HEAD (last commit) | Index (staging area) | Working directory | `git status` shows |
|---|---|---|---|---|
| nothing yet | v3 | v3 | v3 | clean |
| `git reset --soft HEAD~1` | **v2** | v3 | v3 | `plan.txt` staged |
| `git reset HEAD~1` (mixed) | **v2** | **v2** | v3 | `plan.txt` modified, not staged |
| `git reset --hard HEAD~1` | **v2** | **v2** | **v2** | clean |

In all three cases the history looks the same afterwards. Your branch points at "Plan v2", and "Plan v3" is no longer part of it:

:::graph
caption: "After git reset HEAD~1, with any option: main moved back, and no branch reaches C any more"
commits:
  - id: A
    message: Plan v1
  - id: B
    message: Plan v2
    parents: [A]
  - id: C
    message: Plan v3
    parents: [B]
    faded: true
branches:
  main: B
head: main
:::

What stays the same matters as much: reset never changes a commit. Commit C still exists inside Git with `v3` in it. The only thing that moved is the label `main`. The options differ in one thing only: how much of `v3` is still in your index and your working directory.

### `--soft`: take the commit back, keep everything staged

`git reset --soft HEAD~1` undoes only the `git commit` command. Your branch steps back one commit. The index and your files are not touched, so everything that was in the commit is staged again, ready to be committed.

Use it when the commit was made too early or with the wrong message, and you want to commit again.

The practice project on the right is a small shop app with three commits. Build the `plan.txt` example on top of it with a file of your own. The challenges at the end start from a fresh copy, so nothing you do here affects them.

:::try-it
1. Make the three commits. Run `echo "v1" > plan.txt`, then `git add plan.txt`, then `git commit -m "Plan v1"`. In the picture, a new station appears and the `branch main` tag moves onto it.
2. Run `echo "v2" > plan.txt`, then `git commit -am "Plan v2"`. Run `echo "v3" > plan.txt`, then `git commit -am "Plan v3"`. The map now ends with three stations: Plan v1, Plan v2, Plan v3.
3. Run `git log --oneline`. The top line is "Plan v3", and the three shop commits are below your three.
:::

:::predict
question: "You are about to run `git reset --soft HEAD~1`. What will `git status` say about `plan.txt`, and what will the file contain?"
answer: "`plan.txt` is listed under \"Changes to be committed\", and the file still contains `v3`. Only the commit was taken back."
:::

:::try-it
1. Run `git reset --soft HEAD~1`. Git prints nothing. In the picture, the `branch main` tag and the `HEAD · you` pin jump back to the "Plan v2" station. The "Plan v3" station stays on the map, faded and dashed: no branch reaches it any more. A `plan.txt` sheet appears in the staging area.
2. Run `git status`. The file `plan.txt` is under "Changes to be committed": the index still holds `v3`, and HEAD now holds `v2`.
3. Run `git log --oneline`. The top line is "Plan v2". The commit "Plan v3" is gone from the list.
4. Commit again: `git commit -m "Plan v3"`. A new "Plan v3" station appears after "Plan v2", with a different ID from the faded one. It is a new commit with the same content.
:::

```console
$ git reset --soft HEAD~1
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   plan.txt

```

A soft reset followed by a new commit does the same job as `git commit --amend`. Amend is the shortcut for one commit back; reset also works for two or more.

### `--mixed`: take the commit back and unstage it

`git reset HEAD~1`, with no option, goes one step further. It moves your branch back and then makes the index match. Your files keep their content, but nothing is staged.

Use it when the commit bundled things that belong in separate commits. After the reset, all the changes are in your working directory again, and you stage and commit them in the pieces you want.

:::try-it
1. Run `git reset HEAD~1`. Git prints "Unstaged changes after reset:" and lists `plan.txt`. In the picture, `main` and HEAD jump back to "Plan v2" again, and this time the `plan.txt` sheet lies in the working tree, marked `edited`.
2. Run `git status`. The file `plan.txt` is under "Changes not staged for commit". Run `cat plan.txt`: it still says `v3`.
3. Put it back for the next part: `git add plan.txt`, then `git commit -m "Plan v3"`.
:::

```console
$ git reset HEAD~1
Unstaged changes after reset:
M	plan.txt
```

You rolled back to before you ran `git add` and `git commit`. The edit itself is still in the file.

### `--hard`: throw the commit and its changes away

`git reset --hard HEAD~1` does all three steps. Your branch moves back, the index matches, and your files are overwritten to match too. The project looks exactly as it did at that commit.

Use it when the last commits were a failed experiment and you want none of it.

:::predict
question: "Before `git reset --hard HEAD~1` you also create a new file, `scratch.txt`, and do not add it. After the reset, what is in `plan.txt`, and is `scratch.txt` still there?"
answer: "`plan.txt` says `v2`. `scratch.txt` is still there: reset only touches files Git tracks, so an untracked file is left alone."
:::

:::try-it
1. Create an untracked file: `echo "ideas" > scratch.txt`. A `scratch.txt` sheet marked `new` appears in the working tree.
2. Run `git reset --hard HEAD~1`. Git prints "HEAD is now at …" with the ID and message of "Plan v2". In the picture, `main` and HEAD jump back, the "Plan v3" station turns faded, and no `plan.txt` sheet appears in any area.
3. Run `cat plan.txt`. It says `v2`. The file itself was rewritten.
4. Run `git status`. Only `scratch.txt` is listed, as untracked. Reset did not touch it.
:::

```console
$ git reset --hard HEAD~1
HEAD is now at 096e24e Plan v2
```

:::careful
`--hard` is the only option that can destroy work, and one of the very few Git commands that can. It overwrites every tracked file without asking. Edits you never committed are gone for good, because Git never had a copy of them. Run `git status` before every `git reset --hard` and read what is still uncommitted.
:::

### Getting a commit back after a reset

A commit you reset away is not deleted. Git keeps a diary of every position HEAD has had, called the **[reflog](term:reflog)**, and keeps those commits for weeks. That is why the faded station is still on the map.

```console
$ git reflog
096e24e HEAD@{0}: reset: moving to HEAD~1
5d8e0dd HEAD@{1}: commit: Plan v3
096e24e HEAD@{2}: reset: moving to HEAD~1
f55aafd HEAD@{3}: commit: Plan v3
```

Read it from the top: the newest line is the reset you just ran, and the line below it is the commit you were on before. The first column is that commit's ID. Reset works forward as well as backward, so naming that ID takes you back to it.

:::try-it
1. Run `git reflog`. Find the newest line that says `commit: Plan v3` and copy the ID at its start (yours will differ from the one above).
2. Run `git reset --hard` followed by that ID, for example `git reset --hard 5d8e0dd`. In the picture, `main` and HEAD jump forward onto the "Plan v3" station, and it turns solid again.
3. Run `cat plan.txt`. It says `v3` again.
:::

The lesson [Recover lost commits with reflog and fsck](lesson:rescue-lost-work) covers the reflog in full. For now, remember the split:

- **Committed, then reset away:** recoverable through the reflog.
- **Never committed, then `--hard`:** lost.

### Squash several commits into one

A common use of `--soft` is to **squash**: turn several small commits into one clean commit. Say your last two commits are "Plan v2" and "Plan v3", and they are really one job.

```console
$ git reset --soft HEAD~2
$ git status -s
M  plan.txt
$ git commit -m "Write the plan"
[main c0e5ff1] Write the plan
 1 file changed, 1 insertion(+), 1 deletion(-)
```

The soft reset moves your branch back two commits and leaves the final content staged. One `git commit` then records it as a single commit. The two old commits are no longer in the history.

:::graph
caption: "After git reset --soft HEAD~2 and a new commit: D replaces B and C"
commits:
  - id: A
    message: Plan v1
  - id: B
    message: Plan v2
    parents: [A]
    faded: true
  - id: C
    message: Plan v3
    parents: [B]
    faded: true
  - id: D
    message: Write the plan
    parents: [A]
branches:
  main: D
head: main
:::

### Never reset commits you already shared

Reset rewrites your history: commits that were on your branch are no longer on it. On your own computer that is fine. Once you have sent commits to a shared copy of the project on a server (the "Remotes" module covers this), other people have built on them. If you reset them away, your history and theirs no longer match, and sorting that out is painful for everyone.

The rule is the same as for amend: reset only commits that exist on your computer alone. To undo a shared commit, use `git revert`, which adds a new commit and takes nothing away.

### Which undo tool, when

| You want to… | Use | History changes? |
|---|---|---|
| Throw away edits you have not committed | `git restore <file>` | No |
| Unstage a file | `git restore --staged <file>` | No |
| Fix the message or content of the last commit | `git commit --amend` | Yes, the last commit is replaced |
| Take back the last commits, keep the work | `git reset --soft` or `git reset` | Yes, commits leave the branch |
| Take back the last commits and their changes | `git reset --hard` | Yes, and files are overwritten |
| Undo a commit other people already have | `git revert <commit>` | No, a new commit is added |

And the three reset options side by side, as in Pro Git's own summary:

| Command | Moves your branch | Changes the index | Changes your files | Safe for uncommitted work? |
|---|---|---|---|---|
| `git reset --soft <commit>` | Yes | No | No | Yes |
| `git reset <commit>` | Yes | Yes | No | Yes |
| `git reset --hard <commit>` | Yes | Yes | Yes | **No** |

### When it goes wrong

**You ran `--hard` and lost edits.** Check what kind of work it was. Commits come back through `git reflog` and `git reset --hard <id>`, as you just did. Changes that were only in your files or only staged are gone. Your editor's undo history or local file history is the last place to look.

**You reset too many commits, or the wrong ones.** Nothing is lost. Run `git reflog`, find the line from before the reset, and reset to that ID.

```console
$ git reset --soft HEAD~1
fatal: ambiguous argument 'HEAD~1': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
```

You are on the very first commit, so there is no commit before it to go back to. To redo a first commit, change your files, stage them and use `git commit --amend`.

**A file is still there after `--hard`.** It is an untracked file. Reset only handles files Git tracks. Delete it yourself if you do not want it.

## Under the hood

"Must know" described reset as moving a label. This layer shows the label on disk, which also explains why reset is fast and why the old commits survive.

### Reset rewrites one small file

Your branch is a [ref](term:ref): a small file that holds one [commit ID](term:commit-id). Read it before and after a reset:

```console
$ cat .git/refs/heads/main
3605daa23f464d709f8ef7b061e514b614cac10d
$ git reset --soft HEAD~1
$ cat .git/refs/heads/main
ed81d86b2d40cacb20c354f083ef9419014297ce
```

That is step 1 in full: Git wrote a different ID into `.git/refs/heads/main`. No commit was changed, moved or deleted.

HEAD itself did not change at all:

```console
$ cat .git/HEAD
ref: refs/heads/main
```

HEAD still says "I am on `main`". Pro Git stresses this point: reset moves the branch that HEAD points to. It does not move HEAD to somewhere else. Switching branches is the command that changes HEAD itself, and the lesson [Switching branches and detached HEAD](lesson:switch-and-detached-head) picks that up.

### Steps 2 and 3 are copies

Step 2 rewrites the index file, `.git/index`, so it lists the files of the commit you reset to. Step 3 writes those files into your working directory. Both are the daily loop run backwards: where `git add` copies a file from the working directory to the index, a mixed reset copies it from HEAD to the index.

That is also why `--hard` cannot be undone for uncommitted work. The index and the working directory are the only places an uncommitted change lives, and step 2 and step 3 overwrite exactly those two.

### ORIG_HEAD: one step of memory

Before reset moves your branch, Git writes the old position into a file called `ORIG_HEAD`:

```console
$ cat .git/ORIG_HEAD
3605daa23f464d709f8ef7b061e514b614cac10d
```

So right after a reset you regret, `git reset --hard ORIG_HEAD` puts the branch back, with no need to look up an ID. It remembers only the last such move; the reflog remembers all of them.

### Why the old commits are not deleted

A commit that no branch reaches is called unreachable. Git does not remove it at once. The reflog still points at it, and Git's clean-up only removes unreachable commits after their reflog entries expire, about 30 days by default. Until then they take a little disk space and can be brought back.

## Advanced

### Reset with a path

Give reset a file name and it behaves differently: it skips step 1. HEAD can only point at one whole commit, so there is no way to move it for a single file. What is left is step 2 for that file: copy it from HEAD into the index.

```console
$ git add plan.txt
$ git reset plan.txt
Unstaged changes after reset:
M	plan.txt
```

That is the exact opposite of `git add`, which is why older versions of `git status` suggested it for unstaging.

:::compare
today: "`git restore --staged plan.txt` takes a file out of the staging area and says what it does."
book: "`git reset plan.txt` (short for `git reset --mixed HEAD plan.txt`) does the same and still works."
:::

You can also name a commit: `git reset HEAD~2 plan.txt` stages the file as it was two commits ago, without touching the file in your working directory. Today `git restore --staged --source=HEAD~2 plan.txt` does the same job.

### Unstage part of a file

`git reset -p` walks through the staged changes one piece at a time and asks which to unstage, like `git add -p` in reverse. The lesson [Stage part of a file](lesson:partial-staging) teaches this way of working.

### `--keep` and `--merge`

Two more options sit between `--mixed` and `--hard`. Both move your branch and update your files, but refuse to overwrite uncommitted work.

- `git reset --keep <commit>` is a hard reset with a safety check. If a file with uncommitted edits would be overwritten, it stops:

  ```console
  $ git reset --keep HEAD~1
  error: Entry 'plan.txt' not uptodate. Cannot merge.
  fatal: Could not reset index file to revision 'HEAD~1'.
  ```

  Use it to drop commits while keeping unrelated local edits.
- `git reset --merge <commit>` is mostly used by Git itself to back out of a failed merge. You will rarely type it.

### Reset and checkout

Pro Git ends its section by comparing reset with `git checkout`, the older command behind today's `git switch` and `git restore`.

| | `git reset --hard <commit>` | `git checkout <branch>` (today: `git switch`) |
|---|---|---|
| What moves | The branch HEAD points to | HEAD itself, to another branch |
| Uncommitted edits | Overwritten | Kept, or the command refuses |

Both make the three trees match another commit. Reset drags your branch there. Switching leaves every branch where it is and moves only you. The lesson "Switching branches and detached HEAD" covers switching.

## Recap

- `git reset <commit>` moves your branch to that commit, then optionally the index, then optionally your files.
- `--soft` moves only the branch: the changes stay staged. `--mixed` (the default) also unstages them. `--hard` also overwrites your files.
- `HEAD~1` is one commit back; `git reset --soft HEAD~2` plus one commit squashes two commits into one.
- `--hard` destroys uncommitted work. Commits you reset away can be found with `git reflog` or `ORIG_HEAD`.
- Reset only commits that are on your computer alone; undo shared commits with `git revert`.
