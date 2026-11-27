---
id: github-actions-ci
title: "CI with GitHub Actions"
module: professional-github
bookSection: "GitHub Docs: Quickstart for GitHub Actions"
bookUrl: https://docs.github.com/en/actions/writing-workflows/quickstart
bookSources:
  - book/progit2/book/06-github/sections/5-scripting.asc
readFirst: [github-flow-prs]
---

A teammate pushes late on Friday. On Monday the project does not start, and nobody knows which of the weekend's twelve commits broke it, because nobody ran the tests. GitHub can run them for you on every push and every pull request, and this lesson shows how to set that up, read the result and fix a failed run.

## Must know

In [Hooks and enforced policies](lesson:hooks) you made Git run a check on your own computer before a [commit](term:commit). That check has two limits: every teammate must switch it on, and anyone can skip it. A team wants the same check on a computer nobody has to set up and nobody can skip. That is what this lesson builds.

:::definitions
- term: Continuous integration (CI)
  text: "A habit and the tool behind it: every time someone pushes, a server gets the project, builds it and runs its tests, by itself, and reports the result. \"Continuous\" because it happens on every push, and \"integration\" because it checks that everyone's work still fits together."
- term: GitHub Actions
  text: "GitHub's built-in tool for running commands on GitHub's computers when something happens in your repository. CI is its most common job."
- term: Workflow
  text: "One file that says: when this happens, run these commands. In this lesson \"workflow\" always means this file. It is not the team workflow of earlier lessons (the agreement on how a team uses branches); the two only share a word."
:::

Think of a restaurant kitchen where every plate passes the head chef before it leaves. The cooks still taste their own food (your local tests and hooks), but the chef checks every plate the same way, on busy nights too. CI is that chef: one more check, the same for everyone, with the result shown where the whole team sees it.

### A test is a command with an exit code

Before GitHub can check anything, the project needs a check a computer can run. You already know the mechanism from the hooks lesson: the [exit code](term:exit-code). A command that ends with `0` says "all is well", and any other number says "something is wrong". CI uses nothing else. A test is any command that ends with `0` when the project is fine.

The examples in this lesson use a small shop project with a file of opening hours and a script that tests it:

```console
$ cat check.sh
#!/bin/sh
if grep -q "TODO" hours.txt
then
  echo "check: hours.txt still has a TODO line"
  exit 1
fi
echo "check: hours.txt is ready"
```

The script searches `hours.txt` for the word TODO (`grep -q` searches quietly and only sets the exit code). If the word is there, the script explains and ends with `exit 1`. In a real project this command would be `npm test`, `pytest` or `cargo test`. The idea is the same, and a shell script keeps the lesson free of any programming language.

The terminal on the right opens in a practice project. Make files of your own for the Try-its, so the challenges at the end keep their starting state. Nothing in this Try-it touches GitHub.

:::try-it
1. Create the hours file: `printf '%s\n' "Monday to Friday, 9 to 5" "Saturday, 10 to 2" > hours.txt`. In the picture, an `hours.txt` sheet appears in the working tree.
2. Create the test. Copy this as one line: `printf '%s\n' '#!/bin/sh' 'if grep -q "TODO" hours.txt' 'then' '  echo "check: hours.txt still has a TODO line"' '  exit 1' 'fi' 'echo "check: hours.txt is ready"' > check.sh`. A `check.sh` sheet appears in the working tree too.
3. Run `sh check.sh`. It prints "check: hours.txt is ready".
4. Run `echo $?`. The shell keeps the last command's exit code in `$?`, and it prints `0`: the test passed.
5. Add an unfinished line: `echo "TODO Sunday hours" >> hours.txt`. Run `sh check.sh` again, then `echo $?`. The script now prints "check: hours.txt still has a TODO line" and the exit code is `1`: the test failed.
6. Take the TODO line out again: `printf '%s\n' "Monday to Friday, 9 to 5" "Saturday, 10 to 2" > hours.txt`. Keep both files for the next Try-it.
:::

```console
$ sh check.sh
check: hours.txt is ready
$ echo $?
0
```

Everything from here on is about getting GitHub to run that one command for you.

### The workflow file

You have a test. Now you tell GitHub when to run it and how, in a workflow file.

