---
id: reading-history
title: "Read the commit history"
module: daily-loop
bookSection: "2.3 Viewing the Commit History"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History
bookSources:
  - book/progit2/book/02-git-basics/sections/viewing-history.asc
readFirst: [three-areas]
---

The cart worked last month and gives wrong totals today, and nobody remembers who changed it or why. Every commit your team made is still in the repository, and `git log` is how you read them: all of them, or only the three that matter.

## Must know

In [Status, stage, commit](lesson:three-areas) you made commits. Each one went into the repository with a message, your name and a date. This lesson is about reading them back.

The practice project on the right is a small shop app with nine commits, made by three people over six weeks. Nothing in this lesson changes it: every command here only reads.

### Read one entry of `git log`

`git log` lists the commits of your project, newest first.

```console
$ git log
commit 426f9a4fd66ba7e79ebfb0c2d476d9b775aaf8c0 (HEAD -> main)
Author: Maya Chen <maya@shop.example>
Date:   Mon Nov 16 12:25:00 2026 +0000

    Add free shipping over 50

commit a9ed8dcb33187b6c6790b81ae52030652a3982b9
Author: Omar Haddad <omar.haddad@shop.example>
Date:   Mon Nov 9 15:10:00 2026 +0000

    Remove the discount code
```

Each entry has four parts:

- `commit 426f9a4f…`: the [commit ID](term:commit-id), a unique 40-character name for this commit. You never type all of it: the first 7 characters (`426f9a4`) are enough in almost every command.
- `Author`: the name and email of the person who wrote the change.
- `Date`: when they wrote it.
- The indented line: the commit message.

The `(HEAD -> main)` on the first entry marks where you are. [HEAD](term:head) is Git's "you are here" pointer, and `main` is the [branch](term:branch) you are on. The "Branching" module explains both; for now, read it as "this is the newest commit".

### Get out of the pager

The first surprise of `git log` has nothing to do with Git. When the output is longer than your terminal, Git shows it one screen at a time in a small program called a **pager** (its name is `less`). The last line of the screen shows a `:` and the terminal seems stuck.

| Key | What it does |
|---|---|
| Space | Next screen |
| `b` | Back one screen |
| `/text` then Enter | Search for "text"; `n` jumps to the next match |
| `q` | Quit, back to the prompt |

:::try-it
1. Run `git log`. Git prints the newest commits and stops with a `:` at the bottom: you are in the pager. The history map in the picture shows the same nine commits as stations, oldest on the left; `git log` is the map as text, newest on top.
2. Press Space to see the next screen, then `b` to go back.
3. Type `/README` and press Enter. The pager jumps to the first entry that contains "README".
4. Press `q`. The prompt is back.
:::

### One line per commit

The full entries are easy to read, but nine commits already take more than one screen. Most of the time you want a list you can scan.

`git log --oneline` prints each commit as its short ID and its message:

```console
$ git log --oneline
426f9a4 (HEAD -> main) Add free shipping over 50
a9ed8dc Remove the discount code
3013328 Describe how to run the tests
7936677 Show the order total at checkout
28d7af0 Fix rounding in cart total
2612916 Add checkout page
021b552 Add cart with a discount code
df0735d Add shop page
0281096 Add README
```

This is the form developers use most. It is also why short, clear commit messages matter: this list is only as useful as its messages.

To see only the newest few, add a number: `git log --oneline -3` prints the last three commits. `-n 3` means the same.

You may also meet `git log --oneline --graph`. It draws a line beside the commits. With one line of work it is a column of `*`; once a project has branches, it shows where they split and join, like the history map does.

### See what a commit changed

A message says what the author meant to do. To see what they really changed, ask for more.

`--stat` adds the list of files each commit touched:

```console
$ git log --stat -2
commit 426f9a4fd66ba7e79ebfb0c2d476d9b775aaf8c0 (HEAD -> main)
Author: Maya Chen <maya@shop.example>
Date:   Mon Nov 16 12:25:00 2026 +0000

    Add free shipping over 50

 README.md   | 4 ++++
 checkout.js | 3 ++-
 2 files changed, 6 insertions(+), 1 deletion(-)

commit a9ed8dcb33187b6c6790b81ae52030652a3982b9
Author: Omar Haddad <omar.haddad@shop.example>
Date:   Mon Nov 9 15:10:00 2026 +0000

    Remove the discount code

 cart.js | 4 ----
 1 file changed, 4 deletions(-)
```

