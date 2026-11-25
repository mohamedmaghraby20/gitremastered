# Writing a lesson

How to add a lesson to GitRemastered. A lesson is three files in one folder; no app code changes. The pilot, `content/lessons/three-areas/`, is the example to copy.

## Steps

1. Pick an ID: lowercase words joined by `-` (`ignoring-files`). The folder name must equal the ID.
2. Create `content/lessons/<id>/` with `lesson.md`, `mission.yaml` and `quiz.yaml`.
3. Add the ID to a module in `content/paths/pro-path.yaml`.
4. Run `pnpm content:check` (from `app/`). It names the file and the problem if something is wrong.
5. Run `pnpm test:missions`. It runs your mission's setup and solution with real Git and checks every goal.
6. Open the lesson in the app and play it once as a student.

## lesson.md

Frontmatter, then the lede, then four sections in this order.

```markdown
---
id: ignoring-files
title: "Ignore files with .gitignore"
module: daily-loop
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#_ignoring
bookSources:
  - book/progit2/book/02-git-basics/sections/recording-changes.asc
readFirst: [three-areas]
---

One sentence: what this lesson gives the student.

## Use it
## How it works
## Pro
## Recap
```

| Field | Required | What it is |
|---|---|---|
| `id` | yes | Same as the folder name |
| `title` | yes | Shown as the lesson heading and in the sidebar |
| `module` | yes | The module ID from the path file |
| `bookSection` | yes | Shown in the eyebrow as "Pro Git 2.2 …" |
| `bookUrl` | yes | The citation link. Must start with `https://git-scm.com/` (Pro Git, Git docs) or `https://docs.github.com/` (lessons beyond the book): the only sites the app may open |
| `bookSources` | yes, 1+ | The Pro Git source files the lesson is based on, for reviewers |
| `readFirst` | yes, may be `[]` | Lessons that help before this one |

| Section | Job | Length |
|---|---|---|
| Lede | The first paragraph before `## Use it`. One sentence | 1 sentence |
| `## Use it` | The commands for the daily job, with one Try-it | About 5 minutes of reading and trying |
| `## How it works` | What Git does underneath | Short |
| `## Pro` | Extra options and edge cases for later | Short `###` topics |
| `## Recap` | Bullets; shown as the recap card | 3–5 bullets |

Inside sections, use `###` subheadings, short paragraphs, and ` ```console ` blocks for terminal output. A `##` line inside a code block is fine; anywhere else it must be one of the four section names.

### Special blocks

Open with `:::name` on its own line and close with `:::`.

| Block | Inside | Use it for |
|---|---|---|
| `try-it` | Markdown numbered list | Steps to do now in the terminal |
| `careful` | Markdown | A common mistake or a risk |
| `sidenote` | Markdown | A margin note, e.g. what Pro Git advises |
| `definitions` | YAML list of `term`, `text`, optional `area` (`working`, `staging`, `repository`) | New words; `area` adds that area's color |
| `compare` | YAML `today` and `book` | When the book's command is older than today's |

```markdown
:::compare
today: "`git restore --staged notes.txt` takes a file out of the staging area."
book: "`git reset HEAD notes.txt` does the same and still works."
:::
```

## mission.yaml

A real small job in a practice folder. The goals tick themselves from the live repo state.

```yaml
brief: "Commit the release notes on their own, and keep the README change out of this commit."
setup:            # bash commands run in a new empty folder, in order
  - git init -q -b main
  - git config core.autocrlf false
  - git config user.name > /dev/null || git config user.name "Practice Student"
  - git config user.email > /dev/null || git config user.email "student@example.com"
  - echo "Release notes for version 1.0" > notes.txt
goal:             # every goal must be met at the end
  - check: file-is-committed
    file: notes.txt
    label: "notes.txt is saved in a new commit"
hints:            # from a nudge to the exact commands
  - "Run git status. Which file is new?"
  - "A commit takes only what is in the staging area."
  - "Run: git add notes.txt, then git commit -m \"Add release notes\""
solution:         # the reference answer; pnpm test:missions runs it
  - git add notes.txt
  - git commit -q -m "Add release notes"
```

| Goal check | Extra field | Met when |
|---|---|---|
| `file-is-untracked` | `file` | Git has never saved the file |
| `file-is-modified` | `file` | The file changed and the change is not staged |
| `file-is-staged` | `file` | The file has a change in the staging area |
| `file-is-committed` | `file` | The file is in the latest commit and has no pending change |
| `commit-count-at-least` | `count` | The branch has at least that many commits |
| `working-folder-clean` | none | `git status` has nothing to report |

Setup rules:
- Start with the four lines above: `git init -q -b main`, no CRLF conversion (keeps Windows warnings out of the terminal), and a practice identity only when the student has none.
- Quote any line that contains `: ` (colon and space), or YAML reads it as a field: `'echo "debug: started" > app.log'`.
- Make the starting state need the lesson's skill. A goal that is already met at the start should be one the student must keep, like "README.md is still changed".

## quiz.yaml

2–4 questions; each has 2–4 answers, exactly one `correct: true`, and an `explanation` on every answer. Ask about situations, not definitions. A wrong answer's explanation says why it is wrong. Don't start the right answer's explanation with "Right": the quiz already shows "✓ Right." (the content check refuses it).

```yaml
questions:
  - question: "secrets.env was committed last week. Today you add it to .gitignore. What happens?"
    answers:
      - text: "Nothing changes: Git still tracks the file"
        correct: true
        explanation: "Ignoring only affects untracked files."
      - text: "Git deletes it from the repository"
        explanation: ".gitignore never removes anything."
```

## Style

- Follow `CLAUDE.md`: short, plain words, one idea per paragraph.
- Cite Pro Git (or the official Git docs) for every claim, in your own words. Never copy long passages.
- When the book shows an older command, teach today's and add a `compare` block.
