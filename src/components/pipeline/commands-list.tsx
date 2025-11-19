import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  usePipelinesStore,
  type Command,
  type Variable,
} from "@/domain/stores/pipelines-store";
import { useUiStore } from "@/domain/stores/ui-store";
import { useNuphy } from "@/lib/nuphy/use-nuphy";
import { cn } from "@/lib/random/utils";
import {
  createFilledVariablesMapping,
  splitByVariables,
} from "@/lib/template-vars";
import type { FancyWindow } from "@/lib/window";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { isNil } from "lodash";
import { GripVertical } from "lucide-react";
import type { FC } from "react";
import { useMemo, useState } from "react";

const CommandText: FC<{
  command: string;
  filledVariables: Map<string, Variable>;
}> = ({ command, filledVariables }) => {
  return splitByVariables(command).map((chunk, index) => {
    if (chunk.isVariable) {
      const variable = filledVariables.get(chunk.text);
      const isFilled = !isNil(variable);
      return (
        <Tooltip key={index} delayDuration={0}>
          <TooltipTrigger asChild>
            <span
              key={index}
              className={isFilled ? "text-variable-set" : "text-variable-unset"}
            >
              {`{${chunk.text}}`}
            </span>
          </TooltipTrigger>
          <TooltipContent className={cn(!isFilled && "hidden")}>
            <p>{variable?.value}</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    return (
      <span key={index} className="whitespace-pre">
        {chunk.text}
      </span>
    );
  });
};

const NotFilledVarsIndicator: FC<{
  command: string;
  filledVariables: Map<string, Variable>;
}> = ({ command, filledVariables }) => {
  const split = splitByVariables(command);
  const unfilledVars = split
    .filter((it) => it.isVariable && !filledVariables.has(it.text))
    .map((it) => it.text);

  if (unfilledVars.length === 0) return null;
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <div className="text-variable-unset h-full w-4">!</div>
      </TooltipTrigger>
      <TooltipContent>
        <div>
          <p className="font-semibold">Unfilled variables:</p>
          <ul className="list-inside list-disc">
            {unfilledVars.map((varName, index) => (
              <li key={index}>{varName}</li>
            ))}
          </ul>
        </div>
      </TooltipContent>
    </Tooltip>
  );
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
    () => createFilledVariablesMapping(focusedPipeline?.vars?.parsed),
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

  useNuphy({
    name: "commandItem",
    enabled: !isHidden,
    keys: (key, evt) => {
      if (!isEditing && key === "s") {
        evt.preventDefault();
        enterSubstituteMode();
        return true;
      }

      if (!isEditing) return false;

      if (key === "Escape") {
        exitSubstituteMode();
        return true;
      }

      if (key === "Enter") {
        saveEdit();
        return true;
      }

      return false;
    },
  });

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
                    <p className="text-muted-foreground w-fit text-sm empty:hidden">
                      {command.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        {...provided.dragHandleProps}
                        className="text-drag-handle hover:text-drag-handle-hover cursor-grab active:cursor-grabbing"
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
                            "flex flex-1 justify-start gap-0 overflow-hidden border-2 font-mono",
                            window?.inBounds(index) &&
                              "border-variable-unset dark:border-variable-unset",
                            copied.has(index) &&
                              "border-variable-set dark:border-variable-set"
                          )}
                        >
                          <CommandText
                            command={command.value}
                            filledVariables={filledVariables}
                          />
                        </Button>
                      )}
                      <NotFilledVarsIndicator
                        command={command.value}
                        filledVariables={filledVariables}
                      />
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
