---
id: tags-and-releases
title: "Tags and GitHub releases"
module: remotes
bookSection: "2.6 Tagging"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Tagging
bookSources:
  - vendor/progit2/book/02-git-basics/sections/tagging.asc
  - vendor/progit2/book/10-git-internals/sections/refs.asc
readFirst: [remotes]
---

A customer reports a bug in version 1.0, and your project has had forty commits since. Which commit was version 1.0? A tag answers that for good: it puts a name like `v1.0` on one commit. This lesson shows how to create tags, share them, go back to the version they mark, and turn a tag into a release page on GitHub that your users can read.

## Must know

You already know one kind of name for a commit: a branch, like `main`. A branch moves forward every time you commit. That makes it useless for marking a release, because next week `main` will point somewhere else.

A [tag](term:tag) is a name for one commit that never moves. Teams use tags to mark releases: `v1.0`, `v1.1`, `v2.0`. Months later, `v1.0` still names exactly the commit that was shipped.

:::graph
caption: "Two commits after the release, main has moved on. The tag v1.0 is still where you put it."
commits:
  - id: A
    message: Add export to PDF
  - id: B
    message: Set version to 1.0
    parents: [A]
  - id: C
    message: Fix a typo
    parents: [B]
  - id: D
    message: Start the dark theme
    parents: [C]
branches:
  main: D
tags:
  v1.0: B
head: main
:::

### List the tags

Before you add a tag, look at which ones exist. `git tag` with nothing after it lists every tag, in alphabetical order.

```console
$ git tag
v0.5
v1.0
v1.0-rc1
```

A big project has hundreds of tags. To see only some, give a pattern with `-l` (short for `--list`). The `*` means "any characters", so `"v1*"` matches every tag that starts with `v1`:

```console
$ git tag -l "v1*"
v1.0
v1.0-rc1
```

A pattern needs the `-l`. Without it, Git thinks you want to create a tag with that name, and refuses: `fatal: 'v1*' is not a valid tag name.`

### Two kinds of tag

Listing shows names only. When you create a tag, you choose between two kinds, and the choice decides how much the tag remembers.

| | Lightweight tag | Annotated tag |
|---|---|---|
| What it is | A name on a commit, nothing more | A name plus its own record |
| Remembers | Only which commit | Who tagged, when, and a message |
| Create it with | `git tag v1.0-beta` | `git tag -a v1.0 -m "Version 1.0"` |
| Use it for | A private bookmark you will delete | Every release |

Pro Git recommends [annotated tags](term:annotated-tag) in general, so that this information is kept. A year from now, "who released 1.0, and when?" has an answer.

### Create an annotated tag

This is the tag you will make for every release.

`git tag -a v1.0 -m "Version 1.0"` puts the name `v1.0` on the commit you are on, and records your name, the date and the message with it. The `-a` asks for an annotated tag; the `-m` gives its message, just like `-m` on a commit. If you leave `-m` out, Git opens your editor for the message.

To read a tag, use `git show`, the command that shows one commit. For an annotated tag it prints the tag's own record first, then the commit:

```console
$ git show v1.0-rc1
tag v1.0-rc1
Tagger: Practice Student <student@example.com>
Date:   Thu Nov 26 21:03:09 2026 +0300

Release candidate 1

commit b2937cfa92c4ed3a6156f30e5b7378c20a31d02f
Author: Practice Student <student@example.com>
Date:   Thu Nov 26 21:03:09 2026 +0300

    Set version to 1.0
```

Read it in two parts:

- The top four lines are the **tag**: its name, the tagger, the date it was tagged and its message.
- From `commit` down is the **commit** the tag sits on, as `git log` would show it. After it comes the commit's diff, cut off here.

The practice project is a small notes app with five commits. Its newest commit sets the version to 1.0, and nothing is tagged yet. Use tag names of your own for practice, so `v1.0` is still free for the first challenge at the end of this lesson.

