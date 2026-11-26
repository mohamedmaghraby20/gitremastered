---
id: team-workflows
title: "Team workflows: topic branches, trunk-based, Git Flow"
module: working-in-a-team
bookSection: "3.4 Branching Workflows"
bookUrl: https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows
bookSources:
  - book/progit2/book/03-git-branching/sections/workflows.asc
  - book/progit2/book/05-distributed-git/sections/distributed-workflows.asc
readFirst: [remote-branches]
---

Five people commit to the same `main`. One half-finished feature lands there on Friday, and on Monday nobody can get the urgent bug fix out to users. Teams avoid this by agreeing on a few rules: which branches exist, what may go into each, and who merges. This lesson shows the common sets of rules, so you can follow the one your team uses and help choose one for a new project.

## Must know

You can already make [branches](term:branch), [merge](term:merge) them, and share them through a [remote](term:remote). Those are tools. Git does not tell you when to branch or where finished work goes. That agreement is called a [workflow](term:workflow), and every team has one, written down or not.

A workflow answers two separate questions:

| Question | The answer is called | Examples |
|---|---|---|
| Which branches do we keep, and what goes into each? | A branching model | Trunk-based development, GitHub Flow, Git Flow |
| Which repositories exist, and who may push to them? | A distributed workflow | Centralized, integration-manager, dictator and lieutenants |

Both are built from the same two kinds of branch, so we start there.

### Two kinds of branch

Git itself has only one kind of branch: a label on a commit. Teams use that label in two ways, and Pro Git gives each a name.

:::definitions
- term: Topic branch
  text: "A short-lived branch for one job: one feature, one bug fix, one experiment. You make it, commit on it, merge it, and delete it. Also called a feature branch."
- term: Long-running branch
  text: "A branch that is always open and never deleted, like main. Each one stands for a level of trust: \"this code is released\" or \"this code is being tested\"."
:::

The practice project for this lesson is a small to-do app named Tasklist. It has both kinds. Run `git log --oneline --graph --all` in the terminal on the right:

```console
$ git log --oneline --graph --all
* d5578c5 Search by tag
* 9809b14 Add search box
| * 32ef0b1 Describe the app in the README
|/  
* c05be92 Add due dates
* 1d81463 Add task list page
* 487a35f Add README
```

(Your commit IDs will differ from the ones printed in this lesson.)

:::graph
caption: "Tasklist: main and develop are long-running; add-search is a topic branch that started from develop"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add task list page
    parents: [A]
  - id: C
    message: Add due dates
    parents: [B]
  - id: F
    message: Describe the app in the README
    parents: [C]
  - id: D
    message: Add search box
    parents: [C]
  - id: E
    message: Search by tag
    parents: [D]
branches:
  main: B
  develop: F
  add-search: E
head: main
:::

- `main` holds what users have: the released app.
- `develop` holds finished work that is waiting for the next release.
- `add-search` is one person's job in progress.

The branch `add-search` belongs to the first challenge at the end of this lesson, so leave it alone for now. The Try-its below make branches of their own, each starting with `try-`.

### Topic branches: one job, one branch

A [topic branch](term:topic-branch) keeps one job apart from everything else until the job is done. Pro Git says they are useful in projects of any size, and that in Git it is normal to create, merge and delete branches several times a day.

You have done this already: the `hotfix` branch in [Branch, merge, and fix conflicts](lesson:branch-and-merge) was a topic branch. The life of one is always the same four steps:

```console
$ git switch -c add-search develop
  ... edit, git add, git commit, as often as you like ...
$ git switch develop
$ git merge add-search
$ git branch -d add-search
```

The first line makes the branch `add-search` starting at `develop` and switches to it. The name after the new branch is the starting point; without it the branch starts where you stand.

Three things make topic branches worth the small effort:

- **You can drop everything and switch.** A bug report arrives while you are mid-feature. Your half-done feature stays on its branch; you start a second branch for the bug.
- **Review is easier.** Every commit on the branch is about one topic, so a teammate who reads it sees one story.
- **Order does not matter.** A branch can wait for minutes or months and be merged when it is ready, whatever was started first.

