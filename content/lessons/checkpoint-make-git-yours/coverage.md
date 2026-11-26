# Coverage: checkpoint-make-git-yours

The checkpoint of the "Make Git yours" module. For course reviewers; the app does not show this file.

**Scope:** a review page and three challenges without hints. It teaches nothing new: every row of the cheat sheet repeats something one of the module's five lessons taught, and each challenge needs commands from at least two of them.

**Sources**

The checkpoint has no sources of its own. It draws on the five lessons, which draw on Pro Git 8.1 Git Configuration, 2.7 Git Aliases, Appendix A (Git in Other Environments), 8.3 Git Hooks, 8.4 An Example Git-Enforced Policy, 8.2 Git Attributes and 7.4 Signing Your Work. `bookSection` names chapter 8, which the module follows most.

## Cheat sheet, table by table

| Table | Lesson it repeats | Where in that lesson |
|---|---|---|
| Settings: where they come from, and your own commands | `config-pro` | Must know: Three scopes, `--unset`, Settings worth knowing, Aliases, Aliases that run a shell command; Under the hood: An include is read in place |
| Git in your editor and terminal | `git-in-your-tools` | Must know: `gitk` and `git gui`, VS Code's Source Control view, VS Code as Git's editor, VS Code as the diff and merge tool |
| Hooks: checks that run by themselves | `hooks` | Must know: Where hooks live, The exit code decides, A hook that checks your files, `commit-msg`, `--no-verify`, Share hooks with your team |
| Attributes: rules per file | `attributes` | Must know: One line per rule, `git check-attr`, Binary files, The fix (the rule table), Files that are already committed; Advanced: Keep your version of a file on every merge |
| Signing: proof of who made a commit | `signing` | Must know: Set it up, Sign a commit, Check signatures, The allowed signers file, Sign every commit, Sign a tag; Under the hood: Signing a commit that already exists |

"Under the hood" has one paragraph per lesson, each from that lesson's own Under the hood layer (for `hooks`, also "Rules nobody can skip: the server"). "Advanced" only points forward: `commit-craft`, `advanced-merging` and `large-repos` (written, linked), and the GitHub lessons (not written yet, named in plain text).

## Left out on purpose

| Point | Why |
|---|---|
| `includeIf` and work identities | Needs the global file; the checkpoint changes local settings only. Stays in `config-pro` |
| Shell prompts (`git-prompt.sh`, Zsh, posh-git) | Set up in the student's own shell files, outside the practice repository. Stays in `git-in-your-tools` |
| Server-side hooks (`pre-receive`, `update`) | No server in a local challenge; the Under the hood paragraph names the idea |
| Diff drivers, `export-ignore`, clean and smudge filters | Advanced material of `attributes`; no challenge here needs it |
| GPG setup, the "Verified" badge | GPG needs a keyring on the student's computer; the badge needs GitHub |
| Terminal output | A cheat sheet lists commands; the lessons show the output |

## Challenges and quiz

| Challenge | Level | Lessons it draws on |
|---|---|---|
| `first-day-setup` | easy | `hooks` (`core.hooksPath`, the shared `commit-msg` hook), `git-in-your-tools` (`core.editor "code --wait"`), `config-pro` (an alias, local scope) |
| `signed-clean-up` | medium | `attributes` (`* text=auto`, `--renormalize`), `signing` (`git commit -S`) |
| `release-under-policy` | hard | `hooks` (a hook that silently does not run: wrong `core.hooksPath`), `config-pro` (finding and fixing a local setting), `signing` (`commit.gpgSign`, replacing an unsigned commit, a signed tag), `attributes` (`*.sh text eol=lf`) |

- None has hints, as the checkpoint rule asks. No challenge uses `--global`, a network or the student's own keys: the signing challenges make a throwaway key pair in `../keys`, as the `signing` lesson does.
- `signed-clean-up` proves the conversion with an answer (`i/lf`, the first column of `git ls-files --eol menu.txt`), as the `attributes` lesson does. A `committed-file-lacks` check for CRLF cannot do it: the app takes the committed text of a file with no pending change from the working tree, and after `--renormalize` the working tree still has CRLF while the commit has LF. The answer can be typed without doing the work; the other goals cannot tell.
- In `release-under-policy`, the setup points `core.hooksPath` at `githooks` (no dot), a folder that does not exist, so the ticket hook never ran. The tag goal matches `[SHOP-20]`, so a tag made before the amend (on the old commit) does not pass. Once the hook is on, an amend that keeps the old message is refused by the hook, which leads the student to the right order.
- Limits of the goal checks: `first-day-setup` cannot tell whether the commit was made after the hook was switched on. `tag-is-annotated` cannot tell a signed tag from an annotated one; with `tag.gpgsign false` in the setup, the brief asks for `git tag -s`. `core.editor` is set to `code --wait` in the easy challenge, so a student without VS Code must commit with `-m`, which the brief's wording leads to.

Quiz: four questions. A shared hook that does not run in a fresh clone (`hooks`, `config-pro`); a rule that did not convert committed files (`attributes`, with `core.autocrlf` from `config-pro`); turning signing off for one repository by scope (`config-pro`, `signing`); amending for a signature while a `commit-msg` hook is on (`signing`, `hooks`).
