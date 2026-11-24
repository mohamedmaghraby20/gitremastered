# Course map

Draft 2, 2026-11-24. Goal: a developer who finishes the course understands Git deeply and works with Git and GitHub professionally. Built from the outline of Pro Git 2nd edition (`book/progit2`, 452 headings), plus the official Git reference manual and GitHub Docs for topics the book does not cover.

## 0. How this map works

**Lessons and paths.** The course is a set of lessons, each with a stable ID. The site shows them in two orders:

- **Pro path**: ordered by what a working developer needs, from first commit to expert. Everything in sections 3.0 to 3.12 is on it.
- **Book path**: Pro Git's own chapter order (section 4).

Navigation is never locked. Each lesson lists what to read first, as advice.

**Three depth layers in every lesson.** Depth comes from layers, not from more lessons:

| Layer | Purpose | Length |
|---|---|---|
| Use it | The command and the everyday case | About 5 minutes |
| How it works | What Git does inside (objects, refs, index), shown in the visualizer | About 5 minutes |
| Pro | Important options, edge cases, failure modes and recovery, team conventions | As needed |

A learner can stop after "Use it" and come back for the rest. Revisiting a lesson means reading its recap card, or going straight to the layer they need.

**Sources.**

- `B` = Pro Git. `B 02/recording-changes#Ignoring Files` means `book/progit2/book/02-git-basics/sections/recording-changes.asc`, subsection "Ignoring Files".
- `D` = Git reference manual, git-scm.com/docs. For example, `D git-switch`.
- `G` = GitHub Docs, docs.github.com.

Pro Git is the backbone. A lesson sourced only from `D` or `G` is marked **beyond the book** on the site.

## 1. Graduation outcomes

At the end of the course a learner can do all of these. Each outcome is proven by at least one mission done without hints.

| # | The learner can… | Lessons | Proven in |
|---|---|---|---|
| O1 | Explain Git's model (snapshots, objects, refs, the three areas) and predict what any command will do to it | what-is-git, first-look-inside, three-areas, objects-deep, refs-deep | Module 11 checkpoint |
| O2 | Set up and configure Git for a team, per project if needed | setup, config-pro, git-in-your-tools | Module 9 checkpoint |
| O3 | Make clean, well-described, atomic commits | three-areas, partial-staging, commit-craft | Capstone 1 |
| O4 | Read and search history; find who changed what and which commit broke something | reading-history, diffs-in-depth, revision-selection, search-blame-bisect | Capstone 1 |
| O5 | Undo anything safely, before or after pushing, and pick the right tool (restore, amend, revert, reset) | undo-basics, fix-last-commit, revert-a-commit, reset-demystified | Module 2 checkpoint |
| O6 | Recover "lost" work and handle Git incidents calmly | rescue-lost-work, incident-playbook, remove-sensitive-data | Capstone 1 |
| O7 | Branch, merge and resolve any conflict, including hard ones | branches-are-pointers, branch-and-merge, advanced-merging | Capstone 2 |
| O8 | Rebase, squash and reshape history, and know when not to | rebasing, clean-up-history, force-push-safely | Capstone 2 |
| O9 | Sync with remotes and explain what fetch, pull and push actually transfer | remotes, remote-branches, how-git-talks, refspecs | Module 4 checkpoint |
| O10 | Choose and follow a team workflow and a PR merge strategy | team-workflows, pr-merge-strategies | Capstone 2 |
| O11 | Contribute through forks and pull requests, and review others' code | github-flow-prs, code-review, team-contributing, integrating-work | Capstone 3 |
| O12 | Run a GitHub repository: permissions, protection rules, CODEOWNERS, releases | maintaining-github-repo, orgs-teams-permissions, branch-protection-codeowners, tags-and-releases | Capstone 3 |
| O13 | Automate with hooks, GitHub Actions, the `gh` CLI and the API | hooks, github-actions-ci, gh-cli-and-api | Module 8 checkpoint |
| O14 | Secure the work: SSH keys, signed commits, secret removal, security alerts | github-account-ssh, signing, remove-sensitive-data, issues-projects-security | Module 7 checkpoint |
| O15 | Work in large or complex repos: worktrees, submodules, sparse and partial clones, LFS | worktrees, submodules, large-repos | Module 10 checkpoint |

