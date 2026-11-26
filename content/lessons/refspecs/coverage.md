# Coverage: refspecs

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** the rule behind `fetch` and `push`: full ref names, the default fetch line, one-off refspecs, push refspecs, deleting with an empty source, and the `+`.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 10.5 The Refspec | The Refspec, Pushing Refspecs, Deleting References (all of it) |
| Git reference: `git-fetch`, `git-push`, `git-config`, `git-ls-remote`, `git-rev-parse`, `git-branch` | `<refspec>` format, `--prune` and refspecs, negative refspecs, `config --add` / `--get-all`, `rev-parse --symbolic-full-name`, `branch -dr` |

## Pro Git 10.5, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| `git remote add` writes a `[remote "origin"]` block with `url` and `fetch` | Yes, read from the practice project's `.git/config` | Must know |
| Format: optional `+`, `<src>:<dst>`; src is the remote side, dst where it is tracked locally | Yes, as a table, piece by piece | Must know |
| `+` updates the reference even if it is not a fast-forward | Yes, with a real rejected and a real forced update | Must know |
| Default: everything under `refs/heads/` goes to `refs/remotes/origin/` | Yes | Must know |
| Three equivalent `git log` forms (`origin/master`, `remotes/origin/master`, `refs/remotes/origin/master`) | Yes, with `main`, plus a table for branches and tags | Must know |
| Fetch only one branch by changing the fetch line | Yes, as part of "several fetch lines" | Advanced |
| One-time refspec on the command line (`master:refs/remotes/origin/mymaster`) | Yes, as a Try-it with `mymain` | Must know |
| Multiple refspecs on the command line; the `! [rejected]` output | Yes; the output is from a real run where a teammate rewrote `qa/smoke` | Must know |
| Multiple fetch lines in the config | Yes | Advanced |
| Partial globs (`qa*`) since Git 2.6 | Yes | Advanced |
| Namespaces: `main` plus `qa/*` only | Yes, and it is the hard challenge | Advanced |
| Pushing refspecs: `master:refs/heads/qa/master` | Yes, as `scratch:tmp/scratch` and `feature:review/feature` | Must know |
| A `push =` line in the config | Yes | Advanced |
| Note: you cannot fetch from one repository and push to another with a refspec | Left out (see below) | |
| Deleting references: `git push origin :topic` | Yes | Must know |
| Newer syntax `git push origin --delete topic` | Yes, as today vs. book | Must know |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Fetching from one repository and pushing to another | A fork workflow; needs GitHub | `github-flow-prs` |
| What a fetch transfers, the protocols | Taught before this lesson | `how-git-talks` |
| Upstreams, `push -u`, `fetch --prune` basics | Taught before this lesson | `remote-branches` |
| Safe force pushing | Pointer only | `force-push-safely` |
| `packed-refs` in detail | One line here | `refs-deep` |

## Beyond the book

- The `+` in a push refspec is a force push (Git reference, `git-push`): the most dangerous way to misread this lesson, so it gets a careful block.
- `git ls-remote origin` and `git rev-parse --symbolic-full-name` to see both sides of a mapping.
- Pruning only covers names the fetch lines map; leftovers need `git branch -dr` (Git reference, `git-fetch`; checked with Git 2.55).
- `git config --add` and `--get-all` for a key with several values.
- `HEAD` as a push source, GitHub's `refs/pull/*/head`, tag refspecs, negative refspecs (`^`).
- The three error messages in "When it goes wrong" are real Git 2.55 output. In the "refusing to fetch into branch" message the folder path is replaced by `C:/Users/you/practice/refspecs/project`.

## Challenges and quiz

- Easy, `push-under-review-name`: push local `feature` as `review/feature`, without creating `feature` on the server. This is also the Try-its' starting state.
- Medium, `delete-old-idea`: delete a server branch with an empty-source refspec, and write the full destination ref name for the server's `qa/smoke` into `answer.txt`.
- Hard, `fetch-only-main-and-qa`: two fetch lines (`main` and `qa/*`) set with `git config` and `--add`, then remove leftover remote-tracking branches by hand, because `--prune` does not touch them (Advanced layer).
- Try-its use their own names (`origin/mymain`, `scratch`, `tmp/scratch`) and remove them again, so they do not solve or break a challenge.
- Limits of the checks: the medium goal is also met by deleting only the local record (`git branch -dr`), and the hard goals cannot see whether the old wildcard fetch line was removed.
- Quiz: reading the default fetch line; what `+` allows on a fetch; an empty source; source and destination order in a push.
