import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { loadWindowState, saveWindowState } from './window-state';

function createWindow(): void {
  const windowState = loadWindowState();
  const win = new BrowserWindow({
    autoHideMenuBar: true,
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.setMenuBarVisibility(false);

  const persistWindowState = (): void => {
    if (win.isMinimized()) {
      return;
    }

    const bounds = win.getNormalBounds();

    saveWindowState({
      ...bounds,
      isFullScreen: win.isFullScreen(),
      isMaximized: win.isMaximized(),
    });
  };

  if (windowState.isFullScreen) {
    win.setFullScreen(true);
  } else if (windowState.isMaximized) {
    win.maximize();
  }

  win.on('resize', persistWindowState);
  win.on('move', persistWindowState);
  win.on('maximize', persistWindowState);
  win.on('unmaximize', persistWindowState);
  win.on('enter-full-screen', persistWindowState);
  win.on('leave-full-screen', persistWindowState);
  win.on('close', persistWindowState);

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    win.loadURL(devServerUrl);
    return;
  }

  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
