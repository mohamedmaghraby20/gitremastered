//! Puts a branch name safely into a GitHub API address (security audit L3): characters like
//! `&`, `#`, `?` or a space would otherwise change what the address asks for.

/// Percent-encodes every character except letters, digits and `-._~` (and `/` when allowed).
///
/// Inputs: the text and whether `/` may stay as it is (inside a path). Output: the encoded text.
pub fn encode_for_url(text: &str, keep_slashes: bool) -> String {
    let mut encoded = String::new();
    for byte in text.bytes() {
        let is_plain = byte.is_ascii_alphanumeric() || b"-._~".contains(&byte);
        let is_kept_slash = keep_slashes && byte == b'/';
        if is_plain || is_kept_slash {
            encoded.push(char::from(byte));
        } else {
            encoded.push_str(&format!("%{byte:02X}"));
        }
    }
    encoded
}

#[cfg(test)]
mod tests {
    use super::encode_for_url;

    /// Plain names stay as they are; anything that could change the address is encoded.
    #[test]
    fn encodes_what_could_change_an_address() {
        assert_eq!(encode_for_url("add-hours", false), "add-hours");
        assert_eq!(
            encode_for_url("a&state=closed", false),
            "a%26state%3Dclosed"
        );
        assert_eq!(encode_for_url("feature/menu", true), "feature/menu");
        assert_eq!(encode_for_url("feature/menu", false), "feature%2Fmenu");
    }
}
