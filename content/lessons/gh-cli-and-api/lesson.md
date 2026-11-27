---
id: gh-cli-and-api
title: "The gh CLI, the API and webhooks"
module: professional-github
bookSection: "6.5 Scripting GitHub"
bookUrl: https://git-scm.com/book/en/v2/GitHub-Scripting-GitHub
bookSources:
  - book/progit2/book/06-github/sections/5-scripting.asc
readFirst: [maintaining-github-repo]
---

Forty issues need the same label, and the website wants three clicks for each one. Everything you can click on GitHub you can also type, and what you can type you can put in a script. This lesson teaches the `gh` program for daily work, `gh api` for everything else, and webhooks, GitHub's way of telling your own programs that something happened.

## Must know

In the lessons before this one you used a few `gh` commands, such as `gh pr create`, without looking at the tool itself. Now you look at it properly: what it is, the commands worth knowing by heart, and the one command that reaches every corner of GitHub.

### What `gh` is

`gh` is the [GitHub CLI](term:github-cli): GitHub's own command-line program. Git moves commits. `gh` works with the things that live only on GitHub and that Git knows nothing about: [issues](term:issue), [pull requests](term:pull-request), [labels](term:label), releases, settings.

Two facts explain most of its behaviour:

- **It knows who you are.** You signed in once with `gh auth login` (the lesson on your GitHub account and SSH did that). Every `gh` command since then acts as you.
- **It knows which repository you mean.** `gh` reads the address of the `origin` remote in the folder you are in. That is why `gh issue list` needs no repository name: run it in another project's folder and you get that project's issues.

### The everyday commands

Every `gh` command has the same shape: `gh`, then a thing, then an action. `gh issue list`, `gh pr view`, `gh repo clone`. These five cover most days:

| Command | Its job | When you use it |
|---|---|---|
| `gh repo view` | Shows the repository's name, description and README | To check where you are, or to read a project's front page without the browser |
| `gh issue list` | Lists the open issues | Every morning. Add `--label bug` or `--assignee @me` to narrow it |
| `gh pr list` | Lists the open pull requests | To see what is waiting for review |
| `gh pr status` | Shows the pull requests that concern you: the one for your branch, yours, and those waiting for your review | Before you start something new |
| `gh browse` | Opens the repository in your browser | When the website really is the better tool. `gh browse 28` opens issue or pull request 28, `gh browse trails.txt` opens a file |

Here is `gh issue list` in the practice repository of this lesson, a small trail-map project:

```console
$ gh issue list

Showing 4 of 4 open issues in your-name/gitremastered-practice-gh-cli-and-api

ID   TITLE                                LABELS       UPDATED
#31  Ridge walk shows the wrong distance  duplicate    less than a minute ago
#30  Map legend is missing                bug          less than a minute ago
#29  Add the lake loop                    enhancement  less than a minute ago
#28  Ridge walk distance is wrong         bug          less than a minute ago
```

The first line says how many issues there are and in which repository. Then one row per issue: its number, its title, its labels and when it last changed. The newest issue is on top.

`gh pr status` answers "what is waiting for me?" in one screen:

```console
$ gh pr status

Relevant pull requests in your-name/gitremastered-practice-gh-cli-and-api

Current branch
  There is no pull request associated with [main]

Created by you
  You have no open pull requests

Requesting a code review from you
  You have no pull requests to review
```

When you forget a command, ask the tool: `gh issue --help` lists every action for issues, and `gh issue list --help` lists every option of that one command.

The Try-its in this lesson need the practice repository on GitHub. Under the lesson, start the first challenge, "Count the open issues": it creates the repository with four issues. The Try-its below only read, or add a comment, so the challenge keeps its work for you.

:::try-it
1. Run `gh repo view`. `gh` prints your account name with `gitremastered-practice-gh-cli-and-api`, a one-line description, and the README, which reads "Trail map".
2. Run `gh issue list`. Four rows appear, as above. Your issue numbers may be higher than mine: GitHub never uses a number twice in a repository, and each restart of a challenge creates new issues.
3. Run `gh issue list --label bug`. Only the two rows with the label `bug` are left.
4. Run `gh pr list`. `gh` answers `no open pull requests in …`: nobody has opened one here.
5. Look at the picture. Nothing moved. These commands read from GitHub; they never touch your working tree, your staging area or your commits.
:::

### `gh api`: one command for everything else

