---
id: signing
title: "Sign commits and tags (GPG and SSH)"
module: make-git-yours
bookSection: "7.4 Signing Your Work"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work
bookSources:
  - vendor/progit2/book/07-git-tools/sections/signing.asc
readFirst: [tags-and-releases]
---

Anyone can make a commit that carries your name and email: Git never checks them. A signature is the proof that a commit or a tag really came from you, and this lesson shows how to sign your work, how to check other people's signatures, and how to get the "Verified" badge on GitHub.

## Must know

Every commit has an author line, and you have trusted it since your first `git log`. That trust has a hole. The name and email come from two [settings](term:config), `user.name` and `user.email`, and those are plain text that anyone can type.

Here is a commit made on a practice computer by somebody who is not Linus Torvalds, the author of Git. The `-c` option sets a setting for one command only:

```console
$ git -c user.name="Linus Torvalds" -c user.email="torvalds@linux-foundation.org" commit -q -am "Speed up search"
$ git log -1
commit dce5348f10afad2ccac59e2d76eab33e074e9ed7
Author: Linus Torvalds <torvalds@linux-foundation.org>
Date:   Fri Nov 27 01:13:13 2026 +0300

    Speed up search
```

Git accepted it without a question, and a server would accept the push too. For a hobby project that hardly matters. For a project where people review "who changed the payment code?", it matters a lot.

### What a signature is

So the author line cannot prove who made a commit. A signature can, because it is made with something only you have.

Signing uses a **key pair**: two matching files that a program creates together.

:::definitions
- term: private key
  text: "The secret half. It stays on your computer and you never share it. Only this key can make your signatures."
- term: public key
  text: "The half you hand out. With it, anyone can check that a signature was made by the matching private key. It cannot make signatures."
- term: signature
  text: "A block of text, computed from the commit's content and your private key, that Git stores inside the commit. Change one letter of the commit, or sign with another key, and the check fails."
:::

A paper signature works on trust that nobody can copy your handwriting. A key pair is stronger: a signature cannot be made without the private key, and the public key shows that to everyone.

A signed commit therefore answers two questions the author line cannot: **who** made it (the holder of that key), and **was it changed** since.

### Two kinds of key: GPG and SSH

A key pair has to come from somewhere. Git can sign with two kinds, and you choose one.

| | GPG key | SSH key |
|---|---|---|
| What it is | A key made by GPG (GNU Privacy Guard), a free program for encrypting and signing | The kind of key you log in to servers and to GitHub with, instead of a password |
| Since | Git 1.7.9 for commits; it is the only kind Pro Git shows | Git 2.34 (2021) |
| You need | The `gpg` program and a key made with it | An SSH key. If you push to GitHub over SSH, you already have one |
| Good for | Teams that already use GPG; keys that expire and carry your name | Everyone else: one key, nothing new to learn |

The Git commands are the same for both: `git commit -S`, `git tag -s`, `git log --show-signature`. Only the setup differs. This lesson practises with SSH, today's easy path, and then shows the GPG setup the book uses.

### The practice project

The practice project on the right is a small notes app with two commits. Neither is signed. Beside the project, in a folder named `../keys`, the lesson made a throwaway SSH key pair for you:

```console
$ ls ../keys
allowed_signers
practice
practice.pub
```

- `practice` is the private key. A real one lives in `~/.ssh` and is protected by a passphrase (a password for the key file). This one has none, which is acceptable only because it is a toy.
- `practice.pub` is the public key: one line of text.
- `allowed_signers` is a list of trusted keys. It gets its own part below.

Everything in this lesson's practice uses these files and the repository's own settings. Your real keys in `~/.ssh` and your global settings are never touched.

### Set it up

Git needs two settings before it can sign with an SSH key, and a third before it can check a signature.

| Setting | Value here | What it tells Git |
|---|---|---|
| `gpg.format` | `ssh` | Which kind of signature to make. Without it Git assumes GPG. The setting's name starts with `gpg` for historical reasons, even when the value is `ssh` |
| `user.signingkey` | `../keys/practice.pub` | Which key is yours. You name the public key file; Git finds the private key next to it |
| `gpg.ssh.allowedSignersFile` | `../keys/allowed_signers` | The list of keys to trust when checking a signature |

The practice project has all three already. Look at them:

