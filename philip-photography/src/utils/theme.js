const STORAGE_KEY = 'theme';

export function getSystemPreference() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  return getSystemPreference();
}

export function applyTheme(theme) {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function initTheme() {
  const saved = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null } })();
  const applyCurrent = () => applyTheme(saved === 'dark' || saved === 'light' ? saved : getSystemPreference());
  applyCurrent();

  // If user hasn't explicitly chosen a theme, follow system changes live
  if (saved !== 'dark' && saved !== 'light' && typeof window !== 'undefined') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => applyCurrent();
    try {
      mq.addEventListener('change', listener);
    } catch {
      // Safari
      mq.addListener(listener);
    }
  }
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const next = isDark ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  return next;
}


