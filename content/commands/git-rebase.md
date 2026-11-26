---
id: git-rebase
command: git rebase
group: Branching
summary: Replays the commits of the branch you are on onto another commit, as new commits with new IDs.
usage: ["git rebase <base>", "git rebase --continue", "git rebase --abort", "git rebase --onto <new-base> <old-base> <branch>", "git rebase -i <base>"]
bookSection: "3.6 Git Branching - Rebasing"
bookUrl: https://git-scm.com/book/en/v2/Git-Branching-Rebasing
lessons: [rebasing]
---

`git rebase <base>` takes the commits of the branch you are on that `<base>` lacks, and makes them again on top of `<base>`. The copies have new IDs. The old commits are left behind, and `<base>` itself does not move. So switch to the branch you want to rewrite first.

```console
$ git switch try-hours
$ git rebase main
Successfully rebased and updated refs/heads/try-hours.
```

Afterwards the branch is a straight line on top of `main`, and `git merge try-hours` on `main` is a fast-forward.

When a rebase stops on a conflict, Git names the commit it could not replay (`error: could not apply cca4fc4... Stay open until 8`) and waits:

1. `git status` lists the files under "Unmerged paths".
2. Edit each file to its final text and remove the `<<<<<<<`, `=======` and `>>>>>>>` lines. The top part is the base's version; the bottom part is your commit's.
3. `git add <file>` marks it resolved.
4. `git rebase --continue` commits it and replays the commits that are left. Do not run `git commit` yourself.

| Option | What it does |
|---|---|
| `--continue` | Goes on after you resolved a conflict and staged the files |
| `--skip` | Drops the commit Git stopped at and goes on with the next. Only for a commit that is no longer needed |
| `--abort` | Stops the rebase and puts the branch and your files back as they were before it |
| `--onto <new-base> <old-base> [<branch>]` | Replays only the commits of `<branch>` that are not on `<old-base>`, on top of `<new-base>`. Moves a branch that was started from another branch |
| `<base> <branch>` | Switches to `<branch>` first, then rebases it onto `<base>` |
| `--autostash` | Puts uncommitted edits aside before the rebase and brings them back after it |
| `--rebase-merges` | Makes merge commits again and keeps the shape of the branch. By default a rebase leaves them out and makes one straight line |
| `-i`, `--interactive` | Opens the list of commits in your editor before replaying, so you can reorder them, join them, change a message or drop one |
| `--autosquash` | With `-i`: moves commits made with `git commit --fixup` next to the commit they fix and marks them to be joined |

To undo a rebase that just finished: `git reset --hard ORIG_HEAD`. It also throws away uncommitted edits, so check `git status` first.

:::careful
A rebase replaces commits. Do not rebase commits that exist outside your repository and that people may have based work on: your teammates would keep the old commits while you hold the copies, and the same changes end up in the history twice. Rebase work you have not pushed; merge everything else.
:::

:::compare
today: "`git rebase main` prints `Successfully rebased and updated refs/heads/<branch>.`"
book: "Pro Git shows the older output: `First, rewinding head to replay your work on top of it...` and one `Applying:` line per commit. The result is the same."
:::
