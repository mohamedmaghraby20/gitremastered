# Coverage: attributes

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** per-file rules in `.gitattributes`: binary files, line endings, and the merge, diff, filter and export attributes.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 8.2 Git Attributes | All of it |
| Pro Git 8.1 Git Configuration | "Formatting and Whitespace": `core.autocrlf` (`true`, `input`, `false`) |
| Git reference: `gitattributes` | Line format and the four states, `text`, `text=auto`, `eol`, the `binary` macro, `diff`, `merge` (unset, `union`, custom drivers), `filter`, `ident`, `export-ignore`, `export-subst`, where attributes are read and in which order, pattern differences from `gitignore` |
| Git reference: `git-check-attr`, `git-add` (`--renormalize`), `git-ls-files` (`--eol`), `git-archive`, `git-config` (`core.autocrlf`, `core.eol`, `core.attributesFile`) | The commands and settings named |
| GitHub Docs: "Customizing how changed files appear on GitHub", Linguist overrides | `linguist-generated`, `linguist-vendored`, `linguist-language`, named as GitHub's |

## Pro Git 8.2, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Attributes are path-specific settings, in `.gitattributes` or `.git/info/attributes` | Yes | Must know (the file), Under the hood (`.git/info/attributes`) |
| What attributes can do: merge strategies per file, diff non-text files, filter content | Yes | Must know (overview by topic), Advanced |
| Identifying binary files: text that should be treated as binary (`*.pbxproj binary`) | Yes, with the book's example | Must know |
| `binary` stops CRLF conversion and diffs | Yes, plus that it stops content merges | Must know, Under the hood (the macro) |
| Diffing binary files: `*.docx diff=word`, `diff.word.textconv docx2txt` | Yes, in short | Advanced |
| The `docx2txt` wrapper script | No | Left out (below) |
| Diffing images by EXIF data: `*.png diff=exif`, `exiftool` | Yes, in short | Advanced |
| Keyword expansion: `ident` and `$Id$`, the blob's SHA-1 and not the commit's | Yes, with real output | Advanced |
| Clean and smudge filters, when each runs | Yes | Advanced (the two moments are in Under the hood) |
| `*.c filter=indent`, with `indent` as clean and `cat` as smudge | Yes | Advanced |
| The `$Date$` filter (`dater`, Ruby script, Perl clean) | Described in words; the scripts are left out | Advanced |
| Drivers and filters are not shared with the project; fail gracefully | Yes, as `careful` blocks | Advanced |
| `export-ignore` with `git archive` | Yes, with real output | Advanced |
| `export-subst` and `$Format:...$` | Yes, with real output | Advanced |
| Merge strategies: `database.xml merge=ours`, `merge.ours.driver true` | Yes, with real output and a graph | Advanced |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| The `docx2txt` wrapper script and install steps | Tool setup, not Git; the lesson shows the rule and the setting | Pro Git 8.2 (linked) |
| The Ruby `expand_date` script and the Perl clean command | Long scripts for a rare need; the idea is explained | Pro Git 8.2 (linked) |
| The word-wrapping `export-subst` example | A `git log` format detail | `reading-history` teaches formats |
| `core.autocrlf` in full, `core.whitespace`, `core.eol` | A setting, not an attribute | `config-pro` |
| Git LFS | Its own tool | `large-repos` |
| Resolving conflicts by hand, `-Xours`, `merge -s ours` | Whole-merge options, not per file | `advanced-merging` |
| Custom merge drivers that really merge (`%O %A %B`) | Rare; `true` and `union` cover the common needs | Git reference, `gitattributes` |

## Beyond the book

- Line endings as the main use of attributes: `* text=auto`, `eol=lf`, `eol=crlf`, why CRLF breaks diffs (real `^M` diff), and attributes compared with `core.autocrlf` (Git reference, `gitattributes` and `git-config`). The book covers `core.autocrlf` in 8.1 and only touches CRLF in 8.2.
- `git add --renormalize .` and `git ls-files --eol`, and the fact that `text=auto` leaves committed CRLF files alone (Git reference).
- `git check-attr`, with its own command page.
- The four attribute states, `binary` as a macro for `-diff -merge -text`, the order in which attribute files are read, and how attribute patterns differ from `.gitignore` patterns (no `!`, a folder name does not cover its files).
- A merge driver only runs when both sides changed the file (checked with real Git), and `merge=union`.
- `git archive` reads `.gitattributes` from the commit, not the working tree (checked with real Git).
- GitHub's `linguist-*` attributes.

## Challenges and quiz

- Easy, `images-and-scripts`: write `*.png binary` and `*.sh text eol=lf` and commit `.gitattributes`.
- Medium, `normalize-line-endings`: two files committed with CRLF; add `* text=auto`, `git add --renormalize .`, commit, then read the result with `git ls-files --eol menu.txt` and write its first column (`i/lf`) into `answer.txt`. Without the renormalize step the column still reads `i/crlf`.
- Hard, `keep-our-build-info`: both branches changed a generated file; a committed `merge=ours` rule plus `git config merge.ours.driver true` lets the merge finish with main's version (Advanced layer).
- The Try-its use their own files (`try-layout.dat`, `try-windows.txt`) and commit nothing. The lesson's merge example uses `database.conf` and a `topic` branch, not the challenge's `build-info.txt`.
- Quiz: whole-file diff from CRLF; a new rule does not convert committed files; a merge driver when only one side changed; `export-ignore` before committing.

## Note for reviewers

No goal check can see line endings today, which is why the medium challenge is an answer challenge:

- The content checks compare text with CRLF turned into LF first (`content-goals.ts`), and a goal text that is only a CR character is refused as empty.
- The snapshot takes a committed file's text from the working tree when the file has no pending change (`committed_texts.rs`). After `git add --renormalize` and a commit, the working file still has CRLF while the commit has LF, so the "committed" text would be wrong for such a file.

A check that reads `git ls-files --eol` (for example "the index holds LF for this file") would let this challenge test the repository itself.
