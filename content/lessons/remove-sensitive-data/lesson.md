---
id: remove-sensitive-data
title: "Remove a leaked secret or huge file from history"
module: recovery
bookSection: "7.6 Rewriting History"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History
bookSources:
  - vendor/progit2/book/07-git-tools/sections/rewriting-history.asc
  - vendor/progit2/book/10-git-internals/sections/maintenance.asc
readFirst: [rescue-lost-work]
---

A password went into a commit, or a 2 GB video did. You delete the file and commit again, and it is still there: every older commit keeps its copy, and everyone who downloads the project gets it. This lesson shows what to do in the first five minutes, and how to take a file out of every commit for real.

## Must know

The lesson [Recover lost commits with reflog and fsck](lesson:rescue-lost-work) showed that Git almost never forgets a commit. That is good news when you lose work. It is bad news when you commit something that must not be there. So this lesson is the other side of the same fact: how to make Git forget on purpose, and why that takes more than one command.

### Why deleting the file is not enough

A [commit](term:commit) is a full picture of the project at one moment, and Git never changes a commit after it is made. Deleting a file adds a new commit without the file. The older commit still has it.

Here a file `db-password.txt` was committed in "Add database", and then removed in a new commit:

```console
$ git rm db-password.txt -q
$ git commit -m "Remove password"
[main 62f8aa1] Remove password
 1 file changed, 1 deletion(-)
 delete mode 100644 db-password.txt
$ git show HEAD~1:db-password.txt
DB_PASSWORD=hunter2
```

`git show HEAD~1:db-password.txt` means "print that file as it was one commit back". The password is one command away, for anyone who has the repository. The common wrong idea is "I removed it, so it is gone". In Git, removed from the newest commit and removed from history are two different things.

### First, make the secret useless

Two words first.

:::definitions
- term: Secret
  text: "Anything that gives access and must stay private: a password, an API key (a password one program uses to log in to another service), an access token, a private key."
- term: Rotate
  text: "To replace a secret with a new one, so the old value stops working. You do this at the service that issued it, for example in the payment provider's dashboard."
- term: Revoke
  text: "To switch a secret off at the service that issued it, without making a new one."
:::

If a secret was pushed to a server, even for a minute, treat it as read by strangers. Programs scan public repositories for keys all day. Cleaning Git afterwards does not un-leak it: the clean-up removes the file from your history, but it cannot reach the copies other people already made.

So the order is fixed:

1. **Rotate or revoke the secret.** Now the leaked value opens nothing.
2. **Then** decide whether to clean the history.

GitHub's own guide says the first step may be all you need: once the secret is dead, a dead password in old commits harms nobody, and rewriting history has a real cost for your team (you will see it below). You still clean up when the data cannot be rotated (customer data, a private document), when rules require it, or when the problem is size and not secrecy.

A secret that never left your computer was not leaked. Then you only need the clean-up, and it is much easier, because nobody else has the commits.

### The secret is only in your last commit

This is the easy case, and you already have the tool: [amend](term:amend), from the lesson [Fix your last commit](lesson:fix-last-commit). You take the file out of the staging area, tell Git to ignore it from now on, and replace the last commit.

`git rm --cached <file>` removes a file from the staging area and leaves the file itself on your disk. You want that here: your program still needs its password file, Git just must not have it.

The practice project on the right is a small shop app with three commits. Make files of your own for the Try-its, so the challenge files stay as they are. (The challenges at the end start from a fresh copy anyway.)

