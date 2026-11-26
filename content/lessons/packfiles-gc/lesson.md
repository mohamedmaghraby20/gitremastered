---
id: packfiles-gc
title: "Packfiles and garbage collection"
module: under-the-hood
bookSection: "10.4 Packfiles"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Packfiles
bookSources:
  - book/progit2/book/10-git-internals/sections/packfiles.asc
  - book/progit2/book/10-git-internals/sections/maintenance.asc
readFirst: [first-look-inside]
---

You add one line to a 400-line file and commit, and Git stores the whole file a second time. After a thousand commits that should fill your disk, yet a `.git` folder stays small. This lesson shows the tidy-up that makes it so, how to measure it, and what it does and does not throw away.

## Must know

In [A first look inside .git](lesson:first-look-inside) you saw that Git keeps every commit, tree and blob as one [object](term:object), and that each object is one small file under `.git/objects`. The lesson [Blobs, trees, commits and how they are stored](lesson:objects-deep) goes deeper into those files. That picture is true for a young repository. This lesson is about what happens to those files as a repository grows.

### One line changes, one whole file is stored

The practice project on the right is the log of a small weather station. Its main file, `weather.txt`, has one line per day:

```console
$ head -3 weather.txt
Day 1: 14 degrees, wind 54 km/h, humidity 61 percent
Day 2: 28 degrees, wind 41 km/h, humidity 33 percent
Day 3: 11 degrees, wind 28 km/h, humidity 64 percent
```

The file was committed with 400 lines. Then two commits each added one day. A [blob](term:blob) holds the full content of one version of a file, so the repository now holds three blobs for `weather.txt`. Ask for their sizes with `git cat-file -s`. `HEAD~2` means "the commit two steps before the one you are on", and `HEAD~2:weather.txt` names the file as that commit stored it:

```console
$ git cat-file -s HEAD:weather.txt
21815
$ git cat-file -s HEAD~2:weather.txt
21760
$ git cat-file -s HEAD~3:weather.txt
21705
```

Three objects of about 21,700 bytes each, and they differ by one line of 55 bytes. Git did not store "the change". It stored the complete file three times.

An object stored this way, as its own file, is called a **loose object**. Loose objects are simple and fast to write, which is what you want at the moment you commit. They are wasteful to keep.

:::definitions
- term: Loose object
  area: repository
  text: "An object stored as its own file under `.git/objects`, in a folder named after the first two characters of its ID. Every new object starts loose."
- term: Packfile
  area: repository
  text: "One file that holds many objects together, stored in a space-saving way. Git moves loose objects into packfiles from time to time."
:::

Each loose object is compressed by itself (with zlib, the method ZIP files use). That helps a little: each `weather.txt` blob shrinks to about 3,650 bytes on disk. But compressing a file alone cannot notice that another file is almost the same.

### Measure it: `git count-objects`

Before changing anything, measure. `git count-objects` tells you how many loose objects a repository has and how much disk space they take.

For the Try-its in this lesson, make a file of your own, so that your numbers come from your own work. Starting a challenge later rebuilds the project from zero, so nothing you do here can spoil a challenge.

:::try-it
1. Run `seq 1 3000 > numbers.txt`. The command `seq` prints the numbers from 1 to 3000, one per line, and `>` writes them into a new file. In the picture, a `numbers.txt` sheet appears in the working tree.
2. Run `git add numbers.txt`, then `git commit -m "Add numbers"`. On the history map, a new station appears and the `main` label moves onto it.
3. Run `echo 3001 >> numbers.txt`, then `git commit -am "Add 3001"`. One more station. You have now stored two nearly identical versions of `numbers.txt`.
4. Run `git count-objects -vH`. Git prints eight lines; the first says `count: 22`.
:::

```console
$ git count-objects -vH
count: 22
size: 23.68 KiB
in-pack: 0
packs: 0
size-pack: 0 bytes
prune-packable: 0
garbage: 0
size-garbage: 0 bytes
```

The two options: `-v` (verbose) prints the full list instead of one summary line, and `-H` (human-readable) prints sizes with a unit. Use both every time. Four lines matter:

| Line | Meaning |
|---|---|
| `count` | The number of loose objects |
| `size` | The disk space the loose objects take |
| `in-pack` | The number of objects that sit inside packfiles |
| `packs` | The number of packfiles |

So right now: 22 loose objects, nothing packed. The exact `size` differs a little from one computer to the next, because operating systems measure disk space in different ways. The counts are the same everywhere.

Without `-H`, sizes are plain numbers in KiB (1 KiB is 1,024 bytes), which is what a script wants. Without any option you get one line: `22 objects, 23 kilobytes`.

### Pack it: `git gc`

`git gc` tidies the repository: it gathers the loose objects into one [packfile](term:packfile) and removes the loose files. The name is short for "garbage collect", which sounds as if it mostly deletes things. On a healthy repository it deletes almost nothing; its main job is packing. The whole job is called [garbage collection](term:garbage-collection).

:::predict
question: "Your repository has 22 loose objects. After git gc, git count-objects will show count: 0. How many of the 22 objects still exist?"
answer: "All 22. They moved into one packfile, so in-pack shows 22. Every commit, every version of every file is still there, and every Git command works as before."
:::

:::try-it
1. Run `git gc`. Git prints a few progress lines and ends with a line that starts with `Total 22`.
2. Run `git count-objects -vH`. Now `count` is 0, `in-pack` is 22 and `packs` is 1. The size is now on the `size-pack` line, and it is about half of what the loose objects took, or less.
3. Run `git log --oneline`. All seven commits are listed, as before. In the picture, nothing moved: `git gc` changes how objects are stored, not what they are.
4. Run `git cat-file -p HEAD~3:weather.txt | tail -1`. Git prints the last line of an old version of the file, `Day 402: …`, read out of the packfile.
:::

```console
$ git gc
Enumerating objects: 22, done.
Counting objects: 100% (22/22), done.
Delta compression using up to 16 threads
Compressing objects: 100% (19/19), done.
Writing objects: 100% (22/22), done.
Total 22 (delta 6), reused 0 (delta 0), pack-reused 0 (from 0)
$ git count-objects -vH
count: 0
size: 0 bytes
in-pack: 22
packs: 1
size-pack: 12.80 KiB
prune-packable: 0
garbage: 0
size-garbage: 0 bytes
```

Read the `git gc` output like this:

- `Enumerating objects: 22`: Git found 22 objects to pack.
- `Delta compression using up to 16 threads`: Git looks for objects that resemble each other (explained next). The number of threads is how many jobs your processor can run at once, so yours may differ.
- `Total 22 (delta 6)`: 22 objects were written into the pack, and 6 of them were stored as a **delta**. Your delta number may be one higher or lower, because your commits hold your own name and time.

Look at what is left in `.git/objects`. The folders with two-character names are gone, and a `pack` folder holds the result:

```console
$ find .git/objects -type f
.git/objects/info/commit-graph
.git/objects/info/packs
.git/objects/pack/pack-542b3a2b73a446f07c4734161f11a17b9908b006.idx
.git/objects/pack/pack-542b3a2b73a446f07c4734161f11a17b9908b006.pack
.git/objects/pack/pack-542b3a2b73a446f07c4734161f11a17b9908b006.rev
```

The `.pack` file is the packfile: all 22 objects in one file. The `.idx` file beside it is the pack's index, a table that says where in the packfile each object starts. "Under the hood" opens both. The long code in your file names differs from the one printed here.

The common wrong idea is that `git gc` shortens or cleans your history. It does not touch history at all. The same commits have the same IDs and the same content; only the storage changed.

### Deltas: store one version whole, the others as differences

Half the space is gone, and here is where it went. When Git packs, it looks for objects that resemble each other, typically versions of the same file. It stores one of them whole, and for each of the others it stores only a **delta**: the instructions to build that version from the whole one ("take the base, then add this line").

:::definitions
- term: Delta
  area: repository
  text: "An object stored inside a packfile as the difference from another object, its base. Git rebuilds the full object whenever a command asks for it."
:::

`git verify-pack -v` lists every object in a packfile. It is a [plumbing](term:plumbing) command, and it takes the path of the `.idx` file. You do not have to type the long name: write `pack-*.idx`, and the shell (the program that reads what you type in the terminal) replaces the star with the rest of the name. Add `| grep blob` to keep only the lines about blobs, the objects that hold file contents.

