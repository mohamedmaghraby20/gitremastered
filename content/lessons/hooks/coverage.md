# Coverage: hooks

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** what a hook is, writing and switching on client-side hooks, exit codes, `--no-verify` and why hooks are not security, server-side hooks, and sharing hooks with `core.hooksPath`. Pro Git 8.4 builds its policy in Ruby; the lesson teaches the same ideas with short shell scripts.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 8.3 Git Hooks | Installing a Hook; Client-Side Hooks (committing-workflow, email workflow, other client hooks); Server-Side Hooks (`pre-receive`, `update`, `post-receive`); the tip on long options |
| Pro Git 8.4 An Example Git-Enforced Policy | Server-Side Hook (the `update` arguments, `git rev-list`, the commit-message format check, Testing It Out); Client-Side Hooks (the `commit-msg` check, checking the staging area, hooks are not transferred with a clone) |
| Git reference: `githooks` | Hook arguments and standard input, which hooks `--no-verify` skips, where hooks run, `core.hooksPath` |
| Git reference: `git-config`, `git-hook`, `git-add`, `git-update-index`, `git-grep`, `git-rev-parse` | `core.hooksPath`, `core.fileMode`, `git hook run`, `git add --chmod=+x`, `git update-index --chmod=+x`, `git grep --cached`, `git rev-parse --git-path hooks` |

All console blocks were run with Git 2.55.0.windows.3 in a scratch folder.

## Pro Git 8.3, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Hooks are custom scripts fired at certain actions; two groups, client-side and server-side | Yes | Must know (definitions, "The hooks worth knowing", "Rules nobody can skip") |
| Hooks live in the `hooks` folder of the Git directory, usually `.git/hooks` | Yes, with the real `ls` | Must know |
| `git init` fills the folder with samples ending in `.sample`; they document their inputs | Yes, with `head` of `pre-commit.sample` | Must know |
| Any executable script in any language works | Yes | Must know ("Your first hook") |
| To enable: right name, no extension, executable | Yes, as a three-rule table | Must know |
| Client-side hooks are not copied by a clone; enforce policy on the server | Yes | Must know ("Share hooks", "`--no-verify`", "Rules nobody can skip") |
| `pre-commit`: runs first, inspects the snapshot, non-zero aborts, `--no-verify` bypasses | Yes, with three Try-its | Must know |
| `prepare-commit-msg`: runs before the editor, its three parameters, good for generated messages | Yes | Must know (table), Under the hood (arguments) |
| `commit-msg`: one parameter, the message file; non-zero aborts | Yes, with a worked script | Must know |
| `post-commit`: no parameters, cannot stop anything, used for notification | Yes, as the first hook | Must know |
| Email workflow hooks (`applypatch-msg`, `pre-applypatch`, `post-applypatch`) | Named with their job | Advanced ("More hooks") |
| `pre-rebase`, `post-rewrite`, `pre-auto-gc` | Named with their job | Advanced ("More hooks") |
| `post-checkout`, `post-merge` | Yes | Must know (table), Under the hood (arguments) |
| `pre-push`: parameters, refs on stdin, non-zero aborts | Yes | Must know (table), Under the hood (arguments) |
| Server hooks run before and after pushes; "pre" hooks can reject and print to the client | Yes | Must know |
| `pre-receive`: once per push, refs on stdin, rejects all | Yes | Must know, Under the hood |
| `update`: once per branch, three arguments, rejects that branch only | Yes | Must know, Under the hood, Advanced (worked example) |
| `post-receive`: after the push, cannot stop it, notifications and CI | Yes | Must know |
| Tip: prefer long flags in scripts | Yes | Advanced (end of "More hooks") |

