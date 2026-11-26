---
id: git-submodule
command: git submodule
group: Large repositories
summary: Keeps another Git repository inside your project, pinned to one exact commit.
usage: ["git submodule add <address> [<path>]", "git submodule update --init --recursive", "git submodule update --remote [<path>]", "git submodule status", "git submodule foreach '<command>'"]
bookSection: "7.11 Submodules"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Submodules
lessons: [submodules]
---

`git submodule` manages [submodules](term:submodule): other repositories kept in subfolders of your project. Your project stores each one's address (in the file `.gitmodules`) and one commit ID, not its files.

`git submodule add <address> <path>` clones a repository into a subfolder and stages two entries, which you then commit. With a real address it reads `git submodule add https://github.com/team/library.git vendor/library`. This example comes from the practice project, where the library's server is a folder (see the second warning below):

```console
$ git -c protocol.file.allow=always submodule add ../library.git vendor/library
Cloning into 'C:/…/project/vendor/library'...
done.
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   .gitmodules
	new file:   vendor/library
```

`git submodule status` prints the commit each submodule is on:

```console
$ git submodule status
 98d759a71a10c970d1f65a7ebb1b170feb7b9718 vendor/library (heads/main)
```

| First character | Meaning |
|---|---|
| a space | The folder is on the commit your project records |
| `-` | Not downloaded yet: run `git submodule update --init` |
| `+` | The folder is on another commit than your project records |

The forms people use:

| Command | What it does |
|---|---|
| `git submodule add <address> [<path>]` | Adds a submodule. Without a path, the folder gets the repository's name |
| `git submodule update --init --recursive` | After a clone: registers every submodule, downloads it and checks out the recorded commit, also for submodules inside submodules |
| `git submodule update` | After a pull or a branch switch: puts each folder on the commit your project records |
| `git submodule update --remote [<path>]` | Moves the folder to the newest commit of the server's default branch. Stage the path and commit to record it |
| `git submodule update --remote --merge` (or `--rebase`) | The same, but merges into (or rebases) the branch you have checked out inside the submodule |
| `git submodule foreach '<command>'` | Runs a shell command inside every submodule |
| `git submodule sync --recursive` | Copies a changed address from `.gitmodules` into your clone's settings |
| `git submodule deinit <path>` | Empties the folder and unregisters the submodule in your clone only |

Options on other commands that work with submodules:

| Command | What it does |
|---|---|
| `git clone --recurse-submodules <address>` | Clones the project and downloads its submodules in one go |
| `git pull --recurse-submodules` | Pulls, then updates the submodule folders |
| `git config submodule.recurse true` | Makes every command that has `--recurse-submodules` use it, except `git clone` |
| `git diff --submodule` | Shows a submodule change as a list of its commits |
| `git push --recurse-submodules=check` | Refuses to push while a submodule has commits no server has |
| `git rm <path>` | Removes a submodule from the project: deletes the folder and its `.gitmodules` entry, and stages both |

:::careful
`git submodule update` checks out a commit, not a branch, so the submodule is in a detached HEAD state. A commit you make there belongs to no branch, and the next update moves away from it. Run `git switch main` inside the submodule before you change it.
:::

:::careful
A submodule address that is a folder on your own machine, like `../library.git`, is refused with `fatal: transport 'file' not allowed` (Git 2.38.1 and later). For a folder you trust, allow it for one command: `git -c protocol.file.allow=always submodule add ../library.git`.
:::

:::compare
today: "`git submodule update --init` registers and downloads in one command."
book: "Pro Git first shows `git submodule init`, then `git submodule update`. Both still work."
:::
