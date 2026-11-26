# Coverage: commit-craft

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** the "Commit Guidelines" subsection of Pro Git 5.2: clean diffs, one logical change per commit, and the shape of a commit message. Plus Conventional Commits and a commit template. The rest of 5.2 (team workflows, forks, email) belongs to other lessons.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 5.2 Contributing to a Project | Commit Guidelines (whole subsection) |
| Pro Git 8.1 Git Configuration | `commit.template`; `core.whitespace` (the three kinds that are on by default) |
| Git reference: `git-commit` | `-v`, several `-m`, `--fixup`, `--trailer`, `commit.template`, `commit.verbose` |
| Git reference: `git-diff`, `git-config` | `--check` and its exit status; `core.whitespace` |
| Conventional Commits 1.0.0 (conventionalcommits.org) | Types `feat` and `fix`, optional scope, `!` and the `BREAKING CHANGE:` footer, the link to version numbers |

## Pro Git 5.2 "Commit Guidelines", point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Good commit guidelines make teamwork easier | Yes | Lede, Must know (opening) |
| The Git project's `Documentation/SubmittingPatches` | Its rule (motivation, contrast with the old behavior) is passed on; the file is not named | Must know (The body says why) |
| No whitespace errors; run `git diff --check` before committing | Yes, with a Try-it and real output | Must know |
| Each commit a logically separate changeset | Yes: words, a worked example, two graphs, a table, the common wrong ideas | Must know |
| Do not hand in a weekend of five issues as one commit | Yes | Must know |
| Use the staging area to split work into one commit per issue | Yes, a routine and a Try-it | Must know |
| `git add --patch` when changes share a file | Named, pointer only | Must know; taught in "Stage part of a file" |
| The tip snapshot is identical with one commit or five | Yes | Must know (what stays the same), Under the hood |
| Easier to pull out or revert one changeset | Yes | Must know (table) |
| Rewriting history to craft a clean history before sharing | Pointer only (`--fixup`, undoing a mixed commit with reset) | Advanced, When it goes wrong; taught in "Reword, squash, reorder, split" |
| Subject of about 50 characters, blank line, detailed body | Yes | Must know |
| Body: motivation and contrast with previous behavior | Yes | Must know |
| Imperative mood: "Fix bug", not "Fixed bug" | Yes, with the reason (matches `git merge` and `git revert` messages) | Must know |
| Tim Pope's template: capitalized summary, wrap at 72, the blank line is critical | Yes | Must know (table), Under the hood (why the blank line is critical) |
| Template: bullet points with hyphens and a hanging indent | No | Left out, see below |
| `git log --no-merges` in the Git project as a model | Yes | Advanced |
| "Do as we say, not as we do" (the book uses `-m` for brevity) | Implied: the lesson says a small commit needs no body | Must know |

## Pro Git 8.1, the parts used

| Book point | In the lesson | Layer |
|---|---|---|
| `commit.template`: a file as the starting message; reminds people of the format | Yes | Advanced |
| The book sets it with `--global` and `~/.gitmessage.txt` | Yes, named as the personal variant; the lesson teaches `--local` (course rule: no global settings in practice) | Advanced |
| `core.whitespace`: `blank-at-eol`, `blank-at-eof`, `space-before-tab` on by default | Yes, as a table with the message each one prints | Under the hood |
| The three kinds that are off by default; setting `core.whitespace` | No | Left out, see below |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Staging part of a file (`git add -p`) | Its own lesson | `partial-staging` |
| Folding fixup commits, splitting or rewording older commits | Rewrites history | `clean-up-history` |
| Bullet points and hanging indents in a body | A style detail; the lesson keeps to the rules teams check | Not taught |
| `indent-with-non-tab`, `tab-in-indent`, `cr-at-eol`; `git apply --whitespace`, `git rebase --whitespace=fix` | Rare; patch workflows | Reference only |
| Writing a hook that enforces the rules | Its own lesson | `hooks` |
| The rest of 5.2: small team, managed team, forked project, email | Other lessons | `team-contributing`, `github-flow-prs` |
| Squashing a pull request into one commit | Belongs with merge methods | `pr-merge-strategies` |

## Beyond the book

- Conventional Commits (types, scope, breaking changes, why teams use them): from the public specification, marked in the lesson as an agreement between people and not a Git feature. The types other than `feat` and `fix` are labelled as team habit.
- `git commit -v`, a second `-m` for the body, `commit.verbose`, `--fixup`, `--trailer` (Git reference, `git-commit`).
- `git diff --staged --check` for changes already staged, and the exit status (Git reference, `git-diff`).
- The "If applied, this commit will …" test for the imperative: a widely used teaching aid, not from the book.
- Undoing a mixed commit with `git reset HEAD~1` (links to `reset-demystified`).
- What Git does when the template is untouched or its path is wrong (real output from Git 2.55).

## Challenges and quiz

- Easy, `two-jobs`: a bug fix and a README section become two commits with given messages, the fix first.
- Medium, `conventional-pair`: a fix and a new feature become two commits whose subjects start with the right Conventional Commits type; the student writes the descriptions.
- Hard, `whitespace-cleanup`: trailing spaces are already staged, so plain `git diff --check` is silent. Needs `--staged` (Under the hood), a fix, and staging again.
- Hard, `team-template`: switch on a committed template with `commit.template` in the local settings (Advanced), then commit.
- Try-its use the student's own files (`calls.txt`, `garden.txt`), so following the lesson does not solve a challenge.
- Quiz: how to split a mixed working tree; why `--check` was silent after staging; the missing blank line; choosing a type and marking a breaking change.

## Notes for reviewers

- Goal texts are trimmed when the content is loaded, so a goal cannot ask for "no `; ` in the file". The whitespace challenge checks the opposite: the file contains `;`, a line break, `  return thanks;`, a line break and `}`, which is only true once both lines end without spaces.
- A goal checks the first line of a message only, so no challenge can check a body. The body is practised in a Try-it and tested in the quiz.
