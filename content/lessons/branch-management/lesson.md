---
id: branch-management
title: "List, delete and rename branches"
module: branching
bookSection: "3.3 Branch Management"
bookUrl: https://git-scm.com/book/en/v2/Git-Branching-Branch-Management
bookSources:
  - book/progit2/book/03-git-branching/sections/branch-management.asc
readFirst: [branch-and-merge]
---

A few weeks into a project, `git branch` prints twenty names, and you no longer know which ones still hold work. This lesson shows how to tell finished branches from unfinished ones, delete the finished ones without losing anything, and fix a branch name you regret.

## Must know

The last three lessons made [branches](term:branch): "Branches are just pointers" created them, "Switching branches and detached HEAD" moved between them, and "Branch, merge, and fix conflicts" joined them. Every job you finish leaves a branch behind. This lesson is the housekeeping.

### See what you have

Before you tidy up, look. You already know the two listing commands, so here they are on this lesson's practice project, a small shop app:

```console
$ git branch
  add-search
  fix-footer
* main
  new-checkout
```

The `*` marks the branch you are on, the one HEAD points to. `git branch -v` adds the newest commit of each branch:

```console
$ git branch -v
  add-search   ab5742d Add search box
  fix-footer   c4e3d21 Fix footer link
* main         eb008b7 Merge branch 'add-search'
  new-checkout 38ddc7e Start new checkout
```

Four branches. The list does not say which of them are finished, and that is the question that matters before you delete anything.

### Which branches are finished: `--merged` and `--no-merged`

A branch is finished when its work has been [merged](term:merge) into your main line. Git can answer that for every branch at once.

`git branch --merged` lists the branches whose work is already in the branch you are on. Nothing on them would be lost if their names disappeared.

`git branch --no-merged` lists the branches that hold commits the branch you are on does not have yet. They still hold work.

Here is the practice project's history. `fix-footer` and `add-search` were both merged into `main`; `new-checkout` has one commit that `main` does not have.

:::graph
caption: "fix-footer and add-search are part of main's history; new-checkout is one commit ahead"
commits:
  - id: A
    message: Add README
  - id: C
    message: Fix footer link
    parents: [A]
  - id: E
    message: Update README
    parents: [C]
  - id: D
    message: Add search box
    parents: [C]
  - id: M
    message: Merge add-search
    parents: [E, D]
  - id: F
    message: Start new checkout
    parents: [M]
branches:
  main: M
  add-search: D
  fix-footer: C
  new-checkout: F
head: main
:::

:::predict
question: "You are on main. Which names will `git branch --merged` print, and which will `git branch --no-merged` print?"
answer: "`--merged` prints add-search, fix-footer and main itself. `--no-merged` prints only new-checkout: its commit F is not in main's history."
:::

:::try-it
1. Run `git branch --merged`. Git lists `add-search`, `fix-footer` and `* main`. The branch you are on is always in this list: it is trivially merged into itself.
2. Run `git branch --no-merged`. Git lists only `new-checkout`: it holds the commit "Start new checkout", which `main` does not have.
3. Look at the picture and press "Expand" on the History panel to see every row. The `branch fix-footer` and `branch add-search` tags sit on stations that lie behind the `branch main` tag: main's history passes through them. The `branch new-checkout` tag sits on a station after `main`, which main has not reached.
:::

```console
$ git branch --merged
  add-search
  fix-footer
* main
$ git branch --no-merged
  new-checkout
```

Both filters compare against **the branch you are on**. That is the detail people forget: run `git branch --merged` while you are on some side branch and you get a different, less useful answer.

To ask about another branch without switching to it, name it at the end:

```console
$ git branch --no-merged main
  new-checkout
```

Read it as "which branches are not merged into `main`?". When you clean up, `main` is nearly always the branch to compare against, so naming it is a good habit.

### Delete a finished branch with `git branch -d`

Now you know which branches are finished. Removing one is a single command.

`git branch -d <name>` deletes a branch name. It deletes the label only: the commits stay exactly where they are.

```console
$ git branch -d scratch-idea
Deleted branch scratch-idea (was eb008b7).
```

Git names the commit the branch pointed at (`was eb008b7`). Keep that in mind; it is your way back if you delete the wrong branch.

Practise on a branch of your own, so the shop's branches stay as they are for the challenges at the end of this lesson.

:::try-it
1. Create a branch: `git branch scratch-idea`. In the picture, a `branch scratch-idea` tag appears on the same station as `branch main`.
2. Run `git branch --merged`. The new branch `scratch-idea` is in the list. It has no commits of its own, so everything on it is already in `main`.
3. Run `git branch -d scratch-idea`. Git prints "Deleted branch scratch-idea (was …)" with a commit ID. In the picture, the `branch scratch-idea` tag disappears. No station changes: the commit it pointed at is still reached by `main`.
:::

What stays the same matters here. Deleting a merged branch removes one name. Every commit, every file and the merge commit that joined the work are untouched.

### The safety check, and `-D`