A workflow is a text file in the folder `.github/workflows` of your repository. The folder name is fixed: GitHub looks nowhere else. The file's own name is yours to choose, and it must end in `.yml` or `.yaml`. This is the whole file for the shop:

```console
$ cat .github/workflows/checks.yml
name: Checks
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: sh check.sh
```

Read it as one sentence: "This is the workflow **Checks**. **On** every **push**, do one **job** called `test`: on a fresh Linux computer, get my repository's files, then run `sh check.sh`."

| Line | What it says |
|---|---|
| `name: Checks` | The workflow's name, shown in every list of results. Pick a short one |
| `on: push` | The event: what starts the workflow. Here, any push to any branch |
| `jobs:` | The list of jobs. This workflow has one |
| `test:` | The job's ID, a name you choose |
| `runs-on: ubuntu-latest` | The kind of computer the job gets: a Linux machine with the newest Ubuntu that GitHub offers |
| `steps:` | What the job does, from top to bottom |
| `- uses: actions/checkout@v7` | Step 1: run a ready-made action that copies your repository onto that computer |
| `- run: sh check.sh` | Step 2: run this command, as if you typed it in a terminal there |

The file is written in **YAML**, a plain-text format for settings that many tools use. YAML has two rules that matter here:

- `name: value` gives a setting its value, and a line that starts with `- ` is one item of a list.
- **Indentation is the structure.** `runs-on` sits two spaces deeper than `test:`, and that is how YAML knows it belongs to the `test` job. Use spaces, two per level, and never a tab.

:::careful
A workflow file with one line indented wrongly is not a workflow: GitHub cannot read it, and nothing runs your test. If a run fails within a second and shows no steps at all, look at the indentation first. "When it goes wrong" at the end of this part shows what that looks like.
:::

:::try-it
1. Make the folder: `mkdir -p .github/workflows`. The `-p` makes both folders in one go.
2. Write the file. Copy this as one line: `printf '%s\n' 'name: Checks' 'on: push' 'jobs:' '  test:' '    runs-on: ubuntu-latest' '    steps:' '      - uses: actions/checkout@v7' '      - run: sh check.sh' > .github/workflows/checks.yml`. In the picture, a `checks.yml` sheet appears in the working tree. (In daily work you write this file in your editor; `nano .github/workflows/checks.yml` works here too.)
3. Run `cat .github/workflows/checks.yml` and compare it with the file above, space by space. The eight lines step two spaces to the right each time a new level opens.
4. Run `git status -s`. Git lists `.github/` as untracked, beside your other new files. A workflow is an ordinary file: it starts working when it is committed and pushed to GitHub, and it changes through commits like any other file.
:::

That last point is worth a second look. The CI setup lives **in the repository**. It has a history, it can be reviewed, and every branch carries its own copy of it.

### Jobs, runners and steps

The file used three words that need a closer look, because every result you read later is built from them.

:::definitions
- term: Runner
  text: "The computer that does a job. GitHub starts a fresh virtual machine (a complete computer simulated inside a bigger one) for each job and deletes it when the job ends. Nothing is left over from the run before."
- term: Job
  text: "A list of steps that run on one runner. A workflow may have several jobs; each gets its own runner."
- term: Step
  text: "One thing a job does: either one command of yours (`run:`) or one ready-made action (`uses:`). Steps run in order, and the first one that fails stops the job."
:::

`runs-on` picks the runner. `ubuntu-latest` is the usual choice: Linux starts fastest and has Git, the shell and most programming tools already installed. `windows-latest` and `macos-latest` exist for projects that must be tested there.

A step is written in one of two ways:

| You write | It means | Use it for |
|---|---|---|
| `run: sh check.sh` | Run this shell command on the runner | Your own commands: tests, builds, scripts |
| `uses: actions/checkout@v7` | Run an **action**: a ready-made step that someone published in a GitHub repository (here the repository `actions/checkout`, at its version 7) | Jobs many projects share: getting the code, installing a language |

A `run:` step fails when its command ends with a non-zero exit code. That is the whole link between your test and the red X you will see: `check.sh` ends with `exit 1`, the step fails, the job fails, the run fails.

:::careful
A fresh runner is an empty computer: it does not have your project. Without the `actions/checkout` step, `sh check.sh` fails with "No such file or directory". Nearly every job starts with the checkout step.
:::

