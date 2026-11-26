---
id: config-pro
title: "Configuration in depth: scopes, conditional config, aliases, diff and merge tools"
module: make-git-yours
bookSection: "8.1 Git Configuration"
bookUrl: https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration
bookSources:
  - book/progit2/book/08-customizing-git/sections/config.asc
  - book/progit2/book/02-git-basics/sections/aliases.asc
readFirst: [setup]
---

You type `git status` fifty times a day, your work commits sometimes go out under your private email, and Git behaves differently on your laptop than on your teammate's without anyone knowing why. All three are settings problems. This lesson shows how to find where any setting comes from, which settings are worth changing, how to make your own short commands, and how to give your work projects their own identity automatically.

## Must know

The lesson [Install, configure and get help](lesson:setup) set your name, your email and your editor, and showed that settings live at three levels. This lesson starts where that one stopped: with a Git that already works, and a few dozen settings you have never looked at.

Every command you run here changes the practice project's own settings only. Commands that would change your real computer are shown with `--global` and marked "read, do not run".

### Three scopes, and which one wins

Before you change a setting, you need to know where its current value comes from. Git can tell you.

Git's own word for a level of settings is a [**scope**](term:config-scope). You met three of them:

| Scope | Applies to | Option | File |
|---|---|---|---|
| system | Every user of this computer | `--system` | `etc/gitconfig` in the Git installation |
| global | You, in every repository | `--global` | `~/.gitconfig` in your home folder |
| local | One repository | `--local`, or no option | `.git/config` in that repository |

When the same setting exists in more than one scope, the closest one wins: local beats global, and global beats system.

`git config --list --show-origin --show-scope` prints every setting Git can find. Each line has the scope, then the file, then the setting:

```console
$ git config --list --show-origin --show-scope
system	file:C:/Program Files/Git/etc/gitconfig	core.autocrlf=true
system	file:C:/Program Files/Git/etc/gitconfig	core.editor=vim
system	file:C:/Program Files/Git/etc/gitconfig	init.defaultbranch=master
global	file:C:/Users/ada/.gitconfig	user.name=Ada Lovelace
global	file:C:/Users/ada/.gitconfig	user.email=ada@example.com
global	file:C:/Users/ada/.gitconfig	init.defaultbranch=main
global	file:C:/Users/ada/.gitconfig	core.editor=code --wait
local	file:.git/config	core.repositoryformatversion=0
local	file:.git/config	core.filemode=false
local	file:.git/config	core.bare=false
local	file:.git/config	core.logallrefupdates=true
local	file:.git/config	core.symlinks=false
local	file:.git/config	core.ignorecase=true
local	file:.git/config	core.autocrlf=false
local	file:.git/config	core.editor=nano
```

Read it top to bottom. Git lists the scopes in the order it reads them, and **a line further down beats the same setting further up**. Here `core.editor` appears three times: `vim` for the whole computer, `code --wait` for Ada, `nano` for this repository. In this repository Git opens `nano`.

The two options do different jobs, and you can use either one alone:

| Option | Adds | Use it when |
|---|---|---|
| `--show-scope` | The scope's name: `system`, `global`, `local` | You want to know which level to change. Easiest to read |
| `--show-origin` | The exact file | You want to open that file, or one scope reads more than one file (you will see that with work identities below) |

For one setting, name it. Git prints only the winner:

```console
$ git config --show-scope --show-origin core.editor
local	file:.git/config	nano
```

Add `--get-all` to see every scope that has a value, in reading order. The last line is the one in use:

```console
$ git config --show-scope --get-all core.editor
system	vim
global	code --wait
local	nano
```

:::try-it
1. Run `git config --list --show-scope`. Git prints your own settings, one per line, with the scope in front. Find the first line that starts with `local`: everything from there on belongs to the practice project only.
2. Give the project its own editor: `git config core.editor nano`. Git prints nothing. The picture does not change either, here or anywhere in this lesson: settings are not files of your project, so nothing moves in the working tree or on the history map.
3. Run `git config --show-scope --get-all core.editor`. The last line is `local	nano`. Any lines above it are the values of your computer, which the local value hides in this project.
:::

### Remove a setting with `--unset`

You can now see which scope a value comes from. The next question is how to take a value back.

`git config --unset <key>` deletes one setting from one scope. With no option that scope is local; add `--global` for your own file.

