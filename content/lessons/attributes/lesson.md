---
id: attributes
title: "Attributes: binary files, line endings, merge drivers"
module: make-git-yours
bookSection: "8.2 Git Attributes"
bookUrl: https://git-scm.com/book/en/v2/Customizing-Git-Git-Attributes
bookSources:
  - vendor/progit2/book/08-customizing-git/sections/attributes.asc
  - vendor/progit2/book/08-customizing-git/sections/config.asc
readFirst: [config-pro]
---

A teammate on Windows fixes one typo, and the diff says all 300 lines of the file changed. Or Git tries to merge a file that only a machine can read, and leaves it broken. A `.gitattributes` file tells Git how to treat each kind of file, so the whole team gets the same, sane behavior.

## Must know

In [Ignore files with .gitignore](lesson:ignoring-files) you wrote a small file of patterns that tells Git which files to leave alone. [`.gitattributes`](term:gitattributes) is its sibling. It is for the files Git does track, and it answers a different question: not "should Git follow this file?" but "how should Git handle it?"

### One line per rule

A `.gitattributes` file is a plain text file, normally in the top folder of the project. Each line is a pattern, then one or more **attributes**. An attribute is a label Git puts on every file the pattern matches; Pro Git calls attributes "path-specific settings".

```text
# Images are not text
*.png binary

# Shell scripts always get LF line endings
*.sh text eol=lf
```

Read it line by line:

- `#` starts a comment, as in `.gitignore`. Blank lines are skipped too.
- `*.png` and `*.sh` are [glob patterns](term:glob-pattern), the same wildcards `.gitignore` uses.
- `binary`, `text` and `eol=lf` are attributes. The rest of this lesson explains these three, and a few more.

An attribute is written in one of three ways:

| You write | It means | Example |
|---|---|---|
| `text` | The attribute is on (Git says "set") | `*.sh text` |
| `-text` | The attribute is off ("unset") | `*.dat -text` |
| `eol=lf` | The attribute has a value | `*.sh eol=lf` |

No spaces around the `=`. When several lines match one file, the last line that mentions an attribute wins for that attribute, so put general rules first and exceptions below them.

Commit `.gitattributes`, like `.gitignore`. Then the rules travel with the project, and every clone treats the files the same way.

### Ask Git which attributes a file has

`git check-attr` tells you which attributes Git gives a file. It is the first thing to run when a rule seems to do nothing.

```console
$ git check-attr -a logo.png deploy.sh README.md
logo.png: binary: set
logo.png: diff: unset
logo.png: merge: unset
logo.png: text: unset
deploy.sh: text: set
deploy.sh: eol: lf
```

Each line reads: file, attribute, state. `-a` means "all attributes". `README.md` is not listed at all: no rule matches it. (`logo.png` got four lines from one word, `binary`. "Under the hood" explains why.)

To ask about one attribute, name it instead of `-a`:

```console
$ git check-attr eol deploy.sh README.md
deploy.sh: eol: lf
README.md: eol: unspecified
```

`unspecified` means no rule says anything about this attribute for this file.

### Binary files

Git splits files into two kinds. A **text file** is made of lines a person can read: code, Markdown, settings. A [binary file](term:binary-file) is anything else: an image, a PDF, a compiled program. Git can show a line-by-line [diff](term:diff) of text and merge two people's changes to it. It can do neither for binary files.

Git guesses the kind by looking at the content, and the guess is usually right. You step in for two cases:

- **A file that looks like text but is not meant for people.** Pro Git's example is the Xcode project file (`.pbxproj`): technically text, but written by a tool and read by a tool. A line diff of it tells you nothing, and a line-by-line merge can leave it broken.
- **A binary format Git might misjudge**, where you want to be sure.

For both, the rule is the `binary` attribute:

```text
*.pbxproj binary
*.png binary
```

After that, Git never changes the file's bytes, never prints a line diff for it, and never tries to merge its content.

