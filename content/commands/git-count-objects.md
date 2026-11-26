---
id: git-count-objects
command: git count-objects
group: Look inside
summary: Counts the objects in the repository's storage and the disk space they take, loose and packed.
usage: ["git count-objects", "git count-objects -v", "git count-objects -vH"]
bookSection: "10.7 Maintenance and Data Recovery"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery
lessons: [packfiles-gc]
---

`git count-objects` measures `.git/objects`: how many objects are stored loose (one file each), how many sit inside [packfiles](term:packfile), and how much disk space both take. It only reads, so it is safe at any time. Use it before and after `git gc` to see what the tidy-up did.

```console
$ git count-objects -vH
count: 22
size: 23.68 KiB
in-pack: 0
packs: 0
size-pack: 0 bytes
prune-packable: 0
garbage: 0
size-garbage: 0 bytes
```

After `git gc` on the same repository:

```console
$ git count-objects -vH
count: 0
size: 0 bytes
in-pack: 22
packs: 1
size-pack: 12.80 KiB
prune-packable: 0
garbage: 0
size-garbage: 0 bytes
```

| Line | Meaning |
|---|---|
| `count` | The number of loose objects |
| `size` | Disk space the loose objects take |
| `in-pack` | The number of objects inside packfiles |
| `packs` | The number of packfiles |
| `size-pack` | Disk space the packfiles and their index files take |
| `prune-packable` | Loose objects that are also in a pack. `git gc` removes these duplicates |
| `garbage`, `size-garbage` | Files in `.git/objects` that are neither a valid object nor a pack |

| Option | What it does |
|---|---|
| (none) | Prints one line about loose objects only, like `22 objects, 23 kilobytes` |
| `-v` | Prints the full list above. Sizes are plain numbers in KiB (1 KiB is 1,024 bytes), which suits scripts |
| `-H` | Prints sizes with a unit, like `12.80 KiB` |

The counts are the same on every computer. The sizes can differ a little, because operating systems measure disk space in different ways.

The total number of objects in a repository is `count` plus `in-pack`, minus `prune-packable`.
