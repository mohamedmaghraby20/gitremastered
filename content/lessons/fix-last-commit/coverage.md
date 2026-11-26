# Coverage: fix-last-commit

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** replacing the last commit with `git commit --amend`: a new message, a forgotten file, a file that should not be in it; and the rule about commits that were already shared.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 2.4 Undoing Things | The opening part on `git commit --amend` and its two notes |
| Pro Git 7.6 Rewriting History | Changing the Last Commit (with the `--no-edit` tip) |
| Pro Git 1.3 What is Git? | Git Has Integrity (checksums), for why the ID changes |
| Git reference: `git-commit`, `git-reflog`, `git-log`, `git-rm` | `--amend`, `--no-edit`, `--reset-author`, `--author`, `--date`, `--fixup`; the reflog; `--format=fuller`; `rm --cached` |

## Pro Git 2.4 (amend part), point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Committing too early: forgotten files or a wrong message | Yes, as the two everyday mistakes | Must know |
| `git commit --amend` uses the staging area for the commit | Yes | Must know (Add a forgotten file) |
| With no changes staged, only the message changes | Yes | Must know (Fix the message), When it goes wrong |
| The editor opens with the previous message | Yes, with the real template | Must know |
| The `git add forgotten_file` then `--amend` example; one commit results | Yes, with a Try-it | Must know |
| Note: you are replacing the commit, not fixing it | Yes, twice: in words and as before/after diagrams | Must know, Under the hood |
| Note: the value is no "oops" commits in the history | Yes | Lede |
| Note: only amend commits that are local and not pushed | Yes, with a three-step example of what goes wrong | Must know |
| Unstaging and discarding (rest of 2.4) | No | `undo-basics` |

## Pro Git 7.6 "Changing the Last Commit", point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Two things to change: the message, or the content (adding, removing, modifying files) | Yes; removing has its own part | Must know |
| Amending changes the SHA-1; do not amend a pushed commit | Yes | Must know, Under the hood |
| An amended commit may need an amended message | Yes | Must know (end of Add a forgotten file) |
| `--no-edit` for trivial amendments | Yes | Must know |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Changing older commits, interactive rebase (rest of 7.6) | Its own lesson | `clean-up-history` |
| What happens when rewritten commits were pushed, and how to recover | Needs remotes and rebase | `rebasing`, `force-push-safely` |
| `git reset` in general | Shown once as a preview, with a warning | `reset-demystified` |
| Undoing a commit that was already pushed | Pointer only | `revert-a-commit` |
| Finding lost commits in depth | Pointer only | `rescue-lost-work` |

## Beyond the book

- Taking a file out of the last commit with `git rm --cached` plus amend, and why a pushed password must still be changed.
- Author date and commit date after an amend (`git log --format=fuller`).
- Where the replaced commit goes: `.git/objects`, the reflog, `HEAD@{1}`.
- `--reset-author`, `--author`, `--date` (Git reference, `git-commit`).
- An amend that changes nothing, as a demonstration of the checksum.

## Checked on this machine (Git 2.55)

- `git commit --amend` does not set `ORIG_HEAD`, so the lesson uses `HEAD@{1}` to take an amend back.
- Amending with nothing staged and the same message, twice in the same second, gives the same commit ID.

## Challenges and quiz

- Easy, `fix-the-typo`: correct the last commit's message; the count stays at two and the typo is gone from `main`.
- Medium, `forgotten-stylesheet`: stage the forgotten file and amend with `--no-edit`.
- Hard, `secret-in-the-commit`: take a password file out of the last commit, keep it on disk, and change the message in the same amend.
- The Try-its use the student's own files (`todo.txt`, `contacts.txt`) and their own new commit, so the "Add hompage" commit of the easy challenge stays as it is. A student who starts the easy challenge after the Try-its gets a fresh project.
- Quiz: what changes after an amend; a pushed commit; what `--no-edit` does; amending without staging.
