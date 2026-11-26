# Coverage: checkpoint-daily-loop

A module checkpoint: a review page with no new material, and three challenges with no hints. For course reviewers; the app does not show this file.

**Scope:** the six lessons of "Your daily loop". Every row of the cheat sheet repeats something one of them teaches; nothing here is taught for the first time.

## Cheat sheet, table by table

| Table | Drawn from | Layer in that lesson |
|---|---|---|
| Start a project (`git init -b main`, `git clone`, clone into `.`, `git status` as a test) | `start-a-repo` | Must know |
| Status, stage, commit (`status`, `-s`, `add`, `add .`, `commit -m`, `commit -a`) | `three-areas` | Must know |
| `git restore --staged` | `three-areas` | Advanced (also the hard challenge there) |
| Ignore files (the four pattern forms, commit the file, tracked files unaffected) | `ignoring-files` | Must know |
| `git check-ignore -v`, `git rm --cached` | `ignoring-files` | Advanced |
| Remove and rename (`git rm`, `--cached`, `-r`, `git mv`, `git add old new`) | `remove-move-files` | Must know |
| Read the history (`log`, `--oneline`, `-3`, `--stat`, `-p`, `show`, the five filters) | `reading-history` | Must know |
| Read a diff (the three comparisons, two commits, `HEAD~1`, summaries, one file) | `diffs-in-depth` | Must know |
| The loop, in order | `three-areas` ("The daily loop"), with `diff` steps from `diffs-in-depth` | Must know |
| When it goes wrong (three messages) | `three-areas`, `start-a-repo` | Must know |

## Under the hood, idea by idea

| Idea | Drawn from |
|---|---|
| Three copies of every file | `three-areas`, `diffs-in-depth` |
| A commit is a snapshot; diffs are computed | `three-areas`, `diffs-in-depth` |
| No stored renames or deletions; old commits keep the file | `remove-move-files` |
| `.gitignore` only filters untracked files | `ignoring-files` |
| Log walks backwards from HEAD | `reading-history` |

## Left out on purpose

| Point | Why |
|---|---|
| Vim and `core.editor` | A first-commit detail; it stays in `three-areas` |
| Glob details (`**`, character classes), global ignore files | Reference material; they stay in `ignoring-files` |
| `--pretty=format:`, `--follow`, `-L`, `shortlog` | Rarer history options; they stay in `reading-history` |
| `--word-diff`, `-w`, `--check`, two and three dots | Rarer diff options; they stay in `diffs-in-depth` |
| Clone options (`-b`, `-o`, `--depth`, `--bare`) | They stay in `start-a-repo` |

## Challenges

No hints (course map, rule 4). Each needs commands from at least two lessons, and none repeats a lesson's own challenge.

| Challenge | Lessons it draws on | What it tests |
|---|---|---|
| Easy, `first-clean-commit` | `start-a-repo`, `ignoring-files`, `three-areas` | Starts with no repository: `git init -b main`, a `.gitignore` for a folder and a file pattern, one clean first commit |
| Medium, `tidy-in-two-commits` | `remove-move-files`, `three-areas` | A rename and a removal as two commits, while an unrelated edit stays out of both |
| Hard, `find-and-untrack-the-secret` | `reading-history`, `ignoring-files`, `remove-move-files` | Find the commit that added a file (`git log -- <path>`), answer with its ID, then `git rm --cached`, ignore, commit |

Notes on the goals:

- The easy challenge starts without a repository, so its setup cannot set an identity. A student with no global name and email must set one first (the Setup lesson).
- In the easy challenge the ignored files are checked through `file-is-not-committed` and `working-folder-clean`: if `build/` or `debug.log` is neither committed nor ignored, `git status` is not clean.
- In the medium challenge "the rename first" is asked for but not checked; the goals check two new commits and the final state.
- In the hard challenge, "the file must stay on your disk" is asked for but not checked: once secrets.env is ignored, no goal check can see it.
- In the hard challenge `working-folder-clean` is what proves `secrets.env` is ignored: after `git rm --cached` an unignored file shows as untracked. `answer.txt` is kept out of `git status` through `.git/info/exclude`.

## Quiz

Four questions, each crossing two lessons: finishing an editor rename while keeping another edit out (`remove-move-files`, `three-areas`); which diff shows the next commit (`diffs-in-depth`, `three-areas`); `.gitignore` and a tracked file (`ignoring-files`, `remove-move-files`); `-S` against `--grep` and a two-commit diff (`reading-history`, `diffs-in-depth`).
