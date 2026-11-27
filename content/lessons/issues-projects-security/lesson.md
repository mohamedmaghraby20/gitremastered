---
id: issues-projects-security
title: "Issues, projects, Dependabot and secret scanning"
module: professional-github
bookSection: "GitHub Docs: Issues and code security"
bookUrl: https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues
bookSources:
  - book/progit2/book/06-github/sections/2-contributing.asc
readFirst: [maintaining-github-repo]
---

A customer reports a bug in a chat message, and two weeks later nobody remembers it. A teammate pastes a password into a file and pushes it to a public repository. This lesson shows the GitHub tools that stop both: issues and projects to keep track of the work, and Dependabot, secret scanning and a security policy to keep the code safe.

## Must know

Git records what changed in the files. It has no place for "the closing time is wrong and nobody has fixed it yet", and it does not check whether a package you use has a known hole. GitHub adds both on top of your repository. This lesson has two halves: first the tools that track work, then the tools that guard the code.

Every command here is `gh`, the [GitHub command-line program](term:github-cli) you signed in to earlier in the course, or plain Git. `gh` reads the address of your [remote](term:remote) `origin` to know which repository on GitHub you mean.

### An issue is a note the whole team can see

An [issue](term:issue) is one entry in a repository's to-do list on GitHub: a bug, an idea, a question or a task. It has a title, a text, a number, and a conversation below it. An issue is open while the work is waiting and closed when it is done.

`gh issue create` opens one. Give it the title, the text and a label, and it asks nothing:

```console
$ gh issue create --title "Add a photo of the shop" --body "The front page has no picture." --label enhancement

Creating issue in your-name/gitremastered-practice-issues-projects-security

https://github.com/your-name/gitremastered-practice-issues-projects-security/issues/5
```

The last line is the issue's address, with your GitHub name where this example says `your-name`. The number at the end, here 5, is how everyone will refer to the issue from now on: `#5`. Your number will differ.

`gh issue list` shows the open issues, newest first:

```console
$ gh issue list

Showing 1 of 1 open issue in your-name/gitremastered-practice-issues-projects-security

ID  TITLE                    LABELS       UPDATED
#5  Add a photo of the shop  enhancement  less than a minute ago
```

Read one with `gh issue view 5`, add a comment with `gh issue comment 5 --body "..."`, and close one by hand with `gh issue close 5`. `gh issue view 5 --web` opens the issue's page in your browser.

:::careful
An issue lives on GitHub, not in Git. No commit holds it, `git clone` does not download it, and `git log` never shows it. If you move a project to another server with Git alone, the issues stay behind.
:::

### Labels, assignees and milestones sort the list

Ten open issues need no sorting. Two hundred do. GitHub gives each issue three kinds of tags, and each answers one question:

| Tag | Answers | Example |
|---|---|---|
| **Label** | What kind of issue is this? | `bug`, `documentation` |
| **Assignee** | Who is working on it? | you, or a teammate |
| **Milestone** | Which goal or release is it for? | `v1.0`, with a due date |

A [label](term:label) is a coloured word on the issue. Every new repository starts with the same set, and `gh label list` prints it (a first line that counts the labels is left out here):

```console
$ gh label list
NAME              DESCRIPTION                                  COLOR
accessibility     Barrier affecting people with disabilities   #f143ab
bug               Something isn't working                      #d73a4a
documentation     Improvements or additions to documentation   #0075ca
duplicate         This issue or pull request already exists    #cfd3d7
enhancement       New feature or request                       #a2eeef
good first issue  Good for newcomers                           #7057ff
help wanted       Extra attention is needed                    #008672
invalid           This doesn't seem right                      #e4e669
question          Further information is requested             #d876e3
wontfix           This will not be worked on                   #ffffff
```

You can only use a label that exists. Make a new one with `gh label create urgent --description "Fix today" --color D93F0B`.

An assignee is the person responsible for the issue. `gh issue edit 5 --add-assignee @me` puts your own name on it, so teammates do not start the same work twice.

A [milestone](term:milestone) groups issues that belong to one goal, such as a release. Its page on GitHub shows a due date and how many of its issues are closed, as a percentage. You create a milestone on the repository's Issues page, under **Milestones**, and then add issues to it with `gh issue edit 5 --milestone "v1.0"`.

All three work as filters. `gh issue list --label bug --assignee @me` answers "which bugs are mine?".

