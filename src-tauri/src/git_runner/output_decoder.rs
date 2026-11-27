//! Turns the shell's output bytes into text, piece by piece.
//!
//! The terminal reads output in chunks of bytes. A character like "❯" takes 3 bytes in UTF-8,
//! and a chunk can end in the middle of it. This decoder keeps the unfinished bytes and puts
//! them in front of the next chunk, so no character is ever cut in half.

/// Decodes a stream of UTF-8 bytes that arrives in chunks.
#[derive(Debug, Default)]
pub struct OutputDecoder {
    unfinished_bytes: Vec<u8>,
}

impl OutputDecoder {
    /// Creates an empty decoder. Input: none. Output: the decoder.
    pub fn new() -> Self {
        Self::default()
    }

    /// Decodes one chunk.
    ///
    /// Input: the bytes just read. Output: every complete character so far, as text.
    /// Bytes that are not valid UTF-8 become "�" so the terminal never stops.
    pub fn decode(&mut self, chunk: &[u8]) -> String {
        let mut bytes = std::mem::take(&mut self.unfinished_bytes);
        bytes.extend_from_slice(chunk);

        let mut text = String::new();
        let mut remaining: &[u8] = &bytes;
        loop {
            match std::str::from_utf8(remaining) {
                Ok(valid_text) => {
                    text.push_str(valid_text);
                    return text;
                }
                Err(error) => {
                    let (valid_part, rest) = remaining.split_at(error.valid_up_to());
                    text.push_str(std::str::from_utf8(valid_part).unwrap_or_default());
                    match error.error_len() {
                        // The chunk ended in the middle of a character: keep it for next time.
                        None => {
                            self.unfinished_bytes = rest.to_vec();
                            return text;
                        }
                        // Truly broken bytes: replace them and carry on.
                        Some(broken_length) => {
                            text.push(char::REPLACEMENT_CHARACTER);
                            remaining = &rest[broken_length..];
                        }
                    }
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::OutputDecoder;

    /// Plain text passes straight through.
    #[test]
    fn decodes_plain_text() {
        let mut decoder = OutputDecoder::new();
        assert_eq!(decoder.decode(b"git status\r\n"), "git status\r\n");
    }

    /// A 3-byte character split over two chunks comes out whole, once.
    #[test]
    fn joins_a_character_split_between_chunks() {
        let prompt_bytes = "❯ ".as_bytes();
        let mut decoder = OutputDecoder::new();
        assert_eq!(decoder.decode(&prompt_bytes[..1]), "");
        assert_eq!(decoder.decode(&prompt_bytes[1..]), "❯ ");
    }

    /// Broken bytes become the replacement character, and the text after them still shows.
    #[test]
    fn replaces_broken_bytes() {
        let mut decoder = OutputDecoder::new();
        assert_eq!(decoder.decode(&[b'a', 0xFF, b'b']), "a\u{FFFD}b");
    }
}
