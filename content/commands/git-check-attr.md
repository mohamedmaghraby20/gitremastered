---
id: git-check-attr
command: git check-attr
group: Customize Git
summary: Tells you which attributes from .gitattributes apply to a file.
usage: ["git check-attr -a <file>", "git check-attr <attribute> <file>", "git check-attr <attribute> <attribute> -- <file>"]
bookSection: "8.2 Git Attributes"
bookUrl: https://git-scm.com/book/en/v2/Customizing-Git-Git-Attributes
lessons: [attributes]
---

When a rule in `.gitattributes` seems to do nothing, `git check-attr` shows what Git really applies to a file. `-a` lists every attribute the file has.

```console
$ git check-attr -a logo.png deploy.sh README.md
logo.png: binary: set
logo.png: diff: unset
logo.png: merge: unset
logo.png: text: unset
deploy.sh: text: set
deploy.sh: eol: lf
```

Read each line from left to right: the file, the attribute, then its state. A file with no line at all (`README.md` here) matches no rule.

| State | Meaning | Written in `.gitattributes` as |
|---|---|---|
| `set` | The attribute is on | `text` |
| `unset` | The attribute is off | `-text` |
| a value, like `lf` | The attribute holds that value | `eol=lf` |
| `unspecified` | No rule mentions the attribute for this file | (nothing) |

To ask about one attribute, name it in place of `-a`:

```console
$ git check-attr eol deploy.sh README.md
deploy.sh: eol: lf
README.md: eol: unspecified
```

| Option | What it does |
|---|---|
| `-a` | Lists all attributes the file has, instead of the ones you name |
| `--` | Separates attribute names from file names. Needed when you name more than one attribute: `git check-attr text eol -- deploy.sh` |
| `--cached` | Reads `.gitattributes` from the staging area only, and skips the one in the working tree |
| `--stdin` | Reads the file names from standard input, one per line, for use in scripts |

:::careful
Without `--`, Git takes only the first word as an attribute and every other word as a file name. `git check-attr text eol deploy.sh` asks about the `text` attribute of a file called `eol`.
:::

The file does not have to exist: Git only compares the name you give with the patterns. That makes `git check-attr` a quick way to test a pattern before you commit it.
