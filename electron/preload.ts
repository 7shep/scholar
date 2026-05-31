import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('desktopApp', {
  version: process.versions.electron,
});

export {};
