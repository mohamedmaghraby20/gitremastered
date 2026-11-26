---
id: checkpoint-undo-and-fix
title: "Checkpoint: Undo and fix"
module: undo-and-fix
bookSection: "2.4 Undoing Things"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things
bookSources:
  - book/progit2/book/02-git-basics/sections/undoing.asc
  - book/progit2/book/07-git-tools/sections/rewriting-history.asc
  - book/progit2/book/07-git-tools/sections/advanced-merging.asc
  - book/progit2/book/07-git-tools/sections/reset.asc
readFirst: [undo-basics, fix-last-commit, revert-a-commit, reset-demystified]
checkpoint: true
---

Something went wrong in your repository, and Git has four commands that could undo it. This checkpoint lets you prove you can pick the right one, in three situations where the wrong one costs you work or breaks your team's history.

## Must know

The four lessons of this module each taught one undo tool. A real mistake does not tell you which lesson it belongs to, so this page puts the tools side by side. Nothing here is new: every row points back to the lesson that teaches it.

The challenges at the end have no hints. Use this page, and go back to a lesson when a row is not enough.

### Pick the tool: two questions

Ask them in this order, every time.

1. **Where is the mistake?** In your files, in the [staging area](term:staging-area), or already in a commit. `git status` and `git log --oneline` tell you.
2. **Does anyone else have the commit?** A commit you have pushed, or that the challenge calls "shared", must stay in history.

| The mistake is… | Shared? | Use | What happens to history |
|---|---|---|---|
| An edit you have not staged | Does not apply | `git restore <file>` | Nothing: no commit is touched |
| A change you staged too early | Does not apply | `git restore --staged <file>` | Nothing: no commit is touched |
| The last commit: wrong message, a forgotten file, a file too many | No | `git commit --amend` | The last commit is replaced by a new one |
| The last commits, and you want their work back in your hands | No | `git reset --soft` or `git reset` | The commits leave the branch, the work stays |
| The last commits, and you want them and their changes gone | No | `git reset --hard` | The commits leave the branch, the files are overwritten |
| Any commit other people have, or a bad commit under good ones | Yes | `git revert <commit>` | A new commit is added, nothing is removed |

When you cannot tell whether a commit is shared, treat it as shared and use `git revert`.

Two orders matter when one situation needs two tools:

- **Amend before you add commits.** `--amend` reaches only the newest commit. Once another commit sits on top, including a revert, the commit you wanted to fix is out of reach.
- **Protect uncommitted work before a reset.** `--soft` and plain `git reset` leave your files alone. `--hard` overwrites them.

### Not committed yet: `git restore`

From [Unstage and discard changes](lesson:undo-basics).

| Command | Job |
|---|---|
| `git restore --staged <file>` | [Unstage](term:unstage): the change leaves the next commit, your edits stay in the working tree |
| `git restore <file>` | [Discard](term:discard): the file goes back to its staged version, normally the last commit. The edits are gone for good |
| `git restore .` | Discard every unstaged edit in this folder and below |
| `git restore <file>` on a deleted file | Brings a tracked file back. A staged deletion needs `--staged` first |
| `git restore --source=<commit> <file>` | Takes one file as it was in an older commit |

Restore works on tracked files only. A new, untracked file is yours to delete.

### The last commit: `git commit --amend`

From [Fix the last commit (amend)](lesson:fix-last-commit).

| Command | Job |
|---|---|
| `git commit --amend -m "message"` | Replaces the last commit with one that has a new message |
| `git add <file>`, then `git commit --amend --no-edit` | Puts a forgotten file into the last commit and keeps the message |
| `git rm --cached <file>`, then `git commit --amend --no-edit` | Takes a file out of the last commit and keeps it on your disk |
| `git commit --amend` | Opens the editor with the old message |

To [amend](term:amend) is to replace: the new commit has a new ID, and the old one is left off the branch. Amend only commits that only you have.

### A shared commit: `git revert`

From [Undo a pushed commit with revert](lesson:revert-a-commit).

