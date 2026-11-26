# Coverage: remotes

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** the daily loop with one remote on `main`: list and add remotes, fetch, merge `origin/main`, pull, push, and the rejected push. Tracking branches in depth belong to the next lesson, `remote-branches`.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 2.5 Working with Remotes | Intro (and the note that a remote can be on your machine), Showing Your Remotes, Adding Remote Repositories, Fetching and Pulling from Your Remotes, Pushing to Your Remotes, Inspecting a Remote, Renaming and Removing Remotes |
| Git reference: `git-remote`, `git-fetch`, `git-pull`, `git-push` | `remote set-url` / `get-url`, `fetch --all`, `pull --rebase` / `--ff-only` / `--no-edit`, `push -u` / `--dry-run` / `--force` |

## Pro Git 2.5, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Remotes are other versions of the project; collaborating means pushing and pulling | Yes | Must know (lede, intro) |
| A remote can be on your own machine | Yes; the practice "server" is a folder | Must know |
| `git remote` lists short names; `origin` comes from clone | Yes | Must know |
| `git remote -v` shows the URLs for reading and writing | Yes, with the two lines explained | Must know |
| Several remotes for several collaborators | Yes, as `origin` plus `upstream` | Advanced |
| `git remote add <shortname> <url>` | Yes, with a challenge | Must know |
| `git fetch <remote>`; the remote's branch is then available as `pb/master` | Yes, as `origin/main` | Must know |
| Fetch only downloads; it does not merge or change your work | Yes, twice: words, a predict block and a Try-it | Must know |
| You merge it yourself when ready | Yes (`git merge origin/main`) | Must know |
| `git pull` fetches and merges when the branch tracks a remote branch; clone sets that up | Yes | Must know |
| The `pull.rebase` note (Git 2.27 and later) | Yes: the "divergent branches" message and `pull.rebase false`; `pull.rebase true` | Must know (When it goes wrong), Advanced |
| `git push <remote> <branch>` | Yes | Must know |
| A push is rejected if someone pushed in the meantime; fetch and incorporate first | Yes, as the central trap, with graphs and a Try-it | Must know |
| `git remote show <remote>` and how to read it | Yes, the simple output | Must know |
| The longer `remote show` output (new, stale branches) | No | See "Left out" |
| `git remote rename`; remote-tracking branches are renamed too | Yes | Must know |
| `git remote remove` / `rm`; its remote-tracking branches and settings go too | Yes | Must know |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Tracking branches in depth, `git branch -vv`, ahead and behind counts | Its own lesson | `remote-branches` |
| Pushing a new feature branch, deleting remote branches, `--prune`, stale branches in `remote show` | Its own lesson | `remote-branches` |
| The fetch line in `.git/config` read piece by piece | Named only | `refspecs` |
| Protocols and URL forms | Taught just before | `how-git-talks` |
| Credentials, SSH keys, a real GitHub remote | Needs an account | `github-account-ssh` (phase 6) |
| Rebasing a pull | Named in Advanced only | `rebasing` |
| Safe force-pushing | Careful block only | `force-push-safely` |
| Resolving a conflict | Pointer only | `branch-and-merge` |

## Beyond the book

- `git push -u origin main` for the first push, and the "has no upstream branch" message (Git reference, `git-push`): the first thing a student meets after `git init`.
- The "divergent branches" message on macOS and Linux (Git reference, `git-pull`).
- `git pull --ff-only`, `git push --dry-run`, `git fetch --all`, `git remote set-url`.
- `origin/main` on disk (`.git/refs/remotes/origin/main`) and the `[remote]` and `[branch]` blocks in `.git/config`.

## Challenges and quiz

- Easy, `get-teammates-commit`: a teammate's commit waits on the server; get it into `main`. The lesson's main skill, in one command or two.
- Medium, `publish-first-time`: a local-only project; add the remote and push with `-u`.
- Hard, `rejected-push`: both sides committed; pull (a merge commit), then push.
- The Try-its run in the easy challenge's starting state and do bring in the teammate's commit, with `git fetch` and `git merge`. Starting the challenge rebuilds the folder, and the challenge can be done with `git pull` alone.
- Every setup sets `pull.rebase false` in the project and in the teammate's clone, so `git pull` merges on every system.
- Quiz: what a fetch changes; why `git status` can be out of date; the rejected push; the first push without an upstream.