Practise with files of your own, so the practice project's files stay as they are for the challenges at the end.

:::try-it
1. Make a small settings file and stage it: `echo '{"zoom": 1}' > try-layout.dat`, then `git add try-layout.dat`. In the picture, a `try-layout.dat` sheet appears in the staging area.
2. Change the file: `echo '{"zoom": 2}' > try-layout.dat`. Run `git diff`. Git prints the two lines, `-{"zoom": 1}` and `+{"zoom": 2}`: for now it treats the file as text.
3. Write a rule: `echo "*.dat binary" > .gitattributes`. In the picture, a `.gitattributes` sheet marked "new" appears in the working tree.
4. Run `git diff` again. The lines are gone. Git prints only `Binary files a/try-layout.dat and b/try-layout.dat differ`. The rule works right away, before `.gitattributes` is committed or even staged.
5. Run `git check-attr -a try-layout.dat`. Git lists `binary: set`, `diff: unset`, `merge: unset` and `text: unset` for the file `try-layout.dat`.
:::

:::careful
`binary` also turns merging off for the file. If two branches change it, Git stops with a conflict and you choose one whole version. Use `binary` only for files where combining two edits makes no sense.
:::

### Line endings: one invisible character

That covers files that are not text. The most common attribute problem is about files that are text, and it comes from a difference between operating systems.

Every line of a text file ends with an invisible mark, the [line ending](term:line-ending). Windows writes two characters, called CR and LF (together **CRLF**). macOS and Linux write only **LF**. You never see them in an editor, but Git compares files byte by byte, so it does.

Here `menu.txt` was committed on Linux with three lines. A teammate opened it in a Windows editor, added `Tea`, and the editor saved every line with CRLF:

```console
$ git diff
diff --git a/menu.txt b/menu.txt
index 51c40b0..5c254e9 100644
--- a/menu.txt
+++ b/menu.txt
@@ -1,3 +1,4 @@
-Bread
-Cake
-Coffee
+Bread^M
+Cake^M
+Coffee^M
+Tea^M
```

`^M` is how Git shows the CR character. One line was added, yet all four are marked as changed. On a real project that means:

- Nobody can review the change: the one real edit hides among hundreds of lines.
- If someone else edits the file at the same time, the merge conflicts on every line.
- A shell script saved with CRLF does not start on Linux, because Linux reads the extra character as part of the program's name.

### The fix: store LF, hand out what each computer needs

The cure is one agreement for the whole team: the repository always holds LF. Git converts on the way in and on the way out. One line does it:

```text
* text=auto
```

`*` matches every file. `text=auto` means: Git, decide for each file whether it is text. If it is, store it with LF when it is added, whatever the editor wrote. Binary files are left alone.

On top of that, you can fix the ending a file type gets in the working tree with `eol`:

| Rule | What it does | When to use it |
|---|---|---|
| `* text=auto` | Stores every text file with LF. In the working tree, each computer gets its own system's ending | The first line of almost every `.gitattributes` |
| `*.sh text eol=lf` | These files have LF in the working tree too, on every system | Shell scripts, and anything that runs on Linux |
| `*.bat text eol=crlf` | These files have CRLF in the working tree, on every system | Windows batch files, which need CRLF |
| `* text=auto eol=lf` | Every text file has LF everywhere | Teams whose code formatter expects LF |
| `*.png binary` | No conversion at all | Images, fonts, archives |

Put `* text=auto` first and the exceptions below it: the last matching line wins.

### `core.autocrlf` or attributes?

In [Install, configure and get help](lesson:setup) you met `core.autocrlf`, the setting Git for Windows turns on so that files are stored with LF and checked out with CRLF. It aims at the same problem, but it is a [setting](term:config) on one person's computer. One teammate who has it off can still commit CRLF.

`.gitattributes` is committed, so it applies to everyone, and where a rule sets `text` it wins over `core.autocrlf`. For a shared project, use the file. The lesson "Configuration in depth" goes through the setting's values.

