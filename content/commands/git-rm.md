---
id: git-rm
command: git rm
group: Daily loop
summary: Removes a file from your next commit; with --cached, Git stops tracking it but the file stays on disk.
usage: ["git rm <file>", "git rm --cached <file>", "git rm -r <folder>"]
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#_removing_files
lessons: [remove-move-files, ignoring-files]
---

`git rm` takes a file out of the staging area, so the next commit no longer contains it. By default it deletes the file from your working tree too.

```console
$ git rm draft.txt
rm 'draft.txt'
$ git status -s
D  draft.txt
$ git commit -m "Remove draft"
```

| You type | In the next commit | On your disk |
|---|---|---|
| `git rm notes.txt` | Gone | Deleted |
| `git rm --cached secrets.env` | Gone | **Kept** |

The usual reason for `--cached`: a file was committed by mistake and now belongs in `.gitignore`. Adding it to `.gitignore` alone changes nothing, because Git keeps following files it already tracks.

| Option | What it does |
|---|---|
| `-r` | Removes a folder and everything in it |
| `--cached` | Stops tracking the file and keeps it on disk |
| `-f` | Removes a file even if it has changes that are not committed |
| `-n` | Dry run: prints what would be removed |

A pattern removes many files at once. Put a backslash before the `*`, so Git matches it in every folder and not only the shell in the current one: `git rm \*.log`.

If you already deleted the file with plain `rm`, `git rm <file>` (or `git add <file>`) stages that deletion.

:::careful
`git rm -f` deletes edits that were never committed, and Git cannot bring them back. Old commits still contain a removed file: a password that was pushed must be changed.
:::
