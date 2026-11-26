---
id: revision-selection
title: "Point at any commit: HEAD~2, ranges, reflog names"
module: history-mastery
bookSection: "7.1 Revision Selection"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Revision-Selection
bookSources:
  - book/progit2/book/07-git-tools/sections/revision-selection.asc
readFirst: [branches-are-pointers]
---

Almost every Git command asks "which commit?", and copying 40-character IDs out of `git log` gets old fast. Git understands a small language of names, such as `HEAD~2`, `v1.0^2` and `main..drinks`. This lesson teaches you to point at any commit, or any group of commits, in a few keystrokes.

## Must know

You already used a few of these names. `git show 2612916` took a short ID, `git branch -v` showed where a [branch](term:branch) points, and `git reset` met `HEAD~1`. They looked like separate tricks. They are one system, and the same names work in every command that takes a commit: `git show`, `git log`, `git diff`, `git switch`, `git reset`, `git branch` and the rest.

Pro Git calls a name that leads to a commit a [revision](term:revision). This lesson has two halves: names for one commit, then names for a whole group of commits, called a [range](term:commit-range).

### The practice project

The terminal on the right opens in a small recipe book with a few branches. Nothing in this lesson changes it: every command here only reads, so the picture stays as it is. Use it as your map.

```console
$ git log --oneline --graph --all
* bb9b03a Add shopping list
| * c4c365a Add smoothie recipe
| * be340c5 Add iced tea recipe
| * 0096496 Add lemonade recipe
|/  
* 8d9f0fb Fix typo in brownie recipe
* 47ed95c Sort the recipe list
*   72dd096 Merge branch 'desserts'
|\  
| * 844e458 Add cookie recipe
| * 486a3db Add brownie recipe
* | 5feee70 Fix pancake cooking time
|/  
| * e17ab6f Add greek salad recipe
|/  
*   82c1d30 Merge branch 'soups'
|\  
| * 560ee96 Add tomato soup recipe
* | 590a4e7 Add omelette recipe
|/  
* 44cad7c Add pancake recipe
* b79ce57 Add README
```

You are on `main`. Two other branches exist: `drinks` (three commits `main` does not have) and `salads` (one). Two branches were merged earlier and then deleted, `soups` and `desserts`; their [merge commits](term:merge-commit) are still there. A [tag](term:tag), `v1.0`, sits on the first merge.

The project is built with fixed authors and dates, so your commits should have the same IDs as the ones printed here. (If your Git is set up to sign commits, the IDs will differ; use the ones your own `git log` prints.)

### Short IDs: the first few characters are enough

A full [commit ID](term:commit-id) has 40 characters. You never need to type them all. Git accepts the start of an ID, as long as it has at least four characters and only one object in the repository starts that way.

To look at one commit without its diff, this lesson uses `git show -s`. The `-s` means "no diff", and `--oneline` shrinks the answer to one line:

```console
$ git show -s --oneline 8d9f0fb52e8aac29a150945168627ae1cc916cdb
8d9f0fb Fix typo in brownie recipe
$ git show -s --oneline 8d9f0fb
8d9f0fb Fix typo in brownie recipe
$ git show -s --oneline 8d9f
8d9f0fb Fix typo in brownie recipe
```

All three name the same commit.

Git itself prints seven characters in `git log --oneline`. In a big project seven may not be unique any more, and Git then prints more by itself. Pro Git notes that eight to ten characters are plenty for most projects: the Linux kernel has millions of objects, and 12 characters are still unique there.

:::compare
today: "`git log --oneline` prints short IDs, one commit per line."
book: "`git log --abbrev-commit --pretty=oneline` prints the same list. `--oneline` is the short way to write both options."
:::

### Branch and tag names

A branch name stands for the commit the branch points at, as [Branches are just pointers](lesson:branches-are-pointers) showed. A tag name stands for the commit that was tagged. So wherever Git wants a commit, a name will do:

```console
$ git show -s --oneline drinks
c4c365a Add smoothie recipe
$ git show -s --oneline v1.0
82c1d30 Merge branch 'soups'
```

[HEAD](term:head) works too: it is the commit you are on right now.

The difference between these names and an ID: an ID means the same commit forever. A branch name means "wherever that branch points today". After the next commit on `drinks`, the name `drinks` leads to a newer commit.

### `git rev-parse`: ask Git what a name means

`git rev-parse <name>` turns any name into the full commit ID it stands for. It is the fastest way to check that a name means what you think.

```console
$ git rev-parse main
bb9b03a54b71b2dff922d71f683a4168d459183b
$ git rev-parse --short main
bb9b03a
$ git rev-parse 8d9f
8d9f0fb52e8aac29a150945168627ae1cc916cdb
```

`--short` prints the short ID. Pro Git points out that `rev-parse` is a low-level tool ([plumbing](term:plumbing)), made for scripts more than for daily use. It is still the best way to test every name in this lesson, and to hand an ID to a script or a colleague.

:::try-it
1. Run `git rev-parse drinks`. Git prints a full ID that starts with `c4c365a`. In the history map, that is the station under the `drinks` label.
2. Run `git rev-parse --short v1.0`. Git prints `82c1d30`, the station with the `v1.0` tag.
3. Run `git show -s --oneline 5fee`. Four characters are enough here: Git prints `5feee70 Fix pancake cooking time`.
:::

### Walk back from a name: `~`

Often you do not know an ID or a name, only a position: "the commit before this one", "three commits ago". Git lets you say that by adding a suffix to any name.

`~` followed by a number means "go back that many commits". Each step goes from a commit to its [parent](term:parent-commit), the commit that came directly before it.

```console
$ git show -s --oneline HEAD~1
8d9f0fb Fix typo in brownie recipe
$ git show -s --oneline HEAD~3
72dd096 Merge branch 'desserts'
```

Compare with the log above. `HEAD` is "Add shopping list". One step back is the typo fix, and three steps back is the merge commit.

The suffix works on every name, not only `HEAD`: `drinks~1` is the commit before the newest one on `drinks`, `v1.0~2` is two commits before the tag, and `8d9f0fb~1` is the commit before that ID. `HEAD~` with no number means `HEAD~1`.

### One parent up: `^`

`^` (the caret) also means "the parent". `HEAD^` and `HEAD~1` are the same commit:

```console
$ git show -s --oneline HEAD^
8d9f0fb Fix typo in brownie recipe
```

The two signs differ only when you add a number, and only at a merge commit.

### A merge has two parents: `^2`

A normal commit has one parent, so "go back" has one meaning. A merge commit has two parents, and Git has to know which way you want to go.

Look at the merge `72dd096`, which is `HEAD~3`. `git show` prints both parents on its `Merge:` line:

```console
$ git show -s HEAD~3
commit 72dd09666646b7fff7c8cad548d41ff43dc579d6
Merge: 5feee70 844e458
Author: Lina Park <lina@recipes.example>
Date:   Wed Oct 21 10:10:00 2026 +0000

    Merge branch 'desserts'
```

- The **first parent**, `5feee70`, is the commit `main` was on when Lina ran `git merge desserts`. It is the line of the branch that received the merge.
- The **second parent**, `844e458`, is the newest commit of `desserts`, the branch that was merged in.

`^` with a number picks a parent: `^1` (or plain `^`) is the first, `^2` is the second.

```console
$ git show -s --oneline HEAD~3^
5feee70 Fix pancake cooking time
$ git show -s --oneline HEAD~3^2
844e458 Add cookie recipe
```

`~` never asks which way: it always follows the first parent. So `HEAD~4` goes through the merge and stays on `main`'s own line:

```console
$ git show -s --oneline HEAD~4
5feee70 Fix pancake cooking time
```

