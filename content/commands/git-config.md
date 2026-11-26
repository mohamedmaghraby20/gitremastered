---
id: git-config
command: git config
group: Setup
summary: Reads and writes Git's settings, for one repository or for your whole computer.
usage: ["git config <key>", "git config <key> <value>", "git config --global <key> <value>", "git config --list --show-origin"]
bookSection: "1.6 First-Time Git Setup"
bookUrl: https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup
lessons: [setup]
---

`git config` reads and writes Git's settings, such as your name, your email and your editor. With a key alone it prints the value in use; with a key and a value it stores the value.

```console
$ git config --global user.name "Ada Lovelace"
$ git config user.name
Ada Lovelace
```

Settings live at three levels, and **the closest level wins**:

| Option | Level | Applies to | File |
|---|---|---|---|
| `--system` | System | Every user of this computer | `etc/gitconfig` in the Git installation |
| `--global` | Global | You, in every repository | `~/.gitconfig` |
| none (or `--local`) | Local | One repository | `.git/config` |

| You type | What happens |
|---|---|
| `git config user.name` | Prints the value that wins here |
| `git config user.name "Ada at Work"` | Sets it for this repository only |
| `git config --global core.editor "code --wait"` | Sets your editor everywhere |
| `git config --global init.defaultBranch main` | New repositories start on `main` |
| `git config --list --show-origin` | Lists every setting with the file it comes from |
| `git config --show-scope user.name` | Prints the level that wins, then the value |
| `git config --unset user.name` | Removes the local value |
| `git config --global --edit` | Opens your global file in the editor |

:::careful
Put values with spaces in quotes. `git config user.name Ada Lovelace` stores only `Ada` and reports no error. Git does not check keys either: a typo like `user.nmae` is stored and then ignored.
:::
