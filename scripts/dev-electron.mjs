import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const electronBinary = path.join(rootDir, "node_modules", ".bin", "electron.cmd");
const mainOutput = path.join(rootDir, "dist", "electron", "main.js");
const watchDirectory = path.join(rootDir, "dist", "electron");

let electronProcess = null;
let restartTimer = null;

function startElectron() {
  if (!existsSync(mainOutput)) {
    return;
  }

  const child = spawn(electronBinary, ["."], {
    cwd: rootDir,
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: "http://127.0.0.1:5173",
    },
    stdio: "inherit",
  });

  electronProcess = child;

  child.on("exit", (code, signal) => {
    if (restartTimer !== null) {
      return;
    }

    const message =
      signal !== null
        ? `Electron exited with signal ${signal}`
        : `Electron exited with code ${code ?? 0}`;

    console.log(message);
  });
}

function stopElectron() {
  if (!electronProcess || electronProcess.killed) {
    return;
  }

  electronProcess.kill();
  electronProcess = null;
}

function restartElectron() {
  if (restartTimer !== null) {
    clearTimeout(restartTimer);
  }

  restartTimer = setTimeout(() => {
    restartTimer = null;
    stopElectron();
    startElectron();
  }, 150);
}

console.log("Watching Electron output for changes...");

if (existsSync(mainOutput)) {
  startElectron();
} else {
  console.log("Waiting for dist/electron/main.js to be compiled...");
}

watch(watchDirectory, { persistent: true }, (_eventType, filename) => {
  if (!filename || !filename.endsWith(".js")) {
    return;
  }

  restartElectron();
});

process.on("SIGINT", () => {
  stopElectron();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopElectron();
  process.exit(0);
});
