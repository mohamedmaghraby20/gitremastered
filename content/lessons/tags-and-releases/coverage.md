# Coverage: tags-and-releases

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** tags in Git: listing, the two kinds, creating (now and later), sharing, deleting, and going back to a tagged version. GitHub releases, the second half of the course-map title, need a real GitHub account and are written with the GitHub part of the course; until then the lesson's title is "Tags: mark a release".

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 2.6 Tagging | Listing Your Tags, Creating Tags, Annotated Tags, Lightweight Tags, Tagging Later, Sharing Tags, Deleting Tags, Checking out Tags |
| Pro Git 10.3 Git References | Tags: a lightweight tag is a ref to a commit, an annotated tag is a tag object |
| Git reference: `git-tag`, `git-push`, `git-describe`, `git-ls-remote`, `git-rev-parse` | `-l`, `-n`, `--sort`, `--contains`, `-s`, `-v`; `--follow-tags`, `push.followTags`; `describe`; `ls-remote --tags`; `^{commit}` |

## Pro Git 2.6, point by point

| Book point | In the lesson | Layer |
|---|---|---|
| Tags mark release points | Yes, with a graph of a tag staying while `main` moves | Must know |
| `git tag` lists tags, alphabetically | Yes | Must know |
| `git tag -l "pattern"`; a wildcard needs `-l` | Yes, with the real error without `-l` | Must know |
| Two kinds: lightweight and annotated; annotated recommended | Yes, as a table | Must know |
| `git tag -a v1.4 -m`; the editor opens without `-m` | Yes, with a Try-it | Must know |
| `git show` on an annotated tag: tagger, date, message, then the commit | Yes, read in two parts | Must know |
| Lightweight tag: no `-a`, `-s` or `-m`; `git show` shows only the commit | Yes | Must know |
| Tagging later with a commit checksum | Yes, with a Try-it | Must know |
| `git push` does not transfer tags; `git push origin <tagname>` | Yes, with a predict block and a Try-it | Must know |
| `git push origin --tags` | Yes | Must know |
| `--tags` pushes both kinds; `--follow-tags` only annotated | Yes, as a table | Must know |
| Clone and pull bring tags | Yes | Must know |
| `git tag -d`; it does not remove the tag from the server | Yes | Must know |
| `git push origin :refs/tags/<tagname>` and `--delete` | Yes, as a today vs. book comparison | Must know |
| Checking out a tag gives detached HEAD; commits there are unreachable | Yes, with `git switch --detach` | Must know |
| `git checkout -b version2 v2.0.0` | Yes, as `git switch -c`, with the book's command in a comparison | Must know |
| Annotated tags are full objects, checksummed | Yes: `cat-file -t`, `cat-file -p`, two IDs | Under the hood |
| Tags can be signed and verified with GPG | Pointer only | Advanced; taught in `signing` |

## Left out on purpose

| Point | Why | Where it is taught |
|---|---|---|
| What detached HEAD is and how to leave it | Its own lesson; here only named | `switch-and-detached-head` |
| Signing tags (`-s`, `-v`) in depth | Needs keys | `signing` |
| GitHub releases (notes, downloads) | Needs a real GitHub account | The GitHub part of the course (phase 6) |
| Refspecs behind `:refs/tags/v1.0` | Its own lesson | `refspecs` |
| `git push --force` on a tag | Dangerous habit; deleting and re-pushing teaches the same thing safely | Not taught |

## Beyond the book

- Semantic versioning and the `v` prefix, in a few lines: every team names tags this way.
- The "already exists" rejection when a re-created tag is pushed, and the rule not to move a tag others have (Git reference, `git-tag`, "On Re-tagging").
- `git describe`, `git tag -n`, `--sort=-v:refname`, `--contains`, `push.followTags`, `git ls-remote --tags`.

## Challenges and quiz

- Easy, `tag-the-release`: an annotated `v1.0` on the newest commit. Also the Try-its' starting state; the Try-its use `v1.0-rc1` and `v0.5`, so they do not solve it.
- Medium, `tag-later-and-share`: tag an older commit by ID and push two tags (plain `git push` leaves a goal unmet).
- Hard, `move-a-pushed-tag`: a pushed tag on the wrong commit: delete in both places, re-create, push, and push the waiting commit.
- Known limit: `remote-has-tag` only says that the name exists on the server, not which commit it points at. In the hard challenge, a student who fixes the tag locally and never touches the server still meets "The server has a tag v2.0". The `branch-is-in-sync` goal at least requires a push. A check that compares the remote tag's commit would close the gap.
- Quiz: a tag does not move; why a tag did not reach the server; annotated vs. lightweight for a release; committing after checking out a tag.

## Not verified

- The editor that opens for `git tag -a` without `-m` (stated from the book, not run).
- Signed tags (`-s`, `-v`): no signing key on this machine.
- The picture cues (the `tag` label on a station, `HEAD · detached` on a tagged commit) follow the visualizer's code and tests, not a run in the desktop app.
