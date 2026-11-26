---
id: large-repos
title: "Shallow and partial clone, sparse checkout, LFS, bundles, git maintenance"
module: modern-git
bookSection: "7.12 Bundling"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Bundling
bookSources:
  - book/progit2/book/07-git-tools/sections/bundling.asc
readFirst: [remotes]
---

You want to fix one typo in a big project's manual, and the clone has been running for twenty minutes and has filled four gigabytes of your disk. Git can download less: only the newest commit, only the file contents you really open, or only the folder you work in. This lesson shows each tool, what it costs, and which one fits which problem.

## Must know

In the lesson [Start or clone a repository](lesson:start-a-repo) you learned that a [clone](term:clone) copies the whole project: every commit and every version of every file. For most projects that is the right choice, and it takes seconds. For a few very large projects it is slow, and then you need to know what you can leave on the server.

### Why a repository gets slow

Three different things make a repository heavy. Each one has its own cure, so name the cause before you pick a tool.

| Cause | Example | What suffers |
|---|---|---|
| A long history | 15 years of work, a million commits | The clone, because it downloads every commit |
| Very many files | 300,000 files, because many projects share one repository (people call that a monorepo) | `git status` and switching branches, because Git checks every file |
| Big binary files | Pictures, videos, game art, each saved again every time it changes | The clone and your disk, because Git keeps every old version |

A binary file is a file that is not text: a picture, a video, a zip file. Git stores text changes in very little space, but it cannot do that for most binary files. Change one pixel of a 50 MB picture ten times, and the repository holds close to 500 MB of pictures.

### The practice project

The practice "server" is a folder beside the practice folder, at the address `../game.git`. It holds a small game with ten commits and three folders: `src` (code), `docs` (the manual) and `art` (pictures). The pictures are the heavy part, and one of them, `art/ship.png`, was redrawn twice, so the history holds three versions of it.

The practice folder itself starts empty: the first challenge at the end of this lesson needs it that way. In the Try-its you clone into folders of your own inside it and remove them afterwards. The picture stays empty the whole time, because it follows the practice folder itself and not the folders inside it. In the challenges you clone into the practice folder itself, and the picture shows the result: after a `--depth 1` clone, for example, the history map holds a single station.

Start with an ordinary clone, to have numbers to compare with.

:::try-it
1. Run `git clone ../game.git full`, then `cd full`. Git prints `Cloning into 'full'...` and `done.`
2. Run `git log --oneline`. Git lists ten commits, from "Brighten the ship" down to "Add README".
3. Run `du -sh .git`. `du -sh` prints the size of a folder; here it prints about `1.3M`, the size of the whole history on your disk.
4. Go back and remove the clone: `cd ..`, then `rm -rf full`.
:::

Ten commits and 1.3 MB are small. Think of them as ten thousand commits and 13 GB, and the rest of the lesson shows how to avoid the wait.

### Shallow clone: only the newest commits

A [shallow clone](term:shallow-clone) is a clone with its history cut short. `git clone --depth 1 <address>` tells Git: give me the newest commit and its files, and leave every older commit on the server.

```console
$ git clone --depth 1 --no-local ../game.git quick
Cloning into 'quick'...
remote: Enumerating objects: 13, done.
remote: Counting objects: 100% (13/13), done.
remote: Compressing objects: 100% (7/7), done.
remote: Total 13 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
Receiving objects: 100% (13/13), 586.87 KiB | 4.51 MiB/s, done.
$ cd quick
$ git log --oneline
3a4f5ae (grafted, HEAD -> main, origin/main, origin/HEAD) Brighten the ship
```

The word `grafted` marks the place where the history was cut: this commit has a parent on the server, and your clone does not hold it.

:::graph
caption: "The server has all ten commits. A clone made with --depth 1 holds only the newest one; the dashed commits stayed on the server"
commits:
  - id: H
    message: Add a star background
    faded: true
  - id: I
    message: Keep the score
    parents: [H]
    faded: true
  - id: J
    message: Brighten the ship
    parents: [I]
branches:
  main: J
remotes:
  origin/main: J
head: main
:::