### Files that are already committed

A new rule does not rewrite what the repository already holds. That surprises almost everyone the first time.

:::predict
question: "menu.txt was committed with CRLF. You add `* text=auto` to .gitattributes and commit only that file. Is menu.txt now stored with LF?"
answer: "No. Git converts a file only when it is added again, and with text=auto it leaves a file that is already committed with CRLF alone. You have to ask for the conversion: git add --renormalize ."
:::

`git ls-files --eol` shows the line endings of every tracked file. Here is a repository whose two files were committed with CRLF, right after `* text=auto` was written:

```console
$ git ls-files --eol
i/crlf  w/crlf  attr/text=auto        	hours.txt
i/crlf  w/crlf  attr/text=auto        	menu.txt
```

Three columns, then the file name:

- `i/` is the ending in the index (the staging area), which is what the next commit will hold. Still `crlf`.
- `w/` is the ending of the file in your working tree.
- `attr/` is what the attributes say about text and line endings.

`git add --renormalize .` stages every tracked file again, applying the rules as if each file were new. Then you commit the result:

```console
$ git add --renormalize .
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   hours.txt
	modified:   menu.txt

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	.gitattributes

$ git add .gitattributes
$ git commit -m "Normalize line endings"
[main cc0dd4e] Normalize line endings
 3 files changed, 4 insertions(+), 3 deletions(-)
 create mode 100644 .gitattributes
$ git ls-files --eol
i/lf    w/lf    attr/text=auto        	.gitattributes
i/lf    w/crlf  attr/text=auto        	hours.txt
i/lf    w/crlf  attr/text=auto        	menu.txt
```

The `i/` column now says `lf`: the repository is clean. The `w/` column still says `crlf`, because renormalizing changes what is staged, never the files on your disk. Git writes a file to disk only when it checks the file out. (On Windows, `git add .gitattributes` also prints a "LF will be replaced by CRLF" note. "When it goes wrong" below explains it.)

:::try-it
1. Make a file with Windows endings and stage it: `printf 'one\r\ntwo\r\n' > try-windows.txt`, then `git add try-windows.txt`. (`\r\n` is how `printf` writes CRLF.) In the picture, a `try-windows.txt` sheet appears in the staging area.
2. Run `git ls-files --eol try-windows.txt`. Git prints `i/crlf  w/crlf  attr/` and the file name: CRLF went into the staging area as it was, and no attribute applies.
3. Add a rule for text files: `echo "*.txt text" >> .gitattributes`. Run the same `git ls-files --eol try-windows.txt`. The last column is now `attr/text`, but the first still says `i/crlf`: the rule alone converted nothing.
4. Run `git add --renormalize try-windows.txt`, then `git ls-files --eol try-windows.txt` once more. Now Git prints `i/lf    w/crlf  attr/text`: the staged copy of `try-windows.txt` has LF, and the file on your disk is untouched.
:::

:::sidenote
A renormalizing commit touches every line of every converted file. Make it a commit of its own, with nothing else in it, and tell the team: branches made before it may conflict with it once.
:::

### When it goes wrong

```console
$ git add deploy.sh
warning: in the working copy of 'deploy.sh', CRLF will be replaced by LF the next time Git touches it
```

This is a note, not an error. Git staged `deploy.sh` with LF, as the rule asks. The file on your disk still has CRLF, and Git will write it with LF the next time it checks the file out. On Windows you may see the mirror image, "LF will be replaced by CRLF": same idea, other direction.

```console
$ git ls-files --eol menu.txt
i/crlf  w/crlf  attr/text=auto        	menu.txt
```

You added `* text=auto`, but `i/` still says `crlf`. The file was committed before the rule existed. Run `git add --renormalize .` and commit.

```console
$ git check-attr -a deploy.sh
 is not a valid attribute name: .gitattributes:1
```

