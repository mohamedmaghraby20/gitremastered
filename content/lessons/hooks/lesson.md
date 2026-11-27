---
id: hooks
title: "Hooks and enforced policies"
module: make-git-yours
bookSection: "8.3 Git Hooks"
bookUrl: https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks
bookSources:
  - vendor/progit2/book/08-customizing-git/sections/hooks.asc
  - vendor/progit2/book/08-customizing-git/sections/policy.asc
readFirst: [three-areas]
---

A leftover debug line reaches the shared project again, and the history fills with messages like "fix". Everyone agreed on the rules; people simply forget. A hook makes Git check the rule for you at the moment you commit, and this lesson shows how to write one, share it with a team, and where its limits are.

## Must know

You already run `git commit` many times a day. Git can run a small program of yours at set moments of that work, such as right before a [commit](term:commit) is made. That program is a hook.

:::definitions
- term: Hook
  text: "A script Git runs by itself at a set moment, such as just before a commit or just before a push. The file's name says which moment: a file named `pre-commit` runs before every commit."
- term: Script
  text: "A text file of commands that the computer runs from top to bottom, as if you typed them one by one. The hooks in this lesson are shell scripts: the same commands you type in the terminal."
- term: Exit code
  text: "A number every program hands back when it ends. `0` means \"all went well\"; any other number means \"something is wrong\". A script sets it with `exit 0` or `exit 1`. Also called the exit status."
:::

Think of the gate at an airport. You walk up with your bag (the commit), the scanner looks inside (the hook), and it either lets you through or stops you and says why. The scanner works the same way for every passenger, on good days and tired days.

### Where hooks live

Before writing a hook, look at where Git keeps them. Every repository has a `hooks` folder inside its `.git` folder, which you saw in [A first look inside](lesson:first-look-inside).

```console
$ ls .git/hooks
applypatch-msg.sample
commit-msg.sample
fsmonitor-watchman.sample
post-update.sample
pre-applypatch.sample
pre-commit.sample
pre-merge-commit.sample
pre-push.sample
pre-rebase.sample
pre-receive.sample
prepare-commit-msg.sample
push-to-checkout.sample
sendemail-validate.sample
update.sample
```

`git init` put these example scripts there. None of them runs: Git only runs a file whose name is exactly a hook's name, and `pre-commit.sample` is not `pre-commit`. The samples are worth reading, because each one explains its hook at the top:

```console
$ head -8 .git/hooks/pre-commit.sample
#!/bin/sh
#
# An example hook script to verify what is about to be committed.
# Called by "git commit" with no arguments.  The hook should
# exit with non-zero status after issuing an appropriate message if
# it wants to stop the commit.
#
# To enable this hook, rename this file to "pre-commit".
```

A hook is switched on when three things are true:

| Rule | Example | Why |
|---|---|---|
| The file is in the hooks folder | `.git/hooks/pre-commit` | Git looks nowhere else (you will change the folder later in this lesson) |
| The name is exact, with no ending | `pre-commit`, not `pre-commit.sh` or `pre-commit.sample` | The name is how Git knows when to run it |
| The file may be run as a program | `chmod +x .git/hooks/pre-commit` | macOS and Linux refuse to run a file without this permission |

`chmod +x` means "change mode: add the e**x**ecute permission". On macOS and Linux every file carries a mark that says whether it may be run as a program, and a new text file does not have it. Windows has no such mark, so there the command changes nothing. Type it anyway: it does no harm, and the habit saves you on the day you work on a Mac or a server.

### Your first hook

The folder and the three rules are all you need. Start with a hook that cannot break anything: `post-commit`, which runs right after each commit is made.

The terminal on the right opens in a small shop project. Practise on a file of your own, `todo.txt`, so the project's files stay as they are for the challenges at the end.

:::try-it
1. Write the hook: `printf '%s\n' '#!/bin/sh' 'echo "Commit recorded. Well done."' > .git/hooks/post-commit`. The `printf` command writes each quoted text on its own line, so the new file has two lines. Nothing moves in the picture: files inside `.git` are not part of your working tree.
2. Run `chmod +x .git/hooks/post-commit`. It prints nothing. The hook is now switched on.
3. Create and stage a file: `echo "Buy milk" > todo.txt`, then `git add todo.txt`. In the picture, a `todo.txt` sheet appears in the working tree and slides into the staging area.
4. Run `git commit -m "Add todo list"`. The first line of the output is new: "Commit recorded. Well done." Your script ran. In the picture, a new station appears on the history map as usual.
:::

