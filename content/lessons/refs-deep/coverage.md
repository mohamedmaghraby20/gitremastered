# Coverage: refs-deep

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** refs on disk, read and written with plumbing: the three folders under `.git/refs`, `git update-ref`, HEAD as a symbolic ref, detached HEAD, lightweight and annotated tags (the tag object), remote-tracking refs, `packed-refs`, the reflog files, `git for-each-ref`, and the reftable backend.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 10.3 Git References | Git References, The HEAD, Tags, Remotes (all of it) |
| Git reference: `git-update-ref` | Old-value check, `-d`, `-m`, `--no-deref`, `--stdin`, logging updates |
| Git reference: `git-symbolic-ref` | Reading, `--short`, `-q`, writing HEAD |
| Git reference: `git-for-each-ref` | Default output, `--format` fields, `--sort`, `--count`, `--points-at`, `--contains`, `--merged` |
| Git reference: `git-pack-refs`, `git-gc` | `--all`, default (tags only), loose refs override packed ones, the peeled `^` lines |
| Git reference: `gitrevisions`, `git-show-ref`, `git-init`, `git-refs` | Lookup order of a short name, `<rev>^{commit}`, `show-ref --verify`, `--ref-format=reftable`, `refs migrate` |

Every console block was produced with Git 2.55 on Windows in a scratch repository built like the practice project (fixed commit dates, so the IDs are stable across the lesson).

## Pro Git 10.3, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| A ref is a file that stores an ID under a simple name; refs live in `.git/refs` | Yes, with `find .git/refs -type f` on the practice project | Must know |
| `refs/heads` and `refs/tags` folders | Yes, as a table with `refs/remotes` | Must know |
| Creating a ref with `echo <id> > .git/refs/heads/master` | Shown as what not to do, with the real "broken ref" warning | Must know |
| "You aren't encouraged to directly edit the reference files"; `git update-ref` is safer | Yes, with four concrete reasons (checks, reflog, lock, storage) | Must know |
| A branch is "a simple pointer or reference to the head of a line of work" | Yes, quoted | Must know |
| Creating a branch at an older commit with `update-ref`; its log holds only work up to that commit | Yes, `scratch` at "Add menu", with a graph and a Try-it | Must know |
| `git branch <branch>` basically runs `update-ref` | Yes | Must know |
| HEAD is a symbolic reference to the current branch | Yes | Must know |
| HEAD may hold an ID: detached HEAD after checking out a tag, commit or remote branch | Yes, with `cat .git/HEAD` before and after | Must know |
| `cat .git/HEAD` shows `ref: refs/heads/…`; switching rewrites it | Yes | Must know |
| `git commit` uses the commit HEAD's ref holds as the parent | Yes | Must know |
| `git symbolic-ref HEAD` reads; with a second argument it sets | Yes, with a predict box and a Try-it | Must know |
| `fatal: Refusing to point HEAD outside of refs/` | Yes, real output | Must know |
| The tag object: tagger, date, message, pointer; usually points at a commit | Yes, read line by line | Must know |
| Lightweight tag = `git update-ref refs/tags/v1.0 <commit>`, "a reference that never moves" | Yes | Must know |
| Annotated tag: Git creates a tag object and the ref points at it; `cat .git/refs/tags/v1.1`, `git cat-file -p` | Yes, with the practice project's `v1.0` and a Try-it on the student's own tag | Must know |
| A tag can point at any object (the GPG key blob in the Git repository, the first Linux tag) | Left out (see below) | |
| Remote refs in `refs/remotes`; `cat .git/refs/remotes/origin/master` | Yes | Must know |
| Remote refs are read-only bookmarks; HEAD never names one | Yes, shown with `git switch --detach origin/main` | Must know |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Tagging a blob or a tree (Junio's GPG key, the first Linux kernel tag) | A curiosity with no daily use; the lesson is already full | Mentioned in `objects-deep` if at all |
| How fetch and push decide which remote ref is written | Taught before this lesson | `refspecs` |
| Making and pushing tags, lightweight vs annotated in daily use | Taught before this lesson | `tags-and-releases` |
| Working in detached HEAD, keeping commits made there | Taught before this lesson | `switch-and-detached-head` |
| Using the reflog to rescue commits, how long entries are kept | Its own lesson; here only where the files are | `rescue-lost-work` |
| `HEAD@{2}`, `main@{yesterday}` and other reflog names | Its own lesson | `revision-selection` |
| Packing objects, what else `git gc` does | Its own lesson | `packfiles-gc` |
| Blob, tree and commit objects in depth | Its own lesson | `objects-deep` |
| `git replace` refs, `refs/notes`, `refs/stash` | Other kinds of ref with their own lessons | `plumbing-toolkit`, `stash-and-clean` |

## Beyond the book

- `git for-each-ref`, default output and `--format` (Git reference): the reliable way to list refs; the book reads the folder.
- `git symbolic-ref --short` and `-q`, and the real uses of writing HEAD: repairing a HEAD that names a missing branch, and the default branch of a server repository (Git reference, `git-symbolic-ref`).
- `update-ref` old-value check, `-d`, `-m`, `--no-deref`, `--stdin` transactions (Git reference, `git-update-ref`).
- The stray `.git/<name>` file from a short name, and the lookup order that makes it ambiguous (Git reference, `gitrevisions`).
- `v1.0^{commit}` to peel a tag (Git reference, `gitrevisions`).
- `packed-refs`, `git pack-refs --all`, loose over packed, the `^` lines (Git reference, `git-pack-refs`; Pro Git mentions packed refs in 10.7).
- The reflog files under `.git/logs` and their line format.
- `ORIG_HEAD`, `FETCH_HEAD`, `MERGE_HEAD`, `refs/remotes/origin/HEAD`.
- `git show-ref --verify` for scripts.
- The reftable backend: `git init --ref-format=reftable`, `git rev-parse --show-ref-format`, `git refs migrate` (Git 2.45 and later; not in the book).

## Challenges and quiz

- Easy, `branch-with-update-ref`: create the branch `experiment` at "Add menu" with `git update-ref`, staying on `main`. The lesson's main skill.
- Medium, `repair-head`: HEAD names `refs/heads/mian`, so `git status` says "No commits yet". Repair it with `git symbolic-ref` and delete a leftover branch with `git update-ref -d`. Combines the two commands.
- Hard, `tag-ref-target`: the refs are packed; write the full ID that `refs/tags/v1.0` holds (the tag object, not the commit on the `^` line) into `answer.txt`. Needs "Packed refs" from Under the hood. The setup fixes the identity and the dates of each commit and of the tag (through `GIT_AUTHOR_*` and `GIT_COMMITTER_*` variables on those lines) and turns signing off in the practice repository, so the tag object has the same ID on every computer (`b2313ef9…`); its dates differ from the lesson's console blocks, so the answer cannot be copied from the text.
- Try-its use the student's own names (`scratch`, `try-note`) and clean up after themselves, so they solve no challenge.
- Quiz: choosing `update-ref` for a script; what `symbolic-ref` leaves untouched; two IDs for an annotated tag; refs that vanished from the folder after `git gc`.