Removing is not the same as setting a different value. When the local value is gone, the next scope shows through again, exactly as if you had never set anything here.

:::predict
question: "core.editor is vim in the system scope, code --wait in the global scope and nano in the local scope. You run git config --unset core.editor. What does git config core.editor print now?"
answer: "code --wait. With no option, --unset removes the local value only. The global and system values were never touched, and global is now the closest scope that has one."
:::

```console
$ git config --unset core.editor
$ git config --show-scope core.editor
global	code --wait
```

:::try-it
1. Run `git config --unset core.editor`. Git prints nothing: the local value from the last Try-it is removed.
2. Run `git config --show-scope core.editor`. The answer now starts with `global` or `system`, or Git prints nothing at all if you never chose an editor on this computer. Either way, the practice project no longer has an opinion.
:::

:::careful
`--unset` is silent when there is nothing to remove. If you mistype the key, or the value lives in another scope, Git prints nothing and changes nothing. Check afterwards with `git config --show-scope <key>`.
:::

### Settings worth knowing

You can find and remove any setting. Now, which ones should you set? Git has several hundred, and most only matter in rare cases. These eleven are the ones working developers really use.

Each is set the same way: `git config --global <key> <value>` for yourself, or without `--global` for one repository.

**How Git talks to you**

| Setting | What it does | Worth setting? |
|---|---|---|
| `core.editor` | The editor Git opens for commit messages. If you never chose one, Git looks at the shell's `VISUAL` and `EDITOR` variables and then falls back to `vi` | Yes, once, globally. `"code --wait"` or `nano` |
| `core.pager` | The [pager](term:pager) Git uses for long output; `less` by default. Set it to `cat` or to an empty value (`''`) and Git prints everything in one go | Only if the pager annoys you. For one command, `git --no-pager log` does the same |
| `color.ui` | The main switch for colored output. The default, `auto`, colors what goes to a terminal and leaves color out when the output is written to a file. `false` turns color off | Leave it. Pro Git says the default is almost always what you want |
| `help.autocorrect` | What Git does when you mistype a command name (see below) | A matter of taste: `prompt` is the safe choice |

**How your commits and ignores start**

| Setting | What it does | Worth setting? |
|---|---|---|
| `commit.template` | A text file Git puts into the editor as the start of every commit message: a [commit template](term:commit-template). Teams use it to remind everyone of the message format | When your team has message rules. The lesson [Commit messages and atomic commits](lesson:commit-craft) builds one |
| `core.excludesFile` | A [.gitignore](term:gitignore) file of your own that applies to every repository on your computer: your editor's backup files, `.DS_Store` on macOS | Yes, once you see the same stray files in every project. The lesson [Ignore files with .gitignore](lesson:ignoring-files) shows it |
| `init.defaultBranch` | The name of the first branch in repositories you create | Yes: `main`. You set it in the setup lesson |

**How Git works with a server and with other branches**

| Setting | What it does | Worth setting? |
|---|---|---|
| `pull.rebase` | `false`: `git pull` joins your work and the server's with a merge. `true`: it replays your new commits on top of the server's instead (a [rebase](term:rebase)) | Follow your team. The lesson [Work with remotes](lesson:remotes) explains both |
| `push.autoSetupRemote` | `true`: the first `git push` of a new branch creates it on the server and links the two, so you never type `--set-upstream` | Yes for most people. See [Remote and tracking branches](lesson:remote-branches) |
| `rerere.enabled` | `true`: Git remembers how you solved a conflict and solves the same one for you next time ([rerere](term:rerere)) | Yes if you rebase or merge long-lived branches. The lesson [Hard conflicts, merge strategies and rerere](lesson:advanced-merging) teaches it |
| `core.autocrlf` | Converts line endings between Windows and other systems (see below) | Depends on your system; the table below says which value |

Two of them need a closer look.

**`help.autocorrect`.** By default, Git only suggests:

```console
$ git stauts
git: 'stauts' is not a git command. See 'git --help'.

The most similar command is
	status
```

With `help.autocorrect` set, Git runs its guess for you:

```console
$ git config help.autocorrect 20
$ git stauts
WARNING: You called a Git command named 'stauts', which does not exist.
Continuing in 2.0 seconds, assuming that you meant 'status'.
On branch main
nothing to commit, working tree clean
```

