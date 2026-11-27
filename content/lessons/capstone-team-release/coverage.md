# Coverage: capstone-team-release

The second capstone of the Pro path (course map 3.12, lesson 61). For course reviewers; the app does not show this file.

**Scope:** a briefing, a cheat sheet across the course, and three GitHub challenges without hints. It teaches nothing new. It proves outcomes O7 (branch, merge, resolve hard conflicts), O8 (rebase and reshape history, and know when not to) and O10 (follow a team workflow and a pull-request merge method).

**Sources**

- Pro Git 5.1 Distributed Workflows (the citation): the centralized workflow ("the second developer must merge in the first one's work before pushing") and the integration-manager workflow. Used in Under the hood ("A workflow is an agreement", "The server refuses to lose commits") and Advanced ("When you cannot push at all").
- Through the lessons it repeats: Pro Git 3.2 Basic Branching and Merging, 3.4 Branching Workflows, 3.6 Rebasing, 7.6 Rewriting History, 7.8 Advanced Merging, 2.6 Tagging, 6.2 Contributing to a Project.

## Pro Git 5.1, point by point

| Point of the book | Where |
|---|---|
| Centralized workflow: one shared repository, everyone pushes to it | Under the hood, "A workflow is an agreement"; all three challenges work this way |
| The second person to push must first merge the first one's work; the server refuses a non-fast-forward | Under the hood, "The server refuses to lose commits"; Must know, "When it goes wrong" (both rejected pushes); challenge 2 (Tariq pushed to the shared branch) |
| Integration-manager workflow (own public copy, maintainer pulls) | Under the hood (named); Advanced, "When you cannot push at all" |
| Dictator and lieutenants workflow | Left out: see below |

## Cheat sheet, table by table

| Table | Lesson it repeats |
|---|---|
| One job, one branch | `team-workflows`, `branch-and-merge`, `remote-branches`, `remotes` |
| Bring a branch up to date: rebase or merge | `rebasing` (Rebase or merge?, The golden rule) |
| Settle a conflict | `branch-and-merge`, `advanced-merging` (Take one whole side of a file), `rebasing` (When a rebase stops on a conflict, Why the two sides of a conflict are swapped) |
| Reshape your commits before review | `clean-up-history` |
| Publish a rewritten branch | `force-push-safely` (wave C, named in plain text) |
| Pull requests from the terminal | `github-flow-prs` (wave C, plain text) |
| Three ways to merge a pull request | `pr-merge-strategies` (wave C, plain text) |
| Cut the release | `tags-and-releases` |

## Left out on purpose

| Point | Why |
|---|---|
| Dictator and lieutenants workflow | Rare; `team-workflows` covers it ("Who may push") |
| Pull request review (approve, request changes) | A free personal account cannot approve its own pull request (decision 3); `code-review` teaches it. The briefing says so in a careful block |
| Forks | Capstone 3 (`capstone-open-source`) and `team-contributing` |
| Branch protection, required checks | `branch-protection-codeowners`, `github-actions-ci`; named in Advanced |
| `--force-if-includes`, `--onto`, autosquash | Advanced material of their lessons; no challenge needs them |

## Beyond the book

- The three merge methods, and that a rebase merge always creates new commit IDs: GitHub Docs, "About pull request merges" (https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges).
- `gh pr create`, `gh pr merge`, `gh release create`: the GitHub CLI manual, as taught in `github-flow-prs` and `tags-and-releases`.
- `git push --force-with-lease`: Git reference, `git-push`.

## Terminal output

The three blocks in "When it goes wrong" are real output of Git 2.55, captured in a scratch repository with a folder remote. The remote's address in the `To` and `error:` lines is written as the practice repository's GitHub address (`your-name/...`), the convention of `github-flow-prs`.

## Challenges and quiz

| Challenge | Level | Outcomes | Lessons it draws on |
|---|---|---|---|
| `sprint-day-one` | easy | O8, O10 | `rebasing` (rebase onto `origin/main`), `remote-branches` (`push -u`), `github-flow-prs` (`gh pr create`), `pr-merge-strategies` (squash), `remotes` (pull) |
| `shared-branch-conflict` | medium | O7, O8 (when not to rebase), O10 | `remotes` (pull a teammate's commit), `advanced-merging` (two conflicted files, one combined by hand, one taken from one side), `pr-merge-strategies` (merge commit), `branch-management` (delete) |
| `release-day` | hard | O7, O8, O10 | `clean-up-history` (fixup in `rebase -i`), `rebasing` (two conflict stops, swapped sides), `force-push-safely` (`--force-with-lease`), `pr-merge-strategies` (rebase merge, `-D` afterwards), `tags-and-releases` (annotated tag, push, `gh release create`) |

What the goals prove:

- Day one: `commit-count-is 5`, `history-is-linear` and `commit-is-gone` together accept only a squash merge. The two goals on the local `add-races` accept only a rebase (a merge of `main` into the branch leaves a "Merge" commit).
- Day two: `commit-exists "into update-fees"` holds only when `main` was merged into the shared branch (Git's proposed message for `git merge origin/main` and for `git pull origin main` both contain it); a rebase leaves no such commit. File goals check both resolutions line by line.
- Release day: `history-is-linear`, `commit-count-is 7`, the two `commit-is-gone` goals and the two `commit-comes-before` goals accept only two clean commits on top of Tariq's, rebase-merged. Then `tag-is-annotated`, `tag-is-on-commit`, `github-pull-request-is-merged` and `github-release-exists`.
- Not checked: that the force push used a lease (nothing on the server tells), and that `v1.0` on GitHub is the annotated tag (`remote-has-tag` reads only folder remotes; `github-release-exists` proves a tag of that name is on GitHub).

| Quiz question | Tests |
|---|---|
| 1 | O8: when not to rebase (a shared branch) |
| 2 | O10: picking a merge method from a team's rules; O8 clean-up |
| 3 | O10: what a squash merge does to commit IDs |
| 4 | O10 and releases: tag after the merge |
