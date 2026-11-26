---
id: refs-deep
title: "References, HEAD, tags and remotes on disk"
module: under-the-hood
bookSection: "10.3 Git References"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Git-References
bookSources:
  - book/progit2/book/10-git-internals/sections/refs.asc
readFirst: [first-look-inside]
---

A deploy script has to move a branch without switching to it. A project you worked on for a year suddenly says "No commits yet". A release tag has an ID that is not the ID of the commit it marks. All three are about the same small thing: the names Git keeps for commits. This lesson shows where every name lives on disk, and how to read and write one safely.

## Must know

In [A first look inside .git](lesson:first-look-inside) you opened two small files: `.git/refs/heads/main`, which holds one commit ID, and `.git/HEAD`, which holds the name of your branch. You only read them. Now you will list every name a repository has, write one yourself, and see what a tag and a server's branch look like on disk.

The commands here are [plumbing](term:plumbing): low-level commands made for scripts and for looking inside. You will not type them every day. You need them when you write a script, when you repair a repository, and when you want to know what `git branch` or `git switch` did.

### Every name is a ref

The practice project on the right is a small bakery site with three commits. `git log` shows four names on them:

```console
$ git log --oneline --decorate
4bc5afa (HEAD -> main, tag: v1.0, origin/main) Add opening hours
ba3c27e (tag: v0.9) Add menu
f8d599d Add README
```

Your commit IDs differ from the ones printed here, because your commits were made at another time. Use your own IDs in every step.

Each name is a [ref](term:ref) (short for reference): a name that stands for an ID. Refs are files in the folder `.git/refs`, and the folder they sit in says what kind of name they are:

```console
$ find .git/refs -type f
.git/refs/heads/main
.git/refs/remotes/origin/main
.git/refs/tags/v0.9
.git/refs/tags/v1.0
```

| Folder | Holds | You know it as |
|---|---|---|
| `.git/refs/heads/` | Your branches. Pro Git calls a branch a "head": the end of a line of work | `main` |
| `.git/refs/tags/` | Tags | `v1.0` |
| `.git/refs/remotes/origin/` | Your record of the branches on the server named `origin` | `origin/main` |

A ref has a full name, which is its path below `.git`: `refs/heads/main`. The short name `main` is what you type; Git finds the file.

Reading the folder works today, but it is not reliable (Under the hood shows why: Git can move refs out of that folder). The command that always lists every ref is `git for-each-ref`:

```console
$ git for-each-ref
4bc5afa7dd4664c2fb88427128a252161112989f commit	refs/heads/main
4bc5afa7dd4664c2fb88427128a252161112989f commit	refs/remotes/origin/main
ba3c27e57abce8618aa5ef0e5bc9eb0eede63a06 commit	refs/tags/v0.9
10cb1c0f49c7c50187f82f7365e6ce6e8a00f320 tag	refs/tags/v1.0
```

One line per ref, in three columns: the ID the ref holds, the type of the [object](term:object) with that ID, and the ref's full name. Add a folder name to see one kind only: `git for-each-ref refs/tags`.

Look at the last line. Three refs hold a commit, but `refs/tags/v1.0` holds something of type `tag`, with an ID that appears nowhere in `git log`. The part about tags below explains it.

:::try-it
1. Run `find .git/refs -type f`. Git's storage shows four files: one branch, one record of a branch on the server, and two tags.
2. Run `cat .git/refs/heads/main`. You get one 40-character ID, the commit with the `branch main` tag on the history map.
3. Run `git for-each-ref`. The same four names, each with its ID and type. In the picture, nothing moves: you only looked.
:::

### Write a ref with `git update-ref`

Reading is half of it. A branch is a file with one ID in it, so making a branch means writing such a file, and Git has a command for exactly that.

`git update-ref <full-name> <commit>` tells Git: make this ref hold this commit. If the ref does not exist yet, Git creates it.

```console
$ git update-ref refs/heads/scratch ba3c27e
$ cat .git/refs/heads/scratch
ba3c27e57abce8618aa5ef0e5bc9eb0eede63a06
$ git branch
* main
  scratch
$ git log --oneline scratch
ba3c27e Add menu
f8d599d Add README
```

A new file appeared in `refs/heads`, so `git branch` lists a new branch. Nothing else changed: no commit was made, no file in your folder was touched, and you are still on `main`. The branch `scratch` holds only the work up to "Add menu".

