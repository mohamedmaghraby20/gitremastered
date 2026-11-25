# Setting up your computer

Everything you need to build and run GitRemastered from source. Students who only use the app don't need any of this.

## What you need

| Tool | Why | Check it with |
|---|---|---|
| Git | The course and the app run real Git | `git --version` |
| Node.js (LTS or newer) | Builds the screens (SvelteKit) | `node --version` |
| pnpm | Installs the app's JavaScript packages | `pnpm --version` |
| Rust (via rustup) | Builds the app's core (Tauri) | `rustc --version` and `cargo --version` |
| System build tools | Rust needs a C/C++ linker on each system | see your system below |

Optional, for code intelligence in editors and AI agents:

| Tool | Install |
|---|---|
| rust-analyzer, clippy, rustfmt | `rustup component add rust-analyzer clippy rustfmt` |
| TypeScript language server | `npm install -g typescript-language-server typescript` |

## Windows

1. Install Git (it includes Git Bash, which the app's terminal uses):

   ```
   winget install --id Git.Git -e
   ```

2. Install Node.js:

   ```
   winget install --id OpenJS.NodeJS.LTS -e
   ```

3. Install pnpm:

   ```
   npm install -g pnpm
   ```

4. Install the Microsoft C++ Build Tools (the C++ workload). This is a large download and asks for admin permission:

   ```
   winget install --id Microsoft.VisualStudio.2022.BuildTools -e --override "--quiet --wait --norestart --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
   ```

5. Install Rust, then the MSVC toolchain and the extra components:

   ```
   winget install --id Rustlang.Rustup -e
   rustup default stable-msvc
   rustup component add rust-analyzer clippy rustfmt
   ```

6. WebView2 is already part of Windows 10 and 11. If it's missing, install it from Microsoft's WebView2 page.

7. Open a **new** terminal so the new tools are on your PATH, then check every version from the table above.

## macOS

1. Install the Xcode command line tools (includes Git and the C compiler):

   ```
   xcode-select --install
   ```

2. Install Node.js (for example with Homebrew) and pnpm:

   ```
   brew install node
   npm install -g pnpm
   ```

3. Install Rust:

   ```
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup component add rust-analyzer clippy rustfmt
   ```

## Linux (Debian / Ubuntu)

1. Install Git, build tools and the libraries Tauri needs:

   ```
   sudo apt update
   sudo apt install git build-essential curl wget file libwebkit2gtk-4.1-dev libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
   ```

2. Install Node.js (from your distribution or nodejs.org) and pnpm:

   ```
   npm install -g pnpm
   ```

3. Install Rust:

   ```
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup component add rust-analyzer clippy rustfmt
   ```

For other Linux distributions, see the system requirements page in the Tauri documentation.

## Get the code and run the app

```
git clone --recurse-submodules https://github.com/mohamedmaghraby20/gitremastered.git
cd gitremastered/app
pnpm install
pnpm tauri dev
```
