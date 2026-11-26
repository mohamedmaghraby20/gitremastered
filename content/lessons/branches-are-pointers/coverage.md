# Coverage: branches-are-pointers

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** what a branch is (a pointer to a commit), creating and listing branches, HEAD, and what moves on a commit. Pro Git 3.1 goes on to switching branches and divergent history; the course map gives those to the next lesson.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 3.1 Branches in a Nutshell | Intro (what a commit stores, parents, a branch as a movable pointer, the note that `master` is not special), Creating a New Branch (HEAD, `git log --oneline --decorate`) |
| Pro Git 10.3 Git References | The HEAD (`.git/HEAD` as a symbolic reference; how `git commit` uses it); the intro's `refs/heads` files |
| Git reference: `git-branch`, `git-check-ref-format` | `-v`, `--show-current`, `git branch <name> <start-point>`, naming rules |

## Pro Git 3.1, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Git stores snapshots, not differences | One line, linked to the glossary | Must know |
| A commit holds a pointer to the snapshot, author, message and parent(s) | Yes, as three bullets and a graph | Must know |
| Blobs, trees and the five objects of the first commit | No | Taught in `first-look-inside` and `objects-deep` |
| Zero, one or several parents | One parent only; "parent" is defined | Must know; merges in `branch-and-merge` |
| A branch is a lightweight movable pointer to a commit | Yes, explained twice, with the wrong idea ("a copy") corrected | Must know |
| The branch moves forward on every commit | Yes, with a predict block, a Try-it and a graph | Must know |
| `master` is not a special branch | Yes | Advanced |
| `git branch testing` creates a pointer on the current commit | Yes, with a predict block and a Try-it | Must know |
| HEAD points to the branch you are on; `git branch` does not switch | Yes | Must know |
| `git log --oneline --decorate` shows the pointers | Yes, plus the note that a terminal decorates by default | Must know |
| Switching branches with `git checkout` | One preview line naming `git switch` | Taught in `switch-and-detached-head` |
| Divergent history, `git log --oneline --decorate --graph --all` | `--graph --all` shown on a straight history as a preview | Advanced; divergence in `switch-and-detached-head` |
| Branches are cheap: a 41-byte file | Yes | Must know (the idea), Under the hood (the file) |
| `git checkout -b`, `git switch -c` | No | Taught in `switch-and-detached-head` |

## Pro Git 10.3 "The HEAD"

| Book point | In the lesson | Layer |
|---|---|---|
| HEAD is a symbolic reference to the current branch | Yes, `cat .git/HEAD` | Under the hood |
| `git commit` uses the ref HEAD names as the parent | Yes, as four steps | Under the hood |
| HEAD holding a commit ID (detached HEAD) | No | Taught in `switch-and-detached-head` |
| `git symbolic-ref` | No | Taught in `refs-deep` |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Switching branches, working tree changes on switch | Its own lesson | `switch-and-detached-head` |
| Merging | Its own lesson | `branch-and-merge` |
| Deleting and renaming branches, `--merged` | Its own lesson | `branch-management` |
| Remote-tracking branches | Needs remotes | `remote-branches` |

## Beyond the book

- `git branch -v` and `git branch --show-current` (Git reference, `git-branch`).
- `git branch <name> <commit>` to start a branch at an older commit (Git reference, `git-branch`).
- Branch naming rules and conventions (`git-check-ref-format`; team conventions).
- "When it goes wrong": the three real messages of Git 2.55, and the silent trap of committing on `main` after `git branch`.

## Challenges and quiz

- Easy, `start-an-experiment`: create a branch and stay on `main`.
- Medium, `mark-the-release`: create a branch, then commit on `main`; the two labels must end on different commits, so the order matters.
- Hard, `branch-from-the-past`: put a branch on an older commit without moving HEAD or `main` (Advanced layer).
- Try-its use a branch named `testing` and a file `packing.txt`, so they solve no challenge.
- Quiz: which branch a commit goes to; what a branch costs; reading `(HEAD -> main, hotfix)`; a branch in a repository with no commits.
