---
id: git-grep
command: git grep
group: History
summary: Searches the tracked files of your project, or of any commit, for a text or pattern.
usage: ["git grep -n <text>", "git grep --count <text>", "git grep -n -p <text>", "git grep -n <text> <commit>", "git grep -n -e <text> --and -e <text>"]
bookSection: "7.5 Searching"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Searching#_git_grep
lessons: [search-blame-bisect]
---

`git grep <text>` prints every line of your tracked files that contains the text. It only reads. With `-n`, each result is `file:line number:the line`.

```console
$ git grep -n shipping_fee
pricing.sh:14:shipping_fee() {
pricing.sh:33:    shipping=$(shipping_fee "$items")
receipt.sh:8:echo "Shipping: $(shipping_fee "$items")"
```

Put a commit, branch or tag after the text to search the files as they were there. Nothing is checked out, and each result starts with the name you gave:

```console
$ git grep -n shipping_fee v1.0
v1.0:order.sh:12:shipping_fee() {
v1.0:order.sh:22:  shipping=$(shipping_fee "$items")
```

The text is a pattern (a regular expression); a plain word matches itself. When nothing matches, `git grep` prints nothing.

| Option | What it does |
|---|---|
| `-n` | Adds the line number to each result |
| `-c`, `--count` | Prints one line per file: the file and how many lines match |
| `-p`, `--show-function` | Adds the line that opens the function around each match, marked with `=` |
| `-l` | Prints only the names of the files that match |
| `-i` | Ignores upper and lower case |
| `-w` | Matches whole words only: `-w total` skips `cart_total` |
| `-e <text>` | Names a pattern; needed when you give more than one |
| `--and` | Between two `-e` patterns: both must be on the same line. Without it, either one is enough |
| `-E` | Allows richer patterns, like `"[0-9]+"` for one or more digits |
| `--break --heading` | Prints each file name once, above its matches, with a blank line between files |
| `--untracked` | Also searches untracked files |
| `-- "*.sh"` | Limits the search to some paths, here the files ending in `.sh` |

`git grep` finds where a text is. To find the commit that added or removed it, use `git log -S <text>`.
