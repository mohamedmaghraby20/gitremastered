# Coverage: config-pro

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** finding where a setting comes from (scopes, `--show-origin`, `--show-scope`), removing one (`--unset`), the settings worth knowing, aliases, a work identity with `includeIf`, plain includes, and diff and merge tools in short. The `setup` lesson already taught the three levels, identity, editor and default branch; this lesson builds on it and does not repeat its Try-its.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 8.1 Git Configuration | All of it: the review of levels, Basic Client Configuration, Colors in Git, External Merge and Diff Tools, Formatting and Whitespace, Server Configuration (the last one as a short Advanced note) |
| Pro Git 2.7 Git Aliases | All of it |
| Git reference: `git-config` | `--show-origin`, `--show-scope`, `--get-all`, `--get-regexp`, `--unset`, `--unset-all`, `--replace-all`, `--remove-section`, the subcommand forms (`list`, `get`, `set`, `unset`), "Includes" and "Conditional includes" (`gitdir`, `gitdir/i`, `onbranch`, `hasconfig:remote.*.url`), `help.autoCorrect`, `pull.rebase`, `push.autoSetupRemote`, `rerere.enabled`, the reading order of the files |
| Git reference: `git-difftool`, `git-mergetool` | `diff.tool`, `merge.tool`, `--tool`, `--tool-help` |

