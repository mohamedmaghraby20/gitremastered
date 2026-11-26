# GitRemastered — Design

> A well-made technical book from the terminal era: serif pages that are easy to read, monospace headings and commands, a retro terminal window, and a yellow highlighter for what matters.

**Theme:** light and dark (the terminal is dark in both).

This file is the design source of truth for the app. Exact values live in [`docs/design/tokens.json`](docs/design/tokens.json); this file explains how to use them. When the two disagree, `tokens.json` wins for values and this file wins for rules.

Visual references (review copies, kept in sync with this file):
- Design system: https://claude.ai/artifact/CCVRsuqiKBegEA19Q2tzzJ
- App prototype (all screens, clickable): https://claude.ai/artifact/BrxAerVGG5q4BGB1DdtfZ5

## Principles

1. **Reading comes first.** Lessons read like a good book: serif text, short paragraphs, generous line height.
2. **Neutral interface, one highlighter.** No brand color on backgrounds. Yellow is a highlighter behind dark text; indigo ink is the primary action.
3. **Mono means technical.** Headings, commands, file names, commit IDs and the terminal use mono. Paragraphs never do.
4. **Color teaches Git.** The three areas follow one story everywhere: draft → highlighted → inked.
5. **Flat and sharp.** Hairline borders, small corners, no card shadows. Only the terminal window and floating menus cast a shadow.

## Color

### Interface

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#fafafa` | `#121212` | App background |
| `surface` | `#ffffff` | `#1a1a1a` | Lesson column, panels, cards |
| `surface-sunken` | `#f2f2f0` | `#0d0d0d` | Sidebar, code wells, visualizer board |
| `border` | `#e4e4e0` | `#2a2a2a` | 1px hairlines |
| `border-strong` | `#8f8f99` | `#6b6b6b` | Secondary buttons, inputs, keycap edges |
| `ink` | `#303055` | `#f2f2f2` | Headings and body text |
| `ink-muted` | `#5a5a6e` | `#a3a3a3` | Secondary text, captions |
| `ink-faint` | `#6e6e80` | `#8a8a8a` | Metadata, step numbers |
| `primary` | `#303055` | `#faff69` | Primary button, active tab, heading bar, focus ring |
| `primary-edge` | `#16162e` | `#b8bc2e` | Keycap bottom edge of the primary button |
| `on-primary` | `#ffffff` | `#121212` | Text on `primary` |
| `highlight` | `#faff69` | `#faff69` | Highlighter behind HEAD and small labels; never a text color |
| `on-highlight` | `#1a1a1a` | `#121212` | Text on `highlight` |
| `highlight-soft` | `#f2f58a` | `#4b4c1c` | Soft marker stroke under key terms in lesson text, behind `ink` |
| `link` | `#3b61b0` | `#9fb4ff` | Links, Pro Git citations |
| `success` / `warning` / `danger` | `#2f8f3a` / `#9a6a00` / `#b42318` | `#5cc46a` / `#e0b84a` / `#f06a5f` | Marks and borders only, always with a word or ✓ ✗ |

### Git's three areas: draft → highlighted → inked

| Area | Look | Tokens |
|---|---|---|
| Working tree (draft) | `surface` zone, dashed outline; edited files have dashed edges | `git-working` |
| Staging area (highlighted) | Pale yellow zone; staged files get a highlighter stripe | `git-staging`, `git-staging-wash`, `git-staging-edge` |
| Repository (inked) | Solid ink zone; commits as snapshot cards | `git-repository`, `on-git-repository` |
| History lines | Current branch solid; another branch dotted; remote-tracking dashed | `git-branch`, `git-branch-alt`, `git-remote` |
| HEAD | Yellow "HEAD · you" pin | `highlight`, `on-highlight` |

### Terminal (dark in both themes)

`terminal-chrome` frame and title bar, `terminal-bg` screen with faint scanlines, `terminal-ink` text, `terminal-prompt` for the `❯` prompt and block cursor with a `terminal-glow` halo, `terminal-green` / `terminal-red` for Git's colored output.

## Typography

| Family | Font | Job |
|---|---|---|
| `serif` | Source Serif 4 | Reading: `lede`, `lesson`, `sidenote` |
| `mono` | JetBrains Mono | Headings `h1` `h2` `h3`, `code`, `terminal`, `label-mono` |
| `sans` | IBM Plex Sans | Interface: `body`, `small`, `caption`, `button` |

All three are free and open source and are bundled inside the app.

| Style | Size / line height | Weight | Use |
|---|---|---|---|
| `h1` | 32 / 40 | 700, -0.02em | Page and lesson titles |
| `h2` | 22 / 30 | 700, -0.01em | Sections, with a 3px `primary` bar |
| `h3` | 16 / 24 | 700 | Card titles |
| `lede` | 21 / 32 | 400 | One opening sentence per lesson |
| `lesson` | 18 / 30 | 400 | Lesson text, max 64 characters wide |
| `sidenote` | 15 / 23 | 400 italic | Pro Git quotes, margin notes |
| `body` | 16 / 24 | 400 | Interface text |
| `small` | 14 / 20 | 400 | Sidebar, notes |
| `caption` | 12 / 16 | 600, +0.06em, uppercase | Labels and eyebrows |
| `button` | 14 / 20 | 600 | Buttons and tabs |
| `code` | 14 / 22 | 400 | Code blocks; inline at ~0.86em |
| `terminal` | 14 / 22 | 400 | Terminal output |
| `label-mono` | 12 / 16 | 500 | Commit IDs, branch labels, keycap letters |

## Space, shape, depth, motion