```console
$ git commit -m "Add todo list"
Commit recorded. Well done.
[main 42d2ba5] Add todo list
 1 file changed, 1 insertion(+)
 create mode 100644 todo.txt
```

The hook file has two lines:

```console
$ cat .git/hooks/post-commit
#!/bin/sh
echo "Commit recorded. Well done."
```

- `#!/bin/sh` is called the **shebang** line (from "hash" `#` and "bang" `!`). It names the program that reads the rest of the file. `sh` is the shell, the program that also reads what you type in the terminal. Every hook in this lesson starts with this line.
- `echo "…"` prints a text. Whatever a hook prints appears in your terminal, in the middle of Git's own output.

Any language works as long as the first line names it; a hook can start with `#!/usr/bin/env python3` and continue in Python. Pro Git writes its examples in Ruby. This lesson stays with the shell, because every computer with Git has it.

### The exit code decides

That hook only talked. The useful ones can say no, and they say it with the exit code.

Git runs a hook, waits for it to end, and reads the number it hands back:

- **`0`**: all is well, and Git carries on.
- **Anything else**: Git stops the command. No commit is made.

Here is the smallest hook that says no. It runs before the commit (`pre-commit`) and always ends with `exit 1`:

```console
$ cat .git/hooks/pre-commit
#!/bin/sh
echo "pre-commit: no commits today."
exit 1
```

:::predict
question: "With this hook switched on, you stage a new line in todo.txt and run git commit. Is the commit made? What happens to the staged change?"
answer: "No commit is made: the hook ended with 1, so Git stopped. The staged change is not lost. It still sits in the staging area, exactly as before the command."
:::

:::try-it
1. Write the hook: `printf '%s\n' '#!/bin/sh' 'echo "pre-commit: no commits today."' 'exit 1' > .git/hooks/pre-commit`, then `chmod +x .git/hooks/pre-commit`.
2. Add a line and stage it: `echo "Buy eggs" >> todo.txt`, then `git add todo.txt`. In the picture, the `todo.txt` sheet sits in the staging area.
3. Run `git commit -m "Add eggs"`. Git prints only the hook's text, "pre-commit: no commits today.", and no line with a commit ID. In the picture, nothing moves: no new station appears.
4. Run `git status -s`. It prints `M  todo.txt`: the change to `todo.txt` is still staged. A hook that says no throws nothing away.
:::

```console
$ git commit -m "Add eggs"
pre-commit: no commits today.
$ git status -s
M  todo.txt
```

Only hooks that run **before** something can stop it. Git ignores the exit code of `post-commit`: the commit already exists by then.

:::careful
When a hook refuses, say why. A hook that ends with `exit 1` and prints nothing leaves you with a commit command that silently does nothing. Start the text with the hook's name, like `pre-commit: …`, so the reader knows who is talking.
:::

### A hook that checks your files

A hook that always refuses is no use. A real `pre-commit` hook looks at what you are about to commit and refuses only when it finds a problem.

The job here: refuse a commit while a note still says `FIXME`. The hook needs a command that searches for a word and reports through its exit code whether it found one. `git grep` does that:

| Part | What it does |
|---|---|
| `git grep "FIXME"` | Searches the tracked files for the text FIXME. Exit code 0 when it finds some |
| `--cached` | Searches the versions in the [staging area](term:staging-area) instead of the files on disk |
| `-q` | Quiet: prints nothing, only sets the exit code |
| `-n` | Prints each match with its line number |
| `-- "*.txt"` | Searches only files whose name ends in `.txt` |

The shell's `if` runs a command and looks at its exit code, so the whole hook reads almost like a sentence: if the search finds FIXME, then explain and refuse.

```console
$ cat .git/hooks/pre-commit
#!/bin/sh
if git grep --cached -q "FIXME" -- "*.txt"
then
  echo "pre-commit: finish the FIXME notes first:"
  git grep --cached -n "FIXME" -- "*.txt"
  exit 1
fi
```

When the search finds nothing, the script reaches its end without an `exit`, and a script that ends normally hands back 0. The commit goes through.

