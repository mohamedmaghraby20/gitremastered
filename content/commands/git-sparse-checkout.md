---
id: git-sparse-checkout
command: git sparse-checkout
group: Large repositories
summary: Chooses which folders of the project are written into your working tree.
usage: ["git sparse-checkout set <folder>…", "git sparse-checkout add <folder>", "git sparse-checkout list", "git sparse-checkout disable"]
bookSection: "Git reference: git-sparse-checkout"
bookUrl: https://git-scm.com/docs/git-sparse-checkout
lessons: [large-repos]
---

`git sparse-checkout set <folder>` tells Git: my working tree holds this folder and the files at the top level of the project, and nothing else. It is for projects with so many files that you only want the part you work in.

```console
$ ls
README.md  art  docs  src
$ git sparse-checkout set docs
$ ls
README.md  docs
$ git status
On branch main
Your branch is up to date with 'origin/main'.

You are in a sparse checkout with 38% of tracked files present.

nothing to commit, working tree clean
```

The other folders left your working tree only. They are still tracked, still in every commit, and still in your repository; teammates and the server notice nothing.

| You type | What happens |
|---|---|
| `git sparse-checkout set docs` | The working tree holds `docs` and the top-level files. `set` replaces the whole list |
| `git sparse-checkout set docs src/engine` | Several folders at once; a folder inside a folder works too |
| `git sparse-checkout add src` | Puts one more folder on the list |
| `git sparse-checkout list` | Prints the folders on the list |
| `git sparse-checkout disable` | Brings every folder back: a complete working tree again |
| `git sparse-checkout reapply` | Applies the list again, for example after a merge left extra files behind |
| `git clone --sparse <address>` | Starts a clone with only the top-level files; run `set` next |

Older guides write `git sparse-checkout init --cone` or `set --cone`. "Cone" is the name for choosing whole folders, and it has been the default since Git 2.37, so today `set <folder>` is enough.

A sparse checkout does not make the download smaller: the clone still holds everything. Clone with `git clone --sparse --filter=blob:none <address>` to also skip downloading the contents of the folders you leave out.

:::careful
Git refuses to stage a file in a folder that is not on your list ("matched paths that exist outside of your sparse-checkout definition"). Add the folder first with `git sparse-checkout add <folder>`.
:::