## 2. Learning design rules

These keep the course easy to absorb, study, revisit and walk through.

1. One idea per screen. If a lesson needs two ideas, split it.
2. Every concept has a visual: the live visualizer, or a diagram from the book.
3. Every lesson ends with the same three things: a recap card (3 to 5 lines plus the key commands), one mission in the terminal, and 2 to 4 quiz questions.
4. Each module ends with a checkpoint mission done without hints.
5. Later missions reuse earlier commands on purpose, so old skills get practiced again.
6. Every lesson cites its book section with a link, so the learner can go back to the book.
7. Revisit tools: module cheat sheets, a searchable command index (from Appendix C), a glossary, and recap cards readable on their own.
8. Student-facing text gets the humanizer pass; mission steps stay numbered lists; key terms are bold where introduced.

## 3. Pro path

### 3.0 Orientation

| # | Lesson ID | Title | Sources | Read first |
|---|---|---|---|---|
| 1 | what-is-git | What Git is and why it works this way | B 01/about-version-control, 01/what-is-git, 01/history | none |
| 2 | setup | Install, configure and get help | B 01/installing, 01/first-time-setup, 01/help, 01/command-line | none |
| 3 | first-look-inside | A first look inside `.git`: objects and refs | B 10/plumbing-porcelain, 10/objects (intro), 10/refs (intro) | what-is-git |

### 3.1 Your daily loop

| # | Lesson ID | Title | Sources | Read first |
|---|---|---|---|---|
| 4 | start-a-repo | Start or clone a repository | B 02/getting-a-repository | setup |
| 5 | three-areas | Status, stage, commit: the three areas. **Pilot lesson.** | B 02/recording-changes | first-look-inside, start-a-repo |
| 6 | ignoring-files | Ignore files with .gitignore | B 02/recording-changes#Ignoring Files; D gitignore | three-areas |
| 7 | remove-move-files | Remove and rename tracked files | B 02/recording-changes#Removing Files, #Moving Files | three-areas |
| 8 | reading-history | Read the commit history | B 02/viewing-history | three-areas |
| 9 | diffs-in-depth | Read any diff: working, staged, between commits | B 02/recording-changes#Viewing Your Staged and Unstaged Changes; D git-diff | three-areas |

### 3.2 Undo and fix

| # | Lesson ID | Title | Sources | Read first |
|---|---|---|---|---|
| 10 | undo-basics | Unstage and discard changes | B 02/undoing | three-areas |
| 11 | fix-last-commit | Fix the last commit (amend) | B 02/undoing, 07/rewriting-history#Changing the Last Commit | undo-basics |
| 12 | revert-a-commit | Undo a pushed commit with revert | B 07/advanced-merging#Undoing Merges; D git-revert | fix-last-commit |
| 13 | reset-demystified | Reset demystified: the three trees | B 07/reset | undo-basics, reading-history |

### 3.3 Branching

| # | Lesson ID | Title | Sources | Read first |
|---|---|---|---|---|
| 14 | branches-are-pointers | Branches are just pointers | B 03/nutshell, 10/refs#The HEAD | reading-history |
| 15 | switch-and-detached-head | Switching branches and detached HEAD | B 07/reset#Check It Out; D git-switch | branches-are-pointers |
| 16 | branch-and-merge | Branch, merge, and fix conflicts | B 03/basic-branching-and-merging | switch-and-detached-head |
| 17 | branch-management | List, delete and rename branches | B 03/branch-management | branch-and-merge |
| 18 | stash-and-clean | Stash unfinished work, clean the folder | B 07/stashing-cleaning | branch-and-merge |

### 3.4 Remotes and GitHub basics

