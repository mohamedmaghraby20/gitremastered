---
id: capstone-open-source
title: "Capstone: Contribute to an open-source project"
module: capstones
bookSection: "6.2 Contributing to a Project"
bookUrl: https://git-scm.com/book/en/v2/GitHub-Contributing-to-a-Project
bookSources:
  - book/progit2/book/06-github/sections/2-contributing.asc
  - book/progit2/book/06-github/sections/3-maintaining.asc
  - book/progit2/book/05-distributed-git/sections/contributing.asc
readFirst: [github-flow-prs, code-review, team-contributing, maintaining-github-repo, branch-protection-codeowners]
checkpoint: true
---

You found a project you use every day, and you want to fix something in it. You may not push to it, the maintainer has never heard of you, and one day you may run a project like it yourself. This capstone has you do both jobs on real GitHub repositories, with no hints: send a contribution and get it merged, then sit in the maintainer's chair.

## Must know

This page teaches nothing new. It is a briefing for the three challenges below, then a cheat sheet that collects the commands from across the course that the job needs. Read it once, then take the challenges.

### The briefing

The project is a small trail guide: a few text files about walks near a city. It is **open source**, which means anyone may read it and offer changes. Only its **[maintainer](term:maintainer)**, the person who runs it, may push to it.

You work with two repositories on GitHub:

| Remote name | Repository | What it is | What you do with it |
|---|---|---|---|
| `upstream` | `gitremastered-practice-capstone-open-source-upstream` | The project everyone shares | Fetch from it; pull requests are opened here |
| `origin` | `gitremastered-practice-capstone-open-source` | Your own copy of the project | Keep it level with the project |

A **pull request** is a page on GitHub that says "please merge this branch into `main`", where the change is discussed before anyone merges it. Every challenge here turns around one.

The three challenges follow one story:

| Challenge | Your role | The job |
|---|---|---|
| Easy | Contributor | Catch your copy up with the project, then send a new trail as a pull request |
| Medium | Contributor | The maintainer asks for changes: fix, rebase, reply, get merged, tidy up |
| Hard | Maintainer | Review and merge a stranger's pull request, then give the project a CONTRIBUTING file and a CODEOWNERS file |

Other people's parts are played for you. When a challenge starts, the app pushes the maintainer's commits and opens or comments on pull requests, all from your own GitHub account. So a comment "from Salma" carries your user name on GitHub.

### What differs from a real fork

On a real project your copy is a **fork**: a copy of the project under your own account, which GitHub makes when you press the **Fork** button on the project's page. GitHub remembers that the fork belongs to the project. That link is what lets you open a pull request from a branch in your fork into the project, without any right to push to the project.

One personal account cannot fork its own repository, and this course never asks you for a second account. So the two practice repositories are plain, unlinked repositories. Two things follow, and the challenges say so again where it matters:

| With a real fork | In this capstone |
|---|---|
| You push your topic branch to `origin`, your fork | You push your topic branch to `upstream`, as a collaborator with push rights would |
| The maintainer merges your pull request | You merge it yourself, because the project is yours too |
| The maintainer can approve your pull request | GitHub refuses the approval: nobody may approve their own pull request. You submit a review with a comment |

Everything else is what you would type for a real project: the two remotes, the sync, the topic branch, the rebase, the review, the merge.

### Step 1: two remotes

From [Work with remotes: fetch, pull, push](lesson:remotes) and the lesson [Contributing in real teams: small team, managed team, public fork](lesson:team-contributing).

| Command | Job |
|---|---|
| `git remote -v` | List the remotes with their addresses |
| `git remote get-url origin` | Print one remote's address |
| `git remote add upstream <address>` | Give the project's address the name `upstream` |
| `git fetch upstream` | Download the project's new commits. Your branches do not move; `upstream/main` does |
| `git log --oneline main..upstream/main` | The commits the project has and your `main` lacks |

The word [upstream](term:upstream) has two meanings. Here it is the name of a remote: the project you copied. In `git branch -vv` it is the branch that a local branch follows.

### Step 2: keep your copy in sync

