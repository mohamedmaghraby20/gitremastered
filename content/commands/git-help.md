---
id: git-help
command: git help
group: Setup
summary: Opens the manual page of any Git command, without an internet connection.
usage: ["git help <verb>", "git <verb> --help", "git <verb> -h"]
bookSection: "1.7 Getting Help"
bookUrl: https://git-scm.com/book/en/v2/Getting-Started-Getting-Help
lessons: [setup]
---

`git help` opens the full manual page of a Git command. The manual is installed with Git, so it works offline. `<verb>` is the command's name: `config`, `add`, `commit`.

```console
$ git help config
```

On Windows the page opens in your browser. On macOS and Linux it opens in the terminal: scroll with the arrow keys and press `q` to quit.

For a quick reminder of a command's options, `-h` prints a short list in the terminal instead:

```console
$ git add -h
usage: git add [<options>] [--] <pathspec>...

    -n, --[no-]dry-run    dry run
    -v, --[no-]verbose    be verbose
```

| You type | You get |
|---|---|
| `git <verb> -h` | A short option list, in the terminal |
| `git help <verb>` | The full manual page |
| `git <verb> --help` | The same full manual page |
| `git help -a` | A list of every Git command |
| `git help -g` | A list of Git's concept guides |

When you mistype a command, Git suggests the closest one:

```console
$ git comit
git: 'comit' is not a git command. See 'git --help'.

The most similar command is
	commit
```