:::try-it
1. Create a secret and some real work: `echo "TOKEN=abc123" > token.txt`, then `echo "function login() {}" > login.js`. Two sheets marked `new` appear in the working tree.
2. Commit carelessly: `git add .`, then `git commit -m "Add login"`. Git prints "2 files changed": the token went in with the code. A new "Add login" station appears on the map.
3. Run `git rm --cached token.txt`. Git prints `rm 'token.txt'`. In the picture, `token.txt` shows in the staging area as a deletion, and again in the working tree as a new file: the file is still on disk.
4. Ignore it: `echo "token.txt" >> .gitignore`, then `git add .gitignore`. The `token.txt` sheet leaves the working tree, because Git now ignores the file.
5. Run `git commit --amend --no-edit`. `--no-edit` keeps the message. The "Add login" station is replaced by a new one with a different ID; the old one stays on the map, faded.
6. Run `git show --stat --oneline`. The commit now lists `.gitignore` and `login.js`. There is no `token.txt`.
:::

```console
$ git rm --cached token.txt
rm 'token.txt'
$ echo "token.txt" >> .gitignore
$ git add .gitignore
$ git commit --amend --no-edit
[main 426796b] Add login
 Date: Fri Nov 27 01:01:33 2026 +0300
 2 files changed, 2 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 login.js
```

The history has the same number of commits as before, and none of them contains the token. If you had already pushed the old commit, you must also overwrite it on the server; "Update the server and tell your team" below covers that.

### The secret is deeper: every later commit must be replaced

Now the hard case. The file went in several commits ago, and good work was committed on top.

Git cannot edit an old commit. What it can do is build new commits: a copy of the bad commit without the file, then a copy of every commit after it, each one placed on top of the new copy. Then your branch moves to the new chain. This is called **rewriting history**.

:::graph
caption: "Before: db-password.txt was added in B, and C was built on top"
commits:
  - id: A
    message: Add login
  - id: B
    message: Add database
    parents: [A]
  - id: C
    message: Add search
    parents: [B]
branches:
  main: C
head: main
:::

:::graph
caption: "After the rewrite: B2 and C2 are new commits without the file. A did not change"
commits:
  - id: A
    message: Add login
  - id: B
    message: Add database
    parents: [A]
    faded: true
  - id: C
    message: Add search
    parents: [B]
    faded: true
  - id: B2
    message: Add database
    parents: [A]
  - id: C2
    message: Add search
    parents: [B2]
branches:
  main: C2
head: main
:::

What stays the same: every message, author and date, every other file, and every commit before the bad one. What changes: the [commit ID](term:commit-id) of the bad commit and of every commit after it. "Under the hood" explains why the later ones change too.

### Two tools: `git filter-repo` and `git filter-branch`

Two commands do this rewrite across a whole history.

| | `git filter-repo` | `git filter-branch` |
|---|---|---|
| Comes with Git? | No, you install it | Yes |
| Recommended today? | Yes: by Pro Git, by Git's own manual and by GitHub | No: slow and full of traps |
| Cleans up after itself? | Yes | No, you do it by hand |

**`git filter-repo`** is the one to use on a real project. It is a separate program written in Python, so you install it once. With `pip`, the tool that installs Python programs:

```console
$ pip install git-filter-repo
```

(On macOS, `brew install git-filter-repo` does the same.) It wants a fresh [clone](term:clone) to work in, so a mistake cannot hurt your normal folder. Then one command removes a file from every commit of every branch and tag:

```console
$ git filter-repo --invert-paths --path secrets.env
Parsed 5 commits
HEAD is now at 2e7c2b8 Add checkout

New history written in 0.46 seconds; now repacking/cleaning...
Repacking your repo and cleaning out old unneeded objects
Completely finished after 0.89 seconds.
```

- `--path secrets.env` picks the file. Give the path from the top of the project, like `config/secrets.env`.
- `--invert-paths` turns the choice around. Alone, `--path` means "keep only this file". With `--invert-paths` it means "keep everything except this file".

It also prints a notice that it removed your `origin` remote. That is on purpose, so you cannot push the new history by accident. You add the remote again when you are ready.

**`git filter-branch`** is the older tool, and the one Pro Git teaches. It ships with Git, so it works in the practice terminal with nothing to install, and you will meet it in older guides. This lesson practises with it for that reason.