**About `--no-local`.** The practice server is a folder on your own disk. For a folder, Git takes a shortcut: it copies the stored files directly and skips the usual conversation with a server. That shortcut ignores `--depth`. The option `--no-local` turns the shortcut off, so the clone behaves like one from a real server. With an address that starts with `https://` or `git@`, you never need it.

:::predict
question: "The server has ten commits and eight files. You clone with `--depth 1`. How many commits will `git log` show, and how many of the eight files will be in your folder?"
answer: "One commit, and all eight files. A shallow clone cuts the history, not the project: you get every file as it is in the newest commit."
:::

:::try-it
1. Run `git clone --depth 1 --no-local ../game.git quick`, then `cd quick`. Git prints a few progress lines that start with `remote:`.
2. Run `git log --oneline`. Git lists one commit, "Brighten the ship", marked `(grafted, …)`.
3. Run `ls`, then `ls art`. The folders `art`, `docs` and `src` are all there, and `art` holds both pictures.
4. Run `du -sh .git`. It prints about `669K`, half of the full clone: the two older versions of the ship picture were not downloaded.
5. Stay in the folder `quick` for the next Try-it.
:::

`--depth 3` keeps the newest three commits, and so on. `--depth 1` is by far the most common.

A shallow clone is the right tool when the history does not matter. The usual case is a build machine, a computer that tests or packages every new version and then throws its copy away. For daily work it has real limits:

- `git log` and `git blame` stop at the cut. You cannot see who changed a line last year.
- You only get one branch. `--depth` also tells Git to fetch the default branch alone.
- Merging an old branch can fail, because the commit both sides started from may be past the cut.

### Get the rest later: `git fetch --unshallow`

A shallow clone is not a dead end. `git fetch --unshallow` downloads every commit that was left out and turns the clone into a complete one.

```console
$ git fetch --unshallow
remote: Enumerating objects: 31, done.
remote: Counting objects: 100% (31/31), done.
remote: Compressing objects: 100% (21/21), done.
remote: Total 26 (delta 4), reused 0 (delta 0), pack-reused 0 (from 0)
$ git log --oneline
3a4f5ae (HEAD -> main, origin/main, origin/HEAD) Brighten the ship
5f99dfc Keep the score
5a25458 Add a star background
2c9dd8a Add the level guide
fa2d4f1 Redraw the ship
8136384 Add the player
47820c8 Add the ship picture
1194e9c Describe the controls
fc3f84b Start the game
f9f2a0d Add README
```

To get only a little more, `git fetch --deepen=5` adds five more commits below the cut, and `git fetch --depth 20` sets the history to the newest twenty.

:::try-it
1. In the folder `quick`, run `git fetch --unshallow`. Git prints progress lines again: this time it downloads the nine older commits.
2. Run `git log --oneline`. Git lists all ten commits, and the word `grafted` is gone.
3. Go back and remove the clone: `cd ..`, then `rm -rf quick`.
:::

### Partial clone: all the commits, file contents when you need them

A shallow clone throws the history away, and that is often too much. A [partial clone](term:partial-clone) keeps the whole history and leaves out the heavy part: the old file contents.

`git clone --filter=blob:none <address>` tells Git: download every commit and every folder listing, but download a file's contents only when I need them. A [blob](term:blob) is the object that holds one file's contents, so `blob:none` reads as "no file contents for now". People call the result a blobless clone.

What you get right away:

- Every commit, so `git log` shows the full history.
- The contents of the files in the commit you are on, because they have to be in your working tree.

What stays on the server is every older version of every file. The first time a command needs one, for example when you switch to an old commit, Git fetches it on the spot. You do not run anything extra.

```console
$ git clone -q --filter=blob:none --no-local ../game.git lazy
$ cd lazy
$ git log --oneline | wc -l
10
$ du -sh .git
678K	.git
$ git switch --detach HEAD~4
HEAD is now at fa2d4f1 Redraw the ship
$ du -sh .git
976K	.git
```

All ten commits are there (`wc -l` counts the lines it is given), in about half the space. Switching to the old commit "Redraw the ship" needed the second version of the ship picture, so Git downloaded that one picture, and `.git` grew by 300 KB.

