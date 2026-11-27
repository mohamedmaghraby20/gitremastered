# Coverage: maintaining-github-repo

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** the owner's side of GitHub for one repository on a personal account: create it, invite collaborators, handle incoming pull requests (read, fetch by ref, test, merge or close with a reason), mentions and notifications, and the special files. Organizations, protection rules, issues and automation have their own lessons in this module.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 6.3 GitHub - Maintaining a Project | All: Creating a New Repository, Adding Collaborators, Managing Pull Requests (Email Notifications, Collaborating, Pull Request Refs, Pull Requests on Pull Requests), Mentions and Notifications, Special Files, Project Administration |
| GitHub Docs: "Creating a default community health file", "About community profiles for public repositories" | Which files count, and the three folders GitHub looks in |
| GitHub Docs: "Creating a pull request template for your repository", "About issue and pull request templates" | Template file names and folders; templates must be on the default branch; issue forms |
| GitHub Docs: "Inviting collaborators to a personal repository" | Settings, Collaborators, Add people; the invitation must be accepted |
| GitHub Docs: "Changing the default branch", "Transferring a repository" | Where the settings are; what a transfer moves; redirects and `git remote set-url` |
| GitHub Docs: "Checking out pull requests locally", "Licensing a repository" | `pull/<number>/head`; no license means no permission to reuse |
| GitHub CLI manual: `gh repo create`, `gh pr list`, `gh pr view`, `gh pr diff`, `gh pr checkout`, `gh pr merge`, `gh pr close`, `gh pr reopen` | Options and output (gh 2.104) |
| Git reference: `git-ls-remote`, `git-fetch` | Refspec on the command line, `FETCH_HEAD` |

## Pro Git 6.3, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Create a repository from the "New repository" button; only the name is required | Yes, with `gh repo create` as today's command-line way | Must know |
| The HTTPS and SSH addresses; prefer HTTPS for a public project | Yes, as a table | Must know |
| Collaborators get push (read and write) access; add and remove them in Settings | Yes, in words, with the invitation step from GitHub Docs | Must know |
| Pull requests come from a fork or from a branch in the same repository | Yes | Must know |
| Email notification of a new pull request: diffstat, link, command-line URLs | Yes, briefly | Must know; the URLs in Advanced |
| `git pull <url> patch-1`; the `.diff` and `.patch` URLs; `curl ... | git am` | Named, not practised | Advanced |
| Conversation on the pull request; replying by email | Conversation yes; reply by email no | See "Left out" |
| Merge locally, or press the Merge button; the button always makes a merge commit | Yes, with a compare block for today's three merge methods | Must know |
| Close a pull request instead; the author is notified | Yes, with `gh pr close --comment` and why a reason matters | Must know |
| Pull request refs: `git ls-remote`, `refs/pull/<n>/head` and `/merge` | Yes, with real output from the practice repository | Must know (the fetch), Under the hood (the refs) |
| They are not under `refs/heads/`, so clone and fetch skip them | Yes, with the `fetch` line of `.git/config` | Under the hood |
| `git fetch origin refs/pull/958/head` writes `FETCH_HEAD` | Yes, with a Try-it | Under the hood |
| Add `fetch = +refs/pull/*/head:refs/remotes/origin/pr/*` and fetch them all | Yes, with `git config --add` instead of editing the file | Advanced |
| `git checkout pr/2` | Yes, as `git switch --detach origin/pr/4` with a compare block | Advanced |
| The `merge` ref lets you test the merge before pressing the button | Yes | Under the hood, Advanced |
| Pull requests on pull requests; change the target with "Edit" | Yes, short, with `gh pr create --base` | Advanced |
| Mentions with `@`; they subscribe the person | Yes | Must know |
| What subscribes you; the Unsubscribe button | Yes | Must know |
| Notification settings: web and email | Yes, short | Must know |
| The notifications page: grouping, check mark, mute | Named as "the inbox" only | See "Left out" |
| Email headers (`Message-ID`, `List-ID`) for mail filters | Yes, short | Advanced |
| README: shown on the landing page; what teams put in it | Yes | Must know |
| CONTRIBUTING: shown when someone opens a pull request | Yes | Must know, easy challenge |
| Changing the default branch | Yes, in words | Advanced |
| Transferring a project; redirects for web and Git | Yes, in words | Advanced |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Opening a pull request, forks, GitHub Flow, Markdown in comments | The contributor's side | `github-flow-prs` |
| Line comments and reviews (approve, request changes) | Its own lesson | `code-review` |
| Squash and rebase merges in depth | Named in a compare block | `pr-merge-strategies` |
| Merging by hand, `git am`, patches by email | Named only | `integrating-work` (written) |
| The refspec syntax piece by piece | Linked | `refspecs` (written) |
| Replying to a notification by email; the inbox's check mark and mute buttons | Website details that change often; the idea (inbox, email, unsubscribe) is covered | None |
| Organizations, teams, permission levels beyond owner and collaborator | Not possible on a free personal account | `orgs-teams-permissions` |
| Protecting `main` from collaborators, CODEOWNERS | Its own lesson | `branch-protection-codeowners` |
| Issues, labels, security alerts | Its own lesson; an issue is defined in two lines here | `issues-projects-security` |
| `gh` in depth and the API | Its own lesson | `gh-cli-and-api` |
| Screens of the 2014 website (the "Options" tab, the right-hand Settings link) | The website moved; the lesson names today's places | None |

