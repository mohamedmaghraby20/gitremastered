---
id: git-check-ignore
command: git check-ignore
group: Ignore files
summary: Tells you which .gitignore rule hides a file.
usage: ["git check-ignore -v <file>"]
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#_ignoring
lessons: [ignoring-files]
---

When a file you expect is missing from `git status`, `git check-ignore -v` names the rule that hides it.

```console
$ git check-ignore -v ideas.tmp
.gitignore:1:*.tmp	ideas.tmp
```

Read the answer from left to right: the file that holds the rule (`.gitignore`), its line number (`1`), the pattern (`*.tmp`), then the file you asked about.

If it prints nothing, no rule ignores the file.
