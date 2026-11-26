---
id: git-revert
command: git revert
group: Undo
summary: Undoes a commit by adding a new commit that makes the opposite change.
usage: ["git revert <commit>", "git revert --no-edit <commit>", "git revert -n <commit>...", "git revert --continue", "git revert --abort"]
bookSection: "7.8 Git Tools - Advanced Merging"
bookUrl: https://git-scm.com/docs/git-revert
lessons: [revert-a-commit]
---

`git revert` undoes a commit without removing it. It adds a new commit that does the opposite: lines the old commit added are removed, lines it removed come back. History only grows, so it is the safe way to undo a commit other people already have.

```console
$ git revert --no-edit 1b83e0c
[main 710580f] Revert "Add gift cards"
 Date: Thu Nov 26 20:51:24 2026 +0300
 1 file changed, 1 deletion(-)
 delete mode 100644 gifts.txt
```

Name the commit by its ID from `git log --oneline`, or use `HEAD` for the newest one. Only that commit is undone; later commits keep their changes.

| You type | What happens |
|---|---|
| `git revert <commit>` | Opens the editor with the message `Revert "…"`, then commits |
| `git revert --no-edit <commit>` | Keeps Git's message and commits at once |
| `git revert <newer> <older>` | One revert commit for each, in the order listed |
| `git revert -n <commit>...` | Stages the opposite changes and stops; finish with `git commit` to get one commit |
| `git revert -m 1 <merge>` | Reverts a merge commit, keeping the branch you merged into as the main line |
| `git revert --continue` | Finishes a revert that stopped on a conflict, after you fixed the file and ran `git add` |
| `git revert --abort` | Cancels a stopped revert and puts everything back as it was |
| `git revert --skip` | Drops the commit that conflicted and goes on to the next one |

Reverting a revert brings the change back. Git names that commit `Reapply "…"`.

:::careful
A revert does not delete the old commit or its content. A password that was committed is still readable in the history after you revert it.
:::
