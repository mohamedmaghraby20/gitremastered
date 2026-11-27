# Coverage: force-push-safely

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** publishing a rewritten branch. Why the push is rejected, what `--force` overwrites, `--force-with-lease`, the background-fetch trap with `--force-if-includes` and `push.useForceIfIncludes`, the explicit lease, the `+` refspec form, and the rule for when a force push is acceptable. The lessons "Rebasing" and "Reword, squash, reorder, split" come before it and create the rewritten branches; "Incident playbook" comes after it and repairs a force push that went wrong.

**Sources**

| Source | Sections used |
|---|---|
| Git reference: `git-push` (Git 2.55) | `--force`, `--[no-]force-with-lease` (all three forms), `--[no-]force-if-includes`, `<refspec>` (the `+` prefix), "Note about fast-forwards", `--dry-run` |
| Git reference: `git-config` | `push.useForceIfIncludes`, `receive.denyNonFastForwards`, `alias.*` |
| Pro Git 3.6 Rebasing, "The Perils of Rebasing" | Why rewritten, already pushed commits hurt the people who have them; the doubled history after a pull; `git push --force` as the way the rewritten branch reaches the server |

## Pro Git 3.6 "The Perils of Rebasing", point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Do not rebase commits that exist outside your repository and that people may have based work on | Yes, as the three-row table "When a force push is fine, and when never" | Must know |
| Rebasing abandons existing commits and creates new ones that are similar but different | Yes, one bridge sentence; taught in full in "Rebasing" | Must know |
| The person who rebased overwrites the server with `git push --force` | Yes: what `--force` does, with a graph | Must know |
| Collaborators who fetch and merge get both versions: the same change twice in the log | Yes, in the careful block on the `git pull` hint and in the quiz | Must know |
| If they push that merged history back, the rebased-away commits return to the server | Mentioned as "the old versions return" | Must know |
| The worked example with C4, C5, C6 and the team server | No | Taught in "Rebasing", which draws it |
| "Rebase When You Rebase": patch-ids, `git pull --rebase`, `pull.rebase` | Only as the advice that teammates run `git pull --rebase` after your force push | Left out, see below |
| Rebase vs. merge: the two views of history | No | Taught in "Rebasing" |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| How Git recognises a rewritten commit by its patch-id | It explains the receiving side of a force push, a lesson of its own | "Rebasing" (Advanced: rebase when you rebase) |
| Recovering commits a force push dropped | A recovery recipe, not prevention | "Incident playbook", recipe 4 |
| Turning on branch protection, rulesets, the exact refusal text GitHub prints | A GitHub setting with its own lesson; this lesson only says protection exists and what it blocks | "Branch protection, rulesets and CODEOWNERS" |
| Pull requests: what reviewers see after a force push | Needs pull requests first | The GitHub flow and code review lessons |
| `--force-with-lease` with several refs at once, `push.default=matching` | Rare today; the `+` section names the risk in one line | Not taught |
| `--no-force-with-lease`, `--no-force-if-includes` | Only undo a setting or an earlier option | Not taught |
| `receive.denyDeletes`, server-side hooks that police pushes | Server administration | "Hooks" (server-side hooks) |

## Beyond the book

Pro Git shows only `git push --force`. Everything about the lease comes from the Git reference:

- `--force-with-lease` and its three forms (no value, `=<refname>`, `=<refname>:<expect>`), and the `(stale info)` refusal.
- The reference's own warning that a background `git fetch` defeats the plain lease, and `--force-if-includes` (Git 2.30 and later) with `push.useForceIfIncludes`. The reference states that `--force-if-includes` is a "no-op" together with an explicit `<refname>:<expect>`; the lesson uses that after a cherry-pick, and the output shown was produced with Git 2.55.
- That `--force-if-includes` reads the reflog of the local branch.
- The `+<branch>` form limiting a force to one ref, from the `--force` entry of the reference.
- `receive.denyNonFastForwards` from `git-config`.

**A choice worth knowing.** After a `(stale info)` refusal the lesson keeps the teammate's commits with `git cherry-pick`, not with `git rebase origin/<branch>` or `git pull --rebase`. Tested with Git 2.55: rebasing the rewritten branch onto the server's branch either brings the old commits back (a squash replays as an empty commit and is dropped, so the server's WIP commits win) or stops on an add/add conflict with your own earlier version. Copying their commits on top of the rewritten branch is the result the student wants.

**All console output** was produced with Git 2.55.0 on Windows against a folder remote (`../origin.git`). Against GitHub only the `To` line differs.
