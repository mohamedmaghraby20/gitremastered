---
id: refspecs
title: "Refspecs: how fetch and push map branches"
module: remotes
bookSection: "10.5 The Refspec"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-The-Refspec
bookSources:
  - vendor/progit2/book/10-git-internals/sections/refspec.asc
readFirst: [remote-branches]
---

You run `git fetch`, and `origin/main` moves while your own `main` stays where it was. You delete a server branch with `git push origin --delete x`, and an older guide spells the same thing `git push origin :x`. One small rule explains both, and once you can read it, you can send any branch to any name on a server.

## Must know

In [Remote and tracking branches](lesson:remote-branches) you used `fetch` and `push` with short names, like `git push origin main`. Git fills in the rest for you. This lesson shows what it fills in.

The rule is called a [refspec](term:refspec), short for "reference specification". It answers one question for a fetch or a push: **which name on that side becomes which name on this side?**

### Names in full

A refspec is written with full names, so those come first.

In [A first look inside .git](lesson:first-look-inside) you saw that a branch is a [ref](term:ref): a small file under `.git/refs` that holds a commit ID. The short names you type every day are the ends of longer ones:

| You type | Full name | What it is |
|---|---|---|
| `main` | `refs/heads/main` | Your local branch |
| `origin/main` | `refs/remotes/origin/main` | Your record of `main` on the server (a [remote-tracking branch](term:remote-tracking-branch)) |
| `v1.0` | `refs/tags/v1.0` | A tag |

Git accepts the short form, the full form, and anything in between. These three commands print the same history, because Git expands each name to `refs/remotes/origin/main`:

```console
$ git log --oneline origin/main
$ git log --oneline remotes/origin/main
$ git log --oneline refs/remotes/origin/main
```

So there are three separate shelves: `refs/heads/` for your branches, `refs/remotes/origin/` for your record of the server's branches, and `refs/tags/` for tags. A refspec moves names from a shelf on one computer to a shelf on the other.

### The fetch line

Now you can read the rule Git wrote for you on the day the remote was added.

Every remote has a block in the file `.git/config`, the repository's own [settings](term:config). The practice project on the right has one remote, `origin`:

```console
$ cat .git/config
...
[remote "origin"]
	url = ../origin.git
	fetch = +refs/heads/*:refs/remotes/origin/*
```

The `fetch` line is a refspec. Its shape is always an optional `+`, then **source**, a colon, then **destination**:

| Piece | In the line | Meaning |
|---|---|---|
| Source | `refs/heads/*` | Names on the side the data comes **from**. For a fetch that is the server: its branches. |
| `:` | | "becomes" |
| Destination | `refs/remotes/origin/*` | Names on the side the data goes **to**. For a fetch that is your repository: your record of the server. |
| `*` | on both sides | Any name. Whatever the star matched on the left is put in place of the star on the right. |
| `+` | at the start | Update the destination even when the move is not a fast-forward (explained below). |

Read the whole line as one sentence: "every branch on the server, `refs/heads/something`, becomes `refs/remotes/origin/something` here."

That is the answer to the first puzzle. A fetch writes into `refs/remotes/origin/`. Your own branches live in `refs/heads/`, and the fetch line never names that shelf as a destination. So `git fetch` cannot move your `main`; only a merge or a pull does that, as a second step.

:::try-it
1. Run `cat .git/config`. Find the `[remote "origin"]` block and its `fetch` line.
2. Run `git branch -r`. Git lists `origin/main` and `origin/qa/smoke`: the server has two branches, `main` and `qa/smoke`, and the fetch line gave each one a name under `origin/`. On the history map they are the `remote origin/main` and `remote origin/qa/smoke` tags.
3. Run `git log --oneline refs/remotes/origin/main`, then `git log --oneline origin/main`. Both print the same two commits: the short name is only a shorter way to write the full one.
:::

### A refspec for one fetch

The line in the config file is the default. You can also hand `git fetch` a refspec of your own, for that one run.

Here the server's `main` is fetched into a name you choose, `origin/mymain`:

:::predict
question: "You run `git fetch origin main:refs/remotes/origin/mymain`. Which names change in your repository: `main`, `origin/main`, or something else?"
answer: "Neither. A new remote-tracking branch `origin/mymain` appears, pointing at the same commit as the server's `main`. Your refspec named only that one destination."
:::