:::try-it
1. Run `git config --local --list`. Among the lines Git prints are `gpg.format=ssh`, `user.signingkey=../keys/practice.pub` and `gpg.ssh.allowedsignersfile=../keys/allowed_signers`. You also see `commit.gpgsign=false`: signing is set up, but Git signs nothing until you ask.
2. Run `cat ../keys/practice.pub`. Git Bash prints one long line: the key type `ssh-ed25519`, the key itself, and a comment, "practice signing key". This line is safe to share.
3. Run `git log --format="%h %G? %s"`. Git lists both commits with the letter `N` after the ID. `N` means "no signature"; the codes are explained below.
:::

On your own computer you set this up once, for all repositories, with `--global`. Do that later, with your real key, and not in the practice terminal:

```console
$ git config --global gpg.format ssh
$ git config --global user.signingkey ~/.ssh/id_ed25519.pub
```

The lesson about your GitHub account and SSH keys shows how to make that key with `ssh-keygen`.

### Sign a commit

With the settings in place, signing is one option.

`git commit -S` makes the commit as always and adds your signature to it. The `-S` is a capital letter; a small `-s` does something else (it adds a "Signed-off-by" line of text, which proves nothing).

```console
$ git add todo.txt
$ git commit -S -m "Add todo list"
[main 9e12e61] Add todo list
 1 file changed, 1 insertion(+)
 create mode 100644 todo.txt
```

The output looks like any commit. Git says nothing about the signature when it works. If your key has a passphrase, this is where you are asked for it.

:::predict
question: "You commit with -S, then run plain `git log`. Where does the signature show?"
answer: "Nowhere. Plain `git log` prints the same four lines as for any commit. Signatures are checked and shown only when you ask, with `--show-signature` or the `%G?` code."
:::

Practise on a file of your own, so `CHANGELOG.md` stays uncommitted for the first challenge.

:::try-it
1. Run `echo "Buy milk" > todo.txt`, then `git add todo.txt`. In the picture, the `todo.txt` sheet moves into the staging area.
2. Run `git commit -S -m "Add todo list"`. Git prints the usual summary. In the picture, a new station appears on the history map, and the `branch main` tag and the `HEAD · you` pin move onto it. The picture does not mark signatures; you read those in the terminal.
3. Run `git log -1`. Git shows the commit with its author and date, and no sign of a signature.
4. Run `git log --show-signature -1`. Now a new second line starts with `Good "git" signature`. The next part explains how to read it.
:::

### Check signatures

A signature is worth something only when somebody checks it. Git has three ways, from a full report to one letter.

**`git log --show-signature`** checks the signature of every commit it lists and prints the result under the `commit` line:

```console
$ git log --show-signature -1
commit 9e12e61e36222911bc752406623ff53c85f01e06
Good "git" signature for student@example.com with ED25519 key SHA256:vtoDfjZqhYJRicAOjfUek8W3ABSKC4/MgGs8Hz/ewlc
Author: Practice Student <student@example.com>
Date:   Fri Nov 27 01:12:53 2026 +0300

    Add todo list
```

Read the new line in three parts:

- `Good "git" signature`: the signature matches the commit's content. Nothing was changed after signing.
- `for student@example.com`: the name the allowed signers file gives to this key. It comes from that file, not from the author line.
- `with ED25519 key SHA256:vtoD…`: the kind of key, and its **fingerprint**, a short code computed from the public key. Two keys never share a fingerprint, so people compare fingerprints instead of whole keys.

**`%G?`** in a `--format` gives the result as one letter per commit. Use it to scan a long history:

```console
$ git log --format="%h %G? %an  %s"
9e12e61 G Practice Student  Add todo list
9b36bdb N Practice Student  Add search page
03f03b2 N Practice Student  Add README
```

| Code | Means | What to do |
|---|---|---|
| `G` | Good: the signature is valid and the key is one you trust | Nothing. This is the goal |
| `N` | No signature | Normal for most commits in most projects. A problem only where the team requires signing |
| `U` | A valid signature from a key you have no entry for | Find out whose key it is. If it is a teammate's, add it to your allowed signers file |
| `B` | Bad: the content does not match the signature | Stop and ask. The commit was changed after signing, or was not signed by the key it claims |
| `E` | The signature cannot be checked, for example because a needed key is missing | Fix your setup, then look again |

With GPG keys you may also meet `X` and `Y` (a good signature that has expired, or whose key has expired) and `R` (a key that was revoked, meaning its owner declared it no longer valid).

**`git verify-commit <commit>`** checks one commit and answers through its result as well: scripts use it. For a good signature it prints the same `Good` line:

