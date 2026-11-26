---
id: git-switch
command: git switch
group: Branching
summary: Moves you to another branch and makes your files match it; can create the branch first.
usage: ["git switch <branch>", "git switch -c <new-branch>", "git switch -", "git switch --detach <commit>"]
bookSection: "3.1 Branches in a Nutshell"
bookUrl: https://git-scm.com/docs/git-switch
lessons: [switch-and-detached-head]
---

`git switch` makes another branch the one you are on. HEAD moves to that branch, and your working tree and staging area change to match its newest commit.

```console
$ git switch ideas
Switched to branch 'ideas'
```

| You type | What happens |
|---|---|
| `git switch ideas` | Moves to the branch `ideas` |
| `git switch -c ideas` | Creates `ideas` on the current commit and moves to it |
| `git switch -c hotfix <commit>` | Creates `hotfix` on that commit, branch or tag, and moves to it |
| `git switch -` | Goes back to the branch you were on before |
| `git switch --detach <commit>` | Goes to a commit with no branch (a detached HEAD), to look at an old version |

Uncommitted changes travel with you when they do not get in the way. When the switch would overwrite a file you changed, Git refuses and changes nothing:

```console
$ git switch main
error: Your local changes to the following files would be overwritten by checkout:
	ideas.txt
Please commit your changes or stash them before you switch branches.
Aborting
```

Commit the change, discard it with `git restore`, or shelve it with `git stash`, then switch.

:::careful
Commits made after `git switch --detach` are on no branch. Before you leave, run `git switch -c <name>` to keep them. `git switch --discard-changes <branch>` throws away uncommitted edits and cannot be undone.
:::

:::compare
today: "`git switch ideas` and `git switch -c ideas` (Git 2.23 and later)."
book: "`git checkout ideas` and `git checkout -b ideas` do the same and still work."
:::