`gh issue list` exists because someone at GitHub wrote it. Nobody wrote a `gh` command for "how many issues does each label have". For jobs like that, GitHub offers something more general.

An [API](term:api) (application programming interface) is a way for a program, not a person, to use a service. The website gives you pages with buttons. The API gives a program plain data and a fixed list of requests it may make. GitHub's own website and `gh` use the same API you are about to use.

Each thing you can ask for has an address, called an [endpoint](term:endpoint). An endpoint looks like a folder path:

| Endpoint | What it answers |
|---|---|
| `repos/OWNER/REPO` | The facts about one repository |
| `repos/OWNER/REPO/issues` | The list of its open issues |
| `repos/OWNER/REPO/issues/28` | Issue number 28 |
| `repos/OWNER/REPO/issues/28/comments` | The comments on issue 28 |
| `user` | The account you are signed in as |

`gh api <endpoint>` sends a request to that endpoint, signed in as you, and prints the answer:

```console
$ gh api "repos/{owner}/{repo}"
{"id":1473739804,"node_id":"R_kgDOV9d8HA","name":"gitremastered-practice-gh-cli-and-api","full_name":"your-name/gitremastered-practice-gh-cli-and-api","private":false,"owner":{"login":"your-name", …
```

Two things to read here.

**The placeholders.** Type `{owner}` and `{repo}` exactly like that, braces included. `gh` replaces them with the owner and name of the repository your folder points at. Your script then works in any repository without a change. Put the endpoint in double quotes: some shells, PowerShell among them, give braces and `?` a meaning of their own.

**The answer is JSON.** [JSON](term:json) is a plain-text format for data that almost every program can read. `{ … }` is an object: a set of names with values, like `"private": false`. `[ … ]` is a list. The answer above is one object with about a hundred names in it, and that is too much to read. The next part cuts it down.

### Pick what you need with `--jq`

`--jq` takes a short expression that says which part of the JSON to print. The expression language is called jq; `gh` has it built in, so there is nothing to install. Four expressions do most of the work:

| Expression | Meaning | Use it on |
|---|---|---|
| `.name` | The value of the name `name` | An object |
| `.[]` | Each item, one after another | A list |
| `.[].title` | The `title` of each item | A list of objects |
| `length` | How many items | A list |

```console
$ gh api "repos/{owner}/{repo}" --jq '.default_branch'
main
$ gh api "repos/{owner}/{repo}/issues" --jq '.[].title'
Ridge walk shows the wrong distance
Map legend is missing
Add the lake loop
Ridge walk distance is wrong
$ gh api "repos/{owner}/{repo}/issues" --jq 'length'
4
```

Put the expression in single quotes, so the shell passes it to `gh` untouched.

The output is now plain lines, with no table and no colours. A script can read that; it could not read a web page. This is the whole reason to use the API.

A filter goes after a `?` in the endpoint, as `name=value`. The documentation of each endpoint lists the filters it knows:

```console
$ gh api "repos/{owner}/{repo}/issues?labels=bug" --jq '.[].title'
Map legend is missing
Ridge walk distance is wrong
```

:::try-it
1. Run `gh api "repos/{owner}/{repo}"`. A wall of JSON fills the terminal: every fact GitHub keeps about the repository.
2. Run `gh api "repos/{owner}/{repo}" --jq '.default_branch'`. One word is left: `main`.
3. Run `gh api "repos/{owner}/{repo}/issues" --jq '.[].title'`. The four issue titles appear, one per line.
4. Run `gh api "repos/{owner}/{repo}/issues?labels=bug" --jq '.[].title'`. Only the two bugs are left.
:::

### Pull requests hide in the issues list

One surprise catches almost everyone who counts issues with the API.

:::predict
question: "A repository has 3 open issues and 1 open pull request. What does `gh api \"repos/{owner}/{repo}/issues\" --jq 'length'` print?"
answer: "4. For the REST API, every pull request is also an issue, so the issues endpoint returns both. `gh issue list` shows 3, because it leaves pull requests out."
:::

On GitHub a pull request is an issue with a branch attached: both share one row of numbers, and both have a title, labels and comments. The `issues` endpoint therefore returns both. A pull request in that list carries an extra name, `pull_request`, and jq can keep only the items without it. Here is a repository with three open issues and one open pull request (the third challenge ends in this state):

```console
$ gh api "repos/{owner}/{repo}/issues" --jq 'length'
4
$ gh api "repos/{owner}/{repo}/issues" --jq '[.[] | select(.pull_request == null)] | length'
3
```

