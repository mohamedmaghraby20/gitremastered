# Writing a lesson

How to add a lesson to GitRemastered. A lesson is three files in one folder; no app code changes. The pilot, `content/lessons/three-areas/`, is the example to copy.

## Steps

1. Pick an ID: lowercase words joined by `-` (`ignoring-files`). The folder name must equal the ID.
2. Create `content/lessons/<id>/` with `lesson.md`, `mission.yaml`, `quiz.yaml` and `coverage.md`.
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

## Must know
## Under the hood
## Advanced
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
| Lede | The first paragraph before `## Must know`: a real problem and the skill that solves it (teaching rule 1) | 1–2 sentences |
| `## Must know` | Everything a working developer needs for this job: the commands, their common options, the output to read and the usual traps, with Try-its. Complete, not minimal | 10–15 minutes of reading and trying |
| `## Under the hood` | How Git does it inside: index, objects, refs | Short |
| `## Advanced` | Advanced commands and options for mastering the tool; rare cases | Short `###` topics |
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

## coverage.md

For reviewers; the app does not show it. It proves the lesson covers its Pro Git sections well. `content/lessons/three-areas/coverage.md` is the example.

- **Sources:** every book section and reference page used.
- **Point by point:** each point of the book section, whether the lesson covers it, and in which layer.
- **Left out on purpose:** each skipped point, why, and which lesson teaches it.
- **Beyond the book:** what comes from the Git reference or GitHub Docs.

Rule: every important point of the book section is in "Must know" or "Under the hood", or listed under "Left out" with the lesson that teaches it.

Try-its must not solve the mission: practise on a separate file, so the mission still has work to do.

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

## Command pages and the glossary

The command index reads `content/commands/<command-id>.md` (one page per command) and `content/glossary.yaml` (terms). SPEC §4 has the exact format.

- **When:** a lesson that teaches a command adds its page; a lesson that introduces a word adds its term. List the lesson in `lessons`.
- **A command page** is a reference, not a lesson: the job in one sentence, one real example with its output, then the options people use, as a table when there are several. Add a `:::careful` block for anything that throws work away, and a `:::compare` block when Pro Git shows an older command.
- **A glossary meaning** is one or two plain sentences a beginner understands without the lesson. Name the other words people use for it ("also called the index").
- The teaching rules below apply here too: book names first, no word before it is explained, real Git output.

## Style

- Follow `CLAUDE.md`: short, plain words, one idea per paragraph.
- Cite Pro Git (or the official Git docs) for every claim, in your own words. Never copy long passages.
- When the book shows an older command, teach today's and add a `compare` block.
- Use the book's names: **working tree** (also called the working directory), **staging area** (also called the index), **repository** (the `.git` directory). Say the other name once, where it first matters.

## Teaching rules

Write like a senior engineer who is also a trained teacher, for a smart student who may be in their first year of college. Every rule below comes from a real review of the pilot.

### 1. The opening makes them want to read on

The lede names a real problem the student has, or will have, and promises the skill that solves it. It never assumes they already know the words it uses.

> Weak: "Every change goes through three places, and three commands move it along."
> Better: "You changed five files, but only two are ready. Git lets you choose exactly what goes into each save, and this lesson shows how."

### 2. Every section opens with a bridge

One or two sentences before the content that (a) say what we just learned, (b) name the new question, and (c) say why it matters. Never stack sections with no link between them.

> "That was a clean folder. Real work is rarely clean: you edit files and make new ones. Here is what `git status` shows then."

### 3. Explain a command as: what it does, in one plain sentence, then an example

First the job in everyday words ("`git add` tells Git: put this file, as it looks now, into my next save"). Then a small concrete example with real output. Then the details. Never open with the details.

### 4. Core concepts get extra care

Some ideas are the heart of Git: the three areas, what staging saves, what a commit is, branches, merging. For these:

- Explain the idea twice: once in words, once with a tiny worked example (line numbers, file contents, before and after).
- Say what stays the same as well as what changes ("your earlier commits are already safe").
- Show it in the terminal with a Try-it, then explain what the student just saw.
- Expect the common wrong idea and correct it out loud.

### 5. Every new word gets two lines, and a link when one exists

If a first-year student might not know a word (build output, checksum, branch, editor), add a short plain explanation with an everyday example, right there. If another lesson teaches it properly, link to that lesson (see "Links to other lessons", task 43). Never leave a word that could make a student feel stupid.

> "Build output is what your tools make from your code, like `node_modules` in JavaScript or `__pycache__` in Python. Anyone can make it again from a short list of packages (`package.json`, `requirements.txt`), so it does not belong in Git."

### 6. Never mention something before it is explained

No "the mission's files", "the index", "HEAD" or "the challenge" until the student has met them. If you must point ahead, say what it is in a few words first.

### 7. Try-it steps say what to do and what you will see

Each step is one action, followed by what appears and why, in a full sentence:

> "Run `git status`. Git lists `todo.txt` under "Untracked files": it sees the file but has never saved it."

Name the thing that changed ("the file `todo.txt` moved to..."), never a bare "it".

### 8. Codes, flags and outputs: what, when, why

When you show a code or flag (`??`, `-s`, `-a`), also say when people use it and whether it is worth using. A table of codes alone is not an explanation.

### 9. Split dense paragraphs

A paragraph that holds a fact, a warning and a how-to becomes three short pieces: the idea, a Try-it or example, and a `careful` block for the trap.

### 10. Practise on the student's own files

Try-its use files the student creates in the lesson (`todo.txt`), so the challenges keep their starting state. Say so in plain words when it matters ("make a file of your own for this, so the practice files stay as they are").

### 11. Challenges test skill, the quiz tests understanding

- **Challenges** (at least three per lesson, easy to hard, the student picks): a realistic situation to solve alone in the terminal.
- **Quiz:** questions about situations, to check the student understood why things work.
- Challenges come before the quiz.

## Auditing a lesson

Run this list on every lesson before it ships:

1. Coverage: every important point of its book section is in "Must know" or "Under the hood", or listed in `coverage.md` with the lesson that teaches it.
2. Lede: a real problem and a promise (rule 1).
3. Bridges between all sections (rule 2).
4. Each command: plain job, example, details (rule 3).
5. Core concepts: two explanations, a worked example, the common wrong idea (rule 4).
6. Every hard word explained or linked (rule 5); nothing used before it is explained (rule 6).
7. Every Try-it step says what you will see (rule 7).
8. Real terminal output from current Git; the book's names for things.