:::try-it
1. Replace the hook. Copy this as one line: `printf '%s\n' '#!/bin/sh' 'if git grep --cached -q "FIXME" -- "*.txt"' 'then' '  echo "pre-commit: finish the FIXME notes first:"' '  git grep --cached -n "FIXME" -- "*.txt"' '  exit 1' 'fi' > .git/hooks/pre-commit`. (Or write the same seven lines in an editor: `nano .git/hooks/pre-commit`.)
2. Run `git commit -m "Add eggs"`. The eggs line from before has no FIXME, so the commit is made. In the picture, a new station appears.
3. Add an unfinished note and stage it: `echo "FIXME how much bread?" >> todo.txt`, then `git add todo.txt`.
4. Run `git commit -m "Add bread"`. The hook refuses and names the file and line: `todo.txt:3:FIXME how much bread?`. In the picture, no station appears and `todo.txt` stays in the staging area.
5. Fix the file without staging it: `printf '%s\n' "Buy milk" "Buy eggs" "Buy two loaves of bread" > todo.txt`. Run `git commit -m "Decide on the bread"`. The hook refuses again, with the same FIXME line. The picture shows why: the staging area still holds the old `todo.txt` sheet.
6. Run `git add todo.txt`, then `git commit -m "Decide on the bread"`. Now the commit is made, and a new station appears in the picture.
:::

```console
$ git commit -m "Add bread"
pre-commit: finish the FIXME notes first:
todo.txt:3:FIXME how much bread?
```

Step 5 is the idea from [the three areas](lesson:three-areas) again. A commit records the staging area, so the hook must check the staging area. That is the job of `--cached`. A hook that reads the files on disk checks the wrong copy: it would let a staged FIXME through when the file on disk is already fixed, and block a clean commit because of an edit you have not staged.

:::careful
A hook that searches for a word contains that word. If the hook file itself is tracked (you will track one soon), a search through every file finds the hook and blocks every commit. Limit the search to the files you mean, as `-- "*.txt"` does here.
:::

### Check the message with `commit-msg`

`pre-commit` runs before you write the message, so it cannot read it. A second hook runs after you wrote it: `commit-msg`.

`commit-msg` gets the commit message to judge. Git writes your message into a temporary file and gives the hook that file's path. Inside a shell script, `$1` means "the first thing I was given", so `"$1"` is the message file.

This hook refuses a message whose first line is shorter than 10 characters:

```console
$ cat .git/hooks/commit-msg
#!/bin/sh
subject=$(head -n 1 "$1")
if [ ${#subject} -lt 10 ]
then
  echo "commit-msg: \"$subject\" is too short. Say what the commit does."
  exit 1
fi
```

Line by line:

- `subject=$(head -n 1 "$1")` reads the first line of the message file and keeps it under the name `subject`.
- `${#subject}` is the number of characters in it, and `-lt 10` means "less than 10".
- When the test is true, the hook explains and ends with `exit 1`.

```console
$ git commit -am "fix"
commit-msg: "fix" is too short. Say what the commit does.
$ git commit -am "Add tea to the todo list"
[main d745114] Add tea to the todo list
 1 file changed, 1 insertion(+)
```

Teams use this hook for their message rules: a length limit, a type word in front, or a **ticket number**: the number of the task in the team's tracking tool that the commit belongs to, like `[SHOP-12]`. The Commit messages and atomic commits lesson explains such rules; a `commit-msg` hook checks them.

### The hooks worth knowing

You have now used three hooks. Git has more than twenty; these seven are the ones you meet in real projects. They are called **client-side hooks**, because they run on your own computer.

| Hook | Runs | Can stop it? | Typical job |
|---|---|---|---|
| `pre-commit` | Before a commit, before the message is written | Yes | Check the staged files: leftover debug lines, style, quick tests |
| `prepare-commit-msg` | After Git prepared the default message, before the editor opens | Yes | Put text into the message for you, like a task number taken from the branch name |
| `commit-msg` | After you wrote the message | Yes | Check the message against the team's rules |
| `post-commit` | After the commit is made | No | Tell you or another tool that a commit happened |
| `pre-push` | During `git push`, before anything is sent | Yes | Run the tests one last time; refuse a push to the wrong branch |
| `post-checkout` | After `git switch` or `git checkout` changed your files | No | Set up the working tree, for example install packages when the list changed |
| `post-merge` | After a merge that worked, which includes most `git pull` runs | No | The same kind of setup after new work came in |

