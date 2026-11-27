---
id: code-review
title: "Reviewing a pull request"
module: working-in-a-team
bookSection: "GitHub Docs: About pull request reviews"
bookUrl: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews
bookSources:
  - book/progit2/book/06-github/sections/2-contributing.asc
readFirst: [github-flow-prs]
---

A teammate writes "can you review my pull request?", and you are looking at a page of red and green lines with no idea what you are supposed to say. A week later it is your change, and someone left five comments on it. This lesson teaches both seats: how to read, run and judge someone's change, and how to answer a review of your own.

## Must know

A [pull request](term:pull-request) is a page on GitHub that asks for one branch to be merged into another, with room for people to discuss the change first. The lesson [Forks, GitHub Flow and pull requests](lesson:github-flow-prs) showed how to open one and how to merge it. This lesson is about the time in between, when a second person reads the change. That reading is called a [review](term:code-review), or code review.

### What a review is for

A review gives a change a second pair of eyes before it reaches `main`. Teams review for three reasons:

- **To catch mistakes.** The author knows what the code is meant to do, and reads that into it. A fresh reader sees what it really does.
- **To share knowledge.** After a review, two people understand the change. Nobody is the only one who can fix it later.
- **To keep the project consistent.** The same names, the same style, the same way of doing things.

A review is a conversation between colleagues. It is not an exam, and the reviewer is not a guard. The common wrong idea is that a review means "find something to criticise". A review that says "I read it, I ran it, it works, merge it" is a complete and useful review.

GitHub Docs describe three things a reviewer can do: comment on the proposed changes, approve them, or request further changes before the pull request is merged. The rest of this section is those three things, in the order you do them.

### The practice setup

The practice repository for this lesson is `gitremastered-practice-code-review`, on your own GitHub account. It holds the guide of a small bakery: `README.md`, `menu.txt` and `hours.txt`.

You use `gh`, the [GitHub CLI](term:github-cli), next to `git`. It does from the terminal what you would otherwise click on the website.

A review needs two people, and you have one account. So the app plays your teammate Tariq from your account: it opens the pull requests and writes his comments. GitHub therefore shows your own user name where a real team would show his. This has one consequence, covered below: GitHub will not let you approve these pull requests.

The Try-its below use an open pull request. Start the third challenge, "Answer a review on your own pull request", now: it gives you one, called "Add an allergen list", on the branch `add-allergens`. Nothing in the Try-its solves that challenge.

In the output below, `your-name` stands for your GitHub user name. Your pull request numbers and commit IDs will differ.

### Find the pull request and read it

Before you judge a change, you need to know what it claims to do and what it really changes. Three commands answer that.

`gh pr list` lists the open pull requests of the repository:

```console
$ gh pr list

Showing 1 of 1 open pull request in your-name/gitremastered-practice-code-review

ID  TITLE                 BRANCH         CREATED AT
#6  Add an allergen list  add-allergens  less than a minute ago
```

Every pull request has a number (`#6`) and a branch (`add-allergens`). Most `gh pr` commands accept either one. Give neither, and `gh` uses the pull request of the branch you are on.

`gh pr view` shows one pull request: who wants to merge what into where, the size of the change, the description and the newest comment. Add `--comments` to read the whole discussion.

```console
$ gh pr view add-allergens
Add an allergen list your-name/gitremastered-practice-code-review#6
Open • your-name wants to merge 1 commit into main from add-allergens • less than a minute ago
+3 -0 • No checks


  A list of allergens per item, for the counter.


your-name (Owner) • 0m • Newest comment

  Thanks for this. One thing before we merge: the almond cake also contains nuts. Please
  add nuts to that line in allergens.txt.

View the full review: https://github.com/your-name/gitremastered-practice-code-review/pull/6#issuecomment-7204988849


View this pull request on GitHub: https://github.com/your-name/gitremastered-practice-code-review/pull/6
```

- `wants to merge 1 commit into main from add-allergens`: the direction. `add-allergens` is the branch with the new work, and `main` receives it.
- `+3 -0`: three lines added, none removed. A small number here means a quick review.
- `No checks`: no automated test ran on this pull request. The lesson [CI with GitHub Actions](lesson:github-actions-ci) adds such tests.
- `Newest comment`: Tariq's remark. The app wrote it from your account, which is why it carries your name.