:::try-it
1. Run `git clone --filter=blob:none --no-local ../game.git lazy`, then `cd lazy`.
2. Run `git log --oneline`. Git lists all ten commits. Compare with the shallow clone, which had one.
3. Run `du -sh .git`. It prints about `678K`: the history is complete, but the two older ship pictures are missing.
4. Run `git switch --detach HEAD~4`. Git prints `HEAD is now at fa2d4f1 Redraw the ship` (your ID differs). This is a [detached HEAD](term:detached-head), fine for looking around. To fill the working tree, Git fetched the old picture from the server without telling you.
5. Run `du -sh .git` again. It prints about `976K`: one more picture arrived.
6. Go back and clean up: `git switch -`, then `cd ..`, then `rm -rf lazy`.
:::

:::careful
A partial clone needs the server. Commands that read old file contents, like `git blame`, `git log -p` or switching to an old commit, stop with an error when you are offline and the contents were never downloaded. Before a flight, check out what you will need.
:::

The server must also allow it. GitHub, GitLab and Bitbucket do. On a server your team runs itself, an administrator switches it on with the setting `uploadpack.allowFilter`.

| | Shallow clone (`--depth 1`) | Partial clone (`--filter=blob:none`) |
|---|---|---|
| Commits you have | Only the newest | All |
| `git log` | Stops at the cut | Complete |
| Old file contents | Not there; `--unshallow` brings everything | Fetched one by one when a command needs them |
| Works offline | Yes, for what you have | Only for contents already downloaded |
| Best for | Build machines, a quick look | Daily work on a repository with a heavy history |

### Sparse checkout: only the folders you work in

Both tools so far make the download smaller. The third problem is different: the project has so many files that your editor, your searches and `git status` crawl, and you work in one corner of it.

A [sparse checkout](term:sparse-checkout) tells Git to put only some folders into your working tree. `git sparse-checkout set docs` means: my working tree holds the folder `docs` and the files at the top level of the project, and nothing else.

```console
$ ls
README.md  art  docs  src
$ git sparse-checkout set docs
$ ls
README.md  docs
$ git status
On branch main
Your branch is up to date with 'origin/main'.

You are in a sparse checkout with 38% of tracked files present.

nothing to commit, working tree clean
```

Read what happened carefully, because this is where people get the wrong idea:

- The folders `art` and `src` left your working tree. They were not deleted from the project.
- No commit was made and nothing was staged: `git status` says the working tree is clean. Git knows those files are left out on purpose.
- Your repository still holds every commit and every file. Your teammates and the server notice nothing.
- `git status` reminds you with the line "You are in a sparse checkout with 38% of tracked files present": three of the eight files.

:::predict
question: "After `git sparse-checkout set docs`, the folder `art` is gone from your disk. If you commit and push now, does the `art` folder disappear for your teammates?"
answer: "No. A sparse checkout only chooses what is written into your own working tree. The files are still tracked and still in every commit. Your next commit contains `art` exactly as before, even though you cannot see it."
:::

:::try-it
1. Run `git clone ../game.git writer`, then `cd writer`, then `ls`. You see `README.md`, `art`, `docs` and `src`.
2. Run `git sparse-checkout set docs`, then `ls`. Only `README.md` and `docs` are left. Top-level files such as `README.md` always stay.
3. Run `git status`. Git reports a clean working tree and the line "You are in a sparse checkout with 38% of tracked files present."
4. Run `git sparse-checkout add src`, then `ls`. The folder `src` is back beside `docs`: `add` puts one more folder on the list, while `set` replaces the whole list.
5. Run `git sparse-checkout list`. Git prints the list: `docs` and `src`.
6. Run `git sparse-checkout disable`, then `ls`. All folders are back, and the working tree is complete again.
7. Go back and remove the clone: `cd ..`, then `rm -rf writer`.
:::

| Command | What it does |
|---|---|
| `git sparse-checkout set docs` | The working tree holds `docs` and the top-level files only |
| `git sparse-checkout set docs src/engine` | Several folders; a folder inside a folder works too |
| `git sparse-checkout add src` | One more folder on the list |
| `git sparse-checkout list` | Prints the list |
| `git sparse-checkout disable` | Back to a complete working tree |

