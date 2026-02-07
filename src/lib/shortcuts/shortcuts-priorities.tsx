let priority = 1;
const next = () => priority++;

export const shortcutsPriorities = {
  notesPanel: next(), // handled first
  command: next(),
  pipelineForm: next(),
  varsPanel: next(),
  commandItem: next(),
  pipelinePanel: next(),
  help: next(),
  root: next(),
} as const;
