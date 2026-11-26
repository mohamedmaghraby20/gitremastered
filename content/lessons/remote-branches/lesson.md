---
id: remote-branches
title: "Remote and tracking branches"
module: remotes
bookSection: "3.5 Git Branching - Remote Branches"
bookUrl: https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches
bookSources:
  - book/progit2/book/03-git-branching/sections/remote-branches.asc
readFirst: [remotes, branch-and-merge]
---

`git status` says "Your branch is ahead of 'origin/main' by 2 commits", and a teammate asks you to look at their branch, which you cannot find anywhere on your computer. Both puzzles have one answer: Git keeps three kinds of branch, and this lesson shows whose each one is and how to keep them in step.

## Must know

In the lesson "Work with remotes: fetch, pull, push" you fetched, pulled and pushed one branch, `main`. Real teams work on many branches at once, so you need to know exactly which branch lives where.

### Three branches with almost the same name

When you work with a server, the name `main` exists in three places.

| Name | Where it lives | Who moves it |
|---|---|---|
| `main` | Your repository | You, with every commit, merge or reset |
| `origin/main` | Your repository too | Git, only when you fetch, pull or push |
| `main` on the server | The remote repository `origin` | Whoever pushes to the server |

The middle one is the new idea. `origin/main` is a [remote-tracking branch](term:remote-tracking-branch): your own record of where `main` was on the server the last time you talked to it. Pro Git calls it a bookmark. It is written `<remote>/<branch>`, so `origin/main` reads "the branch `main`, as last seen on `origin`".

Two things follow from "record":

- It can be **out of date**. A teammate may have pushed ten commits since your last fetch. `origin/main` does not move until you ask the server again.
- It is **read-only for you**. You never commit on it. Git moves it for you during a fetch, pull or push.

The common wrong idea is "`origin/main` is the server". It is a note in your repository about the server, and the note is as old as your last fetch.

A small example. You and a teammate both start from commit B. You commit C. Meanwhile your teammate pushes D to the server. You have not fetched yet, so your note still says B:

:::graph
caption: "Before git fetch: your record of the server is still on B"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add app
    parents: [A]
  - id: C
    message: Add plan
    parents: [B]
branches:
  main: C
remotes:
  origin/main: B
head: main
:::

After `git fetch`, Git has downloaded D and moved the note. Your own `main` did not move:

:::graph
caption: "After git fetch: origin/main moved to D, your main stays on C"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add app
    parents: [A]
  - id: C
    message: Add plan
    parents: [B]
  - id: D
    message: Point to the docs
    parents: [B]
branches:
  main: C
remotes:
  origin/main: D
head: main
:::

In the picture on the right, a remote-tracking branch is the outlined tag that starts with `remote`, like `remote origin/main`. Your own branches are the filled tags that start with `branch`.

### See which branch follows which

You now know the three names. The next question is how your `main` and `origin/main` are connected.

A local branch can **follow** a remote-tracking branch. Git then calls your branch a tracking branch, and the branch it follows its [upstream branch](term:upstream). Your `main` normally follows `origin/main`.

`git branch -vv` lists your branches with what each one follows. The practice project is a small shop app that is already connected to a server:

```console
$ git branch -vv
  feature 292aab7 Add cart
* main    9dbf05a [origin/main] Add app
```

Read one line: the name, the newest commit, the upstream in square brackets, and the commit message. `main` follows `origin/main`. `feature` has no brackets: it follows nothing, because it exists only on your computer.

:::try-it
1. Run `git branch -vv`. Two branches are listed. `main` shows `[origin/main]`; `feature` shows no brackets.
2. Look at the picture. The newest station on the top row carries two tags: `branch main` and `remote origin/main`. The header above the files desk reads `on branch main · level with origin/main`.
:::

### Publish a new branch: `git push -u`

A branch with no upstream is private. Nobody else can see it, and plain `git push` does not know where to send it. Sharing it is one command.

`git push -u origin <branch>` uploads the branch to the server and records that your branch follows the new branch there. `-u` is short for `--set-upstream`.

Practise on a branch of your own, so `feature` stays as it is for the first challenge at the end of this lesson.

:::try-it
1. Create a branch and a commit: `git switch -c try-colors`, then `echo "blue, green" > colors.txt`, `git add colors.txt` and `git commit -m "Add colors"`. In the picture, a new station appears with the `branch try-colors` tag and the `HEAD · you` pin.
2. Run `git push`. Git refuses: `fatal: The current branch try-colors has no upstream branch.` It does not know which server branch this one belongs to.
3. Run `git push -u origin try-colors`. Git prints `* [new branch]      try-colors -> try-colors` and `branch 'try-colors' set up to track 'origin/try-colors'.` In the picture, a `remote origin/try-colors` tag appears on the same station, and the header reads `on branch try-colors · level with origin/try-colors`.
4. Run `git branch -vv`. The line for `try-colors` now shows `[origin/try-colors]`.
:::

