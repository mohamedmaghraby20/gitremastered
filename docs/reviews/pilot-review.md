# Pilot review (phase 3)

The pilot lesson (`three-areas`) and the second lesson (`ignoring-files`) played as a student in the real desktop app on Windows, 2026-11-25.

**How:** a release build with its own app identifier (a "review copy", so your own progress and practice folders are untouched), driven by `apps/desktop/scripts/review/` through the web view's DevTools port: it clicks, types into the real terminal and reads the screen. Your own run-through as a student is still to come (Checkpoint D).

## Findings

| #   | What a student would hit                                                                                                                                                                                                                                                                                                        | Severity       | Status                                                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **The terminal was off-screen.** In a wrapping flex row each column grew to the full lesson length (~4,000 px), so the practice column stretched, the history map became a huge empty area and the terminal sat ~3,800 px down the page. The shell was running, but its prompt only showed once the student found the terminal. | Blocker        | Fixed: the app shell is exactly window-height, each page scrolls inside `<main>`, both lesson columns are `h-full`. Layout test at 1440 × 900 with a long lesson.                                                  |
| 2   | **The page still scrolled a little** after fix 1: the checklist's screen-reader-only labels were positioned against the page, not the lesson column.                                                                                                                                                                            | Minor          | Fixed: the lesson's scroll area is `relative`; the same test checks the page itself never scrolls.                                                                                                                 |
| 3   | **"File is committed" could be met without committing.** The goal only checked that the file had no pending change, so a file that does not exist also passed: `rm notes.txt` plus an empty commit "solved" the pilot.                                                                                                          | Major (engine) | Fixed: the snapshot now lists the files in the latest commit (`committedFiles`, from `git ls-tree`), and the goal needs the file there. Unit and Rust tests.                                                       |
| 4   | The shell prompt shows the full practice-folder path (`~/AppData/Local/io.github…/practice/three-areas`), two lines long.                                                                                                                                                                                                       | Cosmetic       | Waiting: Git Bash's `/etc/profile` overwrites `PS1`, so shortening it means a custom shell start file. The terminal's title bar already shows `~/practice/three-areas`. Revisit with the terminal work in phase 5. Also seen 2026-11-26: right after Ctrl C stops a command, the first key typed can be lost while bash redraws this long prompt (`echo` ran as `cho`), and after the terminal is resized its output can stall halfway through this prompt. A shorter prompt should fix all three. |
| 5   | Component tests could not see Tailwind classes (the test config had no Tailwind plugin), so no layout test was possible and bug 1 went unnoticed.                                                                                                                                                                               | Process        | Fixed: Tailwind added to `vitest.config.ts`.                                                                                                                                                                       |
| 6   | **The visualizer was a little slow:** 313 ms median from pressing Enter to the desk update (target 300 ms). | Major (target) | Fixed: the snapshot's four Git reads run in parallel; now 234 ms median, 238 ms slowest. Details in `docs/measurements.md`. |
| 7   | **Quiz said "✓ Right. Right."**: the screen adds "✓ Right." and every right-answer explanation also started with "Right." | Minor (content) | Fixed in both quizzes; the content check now refuses it; rule added to `docs/writing-lessons.md`. |
| 8   | **The terminal shows only ~7 rows**, so `git status` output scrolls off the top. Its height (280 px) follows the approved prototype. | Design question | Decided in round 2: the terminal takes ~40% of the column (finding 10). |
| 9   | Citation links were limited to git-scm.com, but the course map has lessons sourced from GitHub Docs. | Minor | Fixed: `https://docs.github.com/` allowed in the content check and the opener permission. |

## Round 2: your run-through (2026-11-26)

Your notes after taking the pilot yourself. Fixed items were checked in the desktop app with `pnpm review:fixes`.

| # | What you noticed | Kind | Status |
|---|---|---|---|
| 10 | The terminal is too small | Layout | Fixed: about 40% of the practice column |
| 11 | The desk's file zones are too big; "git add" has more space around it than "git commit" | Layout | Fixed: smaller zones and sheets; both commands get the same space on each side |
| 12 | **Ctrl V does not paste** in the terminal | Bug | Fixed: Ctrl V (and Ctrl Shift V) paste; Ctrl C copies selected text and otherwise still stops a command |
| 13 | No way to change the terminal's text size | Feature | Fixed: Ctrl + / − / 0, kept after a restart |
| 14 | The mission and the quiz read as one block; it is not clear the mission checks your work | Clarity | Fixed: "Your mission" and "Quiz" headings, each with one line saying what it is for |
| 15 | Quiz questions are stuck together in one card | Clarity | Fixed: each question is its own card |
| 16 | The history map zooms in on double-click but cannot zoom out | Bug | Fixed: zoom in / out / fit buttons, mouse wheel and trackpad pinch; drag to look around |
| 17 | The branch name under the commit is hard to read as a branch | Clarity | Fixed: HEAD and "branch main" labels sit above the commit, like tags |
| 18 | The yellow behind key terms is harsh | Design | Fixed: a soft marker stroke under the words (new token `highlight-soft`, in `docs/DESIGN.md` and `tokens.json`) |
| 19 | The map will not fit once branches grow; panels cannot be resized | Design | Planned: task 41 (drag to resize panels) and task 42 (expand the map, follow HEAD; branch lanes with the branching lessons) |

Also from the walkthrough: Ctrl K should open a quick search panel over the current screen, with "See all results" leading to the search page (added to task 37); a general design pass ("more premium") after all phases; and a review of how deep the lessons go (next discussion).

## SPEC §10 results

From `pnpm review:play` (11 steps, all pass), `pnpm review:terminal` and `pnpm review:measure`, after the fixes above.

| # | Criterion | Result |
|---|---|---|
| 2 | Pilot shows all three layers and the recap card | ✓ Tabs switch; recap card shown |
| 3 | Real Git in a practice folder; typing feels instant | ✓ Prompt after ~1.3 s; a typed command answers in ~46 ms (Checkpoint B) |
| 4 | Visualizer updates within 300 ms | ✓ 234 ms median, 238 ms slowest, counted from Enter |
| 5 | Mission sets up, detects the goal, serves all hints; reset works | ✓ 3 hints then disabled; "3 / 3 done" 228 ms after the commit; reset back to 1 / 3 with a fresh shell |
| 6 | Quiz checks answers and explains them | ✓ Wrong and right answers explained; score shown |
| 7 | Progress survives an app restart | ✓ ✓ mark kept after closing and reopening |
| 8 | Second lesson with content files only | ✓ `ignoring-files` mission reaches 3 / 3 |
| 10 | Memory under ~250 MB with the pilot open | ✓ 233 MB private (457 MB working set incl. shared WebView2 pages) |

Also checked: the Pro Git link opens the system browser from the desktop window (task 24).

## Not covered by the driver

- How the lesson *reads* to a person: tone, clarity, pacing. That is your run-through.
- macOS and Linux (SPEC §10 item 1): only Windows was played.
- Keyboard-only and screen-reader use in the desktop window (covered by component tests, not played end to end).