Line 1 of `.gitattributes` has spaces around the `=` (`*.sh eol = lf`), so Git tried to read the lone `=` as an attribute. Write `eol=lf` with no spaces. If `git check-attr` prints nothing, or `unspecified`, the pattern does not match the file: check its spelling.

## Under the hood

"Must know" showed which rules to write. This layer shows when Git applies them, what the states in `git check-attr` mean, and where Git looks for rules.

### Conversion happens at two doors

Git converts line endings at exactly two moments:

1. **`git add`**, on the way from the working tree into the staging area. For a text file, CRLF becomes LF.
2. **Checkout**, on the way from the repository into the working tree (`git switch`, `git restore`, `git clone`). LF becomes whatever `eol` asks for, or the system's own ending when `eol` is not set.

Everything in between, the staging area and every commit, holds LF. That is why a file on Windows and the same file on Linux end up as the same [blob](term:blob) with the same ID, although their bytes on disk differ.

It also explains the two surprises from "Must know". A file that is never added again is never converted, so old CRLF files need `git add --renormalize`. And a file that is not checked out again keeps its old ending on disk. To refresh one, delete it and run `git restore <file>`: Git writes it out again under the current rules.

### How `text=auto` decides

Git reads the file's content. The main sign is a zero byte: a text file never has one, so a file that does counts as binary and is left alone. Two more things are worth knowing:

- A file that is already committed with CRLF is not converted behind your back. Only `--renormalize` does that.
- A plain `text` (without `=auto`) skips the guessing: you tell Git the file is text, and Git believes you.

### Four states, and what `binary` really is

Every attribute is in one of four states for a file. `git check-attr` prints them:

:::definitions
- term: "set"
  text: The attribute is on. Written `text`.
- term: "unset"
  text: The attribute is off. Written `-text`.
- term: "a value"
  text: The attribute holds a word, like `lf` or `auto`. Written `eol=lf`.
- term: "unspecified"
  text: No rule mentions the attribute for this file, so Git uses its default.
:::

`binary` is not really an attribute of its own. It is a **macro**: one word that stands for several. `*.png binary` is the short way to write `*.png -diff -merge -text`:

- `-diff`: do not print a line diff.
- `-merge`: do not merge the content; on a conflict keep the current branch's version and report the conflict.
- `-text`: never convert line endings.

That is why `git check-attr -a logo.png` printed four lines for one word.

### Where Git looks for rules

Git reads attributes from several places. The first one that mentions an attribute for a file wins:

1. `.git/info/attributes`: rules for this repository that are never committed. Pro Git names it for rules you do not want to share.
2. The `.gitattributes` in the file's own folder, then in each parent folder up to the top. A rule in `docs/.gitattributes` beats one in the top file.
3. A file for all your repositories, named by the `core.attributesFile` setting.

Two differences from `.gitignore` patterns:

- There is no `!` to take a match back. To switch an attribute off for some files, add a later line with `-text` or another value.
- A folder name does not cover the files inside it: `docs/ text` matches nothing. Write `docs/**` to match everything under `docs`. (`git archive` is the one exception; see "Leave files out of an archive" in the Advanced layer.)

### `core.autocrlf` in attribute terms

The Git reference describes the setting as a default for files that no `text` rule covers:

| `core.autocrlf` | Same as | Result |
|---|---|---|
| `true` | `* text=auto` with CRLF in the working tree | LF stored, CRLF on disk. The Windows default |
| `input` | `* text=auto` with LF in the working tree | CRLF is converted to LF when added; nothing is converted on checkout |
| `false` | No rule | Git stores files exactly as they are |

A `text` rule decides whether a file is converted, whatever the setting says. An `eol` rule decides the ending in the working tree as well.

## Advanced

Line endings and `binary` are the daily uses. Attributes also reach into merging, diffing and exporting. Each topic below is one rule in `.gitattributes`, usually paired with one setting.

### Keep your version of a file on every merge

Some files differ between branches on purpose: a database settings file, or a file the build writes. Every [merge](lesson:branch-and-merge) between those branches then stops on the same [conflict](term:merge-conflict):

