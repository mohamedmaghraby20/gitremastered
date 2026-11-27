---
id: github-flow-prs
title: "Forks, GitHub Flow and pull requests"
module: working-in-a-team
bookSection: "6.2 GitHub - Contributing to a Project"
bookUrl: https://git-scm.com/book/en/v2/GitHub-Contributing-to-a-Project
bookSources:
  - book/progit2/book/06-github/sections/2-contributing.asc
readFirst: [remote-branches]
---

Your change is finished and pushed, but on a team nobody wants it to land in `main` before a second person has looked at it, and on an open-source project you are not even allowed to push. Both cases have the same answer: you ask for your branch to be merged, on a page where others can read, discuss and approve the change. This lesson takes you through that whole round, from the first push to the deleted branch.

## Must know

In [Remote and tracking branches](lesson:remote-branches) you published a branch with `git push -u`. In [Team workflows](lesson:team-workflows) you read about GitHub Flow in one paragraph. Now you do it for real, on a repository on your own GitHub account.

### The practice repository is on GitHub

So far the "server" was a folder beside your project. From this lesson on it is real: the app creates a public repository named `gitremastered-practice-github-flow-prs` on your account, and `origin` points at it. The app asks for your permission once before it creates anything.

The practice project is the website of a small cafe: a `README.md` and a `menu.txt` on `main`.

You will use two programs side by side:

- `git`, as always, for commits, branches and pushes.
- `gh`, the [GitHub CLI](term:github-cli): GitHub's own command-line program. It does from the terminal what you would otherwise click on the website: open a pull request, list them, merge one. Pro Git recommends it as the alternative to the web pages. You signed it in with `gh auth login` in the lesson "GitHub account, SSH keys, credentials".

In the output below, `your-name` stands for your GitHub user name. Your commit IDs will differ, and so may the pull request numbers: GitHub keeps counting when the practice repository is used again.

### What a pull request is

A [pull request](term:pull-request) is a page on GitHub that says: "please merge this branch into that branch", with room to talk about it first. People shorten it to PR.

It always names two branches:

