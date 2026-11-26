# Coverage: packfiles-gc

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** how Git stores objects over time: loose objects, packfiles and deltas, measuring with `git count-objects`, packing with `git gc`, reading a pack with `git verify-pack`, and what garbage collection deletes. Pro Git 10.7 also covers data recovery and removing objects; the course map gives those to `rescue-lost-work` and `remove-sensitive-data`.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 10.4 Packfiles | The whole section |
| Pro Git 10.7 Maintenance and Data Recovery | "Maintenance" only (auto gc, limits, `packed-refs`) |
| Git reference: `git-gc`, `git-count-objects`, `git-verify-pack`, `git-repack`, `git-prune`, `git-reflog` | Options, defaults, output format, cruft packs |

All console output was produced with Git 2.55 on Windows, in a copy of the practice project (the easy challenge's setup) plus the two `numbers.txt` commits the first Try-it makes.

## Pro Git 10.4 Packfiles, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| A test repository of loose objects, listed with `find .git/objects -type f` | Yes, with the weather project (16 objects) instead of the book's 11 | Must know |
| Objects are compressed with zlib | Yes, one sentence; taught in `objects-deep` | Must know |
| Add a 22K file (`repo.rb`), change one line, and Git stores a second complete blob (`git cat-file -s`) | Yes, with `weather.txt` (about 21.7K, three versions) and the student's own `numbers.txt` | Must know |
| "Wouldn't it be nice if Git could store one in full and the second as a delta?" | Yes | Must know |
| The first format is the "loose" object format; later Git packs objects into a "packfile" | Yes, both as definitions | Must know |
| Git packs when there are too many loose objects, on a manual `git gc`, or on a push | Yes, plus fetch and clone | Must know |
| `git gc` and its output | Yes, with today's output and a line-by-line reading | Must know |
| After gc most object files are gone; a `.pack` and an `.idx` appear | Yes, with today's listing (`.rev`, `info/commit-graph` too) | Must know, Under the hood |
| Blobs no commit points at are dangling and are not packed | Yes, corrected for today's Git: they go into a cruft pack | Advanced (compare block) |
| The packfile holds the objects; the index holds offsets to seek quickly | Yes | Must know (short), Under the hood |
| Disk use halves (15K to 7K) | Yes, with the student's own numbers from `git count-objects -vH` | Must know |
| Git looks for files named and sized similarly and stores deltas | Yes | Must know, Under the hood |
| `git verify-pack -v` and how to read it | Yes, column by column, filtered to blobs first | Must know; full listing summary in Under the hood |
| The newest version is stored whole, the older as a delta, for fast access to recent content | Yes, as a predict block and worked example | Must know |
| Packs can be repacked at any time; Git does so automatically; `git gc` by hand | Yes | Under the hood, Must know |

## Pro Git 10.7 "Maintenance", point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Git runs "auto gc" now and then; most of the time it does nothing | Yes | Must know |
| What gc does: packs loose objects, consolidates packs, removes old unreachable objects | Yes | Must know (summary), Under the hood (deleting) |
| `git gc --auto` | Yes, with its empty output | Must know |
| About 7,000 loose objects or more than 50 packfiles; `gc.auto`, `gc.autopacklimit` | Yes, with the exact default 6,700 from the Git reference | Must know, Advanced (settings table) |
| gc packs refs into `.git/packed-refs` | Yes, with real output | Must know (When it goes wrong), Under the hood |
| Updating a ref writes a new file in `refs/heads`; Git checks `refs` first, then `packed-refs` | Yes, with a commit after gc | Under the hood |
| The `^` line for an annotated tag | Yes, in one sentence; full treatment in `refs-deep` | Under the hood |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Data Recovery (`git reflog`, `git fsck --full`, `git update-ref`, recovery branch) | A rescue skill with its own lesson | `rescue-lost-work` |
| Removing Objects (`git verify-pack` sorted by size, `git rev-list --objects`, `filter-branch`, `git prune --expire now`) | Needs history rewriting; the `git-verify-pack` command page shows the sort one-liner and the lesson points ahead | `remove-sensitive-data` |
| `git maintenance` (schedule, tasks) | Named only, as the brief asks | `large-repos` |
| The `curl` download of `repo.rb` from GitHub | Challenges and Try-its use no network; `seq` and a generated log give the same effect | (not needed) |
| The loose-object format and the object header | Belongs to the objects lesson | `objects-deep` |
| Tags, remote refs and `git update-ref` in `packed-refs` | Belongs to the refs lesson | `refs-deep` |
| Packs on the wire (thin packs, `git index-pack` during fetch) | Transfer details | `how-git-talks` (already written) covers the transfer |

## Beyond the book

- `git count-objects -v` and `-H`, every output line (Git reference, `git-count-objects`). The book uses `count-objects -v` only in "Removing Objects".
- Today's `git gc` output (`Enumerating objects`, `pack-reused`), the `.rev` file and `info/commit-graph` (Git 2.55 behaviour).
- Cruft packs: where unreachable objects wait today (`git-gc`, `git-repack --cruft`).
- What protects an object from deletion: refs, stash, staging area, reflog; `gc.pruneExpire`, `gc.reflogExpire`, `gc.reflogExpireUnreachable` (`git-gc`, `git-reflog`).
- `git reflog expire --expire=now --all` with `git gc --prune=now`, shown on the student's own commit, with a warning.
- `git repack` and `-a -d`, `-f`, `--window`, `--depth`; `git prune -n`; `git gc --aggressive`, `--no-prune` (Git reference).
- Multi-pack index, commit-graph and `.keep` files, named only.

## Challenges and quiz

- All three are answer challenges whose answer is a count of objects. A count depends only on the files and the number of commits (commit, tree and blob per change), never on names, dates or the operating system, so it is the same everywhere. Sizes are never asked: `git count-objects` measures them differently on Windows and Linux.
- Easy, `count-loose-objects`: read `count` from `git count-objects -v` (16).
- Medium, `pack-everything`: a repository packed earlier (16 in the pack), one later commit (3 loose) and one uncommitted line. Commit, `git gc`, read `in-pack` (22). The working tree is dirty at the start, so `working-folder-clean` needs work.
- Hard, `remove-for-real`: an abandoned commit is protected by the reflog and by a forgotten tag. The student must find both, remove them, run `git gc --prune=now` and read `in-pack` (19). With only `git gc --prune=now`, or with the tag left in place, `in-pack` stays 22 (tested with real Git). `ORIG_HEAD` does not protect the commit (tested).
- No goal check can see whether an object exists, so the object count is the proof. `commit-is-gone` only looks at HEAD's history; it is kept as a "do not bring it back" goal.
- Try-its work on the student's own `numbers.txt` and start by adding two commits, so no Try-it prints a challenge's answer. The Under the hood Try-it erases the practice project's reflog; the text says that starting a challenge rebuilds the project.
- Quiz: which version is stored whole; whether gc deletes history; reflog protection against `--prune=now`; where a new commit's objects go in a packed repository.
