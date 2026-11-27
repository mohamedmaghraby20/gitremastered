---
id: commit-craft
title: "Commit messages and atomic commits"
module: working-in-a-team
bookSection: "5.2 Contributing to a Project"
bookUrl: https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project
bookSources:
  - vendor/progit2/book/05-distributed-git/sections/contributing.asc
  - vendor/progit2/book/08-customizing-git/sections/config.asc
readFirst: [three-areas]
---

A bug shows up, you open the history to find where it came from, and you read "Update stuff", "fix", "more changes". Each of those commits mixes three jobs, and none says why. This lesson teaches you to make commits a teammate can review, undo and understand: one job per commit, a clean diff, and a message that explains the change.

## Must know

In [Status, stage, commit: the three areas](lesson:three-areas) you learned how to make a [commit](term:commit): stage the changes, then record them with a message. That is enough when you work alone. In a team, other people read your commits: a reviewer today, and whoever hunts a bug next year (often you). So two new questions appear. What belongs in one commit? And what should its message say?

Pro Git answers with three guidelines, and this lesson follows them in order of importance:

1. Each commit holds one logical change.
2. The change has no whitespace errors.
3. The message has a fixed shape and says why.

### One commit, one job

A good commit does one job: it fixes one bug, or adds one feature, or updates one piece of documentation. Pro Git calls this a "logically separate changeset". Most teams call it an **atomic commit**.

:::definitions
- term: Atomic commit
  text: "A commit that holds one complete job and nothing else. \"Atomic\" means it cannot be split into smaller useful pieces, and it does not need another commit to make sense."
:::

Here is a small example. The practice project on the right is a tiny shop app. Two things changed in its working tree:

```console
$ git status -s
 M README.md
 M cart.js
```

- `cart.js`: a bug fix. The cart total ignored the quantity of each item.
- `README.md`: a new section that says how to run the tests.

These are two jobs. You could record them in one commit or in two:

:::graph
caption: "One commit for both jobs: the message cannot describe it honestly"
commits:
  - id: A
    message: Add shop app with cart total
  - id: B
    message: Update stuff
    parents: [A]
branches:
  main: B
head: main
:::

:::graph
caption: "Two commits, one job each"
commits:
  - id: A
    message: Add shop app with cart total
  - id: B
    message: Fix cart total for quantities above one
    parents: [A]
  - id: C
    message: Document how to run the tests
    parents: [B]
branches:
  main: C
head: main
:::

Why the second history is better:

| Later, someone wants to… | With one mixed commit | With two commits |
|---|---|---|
| Review the bug fix | Reads the README change too, and wonders if it is related | Reads three lines of `cart.js` |
| Undo the README section | Undoing the commit also brings the bug back | Undoes one commit; the fix stays |
| Find when the bug was fixed | The message "Update stuff" hides it | The message names it |

Pro Git gives the picture to avoid: coding all weekend on five different issues and handing them in as one massive commit on Monday.

What stays the same: your files. The project ends up identical whether you make one commit or five, as long as every change gets committed. Splitting changes only how the history reads, so it costs you nothing in the result.

Two common wrong ideas:

- "Atomic means tiny" or "one file per commit". No. The unit is the job, not the file. A bug fix and the test that proves it belong together, even if they touch four files.
- "A commit is a backup of where I stopped tonight." A backup is fine while you work alone, but a commit you share should make sense to someone who was not there.

### Split a mixed working tree

You know why to split. Now the how, which uses only commands you already have: the [staging area](term:staging-area) lets you pick which changes go into the next commit, so you fill it once per job.

The routine for each job:

1. `git status -s` and `git diff`: see everything that changed.
2. `git add <files of one job>`: stage that job only.
3. `git diff --staged`: read what is staged. This is your last look before it becomes history. ([Read any diff: working, staged, between commits](lesson:diffs-in-depth) covers both diff commands.)
4. `git commit`: record it with a message about that job.

Then repeat for the next job, until `git status` is clean.

:::predict
question: "Two unrelated files are new: calls.txt and garden.txt. You run git add calls.txt and then git commit. What does git status -s show for garden.txt afterwards?"
answer: "?? garden.txt, exactly as before. A commit takes only what is staged, so garden.txt stays in the working tree, untouched, waiting for its own commit."
:::

