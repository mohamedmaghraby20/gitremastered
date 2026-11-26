---
id: git-hash-object
command: git hash-object
group: Look inside
summary: Computes the ID that some content gets as an object, and can store it in Git's storage.
usage: ["git hash-object <file>", "git hash-object -w <file>", "echo '<text>' | git hash-object --stdin", "git hash-object -w --stdin"]
bookSection: "10.2 Git Objects"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
lessons: [objects-deep]
---

`git hash-object` takes some content and prints the ID it gets as a [blob](term:blob). On its own it only computes; with `-w` it also stores the content in `.git/objects`. It is a [plumbing](term:plumbing) command: `git add` runs the same step for you.

```console
$ echo 'day one' > diary.txt
$ git hash-object diary.txt
6227890909254744be2da993385ae0c6d9df6204
$ git hash-object -w diary.txt
6227890909254744be2da993385ae0c6d9df6204
$ git cat-file -p 6227890
day one
```

The first call prints the ID and stores nothing. The second prints the same ID and writes the object, so `git cat-file` can read it back.

| Option | What it does |
|---|---|
| `-w` | Writes the object into the object database, as well as printing its ID |
| `--stdin` | Reads the content from standard input, not from a file, as in `echo 'day one'` piped into `git hash-object --stdin` |
| `-t <type>` | Makes an object of another type (`commit`, `tree`, `tag`). Git checks the format and refuses a malformed one. The default is `blob` |

Give it several files and it prints one ID per line, in the same order.

The ID depends only on the content: the same text gives the same ID on every computer, and one changed character gives a completely different one. The file's name plays no part, because a blob does not hold a name.

```console
$ echo 'day one' | git hash-object --stdin
6227890909254744be2da993385ae0c6d9df6204
$ echo 'day two' | git hash-object --stdin
56ad46284317211d9b5052aac3a2a6797982e433
```

Storing a blob does not stage the file. The staging area changes only with `git add` or `git update-index`.
