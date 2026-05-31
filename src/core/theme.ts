import { getThemePreference, setThemePreference, type ThemePreference } from './storage';

function applyTheme(pref: ThemePreference) {
  const isDark = pref === 'dark' ||
    (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.classList.toggle('light', !isDark);

  // 更新图标
  const themeBtn = document.querySelector('[data-action="toggle-theme"]');
  if (themeBtn) {
    const svg = themeBtn.querySelector('svg');
    if (svg) {
      svg.innerHTML = isDark
        ? '<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>'
        : '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
    }
  }
}

export function initTheme() {
  const pref = getThemePreference();
  applyTheme(pref);

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getThemePreference() === 'system') {
      applyTheme('system');
    }
  });

  // 手动切换
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('[data-action="toggle-theme"]');
    if (!target) return;

    const current = getThemePreference();
    const next: ThemePreference = current === 'dark' ? 'light' : 'dark';
    setThemePreference(next);
    applyTheme(next);
  });
}
