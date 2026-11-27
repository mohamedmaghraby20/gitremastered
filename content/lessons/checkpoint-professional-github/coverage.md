# Coverage: checkpoint-professional-github

The checkpoint of the Professional GitHub module. For course reviewers; the app does not show this file.

**Scope:** a review page and three challenges without hints. It teaches nothing new: every row of the cheat sheet repeats something one of the module's six lessons taught, and each challenge needs commands from at least two of them. It proves course outcome O13 (automate with hooks, GitHub Actions, the `gh` CLI and the API) together with O12 (run a GitHub repository: permissions, protection rules, CODEOWNERS).

**Sources**

The checkpoint has no sources of its own. It draws on the six lessons, which draw on Pro Git 6.2 Contributing to a Project (issue references), 6.3 Maintaining a Project, 6.4 Managing an organization and 6.5 Scripting GitHub, and on GitHub Docs for rulesets, CODEOWNERS, GitHub Actions, issues and Dependabot.

## Cheat sheet, table by table

| Table | Lesson it repeats | Where in that lesson |
|---|---|---|
| Run a repository | `maintaining-github-repo` | Must know: A pull request arrives, Try the change on your own computer, Decide: merge it / turn it down, Special files GitHub looks for; Under the hood: The server's list of refs |
| Read who may do what | `orgs-teams-permissions` | Must know: Two kinds of account, Repository roles, Read your own permissions, Mention a team, How your access adds up |
| Protect main | `branch-protection-codeowners` | Must know: Create a ruleset, The rules you will meet, CODEOWNERS, When it goes wrong (the blocked push and its five steps) |
| Let GitHub run the tests | `github-actions-ci` | Must know: The workflow file, Events, Reading a run, A failing check on a pull request |
| Drive GitHub from the terminal | `gh-cli-and-api` | Must know: The everyday commands, `gh api`, `--jq`, `-X POST` and `-f`, `--paginate`, tokens |
| Track the work, guard the code | `issues-projects-security` | Must know: issues, labels and assignees, `Fixes #N`, Dependabot, a security policy |

The `careful` block repeats three warnings from `branch-protection-codeowners` (a ruleset binds admins; no self-approval) and `github-actions-ci` (a red check does not block a merge).

"Under the hood" has one paragraph per lesson, each from that lesson's own Under the hood layer. "Advanced" only points to written lessons: `hooks` (the other half of O13), `tags-and-releases`, `remove-sensitive-data`, and the capstones `capstone-team-release` and `capstone-open-source`.

## Left out on purpose

| Point | Why |
|---|---|
| `gh repo create`, collaborators, mentions and notifications | One-time setup and browser work of `maintaining-github-repo`; the app creates the practice repository itself |
| Organizations, owners, outside collaborators, 2FA, SSO, the audit log | Cannot be practised on a free personal account; `orgs-teams-permissions` explains them and the quiz asks about roles |
| Pull request rule parameters, bypass lists in JSON, classic branch protection | Detail of `branch-protection-codeowners`; the challenges use rules without parameters |
| Matrix, caching, `workflow_dispatch`, secrets | Advanced material of `github-actions-ci`; no challenge here needs it |
| GraphQL, webhooks, rate limits, `gh alias`, `gh extension` | Advanced or explain-only material of `gh-cli-and-api` |
| Milestones, projects, sub-issues, issue templates, secret scanning | Browser work or explain-only material of `issues-projects-security` |
| Terminal output | A cheat sheet lists commands; the lessons show the output |

## Challenges and quiz

All three run on GitHub, in the practice repository `gitremastered-practice-checkpoint-professional-github`.

| Challenge | Level | Lessons it draws on |
|---|---|---|
| `guide-and-next-job` | easy | `maintaining-github-repo` (CONTRIBUTING.md), `issues-projects-security` (closing keyword in a commit, open an issue with a label), `gh-cli-and-api` (`gh issue list` to find the number) |
| `ready-for-the-team` | medium | `github-actions-ci` (a `push` workflow that must succeed), `orgs-teams-permissions` (team mention), `branch-protection-codeowners` (CODEOWNERS, ruleset with `deletion` and `non_fast_forward`), `gh-cli-and-api` (`gh api -X POST --input`) |
| `fix-through-the-gate` | hard | `branch-protection-codeowners` (ruleset with `pull_request` and `deletion`, the road through a pull request), `github-actions-ci` (a `pull_request` workflow added on the branch, `gh pr checks --watch`; Under the hood: the workflow is read from the trial merge), `issues-projects-security` (`Closes #N` in a pull request description), `maintaining-github-repo` (`gh pr merge`, `git pull`), `gh-cli-and-api` (`gh api`) |

- None has hints, as the checkpoint rule asks.
- Each challenge names its workflow differently (`Recipe checks`, `PR gate`), so a run left over from another challenge can never tick a goal.
- Issues that "a teammate" opened are `teammate` steps, created from the student's own account. Issue and pull request numbers grow across attempts, so the solutions find the number by title with `gh issue list --json`.
- `@octo-org/cooks` is a made-up team: GitHub accepts the file, and only its syntax is checked.
- Pushing a file under `.github/workflows` needs a credential with the `workflow` scope. Git Credential Manager's sign-in has it; a student who pushes with a hand-made token without that scope gets a refused push.
- Limits of the goal checks:
  - `guide-and-next-job` cannot tell an issue closed by the commit from one closed by hand; the brief forbids closing by hand. The same holds for `fix-through-the-gate`.
  - `ready-for-the-team` checks that the CODEOWNERS file contains `recipes.txt` and `@octo-org/cooks`, not that both are on one line.
  - `fix-through-the-gate` cannot see the order of the steps. A student who pushes the fix to `main` before creating the ruleset still has to merge a pull request from `fix-fried-rice` and get a green `PR gate` run, so the main skills are proved either way. With the `pull_request` rule active, any merge method passes.
  - `github-workflow-succeeded` for `PR gate` is met by a run on any event; the goal on the committed file checks for `pull_request`.

Quiz: four questions. A direct push to a pull-request-only `main` as admin (`branch-protection-codeowners`, `orgs-teams-permissions`), a workflow added by its own pull request (`github-actions-ci`), a closing keyword on a topic branch (`issues-projects-security`, `maintaining-github-repo`), and a wrong issue count from the API (`gh-cli-and-api`, `issues-projects-security`).
