---
id: git-init
command: git init
group: Start a project
summary: Turns a folder into a new, empty repository.
usage: ["git init", "git init -b main", "git init <folder>"]
bookSection: "2.1 Getting a Git Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository#_initializing_a_repository_in_an_existing_directory
lessons: [start-a-repo]
---

`git init` creates the hidden `.git` folder in the folder you are in. That makes the folder a [repository](term:repository). It does not touch your files, and it tracks none of them yet.

```console
$ git init -b main
Initialized empty Git repository in C:/Users/you/recipes/.git/
$ git status
On branch main

No commits yet
```

The history starts with your first commit: `git add` the files, then `git commit`.

| You type | What happens |
|---|---|
| `git init` | A repository in the current folder; the first branch gets Git's default name |
| `git init -b main` | The same, with the first branch named `main` |
| `git init recipes` | Creates the folder `recipes` and a repository inside it |
| `git init` in an existing repository | Nothing is lost: Git prints "Reinitialized existing Git repository" |

To get `main` every time without `-b`, set it once: `git config --global init.defaultBranch main`. After a plain `git init`, `git branch -m main` renames the first branch.

:::careful
Run `git status` before `git init`. If it does not say "not a git repository", you are already inside one, and a second `git init` in a subfolder creates a repository inside a repository. To undo that mistake, delete the inner `.git` folder.
:::
