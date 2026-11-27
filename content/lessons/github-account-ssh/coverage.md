# Coverage: github-account-ssh

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** getting from "no account" to "Git reaches GitHub without asking": the account and 2FA, HTTPS with a token through the GitHub CLI, credential helpers, and SSH keys with the agent. It is the first GitHub lesson, placed before `how-git-talks` and `remotes`, so it gives "remote", "push" and "authentication" a two-line meaning each and leaves the commands to those lessons.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 6.1 Account Setup and Configuration | Sign-up, the free-account note, SSH Access, Your Email Addresses, Two Factor Authentication |
| Pro Git 4.3 Generating Your SSH Public Key | Checking `~/.ssh`, `ssh-keygen`, the passphrase, `ssh-agent`, the `.pub` file |
| Pro Git 7.14 Credential Storage | The built-in helpers, `credential.helper`, helper options, several helpers, Under the Hood (`git credential`, the value forms, the `store` file) |
| GitHub Docs: Connecting to GitHub with SSH | Ed25519 as the recommended type, adding the key to the agent, "New SSH key", testing with `ssh -T`, GitHub's SSH key fingerprints, SSH over port 443 |
| GitHub Docs: GitHub CLI quickstart and manual | Installing `gh`, `gh auth login`, `gh auth status`, `gh auth setup-git`, `gh auth refresh / switch / logout / token`, `gh ssh-key add` |
| GitHub Docs: Authentication | Token authentication for Git over HTTPS (passwords removed), personal access tokens (fine-grained, classic), two-factor authentication and recovery codes, the no-reply commit email |
| Git reference: `git-config`, `git-remote`, `gitcredentials` | `credential.helper`, `core.sshCommand`, `git remote set-url` |

## Pro Git 6.1, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Create a free account: user name, email, password | Yes, in words | Must know |
| Verify the email GitHub sends | Yes | Must know |
| Free accounts have almost every feature | Yes | Must know |
| HTTPS works with "username and password" | Corrected: GitHub accepts only tokens from Git since 2021 | Must know (careful block), compare with GitHub Docs |
| Cloning public projects needs no account | No | See "Left out" |
| SSH remotes need a public key in the account settings | Yes, with today's menu names | Must know |
| Name each key so you can revoke the right one later | Yes | Must know |
| Your avatar | No | See "Left out" |
| GitHub maps commits to you by email address; add every address you use | Yes (use the same email as in Git) | Must know |
| Primary, verified and unverified addresses | No | See "Left out" |
| Two-factor authentication: what it is, where to turn it on | Yes, plus recovery codes | Must know |
| Code by app or by SMS | App named; SMS left out | Must know |

## Pro Git 4.3, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Keys live in `~/.ssh`; check for an existing pair first | Yes | Must know |
| The `.pub` file is the public key, the other the private key | Yes, twice (table, padlock picture), a predict block and a quiz question | Must know |
| `ssh-keygen` and its questions (file, passphrase) | Yes, with today's `-t ed25519` and a compare block for the book's RSA | Must know |
| The passphrase may be empty; a passphrase is safer | Yes | Must know |
| `ssh-agent` saves typing the passphrase | Yes, with `ssh-add` and `ssh-add -l` | Must know |
| Send the public key to the server's administrator; what a public key looks like | Yes, as "paste it into GitHub" | Must know |
| The `-o` option for the newer private key format | No | See "Left out" |

