import type { Variable } from "@/domain/stores/pipelines-store";

const regexes = {
  bulletListItem: /^-\s*([\w-]+):\s*(.*)$/,
  whitespace: /(\s+)/,
  variableInBraces: /\{([\w-]+)\}/g,
  variableMatch: /^\{[^}]*\}$/,
  variableSplit: /(\{[^}]*\})/,
};

export const extractVariableNames = (
  commands: { value: string }[]
): string[] => {
  const allVarNames = new Set<string>();

  commands.forEach((command) => {
    const matches = command.value.match(regexes.variableInBraces);
    if (matches) {
      matches.forEach((match) => {
        const varName = match.slice(1, -1);
        allVarNames.add(varName);
      });
    }
  });

  return Array.from(allVarNames);
};

export const parseVarsFromBulletList = (text: string): Variable[] => {
  const lines = text.split("\n");
  const vars: Variable[] = [];

  for (const line of lines) {
    const match = line.match(regexes.bulletListItem);
    if (match) {
      const [, name, value] = match;
      vars.push({ name, value: value.trim() });
    }
  }

  return vars;
};

export const serializeVarsToBulletList = (vars: Variable[]): string => {
  return vars.map((v) => `- ${v.name}: ${v.value}`).join("\n");
};

export const createFilledVariablesSet = (vars?: Variable[]): Set<string> => {
  const filled = new Set<string>();
  if (vars) {
    vars.forEach((variable) => {
      if (variable.value.trim() !== "") {
        filled.add(variable.name);
      }
    });
  }
  return filled;
};

export const withVars = (command: string, vars: Variable[]): string => {
  return command.replace(regexes.variableInBraces, (match, varName) => {
    const variable = vars.find((v) => v.name === varName);
    return variable ? variable.value : match;
  });
};

export type TextChunk = {
  text: string;
  isVariable: boolean;
};

export const splitByVariables = (text: string): TextChunk[] => {
  const parts = text.split(regexes.variableSplit);
  const chunks: TextChunk[] = [];

  for (const part of parts) {
    if (part === "") continue;

    if (part.match(regexes.variableMatch)) {
      const varName = part.slice(1, -1);
      chunks.push({ text: varName, isVariable: true });
    } else {
      const textParts = part.split(regexes.whitespace);
      for (const textPart of textParts) {
        if (textPart !== "") {
          chunks.push({ text: textPart, isVariable: false });
        }
      }
    }
  }

  return chunks;
};
