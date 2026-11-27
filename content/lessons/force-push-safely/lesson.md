---
id: force-push-safely
title: "Force-pushing safely with --force-with-lease"
module: history-mastery
bookSection: "git-push (Git reference, beyond the book)"
bookUrl: https://git-scm.com/docs/git-push
bookSources:
  - book/progit2/book/03-git-branching/sections/rebasing.asc
readFirst: [clean-up-history]
---

You cleaned up the commits of your feature branch, and now `git push` refuses to send them. The quick fix, `git push --force`, can silently delete a teammate's work on the server. This lesson teaches the safe way to push a rewritten branch, and when you must not do it at all.

## Must know

In [Reword, squash, reorder, split](lesson:clean-up-history) and in [Rebasing](lesson:rebasing) you rewrote commits: every rewritten commit got a new ID, and the old one was left behind. Both lessons ended with the same promise: for a branch that is already on the server, you would learn how to publish the rewritten version. Here it is.

### Why Git refuses a rewritten branch

A normal push follows one rule: the server moves its branch only **forward**. "Forward" means the new commit has the old one somewhere in its history, so nothing the server holds is left out. You met this move in merging as a [fast-forward](term:fast-forward).

A small example. Your branch `add-menu` is on the server with three work-in-progress commits. Then you squash them into one clean commit, `Add the menu`. Your `add-menu` and the server's now look like this:

:::graph
caption: "After the squash: your add-menu and the server's add-menu went separate ways"
commits:
  - id: A
    message: Add contact page
  - id: W1
    message: WIP menu
    parents: [A]
  - id: W2
    message: WIP more menu
    parents: [W1]
  - id: W3
    message: WIP bread
    parents: [W2]
  - id: S
    message: Add the menu
    parents: [A]
branches:
  add-menu: S
remotes:
  origin/add-menu: W3
head: add-menu
:::

`origin/add-menu` is your [remote-tracking branch](term:remote-tracking-branch): your record of where the server's `add-menu` was the last time you talked to the server. `git status` describes the split:

```console
$ git status
On branch add-menu
Your branch and 'origin/add-menu' have diverged,
and have 1 and 3 different commits each, respectively.
  (use "git pull" if you want to integrate the remote branch with yours)

nothing to commit, working tree clean
```

Your new commit S does not have W3 in its history. Moving the server's branch from W3 to S is not a move forward: it would leave three commits out. Git calls such a move a [non-fast-forward](term:non-fast-forward), and a normal push refuses it:

```console
$ git push
To ../origin.git
 ! [rejected]        add-menu -> add-menu (non-fast-forward)
error: failed to push some refs to '../origin.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

The first line after `To` names the server. In this lesson's examples it is a folder; in your practice project it is the address of your practice repository on GitHub.

The refusal is correct, and it protects you. Git cannot know that the three commits left out are your own old drafts. They could just as well be a teammate's work.

:::careful
The hint says "use `git pull`". After a rewrite that is the wrong advice. A pull merges the server's old commits back into your branch, so every WIP commit you just removed returns, next to its clean copy. This is the doubled history that Pro Git warns about in "The Perils of Rebasing".
:::

### What `--force` does

`git push --force` (short: `-f`) tells the server: move the branch to my commit, whatever is there now. It is a [force push](term:force-push). The Git reference says it plainly: it "can cause the remote repository to lose commits".

For your own three WIP commits, losing them is the goal. The danger is everything else that may be on the server's branch by now. Say a teammate, Tariq, fixed a typo on your branch and pushed it ten minutes ago. You have not fetched since. Your record `origin/add-menu` still shows W3, but the server's branch is one commit further:

:::graph
caption: "On the server: Tariq's commit T sits on top of your old commits"
commits:
  - id: A
    message: Add contact page
  - id: W1
    message: WIP menu
    parents: [A]
  - id: W2
    message: WIP more menu
    parents: [W1]
  - id: W3
    message: WIP bread
    parents: [W2]
  - id: T
    message: Add the weekend special
    parents: [W3]
branches:
  add-menu: T
:::

`git push --force` replaces all of that with your one commit S. Tariq's commit T is no longer on the branch, and Git prints nothing that mentions it. You only see `(forced update)`.

The common wrong idea is "`--force` overwrites my old commits". It overwrites **the branch**: whatever the server's branch holds at that moment, including commits you have never seen.

:::careful
Do not make `git push --force` a habit, not even on your own branch. The safe form below costs a few more letters and behaves the same when nobody else pushed.
:::

### `--force-with-lease`: force, but only if nobody pushed

`git push --force-with-lease` tells the server: move the branch to my commit, **but only if your branch is still where I last saw it**. "Where I last saw it" is your remote-tracking branch, `origin/add-menu`.

- The server's branch is where `origin/add-menu` says: nobody pushed since you last looked. The branch is overwritten, exactly as with `--force`.
- The server's branch is somewhere else: somebody pushed. Git refuses, and nothing changes on the server.

The word [lease](term:force-with-lease) comes from renting: you hold the branch only as long as nobody else touched it. So the option protects commits you have never seen, and still lets you replace the ones you have.

For `add-menu`, the result looks like this. The server agrees with you again. The three WIP commits are still stored, but no branch leads to them:

:::graph
caption: "After git push --force-with-lease: origin/add-menu moved onto your commit"
commits:
  - id: A
    message: Add contact page
  - id: W1
    message: WIP menu
    parents: [A]
    faded: true
  - id: W2
    message: WIP more menu
    parents: [W1]
    faded: true
  - id: W3
    message: WIP bread
    parents: [W2]
    faded: true
  - id: S
    message: Add the menu
    parents: [A]
branches:
  add-menu: S
remotes:
  origin/add-menu: S
head: add-menu
:::

This is what the command prints, here for a practice branch named `try-notes`:

```console
$ git push --force-with-lease
To ../origin.git
 + b38aa6c...3025325 try-notes -> try-notes (forced update)
