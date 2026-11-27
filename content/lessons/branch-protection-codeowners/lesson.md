---
id: branch-protection-codeowners
title: "Branch protection, rulesets and CODEOWNERS"
module: professional-github
bookSection: "6.3 Maintaining a Project"
bookUrl: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets
bookSources:
  - vendor/progit2/book/06-github/sections/3-maintaining.asc
readFirst: [maintaining-github-repo]
---

It is Friday evening, a teammate force-pushes to `main` by mistake, and three commits the whole team built on are gone from the server. Nothing stopped them, because the team's rule "we never do that" lived only in people's heads. This lesson moves such rules onto GitHub, where the server enforces them: protected branches, rulesets, and a CODEOWNERS file that asks the right people to review.

## Must know

The lesson "Run a repository" showed the maintainer's side of GitHub: you give people push access, and you merge their pull requests. Pro Git stops there. Push access is all or nothing: a collaborator who may push may push anything, to any [branch](term:branch), including `main`. This lesson adds the missing layer, which Pro Git does not cover and GitHub Docs does: rules that decide *how* a branch may change.

### Why protect main

`main` is the branch everyone starts from and the one that gets released. Three accidents hurt most there:

| Accident | What it costs | The rule that stops it |
|---|---|---|
| A [force push](term:force-push) | Commits disappear from the server's branch; every teammate's next pull is a mess | Block force pushes |
| The branch is deleted | Open pull requests lose their target; the default branch is gone | Block deletion |
| An unreviewed commit pushed straight to `main` | Broken code reaches everyone at once | Require a pull request |

A reminder in two lines: a pull request is a request on GitHub to merge one branch into another, with a page where the team can read the change and discuss it. The lesson [Forks, GitHub Flow and pull requests](lesson:github-flow-prs) teaches it in full.

A rule on the server is better than a promise, because the server checks every push, from every person, every time.

### Two tools: classic branch protection and rulesets

GitHub has two features for [branch protection](term:branch-protection). You will meet both, so know them apart.

| | Classic branch protection rule | Ruleset |
|---|---|---|
| Age | The older feature | The newer one; GitHub builds new rules here |
| How many apply | One rule per branch | Several rulesets can apply to one branch; their rules add up |
| Who can read it | Admins only | Anyone who can read the repository |
| Switch off for a while | Delete the rule | Set its enforcement to "Disabled"; nothing is lost |
| Admins | Not bound by the rule unless you tick "Do not allow bypassing the above settings" | Bound like everyone else, unless you put them on the bypass list |
| Protects | Branches | Branches and tags |

Both are free on public repositories, with a personal account too. On a private repository they need a paid plan (GitHub Pro, Team or Enterprise). Your practice repository is public, so everything in this lesson works on your account.

The two can run side by side: GitHub enforces every rule from both, and when two rules disagree, the stricter one applies. For a new repository, use rulesets. The rest of this lesson does.

:::definitions
- term: branch protection rule
  text: "The older GitHub feature: one set of restrictions for the branches whose name matches a pattern, such as `main`."
- term: ruleset
  text: "A named list of rules on GitHub, plus which branches or tags they apply to and who may bypass them."
:::

### What a ruleset is made of

A ruleset answers four questions. Here is a small one, written as JSON. JSON is a plain-text format for structured data: names in double quotes, each followed by a colon and a value; `{ }` holds a group of names, `[ ]` holds a list.

```json
{
  "name": "no-force-push",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] }
  },
  "rules": [
    { "type": "non_fast_forward" }
  ]
}
```

| Field | The question it answers | Here |
|---|---|---|
| `name` | What is this ruleset called? Names are unique in a repository | `no-force-push` |
| `target` | Does it guard branches or tags? | `branch` |
| `enforcement` | Is it switched on? `active` enforces it, `disabled` keeps it without enforcing | `active` |
| `conditions` | Which branches? A list of names or patterns to include and to exclude | `~DEFAULT_BRANCH`, GitHub's word for "whichever branch is the default", here `main` |
| `rules` | What is forbidden or required? One object per rule, each with a `type` | `non_fast_forward`: block force pushes |

Patterns work like the ones in the lesson [Ignore files with .gitignore](lesson:ignoring-files): `refs/heads/release/*` targets every branch whose name starts with `release/`. Two shortcuts exist: `~DEFAULT_BRANCH` and `~ALL` (every branch).

### Create a ruleset

There are two ways, and they make the same thing.

