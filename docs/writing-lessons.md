# Writing a lesson

How to add a lesson to GitRemastered. A lesson is three files in one folder; no app code changes. The pilot, `content/lessons/three-areas/`, is the example to copy.

## Steps

1. Pick an ID: lowercase words joined by `-` (`ignoring-files`). The folder name must equal the ID.
2. Create `content/lessons/<id>/` with `lesson.md`, `challenges.yaml`, `quiz.yaml` and `coverage.md`.
3. Add the ID to a module in `content/paths/pro-path.yaml`.
4. Run `pnpm content:check` (from the repository root). It names the file and the problem if something is wrong.
5. Run `pnpm test:challenges`. It runs every challenge's setup and solution with real Git and checks every goal.

   While you are still writing, `pnpm lesson:check <lesson-id> [command-id ...]` does both for your lesson alone: it loads the committed content plus your lesson folder and the command pages you name, so someone else's half-written lesson cannot fail your check. Example: `pnpm lesson:check start-a-repo git-init git-clone`.
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
  - vendor/progit2/book/02-git-basics/sections/recording-changes.asc
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

Try-its must not solve the challenge: practise on a separate file, so the challenge still has work to do.

## challenges.yaml

Three or more challenges, from easy to hard (decided 2026-11-26). Each is a real small job in the practice project; the student picks any one, and starting it rebuilds the project in that challenge's starting state. The goals tick themselves from the live repo state. Challenges test whether the student can do the job; the quiz tests understanding.

Each challenge has an `id` (unique in the lesson; it names the challenge in saved progress), a `title`, a `level` (`easy`, `medium` or `hard`, never going back down), and the challenge details below.

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
    solution:                  # the reference answer; pnpm test:challenges runs it
      - git add notes.txt
      - git commit -q -m "Add release notes"
  - id: two-commits
    level: medium
    # ...
