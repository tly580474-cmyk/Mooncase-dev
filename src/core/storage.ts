const PREFIX = 'moonbox_';

export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // localStorage quota exceeded or not available
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

// 最近使用记录
export interface RecentTool {
  id: string;
  name: string;
  timestamp: number;
}

const MAX_RECENT = 10;

export function getRecentTools(): RecentTool[] {
  return getItem<RecentTool[]>('recent', []);
}

export function addRecentTool(id: string, name: string): void {
  const recent = getRecentTools().filter(r => r.id !== id);
  recent.unshift({ id, name, timestamp: Date.now() });
  setItem('recent', recent.slice(0, MAX_RECENT));
}

export function clearRecentTools(): void {
  setItem('recent', []);
}

// 主题偏好
export type ThemePreference = 'light' | 'dark' | 'system';

export function getThemePreference(): ThemePreference {
  return getItem<ThemePreference>('theme', 'system');
}

export function setThemePreference(pref: ThemePreference): void {
  setItem('theme', pref);
}

// 工具收藏
export function getFavoriteTools(): string[] {
  return getItem<string[]>('favorites', []);
}

export function toggleFavoriteTool(id: string): boolean {
  const favs = getFavoriteTools();
  const index = favs.indexOf(id);
  if (index >= 0) {
    favs.splice(index, 1);
    setItem('favorites', favs);
    return false;
  }
  favs.push(id);
  setItem('favorites', favs);
  return true;
}

export function isFavoriteTool(id: string): boolean {
  return getFavoriteTools().includes(id);
}
