---
id: git-cat-file
command: git cat-file
group: Look inside
summary: Shows the type, size or content of an object in Git's storage.
usage: ["git cat-file -t <object>", "git cat-file -p <object>", "git cat-file -s <object>"]
bookSection: "10.2 Git Objects"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
lessons: [first-look-inside]
---

`git cat-file` reads one [object](term:object) from `.git/objects` and tells you about it. It is a [plumbing](term:plumbing) command: you rarely need it for daily work, but it is the best way to see what a commit really holds.

```console
$ git cat-file -t 63d16f1
commit
$ git cat-file -p 63d16f1
tree a632f02593d961ac7c254d1ae6f1efb7cfa7fd8f
parent 00589552f1514bf46cace49190398bad718f941a
author Practice Student <student@example.com> 1795715445 +0300
committer Practice Student <student@example.com> 1795715445 +0300

Add toast recipe
```

| Option | Prints |
|---|---|
| `-t` | The object's type: `commit`, `tree`, `blob` or `tag` |
| `-p` | The content in a readable form: a commit's fields, a tree's listing, a blob's text |
| `-s` | The size in bytes, before compression |

Where it asks for an object, you can give:

- An ID, short or full: `63d16f1`. At least four characters.
- A name: `HEAD`, `main`.
- A file as a commit stored it: `HEAD:recipes/pasta.txt`.

To follow a commit down to a file, print the commit, then the tree it names, then the blob the tree names.

A file name alone is not an object. `git cat-file -p README.md` fails with "Not a valid object name"; write `HEAD:README.md`.
