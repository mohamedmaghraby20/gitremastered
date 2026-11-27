---
id: checkpoint-working-in-a-team
title: "Checkpoint: Working in a team"
module: working-in-a-team
bookSection: "5 Distributed Git"
bookUrl: https://git-scm.com/book/en/v2/Distributed-Git-Distributed-Workflows
bookSources:
  - vendor/progit2/book/05-distributed-git/sections/distributed-workflows.asc
  - vendor/progit2/book/05-distributed-git/sections/contributing.asc
  - vendor/progit2/book/05-distributed-git/sections/maintaining.asc
  - vendor/progit2/book/03-git-branching/sections/workflows.asc
  - vendor/progit2/book/03-git-branching/sections/rebasing.asc
  - vendor/progit2/book/06-github/sections/2-contributing.asc
readFirst: [team-workflows, commit-craft, github-flow-prs, code-review, team-contributing, rebasing, pr-merge-strategies, integrating-work]
checkpoint: true
---

Eight lessons taught you how a team shares one history: agree on branches, make commits a teammate can read, ask for a merge with a pull request, review, rebase, and bring in other people's work. Here you prove you can combine them, in three situations from a normal week on a team, with no hints.

## Must know

This page teaches nothing new. It is the module on one page: the commands worth remembering, one table per lesson, and the lesson to go back to when a row looks unfamiliar. Read it once, then take the challenges below.

A checkpoint is optional. Its challenges mix the lessons, so each one needs commands from at least two of the tables.

### Where the challenges run

The first two challenges run on your computer only. The third runs on GitHub, like the challenges of [Forks, GitHub Flow and pull requests](lesson:github-flow-prs): the app builds a public repository named `gitremastered-practice-checkpoint-working-in-a-team` on your account, `origin` points at it, and you use `git` and `gh` side by side. A teammate named Tariq appears in it. His pull request is opened from your account, because the practice has no second person.

### Agree on the branches

From [Team workflows: topic branches, trunk-based, Git Flow](lesson:team-workflows).

| Command | Job |
|---|---|
| `git switch -c <topic> main` | Start a [topic branch](term:topic-branch): one job, one short-lived branch |
| `git merge <topic>`, then `git branch -d <topic>` | Finish the job: merge the topic branch and delete it |
| `git switch -c <hotfix> main` | Start a [hotfix](term:hotfix) from `main`, because `main` is what users run |
| `git merge <hotfix>` on `main`, then again on `develop` | A hotfix goes into both, so the next release does not bring the bug back |

The three branching models:

| Model | Long-running branches | A topic branch lives |
|---|---|---|
| Trunk-based development | `main` only | Hours to a day or two |
| GitHub Flow | `main` only | Days, until its review is done |
| [Git Flow](term:git-flow) | `main` and `develop` | Days to weeks |

### Make commits a teammate can read

From [Commit messages and atomic commits](lesson:commit-craft).

| Command | Job |
|---|---|
| `git status -s`, then `git diff` | See everything that changed, before you decide what belongs together |
| `git add <files of one job>` | Stage one job only. `git add .` and `git commit -a` stage everything |
| `git diff --staged` | Read what is staged: your last look before it becomes history |
| `git diff --check` | List whitespace errors in your changes; add `--staged` for staged ones |
| `git commit -v` | Write the message with the diff shown below it |
| `git commit -m "Subject" -m "Body"` | A subject and a body paragraph without opening the editor |

The message shape: a subject of about 50 characters written as an order ("Fix", not "Fixed"), a blank line, then a body wrapped at about 72 characters that says why.

### Ask for a merge: the pull request

From [Forks, GitHub Flow and pull requests](lesson:github-flow-prs).

| Command | Job |
|---|---|
| `git push -u origin <branch>` | Put the topic branch on GitHub and record its upstream |
| `gh pr create` | Open a [pull request](term:pull-request) from the branch you are on; `--title`, `--body` and `--base` give it everything in one line |
| `gh pr create --draft` | Open it as a draft: visible, but marked as not ready |
| `git push` (again) | Update the pull request. It follows the branch |
| `git fetch origin`, then `git merge origin/main`, then `git push` | Bring a stale topic branch up to date with `main` |
| `gh pr merge --merge --delete-branch` | Merge, delete the branch in both places and update your `main` |
| `git fetch --prune` | Remove remote-tracking branches whose branch on GitHub is gone |

Write `Fixes #2` in the pull request's text and GitHub closes issue 2 when the pull request is merged.

### Review, and answer a review

From [Reviewing a pull request](lesson:code-review).

