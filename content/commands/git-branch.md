---
id: git-branch
command: git branch
group: Branching
summary: Lists your branches, or creates a new one on the commit you are on.
usage: ["git branch", "git branch -v", "git branch <name>", "git branch <name> <commit>"]
bookSection: "3.1 Branches in a Nutshell"
bookUrl: https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell
lessons: [branches-are-pointers]
---

`git branch` works with branches as labels: it shows them and creates them. It never moves you to another branch and never changes your files.

## List branches

```console
$ git branch -v
* main    42eb0a5 Add packing list
  testing 3140f40 Add about page
```

The `*` marks the branch you are on.

| You type | What you get |
|---|---|
| `git branch` | The branch names |
| `git branch -v` | Each branch with the short ID and message of the commit it points at |
| `git branch --show-current` | Only the name of the branch you are on |

## Create a branch

| You type | What happens |
|---|---|
| `git branch testing` | A new branch `testing` on the commit you are on |
| `git branch first-draft 4d8ac76` | A new branch on that commit (an ID, a branch name, or a shortcut like `HEAD~2`) |

A branch is a pointer to one commit, so creating it copies nothing and takes no time.

:::careful
`git branch <name>` creates the branch and leaves you on the branch you were on. Your next commit still goes there. Check with `git branch` before you commit.
:::

Names cannot contain spaces. Use short lowercase words joined by `-`, like `fix-login-error`.