| Command | Job |
|---|---|
| `git revert HEAD` | Adds a commit that undoes the last commit |
| `git revert <id>` | Adds a commit that undoes an older commit and keeps the ones after it |
| `git revert --no-edit <id>` | The same, with Git's own message `Revert "…"` and no editor |
| `git revert -n <a> <b>`, then `git commit` | Undoes several commits in one new commit |
| `git revert --continue` / `git revert --abort` | After a conflict: finish once the file is fixed and staged, or back out |

A [revert](term:revert) never removes the bad commit. It stays in history, with its opposite on top.

### Local commits: `git reset`

From [Reset demystified: the three trees](lesson:reset-demystified).

| Command | Moves your branch | Changes the index | Changes your files |
|---|---|---|---|
| `git reset --soft <commit>` | Yes | No | No |
| `git reset <commit>` (`--mixed`) | Yes | Yes | No |
| `git reset --hard <commit>` | Yes | Yes | **Yes** |

| Command | Job |
|---|---|
| `git reset --soft HEAD~1` | Takes the last commit back and leaves its changes staged |
| `git reset HEAD~1` | Takes the last commit back and leaves its changes in the working tree, unstaged |
| `git reset --hard HEAD~1` | Throws the last commit and its changes away |
| `git reset --soft HEAD~2`, then `git commit` | [Squashes](term:squash) the last two commits into one |
| `git reflog`, then `git reset --hard <id>` | Gets back a commit a reset took off the branch |

`HEAD~1` is the commit before the one you are on, `HEAD~2` the one before that. A [reset](term:reset) is for commits that are on your computer alone.

### When it goes wrong

Three mix-ups this checkpoint is built around:

- **You amended, and the wrong commit changed.** Another commit was already on top of the one you meant. `git reflog` lists where your branch was; `git reset --hard <id>` puts it back there.
- **You ran `git reset --hard` with uncommitted work.** Edits to tracked files that were never committed are gone. In a challenge, press "Start this challenge" to begin again.
- **You reverted a commit that was only local.** Nothing breaks, but the history now carries a mistake and its undo. For a local commit, amend or reset keeps history clean.

## Under the hood

The module's ideas, in a few lines each.

**Three copies of every file.** Git holds a file in the working tree, in the index (the staging area) and in the last commit, which [HEAD](term:head) points at. Every undo command in this module copies between them. `git restore --staged` copies from HEAD to the index. `git restore` copies from the index to the working tree. `git reset --hard` does both for every file.

**A commit is never edited.** A [commit ID](term:commit-id) is a checksum of the commit's content, message, author, date and parent. Change any of them and you have a different commit. So amend makes a replacement, and reset only moves your branch to another commit.

**Leaving the branch is not deletion.** A commit that amend or reset took off the branch stays in `.git/objects`, and the [reflog](term:reflog) remembers where your branch pointed. In the picture such a commit is a faded, dashed station marked `no branch`. Git keeps it for about a month.

**Only committed work can come back.** The reflog knows commits. An edit you discarded with `git restore`, or that `git reset --hard` overwrote, was never in a commit, so Git has nothing to bring back.

**Revert goes forward.** `git revert` works out what a commit changed against its parent and applies the opposite as a new commit. History only grows, which is why everyone who has the old commits can take the new one without trouble.

## Advanced

These skills return later in the course:

- The lesson "Reword, squash, reorder, split" changes commits that are older than the last one, where `--amend` cannot reach.
- The lesson [Recover lost commits with reflog and fsck](lesson:rescue-lost-work) goes deep into the reflog you used here to get a commit back.
- The lesson "Incident playbook" walks through bigger accidents with these same four tools.
- The lesson "Force-pushing safely with --force-with-lease" covers the rare case where a pushed commit has to be replaced after all.
- [Branch, merge, and fix conflicts](lesson:branch-and-merge) teaches conflicts fully. A revert that stops on a conflict is resolved the same way.

## Recap

- Not committed: `git restore --staged <file>` unstages, `git restore <file>` discards for good.
- Last commit, not shared: `git commit --amend`, with `-m` for the message or `--no-edit` after `git add`.
- Shared commit: `git revert <id>` adds the opposite commit and removes nothing.
- Local commits: `git reset --soft`, `git reset` or `git reset --hard`, depending on how much of the work you keep.
- Amend first, protect uncommitted work before a reset, and when unsure whether a commit is shared, revert.
