# Coverage: team-workflows

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** how teams agree to use branches and repositories: topic and long-running branches, the three distributed workflows of Pro Git 5.1, and the three branching models most teams name today (trunk-based development, GitHub Flow, Git Flow), with how to choose. All practice is local: no remote is needed to learn where a branch starts and where it is merged.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 3.4 Branching Workflows | Long-Running Branches, Topic Branches (all of it) |
| Pro Git 5.1 Distributed Workflows | Intro, Centralized Workflow, Integration-Manager Workflow, Dictator and Lieutenants Workflow, the note on Martin Fowler's guide, Workflows Summary |
| Git reference: `git-merge`, `git-branch`, `git-log`, `git-merge-base`, `git-switch` | `--no-ff`, `-d` and its "not fully merged" check, `--merged <branch>`, the `A..B` range, `merge-base`, `switch -c <name> <start>` |

## Pro Git 3.4, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Three-way merge makes repeated merges between the same branches easy | Yes, with `git merge-base` before and after a release | Under the hood |
| Only stable code on `master`; a parallel `develop` or `next` that is merged into it when stable | Yes (`main`, with the book's `master` named once) | Must know |
| `develop` pulls in topic branches when they are ready | Yes, with a Try-it | Must know |
| "Pointers moving up the line of commits"; stable branches further back, newest work further ahead (linear view) | Yes, as the correction of the common wrong idea "two copies" | Must know, Under the hood |
| The "silo" view: commits graduate to a more stable silo | Yes, in two sentences | Must know |
| More levels: `proposed` / `pu` | Yes | Must know |
| Several long-running branches are not necessary, but help in large projects | Yes | Must know |
| A topic branch is short-lived, for one feature or related work; useful in projects of any size | Yes, with a definition | Must know |
| Creating, merging and deleting branches several times a day is normal in Git | Yes | Must know |
| `iss53` and `hotfix` from 3.2 were topic branches | Yes | Must know |
| Context switching; easier code review; merge in any order, after minutes or months | Yes, as three bullets | Must know |
| The `iss91` / `iss91v2` / `dumbidea` example, before and after | Yes, as two `graph` blocks (fewer commits than the book's figure) | Must know |
| Pointer to chapter 5 before choosing a scheme | Covered by the lesson itself, which joins 3.4 and 5.1 | Must know |
| All of this is local; no communication with the server | Yes | Under the hood |

## Pro Git 5.1, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Every developer can be both a node and a hub, so many workflows are possible | Yes ("every clone is a full repository") | Must know |
| Use one workflow or mix features of several | Yes | Must know |
| Centralized: one hub, everyone has push access | Yes | Must know |
| The second developer must merge before pushing; Git rejects non-fast-forward pushes (John and Jessica) | Yes, with the real rejected push | Must know (workflow part and "When it goes wrong") |
| Centralized is not limited to small teams | Yes | Must know |
| Integration-manager: own public clone, request to the maintainer, maintainer adds a remote, merges and pushes (six steps) | Yes, as three steps | Must know |
| Common with GitHub and GitLab forks; each party works at their own pace | Yes | Must know |
| Dictator and lieutenants: lieutenants, benevolent dictator, reference repository, the Linux kernel | Yes | Must know |
| Not common; useful in very big or hierarchical projects; lets the leader delegate | Yes | Must know |
| Note: Fowler's "Patterns for Managing Source Code Branches" | Yes, named in plain text (the app only opens git-scm.com and docs.github.com) | Advanced |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| In the dictator workflow, developers rebase their topic branch on `master` | Rebase is not taught yet | `rebasing` |
| "The contributor sends the maintainer an email" | Email patches are reference-only in the course map; the lesson says "asks the maintainer" | Reference pages; `github-flow-prs` for the pull request |
| Forking, opening and updating a pull request | Its own lesson | `github-flow-prs` |
| Step-by-step contributing in a small team, a managed team and a public fork (5.2) | Its own lesson | `team-contributing` |
| What a maintainer does with incoming work (5.3) | Its own lesson | `integrating-work` |
| Moving a commit that was made on the wrong branch | Needs cherry-pick or rebase; the lesson shows how to detect it and redo a small fix | `integrating-work`, `rebasing` |
| Squash and rebase merges of a pull request | Its own lesson | `pr-merge-strategies` |
| Enforcing the rules on the server | Its own lesson | `branch-protection-codeowners` |

## Beyond the book

Pro Git teaches the building blocks and the three repository arrangements, and names no branching model. These parts come from outside it:

- **Trunk-based development** and **feature flags**: described in Martin Fowler's guide that Pro Git 5.1 points to.
- **GitHub Flow**, in outline: GitHub Docs, "GitHub flow". Taught in full in `github-flow-prs`.
- **Git Flow**: Vincent Driessen, "A successful Git branching model" (2010), including the branch table, `--no-ff` for feature, release and hotfix merges, and the author's 2020 note that teams delivering continuously should consider a simpler model.
- The "How to choose" table is the course's own summary of the above.
- `git merge --no-ff` for a visible release commit (Git reference, `git-merge`; first met in the Advanced layer of `branch-and-merge`).
- `git log main..develop` to see what a merge would bring in, and the "not fully merged" refusal when deleting from the wrong branch (Git reference, `git-log`, `git-branch`).

## Notes on the terminal output

All `console` blocks are real output from Git 2.55 in scratch copies of the challenges' starting states: the easy challenge (also the practice project the Try-its run in) for Must know and Under the hood, and the hard challenge for "A hotfix, step by step". Three edits: the `hint: Disable this message…` line is trimmed from the "not fully merged" output; the `hint:` lines are trimmed from the rejected push; and the block that shows the life of a topic branch has a placeholder line for the edits and prints no output. The rejected push was produced with a bare repository beside the project, as in the `remotes` lesson.

## Challenges and quiz

- Easy, `finish-the-search`: merge a finished topic branch into `develop` and delete it, leaving `main` alone. The student starts on `main`, so the skill is choosing the receiver. This is also the starting state for the Try-its, which use their own branch (`try-labels`) and never touch `add-search`.
- Medium, `release-day`: finish one topic branch, leave an unfinished one out, release `develop` into `main` with `--no-ff`, and tag the release (reuses `tags-and-releases`).
- Hard, `urgent-hotfix`: a hotfix branch from `main` while standing on `develop`, merged into both long-running branches (Advanced: "A hotfix, step by step"). Goals check that `main`'s tip is the merge of `hotfix` and that `develop`'s unfinished commit did not reach `main`, so branching from the wrong place or merging `develop` into `main` fails.
- All three are local, as the brief asks.
- Quiz: where a topic branch goes; where a hotfix starts and ends; choosing a model for a team; which distributed workflow fits a contributor without push access.