:::graph
caption: "After git update-ref refs/heads/scratch ba3c27e: one new name, no new commit"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add menu
    parents: [A]
  - id: C
    message: Add opening hours
    parents: [B]
branches:
  main: C
  scratch: B
tags:
  v0.9: B
  v1.0: C
remotes:
  origin/main: C
head: main
:::

This is what `git branch scratch ba3c27e` does for you. In Pro Git's words, a branch is "a simple pointer or reference to the head of a line of work", and `git branch` basically runs `update-ref`.

Where the command asks for a commit, you can give a short ID, a full ID, or a name Git can turn into a commit, like `HEAD~1` or `v0.9`.

The forms you will meet in scripts:

| Form | What it does | When people use it |
|---|---|---|
| `git update-ref refs/heads/x <commit>` | Creates the ref or moves it | A deploy script moves a `deployed` branch to what was just released, without switching branches |
| `git update-ref -d refs/heads/x` | Deletes the ref | Cleaning up refs a tool left behind |
| `git update-ref refs/heads/x <new> <old>` | Moves the ref only if it holds `<old>` right now | Two scripts may run at once; neither may overwrite the other's move |
| `git update-ref -m "reason" refs/heads/x <commit>` | Also writes the reason into the ref's log | Leaving a trace of why a script moved a branch |

For daily work, `git branch` and `git switch -c` are the right tools. `update-ref` is worth knowing because it works on any ref, not only branches, and because it changes that one ref and nothing more.

:::try-it
1. Run `git log --oneline` and note the ID next to "Add menu".
2. Run `git update-ref refs/heads/scratch` followed by that ID. Git prints nothing. On the history map, a `branch scratch` tag appears on the "Add menu" station; the `HEAD · you` pin stays on `main`.
3. Run `cat .git/refs/heads/scratch`. The file holds the full ID of "Add menu".
4. Run `git branch`. Git lists `main` (with a star, you are on it) and `scratch`. Keep `scratch`: the next Try-it uses it.
:::

### Why not write the file yourself

If a ref is a file, `echo` could write it. Pro Git shows this once and then says you are not encouraged to do it. Here is what happens with a small slip, a short ID where the file needs the full one:

```console
$ echo "ba3c27e" > .git/refs/heads/byhand
$ git branch
warning: ignoring broken ref refs/heads/byhand
* main
  scratch
```

The file is there, and Git cannot use it. `git update-ref` does four things a plain `echo` skips:

- **It checks the value.** The object must exist, and a branch must hold a commit:

  ```console
  $ git update-ref refs/heads/typo 1234567890123456789012345678901234567890
  fatal: update_ref failed for ref 'refs/heads/typo': trying to write ref 'refs/heads/typo' with nonexistent object 1234567890123456789012345678901234567890
  ```

- **It writes the ref's log.** Each move is recorded in the [reflog](term:reflog), Git's diary of where a ref pointed before, which is how you undo a wrong move. A hand-written file leaves no record.
- **It locks the ref while writing**, so two programs cannot write half a file each.
- **It works wherever the ref is stored.** A ref is not always a file of its own (Under the hood: `packed-refs`). `update-ref` writes to the right place.

:::careful
Never write, edit or delete files under `.git/refs` by hand, and never `echo` into `.git/HEAD`. Use `git update-ref` for a ref and `git symbolic-ref` for HEAD.
:::

### HEAD is a symbolic ref

A branch file holds an ID. One file in `.git` holds something else, and Git depends on it for nearly every command.

`.git/HEAD` holds the name of another ref. A ref that points at a ref, and not at an ID, is called a [symbolic ref](term:symbolic-ref). [HEAD](term:head) is the one you meet every day: it says which branch you are on.

```console
$ cat .git/HEAD
ref: refs/heads/main
$ git symbolic-ref HEAD
refs/heads/main
$ git symbolic-ref --short HEAD
main
```

`git symbolic-ref HEAD` reads HEAD and prints the ref inside it. `--short` prints the short name; scripts use this to ask "which branch am I on?".

HEAD is why a commit lands on the right branch. When you run `git commit`, Git reads HEAD to find the branch, uses the commit that branch holds as the parent of the new commit, and then writes the new commit's ID into the branch's file. HEAD itself does not change: it still says `ref: refs/heads/main`.

