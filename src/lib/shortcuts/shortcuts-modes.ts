export type Mode<T = unknown> = { enabled: boolean; data: T };

export type Modes = {
  showingHelp: Mode;
  showingCommand: Mode;
  showingNotes: Mode;
};

export type ModeName = keyof Modes;

export const getDefaultModes = (): Modes => ({
  showingHelp: { enabled: false, data: {} },
  showingCommand: { enabled: false, data: {} },
  showingNotes: { enabled: false, data: {} },
});