```console
$ git push -u origin try-colors
To ../origin.git
 * [new branch]      try-colors -> try-colors
branch 'try-colors' set up to track 'origin/try-colors'.
```

You need `-u` once per branch. After it, plain `git push` and `git pull` on that branch know where to go.

### Get a teammate's branch

Publishing covers your branches. The other direction is the puzzle from the top of the lesson: a teammate pushed a branch and you cannot find it.

You cannot find it because your repository has not asked the server yet. `git fetch` asks. It downloads the new commits and creates or moves your remote-tracking branches. It never touches your own branches or files.

```console
$ git fetch
From ../origin
   9dbf05a..4fc5dbe  main       -> origin/main
 * [new branch]      search     -> origin/search
```

Two lines, two events:

- `9dbf05a..4fc5dbe  main -> origin/main`: the server's `main` moved, so your `origin/main` moved with it.
- `* [new branch]  search -> origin/search`: the server has a branch you had never seen. You now have a remote-tracking branch for it.

You still have no branch of your own called `search`. `origin/search` is only the record. To work on it, switch to the name:

```console
$ git switch search
Switched to a new branch 'search'
branch 'search' set up to track 'origin/search'.
```

When the name you give does not exist locally but matches exactly one remote-tracking branch, `git switch` creates a local branch at the same commit and makes it follow `origin/search`. You did not type `-u`: the upstream is set for you.

:::predict
question: "Your teammate pushed a commit to main on the server five minutes ago. You run git branch -vv without fetching. What does it say about main?"
answer: "Still `[origin/main]`, as if nothing happened. `git branch -vv` reads your record, and the record only changes when you fetch."
:::

:::try-it
1. Run `git switch main`, then `git fetch`. Git prints the two lines above. In the picture, two new stations appear: "Point to the docs" and "Start search". The `remote origin/main` tag moves forward to "Point to the docs"; the `branch main` tag stays where it was. If the rows are hard to see, press "Expand" on the History panel.
2. Run `git status`. It says `Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.` The header in the picture reads `on branch main · 1 behind origin/main`.
3. Run `git switch search`. Git creates your own `search` and says it tracks `origin/search`. In the picture, the "Start search" station now carries both `branch search` and `remote origin/search`.
4. Run `git switch main` to go back.
:::

:::compare
today: "`git switch search` creates the local branch and sets its upstream."
book: "`git checkout search`, `git checkout --track origin/search` and `git checkout -b search origin/search` do the same and still work."
:::

### Ahead and behind

You have seen "behind by 1". This is the daily use of an upstream: Git can tell you where your branch stands compared with the server.

- **Ahead** counts commits your branch has that its upstream does not. They are waiting to be pushed.
- **Behind** counts commits the upstream has that your branch does not. They are waiting to be pulled.

Both can be true at once. Make one commit on `main` now, while it is still behind:

```console
$ git branch -vv
  feature    292aab7 Add cart
* main       f1ce6f4 [origin/main: ahead 1, behind 1] Add plan
  search     39b8fca [origin/search] Start search
  try-colors 8661d66 [origin/try-colors] Add colors
```

`[origin/main: ahead 1, behind 1]` is the second diagram from the top of this lesson: you have C, the server has D. `git status` says the same in a sentence:

```console
$ git status
On branch main
Your branch and 'origin/main' have diverged,
and have 1 and 1 different commits each, respectively.
  (use "git pull" if you want to integrate the remote branch with yours)
```

The fix is the one from the previous lesson: pull, then push.

:::try-it
1. On `main`, make a commit: `echo "ship on Friday" > plan.txt`, `git add plan.txt`, `git commit -m "Add plan"`. In the picture, your new station goes on the top row with `branch main`, and "Point to the docs" with `remote origin/main` sits on a row below. The header reads `on branch main · 1 ahead, 1 behind origin/main`.
2. Run `git pull --no-edit`. Git fetches and merges `origin/main` into `main`; `--no-edit` accepts the ready-made merge message, so no editor opens. In the picture, a merge station joins the two rows, and the header reads `2 ahead of origin/main`: your commit and the merge commit.
3. Run `git push`. No names needed: `main` has an upstream. The `remote origin/main` tag jumps onto the merge station, and the header reads `level with origin/main`.
:::

:::careful
Ahead and behind compare your branch with your **record** of the server. They are as fresh as your last fetch. "Up to date with 'origin/main'" only means "nothing new since I last asked". Run `git fetch` before you trust the numbers. With several remotes, `git fetch --all` asks every one.
:::

