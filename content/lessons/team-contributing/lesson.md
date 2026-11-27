---
id: team-contributing
title: "Contributing in real teams: small team, managed team, public fork"
module: working-in-a-team
bookSection: "5.2 Contributing to a Project"
bookUrl: https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project
bookSources:
  - book/progit2/book/05-distributed-git/sections/contributing.asc
readFirst: [integrating-work]
---

On your first team, your push to `main` is rejected because a teammate was faster. On your second, you are not allowed to push to `main` at all. And the open-source project whose typo you want to fix lets you push nothing. These are three different setups, and each has its own short routine: this lesson walks you through all three, so you know what to type whichever one you land in.

## Must know

The lesson [Team workflows](lesson:team-workflows) named the shapes a team can take. The lesson [Bring in others' work](lesson:integrating-work) showed the receiving side: the [maintainer](term:maintainer) who decides what goes in. Now you are on the sending side: you are the [contributor](term:contributor), the person whose work has to reach the project's `main`.

Pro Git says there is no single way to contribute, because projects differ. One question sorts most of them: **where are you allowed to push?**

| Setup | Where you may push | How your work reaches `main` |
|---|---|---|
| Private small team | `main` of the shared repository | You merge and push it yourself |
| Private managed team | Branches of the shared repository, but not `main` | An integrator merges your branch |
| Public project | Nothing in the project, only your own copy of it | The maintainer takes it from your copy |

"Private" here means the code is closed: only the team can see the repository. We take the three in the book's order, from simple to less simple. The commands are ones you know (`git fetch`, `git merge`, `git push`); what changes is the order and the place they point at.

### The practice project

The practice project is a small community cookbook: one recipe per file. Unlike the earlier lessons, its server is real. The first time you start a challenge here, the app asks for your permission and then creates two practice repositories on your own GitHub account:

- `gitremastered-practice-team-contributing`: your copy. Your [remote](term:remote) named [origin](term:origin) points at it.
- `gitremastered-practice-team-contributing-upstream`: "the project", used in the third part of this lesson.

The terminal on the right opens in the first challenge's starting state. Run `git log --oneline --graph --all` there:

```console
$ git log --oneline --graph --all
* 35633ab Add lentil soup
* c7657e1 Add README
```

Your commit IDs will differ from the ones printed in this lesson, and where the lesson prints `you` in an address, you will see your GitHub name. The Try-its below work on branches of their own, each starting with `try-`.

### Setup 1: the private small team

Two or three people, one shared repository, and everybody may push to `main`. Pro Git calls it the simplest setup you are likely to meet.

The routine has four steps:

1. Work on a [topic branch](term:topic-branch), a short-lived branch for one job, and commit there.
2. `git fetch origin`, to learn what the others pushed.
3. On `main`, merge your topic branch and merge `origin/main`.
4. `git push origin main`.

Step 3 is the one that surprises people who come from older tools. Git never mixes two people's work on the server. If a teammate pushed first, **you** join the two lines of work on your own computer, and only then will the server take your push. That is true even when you and the teammate changed different files.

Pro Git follows two developers, John and Jessica. Jessica has finished a topic branch named `issue54`, and John pushed to `master` (the book's name for `main`) in the meantime. Here is the same story in the cookbook: your branch is `try-salad`, and your teammate Tariq pushed one commit.

:::graph
caption: "After git fetch origin: your salad commit and Tariq's commit both start from B"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add lentil soup
    parents: [A]
  - id: S
    message: Add a tomato salad
    parents: [B]
  - id: T
    message: Add a soup tip
    parents: [B]
branches:
  main: B
  try-salad: S
remotes:
  origin/main: T
head: try-salad
:::

**Look before you merge.** Before taking a teammate's work in, read it. This is the command the book uses:

```console
$ git log --no-merges try-salad..origin/main
commit 5f75b72fc8498cfc9d9bc47aabc11f9e233d02ed
Author: Tariq (teammate) <tariq@example.com>
Date:   Fri Nov 27 01:39:50 2026 +0300

    Add a soup tip
```

Read it in two parts:

- `try-salad..origin/main` is a [commit range](term:commit-range). It means: the commits that `origin/main` has and `try-salad` does not. In other words, "what would come into my branch if I merged `origin/main`?" The lesson [Point at any commit](lesson:revision-selection) covers ranges in full.
- `--no-merges` leaves out [merge commits](term:merge-commit). A merge commit only joins two lines; the commits that did the real work are listed anyway. On a busy team this makes the list much shorter. It is worth typing whenever you read a shared branch.

One commit, about soup. Nothing in it touches your salad, so the merge will be easy.

**Merge both, then push.** On `main` you merge two things: your topic branch and `origin/main`. Pro Git points out that the order does not matter: the files at the end are the same either way, and only the shape of the history differs.

```console
$ git switch main
Switched to branch 'main'
Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.
  (use "git pull" to update your local branch)
$ git merge try-salad
Updating 35633ab..9e4ebb2
Fast-forward
 salad.md | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 salad.md
$ git merge origin/main
Merge made by the 'ort' strategy.
 soup.md | 1 +
 1 file changed, 1 insertion(+)
$ git push origin main
To https://github.com/you/gitremastered-practice-team-contributing.git
   5f75b72..683babc  main -> main
```

The first merge is a [fast-forward](term:fast-forward): `main` had nothing new of its own, so it just moved onto your salad commit. The second one makes a merge commit, because now both sides have a commit the other lacks.

:::graph
caption: "After both merges: the merge commit M holds your salad and Tariq's tip, so the push loses nothing"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add lentil soup
    parents: [A]
  - id: S
    message: Add a tomato salad
    parents: [B]
  - id: T
    message: Add a soup tip
    parents: [B]
  - id: M
    message: Merge remote-tracking branch 'origin/main'
    parents: [S, T]
branches:
  main: M
  try-salad: S
remotes:
  origin/main: M
head: main
:::

**Read the push line.** The last line of a push is a small report, and Pro Git stops to explain it because you will read it every day:

```console
   5f75b72..683babc  main -> main
```

The pattern is `<old>..<new>  <from> -> <to>`: the server's branch was at commit `5f75b72` and is now at `683babc`; your local branch `main` (from) was pushed to the server's branch `main` (to).

:::predict
question: "You merged try-salad into main but forgot to merge origin/main. Tariq's commit is on the server. What does git push origin main do?"
answer: "The server rejects it with `! [rejected] main -> main (non-fast-forward)`. Your main does not contain Tariq's commit, so accepting the push would drop his commit from the server's main. Merge `origin/main` first, then push."
:::

Now do the whole routine yourself, playing both people. The folder `../teammate` is Tariq's clone of the same repository, and `git -C <folder>` runs a Git command in another folder without leaving yours.

:::try-it
1. Start a topic branch and commit a recipe on it: `git switch -c try-salad`, then `echo "Tomato salad: tomatoes, onion, olive oil." > salad.md`, then `git add salad.md` and `git commit -m "Add a tomato salad"`. In the picture, a new station appears with the `branch try-salad` tag and the `HEAD · you` pin on it.
2. Be Tariq for a moment. Run `echo "Tip: soak the lentils for an hour." >> ../teammate/soup.md`, then `git -C ../teammate commit -am "Add a soup tip"`, then `git -C ../teammate push`. GitHub now has a commit you do not have. Your picture does not change: your repository has not asked the server yet.
3. Be yourself again. Run `git fetch origin`. Git prints a line ending in `main -> origin/main`. In the picture, a station "Add a soup tip" appears on a second row with the `remote origin/main` tag on it.
4. Run `git log --no-merges try-salad..origin/main`. Git shows one commit, by Tariq: the only thing a merge of `origin/main` would bring in.
5. Run `git switch main`, then `git merge try-salad`. Git prints "Fast-forward", and the `branch main` tag moves onto your salad station.
6. Run `git push origin main`. Git answers `! [rejected]`: your `main` lacks Tariq's commit. Nothing was sent.
7. Run `git merge origin/main`. An editor opens with a ready-made message; save and close it. Git prints "Merge made by the 'ort' strategy." In the picture, a merge station joins the two rows, and `branch main` sits on it.
8. Run `git push origin main`. This time the push goes through, and the `remote origin/main` tag jumps onto the merge station.
:::

Steps 3 and 7 together are what `git pull` does in one go. The book splits them so you can look in between, and so will you whenever the incoming work is more than a line or two.

:::compare
today: "`git switch main` changes branch, and a merge prints `Merge made by the 'ort' strategy.`"
book: "`git checkout master` does the same and still works. The book's output says `'recursive' strategy`: `ort` replaced it as the default in Git 2.34 and gives the same result."
:::

### Setup 2: the private managed team

A bigger company adds one rule: only a few engineers, the [integrators](term:integrator), may update `main`. Everybody else works in small groups on feature branches (another name for topic branches), and the integrators merge those branches into `main` when a group says its feature is ready. Pro Git calls this a managed team.

You already know why a team wants this: `main` stays releasable, and somebody looks at every feature before it lands. What changes for you is one thing. **The branch you share is the feature branch, never `main`.**

**Share a feature branch.** In the book, Jessica works on `featureA` with John. She cannot push to `main`, so she pushes the branch itself with `git push -u origin featureA`, and John fetches it. With a branch of the cookbook, that push looks like this:

```console
$ git push -u origin try-dessert
To https://github.com/you/gitremastered-practice-team-contributing.git
 * [new branch]      try-dessert -> try-dessert
branch 'try-dessert' set up to track 'origin/try-dessert'.
```

`* [new branch]` says the server did not have this branch before. The `-u` records `origin/try-dessert` as the branch's [upstream](term:upstream), so plain `git push` and `git pull` work on it from now on, as you saw in [Remote and tracking branches](lesson:remote-branches). (On GitHub, a first push also prints a few `remote:` lines with a link for opening a pull request. They are left out here.)

**Start the next feature from the server's `main`.** While John reviews, Jessica starts a second feature. She does not start it from `featureA`, and not from her own `main`, which may be old. She starts from what the server has right now:

```console
$ git fetch origin
$ git switch -c try-dessert origin/main
Switched to a new branch 'try-dessert'
branch 'try-dessert' set up to track 'origin/main'.
```

Each feature then stands alone: the integrators can take one and wait with the other.

**Read what a teammate added to your shared branch.** John pushes a change to `featureA` and asks Jessica to look. She fetches, then compares her copy of the branch with the server's:

```console
$ git fetch origin
$ git log featureA..origin/featureA
```

This is the same range as before, pointed at a feature branch: the commits the server's `featureA` has and hers lacks. If she likes them, `git merge origin/featureA` brings them in (a fast-forward, if she has no new commits of her own).

**Push to a branch with another name.** Jessica's second feature is on her branch `featureB`. Her teammate Josie already pushed the same feature's first commits as `featureBee`. Jessica merges Josie's work (`git merge origin/featureBee`) and then pushes her branch **to Josie's name**:

```console
$ git push -u origin featureB:featureBee
```

The part with the colon reads `<my branch>:<the server's branch>`. It is a [refspec](term:refspec), and the lesson [Refspecs](lesson:refspecs) takes it apart. You need it only when the two names differ.

**Tell the integrators.** When a feature is ready, the group tells the integrators which branch to merge. In the book that is an email. Today it is almost always a [pull request](term:pull-request): a page on GitHub that says "please merge this branch into `main`", where the team reviews the change first. The lesson "Forks, GitHub Flow and pull requests" teaches it. After the integrators merge, your next `git fetch origin` brings the merge down and `origin/main` contains your feature.

:::try-it
1. Run `git fetch origin`, then `git switch -c try-dessert origin/main`. Git says the new branch is "set up to track 'origin/main'". In the picture, a `branch try-dessert` tag appears on the station that carries `remote origin/main`.
2. Commit a recipe: `echo "Rice pudding: rice, milk, sugar." > dessert.md`, then `git add dessert.md` and `git commit -m "Add rice pudding"`. In the picture, a new station appears with `branch try-dessert` on it. `branch main` does not move.
3. Run `git push -u origin try-dessert`. Git prints `* [new branch]      try-dessert -> try-dessert`. In the picture, a `remote origin/try-dessert` tag appears on your new station. Your teammates could now fetch the branch, and `main` on GitHub is untouched.
:::

### Setup 3: the public project and your fork

Now the project is not yours at all: an open-source project on GitHub. You can read it and clone it, and you cannot push to it, not even a branch. Pro Git: because you may not update the project's branches, you have to get your work to the maintainers some other way.

That other way is a [fork](term:fork). A fork is your own copy of the project on the server, under your account. You may push to it, because it is yours. The maintainer can read it, because it is public. So the work travels like this: you push a branch to your fork, and you ask the maintainer to take the branch from there. That request is a pull request again, this time from one repository to another.

Your local repository now has two remotes, and by convention they have these names:

| Remote | Points at | You use it to |
|---|---|---|
| `origin` | Your fork | Push your branches |
| [upstream](term:upstream-remote) | The original project | Fetch the project's new work |

(The book clones the project first and adds the fork later under the name `myfork`. The idea is the same. Today most people fork first and clone the fork, which gives the names above, and GitHub's own guides use them.)

The whole routine, once:

```console
$ git clone https://github.com/you/cookbook.git
$ cd cookbook
$ git remote add upstream https://github.com/project/cookbook.git
$ git switch -c add-tea
  ... work, git add, git commit ...
$ git push -u origin add-tea
```

Then you open a pull request on GitHub from `add-tea` on your fork into `main` of the project.

**One topic branch per contribution, and never your `main`.** Pro Git gives the reason. The maintainer may turn your work down, or take only part of it, or rewrite it on the way in. If the work sat on your `main`, your `main` would then differ from the project's forever, and you would have to wind it back. On a topic branch a rejected idea costs nothing: you delete the branch. Start each new contribution from the project's `main`, not from your last topic branch, so that the maintainer can accept one without the other:

```console
$ git fetch upstream
$ git switch -c add-bread upstream/main
```

:::sidenote
**In this course the fork is two plain repositories.** A free GitHub account cannot fork its own repository, and the course never asks you for a second account. So "the project" is the practice repository whose name ends in `-upstream`, and your "fork" is the other one. Everything you type about `origin` and `upstream` is exactly what you type with a real fork. One thing differs: GitHub can open a pull request from a fork into its project only because it knows the two belong together. These two repositories are not linked, so in the last challenge you push your branch to `upstream` itself, the way a collaborator with push rights would.
:::

### Keep your fork in sync

A fork does not follow the project by itself. The day after you fork, the project gets new commits and your fork is out of date. Nothing on GitHub updates it for you; the commits go through your computer, in three steps:

1. `git fetch upstream` downloads the project's new commits and moves `upstream/main`.
2. `git merge upstream/main`, on your `main`, moves your `main` forward.
3. `git push origin main` sends the commits on to your fork.

:::graph
caption: "After git fetch upstream: the project has two commits that your main and your fork lack"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add lentil soup
    parents: [A]
  - id: C
    message: Add flatbread
    parents: [B]
  - id: D
    message: Add a contributing guide
    parents: [C]
branches:
  main: B
remotes:
  origin/main: B
  upstream/main: D
head: main
:::

```console
$ git fetch upstream
From https://github.com/you/gitremastered-practice-team-contributing-upstream
 * [new branch]      main       -> upstream/main
$ git merge upstream/main
Updating f689e22..412d2cd
Fast-forward
 CONTRIBUTING.md | 1 +
 bread.md        | 1 +
 2 files changed, 2 insertions(+)
 create mode 100644 CONTRIBUTING.md
 create mode 100644 bread.md
$ git push origin main
To https://github.com/you/gitremastered-practice-team-contributing.git
   f689e22..412d2cd  main -> main
```

`upstream/main` is a [remote-tracking branch](term:remote-tracking-branch) like `origin/main`: your record of where `main` was on that remote at your last fetch. Each remote has its own set, so `origin/main` and `upstream/main` can sit on different commits, as in the picture above.

The merge is a fast-forward, and it always will be if you keep the rule above: your `main` never has commits of its own, so it can only be behind the project, never beside it.

GitHub's command-line program can do the three steps for a real fork in one: `gh repo sync` updates your local `main` from the project, and `gh repo sync you/cookbook` updates the fork on GitHub. The web page of a fork has a "Sync fork" button that does the same. Learn the three Git commands first: they work on every host, and they show you what moved.

**Bring a topic branch up to date.** The project moved while your branch waited for review, and the maintainer asks you to update it. You have two ways, and the project usually says which one it wants:

| Way | Command, on your topic branch | Result |
|---|---|---|
| Merge | `git merge upstream/main` | A merge commit on your branch. Nothing is rewritten, so a plain push works |
| Rebase | `git rebase upstream/main` | Your commits are made again on top of the project's newest commit: a straight line. The push needs force (see Advanced) |

The lesson [Rebasing, and when not to](lesson:rebasing) explains the trade. Pro Git's advice for a fork is to rebase and "resolve the conflicts for the maintainer": a topic branch in your fork is yours alone, which is the one place where rewriting pushed commits is accepted.

:::try-it
1. Run `git remote -v`. Git lists one remote, `origin`, twice: one line for fetching, one for pushing. There is no `upstream` yet.
2. Run `git branch -vv`. The line for `main` shows `[origin/main]`: your `main` follows your own copy, not the project.
3. Stop here. Adding `upstream` and catching up with the project is the first challenge below.
:::

### When it goes wrong

```console
$ git push origin main
To https://github.com/you/gitremastered-practice-team-contributing.git
 ! [rejected]        main -> main (non-fast-forward)
error: failed to push some refs to 'https://github.com/you/gitremastered-practice-team-contributing.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

The server's `main` has a commit your `main` lacks, and you already fetched it (before a fetch, the reason in brackets reads `fetch first`). Merge `origin/main` into `main`, then push again. Do not reach for `--force`: on a shared `main` it throws your teammate's commit away.

```console
$ git fetch upstream
fatal: 'upstream' does not appear to be a git repository
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
$ git merge upstream/main
merge: upstream/main - not something we can merge
```

Your repository has no remote named `upstream`: a clone only knows `origin`. Check with `git remote -v`, add the remote with `git remote add upstream <address>`, and fetch. The second message has the same cause: `upstream/main` exists only after the first `git fetch upstream`.

```console
$ git remote add upstream https://example.com/cookbook.git
error: remote upstream already exists.
```

The name is taken. If the address is wrong, change it with `git remote set-url upstream <address>` instead of adding it again.

One more, in words: a push to a project you may not write to ends with `remote: Permission to project/cookbook.git denied to you` and an error 403. Nothing is broken. You pushed to `upstream` where you meant `origin`: push the branch to your fork and open a pull request.

## Under the hood

"Must know" used `upstream` as if it were a special word. It is a name like any other, and a pull request is an older idea than GitHub. Three short looks inside.

### A second remote is a second block in the settings

`git remote add upstream <address>` writes one block into `.git/config`, next to the one for `origin`:

```console
$ cat .git/config
...
[remote "origin"]
	url = https://github.com/you/gitremastered-practice-team-contributing.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
	remote = origin
	merge = refs/heads/main
[remote "upstream"]
	url = https://github.com/you/gitremastered-practice-team-contributing-upstream.git
	fetch = +refs/heads/*:refs/remotes/upstream/*
```

Each remote has its own `fetch` line, and each line files the branches it downloads in a folder of its own: `refs/remotes/origin/` and `refs/remotes/upstream/`.

```console
$ ls .git/refs/remotes
origin
upstream
```

That is why fetching from the project can never disturb your record of your fork. Git itself knows nothing about forks: to Git these are two unrelated addresses. "Fork" is a feature of the hosting site.

### Two meanings of "upstream"

The word is used for two different things, and mixing them up is a common source of confusion:

| Phrase | Means | Example |
|---|---|---|
| The upstream **branch** of a branch | The remote-tracking branch your branch follows | `origin/main` is the upstream of `main` |
| The `upstream` **remote** | The usual name for the project you forked | `git fetch upstream` |

In the settings above, `[branch "main"]` says `remote = origin`: the upstream branch of your `main` is `origin/main`, on your fork. So a plain `git pull` on `main` asks your fork, not the project. That is why syncing names the remote: `git fetch upstream`.

Pro Git suggests the other arrangement for projects you do not maintain: let your `main` follow the project's `main` directly. `git branch -u upstream/main main` sets that. Then plain `git pull` on `main` brings in the project's work, and you push to the fork with `git push origin main`.

### A pull request without GitHub: `git request-pull`

A pull request is, at heart, a message to the maintainer: "my work is in this repository, on this branch; it starts from this commit of yours; please pull it." Git can write that message itself. `git request-pull <start> <address>` takes the commit your work starts from and the address the maintainer should pull from, and prints a summary:

```console
$ git request-pull upstream/main upstream add-tea
The following changes since commit e50d7835f723eb24bbbfb5e1745dc48da16f5335:

  Add a contributing guide (2026-11-27 17:10:12 +0300)

are available in the Git repository at:

  https://github.com/you/gitremastered-practice-team-contributing-upstream.git add-tea

for you to fetch changes up to d4b659e73a4f008292a51681c621b2954176ff62:

  Say how to serve the tea (2026-11-27 17:10:15 +0300)

----------------------------------------------------------------
Practice Student (2):
      Add mint tea
      Say how to serve the tea

 tea.md | 2 ++
 1 file changed, 2 insertions(+)
 create mode 100644 tea.md
```

Read it from the top: where the work starts, where to fetch it from and which branch, the newest commit, then the list of commits by author and the files they change. The command sends nothing. You paste the text into an email to the maintainer, who then runs `git pull` with that address and branch. In the book's example the address is the contributor's fork: `git request-pull origin/master myfork`.

GitHub's pull request is this message with a web page around it: the same three facts (base, repository, branch), plus a discussion and a merge button. Projects that work by email, like the Linux kernel, still use `git request-pull` between maintainers.

## Advanced

The routine above covers a normal week. These are the cases that come up when a contribution does not go in at the first try.

### After a rebase, the push needs force

You pushed `add-tea`, then rebased it on `upstream/main`. The rebased commits are new commits with new IDs, and the old ones on the server are not their ancestors. So `git status` says the two "have diverged", and a plain push is rejected:

```console
$ git rebase upstream/main
Successfully rebased and updated refs/heads/add-tea.
$ git push upstream add-tea
To https://github.com/you/gitremastered-practice-team-contributing-upstream.git
 ! [rejected]        add-tea -> add-tea (non-fast-forward)
error: failed to push some refs to 'https://github.com/you/gitremastered-practice-team-contributing-upstream.git'
```

Git's hint suggests `git pull`. Here that is the wrong fix: it would merge the old copies of your commits back in. You want the server's branch **replaced**, which is a [force push](term:force-push):

```console
$ git push --force-with-lease upstream add-tea
To https://github.com/you/gitremastered-practice-team-contributing-upstream.git
 + b8d815e...d4b659e add-tea -> add-tea (forced update)
```

The `+` and `(forced update)` say the branch was moved to a commit that does not contain the old one. The book uses `git push -f`. `--force-with-lease` is the careful form: it replaces the branch only if the server's branch is still where your last fetch saw it, so you cannot wipe out a commit someone added in the meantime. The lesson "Force-pushing safely with `--force-with-lease`" covers it.

:::careful
Force-push only a topic branch that is yours alone. Never `main`, and never a feature branch teammates also commit to: their commits vanish from the server's branch.
:::

If you would rather not force at all, the book's alternative is to push the rebased work under a new name, such as `add-tea-v2`, and point the maintainer at that branch.

### A second version: `git merge --squash`

The maintainer likes your branch and asks for a change in how it is done. Pro Git's answer is a fresh branch from the project's current `main` that takes all the old branch's work as one change:

```console
$ git switch -c add-tea-v2 upstream/main
Switched to a new branch 'add-tea-v2'
branch 'add-tea-v2' set up to track 'upstream/main'.
$ git merge --squash add-tea
Updating e50d783..d4b659e
Fast-forward
Squash commit -- not updating HEAD
 tea.md | 2 ++
 1 file changed, 2 insertions(+)
 create mode 100644 tea.md
```

`--squash` puts the result of the merge into your working tree and staging area and stops there: "not updating HEAD" means no commit was made. You make the requested change, then run `git commit`. The new commit has one parent, not two, so the history shows one tidy commit and no merge. Then push `add-tea-v2` and tell the maintainer.

A related option, `git merge --no-commit`, also stops before the commit, and still makes a real merge commit (two parents) when you finish. Use it to inspect or adjust a merge before it is recorded.

### `gh` and two remotes

With both `origin` and `upstream` in place, `gh` has to know which repository you mean when you run `gh pr create` or `gh pr list`. In a terminal it may ask you which repository is the base. `gh repo set-default` asks the same question on its own, and `gh repo set-default --view` prints the answer it remembered. For a contribution, the base is the project, not your fork.

`gh repo fork --clone` does the whole setup for a real project: it creates the fork, clones it, and adds the project as the remote `upstream`.

### Projects that take patches by email

Some older, larger projects (Git itself, the Linux kernel) do not take pull requests on GitHub. You turn each commit into an email with `git format-patch` and send it to a mailing list with `git send-email`. Pro Git describes the process under "Public Project over Email", and the project's own contributing guide says what it expects. The Git habits are the same: one topic branch per contribution, rebased on the project's current `main`.

## Recap

- Where you may push decides the routine: `main` (small team), feature branches only (managed team), or only your fork (public project).
- Small team: `git fetch origin`, read with `git log --no-merges <topic>..origin/main`, merge your topic branch and `origin/main` into `main`, then `git push origin main`.
- Managed team: push the feature branch (`git push -u origin <branch>`), start new work from `origin/main`, and let the integrators merge.
- Fork: `origin` is your fork, `upstream` is the project. One topic branch per contribution; your `main` only follows the project.
- Sync a fork: `git fetch upstream`, `git merge upstream/main`, `git push origin main`.