Which should you pick? Use `pre-commit` and `commit-msg` for checks, and keep them fast. A hook runs every single time, and a ten-second wait on every commit teaches people to skip it. Slow checks, like a full test run, fit `pre-push` better: you push far less often than you commit.

### `--no-verify`: every hook can be skipped

A hook sometimes blocks a commit you have a good reason to make, such as a half-done change you want to record before going home. Git has a switch for that.

`git commit --no-verify` (short: `-n`) makes the commit without running `pre-commit` and `commit-msg`.

:::try-it
1. Add an unfinished note again and stage it: `echo "FIXME which tea?" >> todo.txt`, then `git add todo.txt`.
2. Run `git commit -m "Add tea"`. The `pre-commit` hook refuses, as before. No station appears in the picture.
3. Run `git commit --no-verify -m "Add tea"`. The commit is made, FIXME and all: Git prints the "Commit recorded. Well done." line of your `post-commit` hook and the commit ID. In the picture, a new station appears.
:::

`git push --no-verify` skips `pre-push` in the same way.

That switch leads to the most important fact about hooks, and the common wrong idea to drop: **a client-side hook is a helper, not a lock.** It runs on each person's own computer, so each person can skip it with `--no-verify`, delete it, or never switch it on. It catches honest mistakes early, and it does that well. It cannot stop someone who wants to get around it.

### Rules nobody can skip: the server

So where does a rule go when it really must hold? In the one place every commit has to pass and no single developer controls: the server the team pushes to.

**Server-side hooks** are scripts in the hooks folder of the repository on the server. They run when a [push](term:push) arrives, and the person pushing cannot switch them off.

| Hook | Runs | What it can do |
|---|---|---|
| `pre-receive` | Once, when a push arrives, before anything is accepted | Refuse the whole push |
| `update` | Once for each branch in the push | Refuse that branch alone; the other branches still go through |
| `post-receive` | After the push was accepted | Nothing to refuse any more: it notifies people, or starts the tests or a deployment (putting the new version online) |

When a server hook refuses, the text it prints appears in the pusher's terminal, on lines that start with `remote:`. The Advanced layer shows a real one.

Pro Git's advice is to use both sides together. The server hook enforces the rule. The client hook tells you about the problem at commit time, when fixing it costs ten seconds, and not at push time, when the bad commits are already made.

:::sidenote
You can only install server-side hooks on a server you run yourself. Hosting sites such as GitHub.com do not let you upload hook scripts. They offer their own tools for the same job: branch protection rules, and automatic checks that must pass before a change is merged. The GitHub lessons later in the course cover them.
:::

### Share hooks with your team

One problem is left. Your hook lives in `.git/hooks`, and nothing inside `.git/hooks` travels with the project.

When a teammate makes a [clone](term:clone), they get the commits, and a fresh `.git/hooks` folder with only the samples. Git does this on purpose: if hooks arrived with a clone, cloning a stranger's project would run a stranger's program on your computer.

The usual answer has two parts:

1. **Keep the hooks in a normal, tracked folder** of the project. Most teams call it `.githooks`. It is committed and pushed like any other folder, so everyone gets the same scripts, and a change to a hook is reviewed like any other change.
2. **Tell Git to look there** with the setting `core.hooksPath`. Each person runs this once in their clone:

```console
$ git config --local core.hooksPath .githooks
$ git config --local core.hooksPath
.githooks
```

`core.hooksPath` is a [setting](term:config) that names the folder Git looks in for hooks. `--local` writes it for this repository only. Running the command with no value, as on the second line, prints the current value.

:::predict
question: "Your repository has hooks in .git/hooks. You set core.hooksPath to another folder that holds only a pre-commit hook. On the next commit, which hooks run?"
answer: "Only the pre-commit hook from the new folder. Git looks in one hooks folder, not two: once core.hooksPath is set, everything in .git/hooks is ignored."
:::

