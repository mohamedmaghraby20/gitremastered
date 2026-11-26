---
id: git-for-each-ref
command: git for-each-ref
group: Look inside
summary: Lists every ref (branches, tags, remote-tracking branches) with the ID it holds, in a format you choose.
usage: ["git for-each-ref", "git for-each-ref refs/tags", "git for-each-ref --format='%(refname:short) %(objectname:short)'", "git for-each-ref --sort=-committerdate refs/heads"]
bookSection: "10.3 Git References"
bookUrl: https://git-scm.com/docs/git-for-each-ref
lessons: [refs-deep]
---

`git for-each-ref` prints one line for every [ref](term:ref) in the repository: the ID the ref holds, the type of that object, and the ref's full name.

```console
$ git for-each-ref
4bc5afa7dd4664c2fb88427128a252161112989f commit	refs/heads/main
4bc5afa7dd4664c2fb88427128a252161112989f commit	refs/remotes/origin/main
ba3c27e57abce8618aa5ef0e5bc9eb0eede63a06 commit	refs/tags/v0.9
10cb1c0f49c7c50187f82f7365e6ce6e8a00f320 tag	refs/tags/v1.0
```

The type `tag` on the last line marks an [annotated tag](term:annotated-tag): its ref holds a tag object, and the tag object names the commit.

It finds refs wherever Git stores them, also when they are packed into `.git/packed-refs`. That makes it the right tool for scripts; listing the folder `.git/refs` is not.

Name a folder of refs to see one kind only: `refs/heads` (branches), `refs/tags`, `refs/remotes`.

`--format` chooses what is printed. A field is written `%(name)`:

```console
$ git for-each-ref --format='%(refname:short) %(objecttype) %(objectname:short)'
main commit 4bc5afa
origin/main commit 4bc5afa
v0.9 commit ba3c27e
v1.0 tag 10cb1c0
```

| Field | Prints |
|---|---|
| `%(refname)`, `%(refname:short)` | The full name, the short name |
| `%(objectname)`, `%(objectname:short)` | The ID the ref holds |
| `%(objecttype)` | `commit` or `tag` |
| `%(*objectname)` | For an annotated tag, the ID of the object the tag leads to; empty for other refs |
| `%(subject)` | The first line of the commit or tag message |
| `%(committerdate:short)` | The date of the commit |
| `%(creatordate:short)` | The date of the commit, or of the tag object for an annotated tag |
| `%(upstream:short)` | The upstream of a local branch, like `origin/main` |

| Option | Effect |
|---|---|
| `--sort=<field>` | Orders the list by a field; `--sort=-committerdate` puts the newest first |
| `--count=<n>` | Stops after that many refs |
| `--points-at=<commit>` | Only refs on that commit |
| `--contains=<commit>` | Only refs whose history holds that commit |
| `--merged=<branch>`, `--no-merged=<branch>` | Only refs already merged, or not yet merged, into that branch |

The newest tag, for a release script:

```console
$ git for-each-ref --sort=-creatordate --count=1 --format='%(refname:short) %(creatordate:short)' refs/tags
v1.0 2026-03-05
```

Keep the quotes around the format: without them the shell splits it at the spaces and trips over the brackets.
