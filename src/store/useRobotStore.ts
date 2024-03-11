import { create } from "zustand";


interface Store {
  follow: boolean;
  runing: boolean;
}

export const useRobotStore = create<Store>((set, get) => ({
  follow: false,
  runing: false,
  setFollow: (follow: boolean) => set({ follow }),
  setRunning: (runing: boolean) => set({ runing }),
}));