With a second argument, the command writes HEAD:

```console
$ git symbolic-ref HEAD refs/heads/scratch
$ cat .git/HEAD
ref: refs/heads/scratch
```

That one line in one file is all it changes. This is the difference from `git switch scratch`, which rewrites HEAD **and** puts the branch's files into the staging area and your working tree.

:::predict
question: "You are on main, with a clean working tree. main has hours.txt; the branch scratch, one commit behind, does not. You run `git symbolic-ref HEAD refs/heads/scratch` and then `git status`. What does status say about hours.txt?"
answer: "It lists hours.txt as a new file that is staged. HEAD now says you are on scratch, whose commit has no hours.txt. The staging area and your folder were not touched, so they still hold main's files. Git compares them with the commit of scratch and reports the difference as your change."
:::

:::try-it
1. Run `git symbolic-ref HEAD`. Git prints `refs/heads/main`.
2. Run `git symbolic-ref HEAD refs/heads/scratch`. Git prints nothing. In the picture, the `HEAD · you` pin jumps onto the "Add menu" station, next to `branch scratch`.
3. Run `git status`. Git says `On branch scratch` and lists `new file:   hours.txt` under "Changes to be committed", although you staged nothing. The predict box above says why.
4. Put HEAD back: `git symbolic-ref HEAD refs/heads/main`. The pin returns to the newest station, and `git status` reports a clean working tree again.
5. Delete your branch: `git update-ref -d refs/heads/scratch`. The `branch scratch` tag leaves the history map.
:::

So when is writing HEAD this way the right thing? Rarely, and mostly in two places:

- **Repairing a HEAD that names a branch which does not exist** (see "When it goes wrong").
- **On a server.** A repository on a server has no working tree, and its HEAD decides which branch a new clone starts on. `git symbolic-ref HEAD refs/heads/main`, run inside that repository, sets it.

To change branches in a normal project, use `git switch`.

Git only accepts a target inside `refs/`:

```console
$ git symbolic-ref HEAD scratch
fatal: Refusing to point HEAD outside of refs/
```

Write the full name, `refs/heads/scratch`.

### Detached HEAD on disk

HEAD usually names a branch. In [Switching branches and detached HEAD](lesson:switch-and-detached-head) you met the other case, [detached HEAD](term:detached-head): you are on a commit and on no branch. On disk the difference is one line.

```console
$ git switch --detach v0.9
HEAD is now at ba3c27e Add menu
$ cat .git/HEAD
ba3c27e57abce8618aa5ef0e5bc9eb0eede63a06
$ git symbolic-ref HEAD
fatal: ref HEAD is not a symbolic ref
```

No `ref:` in the file, only an ID. HEAD is now an ordinary ref that holds a commit, so `git symbolic-ref` has nothing to print.

This also explains the risk of that state. A commit you make now writes its ID into `.git/HEAD` itself, because there is no branch file to write to. Switch away, HEAD gets a new value, and no ref holds the commit any more.

:::try-it
1. Run `git switch --detach v0.9`. Git prints `HEAD is now at …` with the commit "Add menu". In the picture, the pin reads `HEAD · detached` and sits on the "Add menu" station.
2. Run `cat .git/HEAD`. The file holds a 40-character ID and no `ref:`.
3. Run `git symbolic-ref HEAD`. Git answers `fatal: ref HEAD is not a symbolic ref`: HEAD holds a commit, not a branch.
4. Run `git switch main`. The pin reads `HEAD · you` again, and `cat .git/HEAD` prints `ref: refs/heads/main`.
:::

### Tags on disk: two kinds, two shapes

Now back to the odd line in the ref list, the tag whose type is `tag`.

In [Tags and releases](lesson:tags-and-releases) you made two kinds of [tag](term:tag). On disk they differ in what the ref holds.

A [lightweight tag](term:lightweight-tag) is a ref that holds a commit ID, exactly like a branch. The one difference is that Git never moves it. `v0.9` is one:

```console
$ cat .git/refs/tags/v0.9
ba3c27e57abce8618aa5ef0e5bc9eb0eede63a06
$ git cat-file -t ba3c27e
commit
```