| Value | Git's reaction to a typo |
|---|---|
| `0` or unset | Shows the suggestion and stops |
| a number, like `20` | Waits that many tenths of a second (here 2.0 seconds), then runs the guess. Press Ctrl+C in time to stop it |
| `prompt` | Asks you first, and runs the guess only if you answer yes |
| `immediate` | Runs the guess at once |
| `never` | Does not even suggest |

:::compare
today: "`help.autocorrect 1` runs the guess **at once**, the same as `immediate`. Use `prompt`, or a number from 2 up, if you want time to stop it."
book: "Pro Git describes `help.autocorrect 1` as a wait of 0.1 seconds. That was true in older versions of Git."
:::

**`core.autocrlf`.** Text files mark the end of each line with invisible characters, called the [**line ending**](term:line-ending). Windows uses two of them (carriage return and line feed, written CRLF); macOS and Linux use one (LF). When a Windows editor and a Mac editor both touch a file, every line can look changed although no word is different. `core.autocrlf` lets Git convert for you:

| Value | When you stage a file | When Git writes a file into your working tree | Pro Git recommends it for |
|---|---|---|---|
| `true` | CRLF becomes LF | LF becomes CRLF | Windows, in a team with other systems. Git for Windows sets this for you |
| `input` | CRLF becomes LF | Nothing is converted | macOS and Linux: your files stay LF, and a stray CRLF file gets fixed |
| `false` | Nothing is converted | Nothing is converted | A project that only ever lives on Windows |

With `true` or `input`, the repository always holds LF, whatever each person's computer uses. This message is that conversion at work, and it is harmless:

```console
$ git add lf.txt
warning: in the working copy of 'lf.txt', LF will be replaced by CRLF the next time Git touches it
```

The practice projects set `core.autocrlf false` locally so that this warning stays out of your way. A team that wants one rule for everybody, whatever each person configured, writes it into the project itself; the Attributes lesson shows how.

### Aliases: your own short commands

Settings change how Git behaves. One kind of setting changes what you type.

An [**alias**](term:alias) is a name you make up for a Git command you use often. `git config alias.<name> <command>` creates it, and from then on `git <name>` runs the command.

```console
$ git config alias.br branch
$ git br
* main
```

`git br` now does exactly what `git branch` does. Anything you type after the alias is passed along, so `git br -v` runs `git branch -v`.

An alias can hold options too. Put the whole command in quotes, so the shell hands it to Git as one value:

```console
$ git config alias.hist 'log --oneline --graph'
$ git hist
* 647f58e Add README
```

Pro Git points out that aliases are also a way to make "commands that should exist". Its example gives the long way of taking a file out of the staging area a clear name:

```console
$ git config alias.unstage 'restore --staged'
$ git add todo.txt
$ git unstage todo.txt
$ git status -s
?? todo.txt
```

:::compare
today: "`git config alias.unstage 'restore --staged'` and `git config alias.sw switch` build on today's commands."
book: "Pro Git's examples are `alias.unstage 'reset HEAD --'` and `alias.co checkout`. Both still work, and you will meet `git co` in many teams."
:::

The book's four starter aliases are `co` (checkout), `br` (branch), `ci` (commit) and `st` (status), plus `last` for `log -1 HEAD`, which shows the newest commit. Pro Git itself never uses aliases in its examples, and neither does this course: on someone else's computer your aliases do not exist, so you need to know the real commands.

:::predict
question: "You like the short status, so you run git config alias.status 'status -s'. What does git status print now: the short form or the long one?"
answer: "The long one. Git looks for a real command with that name first, and only tries aliases when it finds none. An alias can never replace a built-in command; give it a new name such as st."
:::

:::try-it
1. Run `git config alias.br branch`, then `git br`. Git lists the branches of the practice project, with a `*` in front of the one you are on, just as `git branch` does.
2. Run `git config alias.hist 'log --oneline --graph'`, then `git hist`. Each commit of the practice project appears on one line, with a `*` drawn in front of it.
3. Run `git config --get-regexp '^alias\.'`. Git lists every alias it can find, one per line, as `alias.br branch`. This is how you look up an alias you forgot. (`--get-regexp` prints all settings whose name matches a pattern; this pattern means "starts with `alias.`".)
4. Clean up one of them: `git config --unset alias.br`, then `git br`. Git answers `git: 'br' is not a git command`: the alias is gone.
:::

### Aliases that run a shell command

An alias as you have seen it so far can only run a Git command. Sometimes you want a short name for something else: a small script, or two commands in a row.