`gh pr diff` prints the change itself, as a [diff](term:diff):

```console
$ gh pr diff add-allergens
diff --git a/allergens.txt b/allergens.txt
new file mode 100644
index 0000000..108a909
--- /dev/null
+++ b/allergens.txt
@@ -0,0 +1,3 @@
+Sourdough loaf contains gluten
+Cinnamon bun contains gluten and milk
+Almond cake contains gluten and milk
```

You read it like any diff from the lesson [Diffs in depth](lesson:diffs-in-depth): lines that start with `+` are added, lines that start with `-` are removed. For a large pull request, start with `gh pr diff --name-only`, which prints only the names of the changed files.

:::try-it
1. Run `gh pr list`. One line appears: the number, the title "Add an allergen list" and the branch `add-allergens`. Nothing moves in the picture: these commands only read from GitHub.
2. Run `gh pr view --comments`. Under the description you see Tariq's comment, which asks for nuts on the almond cake line.
3. Run `gh pr diff`. The terminal prints three green `+` lines: the whole file `allergens.txt` is new.
:::

### The same thing in the browser

Most reviews happen on the website, because it lets you comment on single lines. `gh pr view --web` opens the pull request's page. It has tabs:

| Tab | What it shows |
|---|---|
| **Conversation** | The description, every comment and review, and the merge button |
| **Commits** | The commits of the branch, one by one |
| **Files changed** | The diff of the whole pull request |

Pro Git points out what the **Files changed** diff is: the total difference that merging the branch would bring into `main`. It is the same as `git diff main...add-allergens` with three dots, which compares the branch with the commit where it left `main`. So you see only the author's work, even when `main` has moved on since.

Each file on that tab has a **Viewed** checkbox. Tick it when you have read the file: the file folds away and a counter shows how many files are left. It is a bookmark for you alone, and it says nothing to the author. If the author later changes a file you ticked, GitHub unticks it, so you know to read that file again.

### Run it on your computer: `gh pr checkout`

Reading a diff tells you what changed. It does not tell you whether the result works. `gh pr checkout` puts the pull request's branch in your working tree, so that you can open the files, run the program and run the tests.

It takes the number or the branch name:

```console
$ gh pr checkout fix-menu-typo
From https://github.com/your-name/gitremastered-practice-code-review
 * [new branch]      fix-menu-typo -> origin/fix-menu-typo
Switched to a new branch 'fix-menu-typo'
branch 'fix-menu-typo' set up to track 'origin/fix-menu-typo'.
```

This output is from the first challenge, where Tariq's branch `fix-menu-typo` exists on GitHub and not yet on your computer. Three things happened, and you know all three from the lesson [Remote and tracking branches](lesson:remote-branches):

1. Git fetched the branch from GitHub (`[new branch]`).
2. Git created a local branch with the same name and switched to it.
3. The local branch follows `origin/fix-menu-typo`, so a later `git pull` brings the author's newer commits.

:::graph
caption: "After gh pr checkout: Tariq's commit is in your repository, and you are on his branch. main did not move"
commits:
  - id: A
    message: Start the bakery guide
  - id: B
    message: Fix a typo in the menu
    parents: [A]
branches:
  main: A
  fix-menu-typo: B
remotes:
  origin/main: A
  origin/fix-menu-typo: B
head: fix-menu-typo
:::

Once you are on the branch, everything is ordinary Git. Two commands are worth knowing by heart:

- `git log --oneline main..HEAD` lists the commits the pull request adds.
- `git diff main...HEAD` shows the same diff as the Files changed tab; add `--stat` or `--name-only` for the short forms.

When you have finished looking, `git switch main` takes you back. The branch stays on your computer until you delete it with `git branch -d`.

:::predict
question: "You are on main. You run gh pr checkout add-allergens and then look around. Did checking out the pull request change anything on GitHub?"
answer: "No. A checkout only brings commits to your computer and moves HEAD. The pull request, its comments and its state on GitHub are untouched. Reading and running a pull request is always safe."
:::

