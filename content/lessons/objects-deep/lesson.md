---
id: objects-deep
title: "Blobs, trees, commits and how they are stored"
module: under-the-hood
bookSection: "10.2 Git Objects"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
bookSources:
  - vendor/progit2/book/10-git-internals/sections/objects.asc
readFirst: [first-look-inside]
---

`git add` and `git commit` each hide a few small steps, and when a reset, a rebase or a "lost" commit confuses you, those hidden steps are the explanation. In this lesson you make three commits without `git add` and without `git commit`, one object at a time, so nothing Git does to your history is a mystery again.

## Must know

In [A first look inside .git](lesson:first-look-inside) you read objects: you followed a commit to its [tree](term:tree) and down to a [blob](term:blob). You only looked. Here you write: first a blob, then a tree, then a commit, then the name that makes the commit part of a branch. Each step uses one [plumbing](term:plumbing) command, the low-level kind that everyday commands like `git add` are built from.

You will not work this way day to day. You do it once, to see what the everyday commands do for you.

### The practice project is empty

The practice project on the right is an empty repository this time: `git init` was run, and nothing else. (If you started another challenge, start the first one, "The ID of a line of text", to get the empty project.)

```console
$ find .git/objects -type f
$ git status
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
```

`find .git/objects -type f` lists every file under `.git/objects`. It prints nothing: Git has stored no [object](term:object) yet. The folder `.git/objects` is called the [object database](term:object-database), and you are about to fill it by hand.

### Git is a store of keys and content

Pro Git opens this chapter with one sentence: Git is a "content-addressable filesystem". In plain words, it is a store with two operations:

- You hand in some content, and Git hands back a key.
- You hand in the key, and Git hands back the content.

The key is not chosen by you or picked at random. Git computes it from the content, as a [checksum](term:checksum). That is what [content-addressable](term:content-addressable-storage) means: the content decides its own address.

`git hash-object` is the "hand in content" side. It takes some content and prints the key that content gets:

```console
$ echo 'hello, objects' | git hash-object --stdin
e8dbf7065da8490eaf6c06f85bd346d43dd125b4
```

Two details in that line:

- `echo 'hello, objects' |` sends the text to the next command instead of the screen.
- `--stdin` tells `git hash-object` to read the content from there ("standard input") and not from a file.

In this form the command only computes. Nothing is stored yet, so asking for the object fails:

```console
$ git cat-file -p e8dbf70
fatal: Not a valid object name e8dbf70
```

Add `-w` ("write") and Git also stores the content in the object database:

```console
$ echo 'hello, objects' | git hash-object -w --stdin
e8dbf7065da8490eaf6c06f85bd346d43dd125b4
$ find .git/objects -type f
.git/objects/e8/dbf7065da8490eaf6c06f85bd346d43dd125b4
```

One new file. Its path is the key: the first two characters name a folder, the other 38 name the file. `git cat-file` is the "hand in the key" side, and you know it already:

```console
$ git cat-file -p e8dbf70
hello, objects
$ git cat-file -t e8dbf70
blob
$ git cat-file -s e8dbf70
15
```

| Option | Prints | Use it when |
|---|---|---|
| `-p` | The content, in a readable form | You want to see what an object holds. The one you use most |
| `-t` | The type: `blob`, `tree`, `commit` or `tag` | You have an ID and do not know what it is |
| `-s` | The size in bytes, before compression | You hunt for large files, or check that two objects differ |

Fifteen bytes: 14 characters, plus the line ending that `echo` adds.

:::try-it
1. Run `echo 'hello, objects' | git hash-object --stdin`. Git prints `e8dbf70…`, the same ID as above, because your content is the same.
2. Run `find .git/objects -type f`. It prints nothing: without `-w`, Git computed the ID and stored nothing.
3. Run `echo 'hello, objects' | git hash-object -w --stdin`. The same ID again, and this time `find .git/objects -type f` shows one file, under the folder `e8`.
4. Run `git cat-file -p e8dbf70`. Git gives the text back. In the picture nothing moves: an object alone belongs to no file and no commit yet.
:::

