# Coverage: objects-deep

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** writing objects by hand. `first-look-inside` read commits, trees and blobs and named the header, SHA-1, zlib and the object path in a few lines. This lesson builds each object with plumbing (blob, tree, nested tree, commit with a parent), points a branch at the result, and then takes one object file apart step by step. Refs get one command (`git update-ref`); the rest is `refs-deep`.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 10.2 Git Objects | All of it: intro (content-addressable store, `hash-object`, `cat-file`), Tree Objects, Commit Objects, Object Storage |
| Pro Git 10.3 Git References | One command only: `git update-ref refs/heads/<branch> <commit>` |
| Git reference: `git-hash-object`, `git-cat-file`, `git-update-index`, `git-write-tree`, `git-read-tree`, `git-commit-tree`, `git-ls-tree`, `git-update-ref`, `git-init`, `git-rev-parse`, `gitrevisions` | `hash-object -t`; `cat-file -s` / `-e` / `--batch-check --batch-all-objects`; `--cacheinfo <mode>,<object>,<path>`; `write-tree --prefix`; `read-tree <tree-ish>`; `commit-tree -m` / `-F` / several `-p`; `ls-tree -r` / `-l` / `--name-only` / `-d`; `init --object-format`; `rev-parse --show-object-format`; `<rev>^{tree}` |

## Pro Git 10.2, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Git is a content-addressable filesystem: a key-value store | Yes, as "hand in content, get a key; hand in the key, get content" | Must know |
| A new repository has an empty `objects` folder (`find .git/objects -type f`) | Yes, the practice project starts empty | Must know |
| `git hash-object -w --stdin`; what plain `hash-object`, `-w` and `--stdin` each do | Yes, with a Try-it that runs it without and with `-w` | Must know |
| The 40-character SHA-1 of content plus header | Yes: named in Must know, taken apart in Under the hood | Must know, Under the hood |
| One file per object; 2 characters for the folder, 38 for the file | Yes | Must know, Under the hood |
| `git cat-file -p` | Yes (also `-t`, `-s` as a table with when to use each) | Must know |
| Simple version control: two versions of a file, restored with `cat-file -p > file` | Yes, with `diary.txt` | Must know |
| Remembering IDs is not practical; the file name is not stored; the type is "blob" | Yes, as the two problems the tree solves | Must know |
| `git cat-file -t` | Yes | Must know |
| Trees solve file names and grouping; like a simplified UNIX filesystem | Yes, in plain words (a tree is a folder listing) | Must know |
| A tree entry has mode, type, ID and name; a subfolder is another tree | Yes | Must know |
| `master^{tree}` and the shell notes (CMD, PowerShell, zsh) | Yes, as `'main^{tree}'` with the advice to keep the quotes | Must know |
| Git makes trees from the staging area | Yes | Must know |
| `git update-index --add --cacheinfo`; why `--add`, why `--cacheinfo` | Yes, piece by piece in a table | Must know |
| Modes `100644`, `100755`, `120000`; other modes for folders and submodules | Yes, as a table with `040000`; the submodule mode is left to the submodules lesson | Must know |
| `git write-tree`; no `-w` needed | Yes | Must know |
| A second tree with a new version and a new file (`update-index --add <file>`) | Yes | Must know |
| `git read-tree --prefix` to nest a tree | Yes, as the `backup` folder | Must know |
| The three data-model pictures | In words and tables: the three trees and what each holds; "stored once, reached twice" | Must know |
| Commits answer who, when and why; `git commit-tree` | Yes | Must know |
| "You will get a different hash value" | Yes, in bold, with the reason | Must know |
| The commit format: tree, parents, author, committer, blank line, message | Yes | Must know |
| Commits with `-p`; `git log` on the last ID shows a real history | Yes (`git log --oneline <id>`) | Must know |
| "This is essentially what Git does when you run `git add` and `git commit`" | Yes, as a table mapping porcelain to plumbing, with the "a commit stores changes" wrong idea corrected | Must know |
| Objects are "initially" stored as separate files | Yes, with a pointer to packfiles | Under the hood |
| Object storage: header (`blob <size>` + zero byte) | Yes, step 1 | Under the hood |
| SHA-1 over header + content; matches `git hash-object` | Yes, step 2, with `printf … \| sha1sum` in place of Ruby | Under the hood |
| zlib compression | Yes, step 3, shown by uncompressing a real object with Perl | Under the hood |
| The path from the ID | Yes, step 4 | Under the hood |
| All objects are stored the same way; tree and commit content has a fixed format | Yes, with the tree entry layout (which explains the 37-byte size) and a checksum of a real commit | Under the hood |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Reading a commit, a tree and a blob step by step | Already taught; only named here | `first-look-inside` |
| The Ruby session (`irb`, `Digest::SHA1`, `Zlib::Deflate`, writing the file by hand) | Students have Git Bash, not Ruby. The same four steps are shown with `printf`, `sha1sum` and Perl, and writing the object file is `hash-object -w` | This lesson, Under the hood |
| `git log --stat` on the hand-made history | `--oneline` shows the same point in three lines | `reading-history` |
| The book's 10-object listing with comments | Replaced by the table of three trees and by `cat-file --batch-check --batch-all-objects` | This lesson, Advanced |
| `git symbolic-ref`, HEAD, tags and remotes as refs; `update-ref` options | Refs have their own lesson | `refs-deep` |
| The tag object | One paragraph in Advanced only | `refs-deep` |
| Packfiles, loose vs packed objects, what happens to unreachable objects | One pointer only | `packfiles-gc` |
| Mode `160000` (a submodule entry) | Needs submodules | the submodules lesson |
| The index file's own format; a temporary index (`GIT_INDEX_FILE`) | Not needed to build a commit | Not in the course |

