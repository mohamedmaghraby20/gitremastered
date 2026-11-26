# Coverage: branch-and-merge

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** bringing one branch into another with `git merge`: the fast-forward, the merge commit, and a basic conflict from start to finish.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 3.2 Basic Branching and Merging | All of it: Basic Branching, Basic Merging, Basic Merge Conflicts |
| Git reference: `git-merge`, `git-merge-base`, `git-ls-files`, `git-restore`, `git-config` (`merge.conflictStyle`) | `--no-edit`, `--abort`, `--no-ff`, `--ff-only`, `--squash`, `ORIG_HEAD`, `merge-base`, `ls-files -u`, `restore --ours/--theirs`, `zdiff3`, `log --merge`, `diff --check` |

## Pro Git 3.2, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| The story: work on an issue branch, an urgent hotfix arrives, fix it on its own branch, merge, go back | Yes, as the lede and the practice project (a `hotfix` branch ready to merge) | Must know |
| `git checkout -b iss53` makes a branch and switches | Taught in "Switching branches and detached HEAD"; here as a today/book comparison (`git switch -c`) | Must know (compare) |
| Committing moves the branch you have checked out | Taught in "Branches are just pointers"; shown in the Try-its' picture cues | Must know |
| Switching with uncommitted changes can be refused; keep a clean state | Belongs to the switching lesson; here the matching merge error ("local changes would be overwritten by merge") | Must know (When it goes wrong) |
| Switching resets the working directory to that branch's last commit | Shown in the first Try-it (`hours.txt` disappears on `main`, returns after the merge) | Must know |
| `git merge hotfix`: "Fast-forward", the pointer just moves | Yes, explained twice (diagram and Try-it), with the real output read line by line | Must know |
| Why a fast-forward is possible (one commit reachable from the other) | Yes, plainly in Must know and through the merge base | Must know, Under the hood |
| `git branch -d hotfix` after merging | Yes | Must know |
| The hotfix is not in the issue branch until you merge `master` into it or merge later | Yes, as "the branch you name does not move" and the wrong-direction entry | Must know |
| `git merge iss53`: "Merge made by the 'recursive' strategy." | Yes, with today's `ort` output and a compare block | Must know |
| Three-way merge: two tips and the common ancestor | Yes | Must know (two parents), Under the hood (merge base, three-way table) |
| Merge commit: a commit with more than one parent | Yes, with `git cat-file -p HEAD` | Must know, Under the hood |
| Conflict output: `CONFLICT (content)`, "Automatic merge failed" | Yes, real output | Must know |
| Git paused; no merge commit yet | Yes | Must know |
| `git status` during a conflict: "Unmerged paths", "both modified" | Yes, real output | Must know |
| Conflict markers and which side is which | Yes, read in three parts | Must know |
| Resolve by choosing a side or writing a mix; remove the markers | Yes | Must know |
| `git add` marks a file as resolved | Yes | Must know, Under the hood (stage numbers) |
| `git mergetool` | Yes, briefly | Advanced |
| "All conflicts fixed but you are still merging" | Yes, real output | Must know |
| `git commit` finishes; the default merge message | Yes, with `--no-edit` | Must know |
| Add details to the merge message when useful | One line (the editor opens so you can change it) | Must know |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| `git branch --merged`, `-D`, renaming | Branch housekeeping | `branch-management` |
| Stashing before a merge | Named as a third way out | `stash-and-clean` |
| What `git reset --hard ORIG_HEAD` does in detail | Only the command and its risk are given | `reset-demystified` |
| Reverting a merge that was already shared | Needs `git revert -m` | `revert-a-commit` (Advanced), `advanced-merging` |
| Merge strategies and options (`-X ours`, `-s`), renames, whitespace, rerere | Rare cases | `advanced-merging` |
| Rebase as the other way to integrate | Its own lesson | `rebasing` |
| Squash vs merge commit as a team choice | Only what `--squash` does | `pr-merge-strategies` |

## Beyond the book

- `--no-edit`, because the merge message editor surprises students (Git reference, `git-merge`).
- `git merge --abort`, shown in `git status`'s own hints.
- "When it goes wrong": `Already up to date.`, "local changes would be overwritten by merge", "You have not concluded your merge (MERGE_HEAD exists)", merging in the wrong direction and `ORIG_HEAD`.
- Under the hood: `git merge-base`, `.git/MERGE_HEAD`, stage numbers 1/2/3 with `git ls-files -u` (Pro Git covers these in 7.8 Advanced Merging).
- Advanced: `--no-ff`, `--ff-only`, `--squash`, `merge.conflictStyle zdiff3`, `git restore --ours/--theirs`, `git log --merge`, `git diff --check`.

## Challenges and quiz

- Easy, `ship-the-hotfix`: `hotfix` is one commit ahead of `main`; merge it (a fast-forward) and delete the branch. This is also the starting state of the Try-its, which use branches of their own (`try-hours`, `try-menu`, `try-late`) and leave `hotfix` alone.
- Medium, `merge-the-menu`: both branches moved, in different files, and the student starts on the wrong branch. A goal fails if `main` is merged into `menu`.
- Hard, `opening-hours-clash`: two files conflict. One needs a hand-written line; the other is one whole side, which points to "Take one whole side of a file" in Advanced.
- Goal checks cannot read file content, so the hard challenge accepts any resolution that finishes the merge.
- Quiz: which branch receives a merge; fast-forward or merge commit; which side of the markers is which; what `--abort` does.
