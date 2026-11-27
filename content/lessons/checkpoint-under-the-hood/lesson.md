---
id: checkpoint-under-the-hood
title: "Checkpoint: Under the hood"
module: under-the-hood
bookSection: "10 Git Internals"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain
bookSources:
  - vendor/progit2/book/10-git-internals/sections/plumbing-porcelain.asc
  - vendor/progit2/book/10-git-internals/sections/objects.asc
  - vendor/progit2/book/10-git-internals/sections/refs.asc
  - vendor/progit2/book/10-git-internals/sections/packfiles.asc
  - vendor/progit2/book/10-git-internals/sections/maintenance.asc
  - vendor/progit2/book/10-git-internals/sections/environment.asc
  - vendor/progit2/book/07-git-tools/sections/replace.asc
readFirst: [objects-deep, refs-deep, packfiles-gc, plumbing-toolkit]
checkpoint: true
---

Four lessons took Git apart: the objects that hold your work, the names that point at them, the packing that keeps them small, and the switches that steer one command. Here you prove you can explain what Git stores and predict what a command does to it, in three situations where the everyday commands do not help, with no hints.

## Must know

This page teaches nothing new. It is the module on one page: the commands worth remembering, one table per lesson, and the lesson to go back to when a row looks unfamiliar. Read it once, then take the challenges below.

A checkpoint is optional. Its challenges mix the lessons, so each one needs commands from at least two of the tables.

### Objects: what Git stores

From [Blobs, trees, commits and how they are stored](lesson:objects-deep).

| Command | Job |
|---|---|
| `git hash-object --stdin` | Print the ID that some content gets; `-w` also stores it as a [blob](term:blob) |
| `git cat-file -p <object>` | Print what an [object](term:object) holds |
| `git cat-file -t <object>` | Print its type: `blob`, `tree`, `commit` or `tag` |
| `git cat-file -s <object>` | Print its size in bytes |
| `git update-index --add --cacheinfo 100644,<blob>,<name>` | List a stored blob in the staging area under a name |
| `git write-tree` | Write the staging area as a [tree](term:tree) and print its ID |
| `git commit-tree <tree> -p <parent> -m "<text>"` | Make a commit from a tree and print its ID. No branch moves |
| `git read-tree HEAD` | Put the staging area back to the commit you are on |
| `git ls-tree -r <commit>` | List every file of a commit with its blob ID |
| `git cat-file --batch-check --batch-all-objects` | List every object in the repository: ID, type, size |

Three ways to name an object without copying IDs:

| You write | It means |
|---|---|
| `'<commit>^{tree}'` | The tree that commit points at |
| `<commit>:<path>` | The file at that path, as that commit stored it |
| `'<tag>^{commit}'` | The commit an annotated tag leads to |

### Refs: the names for commits

From [References, HEAD, tags and remotes on disk](lesson:refs-deep).

| Command | Job |
|---|---|
| `git for-each-ref` | List every [ref](term:ref) with the ID it holds and that object's type |
| `git update-ref refs/heads/<name> <commit>` | Create a ref or move it. Always the full name |
| `git update-ref -d refs/heads/<name>` | Delete a ref |
| `git symbolic-ref HEAD` | Print the branch HEAD names; `--short` for the short name |
| `git symbolic-ref HEAD refs/heads/<name>` | Rewrite HEAD only. The staging area and your files stay as they are |
| `git rev-parse <name>` | Print the ID a name stands for |
| `git pack-refs --all` | Move every ref into the one file `.git/packed-refs` |

Ask Git, not the folder: a ref may be a line in `packed-refs` and have no file under `.git/refs`.

### Packfiles: how Git keeps it small

From [Packfiles and garbage collection](lesson:packfiles-gc).

| Command | Job |
|---|---|
| `git count-objects -vH` | Measure: `count` is loose objects, `in-pack` is packed objects, `packs` is the number of packfiles |
| `git gc` | Gather loose objects into a [packfile](term:packfile) and pack the refs. History does not change |
| `git verify-pack -v .git/objects/pack/pack-*.idx` | List the objects in a pack; a line with a base ID at the end is a delta |
| `git reflog expire --expire=now --all` | Erase every [reflog](term:reflog) line |
| `git gc --prune=now` | Delete unreachable objects at once, without the two-week wait |

:::careful
The last two rows together remove the safety net for the whole repository: every commit you reset away, amended or rebased is deleted for good. A plain `git gc` is safe at any time.
:::

### Switches: steer one command

From [Environment variables and git replace](lesson:plumbing-toolkit).

| You type | Job |
|---|---|
| `GIT_TRACE=1 git status` | Set a variable for that one command; here Git prints what it runs |
| `git -c <key>=<value> <command>` | Give one setting another value for one command |
| `git -C <folder> <command>` | Run the command as if started in that folder |
| `GIT_DIR=<path> GIT_WORK_TREE=<path> git status` | Name the repository and the working tree when they are apart. Give both |
| `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_AUTHOR_DATE` | Set who wrote one commit, and when |
| `GIT_COMMITTER_NAME`, `GIT_COMMITTER_EMAIL`, `GIT_COMMITTER_DATE` | Set who recorded it, and when |
| `git replace --graft <commit> <parent>` | Show a commit with another parent. No ID changes |
| `git --no-replace-objects log` | Look past every replacement |
| `git replace -d <commit>` | Delete a replacement |

