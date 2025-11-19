export type KeyHandler = (key: string, event: KeyboardEvent) => boolean;

let prio = 1;
const next = () => prio++;

export const nuphyPriorities = {
  notesPanel: next(), // handled first
  command: next(),
  pipelineForm: next(),
  varsPanel: next(),
  commandItem: next(),
  pipelinePanel: next(),
  root: next(),
} as const;

export type KnownNuphy = keyof typeof nuphyPriorities;
