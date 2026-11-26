# Coverage: signing

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** why signatures exist, signing commits and tags, checking signatures, and the GitHub "Verified" badge. The book signs with GPG only; the lesson teaches the same Git commands and practises them with an SSH key (Git 2.34 and later), then shows the GPG setup. Practice uses a throwaway key in `../keys` and local settings only; nothing touches `~/.ssh`, global settings or a GitHub account.

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 7.4 Signing Your Work | GPG Introduction, Signing Tags, Verifying Tags, Signing Commits, Everyone Must Sign |
| Git reference: `git-config` | `gpg.format`, `user.signingKey`, `gpg.ssh.allowedSignersFile`, `commit.gpgSign`, `tag.gpgSign` |
| Git reference: `git-commit`, `git-tag`, `git-log` (pretty formats), `git-verify-commit`, `git-verify-tag`, `git-merge`, `git-rebase` | `-S`, `--no-gpg-sign`; `-s`, `-v`; `--show-signature`, `%G?`, `%GS`, `%GK`; `--verify-signatures`; `rebase -S` |
| GitHub Docs: About commit signature verification | Verified, Unverified and Partially verified; vigilant mode; SSH signing keys; GPG, SSH and S/MIME; commits signed by GitHub |

## Pro Git 7.4, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Git can sign and verify work, to check that commits come from a trusted source | Yes, starting from a real commit with a faked author line | Must know |
| You need GPG and a personal key: `gpg --list-keys`, `gpg --gen-key` | Yes, in "GPG, the book's way", with today's `--full-generate-key` and `--list-secret-keys --keyid-format=long` in a comparison | Must know |
| `git config --global user.signingkey <key ID>` | Yes, for GPG (key ID) and for SSH (path of the `.pub` file) | Must know |
| `git tag -s` in place of `-a` | Yes, with a Try-it | Must know |
| `git show` on a signed tag prints the signature block | Yes, with real SSH output | Must know |
| `git tag -v` verifies a tag; you need the signer's public key | Yes; the key comes from the allowed signers file (SSH) or the keyring (GPG) | Must know |
| Without the signer's public key the check fails | Yes: `No principal matched` (SSH, real output) and the book's `public key not found` (GPG, quoted) | Must know |
| `git commit -S` | Yes, with a predict block and a Try-it | Must know |
| `git log --show-signature` | Yes, read part by part | Must know |
| `git log --pretty="format:%h %G? %aN %s"` | Yes, with a table of the codes and what to do for each | Must know |
| `git merge --verify-signatures`, also for `git pull`; with `-S` to sign the merge | Yes, with real output | Advanced: rare in daily work, since teams enforce signing on the server |
| Everyone must sign: `git config --local commit.gpgsign true` | Yes, in "Sign every commit", with the book's warning | Must know |
| Understand the benefits before adopting signing | Yes: the table of key kinds and the note that many projects sign only release tags | Must know |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| The passphrase prompt in the book's output | The practice key has no passphrase, so the prompt cannot be shown as real output. The lesson says where the prompt appears | The lesson on the GitHub account and SSH keys (passphrases, `ssh-agent`) |
| Creating a real SSH key with `ssh-keygen` | A real key belongs in `~/.ssh`, which practice never touches | The lesson on the GitHub account and SSH keys |
| GPG output from this computer | Making a GPG key writes to the home folder (`~/.gnupg`). GPG's wording is quoted from Pro Git and marked as such | Not taught further |
| GPG trust levels, key servers, subkeys, expiry | A GPG course of its own; not needed to sign with Git | Not in the course |
| "Require signed commits" as a branch rule | Named in one sentence | The lesson on branch protection, rulesets and CODEOWNERS |

## Beyond the book

| Topic | Source |
|---|---|
| SSH signing: `gpg.format ssh`, `user.signingkey` as a file, `gpg.ssh.allowedSignersFile`, "principal" | Git reference `git-config`; real output of Git 2.55 |
| `tag.gpgSign`, `--no-gpg-sign`, `git verify-commit`, `git verify-tag`, `%GS`, `%GK`, the `U`, `B`, `E`, `X`, `Y`, `R` codes | Git reference `git-config`, `git-commit`, `git-verify-commit`, `git-log` |
| The `gpgsig` field of a commit object; what the signature covers; signing an existing commit by amending; `git rebase -S` | Git reference `git-commit`, `git-rebase`; shown with `git cat-file -p` |
| Verified, Unverified, Partially verified; signing keys on the account; vigilant mode; S/MIME; commits signed by GitHub | GitHub Docs, About commit signature verification |

## Console output

All output was produced with Git 2.55 and OpenSSH 10.3 in a scratch folder with a throwaway key, except the two GPG lines quoted from Pro Git in "GPG, the book's way". In "When it goes wrong", the first two command lines are shortened (the real runs used another message and set the wrong key path with `-c`), and one first-run line from GPG is cut from the first message; the rest is unchanged.