Practise on files of your own, so `cart.js` and `README.md` stay as they are for the challenges at the end.

:::try-it
1. Create two unrelated files: `echo "Call the bank" > calls.txt` and `echo "Plant tomatoes in May" > garden.txt`. In the picture, two sheets marked "new" appear in the working tree.
2. Run `git status -s`. Git lists `?? calls.txt` and `?? garden.txt`, next to the two practice files marked ` M`. Four changes, and they are not one job.
3. Run `git add calls.txt`. In the picture, the `calls.txt` sheet slides from the working tree into the staging area. The other three stay where they are.
4. Run `git diff --staged`. Git shows one new file, `calls.txt`, with the line `+Call the bank`. Nothing else is staged, so nothing else will be in the commit.
5. Run `git commit -m "Add call list"`. In the picture, the staging area empties, a new station appears on the history map, and the `main` label moves onto it.
6. Run `git add garden.txt`, then `git commit -m "Add garden notes"`. A second station appears.
7. Run `git log --oneline -2`. Two lines, one per job, each with a message that describes exactly one thing.
:::

```console
$ git log --oneline -2
48f0f64 Add garden notes
05cd659 Add call list
```

(Your commit IDs will differ from the ones printed in this lesson.)

That was the easy case: each job lives in its own file. Sometimes one file holds two jobs, for example a bug fix at the top of `cart.js` and a half-finished feature at the bottom. `git add` can also stage part of a file; Pro Git names the option, `git add --patch`. It has its own lesson, [Stage part of a file](lesson:partial-staging).

:::careful
`git add .` and `git commit -a` stage every change at once, which is the opposite of splitting. They are fine when everything you changed is one job. When it is not, name the files.
:::

### Check for whitespace errors with `git diff --check`

Your commit now holds one job. Before you commit, Pro Git asks for one more check on its content: no whitespace errors.

**Whitespace** is every character you cannot see: spaces, tabs, and the end of a line. A **whitespace error** is whitespace that does nothing, most often spaces left at the end of a line (**trailing whitespace**). Editors add them easily, for example when you press space and then Enter.

They look harmless, and the program runs the same. The trouble comes later:

- The line counts as changed, so it shows up in the [diff](term:diff) a reviewer has to read.
- When a teammate's editor removes the spaces, that line changes again, in a commit about something else. Two people who touch the same line this way can end up with a conflict over nothing.

`git diff --check` reads your changes and lists every whitespace error in them. It prints nothing when there are none.

:::try-it
1. Add a line with three spaces at its end: `echo "Call the dentist   " >> calls.txt`. In the picture, a `calls.txt` sheet marked "modified" appears in the working tree.
2. Run `git diff calls.txt`. The new line looks perfect. Depending on your terminal's colors you may see the spaces as a red block, but you cannot count on it.
3. Run `git diff --check`. Git prints `calls.txt:2: trailing whitespace.` and the line itself: the file, the line number and the kind of error.
4. Remove the spaces. Open `calls.txt` in your editor and delete them, or run `sed -i 's/[[:space:]]*$//' calls.txt`, which deletes the whitespace at the end of every line of the file.
5. Run `git diff --check` again. Git prints nothing: the change is clean.
6. Run `git add calls.txt`, then `git commit -m "Add dentist to call list"`. In the picture, the `calls.txt` sheet passes through the staging area and a new station appears on the history map.
:::

```console
$ git diff --check
calls.txt:2: trailing whitespace.
+Call the dentist   
```

Two things to know about this command:

- It only reports. It does not fix anything, and Git does not refuse a commit that has whitespace errors. The habit is yours: run it before you commit.
- It checks only lines you added or changed. Old trailing spaces elsewhere in the file are not your job in this commit, and cleaning them up here would mix two jobs again.

Many editors can remove trailing whitespace every time you save a file. Turn that on and this check will almost always be silent.

### The shape of a commit message

The commit's content is right: one job, clean. The other half of the craft is the message, the only part of a commit written for people.

So far you wrote one line with `-m`. A full message has up to three parts, and Pro Git gives the shape nearly every project follows:

```text
Fix cart total for quantities above one

The total added each item's price once, whatever its quantity, so
an order of three books was charged as one. Multiply the price by
the quantity before adding it.
```

| Part | Rule | Why |
|---|---|---|
| **Subject**: the first line | About 50 characters or less; starts with a capital letter | `git log --oneline` and many other tools show only this line. Short subjects fit on one row |
| **Blank line** | Always, when there is a body | It tells Git where the subject ends. Pro Git calls it critical |
| **Body**: the rest | Optional. Lines of about 72 characters. Says why | `git log` does not wrap long lines for you, and it indents the message by four spaces. 72 still fits a classic 80-column terminal |

People call this the **50/72 rule**. Both numbers are guides, not limits Git checks: a 54-character subject is fine, a 90-character one is a sign that the commit does two jobs or that detail belongs in the body.

A small commit does not need a body. "Fix typo in README" says it all.

### Write the subject as an order

Pro Git asks for the **imperative** mood: the form you use to give an order. Write "Fix bug", not "Fixed bug" or "Fixes bug".

| Write | Not |
|---|---|
| Fix cart total for quantities above one | Fixed the cart total |
| Add coupon codes | Adding coupon codes |
| Remove unused login helper | Removes some old code |

The reason is consistency with Git itself. The messages Git writes for you are orders too: `Merge branch 'hotfix'`, `Revert "Add contact page"`. A history where every line has the same form reads like a list of steps.

A quick test: a good subject completes the sentence "If applied, this commit will …". "If applied, this commit will *fix cart total for quantities above one*" works. "If applied, this commit will *fixed the cart total*" does not.

### The body says why

The diff already shows *what* changed, line by line, and it is always exact. What the diff cannot show is *why*: what was wrong, and why you chose this fix. That is the body's job.

Pro Git passes on the Git project's own rule: explain your motivation for the change, and contrast the new behavior with the old. Look at the example above. Its first sentence is the old behavior and why it was wrong; its second is what the commit does about it.

Things a body is good for:

- The problem, as the user saw it ("an order of three books was charged as one").
- Why this solution, if another one looks more obvious.
- A side effect the reader should expect.

Things that do not belong: a retelling of the diff ("changed line 4"), or the story of your afternoon.

### Write a longer message

The `-m` you know writes one line. There are two ways to add a body.

**In the editor.** Run `git commit` with no `-m`, and Git opens your text editor, as you saw in the three areas lesson. Write the subject on the first line, leave the second line blank, then write the body. This is the comfortable way for anything longer than a sentence.

Add `-v` and the editor also shows the diff you are about to commit, below the message area:

```console
$ git commit -v

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# On branch main
# Changes to be committed:
#	modified:   garden.txt
#
# ------------------------ >8 ------------------------
# Do not modify or remove the line above.
# Everything below it will be ignored.
diff --git a/garden.txt b/garden.txt
index a0dd6c9..013f569 100644
--- a/garden.txt
+++ b/garden.txt
@@ -1,2 +1,3 @@
 Plant tomatoes in May
 Water twice a week
+Prune in February
```

`git commit -v` is worth making a habit: you describe the change while looking at it, and you get one last chance to spot a line that belongs to another job. Git leaves everything below the scissors line (`>8`) out of the message.

**With a second `-m`.** Each `-m` becomes its own paragraph, and Git puts the blank line between them. This is quick for a one-sentence body.

:::predict
question: "You commit with -m \"Add watering schedule\" and a second -m that holds a sentence of explanation. What will git log --oneline show for this commit?"
answer: "Only \"Add watering schedule\". The one-line view shows the subject and nothing else. That is why the subject has to make sense alone, and why the reason goes in the body: people who need it open the full commit."
:::

:::try-it
1. Add a line to your garden file and stage it: `echo "Water twice a week" >> garden.txt`, then `git add garden.txt`. In the picture, the `garden.txt` sheet sits in the staging area.
2. Run `git commit -m "Add watering schedule" -m "Nobody knew how often to water, and the tomatoes dried out last summer."`. In the picture, a new station appears on the history map and the `main` label moves onto it.
3. Run `git log -1`. Git shows the full message of the last commit: the subject, a blank line, and the body.
4. Run `git log --oneline -1`. Only the subject appears.
:::