```

Read the result line from the left. The `+` and `(forced update)` say the branch was overwritten, not moved forward. `b38aa6c` is where the server's branch was, and `3025325` is where it is now. Three dots between them (a normal push shows two) mark the same thing.

The practice project on the right is a small bakery website, connected to your practice repository on GitHub as `origin`. It is built when you start the first challenge. A second clone, `../teammate`, sits next to it, so you can play a teammate. The branch `add-menu` belongs to the challenges. For the Try-its, make a branch of your own.

:::try-it
1. Run `git switch -c try-notes main`, then `echo "flour" > notes.txt`, `git add notes.txt` and `git commit -m "Add notes"`. In the picture, a new station "Add notes" appears with the `branch try-notes` tag and the `HEAD · you` pin.
2. Run `git push -u origin try-notes`. Git prints `* [new branch]      try-notes -> try-notes`. In the picture, a `remote origin/try-notes` tag appears on the same station.
3. Rewrite the commit: `git commit --amend -m "Add shopping notes"`. In the picture, a new station "Add shopping notes" takes `branch try-notes`; the old station "Add notes" keeps `remote origin/try-notes` on a row below. The header reads `on branch try-notes · 1 ahead, 1 behind origin/try-notes`.
4. Run `git push`. Git answers `! [rejected]` with `(non-fast-forward)`: the server's commit "Add notes" is not in your branch's history.
5. Run `git push --force-with-lease`. Git prints a line that starts with `+` and ends with `(forced update)`. In the picture, the `remote origin/try-notes` tag jumps onto your station "Add shopping notes". No branch reaches the old commit "Add notes" any more.
6. Run `git status`. It says `Your branch is up to date with 'origin/try-notes'.`
:::

### When a teammate pushed first

That was the quiet case: nobody else touched the branch. Now the case the lease exists for.

:::predict
question: "A teammate pushes a commit to your branch. You do not fetch. You amend your commit and run git push --force-with-lease. What happens, and what is on the server afterwards?"
answer: "Git refuses with (stale info). Your record origin/try-notes points at the commit you pushed last, but the server's branch is now on the teammate's commit. The two differ, so nothing is overwritten: the server still has the teammate's commit."
:::

```console
$ git push --force-with-lease
To ../origin.git
 ! [rejected]        try-notes -> try-notes (stale info)
error: failed to push some refs to '../origin.git'
```

`stale info` means: your record of the server is out of date. There is work on the branch you have not seen. The way out has four steps: fetch, look, keep, push.

**Fetch** brings their commit to your computer and moves your record:

```console
$ git fetch
From ../origin
   3025325..75193f9  try-notes  -> origin/try-notes