**In the browser.** Open the repository on GitHub, then Settings, then Rules, then Rulesets, and press "New ruleset" and "New branch ruleset". The form has the same parts as the JSON above: a name, an enforcement status, a bypass list, target branches, and a list of rules with checkboxes.

**From the terminal.** `gh`, GitHub's command-line tool, can list rulesets but has no command to create one. Its general command `gh api` can: it sends a request to GitHub's API, the interface programs use to talk to GitHub. You tell it the method (`-X POST` means "create"), the address, and the file to send:

```console
$ gh api -X POST repos/{owner}/{repo}/rulesets --input no-force-push.json --jq '.id, .name, .enforcement'
28199006
no-force-push
active
```

- `repos/{owner}/{repo}/rulesets` is the address. Type `{owner}` and `{repo}` exactly like that, with the braces: `gh` fills in your user name and the repository name from the `origin` [remote](term:remote) of the folder you are in.
- `--input no-force-push.json` sends the file as the request's body.
- `--jq '.id, .name, .enforcement'` picks three fields out of GitHub's long JSON answer. Without it you get the whole answer on one line. Keep the ID: you need it to change or delete the ruleset.

To see what protects a branch, ask `gh ruleset check`:

```console
$ gh ruleset check main
1 rules apply to branch main in repo your-name/gitremastered-practice-branch-protection-codeowners

- non_fast_forward
  (configured in ruleset 28199006 from repository your-name/gitremastered-practice-branch-protection-codeowners)
```

(Where this lesson prints `your-name`, you see your own GitHub user name. Your ruleset IDs differ too.)

The Try-its in this lesson need your practice repository on GitHub. Start the first challenge below the lesson, "Give the docs folder an owner", then come back. The Try-its use a file and a ruleset of their own, so the challenge keeps its work.

