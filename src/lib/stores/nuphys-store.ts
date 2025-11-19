import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type Mode<T = unknown> = { enabled: boolean; data: T };

export type Modes = {
  showingCommand: Mode;
  showingNotes: Mode;
};

export type ModeName = keyof Modes;

interface NuphysState {
  modes: Modes;

  enableMode: <T extends ModeName>(name: T, data?: Modes[T]["data"]) => void;
  disableModes: (names: ModeName[]) => void;
  getMode: <T extends ModeName>(name: T) => Modes[T];
}

const getDefaultModes = (): Modes => ({
  showingCommand: { enabled: false, data: {} },
  showingNotes: { enabled: false, data: {} },
});

const getDefaultMode = <T extends ModeName>(name: T): Modes[T] => {
  return getDefaultModes()[name];
};

export const useNuphyStore = create<NuphysState>()(
  immer((set, get) => ({
    modes: getDefaultModes(),

    getMode: (name) => get().modes[name],

    enableMode: (name, data) =>
      set((state) => {
        state.modes[name] = { ...getDefaultMode(name), enabled: true, data };
      }),

    disableModes: (names) =>
      set((state) => {
        for (const n of names) state.modes[n].enabled = false;
      }),
  }))
);

export const useNuphyMode = <T extends ModeName>(name: T): Modes[T] => {
  return useNuphyStore((it) => it.modes[name]);
};