| Command | Job |
|---|---|
| `gh pr list` | The open pull requests, with number and branch |
| `gh pr view <branch> --comments` | The description and the conversation |
| `gh pr diff <branch>` | What the pull request changes, in the terminal |
| `gh pr checkout <number or branch>` | Put the pull request's branch on your computer, to run it |
| `gh pr review --comment -b "text"` | Submit a review that neither approves nor blocks |
| `gh pr review --approve` | "This can be merged." Not possible on your own pull request |
| `gh pr review --request-changes -b "text"` | "This must be fixed first." Not possible on your own pull request either |
| `gh pr comment -b "text"` | As the author: say the fix is pushed |

### Three team setups

From [Contributing in real teams: small team, managed team, public fork](lesson:team-contributing).

| Setup | You may push to | The routine |
|---|---|---|
| Small team | `main` | `git fetch origin`, read `git log --no-merges <topic>..origin/main`, merge your topic branch and `origin/main` into `main`, `git push origin main` |
| Managed team | Feature branches only | `git push -u origin <branch>`; the integrators merge. Start new work from `origin/main` |
| Public project | Only your fork | `origin` is your fork, `upstream` is the project. One topic branch per contribution |

| Command | Job |
|---|---|
| `git remote add upstream <address>` | Give the original project a name beside `origin` |
| `git fetch upstream`, `git merge upstream/main`, `git push origin main` | Bring your fork level with the project |
| `git push --force-with-lease origin <branch>` | Replace your own pushed branch after a rebase |

### Rebase

From [Rebasing, and when not to](lesson:rebasing).

| Command | Job |
|---|---|
| `git rebase <base>` | Make the commits of the branch you are on again, on top of `<base>` |
| Fix the file, `git add <file>`, `git rebase --continue` | Get past a conflict in the middle of a rebase |
| `git rebase --skip` | Drop the commit the rebase stopped on |
| `git rebase --abort` | Go back to before the rebase |
| `git reset --hard ORIG_HEAD` | Undo a rebase that just finished |
| `git pull --rebase` | Fetch, then rebase your unpushed commits instead of merging |
| `git rebase --onto <new-base> <old-base> <branch>` | Move only the commits that are not on `<old-base>` |

:::careful
The golden rule: do not rebase commits that exist outside your repository and that people may have based work on. A pushed topic branch that only you work on is fine, and needs `git push --force-with-lease` afterwards. Never rebase or force-push `main` or a branch teammates commit to.
:::

### Merge a pull request three ways

From [Merge, squash or rebase-merge a pull request](lesson:pr-merge-strategies).

| Command | What lands on `main` | Is `git branch -d` happy afterwards? |
|---|---|---|
| `gh pr merge <branch> --merge` | Your commits, plus a merge commit with two parents | Yes |
| `gh pr merge <branch> --squash` | One new commit with all the changes | No: "not fully merged" |
| `gh pr merge <branch> --rebase` | A new copy of each commit, no merge commit | No: "not fully merged" |

| Command | Job |
|---|---|
| `git pull` on `main` | The merge happened on GitHub: bring it to your computer |
| `git diff main <branch>` | Prints nothing when `main` already has everything the branch has |
| `git branch -D <branch>` | Delete a squashed or rebase-merged branch, once the diff is empty |
| `git push origin --delete <branch>` | Delete the branch on GitHub |
| `gh pr merge <branch> --squash --subject "Title"` | Choose the squash commit's title yourself |

### Bring in other people's work