:::try-it
1. Create the file `no-force-push.json` in the practice folder with the JSON shown above. Your editor works, or paste this into the terminal: `printf '%s\n' '{"name": "no-force-push", "target": "branch", "enforcement": "active", "conditions": {"ref_name": {"include": ["~DEFAULT_BRANCH"], "exclude": []}}, "rules": [{"type": "non_fast_forward"}]}' > no-force-push.json`. In the picture, a `no-force-push.json` sheet appears in the working tree: the file is untracked, and it can stay that way.
2. Run `gh api -X POST repos/{owner}/{repo}/rulesets --input no-force-push.json --jq '.id, .name, .enforcement'`. GitHub answers with three lines: a number (the ruleset's ID), `no-force-push` and `active`. The picture does not change: a ruleset lives on GitHub, not in your repository.
3. Run `gh ruleset check main`. It prints "1 rules apply to branch main" and names the rule `non_fast_forward`.
:::

### What a blocked push looks like

A rule shows itself only when someone breaks it. Then the push fails, and the lines that start with `remote:` are GitHub talking.

:::predict
question: "The practice repository is yours: you are its owner and its only admin. The ruleset you just made blocks force pushes to main. If you force-push to main now, does GitHub stop you?"
answer: "Yes. A ruleset binds everyone who is not on its bypass list, and yours has an empty bypass list. That is the main difference from a classic branch protection rule, which leaves admins free by default."
:::

:::try-it
1. Make a commit of your own and push it: `echo "Bring a reusable cup." > todo.txt`, then `git add todo.txt`, `git commit -m "Add a to-do list"` and `git push`. The push goes through, because an ordinary push breaks no rule. In the picture, a new station appears, `branch main` moves onto it, and after the push the `remote origin/main` tag follows.
2. Now ask GitHub to move its `main` one commit back, which would throw your new commit off the branch: `git push --force origin HEAD~1:main`. (`HEAD~1:main` means "set the server's `main` to the commit before my newest one".) GitHub refuses with `GH013: Repository rule violations` and the reason `Cannot force-push to this branch`. In the picture, nothing moves: the `remote origin/main` tag stays on your newest station.
3. Tidy up. Run `gh api repos/{owner}/{repo}/rulesets --jq '.[] | "\(.id) \(.name)"'` to print the ruleset's ID and name, then delete it with `gh api -X DELETE repos/{owner}/{repo}/rulesets/<the ID>`. The command prints nothing when it works.
:::

```console
$ git push --force origin HEAD~1:main
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: Review all repository rules at https://github.com/your-name/gitremastered-practice-branch-protection-codeowners/rules?ref=refs%2Fheads%2Fmain
remote:
remote: - Cannot force-push to this branch
remote:
To https://github.com/your-name/gitremastered-practice-branch-protection-codeowners.git
 ! [remote rejected] HEAD~1 -> main (push declined due to repository rule violations)
error: failed to push some refs to 'https://github.com/your-name/gitremastered-practice-branch-protection-codeowners.git'
```

Read it like this:

- `GH013: Repository rule violations found for refs/heads/main`: a ruleset stopped the push. `GH013` is GitHub's code for this; `refs/heads/main` is the full name of the branch `main`.
- `Review all repository rules at …`: a link to the page that lists the rules on that branch.
- `- Cannot force-push to this branch`: the rule you broke. Each broken rule gets its own line; this is the line to read first.
- `! [remote rejected]`: compare it with `! [rejected]` from the lesson [Work with remotes](lesson:remotes). Plain `[rejected]` comes from Git's own check (you are behind; pull first). `[remote rejected]` means the server said no for a reason of its own. Pulling will not help: you have to do what the rule asks.

### The rules you will meet

Every rule has a name in the browser form and a `type` in the JSON.

| Rule in the browser | `type` | What it does | Use it when |
|---|---|---|---|
| Restrict deletions | `deletion` | Nobody deletes the branch | Always, on `main` |
| Block force pushes | `non_fast_forward` | Nobody force-pushes to the branch | Always, on shared branches |
| Require a pull request before merging | `pull_request` | Every change arrives through a pull request; a direct push is refused | Any team of two or more |
| Require status checks to pass | `required_status_checks` | The pull request can merge only when the named checks are green | As soon as the project has automated tests |
| Require linear history | `required_linear_history` | No [merge commit](term:merge-commit) may land on the branch, so pull requests must be squash-merged or rebase-merged | The team wants a [linear history](term:linear-history) |
| Require signed commits | `required_signatures` | Only commits with a verified [signature](term:signature) are accepted | The project must prove who wrote each commit |

Three of these need a few more words.

**Require a pull request, and required reviews.** On its own, `{"type": "pull_request"}` only demands that a pull request exists; the docs say it "doesn't necessarily have to be approved, but it must be opened". Reviews are settings inside the rule, called `parameters`:

```json
{
  "type": "pull_request",
  "parameters": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews_on_push": false,
    "require_code_owner_review": false,
    "require_last_push_approval": false,
    "required_review_thread_resolution": false
  }
}
```

| Parameter | Meaning |
|---|---|
| `required_approving_review_count` | How many people must approve before the merge. `0` means none |
| `dismiss_stale_reviews_on_push` | A new push to the pull request cancels earlier approvals, so nobody slips in code after the review |
| `require_code_owner_review` | An owner named in the CODEOWNERS file (below) must approve |
| `require_last_push_approval` | Someone other than the person who pushed last must approve |
| `required_review_thread_resolution` | Every review comment must be marked resolved |

Leave `parameters` out and GitHub uses the values above with a count of `0`. If you include `parameters`, include all five.

:::careful
GitHub never lets you approve your own pull request. Working alone, with `required_approving_review_count` at `1`, you lock yourself out:

```console
$ gh pr review --approve
failed to create review: GraphQL: Review Can not approve your own pull request (addPullRequestReview)
$ gh pr merge --merge
X Pull request your-name/gitremastered-practice-branch-protection-codeowners#4 is not mergeable: the base branch policy prohibits the merge.
```

On a team, a teammate approves and the merge opens up. In a repository you run alone, keep the count at `0`, as the challenges here do.
:::

**Status checks.** A [status check](term:status-check) is a verdict, pass or fail, that an automated tool attaches to a commit; the usual one is "the tests ran". With this rule, the merge button stays locked until the checks you name have passed. The lesson [CI with GitHub Actions](lesson:github-actions-ci) builds such a check.

**Signed commits.** The lesson [Sign commits and tags](lesson:signing) showed how to sign. This rule makes it compulsory: an unsigned commit is refused like any other violation.

### Bypass lists

Sometimes a rule must give way: a release robot has to push a version commit, or an admin must fix an emergency. A ruleset's [bypass list](term:bypass-list) names who may break its rules. An entry is a role (such as "Repository admin"), a team, or an app. Each entry is set to bypass "always", or "for pull requests only", which lets the person merge a pull request that does not meet the rules but still forbids a direct push.

A bypass is loud on purpose. With the admin role on the list, a direct push to a pull-request-only `main` goes through and says so:

```console
$ git push origin main
remote: Bypassed rule violations for refs/heads/main:
remote:
remote: - Changes must be made through a pull request.
remote:
To https://github.com/your-name/gitremastered-practice-branch-protection-codeowners.git
   65bf41d..af6c2db  main -> main
```

Keep the list short. A rule that every admin bypasses out of habit protects nothing.

### CODEOWNERS: ask the right people

A rule can demand a review. It cannot know who understands the payment code. The CODEOWNERS file says so: it maps paths in the repository to the people responsible for them, and GitHub requests a review from those people whenever a pull request changes one of their files.

:::definitions
- term: code owner
  text: "A person or team that a repository's CODEOWNERS file names as responsible for some files. GitHub asks them to review pull requests that change those files."
:::

**Where it lives.** The file is called `CODEOWNERS`, in capitals, with no extension. GitHub looks in three places, in this order, and uses the first it finds: the `.github/` folder, the top folder of the repository, then `docs/`. Most projects use `.github/CODEOWNERS`.

**The syntax.** Each line is a path pattern, then one or more owners. Lines that start with `#` are comments.

```text
# Each line: a pattern, then its owners
*            @maya-k
*.md         @cafe/writers
/docs/       @cafe/docs-team
/docs/legal/ @cafe/lawyers @maya-k
```

| Part | Meaning |
|---|---|
| `*` | Every file: the default owner |
| `*.md` | Every file whose name ends in `.md`, in any folder |
| `/docs/` | The `docs` folder at the top of the repository and everything inside it. Without the leading `/`, a `docs` folder anywhere would match |
| `@maya-k` | A person, by GitHub user name |
| `@cafe/writers` | A team: `@organization/team-name`. Teams exist only inside an organization (the lesson [Organizations, teams and permissions](lesson:orgs-teams-permissions) explains them), so a personal repository can name people only |

The patterns follow most of the `.gitignore` rules, with a few gaps: `!` to exclude and `[a-z]` ranges do not work here. Paths are case sensitive.

Two rules decide who gets asked:

1. **The last matching line wins.** It replaces earlier matches; owners do not add up. In the file above, a change to `docs/menu.md` matches lines 1, 2 and 3. Only the last, `/docs/`, counts, so `@cafe/docs-team` is asked, and `@maya-k` and `@cafe/writers` are not. Put general lines first and specific lines last.
2. **Owners must be able to write.** Each owner needs write access to the repository. A line with an unknown owner is skipped.

:::predict
question: "With the file above, a pull request changes README.md at the top of the repository. Who is asked to review?"
answer: "`@cafe/writers`. Lines 1 and 2 match; the later one wins. `/docs/` does not match a file outside the docs folder."
:::

**How it requests reviews.** When a pull request opens (and is not a draft), GitHub reads the CODEOWNERS file on the pull request's *base* branch, the branch it will merge into, and adds the matching owners as reviewers. By itself that is only a request. It becomes a requirement when a ruleset has `require_code_owner_review` set to `true`: then one of the file's owners must approve. One approval from any owner on the line is enough.

GitHub can check the file for you. Take a file with a comment on line 1, then the lines `*.md @cafe/writers` and `/docs/ @cafe/docs-team`. Both teams are made up, and GitHub says so:

```console
$ gh api repos/{owner}/{repo}/codeowners/errors --jq '.errors[].message'
Unknown owner on line 2: make sure the team @cafe/writers exists, is publicly visible, and has write access to the repository

  *.md @cafe/writers
       ^
Unknown owner on line 3: make sure the team @cafe/docs-team exists, is publicly visible, and has write access to the repository

  /docs/ @cafe/docs-team
         ^
```

The same errors show in the browser when you open the CODEOWNERS file. The first challenge uses the made-up team `@cafe/docs-team`, so that you can practise the syntax without an organization; run this command after it to see GitHub's report on your own file. In a real project you would use names that exist.

### When it goes wrong

**A direct push to a branch that requires a pull request.**

```console
$ git push origin main
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: Review all repository rules at https://github.com/your-name/gitremastered-practice-branch-protection-codeowners/rules?ref=refs%2Fheads%2Fmain
remote:
remote: - Changes must be made through a pull request.
remote:
To https://github.com/your-name/gitremastered-practice-branch-protection-codeowners.git
 ! [remote rejected] main -> main (push declined due to repository rule violations)
error: failed to push some refs to 'https://github.com/your-name/gitremastered-practice-branch-protection-codeowners.git'
```

You committed on `main` and the rule wants a pull request. Your commit is safe in your repository; only this road is closed. Take the open one:

1. `git switch -c brunch-note` makes a branch that points at the same commit.
2. `git push -u origin brunch-note` sends the branch. No rule guards it.
3. `gh pr create --fill --base main` opens the pull request, with the title taken from your commit. `gh` prints the pull request's address.
4. `gh pr merge --merge` merges it on GitHub.
5. `git switch main`, then `git pull`, brings the merge into your `main`.

:::graph
caption: "After the pull: your commit B reached main through the merge commit M that GitHub made for the pull request"
commits:
  - id: A
    message: Add a to-do list
  - id: B
    message: Add brunch note
    parents: [A]
  - id: M
    message: "Merge pull request #2"
    parents: [A, B]
branches:
  main: M
  brunch-note: B
remotes:
  origin/main: M
head: main
:::

**The ruleset's name is taken.**

```console
$ gh api -X POST repos/{owner}/{repo}/rulesets --input no-force-push.json
{"message":"Validation Failed","errors":["Name must be unique"],"documentation_url":"https://docs.github.com/rest/repos/rules#create-a-repository-ruleset","status":"422"}gh: Validation Failed (HTTP 422)
```

A ruleset with this name already exists, often because you ran the command twice. List them with `gh ruleset list`. Then delete the old one, or change it in place: `gh api -X PUT repos/{owner}/{repo}/rulesets/<the ID> --input no-force-push.json`.

**GitHub cannot read the file.**

```console
$ gh api -X POST repos/{owner}/{repo}/rulesets --input ruleset.json
{"message":"Problems parsing JSON","documentation_url":"https://docs.github.com/rest/repos/rules#create-a-repository-ruleset","status":"400"}gh: Problems parsing JSON (HTTP 400)
```

The file is not valid JSON. The usual causes are a comma after the last item of a list, a missing comma between two items, or single quotes instead of double quotes.

A second message, `Invalid property /rules/0: data matches no possible input`, means the JSON is valid but a rule is not: `/rules/0` is the first rule in the list (counting starts at 0). Check the spelling of its `type`, and that a `pull_request` rule has either no `parameters` or all five.

## Under the hood

"Must know" used rulesets from the outside. Three questions remain: where the check happens, why a blocked commit is never lost, and how rules from several places combine.

### The check runs on the server, after your objects arrive

A push has two halves, as the lesson "Work with remotes" showed: your Git sends the objects the server lacks, then asks the server to move one of its refs. GitHub checks its rules between the two. It has your commits in hand, so it can look inside them (are they signed? is there a merge commit?), and it knows what you asked for (move `refs/heads/main`, delete it, or move it backwards). If a rule says no, the ref stays where it was, and the message comes back on the `remote:` lines.

This is the same idea as a [server-side hook](term:server-side-hook) from the lesson [Hooks and enforced policies](lesson:hooks): a script on the server that can refuse a push. On GitHub you cannot install such a script yourself; rulesets are the settings GitHub gives you instead.

Nothing in your repository records the rules. Clone a protected repository and `.git` holds no trace of them, which is why the picture never changed when you created a ruleset. It also means a rule cannot stop a local commit, only a push. Your own Git learns about a rule when the server refuses.

### Why the fix is one new branch

When GitHub refuses a push to `main`, your commit still exists locally and your `main` still points at it. A branch is a pointer to a commit, so `git switch -c brunch-note` makes a second pointer to the same commit without copying anything. The ruleset's `conditions` name only the default branch, so GitHub accepts the new branch.

:::graph
caption: "After the refused push: main and the new branch point at the same commit B. GitHub's main is still on A"
commits:
  - id: A
    message: Add a to-do list
  - id: B
    message: Add brunch note
    parents: [A]
branches:
  main: B
  brunch-note: B
remotes:
  origin/main: A
head: brunch-note
:::

Your local `main` is now one commit ahead of `origin/main`, and it stays that way until the pull request is merged. With a merge commit, GitHub's `main` then contains your commit B, so `git pull` is a [fast-forward](term:fast-forward). A squash merge or a rebase merge makes a *new* commit on GitHub instead, and your local `main` would then hold a commit the server's `main` lacks. The habit that avoids the whole situation: never commit on `main`; start every piece of work on its own branch.

### A merge is checked too

Pressing the merge button, or running `gh pr merge`, also changes `main`, so the rules apply there as well. The `pull_request` rule is met by definition. The others are checked against the pull request: enough approvals, green status checks, signed commits. Until they are met, the pull request is blocked, and `gh pr merge` answers "the base branch policy prohibits the merge".

### Layers

Several rulesets can target one branch, and a classic branch protection rule may sit beside them. GitHub does not pick a winner. It adds all the rules together, and where two versions of the same rule differ, the stricter one applies. GitHub Docs gives this example: a ruleset asks for three reviews and signed commits, and a classic rule asks for two reviews and a linear history. The branch then needs three reviews, signed commits and a linear history.

In practice: when a push is refused and your ruleset does not explain it, run `gh ruleset check main`. It lists every rule on the branch and the ruleset each one comes from.

## Advanced

You can now protect a branch and read a refusal. What follows is for running a larger project: managing rulesets over time, and the options a growing team reaches for.

### Change, switch off or delete a ruleset

| Job | Command |
|---|---|
| List the rulesets | `gh ruleset list` |
| Read one | `gh ruleset view <ID>` |
| Replace its contents | `gh api -X PUT repos/{owner}/{repo}/rulesets/<ID> --input ruleset.json` |
| Delete it | `gh api -X DELETE repos/{owner}/{repo}/rulesets/<ID>` |

To switch a ruleset off without losing it, change `"enforcement"` to `"disabled"` in the file and send it with `-X PUT`. Larger organizations on GitHub Enterprise have a third status, "Evaluate", which records what a ruleset would block without blocking it.

Keep the JSON file in the repository, for example as `.github/rulesets/protect-main.json`. Then a change to the rules is itself a commit that the team can review.

### A bypass list in JSON

```json
"bypass_actors": [
  { "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "always" }
]
```

`5` is GitHub's number for the "Repository admin" role. `bypass_mode` is `always` or `pull_request` (bypass only when merging a pull request). GitHub's answer to a create or list request includes `current_user_can_bypass`, which tells you whether you are on the list: `never` or `always`.

### Required status checks in JSON

```json
{
  "type": "required_status_checks",
  "parameters": {
    "strict_required_status_checks_policy": true,
    "required_status_checks": [ { "context": "test" } ]
  }
}
```

`context` is the check's name as it appears on the pull request. The "strict" setting also demands that the pull request's branch is up to date with `main` before merging: safer, at the cost of more test runs.

:::careful
A required check that never reports keeps every pull request waiting. Add the rule only after the check has run at least once in the repository, and spell its name exactly as the pull request shows it.
:::

### Protect tags and whole groups of branches

Set `"target": "tag"` and include `refs/tags/v*` to stop anyone from moving or deleting release tags. For branches, `"include": ["refs/heads/release/*"]` covers every release branch with one ruleset. Two more rule types are useful there: `creation` (only people on the bypass list may create a matching branch or tag) and `update` (only they may push to it).

### Protect the CODEOWNERS file itself

Anyone who can edit CODEOWNERS can make themselves an owner of everything. GitHub Docs advises giving the file an owner too:

```text
/.github/ @maya-k
```

With `require_code_owner_review` on, a change to anything in `.github/`, including CODEOWNERS, then needs that person's approval.

### Classic branch protection, when you meet it

Older repositories still use it: Settings, then Branches. A classic rule blocks force pushes and deletion by default, and its checkboxes carry the same ideas as this lesson's rules. Remember the one big difference: admins are exempt unless "Do not allow bypassing the above settings" is ticked. GitHub can convert a classic rule into a ruleset for you.

## Recap

- Protect `main` on the server: block force pushes and deletion, and require a pull request. Rulesets are the current tool; classic branch protection is the older one, and both are free on public repositories.
- A ruleset has a name, a target, an enforcement status, conditions (which branches) and rules. Create one in Settings, or with `gh api -X POST repos/{owner}/{repo}/rulesets --input ruleset.json`.
- A blocked push prints `GH013: Repository rule violations` and `[remote rejected]`; the line under it names the rule. For "Changes must be made through a pull request": new branch, push, pull request, merge, pull.
- A ruleset binds admins too, unless they are on its bypass list. You can never approve your own pull request.
- `.github/CODEOWNERS` maps path patterns to owners; the last matching line wins, and GitHub requests those owners' review on every pull request that touches their files.