:::compare
today: "`git filter-repo --invert-paths --path secrets.env` removes the file from all branches and tags, fast, and cleans up the old copies itself."
book: "`git filter-branch --tree-filter 'rm -f passwords.txt' HEAD` rewrites the current branch. Pro Git now adds a caution: filter-branch has many pitfalls and git-filter-repo is the better choice."
:::

### Remove a file from every commit with `git filter-branch`

`git filter-branch` walks through your commits from the oldest to the newest, runs a small command of yours on each one, and commits the result as a new commit.

```console
$ FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --index-filter 'git rm --cached --ignore-unmatch db-password.txt' -- --all
```

It is long, so read it in pieces:

| Piece | What it does |
|---|---|
| `FILTER_BRANCH_SQUELCH_WARNING=1` | A setting for this one command. Without it, Git first prints a warning that recommends `git filter-repo` and waits about ten seconds |
| `--index-filter '…'` | The command to run on each commit. It works on the staging area (the index), without writing files to disk, so it is fast |
| `git rm --cached --ignore-unmatch db-password.txt` | The command itself: take the file out of the staging area. `--ignore-unmatch` says "no error if this commit has no such file", which is true for every commit older than the leak |
| `--` | Ends the options. What follows says which commits to rewrite |
| `--all` | Every branch and every other label in the repository, not only the branch you are on |

Leave out `--all` and a second branch still carries the file. Use it every time you remove a secret.

:::careful
A rewrite also removes the file from your working tree, because the new newest commit does not have it. If your program still needs the file, copy it to a place outside the project first. The working tree must also be clean: commit or stash your changes before you start.
:::

:::try-it
1. Leak a second secret: `echo "DB_PASSWORD=hunter2" > db-password.txt`, then `echo "function connect() {}" > db.js`, then `git add .` and `git commit -m "Add database"`.
2. Put work on top: `echo "function search() {}" > search.js`, `git add search.js`, `git commit -m "Add search"`. Then `echo "Thanks for shopping" > footer.txt`, `git add footer.txt`, `git commit -m "Add footer"`. The map ends with three new stations.
3. Run `git log --oneline` and note the IDs of the top four commits.
4. Run `git log --oneline -- db-password.txt`. Git lists one commit, "Add database": the only one that touched the file.
:::

:::predict
question: "You are about to remove db-password.txt from history. Of the commits \"Add login\", \"Add database\", \"Add search\" and \"Add footer\", which will have a new ID afterwards?"
answer: "\"Add database\", \"Add search\" and \"Add footer\". The first lost a file, and the two after it sit on top of a commit that changed. \"Add login\" and everything older keep their IDs."
:::

:::try-it
1. Run the command: `FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --index-filter 'git rm --cached --ignore-unmatch db-password.txt' -- --all`. Git prints a "Rewrite" line per commit, `rm 'db-password.txt'` for each commit that had the file, and at the end `Ref 'refs/heads/main' was rewritten`. In the picture, the last three stations are replaced by three new ones, and the `branch main` tag sits on the new "Add footer". The old three stay on the map, faded.
2. Run `git log --oneline`. The top three IDs are new. "Add login" and the commits below it have the IDs you noted.
3. Run `git log --oneline -- db-password.txt`. Git prints nothing: no commit on your branch touches the file any more.
4. Run `ls`. The file `db-password.txt` is gone from the folder too, as the warning above said. `db.js`, from the same commit, is still there.
:::

```console
Rewrite 6efb85222ac5ab6b5c4b4cf5755b54379a7ff973 (5/7) (2 seconds passed, remaining 0 predicted)    rm 'db-password.txt'
Rewrite bdabe8eb6346b62393a666b8cc0d9c08c476669d (5/7) (2 seconds passed, remaining 0 predicted)    rm 'db-password.txt'
Rewrite 434ce67a89e5beb12d2c5f68343a37a58a8205bf (5/7) (2 seconds passed, remaining 0 predicted)    rm 'db-password.txt'

Ref 'refs/heads/main' was rewritten
$ git log --oneline
7a8743f Add footer
9525764 Add search
d1a3ab0 Add database
426796b Add login
ec5bed7 Add payment
1eb9031 Add cart
1d1fa6d Add README
```