Older guides write `git sparse-checkout set --cone docs`. "Cone" is the name of this folder-by-folder way of choosing, and it has been the default since Git 2.37, so today you can leave the option out.

A sparse checkout alone does not make the clone smaller: everything was still downloaded. Put it together with a partial clone and you get both. The Advanced layer shows that pair.

### Git LFS: keep big files out of the repository

Pictures, videos and other big binary files are the third cause from the table. The usual cure is [Git LFS](term:git-lfs) (Large File Storage). It is not part of Git: it is a separate program that you install, and that hosting services such as GitHub support.

The idea is simple. For the file types you choose, Git commits a tiny text file, called a pointer, in place of the real file. The real file goes to a separate storage area on the server. When you check out a commit, Git LFS reads the pointers and downloads only the big files that commit needs.

So ten versions of a 50 MB picture cost your clone ten pointers of about 130 bytes each, plus the one 50 MB version you are looking at.

Three facts to remember; the Advanced layer shows the commands:

- Everyone on the team must install Git LFS. Without it, a teammate gets the small pointer files and no pictures.
- It works for files added after you set it up. Big files already in your history stay there.
- Hosting services limit plain Git files. GitHub warns about a file over 50 MiB and refuses one over 100 MiB; past that, GitHub Docs point you to Git LFS.

This lesson has no challenge on Git LFS, because it needs a program that may not be on your computer.

### Carry a repository in one file: `git bundle`

The tools so far need a server. Sometimes there is none: the network is down, or a machine is kept off the network for security. Pro Git's answer is the [bundle](term:bundle): one ordinary file that holds commits, which you can copy to a USB stick or attach to an email.

`git bundle create <file> <what>` packs commits into a file. Give it `HEAD` and the branch, so that a clone made from the file knows which branch to start on:

```console
$ git bundle create ../game.bundle HEAD main
Enumerating objects: 39, done.
Counting objects: 100% (39/39), done.
Delta compression using up to 16 threads
Compressing objects: 100% (28/28), done.
Writing objects: 100% (39/39), 1.15 MiB | 27.99 MiB/s, done.
Total 39 (delta 4), reused 0 (delta 0), pack-reused 0 (from 0)
```

On the other side, `git bundle verify <file>` checks that the file is a good bundle, and `git clone` accepts the file where it would accept an address:

```console
$ git bundle verify ../game.bundle
../game.bundle is okay
The bundle contains these 2 refs:
3a4f5ae4d838ef0175b61f97e0ccc2519f544624 HEAD
3a4f5ae4d838ef0175b61f97e0ccc2519f544624 refs/heads/main
The bundle records a complete history.
The bundle uses this hash algorithm: sha1
$ git clone game.bundle from-usb
Cloning into 'from-usb'...
Receiving objects: 100% (39/39), 1.15 MiB | 106.86 MiB/s, done.
Resolving deltas: 100% (4/4), done.
```

- **contains these 2 refs** lists what is inside. A [ref](term:ref) is a name that points at a commit; here they are `HEAD` and the branch `main`, both at the newest commit.
- **records a complete history** means the bundle needs nothing else. Anyone can clone from it.

:::try-it
1. Run `git clone ../game.git full`, then `cd full`.
2. Run `git bundle create ../game.bundle HEAD main`. Git prints the same kind of progress lines as a push, ending in `Total 39 …`. The file `game.bundle` now sits in the practice folder, one level up.
3. Run `git bundle verify ../game.bundle`. Git prints `../game.bundle is okay`, the two refs, and "The bundle records a complete history."
4. Run `cd ..`, then `git clone game.bundle from-usb`. Git prints `Cloning into 'from-usb'...` and two progress lines: the clone came from a file, with no server involved.
5. Run `git -C from-usb log --oneline`. All ten commits are there. `git -C <folder>` runs a Git command in another folder without leaving yours.
6. Remove everything you made: `rm -rf full from-usb game.bundle`.
:::

The clone's `origin` is the bundle file. Once the network is back, point `origin` at the real server with `git remote set-url origin <address>`, from the lesson [Work with remotes](lesson:remotes).

### Which tool for which problem

