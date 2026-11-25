---
id: ignoring-files
title: "Ignore files with .gitignore"
module: daily-loop
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#_ignoring
bookSources:
  - book/progit2/book/02-git-basics/sections/recording-changes.asc
readFirst: [three-areas]
---

A `.gitignore` file lists the files Git should leave alone, so build output and logs never clutter `git status` or sneak into a commit.

## Use it

Every project makes files you never want to save: compiled programs, log files, editor backups. Without help, `git status` lists them all as untracked, and one careless `git add .` commits them.

### Write a .gitignore

Create a file named `.gitignore` in the top folder of the project. Each line is a pattern for files to ignore.

```text
# compiled output
build/

# log files
*.log
```

`build/` ignores the whole `build` folder. `*.log` ignores every file ending in `.log`, in any folder. Lines starting with `#` are comments.

:::try-it
1. Create `.gitignore` with the two patterns above.
2. Run `git status`. The ignored files are gone from the list.
3. Commit `.gitignore` so everyone on the team ignores the same files.
:::

The `.gitignore` file itself is a normal file. Commit it like any other, so the rules travel with the project.

:::careful
A `.gitignore` only affects files Git does not track yet. If a file was already committed, adding it to `.gitignore` does not remove it from the repository.
:::

## How it works

Before `git status` lists untracked files, Git checks each one against the patterns in `.gitignore`. A file that matches is treated as if it were not there: it is never listed as untracked, and `git add .` skips it.

Tracked files are different. Once a file is in the staging area or a commit, Git keeps following its changes, whatever `.gitignore` says. Ignoring is only about **untracked** files.

The patterns use the same simple wildcards as the shell:

:::definitions
- term: "*"
  text: Any number of characters. `*.log` matches `app.log` and `logs/error.log`.
- term: "?"
  text: Exactly one character. `file?.txt` matches `file1.txt`.
- term: "/ at the end"
  text: Only folders. `build/` matches the folder and everything inside it.
- term: "! at the start"
  text: Do not ignore after all. `!keep.log` brings back one file.
:::

:::sidenote
Pro Git advises setting up a `.gitignore` before you start, so unwanted files never get committed by accident. (Pro Git 2.2)
:::

## Pro

### More pattern rules

- A pattern starting with `/` only matches in the folder of the `.gitignore`: `/TODO` ignores `TODO` at the top, not `docs/TODO`.
- `**` matches any number of folders: `doc/**/*.pdf` ignores PDFs anywhere under `doc/`.
- A project can have more `.gitignore` files in subfolders. Their rules apply only inside their folder.

### Find out why a file is ignored

`git check-ignore -v <file>` prints the file and the exact line that ignores it. Useful when a file you expect to see is missing from `git status`.

### Stop tracking a file you now want ignored

`git rm --cached <file>` removes the file from the staging area (and so from the next commit) but keeps it on your disk. After that commit, the `.gitignore` rule applies to it.

### Starting points

GitHub keeps ready-made `.gitignore` files for many languages and tools at github.com/github/gitignore.

## Recap

- `.gitignore` lists patterns for files Git should not track.
- `*.log` ignores by name, `build/` ignores a whole folder, `#` starts a comment.
- Commit `.gitignore` so the whole team shares the rules.
- It only affects untracked files. Use `git rm --cached` to stop tracking a committed one.
