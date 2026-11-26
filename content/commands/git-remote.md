---
id: git-remote
command: git remote
group: Remotes
summary: Lists, adds, renames and removes the short names your repository keeps for other copies of the project.
usage: ["git remote -v", "git remote add <name> <address>", "git remote show <name>", "git remote rename <old> <new>", "git remote remove <name>"]
bookSection: "2.5 Working with Remotes"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes
lessons: [remotes]
---

A remote is a short name for the address of another copy of your project, usually on a server. `git remote` manages those names. It never downloads or uploads commits; that is the job of `git fetch`, `git pull` and `git push`.

```console
$ git remote -v
origin	../origin.git (fetch)
origin	../origin.git (push)
```

`origin` is the name `git clone` gives to the copy you cloned from. Each remote has two lines, one address for downloading and one for uploading; they are almost always the same.

| You type | What happens |
|---|---|
| `git remote` | Lists the names |
| `git remote -v` | Lists the names with their addresses |
| `git remote add origin <address>` | Gives an address the name `origin` |
| `git remote show origin` | Asks the server and prints its branches, and what pull and push will do |
| `git remote rename old new` | Renames a remote; `old/main` becomes `new/main` |
| `git remote remove name` | Forgets a remote and its remote-tracking branches |
| `git remote set-url origin <address>` | Changes the address, for a project that moved |
| `git remote get-url origin` | Prints the address |

`git remote show origin` is the quickest check before you push:

```console
$ git remote show origin
* remote origin
  Fetch URL: ../origin.git
  Push  URL: ../origin.git
  HEAD branch: main
  Remote branch:
    main tracked
  Local branch configured for 'git pull':
    main merges with remote main
  Local ref configured for 'git push':
    main pushes to main (local out of date)
```

`(local out of date)` means the server has commits you do not have: pull before you push.

Removing or renaming a remote changes only your repository. The server is not touched.