The "Rewrite" lines are a progress counter that overwrites itself, so your screen may show fewer of them. The `rm` appears three times because the file was in three snapshots: the commit that added it and the two after.

### Clear out the old copies on your computer

Your branch is clean now, but the old commits are still inside `.git`, and the password with them. Two things hold on to them.

**1. A backup label.** Before it moves a branch, filter-branch saves the old position under `refs/original/`. A label like this is called a [ref](term:ref): a name that points at a commit.

```console
$ git for-each-ref
7a8743f4ccdacba9c81001e91810b5d76aa7a709 commit	refs/heads/main
434ce67a89e5beb12d2c5f68343a37a58a8205bf commit	refs/original/refs/heads/main
$ git show refs/original/refs/heads/main~2:db-password.txt
DB_PASSWORD=hunter2
```

`git for-each-ref` lists every ref. The second line is the backup, and through it the password still prints.

**2. The [reflog](term:reflog)**, Git's diary of where your branch pointed before.

Once you have checked that the new history is right, remove both, and then tell Git to throw away what nothing points at any more:

```console
$ git update-ref -d refs/original/refs/heads/main
$ git reflog expire --expire=now --all
$ git gc --prune=now
```

| Command | What it does |
|---|---|
| `git update-ref -d <ref>` | Deletes one ref. Here: the backup of `main` |
| `git reflog expire --expire=now --all` | Empties the reflog of every branch. Normally entries live for weeks |
| `git gc --prune=now` | `gc` is short for garbage collection: Git's clean-up of its own storage. `--prune=now` also deletes every commit and file that no ref reaches, without the usual two-week wait |

:::try-it
1. Run `git for-each-ref`. Two lines: `refs/heads/main` and the backup `refs/original/refs/heads/main`.
2. Run `git update-ref -d refs/original/refs/heads/main`. Git prints nothing. Run `git for-each-ref` again: only `refs/heads/main` is left.
3. Run `git reflog expire --expire=now --all`, then `git gc --prune=now`. In the picture, the faded stations disappear from the map: those commits no longer exist.
4. Run `git reflog`. Git prints nothing. The diary is empty.
:::

:::careful
These three commands remove your safety net. The reflog was the way back from every mistake in the Undo lessons, and after `--expire=now` it is empty for the whole repository. Check the new history first (`git log --oneline`, run your tests), and only then clean up.
:::

`git filter-repo` runs this clean-up for you. That is one reason it wants a fresh clone.

### Update the server and tell your team

Everything so far happened on your computer. If the old commits were pushed, the server still has them, and a normal push is refused, because your new history does not continue the server's history:

```console
$ git push
To ../origin.git
 ! [rejected]        main -> main (non-fast-forward)
error: failed to push some refs to '../origin.git'
```

Here you must overwrite the server's branches on purpose, with a [force push](term:force-push). The lesson [Refspecs](lesson:refspecs) introduced it as dangerous; this is one of the few jobs that needs it. Push every branch, then every [tag](term:tag):

```console
$ git push --force --all
To ../origin.git
 + 581b4e0...25f1077 coupons -> coupons (forced update)
 + 07e77d8...2e7c2b8 main -> main (forced update)
$ git push --force --tags
To ../origin.git
 + df19611...4d4c7c6 v1.0 -> v1.0 (forced update)
```

`--all` pushes every local branch and `--tags` every tag. The `+` and "(forced update)" mean the server's old commits were replaced.

Then the people. Every teammate's clone still has the old commits.