### Two versions of one file

A line of text is a toy. Files are the real case, and `git hash-object -w <file>` stores a file's content the same way. Make a file of your own, store it, change it, store it again:

```console
$ echo 'day one' > diary.txt
$ git hash-object -w diary.txt
6227890909254744be2da993385ae0c6d9df6204
$ echo 'day two' > diary.txt
$ git hash-object -w diary.txt
56ad46284317211d9b5052aac3a2a6797982e433
```

The object database now holds both versions, although `diary.txt` in your folder only shows the second. Either one comes back with `git cat-file -p` (the `>` writes the output into the file):

```console
$ git cat-file -p 6227890 > diary.txt
$ cat diary.txt
day one
$ git cat-file -p 56ad462 > diary.txt
$ cat diary.txt
day two
```

That is version control in its smallest form, and it has two problems. The book names both:

- You must remember an ID for every version of every file.
- The name `diary.txt` is stored nowhere. A blob holds content and nothing else.

:::predict
question: "You copy diary.txt to copy.txt, so both files hold `day two`, and run `git hash-object -w copy.txt`. How many new files appear in .git/objects?"
answer: "None. The ID is computed from the content, and the content is the same, so Git prints `56ad462…` again and finds that object already stored. One blob serves every file with that content, in every commit."
:::

:::try-it
1. Run the four commands of the first block above. You get the IDs `6227890…` and `56ad462…`: the same as printed here, because a blob's ID depends only on its content.
2. Run `git status`. Git lists `diary.txt` under "Untracked files", and in the picture the `diary.txt` sheet sits in the working tree. Storing a blob does not stage a file: the staging area is still empty.
3. Run `git cat-file -p 6227890`. Git prints `day one`, the version your folder no longer has.
:::

### A tree gives the content a name

The next object type solves both problems. A tree is the listing of one folder: each line gives a name and the ID of the object behind it. The first look inside showed you trees that `git commit` had made. Now you make one.

Git builds a tree from the [staging area](term:staging-area) (also called the index). So the job has two steps: put an entry in the staging area, then write the staging area out as a tree.

`git update-index` is the plumbing command that edits the staging area. This line stages the *first* version of the diary, straight from the object database:

```console
$ git update-index --add --cacheinfo 100644,6227890909254744be2da993385ae0c6d9df6204,diary.txt
```

It prints nothing. Read it piece by piece:

| Piece | Meaning |
|---|---|
| `--add` | The name is not in the staging area yet, so add it. Without `--add`, Git only updates names it already has |
| `--cacheinfo` | Take the entry from the three values that follow, not from a file in the folder. ("Cache" is an old name for the index.) |
| `100644` | The [mode](term:file-mode): the kind of entry. `100644` is a normal file |
| `6227890…` | The blob to list. Here the full 40-character ID is required |
| `diary.txt` | The name to list it under |

The mode comes from Unix file permissions, but Git knows only a few values:

| Mode | Kind of entry |
|---|---|
| `100644` | A normal file. Almost every line you see |
| `100755` | An executable file, such as a script you can run |
| `120000` | A symbolic link: a file that points at another path |
| `040000` | A folder, pointing at another tree. Git writes this one itself |

Now write the staging area out. `git write-tree` makes a tree object from whatever is staged and prints its ID:

```console
$ git write-tree
494173472c396acaf0567cc7d840ba10b0767785
$ git cat-file -p 4941734
100644 blob 6227890909254744be2da993385ae0c6d9df6204	diary.txt
$ git cat-file -t 4941734
tree
```

The name `diary.txt` is now stored, next to the ID of the content it stands for. `git write-tree` needs no `-w`: it always stores the tree, unless the same tree is already there.

:::compare
today: "`git update-index --add --cacheinfo 100644,<id>,diary.txt`: one value with commas, the form the Git reference documents."
book: "`git update-index --add --cacheinfo 100644 <id> diary.txt`: three separate values. Pro Git uses this older form, and it still works."
:::

