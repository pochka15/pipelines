import { usePipelinesStore } from "@/domain/stores/pipelines-store";
import { useUiStore } from "@/domain/stores/ui-store";
import { cn } from "@/lib/random/utils";
import { isEmpty } from "lodash";
import { GripVertical, X } from "lucide-react";
import type { FC } from "react";
import { useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Button } from "./ui/button";

export const PipelinesSidebar: FC<{ className?: string }> = ({ className }) => {
  const pipelines = usePipelinesStore((s) => s.pipelines);
  const removePipeline = usePipelinesStore((s) => s.removePipeline);
  const reorderPipelines = usePipelinesStore((s) => s.reorderPipelines);
  const focusedPipelineId = useUiStore((s) => s.focusedPipelineId);
  const setFocusedPipeline = useUiStore((s) => s.setFocusedPipeline);
  const setCommandsWindow = useUiStore((s) => s.setCommandsWindow);
  const [reordering, setReordering] = useState(false);

  const handleClick = (id: string) => {
    setFocusedPipeline(id);
    setCommandsWindow({ cursor: 0, size: 1 });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderPipelines(result.source.index, result.destination.index);
  };

  return (
    <div className={cn("group space-y-2", className)}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="pipelines">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {pipelines.map((pipeline, index) => (
                <Draggable
                  key={pipeline.id}
                  draggableId={pipeline.id}
                  index={index}
                  isDragDisabled={!reordering}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="group flex items-center gap-2"
                    >
                      {reordering ? (
                        <div
                          {...provided.dragHandleProps}
                          className="text-muted-foreground hover:text-foreground cursor-grab rounded-md p-2 transition-colors active:cursor-grabbing"
                        >
                          <GripVertical size={16} />
                        </div>
                      ) : (
                        <button
                          onClick={() => removePipeline(pipeline.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 invisible rounded-md p-2 transition-colors group-hover:visible"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleClick(pipeline.id)}
                        className={cn(
                          "flex-1 rounded-md px-3 py-2 text-left text-sm transition-colors",
                          pipeline.id === focusedPipelineId
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {pipeline.title}
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {pipelines.length > 1 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setReordering(!reordering)}
          className={cn(
            "invisible w-full group-hover:visible",
            "transition-colors"
          )}
        >
          {reordering ? "Done" : "Reorder"}
        </Button>
      )}

      {isEmpty(pipelines) && <p>No pipelines so far</p>}
    </div>
  );
};
