---
id: github-account-ssh
title: "GitHub account, SSH keys, credentials"
module: remotes
bookSection: "6.1 Account Setup and Configuration"
bookUrl: https://git-scm.com/book/en/v2/GitHub-Account-Setup-and-Configuration
bookSources:
  - book/progit2/book/06-github/sections/1-setting-up-account.asc
  - book/progit2/book/04-git-server/sections/generating-ssh-key.asc
  - book/progit2/book/07-git-tools/sections/credentials.asc
readFirst: [setup]
---

Your first upload to GitHub can stop with "Authentication failed" or "Permission denied (publickey)", even though you typed your password correctly. GitHub does not take your account password from Git at all. This lesson sets up the two sign-ins it does take, a token over HTTPS and an SSH key, so that Git reaches GitHub without asking you anything.

## Must know

So far every commit you made stayed on your own computer. To share work, or simply to keep a second copy somewhere safe, you put a copy of the repository on a server. **GitHub** is the best-known such server: a website that keeps repositories and adds tools for working on them together.

Three words come up from here on. The next lessons teach each one properly; a short meaning is enough for now.

:::definitions
- term: Remote
  text: "A short name your repository keeps for the address of another copy of the project. The usual name is `origin`."
- term: Push
  text: "To upload your commits to a remote. `git push origin main` sends the branch `main` to the remote called `origin`."
- term: Authentication
  text: "Proving who you are to a server, so it can decide what you may do. Typing a password on a website is one form of it."
:::

A server cannot let just anyone change your project, so before a [push](term:push) GitHub asks: who are you? This lesson is about answering that question once, safely, and never typing the answer again.

One rule for the whole lesson: **the steps that create your account, your keys and your sign-in happen on your own computer, and you type them yourself.** The practice project on the right is for reading and trying. No Try-it and no challenge here changes your real keys or your computer-wide settings.

### Create your account

Go to github.com, choose a user name, give an email address and a password, and sign up. A free account is enough for everything in this course: Pro Git notes that GitHub offers almost all of its features on free accounts.

Three things to do right after signing up:

| Step | Why it matters |
|---|---|
| Open the email GitHub sends you and verify your address | Until you do, parts of GitHub stay locked |
| Use the same email in Git (`git config --global user.email`, from the lesson [Install, configure and get help](lesson:setup)) | GitHub connects a commit to your account by the email written inside the commit. With a different email, your commits show up without your name and picture |
| Turn on two-factor authentication | A stolen password alone can then no longer open your account |

[Two-factor authentication](term:two-factor-authentication), or **2FA**, means GitHub asks for two different proofs when you sign in on the website: your password, and a second thing only you have. The second proof is usually a six-digit code from an authenticator app on your phone; the code changes every 30 seconds. You find the setting in your account settings, under "Password and authentication".

:::careful
When you turn on 2FA, GitHub shows a list of **recovery codes**. Save them somewhere safe that is not your phone, such as a password manager. If you lose the phone and have no recovery codes, you can lose the account.
:::

### Two ways to sign in from Git: HTTPS and SSH

Your account works in the browser. Git does not use the browser: it talks to GitHub directly, in one of two ways. Which one it uses is decided by the address of the remote.

| | HTTPS | SSH |
|---|---|---|
| The address looks like | `https://github.com/ada-lovelace/trail-map.git` | `git@github.com:ada-lovelace/trail-map.git` |
| What it is | The same secure connection your browser uses | [SSH](term:ssh) stands for Secure Shell: a secure connection made for signing in to servers |
| You prove who you are with | Your user name and a **token**: a long generated password | A **key pair**: two matching files on your computer |
| First-time setup | One command with the GitHub CLI | Make a key, give GitHub the public half |
| Works on every network | Yes | Some office and school networks block it |

Both move exactly the same commits, and you can switch a repository from one to the other at any time. HTTPS is the quicker start, and it is what this app uses. Many developers use SSH for daily work. You will set up HTTPS first, then SSH.

:::careful
Your account password does not work from Git. GitHub turned that off in 2021, because a password typed into terminals and saved in files is easy to steal. Over HTTPS, the "password" Git sends is always a token.
:::

### The quick way: the GitHub CLI