```console
$ git verify-commit HEAD
Good "git" signature for student@example.com with ED25519 key SHA256:vtoDfjZqhYJRicAOjfUek8W3ABSKC4/MgGs8Hz/ewlc
```

For an unsigned commit, such as `git verify-commit HEAD~1` here, it prints nothing and reports failure to the script that called it.

:::try-it
1. Run `git log --format="%h %G? %s"`. Your new commit "Add todo list" has a `G`; the two older commits still have `N`.
2. Run `git verify-commit HEAD`. Git prints the `Good "git" signature` line for your commit.
3. Run `git verify-commit HEAD~1` (the commit before the newest). Git prints nothing: "Add search page" has no signature to check.
:::

### The allowed signers file

One question is still open: how did Git decide the practice key can be trusted?

A valid signature proves that *some* key signed the commit. It does not say whose key that is. For SSH signatures, you tell Git with a text file, the **allowed signers file**: one line per person, an email and then that person's public key.

```console
$ cat ../keys/allowed_signers
student@example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGJED1ZVzvy/H9+REHswITGwgmz3CGytkLHtuLkqo7WS practice signing key
```

The setting `gpg.ssh.allowedSignersFile` points Git at the file. Each line is the email followed by the whole content of a `.pub` file, so you can build a line with two commands you know:

```console
$ echo "$(git config user.email) $(cat ../keys/practice.pub)" > ../keys/allowed_signers
```

`$(…)` runs the command inside and puts its output in that place.

A commit signed by a key that is not in the file gets a `U`, and the report says so:

```console
$ git log --show-signature -1
commit 511bb9df1a8fd6ae9b7da2ec47439a1774d8a1d8
Good "git" signature with ED25519 key SHA256:jtDAnqTzLwfXhjfLXtDtTXskNxREf28aal/mJx7mKrs
No principal matched.
Author: Practice Student <student@example.com>
Date:   Fri Nov 27 01:13:16 2026 +0300

    Signed by a stranger
```

"Principal" is SSH's word for the person a key belongs to. `No principal matched` means: the signature is valid, but no line of your file has this key.

:::careful
`Good signature` alone is not enough. Look for the name after `for`. The author line of the commit above says "Practice Student", and the signature still comes from a key nobody listed. Anyone can make a key and sign with it; only the allowed signers file ties a key to a person.
:::

On a team, the file usually lives in the repository itself, so everyone trusts the same list of keys.

### Sign every commit

Typing `-S` every time is easy to forget, and a team that requires signatures will reject the commit you forgot.

`commit.gpgSign` set to `true` makes Git sign every commit it creates, with no `-S`. `tag.gpgSign` does the same for tags.

```console
$ git config --local commit.gpgSign true
$ git config --local tag.gpgSign true
```

Pro Git's advice for a team that signs: have everyone run `git config --local commit.gpgSign true` in the repository. Otherwise you will spend your time helping people replace unsigned commits with signed ones.

To skip the signature for one commit, add `--no-gpg-sign`.

:::careful
With `tag.gpgSign` on, plain `git tag v1.0` no longer makes a lightweight tag. A signature needs a place to live, so Git makes a signed tag and asks for a message. Give one with `-m`.
:::

### Sign a tag

Commits say who wrote each change. A release needs the same proof: that `v1.0` is the version the maintainers published, and not one somebody swapped in.

`git tag -s v1.0 -m "Version 1.0"` makes an [annotated tag](term:annotated-tag) and signs it. It is the `git tag -a` you know from [Tags: mark a release](lesson:tags-and-releases), with `-s` in place of `-a`.

```console
$ git tag -s v0.9 -m "Version 0.9"
$ git show -s v0.9
tag v0.9
Tagger: Practice Student <student@example.com>
Date:   Fri Nov 27 01:12:55 2026 +0300

Version 0.9
-----BEGIN SSH SIGNATURE-----
U1NIU0lHAAAAAQAAADMAAAALc3NoLWVkMjU1MTkAAAAgYkQPVlXO/L8f35EQezAhMbCCbP
cIbK2Qse24uSqjtZIAAAADZ2l0AAAAAAAAAAZzaGE1MTIAAABTAAAAC3NzaC1lZDI1NTE5
AAAAQDbt2AnQPwW5ztrPXqixuDJruwKBczx7FHyrnB6cm18R1wRhvP3Wm2ssrllXl7fetP
J7QFfSd4AOTzsRXjVQZA0=
-----END SSH SIGNATURE-----

commit 9e12e61e36222911bc752406623ff53c85f01e06
Author: Practice Student <student@example.com>
Date:   Fri Nov 27 01:12:53 2026 +0300

    Add todo list
```

