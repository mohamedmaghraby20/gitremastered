---
id: orgs-teams-permissions
title: "Organizations, teams and permissions"
module: professional-github
bookSection: "6.4 Managing an organization"
bookUrl: https://git-scm.com/book/en/v2/GitHub-Managing-an-organization
bookSources:
  - book/progit2/book/06-github/sections/4-managing-organization.asc
readFirst: []
---

It is your first day at a company. You can clone the code, but your first push is refused, and nobody told you why. This lesson shows how GitHub decides what each person may do in a shared project, and how to read your own access in ten seconds.

## Must know

Until now every repository you used on GitHub was yours: you owned it, so you could do anything in it. At work the repositories belong to the company, and hundreds of people need different amounts of access. GitHub solves this with three ideas: organizations, teams and roles. You cannot practise all of them on a free personal account, so this lesson explains them with examples, and you practise the part that works everywhere: reading who owns a repository and what you may do in it.

### Two kinds of account

GitHub has personal accounts and [organizations](term:organization). Pro Git describes an organization as an account that stands for a group of people who share the ownership of projects, used by companies and by open source projects.

:::definitions
- term: Personal account
  text: The account you sign in with. It is one person. Its repositories have one owner, you.
- term: Organization
  text: A shared account that belongs to a group. Nobody signs in as the organization. People sign in with their personal accounts and join it.
:::

| | Personal account | Organization |
|---|---|---|
| Who signs in | You | Nobody: members sign in as themselves |
| Who owns the repositories | One person | The group. People come and go, the repositories stay |
| Address of a repository | `github.com/your-name/trail-map` | `github.com/octo-org/trail-map` |
| Ways to give access | Owner, plus invited collaborators | Roles, teams and rules for everyone, explained below |

This lesson uses `octo-org` as the example company. It is the organization name GitHub's own documentation uses in examples.

The important point is the second row. If a project lives in a colleague's personal account and that colleague leaves, the project leaves too. In an organization the company keeps it.

You can ask GitHub which kind of account owns any repository. The tool is `gh`, the [GitHub command-line program](term:github-cli) you signed in with earlier in the course. `gh api <path>` asks GitHub's API a question. An API is the door programs use instead of the website. The answer is JSON, a text format made of `"name": value` pairs, and `--jq <path>` prints one value from it.

```console
$ gh api user --jq .type
User
$ gh api repos/git/git --jq .owner.type
Organization
```

The first command asks about the account you are signed in with. The second asks about the repository `git` owned by the account `git`: the Git project's own copy of Git's source code on GitHub. The lesson on the GitHub CLI and API, later in this module, teaches `gh api` in full. Here you need only these two patterns.

:::try-it
1. Run `gh api user --jq .type`. GitHub prints `User`: you are signed in with a personal account.
2. Run `gh api repos/git/git --jq .owner.type`. GitHub prints `Organization`: this repository belongs to a group, not to one person.
3. Look at the picture. Nothing moved, because both commands only read from GitHub. They change nothing there and nothing in your folder.
:::

### Owners and members

So an organization is a group. The next question is who runs it.

Every person in an organization has an organization role. Two matter on most days:

| Organization role | What the person can do |
|---|---|
| **[Owner](term:organization-owner)** | Everything: invite and remove people, create teams, change every setting, delete the organization. An owner also has full access to every repository in it |
| **Member** | The normal role. A member sees the organization's teams and works in the repositories they were given access to |

GitHub Docs advises keeping the number of owners small, but never below two, so the organization is not locked when one owner is away.

A common wrong idea: "I am a member, so I can push everywhere." Being a member only puts you inside the group. What you may do in each repository is decided by a second kind of role.

### Repository roles: what you may do in one repository

A [repository role](term:repository-role) is a named set of permissions for one repository. A permission is the right to do one thing, such as merging a pull request. GitHub lists the roles from least access to most, and each role includes everything the roles before it can do.

| Role | You can | Typical person |
|---|---|---|
| **Read** | See and clone the code, open issues, comment, open a pull request from a fork | Anyone who only follows or discusses the project |
| **Triage** | Read, plus sort the work: apply labels, close and reopen issues and pull requests, assign people, request reviews | A support person or a community helper who does not write code |
| **Write** | Triage, plus push to the repository, merge pull requests, approve a pull request that needs reviews, create releases | A developer on the project |
| **Maintain** | Write, plus manage the repository without the dangerous parts: edit its description and topics, choose how pull requests are merged, push to protected branches | A project lead |
| **Admin** | Everything: change settings, manage who has access, manage branch protection rules, change visibility, delete the repository | The few people responsible for the repository |