Read `checkout.js | 3 ++-` as: three lines changed in `checkout.js`, two added (`+`) and one removed (`-`). Use `--stat` when you want to know which files a commit touched and how big it was.

`-p` (short for `--patch`) goes all the way and prints the changed lines themselves. That output is called a [diff](term:diff): the line-by-line difference between the commit and the one before it.

```console
$ git log -p -1 a9ed8dc
commit a9ed8dcb33187b6c6790b81ae52030652a3982b9
Author: Omar Haddad <omar.haddad@shop.example>
Date:   Mon Nov 9 15:10:00 2026 +0000

    Remove the discount code

diff --git a/cart.js b/cart.js
index cd25080..9c08e03 100644
--- a/cart.js
+++ b/cart.js
@@ -5,7 +5,3 @@ function cartTotal(prices) {
   }
   return Math.round(total * 100) / 100;
 }
-
-function applyDiscount(total) {
-  return total * 0.9;
-}
```

For now, three things are enough to read it:

- `diff --git a/cart.js b/cart.js` names the file.
- A line starting with `-` was removed by this commit.
- A line starting with `+` was added by it. Lines with neither are unchanged and only give context.

Here the commit removed the `applyDiscount` function from `cart.js`. The next lesson, "Read any diff: working, staged, between commits", explains every line of a diff.

Notice the `a9ed8dc` at the end of the command. Give `git log` a commit ID and it starts from that commit instead of the newest one.

### Look at one commit with `git show`

Often you already know which commit you want: someone sent you its ID, or you spotted it in the one-line list. `git show` prints that one commit: its entry and its diff.

```console
$ git show 28d7af0
commit 28d7af0c91345a9255f924c256e68bd4e6bf5105
Author: Omar Haddad <omar.haddad@shop.example>
Date:   Mon Oct 26 10:20:00 2026 +0000

    Fix rounding in cart total

diff --git a/cart.js b/cart.js
index 1a38ce0..cd25080 100644
--- a/cart.js
+++ b/cart.js
@@ -3,7 +3,7 @@ function cartTotal(prices) {
   for (const price of prices) {
     total = total + price;
   }
-  return total;
+  return Math.round(total * 100) / 100;
 }
 
 function applyDiscount(total) {
```

One line went out and one came in: `return total;` became a rounded total. Without an ID, `git show` shows the newest commit. `git show --stat 28d7af0` shows the file list in place of the diff.

:::try-it
1. Run `git log --oneline`. Nine lines appear, one per commit, and there is no pager because they fit on the screen.
2. Run `git log --stat -1`. Git prints the newest commit with the two files it changed, `README.md` and `checkout.js`.
3. Copy the short ID of the commit "Add checkout page" from step 1 and run `git show` with it, for example `git show 2612916`. Git prints that commit and the three lines it added in a new file, `checkout.js`. Press `q` if the pager opens.
:::

### Find commits by date and by author

A real project has thousands of commits, and reading them all is not an option. `git log` takes filters that keep only the commits you ask for.

`--since` and `--until` filter by date:

```console
$ git log --oneline --since="2026-10-15" --until="2026-10-31"
7936677 Show the order total at checkout
28d7af0 Fix rounding in cart total
2612916 Add checkout page
```

The dates can also be relative, like `--since="2 weeks ago"` or `--since="yesterday"`. Use them for questions like "what changed since the last release?" or "what did we do last week?".

`--author` keeps the commits whose author matches a text.

:::predict
question: "Two people on this project are called Omar: Omar Haddad and Omar Said. What will `git log --oneline --author=Omar` list?"
answer: "The commits of both. `--author` matches any author whose name or email contains the text, so \"Omar\" fits two people. To get one of them, write more of the name: `--author=\"Omar Haddad\"`."
:::

```console
$ git log --oneline --author="Omar Haddad"
a9ed8dc Remove the discount code
28d7af0 Fix rounding in cart total
021b552 Add cart with a discount code
```

The quotes are needed because the name has a space in it. The match is on the whole `Name <email>` text, and upper and lower case count: `--author=omar` finds nothing here. Add `-i` to ignore case.

:::careful
A date without a time means "that day, at the time it is right now". At 9 in the morning, `--since="2026-11-16"` skips a commit made at 8 that day. When the edge of the range matters, write the time too: `--since="2026-11-16 00:00"`.
:::