| Group | Values |
|---|---|
| Spacing (4px base) | `space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-6` 24 · `space-8` 32 · `space-12` 48 · `space-16` 64 |
| Radius | `radius-small` 3px (inline code, badges) · `radius-medium` 5px (buttons, cards) · `radius-large` 8px (terminal, visualizer board) |
| Shadow | `shadow-floating` (menus, dialogs) · `shadow-window` (terminal only) |
| Motion | `duration-fast` 120ms · `duration-base` 200ms · `duration-visual` 320ms, ease-out; instant with reduce motion on |

## Layout

- **Every screen:** a 48px top bar (wordmark → Home, search box → Search with Ctrl K, Settings) and a sidebar (Home, Course map, Command index, Settings, path progress, current module's lessons).
- **Lesson screen:** sidebar folded to a 64px icon rail; lesson column (max 640px) on the left with Previous / Next at the bottom; visualizer board top right; terminal window bottom right.
- **Below 1100px window width:** visualizer and terminal share one panel with tabs; sidenotes flow under the text.
- **Navigation is never locked.** Any lesson opens from the course map, search or command index.

## Components

| Component | Rules |
|---|---|
| Buttons | Keycaps with a 3px bottom edge that press down 2px. Primary (`primary` face, `primary-edge`), secondary (`surface`, `border-strong`), ghost (text only). One primary per screen. |
| Segmented switch | Outlined group with a 3px bottom edge; the selected option is filled `primary`. Used for Pro / Book path, theme, Visualizer / Terminal. |
| Layer tabs | "1 Must know / 2 Under the hood / 3 Advanced", 2px `primary` underline on the active tab. |
| Lesson text | Eyebrow (lesson number box + module + Pro Git section), `h1`, tabs, one `lede`, short `lesson` paragraphs, definition rows, "Try it" steps, "Use today / In the book" comparison, sidenotes. |
| Mission panel | Worksheet ticket: dashed separator under the header, goal in serif, self-ticking checklist, Check / Reset / Hint actions. |
| Quiz | Scenario question in serif, answers lettered A–D on keycaps, feedback explaining why. |
| Visualizer | Dotted drawing board: desk of three zones with the moving command between them, metro-map history, caption bar explaining the last command. |
| Terminal | Retro-modern window as described under Color. |
| Notes | "Careful" with a 2px `warning` rule; "New vs. old" as two side-by-side cells. |

## Accessibility

- Text at least 4.5:1, marks and borders at least 3:1, in both themes.
- 2px `primary` focus ring on every interactive element.
- Status never by color alone.
- Full keyboard use; Esc moves focus out of the terminal.
- Reduce motion turns off visualizer animation and the cursor blink.

## Do and don't

| Do | Don't |
|---|---|
| Keep the interface neutral; let the visualizer carry meaning | Add orange, purple or any brand color to backgrounds or buttons |
| Use yellow only as a highlighter behind dark text | Put yellow text on white |
| Set headings and anything technical in mono | Set paragraphs in mono |
| Use serif for lesson reading | Use the serif for buttons or labels |
| Keep panels flat with hairlines and small radii | Add card shadows, pill buttons, gradients or colored left-border cards |

## Quick start: CSS custom properties

```css
:root {
  /* Interface */
  --canvas: #fafafa; --surface: #ffffff; --surface-sunken: #f2f2f0;
  --border: #e4e4e0; --border-strong: #8f8f99;
  --ink: #303055; --ink-muted: #5a5a6e; --ink-faint: #6e6e80;
  --primary: #303055; --primary-edge: #16162e; --on-primary: #ffffff;
  --highlight: #faff69; --on-highlight: #1a1a1a; --highlight-soft: #f2f58a; --link: #3b61b0;
  --success: #2f8f3a; --warning: #9a6a00; --danger: #b42318;
  /* Git areas */
  --git-working: #8f8f99; --git-staging: #faff69; --git-staging-wash: #fdffd6; --git-staging-edge: #6f7200;
  --git-repository: #303055; --on-git-repository: #ffffff;
  --git-branch: #303055; --git-branch-alt: #8f8f99; --git-remote: #6e6e80;
  /* Terminal */
  --terminal-bg: #141412; --terminal-chrome: #232320; --terminal-ink: #f1f0e4; --terminal-muted: #8f8e82;
  --terminal-prompt: #faff69; --terminal-glow: rgba(250, 255, 105, 0.28);
  --terminal-green: #7fdc8a; --terminal-red: #ff8a7a;
  /* Type */
  --font-mono: "JetBrains Mono", Consolas, monospace;
  --font-serif: "Source Serif 4", Georgia, serif;
  --font-sans: "IBM Plex Sans", system-ui, sans-serif;
  /* Shape and motion */
  --radius-small: 3px; --radius-medium: 5px; --radius-large: 8px;
  --duration-fast: 120ms; --duration-base: 200ms; --duration-visual: 320ms;
}

[data-theme="dark"] {
  --canvas: #121212; --surface: #1a1a1a; --surface-sunken: #0d0d0d;
  --border: #2a2a2a; --border-strong: #6b6b6b;
  --ink: #f2f2f2; --ink-muted: #a3a3a3; --ink-faint: #8a8a8a;
  --primary: #faff69; --primary-edge: #b8bc2e; --on-primary: #121212;
  --on-highlight: #121212; --highlight-soft: #4b4c1c; --link: #9fb4ff;
  --success: #5cc46a; --warning: #e0b84a; --danger: #f06a5f;
  --git-working: #7a7a7a; --git-staging-wash: #24250f; --git-staging-edge: #c9cc3f;
  --git-repository: #f2f2f2; --on-git-repository: #121212;
  --git-branch: #f2f2f2; --git-branch-alt: #7a7a7a; --git-remote: #a3a3a3;
  --terminal-bg: #0b0b0a; --terminal-chrome: #181816;
}
```
