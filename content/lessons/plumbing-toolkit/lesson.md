---
id: plumbing-toolkit
title: "Environment variables and git replace"
module: under-the-hood
bookSection: "10.8 Environment Variables"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Environment-Variables
bookSources:
  - book/progit2/book/10-git-internals/sections/environment.asc
  - book/progit2/book/07-git-tools/sections/replace.asc
readFirst: [first-look-inside]
---

A script has to commit as "Release Bot" without touching your settings, a push fails and Git will not say why, and half of a project's history sits on another branch. This lesson gives you the switches for all three: variables that change how one Git command behaves, and `git replace`, which changes what the history looks like without rewriting a single commit.

## Must know

Until now you changed Git's behavior in two ways: options on the command (`git log --oneline`) and [settings](term:config) (`git config user.name`). There is a third way, and scripts, build servers (machines that test and package code with nobody at the keyboard) and bug hunts depend on it.

### What an environment variable is

An [environment variable](term:environment-variable) is a named value that your terminal hands to every program it starts. The program can read it and act differently. You already rely on one: `HOME` holds the path of your user folder, and Git reads it to find your global settings file.

Git reads dozens of them, and nearly all start with `GIT_`. In the practice terminal (Git Bash) you set one in two ways:

| You type | How long it lasts |
|---|---|
| `GIT_TRACE=1 git status` | That one command. The variable is written in front of the command, on the same line |
| `export GIT_TRACE=1` | Every command until you close the terminal, or until you run `unset GIT_TRACE` |

Prefer the first form. A variable that lasts for one command cannot surprise you ten minutes later.

:::sidenote
PowerShell writes it differently: `$env:GIT_TRACE=1`, then `git status` on the next line, and `Remove-Item Env:GIT_TRACE` to clear it. The variables themselves are the same in every shell.
:::

Pro Git sorts the useful variables into groups. This lesson follows the same order: global behavior, where the repository is, who commits, the network, and debugging.

### Global behavior: editor, pager, settings files

These change how Git behaves as a program, in every repository.

| Variable | What it does | When you use it |
|---|---|---|
| `GIT_EDITOR` | The editor Git opens when it needs text from you, such as a commit message. It wins over the `core.editor` setting | In a script, where nobody can type: `GIT_EDITOR=true` accepts the text as it is |
| `GIT_PAGER` | The program that shows long output. The [pager](term:pager) is the viewer you leave with `q`. It wins over `core.pager` | `GIT_PAGER=cat git log` prints everything straight to the terminal |
| `HOME` | Your user folder. Git looks there for the global settings file, `.gitconfig` | Rarely changed by hand. Test tools point it at an empty folder to get a Git with no personal settings |
| `GIT_CONFIG_NOSYSTEM` | When set to `1`, Git skips the system-wide settings file (the one for all users of the computer) | That file gets in your way and you are not allowed to edit it |
| `GIT_EXEC_PATH` | The folder where Git looks for its sub-programs | Almost never. `git --exec-path` shows the current folder |

`true` is a tiny program that does nothing and reports success. With `GIT_EDITOR=true`, Git "opens the editor", the editor closes at once, and Git keeps the text it had prepared. That is how a script finishes a merge or a rebase with nobody at the keyboard.

```console
$ GIT_PAGER=cat git log --oneline
e2e45e2 Pair note
d6897ca Add todo list
cdf74c4 Add menu
e273bb9 Add README
```

### One setting for one command: `git -c`

Often you do not need a variable at all. `git -c <key>=<value>` gives one setting a different value for one command. It goes right after the word `git`, before the command name, and it wins over all three settings files.

```console
$ git -c user.name="Pair Session" commit --allow-empty -m "Pair note"
[main e2e45e2] Pair note
$ git log -1 --format="%an <%ae>"
Pair Session <student@example.com>
$ git config user.name
Practice Student
```

The commit carries the name "Pair Session", and the stored setting is untouched. (`--allow-empty` makes a commit with no file changes, which is handy for trying things out.)

