//! Reads whether the student's `gh` is installed and signed in, and as whom. Only reads.

use serde_json::Value;

use crate::models::github::GitHubConnection;

use super::gh_command::{GhError, run_gh};

/// Asks GitHub who is signed in, with one `gh api -i user` call (the headers carry the
/// token's scopes; the body carries the login).
///
/// Inputs: none. Output: the connection; never an error (a problem means "not connected").
pub fn read_connection() -> GitHubConnection {
    match run_gh(&["api", "-i", "user"], None) {
        Ok(response) => parse_user_response(&response),
        Err(GhError::NotInstalled) => GitHubConnection {
            is_gh_installed: false,
            is_signed_in: false,
            login: None,
            can_delete_repos: false,
        },
        Err(_) => GitHubConnection {
            is_gh_installed: true,
            is_signed_in: false,
            login: None,
            can_delete_repos: false,
        },
    }
}

/// Reads the signed-in login, from the connection.
///
/// Inputs: none. Output: the login, or a sentence telling the student what to do.
pub fn require_login() -> Result<String, String> {
    let connection = read_connection();
    if !connection.is_gh_installed {
        return Err("Install the GitHub CLI (gh) first: see Settings, GitHub".to_string());
    }
    connection
        .login
        .ok_or_else(|| "Sign in first: run gh auth login, then check again".to_string())
}

/// Reads `gh api -i user`: HTTP headers, a blank line, then the JSON body.
///
/// Input: the whole response. Output: the connection it describes.
fn parse_user_response(response: &str) -> GitHubConnection {
    let normalized = response.replace("\r\n", "\n");
    let (headers, body) = normalized.split_once("\n\n").unwrap_or(("", &normalized));
    let scopes = headers
        .lines()
        .find_map(|line| {
            let (name, value) = line.split_once(':')?;
            name.trim()
                .eq_ignore_ascii_case("x-oauth-scopes")
                .then(|| value.to_string())
        })
        .unwrap_or_default();
    let login = serde_json::from_str::<Value>(body.trim())
        .ok()
        .and_then(|user| user["login"].as_str().map(str::to_string));
    GitHubConnection {
        is_gh_installed: true,
        is_signed_in: login.is_some(),
        login,
        can_delete_repos: scopes.split(',').any(|scope| scope.trim() == "delete_repo"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Headers and body are both read; the delete scope is found among the others.
    #[test]
    fn reads_login_and_scopes() {
        let response = "HTTP/2.0 200 OK\r\nX-Oauth-Scopes: gist, delete_repo, repo\r\n\r\n{\"login\":\"octo\"}";
        let connection = parse_user_response(response);
        assert_eq!(connection.login, Some("octo".to_string()));
        assert!(connection.is_signed_in);
        assert!(connection.can_delete_repos);
    }

    /// Without the delete scope, the app knows it cannot delete.
    #[test]
    fn notices_a_missing_delete_scope() {
        let response =
            "HTTP/2.0 200 OK\nX-Oauth-Scopes: gist, read:org, repo\n\n{\"login\":\"octo\"}";
        assert!(!parse_user_response(response).can_delete_repos);
    }
}