### What plain `git pull` and `git push` do

You just ran both commands without naming a server or a branch. The upstream is what makes that work.

- `git pull` on a tracking branch is `git fetch` followed by `git merge` of the upstream. On `main` it merges `origin/main`.
- `git push` on a tracking branch sends the branch to the server branch it follows.

Pro Git's advice is to prefer the two steps while you learn: `git fetch`, look at what arrived (`git status`, `git log --oneline main..origin/main`), then `git merge origin/main`. You see what you are about to merge before it happens.

### Set or change an upstream by hand

Sometimes the branch already exists on both sides but is not connected: you pushed without `-u`, or you created the local branch yourself.

`git branch -u origin/<name>` connects the branch you are on to that remote-tracking branch. The long form is `--set-upstream-to`.

```console
$ git branch -u origin/main
branch 'feature' set up to track 'origin/main'.
```

`git branch --unset-upstream` removes the connection.

Once a branch has an upstream, you can write `@{u}` (or `@{upstream}`) wherever you would write the upstream's name:

| You type | Same as, on `main` | Shows or does |
|---|---|---|
| `git log --oneline @{u}..` | `git log --oneline origin/main..main` | Your commits not pushed yet |
| `git log --oneline ..@{u}` | `git log --oneline main..origin/main` | Fetched commits you have not merged yet |
| `git merge @{u}` | `git merge origin/main` | Merges the upstream |

It is worth knowing: the same command works on every branch, whatever it follows.

### Delete a branch on the server

Branches are cheap, so they pile up. When a branch is merged and finished, remove it on the server too.

`git push origin --delete <branch>` removes the branch from the server, and your remote-tracking branch for it.

```console
$ git push origin --delete try-colors
To ../origin.git
 - [deleted]         try-colors
```

Your **local** branch is a separate thing and is still there. `git branch -vv` marks its upstream as gone:

```console
$ git branch -vv
  try-colors 8661d66 [origin/try-colors: gone] Add colors
```

Delete it with `git branch -d try-colors` (or `-D` if Git says it is not fully merged and you are sure).

There is one more leftover, and it is on your teammates' computers. When someone else deletes a branch on the server, a plain `git fetch` does **not** remove your record of it. Your `origin/search` stays, pointing at a branch that no longer exists. `git fetch --prune` removes such stale records:

```console
$ git fetch --prune
From ../origin
 - [deleted]         (none)     -> origin/search
```

:::try-it
1. Run `git push origin --delete try-colors`. In the picture, the `remote origin/try-colors` tag disappears; the `branch try-colors` tag stays.
2. Play the teammate for one command: `git -C ../teammate push origin --delete search`. This runs Git inside the teammate's folder, next to yours, and deletes `search` on the server.
3. Run `git fetch`, then `git branch -r` (`-r` lists remote-tracking branches). `origin/search` is still listed: the plain fetch did not remove it.
4. Run `git fetch --prune`. Git prints `- [deleted]  (none) -> origin/search`, and the `remote origin/search` tag disappears from the picture. Your own `branch search` stays until you delete it.
:::

:::careful
Deleting a branch on the server removes it for the whole team. Check that it is merged first: `git branch -r --merged origin/main` lists the remote-tracking branches whose work is already in `origin/main`.
:::

### When it goes wrong

```console
$ git push
fatal: The current branch feature has no upstream branch.
To push the current branch and set the remote as upstream, use

    git push --set-upstream origin feature
```

The branch follows nothing, so Git does not know where to push. Run the command Git suggests (`git push -u origin feature` is the short form). If the branch already exists on the server, `git branch -u origin/feature` connects it without pushing.

```console
$ git push origin featur
error: src refspec featur does not match any
error: failed to push some refs to '../origin.git'
```

You asked Git to push something that does not exist here: a typo in the branch name, or a branch with no commit yet. Check the name with `git branch`.

```console
$ git switch serch
fatal: invalid reference: serch
```

There is no local branch and no remote-tracking branch with that name. Either it is a typo, or you have not fetched since your teammate pushed it. Run `git fetch`, check `git branch -r`, and try again.

```console
$ git switch origin/main
fatal: a branch is expected, got remote branch 'origin/main'
hint: If you want to detach HEAD at the commit, try again with the --detach option.
```

You cannot be "on" a remote-tracking branch: it is a record, and only Git moves it. Switch to your own `main`. With `--detach` you can look at that commit in a [detached HEAD](term:detached-head), but commits made there belong to no branch.

```console
Your branch and 'origin/main' have diverged,
and have 1 and 1 different commits each, respectively.
```

You and the server each have commits the other lacks. Pull (fetch and merge), fix a conflict if one appears, then push, as in the previous lesson.

