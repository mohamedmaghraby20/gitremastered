# Writing a lesson

How to add a lesson to GitRemastered. A lesson is three files in one folder; no app code changes. The pilot, `content/lessons/three-areas/`, is the example to copy.

## Steps

1. Pick an ID: lowercase words joined by `-` (`ignoring-files`). The folder name must equal the ID.
2. Create `content/lessons/<id>/` with `lesson.md`, `challenges.yaml`, `quiz.yaml` and `coverage.md`.
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
| `predict` | YAML `question` and `answer` | A "think first" question before a key Try-it; the answer shows on click (teaching rule 16) |
| `graph` | YAML `caption`, `commits` (`id`, `message`, `parents`, optional `faded: true`), `branches`, optional `remotes`, `tags` and `head` | A small static commit diagram (teaching rule 17) |

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

## challenges.yaml

Three or more challenges, from easy to hard (decided 2026-11-26). Each is a real small job in the practice project; the student picks any one, and starting it rebuilds the project in that challenge's starting state. The goals tick themselves from the live repo state. Challenges test whether the student can do the job; the quiz tests understanding.

Each challenge has an `id` (unique in the lesson; it names the challenge in saved progress), a `title`, a `level` (`easy`, `medium` or `hard`, never going back down), and the mission fields below.

```yaml
challenges:
  - id: release-notes          # unique in the lesson
    title: Save the release notes on their own
    level: easy                # easy, medium or hard; never going back down
    brief: "Commit the release notes on their own, and keep the README change out of this commit."
    setup:                     # bash commands run in a new empty folder, in order
      - git init -q -b main
      - git config core.autocrlf false
      - git config user.name > /dev/null || git config user.name "Practice Student"
      - git config user.email > /dev/null || git config user.email "student@example.com"
      - echo "Release notes for version 1.0" > notes.txt
    goal:                      # every goal must be met at the end
      - check: file-is-committed
        file: notes.txt
        label: "notes.txt is saved in a new commit"
    hints:                     # from a nudge to the exact commands
      - "Run git status. Which file is new?"
      - "A commit takes only what is in the staging area."
      - "Run: git add notes.txt, then git commit -m \"Add release notes\""
    solution:                  # the reference answer; pnpm test:missions runs it
      - git add notes.txt
      - git commit -q -m "Add release notes"
  - id: two-commits
    level: medium
    # ...
```

| Goal check | Extra field | Met when |
|---|---|---|
| `file-is-untracked` | `file` | Git has never saved the file |
| `file-is-modified` | `file` | The file changed and the change is not staged |
| `file-is-staged` | `file` | The file has a change in the staging area |
| `file-is-committed` | `file` | The file is in the latest commit and has no pending change |
| `file-is-not-committed` | `file` | The file is not in the latest commit (for example after `git rm --cached`) |
| `commit-count-at-least` | `count` | The branch has at least that many commits |
| `working-folder-clean` | none | `git status` has nothing to report |

Setup rules:
- Start with the four lines above: `git init -q -b main`, no CRLF conversion (keeps Windows warnings out of the terminal), and a practice identity only when the student has none.
- Quote any line that contains `: ` (colon and space), or YAML reads it as a field: `'echo "debug: started" > app.log'`.
- Easy practises the lesson's main skill; medium combines it with a second step; hard needs a detail from Under the hood or Advanced (and its hints point there).
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

## Links between lessons

Link a word to the glossary term or the lesson that teaches it, with an ordinary Markdown link and a special address:

| You write | It links to | Hover card shows | A click opens |
|---|---|---|---|
| `[branch](term:branch)` | A glossary term | The term's meaning | The first lesson in the term's `lessons`; the glossary entry ("Coming later") when no written lesson teaches it yet |
| `[.gitignore](lesson:ignoring-files)` | A lesson | The lesson's title and lede | That lesson |

