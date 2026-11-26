# Coverage: start-a-repo

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** getting a repository onto your computer, with `git init` or `git clone`. It comes right before the pilot lesson, so the student has not learned `git status`, `git add` or `git commit` yet.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 2.1 Getting a Git Repository | All of it: Initializing a Repository in an Existing Directory, Cloning an Existing Repository |
| Git reference: `git-init`, `git-clone`, `git-branch` | `init -b`, `init.defaultBranch`, `init <directory>`, re-running init; `clone <dir>`, `-b`, `-o`, `--depth`, `--bare`; `branch -m` |

## Pro Git 2.1, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Two ways to get a repository: turn a local directory into one, or clone one | Yes, as the opening table | Must know |
| Go to the project's directory first (`cd`, per system) | Yes, shorter: the command works on the folder you are in; "choose where the clone goes" | Must know |
| `git init` creates a `.git` subdirectory, a repository skeleton | Yes, with a Try-it | Must know; the skeleton's files in Under the hood |
| Nothing in the project is tracked yet | Yes, with a predict block | Must know |
| Start tracking with `git add`, then an initial `git commit` | Yes: exact commands, one line each, real output, pointer to `three-areas` | Must know |
| `git clone` gets a full copy of nearly all the server's data, not just a working copy | Yes, as the "common wrong idea" | Must know |
| Any clone can restore the server | Yes | Must know |
| `git clone <url>` creates a directory, initializes `.git`, pulls the data, checks out the latest version | Yes | Must know (four things you get), Under the hood (six steps) |
| `git clone <url> <directory>` | Yes, plus the dot for the current folder | Must know |
| Transfer protocols: `https://`, `git://`, `user@server:path` | Yes, as a table of three address shapes (HTTPS, SSH, local path) | Must know |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| The `git://` protocol | Rare today, and unauthenticated; one more shape would not help a first clone | `how-git-talks` |
| Pros and cons of each protocol, setting up SSH keys | Their own lessons | `how-git-talks`, `github-account-ssh` |
| What `git add` and `git commit` really do | The next lesson | `three-areas` |
| Branches, beyond the first branch's name | Their own module | `branches-are-pointers` |
| Fetching, pulling and pushing with `origin`; remote-tracking branches | Named and drawn only | `remotes`, `remote-branches` |
| `git config` in general | Named only (`init.defaultBranch`) | `setup` |
| Shallow and partial clones in depth | Two lines in Advanced | `large-repos` |

## Beyond the book

- `git init -b main`, `init.defaultBranch` and `git branch -m main`: Git 2.55 still names the first branch `master` by default, and most teams expect `main` (Git reference, `git-init`).
- `git init <folder>`, and that re-running `git init` is safe (Git reference, `git-init`).
- Cloning into the current folder with `.`; the "destination path already exists" error (Git reference, `git-clone`).
- Checking whether you are in a repository before `git init`, and undoing a repository created inside another one.
- What `HEAD` holds before the first commit, and the `[remote]` and `[branch]` sections `git clone` writes to `.git/config`.
- `git clone -b`, `-o`, `--depth 1`, `--bare` (Git reference, `git-clone`).

## Challenges and quiz

- The practice folder starts **without** a repository. The picture stays empty until `project/` itself is one, so the clone challenges ask for `git clone <address> .`.
- Each setup builds the repository to clone beside the project (`../recipes.git`, `../shop.git`) from a temporary `../seed` that is removed again.
- Easy, `first-repository`: `git init` with the branch named `main`, then a first commit of two files. The standard identity lines cannot run in a folder with no repository, so the last hint says what to do if Git asks who you are.
- Medium, `clone-team-recipes`: clone into the current folder with the dot; goals check `origin`, the three commits and that `main` follows `origin/main`.
- Hard, `clone-release-branch`: `git clone -b release-1.0 -o team` (both from the Advanced layer).
- Try-its use a `sandbox` folder and a `team-recipes` clone inside the practice folder and remove both, so the first challenge still starts from a plain folder. The easy setup also builds `../recipes.git` so the clone Try-it has something to clone.
- Quiz: init or clone for an existing project; what a new repository tracks; what `origin` is; where a clone lands without a destination.
