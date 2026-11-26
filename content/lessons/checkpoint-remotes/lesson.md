---
id: checkpoint-remotes
title: "Checkpoint: Remotes"
module: remotes
checkpoint: true
bookSection: "2.5 Working with Remotes"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes
bookSources:
  - book/progit2/book/04-git-server/sections/protocols.asc
  - book/progit2/book/10-git-internals/sections/transfer-protocols.asc
  - book/progit2/book/02-git-basics/sections/remotes.asc
  - book/progit2/book/03-git-branching/sections/remote-branches.asc
  - book/progit2/book/10-git-internals/sections/refspec.asc
  - book/progit2/book/02-git-basics/sections/tagging.asc
  - book/progit2/book/10-git-internals/sections/refs.asc
readFirst: [how-git-talks, remotes, remote-branches, refspecs, tags-and-releases]
---

A teammate pushed while you were away, your own push gets rejected, and a release needs a tag on the server. This checkpoint lets you prove you can handle a working week with a shared server, with no hints.

## Must know

This page teaches nothing new. It is the module on one screen: the commands of its five lessons, each with its job in one line. Read it, then try the three challenges below. They mix the lessons, the way real work does.

Every challenge has its own "server": a folder named `../origin.git` beside your practice project, and a teammate, Tariq, who has pushed to it.

### How Git talks to servers

From [How Git talks to servers](lesson:how-git-talks): a remote is another full copy of the repository, and Git sends it commits and ref updates, never loose files.

| Command | Job |
|---|---|
| `git remote -v` | Shows each remote's name and address, so you can see which kind of address it uses |
| `git ls-remote origin` | Asks the server for its branches and tags, without downloading anything |
| `git ls-remote --heads origin` | The same, branches only |

| Address | Kind |
|---|---|
| `../origin.git` | A local path (what the practice uses) |
| `https://github.com/user/repo.git` | HTTPS: signs in with a token |
| `git@github.com:user/repo.git` | SSH: signs in with a key pair |

### Fetch, pull, push

From [Work with remotes: fetch, pull, push](lesson:remotes): the daily loop on `main`.

| Command | Job |
|---|---|
| `git remote add origin <address>` | Gives an address a short name |
| `git remote show origin` | Asks the server what it has and how your branches compare |
| `git fetch` | Downloads new commits and moves `origin/main`. Your branch and files do not change |
| `git merge origin/main` | Brings the fetched commits into your branch |
| `git pull` | Both steps at once: fetch, then merge |
| `git push` | Uploads your commits and moves the server's branch |
| `git push -u origin main` | The first push of a branch: uploads it and makes it follow `origin/main` |

The rejected push, `! [rejected] main -> main (fetch first)`, means the server has commits you lack. Run `git pull`, then `git push` again. When both sides have new commits, the pull makes a merge commit; `git pull --no-edit` accepts its ready-made message.

### Remote and tracking branches

From [Remote and tracking branches](lesson:remote-branches): `main` is yours, `origin/main` is your record of the server's branch, and the server's `main` is the third.

| Command | Job |
|---|---|
| `git push -u origin <branch>` | Publishes a new branch and sets its upstream |
| `git fetch`, then `git switch <name>` | Gets a teammate's branch as a local branch that follows `origin/<name>` |
| `git branch -vv` | Shows each branch's upstream, with ahead and behind |
| `git branch -u origin/<name>` | Sets or changes the upstream of the branch you are on |
| `git push origin --delete <branch>` | Deletes a branch on the server |
| `git fetch --prune` | Clears `origin/...` records whose branch is gone from the server |
| `git branch -r` | Lists your remote-tracking branches |

Ahead and behind are counted against `origin/...`, so they are as fresh as your last fetch.

### Refspecs

From [Refspecs: how fetch and push map branches](lesson:refspecs): a refspec is `+source:destination`. On a fetch the source is the server; on a push the source is you.

| You type | Job |
|---|---|
| `+refs/heads/*:refs/remotes/origin/*` | The default fetch line: every server branch becomes an `origin/...` record |
| `git push origin feature:review/feature` | Pushes your `feature` under another name on the server |
| `git push origin :old-idea` | An empty source deletes `old-idea` on the server (the same as `--delete`) |
| `git config --get-all remote.origin.fetch` | Shows the fetch lines of `origin` |