:::graph
caption: "Names counted from HEAD. The ~ steps always follow the first parent; ^2 steps over to the branch that was merged in."
commits:
  - id: V
    message: "Merge branch 'soups'"
  - id: F
    message: "HEAD~4 · Fix pancake cooking time"
    parents: [V]
  - id: D
    message: "HEAD~3^2~1 · Add brownie recipe"
    parents: [V]
  - id: E
    message: "HEAD~3^2 · Add cookie recipe"
    parents: [D]
  - id: M
    message: "HEAD~3 · Merge branch 'desserts'"
    parents: [F, E]
  - id: S
    message: "Sort the recipe list"
    parents: [M]
  - id: T
    message: "HEAD~1 · Fix typo in brownie recipe"
    parents: [S]
  - id: G
    message: "HEAD · Add shopping list"
    parents: [T]
branches:
  main: G
head: main
:::

Say it once more, because the two numbers look alike and mean different things:

| You write | Read it as | In the practice project |
|---|---|---|
| `HEAD~2` | Two steps back, first parent each time (the grandparent) | A commit on `main`'s own line |
| `HEAD^2` | The second parent of `HEAD` | An error, unless `HEAD` is a merge commit |
| `HEAD^^` | The parent of the parent | The same commit as `HEAD~2` |

You can chain the suffixes. Git reads them from left to right: `HEAD~3^2~1` is "three back to the merge, over to its second parent, one more back".

```console
$ git show -s --oneline HEAD~3^2~1
486a3db Add brownie recipe
```

:::predict
question: "v1.0 is a merge commit: its first parent is 'Add omelette recipe', its second is 'Add tomato soup recipe'. Which commit is v1.0~1, and which is v1.0^2?"
answer: "v1.0~1 is 'Add omelette recipe': ~ follows the first parent. v1.0^2 is 'Add tomato soup recipe': the tip of the soups branch that was merged in."
:::

:::try-it
1. Run `git show -s --oneline drinks~1`. Git prints `be340c5 Add iced tea recipe`, the station just before the `drinks` label on the map.
2. Run `git show -s --oneline HEAD~3^2`. Git prints `844e458 Add cookie recipe`. On the map, follow `main` back three stations to the merge, then take the side line.
3. Run `git show -s --oneline HEAD^2`. Git answers `fatal: ambiguous argument 'HEAD^2'`. `HEAD` is a normal commit, so it has no second parent.
:::

### Where a name pointed before: reflog names

Parents tell you how the project grew. Sometimes you want something else: where **you** were a moment ago, or where a branch pointed before it moved. Git keeps a private diary of that, the [reflog](term:reflog). You met it in [Reset demystified](lesson:reset-demystified). Every time HEAD or a branch moves (a commit, a switch, a merge, a reset), Git adds a line.

`git reflog` prints the diary of HEAD, newest move on top:

```console
$ git reflog -5
bb9b03a HEAD@{0}: commit: Add shopping list
8d9f0fb HEAD@{1}: checkout: moving from drinks to main
c4c365a HEAD@{2}: commit: Add smoothie recipe
be340c5 HEAD@{3}: commit: Add iced tea recipe
0096496 HEAD@{4}: commit: Add lemonade recipe
```

Each line has a name you can use like any other. `HEAD@{2}` means "where HEAD was two moves ago":

```console
$ git show -s --oneline HEAD@{2}
c4c365a Add smoothie recipe
```

A branch has a diary of its own. `git reflog show main` lists it, and `main@{1}` means "where `main` pointed one move ago".

:::careful
`HEAD@{2}` and `HEAD~2` are different questions. `HEAD~2` follows parents: it is about the project's history, and it gives the same answer in every copy of the repository. `HEAD@{2}` follows your own moves. Above, it leads to a commit on `drinks`, which is not in `main`'s history at all.
:::

Two more things to know for now:

- The reflog is **local**. It records what happened in your repository on your computer, and it is never pushed or cloned. A teammate's `HEAD@{2}` is a different commit, so never send one of these names to someone else. Send the ID.
- Entries do not live forever. Git drops them after a few months.

:::try-it
1. Run `git reflog -5`. Git prints the last five moves of HEAD. The top line, `HEAD@{0}`, is the commit you are on now.
2. Run `git reflog show drinks`. Git prints four lines: the three commits made on `drinks`, and at the bottom `branch: Created from HEAD`, the moment the branch was made.
3. Run `git show -s --oneline drinks@{1}`. Git prints `be340c5 Add iced tea recipe`: where the `drinks` label sat one move ago. Nothing moves in the picture, because reading the reflog changes nothing.
:::

The reflog's best-known job is bringing back commits that no branch reaches any more. That is a lesson of its own, "Recover lost commits with reflog and fsck".

### A range: commits one branch has and another lacks

So far each name meant one commit. The second half of the language names a group of commits. It answers questions you ask every day: what is on this branch that `main` does not have yet? What would this merge bring in?

One word first. A commit is [reachable](term:reachable) from a branch when you can get to it by starting at the branch's newest commit and following parents. The commits reachable from `main` are simply "the history of `main`".

`A..B`, with two dots, means: the commits reachable from B, without the ones reachable from A. Read it as "what B has that A lacks".

```console
$ git log --oneline main..drinks
c4c365a Add smoothie recipe
be340c5 Add iced tea recipe
0096496 Add lemonade recipe
```

Three commits are on `drinks` and not on `main`. These are the commits a merge of `drinks` into `main` would bring in.

Turn the names around and you ask the opposite question:

```console
$ git log --oneline drinks..main
bb9b03a Add shopping list
```

One commit is on `main` that `drinks` lacks.

:::graph
caption: "main..drinks is J, K and L. drinks..main is G. T and everything before it is on both branches, so it is in neither range."
commits:
  - id: S
    message: Sort the recipe list
  - id: T
    message: Fix typo in brownie recipe
    parents: [S]
  - id: G
    message: Add shopping list
    parents: [T]
  - id: J
    message: Add lemonade recipe
    parents: [T]
  - id: K
    message: Add iced tea recipe
    parents: [J]
  - id: L
    message: Add smoothie recipe
    parents: [K]
branches:
  main: G
  drinks: L
head: main
:::

The common wrong idea is that `A..B` means "from A to B", like pages 10 to 20 of a book. It often looks that way, but the real rule is the subtraction. Two things follow from it:

- A itself is never in the range. `HEAD~2..HEAD` is two commits, not three.
- Commits that came in through a merge count, even though they sit on a side line.

:::predict
question: "v1.0 is an ancestor of main: you reach it by walking back from main. What does git log main..v1.0 print?"
answer: "Nothing. Everything reachable from v1.0 is also reachable from main, so after the subtraction no commit is left. The other direction, v1.0..main, lists everything added since the tag."
:::

The ends of a range can be any name from the first half: `v1.0..main`, `HEAD~3..HEAD`, `8d9f0fb..drinks`.

Leave one side empty and Git puts `HEAD` there. `git log main..` means `main..HEAD`, and `git log ..drinks` means `HEAD..drinks`.

Pro Git names one more everyday use. Before you push, `git log origin/main..HEAD` lists the commits you have that the server's `main` does not: exactly what the push will send. (`origin/main` is a [remote-tracking branch](term:remote-tracking-branch), from the lesson [Remote and tracking branches](lesson:remote-branches).)

### Count the commits in a range

To get only a number, use `git rev-list`. It is the plain sibling of `git log`: it prints commit IDs and nothing else, and with `--count` it prints how many there are.

```console
$ git rev-list --count main..drinks
3
```