You could make one with `git update-ref refs/tags/v0.9 ba3c27e`. In Pro Git's words: "that is all a lightweight tag is, a reference that never moves".

An [annotated tag](term:annotated-tag) needs a place for its message, its author and its date, and a ref has room for one ID only. So Git stores those in a new object, a [tag object](term:tag-object), and the ref holds the ID of that object. `v1.0` is one:

```console
$ cat .git/refs/tags/v1.0
10cb1c0f49c7c50187f82f7365e6ce6e8a00f320
$ git cat-file -t 10cb1c0
tag
$ git cat-file -p 10cb1c0
object 4bc5afa7dd4664c2fb88427128a252161112989f
type commit
tag v1.0
tagger Practice Student <student@example.com> 1772701200 +0000

First release
```

Read the tag object line by line:

- `object 4bc5afa…`: the ID of what was tagged. Compare with `git log`: it is the commit "Add opening hours".
- `type commit`: the type of that object.
- `tag v1.0`: the tag's name.
- `tagger`: who made the tag and when (the time as seconds counted from 1970, then the time zone).
- After an empty line: the tag's message.

So an annotated tag takes two steps to reach its commit: the ref holds the tag object, and the tag object names the commit.

```text
lightweight:  refs/tags/v0.9  ->  commit ba3c27e
annotated:    refs/tags/v1.0  ->  tag object 10cb1c0  ->  commit 4bc5afa
```

The common wrong idea is that a tag's ID is always the commit's ID. For an annotated tag, `git rev-parse v1.0` prints the tag object's ID. Commands that need a commit, like `git log v1.0` or `git switch --detach v1.0`, follow the tag object to the commit on their own. To ask for the commit yourself, add `^{commit}` to the name:

```console
$ git rev-parse v1.0
10cb1c0f49c7c50187f82f7365e6ce6e8a00f320
$ git rev-parse "v1.0^{commit}"
4bc5afa7dd4664c2fb88427128a252161112989f
```

This matters when a script compares "the commit of the release tag" with "the commit that was built": compare `v1.0^{commit}`, not `v1.0`.

:::try-it
1. Make an annotated tag of your own on the first commit: `git tag -a try-note -m "A tag with a note" HEAD~2`. In the picture, a `tag try-note` label appears on the "Add README" station.
2. Run `cat .git/refs/tags/try-note`, then `git rev-parse HEAD~2`. The two IDs differ: the ref does not hold the commit.
3. Run `git cat-file -t try-note`. Git answers `tag`. Then run `git cat-file -p try-note` and find the `object` line: that ID is the one `git rev-parse HEAD~2` printed.
4. Run `git rev-parse "try-note^{commit}"`. Git follows the tag object and prints the commit ID.
5. Delete the tag: `git tag -d try-note`. The label leaves the history map.
:::

### Remote-tracking refs

Two shelves are done, `heads` and `tags`. The third holds names you never create yourself.

When you fetch from a server or push to it, Git notes where each of the server's branches was at that moment. Those notes are the [remote-tracking branches](term:remote-tracking-branch), and they are refs under `.git/refs/remotes/<remote-name>/`:

```console
$ cat .git/refs/remotes/origin/main
4bc5afa7dd4664c2fb88427128a252161112989f
```

The same shape as a branch: one commit ID. The difference is in how Git treats it. Pro Git calls these refs read-only bookmarks "to the last known state of where those branches were on those servers". You do not commit on one, because HEAD never names one. Ask Git to go there and HEAD gets the commit's ID, not the ref's name:

```console
$ git switch --detach origin/main
HEAD is now at 4bc5afa Add opening hours
$ cat .git/HEAD
4bc5afa7dd4664c2fb88427128a252161112989f
```

Only `git fetch`, `git pull` and `git push` move these refs. [Refspecs](lesson:refspecs) showed the rule that decides which server branch becomes which ref here.

### When it goes wrong

```console
$ git update-ref scratch 4bc5afa
$ git log --oneline -1 scratch
warning: refname 'scratch' is ambiguous.
4bc5afa Add opening hours
```

`update-ref` takes the name exactly as you type it. With the short name `scratch`, Git did not touch the branch: it wrote a new file, `.git/scratch`. Now two things are called `scratch`, and Git warns on every use. Always give `update-ref` the full name, `refs/heads/scratch`. `git update-ref -d` refuses a name outside `refs/`, so this one stray file is the exception to the rule above: remove it with `rm .git/scratch`.

