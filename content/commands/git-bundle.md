---
id: git-bundle
command: git bundle
group: Large repositories
summary: Packs commits into one file that you can carry to another computer and clone or fetch from.
usage: ["git bundle create <file> HEAD <branch>", "git bundle create <file> <old>..<branch>", "git bundle verify <file>", "git bundle list-heads <file>"]
bookSection: "7.12 Bundling"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Bundling
lessons: [large-repos]
---

`git bundle create` writes commits into one ordinary file: everything a `git push` would send, saved to disk. Copy the file to a USB stick or attach it to an email, and the other side can clone or fetch from it with no server and no network.

```console
$ git bundle create ../game.bundle HEAD main
Enumerating objects: 39, done.
Counting objects: 100% (39/39), done.
Delta compression using up to 16 threads
Compressing objects: 100% (28/28), done.
Writing objects: 100% (39/39), 1.15 MiB | 27.99 MiB/s, done.
Total 39 (delta 4), reused 0 (delta 0), pack-reused 0 (from 0)
$ git bundle verify ../game.bundle
../game.bundle is okay
The bundle contains these 2 refs:
3a4f5ae4d838ef0175b61f97e0ccc2519f544624 HEAD
3a4f5ae4d838ef0175b61f97e0ccc2519f544624 refs/heads/main
The bundle records a complete history.
The bundle uses this hash algorithm: sha1
```

The receiver uses the file where a remote's address or name would go:

| You type | What happens |
|---|---|
| `git bundle create repo.bundle HEAD main` | Packs the whole history of `main`. Include `HEAD`, so that a clone knows which branch to start on |
| `git bundle create new.bundle main~2..main` | Packs only the last two commits of `main`, for someone who already has the rest |
| `git bundle create all.bundle --all` | Packs every branch and tag |
| `git bundle verify repo.bundle` | Checks the file, lists its refs, and says which commits your repository must already have. Run it inside a repository |
| `git bundle list-heads repo.bundle` | Lists only the refs in the file |
| `git clone repo.bundle <folder>` | Makes a new repository from a complete bundle |
| `git fetch new.bundle main:other-main` | Records the bundle's `main` as a local branch `other-main`, ready to look at and merge |
| `git pull new.bundle main` | Fetches the bundle's `main` and merges it into the branch you are on |

A bundle that holds only new commits names the commit they are built on. If your repository does not have that commit, Git stops:

```console
$ git bundle verify ../latest.bundle
error: Repository lacks these prerequisite commits:
error: 5a25458d197e51370fa70aff84a7f85720ca7fd2 
```

Ask the sender for a bundle that starts further back, or for a complete one.

:::careful
A complete bundle made without `HEAD` clones with the warning `remote HEAD refers to nonexistent ref, unable to checkout` and an empty working tree. Name the branch yourself: `git clone -b main repo.bundle`.
:::

:::compare
today: "`git bundle create repo.bundle HEAD main`, and `git bundle verify` prints \"The bundle contains these 2 refs\" and \"The bundle records a complete history.\""
book: "Pro Git writes `git bundle create repo.bundle HEAD master`, from the time when the first branch was named `master`, and shows the older wording \"The bundle contains 1 ref\". The commands work the same."
:::