| Your problem | Tool | What you give up |
|---|---|---|
| The history is long, and you only need the current files (a build, a quick look) | Shallow clone: `git clone --depth 1` | History: `git log` and `git blame` stop at the cut |
| The history is heavy, and you still want all of `git log` | Partial clone: `git clone --filter=blob:none` | Old file contents need the network, and the server must allow it |
| The project has far too many files, and you work in a few folders | Sparse checkout: `git sparse-checkout set <folder>` | The other folders are not on your disk, so your editor's search does not see them |
| Big binary files keep changing | Git LFS | An extra program for the whole team, and storage limits on the server |
| No network between two computers | `git bundle create`, then `git clone` or `git fetch` from the file | You choose by hand which commits to pack |
| Everyday commands got slower over the months | `git maintenance start` (Advanced layer) | Nothing: it tidies in the background |

The tools combine. A developer on a huge monorepo typically uses a partial clone with a sparse checkout; the build machine beside them uses a shallow clone.

### When it goes wrong

```console
$ git clone --depth 1 ../game.git quick
Cloning into 'quick'...
warning: --depth is ignored in local clones; use file:// instead.
done.
```

The address is a folder on your disk, so Git took its copying shortcut and brought the whole history. Remove the clone and run the command again with `--no-local`. The message's own suggestion also works: write the address as `file://` followed by the folder's full path. `--filter` gives the same warning for the same reason.

```console
$ git clone --filter=blob:none --no-local ../game.git lazy
Cloning into 'lazy'...
warning: filtering not recognized by server, ignoring
```

The server does not allow partial clones, so you got an ordinary full clone. Nothing is broken. On your team's own server, ask the administrator to set `uploadpack.allowFilter`.

```console
$ git fetch --unshallow
fatal: --unshallow on a complete repository does not make sense
```

This clone already has its whole history. There is nothing to do.

```console
$ git add art/new.txt
The following paths and/or pathspecs matched paths that exist
outside of your sparse-checkout definition, so will not be
updated in the index:
art/new.txt
hint: If you intend to update such entries, try one of the following:
hint: * Use the --sparse option.
hint: * Disable or modify the sparsity rules.
hint: Disable this message with "git config set advice.updateSparsePath false"
```

You are in a sparse checkout and tried to stage a file in a folder that is not on your list. Git refuses, so that you do not change a part of the project you cannot see. Add the folder first with `git sparse-checkout add art`, then stage the file.

## Under the hood

"Must know" described three ways to hold less than the whole project. Each one is a small note inside `.git` that tells Git what is missing on purpose, so that Git does not report the repository as broken.

### A shallow clone: the file `.git/shallow`

A commit names its parent by ID. In a shallow clone, the oldest commit you hold names a parent that is not there. Git keeps a list of such commits in the file `.git/shallow`:

```console
$ cat .git/shallow
3a4f5ae4d838ef0175b61f97e0ccc2519f544624
$ git rev-parse HEAD
3a4f5ae4d838ef0175b61f97e0ccc2519f544624
```

Each line says: treat this commit as if it had no parent. That is the `grafted` mark in `git log`. `git fetch --unshallow` downloads the missing commits and deletes the file.

`--depth` also narrows what the clone follows. The fetch rule in `.git/config` names one branch, where an ordinary clone has `*` for all of them:

```console
$ git config remote.origin.fetch
+refs/heads/main:refs/remotes/origin/main
```

The rule stays that way even after `--unshallow`. The lesson [Refspecs: how fetch and push map branches](lesson:refspecs) reads such a rule piece by piece; `git remote set-branches origin '*'` puts the star back.

### A partial clone: a remote that promises

In a partial clone, commits name file contents that were never downloaded. Git accepts that because the remote is marked as one that promises to hand over any missing object later. Git's documentation calls it a promisor remote. The mark and the filter are two lines in `.git/config`:

```console
$ git config remote.origin.promisor
true
$ git config remote.origin.partialclonefilter
blob:none
```

When a command needs a missing blob, Git asks the promisor remote for it and stores it like any other object. Later fetches use the same filter, so new commits arrive without their old file contents too.

### A sparse checkout: a list and a mark

`git sparse-checkout set docs` writes the list of folders into the file `.git/info/sparse-checkout`, in the pattern style of `.gitignore`:

