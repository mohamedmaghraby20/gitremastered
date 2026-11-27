---
id: pr-merge-strategies
title: "Merge, squash or rebase-merge a pull request"
module: working-in-a-team
bookSection: "GitHub Docs: About merge methods on GitHub"
bookUrl: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github
bookSources:
  - book/progit2/book/03-git-branching/sections/rebasing.asc
readFirst: [rebasing]
---

Your pull request is approved, and the green button on GitHub turns out to be three buttons. Each one leaves a different history on `main`, and two of them make Git tell you afterwards that your finished branch was never merged. This lesson shows what each button does, how to choose, and how to clean up after each one.

## Must know

In [Rebasing, and when not to](lesson:rebasing) you met the two ways Git brings one branch into another: a merge and a rebase. On GitHub you rarely run either by hand on `main`. You open a [pull request](term:pull-request): a page on GitHub where you ask the team to bring your branch into `main`, and where they review it first. (The lesson "Forks, GitHub Flow and pull requests" teaches pull requests in full.) When the review is done, somebody presses a button, and GitHub does the merge on its own servers. The question of this lesson is which button.

Two names first, because GitHub uses them everywhere:

- The [base branch](term:base-branch) is the branch that receives the work. Here it is always `main`.
- The [head branch](term:head-branch) is the branch the pull request comes from: your [topic branch](term:topic-branch).

### The practice project

This lesson's challenges run on GitHub, in a practice repository on your own account named `gitremastered-practice-pr-merge-strategies`. The app creates it and puts it back in its starting state each time you start a challenge.

The terminal on the right opens in the bakery website, connected to that repository. Run `git log --oneline --graph --all`:

```console
$ git log --oneline --graph --all
* 7fd3417 Add closing day
* 59cd192 Stay open until 6
* 4f1f674 Add opening hours
* d9324ca Add contact page
* feb06ef Add homepage
```

`main` has the two oldest commits. A branch named `hours` has three more, and a teammate opened a pull request from `hours` into `main`. You are on `main`. (Your commit IDs will differ from the ones printed in this lesson, and so will the number of the pull request.)

To look at pull requests from the terminal, this lesson uses `gh`, GitHub's own command-line program, the one the app asked you to sign in with. `gh pr list` lists the open pull requests of the repository you are in:

```console
$ gh pr list

Showing 1 of 1 open pull request in your-name/gitremastered-practice-pr-merge-strategies

ID  TITLE              BRANCH  CREATED AT
#9  Add opening hours  hours   less than a minute ago
```

`your-name` stands for your GitHub user name. `#9` is the pull request's number; GitHub counts them up per repository.

:::try-it
1. Run `git log --oneline --graph --all`. Git prints five commits in one line. In the picture, the `branch hours` tag sits three stations ahead of the `branch main` tag.
2. Run `gh pr list`. You see one open pull request, `Add opening hours`, from the branch `hours`.
3. Run `gh pr view hours`. The second line reads `Open`, then your user name, then `wants to merge 3 commits into main from hours`. Nothing changes in the picture: both commands only read.
:::

Merging that pull request is the first challenge, so leave it open for now. The other Try-its in this lesson work on branches of their own, each starting with `try-`.

### Three buttons, three histories

On the pull request's page, the green button reads **Merge pull request**. Next to it is a small arrow that opens a menu with three choices. GitHub calls them [merge methods](term:merge-method):

| In the menu | In short | What `main` gets |
|---|---|---|
| **Create a merge commit** (the default) | merge | Every commit of the pull request, plus one [merge commit](term:merge-commit) |
| **Squash and merge** | [squash](term:squash-merge) | One new commit that holds all the changes |
| **Rebase and merge** | [rebase-merge](term:rebase-merge) | A new copy of each commit, and no merge commit |

All three leave the same files on `main`. They differ only in the history, and history is what you read, search and undo later. So take the pull request from `hours` and look at each result in turn. This is the start:

:::graph
caption: "Before: the pull request asks to bring the three commits of hours into main"
commits:
  - id: A
    message: Add homepage
  - id: B
    message: Add contact page
    parents: [A]
  - id: H1
    message: Add opening hours
    parents: [B]
  - id: H2
    message: Stay open until 6
    parents: [H1]
  - id: H3
    message: Add closing day
    parents: [H2]
