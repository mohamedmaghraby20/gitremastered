# Coverage: checkpoint-under-the-hood

The checkpoint of the Under the hood module. For course reviewers; the app does not show this file.

**Scope:** a review page and three challenges without hints. It teaches nothing new: every row of the cheat sheet repeats something one of the module's four lessons taught, and each challenge needs commands from at least two of them. It is the proof for course outcome O1 (explain Git's model and predict what a command does to it).

**Sources**

The checkpoint has no sources of its own. It draws on the four lessons, which draw on Pro Git 10.1 Plumbing and Porcelain, 10.2 Git Objects, 10.3 Git References, 10.4 Packfiles, 10.7 Maintenance and Data Recovery, 10.8 Environment Variables and 7.13 Replace.

## Cheat sheet, table by table

| Table | Lesson it repeats | Where in that lesson |
|---|---|---|
| Objects: what Git stores | `objects-deep` | Must know: `hash-object`, `cat-file -p/-t/-s`, `update-index --cacheinfo`, `write-tree`, `commit-tree`, `^{tree}`; Advanced: `commit-tree -m`, `read-tree HEAD`, `ls-tree -r`, `cat-file --batch-check --batch-all-objects` |
| Three ways to name an object | `objects-deep` (`^{tree}`), `packfiles-gc` (`HEAD~2:weather.txt`), `refs-deep` (`v1.0^{commit}`) | Must know of each |
| Refs: the names for commits | `refs-deep` | Must know: `for-each-ref`, `update-ref`, `-d`, `symbolic-ref`, `rev-parse` on a tag; Under the hood: `pack-refs --all`, packed refs |
| Packfiles: how Git keeps it small | `packfiles-gc` | Must know: `count-objects -vH`, `gc`, `verify-pack -v`; Under the hood: `reflog expire --expire=now --all`, `gc --prune=now` |
| Switches: steer one command | `plumbing-toolkit` | Must know: variables for one command, `-c`, `-C`, `GIT_DIR`/`GIT_WORK_TREE`, author and committer variables, `GIT_TRACE`, `replace --graft`, `--no-replace-objects`, `replace -d` |

"Under the hood" has six short paragraphs, each from the named lesson's own Must know or Under the hood layer. "Advanced" only points forward, and names the later lessons in plain text (rescue with reflog and fsck, removing sensitive data, large repositories, hooks, GitHub Actions, the capstones).

## Left out on purpose

| Point | Why |
|---|---|
| The four storage steps (header, SHA-1, zlib, path) in detail | One line in "Under the hood"; the worked example stays in `objects-deep` |
| `git read-tree --prefix`, file modes, `hash-object -t`, SHA-256 | Detail of `objects-deep`; no challenge here needs it |
| Reflog files, `ORIG_HEAD` and friends, ref lookup order, `for-each-ref --format`, `show-ref`, `update-ref --stdin`, reftable | Under the hood and Advanced of `refs-deep` |
| `git repack`, `git prune`, cruft packs, gc settings, commit-graph | Advanced of `packfiles-gc` |
| Pager, editor, network and the long variable list; `replace --edit`; sharing replacements | `plumbing-toolkit`; only the rows a working developer reuses are in the table |
| Terminal output | A cheat sheet lists commands; the lessons show the output |

## Challenges and quiz

| Challenge | Level | Lessons it draws on |
|---|---|---|
| `blob-behind-the-tag` | easy | `refs-deep` (an annotated tag's ref holds a tag object; packed refs), `objects-deep` (commit to tree to blob, `cat-file`), `packfiles-gc` (objects are packed: ask Git, not the folder) |
| `same-commit-everywhere` | medium | `plumbing-toolkit` (all six author and committer variables), `objects-deep` (a commit's ID covers names, dates, tree and parent) |
| `branch-without-a-name` | hard | `packfiles-gc` (an unreachable object survives `git gc` for two weeks; reflog expiry), `objects-deep` (Advanced: `cat-file --batch-check --batch-all-objects`, then `cat-file -p`), `refs-deep` (`update-ref` with the full name) |

- None has hints, as the checkpoint rule asks.
- Determinism. The easy answer is a blob ID, which depends only on the file's bytes (`core.autocrlf false`, `echo` writes a line feed). The medium and hard answers are commit IDs: every commit they depend on is made with fixed `GIT_AUTHOR_*` and `GIT_COMMITTER_*` name, email and date (`+0000`), and `commit.gpgsign` and `tag.gpgsign` are set to false in the repository. All three IDs were produced with Git 2.55 and are re-checked by `pnpm lesson:check`.
- `blob-behind-the-tag`: `git hash-object menu.txt` and `HEAD:menu.txt` give the wrong blob (the file changed twice after the tag). Right ways: `git rev-parse v1.0:menu.txt`; or `cat-file -p` from tag object to commit to tree; or `git cat-file -p v1.0:menu.txt | git hash-object --stdin`.
- `same-commit-everywhere`: the brief gives the short ID `6f95517` so the student can tell a wrong value from a right one without a hint. A wrong first try is repaired by resetting the challenge; the goal "three commits" refuses a second commit stacked on a wrong one.
- `branch-without-a-name`: the setup sets `gc.pruneExpire` locally to Git's default, so a student's global setting cannot delete the commit during setup. With today's Git the lost commit sits in a cruft pack; with older Git it stays loose. `cat-file --batch-all-objects` lists it either way, and so does `git fsck --unreachable`, which a student who has read the rescue lesson may use. The answer goal stops a student from faking the branch with a new commit of the same message.
- The picture does not draw the lost commit at the start of the hard challenge; the lesson page says so under "How to read the picture".

Quiz: four questions, each across two lessons: which IDs repeat on two computers (`objects-deep`, `plumbing-toolkit`), what deleting a ref does to its commits (`refs-deep`, `packfiles-gc`), a script that reads a tag file (`refs-deep`, `packfiles-gc`, `objects-deep`), and a graft followed by `git gc` and a clone (`plumbing-toolkit`, `packfiles-gc`).
