---
id: git-in-your-tools
title: "Git in VS Code, terminals and GUIs"
module: make-git-yours
bookSection: "A1 Git in Other Environments"
bookUrl: https://git-scm.com/book/en/v2/Appendix-A:-Git-in-Other-Environments-Graphical-Interfaces
bookSources:
  - book/progit2/book/A-git-in-other-environments/sections/guis.asc
  - book/progit2/book/A-git-in-other-environments/sections/visualstudiocode.asc
  - book/progit2/book/A-git-in-other-environments/sections/visualstudio.asc
  - book/progit2/book/A-git-in-other-environments/sections/jetbrainsides.asc
  - book/progit2/book/A-git-in-other-environments/sections/sublimetext.asc
  - book/progit2/book/A-git-in-other-environments/sections/bash.asc
  - book/progit2/book/A-git-in-other-environments/sections/zsh.asc
  - book/progit2/book/A-git-in-other-environments/sections/powershell.asc
readFirst: [setup]
---

Your editor has a Git panel full of buttons, a teammate does everything in GitHub Desktop, and you learned Git by typing commands. This lesson shows which command sits behind each button, so you can use any Git tool without guessing, and it sets up your terminal and VS Code to work with Git the way you want.

## Must know

So far you typed every Git command yourself. Most developers also use Git through other tools: an editor, a separate app, a smarter terminal. This part walks through them, and for each one answers the same question: which commands that you already know is this tool running?

### A GUI runs the commands you know

A **[GUI](term:gui)** (graphical user interface) is a program you use by clicking, the opposite of the [command line](term:command-line). The [setup](lesson:setup) lesson said why this course teaches commands first: a GUI's buttons run those same commands.

Pro Git adds two things worth remembering:

- A graphical tool can do nothing the command line cannot do. New Git features arrive on the command line first.
- Most tools show only a part of Git, on purpose. No tool is "better"; each fits one way of working.

| Kind of tool | What it is built for | Examples |
|---|---|---|
| Task tool | One job, done well | `gitk` (read history), `git gui` (make commits) |
| Workflow tool | One way of working, with the rest left out | GitHub Desktop |
| Editor with Git built in | The daily loop without leaving your code | VS Code, JetBrains IDEs, Visual Studio, Sublime Text |

(An **IDE** is an editor with the build and debug tools of one language built in, like IntelliJ IDEA for Java or PyCharm for Python.)

The idea to hold on to: **there is one repository, and it is on your disk**. The terminal, VS Code and every other tool read and write the same `.git` folder. No tool keeps its own copy of your staging area or your commits. So you can stage in the terminal, commit in VS Code and read the history in `gitk`, in any mix.

The common wrong idea is "I committed in VS Code, so the terminal does not have it yet". It has it, because there is nothing to hand over.

A small example. `git status -sb` prints the [branch](term:branch) on the first line and one line per changed file:

```console
$ git status -sb
## main
?? todo.txt
```

A GUI shows exactly these two facts, in its own way. VS Code puts `main` in the bar at the bottom of the window and lists `todo.txt` with a green `U`, its letter for untracked.

Practise on a file of your own, so the practice project stays as it is for the challenges at the end of this lesson.

:::predict
question: "VS Code is open on a project. In a terminal you run `git add todo.txt`. What does VS Code's Git panel show a moment later?"
answer: "`todo.txt` under \"Staged Changes\". VS Code did not need to be told: it reads the same `.git` folder your command just changed."
:::

:::try-it
1. Create a file: `echo "Buy milk" > todo.txt`. In the picture, a `todo.txt` sheet appears in the working tree.
2. Run `git status -sb`. Git prints `## main` and then `?? todo.txt`: the branch, and one untracked file.
3. Run `git add todo.txt`, then `git status -sb` again. The line is now `A  todo.txt`, a new file that is staged. In the picture, the `todo.txt` sheet slides into the staging area.
4. If VS Code is installed, run `code .` to open this folder in it, and click the Source Control icon on the left (three dots joined by lines). The file `todo.txt` is listed under "Staged Changes" with an `A`. The picture in this app and the panel in VS Code agree, because both read the same repository.
5. Run `git restore --staged todo.txt`. The file `todo.txt` goes back to untracked: `??` in the terminal, a sheet in the working tree in the picture, and `U` under "Changes" in VS Code.
:::