Pro Git shows that last point with an example. You work on issue 91 on a branch `iss91`. Two commits in, you try a second approach on `iss91v2`. Later you test a risky idea on `dumbidea`:

:::graph
caption: "Before: three topic branches, started at different times"
commits:
  - id: A
    message: Add app
  - id: C1
    message: Issue 91, first try
    parents: [A]
  - id: C2
    message: Issue 91, more of the first try
    parents: [C1]
  - id: V
    message: Issue 91, second approach
    parents: [C1]
  - id: K
    message: Work on main
    parents: [A]
  - id: I
    message: The risky idea
    parents: [K]
branches:
  main: K
  iss91: C2
  iss91v2: V
  dumbidea: I
head: main
:::

The second approach turns out better, and your teammates love the risky idea. So you merge `dumbidea` and `iss91v2`, and throw `iss91` away with `git branch -D`:

:::graph
caption: "After: dumbidea and iss91v2 are merged; the commit only iss91 reached is left behind"
commits:
  - id: A
    message: Add app
  - id: C1
    message: Issue 91, first try
    parents: [A]
  - id: C2
    message: Issue 91, more of the first try
    parents: [C1]
    faded: true
  - id: V
    message: Issue 91, second approach
    parents: [C1]
  - id: K
    message: Work on main
    parents: [A]
  - id: I
    message: The risky idea
    parents: [K]
  - id: M
    message: Merge branch 'iss91v2'
    parents: [I, V]
branches:
  main: M
head: main
:::

Nothing on `main` was ever at risk while you tried things. That is the whole point of a topic branch.

:::try-it
1. Run `git switch develop`, then `git switch -c try-labels`. Git prints `Switched to a new branch 'try-labels'`. In the picture, a `branch try-labels` tag appears on the same station as `branch develop`, and the `HEAD · you` pin belongs to it.
2. Run `echo "Labels: work, home" > labels.txt`, then `git add labels.txt`, then `git commit -m "Add labels"`. In the picture, a new station appears and the `branch try-labels` tag moves onto it. The `branch develop` tag stays behind.
3. Run `git switch develop`, then `git merge try-labels`. Git prints `Fast-forward`, because `develop` did not move while you worked. In the picture, the `branch develop` tag moves onto the `Add labels` station.
4. Run `git branch -d try-labels`. Git prints `Deleted branch try-labels (was …)`. In the picture, the `branch try-labels` tag disappears and its station stays: the commit now belongs to `develop`.
:::

### Long-running branches: levels of trust

A topic branch protects everyone else from your unfinished work. The next question is where finished work goes, and whether "finished" means "users can have it today".

Many teams keep two [long-running branches](term:long-running-branch) for that. Pro Git describes the pattern like this:

- `main` holds only stable code: what has been released or is about to be. (The book calls this branch `master`, the older default name.)
- A second branch, named `develop` or `next`, collects finished topic branches. It is where the team checks that they work together. It is not always stable. When it reaches a stable state, it is merged into `main`.

"Stable" means tested and safe to give to users. A **release** is the moment you give users a new version.

The common wrong idea is that `main` and `develop` are two copies of the project. They are two labels on one line of commits. Look at the Tasklist diagram again: `main` sits on B, and `develop` sits further along the same history. Pro Git puts it this way: the stable branches are further back in the commit history, and the newest work is further ahead. Releasing means moving the `main` label forward to where `develop` already is.

The book also offers a second way to see it: think of each branch as a silo, a separate container. A set of commits "graduates" to a more stable silo once it is fully tested. Both views describe the same commits.

Two things stay the same when you release. No commit changes. And `develop` does not move: it keeps collecting work for the release after this one.

To see what is waiting for the next release, ask Git for the commits `develop` has and `main` lacks. The two dots mean "in the second branch, not in the first":

```console
$ git log --oneline main..develop
ee20ddd Add labels
32ef0b1 Describe the app in the README
c05be92 Add due dates
```