Getting a token by hand takes many clicks. The [GitHub CLI](term:github-cli) does it for you. It is GitHub's own command-line program, called `gh`: where `git` works with repositories, `gh` works with your GitHub account.

`gh` is not part of Git, so install it once:

| System | Command |
|---|---|
| Windows | `winget install --id GitHub.cli` |
| macOS | `brew install gh` |
| Linux | See the install page in GitHub Docs for your distribution |

Then sign in. `gh auth login` asks a few questions and opens your browser, where you approve the sign-in:

| Question | Answer to choose |
|---|---|
| Where do you use GitHub? | GitHub.com |
| Preferred protocol for Git operations | HTTPS |
| Authenticate Git with your GitHub credentials? | Yes |
| How would you like to authenticate? | Login with a web browser |

`gh` prints a short one-time code, you type it on the page the browser opens, and you are signed in. No password and no token ever passes through your hands.

`gh auth status` shows whether it worked:

```console
$ gh auth status
github.com
  ✓ Logged in to github.com account ada-lovelace (keyring)
  - Active account: true
  - Git operations protocol: https
  - Token: gho_************************************
  - Token scopes: 'gist', 'read:org', 'repo'
```

Read it like this:

- **Logged in ... (keyring)**: `gh` holds a token for the account `ada-lovelace`, and keeps it in the keyring, your system's protected storage for passwords.
- **Token: gho_\*\*\***: the token itself, hidden. `gh` never prints it here.
- **Token scopes**: what the token may do. `repo` means it can read and write your repositories.

One more command tells Git to ask `gh` whenever GitHub wants a user name and password:

```console
$ gh auth setup-git
```

It prints nothing when it works. If you answered "Yes" to "Authenticate Git with your GitHub credentials?" during the login, this is already done; running it again does no harm.

:::sidenote
This is also how this app connects to GitHub. Under Settings, GitHub, the app runs `gh auth status` and shows "connected" when it succeeds. The app never sees or stores your token: it stays with `gh`.
:::

:::try-it
1. Run `gh auth status`. If you are signed in, `gh` prints your account name with a check mark. If you are not, it prints "You are not logged into any GitHub hosts. To log in, run: gh auth login". If the terminal says the command `gh` was not found, the GitHub CLI is not installed yet.
2. Not signed in? Do the three steps above now (install, `gh auth login`, `gh auth setup-git`), then run `gh auth status` again. This changes your computer on purpose, the same way setting your name did.
3. Look at the picture. Nothing moved: signing in changes nothing inside a repository.
:::

### Credential helpers: who remembers the token

`gh auth setup-git` worked through a part of Git worth knowing by name. A **credential** is a user name together with its password or token. A [credential helper](term:credential-helper) is a small program Git asks for credentials, so that you do not have to type them at every push.

Which helper Git uses is one setting, `credential.helper`:

```console
$ git config --show-scope --get-all credential.helper
system	manager
```

On this Windows computer the system level sets `manager`. That is **Git Credential Manager**, a helper that comes with Git for Windows and keeps credentials in the protected storage of Windows.

These are the helpers you will meet:

| `credential.helper` | Where the credential is kept | For how long | Worth using? |
|---|---|---|---|
| not set | Nowhere. Git asks at every connection | Never kept | No |
| `cache` | In memory only | 15 minutes, then forgotten | Fine on a shared or borrowed computer |
| `store` | In a plain text file, `~/.git-credentials` | Forever | No: see below |
| `osxkeychain` | The macOS keychain, encrypted | Until you remove it | Yes, on macOS |
| `manager` | Git Credential Manager: the system's protected storage | Until you remove it | Yes. It comes with Git for Windows |
| `!gh auth git-credential` | Git asks `gh`, which keeps the token in the keyring | While you are signed in to `gh` | Yes. This is what `gh auth setup-git` sets |

You choose one the way you choose any setting, for example `git config --global credential.helper cache`.

:::predict
question: "You set `credential.helper store` and push once. A week later someone borrows your laptop for a minute and opens the file `~/.git-credentials`. What do they see?"
answer: "Your token, readable, in a line like `https://ada:TOKEN@github.com`. `store` does not encrypt anything. Whoever reads that file can push as you until you revoke the token."
:::