Two words in the table come from lessons close to this one. A pull request is a request to merge your branch on GitHub; a fork is your own copy of someone else's repository on GitHub. A protected branch is a branch with rules, such as "no push without a review"; the lesson on branch protection and CODEOWNERS teaches it.

How to use the table: when something is refused, find the action and read which role it needs. "I can label issues but cannot push" means Triage. "I can merge but cannot change the branch rules" means Write or Maintain.

:::sidenote
GitHub Docs now lists a sixth role, **Moderate**, between Triage and Write, for people who edit and hide other people's comments without write access. The five roles above are the ones you will meet most, and the ones GitHub's API reports.
:::

:::compare
today: "Five main roles: Read, Triage, Write, Maintain, Admin."
book: "Pro Git names three levels for a team: read only, read/write and administrative. They are today's Read, Write and Admin; Triage and Maintain were added later."
:::

Repositories in a personal account are simpler. GitHub Docs says they have a single owner with full control, and the people the owner invites, called collaborators, can read and push. There is nothing in between, which is one reason teams move to an organization.

### Read your own permissions

You now know the roles. Here is how to ask GitHub which ones you hold, without clicking through any settings page.

GitHub's answer about a repository has a part called `permissions`: one true or false for each role, for the account that asked.

:::predict
question: "You never joined the Git project. You run `gh api repos/git/git --jq .permissions`. The repository is public. Which roles will be true?"
answer: "Only the lowest one. A public repository gives everyone Read, so `pull` is true and the four others are false."
:::

```console
$ gh api repos/git/git --jq .permissions
{"admin":false,"maintain":false,"pull":true,"push":false,"triage":false}
```

Read it with this key. The API keeps two older names: `pull` means Read and `push` means Write.

| Name in the answer | Role |
|---|---|
| `pull` | Read |
| `triage` | Triage |
| `push` | Write |
| `maintain` | Maintain |
| `admin` | Admin |

Your role is the highest name that is true. Because each role includes the lower ones, someone with Write sees `pull`, `triage` and `push` true, and `maintain` and `admin` false.

To ask about the repository you are working in, let `gh` fill in the names. Inside a clone, `gh api repos/{owner}/{repo}` replaces `{owner}` and `{repo}` with the owner and the name from your `origin` [remote](term:remote). You type the braces exactly as shown.

:::try-it
1. Run `gh api repos/git/git --jq .permissions`. GitHub prints five names with true or false. Only `pull` is true: you may read and clone, and nothing more.
2. Run `gh api repos/git/git --jq .permissions.push`. GitHub prints `false`: one value instead of five. This is the fast way to answer "may I push here?".
3. Look at the picture again. It is unchanged, because reading permissions touches no commit and no file.
:::

### Teams: give access to a group, not to each person

Giving a role to people one at a time works for five people. With fifty it becomes a list nobody can keep right. Teams are the answer.

A [team](term:team) is a named group of members inside an organization. An owner gives the team a role on a repository, and every person on the team gets it.

Pro Git's example: a company has three repositories, `frontend`, `backend` and `deployscripts`. The web developers need `frontend` and maybe `backend`. The operations people need `backend` and `deployscripts`. With two teams the setup is four lines:

| Team | Repository | Role |
|---|---|---|
| `web-developers` | `frontend` | Write |
| `web-developers` | `backend` | Write |
| `operations` | `backend` | Write |
| `operations` | `deployscripts` | Write |

When Dana joins the web developers, an owner adds her to one team and she has both repositories. When she moves to another group, removing her from the team takes both away. Nobody edits the access list of each repository.

What stays the same: the repositories and their history. A team changes who may do what on GitHub. It never changes a commit.

Three more facts from Pro Git and GitHub Docs:

- A person can be on any number of teams.
- Teams are not only for access. Pro Git suggests interest teams such as `ux`, `css` or `legal`, which exist so people can ask them questions.
- Only members of the organization can be on a team.

**Nested teams.** A team can have child teams, to copy the company's shape: `engineering` with the children `frontend` and `backend`. A child team inherits the access of its parent. If `engineering` has Read on a repository, the people in `frontend` have Read on it too, plus whatever `frontend` was given itself.

### Mention a team

Teams also solve a daily problem: you need an answer from the people who know the payment code, and you do not know who they are.

On GitHub, typing `@` and a user name in an issue or a pull request sends that person a notification. This is called a mention. A [team mention](term:team-mention) does the same for a whole team. Its form is `@organization/team-name`:

```text
@octo-org/frontend can someone check the menu on small screens?
```

Pro Git explains that every member of the team is then subscribed to the conversation, which helps when you want someone from a team but do not know exactly who.

With nested teams, the direction matters. Mentioning the parent `@octo-org/engineering` also notifies the members of its child teams. Mentioning the child `@octo-org/frontend` notifies only that team.

