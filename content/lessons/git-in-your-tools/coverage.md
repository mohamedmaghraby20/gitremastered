# Coverage: git-in-your-tools

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** Git outside the plain command line: the GUIs that ship with Git, VS Code's Source Control view mapped to commands, other editors and GitHub Desktop, Git-aware prompts and completion in Bash, Zsh and PowerShell, and VS Code as Git's editor, diff tool and merge tool.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git A1.1 Graphical Interfaces | Intro (task and workflow tools), `gitk` and `git-gui`, GitHub for macOS and Windows, Other GUIs |
| Pro Git A1.2 Git in Visual Studio | Whole section |
| Pro Git A1.3 Git in Visual Studio Code | Whole section |
| Pro Git A1.4 Git in IntelliJ / PyCharm / WebStorm / PhpStorm / RubyMine | Whole section |
| Pro Git A1.5 Git in Sublime Text | Whole section |
| Pro Git A1.6 Git in Bash | Completion, `git-prompt.sh`, the `PS1` example |
| Pro Git A1.7 Git in Zsh | `compinit`, `vcs_info`, `git-prompt.sh` in Zsh, oh-my-zsh |
| Pro Git A1.8 Git in PowerShell | posh-git, installation, profile |
| Git reference: `git-difftool`, `git-mergetool`, `git-var`, `git-config` | `diff.tool`, `merge.tool`, `difftool.<tool>.cmd`, `mergetool.<tool>.cmd`, `--tool-help`, `-y`, `-d`, `difftool.prompt`, `mergetool.keepBackup`, `git var GIT_EDITOR`, the editor search order |
| `contrib/completion/git-prompt.sh` (the script's own comments, as Pro Git advises) | The marks, `GIT_PS1_...` options, `bash.showDirtyState`, `bash.showUntrackedFiles` |

## Pro Git Appendix A, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| The terminal is Git's native place; new features arrive there first; a GUI can do nothing the command line cannot | Yes | Must know (A GUI runs the commands you know) |
| Tools are fitted to a workflow and show a part of Git; none is "better" | Yes, with a table of tool kinds | Must know |
| `gitk`: history viewer over `git log`; `gitk --all`; dots, lines, ref boxes, yellow HEAD, red uncommitted | Yes, with a Try-it and a graph | Must know |
| `git gui`: unstaged and staged lists, diff view, stage hunks or lines, commit, amend | Yes, as a table mapped to commands | Must know |
| Task-oriented vs workflow-oriented tools | Yes | Must know |
| GitHub for macOS and Windows: changes view, commit, Sync = `pull --rebase` then `push`, works with any host | Yes, updated to GitHub Desktop; the book's Sync is in a sidenote | Must know |
| GitHub client sets up name, email, credential cache, CRLF; bundles Git | Bundled Git: yes. First-run setup: left out (below) | Under the hood |
| Use another client or the command line when you want more control | Yes | Must know (sidenote, and the GUI or terminal table) |
| Other GUIs (list on git-scm.com) | Left out (below) | |
| VS Code: gutter diff, status bar (branch, dirty marks, incoming and outgoing), stage, commit, push/pull/sync, branches, conflicts, diffs | Yes, as a table mapped to commands | Must know |
| VS Code: init and clone from the editor, create tags | Left out (below) | |
| VS Code: GitHub Pull Requests extension | Yes | Advanced |
| VS Code needs Git installed | Yes | Must know, Under the hood |
| Visual Studio: built in since 2019 16.8; feature list | Yes, one table row | Must know |
| JetBrains: Git integration, dedicated view, pull requests, relies on command-line Git | Yes | Must know (table), Under the hood |
| Sublime Text 3.2: status badges, ignored files faded, branch in status bar, gutter marks, Sublime Merge | Yes, one table row (faded ignored files left out) | Must know |
| Bash: `git-completion.bash`, Tab completion of commands, options, refs | Yes | Must know (what it is), Under the hood (setup) |
| Bash: `git-prompt.sh`, `GIT_PS1_SHOWDIRTYSTATE`, the `PS1` line explained | Yes, with real `__git_ps1` output | Under the hood |
| Zsh: `compinit`, richer completion with descriptions | Yes | Must know (table), Advanced |
| Zsh: `vcs_info` lines for `RPROMPT`; `git-prompt.sh` also works; oh-my-zsh | Yes | Advanced |
| PowerShell: posh-git prompt and completion; `Install-Module`; `Add-PoshGitToProfile`; execution policy | Yes | Must know (table), Advanced |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| GitHub Desktop's first-run setup (name, email, credential cache, CRLF) | The app's screens change often; the settings themselves are taught as commands | `setup`, `github-account-ssh`, `config-pro` |
| The book's branch buttons of the old GitHub clients (macOS vs Windows) | Those two apps no longer exist | None; GitHub Desktop's own docs |
| The list of other GUI clients | A link list, not a skill | Mentioned in none; git-scm.com/downloads/guis |
| Init, clone and tags from inside VS Code | Same commands as in the terminal; no new idea | `start-a-repo`, `tags-and-releases` |
| posh-git installed from source; `PowerShellGet` repair; the scopes of the execution policy | Install details that age quickly | posh-git's README |
| `git checkout tags/vX.Y.Z` to fetch the completion scripts from Git's source | Most installs already ship the scripts (Git for Windows loads them) | None |
| How partial staging works hunk by hunk | Pointer only | `partial-staging` |
| Resolving a conflict by hand, `ours` and `theirs` in depth | Pointer only | `branch-and-merge`, `advanced-merging` |
| Config levels, aliases, the other `core.*` settings | Pointer only | `setup`, `config-pro` |

## Dated details in the book, and what the lesson does

- "GitHub for macOS" and "GitHub for Windows" with a Sync button: the lesson teaches today's GitHub Desktop and names the book's version in a sidenote.
- Visual Studio's feature list as of 2019: kept to one table row.
- The Atom section of older printings (the editor ended in 2022): named once in Advanced, not taught. The checked-out book source no longer has that file.
- "When you install Git, you also get `gitk` and `git-gui`": true on Git for Windows; flagged in a sidenote for macOS and Linux.

## Beyond the book

- The button-to-command table for VS Code, the letters `U`, `M`, `A`, `D`, the "stage all and commit" offer, Discard on an untracked file, the merge editor's "Current" and "Incoming", the Git output log, Source Control Graph and Timeline: from VS Code's Source Control documentation. These are screens, not Git output, so the lesson describes them in words and shows no invented console text.
- `core.editor "code --wait"`, and VS Code as diff and merge tool (`difftool.vscode.cmd`, `mergetool.vscode.cmd`): the commands VS Code's documentation gives; Git 2.55 also knows `vscode` as a built-in tool name (`git difftool --tool-help`).
- `git var GIT_EDITOR` and the editor search order (Git reference, `git-var`).
- The prompt marks and the per-repository settings `bash.showDirtyState` and `bash.showUntrackedFiles` (comments in `git-prompt.sh`).
- The GUI or terminal table: the course's own advice, built on Pro Git's reasons for the command line.

## Console output

All console blocks were run with Git 2.55.0.windows.3 in a scratch repository. `__git_ps1` output comes from the `git-prompt.sh` that Git for Windows installs. The `~/shop (main)$` prompt line shows the form that the book's `PS1` produces. The Zsh and PowerShell blocks are setup lines from the book (`text` blocks), not output.

## Challenges and quiz

- Easy, `editor-for-this-repo`: a local `core.editor` is Vim; change it to `code --wait` for this repository only.
- Medium, `vscode-diff-and-merge`: `diff.tool` points to Vim's tool and a VS Code command lost its placeholders; set `diff.tool`, `merge.tool` and both `cmd` settings. The single-quote trap is the real skill.
- Hard, `read-the-prompt`: read the repository state with `git status -sb` and `git stash list`, write the marks a full `git-prompt.sh` prompt shows (`*+$%`) into `answer.txt`, then turn the untracked mark off locally with `bash.showUntrackedFiles false` (Under the hood).
- All challenges change local settings and the practice repository only (decision 6). None needs VS Code to be installed: the goals read settings, they do not start the editor.
- Try-its use `todo.txt` and read-only commands, so they do not solve a challenge.
- Quiz: one shared staging area; why `--wait`; double quotes and `$LOCAL`; reading `(main *)`.