:::try-it
1. Run `git log --oneline main..salads`. Git prints one commit, `e17ab6f Add greek salad recipe`: the only station on the `salads` line that `main` cannot reach.
2. Run `git log --oneline main..v1.0`. Git prints nothing, as you predicted.
3. Run `git log --oneline HEAD~2..HEAD`. Git prints two commits, "Add shopping list" and "Fix typo in brownie recipe". `HEAD~2` itself, "Sort the recipe list", is left out.
4. Run `git rev-list --count drinks..main`. Git prints `1`.
:::

### When it goes wrong

```console
$ git show -s --oneline HEAD~30
fatal: ambiguous argument 'HEAD~30': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
```

Git could not turn the name into a commit. The message is the same for every cause: a typing mistake in a branch name, a short ID with fewer than four characters, more `~` steps than the history has (as here: `main` has 12 commits), or `^2` on a commit that is not a merge. Check the name with `git log --oneline`, then try again.

```console
PS> git show -s --oneline HEAD@{1}
fatal: ambiguous argument 'HEAD@': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
```

This one is the shell, not Git. In PowerShell, `{` and `}` have a meaning of their own, so Git receives only `HEAD@`. Put the name in quotes: `git show "HEAD@{1}"`. The old Windows prompt, `cmd.exe`, treats `^` in a similar way; there, write `"HEAD^"` or use `HEAD~1`. Git Bash, the terminal of this course, needs no quotes for either.

The last trap prints no message at all:

```console
$ git log --oneline main..v1.0
$
```

An empty answer from a range is not an error. It means "B has nothing that A lacks". If you expected commits, you most likely wrote the two names the wrong way round.

## Under the hood

Must know gave you the names. This layer shows what Git does with them: where it looks a name up, why the second parent is "second", and how a range is worked out. Ranges with three dots and with more than two branches fall out of that.

### How Git looks up a name

When you type `drinks`, Git has to decide what you mean. The Git reference (`gitrevisions`) gives the order. Git tries the name as a [ref](term:ref) in these places and takes the first match:

1. `.git/drinks` itself (this is how `HEAD` is found)
2. `.git/refs/drinks`
3. `.git/refs/tags/drinks`
4. `.git/refs/heads/drinks`, the local branches
5. `.git/refs/remotes/drinks`, then `.git/refs/remotes/drinks/HEAD`

Tags come before branches. If a tag and a branch share a name, the plain name means the tag, and Git prints a warning that the name is ambiguous. That is one more reason to keep tag names like `v1.0` and branch names like `fix-login` clearly apart.

`git rev-parse --symbolic-full-name` prints which ref a name was matched to:

```console
$ git rev-parse --symbolic-full-name main v1.0 HEAD
refs/heads/main
refs/tags/v1.0
refs/heads/main
```

Something that looks like a hexadecimal number of four or more characters can also be the start of an object ID. The suffixes (`~3`, `^2`, `@{1}`) are applied afterwards, one at a time, from left to right.

### Why the second parent is "second"

A commit object lists its parents, one per line. `git cat-file -p`, from [A first look inside .git](lesson:first-look-inside), prints the object:

```console
$ git cat-file -p HEAD~3
tree c4061cb11166f29d46db09fb3964ed614ca853d3
parent 5feee705f0dce6bb5db048cc661ffff536519454
parent 844e458bc81f740119f995cdc85d116422c706ff
author Lina Park <lina@recipes.example> 1792577400 +0000
committer Lina Park <lina@recipes.example> 1792577400 +0000

Merge branch 'desserts'
```

`^1` is the first `parent` line and `^2` is the second. `git merge` writes them in a fixed order: first the commit you were on, then the commit you merged in. So the order records which branch received the merge, and `~` (always the first line) keeps you on that branch's own line of history.

### A range is a subtraction of two sets

Git works out `main..drinks` in two steps. It collects every commit reachable from `drinks`. Then it removes every commit reachable from `main`. What is left is the range.

