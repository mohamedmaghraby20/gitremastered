---
id: remotes
title: "Work with remotes: fetch, pull, push"
module: remotes
bookSection: "2.5 Working with Remotes"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes
bookSources:
  - book/progit2/book/02-git-basics/sections/remotes.asc
readFirst: [start-a-repo, how-git-talks]
---

Your teammate finished a feature an hour ago, and your copy of the project still does not have it. Your own commits from this morning exist only on your laptop. This lesson teaches the three commands that move commits between your repository and the team's server: `git fetch`, `git pull` and `git push`.

## Must know

So far every commit you made stayed in your own repository. A team works on one shared copy, usually on a server, and each person has a full copy of their own. The lesson [How Git talks to servers](lesson:how-git-talks) showed what travels between two copies. Here you do the daily work: see which copies you know, bring new commits in, and send yours out.

### A remote is a name for an address

A [remote](term:remote) is a short name your repository keeps for the address of another copy of the project. You type the name; Git looks up the address.

`git remote` lists the names. Add `-v` (verbose) to see the addresses too:

```console
$ git remote -v
origin	../origin.git (fetch)
origin	../origin.git (push)
```

Read it like this:

- `origin` is the remote's name. [origin](term:origin) is the name `git clone` gives to the copy you cloned from. It is only a default: nothing about it is special.
- `../origin.git` is the address. In a real project it is a URL such as `https://github.com/team/trail-map.git`. In this practice project the "server" is a folder next to yours, so everything works offline. Pro Git notes that a remote can be on your own machine: "remote" means "elsewhere", not "far away".
- There are two lines because Git can use one address to download (fetch) and another to upload (push). They are almost always the same.

A repository you started with `git init` has no remote yet. You add one with `git remote add <name> <address>`:

```console
$ git remote add origin ../origin.git
```

Nothing is downloaded or uploaded by this command. It only writes the name and the address into your repository's settings.

### Look at a remote: `git remote show`

Before you move anything, you can ask a remote what it has. `git remote show origin` contacts the server and prints a summary:

```console
$ git remote show origin
* remote origin
  Fetch URL: ../origin.git
  Push  URL: ../origin.git
  HEAD branch: main
  Remote branch:
    main tracked
  Local branch configured for 'git pull':
    main merges with remote main
  Local ref configured for 'git push':
    main pushes to main (local out of date)
```

- **HEAD branch: main** is the server's default branch, the one a new clone starts on.
- **Remote branch: main tracked** means your repository keeps a record of the server's `main`.
- **main merges with remote main** says what `git pull` will do when you are on `main`.
- **main pushes to main (local out of date)** says what `git push` will do, and that the server has commits you do not have.

:::try-it
1. Run `git remote -v`. Git prints the name `origin` twice with the address `../origin.git`: one line for fetching, one for pushing.
2. Run `git remote show origin`. The last line ends with `(local out of date)`: your teammate Tariq pushed a commit to the server that your repository has not seen.
3. Look at the picture. The history map shows two stations, and the board's header reads `on branch main · level with origin/main`. Your repository still believes it is level, because it has not asked the server yet. The next part fixes that.
:::

### `origin/main`: your record of the server's branch

You saw the name `origin/main` in the header. It is the idea that makes the rest of this lesson simple, so take a minute for it.

`origin/main` is a [remote-tracking branch](term:remote-tracking-branch): a bookmark in **your** repository that records where the branch `main` was on `origin` the last time your Git talked to the server. Three things are true of it:

- It lives on your computer. Reading it needs no network.
- You never move it yourself. Only `git fetch`, `git pull` and `git push` move it.
- It can be out of date. If a teammate pushed five minutes ago and you have not fetched since, `origin/main` still points at the old commit.

So there are three pointers to keep apart:

| Pointer | Where it lives | Who moves it |
|---|---|---|
| `main` | Your repository | You, when you commit or merge |
| `origin/main` | Your repository | Git, when you fetch, pull or push |
| `main` on the server | The server | Whoever pushes |

