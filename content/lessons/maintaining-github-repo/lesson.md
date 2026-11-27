---
id: maintaining-github-repo
title: "Run a repository: collaborators, managing pull requests, README, CONTRIBUTING"
module: professional-github
bookSection: "6.3 GitHub - Maintaining a Project"
bookUrl: https://git-scm.com/book/en/v2/GitHub-Maintaining-a-Project
bookSources:
  - vendor/progit2/book/06-github/sections/3-maintaining.asc
readFirst: [github-flow-prs]
---

Your project is public, and this morning a stranger sent a change to it. Is it good? Will it break anything? What do you tell them if the answer is no? This lesson puts you on the owner's side of GitHub: you set the repository up, try other people's changes on your own computer before you accept them, and merge or turn them down politely.

## Must know

Until now you were the one who sends work to a project. Pro Git's chapter 6.3 looks at the other side: the project is yours, and the work comes to you. The person who runs a project and decides what goes in is its [maintainer](term:maintainer). Four words come back all through this lesson:

:::definitions
- term: pull request
  text: "A page on GitHub where someone asks you to merge their branch into yours. It shows their commits, the changed lines and a conversation. Often shortened to PR. The lesson Forks, GitHub Flow and pull requests teaches how to open one."
- term: contributor
  text: "Anyone who sends a change to a project, usually through a pull request. They cannot change your repository themselves."
- term: collaborator
  text: "A person you invited to your repository. A collaborator can push commits to it directly."
- term: gh
  text: "GitHub's own command-line tool. It does from the terminal what the website does with buttons: `gh pr list` lists pull requests, `gh pr merge` merges one."
:::

### Create the repository

`gh repo create` makes a new repository on GitHub. Run inside a project you already have, one line connects it and uploads it:

```console
$ gh repo create recipe-box --public --source=. --remote=origin --push
```

Read the options from left to right:

| Option | What it does |
|---|---|
| `recipe-box` | The new repository's name. It is made under your own account |
| `--public` | Everyone can see it. `--private` hides it from everyone you did not invite. You must pick one |
| `--source=.` | Use the repository in this folder (the dot means "here") |
| `--remote=origin` | Add the new address to your local repository as the [remote](term:remote) named `origin` |
| `--push` | Push your commits there right away |

The website does the same job: the `+` button at the top of any page, then "New repository". Pro Git says the only thing you must fill in is the name.

Do not run this command now. The challenges of this lesson build their own practice repository on your account, and one is enough.

Every repository on GitHub then has two addresses. Pro Git advises giving the HTTPS one to strangers:

| Address | Looks like | Who can clone with it |
|---|---|---|
| HTTPS | `https://github.com/<user>/<project>` | Anyone, if the repository is public. It is also the page's address in a browser |
| SSH | `git@github.com:<user>/<project>` | Only people with a GitHub account and an SSH key uploaded to it |

### Let other people push: collaborators

A new repository on your account accepts pushes from one person: you. To let a teammate push too, you add them as a [collaborator](term:collaborator). It is done on the website, in words:

1. Open the repository's **Settings**, then **Collaborators**.
2. Choose **Add people**, type the person's username, and send.
3. GitHub emails them an invitation. They become a collaborator only when they accept it.

To take the access back, remove the person on the same page.

:::careful
A collaborator gets read and write access: they can push to any branch that is not protected, `main` included. Invite people you would hand your laptop to. Everyone else can still contribute through pull requests, with no access at all. The lesson Branch protection, rulesets and CODEOWNERS shows how to guard `main` even from collaborators.
:::

This step invites a second person, so the challenges skip it: your practice repository has only you.

### A pull request arrives

That was the setup. Now the daily work of a maintainer starts: someone opens a pull request. Pro Git names the two places it can come from:

- **A fork**: the contributor's own copy of your repository on GitHub. Their branch lives in their copy. You cannot push to it, and they cannot push to yours.
- **A branch in your repository**: a collaborator pushed a branch and asks to merge it into `main`.

