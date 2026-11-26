---
id: git-replace
command: git replace
group: Look inside
summary: Makes Git show a different object in place of an existing one, without rewriting any commit.
usage: ["git replace --graft <commit> <new-parent>", "git replace <object> <replacement>", "git replace --edit <object>", "git replace -l", "git replace -d <object>"]
bookSection: "7.13 Replace"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Replace
lessons: [plumbing-toolkit]
---

`git replace` tells Git: whenever this [object](term:object) is asked for, hand over that other one instead. The original stays stored and no [commit ID](term:commit-id) changes. Git keeps the instruction as a [replacement ref](term:replacement-ref) under `refs/replace`.

The most used form is `--graft`, which shows a commit with a different [parent](term:parent-commit). Here `main` starts at an import commit, and the older commits are on `old-history`:

```console
$ git log --oneline main
cfafa61 Add contact page
f5a4511 Add delivery page
b613d64 Imported from the old server
$ git replace --graft HEAD~1 old-history
$ git log --oneline main
cfafa61 Add contact page
f5a4511 Add delivery page
40ebe1f Add prices
7c43ee0 Start the shop
```

"Add delivery page" keeps its ID, `f5a4511`, and is now shown with "Add prices" as its parent.

| Option | What it does |
|---|---|
| `--graft <commit> <parent>…` | Shows the commit with the parents you list. With no parent, the history appears to start at that commit |
| `<object> <replacement>` (no option) | Shows the second object whenever the first is asked for. Both must be the same type, for example two commits |
| `--edit <object>` | Opens the object's text in your editor and replaces the object with what you save |
| `-l`, `--list` | Lists the IDs that have a replacement. Add `--format=long` to see what each one points to |
| `-d <object>` | Deletes the replacement; the real object is shown again |
| `-f`, `--force` | Overwrites a replacement that already exists |

To ignore every replacement for one command, put `--no-replace-objects` right after `git`:

```console
$ git --no-replace-objects log --oneline
cfafa61 Add contact page
f5a4511 Add delivery page
b613d64 Imported from the old server
```

:::careful
A replacement is a view, kept only in your repository. `git push` and `git clone` do not carry it, and the objects it hides are still needed, so do not delete the branch that holds them. To share it, push the refs yourself: `git push origin 'refs/replace/*:refs/replace/*'`.
:::
