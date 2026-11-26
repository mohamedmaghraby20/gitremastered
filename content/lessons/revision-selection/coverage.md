# Coverage: revision-selection

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** naming one commit (short IDs, branch and tag names, ancestry with `~` and `^`, reflog names) and naming groups of commits (two dots, several points, three dots). The reflog is introduced as a source of names only; using it to recover work belongs to `rescue-lost-work`.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 7.1 Revision Selection | Single Revisions, Short SHA-1, A Short Note About SHA-1, Branch References, RefLog Shortnames, Ancestry References, Commit Ranges (Double Dot, Multiple Points, Triple Dot) |
| Git reference: `gitrevisions` | Lookup order of a ref name, `@`, `@{-N}`, `@{upstream}`, `:/text`, `<rev>:<path>`, `^@`, `^!`, date forms of `@{...}` |
| Git reference: `git-rev-parse`, `git-rev-list`, `git-reflog`, `git-log` | `--short`, `--symbolic-full-name`, `rev-list --count`, `--left-right`, `reflog show <branch>`, `log -g` |

## Pro Git 7.1, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| A commit can be named by its full 40-character ID | Yes | Must know |
| Short SHA-1: at least four characters and unambiguous | Yes, with `git show` on three lengths | Must know |
| `git log --abbrev-commit --pretty=oneline`; seven characters, longer when needed | Yes, as a today vs. book comparison with `--oneline` | Must know |
| Eight to ten characters are enough; the Linux kernel example | Yes | Must know |
| Note about SHA-1 collisions, shattered.io, the move to SHA-256 | Yes, shortened | Advanced (sidenote) |
| Branch references: a branch name stands for its tip commit | Yes, plus tags and HEAD | Must know |
| `git rev-parse` shows the ID behind a name; it is plumbing | Yes, with a Try-it | Must know |
| The reflog: a log of where HEAD and branches have been | Yes, briefly | Must know |
| `git reflog` output and `HEAD@{n}` | Yes, with a Try-it | Must know |
| `master@{yesterday}`: time-based reflog names | Yes, with a date example | Advanced |
| Reflog data only lasts a few months | Yes; the 90-day default | Must know, Under the hood |
| `git log -g` | Yes | Advanced |
| The reflog is strictly local; a fresh clone has an empty one; `HEAD@{2.months.ago}` | Yes | Must know (local), Under the hood (clone), Advanced (months) |
| Tip: the reflog as shell history | No | The lesson calls it a private diary, the picture the course already uses |
| Note: escaping braces in PowerShell | Yes, with the real error | Must know (When it goes wrong) |
| Ancestry: `HEAD^` is the parent | Yes | Must know |
| Note: escaping the caret in `cmd.exe` | Yes, one line | Must know (When it goes wrong) |
| `^2` is the second parent; which parent is which | Yes, with a diagram and a table | Must know, Under the hood (parent lines) |
| `~` follows first parents; `HEAD~3`, `HEAD~~~` | Yes; `HEAD^^` shown in place of `HEAD~~~` | Must know |
| Combining: `HEAD~3^2` | Yes, plus `HEAD~3^2~1` | Must know |
| Double dot: reachable from one, not from the other | Yes, both directions, with a diagram | Must know |
| `git log origin/master..HEAD` before a push | Yes, as `origin/main..HEAD` | Must know |
| Leaving one side off means HEAD | Yes | Must know |
| Multiple points: `^refA`, `--not`, three equal forms, more than two refs | Yes | Under the hood |
| Triple dot: reachable from either but not both | Yes | Under the hood |
| `--left-right` | Yes | Under the hood |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Bringing back lost commits with the reflog, `git fsck` | Named in plain text only | `rescue-lost-work` |
| What Git does on a real SHA-1 collision (reuses the first object) | A curiosity; the odds are what matters | Not taught |
| Plumbing commands in general | `rev-parse` and `rev-list` are used, not explored | `plumbing-toolkit` |
| Reflog expiry settings (`gc.reflogExpire`) | Only the 90-day default is given | `rescue-lost-work` |
| `git diff` with two and three dots | One short section points back | `diffs-in-depth` |
| `--first-parent` and other history-walk options | Not in the book section | `search-blame-bisect` |

## Beyond the book

- The lookup order of a ref name and the tag-before-branch rule (Git reference, `gitrevisions`).
- `git rev-list --count`, with and without `--left-right`: counting is the usual reason to name a range in a script.
- The parent lines of a merge commit with `git cat-file -p`, to show where `^1` and `^2` come from (Pro Git 10.2 has the object format).
- `.git/logs`: where the reflog is stored (Pro Git 10.7 Data Recovery mentions it).
- More names: `@`, `@{-1}`, `@{u}`, `:/text`, `<rev>:<path>`, `^@`, `^!`.
- The real message for an ambiguous short ID, made in a test repository of 1,500 blobs.
- "When it goes wrong": the one message behind every unknown name, braces in PowerShell, and the silent empty range.

## Challenges and quiz

All five challenges share one recipe-book history with fixed authors and dates, so every answer is the same on every computer. The same project is what the Try-its read. No Try-it runs a challenge's command: the lesson shows `HEAD~1`, `HEAD~3`, `HEAD~3^2`, `main..drinks`, `main...drinks` and `drinks@{1}`; the challenges ask about `main~2`, `v1.0^2`, `v1.0..main`, `salads...drinks` and `main@{2}`.

- Easy, `two-before-main`: `main~2`. The main skill, one suffix.
- Medium, `tip-of-merged-branch`: the second parent of the `v1.0` merge, `v1.0^2`. Combines a tag name with a parent choice.
- Medium, `commits-since-release`: `git rev-list --count v1.0..main` is 7. Counting by eye along `main` gives 5, because two commits came in through a merge.
- Hard, `how-far-apart`: `salads...drinks` is 10 (Under the hood: three dots). Counting only each branch's newest commits gives 4.
- Hard, `before-the-cleanup`: `main@{2}`, found by reading `git reflog show main`. A fast-forward leaves no trace in `git log`, so only the reflog answers it (Advanced, "The reflog in git log format", explains why moves and parents differ).
- Quiz: `~2` or `^2` at a merge; which direction of two dots previews a merge; why a reflog name fails on another computer; reading `--left-right`.
