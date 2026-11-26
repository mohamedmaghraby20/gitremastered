# Coverage: submodules

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** using a library through a submodule: add, read `.gitmodules` and the pointer, clone and initialize, update to a newer commit and commit the pointer, follow a teammate's pointer change, the detached HEAD inside a submodule, remove. Working on the library from inside the submodule is in Advanced.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 7.11 Submodules | Intro, Starting with Submodules, Cloning a Project with Submodules, Working on a Project with Submodules (all five parts), Submodule Tips, Issues with Submodules |
| Git reference: `git-submodule`, `gitmodules`, `git-config` (`protocol.<name>.allow`, `submodule.recurse`), `git-rm`, `git-clone`, `git-switch` | `status` prefixes, relative addresses, `deinit`, `sync`, `git rm` on a submodule, the file-protocol rule, `switch --recurse-submodules` |

## Pro Git 7.11, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| The problem: use another project inside yours and keep both separate | Yes | Lede, Must know |
| The two alternatives (shared library / package, copying the code) and their costs | Yes, as a table | Must know |
| `git submodule add <url>`; default folder name; a path at the end | Yes, with a Try-it and the easy challenge | Must know |
| `git status` shows `.gitmodules` and the folder entry | Yes | Must know |
| `.gitmodules` maps path to URL, is version-controlled, tells others where to clone from | Yes | Must know |
| Use a URL others can reach; override locally with `git config submodule.<name>.url`; relative URLs | Yes | Must know (one sentence), Under the hood |
| `git diff --cached` on the entry: "Subproject commit"; Git sees a commit, not the contents | Yes, as the lesson's core idea ("the pointer") | Must know |
| `git diff --cached --submodule` | Yes, as `git diff --submodule` | Advanced |
| The commit shows `create mode 160000`; what the mode means | Yes | Must know (output), Under the hood (gitlink) |
| A clone leaves the submodule folder empty | Yes, with a predict block and a Try-it | Must know |
| `git submodule init` then `git submodule update` | Yes, as `update --init`, with a compare block | Must know |
| `git clone --recurse-submodules`; `update --init --recursive` ("foolproof") | Yes | Must know |
| Update by hand: `git fetch` and `git merge` inside the submodule | Mentioned as the fallback after a detach | Advanced |
| `git diff --submodule`, `diff.submodule log` | Yes | Advanced |
| "If you commit at this point you lock the submodule into the new code" | Yes | Must know |
| `git submodule update --remote`; default branch; one submodule by name | Yes, with a Try-it and the hard challenge | Must know |
| `submodule.<name>.branch` in `.gitmodules` (`config -f .gitmodules`) | Yes | Advanced |
| `git status` shows "(new commits)"; `status.submodulesummary` | Yes | Must know, Advanced |
| `git log -p --submodule` | Yes, one line | Advanced |
| A collaborator's `git pull` fetches the submodule but does not update it; `<` markers | Yes, with real output and a careful block | Must know, Advanced (`<`) |
| `git submodule update --init --recursive` after a pull | Yes (`git submodule update`; the `--init --recursive` form in the table) | Must know |
| `git pull --recurse-submodules`, `submodule.recurse` (not for clone) | Yes | Must know |
| The URL changed upstream: `git submodule sync` | Yes | Under the hood, Advanced |
| `submodule update` leaves a detached HEAD; commits there can be lost | Yes, with two graphs and real output | Must know |
| Check out a branch in the submodule; `update --remote --merge` / `--rebase` | Yes | Advanced |
| Forgetting `--merge` detaches again; the branch still has your work | Yes | Advanced |
| Uncommitted changes block the checkout; merge conflicts inside the submodule | Yes, one paragraph | Advanced |
| Publishing: `git push --recurse-submodules=check` / `on-demand`, `push.recurseSubmodules` | Yes, with real output | Advanced; the failure a teammate sees is in When it goes wrong |
| Merging submodule changes: fast-forward case, `CONFLICT (submodule)`, resolving inside the submodule | Yes, summarised | Advanced |
| `git submodule foreach` (stash, new branch in each) | Yes | Advanced |
| Switching branches: `checkout --recurse-submodules`, `submodule.recurse` | Yes, as `git switch --recurse-submodules`, with a compare block | Advanced |
| Switching from a subdirectory to a submodule: "already exists in the index", `git rm -r` first | Yes | Must know (When it goes wrong) |
| Submodule data lives in the top project's `.git` directory, so deleting the folder loses nothing | Yes | Under the hood |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| The suggested merge resolution and `git update-index --cacheinfo 160000 …` | Rare, and Pro Git itself advises against using it | Not taught; the book link covers it |
| The combined diff (`diff --cc`) of a conflicted pointer | Needs combined diffs | `advanced-merging` |
| Useful aliases (`sdiff`, `spush`, `supdate`) | Aliases are their own topic | `config-pro` |
| The Git 2.12 behaviour when switching branches (untracked leftover folder, `git clean -ffdx`) | Old versions only; today's `--recurse-submodules` is taught | Not taught |
| `checkout -f` after replacing a subdirectory, and the empty folder that follows | Rare corner case | Not taught; the book link covers it |
| Subtree merging as an alternative | Named in Advanced with a glossary link | `advanced-merging` |
| Nested submodules in practice | `--recursive` is named; no practice | Not taught further |