:::careful
Small `-c` and capital `-C` are different options. `git -c key=value` sets a setting for one command. `git -C <folder>` runs the command as if you had started it in that folder. You meet `-C` in the next part.
:::

### Where the repository is

Git has to find two places before it can do anything: the [repository](term:repository) (the `.git` folder) and the [working tree](term:working-tree) (your files). Normally it finds them by itself: it looks for `.git` in the current folder, then in the folder above, and so on upward. The top folder of the working tree is the one that holds `.git`.

Step outside the project and that search fails:

```console
$ cd ..
$ git status
fatal: not a git repository (or any of the parent directories): .git
```

You can point Git at the project instead of walking into it:

| You type | What it does |
|---|---|
| `git -C project status` | Runs the command as if you had typed `cd project` first. The simplest choice, and the one to reach for first |
| `GIT_DIR=<path>` | Says where the repository is. Git stops searching |
| `GIT_WORK_TREE=<path>` | Says where the working tree's top folder is |

```console
$ git -C project status
On branch main
nothing to commit, working tree clean
$ GIT_DIR=project/.git git log --oneline -1
373c033 Nightly check
```

`GIT_DIR` and `GIT_WORK_TREE` matter when the two places are not together. A common case is a web server: the repository sits in one folder and the site's files in another, so that visitors can never download `.git`. Here the repository is `website-repo.git` and the files are in `website`:

```console
$ GIT_DIR=../website-repo.git git branch
* main
  redesign
  winter-sale
$ GIT_DIR=../website-repo.git GIT_WORK_TREE=../website git status --short
 M about.html
```

Reading branches needs only the repository. `git status` compares files, so it needs the working tree too. The same two values can be given as options, which some people find easier to read: `git --git-dir=../website-repo.git --work-tree=../website status`.

:::careful
With `GIT_DIR` set and no `GIT_WORK_TREE`, Git takes **the folder you are standing in** as the working tree. Run the status command above without `GIT_WORK_TREE` from another project and Git compares the website's commit with that project's files:

```console
$ GIT_DIR=../website-repo.git git status --short
 D about.html
 D index.html
?? README.md
?? menu.txt
?? todo.txt
```

Nothing was deleted. Git looked in the wrong folder. A command that writes, like `git restore .` or `git add .`, would do real damage here. Give both variables, or use `git -C`.
:::

Two more variables move single parts of the repository. You will rarely set them, but they show how separate those parts are:

| Variable | What it moves |
|---|---|
| `GIT_INDEX_FILE` | The file that holds the [staging area](term:staging-area), normally `.git/index`. Scripts use a second, temporary index to build a commit without disturbing what you have staged |
| `GIT_OBJECT_DIRECTORY` | The folder of stored [objects](term:object), normally `.git/objects` |

:::try-it
1. Run `cd ..` to step out of the project, then `git status`. Git answers `fatal: not a git repository`: there is no `.git` here or above.
2. Run `git -C project status`. Git reports on the project as usual. In the picture nothing moves: you only looked.
3. Run `GIT_DIR=project/.git git log --oneline -1`. Git prints the project's newest commit, the one under the `HEAD · you` pin on the history map.
4. Run `cd project` to go back in. The later steps of this lesson expect you there.
:::

### Who commits, and when

Every commit records two people and two times. The **author** wrote the change. The **committer** put it into the repository. They are usually the same person at the same moment, and both normally come from your `user.name` and `user.email` settings and the computer's clock.

Six variables override them for one command:

| Variable | Sets |
|---|---|
| `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_AUTHOR_DATE` | The author's name, email and time |
| `GIT_COMMITTER_NAME`, `GIT_COMMITTER_EMAIL`, `GIT_COMMITTER_DATE` | The committer's name, email and time |

These win over every settings file, and over `git -c user.name=…` too. People use them in release scripts ("commits made by the build server are signed Release Bot"), when bringing in history from another system with its original dates, and in tests that must produce the same commit IDs on every run.

A date can be written as `2026-01-15T12:00:00`: year, month, day, the letter `T`, then the time. Git reads it in your computer's time zone.

