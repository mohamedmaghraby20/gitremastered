# Coverage: branch-management

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** housekeeping for local branches: telling merged from unmerged branches, deleting, renaming. The remote half of the book section (pushing a renamed branch, deleting the old name on the server) is taught with remotes.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 3.3 Branch Management | Listing (`git branch`, `-v`), `--merged`, `--no-merged`, the tip about naming a branch, `-d` and `-D`, Changing a branch name, Changing the master branch name |
| Pro Git 10.3 Git References | A branch is a file under `.git/refs/heads` (Under the hood) |
| Git reference: `git-branch`, `git-for-each-ref`, `git-reflog` | `--sort`, `--contains`, `--list`, `-vv`, `-c`, `-f`, creating a branch at a commit, reflog expiry default |

## Pro Git 3.3, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| `git branch` lists branches; `*` marks the current one | Yes, as a short reminder (taught in "Branches are just pointers") | Must know |
| `git branch -v` shows the last commit of each branch | Yes, as a short reminder | Must know |
| `--merged`: branches already merged into the current branch; safe to delete | Yes, with a predict block and a Try-it | Must know |
| `--no-merged`: branches with work not merged yet | Yes | Must know |
| `git branch -d` fails on an unmerged branch; the message | Yes, with today's wording of the message | Must know |
| `-D` forces the deletion and loses the work | Yes, with a careful block and the rescue by ID | Must know |
| Tip: `--merged` / `--no-merged` are relative to the current branch; name another branch to ask about it | Yes | Must know, repeated in Under the hood |
| Caution: do not rename branches others still use | Yes | Must know |
| `git branch --move old new` | Yes, as `-m`, with the long form in a compare block | Must know, Advanced |
| Pushing the renamed branch, `git branch --all`, deleting the old name on the remote | Pointer only | Left out, see below |
| Warning: renaming master/main breaks integrations and scripts | Yes | Must know |
| `git branch --move master main` | Yes | Must know |
| The checklist after renaming the default branch (dependent projects, test runners, build and release scripts, host settings, documentation, pull requests) | Yes, as one sentence | Must know |
| Deleting `master` on the remote | Pointer only | Left out, see below |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| `git push --set-upstream origin <new-name>` after a rename | Needs remotes | `remote-branches` |
| `git branch --all` and `remotes/origin/...` lines | Needs remotes | `remote-branches` |
| `git push origin --delete <old-name>` | Needs remotes | `remote-branches` |
| Creating and switching branches | Taught earlier | `branches-are-pointers`, `switch-and-detached-head` |
| Merging and conflicts | Taught earlier | `branch-and-merge` |
| Full recovery of lost commits | Only the one-step rescue is shown here | `rescue-lost-work` |

## Beyond the book

- Bringing a deleted branch back with `git branch <name> <id>`, using the ID from "Deleted branch … (was …)" or `git reflog`: the mistake everyone makes once.
- "You cannot delete the branch you are on" and the "a branch named … already exists" message.
- Under the hood: the ref file, what "merged" means as reachability, the rename line in the branch's reflog, the 30-day default for unreachable reflog entries (Git reference, `gc.reflogExpireUnreachable`).
- Advanced: `--sort=-committerdate`, `--contains`, `--list`, `-vv`, `-c`, `-f`, `git for-each-ref`.

## Notes on the terminal output

All `console` blocks are real output from Git 2.55 in a scratch copy of the easy challenge's starting state, so the commit IDs of the setup's commits may match what the student sees only if their name, email and clock match; the text never depends on them. Two edits: the `hint: Disable this message…` line is trimmed from the "not fully merged" output, and the worktree path in "cannot delete branch 'main' used by worktree at …" is replaced by a short made-up path. Pro Git prints the older message "The branch 'testing' is not fully merged"; the lesson shows what Git 2.55 prints.

## Challenges and quiz

- Easy, `delete-merged-branches`: three side branches, two merged (one by fast-forward, one by a merge commit), one unmerged. Delete the two finished ones with `-d`. This is also the starting state for the Try-its, which use their own branches (`scratch-idea`, `try-colors`) and leave the shop's branches alone.
- Medium, `rename-to-main`: rename `master` to `main` and `stuff` to `contact-page`. Combines the two forms of `-m`.
- Hard, `drop-one-restore-one`: force-delete an unmerged experiment, and bring back a branch that the setup deleted, by finding its commit in the reflog (Under the hood) and running `git branch <name> <id>`. A goal checks that `main` did not receive the payment commits, so merging is not a way around it.
- Quiz: what `--merged` is relative to; `-d` or `-D`; what deleting removes; restoring a deleted branch.