The number in `@v7` is the action's version, and it moves on: version 7 was the newest when this lesson was written. An old version keeps working for a long time, and then GitHub starts to print warnings in your runs. When you see one, raise the number.

### Events: when a workflow runs

One question is left in the file: `on:`. The right event decides whether CI tells you about a problem before the merge or after it.

| Event | Starts the workflow when | Typical use |
|---|---|---|
| `push` | Someone pushes commits to a branch | Checking `main` after every change |
| `pull_request` | A pull request is opened, or new commits are pushed to its branch | Checking a change **before** it is merged |
| `workflow_dispatch` | Someone starts it by hand, with a button on GitHub or `gh workflow run` | Running the checks again without a new commit |

A pull request is a request on GitHub to merge your branch into another one, with room for review; the Pull requests lesson teaches it. A workflow can listen to several events, each on its own line:

```console
$ cat .github/workflows/checks.yml
name: Checks
on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: sh check.sh
```

`branches: [main]` under `push` narrows the event: only a push to `main` counts. You will see why most teams write it this way once a pull request is open, a little further down.

### Reading a run

The workflow is committed and pushed. Each time it starts, GitHub records a **run**: one execution of the workflow for one commit. Reading runs is the daily skill, far more than writing workflow files.

You read them with `gh`, the [GitHub CLI](term:github-cli) from the GitHub account lesson, or on the repository's **Actions** tab on GitHub. Both show the same thing. `gh` knows which repository you mean from the `origin` [remote](term:remote) of the folder you are in.

The push that adds the workflow is already a push, so it starts the first run:

```console
$ git add .github/workflows/checks.yml
$ git commit -m "Add the Checks workflow"
[main 755a2df] Add the Checks workflow
 1 file changed, 8 insertions(+)
 create mode 100644 .github/workflows/checks.yml
$ git push
To https://github.com/your-name/gitremastered-practice-github-actions-ci.git
   5bd6247..755a2df  main -> main
```

`git push` printed nothing new: the run starts on GitHub's side, a few seconds after the push arrives. **`gh run watch`** follows a run live. Type it with no ID and `gh` lists the runs in progress: pick one with the arrow keys and Enter. With a run's ID after it, as below, it starts right away. It redraws the screen every three seconds and ends when the run does. This is its last screen:

```console
$ gh run watch 46013790868
✓ main Checks · 46013790868
Triggered via push less than a minute ago

JOBS
✓ test in 11s (ID 140555655983)
  ✓ Set up job
  ✓ Run actions/checkout@v7
  ✓ Run sh check.sh
  ✓ Post Run actions/checkout@v7
  ✓ Complete job

✓ Run Checks (46013790868) completed with 'success'
```

| Part | Meaning |
|---|---|
| `✓ main Checks · 46…` | The result, the branch, the workflow's name and the run's ID |
| `Triggered via push` | The event that started the run |
| `✓ test in 11s` | The job `test` and how long it took |
| `Set up job`, `Complete job` | Steps GitHub adds around yours: starting and clearing the runner |
| `Run actions/checkout@v7`, `Run sh check.sh` | Your two steps |
| `Post Run actions/checkout@v7` | The checkout action tidying up after itself |

**`gh run list`** shows the newest runs, one per line:

```console
$ gh run list --limit 1
STATUS  TITLE                    WORKFLOW  BRANCH  EVENT  ID           ELAPSED  AGE
✓       Add the Checks workflow  Checks    main    push   46013790868  14s      less than a minut...
```

`STATUS` is `✓` for success, `X` for failure and `*` for a run that is still going. `TITLE` is the first line of the commit message. This is one more reason to write good commit messages: they label your runs. `gh run list --limit 5` shows only the newest five.

**`gh run view <ID>`** opens one run. Copy the ID from the list. For a run that passed it shows only the jobs; add `--verbose` to see every step too:

```console
$ gh run view 46013790868

✓ main Checks · 46013790868
Triggered via push less than a minute ago

JOBS
✓ test in 11s (ID 140555655983)

For more information about the job, try: gh run view --job=140555655983
View this run on GitHub: https://github.com/your-name/gitremastered-practice-github-actions-ci/actions/runs/46013790868
```

Now the case this lesson exists for. Someone commits an unfinished line to `hours.txt` and pushes.