:::predict
question: "You run a commit with only GIT_AUTHOR_NAME and GIT_AUTHOR_DATE set. `git log --format=fuller` prints four lines: Author, AuthorDate, Commit and CommitDate. Which of the four show the values you set?"
answer: "Only Author and AuthorDate. The committer is a separate pair of fields with its own variables, so Commit still shows your configured name and CommitDate shows the real time. The email after the author name also stays yours, because you did not set GIT_AUTHOR_EMAIL."
:::

:::try-it
1. Make a file of your own, so the practice files stay as they are: `echo "buy milk" > todo.txt`, then `git add todo.txt`. In the picture, the `todo.txt` sheet slides into the staging area.
2. Commit with a different author and date, all on one line: `GIT_AUTHOR_NAME="Night Owl" GIT_AUTHOR_DATE="2026-02-01T03:00:00" git commit -m "Add todo list"`. Git prints an extra line, `Author: Night Owl <…>`, because the author is not you. On the history map a new station appears and the `main` label moves onto it.
3. Run `git log -1 --format=fuller`. `Author` and `AuthorDate` show Night Owl and 1 February; `Commit` and `CommitDate` show your own name and the real time.
4. Run `git config user.name`. Your stored name has not changed: the variables lasted for that one command.
:::

This is what the same experiment printed with "Release Bot":

```console
$ GIT_AUTHOR_NAME="Release Bot" GIT_AUTHOR_DATE="2026-01-15T12:00:00" git commit -m "Add todo list"
[main d6897ca] Add todo list
 Author: Release Bot <student@example.com>
 1 file changed, 1 insertion(+)
 create mode 100644 todo.txt
$ git log -1 --format=fuller
commit d6897caa1369b7659a150e9ea85323497a814104
Author:     Release Bot <student@example.com>
AuthorDate: Thu Jan 15 12:00:00 2026 +0300
Commit:     Practice Student <student@example.com>
CommitDate: Fri Nov 27 01:11:42 2026 +0300

    Add todo list
```

The common wrong idea is that an author name proves who made a commit. It does not: anyone can type any name here. Proof needs a signature, which the lesson on signing your work covers.

### The network

Two variables help when Git talks to a server.

| Variable | What it does | When you use it |
|---|---|---|
| `GIT_SSH_COMMAND` | The exact `ssh` command Git runs for SSH addresses (the ones that look like `git@github.com:…`) | To use a different key for one command: `GIT_SSH_COMMAND="ssh -i ~/.ssh/work_key" git clone git@github.com:team/shop.git` |
| `GIT_TERMINAL_PROMPT` | Set to `0`, Git never stops to ask for a user name or password in the terminal. It fails at once instead | In scripts and build servers, where a question nobody answers would hang the job forever |

### Debugging: make Git say what it is doing

Git has tracing built in: it can print what it does, step by step, as it works. Each kind of trace has its own variable. Set it to `1` and the trace appears in the terminal, mixed with the normal output. Set it to a full file path and the trace goes into that file.

| Variable | Shows | Reach for it when |
|---|---|---|
| `GIT_TRACE` | Which programs and sub-commands Git really runs, including what an alias (a shortcut name for a command) expands to | A command does something you did not expect |
| `GIT_TRACE_PERFORMANCE` | How long each step took | Git is slow and you want to know where |
| `GIT_TRACE_PACKET` | Every message between your Git and the server | A fetch or push fails and the error is vague |
| `GIT_CURL_VERBOSE` | The full HTTP conversation, for `https://` addresses | A login, proxy or certificate problem |

```console
$ GIT_TRACE=1 git status
01:11:43.755077 exec-cmd.c:266          trace: resolved executable dir: C:/Program Files/Git/mingw64/bin
01:11:43.777282 git.c:502               trace: built-in: git status
On branch main
nothing to commit, working tree clean
```

Each trace line has a time, the place in Git's own source code that printed it, and a message. Your paths and times will differ. Here Git found its program folder and ran the built-in `status` command. With an alias named `last`, the trace shows what the alias stands for:

```console
$ GIT_TRACE=1 git last
...
01:11:43.951825 git.c:447               trace: alias expansion: last => log -1 --oneline
...
e2e45e2 Pair note
```

`GIT_TRACE_PERFORMANCE` ends with the total for the whole command:

```console
$ GIT_TRACE_PERFORMANCE=1 git status --short
01:11:44.141482 read-cache.c:2366       performance: 0.000135300 s:  read cache .git/index
01:11:44.142484 read-cache.c:1613       performance: 0.000180500 s:  refresh index
...
01:11:44.148039 trace.c:416             performance: 0.012788100 s: git command: 'C:\Program Files\Git\mingw64\bin\git.exe' status --short
```

`GIT_TRACE_PACKET` prints the conversation that the lesson [How Git talks to a server](lesson:how-git-talks) describes. Lines marked `>` were sent, lines marked `<` were received:

```console
$ GIT_TRACE_PACKET=1 git ls-remote ../srv.git
01:11:56.167280 pkt-line.c:85           packet:  upload-pack> version 2
01:11:56.168281 pkt-line.c:85           packet:    ls-remote< version 2
...
01:11:56.169794 pkt-line.c:85           packet:    ls-remote> command=ls-refs
...
```

:::careful
A network trace can contain your login token. Read it before you paste it into a bug report or a chat, and remove any line that carries a password or an `Authorization` value.
:::

:::try-it
1. Run `GIT_TRACE=1 git status`. Above the usual status text, Git prints `trace:` lines that name the program it ran. In the picture nothing moves.
2. Run `GIT_TRACE_PERFORMANCE=1 git status`. The last `performance:` line gives the time of the whole command in seconds.
3. Run `git status` once more. The trace is gone: the variable lasted for one command.
:::

### `git replace`: show a different object in place of this one

That was the first half: switches for one command. The second half is one command that looks like magic until you know the trick.

You know that an object in Git can never change: a commit's [ID](term:commit-id) is a checksum of its content, and its content includes the ID of its [parent](term:parent-commit). Changing a commit in the middle of a history therefore means making new commits for everything after it, each with a new ID. That is what a rebase does, and it is a problem once other people have the old IDs.

`git replace` avoids that. It tells Git: **whenever someone asks for this object, hand over that other object instead.** Nothing is rewritten. Git keeps a note, and every command that reads the object follows the note.

The form you will use most is `git replace --graft <commit> <new-parent>`. It means: show this commit as if its parent were that other commit. ("Graft" is a gardening word: joining a branch onto another tree.)

Here is the situation Pro Git uses, in a small version. A shop's project was moved from an old server. To keep the new repository small, its history starts at a single commit, "Imported from the old server", which has no parent. The older commits are on a branch named `old-history`.

```console
$ git log --oneline main
cfafa61 Add contact page
f5a4511 Add delivery page
b613d64 Imported from the old server
$ git log --oneline old-history
40ebe1f Add prices
7c43ee0 Start the shop
```

:::graph
caption: "Before: two histories that do not touch. main starts at the import commit"
commits:
  - id: A
    message: Start the shop
  - id: B
    message: Add prices
    parents: [A]
  - id: P
    message: Imported from the old server
  - id: D
    message: Add delivery page
    parents: [P]
  - id: E
    message: Add contact page
    parents: [D]
branches:
  main: E
  old-history: B
head: main
:::

`git log main` stops at the import commit, and so do `git blame` and every other history command. To see one unbroken history, give "Add delivery page" (`HEAD~1`, one step before the newest commit) a new parent: the tip of `old-history`.

```console
$ git replace --graft HEAD~1 old-history
$ git log --oneline main
cfafa61 Add contact page
f5a4511 Add delivery page
40ebe1f Add prices
7c43ee0 Start the shop
```

:::graph
caption: "After git replace --graft: Add delivery page is shown with Add prices as its parent"
commits:
  - id: A
    message: Start the shop
  - id: B
    message: Add prices
    parents: [A]
  - id: P
    message: Imported from the old server
    faded: true
  - id: D
    message: Add delivery page
    parents: [B]
  - id: E
    message: Add contact page
    parents: [D]