:::predict
question: "main has no commits of its own since develop started. You switch to main and run git merge develop. What does Git do, and what would a teammate see in main's history afterwards?"
answer: "A fast-forward: the main label moves to develop's newest commit and no commit is made. main's history is then one straight line, and nothing in it shows where the release happened. That is why many teams release with --no-ff, which you try next."
:::

`git merge --no-ff develop` makes a [merge commit](term:merge-commit) even when a [fast-forward](term:fast-forward) is possible. Teams use it for releases so that each release is one visible commit on `main`.

:::try-it
1. Run `git switch main`, then `git log --oneline main..develop`. Git lists three commits, with your `Add labels` on top: this is the next release.
2. Run `git merge --no-ff develop --no-edit`. Git prints `Merge made by the 'ort' strategy.` In the picture, a new station `Merge branch 'develop'` appears on the top row with the `branch main` tag on it, and a track from the `branch develop` station runs into it.
3. Run `git log --oneline --graph`. The drawing shows `main` as the straight line on the left and the release as a loop that joins it.
4. Run `git log --oneline main..develop`. Git prints nothing: everything on `develop` is released.
:::

```console
$ git merge --no-ff develop --no-edit
Merge made by the 'ort' strategy.
 README.md    | 1 +
 labels.txt   | 1 +
 settings.txt | 1 +
 3 files changed, 3 insertions(+)
 create mode 100644 labels.txt
 create mode 100644 settings.txt
$ git log --oneline --graph
*   59b3129 Merge branch 'develop'
|\  
| * ee20ddd Add labels
| * 32ef0b1 Describe the app in the README
| * c05be92 Add due dates
|/  
* 1d81463 Add task list page
* 487a35f Add README
```

Most teams also put a [tag](term:tag) such as `v1.0` on the release commit, as in [Tags and GitHub releases](lesson:tags-and-releases).

You can keep more than two levels. Pro Git mentions large projects with a third branch, `proposed` or `pu` (proposed updates), for work that is not ready even for `next`. The idea is the same at every level: when work is trusted more, it is merged one level up. The book adds that several long-running branches are not necessary, but often help in very large or complex projects.

### Three branching models

You now have the two building blocks. A branching model is a choice of how many long-running branches to keep and how long a topic branch may live. Three models cover most teams. Pro Git teaches the building blocks; these three names come from the wider Git community.

| Model | Long-running branches | A topic branch lives | Releases happen |
|---|---|---|---|
| Trunk-based development | `main` only | Hours to a day or two | Any time, straight from `main` |
| GitHub Flow | `main` only | Days, until its review is done | After each merge into `main` |
| Git Flow | `main` and `develop` | Days to weeks | On a schedule, as numbered versions |

**Trunk-based development.** "Trunk" is another word for the one main branch. In [trunk-based development](term:trunk-based-development) everyone merges into `main` at least once a day, in small steps. Topic branches are tiny or skipped. Because work lands so often, merges stay small and conflicts are rare.

:::graph
caption: "Trunk-based: one long-running branch; a topic branch holds a commit or two and is merged the same day"
commits:
  - id: A
    message: Add task list page
  - id: B
    message: Add due dates
    parents: [A]
  - id: C
    message: Add search box
    parents: [B]
  - id: D
    message: Search by tag
    parents: [C]
  - id: E
    message: Add labels
    parents: [D]
branches:
  main: D
  add-labels: E
head: add-labels
:::

Two things make this safe. The team needs automated tests that run on every change, so a broken commit is caught in minutes. And a feature that takes two weeks still lands in daily pieces, hidden behind a **feature flag**: a setting in the code that keeps the new feature switched off for users until it is complete.

**GitHub Flow.** `main` is always ready to release. Every change is a topic branch from `main`. You push the branch and open a **pull request**: a page on GitHub where you ask the team to merge your branch, and where they review it first. After approval the branch is merged into `main` and deleted. The lesson "Forks, GitHub Flow and pull requests" teaches it in full.

:::graph
caption: "GitHub Flow: a topic branch from main, reviewed, then merged back into main"
commits:
  - id: A
    message: Add task list page
  - id: B
    message: Add due dates
    parents: [A]
  - id: C
    message: Add search box
    parents: [B]
  - id: D
    message: Search by tag
    parents: [C]
  - id: M
    message: Merge add-search
    parents: [B, D]
