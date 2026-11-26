---
id: git-tag
command: git tag
group: Remotes
summary: Lists, creates and deletes tags, the fixed names that mark releases like v1.0.
usage: ["git tag", "git tag -a <name> -m \"<message>\"", "git tag -a <name> <commit>", "git tag -d <name>"]
bookSection: "2.6 Tagging"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Tagging
lessons: [tags-and-releases]
---

`git tag` puts a name on one commit, and the name never moves. Teams use it to mark releases.

```console
$ git tag -a v1.0-rc1 -m "Release candidate 1"
$ git tag
v1.0-rc1
$ git show v1.0-rc1
tag v1.0-rc1
Tagger: Practice Student <student@example.com>
Date:   Thu Nov 26 21:03:09 2026 +0300

Release candidate 1

commit b2937cfa92c4ed3a6156f30e5b7378c20a31d02f
```

| You type | What happens |
|---|---|
| `git tag` | Lists every tag |
| `git tag -l "v1*"` | Lists the tags that match a pattern |
| `git tag -a v1.0 -m "Version 1.0"` | Makes an annotated tag on the commit you are on: it records the tagger, the date and the message. Use this for releases |
| `git tag v1.0-beta` | Makes a lightweight tag: only a name on the commit |
| `git tag -a v0.9 5b9b28a -m "Version 0.9"` | Tags an older commit, named by its ID |
| `git tag -d v1.0` | Deletes the tag in your repository (not on the server) |
| `git tag -n` | Lists tags with the first line of their message |

Tags are not sent by plain `git push`. Share and remove them on the server with `git push`:

| You type | What happens |
|---|---|
| `git push origin v1.0` | Sends one tag |
| `git push --follow-tags` | Sends your commits and the annotated tags on them |
| `git push origin --tags` | Sends every tag you have, lightweight ones too |
| `git push origin --delete v1.0` | Deletes the tag on the server |

:::careful
Do not delete or move a tag that others have already fetched. Their copy stays on the old commit, and "v1.0" then means two different things. Publish the fix under a new version number.
:::

:::compare
today: "`git push origin --delete v1.0` deletes a tag on the server."
book: "`git push origin :refs/tags/v1.0` does the same and still works."
:::
