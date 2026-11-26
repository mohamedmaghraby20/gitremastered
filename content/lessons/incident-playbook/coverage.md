# Coverage: incident-playbook

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** a playbook for Git accidents. The same first steps for every incident (stop, status, log, note IDs, backup branch), then five recipes: commits on the wrong branch, a rebase that went wrong, a merge that should not have happened, a force-push that dropped teammates' commits (in words), and a committed file that should be ignored.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 7.8 Advanced Merging | Undoing Merges: Fix the references, Reverse the commit (incl. re-merging after a reverted merge) |
| Pro Git 7.7 Reset Demystified | The three steps of `reset --hard`, as applied to moving a branch back; "never on shared history" |
| Git reference: `git-reflog` | `git reflog` (HEAD), `git reflog show <ref>`, `<ref>@{n}`, log options such as `--date=relative` |
| Git reference: `git-reset`, `git-rebase`, `git-merge`, `gitrevisions` | `ORIG_HEAD` (written by reset, merge, rebase), `--abort`, `HEAD~` follows the first parent, `<ref>@{time}` |
| Git reference: `git-revert`, `git-cherry-pick`, `git-branch`, `git-rm`, `git-push`, `git-gc` | `-m parent-number`, `cherry-pick --continue/--abort`, `branch -f`, `rm --cached`, the forced-update line of `git push`, reflog expiry (90 and 30 days) |

## Pro Git 7.8 "Undoing Merges", point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Mistaken merges can be fixed; two approaches depending on the outcome you want | Yes, as "one question: has anyone else got the merge?" | Must know (Recipe 3) |
| Fix the references: `git reset --hard HEAD~` when the merge is only local | Yes, with real output | Must know |
| Refresher: the three steps of `reset --hard` | Pointer to `reset-demystified`; not repeated | Must know (link) |
| Downside: rewrites history, avoid when others have the commits | Yes | Must know (careful) |
| Also fails when other commits were created since the merge | Yes | Must know (careful) |
| Reverse the commit: `git revert -m 1 HEAD` | Yes, with real output, a graph and a Try-it | Must know |
| `-m 1` names the mainline parent; parent 1 is HEAD at merge time, parent 2 the merged tip | Yes, short in Must know, in full with `%p` output | Must know, Under the hood |
| The revert commit has the same content as parent 1; the unmerged commits stay in history | Yes | Under the hood |
| Merging the branch again: "Already up to date" | Yes, real output | Advanced, flagged by a careful block in Must know |
| New work on the branch: only changes since the reverted merge come in | Yes, real output | Advanced |
| Fix: revert the revert, then merge again | Yes, real output (today's message is `Reapply …`) | Advanced |

## Pro Git 7.7 "Reset Demystified", points used

| Book point | In the lesson | Layer |
|---|---|---|
| Reset moves the branch HEAD points to | Yes: every recipe is "move the label" | Must know, Under the hood |
| `--hard` overwrites the working directory; check for uncommitted work first | Yes, in the first steps and in Recipe 1's careful block | Must know |
| Commits reset away can be recovered through the reflog | Yes | Must know (Recipe 2), Under the hood |
| The three trees, `--soft`, `--mixed`, reset with a path, squashing, checkout comparison | Left out | See below |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| The three trees and the reset options in full | Taught one lesson earlier; this lesson applies them | `reset-demystified` |
| The reflog in depth, `git fsck`, dangling objects | Its own lesson | `rescue-lost-work` |
| Rebase itself, interactive rebase | Only "what it is" in two lines here | `rebasing`, `clean-up-history` |
| Cherry-pick in depth (ranges, `-x`) | One worked example here | `integrating-work` |
| `--force-with-lease`, how to force-push safely | Prevention is its own lesson | `force-push-safely` |
| Removing a file from all of history | Needs history rewriting tools | `remove-sensitive-data` |
| Other parts of 7.8 (conflict tools, strategies, subtree) | Not about undoing | `advanced-merging` |
| Plain `git revert` of ordinary commits | Taught earlier | `revert-a-commit` |

## Beyond the book

- The first-steps routine (stop, status, log, IDs, backup branch): course advice built on the book's facts that branches are pointers and committed work is recoverable.
- `ORIG_HEAD` after a rebase or merge, and that later operations overwrite it (Git reference).
- `git reflog show <branch>` and `<branch>@{1}` (Git reference, `git-reflog`).
- The force-push recovery: reading `(forced update)` in the push output, a teammate's `origin/main` reflog, pushing the commits back without force (Git reference, `git-push`, `git-reflog`).
- `git rm --cached` plus `.gitignore` as an incident recipe (the command is taught in `ignoring-files` and `remove-move-files`).
- `git branch -f`, `--date=relative`, `main@{yesterday}` in Advanced.

## Console output

All output was produced with Git 2.55 in scratch repositories. One path was shortened: the `fatal: cannot force update the branch 'main' used by worktree at …` line shows `C:/practice/project` in place of the scratch folder's long path.

## Challenges and quiz

- Easy, `search-on-the-wrong-branch`: three commits on `main` move to `feature-search` (`git branch`, then `git reset --hard HEAD~3`). Goals check both branches.
- Medium, `rebase-ate-two-commits`: the setup runs `git rebase --onto main HEAD~1`, which drops two of three commits. `git reset --hard ORIG_HEAD` (or the reflog ID) restores the branch; the goal "Update README is not in checkout's history" fails if the student only cherry-picks the lost commits back.
- Hard, `undo-a-shared-merge`: a merge commit with two later commits on top. The student finds the merge's ID and runs `git revert -m 1 <id>`; a reset fails the "still in the history" goals. Needs "Parent 1 and parent 2" from Under the hood.
- No challenge uses a remote. Try-its build their own `wishlist` branch and files on top of the easy challenge's starting state, and every challenge rebuilds the folder.
- Quiz: first steps before a risky fix; why "branch first, reset second"; reset vs `revert -m 1` on a shared merge; re-merging after a reverted merge.