:::try-it
1. Run `git fetch origin main:refs/remotes/origin/mymain`. Git prints `* [new branch]      main       -> origin/mymain`. The arrow is the refspec in action: source on the left, destination on the right. On the history map, a new `remote origin/mymain` tag appears on the newest station of `main`.
2. Run `git branch -r`. The list now has `origin/mymain` next to `origin/main`.
3. Tidy up: `git branch -dr origin/mymain` deletes a remote-tracking branch from your record (`-r` means "remote-tracking"). Git answers `Deleted remote-tracking branch origin/mymain`, and the tag leaves the map. Nothing changed on the server.
:::

:::graph
caption: "After the one-off fetch: a second record of the server's main, under a name you chose"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add app
    parents: [A]
branches:
  main: B
remotes:
  origin/main: B
  origin/mymain: B
head: main
:::

Two shorter forms are worth knowing:

- `git fetch origin main` names only a source. Git downloads that one branch and updates `origin/main`, and leaves the other branches for later. This is how you fetch a single branch from a server with hundreds.
- You can give several refspecs in one command, separated by spaces.

### What the `+` is for

One piece of the fetch line is still unexplained: the plus sign at the front.

Normally a branch only moves forward: the new commit has the old one in its history. That is a [fast-forward](term:fast-forward). Sometimes a teammate rewrites a branch on the server, for example by amending a commit that was already pushed. Then the server's branch points at a commit that does **not** have the old one behind it.

Without a `+`, Git refuses to move a ref that way, because the old commits would drop out of sight. With a `+`, it moves the ref anyway. Here a teammate rewrote `qa/smoke`, and one fetch tries both:

```console
$ git fetch origin qa/smoke:refs/remotes/origin/mysmoke main:refs/remotes/origin/mymain
From ../origin
 ! [rejected] qa/smoke   -> origin/mysmoke  (non-fast-forward)
 + 81c8dbd...7e21b8c qa/smoke   -> origin/qa/smoke  (forced update)
```

- The first line is the refspec typed by hand, with no `+`: rejected.
- The second line is the default fetch line doing its usual work. It has a `+`, so `origin/qa/smoke` moved, and Git marks the move with `+` and `(forced update)`.

The default line can afford the `+`. Remote-tracking branches are only your record of the server. If the server changed, the honest record is the new state, and no work of yours lives in `refs/remotes/origin/`.

### Push refspecs

Fetch copies names from the server to you. Push goes the other way, and it uses the same source-colon-destination rule with the sides swapped: the **source is your repository**, the **destination is the server**.

The short command you know is a refspec with most of it left out:

| You type | Git reads it as |
|---|---|
| `git push origin main` | `git push origin refs/heads/main:refs/heads/main` |

"My branch `main` becomes the branch `main` on the server." When you write only one name, Git uses it for both sides.

Write both sides yourself, and the two names can differ. This pushes your local branch `scratch` to the server under the name `tmp/scratch`:

```console
$ git push origin scratch:tmp/scratch
To ../origin.git
 * [new branch]      scratch -> tmp/scratch
```

Teams use this when the server has naming rules: review branches under `review/`, test branches under `qa/`. The slash is part of the name; it groups branches the way folders group files. Your local branch can keep any name you like.

### Deleting with an empty source

Now the second puzzle. A refspec says "source becomes destination". Leave the source empty, and you tell the server: "**nothing** becomes this branch." The server deletes it.

```console
$ git push origin :tmp/scratch
To ../origin.git
 - [deleted]         tmp/scratch
```

:::compare
today: "`git push origin --delete tmp/scratch` deletes the branch on the server. It says what it does."
book: "`git push origin :tmp/scratch` is the same command as a refspec with an empty source. Older guides and many scripts use it."
:::

:::predict
question: "Your local branch `scratch` was pushed as `tmp/scratch`. You run `git push origin :tmp/scratch`. What happens to your local `scratch`?"
answer: "Nothing. The refspec has no source, so nothing of yours is involved. Only the name `tmp/scratch` on the server is deleted, and your record `origin/tmp/scratch` with it."
:::