:::try-it
1. These steps run in this lesson's practice project. Its `origin` is a real repository in your own GitHub account, named `gitremastered-practice-issues-projects-security`. The app creates it when you start one of the challenges below the lesson, so start the first one now. The steps here use their own titles and do not solve it.
2. Run `gh label list`. `gh` prints the labels of the practice repository: `bug`, `documentation`, `enhancement` and the others from the table above.
3. Run `gh issue create --title "Add a photo of the shop" --body "The front page has no picture." --label enhancement`. `gh` prints the address of the new issue; note the number at its end.
4. Look at the picture. Nothing moved: no new station on the history map, and the working tree is unchanged. The issue went to GitHub, not into your repository.
5. Run `gh issue list`. The issue "Add a photo of the shop" is in the list with its number and the label `enhancement`.
6. Run `gh issue edit <number> --add-assignee @me` with your issue's number. `gh` prints the issue's address again: you are now its assignee.
:::

### Close an issue from a commit: `Fixes #N`

You fixed the bug. Now someone has to remember to close the issue, and people forget. GitHub can do it for you: write a [closing keyword](term:closing-keyword) and the issue number in the commit message, and GitHub closes the issue when that commit arrives on the default branch (the branch a new clone starts on, usually `main`).

```console
$ git commit -am "Add the bakery's address" -m "Fixes #9"
[main 44b4ad8] Add the bakery's address
 1 file changed, 1 insertion(+)
```

The second `-m` starts a new paragraph in the message, so `Fixes #9` sits in the message's body, below the subject line.

The keywords are `close`, `fix` and `resolve`, each also with `s` or `d` at the end: `Closes #12`, `Fixed #12` and `Resolves #12` all work, in any letter case. One message can close several issues, but each needs its own keyword: `Fixes #12, fixes #15`.

Three rules decide whether the issue really closes:

- **The keyword must be there.** A bare `#12` in a message only makes a link: the issue's page shows your commit, and the issue stays open. Pro Git shows this kind of cross-reference.
- **The commit must reach the default branch on GitHub.** A commit on your computer, or on another branch, closes nothing yet.
- **The number must be the right one.** `Fixes #21` closes issue 21, whatever it is about.

The same keywords work in the description of a pull request (a request to merge your branch, taught in the lesson on GitHub flow). That is the usual way on a team: the description says `Closes #12`, the issue's page shows the linked pull request while the work is under review, and the issue closes when the pull request is merged into the default branch.

:::predict
question: "You commit with the message \"Fixes #7\" on main, on your computer, and have not pushed. Is issue #7 closed?"
answer: "No. GitHub has not seen the commit. The issue closes a moment after `git push` puts the commit on the default branch on GitHub."
:::

:::graph
caption: "The closing commit C is only on your computer: origin/main is still on B, so the issue is still open. After git push, origin/main moves to C and GitHub closes the issue"
commits:
  - id: A
    message: Start the bakery site
  - id: B
    message: Add a welcome line
    parents: [A]
  - id: C
    message: "Add the bakery's address (Fixes #N)"
    parents: [B]
branches:
  main: C
remotes:
  origin/main: B
head: main
:::

:::try-it
1. Open a small issue of your own to close: run `gh issue create --title "The address is missing" --body "README.md does not say where the shop is." --label documentation`. Note the number at the end of the address `gh` prints.
2. Run `echo "Find us at 12 Mill Lane." >> README.md`. In the picture, the `README.md` sheet in the working tree is marked as changed.
3. Run `git commit -am "Add the bakery's address" -m "Fixes #<number>"` with your issue's number. In the picture, a new station "Add the bakery's address" appears, and the `branch main` tag and the `HEAD · you` pin move onto it. The `remote origin/main` tag stays one station behind.
4. Run `gh issue list`. The issue "The address is missing" is still open: the commit has not left your computer.
5. Run `git push`. In the picture, the `remote origin/main` tag moves onto the new station.
6. Run `gh issue list` again. The issue is gone from the list of open issues. `gh issue view <number>` says `Closed` on its second line. If the issue is still listed, wait a few seconds and look again: GitHub closes it just after the push.
:::

Here is the whole round in the practice repository, with issue 9 (`git push` prints a few progress lines first, left out here):

```console
$ git commit -am "Add the bakery's address" -m "Fixes #9"
[main 44b4ad8] Add the bakery's address
 1 file changed, 1 insertion(+)
$ gh issue list

Showing 1 of 1 open issue in your-name/gitremastered-practice-issues-projects-security

ID  TITLE                   LABELS         UPDATED
#9  The address is missing  documentation  less than a minute ago
$ git push
To https://github.com/your-name/gitremastered-practice-issues-projects-security.git
   006227c..44b4ad8  main -> main
$ gh issue list
no open issues in your-name/gitremastered-practice-issues-projects-security
$ gh issue view 9
The address is missing your-name/gitremastered-practice-issues-projects-security#9
Closed • your-name opened less than a minute ago • 0 comments
Labels: documentation


  README.md does not say where the shop is.


View this issue on GitHub: https://github.com/your-name/gitremastered-practice-issues-projects-security/issues/9
```