The two dots are a short way to write that. Git has a longer form that says the same thing, with `^` in **front** of a name meaning "not reachable from this one", or with the word `--not`. Pro Git lists the three as equal:

```console
$ git log --oneline main..drinks
$ git log --oneline ^main drinks
$ git log --oneline drinks --not main
```

All three print the same three commits.

:::careful
The caret has two jobs, and its place tells them apart. Behind a name, `main^` is the parent of `main`. In front of a name, `^main` means "leave out everything reachable from `main`".
:::

### More than two names

The long form can do what two dots cannot: take several names at once. Every name without a caret adds its history, and every name with a caret (or after `--not`) takes its history away.

"Which commits are on `main` or `salads`, but not on `drinks`?"

```console
$ git log --oneline main salads --not drinks
bb9b03a Add shopping list
e17ab6f Add greek salad recipe
```

`git log --oneline main salads ^drinks` is the same question. Use this form when you have many branches and want to know what is in several of them that your own branch still lacks.

### Three dots: on one side but not on both

`A...B`, with three dots, means: the commits reachable from A or from B, but not from both. It is everything the two branches do not share.

```console
$ git log --oneline main...drinks
bb9b03a Add shopping list
c4c365a Add smoothie recipe
be340c5 Add iced tea recipe
0096496 Add lemonade recipe
```

Four commits: one that only `main` has and three that only `drinks` has. In the diagram of the two branches above, these are G, J, K and L. The list alone does not say which commit is on which side. `--left-right` adds a mark: `<` for the name on the left of the dots, `>` for the name on the right.

```console
$ git log --oneline --left-right main...drinks
< bb9b03a Add shopping list
> c4c365a Add smoothie recipe
> be340c5 Add iced tea recipe
> 0096496 Add lemonade recipe
```

This is the quick answer to "how far apart are these two branches?" before a merge.

| You write | You get |
|---|---|
| `main..drinks` | What `drinks` has and `main` lacks |
| `drinks..main` | What `main` has and `drinks` lacks |
| `main...drinks` | Both of the above together; add `--left-right` to tell them apart |
| `main salads ^drinks` | What `main` or `salads` has and `drinks` lacks |

### Where the reflog is kept

The reflog is plain text under `.git/logs`: one file for HEAD and one per branch.

```console
$ ls .git/logs .git/logs/refs/heads
.git/logs:
HEAD
refs

.git/logs/refs/heads:
drinks
main
salads
```

Each line of such a file holds the old ID, the new ID, who moved the ref, when, and why. `main@{1}` is read straight from `.git/logs/refs/heads/main`.

That explains the two limits from Must know. The files are not part of any commit, so they are never sent anywhere: a fresh clone starts with an almost empty reflog. And Git trims old lines during its housekeeping, by default after 90 days.

## Advanced

### Reflog names with a time

Because every reflog line has a date, braces can also hold a time. `main@{yesterday}` means "where `main` pointed yesterday", and a date works too:

```console
$ git show -s --oneline main@{2026-10-20}
5feee70 Fix pancake cooking time
```

On 20 October, `main` pointed at the pancake fix; the `desserts` merge came a day later. Other forms are `main@{2.days.ago}` and `HEAD@{1.week.ago}`.

This only reaches as far back as your reflog does. Pro Git's example: `HEAD@{2.months.ago}` gives a useful answer only if you cloned the project at least two months ago. Ask for a time before your first entry and Git warns you, then shows the oldest one it has:

```console
$ git show -s --oneline main@{2.months.ago}
warning: log for 'main' only goes back to Mon, 5 Oct 2026 09:00:00 +0000
b79ce57 Add README
```

### The reflog in `git log` format

`git log -g` walks the reflog in place of the parents, so every option of `git log` works on it:

```console
$ git log -g --oneline -3 drinks
c4c365a drinks@{0}: commit: Add smoothie recipe
be340c5 drinks@{1}: commit: Add iced tea recipe
0096496 drinks@{2}: commit: Add lemonade recipe
```