:::try-it
1. Run `git tag`. Git prints nothing: this project has no tags yet.
2. Run `git tag -a v1.0-rc1 -m "Release candidate 1"`. A release candidate ("rc") is a version you test before the real release. Git prints nothing. In the picture, a `tag v1.0-rc1` label appears on the newest station of the history map, next to `branch main`.
3. Run `git tag`. Git now lists `v1.0-rc1`.
4. Run `git show v1.0-rc1`. The first lines show your name as the tagger and the message "Release candidate 1", and below them the commit "Set version to 1.0". If the output fills the screen, press `q` to leave it.
:::

### A lightweight tag

Sometimes you only want a quick bookmark, for yourself.

`git tag checked` puts the name `checked` on the commit you are on and records nothing else. Give no `-a` and no `-m`, and the tag is lightweight.

`git show` on a lightweight tag has no tag part to print. It starts straight at the commit:

```console
$ git show checked
commit b2937cfa92c4ed3a6156f30e5b7378c20a31d02f
Author: Practice Student <student@example.com>
Date:   Thu Nov 26 21:03:09 2026 +0300

    Set version to 1.0
```

That is how you tell the two kinds apart: an annotated tag starts with `tag <name>` and a `Tagger:` line, a lightweight tag does not.

### Tag an older commit

So far every tag went on the commit you are on. Often you notice later that a release was never tagged.

Add the commit's ID at the end of the command, and the tag goes there. First find the ID with `git log --oneline`:

```console
$ git log --oneline
b2937cf (HEAD -> main, tag: v1.0-rc1, origin/main) Set version to 1.0
2383170 Add export to PDF
e16f107 Fix search for empty text
5b9b28a Add search page
617e31b Add README
```

Tags show up in the brackets, marked `tag:`. Now tag the "Add search page" commit:

```console
$ git tag -a v0.5 5b9b28a -m "First version with search"
```

:::try-it
1. Run `git log --oneline` and copy the short ID in front of "Add search page". Your IDs differ from the ones printed above.
2. Run `git tag -a v0.5 <that-id> -m "First version with search"`, with your ID in place of `<that-id>`. In the picture, a `tag v0.5` label appears on the "Add search page" station, three stations to the left of `HEAD · you`.
3. Run `git log --oneline` again. The line for "Add search page" now starts its brackets with `(tag: v0.5)`.
:::

### Version names

A tag can have almost any name, but nearly every project names releases the same way: three numbers, `major.minor.patch`, called **semantic versioning**. In `2.4.1`, the 2 goes up when you break something users rely on, the 4 when you add a feature, the 1 when you fix a bug.

Most projects put a `v` in front (`v2.4.1`). It is a habit, not a rule. Pick one style and keep it, because tools and teammates will search for tags by pattern.

### Share tags

Your tags exist only in your repository so far. A release tag is for the whole team, so it has to reach the server.

Here is the part that surprises almost everyone.

:::predict
question: "You created the tag `v1.0-rc1` and you run `git push`. Is the tag on the server now?"
answer: "No. `git push` sends the commits of your branch and leaves tags at home. Here it even prints \"Everything up-to-date\", because the commits were already there. A tag travels only when you name it, or ask for tags."
:::

`git push origin <tagname>` sends one tag to the remote `origin`. It reads like pushing a branch: the name of the remote, then the name of the thing to send.

```console
$ git push origin v1.0-rc1
To ../origin.git
 * [new tag]         v1.0-rc1 -> v1.0-rc1
```

The line `* [new tag]` says the server did not have this tag and now does. If the tagged commit was not on the server yet, the push sends it along.

To send several tags you have two options:

| Command | Sends | Use it when |
|---|---|---|
| `git push origin --tags` | Every tag you have, annotated and lightweight | You checked `git tag` and want all of them on the server |
| `git push --follow-tags` | Your branch's commits, plus the annotated tags on those commits | Every day: releases go out with the code, private bookmarks stay home |

