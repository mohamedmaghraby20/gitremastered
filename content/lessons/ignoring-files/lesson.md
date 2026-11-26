---
id: ignoring-files
title: "Ignore files with .gitignore"
module: daily-loop
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#_ignoring
bookSources:
  - book/progit2/book/02-git-basics/sections/recording-changes.asc
  - book/progit2/book/08-customizing-git/sections/config.asc
readFirst: [three-areas]
---

Run your build or install your packages, and `git status` suddenly lists files you must never save: thousands of them, sometimes with passwords inside. A `.gitignore` file tells Git which files to leave alone, so they stay out of your status and out of every commit.

## Must know

In [the last lesson](lesson:three-areas) you saw that Git lists every new file as [untracked](term:untracked-file) and waits for you to decide. That is safe, but noisy: every project makes files nobody should save.

### Files that do not belong in Git

Three kinds of files show up in almost every project:

- **Build output and installed packages.** What your tools make from your code: `node_modules/` in JavaScript, `__pycache__/` in Python, `build/` or `dist/` folders, compiled `.o` and `.exe` files. Anyone can make them again from your code and a short list of packages (`package.json`, `requirements.txt`), so saving them only bloats the project.
- **Logs and temporary files.** `app.log`, `debug.txt`, editor backups like `notes.txt~`. Your tools write them while running; they mean nothing to anyone else.
- **Secrets and personal settings.** `.env` files with passwords or API keys, your editor's settings folder. These must never reach a shared repository: once pushed, a password is public.

The problem: Git lists all of them as untracked, and one careless `git add .` saves them forever.

### Write a `.gitignore`

A `.gitignore` is a plain text file in the top folder of your project. Each line is a **pattern** (a [glob pattern](term:glob-pattern)): a short rule that matches file names, like `*.log` for "every file ending in .log". Git skips every untracked file that matches.

```text
# Build output
build/

# Log files
*.log
```

Read it line by line:

- `# Build output`: a line starting with `#` is a comment, for people. Git skips it, and blank lines too.
- `build/`: a name ending in `/` matches a folder, and everything inside it.
- `*.log`: `*` means "any characters", so this matches every file ending in `.log`, in every folder of the project.

Practise with a file of your own, so the practice project's files stay as they are for the challenges at the end (short real jobs on its build folder and log file).

:::try-it
1. Make a scratch file: `echo "draft" > ideas.tmp`. Run `git status`: Git lists `ideas.tmp` as untracked.
2. Create a `.gitignore` that ignores it: `echo "*.tmp" > .gitignore`.
3. Run `git status` again. The file `ideas.tmp` is gone from the list: Git now skips it. The new file `.gitignore` appears instead, as untracked.
4. Don't commit yet: the first challenge at the end of the lesson finishes this `.gitignore`.
:::

### Commit the `.gitignore` itself

The `.gitignore` is an ordinary file. Commit it like any other, and every person who works on the project gets the same rules. If you keep it to yourself, each teammate has to rediscover which files to skip.

### Patterns you will use every day

| Pattern | Matches | Example |
|---|---|---|
| `*.log` | Every file ending in `.log`, in any folder | `app.log`, `logs/error.log` |
| `build/` | A folder named `build`, anywhere, with everything in it | `build/app.exe` |
| `/TODO` | `TODO` only in the top folder | `TODO`, not `docs/TODO` |
| `doc/*.txt` | `.txt` files directly inside `doc` | `doc/notes.txt`, not `doc/api/list.txt` |
| `doc/**/*.pdf` | `.pdf` files in `doc` or any folder below it | `doc/a.pdf`, `doc/api/b.pdf` |
| `!lib.a` | Brings back one file that an earlier line ignored | Keeps `lib.a` after `*.a` |

Two rules explain most surprises:

- A pattern **without a slash** in it matches anywhere in the project. A pattern **with a slash** at the start or in the middle is read from the folder the `.gitignore` is in.
- When several lines match one file, the **last one wins**. That is how `!lib.a` after `*.a` brings `lib.a` back.

:::careful
`.gitignore` only affects files Git does not track yet. If a file is already committed, adding it to `.gitignore` changes nothing: Git keeps saving its changes. The Advanced layer shows how to stop tracking it.
:::