```console
$ git log -1
commit 8c592f394d32924bbf8cc582fb9d16c49b786ab6
Author: Practice Student <student@example.com>
Date:   Fri Nov 27 01:07:29 2026 +0300

    Add watering schedule
    
    Nobody knew how often to water, and the tomatoes dried out last summer.
$ git log --oneline -1
8c592f3 Add watering schedule
```

### Conventional Commits

The 50/72 shape makes messages readable for people. Many teams add one more rule on top, so that programs can read the messages too. It is called **Conventional Commits**. It is not in Pro Git and it is not a Git feature: it is an agreement about how the subject line starts, published as a short public specification (conventionalcommits.org).

The subject starts with a **type**, a colon and a space, then the description:

```console
$ git log --oneline
ab466c3 fix(cart): round totals to two decimals
592e49a feat!: charge prices in cents
8e5ba40 feat: add coupon codes
b100fed fix: return zero for an empty cart
b2562aa docs: describe the shop in the README
c0edb1b feat: add cart total
```

The type says what kind of change the commit is:

| Type | The commit… | Comes from |
|---|---|---|
| `feat` | Adds a new feature | The specification |
| `fix` | Fixes a bug | The specification |
| `docs` | Changes documentation only | Common team habit |
| `test` | Adds or corrects tests | Common team habit |
| `refactor` | Restructures code without changing what it does | Common team habit |
| `chore` | Does upkeep: tool settings, dependency updates | Common team habit |

Only `feat` and `fix` are defined by the specification; it allows other types, and each team keeps its own short list. Use the list of the project you are in.

Two extras you will see in the log above:

- **A scope**, in brackets after the type, names the part of the project: `fix(cart): …`. It is optional, and useful in a large project.
- **A breaking change** is a change that forces people who use the code to change theirs: a function that now returns something different, a setting that was removed. Mark it with `!` before the colon, or with a last line in the body that starts with `BREAKING CHANGE:`, or both:

```text
feat!: charge prices in cents

BREAKING CHANGE: cartTotal now returns cents, not euros. Divide by
100 before you show it.
```

Why teams bother:

| Benefit | How |
|---|---|
| The history can be scanned and filtered | `git log --oneline --grep="^fix"` lists every bug fix (the `^` means "at the start of a line") |
| Release notes write themselves | A tool collects the `feat` and `fix` subjects since the last release into a change list |
| The next version number follows from the commits | A `fix` raises the patch number, a `feat` the minor number, a breaking change the major number. [Tags: mark a release](lesson:tags-and-releases) explains the three numbers |
| It forces the atomic question | If you cannot pick one type, the commit probably does two jobs |

```console
$ git log --oneline --grep="^fix"
ab466c3 fix(cart): round totals to two decimals
b100fed fix: return zero for an empty cart
```

Everything from the earlier sections still applies: a short subject in the imperative, a blank line, a body that says why. One habit differs: after the type, most teams start the description with a small letter ("fix: return zero…"), while Pro Git's shape starts with a capital.

:::careful
A message style is a team decision. Before your first commit in a project, run `git log --oneline -15` and copy what you see: types or no types, capital or small letter. A history with one style is worth more than the "best" style used by one person.
:::

### When it goes wrong

Three situations almost everyone meets while learning this.

**You closed the editor without a message.**

```console
$ git commit
Aborting commit due to empty commit message.
```

Git made no commit, because a commit needs a message. Nothing is lost: your changes are still staged. Run `git commit` again and write the message, then save before you close the editor.

**You forgot the blank line.** You wrote the subject and the body on two lines with nothing between them:

```console
$ git log --oneline -1
4f0df94 Add harvest month The tomatoes are ripe in August.
```

Git read both lines as one long subject, because the subject only ends at a blank line. If the commit is your latest and you have not shared it, rewrite the message with `git commit --amend` and put the blank line in. [Fix the last commit (amend)](lesson:fix-last-commit) covers it.

**You committed two jobs in one commit.** You notice right after committing:

```console
$ git show --stat --oneline HEAD
1167449 Fix cart total
 README.md | 4 ++++
 cart.js   | 2 +-
 2 files changed, 5 insertions(+), 1 deletion(-)
```