`--tags` is the one that goes wrong: it also publishes the lightweight tag you made as a private bookmark. `--follow-tags` skips lightweight tags, which is one more reason to use annotated tags for releases.

:::try-it
1. Run `git push`. Git prints "Everything up-to-date": the commits are already on the server, and plain `git push` ignores your tags.
2. Run `git ls-remote --tags origin`. This asks the server which tags it has. It prints nothing: the server has none.
3. Run `git push origin v1.0-rc1`. Git prints `* [new tag]         v1.0-rc1 -> v1.0-rc1`. The picture does not change, because the tag was already in your repository; what changed is on the server.
4. Run `git ls-remote --tags origin` again. The server now lists `refs/tags/v1.0-rc1`. The tag `v0.5` is not there: you never pushed it.
:::

Getting tags is easier than sending them. `git fetch` and `git pull` bring every tag that points at a commit they download, and `git clone` brings all of them:

```console
$ git fetch
From ../origin
 * [new tag]         v1.1       -> v1.1
```

### Delete a tag

A tag with a typo in its name, or a bookmark you no longer need, should go. Deleting happens in two places, and each needs its own command.

`git tag -d <tagname>` deletes the tag in your repository. The commit it pointed at is not touched.

```console
$ git tag -d checked
Deleted tag 'checked' (was b2937cf)
```

That does nothing on the server. If the tag was pushed, delete it there as well:

```console
$ git push origin --delete checked
To ../origin.git
 - [deleted]         checked
```

:::compare
today: "`git push origin --delete v1.0` removes the tag `v1.0` from the server."
book: "`git push origin :refs/tags/v1.0` does the same. Read it as \"push nothing to the tag v1.0\". You will see it in older guides."
:::

:::careful
Delete or move a pushed tag only while nobody else has it. Once a teammate has fetched `v1.0`, their copy stays where it was, and Git will not move it for them. Two people then mean two different commits by "version 1.0". If a release is wrong, leave its tag alone and publish the fix as a new version, like `v1.0.1`.
:::

### Go back to a tagged version

You tagged a release so that you can find it again. To put its files in your working tree, switch to the tag.

`git switch --detach v0.5` makes your files look as they did at the commit tagged `v0.5`.

```console
$ git switch --detach v0.5
HEAD is now at 5b9b28a Add search page
```

A tag is not a branch, so you are now on a commit and on no branch. This state is called [detached HEAD](term:detached-head); the lesson [Switching branches and detached HEAD](lesson:switch-and-detached-head) explains it. In the picture, the pin moves onto the tagged station and reads `HEAD · detached`. Look around, run the old version, and go back with `git switch main`.

Looking is safe. Committing here is not: a new commit would belong to no branch, and the tag would not move to it. When you need to change an old version, for example to fix a bug in 1.0 for a customer, start a branch at the tag first:

```console
$ git switch -c hotfix-0.5 v0.5
Switched to a new branch 'hotfix-0.5'
```

The new branch `hotfix-0.5` starts at the tagged commit and moves with your commits. The tag `v0.5` stays where it is.

:::compare
today: "`git switch --detach v1.0` to look, `git switch -c hotfix-1.0 v1.0` to work on a new branch from the tag."
book: "`git checkout v1.0` and `git checkout -b version2 v1.0` do the same and still work."
:::

### Publish a release on GitHub

A tag tells Git, and your team, which commit is version 1.0. The people who use your program never read tags. They want a page that says what is new and gives them something to download.

On GitHub that page is a [release](term:release): a tag, plus a title, release notes (a short text that says what changed) and, if you want, files to download. GitHub Docs put it in one line: releases are based on Git tags. Every release sits on exactly one tag.

| Part of a release | Where it comes from |
|---|---|
| The commit it marks | The tag, so from Git |
| Title and notes | You write them, or GitHub writes the notes for you |
| Source code as a `.zip` and a `.tar.gz` file | GitHub adds these links by itself, from the files at the tag |
| Other files, such as an installer | You upload them (see "Files to download" in Advanced) |

