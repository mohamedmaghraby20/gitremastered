---
id: three-areas
title: "Status, stage, commit: the three areas"
module: daily-loop
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository
bookSources:
  - book/progit2/book/02-git-basics/sections/recording-changes.asc
readFirst: [first-look-inside, start-a-repo]
---

Every change you save in Git goes through three places, and three commands move it along: `git status` shows where things are, `git add` picks what goes next, `git commit` saves it.

## Use it

You will run these three commands many times a day. Here is the loop.

:::definitions
- term: Working folder
  area: working
  text: The files you see and edit. Git notices changes here but saves nothing yet.
- term: Staging area
  area: staging
  text: The next commit, being put together. You choose what goes in.
- term: Repository
  area: repository
  text: Every commit you have saved, kept inside the hidden `.git` folder.
:::

### See where your files are

`git status` tells you which files changed and where each change sits. Run it before and after every other command. It costs nothing and it answers most "what just happened?" questions.

```console
$ git status
On branch main
Changes not staged for commit:
  modified:   README.md

Untracked files:
  notes.txt
```

Two kinds of files show up here. **Untracked** files are new: Git has never saved them. **Modified** files are ones Git already knows, changed since the last commit.

### Pick what goes into the next commit

`git add` copies a file, exactly as it is right now, into the staging area.

:::try-it
1. Run `git add notes.txt`.
2. Run `git status` again.
3. Find `notes.txt` under "Changes to be committed".
:::

You can stage one file, several, or a whole folder (`git add docs/`). Staging only what belongs together keeps each commit about one thing, which makes history easy to read later.

:::careful
`git add` stages the file as it is at that moment. If you edit it again afterwards, the new edit is not staged. Run `git add` once more to include it.
:::

### Save it

`git commit` saves everything in the staging area as one snapshot in the repository. The `-m` option gives it a message.

```console
$ git commit -m "Add release notes"
[main 463dc4f] Add release notes
 1 file changed, 1 insertion(+)
```

Git prints the branch, the start of the new commit's ID (`463dc4f`) and a short summary. Anything you did not stage stays in your working folder, still changed, ready for a later commit.

The loop is always the same: edit, `git status`, `git add`, `git commit`, `git status`.

## How it works

Git keeps three copies of your project in mind at once.

The **working folder** holds the files you edit. The **staging area** (Git's own docs also call it the **index**) is a file inside `.git` that describes what the next commit will contain. The **repository** is the `.git` folder itself, with every commit you have made.

Each file moves through a small life cycle:

1. A new file starts **untracked**.
2. `git add` makes it **staged**.
3. `git commit` saves it; it is now **tracked and unmodified**.
4. Edit it and it becomes **modified**.
5. `git add` stages it again, and the cycle repeats.

`git status` works by comparing the three copies. Working folder against staging area gives you "Changes not staged for commit". Staging area against the last commit gives you "Changes to be committed". Files in neither are untracked.

That is why one file can appear in both lists at once. The staging area holds the version from your last `git add`, and the working folder holds your newer edit. Git commits the staged version, not the one on your screen.

:::sidenote
Pro Git suggests reading `git add` as "add precisely this content to the next commit", not "add this file to the project". (Pro Git 2.2)
:::

## Pro

### Short status

`git status -s` prints one line per file with two columns. The left column is the staging area, the right column is the working folder.

```console
$ git status -s
 M README.md
MM app.js
A  notes.txt
?? draft.txt
```

`README.md` is changed but not staged. `app.js` was staged, then changed again. `notes.txt` is a new staged file. `draft.txt` is untracked.

### Skip the staging area, carefully

`git commit -a -m "..."` stages every change to tracked files and commits in one step. It is quick, and it is also how unrelated edits sneak into a commit. It never picks up untracked files.

### See the diff while you write the message

`git commit -v` opens your editor with the full diff below the message, so you can check what you are about to save.

### Unstaging: new and old commands

Older guides, including the examples in Pro Git, show older commands in `git status` hints. Current Git suggests `git restore`.

:::compare
today: "`git restore --staged notes.txt` takes a file back out of the staging area. Your edits stay in the working folder."
book: "`git reset HEAD notes.txt` does the same and still works. You will see it in older guides and answers online."
:::

## Recap

- `git status` shows which area each change is in. Run it often.
- `git add <file>` stages a file as it is right now.
- `git commit -m "message"` saves the staging area as one snapshot.
- Edit after `git add`? Run `git add` again, or the new edit stays out.
- Stage only what belongs together, so each commit does one job.
