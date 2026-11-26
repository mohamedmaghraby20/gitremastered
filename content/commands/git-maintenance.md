---
id: git-maintenance
command: git maintenance
group: Large repositories
summary: Keeps a repository fast by tidying its stored data, once or on a schedule in the background.
usage: ["git maintenance run", "git maintenance start", "git maintenance stop", "git gc"]
bookSection: "Git reference: git-maintenance"
bookUrl: https://git-scm.com/docs/git-maintenance
lessons: [large-repos]
---

`git maintenance run` tidies the repository's stored data once, now: it packs many small object files into few large ones and refreshes the data Git uses to answer quickly. Your commits, branches and files do not change. On success it prints nothing; `git count-objects -vH` shows the effect:

```console
$ git count-objects -vH
count: 39
size: 1.15 MiB
in-pack: 0
packs: 0
size-pack: 0 bytes
prune-packable: 0
garbage: 0
size-garbage: 0 bytes
$ git maintenance run
$ git count-objects -vH
count: 0
size: 0 bytes
in-pack: 39
packs: 1
size-pack: 1.15 MiB
prune-packable: 0
garbage: 0
size-garbage: 0 bytes
```

`count` is the number of objects stored as single files; `in-pack` is the number inside packfiles. All 39 objects moved into one pack.

| You type | What happens |
|---|---|
| `git maintenance run` | Runs the tidy-up tasks once, now |
| `git maintenance run --task=gc` | Runs one named task, here the full `git gc` |
| `git maintenance start` | Registers this repository and asks your operating system to run small tasks in the background, hourly, daily and weekly |
| `git maintenance stop` | Stops the background schedule |
| `git maintenance unregister` | Takes this repository off the list of repositories to maintain |
| `git gc` | The older command: packs objects and removes ones that nothing leads to and that are old enough |

The scheduled tasks are small on purpose, so that they never get in your way: fetching new objects from your remotes ahead of time (no branch moves), packing single object files into packfiles a few at a time, and refreshing the commit graph, a file that makes `git log` faster.

You rarely need `git gc` or `git maintenance run` by hand: Git starts a light tidy-up by itself after some commands. `git maintenance start` is worth it on a large repository you work in every day.

:::careful
`git maintenance start` changes more than this repository: it writes the repository's path into your settings for all projects (`~/.gitconfig`) and adds a scheduled job to your computer. `git maintenance stop` removes the job; `git maintenance unregister` removes the path.
:::