:::predict
question: "The commit adds the line \"TODO Sunday hours\" to hours.txt, and check.sh fails on it. What does git push print: does GitHub refuse the push?"
answer: "No. The push goes through exactly as always, and the commit is on main. The workflow starts only after the push has arrived, so it cannot stop it. CI reports; it does not refuse. (Making GitHub refuse a merge on a failed check is a separate rule, which comes up below.)"
:::

```console
$ git commit -am "Start on Sunday hours"
[main 970e3b9] Start on Sunday hours
 1 file changed, 1 insertion(+)
$ git push
To https://github.com/your-name/gitremastered-practice-github-actions-ci.git
   755a2df..970e3b9  main -> main
```

Half a minute later the list has a new first line, with an X:

```console
$ gh run list --limit 2
STATUS  TITLE                    WORKFLOW  BRANCH  EVENT  ID           ELAPSED  AGE
X       Start on Sunday hours    Checks    main    push   46013850252  7s       less than a minut...
✓       Add the Checks workflow  Checks    main    push   46013790868  14s      less than a minut...
```

`gh run view` on that run shows which step failed:

```console
$ gh run view 46013850252

X main Checks · 46013850252
Triggered via push less than a minute ago

JOBS
X test in 4s (ID 140555862889)
  ✓ Set up job
  ✓ Run actions/checkout@v7
  X Run sh check.sh
  ✓ Post Run actions/checkout@v7
  ✓ Complete job

ANNOTATIONS
X Process completed with exit code 1.
test: .github#6


To see what failed, try: gh run view 46013850252 --log-failed
View this run on GitHub: https://github.com/your-name/gitremastered-practice-github-actions-ci/actions/runs/46013850252
```

The X is on "Run sh check.sh", and the steps before it have check marks. So the runner worked and the checkout worked: the project's own test said no. The last lines of the output name the command that shows why. **`--log-failed`** prints what the failed step printed:

```console
$ gh run view 46013850252 --log-failed
test	Run sh check.sh	2026-11-27T14:12:47.7241425Z ##[group]Run sh check.sh
test	Run sh check.sh	2026-11-27T14:12:47.7242401Z sh check.sh
test	Run sh check.sh	2026-11-27T14:12:47.7279196Z shell: /usr/bin/bash -e {0}
test	Run sh check.sh	2026-11-27T14:12:47.7280140Z ##[endgroup]
test	Run sh check.sh	2026-11-27T14:12:47.7381057Z check: hours.txt still has a TODO line
test	Run sh check.sh	2026-11-27T14:12:47.7395911Z ##[error]Process completed with exit code 1.
```

Each line has the job, the step, a time stamp and then the text. Skip to the text: `check: hours.txt still has a TODO line` is your own script speaking, and `Process completed with exit code 1` is the runner saying why it stopped.

The way back to green never changes:

1. Read the failed step's log.
2. Run the same command on your own computer (`sh check.sh`) until it passes.
3. Commit the fix and push. The push starts a new run.

```console
$ sh check.sh
check: hours.txt is ready
$ git commit -am "Close on Sundays"
[main 79785ea] Close on Sundays
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git push
To https://github.com/your-name/gitremastered-practice-github-actions-ci.git
   970e3b9..79785ea  main -> main
$ gh run list --limit 3
STATUS  TITLE                    WORKFLOW  BRANCH  EVENT  ID           ELAPSED  AGE
✓       Close on Sundays         Checks    main    push   46013909614  8s       less than a minut...
X       Start on Sunday hours    Checks    main    push   46013850252  7s       less than a minut...
✓       Add the Checks workflow  Checks    main    push   46013790868  14s      about 1 minute ago
```

The old failed run stays in the list. A run belongs to its commit, so the history of runs tells you which commit broke `main` and which one repaired it.

:::try-it
1. This one waits until you have finished the first challenge below, because it needs a workflow on GitHub. Then, still in that challenge's project, run `gh run list`. It prints one line for your run, with its status, the commit's title and the ID.
2. Run `gh run view <ID> --verbose` with that ID. It prints the job and all its steps, each with a check mark. Nothing changes in the picture: these commands only read GitHub.
:::

### A failing check on a pull request

So far CI told you about a problem after it reached `main`. Teams want to hear earlier, while the change is still on its own [branch](term:branch). That is the `pull_request` event's job.

When a workflow runs for a pull request, GitHub shows each job on the pull request's page as a **check**, with a green check mark or a red X beside it, right above the merge button. **`gh pr checks`** prints the same list for the pull request of the branch you are on.

