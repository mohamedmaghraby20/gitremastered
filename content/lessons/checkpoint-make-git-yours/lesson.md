---
id: checkpoint-make-git-yours
title: "Checkpoint: Make Git yours"
module: make-git-yours
checkpoint: true
bookSection: "8 Customizing Git"
bookUrl: https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration
bookSources:
  - vendor/progit2/book/08-customizing-git/sections/config.asc
  - vendor/progit2/book/08-customizing-git/sections/attributes.asc
  - vendor/progit2/book/08-customizing-git/sections/hooks.asc
  - vendor/progit2/book/08-customizing-git/sections/policy.asc
  - vendor/progit2/book/07-git-tools/sections/signing.asc
  - vendor/progit2/book/02-git-basics/sections/aliases.asc
  - vendor/progit2/book/A-git-in-other-environments/sections/visualstudiocode.asc
readFirst: [config-pro, git-in-your-tools, hooks, attributes, signing]
---

You join a project and its README lists the setup steps: a hooks folder to switch on, an editor, a rule file for line endings, a signing key. Five lessons taught you each piece on its own. Here you prove you can set up a repository the way a real team asks for it, in three situations, with no hints.

## Must know

This page teaches nothing new. It is the module on one page: the commands and settings worth remembering, one table per lesson, and the lesson to go back to when a row looks unfamiliar. Read it once, then take the challenges below.

A checkpoint is optional. Its challenges mix the lessons, so each one needs rows from at least two of the tables.

Every challenge here changes the practice repository's own settings only. Use `git config --local` (or `git config` with no scope option, which writes to the same place), and never `--global`.

### Settings: where they come from, and your own commands

From [Configuration in depth](lesson:config-pro).

| Command | Job |
|---|---|
| `git config --list --show-scope --show-origin` | Every setting, with its [scope](term:config-scope) (system, global, local) and the file it comes from. A line further down wins |
| `git config --local --list` | Only this repository's own settings, from `.git/config` |
| `git config <key>` | Print the value Git uses for one setting |
| `git config <key> <value>` | Set it for this repository |
| `git config --unset <key>` | Remove it from this repository, so the next scope shows through again |
| `git config alias.<name> '<command>'` | Make an [alias](term:alias), your own short command: `alias.st status` makes `git st` |
| `git config alias.<name> '!<shell command>'` | An alias that runs a shell command instead of a Git command |
| `git config include.path ../team.gitconfig` | Read another settings file in place; the path counts from the file that holds the line |

Settings from that lesson worth recognising: `core.editor`, `help.autocorrect`, `color.ui`, `pull.rebase`, `core.autocrlf`.

### Git in your editor and terminal

From [Git in VS Code, terminals and GUIs](lesson:git-in-your-tools).

| Command | Job |
|---|---|
| `gitk --all` | Draw the history of every branch in a window |
| `git gui` | Build a commit in a window |
| `git config core.editor "code --wait"` | Make VS Code the editor for commit messages. `--wait` keeps Git waiting until you close the tab |
| `git config diff.tool vscode` | Choose the [diff tool](term:diff-tool) that `git difftool` opens |
| `git config merge.tool vscode` | Choose the tool that `git mergetool` opens for a conflict |
| `git difftool` | Like `git diff`, but each changed file opens in the chosen tool |
| `git mergetool` | During a conflicted merge, open each conflicted file in the chosen tool |

A button in a graphical tool runs a command you know: `+` in VS Code is `git add`, the Commit button is `git commit`, and the sync arrows are `git pull` followed by `git push`.

### Hooks: checks that run by themselves

From [Hooks and enforced policies](lesson:hooks).

| Command or file | Job |
|---|---|
| `.git/hooks/pre-commit` | A [hook](term:hook) that runs before every commit. It checks the staged files; any [exit code](term:exit-code) other than 0 stops the commit |
| `.git/hooks/commit-msg` | Runs after you wrote the message. `"$1"` is the file that holds the message |
| `#!/bin/sh` | The first line of every hook: it names the program that reads the rest of the file |
| `chmod +x <hook>` | Make the hook runnable (needed on macOS and Linux) |
| `git grep --cached -q "DEBUG" -- "*.js"` | Search the staged versions of the `.js` files; a common test inside `pre-commit` |
| `git config --local core.hooksPath .githooks` | Make Git look for hooks in the tracked folder `.githooks` instead of `.git/hooks` |
| `git add --chmod=+x .githooks/pre-commit` | Stage a hook and record it as runnable, on every system |
| `git commit --no-verify` | Skip the client hooks once |

Hooks and settings are not cloned. A team shares hooks in a tracked folder, and each person runs the `core.hooksPath` line once.

### Attributes: rules per file

From [Attributes: binary files, line endings, merge drivers](lesson:attributes).

| Command or rule | Job |
|---|---|
| `.gitattributes` | A committed file with one rule per line: a pattern, then its attributes. See [.gitattributes](term:gitattributes) |
| `* text=auto` | Store every text file with LF [line endings](term:line-ending) in the repository |
| `*.sh text eol=lf` | These files have LF in the working tree too, on every system |
| `*.bat text eol=crlf` | These files have CRLF in the working tree, on every system |
| `*.png binary` | No line-ending conversion, no line diff, no content merge |
| `git check-attr -a <file>` | Show which attributes apply to a file |
| `git ls-files --eol` | Show each file's line endings: `i/` in the index, `w/` in the working tree |
| `git add --renormalize .` | Stage every tracked file again under the current rules. Needed for files committed before the rule existed |
| `build-info.txt merge=ours`, with `git config merge.ours.driver true` | Keep your branch's version of a file on every merge: the rule names a [merge driver](term:merge-driver), the setting defines it |

