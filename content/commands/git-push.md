---
id: git-push
command: git push
group: Remotes
summary: Uploads your commits to a remote and moves its branch to match yours.
usage: ["git push", "git push origin main", "git push -u origin main", "git push --dry-run"]
bookSection: "2.5 Working with Remotes"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes#_pushing_remotes
lessons: [remotes]
---

`git push` sends the commits the server lacks, then asks the server to move its branch onto your newest commit. When it works, your record `origin/main` moves too.

```console
$ git push origin main
To ../origin.git
   807b5f7..b2c60d8  main -> main
```

`main -> main` reads: your `main` became the server's `main`, which moved from commit `807b5f7` to `b2c60d8`.

| You type | What happens |
|---|---|
| `git push origin main` | Pushes your `main` to the remote `origin` |
| `git push` | The same, once your branch follows a branch on the remote |
| `git push -u origin main` | The first push of a branch: uploads it and makes it follow `origin/main` |
| `git push --dry-run` | Prints what would be sent, and sends nothing |

**The rejected push.** The server accepts a push only if it keeps every commit it already has. If a teammate pushed after your last fetch, you get:

```console
$ git push
To ../origin.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to '../origin.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
```

Nothing was sent. Run `git pull` to merge their commits into your branch, then `git push` again.

If Git answers `fatal: The current branch main has no upstream branch`, the branch has never been pushed: run `git push -u origin main`.

:::careful
`git push --force` moves the server's branch to your commit even when that drops commits other people pushed. Never use it on a branch your team shares.
:::