```

**Look** at what the server's branch has that yours does not:

```console
$ git log --oneline try-notes..origin/try-notes
75193f9 Add eggs
3025325 Add shopping notes
```

Two commits. `3025325` is your own commit as it was before your second rewrite, so you do not need it. `75193f9 Add eggs` is the teammate's work, and it must survive.

**Keep** their commit by copying it on top of your rewritten branch. The command for copying one commit is `git cherry-pick <commit>`: it takes the change that commit made and makes a new commit with the same change and message on the branch you are on ([cherry-pick](term:cherry-pick)). `origin/try-notes` names the newest commit of the server's branch, which is theirs:

```console
$ git cherry-pick origin/try-notes
[try-notes 4228cac] Add eggs
 Date: Fri Nov 27 01:38:24 2026 +0300
 1 file changed, 1 insertion(+)
```

**Push**, again with the lease. Your record is fresh now, so the server's branch is where you expect it:

```console
$ git push --force-with-lease
To ../origin.git
 + 75193f9...4228cac try-notes -> try-notes (forced update)
```

The server's branch now holds your rewritten commit and a copy of the teammate's commit on top. Tell the teammate: their own copy of the branch still has the old commits, and they need `git pull --rebase` before they go on.

:::careful
Do not run `git rebase origin/try-notes` here. That replays your rewritten commit on top of the server's old commits, so the old versions return, and the replay often stops on a conflict with your own earlier draft.
:::

:::try-it
1. Play the teammate. Run `git -C ../teammate fetch`, then `git -C ../teammate switch try-notes`. `-C ../teammate` runs Git inside the teammate's folder. Git says the teammate's new `try-notes` tracks `origin/try-notes`.
2. Still as the teammate: `echo "eggs" >> ../teammate/notes.txt`, then `git -C ../teammate commit -am "Add eggs"` and `git -C ../teammate push`. Nothing moves in your picture: your repository has not talked to the server.
3. Back as yourself, rewrite your commit again: `git commit --amend -m "Add the shopping notes"`.
4. Run `git push --force-with-lease`. Git answers `! [rejected]` with `(stale info)`. The teammate's commit is still on the server.
5. Run `git fetch`. In the picture, a new station "Add eggs" appears with the `remote origin/try-notes` tag, on a row beside yours.
6. Run `git cherry-pick origin/try-notes`. In the picture, a second station "Add eggs" appears on your row, and `branch try-notes` moves onto it.
7. Run `git push --force-with-lease`. Git prints `(forced update)`, and the `remote origin/try-notes` tag jumps onto your newest station. Run `git log --oneline -3`: "Add eggs" sits on top of "Add the shopping notes".
:::

### The trap: a fetch you did not look at

The lease compares the server with your record `origin/<branch>`. That makes it exactly as good as this sentence is true: "I have looked at everything my record shows". One thing can break that sentence without you noticing.

Many editors and Git programs run `git fetch` on their own every few minutes, so their screens stay fresh. This is called a background fetch. It moves `origin/add-menu` onto the teammate's new commit while you are busy rewriting. Now your record matches the server, the lease check passes, and `--force-with-lease` overwrites a commit you have never looked at. The Git reference warns about exactly this.

The option `--force-if-includes` closes the gap. Add it to the lease, and Git also checks that the commit `origin/<branch>` points at was, at some moment, part of your local branch. If you never had it in your branch, you cannot have built on it, and Git refuses:

```console
$ git push --force-with-lease --force-if-includes
To ../origin.git
 ! [rejected]        try-notes -> try-notes (remote ref updated since checkout)
error: failed to push some refs to '../origin.git'
hint: Updates were rejected because the tip of the remote-tracking branch has
hint: been updated since the last checkout. If you want to integrate the
hint: remote changes, use 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

`remote ref updated since checkout` means: a fetch brought in commits that never were in your branch. Here too, ignore the `git pull` hint. Look at the new commits and copy them with `git cherry-pick`, as before.

Nobody remembers to type two long options. Turn the second one on once, and every `--force-with-lease` includes it:

```console
$ git config --global push.useForceIfIncludes true
```

The setting does nothing to a normal push or to a plain `--force`. It only strengthens the lease.

:::careful
`--force-if-includes` accepts one proof only: the server's commit itself was once in your branch. A cherry-picked copy is a new commit with a new ID, so after you copied their work the check still refuses. You have looked at their commit yourself, so tell Git which commit you expect on the server: `git push --force-with-lease=try-notes:origin/try-notes`. "Advanced" explains this form. The check never gets in your way if you fetch and bring in their commits **before** you start rewriting.
:::

