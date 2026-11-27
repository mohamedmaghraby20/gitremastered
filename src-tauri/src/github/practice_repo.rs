//! The guard: the only way to name a GitHub repository the app may write to.
//!
//! A `PracticeRepo` can only be made through `PracticeRepo::new`, which refuses any
//! repository whose name does not start with `gitremastered-practice` or whose owner is not
//! the signed-in user. Every function that writes to GitHub takes a `PracticeRepo`, so the
//! compiler makes sure no write can reach any other repository.

/// The start every practice repository's name must have.
pub const PRACTICE_PREFIX: &str = "gitremastered-practice";

/// The longest repository name GitHub allows.
const LONGEST_REPO_NAME: usize = 100;

/// A repository the app created for practice, owned by the signed-in user.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PracticeRepo {
    owner: String,
    name: String,
}

impl PracticeRepo {
    /// Checks a repository against the rules and wraps it.
    ///
    /// Inputs: the owner, the name, and the login of the signed-in user.
    /// Output: the practice repository, or a sentence saying why it was refused.
    pub fn new(owner: &str, name: &str, signed_in_login: &str) -> Result<Self, String> {
        if signed_in_login.is_empty() || !owner.eq_ignore_ascii_case(signed_in_login) {
            return Err(format!(
                "The app only writes to your own repositories, and \"{owner}\" is not you"
            ));
        }
        if !is_practice_name(name) {
            return Err(format!(
                "The app only writes to repositories named {PRACTICE_PREFIX}…, not \"{name}\""
            ));
        }
        Ok(Self {
            owner: signed_in_login.to_string(),
            name: name.to_string(),
        })
    }

    /// The repository as `owner/name`, as `gh` and the API name it.
    /// Input: none. Output: the full name.
    pub fn full_name(&self) -> String {
        format!("{}/{}", self.owner, self.name)
    }

    /// The repository's name only. Input: none. Output: the name.
    pub fn name(&self) -> &str {
        &self.name
    }

    /// The address `git` clones and pushes to.
    /// Input: none. Output: the HTTPS URL.
    pub fn clone_url(&self) -> String {
        format!("https://github.com/{}.git", self.full_name())
    }
}

/// Tells whether a name is a practice repository's name: it starts with the prefix and has
/// only lower-case letters, digits and dashes (so it can never sneak in a path like `../`).
///
/// Input: the name. Output: true if the app may use it.
pub fn is_practice_name(name: &str) -> bool {
    let has_safe_characters = name.chars().all(|character| {
        character.is_ascii_lowercase() || character.is_ascii_digit() || character == '-'
    });
    name.starts_with(PRACTICE_PREFIX) && name.len() <= LONGEST_REPO_NAME && has_safe_characters
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A practice name owned by the signed-in user is accepted.
    #[test]
    fn accepts_the_users_own_practice_repository() {
        let repo = PracticeRepo::new("Octo", "gitremastered-practice-flow", "octo").expect("ok");
        assert_eq!(repo.full_name(), "octo/gitremastered-practice-flow");
        assert_eq!(
            repo.clone_url(),
            "https://github.com/octo/gitremastered-practice-flow.git"
        );
    }

    /// Any other name is refused, however close it looks.
    #[test]
    fn refuses_other_names() {
        for name in [
            "my-project",
            "gitremastered",
            "Gitremastered-practice-flow",
            "gitremastered-practice/../other",
            "x-gitremastered-practice",
            "gitremastered-practice flow",
        ] {
            assert!(
                PracticeRepo::new("octo", name, "octo").is_err(),
                "{name} must be refused"
            );
        }
    }

    /// Someone else's repository is refused, and so is any repository when nobody is signed in.
    #[test]
    fn refuses_other_owners() {
        assert!(PracticeRepo::new("someone", "gitremastered-practice-flow", "octo").is_err());
        assert!(PracticeRepo::new("", "gitremastered-practice-flow", "").is_err());
    }
}