A leading `+` allows a move that is not a fast-forward. In the fetch line it is harmless. In a push (`git push origin +main`) it is a force push.

### Tags

From [Tags: mark a release](lesson:tags-and-releases): a tag is a name for one commit that never moves.

| Command | Job |
|---|---|
| `git tag` | Lists the tags |
| `git tag -a v1.0 -m "Version 1.0"` | Makes an annotated tag (tagger, date, message) on the commit you are on |
| `git tag -a v0.9 -m "Version 0.9" <commit-id>` | Tags an older commit |
| `git show v1.0` | Shows the tag and the commit behind it |
| `git push origin v1.0` | Sends one tag. A plain `git push` sends none |
| `git push --follow-tags` | Sends your commits plus the annotated tags on them |
| `git tag -d v1.0` and `git push origin --delete v1.0` | Deletes a tag here, and on the server |

:::careful
Three commands in this module remove something for the whole team: `git push origin --delete <branch>`, `git push origin :<name>` and any push with a leading `+` or `--force`. Read the command twice before you press Enter.
:::

### Read the picture

While you work on the challenges, the picture next to the terminal tells you where you stand:

- The header reads `on branch main · 1 ahead of origin/main`, `2 behind origin/main` or `level with origin/main`.
- A `remote origin/main` tag on the history map marks your record of the server's branch. It moves when you fetch, pull or push.
- A `tag v1.0` label stays on its station while `branch main` moves on.
- When your branch and the server's each have commits of their own, the map shows two rows. Press "Expand" on the History panel to see them large.

## Under the hood

The cheat sheet lists what to type. These five ideas explain why those commands behave as they do.

### A fetch never touches your work

A fetch adds commits to your repository and moves refs under `.git/refs/remotes/origin/`. Your branch, your staging area and your working tree stay as they were. That is why you can fetch at any moment, and why `git pull` (fetch plus merge) is the step that changes your branch.

### `origin/main` is a record

`origin/main` is a ref in your own repository. It says where the server's `main` was the last time you talked to the server. Git never checks the server on its own, so `git status` can say "up to date" while a teammate's commits wait there.

### The server only moves a branch forward

A push asks the server to move its branch onto your commit. The server agrees when that keeps every commit it already has, which is a fast-forward. Otherwise it rejects the push, and you bring the missing commits in first.

### An upstream is two lines of configuration

`git push -u` writes a `[branch "feature"]` block into `.git/config`, with a `remote` line and a `merge` line. Plain `git pull` and `git push` read it, and so do the ahead and behind counts.

### Branches and tags are refs, and a refspec maps them

A branch on the server is `refs/heads/<name>` there and `refs/remotes/origin/<name>` in your repository. A tag is `refs/tags/<name>` on both sides. Every fetch and push follows a refspec that says which ref goes where, whether you type one or let the default apply.

## Advanced

The Remotes module comes back in these later parts of the course:

- **GitHub account, SSH keys, credentials.** The practice server is a folder. A real one asks you to sign in, with a token over HTTPS or a key pair over SSH.
- **Forks, GitHub Flow and pull requests.** Publishing a branch with `git push -u` is the first step of every pull request.
- **Rebasing, and when not to.** `git pull --rebase` replays your commits on top of the server's, in place of the merge commit you made here.
- **Force-pushing safely with `--force-with-lease`.** The safe form of the push this module told you to avoid.
- **Tags and GitHub releases.** A release page with notes and downloads is built on a tag you pushed.
- **Sign commits and tags (GPG and SSH).** `git tag -s` proves who made a release.

## Recap

- `git fetch` downloads and moves `origin/...`; `git pull` is fetch plus merge; `git push` uploads and moves the server's branch.
- A rejected push: `git pull`, then `git push` again.
- `git push -u origin <branch>` publishes a branch; `git fetch`, then `git switch <name>`, gets a teammate's.
- `git push origin --delete <branch>` removes a server branch; `git fetch --prune` clears stale `origin/...` records.
- `git tag -a v1.0 -m "..."`, then `git push origin v1.0`: tags travel only when you name them.
