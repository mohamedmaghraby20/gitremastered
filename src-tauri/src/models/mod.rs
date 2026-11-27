//! Rust versions of the shared data shapes (SPEC.md section 3.4).
//!
//! Each type mirrors one in `packages/course-engine/src/types/`, and serde turns it into the same JSON
//! (camelCase field names), so the screens and the core always agree.

pub mod github;
pub mod repo_snapshot;
pub mod working_state;
pub mod workspace;
