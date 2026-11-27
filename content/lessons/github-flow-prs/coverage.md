# Coverage: github-flow-prs

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** one full round of GitHub Flow from the contributor's side: topic branch, push, pull request (terminal and website), reading the page, updating it, drafts, linking an issue, keeping the branch up to date with `main`, merging, deleting the branch. Forks are explained in words (assumption A4: a free account cannot fork its own repository); "Contributing in real teams" practises them with two repositories. The reviewer's side is "Reviewing a pull request"; the merge methods are "Merge, squash or rebase-merge a PR".

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 6.2 Contributing to a Project | Forking Projects, The GitHub Flow, Creating a Pull Request, Iterating on a Pull Request, Not Only Forks, Pull Requests as Patches, Keeping up with Upstream, References, GitHub Flavored Markdown, Keep your GitHub public repository up-to-date |
| GitHub Docs: "GitHub flow" | The steps of the flow, including deleting the branch |
| GitHub Docs: "About pull requests", "Creating a pull request", "Changing the stage of a pull request" | Base and compare (head) branches, the tabs, draft pull requests |
| GitHub Docs: "Linking a pull request to an issue" | Closing keywords, default-branch rule |
| GitHub Docs: "Merging a pull request", "Deleting and restoring branches in a pull request", "Keeping your pull request in sync with the base branch", "Syncing a fork" | Merge box, Delete branch, Update branch, Sync fork |
| GitHub CLI manual (`gh pr create`, `list`, `view`, `status`, `diff`, `checkout`, `ready`, `merge`, `close`, `comment`, `update-branch`; `gh repo sync`) | Commands and options; all output captured from gh 2.104 |

## Pro Git 6.2, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Fork: a copy in your namespace you can push to; no push access needed on the original | Yes, in words with the book's `blink` example and a team/fork table | Must know |
| The historical, negative meaning of "fork" | No | Left out, see below |
| The Fork button | Yes | Must know |
| The GitHub Flow steps (fork, topic branch, commit, push, open PR, discuss, merge, sync) | Yes, as a seven-step list with "delete the branch" from GitHub Docs | Must know |
| "This is the Integration Manager workflow with web tools" | Not repeated | "Team workflows" already makes the link |
| The GitHub CLI tip | Yes; `gh` is used throughout | Must know |
| Clone the fork, topic branch, change, commit, push | Yes, on one repository (`try-footer`) | Must know, Try-it |
| `git diff --word-diff` to check the change | No | "Diffs in depth" |
| The green "Compare & pull request" button; the Branches page | Button yes; Branches page no | Must know |
| Title and description deserve effort | Yes | Must know |
| The form lists the commits ahead of the base and a unified diff | Yes | Must know |
| Pull requests opened early, at the start of the work | Yes, as draft pull requests | Must know |
| Owner comments on a line or in general; notifications and emails | Line comments named in the tabs table; email not | Must know; reviewing itself in "Reviewing a pull request" |
| Commit again and push: the pull request updates | Yes, with a Try-it and a quiz question | Must know |
| A push does not notify; leave a comment | Yes, careful block | Must know |
| Outdated line comments collapse | No | "Reviewing a pull request" |
| Files changed is `git diff master...<branch>` | Yes | Under the hood |
| The merge button; needs write access and a clean merge; always a non-fast-forward merge | Yes | Must know (merge), Under the hood (no fast-forward) |
| Merging locally and pushing closes the pull request | Yes | Under the hood |
| Not only forks: a pull request between two branches of one repository | Yes | Must know |
| Pull requests as conversations, not perfect patch series; add commits, do not re-roll | Yes | Must know ("Update a pull request") |
| The merge commit references the pull request | Yes, with real `git log --graph` output | Under the hood |
| Keeping up with upstream: merge the target branch into the topic branch; merge preferred over rebase | Yes, with `origin/main`; a graph, a Try-it, the hard challenge | Must know |
| `git remote add upstream`, `git fetch upstream`, `git merge upstream/master` | Yes, as a table | Advanced |
| Rebase: do not force-push over an open pull request; open a new one that references the old | Yes | Advanced |
| References: `#num`, `user#num`, `user/repo#num`, full SHA-1; trackback in the timeline | `#num` in Must know; the rest in Advanced | Must know, Advanced |
| GitHub Flavored Markdown: task lists, code snippets, quoting | Yes, one table | Must know |
| Task-list progress in the pull request list, `r` to quote, emoji, drag-and-drop images | Yes, briefly | Advanced |
| Keep your fork up to date: pull from the original's address, or a remote with `--set-upstream-to` and `remote.pushDefault`; never commit on `master` | The `upstream` remote way, and the warning; the book's two ways in a compare block | Advanced |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| The older, negative meaning of "fork" | History, no skill | Not taught |
| Email notifications and their settings | Account settings, outside this lesson | "Run a repository: collaborators, managing PRs, README, CONTRIBUTING" |
| Reviewing: line comments, approve, request changes | The reviewer's side is its own lesson | "Reviewing a pull request" |
| Squash and rebase merge | Needs rebasing first | "Merge, squash or rebase-merge a PR" |
| Practising a real fork | A free account cannot fork its own repository (A4) | "Contributing in real teams" (two repositories, `origin` and `upstream`) |
| Creating and managing issues | Only the link from a pull request belongs here | "Issues, projects, Dependabot and secret scanning" |
| Automatic checks on a pull request | Needs Actions | "CI with GitHub Actions" |
| `remote.pushDefault` | Rarely needed once `origin` and `upstream` are separate remotes | "Configuration in depth" covers settings |

