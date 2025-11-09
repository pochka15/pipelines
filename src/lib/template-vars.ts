import type { Variable } from "@/domain/stores/pipelines-store";

export const extractVariableNames = (commands: { value: string }[]): string[] => {
  const allVarNames = new Set<string>();

  commands.forEach((command) => {
    const matches = command.value.match(/\{(\w+)\}/g);
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
    const match = line.match(/^-\s*(\w+):\s*(.*)$/);
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
  return command.replace(/\{(\w+)\}/g, (match, varName) => {
    const variable = vars.find(v => v.name === varName);
    return variable ? variable.value : match;
  });
};
