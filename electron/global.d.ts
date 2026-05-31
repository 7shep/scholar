export {};

declare global {
  interface Window {
    desktopApp?: {
      version: string;
    };
  }
}