## Under the hood

"Must know" treated `origin/main` and the upstream as ideas. Both are small things on disk, and seeing them makes the rules above obvious.

### A remote-tracking branch is a ref in its own folder

Your own branches are files in `.git/refs/heads/`. Remote-tracking branches are the same kind of file, a [ref](term:ref) holding one commit ID, kept apart in `.git/refs/remotes/<remote>/`:

```console
$ ls .git/refs/remotes/origin
HEAD
feature
main
search
```

That folder is the reason you cannot commit on `origin/main`. A commit moves the branch that HEAD points to, and HEAD can only point to a branch under `refs/heads/`. Refs under `refs/remotes/` are moved by fetch, pull and push, and by nothing else.

The file `HEAD` in that folder is `origin/HEAD`. It names the server's default branch (`ref: refs/remotes/origin/main`), so that `origin` on its own means `origin/main`.

### The upstream is two lines of configuration

Setting an upstream writes a small block into the repository's own [configuration](term:config) file. After `git push -u origin feature`, `.git/config` ends like this:

```console
$ cat .git/config
[remote "origin"]
	url = ../origin.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
	remote = origin
	merge = refs/heads/main
[branch "feature"]
	remote = origin
	merge = refs/heads/feature
```

(The `[core]` block at the top is left out here.)

Read the `[branch "feature"]` block as: "for my branch `feature`, the remote is `origin`, and the branch to merge from there is `feature`". That is the whole upstream. `git pull` reads these two lines to know what to fetch and merge; `git push` reads them to know where to send.

The `fetch =` line under `[remote "origin"]` is the rule that turns every branch on the server into an `origin/...` branch here. The lesson "Refspecs: how fetch and push map branches" reads it piece by piece.

You can ask Git for a branch's upstream directly:

```console
$ git rev-parse --abbrev-ref feature@{upstream}
origin/feature
```

### How ahead and behind are counted

Git does not store the two numbers. Each time, it compares two histories it already has: the commits reachable from `main` and the commits reachable from `origin/main`. Commits only in the first are "ahead"; commits only in the second are "behind". No network is used, which is why the answer is instant and why it can be stale.

## Advanced

### Stop typing `-u`

Since Git 2.37 one setting makes plain `git push` set the upstream for a new branch by itself:

```console
$ git config --global push.autoSetupRemote true
```

With it, `git push` on a branch with no upstream behaves like `git push -u origin <same name>`.

### Prune on every fetch

`git config --global fetch.prune true` makes every `git fetch` and `git pull` remove stale remote-tracking branches, as if you had typed `--prune`.

### List remote-tracking branches

| Command | Lists |
|---|---|
| `git branch` | Your local branches |
| `git branch -r` | Remote-tracking branches |
| `git branch -a` | Both; remote-tracking ones are shown as `remotes/origin/...` |
| `git remote show origin` | What the server has, which local branches pull from what, and whether a push is up to date |

`git remote show origin` contacts the server, so its answer is current.

### Push under a different name

`git push origin feature:cart-work` pushes your `feature` to a server branch named `cart-work`. The part before the colon is yours, the part after it is the server's. The lesson "Refspecs: how fetch and push map branches" explains this notation.

### A local branch with another name

`git switch -c sf origin/search` creates a local branch `sf` that follows `origin/search`. `git switch --track origin/search` is the long way to get a `search` that follows it.

### `origin/HEAD`

`origin/HEAD` records which branch the server treats as its default. If the server's default changes, `git remote set-head origin -a` asks the server and updates it:

```console
$ git remote set-head origin -a
'origin/HEAD' is unchanged and points to 'main'
```

### Rename the default branch for a team

Renaming `master` to `main` locally is `git branch -m master main`. On a shared project it is a team job. Pro Git's checklist, in short:

1. Push the new name: `git push -u origin main`.
2. Change the default branch in the hosting service's settings, and update anything that names the old branch (build scripts, open pull requests, documentation).
3. Delete the old one: `git push origin --delete master`.
4. Every teammate fetches with `--prune` and points their branch at the new upstream: `git branch -u origin/main`.

## Recap

- `main` is yours; `origin/main` is your record of the server's `main`, moved only by fetch, pull and push; the server's `main` is the third.
- `git push -u origin <branch>` publishes a branch and sets its upstream. After that, plain `git push` and `git pull` work.
- `git fetch`, then `git switch <name>`, gives you a teammate's branch as a local branch that follows `origin/<name>`.
- `git branch -vv` shows each branch's upstream with ahead and behind. The numbers are as fresh as your last fetch.
- `git push origin --delete <branch>` removes a server branch; `git fetch --prune` clears stale `origin/...` records.
