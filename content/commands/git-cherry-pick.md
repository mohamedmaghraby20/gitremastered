---
id: git-cherry-pick
command: git cherry-pick
group: Branching
summary: Copies the change of one commit onto the branch you are on, as a new commit.
usage: ["git cherry-pick <commit>", "git cherry-pick -x <commit>", "git cherry-pick <older> <newer>", "git cherry-pick --continue", "git cherry-pick --abort"]
bookSection: "5.3 Distributed Git - Maintaining a Project"
bookUrl: https://git-scm.com/docs/git-cherry-pick
lessons: [integrating-work]
---

`git cherry-pick <commit>` takes the change that one commit made and makes the same change as a new commit on the branch you are on. The original commit and its branch stay as they were. Use it to take one fix out of a branch whose other commits are not ready.

```console
$ git cherry-pick 30724a0
[main 73d3ee9] Add hall note
 Date: Fri Nov 27 01:01:53 2026 +0300
 1 file changed, 1 insertion(+)
 create mode 100644 hall.txt
```

The new commit keeps the message, the author and the author's date, but it has a new ID (`73d3ee9`, not `30724a0`), because its parent is different. Name the commit by its ID from `git log --oneline`. A branch name means the newest commit of that branch.

When the change does not fit, Git stops with `CONFLICT` and waits:

1. `git status` lists the files under "Unmerged paths".
2. Edit each file to its final text and remove the `<<<<<<<`, `=======` and `>>>>>>>` lines.
3. `git add <file>` marks it resolved.
4. `git cherry-pick --continue` makes the commit.

| You type | What happens |
|---|---|
| `git cherry-pick <commit>` | Copies that commit onto the branch you are on |
| `git cherry-pick <older> <newer>` | Copies each commit, in the order listed |
| `git cherry-pick main..topic` | Copies every commit of `topic` that `main` lacks, oldest first |
| `git cherry-pick -x <commit>` | Adds the line `(cherry picked from commit …)` to the message, so readers can find the original. For fixes copied to a release branch |
| `git cherry-pick -n <commit>` | Stages the change and stops; finish with `git commit`. For combining several picks into one commit |
| `git cherry-pick -m 1 <merge>` | Picks a merge commit, as the change it made to the branch that received the merge |
| `git cherry-pick --continue` | Finishes a pick that stopped on a conflict, after you fixed the file and ran `git add` |
| `git cherry-pick --abort` | Cancels a stopped pick and puts everything back as it was before the command |
| `git cherry-pick --skip` | Drops the commit that stopped and goes on to the next one |

`git cherry -v main topic` shows which commits of `topic` were picked into `main` already: those are marked `-`.

:::careful
A cherry-pick copies; it does not move. The same change now lives in two commits with different IDs, so `git log main..topic` still lists the original. Do not pick commits back and forth between two long-lived branches: merge them.
:::