### Start from a template

You don't have to write a `.gitignore` from nothing. GitHub keeps ready-made ones for most languages and tools at github.com/github/gitignore. Pro Git advises setting one up before your first commit, so unwanted files never get saved by accident.

## Under the hood

"Must know" showed what to write. This layer shows how Git decides whether a file is ignored.

### When Git checks the patterns

Git checks the patterns only for **untracked** files, at the moment it lists them:

- `git status` hides a matching file from "Untracked files".
- `git add .` and `git add -A` skip it.

A file that is already tracked never goes through this check. Git follows it because it is in the index (the staging area) and in commits, whatever `.gitignore` says.

### Glob patterns

The patterns are **globs**, the same simple wildcards your shell uses (Pro Git calls them "simplified regular expressions"):

:::definitions
- term: "*"
  text: Any number of characters, but never a `/`. `*.log` matches `app.log`.
- term: "?"
  text: Exactly one character. `file?.txt` matches `file1.txt`, not `file10.txt`.
- term: "[abc]"
  text: One character from the list. `*.[oa]` matches `main.o` and `lib.a`.
- term: "[0-9]"
  text: One character in the range. `log[0-9].txt` matches `log7.txt`.
- term: "**"
  text: Any number of folders, even none. `a/**/z` matches `a/z`, `a/b/z`, `a/b/c/z`.
:::

### Where Git looks for patterns

A file can be ignored by rules in several places. Git reads them all:

1. A `.gitignore` in the same folder as the file, then in each parent folder up to the top. Rules in a deeper folder only apply inside it.
2. `.git/info/exclude`, a personal list for this repository that is never committed.
3. Your global ignore file, set with `core.excludesFile`, for every repository on your computer.

The closer file wins: a rule in `src/.gitignore` beats one in the top `.gitignore`. Inside one file, the last matching line wins.

:::sidenote
The Linux kernel's source has over 200 `.gitignore` files, one in many of its folders. (Pro Git 2.2)
:::

## Advanced

### Find out why a file is ignored

When a file you expect is missing from `git status`, ask Git which rule hides it:

```console
$ git check-ignore -v ideas.tmp
.gitignore:1:*.tmp	ideas.tmp
```

The answer names the file, the line number and the pattern: line 1 of `.gitignore`, `*.tmp`.

To see every ignored file, run `git status --ignored`. They appear in their own list, "Ignored files".

### You can't bring back a file inside an ignored folder

`!` cannot re-include a file if its folder is ignored. Git never looks inside an ignored folder, so it never sees the file:

```text
build/
!build/keep.txt
```

`build/keep.txt` stays ignored. To keep one file, ignore the folder's contents instead of the folder: `build/*` followed by `!build/keep.txt`.

### Stop tracking a file you now want ignored

If a file was committed by mistake, adding it to `.gitignore` is not enough. Remove it from the index, keep it on disk, and commit:

```console
$ git rm --cached secrets.env
$ git commit -m "Stop tracking secrets.env"
```

From then on the `.gitignore` rule applies to it. Old commits still contain the file: a password that was pushed must be changed. The "Rewrite history" lessons show how to remove a file from old commits.

### Personal and global ignore lists

- Files only you make in one project (your notes, a test script) go in `.git/info/exclude`. Same pattern rules, never committed.
- Files your tools make in every project (`.DS_Store` on macOS, `Thumbs.db` on Windows, editor folders) go in a global file. Pro Git 8.1 shows setting it once:

```console
$ git config --global core.excludesFile ~/.gitignore_global
```

### Add an ignored file anyway

`git add -f <file>` (force) stages a file even though a pattern matches it. Once tracked, Git follows it like any other file.

## Recap

- `.gitignore` lists patterns for untracked files Git should skip: build output, logs, secrets.
- `*.log` matches by name anywhere, `build/` a folder, `/TODO` only at the top, `!` brings a file back.
- Commit `.gitignore` so the whole team shares the rules.
- It never affects tracked files: use `git rm --cached` to stop tracking one.
- `git check-ignore -v <file>` tells you which rule ignores a file.