```

Every goal has a `check`, a `label` (the sentence in the checklist) and the extra fields below. `count` is a whole number; every other field is text. A `message` or `text` matches when the commit's first line contains it, in any letter case.

**Files**

| Goal check | Extra fields | Met when |
|---|---|---|
| `file-is-untracked` | `file` | Git does not track the file |
| `file-is-modified` | `file` | The file changed and the change is not staged |
| `file-is-staged` | `file` | The file has a change in the staging area |
| `file-is-committed` | `file` | The file is in the latest commit and has no pending change |
| `file-is-not-committed` | `file` | The file is not in the latest commit (for example after `git rm --cached`) |
| `file-exists` | `file` | The file is in the working tree (ignored files do not count) |
| `file-is-missing` | `file` | The file is not in the working tree |
| `working-folder-clean` | none | `git status` has nothing to report |

**File contents** (files up to 8 KB, at most 40 per repository; the text match is exact and letter case counts)

| Goal check | Extra fields | Met when |
|---|---|---|
| `file-contains` | `file`, `text` | The file in the working tree contains the text |
| `file-lacks` | `file`, `text` | The file is in the working tree and does not contain the text (a deleted file never passes) |
| `committed-file-contains` | `file`, `text` | The file as it is in the latest commit contains the text |
| `committed-file-lacks` | `file`, `text` | The file is in the latest commit and does not contain the text |
| `file-is-in-no-commit` | `file` | No commit that a branch, tag or HEAD reaches added or changed the file (commits only the reflog remembers do not count) |

**History, settings and answers** ("history" means the commits you reach from HEAD)

| Goal check | Extra fields | Met when |
|---|---|---|
| `commit-count-at-least` | `count` | The history has at least that many commits |
| `commit-count-is` | `count` | The history has exactly that many commits |
| `latest-commit-message-contains` | `text` | The commit HEAD is on has that text in its message |
| `commit-exists` | `message` | A commit with that message is in the history |
| `commit-is-gone` | `message` | No commit with that message is in the history |
| `head-commit-is-merge` | none | The commit HEAD is on has two parents |
| `no-operation-in-progress` | none | No merge, rebase, revert or cherry-pick is waiting, and no file is conflicted |
| `stash-count-is` | `count` | The stash holds exactly that many entries |
| `config-is` | `key`, `value` | The repository's own settings (`git config --local`) hold that value |
| `answer-is` | `answer` | The first line of `answer.txt` is that text (letter case and outer spaces ignored) |
| `answer-is-commit` | `message` | The first line of `answer.txt` is the ID, short or full, of the commit with exactly that message |
| `history-is-linear` | none | No commit in the history is a merge commit (after a rebase, for example) |
| `commit-comes-before` | `message`, `later` | Both commits are in the history and the first is an ancestor of the second (for reordering) |
| `config-is-unset` | `key` | The repository's own settings do not hold the key |
| `latest-commit-is-signed` | none | Git verified a signature on the commit HEAD is on (`git log --format=%G?` is `G` or `U`; SSH signatures need `gpg.ssh.allowedSignersFile`) |

**Branches** (a `branch` may be local, like `main`, or remote-tracking, like `origin/main`, unless noted)

| Goal check | Extra fields | Met when |
|---|---|---|
| `branch-exists` | `branch` | The local branch exists |
| `branch-is-missing` | `branch` | The local branch does not exist |
| `head-is-on-branch` | `branch` | HEAD is on that branch |
| `head-is-detached` | none | HEAD points straight at a commit |
| `branch-is-merged-into` | `branch`, `into` | The newest commit of `branch` is in the history of `into` |
| `branch-contains-commit` | `branch`, `message` | The branch's history holds a commit with that message |
| `branch-lacks-commit` | `branch`, `message` | The branch exists and its history holds no such commit |
| `branch-is-at-commit` | `branch`, `message` | The branch's newest commit has that message |

**Remotes and tags**

| Goal check | Extra fields | Met when |
|---|---|---|
| `remote-exists` | `remote` | A remote with that name is set up |
| `branch-tracks` | `branch`, `upstream` | The local branch follows that upstream, like `origin/main` |
| `branch-is-in-sync` | `branch` | The local branch has an upstream and is neither ahead nor behind |
| `remote-branch-exists` | `branch` | The remote-tracking branch exists, like `origin/feature` |
| `remote-branch-is-missing` | `branch` | The remote-tracking branch does not exist |
| `tag-exists` | `tag` | The tag exists here |
| `tag-is-missing` | `tag` | The tag does not exist here |
| `tag-is-annotated` | `tag` | The tag exists and is annotated |
| `tag-is-on-commit` | `tag`, `message` | The tag points at a commit with that message |
| `remote-has-tag` | `tag` | The tag exists on the practice remote (it was pushed) |

**Worktrees and submodules** (the picture follows `project/` only)

| Goal check | Extra fields | Met when |
|---|---|---|
| `worktree-exists` | `branch` | A linked worktree (`git worktree add`) has that branch checked out |
| `worktree-count-is` | `count` | There are exactly that many linked worktrees (0 after `git worktree remove`) |
| `submodule-exists` | `path` | `.gitmodules` lists a submodule at that path and its files are checked out |

**GitHub** (wave B; read from GitHub now and then, never on every snapshot. Pull requests, issues and workflow runs count only when made after the challenge started)

| Goal check | Extra fields | Met when |
|---|---|---|
| `github-branch-exists` / `github-branch-is-missing` | `branch` | The branch is (or is not) on GitHub |
| `github-pull-request-is-open` / `-is-merged` / `-is-closed` | `head` | A pull request from that branch is open, merged, or closed without merging |
| `github-pull-request-has-comment` / `-has-review` | `head` | That pull request has a comment, or a submitted review |
| `github-issue-exists` / `github-issue-is-open` / `github-issue-is-closed` | `title` | An issue with that text in its title exists, is open, or is closed |
| `github-issue-has-label` | `title`, `labelName` | That issue has the label named `labelName` (`label` stays the checklist sentence) |
| `github-release-exists` | `tag` | A published (not draft) release for that tag |
| `github-default-branch-has-rule` | `rule` | A rule of that type protects the default branch, like `pull_request` or `deletion` |
| `github-workflow-succeeded` / `github-workflow-failed` | `workflow` | A run of the workflow with that `name:` finished with success, or failure |

**GitHub challenges.** A challenge that runs on the student's own GitHub account adds a `github` field:

```yaml
    github:
      repo: gitremastered-practice-flow      # must start with gitremastered-practice
      teammate:                               # optional: what "a teammate" does once the setup pushed
        - action: open-pull-request
          head: add-hours
          base: main
          title: "Add opening hours"
          body: "Please review"
        - action: comment-pull-request         # also: merge-pull-request (head, method), create-issue (title, body, labels)
          head: add-hours
          body: "One typo on line 2"
    setup:
      - git init -q -b main
      # ... the usual lines and commits ...
      - git remote add origin "$PRACTICE_GITHUB_URL"
      - git push -q --force --mirror origin    # replaces everything on GitHub with the starting state