branches:
  main: M
  add-search: D
head: main
:::

**Git Flow.** [Git Flow](term:git-flow) is the two-level pattern from the last section with fixed rules. Vincent Driessen published it in 2010.

| Branch | Starts from | Merges into | For |
|---|---|---|---|
| `main` | | | Released versions only; each one is tagged |
| `develop` | | | Finished features, waiting for the next release |
| `feature/…` | `develop` | `develop` | One feature (a topic branch) |
| `release/…` | `develop` | `main` and `develop` | Last fixes before a version goes out |
| `hotfix/…` | `main` | `main` and `develop` | An urgent fix to the released version |

A [hotfix](term:hotfix) is a fix that cannot wait for the next release. It starts from `main`, because `main` is what users run and `develop` holds work that is not ready for them. It goes into both branches so the next release does not bring the bug back.

:::graph
caption: "Git Flow: a feature goes into develop; develop is released into main with a merge commit and a tag"
commits:
  - id: A
    message: Version 1.0
  - id: B
    message: Add due dates
    parents: [A]
  - id: F
    message: Add search box
    parents: [B]
  - id: C
    message: Merge feature/search
    parents: [B, F]
  - id: R
    message: Merge branch 'develop'
    parents: [A, C]
branches:
  main: R
  develop: C
  feature/search: F
tags:
  v1.0: A
  v1.1: R
head: main
:::

The slash in `feature/search` is part of the name. Teams use it to group branches; Git gives it no meaning.

### Who may push: three distributed workflows

A branching model says which branches exist. It does not say whose repository they live in, or who is allowed to change them. Every [clone](term:clone) is a full repository, so Git leaves that open too. Pro Git describes three arrangements.

**Centralized workflow.** One shared repository, and everyone on the team may [push](term:push) to it. You know this one: it is how the lessons on remotes worked. If two people push to the same branch, the second push is rejected until that person has fetched and merged the first one's work, so nobody overwrites anybody. The book notes that this is not only for small teams: with branches, hundreds of developers can work this way.

**Integration-manager workflow.** There is one official repository, and only its **maintainer** (the person in charge of the project) may push to it. Everyone else works like this:

1. A contributor makes their own public copy of the project and pushes changes there.
2. The contributor asks the maintainer to take those changes.
3. The maintainer adds the contributor's repository as a remote, tests the changes locally, merges them, and pushes to the official repository.

On GitHub the public copy is called a **fork** and the request is a pull request, which is why the book calls this workflow very common on such sites. Its advantage: nobody waits. Contributors keep working, and the maintainer takes changes in when there is time.

**Dictator and lieutenants workflow.** The same idea with one more layer, for huge projects with hundreds of contributors. The Linux kernel is the book's example.

1. Developers work on topic branches.
2. **Lieutenants**, each in charge of one part of the project, merge the developers' branches.
3. One person, the **benevolent dictator**, merges the lieutenants' branches and pushes the result to the reference repository that everyone pulls from.

Pro Git says this workflow is not common, but it lets a project leader hand off much of the work and collect it in large pieces.

| Workflow | Who pushes to the official repository | Typical for |
|---|---|---|
| Centralized | Every team member | A company team |
| Integration-manager | The maintainer only | Open-source projects on GitHub |
| Dictator and lieutenants | The dictator only | Very large projects |

The book's advice is that these are starting points: you can use one, or mix parts of several. A company team often pushes branches to one shared repository (centralized) and still asks for a review before anything is merged into `main`.

### How to choose

There is no best workflow, only one that fits how your team releases. Start from the situation.

| Your situation | A good fit | Why |
|---|---|---|
| A website or service you can update at any moment | GitHub Flow or trunk-based | One long-running branch is enough when "released" and "merged" are the same thing |
| A team with strong automated tests that wants the fewest merge conflicts | Trunk-based | Small daily merges cannot drift far apart |
| Numbered versions: a mobile app, a library, software that customers install | Git Flow | `main` always equals the latest version, and old versions can get hotfixes |
| An open-source project with outside contributors | Integration-manager with GitHub Flow | Strangers cannot push, but anyone can propose a change |
| You are new on a team | The one the team already uses | Read the project's CONTRIBUTING file (its guide for people who want to help) or ask before your first branch |

