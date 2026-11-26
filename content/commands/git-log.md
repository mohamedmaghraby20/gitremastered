---
id: git-log
command: git log
group: History
summary: Lists the commits of your project, newest first, all of them or only the ones you filter for.
usage: ["git log", "git log --oneline", "git log -p -- <path>", "git log --author=<name> --since=<date>"]
bookSection: "2.3 Viewing the Commit History"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History
lessons: [reading-history]
---

`git log` shows the history of the branch you are on: each commit with its ID, author, date and message. It only reads. Long output opens in a pager: Space for the next screen, `q` to quit.

```console
$ git log --oneline -3
426f9a4 Add free shipping over 50
a9ed8dc Remove the discount code
3013328 Describe how to run the tests
```

**How much to show**

| Option | Shows |
|---|---|
| `--oneline` | One line per commit: short ID and message |
| `-3` or `-n 3` | Only the newest three commits |
| `--stat` | The files each commit changed, with line counts |
| `-p` | The changed lines of each commit (the diff) |
| `--graph` | A drawing of branches and merges beside the list |
| `--pretty=format:"%h %an %ar %s"` | Your own columns: short ID, author, relative date, message |

**Which commits to show**

| Option | Keeps commits |
|---|---|
| `--since="2 weeks ago"`, `--until="2026-10-31"` | Made after, or before, a date |
| `--author="Omar Haddad"` | Whose author name or email contains the text |
| `--grep=checkout` | Whose message contains the text |
| `-S applyDiscount` | That added or removed the text in a file |
| `-- cart.js` | That changed this file or folder |

Filters stack: a commit must pass all of them. Options go first, the path goes last, after `--`.

```console
$ git log --oneline --author="Omar Haddad" --since="2026-11-01" -- cart.js
a9ed8dc Remove the discount code
```

:::careful
Anything after `--` is read as a path. `git log -- --author=Omar` prints nothing and gives no error, because no file has that name.
:::
