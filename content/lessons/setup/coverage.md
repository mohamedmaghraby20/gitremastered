# Coverage: setup

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** getting Git onto a computer, the first-time settings (identity, editor, default branch name), the three configuration levels, and Git's built-in help.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 1.4 The Command Line | All of it |
| Pro Git 1.5 Installing Git | Linux, macOS and Windows installers (not installing from source) |
| Pro Git 1.6 First-Time Git Setup | All of it |
| Pro Git 1.7 Getting Help | All of it except the IRC channels |
| Git reference: `git-config`, `git-help`, `git-commit` | `--show-scope`, `--unset`, `--edit`, `-c`, `help -a` / `-g`, `GIT_AUTHOR_NAME` |

## Pro Git 1.4 to 1.7, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| The command line runs all Git commands; GUIs only a part | Yes | Must know |
| Knowing the command line lets you work out a GUI, not the other way round | Yes | Must know |
| Everyone has the command-line tools | Yes | Must know |
| You should know how to open a terminal | Not needed: the app's terminal is on screen | Must know (one sentence) |
| Install on Linux with `dnf` or `apt` | Yes | Must know (table) |
| Install on macOS by running `git --version` (Xcode tools), or the installer | Yes, the first way | Must know (table) |
| Install on Windows: Git for Windows from git-scm.com | Yes, plus what Git Bash is | Must know (table) |
| Update even if Git is already installed; Git keeps backwards compatibility | Yes | Must know |
| `git config` and its three files (system, global, local) | Yes | Must know (levels), Under the hood (files) |
| `--system`, `--global`, `--local`; local is the default and needs a repository | Yes | Must know |
| Each level overrides the previous one | Yes, with a worked example and a predict block | Must know |
| Windows file locations (`$HOME`, `C:\ProgramData\Git\config`) | Yes for the two a student meets; the ProgramData file is left out | Under the hood |
| `git config --list --show-origin` | Yes, with real output | Must know |
| Identity: `user.name`, `user.email`; baked into every commit | Yes | Must know; why it cannot change is in Under the hood |
| Override the identity per project by leaving out `--global` | Yes, with a Try-it and the easy challenge | Must know |
| `core.editor`; the default editor; full path on Windows | Yes; the full-path Notepad++ example is replaced by `code --wait`, `nano`, `notepad` | Must know |
| Warning: an unset editor leads to confusing states | Yes, as "Git Bash opens Vim" | Must know |
| `init.defaultBranch main` (Git 2.28 and later) | Yes | Must know |
| `git config --list`; a key can appear more than once, the last one wins | Yes | Must know |
| `git config <key>` | Yes | Must know |
| `git config --show-origin <key>` | Yes | Must know |
| `git help <verb>`, `git <verb> --help`, `man git-<verb>` | Yes; `man` is in Advanced | Must know, Advanced |
| Help works offline | Yes, and in the quiz | Must know |
| `git <verb> -h` for the short list | Yes, with real output | Must know |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Installing from source (1.5) | Rare for a learner; needs build tools | Not taught; the book link covers it |
| The `C:\ProgramData\Git\config` file and `git config -f` | An edge of Windows installs | `config-pro` |
| IRC help channels (1.7) | Not how most learners look for help today | Not taught |
| Aliases, colors, conditional includes, diff and merge tools | Deeper configuration | `config-pro` |
| Line endings in depth (`core.autocrlf`, `.gitattributes`) | Mentioned once in Advanced, so the Windows warning is not a mystery | `config-pro`, `attributes` |
| SSH keys and credentials | Belong with GitHub | `github-account-ssh` (phase 6) |

## Beyond the book

- The unquoted-name trap: `git config user.name Ada Lovelace` stores only `Ada`, with no error (checked on Git 2.55).
- Git stores a misspelled key such as `user.nmae` without a warning (checked on Git 2.55).
- `--show-scope`, `--unset`, `--edit`, `git -c`, and `GIT_AUTHOR_NAME` (Git reference).
- Where `git help` opens on each system (browser on Windows, the terminal elsewhere).
- What a config file looks like inside, section by section.

## Practice and the student's real settings

- Must know asks the student to set the real global `user.name` and `user.email`, once, and to skip it when a name is already set. This is the real first-time setup.
- The `core.editor` and `init.defaultBranch` global commands are shown, not required. The Try-its and all challenges use the practice repository's local settings only.
- Config changes do not move anything in the picture; the first Try-it says so.

## Challenges and quiz

- Easy, `work-identity`: give one repository its own `user.name` and `user.email` (local level, quotes around the name).
- Medium, `editor-with-a-flag`: fix a local `core.editor` whose value needs a space, so it must be quoted.
- Hard, `build-bot-name`: find which level sets an unwanted name with `--show-scope` (Advanced layer), write the level into `answer.txt`, then set the right identity.
- No goal asks for a global change, and no goal depends on a local value being unset (the standard setup lines may or may not set a local name).
- Quiz: local hides global only in one repository; committing with no identity; help offline; a misspelled key.

## Output edited for print

Two outputs are real but had personal details replaced: the home folder path in `--show-origin` (shown as `C:/Users/ada/.gitconfig`) and the machine name in "unable to auto-detect email address" (shown as `ada@laptop.(none)`). Long lists are shortened and say so.
