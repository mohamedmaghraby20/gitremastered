# Coverage: team-contributing

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** the contributor's routine in the book's three cases: private small team, private managed team, forked public project, plus keeping a fork in sync. Commit guidelines belong to `commit-craft`; the maintainer's side belongs to `integrating-work`; pull requests on GitHub belong to `github-flow-prs`.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 5.2 Contributing to a Project | Intro (the variables), Private Small Team, Private Managed Team, Forked Public Project, Summary |
| Git reference: `git-request-pull`, `git-push`, `git-merge`, `git-branch` | `request-pull <start> <url> [<end>]`, `push --force-with-lease`, `merge --squash` / `--no-commit`, `branch -u` |
| GitHub Docs: "Syncing a fork", "Configuring a remote repository for a fork" | The `origin` / `upstream` names, the "Sync fork" button |
| GitHub CLI manual: `gh repo sync`, `gh repo fork`, `gh repo set-default` | Named, one line each |

## Pro Git 5.2, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| No single way to contribute; the variables (contributor count, workflow, commit access) | Yes, reduced to one question: where may you push? | Must know (intro table) |
| Commit Guidelines (`git diff --check`, one change per commit, message format) | No | See "Left out" |
| Small team: everyone has push access; a centralized-style workflow | Yes | Must know (Setup 1) |
| Merges happen on the client, not on the server; the push is rejected even when different files changed | Yes, in words, a predict block, a Try-it step and a quiz question | Must know |
| Reading the push line `<oldref>..<newref> fromref -> toref` | Yes | Must know |
| John: rejected push, `git fetch origin`, `git merge origin/master`, push | Yes, as the Try-it | Must know |
| Jessica: topic branch `issue54`, fetch, `git log --no-merges issue54..origin/master` | Yes, as `try-salad..origin/main`, both parts explained | Must know |
| Merge the topic branch and `origin/master`; the order does not matter | Yes | Must know |
| The general sequence for the small team | Yes, as the four numbered steps | Must know |
| Managed team: feature branches, only integrators update `master` | Yes | Must know (Setup 2) |
| `git push -u origin featureA` to share a branch | Yes, with real output and a Try-it | Must know |
| Start the next feature from `origin/master` (`git checkout -b featureB origin/master`) | Yes, with `git switch -c` | Must know |
| Merge a teammate's branch (`origin/featureBee`), push with a refspec `featureB:featureBee` | Yes, short; refspecs linked | Must know |
| `-u` is `--set-upstream` | Yes, by link to `remote-branches` | Must know |
| `git log featureA..origin/featureA` to read a teammate's additions, then merge | Yes | Must know |
| Tell the integrators; after they merge, a fetch brings the merge commit down | Yes; today's form (a pull request) named | Must know |
| Forked public project: no push access, fork, push the topic branch to the fork | Yes | Must know (Setup 3) |
| Clone the project, add the fork as `myfork` | Yes, as today's `origin` (fork) and `upstream` (project), with the book's naming noted | Must know |
| Push the topic branch, not `master`: rejected or cherry-picked work costs nothing | Yes | Must know |
| The note on `rebase -i` to tidy the branch first | Pointer only | `clean-up-history` |
| Pull request: on the site, or `git request-pull` and an email | Yes, with real output read line by line | Under the hood |
| Keep `master` tracking the project's `master`; work in topic branches | Yes: the rule in Must know, `git branch -u upstream/main` in Under the hood | Must know, Under the hood |
| Start a second topic from the project's `master`, not from the first topic | Yes, plus a quiz question | Must know |
| Rebase a topic on `origin/master` when it no longer merges; `git push -f` | Yes, with `--force-with-lease`; the hard challenge | Must know (table), Advanced |
| Alternative: push to a new branch name (`featureAv2`) | Yes | Advanced |
| `featureBv2` with `git merge --squash`; `--no-commit` | Yes, with real output | Advanced |
| Public Project over Email (`format-patch`, `imap-send`, `send-email`) | Named only | See "Left out" |
| Summary | Yes, as the recap | Recap |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Commit Guidelines: whitespace check, logically separate commits, the message template | Its own lesson | `commit-craft` |
| Public Project over Email: `git format-patch`, the patch file format, `git imap-send`, `git send-email`, the `[imap]` and `[sendemail]` settings | Reference only (course map, section 5.2): few students ever send a patch by email. One paragraph in Advanced names the commands and when they are needed | Reference; the maintainer's side (`git apply`, `git am`) is reference in `integrating-work` too |
| Opening, reviewing and merging a pull request on GitHub | Its own lessons | `github-flow-prs`, `code-review`, `pr-merge-strategies` |
| How a rebase works, conflicts during a rebase | Its own lesson | `rebasing` |
| `--force-with-lease` in depth | Two sentences and a careful block here | `force-push-safely` |
| Commit ranges in depth (three dots, `^`, `--not`) | Linked | `revision-selection` |
| The integrator's side of the managed team (merging topic branches, cherry-pick) | Its own lesson | `integrating-work` |
| The book's figures of John's and Jessica's histories | Redrawn as two `graph` blocks for the cookbook; the later figures repeat the same shape | n/a |

## Beyond the book

- The names `origin` (fork) and `upstream` (project), and the three-step fork sync (`git fetch upstream`, `git merge upstream/main`, `git push origin main`): GitHub Docs. The book adds the fork as `myfork` and never syncs the fork's `master`.
- `gh repo sync`, the "Sync fork" button, `gh repo fork --clone`, `gh repo set-default`: named only.
- The two meanings of "upstream" (upstream branch, `upstream` remote).
- `--force-with-lease` in place of the book's `-f` (Git reference, `git-push`).
- "When it goes wrong": the real messages for a missing or duplicate `upstream` remote. The permission (403) message is described in words, not shown: it cannot be produced with one account.

## Challenges and quiz

All three run on the student's own GitHub account, in `gitremastered-practice-team-contributing` and (easy, hard) `gitremastered-practice-team-contributing-upstream`. A free account cannot fork its own repository (assumption A4), so the "fork" is two unlinked repositories and the lesson says so in a sidenote.

- Easy, `sync-your-fork`: add the `upstream` remote, fetch, merge `upstream/main`, push to `origin`. The student works out the address from `git remote get-url origin` (the name plus `-upstream`).
- Medium, `small-team-push`: the book's Jessica case. A finished topic branch and a teammate's two pushed commits; fetch, merge both into `main`, push. Only `origin` is used.
- Hard, `rebase-and-open-pr`: a topic branch already pushed to `upstream`, whose `main` then moved; rebase on `upstream/main`, force-push with lease (Advanced), open a pull request on `upstream`. The branch is pushed to `upstream` itself, as a collaborator would: a cross-repository pull request needs a real fork, and the brief says so.
- The Try-its run in the easy challenge's starting state. They push `try-` branches and one merge to `origin` only, never touch `upstream`, and stop before adding the `upstream` remote. The easy challenge still works afterwards (the merge of `upstream/main` then makes a merge commit instead of a fast-forward), and starting the challenge rebuilds both repositories anyway.
- Quiz: why a push is rejected when different files changed; reading `A..B`; where a new contribution starts; the push after a rebase.
