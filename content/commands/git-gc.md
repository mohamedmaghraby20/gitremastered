---
id: git-gc
command: git gc
group: Look inside
summary: Tidies the repository's storage, packing loose objects into a packfile and deleting old objects that nothing leads to.
usage: ["git gc", "git gc --auto", "git gc --prune=now", "git gc --no-prune"]
bookSection: "10.7 Maintenance and Data Recovery"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery
lessons: [packfiles-gc]
---

`git gc` ("garbage collect") tidies `.git`. It gathers the loose objects, which are stored one file each, into one [packfile](term:packfile), joins older packfiles into it, packs the branch and tag files into `.git/packed-refs`, and deletes objects that nothing leads to and that are more than two weeks old. Your history does not change: the same commits keep the same IDs.

```console
$ git gc
Enumerating objects: 22, done.
Counting objects: 100% (22/22), done.
Delta compression using up to 16 threads
Compressing objects: 100% (19/19), done.
Writing objects: 100% (22/22), done.
Total 22 (delta 6), reused 0 (delta 0), pack-reused 0 (from 0)
```

`Total 22 (delta 6)` means 22 objects went into the pack, and 6 of them are stored as a delta: the difference from a similar object. Check the result with `git count-objects -vH`.

You rarely need to type it. Git runs `git gc --auto` by itself after commands such as `git commit` and `git fetch`, and that does real work only past about 6,700 loose objects or 50 packfiles.

| Option | What it does |
|---|---|
| `--auto` | Tidies only if the limits are passed; otherwise returns at once |
| `--prune=<date>` | Deletes unreachable objects older than the date. The default is two weeks ago |
| `--prune=now` | Deletes unreachable objects of any age |
| `--no-prune` | Packs, but deletes nothing |
| `--aggressive` | Computes every delta again with a wider search. Much slower, and seldom worth it |
| `--quiet` | Prints no progress lines |

| Setting | Default | Meaning |
|---|---|---|
| `gc.auto` | 6700 | Loose objects before Git packs by itself. `0` turns automatic garbage collection off |
| `gc.autoPackLimit` | 50 | Packfiles before Git joins them into one |
| `gc.pruneExpire` | 2 weeks ago | Age at which an unreachable object may be deleted |
| `gc.reflogExpireUnreachable` | 30 days | How long the reflog protects a commit that is no longer on its branch |

What a plain `git gc` never deletes: anything a branch, tag, stash, the staging area or a [reflog](term:reflog) line leads to. A commit you reset away ten minutes ago is still there afterwards.

:::careful
`git reflog expire --expire=now --all` followed by `git gc --prune=now` deletes every commit that no branch or tag leads to, at once and for good. After this pair, no reflog rescue is possible in this repository. Use it only as the planned last step of a clean-up.
:::

:::compare
today: "The first line reads `Enumerating objects`, and unreachable objects that are still too young to delete go into a second packfile, a cruft pack."
book: "Pro Git shows `Counting objects` as the first line, and unreachable objects staying behind as loose files."
:::
