---
id: git-add
command: git add
group: Daily loop
summary: Puts a photo of a file, as it is now, into the staging area for the next commit.
usage: ["git add <file>", "git add .", "git add -A", "git add -p"]
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#_tracking_files
lessons: [three-areas]
---

`git add` picks what goes into the next commit. It copies the file **as it is at that moment** into the staging area, and starts tracking a new file.

```console
$ git add notes.txt
$ git status -s
A  notes.txt
```

If you edit the file again after `git add`, the new edit is not staged: run `git add` again to take a new photo.

| You type | Git stages |
|---|---|
| `git add notes.txt` | One file |
| `git add docs/` | Every change inside the folder |
| `git add .` | Every change in this folder and below |
| `git add -A` | Every change in the whole project, deletions included |
| `git add -p` | Chosen parts of a file, one change at a time |

:::careful
`git add .` also stages files you did not mean to save, like logs or passwords. Check `git status` first, or keep them out with a `.gitignore`.
:::
