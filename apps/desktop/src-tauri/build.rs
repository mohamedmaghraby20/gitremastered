//! Build script: Cargo runs it before compiling, so Tauri can prepare its generated code.

/// Runs Tauri's build step. Inputs: none. Output: none.
fn main() {
    tauri_build::build()
}
