# Coverage: reading-history

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** reading history with `git log` and `git show`: one entry, the pager, compact views, what a commit changed, and the filters by date, author, message, content and path. Reading a diff line by line belongs to the next lesson, `diffs-in-depth`.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 2.3 Viewing the Commit History | The whole section, including Limiting Log Output and both option tables |
| Git reference: `git-log`, `git-show`, `git-shortlog` | The pager keys, `--date`, `--follow`, `-L`, `-G`, `--all`, `--decorate`, approximate dates |
| Pro Git 1.3 What is Git? | Git Has Integrity (checksums), for "Why commits have such strange names" |

## Pro Git 2.3, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| `git log` with no arguments: newest first, checksum, author, date, message | Yes, with a part-by-part reading | Must know |
| `-p` / `--patch` shows the difference each commit introduced | Yes, with the three things needed to read it | Must know; full diff reading in `diffs-in-depth` |
| `-2` limits the number of entries | Yes (`-3`, `-n 3`) | Must know |
| `--stat` | Yes, with how to read the bar | Must know |
| `--pretty=oneline`, `short`, `full`, `fuller` | `--oneline` in Must know; `fuller` for author and committer | Must know, Under the hood |
| `--pretty=format:` and the specifier table | Yes, the five codes worth knowing, and a note that there are more | Must know |
| Author versus committer | Yes | Under the hood |
| `--graph` | One paragraph now; real use with branches | Must know, Advanced (`--graph --all`) |
| Table of common options: `--shortstat`, `--name-only`, `--name-status`, `--abbrev-commit`, `--relative-date` | `--name-only`, `--name-status` and `--date=relative` | Advanced |
| The pager shows one page at a time | Yes, with its keys and a Try-it | Must know |
| `--since` / `--until`, absolute and relative dates | Yes | Must know |
| `--author`, `--grep` | Yes, with the two-Omars trap | Must know |
| Several `--author` / `--grep`, `--all-match` | Yes | Advanced |
| `-S`, the pickaxe | Yes, with a predict block and a comparison with `--grep` | Must know |
| A path after `--` | Yes, files and folders | Must know |
| The combined example (author, dates, `--no-merges`, path) | Yes, on the practice project | Must know; `--no-merges` in Advanced |
| `--committer` | Yes | Advanced |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Every line of a diff (hunk headers, `index`, `---` / `+++`) | Its own lesson | `diffs-in-depth` |
| Branch and merge graphs | Needs branches | `branches-are-pointers`, `branch-and-merge` |
| Ranges like `main..feature`, `HEAD~2` | Needs branches and revision names | `revision-selection` |
| `git blame`, `git bisect`, `git grep` | Pointer only | `search-blame-bisect` |
| Saving a log format as an alias | Pointer only | `config-pro` |
| `%T`, `%P` and the other format codes | Rarely needed; the manual lists them | Git reference, `git-log` |
| `git clone` of the book's sample project | The practice project replaces it | `start-a-repo` teaches cloning |

## Beyond the book

- The pager and its keys (`less`): the most common place where a new student gets stuck with `git log`.
- `git show <id>` for one commit (the book introduces it later, with tags).
- A date without a time means "that day, at the current time" (Git's approximate dates): a real source of missing commits in `--since`.
- `--author` matches the `Name <email>` text and is case-sensitive; `-i` ignores case.
- An option placed after `--` is silently read as a path.
- `--follow`, `-L`, `-G`, `--all`, `--decorate`, `--date=`, `git shortlog -sn` (Git reference).
- Under the hood: log as a walk through parent links, and why fixed input gives fixed commit IDs.

## Challenges and quiz

All three challenges read the same nine-commit project and are answered in `answer.txt`. Authors, committers and dates are fixed in the setup, so the history and its commit IDs are the same on every computer.

- Easy, `count-one-author`: count Omar Haddad's commits (3). Practises `--author` and the trap of two people named Omar.
- Medium, `find-added-function`: the commit that added `applyDiscount`, a function that no longer exists. Practises `-S` and reading its result (newest on top).
- Hard, `last-change-in-october`: the last commit that changed `checkout.js` on or before 31 October. Combines `--until`, a path and `-1`, and needs the "date without a time" detail from the careful note.
- Try-its only read, so they work in every challenge's starting state and never solve one.
- Quiz: `-S` versus `--grep` versus a path; the pager; option order around `--`; why `--author` matched two people.
