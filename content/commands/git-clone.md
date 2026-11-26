---
id: git-clone
command: git clone
group: Start a project
summary: Copies an existing repository, with its whole history, to your computer.
usage: ["git clone <address>", "git clone <address> <folder>", "git clone <address> ."]
bookSection: "2.1 Getting a Git Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository#_git_cloning
lessons: [start-a-repo]
---

`git clone` downloads a repository into a new folder: every commit, the newest files ready to edit, and a [remote](term:remote) named `origin` that remembers the address.

```console
$ git clone ../recipes.git
Cloning into 'recipes'...
done.
$ cd recipes
$ git log --oneline
13255fe Add flatbread
a4a6cc9 Add lentil soup
e5569c6 Add README
```

The address can be an HTTPS link (`https://github.com/libgit2/libgit2`), an SSH address (`git@github.com:libgit2/libgit2.git`) or a path on your computer (`../recipes.git`).

| You type | What happens |
|---|---|
| `git clone <address>` | A new folder named after the repository |
| `git clone <address> cookbook` | A new folder named `cookbook` |
| `git clone <address> .` | The files go into the current folder, which must be empty |
| `git clone -b release-1.0 <address>` | Starts on the branch `release-1.0` instead of the default one |
| `git clone -o team <address>` | Names the remote `team` instead of `origin` |
| `git clone --depth 1 <address>` | Only the newest commit (a shallow clone), for huge projects |
| `git clone --bare <address>` | History only, no files to edit: the form servers keep |

:::careful
`git clone` creates its folder inside the folder you are standing in. `cd` to where the project should live first. If the destination already exists and is not empty, Git stops with "destination path already exists and is not an empty directory" and changes nothing.
:::
