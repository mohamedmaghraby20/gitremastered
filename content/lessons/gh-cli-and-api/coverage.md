# Coverage: gh-cli-and-api

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** using GitHub from the terminal and from scripts: the everyday `gh` commands, `gh api` for the REST API (read, filter with `--jq`, write, paginate), tokens, webhooks in words, then rate limits, GraphQL, aliases, extensions and commit statuses.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 6.5 Scripting GitHub | Services and Hooks, The GitHub API, Basic Usage, Commenting on an Issue, Changing the Status of a Pull Request, Octokit |
| GitHub CLI manual (`gh help`, version 2.104) | `gh repo view`, `gh issue list`, `gh pr list`, `gh pr status`, `gh browse`, `gh api`, `gh auth status`, `gh auth token`, `gh alias set`, `gh extension`, the `GH_TOKEN` variable |
| GitHub Docs: REST API | Issues endpoints (pull requests are returned as issues), pagination (`per_page`, the `Link` header), rate limits, status codes |
| GitHub Docs: GraphQL API | Queries with variables, `issues(states:)`, `totalCount` |
| GitHub Docs: Webhooks | About webhooks, events, payloads, validating deliveries with a secret (`X-Hub-Signature-256`), recent deliveries and redelivery |

## Pro Git 6.5, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| GitHub can be customised and connected to outside systems through hooks and the API | Yes | Must know (lede, "Webhooks", "gh api") |
| Services: ready-made integrations picked from a list (the Email service) | No: GitHub removed Services in 2019 | Left out, see below |
| Hooks: you give a URL, GitHub posts an HTTP payload on the events you choose | Yes, with the book's sentence in our words | Must know ("Webhooks: GitHub calls you") |
| A webhook needs a URL and a secret; the default event is `push` | Yes, as the four-part table | Must know |
| A small web service receives the payload and acts (the Sinatra email example) | Yes, in words; no Ruby code | Must know |
| The payload holds the pusher, the ref and the commits with their files | Yes | Must know |
| The delivery list for debugging, and redelivering a payload | Yes | Must know |
| The API does nearly everything the website does | Yes | Must know ("gh api: one command for everything else") |
| A simple GET on an endpoint (`curl https://api.github.com/users/schacon`) | Yes, with `gh api` on the practice repository | Must know |
| Other endpoints: `.gitignore` templates, rendering Markdown | No | Left out, see below |
| To write or to read private data you must authenticate | Yes | Must know ("Who the request comes from") |
| Prefer a personal access token over a password; scopes; revocable | Yes, as `gh`'s token and its scopes | Must know, Under the hood |
| Rate limit: 60 per hour without a token, 5,000 with one | Yes | Under the hood ("Rate limits") |
| Commenting on an issue: POST to `repos/<user>/<repo>/issues/<num>/comments` | Yes, as the worked example and a Try-it | Must know |
| The `curl` form of that request with an `Authorization` header | Yes, in a compare block | Under the hood |
| The list of things the API can do (labels, milestones, merging and so on) | Yes, by example: labels, closing issues | Must know, challenges |
| Commit statuses: POST to `repos/<user>/<repo>/statuses/<sha>` with state, description, target URL and context | Yes, in words | Advanced ("Statuses") |
| The `Signed-off-by` service: a webhook in, a status out | Yes, in words | Advanced |
| A pull request shows the status of its last commit | Partly: "the green ticks and red crosses on a pull request" | Advanced |
| Octokit libraries | Yes, with today's languages | Advanced ("From a real program") |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Services (the Email service, the Jenkins service) | GitHub removed Services; webhooks and GitHub Apps replaced them | Nowhere; webhooks cover the use |
| The Ruby (Sinatra) code of both book examples | The idea needs no Ruby, and a web service cannot run in the practice terminal | Described in words here |
| Creating a personal access token by hand on the website | The book's screenshots show an older settings page | The lesson on a GitHub account and SSH (`github-account-ssh`) |
| `.gitignore` templates and Markdown rendering endpoints | Curiosities, not skills | Nowhere |
| Required status checks on a protected branch | A rule about statuses, not how to post one | `branch-protection-codeowners` |
| Running tests on each push | The modern form of the book's testing service | `github-actions-ci` |
| Writing a real webhook receiver, GitHub Apps | Needs a public server and a programming language; beyond a Git course | Nowhere |

## Beyond the book

- The whole `gh` program: the book predates it and uses `curl`. Everyday commands, `gh api`, its `{owner}` and `{repo}` placeholders, `--jq`, `-f` and `-F`, `-X`, `--silent`, `--paginate`, `-i` (GitHub CLI manual).
- Pull requests appear in the REST issues list and carry a `pull_request` key (GitHub Docs, REST: Issues).
- Pagination: 30 items per page, `per_page` up to 100, the `Link` header (GitHub Docs, REST: Using pagination).
- `gh api rate_limit` and the rate-limit headers; 403 or 429 when the limit is used up (GitHub Docs, REST: Rate limits).
- Where `gh` keeps the token, `gh auth token`, `GH_TOKEN` (GitHub CLI manual: `gh auth login`, `gh help environment`).
- The webhook signature header `X-Hub-Signature-256` (GitHub Docs: Validating webhook deliveries).
- GraphQL through `gh api graphql` (GitHub Docs: GraphQL API; GitHub CLI manual).
- `gh alias set`, `gh extension` (GitHub CLI manual).
- The Git Bash leading-slash error and the short delay of REST lists after a write: both seen with real `gh` 2.104 on Windows while writing this lesson.

## Challenges

| Challenge | Level | Skill |
|---|---|---|
| `count-open-issues` | Easy | Read a list from the terminal (`gh issue list`, or `gh api … --jq length`) |
| `file-a-bug-with-the-api` | Medium | A POST with a plain field and a list field (`labels[]`) |
| `close-the-duplicates` | Hard | A loop: read numbers with `--jq`, PATCH each one, then count issues without the pull request (the "Pull requests hide" part, or GraphQL from Advanced) |

All three run on the practice repository `gitremastered-practice-gh-cli-and-api`. The reference solutions read lists through `gh issue list` and GraphQL, not the REST list: a REST list read in the same second as the teammate steps can miss the newest issues.
