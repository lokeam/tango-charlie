import MoonIcon from '@/components/ui/icons/MoonIcon';
import SunIcon from '@/components/ui/icons/SunIcon';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const mediaQuery = window.matchMedia('prefers-color-scheme: dark');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleThemeChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    }

    mediaQuery.addEventListener('change', handleThemeChange);

    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  const handleSwitchThemeButtonClick = () => {
    switch(theme) {
      case 'light':
        setTheme('dark');
        break;
      case 'dark':
        setTheme('light');
        break;
      case 'system':
        setTheme(systemTheme === 'light' ? 'dark' : 'light');
        break;
      default:
        break;
    }
  }

  return (
    <button
      onClick={handleSwitchThemeButtonClick}
      className="hover:shadow-input relative flex cursor-pointer items-center justify-center rounded-xl p-2 text-neutral-500 dark:text-neutral-500"
    >
      <SunIcon className="size-4 scale-100 rotate-0 text-gray-600 transition-all dark:scale-0 dark:-rotate-90 dark:text-gray-300" />
      <MoonIcon className="absolute size-4 scale-0 rotate-90 text-gray-600 transition-all dark:scale-100 dark:rotate-0 dark:text-gray-300" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
};