### Two tools that come with Git: `gitk` and `git gui`

You do not need to install anything to try a GUI. Git has two small ones of its own, and they show the two jobs a GUI is best at: looking at history and building a commit.

`gitk` draws your history as a graph in a window. Pro Git calls it a graphical shell over `git log`. Start it inside a repository:

```console
$ gitk --all
```

- The top part looks like `git log --graph`: each dot is a commit, the lines join a commit to its parents, and branch names sit in coloured boxes.
- The yellow dot is [HEAD](term:head). A red dot on top stands for changes you have not committed yet.
- Click a commit and the bottom part shows its message and its [diff](term:diff).

`gitk` takes the options of `git log`. Without options it shows the commits you reach from HEAD. `--all` adds every other branch, which is usually what you want.

:::graph
caption: "On main, gitk shows A and B. gitk --all also shows C on the hours branch."
commits:
  - id: A
    message: Add README
  - id: B
    message: Add opening hours
    parents: [A]
  - id: C
    message: Weekday hours
    parents: [A]
branches:
  main: B
  hours: C
head: main
:::

`git gui` is a window for making commits. Start it with `git gui`.

| Part of the window | What it shows | The command behind it |
|---|---|---|
| Top left, "Unstaged Changes" | Changed and untracked files | `git status` |
| Bottom left, "Staged Changes" | What the next commit will hold. Click a file's icon to move it across | `git add`, `git restore --staged` |
| Top right | The diff of the file you clicked. Right-click a block of lines to stage only that block | `git diff`, `git add -p` |
| Bottom right | The message box and the Commit button. "Amend Last Commit" reopens the last commit | `git commit`, `git commit --amend` |

Both tools look old, and both are still useful on a computer where nothing else is installed.

:::sidenote
Pro Git says you get both tools when you install Git. That is true for Git for Windows. On macOS and Linux they are often a separate package (`git-gui`, `gitk`), so the command may be missing until you install it.
:::

:::try-it
1. Run `gitk --all`. A window opens with the practice project's history: one dot per commit, and `main` in a box next to the newest one. Nothing changes in the picture, because `gitk` only reads.
2. Click the top commit. The lower part of the window shows the commit's author, its message and the lines it added.
3. Close the window. The terminal waits for `gitk` to finish, and the prompt comes back when the window is gone.
:::

### VS Code's Source Control view

`gitk` and `git gui` each do one job in their own window. An editor with Git built in does the whole daily loop next to your code, and VS Code is the one most developers use today.

VS Code uses the Git that is installed on your computer. Open a folder that is a repository, and the **Source Control view** (the icon on the left, or `Ctrl+Shift+G`) becomes a live `git status`.

| In VS Code | What you get | The command you know |
|---|---|---|
| The lists "Changes" and "Staged Changes" | Files with a letter: `U` untracked, `M` modified, `A` added, `D` deleted | `git status` |
| `+` next to a file | The file moves to "Staged Changes" | `git add <file>` |
| `−` next to a staged file | The file moves back to "Changes" | `git restore --staged <file>` |
| The curved arrow, "Discard Changes" | The file goes back to its last committed content | `git restore <file>` |
| Click a file | Old and new content side by side | `git diff`, or `git diff --staged` for a staged file |
| Select lines in that diff, then "Stage Selected Ranges" | Only those lines are staged | `git add -p` |
| The message box and the Commit button | A commit from "Staged Changes" | `git commit -m "..."` |
| The branch name in the bar at the bottom | A list to switch branch or create one | `git switch`, `git switch -c` |
| The two arrows with numbers next to the branch name | Commits to bring in (down) and to send (up). A click brings in, then sends | `git pull`, then `git push` |
| "Publish Branch" | The branch goes to the server for the first time | `git push -u origin <branch>` |
| Coloured bars beside the line numbers | The lines you changed since the last commit | `git diff` for this file |