:::predict
question: "weather.txt has three versions in the pack: 400 lines, 401 lines and 402 lines. One is stored whole and two as deltas. Which one do you expect to be whole: the oldest or the newest?"
answer: "The newest, with 402 lines. Git works backwards: the latest version is the one you need most often, so that one is stored whole and is fast to read. Older versions are rebuilt from it."
:::

:::try-it
1. Run `git verify-pack -v .git/objects/pack/pack-*.idx | grep blob`. Git prints seven lines, one per blob.
2. Find the line with the size `21815`. This blob is the newest `weather.txt`, and it has five columns: it is stored whole.
3. Find the two lines that end with the ID `9211df7…`. They are the older versions of `weather.txt`, stored as deltas of 9 and 8 bytes.
4. Find the two blobs of your own `numbers.txt` in the same way: one line with `13898`, and one short line that ends with its ID.
:::

```console
$ git verify-pack -v .git/objects/pack/pack-*.idx | grep blob
de673d0962d0c1f7578ea587e922c69384379033 blob   58 64 1037
06bb7513ab9b0ace74f0e23596e41eb5cb881c8c blob   47 57 1101
19e6599a5806641d379f907e39e0308746065004 blob   13898 6476 1158
9211df7a58282a46d297d93f4af601aa154fc936 blob   21815 3152 7634
1127304b44c93b81365608aa80e44d54815adb52 blob   7 18 11024 1 19e6599a5806641d379f907e39e0308746065004
966ea5326c68b7768159c6a238bd02bb6d08ee80 blob   9 20 11174 1 9211df7a58282a46d297d93f4af601aa154fc936
e6b8dcebb5bbb64819e33885e9110d18e2e20329 blob   8 19 11278 1 9211df7a58282a46d297d93f4af601aa154fc936
```

Your blob IDs are the same as these, because a blob's ID depends only on the file's content. The last number of each line may differ.

The columns, left to right:

| Column | Example | Meaning |
|---|---|---|
| 1 | `9211df7…` | The object's ID |
| 2 | `blob` | Its type |
| 3 | `21815` | Its size in bytes. For a delta: the size of the delta, not of the full file |
| 4 | `3152` | The bytes it takes inside the packfile, after compression |
| 5 | `7634` | Where it starts in the packfile, counted in bytes from the beginning |
| 6 and 7 | `1 9211df7…` | Only for a delta: how many steps it is away from a whole object, and the ID of its base |

Now read the `weather.txt` story from the listing:

- `9211df7` is the 402-line version. It is stored whole: 21,815 bytes, squeezed to 3,152 in the pack.
- `966ea53` is the 400-line version. As a loose object it took about 3,650 bytes on disk. In the pack it takes 20, because it is stored as "`9211df7` without its last two lines".
- `e6b8dce`, the 401-line version, takes 19 bytes.

The result is the opposite of what most people guess: the newest version is whole, and the older ones are deltas that point forward at it. Pro Git gives the reason: you are most likely to need fast access to the most recent version of a file.

:::careful
Deltas do not change what a commit is. A commit is still a full [snapshot](term:snapshot) of the project, and `git cat-file -p` on any blob still gives you the complete file. A delta is a storage trick inside the packfile, and Git undoes it for you every time you read. Never reason about Git as "a list of changes"; that picture leads to wrong guesses about merging and resetting.
:::

### When Git packs without being asked

You have now done by hand what Git normally does for you. In daily work you rarely type `git gc`. Three things pack objects without you:

- **Automatic garbage collection.** After commands that add many objects, such as `git commit`, `git merge` or `git fetch`, Git checks whether tidying is due. If the repository has more than about 6,700 loose objects, or more than 50 packfiles, Git runs the tidy-up for you. Below those limits the check does nothing.
- **Fetching and cloning.** When you get commits from a server, they arrive as one packfile. [How Git talks to a server](lesson:how-git-talks) showed the same `Total … (delta …)` line in the output of `git fetch`. A repository you cloned is packed from the first minute.
- **Pushing.** Git packs the objects you send before sending them.

You can run the automatic check yourself with `git gc --auto`. On a small project it prints nothing and returns at once, because nothing is due:

```console
$ git gc --auto
$
```

The two limits are settings: `gc.auto` (6,700 loose objects) and `gc.autoPackLimit` (50 packfiles). Pro Git rounds the first to "around 7,000". Most people never change them.

So when is typing `git gc` yourself worth it?

| Situation | Worth running `git gc`? |
|---|---|
| Normal daily work | No. Git does it when needed |
| The `.git` folder looks large and you want to know why | Run `git count-objects -vH` first. Many loose objects: yes |
| You just imported or rewrote a large history | Yes, once, at the end |
| Git feels slow in an old, busy repository | Yes, it is harmless to try |

Newer versions of Git also have `git maintenance`, which can run these tidy-ups on a schedule in the background. The lesson [Shallow and partial clone, sparse checkout, LFS, bundles, git maintenance](lesson:large-repos) teaches it.

### What `git gc` keeps and what it may delete

One fear is left: can a tidy-up destroy work? Here is the short rule; "Under the hood" shows it happen.

- Everything a branch, a tag or HEAD leads to is kept. Always.
- A commit that no branch leads to any more, for example after `git reset --hard`, is kept as long as the [reflog](term:reflog) remembers it. The reflog is Git's diary of where HEAD and your branches have been; [Reset, demystified](lesson:reset-demystified) used it for a rescue. That protection lasts 30 days by default.
- Only objects that nothing leads to at all, and that are older than two weeks, are deleted.

So a plain `git gc` is safe to run at any time. The risky forms are the ones with `--prune=now`, covered below with a warning.

### When it goes wrong

```console
$ git verify-pack -v .git/objects/pack/pack-*.idx
fatal: Cannot open existing pack file '.git/objects/pack/pack-*.idx'
.git/objects/pack/pack-*.pack: bad
```

There is no packfile yet, so `pack-*.idx` matched no file and Git received the star as typed. Check with `git count-objects -v`: `packs: 0`. Run `git gc` first, or run the command from the project's top folder if you were in a subfolder.

```console
$ git count-objects -v
fatal: not a git repository (or any of the parent directories): .git
```

You are in a folder with no repository in it or above it. Move back into the project with `cd`.

```console
$ ls .git/refs/heads
$
```

Nothing is printed: after `git gc`, the file `.git/refs/heads/main` is gone. Your branch is not lost. `git gc` also packs the branch files into one file, `.git/packed-refs` ("Under the hood" shows it). This is the reason to ask Git (`git branch`, `git rev-parse main`) instead of reading files in `.git` yourself.

## Under the hood

"Must know" showed that packing works and how to read the result. This layer opens the pack folder, explains how Git chooses deltas, and shows exactly when an object is deleted.

### The files in `.git/objects/pack`

A pack is a small family of files that share one name. The code in the name is a [checksum](term:checksum) of the pack's content.

| File | What it is |
|---|---|
| `pack-….pack` | The packfile: every object's data, one after the other |
| `pack-….idx` | The pack index: a sorted table of object IDs with the position of each object in the packfile |
| `pack-….rev` | The reverse table: from a position back to the object. It speeds up some commands |

The index solves a real problem. With loose objects, Git finds an object by turning its ID into a path. A packfile is one long file, so Git needs a table: look up the ID in the `.idx`, read the position, jump there in the `.pack`. That position is column 5 of `git verify-pack -v`.

The `.idx` file holds nothing that is not in the `.pack`. If it were lost, Git could rebuild it from the packfile (`git index-pack` does that).

Without `-v`, `git verify-pack` only checks that the pack is intact: it recomputes the checksums and prints nothing when all is well. With `-v`, the listing ends with a summary:

```console
$ git verify-pack -v .git/objects/pack/pack-*.idx | tail -3
non delta: 16 objects
chain length = 1: 6 objects
.git/objects/pack/pack-542b3a2b73a446f07c4734161f11a17b9908b006.pack: ok
```

16 objects are stored whole, and 6 are deltas whose base is a whole object ("chain length 1"). Three of those six are the blobs you have met. The others are trees and a commit that Git also found similar enough to another object. Your two numbers may differ by one, because your commits hold your own name and time. A delta may also have a delta as its base; that would be chain length 2. Git limits the length of such chains, because reading the last link means rebuilding every link before it.

