---
id: git-commit
command: git commit
group: Daily loop
summary: Saves everything in the staging area as a new commit, with a message.
usage: ['git commit -m "message"', "git commit", 'git commit -a -m "message"', "git commit -v"]
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#_committing_changes
lessons: [three-areas]
---

`git commit` saves the staging area as a **commit**: a snapshot of your project with a message, an author and a date. Changes you did not stage stay out.

```console
$ git commit -m "Add release notes"
[main 4f2a9c1] Add release notes
 1 file changed, 1 insertion(+)
 create mode 100644 notes.txt
```

The first line names the branch (`main`), the new commit's short ID (`4f2a9c1`) and your message.

- `-m "message"` writes the message right away. Without it, Git opens a text editor for a longer one.
- `-a` stages every change to tracked files first. New files still need `git add`.
- `-v` shows the changes in the editor, so you can read them while you write the message.

:::careful
In Git Bash the editor is often Vim. To save the message: press `i`, type it, press `Esc`, type `:wq` and press Enter. To cancel: `Esc`, then `:q!` and Enter.
:::
