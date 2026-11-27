# Measurements

SPEC §10 items 4 and 10, measured in the real desktop app with the pilot lesson open.

**Machine:** Intel Core i5-12500H, 16 GB RAM, Windows 11 Home, WebView2 158.0.4370.33, Git 2.55.0.windows.3.
**App:** release build ("review copy", `pnpm review:build`), window 1440 × 900.
**How:** `pnpm review:measure` (`scripts/student-driver/measure.ts`). It opens the pilot, reads the memory of the app's whole process tree, then types 15 Git commands into the real terminal (12 × `git add`, 3 × `git commit`) and times each one **from pressing Enter** until the visualizer's desk shows the result. That is stricter than the SPEC's "after a Git command", because it includes the time Git itself runs.

## Visualizer delay (target: under 300 ms)

| Date | Change | Median | Slowest | Result |
|---|---|---|---|---|
| 2026-11-25 | Pilot as built in phase 2 | 313 ms | 330 ms | Over target |
| 2026-11-25 | Snapshot's four Git reads run in parallel | 234 ms | 238 ms | **Under target** |
| 2026-11-26 | Phase 5, first try: snapshot version 2 with six Git reads (config and stash added) | 281 ms | 314 ms | Slowest over target |
| 2026-11-26 | Stash read only when a stash exists; settings remembered until `.git/config` changes (four reads again) | 251–266 ms (three runs) | 280–286 ms | **Under target** |
| 2026-11-27 | Phase 6: snapshot version 3 (changed files and signatures from the same log call, file texts read from disk, one `git cat-file` only for files with a pending change) | 236–237 ms (two runs) | 251–269 ms | **Under target** |

Where the time went before the fix:

| Step | Time |
|---|---|
| `git add` itself (Git Bash, Windows) | ~35 ms |
| Watcher waits until the folder is quiet (debounce) | 100 ms |
| Snapshot: `status`, `log`, `for-each-ref`, `ls-tree`, one after another | ~155 ms |
| Sending the event and drawing | a few ms |

On Windows every Git process costs ~35 ms just to start, so four in a row was the biggest part. Run in parallel, the snapshot takes ~70 ms. The debounce stays at 100 ms: shorter risks several updates for one command (the watcher test "a burst gives one update" guards this).

**Phase 5 note.** The snapshot now also reads the reflog, upstreams, conflicts, the stash, the settings and the practice "server"'s tags, and the app watches the whole practice workspace. The first build ran six Git processes per snapshot and went over the target. Two of them are now skipped when nothing changed, which brought the delay back under 300 ms, but not back to 234 ms. On the day of this run, one Git process took 50 to 75 ms to start on this machine (35 ms on 2026-11-25), so the two days are not a clean comparison. The margin is small: any new per-snapshot Git process needs the same care.

The history map no longer loads a layout library (ELK); `lane-layout.ts` places the stations.

## Memory (target: about 250 MB)

| Date | Processes | Working set (all) | Private memory |
|---|---|---|---|
| 2026-11-25 (before the speed fix) | 10 | 455 MB | 235 MB |
| 2026-11-25 (after) | 10 | 457 MB | 233 MB |
| 2026-11-26 (phase 5: 27 lessons, new map and board) | 10 | 476–487 MB | 250–261 MB (three runs) |
| 2026-11-27 (phase 6: 73 lessons, GitHub screens) | 10 | 502–505 MB | 274–279 MB (three runs) |

The process tree: the app (26 MB), six WebView2 processes (browser, renderer, GPU and helpers: 10–116 MB each), Git Bash (2 × bash.exe) and OpenConsole (the Windows pseudo-console).

**Which number counts:** "private memory" is what the app alone holds, and it is close to what Task Manager shows. The working set adds pages shared with other programs (WebView2's libraries are shared with Edge), so it counts some memory twice. By private memory the pilot is **under the ~250 MB target, with little room**: the WebView2 processes are ~80% of it, and the app's own code is small. Watch this as lessons and screens grow; first candidates are the history map (Svelte Flow) and keeping only one terminal alive.

## Phase 6: where the memory goes (2026-11-27)

Private memory went over the ~250 MB mark (274–279 MB). Measured in the review app before changing anything:

| Part | Size |
|---|---|
| JavaScript heap, home screen | 20 MB |
| JavaScript heap, pilot open | 31 MB used (41 MB reserved) |
| Course text bundled in the app | about 2.6 MB, inside one 2.9 MB chunk |
| The two largest WebView2 processes (renderer, GPU) | 110–145 MB each |

Everything the course holds lives in the ~31 MB heap, so loading each lesson's text only when it opens would save under 10 MB. Most of the memory is WebView2, which every Tauri app on Windows pays. Options for later: load lesson text on demand (small gain), keep one terminal alive, look at the history map's memory, or accept a higher target for a 62-lesson course.