Releases show on the repository's main page on GitHub: a "Releases" link to the right of the list of files.

You can publish a release in the browser, or from the terminal with `gh`. `gh` is GitHub's own command-line program, [the GitHub CLI](term:github-cli). Git talks to any server; `gh` talks only to GitHub, about the things Git knows nothing of, such as releases. When you start a GitHub challenge, the app shows how to install `gh` and sign in.

Publishing takes three steps, in this order:

```console
$ git tag -a v1.0 -m "Version 1.0"
$ git push origin v1.0
To https://github.com/your-name/notes-app.git
 * [new tag]         v1.0 -> v1.0
$ gh release create v1.0 --title "Version 1.0" --notes "First public release: search for notes."
https://github.com/your-name/notes-app/releases/tag/v1.0
```

The first two commands are the ones you know: make the annotated tag, send it. The third is new.

`gh release create v1.0` tells GitHub: build a release on the tag `v1.0`. `--title` is the heading of the page and `--notes` is its text. `gh` finds the repository by reading your remote `origin`, so you do not name it. It answers with the address of the new page, where `your-name` is your GitHub account and `notes-app` the repository.

Give both `--title` and `--notes`. If you leave them out, `gh` stops and asks its questions one by one in the terminal.

`gh release list` shows the releases of the repository, newest first:

```console
$ gh release list
TITLE        TYPE    TAG NAME  PUBLISHED
Version 1.0  Latest  v1.0      less than a minute ago
```

`Latest` in the `TYPE` column is the release GitHub shows on the repository's main page as the current version. `gh release view v1.0` prints one release with its notes, and `gh release view v1.0 --web` opens its page in your browser.

The practice project for the Try-its keeps its server in a folder on your computer, so there is no Try-it here. You publish real releases in the last two challenges of this lesson, on a practice repository in your own GitHub account.

:::careful
The tag belongs to Git; the release belongs to GitHub. `git clone` and `git fetch` bring the tag `v1.0` and nothing of the release: its notes and files live only on GitHub. It works the other way too: deleting a release leaves its tag in place.
:::

### When it goes wrong

Four messages you will meet with tags, and one with releases:

```console
$ git tag -a v0.5 -m "First version with search"
fatal: tag 'v0.5' already exists
```

A tag with this name is already there. Git never replaces a tag silently. Run `git show v0.5` to see where it points. If it is on the wrong commit and was never pushed, delete it with `git tag -d v0.5` and create it again.

```console
$ git push origin v9.9
error: src refspec v9.9 does not match any
error: failed to push some refs to '../origin.git'
```

You have no tag called `v9.9`, so there is nothing to send. Usually it is a typo: check the name with `git tag`.

```console
$ git push origin v0.5
To ../origin.git
 ! [rejected]        v0.5 -> v0.5 (already exists)
error: failed to push some refs to '../origin.git'
hint: Updates were rejected because the tag already exists in the remote.
```

The server already has a tag `v0.5`, and it points somewhere else than yours. This happens after you delete and re-create a tag that was pushed before. If nobody has fetched the old one, delete it on the server (`git push origin --delete v0.5`) and push again. If people have it, keep the old tag and choose a new version number.

The fourth has no message at all: a teammate says "I can't find v1.0", and you are sure you pushed. You pushed the commits. Run `git ls-remote --tags origin`; if the tag is missing there, send it with `git push origin v1.0`.

```console
$ gh release create v1.5 --title "Version 1.5" --notes "Faster search."
tag v1.5 exists locally but has not been pushed to your-name/notes-app, please push it before continuing or specify the `--target` flag to create a new tag
```

You made the tag and forgot the middle step. GitHub cannot build a release on a tag it does not have. Run `git push origin v1.5`, then the same `gh` command again. Do not reach for `--target` here: it makes GitHub create a tag of its own, and your annotated tag stays at home.

## Under the hood