:::try-it
1. Run the `git update-index` line above. Nothing is printed. In the picture, a `diary.txt` sheet appears in the staging area.
2. Run `git status`. Git lists `diary.txt` twice: as a "new file" to be committed (the staged `day one`) and as "modified" (your folder holds `day two`). You staged a version that is not the one in your folder, which `git add` can never do.
3. Run `git write-tree`. Git prints `4941734…`. The picture stays as it was: a tree is an object, and no commit uses it yet.
4. Run `git cat-file -p 4941734`. One line: mode, type, blob ID and the name.
:::

### A second tree, and a tree inside a tree

One snapshot is not a history. Build a second tree: the diary's second version plus a new file.

```console
$ echo 'buy a new pen' > todo.txt
$ git update-index --cacheinfo 100644,56ad46284317211d9b5052aac3a2a6797982e433,diary.txt
$ git update-index --add todo.txt
$ git write-tree
1934dbb4295a7059b823c6144d170d8a188ea127
$ git cat-file -p 1934dbb
100644 blob 56ad46284317211d9b5052aac3a2a6797982e433	diary.txt
100644 blob 3f1552cda9e2eeff23ca832cd40b12478f41a13a	todo.txt
```

Two things differ from the first time:

- The first `update-index` has no `--add`, because `diary.txt` is already in the staging area. The line swaps its blob for the `day two` one.
- `git update-index --add todo.txt` names a file in your folder. Git stores its content as a blob and stages it in one go. That is the core of what `git add todo.txt` does.

The first tree `4941734` is still in the object database, untouched. A new tree never changes an old one.

A folder inside a project is a tree inside a tree. `git read-tree` reads an existing tree into the staging area, and with `--prefix=<folder>` it puts the tree's entries under that folder name. Read the first tree in as a folder named `backup`:

```console
$ git read-tree --prefix=backup 494173472c396acaf0567cc7d840ba10b0767785
$ git write-tree
dd2cb448fdcf3bf5b82a97faf39c0858e7129f27
$ git cat-file -p dd2cb44
040000 tree 494173472c396acaf0567cc7d840ba10b0767785	backup
100644 blob 56ad46284317211d9b5052aac3a2a6797982e433	diary.txt
100644 blob 3f1552cda9e2eeff23ca832cd40b12478f41a13a	todo.txt
```

The `backup` line has the mode `040000` and the type `tree`, and its ID is your first tree. Git did not copy anything: the third tree points at the first. The blob `day one` is stored once and reached twice.

You now have three trees, each a full snapshot:

| Tree | Holds |
|---|---|
| `4941734` | `diary.txt` (day one) |
| `1934dbb` | `diary.txt` (day two), `todo.txt` |
| `dd2cb44` | `diary.txt` (day two), `todo.txt`, `backup/diary.txt` (day one) |

:::try-it
1. Run the first four commands of the block above, from `echo` to `git write-tree`. Git prints `1934dbb…`. In the picture, a `todo.txt` sheet joins `diary.txt` in the staging area.
2. Run `git read-tree --prefix=backup 494173472c396acaf0567cc7d840ba10b0767785`, then `git write-tree`. Git prints `dd2cb44…`. The staging area in the picture gains `backup/diary.txt`.
3. Run `git cat-file -p dd2cb44`. Three lines, and the first one is a tree.
4. Run `git ls-tree -r dd2cb44`. The `-r` walks into subfolders, so you see all three files with their full paths, `backup/diary.txt` first.
:::

### A commit says who, when, why and what came before

The trees fixed the names. The first problem is back, one level up: you have three snapshots and must remember three IDs. Nothing says which came first, who made them, or why.

A commit object stores exactly that. `git commit-tree` makes one: you give it a tree, and the message on standard input, and it prints the new commit's ID.

```console
$ echo 'First entry' | git commit-tree 4941734
3bafa0b5769fb63eaeeb238d0954123beafdcccb
$ git cat-file -p 3bafa0b
tree 494173472c396acaf0567cc7d840ba10b0767785
author Practice Student <student@example.com> 1795731107 +0300
committer Practice Student <student@example.com> 1795731107 +0300

First entry
```

