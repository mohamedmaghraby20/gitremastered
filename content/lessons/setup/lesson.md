---
id: setup
title: "Install, configure and get help"
module: orientation
bookSection: "1.6 First-Time Git Setup"
bookUrl: https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup
bookSources:
  - vendor/progit2/book/01-introduction/sections/command-line.asc
  - vendor/progit2/book/01-introduction/sections/installing.asc
  - vendor/progit2/book/01-introduction/sections/first-time-setup.asc
  - vendor/progit2/book/01-introduction/sections/help.asc
readFirst: []
---

Your first commit on a new computer can stop with "Please tell me who you are", and your teammates can end up seeing your work under the name "unknown". Ten minutes of setup prevents both: this lesson gets Git installed, tells it who you are, and shows where to look when you forget a command.

## Must know

Git is a program you install once and then set up once. After that it works the same in every project on your computer. This part walks through that setup in the order you would do it on a new machine.

### Why this course uses the command line

You can use Git in two ways: by typing commands in a terminal (the command line), or by clicking in a graphical program (a GUI) such as the Git panel in VS Code.

This course teaches the command line, for the reasons Pro Git gives:

- The command line is the only place where **every** Git command works. Most GUIs offer a part of Git and leave the rest out.
- If you know the commands, you can work out any GUI, because its buttons run those same commands. The other way round is much harder.
- Every developer has the command line. GUIs differ from person to person, so help you find online is almost always written as commands.

The terminal on the right is a real one. What you type there runs real Git on your computer, inside a small practice project.

### Check that Git is installed

Before you set Git up, make sure it is there. `git --version` prints the version of Git on your computer.

```console
$ git --version
git version 2.55.0.windows.3
```

If the terminal on the right shows a prompt, Git is already installed: this app needs it to run. Your version number may differ. Any version from 2.28 on (released in 2020) works for this course.

On another computer, this is how you get Git:

| System | How to install | What you get |
|---|---|---|
| Windows | Download the installer from git-scm.com/download/win and keep the default choices | **Git for Windows**: Git itself, plus **Git Bash**, a terminal that understands the same commands as macOS and Linux |
| macOS | Run `git --version` in the Terminal app. If Git is missing, macOS offers to install it | Git, as part of Apple's command line tools |
| Linux | Use your package manager: `sudo apt install git` on Ubuntu and Debian, `sudo dnf install git` on Fedora | Git |

Pro Git advises updating now and then, even if Git is already installed. Git keeps old commands working, so an update almost never breaks anything.

### Tell Git who you are

Git is installed. The first thing it needs from you is your name and your email address.

A [commit](term:commit) is a save in Git: a snapshot of your project that Git keeps. Git writes the author's name and email into every commit, and they can never be changed afterwards without replacing the commit. That is how a team sees who made each change. So Git refuses to make a commit until it knows who you are.

`git config` reads and writes Git's settings. With `--global`, the setting applies to everything you do on this computer.

First check whether a name is already set:

```console
$ git config --global user.name
Ada Lovelace
```

- If this prints your name, your identity is set. Check the email the same way (`git config --global user.email`) and move on.
- If it prints nothing, set both now, with **your real name and the email you use for code**:

```console
$ git config --global user.name "Ada Lovelace"
$ git config --global user.email ada@example.com
```

This is the one place in this course where you change a real setting of your computer, on purpose. You do it once. Everything else in this lesson happens inside the practice project.

:::careful
Put the name in quotes. Without them, `git config --global user.name Ada Lovelace` stores only `Ada` and reports no error, because the shell hands Git two separate words. Quotes make "Ada Lovelace" one value.
:::

### Three levels of settings

You have set your name for the whole computer. Sometimes one project needs a different one: a work email for work projects, for example. Git handles this with three levels of [configuration](term:config).

:::definitions
- term: System
  text: "Settings for every user of this computer. Git's installer writes them. You rarely touch this level, and changing it needs administrator rights. Option: `--system`."
- term: Global
  text: "Settings for you, in every project on this computer. Your name, email and editor belong here. Option: `--global`."
- term: Local
  text: "Settings for one repository only. (A [repository](term:repository) is a project that Git tracks.) This is the level `git config` uses when you give no option, and it only works inside a repository."
:::

When the same setting exists at more than one level, **the closest level wins**: local beats global, and global beats system.

A small example. Ada's global name is "Ada Lovelace". In one project she sets a local name:

| Level | `user.name` | Used in this project? |
|---|---|---|
| Global | Ada Lovelace | No, a closer level has a value |
| Local (this project) | Ada at Work | **Yes** |

Commits in that one project carry "Ada at Work". Every other project still uses "Ada Lovelace", because the global value did not change. The common wrong idea is that a local setting replaces the global one. It only hides it, inside one repository.

:::predict
question: "The practice project gets a local `user.name`. Then you run `git config --global user.name`. Which name does it print: the local one or your own?"
answer: "Your own. `--global` asks one level only, and the local setting lives in a different file. Without `--global`, Git would answer with the winner: the local name."
:::