### How Git chooses a base

Git does not compare every object with every other; that would take far too long. Following Pro Git, it looks for files that are named and sized similarly. It sorts the objects by type, name and size, and compares each one only with its near neighbours in that order. Versions of `weather.txt` land next to each other, so they are compared, and the delta is tiny.

Nothing about this is recorded in your history, so Git is free to choose again. Every `git gc` may repack and pick better bases. Pro Git calls this the really nice thing about packfiles: they can be repacked at any time.

### `git gc` packs the branch files too

`git gc` does a second kind of packing. [A first look inside .git](lesson:first-look-inside) showed that a branch is a small file under `.git/refs/heads`. A repository with thousands of branches and tags would have thousands of such files, so `git gc` moves them into a single file:

```console
$ cat .git/packed-refs
# pack-refs with: peeled fully-peeled sorted 
541dfd8f3ef6b77642700d15e1e88b28d381cd5a refs/heads/main
$ ls .git/refs/heads
$
```

One line per [ref](term:ref): the commit ID, then the full name. Git reads a ref in two steps, as Pro Git describes: first it looks for a file under `.git/refs`, and if there is none, it looks in `packed-refs`.

When the branch moves, Git does not edit `packed-refs`. It writes a fresh file under `refs/heads`, and that file wins over the old line:

```console
$ echo 3002 >> numbers.txt
$ git commit -q -am "Add 3002"
$ ls .git/refs/heads
main
```

For an annotated tag, `packed-refs` holds a second line that starts with `^`: the ID of the commit the tag leads to. The lesson [References, HEAD, tags and remotes on disk](lesson:refs-deep) covers refs in full.

### What `git gc` deletes, and what stands in the way

This part answers the fear from "Must know" with a test. The idea first.

An object is **[reachable](term:reachable)** when you can arrive at it by starting from something Git treats as a starting point and following the links: commit to parent, commit to tree, tree to blob. `git gc` deletes an object only when it is unreachable from every starting point, and old enough. The starting points are:

| Starting point | Protects | For how long |
|---|---|---|
| Branches, tags, remote-tracking branches, HEAD | Everything in their history | As long as they exist |
| The stash and the staging area | Stashed work, staged files | As long as they exist |
| Reflog lines | Commits you were on before: reset away, amended, rebased | 30 days for commits no longer on the branch, 90 days for the others |
| Nothing at all | Unreachable objects | Two weeks from when they were written, then the next `git gc` deletes them |

The three time limits are settings: `gc.reflogExpireUnreachable` (30 days), `gc.reflogExpire` (90 days) and `gc.pruneExpire` (two weeks). The lesson [Recover lost commits with reflog and fsck](lesson:rescue-lost-work) uses these limits from the other side: how long you have for a rescue.

Now the test. If you followed the last console block, you have a commit "Add 3002". If not, run those two commands now. Then abandon the commit:

:::graph
caption: "After git reset --hard HEAD~1: main is back on \"Add 3001\". \"Add 3002\" has no branch, but the reflog still leads to it"
commits:
  - id: A
    message: Describe the sensor
  - id: B
    message: Add numbers
    parents: [A]
  - id: C
    message: Add 3001
    parents: [B]
  - id: D
    message: Add 3002
    parents: [C]
    faded: true
branches:
  main: C
head: main
:::

:::try-it
1. Run `git count-objects -v`. It shows `count: 3` and `in-pack: 22`: the new commit, its tree and its blob are loose; the rest is packed.
2. Run `git reset --hard HEAD~1`. Git answers `HEAD is now at … Add 3001`. On the history map, the `main` label moves back one station, and the station "Add 3002" turns faded: no branch leads to it.
3. Run `git gc`, then `git count-objects -v`. It shows `count: 0` and `in-pack: 25`. The abandoned commit was not deleted. It was packed with everything else, because the reflog still leads to it.
4. Run `git reflog -3`. The line `commit: Add 3002` is the protection. Copy the short ID at its start.
5. Run `git reflog expire --expire=now --all`. It prints nothing. Git has erased its whole diary: every reflog line of every branch.
6. Run `git gc --prune=now`, then `git count-objects -v`. Now `in-pack` is 22. Three objects are gone. In the picture, the faded station has disappeared.
7. Run `git cat-file -t` with the ID you copied. Git answers `fatal: Not a valid object name`. Nothing can bring this commit back.
:::

