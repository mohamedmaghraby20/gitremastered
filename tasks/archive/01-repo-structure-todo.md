# Tasks: Repository structure

Plan: `tasks/plan.md`

## Task 1: Turn the folder into a Git repo with a .gitignore

**Description:** Run `git init` on the main branch and add a `.gitignore` that keeps personal, heavy and generated files out.

**Acceptance criteria:**
- [x] `git init` done, default branch `main`
- [x] `.gitignore` ignores `study/`, `book/progit.pdf`, the skill links in `.claude/skills/` (but not `humanizer`), and OS junk files
- [x] Ignore rules have a comment explaining each one

**Verification:**
- [x] `git status` lists no `study/`, no PDF, no skill links
- [x] `git check-ignore -v study/x book/progit.pdf` shows the matching rule

**Dependencies:** None
**Files likely touched:** `.gitignore`
**Estimated scope:** XS

## Task 2: Pin the book as a submodule and move the PDF into book/

**Description:** Replace the plain `book/progit2` clone with a Git submodule pointing at `progit/progit2`, locked to commit `a013e32`. Move `progit.pdf` into `book/`.

**Acceptance criteria:**
- [x] `.gitmodules` lists `book/progit2`
- [x] Submodule is at commit `a013e32`
- [x] `progit.pdf` lives at `book/progit.pdf` and is ignored

**Verification:**
- [x] `git submodule status` shows `a013e32`
- [x] `docs/course-map.md` section paths still resolve (spot-check 3 files)

**Dependencies:** Task 1
**Files likely touched:** `.gitmodules`, `book/`
**Estimated scope:** S

## Task 3: Create the empty top-level folders, each with a short README

**Description:** Create `content/` (with `lessons/`, `paths/`, `reference/`), `app/`, `docs/decisions/` and `study/`. Git doesn't track empty folders, so each committed one gets a README of 2 to 3 lines saying what goes there.

**Acceptance criteria:**
- [x] Folder tree matches "Target structure" in `tasks/plan.md`
- [x] Each README states the folder's purpose in plain words
- [x] `study/` exists locally and stays ignored

**Verification:**
- [x] Manual check: tree output matches the plan

**Dependencies:** Task 1
**Files likely touched:** `content/README.md`, `content/lessons/README.md`, `content/paths/README.md`, `content/reference/README.md`, `app/README.md`
**Estimated scope:** S

## Checkpoint: Skeleton
- [x] `git status` shows only files we mean to commit
- [x] User reviews before the first commit

## Task 4: Write README.md and the license file(s)

**Description:** Root README: what the project is, how the folders are organized, how to clone (`--recurse-submodules`), and credit to Pro Git (authors, license, link). Add the license file(s) chosen in Open Question 2.

**Acceptance criteria:**
- [x] README credits Pro Git by Scott Chacon and Ben Straub, CC BY-NC-SA 3.0, with a link
- [x] License file(s) match the decision
- [x] README passes the humanizer check

**Verification:**
- [x] Manual check: a newcomer can tell what the repo is in 30 seconds

**Dependencies:** Task 3, Open Question 2 answered
**Files likely touched:** `README.md`, `LICENSE`
**Estimated scope:** S

## Task 5: First commit

**Description:** Stage the skeleton and make the first commit with a clear message.

**Acceptance criteria:**
- [x] One commit containing only the intended files
- [x] Commit message describes the skeleton

**Verification:**
- [x] `git log --stat` shows the expected files
- [x] A fresh `git clone --recurse-submodules` of the repo has the book and no personal files

**Dependencies:** Task 4
**Files likely touched:** none new
**Estimated scope:** XS

## Checkpoint: Done
- [x] Ready for `/spec`
