---
id: git-commit-tree
command: git commit-tree
group: Look inside
summary: Makes a commit object from a tree, a message and parent commits, and prints its ID.
usage: ["echo '<message>' | git commit-tree <tree>", "git commit-tree <tree> -p <parent> -m \"<message>\"", "git commit-tree <tree> -p <parent> -F <file>"]
bookSection: "10.2 Git Objects"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
lessons: [objects-deep]
---

`git commit-tree` makes one commit object: it points at the [tree](term:tree) you give it, names the parents you give it, and records you as author with the time. It prints the new commit's ID and does nothing else. It is a [plumbing](term:plumbing) command: `git commit` runs this step for you, and then moves your branch.

```console
$ echo 'First entry' | git commit-tree 4941734
3bafa0b5769fb63eaeeb238d0954123beafdcccb
$ echo 'Second entry' | git commit-tree 1934dbb -p 3bafa0b
8793ba66cf17000acad3371422742d134f62c2e9
$ git cat-file -p 8793ba6
tree 1934dbb4295a7059b823c6144d170d8a188ea127
parent 3bafa0b5769fb63eaeeb238d0954123beafdcccb
author Practice Student <student@example.com> 1795731108 +0300
committer Practice Student <student@example.com> 1795731108 +0300

Second entry
```

The first commit has no parent. The second names the first with `-p`. Your IDs will differ: a commit holds your name and the time, so its ID is yours alone.

| Option | What it does |
|---|---|
| `-p <commit>` | Names a parent commit. Leave it out for a first commit; give it twice for a merge commit |
| `-m "<text>"` | Uses the text as the message, so nothing is read from standard input |
| `-F <file>` | Reads the message from a file |

With no `-m` and no `-F`, the message comes from standard input. Typed in a terminal with no `echo` in front, the command waits: type the message, press Enter, then Ctrl+D.

:::careful
No branch points at the new commit. `git log` does not show it, and Git may delete it later as unused. Point a branch at it right away: `git update-ref refs/heads/<branch> <commit>`, or `git branch <branch> <commit>` for a new branch.
:::

The tree must be a tree. A blob's ID fails with "is not a valid 'tree' object"; pass the ID that `git write-tree` printed, or `<commit>^{tree}` to reuse the tree of another commit.
