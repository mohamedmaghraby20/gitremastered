# Coverage: pr-merge-strategies

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** the three ways GitHub merges a pull request (merge commit, squash, rebase), what each does to `main`'s history, how to choose, the repository settings that allow or forbid them, `gh pr merge`, and the local clean-up afterwards (`git branch -d` refusing after a squash or rebase-merge).

**Sources**

| Source | Sections used |
|---|---|
| GitHub Docs: About merge methods on GitHub | All of it: the default merge commit (`--no-ff`), squashing and its three disadvantages, rebasing and merging and how it differs from `git rebase`, signature note |
| GitHub Docs: Pull request merges (reference) | The "choose when" table, the default squash message, "Squashing and merging a long-running branch" |
| GitHub Docs: Configuring commit merging / squashing / rebasing for pull requests | The setting names under Settings, General, "Pull Requests"; the default squash message rule |
| GitHub Docs: Managing the automatic deletion of branches | "Automatically delete head branches" |
| GitHub Docs: About protected branches | "Require linear history" |
| GitHub CLI manual: `gh pr merge`, `gh pr list`, `gh pr view` | `--merge`, `--squash`, `--rebase`, `--delete-branch`, `--subject`, `--body`, `--auto` |
| Pro Git 3.6 Rebasing | "Rebase vs. Merge" (record or story), recalled; the rebase mechanics are taught in `rebasing` |
| Git reference: `git-merge` (`--squash`, `--no-ff`), `git-branch` (`-d`, `-D`, `-vv`), `git-cherry` | The local twins of the buttons, the "fully merged" rule, `[gone]` |

## GitHub Docs "About merge methods", point by point

| Docs point | In the lesson | Layer |
|---|---|---|
| The default option adds all commits in a merge commit, using `--no-ff` | Yes, with a diagram, a real log and the raw commit | Must know, Under the hood |
| A repository can enforce one method by enabling only that one | Yes | Must know (settings) |
| Linear history can be enforced on a protected branch; it forbids merge commits | Yes, in words | Must know (settings) |
| Squash and merge: the commits become a single commit on the base branch | Yes: diagram, real log, a local Try-it with `git merge --squash` | Must know |
| Why squash: work-in-progress commits need not stay in history | Yes | Must know (Which one to choose) |
| Squash disadvantage: you lose when changes were made and who authored them | Yes ("the steps inside the pull request, and who wrote which"); `Co-authored-by` shown | Must know, Under the hood |
| Squash disadvantage: continuing on the head branch lists old commits again and repeats conflicts | Yes; also a quiz question | Must know |
| Squash disadvantage: commands that use the original IDs get harder (`git rerere`) | Partly: "the original IDs are gone"; `rerere` not named | Must know |
| Rebase and merge: commits are added one by one, no merge commit, linear history | Yes: diagram, real log | Must know |
| GitHub's rebase always updates the committer and makes new IDs, unlike `git rebase` on an ancestor | Yes, shown with `%an / %cn` | Must know, Under the hood |
| GitHub's rebase drops commits that were empty | Left out (see below) | |
| Rebase-merged commits lose signature verification | Yes | Advanced |
| Contributors may have to rebase locally and force-push before Rebase and merge is possible | Partly: the "not mergeable" error and its fix | Must know (When it goes wrong) |
| You need write permission to merge | Left out (see below) | |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Opening a pull request, GitHub Flow, forks | Its own lesson; here one sentence and the glossary term | `github-flow-prs` |
| Reviewing and approving before the merge | Its own lesson | `code-review` |
| Merge queue (the queue chooses the method) | An organization feature beyond a first team setup | `branch-protection-codeowners` names it, if at all |
| Rulesets and branch protection in detail; setting "require linear history" | Only named here | `branch-protection-codeowners` |
| Write permission and repository roles | Permissions lesson | `orgs-teams-permissions` |
| Empty commits are dropped by Rebase and merge | Rare | GitHub Docs |
| Changing the default merge and squash message formats | Named in one sentence | GitHub Docs |
| Force-pushing a rebased head branch | Named only | `force-push-safely` |
| Interactive rebase to tidy commits before a pull request | Its own lesson | `clean-up-history` |
| Indirect merges (a pull request marked merged because its commits reached the base another way) | Rare | GitHub Docs |

## Beyond the sources

- The local clean-up: `git branch -d` refuses after a squash or a rebase-merge, the three checks before `-D`, and the rule `-d` follows (upstream first, then HEAD) with the real warning. This is from the Git reference (`git-branch`) and real runs, not from GitHub Docs.
- The proof that all three methods give the same files: `git rev-parse 'main^{tree}' 'hours^{tree}'`.
- `git cherry -v` finds rebase-merged commits by patch ID and cannot find a squash.
- `git branch -vv` and `[origin/…: gone]`.

## Challenges and quiz

- All three run on `gitremastered-practice-pr-merge-strategies`; a teammate step opens each pull request.
- Easy, `squash-the-hours`: three commits, `gh pr merge hours --squash`, `git pull`. `commit-count-is 3` separates the methods (a rebase-merge gives 5, a merge commit 6). This is also the starting state of the Try-its, which only read the pull request and work on `try-main` and `try-notes`.
- Medium, `two-pull-requests-two-methods`: `menu` by rebase, then `about` by merge commit. Goals: the tip is a merge commit whose message names `/about`, and `main` has exactly 7 commits (two merge commits give 8, a squash of menu gives 6; about rebased and menu merged fails the `/about` check).
- Hard, `clean-up-after-a-squash`: the student squash-merges with `--subject` (Advanced), deletes the branch on GitHub and locally, and writes the squash commit's ID. The student starts on `gallery`, which has an upstream, so they meet "cannot delete branch used by worktree" and either the warning or the "not fully merged" error, depending on the order of their steps.
- Why the student, and not a teammate step, does the squash in the hard challenge: `answer-is-commit` needs the exact first line of the commit. A squash merged through the API is titled "Add a gallery page (#N)", and N grows with every attempt because the practice repository is never deleted. With `--subject` the title is fixed.
- Quiz: what a squash adds to `main`; the "not fully merged" message after a squash; which setting gives separate commits in a straight line; reusing a squashed branch.

## Notes on the console output

- Captured with Git 2.55 and gh 2.104 on Windows, on the real practice repository. The account name is replaced by `your-name`, and the account's name and email by `Your Name <you@example.com>`.
- `gh` prints its `✓` lines only in a terminal. They were captured with `GH_FORCE_TTY` set (and once through `winpty`); the long line of `gh pr merge` is shown unwrapped.
- The "used by worktree" error shows a shortened folder path (`C:/practice/project`).
- GitHub signs the merge and squash commits it makes; the `gpgsig` lines are cut from the two `git cat-file -p` outputs, and the lesson says so.
- The diagrams and logs for the three methods come from three runs of the same pull request with fixed commit dates, so the local IDs match across them. Pull request numbers differ between runs (#9, #10, #11, and #4, #5, #7 in the Advanced and error examples).
- Not checked on screen: the exact look of the merge button's menu and of the Settings page. The names used (Merge pull request, Create a merge commit, Squash and merge, Rebase and merge, Allow merge commits, Allow squash merging, Allow rebase merging, Automatically delete head branches) are the ones GitHub Docs print.
