# Coverage: plumbing-toolkit

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** the environment variables that steer one Git command (Pro Git 10.8), `git -c` and `git -C` as their everyday neighbours, and `git replace` (Pro Git 7.13).

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 10.8 Environment Variables | Global Behavior, Repository Locations, Pathspecs, Committing, Networking, Diffing and Merging, Debugging, Miscellaneous |
| Pro Git 7.13 Replace | The whole section: the split-and-join example, `git replace <object> <replacement>`, `cat-file` on a replaced object, `refs/replace` |
| Git reference: `git-replace` | `--graft`, `--edit`, `-l` and `--format`, `-d`, `-f`; which commands do not follow replacements |
| Git reference: `git` | `-c <name>=<value>`, `-C <path>`, `--git-dir`, `--work-tree`, `--no-replace-objects`, `GIT_NO_REPLACE_OBJECTS`, `GIT_TERMINAL_PROMPT`, the trace variables |
| Git reference: `git-var`, `git-filter-branch` | Order of editor and pager choices; replacements made permanent by a rewrite |

## Pro Git 10.8, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Git reads shell environment variables to decide how it behaves | Yes, with what a variable is and how to set one | Must know |
| `GIT_EXEC_PATH`, `git --exec-path` | Yes | Must know (table), Under the hood (output) |
| `HOME` and the global configuration file | Yes | Must know |
| `PREFIX` and the system-wide file | No | Left out, see below |
| `GIT_CONFIG_NOSYSTEM` | Yes | Must know |
| `GIT_PAGER`, fallback `PAGER` | Yes, with an example | Must know, Under the hood (order) |
| `GIT_EDITOR`, fallback `EDITOR` | Yes, with `GIT_EDITOR=true` for scripts | Must know, Under the hood (order) |
| `GIT_DIR`; the upward search for `.git` | Yes, with a Try-it | Must know |
| `GIT_CEILING_DIRECTORIES` | Yes | Advanced (table) |
| `GIT_WORK_TREE`; the current folder is the working tree when only `GIT_DIR` is set | Yes, as the main trap, with real output | Must know (careful block) |
| `GIT_INDEX_FILE` | Yes, with an experiment | Must know (table), Under the hood |
| `GIT_OBJECT_DIRECTORY` | Yes | Must know (table) |
| `GIT_ALTERNATE_OBJECT_DIRECTORIES` | Yes | Advanced (table) |
| Pathspec variables (`GIT_GLOB_PATHSPECS`, `GIT_NOGLOB_PATHSPECS`, `GIT_LITERAL_PATHSPECS`, `GIT_ICASE_PATHSPECS`) | The last two | Advanced (table) |
| `git commit-tree` reads the author and committer variables first, then the configuration | Yes, with a test of variable against `-c` | Under the hood |
| `GIT_AUTHOR_NAME` / `EMAIL` / `DATE`, `GIT_COMMITTER_NAME` / `EMAIL` / `DATE` | Yes, with a predict block and a Try-it | Must know |
| `EMAIL` as a fallback address | No | Left out, see below |
| `GIT_CURL_VERBOSE` | Yes | Must know (debugging table) |
| `GIT_SSL_NO_VERIFY` | Yes, with a warning | Advanced |
| `GIT_HTTP_LOW_SPEED_LIMIT` / `TIME`, `GIT_HTTP_USER_AGENT` | Yes | Advanced (table) |
| `GIT_DIFF_OPTS`, `GIT_EXTERNAL_DIFF`, `GIT_MERGE_VERBOSITY` | Yes | Advanced (table) |
| `GIT_DIFF_PATH_COUNTER`, `GIT_DIFF_PATH_TOTAL` | No | Left out, see below |
| Trace values: `1` / `true` to the terminal, a full path to a file | Yes | Must know |
| `GIT_TRACE`, with alias expansion | Yes, real Git 2.55 output | Must know |
| `GIT_TRACE_PERFORMANCE` | Yes, real output | Must know |
| `GIT_TRACE_PACKET` | Yes, real output from a local repository | Must know |
| `GIT_TRACE_PACK_ACCESS`, `GIT_TRACE_SETUP` | Yes | Advanced (table) |
| `GIT_SSH`, `GIT_SSH_COMMAND` | `GIT_SSH_COMMAND` in Must know with the book's `-i` example; `GIT_SSH` in Advanced | Must know, Advanced |
| `GIT_ASKPASS`, `GIT_NAMESPACE`, `GIT_FLUSH` | Yes | Advanced (table) |
| `GIT_REFLOG_ACTION` | Yes, with the book's example re-run | Advanced |

