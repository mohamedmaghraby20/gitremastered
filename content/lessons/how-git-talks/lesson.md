---
id: how-git-talks
title: "How Git talks to servers: HTTPS, SSH, what gets transferred"
module: remotes
bookSection: "4.1 Git on the Server - The Protocols"
bookUrl: https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols
bookSources:
  - book/progit2/book/04-git-server/sections/protocols.asc
  - book/progit2/book/10-git-internals/sections/transfer-protocols.asc
readFirst: [first-look-inside]
---

Your first push to a team server fails with "Permission denied", and a teammate says "just switch to HTTPS". To fix that kind of problem you need to know two things: how your Git reaches the server, and what the two of them send each other. This lesson shows both.

## Must know

So far every repository you worked in lived in one folder on your computer. Teams keep one more copy in a place everybody can reach, and each person's Git talks to that copy. This lesson is about the talking. The next lesson, [Work with remotes: fetch, pull, push](lesson:remotes), turns it into a daily habit.

### A remote is another copy of the repository

A [remote](term:remote) is a full copy of your project's repository that lives somewhere else, usually on a server such as GitHub. It has the same commits, branches and tags as yours, or slightly different ones when somebody has worked since you last looked.

Your repository remembers each remote under a short name. The usual name is `origin`.

A server does not edit files, so it keeps the repository without a working tree: only the content of a `.git` folder. That is called a [bare repository](term:bare-repository), and by habit its folder name ends in `.git`.

:::definitions
- term: Server
  text: A computer that is always on and that other computers connect to. For Git, it is the machine that holds the team's shared copy of the repository.
- term: Protocol
  text: An agreed way for two programs to talk, like the rules of a phone call. Git can talk over several protocols; the address of the remote says which one.
:::

In this course the "server" is a folder next to your practice project, called `origin.git`. Git treats it like a real server, so everything here works offline, and everything you learn works the same with GitHub.

:::try-it
1. Run `ls ..` to look at the folder above your project. You see `origin.git` (the server), `project` (you are here) and `teammate` (the copy of a teammate, Tariq).
2. Run `git remote -v`. Git prints the name `origin` and its address, `../origin.git`, once for fetching and once for pushing. In the picture, the `remote origin/main` tag on the history map is your repository's record of the server's `main` branch.
:::

```console
$ git remote -v
origin	../origin.git (fetch)
origin	../origin.git (push)
```

### Four kinds of address

You now know where this practice server is. A real one is on the internet, and its address looks different. The address of a remote is called its URL, and the start of the URL tells Git which protocol to use.

| The URL looks like | Protocol | You will meet it |
|---|---|---|
| `../origin.git` or `/srv/git/project.git` or `file:///srv/git/project.git` | Local: a folder on this computer or on a shared disk | In this course's practice, and for quick copies between folders |
| `https://github.com/user/repo.git` | HTTPS, the same one your browser uses | Everywhere. It is the default on GitHub |
| `git@github.com:user/repo.git` or `ssh://git@github.com/user/repo.git` | SSH, a secure connection that signs you in with a key | In most teams, for daily work |
| `git://example.com/repo.git` | The old Git protocol: no sign-in, no encryption | Almost never today. Do not use it |

`git remote -v` shows which one a repository uses. Two of the four matter in real work.

**HTTPS.** It works on every network, because offices and schools rarely block web traffic. Anyone can read a public project with no account. To push, or to read a private project, the server asks who you are. Today that means a token (a long generated password) kept by a credential helper, a small program that stores it so you type it once.

**SSH.** You create a key pair once: a private key that stays on your computer and a public key that you give to the server. After that Git signs in by itself, with no prompts. Some networks block SSH, and it has no anonymous access: without a key the server refuses even to let you read.

Which one a team picks is mostly taste. HTTPS is quicker to start with. SSH is less trouble once it is set up. Both transfer exactly the same data, and you can switch a repository from one to the other at any time (the Advanced layer shows how). The lesson "GitHub account, SSH keys, credentials" sets both up for real.

### Git sends commits, not files

Whatever the protocol, the conversation is the same. This is the core of the lesson.

Git never uploads or downloads "the files that changed". It transfers two things:

- **[Objects](term:object):** commits, with the trees and blobs they need. You met them in [A first look inside .git](lesson:first-look-inside).
- **Ref updates:** which commit each branch and tag now points at. A [ref](term:ref) is a name for a commit, like `refs/heads/main` for the branch `main`.

You can ask the server for its list of refs without downloading anything.