```console
$ git gc
...
Total 25 (delta 8), reused 21 (delta 6), pack-reused 0 (from 0)
$ git reflog expire --expire=now --all
$ git gc --prune=now
...
Total 22 (delta 6), reused 21 (delta 6), pack-reused 0 (from 0)
$ git cat-file -t 6f024c0
fatal: Not a valid object name 6f024c0
```

Each of the two commands removed one protection:

- `git reflog expire --expire=now --all` deletes reflog lines. `--expire=now` means "treat every line as too old", and `--all` means "in the reflog of every ref". After it, nothing leads to the abandoned commit.
- `git gc --prune=now` sets the two-week waiting time to zero for this one run. Without it, the commit would have stayed for two more weeks.

Run only the second command and the commit survives, because the reflog still leads to it. The same is true for any other starting point. A forgotten tag or a stash entry that leads to a commit keeps that commit, and everything it needs, in the repository.

:::careful
`git reflog expire --expire=now --all` followed by `git gc --prune=now` removes your safety net for the whole repository, not for one commit: every commit you reset away, amended or rebased in the last weeks is deleted with it. Use the pair only as the planned last step of a clean-up, for example when a password was committed. The lesson [Remove a leaked secret or huge file from history](lesson:remove-sensitive-data) shows the full procedure. On a copy that others cloned from, the commit also still exists in their copies.
:::

## Advanced

The commands below are the parts `git gc` is built from, and the settings that steer it. You need them when you look after a large repository or a server.

### `git repack`: only the packing

`git gc` is a bundle of jobs. The packing job alone is `git repack`. By itself it packs the loose objects into one new, extra packfile and leaves the old packs alone. Here it runs on a copy of the weather project that had 16 packed objects and one new commit, which is 3 loose objects:

```console
$ git repack
Enumerating objects: 3, done.
Counting objects: 100% (3/3), done.
Delta compression using up to 16 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), done.
Total 3 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
$ git count-objects -v
count: 3
size: 3
in-pack: 19
packs: 2
size-pack: 10
prune-packable: 3
garbage: 0
size-garbage: 0
```

Two things to notice. There are two packs now. And `count` is still 3: the loose files were packed but not deleted, so they exist twice. The `prune-packable` line counts exactly those.

`git repack -a -d` (usually typed `-ad`) does the full job: `-a` puts everything reachable into one pack, and `-d` deletes the packs and loose files that are now redundant.

```console
$ git repack -a -d
...
Total 19 (delta 5), reused 17 (delta 3), pack-reused 0 (from 0)
$ git count-objects -v
count: 0
size: 0
in-pack: 19
packs: 1
size-pack: 6
...
```

| Option | What it does | When to use it |
|---|---|---|
| `-a` | Packs everything into one pack, not only the loose objects | With `-d`, to join many packs |
| `-d` | Removes packs and loose files made redundant by the new pack | Almost always |
| `-f` | Throws away existing deltas and computes them again | After a bad import; slow |
| `--window=<n>`, `--depth=<n>` | How many neighbours to compare with (default 10), and the longest delta chain (default 50) | Rarely; tuning a huge repository |

### `git prune`: only the deleting

`git prune` deletes loose objects that are unreachable. `git gc` calls it for you with the two-week limit. Run by hand, it has no waiting time at all, so always look first with `-n` (dry run), which lists what would go and deletes nothing:

```console
$ echo "A draft line" | git hash-object -w --stdin
e778951898ed5da2944e42f4f969bb5f162cf5c7
$ git prune -n
e778951898ed5da2944e42f4f969bb5f162cf5c7 blob
```

The first command writes a blob that nothing points at; the second finds it. `git prune --expire=2.weeks.ago` keeps the usual safety margin. The Git manual itself says that most users should run `git gc` and not `git prune`.

`git prune` reads the reflog as `git gc` does: an object a reflog line leads to is not unreachable, and stays. It also never touches objects inside a packfile.

### Where unreachable objects wait