- `pnpm content:check` fails on an unknown term or lesson ID.
- The lesson the link opens shows "← Back to …", which returns to the same layer and scroll position.
- Link a word once, where it first appears in a lesson; more links make the text harder to read.
- Do not list a lesson in a term's `lessons` if it only mentions the word: list the lesson that teaches it.

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

If a first-year student might not know a word (build output, checksum, branch, editor), add a short plain explanation with an everyday example, right there. If another lesson teaches it properly, link to it (see "Links between lessons" below). Never leave a word that could make a student feel stupid.

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

### 12. Point at the picture

The live visualizer is the app's strongest teacher. In every Try-it step that changes the repository, also say what moves in the picture, by name:

> "Run `git add todo.txt`. In the picture, the `todo.txt` sheet slides from the working tree into the staging area."

In lessons about history, name the change on the map too ("a new station appears, and the `main` label moves onto it").

### 13. "When it goes wrong"

Must know ends with a short part called **When it goes wrong**: the one to three errors students really hit with this lesson's commands. For each one, show the real message, say what it means in one plain sentence, and give the fix.

> ```console
> $ git commit -m "Add notes"
> nothing added to commit but untracked files present (use "git add" to track)
> ```
> Nothing was staged, so there was nothing to commit. Stage the file with `git add notes.txt` first.

### 14. Words for Git's actions

Use the same words every time, so the student never wonders whether two words mean two things:

| Say | For | Never say |
|---|---|---|
| **commit** (introduce it once as "a save in Git") | Recording the staging area as a snapshot | "save" for a Git action, after the lede |
| **stage**, **add** | Putting a change in the staging area | "mark", "select" |
| **track**, **tracked** | Files Git follows | "saves", "knows" |
| **save** | Saving a file in your editor | — |

The lede may say "save" once, to hook a reader who does not know "commit" yet.

### 15. Keep each lesson to one sitting

"Must know" takes 10 to 15 minutes of reading and trying; "Under the hood" about 5. If "Must know" grows past 15 minutes, split the lesson in two, each with its own challenges and quiz. Never squeeze: a split lesson is better than a long one.

### 16. Think first, then look

Before the key Try-it of a lesson, ask the student to predict what will happen, with a `:::predict` block. Its answer stays hidden behind a "Show answer" button. Once or twice per lesson, only where the answer teaches something.

```markdown
:::predict
question: "You staged todo.txt, then added a second line. What will git status show?"
answer: "todo.txt in two lists: staged (the photo with one line) and not staged (your newer line)."
:::
```

### 17. Draw the history

When a lesson changes history (commits, branches, merges, reset, rebase), show it with a `:::graph` block: a small static commit diagram in the history map's style. Show before and after when the change is the point.

```markdown
:::graph
caption: "After git commit, main moves to the new commit"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add notes
    parents: [A]
branches:
  main: B
head: main
:::
```

How the diagram is drawn:

- List commits oldest first. `parents` is a list; a merge commit has two (`parents: [B, C]`).
- `branches` are local branches. The first one listed gets the top row; a branch that runs beside it gets the next row.
- `head` names a branch (`head: main`) or a commit (`head: B`, a detached HEAD). Leave it out when HEAD is not the point.
- `remotes` are remote-tracking branches (`origin/main: A`) and `tags` are tags (`v1.0: A`). Each has its own label shape.
- `faded: true` on a commit draws it dashed and pale: a commit no branch reaches any more, like the old one after `git commit --amend`.
- Keep a diagram to about six commits. `pnpm content:check` fails on an unknown parent, branch target or head.

### 18. Links to lessons not written yet

While a lesson it points to is not written yet, name it in plain text ("the Branching module"). When phase 5 ends, a link pass turns every such mention into a real `[…](lesson:id)` link.

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
9. Try-its name what moves in the picture (rule 12).
10. "When it goes wrong" closes Must know (rule 13).
11. The action words are consistent: commit, stage, track; "save" only for the editor (rule 14).
12. Must know fits 10 to 15 minutes, or the lesson is split (rule 15).
13. One or two `predict` blocks before key Try-its (rule 16); a `graph` block wherever history changes (rule 17).