Read the second expression from left to right. `.[]` takes each item. The `|` hands each one to the next step. `select(…)` keeps an item only when the test in the brackets is true, here "it has no `pull_request`". The outer `[ … ]` puts the kept items back into a list, so that `length` can count them.

When you only want issues, the everyday command is the shorter way, and it speaks JSON too. `gh issue list --json` with the names you want prints JSON without pull requests, and it takes the same `--jq`:

```console
$ gh issue list --json number,title
[{"number":57,"title":"Map legend is missing"},{"number":56,"title":"Add the lake loop"},{"number":55,"title":"Ridge walk distance is wrong"}]
$ gh issue list --json number,labels --jq '.[] | select(.labels[].name == "bug") | .number'
57
55
```

The last command prints the numbers of the open issues that carry the label `bug`: the `select` keeps an issue when one of its labels has that name. A list of bare numbers is exactly what a loop in a script needs.

### Change things: `-X POST` and `-f`

Reading is half of the API. A script that only reads cannot file a bug or close an issue. For that, a request says what kind of action it is. That word is the request's method:

| Method | Meaning | Example |
|---|---|---|
| `GET` | Read. Changes nothing | List the issues |
| `POST` | Create something new | Add a comment |
| `PATCH` | Change part of something that exists | Close an issue |
| `DELETE` | Remove something | Delete a label |

`-X` sets the method, and each `-f name=value` adds one field to the request. This adds a comment to issue 28:

```console
$ gh api -X POST "repos/{owner}/{repo}/issues/28/comments" -f body="Checked on site: the sign says 14 km." --jq '.html_url'
https://github.com/your-name/gitremastered-practice-gh-cli-and-api/issues/28#issuecomment-7220563193
```

GitHub answers with the new comment as JSON; `--jq '.html_url'` prints only its web address. Add `--silent` when you want no output at all.

Details worth knowing:

- **A field makes the request a POST.** `gh api` sends a GET when you give no fields, and a POST as soon as you add one. Writing `-X POST` anyway is a good habit: the reader of your script sees at once that this line changes something.
- **A list field takes `[]`.** An issue's labels are a list, so the field is written `-f "labels[]=bug"`. Repeat it for a second label.
- **`-f` sends text, `-F` sends typed values.** With `-F`, `true`, `false` and whole numbers are sent as real JSON values, not as text. Use `-F` when the documentation asks for a number or true/false.
- **To change, use `PATCH` on the thing itself.** `gh api -X PATCH "repos/{owner}/{repo}/issues/28" -f state=closed` closes issue 28.

:::try-it
1. Run `gh issue list` and pick the number of the issue "Ridge walk distance is wrong". The steps below say 28; type your own number.
2. Run `gh api -X POST "repos/{owner}/{repo}/issues/28/comments" -f body="Checked on site: the sign says 14 km." --jq '.html_url'`. `gh` prints the web address of your new comment.
3. Run `gh issue view 28 --comments`. The issue appears with your comment under it. You wrote to GitHub without a browser.
4. Look at the picture. Again nothing moved: an issue comment is not a commit, and it is stored on GitHub only.
:::

:::careful
The API does not ask "are you sure?". A loop with a wrong filter closes two hundred issues as fast as it closes two. Run the reading half of a script first, look at what it prints, and only then add the half that writes.
:::

### Long lists come in pages: `--paginate`

The practice repository has four issues. Real projects have hundreds, and there the API behaves in a way that quietly breaks scripts.

:::predict
question: "A project has 212 open issues. What does `gh api \"repos/{owner}/{repo}/issues\" --jq 'length'` print?"
answer: "30. The API sends a list in pages of 30 items, and one request gets one page. There is no warning: the script simply counts the first page."
:::

This is [pagination](term:pagination). A list endpoint answers with one page, 30 items unless you ask for another size with `?per_page=` (100 at most). `--paginate` tells `gh` to keep asking for the next page until none is left.

To see it in a repository with four issues, ask for pages of three:

```console
$ gh api "repos/{owner}/{repo}/issues?per_page=3" --jq '.[].title'
Ridge walk shows the wrong distance
Map legend is missing
Add the lake loop
$ gh api "repos/{owner}/{repo}/issues?per_page=3" --paginate --jq '.[].title'
Ridge walk shows the wrong distance
Map legend is missing
Add the lake loop
Ridge walk distance is wrong
```