## Pro Git 8.4, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Server enforces, client hooks warn early | Yes | Must know ("Rules nobody can skip") |
| The `update` hook's three arguments | Yes | Under the hood, Advanced |
| Enforcing a commit-message format (`ref: 1234`) with `git rev-list` over the pushed commits | Yes, as a shell script with `[SHOP-12]`, run against a real bare repository | Advanced ("A server-side policy") |
| Reading a commit's message with `git cat-file` and `sed` | Replaced by `git log -1 --format=%B`, which is simpler in shell | Advanced |
| Testing it out: the `remote:` lines, "hook declined" | Yes, real output | Advanced |
| Client `commit-msg` hook with the same pattern | Yes; also the hard challenge | Must know (`commit-msg`), Advanced |
| Client `pre-commit` must read the staging area (`git diff-index --cached`), not the log | Yes, taught with `git grep --cached` and a Try-it that shows why | Must know ("A hook that checks your files") |
| Hooks are not transferred with a clone; distribute them in the project and have users install them | Yes, with today's `core.hooksPath` and a `compare` block for the book's copy step | Must know ("Share hooks with your team") |
| `pre-rebase` script that refuses rebasing pushed commits | Named only | Advanced ("More hooks") |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| The user-based ACL system (who may change which folder), the `$USER` and SSH wrapper discussion | Ruby-heavy and specific to a self-run SSH server; mentioned in one sentence | Not taught; GitHub's permissions and CODEOWNERS do this job in `orgs-teams-permissions` and `branch-protection-codeowners` |
| Enforcing fast-forward-only pushes, `receive.denyDeletes`, `receive.denyNonFastForwards` | Server configuration, not hooks | Branch protection in `branch-protection-codeowners` |
| The full `pre-rebase` Ruby script | The idea is named; the script needs `git rev-list` and remote refs in depth | Rebasing lesson covers the rule "do not rebase pushed commits" |
| Details of the email workflow hooks | The course does not teach the email workflow | Named in Advanced only |
| Commit templates with `prepare-commit-msg` | Belongs with message conventions | `commit-craft` |
| CI as the server-side check on GitHub | Its own lesson | `github-actions-ci`, `branch-protection-codeowners` |

## Beyond the book

- `core.hooksPath` with a tracked `.githooks` folder (Git reference, `git-config`; added after the book's hook chapter was written). The lesson's main sharing method, with a `compare` block against the book's copy-by-hand step.
- `git add --chmod=+x` and `git update-index --chmod=+x`, and `core.fileMode` being `false` on Windows (Git reference, `git-add`, `git-update-index`, `git-config`): without it, a hook committed from Windows is not executable for macOS and Linux teammates.
- Which hooks `--no-verify` skips, shown with real output (`githooks`: `pre-commit` and `commit-msg`; also `pre-merge-commit` and, on push, `pre-push`).
- `git hook run` for testing a hook, and `git rev-parse --git-path hooks` for finding the active folder (Git reference).
- Hooks on Windows: Git for Windows runs them with its bundled shell through the shebang line; the real "cannot spawn" error for a missing shebang.
- Hook frameworks named: pre-commit, Husky, Lefthook.
- GitHub.com does not accept custom server-side hooks; branch protection and required checks do that job (sidenote, pointing to the GitHub lessons).

## Known limit

- The message Git prints on macOS and Linux for a hook without the executable permission is described in words, not shown as a console block: this lesson's outputs were produced on Windows, where that message cannot appear.

## Challenges and quiz

- Easy, `switch-on-team-hook`: a `commit-msg` hook is already tracked in `.githooks`; set `core.hooksPath` (local) and make a commit it accepts.
- Medium, `refuse-debug-lines`: write a `pre-commit` hook that refuses staged `.js` files with DEBUG, switch it on, remove the existing DEBUG line and commit both. The hook must limit its search, or it blocks itself.
- Hard, `require-ticket-number`: write a `commit-msg` hook that requires `[SHOP-<digits>]`, using `"$1"` (Under the hood, "What each hook is given") and the pattern from Advanced; the commit that adds the hook must pass it, then a second commit carries `[SHOP-12]`.
- Every challenge uses `git config --local`; no global setting, no network. Hooks run only inside the practice folder.
- Try-its use `todo.txt`, hooks in `.git/hooks` and a `team-hooks` folder, with other words (FIXME) than the challenges (DEBUG, tickets), and the last Try-it unsets `core.hooksPath` again.
- Quiz: hooks are not cloned; client hooks are not a guarantee; a hook must check the staging area; the exact file name.