GitHub tells you by email and in the notification inbox on the website. The email lists the changed files and links to the pull request. From the terminal, `gh pr list` shows every pull request that is still open:

```console
$ gh pr list

Showing 2 of 2 open pull requests in you/gitremastered-practice-maintaining-github-repo

ID  TITLE            BRANCH           CREATED AT
#5  Add green salad  add-green-salad  less than a minute ago
#4  Add tomato soup  add-tomato-soup  less than a minute ago
```

(On your screen your account name stands where this page shows `you`.) The **ID** is the pull request's number. GitHub counts pull requests one by one in each repository and never reuses a number. You need it for everything that follows.

Two more commands read one pull request without changing anything:

- `gh pr view 5` shows the title, the author, the description and how many lines changed.
- `gh pr diff 5` shows the changed lines, like `git diff`.

```console
$ gh pr diff 5
diff --git a/recipes.txt b/recipes.txt
index 274d64f..3f62855 100644
--- a/recipes.txt
+++ b/recipes.txt
@@ -1,2 +1,3 @@
 Pancakes (20 min)
 Fried rice (15 min)
+Green salad
```

The Try-its in this lesson need a repository on GitHub with a pull request waiting in it. The practice tasks at the end of the lesson, called challenges, build one for you. Start the challenge "Try a contributor's pull request before you merge it" now. The app makes a practice repository on your GitHub account, and a contributor named Lina has a pull request open in it. The steps below only read, so the challenge keeps all its work for later.

:::try-it
1. Run `gh pr list`. One pull request is listed, "Add lentil soup", with its number under **ID**. Your number is probably not 1: the practice repository keeps counting each time a challenge is started again.
2. Run `gh pr view` followed by that number, like `gh pr view 7`. `gh` prints the title, "wants to merge 1 commit into main from add-lentil-soup", and Lina's description.
3. Run `gh pr diff` followed by the number. One green line starts with `+`: the recipe Lina wants to add to `recipes.txt`.
4. Look at the picture. Nothing moved: these three commands read GitHub and change nothing in your repository.
:::

### Try the change on your own computer

Reading a diff tells you what changed. It does not tell you whether the project still works. For that you need the contributor's commits on your computer, where you can run the project's tests.

Here is the problem: with a fork, the contributor's branch is not in your repository, so `git fetch origin` does not bring it. GitHub solves this for you. For every pull request, it keeps a [ref](term:ref) (a name that points at a commit) on **your** repository, the [pull request ref](term:pull-request-ref):

```text
refs/pull/<number>/head
```

It always points at the newest commit of the pull request, wherever the contributor's branch lives. So one command fetches any pull request into a local branch:

```console
$ git fetch origin pull/4/head:pr-review
From https://github.com/you/gitremastered-practice-maintaining-github-repo
 * [new ref]         refs/pull/4/head -> pr-review
```

Read `pull/4/head:pr-review` as "source, colon, destination": take the server's ref `pull/4/head` and write it into my local branch `pr-review`. You choose the branch name on the right.

:::predict
question: "You are on main and run `git fetch origin pull/4/head:pr-review`. Does recipes.txt in your folder now show the tomato soup?"
answer: "No. A fetch only stores commits and writes a ref. The new branch pr-review points at the contributor's commit, but you are still on main and your files did not change. Switch to pr-review to see the soup."
:::

:::graph
caption: "After the fetch: the contributor's commit is in your repository on its own branch. main did not move"
commits:
  - id: A
    message: Add README, two recipes and the check
  - id: B
    message: Add tomato soup
    parents: [A]
branches:
  main: A
  pr-review: B
remotes:
  origin/main: A
head: main
:::