:::try-it
1. Run `git ls-remote origin`. Git connects to the server and prints every ref the server has, each with the ID of the commit it points at. Nothing changes in your repository or in the picture: this command only asks.
2. Run `git log --oneline --all` to list the commits your own repository holds. Compare the two lists.
:::

```console
$ git ls-remote origin
cd850660407bee533a0672ff3f68d585dc1a9178	HEAD
cd850660407bee533a0672ff3f68d585dc1a9178	refs/heads/main
5402c842678f82869062a82c4eb3089012cb97b1	refs/heads/photos
b4a31790d453fdadc4580101cd5a1275217e03f7	refs/heads/river-signs
b7254fa4a69fb826cbbbba235139ef885a386490	refs/tags/v1.0
```

Your IDs are different, because commit IDs depend on who made the commits and when. Read the lines like this:

- `refs/heads/main`, `refs/heads/photos`, `refs/heads/river-signs`: the server has three branches.
- `refs/tags/v1.0`: and one tag.
- `HEAD`: the branch the server hands out by default, here `main`.

```console
$ git log --oneline --all
5402c84 Say where photos go
b7254fa Add trail list
d1eb26e Add README
```

The server's `main` points at `cd85066`, and your repository has no commit with that ID. Tariq pushed a commit that you do not have yet. The server also has a branch, `river-signs`, that your repository has never heard of.

:::graph
caption: "Before the fetch: the server has commit C on main, your repository stops at B"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add trail list
    parents: [A]
branches:
  main: B
remotes:
  origin/main: B
head: main
:::

### A fetch, step by step

You have seen that the server is ahead. Getting its new commits is called a [fetch](term:fetch), and it runs in four steps:

1. Your Git asks the server for its refs (what `git ls-remote` showed you).
2. It compares them with what you have, and tells the server which commits it **wants** and which ones it already **has**.
3. The server works out the objects you are missing, packs them into one compressed file and sends it.
4. Your Git stores the objects and updates its records of the server's branches: the [remote-tracking branches](term:remote-tracking-branch), such as `origin/main`.

A fetch never touches your own branches or your files. It only adds objects and moves the `origin/...` records.

:::predict
question: "The server's main has one commit you lack, and there is a branch you have never seen. You run `git fetch origin` twice in a row. What does each run print?"
answer: "The first prints one line per ref that changed: main moved forward, river-signs is new. The second prints nothing at all: both sides compare refs, find nothing missing, and stop."
:::

:::try-it
1. Run `git fetch origin`. Read the last lines (explained below). In the picture, two new stations appear on the history map, and the `remote origin/main` tag moves onto the station "Add river path". Your `branch main` tag and the `HEAD · you` pin stay where they were. The header now reads `on branch main · 1 behind origin/main`.
2. Run `git fetch origin` again. Git prints nothing: there is nothing new to send.
3. Run `git log --oneline --all`. The two commits from the server are now in your repository.
:::

```console
$ git fetch origin
remote: Total 6 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
From ../origin
   b7254fa..cd85066  main        -> origin/main
 * [new branch]      river-signs -> origin/river-signs
```

Git prints a few progress lines first ("Enumerating objects", "Counting objects"); they are left out here.

- `remote: Total 6`: the server sent 6 objects. That is 2 commits, and for each one a tree and a blob. The rest of the project was not sent again, because you already had it.
- `b7254fa..cd85066  main -> origin/main`: the server's `main` moved from `b7254fa` to `cd85066`, and your record `origin/main` now says so.
- `* [new branch] river-signs -> origin/river-signs`: a branch you did not know. You now have a record of it too.

:::graph
caption: "After the fetch: commit C is in your repository, and origin/main points at it. Your own main has not moved"
commits:
  - id: A
    message: Add README
  - id: B
    message: Add trail list
    parents: [A]
  - id: C
    message: Add river path
    parents: [B]
branches:
  main: B
remotes:
  origin/main: C
head: main
:::

The common wrong idea is "fetch downloads the latest files". It downloads commits. Your files change only when you bring those commits into your own branch, which is the subject of the next lesson.

### A push is the same talk, the other way

A fetch brings the server's commits to you. A [push](term:push) sends yours to the server, with the same steps in the other direction: your Git reads the server's refs, sends only the objects the server lacks, and then asks the server to move its branch to your commit.

To try it, your `main` must first contain the commit you fetched. The first step below does that; the next lesson explains it properly.

