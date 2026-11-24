'use client';

import { create } from 'zustand';

export interface RouteKeyState {
  currentRouteKey: string;
  setCurrentRouteKey: (key: string) => void;
}

export const useRouteKeyStore = create<RouteKeyState>()((set) => ({
  currentRouteKey: 'dashboard.analytics',
  setCurrentRouteKey: (currentRouteKey) => set({ currentRouteKey }),
}));