**Your ID will not be `3bafa0b`.** Until now every ID matched this page, because blobs and trees hold only content and names. A commit also holds your name and the time, down to the second, so its ID is yours alone. From here on, use the IDs your terminal prints.

The commit has a `tree` line, the author and committer (taken from your `user.name` and `user.email` settings, plus the time), an empty line and the message. It has no `parent` line: it is the first commit.

The next two commits each name the one before, with `-p` ("parent"):

```console
$ echo 'Second entry' | git commit-tree 1934dbb -p 3bafa0b
8793ba66cf17000acad3371422742d134f62c2e9
$ echo 'Add a backup folder' | git commit-tree dd2cb44 -p 8793ba6
48aba82ff28bdf0d1015dec188e88a4e5edbf491
$ git cat-file -p 48aba82
tree dd2cb448fdcf3bf5b82a97faf39c0858e7129f27
parent 8793ba66cf17000acad3371422742d134f62c2e9
author Practice Student <student@example.com> 1795731108 +0300
committer Practice Student <student@example.com> 1795731108 +0300

Add a backup folder
```

That `parent` line is the whole link between two commits. A [parent commit](term:parent-commit) is not found by date or by order of creation: it is the ID you passed with `-p`.

This is a real history. Give `git log` the last ID and it walks the parents:

```console
$ git log --oneline 48aba82
48aba82 Add a backup folder
8793ba6 Second entry
3bafa0b First entry
```

:::careful
`git commit-tree` with no message on standard input sits and waits for you to type one. If the terminal seems stuck, type the message, press Enter, then Ctrl+D to end the input. Or pass the message with `-m "First entry"` (see Advanced).
:::

:::try-it
1. Run `echo 'First entry' | git commit-tree 4941734`. Git prints a commit ID. Copy it; the steps below call it `<first>`.
2. Run `echo 'Second entry' | git commit-tree 1934dbb -p <first>`. Copy the new ID as `<second>`.
3. Run `echo 'Add a backup folder' | git commit-tree dd2cb44 -p <second>`. Copy the new ID as `<third>`.
4. Run `git log --oneline <third>`. Three commits, newest first. The history map is still empty, and the next part explains why.
:::

### No branch points at it yet

Three commits exist. Does Git "have" them?

:::predict
question: "You made three commits with git commit-tree. What does a plain `git log` print now?"
answer: "`fatal: your current branch 'main' does not have any commits yet`. The commits are in the object database, but `git log` starts from the branch you are on, and no branch points at them. A commit that no name reaches is invisible to everyday commands."
:::

A [branch](term:branch) is a [ref](term:ref): a name that holds one commit ID. `git commit-tree` makes the object and stops there. Moving the branch is a separate step, and its plumbing command is `git update-ref`:

```console
$ git update-ref refs/heads/main 48aba82ff28bdf0d1015dec188e88a4e5edbf491
$ git log --oneline
48aba82 Add a backup folder
8793ba6 Second entry
3bafa0b First entry
```

`git update-ref <ref> <commit>` writes the ID into the ref. Give it the ref's full name, `refs/heads/main`, not just `main`. The lesson [References, HEAD, tags and remotes on disk](lesson:refs-deep) covers refs in depth; here it is only the last step.

:::graph
caption: "After git update-ref: main points at the third commit, and its parents come with it"
commits:
  - id: A
    message: First entry
  - id: B
    message: Second entry
    parents: [A]
  - id: C
    message: Add a backup folder
    parents: [B]
branches:
  main: C
head: main
:::

:::try-it
1. Run `git log --oneline`. Git answers `fatal: your current branch 'main' does not have any commits yet`.
2. Run `git update-ref refs/heads/main <third>`, with your third commit's ID. `git rev-parse <third>` prints the full ID if you only kept the short one. On the history map, three stations appear at once, with the `branch main` tag and the `HEAD · you` pin on the newest.
3. Run `git log --oneline`. Your three commits, with no ID needed.
4. Run `git status`. Git reports `deleted: backup/diary.txt`: the commit holds that file, and your folder never had it. Run `git restore backup` and the folder `backup` appears with `diary.txt` (day one) inside. `git status` is clean, and the picture shows no pending change.
:::

