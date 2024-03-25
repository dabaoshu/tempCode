import { create } from "zustand";

export const usePositionStore = create<{ baseTime: number; list: any[] }>(
  (set, get) => ({
    baseTime: 0, // 基准时间
    list: [],
    pushPosition: (position) => {
      const list = get().list;
      const newList = [...list, position];
      set({ list: newList });
    },
    initStore: (position) => {
      const { time } = position;
      set({ list: [position], baseTime: time });
    },
  })
);