- **Warn the team before you start**, and ask them to push their work and stop. Work pushed while you rewrite is lost or forces you to start over.
- **Afterwards, everyone clones again** and deletes the old folder. This is the simple, safe route.
- **Nobody merges old work into the new history.** One `git pull` in an old clone followed by `git push` brings every old commit back to the server, secret included. A teammate with unpushed work moves it onto the new history with a rebase (the Rebasing lesson) instead of a merge.

**On GitHub, a force push is still not the end.** GitHub Docs lists three places the old commits stay reachable:

- In forks: copies of the repository under other people's accounts. Only their owners can clean them.
- In cached pages: anyone who has the old commit's ID can still open it for a while.
- In pull requests. A pull request is GitHub's page for proposing and reviewing a change (the GitHub module teaches it), and GitHub keeps its own read-only refs for each one.

You cannot remove the last two yourself. You contact GitHub Support, who delete the pull request refs and cached pages and run garbage collection on the server. They do this for sensitive data only, and only when rotating the secret would not solve the problem. That is one more reason rotation comes first.

### Stop it happening again

- **Ignore secret files before the first commit.** Put `secrets.env`, `.env`, key files and the like into [.gitignore](term:gitignore) and commit that file, so teammates are covered too. The lesson [Ignore files with .gitignore](lesson:ignoring-files) has the patterns.
- **Stage by name.** `git add .` takes everything in the folder, which is how most secrets get in. `git add payment.js` takes what you chose.
- **Read before you commit.** `git status` shows which files are staged; `git diff --staged` shows their content.
- **Keep secrets out of the code.** Programs read them from the environment or from a secret manager, not from a tracked file.
- **Turn on push protection on GitHub.** It checks each push for known kinds of keys and refuses the push when it finds one. A later GitHub lesson, [Issues, projects, Dependabot and secret scanning](lesson:issues-projects-security), sets it up.

### When it goes wrong

```console
$ git filter-branch --index-filter 'git rm --cached --ignore-unmatch secrets.env' -- --all
Cannot rewrite branches: You have unstaged changes.
```

A tracked file has edits you did not commit. filter-branch refuses, because the rewrite would overwrite them. Commit the edits or put them away with `git stash`, then run it again.

```console
Cannot create a new backup.
A previous backup already exists in refs/original/
Force overwriting the backup with -f
```

You ran filter-branch before, and its backup refs are still there. If the first run was right, delete the backup as shown above. If you are redoing a failed run, add `-f` to overwrite the backup.

```console
$ git log --oneline --all -- secrets.env
7656505 Add payment
```

**The file still shows up after the rewrite.** `--all` in `git log` includes the backup refs, so this lists an old commit. That is expected until you delete `refs/original`. If the commit is still listed after the clean-up, some branch or tag was not rewritten: you ran the command without `-- --all`, or a tag kept its old commit (see "Tags need one more option" in Advanced).

**You rewrote the wrong thing.** Before the clean-up, the backup is your undo: `git reset --hard refs/original/refs/heads/main` puts `main` back on the old commits.

## Under the hood

"Must know" said that removing one file from one old commit gives every later commit a new ID, and that the old commits stay until you clean up. Both follow from how Git stores a commit.

### Why the later commits change too

A commit's ID is a [checksum](term:checksum) of its content: its files, its message, its author, and the ID of its parent, the commit before it. Change any of these and the ID changes.

Follow the chain in the Try-it:

1. "Add database" lost a file. Its content changed, so it got a new ID: `6efb852` became `d1a3ab0`.
2. "Add search" has the same files as before the rewrite, minus the password. And its parent line now names `d1a3ab0`. New content, new ID.
3. "Add footer" names the new "Add search" as parent. New ID again.

"Add login" and everything older were not touched, so `426796b` is the same before and after. This is why a rewrite cannot be hidden: anyone holding the old IDs sees at once that history changed. It is also why signed commits lose their signatures in a rewrite, since a signature belongs to one exact ID.