### How to read the picture in these challenges

The history map draws what branches, tags and HEAD lead to. An object or a commit that no name leads to is still stored, but the map has no place for it, so a challenge here may start with less in the picture than in the repository. The terminal is the tool for this module: `git cat-file` and `git for-each-ref` show what the picture cannot.

## Under the hood

These are the ideas behind the tables. If one of them surprises you, the lesson named beside it explains it with a worked example.

### The ID is a checksum of the content

Git is a store of keys and content, and the key is computed: the SHA-1 [checksum](term:checksum) of `<type> <size>\0<content>`. Same content, same ID, on every computer. A blob's ID depends only on the file's bytes. A commit's ID also covers its tree, its parents, both names, both dates and the message, so one changed second gives a new ID. ([Blobs, trees, commits and how they are stored](lesson:objects-deep))

### A commit is a snapshot with a link back

A blob holds content and no name. A tree lists names, each with the ID of a blob or of another tree. A commit names one tree and its parents. Nothing stores "the change": unchanged files are reached again, not stored again. ([Blobs, trees, commits and how they are stored](lesson:objects-deep))

### A name is one ID

A branch, a tag and a remote-tracking branch are each a ref that holds one ID. HEAD is a [symbolic ref](term:symbolic-ref): it holds the name of a branch, or a commit ID when detached. An [annotated tag](term:annotated-tag) takes two steps: its ref holds a [tag object](term:tag-object), and the tag object names the commit. ([References, HEAD, tags and remotes on disk](lesson:refs-deep))

### A commit is visible only while a name leads to it

`git log` starts from refs and follows parents. A commit no ref leads to is still in the object database, and stays there while the reflog remembers it or until it is two weeks old and `git gc` runs. Deleting a branch deletes a name, not a commit. ([Packfiles and garbage collection](lesson:packfiles-gc))

### Packing changes storage, never content

In a packfile the newest version of a file is stored whole and older ones as a [delta](term:delta). Every command still gets the full object, with the same ID. The files under `.git/objects` and `.git/refs` may be gone after `git gc`; the objects and refs are not. ([Packfiles and garbage collection](lesson:packfiles-gc))

### Variables win, and replacements are refs

The `GIT_AUTHOR_…` and `GIT_COMMITTER_…` variables win over every setting, which is how a script makes the same commit on any computer. A replacement is a ref under `refs/replace`: Git swaps the object at the moment it reads it, so the IDs stored in other commits stay true. ([Environment variables and git replace](lesson:plumbing-toolkit))

## Advanced

You will rarely type these commands in a normal week. Their ideas come back in the rest of the course, mostly when something has gone wrong.

### When work is lost

The lesson [Recover lost commits with reflog and fsck](lesson:rescue-lost-work) builds on one fact from this module: an object stays stored after its name is gone. It adds `git fsck`, which finds such objects for you. The third challenge below is that rescue done with this module's tools alone.

### When history must really shrink

The lesson [Remove a leaked secret or huge file from history](lesson:remove-sensitive-data) ends with the pair `git reflog expire --expire=now --all` and `git gc --prune=now`, and uses `git verify-pack -v` to find the largest objects. You now know why a rewrite alone does not free the space: the old objects are still reachable from the reflog.

### In large repositories

The lesson [Shallow and partial clone, sparse checkout, LFS, bundles, git maintenance](lesson:large-repos) schedules the tidy-up from this module with `git maintenance`, and its partial clones leave out blobs until a command asks for them.

### In scripts and automation

The lessons on hooks and on GitHub Actions run Git with nobody at the keyboard. That is where `GIT_EDITOR=true`, `GIT_TERMINAL_PROMPT=0`, the author and committer variables, and `git update-ref` with a full ref name earn their place.

### In the capstones

This checkpoint is the course's proof that you can explain Git's model: snapshots, objects, refs and the three areas. The capstone projects assume it when they ask you to predict what a reset, a rebase or a merge will do before you run it.

## Recap

- `git cat-file -t`, `-p` and `-s`: what kind of object an ID is, what it holds, and how large it is.
- `git rev-parse <name>`, `'<commit>^{tree}'`, `<commit>:<path>`, `'<tag>^{commit}'`: turn any name into the ID behind it.
- `git for-each-ref` lists every name; `git update-ref refs/heads/<name> <commit>` writes one; `git symbolic-ref HEAD` reads or writes HEAD.
- `git count-objects -vH` measures, `git gc` packs. Ask Git for objects and refs, never the files in `.git`.
- `GIT_AUTHOR_…` and `GIT_COMMITTER_…` in front of a command set who and when; `git replace --graft` changes what history looks like without changing an ID.