Three of these buttons do more than their name says.

:::careful
- **Commit with nothing staged.** VS Code offers to stage all your changes and commit them. If you answer "Always", every later commit takes every change, new files included. That is more than `git commit -a`, which leaves untracked files out. Stage first, then commit, as you do in the terminal.
- **Discard Changes.** On an untracked file, it deletes the file. Git never had a copy, so nothing can bring it back.
- **The sync arrows.** One click runs a pull and then a push. The numbers are only as fresh as your last [fetch](term:fetch), exactly like the "ahead" and "behind" numbers of `git status`.
:::

The staging letters match what you learned in [Status, stage, commit](lesson:three-areas): a file that is staged and then edited again appears in both lists, just as `git status -s` prints `MM`.

Staging selected lines is the place where a GUI is clearly easier than the terminal. The lesson "Stage part of a file" teaches the terminal way, `git add -p`, and the two do the same thing.

### Conflicts in the merge editor

Staging and committing are the calm part of the day. The moment many people open a GUI for the first time is a [merge conflict](term:merge-conflict), because three versions of a file are hard to hold in your head.

When a merge stops, the terminal says so, and VS Code lists the file under "Merge Changes" with a `!`:

```console
$ git merge hours
Auto-merging README.md
CONFLICT (content): Merge conflict in README.md
Automatic merge failed; fix conflicts and then commit the result.
```

Open the file in VS Code and you have two ways to fix it:

- **In the file itself.** Above each [conflict marker](term:conflict-marker) block, VS Code shows links: "Accept Current Change" keeps your side (the branch you are on), "Accept Incoming Change" keeps the side you are merging in, "Accept Both Changes" keeps both.
- **In the merge editor.** The button "Resolve in Merge Editor" opens three panes: Incoming, Current, and the Result below. You tick the lines you want and edit the Result by hand. "Complete Merge" saves the file and stages it.

Either way, the result is what [Branch, merge, and fix conflicts](lesson:branch-and-merge) taught: a file without markers, staged with `git add`. The merge is finished by a commit, from the Commit button or with `git commit`.

"Current" and "Incoming" are VS Code's words. Git's own words for the same two sides are "ours" and "theirs".

### Other editors and apps

VS Code is one of many. You will meet the others on teammates' screens, and the same mapping works for each of them.

| Tool | Git support | Good to know |
|---|---|---|
| JetBrains IDEs (IntelliJ IDEA, PyCharm, WebStorm and others) | A Commit window, a Git window with the history, a three-pane conflict tool, GitHub pull requests | They use the Git installed on your computer. Their "Shelf" is the IDE's own feature and is not the [stash](term:stash) |
| Visual Studio | Built in since Visual Studio 2019, version 16.8: commit, branch, stash, sync, merge, rebase, conflicts | This is Microsoft's large IDE, a different program from VS Code |
| Sublime Text | From version 3.2: status badges on files, the branch in the bottom bar, changed-line marks | It shows Git state. For commits it hands over to a separate app, Sublime Merge |
| GitHub Desktop | A separate app for the daily loop: changes, commit, branches, one button to fetch, pull or push | Free, works with any Git host, and brings its own copy of Git |

:::sidenote
Pro Git describes two older apps, "GitHub for macOS" and "GitHub for Windows", with a single "Sync" button that ran `git pull --rebase` and then `git push`. Today there is one app, GitHub Desktop, and its button says what it will do: "Fetch origin", "Pull origin" or "Push origin". The lesson of the book still holds: a workflow tool is quick for the workflow it was built for, and Pro Git advises another tool or the command line when you want more control.
:::

### When a GUI helps, and when the terminal is better

You now know that both do the same work on the same repository. So the choice is about which one makes a job easier to see or quicker to do.