```console
$ git merge topic --no-edit
Auto-merging database.conf
CONFLICT (content): Merge conflict in database.conf
Automatic merge failed; fix conflicts and then commit the result.
```

The `merge` attribute names a [merge driver](term:merge-driver) for a file: the program Git runs to combine the two versions when both branches changed it. It takes two pieces.

First, the rule, which only gives the driver a name:

```text
database.conf merge=ours
```

Second, the driver itself, which is a setting. `true` is a tiny program that does nothing and reports success. So this driver "merges" by leaving your version as it is:

```console
$ git config merge.ours.driver true
$ git merge topic --no-edit
Auto-merging database.conf
Merge made by the 'ort' strategy.
 README.md | 1 +
 1 file changed, 1 insertion(+)
$ cat database.conf
server = live-db
```

The merge went through. `README.md` got the other branch's change, and `database.conf` kept the version from `main`.

:::graph
caption: "The merge commit M joins both branches. Its database.conf is the one from main; everything else is merged as usual."
commits:
  - id: A
    message: Add README and database settings
  - id: B
    message: Point main at the live database
    parents: [A]
  - id: C
    message: Add online orders
    parents: [A]
  - id: M
    message: Merge branch 'topic'
    parents: [B, C]
branches:
  main: M
  topic: C
head: main
:::

:::careful
The setting is not committed. The rule travels with the project, but every teammate has to run `git config merge.ours.driver true` in their own clone. Where the setting is missing, Git falls back to its normal merge and the conflict comes back.
:::

:::predict
question: "The rule and the driver are in place. You merge a branch that changed database.conf, but your branch never touched the file. Which version do you end up with?"
answer: "The other branch's version. Git runs a merge driver only when both branches changed the file. A change on one side alone is simply taken, and no driver is asked."
:::

One more value is built in and needs no setting: `merge=union` keeps the lines of both sides, one after the other, instead of conflicting. It suits files where people only add lines, like a list of contributors. Look at the result, though: nobody checks it for you.

:::compare
today: "Git prints `Merge made by the 'ort' strategy.` This lesson defines the driver with `git config merge.ours.driver true`, for one repository."
book: "Pro Git shows `Merge made by recursive.` (the older merge method) and sets the driver with `--global`, for all your repositories."
:::

### Diff files that are not text

For a binary file, `git diff` can only say that it changed:

```console
$ git diff
diff --git a/logo.png b/logo.png
index 029ace0..70dc198 100644
Binary files a/logo.png and b/logo.png differ
```

The `diff` attribute can name a **diff driver** with a `textconv` program: a tool that turns the file into text, which Git then compares as usual. Pro Git gives two examples. For Word documents:

```text
*.docx diff=word
```

```console
$ git config diff.word.textconv docx2txt
```

With the `docx2txt` tool installed, `git diff` shows the paragraphs that changed inside a `.docx` file. For images, the book uses `exiftool`, which prints an image's metadata (its size, its dimensions, the date it was made):

```text
*.png diff=exif
```

```console
$ git config diff.exif.textconv exiftool
```

Now the diff of a replaced image shows lines like "Image Width" changing. The conversion is only for reading: the file in the repository stays binary, and such a diff cannot be applied as a patch. As with merge drivers, each person must install the tool and set the driver themselves.

### Leave files out of an archive

`git archive` packs the files of one commit into a tar or zip file, without the `.git` folder. It is what you hand to someone who needs the files and not the history.

```console
$ git archive HEAD | tar -t
.gitattributes
README.md
deploy.sh
logo.png
tests/
tests/menu-test.txt
```

The `export-ignore` attribute keeps a file or folder in the project and out of every archive:

```text
tests/ export-ignore
```

```console
$ git archive HEAD | tar -t
.gitattributes
README.md
deploy.sh
logo.png
```