### What you did by hand, Git does on every commit

You built a history with five plumbing commands. The everyday commands (the [porcelain](term:porcelain)) run the same steps:

| Everyday command | The steps inside it |
|---|---|
| `git add diary.txt` | Store the file's content as a blob (`hash-object -w`), then list it in the staging area (`update-index`) |
| `git commit -m "…"` | Write the staging area as trees (`write-tree`), make a commit that names the top tree and the current commit as parent (`commit-tree -p`), then move the current branch to it (`update-ref`) |

The common wrong idea is that a commit stores the changes since the last one. It does not. Your third commit points at a full tree, and that tree reaches every file. Git stays small because unchanged content is reached again, not stored again: the `day one` blob has one copy and two paths.

### Ask for a commit's tree by name

Reading the `tree` line from `git cat-file -p` works, but there is a shorter way. `<commit>^{tree}` means "the tree this commit points at":

```console
$ git rev-parse 'main^{tree}'
dd2cb448fdcf3bf5b82a97faf39c0858e7129f27
$ git cat-file -p 'main^{tree}'
040000 tree 494173472c396acaf0567cc7d840ba10b0767785	backup
100644 blob 56ad46284317211d9b5052aac3a2a6797982e433	diary.txt
100644 blob 3f1552cda9e2eeff23ca832cd40b12478f41a13a	todo.txt
```

Keep the quotes. Git Bash works without them, but PowerShell and zsh treat `^` and `{}` as their own symbols and break the command. `git ls-tree main` prints the same listing with less typing.

### When it goes wrong

```console
$ git update-index --cacheinfo 100644,6227890909254744be2da993385ae0c6d9df6204,extra.txt
error: extra.txt: cannot add to the index - missing --add option?
fatal: git update-index: --cacheinfo cannot add extra.txt
```

The name `extra.txt` is not in the staging area yet, and `git update-index` only adds new names when you say so. Put `--add` before `--cacheinfo`.

```console
$ git update-index --add --cacheinfo 100644,6227,y.txt
error: option 'cacheinfo' expects <mode>,<sha1>,<path>
```

Git could not read the three values, because `6227` is not a full ID. `--cacheinfo` wants all 40 characters. A short one works almost everywhere else in Git, but not here. Print the full ID with `git rev-parse 6227`.

```console
$ echo 'oops' | git commit-tree 6227890909254744be2da993385ae0c6d9df6204
fatal: 6227890909254744be2da993385ae0c6d9df6204 is not a valid 'tree' object
```

You gave `git commit-tree` a blob. A commit points at a tree, never straight at a file. Check an ID with `git cat-file -t`, and pass the one `git write-tree` printed.

```console
$ git update-ref main2 8793ba6
$ git branch
* main
```

No error, and no new branch. `git update-ref` took `main2` as a full path and wrote a file `.git/main2`, outside `refs/heads` where branches live. Always write the full name: `git update-ref refs/heads/main2 <commit>`. The stray file is harmless; Git refuses to delete it for you, so remove it with `rm .git/main2`.

## Under the hood

You have stored blobs, trees and commits. This layer opens one of those files and shows the four steps Git takes to turn content into a file under `.git/objects`. Pro Git does it in the Ruby language; here the same steps use tools that Git Bash already has.

### Step 1: a header goes in front

Git does not checksum your content alone. It first builds a [header](term:object-header): the object's type, a space, the content's size in bytes, and one zero byte (a byte with the value 0, written `\0`) that marks where the header ends.

For the `day one` blob, the content is 8 bytes (7 characters and the line ending), so Git checksums this:

```text
blob 8\0day one
```

### Step 2: the checksum becomes the ID

Git runs [SHA-1](term:sha-1) over header plus content. SHA-1 is a checksum method that turns any input into 40 characters (the digits 0-9 and the letters a-f). `sha1sum` is an ordinary tool that does the same, and it knows nothing about Git. Hand it the header and the content yourself (`printf` prints text exactly as written, with `\0` as the zero byte and `\n` as the line ending):

