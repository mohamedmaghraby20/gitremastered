---
id: git-update-ref
command: git update-ref
group: Look inside
summary: Creates, moves or deletes one ref safely, without touching your files or the branch you are on.
usage: ["git update-ref refs/heads/<branch> <commit>", "git update-ref -d refs/heads/<branch>", "git update-ref refs/heads/<branch> <new> <old>", "git update-ref -m \"<reason>\" refs/heads/<branch> <commit>"]
bookSection: "10.3 Git References"
bookUrl: https://git-scm.com/docs/git-update-ref
lessons: [refs-deep]
---

`git update-ref <full-name> <commit>` makes a [ref](term:ref) hold that commit. If the ref does not exist, Git creates it. It is a [plumbing](term:plumbing) command: `git branch` and `git tag` use the same step inside, and scripts call it directly.

```console
$ git update-ref refs/heads/scratch ba3c27e
$ cat .git/refs/heads/scratch
ba3c27e57abce8618aa5ef0e5bc9eb0eede63a06
$ git branch
* main
  scratch
```

Only the ref changes. No commit is made, your files stay as they are, and you stay on your branch.

| Form | What it does |
|---|---|
| `git update-ref refs/heads/x <commit>` | Creates the branch `x`, or moves it to that commit |
| `git update-ref refs/tags/x <commit>` | Creates a lightweight tag |
| `git update-ref -d refs/heads/x` | Deletes the ref |
| `git update-ref refs/heads/x <new> <old>` | Moves the ref only if it holds `<old>` right now; otherwise fails and changes nothing |
| `git update-ref -m "reason" refs/heads/x <commit>` | Also writes the reason into the ref's reflog |
| `git update-ref --no-deref HEAD <commit>` | Writes the ID into HEAD itself (a detached HEAD). Without `--no-deref`, the branch HEAD names is moved |
| `git update-ref --stdin` | Reads many `create`, `update` and `delete` lines and applies all of them or none |

Where it asks for a commit, a short ID, a full ID or a name like `HEAD~1` works.

It is safer than writing the file under `.git/refs` yourself: it checks that the object exists and that a branch gets a commit, records the move in the [reflog](term:reflog), locks the ref while writing, and works when refs are stored in `packed-refs`.

```console
$ git update-ref refs/heads/typo 1234567890123456789012345678901234567890
fatal: update_ref failed for ref 'refs/heads/typo': trying to write ref 'refs/heads/typo' with nonexistent object 1234567890123456789012345678901234567890
```

:::careful
Always give the full name. `git update-ref scratch <commit>` does not move the branch `scratch`: it writes a stray file `.git/scratch`, and every later use of the name prints `warning: refname 'scratch' is ambiguous.` Write `refs/heads/scratch`.

`update-ref` does not ask before moving a branch backwards. Commits the branch no longer reaches are still in the reflog (`git reflog show <branch>`).
:::