| Name | What it is | In this lesson |
|---|---|---|
| **Head** branch (GitHub's web pages call it "compare") | The branch with your new commits | `try-footer` |
| **Base** branch | The branch you want them merged into | `main` |

A small example. `main` holds two commits. You make a branch `try-footer` with one commit, "Add footer", and push it. A pull request from `try-footer` into `main` then shows exactly that one commit and the lines it adds, and offers a button to merge it.

:::graph
caption: "A pull request asks to merge the head branch (try-footer) into the base branch (main)"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add menu
    parents: [A]
  - id: C
    message: Add footer
    parents: [B]
branches:
  main: B
  try-footer: C
remotes:
  origin/main: B
  origin/try-footer: C
head: try-footer
:::

Two things to hold on to:

- Opening a pull request **changes nothing in Git**. No commit is made and no branch moves. It is a conversation about a branch.
- The common wrong idea is "a pull request is a set of commits I send". It is tied to the **branch**. Whatever the branch holds, the pull request shows, including commits you push later.

The name comes from the request itself: you ask the project to pull your branch into theirs.

### GitHub Flow, the whole round

[GitHub Flow](term:github-flow) is the name for the routine built around pull requests. Pro Git lists it, and GitHub Docs describes the same steps:

1. Create a [topic branch](term:topic-branch) from `main`.
2. Commit your work on it.
3. Push the branch to GitHub.
4. Open a pull request.
5. Discuss and review. Push more commits if something has to change.
6. Merge the pull request.
7. Delete the branch, and pull the new `main`.

`main` stays in a state you could release at any moment, because nothing reaches it without passing through a pull request. The rest of "Must know" walks through the steps in order.

### Forks: when you may not push

Step 3 assumes you are allowed to push to the repository. On a team you are. On somebody else's project you are not, and that is what a fork is for.

A [fork](term:fork) is your own copy of someone's repository on GitHub, under your account. You press the **Fork** button on the project's page, and a few seconds later `github.com/your-name/project` exists. It is yours, so you can push to it.

The round is then the same with one change. Pro Git's example: Tony wants to change a project named `blink` that belongs to another user. He forks it, clones **his fork**, makes a topic branch, pushes it to his fork, and opens a pull request from his fork's branch to the original's `main`. The owner reviews and merges it. The project never had to give Tony push access.

| | Team repository | Fork |
|---|---|---|
| Where you push your branch | The shared repository | Your fork |
| Where the pull request goes | Same repository, into `main` | The original repository's `main` |
| Who merges | A teammate, or you after review | The project's owner |

The book adds a note worth remembering: a pull request does not need a fork. Two branches in the same repository are enough, and that is how most teams work.

:::sidenote
A free GitHub account cannot fork its own repository, so this lesson practises in one repository, the way a team does. The lesson "Contributing in real teams" practises the fork setup with two repositories and two remotes.
:::

### Push a branch and open a pull request

Now the first four steps. You will work on a branch of your own, `try-footer`, so that the branch `add-hours` stays as it is for the first challenge.

`gh pr create` opens a pull request from the branch you are on into the repository's default branch, `main`. Give it a title and a description (GitHub calls the description the body):

```console
$ gh pr create --title "Add a footer" --body "Adds the address line for the bottom of every page."
https://github.com/your-name/gitremastered-practice-github-flow-prs/pull/1
```

The answer is the address of the new page. The `1` at the end is the pull request's number, written `#1`.

The branch must be on GitHub first. GitHub can only show what it has received.

:::predict
question: "You have pushed try-footer and opened the pull request. Which of these moved: your main, origin/main, or main on GitHub?"
answer: "None of them. A pull request is only a request. main moves on GitHub when someone merges, and your own main moves when you pull after that."
:::

:::try-it
1. Create the branch and a commit: `git switch -c try-footer`, then `echo "Corner Cafe, 12 Mill Street" > footer.txt`, `git add footer.txt` and `git commit -m "Add footer"`. In the picture, a new station "Add footer" appears with the `branch try-footer` tag and the `HEAD · you` pin.
2. Run `git push -u origin try-footer`. Git prints `* [new branch]      try-footer -> try-footer`. GitHub adds a few `remote:` lines with a link for opening a pull request in the browser. In the picture, a `remote origin/try-footer` tag appears on the same station.
3. Run `gh pr create --title "Add a footer" --body "Adds the address line for the bottom of every page."`. `gh` prints the address of the pull request. Nothing moves in the picture: no commit was made.
4. Run `gh pr list`. One line appears: the number (`#1` in a new repository), the title "Add a footer" and the branch `try-footer`.
:::

```console
$ gh pr list

Showing 1 of 1 open pull request in your-name/gitremastered-practice-github-flow-prs

ID  TITLE         BRANCH      CREATED AT
#1  Add a footer  try-footer  less than a minute ago
```

Three options of `gh pr create` are worth knowing:

| Option | What it does | When to use it |
|---|---|---|
| `--fill` | Takes the title and body from your commit messages | A one-commit branch with a good message |
| `--web` | Opens the form in your browser | When you want to write a longer description there |
| `--base <branch>` | Asks to merge into another branch than the default | Teams with more than one long-running branch |

Typed with no options, `gh pr create` asks for the title and the body one question at a time.

**On the website** the same step is two clicks. After a push, the repository's page shows a yellow bar with the branch name and a **Compare & pull request** button. It opens a form with the base and compare branches at the top, a title, a description, and below them the commits and the changed lines. **Create pull request** sends it.

Pro Git's advice applies to both ways: put effort into the description. Say what the change does and why. It is the first thing a reviewer reads.

### Read the pull request page

The pull request is open. Next question: what do your teammates see?

`gh pr view` prints a summary in the terminal, and `gh pr view --web` opens the page in your browser.

```console
$ gh pr view
Add a footer your-name/gitremastered-practice-github-flow-prs#1
Open • your-name wants to merge 1 commit into main from try-footer • less than a minute ago
+1 -0 • No checks


  Adds the address line for the bottom of every page.


View this pull request on GitHub: https://github.com/your-name/gitremastered-practice-github-flow-prs/pull/1
```

Read it line by line: the title and number; the state (`Open`) and the sentence "wants to merge 1 commit into main from try-footer", which names the base and the head; then `+1 -0`, one line added and none removed. "No checks" means no automatic tests ran. The lesson "CI with GitHub Actions" adds them.

The page in the browser has the same facts, spread over tabs:

| Tab | Shows | You use it to |
|---|---|---|
| **Conversation** | The description, every comment, every push, and at the bottom the merge box | Follow the discussion and merge |
| **Commits** | The commits on your branch that `main` does not have | See how the work was built up |
| **Files changed** | One diff of everything the merge would change | Review the change; reviewers comment on single lines here |

A fourth tab, **Checks**, lists the results of automatic tests.

:::try-it
1. Run `gh pr view`. The summary above appears, with "wants to merge 1 commit into main from try-footer".
2. Run `gh pr view --web`. Your browser opens the page. Click **Files changed**: `footer.txt` is shown with one green line, `+Corner Cafe, 12 Mill Street`.
3. Run `gh pr diff`. The terminal prints the same diff as the Files changed tab.
:::

### Update a pull request: push again

Reviewers rarely say yes at once. Suppose a teammate comments: "Please add the phone number too."

You do not open a new pull request. You commit on the same branch and push. The pull request picks up the new commit by itself, because it follows the branch.

```console
$ git commit -am "Add phone number to footer"
[try-footer 4358609] Add phone number to footer
 1 file changed, 1 insertion(+)
$ git push
To https://github.com/your-name/gitremastered-practice-github-flow-prs.git
   6620b76..4358609  try-footer -> try-footer
```

`gh pr view` now says "wants to merge 2 commits" and `+2 -0`.

Pro Git explains why teams add commits here, and do not replace the old ones: the page keeps the whole story. Someone who reads it a year later sees the first version, the comment and the fix, in order.

:::try-it
1. Run `echo "Phone 555 0100" >> footer.txt`, then `git commit -am "Add phone number to footer"`. In the picture, a second station appears on your branch; `branch try-footer` moves onto it and `remote origin/try-footer` stays one station behind.
2. Run `git push`. Git prints `6620b76..4358609  try-footer -> try-footer` with your own IDs. In the picture, `remote origin/try-footer` catches up.
3. Run `gh pr view`. The summary now reads "wants to merge 2 commits into main from try-footer".
:::

:::careful
A push does not notify anyone. The book's tip: after you push a requested fix, leave a short comment such as "Fixed, please look again", so the reviewer knows. From the terminal that is `gh pr comment --body "Fixed, please look again"`.
:::

### Draft pull requests: not ready yet

Sometimes you want eyes on your work before it is finished. Pro Git notes that teams often open a pull request early and keep pushing to it.

A [draft pull request](term:draft-pull-request) is a pull request marked "work in progress". Everyone can read and comment on it, but GitHub refuses to merge it until you mark it ready.

| You want to | Terminal | Website |
|---|---|---|
| Open as a draft | `gh pr create --draft` | The arrow next to **Create pull request**, then **Create draft pull request** |
| Mark a draft ready | `gh pr ready` | **Ready for review** |
| Turn an open one back into a draft | `gh pr ready --undo` | **Convert to draft** |

```console
$ gh pr ready --undo
✓ Pull request your-name/gitremastered-practice-github-flow-prs#1 is converted to "draft"
$ gh pr ready
✓ Pull request your-name/gitremastered-practice-github-flow-prs#1 is marked as "ready for review"
```

Use a draft when you want early feedback or want others to see what you are working on. Open a normal pull request when you believe the work can be merged.

### Link an issue: `Fixes #2`

Pull requests often exist because of a reported problem. An [issue](term:issue) is GitHub's page for one bug report, question or task. Issues and pull requests share one row of numbers in a repository, so there is never an issue `#3` and a pull request `#3`.

Write `#` and a number anywhere on GitHub, and it becomes a link to that issue or pull request. Write one of GitHub's closing words before it in a pull request's description, and GitHub also **closes the issue for you** when the pull request is merged:

```text
Adds the address line for the bottom of every page.

Fixes #2
```

`Closes #2` and `Resolves #2` do the same. This works when the pull request goes into the repository's default branch. The lesson "Issues, projects, Dependabot and secret scanning" covers issues in full.

### Markdown in a pull request, in short

Descriptions and comments are written in Markdown: plain text with a few signs that GitHub turns into formatting. Pro Git shows these as the most useful ones in a pull request:

| You type | You get | Good for |
|---|---|---|
| `- [ ] Write tests` and `- [x] Write code` | A task list with checkboxes you can tick on the page | Showing what is left to do in a draft |
| A line of three backticks, your code, three backticks again | A code block; add a language name after the first three for colors | Suggesting code in a comment |
| `> some text` | A quote | Answering one sentence of a long comment |
| `#2`, `@name` | A link to an issue or pull request; a mention that notifies that person | Pointing at related work and people |

### Keep your branch up to date with main

While your pull request waits, teammates keep merging into `main`. Your branch started from an older `main`, so it is now behind. Often that is harmless. It matters in two cases: GitHub says the branch has conflicts with the base branch, or your team wants the change tested together with the newest `main`.

The fix is the one you know from [Branch, merge, and fix conflicts](lesson:branch-and-merge), in the other direction: you merge `main` **into your topic branch**, then push.

```console
$ git fetch origin
From https://github.com/your-name/gitremastered-practice-github-flow-prs
   f3dd688..7158442  main       -> origin/main
$ git merge origin/main
Merge made by the 'ort' strategy.
 menu.txt | 1 +
 1 file changed, 1 insertion(+)
$ git push
To https://github.com/your-name/gitremastered-practice-github-flow-prs.git
   4358609..f1ffcfb  try-footer -> try-footer
```

Three steps, three jobs:

- `git fetch origin` downloads the newest `main` from GitHub into your record `origin/main`.
- `git merge origin/main` merges it into the branch you are on. Note the name: `origin/main`, not `main`. Your local `main` is still old.
- `git push` sends the merge commit to GitHub. The pull request checks again whether it can be merged.

:::graph
caption: "After git merge origin/main: your branch holds main's new commit, joined by a merge commit"
commits:
  - id: B
    message: Add menu
  - id: C
    message: Add footer
    parents: [B]
  - id: D
    message: Add phone number to footer
    parents: [C]
  - id: E
    message: Add scone to menu
    parents: [B]
  - id: M
    message: Merge origin/main into try-footer
    parents: [D, E]
branches:
  try-footer: M
  main: B
remotes:
  origin/main: E
head: try-footer
:::

If the merge stops with a conflict, you fix it as in any merge: edit the file, `git add` it, `git commit`, then push. You can repeat this as often as `main` moves; each time you only meet the conflicts that are new.

Your teammate Tariq has a commit waiting in the folder next to yours. In the next Try-it you push it for him, so that `main` on GitHub moves.

:::try-it
1. Play the teammate for one command: `git -C ../teammate push`. This runs Git inside Tariq's folder and pushes his commit "Add scone to menu" to `main` on GitHub. Nothing moves in your picture: your repository has not asked GitHub yet.
2. Run `git fetch origin`. Git prints `main -> origin/main`. In the picture, a new station "Add scone to menu" appears on its own row with the `remote origin/main` tag; `branch main` stays where it was.
3. Run `git merge origin/main --no-edit`. `--no-edit` accepts the ready-made merge message, so no editor opens. In the picture, a merge station joins the two rows and `branch try-footer` moves onto it.
4. Run `git push`. In the picture, `remote origin/try-footer` moves onto the merge station.
:::

### Merge, delete the branch, pull

The review is done. The last steps of GitHub Flow are merge, delete the branch, and update your own `main`.

`gh pr merge --merge --delete-branch` does all of it. It merges the pull request on GitHub with a [merge commit](term:merge-commit), deletes the branch on GitHub, switches you to `main`, pulls, and deletes your local branch:

```console
$ gh pr merge --merge --delete-branch
✓ Merged pull request your-name/gitremastered-practice-github-flow-prs#1 (Add a footer)
From https://github.com/your-name/gitremastered-practice-github-flow-prs
 * branch            main       -> FETCH_HEAD
   7158442..41d5ded  main       -> origin/main
Updating f3dd688..41d5ded
Fast-forward
 footer.txt | 2 ++
 menu.txt   | 1 +
 2 files changed, 3 insertions(+)
 create mode 100644 footer.txt
✓ Deleted local branch try-footer and switched to branch main
✓ Deleted remote branch try-footer
```

The two options:

- `--merge` picks the way to merge: a merge commit, the same as GitHub's default button. GitHub offers two other ways, squash and rebase; the lesson "Merge, squash or rebase-merge a PR" compares the three. Give one of them every time, or `gh` stops to ask.
- `--delete-branch` (short `-d`) removes the branch on GitHub and on your computer after the merge. Without it, only the merge happens, and you are left to run `git switch main`, `git pull` and the deletions yourself.

Why delete? The commits are in `main` now, so the branch label has no job left. A topic branch is one job, and the job is done.

**On the website** the same steps are **Merge pull request**, then **Confirm merge**, then **Delete branch**, all in the box at the bottom of the Conversation tab. After that your computer still knows nothing: run `git switch main`, `git pull`, and `git branch -d try-footer`.

:::graph
caption: "After the merge and a pull: main holds a merge commit made by GitHub, and the topic branch is gone"
commits:
  - id: B
    message: Add menu
  - id: C
    message: Add footer
    parents: [B]
  - id: D
    message: Add phone number to footer
    parents: [C]
  - id: E
    message: Add scone to menu
    parents: [B]
  - id: M
    message: Merge origin/main into try-footer
    parents: [D, E]
  - id: P
    message: "Merge pull request #1"
    parents: [E, M]
branches:
  main: P
remotes:
  origin/main: P
head: main
:::

:::try-it
1. Run `gh pr merge --merge --delete-branch`. `gh` prints the lines above. In the picture, a new station "Merge pull request #1 from your-name/try-footer" appears; `branch main`, `remote origin/main` and the `HEAD · you` pin sit on it, and the `branch try-footer` tag is gone.
2. Run `git log --oneline -3`. The newest commit is the merge commit GitHub made.
3. Run `git branch -a`. Your local `try-footer` is gone, but `remotes/origin/try-footer` is still listed: that record is stale.
4. Run `git fetch --prune`. Git prints `- [deleted]         (none)     -> origin/try-footer`, and the `remote origin/try-footer` tag leaves the picture.
:::

:::careful
In the practice repository you merge your own pull request, because you own the repository and are alone in it. On a team, the point of the pull request is that **someone else** reads it first. Wait for the review, even where GitHub lets you press the button. The lesson "Reviewing a pull request" teaches the reviewer's side.
:::

### The `gh pr` commands at a glance

You have used most of them. With no number, each one acts on the pull request of the branch you are on; with a number (`gh pr view 3`) it acts on that one.

| Command | Job |
|---|---|
| `gh pr create` | Open a pull request from the current branch |
| `gh pr list` | List open pull requests; `--state merged` or `--state all` for the others |
| `gh pr status` | The pull request of your branch, and the ones you opened |
| `gh pr view` | Summary of one pull request; `--web` opens the page, `--comments` adds the conversation |
| `gh pr diff` | The Files changed diff, in the terminal |
| `gh pr checkout 3` | Fetch pull request `#3` and switch to its branch, to try a teammate's work |
| `gh pr merge` | Merge it; `--merge`, `--squash` or `--rebase` picks the way, `--delete-branch` cleans up |
| `gh pr close` | Close it without merging |

`gh pr checkout` is the quick way to run someone else's change on your computer:

```console
$ gh pr checkout 3
From https://github.com/your-name/gitremastered-practice-github-flow-prs
 * [new branch]      add-wifi   -> origin/add-wifi
Switched to a new branch 'add-wifi'
branch 'add-wifi' set up to track 'origin/add-wifi'.
```

### When it goes wrong

```console
$ gh pr create --title "Add a footer" --body "Adds the address line."
head branch "main" is the same as base branch "main", cannot create a pull request
```

You are on `main`, and a pull request needs two different branches. Switch to your topic branch (`git switch try-footer`) and run the command again. If you committed your work on `main` by mistake, make the branch now with `git switch -c try-footer`; the commits come with you.

```console
$ gh pr create --title "Add a footer" --body "x"
a pull request for branch "try-footer" into branch "main" already exists:
https://github.com/your-name/gitremastered-practice-github-flow-prs/pull/1
```

A branch can have one open pull request into the same base. You do not need a second one: push your new commits and the existing one updates.

```console
$ gh pr merge --merge
GraphQL: Pull Request has merge conflicts (mergePullRequest)
```

`main` changed the same lines as your branch, so GitHub cannot merge by itself. The website says the same in the merge box. Bring the branch up to date: `git fetch origin`, `git merge origin/main`, fix the conflict, commit, `git push`, then merge again.

```console
$ gh pr merge --merge
GraphQL: Pull Request is still a draft (mergePullRequest)
```

The pull request is a draft. Run `gh pr ready` first.

```console
$ gh pr merge --merge
GraphQL: Base branch was modified. Review and try the merge again. (mergePullRequest)
```

You merged within a second or two of a push, and GitHub was still working out whether the pull request can be merged. Nothing is broken. Wait a few seconds and run the command again.

## Under the hood

You have opened, updated and merged a pull request. Git itself has no command named "pull request", so where does one live, and what did the merge button do to your history?

### A pull request is not a Git object

Commits, branches and tags are stored in your repository. A pull request is not. It is a record in GitHub's database: a number, a title, a head branch, a base branch, and the conversation. That is why `git clone` does not bring the comments along, and why you need the website or `gh` to read them.

What GitHub does keep in Git is one [ref](term:ref) per pull request, a name that points at a commit, as a branch does. `git ls-remote origin` lists every ref the server has:

```console
$ git ls-remote origin
b2686f96ffbee469fc9d5d87ba3ba48e1ccf208b	HEAD
b2686f96ffbee469fc9d5d87ba3ba48e1ccf208b	refs/heads/main
73bab54af0952970648abc3895966f48b47aeab5	refs/heads/try-prices
f1ffcfbc922f8eda3a225cf677b409f0986bd962	refs/pull/1/head
fe03c7a0285316fe0e77bec6b55599451bfcd68b	refs/pull/3/head
73bab54af0952970648abc3895966f48b47aeab5	refs/pull/4/head
b2f0107a135461498203982b32e6a09a9a681367	refs/pull/4/merge
```

`refs/pull/1/head` points at the newest commit of pull request `#1`. It stays after the branch `try-footer` was deleted, which is how GitHub can still show a merged pull request's commits years later. `refs/pull/4/merge` belongs to a pull request that is still open: it is GitHub's own trial merge of that pull request into the base branch. A plain `git fetch` skips these refs, because it only asks for `refs/heads/`. The lesson [Refspecs: how fetch and push map branches](lesson:refspecs) shows the rule that decides this.

### What the tabs compute

The two tabs you read are two Git commands you already know:

| Tab | Same as | Meaning |
|---|---|---|
| Commits | `git log main..try-footer` | Commits on the head branch that the base does not have |
| Files changed | `git diff main...try-footer` (three dots) | What the head branch changed since the point where it left the base |

Pro Git points out the three dots. The diff does not compare the two branch tips. It compares your branch with the [merge base](term:merge-base), the commit where it split from `main`. So a teammate's new work on `main` never shows up as "removed" in your pull request.

### What the merge button does

GitHub's default merge makes a merge commit **even when a fast-forward would be possible**. On your own computer, `git merge` of a branch that is simply ahead moves the label and makes no commit. GitHub does the equivalent of `git merge --no-ff`, and writes the pull request's number into the message:

```console
$ git log --oneline --graph -6
*   41d5ded Merge pull request #1 from your-name/try-footer
|\  
| *   f1ffcfb Merge remote-tracking branch 'origin/main' into try-footer
| |\  
| |/  
|/|   
* | 7158442 Add scone to menu
| * 4358609 Add phone number to footer
| * 6620b76 Add footer
|/  
* f3dd688 Add menu
```

The book gives the reason: the merge commit names the pull request, so anyone reading the history later can find the conversation behind the change.

GitHub also notices a merge done elsewhere. If you merge the branch into `main` on your computer and push `main`, GitHub sees that the pull request's commits are now in the base branch and marks it merged by itself.

### The record that stays behind

`gh pr merge --delete-branch` deleted two things: the branch on GitHub and your local branch. A third thing is left: your [remote-tracking branch](term:remote-tracking-branch) `origin/try-footer`, your repository's record of a branch that no longer exists. A record like this is only removed when you ask: `git fetch --prune`.

## Advanced

These are the parts of pull requests you meet once the daily round is routine.

### Keep a fork up to date

A fork does not follow the original by itself. Pro Git: GitHub tells you "This branch is 5 commits behind", and updating is your job. The usual setup is a second remote, by custom named `upstream`, that points at the original project:

| Step | Command |
|---|---|
| Add the original once | `git remote add upstream <address of the original>` |
| Get its newest commits | `git fetch upstream` |
| Update your `main` | `git switch main`, then `git merge upstream/main` |
| Update your fork on GitHub | `git push origin main` |

To update an open pull request from a fork, merge `upstream/main` into your topic branch, as you merged `origin/main` in this lesson. GitHub's page for a fork also has a **Sync fork** button, and `gh repo sync` does it from the terminal. Never commit on your fork's `main`: keep it a clean copy of the original and do all work on topic branches.

:::compare
today: "`git switch main`, then `git merge upstream/main`, with a remote named `upstream`."
book: "`git checkout master` and `git pull https://github.com/progit/progit2.git`, or a remote plus `git branch --set-upstream-to` and `remote.pushDefault`. Both still work."
:::

### Update by rebasing

You can bring a branch up to date by rebasing it on `main` in place of merging `main` into it. The history is tidier, with no merge commit. Pro Git's view: it is harder and more error-prone, and the final merge is what matters. If you do rebase, the book advises against force-pushing over a branch with an open pull request that others may have fetched: push the rebased work as a new branch, open a new pull request that mentions the old number, and close the old one. The lessons "Rebasing, and when not to" and "Force-pushing safely with --force-with-lease" cover both tools.

### Update from GitHub

`gh pr update-branch` asks GitHub to merge the base branch into the pull request's branch on the server; the website can offer the same as an **Update branch** button. It saves the fetch and merge, but the new merge commit is then on GitHub only: run `git pull` on your topic branch before you commit again.

### More ways to reference

| You write | It links to |
|---|---|
| `#12` | Issue or pull request 12 in this repository |
| `user#12` | Number 12 in that user's fork of this repository |
| `user/repo#12` | Number 12 in another repository |
| A full 40-character commit ID | That commit |

When a pull request mentions another one, GitHub adds a line to the other one's timeline, so a closed pull request leads to the one that replaced it.

### More Markdown

You can drag an image into any text box on GitHub and it is uploaded and embedded. `:name:` inserts an emoji; type `:` and GitHub suggests names. Selecting text in a comment and pressing `r` quotes it in your reply. GitHub also counts the ticked boxes of a task list and shows the progress in the list of pull requests.

### Let the maintainer push to your fork's branch

A pull request from a fork has a checkbox **Allow edits from maintainers**, ticked by default. With it, the project's [maintainers](term:maintainer), the people who decide what gets merged, can push small fixes straight to your branch. `gh pr create --no-maintainer-edit` turns it off.

## Recap

- A pull request asks to merge a head branch into a base branch, on a page for discussion. It follows the branch: every push updates it.
- GitHub Flow: branch from `main`, commit, `git push -u origin <branch>`, `gh pr create`, review, merge, delete the branch, pull `main`.
- A fork is your own copy of a project you cannot push to; you push there and open the pull request to the original.
- A stale branch: `git fetch origin`, `git merge origin/main` on the topic branch, `git push`.
- `gh pr merge --merge --delete-branch` merges, cleans up and updates your `main`; `git fetch --prune` removes the last stale record.
