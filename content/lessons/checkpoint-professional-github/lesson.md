---
id: checkpoint-professional-github
title: "Checkpoint: Professional GitHub"
module: professional-github
bookSection: "6 GitHub"
bookUrl: https://git-scm.com/book/en/v2/GitHub-Maintaining-a-Project
bookSources:
  - vendor/progit2/book/06-github/sections/2-contributing.asc
  - vendor/progit2/book/06-github/sections/3-maintaining.asc
  - vendor/progit2/book/06-github/sections/4-managing-organization.asc
  - vendor/progit2/book/06-github/sections/5-scripting.asc
readFirst: [maintaining-github-repo, orgs-teams-permissions, branch-protection-codeowners, github-actions-ci, gh-cli-and-api, issues-projects-security]
checkpoint: true
---

Six lessons put you on the owner's side of GitHub: you ran a repository, read permissions, protected `main`, let GitHub run the tests, drove everything from the terminal and kept track of work with issues. Here you prove you can combine them, in three situations from the life of one small project, with no hints.

## Must know

This page teaches nothing new. It is the module on one page: the commands worth remembering, one table per lesson, and the lesson to go back to when a row looks unfamiliar. Read it once, then take the challenges below.

A checkpoint is optional. Its challenges mix the lessons, so each one needs commands from at least two of the tables.

### Where the challenges run

All three challenges run on GitHub, like the challenges of the six lessons. The app builds a public repository named `gitremastered-practice-checkpoint-professional-github` on your account, `origin` points at it, and you use `git` and `gh` side by side. Starting a challenge resets that repository. Issues that "a teammate" opened are created from your own account, because the practice has no second person.

Two things to expect:

- Issue and pull request numbers keep growing each time a challenge is started again. Never guess a number: list first, then use the number you see.
- Two challenges add a workflow file. A run takes about half a minute, so its goal ticks a little after your push.

### Run a repository

From [Run a repository: collaborators, managing pull requests, README, CONTRIBUTING](lesson:maintaining-github-repo).

| Command or file | Job |
|---|---|
| `gh pr list`, `gh pr view <number>`, `gh pr diff <number>` | See which pull requests wait, and read one |
| `git fetch origin pull/<number>/head:<branch>` | Bring a pull request to your computer as a local branch, without touching `main` |
| `gh pr checkout <number>` | The same, and switch to it in one step |
| `gh pr merge <number> --merge`, then `git pull` | Accept a pull request on GitHub, then bring your `main` up to date |
| `gh pr close <number> --comment "<why>"` | Turn a pull request down and tell its author why |
| `git ls-remote origin` | List every ref on the server, the `refs/pull/…` ones included |
| `README.md`, `CONTRIBUTING.md`, `LICENSE`, `SECURITY.md` | Files GitHub finds by name. `CONTRIBUTING.md` holds your rules for a change |
| `.github/pull_request_template.md` | Fills the description of every new pull request, once it is on the default branch |

### Read who may do what

From [Organizations, teams and permissions](lesson:orgs-teams-permissions).

| Command | Job |
|---|---|
| `gh api repos/{owner}/{repo} --jq .owner.type` | Does a person (`User`) or an organization (`Organization`) own this repository? |
| `gh api repos/{owner}/{repo} --jq .permissions` | Your own access: `pull` is Read, `push` is Write, `admin` is Admin |
| `@organization/team-name` | A team mention: it notifies the whole team, and names a team in a CODEOWNERS file |

The five repository roles, each including the ones before it: Read, Triage, Write, Maintain, Admin. Your access is the highest of the organization's base permissions, your teams' roles and your direct role.

### Protect main

From [Branch protection, rulesets and CODEOWNERS](lesson:branch-protection-codeowners).

| Command or file | Job |
|---|---|
| `gh api -X POST repos/{owner}/{repo}/rulesets --input ruleset.json` | Create a ruleset from a JSON file |
| `gh ruleset list`, `gh ruleset check main` | List the rulesets; show the rules that apply to `main` |
| `.github/CODEOWNERS` | Maps path patterns to owners: `/docs/ @cafe/docs-team`. The last matching line wins |