Here the shop's workflow listens to `push` (every branch) and `pull_request`. A branch `holiday-hours` with a TODO line is pushed, and a pull request is opened:

```console
$ git push -u origin holiday-hours
remote:
remote: Create a pull request for 'holiday-hours' on GitHub by visiting:
remote:      https://github.com/your-name/gitremastered-practice-github-actions-ci/pull/new/holiday-hours
remote:
To https://github.com/your-name/gitremastered-practice-github-actions-ci.git
 * [new branch]      holiday-hours -> holiday-hours
branch 'holiday-hours' set up to track 'origin/holiday-hours'.
$ gh pr create --fill
https://github.com/your-name/gitremastered-practice-github-actions-ci/pull/4
```

:::predict
question: "The workflow says on: push and pull_request. You pushed one commit and opened one pull request. How many checks will the pull request show?"
answer: "Two. The push to holiday-hours started one run, and opening the pull request started a second one for the same commit. Both run the same test."
:::

```console
$ gh pr checks
Some checks were not successful
0 cancelled, 2 failing, 0 successful, 0 skipped, and 0 pending checks

   NAME                        DESCRIPTION  ELAPSED  URL
X  Checks/test (push)                       4s       https://github.com/your-name/gitrema...
X  Checks/test (pull_request)               4s       https://github.com/your-name/gitrema...
```

Both checks failed, for the same reason, and two runners worked to tell you one thing. That is why the file in the Events part says `branches: [main]` under `push`: a branch is then checked once, by its pull request, and `main` is checked after every merge.

The fix follows the same three steps as before, on the branch. The commit below finishes the TODO line and also adds `branches: [main]` to the workflow. Pushing a new commit to the branch updates the pull request and starts a new run by itself:

```console
$ git push
To https://github.com/your-name/gitremastered-practice-github-actions-ci.git
   7fc884c..b320e56  holiday-hours -> holiday-hours
```

**`gh pr checks --watch`** waits until every check is done. One check is left, and it passed:

```console
$ gh pr checks --watch
All checks were successful
0 cancelled, 0 failing, 1 successful, 0 skipped, and 0 pending checks

   NAME                        DESCRIPTION  ELAPSED  URL
✓  Checks/test (pull_request)               6s       https://github.com/your-name/gitrema...
```

A pull request always shows the checks of its **newest** commit. The red X from the earlier commit is gone from the page, although `gh run list` still has that run.

:::careful
A red check does not stop a merge by itself. The merge button still works, and so does `gh pr merge`. To make GitHub refuse a merge until a check passes, the repository owner marks that check as a **required [status check](term:status-check)** in a branch protection rule or ruleset. The Branch protection lesson shows how. Until then, the rule is a team agreement: nobody merges on red.
:::

### Secrets and cost

Two practical questions come up as soon as a team uses Actions for real: where do passwords go, and who pays for the runners.

**Secrets.** Some workflows need a [secret](term:secret), such as a password to upload a site. Never write one in the workflow file: the file is committed, and on a public repository everyone can read it. GitHub keeps secrets for you instead:

- Store one with `gh secret set DEPLOY_PASSWORD` (it asks for the value), or on GitHub under Settings, "Secrets and variables", Actions.
- Use it in a step as `${{ secrets.DEPLOY_PASSWORD }}`. GitHub fills the value in during the run and replaces it with `***` wherever it would appear in a log.
- A pull request that comes from someone else's copy of the repository (a fork) gets no secrets. Otherwise a stranger could open a pull request whose workflow prints them.

The tests in this lesson need no secret, and neither do most.

**Cost.** On a public repository, GitHub's standard runners are free. On a private repository, each account gets a number of free minutes every month, which depends on its plan, and pays for more. Your practice repository is public, so the challenges below cost nothing. This is also why a fast test matters: on a private repository, every minute a job runs is counted.

### When it goes wrong

Three problems catch almost everyone in their first week with Actions.

**The push with the workflow file is refused.**

```console
$ git push
To https://github.com/your-name/gitremastered-practice-github-actions-ci.git
 ! [remote rejected] main -> main (refusing to allow an OAuth App to create or update workflow `.github/workflows/checks.yml` without `workflow` scope)
error: failed to push some refs to 'https://github.com/your-name/gitremastered-practice-github-actions-ci.git'
```