:::try-it
1. Make a branch of your own to play with: `git branch scratch`. On the history map, a `branch scratch` tag appears on the same station as `main`.
2. Run `git push origin scratch:tmp/scratch`. Git prints `* [new branch]      scratch -> tmp/scratch`. On the map, a `remote origin/tmp/scratch` tag appears on that station: a push updates your record of the server too.
3. Run `git ls-remote origin`. This lists the refs on the server itself. The branch is there as `refs/heads/tmp/scratch`, and there is no `refs/heads/scratch`.
4. Run `git push origin :tmp/scratch`. Git prints `- [deleted]         tmp/scratch`, and the `remote origin/tmp/scratch` tag leaves the map. The `branch scratch` tag stays.
5. Remove your local branch too: `git branch -d scratch`.
:::

:::careful
A `+` in a **push** refspec is a force push. `git push origin +main` overwrites `main` on the server even when that throws away commits your teammates pushed. On a fetch the `+` only updates your own record; on a push it rewrites a branch other people build on. Never use it on a shared branch. The lesson "Force-pushing safely with `--force-with-lease`" shows the careful way.
:::

### When it goes wrong

```console
$ git push origin nope:whatever
error: src refspec nope does not match any
error: failed to push some refs to '../origin.git'
```

The source side names a branch you do not have. Usually it is a typo, or the branch has a different name (`master` instead of `main`). Check with `git branch`.

```console
$ git fetch origin "main:refs/remotes/origin/my main"
fatal: invalid refspec 'main:refs/remotes/origin/my main'
```

The refspec is not a valid name: here, a space. Ref names cannot contain spaces, `~`, `^`, `:` or `..`.

```console
$ git fetch origin main:main
fatal: refusing to fetch into branch 'refs/heads/main' checked out at 'C:/Users/you/practice/refspecs/project'
```

The destination was your own local branch, the one you are on. Fetching into it would change the branch under your working tree, so Git refuses. You almost always want the destination under `refs/remotes/origin/`, or no destination at all (`git fetch origin main`).

A fourth mistake prints no error: you pushed to the wrong name, for example `git push origin feature:reveiw/feature`. The server now has a branch with the typo. Delete it there with `git push origin --delete reveiw/feature`, then push again with the right name.

## Under the hood

"Must know" treated the two sides of a refspec as shelves. This layer shows where those shelves are on disk, so you can check any refspec by looking.

### Where each side lives

| Side | Folder | Look at it with |
|---|---|---|
| Your branches | `.git/refs/heads/` | `git branch` |
| Your record of the server | `.git/refs/remotes/origin/` | `git branch -r` |
| The server's branches | `refs/heads/` inside the server's repository | `git ls-remote origin` |

`git ls-remote origin` asks the server for its list of refs and prints it, without downloading anything:

```console
$ git ls-remote origin
5d5ad3662c6d6dd2b1658c9367062a99c92d6a8f	HEAD
5d5ad3662c6d6dd2b1658c9367062a99c92d6a8f	refs/heads/main
d93bbfc737234e73c9e3f5ef5c83f7db9dc61a5b	refs/heads/qa/smoke
5d5ad3662c6d6dd2b1658c9367062a99c92d6a8f	refs/tags/v1.0
```

This is the **source** side of the fetch line, exactly as the server sees it. Apply `refs/heads/*:refs/remotes/origin/*` to each line by hand and you get your remote-tracking branches: `refs/heads/qa/smoke` becomes `refs/remotes/origin/qa/smoke`. The tag does not match `refs/heads/*`, so the fetch line does not cover it; Git brings along tags that point at commits you fetch as a separate, built-in step.

In the practice project the "server" is the folder `../origin.git`, so you can even list its shelf directly: `ls ../origin.git/refs/heads`.

When a repository has many refs, Git may store them as lines in one file, `.git/packed-refs`, in place of one small file each. The names stay the same.

### Asking Git what a name means

Two commands save you from guessing:

```console
$ git rev-parse --symbolic-full-name main origin/main v1.0
refs/heads/main
refs/remotes/origin/main
refs/tags/v1.0
```

```console
$ git config --get-all remote.origin.fetch
+refs/heads/*:refs/remotes/origin/*
```