The first command lost an issue without saying so. The second fetched two pages.

:::careful
With `--paginate`, the `--jq` expression runs on each page separately. `--jq 'length'` then prints one number per page (here `3` and `1`), not the total. Print one line per item and count the lines: `--paginate --jq '.[].number' | wc -l`.
:::

Make `--paginate` a habit for every list a script reads.

### Who the request comes from: tokens

You have now read and written on GitHub without typing a password once. Here is why that works, and the one rule it brings.

When you ran `gh auth login`, GitHub gave `gh` a token: a long random string that stands in for your password, limited to certain kinds of action. `gh` attaches it to every request. `gh auth status` shows the account and what the token may do:

```console
$ gh auth status
github.com
  ✓ Logged in to github.com account your-name (keyring)
  - Active account: true
  - Git operations protocol: https
  - Token: gho_************************************
  - Token scopes: 'gist', 'read:org', 'repo'
```

The scopes are the token's permissions. `repo` allows reading and writing repositories; this token has no scope for deleting one.

:::careful
A token is a password. Never paste one into a script, a commit, a chat or a screenshot. Whoever reads it can act as you until you revoke it, and a commit keeps it in the history after you delete the line (the lesson [Remove sensitive data](lesson:remove-sensitive-data) shows the cleanup).

A script should call `gh` and let it find the token. On a server where nobody can sign in, `gh` reads the token from the [environment variable](term:environment-variable) `GH_TOKEN`, which you set in that server's secret store, never in a file in the repository.
:::

### Webhooks: GitHub calls you

Everything so far has one direction: your program asks, GitHub answers. Sometimes you want the opposite. "Post in the team chat when a pull request is opened" would need a script that asks GitHub every few seconds whether anything is new. That is called polling, and it wastes requests on a thousand answers of "nothing".

A [webhook](term:webhook) turns the direction around. You give GitHub a web address of yours, and GitHub sends a request to it at the moment something happens. Pro Git describes it in one line: you specify a URL (a web address), and GitHub posts a payload, a block of data, to that URL on any event you want.

A webhook has four parts:

| Part | What it is |
|---|---|
| Payload URL | The address of your own small web service, which must be reachable from the internet |
| Events | What you want to hear about. The default is `push` only; you can pick others, such as `issues` or `pull_request` |
| Payload | The JSON that GitHub sends: what happened, in which repository, who did it. For a push it holds the branch and the list of commits with the files each one touched |
| Secret | A password you choose and type into both GitHub and your service |

You add one on the website: the repository's **Settings**, then **Webhooks**, then **Add webhook**.

The book's example shows the idea. A small service receives every push, reads from the payload who pushed, to which branch, and which files changed, and sends an email when one particular person changes one particular file on one particular branch. Twenty lines of code, and GitHub does the watching.

The secret matters because the payload URL is public: anyone who finds it can send your service a fake "push". GitHub uses the secret to compute a signature of each payload and sends it along with the payload, in a line named `X-Hub-Signature-256`. Your service computes the same signature and drops any request where the two differ.

When to use which:

| You want to | Use |
|---|---|
| Do something now, because you decided to | `gh` or `gh api` |
| React when something happens on GitHub | A webhook |
| React to an event by running commands, with no server of your own | [GitHub Actions](term:github-actions), from the lesson on CI with GitHub Actions |

For testing, the webhook's settings page lists the recent deliveries: for each one, when it was sent, whether your service answered, and the full request and response. A **Redeliver** button sends the same payload again, so you can fix your service and retry without making a new push.

### When it goes wrong

Three errors account for most trouble with `gh api`. In each, GitHub's answer ends with a three-digit number, the status, that tells you which kind of problem it is.

**A misspelled endpoint**

```console
$ gh api "repos/{owner}/{repo}/isues"
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest",
  "status": "404"
}gh: Not Found (HTTP 404)
```

404 means no such address: here `isues` for `issues`. GitHub also answers 404 for a private repository your token may not see, so that it does not reveal that the repository exists. Check the spelling first, then your access.

**A request with a missing or wrong field**

```console
$ gh api -X POST "repos/{owner}/{repo}/issues" -f body="no title"
{"message":"Invalid request.\n\n\"title\" wasn't supplied.","documentation_url":"https://docs.github.com/rest/issues/issues#create-an-issue","status":"422"}gh: Invalid request.

"title" wasn't supplied. (HTTP 422)
```