branches:
  main: E
  old-history: B
head: main
:::

Read the two logs carefully, because both halves matter:

- **What changed:** the history is one line of four commits. The import commit is no longer in it, because nothing shown points at it any more.
- **What stayed the same:** every ID. "Add delivery page" is still `f5a4511` and "Add contact page" is still `cfafa61`. Branches, tags and teammates' clones that name those IDs keep working. A rebase could not have done that.

The common wrong idea is that `git replace` edits the commit. It does not: the original `f5a4511` is still stored, byte for byte. Git made a second commit with the new parent and shows that one whenever `f5a4511` is asked for.

You can always look past the replacement. The option `--no-replace-objects` goes right after `git` and makes one command ignore every replacement:

```console
$ git --no-replace-objects log --oneline
cfafa61 Add contact page
f5a4511 Add delivery page
b613d64 Imported from the old server
```

Three small commands manage replacements:

| You type | What it does |
|---|---|
| `git replace -l` | Lists the IDs that have a replacement (`git replace` alone does the same) |
| `git replace -d <commit>` | Deletes the replacement. The history looks as it did before |
| `git log --oneline --decorate` | Marks a replaced commit with the word `replaced` |

```console
$ git log --oneline --decorate main
cfafa61 (HEAD -> main) Add contact page
f5a4511 (replaced) Add delivery page
40ebe1f (old-history) Add prices
7c43ee0 Start the shop
$ git replace -d HEAD~1
Deleted replace ref 'f5a4511b936aa9fb27e3c17a7d66ffceee880408'
```

:::predict
question: "You make two empty commits, `Try first` and then `Try second`, and run `git replace --graft HEAD HEAD~2`. What does `git log --oneline` show for these two commits, and does the ID of `Try second` change?"
answer: "`Try second` is listed with its old ID, and `Try first` is missing. The graft says: show `Try second` (HEAD) with the commit two steps back as its parent, so the history skips `Try first`. The commit is still stored: `git --no-replace-objects log` shows it."
:::

:::try-it
1. Make two commits of your own to experiment on: `git commit --allow-empty -m "Try first"`, then `git commit --allow-empty -m "Try second"`. Two new stations appear on the history map, and `main` sits on `Try second`.
2. Run `git log --oneline -3` and note the ID of `Try second`.
3. Run `git replace --graft HEAD HEAD~2`. Git prints nothing. On the history map, `Try second` now connects straight to the commit that was there before your two, and `Try first` is no longer on the line.
4. Run `git log --oneline -3`. `Try second` has the same ID as in step 2, and `Try first` is not listed.
5. Run `git --no-replace-objects log --oneline -3`. `Try first` is back: this command ignored the replacement.
6. Run `git replace -d HEAD`. Git prints `Deleted replace ref` and the ID. On the history map, `Try first` returns between `Try second` and the older commit.
:::

"Start this challenge" rebuilds the practice project, so your trial commits do not get in the way of a challenge.

:::careful
A replacement lives in your repository only. `git push` and `git clone` do not carry it, so a teammate still sees the two separate histories until they get the replacement too (Advanced shows how). Do not delete the `old-history` branch because the log "looks joined": the join is a view, and the old commits are still needed.
:::

### When it goes wrong

```console
$ GIT_DIR=../nope.git git status
fatal: not a git repository: '../nope.git'
```

`GIT_DIR` points at a folder that is not a repository. Unlike the usual message, this one names a path in quotes, which tells you a variable or `--git-dir` is involved. Check the path. If you did not type `GIT_DIR` on this line, you exported it earlier: run `unset GIT_DIR`.

```console
$ GIT_AUTHOR_DATE="next blursday" git commit --allow-empty -m "Release"
fatal: invalid date format: next blursday
```

Git could not read the date, and no commit was made. Write it as `2026-01-15T12:00:00`.

