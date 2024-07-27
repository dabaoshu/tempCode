import { eventBus } from "@/Robot/utils";
import { create } from "zustand";
interface Store {
  player: boolean;
  follow: boolean;
  runing: boolean;
  isLongPressing: boolean;
}
const postMessage = (eventName: string, type: string) => {
  eventBus.emit(eventName, type);
};

export const useRobotStore = create<Store>((set, get) => ({
  follow: false,
  runing: false,
  isLongPressing: false,
  player: false,
  setFollow: (follow: boolean) => set({ follow }),
  postClickMessage: (type: string) => {
    const runing = get().runing;
    if (!runing) {
      return;
    }
    postMessage("fetchAction", type);
  },
  start: () => {
    set({ runing: true });
    postMessage("fetchAction", "start");
  },
  stop: () => {
    set({ runing: false });
    postMessage("fetchAction", "stop");
  },
  reset: () => {
    eventBus.emit("reset");
  },
  playerStart: () => {
    eventBus.emit("robot_play")
    set({ player: true })
  },
  playerStop: () => {
    eventBus.emit("robot_stop")
    set({ player: false })
  },
}));
