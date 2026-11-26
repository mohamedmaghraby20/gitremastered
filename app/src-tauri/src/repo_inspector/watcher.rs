//! Watches a practice folder's whole workspace and reports a fresh snapshot after every
//! change.
//!
//! Why the workspace (the folder above the practice folder): a remote lesson keeps its
//! "server" there (`../origin.git`). Pushing a tag changes only the server, and the snapshot
//! lists the server's tags, so that change must be noticed too.
//!
//! Why the whole folder and not only `.git`: editing a file changes nothing inside `.git`,
//! so watching `.git` alone would miss "modified" files.
//!
//! One Git command touches many files at once (`git commit` writes objects, the index, a ref
//! and a log). The debouncer waits until changes stop for `QUIET_TIME`, then reports them as
//! one batch, so one command gives one update. A snapshot equal to the last one is not sent.

use std::sync::Mutex;
use std::time::Duration;

use notify_debouncer_mini::notify::{
    Config as WatcherConfig, EventKindMask, RecommendedWatcher, RecursiveMode,
};
use notify_debouncer_mini::{Config, DebounceEventResult, Debouncer, new_debouncer_opt};

use super::snapshot::read_snapshot;
use crate::git_runner::practice_folder::PracticeFolder;
use crate::models::repo_snapshot::RepoSnapshot;

/// How long the folder must stay still before we read a new snapshot.
pub const QUIET_TIME: Duration = Duration::from_millis(100);

/// A running watcher. Watching stops when it is dropped.
pub struct RepoWatcher {
    _debouncer: Debouncer<RecommendedWatcher>,
}

impl RepoWatcher {
    /// Starts watching a practice folder.
    ///
    /// Inputs: the folder, and a callback that receives each new, different snapshot.
    /// Output: the watcher (keep it alive while watching), or a readable error.
    pub fn start(
        folder: PracticeFolder,
        on_snapshot: impl Fn(RepoSnapshot) + Send + 'static,
    ) -> Result<Self, String> {
        let last_snapshot: Mutex<Option<RepoSnapshot>> = Mutex::new(read_snapshot(&folder).ok());
        let watched_folder = folder.clone();

        let handle_changes = move |result: DebounceEventResult| {
            if result.is_err() {
                return;
            }
            let Ok(snapshot) = read_snapshot(&watched_folder) else {
                return;
            };
            let Ok(mut last) = last_snapshot.lock() else {
                return;
            };
            if last.as_ref() != Some(&snapshot) {
                *last = Some(snapshot.clone());
                on_snapshot(snapshot);
            }
        };

        // Only real changes count; file reads (including our own `git status`) are ignored,
        // otherwise every snapshot would trigger the next one.
        let watcher_config = WatcherConfig::default().with_event_kinds(EventKindMask::CORE);
        let debouncer_config = Config::default()
            .with_timeout(QUIET_TIME)
            .with_notify_config(watcher_config);
        let mut debouncer = new_debouncer_opt(debouncer_config, handle_changes)
            .map_err(|error| format!("Could not watch the practice folder ({error})"))?;
        // A practice folder always sits inside its workspace; the fallback is the folder itself.
        let watched_path = folder.path().parent().unwrap_or(folder.path());
        debouncer
            .watcher()
            .watch(watched_path, RecursiveMode::Recursive)
            .map_err(|error| format!("Could not watch the practice folder ({error})"))?;
        Ok(Self {
            _debouncer: debouncer,
        })
    }
}

/// The app's one active watcher (one lesson is open at a time).
#[derive(Default)]
pub struct ActiveRepoWatcher {
    current: Mutex<Option<RepoWatcher>>,
}

impl ActiveRepoWatcher {
    /// Creates the holder with nothing watched. Input: none. Output: the holder.
    pub fn new() -> Self {
        Self::default()
    }

    /// Replaces the current watcher (the old one stops). Input: the new watcher, or None.
    pub fn replace(&self, watcher: Option<RepoWatcher>) {
        if let Ok(mut current) = self.current.lock() {
            *current = watcher;
        }
    }
}