## Beyond the book

- `gh repo create` with `--public`, `--source`, `--remote`, `--push` (GitHub CLI manual). Explained, never run: the challenges build their own practice repository.
- `gh pr list`, `gh pr view`, `gh pr diff`, `gh pr checkout`, `gh pr merge --merge`, `gh pr close --comment`, `gh pr reopen`.
- `git fetch origin pull/<number>/head:<branch>`: the book fetches to `FETCH_HEAD` or changes the config; GitHub Docs teaches this one-line form.
- LICENSE, CODE_OF_CONDUCT, SECURITY, the `.github` folder, pull request and issue templates, issue forms (GitHub Docs, community health files).
- The invitation a collaborator must accept; `git remote set-url` after a transfer (GitHub Docs).
- "deny updating a hidden ref" when pushing to a pull request ref (real output).

## Things observed, not quoted from documentation

- `refs/pull/<n>/merge` was on the server while pull requests 4 and 5 were open, and gone after one was merged and the other closed. The lesson says exactly that and no more.
- Console blocks are real output from the practice repository (Git 2.55, gh 2.104). Three small edits: the account name is shown as `you`, the practice folder's path in the "refusing to fetch" message is shortened, and `gh` output is the terminal form (captured with `GH_FORCE_TTY`).

## Challenges and quiz

All three run on `gitremastered-practice-maintaining-github-repo`. The contributor's branches are in the same repository (a personal account cannot fork its own repository, assumption A4); the lesson says so where it shows.

- Easy, `welcome-contributors`: add `CONTRIBUTING.md` and `.github/pull_request_template.md`, commit, push.
- Medium, `test-a-pull-request`: one pull request waits. Find its number, fetch `pull/<number>/head` into `pr-review`, run the check, merge on GitHub, pull. The number is not fixed (the practice repository keeps counting across attempts), so the goal names the branch `pr-review`, not `pr-1`.
- Hard, `merge-one-close-one`: two pull requests, one of which fails `check.sh`. The brief does not say which. Merge the good one, close the other with a comment, pull. The first hint points to Under the hood (the pull request refs).
- The Try-its run in the medium challenge's starting state. They read (`gh pr list`, `gh pr view`, `gh pr diff`, `git ls-remote`), fetch into a branch `look` and delete it again, and fetch to `FETCH_HEAD`. None of them makes `pr-review`, merges or pulls, so the challenge keeps its work.
- A goal check cannot read a comment's text or prove that `check.sh` was run. The hard challenge checks that the right pull request was merged and the right one closed with a comment, which a student can only know by testing or reading both.
- Quiz: why a fork's branch is not fetched and how to get it; what fetching a pull request changes; how to turn a pull request down; templates and the default branch.