```console
$ git symbolic-ref HEAD
fatal: ref HEAD is not a symbolic ref
```

HEAD is detached: it holds a commit ID, not a branch name. Nothing is broken. Run `git switch main` (or any branch) to be on a branch again. In a script, `git symbolic-ref -q HEAD` prints nothing in this case and reports failure through its exit code (the number every command hands back to say whether it worked), so the script can test for it.

```console
$ git status
On branch mian

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   README.md
	new file:   hours.txt
	new file:   menu.txt
```

An old project claims it has no commits. HEAD names a branch that does not exist (here a typo, `mian`), so Git finds no commit to start from and treats every file as new. Your commits are untouched: `git branch` still lists `main`. Point HEAD at the real branch with `git symbolic-ref HEAD refs/heads/main`, and `git status` is clean again.

## Under the hood

"Must know" treated every ref as a small file of its own. That is true for a young repository. This layer shows where refs go when there are many, where their logs are kept, and how Git turns a short name into a full one.

### Packed refs: many refs in one file

A project with ten thousand tags would need ten thousand tiny files, and reading them all is slow. So Git can keep refs as lines in a single file, `.git/packed-refs`. These are [packed refs](term:packed-refs). `git pack-refs --all` moves every ref there:

```console
$ git pack-refs --all
$ find .git/refs -type f
$ cat .git/packed-refs
# pack-refs with: peeled fully-peeled sorted 
4bc5afa7dd4664c2fb88427128a252161112989f refs/heads/main
4bc5afa7dd4664c2fb88427128a252161112989f refs/remotes/origin/main
ba3c27e57abce8618aa5ef0e5bc9eb0eede63a06 refs/tags/v0.9
10cb1c0f49c7c50187f82f7365e6ce6e8a00f320 refs/tags/v1.0
^4bc5afa7dd4664c2fb88427128a252161112989f
```

The `find` prints nothing: the folders under `.git/refs` are empty. Every ref is now a line, the ID and then the full name. A ref with a file of its own is called a **loose** ref; a ref in this file is **packed**.

Two lines need a word:

- The first line, starting with `#`, is a header for Git itself.
- A line starting with `^` belongs to the tag above it. It holds the commit an annotated tag leads to, so Git does not have to open the tag object to find it. Following a tag to its commit is called **peeling** the tag. So `10cb1c0…` is what `refs/tags/v1.0` holds (the tag object), and `^4bc5afa…` is the commit behind it. `v0.9` is lightweight and has no `^` line.

You rarely run `git pack-refs` yourself. Git's housekeeping command, `git gc`, packs every ref, and Git starts that housekeeping on its own from time to time. So any repository that has been in use for a while has a `packed-refs` file. (Without `--all`, `pack-refs` packs only the tags, because branches move often.)

Packed refs keep working like any other:

```console
$ cat .git/refs/tags/v1.0
cat: .git/refs/tags/v1.0: No such file or directory
$ git rev-parse v1.0
10cb1c0f49c7c50187f82f7365e6ce6e8a00f320
```

`cat` fails and `git rev-parse` answers. This is the reason to ask Git and not the folder.

When a packed ref moves, Git does not rewrite the big file. It writes a loose file again, and the loose file wins:

```console
$ echo "Carrot cake" >> menu.txt
$ git add menu.txt
$ git commit -q -m "Add cake to the menu"
$ cat .git/refs/heads/main
2d2e8c0b886ddc946c2b602080d468c67144d06d
$ grep heads/main .git/packed-refs
4bc5afa7dd4664c2fb88427128a252161112989f refs/heads/main
```

The line in `packed-refs` is out of date, and Git ignores it because a loose ref with the same name exists. Someone who reads only `packed-refs`, or only the folder, gets a wrong answer.

### How Git finds a short name

You type `main`, and Git needs a full name. It tries these places in order and takes the first that exists:

| Order | Git looks for | Example for the name `x` |
|---|---|---|
| 1 | A file directly in `.git` | `.git/x` (this is how `HEAD` is found) |
| 2 | `refs/x` | |
| 3 | `refs/tags/x` | A tag |
| 4 | `refs/heads/x` | A branch |
| 5 | `refs/remotes/x` | `origin/main` |
| 6 | `refs/remotes/x/HEAD` | `origin`, meaning the server's default branch |