`-d` is safe because it refuses to delete a branch that still holds work. Here is what that looks like, and how to override it when you mean it.

Say you tried an idea on a branch, committed it, and went back to `main` without merging:

:::predict
question: "The branch try-colors has one commit that main does not have. You are on main and run `git branch -d try-colors`. What happens?"
answer: "Git refuses: \"the branch 'try-colors' is not fully merged\". Deleting the name would leave that commit with no branch pointing at it."
:::

```console
$ git branch -d try-colors
error: the branch 'try-colors' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D try-colors'
```

"Not fully merged" means: this branch has commits that the branch you are on does not have. If the name goes, nothing points at those commits any more.

`git branch -D <name>` (capital D) deletes the branch anyway. Use it for work you have decided to abandon, like an experiment that failed.

:::try-it
1. Make a branch with one commit: `git switch -c try-colors`, then `echo "blue" > colors.txt`, `git add colors.txt` and `git commit -m "Try new colors"`. In the picture, a new station appears with the `branch try-colors` tag and the `HEAD · you` pin on it.
2. Go back: `git switch main`. The `HEAD · you` pin returns to the station with `branch main`.
3. Run `git branch -d try-colors`. Git refuses with "not fully merged". Nothing changes in the picture.
4. Run `git branch -D try-colors`. Git prints "Deleted branch try-colors (was …)". In the picture, the `branch try-colors` tag disappears, and the station "Try new colors" turns faded and dashed, marked `no branch`: the commit still exists, but no branch reaches it.
:::

:::careful
`git branch -D` throws away the only name for those commits. Git keeps the commits for a while (about a month by default) and they can be brought back by their ID, but only if you find that ID. Read the name twice before you press Enter. The lesson "Recover lost commits with reflog and fsck" covers the rescue in depth.
:::

One more rule: you cannot delete the branch you are on. Switch to another branch first.

### Rename a branch with `git branch -m`

Deleting handles branches you are done with. A branch you still need may only have the wrong name: a typo, or `stuff` where `contact-page` would tell your team what it is.

`git branch -m <new-name>` renames the branch you are on. `git branch -m <old-name> <new-name>` renames any branch. The `-m` is short for `--move`. The history is kept; only the label changes.

```console
$ git branch -m new-checkout checkout-page
$ git branch
  add-search
  checkout-page
  fix-footer
* main
```

Git prints nothing on success. In the picture, the tag on that station now reads `branch checkout-page`.

Rename a branch only while it lives on your computer alone. Pro Git puts it plainly: do not rename branches that other people are still using. Once a branch is shared on a server, teammates and tools know it by its old name.

### Rename `master` to `main`

The most common rename is the default branch. Older repositories, and Git itself on many computers, call the first branch `master`; most teams and hosting sites now use `main`. In a repository that only you use, it is one command:

```console
$ git branch -m master main
```

If you are on `master`, the prompt changes from `(master)` to `(main)` right away.

A shared repository needs more than this. The server still has a `master` branch until you push `main` and delete the old one there, which the lesson "Remote and tracking branches" teaches. Other things refer to the old name too, and Pro Git lists them: projects that depend on this one, test and build scripts, release scripts, the default-branch and merge-rule settings on your hosting site, the documentation, and open pull requests that target the old branch. Agree on the change with your team before you make it.

### A routine that keeps the list short

You now have all the pieces. Most developers follow the same three steps for every job:

1. Finish the work on its branch and merge it into `main`.
2. Check with `git branch --merged main`.
3. Delete every branch on that list, except `main` itself, with `git branch -d`.

Done this way, `git branch` only ever shows work in progress.

### When it goes wrong

Four messages you will meet while tidying up:

```console
$ git branch -d try-colors
error: the branch 'try-colors' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D try-colors'
```

The branch has commits the branch you are on does not have. First check where you are: this also appears when the branch is merged into `main` but you are standing on some other branch. If the work really is unwanted, use `-D`. If it is wanted, merge it first.

```console
$ git branch -d main
error: cannot delete branch 'main' used by worktree at 'C:/Users/you/shop/project'
```

You are on that branch. Git will not remove the branch HEAD points to. Switch to another branch, then delete. (Older Git versions say "Cannot delete branch 'main' checked out at …".)

```console
$ git branch -m fix-footer add-search
fatal: a branch named 'add-search' already exists
```

The new name is taken. Pick another name, or delete the old `add-search` first if it is finished.

The fourth has no error message: you deleted the wrong branch. Look at what Git printed when it deleted it:

```console
$ git branch -D checkout-page
Deleted branch checkout-page (was 38ddc7e).
```

`38ddc7e` is the commit the branch pointed at. Create the branch again on that commit, with the form of `git branch` that takes a name and a commit:

```console
$ git branch checkout-page 38ddc7e
```

The branch is back, with all its commits. If the "Deleted branch" line has scrolled away, `git reflog` lists the commits HEAD has been on, with their IDs.

## Under the hood

