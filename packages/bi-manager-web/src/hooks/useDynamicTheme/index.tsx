import { TTheme } from '@/interface';
import { DARK_COLOR, LIGHT_COLOR, THEME_KEY, updateTheme } from '@/utils/theme';
import { useEffect, useState } from 'react';
/** 动态改变主题 */
export default function useDaynamicTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>((window.localStorage.getItem(THEME_KEY) as TTheme) || 'light');

  useEffect(() => {
    window.addEventListener('message', ({ data }) => {
      const { theme: t } = data || {};
      if(t){
        setTheme(t);
      }
    });
  }, []);

  const isDark = theme === 'dark';
  // 监听外层的容器的
  useEffect(() => {
    if (theme) {
      updateTheme(isDark, isDark ? DARK_COLOR : LIGHT_COLOR);
    }
  }, [theme]);

  return [theme, isDark];
}