Two rules hold in every model. Use a topic branch for each job. And keep it short: the longer a branch lives apart, the harder its merge becomes.

:::careful
More branches are not more professional. Every extra long-running branch is one more merge to do and one more place for work to get stuck. Git Flow's author himself now suggests a simpler model such as GitHub Flow for software that is delivered continuously, like most web apps.
:::

### When it goes wrong

Three problems come with these workflows.

**A merged topic branch will not delete.** You merged `try-labels` into `develop`, switched to `main`, and ran:

```console
$ git branch -d try-labels
error: the branch 'try-labels' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D try-labels'
```

`git branch -d` compares with the branch you are on. `main` does not have the work yet, because `develop` has not been released. Nothing is wrong: switch to `develop` and run the same command there. Do not reach for `-D` before you have checked with `git branch --merged develop`.

**The topic branch started from the wrong branch.** You were on `develop` when you made a branch for an urgent fix that should go to `main`. Before you merge, list what the branch would bring in:

```console
$ git log --oneline main..try-urgent
491e379 Fix crash on empty list
6060dab Describe the app in the README
ef2a5fd Add due dates
```

You made one commit, and Git lists three. The other two are unreleased work from `develop`, and merging this branch into `main` would release them. For a small fix, start again from the right place with `git switch -c try-urgent-2 main` and redo the change there. The lesson "Bring in others' work: cherry-pick, topic branches, what a change introduces" shows how to copy the one commit across, and the Rebasing lesson how to move a whole branch.

**Your push is rejected.** In a centralized workflow someone else often pushes first:

```console
$ git push
To ../origin.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to '../origin.git'
```

The server has commits you lack. Run `git pull`, then `git push` again, as in [Work with remotes: fetch, pull, push](lesson:remotes). A team that hits this many times a day has found a reason to use topic branches.

## Under the hood

Must know described workflows as agreements between people. This layer shows how little of that Git itself stores, and why merging the same two long-running branches again and again keeps working.

### Git does not know your workflow

To Git, `main`, `develop` and `add-search` are the same thing: a file with a commit ID in it.

```console
$ ls .git/refs/heads
add-search
develop
main
$ cat .git/refs/heads/develop
ee20ddd65973ac7bb5c00880d28d9595036ba7cb
```

Nothing marks `main` as stable or `add-search` as temporary. "Long-running" and "topic" describe how people treat a [ref](term:ref). So Git will not stop you from committing straight to `main` or from deleting `develop`. Teams enforce their rules on the server, with settings the lesson "Branch protection, rulesets and CODEOWNERS" covers.

Pro Git ends its section with a related point: all of this branching and merging happens in your own repository. No server is involved until you push.

### "More stable" means "further back"

Must know said that `main` and `develop` are two labels on one history. You can check that with the commands you know from [List, delete and rename branches](lesson:branch-management):

```console
$ git branch --merged develop
  develop
$ git branch --no-merged develop
  add-search
* main
```

This was run after the release in the second Try-it. `main` shows up as not merged into `develop`: the release made a merge commit on `main` that `develop` does not have. That is normal in Git Flow, and harmless. The other direction is what matters: `git log --oneline main..develop` printed nothing, so `main` has everything `develop` has.

### Why repeated merges stay easy

Pro Git opens its section with the reason long-running branches work at all: Git uses a three-way merge, so merging one branch into another many times over a long period is generally easy.

Here is why. A merge compares both branches with their [merge base](term:merge-base), the last commit they share. Before the release, the base of `main` and `develop` was the old commit where `develop` began:

```console
$ git merge-base main develop
1d814632b5c20f34b030a5e63b37cd3b1033458d
```

After the release, the base is the tip of `develop` itself:

```console
$ git merge-base main develop
ee20ddd65973ac7bb5c00880d28d9595036ba7cb
```

The merge commit records `develop`'s commit as its second parent, so the two branches now share everything up to that point. The next release only has to combine what was committed after it. Git never works through the old releases again, however many there were.

## Advanced

Must know gave Git Flow in outline. Here are its two special branches step by step, and a few habits for long-lived branches.

### A hotfix, step by step

Users of version 1.0 hit a bug. `develop` holds half-built work, so the fix cannot start there.

```console
$ git switch -c hotfix main
Switched to a new branch 'hotfix'
$ echo "Max tasks per list: 100" > limits.txt
$ git commit -am "Raise task limit to 100"
[hotfix 27bf7ec] Raise task limit to 100
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git switch main
Switched to branch 'main'
$ git merge --no-ff hotfix --no-edit
Merge made by the 'ort' strategy.
 limits.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git switch develop
Switched to branch 'develop'
$ git merge hotfix --no-edit
Merge made by the 'ort' strategy.
 limits.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git branch -d hotfix
Deleted branch hotfix (was 27bf7ec).
```

Read it as four moves:

1. `git switch -c hotfix main` starts the branch at `main`, wherever you are standing.
2. Merge into `main` with `--no-ff`. A fast-forward was possible; the merge commit makes the hotfix visible in `main`'s history. This is the commit to tag, for example `v1.0.1`.
3. Merge into `develop` too. If you skip this, the next release from `develop` still has the bug in its code. `develop` has commits of its own, so Git makes a merge commit here without being asked.
4. Delete the branch. Run `git branch -d` while on `develop` or `main`: both contain the fix now.

:::graph
caption: "After the hotfix: the fix H is in main (through M2) and in develop (through M3)"
commits:
  - id: R
    message: Merge branch 'develop'
  - id: X
    message: Start export feature
    parents: [R]
  - id: H
    message: Raise task limit to 100
    parents: [R]
  - id: M2
    message: Merge branch 'hotfix'
    parents: [R, H]
  - id: M3
    message: Merge branch 'hotfix' into develop
    parents: [X, H]
branches:
  main: M2
  develop: M3
tags:
  v1.0: R
head: develop
:::

The diagram is simplified: it draws `develop` as starting from the release commit.

### Release branches

In Git Flow, a release does not go from `develop` to `main` in one step. When `develop` has everything planned for version 1.1, the team makes a branch `release/1.1` from it. Only bug fixes and version numbers go onto that branch, while new features for 1.2 keep landing on `develop`. When `release/1.1` is ready, it is merged into `main` and tagged, then merged back into `develop` so the last fixes are not lost, and deleted. It is a topic branch whose topic is "get 1.1 out".

### Keep a long topic branch fresh

Sometimes a feature really takes weeks. Its branch drifts away from `develop`, and the final merge gets harder every day. Bring `develop` into your branch regularly:

```console
$ git switch add-search
$ git merge develop
```

You meet conflicts in small portions while you still remember the code, and the last merge into `develop` is easy. The Rebasing lesson shows another way to catch up, without merge commits.

### Name branches so the list reads well

Many teams put the kind of work, a slash, and a short description in the name: `feature/search`, `fix/login-crash`, `hotfix/1.0.1`. Some add the issue number, as Pro Git does with `iss53`. `git branch --list "feature/*"` then lists one group.

### Going deeper on choosing

Pro Git points to Martin Fowler's guide "Patterns for Managing Source Code Branches". It describes each pattern from this lesson and compares teams that merge often with teams that merge rarely. Its main finding matches the rule from Must know: the more often work is integrated, the smaller each merge is.

## Recap

- A workflow is a team's agreement: which branches exist, what goes into each, and who may push.
- A topic branch holds one job and is short-lived: branch, commit, merge, delete.
- Long-running branches are levels of trust on one history: `develop` collects finished work, `main` holds what is released.
- Trunk-based and GitHub Flow keep only `main`; Git Flow adds `develop`, release branches and hotfix branches for numbered versions.
- A hotfix starts from `main` and is merged into both `main` and `develop`.
