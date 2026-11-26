---
id: git-ls-tree
command: git ls-tree
group: Look inside
summary: Lists what a tree holds, the files and folders of a commit, with their modes and object IDs.
usage: ["git ls-tree <commit>", "git ls-tree -r <commit>", "git ls-tree -r -l <commit>", "git ls-tree -r --name-only <commit>"]
bookSection: "10.2 Git Objects"
bookUrl: https://git-scm.com/docs/git-ls-tree
lessons: [first-look-inside, objects-deep]
---

`git ls-tree` prints the listing of a [tree](term:tree): one line per file or folder. Give it a commit, a branch or a tag and it finds the tree for you, so you do not have to look up the tree's ID first. It is a [plumbing](term:plumbing) command that only reads.

```console
$ git ls-tree main
040000 tree 494173472c396acaf0567cc7d840ba10b0767785	backup
100644 blob 56ad46284317211d9b5052aac3a2a6797982e433	diary.txt
100644 blob 3f1552cda9e2eeff23ca832cd40b12478f41a13a	todo.txt
```

Each line has the mode (`100644` a normal file, `100755` an executable file, `120000` a symbolic link, `040000` a folder), the type of the object, its ID and the name. A folder shows as one `tree` line; its files are inside that tree.

| Option | What it does |
|---|---|
| `-r` | Walks into every subfolder and lists only the files, with their full paths |
| `-l` | Adds each blob's size in bytes |
| `--name-only` | Prints only the paths |
| `-d` | Lists only the folders (trees) |
| `--abbrev=7` | Shortens the IDs to 7 characters |

```console
$ git ls-tree -r -l main
100644 blob 6227890909254744be2da993385ae0c6d9df6204       8	backup/diary.txt
100644 blob 56ad46284317211d9b5052aac3a2a6797982e433       8	diary.txt
100644 blob 3f1552cda9e2eeff23ca832cd40b12478f41a13a      14	todo.txt
```

Add a path to list only that entry, and end a folder's name with `/` to list what is inside it:

```console
$ git ls-tree main backup/
100644 blob 6227890909254744be2da993385ae0c6d9df6204	backup/diary.txt
```

`git ls-tree main` shows the same lines as `git cat-file -p 'main^{tree}'`.

A blob is not a tree. `git ls-tree` with a blob's ID fails with "fatal: not a tree object"; print a blob with `git cat-file -p`.
