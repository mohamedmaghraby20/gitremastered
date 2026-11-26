# Coverage: remote-branches

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** the three kinds of branch name (local, remote-tracking, on the server), the upstream relationship, ahead and behind, publishing a branch, getting a teammate's branch, and deleting branches on the server. The lesson "Work with remotes: fetch, pull, push" comes before it and teaches the commands on one branch; "Refspecs: how fetch and push map branches" comes after it and explains the `source:destination` notation.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 3.5 Remote Branches | Intro (remote-tracking branches as bookmarks), Pushing, Tracking Branches, Pulling, Deleting Remote Branches |
| Git reference: `git-branch`, `git-push`, `git-fetch`, `git-switch`, `git-remote`, `git-config` | `branch -vv` / `-u` / `--unset-upstream` / `-r` / `-a`, `push -u` / `--delete`, `fetch --prune` / `--all`, `switch` guessing a remote branch, `remote show` / `set-head`, `push.autoSetupRemote`, `fetch.prune` |

## Pro Git 3.5, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Remote-tracking branches: local references you cannot move; bookmarks | Yes, as the three-names table and "record" | Must know |
| The `<remote>/<branch>` name form | Yes | Must know |
| `git ls-remote`, `git remote show` to list remote references | `git remote show origin` only | Advanced; `ls-remote` is in "How Git talks to servers" |
| After clone: `origin/master` and a local `master` at the same place | Yes, as "your main normally follows origin/main" | Must know |
| "origin is not special" (`clone -o`) | No | Taught in "Start or clone a repository" |
| Local and remote work can diverge; the pointer does not move while you are out of contact | Yes, two graph blocks and a predict block | Must know |
| `git fetch` moves the remote-tracking branches | Yes, reading the fetch output line by line | Must know |
| A second remote (`teamone`) and its `teamone/master` | Mentioned only through `git fetch --all` | Left out, see below |
| Pushing: `git push <remote> <branch>`; branches are not shared automatically | Yes, with `-u` | Must know |
| `serverfix:serverfix`, `serverfix:awesomebranch` | One line | Advanced; "Refspecs" teaches it |
| "Don't type your password every time" (credential cache) | No | "GitHub account, SSH keys, credentials" |
| A fetched branch gives no local, editable copy | Yes | Must know |
| `git merge origin/serverfix` | Yes, as `git merge origin/main` / `git merge @{u}` | Must know |
| `git checkout -b serverfix origin/serverfix`, `--track`, the plain-name shortcut | Yes: `git switch <name>` taught, the checkout forms in a compare block | Must know; other forms in Advanced |
| A local branch with a different name (`sf`) | Yes | Advanced |
| Tracking branch and upstream branch (the words) | Yes | Must know |
| `git branch -u` / `--set-upstream-to` | Yes | Must know |
| `@{upstream}` / `@{u}` shorthand | Yes, with a small table | Must know |
| `git branch -vv`, reading ahead and behind | Yes, with real output and a Try-it | Must know |
| The numbers are only as fresh as the last fetch; `git fetch --all; git branch -vv` | Yes, in a careful block, a predict block and the quiz | Must know |
| Pulling: `git pull` is fetch then merge of the upstream; fetch and merge explicitly is often clearer | Yes | Must know |
| Deleting remote branches: `git push origin --delete` | Yes | Must know |
| The server keeps the data for a while after a delete | No | "Recover lost commits with reflog and fsck" |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Working with two remotes at once | One remote is enough to learn the idea; a second adds names, no new rule | "Forks, GitHub Flow and pull requests" (origin and upstream remotes) |
| Refspec syntax (`refs/heads/...`, `+`, `src:dst`) | Its own lesson | "Refspecs: how fetch and push map branches" |
| Credentials and password caching | Needs a real server | "GitHub account, SSH keys, credentials" |
| `git pull --rebase` | Rebase is not taught yet | "Rebasing, and when not to" |
| Force-pushing a branch | Dangerous without the background | "Force-pushing safely with --force-with-lease" |

## Beyond the book

- `git fetch --prune` and `fetch.prune`: the book deletes remote branches but does not say what teammates still see. Stale `origin/...` branches are a daily confusion.
- `[origin/x: gone]` in `git branch -vv` after the server branch is deleted.
- `push.autoSetupRemote` (Git 2.37 and later), which the "no upstream branch" error itself suggests.
- `git switch` in place of `git checkout` for creating a tracking branch.
- `origin/HEAD` and `git remote set-head origin -a`.
- The four real error messages in "When it goes wrong", from Git 2.55.

## Under the hood

- Remote-tracking branches are refs under `.git/refs/remotes/<remote>/`, which is why HEAD can never be "on" one.
- The upstream is the `[branch "<name>"]` block in `.git/config` (`remote` and `merge`).
- Ahead and behind are computed from two local histories, with no network.

## Challenges and quiz

- Easy, `publish-feature`: a local `feature` branch has no upstream; publish it with `git push -u origin feature`. Its starting state is also where the Try-its run: a teammate has pushed a commit to `main` and a `search` branch that the student has not fetched yet.
- Medium, `continue-fix-login`: the teammate's `fix-login` is on the server but not fetched. Fetch, `git switch fix-login` (upstream set automatically), commit, push.
- Hard, `clean-up-day`: `main` has diverged (a local merge of `banner`, a teammate's commit on the server), `banner` must be deleted on both sides, and `origin/old-search` is stale. Needs pull and push, `push --delete`, `branch -d` and `fetch --prune`.
- Try-its use the student's own branch (`try-colors`) and files (`colors.txt`, `plan.txt`), so they do not publish `feature`.
- Quiz: a stale "up to date" message; reading `ahead 2, behind 1`; pushing without `-u`; a stale `origin/demo`.