branches:
  main: B
  hours: H3
head: main
:::

**1. Create a merge commit.** GitHub keeps your three commits as they are and adds a merge commit M on `main`. M has two [parents](term:parent-commit): the old tip of `main` and the tip of `hours`.

:::graph
caption: "After Create a merge commit: H1, H2 and H3 are in main with their old IDs, joined by the merge commit M"
commits:
  - id: A
    message: Add homepage
  - id: B
    message: Add contact page
    parents: [A]
  - id: H1
    message: Add opening hours
    parents: [B]
  - id: H2
    message: Stay open until 6
    parents: [H1]
  - id: H3
    message: Add closing day
    parents: [H2]
  - id: M
    message: "Merge pull request #10"
    parents: [B, H3]
branches:
  main: M
  hours: H3
head: main
:::

```console
$ git log --oneline --graph --all
*   de6f01f Merge pull request #10 from your-name/hours
|\
| * 7fd3417 Add closing day
| * 59cd192 Stay open until 6
| * 4f1f674 Add opening hours
|/
* d9324ca Add contact page
* feb06ef Add homepage
```

In [Branch, merge, and fix conflicts](lesson:branch-and-merge), Git skipped the merge commit when the receiving branch had not moved: it did a [fast-forward](term:fast-forward). GitHub never does. This method always makes a merge commit, like `git merge --no-ff` on your computer, so every pull request leaves a visible mark on `main`.

**2. Squash and merge.** To **squash** is to press several commits into one. GitHub adds up the changes of your three commits and puts them on `main` as one new commit S, with one parent.

:::graph
caption: "After Squash and merge: main has one new commit S with all the changes. H1, H2 and H3 are not in main; only hours still leads to them"
commits:
  - id: A
    message: Add homepage
  - id: B
    message: Add contact page
    parents: [A]
  - id: S
    message: "Add opening hours (#9)"
    parents: [B]
  - id: H1
    message: Add opening hours
    parents: [B]
  - id: H2
    message: Stay open until 6
    parents: [H1]
  - id: H3
    message: Add closing day
    parents: [H2]
branches:
  main: S
  hours: H3
head: main
:::

```console
$ git log --oneline --graph --all
* 7b495e1 Add opening hours (#9)
| * 7fd3417 Add closing day
| * 59cd192 Stay open until 6
| * 4f1f674 Add opening hours
|/
* d9324ca Add contact page
* feb06ef Add homepage
```

The new commit is named after the pull request, with its number in brackets. The three original commits sit beside `main`, and nothing in `main` points at them.

**3. Rebase and merge.** GitHub replays your commits on top of `main`, one by one, as `git rebase` does, and moves `main` to the last copy. There is no merge commit.

:::graph
caption: "After Rebase and merge: main has the copies H1', H2' and H3', each with a new ID. The originals stay on hours"
commits:
  - id: A
    message: Add homepage
  - id: B
    message: Add contact page
    parents: [A]
  - id: "H1'"
    message: Add opening hours
    parents: [B]
  - id: "H2'"
    message: Stay open until 6
    parents: ["H1'"]
  - id: "H3'"
    message: Add closing day
    parents: ["H2'"]
  - id: H1
    message: Add opening hours
    parents: [B]
  - id: H2
    message: Stay open until 6
    parents: [H1]
  - id: H3
    message: Add closing day
    parents: [H2]
branches:
  main: "H3'"
  hours: H3
head: main
:::

```console
$ git log --oneline --graph --all
* acd2ed9 Add closing day
* 14e5fc4 Stay open until 6
* 133e2e9 Add opening hours
| * 7fd3417 Add closing day
| * 59cd192 Stay open until 6
| * 4f1f674 Add opening hours
|/
* d9324ca Add contact page
* feb06ef Add homepage
```

Same three messages, three new IDs. Here `main` had not moved at all, so a plain `git rebase` on your computer would have found nothing to do and kept the old IDs. GitHub Docs point out that its button is different: it always makes new commits.

Put the three results side by side:

| | Merge commit | Squash | Rebase-merge |
|---|---|---|---|
| New commits on `main` | 4: your 3 and the merge commit | 1 | 3 copies |
| Your original commits are in `main` | Yes, same IDs | No | No |
| Shape of `main` | Splits and joins | Straight line | Straight line |
| Files on `main` afterwards | The same | The same | The same |