The message says "cart", but `README.md` is in there too. ([HEAD](term:head) is Git's name for the commit you are on.) If you have not shared the commit, take it back and split it:

```console
$ git reset HEAD~1
Unstaged changes after reset:
M	README.md
M	cart.js
```

`git reset HEAD~1` removes the last commit from the branch and keeps its changes in your working tree, unstaged, so you can stage and commit them one job at a time. [Reset demystified: the three trees](lesson:reset-demystified) explains the command. If the commit is already shared, leave it: a mixed commit is a small flaw, and rewriting shared history is a bigger one.

## Under the hood

"Must know" gave you rules: one job, a blank line, `--check` before committing. This layer shows what Git does with them, so the rules stop looking arbitrary.

### Where the message lives

A commit is a small text object in the repository. You can print the one you made in the last Try-it:

```console
$ git cat-file -p HEAD
tree 4697bffa845896c81b3424842eac136b8ff575c1
parent 682671eb0fe96eae9e6ff2a58c6dcc551c06dcb1
author Practice Student <student@example.com> 1795730849 +0300
committer Practice Student <student@example.com> 1795730849 +0300

Add watering schedule

Nobody knew how often to water, and the tomatoes dried out last summer.
```

The first lines are data Git needs: the snapshot (`tree`), the commit before (`parent`), who and when. Then comes a blank line, and everything after it is your message, stored exactly as you wrote it.

To Git the message is free text. It has no field called "subject". Git's tools simply agree on one convention: the text up to the first blank line is the subject, and the rest is the body. You can ask for each half:

```console
$ git log -1 --format=%s
Add watering schedule
$ git log -1 --format=%b
Nobody knew how often to water, and the tomatoes dried out last summer.
```

That one convention explains the rules of Must know:

- The blank line matters because it is the only thing that separates subject from body. Leave it out and Git joins the lines into one subject, as you saw in "When it goes wrong".
- The subject must be short because every compact view shows it alone: `git log --oneline`, `git shortlog`, the `Revert "…"` message Git writes when you undo a commit, and the list of commits on a hosting site.
- The 50, the 72, the imperative and the types of Conventional Commits are all agreements between people. Git stores whatever you give it.

Because the message is part of the commit object, it is also part of what the commit's ID is computed from. Changing one letter of a message makes a new commit with a new ID. That is why you fix a message with `--amend` only before you share the commit.

### What `--check` looks at

`git diff --check` is an ordinary `git diff` with a different printout. Two facts follow from that.

**It compares the same areas as `git diff`.** Plain `git diff` compares the working tree with the staging area. Once you have staged a change, there is no difference left between those two, so `--check` has nothing to read and prints nothing, even when the staged change is full of trailing spaces:

```console
$ git add receipt.js
$ git diff --check
$ git diff --staged --check
receipt.js:6: trailing whitespace.
+  const thanks = "Thank you for your order";  
receipt.js:7: trailing whitespace.
+  return thanks;   
```

To check what you are about to commit, use `git diff --staged --check`. And remember what staging keeps: a photo of the file. If you fix the spaces in the working tree, the staging area still holds the old photo. Run `git add` again before you commit.

**It reports what Git's settings call an error.** Pro Git's chapter on configuration lists the kinds, set by `core.whitespace`. Three are on unless you turn them off:

| Kind | What it catches | Message you see |
|---|---|---|
| `blank-at-eol` | Spaces or tabs at the end of a line | `trailing whitespace.` |
| `blank-at-eof` | Empty lines added at the end of a file | `new blank line at EOF.` |
| `space-before-tab` | A space right before a tab in a line's indent | `space before tab in indent.` |

The command also ends with an error status when it finds something. A script can use that to stop a commit automatically; the Hooks lesson shows how.

### One commit or five: the same end

Pro Git points out that the snapshot at the tip of your branch is identical whether you make one commit or five. The reason is what a commit is: a full snapshot of the project, not a list of edits. Your last commit records the project with every change in it, whichever route you took.

So splitting does not change the result. It adds stops on the way: each smaller commit is a snapshot of the project with one more job done. Those stops are what a reviewer reads, and what you can return to or undo one by one.

## Advanced

Must know covered the daily craft. These are the tools for doing it faster, or for a whole team.

### A commit template for the team

A **commit template** is a text file that Git puts into the editor as the starting message every time you run `git commit`. Teams use it as a reminder of their message rules.

Write the reminders as lines that start with `#`. Git removes those lines from the final message, so they never end up in the history:

```text


# Subject, on the first line. Imperative, 50 characters or less.
# Leave the second line blank.
# Body. Say why the change was needed. Wrap at 72 characters.
```

Then tell Git to use the file, with the `commit.template` setting:

```console
$ git config --local commit.template .gitmessage.txt
```

From now on, `git commit` opens the editor with your reminders on top of Git's usual `#` lines.

What to know:

- **The setting is local.** `--local` writes it into this repository's own settings, which Git never copies to anyone else ([Install, configure and get help](lesson:setup) explains the levels). You can commit the file `.gitmessage.txt` so the team shares the text, but every teammate runs the `git config` line once in their own clone. Pro Git's example uses `--global` and a file in your home folder (`~/.gitmessage.txt`): that gives you one personal template for all your projects.
- **The path** is read from the top folder of the project, so `.gitmessage.txt` works from any subfolder.
- **`-m` skips the template.** The template only appears when the editor opens.
- **An untouched template is not a message.** If your template has plain text (not `#` lines) and you save without changing it, Git stops:

```console
$ git commit
Aborting commit; you did not edit the message.
```

- **A wrong path stops the commit:**

```console
$ git commit
fatal: could not read 'nope.txt': No such file or directory
```

Fix the path with the same `git config` command, or remove the setting with `git config --local --unset commit.template`.

### Always show the diff

If you like `git commit -v`, make it the default for this repository: `git config --local commit.verbose true`. Every `git commit` that opens the editor then shows the diff.

### A fix for an older commit: `--fixup`

You find a typo that belongs to a commit from three commits ago. A new commit named "Fix typo" would add noise. `git commit --fixup <commit>` records your staged change as a small commit marked for the older one:

```console
$ git commit --fixup HEAD~2
[main 4cb959c] fixup! Add dentist to call list
 1 file changed, 1 insertion(+)
```

Git wrote the subject itself: `fixup!` plus the subject of the commit you named. Later, one command folds every `fixup!` commit into its target. That step rewrites history, so it is for commits you have not shared; the lesson "Reword, squash, reorder, split" teaches it.

### Trailers: structured lines at the end

A **trailer** is a line of the form `Key: value` in the last paragraph of a message. `BREAKING CHANGE:` from Conventional Commits sits there, and so does the line hosting sites use to credit a second author. `--trailer` adds one for you:

```console
$ git commit -m "Add feeding month" --trailer "Co-authored-by: Lina Haddad <lina@example.com>"
[main 6abae64] Add feeding month
 1 file changed, 1 insertion(+)
$ git log -1 --format=%B
Add feeding month

Co-authored-by: Lina Haddad <lina@example.com>

```

### Learn from a good history

Pro Git suggests reading the Git project's own history as a model: in a clone of it, `git log --no-merges` shows message after message in the shape this lesson teaches. In any project, `git shortlog` lists the subjects grouped by author, which shows quickly whether the subjects make sense alone. [Read the commit history](lesson:reading-history) covers `--no-merges` and `git shortlog`.

### Rules a team can enforce

Everything here depends on habit. A team that wants a guarantee uses a **hook**: a script Git runs at a set moment, for example just before a commit is made. A hook can run `git diff --staged --check` or refuse a message with a 90-character subject. The Hooks lesson builds one.

## Recap

- One commit, one job. Split a mixed working tree by staging one job's files, checking with `git diff --staged`, committing, and repeating.
- `git diff --check` lists whitespace errors in your changes; add `--staged` for changes you already staged. It reports only, so fix the lines yourself.
- Message shape: a subject of about 50 characters in the imperative ("Fix", not "Fixed"), a blank line, then a body wrapped at about 72 that says why.
- `git commit -v` shows the diff while you write; a second `-m` adds a body paragraph.
- Conventional Commits start the subject with a type (`feat:`, `fix:`, `docs:`), and mark breaking changes with `!` or `BREAKING CHANGE:`, so tools can read the history. Follow the style your project already uses.
