# Phase 6 lesson writer brief (shared by every writer)

You write ONE lesson of GitRemastered phase 6. Several writers work at the same time in the same folder, one lesson each. Follow `.claude/agents/lesson-writer.md` and `docs/writing-lessons.md` exactly (all 18 teaching rules, the audit list at the end). Copy the quality and depth of phase 5 lessons such as `content/lessons/branch-and-merge/` and `content/lessons/remotes/`.

## Your files

- `content/lessons/<your-id>/lesson.md`, `challenges.yaml`, `quiz.yaml`, `coverage.md`.
- Only the command pages your brief names as yours (`content/commands/<command-id>.md`, new files, format as in `content/commands/git-merge.md`). Do not edit other command pages; if one needs a change, say so in your report.
- Glossary terms: append them to `content/glossary.yaml` with ONE bash command (`cat >> content/glossary.yaml <<'YAML' ... YAML`), keeping the file's two-space list format. Right before appending, `grep -n "id: <term-id>$" content/glossary.yaml` and skip any term that already exists. If `lesson:check` later fails because of a duplicate term ID, remove only your own entry. List only your lesson in `lessons`.
- Do NOT edit `content/paths/*.yaml`, other lessons, or anything under `app/`. The main session adds paths and links afterwards.

## Links

Link `term:` IDs that exist in `content/glossary.yaml`, and `lesson:` IDs of lessons that are already committed (`git ls-files content/lessons`). Lessons that are being written right now (all of phase 6) are named in plain text, like "the Rebasing lesson"; a link pass converts them later (teaching rule 18).

## Facts

- Read your Pro Git sources under `book/progit2/book/...` and the Git reference where the brief says so. Every console block must be real output: run the commands in a scratch folder under your system temp directory and paste what Git prints (Git 2.55 on this PC). Never invent output.
- Teach today's commands (`git switch`, `git restore`) and add a `compare` block when the book shows older ones.

## Challenges

- 3 or more, easy, medium, hard. Setup starts with the four lines from the writing guide. Each challenge's solution must reach every goal; `pnpm lesson:check <your-id> [your command ids]` (run from `app/`) proves it.
- Goal checks: only those listed in `docs/writing-lessons.md` (version 3 added file contents, `history-is-linear`, `commit-comes-before`, `config-is-unset`, `latest-commit-is-signed`, `worktree-exists`, `submodule-exists`, `file-is-in-no-commit`). Prefer a check that proves the real skill (for a conflict: `file-contains` the right lines and `file-lacks` the markers).
- Solutions run with `GIT_EDITOR=true` and no terminal. For an interactive rebase, script the todo list: `GIT_SEQUENCE_EDITOR="sed -i -e '2s/^pick/squash/'" git rebase -i HEAD~3`. For `git add -p`, pipe the answers: `printf 'y\nn\n' | git add -p notes.txt`. Hints should still teach the interactive way the student uses (the practice terminal opens the student's own editor; in Git Bash that is Vim unless they set another, and `nano` ships with Git for Windows).
- No challenge changes a global setting (`--global`, `~/.gitconfig`, `~/.ssh`): use `git config --local` (decision 6 in tasks/todo.md).
- No challenge uses a network or GitHub. Wave A lessons have no remote, except a folder beside the project (`../library.git`) when the lesson's subject is cloning from a source (submodules, large repos).

## While others work

The app code is being changed alongside you. If `lesson:check` fails with a build or compile error that has nothing to do with your files, wait a minute and run it again.

## Report

Short: files written, what the lesson covers, the final `lesson:check` result (paste the last lines), glossary terms you added, plain-text mentions of other phase 6 lessons (for the link pass), and anything the app or another page needs.