:::careful
Avoid `store`. Pro Git names its downside plainly: the passwords sit in cleartext in a plain file in your home directory, and they never expire. Backups, a synced folder or one curious program can copy that file. `manager`, `osxkeychain` and `gh` keep the same secret encrypted by your system.
:::

:::try-it
1. Run `git config --show-scope --get-all credential.helper`. Git prints every helper it would ask, each with the level it comes from. This only reads. An empty answer means no helper is set at all.
2. If you ran `gh auth setup-git`, run `git config --global --get-all credential.https://github.com.helper`. Git prints an empty line and then a line ending in `gh auth git-credential`: for addresses on github.com, Git asks `gh`.
:::

### Tokens you make by hand

Sometimes no browser is at hand, for example for a script on a server. Then you make the token yourself. A [personal access token](term:personal-access-token) is a long password that GitHub generates for you, with two limits you choose: what it may do, and when it expires.

You create one on GitHub under Settings, Developer settings, Personal access tokens. Three rules:

- Give it only the permissions the job needs, and an expiry date.
- GitHub shows the token once. Paste it where Git asks for your password; a credential helper then keeps it.
- Treat it like a password. If it leaks, delete it on the same page: a deleted token stops working at once.

With `gh` on your own computer you rarely need this. It is good to know what a token is, because every HTTPS sign-in uses one underneath.

### SSH: a key pair instead of a token

HTTPS is working now. SSH signs in a different way, with no password and no token: with a [key pair](term:key-pair).

A key pair is two files made together:

| File | Name | What you do with it |
|---|---|---|
| The [private key](term:private-key) | `id_ed25519` | It never leaves your computer. Never send, paste or commit it |
| The [public key](term:public-key) | `id_ed25519.pub` | You hand it out. GitHub gets a copy |

Think of the public key as a padlock and the private key as its only key. You can give copies of the padlock to anyone. GitHub locks a small test with your padlock, and only the computer that holds the key can open it. That is the proof, and no secret travels over the network.

The common wrong idea is that the two files are interchangeable, or that the `.pub` file is a backup of the other. They are not: one is public by design, the other is the secret.

`ssh-keygen` makes a key pair. It comes with Git for Windows, macOS and Linux:

```console
$ ssh-keygen -t ed25519 -C "ada@example.com"
Generating public/private ed25519 key pair.
Enter file in which to save the key (/c/Users/ada/.ssh/id_ed25519):
Enter passphrase for "/c/Users/ada/.ssh/id_ed25519" (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /c/Users/ada/.ssh/id_ed25519
Your public key has been saved in /c/Users/ada/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:DBB/zluMK48sKl3qfvZgphww20wtb+KNScyq05pZsPE ada@example.com
```

(Shortened: a small picture made of characters follows, which you can ignore.)

- `-t ed25519` picks the type of key. Ed25519 is today's standard: short, fast and strong. GitHub Docs recommend it.
- `-C "ada@example.com"` is a comment, stored in the public key so you can tell your keys apart. An email or "work laptop" both do.
- **Enter file**: press Enter to accept `~/.ssh/id_ed25519`, the place SSH looks in by itself. `~/.ssh` is a folder named `.ssh` in your home folder.
- **Enter passphrase**: a [passphrase](term:passphrase) is a password that locks the private key file. If someone copies the file, it is useless to them without the passphrase. Choose one.
- **The key fingerprint**: a [fingerprint](term:key-fingerprint) is a short checksum of the key. Two keys are the same key exactly when their fingerprints match, so it is how you compare a key on your computer with one listed on GitHub.

:::compare
today: "`ssh-keygen -t ed25519 -C \"you@example.com\"` makes an Ed25519 key in `~/.ssh/id_ed25519`."
book: "Pro Git shows `ssh-keygen -o`, which made an RSA key in `~/.ssh/id_rsa`. RSA keys still work on GitHub; the oldest type in the book's listing, DSA (`id_dsa`), no longer does."
:::

Before you make a key, check whether you already have one, as Pro Git advises: `ls ~/.ssh`. A pair such as `id_ed25519` and `id_ed25519.pub` means you can skip `ssh-keygen` and reuse it.

