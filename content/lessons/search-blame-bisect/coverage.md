# Coverage: search-blame-bisect

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** finding things from a symptom: where a text is (`git grep`), which commit added or removed it (`git log -S`, `-G`, `-L`), who last changed a line (`git blame`), and which commit broke something (`git bisect`, by hand and with `git bisect run`).

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 7.5 Searching | The whole section: Git Grep, Git Log Searching, Line Log Search |
| Pro Git 7.10 Debugging with Git | The whole section: File Annotation, Binary Search |
| Git reference: `git-bisect` | `bisect run` and its exit codes, `skip`, `terms` / `--term-old` / `--term-new`, `old` / `new`, `log` / `replay`, the `refs/bisect/*` refs |
| Git reference: `git-blame` | `-w`, `--ignore-rev`, `--ignore-revs-file`, `blame.ignoreRevsFile`, `-M`, `-C` and its size limit, `-s`, `-e`, `-L :name`, blaming an older commit |
| Git reference: `git-grep`, `git-log` | `-i`, `-w`, `-l`, `-E`, `--or` / `--not`, `--untracked`, pathspecs; `-S` against `-G`; `-L` with line ranges |

## Pro Git 7.5 Searching, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| `git grep` searches the working directory, a committed tree or the index | Working tree and any commit or tag; how it reads a tree | Must know, Under the hood |
| `-n` / `--line-number` | Yes | Must know |
| `-c` / `--count` | Yes | Must know |
| `-p` / `--show-function` | Yes, with how to read the `=` lines | Must know |
| `--and` with several `-e` patterns | Yes, on a smaller example | Must know |
| `--break` and `--heading` | Yes | Advanced (options table) |
| Searching an old tree (`v1.8.0` in the book) | Yes, with the practice tag `v1.0` | Must know |
| Why `git grep` over `grep` or `ack`: fast, any tree | Yes, plus "tracked files only" | Must know |
| `git log -S`, the pickaxe: commits that changed the number of occurrences | Yes, with the blind spot that follows from that rule | Must know |
| `-G` for a regular expression | Yes, with a real case where `-S` and `-G` differ | Must know |
| Line log search: `git log -L :function:file` | Yes, briefly, with `-s` for the list | Must know |
| `-L` with a regex or a line range | Yes | Advanced |

## Pro Git 7.10 Debugging with Git, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| `git blame` shows the last commit that changed each line | Yes | Must know |
| `-L` to limit the lines | Yes | Must know |
| Reading the fields: ID, author, date, line number, content | Yes, field by field | Must know |
| The `^` prefix for lines from the first commit | Yes, in a Try-it and again in "How blame finds the last change" | Must know, Under the hood |
| Git does not record renames or moves; it works them out afterwards | Yes | Under the hood |
| `git blame -C` follows code copied from other files | Yes, with real before and after output | Under the hood |
| Binary search with `git bisect start`, `bad`, `good <commit>` | Yes, with a worked table, a predict block and a Try-it | Must know |
| Git checks out the middle commit; you test and answer | Yes | Must know |
| The "first bad commit" output | Yes | Must know |
| `git bisect reset` when finished, "or you'll end up in a weird state" | Yes, in the text, in the Try-it and in "When it goes wrong" | Must know |
| `git bisect start <bad> <good>` on one line | Yes | Advanced |
| `git bisect run <script>`: exit 0 is good, non-zero is bad | Yes, with the full exit code table (125 skips, 128+ stops) | Advanced |
| The script can be `make` or `make tests` | Yes (`npm test`, `make test`, `pytest`) | Advanced |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Searching the staging area with `git grep --cached` | Rare, and adds a third place to search in a lesson that is already full | Git reference, `git-grep` |
| `git log --grep`, `--author`, date filters | Already taught | `reading-history` |
| Ranges and names like `<id>^`, `HEAD~3`, `v1.0..main` | Mentioned once (`<id>^`) with a short meaning | The lesson "Point at any commit" (`revision-selection`) |
| Bisecting a history with merges, `--first-parent` | Needs branches and merges in the practice history | Git reference, `git-bisect` |
| `git bisect visualize` / `view` | Opens `gitk`, which the practice terminal does not have | Git reference, `git-bisect` |
| Writing a real test script | A matter of the project's language, not of Git | The lesson gives a one-line script and names `npm test`, `make test`, `pytest` |

## Beyond the book

- `git blame -w` and the reindent trap: the most common way blame misleads. `--ignore-rev`, `--ignore-revs-file` and `blame.ignoreRevsFile` for formatter commits (Git reference).
- "Blame shows who touched a line last, not who made the mistake."
- `-S` against `-G`, shown on a commit that edits a line without changing the count.
- `git bisect skip`, exit code 125, `--term-old` / `--term-new`, `old` / `new`, `git bisect log` and `replay` (Git reference).
- What `git bisect run` does when the command cannot be found (exit code 127 on the good commit).
- A test script for bisect must be untracked or outside the project.
- Under the hood: why bisect needs about log2(N) tests; `.git/BISECT_LOG` and `refs/bisect/*`; why `git status` and the app's banner keep saying "bisecting" after the answer is found.
- The three "When it goes wrong" cases: a bisect left open, good and bad swapped, a `-L` range past the end of the file.

## Challenges and quiz

All three challenges read the same twelve-commit project and are answered in `answer.txt`. Authors, committers and dates are fixed in the setup, so the commit IDs are the same on every computer (unless the student's Git signs commits).

The history holds two bugs on purpose, so the Try-its never solve a challenge:

| Bug | Commit | Who hunts it |
|---|---|---|
| No shipping is charged (`sh order.sh 1000` prints 1000, not 1499) | "Make the shipping fee a setting" | The lesson: the bisect Try-it in Must know and the `bisect run` Try-it in Advanced |
| Orders of two or more items get a wrong total | "Use a clearer name in cart_total" | The hard challenge, with `test-order.sh` |

The two do not disturb each other: the lesson's test uses one item under the free shipping limit, and `test-order.sh` uses two items whose total is above the limit in every commit.

- Easy, `who-added-the-coupon`: the commit that first added the text `SPRING10`. Practises `git log -S` and reading its list (newest on top). Plain blame would name the reindent commit, so it is the wrong tool here.
- Medium, `who-changed-the-discount`: the commit that last changed what line 24 of `pricing.sh` says. Combines `git grep -n` (find the line), `git blame -L` and `-w` (look past the reindent).
- Hard, `bisect-the-wrong-total`: `git bisect start HEAD v1.0`, `git bisect run sh test-order.sh`, write the ID, `git bisect reset`. Needs "Let a script do the testing" from Advanced; the goals also check that no bisect is left open and that HEAD is back on `main`.
- `test-order.sh` and `answer.txt` are listed in `.git/info/exclude`, so `git status` stays clean and the script survives every checkout.
- Quiz: `git grep` on a tag against `log -S` and blame; a formatter commit in blame; how many tests a bisect needs; why to reset before fixing.

## Notes for reviewers

- No `:::graph` block: none of these commands changes history. Bisect only moves HEAD, and the Try-it points at the live history map and the "Bisect in progress" banner for that.
- The examples show lines 14 to 20 and 30 to 35 of `pricing.sh`, never the function `cart_total` or line 24, so no printed output gives away a challenge answer.