### Find commits by message and by content

Dates and names only get you so far. More often you remember what a change was about.

`--grep` searches the commit messages:

```console
$ git log --oneline --grep=checkout
7936677 Show the order total at checkout
2612916 Add checkout page
```

`-S` searches the changes themselves. Give it a piece of text, and it lists the commits that **added or removed** that text. It answers "when did this function appear?" and "who deleted this line?". Developers call it the **pickaxe**, because it digs through the content of every commit.

:::predict
question: "The function `applyDiscount` was added to cart.js in October and deleted in November. Other commits changed cart.js in between. How many commits will `git log --oneline -S applyDiscount` list?"
answer: "Two: the commit that added the text and the commit that removed it. The rounding fix in between changed cart.js, but the number of times \"applyDiscount\" appears stayed the same, so `-S` skips it."
:::

```console
$ git log --oneline -S applyDiscount
a9ed8dc Remove the discount code
021b552 Add cart with a discount code
```

The newest is on top, so the last line is the commit that added the function, and the first is the one that removed it. The difference between the two searches:

| Option | Searches | Use it when |
|---|---|---|
| `--grep=text` | Commit messages | You remember what the commit was about |
| `-S text` | Added and removed lines | You know a piece of the code, and messages do not mention it |

Both are case-sensitive. `--grep` takes `-i` to ignore case.

### Find commits that touched a file

The last filter is the one you will use most: a path. Put a file or folder name at the end, after two dashes, and `git log` keeps only the commits that changed it.

```console
$ git log --oneline -- cart.js
a9ed8dc Remove the discount code
28d7af0 Fix rounding in cart total
021b552 Add cart with a discount code
```

The `--` tells Git "everything after this is a path, not an option". A folder works too: `git log -- src/` lists the commits that changed anything inside `src`.

### Combine the filters

Each filter narrows the list, and you can stack them. A commit must pass all of them.

```console
$ git log --oneline --author="Omar Haddad" --since="2026-11-01" -- cart.js
a9ed8dc Remove the discount code
```

That reads: commits by Omar Haddad, since 1 November, that changed `cart.js`. Options go first, the path goes last.

:::try-it
1. Run `git log --oneline --since="2026-11-01"`. Three commits appear, all from November.
2. Run `git log --oneline --grep=README`. One commit appears, "Add README". The commit "Describe how to run the tests" also changed `README.md`, but its message does not say so, and `--grep` only reads messages.
3. Run `git log --oneline -- README.md`. Now three commits appear: every commit that changed the file, whatever its message says.
4. Run `git log --oneline -S listProducts`. One commit appears, "Add shop page": the function was added once and never removed.
:::

### Choose your own columns

`--oneline` leaves out the author and the date. When you need them in a compact list, `--pretty=format:` lets you write the line yourself. Each `%` code stands for one piece of the commit.

```console
$ git log --pretty=format:"%h %ad %an: %s" --date=short -3
426f9a4 2026-11-16 Maya Chen: Add free shipping over 50
a9ed8dc 2026-11-09 Omar Haddad: Remove the discount code
3013328 2026-11-02 Omar Said: Describe how to run the tests
```

| Code | Prints |
|---|---|
| `%h` | The short commit ID (`%H` prints all 40 characters) |
| `%an` | The author's name |
| `%ad` | The author date; `--date=short` turns it into `2026-11-16` |
| `%ar` | The author date as "2 weeks ago" |
| `%s` | The first line of the message |

These five cover most needs; the Git manual lists many more. Nobody types this line every day. People save it once as a shortcut, which the lesson "Configuration in depth" shows.

### When it goes wrong

```console
$ git log
:
```

The terminal shows a `:` or `(END)` and ignores your commands. You are in the pager. Press `q`.

```console
$ git log
fatal: your current branch 'main' does not have any commits yet
```

The repository is new and has no commits, so there is no history to show. Make the first commit and try again.

```console
$ git log --oneline -- --author=Omar
$
```

No error and no output. Everything after `--` is read as a path, so Git looked for commits that changed a file named `--author=Omar` and found none. Put options before the `--`: `git log --oneline --author=Omar -- cart.js`.

## Under the hood

"Must know" showed how to ask for commits. This layer shows where `git log` gets them, which explains its order and why its filters behave the way they do.

### Log walks backwards from HEAD

