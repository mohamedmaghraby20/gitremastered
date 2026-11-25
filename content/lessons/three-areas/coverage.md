# Coverage: three-areas

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** the daily loop of `git status`, `git add` and `git commit`. Pro Git 2.2 also covers ignoring files, diffs, removing and moving files; the course map gives those their own lessons.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 2.2 Recording Changes to the Repository | Intro (tracked / untracked, lifecycle), Checking the Status of Your Files, Tracking New Files, Staging Modified Files, Short Status, Committing Your Changes, Skipping the Staging Area |
| Pro Git 1.3 What is Git? | Snapshots, Not Differences; Git Has Integrity (checksums) |
| Pro Git 10.2 Git Objects | Content is stored as objects named by checksum; the index records them |
| Git reference: `git-add`, `git-status`, `git-commit`, `git-ls-files` | `add .` / `-A` / `-u` / `-n`, `status -s` / `-sb`, `commit -v`, `ls-files --stage` |

## Pro Git 2.2, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Tracked vs untracked; tracked files are unmodified, modified or staged | Yes | Must know (status), Under the hood (life cycle) |
| The file life cycle diagram | Yes, as a numbered list | Under the hood |
| `git status` on a clean folder | Yes | Must know |
| The branch line ("On branch …") | Yes, briefly; branches have their own module | Must know |
| `master` vs `main` (book note) | Yes | Must know (sidenote) |
| Why untracked files are left out (generated files) | Yes | Must know |
| `git add` to track a new file; "new file:" in status | Yes, with a Try-it | Must know |
| `git add` on a folder is recursive | Yes | Must know |
| `git add` is multipurpose; "add precisely this content" | Yes | Must know (two jobs), Under the hood (quote) |
| Marking merge conflicts resolved with `git add` | Pointer only | Taught in the merging lesson |
| Staging a modified file | Yes | Must know |
| A file both staged and unstaged after a new edit | Yes, with a Try-it | Must know, explained in Under the hood |
| Short status: two columns, `??`, `A`, `M`, `MM` | Yes, with a code table | Must know |
| `git commit` opens an editor; `core.editor`; `#` lines ignored; empty message aborts | Yes, plus how to leave Vim | Must know |
| `git commit -v` | Yes | Advanced |
| `git commit -m`; reading the commit output | Yes | Must know |
| Unstaged changes stay out of the commit | Yes | Must know |
| `git commit -a`, only tracked files, the risk | Yes | Must know |
| Status hints suggest `git restore`; the book shows `git reset HEAD` / `git checkout --` | Yes, as a today vs. book comparison | Advanced; discarding is in the "Undo" lessons |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| "Your branch is up-to-date with 'origin/…'" | Needs remotes | Remotes lesson |
| Ignoring files (2.2) | Its own lesson | `ignoring-files` |
| Viewing staged and unstaged changes, `git diff` (2.2) | Its own lesson | `diffs-in-depth` |
| Removing and moving files (2.2) | Its own lesson | `remove-move-files` |
| Discarding changes (`git restore <file>`) | Belongs with undoing | `undo-basics` |
| Interactive staging (`git add -p`) | Pointer only | `partial-staging` |
| Commit message conventions | Pointer only | `commit-craft` |

## Beyond the book

- `git add .` vs `-A` vs `-u` and `git add -n` (Git reference, `git-add`): people mix these up daily.
- `git status -sb` (Git reference, `git-status`).
- `git ls-files --stage` to look at the index (Git reference, `git-ls-files`; Pro Git 10.2 shows the same idea with plumbing).
- How to leave Vim and set `core.editor`: the most common first-commit trap on Git Bash.

## Mission and quiz

- Mission: commit `notes.txt` alone and keep the `README.md` edit out. Practises selective staging, the lesson's main skill.
- Try-its use a separate file (`todo.txt`), so following the lesson does not solve the mission.
- Quiz: staged vs. later edit; reading `MM`; choosing what to stage.
