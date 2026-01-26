import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { KnownNuphy } from "../nuphy/mappings";

type Mode<T = unknown> = { enabled: boolean; data: T };

export type Modes = {
  showingHelp: Mode;
  showingCommand: Mode;
  showingNotes: Mode;
};

export type ModeName = keyof Modes;

interface NuphysState {
  modes: Modes;
  activeNuphys: KnownNuphy[];

  enableMode: <T extends ModeName>(name: T, data?: Modes[T]["data"]) => void;
  disableModes: (names: ModeName[]) => void;
  getMode: <T extends ModeName>(name: T) => Modes[T];
  setActiveNuphys: (active: KnownNuphy[]) => void;
}

const getDefaultModes = (): Modes => ({
  showingHelp: { enabled: false, data: {} },
  showingCommand: { enabled: false, data: {} },
  showingNotes: { enabled: false, data: {} },
});

const getDefaultMode = <T extends ModeName>(name: T): Modes[T] => {
  return getDefaultModes()[name];
};

export const useNuphyStore = create<NuphysState>()(
  immer((set, get) => ({
    modes: getDefaultModes(),
    activeNuphys: [],

    getMode: (name) => get().modes[name],

    enableMode: (name, data) =>
      set((state) => {
        state.modes[name] = { ...getDefaultMode(name), enabled: true, data };
      }),

    disableModes: (names) =>
      set((state) => {
        for (const n of names) state.modes[n].enabled = false;
      }),

    // Should only be called by the NuphyProvider
    setActiveNuphys: (active) =>
      set((state) => {
        state.activeNuphys = active;
      }),
  }))
);

export const useNuphyMode = <T extends ModeName>(name: T): Modes[T] => {
  return useNuphyStore((it) => it.modes[name]);
};
