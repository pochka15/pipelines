import type { Variable, Pipeline } from "@/domain/stores/pipelines-store";
import { updateRawVars } from "@/lib/template-vars";

const EDIT_REGEX = /^edit\s+(\S+)\s+(.+)$/;

export const parseEditCommand = (command: string) => {
  const match = command.match(EDIT_REGEX);
  if (!match) return undefined;
  return { varName: match[1], newValue: match[2].trim() };
};

export const getEditSuggestion = (
  inputValue: string,
  pipelineVars: Variable[]
): string => {
  // Check if input starts with "edit "
  if (!inputValue.startsWith("edit ")) {
    return "";
  }

  const afterEdit = inputValue.slice(5); // Remove "edit "

  if (afterEdit === "") {
    // Suggest the first variable name
    return pipelineVars[0]?.name || "";
  }

  // Find first variable that starts with the prefix (case-insensitive)
  const match = pipelineVars.find((v) =>
    v.name.toLowerCase().startsWith(afterEdit.toLowerCase())
  );

  if (match && match.name.toLowerCase() !== afterEdit.toLowerCase()) {
    // Return the remaining part of the suggestion
    return match.name.slice(afterEdit.length);
  }

  return "";
};

export const executeEditCommand = (
  command: string,
  pipeline: Pipeline
): { success: true; updated: Pipeline } | { success: false; error: string } => {
  const parsed = parseEditCommand(command);

  if (!parsed) {
    return {
      success: false,
      error: "Expected format: edit <var-name> <new-value>",
    };
  }

  const { varName, newValue } = parsed;

  // Check if variable exists
  const varExists = pipeline.vars.parsed.some((v) => v.name === varName);

  if (!varExists) {
    return {
      success: false,
      error: `Variable "${varName}" not found`,
    };
  }

  // Update parsed vars
  const updatedParsedVars = pipeline.vars.parsed.map((v) =>
    v.name === varName ? { ...v, value: newValue } : v
  );

  // Update raw vars
  const updatedRaw = updateRawVars(pipeline.vars.raw, varName, newValue);

  return {
    success: true,
    updated: {
      ...pipeline,
      vars: { raw: updatedRaw, parsed: updatedParsedVars },
    },
  };
};