### What `--index-filter` does for each commit

For every commit, oldest first, filter-branch does three steps:

1. Load that commit's files into the index (the staging area).
2. Run your command. `git rm --cached` takes the one file out of the index.
3. Write the index as a new commit, with the old message, author and date, on top of the new version of its parent.

Nothing is written to the working tree until the very end. Pro Git's first example uses `--tree-filter 'rm -f passwords.txt'` instead, which writes every file of every commit to disk, runs the command, and reads the files back. Same result, much slower, which is why the book switches to `--index-filter` when it removes a big file.

With `-- --all`, filter-branch rewrites every ref, and that includes your [remote-tracking branches](term:remote-tracking-branch) such as `origin/main`. So right after a rewrite, `git status` may claim you are up to date with the server when the server has not changed at all. Trust `git push`, which asks the server itself.

### What still holds the old commits

Git only deletes an [object](term:object) (a stored commit or file) when nothing leads to it. After a rewrite, three things still lead to the old commits, and the clean-up removes them one by one:

| Holder | Removed by |
|---|---|
| The backup refs in `refs/original/` | `git update-ref -d` |
| The reflog entries | `git reflog expire --expire=now --all` |
| The objects themselves, now unreachable | `git gc --prune=now` |

`git count-objects -v` counts what is in storage. In the Try-it repository, before and after the clean-up:

```console
$ git count-objects -vH
count: 34
size: 4.68 KiB
in-pack: 0
packs: 0
size-pack: 0 bytes
$ git reflog expire --expire=now --all
$ git gc --prune=now
$ git count-objects -vH
count: 0
size: 0 bytes
in-pack: 23
packs: 1
size-pack: 3.40 KiB
```

34 objects went in and 23 came out, packed into one [packfile](term:packfile). The 11 that disappeared are the old commits, their file lists, and the two secret files.

:::compare
today: "`git update-ref -d refs/original/refs/heads/main`, `git reflog expire --expire=now --all`, then `git gc --prune=now`: the steps Git's filter-branch manual gives."
book: "`rm -Rf .git/refs/original` and `rm -Rf .git/logs/`, then `git gc`: Pro Git deletes the folders by hand. It works, but it reaches into `.git` directly."
:::

### Why the reflog does not leak

A push or a clone only sends commits that a branch or a tag reaches. Your reflog and `refs/original` never leave your computer. So the moment your branches and tags are clean, a new clone of your repository is clean, even before you run `gc`. The local clean-up matters for your own disk and for anyone who gets a copy of the folder itself.

The practice challenges check the same thing: no commit that a branch, a tag or HEAD reaches may contain the file.

## Advanced

The same rewrite solves a second problem, a file that is too big, and filter-branch has a few options you need once a repository has tags or more history.

### A huge file: find it, remove it, measure it

Pro Git's own example for this technique is not a secret but a size problem. Someone commits a big archive, removes it in the next commit, and every clone still downloads it for ever.

`git count-objects -vH` measures the repository. `-v` gives the full list of numbers and `-H` prints sizes in readable units. `size-pack` is the one to read. Here after a 5 MB file was added and deleted again:

```console
$ git gc -q
$ git count-objects -vH
count: 0
size: 0 bytes
in-pack: 10
packs: 1
size-pack: 4.77 MiB
prune-packable: 0
garbage: 0
size-garbage: 0 bytes
```

Almost 5 MB for a project of two tiny files. To find which file it is, list every stored file with its size and sort:

```console
$ git rev-list --objects --all | git cat-file --batch-check="%(objecttype) %(objectsize) %(rest)" | grep "^blob" | sort -k 2 -n | tail -3
blob 11 README.md
blob 24 cart.js
blob 5000000 demo-video.bin
$ git log --oneline --all -- demo-video.bin
dd8a963 Remove demo video
f4ef7ab Add demo video
```

