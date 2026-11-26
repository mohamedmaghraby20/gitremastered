---
id: git-ls-remote
command: git ls-remote
group: Remotes
summary: Asks a server which branches and tags it has, without downloading anything.
usage: ["git ls-remote origin", "git ls-remote --heads origin", "git ls-remote --tags origin", "git ls-remote <url>"]
bookSection: "git-ls-remote (Git reference)"
bookUrl: https://git-scm.com/docs/git-ls-remote
lessons: [how-git-talks]
---

`git ls-remote` connects to a remote and prints its refs: every branch and tag the server has, each with the ID of the commit it points at. It only asks. Nothing is downloaded and nothing in your repository changes.

```console
$ git ls-remote origin
cd850660407bee533a0672ff3f68d585dc1a9178	HEAD
cd850660407bee533a0672ff3f68d585dc1a9178	refs/heads/main
5402c842678f82869062a82c4eb3089012cb97b1	refs/heads/photos
b4a31790d453fdadc4580101cd5a1275217e03f7	refs/heads/river-signs
b7254fa4a69fb826cbbbba235139ef885a386490	refs/tags/v1.0
```

- `refs/heads/...` lines are the server's branches.
- `refs/tags/...` lines are its tags.
- `HEAD` is the branch the server hands out by default.

Use it to see what the server has right now. `git branch -r` shows only what your repository remembers from its last fetch.

| You type | You get |
|---|---|
| `git ls-remote --heads origin` | Only branches |
| `git ls-remote --tags origin` | Only tags |
| `git ls-remote origin main` | Only refs named `main` |
| `git ls-remote --symref origin HEAD` | The name of the server's default branch |
| `git ls-remote https://github.com/git/git.git` | The refs of any repository you can reach, with no clone |

It is also the quickest test of a connection: if `git ls-remote origin` prints refs, the address is right and the server let you in.
