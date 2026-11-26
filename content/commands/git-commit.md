---
id: git-commit
command: git commit
group: Daily loop
summary: Saves everything in the staging area as a new commit, with a message. With --amend, replaces the last commit.
usage: ['git commit -m "message"', "git commit", 'git commit -a -m "message"', "git commit -v", 'git commit --amend -m "message"', "git commit --amend --no-edit"]
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#_committing_changes
lessons: [three-areas, fix-last-commit]
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

### Redo the last commit with `--amend`

`git commit --amend` replaces your last commit with a new one, built from the staging area. Use it for a typo in the message or a forgotten file.

```console
$ git add contacts.txt
$ git commit --amend --no-edit
[main 1417a77] Add todo list
 Date: Thu Nov 26 20:50:53 2026 +0300
 2 files changed, 2 insertions(+)
 create mode 100644 contacts.txt
 create mode 100644 todo.txt
```

| You type | What happens |
|---|---|
| `git commit --amend -m "New message"` | The last commit gets a new message |
| `git commit --amend --no-edit` | Whatever you staged goes into the last commit; the message stays |
| `git commit --amend` | The editor opens with the old message, ready to change |
| `git commit --amend --no-edit --reset-author` | The author becomes the name and email in your settings |

The amended commit is a new commit with a new ID. The old one is left off the branch and stays listed in `git reflog` for a while.

:::careful
Only amend a commit that only you have. If it was already pushed, teammates have the old commit, and replacing it breaks the shared history. Make a new commit that fixes the problem.
:::
