# Coverage: reset-demystified

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** `git reset` at commit level: the three trees, the three steps, `--soft` / `--mixed` / `--hard`, squashing, getting a commit back, and when to use revert instead. Path-level reset and the comparison with checkout are in Advanced.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 7.7 Reset Demystified | The Three Trees, The Workflow, The Role of Reset (steps 1 to 3, Recap), Reset With a Path, Squashing, Check It Out, Summary |
| Git reference: `git-reset` | `--keep`, `--merge`, `-p`, `ORIG_HEAD` |
| Git reference: `git-reflog`, `git-gc` | Reset-away commits stay findable; unreachable reflog entries expire after about 30 days |

## Pro Git 7.7, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| "Tree" means a collection of files; the three trees table (HEAD, Index, Working Directory) | Yes, as a definitions block tied to the three areas | Must know |
| HEAD is the last commit snapshot and the next parent | Yes | Must know |
| `git cat-file -p HEAD`, `git ls-tree -r HEAD` to look at the HEAD snapshot | Left out | See below |
| The index is the proposed next commit; `git ls-files -s` | Yes (the idea); `ls-files` is in `three-areas` | Must know |
| The working directory is a sandbox | Yes | Must know |
| The workflow: v1, v2 moving through the trees; status compares the trees | Yes, shortened to one paragraph | Must know |
| Checking out a branch fills the three trees | Pointer only | Advanced (Reset and checkout) |
| Example history with v1, v2, v3 | Yes, as `plan.txt`, with a table and graphs | Must know |
| Step 1: move the branch HEAD points to; `--soft` stops; it undoes `git commit` | Yes, with a Try-it | Must know |
| Soft reset plus commit equals `--amend` | Yes | Must know |
| Step 2: update the index; `--mixed` is the default; it undoes `git add` too | Yes, with a Try-it | Must know |
| Step 3: update the working directory; `--hard` | Yes, with a Try-it | Must know |
| `--hard` is the one dangerous form; committed work is recoverable by reflog, uncommitted is not | Yes, careful block and its own part | Must know |
| Recap: the three steps in order | Yes, as the numbered list | Must know |
| Reset with a path skips step 1; `git reset file.txt` unstages; opposite of `git add` | Yes, with a today vs. book comparison | Advanced |
| `git reset <commit> file` | Yes | Advanced |
| `--patch` | Yes | Advanced |
| Squashing with `git reset --soft HEAD~2` | Yes, with real output and a graph | Must know |
| checkout vs reset without paths: working-directory safe; moves HEAD, not the branch | Yes, short table | Advanced, plus Under the hood (HEAD file unchanged) |
| checkout with paths | Left out | See below |
| Summary cheat-sheet | Yes, the commit-level reset rows | Must know |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| `git cat-file -p HEAD`, `git ls-tree` | Plumbing; not needed to use reset | `first-look-inside`, `objects-deep` |
| `git checkout <commit> <paths>` | Replaced by `git restore` | `undo-basics` |
| Full branch switching | Its own lesson | `switch-and-detached-head` |
| The reflog in depth, `git fsck` | Preview only here | `rescue-lost-work` |
| Revision syntax beyond `HEAD~n` | One line here | `revision-selection` |
| Squashing with interactive rebase | Another tool for the same job | `clean-up-history` |
| Why pushed history must not be rewritten, force-push | Needs remotes; the rule is stated | `remotes`, `force-push-safely` |

## Beyond the book

- `ORIG_HEAD` and `git reset --hard ORIG_HEAD` (Git reference, `git-reset`): the quickest way back after a wrong reset.
- `git reset --keep` and `--merge` (Git reference), in two lines each.
- A decision table across restore, amend, reset and revert, closing the module.
- Untracked files survive `--hard`: a common surprise.

## Challenges and quiz

- Easy, `committed-too-early`: `git reset --soft HEAD~1`; the goal "checkout.js is staged" fails with `--mixed` or `--hard`.
- Medium, `two-halves-one-commit`: squash two commits with `git reset --soft HEAD~2` and a new commit.
- Hard, `one-reset-too-far`: the setup has already run `git reset --hard HEAD~3`. The student finds "Fix price rounding" in the reflog and resets forward to it with `--hard`; `--soft` or `--mixed` leaves `git status` dirty.
- Try-its use the student's own `plan.txt` on top of the easy challenge's starting state, and every challenge rebuilds the folder.
- Quiz: choosing the option for splitting a commit; what `--hard` loses; getting commits back; reset vs revert on shared commits.
