function getLocalStorage(): Storage | null {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage;
  } catch {
    // Accessing `localStorage` can throw when storage is disabled (e.g. some
    // private-browsing or hardened environments).
    return null;
  }
}

export function safeLocalStorageGet(key: string): string | null {
  const storage = getLocalStorage();

  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function safeLocalStorageSet(key: string, value: string): void {
  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(key, value);
  } catch {
    // Ignore write failures such as exceeded quota or blocked storage.
  }
}
