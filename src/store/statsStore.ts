import { create } from "zustand";

interface StatsState {
  // Análisis stats
  totalAnalyses: number;
  totalPatients: number;
  completedPercentage: number;

  // User stats
  totalUsers: number;
  blockedUsers: number;
  adminUsers: number;

  // Actions
  setStats: (
    stats: Partial<Omit<StatsState, "setStats" | "setUserStats">>
  ) => void;
  setUserStats: (
    userStats: Pick<StatsState, "totalUsers" | "blockedUsers" | "adminUsers">
  ) => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  // Initial análisis stats
  totalAnalyses: 0,
  totalPatients: 0,
  completedPercentage: 0,

  // Initial user stats
  totalUsers: 0,
  blockedUsers: 0,
  adminUsers: 0,

  // Actions
  setStats: (stats) => set((state) => ({ ...state, ...stats })),
  setUserStats: (userStats) => set(userStats),
}));
