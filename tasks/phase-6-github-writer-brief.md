# Phase 6 GitHub lesson brief (wave C, on top of the shared brief)

Read `tasks/phase-6-writer-brief.md` first: every rule there still holds, except the one that says "no challenge uses a network or GitHub". Then read, in `docs/writing-lessons.md`, the **GitHub** goal checks table and the **GitHub challenges** part, and in `tasks/todo.md` the "Phase 6 decisions" and "Assumptions" (A1 to A9). They decide everything below.

## How a GitHub challenge works

- It has a `github` field. Your practice repository is **`gitremastered-practice-<your-lesson-id>`** (one per lesson, so parallel writers never share one). A fork lesson may add `upstream: gitremastered-practice-<your-lesson-id>-upstream`: the shared project. The teammate steps then act on the upstream and the GitHub goals read it; the student's own repository only receives pushes. A free personal account cannot fork its own repository (A4): explain real forks in words, practise the mechanics with the two repositories (remotes `origin` and `upstream`).
- Setup lines build the local project, then `git remote add origin "$PRACTICE_GITHUB_URL"` and `git push -q --force --mirror origin` (this replaces everything on GitHub with the starting state). A teammate who pushes commits is a clone in the workspace: `git clone -q -c core.autocrlf=false "$PRACTICE_GITHUB_URL" ../teammate`, then commits and `git -C ../teammate push -q`. Setup lines never call `gh` and never write a github.com address: the content check refuses it.
- GitHub writes a teammate does (open, comment on, merge a pull request; open an issue) are `teammate` steps, run by the app's guarded Rust code after the setup.
- Solutions are what the student types: `git push`, `gh pr create --fill`, `gh pr review --comment -b "..."`, `gh pr merge --squash`, `gh issue create`, `gh release create`, `gh api ...`. `gh` finds the repository from `origin` (or pass nothing): never `--repo`/`-R`, never an address, never `gh repo delete`. Solutions run with no terminal: always give `gh` every value on the command line (no prompts).
- The goals mix local checks (the snapshot) and `github-…` checks (read from GitHub). Pull requests, issues and workflow runs count only when made during this attempt. An Actions workflow can take a minute; the test waits up to three.

## What a free personal account can and cannot do (decision 5)

- Can: public repositories, pull requests, issues, labels, milestones, releases, rulesets and branch protection on public repositories, GitHub Actions on public repositories, CODEOWNERS files, Dependabot settings files, `gh api`.
- Cannot here: organizations and teams (explain + quiz only), approving your own pull request ("Pull request authors cannot approve their own pull requests": explain what the student would see and do next; a comment review is possible), a second person.
- Never change account settings, SSH keys, organizations, or anything outside the practice repository (decision 4, decision 6). A challenge about the student's own computer (SSH keys, global config) only reads.

## Testing

- `pnpm lesson:check <your-id> [command ids]` checks the content and runs any local (non-GitHub) challenges.
- `DRAFT_LESSON=<your-id> pnpm test:github` (from `app/`) runs your GitHub challenges for real on the account signed in to `gh` on this PC (allowed by decision 7, only `gitremastered-practice…` repositories). Each challenge takes 30 to 120 seconds. Make it pass.
- Do not create, change or delete anything on GitHub by hand outside your own practice repositories, and never delete a repository.
- Cite GitHub facts from GitHub Docs (`bookUrl` may be a `https://docs.github.com/` page for lessons beyond the book). If you are not sure of a UI detail, say so in your report rather than inventing it.