Start the value with `!` and Git hands the rest to the shell instead of running it as a Git command.

```console
$ git config alias.count '!git rev-list --count HEAD'
$ git count
1
```

`git rev-list --count HEAD` counts the commits in your history. After the `!` you write the full command, including the word `git`, because the shell knows nothing about Git on its own. Pro Git's example is `alias.visual '!gitk'`, which opens the small history viewer that ships with Git.

Two things to know:

- A `!` alias always runs in the top folder of the repository, even when you call it from a subfolder.
- Use single quotes around the value. In double quotes, the shell tries to use the `!` itself before Git ever sees it.

:::careful
A `!` alias can run any program on your computer. Never paste an alias from the internet into your settings without reading what comes after the `!`.
:::

### A work identity that switches by itself

Aliases save typing. The next tool saves you from a mistake: committing work code under your private email, or the other way round.

The setup lesson's answer was a local `user.email` in each work repository. That works until you clone the tenth work project and forget. A [**conditional include**](term:conditional-include) fixes it for good: one rule in your global file that says "for every repository under this folder, also read this other file".

Read this part; do not run it, since it changes your real global file. Come back to it the day you need it.

Ada keeps all work projects under `~/work/`. She creates a small second file, `~/.gitconfig-work`, with only the settings that differ at work:

```console
$ cat ~/.gitconfig-work
[user]
	email = ada@shop.example
```

Then she adds two lines to the end of her global file, `~/.gitconfig`:

```console
$ cat ~/.gitconfig
[user]
	name = Ada Lovelace
	email = ada@example.com
[includeIf "gitdir:~/work/"]
	path = ~/.gitconfig-work
```

