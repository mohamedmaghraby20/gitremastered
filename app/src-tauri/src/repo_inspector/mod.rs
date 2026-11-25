//! The repo-inspector module (SPEC.md section 3.2): reads a practice repository's state.
//!
//! - `snapshot`: runs the read-only Git commands and builds a `RepoSnapshot`.
//! - `parse_status`, `parse_log`, `parse_refs`: one small parser per Git output.

pub mod parse_log;
pub mod parse_refs;
pub mod parse_status;
pub mod snapshot;