"Must know" treated a tag as a label. This layer shows what Git writes to disk for each kind, which explains every difference between them.

### A lightweight tag is one small file

Tags live in `.git/refs/tags`, one file per tag, next to the branches in `.git/refs/heads`. A tag is a [ref](term:ref), exactly like a branch.

For a lightweight tag, the file holds the ID of the commit, and that is all there is:

```console
$ cat .git/refs/tags/light
b2937cfa92c4ed3a6156f30e5b7378c20a31d02f
$ git rev-parse HEAD
b2937cfa92c4ed3a6156f30e5b7378c20a31d02f
```

So what makes a tag different from a branch? Only that Git never rewrites this file when you commit. A branch's file is updated on every commit; a tag's file is written once.

### An annotated tag is an object

For an annotated tag, the file holds a different ID:

```console
$ cat .git/refs/tags/v1.0-rc1
d7dbd960f5812d929f9389adeb43e26bea2322cc
```

That is not the commit. Ask Git what kind of [object](term:object) each tag leads to:

```console
$ git cat-file -t v1.0-rc1
tag
$ git cat-file -t light
commit
```

An annotated tag is a fourth kind of object, beside blobs, trees and commits: a **tag object**. Print it:

```console
$ git cat-file -p v1.0-rc1
object b2937cfa92c4ed3a6156f30e5b7378c20a31d02f
type commit
tag v1.0-rc1
tagger Practice Student <student@example.com> 1795716189 +0300

Release candidate 1
```

- `object` and `type`: what the tag points at, here a commit.
- `tag`: its name.
- `tagger`: who made it and when (the number is the time, counted in seconds).
- The last line is the message.

This is where the tagger, the date and the message from `git show` are kept. A lightweight tag has no such object, so it has nowhere to keep them.

### Two IDs for one tag

An annotated tag therefore has two IDs: its own, and the commit's.

```console
$ git rev-parse v1.0-rc1
d7dbd960f5812d929f9389adeb43e26bea2322cc
$ git rev-parse v1.0-rc1^{commit}
b2937cfa92c4ed3a6156f30e5b7378c20a31d02f
```

`^{commit}` means "follow this name until you reach a commit". Commands that need a commit, like `git switch` or `git log`, do this for you. You see both IDs when you ask the server for its tags:

```console
$ git ls-remote --tags origin
d7dbd960f5812d929f9389adeb43e26bea2322cc	refs/tags/v1.0-rc1
b2937cfa92c4ed3a6156f30e5b7378c20a31d02f	refs/tags/v1.0-rc1^{}
```

The first line is the tag object, the second (ending in `^{}`) the commit behind it. A lightweight tag gets one line.

## Advanced

### Version numbers from tags: `git describe`

`git describe` names the commit you are on by the nearest annotated tag before it:

```console
$ git describe
v1.0-rc1-1-g22aaddc
```

Read it as: the tag `v1.0-rc1`, then `1` commit after it, then `g` and the short ID of the current commit. On the tagged commit itself it prints the tag alone. Build scripts use this to stamp a version number into a program. Add `--tags` to count lightweight tags too.

### More ways to list

| Command | Shows |
|---|---|
| `git tag -n` | Each tag with the first line of its message |
| `git tag --sort=-v:refname` | Tags sorted as version numbers, newest first (so `v1.10` comes before `v1.9`) |
| `git tag --contains <commit>` | The tags whose history includes that commit: "which releases have this fix?" |
| `git ls-remote --tags origin` | The tags on the server |

```console
$ git tag -n
v0.5            First version with search
v1.0-rc1        Release candidate 1
```

### Push tags by default

If you want every `git push` to behave like `git push --follow-tags`, set it once:

```console
$ git config --global push.followTags true
```

### Signed tags

`git tag -s v1.0 -m "Version 1.0"` makes an annotated tag with a cryptographic signature, so others can check that the release really comes from you. `git tag -v v1.0` verifies it. It needs a signing key; the lesson [Sign commits and tags (GPG and SSH)](lesson:signing) sets one up.

