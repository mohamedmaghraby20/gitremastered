# Coverage: checkpoint-remotes

What this checkpoint draws on. For course reviewers; the app does not show this file.

**Scope:** the review page of the Remotes module. It teaches nothing new: every row of the cheat sheet repeats something one of the module's five lessons taught, and the three challenges mix those lessons with no hints.

**Sources:** the five lessons of the module, and through them Pro Git 4.1, 10.6, 2.5, 3.5, 10.5 and 2.6.

## Cheat sheet, part by part

| Part | Rows | Lesson it repeats |
|---|---|---|
| How Git talks to servers | `git remote -v`, `git ls-remote origin`, `--heads`; the three address kinds | `how-git-talks` (Must know; `--heads` from its Advanced and a Try-it) |
| Fetch, pull, push | `remote add`, `remote show`, `fetch`, `merge origin/main`, `pull`, `push`, `push -u origin main`; the rejected push; `pull --no-edit` | `remotes` (Must know) |
| Remote and tracking branches | `push -u origin <branch>`, fetch then `switch`, `branch -vv`, `branch -u`, `push origin --delete`, `fetch --prune`, `branch -r` | `remote-branches` (Must know; `branch -r` from a Try-it and Advanced) |
| Refspecs | the default fetch line, `local:other-name`, the empty source, `config --get-all remote.origin.fetch`, the `+` | `refspecs` (Must know; the config command from Under the hood) |
| Tags | `tag`, `tag -a`, tagging an older commit, `show`, `push origin <tag>`, `--follow-tags`, deleting in two places | `tags-and-releases` (Must know) |
| Read the picture | header texts, the `remote` and `tag` labels, the second row | the picture cues of all five lessons |

## Under the hood, idea by idea

| Idea | Lesson |
|---|---|
| A fetch never touches your work | `how-git-talks`, `remotes` |
| `origin/main` is a record | `remotes`, `remote-branches` |
| The server only moves a branch forward | `remotes` (the rejected push) |
| An upstream is two lines of configuration | `remote-branches` (Under the hood) |
| Branches and tags are refs, and a refspec maps them | `refspecs`, `tags-and-releases` (Under the hood) |

## Left out on purpose

| Point | Why |
|---|---|
| Protocol traces, packfiles, want and have | Under the hood material of `how-git-talks`; not needed to do the work |
| `git remote rename` / `remove` / `set-url` | Rare; one click away in `remotes` |
| `@{u}`, `push.autoSetupRemote`, `fetch.prune`, `origin/HEAD` | Shortcuts and settings from `remote-branches`; a cheat sheet keeps to the core |
| Several fetch lines, push lines in config, negative refspecs | Advanced layer of `refspecs` |
| Lightweight tags, `git describe`, signed tags, detached HEAD on a tag | Covered in `tags-and-releases`; the release challenge needs annotated tags only |

## Challenges and quiz

- Easy, `monday-catch-up`: pull a teammate's commit into `main` (`remotes`) and get his new branch as a local tracking branch (`remote-branches`).
- Medium, `release-day`: push `main` (`remotes`), tag the release with an annotated tag and push the tag (`tags-and-releases`), publish a branch with an upstream (`remote-branches`).
- Hard, `friday-clean-up`: a rejected push fixed with pull then push (`remotes`), a server branch deleted and a stale record pruned (`remote-branches`), a branch pushed under another name (`refspecs`).
- No challenge has hints, as the checkpoint rule asks. None repeats a challenge of the five lessons: each lesson's challenges stay inside one lesson's skill.
- Every setup sets `pull.rebase false` in the project and in the teammate's clone, so a plain `git pull` of diverged branches merges on every platform. The reference solutions use `git pull --no-rebase --no-edit`.
- Limits of the goal checks: `remote-has-tag` only sees that the name exists on the server; `remote-branch-is-missing origin/seasonal` is also met by deleting only the local record with `git branch -dr`, without touching the server.
- Quiz: tags are not pushed by a plain push (`tags-and-releases`); ahead and behind are as fresh as the last fetch (`remote-branches`); `+main` is a force push (`refspecs`, `remotes`); `--prune` clears a stale record (`remote-branches`).

## Not verified

- The picture cues are described from the visualizer's code and the other lessons; this page was not opened in the desktop app.
- The page has no `console` blocks, so no terminal output is quoted.
