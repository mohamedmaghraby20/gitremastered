# Coverage: checkpoint-working-in-a-team

The checkpoint of the Working in a team module. For course reviewers; the app does not show this file.

**Scope:** a review page and three challenges without hints. It teaches nothing new: every row of the cheat sheet repeats something one of the module's eight lessons taught, and each challenge needs commands from at least two of them.

**Sources**

The checkpoint has no sources of its own. It draws on the eight lessons, which draw on Pro Git 3.4 Branching Workflows, 3.6 Rebasing, 5.1 Distributed Workflows, 5.2 Contributing to a Project, 5.3 Maintaining a Project and 6.2 GitHub: Contributing to a Project, and on GitHub Docs ("About pull request reviews", "About merge methods on GitHub").

## Cheat sheet, table by table

| Table | Lesson it repeats | Where in that lesson |
|---|---|---|
| Agree on the branches | `team-workflows` | Must know: Topic branches, Long-running branches, Three branching models; Advanced: A hotfix, step by step |
| Make commits a teammate can read | `commit-craft` | Must know: Split a mixed working tree, `git diff --check`, The shape of a commit message, Write a longer message |
| Ask for a merge: the pull request | `github-flow-prs` | Must know: Push a branch and open a pull request, Update a pull request, Draft pull requests, Link an issue, Keep your branch up to date, Merge, delete the branch, pull |
| Review, and answer a review | `code-review` | Must know: Find the pull request and read it, `gh pr checkout`, Submit the review: three outcomes, The author's seat |
| Three team setups | `team-contributing` | Must know: Setups 1 to 3, Keep your fork in sync; Advanced: After a rebase, the push needs force |
| Rebase | `rebasing` | Must know: Rebase replays your commits, When a rebase stops on a conflict, The golden rule, Undo a rebase, `git pull --rebase`; Advanced: `--onto` |
| Merge a pull request three ways | `pr-merge-strategies` | Must know: Three buttons, `gh pr merge`, After the merge; Advanced: Choose the squash commit's message |
| Bring in other people's work | `integrating-work` | Must know: See which commits a branch would bring in, three dots, `git cherry-pick`, conflict in a pick; Advanced: `-x` |

"Under the hood" has one short part per idea, each from the named lesson's own Under the hood layer. "Advanced" only points forward: `clean-up-history`, `partial-staging`, `force-push-safely`, `advanced-merging` and `revert-a-commit` (committed, linked), and the branch protection, GitHub Actions and capstone lessons (being written, named in plain text for the link pass).

## Left out on purpose

| Point | Why |
|---|---|
| Dictator and lieutenants, integration-manager by name | Explained in `team-workflows`; no command to remember |
| Conventional Commits, commit templates, trailers | `commit-craft` material; no challenge here needs it |
| `git request-pull`, patches by email | Rare today; stays in `team-contributing` |
| Line comments and suggested changes | Done in the browser; `code-review` teaches them |
| `gh pr merge --auto`, repository merge settings | Advanced material of `pr-merge-strategies` |
| Picking several commits, `-n`, `-m`, rerere | Advanced material of `integrating-work` |
| Terminal output | A cheat sheet lists commands; the lessons show the output |

## Challenges and quiz

| Challenge | Level | Runs on | Lessons it draws on |
|---|---|---|---|
| `hotfix-and-a-feature` | easy | The computer only | `team-workflows` (Git Flow hotfix from `main` into `main` and `develop`), `commit-craft` (split two jobs into two commits) |
| `one-commit-then-rebase` | medium | The computer only | `integrating-work` (`git log main..branch`, `git cherry-pick`), `rebasing` (rebase a topic branch onto the moved `main`, fast-forward), `team-workflows` (topic branch) |
| `review-rebase-squash` | hard | GitHub | `code-review` (comment review), `pr-merge-strategies` (squash twice, clean up a branch Git calls unmerged), `rebasing` (conflict in a rebase), `team-contributing` (`--force-with-lease` after a rebase), `github-flow-prs` (open a pull request, pull `main`) |

- None has hints, as the checkpoint rule asks.
- The GitHub challenge uses the practice repository `gitremastered-practice-checkpoint-working-in-a-team`. Tariq's pull request is a `teammate` step; it is opened from the student's account, so the review can only be of the kind "comment" (the brief asks for exactly that).
- Limits of the goal checks:
  - `hotfix-and-a-feature` cannot read which files a commit holds. A student who commits both files in the fix commit has nothing left for "Add gift cards", so that goal stays open unless they force an empty commit.
  - `one-commit-then-rebase` accepts a cherry-pick of the two tea commits onto `main` instead of a rebase: the history is the same shape. The fix must be picked, not merged: a merge of `tariq-desserts` fails "The unfinished dessert chapter is not in main".
  - `review-rebase-squash` cannot tell a rebase from a merge of `origin/main` into `add-tea` once the pull request is squashed and the branch deleted: both leave one commit on `main`. The brief asks for the rebase. A merge commit or a rebase-merge on GitHub fails the commit count or the straight-line goal.
  - The squash commit's title is the pull request's title plus its number, so the goal looks for the text "Add mint tea" and not for an exact title.

Quiz: four questions. The push after a rebase of a pull request's branch (`rebasing`, `team-contributing`, `github-flow-prs`), "not fully merged" after a squash (`pr-merge-strategies`), a hotfix by cherry-pick in Git Flow (`team-workflows`, `integrating-work`), and the review outcomes (`code-review`).