```console
$ printf 'blob 8\0day one\n' | sha1sum
6227890909254744be2da993385ae0c6d9df6204 *-
$ echo 'day one' | git hash-object --stdin
6227890909254744be2da993385ae0c6d9df6204
```

The same 40 characters. An object ID is nothing more than the SHA-1 of `<type> <size>\0<content>`.

The header is why a blob and a commit can never share an ID, even with the same bytes inside: the type is part of what gets checksummed.

### Step 3: zlib makes it smaller

Git then compresses header and content together with [zlib](term:zlib), the method inside ZIP and PNG files. That is why `cat` on an object file prints unreadable bytes. Undo the compression and the header is right there. You do not have to run this line; Perl ships with Git for Windows, and `od -c` shows each byte as a character:

```console
$ perl -MCompress::Zlib -e 'undef $/; print uncompress(<>)' .git/objects/62/27890909254744be2da993385ae0c6d9df6204 | od -c
0000000   b   l   o   b       8  \0   d   a   y       o   n   e  \n
0000017
```

That is your `day one` blob: the header `blob 8`, the zero byte, then the 8 bytes of content, the last one being the line ending `\n`.

### Step 4: the ID becomes the path

Git writes the compressed bytes to `.git/objects/`, in a folder named after the first two characters of the ID, in a file named after the other 38:

```text
6227890909254744be2da993385ae0c6d9df6204
└┬┘└──────────────── 38 ───────────────┘
 .git/objects/62/27890909254744be2da993385ae0c6d9df6204
```

To read an object, Git needs no search: the ID is the address.

### Trees and commits are stored the same way

Only the type word and the content differ.

| Type | Header starts with | Content |
|---|---|---|
| blob | `blob` | The file's bytes, anything at all |
| tree | `tree` | For each entry: the mode, a space, the name, a zero byte, then the ID as 20 raw bytes |
| commit | `commit` | Plain text: exactly what `git cat-file -p` prints |

A tree is the one type `git cat-file -p` has to translate for you, because the IDs inside are raw bytes, not text. That also explains its size. Your first tree has one entry:

```console
$ git cat-file -s 4941734
37
```

`100644` (6) + a space (1) + `diary.txt` (9) + a zero byte (1) + the ID (20) = 37 bytes.

A commit's ID covers its whole text, so the same check works on a commit. Build the header for the commit `main` points at, put the commit's raw text behind it, and checksum both:

```console
$ (printf 'commit %s\0' $(git cat-file -s main); git cat-file commit main) | sha1sum
48aba82ff28bdf0d1015dec188e88a4e5edbf491 *-
$ git rev-parse main
48aba82ff28bdf0d1015dec188e88a4e5edbf491
```

`git cat-file -s main` gives the size for the header, and `git cat-file commit main` prints the content with no translation. Your two lines show your own ID, and they match each other.

The tree ID, the parent ID, both names, both times and the message are all inside that checksum. Change one character of any of them and the commit has a new ID.

### One file per object, for now

Each object you made is its own file. Pro Git says objects are stored this way "initially": later Git gathers many of them into one [packfile](term:packfile) to save space. The lesson [Packfiles and garbage collection](lesson:packfiles-gc) covers that, and what happens to objects nothing points at, like your `hello, objects` blob.

## Advanced

Must know used each plumbing command in its plainest form. These are the options and neighbours worth knowing once the basic chain is clear.

### A message without `echo`

`git commit-tree` also takes the message as an option, and more than one parent:

| Option | What it does |
|---|---|
| `-m "<text>"` | Uses the text as the message, so nothing is read from standard input |
| `-F <file>` | Reads the message from a file |
| `-p <commit>` twice | Gives the commit two parents. That is all a merge commit is |

```console
$ git commit-tree 4941734 -m 'With a flag' -p main
d8f5107b62d28a15a4bea7d145d43a91a289ea45
```

### Put the staging area back

`git commit` leaves the staging area equal to the new commit. Plumbing does not tidy up. If you build a commit for another branch while you are on `main`, the staging area still holds what you staged for it, and `git status` reports changes you never meant for `main`:

```console
$ git status -s
AD hand.txt
```

