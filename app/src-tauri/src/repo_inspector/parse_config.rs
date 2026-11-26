//! Reads the output of `git config --local --list -z`: the repository's own settings.
//!
//! With `-z`, each setting is `key`, a newline, `value`, then a NUL byte, so values that
//! contain newlines or `=` signs are safe. Remotes are settings too: `remote.origin.url`
//! names the remote `origin` and where it lives.
//!
//! Docs: <https://git-scm.com/docs/git-config#Documentation/git-config.txt--z>

use crate::models::repo_snapshot::{ConfigEntry, Remote};

/// Reads every setting.
///
/// Input: the raw output (NUL-separated). Output: the settings, in file order.
pub fn parse_config(config_output: &str) -> Vec<ConfigEntry> {
    config_output
        .split('\0')
        .filter(|entry| !entry.is_empty())
        .map(|entry| {
            // A setting written without a value (a bare flag) has no newline: its value is "".
            let (key, value) = entry.split_once('\n').unwrap_or((entry, ""));
            ConfigEntry {
                key: key.to_string(),
                value: value.to_string(),
            }
        })
        .collect()
}

/// Picks the remotes out of the settings: every `remote.<name>.url`.
///
/// Input: the settings. Output: the remotes, with no tag names yet.
pub fn remotes_from_config(config_entries: &[ConfigEntry]) -> Vec<Remote> {
    config_entries
        .iter()
        .filter_map(|entry| {
            let name = entry.key.strip_prefix("remote.")?.strip_suffix(".url")?;
            Some(Remote {
                name: name.to_string(),
                url: entry.value.clone(),
                tag_names: Vec::new(),
            })
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::{parse_config, remotes_from_config};

    /// Keys and values are split at the first newline; a bare flag has an empty value.
    #[test]
    fn reads_settings_with_their_values() {
        let entries = parse_config("user.name\nPractice Student\0core.bare\nfalse\0my.flag\0");

        assert_eq!(entries.len(), 3);
        assert_eq!(entries[0].key, "user.name");
        assert_eq!(entries[0].value, "Practice Student");
        assert_eq!(entries[2].key, "my.flag");
        assert_eq!(entries[2].value, "");
    }

    /// Only `remote.<name>.url` settings become remotes.
    #[test]
    fn finds_remotes_by_their_url_setting() {
        let entries = parse_config(
            "remote.origin.url\n../origin.git\0remote.origin.fetch\n+refs/heads/*:refs/remotes/origin/*\0user.name\nA\0",
        );

        let remotes = remotes_from_config(&entries);

        assert_eq!(remotes.len(), 1);
        assert_eq!(remotes[0].name, "origin");
        assert_eq!(remotes[0].url, "../origin.git");
    }
}