| Job | Better tool | Why |
|---|---|---|
| Read a large diff, review your own changes before a commit | GUI | Side by side, with colours and the whole file around it |
| Stage some lines of a file | GUI | Select and click, instead of answering questions hunk by hunk |
| Fix a conflict | GUI | Both sides and the result on one screen |
| Look at a history with many branches | GUI | A drawn graph is easier to follow than text |
| Anything rare: interactive rebase, reflog, bisect, settings | Terminal | Many tools do not have it, or hide it |
| Follow a guide, an error message or a teammate's advice | Terminal | Help is written as commands, and Git's own hints name commands |
| Repeat a job, or run it in a script | Terminal | A command can be saved and run again; a click cannot |
| Work on a server | Terminal | Usually there is no screen to click on |

A good habit: use the GUI to look, and know which command each button runs before you click it. When a button surprises you, do that step in the terminal.

### A terminal that shows your branch

The other direction works too: you can bring some of a GUI's comfort into the terminal. The two things people miss most there are seeing the current branch at all times, and not having to type long names.

A **[prompt](term:shell-prompt)** is the text your terminal prints before each command you type, like `$`. A Git-aware prompt adds the branch of the folder you are in:

```console
~/shop (main)$
```

That is the answer of `git branch --show-current`, printed for you before every command:

```console
$ git branch --show-current
main
```

**[Tab completion](term:tab-completion)** means you type the start of a word and press the Tab key, and the shell finishes it. With Git's completion on, `git sw` and Tab becomes `git switch`, and the same works for options, branch names and remote names.

Each shell (the program that reads your commands) gets both in its own way:

| Shell | Prompt | Completion |
|---|---|---|
| Bash | `git-prompt.sh`, a script that comes with Git | `git-completion.bash`, also from Git |
| Git Bash on Windows | Already on: Git for Windows loads both scripts, so you see `(main)` from the first day | Already on |
| Zsh (the default shell on macOS) | `vcs_info`, which is part of Zsh | `autoload -Uz compinit && compinit` in `~/.zshrc` |
| PowerShell | posh-git, an add-on you install | posh-git |

"Under the hood" shows how the Bash prompt is put together, and "Advanced" has the setup lines for Zsh and PowerShell. They change your own shell's start-up file, so they are yours to choose and no challenge asks for them.

### VS Code as Git's editor

The terminal can also call your editor. Git opens a text editor whenever it needs a longer text from you, such as a commit message when you leave out `-m`, and [setup](lesson:setup) showed the setting for it: `core.editor`.

`core.editor` holds the command Git runs to open that editor. For VS Code the command is `code --wait`:

```console
$ git config core.editor "code --wait"
$ git config core.editor
code --wait
```

Now `git commit` opens the message as a tab in VS Code. You type the message, save, and close the tab. Only then does Git make the commit.

`--wait` is the part that matters. Git starts the editor and waits until that program ends, then reads the file. Plain `code` hands the file to the VS Code window and ends at once.

:::predict
question: "`core.editor` is `code`, without `--wait`. You run `git commit`. What happens?"
answer: "The message file opens in VS Code, but Git has already stopped with \"Aborting commit due to empty commit message.\" The `code` command ended at once, so Git read the file before you typed a word."
:::

To see which editor Git would open in a repository, ask Git:

```console
$ git var GIT_EDITOR
code --wait
```

:::try-it
1. Run `git var GIT_EDITOR`. Git prints the editor it would open in this project, for example `vim`.
2. Run `git config --show-origin core.editor`. If the setting exists, Git prints the file it comes from and the value; `file:.git/config` means this repository's own settings. If Git prints nothing, no level sets `core.editor` and Git falls back to its default.
:::

Without `--global`, the setting is local: it holds for this repository only. Add `--global` on your own computer when you want VS Code for every project.

### VS Code as the diff and merge tool

One step further: Git can open a diff, or a conflict, in VS Code instead of printing it in the terminal.

`git difftool` shows the same changes as `git diff`, one file at a time, in a program of your choice, called a [diff tool](term:diff-tool). `git mergetool` opens each conflicted file in such a program. The settings `diff.tool` and `merge.tool` name the program.