:::try-it
1. Run `git config user.name`. With no option, Git prints the value that wins in this project. It is your own name, or "Practice Student" if this computer had no name when the practice project was made.
2. Give this project its own name: `git config user.name "Ada at Work"`. Git prints nothing; no news is good news. The picture does not change either: settings are not files of your project, so nothing moves on the desk or the map.
3. Run `git config user.name` again. It now prints `Ada at Work`: the local level wins.
4. Run `git config --global user.name`. It still prints your own name. The global value was hidden in this project, not replaced.
:::

### See every setting and where it comes from

Two levels can now disagree, so you need a way to see what Git really uses.

`git config --list --show-origin` prints every setting Git can find, each with the file it comes from.

```console
$ git config --list --show-origin
file:C:/Program Files/Git/etc/gitconfig	core.autocrlf=true
file:C:/Program Files/Git/etc/gitconfig	init.defaultbranch=master
file:C:/Users/ada/.gitconfig	user.name=Ada Lovelace
file:C:/Users/ada/.gitconfig	user.email=ada@example.com
file:.git/config	core.autocrlf=false
file:.git/config	user.name=Ada at Work
```

(Shortened: the real list is longer, and your file paths differ.)

Read it from top to bottom: system first, then global, then local. Two things to notice:

- Each setting is written as `section.name=value`. `user.name` is the name `name` in the section `user`.
- `user.name` appears twice. **The last one listed wins**, which is the local one. That is the "closest level wins" rule, shown as a list.

To ask about one setting only, name it:

```console
$ git config user.name
Ada at Work
$ git config --show-origin user.name
file:.git/config	Ada at Work
```

The second form also tells you which file gave the answer. Use it when Git behaves in a way you did not expect and you want to know which level is responsible.

### Your editor and your default branch name

Your identity is the only setting Git insists on. Two more are worth setting on day one, because their defaults surprise people.

**The editor.** Sometimes Git needs you to type a longer text, such as a commit message, and opens a text editor for it. If you never chose one, Git Bash opens Vim, which is hard to leave if you have never used it. `core.editor` picks the editor:

```console
$ git config --global core.editor "code --wait"
```

This example picks VS Code. `--wait` tells VS Code to keep Git waiting until you close the file. The value has a space in it, so it needs quotes. Other common values are `nano` (a simple editor inside the terminal) and `notepad` on Windows. Only choose an editor that is installed on your computer.

**The default branch name.** A [branch](term:branch) is a named line of work; every new repository starts with one. Git's built-in name for it is `master`, while GitHub and most teams today use `main`. Since Git 2.28 you can choose the name for the repositories you create:

```console
$ git config --global init.defaultBranch main
```

This course's practice projects already use `main`, whatever you set here. The setting matters when you create your own repositories, in the lesson [Start or clone a repository](lesson:start-a-repo).

Both commands above change real settings of your computer, so run them only if you want them. In the practice project, try the local version:

:::try-it
1. Run `git config core.editor`. It prints the editor Git would use here, or nothing if you never chose one.
2. Set one for this project only: `git config core.editor nano`.
3. Run `git config --show-origin core.editor`. Git prints `file:.git/config` and then `nano`: the value comes from this project's own settings file, so no other project is affected.
:::

### Get help without leaving the terminal

You will not remember every option, and nobody does. Git carries its whole manual with it, so help works without an internet connection.

There are three ways to ask. `<verb>` stands for a command name such as `config`, `add` or `commit`.

| You type | You get | Use it when |
|---|---|---|
| `git <verb> -h` | A short list of options, printed in the terminal | You know the command and forgot an option. This is the one you will use most |
| `git help <verb>` | The full manual page | You want to understand a command properly |
| `git <verb> --help` | The same full manual page | Same as above; pick the form you remember |

The short form looks like this:

```console
$ git add -h
usage: git add [<options>] [--] <pathspec>...

    -n, --[no-]dry-run    dry run
    -v, --[no-]verbose    be verbose

    -i, --[no-]interactive
                          interactive picking
    -p, --[no-]patch      select hunks interactively
```

(Shortened: the real list has about twenty options.)

The first line shows the shape of the command. Square brackets mean "optional", and `<pathspec>` means "a file or folder name goes here". Below it, each option has a short form (`-n`), a long form (`--dry-run`) and a few words on what it does.

The full manual page opens in a different place on each system:

- **Windows:** in your web browser, from files that were installed with Git. No internet is needed.
- **macOS and Linux:** inside the terminal. Scroll with the arrow keys or the space bar, and press `q` to quit.

:::try-it
1. Run `git config -h`. The terminal prints a short summary of what `git config` can do.
2. Run `git help config`. The full manual page for `git config` opens (in your browser on Windows). Find the heading "DESCRIPTION", then close the page, or press `q` in the terminal.
:::

### When it goes wrong

Three things that go wrong during setup, and what to do about each.

```console
$ git commit -m "Add README"
Author identity unknown

*** Please tell me who you are.

Run

  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"

to set your account's default identity.
Omit --global to set the identity only in this repository.

fatal: unable to auto-detect email address (got 'ada@laptop.(none)')
```