Read the new part as a sentence: **if** the repository is somewhere under `~/work/`, **include** the file `~/.gitconfig-work` at this point. (`gitdir` stands for the repository's `.git` folder; `~` is your home folder.)

Now the same command gives two answers, depending on where Ada stands:

```console
$ cd ~/work/shop-api
$ git config --show-origin user.email
file:C:/Users/ada/.gitconfig-work	ada@shop.example
$ cd ~/play/blog
$ git config --show-origin user.email
file:C:/Users/ada/.gitconfig	ada@example.com
```

What stays the same matters as much. Ada's name, her editor and her aliases still come from `~/.gitconfig` in both places. The work file only adds or replaces the lines it contains. This is also where `--show-origin` earns its place: both files belong to the global scope, so `--show-scope` would print `global` twice and tell you nothing.

:::careful
Two details decide whether the rule works:

- The folder must end with `/`. `gitdir:~/work/` means "anything under work". Without the slash, the rule only matches a repository whose `.git` folder is exactly `~/work`, so it never applies.
- Put the `[includeIf]` lines **after** your normal `[user]` section. Git reads the file top to bottom and a later value wins, so an include at the top would be overruled by the lines below it.
:::

### Open a diff or a conflict in a visual tool

One more thing people configure early: the tool that shows differences.

`git diff` prints changes in the terminal, and a [merge conflict](term:merge-conflict) is solved by editing markers in a file, as in [Branch, merge, and fix conflicts](lesson:branch-and-merge). Both can be handed to a visual program that shows the versions side by side. Four pieces make that work:

| You type | What it does |
|---|---|
| `git config --global diff.tool vscode` | Chooses the program for viewing differences |
| `git difftool` | Works like `git diff`, but opens each changed file in that program, one after the other |
| `git config --global merge.tool vscode` | Chooses the program for solving conflicts |
| `git mergetool` | During a conflicted merge, opens each conflicted file in that program. When you save and close, Git stages the solved file |

`vscode` is one of the names Git already knows how to start; `vimdiff`, `meld`, `kdiff3` and `p4merge` are others. `git mergetool --tool-help` lists them all and says which are installed on your computer.

These are worth setting if you like a visual view. They change nothing about how Git works: `git diff` still prints to the terminal, and the two tool commands are extra. The practice terminal has no windows to open, so try them in a project of your own.

### When it goes wrong

Three things that go wrong with settings and aliases, and what to do about each.

```console
$ git oops
expansion of alias 'oops' failed; 'stauts' is not a git command
```

The alias `oops` exists, but its value has a typo: it tries to run `git stauts`. Git checks an alias only when you use it, never when you create it. Look at the value with `git config alias.oops` and set it again.

```console
$ git config alias.st status
fatal: not in a git directory
```

With no option, `git config` writes to the local scope, and you are in a folder that is not a repository, so there is no local file to write to. Move into your project with `cd`, or add `--global` if you meant the setting for yourself everywhere.

```console
$ cd ~/work/shop-api
$ git config --show-origin user.email
file:C:/Users/ada/.gitconfig	ada@example.com
```

No error, but the work email is missing: the `includeIf` rule did not apply. `--show-origin` shows that the value still comes from the main global file. Check the two details from the careful block above: the folder in the rule ends with `/`, and this repository really is under that folder.

## Under the hood

"Must know" treated the scopes as three labels. Underneath, there is one simple rule: Git reads a list of plain text files in a fixed order, and whatever it reads last is what counts. Includes and aliases both follow from it.

### The reading order

Every time a Git command starts, it reads these in order:

| Order | Scope | Where |
|---|---|---|
| 1 | system | `etc/gitconfig` in the Git installation |
| 2 | global | `~/.config/git/config` if it exists, then `~/.gitconfig` |
| 3 | local | `.git/config` in the repository |
| 4 | command | Settings given for one command, with `git -c <key>=<value>` |

A value read later replaces the same setting read earlier. "Local beats global" is only a result of local being read later. The fourth scope is why `git -c` beats everything:

```console
$ git -c color.ui=false config --show-scope color.ui
command	false
```

Pro Git notes that the files are plain text and you may edit them by hand; `git config` is the safer way, because it cannot break the format.

### An include is read in place

`includeIf` has a plain sibling, `include`, with no condition. It works in any config file, also in a repository's own `.git/config`:

```console
$ git config --local include.path ../shared.gitconfig
$ tail -2 .git/config
[include]
	path = ../shared.gitconfig
```

When Git reaches those lines, it stops, reads the named file as if its content were written right there, and then carries on with the rest. Two things follow.

**The path counts from the file that holds the line.** That file is `.git/config`, inside the `.git` folder. So `../shared.gitconfig` means "one folder up from `.git`", which is the top of your project. `--show-origin` prints it that way:

```console
$ git config --show-origin --show-scope pull.rebase
local	file:.git/../shared.gitconfig	true
```

The scope is still `local`, because the include was found in the local file. The origin names the included file.

**Position decides who wins.** Suppose `shared.gitconfig` sets `pull.rebase = true`, and you then set your own value:

```console
$ git config pull.rebase false
$ git config --show-origin --get-all pull.rebase
file:.git/../shared.gitconfig	true
file:.git/config	false
```

`git config` wrote the new `[pull]` section at the end of `.git/config`, after the include, so your `false` is read later and wins. A value that sits above the `[include]` lines would lose instead.

Teams use this to share aliases and settings: the file is committed with the project, and each person includes it once.

:::careful
Git never reads settings from a project's files on its own, and this is why: a config file can define `!` aliases and name programs to run. If cloning a project could change your settings, cloning would be dangerous. You must add the include yourself, and from then on anyone who can change that file changes how your Git behaves. Include only files from people you trust.
:::

### What `--local` reads, and what it skips

`git config --local --list` shows the lines of `.git/config` itself and does **not** follow includes. `git config --list` with no scope reads everything, includes too. So after the example above:

```console
$ git config --local include.path
../shared.gitconfig
$ git config --local --get-all pull.rebase
false
```

Only your own `false` is listed. The included `true` is real, but it lives in the other file. Naming a scope is a quick way to see what one file holds by itself.

### How Git runs an alias

When you type `git hist`, Git first looks for a real command called `hist`. It finds none, so it looks for the setting `alias.hist`, replaces the word `hist` with the value, and starts again with `git log --oneline --graph`. That order, real commands first, is why an alias named `status` is never used.

An alias is an ordinary setting in an `[alias]` section, so everything in this lesson applies to it: scopes, `--show-origin`, `--unset`, includes.

```console
$ cat .git/config
[alias]
	hist = log --oneline --graph
	count = !git rev-list --count HEAD
```

(Shortened: the `[core]` section above it is left out.)

### Names are not case-sensitive, values are

In the long list above, `init.defaultBranch` appears as `init.defaultbranch`. Git ignores upper and lower case in the section and the name, and prints them in lower case. The capitals in the manual are only there to make long names readable. Values are kept exactly as you typed them.

## Advanced

### The newer spelling of `git config`

Since Git 2.46, `git config` also has subcommands, which read more like the rest of Git. The option forms keep working, and they are what you will find in Pro Git and in most answers online.

| Option form | Subcommand form |
|---|---|
| `git config --list` | `git config list` |
| `git config user.name` | `git config get user.name` |
| `git config --get-all core.editor` | `git config get --all core.editor` |
| `git config alias.st status` | `git config set alias.st status` |
| `git config --unset alias.st` | `git config unset alias.st` |

### One setting with several values

A few settings may hold a list, and `git config --add` appends another value instead of replacing. If a setting that should have one value ends up with two, Git refuses to guess:

```console
$ git config core.editor emacs
warning: core.editor has multiple values
error: cannot overwrite multiple values with a single value
       Use a regexp, --add or --replace-all to change core.editor.
```

`git config --unset-all core.editor` removes every copy from that scope; then set the value once. `git config --replace-all core.editor emacs` does both in one step.

`git config --remove-section alias` deletes a whole section, here every local alias, at once.

### Other conditions for `includeIf`

`gitdir:` is the common one. The Git reference lists a few more:

| Condition | Includes the file when |
|---|---|
| `gitdir/i:~/Work/` | Same as `gitdir:`, ignoring upper and lower case in the path |
| `onbranch:release/` | The branch you are on has a name starting with `release/` |
| `hasconfig:remote.*.url:https://github.com/shop/**` | Any remote of the repository has an address matching the pattern. Useful when work projects are not all in one folder |

### An alias that takes arguments in the middle

A plain alias only adds what you type to the end. For anything more, a `!` alias can define a small shell function and call it:

```console
$ git config alias.who '!f() { git log --oneline --author="$1"; }; f'
$ git who Ada
```

`$1` is the first word after `git who`. The function is defined and called in one go; the words you typed land in `$1`, `$2` and so on.

### A merge tool Git does not know

For a program that is not in the `--tool-help` list, you tell Git how to start it. Pro Git does this with small wrapper scripts; the settings are:

| Setting | Job |
|---|---|
| `merge.tool <name>` | Picks your tool by a name you choose |
| `mergetool.<name>.cmd` | The command line to run. Git fills in `$BASE` (the common starting version), `$LOCAL` (yours), `$REMOTE` (theirs) and `$MERGED` (the file to write) |
| `mergetool.<name>.trustExitCode` | `true` if the program's exit code tells Git whether the conflict was solved; with `false`, Git asks you |
| `diff.external` | A program that replaces `git diff`'s own output for every diff. Stronger than `diff.tool`, which only acts when you type `git difftool` |

`git difftool --tool=<name>` and `git mergetool --tool=<name>` pick a tool for one run without changing a setting.

### Colors, one by one

Below the main switch `color.ui`, each kind of output has its own switch (`color.branch`, `color.diff`, `color.interactive`, `color.status`) and its own colors. Pro Git's example makes the header lines of a diff bold blue on black:

```console
$ git config --global color.diff.meta "blue black bold"
```

The colors are `normal`, `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan` and `white`; the styles are `bold`, `dim`, `ul` (underline), `blink` and `reverse`.

### Whitespace checks

`core.whitespace` chooses which whitespace problems `git diff` highlights, such as spaces at the end of a line (on by default) or tabs used for indentation (off by default). Names are separated by commas, and a `-` in front turns one off: `git config core.whitespace trailing-space,-space-before-tab`. `git apply --whitespace=fix` and `git rebase --whitespace=fix` repair such problems while they apply changes.

### Settings for servers

Pro Git ends the section with three settings for the repository that receives pushes: `receive.fsckObjects` (check every received object for damage), `receive.denyNonFastForwards` (refuse force-pushes) and `receive.denyDeletes` (refuse deleting branches and tags). On GitHub you do not set these yourself; its branch protection rules do the same job.

## Recap

- `git config --list --show-origin --show-scope` shows every setting with its scope and its file. A line further down wins: system, then global, then local.
- `git config --unset <key>` removes a value from one scope, and the next scope shows through again.
- `git config alias.<name> '<command>'` makes your own short command; start the value with `!` to run a shell command. An alias cannot replace a built-in command.
- `[includeIf "gitdir:~/work/"]` with a `path` in `~/.gitconfig` gives every repository under a folder its own settings, such as a work email. The folder ends with `/`, and the rule goes at the end of the file.
- `[include]` reads another file in place: its path counts from the file that holds the line, and whatever is read later wins.