`git archive` reads `.gitattributes` from the commit it packs, so commit the rule first. A rule that is only in your working tree has no effect yet. A folder rule like `tests/` works here because `git archive` checks each folder as it packs; for other attributes, write `tests/**`.

A second attribute, `export-subst`, fills in facts about the commit while archiving. In a file marked with it, Git replaces `$Format:...$` with the output of a `git log` format:

```console
$ echo 'LAST_COMMIT export-subst' >> .gitattributes
$ echo 'Last commit: $Format:%h on %cs$' > LAST_COMMIT
$ git add .
$ git commit -q -m "Add LAST_COMMIT for archives"
$ git archive HEAD | tar -xO LAST_COMMIT
Last commit: 7cc0371 on 2026-11-27
```

### Keyword expansion: `ident`, clean and smudge

Older systems like Subversion could stamp a file with its version when you checked it out. In Git a committed file cannot name its own commit: the commit's ID is a [checksum](term:checksum) of the content, so writing the ID into the content would change the ID. Attributes offer two ways around that.

The `ident` attribute replaces `$Id$` in a file with the ID of the file's blob, on checkout:

```console
$ echo '*.txt ident' >> .gitattributes
$ echo '$Id$' > version.txt
$ git add .
$ git commit -q -m "Add version file"
$ rm version.txt
$ git restore version.txt
$ cat version.txt
$Id: 055c8729cdcc372500a08db659c045e16c4409fb $
```

It is the blob's ID, not the commit's, and Pro Git calls the result "of limited use": you cannot tell from it which version is newer.

For anything else, you write your own [filters](term:clean-smudge-filter). A filter is a pair of programs that Git runs at the two doors from "Under the hood":

- The **smudge** filter runs on checkout and changes the file on its way into the working tree.
- The **clean** filter runs on `git add` and changes the file on its way into the staging area.

Pro Git's first example runs all C code through the `indent` formatter before it is staged:

```text
*.c filter=indent
```

```console
$ git config filter.indent.clean indent
$ git config filter.indent.smudge cat
```

`cat` passes a file through unchanged, so checkout does nothing and `git add` cleans up the layout. The book's second example builds a `$Date$` stamp: a smudge script writes the last commit's date into the file, and a clean command strips it out again, so the date never reaches a commit.

:::careful
Like the drivers above, a filter is a setting on your computer. `.gitattributes` is shared, the filter is not. Pro Git's advice: a filter must fail gracefully, so the project still works for someone who does not have it.
:::

Git LFS, the tool for very large files, is built on this: it installs a filter named `lfs`. The lesson on large repositories covers it.

:::compare
today: "`git restore version.txt` writes the file out again from the staging area."
book: "Pro Git uses `git checkout -- test.txt`, which does the same and still works."
:::

### Attributes GitHub reads

Some attributes mean nothing to Git itself. GitHub reads them from your `.gitattributes` to decide how to show files on its website. They all start with `linguist-`, after Linguist, GitHub's tool for detecting languages:

| Rule | On GitHub |
|---|---|
| `dist/** linguist-generated` | Marks the files as generated: their diffs are folded away in pull requests |
| `vendor/** linguist-vendored` | Marks code you copied in from elsewhere: it is left out of the project's language statistics |
| `*.tpl linguist-language=HTML` | Counts and colors these files as HTML |

Git stores and reports them like any attribute (`git check-attr` lists them), and does nothing else with them.

## Recap

- `.gitattributes` holds one rule per line, a pattern and its attributes, and is committed so the whole team shares it. `git check-attr -a <file>` shows what applies to a file.
- `* text=auto` makes the repository hold LF for every text file; `eol=lf` or `eol=crlf` fixes the ending a file type gets in the working tree.
- A new rule does not convert committed files: run `git add --renormalize .` and commit, and check with `git ls-files --eol`.
- `binary` means no line-ending conversion, no line diff and no content merge.
- A merge, diff or filter driver needs two pieces: the rule in `.gitattributes`, and a `git config` setting on each computer.