From [Bring in others' work: cherry-pick, topic branches, what a change introduces](lesson:integrating-work).

| Command | Job |
|---|---|
| `git log --oneline main..<topic>` | The commits the branch would bring into `main` |
| `git log --no-merges -p main..<topic>` | The same without merge commits, each with its diff |
| `git diff main...<topic>` | Three dots: the whole change a merge would introduce |
| `git cherry-pick <commit>` | Copy one commit's change onto your branch, as a new commit |
| Fix the file, `git add <file>`, `git cherry-pick --continue` | Get past a conflict in a pick |
| `git cherry-pick --abort` | Go back to before the pick |
| `git cherry-pick -x <commit>` | Add a line to the message that names the original commit |

### How to read the picture in these challenges

The history map shows the difference between the tools. A merge joins two rows with one station. A rebase or a cherry-pick puts new stations on the row you chose, and the originals stay where they were until no branch reaches them. After a squash merge on GitHub, `git pull` adds a single station to `main`, and your topic branch still sits on its own row.

## Under the hood

These are the ideas behind the tables. If one of them surprises you, the lesson named beside it explains it with a worked example.

### Git does not know your workflow

`main`, `develop` and `hotfix-…` are ordinary branches. Git gives none of them a special role: a [workflow](term:workflow) is an agreement between people. "More stable" only means "further back on the same history". ([Team workflows: topic branches, trunk-based, Git Flow](lesson:team-workflows))

### One commit, one job

An [atomic commit](term:atomic-commit) holds one job, so a teammate can review it, undo it or pick it without dragging something else along. The message lives inside the commit object, so changing a message makes a new commit. ([Commit messages and atomic commits](lesson:commit-craft))

### A pull request is not a Git object

A pull request is a record on GitHub that names a head branch and a base branch. It follows the head branch, which is why a push updates it, and why a force push after a rebase updates it too. A review is stored on GitHub as well, attached to the commit it looked at. ([Forks, GitHub Flow and pull requests](lesson:github-flow-prs), [Reviewing a pull request](lesson:code-review))

### Copies have new IDs

A [rebase](term:rebase) and a [cherry-pick](term:cherry-pick) both make new commits: the same change, a different parent, so a different ID. The originals are not moved. This one fact explains the golden rule, the rejected push after a rebase, and why the same change can appear twice in a history. ([Rebasing, and when not to](lesson:rebasing), [Bring in others' work: cherry-pick, topic branches, what a change introduces](lesson:integrating-work))

### Why Git calls a squashed branch unmerged

`git branch -d` asks one question: is the branch's newest commit in the history of the branch you are on? After a [squash merge](term:squash-merge) or a [rebase-merge](term:rebase-merge), `main` holds the same changes in new commits, and the branch's own commits are not there. Git answers "not fully merged" although no work is missing. ([Merge, squash or rebase-merge a pull request](lesson:pr-merge-strategies))

### Three dots measure from the merge base

`git diff main...topic` compares the tip of `topic` with the [merge base](term:merge-base), the last commit both branches share. That is exactly what a merge would bring in. Two dots compare the two newest snapshots, so `main`'s own newer work shows up as if the branch removed it. ([Bring in others' work: cherry-pick, topic branches, what a change introduces](lesson:integrating-work))

### A fork is a second remote

A [fork](term:fork) is your own copy of a project on GitHub. On your computer it is nothing more than a second block in the settings: `origin` for your copy, `upstream` for the project. ([Contributing in real teams: small team, managed team, public fork](lesson:team-contributing))

## Advanced

Teamwork is where the rest of the course keeps coming back to. This is where each skill returns.

### Rewriting your own commits before a review

The rebase of this module moves commits. The same command with `-i` also rewords, squashes, reorders and splits them: [Reword, squash, reorder, split; fixup and autosquash](lesson:clean-up-history). Staging part of a file, for the case where one file holds two jobs, is in [Stage part of a file](lesson:partial-staging).

### Force-pushing without hurting anyone

The third challenge uses `--force-with-lease` after a rebase. [Force-pushing safely with --force-with-lease](lesson:force-push-safely) explains what the lease checks and when it does not protect you.

### Harder merges

A conflict in a rebase or a cherry-pick is resolved like a conflict in a merge. The tools for the difficult ones are in [Hard conflicts, merge strategies and rerere](lesson:advanced-merging). When a merged change turns out to be wrong, [Undo a pushed commit with revert](lesson:revert-a-commit) takes it back without rewriting shared history.

### Rules the repository enforces

In this module the rules ("every pull request gets a review", "squash only") were agreements. The GitHub lessons later in the course turn them into settings: required reviews and required checks in [Branch protection, rulesets and CODEOWNERS](lesson:branch-protection-codeowners), and tests that run on every pull request in [CI with GitHub Actions](lesson:github-actions-ci).

### The whole thing, end to end

The capstones "A team sprint and a release" and "Contribute to an open-source project" run a full round of this module's skills on GitHub, with tags and a release at the end.

## Recap

- One job per topic branch and per commit. A hotfix starts from `main` and goes into `main` and `develop`.
- `git push -u origin <branch>`, `gh pr create`, review with `gh pr checkout` and `gh pr review`, then `gh pr merge` with `--merge`, `--squash` or `--rebase`, and `git pull` on `main`.
- `git rebase <base>` rebuilds your commits on a new base: fix, `git add`, `git rebase --continue` on a conflict. Only rebase what is yours, and push it with `--force-with-lease`.
- `git log main..<topic>` and `git diff main...<topic>` show what a branch would bring in; `git cherry-pick <commit>` takes one commit of it.
- After a squash or a rebase-merge, check `git diff main <branch>` is empty, then `git branch -D <branch>`.
