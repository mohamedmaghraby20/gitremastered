# Coverage: advanced-merging

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** the conflict you cannot settle at a glance (seeing the base, the commits behind it, one whole side, the combined diff), merges settled by a rule (`-X` options, `-s ours`), taking a merge back, subtree merges in short, and rerere.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 7.8 Advanced Merging | Merge Conflicts (Aborting a Merge, Ignoring Whitespace, Manual File Re-merging, Checking Out Conflicts, Merge Log, Combined Diff Format), Undoing Merges (as a pointer), Other Types of Merges (Our or Theirs Preference, Subtree Merging) |
| Pro Git 7.9 Rerere | All of it |
| Git reference: `git-merge`, `git-restore`, `git-rerere`, `git-config` (`merge.conflictStyle`, `rerere.enabled`, `rerere.autoUpdate`), `git-merge-file`, howto "using-merge-subtree" | `git restore --conflict` / `--merge` / `--ours` / `--theirs`, `zdiff3`, `--allow-unrelated-histories`, `git rerere forget`, `rerere.autoUpdate` |

All console blocks were produced with Git 2.55 in a scratch repository that follows the Try-it steps.

## Pro Git 7.8, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Merge often, so conflicts stay small | Yes | Must know (Two habits) |
| Git does not try to be clever about resolving conflicts | Implied by the whole lesson; not stated on its own | — |
| Start with a clean working directory; commit or stash first | Yes | Must know (Two habits, and the careful block on `--abort`) |
| The whitespace example (`unix2dos`, every line changed) | Yes, with a re-indented file instead of DOS line endings, so it can be shown and checked on any system | Must know |
| `git merge --abort`, `git status -sb` before and after | Yes, real output | Must know |
| `--abort` may not restore uncommitted changes | Yes | Must know (careful) |
| `git reset --hard HEAD` to start over | Covered by `--abort`; `reset --hard` appears for undoing a finished merge | Must know (Take a merge back) |
| How to recognise a whitespace conflict (every line removed and added) | Yes | Must know |
| `-Xignore-all-space`, `-Xignore-space-change` and the difference | Yes | Must know |
| The ignore-space merge leaves mixed whitespace | Yes, shown as "both indents" | Must know, Advanced |
| Stages 1, 2, 3 in the index; `git show :1:file` | Yes, real output | Under the hood |
| `git ls-files -u` | Taught in `branch-and-merge` (Under the hood); referred to | Under the hood |
| Manual re-merge with `git merge-file -p` | Yes, as a recipe | Advanced |
| `git diff --ours`, `--theirs`, `--base` | Yes | Advanced |
| `git clean -f` to remove the helper files | One line | Advanced |
| `git checkout --conflict=diff3`, the base in the markers | Yes, as `git restore --conflict=diff3` with a compare block | Must know |
| `--conflict` resets the markers so you can try again | Yes, with `git restore --merge` | Must know |
| `merge.conflictstyle diff3` | Yes, as `zdiff3` (compare block names the book's value) | Must know |
| `git checkout --ours` / `--theirs`; good for binary files | Yes, as `git restore --ours/--theirs` with a compare block | Must know |
| `git log --oneline --left-right HEAD...MERGE_HEAD` | Left out (needs the triple-dot range) | See "Left out" |
| `git log --oneline --left-right --merge`, and `-p` | Yes, real output | Must know |
| `git diff` in a conflict shows only what is still conflicted | Yes | Must know |
| Combined diff: two columns, before and after resolving | Yes, the resolved form with a table of the column meanings; the unresolved form is mentioned (`++<<<<<<<`) | Must know |
| `git show` on a merge, `git log --cc -p` | Yes | Under the hood |
| Undoing a merge: `git reset --hard HEAD~` and when it is wrong | Yes, short, with a graph | Must know |
| Undoing a merge: `git revert -m 1 HEAD`, what `-m 1` means | Yes, short, with a graph; the full treatment is in `revert-a-commit` | Must know |
| After the revert, `git merge topic` says "Already up-to-date"; revert the revert | Yes | Must know (When it goes wrong), Advanced |
| `-Xours` / `-Xtheirs`: conflicts go to one side, the rest merges | Yes, with a predict block and real output | Must know |
| `git merge-file --ours` | Left out (rare) | See "Left out" |
| `-s ours`: a fake merge; the difference from `-Xours` | Yes | Under the hood (strategy vs option), Advanced |
| The backport use of `-s ours` | Yes, in short | Advanced |
| Subtree merging: idea, `read-tree --prefix`, `-Xsubtree`, trade-offs against submodules | Yes, in short, with today's working recipe | Advanced |
| `git diff-tree -p rack_branch` to compare the subfolder | Left out | See "Left out" |

## Pro Git 7.9, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| What rerere means and does | Yes | Must know |
| Use cases: trial merges of a long-lived branch, rebase after merge, rebuilt test branches | Yes, one paragraph | Must know |
| `git config --global rerere.enabled true` | Yes, taught as a local setting first; the global form is named | Must know, Advanced |
| Creating `.git/rr-cache` by hand also turns it on | Left out (the setting is clearer, as the book says) | See "Left out" |
| "Recorded preimage for FILE" | Yes, real output | Must know |
| `git rerere status` | Yes | Under the hood |
| `git rerere diff`, before and after resolving | Yes, the after form, real output | Under the hood |
| "Recorded resolution for FILE" on commit | Yes, real output | Must know |
| Undo the merge with `git reset --hard HEAD^`, hit the conflict again, "Resolved FILE using previous resolution" | Yes, as the key Try-it, with a merge instead of a rebase | Must know |
| The file is resolved but still needs `git add` | Yes, in the predict block and in When it goes wrong | Must know |
| `git diff` shows how it was re-resolved | Covered by the combined diff part | Must know |
| `git checkout --conflict=merge` brings the conflict back; `git rerere` replays it | Yes, as `git restore --merge` and plain `git rerere` | Advanced |
| Rerere during a rebase | Named (the resolution is keyed by the conflict text, so it works in a rebase too) | Must know, Under the hood |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| `HEAD...MERGE_HEAD` (triple dot) | Needs range syntax | `revision-selection` |
| What `git reset --hard` does to the three trees | Only the command and its risk | `reset-demystified` |
| `git revert` in general, `-m` in detail | Pointer only, as the brief asks | `revert-a-commit` |
| A broken merge handled as an incident, from start to finish | Its own lesson | `incident-playbook` |
| `git merge-file --ours`, `git diff-tree -p` for subtrees | Rare | Not taught; Pro Git 7.8 |
| Turning rerere on by creating `.git/rr-cache` | The setting does the same and is visible | Not taught |
| Rebase conflicts | Its own lesson | `rebasing` |
| Line endings (`core.autocrlf`, `.gitattributes`, `-Xrenormalize`) | A configuration topic | `config-pro`, `attributes` |
| Submodules as the other way to embed a project | Its own lesson | `submodules` |
| `git mergetool` | Taught already | `branch-and-merge` (Advanced) |

## Beyond the book

- `git restore --conflict=diff3`, `git restore --merge`, `git restore --ours/--theirs`: today's forms of the book's `git checkout` commands (Git reference, `git-restore`).
- `merge.conflictStyle zdiff3` (Git 2.35).
- `ort` in the output where the book shows `recursive`.
- The `# Conflicts:` lines kept in a merge message by `--no-edit`.
- `git rerere forget`, `rerere.autoUpdate`, and that `.git/rr-cache` is local and keyed by the conflict's text (Git reference, `git-rerere`).
- Subtree merge with `--allow-unrelated-histories` (needed since Git 2.9), following Git's howto "using-merge-subtree". The book's `--squash` recipe stops on an add/add conflict in Git 2.55 when tested, so the lesson does not show it.
- "When it goes wrong": `There is no merge to abort (MERGE_HEAD missing)`, `Committing is not possible because you have unmerged files`, `is a merge but no -m option was given`, `Already up to date.` after a reverted merge.

## Challenges and quiz

- Easy, `both-steps-in-order`: both branches added a line at the same spot of `pancakes.txt`. Keep both, and swap them: Git puts ours first, the recipe needs theirs first. `file-contains` checks the four lines in order; three `file-lacks` goals check the markers. This is also the starting state of the Try-its, which use `tea.txt` and the branch `try-strong` and leave `frying` alone.
- Medium, `one-side-each`: two conflicted files. `waffles.txt` is taken whole from theirs, `notes.txt` whole from ours. `-Xtheirs` for the whole merge fails the `notes.txt` goals.
- Hard, `resolve-it-once`: turn on rerere locally, resolve the `honey` conflict on `main`, then merge `honey` into `print-edition`, where rerere fills in the answer. The hints point to "What rerere stores" in Under the hood (why a resolution carries over to another branch). The goals cannot prove that rerere, and not the student, wrote the second resolution; `config-is` proves the setting.
- The order check in the easy challenge is a multi-line `file-contains` with `\n`. A student whose editor saves the file with Windows line endings (CRLF) would not match; nano, Vim and VS Code keep the file's LF endings.
- Quiz: which command shows the base; `-Xours` against `-s ours`; reset or revert for a shared merge; what "Resolved … using previous resolution" leaves for you to do.
