import { app, type Rectangle } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

type WindowBounds = Pick<Rectangle, 'width' | 'height'> &
  Partial<Pick<Rectangle, 'x' | 'y'>>;

type PersistedWindowState = WindowBounds & {
  isFullScreen: boolean;
  isMaximized: boolean;
};

const DEFAULT_WINDOW_BOUNDS: WindowBounds = {
  width: 1280,
  height: 800,
};

const WINDOW_STATE_PATH = path.join(app.getPath('userData'), 'window-state.json');

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidRectangle(value: unknown): value is WindowBounds {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybeRectangle = value as Partial<WindowBounds>;

  return (
    isFiniteNumber(maybeRectangle.width) &&
    isFiniteNumber(maybeRectangle.height) &&
    maybeRectangle.width > 0 &&
    maybeRectangle.height > 0 &&
    (maybeRectangle.x === undefined || isFiniteNumber(maybeRectangle.x)) &&
    (maybeRectangle.y === undefined || isFiniteNumber(maybeRectangle.y))
  );
}

export function loadWindowState(): PersistedWindowState {
  try {
    const raw = fs.readFileSync(WINDOW_STATE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<PersistedWindowState>;

    if (!isValidRectangle(parsed)) {
      return {
        ...DEFAULT_WINDOW_BOUNDS,
        isFullScreen: false,
        isMaximized: false,
      };
    }

    const validatedBounds = parsed as WindowBounds;
    const parsedState = parsed as Partial<PersistedWindowState>;

    return {
      ...(parsedState.x !== undefined ? { x: parsedState.x } : {}),
      ...(parsedState.y !== undefined ? { y: parsedState.y } : {}),
      width: validatedBounds.width,
      height: validatedBounds.height,
      isFullScreen:
        typeof parsedState.isFullScreen === 'boolean' ? parsedState.isFullScreen : false,
      isMaximized:
        typeof parsedState.isMaximized === 'boolean' ? parsedState.isMaximized : false,
    };
  } catch {
    return {
      ...DEFAULT_WINDOW_BOUNDS,
      isFullScreen: false,
      isMaximized: false,
    };
  }
}

export function saveWindowState(state: PersistedWindowState): void {
  try {
    fs.mkdirSync(path.dirname(WINDOW_STATE_PATH), { recursive: true });
    fs.writeFileSync(WINDOW_STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch {
    // Ignore persistence failures so window lifecycle stays uninterrupted.
  }
}

export type { PersistedWindowState };