"Must know" treated a branch as a label you can remove or rewrite. This layer shows why those operations are so small, and what "merged" means exactly.

### Deleting a branch deletes one small file

A local branch is a file in `.git/refs/heads/` that holds one commit ID. Git calls such a file a [ref](term:ref).

```console
$ ls .git/refs/heads
add-search
fix-footer
main
$ cat .git/refs/heads/main
eb008b7422274f45deaad12e5c27c7594794f5b5
```

`git branch -d fix-footer` removes the file `.git/refs/heads/fix-footer`. Nothing in `.git/objects`, where the commits live, is touched. That is why deleting is instant, and why a deleted branch comes back the moment you write its commit ID into a new ref with `git branch <name> <id>`.

### What "merged" means exactly

`git branch --merged` does not compare files. It asks one question about the history: starting from the commit the current branch points at and following parent links backwards, do you reach the commit the other branch points at?

:::graph
caption: "Walking back from main (M) reaches C and D, so both branches are merged. F is never reached."
commits:
  - id: C
    message: Fix footer link
  - id: E
    message: Update README
    parents: [C]
  - id: D
    message: Add search box
    parents: [C]
  - id: M
    message: Merge add-search
    parents: [E, D]
  - id: F
    message: Start new checkout
    parents: [M]
branches:
  main: M
  fix-footer: C
  add-search: D
  new-checkout: F
head: main
:::

From `M`, the parents lead to `E` and `D`, then to `C`. So `fix-footer` (on `C`) and `add-search` (on `D`) are reachable: merged. `F` is a child of `M`, and parent links never lead forward, so `new-checkout` is not merged into `main`.

Turn the question around and the answer flips. From `F` you reach everything, so `git branch --merged new-checkout` lists all four branches. "Merged" always means "merged into something".

### What happens to the commits of a force-deleted branch

After `git branch -D`, the commits that only that branch reached still sit in `.git/objects`. Git's [reflog](term:reflog), its diary of where HEAD has been, still lists them:

```console
$ git reflog
eb008b7 HEAD@{0}: checkout: moving from try-colors to main
e709d05 HEAD@{1}: commit: Try new colors
eb008b7 HEAD@{2}: checkout: moving from main to try-colors
```

Commits that no branch, tag or reflog entry reaches are removed later by Git's own cleanup. Reflog entries for such commits expire after 30 days by default, which is where "about a month" comes from.

### A rename moves the file and its diary

`git branch -m` renames the ref file, and with it the branch's own reflog in `.git/logs/refs/heads/`. Git adds a line there:

```console
Branch: renamed refs/heads/trunk to refs/heads/main
```

If you are on the branch, the `HEAD` file is updated to name the new branch. No commit changes, so no commit ID changes.

## Advanced

### Sort the list by last activity

`git branch --sort=-committerdate` lists branches with the most recently committed first. The `-` means newest first. It is the quickest way to spot branches nobody has touched for months.

### Which branches contain this commit?

`git branch --contains <commit>` lists every branch whose history includes a commit. Use it to answer "is this fix on the release branch yet?".

```console
$ git branch --contains c4e3d21
  add-search
  fix-footer
* main
```

`--no-contains` gives the opposite list.

### List by pattern

`git branch --list 'add-*'` lists only the branches that match a pattern. Quote the pattern so your shell does not expand the `*` itself.

### See what each branch follows

`git branch -vv` adds, in square brackets, the branch on the server that each local branch follows, and how far ahead or behind it is. It becomes useful in the lesson "Remote and tracking branches".

### Copy a branch

`git branch -c <old> <new>` makes a second branch on the same commit and copies the settings of the old one. `git branch <new> <old>` gives you the same pointer without the settings.

### Move a branch to another commit

`git branch -f <name> <commit>` makes an existing branch point at a different commit.

:::careful
`git branch -f` moves the label without asking. Any commits that only the old position reached are left with no branch, just as after `-D`. It refuses to move the branch you are on; for that, the lesson "Reset demystified: the three trees" has the right tool.
:::

### The plumbing behind the list

`git for-each-ref refs/heads` prints the same branches in a form made for scripts, with any fields you ask for through `--format`.

### Old and new spellings

:::compare
today: "`git branch -m old new` and `git branch -d name`. The long forms `--move` and `--delete` do the same and read better in scripts."
book: "Pro Git writes `git branch --move bad-branch-name corrected-branch-name`. Both spellings work in every current Git."
:::

## Recap

- `git branch --merged main` lists finished branches; `git branch --no-merged main` lists branches that still hold work. Without a name, both compare against the branch you are on.
- `git branch -d <name>` deletes a merged branch and refuses an unmerged one. `-D` forces it and leaves those commits with no branch.
- Deleting removes a name, never commits. `git branch <name> <id>` brings a deleted branch back; the ID is in the "Deleted branch … (was …)" line and in `git reflog`.
- `git branch -m <old> <new>` renames a branch. Rename only branches nobody else uses yet.
- Routine: merge, check `--merged`, delete.