```console
$ cat .git/info/sparse-checkout
/*
!/*/
/docs/
```

Line by line: take every file at the top level, take no folder, except the folder `docs`.

The staging area (the index) still lists every tracked file. Git sets a mark called skip-worktree on each file outside the list, which means "do not write this file into the working tree, and do not report it as deleted". `git ls-files -t` shows the mark as an `S`; `H` is an ordinary file:

```console
$ git ls-files -t
H README.md
S art/ship.png
S art/stars.png
H docs/controls.md
H docs/levels.md
S src/game.py
S src/player.py
S src/score.py
```

This is why `git status` stays clean and why your commits still contain `art` and `src`: a commit is built from the staging area, and those files never left it.

### A bundle: a packfile with a label

The lesson [How Git talks to servers](lesson:how-git-talks) showed that a fetch or a push sends objects as one compressed file, a [packfile](term:packfile). A bundle is that same packfile saved to disk, with a few lines of text in front that list the refs inside and the commits the receiver must already have. `git bundle list-heads` prints the list:

```console
$ git bundle list-heads game.bundle
3a4f5ae4d838ef0175b61f97e0ccc2519f544624 HEAD
3a4f5ae4d838ef0175b61f97e0ccc2519f544624 refs/heads/main
```

Pro Git puts it this way: a bundle holds everything a `git push` would send over the wire, in a file. That is why `git clone`, `git fetch` and `git pull` can read from it.

## Advanced

Each tool has a few more options, and two tools were only named so far: the Git LFS commands and `git maintenance`.

### More ways to download less

| Command | What it does | When to use it |
|---|---|---|
| `git clone --single-branch <address>` | The full history of the default branch, and no other branch | The server has hundreds of branches and you need one. Add `-b <branch>` to pick another |
| `git clone --shallow-since="2026-01-01" <address>` | A shallow clone cut by date, not by count | You need "this year's history" |
| `git clone --filter=tree:0 <address>` | A partial clone that also leaves out the folder listings of old commits (a treeless clone) | Build machines that need commit messages but never look at old files. `git log -- <file>` becomes slow, so not for daily work |
| `git clone --filter=blob:limit=1m <address>` | A partial clone that leaves out only blobs larger than 1 MB | The code history is fine and a few big files are the problem |

### Partial clone and sparse checkout together

`git clone --sparse` starts a clone with a sparse checkout already on, holding only the top-level files. With `--filter=blob:none`, Git then downloads contents only for the folders you ask for:

```console
$ git clone -q --sparse --filter=blob:none --no-local ../game.git manual
$ cd manual
$ ls
README.md
$ du -sh .git
93K	.git
$ git sparse-checkout set docs
$ ls
README.md  docs
$ du -sh .git
99K	.git
```

The pictures were never downloaded: 99 KB against 1.3 MB for the full clone, with all ten commits in `git log`. On a monorepo with gigabytes of other teams' files, this pair is what makes the project usable.

### Send only the new commits in a bundle

A bundle of the whole project is fine the first time. After that, your teammate already has most of the commits, and Pro Git advises packing only the new ones. Unlike a push, a bundle cannot ask the other side what it has, so you name the range yourself. `main~2..main` means "the last two commits of `main`":

```console
$ git bundle create ../latest.bundle main~2..main
```

The receiver checks the bundle inside their own repository. `git bundle verify` now also says what the bundle needs:

```console
$ git bundle verify ../latest.bundle
../latest.bundle is okay
The bundle contains this ref:
3a4f5ae4d838ef0175b61f97e0ccc2519f544624 refs/heads/main
The bundle requires this ref:
5a25458d197e51370fa70aff84a7f85720ca7fd2 
The bundle uses this hash algorithm: sha1
```

**requires this ref** names the commit the two new ones are built on. The receiver has it, so the bundle is "okay". Then the file's path goes where a remote's name would go:

```console
$ git fetch ../latest.bundle main:mona-main
From ../latest.bundle
 * [new branch]      main       -> mona-main
$ git merge mona-main
Updating 5a25458..3a4f5ae
Fast-forward
 art/ship.png | Bin 300000 -> 300000 bytes
 src/score.py |   1 +
 2 files changed, 1 insertion(+)
 create mode 100644 src/score.py
```

