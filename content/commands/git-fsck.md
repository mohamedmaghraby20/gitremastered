---
id: git-fsck
command: git fsck
group: Recovery
summary: Checks that every object in the repository is intact, and lists the commits and files that nothing points at any more.
usage: ["git fsck", "git fsck --lost-found", "git fsck --unreachable", "git fsck --no-reflogs"]
bookSection: "10.7 Maintenance and Data Recovery"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery#_data_recovery
lessons: [rescue-lost-work]
---

`git fsck` ("file system check") inspects every object Git has stored. For rescue work, the useful part is its list of dangling objects: commits and file contents that no branch, tag, reflog line or other object points at. A dropped stash entry shows up here when `git reflog` has no line for it.

```console
$ git stash drop
Dropped refs/stash@{0} (b4290cdeea6b08b5aa5255cb3a5af90da6f1c397)
$ git fsck
dangling commit b4290cdeea6b08b5aa5255cb3a5af90da6f1c397
```

`git fsck` prints IDs only. Look inside with `git show --stat <id>`, then give the commit a name or apply it:

| What you found | Bring it back with |
|---|---|
| A lost commit | `git branch <name> <id>` |
| A dropped stash entry | `git stash apply <id>`, or `git stash store -m "<message>" <id>` to put it back on the list |
| A dangling blob (a file that was staged, never committed) | `git show <id> > <file>` |

| Option | What it does |
|---|---|
| (none) | Lists dangling objects: the loose ends of each lost chain. Commits the reflog still lists are not reported |
| `--unreachable` | Lists every object that cannot be reached, not only the loose ends |
| `--no-reflogs` | Ignores the reflog, so commits that only a reflog line protects are reported too |
| `--lost-found` | Also writes the dangling objects into `.git/lost-found/` (commits in `commit/`, file contents in `other/`), and ignores the reflog |

An unreachable object with no reflog line is removed by garbage collection once it is more than two weeks old, so do not wait long.

:::compare
today: "`git fsck` checks everything by default."
book: "Pro Git types `git fsck --full`. The option still works; it has been the default for many years."
:::
