import { app, BrowserWindow, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'node:path';
import { loadWindowState, saveWindowState } from './window-state';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const windowState = loadWindowState();
  const win = new BrowserWindow({
    title: 'Scholar',
    autoHideMenuBar: true,
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    backgroundColor: '#0f172a',
    icon: path.join(__dirname, '..', '..', 'public', 'scholar-logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.setMenuBarVisibility(false);
  mainWindow = win;

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

function initializeAutoUpdates(): void {
  if (!app.isPackaged) {
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('error', (error) => {
    console.error('Auto-update error', error);
  });

  autoUpdater.on('update-downloaded', async () => {
    const messageBoxOptions: Electron.MessageBoxOptions = {
      type: 'info',
      buttons: ['Restart now', 'Later'],
      defaultId: 0,
      cancelId: 1,
      title: 'Update ready',
      message: 'A new version of Scholar has been downloaded.',
      detail: 'Restart the app now to finish installing the update.',
    };

    const { response } =
      mainWindow && !mainWindow.isDestroyed()
        ? await dialog.showMessageBox(mainWindow, messageBoxOptions)
        : await dialog.showMessageBox(messageBoxOptions);

    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  void autoUpdater.checkForUpdatesAndNotify();
}

app.whenReady().then(() => {
  app.setName('Scholar');
  createWindow();
  initializeAutoUpdates();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  mainWindow = null;

  if (process.platform !== 'darwin') {
    app.quit();
  }
});
