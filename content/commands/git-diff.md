---
id: git-diff
command: git diff
group: History
summary: Shows the exact lines that differ between two versions of your files.
usage: ["git diff", "git diff --staged", "git diff HEAD", "git diff <older> <newer>", "git diff --stat"]
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/docs/git-diff
lessons: [diffs-in-depth]
---

`git diff` prints what changed, line by line. Lines starting with `-` are from the old version, lines starting with `+` from the new one, and lines starting with a space did not change. It only looks; it never changes a file.

```console
$ git diff shopping.txt
diff --git a/shopping.txt b/shopping.txt
index 01ec3d2..d23d876 100644
--- a/shopping.txt
+++ b/shopping.txt
@@ -1,3 +1,4 @@
 milk
-eggs
+6 eggs
 bread
+butter
```

`@@ -1,3 +1,4 @@` opens each block of changes: in the old version it starts at line 1 and covers 3 lines, in the new version it starts at line 1 and covers 4.

Which two versions are compared depends on what you type:

| You type | Git compares |
|---|---|
| `git diff` | Working tree against the staging area: what you have not staged yet |
| `git diff --staged` | Staging area against the last commit: what the next commit will contain (`--cached` is the same) |
| `git diff HEAD` | Working tree against the last commit: everything you changed, staged or not |
| `git diff <older> <newer>` | Two commits, for example `git diff HEAD~1 HEAD` |
| `git diff ... -- <file>` | The same comparison for one file or folder only |

Options that work with every comparison:

| Option | What it does |
|---|---|
| `--stat` | One row per file with the number of changed lines |
| `--name-only`, `--name-status` | File names only; with a letter for added (`A`), modified (`M`), deleted (`D`) |
| `--word-diff` | Marks changed words instead of whole lines |
| `-w` | Ignores changes in spaces and tabs |
| `--check` | Lists added lines that end in stray spaces |

:::careful
An empty `git diff` after `git add` is normal: your change is staged, so look with `git diff --staged`. Untracked files never show in `git diff` at all.
:::