Git already knows a list of programs by name, and you can print it:

```console
$ git difftool --tool-help
'git difftool --tool=<tool>' may be set to one of the following:
		vimdiff          Use Vim
		vscode           Use Visual Studio Code (requires a graphical session)

The following tools are valid, but not currently available:
		araxis           Use Araxis Merge (requires a graphical session)
		bc               Use Beyond Compare (requires a graphical session)
```

(Shortened: the second list is longer. The first list holds the tools Git found on this computer.)

So on today's Git, two settings are enough:

```console
$ git config diff.tool vscode
$ git config merge.tool vscode
```

You can also spell out the command yourself. This works on every Git version, and it is the way to add a tool Git does not know:

```console
$ git config difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'
$ git config mergetool.vscode.cmd 'code --wait --merge $REMOTE $LOCAL $BASE $MERGED'
```

- `difftool.vscode.cmd` is the command for the tool named `vscode`. The name in the middle is the one `diff.tool` points to.
- `$LOCAL` and `$REMOTE` are placeholders. Git replaces them with the old and the new version of the file each time it runs the command. For a merge, `$BASE` is the version both sides started from, and `$MERGED` is the file the result goes into.
- `--wait` has the same job as before: Git waits until you close the tab.

:::careful
Use **single quotes** around the command. In double quotes the shell replaces `$LOCAL` and `$REMOTE` itself, before Git sees them. They are empty in your shell, so Git stores a command with the file names missing, and reports no error:

```console
$ git config difftool.vscode.cmd "code --wait --diff $LOCAL $REMOTE"
$ git config difftool.vscode.cmd
code --wait --diff
```
:::

With the tool set, `git difftool` asks before each file:

```console
$ git difftool README.md

Viewing (1/1): 'README.md'
Launch 'vscode' [Y/n]?
```

Press Enter and the two versions open side by side in VS Code. `git difftool -y` skips the question. `git difftool --staged` and `git difftool main hours` take the same arguments as `git diff` ([Read any diff](lesson:diffs-in-depth)).

After a merge that stopped on a conflict, `git mergetool` opens each conflicted file in VS Code's merge editor. Save the result and close the tab, and Git stages the file for you.

### When it goes wrong

Three messages you can meet while you connect Git and an editor.

```console
$ git commit
Aborting commit due to empty commit message.
```

Git read the message file before you wrote in it, because the editor command ended at once. The `--wait` is missing. Set `git config core.editor "code --wait"` and commit again; your changes are still staged.

```console
$ git commit
error: cannot spawn nosucheditor: No such file or directory
error: unable to start editor 'nosucheditor'
Please supply the message using either -m or -F option.
```

Git could not find the program named in `core.editor` (here a made-up name). For VS Code this means the `code` command is not installed for the terminal: on macOS, open VS Code's Command Palette and run "Shell Command: Install 'code' command in PATH"; on Windows, install VS Code again with "Add to PATH" ticked. Until then, `git commit -m "..."` works without an editor.

```console
$ git difftool README.md
git config option diff.tool set to unknown tool: vscod
Resetting to default...
```

(Shortened: Git goes on to list the tools it will try instead.)

`diff.tool` names a tool Git does not know and that has no `difftool.<name>.cmd` of its own: here, a typo. Git then tries another tool, often Vim's. Leave Vim with `:qa` and Enter, check the name with `git difftool --tool-help`, and set it again.

## Under the hood

"Must know" matched buttons with commands. This layer shows that the match is literal: these tools start Git, or read the same files Git reads, and you can watch them do it.

### A GUI starts Git and reads its answer

VS Code and the JetBrains IDEs contain no Git of their own. They run the `git` program installed on your computer and turn its text output into lists and colours. That is why VS Code asks you to install Git first, and why Pro Git notes the same for JetBrains. GitHub Desktop is the exception: it brings its own copy of Git, so its version can differ from the one in your terminal.