:::try-it
1. Run `git merge origin/main`. This moves your `main` forward to the commit you fetched. In the picture, the `branch main` tag and the `HEAD · you` pin move onto the same station as `remote origin/main`.
2. Make a commit of your own: `echo "Bring two litres of water" > tips.txt`, then `git add tips.txt`, then `git commit -m "Add hiking tips"`. A new station appears, and the header reads `on branch main · 1 ahead of origin/main`.
3. Run `git push origin main`. Read the output (below). In the picture, the `remote origin/main` tag moves onto your new station, and the header reads `level with origin/main`.
4. Run `git ls-remote --heads origin`. The server's `main` now shows your commit's ID.
:::

```console
$ git push origin main
Enumerating objects: 4, done.
Counting objects: 100% (4/4), done.
Delta compression using up to 16 threads
Compressing objects: 100% (2/2), done.
Writing objects: 100% (3/3), 338 bytes | 338.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
To ../origin.git
   cd85066..cb1e8a2  main -> main
```

- `Writing objects: 100% (3/3), 338 bytes`: one commit, one tree and one blob travelled. The project has five commits, and 338 bytes were enough.
- `cd85066..cb1e8a2  main -> main`: the server moved its `main` from Tariq's commit to yours.

That is why pushing a large project takes a second: only what the other side lacks is sent.

### What never leaves your computer

A push sends commits and moves refs. Everything that is not a commit on a branch you pushed stays with you:

| Stays on your computer | Why |
|---|---|
| Changes you have not committed, staged or not | They are not in any commit |
| Stashed work | A stash is local |
| Branches you did not push | You choose which branches to send |
| Your settings (`git config`) and hooks | They belong to this copy only |

This matters in both directions. A teammate cannot see work you have not committed and pushed. And "it is on my laptop" is not a backup until it is pushed.

### When it goes wrong

Connection errors look alarming and usually mean one of four things.