:::try-it
1. In the challenge you started, run `gh pr list` again and read the number. Then run `git fetch origin pull/<number>/head:look`, with your number in place of `<number>`. Git prints `refs/pull/<number>/head -> look`. In the picture, a new station "Add lentil soup" appears with the label `branch look` on it. The `branch main` label and the `HEAD · you` pin stay on the station before it.
2. Run `cat recipes.txt`. The file has two recipes and no lentil soup: you are still on `main`, and a fetch never changes your files.
3. Run `git log --oneline main..look`. Git lists one commit, "Add lentil soup": what the branch `look` has and `main` does not.
4. Run `git branch -D look`. Git answers `Deleted branch look`, and in the picture the label and its station disappear. The challenge asks for this fetch again later, under another branch name, so nothing is solved yet.
:::

Now look and test, exactly as with any branch. This project's test is a small script, `check.sh`, that fails when a recipe has no cooking time:

```console
$ git log --oneline main..pr-review
a254e75 Add tomato soup
$ git switch pr-review
Switched to branch 'pr-review'
$ sh check.sh
OK. Every recipe has a cooking time.
$ git switch main
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
```

`git log main..pr-review` lists the commits that `pr-review` has and `main` does not: the pull request's commits. The other pull request, fetched the same way into `pr-salad`, does not pass:

```console
$ sh check.sh
Green salad
FAIL. These recipes have no cooking time.
```

`gh` has a shortcut for the fetch and the switch together. `gh pr checkout 5` fetches pull request 5 and switches to a local branch named like the contributor's branch:

```console
$ gh pr checkout 5
From https://github.com/you/gitremastered-practice-maintaining-github-repo
 * [new branch]      add-green-salad -> origin/add-green-salad
Switched to a new branch 'add-green-salad'
branch 'add-green-salad' set up to track 'origin/add-green-salad'.
```

| Way | Good when |
|---|---|
| `git fetch origin pull/<number>/head:<branch>` | You want to choose the branch name, stay on your current branch, or work without `gh`. It is plain Git, so it works in scripts too |
| `gh pr checkout <number>` | You want to be on the pull request's branch in one step |

The common wrong idea is that testing a pull request means merging it first. It does not: a fetched pull request is a separate branch. `main` stays untouched until you decide.

### Decide: merge it

The change is good. Merging on GitHub is one button on the pull request's page, "Merge pull request", or one command:

```console
$ gh pr merge 4 --merge
✓ Merged pull request you/gitremastered-practice-maintaining-github-repo#4 (Add tomato soup)
```

`--merge` asks for a [merge commit](term:merge-commit): a commit with two parents that joins the contributor's work to `main`. Pro Git points out that the button makes a merge commit even when a [fast-forward](term:fast-forward) was possible, so the history always shows where a pull request came in.

:::compare
today: "The merge button offers three ways: a merge commit (`gh pr merge --merge`), squash (`--squash`) and rebase (`--rebase`). Without one of these options, `gh pr merge` asks you which one. The lesson PR merge strategies compares them."
book: "Pro Git describes one button that always makes a merge commit. That is still the first choice on the button."
:::

The merge happened on GitHub. Your computer does not have it yet, so finish with a pull on `main`:

```console
$ git pull
From https://github.com/you/gitremastered-practice-maintaining-github-repo
   6955f85..9731976  main            -> origin/main
 * [new branch]      add-tomato-soup -> origin/add-tomato-soup
Updating 6955f85..9731976
Fast-forward
 recipes.txt | 1 +
 1 file changed, 1 insertion(+)
$ git log --oneline --graph
*   9731976 Merge pull request #4 from you/add-tomato-soup
|\  
| * a254e75 Add tomato soup
|/  
* 6955f85 Add README, two recipes and the check
```

The `[new branch]` line is a side effect of the practice setup: the contributor's branch sits in your repository, so the fetch inside `git pull` brings it along. With a fork you would not see it.

:::graph
caption: "After gh pr merge and git pull: GitHub made the merge commit M, and your main moved onto it"
commits:
  - id: A
    message: Add README, two recipes and the check
  - id: B
    message: Add tomato soup
    parents: [A]
  - id: M
    message: "Merge pull request #4"
    parents: [A, B]