422 means GitHub understood the request but its content is not acceptable. The message names the field, and `documentation_url` is the page that lists the fields this endpoint wants.

**An endpoint that starts with a slash, in Git Bash**

```console
$ gh api "/repos/{owner}/{repo}"
invalid API endpoint: "C:/Program Files/Git/repos/{owner}/{repo}". Your shell might be rewriting URL paths as filesystem paths. To avoid this, omit the leading slash from the endpoint argument
```

GitHub's documentation writes endpoints with a leading `/`. Git Bash on Windows takes a word that starts with `/` for a file path and rewrites it. Leave the first slash out, as every example in this lesson does.

One more, without an error message: you create an issue and a list read in the very next second does not show it. GitHub's REST lists can run a few seconds behind a write. A person never notices; a script that writes and reads back at once does. Read the thing itself by its number, or wait a moment.

## Under the hood

You used `gh api` as a box: an endpoint goes in, JSON comes out. Opening the box shows that there is nothing special inside, which is why the same knowledge works in any programming language.

### A request is plain HTTP

HTTP is the protocol your browser uses to fetch web pages. `gh api` speaks it too: it sends one HTTP request to `https://api.github.com/` plus your endpoint, with your token in a header (a named line at the top of the request) called `Authorization`. `-i` prints the status and headers of the answer above the JSON:

```console
$ gh api -i "repos/{owner}/{repo}/issues?per_page=3"
HTTP/2.0 200 OK
Content-Type: application/json; charset=utf-8
Link: <https://api.github.com/repositories/1473739804/issues?per_page=3&after=Y3Vyc29yOnYyOpLPAAABoh1caEjPAAAAAYxDEcQ%3D&page=2>; rel="next"
X-Github-Api-Version-Selected: 2022-11-28
X-Ratelimit-Limit: 5000
X-Ratelimit-Remaining: 4073
X-Ratelimit-Reset: 1795790627
X-Ratelimit-Resource: core
X-Ratelimit-Used: 927
…
```

- `200 OK` is the status for success. You met 404 and 422 above; 401 means the token is wrong or missing.
- `Link: <…>; rel="next"` is how pages work: GitHub hands over the address of the next page. `--paginate` follows that address until an answer has no `rel="next"`.
- The `X-Ratelimit` lines are the subject of the next part.

This style of API, with one address per thing and the HTTP methods as actions, is called REST. GitHub names it the [REST API](term:rest-api).

:::compare
today: "`gh api \"repos/{owner}/{repo}/issues/6/comments\" -f body=\"A new comment\"` posts a comment. `gh` adds the token and the headers itself."
book: "`curl -H \"Content-Type: application/json\" -H \"Authorization: token TOKEN\" --data '{\"body\":\"A new comment\"}' https://api.github.com/repos/schacon/blink/issues/6/comments` sends the same request by hand. It still works, but the token ends up typed on the command line or pasted into a script."
:::

### Rate limits

GitHub counts your requests, a [rate limit](term:rate-limit), so that one runaway script cannot slow the service down for everyone. Pro Git gives the two numbers that still hold: without signing in, 60 requests per hour; signed in, 5,000 per hour.

`gh api rate_limit` shows where you stand, and asking does not count against the limit:

```console
$ gh api rate_limit --jq '.resources.core'
{"limit":5000,"remaining":4072,"reset":1795790628,"used":928}
```

`remaining` is what is left in this hour. `reset` is the moment the count starts again, written as seconds since 1970 (the way computers often store time). A script that runs out gets a 403 or 429 status until then.

In daily use you never come near 5,000. Scripts reach it by looping: one request per issue on a project with ten thousand issues. Two habits keep you far away: ask for lists, not for items one by one, and use `?per_page=100` with `--paginate` to get more per request.

### Where the token lives

`gh auth status` printed `(keyring)` after your account name. That is the operating system's protected store for passwords: Credential Manager on Windows, Keychain on macOS, a keyring service on Linux. `gh` keeps the token there and not in a readable file, when the system has such a store.

`gh auth token` prints the token for the rare program that needs it handed over. Treat that command's output like the password it is: straight into a variable in memory, never into a file or a log.

## Advanced

The REST API and the five everyday commands carry most work. These four topics are for when you outgrow them.

### GraphQL: ask for exactly what you need

With REST, the server decides what an answer contains: a hundred names per issue, whether you want them or not, and a second request for anything related. GitHub has a second API, [GraphQL](term:graphql), where you write a query that names exactly the fields you want, across related things, and get them in one answer.

