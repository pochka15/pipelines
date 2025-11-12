import { useState, useEffect } from "react";
import { usePipelinesStore } from "@/domain/stores/pipelines-store";
import { useUiStore } from "@/domain/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useShortcuts } from "@/lib/hooks/use-shortcuts";
import {
  parseVarsFromBulletList,
  serializeVarsToBulletList,
  extractVariableNames,
} from "@/lib/template-vars";

export const VarsPanel = ({ onSwitchBack }: { onSwitchBack: () => void }) => {
  const pipelines = usePipelinesStore((s) => s.pipelines);
  const updatePipeline = usePipelinesStore((s) => s.updatePipeline);
  const focusedPipelineId = useUiStore((s) => s.focusedPipelineId);
  const focusedPipeline = pipelines.find((p) => p.id === focusedPipelineId);
  useShortcuts({ escape: onSwitchBack });

  const [textareaValue, setTextareaValue] = useState(() => {
    if (!focusedPipeline) return "";

    if (focusedPipeline.vars?.length) {
      return serializeVarsToBulletList(focusedPipeline.vars);
    } else {
      const varNames = extractVariableNames(focusedPipeline.commands);
      return varNames.map((varName) => `- ${varName}: `).join("\n");
    }
  });

  const debouncedTextareaValue = useDebounce(textareaValue, 200);

  useEffect(() => {
    if (focusedPipeline) {
      const parsedVars = parseVarsFromBulletList(debouncedTextareaValue);
      updatePipeline({ ...focusedPipeline, vars: parsedVars });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTextareaValue, updatePipeline]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(e.target.value);
  };

  const handleFill = () => {
    if (!focusedPipeline) return;

    const existingVarNames = focusedPipeline.vars?.map((v) => v.name) || [];
    const allVarNames = extractVariableNames(focusedPipeline.commands);

    const newVars = allVarNames
      .filter((varName) => !existingVarNames.includes(varName))
      .map((varName) => `- ${varName}: todo`);

    if (newVars.length > 0) {
      const newText =
        textareaValue + (textareaValue ? "\n" : "") + newVars.join("\n");
      setTextareaValue(newText);

      const parsedVars = parseVarsFromBulletList(newText);
      updatePipeline({
        ...focusedPipeline,
        vars: parsedVars,
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Variables</h2>
        <Button onClick={handleFill} variant="outline" size="sm">
          Fill
        </Button>
      </div>
      <Textarea
        value={textareaValue}
        onChange={handleTextareaChange}
        placeholder="- varName: value"
        className="min-h-[200px] font-mono text-sm"
      />
    </div>
  );
};
