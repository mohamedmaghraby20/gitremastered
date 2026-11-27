---
id: capstone-team-release
title: "Capstone: A team sprint and a release"
module: capstones
bookSection: "5.1 Distributed Workflows"
bookUrl: https://git-scm.com/book/en/v2/Distributed-Git-Distributed-Workflows
bookSources:
  - vendor/progit2/book/05-distributed-git/sections/distributed-workflows.asc
  - vendor/progit2/book/03-git-branching/sections/workflows.asc
  - vendor/progit2/book/03-git-branching/sections/basic-branching-and-merging.asc
  - vendor/progit2/book/03-git-branching/sections/rebasing.asc
  - vendor/progit2/book/07-git-tools/sections/advanced-merging.asc
  - vendor/progit2/book/07-git-tools/sections/rewriting-history.asc
  - vendor/progit2/book/02-git-basics/sections/tagging.asc
  - vendor/progit2/book/06-github/sections/2-contributing.asc
readFirst: [team-workflows, branch-and-merge, advanced-merging, rebasing, clean-up-history, tags-and-releases]
checkpoint: true
---

It is the last week before version 1.0. A teammate's work keeps landing on `main` while yours is still in review, two of you changed the same lines, and the release goes out on Friday. This capstone lets you prove you can carry a branch through all of that, from the first commit to a published release, with no hints.

## Must know

This page teaches nothing new. It has two parts: a briefing for the three challenges, and a cheat sheet of the commands from across the course that a sprint needs. Read it once, then take the challenges below.

A capstone is larger than a module checkpoint. Each challenge is a whole working day with several steps, and it mixes lessons from five modules: branching, remotes, teamwork, history and GitHub.

### The briefing

You work on the website of Riverside Runners, a running club. The team is you and Tariq. The project lives in a practice repository in your own GitHub account, `gitremastered-practice-capstone-team-release`. The app creates it when you start a challenge and puts it back in the starting state on every reset.

Tariq is played by the app. Before you start, he has already pushed commits and opened or merged a [pull request](term:pull-request), a request on GitHub to merge one branch into another. You see his work the way you would see a real teammate's: after a `git fetch`.

The three days:

| Challenge | The day | What it asks for |
|---|---|---|
| Day one (easy) | `main` moved while you worked | Rebase your branch onto the newest `main`, open a pull request, squash-merge it |
| Day two (medium) | Tariq pushed to your branch, and `main` conflicts with it in two files | Merge `main` into the shared branch, settle both conflicts, merge the pull request with a merge commit, clean up |
| Release day (hard) | Messy commits, a `main` that conflicts twice, and a release to cut | Reshape and rebase the branch, force-push it safely, rebase-merge the pull request, tag `v1.0`, publish a GitHub release |

Each day the team's rules differ a little, and the brief states them. Reading the rules and picking the matching commands is part of the test.

:::careful
You merge your own pull requests here, because you are alone in the practice repository. On a real team a teammate reviews first. GitHub does not let you approve your own pull request, so the review step is the one part of a sprint these challenges leave out.
:::

### One job, one branch

A sprint runs on [topic branches](term:topic-branch): one short-lived branch per job, merged and deleted when the job is done. From [Team workflows](lesson:team-workflows), [Branch, merge, and fix conflicts](lesson:branch-and-merge) and [Remote and tracking branches](lesson:remote-branches).

| Command | Job |
|---|---|
| `git switch -c <branch>` | Start a branch for one job |
| `git fetch` | Download what the team pushed. Your own branches do not move |
| `git status -sb` | One line that says how far your branch is ahead of and behind its upstream |
| `git log --oneline --graph --all` | Draw every branch, so you see where `main` and your branch split |
| `git push -u origin <branch>` | Publish the branch for the first time and make it follow `origin/<branch>` |
| `git pull` | Fetch, then bring your branch's upstream into it |

Fetch first, every morning and before every decision. Every command below reads `origin/main`, and `origin/main` is only as new as your last fetch.

### Bring a branch up to date: rebase or merge

Your branch started from an older `main`. There are two ways to catch up, and the choice is the heart of this capstone. From [Rebasing, and when not to](lesson:rebasing).