### Signing: proof of who made a commit

From [Sign commits and tags (GPG and SSH)](lesson:signing).

| Command | Job |
|---|---|
| `git config gpg.format ssh` | Sign with an SSH key. Without it Git assumes GPG |
| `git config user.signingkey <file>.pub` | Name your key: the public key file |
| `git config gpg.ssh.allowedSignersFile <file>` | The list of emails and public keys Git trusts when it checks a [signature](term:signature): the [allowed signers file](term:allowed-signers-file) |
| `git commit -S -m "…"` | Make a signed commit |
| `git config commit.gpgSign true` | Sign every new commit in this repository; `tag.gpgSign` does the same for tags |
| `git commit --amend --no-edit -S` | Replace the newest commit with a signed one. It gets a new ID |
| `git tag -s v1.0 -m "…"` | Make a signed tag |
| `git log --show-signature` | Show each commit with the result of checking its signature |
| `git log --format="%h %G? %s"` | One letter per commit: `G` good, `N` none, `U` valid but from a key you have no entry for, `B` bad |
| `git verify-commit <commit>`, `git tag -v <tag>` | Check one commit, or one tag |

:::careful
Two traps from this module cost the most time, because neither prints an error. A hook is silently not run when its name is wrong or when `core.hooksPath` points at another folder. And a new line in `.gitattributes` changes nothing in files that are already committed, until you run `git add --renormalize .` and commit.
:::

### How to read the picture in these challenges

Most of this module lives in settings, and the picture does not draw settings. The checklist of goals does the watching here: each goal about a setting ticks itself the moment `git config` writes the value. The picture still shows the files (a new `.gitattributes` sheet, a renormalized file moving into the staging area) and the history (a new station for each commit, a tag label on a release).

## Under the hood

These are the ideas behind the tables. If one of them surprises you, the lesson named beside it explains it with a worked example.

### A setting is a line in a file, and the last one read wins

Git reads the system file, then your global file, then the repository's `.git/config`. The same key may appear in all three; the value read last is the one Git uses. That is why a local value beats a global one, and why `--unset` in one scope lets the next one show through. An alias is such a line too: Git swaps the alias for its text and runs the result. ([Configuration in depth](lesson:config-pro))

### A graphical tool starts Git and reads its answer

VS Code, `gitk` and every other tool work on the same `.git` folder as your terminal. Nothing they do is hidden from the command line, and a file staged in one is staged in the other. ([Git in VS Code, terminals and GUIs](lesson:git-in-your-tools))

### A hook is a file with the right name, and its exit code decides

Git looks in one hooks folder for a file named after the moment, such as `pre-commit`. It runs the file and reads the exit code: `0` lets the command go on, anything else stops it. Client-side hooks belong to each copy of the project and can be skipped with `--no-verify`, so they are helpers, not security. A rule that must hold belongs on the server. ([Hooks and enforced policies](lesson:hooks))

### Line endings are converted at two doors

With a `text` rule, Git converts CRLF to LF when a file enters the staging area (`git add`), and writes the ending the rules ask for when a file is checked out into the working tree. A file that passes through neither door is not touched, which is why committed files need `--renormalize`. A driver (merge, diff or filter) always needs two pieces: the rule in `.gitattributes`, which the team shares, and a `git config` setting on each computer. ([Attributes](lesson:attributes))

### A signature is part of the commit

The author name and email of a commit are free text; anyone can type yours. A signature is made with your private key and stored inside the commit, and it covers the content, the message and the parent. Change any of them and the signature no longer matches. Signing a commit that already exists therefore means replacing it, and the new commit has a new ID. ([Sign commits and tags](lesson:signing))

## Advanced

The skills of this module are setup work: you do them once per project, and then they act in the background. This is where they come back in the course.

### In a team

[Commit messages and atomic commits](lesson:commit-craft) sets the rules for a good message and shows the `commit.template` setting, which reminds people of them. A `commit-msg` hook checks the same rules.

### In hard merges

[Hard conflicts, merge strategies and rerere](lesson:advanced-merging) teaches `rerere.enabled`, one of the settings from the configuration lesson, and merge strategies for a whole merge. The `merge=ours` rule from the Attributes lesson is the same idea for one file.

### In large projects

[Large repositories](lesson:large-repos) uses `.gitattributes` again. Git LFS, the tool that keeps big files out of the repository, is switched on by a rule such as `*.png filter=lfs diff=lfs merge=lfs -text`.

### On GitHub

The lessons about GitHub pick up two threads. Your signing key, once added to your account as a signing key, gives your commits the "Verified" badge. And the rules that a client hook cannot enforce exist there as rules on the server: branch protection, and automated checks on every pull request.

## Recap

- `git config --list --show-scope --show-origin` tells you where a setting comes from; `git config <key> <value>` and `git config --unset <key>` change this repository only.
- `git config alias.<name> '<command>'` makes a short command; `git config core.editor "code --wait"` picks the editor.
- `git config --local core.hooksPath .githooks` switches on a team's shared hooks; `git add --chmod=+x` stages a hook as runnable.
- `* text=auto` in a committed `.gitattributes`, then `git add --renormalize .` and a commit, cleans up line endings for the whole team.
- `git commit -S` and `git tag -s` sign once, `commit.gpgSign true` signs always, and `git log --format="%h %G? %s"` checks.