branches:
  main: M
  pr-review: B
remotes:
  origin/main: M
head: main
:::

Nothing forces you to use the button. You can also merge `pr-review` into `main` yourself with `git merge` and push `main`; GitHub then marks the pull request as merged, because its commits are now in `main`. The lesson [Integrate contributed work](lesson:integrating-work) covers merging by hand.

### Decide: turn it down

Not every pull request should go in. Closing one ends it without merging. The commits stay on the page, and Pro Git notes that the author is notified. So say why: a closed pull request with no reason reads as a slammed door, and the contributor does not come back.

```console
$ gh pr close 5 --comment "Thanks, Omar! sh check.sh fails: the salad has no cooking time. Please add one and open a new pull request."
✓ Closed pull request you/gitremastered-practice-maintaining-github-repo#5 (Add green salad)
```

`--comment` posts your message on the pull request and then closes it. A useful reason has three parts: a thank-you, what is wrong, and what would make you accept the change.

Closing is not final. `gh pr reopen 5` opens the same pull request again, with its whole conversation.

:::sidenote
Often the kinder move is not to close at all. Comment with what is missing, and the contributor pushes one more commit to the same branch. The pull request updates itself. Close when the change does not fit the project, or when nobody answers for a long time.
:::

### Call someone in: mentions and notifications

Sometimes you need a second opinion before you decide. In any comment on GitHub, typing `@` and a username is a **mention**: `@lina` sends Lina a notification and pulls her into the conversation. Pro Git calls this better than waiting for people to look by themselves.

A **notification** is GitHub telling you that something happened. You are subscribed to a pull request or an issue (a page for a bug report or an idea), which means you get its notifications, when:

- you opened it or commented on it,
- someone mentioned you in it,
- you are watching the repository (the **Watch** button on its page).

Notifications arrive in two places, and you choose either or both in your account's notification settings: the inbox on the website (the bell icon), and email. Each pull request page has an **Unsubscribe** button for conversations you no longer need to follow.

:::careful
A mention reaches a real person. Mention people when you need them, and never paste a list of usernames to get attention.
:::

### Special files GitHub looks for

You have handled the pull requests that arrived. Good maintainers also shape the ones that have not been written yet. GitHub looks for a few files by name and shows each one in the right place at the right time. Pro Git describes the first two; GitHub Docs calls the wider group [community health files](term:community-health-file).

| File | What GitHub does with it | What to write in it |
|---|---|---|
| `README.md` | Shows it on the repository's front page | What the project is for, how to install it, a usage example, the license, how to contribute |
| `CONTRIBUTING.md` | Links to it when someone opens a pull request or an issue | Your rules for a change: tests to run, style, what you will not accept |
| `LICENSE` | Shows the license's name on the front page | The legal terms. Without a license, nobody is allowed to reuse your code, even if they can read it |
| `CODE_OF_CONDUCT.md` | Links to it from the repository's page | How people are expected to behave, and who to contact |
| `SECURITY.md` | Shows it under the repository's Security tab | How to report a security hole privately, instead of in a public issue |

An issue, as said above, is a page for a bug report or an idea: a conversation like a pull request's, with no code. The lesson Issues, projects, Dependabot and secret scanning teaches them.

Two more files are **templates**: text that GitHub puts into the box when someone starts writing.

| File | When it appears |
|---|---|
| `.github/pull_request_template.md` | Fills the description of every new pull request |
| Files in `.github/ISSUE_TEMPLATE/` | Offered as choices when someone opens a new issue |

A [pull request template](term:pull-request-template) is a short list of questions, so that every contributor answers them before you have to ask:

```markdown
## What does this change?

## Checklist
- [ ] I ran `sh check.sh` and it passes
```

Where the files go:

- GitHub finds community health files in three places: the top folder, a folder named `docs`, or a folder named `.github`. The `.github` folder keeps the top folder tidy. Its name starts with a dot, so `ls` hides it; `ls -a` shows it.
- `README.md` and `LICENSE` normally stay in the top folder, where people look first.
- A template works only once it is on the [default branch](term:default-branch), the branch GitHub shows first (usually `main`). A template that waits on another branch does nothing.

These are ordinary files. You add them like any other: write, `git add`, `git commit`, `git push`.

### When it goes wrong

Three messages you will meet with this lesson's commands.

**The number is wrong.**

```console
$ git fetch origin pull/999/head:nope
fatal: couldn't find remote ref pull/999/head
```

No pull request has that number in this repository. Run `gh pr list` (add `--state all` to see closed ones too) and use a number from the **ID** column.

**You fetch into the branch you are on.**

```console
$ git fetch origin pull/4/head:pr-review
fatal: refusing to fetch into branch 'refs/heads/pr-review' checked out at 'C:/Users/you/practice/project'
```

(The path at the end is your own practice folder.) The contributor pushed one more commit and you want it, but you are standing on `pr-review`. Git will not move a branch under your feet. Run `git switch main` first, then fetch again.

**The pull request no longer fits on `main`.**

```console
$ gh pr merge 5 --merge
X Pull request you/gitremastered-practice-maintaining-github-repo#5 is not mergeable: the merge commit cannot be cleanly created.
To have the pull request merged after all the requirements have been met, add the `--auto` flag.
Run the following to resolve the merge conflicts locally:
  gh pr checkout 5 && git fetch origin main && git merge origin/main
```

`main` moved since the contributor started, and both sides changed the same lines: a merge conflict. GitHub cannot choose for you. Either ask the contributor to update their branch, or resolve it yourself with the commands `gh` prints. The lesson [Branch and merge](lesson:branch-and-merge) teaches how to resolve a conflict.

## Under the hood

You fetched a pull request with `pull/4/head`. Where does that name come from, and why did a normal `git fetch` never show it to you? The answer is on the server, and one command lets you look.

### The server's list of refs

`git ls-remote origin` asks a remote for every ref it has and prints them, without downloading anything. It is a [plumbing](term:plumbing) command: a low-level tool you rarely need day to day. Here it shows what GitHub really stores:

```console
$ git ls-remote origin
6955f851b940d2bd279f7dbf77b294053af899f5	HEAD
0e559b605e72f03ec2ada17d2b0efc272f2c9ea3	refs/heads/add-green-salad
a254e7510dc3543d19aa7e1aa0631fb0d87a34c5	refs/heads/add-tomato-soup
6955f851b940d2bd279f7dbf77b294053af899f5	refs/heads/main
6202adf3c350a1a77d05fc1f1b5250db7779c954	refs/pull/1/head
1000cc8c72d1719f3a4bf0faaf9e048d1721f5ea	refs/pull/2/head
66b109bef8a5063c89b70806ea98eb35a47dfcf6	refs/pull/3/head
a254e7510dc3543d19aa7e1aa0631fb0d87a34c5	refs/pull/4/head
a534695e2c310ffeafcf4536dd732817d9134bf3	refs/pull/4/merge
0e559b605e72f03ec2ada17d2b0efc272f2c9ea3	refs/pull/5/head
4cb2411317c9dd77b825e1c696fd0e6a0c15e864	refs/pull/5/merge
```

Each line is a commit ID and the ref that points at it.

- `refs/heads/...` are the branches. In this practice repository the contributors' branches are here too, because one account plays every role. With a real fork they would be missing, and the `refs/pull/` lines would be your only way in.
- `refs/pull/4/head` points at the newest commit of pull request 4. Compare the IDs: it is the same commit as `refs/heads/add-tomato-soup`.
- `refs/pull/4/merge` is a commit GitHub prepared: what `main` would look like if you merged pull request 4 now. It is there while the pull request is open: once pull request 4 was merged and pull request 5 closed, both `merge` lines were gone from this list.
- Pull requests 1, 2 and 3 are closed, and their `head` refs are still there. GitHub keeps a pull request's commits even after its branch is deleted.