The common wrong idea is that `origin/main` is the server's branch, live. It is your last photo of it.

### Download with `git fetch`

`git fetch origin` asks the server for every commit you do not have, stores them in your repository, and moves `origin/main` to match the server. It changes nothing else: your branch `main`, your staging area and your files stay exactly as they were.

In the practice project, Tariq's commit is waiting on the server:

:::graph
caption: "Before the fetch: your repository has not seen Tariq's commit, so origin/main still sits on B"
commits:
  - id: A
    message: Add README and trail list
  - id: B
    message: Add the ridge walk
    parents: [A]
branches:
  main: B
remotes:
  origin/main: B
head: main
:::

:::predict
question: "You run `git fetch origin`. Tariq's commit adds a file, packing.txt. Will packing.txt be in your folder after the fetch?"
answer: "No. The fetch stores his commit in your repository and moves `origin/main` onto it. Your `main` and your files do not change until you merge."
:::

:::try-it
1. Run `git status`. Git says "Your branch is up to date with 'origin/main'". That sentence compares `main` with your record `origin/main`, and the record is old.
2. Run `git fetch origin`. Git prints `17b7c70..807b5f7  main -> origin/main` (your IDs differ): the server's `main` was copied into your record `origin/main`. In the picture, a new station "Add a packing list" appears with the `remote origin/main` tag on it. The `branch main` tag and the `HEAD · you` pin stay on the station before it, and the header changes to `on branch main · 1 behind origin/main`.
3. Run `ls`. There is no `packing.txt`. The commit is in your repository, but your working tree still shows `main`.
4. Run `git status`. Now Git says "Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded."
:::

```console
$ git fetch origin
From ../origin
   17b7c70..807b5f7  main       -> origin/main
$ git status
On branch main
Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.
  (use "git pull" to update your local branch)

nothing to commit, working tree clean
```

:::graph
caption: "After the fetch: commit C arrived and origin/main moved onto it. main did not move"
commits:
  - id: A
    message: Add README and trail list
  - id: B
    message: Add the ridge walk
    parents: [A]
  - id: C
    message: Add a packing list
    parents: [B]
branches:
  main: B
remotes:
  origin/main: C
head: main
:::

Because a fetch never touches your work, it is always safe. Run it whenever you want to know what the team did. You can read the new commits before you take them: `git log --oneline main..origin/main` lists the commits `origin/main` has and `main` does not, and `git diff main origin/main` shows what they change.

### Take the work in: merge `origin/main`

The fetched commits sit beside your branch. To get them into `main`, you merge, exactly as you merged a branch in the lesson [Branch, merge, and fix conflicts](lesson:branch-and-merge). `origin/main` can be merged like any other branch.

:::try-it
1. Run `git merge origin/main`. Git prints "Fast-forward": you had no new commits of your own, so `main` simply moves forward onto Tariq's commit. In the picture, the `branch main` tag and the `HEAD · you` pin move onto the "Add a packing list" station, next to `remote origin/main`. The header reads `level with origin/main` again.
2. Run `ls`. The file `packing.txt` is there now.
:::

```console
$ git merge origin/main
Updating 17b7c70..807b5f7
Fast-forward
 packing.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 packing.txt
```

### Both steps at once: `git pull`

Fetch, then merge, is what you will do many times a day. `git pull` does both in one command: it fetches from the remote, then merges the fetched branch into the branch you are on.

```console
$ git pull
From ../origin
   564b3d2..541a285  main       -> origin/main
Updating 564b3d2..541a285
Fast-forward
 trails.txt | 1 +
 1 file changed, 1 insertion(+)
```

The first two lines are the fetch, the same lines `git fetch` prints. Everything from "Updating" on is the merge.

Plain `git pull`, with no names, works because your `main` remembers which remote branch it follows. That link is called the [upstream](term:upstream) branch, and `git clone` sets it up for you. The lesson [Remote and tracking branches](lesson:remote-branches) covers upstreams in full.

