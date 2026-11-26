# Coverage: stash-and-clean

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** putting unfinished work away with `git stash` and getting it back, and deleting untracked files with `git clean`. It is the last lesson of the Branching module and builds on switching branches and on merge conflicts.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 7.3 Stashing and Cleaning | Intro, the `stash push` note, Stashing Your Work, Creative Stashing, Creating a Branch from a Stash, Cleaning your Working Directory |
| Git reference: `git-stash`, `git-clean` | `push -m`, `show -p`, `clear`, `--staged`, pathspecs, `create` / `store`; `clean -X`, `-e`, paths |

## Pro Git 7.3, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| The problem: messy state, need to switch, no half-done commit | Yes, as the opening situation | Lede, Must know |
| Stash takes modified tracked files and staged changes, onto a stack | Yes | Must know |
| `git stash save` is being replaced by `git stash push` | Yes, as a today vs. book comparison | Advanced |
| `git stash` / `git stash push` and its output | Yes, with a Try-it | Must know |
| Working directory is clean afterwards | Yes | Must know |
| `git stash list`, `stash@{n}` | Yes | Must know |
| `git stash apply`, naming an older entry | Yes | Must know |
| Applying on another branch, or on a dirty tree; conflicts if it no longer fits | Yes | Must know (other branches), When it goes wrong (conflict, overwritten) |
| Staged changes are not restaged; `--index` | Yes, with a before and after | Must know |
| `apply` keeps the entry; `git stash drop` | Yes, with a table | Must know |
| `git stash pop` | Yes, with a Try-it | Must know |
| `--keep-index` | Yes | Advanced |
| `--include-untracked` / `-u` | Yes, with a predict block and a Try-it | Must know |
| `--all` / `-a` for ignored files | Yes | Advanced |
| `--patch` | Yes, one table row | Advanced |
| `git stash branch <name>` | Yes, with real output | Advanced |
| `git clean`: what it is for, and the warning | Yes, with a careful block | Must know |
| `git stash --all` as the safer option | Yes | Advanced |
| `git clean -f -d`, `clean.requireForce` | Yes | Must know (options), When it goes wrong (the refusal) |
| `--dry-run` / `-n` | Yes, taught as the first step every time | Must know |
| Ignored files are kept; `-x` removes them | Yes | Must know |
| `-i` interactive mode | Yes, one table row | Must know |
| Nested repositories need a second `-f` | Yes, one line | Advanced |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| The interactive clean menu, step by step | Rarely needed; the dry run covers the safety need | Not taught |
| How to resolve conflict markers in depth | Taught with merging | `branch-and-merge` |
| Why Git refuses to switch branches with local changes | Taught with switching | `switch-and-detached-head` |
| The reflog in general | Only what explains `stash@{1}` | `rescue-lost-work` |
| Recovering a dropped stash entry (`git fsck`) | Recovery topic | `rescue-lost-work` |

## Beyond the book

- `git stash push -m`, `git stash show -p`, `git stash clear`, `git stash push -- <path>`, `--staged`, `create` / `store` (Git reference, `git-stash`).
- `git clean -X`, `-e` and cleaning named paths (Git reference, `git-clean`).
- Under the hood: a stash entry as two or three commits under `refs/stash`, shown with `git log --graph stash@{0}`. Pro Git does not explain this; the Git reference's "Discussion" part does.
- The four error messages in "When it goes wrong" are real Git 2.55 output.
- The advice to prefer a work-in-progress commit for long pauses.

## Challenges and quiz

- Easy, `shelve-and-fix`: stash half-done work, fix a typo and commit it, leave the entry on the shelf. The Try-its only stash and pop, so they never complete it.
- Medium, `fix-on-release`: the switch is blocked by an edited file and by an untracked one, so it needs `git stash -u`; fix on `release`, come back, pop.
- Medium, `clean-but-keep-one`: clean leftovers by path (or with `-e`) while one untracked file must survive. No goal can see the ignored `build` folder, so "leave it alone" is in the brief and hints only.
- Hard, `pop-after-the-branch-moved`: a pop that conflicts; resolve, commit, and drop the entry that `pop` kept (the "When it goes wrong" detail). Goal checks cannot read file content, so the right resolution is asked for but not verified.
- The Try-its use the easy challenge's own half-done `cart.js` for stash and pop (which puts it back exactly) and the student's own `ideas.txt` and `output.log` for `-u` and `git clean`.
- Quiz: what a plain stash leaves behind; pop vs. apply; the entry kept after a conflict; what `git clean -x` destroys.