### Issue templates ask the right questions

A bug report that says only "it is broken" costs a day of questions. An [issue template](term:issue-template) is a file in your repository that fills the text of a new issue in advance, so the reporter answers your questions straight away.

Templates are Markdown files in the folder `.github/ISSUE_TEMPLATE` on the default branch. Each starts with a few settings between two `---` lines:

```markdown
---
name: Bug report
about: Something on the site is wrong
labels: bug
---

**What did you see?**

**What did you expect?**

**Steps to make it happen again**
```

With this file committed and pushed, the "New issue" page on GitHub offers "Bug report", and an issue made from it gets the label `bug` by itself. In the terminal, `gh issue create --template "Bug report"` starts from the same text.

### Sub-issues and projects, for work bigger than one issue

Some work is too big for one issue and too spread out for one list. GitHub has a tool for each case. You will meet both on a team, so know what they are; neither has a challenge here.

**Sub-issues** split a large issue into smaller ones. "Launch the online shop" becomes the parent of "Add a basket", "Add payment" and "Write the delivery page". The parent's page lists its sub-issues and shows how many are closed. You add one with the **Create sub-issue** button under the parent's text, or with `gh issue create --title "Add a basket" --parent 30`.

**A [project](term:github-project)** is a planning page that collects issues and pull requests, even from several repositories, and shows them in the layout you pick:

| Layout | Looks like | Good for |
|---|---|---|
| Table | A spreadsheet, one row per issue | Sorting and filtering a long backlog |
| Board | Columns of cards, such as Todo, In progress, Done | Seeing at a glance where each task stands |
| Roadmap | Bars on a timeline | Planning weeks and releases |

The board's columns come from a field called Status. A field is one piece of information a project keeps for each item. You can add your own: a priority (Low, Medium, High), a date, a number for the size of the task. Fields belong to the project, not to the issue, so they do not clutter the issue's own page.

A project stays in step with its issues in both directions. Change an assignee in the project and the issue shows the new assignee; close the issue and its card can move to Done by a built-in rule.

:::sidenote
Projects belong to a person or an organization, not to one repository, so the `gh` sign-in from earlier in the course cannot reach them. `gh project` commands need one more permission, which you grant with `gh auth refresh -s project`. The practice here does not need it.
:::

### Dependabot watches the packages you depend on

That was the planning half. Now the guarding half, and it starts with code you did not write.

A [dependency](term:dependency) is a package someone else wrote that your project needs in order to run. A JavaScript project lists its dependencies in `package.json`, a Python project in `requirements.txt`. Each one can have a [vulnerability](term:vulnerability): a mistake in the code that lets an attacker do something they should not, such as read private data. When the package's authors fix it, they publish a new version, and you are safe only once you use that version.

[Dependabot](term:dependabot) is GitHub's robot for this chore. It does two separate jobs:

| Job | What it does | How you turn it on |
|---|---|---|
| **Dependabot alerts** | Warns you when a version you use has a known vulnerability | A switch in the repository's settings |
| **Dependabot version updates** | Opens a pull request whenever a dependency has a newer version, vulnerable or not | A file you commit: `.github/dependabot.yml` |

An alert appears on the repository's **Security and quality** tab. It names the file, the vulnerability, how serious it is, and the fixed version when there is one. Alerts arrive when a new vulnerability is added to the GitHub Advisory Database, GitHub's public list of known vulnerabilities, or when you push a change to your dependencies.

Version updates need a small settings file. This one tells Dependabot to check the npm packages in the top folder once a week:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

- `version: 2` is required and is always 2. It is the version of the file's format, not of your project.
- `updates` is a list with one entry per package manager.
- `package-ecosystem` names the package manager: `npm` for JavaScript, `pip` for Python, `github-actions` for the actions your workflows use, and many more.
- `directory` says where the list of dependencies is. `"/"` is the top folder of the repository.
- `schedule.interval` says how often to look: `daily` (weekdays), `weekly` (Mondays, unless you say otherwise) or `monthly`.

Once this file is on the default branch, Dependabot reads `package.json` there. For each outdated dependency it opens a pull request that changes the version number. In the practice repository, whose `package.json` asks for an old version of the package `marked`, the pull request was there about a minute after the push:

```console
$ gh pr list

Showing 1 of 1 open pull request in your-name/gitremastered-practice-issues-projects-security

ID  TITLE                              BRANCH                                 CREATED AT
#8  Bump marked from 12.0.2 to 18.3.0  dependabot/npm_and_yarn/marked-18.3.0  less than a minute ago
```

Dependabot made the branch, the commit and the pull request. You review and merge it like any other pull request, or close it if you do not want that version. Your tests still decide whether the new version works.

:::careful
The file's name and place are exact: `dependabot.yml` inside the `.github` folder, on the default branch. A file named `.github/dependabot.yaml.txt`, or a `dependabot.yml` in the top folder, does nothing and gives no error.
:::

### Secret scanning and push protection

Dependabot guards against other people's mistakes. The next tool guards against your own: a [secret](term:secret) in a commit.

[Secret scanning](term:secret-scanning) is GitHub reading everything pushed to a repository and looking for strings shaped like known secrets, such as the access tokens of cloud and payment services. It reads the whole history on every branch, not just the latest files, and also issue and pull request texts. On a public repository it is on by default and free. What it finds becomes an alert on the **Security and quality** tab.

An alert comes after the leak. [Push protection](term:push-protection) comes before it: GitHub checks a push while it arrives, and if a commit holds a secret it knows, GitHub refuses the whole push. For your own pushes to public repositories this is on by default.

When a push is blocked, `git push` fails and the server's answer lists each secret it found: its kind, the commit and the line. GitHub Docs show this example:

```text
remote:   —— GitHub Personal Access Token ——————————————————————
remote:    locations:
remote:      - commit: 8728dbe67
remote:        path: README.md:4
```

Read it as: "commit `8728dbe67` holds a GitHub access token on line 4 of `README.md`". The message also gives a web address for the rare case where the string is not a real secret.

Nothing reached GitHub, so the fix happens on your computer, and it must remove the secret from every commit you are pushing:

- **The secret is in your latest commit.** Delete it from the file, run `git commit --amend --all`, and push again.
- **The secret is in an earlier commit.** Rewrite that commit, as the lesson [Remove sensitive data](lesson:remove-sensitive-data) teaches, then push again.

:::careful
A new commit that deletes the secret is not enough. The older commit still holds it, a push sends every commit, and GitHub blocks the push again.
:::

Push protection only knows the secret shapes on GitHub's list. A password you made up yourself passes straight through, so it is a safety net and not a reason to stop being careful.

### A security policy tells people where to report

The last tool is a text file, and it answers one question from a stranger: "I found a hole in your project. Whom do I tell?"

If the only way in is a public issue, the stranger either tells the whole world or tells nobody. A [security policy](term:security-policy) is a file named `SECURITY.md` that gives a private way to report. It usually says which versions still get fixes and where to write:

```markdown
# Security policy

Please do not open a public issue for a security problem.
Report it privately to security@example.com.
We answer within three working days.
```

Commit `SECURITY.md` in the top folder, in `docs` or in `.github`. GitHub then shows it on the repository's **Security and quality** tab, under "Security policy", where a visitor looks for it.

### When it goes wrong

Three things go wrong often with these tools. The first two print a clear message; the third prints nothing at all.

**A label that does not exist.**

```console
$ gh issue create --title "Fix the oven page" --body "The page is empty." --label urgent

Creating issue in your-name/gitremastered-practice-issues-projects-security

could not add label: 'urgent' not found
```

The repository has no label named `urgent`, so `gh` stopped and no issue was made. Run `gh label list` to see the names, or create the label first with `gh label create urgent`.

**`gh` cannot tell which repository you mean.**

```console
$ gh issue list
no git remotes found
```

`gh` finds the repository through the remote `origin`, and this folder has none. Move into the project's folder, or add the remote.

**The issue did not close.** No error appears: the issue just stays open. Check the three rules in order. Does the message hold a keyword right before the number (`Fixes #12`, not `#12` alone)? Is the commit on the default branch on GitHub (`git status` must not say "ahead")? Is it the right number (`gh issue list`)? If the commit is already pushed, do not rewrite it for this: close the issue with `gh issue close 12 --comment "Fixed in the last commit on main"`.

## Under the hood

You have used issues, a settings file for Dependabot and a push that the server may refuse. Three facts about how GitHub builds them explain most of their surprises.

### Issues and pull requests share one counter

Pro Git points out that issues and pull requests are numbered from the same sequence, unique within the project: a repository cannot have a pull request #3 and an issue #3. That is why issue numbers seem to skip: the missing numbers are pull requests. It is also why `#12` works everywhere on GitHub without saying which kind of thing it is.

A number is never reused, even after an issue is closed. To point at an issue in another repository, write the owner and the repository in front: `team/shop#12`.

