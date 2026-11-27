# Roadmap

Ideas for after the first release. Each one says the problem, the idea, open questions, a rough size and its status.

**Status:** `idea` (not decided) → `planned` (decided, not started) → `doing` → `done`.
**Size:** S (days), M (one to two weeks), L (several weeks).

At the release, each idea becomes a GitHub issue labelled `idea` or `after-1.0`, and this page links to it, so contributors can discuss it there.

| # | Idea | Status | Size |
|---|---|---|---|
| F1 | Course content in a database | idea (leaning no) | M |
| F2 | Website: read lessons and quizzes in the browser | planned | L |
| F3 | "Ask AI" with the student's own AI account | idea | M |
| F4 | Resources page for further study | planned | S |
| F5 | Repository docs cleanup | planned | S |

---

## F1. Course content in a database (SQLite)

- **Problem:** none measured yet. The question was whether a database would make the app faster or lighter.
- **Idea:** store lessons, commands and glossary terms in SQLite instead of Markdown and YAML files.
- **First take:** probably not worth it.
  - Lessons are small text files, bundled into the app at build time. Speed and memory would not change: most memory is the browser engine, not the content (see `docs/measurements.md`).
  - Plain files keep contributions easy: a lesson fix is a normal pull request with a readable diff.
- **When it would pay off:** fast full-text search over a much larger course, or lessons written by users inside the app.
- **Open question:** does search get slow as the course grows? Measure before deciding.

## F2. Website

- **Problem:** people who can't or won't install a desktop app can't read the course.
- **Idea:** a website with a landing page, every lesson, quizzes, challenge briefs, and search over commands and glossary terms. No practice terminal (that needs the desktop app's real shell).
- **How:** a second SvelteKit app that reuses `packages/course-engine` (already split out for this). Shared screens move to a `packages/ui` package once it is clear which ones the website really needs.
- **Open questions:**
  - Where does it live: `apps/web/`, or a separate folder at the root?
  - Hosting (GitHub Pages works for a static site).
  - Progress without an account: browser storage only?
- **Order:** after the design pass (proposal P5), so the website starts from the final design.

## F3. "Ask AI" with the student's own AI account

- **Problem:** students get stuck and want to ask a question about the lesson in front of them.
- **Idea:** an "Ask AI" button that sends the question, with the lesson as context, to the student's own AI provider.
- **Options:**

| Option | How | Trade-off |
|---|---|---|
| API key in the app | Student pastes a key; the Rust core stores it in the system keychain | Works with most providers; the app holds a secret, so it needs the security review |
| Course MCP server | The app exposes the course (search, lessons, glossary) to the student's own AI tool | No keys in our app; only for students who already use such a tool |

- **Open questions:** provider terms for this use; whether the content license (CC BY-NC-SA) allows sending lessons to a provider; cost warnings for students.

## F4. Resources page

- **Problem:** students who finish the course ask "what next?"
- **Idea:** a page of trusted Git and GitHub resources: official docs, well-known articles, videos and courses, each with one line on why it is worth the time.
- **Note:** separate from the sources the lessons were written from (those are already linked on each lesson).
- **Open question:** who reviews new links, and how often dead links are checked (the link check in `tools/` could cover it).

## F5. Repository docs cleanup

- **Problem:** work notes (`tasks/`) and some documents in `docs/` were written for building the app, not for contributors.
- **Why later:** the slash commands and helper agents still read them during development (`/plan` and `/build` use `tasks/`, `/spec` uses `SPEC.md`). Moving them now would break that workflow.
- **Idea, once development settles:**
  - Fold the lesson rules from the phase briefs into `docs/writing-lessons.md` and the `lesson-writer` agent.
  - Split `SPEC.md` into `docs/architecture.md` (how the system works today) without the approval history.
  - Move `DESIGN.md` into `docs/design/`.
  - Add the remaining community files: `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CHANGELOG.md`, issue and pull request templates.