You can read along. In VS Code, open the Output panel (View, then Output) and pick "Git" from the list in its corner. Every click in the Source Control view adds the Git command it ran. JetBrains IDEs have the same thing as the "Console" tab of their Git window. When a button surprises you, the answer is in that log.

Because every tool works on the one `.git` folder, a setting you make with `git config` also holds for the GUI's commands. A local `user.name` ends up in commits you make with the Commit button.

### How a prompt knows your branch

A Git-aware prompt is a small function that runs before every prompt and asks the repository one question. The current branch is written in a file:

```console
$ cat .git/HEAD
ref: refs/heads/main
```

Pro Git's setup for Bash is three lines in `~/.bashrc`, the file Bash runs each time it starts:

```console
. ~/git-prompt.sh
export GIT_PS1_SHOWDIRTYSTATE=1
export PS1='\w$(__git_ps1 " (%s)")\$ '
```

- The first line loads `git-prompt.sh`, a script from Git's own source code (in the folder `contrib/completion`). It defines the function `__git_ps1`.
- `PS1` is the variable that holds Bash's prompt. `\w` prints the current folder, `\$` prints the `$`, and `__git_ps1 " (%s)"` prints the branch in brackets, or nothing outside a repository.
- `GIT_PS1_SHOWDIRTYSTATE=1` adds marks for uncommitted changes.

Tab completion is set up the same way: copy `git-completion.bash` from the same folder and load it in `~/.bashrc` with `. ~/git-completion.bash`. Git Bash on Windows does both for you.

### The marks after the branch name

With the options on, the prompt becomes a very short `git status`:

| Mark | Meaning | Switched on by |
|---|---|---|
| `*` | A tracked file has changes that are not staged | `GIT_PS1_SHOWDIRTYSTATE` |
| `+` | Something is staged | `GIT_PS1_SHOWDIRTYSTATE` |
| `$` | The stash holds at least one entry | `GIT_PS1_SHOWSTASHSTATE` |
| `%` | There are untracked files | `GIT_PS1_SHOWUNTRACKEDFILES` |
| `<`, `>`, `<>`, `=` | Behind, ahead of, diverged from, or equal to the [upstream](term:upstream) branch | `GIT_PS1_SHOWUPSTREAM="auto"` |

The marks are printed in the order of this table. Here `todo.txt` is staged and then edited again, `new.txt` is untracked, and one change is stashed:

```console
$ git status -sb
## main
MM todo.txt
?? new.txt
$ __git_ps1 " (%s)"
 (main *+$%)
```

`MM` gives the `*` and the `+`, `??` gives the `%`, and the `$` comes from the stash, which `git status` does not list.

The prompt also names an operation that is waiting. In the middle of a merge with a conflict:

```console
$ __git_ps1 " (%s)"
 (main *+|MERGING)
```

Each mark costs a Git command before every prompt. In a very large repository that can make the terminal slow, and the script lets you turn a mark off for one repository with a local setting:

```console
$ git config bash.showUntrackedFiles false
$ __git_ps1 " (%s)"
 (main *+$)
```

`bash.showDirtyState false` does the same for `*` and `+`. These settings only do something when the matching `GIT_PS1_...` option is on.

### How Git picks the editor

`core.editor` is one of several places Git looks. It takes the first one that has a value:

1. The environment variable `GIT_EDITOR` (a value the terminal hands to every program it starts).
2. The setting `core.editor`, where the closest level wins, as for every setting.
3. The environment variables `VISUAL`, then `EDITOR`, which other programs use too.
4. The editor Git was built with, usually Vim.

`git var GIT_EDITOR` prints the result of this search:

```console
$ git var GIT_EDITOR
vim
$ git config core.editor nano
$ git var GIT_EDITOR
nano
$ GIT_EDITOR=notepad git var GIT_EDITOR
notepad
```

### What the tool settings look like on disk

Like every setting, these are lines in a config file. After the commands from "Must know", the repository's `.git/config` has gained:

