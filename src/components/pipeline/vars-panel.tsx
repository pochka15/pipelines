import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePipelinesStore } from "@/domain/stores/pipelines-store";
import { useUiStore } from "@/domain/stores/ui-store";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { keyboardShortcuts } from "@/lib/nuphy/mappings";
import { useNuphy } from "@/lib/nuphy/use-nuphy";
import {
  extractVariableNames,
  parseVarsFromBulletList,
} from "@/lib/template-vars";
import { useEffect, useRef, useState } from "react";

export const VarsPanel = ({ onSwitchBack }: { onSwitchBack: () => void }) => {
  const pipelines = usePipelinesStore((s) => s.pipelines);
  const updatePipeline = usePipelinesStore((s) => s.updatePipeline);
  const focusedPipelineId = useUiStore((s) => s.focusedPipelineId);
  const focusedPipeline = pipelines.find((p) => p.id === focusedPipelineId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useNuphy({
    name: "varsPanel",
    enabled: true,
    keys: (key) => {
      const m = (keyName: keyof typeof keyboardShortcuts.varsPanel) =>
        keyboardShortcuts.varsPanel[keyName].key;

      if (key === m("Escape")) {
        onSwitchBack();
        return true;
      }
      return false;
    },
  });

  useEffect(() => {
    const x = textareaRef.current;
    if (x) {
      x.focus();
      x.setSelectionRange(x.value.length, x.value.length);
    }
  }, []);

  const [textareaValue, setTextareaValue] = useState(
    focusedPipeline?.vars.raw ||
      extractVariableNames(focusedPipeline?.commands || [])
        .map((varName) => `- ${varName}: `)
        .join("\n") ||
      ""
  );

  const debouncedTextareaValue = useDebounce(textareaValue, 100);

  useEffect(() => {
    if (focusedPipeline) {
      const parsedVars = parseVarsFromBulletList(debouncedTextareaValue);
      updatePipeline({
        ...focusedPipeline,
        vars: { raw: debouncedTextareaValue, parsed: parsedVars },
      });
    }
    // Ignore focusedPipeline deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTextareaValue, updatePipeline]);

  const handleFill = () => {
    if (!focusedPipeline) return;

    const existingVarNames =
      focusedPipeline.vars.parsed.map((v) => v.name) || [];
    const allVarNames = extractVariableNames(focusedPipeline.commands);

    const newVars = allVarNames
      .filter((varName) => !existingVarNames.includes(varName))
      .map((varName) => `- ${varName}: todo`);

    if (newVars.length > 0) {
      setTextareaValue(
        textareaValue + (textareaValue ? "\n" : "") + newVars.join("\n")
      );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Variables</h2>
        <Button onClick={handleFill} variant="outline" size="sm">
          Fill
        </Button>
      </div>
      <Textarea
        ref={textareaRef}
        value={textareaValue}
        onChange={(e) => setTextareaValue(e.target.value)}
        placeholder="- varName: value"
        className="min-h-[200px] font-mono text-sm"
      />
    </div>
  );
};
