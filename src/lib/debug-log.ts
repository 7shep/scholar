// Lightweight debug logging for tracing the syllabus -> assignments pipeline.
//
// Enabled automatically during development (`npm run dev`). In a packaged build,
// turn it on from the DevTools console with:
//   localStorage.setItem("school-organizer:debug", "1")
// and off again with:
//   localStorage.removeItem("school-organizer:debug")
//
// Open DevTools inside the app with Ctrl+Shift+I (Cmd+Opt+I on macOS) or F12,
// then watch the Console for messages prefixed with `[debug:...]`.

const DEBUG_FLAG_KEY = "school-organizer:debug";

export function isDebugLoggingEnabled(): boolean {
  if (import.meta.env.DEV) {
    return true;
  }

  try {
    return window.localStorage.getItem(DEBUG_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export function setDebugLogging(enabled: boolean): void {
  try {
    if (enabled) {
      window.localStorage.setItem(DEBUG_FLAG_KEY, "1");
    } else {
      window.localStorage.removeItem(DEBUG_FLAG_KEY);
    }
  } catch {
    // No localStorage (e.g. non-browser context): nothing to persist.
  }
}

export function debugLog(scope: string, message: string, data?: unknown): void {
  if (!isDebugLoggingEnabled()) {
    return;
  }

  if (data === undefined) {
    console.log(`[debug:${scope}] ${message}`);
  } else {
    console.log(`[debug:${scope}] ${message}`, data);
  }
}

// Renders a list of rows as a console table, which is the most readable way to
// eyeball "the assignments it wants to add".
export function debugTable(
  scope: string,
  message: string,
  rows: Array<Record<string, unknown>>,
): void {
  if (!isDebugLoggingEnabled()) {
    return;
  }

  console.log(
    `[debug:${scope}] ${message} (${rows.length} row${rows.length === 1 ? "" : "s"})`,
  );

  if (rows.length > 0) {
    console.table(rows);
  }
}