Some objects are unreachable from the day they are written. Pro Git shows two such leftover blobs that stay behind as loose objects after `git gc`, because no commit used them. Today's Git handles leftovers differently, and you may notice it in the numbers.

:::compare
today: "`git gc` puts unreachable objects that are not old enough to delete into a second packfile, called a cruft pack. It has an extra `.mtimes` file that records each object's age. `git count-objects -v` then shows `packs: 2`."
book: "Pro Git, written for older versions, shows them left as loose objects in `.git/objects`. The first line of its `git gc` output also reads `Counting objects`, where today's Git prints `Enumerating objects`."
:::

Such leftovers are common and harmless. Every `git add` writes a blob at once, so a file you staged, changed and staged again leaves the first blob behind with nothing pointing at it. It waits its two weeks and is then deleted.

### `git gc` options and settings

| Option | What it does | Worth using? |
|---|---|---|
| `--auto` | Tidies only if the limits are passed | It is what Git runs by itself |
| `--prune=<date>` | Deletes unreachable objects older than the date. Default: two weeks ago | `--prune=now` only for a planned clean-up |
| `--no-prune` | Packs, deletes nothing | When you are in the middle of a rescue |
| `--aggressive` | Recomputes every delta with a much wider search. Much slower | Rarely. The Git manual says it is probably not worth it without measuring |
| `--quiet` | Prints no progress | In scripts |

| Setting | Default | Meaning |
|---|---|---|
| `gc.auto` | 6700 | Loose objects before automatic packing. `0` turns automatic garbage collection off |
| `gc.autoPackLimit` | 50 | Packfiles before Git joins them into one |
| `gc.pruneExpire` | 2 weeks ago | Age at which an unreachable object may be deleted |
| `gc.reflogExpire` | 90 days | Age at which a reflog line is dropped |
| `gc.reflogExpireUnreachable` | 30 days | The same, for lines whose commit is no longer on the branch |

Set one for a single project with `git config --local`, for example `git config --local gc.auto 0` on a repository where a rescue is in progress and nothing may be tidied.

### The other lines of `git count-objects -v`

| Line | Meaning |
|---|---|
| `size-pack` | Disk space of all packfiles and their index files |
| `prune-packable` | Loose objects that are also in a pack. `git repack -d` or `git gc` removes them |
| `garbage`, `size-garbage` | Files in `.git/objects` that are neither a valid object nor a pack, such as a half-written file after a crash |

### Three more files you may meet

- **`.git/objects/info/commit-graph`** appeared in your listing after `git gc`. It is a compact table of every commit with its parents, so that `git log` and similar commands can walk the history without unpacking each commit. Git writes it during garbage collection. If the file is missing, Git reads the commits themselves, as before.
- **A multi-pack index** (`.git/objects/pack/multi-pack-index`) is one index over many packfiles. Very large repositories use it to keep several packs and still find an object with one lookup, where joining the packs would take hours. `git multi-pack-index write` creates it.
- **A `.keep` file** beside a packfile (`pack-….keep`) tells `git gc` and `git repack -ad` to leave that pack alone. Servers use it for one huge old pack.

### Where this continues

- `git maintenance`, the scheduled form of these jobs: the lesson "Shallow and partial clone, sparse checkout, LFS, bundles, git maintenance".
- Finding and rescuing unreachable commits with `git reflog` and `git fsck`: the lesson "Recover lost commits with reflog and fsck".
- Shrinking a repository after a huge file was committed, where `git verify-pack -v` sorted by size finds the culprit: the lesson "Remove a leaked secret or huge file from history".

## Recap

- New objects are loose: one file each, every version of a file stored whole. From time to time Git moves them into a packfile (`.pack`) with an index (`.idx`).
- In a packfile, the newest version of a file is stored whole and older versions as small deltas. Commits are still full snapshots; deltas are only storage.
- `git count-objects -vH` measures: `count` is loose objects, `in-pack` is packed objects, `packs` is the number of packfiles.
- `git gc` packs and tidies. Git runs it by itself past about 6,700 loose objects or 50 packs, so you rarely type it.
- A plain `git gc` deletes only objects that no branch, tag, stash or reflog line leads to and that are over two weeks old. `git reflog expire --expire=now --all` with `git gc --prune=now` deletes them at once, for good.
