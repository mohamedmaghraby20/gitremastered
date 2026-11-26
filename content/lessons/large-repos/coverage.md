# Coverage: large-repos

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** the tools for repositories that are too big or too slow to clone and use in full: shallow clone, partial clone, sparse checkout, Git LFS (explained, not practised), bundles, and `git maintenance` in short. One book section (7.12 Bundling); the rest is beyond the book, from the Git reference and GitHub Docs.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 7.12 Bundling | The whole section |
| Git reference: `git-clone` | `--depth`, `--shallow-since`, `--single-branch`, `--filter`, `--sparse`, `--no-local` |
| Git reference: `git-fetch` | `--unshallow`, `--deepen`, `--depth` |
| Git reference: `git-sparse-checkout` | `set`, `add`, `list`, `disable`, `reapply`, cone mode |
| Git reference: `git-bundle` | `create`, `verify`, `list-heads` |
| Git reference: `git-maintenance`, `git-gc`, `git-count-objects` | `run`, `start`, `stop`, `unregister`, the scheduled tasks |
| GitHub Docs: About Git Large File Storage; About large files on GitHub | Pointer files, the 50 MiB warning and the 100 MiB limit |

## Pro Git 7.12, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Git can pack its data into one file when there is no network or shared server | Yes | Must know |
| `git bundle create repo.bundle HEAD master` packs what a push would send | Yes, with `main`, a Try-it and real output | Must know; "what a push would send" again in Under the hood |
| You must name every ref or range to include; add `HEAD` if the bundle will be cloned | Yes | Must know |
| The file can be emailed or carried on a USB drive | Yes | Must know |
| `git clone repo.bundle repo` | Yes, in the Try-it | Must know |
| Without `HEAD` in the bundle, clone with `-b` | Yes, with the real warning | Advanced; the `git-bundle` page |
| Sending new commits back: work out the range yourself, because a bundle cannot negotiate | Yes, with `main~2..main` | Advanced |
| Ranges such as `origin/master..master` or `master ^origin/master` | Yes, in the `..` form only | Advanced; see "Left out" |
| `git bundle verify`: valid bundle, and you have the needed ancestors | Yes; the complete form in Must know, "requires this ref" in Advanced | Must know, Advanced |
| The "lacks these prerequisite commits" error | Yes, with real output | Advanced; the `git-bundle` page |
| `git bundle list-heads` | Yes | Under the hood; the `git-bundle` page |
| `git fetch ../commits.bundle master:other-master`, then look and merge | Yes, as `main:mona-main`; the hard challenge | Advanced |
| `git pull` from a bundle | Yes | Advanced; the hard challenge's shortest answer |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| The `^` form of a range (`master ^origin/master`) | One form is enough here | `revision-selection` |
| Sending commits by email with `format-patch` (the book's comparison) | Another workflow | `team-workflows` / the contributing lessons |
| How packfiles and deltas work, what `git gc` prunes | Named only | `packfiles-gc` |
| Moving existing big files to LFS (`git lfs migrate`), removing a huge file from history | Rewrites history | `remove-sensitive-data` |
| `.gitattributes` in general | Named in one sentence for the LFS rule | `attributes` |
| Non-cone sparse patterns | The Git reference recommends cone mode | Not taught |
| Submodules as a way to split a big project | Its own lesson | `submodules` |
| Scalar (`scalar clone`) | A wrapper around the same tools; would add a fourth name for one idea | Not taught |

## Beyond the book

- Why repositories get slow: history, file count, big binary files (Git reference, GitHub Docs).
- Shallow clone, `git fetch --unshallow` / `--deepen`, `.git/shallow`, the `grafted` mark, the single-branch fetch rule.
- Partial clone, `--filter=blob:none`, `tree:0`, `blob:limit`, promisor remotes, `uploadpack.allowFilter`.
- Sparse checkout in cone mode, `.git/info/sparse-checkout`, the skip-worktree mark, `git clone --sparse`.
- Git LFS: pointer files, `git lfs track`, `.gitattributes` (GitHub Docs). Explained with real output; no Try-it and no challenge, because LFS is a separate program and `git lfs install` changes the user's global settings.
- `git maintenance run` / `start` / `stop`, `git gc`, `git count-objects -vH`. `git maintenance start` has no Try-it: it changes the global settings and adds a scheduled job.
- `--no-local`: the practice server is a folder, and Git ignores `--depth` and `--filter` for a plain path. Checked with Git 2.55 in Git Bash: `--no-local` and `file://$(pwd)/../game.git` both work; the lesson teaches `--no-local` (shorter, no absolute path, same on every system) and names `file://` in "When it goes wrong".

## Challenges and quiz

- Every setup builds the same "server", `../game.git`: ten commits, three folders, and pictures of 300 KB of random bytes, so that clone sizes differ visibly. `uploadpack.allowFilter` is on, so the partial-clone Try-its work.
- Easy, `newest-commit-only`: starts with no repository; `git clone --depth 1 --no-local ../game.git .`. Proved by `commit-count-is 1`.
- Medium, `manual-only`: starts with no repository; clone, then `git sparse-checkout set docs`. See the note below on its goals.
- Medium, `full-history-again`: starts as a shallow clone; `git fetch --unshallow`, then find the commit that added `art/ship.png` (an answer challenge, using `git log -- <file>` from `reading-history`).
- Hard, `work-from-a-usb-stick`: the student's clone has eight commits and the server has no more; two new commits exist only in `../usb/latest.bundle`. `git bundle verify`, then `git pull` (or fetch and merge) from the file. Needs the Advanced part "Send only the new commits in a bundle". The brief's other idea, "make a bundle and clone from it", is the Try-it: a goal can only look at the practice folder, so it could not tell a clone from the bundle from a clone from the server.
- **Goal checks and sparse checkout.** `file-exists` and `file-is-missing` are worked out from the latest commit and `git status`. A file left out by a sparse checkout (skip-worktree) is in the latest commit and is not reported as deleted, so `file-is-missing art/ship.png` stays false in a correct sparse checkout (checked with the app's snapshot printer). Until the app reads the real folder or `git ls-files -t`, `manual-only` proves the skill with `config-is extensions.worktreeconfig true` (set by `git sparse-checkout`, never by a plain clone) and `file-contains docs/controls.md`. It cannot tell `set docs` from `set src`.
- Try-its clone into folders inside the practice folder (`full`, `quick`, `lazy`, `writer`, `from-usb`) and remove them, so the easy challenge still starts from an empty folder. The picture stays empty during them; the lesson says so.
- Quiz: which tool for a build machine; what a partial clone can do offline; whether a sparse checkout deletes files for others; what LFS changes for old files.
