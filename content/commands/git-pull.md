---
id: git-pull
command: git pull
group: Remotes
summary: Fetches from a remote, then merges the fetched branch into the branch you are on.
usage: ["git pull", "git pull --no-edit", "git pull --ff-only", "git pull --rebase"]
bookSection: "2.5 Working with Remotes"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes#_fetching_and_pulling
lessons: [remotes]
---

`git pull` is two commands in one: `git fetch`, then `git merge` of the branch your branch follows (for `main`, normally `origin/main`).

```console
$ git pull
From ../origin
   564b3d2..541a285  main       -> origin/main
Updating 564b3d2..541a285
Fast-forward
 trails.txt | 1 +
 1 file changed, 1 insertion(+)
```

The first two lines are the fetch. From "Updating" on, it is the merge.

What the merge looks like depends on your own work:

| Your branch | The pull |
|---|---|
| Has no new commits | Fast-forwards: your branch moves onto the fetched commits |
| Has new commits too | Makes a merge commit that joins both lines; an editor opens for its message |
| Changed the same lines as the fetched commits | Stops with a conflict: fix the file, `git add` it, `git commit` |

| Option | What it does |
|---|---|
| `--no-edit` | Accepts the ready-made merge message without opening the editor |
| `--ff-only` | Pulls only if it is a fast-forward; otherwise stops and changes nothing |
| `--no-rebase` | Merges, whatever your settings say |
| `--rebase` | Replays your new commits on top of the fetched ones, so no merge commit is made |

:::careful
`git pull` changes your branch at once. Commit your work first: if you have uncommitted edits to a file the fetched commits also change, Git refuses to pull.
:::

If Git answers `fatal: Need to specify how to reconcile divergent branches`, tell it once how pulls should join two lines of work: `git config --global pull.rebase false` for a merge.

To look before you take anything, run `git fetch` instead, then merge when you are ready.
