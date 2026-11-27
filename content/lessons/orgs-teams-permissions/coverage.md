# Coverage: orgs-teams-permissions

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** how GitHub groups people (organizations, teams) and decides what each may do (organization roles, repository roles, base permissions), plus the skill a newcomer needs: reading a repository's owner type and their own permissions. A free personal account cannot hold an organization or a team (phase 6 decision 5), so those parts are explanation and quiz; the challenges only use what a personal account can do.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 6.4 Managing an organization | Intro, Organization Basics, Teams, Audit Log |
| GitHub Docs: About organizations; Types of GitHub accounts | Personal account vs organization |
| GitHub Docs: Roles in an organization | Owners, members, moderators, billing managers, security managers, outside collaborators |
| GitHub Docs: Repository roles for an organization | The roles and the permissions table |
| GitHub Docs: Setting base permissions for an organization | Base permissions, "the higher level overrides" |
| GitHub Docs: About organization teams | Teams, visible and secret, nested teams, mentions |
| GitHub Docs: Adding outside collaborators to repositories in your organization | Outside collaborators |
| GitHub Docs: Requiring two-factor authentication in your organization | What happens to members and outside collaborators without 2FA |
| GitHub Docs: About authentication with single sign-on | The redirect, the 24-hour period, authorizing keys and tokens |
| GitHub Docs: Reviewing the audit log for your organization | Owners only, 180 days |
| GitHub Docs: Permission levels for a personal account repository | Owner and collaborators |
| GitHub REST API: Get a repository; CODEOWNERS errors | `permissions`, `owner.type`, `codeowners/errors` |

## Pro Git 6.4, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Organizations: a namespace for projects, a group with shared ownership, used by open source groups and companies | Yes | Must know (Two kinds of account) |
| Creating one: the `+` menu, "New organization", name and contact email, inviting co-owners | Yes, as a description; the course never creates one | Advanced |
| Free when everything is open source | Yes | Advanced |
| Owners can fork into the organization and create repositories under it | Partly: owners' full access is covered; forking into an organization is left out | Must know (Owners and members) |
| Owners automatically watch new repositories | No | Left out |
| Avatar and landing page | No | Left out |
| Teams: a grouping of people and repositories with a kind of access | Yes, with the book's `frontend` / `backend` / `deployscripts` example | Must know |
| The organization page, the Teams page, adding members and repositories | Named only (the Teams tab) | Must know (first day) |
| Team access levels: read only, read/write, administrative | Yes, as a today vs. book comparison with the five roles | Must know |
| Invited people get an email | Yes | Must know (first day) |
| Team `@mentions` subscribe every member | Yes | Must know |
| A user can be on any number of teams; interest teams (`ux`, `css`, `legal`) | Yes | Must know |
| Audit log: what happened, who did it, where; filters | Yes | Must know |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Creating an organization or a team by hand | A free personal account cannot practise it in the course, and the app never changes account settings (decisions 4 and 5) | Described in Advanced |
| Owners auto-watching repositories, avatar, landing page | Cosmetic; no skill to learn | Nowhere |
| Collaborators on a personal repository, in detail | Belongs to running your own repository | The lesson on maintaining a GitHub repository |
| CODEOWNERS in full, protected branches, rulesets | Their own lesson | The lesson on branch protection and CODEOWNERS |
| `gh api` in full, `--jq` filters | Their own lesson; here only two read patterns | The lesson on the GitHub CLI and API |
| Setting up 2FA and SSH keys | Done on the student's own account | The lesson on the GitHub account and SSH |

## Beyond the book

- The five repository roles and what each may do, with Moderate as a side note (GitHub Docs lists it between Triage and Write).
- Base permissions and the "highest wins" rule, with a worked example.
- Nested teams: inherited access and the direction of mentions.
- Outside collaborators, 2FA and SSO requirements, who can read the audit log.
- Reading `owner.type` and `permissions` with `gh api`, and the old names `pull` and `push`.
- 404 for private repositories; roles are enforced by GitHub's server, not by Git.
- Team maintainers, secret teams, other organization roles, Enterprise features.

## Challenges and quiz

All three run on the practice repository `gitremastered-practice-orgs-teams-permissions`; the answers are the same for every student.

- Easy, `who-owns-it`: read `owner.type` with `gh api` and write it into `answer.txt` (`User`).
- Medium, `may-i-change-settings`: map "change settings and manage access" to the Admin role, read `permissions.admin` and write its value (`true`).
- Hard, `teams-own-the-code`: from a TEAMS.md that names the organization and two teams, write `.github/CODEOWNERS` with two team mentions (Advanced: Teams as code owners), commit and push.
- Try-its read `git/git` and the student's own account, never the practice repository, so they do not solve a challenge. The lesson does not print the practice repository's `permissions`.
- Quiz: highest-wins with base permissions; outside collaborator vs member; who a parent team mention reaches; reading a `permissions` answer as a role.
