---
id: git-fetch
command: git fetch
group: Remotes
summary: Downloads new commits from a remote and updates your record of its branches, without changing your own branches or files.
usage: ["git fetch", "git fetch origin", "git fetch --all", "git fetch --prune", "git fetch origin <branch>"]
bookSection: "2.5 Working with Remotes"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes#_fetching_and_pulling
lessons: [remotes, remote-branches, refspecs]
---

`git fetch` asks a remote for every commit you do not have and stores them in your repository. It then moves your remote-tracking branches, like `origin/main`, to where the server's branches are now. Your own branch, your staging area and your working tree stay as they were, so a fetch is always safe.

```console
$ git fetch origin
From ../origin
   17b7c70..807b5f7  main       -> origin/main
$ git status
On branch main
Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.
  (use "git pull" to update your local branch)

nothing to commit, working tree clean
```

The line `main -> origin/main` reads: the server's `main` was copied into your record `origin/main`.

After a fetch you can look before you take anything:

| You type | You see |
|---|---|
| `git log --oneline main..origin/main` | The commits the server has and your `main` lacks |
| `git diff main origin/main` | What those commits change |
| `git merge origin/main` | Nothing to see: this brings the commits into your branch |

| Option | What it does |
|---|---|
| `git fetch` | Fetches from the remote your branch follows, usually `origin` |
| `git fetch origin` | Fetches from the remote named `origin` |
| `git fetch --all` | Fetches from every remote |
| `git fetch --prune` | Also removes remote-tracking branches whose branch was deleted on the server. A plain fetch never removes them. `git config --global fetch.prune true` makes it the default |
| `git fetch origin main` | Fetches one branch |
| `git fetch origin main:refs/remotes/origin/mymain` | A one-off refspec (`source:destination`): fetch the server's `main` into a name you choose |

Which branches a plain fetch brings, and where it records them, is set by the remote's fetch line in `.git/config`: `+refs/heads/*:refs/remotes/origin/*` by default.

`git status` and the words "up to date" only know what the last fetch saw. When in doubt, fetch first.
