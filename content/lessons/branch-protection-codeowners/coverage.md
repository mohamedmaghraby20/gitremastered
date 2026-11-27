# Coverage: branch-protection-codeowners

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** rules GitHub enforces on a branch (rulesets, classic branch protection) and the CODEOWNERS file. This lesson is beyond the book: Pro Git 6.3 covers collaborators and merging pull requests, and has nothing on protection rules or code owners. Its facts come from GitHub Docs and from real runs on a practice repository.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 6.3 Maintaining a Project | Adding Collaborators (push access is all or nothing), Managing Pull Requests (the merge button): the starting point this lesson builds on |
| Pro Git 8.3 / 8.4 (hooks, enforced policy) | The idea that a server can refuse a push; linked, not retaught |
| GitHub Docs: About rulesets | What a ruleset is, rulesets vs protected branches, enforcement statuses, rule layering, who can view, plan availability |
| GitHub Docs: Available rules for rulesets | Restrict deletions, block force pushes, require a pull request (and its review settings), status checks, linear history, signed commits, restrict creations and updates |
| GitHub Docs: About protected branches | Classic rules, admins exempt by default, "Do not allow bypassing the above settings", force pushes and deletion blocked by default |
| GitHub Docs: About code owners | File locations and search order, syntax, last match wins, owners need write access, base branch, draft pull requests, any one owner's approval, protecting the file itself, the errors API |
| GitHub REST API: repository rules | The JSON body of `POST /repos/{owner}/{repo}/rulesets`, `PUT`, `DELETE`, rule `type` names, `bypass_actors` |
| GitHub CLI manual | `gh api` (`-X`, `--input`, `--jq`, the `{owner}` and `{repo}` placeholders), `gh ruleset list / view / check` |

## Pro Git 6.3, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Creating a new repository | No | Taught in "Run a repository" (`maintaining-github-repo`) |
| Adding collaborators; push access | Recalled in one sentence, as the gap rules fill | Must know (bridge) |
| Managing pull requests, email notifications, the merge button | Recalled only; a merge is shown to obey the rules too | Under the hood |
| Pull request refs, PRs on PRs | No | `maintaining-github-repo` |
| Mentions, notifications, special files (README, CONTRIBUTING) | No | `maintaining-github-repo` |
| Project administration (default branch, transfer) | The default branch appears as `~DEFAULT_BRANCH` | Must know |

## GitHub Docs, point by point

| Point | In the lesson | Layer |
|---|---|---|
| Why protect a branch | Yes, three accidents and the rule for each | Must know |
| Classic protection vs rulesets | Yes, as a table | Must know |
| Free on public repositories; paid on private | Yes | Must know |
| Parts of a ruleset: name, target, enforcement, conditions, rules | Yes, with a JSON example | Must know |
| Creating one in the browser and with `gh api` | Yes, with a Try-it | Must know |
| Common rules: pull request, reviews, status checks, force pushes, deletion, linear history, signed commits | Yes, a table plus detail on three | Must know |
| Cannot approve your own pull request | Yes, with the real messages | Must know (careful) |
| Bypass lists | Yes; JSON form in Advanced | Must know, Advanced |
| The blocked push, `GH013` | Yes, read line by line, with a Try-it | Must know |
| CODEOWNERS: location, syntax, last match wins, write access, review requests, base branch | Yes | Must know |
| Where the check runs; nothing is stored locally | Yes | Under the hood |
| Rule layering | Yes, with the docs' example | Under the hood |
| Updating, disabling, deleting a ruleset; Evaluate status | Yes | Advanced |
| Required status checks in JSON, strict vs loose | Yes | Advanced |
| Tag rulesets, branch patterns, `creation` and `update` rules | Yes | Advanced |
| Protecting the CODEOWNERS file | Yes | Advanced |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Organizations, teams, repository roles | Needs an organization | "Organizations, teams and permissions" (`orgs-teams-permissions`) |
| Building a status check | Its own lesson | "CI with GitHub Actions" (`github-actions-ci`) |
| Merge methods in detail (squash, rebase merge) | Its own lesson | "Merge, squash or rebase-merge a PR" (`pr-merge-strategies`) |
| Giving a review | Its own lesson | "Reviewing a pull request" (`code-review`) |
| Merge queue, required deployments, code scanning rules | Rare; larger organizations | Not in the course |
| Push rulesets, metadata restrictions (commit message and email patterns), organization-wide rulesets | Paid plans (Team, Enterprise) | Not in the course |
| `gh api` in general, the REST API | Only the three calls needed here | "The gh CLI, the API and webhooks" (`gh-cli-and-api`) |

## Beyond the book

Everything in this lesson's Must know, Under the hood and Advanced comes from GitHub Docs. All console blocks are real output from Git 2.55 and gh 2.104 against the practice repository, with the account name replaced by `your-name`.

Observed on GitHub and not spelled out in the docs pages above (verified by running them):

- A `pull_request` rule with no `parameters` is accepted and gets the default values (0 approvals); `parameters` with only some of the five fields is refused with HTTP 422.
- A ruleset with an empty bypass list stops the repository owner (`current_user_can_bypass: never`).
- `actor_id` 5 with `actor_type` `RepositoryRole` is the repository admin role, and works on a personal repository.

## Challenges and quiz

All three run on the student's GitHub practice repository `gitremastered-practice-branch-protection-codeowners`.

- Easy, `docs-owners`: write `.github/CODEOWNERS` with `/docs/ @cafe/docs-team`, commit and push. `@cafe/docs-team` is a placeholder, because a free personal account has no teams; the syntax is the skill.
- Medium, `protect-main`: complete `ruleset.json` with the `deletion` and `pull_request` rules and create the ruleset with `gh api`.
- Hard, `blocked-push`: turn on a ready-made ruleset, then get a commit made on `main` into GitHub's `main` through a branch and a merged pull request (Under the hood: "Why the fix is one new branch").
- Try-its use a ruleset of their own (`no-force-push`, rule `non_fast_forward`) and their own file `todo.txt`, so they do not meet any challenge goal.
- Quiz: rulesets bind the owner; last matching CODEOWNERS line; cannot approve your own pull request; rule layering.