The signature is the block between the `BEGIN` and `END` lines, right after the tag's message. (`-s` on `git show` hides the diff. The same letter means something different in each command.)

To check a tag, use `git tag -v <tagname>`. It prints the result and then the tag's record:

```console
$ git tag -v v0.9
Good "git" signature for student@example.com with ED25519 key SHA256:vtoDfjZqhYJRicAOjfUek8W3ABSKC4/MgGs8Hz/ewlc
object 9e12e61e36222911bc752406623ff53c85f01e06
type commit
tag v0.9
tagger Practice Student <student@example.com> 1795731175 +0300

Version 0.9
```

`git verify-tag v0.9` prints the `Good` line alone; it is the tag twin of `git verify-commit`. A tag without a signature gives `error: no signature found`.

A signed tag covers more than one commit. The tag names a commit by its ID, and that ID depends on the whole history before it. One good signature on `v1.0` therefore vouches for every file of the release. Many projects sign only their release tags for this reason.

:::try-it
1. Run `git tag -s v0.9 -m "Version 0.9"`. Git prints nothing. In the picture, a `tag v0.9` label appears on the newest station.
2. Run `git tag -v v0.9`. The first line reads `Good "git" signature for` and your email; below it is the tag's record with your message.
3. Run `git tag -a unsigned -m "No signature"`, then `git tag -v unsigned`. Git prints the record and ends with `error: no signature found`: `-a` made an annotated tag, and only `-s` signs it.
:::

### GPG, the book's way

Everything so far used an SSH key. Pro Git signs with GPG, and many older projects do too. The commands you learned stay the same; three things differ.

1. **Make a key** with the `gpg` program (it comes with Git for Windows), and list it to find its ID:

   ```console
   $ gpg --full-generate-key
   $ gpg --list-secret-keys --keyid-format=long
   ```

   The first command asks for a key type, your name and email, and a passphrase. In the second command's output, the key ID is the code after the `/` on the line that starts with `sec`.