The rule types that go in the `rules` list of a ruleset, each written as `{"type": "<type>"}`:

| `type` | What it does |
|---|---|
| `deletion` | Nobody deletes the branch |
| `non_fast_forward` | Nobody force-pushes to the branch |
| `pull_request` | Every change arrives through a pull request; a direct push is refused |
| `required_status_checks` | A pull request merges only when the named checks passed |
| `required_linear_history` | No merge commit may land on the branch |

A push that a rule refuses prints `GH013: Repository rule violations` and `[remote rejected]`, and the line below names the rule. For "Changes must be made through a pull request": `git switch -c <branch>`, `git push -u origin <branch>`, `gh pr create`, `gh pr merge`, then `git switch main` and `git pull`.

### Let GitHub run the tests

From [CI with GitHub Actions](lesson:github-actions-ci).

A workflow is a file in `.github/workflows`. This is the whole of a small one:

```yaml
name: Checks
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: sh check.sh
```

| Line or command | Job |
|---|---|
| `name:` | The workflow's name, shown in every list of runs |
| `on: push`, `on: pull_request` | The event that starts it: every push, or every pull request and each new push to its branch |
| `uses: actions/checkout@v7` | A ready-made step that copies your repository onto the runner |
| `run: sh check.sh` | Your own command. Exit code 0 means the test passed |
| `gh run list`, `gh run watch` | See the runs; follow one until it ends |
| `gh run view <ID> --log-failed` | Print what the failed step printed |
| `gh pr checks`, `gh pr checks --watch` | The checks of your branch's pull request; wait until all are done |

Indent a workflow with spaces, two per level, never a tab. To fix a failed run: read the failed step, repeat its command on your computer, commit the fix and push. A new run starts by itself.

### Drive GitHub from the terminal

From [The gh CLI, the API and webhooks](lesson:gh-cli-and-api).

| Command | Job |
|---|---|
| `gh repo view`, `gh issue list`, `gh pr list`, `gh pr status` | The everyday reads, for the repository of the folder you are in |
| `gh api "repos/{owner}/{repo}/…"` | Reach anything on GitHub. `gh` fills in `{owner}` and `{repo}` from `origin` |
| `--jq '.[].title'`, `--jq length` | Pick values out of the JSON answer, or count the items |
| `gh issue list --json number,title --jq '<filter>'` | The same picking for an everyday command |
| `gh api -X POST "<endpoint>" -f name=value` | Create something. A list field is written `-f "labels[]=bug"` |
| `gh api -X PATCH "<endpoint>" -f state=closed` | Change something that exists |
| `--paginate` | Fetch every page of a long list, not only the first 30 items |
| `gh auth status` | Which account you act as, and what its token may do |

### Track the work, guard the code

From [Issues, projects, Dependabot and secret scanning](lesson:issues-projects-security).

| Command or file | Job |
|---|---|
| `gh issue create --title "…" --body "…" --label bug` | Open an issue with no questions asked |
| `gh issue list`, `gh issue view <number>` | See the open issues with their numbers; read one |
| `gh label list`, `gh issue edit <number> --add-assignee @me` | See the labels you may use; put your name on an issue |
| `git commit -m "Subject" -m "Fixes #<number>"` | A commit that closes the issue when it reaches the default branch on GitHub |
| `Closes #<number>` in a pull request's description | The issue closes when the pull request is merged |
| `.github/dependabot.yml` | Turns on version updates: `version: 2`, then one entry per package manager |
| `SECURITY.md` | Tells people how to report a security problem in private |

:::careful
Three things in this module catch people who work alone. A ruleset binds you too, unless you are on its bypass list. GitHub never lets you approve your own pull request, so keep the number of required approvals at `0` in a repository you run alone. And a red check does not stop a merge by itself: only a required status check does.
:::

## Under the hood

These are the ideas behind the tables. If one of them surprises you, the lesson named beside it explains it with a worked example.