A history with no merge commits in it is a [linear history](term:linear-history). Squash and rebase-merge keep `main` linear; the merge commit does not.

The common wrong idea is "the button put my commits into `main`". Only the first button does that. After a squash or a rebase-merge, `main` holds **new commits with your changes**. Your own commits, with the IDs you know, are in no part of `main`'s history. The files are right and the work is safe; it is the commits that differ. This one fact explains the surprise in the clean-up below.

### Squash by hand, to see it happen

GitHub's squash happens on its servers, where you cannot watch. Git can do the same thing on your computer: `git merge --squash <branch>` tells Git to bring all the changes of that branch into your files and your [staging area](term:staging-area), and to stop there without making any commit. You then make one commit yourself.

:::predict
question: "try-notes has two commits. On try-main you run git merge --squash try-notes and commit the result. Then you run git branch -d try-notes, the safe way to delete a branch that is merged. What will Git say?"
answer: "It refuses: error: the branch 'try-notes' is not fully merged. Git does not compare files. It asks whether the two commits of try-notes can be reached from the branch you are on, and they cannot: try-main got one new commit with the same changes."
:::

Use two branches of your own for this, so `main` and `hours` stay as the first challenge needs them.

:::try-it
1. Run `git switch -c try-main`, then `git switch -c try-notes`. Git makes both branches where `main` is and leaves you on `try-notes`. In the picture, two new branch tags appear on the `Add contact page` station.
2. Make two commits: `echo "Flour arrives on Tuesdays" > notes.txt`, then `git add notes.txt`, then `git commit -m "Add delivery note"`. Then `echo "Milk arrives on Fridays" >> notes.txt` and `git commit -am "Add milk delivery"`. In the picture, `try-notes` is two stations ahead of `try-main`.
3. Run `git switch try-main`, then `git merge --squash try-notes`. Git prints `Squash commit -- not updating HEAD`. In the picture, the `notes.txt` sheet appears in the staging area, and no new station appears: the changes arrived, and no commit was made.
4. Run `git commit -m "Add delivery notes"`. In the picture, one new station appears with the `branch try-main` tag on it. The two stations of `try-notes` stay on their own row beside it.
5. Run `git log --oneline --graph try-main try-notes`. You see one commit on `try-main` and two on `try-notes`, side by side, with no line joining them.
6. Run `git branch -d try-notes`. Git refuses with `error: the branch 'try-notes' is not fully merged`.
7. Run `git diff try-main try-notes`. Git prints nothing: the files of the two branches are the same, so no work would be lost.
8. Run `git branch -D try-notes`, with a capital D. Git prints `Deleted branch try-notes`. In the picture, the tag disappears and the two stations fade: no branch leads to them any more.
9. Tidy up: `git switch main`, then `git branch -D try-main`.
:::

This is what steps 3 to 6 print:

```console
$ git merge --squash try-notes
Updating d9324ca..fe44081
Fast-forward
Squash commit -- not updating HEAD
 notes.txt | 2 ++
 1 file changed, 2 insertions(+)
 create mode 100644 notes.txt
$ git commit -m "Add delivery notes"
[try-main 5c3dfb7] Add delivery notes
 1 file changed, 2 insertions(+)
 create mode 100644 notes.txt
$ git log --oneline --graph try-main try-notes
* 5c3dfb7 Add delivery notes
| * fe44081 Add milk delivery
| * 29c5e69 Add delivery note
|/
* d9324ca Add contact page
* feb06ef Add homepage
$ git branch -d try-notes
error: the branch 'try-notes' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D try-notes'
hint: Disable this message with "git config set advice.forceDeleteBranch false"
```

The line to read in the first output is `Squash commit -- not updating HEAD`: the branch did not move. (The word `Fast-forward` above it only says the changes went in without any combining.)

### Merge from the terminal: `gh pr merge`

You now know what each button builds. You do not need the website to press one: `gh pr merge <branch>` merges the pull request that comes from that branch, with the method you name.

| Command | Same as the button |
|---|---|
| `gh pr merge hours --merge` | Create a merge commit |
| `gh pr merge hours --squash` | Squash and merge |
| `gh pr merge hours --rebase` | Rebase and merge |