:::try-it
1. Make a folder with one hook: `mkdir team-hooks`, then `printf '%s\n' '#!/bin/sh' 'echo "Hello from team-hooks."' > team-hooks/pre-commit`, then `chmod +x team-hooks/pre-commit`. In the picture, the new file appears in the working tree: this folder is part of the project, unlike `.git/hooks`.
2. Run `git config --local core.hooksPath team-hooks`. It prints nothing.
3. Add a line: `echo "Buy coffee" >> todo.txt`, then run `git commit -am "Add coffee"`. Git prints "Hello from team-hooks." and makes the commit. Your FIXME check and your "Well done" line are both silent, although `todo.txt` still has a FIXME line: the hooks in `.git/hooks` no longer run. In the picture, a new station appears.
4. Go back: `git config --local --unset core.hooksPath`. Git looks in `.git/hooks` again.
:::

```console
$ git commit -am "Add coffee"
Hello from team-hooks.
[main cbf75b7] Add coffee
 1 file changed, 1 insertion(+)
```

Two things do not happen by themselves, and teams forget both:

- **The setting is not cloned either.** Settings belong to each copy, like hooks. Every teammate has to run the `git config` line once after cloning. Put it in the README's setup steps, or in the script that installs the project's packages.
- **Hooks are still skippable.** A shared folder makes hooks easy to get. It does not make them a lock.

:::careful
On Windows, `chmod +x` changes nothing, and Git records a new hook file as an ordinary, non-runnable file. Your teammates on macOS and Linux then receive a hook that Git ignores. Stage hook files with `git add --chmod=+x .githooks/pre-commit`: the option tells Git to record the file as runnable, on every system.
:::

:::compare
today: "`git config core.hooksPath .githooks` points Git at a tracked folder, so hooks are shared through the project itself."
book: "Pro Git has each developer copy the scripts into `.git/hooks` by hand and make them executable. That still works, but every change to a hook must be copied again."
:::

### Hooks on Windows

Shell scripts sound like a macOS and Linux matter. They work on Windows too, because Git for Windows brings its own shell: the one you know as Git Bash.

- Git runs hooks with that shell, whichever program you called Git from: Git Bash, PowerShell, or the buttons of an editor such as VS Code.
- The shebang line is what makes it work. Git for Windows reads `#!/bin/sh` and hands the file to its shell. Without that line the hook fails, as the next part shows.
- Inside a hook, write shell commands (`grep`, `echo`, `exit`), not PowerShell or `cmd` commands. The same file then runs on every teammate's system.

### When it goes wrong

Three problems almost everyone meets with a first hook:

```console
$ git commit -am "Add tea"
error: cannot spawn .git/hooks/pre-commit: No such file or directory
```

This is Git for Windows saying it could not start the hook, even though the file is there. The first line of the hook is missing or wrong, so Git cannot tell which program should read it. Make `#!/bin/sh` the very first line, with nothing before it.

**The hook does nothing at all, and Git prints no error.** Check the three rules, in this order:

1. The name. `pre-commit.sh`, `pre-commit.txt` and `precommit` are all ignored without a word.
2. The folder. If `core.hooksPath` is set, hooks in `.git/hooks` are ignored. `git rev-parse --git-path hooks` prints the folder Git really uses.
3. The permission, on macOS and Linux. Git prints a hint that the hook was ignored because it is not set as executable. Run `chmod +x` on the file.

```console
$ git commit -m "Add the pre-commit hook"
pre-commit: remove DEBUG lines before you commit:
.githooks/pre-commit:2:if git grep --cached -q "DEBUG"
.githooks/pre-commit:4:  echo "pre-commit: remove DEBUG lines before you commit:"
.githooks/pre-commit:5:  git grep --cached -n "DEBUG"
```

The hook found its own search word in its own file. Limit the search to your code files, for example `-- "*.js"`, as the `careful` block above explains.

## Under the hood

"Must know" showed what hooks do. This layer shows how Git runs one, which explains each of the rules you just followed.

### How Git runs a hook

At each hook moment, Git does the same four things:

1. It finds the hooks folder: `core.hooksPath` if that is set, otherwise `hooks` inside the `.git` folder.
2. It looks there for a file with the hook's exact name. No file, or a file that may not be run: Git moves on as if there were no hook.
3. It starts the file as a program, from the top folder of your working tree, and waits.
4. When the program ends, Git reads its exit code. For a hook that can stop the command, anything but 0 stops it.

You can ask Git which folder step 1 gives:

```console
$ git rev-parse --git-path hooks
.git/hooks
$ git config --local core.hooksPath team-hooks
$ git rev-parse --git-path hooks
team-hooks
```

Step 3 is why the hooks in this lesson can say `git grep … "*.txt"` or read a file by its plain name: they start in the same folder you work in.

