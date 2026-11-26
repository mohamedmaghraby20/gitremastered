# Coverage: integrating-work

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** the maintainer's side of teamwork: try contributed work in a topic branch, find out exactly what it would introduce, then bring it in by merge, rebase, cherry-pick or squash. `git cherry-pick` is the command taught in full.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 5.3 Maintaining a Project | Working in Topic Branches, Checking Out Remote Branches, Determining What Is Introduced, Integrating Contributed Work (Merging Workflows, Large-Merging Workflows, Rebasing and Cherry-Picking Workflows, Rerere) |
| Git reference: `git-cherry-pick`, `git-log`, `git-diff`, `git-merge-base`, `git-merge`, `git-cherry`, `git-pull` | `--continue`, `--abort`, `--skip`, `-x`, `-n`, `-m`, commit ranges, `--no-edit`; `--no-merges`; `A...B` in diff; `merge --squash`; `cherry -v` |

## Pro Git 5.3, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Try new work in a topic branch; easy to leave and come back to | Yes | Must know |
| Name the branch after the theme; namespace it with the contributor's initials (`sc/ruby_client`) | Yes, as `nk/signup` | Must know |
| `git branch sc/ruby_client master`, `git checkout -b sc/ruby_client master` | Yes, as `git switch -c nk/signup main` with a compare block | Must know |
| Applying patches from email: `git apply`, `git apply --check`, `git am`, `am --resolved`, `am -3`, `am -i` | No | Left out (reference) |
| Checking out remote branches: `git remote add`, `git fetch`, a local branch from `jessica/ruby-client` | Yes, as three commands, with a link to `remote-branches` where they are taught | Must know |
| Remotes suit people you work with often; with history you get a proper three-way merge | In one line (remote or pull request); the three-way merge is in Under the hood | Must know, Under the hood |
| One-time `git pull <url>` without saving a remote; `FETCH_HEAD` | Yes, with real output from a folder address | Advanced |
| Review the commits in the branch that are not in `master`: `git log contrib --not master`, same as `master..contrib` | Yes; `main..signup` first, `--not` as the older spelling | Must know |
| `git log -p` shows the diff of each commit | Yes, in the options table | Must know |
| `git diff master` is misleading once `master` has moved: it looks as if the topic removes `master`'s new lines | Yes: a predict block, real output, a Try-it | Must know |
| Compare with the common ancestor: `git merge-base contrib master`, then `git diff <id>`; `git diff $(git merge-base …)` | Yes | Under the hood |
| Triple-dot shorthand: `git diff master...contrib` | Yes, with a two-dots/three-dots table and a careful block | Must know |
| Merging workflow: merge finished topics into `master`, delete, repeat | Yes | Must know |
| Two-phase cycle: `master` and `develop`; fast-forward `master` at a release; an optional `integrate` branch | Yes, in one paragraph (`integrate` left out) | Must know |
| Large-merging workflow of the Git project: `master`, `next`, `seen` (was `pu`), `maint`; topics graduate; `next`/`seen` rebuilt | Yes, as a table | Advanced |
| Rebasing workflow: rebase the topic onto `master`, then fast-forward, for a linear history | Yes: what rebasing means and what the history looks like; the command is left to the Rebasing lesson | Must know |
| Cherry-pick is "like a rebase for a single commit"; reapplies the patch of one commit | Yes, explained twice (two diagrams, a Try-it) | Must know |
| Use it when you want one of several commits on a topic branch | Yes (the lede, the easy challenge) | Must know |
| `git cherry-pick e43a6`; the new commit has a new SHA-1 because the date applied is different | Yes; the reason is given in full (parent, committer, date) | Must know, Under the hood |
| Afterwards, remove the topic branch and drop the commits you did not want | Mentioned for squash merges (`-D`); branch deletion is taught in `branch-management` | Must know |
| Rerere: "reuse recorded resolution", `rerere.enabled`, the `git rerere` command | Named, with what it does and the setting; pointed to the Hard conflicts lesson | Advanced |
| Tagging your releases, sharing a PGP key as a blob | No | Left out (reference; `tags-and-releases`, `signing`) |
| Generating a build number: `git describe` | No | Left out (reference) |
| Preparing a release: `git archive` | No | Left out (reference) |
| The shortlog: `git shortlog` | No | Left out (reference) |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Patches over email: `git apply`, `git am`, `format-patch`, mbox files | The course map lists the email workflow as reference material, with no mission | Reference page for chapter 5 (course map, section 5) |
| Build numbers with `git describe` | Reference material | Reference page for chapter 5 |
| Preparing a release with `git archive`; `git shortlog` | Reference material | Reference page for chapter 5 |
| Tagging releases, signed tags, publishing the maintainer's public key | Tags have their own lesson; signing has its own lesson | `tags-and-releases`, the Signing lesson |
| How to run `git rebase`, its conflicts, and the rule about shared commits | A core idea that needs its own lesson | The Rebasing lesson |
| Squash, merge or rebase as a team rule for pull requests | Only what `git merge --squash` does is shown | The lesson on merging pull requests (`pr-merge-strategies`) |
| Rerere in use: `git rerere status`, `diff`, replaying a resolution | Only named here, as the book does in 5.3 | The Hard conflicts lesson (`advanced-merging`) |
| The `integrate` branch variant of the two-phase cycle | A third long-running branch adds nothing new to the idea | The Team workflows lesson |
| Range syntax in general (`^`, `~`, `A...B` in `git log`) | Only `main..topic` and `--not` are needed here | The lesson on pointing at any commit (`revision-selection`) |

## Beyond the book

- `git log --no-merges` with a range (Git reference, `git-log`): the book's 5.2 uses it; here it answers "what is the contributor's own work".
- Cherry-pick conflicts from start to finish: `--continue`, `--abort`, `--skip`, the `git status` text, `--no-edit` (Git reference, `git-cherry-pick`). The book shows only a clean pick.
- "When it goes wrong": the empty pick, a pick that depends on an earlier commit (modify/delete), a merge commit without `-m`, and uncommitted changes in the way.
- Under the hood: a cherry-pick as a three-way merge whose base is the picked commit's parent; author and committer after a pick; `.git/CHERRY_PICK_HEAD`.
- Advanced: `-x`, several commits and ranges, `-n`, `-m 1`, `git cherry -v`.
- `git merge --squash` output and the fact that Git keeps no record of the merge.

## Challenges and quiz

- Easy, `pick-the-fix`: a topic branch holds a fix between two feature commits; cherry-pick the fix onto `main`. Goals check that `main` has the fix and lacks the two feature commits, and that `signup` did not move. This is also the starting state of the Try-its, which only read `signup` and work on branches of their own (`try-signup`, `try-topic`).
- Medium, `count-the-work`: an answer challenge. The contributor merged `main` into the topic branch once, so the right count needs `main..gallery` and `--no-merges` (3, not 4 or 7).
- Hard, `backport-two-fixes`: pick two fixes onto a release branch and leave out the feature between them. The second pick conflicts, and the picked side carries a line from the commit that was left out, which is the point of "What a cherry-pick compares" in Under the hood. Goals read the file: it must hold the fixed line, no night ride and no markers.
- Quiz: two dots against three dots in `git diff`; what a pick copies and what it leaves; `--abort`; why a picked commit still shows in `main..topic`.
