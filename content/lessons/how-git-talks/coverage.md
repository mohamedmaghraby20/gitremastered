# Coverage: how-git-talks

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** how a repository reaches a server (the protocols and their URL forms) and what a fetch and a push transfer. The commands as a daily skill belong to the next lesson, `remotes`.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 4.1 The Protocols | Local, HTTP (smart and dumb), SSH, Git: what each is, pros and cons |
| Pro Git 10.6 Transfer Protocols | The dumb protocol (as history), the smart protocol: uploading and downloading data, `upload-pack`, `receive-pack`, want/have |
| Git reference: `git-ls-remote`, `git-remote`, `git-fetch`, Git environment variables | `ls-remote --heads` / `--tags` / `--symref`, `remote set-url`, `GIT_TRACE`, `GIT_TRACE_PACKET`, `GIT_CURL_VERBOSE` |

## Pro Git 4.1, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Four protocols: Local, HTTP, SSH, Git | Yes, as a table of URL forms | Must know |
| Local: a path or `file://`; used on shared disks | Yes; it is also what the practice uses | Must know |
| Plain path copies or hardlinks, `file://` runs the network processes | Not as stated: on Git 2.55 a fetch from a plain path starts `git-upload-pack` too, which the lesson shows with `GIT_TRACE` | Under the hood |
| Local pros and cons (simple; no protection, hard to reach from outside) | In one line (quick copies between folders) | Must know |
| Smart HTTP: one URL for reading and pushing, username and password prompts | Yes, updated: tokens and credential helpers | Must know |
| Dumb HTTP: served as plain files, read-only | Yes, as history | Under the hood |
| HTTP pros (firewalls allow it, easy for users) and cons (credentials) | Yes | Must know |
| SSH: `ssh://` and the scp-like form; secure, common, no anonymous access | Yes | Must know |
| Git protocol: port 9418, no authentication, unsafe | Yes, one table row: do not use it | Must know |

## Pro Git 10.6, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Dumb protocol walk-through (`info/refs`, fetching objects one by one) | Summary only | Under the hood |
| Smart protocol: two pairs of processes | Yes: `fetch` with `upload-pack`, `send-pack` with `receive-pack` | Under the hood |
| Reference advertisement | Yes, seen through `git ls-remote` and in a real trace | Must know, Under the hood |
| `want`, `have`, `done`, the packfile | Yes, with a real `GIT_TRACE_PACKET` trace | Under the hood |
| Pushing: `send-pack` sends ref updates and a packfile | Yes, in words and through real push output | Must know |
| pkt-line format, capabilities (`multi_ack`, `side-band-64k`…), HTTP request details | No | See "Left out" |
| Protocol version 2 | Yes, short | Advanced |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Setting up SSH keys, tokens and credential helpers | Needs a real account | `github-account-ssh` |
| `git remote add`, `fetch`, `pull`, `push` as daily commands; the rejected push | The next lesson | `remotes` |
| Remote-tracking branches in depth, ahead and behind | Its own lesson | `remote-branches` |
| What `git merge origin/main` does | Used once, with a pointer | `remotes`, `branch-and-merge` |
| pkt-line format, capability lists, the HTTP request sequence | Too low-level for a working developer | Pro Git 10.6 (linked) |
| Running a Git server (4.2 to 4.9) | Reference only in the course map | Reference pages |
| Packfile format | Its own lesson | `packfiles-gc` |
| Shallow and partial clones | Pointer only | `large-repos` |

## Beyond the book

- Tokens in place of passwords for HTTPS, and credential helpers: how hosting services work today.
- `git ls-remote` as the way to see the server's refs and to test a connection (Git reference).
- `GIT_TRACE`, `GIT_TRACE_PACKET`, `GIT_CURL_VERBOSE`, `GIT_SSH_COMMAND="ssh -v"` for debugging (Git reference).
- A table of what never leaves your computer.
- Protocol version 2 (Git reference, protocol-v2).

## Output that was not run

The messages `Permission denied (publickey)`, `Repository not found` and `Authentication failed` need a real hosting account, so the lesson quotes them in prose and not in `console` blocks. Every `console` block is real output from Git 2.55, trimmed. Progress lines of `git fetch` are left out and the lesson says so.

## Challenges and quiz

- Easy, `count-server-branches`: the server has a branch the local repository has never fetched; only `git ls-remote` gives 3 (`git branch -r` shows 2).
- Medium, `fetch-and-name-the-commit`: fetch without moving `main`, then name the commit that was only on the server.
- Hard, `move-to-the-new-server`: point `origin` at a second local server, keep the old one as `old`, and fetch (Advanced: `git remote set-url`, `rename`, `add`).
- Try-its run in the easy challenge's starting state. They fetch and push, which leaves the easy answer (3 branches) unchanged.
- Quiz: what a push sends; reading an SSH sign-in failure; how small a fetch is; asking the server without changing anything.