### What each hook is given

A hook can only check what it can see. Git hands each hook different information, in one of two ways: as **arguments** (the values a script reads as `$1`, `$2`, `$3`) or on **standard input** (text the script reads line by line, as if someone typed it).

| Hook | Arguments | Standard input |
|---|---|---|
| `pre-commit` | None | None |
| `prepare-commit-msg` | `$1` the message file; `$2` where the message came from (`message`, `template`, `merge`, `squash` or `commit`); `$3` a commit ID, when amending | None |
| `commit-msg` | `$1` the message file | None |
| `post-commit` | None | None |
| `pre-push` | `$1` the remote's name; `$2` its address | One line per branch being pushed: the local name and commit ID, then the remote name and commit ID |
| `post-checkout` | `$1` the commit HEAD was on; `$2` the commit HEAD is on now; `$3` is `1` when you changed branch and `0` when you only restored files | None |
| `post-merge` | `$1` is `1` when the merge was a squash | None |
| `pre-receive`, `post-receive` | None | One line per branch: old commit ID, new commit ID, branch name |
| `update` | `$1` the branch name; `$2` the old commit ID; `$3` the new commit ID | None |

`pre-commit` is given nothing, because everything it needs is already in the staging area. That is why its checks use commands such as `git grep --cached` and `git diff --cached`.

### The order of a commit

One `git commit` runs up to four hooks. Give each a single `echo` line and Git shows you the order:

```console
$ git commit -m "Add todo list"
pre-commit is running
prepare-commit-msg is running
commit-msg is running
post-commit is running
[main 572160a] Add todo list
 1 file changed, 1 insertion(+)
 create mode 100644 todo.txt
```

Between `prepare-commit-msg` and `commit-msg`, Git opens the editor when you gave no `-m`. The same commit with `--no-verify` shows exactly which hooks that switch skips:

```console
$ git commit --no-verify -am "Add eggs"
prepare-commit-msg is running
post-commit is running
[main ac1a700] Add eggs
 1 file changed, 1 insertion(+)
```

Only the two checking hooks, `pre-commit` and `commit-msg`, are skipped. The two others still run.

### The executable mark in a commit

Git records very little about a file besides its content, but it does record whether the file may be run. You can see the mark in the staging area:

```console
$ git add .githooks/pre-commit
$ git ls-files --stage .githooks/pre-commit
100644 3a1c38bcd6635187d071b45637c1f89667c63449 0	.githooks/pre-commit
```

The first number is the file's mode: `100644` is an ordinary file, `100755` is a file that may be run. This `git add` ran on Windows, after a `chmod +x`, and the mode is still `100644`. Windows has no executable mark for Git to read, so Git for Windows sets `core.fileMode` to `false` and never changes the mode on its own.

`git add --chmod=+x` writes the mode straight into the staging area, without asking the file system:

```console
$ git add --chmod=+x .githooks/pre-commit
$ git ls-files --stage .githooks/pre-commit
100755 3a1c38bcd6635187d071b45637c1f89667c63449 0	.githooks/pre-commit
```

For a hook that is already committed with the wrong mode, `git update-index --chmod=+x .githooks/pre-commit` does the same; the next commit then reports `mode change 100644 => 100755`.

## Advanced

The first topic builds the server side of a policy, as Pro Git 8.4 does. The others are tools and hooks you will meet less often.

### A server-side policy

Pro Git's example policy says: every commit message must name its **ticket**, the numbered entry for a task in the team's tracking tool. The book writes the check in Ruby with the pattern `[ref: 1234]`. Here is the same idea as a shell script with the pattern `[SHOP-12]`, as an `update` hook in the server's repository:

```console
$ cat ../server.git/hooks/update
#!/bin/sh
refname="$1"
oldrev="$2"
newrev="$3"
for commit in $(git rev-list "$oldrev..$newrev")
do
  if ! git log -1 --format=%B "$commit" | grep -qE "\[SHOP-[0-9]+\]"
  then
    echo "[POLICY] Commit $commit has no ticket number like [SHOP-12]."
    exit 1
  fi
done
```

