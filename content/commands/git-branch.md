---
id: git-branch
command: git branch
group: Branching
summary: Lists your branches, creates a new one on the commit you are on, and deletes or renames them.
usage: ["git branch", "git branch -v", "git branch <name>", "git branch <name> <commit>", "git branch --merged main", "git branch -d <name>", "git branch -m <old> <new>", "git branch -vv"]
bookSection: "3.1 Branches in a Nutshell"
bookUrl: https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell
lessons: [branches-are-pointers, branch-management, remote-branches]
---

`git branch` works with branches as labels: it shows them, creates them, deletes them and renames them. It never moves you to another branch and never changes your files.

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

## Find finished branches

| You type | What you get |
|---|---|
| `git branch --merged main` | Branches whose work is already in `main`: safe to delete. Without a name, it compares against the branch you are on |
| `git branch --no-merged main` | Branches that still hold commits `main` lacks |
| `git branch --contains <commit>` | Branches whose history holds that commit |
| `git branch --sort=-committerdate` | Branches with the most recently used first |

## Delete and rename

```console
$ git branch -d fix-footer
Deleted branch fix-footer (was c4e3d21).
```

| You type | What happens |
|---|---|
| `git branch -d <name>` | Deletes a merged branch. Refuses with "not fully merged" when the branch holds work nothing else has |
| `git branch -D <name>` | Deletes the branch whatever it holds |
| `git branch -m <new>` | Renames the branch you are on |
| `git branch -m <old> <new>` | Renames another branch, for example `git branch -m master main` |

You cannot delete the branch you are on: switch away first.

:::careful
`git branch -D` removes the only name for commits that were never merged. Git keeps them for about a month. To bring the branch back, run `git branch <name> <id>` with the ID from the "Deleted branch … (was …)" line or from `git reflog`.
:::

## Branches and the remote

| You type | What you get |
|---|---|
| `git branch -vv` | Each branch with the branch it follows and the distance, like `[origin/main: ahead 1, behind 1]`. `gone` means the branch was deleted on the server |
| `git branch -u origin/main` | Makes the current branch follow `origin/main` (long form `--set-upstream-to`) |
| `git branch --unset-upstream` | Stops following |
| `git branch -r` | The remote-tracking branches, like `origin/main` |
| `git branch -a` | Local and remote-tracking branches together |

The distances are as fresh as your last `git fetch`.
