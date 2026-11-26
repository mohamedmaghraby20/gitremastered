---
id: git-merge
command: git merge
group: Branching
summary: Brings the work of another branch into the branch you are on.
usage: ["git merge <branch>", "git merge <branch> --no-edit", "git merge --abort", "git merge --no-ff <branch>"]
bookSection: "3.2 Basic Branching and Merging"
bookUrl: https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging
lessons: [branch-and-merge]
---

`git merge <branch>` brings that branch's commits into the branch you are on. The branch you name does not move. So switch to the branch that should receive the work first.

```console
$ git switch main
$ git merge try-menu --no-edit
Merge made by the 'ort' strategy.
 menu.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 menu.txt
```

What Git prints tells you which kind of merge it was:

| Git prints | What happened |
|---|---|
| `Fast-forward` | Only the other branch had new commits. Your branch label moved forward; no commit was made |
| `Merge made by the 'ort' strategy.` | Both branches had new commits. Git combined them in a merge commit with two parents |
| `CONFLICT (content): Merge conflict in <file>` | Both branches changed the same lines. Git stopped and waits for you |
| `Already up to date.` | Your branch already contains the other branch. Nothing to do |

When a merge stops on a conflict:

1. `git status` lists the files under "Unmerged paths".
2. Edit each file to its final text and remove the `<<<<<<<`, `=======` and `>>>>>>>` lines.
3. `git add <file>` marks it resolved.
4. `git commit` finishes the merge.

| Option | What it does |
|---|---|
| `--no-edit` | Keeps the message Git wrote (`Merge branch '…'`) without opening the editor |
| `--abort` | Stops a merge that is waiting on a conflict and puts your files back as they were before it |
| `--no-ff` | Makes a merge commit even when a fast-forward was possible, so history shows where a feature came in |
| `--ff-only` | Merges only if it is a fast-forward; otherwise refuses and changes nothing |
| `--squash` | Stages the branch's combined changes for one ordinary commit. Git does not record that the branch was merged |

:::careful
`git add` does not look inside the file. If conflict markers are still in it, they are committed. Search for `<<<<<<<` before you stage, or run `git diff --check`.
:::

:::compare
today: "Git prints `Merge made by the 'ort' strategy.` (the default since Git 2.34)."
book: "Pro Git shows `Merge made by the 'recursive' strategy.` It is the same kind of merge, done by the older method."
:::