Your sign-in may push code but may not change workflows: GitHub guards that with a separate permission called the `workflow` scope, because a workflow runs commands on its side. Run `gh auth refresh -h github.com -s workflow`, follow the sign-in in the browser, then push again. Your commit is still safe on your computer.

**The pull request has no checks yet.**

```console
$ gh pr checks
no checks reported on the 'holiday-hours' branch
```

You asked a few seconds too early: GitHub had not started the run yet. Wait a moment and run the command again. If the message stays, no workflow listens to `pull_request`: read the `on:` part of the file.

**The run fails at once and is listed under a file path.**

```console
$ gh run list --limit 2
STATUS  TITLE                  WORKFLOW         BRANCH  EVENT  ID           ELAPSED  AGE
✓       Add a workflow wit...  Checks           main    push   46013195640  5s       less than a ...
X       Add a workflow wit...  .github/work...  main    push   46013193781  0s       less than a ...
$ gh run view 46013193781

X main .github/workflows/broken.yml · 46013193781
Triggered via push less than a minute ago

X This run likely failed because of a workflow file issue.

For more information, see: https://github.com/your-name/gitremastered-practice-github-actions-ci/actions/runs/46013193781
```

GitHub could not read the workflow file, so it lists the run under the file's path instead of the workflow's name, and there are no steps and no log. Here the job has no `runs-on` line; a wrong indentation gives the same result. Open the run's page on GitHub (the address is in the output): it names the line. Fix the file, commit and push.

## Under the hood

You can now write a workflow and read its runs. Three questions remain about what happens on GitHub's side: where a check is stored, which files the runner really gets, and what `@v7` points at. Each answer is plain Git.

### A check belongs to a commit

GitHub stores every check result against a commit ID, never against a branch or a pull request. Pro Git describes this in its chapter on scripting GitHub: each commit can carry one or more statuses, and a pull request takes the status of the last commit on its branch.

That explains what you saw. The pull request turned green when you pushed the fix, because its last commit changed. The old commit keeps its red X for good, and `gh run list` still shows it.

### What the runner checks out

For a `push`, the checkout step gets exactly the commit that was pushed. It gets nothing more: the action makes a [shallow clone](term:shallow-clone) with a depth of one, which [Large repositories](lesson:large-repos) explained. A job that needs older commits (to build a changelog, say) asks for them with the action's `fetch-depth` setting.

For a `pull_request`, the runner gets something else: a **trial merge**. GitHub merges the pull request's branch into the base branch in a commit of its own, which no branch points to, and keeps it under the name `refs/pull/<number>/merge`. The run tests that commit.

:::graph
caption: "For a pull request, the run tests M: a trial merge of holiday-hours into main that no branch points to"
commits:
  - id: A
    message: Run Checks on pull requests
  - id: B
    message: Start on holiday hours
    parents: [A]
  - id: C
    message: Close on public holidays
    parents: [B]
  - id: M
    message: Trial merge (refs/pull/4/merge)
    parents: [A, C]
    faded: true
branches:
  main: A
  holiday-hours: C
:::

You can see it from inside a run. For this output the shop's workflow got two extra steps, `echo "$GITHUB_EVENT_NAME $GITHUB_REF"` (GitHub puts the event's name and the checked-out ref into these two variables) and `git log --oneline`. `gh run view <ID> --log` prints the whole log of a run; the two lines that matter are:

```console
$ gh run view 46013604090 --log
...
test	Run echo "$GITHUB_EVENT_NAME $GITHUB_REF"	2026-11-27T14:11:09.4573856Z pull_request refs/pull/4/merge
...
test	Run git log --oneline	2026-11-27T14:11:09.4832005Z 9d34db6 Merge b320e565843bd96aa5f8d3a6ebc15f040eed053e into 71131e9a992050bfc2e634faeca1aa81f89edcbd
```

The ref is `refs/pull/4/merge`, and the runner's whole history is one commit: "Merge b320e56… into 71131e9…", the branch's newest commit merged into `main`'s. Your own commit message is not there, because the runner never checked out your commit by itself. This has three consequences:

- A `pull_request` run answers the question that matters: "will `main` still work **after** this merge?" It can fail although your branch passes alone, when `main` changed in the meantime.
- The workflow file is read from that trial merge too. A pull request that adds or changes a workflow is tested with its own version of it.
- When the branch conflicts with the base branch, there is no trial merge, and the `pull_request` workflow does not run at all. Solve the [conflict](term:merge-conflict) first.

### What @v7 points at

`uses: actions/checkout@v7` names a repository on GitHub (`actions/checkout`) and a point in its history (`v7`). `v7` is a [tag](term:tag), and at the start of each job the runner downloads the action at that tag. The run's full log says which commit that was:

```console
$ gh run view 46013604090 --log
...
test	Set up job	2026-11-27T14:11:08.1789607Z Download action repository 'actions/checkout@v7' (SHA:3d3c42e5aac5ba805825da76410c181273ba90b1)
...
```

The owner of an action can move a tag to a new commit, which is how `v7` receives fixes. It also means the code you run can change without a commit on your side. Teams that must rule this out write the full commit ID in place of the tag, `uses: actions/checkout@<40-character ID>`. GitHub Docs recommend that for actions from authors you do not know.

### Before Actions

Pro Git was written before GitHub Actions existed. It shows the older way: GitHub tells an outside system, such as a test server your team runs, about every push, and that system reports back a status for the commit. Actions does the same job without the outside system. The idea of the status on a commit is unchanged, and outside CI services still work this way today.

## Advanced

One job with one test covers a small project. These are the settings teams add as a project grows. Each is a few lines in the same file.

### Start a run by hand

A workflow with `workflow_dispatch:` under `on:` can be started without a push. The file must be on the default branch (usually `main`) first.

```console
$ gh workflow run Checks
✓ Created workflow_dispatch event for checks.yml at main
https://github.com/your-name/gitremastered-practice-github-actions-ci/actions/runs/46013153599

To see the created workflow run, try: gh run view 46013153599
To see runs for this workflow, try: gh run list --workflow="checks.yml"
```

To run a workflow again without changing anything, `gh run rerun <ID>` repeats a finished run, and `gh run rerun <ID> --failed` repeats only its failed jobs. That helps when a failure came from outside, like a download that timed out. For a failure in your own code a rerun changes nothing.

### Matrix: the same job several times

A matrix runs one job once per value in a list. Each copy gets its own runner, and they run side by side. Teams use it to test on several systems or language versions:

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v7
      - run: sh check.sh
```

`${{ matrix.os }}` is replaced by one value from the list in each copy. A pull request then shows three checks, one per system. Three runners also cost three times the minutes, so add a matrix when you really support those systems.

### Caching: do not download the same things every run

A fresh runner has to install the project's packages on every run, and on real projects that takes longer than the tests. A cache keeps a folder between runs. The setup actions for most languages do it with one line, for example `cache: npm` under `actions/setup-node`, and `actions/cache` does it for any folder you name. The cache is thrown away when the file that lists the packages changes, so you never test with stale packages.

### Several jobs, cancelling and skipping

- **Several jobs** run at the same time by default. `needs: test` in a second job makes it wait for the job `test` and skips it when `test` failed. Teams use this to build only what passed its tests.
- **`concurrency`** stops a pile-up. With `group: ${{ github.ref }}` and `cancel-in-progress: true`, a new push to a branch cancels the run that is still going for the same branch.
- **`[skip ci]`** in a commit message tells GitHub not to start `push` and `pull_request` workflows for that commit. It is meant for changes no test covers, like a typo in a README. Where a check is required, a skipped check blocks the merge, so use it with care.
- **`schedule`** starts a workflow at set times, for example every night. Teams use it for slow tests that would hold up every push.

## Recap

- CI runs your tests on GitHub's computers on every push and pull request. A test is any command that ends with exit code 0 when all is well.
- A workflow is a YAML file in `.github/workflows`: `name`, `on` (the event), and jobs made of steps. `uses:` runs a ready-made action such as `actions/checkout`; `run:` runs your own command.
- `gh run list` shows the runs, `gh run watch` follows one, `gh run view <ID> --log-failed` shows why one failed, and `gh pr checks` shows a pull request's checks.
- To fix a failed run: read the failed step, repeat the command on your computer, commit the fix and push. A new run starts by itself.
- A check reports and does not block. A merge is refused on a failed check only when the check is a required status check. Secrets live in the repository's settings and never in the file. Public repositories run for free.