## Beyond the book

- The comma form of `--cacheinfo` (Git reference, `git-update-index`), with a `compare` block for the book's three-value form.
- `git read-tree HEAD` to put the staging area back after building a commit for another branch (Git reference, `git-read-tree`). The hard challenge needs it.
- `git commit-tree -m` / `-F` and two `-p` for a merge (Git reference, `git-commit-tree`).
- `git ls-tree -r` / `-l` / `--name-only` / `-d` (Git reference, `git-ls-tree`).
- `git cat-file -e` and `--batch-check --batch-all-objects`; `git hash-object -t` and its format check.
- Checking a commit's ID with `sha1sum` (follows from the book's "all objects are stored the same way").
- SHA-256 repositories: `git init --object-format=sha256`, `git rev-parse --show-object-format` (Git reference, `git-init`, `git-rev-parse`, and the hash function transition document). The book only knows SHA-1.
- The trap `git update-ref main2 <id>` writing `.git/main2` (real behaviour of Git 2.55), in "When it goes wrong".

## Challenges and quiz

- Easy, `blob-id-of-text`: `echo 'version 1' | git hash-object --stdin`, the book's own example, checked with `answer-is` against `83baae6…`. The project is an empty repository, which is also the starting state the Try-its need.
- Medium, `tree-of-a-commit`: find an older commit, then the tree it points at (`git cat-file -p` or `<commit>^{tree}`). Tree IDs hold no names or dates, so the answer is the same on every computer (`core.autocrlf` is off).
- Hard, `commit-by-hand`: the full chain `hash-object -w`, `update-index --add --cacheinfo`, `write-tree`, `commit-tree -p`, `update-ref`, then `git read-tree HEAD` from Advanced so `git status` is clean. Goals check the branch, its newest message, its parent, that `main` and HEAD did not move, and the clean status. No goal can prove that only plumbing was used; the brief asks for it.
- All console blocks are real output of Git 2.55. Blob and tree IDs match what the student gets; commit IDs do not, and the text says so in bold.
- Try-its use `diary.txt`, `todo.txt` and the branch `main` in the empty project; the hard challenge uses `hand.txt` and the branch `plumbing` in another project, so following the lesson solves no challenge.
- Quiz: identical files share a blob; a commit no branch points at; the tree holds what was staged when it was written; a rename makes a new tree but no new blob.