```console
$ git replace --graft HEAD~1 old-history
error: replace ref 'refs/replace/f5a4511b936aa9fb27e3c17a7d66ffceee880408' already exists
```

This commit already has a replacement, and Git will not overwrite it without being asked. Delete the old one first with `git replace -d HEAD~1`, or add `-f` (force) to overwrite it: `git replace -f --graft HEAD~1 old-history`.

## Under the hood

"Must know" showed what the switches do. This layer shows where Git reads them, and where a replacement is kept.

### How a variable reaches Git

When your shell starts a program, it hands the program a copy of all its variables. Git reads the ones it cares about as it starts. When Git starts a sub-program of its own (an editor, `ssh`, a script), that program gets the copy too. So one variable in front of one command reaches every part of the work, and is gone when the command ends.

Git's sub-programs sit in one folder, and `GIT_EXEC_PATH` names it:

```console
$ git --exec-path
C:/Program Files/Git/mingw64/libexec/git-core
```

### Who wins: variable, option or setting

For the author and committer, Pro Git explains that the commit object is created in the end by the [plumbing](term:plumbing) command `git commit-tree`, and that this command looks at the `GIT_AUTHOR_…` and `GIT_COMMITTER_…` variables first. Only when they are missing does it fall back to your settings. That is why the variable won in this test:

```console
$ GIT_AUTHOR_NAME="Env Name" git -c user.name="Flag Name" commit -q --allow-empty -m "who"
$ git log -1 --format="%an / %cn"
Env Name / Flag Name
```

The author (`%an`) came from the variable. The committer (`%cn`) had no variable, so it came from `-c`, which in turn beats the settings files.

For the editor and the pager the order is: the `GIT_` variable, then the setting (`core.editor`, `core.pager`), then the general variables that other programs share (`EDITOR`, `PAGER`).

Inside the commit object the result is two plain lines, the same ones you read in [A first look inside .git](lesson:first-look-inside):

```console
$ git cat-file -p HEAD
tree edc5327419125af4879e105dd3da4a38426908e7
parent cdf74c4577e4f984252c560ff21975b0d2fb51d0
author Release Bot <student@example.com> 1768467600 +0300
committer Practice Student <student@example.com> 1795731102 +0300

Add todo list
```

### The staging area is one file

`GIT_INDEX_FILE` makes this visible. Point Git at an index file that does not exist yet, and it sees an empty staging area:

```console
$ GIT_INDEX_FILE=.git/scratch-index git status --short
D  README.md
D  menu.txt
D  todo.txt
?? README.md
?? menu.txt
?? todo.txt
```

Compared with the last commit, an empty staging area looks like "every file staged for deletion", and the files in the folder look untracked. Nothing was harmed: your real `.git/index` was never read or written.

### A replacement is a ref

`git replace` stores its note as a [ref](term:ref): a small file under `.git/refs/replace`. A ref that says "show that object in place of this one" is called a [replacement ref](term:replacement-ref). The file's **name** is the full ID of the original object. Its **content** is the ID of the object to show.

```console
$ git for-each-ref
cfafa61da39d91274852e44159cf8428919d101c commit	refs/heads/main
40ebe1f3eb0739ae41dcb66d35a7d7c4d5acc2dc commit	refs/heads/old-history
88289f05346955522a936289fb6335296e0ced02 commit	refs/replace/f5a4511b936aa9fb27e3c17a7d66ffceee880408
$ git replace -l --format=long
f5a4511b936aa9fb27e3c17a7d66ffceee880408 (commit) -> 88289f05346955522a936289fb6335296e0ced02 (commit)
```

`git for-each-ref` lists every ref in the repository. The last line is the replacement: asked for `f5a4511…`, Git reads `88289f0…`.

So `git replace --graft` did two things:

1. It wrote a new commit object, `88289f0`: a copy of "Add delivery page" with the same tree, author, dates and message, and a different `parent` line.
2. It wrote the ref `refs/replace/f5a4511…` pointing at that copy.

Print the commit both ways and only the `parent` line differs:

