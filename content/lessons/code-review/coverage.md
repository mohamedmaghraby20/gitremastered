# Coverage: code-review

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** the time between "pull request opened" and "pull request merged", from both seats. The reviewer reads the change, runs it, comments and submits a verdict. The author answers, pushes fixes and merges. Beyond the book: Pro Git shows comments on a pull request, but GitHub's review feature (three outcomes, suggestions, required reviews) is newer than the book.

**Sources**

| Source | Sections used |
|---|---|
| GitHub Docs: About pull request reviews | What a review is, the three statuses (comment, approve, request changes), pending comments, re-requesting a review, required reviews, "Pull request authors cannot approve their own pull requests" |
| GitHub Docs: Reviewing proposed changes in a pull request | Line comments, "Start a review" and "Add single comment", marking a file as viewed, submitting the review |
| GitHub Docs: Incorporating feedback in your pull request; Commenting on a pull request | Suggested changes and "Commit suggestion", resolving conversations |
| GitHub Docs: Dismissing a pull request review; About protected branches | Dismissing a review, stale approvals, required approvals (pointer only) |
| Pro Git 6.2 Contributing to a Project, "Iterating on a Pull Request" | Line comments, general comments, pushing to the topic branch updates the pull request, no notification on push, outdated comments are collapsed, the Files changed diff is `git diff master...<branch>` |
| GitHub CLI manual: `gh pr list`, `view`, `diff`, `checkout`, `review`, `comment`, `merge`, `checks`, `edit` | Every `gh` command and option shown |

## Pro Git 6.2 (the pull request comments part), point by point

| Book point | In the lesson | Layer |
|---|---|---|
| The owner can merge, reject or comment on a pull request | Yes, as the three review outcomes plus merging | Must know |
| Comment on a specific line of the diff by clicking it | Yes | Must know (Comment on lines) |
| The author and watchers get a notification | Yes, as the reason for "Start a review" (one notification) and for commenting after a push | Must know |
| Anyone can leave general comments; code comments appear in the conversation too | Yes: Conversation tab, `gh pr comment`, `gh pr view --comments` | Must know |
| The author commits to the topic branch again and pushes; the pull request updates | Yes, with real output and a graph | Must know (The author's seat), Under the hood |
| A comment on a line that has since changed is collapsed | Yes, as "Outdated" | Under the hood |
| Adding commits does not notify; leave a comment to say the change is made | Yes | Must know (step 3) |
| Files changed shows the unified diff, like `git diff master...<branch>` | Yes, as `git diff main...add-allergens` | Must know (The same thing in the browser) |
| The merge button and the non-fast-forward merge | Only as `gh pr merge --merge` and its merge commit | Must know (step 4); see "Left out" |
| Pull the branch and merge locally instead | No | See "Left out" |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Opening a pull request, forks, the GitHub Flow, drafts | The lesson before this one | `github-flow-prs` |
| Merge methods (merge commit, squash, rebase) and their trade-offs | Its own lesson; only `--merge` is used here | `pr-merge-strategies` |
| Keeping a pull request up to date, conflicts with `main` | Taught with pull requests | `github-flow-prs` |
| Setting up required reviews, dismissing stale approvals, CODEOWNERS | Explained in words, with a pointer | `branch-protection-codeowners` |
| Status checks and CI | Named in Advanced only | `github-actions-ci` |
| Merging a pull request locally, `refs/pull` in the fetch refspec, the maintainer's view | The maintainer's lesson | `maintaining-github-repo` |
| Cross references, Markdown, task lists, emoji in comments (rest of 6.2) | Not about reviewing | `github-flow-prs`, `issues-projects-security` |
| Email notifications and their settings | Account settings; the course does not change them | `maintaining-github-repo` (named there) |

## Beyond the book

- The review feature itself: pending comments, the three outcomes, `gh pr review`.
- Authors cannot approve their own pull request (GitHub Docs), with the real error and what happens with a real teammate (decision 3).
- Suggested changes, "Viewed" checkboxes, resolving conversations, re-requesting a review.
- `gh pr checkout`, `gh pr diff`, `gh pr view --comments`, `gh pr comment`, `gh pr checks`.
- What makes a good review comment: common practice, not from a single source.
- A review is recorded against a commit (seen in `gh pr view --json reviews`, field `commit`); `refs/pull/<n>/head` and `/merge` (seen with `git ls-remote`).

## Output in the lesson

- Every console block is real output from `gh` 2.104 and Git 2.55 on the practice repository, taken with a terminal-style display. Three kinds of edits were made: the account name became `your-name` (and the display name in brackets after it was dropped, as in `github-flow-prs`), pull request numbers from several runs were made the same (#6), and trailing spaces were removed.
- A successful `gh pr review` printed nothing in the capture, so the lesson shows the review through `gh pr view --comments` instead of a confirmation line.
- Web page details (button names, the "Viewed" checkbox, greyed-out choices for authors) come from GitHub Docs, not from a screen capture.

## Challenges and quiz

- Easy, `check-out-teammates-pr`: Tariq's branch is only on GitHub. `gh pr checkout`, then find the second changed file (`answer-is`). Checks: on the branch, the answer, the pull request still open.
- Medium, `review-with-a-comment`: check out the pull request, read it, submit a comment review (`github-pull-request-has-review`). The pull request must stay open.
- Hard, `answer-a-review`: the student is the author. Fix, commit, push, comment, merge, pull. Checks: merged on GitHub, on `main`, `allergens.txt` in the latest commit contains "nuts", `main` level with `origin/main`. It needs the Under the hood fact that a pull request follows its branch.
- Not checked: the reply comment in the hard challenge. `github-pull-request-has-comment` is already met by Tariq's comment when the challenge starts, so it cannot prove the student's reply.
- The Try-its run in the hard challenge's starting state and only read, check out and comment-review its pull request. They do not fix the file, push or merge, so the challenge keeps all its work. The console block for `gh pr checkout` of a branch that is not local yet comes from the easy challenge's state and shows no diff, so it does not give the easy answer away.
- Approve and request changes cannot be practised: every pull request in the practice repository is opened from the student's own account. The lesson shows the real refusal and describes the teammate case.
- Quiz: approving your own pull request; answering requested changes; which outcome for a half-read pull request; what an approval covers after new commits.
