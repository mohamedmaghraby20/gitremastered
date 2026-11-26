# Coverage: remove-move-files

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** deleting and renaming tracked files so the next commit records it: plain `rm` and `mv`, `git rm`, `git mv`, and how Git detects a rename.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 2.2 Recording Changes to the Repository | Removing Files, Moving Files (all of both) |
| Git reference: `git-rm`, `git-mv`, `git-log`, `git-diff`, `git-commit` | `rm -r` / `-n` / `-q` / `-f`, the refusal messages, `mv -n` / `-f`, `log --follow`, the default 50% similarity for renames, `commit -a` and deletions |

## Pro Git 2.2 "Removing Files", point by point

| Book point | In the lesson | Layer |
|---|---|---|
| To remove a file you remove it from the staging area and commit | Yes | Must know |
| Plain `rm` shows the file under "Changes not staged for commit" | Yes, with a predict block and a Try-it | Must know |
| `git rm` then stages the removal | Yes, plus `git add` doing the same | Must know |
| `git rm` also deletes the file from the working directory | Yes ("One step") | Must know |
| Modified or staged files need `-f`; a safety feature | Yes, with the real messages and both ways out | Must know, When it goes wrong |
| `--cached` keeps the file on disk | Yes, briefly; `ignoring-files` already taught the `.gitignore` case | Must know |
| Files, directories and file-glob patterns | Yes: `-r`, the "not removing recursively" refusal, a pattern | Must know |
| The backslash before `*` and why | Yes, with a side-by-side dry run | Must know |
| `git rm \*~` example | Covered by the `\*.log` example | Must know |

## Pro Git 2.2 "Moving Files", point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Git does not explicitly track file movement; no metadata is stored | Yes | Must know (plain words), Under the hood (index lines) |
| `git mv file_from file_to` | Yes, with a Try-it | Must know |
| Status shows `renamed:` | Yes | Must know |
| Equivalent to `mv`, `git rm`, `git add` | Yes, with a Try-it doing it the plain way | Must know |
| Any tool can rename; handle add/rm before you commit | Yes | Must know, When it goes wrong |
| "Git figures it out after the fact" (detection comes later in the book) | Yes: same ID is 100%, otherwise a similarity score | Under the hood |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| "Your branch is up-to-date with 'origin/…'" in the book's output | Needs remotes | `remotes` |
| Bringing a deleted file back from an older commit | Belongs with undoing | `undo-basics` |
| `git restore` in depth | Shown once, as the way to take back a staged deletion | `undo-basics` |
| `git log` and its options | Only `--follow` is shown | `reading-history` |
| Removing a file from old commits | Rewriting history | `remove-sensitive-data` |
| Rename options of `git diff` (`-M`, `--no-renames`) | Diff detail | `diffs-in-depth` |

## Beyond the book

- `git add <file>` stages a deletion made with plain `rm` (the status hint says "git add/rm").
- A deleted file stays in older commits: good for recovery, a warning for secrets.
- The three refusal messages of `git rm` and the difference between `--cached` and `-f`.
- Rename plus edit: an 85% rename and a rewrite that shows as delete and create, from a real run; advice to keep a rename in its own commit.
- The index before and after `git rm` and `git mv` (`git ls-files --stage`).
- `git log --follow`, case-only renames on Windows and macOS, `git commit -a` with deletions and with a plain `mv`.

## Challenges and quiz

- Easy, `delete-old-plan`: remove one tracked file and commit the removal. The lesson's main skill.
- Medium, `rename-changelog`: rename `notes.txt` to `CHANGELOG.md` and commit one rename.
- Medium, `finish-the-move`: a file was moved in the editor; stage the deletion and the new path by name, because `git add -A` would also take an unfinished `README.md` edit.
- Hard, `remove-all-logs`: log files in three folders; needs a pattern with a backslash (`git rm \*.log`) so Git matches in every folder, while `logs/README.md` stays.
- The Try-its create their own files (`draft.txt`, `list.txt`), so following the lesson does not solve a challenge.
- Quiz: a deletion that was never staged; `--cached` against `git rm` and `rm`; `git mv` against a manual rename; why a rewrite hides a rename.
