# Coverage: ignoring-files

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** keeping files out of Git with `.gitignore` and the other ignore lists.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 2.2 Recording Changes to the Repository | Ignoring Files (all of it) |
| Pro Git 8.1 Git Configuration | `core.excludesfile` |
| Git reference: `gitignore`, `git-check-ignore`, `git-status`, `git-rm`, `git-add` | Precedence of ignore sources, the folder re-include rule, `check-ignore -v`, `status --ignored`, `rm --cached`, `add -f` |

## Pro Git 2.2 "Ignoring Files", point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Some files should never be added or shown (generated files, logs, build output) | Yes, with three named kinds and examples per language | Must know |
| The book's example `*.[oa]` and `*~` | Yes: `*~` as editor backups, `*.[oa]` as a glob example | Must know, Under the hood |
| Log, tmp, pid folders; generated docs | Yes, as logs and temporary files | Must know |
| Set up `.gitignore` before you start | Yes | Must know |
| Blank lines and `#` comments | Yes | Must know |
| Glob patterns apply recursively | Yes ("without a slash matches anywhere") | Must know |
| Leading `/` stops recursion (`/TODO`) | Yes | Must know (pattern table) |
| Trailing `/` means a folder | Yes | Must know |
| `!` negates a pattern | Yes, plus "last match wins" | Must know |
| Globs: `*`, `?`, `[abc]`, `[0-9]` | Yes | Under the hood |
| `**` for nested folders | Yes | Must know (table), Under the hood |
| The second example file (`!lib.a`, `/TODO`, `build/`, `doc/*.txt`, `doc/**/*.pdf`) | Yes, as the pattern table | Must know |
| GitHub's `.gitignore` templates | Yes | Must know |
| Nested `.gitignore` files apply to their folder | Yes, with the Linux kernel note | Under the hood |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Removing a file from old commits | Rewriting history is its own topic | "Rewrite history" lessons |
| `git rm` in general | Its own lesson | `remove-move-files` |
| `.gitattributes` | Different job (how files are handled, not whether) | `attributes` |

## Beyond the book

- Secrets (`.env`) and why a pushed password must be changed: the most costly mistake for beginners.
- The order Git reads ignore sources, and "closer file wins" (Git reference, `gitignore`).
- `!` cannot re-include a file inside an ignored folder, and the `build/*` fix (Git reference, `gitignore`).
- `.git/info/exclude` for personal patterns (Git reference, `gitignore`).
- `git check-ignore -v`, `git status --ignored`, `git rm --cached`, `git add -f`.

## Mission and quiz

- Mission: ignore a build folder and a log file, commit `.gitignore`, end with a clean working tree.
- The Try-it uses its own file (`ideas.tmp`) and does not commit, so it does not solve the mission. The mission's hint appends with `>>`, so a `.gitignore` started in the Try-it keeps its line.
- Quiz: where `*.log` matches; a committed file added to `.gitignore`; why commit `.gitignore`.
