# Coverage: remove-sensitive-data

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** taking a file (a secret or a huge file) out of history: rotate first, the amend case, the full rewrite with `git filter-repo` (recommended) and `git filter-branch` (practised, because it ships with Git), the local clean-up, force-pushing, the team, what GitHub still holds, and prevention.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 7.6 Rewriting History | The Nuclear Option: filter-branch (the caution, Removing a File from Every Commit; the two other filters in two lines) |
| Pro Git 10.7 Maintenance and Data Recovery | Removing Objects |
| GitHub Docs: Removing sensitive data from a repository | Rotate first, side effects, filter-repo commands, force push, Support, forks, cached views, pull request refs, prevention |
| Git reference: `git-filter-branch` | The warning and `FILTER_BRANCH_SQUELCH_WARNING`, `--tag-name-filter cat`, `--prune-empty`, `-f`, `refs/original`, the checklist for shrinking a repository |
| Git reference: `git-gc`, `git-reflog`, `git-count-objects`, `git-update-ref` | `--prune=now`, `expire --expire=now --all`, `-vH`, `-d` |
| git-filter-repo manual | `--invert-paths`, `--path`, `--replace-text`, fresh clone, removal of `origin` |

All console blocks were produced with Git 2.55 (and git-filter-repo 2.47) in a scratch repository. Progress lines of filter-branch are shown as the terminal leaves them (they overwrite each other); a few blocks are excerpts (the hint lines of a rejected push, the `origin` notice of filter-repo).

## Pro Git 7.6 "The Nuclear Option", point by point

| Book point | In the lesson | Layer |
|---|---|---|
| filter-branch rewrites large parts of history in a scriptable way | Yes | Must know |
| Do not use it on public history others built on | Yes, as the team section and its cost | Must know |
| Caution: filter-branch has many pitfalls; use git-filter-repo | Yes, table and compare block; filter-repo is taught first | Must know |
| Removing a file from every commit: huge binary by `git add .`, or a password file | Yes, both cases | Must know, Advanced (huge file) |
| `--tree-filter 'rm -f passwords.txt' HEAD` | Yes, in the compare block and explained against `--index-filter` | Must know, Under the hood |
| "Rewrite …" and "Ref … was rewritten" output | Yes, real output | Must know |
| Removing editor backup files with a glob | Left out | See below |
| Try on a testing branch, then hard-reset | Replaced by: check the result, undo from `refs/original` | Must know (When it goes wrong) |
| `--all` for all branches | Yes | Must know |
| `--subdirectory-filter` | Two lines | Advanced |
| `--commit-filter` to change email addresses; every SHA-1 changes because commits hold their parents' IDs | Two lines; the parent-ID reason in full | Advanced, Under the hood |

## Pro Git 10.7 "Removing Objects", point by point

| Book point | In the lesson | Layer |
|---|---|---|
| A clone downloads all history, so one huge file costs every clone for ever, even after it is deleted | Yes | Lede, Advanced |
| The technique is destructive: every commit since the earliest changed one is rewritten; contributors must be told | Yes | Must know |
| Add a big file, remove it, `git gc`, `git count-objects -v`, `size-pack` | Yes, with `-vH` and real output | Advanced |
| Find the big object with `git verify-pack` and `sort` | Replaced by `rev-list --objects` piped to `cat-file --batch-check`; verify-pack named | Advanced |
| `git rev-list --objects --all` to find the file name | Yes | Advanced |
| `git log --oneline --branches -- <file>` to see which commits touched it | Yes (`git log --oneline -- <file>`, `--all`) | Must know, Advanced |
| `filter-branch --index-filter 'git rm --ignore-unmatch --cached …'`; why index-filter is faster; `--ignore-unmatch` | Yes | Must know, Under the hood |
| Limit the range with `-- 7b30847^..` | Yes | Advanced |
| The reflog and `refs/original` still hold the old commits | Yes | Must know, Under the hood |
| `rm -Rf .git/refs/original`, `rm -Rf .git/logs/`, `git gc` | Yes, as the book side of a compare block; today's commands taught | Must know, Under the hood |
| `count-objects` afterwards; loose object still there; `git prune --expire now` | Covered by `git gc --prune=now`, which prunes in one step | Must know, Advanced |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| `--tree-filter 'rm -f *~'` for editor backup files | A second example of the same option | `ignoring-files` (keeping them out) |
| `git verify-pack -v` output columns | Plumbing detail; a shorter command does the job | `packfiles-gc` |
| How packfiles and `git gc` work in general | Only `--prune=now` is needed here | `packfiles-gc` |
| The reflog and `git fsck` in depth | Used, not taught | `rescue-lost-work` |
| `--force-with-lease` | A full rewrite replaces every branch on purpose; the safer option is for daily work | `force-push-safely` |
| Rebasing unpushed work onto the new history | Named only | `rebasing` |
| Push protection and secret scanning set-up | Named as prevention | `issues-projects-security` |
| `--env-filter`, `--msg-filter` and the other filters | Rare; filter-repo is the tool to learn | Not in the course |

## Beyond the book

- Rotate or revoke first, and "rotation may be enough" (GitHub Docs).
- The last-commit case with `git rm --cached`, `.gitignore` and `git commit --amend` (builds on `fix-last-commit`).
- `git filter-repo`: install, `--invert-paths --path`, fresh clone, `--replace-text`, `--sensitive-data-removal` (GitHub Docs, filter-repo manual).
- `--tag-name-filter cat`, `--prune-empty`, `-f`, the squelch variable (Git reference).
- `git push --force --all` and `--tags`; re-clone, never merge old clones; forks, cached views, pull request refs and GitHub Support (GitHub Docs).
- filter-branch with `--all` also rewrites remote-tracking refs, so `git status` can be wrong about the server (observed with Git 2.55).
- Prevention list (GitHub Docs).

## Challenges and quiz

- Easy, `secret-in-last-commit`: `git rm --cached`, `.gitignore`, `git commit --amend`. The commit count must stay 3, so a separate "remove" commit fails, and so does deleting without ignoring.
- Medium, `secret-three-commits-deep`: filter-branch with `--index-filter` and `-- --all`, then a `.gitignore` commit as the second step.
- Hard, `secret-on-two-branches-and-a-tag`: needs `-- --all` for the second branch and `--tag-name-filter cat` (Advanced) for the annotated tag; without the tag filter, v1.0 still reaches the old "Add payment" and the first goal fails.
- `file-is-in-no-commit` ignores commits that only the reflog or `refs/original` reach, so the clean-up (`update-ref -d`, `reflog expire`, `gc`) is taught in a Try-it but not required to pass.
- Try-its use the student's own `token.txt` and `db-password.txt` on top of the easy challenge's starting state; every challenge rebuilds the folder. No challenge uses a remote or a global setting.
- Quiz: what to do first after a leak; why the file still shows after filter-branch; which commit IDs change; what an old clone does after a rewrite.