This is why the stray `.git/scratch` from "When it goes wrong" got in the way: place 1 comes before the branch at place 4. It also means a tag wins over a branch with the same name, with the same "ambiguous" warning. Do not give a tag and a branch the same name.

To see what Git picked, ask for the full name:

```console
$ git rev-parse --symbolic-full-name v1.0 origin/main main
refs/tags/v1.0
refs/remotes/origin/main
refs/heads/main
```

### The reflog is a folder of files

The reflog you used to rescue commits is kept beside the refs, under `.git/logs`, with the same folder layout:

```console
$ find .git/logs -type f
.git/logs/HEAD
.git/logs/refs/heads/main
.git/logs/refs/remotes/origin/main
```

Each ref has one log file, and each move of the ref adds one line to the end:

```console
$ cat .git/logs/refs/heads/main
0000000000000000000000000000000000000000 f8d599dcff12900f8bb483f6ec983bfc67ec5e7c Practice Student <student@example.com> 1772442000 +0000	commit (initial): Add README
f8d599dcff12900f8bb483f6ec983bfc67ec5e7c ba3c27e57abce8618aa5ef0e5bc9eb0eede63a06 Practice Student <student@example.com> 1772528400 +0000	commit: Add menu
ba3c27e57abce8618aa5ef0e5bc9eb0eede63a06 4bc5afa7dd4664c2fb88427128a252161112989f Practice Student <student@example.com> 1772614800 +0000	commit: Add opening hours
```

A line reads: the ID before the move, the ID after it, who moved the ref and when, and what did it. Forty zeros mean "nothing": the ref did not exist yet. `git reflog show main` prints the same file, newest line first and with short IDs.

Three things follow:

- Tags have no log: they do not move, so there is nothing to record.
- The logs are yours alone. A push does not send them and a clone does not get them.
- `git update-ref -m "reason"` writes its reason at the end of such a line. A file written by hand gets no line, so there is nothing to go back to.

### Other files that work like HEAD

`.git` holds a few more one-line files that Git writes during certain commands. Each name works wherever a commit is expected:

| File | Holds | Written by |
|---|---|---|
| `ORIG_HEAD` | Where HEAD was before a command that moved it far | `git reset`, `git merge`, `git rebase` |
| `FETCH_HEAD` | What the last fetch downloaded | `git fetch`, `git pull` |
| `MERGE_HEAD` | The commit being merged in, while a merge is waiting | `git merge` |

One more symbolic ref exists besides HEAD. After `git clone`, the file `.git/refs/remotes/origin/HEAD` holds `ref: refs/remotes/origin/main`: your record of the server's default branch. It is why the bare name `origin` can stand for `origin/main` (place 6 in the table above).

## Advanced

You can now read any ref and write one. These topics are for writing scripts around refs, and for the storage format that is replacing the files.

### `git for-each-ref` with your own format

`--format` chooses what is printed for each ref. A field is written `%(name)`:

```console
$ git for-each-ref --format='%(refname:short) %(objecttype) %(objectname:short)'
main commit 4bc5afa
origin/main commit 4bc5afa
v0.9 commit ba3c27e
v1.0 tag 10cb1c0
```

| Field | Prints |
|---|---|
| `%(refname)`, `%(refname:short)` | The full name, the short name |
| `%(objectname)`, `%(objectname:short)` | The ID the ref holds |
| `%(objecttype)` | `commit` or `tag` |
| `%(*objectname)`, `%(*objecttype)` | The same for the object an annotated tag leads to. The star means "peel the tag first"; the field is empty for other refs |
| `%(subject)` | The first line of the commit or tag message |
| `%(committerdate:short)`, `%(creatordate:short)` | The commit's date; the date of the commit or of the tag object, whichever the ref holds |
| `%(upstream:short)` | The upstream of a local branch, like `origin/main` |

Options choose and order the refs:

| Option | Effect |
|---|---|
| `--sort=-committerdate` | Order by a field; `-` means newest or largest first |
| `--count=5` | Stop after five refs |
| `--points-at=<commit>` | Only refs on that commit |
| `--contains=<commit>` | Only refs whose history holds that commit |
| `--merged=<branch>`, `--no-merged=<branch>` | Only refs already merged, or not yet merged, into that branch |

