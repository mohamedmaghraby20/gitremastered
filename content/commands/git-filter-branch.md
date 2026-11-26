---
id: git-filter-branch
command: git filter-branch
group: Undo
summary: Rewrites many commits at once by running a command on each one, for example to remove a file from all of history.
usage: ["git filter-branch --index-filter '<command>' -- --all", "git filter-branch --index-filter '<command>' --tag-name-filter cat -- --all", "git filter-branch --tree-filter '<command>' HEAD"]
bookSection: "7.6 Rewriting History"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History
lessons: [remove-sensitive-data]
---

`git filter-branch` goes through your commits from the oldest to the newest, runs a command of yours on each one, and commits the result as a new commit. Its usual job is to take a leaked password file or a huge file out of every commit.

```console
$ FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --index-filter 'git rm --cached --ignore-unmatch secrets.env' -- --all
Rewrite 2ff1636a5620ef2e1ef04e9074c501e68855b8c0 (2/4) (1 seconds passed, remaining 1 predicted)    rm 'secrets.env'
Rewrite debaf8a7655411add856d6291e050c669977e61e (2/4) (1 seconds passed, remaining 1 predicted)    rm 'secrets.env'
Rewrite 470887c927595203ba1b1b6112088e5dc33cb72b (2/4) (1 seconds passed, remaining 1 predicted)    rm 'secrets.env'

Ref 'refs/heads/main' was rewritten
```

The commit that had the file and every commit after it get a new ID. Older commits stay as they are.

| Piece | What it does |
|---|---|
| `--index-filter '<command>'` | Runs the command on each commit's staging area, without writing files to disk. Fast. Use `git rm --cached --ignore-unmatch <file>` to remove a file |
| `--tree-filter '<command>'` | Writes each commit's files to disk, runs the command (like `rm -f <file>`), and commits what is left. Same result, much slower |
| `-- --all` | Rewrites every branch, not only the one you are on |
| `--tag-name-filter cat` | Moves each tag to the rewritten commit and keeps its name. Without it, tags stay on the old commits |
| `--prune-empty` | Drops commits that change nothing after the filter ran |
| `-f` | Runs again when backups from an earlier run are still in `refs/original/` |
| `FILTER_BRANCH_SQUELCH_WARNING=1` in front | Skips the warning and its ten-second wait |

The old commits are not gone after the run. filter-branch keeps a backup of each ref under `refs/original/`, and the reflog remembers them too. To delete them for good:

```console
$ git update-ref -d refs/original/refs/heads/main
$ git reflog expire --expire=now --all
$ git gc --prune=now
```

Before that clean-up, `git reset --hard refs/original/refs/heads/main` undoes the rewrite.

:::careful
filter-branch replaces commits on every branch you name, removes the filtered file from your working tree, and after the clean-up there is no way back. Copy the file elsewhere if you still need it, and check the new history before you clean up. If the old commits were pushed, you must force-push every branch and tag, and every teammate must clone again. A leaked secret stays leaked: rotate or revoke it first.
:::

:::compare
today: "`git filter-repo --invert-paths --path secrets.env` does the same job faster, covers branches and tags, and cleans up itself. It is a separate tool (`pip install git-filter-repo`), and the one Pro Git, Git's manual and GitHub recommend."
book: "`git filter-branch --tree-filter 'rm -f passwords.txt' HEAD` is Pro Git's example. The book now warns that filter-branch has many pitfalls."
:::
