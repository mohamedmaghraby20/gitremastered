---
id: submodules
title: "Submodules"
module: modern-git
bookSection: "7.11 Submodules"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Submodules
bookSources:
  - book/progit2/book/07-git-tools/sections/submodules.asc
readFirst: [remotes]
---

Your project needs code that lives in another repository: a library another team writes, or one you share between three of your own projects. Copy the files in, and you can no longer tell which version you have or take the next fix cleanly. A submodule keeps that other repository inside yours, at one exact commit that you choose, and this lesson shows how to add one, clone a project that has one, and move it to a newer version.

## Must know

In the Remotes module, one project had one repository. Here one project uses two: its own, and a library's. The question is how to keep them separate and still have the library's files in your folder. Pro Git's answer is the submodule.

### What a submodule is, and when to use one

A [submodule](term:submodule) is a Git repository kept in a subfolder of another Git repository. The outer one is called the **main project** (Git's messages and Pro Git also say [superproject](term:superproject)). The two keep separate histories: the library's commits stay in the library's repository, and yours stay in yours.

The main project does not store the library's files. It stores two small facts:

- where the library comes from (an address), and
- which commit of the library to use (one commit ID).

That second fact is the heart of this lesson. A submodule is **pinned**: fixed to one exact commit until you move it on purpose. When the library's authors push new work, your project does not change. Everyone who clones your project gets the same library commit you tested with.

Submodules are one of three common ways to use someone else's code. Pro Git names the other two and their costs:

| Way | How it works | Good when | Cost |
|---|---|---|---|
| A package manager | A tool such as npm (JavaScript), pip (Python) or Maven (Java) downloads a published version named in a short list | The code is published as a package and you only use it | Hard to change the library's code yourself |
| Copy the files in | The library's files become ordinary files of your project | You need one small file, once | Your copy drifts; taking the library's later changes is manual work |
| A submodule | Your project records the library's address and one commit | You work on the library and the project together, or the code is not published as a package | Extra commands, taught below |

Pro Git's advice: if you only consume a library and a package manager offers it, the package manager is simpler. Reach for a submodule when you also change the library, or when no package exists.

### Add a submodule: `git submodule add`

`git submodule add <address>` clones another repository into a subfolder of your project and records it as a submodule.

The practice project is a weather dashboard. A second repository, a unit converter written by Lina, sits at `../library.git`. Add it:

```console
$ git -c protocol.file.allow=always submodule add ../library.git
Cloning into 'C:/…/project/library'...
done.
$ ls
README.md
library
plan.txt
$ ls library
README.md
convert.txt
```

(Git prints the full path of your practice folder; it is shortened to `…` here.)

By default the folder gets the repository's name, here `library`. To put it elsewhere, add a path at the end: `git submodule add <address> vendor/library`. Many projects keep outside code in a folder named `vendor`, a common name for "code we did not write".

:::sidenote
**Why the long command?** `git -c name=value <command>` sets one setting for that one command. Here it is needed only because this practice "server" is a folder beside yours. Since version 2.38.1, Git refuses to fetch a submodule from a local folder (`fatal: transport 'file' not allowed`) unless you allow it, because a submodule's address comes from a file inside the repository, and a repository from a stranger could abuse that to reach folders on your machine. With a real address you leave it out: `git submodule add https://github.com/team/library.git`.

In practice, write `-c protocol.file.allow=always` right after `git` on `git submodule add`, `git submodule update` and `git clone --recurse-submodules`.
:::

Now look at what the command staged:

```console
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   .gitmodules
	new file:   library
```

Two entries, and neither is `library/README.md` or `library/convert.txt`.

**`.gitmodules`** is a small settings file at the top of the project. It holds the first fact, the address:

```console
$ cat .gitmodules
[submodule "library"]
	path = library
	url = ../library.git
```

It is an ordinary tracked file, committed and pushed with the rest, like `.gitignore`. That is how a teammate's Git learns where to download the library from. So the address in it must be one your teammates can reach.

**`library`** is the second fact, the commit. Git lists the folder as one entry, as if it were a single file. Its diff shows what the entry holds:

```console
$ git diff --cached library
diff --git a/library b/library
new file mode 160000
index 0000000..98d759a
--- /dev/null
+++ b/library
@@ -0,0 +1 @@
+Subproject commit 98d759a71a10c970d1f65a7ebb1b170feb7b9718
```

One line: a [commit ID](term:commit-id) of the library. Pro Git puts it this way: Git does not track the folder's contents; it sees the folder as a particular commit from that other repository. This lesson calls that recorded ID **the pointer**.

A commit stores both entries:

```console
$ git commit -m "Add the unit converter as a submodule"
[main 4cb68e9] Add the unit converter as a submodule
 2 files changed, 4 insertions(+)
 create mode 100644 .gitmodules
 create mode 160000 library
```

`git submodule status` prints the commit each submodule is on:

```console
$ git submodule status
 98d759a71a10c970d1f65a7ebb1b170feb7b9718 library (heads/main)
```

:::try-it
1. Run `git -c protocol.file.allow=always submodule add ../library.git`. Git prints "Cloning into" and "done." In the picture, two sheets appear in the staging area: `.gitmodules` and `library`. The whole library folder is one sheet, because the main project records one entry for it.
2. Run `ls library`. The library's two files, `README.md` and `convert.txt`, are in your folder.
3. Run `cat .gitmodules`. You see the path `library` and the address `../library.git`.
4. Run `git diff --cached library`. The diff is a single line, "Subproject commit" and an ID (yours differs from the one printed above).
5. Run `git commit -m "Add the unit converter as a submodule"`. In the picture, a new station appears on the history map and both sheets leave the staging area.
:::

The common wrong idea is that your project now contains the library's files. It contains an address and one commit ID. The files in `library/` belong to the library's own repository, which lives inside that folder.

### Clone a project that has a submodule

You added the submodule. A teammate who clones the project meets it from the other side, and this is where most people first get confused.

:::predict
question: "A teammate runs a plain `git clone` of your project. What will be in their `library` folder?"
answer: "Nothing. The folder exists but is empty. A plain clone downloads the main project only; it reads the pointer and the address but does not fetch the library until you ask."
:::

Pro Git shows the same thing: you get the folder, but none of the files in it. `git submodule status` marks a submodule that has not been downloaded with a `-` in front:

```console
$ git clone ../app.git ../app-copy
Cloning into '../app-copy'...
done.
$ cd ../app-copy
$ ls library
$ git submodule status
-98d759a71a10c970d1f65a7ebb1b170feb7b9718 library
```

`git submodule update --init` fills it. It does two jobs: `--init` copies the address from `.gitmodules` into this clone's own settings, and `update` downloads the library and checks out the commit the pointer names.

```console
$ git -c protocol.file.allow=always submodule update --init
Submodule 'library' (C:/…/library.git) registered for path 'library'
Cloning into 'C:/…/app-copy/library'...
done.
Submodule path 'library': checked out '98d759a71a10c970d1f65a7ebb1b170feb7b9718'
$ ls library
README.md
convert.txt
```

Read the last line of Git's answer: it checked out exactly `98d759a`, the commit the main project recorded. Not "the latest": the pinned one.

Two forms save typing:

| Command | When |
|---|---|
| `git clone --recurse-submodules <address>` | You have not cloned yet. Clones the project, then downloads every submodule |
| `git submodule update --init --recursive` | You already cloned. `--recursive` also fills submodules that sit inside submodules. Pro Git calls this form "foolproof" |

:::try-it
1. Send your commit to the main project's server: run `git push`. Git prints `main -> main`. In the picture, the `remote origin/main` tag moves onto your new station.
2. Play a teammate. Run `git clone ../app.git ../app-copy`, then `cd ../app-copy`. The picture keeps showing your own `project` folder, so it does not change during these steps.
3. Run `ls library`. Git prints nothing: the folder is empty.
4. Run `git submodule status`. The line starts with `-`: not downloaded yet.
5. Run `git -c protocol.file.allow=always submodule update --init`. The last line says `checked out` and the ID from your pointer.
6. Run `ls library`. The two files are there. Go back with `cd ../project`.
:::

:::compare
today: "`git submodule update --init` registers and downloads in one command."
book: "Pro Git first shows the two steps apart: `git submodule init`, then `git submodule update`. Both still work."
:::

### Update a submodule to a newer commit

The library is pinned, so it stays where it is while its authors keep working. Sooner or later you want their new fix. Moving the pin takes two steps, and people forget the second.

:::predict
question: "Lina pushes a new commit to the library. You run `git pull` in your main project. Does `library/convert.txt` get her new line?"
answer: "No. Your main project's pointer still names the old commit, and nothing in the main project changed. A pin moves only when someone moves it and commits that."
:::

**Step 1: move the submodule.** `git submodule update --remote` goes into each submodule, fetches from its server, and checks out the newest commit of the server's default branch.

```console
$ git -c protocol.file.allow=always submodule update --remote
From C:/…/library
   98d759a..6cc77ef  main       -> origin/main
Submodule path 'library': checked out '6cc77efb59a50c909006480717c0248e4ded2f90'
```

The files in `library/` are now the new ones. But the main project's latest commit still records `98d759a`, and `git status` says so:

```console
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   library (new commits)

no changes added to commit (use "git add" and/or "git commit -a")
```

`modified: library (new commits)` means: the commit checked out in the folder is not the commit the pointer names. `git diff` shows the two IDs:

```console
$ git diff
diff --git a/library b/library
index 98d759a..6cc77ef 160000
--- a/library
+++ b/library
@@ -1 +1 @@
-Subproject commit 98d759a71a10c970d1f65a7ebb1b170feb7b9718
+Subproject commit 6cc77efb59a50c909006480717c0248e4ded2f90
```

**Step 2: commit the new pointer.** Stage the folder's entry and commit, like any other change:

```console
$ git add library
$ git commit -m "Update the unit converter"
[main b5c711f] Update the unit converter
 1 file changed, 1 insertion(+), 1 deletion(-)
```

"1 insertion, 1 deletion" is the one line of the pointer. Pro Git's words for this commit: it locks the submodule onto the new code for everyone else who updates.

In the next Try-it you play Lina. Her clone of the library is the folder `../library-author`, and `git -C <folder>` runs a Git command in another folder without leaving yours.

:::try-it
1. Be Lina: run `echo "hPa to mmHg = times 0.75" >> ../library-author/convert.txt`, then `git -C ../library-author commit -am "Add pressure conversion"`, then `git -C ../library-author push`. The library's server now has a commit your submodule does not have.
2. Run `git status`. Git says "nothing to commit, working tree clean". Your project is pinned and did not notice.
3. Run `git -c protocol.file.allow=always submodule update --remote`. The last line says `checked out` and a new ID. In the picture, a `library` sheet appears in the working tree as changed.
4. Run `cat library/convert.txt`. Lina's third line is there.
5. Run `git status`. Git lists `modified: library (new commits)`.
6. Run `git add library`, then `git commit -m "Update the unit converter"`. In the picture, the `library` sheet moves through the staging area, and a new station appears on the history map.
:::

To update only one submodule in a project that has several, name its path: `git submodule update --remote library`.

### When a teammate moved the pointer

You committed the new pointer and pushed it. Now your teammate pulls. This is the other half of the same idea, and its trap catches experienced people.

```console
$ git pull
From C:/…/app
   4cb68e9..b5c711f  main       -> origin/main
Fetching submodule library
From C:/…/library
   98d759a..6cc77ef  main       -> origin/main
Updating 4cb68e9..b5c711f
Fast-forward
 library | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   library (new commits)

no changes added to commit (use "git add" and/or "git commit -a")
```

The pull did two things: it moved the pointer (the line `library | 2 +-`) and it fetched the library's new commits ("Fetching submodule library"). It did not check them out. The teammate's `library/` folder is still on the old commit, so Git reports a difference again.

The fix is `git submodule update`, with no `--remote`: it checks out the commit the pointer names.

```console
$ git submodule update
Submodule path 'library': checked out '6cc77efb59a50c909006480717c0248e4ded2f90'
$ git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

The two forms of the command go in opposite directions:

| Command | What it does | Use it when |
|---|---|---|
| `git submodule update` | Makes the folder match the pointer | After a clone, a pull or a branch switch |
| `git submodule update --remote` | Moves the folder to the server's newest commit, ahead of the pointer | You want a newer library version; commit the pointer afterwards |

:::careful
After a pull, `modified: library (new commits)` does not mean you have something to commit. If you run `git commit -a` or `git add .` now, you record the **old** library commit again and undo your teammate's update. Run `git submodule update` first.
:::

To stop thinking about it, turn on one setting in the project: `git config submodule.recurse true`. From then on `git pull`, `git switch` and the other commands that have a `--recurse-submodules` option use it, so the folder follows the pointer by itself. Pro Git notes one exception: `git clone` still needs `--recurse-submodules` typed out.

### Inside the submodule: a detached HEAD

So far you only read the library's files. One more fact matters as soon as you open the folder to change something.

`git submodule update` checks out a commit by its ID, not a branch. That leaves the submodule in a [detached HEAD](term:detached-head) state, the one you met in [Switch branches and the detached HEAD](lesson:switch-and-detached-head): HEAD points straight at a commit, and no branch is checked out.

```console
$ git -C library status
HEAD detached at 6cc77ef
nothing to commit, working tree clean
```

:::graph
caption: "The library's history inside your submodule after update --remote: HEAD sits on the pinned commit, and no branch is checked out"
commits:
  - id: A
    message: Add the unit converter
  - id: B
    message: Add wind speed conversion
    parents: [A]
  - id: C
    message: Add pressure conversion
    parents: [B]
branches:
  main: B
remotes:
  origin/main: C
head: C
:::

For reading the library, this is fine. The trap is committing there. A commit made on a detached HEAD belongs to no branch, and the next `git submodule update` moves HEAD away from it:

```console
$ git -C library commit -am "Add knots"
[detached HEAD 63044ea] Add knots
 1 file changed, 1 insertion(+)
$ git -c protocol.file.allow=always submodule update --remote
From C:/…/library
   6cc77ef..ea7ba07  main       -> origin/main
Submodule path 'library': checked out 'ea7ba0756cfac0f5c36250937e762c24a0c7aa28'
$ git -C library log --oneline -3
ea7ba07 Add mph
6cc77ef Add pressure conversion
98d759a Add wind speed conversion
```

"Add knots" is no longer in the log. Pro Git warns about exactly this: changes committed in a submodule without a branch "will quite possibly be lost" at the next update.

:::graph
caption: "After the next update, HEAD moved to D. No branch holds K, the commit you made"
commits:
  - id: B
    message: Add wind speed conversion
  - id: C
    message: Add pressure conversion
    parents: [B]
  - id: K
    message: Add knots
    parents: [C]
    faded: true
  - id: D
    message: Add mph
    parents: [C]
branches:
  main: B
remotes:
  origin/main: D
head: D
:::

:::careful
Before you change anything inside a submodule, switch to a branch there: `cd library`, then `git switch main`. Commit on the branch and push it to the library's server before you commit the new pointer in the main project. "Advanced" shows the full routine.
:::

:::try-it
1. Run `git -C library status`. The first line reads "HEAD detached at" and the short ID of the pinned commit.
2. Run `git -C library log --oneline --decorate`. The label `HEAD` stands alone on the top commit; `main` is one commit below, where the first clone left it.
3. Run `git submodule status`. The line shows the same ID as step 1. The picture does not change: it draws your main project, and the library's HEAD is inside the submodule.
:::

### Remove a submodule

A library you no longer need comes out with `git rm <path>`, the command you know for files. For a submodule it deletes the folder, removes the entry from `.gitmodules`, and stages both changes:

```console
$ git rm library
rm 'library'
$ git status
...
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   .gitmodules
	deleted:    library
$ git commit -m "Remove the unit converter"
[main cd63f2a] Remove the unit converter
 2 files changed, 4 deletions(-)
 delete mode 160000 library
```

Git keeps its downloaded copy of the library's repository under `.git/modules/library`, so that checking out an older commit can bring the submodule back without a download. "Under the hood" shows that folder, and "Advanced" shows how to clear it.

### When it goes wrong

```console
$ git submodule add ../library.git
Cloning into 'C:/…/project/library'...
fatal: transport 'file' not allowed
fatal: clone of 'C:/…/library.git' into submodule path 'C:/…/project/library' failed
```

Git refused to fetch a submodule from a local folder. In this practice project, add the setting for that command: `git -c protocol.file.allow=always submodule add ../library.git`. You will not see this with an `https://` or SSH address.

```console
$ git pull
From C:/…/app
   35046c1..503137e  main       -> origin/main
Fetching submodule library
fatal: git upload-pack: not our ref b09ba93fc061d64931c3e4a65daf634713a1ec49
fatal: remote error: upload-pack: not our ref b09ba93fc061d64931c3e4a65daf634713a1ec49
Errors during submodule fetch:
	library
```

The main project's pointer names a library commit that the library's server does not have. A teammate committed inside their submodule, committed the new pointer, and pushed only the main project. Nothing is wrong on your side: ask them to push the library from inside their submodule folder. `git push --recurse-submodules=check` (in "Advanced") stops this mistake before it leaves their machine.

```console
$ git submodule add ../library.git
fatal: 'library' already exists in the index
```

The path is already tracked, as a submodule or as ordinary files. If it is the same submodule, there is nothing to add. If the folder held ordinary files that you now want to replace with a submodule, Pro Git's fix is to remove them from the project first with `git rm -r library`, commit, then add the submodule.

## Under the hood

"Must know" spoke of an address and a pointer. Both are plain data you can read, and so is the place where the library's repository really lives.

### The pointer is a gitlink

A commit's [tree](term:tree) lists the top folder of the project: one line per entry, with a type code called the mode, the kind of object, its ID and its name. `git ls-tree HEAD` prints it:

```console
$ git ls-tree HEAD
100644 blob cd00b94fef22d7256a9bc670e454bcb3478e5671	.gitmodules
100644 blob f80cd6e6ce388a199e3d778c624ed520991a75ef	README.md
160000 commit 98d759a71a10c970d1f65a7ebb1b170feb7b9718	library
100644 blob d08b269f77e8d62f6325842308ac3c12f85c99dc	plan.txt
```

Three entries are ordinary files: mode `100644`, kind `blob`. The entry `library` has mode `160000` and kind `commit`. Pro Git explains the mode: you are recording a commit as a directory entry, not a subfolder or a file. Git's own documentation calls such an entry a [gitlink](term:gitlink).

Two things follow:

- The commit `98d759a` is not stored in the main project's repository at all. The main project holds only its ID. That is why a pointer to a commit nobody pushed breaks a teammate's update.
- Moving the pointer changes 40 characters in one tree. That is the "1 insertion, 1 deletion" you committed.

### Where the library's repository lives

A normal repository keeps its data in a `.git` folder. Inside a submodule, `.git` is a one-line file:

```console
$ cat library/.git
gitdir: ../.git/modules/library
```

The library's real repository sits inside the main project's own `.git` folder, at `.git/modules/library`. Pro Git points out the benefit: deleting the `library` folder does not lose the library's commits or branches, and Git can switch between a branch with the submodule and a branch without it by removing and refilling the folder.

### What `--init` writes

`.gitmodules` is shared with the team. Each clone also keeps its own copy of the address in `.git/config`, and `--init` is the step that writes it:

```console
$ git config --get-regexp submodule
submodule.library.url ../library.git
submodule.library.active true
```

`git submodule update` reads this copy, not `.gitmodules`. So you can point your own clone at another address (a faster mirror, a private copy) with `git config submodule.library.url <address>` without changing the team's file. It also explains one failure: when the team changes the address in `.gitmodules`, your copy is stale until you run `git submodule sync`.

### How the address `../library.git` is read

An address in `.gitmodules` that starts with `../` is relative to the address of the main project's `origin`, not to your folder. In the practice project `origin` is `../app.git`, so `../library.git` means "the repository named `library.git` beside `app.git`". Teams use this on purpose: if both repositories sit on the same server, the pair keeps working when the server's name changes, or when one person uses HTTPS and another SSH.

## Advanced

You can now add, clone, update and remove a submodule. The topics below are for daily life in a project that has several of them, or where you also write the library.

### Read submodule changes as commits

A pointer diff shows two IDs, which tells you little. `git diff --submodule` lists the library's commits between them instead:

```console
$ git diff --submodule
Submodule library 98d759a..6cc77ef:
  > Add pressure conversion
```

Each `>` line is a library commit the folder has and the pointer does not. Count the lines and you know how many commits an update brings in. A `<` line is the reverse: a commit the pointer names and the folder lacks, as after a pull:

```console
$ git diff --submodule
Submodule library 6cc77ef..98d759a (rewind):
  < Add pressure conversion
```

The option works on history too: `git log -p --submodule`. Two settings make it permanent in a project:

| Setting | Effect |
|---|---|
| `git config diff.submodule log` | `git diff` always uses the commit list |
| `git config status.submodulesummary 1` | `git status` adds a "Submodules changed but not updated" list of the same commits |

### Switching branches

When two branches of the main project record different library commits, or only one branch has the submodule, a plain `git switch` moves the pointer and leaves the folder behind. `git switch --recurse-submodules <branch>` moves both. With `submodule.recurse` set to `true` you get that every time.

:::compare
today: "`git switch --recurse-submodules main` switches the branch and puts each submodule on the commit that branch records."
book: "Pro Git shows `git checkout --recurse-submodules master`. It still works."
:::

### Run a command in every submodule: `git submodule foreach`

`git submodule foreach '<command>'` runs a shell command inside each submodule in turn and prints "Entering" before each one:

```console
$ git submodule foreach 'git log --oneline -1'
Entering 'library'
6cc77ef Add pressure conversion
```

Pro Git uses it to stash work in every submodule before starting something new (`git submodule foreach 'git stash'`) and to start the same branch in all of them (`git submodule foreach 'git switch -c feature-a'`). With one submodule you rarely need it; with ten it saves a lot of typing.

### Follow another branch

`git submodule update --remote` takes the newest commit of the server's default branch. To follow a different branch, record it in `.gitmodules`, so the whole team follows it:

```console
$ git config -f .gitmodules submodule.library.branch stable
```

`-f .gitmodules` writes to that file. Pro Git notes that without it the setting lands in your own `.git/config` and applies to you alone. Commit `.gitmodules` afterwards.

### Work on the library from inside the submodule

Pro Git says this is the real reason to pick submodules: you change the library and the main project together. The routine has four parts.

1. Get on a branch: `cd library`, then `git switch main`.
2. Take in the server's new work without losing yours. From the main project, `git submodule update --remote --merge` merges the server's branch into your branch in the submodule; `--rebase` rebases your commits onto it. Plain `--remote` would detach HEAD again. If that happens, your commits are still on the branch: switch back to it and merge `origin/main` by hand.
3. Commit in the submodule, then commit the new pointer in the main project.
4. Push both. `git push --recurse-submodules=check` refuses to push the main project while a submodule has commits no server has:

```console
$ git push --recurse-submodules=check
The following submodule paths contain changes that can
not be found on any remote:
  library

Please try

	git push --recurse-submodules=on-demand

or cd to the path and use

	git push

to push them to a remote.

fatal: Aborting.
```

`--recurse-submodules=on-demand` pushes the submodules first, then the main project. `git config push.recurseSubmodules check` (or `on-demand`) makes either one the default.

If `git submodule update` would overwrite uncommitted edits in the submodule, Git fetches but refuses the checkout and tells you to commit or stash first. If a `--merge` hits a conflict, you resolve it inside the submodule folder like any merge.

### When two people move the pointer

If you and a teammate both moved the pointer and one library commit is an ancestor of the other, a merge of the main project picks the newer one. If the two library commits have diverged, Git stops with `CONFLICT (submodule): Merge conflict in library` and does not try to merge the library for you. Pro Git's steps: go into the submodule, merge the other side's commit there (`git diff` in the main project shows both IDs), then `git add library` and commit in the main project.

### The address changed: `git submodule sync`

When the library moves to a new server, someone edits `.gitmodules` and commits. Your clone still has the old address in `.git/config`. Run `git submodule sync --recursive` to copy the new address in, then `git submodule update --init --recursive`.

### Clear a submodule out completely

`git rm` leaves two things in your own clone: the repository under `.git/modules/library` and the `submodule.library` lines in `.git/config`. They do no harm, but if you add a submodule at the same path again, Git stops and asks whether to reuse the old repository. To clear them: `rm -rf .git/modules/library`, then `git config --remove-section submodule.library`.

`git submodule deinit library` is a different job: it empties the folder and unregisters the submodule in your clone only, for a submodule you do not need on your machine. The project still has it:

```console
$ git submodule deinit library
Cleared directory 'library'
Submodule 'library' (../library.git) unregistered for path 'library'
```

### The other built-in option: a subtree

Git can also merge another project's history into a subfolder of yours, so its files become ordinary files of your repository: a [subtree merge](term:subtree-merge). Nobody needs extra commands after a clone, which is its advantage. The price is that the library's history is mixed into yours, and sending changes back to the library is harder. The lesson [Hard conflicts, merge strategies and rerere](lesson:advanced-merging) covers it.

## Recap

- A submodule is another repository in a subfolder. Your project stores its address (in `.gitmodules`) and one commit ID (the pointer), not its files.
- `git submodule add <address> [path]` adds one; commit `.gitmodules` and the folder's entry.
- After a clone the folder is empty: `git submodule update --init --recursive`, or clone with `--recurse-submodules`.
- `git submodule update --remote` moves the folder to the library's newest commit; then `git add <path>` and commit the new pointer.
- After a pull, `git submodule update` makes the folder match the pointer. `git config submodule.recurse true` does it for you.
- A submodule's HEAD is detached: switch to a branch before you commit inside it.
