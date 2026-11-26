---
id: git-write-tree
command: git write-tree
group: Look inside
summary: Writes the staging area out as a tree object and prints the tree's ID.
usage: ["git write-tree", "git write-tree --prefix=<folder>/"]
bookSection: "10.2 Git Objects"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
lessons: [objects-deep]
---

`git write-tree` takes what is in the [staging area](term:staging-area) right now, stores it as a [tree](term:tree) object (one tree per folder), and prints the ID of the top tree. It is a [plumbing](term:plumbing) command: `git commit` runs this step for you before it makes the commit.

```console
$ git update-index --add --cacheinfo 100644,6227890909254744be2da993385ae0c6d9df6204,diary.txt
$ git write-tree
494173472c396acaf0567cc7d840ba10b0767785
$ git cat-file -p 4941734
100644 blob 6227890909254744be2da993385ae0c6d9df6204	diary.txt
```

The first line stages a blob under the name `diary.txt`. `git write-tree` then turns the staging area into a tree with that one entry.

- It needs no `-w`: the tree is always stored, unless the same tree already exists.
- It reads the staging area only. Files in your folder that are not staged are not in the tree.
- It makes no commit and moves no branch. Pass the ID it prints to `git commit-tree`.
- The same staging area always gives the same tree ID, on every computer.

| Option | What it does |
|---|---|
| `--prefix=<folder>/` | Writes the tree of that one folder of the staging area, and prints its ID |

If the staging area lists an object that is not in the object database, the command stops:

```console
$ git write-tree
error: invalid object 100644 e8dbf7065da8490eaf6c06f85bd346d43dd125b5 for 'x.txt'
fatal: git-write-tree: error building trees
```

Store the content first, with `git hash-object -w`, and stage the ID that command prints.
