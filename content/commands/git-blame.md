---
id: git-blame
command: git blame
group: History
summary: Shows, for each line of a file, the commit and author that last changed it.
usage: ["git blame <file>", "git blame -L <first>,<last> <file>", "git blame -w <file>", "git blame --ignore-rev <commit> <file>", "git blame -C <file>", "git blame <commit> -- <file>"]
bookSection: "7.10 Debugging with Git"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Debugging-with-Git#_file_annotation
lessons: [search-blame-bisect]
---

`git blame <file>` prints the file with, in front of every line, the last commit that changed it. Pro Git calls this file annotation. It only reads. Use `-L` to keep the output to the lines you care about.

```console
$ git blame -L 3,4 pricing.sh
a8573272 (Omar Haddad 2026-10-22 10:20:00 +0000 3) SHIPPING_FEE=499
b2e4db46 (Maya Chen   2026-11-12 11:40:00 +0000 4) FREE_SHIPPING_FROM=4000
```

From left to right: the start of the commit ID, the author, the date, the line number, and the line. A `^` in front of the ID marks a line that has not changed since the first commit of the project. To see why a line changed, give the ID to `git show`.

| Option | What it does |
|---|---|
| `-L 14,20` | Only lines 14 to 20. `-L 14,+3` is three lines from 14; `-L :name` is the function with that name |
| `-w` | Ignores changes that are only spaces or tabs, so a reindent does not hide the real last change |
| `--ignore-rev <commit>` | Looks past one named commit, for example a run of a code formatter |
| `--ignore-revs-file <file>` | Looks past every commit listed in the file, one full ID per line. `git config --local blame.ignoreRevsFile <file>` makes it the default |
| `-M` | Finds lines that were moved inside the same file |
| `-C` | Finds lines that were moved or copied from other files changed in the same commit, and adds a column with the file they came from. Give it twice or three times to search further |
| `<commit> -- <file>` | Blames the file as it was in that commit, not as it is in HEAD |
| `-s` | Hides the author and the date |
| `-e` | Shows the author's email in place of the name |

:::careful
Blame shows who touched a line last, not who wrote the idea or who made the mistake. A formatting commit can be the "last change" of a whole file. Check with `-w` before you ask the person it names.
:::
