---
id: git-status
command: git status
group: Daily loop
summary: Shows which files changed, which are staged, and which Git does not track yet.
usage: ["git status", "git status -s", "git status -sb"]
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#_checking_status
lessons: [three-areas]
---

`git status` answers one question: **where is each file right now?** It lists every file that is not saved yet, sorted by area. It never changes anything, so run it as often as you like.

```console
$ git status
On branch main
Changes to be committed:
	new file:   notes.txt

Changes not staged for commit:
	modified:   README.md
```

- **Changes to be committed**: in the staging area, ready for the next commit.
- **Changes not staged for commit**: changed in the working tree, not staged yet.
- **Untracked files**: new files Git has never saved.

`git status -s` prints one short line per file instead. The left letter is the staging area, the right letter the working tree: `A ` is a staged new file, ` M` is changed but not staged, `??` is untracked. Add `-b` to keep the branch line on top.