Two lines that earn their place in a script. The newest tag:

```console
$ git for-each-ref --sort=-creatordate --count=1 --format='%(refname:short) %(creatordate:short)' refs/tags
v1.0 2026-03-05
```

Every tag with the commit it leads to, whatever kind of tag it is:

```console
$ git for-each-ref --format='%(refname:short) %(objecttype) %(*objectname:short)' refs/tags
v0.9 commit 
v1.0 tag 4bc5afa
```

`git branch --format` and `git tag --format` accept the same fields.

### Does this ref exist?

A script should not test for a file under `.git/refs`: the ref may be packed. `git show-ref --verify` takes a full name and answers through its exit code:

```console
$ git show-ref --verify refs/heads/main
4bc5afa7dd4664c2fb88427128a252161112989f refs/heads/main
$ git show-ref --verify refs/heads/nosuch
fatal: 'refs/heads/nosuch' - not a valid ref
```

With `--quiet` it prints nothing and only succeeds or fails, which is what an `if` in a script needs.

### Several refs in one step

`git update-ref --stdin` reads a list of changes and applies all of them or none:

```console
$ printf 'create refs/heads/one f8d599d\ncreate refs/heads/two ba3c27e\n' | git update-ref --stdin
$ git branch
* main
  one
  two
```

If one line cannot be done, Git changes nothing at all. Here the third line names a ref that does not exist, and both real branches survive:

```console
$ printf 'delete refs/heads/one\ndelete refs/heads/two\ndelete refs/heads/nosuch f8d599d\n' | git update-ref --stdin
fatal: cannot lock ref 'refs/heads/nosuch': unable to resolve reference 'refs/heads/nosuch'
$ git branch
* main
  one
  two
```

A group of changes that succeeds or fails as one is called a transaction. Servers use it so a push that updates several branches never ends half done.

### `update-ref` and HEAD

`git update-ref HEAD <commit>` follows the symbolic ref: it moves the branch you are on, and HEAD still names that branch. Add `--no-deref` and Git writes the ID into HEAD itself, which detaches it. Neither form touches the staging area or your files, so `git status` will show differences afterwards. `git reset` and `git switch --detach` are the everyday tools for both jobs.

### Reftable: refs without the files

Files have limits. Windows and macOS usually treat `Fix` and `fix` as the same file name, so two branches that differ only in letter case collide there. And reading or updating a hundred thousand refs, as small files or as lines of one long text file, is slow.

Git 2.45 added a second way to store refs, called [reftable](term:reftable): refs and their logs go into a few compact binary files under `.git/reftable`, with no file per ref and no `packed-refs`. The way refs are stored is called the ref storage **backend**; the classic one is named `files`.

```console
$ git rev-parse --show-ref-format
files
$ git init -q --ref-format=reftable ../bakery-reftable
$ git -C ../bakery-reftable rev-parse --show-ref-format
reftable
```

In a reftable repository, `cat .git/HEAD` prints a placeholder (`ref: refs/heads/.invalid`) and `.git/refs/heads` is a one-line file saying `this repository uses the reftable format`. Every command of this lesson still works there: `git for-each-ref`, `git update-ref`, `git symbolic-ref`, `git rev-parse`. Only `cat` and `find` stop working.

`git refs migrate --ref-format=reftable` converts an existing repository. The Git project plans to make reftable the default for new repositories in Git 3.0. If you always ask Git and never the files, the change costs you nothing.

## Recap

- A ref is a name that holds one ID. Branches are in `refs/heads/`, tags in `refs/tags/`, your record of a server's branches in `refs/remotes/<remote>/`. `git for-each-ref` lists them all.
- `git update-ref refs/heads/<name> <commit>` creates or moves a ref and `-d` deletes one. Always give the full name, and never write the file by hand.
- HEAD is a symbolic ref: it names your branch (`git symbolic-ref HEAD`). Detached, it holds a commit ID.
- A lightweight tag's ref holds the commit. An annotated tag's ref holds a tag object, and that object names the commit; `v1.0^{commit}` gets you the commit.
- Refs may be lines in `.git/packed-refs`, or in a reftable, and not files. Ask Git (`git rev-parse`, `git for-each-ref`); do not read the folder.