```console
$ gh pr merge hours --squash
✓ Squashed and merged pull request your-name/gitremastered-practice-pr-merge-strategies#9 (Add opening hours)
```

The other two flags print `✓ Merged pull request …` and `✓ Rebased and merged pull request …`.

Details worth knowing:

- You may name the pull request by its branch (`hours`) or by its number (`9`). With no name at all, `gh` takes the pull request of the branch you are on.
- Always give the method. Without one, `gh` asks you to pick from a list, which is fine at the keyboard and fails in a script.
- `--delete-branch` (short `-d`) also deletes the head branch, on GitHub and on your computer. Advanced shows its output.

:::careful
`gh pr merge` changes `main` **on GitHub**. Your local `main` knows nothing about it until you fetch. There is also no undo button for a merged pull request: to take the work back you revert it with a new commit, as in [Undo a pushed commit with revert](lesson:revert-a-commit).
:::

### After the merge: update, then clean up

The merge is done on GitHub. Two jobs are left on your computer: get the new `main`, and delete the branch you no longer need.

**Update.** Switch to `main` and pull, as in [Work with remotes: fetch, pull, push](lesson:remotes):

```console
$ git switch main
$ git pull
From https://github.com/your-name/gitremastered-practice-pr-merge-strategies
   d9324ca..7b495e1  main       -> origin/main
Updating d9324ca..7b495e1
Fast-forward
 hours.txt | 2 ++
 1 file changed, 2 insertions(+)
 create mode 100644 hours.txt
```

**Clean up.** `git branch -d <branch>` deletes a branch only when its work is merged, so it is the safe habit. After a **merge commit** it works, because your commits are in `main`:

```console
$ git branch -d hours
Deleted branch hours (was 7fd3417).
```

After a **squash** or a **rebase-merge**, the same command refuses, exactly as in the Try-it:

```console
$ git branch -d hours
error: the branch 'hours' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D hours'
hint: Disable this message with "git config set advice.forceDeleteBranch false"
```

Nothing is broken. Git checks commits, and the three commits of `hours` are not in `main`; `main` has new commits with the same changes. Git cannot know that, so you check it yourself, and then use `-D`, which deletes without asking:

| Check | What you want to see |
|---|---|
| `gh pr view hours` | The second line starts with `Merged` |
| `git diff main hours` | Nothing, if `main` got no other changes since the merge. Any lines it prints are differences between the two branches |
| `git log --oneline main..hours` | Only the commits that were in the pull request. A commit you made after the merge would show up here, and it is **not** on `main` |

```console
$ git branch -D hours
Deleted branch hours (was 7fd3417).
```

:::careful
`git branch -D` deletes any branch, merged or not. If you committed on the branch after the pull request was merged, those commits are in no other branch, and `-D` leaves them without a label. Run the checks first. [Recover lost commits with reflog and fsck](lesson:rescue-lost-work) shows how to get such commits back.
:::

One more case: sometimes `git branch -d` does delete a squash-merged branch and only prints a warning. That happens while the branch still exists on GitHub. Under the hood explains the rule.

### Which one to choose

Each method keeps something and gives something up. GitHub Docs sum up when each fits:

| Method | You keep | You give up | Fits when |
|---|---|---|---|
| Merge commit | Every commit with its ID, and a clear mark where the pull request came in | A straight line: `main` splits and joins at every pull request | The commits are meaningful one by one, or the team wants the full record |
| Squash | A short `main`: one commit per pull request, easy to read and to revert as a whole | The steps inside the pull request, and who wrote which of them | A pull request is one change, built from many small or messy commits |
| Rebase-merge | Every commit, in a straight line | The mark where the pull request starts and ends, and the original IDs | The commits are already tidy and the team wants a linear history |

This is the choice the Rebasing lesson left open: history as a record of what happened (merge commit), or as a tidy story (squash, rebase-merge).

Teams usually pick **one** method for a repository and stick to it. Then `main` reads the same way from top to bottom, everybody knows what a commit on `main` stands for (for a squash team: one reviewed pull request), and nobody has to decide at the button.

Two rules of thumb that hold for any choice:

- Delete the head branch after the merge. With squash and rebase-merge this is more than tidiness: GitHub Docs warn that if you keep working on a branch after it was squashed and open a second pull request from it, the old commits are listed again and you may have to resolve the same conflicts again. Start the next piece of work on a new branch from the updated `main`.
- Squash and rebase-merge make new commits, but they do not break the golden rule of rebasing. The new commits appear on `main` as ordinary additions; nothing that others already have is replaced.

### The repository's settings decide which buttons exist

A team does not have to trust everyone to press the right button. The repository's owner can switch methods off. On GitHub, open the repository's **Settings**; on the first page (General), the section **Pull Requests** has these boxes:

| Setting | What it does |
|---|---|
| **Allow merge commits** | Offers Create a merge commit |
| **Allow squash merging** | Offers Squash and merge |
| **Allow rebase merging** | Offers Rebase and merge |
| **Automatically delete head branches** | Deletes the head branch on GitHub as soon as its pull request is merged |

A new repository allows all three methods and does not delete head branches. A team that wants one commit per pull request ticks only "Allow squash merging", and the other two choices disappear from the menu. "Automatically delete head branches" takes care of the copy on GitHub only: the branch on your computer is still yours to delete.

You do not need to change these for the challenges. The app sets your practice repository to "all three allowed, no automatic deletion" every time a challenge starts.

There is a second, stricter tool. A rule on a branch can **require linear history**: GitHub then refuses any merge commit on that branch, so pull requests into it can only be squashed or rebase-merged. The lesson "Branch protection, rulesets and CODEOWNERS" teaches such rules.

### When it goes wrong

```console
$ gh pr merge hours --rebase
GraphQL: Rebase merges are not allowed on this repository. (mergePullRequest)
```

The repository's settings have this method switched off. That is the team's choice, so use a method that is allowed. (`GraphQL` is the name of the interface `gh` talks to GitHub through; the sentence after it is the message.)

```console
$ gh pr merge clash --squash
X Pull request your-name/gitremastered-practice-pr-merge-strategies#7 is not mergeable: the merge commit cannot be cleanly created.
To have the pull request merged after all the requirements have been met, add the `--auto` flag.
Run the following to resolve the merge conflicts locally:
  gh pr checkout 7 && git fetch origin main && git merge origin/main
```

The pull request has a [merge conflict](term:merge-conflict) with `main`: both changed the same lines. No button can merge it until the conflict is resolved on the head branch. Switch to that branch, merge or rebase the newest `main` into it, resolve the conflict as you learned, and push. Then merge the pull request.

```console
$ git branch -D gallery
error: cannot delete branch 'gallery' used by worktree at 'C:/practice/project'
```

You are on the branch you are trying to delete. Run `git switch main` first, then delete it. (A worktree is a folder with a branch checked out in it; here it is simply your project folder.)

## Under the hood

Must know showed the three results from the outside. This layer opens the commits each button made, so you can see why two of them leave your branch "unmerged", and it gives the exact rule `git branch -d` follows.

### Three commits, one snapshot

Print the newest commit of `main` raw after each method. After **Create a merge commit**:

```console
$ git cat-file -p main
tree 8275865b0bb568fceac0edce75bbcf35517b0a77
parent d9324ca503eab4a75aa661fc90f98eb3001985fb
parent 7fd3417b73c5e4a9474e54e89aa320aa214785f9
author Your Name <you@example.com> 1795788466 +0300
committer GitHub <noreply@github.com> 1795788466 +0300

Merge pull request #10 from your-name/hours

Add opening hours
```

Two `parent` lines. The second is `7fd3417`, the tip of `hours`. Through that line, every commit of `hours` is part of `main`'s history. (GitHub also signs the commits it makes; the signature lines are left out here.)

After **Squash and merge**:

```console
$ git cat-file -p main
tree 8275865b0bb568fceac0edce75bbcf35517b0a77
parent d9324ca503eab4a75aa661fc90f98eb3001985fb
author Your Name <you@example.com> 1795788425 +0300
committer GitHub <noreply@github.com> 1795788425 +0300

Add opening hours (#9)

* Add opening hours

* Stay open until 6

* Add closing day

---------

Co-authored-by: Practice Student <student@example.com>
```

One `parent` line: the old tip of `main`. Nothing here points at `hours`. That missing second parent is the whole difference between a squash and a merge commit.

