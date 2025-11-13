import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  usePipelinesStore,
  type Command,
} from "@/domain/stores/pipelines-store";
import type { FancyWindow } from "@/lib/window";
import type { FC } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { useShortcuts } from "@/lib/hooks/use-shortcuts";
import { useMemo, useState } from "react";
import { useUiStore } from "@/domain/stores/ui-store";
import {
  createFilledVariablesSet,
  splitByVariables,
} from "@/lib/template-vars";

const trimCommand = (cmd: string) => {
  const maxSize = 60;
  return cmd.length > maxSize ? cmd.slice(0, maxSize - 1).trimEnd() + "…" : cmd;
};

const CommandText: FC<{ command: string; filledVariables: Set<string> }> = ({
  command,
  filledVariables,
}) => {
  return splitByVariables(trimCommand(command)).map((chunk, index) => {
    if (chunk.isVariable) {
      const isFilled = filledVariables.has(chunk.text);
      return (
        <span
          key={index}
          className={isFilled ? "text-green-500" : "text-pink-600"}
        >
          {`{${chunk.text}}`}
        </span>
      );
    }
    return (
      <span key={index} className="whitespace-pre">
        {chunk.text}
      </span>
    );
  });
};

export const CommandsList: FC<{
  commands: Command[];
  window: FancyWindow;
  copied: Set<number>;
  isEditing: boolean;
  isHidden: boolean;
  onButtonClick: (i: number, event: React.MouseEvent) => void;
  onStartEditing?: () => void;
  onCancelEditing?: () => void;
  onReorder?: (result: DropResult) => void;
  onFinishEditing?: (index: number, value: string) => void;
}> = ({
  isEditing,
  isHidden,
  commands,
  window,
  copied,
  onButtonClick,
  onReorder,
  onStartEditing,
  onCancelEditing,
  onFinishEditing,
}) => {
  const [editValue, setEditValue] = useState("");

  const focusedPipelineId = useUiStore((s) => s.focusedPipelineId);
  const pipelines = usePipelinesStore((s) => s.pipelines);
  const focusedPipeline = pipelines.find((p) => p.id === focusedPipelineId);

  const filledVariables = useMemo(
    () => createFilledVariablesSet(focusedPipeline?.vars?.parsed),
    // we just want to keep track of the id change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedPipelineId]
  );

  const handleDragEnd = (result: DropResult) => {
    if (onReorder) {
      onReorder(result);
    }
  };

  const enterSubstituteMode = () => {
    if (onStartEditing && commands[window.cursor]) {
      setEditValue(commands[window.cursor].value);
      onStartEditing();
    }
  };

  const exitSubstituteMode = () => {
    if (onCancelEditing) {
      onCancelEditing();
      setEditValue("");
    }
  };

  const saveEdit = () => {
    if (onFinishEditing) {
      onFinishEditing(window.cursor, editValue);
    }
    exitSubstituteMode();
  };

  useShortcuts(
    {
      s: enterSubstituteMode,
    },
    { enabled: !isHidden && !isEditing }
  );

  useShortcuts(
    {
      escape: exitSubstituteMode,
      "cmd+j": exitSubstituteMode,
      enter: saveEdit,
    },
    { enabled: isEditing }
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="commands">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cn("flex flex-col gap-2", isHidden && "hidden")}
          >
            {commands.map((command, index) => (
              <Draggable
                key={index}
                draggableId={`command-${index}`}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    key={index}
                    className="flex flex-col gap-1"
                  >
                    <p className="text-sm text-muted-foreground empty:hidden w-fit">
                      {command.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        {...provided.dragHandleProps}
                        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical size={16} />
                      </div>
                      {isEditing && index === window.cursor ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 font-mono"
                          autoFocus
                        />
                      ) : (
                        <Button
                          variant="outline"
                          onClick={(event) => onButtonClick(index, event)}
                          className={cn(
                            "border-2 justify-start flex-1 gap-0 font-mono",
                            window?.inBounds(index) && "border-pink-600",
                            copied.has(index) && "border-green-500"
                          )}
                        >
                          <CommandText
                            command={command.value}
                            filledVariables={filledVariables}
                          />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
