---
id: git-verify-commit
command: git verify-commit
group: History
summary: Checks the signature of a commit and says whether it is good and whose key made it.
usage: ["git verify-commit <commit>", "git verify-commit -v <commit>", "git verify-tag <tag>"]
bookSection: "7.4 Signing Your Work"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work
lessons: [signing]
---

`git verify-commit <commit>` checks the signature stored in one commit. It prints the result, and it also reports success or failure to whatever ran it, so scripts can use it.

```console
$ git verify-commit HEAD
Good "git" signature for student@example.com with ED25519 key SHA256:vtoDfjZqhYJRicAOjfUek8W3ABSKC4/MgGs8Hz/ewlc
```

That is the report for an SSH signature: the signature matches the commit, and the key belongs to `student@example.com` according to your allowed signers file. For a GPG signature the line comes from GPG and reads `gpg: Good signature from "<name>"`.

| What you see | What it means |
|---|---|
| `Good "git" signature for <email> with … key …` | Valid, and the key is in your allowed signers file. The command succeeds |
| `Good "git" signature with … key …` then `No principal matched.` | Valid, but the key is in no line of your allowed signers file. The command fails: you do not know whose key it is |
| `Could not verify signature.` | The commit's content does not match its signature. It was changed after signing |
| Nothing at all | The commit has no signature. The command fails |
| `error: gpg.ssh.allowedSignersFile needs to be configured and exist for ssh signature verification` | Git has no list of trusted SSH keys. Set `gpg.ssh.allowedSignersFile` |

| Option | What it does |
|---|---|
| `-v` | Also prints the commit's content (tree, parent, author, committer, message) after the result |
| `--raw` | Prints the signing program's own status output, for scripts |

To check a tag, use the twin command `git verify-tag <tag>`, or `git tag -v <tag>`, which also prints the tag's record:

```console
$ git verify-tag v0.9
Good "git" signature for student@example.com with ED25519 key SHA256:vtoDfjZqhYJRicAOjfUek8W3ABSKC4/MgGs8Hz/ewlc
$ git verify-tag plain
error: no signature found
```

To check many commits at once, `git log --show-signature` prints the same report under each commit, and `git log --format="%h %G? %s"` gives one letter per commit: `G` good, `N` none, `U` unknown key, `B` bad.

:::careful
A "Good signature" only says that some key signed this content. Read the name after `for`: it comes from your allowed signers file (or your GPG keyring), not from the commit's author line, which anyone can fake.
:::
