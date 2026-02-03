'use client';

import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

function getPreferredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const preferred = getPreferredTheme();
    setTheme(preferred);
    document.documentElement.dataset.theme = preferred;
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem('theme', next);
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '6px 10px',
        borderRadius: 10,
        border: '1px solid var(--header-border)',
        background: 'var(--header-bg)',
        color: 'var(--text)',
        fontSize: 12,
        cursor: 'pointer',
      }}
      aria-label='Toggle theme'
      title='Toggle theme'
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
