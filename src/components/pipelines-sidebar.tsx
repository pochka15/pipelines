import { usePipelinesStore } from "@/domain/stores/pipelines-store";
import { useUiStore } from "@/domain/stores/ui-store";
import { cn } from "@/lib/utils";
import { isEmpty } from "lodash";
import { X } from "lucide-react";

export const PipelinesSidebar = () => {
  const pipelines = usePipelinesStore((s) => s.pipelines);
  const removePipeline = usePipelinesStore((s) => s.removePipeline);
  const focusedPipelineId = useUiStore((s) => s.focusedPipelineId);
  const setFocusedPipeline = useUiStore((s) => s.setFocusedPipeline);
  const setCommandsWindow = useUiStore((s) => s.setCommandsWindow);

  const handleClick = (id: string) => {
    setFocusedPipeline(id);
    setCommandsWindow({ cursor: 0, size: 1 });
  };

  return (
    <div className="space-y-2 group">
      {pipelines.map((pipeline) => (
        <div key={pipeline.id} className="flex items-center gap-2 group">
          <button
            onClick={() => removePipeline(pipeline.id)}
            className="p-2 invisible group-hover:visible text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
          <button
            onClick={() => handleClick(pipeline.id)}
            className={cn(
              "flex-1 text-left px-3 py-2 text-sm rounded-md transition-colors",
              pipeline.id === focusedPipelineId
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {pipeline.title}
          </button>
        </div>
      ))}

      {isEmpty(pipelines) && <p>No pipelines so far</p>}
    </div>
  );
};
