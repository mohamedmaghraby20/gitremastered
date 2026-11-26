---
id: git-reset
command: git reset
group: Undo
summary: Moves your branch back to an earlier commit, and optionally resets the staging area and your files to match.
usage: ["git reset --soft <commit>", "git reset <commit>", "git reset --hard <commit>", "git reset <file>"]
bookSection: "7.7 Reset Demystified"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified
lessons: [reset-demystified]
---

`git reset <commit>` takes your branch back to that commit. It does up to three steps, always in this order, and the option says where it stops.

| You type | Moves your branch | Resets the staging area | Overwrites your files | Use it to |
|---|---|---|---|---|
| `git reset --soft HEAD~1` | Yes | No | No | Take the last commit back and keep its changes staged |
| `git reset HEAD~1` | Yes | Yes | No | Take the last commit back and unstage its changes; the edits stay in your files |
| `git reset --hard HEAD~1` | Yes | Yes | Yes | Throw the last commit and its changes away |

`HEAD~1` is the commit before the one you are on; `HEAD~2` is two back.

```console
$ git reset HEAD~1
Unstaged changes after reset:
M	plan.txt
$ git reset --hard HEAD~1
HEAD is now at 096e24e Plan v2
```

The commits you reset away are not deleted. `git reflog` lists where HEAD has been, and `git reset --hard <id>` (or `git reset --hard ORIG_HEAD` right after the reset) moves your branch back to them.

With a file name, reset leaves your branch alone and only copies that file from the last commit into the staging area, which unstages it.

:::careful
`git reset --hard` overwrites every tracked file without asking. Changes you never committed cannot be brought back. Run `git status` first. Reset only commits that exist on your computer alone; to undo a commit other people already have, use `git revert`.
:::

:::compare
today: "`git restore --staged notes.txt` unstages a file."
book: "`git reset notes.txt` (or `git reset HEAD notes.txt`) does the same and still works."
:::
