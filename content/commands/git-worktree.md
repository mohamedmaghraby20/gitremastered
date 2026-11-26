---
id: git-worktree
command: git worktree
group: Branching
summary: Gives a branch its own folder beside your project, so several branches are checked out at once on one repository.
usage: ["git worktree add <folder> -b <new-branch>", "git worktree add <folder> <branch>", "git worktree list", "git worktree remove <folder>", "git worktree prune"]
bookSection: "git-worktree (Git reference, beyond the book)"
bookUrl: https://git-scm.com/docs/git-worktree
lessons: [worktrees]
---

`git worktree add` makes a second folder with another branch in it. Both folders use the same repository: commits, branches, the stash and settings are shared, while each folder has its own files, its own HEAD and its own staging area. Use it for an urgent fix while your unfinished work stays in the first folder.

```console
$ git worktree add ../try-fix -b try-fix
Preparing worktree (new branch 'try-fix')
HEAD is now at 9976ad1 Add contact page
$ git worktree list
C:/practice/project 9976ad1 [main]
C:/practice/try-fix 9976ad1 [try-fix]
```

When the work is merged, remove the folder first and the branch second: `git worktree remove ../try-fix`, then `git branch -d try-fix`.

| You type | What happens |
|---|---|
| `git worktree add ../hotfix -b hotfix` | Makes the folder and a new branch `hotfix`, starting at the commit you are on |
| `git worktree add ../hotfix -b hotfix main` | The same, with the new branch starting at `main` |
| `git worktree add ../docs docs` | Makes the folder and checks out the existing branch `docs` there |
| `git worktree add --detach ../review <commit>` | Makes a folder on a commit, with no branch (detached HEAD): for a review or a long build |
| `git worktree list` | Lists every worktree: folder, commit and branch. `-v` adds lock reasons; `--porcelain` is for scripts |
| `git worktree remove ../hotfix` | Deletes the folder and Git's record of it. The branch and its commits stay |
| `git worktree prune` | Deletes the records of worktrees whose folder was deleted by hand. `-n -v` only shows them |
| `git worktree lock ../hotfix --reason "<why>"` | Protects a worktree from `remove`, `move` and `prune` |
| `git worktree unlock ../hotfix` | Takes the lock off |
| `git worktree move ../hotfix ../urgent` | Moves a linked worktree and updates Git's record |
| `git worktree repair` | Writes the paths again after a folder was moved by hand |

A branch can be checked out in only one worktree. `git switch`, `git worktree add` and `git branch -d` refuse a branch that another worktree uses:

```console
$ git switch try-fix
fatal: 'try-fix' is already used by worktree at 'C:/practice/try-fix'
```

:::careful
`git worktree remove` refuses a folder that holds modified or untracked files. `--force` removes it anyway, and those files are lost for good: look first with `git -C <folder> status`. `git worktree remove -f -f` also overrides a lock.
:::