`git rev-list --objects --all` lists every object in history with its file name, `git cat-file --batch-check` adds the size, and `sort | tail` leaves the biggest at the bottom. (Pro Git does the same with `git verify-pack`; this form needs no packfile name.) Then the removal is the one you know, followed by the clean-up:

```console
$ FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --index-filter 'git rm --cached --ignore-unmatch demo-video.bin' -- --all
$ git update-ref -d refs/original/refs/heads/main
$ git reflog expire --expire=now --all
$ git gc --prune=now
$ git count-objects -vH
count: 0
size: 0 bytes
in-pack: 8
packs: 1
size-pack: 1.85 KiB
prune-packable: 0
garbage: 0
size-garbage: 0 bytes
```

From 4.77 MiB to 1.85 KiB. Here the clean-up is the whole point: until `gc --prune=now` runs, the repository is as big as before.

### Tags need one more option

`-- --all` makes filter-branch rewrite the commits a tag reaches, but it leaves the tag itself on the old commit, and says so:

```console
WARNING: You said to rewrite tagged commits, but not the corresponding tag.
WARNING: Perhaps use '--tag-name-filter cat' to rewrite the tag.
```

A tag on an old commit keeps the whole old chain alive, secret included. Add `--tag-name-filter cat` before the `--`. It means "move each tag to the new commit and keep its name":

```console
$ FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --index-filter 'git rm --cached --ignore-unmatch secrets.env' --tag-name-filter cat -- --all
...
Ref 'refs/heads/coupons' was rewritten
Ref 'refs/heads/main' was rewritten
Ref 'refs/tags/v1.0' was rewritten
v1.0 -> v1.0 (df09851d1cee8f65a18ced2bdfc4752d394d8adb -> 72a97da763c6ef9848830a405cd38f63d2572c00)
```

The last line shows the tag moving from the old commit to its replacement. `git filter-repo` moves tags without being asked.

### Empty commits and `--prune-empty`

If a commit did nothing but add the file, its rewritten copy changes nothing. filter-branch keeps it as an empty commit. Add `--prune-empty` and such commits are dropped from the new history. In the huge-file example, "Add demo video" and "Remove demo video" both vanish with it.

### Rewrite only part of the history

Pro Git ends its command with `-- 7b30847^..` in place of `-- --all`: start at the commit that added the file and go up to the current branch. That is faster on a long history, but it covers one branch only. For a secret, `--all` is the safe choice.

### A secret inside a file you want to keep

When the password sits on line 12 of `config.js`, removing the whole file is wrong. `git filter-repo --replace-text ../passwords.txt` reads a list of secret strings from a file outside the project and replaces each one, in every commit, with `***REMOVED***`. GitHub Docs adds `--sensitive-data-removal` to both forms of the command; it makes filter-repo report the first changed commit and the pull requests affected, which GitHub Support asks for.

### What else filter-branch can do

Pro Git shows two more filters. `--subdirectory-filter trunk` makes one folder the new top of the project in every commit, and `--commit-filter` can change the author email in every commit. Both rewrite every ID, so the rules of this lesson apply to them unchanged. `git filter-repo` covers the same jobs with `--subdirectory-filter` and a mailmap file.

## Recap

- Rotate or revoke a leaked secret first. Rewriting history does not un-leak it, and often the rotation is enough.
- Only in the last commit: `git rm --cached <file>`, add it to `.gitignore`, then `git commit --amend`.
- Deeper in history: `git filter-repo --invert-paths --path <file>` on a real project. `git filter-branch --index-filter 'git rm --cached --ignore-unmatch <file>' -- --all` ships with Git; add `--tag-name-filter cat` when there are tags.
- The rewrite gives the bad commit and every later commit a new ID. Old copies stay until you delete `refs/original`, expire the reflog and run `git gc --prune=now`.
- Then `git push --force --all` and `--tags`, have everyone clone again, and ask GitHub Support to clear pull request refs and cached pages.