:::try-it
1. Run `git switch main`. In the picture, the `HEAD · you` pin moves to the station "Start the bakery guide", and the file `allergens.txt` leaves your working tree: `main` does not have it yet.
2. Run `gh pr checkout add-allergens`. Git prints "Switched to branch 'add-allergens'". You had this branch already, because the pull request is your own, so nothing is fetched. In the picture, the `HEAD · you` pin moves back onto the station "Add an allergen list".
3. Run `git log --oneline main..HEAD`. One line appears: the commit "Add an allergen list". That is everything this pull request adds.
4. Run `cat allergens.txt`. You are now reading the file itself, as it would be after the merge. This is the moment to run a project's tests, when it has any.
:::

### Comment on lines, and suggest a fix

You read the change, you ran it, and you found something. A general remark such as "there is a mistake somewhere in the hours" makes the author search. A comment on the exact line does not.

A [line comment](term:line-comment) is a comment attached to one line of the diff. You write it in the browser: on the **Files changed** tab, move the mouse over a line, click the blue **+** that appears beside it, and type. Drag over several lines to comment on all of them at once. Pro Git shows the same thing: the owner clicks a line of the diff and leaves a comment there.

Under the box are two buttons, and the difference matters:

| Button | What it does |
|---|---|
| **Add single comment** | Posts this one comment right away |
| **Start a review** | Keeps the comment as *pending*: only you see it, until you submit the whole review |

Use **Start a review** when you have more than one thing to say. Your comments collect quietly, and the author gets one notification with everything in it, instead of one email per comment.

When you know the exact fix, offer it as a [suggested change](term:suggested-change). In the comment box, click the suggestion button (a page with a plus and a minus sign). GitHub inserts a block that holds the current line, and you edit it into the line you want:

````markdown
```suggestion
Delivery from 9 to 15, every day
```
````

The author sees your version next to theirs, with a **Commit suggestion** button. One click makes a commit on their branch with your line in it. For typos and small fixes this is the fastest review there is: nobody has to retype anything.

`gh` cannot write line comments or suggestions. From the terminal you write the review's overall text, which is the next part, and name the file and line in words.

### Submit the review: three outcomes

Your line comments are still pending. You finish a review by submitting it with a verdict. GitHub has three:

| Outcome | What it tells the author | Use it when |
|---|---|---|
| **Comment** | "Here are my remarks. I am neither for nor against merging yet." | You have questions, or you read only a part |
| **Approve** | "This can be merged." | You would be happy to see it in `main` as it is |
| **Request changes** | "This must be fixed before it is merged." | You found a real problem: a bug, a missing case, a broken test |

An [approval](term:approval) shows as a green tick next to your name on the pull request. A request for changes shows in red and stays there until you review again and approve, or until someone dismisses your review.

On the website, the button is **Review changes** on the Files changed tab: write a summary, pick one of the three, and press **Submit review**. In the terminal it is `gh pr review` with one of three options:

| Command | Outcome |
|---|---|
| `gh pr review --comment -b "text"` | Comment (the text is required) |
| `gh pr review --approve` | Approve (a text is optional: add `-b "text"`) |
| `gh pr review --request-changes -b "text"` | Request changes (the text is required) |

`-b` is short for `--body`: the text of the review. With no number or branch, `gh pr review` reviews the pull request of the branch you are on, which is where `gh pr checkout` just put you.

```console
$ gh pr review --comment -b "Read it and ran it locally. One line to fix, see the comment above."
$ gh pr view --comments
...
your-name commented (Owner) • 0m • Newest comment

  Read it and ran it locally. One line to fix, see the comment above.
...
```

The word `commented` after the name is the outcome. An approval reads `approved` there, and a request for changes reads `requested changes`.

**You cannot approve your own pull request.** GitHub Docs say it in one sentence: pull request authors cannot approve their own pull requests. The same goes for requesting changes. An approval means "a second person agrees", and the author is the first person.

In this practice repository every pull request was opened from your account, so you are the author of all of them:

```console
$ gh pr review --approve
failed to create review: GraphQL: Review Can not approve your own pull request (addPullRequestReview)
```

On the website, the **Approve** and **Request changes** choices are greyed out for the same reason, and only **Comment** can be picked.

With a real teammate nothing is in your way. Tariq opens the pull request from his account. You run the same `gh pr review --approve`, a green tick appears next to your name, and he merges. If you find a problem instead, you run `gh pr review --request-changes -b "..."`, he pushes a fix, and you review again. The commands are the ones you practise here; only the verdict differs.

:::try-it
1. Run `gh pr review --comment -b "Read it and ran it locally. The almond cake line needs nuts."`. The review is submitted. Nothing moves in the picture: a review lives on GitHub, not in your repository.
2. Run `gh pr view --comments`. Your text is at the bottom, with `commented` after your name: that word is the outcome.
3. Run `gh pr review --approve`. GitHub refuses with "Can not approve your own pull request". The pull request is unchanged.
:::

### What makes a good review comment

The author will read your comment without you in the room. Four habits make it land well:

- **Say where and what.** "hours.txt, line 2: a day has no hour 25" beats "the hours look wrong".
- **Say why.** "Please list nuts here: customers with an allergy read this list" teaches something. "Change this" does not.
- **Say how much it matters.** Mark small things as small ("nit: extra space"; nit is short for nitpick), so the author knows which comments block the merge and which are taste.
- **Talk about the code, not the person.** "This loop skips the last item" and not "you forgot the last item". Ask when you are unsure: "What happens when the list is empty?"

Review the change you were given. A pull request that fixes a typo is not the place to ask for a redesign of the file; open a separate discussion for that. And say what is good: "nice, this is much simpler than before" costs one line.

:::careful
Do not approve what you did not read. An approval tells the team "a second person checked this". If you only had time for half, submit a **Comment** review that says which half.
:::

### The author's seat: answer a review

Now turn the chairs around. You opened the pull request, and a review came back with comments. The round has four steps.

**1. Read everything first.** `gh pr view --comments`, or the Conversation tab. Decide for each comment: fix it, or explain why not. Both are fine answers. Silence is not.

**2. Make the changes and push to the same branch.** You do not open a new pull request. Pro Git puts it simply: you commit to the [topic branch](term:topic-branch) again and push, and the pull request updates by itself.

```console
$ git commit -am "List nuts for the almond cake"
[add-allergens c924bc4] List nuts for the almond cake
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git push
To https://github.com/your-name/gitremastered-practice-code-review.git
   4613996..c924bc4  add-allergens -> add-allergens
$ gh pr view
Add an allergen list your-name/gitremastered-practice-code-review#6
Open • your-name wants to merge 2 commits into main from add-allergens • less than a minute ago
```

The summary now says `2 commits`: the pull request picked up the fix.

:::graph
caption: "The fix is a new commit on the same branch. The pull request shows B and C"
commits:
  - id: A
    message: Start the bakery guide
  - id: B
    message: Add an allergen list
    parents: [A]
  - id: C
    message: List nuts for the almond cake
    parents: [B]
branches:
  main: A
  add-allergens: C
remotes:
  origin/main: A
  origin/add-allergens: C
head: add-allergens
:::

**3. Tell the reviewer.** Pro Git warns that adding commits to a pull request sends no notification, so the author in the book leaves a comment to say the change is made. Do the same:

```console
$ gh pr comment -b "Done: the almond cake line lists nuts now."
https://github.com/your-name/gitremastered-practice-code-review/pull/6#issuecomment-7204929668
```

On the website, also answer each line comment in its own thread ("Fixed", or your reason for leaving it), and press **Resolve conversation** on the threads that are dealt with. A resolved thread folds away, so everyone sees what is still open.

Then ask for a second look. In the right-hand column of the pull request, under **Reviewers**, a small circular-arrows icon sits next to the reviewer's name: **Re-request review**. It sends them a notification and puts the pull request back in their list. A reviewer who requested changes must review again before their red mark goes away, so this click is how you get there.

**4. Merge when the review says yes.** Once the reviewer approves, the pull request is merged, by you or by them, as the team agreed:

```console
$ gh pr merge --merge
✓ Merged pull request your-name/gitremastered-practice-code-review#6 (Add an allergen list)
$ git switch main
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
$ git pull
From https://github.com/your-name/gitremastered-practice-code-review
   e14327d..527c9b8  main       -> origin/main
Updating e14327d..527c9b8
Fast-forward
 allergens.txt | 3 +++
 1 file changed, 3 insertions(+)
 create mode 100644 allergens.txt
```

`gh pr merge --merge` joins the branch into `main` on GitHub with a [merge commit](term:merge-commit). The merge happened on the server, so your own `main` learns of it only when you pull. The other ways to merge are the subject of the lesson "Merge, squash or rebase-merge a PR".

:::graph
caption: "After the merge and git pull: the merge commit M on main holds both commits of the pull request"
commits:
  - id: A
    message: Start the bakery guide
  - id: B
    message: Add an allergen list
    parents: [A]
  - id: C
    message: List nuts for the almond cake
    parents: [B]
  - id: M
    message: "Merge pull request #6"
    parents: [A, C]
branches:
  main: M
  add-allergens: C
remotes:
  origin/main: M
head: main
:::

In the practice repository you merge without an approval, because nobody else can give one. On a team, wait for it.

### Required reviews

So far the review was a habit: nothing stopped an impatient author from pressing the merge button. A repository's administrators can turn the habit into a rule. With [branch protection](term:branch-protection), GitHub refuses to merge a pull request into `main` until it has a set number of approvals, and while a review that requested changes is still standing.

On such a repository, the merge box of an unapproved pull request says that a review is required, and the merge button stays blocked until a teammate approves. The lesson [Branch protection, rulesets and CODEOWNERS](lesson:branch-protection-codeowners) sets this up.

### When it goes wrong

```console
$ gh pr review --approve
failed to create review: GraphQL: Review Can not approve your own pull request (addPullRequestReview)
```

You opened this pull request, and an author cannot approve their own work. In the practice repository, submit a comment review instead (`--comment -b "..."`). On a team, ask a teammate to review.

```console
$ gh pr review --comment -b "Looks fine"
no pull requests found for branch "main"
```

With no number or branch, `gh` looks for the pull request of the branch you are on, and `main` has none. Name the pull request (`gh pr review add-allergens --comment -b "..."`), or check it out first.

```console
$ gh pr review --comment
body cannot be blank for comment review
```

A comment review with no text says nothing, so `gh` refuses it. Give the text with `-b "..."`.

```console
$ gh pr checkout add-allergens
error: The following untracked working tree files would be overwritten by checkout:
	allergens.txt
Please move or remove them before you switch branches.
Aborting
failed to run git: exit status 1
```

`gh pr checkout` switches branches, and Git will not switch when that would overwrite a file of yours. Here an untracked `allergens.txt` is in the way. Commit or stash your work, or move the file, and run the checkout again.

## Under the hood

"Must know" treated a pull request and a review as things on a web page. Two facts about how GitHub stores them explain most of what you saw.

### A pull request follows a branch

A pull request does not hold a fixed list of commits. It records two branch names, the one with the work and the one that receives it, and shows whatever is on the first and not on the second. That is why a push to `add-allergens` updated the pull request with no further step: the branch moved, and the pull request shows the branch.

GitHub also keeps a ref of its own for every pull request, a [pull request ref](term:pull-request-ref). `git ls-remote` lists the refs of a remote, and you can see them there:

```console
$ git ls-remote origin 'refs/pull/*'
4613996f680ecbb81d810c13c0cdcdd6260f03e9	refs/pull/6/head
277baa9d5c188ec48b15c9054234b48355525888	refs/pull/6/merge
```

- `refs/pull/6/head` points at the newest commit of pull request #6. It moves with every push to the branch.
- `refs/pull/6/merge` is a trial merge of the pull request into `main` that GitHub makes to know whether the two merge cleanly.

You can fetch a pull request with plain Git through that ref, without `gh`:

```console
$ git fetch origin pull/6/head:pr-6
From https://github.com/your-name/gitremastered-practice-code-review
 * [new ref]         refs/pull/6/head -> pr-6
```

The part after the colon is the local branch to create. `gh pr checkout` saves you from this: it fetches, creates the branch, switches to it and sets its upstream.

### A review belongs to a commit

When you submit a review, GitHub records the commit that was the newest one on the branch at that moment. Your approval says "I approve the pull request as it was at commit `4613996`".

Two things follow from that:

- **New commits can outdate a review.** If the author pushes after your approval, you approved something older than what will be merged. A repository can be set to throw such approvals away, so the reviewer has to look again (see "Stale approvals" in Advanced).
- **Line comments can become outdated.** A line comment is attached to a line of a diff. When the author changes that line, the comment no longer matches the code. GitHub marks it "Outdated" and folds it in the conversation, as Pro Git shows in its example. The text is still there to read.

### Where reviews are not

Reviews, comments and approvals live in GitHub's database, not in your repository. `git clone` and `git fetch` never bring them, `git log` never shows them, and the picture in this app does not move when you submit one. Only the commits that came out of a review, and the merge commit's message "Merge pull request #6", end up in Git's history.

## Advanced

You can now review and be reviewed. These are the options and cases you meet once you do it every week.

### Ask for a review

Opening a pull request does not by itself ask anyone to read it. Name a reviewer when you open it, `gh pr create --reviewer tariq`, or later with `gh pr edit --add-reviewer tariq`. On the website it is the **Reviewers** box in the right-hand column. The person gets a notification, and the pull request appears in their `gh pr status` under "Requesting a code review from you". A file named CODEOWNERS can make GitHub ask the right people by itself; the lesson "Branch protection, rulesets and CODEOWNERS" covers it.

### A long review text

For a review longer than a line, write it in a file and pass it with `-F`: `gh pr review --request-changes -F review.md`. `-F -` reads the text from standard input. The text is Markdown, so lists and code blocks work.

### Check out without keeping a branch

`gh pr checkout 6 --detach` checks out the pull request's newest commit with a [detached HEAD](term:detached-head): you look and run, and no local branch is left behind. `gh pr checkout 6 -b review-allergens` picks the local branch name yourself.

When you are in the middle of your own work, a second working tree lets you review without stashing anything. The lesson [Worktrees](lesson:worktrees) shows how: `git worktree add ../review add-allergens`, after a `git fetch`.

### Review commit by commit

A large pull request made of clean commits is easier to read one commit at a time. The **Commits** tab shows each commit's own diff, and you can comment there too. This is one more reason for the commit habits of the lesson [Commit craft](lesson:commit-craft): small commits with clear messages are a gift to the reviewer.

### Stale approvals and dismissing a review

A branch protection setting can dismiss approvals whenever new commits are pushed, so that nothing reaches `main` unseen. Separately, a repository administrator, or anyone with write access on an unprotected branch, can dismiss a single review by hand, with a reason. That is the way out when a reviewer requested changes and then went on holiday.

### Checks next to reviews

Many teams let machines review first. Automated tests and style tools report on a pull request as [status checks](term:status-check), and `gh pr checks` lists them. In the practice repository it prints `no checks reported on the 'add-allergens' branch`. Read the checks before you review: there is little point in reading code whose tests fail.

### Pull requests from forks

`gh pr checkout` also works when the pull request's branch lives in another person's copy of the repository, a [fork](term:fork). `gh` fetches it through the pull request ref from "Under the hood", so you need no extra remote. The lesson "Contributing in real teams" works with forks.

## Recap

- A review is a second person reading a change before it reaches `main`: to catch mistakes, share knowledge and keep the project consistent.
- Read first: `gh pr list`, `gh pr view --comments`, `gh pr diff`. Then run it: `gh pr checkout <number or branch>`.
- Comment on exact lines and suggest fixes in the browser; submit with one of three outcomes: `gh pr review --comment`, `--approve` or `--request-changes`.
- Authors cannot approve their own pull request. With a teammate, they approve and you merge.
- As the author: commit on the same branch, push, say it is done (`gh pr comment`), re-request the review, and merge once it is approved.