Now compare the `tree` lines. The tree is the commit's [snapshot](term:snapshot): the full set of files. Both commits have the same one, and it is also the tree of the tip of `hours`:

```console
$ git rev-parse 'main^{tree}' 'hours^{tree}'
8275865b0bb568fceac0edce75bbcf35517b0a77
8275865b0bb568fceac0edce75bbcf35517b0a77
```

`main^{tree}` means "the tree of the commit `main` points at". The same ID twice is the proof that the files are identical, whichever button was pressed. Only the parents differ.

### Who is the author?

`git log` can print the author and the committer of each commit. `%an` is the author's name and `%cn` the committer's:

```console
$ git log --format='%h  %an / %cn  %s' -3
acd2ed9  Practice Student / Your Name  Add closing day
14e5fc4  Practice Student / Your Name  Stay open until 6
133e2e9  Practice Student / Your Name  Add opening hours
```

That was the rebase-merge. Each copy keeps its author (whoever wrote the commit; `Practice Student` in this example) and gets a new committer: the GitHub account that pressed the button. A new committer line means a new [commit ID](term:commit-id), which is why GitHub's rebase-merge always produces new IDs, even when `main` had not moved.

| Method | Author of the new commit | Committer |
|---|---|---|
| Merge commit | The account that merged | GitHub |
| Squash | The account that opened the pull request | GitHub |
| Rebase-merge | The original author of each commit | The account that merged |

A squash has only one author line for many commits. When commits in the pull request were written under another name, GitHub adds a `Co-authored-by:` line for it at the end of the message, as in the output above.

### How `git branch -d` decides

`git branch -d hours` does not compare files. It asks one question: can the newest commit of `hours` be reached from a certain other branch by following parent lines? Which other branch depends on the setup:

1. If `hours` has an [upstream](term:upstream) (it follows `origin/hours`), Git compares with that [remote-tracking branch](term:remote-tracking-branch).
2. If it has none, Git compares with the branch you are on.

After a squash merge, with no upstream, you are on `main` and `main` has no path to `7fd3417`: Git refuses. With an upstream that still exists, the answer flips. Here is a branch `menu` that follows `origin/menu`. Its pull request was rebase-merged, and the branch is still on GitHub. The local branch is level with `origin/menu`, so by rule 1 it counts as merged, and Git deletes it with a warning:

```console
$ git branch -d menu
warning: deleting branch 'menu' that has been merged to
         'refs/remotes/origin/menu', but not yet merged to HEAD
Deleted branch menu (was 7799992).
```

Read the warning as: "everything on this branch is also on GitHub's copy of it, but not on the branch you are on." Once the branch is deleted on GitHub and your remote-tracking branch is gone too, rule 2 applies again and `-d` refuses. So whether you see the warning or the error depends on whether the head branch still exists on GitHub. In both cases the reason is the same: your commits are not in `main`.

### The same three results with plain Git

GitHub runs its own code on the server, but each button has a twin you already know:

| Button | On your computer, on `main` |
|---|---|
| Create a merge commit | `git merge --no-ff hours` |
| Squash and merge | `git merge --squash hours`, then `git commit` |
| Rebase and merge | `git rebase main` on `hours`, then `git merge hours` on `main` (a fast-forward) |

The one difference is the one noted above: `git rebase` keeps a commit as it is when its parent does not change, and GitHub always makes a new one.

## Advanced

These are the details you meet once merging pull requests is routine. The hard challenge needs the first one.

### Choose the squash commit's message

A squash commit is the only trace the pull request leaves on `main`, so its message matters. GitHub fills it in for you: by default, a pull request with one commit gives that commit's title and message, and a pull request with two or more gives the pull request's title and the list of its commits. The pull request's number is added to the title.

On the website you can edit the message before you confirm. In the terminal, `--subject` (short `-t`) sets the title and `--body` (short `-b`) the text under it:

```console
$ gh pr merge gallery --squash --subject "Add a gallery page"
✓ Squashed and merged pull request your-name/gitremastered-practice-pr-merge-strategies#4 (Add a gallery page)
```

```console
$ git log --oneline -1
060d34a Add a gallery page
```

The title is exactly what you typed, with no number added. The repository's owner can also change what the default message is made of, in the same Pull Requests settings.