```console
$ git cat-file -p HEAD~1
tree 83c811261e1e3c5aaa338387517982e2a176ef59
parent 40ebe1f3eb0739ae41dcb66d35a7d7c4d5acc2dc
author Practice Student <student@example.com> 1795731222 +0300
committer Practice Student <student@example.com> 1795731222 +0300

Add delivery page
$ git --no-replace-objects cat-file -p HEAD~1
tree 83c811261e1e3c5aaa338387517982e2a176ef59
parent b613d64b99ff73ccd8a9a8f4ae090f2975acfb95
author Practice Student <student@example.com> 1795731222 +0300
committer Practice Student <student@example.com> 1795731222 +0300

Add delivery page
```

This also explains why no later ID changed. "Add contact page" stores the parent ID `f5a4511…`, and that is still what it stores. Git swaps the object only at the moment it reads it.

### Which commands follow a replacement

The Git reference says replacement refs are used by all commands except the ones that walk the stored objects to decide what exists and what to send: cleaning up unused objects, checking the repository for damage, and the transfer of commits in a fetch or push. Those always work on the real objects. That is why a push sends your real history, and why a teammate who also wants the joined view needs the replacement ref itself.

### The book's version: split a history, then join it

Pro Git 7.13 tells the whole story, and it has two halves.

**Splitting.** A project with five commits is cut in two. A branch `history` is put on the fourth commit and pushed to a separate "project-history" repository. Then the recent history is made short: `git commit-tree` (plumbing) creates a base commit with no parent and a message that says where the old history lives, and `git rebase --onto` moves commits four and five on top of it. New developers clone the short repository: three commits.

**Joining.** Someone who wants everything fetches the history repository as a second remote. They now have two "fourth" commits with the same files: the rebased one in the short history and the original at the tip of the old one. One command joins them:

```console
$ git replace 81a708d c6e1e95
```

This is the plain form, `git replace <object> <replacement>`: whenever `81a708d` is asked for, use `c6e1e95`. The log then runs from the fifth commit down to the first, and it still prints the ID `81a708d` beside data that really comes from `c6e1e95`.

The same plain form on the shop example replaces the import commit with the tip of `old-history`, which holds the same files:

```console
$ git replace HEAD~2 old-history
$ git log --oneline main
cfafa61 Add contact page
f5a4511 Add delivery page
b613d64 Add prices
7c43ee0 Start the shop
```

Look at the third line: the ID of the import commit, with the message of "Add prices". The plain form swaps a whole object, so it only makes sense when both commits hold the same files. `--graft` changes nothing but the parents, which is why it is the safer tool for joining histories.

## Advanced

You can now steer one command and join two histories. These are the rarer tools around both.

### Edit an object in your editor: `git replace --edit`

`git replace --edit <object>` opens the object's raw text in your editor, the same text `git cat-file -p` prints. When you save and close, Git stores the result as a new object and replaces the original with it. Here the message of the newest commit was changed from "Add summer menu" to "Add the summer menu":

```console
$ git replace --edit HEAD
$ git log --oneline -1
b04bcde Add the summer menu
$ git replace -l --format=medium
b04bcde5e5ff493e9a6551932ed8b3a412c0fe33 -> e1c4e386d05f66742eab314335d6b0cf9b2ef0c1
```

The ID in the log is still `b04bcde`, with the new message beside it. Use it to fix an author line or a message in old history that you must not rewrite. If you close the editor without a change, Git refuses with `error: new object is the same as the old one`.

### More that `--graft` can do

| You type | Result |
|---|---|
| `git replace --graft <commit>` (no parent given) | The commit is shown with no parent: the history appears to start there. This is how you make a long history look short |
| `git replace --graft <commit> <parent1> <parent2>` | The commit is shown as a merge of two parents |

### Share a replacement, or make it permanent

Replacement refs stay local unless you name them. A [refspec](term:refspec) does it, as in the lesson [Refspecs](lesson:refspecs):

