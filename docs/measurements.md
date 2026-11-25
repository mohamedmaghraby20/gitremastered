# Measurements

SPEC §10 items 4 and 10, measured in the real desktop app with the pilot lesson open.

**Machine:** Intel Core i5-12500H, 16 GB RAM, Windows 11 Home, WebView2 158.0.4370.33, Git 2.55.0.windows.3.
**App:** release build ("review copy", `pnpm review:build`), window 1440 × 900.
**How:** `pnpm review:measure` (`app/scripts/student-driver/measure.ts`). It opens the pilot, reads the memory of the app's whole process tree, then types 15 Git commands into the real terminal (12 × `git add`, 3 × `git commit`) and times each one **from pressing Enter** until the visualizer's desk shows the result. That is stricter than the SPEC's "after a Git command", because it includes the time Git itself runs.

## Visualizer delay (target: under 300 ms)

| Date | Change | Median | Slowest | Result |
|---|---|---|---|---|
| 2026-11-25 | Pilot as built in phase 2 | 313 ms | 330 ms | Over target |
| 2026-11-25 | Snapshot's four Git reads run in parallel | 234 ms | 238 ms | **Under target** |

Where the time went before the fix:

| Step | Time |
|---|---|
| `git add` itself (Git Bash, Windows) | ~35 ms |
| Watcher waits until the folder is quiet (debounce) | 100 ms |
| Snapshot: `status`, `log`, `for-each-ref`, `ls-tree`, one after another | ~155 ms |
| Sending the event and drawing | a few ms |

On Windows every Git process costs ~35 ms just to start, so four in a row was the biggest part. Run in parallel, the snapshot takes ~70 ms. The debounce stays at 100 ms: shorter risks several updates for one command (the watcher test "a burst gives one update" guards this).

## Memory (target: about 250 MB)

| Date | Processes | Working set (all) | Private memory |
|---|---|---|---|
| 2026-11-25 (before the speed fix) | 10 | 455 MB | 235 MB |
| 2026-11-25 (after) | 10 | 457 MB | 233 MB |

The process tree: the app (26 MB), six WebView2 processes (browser, renderer, GPU and helpers: 10–116 MB each), Git Bash (2 × bash.exe) and OpenConsole (the Windows pseudo-console).

**Which number counts:** "private memory" is what the app alone holds, and it is close to what Task Manager shows. The working set adds pages shared with other programs (WebView2's libraries are shared with Edge), so it counts some memory twice. By private memory the pilot is **under the ~250 MB target, with little room**: the WebView2 processes are ~80% of it, and the app's own code is small. Watch this as lessons and screens grow; first candidates are the history map (Svelte Flow) and keeping only one terminal alive.
