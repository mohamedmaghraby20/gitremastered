# Coverage: partial-staging

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** choosing changes inside a file. `git add -p` and its answers, checking a partially staged file, and the same patch mode run backwards (`git restore --staged -p`, `git restore -p`). The `git add -i` menu is shown in short, as the book's way in.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 7.2 Interactive Staging | Intro, Staging and Unstaging Files, Staging Patches |
| Git reference: `git-add` | `-p` / `--patch`, the INTERACTIVE MODE section (patch answers, hunk editing), `-i`, `-N` / `--intent-to-add` |
| Git reference: `git-restore`, `git-reset`, `git-checkout`, `git-commit`, `git-stash`, `git-config` | `restore -p`, `restore --staged -p`, `reset -p`, `checkout -p`, `commit -p`, `stash -p`, `stash push --keep-index`, `interactive.singleKey` |

All console output was produced with Git 2.55 in a scratch repository, following the lesson's own Try-it steps. The answer letters in the prompts (`[y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]`) are those of Git 2.55; the book's list is older and shorter.

## Pro Git 7.2, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Why: split extensive edits into focused commits that are easy to review | Yes, as the lede and the running example | Lede, Must know |
| `git add -i` / `--interactive`: the file table and the command menu | Yes, with real output | Must know ("The menu") |
| Staged on the left, unstaged on the right | Yes | Must know |
| `u` update: pick files by number, `*` marks, Enter stages | In short: one table row, mapped to `git add` | Must know |
| `r` revert: unstage files | In short: one table row, mapped to `git restore --staged` | Must know |
| `d` diff: like `git diff --cached` | In short: one table row (`--staged` is today's spelling of `--cached`) | Must know |
| `a` add untracked | In short: one table row | Must know |
| `p` patch from the menu | Yes: "the same as `git add -p`" | Must know |
| Hunks are shown one by one with "Stage this hunk?" | Yes, with two Try-its | Must know |
| `?` lists the answers | Yes, with Git 2.55's real list | Must know |
| `y`, `n`; `a`, `d`; `j`, `J`, `k`, `K`, `g`, `/` | Yes, in a what / when table | Must know |
| `s` split the hunk | Yes, with a predict block and a Try-it | Must know; why hunks join is in Under the hood |
| `e` manually edit the hunk | Yes: named in Must know, worked example in Advanced | Must know, Advanced |
| A partially staged file shows both staged and unstaged counts | Yes: `git status`, `MM`, and the `+1/-1 +1/-1` row | Must know |
| Leave the menu and run `git commit` | Yes | Must know |
| `git add -p` / `--patch` starts patch mode directly | Yes: the lesson's main command | Must know |
| `git reset --patch` to partially reset files | Yes, as today's `git restore --staged -p`, with a compare block | Must know |
| `git checkout --patch` to check out parts of files | Yes, as today's `git restore -p`, with a compare block | Must know |
| `git stash save --patch` | Yes, as today's `git stash -p` | Advanced |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| A full walk through the `u` and `r` sub-prompts (`Update>>`, `Revert>>`) | Each does what a plain command already does; the lesson says so and teaches the commands | `three-areas` (`git add`), `undo-basics` (`git restore --staged`) |
| What a hunk header (`@@ -1,6 +1,6 @@`) means | Taught earlier; linked | `diffs-in-depth` |
| Writing the message for the small commits, and what "atomic" means | Its own lesson | `commit-craft` (named in plain text) |
| Splitting a commit that is already made | Needs interactive rebase | `clean-up-history` |
| `git stash` itself, `--keep-index` in depth | Linked | `stash-and-clean` |
| `git reset --soft` in depth | Linked from "When it goes wrong" | `reset-demystified` |

## Beyond the book

- `git diff` and `git diff --staged` as the check before committing a partially staged file (Git reference, `git-diff`).
- The `git commit -a` trap after partial staging.
- `q` keeps the hunks already answered `y` (checked with real Git).
- Which two versions each patch command compares, and the three content IDs of a partially staged file (`git rev-parse HEAD:file`, `git ls-files --stage`, `git hash-object`).
- Why changes six lines apart or fewer share a hunk (three context lines each), and why `s` needs an unchanged line.
- The `e` trap: turning a `-` line into context without moving it reorders the staged lines. Checked with real Git.
- "No changes." on an untracked file, and `git add -N` (Git reference, `git-add`).
- `git commit -p`, `git stash push --keep-index` for testing what is staged, `interactive.singleKey`.

## Challenges and quiz

- Easy, `tax-not-debug`: two separate hunks in `settings.ini`; stage the first with `y` / `n` and commit it. Checks the commit's content and that the other change is still unstaged.
- Medium, `split-the-menu`: two edits one unchanged line apart, so Git shows one hunk; needs `s` (or `e`). Checks the commit holds one edit and the working tree still holds the other.
- Hard, `clean-the-stage`: three hunks all staged. Unstage two with `git restore --staged -p`, commit, then discard one with `git restore -p` and keep the last. Needs the Under the hood table of which versions each command compares; the hints point there.
- Solutions pipe the answers (`printf 'y\nn\n' | git add -p file`); the hints teach the interactive way.
- Try-its use the student's own `trip.txt`, so following the lesson does not solve a challenge.
- Quiz: where an `n` hunk goes; when to split; which diff shows the next commit; unstage versus discard.
