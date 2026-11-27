# Coverage: capstone-open-source

Capstone 3 of the course (course map 3.12, lesson 62). For course reviewers; the app does not show this file.

**Scope:** a briefing, a cheat sheet and three challenges without hints, on real GitHub practice repositories. It teaches nothing new. It proves outcome O11 (contribute through forks and pull requests, review others' code) and O12 (run a GitHub repository).

**Sources**

The capstone has no sources of its own. Its frame is Pro Git 6.2 Contributing to a Project (Forking Projects, The GitHub Flow, Iterating on a Pull Request, Keeping up with Upstream), with 6.3 Maintaining a Project (Managing Pull Requests, Pull Request Refs, CONTRIBUTING) and 5.2 Contributing to a Project (the forked public project). The cheat sheet repeats the lessons listed below.

## Pro Git 6.2, point by point

| Point of the book | In the capstone |
|---|---|
| Forking: a copy in your namespace, made with the Fork button | "What differs from a real fork", explained in words (assumption A4) |
| The GitHub Flow, steps 1 to 8 | The briefing and steps 1 to 6 of the cheat sheet; challenges `first-contribution` and `answer-the-review` |
| Creating a pull request | Step 4; `first-contribution` |
| Iterating on a pull request: push more commits to the same branch | Step 5; quiz question 2; `answer-the-review` |
| Keeping up with upstream: add the remote, fetch, merge | Steps 1, 2 and 5; `first-contribution` |
| The book's advice not to force-push over an open pull request | Step 5, sidenote, next to the rebase route many projects ask for |
| Keep your GitHub public repository up to date | Step 2; Under the hood "Sync goes through your computer" |
| References (`#12`, `Fixes #12`) | One line in step 4 |

## Cheat sheet, table by table

| Table | Lessons it repeats |
|---|---|
| Step 1: two remotes | `remotes`, `team-contributing` |
| Step 2: keep your copy in sync | `team-contributing` ("Keep your fork in sync") |
| Step 3: one topic branch per contribution | `team-workflows`, `remote-branches` |
| Step 4: open the pull request | `github-flow-prs`, `gh-cli-and-api` |
| Step 5: answer the review | `code-review`, `rebasing`, `force-push-safely` |
| Step 6: after the merge | `github-flow-prs`, `remote-branches` |
| The maintainer's side | `maintaining-github-repo`, `code-review`, `integrating-work` |
| The project's own rules | `maintaining-github-repo`, `branch-protection-codeowners` |

## Left out on purpose

| Point | Why |
|---|---|
| A pull request from a real fork into the project | One personal account cannot fork its own repository (A4). Explained in words; the branch is pushed to `upstream` instead |
| The Approve button | GitHub refuses approving your own pull request (decision 3). Explained; the challenge asks for a comment review |
| Pull requests as patches, GitHub Flavored Markdown, emoji, images | Taught in `github-flow-prs`; no challenge needs them |
| Rulesets, organizations, teams, Actions | Named in Advanced with their lessons; organizations and teams need more than a free personal account |
| Terminal output | A cheat sheet lists commands; the lessons show the output |
| "When it goes wrong" | As in the module checkpoints: the one trap that matters (the rejected push after a rebase) is a `careful` block in step 5 |

## Challenges and quiz

| Challenge | Level | Skills it draws on |
|---|---|---|
| `first-contribution` | easy | Add the `upstream` remote, sync `main` and `origin`, topic branch, commit, push, `gh pr create` |
| `answer-the-review` | medium | Read a review comment, fix in a new commit, rebase on `upstream/main`, `--force-with-lease`, reply, rebase-merge, sync, delete the branch on GitHub and locally |
| `maintainer-day` | hard | `gh pr checkout`, read the change, `gh pr review --comment`, squash merge, CONTRIBUTING and CODEOWNERS through a pull request of their own, sync |

- None has hints (`checkpoint: true`).
- The GitHub goals read the upstream repository. Local goals read the student's clone, including `origin/main` and `upstream/main`.
- Limits of the goal checks:
  - `answer-the-review` cannot check the student's reply: the maintainer's comment already makes "has a comment" true, so no goal asks for it. The brief still asks for the reply.
  - `answer-the-review` cannot tell a local rebase from GitHub's own: a student who skips `git rebase` and merges with the rebase method still reaches every goal. A merge commit or a squash merge fails ("straight line", "your two commits sit on top").
  - `maintainer-day` checks that `.github/CODEOWNERS` contains `* @`, not that the name after it is the student's.
  - `maintainer-day` cannot see whether the student looked at the contribution locally before reviewing.
- Both practice repositories are rebuilt by each challenge's setup (mirror pushes), so the three challenges can be taken in any order.

Quiz: four questions, on syncing a fork (`team-contributing`), iterating on a pull request (`github-flow-prs`, `code-review`), the squash merge and `git branch -d` (`github-flow-prs`, `branch-management`), and CODEOWNERS against CONTRIBUTING (`branch-protection-codeowners`, `maintaining-github-repo`).