### Merge and clean up in one go: `--delete-branch`

`gh pr merge --delete-branch` merges, then deletes the head branch on GitHub and on your computer. If you are on that branch, it first switches you to `main` and pulls:

```console
$ gh pr merge --rebase --delete-branch
✓ Rebased and merged pull request your-name/gitremastered-practice-pr-merge-strategies#5 (Add the menu)
From https://github.com/your-name/gitremastered-practice-pr-merge-strategies
 * branch            main       -> FETCH_HEAD
   f10c600..bd30d43  main       -> origin/main
Updating f10c600..bd30d43
Fast-forward
 menu.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 menu.txt
✓ Deleted local branch menu and switched to branch main
✓ Deleted remote branch menu
```

It deletes the local branch without the "fully merged" question, because it knows the pull request was just merged. That makes it the shortest safe clean-up after a squash or a rebase-merge.

### Spot branches whose GitHub copy is gone

When the head branch was deleted on GitHub (by the setting, by a teammate, or by `git push origin --delete gallery`), your local branch still exists. `git branch -vv` marks it:

```console
$ git branch -vv
  gallery 8fc5cd8 [origin/gallery: gone] Gallery done
* main    060d34a [origin/main] Add a gallery page
```

`gone` means: this branch follows a branch on GitHub that no longer exists. That is a good sign that its pull request is finished. Your own repository only notices such deletions when you ask it to: `git fetch --prune` removes remote-tracking branches whose branch on GitHub is gone, as in [Remote and tracking branches](lesson:remote-branches).

### Can Git tell that a branch was squashed?

`git cherry -v main hours` lists the commits of `hours` and marks each with `-` when `main` has a commit that makes the same change, or `+` when it has none. It compares by [patch ID](term:patch-id), the checksum of a change that the Rebasing lesson introduced. After a rebase-merge it finds every copy:

```console
$ git cherry -v main hours
- 4f1f67414b29cd08b431da9596f244ccd28a2f89 Add opening hours
- 59cd192c9626d956eb1dbb74fb28ad4b3088d1e1 Stay open until 6
- 7fd3417b73c5e4a9474e54e89aa320aa214785f9 Add closing day
```

After a squash it finds none:

```console
$ git cherry -v main hours
+ 4f1f67414b29cd08b431da9596f244ccd28a2f89 Add opening hours
+ 59cd192c9626d956eb1dbb74fb28ad4b3088d1e1 Stay open until 6
+ 7fd3417b73c5e4a9474e54e89aa320aa214785f9 Add closing day
```

The squash commit makes all three changes at once, so its patch ID matches none of them. That is why no Git command can say "this branch was squash-merged" for sure, and why the pull request's page is the place to check.

### Rebase-merge and signed commits

In [Sign commits and tags (GPG and SSH)](lesson:signing) you learned to sign commits so GitHub can show them as verified. GitHub Docs warn that Rebase and merge makes changed copies of your commits, and GitHub cannot sign those in your name, so the copies on `main` arrive without a verified signature. A team that requires signed commits on `main` usually picks squash or a merge commit, which GitHub signs itself.

### Merge later, automatically: `--auto`

`gh pr merge --squash --auto` does not merge now. It tells GitHub to merge with that method as soon as every requirement of the branch is met, such as a review or passing checks. It only works where the repository's owner has allowed auto-merge. The lessons on branch protection and on GitHub Actions show where those requirements come from.

## Recap

- GitHub merges a pull request in one of three ways. A merge commit keeps your commits and adds one with two parents. A squash adds one new commit with all the changes. A rebase-merge adds a new copy of each commit. The files end up the same.
- `gh pr merge <branch>` with `--merge`, `--squash` or `--rebase` does the same as the buttons. The merge happens on GitHub: run `git pull` on `main` afterwards.
- After a squash or a rebase-merge, your original commits are not in `main`, so `git branch -d` says "not fully merged". Check that the pull request is merged and that `git diff main <branch>` is empty, then use `git branch -D`.
- Teams pick one method so `main` reads the same everywhere. The repository's settings can switch methods off and delete head branches automatically; a "require linear history" rule forbids merge commits.
- `--subject` sets a squash commit's title, and `--delete-branch` merges and cleans up both copies of the branch in one command.