The public key is one line of text:

```console
$ cat ~/.ssh/id_ed25519.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIElHT+JUSkY5PuPXz7npXftC7hV7Jj9OfKjiIB5fDhw2 ada@example.com
```

It has three parts: the type, the key itself, and your comment.

:::predict
question: "ssh-keygen made `my-key` and `my-key.pub`. Which file's content goes into GitHub? And what should you do if you pasted the other one somewhere by mistake?"
answer: "`my-key.pub`, the public key. The file without `.pub` is the private key: if it was ever pasted or sent anywhere, treat it as stolen. Delete that key from GitHub and make a new pair."
:::

Try it with a throwaway key. The option `-f` chooses the file, so this key lands beside the practice project and not in your real `~/.ssh`:

:::try-it
1. Run `ssh-keygen -t ed25519 -C "practice key" -f ../my-key`. `ssh-keygen` asks for a passphrase twice; press Enter both times, because this key protects nothing. It then prints where the two files were saved and the key's fingerprint. The picture does not change: the files are outside the project folder.
2. Run `ls ..`. Among the folders you see two new files, `my-key` and `my-key.pub`: the private key and the public key.
3. Run `cat ../my-key.pub`. One line appears: `ssh-ed25519`, a long run of letters, then `practice key`.
4. Run `ssh-keygen -lf ../my-key.pub`. The option `-l` lists the fingerprint of the key in the file `-f` names. The line reads `256`, then `SHA256:` and the fingerprint, then your comment, then the type `(ED25519)`.
:::

### The SSH agent: type the passphrase once

A passphrase protects the key, and it also brings a new problem: SSH would ask for it at every push. The [SSH agent](term:ssh-agent) solves that. It is a small program that runs in the background and holds your unlocked key in memory, so you type the passphrase once.

```console
$ eval "$(ssh-agent -s)"
Agent pid 87362
$ ssh-add ~/.ssh/id_ed25519
Identity added: /c/Users/ada/.ssh/id_ed25519 (ada@example.com)
$ ssh-add -l
256 SHA256:DBB/zluMK48sKl3qfvZgphww20wtb+KNScyq05pZsPE ada@example.com (ED25519)
```

- `eval "$(ssh-agent -s)"` starts the agent and tells this terminal how to reach it. `pid` is the number your system gave the running program.
- `ssh-add` hands the agent a key. It asks for the passphrase here, this one time.
- `ssh-add -l` lists the keys the agent holds, as fingerprints.

An agent started this way lives as long as that terminal window. GitHub Docs describe how to start it automatically on each system; on macOS, `ssh-add --apple-use-keychain` also saves the passphrase in the keychain.

### Give GitHub the public key, then test

GitHub cannot know your key until you add its public half to your account.

1. Copy the public key: `clip < ~/.ssh/id_ed25519.pub` on Windows, `pbcopy < ~/.ssh/id_ed25519.pub` on macOS, or print it with `cat` and copy the line.
2. On GitHub, open Settings, then "SSH and GPG keys", and press "New SSH key".
3. Give it a title you will recognise, such as "Work laptop", and paste the line into the key field. Pro Git's advice: name each key after its computer, so that when a laptop is lost you know which key to delete.
4. Press "Add SSH key".

Then test the connection. `ssh -T git@github.com` signs in to GitHub over SSH and does nothing else:

```console
$ ssh -T git@github.com
The authenticity of host 'github.com (140.82.121.4)' can't be established.
ED25519 key fingerprint is: SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'github.com' (ED25519) to the list of known hosts.
Hi ada-lovelace! You've successfully authenticated, but GitHub does not provide shell access.
```

- The question appears only the first time. Your computer has never talked to this server, so SSH shows the server's own fingerprint and asks whether to trust it. Compare it with the fingerprint GitHub publishes in its documentation (the one above is GitHub's Ed25519 fingerprint), then type `yes`.
- **Permanently added** means SSH wrote that fingerprint into its list of trusted servers, so it will not ask again.
- **Hi ada-lovelace!** is success: GitHub recognised your key and knows which account it belongs to. "Does not provide shell access" is normal. GitHub lets you use Git over SSH, not a terminal on its servers.
- The user is always `git`, never your own user name. GitHub tells people apart by their key.