## Beyond the book

- `gh pr create` / `list` / `status` / `view` / `diff` / `checkout` / `ready` / `merge` / `close` / `comment` / `update-branch` and `gh repo sync`: the book only points at the GitHub CLI.
- Draft pull requests, "Ready for review" and "Convert to draft" (GitHub Docs).
- Closing keywords (`Fixes #2`) and the default-branch rule (GitHub Docs). The book covers `#num` references only.
- Deleting the branch after the merge as a step of the flow (GitHub Docs: GitHub flow), and the stale `origin/<branch>` record that `gh pr merge --delete-branch` leaves until `git fetch --prune`.
- `refs/pull/<n>/head` and `refs/pull/<n>/merge`, from real `git ls-remote` output.
- "Update branch", "Sync fork" and "Allow edits from maintainers".
- The four real error messages in "When it goes wrong", from gh 2.104.

## Under the hood

- A pull request is a record on GitHub, not a Git object; GitHub keeps `refs/pull/<n>/head` for each one.
- Commits tab = `git log main..branch`; Files changed tab = `git diff main...branch` (against the merge base).
- The merge button always makes a merge commit that names the pull request; a merge pushed from a computer also marks the pull request merged.
- After `--delete-branch`, the remote-tracking branch stays until `git fetch --prune`.

## Challenges and quiz

All three run on the student's practice repository `gitremastered-practice-github-flow-prs`.

- Easy, `open-your-first-pr`: `add-hours` is local only. Push it and open a pull request; do not merge. Its starting state is also where the Try-its run: a teammate clone in `../teammate` holds an unpushed commit "Add scone to menu", which one Try-it pushes so that `main` moves on GitHub.
- Medium, `fix-after-review`: the teammate steps open the pull request "Add contact page" and comment on a typo. Fix it on the same branch, push, merge, and pull `main`.
- Hard, `update-merge-clean-up`: the pull request is behind `main` (a teammate pushed after the last fetch). Fetch, merge `origin/main` into the branch, push, merge the pull request, delete the branch on GitHub and locally, and prune the stale `origin/add-hours` (the Under the hood detail).
- Try-its use the student's own branch `try-footer` and file `footer.txt`, so they never touch `add-hours`. They do merge `try-footer` into the practice repository's `main`; starting a challenge resets the repository.
- Quiz: updating a pull request after review; why local `main` lacks a merge made on GitHub; proposing a change without push access (fork); a pull request with conflicts (merge `origin/main` in, not force-push).
