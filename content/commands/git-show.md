---
id: git-show
command: git show
group: History
summary: Prints one commit, with who made it, when, its message and the lines it changed.
usage: ["git show", "git show <commit>", "git show --stat <commit>"]
bookSection: "2.3 Viewing the Commit History"
bookUrl: https://git-scm.com/docs/git-show
lessons: [reading-history]
---

`git show` answers "what exactly did this commit do?". Give it a commit ID (the first 7 characters are enough) and it prints that commit's entry, followed by its diff: lines starting with `-` were removed, lines starting with `+` were added.

```console
$ git show 28d7af0
commit 28d7af0c91345a9255f924c256e68bd4e6bf5105
Author: Omar Haddad <omar.haddad@shop.example>
Date:   Mon Oct 26 10:20:00 2026 +0000

    Fix rounding in cart total

diff --git a/cart.js b/cart.js
index 1a38ce0..cd25080 100644
--- a/cart.js
+++ b/cart.js
@@ -3,7 +3,7 @@ function cartTotal(prices) {
   for (const price of prices) {
     total = total + price;
   }
-  return total;
+  return Math.round(total * 100) / 100;
 }
 
 function applyDiscount(total) {
```

| You type | You get |
|---|---|
| `git show` | The newest commit |
| `git show 28d7af0` | That commit, with its diff |
| `git show --stat 28d7af0` | That commit, with the list of changed files in place of the diff |

Find the ID first with `git log --oneline`. `git show` only reads; it never changes anything.
