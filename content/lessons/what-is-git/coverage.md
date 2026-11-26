# Coverage: what-is-git

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** the first lesson of the course. What version control is, why Git is distributed, and the four ideas of Pro Git 1.3 (snapshots, local operations, integrity, only adds data), with a preview of the three areas. The student only looks at a ready-made history; no command is taught for keeps.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 1.1 About Version Control | What version control is; local, centralized and distributed systems |
| Pro Git 1.2 A Short History of Git | Origin in 2005, the design goals |
| Pro Git 1.3 What is Git? | Snapshots, Not Differences; Nearly Every Operation Is Local; Git Has Integrity; Git Generally Only Adds Data; The Three States |
| Git reference: `git-log`, `git-show`, `git-ls-tree`, `hash-function-transition` | `log --oneline`, `show --stat`, `ls-tree`, SHA-256 repositories |

## Pro Git 1.1, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| What version control is; what it lets you do (revert files, compare, see who changed what, recover) | Yes | Must know |
| Works for nearly any file type | Yes, one sentence | Must know |
| Copying files into dated folders, and why it fails | Yes, as the lede and the three failures | Must know |
| Local VCS (RCS) | Yes, in the table; RCS named | Must know, Advanced |
| Centralized VCS (CVS, Subversion, Perforce): benefits and the single point of failure | Yes; admin benefits left out | Must know, Advanced |
| Distributed VCS: every clone is a full backup | Yes | Must know |
| Several remotes, hierarchical workflows | Pointer only | "Team workflows" |

## Pro Git 1.2

| Book point | In the lesson | Layer |
|---|---|---|
| Linux kernel, BitKeeper, 2005 | Yes, short, BitKeeper not named | Must know (sidenote) |
| Design goals: speed, simple design, non-linear development, fully distributed, large projects | Yes | Must know (sidenote) |

## Pro Git 1.3, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Other systems store deltas; Git stores snapshots | Yes, with a worked table and the wrong idea "Git wastes space" | Must know |
| Unchanged files are links to the stored file | Yes; shown with `git ls-tree` | Must know, Under the hood |
| Most operations need only local files; history is read from the local database | Yes, with a predict block | Must know |
| Work offline, commit, upload later | Yes | Must know |
| Everything is checksummed; SHA-1, 40 hex characters | Yes | Must know; SHA-1 named in Advanced |
| Git stores everything by the hash of its content, not by file name | Yes | Must know, Under the hood |
| Git generally only adds data; hard to lose committed work; uncommitted changes can be lost | Yes, with a careful block | Must know |
| The three states (modified, staged, committed) and the three sections | Preview only: the three areas named | Must know; taught in `three-areas` |
| The basic workflow (modify, stage, commit) | One sentence | Taught in `three-areas` |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| The three file states in detail | Its own lesson | `three-areas` |
| The command line vs. GUIs (1.4), installing (1.5), first-time setup (1.6), help (1.7) | Next lesson | `setup` |
| What is inside `.git`: objects and refs | Pointer only | `first-look-inside` |
| Branches and HEAD | Named in one sentence, because the picture shows them | "Branching" module |
| Talking to servers | Pointer only | "Remotes" module |

## Beyond the book

- `git log --oneline` and `git show --stat` as "looking only" commands, so the first lesson already touches a real repository. Both are taught properly in `reading-history`.
- `git ls-tree` to show that snapshots share unchanged content (Pro Git shows the same idea in 10.2).
- SHA-256 repositories (Git docs, hash function transition); where Git fits badly (large binaries, LFS).
- The pager: the most common "I am stuck" of a first session.

## Challenges and quiz

- Easy, `count-the-commits`: count the commits with `git log --oneline`. An answer challenge; this is also the starting state for the Try-its.
- Medium, `who-added-the-soup`: no message names the file, so the student opens commits with `git show --stat` to find the one that added `soup.md`.
- Hard, `last-seen-shopping-list`: a commit deleted a file; the student uses "Git only adds" and "every commit is a snapshot" to name the newest commit that still holds it. The hints point to `git ls-tree` in Under the hood.
- Try-its change nothing, so they cannot solve a challenge.
- Quiz: snapshot vs. differences; what needs the network; integrity; a committed deletion.