`main:mona-main` means: take the bundle's `main` and record it here as a branch named `mona-main`. You look at it, then merge it. `git pull ../latest.bundle main` does the fetch and the merge in one step.

If the receiver lacks the commit the bundle is built on, `verify` says so, and so does a clone from such a bundle:

```console
$ git bundle verify ../latest.bundle
error: Repository lacks these prerequisite commits:
error: 5a25458d197e51370fa70aff84a7f85720ca7fd2 
```

The sender then makes a bundle that starts further back, or a complete one.

One more detail from Pro Git: a complete bundle made without `HEAD` (`git bundle create repo.bundle main`) still clones, but Git warns `remote HEAD refers to nonexistent ref, unable to checkout` and leaves the working tree empty. Clone it with `git clone -b main repo.bundle` to name the branch yourself.

### Git LFS in practice

Git LFS is installed apart from Git (Git for Windows offers it in its installer). You switch it on once per computer with `git lfs install`. Then, in a project, you tell it which files to handle:

```console
$ git lfs track "*.png"
Tracking "*.png"
$ cat .gitattributes
*.png filter=lfs diff=lfs merge=lfs -text
```

`git lfs track` writes a rule into the file `.gitattributes`, which holds per-file settings for a project. Commit that file, so that the whole team gets the rule. From then on you add and commit pictures as usual. What Git really stores for a picture is the pointer:

```console
$ git show HEAD:ship.png
version https://git-lfs.github.com/spec/v1
oid sha256:24c16800b132939b003cdaad3f0c4591d4a8c585e364bb049747057f414ef6e3
size 300000
```

Three lines: the format's version, the checksum that names the real file in the LFS storage, and its size in bytes. In your working tree `ship.png` is still the real 300,000-byte picture: Git LFS swaps pointer and picture on every checkout and every `git add`.

:::careful
`git lfs track` does not move pictures you committed earlier: their old versions stay in the history at full size. Moving them means rewriting history, which the lesson [Remove a leaked secret or huge file from history](lesson:remove-sensitive-data) covers.
:::

### `git maintenance` and `git gc`

A repository you use for months collects loose ends: thousands of small object files, and data Git could look up faster if it were sorted. Tidying that is the job of two commands.

`git gc` ("garbage collection") tidies once, now. Its main work is to pack many single object files into one packfile:

```console
$ git count-objects -vH
count: 39
size: 1.15 MiB
in-pack: 0
packs: 0
...
$ git gc
...
$ git count-objects -vH
count: 0
size: 0 bytes
in-pack: 39
packs: 1
...
```

`count` is the number of objects stored as single files, and `in-pack` the number inside packfiles: all 39 moved into one pack. You rarely run `git gc` by hand, because Git starts a light version of it by itself after some commands.

`git maintenance` is the newer command for the same kind of work, built for big repositories:

| Command | What it does |
|---|---|
| `git maintenance run` | Runs the tidy-up tasks once, now |
| `git maintenance start` | Asks your operating system to run small tasks in the background on a schedule (hourly, daily, weekly) for this repository, so that it stays fast without you thinking about it |
| `git maintenance stop` | Stops the schedule |

The hourly task also fetches new objects from your remotes ahead of time, without moving any branch, so your next `git fetch` has less to download.

:::careful
`git maintenance start` writes this repository's path into your own Git settings for all projects (`~/.gitconfig`) and adds a scheduled job to your computer. Use it on a real, large project you work in every day, not in the practice folder.
:::

How packfiles work inside, and what garbage collection removes, is the subject of the lesson [Packfiles and garbage collection](lesson:packfiles-gc).

## Recap

- Name the cause first: a long history, too many files, or big binary files. Each has its own tool.
- `git clone --depth 1` brings only the newest commit (a shallow clone); `git fetch --unshallow` brings the rest later.
- `git clone --filter=blob:none` brings every commit and fetches old file contents only when a command needs them (a partial clone).
- `git sparse-checkout set <folder>` keeps only that folder in your working tree; nothing is deleted from the project.
- Git LFS stores big files outside the repository behind small pointers, and `git bundle create` packs commits into one file for when there is no network.
