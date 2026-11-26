# Coverage: checkpoint-modern-git

The checkpoint of the module "Large repos and modern Git". For course reviewers; the app does not show this file.

**Scope:** a review page and three challenges without hints. It teaches nothing new: every row of the cheat sheet repeats something one of the module's three lessons taught, and each challenge needs commands from at least two of them.

**Sources**

The checkpoint has no sources of its own. It draws on the three lessons, which draw on Pro Git 7.11 Submodules and 7.12 Bundling, and on the Git reference for `git-worktree`, `git-clone`, `git-sparse-checkout` and `git-maintenance`.

## Cheat sheet, table by table

| Table | Lesson it repeats | Where in that lesson |
|---|---|---|
| A second folder for another branch | `worktrees` | Must know: add with `-b`, starting point, existing branch, `list`, `git -C`, remove, the one-branch rule, the finishing order; When it goes wrong: `--force`, `prune` |
| Another repository inside yours | `submodules` | Must know: `add`, `status`, clone with `--recurse-submodules`, `update --init --recursive`, `update`, `update --remote`, `submodule.recurse`, `git rm`, the "new commits" trap; Advanced: `git diff --submodule` |
| Download less of a big project | `large-repos` | Must know: `--depth 1`, `--unshallow`, `--filter=blob:none`, `sparse-checkout set` / `add` / `list` / `disable`, `bundle create` / `verify`, the "which tool" table; Advanced: `git pull <file> main`, `git maintenance start` |
| The two practice notes | `submodules`, `large-repos` | `-c protocol.file.allow=always` (sidenote and When it goes wrong); `--no-local` (Must know and When it goes wrong) |
| How to read the picture | all three | Their sidenotes and Try-its on what the picture draws |

"Under the hood" has one paragraph per idea, each from a lesson's own Under the hood layer (per-worktree HEAD and index; `.gitmodules` and the gitlink; `.git/shallow`, the promisor remote, skip-worktree; the bundle as a saved push). The paragraph "One place where the lessons do not mix" repeats the limit named in `worktrees`, Advanced, "Limits". "Advanced" only points forward: `packfiles-gc`, `objects-deep`, `attributes`, `remove-sensitive-data` and `advanced-merging` (written, linked), and the GitHub lessons (named in plain text).

## Left out on purpose

| Point | Why |
|---|---|
| `git worktree lock` / `unlock` / `move` / `repair`, `--detach` | Advanced material of `worktrees`; no challenge here needs it |
| `git submodule foreach`, `sync`, `deinit`, `--merge` / `--rebase`, `push --recurse-submodules` | Advanced material of `submodules` |
| `--single-branch`, `--shallow-since`, `tree:0`, `blob:limit`, `clone --sparse` | Advanced material of `large-repos` |
| Git LFS commands | A separate program; `large-repos` has no challenge on it either. Named in the "which tool" table only |
| Terminal output | A cheat sheet lists commands; the lessons show the output |

## Challenges and quiz

| Challenge | Level | Lessons it draws on |
|---|---|---|
| `manual-writer-setup` | easy | `large-repos` (`sparse-checkout set docs`), `worktrees` (`worktree add ../hotfix -b hotfix`) |
| `update-from-the-usb-stick` | medium | `large-repos` (`bundle verify`, `git pull <file> main`), `submodules` (the pointer moved by a pull, `git submodule update`) |
| `take-over-a-clone` | hard | `large-repos` (`fetch --unshallow`), `submodules` (`update --init`), `worktrees` (merge, `worktree prune`, `branch -d`) |

- None has hints, as the checkpoint rule asks.
- Every remote is a folder beside the project (`../game.git`, `../app.git`, `../library.git`, `../usb/`). No challenge changes a global setting.
- `manual-writer-setup` uses `file-is-missing` for files a sparse checkout left out, and `commit-count-is 3` so that committing the half-written paragraph fails. The two jobs work in either order.
- `update-from-the-usb-stick`: `working-folder-clean` is already met at the start and must be met again at the end. After the pull, `git status` shows `modified: vendor/library (new commits)`; only `git submodule update` clears it without a commit. The trap answer, `git commit -am`, makes a fourth commit and moves `main` off Omar's commit, so two goals fail. Checked with Git 2.55: the pull from the bundle fetches the library by itself ("Fetching submodule vendor/library") and `git submodule update` then works with or without the `-c` setting; the brief names the setting in case a student's Git refuses.
- `take-over-a-clone`: `commit-count-is 5` proves the history was completed (a shallow clone would give 2 after the merge). `worktree-count-is 0` is not met at the start: the app counts the records in `.git/worktrees/`, and the record of the hand-deleted folder is still there, so `git branch -d readme-fix` is refused until `git worktree prune`. This is the only place where a project has both a submodule and a worktree, and the job is to get rid of the worktree, in line with the limit the `worktrees` lesson names.
- Limits of the goal checks: `update-from-the-usb-stick` cannot tell whether the student ran `git bundle verify`. `manual-writer-setup` cannot tell `set docs` from a list that also holds another folder besides `art` and `src` (there is none in this project).

Quiz: four questions, each across two lessons: a build machine's clone of a project with a submodule (`large-repos`, `submodules`); a worktree against a second clone (`worktrees`, `large-repos`); a submodule against a sparse checkout for a heavy folder (`submodules`, `large-repos`); a bundle pull that moves a submodule pointer (`large-repos`, `submodules`).
