---
id: git-rev-parse
command: git rev-parse
group: Look inside
summary: Turns a name like HEAD or main into the full commit ID it stands for.
usage: ["git rev-parse HEAD", "git rev-parse --short HEAD", "git rev-parse --abbrev-ref HEAD"]
bookSection: "10.3 Git References"
bookUrl: https://git-scm.com/docs/git-rev-parse
lessons: [first-look-inside]
---

`git rev-parse` answers the question "which commit does this name mean?". Give it a branch, `HEAD`, a tag or a short ID, and it prints the full 40-character ID.

```console
$ git rev-parse HEAD
63d16f10b2995c11058c25e4e128d9a5cc074ec7
$ git rev-parse --short HEAD
63d16f1
```

It reads `.git/HEAD` to find your branch, then the branch's [ref](term:ref) to find the commit, so you do not have to open those files yourself.

| You type | You get |
|---|---|
| `git rev-parse main` | The ID of the commit `main` points at |
| `git rev-parse --short HEAD` | The short ID of the commit you are on |
| `git rev-parse --abbrev-ref HEAD` | The name of the branch you are on, like `main` |
| `git rev-parse --show-toplevel` | The project's top folder, from anywhere inside it |
| `git rev-parse --git-dir` | Where the `.git` folder is |

Scripts use it most: to stamp a build with the commit it came from, or to find the project's top folder.

If the name does not exist, Git says so:

```console
$ git rev-parse nosuch
fatal: ambiguous argument 'nosuch': unknown revision or path not in the working tree.
```
