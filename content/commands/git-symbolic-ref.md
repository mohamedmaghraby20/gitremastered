---
id: git-symbolic-ref
command: git symbolic-ref
group: Look inside
summary: Reads or sets a ref that names another ref, above all HEAD, which names the branch you are on.
usage: ["git symbolic-ref HEAD", "git symbolic-ref --short HEAD", "git symbolic-ref -q HEAD", "git symbolic-ref HEAD refs/heads/<branch>"]
bookSection: "10.3 Git References"
bookUrl: https://git-scm.com/docs/git-symbolic-ref
lessons: [refs-deep]
---

`git symbolic-ref HEAD` prints the branch that [HEAD](term:head) names. HEAD is a symbolic ref: the file `.git/HEAD` holds the name of a [ref](term:ref), not a commit ID.

```console
$ cat .git/HEAD
ref: refs/heads/main
$ git symbolic-ref HEAD
refs/heads/main
$ git symbolic-ref --short HEAD
main
```

| Form | What it does |
|---|---|
| `git symbolic-ref HEAD` | Prints the full name of the ref HEAD names |
| `git symbolic-ref --short HEAD` | Prints the short name, like `main`. Scripts use it to ask "which branch am I on?" |
| `git symbolic-ref -q HEAD` | Prints no error when HEAD is detached; the exit code alone says so |
| `git symbolic-ref HEAD refs/heads/<branch>` | Rewrites HEAD to name that branch |

With a second argument it writes HEAD, and that is all it does:

```console
$ git symbolic-ref HEAD refs/heads/scratch
$ cat .git/HEAD
ref: refs/heads/scratch
```

People use the writing form for two jobs: to repair a HEAD that names a branch which does not exist (`git status` then says "No commits yet" in a project full of commits), and to set the default branch of a repository on a server, which has no working tree.

When HEAD is detached, it holds a commit ID and there is no name to print:

```console
$ git symbolic-ref HEAD
fatal: ref HEAD is not a symbolic ref
```

The target must be a full name inside `refs/`:

```console
$ git symbolic-ref HEAD scratch
fatal: Refusing to point HEAD outside of refs/
```

:::careful
Setting HEAD this way does not change the staging area or your files. If the new branch is on another commit, `git status` reports the difference as changes you staged. To change branches in a project you work in, use `git switch <branch>`.
:::