| Command | Downloads commits | Moves `origin/main` | Changes your `main` and files |
|---|---|---|---|
| `git fetch` | Yes | Yes | No |
| `git pull` | Yes | Yes | Yes, by merging |

Use `git fetch` when you want to look first. Use `git pull` when you just want the latest work.

:::careful
`git pull` merges into your branch right away. If you have uncommitted edits to a file the new commits also change, Git refuses and tells you to commit or stash them first. Commit your work, then pull.
:::

### Upload with `git push`

Fetch and pull bring commits in. `git push` sends yours out.

`git push origin main` tells Git: send the commits of my `main` that the server lacks to `origin`, and move the server's `main` onto my newest commit. When it succeeds, your `origin/main` moves too, because Git now knows where the server's branch is.

Practise with a file of your own:

:::try-it
1. Create and commit a file: `echo "Check the weather first." > todo.txt`, then `git add todo.txt` and `git commit -m "Add a to-do list"`. In the picture, a new station appears and `branch main` moves onto it. The `remote origin/main` tag stays behind, and the header reads `on branch main · 1 ahead of origin/main`.
2. Run `git status`. Git says "Your branch is ahead of 'origin/main' by 1 commit": you have a commit the server does not.
3. Run `git push origin main`. After a few progress lines, Git prints `807b5f7..b2c60d8  main -> main`: the server's `main` moved from the old commit to yours. In the picture, the `remote origin/main` tag jumps onto your station, and the header reads `level with origin/main`.
:::

```console
$ git push origin main
To ../origin.git
   807b5f7..b2c60d8  main -> main
```

Once `main` follows `origin/main`, plain `git push` does the same thing.

**The first push of a branch.** A branch you made yourself follows nothing yet, for example `main` in a repository you started with `git init`. Push it once with `-u`: `git push -u origin main`. The `-u` (short for `--set-upstream`) uploads the branch and records `origin/main` as its upstream, so that plain `git push` and `git pull` work from then on.

```console
$ git push -u origin main
To ../origin.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

### The rejected push

This is the message every team member meets in their first week. You commit, you push, and the server says no:

```console
$ git push
To ../origin.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to '../origin.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

Read it line by line:

- `! [rejected] main -> main (fetch first)`: your `main` was not accepted as the server's `main`, and the reason is in the brackets: fetch first.
- `the remote contains work that you do not have locally`: a teammate pushed after your last fetch.
- `use 'git pull' before pushing again`: the fix.

Why does Git refuse? A push asks the server to move its `main` onto your newest commit. Your commit was built on an older commit and does not contain your teammate's commit. If the server moved its branch to yours, their commit would no longer be on `main`. Git only accepts a push that keeps everything the server already has, which means a [fast-forward](term:fast-forward) of the server's branch.

:::graph
caption: "You and Tariq both committed on top of C. The server has E; your main has D. Pushing D would drop E"
commits:
  - id: C
    message: Add a to-do list
  - id: D
    message: Add a route note
    parents: [C]
  - id: E
    message: Pack sunscreen
    parents: [C]
branches:
  main: D
remotes:
  origin/main: E
head: main
:::

The fix has two steps: pull, then push again.

1. `git pull` fetches the teammate's commit and merges it into your `main`. Both of you have new commits, so this time the merge is not a fast-forward: Git makes a [merge commit](term:merge-commit) that joins the two lines. An editor opens with a ready-made message; save and close it, or run `git pull --no-edit` to accept the message without the editor.
2. `git push` now succeeds, because your `main` contains everything the server has, plus your work.

:::graph
caption: "After git pull, the merge commit M contains both D and E. Pushing M keeps Tariq's commit"
commits:
  - id: C
    message: Add a to-do list
  - id: D
    message: Add a route note
    parents: [C]
  - id: E
    message: Pack sunscreen
    parents: [C]
  - id: M
    message: Merge branch 'main' of ../origin
    parents: [D, E]
branches:
  main: M
remotes:
  origin/main: E
head: main
:::

You can make this happen yourself by playing both people. The folder `../teammate` is Tariq's clone, and `git -C <folder>` runs a Git command in another folder without leaving yours.