Your copy does not follow the project by itself. New commits travel through your computer, in three steps.

| Command | Job |
|---|---|
| `git switch main` | Stand on the branch that receives the commits |
| `git fetch upstream` | Download the project's commits |
| `git merge upstream/main` | Move your `main` forward to the project's `main`. A fast-forward, as long as you never commit on `main` yourself |
| `git push origin main` | Send the same commits on to your copy on GitHub |
| `git pull upstream main` | Fetch and merge in one step |

For a real fork, `gh repo sync` and the "Sync fork" button on the fork's page do the same.

### Step 3: one topic branch per contribution

From [Team workflows: topic branches, trunk-based, Git Flow](lesson:team-workflows) and [Remote and tracking branches](lesson:remote-branches). A [topic branch](term:topic-branch) is a short-lived branch for one job. Your `main` only follows the project; you never commit on it.

| Command | Job |
|---|---|
| `git switch -c add-forest-path` | Start the branch on the commit you are on, so sync `main` first |
| `git add <file>`, then `git commit -m "..."` | Commit the work on the branch |
| `git push -u <remote> add-forest-path` | Publish the branch and make the local branch follow it |
| `git log --oneline --graph --all` | Check where every branch and remote-tracking branch is |

:::graph
caption: "A contribution ready to send: main is level with the project, and the topic branch adds one commit on top"
commits:
  - id: A
    message: Add lake loop
  - id: B
    message: Add ridge walk
    parents: [A]
  - id: C
    message: Add forest path
    parents: [B]
branches:
  main: B
  add-forest-path: C
remotes:
  upstream/main: B
  origin/main: B
head: add-forest-path
:::

### Step 4: open the pull request

From the lessons [Forks, GitHub Flow and pull requests](lesson:github-flow-prs) and [The gh CLI, the API and webhooks](lesson:gh-cli-and-api). `gh` is GitHub's own command-line program; it does from the terminal what the buttons on the website do.

| Command | Job |
|---|---|
| `gh pr create --base main --head <branch> --title "..." --body "..."` | Open a pull request from the branch into `main` |
| `gh pr create --fill` | The same, with title and text taken from your commits |
| `gh pr list` | The open pull requests |
| `gh pr view <branch> --comments` | Read one pull request and its conversation |
| `gh pr view <branch> --web` | Open its page in the browser |
| `gh pr status` | The pull requests that concern you |

With both `origin` and `upstream` set up, `gh` works on the project, `upstream`. `gh repo set-default --view` prints the repository it uses.

A good pull request is small, does one thing, and says why. Writing `Fixes #12` in its text closes issue 12 when the pull request is merged.

### Step 5: answer the review

From the lesson [Reviewing a pull request](lesson:code-review), [Rebasing, and when not to](lesson:rebasing) and the lesson [Force-pushing safely with --force-with-lease](lesson:force-push-safely).

A pull request follows its branch. You never open a second one to answer a review: you push more commits to the same branch, and the page updates.

| Command | Job |
|---|---|
| `git commit -am "Fix ..."`, then `git push` | Answer a comment with a new commit |
| `gh pr comment <branch> -b "Done: ..."` | Reply in the conversation |
| `git fetch upstream`, then `git rebase upstream/main` | Replay your commits on top of the project's newest commit |
| `git push --force-with-lease <remote> <branch>` | Replace the branch on GitHub after a rebase. Refused when someone else pushed to it in the meantime |
| `git merge upstream/main` (on the topic branch) | The other way to catch up: no rewrite, no force, one merge commit |

:::sidenote
Pro Git shows the merge way in this section and advises against force-pushing over a branch with an open pull request, because someone may have built on it. Many projects ask for a rebase anyway, to keep a straight history. Do what the project's CONTRIBUTING file or its maintainer asks. A topic branch that only you work on is the one place where a rebase after pushing is accepted.
:::

:::careful
After a rebase, a plain `git push` is rejected: the rebased commits are new commits, and the old branch on GitHub is not their ancestor. Never answer that with `git pull`, which would merge the old copies back in. Use `git push --force-with-lease`, and only on your own topic branch.
:::