:::careful
A team mention can reach dozens of people. Use the smallest team that can answer, and use it for questions that really need that team.
:::

### How your access adds up

You have seen three ways to get a role on a repository. In real life they stack, so you need a rule for the result.

1. **[Base permissions](term:base-permissions).** An owner sets one level that every member has on every repository of the organization, such as Read, or none at all.
2. **Teams.** Each team you are on may have a role on the repository.
3. **You, directly.** An admin of the repository may give you a role by name.

The rule: you get the highest of them. GitHub Docs puts it this way for base permissions: when a member is given a higher level of access to a repository, the higher level overrides the base permission.

A worked example. `octo-org` has base permissions set to Read. Dana is a member and is on the team `frontend`.

| Repository | Base | Team `frontend` | Dana directly | Dana's role |
|---|---|---|---|---|
| `website` | Read | Write | none | **Write** |
| `billing-service` | Read | none | none | **Read** |
| `design-sandbox` | Read | none | Admin | **Admin** |

So Dana can push to `website`, can only read `billing-service`, and runs `design-sandbox`. Nothing was taken from her by the lower levels: a low base permission never pulls a higher role down.

If Dana's push to `billing-service` is refused, nothing is broken. She has Read there. The fix is to ask for the right team, not to ask for Admin.

### Outside collaborators

Not everyone who needs access works at the company. A consultant may need one repository for three months.

An [outside collaborator](term:outside-collaborator) is a person who has access to one or more repositories of an organization without being a member of it. GitHub Docs lists what follows from that:

- They get a role on each repository they were added to, and see nothing else.
- Base permissions do not apply to them.
- They cannot be on a team.

This keeps the rest of the organization closed to them, and removing them is one step per repository.

### Security rules you will meet: 2FA and SSO

Access is only as safe as the accounts that hold it. So organizations often add two requirements, and you will hit them on your first day.

**[Two-factor authentication](term:two-factor-authentication) (2FA)** means signing in with two things: your password and a second proof, usually a code from an app on your phone. An organization can require it. GitHub Docs says a member without 2FA then cannot reach the organization's repositories until they turn it on, and an outside collaborator without it is removed.

**[Single sign-on](term:single-sign-on) (SSO)** means GitHub sends you to your company's own sign-in page before it shows you the organization's work. You keep your personal GitHub account; the company's page only confirms that you still work there. GitHub Docs notes two things worth knowing: you must sign in again from time to time (every 24 hours unless the company chose another period), and an SSH key or access token must be authorized for the organization before Git or the API can use it. SSO is a feature of GitHub's Enterprise plan.

### The audit log

With many people holding access, owners need to answer "who changed this, and when?".

The [audit log](term:audit-log) is the organization's record of events: who did what, and when. Pro Git adds that it also shows where in the world the action was done, and that the log can be filtered by type of event, place or person. GitHub Docs says only owners can open it, and that it lists events of the last 180 days.

As a member you do not read the audit log. You should know it exists: adding a person, changing a role or deleting a repository is recorded with your name.

### Your first day at a company

Put together, this is the order that saves you an afternoon:

1. **Turn on 2FA** on your GitHub account before you are invited.
2. **Accept the invitation.** GitHub sends an email. Until you accept, you are not a member and private repositories do not exist for you.
3. **Sign in through SSO** if the company uses it, and authorize your SSH key or token for the organization.
4. **Find your teams.** The organization's page has a Teams tab. Note the team names: you will mention them and ask to be added to them.
5. **Check your role** in the repository you will work in: clone it, then run `gh api repos/{owner}/{repo} --jq .permissions`.
6. **Missing access? Ask for a team.** Write to the team's maintainer or a repository admin: "Please add me to `frontend`". Being added to a team gives you everything that team needs, and it is taken away cleanly when you move on.

### When it goes wrong

Three messages cover most access problems. All of them mean "you lack a role", never "Git is broken".

**The repository "does not exist".**

```console
$ git ls-remote https://github.com/git/no-such-repository-here
remote: Repository not found.
fatal: repository 'https://github.com/git/no-such-repository-here/' not found
```

GitHub gives this same answer for a repository that does not exist and for a private one you may not see, so that strangers cannot learn which private repositories exist. If a colleague sent you the address, the repository is real and you have no access yet: accept the invitation, sign in through SSO, or ask to be added to a team.

**The API says 404 Not Found.**

```console
$ gh api repos/git/no-such-repository-here
{"message":"Not Found","documentation_url":"https://docs.github.com/rest/repos/repos#get-a-repository","status":"404"}gh: Not Found (HTTP 404)
```

The same rule, seen through `gh api`: 404 means "not there, or not for you". Check the spelling first, then your access.

**The API says 403 and names the access you need.**

