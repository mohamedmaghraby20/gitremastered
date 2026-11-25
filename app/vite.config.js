/**
 * vite.config.js
 * Settings for Vite, the tool that serves the screens while developing and bundles them for release.
 * The server settings below are the ones Tauri needs during `pnpm tauri dev`.
 */

import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
// @ts-expect-error type error without @types/node package
import process from "node:process";

// Set by Tauri when developing on a phone or another device; empty on the desktop.
const tauriDevHost = process.env.TAURI_DEV_HOST;

/**
 * Builds the Vite settings.
 * @returns the Vite configuration object
 */
export default defineConfig(() => ({
  plugins: [sveltekit()],

  // Keep Rust's error messages visible in the terminal instead of clearing the screen.
  clearScreen: false,

  server: {
    /**
     * Tauri expects the screens on this exact port (see devUrl in src-tauri/tauri.conf.json).
     * strictPort makes Vite fail instead of quietly picking another port.
     */
    port: 1420,
    strictPort: true,
    host: tauriDevHost || "127.0.0.1",
    hmr: tauriDevHost
      ? {
          protocol: "ws",
          host: tauriDevHost,
          port: 1421,
        }
      : undefined,
    watch: {
      // Rust files are rebuilt by Tauri itself, so Vite does not need to watch them.
      ignored: ["**/src-tauri/**"],
    },
  },
}));