## Pro Git 7.14, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| SSH can work with no typing; HTTP needs a user name and password each time | Yes | Must know |
| Default: no caching | Yes | Must know (table) |
| `cache`: in memory, 15 minutes | Yes | Must know; `--timeout` in Advanced |
| `store`: plain text file, never expires, the cleartext downside | Yes: table, predict, careful block, a real file | Must know, Under the hood |
| `osxkeychain` on macOS | Yes | Must know (table) |
| Git Credential Manager on Windows | Yes | Must know |
| `git config --global credential.helper cache` | Yes | Must know |
| Helper options (`--file`, `--timeout`) | Yes | Under the hood, Advanced |
| Several helpers, asked in order | Yes | Advanced; the empty value that clears the list in Under the hood |
| `git credential fill` and the stdin protocol | The idea, and `git credential-store ... store` with its file | Under the hood |
| The forms of the `credential.helper` value (`foo`, with options, `!shell`) | Yes | Under the hood |
| `get`, `store`, `erase` actions | Named as "answers" and "offers to keep" only | Under the hood |
| Writing a custom helper in Ruby | No | See "Left out" |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| Cloning public projects without an account | Cloning has its own lesson | `start-a-repo`, `how-git-talks` |
| The avatar; primary and unverified addresses | Profile housekeeping, not needed to work | Not taught |
| 2FA codes by SMS | GitHub Docs recommend an app over SMS | Not taught |
| `ssh-keygen -o` | Today's OpenSSH writes the newer format by default | Not taught |
| The full `git credential` protocol and a custom Ruby helper | Rare; the three value forms are enough to read any setup | Not taught |
| `git fetch`, `git pull`, `git push` in depth, `-u` | The next lessons | `remotes`, `remote-branches` |
| What travels over HTTPS and SSH | The next lesson | `how-git-talks` |
| Signing commits with an SSH key | Its own lesson | `signing` |
| Leaked tokens and keys in a repository | Its own lesson | `remove-sensitive-data` |
| The rest of `gh` | Its own lesson | the lesson "The gh CLI, the API and webhooks" (`gh-cli-and-api`) |

## Beyond the book

- The GitHub CLI: install, `gh auth login`, `gh auth status`, `gh auth setup-git`, and what `setup-git` writes into `~/.gitconfig` (GitHub CLI manual; the block shown is real output, made with `GIT_CONFIG_GLOBAL` pointing at a scratch file).
- Account passwords are refused for Git; personal access tokens, fine-grained and classic (GitHub Docs).
- Ed25519 keys, `ssh-add -l`, `ssh -T git@github.com`, the first-connection fingerprint question, SSH on port 443 (GitHub Docs).
- `core.sshCommand` and `~/.ssh/config` for one key per repository or per server (Git reference, OpenSSH manual).
- Recovery codes for 2FA and the no-reply commit email (GitHub Docs).

## Where the console output comes from

- Real, from this lesson's scratch runs (Git 2.55, OpenSSH 10.3, gh 2.104): `ssh-keygen` (prompts and result), `cat` of the public key, `ssh-agent`, `ssh-add`, `ssh-add -l`, "Permission denied (publickey)", "Could not open a connection to your authentication agent", the host authenticity question with GitHub's Ed25519 fingerprint, `gh auth status` (signed in and signed out), the `gh auth setup-git` block, `git credential-store`, `git config --show-scope --get-all credential.helper`, "Invalid username or token", `git remote -v` and `set-url`, `core.sshCommand`.
- Changed by hand: the account name (`ada-lovelace`), home folder paths (`/c/Users/ada`), and the repository address in the "Authentication failed" example.
- From GitHub Docs, not run here (this computer has no SSH key on GitHub): the line "Hi ada-lovelace! You've successfully authenticated, but GitHub does not provide shell access." and OpenSSH's "Warning: Permanently added ..." line.
- The `gh auth login` questions are given as a table in words, not as output, because the login was not run.

## Challenges and quiz

- Easy, `pick-the-public-key` (local, answer): two key pairs beside the project, RSA and Ed25519; name the Ed25519 public key file. Read with `ssh-keygen -lf` or `cat`.
- Medium, `push-with-gh` (GitHub, practice repository `gitremastered-practice-github-account-ssh`): set `gh` as this repository's credential helper with `git config --local`, then push a new branch over HTTPS.
- Hard, `switch-to-ssh` (local): change `origin` from the HTTPS to the SSH address and set `core.sshCommand` to a throwaway key (both from Advanced). The host is `git.example.com`, a reserved name, so nothing can be pushed anywhere.
- No challenge touches `~/.ssh`, `--global` settings or account settings (decision 6). The throwaway keys are made by the setup in `../keys`, inside the challenge's workspace, and are deleted with it.
- The Try-its only read (`gh auth status`, `git config --get-all`), or make a throwaway key `../my-key` beside the project. The one Try-it step that changes the computer (installing and signing in to `gh`) says so.
- Quiz: password refused over HTTPS; which key file to hand out; a helper for a shared computer; the next check after "Permission denied (publickey)".
