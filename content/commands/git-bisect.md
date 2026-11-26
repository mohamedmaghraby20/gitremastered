---
id: git-bisect
command: git bisect
group: History
summary: Finds the commit that broke something, by testing the middle of the history again and again.
usage: ["git bisect start", "git bisect bad", "git bisect good <commit>", "git bisect reset", "git bisect start <bad> <good>", "git bisect run <command>", "git bisect skip"]
bookSection: "7.10 Debugging with Git"
bookUrl: https://git-scm.com/book/en/v2/Git-Tools-Debugging-with-Git#_binary_search
lessons: [search-blame-bisect]
---

`git bisect` does a binary search through your commits. You name one commit where things are broken (bad) and one where they worked (good). Git checks out the commit halfway between them, you test it and answer `good` or `bad`, and each answer rules out half of the commits that are left.

```console
$ git bisect start
status: waiting for both 'good' and 'bad' commits
$ git bisect bad
status: waiting for 'good' commit(s), 'bad' commit known
$ git bisect good v1.0
Bisecting: 4 revisions left to test after this (roughly 2 steps)
[04c07b14b819ee8f22faf04e3d192d433d930352] Add the SPRING10 coupon
$ git bisect bad
Bisecting: 1 revision left to test after this (roughly 1 step)
[6231985fc2c0287f8df90500bf2611216c82b35d] Add a receipt script
$ git bisect good
Bisecting: 0 revisions left to test after this (roughly 0 steps)
[a8573272fae8388b78807d7ffffabb32b98c53dc] Make the shipping fee a setting
$ git bisect bad
a8573272fae8388b78807d7ffffabb32b98c53dc is the first 'bad' commit
commit a8573272fae8388b78807d7ffffabb32b98c53dc
Author: Omar Haddad <omar.haddad@shop.example>
Date:   Thu Oct 22 10:20:00 2026 +0000

    Make the shipping fee a setting

 pricing.sh | 7 +++++--
 1 file changed, 5 insertions(+), 2 deletions(-)
$ git bisect reset
Previous HEAD position was a857327 Make the shipping fee a setting
Switched to branch 'main'
```

During a bisect HEAD is detached: it sits on the commit being tested, and your branch does not move. Finding the first bad commit does not end the bisect. `git bisect reset` does, and it puts you back on the branch you started from.

| You type | What happens |
|---|---|
| `git bisect start` | Begins a bisect. `git bisect start <bad> <good>` also names both ends, bad first |
| `git bisect bad` | Marks the commit you are on as broken. Add a commit to mark another one |
| `git bisect good <commit>` | Marks a commit as working. Without a commit, the one you are on |
| `git bisect skip` | The commit cannot be tested (it does not build, for example); Git picks one close by |
| `git bisect run <command>` | Runs the command on every commit the bisect checks out and reads its exit code, until the first bad commit is found |
| `git bisect log` | Prints the answers given so far. `git bisect replay <file>` repeats answers saved from it |
| `git bisect terms` | Shows the two words in use. `git bisect start --term-old=<word> --term-new=<word>` sets your own; `old` and `new` always work in place of `good` and `bad` |
| `git bisect reset` | Ends the bisect and switches back to where you started |

How `git bisect run` reads the exit code of your command:

| Exit code | The commit is |
|---|---|
| `0` | good |
| `1` to `127`, except `125` | bad |
| `125` | skipped, as with `git bisect skip` |
| `128` or more | not judged: the bisect stops |

```console
$ git bisect start HEAD v1.0
Bisecting: 4 revisions left to test after this (roughly 2 steps)
[04c07b14b819ee8f22faf04e3d192d433d930352] Add the SPRING10 coupon
$ git bisect run sh check-shipping.sh
running 'sh' 'check-shipping.sh'
Bisecting: 1 revision left to test after this (roughly 1 step)
[6231985fc2c0287f8df90500bf2611216c82b35d] Add a receipt script
running 'sh' 'check-shipping.sh'
Bisecting: 0 revisions left to test after this (roughly 0 steps)
[a8573272fae8388b78807d7ffffabb32b98c53dc] Make the shipping fee a setting
running 'sh' 'check-shipping.sh'
a8573272fae8388b78807d7ffffabb32b98c53dc is the first 'bad' commit
commit a8573272fae8388b78807d7ffffabb32b98c53dc
Author: Omar Haddad <omar.haddad@shop.example>
Date:   Thu Oct 22 10:20:00 2026 +0000

    Make the shipping fee a setting

 pricing.sh | 7 +++++--
 1 file changed, 5 insertions(+), 2 deletions(-)
bisect found first 'bad' commit
```

:::careful
A bisect you forget to end leaves you on an old commit with a detached HEAD: files look old and your newest commits seem to be gone. `git status` says "You are currently bisecting". Nothing is lost; run `git bisect reset`.
:::

:::careful
Keep the test script for `git bisect run` untracked, or outside the project. A tracked script changes, or disappears, as Git checks out older commits.
:::