`gh api graphql` sends a query. This one asks for the number of open issues and nothing else:

```console
$ gh api graphql -F owner='{owner}' -F name='{repo}' -f query='
  query($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      issues(states: OPEN) { totalCount }
    }
  }'
{"data":{"repository":{"issues":{"totalCount":4}}}}
```

How to read it:

- `query(…)` declares two variables, `$owner` and `$name`. `String!` means "text, and required".
- `-F owner='{owner}'` fills the variable from the repository of your folder. The placeholders need `-F`, not `-f`.
- The body walks from the repository to its open issues to their `totalCount`. The answer has the same shape as the query, under `data`.
- `--jq '.data.repository.issues.totalCount'` would print the bare number.

Two differences from REST matter here. In GraphQL, `issues` means issues only: pull requests are a separate field, `pullRequests`. And `totalCount` is the real total, with no pages to add up.

| Use | When |
|---|---|
| REST | One simple read or write. Most documentation and examples use it |
| GraphQL | You need a few fields from many things, or data that would take several REST requests |

A mistake in a query comes back as a message that names the field:

```console
$ gh api graphql -f query='{ viewer { nme } }'
{"errors":[{"path":["query","viewer","nme"],"extensions":{"code":"undefinedField","typeName":"User","fieldName":"nme"},"locations":[{"line":1,"column":12}],"message":"Field 'nme' doesn't exist on type 'User'"}]}gh: Field 'nme' doesn't exist on type 'User'
```

### Your own commands: `gh alias set`

An [alias](term:alias) is a short name for a longer command. Git has them, and so does `gh`. `gh alias set <name> '<command>'` saves one in `gh`'s own settings on your computer, for every repository:

```console
$ gh alias set bugs 'issue list --label bug'
$ gh bugs

Showing 2 of 2 issues in your-name/gitremastered-practice-gh-cli-and-api that match your search

ID   TITLE                         LABELS  UPDATED
#30  Map legend is missing         bug     less than a minute ago
#28  Ridge walk distance is wrong  bug     less than a minute ago
```

`gh alias list` shows your aliases and `gh alias delete bugs` removes one. Worth it for a command you type several times a day; not for one you need once a month and will have forgotten the name of.

### Commands written by others: `gh extension`

An extension is a program someone else wrote that adds a new `gh` command. Extensions live in GitHub repositories whose names start with `gh-`. `gh extension install OWNER/gh-NAME` installs one, `gh extension list` shows what you have, and `gh extension search` looks for more.

:::careful
An extension is someone else's code running on your computer with your GitHub login. GitHub does not review extensions. Install only from authors you trust, as you would with any program.
:::

### Statuses: a script's verdict on a commit

The book ends with the API call behind the green ticks and red crosses on a pull request. A [status check](term:status-check) is a verdict attached to one commit. Any program with a token can attach one, with a POST to `repos/{owner}/{repo}/statuses/COMMIT_ID` and four fields: `state` (`success`, `failure`, `error` or `pending`), a `description`, a `target_url` for details, and a `context`, the name that keeps the verdicts of different tools apart.

The book's example joins both halves of this lesson: a webhook tells a small service about each push, the service checks every commit message for a `Signed-off-by` line, and it posts a status for each commit through the API. That pair, a webhook in and the API out, is how every testing service worked with GitHub before GitHub Actions existed, and how many still do.

### From a real program

`gh` suits the terminal and shell scripts. Inside a program written in JavaScript, Ruby or C#, use GitHub's official Octokit library for that language instead of building HTTP requests by hand. The endpoints, fields and tokens are the ones you learned here.

## Recap

- `gh` works with what lives only on GitHub. It acts as the account you signed in with, on the repository of the folder you are in: `gh repo view`, `gh issue list`, `gh pr list`, `gh pr status`, `gh browse`.
- `gh api "repos/{owner}/{repo}/…"` reaches everything else. `--jq` picks values out of the JSON, `-X POST` or `-X PATCH` with `-f name=value` writes, and `--paginate` fetches every page of a list, not only the first 30 items.
- The REST list of issues includes pull requests. `gh issue list` and GraphQL's `issues` do not.
- A token is a password: let `gh` hold it, or pass it in `GH_TOKEN` from a secret store. Never write it into a script or a commit.
- A webhook is the other direction: GitHub sends a JSON payload to your URL when an event happens, signed with a secret so your service can tell it is real.