### Why a normal fetch skips them

A plain `git fetch origin` follows the rule written in `.git/config`:

```ini
[remote "origin"]
	url = https://github.com/you/gitremastered-practice-maintaining-github-repo.git
	fetch = +refs/heads/*:refs/remotes/origin/*
```

The `fetch` line is a [refspec](term:refspec): a rule that maps names on the server to names in your repository. This one says "copy everything under `refs/heads/` into `refs/remotes/origin/`". Pull request refs live under `refs/pull/`, outside that rule, so a clone or a fetch never brings them. Pro Git calls them pseudo-branches: there, but out of sight.

When you type `git fetch origin pull/4/head:pr-review`, you give Git a refspec of your own for one fetch. The lesson [Refspecs](lesson:refspecs) takes the syntax apart.

Leave out the destination, and Git still downloads the commits but writes no branch. It records the commit in a file named `.git/FETCH_HEAD`, which you can use as a name until the next fetch:

```console
$ git fetch origin refs/pull/5/head
From https://github.com/you/gitremastered-practice-maintaining-github-repo
 * branch            refs/pull/5/head -> FETCH_HEAD
```

### You can read them, not write them

The pull request refs belong to GitHub. A push to one is refused:

```console
$ git push origin main:refs/pull/4/head
To https://github.com/you/gitremastered-practice-maintaining-github-repo.git
 ! [remote rejected] main -> refs/pull/4/head (deny updating a hidden ref)
error: failed to push some refs to 'https://github.com/you/gitremastered-practice-maintaining-github-repo.git'
```

Only a push to the pull request's real branch moves `refs/pull/4/head`.

:::try-it
1. In the same challenge as before, run `git ls-remote origin`. Git prints the server's refs. Find the line `refs/pull/<number>/head` with the highest number: that is Lina's pull request. Lower numbers, if you see any, are pull requests from earlier attempts.
2. Compare that line's commit ID with the line `refs/heads/add-lentil-soup`. The two IDs are the same: the pull request ref and Lina's branch point at one commit.
3. Run `git fetch origin refs/pull/<number>/head` with your number. Git prints `refs/pull/<number>/head -> FETCH_HEAD`. In the picture nothing moves: this fetch names no destination, so Git makes no branch.
4. Run `git log --oneline -1 FETCH_HEAD`. Git shows one commit, "Add lentil soup". The commit is in your repository, and it still has no branch: that part is left for the challenge.
:::

## Advanced

Fetching pull requests one at a time is fine for a small project. These topics are for busier repositories and for the rare administrative jobs.

### Fetch every pull request at once

Pro Git shows how to add a second `fetch` line, so that every `git fetch` also brings all pull requests. One command adds it:

```console
$ git config --local --add remote.origin.fetch "+refs/pull/*/head:refs/remotes/origin/pr/*"
$ git fetch origin
From https://github.com/you/gitremastered-practice-maintaining-github-repo
 * [new ref]         refs/pull/1/head -> origin/pr/1
 * [new ref]         refs/pull/2/head -> origin/pr/2
 * [new ref]         refs/pull/3/head -> origin/pr/3
 * [new ref]         refs/pull/4/head -> origin/pr/4
 * [new ref]         refs/pull/5/head -> origin/pr/5
```

Each pull request is now a [remote-tracking branch](term:remote-tracking-branch) such as `origin/pr/4`: read-only, and updated by every fetch. To try one, run `git switch --detach origin/pr/4`. On a project with thousands of pull requests this downloads a lot, so use it where you review many of them.

:::compare
today: "`git switch --detach origin/pr/4` looks at a fetched pull request without making a branch."
book: "`git checkout pr/2` makes a local branch that tracks `origin/pr/2`. It still works."
:::