| You type | What it does |
|---|---|
| `git push origin 'refs/replace/*:refs/replace/*'` | Sends your replacement refs to the server |
| `git fetch origin 'refs/replace/*:refs/replace/*'` | Brings the server's replacement refs into your repository |

To turn a replacement into real history, rewrite the history with a tool from the lesson "Remove a leaked secret or huge file from history": the Git reference notes that `git filter-branch` makes replacements permanent. Every commit after the replaced one then gets a new ID, with all the cost of [rewriting history](term:rewriting-history).

### Turn replacements off

Setting the variable `GIT_NO_REPLACE_OBJECTS=1` does what `--no-replace-objects` does, for as long as the variable lasts. Use it in a script that must see the real objects.

### More environment variables

Pro Git 10.8 lists many more. These are the ones you may meet:

| Variable | What it does |
|---|---|
| `GIT_CEILING_DIRECTORIES` | Folders where Git stops its upward search for `.git`. Useful when a parent folder is on a slow network drive |
| `GIT_ALTERNATE_OBJECT_DIRECTORIES` | Extra folders to look in for objects, so several projects can share large files |
| `GIT_LITERAL_PATHSPECS` | Set to `1`, wildcard characters in paths match only themselves: `*.c` means a file really named `*.c` |
| `GIT_ICASE_PATHSPECS` | Set to `1`, paths on the command line match without regard to letter case |
| `GIT_DIFF_OPTS` | The number of context lines in a diff: `-u5` or `--unified=5` are the only valid values |
| `GIT_EXTERNAL_DIFF` | A program to run in place of Git's own diff |
| `GIT_MERGE_VERBOSITY` | How much a merge prints, from `0` (almost nothing) to `5` and above (debugging detail). The default is `2` |
| `GIT_SSL_NO_VERIFY` | Skips the check of the server's certificate |
| `GIT_HTTP_LOW_SPEED_LIMIT`, `GIT_HTTP_LOW_SPEED_TIME` | Give up on an HTTP transfer slower than this many bytes per second for this many seconds |
| `GIT_HTTP_USER_AGENT` | The name Git gives itself to web servers |
| `GIT_SSH` | A program to run in place of `ssh`. It cannot take extra options, which is why `GIT_SSH_COMMAND` is easier |
| `GIT_ASKPASS` | A program Git runs to ask for a password |
| `GIT_TRACE_SETUP` | Traces which repository, working tree and current folder Git settled on. The first thing to try when `GIT_DIR` confuses you |
| `GIT_TRACE_PACK_ACCESS` | Traces every read from a packfile (the lesson "Packfiles and garbage collection" explains packfiles) |
| `GIT_NAMESPACE` | Keeps several sets of refs apart inside one repository, on servers |
| `GIT_FLUSH` | Set to `1`, Git writes its output at once without collecting it first |

:::careful
`GIT_SSL_NO_VERIFY` removes the check that you are talking to the real server. Pro Git mentions it for a test server with a home-made certificate. Never set it for a server on the internet.
:::

`GIT_REFLOG_ACTION` sets the text that the [reflog](term:reflog) records for a command, so a script can label its own steps:

```console
$ GIT_REFLOG_ACTION="nightly script" git commit --allow-empty -m "Nightly check"
[main 373c033] Nightly check
$ git reflog -1
373c033 HEAD@{0}: nightly script: Nightly check
```

## Recap

- An environment variable in front of a command (`GIT_TRACE=1 git status`) changes that one command; `git -c key=value` does the same for one setting.
- `git -C <folder>` runs Git in another folder. `GIT_DIR` and `GIT_WORK_TREE` name the repository and the working tree when they are apart; give both.
- `GIT_AUTHOR_…` and `GIT_COMMITTER_…` set who and when for one commit, and win over every setting.
- `GIT_TRACE`, `GIT_TRACE_PERFORMANCE`, `GIT_TRACE_PACKET` and `GIT_CURL_VERBOSE` make Git report what it does.
- `git replace --graft <commit> <parent>` shows a commit with a different parent through a ref in `refs/replace`. No ID changes, and `git --no-replace-objects` shows the real history.