### When it goes wrong

Two messages cover almost every sign-in problem. Neither can damage anything: a refused connection transfers nothing.

```console
$ ssh -T git@github.com
git@github.com: Permission denied (publickey).
```

GitHub was offered no key it knows. Check three things in order: is the remote's address the SSH form you meant (`git remote -v`); does the agent hold your key (`ssh-add -l`); is the same fingerprint listed in your account under "SSH and GPG keys" (`ssh-keygen -lf ~/.ssh/id_ed25519.pub` prints yours).

```console
$ git push origin main
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/ada-lovelace/trail-map.git/'
```

Over HTTPS, GitHub refused what Git sent: an account password, or a token that expired or was deleted. Run `gh auth status`; if it reports a problem, run `gh auth login` again, then `gh auth setup-git`.

```console
$ ssh-add -l
Could not open a connection to your authentication agent.
```

No agent is running in this terminal. Start one with `eval "$(ssh-agent -s)"`, then add your key with `ssh-add`.

## Under the hood

"Must know" treated the credential helper and the SSH key as boxes that just work. This layer opens both: what Git says to a helper, where `store` and `gh` put things, and why a private key never has to leave your computer.

### What Git says to a helper

When GitHub asks for a sign-in over HTTPS, Git starts the helper program and sends it a few lines: the protocol and the host. The helper answers with a user name and a password, or with nothing. If it answers nothing, Git asks you, and afterwards offers the helper what you typed so it can keep it.

The helper `store` is simple enough to watch. This saves a made-up credential into a file in the current folder and prints the file:

```console
$ printf 'protocol=https\nhost=git.example.com\nusername=ada\npassword=s3cre7\n' | git credential-store --file ./demo-credentials store
$ cat demo-credentials
https://ada:s3cre7@git.example.com
```

One readable line per server, with the password in it. This is the whole reason `store` is risky: its storage is a text file.

The value of `credential.helper` decides which program runs. Pro Git gives the rules:

| Value | Git runs |
|---|---|
| `cache` | The program `git-credential-cache` |
| `store --file ~/.my-credentials` | `git-credential-store`, with that option |
| `!gh auth git-credential` | Whatever follows the `!`, as a shell command |

So any program that speaks those few lines can be a helper. `gh auth git-credential` is one: it answers with the token `gh` keeps in the keyring.

### What `gh auth setup-git` writes

The command only edits your global settings file. Afterwards `~/.gitconfig` holds a block like this (the path is where `gh` is installed on your computer):

```console
$ cat ~/.gitconfig
[credential "https://github.com"]
	helper = 
	helper = !'C:\\Users\\ada\\AppData\\Local\\Programs\\GitHubCLI\\bin\\gh.exe' auth git-credential
```

- `[credential "https://github.com"]` limits the block to addresses that start with `https://github.com`. Other servers keep their own helper.
- The **empty** `helper =` line clears the list of helpers collected so far, such as `manager` from the system level. Without it Git would ask the older helper first.
- The second line is the `!` form from the table: run `gh auth git-credential`.

### Why the private key never travels

When you connect over SSH, GitHub sends your computer a random piece of data. Your computer signs it with the private key and sends back only the signature. GitHub checks the signature against the public keys in its accounts. A match proves you hold the private key, and tells GitHub which account it belongs to. That is why you connect as `git` and never type a user name.

Someone who listens in sees a signature for one random message. It is useless for the next connection, and the private key cannot be worked out from it.

### Where SSH keeps its files

| File in `~/.ssh` | What it holds |
|---|---|
| `id_ed25519` | Your private key. If you chose a passphrase, the file is encrypted with it |
| `id_ed25519.pub` | Your public key |
| `known_hosts` | The fingerprints of servers you answered `yes` to. SSH warns loudly if a server's fingerprint ever changes |
| `config` | Optional: your own settings per server |

## Advanced

The setup above is all most people ever need. These topics are for a second account, a stricter network or a computer you share.

### Switch a repository between HTTPS and SSH

The remote's address is one setting of the repository, so changing the protocol is one command. `git remote set-url` replaces the address:

```console
$ git remote -v
origin	https://git.example.com/trail-team/trail-map.git (fetch)
origin	https://git.example.com/trail-team/trail-map.git (push)
$ git remote set-url origin git@git.example.com:trail-team/trail-map.git
$ git remote -v
origin	git@git.example.com:trail-team/trail-map.git (fetch)
origin	git@git.example.com:trail-team/trail-map.git (push)
```

To turn one form into the other, keep the host and the path and change what stands around them:

| | HTTPS | SSH |
|---|---|---|
| Start | `https://` | `git@` |
| Between host and path | `/` | `:` |
| Example | `https://git.example.com/trail-team/trail-map.git` | `git@git.example.com:trail-team/trail-map.git` |

No commit moves and nothing is downloaded. Only the address of the next fetch or push changes, and with it the way you sign in.

### One key for one repository

SSH normally offers the keys in `~/.ssh` and in the agent. To make one repository use one particular key, set `core.sshCommand` in that repository. It replaces the `ssh` command Git runs:

```console
$ git config core.sshCommand "ssh -i ../keys/deploy -o IdentitiesOnly=yes"
$ git config core.sshCommand
ssh -i ../keys/deploy -o IdentitiesOnly=yes
```

- `-i` names the private key file to use (i for identity). In real work, give its full path.
- `-o IdentitiesOnly=yes` tells SSH to offer that key only, not every key the agent holds.

This is the usual answer to "I have a personal and a work account on the same computer": each repository names its own key, because GitHub accepts a key on one account only.

### The same per server: `~/.ssh/config`

When many repositories need the same key, write it once in `~/.ssh/config`:

```text
Host github.com
  IdentityFile ~/.ssh/id_ed25519
  AddKeysToAgent yes
```

`AddKeysToAgent yes` puts the key into the agent the first time you use it, so you never run `ssh-add` by hand.

### More than one helper, and a longer cache

Pro Git shows that `credential.helper` may hold several values. Git asks each helper in order and stops at the first answer. The `cache` helper takes a time in seconds: `git config --global credential.helper "cache --timeout 3600"` remembers for an hour, and `git credential-cache exit` makes it forget at once.

### Two kinds of personal access token

GitHub offers **fine-grained** tokens, limited to chosen repositories and chosen permissions, and **classic** tokens, which use broad scopes such as `repo`. Prefer fine-grained ones when a tool supports them: a leaked token can then do less.

### More from `gh auth`

| Command | What it does |
|---|---|
| `gh auth refresh -s <scope>` | Asks GitHub for one more permission on your token, through the browser |
| `gh auth switch` | Changes the active account when you signed in to more than one |
| `gh auth logout` | Signs out and removes the token from the keyring |
| `gh auth token` | Prints the token. Handy in a script, dangerous on a shared screen |
| `gh ssh-key add ~/.ssh/id_ed25519.pub --title "Work laptop"` | Adds a public key to your account without the website (needs the scope `admin:public_key`) |

### Keep your email private

GitHub can give you a no-reply address to use in commits, so your real email is not public in every project's history. Turn on "Keep my email addresses private" in your email settings and set `user.email` to the address shown there. Commits still link to your account.

### SSH on a network that blocks it

SSH normally uses port 22, which some networks close. GitHub also accepts SSH on port 443, the port of HTTPS, at the host `ssh.github.com`. GitHub Docs show the two lines for `~/.ssh/config`. The simpler way out is often to switch that repository to HTTPS.

## Recap

- GitHub never takes your account password from Git. Over HTTPS you sign in with a token; over SSH with a key pair. Turn on 2FA for the website.
- `gh auth login`, then `gh auth setup-git`, sets up HTTPS in a minute. `gh auth status` shows whether you are signed in. This app connects the same way and stores no token.
- A credential helper (`credential.helper`) remembers the token. Use `manager`, `osxkeychain` or `gh`; avoid `store`, which writes it to a plain text file.
- `ssh-keygen -t ed25519 -C "you@example.com"` makes a key pair. The `.pub` file goes to GitHub; the private key never leaves your computer. `ssh-add` gives it to the agent, and `ssh -T git@github.com` tests the sign-in.
- The remote's address picks the protocol: `https://host/path` or `git@host:path`. `git remote set-url` switches between them.