:::try-it
1. As the teammate, get your forced version: `git -C ../teammate pull --rebase`. Git prints `(forced update)` for `origin/try-notes` and then `Successfully rebased`. Add a commit as the teammate: `echo "milk" >> ../teammate/notes.txt`, `git -C ../teammate commit -am "Add milk"` and `git -C ../teammate push`.
2. Play the editor's background fetch: run `git fetch` and do not look at the result. In the picture, a station "Add milk" appears with the `remote origin/try-notes` tag.
3. Rewrite your newest commit: `git commit --amend -m "Add eggs to the notes"`.
4. Ask what the plain lease would do, without doing it: `git push --force-with-lease --dry-run`. `--dry-run` prints the result and sends nothing. Git prints `(forced update)`: the lease would pass, and "Add milk" would be dropped.
5. Run `git push --force-with-lease --force-if-includes`. Git answers `! [rejected]` with `(remote ref updated since checkout)`. "Add milk" is safe.
6. Run `git cherry-pick origin/try-notes`. A station "Add milk" appears on your row.
7. Run `git push --force-with-lease=try-notes:origin/try-notes`. Git prints `(forced update)`. In the picture, `remote origin/try-notes` and `branch try-notes` sit on the same station again.
:::

### When a force push is fine, and when never

The lease protects commits you have not seen. It does not protect the people who already have the old commits on their computers: after any force push, their copy of the branch no longer matches the server, and they must repair it. So the first question is always whose branch it is.

| The branch | Force-push it? |
|---|---|
| Your own pull request branch, which only you commit to | Yes, with `--force-with-lease`. Cleaning up before a review is normal on most teams |
| A branch you share with one or two teammates | Only after you told them, and with the lease. They need `git pull --rebase` afterwards |
| `main`, a release branch, any branch a team builds on | Never. Fix a mistake there with a new commit, or with [revert](lesson:revert-a-commit) |

A pull request is a request on GitHub to merge your branch into `main`; the GitHub lessons teach it. Its branch is the usual place for a force push. Mind one cost: reviewers who already read your commits now see new ones, so tell them what changed.

Teams do not rely on everyone remembering the last row. On GitHub, a repository owner can mark `main` as a protected branch: a setting on the server that refuses every force push to that branch, with or without a lease, from anyone. The lesson [Branch protection, rulesets and CODEOWNERS](lesson:branch-protection-codeowners) shows how to turn it on.

### When it goes wrong

**`! [rejected] ... (non-fast-forward)` after a rewrite.** The server's branch has commits your branch does not have: your own old versions. If the branch is yours, push with `git push --force-with-lease`. Do not follow the `git pull` hint. When the reason reads `(fetch first)` instead, the server also has commits you have never fetched: the lease will refuse too, and the next entry is your case.

**`! [rejected] ... (stale info)`.** The lease check failed: the server's branch is not where your `origin/<branch>` says. Somebody pushed. Run `git fetch`, look with `git log --oneline <branch>..origin/<branch>`, copy their commits with `git cherry-pick`, and push with the lease again. The same message appears when there is no `origin/<branch>` at all, for example when you name another remote: Git has nothing to compare with, and refuses.

**A force push dropped someone's commits.** It happened: `--force` went through and a teammate's work is gone from the server. The commits still exist on the computer of whoever made them. Stop pushing, and follow recipe 4 of the [incident playbook](lesson:incident-playbook).

## Under the hood

Must know treated the lease as a promise between you and the server. Here is what Git really sends, and what the two checks read.

### The lease is an "only if it still equals" update

A push does not send "move the branch to S". For every branch it sends two commit IDs: the one the server should have now, and the one it should have afterwards. The result line shows both:

```console
 + 75193f9...4228cac try-notes -> try-notes (forced update)
```

In a normal push, the "now" ID is whatever the server told your Git a moment earlier, at the start of the same push. With `--force-with-lease`, your Git checks that this ID equals your `origin/try-notes` before it sends anything, and puts your recorded ID in the "now" place. The server then moves its branch only if it still holds that ID. If somebody pushes in the half second between the check and the update, the server refuses too.

So the expected value is simply a [ref](term:ref) in your own repository:

```console
$ git rev-parse --short origin/try-notes
6382cc8
```