:::try-it
1. Be Tariq for a moment. Bring his clone up to date with `git -C ../teammate pull`, add a line with `echo "Sunscreen." >> ../teammate/packing.txt`, commit it with `git -C ../teammate commit -am "Pack sunscreen"`, and push it with `git -C ../teammate push`. The server now has a commit you do not have. Your picture does not change: your repository has not fetched.
2. Be yourself again. Run `echo "Tell someone your route." >> todo.txt`, then `git commit -am "Add a route note"`.
3. Run `git push`. Git prints `! [rejected]`, the message above. Nothing was sent.
4. Run `git pull --no-edit`. Git prints "Merge made by the 'ort' strategy." In the picture, Tariq's "Pack sunscreen" station appears on a second row with the `remote origin/main` tag, and a new merge station joins the two rows; `branch main` sits on it. Press "Expand" on the History panel to see both rows.
5. Run `git push`. It goes through, and the `remote origin/main` tag moves onto the merge station. The header reads `level with origin/main`.
:::

```console
$ git log --oneline --graph -4
*   564b3d2 (HEAD -> main, origin/main, origin/HEAD) Merge branch 'main' of ../origin
|\
| * 1231aec Pack sunscreen
* | 1fab16f Add a route note
|/
* b2c60d8 Add a to-do list
```

Pull before you start working and again before you push, and you will meet this message rarely.

### Rename and remove a remote

Names can change. `git remote rename backup mirror` renames the remote `backup` to `mirror`, and its remote-tracking branches follow: `backup/main` becomes `mirror/main`. `git remote remove mirror` deletes the name, its address and its remote-tracking branches from your repository. Neither command touches the server.

### When it goes wrong

```console
$ git fetch orgin
fatal: 'orgin' does not appear to be a git repository
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

Git knows no remote called `orgin`: here, a typo. Check the name with `git remote -v`. You get the same message when the remote does not exist at all; add it with `git remote add`.

```console
$ git push
fatal: The current branch main has no upstream branch.
To push the current branch and set the remote as upstream, use

    git push --set-upstream origin main
```

The branch follows no remote branch yet, so plain `git push` does not know where to send it. Run the command Git suggests; `--set-upstream` is the long form of `-u`. The lesson "Remote and tracking branches" explains upstreams.

```console
$ git pull
hint: You have divergent branches and need to specify how to reconcile them.
...
fatal: Need to specify how to reconcile divergent branches.
```

You and the server both have new commits, and your Git has not been told how `git pull` should join them. Git for Windows ships with the answer "merge"; on macOS and Linux you choose once: `git config --global pull.rebase false` makes `git pull` merge, which is what this lesson teaches. This practice project is already set that way.

```console
$ git pull
Auto-merging packing.txt
CONFLICT (content): Merge conflict in packing.txt
Automatic merge failed; fix conflicts and then commit the result.
```

You and a teammate changed the same lines. The fetch worked; the merge stopped. Resolve it as in the lesson "Branch, merge, and fix conflicts": fix the file, `git add` it, `git commit`. To go back to before the pull, run `git merge --abort`.

One more, rarely: `fatal: refusing to merge unrelated histories` means the two repositories share no commit at all, usually because you ran `git init` and committed instead of cloning the team's project. Clone the project and copy your files into the clone.

## Under the hood

"Must know" treated `origin/main` as a bookmark and a remote as a name. Both are small pieces of text inside `.git`, and you can read them.

### Where `origin/main` lives

A remote-tracking branch is a [ref](term:ref), like a local branch, kept in a different folder:

```console
$ cat .git/refs/heads/main
17b7c7083e8dff735352cff074aba0a7597ec82c
$ cat .git/refs/remotes/origin/main
807b5f7140cdf2c31d02f80fcb4a1700c3cae28f
```

This is the moment after the fetch in the first Try-it: `main` is one commit behind. `refs/heads/` holds your branches; `refs/remotes/origin/` holds your records of the branches on `origin`. Each file holds one commit ID. A fetch downloads the missing objects, then rewrites the file under `refs/remotes/origin/`. It never writes under `refs/heads/`, which is why a fetch cannot change your branch.

(Your IDs differ from the ones printed here. After Git tidies its storage, these refs may move into the single file `.git/packed-refs`.)

### Where the remote is written down

`git remote add` and `git clone` write a block into `.git/config`, and `git push -u` adds a second one:

```console
$ cat .git/config
...
[remote "origin"]
	url = ../origin.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
	remote = origin
	merge = refs/heads/main