| # | Lesson ID | Title | Sources | Read first |
|---|---|---|---|---|
| 19 | github-account-ssh | GitHub account, SSH keys, credentials | B 04/generating-ssh-key, 06/1-setting-up-account, 07/credentials | setup |
| 20 | how-git-talks | How Git talks to servers: HTTPS, SSH, what gets transferred | B 04/protocols, 10/transfer-protocols | first-look-inside |
| 21 | remotes | Work with remotes: fetch, pull, push | B 02/remotes | start-a-repo, github-account-ssh |
| 22 | remote-branches | Remote and tracking branches | B 03/remote-branches | remotes, branch-and-merge |
| 23 | refspecs | Refspecs: how fetch and push map branches | B 10/refspec | remote-branches |
| 24 | tags-and-releases | Tags and GitHub releases | B 02/tagging; G releases | remotes |

### 3.5 Working in a team

| # | Lesson ID | Title | Sources | Read first |
|---|---|---|---|---|
| 25 | team-workflows | Team workflows: topic branches, trunk-based, Git Flow | B 03/workflows, 05/distributed-workflows | remote-branches |
| 26 | commit-craft | Commit messages and atomic commits (incl. Conventional Commits) | B 05/contributing#Commit Guidelines | three-areas |
| 27 | github-flow-prs | Forks, GitHub Flow and pull requests | B 06/2-contributing | remote-branches |
| 28 | code-review | Reviewing a pull request *(beyond the book)* | G pull request reviews | github-flow-prs |
| 29 | team-contributing | Contributing in real teams: small team, managed team, public fork | B 05/contributing (except email) | github-flow-prs |
| 30 | rebasing | Rebasing, and when not to | B 03/rebasing | remote-branches |
| 31 | pr-merge-strategies | Merge, squash or rebase-merge a PR *(beyond the book)* | G merge methods | rebasing, github-flow-prs |
| 32 | integrating-work | Bring in others' work: cherry-pick, topic branches, what a change introduces | B 05/maintaining (except email, build number, release prep) | team-contributing |

### 3.6 History mastery

| # | Lesson ID | Title | Sources | Read first |
|---|---|---|---|---|
| 33 | revision-selection | Point at any commit: HEAD~2, ranges, reflog names | B 07/revision-selection | branches-are-pointers |
| 34 | clean-up-history | Reword, squash, reorder, split; fixup and autosquash | B 07/rewriting-history; D git-rebase (--autosquash, --update-refs), git-range-diff | rebasing, revision-selection |
| 35 | partial-staging | Stage part of a file | B 07/interactive-staging | three-areas |
| 36 | search-blame-bisect | Search, blame and bisect (including `bisect run`) | B 07/searching, 07/debugging; D git-bisect | reading-history |
| 37 | advanced-merging | Hard conflicts, merge strategies, subtree merges, rerere | B 07/advanced-merging (incl. 07/subtree-merges), 07/rerere | branch-and-merge |
| 38 | force-push-safely | Force-pushing safely with `--force-with-lease` *(beyond the book)* | D git-push | clean-up-history |

### 3.7 Recovery and incidents

| # | Lesson ID | Title | Sources | Read first |
|---|---|---|---|---|
| 39 | rescue-lost-work | Recover lost commits with reflog and fsck | B 10/maintenance#Data Recovery | revision-selection |
| 40 | incident-playbook | Incident playbook: wrong branch, botched rebase, force-push accident, broken merge | B 07/reset, 07/advanced-merging#Undoing Merges; D git-reflog | rescue-lost-work |
| 41 | remove-sensitive-data | Remove a leaked secret or huge file from history | B 07/rewriting-history#The Nuclear Option: filter-branch, 10/maintenance#Removing Objects; G removing sensitive data | rescue-lost-work |

### 3.8 Professional GitHub

| # | Lesson ID | Title | Sources | Read first |
|---|---|---|---|---|
| 42 | maintaining-github-repo | Run a repository: collaborators, managing PRs, README, CONTRIBUTING | B 06/3-maintaining | github-flow-prs |
| 43 | orgs-teams-permissions | Organizations, teams and permissions | B 06/4-managing-organization; G organizations | maintaining-github-repo |
| 44 | branch-protection-codeowners | Branch protection, rulesets and CODEOWNERS *(beyond the book)* | G rulesets, CODEOWNERS | maintaining-github-repo |
| 45 | github-actions-ci | CI with GitHub Actions *(beyond the book)* | G Actions | github-flow-prs |
| 46 | gh-cli-and-api | The `gh` CLI, the API and webhooks | B 06/5-scripting; G GitHub CLI | maintaining-github-repo |
| 47 | issues-projects-security | Issues, projects, Dependabot and secret scanning *(beyond the book)* | G issues, projects, code security | maintaining-github-repo |