Git found no name or email at any level, so it refuses to make the commit. Nothing is lost. Run the two commands it prints, with your own name and email, and commit again.

```console
$ git config user.name Ada Lovelace
$ git config user.name
Ada
```

No error, but half the name is missing. The name was not in quotes, so only the first word was stored. Run the command again with quotes: `git config user.name "Ada Lovelace"`.

```console
$ git config username "Ada Lovelace"
error: key does not contain a section: username
```

Every setting is written `section.name`, with a dot. The setting is called `user.name`, not `username`.

:::careful
Git only catches a missing dot. A typo after the dot, like `user.nmae`, is stored without any warning, and Git then ignores it because no part of Git reads a setting with that name. If a setting seems to have no effect, look for the typo with `git config --list`.
:::

## Under the hood

"Must know" used `git config` as a black box. This layer opens it: every level is one plain text file, and `git config` only edits those files for you.

### Where the three files live

| Level | File | On Windows, usually |
|---|---|---|
| System | `etc/gitconfig` inside the Git installation | `C:/Program Files/Git/etc/gitconfig` |
| Global | `.gitconfig` in your home folder (`~/.gitconfig`) | `C:/Users/<you>/.gitconfig` |
| Local | `.git/config` inside the repository | the same, in each project |

`~` is the shell's short name for your home folder. `.git` is a hidden folder that Git keeps in every repository, with all its data; the lesson [A first look inside .git](lesson:first-look-inside) opens it.

Git reads the files in this order, and a value read later replaces one read earlier. "The closest level wins" is nothing more than "the file read last wins".

### What a config file looks like

The files are short and readable. This is the practice project's local file after the Try-its:

```console
$ cat .git/config
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	symlinks = false
	ignorecase = true
	autocrlf = false
[user]
	name = Ada at Work
```

- A line in square brackets starts a **section**: `[core]`, `[user]`.
- Each line below it is one `name = value` pair of that section.
- `user.name` on the command line is the line `name` in the section `[user]`.

The `[core]` lines were written by Git when the repository was created. They describe the repository itself, and you leave them alone.

The global file has the same form:

```console
$ cat ~/.gitconfig
[user]
	name = Ada Lovelace
	email = ada@example.com
```

`git config --global user.name "Ada Lovelace"` did nothing more than write that `name` line. You could type the line into the file yourself and Git would accept it. The command is safer, because it cannot break the file's format.

### Why the identity cannot be changed later

Your name and email are stored inside each commit, next to the snapshot of your files. A commit's ID is computed from everything in it, the author included. So a different name would mean a different ID, which means a different commit. Changing `user.name` therefore only affects commits you make from now on. The old ones keep the name they were made with.

## Advanced

### Show the level by name

`--show-origin` prints a file path. `--show-scope` prints the level's name, which is easier to read:

```console
$ git config --show-scope core.autocrlf
local	false
$ git config --show-scope --get-all core.autocrlf
system	true
local	false
```

The first command shows the winner. With `--get-all` you see every level that has a value, in reading order: the last line wins.

### Remove a setting

`git config --unset <key>` deletes a setting from one level. It is how you take back a local value so the global one shows through again, or clean up a typo:

```console
$ git config --unset user.nmae
```

Add `--global` to remove it from your global file instead. If the setting does not exist at that level, Git prints nothing and changes nothing.

### Edit a file directly

`git config --edit` opens the local file in your editor; `git config --global --edit` opens the global one. It is handy when you want to change several settings at once. Save and close to finish.

### Override the identity for one command

Git also reads your identity from environment variables, which are values a terminal hands to every program it starts. `GIT_AUTHOR_NAME` and `GIT_AUTHOR_EMAIL` beat all three config levels:

```console
$ GIT_AUTHOR_NAME="Build Server" git commit -m "Nightly build"
```

Written before a command like this, the variable applies to that one command only. Automated tools use it; in daily work you rarely need it.

`git -c user.name="Ada" commit ...` does the same for any setting: `-c` gives one setting a value for one command.

### Line endings on Windows

Windows ends each line of a text file with two invisible characters (called CRLF); macOS and Linux use one (LF). Git for Windows sets `core.autocrlf=true` at the system level, so files are stored with LF and checked out with CRLF. That is where warnings like "LF will be replaced by CRLF" come from. The practice projects set `core.autocrlf false` locally to keep such warnings out of your way. The lesson "Configuration in depth" explains line endings and what a team should choose.

### Other ways to read the manual

- `git help -a` lists every Git command, grouped by kind.
- `git help -g` lists Git's concept guides. `git help tutorial` opens a short official tutorial.
- On macOS and Linux, `man git-config` opens the same page as `git help config`.

## Recap

- `git --version` shows whether Git is installed, and which version.
- Set your identity once: `git config --global user.name "Your Name"` and `git config --global user.email you@example.com`. Every commit carries it.
- Settings live at three levels: system, global, local. The closest level wins, and a local value only hides the global one in that repository.
- `git config <key>` shows the value in use; `git config --list --show-origin` shows every value and its file.
- `git <verb> -h` prints a short option list; `git help <verb>` opens the full manual, offline.