### A pull request is a ref on the server

GitHub keeps `refs/pull/<number>/head` for every [pull request](term:pull-request). A normal fetch copies only `refs/heads/*`, which is why you never saw those refs, and why you can fetch one by name. ([Run a repository: collaborators, managing pull requests, README, CONTRIBUTING](lesson:maintaining-github-repo))

### Roles live on GitHub, not in Git

A [repository role](term:repository-role) never stops `git commit`. It stops `git push`, because the push is the moment GitHub is asked. A clone carries no restrictions at all. ([Organizations, teams and permissions](lesson:orgs-teams-permissions))

### A rule is checked on the server, during the push

A [ruleset](term:ruleset) refuses a push after your commits arrive, so your commit is always safe on your computer and only the road is closed. A branch is a pointer: a new branch on the same commit, pushed and merged through a pull request, takes the open road. ([Branch protection, rulesets and CODEOWNERS](lesson:branch-protection-codeowners))

### A check belongs to a commit

A run reports on one commit, and a pull request shows the checks of its newest commit. For a `pull_request` run, the runner tests a trial merge of your branch into the base branch, and reads the workflow file from that trial merge too. So a workflow added on a branch already runs for that branch's own pull request. ([CI with GitHub Actions](lesson:github-actions-ci))

### Every gh command is an HTTP request

`gh` sends requests to GitHub's [REST API](term:rest-api) with your token attached: GET reads, POST creates, PATCH changes, DELETE removes. The REST list of issues also holds pull requests; `gh issue list` leaves them out. ([The gh CLI, the API and webhooks](lesson:gh-cli-and-api))

### GitHub reads its settings from the default branch

Issues and pull requests share one counter. A [closing keyword](term:closing-keyword), a template, `CODEOWNERS` and `dependabot.yml` all take effect only once they are on the [default branch](term:default-branch) on GitHub: a commit on your computer or on another branch changes nothing yet. ([Issues, projects, Dependabot and secret scanning](lesson:issues-projects-security))

## Advanced

This module is where Git and GitHub meet automation. This is where each skill comes back.

### Checks on your own computer

A workflow checks a change after the push. [Hooks and enforced policies](lesson:hooks) runs the same kind of check before the commit, on your own computer. Teams use both: the hook is fast and can be skipped, the workflow is slower and cannot.

### Releases

A ruleset can protect tags as well as branches, and `gh release create` publishes a release from a tag. Tags, version numbers and releases are in [Tags and GitHub releases](lesson:tags-and-releases).

### When a secret gets through

Push protection stops the kinds of secret it knows. For one it missed, or one that was pushed before the protection was on, [Remove a leaked secret or huge file from history](lesson:remove-sensitive-data) shows the cleanup, and why the secret must be replaced anyway.

### The whole thing, end to end

The two capstones, [Capstone: A team sprint and a release](lesson:capstone-team-release) and [Capstone: Contribute to an open-source project](lesson:capstone-open-source), run a full round on GitHub: pull requests, reviews, a protected `main`, and a release at the end.

## Recap

- `gh pr list`, test with `git fetch origin pull/<number>/head:<branch>`, then `gh pr merge <number> --merge` or `gh pr close <number> --comment "<why>"`.
- `gh api -X POST repos/{owner}/{repo}/rulesets --input ruleset.json` protects `main`; the rule types to know are `deletion`, `non_fast_forward` and `pull_request`. `.github/CODEOWNERS` names who reviews which paths.
- A workflow is a YAML file in `.github/workflows` with `name`, `on` and jobs; `gh run list`, `gh run view <ID> --log-failed` and `gh pr checks --watch` read its results.
- `gh api "repos/{owner}/{repo}/…"` with `--jq`, `-X POST` and `-f` reads and writes anything; `gh api repos/{owner}/{repo} --jq .permissions` shows your own access.
- `gh issue create --title "…" --body "…" --label <name>` opens an issue; `Fixes #<number>` in a commit or a pull request description closes one when the change reaches the default branch.