Git keeps no list of commits anywhere. Each commit stores the ID of the commit before it, called its **parent**. `git log` starts at the commit HEAD points to, prints it, follows the link to its parent, prints that, and goes on until it reaches the first commit, which has no parent.

:::graph
caption: "git log starts at HEAD and follows each commit's link to its parent, right to left"
commits:
  - id: "7936677"
    message: Show the order total
  - id: "3013328"
    message: Describe the tests
    parents: ["7936677"]
  - id: a9ed8dc
    message: Remove the discount code
    parents: ["3013328"]
  - id: 426f9a4
    message: Add free shipping
    parents: [a9ed8dc]
branches:
  main: 426f9a4
head: main
:::

That is why the newest commit comes first: it is where the walk starts. It is also why `git log a9ed8dc` shows `a9ed8dc` and everything older, but not the commit after it. A commit knows its parent, never its children.

The filters do not change the walk. Git still visits every commit and prints only the ones that pass.

### Why commits have such strange names

A commit ID is a [checksum](term:checksum): a code Git computes from everything in the commit. That is the snapshot of your files, the author, the date, the message and the parent's ID. The same input always gives the same ID, and any change gives a completely different one.

You can see this in the practice project. It is built with fixed authors and dates, so your commits should have the same IDs as the ones printed in this lesson. (If your Git is set up to sign commits, the IDs will differ; use the ones your own `git log` prints.) In your own projects no two commits ever share an ID, because the date and the content are never all the same.

The parent's ID is part of the input. So a commit's ID depends on the whole history before it, and nobody can change an old commit without changing the ID of every commit after it.

### Author and committer

Every commit records two people. The **author** wrote the change. The **committer** put it into the repository. When you commit your own work, both are you, and `git log` shows only the author.

They differ when someone applies another person's work, for example a maintainer who adds a change that a contributor sent in. Both get credit. `git log --pretty=fuller` shows the two names with their dates.

## Advanced

### Every line of work, not only yours

`git log` starts at HEAD, so it shows the history of the branch you are on. `git log --all` starts from every branch and tag, and `git log --oneline --graph --all` draws the whole project as a graph. You will use it constantly once you work with branches.

The names in brackets, like `(HEAD -> main)`, are called decorations. They mark the commits that a branch, a tag or HEAD points to. Git adds them when it prints to a terminal; `--decorate` forces them and `--no-decorate` hides them.

### Leave out merge commits

In a project with branches, some commits only join two lines of work and carry no change of their own. `git log --no-merges` leaves them out, which makes a long history easier to read.

### Follow a file through a rename

`git log -- cart.js` stops at the commit that created `cart.js`. If the file had another name before, add `--follow`: `git log --follow -- cart.js` continues through the rename. It works for one file at a time.

### The history of a few lines

`-L` shows how a range of lines changed over time. `git log -L 1,3:shop.js` follows lines 1 to 3 of `shop.js`, and `git log -L :cartTotal:cart.js` follows the function `cartTotal`. For each commit that touched those lines, Git prints the entry and the diff of only that part.

### Dates your way

`--date` changes how dates print: `--date=short` gives `2026-11-16`, `--date=relative` gives "10 days ago", `--date=iso` gives `2026-11-16 12:25:00 +0000`. It works with the normal entries and with `%ad` in your own format.

### Who did how much

`git shortlog -sn` counts commits per author, most active first:

```console
$ git shortlog -sn
     4	Maya Chen
     3	Omar Haddad
     2	Omar Said
```

### More ways to match

- `--author` and `--grep` can each be given more than once; a commit passes if it matches any of them. Add `--all-match` to require every `--grep`.
- `-G` is the pickaxe with a pattern: `git log -G "apply\w+"` lists commits whose changed lines match it, even when the count of matches stays the same.
- `--name-only` and `--name-status` print the changed file names without the bar chart of `--stat`.
- `--committer` filters like `--author`, on the person who committed.

Finding which commit broke something, and who last changed a line, has its own lesson: "Search, blame and bisect".

## Recap

- `git log` lists commits newest first: ID, author, date, message. Press `q` to leave the pager.
- `git log --oneline` gives one line per commit; `-3` keeps the last three; `--stat` and `-p` show what changed.
- `git show <id>` prints one commit with its changes.
- Filter with `--since`, `--until`, `--author`, `--grep` (messages), `-S` (added or removed text) and `-- <path>`; stack them, options first, path last.
- `git log` walks from HEAD through parent links, which is why the newest commit is on top.
