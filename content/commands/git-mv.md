---
id: git-mv
command: git mv
group: Daily loop
summary: Renames or moves a tracked file and stages the change in one step.
usage: ["git mv <old> <new>", "git mv <file> <folder>/"]
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#_git_mv
lessons: [remove-move-files]
---

`git mv` gives a tracked file a new name or a new folder, and stages that change for your next commit.

```console
$ git mv list.txt shopping.txt
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	renamed:    list.txt -> shopping.txt
```

It is a shortcut for three steps:

```console
$ mv list.txt shopping.txt
$ git rm list.txt
$ git add shopping.txt
```

Git stores no rename information. It records the old name as gone and the new name as added, and detects the rename afterwards by comparing content. So renaming in your editor and staging both names gives the same commit.

| You type | What happens |
|---|---|
| `git mv menu.txt notes/` | Moves the file into the folder `notes` |
| `git mv README.md readme.md` | Changes only upper and lower case, which a file explorer on Windows or macOS may not manage |
| `git mv -n old new` | Dry run: prints what would happen |
| `git mv -f old new` | Moves even if `new` exists, replacing it |

:::careful
A rename plus a big rewrite in one commit can look like a deleted file and a new file. Rename in one commit, edit in the next.
:::