### Test the merge before you merge

`refs/pull/<number>/merge` holds the result of the merge, made by GitHub in advance. Fetch it to test "main plus this pull request" instead of the pull request alone:

```console
$ git fetch origin pull/4/merge:pr-4-merged
From https://github.com/you/gitremastered-practice-maintaining-github-repo
 * [new ref]         refs/pull/4/merge -> pr-4-merged
$ git log --oneline --graph -4 pr-4-merged
*   a534695 Merge a254e7510dc3543d19aa7e1aa0631fb0d87a34c5 into 6955f851b940d2bd279f7dbf77b294053af899f5
|\  
| * a254e75 Add tomato soup
|/  
* 6955f85 Add README, two recipes and the check
```

This matters when `main` moved since the contributor started: their branch may pass its tests alone and fail once joined with the newer `main`. This test commit is thrown away; the real merge makes a new one.

### Without the pull request refs

Pro Git lists two older ways to get a pull request's work, both printed in GitHub's notification email:

- `git pull <url> <branch>` merges a branch from the contributor's fork once, without adding a remote.
- Adding `.patch` or `.diff` to a pull request's web address gives its commits as plain text. The lesson Integrate contributed work shows `git am`, the command that applies such patches.

### A pull request on a pull request

A pull request can target any branch, not only `main`. Pro Git's example: you see a pull request going the right way and have an idea that builds on it. Open your pull request against that pull request's branch. On the "open a pull request" page, the **base** box at the top chooses the target branch; with `gh`, it is `gh pr create --base <branch>`.

### More than one template

- Several pull request templates go in a folder `.github/PULL_REQUEST_TEMPLATE/`. Several issue templates go in `.github/ISSUE_TEMPLATE/`, one file per kind of issue ("Bug report", "Feature request").
- An issue template can be a **form**: a settings file (in the YAML format, ending in `.yml`) that describes required fields and dropdowns, instead of free text.

### Change the default branch

The default branch is the one GitHub shows first, the one a new clone starts on, and the one new pull requests target. To change it: the repository's **Settings**, then the **Default branch** part of the first page, then pick another branch. Do it rarely and tell the team: open pull requests keep their old target, and everyone's habits point at the old name.

### Transfer a repository

You can hand a repository to another user or to an organization (a shared account for a team, taught in the lesson Organizations, teams and permissions): **Settings**, then **Transfer** in the "Danger Zone" at the bottom of the first page. Pro Git names the two usual reasons: you stop maintaining the project and someone takes over, or the project grows and moves into an organization.

The issues, pull requests, stars and watchers move with it. GitHub redirects the old address to the new one, for browsers and for `git clone`, `git fetch` and `git push`. Still, point your remote at the new address with `git remote set-url origin <new address>`: the redirect breaks if you later create a repository with the old name.

### Filter notification emails

Pro Git points at the hidden headers of GitHub's emails. `Message-ID` holds `<user>/<project>/<type>/<number>`, with `pull` or `issues` as the type, and `List-ID` names the repository. A mail rule on these sorts notifications per project. Many maintainers turn email off and use the website's inbox only.

## Recap

- A maintainer decides what goes in. Collaborators can push directly; everyone else contributes through pull requests.
- GitHub keeps `refs/pull/<number>/head` for every pull request. `git fetch origin pull/<number>/head:<branch>` brings one to your computer without touching `main`; `gh pr checkout <number>` fetches and switches in one step.
- Test first. Then `gh pr merge <number> --merge` and `git pull`, or `gh pr close <number> --comment "<why>"`.
- `git ls-remote origin` shows every ref on the server. A normal fetch copies only `refs/heads/*`, which is why pull request refs stay out of sight.
- `README.md`, `CONTRIBUTING.md`, `LICENSE`, `CODE_OF_CONDUCT.md`, `SECURITY.md` and the templates in `.github/` are found by name. Templates work once they are on the default branch.
