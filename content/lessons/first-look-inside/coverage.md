# Coverage: first-look-inside

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** a first, read-only look at the `.git` folder: what is in it, the three object kinds a beginner needs (commit, tree, blob), IDs as checksums, and a branch and HEAD as files. The student has not learned `git add` or `git commit` yet, so nothing is created; the deep versions are `objects-deep` and `refs-deep`.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 10.1 Plumbing and Porcelain | All of it: the two kinds of commands, the `.git` listing, the four core entries |
| Pro Git 10.2 Git Objects | Intro (content-addressable store, `hash-object`, `cat-file -p` / `-t`, blob), Tree Objects (reading a tree), Commit Objects (reading a commit), Object Storage (header, SHA-1, zlib, the path from the ID) |
| Pro Git 10.3 Git References | Intro (a ref is a file with an ID; "that's basically what a branch is"), The HEAD (a symbolic reference to the current branch) |
| Git reference: `git-cat-file`, `git-rev-parse`, `git-ls-tree`, `git-hash-object`, `git-count-objects` | `cat-file -s`, `<rev>:<path>`, `rev-parse --short` / `--abbrev-ref` / `--show-toplevel` / `--git-dir`, `ls-tree -r`, `hash-object --stdin`, `count-objects -v` |

## Pro Git 10.1, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Plumbing vs porcelain commands | Yes, with where the names come from | Must know |
| Plumbing is for scripts and for seeing how Git works | Yes | Must know |
| `git init` creates `.git`; copying it copies nearly everything | Yes ("this folder is the repository") | Must know |
| The listing of a fresh `.git` | Yes, as the practice project's real listing (it also has `index`, `logs`, `COMMIT_EDITMSG`) | Must know |
| `description`, `config`, `info`, `hooks` | Yes, one line each | Must know |
| The four core parts: `HEAD`, `index`, `objects`, `refs` | Yes, as a table; `index` is named and left to `three-areas` | Must know |

## Pro Git 10.2 and 10.3 (intro parts), point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Git is a content-addressable filesystem: content in, key out | Yes | Under the hood |
| `git hash-object`, `--stdin`, `-w` | Yes: same content gives the same ID, one changed character gives a new one; `-w` in one sentence | Under the hood |
| The object's path: 2 characters for the folder, 38 for the file | Yes, with the project's real files | Under the hood |
| `git cat-file -p` and `-t` | Yes, with Try-its on a commit, a tree and a blob | Must know |
| A blob stores content only, not the file name | Yes, with a predict block | Must know |
| A tree lists mode, type, ID and name; subfolders are trees | Yes, two levels deep | Must know |
| A commit holds a tree, parents, author, committer and message | Yes, read line by line | Must know |
| Following commit → tree → blob | Yes, as the lesson's main worked example | Must know |
| The header (`blob <size>` + zero byte) and SHA-1 | Yes | Under the hood |
| Objects are compressed with zlib | Yes | Under the hood |
| A ref is a file under `.git/refs` holding an ID | Yes, with `cat .git/refs/heads/main` | Must know |
| "That's basically what a branch in Git is" | Yes, with the common wrong idea corrected | Must know |
| HEAD is a symbolic reference to the current branch (`ref: refs/heads/…`) | Yes, with `cat .git/HEAD` | Must know |
| You aren't encouraged to edit ref files by hand | Yes, as the Careful block for all of `.git` | Must know |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Building trees and commits by hand (`update-index`, `write-tree`, `read-tree`, `commit-tree`) | Needs staging first; too deep for a first look | `objects-deep` |
| The Ruby walk-through of object storage | The idea is covered in words; the code is for the deep lesson | `objects-deep` |
| `git update-ref`, `git symbolic-ref` | Writing refs is not for beginners | `refs-deep` |
| Tags as refs and the tag object; remote refs | Need tags and remotes first | `refs-deep`, `tags-and-releases`, `remote-branches` |
| A detached HEAD (HEAD holding an ID) | Needs switching | `switch-and-detached-head` |
| The index file's format | The staging area has its own lesson | `three-areas` |
| Packfiles and `packed-refs` | One paragraph in Advanced only | `packfiles-gc` |
| `git log` and its options | Only `--oneline` is used, as a way to get an ID | `reading-history` |

## Beyond the book

- `git rev-parse HEAD`, `--short`, `--abbrev-ref`, `--show-toplevel`, `--git-dir` (Git reference, `git-rev-parse`): the safe way to ask "where am I?" instead of reading ref files.
- `<commit>:<path>` to name a file inside a commit (Git reference, `gitrevisions`).
- `git cat-file -s`, `git ls-tree -r`, `git count-objects -v`.
- Why an ID that depends on the parent's ID protects history.
- Minimum length of a short ID (four characters) and the error for a shorter one.

## Challenges and quiz

- Easy, `name-the-kind`: `git cat-file -t` on a given ID. The ID is the tree of `recipes/`, which is the same on every computer because trees and blobs hold no names or dates.
- Medium, `find-the-parent`: read the commit `main` points at and take its parent line. Checked with `answer-is-commit`, so any commit IDs work.
- Hard, `deleted-ingredient`: a file deleted in a later commit is read from an old commit by walking commit → tree → tree → blob, or with `<commit>:<path>` from the Advanced layer.
- All three are answer challenges: the skill only reads. `answer.txt` is listed in `.git/info/exclude`.
- Try-its only look (`ls`, `cat`, `git cat-file`, `git rev-parse`), so they change nothing and cannot solve a challenge. The blob and tree IDs printed in the lesson match the student's; the commit IDs do not, and the text says so.
- Quiz: what a branch is on disk; same content, same blob ID; which objects a one-file change creates; the right command for "the commit I am on".
