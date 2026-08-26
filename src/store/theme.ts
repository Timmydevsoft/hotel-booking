import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'evergreen-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
    set({ theme });
  },
  toggle: () => {
    get().setTheme(get().theme === 'dark' ? 'light' : 'dark');
  },
}));

// Apply the chosen theme before first paint so there is no flash of the wrong mode.
applyTheme(useThemeStore.getState().theme);
