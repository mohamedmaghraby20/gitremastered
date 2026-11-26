# Coverage: switch-and-detached-head

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** moving between branches with `git switch`, what a switch does to the folder, switching with uncommitted changes, and the detached HEAD. Creating branches and what a branch is belong to `branches-are-pointers`; merging belongs to `branch-and-merge`.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 3.1 Branches in a Nutshell | Switching Branches; the diverging history; the note on `git switch` |
| Pro Git 7.7 Reset Demystified | Check It Out (checkout vs reset, with and without paths) |
| Git reference: `git-switch`, `git-checkout`, `git-reflog`, `git-restore` | `-c`, `-`, `--detach`, `--discard-changes`, `-m`, `--orphan`; the detached HEAD advice; `--source` |

## Pro Git 3.1 (Switching Branches), point by point

| Book point | In the lesson | Layer |
|---|---|---|
| `git checkout testing` moves HEAD to the branch | Yes, as `git switch`, with a compare block | Must know |
| A commit moves only the branch HEAD is on | Recalled in a Try-it; taught in `branches-are-pointers` | Must know |
| Switching back moves HEAD and reverts the files in the working directory | Yes, with a Try-it on a file one branch lacks | Must know |
| "Switching branches changes files in your working directory" (note) | Yes | Must know |
| Git will not let you switch if it cannot do it cleanly | Yes: carried vs refused, the real error, three ways out | Must know |
| Divergent history after commits on both branches | Yes, two graph blocks and a Try-it | Must know |
| `git log --oneline --decorate --graph --all` | Yes (`--decorate` is on by default today) | Must know |
| `git log` shows only the current branch by default; `--all` | Yes | Must know |
| A branch is a 41-byte file; branches are cheap | Left to `branches-are-pointers` | - |
| `git checkout -b <newbranchname>` | Yes, as `git switch -c`, with a compare block | Must know |
| From Git 2.23: `git switch`, `git switch -c`, `git switch -` | Yes | Must know |

## Pro Git 7.7 (Check It Out), point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Checkout updates all three trees, like `reset --hard` | Yes, as a table of the three areas | Under the hood |
| Checkout is working-directory safe; it keeps files you changed | Yes | Must know (rule), Under the hood (why) |
| Checkout moves HEAD itself; reset moves the branch HEAD points to | Yes, comparison table | Under the hood |
| Checkout with a path overwrites the file and does not move HEAD | Yes, as `git restore --source` with a compare block | Advanced |
| `checkout --patch` | Left out | See below |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| What a branch and HEAD are; `git branch`; `--decorate` | The lesson before | `branches-are-pointers` |
| Merging the two lines of work | The next lesson | `branch-and-merge` |
| `git stash` | Named as a way out only | `stash-and-clean` |
| `git reset` in full | Named for the comparison only | `reset-demystified` |
| Reflog in depth, `git fsck` | One short part in Advanced | `rescue-lost-work` |
| `checkout --patch` / `restore -p` | Rare; `undo-basics` mentions `-p` | `undo-basics`, `partial-staging` |
| Remote-tracking branches and `git switch <remote-branch>` guessing | Needs remotes | `remote-branches` |
| Worktrees | Pointer only | `worktrees` |

## Beyond the book

- Detached HEAD as a concept of its own: the book only meets it in passing (tags, 7.7). Content from the `git-switch` and `git-checkout` reference pages and Git's own advice text.
- `git switch --detach`, `--discard-changes`, `-m`, `--orphan`, and `git switch -c <name> <start-point>` (Git reference, `git-switch`).
- The "leaving N commits behind" warning and `git branch <name> <id>` as the fix.
- `.git/HEAD` holding `ref: refs/heads/main` or a raw commit ID (Pro Git 10.3 shows the first form).

## Challenges and quiz

- Easy, `login-on-its-own-branch`: `git switch -c login`, then commit an untracked file there; `main` must not move. Practises create-and-switch, and that an untracked file travels along.
- Medium, `blocked-switch`: the switch is refused because an uncommitted edit would be overwritten; commit it on `main`, then switch. Discarding the edit leaves the first goal unmet.
- Hard, `rescue-detached-commits`: two commits were made with a detached HEAD and left behind; find the ID (the faded stations, or `git reflog` from Advanced) and put a branch on it with `git branch rescue <id>`, staying on `main`.
- Try-its use branches and files of their own (`ideas`, `experiment`, `ideas.txt`, `todo.txt`, `experiment.txt`); they run in the easy challenge's starting state and leave `login.js` alone.
- Quiz: what a switch does to files; when Git refuses; keeping detached commits; leaving a detached HEAD.
