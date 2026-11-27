# Coverage: issues-projects-security

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** tracking work on GitHub (issues, labels, assignees, milestones, closing keywords, templates; sub-issues and Projects in words) and guarding the code (Dependabot alerts and version updates, secret scanning and push protection, the security policy; advisories and code scanning in short). The lesson is beyond the book: Pro Git only touches issues as things you can cross-reference.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 6.2 Contributing to a Project | "Issue and Pull Request References": issues and pull requests share one number sequence; `#<num>`, `username/repo#<num>` |
| GitHub Docs, Issues | About issues; Linking a pull request to an issue (closing keywords); Managing labels (default labels); About milestones; Adding sub-issues; About issue and pull request templates; Configuring issue templates (issue forms, `config.yml`) |
| GitHub Docs, Projects | About Projects (layouts, fields, two-way sync, built-in automation); Quickstart for Projects (Status field, board layout) |
| GitHub Docs, Code security | GitHub security features (what is on by default for public repositories); Dependabot alerts; Configuring Dependabot version updates; Dependabot options reference (`open-pull-requests-limit`, `groups`, `labels`, `schedule.interval`); Dependabot security updates; Secret scanning; Push protection; Working with push protection from the command line; Managing push protection for users; Adding a security policy; Creating a default community health file (where `SECURITY.md` may live); Repository security advisories; Privately reporting a security vulnerability; Code scanning |
| GitHub CLI 2.104 | `gh issue create / list / view / edit / close / comment`, `gh label list / create` (real output, run on the practice repository) |

## Pro Git 6.2 (the issue parts), point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Issues and pull requests are numbered from one sequence, unique in the project | Yes | Under the hood |
| `#<num>` in any comment or description makes a reference | Yes: a bare `#12` links and does not close | Must know (closing keywords) |
| `username/repo#<num>` points into another repository | Yes | Under the hood |
| `username#<num>` for an issue in a fork | No | See "Left out" |
| Referencing a commit by its SHA-1 in a comment | No | See "Left out" |
| GitHub Flavored Markdown, task lists, code snippets, quoting, emoji, images | No | See "Left out" |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| `username#<num>`, commit references by SHA-1 | Small print of comment writing, not of tracking work | `github-flow-prs` (pull request conversations) |
| GitHub Flavored Markdown and task lists | Belong with writing pull request descriptions and reviews | `github-flow-prs`, `code-review` |
| Pull requests themselves, review, merging | Their own lessons; here only "the keyword also works in a pull request description" | `github-flow-prs`, `code-review`, `pr-merge-strategies` |
| Creating and editing a Project hands-on, `gh project` | Needs the `project` scope, which the course's `gh` sign-in does not ask for | Explained in words here; quiz only |
| Creating a milestone from the terminal | `gh` has no milestone command; it needs a raw API call | `gh-cli-and-api` (the API) |
| Turning on Dependabot alerts, security updates, code scanning | Repository settings pages; the course does not change settings outside files | Explained in words here |
| A real blocked push | A challenge must never push a real-looking secret | Explained with the example from GitHub Docs; removing a secret is practised in `remove-sensitive-data` |
| Writing a workflow for CodeQL | Workflows are their own lesson | `github-actions-ci` |
| Organization-level security settings, delegated bypass, custom patterns | Need an organization or a paid plan | `orgs-teams-permissions` (in words) |

## Beyond the book

Everything except the three covered rows above comes from GitHub Docs and the GitHub CLI:

- `gh issue` and `gh label` commands, the default labels, assignees, milestones.
- Closing keywords (`close`, `fix`, `resolve` and their forms), the default-branch rule, keywords in commit messages against pull request descriptions.
- Issue templates, issue forms and `config.yml`.
- Sub-issues and Projects (layouts, fields, the `project` scope).
- Dependabot alerts, version updates (`.github/dependabot.yml` and its options), security updates.
- Secret scanning, push protection, the bypass page and its three reasons.
- `SECURITY.md`, security advisories, private vulnerability reporting, code scanning.

## Challenges

All three run on the student's practice repository `gitremastered-practice-issues-projects-security`.

| Challenge | Level | Skill | Proved by |
|---|---|---|---|
| `report-a-bug` | easy | `gh issue create` with a title and a default label | `github-issue-exists`, `github-issue-has-label` |
| `close-from-a-commit` | medium | Find a teammate's issue number with `gh issue list`, close it with `Fixes #N` in a commit pushed to `main` | `committed-file-contains`, `branch-is-in-sync`, `github-issue-is-closed` |
| `dependabot-and-policy` | hard | Write `.github/dependabot.yml` (with `open-pull-requests-limit` from Advanced) and `SECURITY.md`, commit, push | `committed-file-contains` (five), `branch-is-in-sync` |

## Not verified on a real screen

- The exact text of a blocked push is quoted from GitHub Docs, not produced here.
- The names of GitHub's pages ("Security and quality" tab, "Create sub-issue" button, "Report a vulnerability" button, **Milestones**) follow GitHub Docs as read on 2026-11-27. GitHub renames these now and then.