`git read-tree HEAD` (no `--prefix`) replaces the whole staging area with the tree of the commit you are on:

```console
$ git read-tree HEAD
$ git status
On branch main
nothing to commit, working tree clean
```

Your files in the folder are not touched. The everyday way to say the same thing is `git restore --staged .`.

### More from `git ls-tree`

`git ls-tree <commit or tree>` lists a tree without hunting for its ID.

| Option | What it adds | Use it for |
|---|---|---|
| `-r` | Walks into subfolders and lists only files | The full file list of a commit |
| `-l` | A column with each blob's size in bytes | Finding what makes a repository large |
| `--name-only` | Only the paths | Feeding a file list to a script |
| `-d` | Only the folders (trees) | A quick look at the layout |

```console
$ git ls-tree -r -l main
100644 blob 6227890909254744be2da993385ae0c6d9df6204       8	backup/diary.txt
100644 blob 56ad46284317211d9b5052aac3a2a6797982e433       8	diary.txt
100644 blob 3f1552cda9e2eeff23ca832cd40b12478f41a13a      14	todo.txt
```

### Every object at once

`git cat-file --batch-check --batch-all-objects` prints the ID, type and size of every object in the repository. Scripts use it; for you it is a fast inventory.

```console
$ git cat-file --batch-check --batch-all-objects
1934dbb4295a7059b823c6144d170d8a188ea127 tree 73
3bafa0b5769fb63eaeeb238d0954123beafdcccb commit 188
3f1552cda9e2eeff23ca832cd40b12478f41a13a blob 14
...
```

`git cat-file -e <id>` prints nothing and only reports whether the object exists, through its exit status. That is for scripts too: `git cat-file -e 6227890 && echo stored`.

### Other types with `hash-object -t`

`git hash-object` assumes a blob. `-t <type>` names another type, and Git checks that the content has that type's format:

```console
$ echo 'day one' | git hash-object -t commit --stdin
error: object fails fsck: missingTree: invalid format - expected 'tree' line
fatal: refusing to create malformed object
```

A real commit's text gives back the commit's own ID: `git cat-file commit main | git hash-object -t commit --stdin`.

### The fourth type

`git cat-file -t` can also answer `tag`. An [annotated tag](term:annotated-tag) is stored as an object of its own, with a tagger, a date and a message. The lesson "References, HEAD, tags and remotes on disk" opens one.

### SHA-256 repositories

SHA-1 is from 1995, and researchers have since shown how to craft two different inputs with the same SHA-1 checksum. Git guards against that known attack, and it also supports a newer method, [SHA-256](term:sha-256), with 64-character IDs. You choose it when you create a repository:

```console
$ git init -q --object-format=sha256 s256
$ cd s256
$ git rev-parse --show-object-format
sha256
$ echo 'day one' | git hash-object --stdin
4ddb88598469609ff1c3bb528435e9aa320ddefc5cb3fbacb5c71f96ede54325
```

Everything in this lesson works the same there: header, checksum, zlib, path. Only the checksum method and the ID length differ. A repository uses one method for all its objects, and a SHA-256 repository cannot yet exchange commits with a SHA-1 one, so check that your hosting service and your tools support it before you pick it. `git rev-parse --show-object-format` tells you which kind you are in; almost every repository today answers `sha1`.

## Recap

- Git is a content-addressable store: `git hash-object -w` puts content in and returns its ID, `git cat-file -p` takes an ID and returns the content (`-t` for the type, `-s` for the size).
- A blob holds content only. A tree adds names and modes; you build one with `git update-index --add --cacheinfo` and `git write-tree`, and `git read-tree --prefix` nests one tree in another.
- `git commit-tree <tree> -p <parent>` makes a commit: a tree, its parents, who, when and why. Its ID is yours alone, because it holds your name and the time.
- A commit is invisible until a ref points at it: `git update-ref refs/heads/<branch> <commit>`.
- On disk an object is `<type> <size>\0<content>`, checksummed with SHA-1 for the ID, compressed with zlib, and written to `.git/objects/<2 characters>/<38 characters>`.