### Let gh check the tag

"Must know" pushed the tag first, then created the release. Here is what happens when no tag with that name exists anywhere, neither on your computer nor on GitHub:

```console
$ gh release create v1.3 --title "Version 1.3" --notes "Oops"
https://github.com/your-name/notes-app/releases/tag/v1.3
$ git ls-remote --tags origin
cdcd29c13c9adf18ed9a0c8f121c9d1f935d4e6a	refs/tags/v1.2
5e97cd630bfd18161d809ccf34b3ddd5739f785a	refs/tags/v1.2^{}
5e97cd630bfd18161d809ccf34b3ddd5739f785a	refs/tags/v1.3
```

No error. GitHub made the tag `v1.3` itself, on the newest commit of the [default branch](term:default-branch) (the repository's main branch on GitHub, here `main`). Compare the lines: `v1.2`, pushed from a computer, has two lines, so it is annotated. `v1.3` has one line: a lightweight tag, with no tagger and no message. And if the version you meant to release was an older commit, the tag is now on the wrong one.

Add `--verify-tag`, and `gh` refuses to invent a tag:

```console
$ gh release create v9.9 --verify-tag --title "Version 9.9" --notes "Not yet"
tag v9.9 doesn't exist in the repo your-name/notes-app, aborting due to --verify-tag flag
```

Use `--verify-tag` in every script that publishes releases. A typo in the version then stops the command and does not create a release on the wrong commit.

### Notes written for you

Writing notes by hand gets slow. Two options fill them in:

| Option | The notes become | Good when |
|---|---|---|
| `--generate-notes` | A list GitHub builds: the merged pull requests since the release before, the people who contributed, and a link named "Full Changelog" that compares the two tags | The team works with pull requests |
| `--notes-from-tag` | The message of your annotated tag | You already wrote a good tag message |

A [pull request](term:pull-request) is a proposal on GitHub to merge one branch into another, which teammates discuss before it goes in; the lesson on pull requests teaches it. This small project has none, so the generated notes hold only the link:

```console
$ gh release create v1.1 --generate-notes --verify-tag
https://github.com/your-name/notes-app/releases/tag/v1.1
$ gh release view v1.1
v1.1
your-name released this less than a minute ago

  **Full Changelog**: https://github.com/your-name/notes-app/compare/v1.0...v1.1


View on GitHub: https://github.com/your-name/notes-app/releases/tag/v1.1
```

With `--generate-notes` you may leave `--title` out: the title becomes the tag name, `v1.1`. GitHub compared `v1.1` with `v1.0`, the tag before it. You can mix both: `--generate-notes --notes "Read this first"` puts your text above the generated list.

### Drafts and pre-releases

Two switches change who sees a release and how it is labelled:

| Option | What it makes | Use it for |
|---|---|---|
| `--draft` | A release that is saved but not published: visitors do not see it | Preparing the notes and files, and publishing when everything is there |
| `--prerelease` | A published release with a "Pre-release" label, which tells users it may be unstable | Release candidates and betas: versions for testers, not for everyone |

```console
$ gh release create v1.2-rc1 --prerelease --notes-from-tag
https://github.com/your-name/notes-app/releases/tag/v1.2-rc1
$ gh release create v1.2 --draft --title "Version 1.2" --notes "Dark theme." notes-app-1.2.zip
https://github.com/your-name/notes-app/releases/tag/untagged-b2a27abaf55a5c2d0079
$ gh release list
TITLE        TYPE         TAG NAME  PUBLISHED
Version 1.2  Draft        v1.2      less than a minute ago
v1.2-rc1     Pre-release  v1.2-rc1  less than a minute ago
v1.1         Latest       v1.1      less than a minute ago
Version 1.0               v1.0      less than a minute ago
```

The file name at the end of the second command is explained in the next topic. Read the `TYPE` column: the pre-release was published after `v1.1`, and `v1.1` kept `Latest`. The draft's address says `untagged-…` because the draft has no public page at its tag yet. When the draft is ready, publish it with `gh release edit`:

```console
$ gh release edit v1.2 --draft=false
https://github.com/your-name/notes-app/releases/tag/v1.2
```

Now `v1.2` is published, and `gh release list` shows it as `Latest`.

### Files to download

The files you attach to a release are called **assets**: an installer, a compiled program, a PDF of the manual. They are not in Git. GitHub stores them next to the release.

Name the files at the end of `gh release create`, as the draft of `v1.2` above did with `notes-app-1.2.zip`, or add them later with `gh release upload`:

```console
$ gh release upload v1.2 checksums.txt
$ gh release view v1.2
v1.2
your-name released this less than a minute ago

  Dark theme.


Assets
NAME               DIGEST                                                                   SIZE
checksums.txt      sha256:c001d0d1d2da2d23b87521529826ff1bb00c6afaac20b652c0871905c84d1508  5 B
notes-app-1.2.zip  sha256:38d74681d1d2501765f17a3adc7b5d6c26e69b6deda06c3cb11519663afb6a4f  18 B

View on GitHub: https://github.com/your-name/notes-app/releases/tag/v1.2
```

`DIGEST` is a checksum of each file: a fingerprint someone can compare after downloading, to be sure the file arrived unchanged. `gh release download v1.2` fetches the assets of a release into the current folder.

GitHub Docs give the limits: each file under 2 GiB, up to 1000 files per release. This is where big build results belong, not in commits.

### Which release is "Latest"

Publishing a release for an old version has a trap. Here `v1.2` is the current release, and then someone publishes the forgotten `v0.9`:

```console
$ gh release create v0.9 --title "Version 0.9" --notes "Search page."
https://github.com/your-name/notes-app/releases/tag/v0.9
$ gh release list
TITLE        TYPE         TAG NAME  PUBLISHED
Version 0.9  Latest       v0.9      less than a minute ago
Version 1.2               v1.2      less than a minute ago
v1.2-rc1     Pre-release  v1.2-rc1  less than a minute ago
v1.1                      v1.1      less than a minute ago
Version 1.0               v1.0      less than a minute ago
```

`Latest` moved to 0.9, so the repository's main page now offers the old version as the current one. Say what you mean when you publish an older version, or repair it afterwards:

| Command | Effect |
|---|---|
| `gh release create v0.9 --latest=false ...` | Publishes `v0.9` and leaves "Latest" where it is |
| `gh release edit v1.2 --latest` | Moves "Latest" back to `v1.2` |

### Change or delete a release

| Command | Does |
|---|---|
| `gh release edit v1.0 --notes "..."` | Changes the notes (also `--title`, `--prerelease`, `--draft=false`) |
| `gh release delete v1.0` | Deletes the release page and its assets, after asking; the tag stays |
| `gh release delete v1.0 --cleanup-tag` | Deletes the release and the tag on GitHub. Your local tag stays until `git tag -d v1.0` |

Fixing a typo in the notes is harmless. Deleting a published release is like moving a pushed tag: people may already have downloaded it. Publish a new version unless nobody has seen the release yet.

## Recap

- A tag is a name for one commit that never moves; use it to mark releases. `git tag -a v1.0 -m "..."` makes an annotated tag (tagger, date, message). `git tag <name>` alone makes a lightweight one. Add a commit ID at the end to tag an older commit.
- `git push` does not send tags. Use `git push origin v1.0`, or `git push --follow-tags`.
- Delete in two places: `git tag -d v1.0` here, `git push origin --delete v1.0` on the server. Never move a tag others already have.
- `git switch --detach v1.0` looks at a release; `git switch -c <branch> v1.0` starts work from it.
- A GitHub release is a page built on a tag, with notes and files. Push the tag, then `gh release create v1.0 --title "..." --notes "..."`.