### 3.9 Make Git yours

| # | Lesson ID | Title | Sources | Read first |
|---|---|---|---|---|
| 48 | config-pro | Configuration in depth: scopes, conditional config, aliases, diff/merge tools | B 08/config, 02/aliases; D git-config (includeIf) | setup |
| 49 | git-in-your-tools | Git in VS Code, terminals and GUIs | B A/guis, A/visualstudiocode, A/visualstudio, A/jetbrainsides, A/sublimetext, A/bash, A/zsh, A/powershell | setup |
| 50 | hooks | Hooks and enforced policies | B 08/hooks, 08/policy | three-areas |
| 51 | attributes | Attributes: binary files, line endings, merge drivers | B 08/attributes | config-pro |
| 52 | signing | Sign commits and tags (GPG and SSH) | B 07/signing; G commit signature verification | tags-and-releases |

### 3.10 Large repos and modern Git

| # | Lesson ID | Title | Sources | Read first |
|---|---|---|---|---|
| 53 | worktrees | Several branches checked out at once *(beyond the book)* | D git-worktree | branch-and-merge |
| 54 | submodules | Submodules | B 07/submodules | remotes |
| 55 | large-repos | Shallow and partial clone, sparse checkout, LFS, bundles, `git maintenance` | B 07/bundling; D git-clone, git-sparse-checkout, git-maintenance; G Git LFS | remotes |

### 3.11 Under the hood

| # | Lesson ID | Title | Sources | Read first |
|---|---|---|---|---|
| 56 | objects-deep | Blobs, trees, commits and how they are stored | B 10/objects | first-look-inside |
| 57 | refs-deep | References, HEAD, tags and remotes on disk | B 10/refs | objects-deep |
| 58 | packfiles-gc | Packfiles and garbage collection | B 10/packfiles, 10/maintenance#Maintenance | objects-deep |
| 59 | plumbing-toolkit | Environment variables and `git replace` | B 10/environment, 07/replace | refs-deep |

### 3.12 Capstones

Multi-step scenarios with simulated teammates. No hints by default.

| # | Lesson ID | Scenario | Proves |
|---|---|---|---|
| 60 | capstone-solo-rescue | Rescue a messy repository: lost commits, a broken history, a secret committed by mistake | O3, O4, O6 |
| 61 | capstone-team-release | A team sprint: parallel branches, conflicts, rebase before review, release tag | O7, O8, O10 |
| 62 | capstone-open-source | Contribute to an "open-source project": fork, PR, review feedback, keep the fork in sync, maintain a repo | O11, O12 |

**Total: 62 lessons in 13 modules (59 lessons plus 3 capstones).**

## 4. Book path

Pro Git order. Every section maps to a lesson above or to the reference list (section 5).