Anything that moves that ref, like a fetch, moves what the lease expects. That is the whole background-fetch trap.

### What `--force-if-includes` reads

Git keeps a [reflog](term:reflog) for every branch: a list of every commit the branch has pointed at.

```console
$ git reflog try-notes
864d323 try-notes@{0}: commit (amend): Add eggs to the notes
4228cac try-notes@{1}: cherry-pick: Add eggs
e79a71d try-notes@{2}: commit (amend): Add the shopping notes
3025325 try-notes@{3}: commit (amend): Add shopping notes
b38aa6c try-notes@{4}: commit: Add notes
70f2e3c try-notes@{5}: branch: Created from main
```

`--force-if-includes` goes through these entries and asks of each: is the commit `origin/try-notes` points at in this entry's history? One yes is enough. At the time of this listing, `origin/try-notes` pointed at the teammate's "Add milk", `6382cc8`. No entry has it in its history, so the push was refused.

This also explains the cherry-pick case. The copy of "Add milk" is a different commit with a different ID. The reflog then holds the copy, never `6382cc8` itself.

### Where the overwritten commits go

A force push moves one ref on the server. It deletes no commit there and none on anyone's computer. The dropped commits stay on the server for a while with no branch reaching them, and they stay reachable in every clone that had them: in the teammate's branch and in your own reflog of `origin/<branch>`. That is why the incident playbook can bring them back.

## Advanced

The three options above cover daily work. These topics are for the moments when you want to say exactly what you mean.

### Name the commit you expect: `--force-with-lease=<branch>:<expected>`

The plain option trusts your remote-tracking branch. The long form lets you state the expected commit yourself:

```console
$ git push --force-with-lease=try-notes:6382cc8
```

This reads: overwrite `try-notes` on the server only if it is at `6382cc8` right now. The expected part can be a commit ID or any name of a commit, like `origin/try-notes`.

Use it when you have looked at the server's commit with your own eyes and want the lease to hold exactly that commit, whatever a background fetch does later. With an expected commit that is not what the server has, Git answers `(stale info)`, as before.

When you state the expected commit yourself, `--force-if-includes` and `push.useForceIfIncludes` do nothing: the Git reference calls the combination a "no-op". Git takes your word for it. That is why this form goes through after a cherry-pick.

A middle form, `--force-with-lease=try-notes`, protects only that one branch and still takes the expected commit from `origin/try-notes`.

### The `+` form of a force push

In [Refspecs: how fetch and push map branches](lesson:refspecs) you saw that a leading `+` allows a non-fast-forward move:

```console
$ git push origin +try-notes
To ../origin.git
 + a87935a...f79998e try-notes -> try-notes (forced update)
```

This is a plain force push with no lease. It has one advantage over `--force`: the `+` belongs to one branch. `--force` applies to every branch the command pushes, and with some settings one `git push` sends several. If you ever do need an unconditional force, `+<branch>` limits the damage to the branch you named. On a branch others use, the lease is still the right tool.

### Servers that refuse every force push

A protected branch on GitHub is one way to block force pushes. Git has its own server setting as well: `receive.denyNonFastForwards`. A server with this set to `true` refuses every non-fast-forward push to every branch, lease or not. You meet it on self-hosted servers. When a force push is refused and the message comes from the server (the lines start with `remote:`), no option on your side helps: the rule lives there, and you ask whoever runs the repository.

### An alias, because the option is long

`--force-with-lease` is long to type, which is why people fall back to `-f`. An alias removes that excuse:

```console
$ git config --global alias.pushf "push --force-with-lease"
```

After this, `git pushf` runs the safe form. Together with `push.useForceIfIncludes true`, the short command is also the careful one.

## Recap

- A push only moves the server's branch forward. A rewritten branch has left commits out, so the push is rejected as `non-fast-forward`.
- `git push --force` overwrites the branch with whatever it holds, including commits you have never seen. `git push --force-with-lease` overwrites it only if the server is still where your `origin/<branch>` says.
- `(stale info)` means somebody pushed: `git fetch`, look, `git cherry-pick` their commits onto your branch, then push with the lease again. Never `git pull` after a rewrite.
- A background fetch can fool the lease. `git config --global push.useForceIfIncludes true` makes it refuse commits that were never in your branch.
- Force-push only a branch that is yours, such as your own pull request branch. Never `main`: teams protect it on the server so that nobody can.