Without `--oneline` you get full `git log` entries, each with two extra lines: the reflog name and the reason for the move.

On `drinks` every move was one commit, so moves and parents happen to line up. They often do not. One move can add several commits to a branch at once (a [fast-forward](term:fast-forward) merge does that), and a reset moves a branch backwards. Count moves with `@{n}` and parents with `~n`, and never swap one for the other.

### When a short ID is not unique

In a large repository a short ID can fit more than one object. Git refuses to guess and lists the candidates. This output comes from a test repository with 1,500 small files:

```console
$ git show 0969
error: short object ID 0969 is ambiguous
hint: The candidates are:
hint:   0969153 blob
hint:   0969397 blob
fatal: ambiguous argument '0969': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
```

Add one or two more characters and the name is unique again. IDs you paste into messages, issues or scripts should be at least the seven characters Git prints, or the full ID, because a short ID that is unique today may not be after another year of commits.

:::sidenote
Can two different objects get the same full ID? Pro Git works it out: a commit ID is a SHA-1 [checksum](term:checksum) of 160 bits, and you would need about 2^80 objects for an even chance of one accidental clash. It compares the odds with every member of your team being killed by wolves in unrelated incidents on the same night. Clashes built on purpose are possible with great effort, which is why Git is moving to the stronger SHA-256.
:::

### More names worth knowing

The Git reference page `gitrevisions` lists every form. These are the ones people use:

| You write | It means | Example in the practice project |
|---|---|---|
| `@` | Short for `HEAD` | `@~1` is "Fix typo in brownie recipe" |
| `@{-1}` | The branch you were on before the last switch | `drinks` here, so `git switch @{-1}` goes back to it (`git switch -` does the same) |
| `@{u}` or `main@{upstream}` | The [upstream](term:upstream) of a branch, like `origin/main` | `git log @{u}..` lists what you have not pushed |
| `:/soup` | The newest commit whose message contains the text | "Merge branch 'soups'" |
| `v1.0:pancakes.txt` | Not a commit: the file as it was in that commit | `git show v1.0:pancakes.txt` prints the old recipe |
| `72dd096^@` | All parents of a commit | Both parents of the merge |
| `72dd096^!` | That commit alone, as a range | `git log 72dd096^!` prints one commit |

```console
$ git show v1.0:pancakes.txt
Pancakes. Fry each side for 5 minutes.
$ git show HEAD:pancakes.txt
Pancakes. Fry each side for 2 minutes.
```

### Dots mean something else in `git diff`

`git log` reads `A..B` and `A...B` as sets of commits. `git diff` compares two snapshots, so it cannot use a set, and it reads the dots its own way. [Read any diff](lesson:diffs-in-depth) has the details. The short version: `git diff A...B` shows what B changed since the two branches split, and it starts at their [merge base](term:merge-base).

### Count both sides at once

`git rev-list` takes `--left-right` too. With `--count` it prints two numbers, left side first:

```console
$ git rev-list --count --left-right main...drinks
1	3
```

`main` has one commit of its own and `drinks` has three. This is how tools work out "1 ahead, 3 behind".

## Recap

- Any command that takes a commit accepts a short ID (four or more characters, unique), a branch, a tag or `HEAD`. `git rev-parse <name>` prints the commit a name stands for.
- `~n` walks back n commits along first parents. `^2` picks the second parent of a merge commit: the branch that was merged in. `HEAD~2` and `HEAD^2` are different commits.
- `HEAD@{2}` and `main@{1}` come from the reflog: where a name pointed before. They are local to your computer and expire.
- `A..B` is what B has and A lacks. `A...B` is what only one of the two has; `--left-right` marks the sides. `^A` or `--not A` leaves out A's history when you combine several names.
- `git rev-list --count <range>` counts the commits in a range.