| Book section | Lesson |
|---|---|
| **1 Getting Started** | |
| 1.1 About Version Control, 1.2 Short History, 1.3 What is Git | what-is-git |
| 1.4 Command Line, 1.5 Installing, 1.6 First-Time Setup, 1.7 Help | setup |
| **2 Git Basics** | |
| 2.1 Getting a Repository | start-a-repo |
| 2.2 Recording Changes | three-areas, ignoring-files, remove-move-files, diffs-in-depth |
| 2.3 Viewing History | reading-history |
| 2.4 Undoing Things | undo-basics, fix-last-commit |
| 2.5 Working with Remotes | remotes |
| 2.6 Tagging | tags-and-releases |
| 2.7 Aliases | config-pro |
| **3 Git Branching** | |
| 3.1 Nutshell | branches-are-pointers |
| 3.2 Basic Branching and Merging | branch-and-merge |
| 3.3 Branch Management | branch-management |
| 3.4 Branching Workflows | team-workflows |
| 3.5 Remote Branches | remote-branches |
| 3.6 Rebasing | rebasing |
| **4 Git on the Server** | |
| 4.1 The Protocols | how-git-talks |
| 4.3 Generating Your SSH Public Key | github-account-ssh |
| 4.2, 4.4 to 4.9 | Reference |
| **5 Distributed Git** | |
| 5.1 Distributed Workflows | team-workflows |
| 5.2 Contributing to a Project | commit-craft, team-contributing (email part: Reference) |
| 5.3 Maintaining a Project | integrating-work (email, build number, release prep: Reference) |
| **6 GitHub** | |
| 6.1 Account Setup | github-account-ssh |
| 6.2 Contributing | github-flow-prs |
| 6.3 Maintaining | maintaining-github-repo |
| 6.4 Organizations | orgs-teams-permissions |
| 6.5 Scripting GitHub | gh-cli-and-api |
| **7 Git Tools** | |
| 7.1 Revision Selection | revision-selection |
| 7.2 Interactive Staging | partial-staging |
| 7.3 Stashing and Cleaning | stash-and-clean |
| 7.4 Signing | signing |
| 7.5 Searching, 7.10 Debugging | search-blame-bisect |
| 7.6 Rewriting History | fix-last-commit, clean-up-history, remove-sensitive-data |
| 7.7 Reset Demystified | reset-demystified, switch-and-detached-head |
| 7.8 Advanced Merging, 7.9 Rerere | advanced-merging, revert-a-commit |
| 7.11 Submodules | submodules |
| 7.12 Bundling | large-repos |
| 7.13 Replace | plumbing-toolkit |
| 7.14 Credential Storage | github-account-ssh |
| **8 Customizing Git** | |
| 8.1 Configuration | config-pro |
| 8.2 Attributes | attributes |
| 8.3 Hooks, 8.4 Example Policy | hooks |
| **9 Git and Other Systems** | Reference |
| **10 Git Internals** | |
| 10.1 Plumbing and Porcelain | first-look-inside |
| 10.2 Objects | first-look-inside, objects-deep |
| 10.3 References | first-look-inside, refs-deep |
| 10.4 Packfiles | packfiles-gc |
| 10.5 Refspec | refspecs |
| 10.6 Transfer Protocols | how-git-talks |
| 10.7 Maintenance and Data Recovery | packfiles-gc, rescue-lost-work, remove-sensitive-data |
| 10.8 Environment Variables | plumbing-toolkit |
| **Appendix A** Git in Other Environments | git-in-your-tools |
| **Appendix B** Embedding Git | Reference |
| **Appendix C** Git Commands | Command index |

## 5. Reference only

Short summary pages with a link to the book, in the book path and in search. No missions.

- Ch4: bare repo on a server, setting up a server, Git daemon, Smart HTTP, GitWeb, GitLab, third-party hosting
- Ch5: contributing and applying patches over email, build numbers, preparing a release, shortlog
- Ch9: Git with Subversion, Mercurial and Perforce, and importers
- Appendix B: libgit2, JGit, go-git, Dulwich
- Appendix C: becomes the searchable command index

## 6. Verification plan

How we confirm the course works before and after each release:

1. **Coverage check (automatic).** Every book section maps to a lesson or to section 5. Every outcome in section 1 has at least one lesson and one no-hint mission. Run after every map change.
2. **Pilot test.** The user takes `three-areas` as a student before any other lesson is built. Check: time per layer, where they got stuck, and whether they can do the mission without hints the next day. Fix the lesson format, then build the rest.
3. **Lesson quality check, every lesson:** follows the section 2 rules; facts checked against the cited book section or official doc; humanizer pass on student-facing text.
4. **Module checkpoints.** Each module ends with a no-hint mission. Failing it points to the lesson that needs work.
5. **Capstones as graduation proof.** Passing all three covers outcomes O1 to O15 together, not one at a time.
6. **After each module release,** review where learners got stuck (from hint usage, if we track it) and fix those lessons first.

## 7. Decisions

1. Module order stays as listed: History mastery (3.6) comes before Professional GitHub (3.8), because history skills are pure Git and are needed for good pull requests.
2. Checkpoint missions are optional. A learner can skip any checkpoint, and it stays available for anyone who wants to test themselves.