```console
$ gh api repos/git/git/collaborators
{"message":"Must have push access to view repository collaborators.","documentation_url":"https://docs.github.com/rest/collaborators/collaborators#list-repository-collaborators","status":"403"}gh: Must have push access to view repository collaborators. (HTTP 403)
```

You can see the repository, but this action needs a higher role: here Write ("push access") to list who has access. The message tells you what to ask for.

## Under the hood

You have used roles from the outside. Three facts about how they work explain most surprises.

### Roles live on GitHub, not in Git

Git itself has no idea of roles. Your [repository](term:repository) holds commits, branches and tags, and nothing about who may do what. Every role in this lesson is checked by GitHub's server at the moment you talk to it: when you fetch, push, open the website or call the API.

Two things follow:

- A clone carries no restrictions. Someone who cloned a repository yesterday and lost access today still has every commit they downloaded. Removing a person stops future fetches and pushes; it cannot take back history. That is why a leaked password must be replaced, as the lesson [Remove sensitive data](lesson:remove-sensitive-data) explains.
- Locally you can always commit. A Read role never stops `git commit`. It stops `git push`, because the push is the moment GitHub is asked.

### What the API reports

The `permissions` part you read with `gh api` is GitHub's final answer for the account that asked: base permissions, teams and direct roles already combined, highest wins. You do not see which of the three gave you the role, only the result.

That is also why its five values look like a staircase. Each role includes the ones below, so the true values always start at `pull` and stop at your role.

### Why "not found" instead of "forbidden"

For a private repository you cannot see, GitHub answers 404 (not found), not 403 (forbidden). A 403 would confirm that the repository exists. The 403 you saw in "When it goes wrong" appeared only because the repository was public: its existence was no secret, only the action was off limits.

## Advanced

The parts below are things you will meet once you run a repository or a team yourself.

### Teams as code owners

A team can be named as the owner of part of the code. The file `.github/CODEOWNERS` lists a path pattern, a space, then one or more owners, and GitHub asks those owners for a review when a pull request changes matching files. An owner is written as a mention:

```text
*.css @octo-org/design
```

This line says: the team `design` in the organization `octo-org` owns every CSS file. The lesson on branch protection and CODEOWNERS teaches the file in full.

GitHub checks the file and tells you when an owner cannot be used. On a personal repository where that line was pushed:

```console
$ gh api repos/{owner}/{repo}/codeowners/errors --jq '.errors[].message'
Unknown owner on line 1: make sure the team @octo-org/design exists, is publicly visible, and has write access to the repository

  *.css @octo-org/design
        ^
```

The message lists the three conditions for a team to own code: the team exists, it is visible, and it has Write on the repository. In a personal repository none of them can be true yet. The file becomes active when the repository moves into the organization and the team gets Write.

### Team maintainers, visible and secret teams

- A **team maintainer** is a member of a team who may manage that team: add and remove people, change its description. Owners can always do this too. When you need to join a team, the maintainer is the person to ask.
- A team is **visible** or **secret**. Every member of the organization can see and mention a visible team. A secret team is seen only by its own members and the owners, and cannot be nested. GitHub Docs suggests secret teams for work with outside partners.

### Other organization roles

Besides owner and member, GitHub Docs describes roles for special jobs:

| Role | Job |
|---|---|
| Billing manager | Manages payment settings, and nothing in the code |
| Security manager | Sees security alerts and manages security settings across the organization, with Read on every repository |
| Moderator | Blocks abusive users and hides comments in public repositories |

They exist so that an organization does not have to make someone an owner for one narrow job.

### Larger companies: Enterprise

Organizations on GitHub's Enterprise plan get more control: custom repository roles (your own mix of permissions), teams filled automatically from the company's staff directory, and accounts the company creates and controls for its staff. If your work account was handed to you instead of being your own GitHub account, you are in that last case.

### Creating an organization

Pro Git shows that creating one takes a minute: the `+` menu at the top of a GitHub page, then "New organization", a name and a contact email. Organizations are free for open source work. This course never creates one for you and never changes your account's settings. If you want to see teams and roles with your own eyes, creating a free organization of your own is a safe experiment.

## Recap

- An organization is a shared account owned by a group. People join it with their personal accounts as owners or members.
- A repository role (Read, Triage, Write, Maintain, Admin) says what you may do in one repository. Each role includes the ones below it.
- Teams give a role to a group at once. Child teams inherit their parent's access, and `@organization/team-name` notifies a whole team.
- Your access is the highest of base permissions, your teams' roles and your direct role. Outside collaborators get single repositories and nothing else.
- `gh api repos/{owner}/{repo} --jq .permissions` shows your role (`pull` is Read, `push` is Write); `--jq .owner.type` shows whether a person or an organization owns the repository.
