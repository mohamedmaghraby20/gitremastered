# Implementation Plan: Repository structure

Source spec: none yet. Based on the decisions in `docs/course-map.md` and `CLAUDE.md` (Option B: one repo, separate folders).

## Overview

Set up the repository skeleton before the spec: one Git repo holding the book source, the course content, the app, the docs, and the factory tools. Students who fork it get the course and the app, never the user's personal study notes.

## Target structure

```
<repo root>
├── .agents/skills/       factory skills (real files, installed by `npx skills`)
├── .claude/              commands, reviewer agents, skill links, humanizer
├── CLAUDE.md             project rules (how to talk, how to write code)
├── README.md             what the project is, how to run it, credit to Pro Git
├── LICENSE               license file(s), see Open Questions
├── SPEC.md               written by /spec (factory expects it at the root)
├── skills-lock.json      exact versions of installed skills
├── book/
│   ├── progit2/          Pro Git source, pinned to one version
│   └── progit.pdf        reading copy, not committed
├── content/              the course, student-facing source of truth
│   ├── lessons/<lesson-id>/   one folder per lesson (files defined in SPEC)
│   ├── paths/            the two orders: pro path and book path
│   ├── reference/        short summary pages for reference-only sections
│   └── glossary          term list
├── app/                  the website; inside layout decided in SPEC
├── docs/                 course-map.md, decisions/ (why we chose X), writing guide
├── tasks/                plan.md, todo.md (written by /plan)
└── study/                personal notes, not committed
```

## Architecture decisions

1. **Lessons are flat, ordered by path files.** Earlier we sketched `content/ch01.../`. That breaks with two paths: a lesson can't live in "chapter 2" and "module 1" at once. So each lesson gets one folder named by its ID (`content/lessons/three-areas/`), and `content/paths/` lists the order for each path. Adding a third path later costs one file.
2. **The book is pinned.** Lessons cite exact book sections, so the book must not change under us. `book/progit2` becomes a Git submodule locked to commit `a013e32`. Forks get the same version. (This is also lesson 54 of our own course.)
3. **Personal and heavy files stay out of Git.** `study/` and `book/progit.pdf` (18 MB) go in `.gitignore`.
4. **Factory files follow the factory's conventions.** `SPEC.md` at the root, `tasks/` at the root, as `/build` expects.
5. **Skill links aren't committed, the real skills are.** `npx skills` put the real files in `.agents/skills` and Windows links (junctions) in `.claude/skills`. Git handles those links badly, so the links are ignored and `.agents/skills` plus `skills-lock.json` are committed. `.claude/skills/humanizer` is a real folder and is committed.
6. **`app/` stays empty until the spec.** Its inside layout depends on the tech stack.

## Task list

### Phase 1: Skeleton
- [x] Task 1: Turn the folder into a Git repo with a `.gitignore`
- [x] Task 2: Pin the book as a submodule and move the PDF into `book/`
- [x] Task 3: Create the empty top-level folders, each with a short README

### Checkpoint: Skeleton
- [x] `git status` shows only files we mean to commit
- [x] Folder tree matches "Target structure"
- [x] User reviews before the first commit

### Phase 2: Public face
- [x] Task 4: Write README.md and the license file(s)
- [x] Task 5: First commit

### Checkpoint: Done
- [x] A fresh clone with `--recurse-submodules` has the book and no personal files
- [x] Ready for `/spec`

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Committing the skill links breaks clones on other machines | Medium | Ignore `.claude/skills/*` links; commit `.agents/skills` instead |
| Submodules confuse forkers | Low | One line in README: clone with `--recurse-submodules` |
| Folder name has spaces and `&` | Low | Fine locally; pick a clean repo name on GitHub (see Open Questions) |

## Open questions

1. ~~Book: submodule or ignored folder?~~ **Decided:** submodule.
2. ~~License?~~ **Decided:** CC BY-NC-SA 3.0 for `content/`, MIT for `app/` code.
3. ~~GitHub repo name?~~ **Decided:** **GitRemastered** (repo `gitremastered`). The local folder keeps its current name.
