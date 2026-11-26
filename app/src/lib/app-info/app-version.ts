/**
 * app-version.ts
 * The app's version, read from package.json when the app is built, for Settings → About.
 * (tauri.conf.json carries the same number; the release task keeps the two in step.)
 */

import packageJson from '../../../package.json';

/** The version, like "0.1.0". */
export const appVersion: string = packageJson.version;