The first prints the full name behind a short one. The second prints every fetch line of a remote; `--get-all` matters because a remote can have more than one (Advanced).

### What a fetch does with the line

In [How Git talks to servers](lesson:how-git-talks) you saw that a fetch asks the server for its refs, works out which commits you lack, and downloads them. The refspec is the last step: for every server ref that matches a source pattern, Git writes the matching destination ref in your repository. A ref that matches no pattern is skipped, and its commits are not downloaded.

## Advanced

### Several fetch lines: fetch only what you need

A remote can have more than one `fetch` line. Pro Git's example: a QA team pushes its branches under `qa/`, and you want `main` and the QA branches but nothing else.

```text
[remote "origin"]
	url = ../origin.git
	fetch = +refs/heads/main:refs/remotes/origin/main
	fetch = +refs/heads/qa/*:refs/remotes/origin/qa/*
```

Set the lines from the command line. Plain `git config` replaces the value; `--add` adds a second line with the same key:

```console
$ git config remote.origin.fetch "+refs/heads/main:refs/remotes/origin/main"
$ git config --add remote.origin.fetch "+refs/heads/qa/*:refs/remotes/origin/qa/*"
$ git config --get-all remote.origin.fetch
+refs/heads/main:refs/remotes/origin/main
+refs/heads/qa/*:refs/remotes/origin/qa/*
```

Keep the quotes: without them your shell may try to expand the `*` itself.

Since Git 2.6 the star may also sit inside a name: `+refs/heads/qa*:refs/remotes/origin/qa*` matches `qa-smoke` and `qa/smoke` alike.

### Pruning follows the fetch lines

`git fetch --prune` removes remote-tracking branches whose branch is gone from the server. It only looks at names your fetch lines cover.

That has a surprising result after you narrow the lines. Say your record still holds `origin/feature` from before:

```console
$ git fetch --prune
$ git branch -r
  origin/feature
  origin/main
  origin/qa/smoke
```

`origin/feature` is still there. No fetch line maps anything to it any more, so fetch neither updates nor prunes it. Delete such leftovers yourself: `git branch -dr origin/feature`.

### A push line in the config

A remote can also have a `push` line: the refspec `git push origin` uses when you name no branch. Pro Git's QA team pushes its `main` to `qa/main` every time:

```text
[remote "origin"]
	url = ../origin.git
	fetch = +refs/heads/*:refs/remotes/origin/*
	push = refs/heads/main:refs/heads/qa/main
```

It is rare. Most people rely on upstream branches, which "Remote and tracking branches" covered.

### `HEAD` as the source

`git push origin HEAD` pushes the branch you are on to the same name on the server, whatever it is called. `git push origin HEAD:main` pushes the commit you are on to the server's `main`. Scripts use both, because they work without knowing the branch name.

### Pull requests are refs too

GitHub keeps every pull request as a ref on the server, under `refs/pull/<number>/head`. The default fetch line only covers `refs/heads/*`, so you never see them. One extra line brings them in as remote-tracking branches:

```text
fetch = +refs/pull/*/head:refs/remotes/origin/pr/*
```

After a fetch, pull request 42 is `origin/pr/42`, and you can look at it or test it locally. The GitHub lessons come back to this.

### Tags and negative refspecs

- `git fetch origin "refs/tags/*:refs/tags/*"` fetches every tag, the same as `git fetch --tags`. `git push origin "refs/tags/*"` pushes every tag, the same as `git push --tags`.
- A refspec that starts with `^` excludes names: `git fetch origin "refs/heads/*:refs/remotes/origin/*" "^refs/heads/tmp/*"` fetches every branch except those under `tmp/`.

## Recap

- A refspec is `+source:destination`. On a fetch the source is the server; on a push the source is you.
- The default fetch line `+refs/heads/*:refs/remotes/origin/*` is why `git fetch` moves `origin/main` and never your `main`.
- `main` is short for `refs/heads/main`, `origin/main` for `refs/remotes/origin/main`, `v1.0` for `refs/tags/v1.0`.
- `git push origin feature:review/feature` pushes a branch under another name; `git push origin :name` (empty source) deletes `name` on the server.
- A leading `+` allows a move that is not a fast-forward. It is harmless in the fetch line and a force push in a push.