| | `git rebase origin/main` | `git merge origin/main` |
|---|---|---|
| What it does | Makes new copies of your commits on top of the newest `main` | Makes one merge commit that joins `main` into your branch |
| Your commits' IDs | Change | Stay the same |
| History | One straight line | Two lines that split and join |
| Next push of a branch that is already on GitHub | Needs a force push | A normal push |
| Use it when | The branch is yours alone | Someone else has the branch, or builds on it |

The rule from Pro Git: do not rebase commits that exist outside your repository and that people may have based work on. A branch nobody else touched is yours to rebase, even after you pushed it. A branch a teammate pushed to is not.

:::graph
caption: "Before: main moved on (D) while your branch held B and C"
commits:
  - id: A
    message: Add membership fees
  - id: D
    message: Tariq's commit
    parents: [A]
  - id: B
    message: Your first commit
    parents: [A]
  - id: C
    message: Your second commit
    parents: [B]
branches:
  main: A
  your-branch: C
remotes:
  origin/main: D
head: your-branch
:::

:::graph
caption: "After git rebase origin/main: copies B' and C' sit on top of D; the old B and C are left behind"
commits:
  - id: A
    message: Add membership fees
  - id: D
    message: Tariq's commit
    parents: [A]
  - id: B
    message: Your first commit
    parents: [A]
    faded: true
  - id: C
    message: Your second commit
    parents: [B]
    faded: true
  - id: B'
    message: Your first commit
    parents: [D]
  - id: C'
    message: Your second commit
    parents: [B']
branches:
  main: A
  your-branch: C'
remotes:
  origin/main: D
head: your-branch
:::

### Settle a conflict

Both ways of catching up can stop on a [merge conflict](term:merge-conflict): the same lines changed on both sides. From [Branch, merge, and fix conflicts](lesson:branch-and-merge) and [Hard conflicts, merge strategies and rerere](lesson:advanced-merging).

| Command | Job |
|---|---|
| `git status` | Lists the conflicted files under "Unmerged paths", and says which operation is waiting |
| `git diff` | Shows only the conflicted parts, with both sides |
| Edit the file | Write the lines as they should be and delete the three marker lines |
| `git restore --theirs <file>` / `--ours <file>` | Take one side's whole file, when one side is right from the first line to the last |
| `git add <file>` | Mark the file as resolved |
| `git commit` | Finish a merge |
| `git rebase --continue` | Finish one stop of a rebase and go on to the next commit |
| `git merge --abort` / `git rebase --abort` | Give up and go back to before you started |

Two things differ between a merge and a rebase:

- **How often it stops.** A merge compares the two ends once, so it stops once. A rebase replays your commits one by one, so it can stop once per commit.
- **Which side is "ours".** In a merge, ours is your branch and theirs is the branch you merge in. In a rebase the sides are swapped: ours (`HEAD`) is the new base with the copies made so far, and theirs is your own commit being replayed.

:::predict
question: "You run git rebase origin/main and it stops in schedule.txt. The top half of the conflict, between <<<<<<< HEAD and =======, shows \"Sunday 8:30 long run\". Whose line is that: yours or the team's?"
answer: "The team's. During a rebase, HEAD is the newest main plus the copies made so far, so the top half is what main says. Your own change is the bottom half, labelled with your commit's short ID and message."
:::

### Reshape your commits before review

A reviewer reads commits. "WIP" and "fix typo" commits waste their time, so you fold them into the commits they belong to before you ask for a review. From [Reword, squash, reorder, split](lesson:clean-up-history).

| Command | Job |
|---|---|
| `git rebase -i origin/main` | Open the todo list for every commit of your branch, and move the branch onto the newest `main` in the same run |
| `pick` | Keep the commit as it is |
| `squash` | Fold the commit into the one above it and join the two messages |
| `fixup` | Fold the commit into the one above it and throw its message away |
| `reword` | Keep the commit, change its message |
| `drop` | Leave the commit out |
| `git reflog` | Find the branch as it was before the rebase, if the result is wrong |

One `git rebase -i origin/main` does two jobs at once: it reshapes the commits and it moves them onto the newest `main`. When a commit conflicts, the rebase stops there; resolve, `git add`, `git rebase --continue`, and the todo list carries on.

### Publish a rewritten branch

After a rebase, your branch on GitHub still holds the old commits. A normal push is refused, because it would leave those commits out. From the lesson [Force-pushing safely with --force-with-lease](lesson:force-push-safely).

| Command | Job |
|---|---|
| `git push --force-with-lease` | Overwrite your branch on GitHub, but only if it is still where your last fetch saw it |
| `git push --force` | Overwrite it no matter what. Avoid it: a commit a teammate pushed a minute ago is gone |

A [force push](term:force-push) is for your own topic branch only. Never force-push `main` or a branch a teammate builds on. An open pull request follows its branch, so after the force push it shows the new commits by itself.

### Pull requests from the terminal

From the lesson [Forks, GitHub Flow and pull requests](lesson:github-flow-prs). `gh` is GitHub's command-line tool; it finds the repository through `origin`.

| Command | Job |
|---|---|
| `gh pr create --title "..." --body "..."` | Open a pull request from the branch you are on into `main` |
| `gh pr create --fill` | The same, with title and body taken from your commits |
| `gh pr status` | The pull requests that concern you |
| `gh pr view` | The pull request of the branch you are on; `--comments` adds the discussion, `--web` opens the page |
| `gh pr diff` | What the pull request would change |
| `gh pr merge --merge`, `--squash` or `--rebase` | Merge it, with the method you name |
| `gh pr merge ... --delete-branch` | Also delete the branch on GitHub and on your computer, switch to `main` and pull |

### Three ways to merge a pull request

The last choice of a pull request is its merge method. A team picks one and writes it down. From the lesson [Merge, squash or rebase-merge a pull request](lesson:pr-merge-strategies).

| | Merge commit (`--merge`) | Squash (`--squash`) | Rebase (`--rebase`) |
|---|---|---|---|
| What lands on `main` | All your commits, plus a merge commit with two parents | One new commit with all the changes | A new copy of each of your commits |
| Shape of `main` | Splits and joins: each pull request is visible | One straight line | One straight line |
| Your commits' IDs on `main` | The same as on your branch | One new ID | New IDs |
| Good for | Keeping the true record, and branches several people worked on | Branches with messy commits; one pull request, one commit | Branches whose every commit is worth reading |
| Clean up your branch with | `git branch -d` | `git branch -D` | `git branch -D` |

Why `-D` after a squash or a rebase merge: GitHub made new commits, so Git cannot see that your branch's commits are in `main`, and the safe `-d` refuses. Check with `git diff main <branch>` that nothing is left, then delete with `-D`.

:::graph
caption: "Merge commit: B and C keep their IDs, and M joins the two lines"
commits:
  - id: A
    message: Add membership fees
  - id: D
    message: Tariq's commit
    parents: [A]
  - id: B
    message: Your first commit
    parents: [A]
  - id: C
    message: Your second commit
    parents: [B]
  - id: M
    message: "Merge pull request #2"
    parents: [D, C]
branches:
  main: M
head: main
:::

:::graph
caption: "Squash: one new commit S holds the changes of B and C"
commits:
  - id: A
    message: Add membership fees
  - id: D
    message: Tariq's commit
    parents: [A]
  - id: S
    message: "Add race calendar (#2)"
    parents: [D]
branches:
  main: S
head: main
:::

:::graph
caption: "Rebase: copies B' and C' are added to main one by one"
commits:
  - id: A
    message: Add membership fees
  - id: D
    message: Tariq's commit
    parents: [A]
  - id: B'
    message: Your first commit
    parents: [D]
  - id: C'
    message: Your second commit
    parents: [B']
branches:
  main: C'
head: main
:::

After any of the three, GitHub's `main` is ahead of yours. Finish with `git switch main` and `git pull`.

### Cut the release

A release marks one commit of `main` as a version. From [Tags and GitHub releases](lesson:tags-and-releases).

| Command | Job |
|---|---|
| `git switch main`, then `git pull` | Stand on the commit that ships. Tag what GitHub's `main` holds, never your local branch |
| `git tag -a v1.0 -m "Version 1.0"` | Make an [annotated tag](term:annotated-tag) on the commit you are on: a tag with an author, a date and a message |
| `git show v1.0` | Check the tag and the commit it is on |
| `git push origin v1.0` | Send the tag. A plain `git push` does not send tags |
| `gh release create v1.0 --title "..." --notes "..."` | Publish a GitHub release on the tag |
| `gh release create v1.0 --generate-notes` | The same, and GitHub writes the notes from the merged pull requests |
| `gh release view v1.0` | Read the release back |

Order matters: merge, pull, tag, push the tag, release. A tag made before the pull request is merged sits on your branch's commit, and after a squash or rebase merge that commit is not on `main` at all.

### The whole sprint in order

1. `git fetch`, and look: `git status -sb`, `git log --oneline --graph --all`.
2. Is the branch yours alone? Then `git rebase -i origin/main` (reshape and catch up). Is it shared? Then `git pull`, and `git merge origin/main`.
3. Settle each conflict: edit, `git add`, then `git rebase --continue` or `git commit`.
4. Read the result before anyone else does: `git log --oneline`, `git diff origin/main`.
5. `git push` (after a rebase of a pushed branch: `git push --force-with-lease`).
6. `gh pr create`, then the review, then `gh pr merge` with the team's method.
7. `git switch main`, `git pull`, delete the branch here and on GitHub.
8. On release day: `git tag -a`, `git push origin <tag>`, `gh release create`.

### How to read the picture in these challenges

Press "Expand" on the History panel. `main` keeps the top row, and your branch runs on the row below until it is merged or rebased. The `remote origin/main` label shows where GitHub's `main` was at your last fetch; when it sits ahead of `branch main`, you have something to pull. During a rebase or a merge that stopped, a banner names the operation and the next step. Pull requests and releases are not in the picture: the GitHub goals in the checklist tick when the app reads them from GitHub, a few seconds after your push or `gh` command.

### When it goes wrong

```console
$ git push
To https://github.com/your-name/gitremastered-practice-capstone-team-release.git
 ! [rejected]        add-results -> add-results (non-fast-forward)
error: failed to push some refs to 'https://github.com/your-name/gitremastered-practice-capstone-team-release.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

You rebased a branch that was already on GitHub, so your branch no longer contains the commits GitHub has. Do not follow the hint: `git pull` would merge the old commits back in, and every commit would be there twice. The branch is yours alone, so publish the new version with `git push --force-with-lease`.

```console
$ git push
To https://github.com/your-name/gitremastered-practice-capstone-team-release.git
 ! [rejected]        update-fees -> update-fees (fetch first)
error: failed to push some refs to 'https://github.com/your-name/gitremastered-practice-capstone-team-release.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

This one looks almost the same and means the opposite: a teammate pushed to the branch and you never fetched it. Here the hint is right. Run `git pull`, then push again. A force push would delete the teammate's commit. The words in brackets tell the two cases apart: "non-fast-forward" after your own rewrite, "fetch first" when someone else pushed.

```console
$ git branch -d add-results
error: the branch 'add-results' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D add-results'
hint: Disable this message with "git config set advice.forceDeleteBranch false"
```

The pull request was merged with squash or rebase, so `main` holds new commits and Git cannot find your branch's commits in it. Make sure your `main` is pulled, check with `git diff main add-results` that the two hold the same files (no output), then run `git branch -D add-results`.

```console
$ gh pr merge --rebase
X Pull request your-name/gitremastered-practice-capstone-team-release#5 is not mergeable: the merge commit cannot be cleanly created.
To have the pull request merged after all the requirements have been met, add the `--auto` flag.
Run the following to resolve the merge conflicts locally:
  gh pr checkout 5 && git fetch origin main && git rebase origin/main
```

GitHub sees a conflict between the branch and `main`. If you have not caught the branch up yet, do that first. If you pushed the fix a few seconds ago, GitHub is still working it out: wait a moment, look with `gh pr view`, and run the merge again.

## Under the hood

The cheat sheet says what to type. These are the ideas that tell you which row to pick, each from the lesson named beside it.

### A workflow is an agreement

Git does not know your workflow. Pro Git describes several: the centralized workflow, where everyone pushes to one shared repository, and the integration-manager workflow, where each person pushes to their own copy and asks a maintainer to pull. The team in this capstone uses the first with a rule on top: nothing reaches `main` except through a pull request. Git enforces none of it; people do, or settings on GitHub do. ([Team workflows](lesson:team-workflows))

### The server refuses to lose commits

In the centralized workflow, Pro Git says, the second person to push must first take in the first person's work. That is the "rejected" message: a normal push may only add commits on top of what the server has. It is why you fetch before you push, and why a rebased branch needs a force. ([Work with remotes: fetch, pull, push](lesson:remotes))

### A commit's ID includes its parent

A commit's ID is computed from its content, its message, its author and its parent. Put the same change on a different parent and the ID is different. Every rule about rebasing follows from that: a [rebase](term:rebase) cannot move commits, it can only make copies, and anyone who built on the originals is left holding commits the branch no longer has. ([Rebasing, and when not to](lesson:rebasing))

### The three merge methods are three commands you know

GitHub's merge button does on the server what you can do by hand. A merge commit is `git merge --no-ff`: a commit with two parents, even where a fast-forward was possible. A squash merge is `git merge --squash` and one commit. A rebase merge replays each commit onto `main`; GitHub Docs note that it always writes new commit IDs, even when your branch already sat on top of `main`. That is why your local branch looks unmerged after two of the three. ([Branch, merge, and fix conflicts](lesson:branch-and-merge))

### A merge compares three commits; a rebase does it once per commit

Git settles a merge from three versions: the [merge base](term:merge-base) and the two ends. Lines changed on one side are taken; lines changed on both sides conflict. A rebase runs the same three-way comparison for each commit it replays, with your commit as "theirs". ([Hard conflicts, merge strategies and rerere](lesson:advanced-merging))

### A tag is Git's; a release is GitHub's

An annotated tag is an object in the repository with its own ID, message and date, and it points at a commit. It travels with `git push origin <tag>` and exists in every clone that fetches it. A release is a page GitHub keeps beside the repository: a title, notes and downloads attached to a tag. `git clone` copies the tag and never the release. ([Tags and GitHub releases](lesson:tags-and-releases))

## Advanced

The practice team is two people with no safety nets. Here is what a larger team adds, and where the course teaches it.

### Rules that GitHub enforces

In these challenges nothing stops you from pushing straight to `main`. Real teams switch on rules: no direct pushes, a required review, a fixed merge method, no force pushes. The lesson [Branch protection, rulesets and CODEOWNERS](lesson:branch-protection-codeowners) sets them up, and [CI with GitHub Actions](lesson:github-actions-ci) adds tests that must pass before the merge button works.

### The review you skipped

The step between "open" and "merge" is a teammate reading your changes. The lesson [Reviewing a pull request](lesson:code-review) teaches both sides: how to read a diff and comment on it, and how to answer a review with new commits.

### When you cannot push at all

On an open-source project you have no push access. You fork, push to your copy and send the pull request from there, which is Pro Git's integration-manager workflow. The lesson [Contributing in real teams: small team, managed team, public fork](lesson:team-contributing) and the third capstone practise it.

### Releases beyond one tag

A release often needs more than a tag: a fix carried back to an older version, or a branch that stabilises while `main` moves on. [Team workflows](lesson:team-workflows) describes release branches and hotfixes, and [Bring in others' work](lesson:integrating-work) teaches `git cherry-pick` for carrying one fix across.

### Solving the same conflict twice

A long-lived branch that takes in `main` every few days can meet the same conflict again and again. `git rerere` records how you settled it and replays the answer; it is in the Advanced part of [Hard conflicts, merge strategies and rerere](lesson:advanced-merging).

## Recap

- Fetch first. Then choose: rebase a branch that is yours alone, merge `main` into a branch someone else has.
- A conflict is edit, `git add`, then `git commit` (merge) or `git rebase --continue` (rebase). In a rebase, the top half of the markers is the team's side.
- `git rebase -i origin/main` cleans up and catches up in one run; publish the result with `git push --force-with-lease`, never a bare `--force`.
- `gh pr merge` takes the team's method: `--merge` keeps every commit and adds a merge commit, `--squash` makes one commit, `--rebase` copies each commit onto `main`.
- Release in this order: merge, `git pull` on `main`, `git tag -a`, `git push origin <tag>`, `gh release create`.