## Beyond the book

- `fatal: transport 'file' not allowed` and `-c protocol.file.allow=always` (Git reference, `protocol.<name>.allow`; Git 2.38.1 and later). The book predates it. The practice servers are folders, so every submodule command that downloads needs it; a sidenote says a real URL does not.
- The `-` and `+` prefixes of `git submodule status` (Git reference).
- Removing a submodule with `git rm`, what stays in `.git/modules` and `.git/config`, and `git submodule deinit` (Git reference; the book has no removal section).
- How a relative address in `.gitmodules` is resolved against the main project's `origin` (Git reference, `git-submodule add`).
- The "not our ref" failure when a pointer names an unpushed library commit (real Git output).
- The word "gitlink" (Git glossary) and `git ls-tree` on the entry.

## Facts checked with real Git (2.55 on Windows)

| Command, with a folder as the library's server | Needs `-c protocol.file.allow=always`? |
|---|---|
| `git submodule add ../library.git` | Yes |
| `git submodule update --init` (first download) | Yes |
| `git submodule update --remote` | Yes |
| `git clone --recurse-submodules ../app.git` | Yes |
| `git clone ../app.git` (no submodules) | No |
| `git pull` (it fetches the submodule by itself) | No |
| `git submodule update` after that pull | No |

`git config --local protocol.file.allow always` in the main project does not help: the clone and the fetch run inside the submodule's repository, which does not read the main project's settings. `-c` works because Git passes it on to the commands it starts.

## Challenges and quiz

- Easy, `add-the-library`: add `../library.git` at `vendor/library` and commit. The Try-its add the same library at the default path `library`, so the path argument is the challenge's own work.
- Medium, `clone-with-a-submodule`: the folder starts empty; clone `../app.git` into it, then `update --init` (or one `clone --recurse-submodules`).
- Hard, `update-the-library`: two new library commits wait on the server; `update --remote`, count them with `git diff --submodule` (Advanced) into `answer.txt`, stage the path, commit.
- The Try-its run in the easy challenge's starting state. Its setup also builds `../app.git` (for the clone Try-it) and keeps `../library-author` (so the student can play the library's author).
- No goal can read which commit the pointer names. In the hard challenge, "working folder clean" plus the answer cover it: after `update --remote` the folder is only clean once the new pointer is committed.
- Quiz: a pin does not move by itself; the empty folder after a clone; the pull trap; a pointer to an unpushed commit.
