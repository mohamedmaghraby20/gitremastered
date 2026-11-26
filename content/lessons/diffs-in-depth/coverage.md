# Coverage: diffs-in-depth

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** reading a diff and choosing the comparison: working tree, staging area, last commit, and two commits.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 2.2 Recording Changes to the Repository | Viewing Your Staged and Unstaged Changes (all of it) |
| Pro Git 1.3 What is Git? | Snapshots, Not Differences (for Under the hood) |
| Git reference: `git-diff` | The comparison forms, `--stat`, `--name-only`, `--name-status`, `--word-diff`, `--color-words`, `-w`, `-U<n>`, `--check`, `A..B` and `A...B`, the unified diff format |
| Git reference: `git-difftool` | One-line pointer |

## Pro Git 2.2 "Viewing Your Staged and Unstaged Changes", point by point

| Book point | In the lesson | Layer |
|---|---|---|
| `git status` is too vague; `git diff` shows the exact lines | Yes, as the lede and the opening | Must know |
| The two everyday questions: what is changed but not staged, what is staged | Yes, as the comparison table | Must know |
| `git diff` with no arguments compares the working directory with the staging area | Yes, with a Try-it | Must know |
| `git diff --staged` compares staged changes with the last commit | Yes, with a Try-it | Must know |
| `git diff` alone does not show all changes since the last commit; empty when everything is staged | Yes: a predict block, a Try-it, a careful note, and "When it goes wrong" | Must know |
| A file staged and then edited: `git diff` shows the unstaged part, `--cached` the staged part | Yes, with a Try-it and the three-column table | Must know, Under the hood |
| `--staged` and `--cached` are synonyms | Yes | Must know |
| A new file in `git diff --staged` (`/dev/null`, every line `+`) | Yes, in words (untracked files, and the whole-file diff in the third Try-it) | Must know |
| `git difftool` and `--tool-help` | Yes | Advanced |

The book prints diffs without explaining their format. The lesson adds that: the header lines, the `-`, `+` and context lines, and the hunk header.

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| "Your branch is up-to-date with 'origin/master'" in the book's status output | Needs remotes | `remotes` |
| The book's old status hints (`git reset HEAD`, `git checkout --`) | Not about diffs | `undo-basics` |
| Diffs between branches, and the full meaning of `A...B` | Needs branches; only named here | `branch-and-merge`, `revision-selection` |
| `git log -p` and `git show` | They print diffs per commit | `reading-history` |
| Staging part of a diff (`git add -p`) | Its own lesson | `partial-staging` |
| Line-ending warnings (`LF will be replaced by CRLF`) | Only named, with the fix deferred | `attributes` |
| Configuring a diff or merge tool | Configuration topic | `config-pro` |

## Beyond the book

- How to read the unified diff format, line by line (Git reference, `git-diff`, "Generating patch text").
- `git diff HEAD` as the third comparison, and comparing two commits with `HEAD~1` and `-- <path>`.
- `--stat`, `--name-only`, `--name-status`.
- Under the hood: diffs are computed from snapshots on demand, so a diff between two commits ignores the commits in between (Pro Git 1.3 for the snapshot model).
- `--word-diff`, `--color-words`, `-w`, `-U<n>`, `--check`, binary files.

## Challenges and quiz

- Easy, `commit-only-the-fix`: two modified files; read the diffs and commit only the bug fix. Practises reading a diff before staging.
- Medium, `what-is-staged`: an answer challenge. A staged and an unstaged change both move a closing time; only `git diff --staged` gives the right file (`north.txt`). `south.txt` is staged and edited again, so it shows in both diffs as a distractor.
- Hard, `net-change`: an answer challenge. Lines were added and removed again across four commits; the per-commit numbers add up to 4, while `git diff HEAD~3 HEAD --stat -- prices.txt` gives the right answer, 2. `README.md` also changed, so the path limit matters. Needs "Two snapshots, nothing in between" from Under the hood.
- The Try-its use their own file (`shopping.txt`) and name it in each command, so the easy challenge's two modified files stay untouched. The Try-its do add two commits; the easy challenge's goals do not depend on the commit count beyond "at least 2", and starting a challenge rebuilds the folder.
- Quiz: empty `git diff` after `git add`; reading a `-`/`+` pair; which comparison shows the next commit; a diff between two commits ignores the steps between.
