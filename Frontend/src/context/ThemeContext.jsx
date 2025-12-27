import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('skl_theme') : null;
    return stored === 'green' ? 'green' : 'blue';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { window.localStorage.setItem('skl_theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'blue' ? 'green' : 'blue'));
  const setThemeExplicit = (value) => setTheme(value === 'green' ? 'green' : 'blue');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeExplicit }}>
      {children}
    </ThemeContext.Provider>
  );
}