Issues are records in GitHub's own database, next to your repository and not inside it. `gh` reads them through GitHub's API, the same doorway every other program uses, and the lesson on the `gh` CLI and the API shows that doorway directly.

### GitHub reads its settings from files on the default branch

`.github/ISSUE_TEMPLATE`, `.github/dependabot.yml` and `SECURITY.md` are ordinary tracked files. GitHub looks for them at fixed paths on the default branch each time it needs them. This has two effects worth knowing:

- A settings file on a topic branch does nothing until it is merged. That is useful: a change to the settings is reviewed in a pull request like any other change.
- The settings have a history. `git log .github/dependabot.yml` tells you who turned version updates on, and when.

The closing keyword works the same way round: GitHub reads the messages of the commits that arrive on the default branch and acts on what it finds. Nothing in Git itself knows what `Fixes #12` means.

### Push protection runs on the server, during the push

Your commit already exists on your computer when you run `git push`. GitHub scans the incoming commits before it accepts them, in the same spot where a [server-side hook](term:server-side-hook) runs, and refuses the push as a whole if one fails. Two things follow:

- You cannot skip the check from your side with an option of `git push`. Only the server decides.
- The block names commits, not files. The secret is part of your local history, which is why deleting the line in a new commit does not help and why rewriting the commit does.

## Advanced

The Must know part covers the daily work. These are the options and the rarer tools you meet once a repository has real users.

### Issue forms and the template chooser

A Markdown template can be ignored: the reporter may delete your questions. An issue form is a template written in YAML (a `.yml` file in the same `.github/ISSUE_TEMPLATE` folder) that shows real form fields, such as text boxes and dropdown lists, and can mark a field as required. GitHub turns the answers into the issue's text.

A file named `config.yml` in that folder changes the page where people choose a template. It can add links, for example "Report a security problem" pointing at your security policy, so those reports never start as public issues.

### More Dependabot options

Each entry in `dependabot.yml` takes more options, at the same depth as `directory`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 3
```

| Option | What it does | When to use it |
|---|---|---|
| `open-pull-requests-limit` | The most version-update pull requests Dependabot keeps open at once. Without it, the limit is 5 | A small team that cannot review five at a time. `0` pauses version updates |
| `groups` | Puts several updates into one pull request | A project with many small packages |
| `labels` | Sets your own labels on its pull requests. Without it, they get the label `dependencies` | When your team sorts by its own labels |

There is a third Dependabot job as well: **security updates**. When it is on in the repository's settings, an alert comes with a pull request that moves the vulnerable package to the fixed version. It needs no `dependabot.yml`.

### Letting a blocked secret through

The address in a blocked push opens a page that asks why the secret should be allowed: "It's used in tests", "It's a false positive" or "I'll fix it later". After you choose, you have three hours to push again.

Use it for a string that is truly harmless, such as a made-up token in a test file. For a real secret, "I'll fix it later" is the wrong choice on a public repository: once pushed, anyone can read it, and the only safe fix is [rotating the secret](term:secret-rotation).

### Security advisories and private reports

A [security advisory](term:security-advisory) is a private page on a public repository where the maintainers discuss a vulnerability, prepare the fix in a temporary private copy of the repository, and then publish the details once a fixed version is out. Published advisories go into the GitHub Advisory Database, which is what Dependabot alerts read. That closes the circle: one project's advisory becomes the alert in every project that depends on it.

A public repository can also turn on **private vulnerability reporting**. The Security and quality tab then has a "Report a vulnerability" button that opens a private form, with your security policy shown above it.

### Code scanning, in one paragraph

Code scanning reads your own code for mistakes that become vulnerabilities, such as building a database query out of text a user typed. GitHub's own tool for it is called CodeQL. It runs as a GitHub Actions workflow, on a schedule or on each push, and reports alerts on the Security and quality tab. It is free on public repositories. The lesson on GitHub Actions explains workflows.

## Recap

- An issue is a numbered note on GitHub for a bug, idea or task. Labels say what kind, assignees say who, milestones say for which goal. Issues are not in Git.
- `Fixes #N` in a commit message or a pull request description closes issue N when the change reaches the default branch on GitHub.
- A project shows issues from one or more repositories as a table, a board or a roadmap; sub-issues split a big issue into small ones.
- `.github/dependabot.yml` turns on version updates: pull requests for newer versions of your dependencies. Dependabot alerts, a separate switch, warn about known vulnerabilities.
- Push protection refuses a push that holds a known kind of secret. Remove the secret from the commit itself, then push again. `SECURITY.md` tells people how to report a vulnerability in private.