### Step 6: after the merge

From the lesson "Forks, GitHub Flow and pull requests" and [Remote and tracking branches](lesson:remote-branches).

| Command | Job |
|---|---|
| `gh pr merge <branch> --merge` | Merge with a merge commit: every commit kept, plus one that joins the lines |
| `gh pr merge <branch> --squash` | Merge as one new commit that holds the whole change |
| `gh pr merge <branch> --rebase` | Copy every commit onto `main`, in a straight line |
| `git switch main`, `git pull upstream main`, `git push origin main` | Bring the merged work to your `main` and to your copy |
| `git push <remote> --delete <branch>` | Delete the branch on GitHub |
| `git branch -d <branch>` | Delete the local branch; `-D` when Git refuses (see Under the hood) |

On a real project you do not run `gh pr merge`: the maintainer does. You are told by a notification, and the page turns purple.

### The maintainer's side

From the lessons [Run a repository: collaborators, managing pull requests, README, CONTRIBUTING](lesson:maintaining-github-repo) and "Reviewing a pull request", and [Bring in others' work](lesson:integrating-work).

| Command | Job |
|---|---|
| `gh pr list` | What is waiting for you |
| `gh pr checkout <branch or number>` | Get the pull request's branch onto your computer, to read and run it |
| `git log --oneline main..HEAD` | The commits the pull request would add |
| `git diff main...HEAD` | The whole change it would make, three dots: compared with where the branch started |
| `gh pr diff <branch>` | The same change, as GitHub shows it |
| `gh pr review <branch> --comment -b "..."` | Submit a review that only comments |
| `gh pr review <branch> --approve` | Approve. Not possible on a pull request you opened yourself |
| `gh pr review <branch> --request-changes -b "..."` | Ask for changes before it can go in |
| `gh pr merge <branch> --squash` | Take a branch with "oops" commits as one clean commit |
| `gh pr close <branch> --comment "..."` | Turn it down, with a kind reason |

A review is one of three verdicts: comment, approve, request changes. A plain comment in the conversation is not a review.

### The project's own rules

From the lessons "Run a repository" and [Branch protection, rulesets and CODEOWNERS](lesson:branch-protection-codeowners).

| File | Job |
|---|---|
| `README.md` | What the project is. GitHub shows it on the project's front page |
| `CONTRIBUTING.md` | How to contribute. GitHub links to it when someone opens a pull request |
| `.github/CODEOWNERS` | Who is responsible for which files. GitHub asks those people to review pull requests that change them |

A CODEOWNERS file has one rule per line: a path pattern, then one or more owners, each written as `@` and a user name.

```text
# Lines that start with # are comments.
*        @salma
docs/    @nour
```

- `*` matches every file.
- When several lines match a file, the last one wins. Here `docs/` belongs to `@nour` alone.
- GitHub looks for the file in `.github/`, then in the top folder, then in `docs/`, and uses the first it finds.
- By itself the file only requests reviews. A branch rule ("require review from code owners") turns the request into a requirement.

A maintainer who wants to be believed follows the project's rules too: the rules go in through a pull request, like any other change.

### How to read the picture in these challenges

The history map shows your local repository, with three kinds of labels on `main`'s row: `main`, `origin/main` (your copy on GitHub, as of your last fetch or push) and `upstream/main` (the project, as of your last fetch). When the three labels sit on one commit, your copy is in sync. The goals about pull requests are read from GitHub every few seconds; "Check GitHub now" reads them at once.

## Under the hood

The cheat sheet says what to type. These are the ideas that explain why the steps are in that order.

### Git knows nothing about forks

To Git, `origin` and `upstream` are two names for two addresses, each with its own set of remote-tracking branches (`origin/main`, `upstream/main`). "Fork" is a feature of GitHub: a record on the server that one repository was copied from another. That is why this capstone can practise the whole routine with two unlinked repositories, and why the one thing it cannot show is a pull request that crosses from one repository to the other.

### A pull request is a branch, a target and a conversation

GitHub stores which branch you offer (the head), which branch should receive it (the base), and the comments. It does not store a copy of your commits at the time you opened it. It shows whatever the head branch holds now, so a push to the branch, or a force push after a rebase, updates the pull request. GitHub also keeps a ref for each pull request, `refs/pull/<number>/head`, which is how a maintainer can fetch a contributor's work without access to the fork: `git fetch upstream pull/7/head:pr-7`.

### Sync goes through your computer

GitHub does not copy commits from the project to your copy when you fetch. `git fetch upstream` brings them to your computer, `git merge` moves your `main`, and `git push origin main` uploads them to your copy. Skip the last step and your computer is up to date while your copy on GitHub is not.

### Three merge methods, three histories

| Method | What lands on `main` | The contributor's commit IDs |
|---|---|---|
| Merge commit | The contributor's commits, plus a commit with two parents | Kept |
| Squash | One new commit with the whole change | Gone from `main`: one new ID |
| Rebase | A copy of each commit, in a straight line | New IDs: copies, not the originals |

After a squash or a rebase merge, your local topic branch still holds the original commits, and none of them is in `main`'s history. `git branch -d` looks at exactly that, so it may refuse with "not fully merged" although the work is in. Once you have seen that the pull request is merged, `git branch -D` is the right answer.

### Reviews and owners live on GitHub

An approval, a requested change, a rule that protects `main`: none of it is in the Git repository. A clone does not carry it. The CODEOWNERS file is the exception that is half and half: the file is ordinary tracked content, but only GitHub acts on it, and it reads the copy on the pull request's base branch. So a pull request that adds the CODEOWNERS file is not yet covered by it.

## Advanced

Three challenges cannot hold a whole open-source career. This is what a real project adds, and where the course teaches it.

### A real fork, from the first command

`gh repo fork <owner>/<project> --clone` makes the fork, clones it, and sets up both remotes: `origin` for your fork and `upstream` for the project. From there the steps are this page's steps, with one change: the topic branch goes to `origin`, and `gh pr create` opens the pull request across the two repositories.

### Before your first pull request to strangers

- Read the project's `CONTRIBUTING.md` and a few merged pull requests. They show the commit style, the branch to target, and how much explanation people expect.
- For anything larger than a typo, open an issue first and ask whether the change is welcome.
- Keep the pull request to one topic. Two fixes are two branches and two pull requests.
- Write commit messages the way [Commit messages and atomic commits](lesson:commit-craft) teaches: a maintainer reads them before the code.

### Checks, rules and permissions

Larger projects run tests on every pull request and refuse a merge until they pass; the lesson [CI with GitHub Actions](lesson:github-actions-ci) covers that. They protect `main` with rules, as in "Branch protection, rulesets and CODEOWNERS", and they hand out rights through teams, as in [Organizations, teams and permissions](lesson:orgs-teams-permissions). Organizations and teams need more than a free personal account, which is why this capstone leaves them out.

### Releases

A maintainer's work ends with a version people can install. [Tags and GitHub releases](lesson:tags-and-releases) shows how to tag a commit and publish it.

### When the project does not use pull requests

Some projects, Git itself among them, take patches by email. The steps differ and the habits stay the same: a topic branch, small commits, a rebase on the project's current state before you send. Pro Git 5.2 "Contributing to a Project" describes that route.

## Recap

- Two remotes: `origin` is your copy, `upstream` is the project. Sync with `git fetch upstream`, `git merge upstream/main`, `git push origin main`.
- One topic branch per contribution, started from an up-to-date `main`. Never commit on your `main`.
- `gh pr create` opens the pull request; more pushes to the same branch update it. After a rebase: `git push --force-with-lease`, on your own branch only.
- As maintainer: `gh pr checkout`, read with `git log main..HEAD` and `git diff main...HEAD`, then `gh pr review` and `gh pr merge --merge`, `--squash` or `--rebase`.
- `CONTRIBUTING.md` tells people how to contribute; `.github/CODEOWNERS` tells GitHub whom to ask for a review.