## Pro Git 7.13, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Objects cannot change; `replace` makes Git pretend one object is another | Yes, explained twice (words, then the worked example) | Must know |
| Useful to change history without rebuilding it (`filter-branch`) | Yes, contrasted with a rebase | Must know |
| The example: split a repository into a recent and a historical one | In short | Under the hood |
| `git branch history`, pushing it to a second repository | In short, no network commands | Under the hood |
| The base commit made with `git commit-tree`, then `git rebase --onto` | In short; the practice projects build the same shape in their setup | Under the hood |
| Joining again: `git replace <object> <replacement>` | Yes, the book's command, and the same form on the lesson's example | Under the hood |
| The log still shows the replaced ID with the other commit's data | Yes | Must know (IDs stay), Under the hood (plain form) |
| `git cat-file -p` shows the replaced data | Yes, next to `--no-replace-objects` | Under the hood |
| The replacement is kept as a ref in `refs/replace`; it can be shared | Yes | Under the hood, Advanced (push and fetch) |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| `PREFIX` | Decided when Git is built; a student cannot usefully set it | Pro Git 10.8 |
| `EMAIL` fallback | Identity is set with `git config` in this course | `setup` |
| `GIT_GLOB_PATHSPECS`, `GIT_NOGLOB_PATHSPECS` | Glob matching is already the default; the literal variable shows the idea | Pro Git 10.8 |
| `GIT_DIFF_PATH_COUNTER`, `GIT_DIFF_PATH_TOTAL` | Only meaningful inside a custom diff program | The lesson on configuration in depth (diff tools) |
| Output of `GIT_CURL_VERBOSE` and `GIT_TERMINAL_PROMPT=0` | Needs a real server; the course rule is real output only, and challenges here use no network | Described in words |
| The network half of the book's split example (`git remote add`, `git push`, `git clone`) | No network in this lesson; the shape is rebuilt locally with a branch | `remotes` |
| The settings levels and files in detail | Its own lesson | `setup`, the lesson on configuration in depth |

## Beyond the book

- `git -c key=value` and `git -C <folder>` (Git reference, `git`): the everyday alternatives to a variable, and the `-c` / `-C` mix-up.
- `--git-dir` and `--work-tree` as option forms of `GIT_DIR` and `GIT_WORK_TREE`.
- `GIT_TERMINAL_PROMPT` (Git reference, `git`): scripts and build servers.
- `git replace --graft`, `--edit`, `-l --format`, `-d`, `-f` (Git reference, `git-replace`). The book only shows the plain form; `--graft` is what people use for this job today.
- `git --no-replace-objects` and `GIT_NO_REPLACE_OBJECTS`.
- Which commands ignore replacements (Git reference, `git-replace`), and that `git filter-branch` makes them permanent (Git reference, `git-filter-branch`).
- `export` / `unset` and the PowerShell form: how long a variable lasts.

## Challenges and quiz

- Easy, `release-bot`: commit a staged file with the author name and date from environment variables; the repository's own `user.name` must stay as it is. The answer file records `git log -1 --format="%an %as"`.
- Medium, `site-from-outside`: a working tree in `../website` whose repository is in `../website-repo.git`. Count its branches (`GIT_DIR`) and find the edited file (`GIT_DIR` plus `GIT_WORK_TREE`) without leaving the project.
- Hard, `join-the-archive`: `git replace --graft` joins `main` to the `archive` branch. The branch `live` sits two commits below `main` and must reach the archive too without moving, which a rebase cannot do.
- Try-its use the student's own file (`todo.txt`) and own empty commits; the lesson's worked example is a different project (a shop with `old-history`) from the hard challenge.
- Quiz: `GIT_DIR` without `GIT_WORK_TREE`; author against committer; what a graft does to a teammate's branch; which trace to pick.