## Pro Git 8.1, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Three files: system, global (`~/.gitconfig` or `~/.config/git/config`), local | Yes | Must know (table), Under the hood (reading order, both global files) |
| Each level overwrites the previous one | Yes, as "a line further down wins", with real output and a predict block | Must know |
| The files are plain text and can be edited by hand | Yes | Under the hood |
| `man git-config` lists every option | Not repeated; `setup` teaches `git help config` | `setup` |
| Note: look up "Conditional includes" | Yes, taught in full with a worked example | Must know; more conditions in Advanced |
| `core.editor`, and the `VISUAL` / `EDITOR` / `vi` fallback | Yes | Must know (table) |
| `commit.template` | Yes, what it is and when; the hands-on part is in `commit-craft` | Must know (table) |
| `core.pager`, and turning it off with `''` | Yes | Must know (table) |
| `user.signingkey` | Left out, see below | |
| `core.excludesfile` | Yes, with a link to `ignoring-files`, which teaches it hands-on | Must know (table) |
| `help.autocorrect`, tenths of a second | Yes, with real output, a value table and a compare block (the book's "1 = 0.1 seconds" is no longer true) | Must know |
| `color.ui`: `auto`, `false`, `always` | Yes (`always` is left to the book) | Must know (table) |
| `color.*` and custom colors | Yes | Advanced |
| External merge and diff tools: wrapper scripts, `merge.tool`, `mergetool.<tool>.cmd`, `trustExitCode`, `diff.external` | Yes, as a settings table; the P4Merge scripts themselves are not copied | Advanced |
| `git mergetool`, `git mergetool --tool-help`, built-in tool names | Yes | Must know (short) |
| `core.autocrlf`: `true`, `input`, `false`, and who should use which | Yes, with the real warning text | Must know |
| `core.whitespace`, `git apply --whitespace`, `git rebase --whitespace=fix` | Yes, short | Advanced |
| Server configuration: `receive.fsckObjects`, `receive.denyNonFastForwards`, `receive.denyDeletes` | Named, one paragraph | Advanced |

## Pro Git 2.7, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Git does not guess a partly typed command; aliases shorten them | Yes | Must know |
| `alias.co`, `alias.br`, `alias.ci`, `alias.st` | Yes; `br` in a Try-it, `st` in the easy challenge, the others named | Must know |
| "Commands that should exist": `alias.unstage 'reset HEAD --'` | Yes, as `restore --staged`, with a compare block for the book's form | Must know |
| `alias.last 'log -1 HEAD'` | Yes; the student builds it in the easy challenge | Must know, challenge |
| Git replaces the alias with its value | Yes | Must know, Under the hood |
| `!` aliases for external commands (`alias.visual '!gitk'`) | Yes, with a real `!` example of our own and the book's named | Must know |
| The book does not use aliases in its examples | Yes, and the course follows it | Must know |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| `user.signingkey` and signed tags | Belongs with signing | `signing` |
| Building and using a commit template step by step | Taught with commit messages | `commit-craft` |
| A global ignore file, step by step | Taught with ignoring | `ignoring-files` |
| `pull.rebase` and `push.autoSetupRemote` in use | Taught where pull and push are taught; here they are named with what they do | `remotes`, `remote-branches`, `rebasing` |
| `rerere` in use | Needs a repeated conflict | `advanced-merging` |
| Line endings per file (`.gitattributes`, `text=auto`, `eol`) | The team-wide answer to line endings | `attributes` |
| The P4Merge wrapper scripts, word for word | Tied to one tool and to macOS paths; the settings they use are in Advanced | Not taught; the book link covers it |
| `color.ui always` | Rarely wanted, as the book says | Not taught |
| The `worktree` scope and `--worktree` | Only matters with several working trees | The worktrees lesson |
| Using diff and merge tools inside editors | Tool by tool | `git-in-your-tools` |

## Beyond the book

- `--show-scope`, `--get-all`, `--get-regexp`, `--unset-all`, `--replace-all`, `--remove-section` and the subcommand spelling of `git config` (Git reference; checked on Git 2.55).
- `includeIf "gitdir:~/work/"` worked through, with the trailing-slash trap and the "put it last" rule (Git reference, "Conditional includes"; the slash trap was checked on Git 2.55).
- Plain `[include]`: read in place, path relative to the including file, position decides who wins, and `--local` does not follow includes (Git reference, "Includes"; checked on Git 2.55).
- Why Git never reads config from a project's own files (safety), as a careful block.
- An alias cannot hide a built-in command; a broken alias fails only when used ("expansion of alias ... failed", real output).
- `!` aliases run in the top folder of the repository (Git reference, `alias.*`; checked).
- Today's values of `help.autoCorrect` (`prompt`, `immediate`, `never`, numbers), from the Git 2.55 reference. The `prompt` question itself is described in words, because it only appears in a real terminal.
- `push.autoSetupRemote`, `pull.rebase`, `rerere.enabled`, `init.defaultBranch` in the settings tables (Git reference).
- The `command` scope of `git -c`.

## Practice and the student's real settings

- No Try-it and no challenge changes a global setting. Every Try-it writes to the practice repository's local scope.
- The `includeIf` part edits `~/.gitconfig`, so it is marked "read, do not run" and has no Try-it. Its outputs were produced in a scratch folder with a separate home folder.
- The diff and merge tool part has no Try-it: the tools open windows, and the practice terminal has none.
- Config changes move nothing in the picture; the first Try-it says so once for the whole lesson. No `graph` block: the lesson changes no history.

## Challenges and quiz

- Easy, `two-aliases`: `alias.st` and `alias.last` locally; the second needs quotes.
- Medium, `undo-a-setup-script`: replace a wrong local value (`help.autocorrect`) and remove another (`color.ui`) with `--unset`, checked with `config-is-unset`.
- Hard, `team-settings-file`: include a tracked file with a relative `include.path` (Under the hood) and remove a stale local alias. The checks read `git config --local`, which does not follow includes, so the alias from the included file does not count as local.
- Hard, `who-sets-rebase`: find the file behind a value with `--show-origin` (answer challenge), then override it locally without touching the shared file. The new `[pull]` section lands after the `[include]` lines, so it wins (Under the hood).
- Try-its use other names (`br`, `hist`, `core.editor`) than the challenges (`st`, `last`, `lg`, `help.autocorrect`, `color.ui`, `pull.rebase`).
- Quiz: reading order in a `--show-scope` list; an alias named like a built-in command; the missing slash in `gitdir:`; unset against set.

## Output edited for print

All console blocks are real output of Git 2.55.0.windows.3, produced in a scratch folder with its own home folder and system file. The scratch paths were replaced by the persona's: `C:/Users/ada/.gitconfig`, `C:/Users/ada/.gitconfig-work` and `C:/Program Files/Git/etc/gitconfig`. `~/.gitconfig` is shown without its `[init]` and `[core]` sections in the `includeIf` example, and long files are shortened where the text says so.
