---
id: git-checkout
command: git checkout
group: Branching
summary: The older command that switches branches and also restores files; today git switch and git restore share its jobs.
usage: ["git checkout <branch>", "git checkout -b <new-branch>", "git checkout <commit>", "git checkout -- <file>"]
bookSection: "3.1 Branches in a Nutshell"
bookUrl: https://git-scm.com/docs/git-checkout
lessons: [switch-and-detached-head]
---

`git checkout` is the older, do-everything command: it changes branch, goes to a commit, and brings files back. It still works, and Pro Git and most answers online use it. Since Git 2.23 each job has a clearer command.

| Job | Older | Today |
|---|---|---|
| Move to a branch | `git checkout ideas` | `git switch ideas` |
| Create a branch and move to it | `git checkout -b ideas` | `git switch -c ideas` |
| Look at an old commit | `git checkout d18f96a` | `git switch --detach d18f96a` |
| Discard edits to a file | `git checkout -- app.js` | `git restore app.js` |
| Take a file from another branch | `git checkout ideas -- ideas.txt` | `git restore --source=ideas ideas.txt` |

Going to a commit prints a long note, because HEAD is now detached:

```console
$ git checkout d18f96a
Note: switching to 'd18f96a'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.
...
HEAD is now at d18f96a Add app
```

Nothing is broken. Go back with `git switch -`, or keep commits you make there with `git switch -c <name>`.

:::careful
`git checkout -- <file>` and `git checkout .` throw away uncommitted edits, with no undo. The same word, `checkout`, also moves between branches, so read the command twice before you press Enter. That risk is why the command was split in two.
:::
