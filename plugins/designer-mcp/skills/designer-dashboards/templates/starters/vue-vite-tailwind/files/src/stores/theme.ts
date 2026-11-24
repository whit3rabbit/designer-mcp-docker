import { defineStore } from 'pinia';

export const useThemeStore = defineStore('rd-theme', {
  state: () => ({
    theme: 'system' as 'system' | 'light' | 'dark',
    dir: 'ltr' as 'ltr' | 'rtl',
    cardStyle: 'elevated' as 'elevated' | 'bordered',
  }),
  actions: {
    applyDom() {
      const root = document.documentElement;
      const isDark =
        this.theme === 'dark' ||
        (this.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
      root.classList.toggle('dark', isDark);
      root.setAttribute('dir', this.dir);
      root.setAttribute('data-card-style', this.cardStyle);
    },
    toggleDarkMode() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      this.applyDom();
    },
    toggleDir() {
      this.dir = this.dir === 'ltr' ? 'rtl' : 'ltr';
      this.applyDom();
    },
  },
  persist: true,
});