```

- `url` is the address `git remote -v` prints.
- `fetch` is the rule for which branches to download and where to record them: every branch under `refs/heads/` on the server goes to `refs/remotes/origin/` here. A rule like this is called a [refspec](term:refspec); the lesson [Refspecs: how fetch and push map branches](lesson:refspecs) reads it piece by piece.
- The `[branch "main"]` block is the upstream: "`main` follows the branch `main` on `origin`". Plain `git pull` and `git push` read it.

### What a push changes

A push sends the objects the server lacks, then asks the server to move one of its refs. The server on the other side is a [bare repository](term:bare-repository): it has no working tree, so no file on it needs updating, only the ref. The server agrees when the ref's old commit is an ancestor of the new one. That check is the whole rule behind the rejected push.

### FETCH_HEAD

Every fetch also writes what it downloaded into the file `.git/FETCH_HEAD`. `git pull` reads that file to know what to merge. You will rarely need it yourself.

## Advanced

### `git pull --rebase`

A pull that merges leaves a merge commit each time you and a teammate both had new work. Some teams prefer a straight history. `git pull --rebase` fetches, then replays your new commits on top of the fetched ones, so no merge commit is made. `git config --global pull.rebase true` makes that the default for every pull.

Rebasing rewrites your commits, and it has rules of its own. Learn it in the lesson [Rebasing, and when not to](lesson:rebasing) before you switch.

### `git pull --ff-only`: never merge by surprise

`git pull --ff-only` pulls only when the merge is a fast-forward, and stops with an error when your branch and the server's have both moved. You then decide what to do. `git config --global pull.ff only` makes it the default. It is a careful setting for people who want every merge commit to be a choice.

### Fetch from every remote

`git fetch --all` fetches from all your remotes in one go. Plain `git fetch`, with no name, fetches from the upstream's remote, usually `origin`.

### Try a push without sending

`git push --dry-run` (or `-n`) prints what a push would send and which refs it would move, without sending anything:

```console
$ git push --dry-run
To ../origin.git
   ad451d0..6941f62  main -> main
```

### Force-pushing

`git push --force` tells the server to move its branch to your commit even when that drops commits it has.

:::careful
Never force-push to a branch other people use, such as `main`. Their commits disappear from the server's branch, and their next pull becomes a mess. The lesson "Force-pushing safely with `--force-with-lease`" shows the one safe form and when it is acceptable.
:::

### More than one remote

A repository can have several remotes. A common pair in open source: `origin` is your own copy of a project on the server, and `upstream` is the original project you copied it from. You fetch from `upstream` to get the project's new work and push to `origin`:

```console
$ git remote add upstream https://github.com/project/trail-map.git
$ git fetch upstream
$ git merge upstream/main
$ git push origin main
```

Each remote gets its own remote-tracking branches: `origin/main` and `upstream/main` are two separate records. The lesson "Forks, GitHub Flow and pull requests" uses this setup.

### Change a remote's address

When a project moves, keep the name and change the address: `git remote set-url origin <new-address>`. `git remote get-url origin` prints the current one.

## Recap

- A remote is a short name for another copy's address; `git remote -v` lists them, `git remote add <name> <address>` adds one.
- `origin/main` is your record of the server's `main`. Only fetch, pull and push move it.
- `git fetch` downloads commits and moves `origin/main`; your branch and files do not change.
- `git pull` is fetch plus merge. `git push` uploads your commits and moves the server's branch.
- A rejected push means the server has commits you lack: `git pull`, then `git push` again.
