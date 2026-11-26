---
id: git-rm
command: git rm
group: Ignore files
summary: Removes a file from Git; with --cached, Git stops tracking it but the file stays on disk.
usage: ["git rm --cached <file>", "git rm <file>"]
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#_removing_files
lessons: [ignoring-files]
---

`git rm` removes a file from the staging area, so the next commit no longer contains it.

| You type | In the next commit | On your disk |
|---|---|---|
| `git rm --cached secrets.env` | Gone | **Kept** |
| `git rm notes.txt` | Gone | Deleted |

The usual reason for `--cached`: a file was committed by mistake and now belongs in `.gitignore`. Adding it to `.gitignore` alone changes nothing, because Git keeps following files it already tracks.

```console
$ git rm --cached secrets.env
rm 'secrets.env'
$ git commit -m "Stop tracking secrets.env"
```

:::careful
Old commits still contain the file. A password that was pushed must be changed.
:::