2. **Tell Git the key ID**, in place of a file path. `gpg.format` needs no setting, because GPG is what Git assumes (its value is then `openpgp`, the name of GPG's signature format):

   ```console
   $ git config --global user.signingkey 0A46826A
   ```

   `0A46826A` is the key ID in Pro Git's example.

3. **No allowed signers file.** GPG keeps its own collection of other people's public keys, called a keyring. To check a teammate's signature you import their public key into your keyring with `gpg --import`.

The report differs in wording too. Where SSH says `Good "git" signature for…`, Pro Git's GPG example reads `gpg: Good signature from "Scott Chacon (Git signing key) <schacon@gmail.com>"`. When the signer's key is missing from your keyring, GPG says `Can't check signature: public key not found`.

:::compare
today: "`gpg --full-generate-key` makes a key, and `gpg --list-secret-keys --keyid-format=long` shows its ID. Or skip GPG: set `gpg.format` to `ssh` and sign with an SSH key."
book: "`gpg --gen-key` and `gpg --list-keys`. Both still work. Pro Git was written before Git could sign with SSH keys, so it shows GPG only."
:::

### The "Verified" badge on GitHub

Your signatures now check out on your computer. On GitHub they show up as a small badge next to the commit, and that is where most people meet signing for the first time.

GitHub checks the signature of every commit and tag pushed to it, and shows one of these:

| Badge | Means |
|---|---|
| **Verified** | The signature is valid, the key is on the account of the person named as committer, and the commit's email is one of that account's verified emails |
| **Unverified** | There is a signature, but GitHub cannot match it: the key is on no account, or the email does not fit |
| No badge | The commit is not signed |

For the Verified badge, GitHub must have your public key. Your allowed signers file does this job on your computer; your account settings do it on GitHub. You do this once, on your own account, when you start signing for real:

1. On GitHub, open **Settings**, then **SSH and GPG keys**.
2. Choose **New SSH key**, and set **Key type** to **Signing Key**.
3. Paste the content of your `.pub` file and save.

A key you already use to log in must be added a second time as a signing key: GitHub keeps the two lists apart. A GPG key goes into the same page, under **New GPG key**.

The challenges of this lesson never touch your GitHub account. They use the practice key only, and that key should never be uploaded anywhere.

**Vigilant mode.** By default, an unsigned commit with your name on it shows no badge at all, so a fake one looks like any ordinary commit. In the same settings page, the box **Flag unsigned commits as unverified** turns on vigilant mode. From then on, every commit that names you and is not signed by you gets an **Unverified** badge. Turn it on only once you sign everything, or your own unsigned commits will be flagged too.

### When it goes wrong

Three messages you will meet while setting up:

```console
$ git commit -S -m "try"
error: gpg failed to sign the data:
gpg: skipped "Practice Student <student@example.com>": No secret key
[GNUPG:] INV_SGNR 9 Practice Student <student@example.com>
[GNUPG:] FAILURE sign 17
gpg: signing failed: No secret key

fatal: failed to write commit object
```

Git tried to sign with GPG, and GPG has no key for you. (The first time, GPG may also print that it created its own folder, `.gnupg`, in your home folder. That is harmless.) If you meant to sign with an SSH key, `gpg.format` is not set: run `git config --local gpg.format ssh` (or `--global` on your own computer). No commit was made; your staged changes are still staged.

```console
$ git commit -S -m "try"
error: Couldn't load public key ../keys/nope.pub: No such file or directory?

fatal: failed to write commit object
```

`user.signingkey` names a file that is not there. Check the path with `git config user.signingkey` and `ls`. A similar message, `fatal: either user.signingkey or gpg.ssh.defaultKeyCommand needs to be configured`, means the setting is missing altogether.

```console
$ git log --format="%h %G? %s"
error: gpg.ssh.allowedSignersFile needs to be configured and exist for ssh signature verification
fa51a48 N Add a (signed)
6f56cc3 N Add README
```

The commit is signed, but Git has no allowed signers file, so it cannot check anything and reports `N`. Create the file and set `gpg.ssh.allowedSignersFile`, as shown above. The signature was there all along: once the file exists, the same commit shows `G`.

## Under the hood

"Must know" treated a signature as something attached to a commit. This layer shows where Git stores it and what exactly it covers, which explains why an old commit cannot simply be signed afterwards.

### Where the signature lives

A commit is an [object](term:object): a small text file inside `.git`. `git cat-file -p` prints one. Here is the signed commit from the Try-it:

```console
$ git cat-file -p HEAD
tree f78987a2083d8170c7ceb6f38b72a92fcf291fe7
parent 9b36bdb94f46102b0b72e092dba9bf7a578d94c0
author Practice Student <student@example.com> 1795731173 +0300
committer Practice Student <student@example.com> 1795731173 +0300
gpgsig -----BEGIN SSH SIGNATURE-----
 U1NIU0lHAAAAAQAAADMAAAALc3NoLWVkMjU1MTkAAAAgYkQPVlXO/L8f35EQezAhMbCCbP
 cIbK2Qse24uSqjtZIAAAADZ2l0AAAAAAAAAAZzaGE1MTIAAABTAAAAC3NzaC1lZDI1NTE5
 AAAAQGSSNOrOsGD6wqmjIf6Oj/+B2B9ZEDvL+q0rSgUmLC80KgEf+zB+2oOS/TOBIeg4Qp
 a6G8rsiM+YQjN6GChbBw8=
 -----END SSH SIGNATURE-----

Add todo list
```

An unsigned commit has the first four lines and the message. A signed one has one more field, `gpgsig`, and the signature is its value. The field is called `gpgsig` for SSH signatures too.

### What is signed

The signature is computed from everything else in that file: the `tree` line (the snapshot of all files), the `parent` line, the author, the committer and the message.

- Change the message or a file, and the content no longer matches the signature. Here somebody changed only the message of a signed commit, from "Signed main 2" to "Signed main 3":

  ```console
  $ git verify-commit 1865cb1
  Could not verify signature.
  Signature verification failed: incorrect signature
  ```

  In `%G?` this commit is a `B`.
- The `parent` line holds the ID of the commit before, and that ID depends on *its* parent, and so on. A signature therefore covers the commit's place in history too.

### Signing a commit that already exists

Because the signature is stored inside the commit, adding one changes the commit's content. A commit's [ID](term:commit-id) is computed from its content, so a commit with a signature is a different commit with a different ID.

That is why there is no command to "add a signature" to a commit. You replace the commit with a signed copy, and `git commit --amend` does exactly that for the newest commit (see [Fix your last commit](lesson:fix-last-commit)):

```console
$ git log --format="%h %G? %s"
b1627a2 N Add todo list
c9a9272 N Add search page
1c97b92 N Add README
$ git commit --amend --no-edit -S
[main 50f2e4d] Add todo list
 Date: Fri Nov 27 01:14:48 2026 +0300
 1 file changed, 1 insertion(+)
 create mode 100644 todo.txt
$ git log --format="%h %G? %s"
50f2e4d G Add todo list
c9a9272 N Add search page
1c97b92 N Add README
```

Same message, same files, new ID: `b1627a2` became `50f2e4d`. With `commit.gpgSign` on, plain `git commit --amend --no-edit` signs as well, because an amend creates a commit.

:::graph
caption: "After the amend: main is on the signed copy. The unsigned commit is left behind."
commits:
  - id: A
    message: Add README
  - id: B
    message: Add search page
    parents: [A]
  - id: C
    message: Add todo list (unsigned)
    parents: [B]
    faded: true
  - id: D
    message: Add todo list (signed)
    parents: [B]
branches:
  main: D
head: main
:::

:::careful
A tag made before the amend still points at the old, unsigned commit. Sign the commit first and tag afterwards. And as with every amend: do it before you push, because the new commit replaces one that others may already have.
:::

### A signed tag is a tag object with a signature

A signed tag stores its signature the same way, with one difference: the block sits at the end of the tag's message instead of in a field of its own. That is why `git show v0.9` printed it under "Version 0.9". The tag object names the commit's ID, and the signature covers that line.

## Advanced

Signing your own commits and checking them is the daily part. These topics are for the day you maintain a project that requires signatures, or want more detail in your reports.

### Refuse unsigned work when merging

`git merge --verify-signatures <branch>` checks the newest commit of the branch before merging, and stops if that commit has no good signature from a trusted key:

```console
$ git merge --verify-signatures unsigned-work
fatal: Commit a052e86 does not have a GPG signature.
```

When the signature is good, Git says so and merges. Add `-S` to sign the merge commit itself:

```console
$ git merge --verify-signatures -S signed-work
Commit 48d125d has a good GPG signature by student@example.com
Merge made by the 'ort' strategy.
 z2.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 z2.txt
```

The messages say "GPG signature" for SSH signatures too. `git pull` takes the same option. Most teams enforce signing on the server instead: on GitHub, a branch rule named "Require signed commits" rejects pushes that contain unsigned commits.

### Sign several old commits

`--amend` reaches only the newest commit. To sign the last three, let a rebase re-create them, each with a signature:

```console
$ git rebase --no-ff -S HEAD~3
```

Every one of the three gets a new ID, so this is for commits you have not pushed. The Rebasing lesson explains what a rebase does to history.

### More signature fields for `git log`

| Code | Prints |
|---|---|
| `%G?` | The one-letter result |
| `%GS` | The signer: the email from the allowed signers file, or the GPG key's name |
| `%GK` | The key that signed: an SSH fingerprint or a GPG key ID |

```console
$ git log -1 --format="%G? | %GS | %GK"
G | student@example.com | SHA256:vtoDfjZqhYJRicAOjfUek8W3ABSKC4/MgGs8Hz/ewlc
```

### More about GitHub's badges

- With vigilant mode on, a third badge exists: **Partially verified**. The signature is valid, but the commit's author is a different person from the committer who signed it, and that author uses vigilant mode. GitHub cannot confirm that the author agreed.
- Commits you make on the GitHub website (editing a file, merging a pull request) are signed by GitHub's own key and show as Verified.
- GitHub also verifies S/MIME signatures, a third kind that some companies use with certificates they issue to employees.
- A signing key can also be added from the terminal with GitHub's `gh` program: `gh ssh-key add <file>.pub --type signing`.

## Recap

- The author name and email of a commit are free text. A signature, made with your private key, is the only proof of who made a commit and that nobody changed it.
- SSH signing needs `gpg.format ssh` and `user.signingkey <file>.pub`; checking needs `gpg.ssh.allowedSignersFile`, a list of emails and public keys. GPG uses a key ID and its own keyring instead.
- Sign with `git commit -S` and `git tag -s`, or always with `commit.gpgSign` and `tag.gpgSign` set to `true`.
- Check with `git log --show-signature`, the `%G?` code (`G` good, `N` none, `U` unknown key, `B` bad), `git verify-commit` and `git tag -v`.
- A signature is part of the commit: to sign an existing commit you replace it (`git commit --amend -S`), and it gets a new ID. GitHub shows "Verified" once your public key is added to your account as a signing key.