```console
$ cat .git/config
[core]
	editor = code --wait
[difftool "vscode"]
	cmd = code --wait --diff $LOCAL $REMOTE
[diff]
	tool = vscode
[merge]
	tool = vscode
[mergetool "vscode"]
	cmd = code --wait --merge $REMOTE $LOCAL $BASE $MERGED
```

(Shortened: the other `[core]` lines and the `[user]` section are left out.)

`difftool.vscode.cmd` has three parts, and the middle one, the tool's name, is written in quotes in the section line: `[difftool "vscode"]`. The name is free. `diff.tool` only has to use the same one.

## Advanced

### The prompt in Zsh

Zsh has its own way to read a repository, called `vcs_info`. Pro Git's lines for `~/.zshrc` put the branch name at the right edge of the terminal:

```text
autoload -Uz vcs_info
precmd_vcs_info() { vcs_info }
precmd_functions+=( precmd_vcs_info )
setopt prompt_subst
RPROMPT='${vcs_info_msg_0_}'
zstyle ':vcs_info:git:*' formats '%b'
```

`RPROMPT` is the right-hand prompt; use `PROMPT` to have the branch on the left. `%b` stands for the branch name.

Zsh's completion does more than Bash's: when several commands match, it lists them with a short description of each, and you move through the list with Tab. `git-prompt.sh` works in Zsh as well, if you prefer its marks. Add-on collections such as oh-my-zsh come with ready-made Git prompts.

### posh-git for PowerShell

PowerShell gets its Git prompt and completion from posh-git. Pro Git's steps:

```text
> Install-Module posh-git -Scope CurrentUser -Force
> Import-Module posh-git
> Add-PoshGitToProfile -AllHosts
```

The first line downloads posh-git for your user. The last one adds the import to your PowerShell profile, the script that runs when PowerShell starts. On Windows, PowerShell must be allowed to run scripts first; the book sets the execution policy to `RemoteSigned` for that.

The posh-git prompt shows the branch in square brackets, then counts of added, changed and removed files, first for the staging area and then for the working tree. Its README explains every symbol.

### More history tools inside VS Code

- **Source Control Graph**: a drawn history under the Source Control view, like `gitk --all`.
- **Timeline** (in the Explorer view): the commits that changed the open file, like `git log -- <file>`.
- **Pull requests**: Pro Git points to GitHub's extension, "GitHub Pull Requests", for reviewing them inside the editor.

### Use a tool once, without a setting

`git difftool --tool=vscode` (or `-t vscode`) picks the tool for one command. `git difftool -d` compares whole folders in one go instead of file by file, for tools that can show a folder diff.

To stop the "Launch 'vscode' [Y/n]?" question for good in a repository, set `git config difftool.prompt false`.

### The backup files of `git mergetool`

`git mergetool` keeps a copy of the conflicted file as `<file>.orig`. These copies show up as untracked files. `git config mergetool.keepBackup false` stops Git from leaving them behind.

### Older tools in the book

Pro Git's appendix was written over several years, and a few details have aged. It lists Visual Studio's Git menus as they were in 2019, and older printings have a section on the Atom editor, which was shut down in 2022. The ideas carry over; the screens do not.

## Recap

- Every tool works on the same `.git` folder. A button runs a Git command you know: `+` is `git add`, the Commit button is `git commit`, the sync arrows are `git pull` then `git push`.
- `gitk --all` draws the history and `git gui` builds commits. Use a GUI to look at diffs, stage lines and fix conflicts; use the terminal for everything rare, scripted or explained in a guide.
- A Git-aware prompt shows the branch before every command: `git-prompt.sh` in Bash (already on in Git Bash), `vcs_info` in Zsh, posh-git in PowerShell.
- `git config core.editor "code --wait"` makes VS Code Git's editor. Without `--wait`, the commit is aborted with an empty message.
- `git config diff.tool vscode` and `git config merge.tool vscode` open diffs and conflicts in VS Code with `git difftool` and `git mergetool`. Write a custom command in single quotes, so `$LOCAL` and `$REMOTE` reach Git.
