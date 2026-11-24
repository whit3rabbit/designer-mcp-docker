'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'ar';
const RTL_LOCALES = new Set<SupportedLocale>(['ar']);

export interface LocaleState {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: SupportedLocale) => void;
}

function syncLocaleDom(locale: SupportedLocale) {
  const dir: 'ltr' | 'rtl' = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('dir', dir);
  }
  return dir;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      dir: 'ltr',
      setLocale: (locale) => {
        const dir = syncLocaleDom(locale);
        set({ locale, dir });
      },
    }),
    {
      name: 'rd-locale',
      onRehydrateStorage: () => (state) => {
        if (state) syncLocaleDom(state.locale);
      },
    },
  ),
);
