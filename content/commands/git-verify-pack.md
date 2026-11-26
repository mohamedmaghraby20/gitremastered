---
id: git-verify-pack
command: git verify-pack
group: Look inside
summary: Checks that a packfile is intact and, with -v, lists every object inside it.
usage: ["git verify-pack .git/objects/pack/pack-*.idx", "git verify-pack -v .git/objects/pack/pack-*.idx"]
bookSection: "10.4 Packfiles"
bookUrl: https://git-scm.com/book/en/v2/Git-Internals-Packfiles
lessons: [packfiles-gc]
---

`git verify-pack` reads a [packfile](term:packfile) through its index file (`.idx`) and checks that nothing in it is damaged. With `-v` it also lists every object in the pack, which shows how Git stored each one: whole, or as a delta (the difference from another object). It is a [plumbing](term:plumbing) command and only reads.

Give it the path of the `.idx` file. `pack-*.idx` lets the shell fill in the long name. This example keeps only the blobs, the objects that hold file contents:

```console
$ git verify-pack -v .git/objects/pack/pack-*.idx | grep blob
de673d0962d0c1f7578ea587e922c69384379033 blob   58 64 1037
06bb7513ab9b0ace74f0e23596e41eb5cb881c8c blob   47 57 1101
19e6599a5806641d379f907e39e0308746065004 blob   13898 6476 1158
9211df7a58282a46d297d93f4af601aa154fc936 blob   21815 3152 7634
1127304b44c93b81365608aa80e44d54815adb52 blob   7 18 11024 1 19e6599a5806641d379f907e39e0308746065004
966ea5326c68b7768159c6a238bd02bb6d08ee80 blob   9 20 11174 1 9211df7a58282a46d297d93f4af601aa154fc936
e6b8dcebb5bbb64819e33885e9110d18e2e20329 blob   8 19 11278 1 9211df7a58282a46d297d93f4af601aa154fc936
```

| Column | Meaning |
|---|---|
| 1 | The object's ID |
| 2 | Its type: `commit`, `tree`, `blob` or `tag` |
| 3 | Its size in bytes. For a delta, the size of the delta |
| 4 | The bytes it takes inside the packfile |
| 5 | Where it starts in the packfile, in bytes from the beginning |
| 6 | Only for a delta: how many steps it is from a whole object |
| 7 | Only for a delta: the ID of its base, the object it is a difference from |

A line with five columns is an object stored whole. A line with seven is a delta. Above, `9211df7` (21,815 bytes) is the newest version of a file, stored whole; `966ea53` and `e6b8dce` are older versions of it that take 20 and 19 bytes.

The full listing ends with a summary and the verdict:

```console
$ git verify-pack -v .git/objects/pack/pack-*.idx | tail -3
non delta: 16 objects
chain length = 1: 6 objects
.git/objects/pack/pack-542b3a2b73a446f07c4734161f11a17b9908b006.pack: ok
```

| Option | What it does |
|---|---|
| (none) | Checks the pack and prints nothing when it is intact |
| `-v` | Lists every object, then the summary of delta chain lengths |
| `-s` | Skips the check and prints only the summary |

To find the largest objects in a repository, sort the listing by column 3: `git verify-pack -v .git/objects/pack/pack-*.idx | sort -k 3 -n | tail -3`. Pro Git uses this to track down a huge file committed by mistake.

When there is no packfile yet, the shell passes the star on as typed and Git reports it:

```console
$ git verify-pack -v .git/objects/pack/pack-*.idx
fatal: Cannot open existing pack file '.git/objects/pack/pack-*.idx'
.git/objects/pack/pack-*.pack: bad
```

Run `git gc` first, or check `packs:` in `git count-objects -v`.
