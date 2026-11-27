# Coverage: github-actions-ci

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** continuous integration in plain words; a workflow file in `.github/workflows`; events (`push`, `pull_request`, `workflow_dispatch`), jobs, runners and steps; `uses:` against `run:`; reading a run with `gh run list`, `gh run view`, `gh run watch` and `gh pr checks`; a failing check on a pull request; required status checks (pointer); secrets in short; cost. This lesson is beyond the book: Pro Git was written before GitHub Actions existed. The book's section 6.5 is the background: it shows the older way (services, webhooks and the commit status API) that Actions now does inside GitHub.

**Sources**

| Source | Sections used |
|---|---|
| GitHub Docs: Quickstart for GitHub Actions | The workflow file's place and shape, the first run, reading the result |
| GitHub Docs: Understanding GitHub Actions | Workflow, event, job, runner, step, action |
| GitHub Docs: Workflow syntax for GitHub Actions | `name`, `on`, `on.<event>.branches`, `jobs.<id>.runs-on`, `steps[*].uses`, `steps[*].run`, `steps[*].name`, `needs`, `strategy.matrix`, `concurrency`, the default shell (`bash -e`) |
| GitHub Docs: Events that trigger workflows | `push`, `pull_request` (activity types, `GITHUB_SHA` and `GITHUB_REF`, no run on a merge conflict), `workflow_dispatch` (default branch only), `schedule` |
| GitHub Docs: Using secrets in GitHub Actions; Automatic token authentication | Secrets, masking, forks get no secrets, `GITHUB_TOKEN` |
| GitHub Docs: Billing for GitHub Actions | Free on public repositories with standard runners; minutes on private repositories |
| GitHub Docs: Skipping workflow runs; Caching dependencies; Security hardening (pinning actions to a commit SHA) | `[skip ci]`, `actions/cache`, `@v7` against a full commit ID |
| GitHub CLI manual | `gh run list`, `gh run view` (`--verbose`, `--log-failed`), `gh run watch` (`--exit-status`), `gh pr checks` (`--watch`), `gh workflow run`, `gh workflow list`, `gh secret set`, `gh auth refresh -s workflow` |
| Pro Git 6.5 Scripting GitHub | Services and hooks (GitHub tells an outside system about a push); the commit status API (a status belongs to a commit; a pull request shows the status of its last commit) |

Every console block is real output: Git 2.55.0.windows.3 and gh 2.104.0, run on the practice repository `gitremastered-practice-github-actions-ci` on 2026-11-27. Three edits only: the account name in addresses is replaced by `your-name`; the colour codes and the byte-order mark that `gh run view --log` prints (invisible in a terminal) are removed; and long logs are cut to the lines the text discusses, marked with `...`. The `gh run watch` block shows the last screen of the command.

## Pro Git 6.5, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Services: ready-made integrations, many of them for continuous integration; GitHub can start a test run on an outside system on every push | Yes, as the history behind Actions (GitHub has since retired Services) | Under the hood ("Before Actions") |
| Hooks (webhooks): GitHub posts an HTTP payload to your URL on an event | Named in one sentence | Under the hood ("Before Actions"); taught in the `gh` CLI and API lesson |
| The Sinatra web service example | No | Left out, see below |
| The GitHub API: basic usage, commenting on an issue | No | Left out, see below |
| Changing the status of a pull request: each commit can have statuses; a testing service reports success or failure; the pull request takes the status of its last commit | Yes: a check belongs to a commit, and the pull request shows the checks of its newest commit | Must know ("A failing check on a pull request"), Under the hood ("A check belongs to a commit") |
| Octokit | No | Left out, see below |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Webhooks in detail, the Sinatra example, the API, Octokit | A different job: calling GitHub from your own programs | The `gh` CLI, the API and webhooks lesson (`gh-cli-and-api`) |
| Setting a required status check | It is a repository rule, not part of writing a workflow | The Branch protection, rulesets and CODEOWNERS lesson (`branch-protection-codeowners`) |
| Opening, reviewing and merging pull requests | Used here, taught elsewhere | `github-flow-prs`, `code-review`, `pr-merge-strategies` |
| Deployment (continuous delivery), environments, self-hosted runners, reusable workflows, writing your own action | Beyond a first CI; each is a topic of its own | Not in this course; the lesson names GitHub Docs |
| Real test tools (`npm test`, `pytest`) and setup actions | Runs must stay under a minute and need no language installed; the shape of the workflow is the same | Named in Must know and Advanced (cache, matrix) |

## Beyond the book

Everything in Must know and Advanced comes from GitHub Docs and the GitHub CLI manual, listed above. Facts that reviewers may want to check:

- `actions/checkout@v7` is the current major version (checked with the releases list on 2026-11-27). `@v4` still runs but prints a warning in every run ("Node.js 20 is deprecated… being forced to run on Node.js 24"), so the lesson teaches `@v7` and says that the number moves.
- A push that adds or changes a workflow file is refused when the sign-in lacks the `workflow` scope. The message in "When it goes wrong" is the real one, produced by pushing with a `gh` token that has only `repo`.
- The `pull_request` run's `GITHUB_REF` (`refs/pull/4/merge`) and its one-commit history ("Merge … into …") are printed by a real run of the shop workflow with two extra steps, shown in Under the hood.