```

- Starting or resetting the challenge creates the repository (public) if needed, closes open pull requests and issues, deletes releases and rules, then runs the setup with `PRACTICE_GITHUB_URL` set, makes `main` the default branch and runs the teammate steps. Only after the student accepted the consent screen.
- Setup lines never call `gh` and never name a github.com address. Solution lines may use `gh` (the student types them) but never `--repo`, an address, or `gh repo delete`. The content check refuses both.
- One repository per lesson family, so several lessons may share a name; the setup's mirror push always starts it clean.
- `pnpm test:challenges` skips GitHub challenges; `pnpm test:github` runs them against the account signed in to `gh` on this computer.

**Answer challenges.** Some skills only read: finding a commit, reading a diff. Their challenges ask the student to write what they found into `answer.txt` (`echo 3 > answer.txt`, or `git rev-parse --short HEAD~2 > answer.txt`), and a goal checks the answer. Say exactly what form the answer takes ("the short commit ID", "a number", "the file name"). Add `echo answer.txt >> .git/info/exclude` to the setup, so the answer file stays out of `git status`.

**Where the steps run.** Each challenge gets a small workspace, and the steps run inside its `project` folder, where the student's terminal opens too:

```text
practice/<lesson-id>/
├── project/       the practice folder: setup, solution and the student's terminal run here
├── origin.git/    only if the setup makes it: a local "server"
└── teammate/      only if the setup makes it: someone else's clone
```

A lesson about remotes builds its own server beside the project, so everything works offline:

```yaml
    setup:
      - git init -q -b main
      # ... the usual config lines, then some commits ...
      - git init -q --bare -b main ../origin.git      # the "server": a repository with no working tree
      - git remote add origin ../origin.git
      - git push -q -u origin main
      # A teammate pushes a commit the student does not have yet:
      - git clone -q -c core.autocrlf=false ../origin.git ../teammate
      - git -C ../teammate config user.name "Tariq (teammate)"
      - git -C ../teammate config user.email "tariq@example.com"
      - echo "Docs live in docs/" >> ../teammate/README.md
      - git -C ../teammate commit -q -am "Point to the docs"
      - git -C ../teammate push -q
```

Clone the teammate with `-c core.autocrlf=false`, as above. Without it, on Windows the teammate's commit rewrites the line endings of every file, and the student's pull shows unrelated files as changed.

"Start this challenge" and "Reset" delete and rebuild the whole workspace, so nothing is left behind. A challenge may also start with no repository at all (for `git init` and `git clone`): the picture stays empty until the `project` folder itself is a repository, so ask for `git clone ../shop.git .` (the dot clones into the current folder).

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

## Module checkpoints

Each hands-on module ends with a checkpoint (course map, rule 4): a review page whose challenges mix the module's skills and give no hints. It is an ordinary lesson folder with two differences:

- The frontmatter has `checkpoint: true`, the ID is `checkpoint-<module-id>` and the title is "Checkpoint: <module title>".
- Its challenges have no `hints` field. (The content check refuses hints in a checkpoint, and a missing hint ladder anywhere else.)

What goes in the four sections:

| Section | In a checkpoint |
|---|---|
| Lede | What the student can prove here, in one or two sentences |
| `## Must know` | The module's cheat sheet: one table per lesson with the commands worth remembering, each with a one-line job, and the lesson to go back to. No new material |
| `## Under the hood` | The module's key ideas, a few lines each |
| `## Advanced` | Where the module's skills come back later in the course |
| `## Recap` | The handful of commands to know by heart |

Challenges: three, easy to hard, each a realistic situation that needs commands from at least two of the module's lessons. The quiz mixes the lessons too. `bookSection` and `bookUrl` name the Pro Git chapter the module follows most.

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

No "the practice folder", "the index" or "HEAD" until the student has met them. If you must point ahead, say what it is in a few words first.

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