```console
$ git ls-remote ../nowhere.git
fatal: '../nowhere.git' does not appear to be a git repository
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

Git reached the place and found no repository there. Almost always the address is wrong: a typo, or the project moved. Check it with `git remote -v`. With HTTPS the same mistake reads `remote: Repository not found.` and `fatal: repository '...' not found`. GitHub says "not found" for a private project you may not see, too, so that message can also mean "wrong account".

```console
$ git ls-remote https://no-such-host.invalid/team/repo.git
fatal: unable to access 'https://no-such-host.invalid/team/repo.git/': Could not resolve host: no-such-host.invalid
```

Your computer could not find the server at all. Either the host name is misspelled or you are offline. Nothing is wrong with your repository; committing still works.

Two more messages come up as soon as you use a real server. They need an account to reproduce, so here they are in words:

- `git@github.com: Permission denied (publickey).` You used an SSH address, and the server knows no key of yours. Your key is missing, not loaded, or not added to your account.
- `remote: Invalid username or token.` followed by `fatal: Authentication failed for 'https://...'`. You used an HTTPS address, and the server refused the name or token. Account passwords do not work for Git on GitHub; it wants a token.

Both are sign-in problems, and the lesson "GitHub account, SSH keys, credentials" fixes them. Neither one can damage anything: a refused connection transfers nothing.

## Under the hood

"Must know" described the conversation in four steps. Git can show you the real one.

### Two programs on each side

A transfer is always two Git programs talking. For a fetch, your `git fetch` talks to a program called `git-upload-pack` on the server, which uploads a pack to you. For a push, your `git push` runs `git send-pack` and the server runs `git-receive-pack`.

The protocol only decides how the two get connected:

| Protocol | How your Git reaches the server's program |
|---|---|
| SSH | It logs in over SSH and starts the program there |
| HTTPS | It sends web requests, and the web server passes them on to the program |
| Local path | It starts the program on your own computer, pointed at the other folder |

You can see the last one in the practice project. `GIT_TRACE=1` in front of a command makes Git print what it runs:

```console
$ GIT_TRACE=1 git ls-remote --heads origin
21:02:49.593387 git.c:502               trace: built-in: git ls-remote --heads origin
21:02:49.594387 run-command.c:674       trace: run_command: unset GIT_PREFIX; GIT_PROTOCOL=version=2 'git-upload-pack '\''../origin.git'\'''
21:02:49.632059 git.c:502               trace: built-in: git upload-pack ../origin.git
```

Even for a folder next door, Git starts `git-upload-pack` and talks to it. That is why the practice server behaves like a real one.

### Want and have

`GIT_TRACE_PACKET=1` prints every line the two sides exchange. Here is the fetch from Must know, cut down to the lines that matter. `fetch<` is what your Git received, `fetch>` is what it sent.

```console
$ GIT_TRACE_PACKET=1 git fetch origin
packet:        fetch< cd850660407bee533a0672ff3f68d585dc1a9178 refs/heads/main
packet:        fetch< 5402c842678f82869062a82c4eb3089012cb97b1 refs/heads/photos
packet:        fetch< b4a31790d453fdadc4580101cd5a1275217e03f7 refs/heads/river-signs
packet:        fetch< b7254fa4a69fb826cbbbba235139ef885a386490 refs/tags/v1.0
packet:        fetch> command=fetch
packet:        fetch> want cd850660407bee533a0672ff3f68d585dc1a9178
packet:        fetch> want b4a31790d453fdadc4580101cd5a1275217e03f7
packet:        fetch> have 5402c842678f82869062a82c4eb3089012cb97b1
packet:        fetch< acknowledgments
packet:        fetch< ACK 5402c842678f82869062a82c4eb3089012cb97b1
packet:        fetch< ready
packet:        fetch< packfile
```

Read it top to bottom:

1. **The server lists its refs.** Pro Git calls this the reference advertisement.
2. **`want`:** your Git names the two commits it lacks, the tips of `main` and `river-signs`.
3. **`have`:** it names a commit it already has. From that one line the server knows you also have everything that commit was built on.
4. **`ACK` and `ready`:** the server confirms it knows that commit and has worked out what is missing.
5. **`packfile`:** the missing objects arrive as one file.

The `have` line is the reason transfers are small. Each commit names its parents, so naming one commit you have tells the server about your whole history behind it.

### The packfile

Objects do not travel one by one. The sender puts them into a packfile: one compressed file, in which similar files are stored as differences from each other. The receiver unpacks it or keeps it as it is under `.git/objects/pack`.

You can count the effect. Before the fetch, `git count-objects -v` reported `count: 9` in the practice project. After it, `count: 15`: the 6 objects from the line `remote: Total 6`.

### The old way: dumb HTTP

Before 2010 a web server could only hand out a repository's files one at a time, and Git had to ask for each object by name and follow the links itself. Pro Git calls this the dumb protocol. It was slow and could not push. Today's HTTPS is the smart protocol: the same want-and-have conversation as SSH, carried in web requests. You will only meet the dumb one in old articles.

## Advanced

### Switch a repository between HTTPS and SSH

The address is one setting, so changing protocol is one command:

```text
git remote set-url origin git@github.com:user/repo.git
```

`git remote -v` then shows the new address on both lines. Nothing is downloaded and no commit changes; only the address your next fetch or push uses. The same command fixes a typo in a URL and follows a project that moved to a new server.

To keep the old address as well, give it a second name with `git remote rename origin old`, then add the new server with `git remote add origin <url>`. A repository can have as many remotes as you like.

### Ask for part of the list

| Command | Prints |
|---|---|
| `git ls-remote --heads origin` | Only branches |
| `git ls-remote --tags origin` | Only tags |
| `git ls-remote origin main` | Only refs named `main` |
| `git ls-remote --symref origin HEAD` | Which branch the server's `HEAD` names, the default branch |
| `git ls-remote https://github.com/git/git.git` | The refs of any repository you can reach, with no clone and no remote set up |

### See more when a connection fails

| Put this in front of the command | You see |
|---|---|
| `GIT_TRACE=1` | Every program Git starts, including the `ssh` command line |
| `GIT_TRACE_PACKET=1` | Every line of the conversation |
| `GIT_CURL_VERBOSE=1` | The web requests and replies, for HTTPS problems |
| `GIT_SSH_COMMAND="ssh -v"` | SSH's own account of which keys it tried |

Read the output before you paste it anywhere: `GIT_CURL_VERBOSE` can print sign-in data.

### Protocol version 2

The trace above starts with `version 2`. In the first version of the protocol, the server opened by listing every ref it had, which is slow for projects with hundreds of thousands of them. In version 2 the client first says what it is interested in. Git has used version 2 by default since 2.26. The want-and-have part is the same idea in both.

### Download less

A fetch normally brings whole history. For very large projects Git can leave things out: a shallow clone takes only the newest commits, and a partial clone leaves file contents on the server until they are needed. The lesson [Shallow and partial clone, sparse checkout, LFS, bundles, git maintenance](lesson:large-repos) covers them.

## Recap

- A remote is another copy of the repository; a server keeps it bare. The URL's start picks the protocol: a path, `https://`, or `git@host:` for SSH.
- HTTPS signs in with a token, SSH with a key pair. Both move the same data.
- Git transfers objects and ref updates, and only the ones the other side lacks.
- `git ls-remote origin` lists the server's branches and tags without downloading anything.
- A fetch adds commits and moves `origin/...`; it never changes your branch or files. Uncommitted work, stashes and settings never leave your computer.
