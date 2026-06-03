import { afterEach, describe, expect, it, vi } from "vitest";

import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/safe-storage";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("safeLocalStorageGet", () => {
  it("returns the stored value when storage is available", () => {
    const getItem = vi.fn().mockReturnValue("stored-value");
    vi.stubGlobal("window", { localStorage: { getItem } });

    expect(safeLocalStorageGet("key")).toBe("stored-value");
    expect(getItem).toHaveBeenCalledWith("key");
  });

  it("returns null when reading throws (e.g. storage blocked)", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("storage blocked");
        },
      },
    });

    expect(safeLocalStorageGet("key")).toBeNull();
  });

  it("returns null when window is unavailable", () => {
    vi.stubGlobal("window", undefined);

    expect(safeLocalStorageGet("key")).toBeNull();
  });
});

describe("safeLocalStorageSet", () => {
  it("writes the value when storage is available", () => {
    const setItem = vi.fn();
    vi.stubGlobal("window", { localStorage: { setItem } });

    safeLocalStorageSet("key", "value");

    expect(setItem).toHaveBeenCalledWith("key", "value");
  });

  it("does not throw when writing fails (e.g. quota exceeded)", () => {
    vi.stubGlobal("window", {
      localStorage: {
        setItem: () => {
          throw new Error("quota exceeded");
        },
      },
    });

    expect(() => safeLocalStorageSet("key", "value")).not.toThrow();
  });

  it("does nothing when window is unavailable", () => {
    vi.stubGlobal("window", undefined);

    expect(() => safeLocalStorageSet("key", "value")).not.toThrow();
  });
});