- `git rev-list "$oldrev..$newrev"` prints the ID of every commit the push adds to the branch. It is `git log` for scripts: IDs only.
- `git log -1 --format=%B "$commit"` prints the full message of one commit.
- `grep -qE "\[SHOP-[0-9]+\]"` searches that message with a **regular expression**, a small pattern language for text. `[0-9]+` means "one or more digits". The backslashes make `\[` and `\]` mean real square brackets. `!` in front turns the test around: "if the pattern is not found".

A push with a message that breaks the rule is refused, and the hook's text arrives on the `remote:` lines:

```console
$ git commit -q -m "Add opening hours"
$ git push
remote: [POLICY] Commit bd0342c7252bff96fd445dd226c79f687d9f9f66 has no ticket number like [SHOP-12].
remote: error: hook declined to update refs/heads/main
To ../server.git
 ! [remote rejected] main -> main (hook declined)
error: failed to push some refs to '../server.git'
```

After the message is fixed with `git commit --amend -m "Add opening hours [SHOP-12]"`, the same push goes through. No `--no-verify` on the pusher's side can skip this check.

Two limits of this short script: it fails on a brand-new branch, where Git passes an ID of all zeros as the old commit, and it does not check who is pushing. Pro Git's version goes further and allows each user to change only certain folders.

The matching client hook is a `commit-msg` hook with the same `grep` on `"$1"`. It tells developers at commit time what the server would refuse at push time, when fixing it means rewriting commits.

### Run a hook by hand

`git hook run` runs a hook without doing the action it belongs to. It is the quick way to test a hook you are writing:

```console
$ git hook run pre-commit
pre-commit: no commits today.
```

It uses the same folder and the same rules as a real commit. For a hook that takes arguments, add them after `--`: `git hook run commit-msg -- message.txt`.

### Hook frameworks

Writing and sharing hooks by hand works for a few short checks. Teams with many checks often use a **hook framework**: a tool that installs and runs hooks from a list kept in the project.

| Framework | Common in | How it works |
|---|---|---|
| pre-commit | Python projects, and many others | A file named `.pre-commit-config.yaml` lists ready-made checks; `pre-commit install` writes the hook into `.git/hooks` |
| Husky | JavaScript projects | Hooks are files in a `.husky` folder; installing the project's packages sets `core.hooksPath` for you |
| Lefthook | Projects in any language | One file, `lefthook.yml`, lists the commands for each hook |

They all rest on what this lesson taught: a named file in the hooks folder, and an exit code. They can all be skipped with `--no-verify` too.

### Hooks for all your repositories

`git config --global core.hooksPath ~/my-hooks` makes one folder of hooks run in every repository on your computer. People use it for personal checks, such as a scan for passwords.

:::careful
A global `core.hooksPath` replaces the hooks folder everywhere, so each project's own `.git/hooks` stops running, including the hooks a framework installed there. A repository's own `--local` value wins over the global one.
:::

### More hooks

| Hook | Runs | Use |
|---|---|---|
| `pre-rebase` | Before a rebase starts; can stop it | Refuse to rebase commits that were already pushed |
| `post-rewrite` | After commands that replace commits, like `git commit --amend` and `git rebase` | The same kind of follow-up as `post-checkout` and `post-merge` |
| `pre-merge-commit` | Before a merge commit is made; can stop it | The `pre-commit` checks, for merges |
| `pre-auto-gc` | Before Git's automatic clean-up of its storage | Postpone the clean-up when the moment is bad |
| `applypatch-msg`, `pre-applypatch`, `post-applypatch` | During `git am`, which applies changes sent by email | Check the message and the result of each emailed change |

Pro Git ends the section with a tip for anything others will read: in a script, write the long form of each option (`--quiet`, not `-q`). The hooks in this lesson use short options to stay small; in a team's hook, the long ones are kinder.

## Recap

- A hook is a script Git runs at a set moment. It needs the exact name (`pre-commit`, `commit-msg`), the hooks folder, a `#!/bin/sh` first line, and `chmod +x` on macOS and Linux.
- The exit code decides: `exit 0` lets Git go on, anything else stops a "pre" hook's command. Nothing staged is lost.
- `pre-commit` checks the staging area (`git grep --cached`); `commit-msg` checks the message file, `"$1"`.
- Hooks and settings are not cloned. Share hooks in a tracked `.githooks` folder, staged with `git add --chmod=+x`, and have everyone run `git config --local core.hooksPath .githooks`.
- `--no-verify` skips client hooks, so they are helpers, not security. A rule that must hold belongs on the server.
