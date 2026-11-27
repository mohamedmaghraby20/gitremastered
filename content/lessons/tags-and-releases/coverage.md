# Coverage: tags-and-releases

What this lesson takes from its sources, what it leaves out, and where the rest is taught. For course reviewers; the app does not show this file.

**Lesson scope:** tags in Git (listing, the two kinds, creating now and later, sharing, deleting, going back to a tagged version) and GitHub releases built on them (publishing with `gh release create`, notes, drafts, pre-releases, assets, "Latest"). The Git half practises on a local `../origin.git`; the release half, added in phase 6, runs on the practice repository `gitremastered-practice-tags-and-releases` in the student's GitHub account. The title follows the course map: "Tags and GitHub releases".

**Sources**

| Source | Sections used |
|---|---|
| Pro Git 2.6 Tagging | Listing Your Tags, Creating Tags, Annotated Tags, Lightweight Tags, Tagging Later, Sharing Tags, Deleting Tags, Checking out Tags |
| Pro Git 10.3 Git References | Tags: a lightweight tag is a ref to a commit, an annotated tag is a tag object |
| Git reference: `git-tag`, `git-push`, `git-describe`, `git-ls-remote`, `git-rev-parse` | `-l`, `-n`, `--sort`, `--contains`, `-s`, `-v`; `--follow-tags`, `push.followTags`; `describe`; `ls-remote --tags`; `^{commit}` |
| GitHub Docs: About releases (https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) | Releases are based on Git tags; notes and binary files; the automatic zip and tarball links; asset limits (under 2 GiB each, 1000 per release) |
| GitHub Docs: Managing releases in a repository; Automatically generated release notes (same section of the Docs) | Where "Releases" is on the repository page; pre-release means "not ready for production and may be unstable"; what generated notes contain (merged pull requests, contributors, full changelog link) |
| GitHub CLI manual, `gh release` (gh 2.104.0) | `create` with `--title`, `--notes`, `--generate-notes`, `--notes-from-tag`, `--verify-tag`, `--draft`, `--prerelease`, `--latest`, asset arguments; `list`, `view`, `edit`, `upload`, `download`, `delete --cleanup-tag` |

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
| Releases in the browser, step by step (the "Draft a new release" form) | The lesson teaches the terminal way and only says where releases show; the form changes more often than the commands | Not taught |
| `.github/release.yml` (categories for generated notes), release discussions, immutable releases, the Releases API | Maintainer detail beyond a first release | Not taught; the API in general in `gh-cli-and-api` |
| Publishing a release from a workflow when a tag is pushed | Needs GitHub Actions | `github-actions-ci` |
| Pull requests (named for generated notes, with a two-line explanation) | Their own lesson | `github-flow-prs` |
| Refspecs behind `:refs/tags/v1.0` | Its own lesson | `refspecs` |
| `git push --force` on a tag | Dangerous habit; deleting and re-pushing teaches the same thing safely | Not taught |

## Beyond the book

- Semantic versioning and the `v` prefix, in a few lines: every team names tags this way.
- The "already exists" rejection when a re-created tag is pushed, and the rule not to move a tag others have (Git reference, `git-tag`, "On Re-tagging").
- `git describe`, `git tag -n`, `--sort=-v:refname`, `--contains`, `push.followTags`, `git ls-remote --tags`.
- GitHub releases, all of it (the book does not cover them). From GitHub Docs, About releases (https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) and the two pages beside it: what a release is, the automatic source archives, pre-releases, generated notes, asset limits. From the GitHub CLI manual: every `gh release` command and option.
  - Must know, "Publish a release on GitHub": tag, push, `gh release create --title --notes`, `gh release list`, `gh release view`, "Latest", and that the tag is Git while the release is GitHub.
  - Must know, "When it goes wrong": the `gh` message for a tag that exists locally but was not pushed.
  - Advanced: `--verify-tag` and the tag GitHub creates by itself; `--generate-notes` and `--notes-from-tag`; `--draft`, `--prerelease`, `gh release edit --draft=false`; assets with `upload` and `download`; "Latest" moving to an older version and `--latest=false`; `edit`, `delete`, `--cleanup-tag`.
- All `gh` output in the lesson was run on the practice repository with gh 2.104.0 (2026-11-27). Two things were changed for print: the account and repository in addresses read `your-name/notes-app`, and trailing spaces were removed. The `gh release list` and `view` blocks show what a terminal shows (run with `GH_FORCE_TTY`).

## Challenges and quiz

- Easy, `tag-the-release`: an annotated `v1.0` on the newest commit. Also the Try-its' starting state; the Try-its use `v1.0-rc1` and `v0.5`, so they do not solve it.
- Medium, `tag-later-and-share`: tag an older commit by ID and push two tags (plain `git push` leaves a goal unmet).
- Hard, `move-a-pushed-tag`: a pushed tag on the wrong commit: delete in both places, re-create, push, and push the waiting commit.
- Hard, `publish-a-release` (GitHub): an annotated `v1.0`, pushed, and a published release for it. Running `gh release create` before the push fails with the message shown in "When it goes wrong".
- Hard, `release-an-older-version` (GitHub): tag an older commit, push the tag, publish with generated notes. Letting `gh` create the tag would put it on the newest commit and leave no local tag, so two goals stay open; the hints point to "Let gh check the tag" in Advanced.
- Known limit of the GitHub goals: `github-release-exists` proves a published release for the tag name, and the local checks prove the local tag. Nothing checks that the tag on GitHub is the student's annotated tag on the right commit (`remote-has-tag` reads only a folder remote, not GitHub). A student who tags locally and runs `gh release create v1.0 --target main` passes with a lightweight tag on GitHub. A GitHub check for the tag's commit would close the gap. Pre-release and draft state are not checked either, so no challenge asks for them.
- Known limit: `remote-has-tag` only says that the name exists on the server, not which commit it points at. In the hard challenge, a student who fixes the tag locally and never touches the server still meets "The server has a tag v2.0". The `branch-is-in-sync` goal at least requires a push. A check that compares the remote tag's commit would close the gap.
- Quiz: a tag does not move; why a tag did not reach the server; annotated vs. lightweight for a release; committing after checking out a tag. No release question: the quiz already has the four questions a lesson may hold.

## Not verified

- The editor that opens for `git tag -a` without `-m` (stated from the book, not run).
- Signed tags (`-s`, `-v`): no signing key on this machine.
- The release pages in the browser were not opened: where the "Releases" link sits, the "Pre-release" label and the source archive links are stated from GitHub Docs. That "Latest" is what the repository's main page shows is stated from general knowledge of GitHub, not from a Docs sentence.
- What a visitor without push access sees of a draft (stated: nothing) was not tested; one account only.
- The interactive questions `gh release create` asks without `--title` and `--notes` were not run (no terminal here).
- The picture cues (the `tag` label on a station, `HEAD · detached` on a tagged commit) follow the visualizer's code and tests, not a run in the desktop app.
